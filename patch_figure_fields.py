import json
from pathlib import Path

files = [
    "data/items/GR/GR.3.4.json",
    "data/items/GR/GR.4.1.json",
    "data/items/GR/GR.4.2.json",
    "data/items/GR/GR.4.3.json",
    "data/items/GR/GR.4.4.json",
    "data/items/GR/GR.4.5.json",
]

for f in files:
    p = Path(f)
    items = json.loads(p.read_text(encoding="utf-8"))
    changed = 0
    for it in items:
        if "figure_type" not in it:
            it["figure_type"] = None
            changed += 1
        if "figure_props" not in it:
            it["figure_props"] = None
    p.write_text(json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"{f}: patched {changed} item(s)")
