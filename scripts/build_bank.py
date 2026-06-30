#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_bank.py — merge the per-topic item files into one validated question bank.

Usage (from the repo root):
    python3 scripts/build_bank.py

Reads:   items/**/*.json        (each file is a JSON array of v2.0 item objects)
Writes:  build/question_bank.json   (ONLY if validation passes — fails safe)

Exit code 0 on success, 1 if any errors are found, so you can later wire this
into a GitHub Action / pre-commit hook. Pure standard library, no pip installs.
"""
import json
import sys
from pathlib import Path
from collections import Counter

# Repo root is the parent of the scripts/ folder, so the script works no matter
# which directory you run it from.
ROOT = Path(__file__).resolve().parent.parent
ITEMS_DIR = ROOT / "data" / "items"
BUILD_DIR = ROOT / "public" / "data"
OUT_FILE = BUILD_DIR / "question_bank.json"

# ---- schema v2.0: the single source of truth --------------------------------
SCHEMA_FIELDS = {
    "item_id", "schema_version", "version", "status", "category", "primary_strand",
    "secondary_strands", "objective", "objective_text", "topic_id", "topic", "topic_text",
    "proficiency_level", "assessment_layer", "unit", "skills_targeted", "question_text",
    "question_format", "answer_choices", "correct_answer", "explanation", "distractor_logic",
    "difficulty_level", "difficulty_b", "discrimination_a", "guessing_c", "calculator_type",
    "requires_calculator", "applicable_strategies", "strategy_hints", "content_context",
    "context_tags", "estimated_time_seconds", "contains_image", "image_url",
    "figure_type", "figure_props", "exposure_max",
    "times_administered", "times_correct", "dif_flag", "fairness_review_status",
    "fairness_review_date", "fairness_review_notes", "author", "created_at", "last_modified",
    "review_notes",
}
STRATEGY_VOCAB = {"use_answer_choices", "plug_in_values", "estimate_first",
                  "draw_diagram", "eliminate_wrong_answers", "identify_key_info"}
STRANDS = {"QR", "AR", "GR", "PR"}
LAYERS = {"CRC", "DIAGNOSTIC", "ENRICHMENT"}
LEVELS = {"Basic", "Proficient", "Advanced"}
CALC_TYPES = {"none", "basic", "square_root", "graphing"}
LEGACY_FIELDS = {"subtopic", "category_code"}
STRAND_ORDER = {"QR": 0, "AR": 1, "GR": 2, "PR": 3}
LEVEL_RANK = {"B": 0, "P": 1, "A": 2}

errors = []     # block the build
warnings = []   # reported, but the build still completes


def check_item(it, fname, seen_ids):
    """Per-item integrity checks plus the cross-file duplicate-id check."""
    iid = it.get("item_id", "<no item_id>")
    tag = f"{fname} :: {iid}"

    # --- field set ---
    missing = SCHEMA_FIELDS - set(it)
    if missing:
        errors.append(f"{tag}: missing field(s) {sorted(missing)}")
    extra = set(it) - SCHEMA_FIELDS - LEGACY_FIELDS
    if extra:
        warnings.append(f"{tag}: unexpected field(s) {sorted(extra)}")
    legacy = LEGACY_FIELDS & set(it)
    if legacy:
        errors.append(f"{tag}: legacy field(s) still present {sorted(legacy)}")

    # --- duplicate item_id across the WHOLE bank (the big one) ---
    if iid in seen_ids:
        errors.append(f"{tag}: duplicate item_id — also defined in {seen_ids[iid]}")
    else:
        seen_ids[iid] = fname

    # --- controlled values ---
    if it.get("schema_version") != "2.0":
        errors.append(f"{tag}: schema_version is {it.get('schema_version')!r}, expected '2.0'")
    if it.get("primary_strand") not in STRANDS:
        errors.append(f"{tag}: primary_strand {it.get('primary_strand')!r} not in {sorted(STRANDS)}")
    if it.get("assessment_layer") not in LAYERS:
        errors.append(f"{tag}: assessment_layer {it.get('assessment_layer')!r} not in {sorted(LAYERS)}")
    if it.get("difficulty_level") not in LEVELS:
        errors.append(f"{tag}: difficulty_level {it.get('difficulty_level')!r} not in {sorted(LEVELS)}")
    if it.get("proficiency_level") not in LEVELS:
        errors.append(f"{tag}: proficiency_level {it.get('proficiency_level')!r} not in {sorted(LEVELS)}")
    if it.get("calculator_type") not in CALC_TYPES:
        errors.append(f"{tag}: calculator_type {it.get('calculator_type')!r} not in {sorted(CALC_TYPES)}")
    for s in it.get("secondary_strands", []):
        if s not in STRANDS:
            errors.append(f"{tag}: secondary strand {s!r} not in {sorted(STRANDS)}")

    # --- answer integrity ---
    choices = it.get("answer_choices", {})
    if it.get("correct_answer") not in choices:
        errors.append(f"{tag}: correct_answer {it.get('correct_answer')!r} is not one of the answer_choices")
    if set(it.get("distractor_logic", {})) != set(choices):
        errors.append(f"{tag}: distractor_logic keys do not match answer_choices keys")

    # --- strategies ---
    strat = it.get("applicable_strategies", [])
    bad = [s for s in strat if s not in STRATEGY_VOCAB]
    if bad:
        errors.append(f"{tag}: strategy code(s) {bad} not in the controlled vocabulary")
    hint_strats = [h.get("strategy") for h in it.get("strategy_hints", [])]
    if strat != hint_strats:
        errors.append(f"{tag}: applicable_strategies {strat} do not line up with strategy_hints {hint_strats}")


def check_file_topic(items, path):
    """The filename/folder must agree with the topic_id inside the file."""
    expected_topic = path.stem        # e.g. "QR.1.1"
    folder_strand = path.parent.name  # e.g. "QR"
    topic_strand = expected_topic.split(".")[0] if "." in expected_topic else None
    if topic_strand and topic_strand != folder_strand:
        warnings.append(f"{path.name}: lives in items/{folder_strand}/ but topic prefix is {topic_strand}")
    for it in items:
        if it.get("topic_id") != expected_topic:
            errors.append(
                f"{path.name} :: {it.get('item_id')}: topic_id {it.get('topic_id')!r} "
                f"does not match filename '{expected_topic}'")


def sort_key(it):
    """Deterministic order so build/question_bank.json has stable git diffs."""
    tid = it.get("topic_id", "")
    parts = tid.split(".")
    strand = STRAND_ORDER.get(parts[0], 99)
    nums = tuple(int(p) if p.isdigit() else 0 for p in parts[1:])
    try:
        _, lvl, num = it.get("item_id", "_X_0").split("_")
        lr, n = LEVEL_RANK.get(lvl, 9), int(num)
    except ValueError:
        lr, n = 9, 0
    return (strand, nums, lr, n)


def main():
    if not ITEMS_DIR.is_dir():
        print(f"ERROR: no items/ directory found at {ITEMS_DIR}")
        sys.exit(1)

    files = sorted(ITEMS_DIR.glob("**/*.json"))
    if not files:
        print(f"No topic files found under {ITEMS_DIR}. Nothing to build.")
        sys.exit(1)

    all_items = []
    seen_ids = {}
    for path in files:
        rel = path.relative_to(ROOT)
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            errors.append(f"{rel}: invalid JSON — {e}")
            continue
        if not isinstance(data, list):
            errors.append(f"{rel}: top level must be a JSON array of items")
            continue
        check_file_topic(data, path)
        for it in data:
            check_item(it, path.name, seen_ids)
        all_items.extend(data)

    all_items.sort(key=sort_key)

    # ---- coverage report + soft answer-key-balance check ----
    by_topic = {}
    for it in all_items:
        by_topic.setdefault(it.get("topic_id"), []).append(it)
    for tid, items in sorted(by_topic.items(), key=lambda kv: sort_key(kv[1][0])):
        keys = Counter(i.get("correct_answer") for i in items)
        if len(items) >= 4:
            top_share = max(keys.values()) / len(items)
            if top_share > 0.40:
                pos = keys.most_common(1)[0][0]
                warnings.append(
                    f"{tid}: answer key skewed — {keys.most_common(1)[0][1]}/{len(items)} land on "
                    f"'{pos}' ({top_share:.0%}). Ignore if your app shuffles choices at render time.")

    # ---- report ----
    print(f"Scanned {len(files)} topic file(s), {len(all_items)} item(s).")
    strands = Counter(i.get("primary_strand") for i in all_items)
    print("By primary strand: " + ", ".join(f"{k}={strands[k]}" for k in sorted(strands)))
    print("Topics:")
    for tid, items in sorted(by_topic.items(), key=lambda kv: sort_key(kv[1][0])):
        lv = Counter(i.get("difficulty_level", "?")[0] for i in items)
        print(f"  {tid:10} {len(items):>3} items  (B:{lv.get('B',0)} P:{lv.get('P',0)} A:{lv.get('A',0)})")

    if warnings:
        print(f"\n⚠  {len(warnings)} warning(s):")
        for w in warnings:
            print(f"   - {w}")

    if errors:
        print(f"\n✗  {len(errors)} error(s) — bundle NOT written:")
        for e in errors:
            print(f"   - {e}")
        sys.exit(1)

    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(all_items, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n✓  Validation passed. Wrote {len(all_items)} items to {OUT_FILE.relative_to(ROOT)}")
    sys.exit(0)


if __name__ == "__main__":
    main()
