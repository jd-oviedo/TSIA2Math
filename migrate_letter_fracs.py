#!/usr/bin/env python3
import json, re
from pathlib import Path

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
