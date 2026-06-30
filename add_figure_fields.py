import json
from pathlib import Path

count = 0
for filepath in Path("data/items").rglob("*.json"):
    with open(filepath, "r") as f:
        items = json.load(f)
    changed = False
    for item in items:
        if "figure_type" not in item:
            item["figure_type"] = None
            item["figure_props"] = None
            changed = True
            count += 1
    if changed:
        with open(filepath, "w") as f:
            json.dump(items, f, indent=2)
            f.write("\n")

print(f"Backfilled {count} items across the bank.")