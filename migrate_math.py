#!/usr/bin/env python3
import json, re, shutil, sys
from pathlib import Path

SRC = Path("public/data/question_bank.json")
BACKUP = Path("public/data/question_bank.backup.json")

UNICODE_FRACTIONS = {
    "½": r"\frac{1}{2}", "⅓": r"\frac{1}{3}", "⅔": r"\frac{2}{3}",
    "¼": r"\frac{1}{4}", "¾": r"\frac{3}{4}", "⅕": r"\frac{1}{5}",
    "⅖": r"\frac{2}{5}", "⅗": r"\frac{3}{5}", "⅘": r"\frac{4}{5}",
    "⅙": r"\frac{1}{6}", "⅚": r"\frac{5}{6}", "⅛": r"\frac{1}{8}",
    "⅜": r"\frac{3}{8}", "⅝": r"\frac{5}{8}", "⅞": r"\frac{7}{8}",
}
SUPERSCRIPTS = {"²": "2", "³": "3", "⁴": "4", "⁵": "5", "¹": "1"}
SUBSCRIPTS   = {"₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5"}
SYMBOL_MAP   = {
    "×": r"\times", "÷": r"\div", "≤": r"\leq", "≥": r"\geq",
    "≠": r"\neq", "≈": r"\approx", "Δ": r"\Delta", "π": r"\pi", "∞": r"\infty",
}
MATH_MINUS = "\u2212"
EN_DASH    = "\u2013"

def needs_math(s):
    triggers = "√²³⁴⁵¹₁₂₃₄₅½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞×÷≤≥≠≈Δπ∞" + MATH_MINUS + EN_DASH
    return any(c in s for c in triggers)

def convert_string(s):
    if not needs_math(s):
        return s
    result = s
    result = re.sub(r'√(\([^)]+\)|\d+(?:/\d+)?)', lambda m: f"$\\sqrt{{{m.group(1)}}}$", result)
    result = result.replace("√", r"$\sqrt{}$")
    for char, latex in UNICODE_FRACTIONS.items():
        if char in result:
            result = result.replace(char, f"${latex}$")
    result = re.sub(r'([A-Za-z0-9\)]+)([²³⁴⁵¹])', lambda m: f"${m.group(1)}^{{{SUPERSCRIPTS[m.group(2)]}}}$", result)
    result = re.sub(r'([A-Za-z])([₁₂₃₄₅])', lambda m: f"${m.group(1)}_{{{SUBSCRIPTS[m.group(2)]}}}$", result)
    for char, latex in SYMBOL_MAP.items():
        if char in result:
            result = result.replace(char, f"${latex}$")
    result = result.replace(MATH_MINUS, "-")
    result = result.replace(EN_DASH, "-")
    result = re.sub(r'\$\$', r'$ $', result)
    result = re.sub(r'\$([^$]+)\$\$([^$]+)\$', r'$\1\2$', result)
    return result

def convert_fields(item):
    for field in ["question_text", "explanation", "objective_text", "topic_text"]:
        if field in item and isinstance(item[field], str):
            item[field] = convert_string(item[field])
    if "answer_choices" in item:
        item["answer_choices"] = {k: convert_string(v) for k, v in item["answer_choices"].items()}
    if "distractor_logic" in item:
        item["distractor_logic"] = {k: convert_string(v) for k, v in item["distractor_logic"].items()}
    if "strategy_hints" in item:
        for hint in item["strategy_hints"]:
            if "hint_text" in hint:
                hint["hint_text"] = convert_string(hint["hint_text"])
    return item

def main():
    if not SRC.exists():
        print(f"ERROR: {SRC} not found. Run from repo root.", file=sys.stderr)
        sys.exit(1)
    shutil.copy2(SRC, BACKUP)
    print(f"Backup saved to {BACKUP}")
    with open(SRC, encoding="utf-8") as f:
        data = json.load(f)
    items = data if isinstance(data, list) else data.get("items", [])
    converted = 0
    for item in items:
        before = json.dumps(item)
        convert_fields(item)
        after = json.dumps(item)
        if before != after:
            converted += 1
    out = data if isinstance(data, list) else {**data, "items": items}
    with open(SRC, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"Done. {converted}/{len(items)} items updated.")
    print(f"Original preserved at {BACKUP}")

if __name__ == "__main__":
    main()
