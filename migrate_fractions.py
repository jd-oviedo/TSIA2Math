#!/usr/bin/env python3
import json, re, shutil
from pathlib import Path

SRC = Path("public/data/question_bank.json")
BACKUP = Path("public/data/question_bank.backup2.json")

def convert_fracs(s):
    if not isinstance(s, str):
        return s
    # Skip strings already inside $...$
    # Process segment by segment: outside $ blocks only
    result = []
    parts = re.split(r'(\$[^$]+\$)', s)
    for part in parts:
        if part.startswith('$') and part.endswith('$'):
            result.append(part)  # already math, leave alone
        else:
            # Convert -n/d and n/d to \frac, not preceded or followed by digit
            part = re.sub(
                r'(?<![0-9])(-?\d+)/(\d+)(?![0-9])',
                lambda m: f"$\\frac{{{m.group(1)}}}{{{m.group(2)}}}$",
                part
            )
            result.append(part)
    # Merge adjacent math blocks: $A$$B$ -> $AB$
    merged = ''.join(result)
    merged = re.sub(r'\$([^$]+)\$\$([^$]+)\$', r'$\1\2$', merged)
    return merged

def walk(item):
    for field in ["question_text", "explanation"]:
        if field in item:
            item[field] = convert_fracs(item[field])
    for d in ["answer_choices", "distractor_logic"]:
        if d in item:
            item[d] = {k: convert_fracs(v) for k, v in item[d].items()}
    if "strategy_hints" in item:
        for h in item["strategy_hints"]:
            if "hint_text" in h:
                h["hint_text"] = convert_fracs(h["hint_text"])
    return item

shutil.copy2(SRC, BACKUP)
print(f"Backup -> {BACKUP}")

with open(SRC, encoding="utf-8") as f:
    data = json.load(f)

items = data if isinstance(data, list) else data.get("items", [])
changed = 0
for item in items:
    before = json.dumps(item)
    walk(item)
    if json.dumps(item) != before:
        changed += 1

with open(SRC, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Done. {changed}/{len(items)} items updated.")
