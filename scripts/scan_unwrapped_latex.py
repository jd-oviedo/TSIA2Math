#!/usr/bin/env python3
"""
scan_unwrapped_latex.py — find LaTeX command patterns that appear OUTSIDE a
$...$ math span, i.e. content that will render as literal text instead of
typeset math (Bug 1).

Scans question_text, all answer_choices values, and explanation across the
whole question bank. Reports every offending item_id + field + snippet.
Read-only; makes no changes.
"""
import json
import re
import sys
from pathlib import Path

SRC = Path("public/data/question_bank.json")

# LaTeX command / syntax patterns that only make sense inside math mode.
PATTERNS = [
    r"\\frac", r"\\sqrt", r"\\times", r"\\div", r"\\leq", r"\\geq",
    r"\\neq", r"\\approx", r"\\pi\b", r"\\Delta", r"\\infty", r"\\cdot",
    r"\^\{", r"_\{",
]
PATTERN_RE = re.compile("|".join(PATTERNS))
DOLLAR_SPAN = re.compile(r"\$[^$]*\$")

FIELDS = ["question_text", "explanation"]


def strip_math(s: str) -> str:
    """Remove every $...$ span so only the non-math remainder is left.

    Escaped currency dollars (\\$) are NOT math delimiters — MathText protects
    them before pairing (see MathText.tsx DOLLAR_SENTINEL) — so we neutralize
    them here too, otherwise currency+math strings look like false positives.
    """
    s = s.replace(r"\$", "")
    return DOLLAR_SPAN.sub("", s)


def offenders_in(s):
    if not isinstance(s, str):
        return []
    outside = strip_math(s)
    return sorted(set(m.group(0) for m in PATTERN_RE.finditer(outside)))


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    items = data if isinstance(data, list) else data.get("items", [])

    hits = []
    for it in items:
        iid = it.get("item_id", "<no id>")
        for f in FIELDS:
            v = it.get(f)
            off = offenders_in(v)
            if off:
                hits.append((iid, f, off, v))
        choices = it.get("answer_choices", {}) or {}
        for k, v in choices.items():
            off = offenders_in(v)
            if off:
                hits.append((iid, f"answer_choices.{k}", off, v))

    if not hits:
        print("CLEAN: no unwrapped LaTeX found across", len(items), "items.")
        return 0

    print(f"Found {len(hits)} offending field(s) across the bank:\n")
    for iid, field, off, val in hits:
        print(f"── {iid}  [{field}]  patterns={off}")
        print(f"     {val!r}\n")
    return 1


if __name__ == "__main__":
    sys.exit(main())
