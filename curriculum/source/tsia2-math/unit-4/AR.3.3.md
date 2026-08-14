---
topic_name: "Solving quadratic equations by factoring"
unit_number: 4
sequence_in_unit: 4
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "AR"
keywords: ["quadratic equation", "solving", "factoring", "zero product property", "roots", "standard form"]
---

# AR.3.3 - Solving Quadratic Equations by Factoring

**Topic ID:** AR.3.3  
**Unit:** 4  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Factoring Was the Setup. This Is the Payoff.

AR.3.1 and AR.3.2 taught you to turn a quadratic **expression** into a product of brackets. On its own that is just rewriting.

Here is what it was for. Once you have a product equal to zero, you can read off the solutions almost instantly, because of one fact about multiplication that has no equal for any other number:

**If two things multiply to zero, at least one of them is zero.**

If $A \times B = 0$, then $A = 0$ or $B = 0$. There is no third option. Two non-zero numbers cannot multiply to give zero.

That is called the **zero product property**, and it is the entire engine of this topic.

---

##### Zero on One Side, Always

The property only works against **zero**. This is not a technicality, it is the most common place students lose the whole problem.

If $A \times B = 12$, you know nothing useful. $A$ could be $12$, or $3$, or $\frac{1}{2}$, or anything at all, with $B$ adjusting to match. There is no list of cases to check.

So **before you factor anything, get one side to zero.**

$$x^{2} + 5x = 6 \quad \Rightarrow \quad x^{2} + 5x - 6 = 0$$

Notice the $6$ became $-6$ when it crossed. Move it, do not copy it.

**Only once the right side reads $0$ does factoring buy you anything.**

---

##### From Factors to Solutions

Once you have brackets equal to zero, set each bracket to zero separately and solve.

**Example 1:** Solve $(x - 3)(x + 5) = 0$.

Step 1: The product is zero, so one of the two brackets must be zero.

Step 2: Set each to zero.
- $x - 3 = 0$
- $x + 5 = 0$

Step 3: Solve each one.
- $x = 3$
- $x = -5$

Step 4: Check both in the original. At $x = 3$: $(0)(8) = 0$. At $x = -5$: $(-8)(0) = 0$. Both work.

Solutions: $x = 3$ and $x = -5$.

**Look hard at Step 3.** The bracket says $x - 3$ and the solution is $+3$. The bracket says $x + 5$ and the solution is $-5$. **The solution is the opposite of the number you see.** Every single time.

---

##### Factor First, Then Solve

Most questions hand you the quadratic unfactored. Then it is two jobs: factor, then apply the zero product property.

**Example 2:** Solve $x^{2} - 7x + 12 = 0$.

Step 1: The right side is already zero. Good.

Step 2: Factor. Two numbers multiplying to $12$ and adding to $-7$: both negative, so $-3$ and $-4$.
- $(x - 3)(x - 4) = 0$

Step 3: Set each bracket to zero and solve.
- $x - 3 = 0$ gives $x = 3$
- $x - 4 = 0$ gives $x = 4$

Step 4: Check. $3^{2} - 7(3) + 12 = 9 - 21 + 12 = 0$. And $4^{2} - 7(4) + 12 = 16 - 28 + 12 = 0$. Both work.

Solutions: $x = 3$ and $x = 4$.

**Example 3:** Solve $x^{2} + 5x = 6$.

Step 1: The right side is not zero. Move the $6$ across.
- $x^{2} + 5x - 6 = 0$

Step 2: Factor. Two numbers multiplying to $-6$ and adding to $5$: $6$ and $-1$.
- $(x + 6)(x - 1) = 0$

Step 3: Solve each bracket.
- $x = -6$ and $x = 1$

Step 4: Check in the **original** equation. At $x = -6$: $36 - 30 = 6$. Correct. At $x = 1$: $1 + 5 = 6$. Correct.

Solutions: $x = -6$ and $x = 1$.

Two wrong answers live on a problem shaped like this. A student who never moves the $6$ might read the coefficients $5$ and $6$ straight off and answer $x = 5$ and $x = 6$. Another might move the $6$ but keep it positive, factoring $x^{2} + 5x + 6$ into $(x + 2)(x + 3)$ and answering $x = -2$ and $x = -3$. **Neither of those satisfies the original equation, and substituting takes ten seconds.**

---

##### The Mistake That Costs the Most Points

Read this section twice.

**Do not read the numbers out of the brackets. Solve for them.**

Given $(x + 2)(x - 9) = 0$, the numbers you can see are $2$ and $-9$. The solutions are $-2$ and $9$. **Both signs are the other way around.**

It happens because the brackets look like they are already telling you the answer, and in a sense they are, just upside down. The factored form is built to make the expression zero, so the solution has to undo whatever the bracket does.

The fix is mechanical and takes no thought. **Write the little equation.**

- $x + 2 = 0$, so $x = -2$
- $x - 9 = 0$, so $x = 9$

Two lines. Do not do it in your head, because doing it in your head is exactly what produces $2$ and $-9$.

And then check. Substituting $x = 2$ into $(x + 2)(x - 9)$ gives $(4)(-7) = -28$, which is not zero, so $2$ was never a solution.

---

##### When the Bracket Has a Coefficient

If a bracket looks like $2x - 3$ rather than $x - 3$, the same method applies, but the last step needs a division.

**Example 4:** Solve $2x^{2} - 5x - 3 = 0$.

Step 1: Factor. The leading coefficient $2$ splits as $2 \times 1$, and $-3$ as $1 \times -3$ or $-1 \times 3$. Expanding to check, $(2x + 1)(x - 3) = 2x^{2} - 6x + x - 3 = 2x^{2} - 5x - 3$. Correct.
- $(2x + 1)(x - 3) = 0$

Step 2: Set each bracket to zero.
- $2x + 1 = 0$
- $x - 3 = 0$

Step 3: Solve each. The first one needs two moves, not one.
- $2x = -1$, then $x = -\frac{1}{2}$
- $x = 3$

Step 4: Check the fraction, since that is the one people doubt. $2\left(-\frac{1}{2}\right)^{2} - 5\left(-\frac{1}{2}\right) - 3 = 2\left(\frac{1}{4}\right) + \frac{5}{2} - 3 = \frac{1}{2} + \frac{5}{2} - 3 = 0$. Correct.

Solutions: $x = -\frac{1}{2}$ and $x = 3$.

**The coefficient does not vanish.** A student who reads $2x + 1 = 0$ and answers $x = -1$ has divided by nothing. Substituting $-1$ gives $2 + 5 - 3 = 4$, not zero.

---

##### A Perfect Square Has One Solution, Not None

When the quadratic is a perfect square trinomial, both brackets are the same, so both give the same answer. You get **one** solution, not two.

**Example 5:** Solve $x^{2} - 6x + 9 = 0$.

Step 1: Factor. This is a perfect square: $(x - 3)(x - 3) = 0$.

Step 2: Both brackets give the same equation.
- $x - 3 = 0$, so $x = 3$

Step 3: Check. $9 - 18 + 9 = 0$. Correct.

Solution: $x = 3$.

Two different wrong answers show up here, and they pull in opposite directions.

**"There are no real solutions."** This confuses $x^{2} - 6x + 9$ with something like $x^{2} + 9$, which genuinely does not factor over the real numbers. But $x^{2} - 6x + 9$ has a middle term and factors perfectly well. **A middle term means look for a perfect square before you give up.**

**"$x = 3$ and $x = -3$."** This treats it as a difference of squares. But $(x - 3)(x + 3)$ expands to $x^{2} - 9$, which is not the equation you were given. Substituting $x = -3$ gives $9 + 18 + 9 = 36$, not zero.

---

##### The Five Traps

1. **Factoring before the right side is zero.** $x(x - 5) = 24$ does not give $x = 0$ or $x = 5$. Move the $24$ first.
2. **Reading the numbers straight out of the brackets.** $(x + 2)(x - 9) = 0$ gives $-2$ and $9$, not $2$ and $-9$. Write the little equation.
3. **Dropping a leading coefficient.** $2x + 1 = 0$ gives $x = -\frac{1}{2}$, not $x = -1$. Divide.
4. **Calling a perfect square unsolvable.** $x^{2} - 6x + 9 = 0$ has the solution $x = 3$. A middle term means it is not a bare sum of squares.
5. **Turning a perfect square into a plus-or-minus pair.** $(x - 3)^{2} = 0$ gives only $x = 3$. The $\pm$ belongs to difference of squares, not to this.

Every one of these is caught by substituting your answer into the original equation. When you miss a problem below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. What are the solutions of $(x - 3)(x + 5) = 0$?
   - A) $x = 3$ and $x = -5$
   - B) $x = -3$ and $x = 5$
   - C) $x = 3$ and $x = 5$
   - D) $x = -3$ and $x = -5$

2. What are the solutions of $x^{2} - 7x + 12 = 0$?
   - A) $x = -3$ and $x = -4$
   - B) $x = 3$ and $x = 4$
   - C) $x = 3$ and $x = -4$
   - D) $x = -3$ and $x = 4$

3. What are the solutions of $x^{2} + 5x = 6$?
   - A) $x = -6$ and $x = 1$
   - B) $x = 6$ and $x = -1$
   - C) $x = 5$ and $x = 6$
   - D) $x = -2$ and $x = -3$

4. What are the solutions of $(2x - 6)(x + 1) = 0$?
   - A) $x = 6$ and $x = -1$
   - B) $x = 3$ and $x = -1$
   - C) $x = -3$ and $x = 1$
   - D) $x = -6$ and $x = 1$

**Proficient Level** (these require an extra step)

5. What are the solutions of $2x^{2} - 5x - 3 = 0$?
   - A) $x = -1$ and $x = 3$
   - B) $x = -\frac{1}{2}$ and $x = 3$
   - C) $x = \frac{1}{2}$ and $x = -3$
   - D) $x = 1$ and $x = -3$

6. What is the solution of $x^{2} - 6x + 9 = 0$?
   - A) There are no real solutions
   - B) $x = -3$
   - C) $x = 3$
   - D) $x = 3$ and $x = -3$

7. What are the solutions of $x^{2} = 4x + 21$?
   - A) $x = 4$ and $x = 21$
   - B) $x = -7$ and $x = 3$
   - C) $x = 7$ and $x = -3$
   - D) $x = 7$ and $x = 3$

**Advanced Level** (these need multiple steps or reverse thinking)

8. What are the solutions of $3x^{2} + 11x - 4 = 0$?
   - A) $x = 1$ and $x = -4$
   - B) $x = -\frac{1}{3}$ and $x = 4$
   - C) $x = \frac{1}{3}$ and $x = -4$
   - D) $x = -1$ and $x = 4$

9. What is the solution of $4x^{2} + 12x + 9 = 0$?
   - A) There are no real solutions
   - B) $x = -3$
   - C) $x = \frac{3}{2}$ and $x = -\frac{3}{2}$
   - D) $x = -\frac{3}{2}$

10. What are the solutions of $x(x - 5) = 24$?
    - A) $x = 0$ and $x = 5$
    - B) $x = -8$ and $x = 3$
    - C) $x = 8$ and $x = 3$
    - D) $x = 8$ and $x = -3$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

What are the solutions of $(x + 2)(x - 9) = 0$?

- A) $x = 2$ and $x = -9$
- B) $x = -2$ and $x = 9$
- C) $x = -2$ and $x = -9$
- D) $x = 2$ and $x = 9$

**Item 2**

What is the solution of $x^{2} - 10x + 25 = 0$?

- A) $x = 5$
- B) There are no real solutions
- C) $x = -5$
- D) $x = 5$ and $x = -5$

**Item 3**

What are the solutions of $x^{2} + 3x = 10$?

- A) $x = 3$ and $x = 10$
- B) $x = 5$ and $x = -2$
- C) $x = -5$ and $x = 2$
- D) $x = -5$ and $x = -2$

**Item 4**

What are the solutions of $2x^{2} - 7x + 3 = 0$?

- A) $x = -\frac{1}{2}$ and $x = -3$
- B) $x = 1$ and $x = 3$
- C) $x = -1$ and $x = -3$
- D) $x = \frac{1}{2}$ and $x = 3$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. What are the solutions of $(x - 3)(x + 5) = 0$?**

Step 1: The product is zero, so one bracket must be zero.

Step 2: Set each to zero and solve.
- $x - 3 = 0$ gives $x = 3$
- $x + 5 = 0$ gives $x = -5$

Step 3: Check. At $x = 3$: $(0)(8) = 0$. At $x = -5$: $(-8)(0) = 0$. Both work.

**Answer: A** ($x = 3$ and $x = -5$)

```json
"distractor_logic": {
  "A": "Correct: x - 3 = 0 gives 3 and x + 5 = 0 gives -5, and each makes one bracket zero",
  "B": "Student makes misconception: factor_constants_read_as_roots (reads -3 and 5 straight out of the brackets without solving; substituting -3 gives the product of -6 and 2, which is -12 rather than 0)",
  "C": "Student makes misconception: wrong_sign_on_factor (solves the first bracket correctly but keeps the 5 positive; substituting 5 gives the product of 2 and 10, which is 20 rather than 0)",
  "D": "Student makes misconception: wrong_sign_on_factor (flips the sign on both brackets, so the first solution comes out negative; substituting -3 gives -12 rather than 0)"
},
"misconception_tag": {
  "B": "factor_constants_read_as_roots",
  "C": "wrong_sign_on_factor",
  "D": "wrong_sign_on_factor"
}
```

---

**2. What are the solutions of $x^{2} - 7x + 12 = 0$?**

Step 1: The right side is already zero.

Step 2: Factor. Two numbers multiplying to $12$ and adding to $-7$ are $-3$ and $-4$.
- $(x - 3)(x - 4) = 0$

Step 3: Solve each bracket.
- $x = 3$ and $x = 4$

Step 4: Check. $9 - 21 + 12 = 0$ and $16 - 28 + 12 = 0$. Both work.

**Answer: B** ($x = 3$ and $x = 4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: factor_constants_read_as_roots (reads -3 and -4 out of the brackets without flipping their signs; substituting -3 gives 9 plus 21 plus 12, which is 42 rather than 0)",
  "B": "Correct: the expression factors as (x - 3)(x - 4), and each bracket set to zero gives 3 and 4",
  "C": "Student makes misconception: wrong_sign_on_factor (takes the second solution as negative; substituting -4 gives 16 plus 28 plus 12, which is 56 rather than 0)",
  "D": "Student makes misconception: wrong_sign_on_factor (takes the first solution as negative; substituting -3 gives 42 rather than 0)"
},
"misconception_tag": {
  "A": "factor_constants_read_as_roots",
  "C": "wrong_sign_on_factor",
  "D": "wrong_sign_on_factor"
}
```

---

**3. What are the solutions of $x^{2} + 5x = 6$?**

Step 1: The right side is not zero. Move the $6$ across, changing its sign.
- $x^{2} + 5x - 6 = 0$

Step 2: Factor. Two numbers multiplying to $-6$ and adding to $5$ are $6$ and $-1$.
- $(x + 6)(x - 1) = 0$

Step 3: Solve each bracket.
- $x = -6$ and $x = 1$

Step 4: Check in the original. At $x = -6$: $36 - 30 = 6$. At $x = 1$: $1 + 5 = 6$. Both work.

**Answer: A** ($x = -6$ and $x = 1$)

```json
"distractor_logic": {
  "A": "Correct: moving the 6 gives x squared plus 5x minus 6, which factors as (x + 6)(x - 1) for solutions -6 and 1",
  "B": "Student makes misconception: factor_constants_read_as_roots (reads 6 and -1 out of the brackets without flipping the signs; substituting 6 gives 36 plus 30, which is 66 rather than 6)",
  "C": "Student makes misconception: not_rearranged_to_standard_form (never moves the 6, and reads the coefficients 5 and 6 off the equation as the solutions; substituting 5 gives 25 plus 25, which is 50 rather than 6)",
  "D": "Student makes misconception: not_rearranged_to_standard_form (moves the 6 but leaves it positive, factoring x squared plus 5x plus 6 as (x + 2)(x + 3); substituting -2 gives 4 minus 10, which is -6 rather than 6)"
},
"misconception_tag": {
  "B": "factor_constants_read_as_roots",
  "C": "not_rearranged_to_standard_form",
  "D": "not_rearranged_to_standard_form"
}
```

---

**4. What are the solutions of $(2x - 6)(x + 1) = 0$?**

Step 1: Set each bracket to zero.
- $2x - 6 = 0$
- $x + 1 = 0$

Step 2: Solve each. The first needs a division.
- $2x = 6$, so $x = 3$
- $x = -1$

Step 3: Check. At $x = 3$: $(0)(4) = 0$. At $x = -1$: $(-8)(0) = 0$. Both work.

**Answer: B** ($x = 3$ and $x = -1$)

```json
"distractor_logic": {
  "A": "Student makes misconception: leading_coefficient_ignored_in_root (solves 2x - 6 = 0 as x = 6 without dividing by the 2; substituting 6 gives the product of 6 and 7, which is 42 rather than 0)",
  "B": "Correct: 2x - 6 = 0 gives x = 3 after dividing by 2, and x + 1 = 0 gives x = -1",
  "C": "Student makes misconception: wrong_sign_on_factor (flips the sign on both solutions; substituting -3 gives the product of -12 and -2, which is 24 rather than 0)",
  "D": "Student makes misconception: factor_constants_read_as_roots (reads the constants -6 and 1 straight out of the brackets; substituting -6 gives the product of -18 and -5, which is 90 rather than 0)"
},
"misconception_tag": {
  "A": "leading_coefficient_ignored_in_root",
  "C": "wrong_sign_on_factor",
  "D": "factor_constants_read_as_roots"
}
```

---

**Proficient Level**

**5. What are the solutions of $2x^{2} - 5x - 3 = 0$?**

Step 1: Factor. Expanding to check, $(2x + 1)(x - 3) = 2x^{2} - 6x + x - 3 = 2x^{2} - 5x - 3$. Correct.
- $(2x + 1)(x - 3) = 0$

Step 2: Set each bracket to zero.
- $2x + 1 = 0$ and $x - 3 = 0$

Step 3: Solve each.
- $2x = -1$, so $x = -\frac{1}{2}$
- $x = 3$

Step 4: Check the fraction. $2\left(\frac{1}{4}\right) + \frac{5}{2} - 3 = \frac{1}{2} + \frac{5}{2} - 3 = 0$. Correct.

**Answer: B** ($x = -\frac{1}{2}$ and $x = 3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: leading_coefficient_ignored_in_root (solves 2x + 1 = 0 as x = -1 without dividing by the 2; substituting -1 gives 2 plus 5 minus 3, which is 4 rather than 0)",
  "B": "Correct: the expression factors as (2x + 1)(x - 3), and dividing by the 2 in the first bracket gives negative one half alongside 3",
  "C": "Student makes misconception: wrong_sign_on_factor (flips the sign on both solutions; substituting one half gives one half minus five halves minus 3, which is -5 rather than 0)",
  "D": "Student makes misconception: factor_constants_read_as_roots (reads the constants 1 and -3 out of the brackets without solving; substituting 1 gives 2 minus 5 minus 3, which is -6 rather than 0)"
},
"misconception_tag": {
  "A": "leading_coefficient_ignored_in_root",
  "C": "wrong_sign_on_factor",
  "D": "factor_constants_read_as_roots"
}
```

---

**6. What is the solution of $x^{2} - 6x + 9 = 0$?**

Step 1: The ends are perfect squares and the middle is $2 \times x \times 3$, so this is a perfect square trinomial.
- $(x - 3)(x - 3) = 0$

Step 2: Both brackets give the same equation.
- $x - 3 = 0$, so $x = 3$

Step 3: Check. $9 - 18 + 9 = 0$. Correct.

**Answer: C** ($x = 3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: perfect_square_confused_with_unfactorable_sum (treats the expression as a sum of squares that does not factor, ignoring the middle term; x squared minus 6x plus 9 is (x - 3) squared and has the solution 3)",
  "B": "Student makes misconception: factor_constants_read_as_roots (reads the -3 out of the bracket without flipping its sign; substituting -3 gives 9 plus 18 plus 9, which is 36 rather than 0)",
  "C": "Correct: the expression is (x - 3) squared, so the only solution is x = 3",
  "D": "Student makes misconception: wrong_sign_on_factor (treats the expression as a difference of squares and produces a plus-or-minus pair; substituting -3 gives 36 rather than 0)"
},
"misconception_tag": {
  "A": "perfect_square_confused_with_unfactorable_sum",
  "B": "factor_constants_read_as_roots",
  "D": "wrong_sign_on_factor"
}
```

---

**7. What are the solutions of $x^{2} = 4x + 21$?**

Step 1: Move everything to the left so the right side is zero.
- $x^{2} - 4x - 21 = 0$

Step 2: Factor. Two numbers multiplying to $-21$ and adding to $-4$ are $-7$ and $3$.
- $(x - 7)(x + 3) = 0$

Step 3: Solve each bracket.
- $x = 7$ and $x = -3$

Step 4: Check in the original. At $x = 7$: $49 = 28 + 21$. At $x = -3$: $9 = -12 + 21$. Both work.

**Answer: C** ($x = 7$ and $x = -3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: not_rearranged_to_standard_form (reads the coefficients 4 and 21 off the unrearranged equation as the solutions; substituting 4 gives 16 on the left and 37 on the right, which do not match)",
  "B": "Student makes misconception: factor_constants_read_as_roots (reads -7 and 3 out of the brackets without flipping the signs; substituting -7 gives 49 on the left and -7 on the right)",
  "C": "Correct: rearranging gives x squared minus 4x minus 21, which factors as (x - 7)(x + 3) for solutions 7 and -3",
  "D": "Student makes misconception: wrong_sign_on_factor (keeps the 3 positive; substituting 3 gives 9 on the left and 33 on the right, which do not match)"
},
"misconception_tag": {
  "A": "not_rearranged_to_standard_form",
  "B": "factor_constants_read_as_roots",
  "D": "wrong_sign_on_factor"
}
```

---

**Advanced Level**

**8. What are the solutions of $3x^{2} + 11x - 4 = 0$?**

Step 1: Factor. Expanding to check, $(3x - 1)(x + 4) = 3x^{2} + 12x - x - 4 = 3x^{2} + 11x - 4$. Correct.
- $(3x - 1)(x + 4) = 0$

Step 2: Set each bracket to zero.
- $3x - 1 = 0$ and $x + 4 = 0$

Step 3: Solve each.
- $3x = 1$, so $x = \frac{1}{3}$
- $x = -4$

Step 4: Check the fraction. $3\left(\frac{1}{9}\right) + \frac{11}{3} - 4 = \frac{1}{3} + \frac{11}{3} - 4 = 4 - 4 = 0$. Correct.

**Answer: C** ($x = \frac{1}{3}$ and $x = -4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: leading_coefficient_ignored_in_root (solves 3x - 1 = 0 as x = 1 without dividing by the 3; substituting 1 gives 3 plus 11 minus 4, which is 10 rather than 0)",
  "B": "Student makes misconception: wrong_sign_on_factor (flips the sign on both solutions; substituting 4 gives 48 plus 44 minus 4, which is 88 rather than 0)",
  "C": "Correct: the expression factors as (3x - 1)(x + 4), and dividing by the 3 in the first bracket gives one third alongside -4",
  "D": "Student makes misconception: factor_constants_read_as_roots (reads the constants -1 and 4 out of the brackets without solving; substituting -1 gives 3 minus 11 minus 4, which is -12 rather than 0)"
},
"misconception_tag": {
  "A": "leading_coefficient_ignored_in_root",
  "B": "wrong_sign_on_factor",
  "D": "factor_constants_read_as_roots"
}
```

---

**9. What is the solution of $4x^{2} + 12x + 9 = 0$?**

Step 1: The ends are perfect squares, $4x^{2} = (2x)^{2}$ and $9 = 3^{2}$, and the middle is $2 \times 2x \times 3 = 12x$. Perfect square trinomial.
- $(2x + 3)(2x + 3) = 0$

Step 2: Both brackets give the same equation.
- $2x + 3 = 0$

Step 3: Solve, remembering the division.
- $2x = -3$, so $x = -\frac{3}{2}$

Step 4: Check. $4\left(\frac{9}{4}\right) + 12\left(-\frac{3}{2}\right) + 9 = 9 - 18 + 9 = 0$. Correct.

**Answer: D** ($x = -\frac{3}{2}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: perfect_square_confused_with_unfactorable_sum (treats the expression as an unfactorable sum and concludes there is no solution, ignoring the middle term that makes it a perfect square)",
  "B": "Student makes misconception: leading_coefficient_ignored_in_root (solves 2x + 3 = 0 as x = -3 without dividing by the 2; substituting -3 gives 36 minus 36 plus 9, which is 9 rather than 0)",
  "C": "Student makes misconception: wrong_sign_on_factor (treats the expression as a difference of squares and produces a plus-or-minus pair; substituting positive three halves gives 9 plus 18 plus 9, which is 36 rather than 0)",
  "D": "Correct: the expression is (2x + 3) squared, and dividing by the 2 gives the single solution negative three halves"
},
"misconception_tag": {
  "A": "perfect_square_confused_with_unfactorable_sum",
  "B": "leading_coefficient_ignored_in_root",
  "C": "wrong_sign_on_factor"
}
```

---

**10. What are the solutions of $x(x - 5) = 24$?**

Step 1: The right side is not zero, so the zero product property does not apply yet. Expand and move the $24$.
- $x^{2} - 5x = 24$, so $x^{2} - 5x - 24 = 0$

Step 2: Factor. Two numbers multiplying to $-24$ and adding to $-5$ are $-8$ and $3$.
- $(x - 8)(x + 3) = 0$

Step 3: Solve each bracket.
- $x = 8$ and $x = -3$

Step 4: Check in the original. At $x = 8$: $8 \times 3 = 24$. At $x = -3$: $-3 \times -8 = 24$. Both work.

**Answer: D** ($x = 8$ and $x = -3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: not_rearranged_to_standard_form (applies the zero product property to a right side of 24 rather than 0, reading x = 0 and x = 5 off the two factors; substituting 0 gives 0 rather than 24)",
  "B": "Student makes misconception: factor_constants_read_as_roots (reads -8 and 3 out of the brackets without flipping the signs; substituting -8 gives -8 times -13, which is 104 rather than 24)",
  "C": "Student makes misconception: wrong_sign_on_factor (keeps the 3 positive; substituting 3 gives 3 times -2, which is -6 rather than 24)",
  "D": "Correct: expanding and moving the 24 gives x squared minus 5x minus 24, which factors as (x - 8)(x + 3) for solutions 8 and -3"
},
"misconception_tag": {
  "A": "not_rearranged_to_standard_form",
  "B": "factor_constants_read_as_roots",
  "C": "wrong_sign_on_factor"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: What are the solutions of $(x + 2)(x - 9) = 0$?**

Step 1: Set each bracket to zero.
- $x + 2 = 0$ and $x - 9 = 0$

Step 2: Solve each.
- $x = -2$ and $x = 9$

Step 3: Check. At $x = -2$: $(0)(-11) = 0$. At $x = 9$: $(11)(0) = 0$. Both work.

**Answer: B** ($x = -2$ and $x = 9$)

```json
"distractor_logic": {
  "A": "Student makes misconception: factor_constants_read_as_roots (reads 2 and -9 straight out of the brackets; substituting 2 gives the product of 4 and -7, which is -28 rather than 0)",
  "B": "Correct: x + 2 = 0 gives -2 and x - 9 = 0 gives 9",
  "C": "Student makes misconception: wrong_sign_on_factor (solves the first bracket correctly but takes the second solution as negative; substituting -9 gives the product of -7 and -18, which is 126 rather than 0)",
  "D": "Student makes misconception: wrong_sign_on_factor (flips the sign on the first solution; substituting 2 gives -28 rather than 0)"
},
"misconception_tag": {
  "A": "factor_constants_read_as_roots",
  "C": "wrong_sign_on_factor",
  "D": "wrong_sign_on_factor"
}
```

---

**Item 2: What is the solution of $x^{2} - 10x + 25 = 0$?**

Step 1: The ends are perfect squares and the middle is $2 \times x \times 5$. Perfect square trinomial.
- $(x - 5)(x - 5) = 0$

Step 2: Both brackets give the same equation.
- $x = 5$

Step 3: Check. $25 - 50 + 25 = 0$. Correct.

**Answer: A** ($x = 5$)

```json
"distractor_logic": {
  "A": "Correct: the expression is (x - 5) squared, so the only solution is x = 5",
  "B": "Student makes misconception: perfect_square_confused_with_unfactorable_sum (treats the expression as an unfactorable sum and concludes there is no real solution, ignoring the middle term)",
  "C": "Student makes misconception: factor_constants_read_as_roots (reads the -5 out of the bracket without flipping its sign; substituting -5 gives 25 plus 50 plus 25, which is 100 rather than 0)",
  "D": "Student makes misconception: wrong_sign_on_factor (treats the expression as a difference of squares and gives a plus-or-minus pair; substituting -5 gives 100 rather than 0)"
},
"misconception_tag": {
  "B": "perfect_square_confused_with_unfactorable_sum",
  "C": "factor_constants_read_as_roots",
  "D": "wrong_sign_on_factor"
}
```

---

**Item 3: What are the solutions of $x^{2} + 3x = 10$?**

Step 1: Move the $10$ across.
- $x^{2} + 3x - 10 = 0$

Step 2: Factor. Two numbers multiplying to $-10$ and adding to $3$ are $5$ and $-2$.
- $(x + 5)(x - 2) = 0$

Step 3: Solve each bracket.
- $x = -5$ and $x = 2$

Step 4: Check in the original. At $x = -5$: $25 - 15 = 10$. At $x = 2$: $4 + 6 = 10$. Both work.

**Answer: C** ($x = -5$ and $x = 2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: not_rearranged_to_standard_form (reads the coefficients 3 and 10 off the unrearranged equation; substituting 3 gives 9 plus 9, which is 18 rather than 10)",
  "B": "Student makes misconception: factor_constants_read_as_roots (reads 5 and -2 out of the brackets without flipping the signs; substituting 5 gives 25 plus 15, which is 40 rather than 10)",
  "C": "Correct: moving the 10 gives x squared plus 3x minus 10, which factors as (x + 5)(x - 2) for solutions -5 and 2",
  "D": "Student makes misconception: wrong_sign_on_factor (takes the second solution as negative; substituting -2 gives 4 minus 6, which is -2 rather than 10)"
},
"misconception_tag": {
  "A": "not_rearranged_to_standard_form",
  "B": "factor_constants_read_as_roots",
  "D": "wrong_sign_on_factor"
}
```

---

**Item 4: What are the solutions of $2x^{2} - 7x + 3 = 0$?**

Step 1: Factor. Expanding to check, $(2x - 1)(x - 3) = 2x^{2} - 6x - x + 3 = 2x^{2} - 7x + 3$. Correct.
- $(2x - 1)(x - 3) = 0$

Step 2: Set each bracket to zero.
- $2x - 1 = 0$ and $x - 3 = 0$

Step 3: Solve each.
- $2x = 1$, so $x = \frac{1}{2}$
- $x = 3$

Step 4: Check the fraction. $2\left(\frac{1}{4}\right) - \frac{7}{2} + 3 = \frac{1}{2} - \frac{7}{2} + 3 = 0$. Correct.

**Answer: D** ($x = \frac{1}{2}$ and $x = 3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_sign_on_factor (flips the sign on both solutions; substituting negative one half gives one half plus seven halves plus 3, which is 7 rather than 0)",
  "B": "Student makes misconception: leading_coefficient_ignored_in_root (solves 2x - 1 = 0 as x = 1 without dividing by the 2; substituting 1 gives 2 minus 7 plus 3, which is -2 rather than 0)",
  "C": "Student makes misconception: factor_constants_read_as_roots (reads the constants -1 and -3 out of the brackets without flipping the signs; substituting -1 gives 2 plus 7 plus 3, which is 12 rather than 0)",
  "D": "Correct: the expression factors as (2x - 1)(x - 3), and dividing by the 2 in the first bracket gives one half alongside 3"
},
"misconception_tag": {
  "A": "wrong_sign_on_factor",
  "B": "leading_coefficient_ignored_in_root",
  "C": "factor_constants_read_as_roots"
}
```
