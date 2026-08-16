#!/usr/bin/env python3
"""Fail if the checked-in taxonomy is not what its generator produces.

    python3 scripts/check_taxonomy_generated.py

`data/docs/misconception_taxonomy.json` carries

    "generated_by": "scripts/build_misconception_taxonomy.py",
    "authoritative": true,

and for three days in August 2026 that was false. Six slugs had been added
straight to the JSON and never backported into the generator's data tables, so
the generator emitted 475 slugs while the checked-in file carried 481. Four more
records had been edited the same way: three gained a GR.3.4 pre-assignment and
one had its definition narrowed.

Nothing noticed, because nothing compared the two. The file even recorded the
contradiction in its own fields -- `counts.total_slugs` said 475 beside a
`slugs` array of 481 -- and that went unread as well.

The cost of not noticing was not a stale document. Regenerating would have
DELETED those six slugs, orphaning 8 CAT-bank tags and 32 curriculum uses and
turning three of AR.1.3's pre-assigned slugs into `SLUGS OUTSIDE SET` failures
in check_topic.py. So the documented way to change the taxonomy was destructive,
while the undocumented way (hand-editing the output) was what people actually
did, and was what caused it. See issue #94.

Backporting fixed that instance. This check is the part that does not expire:
it fails the moment the emitted artefact and the checked-in one diverge again,
whichever side moved.

HOW IT WORKS. The generator writes to hardcoded relative paths, so this runs it
inside a temporary directory with data/items symlinked in, and compares the
output there against the checked-in files. It never writes to data/docs. That
matters: a checker that regenerated in place would "fix" the drift as a side
effect of looking for it, and always pass.

WHAT IT COMPARES. Both emitted artefacts, the JSON structurally and the markdown
byte-for-byte. The JSON is compared field by field rather than as bytes so the
failure names what moved -- a slug added, a slug removed, a record edited, a
counts field stale -- instead of pointing at a line number in a 20,000-line file.
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GENERATOR = "scripts/build_misconception_taxonomy.py"
ARTEFACTS = ("data/docs/misconception_taxonomy.json",
             "data/docs/misconception_taxonomy.md")


def regenerate(tmp: Path) -> tuple[bool, str]:
    """Run the generator in an isolated tree. Returns (ok, output)."""
    (tmp / "scripts").mkdir(parents=True, exist_ok=True)
    (tmp / "data" / "docs").mkdir(parents=True, exist_ok=True)
    for name in ("build_misconception_taxonomy.py", "tag_rules.py"):
        src = ROOT / "scripts" / name
        if src.exists():
            shutil.copy2(src, tmp / "scripts" / name)
    # Symlinked, not copied: data/items is large and is only read.
    os.symlink(ROOT / "data" / "items", tmp / "data" / "items")
    for d in ("curriculum",):
        if (ROOT / d).exists():
            os.symlink(ROOT / d, tmp / d)
    proc = subprocess.run(
        [sys.executable, GENERATOR],
        cwd=tmp, capture_output=True, text=True,
    )
    return proc.returncode == 0, (proc.stdout + proc.stderr)


def compare_json(checked_in: dict, emitted: dict) -> list[str]:
    problems = []
    ci = {s["slug"]: s for s in checked_in.get("slugs", [])}
    em = {s["slug"]: s for s in emitted.get("slugs", [])}

    only_checked_in = sorted(set(ci) - set(em))
    only_emitted = sorted(set(em) - set(ci))
    if only_checked_in:
        problems.append(
            f"{len(only_checked_in)} slug(s) in the checked-in file that the "
            f"generator does not emit. Regenerating would DELETE these: "
            + ", ".join(only_checked_in))
    if only_emitted:
        problems.append(
            f"{len(only_emitted)} slug(s) the generator emits that are not "
            f"checked in: " + ", ".join(only_emitted))

    edited = []
    for slug in sorted(set(ci) & set(em)):
        for field in sorted(set(ci[slug]) | set(em[slug])):
            a, b = ci[slug].get(field), em[slug].get(field)
            if a != b:
                edited.append(f"{slug}.{field}: checked-in={a!r} emitted={b!r}")
    if edited:
        problems.append(f"{len(edited)} slug field(s) differ:\n    "
                        + "\n    ".join(edited[:20])
                        + ("\n    ..." if len(edited) > 20 else ""))

    for key in sorted(set(checked_in) | set(emitted)):
        if key == "slugs":
            continue
        a, b = checked_in.get(key), emitted.get(key)
        if a != b:
            problems.append(f"section {key!r} differs:\n"
                            f"    checked-in: {json.dumps(a)[:300]}\n"
                            f"    emitted   : {json.dumps(b)[:300]}")

    # The self-contradiction that sat unread for three days.
    counts = checked_in.get("counts") or {}
    if "total_slugs" in counts and counts["total_slugs"] != len(ci):
        problems.append(
            f"checked-in file contradicts itself: counts.total_slugs="
            f"{counts['total_slugs']} but the slugs array holds {len(ci)}")
    return problems


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        ok, output = regenerate(tmp)
        if not ok:
            print("FAIL - the generator did not run cleanly:\n" + output,
                  file=sys.stderr)
            return 2

        problems = []
        for rel in ARTEFACTS:
            emitted_path = tmp / rel
            checked_path = ROOT / rel
            if not emitted_path.exists():
                problems.append(f"{rel}: the generator emitted no such file")
                continue
            if not checked_path.exists():
                problems.append(f"{rel}: not checked in")
                continue
            if rel.endswith(".json"):
                problems += compare_json(
                    json.loads(checked_path.read_text()),
                    json.loads(emitted_path.read_text()))
            else:
                if checked_path.read_text() != emitted_path.read_text():
                    problems.append(
                        f"{rel}: checked-in copy differs from the emitted one")

    if problems:
        print(f"FAIL - the checked-in taxonomy is not what "
              f"{GENERATOR} produces.\n")
        for p in problems:
            print(f"  {p}")
        print(f"\nRegenerate with: python3 {GENERATOR}")
        print("If the checked-in file holds an edit worth keeping, backport it "
              "into the generator's data tables first. Editing the JSON alone "
              "is what issue #94 was.")
        return 1

    n = len(json.loads((ROOT / ARTEFACTS[0]).read_text())["slugs"])
    print(f"PASS - {GENERATOR} reproduces both checked-in artefacts "
          f"exactly ({n} slugs).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
