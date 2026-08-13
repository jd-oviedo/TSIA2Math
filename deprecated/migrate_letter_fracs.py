#!/usr/bin/env python3
r"""DEPRECATED -- DO NOT RUN. Quarantined 2026-08-13.

This is a one-shot migration that already ran (commit 7ff9803, 2026-06-24) and
whose output is baked into data/items/. Re-running it corrupts the item bank.

What went wrong. The digit/digit rule below,

    r'(?<![\\$\w])(\d+)\s*/\s*(\d+)(?!\d)'

allows whitespace around the slash (\s*) and guards the left side only with
\w -- and U+221A (the radical sign) is not a \w character. So it matched
*fragments* of larger expressions and wrapped them as standalone fractions,
silently changing the mathematics:

    "10√3 / 3"        ->  "10√$\\frac{3}{3}$"        (QR_A_027 choice D)
    "7√3 / 2"         ->  "7√$\\frac{3}{2}$"         (QR_A_025 choice B)
    "F = 21.5 / 0.25" ->  "F = 21.$\\frac{5}{0}$.25" (PR_A_031, decimals split)

It damaged 10 items across the PR and QR strands. All 10 were repaired by hand
on 2026-08-13; see content-fixes-needed.md. The regex is left intact rather
than patched, because a corrected version of a completed one-shot migration has
no safe use: running it again could only re-process already-converted text.

If you need slash -> \\frac conversion for *new* content, write a fresh pass
that (a) skips segments already inside $...$, (b) refuses to match across a
decimal point, and (c) is reviewed item by item -- these are multi-term
expressions with radicals and signs, not clean digit fractions.
"""
import json, re, sys, os
from pathlib import Path

if os.environ.get("I_UNDERSTAND_THIS_CORRUPTS_THE_BANK") != "yes":
    sys.exit(
        "REFUSING TO RUN: deprecated/migrate_letter_fracs.py corrupts data/items/.\n"
        "It is kept only as a record of the 7ff9803 regression. Read the module\n"
        "docstring before doing anything else."
    )

ITEMS_DIR = Path("data/items")

def split_math(s):
    parts = re.split(r'(\$[^$]+\$)', s)
    return [(p.startswith('$') and p.endswith('$') and len(p) > 1, p) for p in parts]

def fix_segment(s):
    s = re.sub(r'([A-Za-z\)]+)\^(\d+)', lambda m: f"${m.group(1)}^{{{m.group(2)}}}$", s)
    s = re.sub(r'\b([a-zA-Z])\s*/\s*(\d+)\b', lambda m: f"$\\frac{{{m.group(1)}}}{{{m.group(2)}}}$", s)
    s = re.sub(r'\b(\d+)\s*/\s*([a-zA-Z])\b', lambda m: f"$\\frac{{{m.group(1)}}}{{{m.group(2)}}}$", s)
    s = re.sub(r'(?<![\\$\w])(-\d+)/(\d+)(?!\d)', lambda m: f"$\\frac{{{m.group(1)}}}{{{m.group(2)}}}$", s)
    s = re.sub(r'\(([^()]+)\)\s*/\s*\(([^()]+)\)', lambda m: f"$\\frac{{{m.group(1)}}}{{{m.group(2)}}}$", s)
    s = re.sub(r'(?<![\\$\w])(\d+)\s*/\s*(\d+)(?!\d)', lambda m: f"$\\frac{{{m.group(1)}}}{{{m.group(2)}}}$", s)
    return s

def convert(s):
    if not isinstance(s, str):
        return s
    segments = split_math(s)
    result = []
    for is_math, part in segments:
        result.append(part if is_math else fix_segment(part))
    out = ''.join(result)
    out = re.sub(r'\$([^$]+)\$\$([^$]+)\$', r'$\1\2$', out)
    return out

def fix_item(item):
    for f in ['question_text', 'explanation']:
        if f in item:
            item[f] = convert(item[f])
    for d in ['answer_choices', 'distractor_logic']:
        if d in item:
            item[d] = {k: convert(v) for k, v in item[d].items()}
    if 'strategy_hints' in item:
        for h in item['strategy_hints']:
            if 'hint_text' in h:
                h['hint_text'] = convert(h['hint_text'])
    return item

fixed = 0
for path in sorted(ITEMS_DIR.rglob('*.json')):
    text = path.read_text(encoding='utf-8')
    items = json.loads(text)
    before = json.dumps(items)
    items = [fix_item(it) for it in items]
    after = json.dumps(items)
    if before != after:
        path.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding='utf-8')
        fixed += 1
        print(f'  Fixed: {path.name}')

print(f'\nDone. {fixed} files updated.')
