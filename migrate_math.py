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

MATH_SPAN = re.compile(r'(\$[^$]+\$)')

# Escaped currency (\$) holds a real "$" character, so it derails $...$ pairing:
# in "\$70 $\div$ \$2" a naive split reads "$70 $" as a math span and then skips
# the genuine symbols after it. Swap \$ for a private-use sentinel before
# splitting and restore it after -- the same trick, and the same sentinel,
# MathText.tsx uses when it parses these strings for rendering.
DOLLAR_SENTINEL = ""

def outside_math(s, fn):
    """Apply fn only to the parts of s that are NOT already inside $...$.

    Every rule below must go through this. Splitting once at entry is not
    enough: a rule can *create* a math span that a later rule then writes
    into. That is what produced $\\sqrt{($x^{2}$)}$ in AR_P_011 -- the
    radical rule built the span, then the superscript rule fired inside it.
    Re-splitting before each rule keeps freshly-created spans protected too.

    Nested $ is the nastiest form of this bug because the dollar count stays
    even, so a balance-counting guard sees nothing wrong, while MathText
    closes the span at the first inner $ and drops the rest of the sentence
    into math mode.
    """
    protected = s.replace('\\$', DOLLAR_SENTINEL)
    joined = ''.join(
        part if (len(part) > 1 and part.startswith('$') and part.endswith('$')) else fn(part)
        for part in MATH_SPAN.split(protected)
    )
    return joined.replace(DOLLAR_SENTINEL, '\\$')

def replace_all(mapping):
    def go(seg):
        for char, latex in mapping.items():
            if char in seg:
                seg = seg.replace(char, f"${latex}$")
        return seg
    return go

def convert_string(s):
    if not needs_math(s):
        return s
    result = s
    result = outside_math(result, lambda seg: re.sub(r'√(\([^)]+\)|\d+(?:/\d+)?)', lambda m: f"$\\sqrt{{{m.group(1)}}}$", seg))
    result = outside_math(result, lambda seg: seg.replace("√", r"$\sqrt{}$"))
    result = outside_math(result, replace_all(UNICODE_FRACTIONS))
    result = outside_math(result, lambda seg: re.sub(r'([A-Za-z0-9\)]+)([²³⁴⁵¹])', lambda m: f"${m.group(1)}^{{{SUPERSCRIPTS[m.group(2)]}}}$", seg))
    result = outside_math(result, lambda seg: re.sub(r'([A-Za-z])([₁₂₃₄₅])', lambda m: f"${m.group(1)}_{{{SUBSCRIPTS[m.group(2)]}}}$", seg))
    result = outside_math(result, replace_all(SYMBOL_MAP))
    # Minus/dash normalisation is safe inside math too: it substitutes one
    # character for another and never introduces a delimiter.
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
