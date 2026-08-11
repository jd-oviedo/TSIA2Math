#!/usr/bin/env python3
"""
restore_bank_text.py — restore the bank's LaTeX-wrapped text to the prod
`questions` table, writing ONLY the content fields and never the live counters.

Why not scripts/seed_questions.mjs:

  The seeder does `upsert(items, {onConflict: 'item_id'})` with whole item
  objects. Those objects carry times_administered / times_correct as they sat in
  the bank -- zeros -- so a seed overwrites the exposure counters that
  increment_item_exposure() has been accumulating in prod. That is unrecoverable
  live data. This script writes a narrow column set instead, and treats the
  counters as read-only.

What this does NOT do, by design:

  * It never INSERTs. Prod holds 8 rows with no counterpart in the bank
    (QR_A_006/008/009, QR_B_008/009, QR_P_006/008/009). They are left exactly as
    they are -- deciding their fate is a separate call, not a side effect of a
    text restore. The run reports them so they cannot be forgotten.
  * It never DELETEs anything, for the same reason.
  * It never writes a row whose content already matches.

Default mode is a dry run: it reads prod, prints the exact write set, and exits
without touching anything. A real write requires --execute.

Env: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BANK = Path("public/data/question_bank.json")
SNAPSHOT_DIR = Path(
    os.environ.get("RESTORE_SNAPSHOT_DIR", "/tmp/claude-1000/-workspaces-TSIA2Math/snapshots")
)

# The only columns this script is allowed to write.
WRITE_FIELDS = [
    "question_text",
    "answer_choices",
    "explanation",
    "distractor_logic",
    "strategy_hints",
]

# Live counters maintained by increment_item_exposure() on every session save.
# Never written; snapshotted so a post-run check can prove they did not move.
PROTECTED_FIELDS = ["times_administered", "times_correct"]

PROBE_ITEM = "AR_A_001"  # carries $x^{2}$; a visible canary for the notation


def env():
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        sys.exit("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")
    return url.rstrip("/"), key


def request(url, key, path, method="GET", body=None, extra_headers=None):
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    headers.update(extra_headers or {})
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"{url}/rest/v1/{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} on {method} {path}: {e.read().decode()[:400]}")


def fetch_prod(url, key):
    cols = ",".join(["item_id"] + WRITE_FIELDS + PROTECTED_FIELDS)
    rows, offset = [], 0
    while True:
        page = request(url, key, f"questions?select={cols}&order=item_id&offset={offset}&limit=500")
        rows += page
        offset += len(page)
        if len(page) < 500:
            break
    return {r["item_id"]: r for r in rows}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--execute", action="store_true",
                    help="actually write. Without this the script only reports.")
    args = ap.parse_args()

    url, key = env()
    bank = {it["item_id"]: it for it in json.loads(BANK.read_text(encoding="utf-8"))}
    prod = fetch_prod(url, key)

    print(f"bank items : {len(bank)}")
    print(f"prod rows  : {len(prod)}")

    orphans = sorted(set(prod) - set(bank))
    missing = sorted(set(bank) - set(prod))

    # Build the write set: only rows where a WRITE_FIELD actually differs.
    plan = {}
    for iid, item in bank.items():
        row = prod.get(iid)
        if row is None:
            continue
        patch = {f: item.get(f) for f in WRITE_FIELDS if row.get(f) != item.get(f)}
        if patch:
            plan[iid] = patch

    print(f"\nrows needing a text update : {len(plan)}")
    per_field = {f: sum(1 for p in plan.values() if f in p) for f in WRITE_FIELDS}
    for f, n in per_field.items():
        print(f"   {f:<18} {n:4d}")

    print(f"\nwrite set is exactly     : {WRITE_FIELDS}")
    print(f"never written (live data): {PROTECTED_FIELDS}")
    touched = sorted({f for p in plan.values() for f in p})
    leaked = [f for f in touched if f not in WRITE_FIELDS]
    print(f"fields appearing in the plan: {touched}")
    print(f"protected fields in the plan: {[f for f in touched if f in PROTECTED_FIELDS] or 'NONE — confirmed excluded'}")
    if leaked:
        sys.exit(f"ABORT — plan contains fields outside the write set: {leaked}")

    if orphans:
        print(f"\n{len(orphans)} prod row(s) with no bank counterpart — NOT written, NOT deleted:")
        print(f"   {orphans}")
        print("   These stay orphaned until decided separately (see content-fixes-needed.md).")
    if missing:
        print(f"\n{len(missing)} bank item(s) absent from prod — NOT inserted: {missing[:8]}")

    # Canary: show the notation change on a known item.
    if PROBE_ITEM in bank and PROBE_ITEM in prod:
        print(f"\n{PROBE_ITEM} question_text")
        print(f"   prod now : {prod[PROBE_ITEM]['question_text']!r}")
        print(f"   after run: {bank[PROBE_ITEM]['question_text']!r}")
        print(f"   in plan  : {'yes' if PROBE_ITEM in plan else 'no (already matches)'}")

    if not args.execute:
        print("\nDRY RUN — nothing was written. Re-run with --execute to apply.")
        return 0

    if not plan:
        print("\nNothing to write.")
        return 0

    # Rollback snapshot: current prod values for every row about to change,
    # including the protected counters so drift can be proven afterwards.
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    snap_path = SNAPSHOT_DIR / f"questions_before_{stamp}.json"
    snap_path.write_text(
        json.dumps([prod[i] for i in sorted(plan)], indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"\nsnapshot written: {snap_path} ({len(plan)} rows)")

    written = 0
    for iid in sorted(plan):
        request(url, key, f"questions?item_id=eq.{iid}", method="PATCH", body=plan[iid],
                extra_headers={"Prefer": "return=minimal"})
        written += 1
        if written % 100 == 0:
            print(f"   … {written}/{len(plan)}")
    print(f"wrote {written} row(s)")

    # Verify against a fresh read, not against what we believe we sent.
    after = fetch_prod(url, key)
    text_bad = [i for i in plan if any(after[i].get(f) != bank[i].get(f) for f in WRITE_FIELDS)]
    stat_bad = [i for i in plan if any(after[i].get(f) != prod[i].get(f) for f in PROTECTED_FIELDS)]
    print(f"\nverification")
    print(f"   rows still differing on text : {len(text_bad)}")
    print(f"   rows whose counters moved    : {len(stat_bad)}"
          f"{' (concurrent sessions — expected, not caused by this script)' if stat_bad else ''}")
    print(f"   prod row count               : {len(after)} (was {len(prod)})")
    if len(after) != len(prod):
        print("   !! row count changed — investigate before trusting this run")
    return 1 if text_bad else 0


if __name__ == "__main__":
    sys.exit(main())
