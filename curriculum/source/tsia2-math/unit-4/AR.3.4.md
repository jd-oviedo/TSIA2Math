---
topic_name: "Solving quadratic equations using the quadratic formula"
unit_number: 4
sequence_in_unit: 5
assessment_layer: "CRC"
estimated_time_minutes: 55
difficulty_band: "Proficient"
related_strand: "AR"
keywords: ["quadratic formula", "discriminant", "roots", "solving", "standard form", "real solutions"]
---

# AR.3.4 - Solving Quadratic Equations Using the Quadratic Formula

**Topic ID:** AR.3.4  
**Unit:** 4  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### When Factoring Runs Out

Factoring is fast when it works. The trouble is that it only works when the solutions happen to be tidy.

Try to factor $x^{2} - 4x - 1 = 0$. You need two numbers multiplying to $-1$ and adding to $-4$. There are none. Not because you are missing something, but because this equation's solutions are not whole numbers at all.

The quadratic formula solves **every** quadratic equation, tidy or not. It never fails, it never needs a lucky guess, and it does not care whether the answer is an integer or a mess of square roots.

The price is that it has more moving parts, and each part is a place to slip. This topic is mostly about not slipping.

---

##### The Formula

For any equation written as $ax^{2} + bx + c = 0$:

$$x = \frac{-b \pm \sqrt{b^{2} - 4ac}}{2a}$$

Three things deserve attention before you use it once.

**The $-b$ is a minus.** Whatever $b$ is, the formula starts by flipping its sign. If $b = -5$, then $-b = +5$.

**The $\pm$ is where two solutions come from.** You work the formula twice, once adding the root and once subtracting it.

**The whole top is divided by $2a$.** Not just the square root. The bar runs under everything.

---

##### Read Off a, b and c Before Anything Else

Every error downstream starts with grabbing the wrong numbers. Write them down first, with their signs, and only then touch the formula.

The equation **must be in standard form** with zero on the right before you can read anything off it. If it is not, rearrange it first, exactly as in AR.3.3.

**Example 1:** Solve $x^{2} - 5x + 6 = 0$.

Step 1: Read off the coefficients.
- $a = 1$, $b = -5$, $c = 6$

Step 2: Compute the part under the root, $b^{2} - 4ac$.
- $(-5)^{2} - 4(1)(6) = 25 - 24 = 1$

Step 3: Take its square root.
- $\sqrt{1} = 1$

Step 4: Put it together. Note that $-b = -(-5) = 5$.
- $x = \frac{5 \pm 1}{2}$

Step 5: Split into the two cases.
- $x = \frac{5 + 1}{2} = \frac{6}{2} = 3$
- $x = \frac{5 - 1}{2} = \frac{4}{2} = 2$

Step 6: Check. $9 - 15 + 6 = 0$ and $4 - 10 + 6 = 0$. Both work.

Solutions: $x = 3$ and $x = 2$.

**Example 2:** Solve $x^{2} + 7x + 12 = 0$.

Step 1: $a = 1$, $b = 7$, $c = 12$.

Step 2: $7^{2} - 4(1)(12) = 49 - 48 = 1$.

Step 3: $\sqrt{1} = 1$.

Step 4: Here $-b = -7$.
- $x = \frac{-7 \pm 1}{2}$

Step 5: The two cases.
- $x = \frac{-6}{2} = -3$
- $x = \frac{-8}{2} = -4$

Step 6: Check. $9 - 21 + 12 = 0$ and $16 - 28 + 12 = 0$. Both work.

Solutions: $x = -3$ and $x = -4$.

Compare Steps 4 in the two examples. In the first, $b$ was negative so $-b$ came out positive. In the second, $b$ was positive so $-b$ came out negative. **The formula flips the sign of $b$ no matter which sign it started with.**

---

##### The Mistake That Costs the Most Points

Read this section twice.

**The $2a$ divides the entire numerator.**

Look at Example 1 again. The numerator was $5 \pm 1$, giving $6$ and $4$. Dividing by $2$ gives $3$ and $2$.

Three different wrong answers come out of mishandling that single division:

| What the student does | Result on Example 1 | Why it is wrong |
|---|---|---|
| Never divides | $x = 6$ and $x = 4$ | the bar was ignored entirely |
| Divides only the root | $5 \pm \frac{1}{2}$, so $5.5$ and $4.5$ | the $-b$ is under the bar too |
| Divides only the $-b$ | $\frac{5}{2} \pm 1$, so $3.5$ and $1.5$ | the root is under the bar too |

All three feel like arithmetic slips. They are not. They are all the same misreading of one horizontal line.

The habit that prevents it: **write the whole numerator, in brackets, before you divide anything.**

$$x = \frac{(5 \pm 1)}{2}$$

Then work out what is inside the brackets, and only then divide. Two solutions come out at the end, not partway through.

And there is a free check. Substitute your answers into the original equation. If they do not give zero, one of the three rows above is what happened.

---

##### The Discriminant Tells You How Many

The expression under the square root, $b^{2} - 4ac$, has its own name: the **discriminant**. On its own it answers "how many real solutions?" without you finishing the problem.

| Discriminant | Real solutions | Why |
|---|---|---|
| **positive** | two | the root is a real number, and $\pm$ gives two different answers |
| **zero** | one | $\pm 0$ adds and subtracts nothing, so both cases give the same answer |
| **negative** | none | no real number squares to a negative, so the formula cannot finish |

**Example 3:** How many real solutions does $x^{2} + 2x + 5 = 0$ have?

Step 1: $a = 1$, $b = 2$, $c = 5$.

Step 2: Compute the discriminant.
- $2^{2} - 4(1)(5) = 4 - 20 = -16$

Step 3: It is negative, so there are **no real solutions**.

Two traps sit on this one item.

The first is arithmetic: computing $4 + 20 = 24$ instead of $4 - 20$. **The formula subtracts $4ac$.** Write the minus sign before you multiply, not after.

The second is reading a negative discriminant as **one** solution rather than none. Zero gives one solution. Negative gives none. Those are different rows of the table, and they are easy to blur because both are "fewer than two."

---

##### The Number in the Middle Is Not a Solution

If the discriminant is not zero, the value $\frac{-b}{2a}$ is not a solution of the equation. It is the number the two real solutions sit either side of, and you will meet it again in AR.3.5 as the axis of symmetry.

In Example 1 it is $\frac{5}{2} = 2.5$, and the solutions $3$ and $2$ do sit half a unit either side of it. But $2.5$ itself gives $6.25 - 12.5 + 6 = -0.25$, which is not zero.

**Answering with a single number, when the discriminant is positive, is a signal you stopped before the $\pm$.**

---

##### When the Root Is Not a Whole Number

Most real quadratics do not have perfect-square discriminants. Then the answer keeps its radical, and you simplify what you can.

**Example 4:** Solve $x^{2} - 4x - 1 = 0$.

Step 1: $a = 1$, $b = -4$, $c = -1$.

Step 2: $(-4)^{2} - 4(1)(-1) = 16 + 4 = 20$.

Step 3: $\sqrt{20} = \sqrt{4 \times 5} = 2\sqrt{5}$.

Step 4: Assemble, with $-b = 4$.
- $x = \frac{4 \pm 2\sqrt{5}}{2}$

Step 5: Divide **both** terms on top by $2$.
- $x = 2 \pm \sqrt{5}$

Solutions: $x = 2 + \sqrt{5}$ and $x = 2 - \sqrt{5}$.

Step 5 is where this shape goes wrong. Dividing only the radical gives $4 \pm \sqrt{5}$, which keeps the $4$ undivided. Dividing nothing gives $4 \pm 2\sqrt{5}$. **Both terms on top, every time.**

---

##### The Five Traps

1. **Using $+b$ instead of $-b$.** The formula opens with $-b$, so $b = -5$ gives $+5$ and $b = 7$ gives $-7$.
2. **Forgetting to divide by $2a$.** In Example 1 the numerator is $6$ and $4$; the solutions are $3$ and $2$.
3. **Dividing only part of the numerator.** $\frac{4 \pm 2\sqrt{5}}{2}$ is $2 \pm \sqrt{5}$, not $4 \pm \sqrt{5}$.
4. **Reporting the discriminant instead of its square root.** If $b^{2} - 4ac = 36$, the number that goes in the formula is $6$.
5. **Reading a negative discriminant as one solution.** Negative means none. Zero means one.

Every one of these is caught by substituting your answers into the original equation. When you miss a problem below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. What are the solutions of $x^{2} - 5x + 6 = 0$?
   - A) $x = 3$ and $x = 2$
   - B) $x = -3$ and $x = -2$
   - C) $x = 6$ and $x = 4$
   - D) $x = \frac{5}{2}$

2. What are the solutions of $x^{2} + 7x + 12 = 0$?
   - A) $x = 4$ and $x = 3$
   - B) $x = -3$ and $x = -4$
   - C) $x = -6$ and $x = -8$
   - D) $x = -\frac{7}{2}$

3. What are the solutions of $x^{2} - 2x - 8 = 0$?
   - A) $x = 19$ and $x = -17$
   - B) $x = 2$ and $x = -4$
   - C) $x = 4$ and $x = -2$
   - D) $x = 8$ and $x = -4$

4. What is the discriminant of $2x^{2} + 3x - 5 = 0$?
   - A) $-31$
   - B) $31$
   - C) $1$
   - D) $49$

**Proficient Level** (these require an extra step)

5. What are the solutions of $x^{2} - 6x + 8 = 0$?
   - A) $x = 7$ and $x = 5$
   - B) $x = 4$ and $x = 2$
   - C) $x = 8$ and $x = 4$
   - D) $x = 5$ and $x = 1$

6. What are the solutions of $3x^{2} - 5x - 2 = 0$?
   - A) $x = 2$ and $x = -\frac{1}{3}$
   - B) $x = 12$ and $x = -2$
   - C) $x = \frac{1}{3}$ and $x = -2$
   - D) $x = \frac{5}{6}$

7. Which statement about $x^{2} + 2x + 5 = 0$ is true?
   - A) It has two real solutions, because the discriminant is $24$
   - B) It has exactly one real solution, $x = -1$
   - C) It has no real solutions, because the discriminant is $-16$
   - D) It has exactly one real solution, because the discriminant is negative

**Advanced Level** (these need multiple steps or reverse thinking)

8. What are the solutions of $2x^{2} - 7x + 3 = 0$?
   - A) $x = 12$ and $x = 2$
   - B) $x = 3$ and $x = \frac{1}{2}$
   - C) $x = -3$ and $x = -\frac{1}{2}$
   - D) $x = \frac{7}{4}$

9. What are the solutions of $x^{2} - 4x - 1 = 0$?
   - A) $x = 4 \pm 2\sqrt{5}$
   - B) $x = 4 \pm \sqrt{5}$
   - C) $x = 12$ and $x = -8$
   - D) $x = 2 \pm \sqrt{5}$

10. What are the solutions of $x^{2} + 6x + 4 = 0$?
    - A) $x = -6 \pm 2\sqrt{5}$
    - B) $x = 3 \pm \sqrt{5}$
    - C) $x = -6 \pm \sqrt{5}$
    - D) $x = -3 \pm \sqrt{5}$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

What are the solutions of $x^{2} - 3x - 10 = 0$?

- A) $x = 5$ and $x = -2$
- B) $x = -5$ and $x = 2$
- C) $x = 10$ and $x = -4$
- D) $x = \frac{3}{2}$

**Item 2**

What are the solutions of $x^{2} + 4x + 3 = 0$?

- A) $x = 1$ and $x = 3$
- B) $x = -2$
- C) $x = -1$ and $x = -3$
- D) $x = -2$ and $x = -6$

**Item 3**

Which statement about $x^{2} + x + 4 = 0$ is true?

- A) It has exactly one real solution, because the discriminant is negative
- B) It has no real solutions, because the discriminant is $-15$
- C) It has two real solutions, because the discriminant is $17$
- D) It has exactly one real solution, $x = -\frac{1}{2}$

**Item 4**

What are the solutions of $x^{2} - 8x + 5 = 0$?

- A) $x = 8 \pm 2\sqrt{11}$
- B) $x = 8 \pm \sqrt{11}$
- C) $x = 4 \pm \sqrt{11}$
- D) $x = 26$ and $x = -18$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. What are the solutions of $x^{2} - 5x + 6 = 0$?**

Step 1: $a = 1$, $b = -5$, $c = 6$.

Step 2: Discriminant: $(-5)^{2} - 4(1)(6) = 25 - 24 = 1$, and $\sqrt{1} = 1$.

Step 3: Assemble with $-b = 5$.
- $x = \frac{5 \pm 1}{2}$

Step 4: The two cases give $\frac{6}{2} = 3$ and $\frac{4}{2} = 2$.

Step 5: Check. $9 - 15 + 6 = 0$ and $4 - 10 + 6 = 0$. Both work.

**Answer: A** ($x = 3$ and $x = 2$)

```json
"distractor_logic": {
  "A": "Correct: the numerator is 5 plus or minus 1, giving 6 and 4, and dividing both by 2 gives 3 and 2",
  "B": "Student makes misconception: quadratic_formula_wrong_numerator_sign (uses b rather than its negation, computing -5 plus or minus 1 over 2 for -2 and -3; substituting -2 gives 4 plus 10 plus 6, which is 20 rather than 0)",
  "C": "Student makes misconception: quadratic_formula_denominator_omitted (computes the numerator 5 plus or minus 1 as 6 and 4 and never divides by 2; substituting 6 gives 36 minus 30 plus 6, which is 12 rather than 0)",
  "D": "Student makes misconception: axis_of_symmetry_reported_as_root (reports negative b over 2a as the answer and stops before the plus or minus; substituting five halves gives 6.25 minus 12.5 plus 6, which is -0.25 rather than 0)"
},
"misconception_tag": {
  "B": "quadratic_formula_wrong_numerator_sign",
  "C": "quadratic_formula_denominator_omitted",
  "D": "axis_of_symmetry_reported_as_root"
}
```

---

**2. What are the solutions of $x^{2} + 7x + 12 = 0$?**

Step 1: $a = 1$, $b = 7$, $c = 12$.

Step 2: Discriminant: $49 - 48 = 1$, and $\sqrt{1} = 1$.

Step 3: Assemble with $-b = -7$.
- $x = \frac{-7 \pm 1}{2}$

Step 4: The two cases give $\frac{-6}{2} = -3$ and $\frac{-8}{2} = -4$.

Step 5: Check. $9 - 21 + 12 = 0$ and $16 - 28 + 12 = 0$. Both work.

**Answer: B** ($x = -3$ and $x = -4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: quadratic_formula_wrong_numerator_sign (keeps b positive, computing 7 plus or minus 1 over 2 for 4 and 3; substituting 4 gives 16 plus 28 plus 12, which is 56 rather than 0)",
  "B": "Correct: the numerator is -7 plus or minus 1, giving -6 and -8, and dividing both by 2 gives -3 and -4",
  "C": "Student makes misconception: quadratic_formula_denominator_omitted (stops at the numerator -6 and -8 without dividing by 2; substituting -6 gives 36 minus 42 plus 12, which is 6 rather than 0)",
  "D": "Student makes misconception: axis_of_symmetry_reported_as_root (reports negative b over 2a and never applies the plus or minus; substituting negative seven halves gives 12.25 minus 24.5 plus 12, which is -0.25 rather than 0)"
},
"misconception_tag": {
  "A": "quadratic_formula_wrong_numerator_sign",
  "C": "quadratic_formula_denominator_omitted",
  "D": "axis_of_symmetry_reported_as_root"
}
```

---

**3. What are the solutions of $x^{2} - 2x - 8 = 0$?**

Step 1: $a = 1$, $b = -2$, $c = -8$.

Step 2: Discriminant: $(-2)^{2} - 4(1)(-8) = 4 + 32 = 36$, and $\sqrt{36} = 6$.

Step 3: Assemble with $-b = 2$.
- $x = \frac{2 \pm 6}{2}$

Step 4: The two cases give $\frac{8}{2} = 4$ and $\frac{-4}{2} = -2$.

Step 5: Check. $16 - 8 - 8 = 0$ and $4 + 4 - 8 = 0$. Both work.

**Answer: C** ($x = 4$ and $x = -2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: forgets_square_root (uses the discriminant 36 in place of its square root 6, computing 2 plus or minus 36 over 2 for 19 and -17; substituting 19 gives 361 minus 38 minus 8, which is 315 rather than 0)",
  "B": "Student makes misconception: quadratic_formula_wrong_numerator_sign (uses b rather than its negation, computing -2 plus or minus 6 over 2 for 2 and -4; substituting 2 gives 4 minus 4 minus 8, which is -8 rather than 0)",
  "C": "Correct: the numerator is 2 plus or minus 6, giving 8 and -4, and dividing both by 2 gives 4 and -2",
  "D": "Student makes misconception: quadratic_formula_denominator_omitted (reports the numerator values 8 and -4 without dividing by 2; substituting 8 gives 64 minus 16 minus 8, which is 40 rather than 0)"
},
"misconception_tag": {
  "A": "forgets_square_root",
  "B": "quadratic_formula_wrong_numerator_sign",
  "D": "quadratic_formula_denominator_omitted"
}
```

---

**4. What is the discriminant of $2x^{2} + 3x - 5 = 0$?**

Step 1: $a = 2$, $b = 3$, $c = -5$.

Step 2: The discriminant is $b^{2} - 4ac$.
- $3^{2} - 4(2)(-5)$

Step 3: Work the second term carefully. $4 \times 2 \times (-5) = -40$, and subtracting $-40$ adds $40$.
- $9 + 40 = 49$

**Answer: D** ($49$)

```json
"distractor_logic": {
  "A": "Student makes misconception: discriminant_miscomputed (treats the 4ac term as positive 40 and subtracts it, computing 9 minus 40 for -31, which misses that c is negative so the subtraction becomes an addition)",
  "B": "Student makes misconception: discriminant_miscomputed (computes 4ac minus b squared instead of b squared minus 4ac, giving 40 minus 9 for 31)",
  "C": "Student makes misconception: discriminant_miscomputed (drops c from the second term and computes 9 minus 4 times 2, giving 1)",
  "D": "Correct: 3 squared is 9, and 4 times 2 times -5 is -40, so subtracting it gives 9 plus 40 for 49"
},
"misconception_tag": {
  "A": "discriminant_miscomputed",
  "B": "discriminant_miscomputed",
  "C": "discriminant_miscomputed"
}
```

---

**Proficient Level**

**5. What are the solutions of $x^{2} - 6x + 8 = 0$?**

Step 1: $a = 1$, $b = -6$, $c = 8$.

Step 2: Discriminant: $36 - 32 = 4$, and $\sqrt{4} = 2$.

Step 3: Assemble with $-b = 6$.
- $x = \frac{6 \pm 2}{2}$

Step 4: The two cases give $\frac{8}{2} = 4$ and $\frac{4}{2} = 2$.

Step 5: Check. $16 - 24 + 8 = 0$ and $4 - 12 + 8 = 0$. Both work.

**Answer: B** ($x = 4$ and $x = 2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: quadratic_formula_partial_division (divides only the square root by 2, computing 6 plus or minus 1 for 7 and 5, leaving the 6 undivided; substituting 7 gives 49 minus 42 plus 8, which is 15 rather than 0)",
  "B": "Correct: the numerator is 6 plus or minus 2, giving 8 and 4, and dividing both by 2 gives 4 and 2",
  "C": "Student makes misconception: quadratic_formula_denominator_omitted (reports the numerator values 8 and 4 without dividing by 2; substituting 8 gives 64 minus 48 plus 8, which is 24 rather than 0)",
  "D": "Student makes misconception: forgets_square_root (uses the discriminant 4 in place of its square root 2, computing 6 plus or minus 4 over 2 for 5 and 1; substituting 5 gives 25 minus 30 plus 8, which is 3 rather than 0)"
},
"misconception_tag": {
  "A": "quadratic_formula_partial_division",
  "C": "quadratic_formula_denominator_omitted",
  "D": "forgets_square_root"
}
```

---

**6. What are the solutions of $3x^{2} - 5x - 2 = 0$?**

Step 1: $a = 3$, $b = -5$, $c = -2$.

Step 2: Discriminant: $(-5)^{2} - 4(3)(-2) = 25 + 24 = 49$, and $\sqrt{49} = 7$.

Step 3: Assemble with $-b = 5$ and $2a = 6$.
- $x = \frac{5 \pm 7}{6}$

Step 4: The two cases give $\frac{12}{6} = 2$ and $\frac{-2}{6} = -\frac{1}{3}$.

Step 5: Check. $3(4) - 10 - 2 = 0$, and $3\left(\frac{1}{9}\right) + \frac{5}{3} - 2 = \frac{1}{3} + \frac{5}{3} - 2 = 0$. Both work.

**Answer: A** ($x = 2$ and $x = -\frac{1}{3}$)

```json
"distractor_logic": {
  "A": "Correct: the numerator is 5 plus or minus 7, giving 12 and -2, and dividing both by 6 gives 2 and negative one third",
  "B": "Student makes misconception: quadratic_formula_denominator_omitted (reports the numerator values 12 and -2 without dividing by 6; substituting 12 gives 432 minus 60 minus 2, which is 370 rather than 0)",
  "C": "Student makes misconception: quadratic_formula_wrong_numerator_sign (uses b rather than its negation, computing -5 plus or minus 7 over 6 for one third and -2; substituting one third gives one third minus five thirds minus 2, which is -3.33 rather than 0)",
  "D": "Student makes misconception: axis_of_symmetry_reported_as_root (reports negative b over 2a as a single answer, stopping before the plus or minus; substituting five sixths gives 2.08 minus 4.17 minus 2, which is -4.08 rather than 0)"
},
"misconception_tag": {
  "B": "quadratic_formula_denominator_omitted",
  "C": "quadratic_formula_wrong_numerator_sign",
  "D": "axis_of_symmetry_reported_as_root"
}
```

---

**7. Which statement about $x^{2} + 2x + 5 = 0$ is true?**

Step 1: $a = 1$, $b = 2$, $c = 5$.

Step 2: Discriminant: $2^{2} - 4(1)(5) = 4 - 20 = -16$.

Step 3: The discriminant is negative, so the square root cannot be taken over the real numbers and there are no real solutions.

**Answer: C** (no real solutions, because the discriminant is $-16$)

```json
"distractor_logic": {
  "A": "Student makes misconception: discriminant_miscomputed (adds the 4ac term instead of subtracting it, computing 4 plus 20 for 24 and concluding the discriminant is positive)",
  "B": "Student makes misconception: axis_of_symmetry_reported_as_root (reports negative b over 2a, which is -1, as a solution; substituting -1 gives 1 minus 2 plus 5, which is 4 rather than 0)",
  "C": "Correct: the discriminant is 4 minus 20, which is -16, and a negative discriminant means no real solution exists",
  "D": "Student makes misconception: negative_discriminant_read_as_one_root (gets the negative discriminant right but reads it as a single repeated solution; one solution comes from a discriminant of exactly zero, and negative means none)"
},
"misconception_tag": {
  "A": "discriminant_miscomputed",
  "B": "axis_of_symmetry_reported_as_root",
  "D": "negative_discriminant_read_as_one_root"
}
```

---

**Advanced Level**

**8. What are the solutions of $2x^{2} - 7x + 3 = 0$?**

Step 1: $a = 2$, $b = -7$, $c = 3$.

Step 2: Discriminant: $(-7)^{2} - 4(2)(3) = 49 - 24 = 25$, and $\sqrt{25} = 5$.

Step 3: Assemble with $-b = 7$ and $2a = 4$.
- $x = \frac{7 \pm 5}{4}$

Step 4: The two cases give $\frac{12}{4} = 3$ and $\frac{2}{4} = \frac{1}{2}$.

Step 5: Check. $18 - 21 + 3 = 0$, and $2\left(\frac{1}{4}\right) - \frac{7}{2} + 3 = \frac{1}{2} - \frac{7}{2} + 3 = 0$. Both work.

**Answer: B** ($x = 3$ and $x = \frac{1}{2}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: quadratic_formula_denominator_omitted (reports the numerator values 12 and 2 without dividing by 4; substituting 12 gives 288 minus 84 plus 3, which is 207 rather than 0)",
  "B": "Correct: the numerator is 7 plus or minus 5, giving 12 and 2, and dividing both by 4 gives 3 and one half",
  "C": "Student makes misconception: quadratic_formula_wrong_numerator_sign (uses b rather than its negation, computing -7 plus or minus 5 over 4 for negative one half and -3; substituting -3 gives 18 plus 21 plus 3, which is 42 rather than 0)",
  "D": "Student makes misconception: axis_of_symmetry_reported_as_root (reports negative b over 2a as a single answer; substituting seven quarters gives 6.125 minus 12.25 plus 3, which is -3.125 rather than 0)"
},
"misconception_tag": {
  "A": "quadratic_formula_denominator_omitted",
  "C": "quadratic_formula_wrong_numerator_sign",
  "D": "axis_of_symmetry_reported_as_root"
}
```

---

**9. What are the solutions of $x^{2} - 4x - 1 = 0$?**

Step 1: $a = 1$, $b = -4$, $c = -1$.

Step 2: Discriminant: $16 + 4 = 20$, and $\sqrt{20} = 2\sqrt{5}$.

Step 3: Assemble with $-b = 4$.
- $x = \frac{4 \pm 2\sqrt{5}}{2}$

Step 4: Divide **both** terms on top by $2$.
- $x = 2 \pm \sqrt{5}$

**Answer: D** ($x = 2 \pm \sqrt{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: quadratic_formula_denominator_omitted (writes the numerator 4 plus or minus 2 times the square root of 5 and never divides by 2, leaving both terms twice their correct size)",
  "B": "Student makes misconception: quadratic_formula_partial_division (divides only the radical term by 2, turning 2 times the square root of 5 into the square root of 5 while leaving the 4 undivided)",
  "C": "Student makes misconception: forgets_square_root (uses the discriminant 20 in place of its square root, computing 4 plus or minus 20 over 2 for 12 and -8; substituting 12 gives 144 minus 48 minus 1, which is 95 rather than 0)",
  "D": "Correct: the numerator is 4 plus or minus 2 times the square root of 5, and dividing both terms by 2 gives 2 plus or minus the square root of 5"
},
"misconception_tag": {
  "A": "quadratic_formula_denominator_omitted",
  "B": "quadratic_formula_partial_division",
  "C": "forgets_square_root"
}
```

---

**10. What are the solutions of $x^{2} + 6x + 4 = 0$?**

Step 1: $a = 1$, $b = 6$, $c = 4$.

Step 2: Discriminant: $36 - 16 = 20$, and $\sqrt{20} = 2\sqrt{5}$.

Step 3: Assemble with $-b = -6$.
- $x = \frac{-6 \pm 2\sqrt{5}}{2}$

Step 4: Divide both terms on top by $2$.
- $x = -3 \pm \sqrt{5}$

**Answer: D** ($x = -3 \pm \sqrt{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: quadratic_formula_denominator_omitted (writes the numerator -6 plus or minus 2 times the square root of 5 and never divides by 2)",
  "B": "Student makes misconception: quadratic_formula_wrong_numerator_sign (keeps b positive, computing 6 plus or minus 2 times the square root of 5 over 2 for 3 plus or minus the square root of 5, which has the wrong sign on the whole rational part)",
  "C": "Student makes misconception: quadratic_formula_partial_division (divides only the radical term by 2, leaving the -6 undivided)",
  "D": "Correct: the numerator is -6 plus or minus 2 times the square root of 5, and dividing both terms by 2 gives -3 plus or minus the square root of 5"
},
"misconception_tag": {
  "A": "quadratic_formula_denominator_omitted",
  "B": "quadratic_formula_wrong_numerator_sign",
  "C": "quadratic_formula_partial_division"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: What are the solutions of $x^{2} - 3x - 10 = 0$?**

Step 1: $a = 1$, $b = -3$, $c = -10$.

Step 2: Discriminant: $9 + 40 = 49$, and $\sqrt{49} = 7$.

Step 3: Assemble with $-b = 3$.
- $x = \frac{3 \pm 7}{2}$

Step 4: The two cases give $\frac{10}{2} = 5$ and $\frac{-4}{2} = -2$.

Step 5: Check. $25 - 15 - 10 = 0$ and $4 + 6 - 10 = 0$. Both work.

**Answer: A** ($x = 5$ and $x = -2$)

```json
"distractor_logic": {
  "A": "Correct: the numerator is 3 plus or minus 7, giving 10 and -4, and dividing both by 2 gives 5 and -2",
  "B": "Student makes misconception: quadratic_formula_wrong_numerator_sign (uses b rather than its negation, computing -3 plus or minus 7 over 2 for 2 and -5; substituting 2 gives 4 minus 6 minus 10, which is -12 rather than 0)",
  "C": "Student makes misconception: quadratic_formula_denominator_omitted (reports the numerator values 10 and -4 without dividing by 2; substituting 10 gives 100 minus 30 minus 10, which is 60 rather than 0)",
  "D": "Student makes misconception: axis_of_symmetry_reported_as_root (reports negative b over 2a and stops before the plus or minus; substituting three halves gives 2.25 minus 4.5 minus 10, which is -12.25 rather than 0)"
},
"misconception_tag": {
  "B": "quadratic_formula_wrong_numerator_sign",
  "C": "quadratic_formula_denominator_omitted",
  "D": "axis_of_symmetry_reported_as_root"
}
```

---

**Item 2: What are the solutions of $x^{2} + 4x + 3 = 0$?**

Step 1: $a = 1$, $b = 4$, $c = 3$.

Step 2: Discriminant: $16 - 12 = 4$, and $\sqrt{4} = 2$.

Step 3: Assemble with $-b = -4$.
- $x = \frac{-4 \pm 2}{2}$

Step 4: The two cases give $\frac{-2}{2} = -1$ and $\frac{-6}{2} = -3$.

Step 5: Check. $1 - 4 + 3 = 0$ and $9 - 12 + 3 = 0$. Both work.

**Answer: C** ($x = -1$ and $x = -3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: quadratic_formula_wrong_numerator_sign (keeps b positive, computing 4 plus or minus 2 over 2 for 3 and 1; substituting 1 gives 1 plus 4 plus 3, which is 8 rather than 0)",
  "B": "Student makes misconception: axis_of_symmetry_reported_as_root (reports negative b over 2a, which is -2, as the single answer; substituting -2 gives 4 minus 8 plus 3, which is -1 rather than 0)",
  "C": "Correct: the numerator is -4 plus or minus 2, giving -2 and -6, and dividing both by 2 gives -1 and -3",
  "D": "Student makes misconception: quadratic_formula_denominator_omitted (reports the numerator values -2 and -6 without dividing by 2; substituting -6 gives 36 minus 24 plus 3, which is 15 rather than 0)"
},
"misconception_tag": {
  "A": "quadratic_formula_wrong_numerator_sign",
  "B": "axis_of_symmetry_reported_as_root",
  "D": "quadratic_formula_denominator_omitted"
}
```

---

**Item 3: Which statement about $x^{2} + x + 4 = 0$ is true?**

Step 1: $a = 1$, $b = 1$, $c = 4$.

Step 2: Discriminant: $1^{2} - 4(1)(4) = 1 - 16 = -15$.

Step 3: The discriminant is negative, so there are no real solutions.

**Answer: B** (no real solutions, because the discriminant is $-15$)

```json
"distractor_logic": {
  "A": "Student makes misconception: negative_discriminant_read_as_one_root (computes the negative discriminant correctly but reads it as one repeated solution; a single solution requires a discriminant of exactly zero)",
  "B": "Correct: the discriminant is 1 minus 16, which is -15, and no real number squares to a negative",
  "C": "Student makes misconception: discriminant_miscomputed (adds the 4ac term instead of subtracting it, computing 1 plus 16 for 17)",
  "D": "Student makes misconception: axis_of_symmetry_reported_as_root (reports negative b over 2a, which is negative one half, as a solution; substituting it gives 0.25 minus 0.5 plus 4, which is 3.75 rather than 0)"
},
"misconception_tag": {
  "A": "negative_discriminant_read_as_one_root",
  "C": "discriminant_miscomputed",
  "D": "axis_of_symmetry_reported_as_root"
}
```

---

**Item 4: What are the solutions of $x^{2} - 8x + 5 = 0$?**

Step 1: $a = 1$, $b = -8$, $c = 5$.

Step 2: Discriminant: $64 - 20 = 44$, and $\sqrt{44} = 2\sqrt{11}$.

Step 3: Assemble with $-b = 8$.
- $x = \frac{8 \pm 2\sqrt{11}}{2}$

Step 4: Divide both terms on top by $2$.
- $x = 4 \pm \sqrt{11}$

**Answer: C** ($x = 4 \pm \sqrt{11}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: quadratic_formula_denominator_omitted (writes the numerator 8 plus or minus 2 times the square root of 11 and never divides by 2)",
  "B": "Student makes misconception: quadratic_formula_partial_division (divides only the radical term by 2, turning 2 times the square root of 11 into the square root of 11 while leaving the 8 undivided)",
  "C": "Correct: the numerator is 8 plus or minus 2 times the square root of 11, and dividing both terms by 2 gives 4 plus or minus the square root of 11",
  "D": "Student makes misconception: forgets_square_root (uses the discriminant 44 in place of its square root, computing 8 plus or minus 44 over 2 for 26 and -18; substituting 26 gives 676 minus 208 plus 5, which is 473 rather than 0)"
},
"misconception_tag": {
  "A": "quadratic_formula_denominator_omitted",
  "B": "quadratic_formula_partial_division",
  "D": "forgets_square_root"
}
```
