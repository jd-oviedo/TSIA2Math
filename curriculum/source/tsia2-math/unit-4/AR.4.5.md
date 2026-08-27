---
topic_name: "Simplifying rational expressions"
unit_number: 4
sequence_in_unit: 13
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "AR"
keywords: ["rational expression", "simplifying", "common factor", "cancelling", "excluded values", "factoring"]
---

# AR.4.5 - Simplifying Rational Expressions

**Topic ID:** AR.4.5  
**Unit:** 4  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### You Can Only Cancel Factors

This is the rule the whole topic runs on, and almost every wrong answer here comes from breaking it.

**A factor is something multiplied. A term is something added.** You may cancel factors. You may never cancel terms.

Look at why, with numbers you can check:

$$\frac{2 \cdot 5}{2 \cdot 7} = \frac{5}{7}$$

That works, because the $2$ was multiplying on both top and bottom. Now try it with addition:

$$\frac{2 + 5}{2 + 7} = \frac{7}{9}$$

If you cancelled the $2$'s you would get $\frac{5}{7}$, and $\frac{5}{7}$ is not $\frac{7}{9}$. The cancelling was not allowed, because those $2$'s were terms, not factors.

**So the first move is always to factor.** Until the top and bottom are written as products, nothing can be cancelled at all.

##### Simplifying, Step by Step

$$\frac{x^{2} - 9}{x + 3}$$

Step 1: Factor everything you can. The top is a difference of squares.

$$\frac{(x - 3)(x + 3)}{x + 3}$$

Step 2: Now the $(x + 3)$ on top is a factor and the $(x + 3)$ underneath is a factor, so they cancel.

$$x - 3$$

Step 3: Check with a number. At $x = 1$: the original gives $\frac{1 - 9}{4} = -2$, and $x - 3$ gives $-2$. Agreement.

##### The Mistake That Costs the Most Points

**Cancelling a term instead of a factor.**

$$\frac{x^{2} + 5x}{x} \quad\text{written as}\quad x^{2} + 5$$

The $x$ underneath was cancelled against the $x$ in $5x$ only. But that $5x$ is a **term** of the numerator, not a factor of the whole thing, so it was never available to cancel on its own.

Factor first, and the situation becomes clear:

$$\frac{x(x + 5)}{x} = x + 5$$

**Check with a number and the two answers separate immediately.** At $x = 2$:

- The original: $\frac{4 + 10}{2} = 7$.
- The correct answer $x + 5$: $7$. Agreement.
- The wrong answer $x^{2} + 5$: $9$. Not agreement.

**The habit that prevents it:** never cancel anything until both top and bottom are a single product. If you can still see a plus or minus sign at the top level, you are not ready to cancel.

##### Cancel Each Factor Once

$$\frac{(x - 2)(x + 5)}{(x - 2)(x - 7)}$$

There is one $(x - 2)$ on top and one underneath. They cancel, and that is the end of it:

$$\frac{x + 5}{x - 7}$$

You cannot cancel a factor more times than it actually appears. If the top has one copy and the bottom has two, one pair cancels and one copy remains below.

##### What Cancelling Does Not Do

This is the part of the topic that catches people who have done everything else right.

$$\frac{x - 3}{(x - 3)(x + 1)} = \frac{1}{x + 1}$$

The simplification is correct. But look at the original expression: at $x = 3$ the denominator is $0$, so the original is **undefined** there.

The simplified form $\frac{1}{x + 1}$ does not look undefined at $x = 3$. It gives $\frac{1}{4}$, a perfectly ordinary number.

**Cancelling changed how the expression looks. It did not change what the expression is allowed to eat.**

The value $x = 3$ was excluded before you cancelled, and it stays excluded afterwards. The two expressions agree everywhere except at $x = 3$, where the first is undefined and the second is not, so they are equal only where both are defined.

**Read the restrictions off the original, never off the simplified form.** By the time you have simplified, the evidence has been erased. So the excluded values here are:

$$x \neq 3 \quad\text{and}\quad x \neq -1$$

Both of them. The $x \neq -1$ is visible in the simplified form; the $x \neq 3$ is only visible before you cancel.

##### Only the Bottom Can Break It

A fraction is undefined when its **denominator** is zero. The numerator has nothing to do with it.

$$\frac{x - 4}{x + 6}$$

At $x = 4$ this gives $\frac{0}{10}$, which is $0$. An ordinary answer, not an error. The expression is perfectly defined there.

At $x = -6$ it gives $\frac{-10}{0}$, which is undefined.

**A zero on top is a value. A zero on the bottom is a breakdown.** Setting the numerator to zero finds where the expression equals zero, which is a different question from where it is undefined.

##### Watch the Signs When You Factor

$$\frac{x^{2} - x - 6}{x^{2} - 9}$$

Step 1: Factor both.

$$\frac{(x - 3)(x + 2)}{(x - 3)(x + 3)}$$

Step 2: Cancel the $(x - 3)$.

$$\frac{x + 2}{x + 3}$$

The factoring is where sign errors enter. $x^{2} - x - 6$ factors as $(x - 3)(x + 2)$, not $(x + 3)(x - 2)$. Check by expanding: $(x - 3)(x + 2) = x^{2} + 2x - 3x - 6 = x^{2} - x - 6$. Correct. The other one gives $x^{2} + x - 6$, which has the wrong middle sign and would cancel against nothing.

##### The Five Traps

1. **Cancelling terms instead of factors.** $\frac{x^{2} + 5x}{x}$ is $x + 5$, not $x^{2} + 5$. Factor first, always.
2. **Reading restrictions off the simplified form.** Cancelling hides an exclusion; it never removes one. Go back to the original.
3. **Cancelling a factor more times than it appears.** One copy on top and one underneath cancels one pair, not two.
4. **Setting the numerator to zero to find where it is undefined.** Only the denominator can make a fraction undefined.
5. **Sign errors in the factoring.** $x^{2} - x - 6$ is $(x - 3)(x + 2)$. Expand it back and check before you cancel anything.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Simplify $\dfrac{6x^{3}}{2x}$.
   - A) $3x^{3}$
   - B) $3x^{2}$
   - C) $4x^{2}$
   - D) $3x^{4}$

2. Simplify $\dfrac{x^{2} - 9}{x + 3}$.
   - A) $x^{2} - 3$
   - B) $x + 3$
   - C) $x - 3$
   - D) $x - 9$

3. Simplify $\dfrac{x^{2} + 5x}{x}$.
   - A) $x + 5$
   - B) $x^{2} + 5$
   - C) $5x$
   - D) $x^{2} + 5x$

4. Simplify $\dfrac{x^{2} - 4}{x + 2}$.
   - A) $x^{2} - 2$
   - B) $x + 2$
   - C) $x^{2} - 4$
   - D) $x - 2$

**Proficient Level**

5. Simplify $\dfrac{x^{2} + 7x + 12}{x + 3}$.
   - A) $x^{2} + 4$
   - B) $x + 4$
   - C) $x - 4$
   - D) $x + 12$

6. The expression $\dfrac{x - 5}{(x - 5)(x + 2)}$ simplifies to $\dfrac{1}{x + 2}$. Which values must be excluded from the domain of the original expression?
   - A) $x \neq -2$ only
   - B) $x \neq 5$ only
   - C) $x \neq 5$ and $x \neq -2$
   - D) $x \neq 5$, $x \neq -2$, and $x \neq 0$

7. Simplify $\dfrac{2x^{2} - 8}{x - 2}$.
   - A) $2x + 4$
   - B) $2x - 4$
   - C) $x + 4$
   - D) $2x^{2} - 4$

**Advanced Level**

8. Simplify $\dfrac{x^{2} - x - 6}{x^{2} - 9}$.
   - A) $\dfrac{x - 2}{x - 3}$
   - B) $\dfrac{x + 2}{x - 3}$
   - C) $\dfrac{1}{x + 3}$
   - D) $\dfrac{x + 2}{x + 3}$

9. The expression $\dfrac{x + 4}{(x + 4)(x - 1)}$ simplifies to $\dfrac{1}{x - 1}$. Which values must be excluded from the domain of the original expression?
   - A) $x \neq 1$ only
   - B) $x \neq -4$ and $x \neq 1$
   - C) $x \neq 4$ and $x \neq 1$
   - D) $x \neq -4$ only

10. Simplify $\dfrac{3x^{2} + 6x}{x^{2} - 4}$.
    - A) $\dfrac{3x}{x + 2}$
    - B) $\dfrac{3x + 6}{x - 4}$
    - C) $\dfrac{3x}{x - 2}$
    - D) $3x^{2} + 6$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Simplify $\dfrac{10x^{4}}{5x^{2}}$.

- A) $2x^{6}$
- B) $2x^{2}$
- C) $5x^{2}$
- D) $2x^{4}$

**Item 2**

Simplify $\dfrac{x^{2} - 16}{x - 4}$.

- A) $x + 4$
- B) $x - 4$
- C) $x^{2} - 4$
- D) $x - 16$

**Advanced Level**

**Item 3**

Simplify $\dfrac{x^{2} + 3x}{x^{2} - 9}$.

- A) $\dfrac{x + 3}{x - 9}$
- B) $\dfrac{1}{x - 3}$
- C) $\dfrac{x}{x - 3}$
- D) $\dfrac{x}{x + 3}$

**Proficient Level**

**Item 4**

The expression $\dfrac{x - 7}{(x - 7)(x + 1)}$ simplifies to $\dfrac{1}{x + 1}$. Which values must be excluded from the domain of the original expression?

- A) $x \neq -1$ only
- B) $x \neq 7$ only
- C) $x \neq -7$ and $x \neq -1$
- D) $x \neq 7$ and $x \neq -1$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Simplify $\dfrac{6x^{3}}{2x}$.**

Step 1: Both top and bottom are already single products, so nothing needs factoring.

Step 2: Divide the coefficients. $6 \div 2 = 3$.

Step 3: Cancel the $x$'s. Three on top, one underneath, so two remain.

$$3x^{2}$$

**Answer: B** ($3x^{2}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: term_level_cancellation (divides the coefficients but never cancels the x underneath, leaving the exponent untouched at 3)",
  "B": "Correct: 6 divided by 2 gives 3, and three x's over one x leaves x squared",
  "C": "Student makes misconception: term_level_cancellation (subtracts the coefficients as 6 minus 2 = 4 rather than dividing them, while cancelling the variable correctly)",
  "D": "Student makes misconception: over_cancellation (adds the x from the denominator to the numerator's count rather than cancelling it away, giving four x's where two remain)"
},
"misconception_tag": {
  "A": "term_level_cancellation",
  "C": "term_level_cancellation",
  "D": "over_cancellation"
}
```

---

**2. Simplify $\dfrac{x^{2} - 9}{x + 3}$.**

Step 1: Factor the numerator. It is a difference of squares. $(x - 3)(x + 3)$.

Step 2: The $(x + 3)$ appears as a factor on both top and bottom, so it cancels.

$$x - 3$$

Step 3: Check at $x = 1$. The original gives $\frac{-8}{4} = -2$, and $1 - 3 = -2$. Agreement.

**Answer: C** ($x - 3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: term_level_cancellation (cancels the 9 against the 3 and the x against the x without factoring first; at x = 1 this gives -2 for the original but -2 for x squared minus 3 only by coincidence, and at x = 2 the original gives -1 while this gives 1)",
  "B": "Student makes misconception: wrong_sign_on_factor (factors the numerator as (x + 3)(x + 3), so the surviving factor comes out as x + 3; expanding that gives x squared plus 6x plus 9, not x squared minus 9)",
  "C": "Correct: the numerator factors as (x - 3)(x + 3) and the (x + 3) cancels, leaving x - 3",
  "D": "Student makes misconception: term_level_cancellation (cancels the x on top against the x underneath and keeps the -9, treating terms as though they were factors)"
},
"misconception_tag": {
  "A": "term_level_cancellation",
  "B": "wrong_sign_on_factor",
  "D": "term_level_cancellation"
}
```

---

**3. Simplify $\dfrac{x^{2} + 5x}{x}$.**

Step 1: Factor the numerator. Both terms share an $x$. $x(x + 5)$.

Step 2: The $x$ is now a factor on both top and bottom, so it cancels.

$$x + 5$$

Step 3: Check at $x = 2$. The original gives $\frac{4 + 10}{2} = 7$, and $2 + 5 = 7$. Agreement.

**Answer: A** ($x + 5$)

```json
"distractor_logic": {
  "A": "Correct: factoring gives x times (x + 5), and the x cancels against the denominator",
  "B": "Student makes misconception: term_level_cancellation (cancels the denominator's x against the x inside the term 5x only, which is a term of the numerator rather than a factor of it; at x = 2 this gives 9 where the original gives 7)",
  "C": "Student makes misconception: term_level_cancellation (cancels the denominator's x against the x squared and keeps the 5x, again treating a term as a factor)",
  "D": "Student makes misconception: over_cancellation (concludes nothing can cancel and leaves the expression as it was, when the shared factor x is genuinely available after factoring)"
},
"misconception_tag": {
  "B": "term_level_cancellation",
  "C": "term_level_cancellation",
  "D": "over_cancellation"
}
```

---

**4. Simplify $\dfrac{x^{2} - 4}{x + 2}$.**

Step 1: Factor the numerator as a difference of squares. $(x - 2)(x + 2)$.

Step 2: Cancel the $(x + 2)$.

$$x - 2$$

Step 3: Check at $x = 0$. The original gives $\frac{-4}{2} = -2$, and $0 - 2 = -2$. Agreement.

**Answer: D** ($x - 2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: term_level_cancellation (cancels the x against the x and the 4 against the 2 without factoring, leaving x squared minus 2)",
  "B": "Student makes misconception: wrong_sign_on_factor (factors as (x + 2)(x + 2) so the surviving factor is x + 2; expanding that gives x squared plus 4x plus 4, not x squared minus 4)",
  "C": "Student makes misconception: over_cancellation (concludes the denominator cancels away entirely and returns the numerator unchanged)",
  "D": "Correct: the numerator factors as (x - 2)(x + 2) and the (x + 2) cancels"
},
"misconception_tag": {
  "A": "term_level_cancellation",
  "B": "wrong_sign_on_factor",
  "C": "over_cancellation"
}
```

---

**Proficient Level**

**5. Simplify $\dfrac{x^{2} + 7x + 12}{x + 3}$.**

Step 1: Factor the numerator. Two numbers multiplying to $12$ and adding to $7$ are $3$ and $4$.

$$\frac{(x + 3)(x + 4)}{x + 3}$$

Step 2: Cancel the $(x + 3)$.

$$x + 4$$

Step 3: Check at $x = 0$. The original gives $\frac{12}{3} = 4$, and $0 + 4 = 4$. Agreement.

**Answer: B** ($x + 4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: term_level_cancellation (cancels the 7x against the x and the 12 against the 3 without factoring, leaving x squared plus 4)",
  "B": "Correct: the numerator factors as (x + 3)(x + 4) and the (x + 3) cancels",
  "C": "Student makes misconception: wrong_sign_on_factor (factors as (x + 3)(x - 4), so the surviving factor is x - 4; expanding that gives x squared minus x minus 12, not the numerator given)",
  "D": "Student makes misconception: term_level_cancellation (cancels only the x on top against the denominator's x and keeps the 12, treating terms as factors)"
},
"misconception_tag": {
  "A": "term_level_cancellation",
  "C": "wrong_sign_on_factor",
  "D": "term_level_cancellation"
}
```

---

**6. The expression $\dfrac{x - 5}{(x - 5)(x + 2)}$ simplifies to $\dfrac{1}{x + 2}$. Which values must be excluded from the domain of the original expression?**

Step 1: Read the restrictions off the **original**, before any cancelling. Its denominator is $(x - 5)(x + 2)$.

Step 2: Set each factor to zero. $x - 5 = 0$ gives $5$, and $x + 2 = 0$ gives $-2$.

Step 3: Both values make the original denominator zero, so both are excluded.

$$x \neq 5 \quad\text{and}\quad x \neq -2$$

The simplified form hides the first one. At $x = 5$ it gives $\frac{1}{7}$, an ordinary number, but the original is undefined there. Cancelling changed the appearance, not the domain.

**Answer: C** ($x \neq 5$ and $x \neq -2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: restriction_read_from_simplified_form (reads the restriction off 1 over (x + 2), which shows only the x = -2 exclusion; the cancelled factor's exclusion at x = 5 is invisible there but still applies to the original)",
  "B": "Student makes misconception: numerator_zeros_confused_with_undefined (sets the numerator x - 5 to zero and reports that value alone; a zero numerator makes the expression equal zero, not undefined, and here x = 5 is excluded for the separate reason that it also zeros the denominator)",
  "C": "Correct: the original denominator (x - 5)(x + 2) is zero at 5 and at -2, and cancelling does not restore either value",
  "D": "Student makes misconception: over_cancellation (adds x = 0 as a third exclusion, treating the 1 left in the numerator after cancelling as though it had produced a factor of x that could be zero)"
},
"misconception_tag": {
  "A": "restriction_read_from_simplified_form",
  "B": "numerator_zeros_confused_with_undefined",
  "D": "over_cancellation"
}
```

---

**7. Simplify $\dfrac{2x^{2} - 8}{x - 2}$.**

Step 1: Factor the numerator. Take out the common factor $2$ first. $2(x^{2} - 4)$.

Step 2: The bracket is a difference of squares. $2(x - 2)(x + 2)$.

Step 3: Cancel the $(x - 2)$.

$$2(x + 2) = 2x + 4$$

Step 4: Check at $x = 0$. The original gives $\frac{-8}{-2} = 4$, and $2(0) + 4 = 4$. Agreement.

**Answer: A** ($2x + 4$)

```json
"distractor_logic": {
  "A": "Correct: factoring gives 2(x - 2)(x + 2), the (x - 2) cancels, and 2(x + 2) is 2x + 4",
  "B": "Student makes misconception: wrong_sign_on_factor (cancels the (x + 2) instead of the (x - 2), leaving 2(x - 2); at x = 0 this gives -4 where the original gives 4)",
  "C": "Student makes misconception: over_cancellation (cancels the common factor 2 against the denominator as well as the binomial, losing the coefficient that no factor underneath could remove)",
  "D": "Student makes misconception: term_level_cancellation (cancels the x in the denominator against the x squared term and the 2 against the 8 without factoring first)"
},
"misconception_tag": {
  "B": "wrong_sign_on_factor",
  "C": "over_cancellation",
  "D": "term_level_cancellation"
}
```

---

**Advanced Level**

**8. Simplify $\dfrac{x^{2} - x - 6}{x^{2} - 9}$.**

Step 1: Factor the numerator. Two numbers multiplying to $-6$ and adding to $-1$ are $-3$ and $2$.

$$\frac{(x - 3)(x + 2)}{x^{2} - 9}$$

Step 2: Factor the denominator as a difference of squares. $(x - 3)(x + 3)$.

Step 3: Cancel the $(x - 3)$.

$$\frac{x + 2}{x + 3}$$

Step 4: Check at $x = 0$. The original gives $\frac{-6}{-9} = \frac{2}{3}$, and $\frac{0 + 2}{0 + 3} = \frac{2}{3}$. Agreement.

**Answer: D** ($\frac{x + 2}{x + 3}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_sign_on_factor (factors the numerator as (x + 3)(x - 2), which expands to x squared plus x minus 6 rather than x squared minus x minus 6, so the wrong pair of factors survives)",
  "B": "Student makes misconception: wrong_sign_on_factor (factors the denominator as (x + 3)(x - 3) but cancels the (x + 3), leaving x - 3 underneath where x + 3 belongs)",
  "C": "Student makes misconception: over_cancellation (cancels the (x - 3) and also cancels the (x + 2) against the (x + 3) as though near-matching factors could be removed, leaving 1 on top)",
  "D": "Correct: both factor as (x - 3)(x + 2) over (x - 3)(x + 3), and the (x - 3) cancels"
},
"misconception_tag": {
  "A": "wrong_sign_on_factor",
  "B": "wrong_sign_on_factor",
  "C": "over_cancellation"
}
```

---

**9. The expression $\dfrac{x + 4}{(x + 4)(x - 1)}$ simplifies to $\dfrac{1}{x - 1}$. Which values must be excluded from the domain of the original expression?**

Step 1: Read the restrictions off the original denominator, $(x + 4)(x - 1)$.

Step 2: Set each factor to zero. $x + 4 = 0$ gives $-4$, and $x - 1 = 0$ gives $1$.

$$x \neq -4 \quad\text{and}\quad x \neq 1$$

Step 3: Confirm the hidden one. At $x = -4$ the original gives $\frac{0}{0}$, which is undefined, while the simplified form gives $\frac{1}{-5}$. The exclusion survives the cancelling even though the simplified form no longer shows it.

**Answer: B** ($x \neq -4$ and $x \neq 1$)

```json
"distractor_logic": {
  "A": "Student makes misconception: restriction_read_from_simplified_form (reads the restriction off 1 over (x - 1), which shows only x = 1; the cancelled factor's exclusion at x = -4 has been erased from view but not from the original)",
  "B": "Correct: the original denominator is zero at -4 and at 1, and cancelling restores neither",
  "C": "Student makes misconception: wrong_sign_on_factor (solves x + 4 = 0 as x = 4 rather than x = -4, reading the sign straight off the factor instead of solving it)",
  "D": "Student makes misconception: numerator_zeros_confused_with_undefined (reports only the value that zeros the numerator x + 4 and ignores the x - 1 factor underneath, which excludes 1 as well)"
},
"misconception_tag": {
  "A": "restriction_read_from_simplified_form",
  "C": "wrong_sign_on_factor",
  "D": "numerator_zeros_confused_with_undefined"
}
```

---

**10. Simplify $\dfrac{3x^{2} + 6x}{x^{2} - 4}$.**

Step 1: Factor the numerator. Both terms share $3x$. $3x(x + 2)$.

Step 2: Factor the denominator as a difference of squares. $(x - 2)(x + 2)$.

Step 3: Cancel the $(x + 2)$.

$$\frac{3x}{x - 2}$$

Step 4: Check at $x = 1$. The original gives $\frac{3 + 6}{1 - 4} = \frac{9}{-3} = -3$, and $\frac{3}{1 - 2} = -3$. Agreement.

**Answer: C** ($\frac{3x}{x - 2}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_sign_on_factor (cancels the (x - 2) instead of the (x + 2), leaving x + 2 underneath; at x = 1 this gives 1 where the original gives -3)",
  "B": "Student makes misconception: term_level_cancellation (cancels the x squared terms against each other without factoring, leaving 3x + 6 over x - 4)",
  "C": "Correct: 3x(x + 2) over (x - 2)(x + 2), and the (x + 2) cancels",
  "D": "Student makes misconception: over_cancellation (cancels the whole denominator away and returns the numerator, treating the shared (x + 2) as though it removed both factors underneath)"
},
"misconception_tag": {
  "A": "wrong_sign_on_factor",
  "B": "term_level_cancellation",
  "D": "over_cancellation"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Simplify $\dfrac{10x^{4}}{5x^{2}}$.**

Step 1: Divide the coefficients. $10 \div 5 = 2$.

Step 2: Cancel the $x$'s. Four on top, two underneath, so two remain.

$$2x^{2}$$

**Answer: B** ($2x^{2}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: over_cancellation (adds the denominator's exponent to the numerator's rather than cancelling it away, giving 4 plus 2 = 6)",
  "B": "Correct: the coefficients give 2, and four x's over two x's leaves x squared",
  "C": "Student makes misconception: term_level_cancellation (subtracts the coefficients as 10 minus 5 = 5 rather than dividing them, while handling the variable correctly)",
  "D": "Student makes misconception: term_level_cancellation (divides the coefficients but never cancels the denominator's x squared, leaving the exponent at 4)"
},
"misconception_tag": {
  "A": "over_cancellation",
  "C": "term_level_cancellation",
  "D": "term_level_cancellation"
}
```

---

**Item 2: Simplify $\dfrac{x^{2} - 16}{x - 4}$.**

Step 1: Factor the numerator as a difference of squares. $(x - 4)(x + 4)$.

Step 2: Cancel the $(x - 4)$.

$$x + 4$$

Step 3: Check at $x = 0$. The original gives $\frac{-16}{-4} = 4$, and $0 + 4 = 4$. Agreement.

**Answer: A** ($x + 4$)

```json
"distractor_logic": {
  "A": "Correct: the numerator factors as (x - 4)(x + 4) and the (x - 4) cancels",
  "B": "Student makes misconception: wrong_sign_on_factor (cancels the (x + 4) instead of the (x - 4), leaving x - 4; at x = 0 this gives -4 where the original gives 4)",
  "C": "Student makes misconception: term_level_cancellation (cancels the x against the x without factoring and keeps the constants, giving x squared minus 4)",
  "D": "Student makes misconception: term_level_cancellation (cancels only the x terms and leaves the -16 untouched, treating terms as factors)"
},
"misconception_tag": {
  "B": "wrong_sign_on_factor",
  "C": "term_level_cancellation",
  "D": "term_level_cancellation"
}
```

---

**Item 3: Simplify $\dfrac{x^{2} + 3x}{x^{2} - 9}$.**

Step 1: Factor the numerator. Both terms share an $x$. $x(x + 3)$.

Step 2: Factor the denominator as a difference of squares. $(x - 3)(x + 3)$.

Step 3: Cancel the $(x + 3)$.

$$\frac{x}{x - 3}$$

Step 4: Check at $x = 1$. The original gives $\frac{4}{-8} = -\frac{1}{2}$, and $\frac{1}{-2} = -\frac{1}{2}$. Agreement.

**Answer: C** ($\frac{x}{x - 3}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: term_level_cancellation (cancels the x squared terms against each other without factoring, leaving x + 3 over x - 9)",
  "B": "Student makes misconception: over_cancellation (cancels the (x + 3) and also cancels the x on top against nothing underneath, leaving 1 where 3x's worth of numerator remains)",
  "C": "Correct: x(x + 3) over (x - 3)(x + 3), and the (x + 3) cancels",
  "D": "Student makes misconception: wrong_sign_on_factor (cancels the (x - 3) instead of the (x + 3), leaving x + 3 underneath; at x = 1 this gives one quarter where the original gives negative one half)"
},
"misconception_tag": {
  "A": "term_level_cancellation",
  "B": "over_cancellation",
  "D": "wrong_sign_on_factor"
}
```

---

**Item 4: The expression $\dfrac{x - 7}{(x - 7)(x + 1)}$ simplifies to $\dfrac{1}{x + 1}$. Which values must be excluded from the domain of the original expression?**

Step 1: Read the restrictions off the original denominator, $(x - 7)(x + 1)$.

Step 2: Set each factor to zero. $x - 7 = 0$ gives $7$, and $x + 1 = 0$ gives $-1$.

$$x \neq 7 \quad\text{and}\quad x \neq -1$$

**Answer: D** ($x \neq 7$ and $x \neq -1$)

```json
"distractor_logic": {
  "A": "Student makes misconception: restriction_read_from_simplified_form (reads the restriction off 1 over (x + 1), which shows only x = -1; the exclusion at x = 7 was erased by the cancelling but still applies to the original)",
  "B": "Student makes misconception: numerator_zeros_confused_with_undefined (reports only the value that zeros the numerator x - 7, ignoring the x + 1 factor underneath)",
  "C": "Student makes misconception: wrong_sign_on_factor (reads the constants straight out of the factors as -7 and -1 rather than solving each factor for zero, which gives 7 and -1)",
  "D": "Correct: the original denominator is zero at 7 and at -1, and cancelling restores neither value"
},
"misconception_tag": {
  "A": "restriction_read_from_simplified_form",
  "B": "numerator_zeros_confused_with_undefined",
  "C": "wrong_sign_on_factor"
}
```
