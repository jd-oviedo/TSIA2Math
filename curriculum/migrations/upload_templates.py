#!/usr/bin/env python3
"""Upload verified curriculum item templates to Supabase.

Writes one row per templated item into `curriculum_item_templates`
(sql/curriculum_item_templates.sql), keyed on
(course_id, topic_id, section, item_number).

Nothing uploads unless scripts/verify_templates.py passes first, on the same
source, in the same run -- see gate() for why that is a subprocess and not a
flag. The verification columns record that run, so a row in the table always
carries evidence of a check that actually happened rather than one somebody
remembers running.

Usage:
  python3 curriculum/migrations/upload_templates.py --course tsia2-math --dry-run
  python3 curriculum/migrations/upload_templates.py --course tsia2-math
"""

from __future__ import annotations

import argparse
import pathlib
import subprocess
import sys
from datetime import datetime, timezone

REPO = pathlib.Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO / "scripts"))
sys.path.insert(0, str(REPO / "curriculum" / "migrations"))

import verify_templates as vt  # noqa: E402

TABLE = "curriculum_item_templates"

# The conflict target names the unique constraint's columns, not the primary
# key. Same reasoning as upload_curriculum.py's: without it PostgREST resolves
# against the id alone, so a re-run becomes a plain insert and every template
# already in the table fails on curriculum_item_templates_item_key instead of
# updating.
ON_CONFLICT = "course_id,topic_id,section,item_number"


def gate(topic, unit, samples, seed):
    """Run the harness and return its exit code. Non-zero means do not upload.

    A subprocess, deliberately, rather than the per-template checks reassembled
    in this file. The pool-level rules -- every gradeable item templated,
    mandatory sign-error coverage, and the cross-pool rule that no roll may
    render a stem a student can meet in the diagnostic -- live in
    verify_templates.main() and are what CI runs. A second copy of that gate
    here would be a second thing to keep in step, and the failure mode when it
    drifts is the worst one available: an upload that stamps verified_at onto
    rows checked against a rule the harness no longer holds them to.

    So the harness decides pass or fail and this file only decides whether to
    write. The metadata below is read separately, and cannot disagree, because
    it comes from the same functions with the same seed.
    """
    cmd = [
        sys.executable, str(REPO / "scripts" / "verify_templates.py"),
        "--source", "curriculum",
        "--topic", topic,
        "--unit", unit,
        "--samples", str(samples),
        "--seed", str(seed),
    ]
    # flush before handing the terminal over: the subprocess writes straight to
    # the fd, so without this the harness output lands above the command that
    # produced it and the log reads as though nothing was run.
    print("$ " + " ".join(cmd) + "\n", flush=True)
    return subprocess.run(cmd, cwd=REPO).returncode


def build_records(course_id, topic, unit, samples, seed):
    """One record per templated item, plus the pool's parameter-set stats."""
    pairs, pending = vt.load_curriculum(topic, unit)

    # gate() has already failed on this, since a gradeable item with no template
    # is a harness failure and not a note. Repeated because build_records is the
    # thing that decides what gets written, and "the caller checked" is how a
    # partial pool gets uploaded as if it were whole.
    if pending:
        raise SystemExit(f"{len(pending)} gradeable item(s) have no template: "
                         f"{', '.join(pending)}")

    stamp = datetime.now(timezone.utc).isoformat()
    records = []

    for tpl, _src in pairs:
        section, number = tpl["key"].rsplit(" ", 1)

        # Same call, same seed, and therefore the same parameter sets the
        # harness just checked -- sample_sets is where both the count and the
        # mode string come from. Cheap on this pool: it is integer arithmetic
        # over the grid, with no SymPy in the loop, because curriculum templates
        # declare no derived_parameters.
        sets, mode = vt.sample_sets(tpl, samples, seed)
        if not sets:
            raise SystemExit(f"{tpl['key']}: no parameter set satisfies the constraints")

        # 'exhaustive' is a materially stronger claim than the same count
        # sampled from a larger range, and the column exists to keep the two
        # distinguishable. The harness writes the detail into a prose string
        # ("exhaustive (14554 grid points)"); this reduces it to the two values
        # the check constraint allows and keeps the count beside it.
        record = {
            "course_id": course_id,
            "topic_id": topic,
            "section": section,
            "item_number": int(number),

            # The authored block minus the "key" that load_curriculum adds for
            # reporting. load_curriculum also fills empty defaults for
            # variables, constraints, choice_formulas and choice_derivations
            # when a block omits them; all 14 items in this pool author all
            # four, so nothing here is synthesised. --dry-run prints the field
            # list per item so that stays checkable rather than assumed.
            "template": {k: v for k, v in tpl.items() if k != "key"},

            "verified_at": stamp,
            "verified_param_sets": len(sets),
            "verification_mode": "exhaustive" if mode.startswith("exhaustive") else "sampled",

            # created_at keeps its default on insert and is left alone on
            # update. updated_at is set explicitly because this schema has no
            # triggers -- a default alone would leave it frozen at insert time.
            "updated_at": stamp,
        }

        # source_fingerprint is deliberately absent from the record, not set to
        # None. It is nullable until Phase 4b defines it, and PostgREST builds
        # the ON CONFLICT DO UPDATE SET list from the keys supplied -- so an
        # omitted column is preserved on a re-run, while an explicit null would
        # wipe every fingerprint 4b had written the next time this script runs.
        records.append(record)

    return records


def show(records):
    print(f"\n{len(records)} template(s) to upload:\n")
    print(f"  {'item':<16} {'sets':>7}  {'mode':<11} template fields")
    for r in records:
        fields = len(r["template"])
        print(f"  {r['section'] + ' ' + str(r['item_number']):<16} "
              f"{r['verified_param_sets']:>7}  {r['verification_mode']:<11} {fields}")
    total = sum(r["verified_param_sets"] for r in records)
    print(f"\n  {total} parameter sets across the pool")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--course", required=True, help="course id, e.g. tsia2-math")
    ap.add_argument("--topic", default="QR.3.5")
    ap.add_argument("--unit", default="unit-1", help="curriculum source unit directory")
    # Defaults match verify_templates.py. They are passed through rather than
    # left implicit so the harness run and the recorded metadata cannot be
    # describing different parameter sets.
    ap.add_argument("--samples", type=int, default=200)
    ap.add_argument("--seed", type=int, default=20260729)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    code = gate(args.topic, args.unit, args.samples, args.seed)
    if code != 0:
        print(f"\n✗ verify_templates.py exited {code} -- nothing uploaded")
        return 1

    records = build_records(args.course, args.topic, args.unit, args.samples, args.seed)
    show(records)

    if args.dry_run:
        print(f"\n[DRY RUN] would upsert {len(records)} row(s) into {TABLE} "
              f"on ({ON_CONFLICT})")
        return 0

    import upload_curriculum as uc

    supabase = uc.connect()
    supabase.table(TABLE).upsert(records, on_conflict=ON_CONFLICT).execute()
    print(f"\n✓ Uploaded {len(records)} template(s) to {TABLE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
