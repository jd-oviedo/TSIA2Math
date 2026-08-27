---
topic_name: "Literal equations (solving for a variable in a formula)"
unit_number: 2
sequence_in_unit: 15
assessment_layer: "ENRICHMENT"
estimated_time_minutes: 45
difficulty_band: "Proficient"
related_strand: "AR"
keywords: ["literal equation", "solving for a variable", "rearranging formulas", "inverse operations", "factoring", "isolating"]
---

# AR.2.8 - Literal Equations

**Topic ID:** AR.2.8  
**Unit:** 2  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** ENRICHMENT  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Same Moves, No Numbers to Hide Behind

Solving $3x = 12$ for $x$ and solving $A = lw$ for $w$ are the same task. Both peel an operation off the variable you want, doing the same thing to both sides.

$$A = lw \quad \rightarrow \quad \frac{A}{l} = w$$

The only difference is that the answer is an expression rather than a number, which feels unfinished. It is not. **An expression made of the other letters is a complete answer** to a literal equation.

The method never changes:

**Step 1:** Decide which letter you are solving for. Everything else is just a number that happens to be spelled with a letter.  
**Step 2:** Peel operations off it in reverse order, applying the inverse of each to both sides.  
**Step 3:** Stop when it stands alone.

If it helps, put a number in temporarily. In $A = lw$, imagine $l = 5$: you would divide by 5 to get $w$. So you divide by $l$.

---

##### The Mistake That Costs the Most Points

You undo an operation with the wrong inverse.

Solving $A = lw$ for $w$, students write $w = A - l$. Subtraction undoes addition, and nothing here was added. The $l$ and the $w$ are **multiplied**, so the inverse is division.

**Match the inverse to the operation that is actually there.**

| What is attached | How to remove it |
|---|---|
| added | subtract it |
| subtracted | add it |
| multiplied | divide by it |
| divided | multiply by it |

The check is quick: put your answer back. If $w = \frac{A}{l}$, then $l \cdot \frac{A}{l} = A$, which returns the original. If $w = A - l$, then $l(A - l)$ is not $A$, so it was never right.

---

##### Order Matters, In Reverse

**Example 1:** Solve $y = mx + b$ for $x$.

Going forward the formula multiplies by $m$ and then adds $b$. Undo them backward: subtract first, divide second.

- $y - b = mx$
- $x = \frac{y - b}{m}$

Dividing first gives $\frac{y}{m} - b$, which is a different expression. The $b$ has to come off the whole side before the division, and once it does, the division applies to **everything** left.

**The last thing done is the first thing undone**, exactly as in AR.2.1 and AR.2.3.

---

##### Divide Every Term

**Example 2:** Solve $P = 2l + 2w$ for $w$.

- $P - 2l = 2w$
- $w = \frac{P - 2l}{2}$

The whole numerator is divided by 2. Writing $\frac{P}{2} - 2l$ divides one term and leaves the other untouched, which is a different quantity.

Note that $\frac{P - 2l}{2}$ can also be written $\frac{P}{2} - l$, which is correct because **both** terms were divided. That is the distinction: division does distribute across a numerator's terms, and it must reach all of them.

What division does **not** do is distribute across a denominator's terms.

$$\frac{c}{a + b} \ne \frac{c}{a} + \frac{c}{b}$$

Test it with numbers: $\frac{12}{2 + 4} = 2$, while $\frac{12}{2} + \frac{12}{4} = 9$. Not the same, not close.

---

##### Fractions in the Formula

**Example 3:** Solve $A = \frac{1}{2}bh$ for $h$.

Clear the fraction first by multiplying both sides by 2, then divide.

- $2A = bh$
- $h = \frac{2A}{b}$

The most common wrong answers here drop the 2 entirely, giving $\frac{A}{b}$, or divide by it instead of multiplying, giving $\frac{A}{2b}$. **A fraction attached to the variable is cleared by multiplying by its reciprocal**, so a $\frac{1}{2}$ is removed by multiplying by 2.

---

##### When the Variable Appears Twice

This is the one genuinely new move in the topic.

**Example 4:** Solve $ax + bx = c$ for $x$.

You cannot isolate $x$ while it sits in two places. Factor it out first so there is only one.

- $x(a + b) = c$
- $x = \frac{c}{a + b}$

The whole bracket is the thing multiplying $x$, so the whole bracket is what you divide by. Writing $\frac{c}{ab}$ treats the two terms as multiplied when they are added.

**If the target letter appears more than once, factor before you divide.** There is no way around it, and no other step will work.

---

##### The Four Traps

1. **Using the wrong inverse.** Multiplication is undone by division, not subtraction. Substitute your answer back.
2. **Undoing in the wrong order.** Subtract before you divide, because the addition happened last.
3. **Dividing only one term.** The division applies to everything in the numerator.
4. **Not factoring when the letter appears twice.** Gather it into one place first.

---

#### **Part 2: Practice Problems**

Solve each formula for the requested variable. Show your thinking.

**Basic Level** (try these first)

1. Solve $A = lw$ for $w$.
   - A) $w = Al$
   - B) $w = \frac{A}{l}$
   - C) $w = \frac{l}{A}$
   - D) $w = A - l$

2. Solve $d = rt$ for $t$.
   - A) $t = \frac{d}{r}$
   - B) $t = dr$
   - C) $t = \frac{r}{d}$
   - D) $t = d - r$

3. Solve $y = mx + b$ for $x$.
   - A) $x = \frac{y}{m} - b$
   - B) $x = \frac{y + b}{m}$
   - C) $x = m(y - b)$
   - D) $x = \frac{y - b}{m}$

4. Solve $C = 2\pi r$ for $r$.
   - A) $r = \frac{C}{2\pi}$
   - B) $r = 2\pi C$
   - C) $r = C - 2\pi$
   - D) $r = \frac{2\pi}{C}$

**Proficient Level** (these require an extra step)

5. Solve $P = 2l + 2w$ for $w$.
   - A) $w = \frac{P}{2} - 2l$
   - B) $w = \frac{P + 2l}{2}$
   - C) $w = \frac{P - 2l}{2}$
   - D) $w = 2(P - 2l)$

6. Solve $A = \frac{1}{2}bh$ for $h$.
   - A) $h = \frac{A}{2b}$
   - B) $h = \frac{2A}{b}$
   - C) $h = \frac{b}{2A}$
   - D) $h = \frac{A}{b}$

7. Solve $ax + bx = c$ for $x$.
   - A) $x = \frac{c}{a} + \frac{c}{b}$
   - B) $x = c - a - b$
   - C) $x = \frac{c}{a + b}$
   - D) $x = \frac{c}{ab}$

**Advanced Level** (these need multiple steps or reverse thinking)

8. Solve $R = \frac{V}{I + r}$ for $I$.
   - A) $I = \frac{V}{R} + r$
   - B) $I = \frac{R}{V} - r$
   - C) $I = VR - r$
   - D) $I = \frac{V}{R} - r$

9. Solve $A = \frac{h(b_1 + b_2)}{2}$ for $b_1$.
   - A) $b_1 = \frac{2A}{h} + b_2$
   - B) $b_1 = \frac{2A}{h} - b_2$
   - C) $b_1 = \frac{A}{2h} - b_2$
   - D) $b_1 = \frac{2A}{h + b_2}$

10. Solve $S = 2\pi rh + 2\pi r^2$ for $h$.
    - A) $h = \frac{S - 2\pi r^2}{2\pi r}$
    - B) $h = \frac{S}{2\pi r} - 2\pi r^2$
    - C) $h = \frac{S - 2\pi r^2}{2\pi r^2}$
    - D) $h = S - 2\pi r^2 - 2\pi r$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Solve $V = lwh$ for $h$.

- A) $h = Vlw$
- B) $h = \frac{lw}{V}$
- C) $h = \frac{V}{lw}$
- D) $h = V - lw$

**Item 2**

Solve $y = mx + b$ for $b$.

- A) $b = y + mx$
- B) $b = y - mx$
- C) $b = \frac{y - m}{x}$
- D) $b = ymx$

**Proficient Level**

**Item 3**

Solve $A = \frac{1}{2}bh$ for $b$.

- A) $b = \frac{A}{2h}$
- B) $b = \frac{A}{h}$
- C) $b = \frac{h}{2A}$
- D) $b = \frac{2A}{h}$

**Item 4**

Solve $px + qx = r$ for $x$.

- A) $x = \frac{r}{p} + \frac{r}{q}$
- B) $x = \frac{r}{pq}$
- C) $x = \frac{r}{p + q}$
- D) $x = r - p - q$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Solve $A = lw$ for $w$.**

Step 1: The $l$ is **multiplied** by $w$, so the inverse is division.

Step 2: Divide both sides by $l$.
- $w = \frac{A}{l}$

Step 3: Check by substituting back. $l \cdot \frac{A}{l} = A$. Returns the original.

**Answer: B** ($w = \frac{A}{l}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: multiplies_instead_of_divides (multiplies by l where dividing was required; substituting back gives l squared times w rather than A)",
  "B": "Correct: divides both sides by l, and substituting back returns A",
  "C": "Student makes misconception: numerator_denominator_swap (builds the fraction upside down, dividing l by A)",
  "D": "Student makes misconception: wrong_inverse_operation_chosen (subtracts to undo a multiplication, when subtraction only undoes addition)"
},
"misconception_tag": {
  "A": "multiplies_instead_of_divides",
  "C": "numerator_denominator_swap",
  "D": "wrong_inverse_operation_chosen"
}
```

---

**2. Solve $d = rt$ for $t$.**

Step 1: The $r$ multiplies $t$, so divide.
- $t = \frac{d}{r}$

Step 2: Check. $r \cdot \frac{d}{r} = d$. Correct.

**Answer: A** ($t = \frac{d}{r}$)

```json
"distractor_logic": {
  "A": "Correct: divides both sides by r, and substituting back returns d",
  "B": "Student makes misconception: multiplies_instead_of_divides (multiplies by r where dividing was required)",
  "C": "Student makes misconception: numerator_denominator_swap (builds the fraction upside down, dividing r by d)",
  "D": "Student makes misconception: wrong_inverse_operation_chosen (subtracts to undo a multiplication)"
},
"misconception_tag": {
  "B": "multiplies_instead_of_divides",
  "C": "numerator_denominator_swap",
  "D": "wrong_inverse_operation_chosen"
}
```

---

**3. Solve $y = mx + b$ for $x$.**

Step 1: Going forward the formula multiplies by $m$ and then adds $b$, so undo the addition first.
- $y - b = mx$

Step 2: Then divide by $m$, and the division applies to the whole left side.
- $x = \frac{y - b}{m}$

Step 3: Check. $m \cdot \frac{y - b}{m} + b = y - b + b = y$. Returns the original.

**Answer: D** ($x = \frac{y - b}{m}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: order_of_operations_violated (divides by m before subtracting b, so the b never passes through the division)",
  "B": "Student makes misconception: sign_error_on_constant (adds b instead of subtracting it when moving it across)",
  "C": "Student makes misconception: wrong_inverse_operation_chosen (multiplies by m to undo a multiplication by m)",
  "D": "Correct: subtracts b first, then divides the whole remaining side by m, which checks back to y"
},
"misconception_tag": {
  "A": "order_of_operations_violated",
  "B": "sign_error_on_constant",
  "C": "wrong_inverse_operation_chosen"
}
```

---

**4. Solve $C = 2\pi r$ for $r$.**

Step 1: The whole quantity $2\pi$ multiplies $r$, so divide by all of it.
- $r = \frac{C}{2\pi}$

Step 2: Check. $2\pi \cdot \frac{C}{2\pi} = C$. Correct.

**Answer: A** ($r = \frac{C}{2\pi}$)

```json
"distractor_logic": {
  "A": "Correct: divides both sides by the whole factor 2 pi, which checks back to C",
  "B": "Student makes misconception: multiplies_instead_of_divides (multiplies by 2 pi where dividing was required)",
  "C": "Student makes misconception: wrong_inverse_operation_chosen (subtracts to undo a multiplication)",
  "D": "Student makes misconception: numerator_denominator_swap (builds the fraction upside down, dividing 2 pi by C)"
},
"misconception_tag": {
  "B": "multiplies_instead_of_divides",
  "C": "wrong_inverse_operation_chosen",
  "D": "numerator_denominator_swap"
}
```

---

**Proficient Level**

**5. Solve $P = 2l + 2w$ for $w$.**

Step 1: Subtract the term that does not contain $w$.
- $P - 2l = 2w$

Step 2: Divide the whole left side by 2.
- $w = \frac{P - 2l}{2}$

Step 3: Check. $2l + 2 \cdot \frac{P - 2l}{2} = 2l + P - 2l = P$. Returns the original.

**Answer: C** ($w = \frac{P - 2l}{2}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: order_of_operations_violated (divides the P by 2 but leaves the 2l term undivided, so only part of the side passed through the division)",
  "B": "Student makes misconception: sign_error_on_constant (adds the 2l instead of subtracting it when moving it across)",
  "C": "Correct: subtracts 2l, then divides the whole remaining side by 2, which checks back to P",
  "D": "Student makes misconception: wrong_inverse_operation_chosen (multiplies by 2 to undo a multiplication by 2)"
},
"misconception_tag": {
  "A": "order_of_operations_violated",
  "B": "sign_error_on_constant",
  "D": "wrong_inverse_operation_chosen"
}
```

---

**6. Solve $A = \frac{1}{2}bh$ for $h$.**

Step 1: Clear the fraction by multiplying both sides by 2, the reciprocal of one half.
- $2A = bh$

Step 2: Divide by $b$.
- $h = \frac{2A}{b}$

Step 3: Check. $\frac{1}{2} \cdot b \cdot \frac{2A}{b} = A$. Correct.

**Answer: B** ($h = \frac{2A}{b}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_inverse_operation_chosen (divides by 2 to remove a factor of one half, when a half is cleared by multiplying by 2)",
  "B": "Correct: multiplies by 2 to clear the half, then divides by b, which checks back to A",
  "C": "Student makes misconception: numerator_denominator_swap (builds the fraction upside down)",
  "D": "Student makes misconception: omits_fractional_factor (drops the one half from the formula entirely, so the 2 never appears)"
},
"misconception_tag": {
  "A": "wrong_inverse_operation_chosen",
  "C": "numerator_denominator_swap",
  "D": "omits_fractional_factor"
}
```

---

**7. Solve $ax + bx = c$ for $x$.**

Step 1: The variable appears twice, so it cannot be isolated yet. Factor it out.
- $x(a + b) = c$

Step 2: The whole bracket multiplies $x$, so divide by the whole bracket.
- $x = \frac{c}{a + b}$

Step 3: Check. $a \cdot \frac{c}{a+b} + b \cdot \frac{c}{a+b} = \frac{c(a+b)}{a+b} = c$. Correct.

**Answer: C** ($x = \frac{c}{a + b}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: division_distributed_over_sum (applies the false rule that c over a plus b splits into c over a plus c over b; with c = 12, a = 2 and b = 4 the true value is 2 while this gives 9)",
  "B": "Student makes misconception: wrong_inverse_operation_chosen (subtracts to undo multiplications)",
  "C": "Correct: factors x out of both terms, then divides by the whole bracket, which checks back to c",
  "D": "Student makes misconception: common_factor_not_extracted (never factors, and treats the two coefficients as multiplied when they are added)"
},
"misconception_tag": {
  "A": "division_distributed_over_sum",
  "B": "wrong_inverse_operation_chosen",
  "D": "common_factor_not_extracted"
}
```

---

**Advanced Level**

**8. Solve $R = \frac{V}{I + r}$ for $I$.**

Step 1: The target is inside a denominator, so multiply both sides by that denominator first.
- $R(I + r) = V$

Step 2: Divide both sides by $R$.
- $I + r = \frac{V}{R}$

Step 3: Subtract $r$.
- $I = \frac{V}{R} - r$

Step 4: Check. Substituting back gives $\frac{V}{\frac{V}{R} - r + r} = \frac{V}{\frac{V}{R}} = R$. Returns the original.

**Answer: D** ($I = \frac{V}{R} - r$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (adds r instead of subtracting it when moving it across)",
  "B": "Student makes misconception: numerator_denominator_swap (inverts the fraction, dividing R by V rather than V by R)",
  "C": "Student makes misconception: wrong_inverse_operation_chosen (multiplies by R to undo a division that had already been cleared, rather than dividing)",
  "D": "Correct: clears the denominator, divides by R, then subtracts r, and substituting back returns R"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "B": "numerator_denominator_swap",
  "C": "wrong_inverse_operation_chosen"
}
```

---

**9. Solve $A = \frac{h(b_1 + b_2)}{2}$ for $b_1$.**

Step 1: Clear the denominator.
- $2A = h(b_1 + b_2)$

Step 2: Divide by $h$.
- $\frac{2A}{h} = b_1 + b_2$

Step 3: Subtract $b_2$.
- $b_1 = \frac{2A}{h} - b_2$

Step 4: Check. $\frac{h\left(\frac{2A}{h} - b_2 + b_2\right)}{2} = \frac{h \cdot \frac{2A}{h}}{2} = \frac{2A}{2} = A$. Correct.

**Answer: B** ($b_1 = \frac{2A}{h} - b_2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (adds b2 instead of subtracting it when moving it across)",
  "B": "Correct: clears the 2, divides by h, then subtracts b2, and substituting back returns A",
  "C": "Student makes misconception: wrong_inverse_operation_chosen (divides by 2 to clear a denominator of 2, when clearing it requires multiplying)",
  "D": "Student makes misconception: division_distributed_over_sum (divides by h and b2 together as a single denominator, when b2 is added inside the bracket and must be subtracted after the division)"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "C": "wrong_inverse_operation_chosen",
  "D": "division_distributed_over_sum"
}
```

---

**10. Solve $S = 2\pi rh + 2\pi r^2$ for $h$.**

Step 1: Subtract the term that does not contain $h$.
- $S - 2\pi r^2 = 2\pi rh$

Step 2: The whole factor $2\pi r$ multiplies $h$, so divide by all of it.
- $h = \frac{S - 2\pi r^2}{2\pi r}$

Step 3: Check. $2\pi r \cdot \frac{S - 2\pi r^2}{2\pi r} + 2\pi r^2 = S - 2\pi r^2 + 2\pi r^2 = S$. Returns the original.

**Answer: A** ($h = \frac{S - 2\pi r^2}{2\pi r}$)

```json
"distractor_logic": {
  "A": "Correct: subtracts the term without h, then divides the whole remaining side by the factor 2 pi r, which checks back to S",
  "B": "Student makes misconception: order_of_operations_violated (divides only the S by 2 pi r and leaves the second term undivided)",
  "C": "Student makes misconception: wrong_fractional_divisor_used (divides by 2 pi r squared rather than by the 2 pi r that actually multiplies h)",
  "D": "Student makes misconception: wrong_inverse_operation_chosen (subtracts the factor 2 pi r to undo a multiplication by it)"
},
"misconception_tag": {
  "B": "order_of_operations_violated",
  "C": "wrong_fractional_divisor_used",
  "D": "wrong_inverse_operation_chosen"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Solve $V = lwh$ for $h$.**

Step 1: The product $lw$ multiplies $h$, so divide by all of it.
- $h = \frac{V}{lw}$

Step 2: Check. $lw \cdot \frac{V}{lw} = V$. Correct.

**Answer: C** ($h = \frac{V}{lw}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: multiplies_instead_of_divides (multiplies by lw where dividing was required)",
  "B": "Student makes misconception: numerator_denominator_swap (builds the fraction upside down, dividing lw by V)",
  "C": "Correct: divides both sides by the whole product lw, which checks back to V",
  "D": "Student makes misconception: wrong_inverse_operation_chosen (subtracts to undo a multiplication)"
},
"misconception_tag": {
  "A": "multiplies_instead_of_divides",
  "B": "numerator_denominator_swap",
  "D": "wrong_inverse_operation_chosen"
}
```

---

**Item 2: Solve $y = mx + b$ for $b$.**

Step 1: The $b$ is added, so subtract the other term.
- $b = y - mx$

Step 2: Check. $mx + (y - mx) = y$. Correct.

**Answer: B** ($b = y - mx$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (adds the mx term instead of subtracting it when moving it across)",
  "B": "Correct: subtracts mx from both sides, and substituting back returns y",
  "C": "Student makes misconception: wrong_inverse_operation_chosen (divides by x to remove a term that is added, not multiplied, to b)",
  "D": "Student makes misconception: multiplies_instead_of_divides (multiplies the terms together rather than undoing an addition)"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "C": "wrong_inverse_operation_chosen",
  "D": "multiplies_instead_of_divides"
}
```

---

**Item 3: Solve $A = \frac{1}{2}bh$ for $b$.**

Step 1: Multiply both sides by 2 to clear the half.
- $2A = bh$

Step 2: Divide by $h$.
- $b = \frac{2A}{h}$

Step 3: Check. $\frac{1}{2} \cdot \frac{2A}{h} \cdot h = A$. Correct.

**Answer: D** ($b = \frac{2A}{h}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_inverse_operation_chosen (divides by 2 to remove a factor of one half, when a half is cleared by multiplying by 2)",
  "B": "Student makes misconception: omits_fractional_factor (drops the one half from the formula entirely, so the 2 never appears)",
  "C": "Student makes misconception: numerator_denominator_swap (builds the fraction upside down)",
  "D": "Correct: multiplies by 2 to clear the half, then divides by h, which checks back to A"
},
"misconception_tag": {
  "A": "wrong_inverse_operation_chosen",
  "B": "omits_fractional_factor",
  "C": "numerator_denominator_swap"
}
```

---

**Item 4: Solve $px + qx = r$ for $x$.**

Step 1: The variable appears twice, so factor it out.
- $x(p + q) = r$

Step 2: Divide by the whole bracket.
- $x = \frac{r}{p + q}$

Step 3: Check. $p \cdot \frac{r}{p+q} + q \cdot \frac{r}{p+q} = \frac{r(p+q)}{p+q} = r$. Correct.

**Answer: C** ($x = \frac{r}{p + q}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: division_distributed_over_sum (applies the false rule that r over p plus q splits into r over p plus r over q)",
  "B": "Student makes misconception: common_factor_not_extracted (never factors, and treats the two coefficients as multiplied when they are added)",
  "C": "Correct: factors x out of both terms, then divides by the whole bracket, which checks back to r",
  "D": "Student makes misconception: wrong_inverse_operation_chosen (subtracts to undo multiplications)"
},
"misconception_tag": {
  "A": "division_distributed_over_sum",
  "B": "common_factor_not_extracted",
  "D": "wrong_inverse_operation_chosen"
}
```
