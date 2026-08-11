#!/usr/bin/env python3
"""
merge_misconception_tags.py — add misconception_tag to the served question bank
WITHOUT touching any other field.

Why this exists instead of a regenerate-from-source step:

  public/data/question_bank.json is NOT a faithful export of data/items/. It
  carries LaTeX-wrapping migrations ($x^{2}$, $\\frac{1}{2}$, $\\sqrt{120}$) that
  were applied to the bank directly and never back-ported to data/items/, which
  has held bare Unicode since its first commit. MathText.tsx only typesets
  content inside $...$ that contains real LaTeX syntax, so regenerating the bank
  from data/items/ silently downgrades typeset math to literal text.

  So the bank's text is authoritative for text, and data/items/ is authoritative
  for tags. This script merges exactly that one field and nothing else.

Reads:   public/data/question_bank.json  (text: authoritative)
         data/items/**/*.json            (misconception_tag: authoritative)
Writes:  public/data/question_bank.json  (ONLY if every check passes — fails safe)

The join is item_id. Because a tag maps option letters to slugs, a merge is only
sound if both sides agree on what the option letters mean, so that is verified
per item before anything is written, not assumed.
"""
import json
import sys
from pathlib import Path

BANK = Path("public/data/question_bank.json")
ITEMS_DIR = Path("data/items")
TAXONOMY = Path("data/docs/misconception_taxonomy.json")

FIELD = "misconception_tag"
# Keep the bank's key order stable: data/items/ places the tag directly after
# distractor_logic, and so does the bank's existing schema. Appending instead
# would work but would scatter the field's position across the file.
INSERT_AFTER = "distractor_logic"


def load_bank():
    return json.loads(BANK.read_text(encoding="utf-8"))


def load_source_items():
    """item_id -> item, across every file under data/items/."""
    out = {}
    for path in sorted(ITEMS_DIR.rglob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        items = data if isinstance(data, list) else data.get("items", [])
        for it in items:
            if isinstance(it, dict) and it.get("item_id"):
                out[it["item_id"]] = it
    return out


def load_slugs():
    if not TAXONOMY.exists():
        return None
    tax = json.loads(TAXONOMY.read_text(encoding="utf-8"))
    return {s["slug"] for s in tax.get("slugs", []) if isinstance(s, dict) and s.get("slug")}


def check(bank, src, slugs):
    """Return a list of blocking problems. Empty list means safe to merge."""
    problems = []

    bank_ids = {it["item_id"] for it in bank}
    missing = sorted(bank_ids - set(src))
    if missing:
        problems.append(
            f"{len(missing)} bank item(s) have no counterpart in data/items/, "
            f"so no tag can be sourced for them: {missing[:8]}"
        )

    for it in bank:
        iid = it["item_id"]
        s = src.get(iid)
        if s is None:
            continue

        # The tag is keyed by option letter, so the letters must mean the same
        # thing on both sides or the merge would mislabel distractors.
        bank_opts = set((it.get("answer_choices") or {}).keys())
        src_opts = set((s.get("answer_choices") or {}).keys())
        if bank_opts != src_opts:
            problems.append(
                f"{iid}: answer_choices letters differ "
                f"(bank={sorted(bank_opts)}, source={sorted(src_opts)})"
            )

        if it.get("correct_answer") != s.get("correct_answer"):
            problems.append(
                f"{iid}: correct_answer differs "
                f"(bank={it.get('correct_answer')!r}, source={s.get('correct_answer')!r})"
            )

        tag = s.get(FIELD)
        if tag is None:
            continue
        if not isinstance(tag, dict):
            problems.append(f"{iid}: {FIELD} is {type(tag).__name__}, expected an object")
            continue
        stray = sorted(set(tag) - bank_opts)
        if stray:
            problems.append(f"{iid}: {FIELD} names option(s) the bank does not have: {stray}")
        if slugs is not None:
            unknown = sorted(v for v in tag.values() if v not in slugs)
            if unknown:
                problems.append(f"{iid}: {FIELD} uses slug(s) absent from the taxonomy: {unknown}")

    return problems


def merge_one(item, tag):
    """Rebuild the item with the tag inserted, preserving key order exactly."""
    out = {}
    for k, v in item.items():
        if k == FIELD:
            continue  # rebuilt below, never carried over stale
        out[k] = v
        if k == INSERT_AFTER:
            out[FIELD] = tag
    if FIELD not in out:  # item has no distractor_logic; append rather than drop
        out[FIELD] = tag
    return out


def verify_only_tag_changed(before, after):
    """Hard guarantee: nothing but misconception_tag differs. Returns problems."""
    problems = []
    b = {it["item_id"]: it for it in before}
    a = {it["item_id"]: it for it in after}
    if set(b) != set(a):
        problems.append("item_id set changed during merge")
        return problems
    for iid in b:
        ob, oa = b[iid], a[iid]
        for k in set(ob) | set(oa):
            if k == FIELD:
                continue
            if ob.get(k) != oa.get(k):
                problems.append(f"{iid}: field {k!r} changed — merge is not tag-only")
    return problems


def main():
    bank = load_bank()
    src = load_source_items()
    slugs = load_slugs()

    print(f"bank items      : {len(bank)}")
    print(f"data/items items: {len(src)}")
    print(f"taxonomy slugs  : {len(slugs) if slugs is not None else 'not found (slug check skipped)'}")

    problems = check(bank, src, slugs)
    if problems:
        print(f"\nABORT — {len(problems)} blocking problem(s), nothing written:\n")
        for p in problems[:40]:
            print("  ×", p)
        if len(problems) > 40:
            print(f"  … and {len(problems) - 40} more")
        return 1
    print("\npre-merge checks: OK (ids, option letters, correct_answer, tag keys, slugs)")

    before = json.loads(json.dumps(bank))  # deep copy for the after-the-fact proof
    merged, added, unchanged = [], 0, 0
    for it in bank:
        tag = src[it["item_id"]].get(FIELD)
        if tag is None:
            merged.append(it)
            unchanged += 1
            continue
        if it.get(FIELD) == tag:
            merged.append(it)
            unchanged += 1
            continue
        merged.append(merge_one(it, tag))
        added += 1

    problems = verify_only_tag_changed(before, merged)
    if problems:
        print(f"\nABORT — post-merge verification failed, nothing written:\n")
        for p in problems[:20]:
            print("  ×", p)
        return 1

    print(f"post-merge verification: OK — only {FIELD} differs")
    print(f"\nitems given a tag : {added}")
    print(f"items untouched   : {unchanged}")

    # Match the file's existing formatting exactly so the diff shows only the
    # inserted field: 2-space indent, real UTF-8, no trailing newline.
    BANK.write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nwrote {BANK}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
