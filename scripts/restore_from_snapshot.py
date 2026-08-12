#!/usr/bin/env python3
"""
restore_from_snapshot.py — roll prod's `questions` text back to a snapshot taken
by restore_bank_text.py.

This is the undo button for a text restore. The project has no PITR and no
scheduled backups, so this script plus its snapshot file is the entire rollback
path -- it is written before the forward write runs, not after something breaks.

    # see what would be rolled back, touching nothing
    python3 scripts/restore_from_snapshot.py scratchpad/questions_before_<stamp>.json

    # actually roll back
    python3 scripts/restore_from_snapshot.py scratchpad/questions_before_<stamp>.json --execute

It rewrites ONLY the five content fields. times_administered / times_correct are
present in the snapshot for comparison but are never written back: sessions keep
running during and after an incident, so restoring counters to their old values
would destroy real activity. The run reports how far they have moved instead.

Never INSERTs and never DELETEs -- it can only put text back on rows that exist.

Env: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY.
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from restore_bank_text import (  # noqa: E402  (same env/HTTP contract by design)
    PROTECTED_FIELDS,
    WRITE_FIELDS,
    env,
    fetch_prod,
    request,
)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("snapshot", type=Path, help="snapshot JSON written by restore_bank_text.py")
    ap.add_argument("--execute", action="store_true", help="actually write. Default reports only.")
    args = ap.parse_args()

    if not args.snapshot.exists():
        sys.exit(f"snapshot not found: {args.snapshot}")
    snap = {r["item_id"]: r for r in json.loads(args.snapshot.read_text(encoding="utf-8"))}
    print(f"snapshot : {args.snapshot} ({len(snap)} rows)")

    required = ["item_id"] + WRITE_FIELDS
    bad = [i for i, r in snap.items() if any(k not in r for k in required)]
    if bad:
        sys.exit(f"ABORT — snapshot rows missing required fields: {bad[:5]}")

    url, key = env()
    prod = fetch_prod(url, key)
    print(f"prod rows: {len(prod)}")

    missing = sorted(set(snap) - set(prod))
    if missing:
        print(f"\n{len(missing)} snapshot row(s) no longer in prod — skipped, never re-inserted:")
        print(f"   {missing[:8]}")

    plan = {}
    for iid, row in snap.items():
        live = prod.get(iid)
        if live is None:
            continue
        patch = {f: row.get(f) for f in WRITE_FIELDS if live.get(f) != row.get(f)}
        if patch:
            plan[iid] = patch

    print(f"\nrows differing from the snapshot : {len(plan)}")
    for f in WRITE_FIELDS:
        print(f"   {f:<18} {sum(1 for p in plan.values() if f in p):4d}")

    moved = [i for i in snap if i in prod
             and any(prod[i].get(f) != snap[i].get(f) for f in PROTECTED_FIELDS)]
    print(f"\ncounters moved since the snapshot: {len(moved)} row(s) "
          f"(expected — sessions keep running; never written back)")

    if not plan:
        print("\nProd already matches the snapshot on all five content fields. Nothing to do.")
        return 0

    if not args.execute:
        print("\nDRY RUN — nothing was written. Re-run with --execute to roll back.")
        return 0

    written = 0
    for iid in sorted(plan):
        request(url, key, f"questions?item_id=eq.{iid}", method="PATCH", body=plan[iid],
                extra_headers={"Prefer": "return=minimal"})
        written += 1
        if written % 100 == 0:
            print(f"   … {written}/{len(plan)}")
    print(f"rolled back {written} row(s)")

    after = fetch_prod(url, key)
    still = [i for i in plan if any(after[i].get(f) != snap[i].get(f) for f in WRITE_FIELDS)]
    print("\nverification")
    print(f"   rows still differing from snapshot : {len(still)}")
    print(f"   prod row count                     : {len(after)} (was {len(prod)})")
    return 1 if still else 0


if __name__ == "__main__":
    sys.exit(main())
