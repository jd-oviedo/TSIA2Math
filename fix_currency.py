#!/usr/bin/env python3
"""
Fix currency dollar signs in source item files.
Replaces $<digit> and $<comma-digit> patterns with \$<digit> so they
don't get treated as LaTeX math delimiters.
Operates on data/items/**/*.json source files, then rebuilds the bank.
"""
import json, re
from pathlib import Path

ITEMS_DIR = Path("data/items")
fixed_files = 0
fixed_instances = 0

# Match $ followed by digit or comma+digit (currency patterns)
# But NOT \$ (already escaped) and NOT $\ (already LaTeX)
CURRENCY = re.compile(r'(?<!\\)\$(?=[\d,])')

def fix_string(s):
    return CURRENCY.sub(r'\\$', s) if isinstance(s, str) else s

def fix_item(item):
    for field in ["question_text", "explanation"]:
        if field in item:
            item[field] = fix_string(item[field])
    for d in ["answer_choices", "distractor_logic"]:
        if d in item:
            item[d] = {k: fix_string(v) for k, v in item[d].items()}
    if "strategy_hints" in item:
        for h in item["strategy_hints"]:
            if "hint_text" in h:
                h["hint_text"] = fix_string(h["hint_text"])
    return item

for path in sorted(ITEMS_DIR.rglob("*.json")):
    text = path.read_text(encoding="utf-8")
    items = json.loads(text)
    before = json.dumps(items)
    items = [fix_item(it) for it in items]
    after = json.dumps(items)
    if before != after:
        path.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
        fixed_files += 1
        fixed_instances += before.count('$') - after.count('$')
        print(f"  Fixed: {path.name}")

print(f"\nDone. {fixed_files} files updated.")
