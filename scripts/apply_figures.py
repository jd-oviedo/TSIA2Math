#!/usr/bin/env python3
"""
Apply figure_type / figure_props to items from a proposals map.

Usage: python3 scripts/apply_figures.py <proposals.json>

For every item_id present in the proposals map, sets:
  contains_image = True
  figure_type    = <proposed>
  figure_props   = <proposed>
  image_url      = None            (always — figures are data-rendered)
  last_modified  = LAST_MODIFIED (see below)
Leaves created_at, author, and every other field untouched. Items NOT in the
map are not touched at all.
"""
import json
import sys
import glob
from pathlib import Path

LAST_MODIFIED = "2026-08-12"
ALLOWED_TYPES = {
    "polygon", "polygon_comparison", "right_triangle", "solid_3d",
    "bar_chart", "line_graph", "pictograph", "dot_plot",
    "box_plot", "box_plot_comparison", "scatterplot", "table",
}


def main():
    proposals_path = sys.argv[1]
    raw = json.loads(Path(proposals_path).read_text())
    proposals = {k: v for k, v in raw.items() if not k.startswith("_")}

    # validate proposal types up front
    for iid, spec in proposals.items():
        ft = spec.get("figure_type")
        if ft not in ALLOWED_TYPES:
            sys.exit(f"ERROR: {iid} has unsupported figure_type {ft!r}")
        if not isinstance(spec.get("figure_props"), dict):
            sys.exit(f"ERROR: {iid} figure_props is not an object")

    applied = set()
    # All four strands: the second figure pass reaches QR items too, not just
    # the GR/PR pair the first pass covered.
    files = sorted(glob.glob("data/items/*/*.json"))
    for f in files:
        items = json.loads(Path(f).read_text())
        changed = False
        for it in items:
            iid = it["item_id"]
            if iid in proposals:
                spec = proposals[iid]
                it["contains_image"] = True
                it["image_url"] = None
                it["figure_type"] = spec["figure_type"]
                it["figure_props"] = spec["figure_props"]
                it["last_modified"] = LAST_MODIFIED
                applied.add(iid)
                changed = True
        if changed:
            # Match the on-disk convention (indent=2, ensure_ascii=True) so only
            # the intended items change — otherwise non-ASCII strings elsewhere in
            # the file get re-escaped and pollute the diff.
            Path(f).write_text(json.dumps(items, indent=2) + "\n")
            print(f"  patched {f}")

    missing = set(proposals) - applied
    print(f"\nApplied {len(applied)} / {len(proposals)} proposals.")
    if missing:
        print(f"WARNING: {len(missing)} proposal ids not found in any file: {sorted(missing)}")
    else:
        print("All proposal ids matched an item.")


if __name__ == "__main__":
    main()
