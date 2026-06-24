#!/usr/bin/env python3
import json
from pathlib import Path

fixes = {
    "data/items/AR/AR.2.8.json": {
        "AR_B_046": {
            "answer_choices": {"A": "$t = \\frac{d}{r}$", "B": "t = dr", "C": "$t = \\frac{r}{d}$", "D": "t = d - r"},
            "explanation": "To isolate t, divide both sides by r:\nd = rt\n$\\frac{d}{r} = t$\n\n$t = \\frac{d}{r}$\n\nThis works because division is the inverse of multiplication."
        },
        "AR_B_047": {
            "answer_choices": {"A": "b = P + a + c", "B": "b = P - a - c", "C": "$b = \\frac{P}{ac}$", "D": "$b = \\frac{P - a}{c}$"}
        },
        "AR_P_032": {
            "question_text": "The slope formula is $m = \\frac{y_2 - y_1}{x_2 - x_1}$. Solve this formula for $y_2$.",
            "answer_choices": {"A": "$y_2 = \\frac{m}{x_2 - x_1} + y_1$", "B": "$y_2 = m(x_2 - x_1) - y_1$", "C": "$y_2 = m(x_2 - x_1) + y_1$", "D": "$y_2 = (m + y_1)(x_2 - x_1)$"},
            "explanation": "Step 1 — Multiply both sides by $(x_2 - x_1)$ to clear the denominator:\n$m(x_2 - x_1) = y_2 - y_1$\n\nStep 2 — Add $y_1$ to both sides to isolate $y_2$:\n$y_2 = m(x_2 - x_1) + y_1$\n\nThis is exactly the point-slope form of a line, rearranged."
        },
        "AR_P_033": {
            "question_text": "The area of a trapezoid is $A = \\frac{1}{2}(b_1 + b_2)h$. Solve this formula for $b_1$.",
            "answer_choices": {"A": "$b_1 = 2A - b_2 h$", "B": "$b_1 = \\frac{A}{h} - b_2$", "C": "$b_1 = A - b_2 - h$", "D": "$b_1 = \\frac{2A}{h} - b_2$"},
            "explanation": "Step 1 — Multiply both sides by 2 to eliminate the fraction:\n$2A = (b_1 + b_2)h$\n\nStep 2 — Divide both sides by h:\n$\\frac{2A}{h} = b_1 + b_2$\n\nStep 3 — Subtract $b_2$ from both sides:\n$b_1 = \\frac{2A}{h} - b_2$\n\nVerify with A = 24, h = 6, $b_2$ = 4:\n$b_1 = \\frac{2(24)}{6} - 4 = \\frac{48}{6} - 4 = 8 - 4 = 4$\nCheck: $\\frac{1}{2}(4 + 4)(6) = 24$ ✓"
        },
        "AR_A_025": {
            "answer_choices": {"A": "$x = \\frac{c}{a} + \\frac{c}{b}$", "B": "$x = \\frac{c}{a + b}$", "C": "$x = \\frac{c - b}{a}$", "D": "$x = \\frac{c}{ab}$"},
            "explanation": "Factor x from the left side:\nax + bx = x(a + b)\n\nSo the equation becomes:\nx(a + b) = c\n\nDivide both sides by (a + b):\n$x = \\frac{c}{a + b}$\n\nVerify with a = 2, b = 3, c = 10:\n$x = \\frac{10}{2 + 3} = \\frac{10}{5} = 2$\nCheck: 2(2) + 3(2) = 4 + 6 = 10 ✓"
        },
        "AR_A_026": {
            "question_text": "Solve for x: $\\frac{x + a}{b} = c + x$",
            "answer_choices": {"A": "$x = \\frac{bc - a}{1 + b}$", "B": "$x = \\frac{a - bc}{b}$", "C": "$x = \\frac{bc - a}{1 - b}$", "D": "x = bc - a + b"}
        }
    }
}

for filepath, item_fixes in fixes.items():
    path = Path(filepath)
    items = json.loads(path.read_text(encoding='utf-8'))
    changed = 0
    for item in items:
        if item['item_id'] in item_fixes:
            for field, value in item_fixes[item['item_id']].items():
                item[field] = value
            changed += 1
    path.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"Fixed {changed} items in {path.name}")
print("Done.")
