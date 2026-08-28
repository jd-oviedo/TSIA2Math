#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
audit_rationale_coverage.py -- READ-ONLY. Which worksheet-eligible items have no
stored rationale. Writes nothing, ever, and touches no network.

WHAT A "RATIONALE" IS, precisely, because two nearby fields are not it.

The Rationales page of a printed answer key renders
distractor_prose[section][item_number][correct_letter] -- the "Correct: ..."
entry in an item's distractor_logic block. That is the SAME field the Teacher
Notes card rendered as "Why B is right", and it is NOT the worked solution.
An item can have a full step-by-step solution and no rationale, which is
exactly the QR.1.1 case this audit was written to size.

WHY IT READS MARKDOWN RATHER THAN THE DATABASE.

curriculum/source/tsia2-math/**.md is the source of truth; Supabase holds what
upload_curriculum.py last derived from it. So the audit parses the markdown
through upload_curriculum's OWN functions -- build_practice_items,
extract_distractor_prose, extract_worked_solutions -- rather than reimplementing
the parse. A second parser here would be a second opinion about what an item is,
and the first time the two disagreed this file would be reporting on content
that does not exist.

--sql prints the equivalent read-only SELECT for checking prod after an upload.
This script never connects to anything.

    python3 scripts/audit_rationale_coverage.py
    python3 scripts/audit_rationale_coverage.py --topic QR.1.1
    python3 scripts/audit_rationale_coverage.py --items GR.2.1:practice:8,QR.1.1:practice:1
    python3 scripts/audit_rationale_coverage.py --sql
"""
import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "curriculum" / "migrations"))
import upload_curriculum as uc  # noqa: E402

SOURCE = ROOT / "curriculum" / "source" / "tsia2-math"

# The eligibility filter, ported from isPrintable() in app/lib/worksheet-select.ts.
#
# Format and a populated choice map, per item, never the array length. It is
# deliberately NOT the stricter isGradeable(): the worksheet builder counts and
# draws with isPrintable, so that is the population a teacher can actually put
# on a sheet, and auditing a different one would report on items no worksheet
# can contain.
def is_printable(item):
    return item.get("format") == "multiple_choice" and bool(item.get("choices"))


def walk():
    """Every printable item, with its rationale and worked solution."""
    for md in sorted(SOURCE.rglob("*.md")):
        parsed = uc.parse_markdown_curriculum(md)
        sections = uc.build_practice_items(
            parsed["practice_problems"], parsed["mini_quiz"], parsed["answer_key"],
            parsed["extra_practice"]
        )
        prose = uc.extract_distractor_prose(parsed["answer_key"])
        solutions = uc.extract_worked_solutions(parsed["answer_key"])

        # All three sections, and extra_practice is not optional here even
        # though it is optional in the source. A worksheet prints extra-practice
        # items and its answer key renders their worked solutions, so an
        # unrationalised item in Part 5 costs a teacher exactly what one in Part
        # 2 does. Auditing two of three sections would report full coverage over
        # a population that excludes the gap.
        for section in uc.SECTION_NAMES:
            if section not in sections:
                continue
            for item in sections[section]["items"]:
                if not is_printable(item):
                    continue
                num = str(item["item_number"])
                correct = item.get("correct_answer")
                options = prose.get(section, {}).get(num, {})
                yield {
                    "topic_id": md.stem,
                    "section": section,
                    "item_number": item["item_number"],
                    "correct": correct,
                    "rationale": (options.get(correct) or "").strip() if correct else "",
                    "solution": (solutions.get(section, {}).get(num) or "").strip(),
                }


SQL = """-- READ-ONLY. Worksheet-eligible items with no stored rationale.
-- The population mirrors isPrintable() in app/lib/worksheet-select.ts: an item
-- is eligible when its format is multiple_choice and its choices map is not
-- empty. Placeholder topics carry no items and are excluded at the row level.
select t.topic_id,
       s.section,
       (i.value ->> 'item_number')::int as item_number,
       i.value ->> 'correct_answer'     as correct_answer,
       (t.worked_solutions -> s.section ->> (i.value ->> 'item_number')) is not null
                                        as has_worked_solution
from curriculum_topics t
cross join lateral (values ('practice'), ('mini_quiz')) as s(section)
cross join lateral jsonb_array_elements(
       coalesce(t.practice_items -> s.section -> 'items', '[]'::jsonb)) as i(value)
where t.course_id = 'tsia2-math'
  and coalesce(t.is_placeholder, false) = false
  and i.value ->> 'format' = 'multiple_choice'
  and coalesce(jsonb_typeof(i.value -> 'choices'), 'null') = 'object'
  and i.value -> 'choices' <> '{}'::jsonb
  and coalesce(
        t.distractor_prose -> s.section -> (i.value ->> 'item_number')
                          ->> (i.value ->> 'correct_answer'), '') = ''
order by t.topic_id, s.section, item_number;"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--topic", help="limit to one topic id")
    ap.add_argument("--items", help="limit to TOPIC:SECTION:NUMBER, comma separated")
    ap.add_argument("--sql", action="store_true", help="print the prod-side SELECT and exit")
    # --source points the walk at a different tree, which is how the failing
    # state stays reproducible after it has been fixed: extract an older commit
    # of curriculum/source and run the same check against it.
    ap.add_argument("--source", help="read markdown from this directory instead")
    args = ap.parse_args()

    global SOURCE
    if args.source:
        SOURCE = Path(args.source)

    if args.sql:
        print(SQL)
        return 0

    scope = None
    if args.items:
        scope = set()
        for ref in args.items.split(","):
            topic, section, number = ref.strip().split(":")
            scope.add((topic, section, int(number)))

    rows = []
    for row in walk():
        if args.topic and row["topic_id"] != args.topic:
            continue
        if scope is not None and (row["topic_id"], row["section"], row["item_number"]) not in scope:
            continue
        rows.append(row)

    missing = [r for r in rows if not r["rationale"]]
    neither = [r for r in missing if not r["solution"]]

    print(f"eligible items:            {len(rows)}")
    print(f"with a rationale:          {len(rows) - len(missing)}")
    print(f"MISSING a rationale:       {len(missing)}")
    print(f"  of those, no solution:   {len(neither)}")

    if missing:
        print("\nmissing, by topic:")
        by_topic = {}
        for r in missing:
            by_topic.setdefault(r["topic_id"], []).append(r)
        for topic in sorted(by_topic):
            entries = by_topic[topic]
            print(f"  {topic}  ({len(entries)})")
            for r in entries:
                mark = "NO SOLUTION EITHER" if not r["solution"] else "has a worked solution"
                print(f"      {r['section']} #{r['item_number']}  answer {r['correct']}  ({mark})")

    if scope is not None:
        print(f"\nscoped run: {len(scope)} item(s) requested, {len(rows)} matched")

    # Exit non-zero when anything is missing, so this can gate a pipeline.
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
