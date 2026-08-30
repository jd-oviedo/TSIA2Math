---
topic_name: "Domain restrictions of rational and radical functions"
unit_number: 4
sequence_in_unit: 1
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Basic"
related_strand: "AR"
keywords: ["domain", "excluded value", "rational function", "radical function", "denominator", "square root", "undefined"]
---

# AR.1.5 - Domain Restrictions of Rational and Radical Functions

**Topic ID:** AR.1.5  
**Unit:** 4  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Identify excluded values of a rational expression by setting the denominator equal to zero and solving, not by reading the constant's sign directly.
- Determine the domain of a radical expression by setting the radicand greater than or equal to zero, including the boundary where the radicand equals zero.
- Combine denominator and radicand restrictions into a single domain statement for expressions containing both a fraction and a square root.

---

#### **Part 1: Guided Notes**

##### The Question Behind the Question

Most of the algebra you have done so far asks "what is the answer?" This topic asks something different: **which inputs are allowed in the first place?**

The set of allowed inputs is called the **domain**. For most expressions the answer is boring, because everything is allowed. You can put any number into $3x + 5$ and get a number back.

Two things break that, and only two:

1. **Dividing by zero.** There is no such number.
2. **Taking the square root of a negative.** There is no real number whose square is negative.

That is the entire topic. Every question you will see is one of those two rules, or both at once. You are not looking for a solution. You are looking for the inputs that would break the expression, and then throwing them out.

---

##### Division by Zero Is the Whole Rule

For a fraction with a variable underneath, ask one question: **what would make the bottom equal zero?**

Take $\frac{5}{x - 7}$. Try a few inputs.

- $x = 0$ gives $\frac{5}{-7}$. Fine.
- $x = 100$ gives $\frac{5}{93}$. Fine.
- $x = 7$ gives $\frac{5}{0}$. **Broken.**

So $7$ is excluded, and every other number is allowed. Notice that the top of the fraction never entered the conversation. **The numerator has no vote.**

To find the excluded value you do not test numbers one at a time. You set the denominator equal to zero and solve:

$$x - 7 = 0 \quad \Rightarrow \quad x = 7$$

---

##### Finding the Excluded Value

**Example 1:** Which value must be excluded from the domain of $\frac{8}{x + 3}$?

Step 1: Set the denominator to zero.
- $x + 3 = 0$

Step 2: Solve.
- $x = -3$

Step 3: Check it. Putting $-3$ in gives $\frac{8}{-3 + 3} = \frac{8}{0}$, which is undefined. Confirmed.

Excluded value: $x = -3$.

The sign is where this goes wrong. The denominator is $x + 3$, and the value that kills it is $-3$, not $3$. **The excluded value is the opposite of the number you see.** Solving rather than reading is what protects you.

**Example 2:** Which value must be excluded from the domain of $\frac{x + 2}{x + 9}$?

Step 1: Set the denominator to zero. Ignore the numerator entirely.
- $x + 9 = 0$

Step 2: Solve.
- $x = -9$

Step 3: Check. $\frac{-9 + 2}{-9 + 9} = \frac{-7}{0}$, undefined. Confirmed.

Excluded value: $x = -9$.

---

##### More Than One Factor, More Than One Exclusion

When the denominator is a product, **each factor gets its own chance to be zero.** A product is zero when any one of its pieces is zero.

**Example 3:** Which values must be excluded from the domain of $\frac{3}{(x - 1)(x + 6)}$?

Step 1: Set each factor to zero separately.
- $x - 1 = 0$
- $x + 6 = 0$

Step 2: Solve each.
- $x = 1$
- $x = -6$

Step 3: Check both. At $x = 1$ the denominator is $(0)(7) = 0$. At $x = -6$ it is $(-7)(0) = 0$. Both undefined. Confirmed.

Excluded values: $x = 1$ and $x = -6$.

**Two factors, two exclusions.** A student who finds the first one and stops has done half the problem.

---

##### The Mistake That Costs the Most Points

Read this section twice.

**A zero on top is completely fine.**

Look at $\frac{x - 3}{x - 8}$ and ask what happens at $x = 3$:

$$\frac{3 - 3}{3 - 8} = \frac{0}{-5} = 0$$

That is not undefined. That is the perfectly ordinary number **zero**. The function has an output there, and $3$ is in the domain.

Zero divided by something is zero. Something divided by zero is undefined. **Those are opposite situations and they are easy to blur together** when both have a zero in them somewhere.

So on $\frac{x - 3}{x - 8}$, the only excluded value is $x = 8$. The $3$ is a trap placed there precisely because it is the number your eye lands on first.

**Only the bottom can break a fraction.**

---

##### Square Roots Cannot Take Negatives

The second rule. $\sqrt{9} = 3$ and $\sqrt{0} = 0$, but $\sqrt{-9}$ is not a real number.

So for a square root, the thing underneath must be **zero or bigger**. Write that as an inequality and solve it.

**Example 4:** What is the domain of $\sqrt{x - 4}$?

Step 1: The expression under the root must be at least zero.
- $x - 4 \geq 0$

Step 2: Solve.
- $x \geq 4$

Step 3: Check the boundary. At $x = 4$ you get $\sqrt{0} = 0$, which is a real number. So $4$ **is** allowed.

Domain: $x \geq 4$.

That third step matters more than it looks. The symbol is $\geq$, not $>$. **Zero has a square root.** Writing $x > 4$ throws away a value that works perfectly well, and the two answers sit next to each other in the choices for exactly that reason.

---

##### When Dividing Flips the Inequality

If the variable under the root carries a negative coefficient, solving the inequality involves dividing by a negative, and **dividing an inequality by a negative reverses it.**

**Example 5:** What is the domain of $\sqrt{12 - 3x}$?

Step 1: Set up the requirement.
- $12 - 3x \geq 0$

Step 2: Move the $x$ term to the side where it is positive. This avoids the flip entirely.
- $12 \geq 3x$

Step 3: Divide by $3$, which is positive, so nothing reverses.
- $4 \geq x$, which reads $x \leq 4$

Step 4: Check. At $x = 4$: $\sqrt{12 - 12} = \sqrt{0} = 0$, real. At $x = 5$: $\sqrt{12 - 15} = \sqrt{-3}$, not real. So values **below** $4$ are the allowed ones. Confirmed.

Domain: $x \leq 4$.

Step 2 is a genuine shortcut. You can instead subtract $12$ to get $-3x \geq -12$ and then divide by $-3$, but that division reverses the sign and gives $x \leq 4$ only if you remember to flip it. Moving the term first means there is no flip to forget.

---

##### Both Rules at Once

Some expressions have a square root **and** a denominator. Then both restrictions apply, and the domain is the inputs that satisfy both.

**Example 6:** What is the domain of $\frac{\sqrt{x + 5}}{x - 2}$?

Step 1: Handle the root. The radicand must be at least zero.
- $x + 5 \geq 0$, so $x \geq -5$

Step 2: Handle the denominator. It must not be zero.
- $x - 2 = 0$ gives $x = 2$, so $x \neq 2$

Step 3: Combine. Both conditions have to hold at once.
- $x \geq -5$ **and** $x \neq 2$

Step 4: Check. At $x = 2$: $\frac{\sqrt{7}}{0}$, undefined. At $x = -6$: $\sqrt{-1}$ on top, not real. At $x = -5$: $\frac{0}{-7} = 0$, fine. Confirmed.

Domain: $x \geq -5$ and $x \neq 2$.

A student who answers $x \geq -5$ has done the root and forgotten the fraction. **Two rules in the expression means two conditions in the answer.**

---

##### One Thing to Watch For Later

You will soon learn to simplify fractions like $\frac{x - 3}{(x - 3)(x + 1)}$ by cancelling the matching factor, which turns it into $\frac{1}{x + 1}$.

When that happens, the domain does **not** change. The value $x = 3$ was excluded from the original expression and it stays excluded, even though the simplified version no longer shows you why. **Cancelling changes how an expression looks, never what it is allowed to eat.**

You are not asked to do that here. It is flagged now so that when the cancelling arrives you already know the domain came first.

---

##### The Five Traps

1. **Reading the number instead of solving for it.** The denominator $x + 3$ excludes $-3$, not $3$. Set it to zero and solve every time.
2. **Treating a zero numerator as undefined.** $\frac{0}{-5}$ is $0$, an ordinary answer. Only a zero **denominator** breaks anything.
3. **Stopping at the first factor.** $(x - 1)(x + 6)$ excludes two values, not one.
4. **Excluding the endpoint of a square root.** $\sqrt{x - 4}$ allows $x = 4$, because $\sqrt{0} = 0$. Use $\geq$, not $>$.
5. **Losing the inequality direction.** $\sqrt{12 - 3x}$ gives $x \leq 4$, not $x \geq 4$. Move the variable to the positive side and there is no flip to lose.

Every one of these is caught by substituting your excluded value back in and checking that it really does break the expression. When you miss a problem below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Which value must be excluded from the domain of $\frac{5}{x - 7}$?
   - A) $x = -7$
   - B) $x = 5$
   - C) $x = 7$
   - D) There are no excluded values

2. Which value must be excluded from the domain of $\frac{x + 2}{x + 9}$?
   - A) $x = 9$
   - B) $x = -2$
   - C) There are no excluded values
   - D) $x = -9$

3. What is the domain of $\sqrt{x - 4}$?
   - A) $x > 4$
   - B) $x \geq 4$
   - C) $x \geq -4$
   - D) $x \leq 4$

4. Which values must be excluded from the domain of $\frac{3}{(x - 1)(x + 6)}$?
   - A) $x = 1$ and $x = -6$
   - B) $x = -1$ and $x = 6$
   - C) $x = 3$
   - D) There are no excluded values

**Proficient Level** (these require an extra step)

5. What is the domain of $\sqrt{12 - 3x}$?
   - A) $x \geq 4$
   - B) $x \leq -4$
   - C) $x \leq 4$
   - D) $x < 4$

6. Which value is **not** in the domain of $\frac{x - 3}{x - 8}$?
   - A) $x = 3$
   - B) $x = 8$
   - C) $x = -8$
   - D) Every value is in the domain

7. A rental costing \$240 is split evenly among $x$ people, so the cost per person is $\frac{240}{x}$. Which value must be excluded from the domain of the expression $\frac{240}{x}$?
   - A) $x = 240$
   - B) $x = 0$
   - C) Every negative value, because a group cannot have a negative number of people
   - D) There are no excluded values

**Advanced Level** (these need multiple steps or reverse thinking)

8. What is the domain of $\frac{\sqrt{x + 5}}{x - 2}$?
   - A) $x \geq -5$
   - B) $x \geq -5$ and $x \neq 2$
   - C) $x > -5$ and $x \neq 2$
   - D) $x \geq 5$ and $x \neq 2$

9. Which values must be excluded from the domain of $\frac{x + 4}{(x - 5)(x + 1)}$?
   - A) $x = -4$
   - B) $x = -5$ and $x = 1$
   - C) $x = 5$ and $x = -1$
   - D) $x = 5$, $x = -1$, and $x = -4$

10. What is the domain of $\frac{\sqrt{7 - x}}{x + 3}$?
    - A) $x \leq 7$
    - B) $x \geq 7$ and $x \neq -3$
    - C) $x \leq 7$ and $x \neq 3$
    - D) $x \leq 7$ and $x \neq -3$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Which value must be excluded from the domain of $\frac{8}{x - 12}$?

- A) $x = -12$
- B) $x = 8$
- C) $x = 12$
- D) There are no excluded values

**Item 2**

What is the domain of $\sqrt{x - 9}$?

- A) $x \geq 9$
- B) $x > 9$
- C) $x \geq -9$
- D) $x \leq 9$

**Item 3**

Which value is **not** in the domain of $\frac{x - 6}{x + 2}$?

- A) $x = 6$
- B) $x = 2$
- C) Every value is in the domain
- D) $x = -2$

**Proficient Level**

**Item 4**

What is the domain of $\sqrt{20 - 4x}$?

- A) $x \leq 5$
- B) $x \geq 5$
- C) $x \leq -5$
- D) $x < 5$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Which value must be excluded from the domain of $\frac{5}{x - 7}$?**

Step 1: Set the denominator to zero.
- $x - 7 = 0$

Step 2: Solve.
- $x = 7$

Step 3: Check. $\frac{5}{7 - 7} = \frac{5}{0}$, undefined. Confirmed.

**Answer: C** ($x = 7$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (flips the sign of the 7 while moving it across, solving x - 7 = 0 as x = -7; substituting -7 gives 5 divided by -14, an ordinary number, so -7 is in the domain)",
  "B": "Student makes misconception: constant_read_as_excluded_value (reads the constant 5 off the top of the fraction as the excluded value without solving anything; the numerator cannot make a fraction undefined)",
  "C": "Correct: x - 7 = 0 gives x = 7, and substituting 7 makes the denominator 0",
  "D": "Student makes misconception: denominator_zero_rule_not_applied (concludes every input is allowed, ignoring that x = 7 makes the denominator zero)"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "B": "constant_read_as_excluded_value",
  "D": "denominator_zero_rule_not_applied"
}
```

---

**2. Which value must be excluded from the domain of $\frac{x + 2}{x + 9}$?**

Step 1: Set the denominator to zero. The numerator plays no part.
- $x + 9 = 0$

Step 2: Solve.
- $x = -9$

Step 3: Check. $\frac{-9 + 2}{-9 + 9} = \frac{-7}{0}$, undefined. Confirmed.

**Answer: D** ($x = -9$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (reads the 9 straight off the denominator instead of solving x + 9 = 0; substituting 9 gives 11 over 18, a perfectly ordinary number)",
  "B": "Student makes misconception: zero_numerator_treated_as_undefined (solves the numerator x + 2 = 0 to get -2, but substituting -2 gives 0 over 7, which equals 0 and is defined)",
  "C": "Student makes misconception: denominator_zero_rule_not_applied (concludes the expression is defined everywhere, ignoring that x = -9 makes the denominator zero)",
  "D": "Correct: x + 9 = 0 gives x = -9, and substituting -9 makes the denominator 0"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "B": "zero_numerator_treated_as_undefined",
  "C": "denominator_zero_rule_not_applied"
}
```

---

**3. What is the domain of $\sqrt{x - 4}$?**

Step 1: The radicand must be zero or greater.
- $x - 4 \geq 0$

Step 2: Solve.
- $x \geq 4$

Step 3: Check the boundary. At $x = 4$, $\sqrt{0} = 0$, which is real, so $4$ is included.

**Answer: B** ($x \geq 4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: radical_endpoint_strictness_error (solves the inequality correctly but writes a strict inequality, throwing out x = 4 even though the square root of 0 is 0 and is perfectly defined)",
  "B": "Correct: x - 4 is at least 0 exactly when x is at least 4, and the endpoint 4 gives the square root of 0",
  "C": "Student makes misconception: sign_error_on_constant (flips the sign of the 4 while moving it across the inequality, producing x greater than or equal to -4; substituting -4 gives the square root of -8, which is not real)",
  "D": "Student makes misconception: inequality_direction_not_flipped (reverses the inequality with no negative coefficient to justify it; substituting x = 0 gives the square root of -4, which is not real)"
},
"misconception_tag": {
  "A": "radical_endpoint_strictness_error",
  "C": "sign_error_on_constant",
  "D": "inequality_direction_not_flipped"
}
```

---

**4. Which values must be excluded from the domain of $\frac{3}{(x - 1)(x + 6)}$?**

Step 1: A product is zero when either factor is zero, so set each to zero.
- $x - 1 = 0$ and $x + 6 = 0$

Step 2: Solve each.
- $x = 1$ and $x = -6$

Step 3: Check. At $x = 1$ the denominator is $(0)(7) = 0$. At $x = -6$ it is $(-7)(0) = 0$. Both undefined. Confirmed.

**Answer: A** ($x = 1$ and $x = -6$)

```json
"distractor_logic": {
  "A": "Correct: both factors get their own chance to be zero, giving x = 1 from the first and x = -6 from the second",
  "B": "Student makes misconception: sign_error_on_constant (reads the numbers 1 and 6 off the factors with their signs unchanged instead of solving; substituting -1 gives 3 over the product of -2 and 5, which is an ordinary number)",
  "C": "Student makes misconception: constant_read_as_excluded_value (reads the 3 from the top of the fraction as the excluded value; the numerator can never make a fraction undefined)",
  "D": "Student makes misconception: denominator_zero_rule_not_applied (concludes nothing is excluded, ignoring that two separate inputs drive the denominator to zero)"
},
"misconception_tag": {
  "B": "sign_error_on_constant",
  "C": "constant_read_as_excluded_value",
  "D": "denominator_zero_rule_not_applied"
}
```

---

**Proficient Level**

**5. What is the domain of $\sqrt{12 - 3x}$?**

Step 1: The radicand must be zero or greater.
- $12 - 3x \geq 0$

Step 2: Move the $x$ term to the side where it is positive, so there is no negative to divide by.
- $12 \geq 3x$

Step 3: Divide by $3$. It is positive, so the direction does not change.
- $4 \geq x$, which is $x \leq 4$

Step 4: Check. At $x = 4$, $\sqrt{0} = 0$, real. At $x = 5$, $\sqrt{-3}$, not real. Confirmed.

**Answer: C** ($x \leq 4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: inequality_direction_not_flipped (subtracts 12 to get -3x greater than or equal to -12, then divides by -3 without reversing the inequality; substituting x = 5 gives the square root of -3, which is not real)",
  "B": "Student makes misconception: sign_error_on_constant (carries the 12 across the inequality with its sign flipped, landing on -4 instead of 4; substituting x = -4 gives the square root of 24, which is real, so -4 is not the boundary)",
  "C": "Correct: 12 minus 3x is at least 0 exactly when 3x is at most 12, so x is at most 4",
  "D": "Student makes misconception: radical_endpoint_strictness_error (gets the boundary and the direction right but excludes x = 4, where the radicand is 0 and the square root is defined)"
},
"misconception_tag": {
  "A": "inequality_direction_not_flipped",
  "B": "sign_error_on_constant",
  "D": "radical_endpoint_strictness_error"
}
```

---

**6. Which value is not in the domain of $\frac{x - 3}{x - 8}$?**

Step 1: Only the denominator can break the expression. Set it to zero.
- $x - 8 = 0$

Step 2: Solve.
- $x = 8$

Step 3: Check the trap value too. At $x = 3$, $\frac{0}{-5} = 0$, which is defined, so $3$ is in the domain.

**Answer: B** ($x = 8$)

```json
"distractor_logic": {
  "A": "Student makes misconception: zero_numerator_treated_as_undefined (solves the numerator x - 3 = 0 to get 3, but substituting 3 gives 0 over -5, which equals 0 and is perfectly defined)",
  "B": "Correct: x - 8 = 0 gives x = 8, the only input that makes the denominator zero",
  "C": "Student makes misconception: sign_error_on_constant (flips the sign of the 8 while solving x - 8 = 0; substituting -8 gives -11 over -16, an ordinary number)",
  "D": "Student makes misconception: denominator_zero_rule_not_applied (concludes every input works, ignoring that x = 8 makes the denominator zero)"
},
"misconception_tag": {
  "A": "zero_numerator_treated_as_undefined",
  "C": "sign_error_on_constant",
  "D": "denominator_zero_rule_not_applied"
}
```

---

**7. A rental costing 240 dollars is split evenly among $x$ people. Which value must be excluded from the domain of $\frac{240}{x}$?**

Step 1: Set the denominator to zero.
- $x = 0$

Step 2: Check. $\frac{240}{0}$ is undefined. Confirmed.

Step 3: Note what the question asks. It asks for the domain of the **expression**, which is decided by arithmetic alone, not by what makes sense as a group size.

**Answer: B** ($x = 0$)

```json
"distractor_logic": {
  "A": "Student makes misconception: constant_read_as_excluded_value (reads the constant 240 off the numerator as the excluded value; substituting 240 gives 1, an ordinary number)",
  "B": "Correct: the denominator is x itself, so x = 0 is the one input that makes the expression undefined",
  "C": "Student makes misconception: contextual_condition_as_domain_restriction (rules out negative inputs because a group cannot have negative people, but the expression is asked about, and 240 divided by -4 is -60, a perfectly defined value)",
  "D": "Student makes misconception: denominator_zero_rule_not_applied (concludes nothing is excluded, ignoring that dividing by zero is undefined)"
},
"misconception_tag": {
  "A": "constant_read_as_excluded_value",
  "C": "contextual_condition_as_domain_restriction",
  "D": "denominator_zero_rule_not_applied"
}
```

---

**Advanced Level**

**8. What is the domain of $\frac{\sqrt{x + 5}}{x - 2}$?**

Step 1: The radicand must be at least zero.
- $x + 5 \geq 0$, so $x \geq -5$

Step 2: The denominator must not be zero.
- $x - 2 = 0$ gives $x = 2$, so $x \neq 2$

Step 3: Both conditions apply at once.
- $x \geq -5$ and $x \neq 2$

Step 4: Check. At $x = -5$, $\frac{0}{-7} = 0$, fine. At $x = 2$, $\frac{\sqrt{7}}{0}$, undefined. At $x = -6$, the top is $\sqrt{-1}$, not real. Confirmed.

**Answer: B** ($x \geq -5$ and $x \neq 2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: denominator_zero_rule_not_applied (handles the square root correctly and stops there, leaving x = 2 in the domain even though it makes the denominator zero)",
  "B": "Correct: the radicand requires x at least -5 and the denominator forbids x = 2, and both conditions hold at once",
  "C": "Student makes misconception: radical_endpoint_strictness_error (excludes x = -5, where the radicand is 0 and the whole expression evaluates to 0 over -7, which is defined)",
  "D": "Student makes misconception: sign_error_on_constant (flips the sign of the 5 while solving x + 5 greater than or equal to 0, giving x at least 5; substituting x = 0 gives the square root of 5 over -2, which is defined, so 0 belongs in the domain)"
},
"misconception_tag": {
  "A": "denominator_zero_rule_not_applied",
  "C": "radical_endpoint_strictness_error",
  "D": "sign_error_on_constant"
}
```

---

**9. Which values must be excluded from the domain of $\frac{x + 4}{(x - 5)(x + 1)}$?**

Step 1: Set each denominator factor to zero.
- $x - 5 = 0$ and $x + 1 = 0$

Step 2: Solve each.
- $x = 5$ and $x = -1$

Step 3: Check the numerator's zero as well. At $x = -4$, the expression is $\frac{0}{(-9)(-3)} = \frac{0}{27} = 0$, which is defined, so $-4$ stays in the domain.

**Answer: C** ($x = 5$ and $x = -1$)

```json
"distractor_logic": {
  "A": "Student makes misconception: zero_numerator_treated_as_undefined (solves the numerator x + 4 = 0 to get -4, but substituting -4 gives 0 over 27, which equals 0 and is defined)",
  "B": "Student makes misconception: sign_error_on_constant (reads 5 and 1 off the factors with their signs flipped the wrong way; substituting -5 gives -1 over the product of -10 and -4, an ordinary number)",
  "C": "Correct: x - 5 = 0 gives 5 and x + 1 = 0 gives -1, and each drives the denominator to zero",
  "D": "Student makes misconception: zero_numerator_treated_as_undefined (finds both denominator values correctly but adds the numerator's zero at -4, where the expression evaluates to 0 rather than becoming undefined)"
},
"misconception_tag": {
  "A": "zero_numerator_treated_as_undefined",
  "B": "sign_error_on_constant",
  "D": "zero_numerator_treated_as_undefined"
}
```

---

**10. What is the domain of $\frac{\sqrt{7 - x}}{x + 3}$?**

Step 1: The radicand must be at least zero.
- $7 - x \geq 0$, so $7 \geq x$, which is $x \leq 7$

Step 2: The denominator must not be zero.
- $x + 3 = 0$ gives $x = -3$, so $x \neq -3$

Step 3: Both apply at once.
- $x \leq 7$ and $x \neq -3$

Step 4: Check. At $x = 7$, $\frac{0}{10} = 0$, fine. At $x = -3$, $\frac{\sqrt{10}}{0}$, undefined. At $x = 8$, the top is $\sqrt{-1}$, not real. Confirmed.

**Answer: D** ($x \leq 7$ and $x \neq -3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: denominator_zero_rule_not_applied (solves the radical condition correctly and stops, leaving x = -3 in the domain even though it makes the denominator zero)",
  "B": "Student makes misconception: inequality_direction_not_flipped (moves the x across and keeps the inequality pointing the same way, giving x at least 7; substituting x = 8 gives the square root of -1, which is not real)",
  "C": "Student makes misconception: sign_error_on_constant (solves x + 3 = 0 as x = 3 rather than x = -3; substituting 3 gives the square root of 4 over 6, which equals one third and is perfectly defined)",
  "D": "Correct: 7 minus x is at least 0 exactly when x is at most 7, and x + 3 = 0 forbids x = -3"
},
"misconception_tag": {
  "A": "denominator_zero_rule_not_applied",
  "B": "inequality_direction_not_flipped",
  "C": "sign_error_on_constant"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Which value must be excluded from the domain of $\frac{8}{x - 12}$?**

Step 1: Set the denominator to zero.
- $x - 12 = 0$

Step 2: Solve.
- $x = 12$

Step 3: Check. $\frac{8}{12 - 12} = \frac{8}{0}$, undefined. Confirmed.

**Answer: C** ($x = 12$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (flips the sign of the 12 while solving x - 12 = 0; substituting -12 gives 8 over -24, an ordinary number)",
  "B": "Student makes misconception: constant_read_as_excluded_value (reads the 8 from the numerator as the excluded value without solving; the top of a fraction cannot make it undefined)",
  "C": "Correct: x - 12 = 0 gives x = 12, the one input that makes the denominator zero",
  "D": "Student makes misconception: denominator_zero_rule_not_applied (concludes every input is allowed, ignoring that x = 12 makes the denominator zero)"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "B": "constant_read_as_excluded_value",
  "D": "denominator_zero_rule_not_applied"
}
```

---

**Item 2: What is the domain of $\sqrt{x - 9}$?**

Step 1: The radicand must be zero or greater.
- $x - 9 \geq 0$

Step 2: Solve.
- $x \geq 9$

Step 3: Check the boundary. At $x = 9$, $\sqrt{0} = 0$, real, so $9$ is included.

**Answer: A** ($x \geq 9$)

```json
"distractor_logic": {
  "A": "Correct: x - 9 is at least 0 exactly when x is at least 9, and the endpoint gives the square root of 0",
  "B": "Student makes misconception: radical_endpoint_strictness_error (writes a strict inequality and throws out x = 9, where the square root of 0 is 0 and is defined)",
  "C": "Student makes misconception: sign_error_on_constant (flips the sign of the 9 while moving it across; substituting -9 gives the square root of -18, which is not real)",
  "D": "Student makes misconception: inequality_direction_not_flipped (reverses the inequality with no negative coefficient to justify it; substituting x = 0 gives the square root of -9, which is not real)"
},
"misconception_tag": {
  "B": "radical_endpoint_strictness_error",
  "C": "sign_error_on_constant",
  "D": "inequality_direction_not_flipped"
}
```

---

**Item 3: Which value is not in the domain of $\frac{x - 6}{x + 2}$?**

Step 1: Set the denominator to zero.
- $x + 2 = 0$

Step 2: Solve.
- $x = -2$

Step 3: Check the trap. At $x = 6$, $\frac{0}{8} = 0$, defined, so $6$ is in the domain.

**Answer: D** ($x = -2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: zero_numerator_treated_as_undefined (solves the numerator x - 6 = 0 to get 6, but substituting 6 gives 0 over 8, which equals 0 and is defined)",
  "B": "Student makes misconception: sign_error_on_constant (reads the 2 off the denominator without solving; substituting 2 gives -4 over 4, which equals -1 and is defined)",
  "C": "Student makes misconception: denominator_zero_rule_not_applied (concludes the expression is defined everywhere, ignoring that x = -2 makes the denominator zero)",
  "D": "Correct: x + 2 = 0 gives x = -2, the only input that makes the denominator zero"
},
"misconception_tag": {
  "A": "zero_numerator_treated_as_undefined",
  "B": "sign_error_on_constant",
  "C": "denominator_zero_rule_not_applied"
}
```

---

**Item 4: What is the domain of $\sqrt{20 - 4x}$?**

Step 1: The radicand must be at least zero.
- $20 - 4x \geq 0$

Step 2: Move the $x$ term to the positive side.
- $20 \geq 4x$

Step 3: Divide by $4$, which is positive, so nothing reverses.
- $5 \geq x$, which is $x \leq 5$

Step 4: Check. At $x = 5$, $\sqrt{0} = 0$, real. At $x = 6$, $\sqrt{-4}$, not real. Confirmed.

**Answer: A** ($x \leq 5$)

```json
"distractor_logic": {
  "A": "Correct: 20 minus 4x is at least 0 exactly when 4x is at most 20, so x is at most 5",
  "B": "Student makes misconception: inequality_direction_not_flipped (subtracts 20 to get -4x greater than or equal to -20, then divides by -4 without reversing the inequality; substituting x = 6 gives the square root of -4, which is not real)",
  "C": "Student makes misconception: sign_error_on_constant (carries the 20 across with its sign flipped, landing on -5; substituting x = -5 gives the square root of 40, which is real, so -5 is not the boundary)",
  "D": "Student makes misconception: radical_endpoint_strictness_error (gets the boundary and direction right but excludes x = 5, where the radicand is 0 and the square root is defined)"
},
"misconception_tag": {
  "B": "inequality_direction_not_flipped",
  "C": "sign_error_on_constant",
  "D": "radical_endpoint_strictness_error"
}
```
