#!/usr/bin/env python3
"""Upload verified curriculum item templates and their rolled instances to Supabase.

Writes two tables:

  curriculum_item_templates   one row per templated item, keyed on
                              (course_id, topic_id, section, item_number)
  curriculum_item_instances   one row per parameter set of every template,
                              carrying the *rendered* stem and four choices

Nothing uploads unless scripts/verify_templates.py passes first, on the same
source, in the same run -- see gate() for why that is a subprocess and not a
flag. The verification columns record that run, so a row in the table always
carries evidence of a check that actually happened rather than one somebody
remembers running.

The instances are rendered by calling the harness's own `render_instance`, which
is the same `ev`/`house_latex`/`render` path the verification pass takes. There
is no second renderer, in this file or in the TypeScript runtime: at runtime a
roll is a SELECT, so the strings a student reads are literally the strings the
harness checked. See the header of sql/curriculum_item_instances.sql.

Usage:
  python3 curriculum/migrations/upload_templates.py --course tsia2-math --dry-run
  python3 curriculum/migrations/upload_templates.py --course tsia2-math
"""

from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import subprocess
import sys
from datetime import datetime, timezone

REPO = pathlib.Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO / "scripts"))
sys.path.insert(0, str(REPO / "curriculum" / "migrations"))

import verify_templates as vt  # noqa: E402

TEMPLATE_TABLE = "curriculum_item_templates"
INSTANCE_TABLE = "curriculum_item_instances"

# The conflict target names the unique constraint's columns, not the primary
# key. Same reasoning as upload_curriculum.py's: without it PostgREST resolves
# against the id alone, so a re-run becomes a plain insert and every template
# already in the table fails on curriculum_item_templates_item_key instead of
# updating.
TEMPLATE_ON_CONFLICT = "course_id,topic_id,section,item_number"

# Same reasoning, and load-bearing for a different reason: curriculum_attempts
# references an instance id, so a re-upload must land on the existing row rather
# than minting a new one. Upserting on the parameter set is what keeps those ids
# stable across runs -- see retired_at in sql/curriculum_item_instances.sql.
INSTANCE_ON_CONFLICT = "template_id,param_hash"

# PostgREST caps a response at 1000 rows by default and a request body has a size
# limit of its own, so both directions are paginated. 26,186 instances is not a
# number either end handles in one go.
PAGE = 1000


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
    """One record per templated item, and the items deliberately held static.

    Returns both because a partial pool is now legal and the operator has to be
    able to see it. `held_static` is not something this script writes -- those
    items keep their authored numbers in curriculum_topics, put there by
    upload_curriculum.py -- but "11 of 14 templated" and "14 of 14 templated"
    are different uploads, and only one of them should look like a whole pool.
    """
    pairs, pending, held_static = vt.load_curriculum(topic, unit)

    # gate() has already failed on this, since a gradeable item with no template
    # is a harness failure and not a note. Repeated because build_records is the
    # thing that decides what gets written, and "the caller checked" is how a
    # partial pool gets uploaded as if it were whole.
    if pending:
        raise SystemExit(f"{len(pending)} gradeable item(s) have no template: "
                         f"{', '.join(pending)}")

    stamp = datetime.now(timezone.utc).isoformat()
    records = []

    for tpl, src in pairs:
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

            # Phase 4b. Omitted by 4a on purpose, because the column was nullable
            # until 4b defined the hash and an explicit null would have wiped
            # whatever 4b wrote on the next run of this script. 4b defines it, so
            # it is a normal key now: vt.source_fingerprint over the anchor
            # fields of the parsed source item -- stem, all four choices,
            # correct_answer and the whole misconception_tag map.
            #
            # Computed from `src`, not from the template. The point of the column
            # is to detect the *source item* being reworded out from under a
            # verified template, so hashing anything the template itself carries
            # would be hashing the wrong side of the comparison.
            "source_fingerprint": vt.source_fingerprint(src),

            # created_at keeps its default on insert and is left alone on
            # update. updated_at is set explicitly because this schema has no
            # triggers -- a default alone would leave it frozen at insert time.
            "updated_at": stamp,
        }

        records.append(record)

    return records, held_static


def param_hash(vals):
    """sha256 over the canonical sorted-key JSON of one parameter set.

    The instance upsert's conflict target, paired with template_id. Sorted keys
    so a dict built in a different order hashes the same, which is what makes a
    re-run land on the existing row instead of minting a second rendering of the
    same parameter set -- and curriculum_attempts references those ids.
    """
    canonical = json.dumps(vals, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def build_instances(topic, unit, samples, seed):
    """Every parameter set of every template, rendered. Keyed by (section, item_number).

    The rendering is `vt.render_instance` and nothing else -- see this file's
    header. What this function adds is the checks that belong to *materialising*
    rather than to verifying, i.e. the ones that are about the rows being written
    rather than about the mathematics behind them.

    One check I said I would write here and did not, because it is vacuous:
    "every instance's correct letter equals the template's correct_answer". It
    cannot fail. `correct_answer` is a single scalar on the template and
    render_instance copies it onto every instance, so the correct letter is
    structurally incapable of moving across rolls -- which is the invariant the
    grading path needed, but it is a property of the schema, not something a loop
    can confirm. Asserting it would only look like coverage.

    What is checked instead is the pair of things that can actually go wrong in a
    precompute pass:

    - The four rendered strings are pairwise distinct. verify() already proves the
      four *expressions* differ via same(), but that is a statement about
      mathematics; this is a statement about `house_latex`, and a printer that
      collapsed two different expressions to one string would put two identical
      options in front of a student while every mathematical check still passed.
    - The canonical instance reproduces the source item byte for byte. That is the
      anchor, re-asserted on the exact row that will serve first exposure rather
      than on a value computed during verification and thrown away.
    """
    # held-static items are build_records' business, not this function's: they
    # produce no instance rows by definition.
    pairs, pending, _held_static = vt.load_curriculum(topic, unit)
    if pending:
        raise SystemExit(f"{len(pending)} gradeable item(s) have no template: "
                         f"{', '.join(pending)}")

    out = {}
    for tpl, src in pairs:
        section, number = tpl["key"].rsplit(" ", 1)
        key = (section, int(number))
        names = [p["name"] for p in tpl["parameters"]]
        canonical_vals = tpl["canonical_parameters"]

        # Same call, same seed, so these are the parameter sets the harness just
        # checked -- not a fresh draw that happens to be the same size.
        sets, _mode = vt.sample_sets(tpl, samples, seed)

        rows, canonical_seen = [], 0
        for vals in sets:
            inst = vt.render_instance(tpl, vals)
            choices = inst["choices"]

            missing = [L for L in vt.LETTERS if not choices.get(L)]
            if missing:
                raise SystemExit(f"{tpl['key']} at {vals}: no rendered choice for {missing}")

            if len(set(choices.values())) != len(vt.LETTERS):
                dupes = sorted(v for v in choices.values()
                               if list(choices.values()).count(v) > 1)
                raise SystemExit(
                    f"{tpl['key']} at {vals}: two choices render identically "
                    f"({dupes[0]}) -- house_latex is losing information"
                )

            if inst["correct_answer"] not in choices:
                raise SystemExit(f"{tpl['key']}: correct_answer "
                                 f"{inst['correct_answer']!r} is not a rendered choice")

            # Compared on the declared parameter names only. sample_sets returns
            # values with derived_parameters already folded in, and a derived
            # value is not something canonical_parameters declares.
            is_canonical = all(vals[n] == canonical_vals[n] for n in names)
            if is_canonical:
                canonical_seen += 1
                if inst["stem"] != src["stem"]:
                    raise SystemExit(
                        f"{tpl['key']}: canonical instance does not reproduce the source stem\n"
                        f"  got  {inst['stem']}\n  want {src['stem']}"
                    )
                if choices != src["choices"]:
                    raise SystemExit(
                        f"{tpl['key']}: canonical instance does not reproduce the source "
                        f"choices\n  got  {choices}\n  want {src['choices']}"
                    )

            rows.append({
                "parameters": vals,
                "param_hash": param_hash(vals),
                "stem": inst["stem"],
                "choices": choices,
                "correct_answer": inst["correct_answer"],
                "is_canonical": is_canonical,
                # Explicitly cleared, not omitted. A parameter set that comes
                # back into range after a narrowing has to be rollable again, and
                # leaving the key out would preserve the retirement instead.
                "retired_at": None,
            })

        # Matches the partial unique index on (template_id) where is_canonical.
        # Failing here rather than on the insert makes the message say what is
        # actually wrong.
        if canonical_seen != 1:
            raise SystemExit(f"{tpl['key']}: expected exactly 1 canonical instance, "
                             f"found {canonical_seen}")

        out[key] = rows

    return out


def show(records, instances, held_static):
    print(f"\n{len(records)} template(s) to upload:\n")
    print(f"  {'item':<16} {'sets':>7} {'rows':>7}  {'mode':<11} {'fingerprint':<12} fields")
    mismatched = []
    for r in records:
        key = (r["section"], r["item_number"])
        rows = instances.get(key, [])
        fields = len(r["template"])
        # The two numbers come from the same sample_sets call with the same seed,
        # so a disagreement means the pool moved between build_records and
        # build_instances -- which is not a rounding difference, it is a source
        # edit landing mid-run.
        flag = "" if len(rows) == r["verified_param_sets"] else "  <-- MISMATCH"
        if flag:
            mismatched.append(key)
        print(f"  {r['section'] + ' ' + str(r['item_number']):<16} "
              f"{r['verified_param_sets']:>7} {len(rows):>7}  "
              f"{r['verification_mode']:<11} {r['source_fingerprint'][:10]:<12} {fields}{flag}")

    total_sets = sum(r["verified_param_sets"] for r in records)
    total_rows = sum(len(v) for v in instances.values())
    print(f"\n  {total_sets} parameter sets across the pool")
    print(f"  {total_rows} instance row(s) to upload into {INSTANCE_TABLE}")

    # A MIXED POOL, SAID OUT LOUD. These items are not being uploaded here and
    # are not missing either -- they keep their authored numbers in
    # curriculum_topics and are served beside the rolled instances of their
    # siblings. Printed because "11 templates" reads like a whole pool otherwise,
    # and the difference between a held-out item and a forgotten one is the
    # difference this whole rule turns on.
    if held_static:
        print(f"\n  {len(held_static)} item(s) held static by request, served "
              f"from curriculum_topics rather than rolled:")
        for key in held_static:
            print(f"    {key}")

    if mismatched:
        raise SystemExit(f"\n✗ instance count != verified_param_sets for {mismatched}")

    # One rendered roll per item, printed so the render is inspected before it
    # ships rather than after. Deliberately a non-canonical set: the canonical one
    # is asserted equal to the source item above, so printing it would only show
    # that the file it came from is still itself.
    print("\n  Sample rolled instance per item (canonical excluded):\n")
    for r in records:
        rows = instances[(r["section"], r["item_number"])]
        sample = next((row for row in rows if not row["is_canonical"]), rows[0])
        params = ", ".join(f"{k}={v}" for k, v in sorted(sample["parameters"].items()))
        print(f"    {r['section']} {r['item_number']}  ({params})")
        print(f"      stem   {sample['stem']}")
        for letter in vt.LETTERS:
            mark = " *" if letter == sample["correct_answer"] else "  "
            print(f"      {letter}{mark}    {sample['choices'][letter]}")
        print()


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

    records, held_static = build_records(
        args.course, args.topic, args.unit, args.samples, args.seed)
    instances = build_instances(args.topic, args.unit, args.samples, args.seed)
    show(records, instances, held_static)

    if args.dry_run:
        total_rows = sum(len(v) for v in instances.values())
        print(f"[DRY RUN] would upsert {len(records)} row(s) into {TEMPLATE_TABLE} "
              f"on ({TEMPLATE_ON_CONFLICT})")
        print(f"[DRY RUN] would upsert {total_rows} row(s) into {INSTANCE_TABLE} "
              f"on ({INSTANCE_ON_CONFLICT}), then retire any parameter set no "
              f"longer in range")
        return 0

    import upload_curriculum as uc

    supabase = uc.connect()

    # Pass 1: templates. Instances carry a foreign key to these rows, so the ids
    # have to exist before pass 2 can name them.
    supabase.table(TEMPLATE_TABLE).upsert(
        records, on_conflict=TEMPLATE_ON_CONFLICT
    ).execute()
    print(f"\n✓ Uploaded {len(records)} template(s) to {TEMPLATE_TABLE}")

    # Read the ids back rather than trusting the upsert's returned representation.
    # An upsert that updated an existing row returns that row's id, and this is
    # the query the reconcile below has to agree with anyway.
    resolved = (
        supabase.table(TEMPLATE_TABLE)
        .select("id, section, item_number")
        .eq("course_id", args.course)
        .eq("topic_id", args.topic)
        .execute()
    )
    ids = {(r["section"], r["item_number"]): r["id"] for r in resolved.data}

    missing = [k for k in instances if k not in ids]
    if missing:
        raise SystemExit(f"no template row came back for {missing} -- not uploading instances")

    # Pass 2: instances, in pages. One request per PAGE rows rather than one
    # request for 26,186.
    rows = [dict(row, template_id=ids[key]) for key, batch in instances.items() for row in batch]
    for start in range(0, len(rows), PAGE):
        page = rows[start:start + PAGE]
        supabase.table(INSTANCE_TABLE).upsert(
            page, on_conflict=INSTANCE_ON_CONFLICT
        ).execute()
        print(f"  {min(start + PAGE, len(rows))}/{len(rows)} instance rows", flush=True)
    print(f"✓ Uploaded {len(rows)} instance(s) to {INSTANCE_TABLE}")

    # Reconcile: retire what this run did not write.
    #
    # A narrowed range or a new exclusion leaves instances in the table that the
    # template no longer covers, and those stay rollable until something says
    # otherwise. Retired rather than deleted -- curriculum_attempts points at
    # these ids and an answered attempt has to stay reconstructible, which is
    # what makes "three wrong answers on three different rolls" legible later.
    #
    # Paginated because PostgREST caps a select at 1000 rows and one template can
    # hold 5,007.
    retired = 0
    for key, batch in instances.items():
        template_id = ids[key]
        live = {row["param_hash"] for row in batch}
        stale, start = [], 0
        while True:
            page = (
                supabase.table(INSTANCE_TABLE)
                .select("id, param_hash")
                .eq("template_id", template_id)
                .is_("retired_at", "null")
                .range(start, start + PAGE - 1)
                .execute()
            )
            stale += [r["id"] for r in page.data if r["param_hash"] not in live]
            if len(page.data) < PAGE:
                break
            start += PAGE

        for chunk_start in range(0, len(stale), PAGE):
            chunk = stale[chunk_start:chunk_start + PAGE]
            supabase.table(INSTANCE_TABLE).update(
                {"retired_at": datetime.now(timezone.utc).isoformat()}
            ).in_("id", chunk).execute()
        retired += len(stale)

    if retired:
        print(f"✓ Retired {retired} instance(s) no longer covered by a template range")
    else:
        print("✓ Nothing to retire -- every stored instance is still in range")
    return 0


if __name__ == "__main__":
    sys.exit(main())
