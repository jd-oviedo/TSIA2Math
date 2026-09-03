---
topic_name: "Fitting a linear model to scatterplot data"
unit_number: 5
sequence_in_unit: 15
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "PR"
keywords: ["linear model", "line of best fit", "slope", "y-intercept", "prediction", "scatterplot"]
---

# PR.4.2 - Fitting a Linear Model to Scatterplot Data

**Topic ID:** PR.4.2  
**Unit:** 5  
**Strand:** PR (Probabilistic and Statistical Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Calculate the slope of a line from two points using rise over run.
- Find the y-intercept by substituting the slope and one known point into y = mx + b, without swapping the slope and intercept.
- Use a fitted linear model to predict a y-value, and judge how well a model fits by checking it against all the data points, not just one.

---

#### **Part 1: Guided Notes**

##### Two Questions, Asked in Order

`PR.4.1` told you this strand's items describe their graphs in words rather than drawing them, and that this is how they are worded on the test. **This lesson has no pictures either, for the same reason.** Every item here gives you the points in the sentence.

Fitting a line asks two questions, in order:

1. **How fast does $y$ change as $x$ changes?** That is the slope, and it comes from two points.
2. **Where does the line start?** That is the $y$-intercept, and it comes from the slope plus any one point.

**The confusion this topic exists to prevent is mixing up which number goes where.** A model is $y = mx + b$, and $m$ and $b$ are not interchangeable. Swapping them produces an equation that looks right and predicts wrongly at every value of $x$ except one.

---

##### Slope Is Rise Over Run

For two points $(x_1, y_1)$ and $(x_2, y_2)$:

$$m = \frac{y_2 - y_1}{x_2 - x_1}$$

**Example 1:** A line passes through $(2, 7)$ and $(6, 19)$. Find the slope.

Step 1: Subtract the $y$ values, top.
- $19 - 7 = 12$

Step 2: Subtract the $x$ values, bottom, **in the same order**.
- $6 - 2 = 4$

Step 3: Divide.
- $12 / 4 = 3$

**Rise over run, and both are differences.** Adding instead of subtracting is the error that produces a plausible number: $19 + 7 = 26$ over $4$ gives $6.5$, which looks like a slope and is not one.

---

##### The Intercept Comes From the Slope Plus One Point

Once you have $m$, substitute any point into $y = mx + b$ and solve for $b$.

**Example 2:** The line above has $m = 3$ and passes through $(2, 7)$. Find $b$.

Step 1: Substitute.
- $7 = 3 \times 2 + b$

Step 2: Simplify the product.
- $7 = 6 + b$

Step 3: Solve.
- $7 - 6 = 1$, so $b = 1$.

Step 4: Write the model.
- $y = 3x + 1$

**Check it on the other point.** At $x = 6$: $3 \times 6 + 1 = 19$, which matches. A model that fits one point and misses the other is not fitted, it is anchored.

---

##### $m$ and $b$ Are Not Interchangeable

$y = 3x + 1$ and $y = x + 3$ are different lines. They happen to agree at $x = 1$ and nowhere else.

- At $x = 0$: $1$ against $3$.
- At $x = 5$: $16$ against $8$.

**Say the model out loud before you write it: "three x plus one".** The number attached to $x$ is the slope. The number standing alone is the intercept.

---

##### Predicting With the Model

**Example 3:** Use $y = 3x + 1$ to predict $y$ when $x = 10$.

Step 1: Multiply first.
- $3 \times 10 = 30$

Step 2: Then add.
- $30 + 1 = 31$

Multiplication before addition. Adding first gives $(3 + 1) \times 10 = 40$, and $40$ is not on this line at all.

**Both terms count.** Dropping the constant gives $30$; dropping the variable term gives $1$. Each is a real number produced by a real half of the calculation, and neither is the answer.

---

##### Judging Which Model Fits

**Example 4:** A data set has the points $(1, 3)$, $(2, 5)$, $(3, 7)$ and $(4, 9)$. Two models are proposed: $y = 2x + 1$ and $y = 3x$. Which fits better?

Step 1: Test the first at every point.
- $2 \times 1 + 1 = 3$, $2 \times 2 + 1 = 5$, $2 \times 3 + 1 = 7$, $2 \times 4 + 1 = 9$. All four match.

Step 2: Test the second at every point.
- $3 \times 1 = 3$ matches, $3 \times 2 = 6$ against $5$, $3 \times 3 = 9$ against $7$, $3 \times 4 = 12$ against $9$.

Step 3: Compare.
- The first matches all four. The second matches one.

**A model is judged across all the data, not at one point.** Passing through the first point tells you where a line starts, not whether it fits.

---

##### The Mistake That Costs the Most Points

**Swapping the slope and the intercept when writing the model.** Both numbers are correct, both are on the page, and the equation looks finished.

The defence is to test the model on a point you already have. Substitute an $x$ you know the answer for and see whether the model returns it. A swapped model fails that test immediately, and it takes one multiplication.

---

##### The Five Traps

1. **Run over rise.** Slope is the $y$ difference on top.
2. **Adding instead of subtracting.** Both parts of the slope are differences.
3. **Swapping $m$ and $b$.** The number attached to $x$ is the slope.
4. **Dropping a term when predicting.** $y = mx + b$ has two terms and both count.
5. **Judging fit at one point.** A model is tested across the whole data set.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. A line passes through $(2, 7)$ and $(6, 19)$. What is the slope?
   - A) $3$
   - B) $\frac{1}{3}$
   - C) $6.5$
   - D) $1.5$

2. That same line has a slope of $3$ and passes through $(2, 7)$. What is the $y$-intercept?
   - A) $3$
   - B) $1$
   - C) $7$
   - D) $-1$

3. A line has a slope of $3$ and a $y$-intercept of $1$. Which equation represents it?
   - A) $y = 3x - 1$
   - B) $y = x + 3$
   - C) $y = 3x + 1$
   - D) $y = 3x$

4. Use the model $y = 3x + 1$ to predict $y$ when $x = 10$.
   - A) $30$
   - B) $1$
   - C) $40$
   - D) $31$

**Proficient Level** (these require an extra step)

5. A line passes through $(2, 9)$ and $(5, 3)$. What is the slope?
   - A) $-2$
   - B) $-\frac{1}{2}$
   - C) $4$
   - D) $-\frac{6}{7}$

6. A line has a slope of $-2$ and passes through $(2, 9)$. What is the $y$-intercept?
   - A) $-2$
   - B) $13$
   - C) $9$
   - D) $-13$

7. A data set has the points $(1, 3)$, $(2, 5)$, $(3, 7)$ and $(4, 9)$. Two models are proposed: $y = 2x + 1$ and $y = 3x$. Which fits better, and why?
   - A) $y = 3x$, because it passes through the first point $(1, 3)$
   - B) $y = 3x$, because a model with no constant term is the simpler one
   - C) $y = 2x + 1$, because it predicts all four points exactly
   - D) $y = 3x$, because its slope comes from adding the $y$ values and dividing by the sum of the $x$ values

**Advanced Level** (these need multiple steps or reverse thinking)

8. Use the model $y = -2x + 13$ to predict $y$ when $x = 8$.
   - A) $-16$
   - B) $13$
   - C) $88$
   - D) $-3$

9. A linear model has a slope of $4$ and predicts $y = 45$ when $x = 10$. What is its $y$-intercept?
   - A) $4$
   - B) $5$
   - C) $45$
   - D) $-5$

10. A data set has the points $(0, 2)$, $(1, 5)$, $(2, 8)$ and $(3, 11)$. Which equation models it?
    - A) $y = 2x + 3$
    - B) $y = 3x$
    - C) $y = 3x + 2$
    - D) $y = \frac{1}{3}x + 2$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

A line passes through $(3, 8)$ and $(7, 20)$. What is the slope?

- A) $3$
- B) $\frac{1}{3}$
- C) $7$
- D) $1.2$

**Item 2**

A line has a slope of $3$ and passes through $(3, 8)$. What is the $y$-intercept?

- A) $3$
- B) $-1$
- C) $8$
- D) $1$

**Item 3**

Use the model $y = 3x - 1$ to predict $y$ when $x = 6$.

- A) $18$
- B) $-1$
- C) $17$
- D) $12$

**Proficient Level**

**Item 4**

A data set has the points $(1, 4)$, $(2, 7)$ and $(3, 10)$. Two models are proposed: $y = 3x + 1$ and $y = 4x$. Which fits better, and why?

- A) $y = 4x$, because it passes through the first point $(1, 4)$
- B) $y = 4x$, because a model with no constant term is the simpler one
- C) $y = 4x$, because its slope is the average of the $y$ values divided by the average of the $x$ values
- D) $y = 3x + 1$, because it predicts all three points exactly

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. A line passes through $(2, 7)$ and $(6, 19)$. What is the slope?**

Step 1: Rise.
- $19 - 7 = 12$

Step 2: Run, in the same order.
- $6 - 2 = 4$

Step 3: Divide.
- $12 / 4 = 3$

**Answer: A** ($3$)

```json
"distractor_logic": {
  "A": "Correct: 19 - 7 = 12 and 6 - 2 = 4, so 12 / 4 = 3",
  "B": "Student makes misconception: slope_run_over_rise (inverts the fraction, computing 4 / 12 = 1/3)",
  "C": "Student makes misconception: slope_numerator_summed (adds the y values instead of subtracting, computing 19 + 7 = 26 and then 26 / 4 = 6.5)",
  "D": "Student makes misconception: slope_denominator_summed (adds the x values instead of subtracting, computing 6 + 2 = 8 and then 12 / 8 = 1.5)"
},
"misconception_tag": {
  "B": "slope_run_over_rise",
  "C": "slope_numerator_summed",
  "D": "slope_denominator_summed"
}
```

---

**2. That line has a slope of $3$ and passes through $(2, 7)$. What is the $y$-intercept?**

Step 1: Substitute into $y = mx + b$.
- $7 = 3 \times 2 + b$

Step 2: Simplify.
- $7 = 6 + b$

Step 3: Solve.
- $7 - 6 = 1$

**Answer: B** ($1$)

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_intercept_swap (reports the slope, 3, where the intercept was asked for)",
  "B": "Correct: 7 = 3 * 2 + b gives 7 = 6 + b, so 7 - 6 = 1",
  "C": "Student makes misconception: omits_variable_term (drops the 3x term and reads the point's y value, 7, as the intercept)",
  "D": "Student makes misconception: sign_error_on_constant (solves 7 = 6 + b as 6 - 7 = -1, reversing the subtraction)"
},
"misconception_tag": {
  "A": "slope_intercept_swap",
  "C": "omits_variable_term",
  "D": "sign_error_on_constant"
}
```

---

**3. A line has a slope of $3$ and a $y$-intercept of $1$. Which equation represents it?**

Step 1: The slope multiplies $x$.

Step 2: The intercept stands alone.

Step 3: Write it.
- $y = 3x + 1$

**Answer: C**

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (writes the intercept with the wrong sign, giving y = 3x - 1)",
  "B": "Student makes misconception: slope_intercept_swap (attaches 1 to x and leaves 3 standing alone, giving y = x + 3, which agrees with the true line only at x = 1)",
  "C": "Correct: the slope 3 multiplies x and the intercept 1 stands alone",
  "D": "Student makes misconception: omits_constant_term (drops the intercept entirely, giving a line through the origin)"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "B": "slope_intercept_swap",
  "D": "omits_constant_term"
}
```

---

**4. Use $y = 3x + 1$ to predict $y$ when $x = 10$.**

Step 1: Multiply first.
- $3 \times 10 = 30$

Step 2: Then add.
- $30 + 1 = 31$

**Answer: D** ($31$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (computes 3 * 10 = 30 and stops, dropping the intercept)",
  "B": "Student makes misconception: omits_variable_term (drops the 3x term and reports the intercept alone, 1)",
  "C": "Student makes misconception: order_of_operations_violated (adds before multiplying, computing 3 + 1 = 4 and then 4 * 10 = 40)",
  "D": "Correct: 3 * 10 = 30 and 30 + 1 = 31"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "B": "omits_variable_term",
  "C": "order_of_operations_violated"
}
```

---

**Proficient Level**

**5. A line passes through $(2, 9)$ and $(5, 3)$. What is the slope?**

Step 1: Rise.
- $3 - 9 = -6$

Step 2: Run, in the same order.
- $5 - 2 = 3$

Step 3: Divide.
- $-6 / 3 = -2$

**Answer: A** ($-2$)

```json
"distractor_logic": {
  "A": "Correct: 3 - 9 = -6 and 5 - 2 = 3, so -6 / 3 = -2",
  "B": "Student makes misconception: slope_run_over_rise (inverts the fraction, computing 3 / -6 = -1/2)",
  "C": "Student makes misconception: slope_numerator_summed (adds the y values instead of subtracting, computing 3 + 9 = 12 and then 12 / 3 = 4)",
  "D": "Student makes misconception: slope_denominator_summed (adds the x values instead of subtracting, computing 5 + 2 = 7 and then -6 / 7)"
},
"misconception_tag": {
  "B": "slope_run_over_rise",
  "C": "slope_numerator_summed",
  "D": "slope_denominator_summed"
}
```

---

**6. A line has a slope of $-2$ and passes through $(2, 9)$. What is the $y$-intercept?**

Step 1: Substitute.
- $9 = -2 \times 2 + b$

Step 2: Simplify.
- $9 = -4 + b$

Step 3: Solve.
- $9 + 4 = 13$

**Answer: B** ($13$)

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_intercept_swap (reports the slope, -2, where the intercept was asked for)",
  "B": "Correct: 9 = -4 + b, so 9 + 4 = 13",
  "C": "Student makes misconception: omits_variable_term (drops the -2x term and reads the point's y value, 9, as the intercept)",
  "D": "Student makes misconception: sign_error_on_constant (carries the -4 across without changing its sign, giving -13)"
},
"misconception_tag": {
  "A": "slope_intercept_swap",
  "C": "omits_variable_term",
  "D": "sign_error_on_constant"
}
```

---

**7. Which model fits the points $(1, 3)$, $(2, 5)$, $(3, 7)$, $(4, 9)$ better?**

Step 1: Test $y = 2x + 1$ at all four.
- $3, 5, 7, 9$. Every one matches.

Step 2: Test $y = 3x$ at all four.
- $3, 6, 9, 12$ against $3, 5, 7, 9$. Only the first matches.

Step 3: Compare across the whole set, not at one point.

**Answer: C**

```json
"distractor_logic": {
  "A": "Student makes misconception: fit_judged_by_intercept (judges the model by the single point it anchors on, when 3 * 2 = 6 against 5, 3 * 3 = 9 against 7 and 3 * 4 = 12 against 9 all miss)",
  "B": "Student makes misconception: omits_constant_term (prefers the model without an intercept because it is shorter, when the data does not pass through the origin)",
  "C": "Correct: 2 * 1 + 1 = 3, 2 * 2 + 1 = 5, 2 * 3 + 1 = 7 and 2 * 4 + 1 = 9, so all four match",
  "D": "Student makes misconception: slope_numerator_summed (computes a slope by adding the y values over the sum of the x values, 24 / 10, rather than from differences)"
},
"misconception_tag": {
  "A": "fit_judged_by_intercept",
  "B": "omits_constant_term",
  "D": "slope_numerator_summed"
}
```

---

**Advanced Level**

**8. Use $y = -2x + 13$ to predict $y$ when $x = 8$.**

Step 1: Multiply first.
- $-2 \times 8 = -16$

Step 2: Then add.
- $-16 + 13 = -3$

**Answer: D** ($-3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (computes -2 * 8 = -16 and stops, dropping the intercept)",
  "B": "Student makes misconception: omits_variable_term (drops the -2x term and reports the intercept alone, 13)",
  "C": "Student makes misconception: order_of_operations_violated (adds before multiplying, computing -2 + 13 = 11 and then 11 * 8 = 88)",
  "D": "Correct: -2 * 8 = -16 and -16 + 13 = -3"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "B": "omits_variable_term",
  "C": "order_of_operations_violated"
}
```

---

**9. A model has slope $4$ and predicts $y = 45$ at $x = 10$. What is its $y$-intercept?**

Step 1: Substitute what is known.
- $45 = 4 \times 10 + b$

Step 2: Simplify.
- $45 = 40 + b$

Step 3: Solve.
- $45 - 40 = 5$

**Answer: B** ($5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_intercept_swap (reports the slope, 4, where the intercept was asked for)",
  "B": "Correct: 45 = 40 + b, so 45 - 40 = 5",
  "C": "Student makes misconception: omits_variable_term (drops the 4x term and reads the predicted value, 45, as the intercept)",
  "D": "Student makes misconception: sign_error_on_constant (solves 45 = 40 + b as 40 - 45 = -5, reversing the subtraction)"
},
"misconception_tag": {
  "A": "slope_intercept_swap",
  "C": "omits_variable_term",
  "D": "sign_error_on_constant"
}
```

---

**10. Which equation models $(0, 2)$, $(1, 5)$, $(2, 8)$, $(3, 11)$?**

Step 1: Slope from two points.
- $5 - 2 = 3$ over $1 - 0 = 1$, so $3 / 1 = 3$.

Step 2: The point $(0, 2)$ gives the intercept directly.
- $b = 2$.

Step 3: Check the last point.
- $3 \times 3 + 2 = 11$, which matches.

**Answer: C**

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_intercept_swap (attaches 2 to x and leaves 3 standing alone, giving y = 2x + 3, which returns 3 at x = 0 rather than 2)",
  "B": "Student makes misconception: omits_constant_term (drops the intercept, giving a line through the origin when the data starts at 2)",
  "C": "Correct: the slope is 3 and the point (0, 2) gives the intercept 2, and 3 * 3 + 2 = 11 checks the last point",
  "D": "Student makes misconception: slope_run_over_rise (inverts the slope, using 1 / 3 in place of 3 / 1)"
},
"misconception_tag": {
  "A": "slope_intercept_swap",
  "B": "omits_constant_term",
  "D": "slope_run_over_rise"
}
```

---

##### Mini Quiz - Worked Solutions

**Item 1: A line passes through $(3, 8)$ and $(7, 20)$. What is the slope?**

Step 1: Rise.
- $20 - 8 = 12$

Step 2: Run.
- $7 - 3 = 4$

Step 3: Divide.
- $12 / 4 = 3$

**Answer: A** ($3$)

```json
"distractor_logic": {
  "A": "Correct: 20 - 8 = 12 and 7 - 3 = 4, so 12 / 4 = 3",
  "B": "Student makes misconception: slope_run_over_rise (inverts the fraction, computing 4 / 12 = 1/3)",
  "C": "Student makes misconception: slope_numerator_summed (adds the y values, computing 20 + 8 = 28 and then 28 / 4 = 7)",
  "D": "Student makes misconception: slope_denominator_summed (adds the x values, computing 7 + 3 = 10 and then 12 / 10 = 1.2)"
},
"misconception_tag": {
  "B": "slope_run_over_rise",
  "C": "slope_numerator_summed",
  "D": "slope_denominator_summed"
}
```

---

**Item 2: A line has slope $3$ and passes through $(3, 8)$. What is the $y$-intercept?**

Step 1: Substitute.
- $8 = 3 \times 3 + b$

Step 2: Simplify.
- $8 = 9 + b$

Step 3: Solve.
- $8 - 9 = -1$

**Answer: B** ($-1$)

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_intercept_swap (reports the slope, 3, where the intercept was asked for)",
  "B": "Correct: 8 = 9 + b, so 8 - 9 = -1",
  "C": "Student makes misconception: omits_variable_term (drops the 3x term and reads the point's y value, 8, as the intercept)",
  "D": "Student makes misconception: sign_error_on_constant (solves 8 = 9 + b as 9 - 8 = 1, reversing the subtraction and losing the sign)"
},
"misconception_tag": {
  "A": "slope_intercept_swap",
  "C": "omits_variable_term",
  "D": "sign_error_on_constant"
}
```

---

**Item 3: Use $y = 3x - 1$ to predict $y$ when $x = 6$.**

Step 1: Multiply first.
- $3 \times 6 = 18$

Step 2: Then subtract.
- $18 - 1 = 17$

**Answer: C** ($17$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (computes 3 * 6 = 18 and stops, dropping the constant)",
  "B": "Student makes misconception: omits_variable_term (drops the 3x term and reports the constant alone, -1)",
  "C": "Correct: 3 * 6 = 18 and 18 - 1 = 17",
  "D": "Student makes misconception: order_of_operations_violated (combines before multiplying, computing 3 - 1 = 2 and then 2 * 6 = 12)"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "B": "omits_variable_term",
  "D": "order_of_operations_violated"
}
```

---

**Item 4: Which model fits $(1, 4)$, $(2, 7)$, $(3, 10)$ better?**

Step 1: Test $y = 3x + 1$.
- $4, 7, 10$. All three match.

Step 2: Test $y = 4x$.
- $4, 8, 12$ against $4, 7, 10$. Only the first matches.

**Answer: D**

```json
"distractor_logic": {
  "A": "Student makes misconception: fit_judged_by_intercept (judges by the single point the model anchors on, when 4 * 2 = 8 against 7 and 4 * 3 = 12 against 10 both miss)",
  "B": "Student makes misconception: omits_constant_term (prefers the model without an intercept because it is shorter, when the data does not pass through the origin)",
  "C": "Student makes misconception: slope_numerator_summed (computes a slope from summed values rather than differences, giving 7 over 2 rather than 3)",
  "D": "Correct: 3 * 1 + 1 = 4, 3 * 2 + 1 = 7 and 3 * 3 + 1 = 10, so all three match"
},
"misconception_tag": {
  "A": "fit_judged_by_intercept",
  "B": "omits_constant_term",
  "C": "slope_numerator_summed"
}
```

##### Extra Practice - Answer Key

**1. A line of best fit passes through the points $(2, 10)$ and $(6, 26)$. What is the slope of this line?**

Step 1: Find the change in $y$ and the change in $x$.
- $\Delta y = 26 - 10 = 16$, $\Delta x = 6 - 2 = 4$

Step 2: Divide the change in $y$ by the change in $x$.
- $\frac{16}{4} = 4$

**Answer: D** ($4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_run_over_rise (computes the change in x over the change in y, $\\frac{4}{16}$, instead of y over x)",
  "B": "Student makes misconception: subtracts_in_wrong_order (subtracts the x-values in reverse order in the denominator only, computing $\\frac{16}{-4} = -4$)",
  "C": "Student makes misconception: answers_intermediate_value (reports the change in y, 16, without dividing by the change in x)",
  "D": "Correct: divides the change in y, 16, by the change in x, 4, for a slope of 4"
},
"misconception_tag": {
  "A": "slope_run_over_rise",
  "B": "subtracts_in_wrong_order",
  "C": "answers_intermediate_value"
}
```

---

**2. A line has a slope of $3$ and passes through $(0, 5)$. What is the equation of the line in slope-intercept form?**

Step 1: Since the point has $x = 0$, its $y$-value, $5$, is the $y$-intercept directly.

Step 2: Write the equation with slope $3$ and intercept $5$.
- $y = 3x + 5$

**Answer: B** ($y = 3x + 5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_intercept_swap (assigns the slope's value, 3, to the intercept's position and the intercept's value, 5, to the slope's position)",
  "B": "Correct: slope 3 and y-intercept 5 give $y = 3x + 5$",
  "C": "Student makes misconception: omits_constant_term (writes the slope term correctly but drops the $+5$ intercept entirely)",
  "D": "Student makes misconception: sign_error_on_constant (flips the sign of the constant, writing $-5$ instead of $+5$)"
},
"misconception_tag": {
  "A": "slope_intercept_swap",
  "C": "omits_constant_term",
  "D": "sign_error_on_constant"
}
```

---

**3. A scatterplot's best-fit line is given by $y = 4x + 7$. What is the $y$-intercept?**

Step 1: In slope-intercept form $y = mx + b$, the intercept is $b$, the constant term.
- $7$

**Answer: A** ($7$)

```json
"distractor_logic": {
  "A": "Correct: the constant term, 7, is the y-intercept",
  "B": "Student makes misconception: slope_intercept_swap (reports the slope, 4, instead of the intercept that was asked for)",
  "C": "Student makes misconception: sign_error_on_constant (flips the sign of the constant, reporting $-7$ instead of $7$)",
  "D": "Student makes misconception: off_by_one_count (miscounts the constant term as 8 instead of 7)"
},
"misconception_tag": {
  "B": "slope_intercept_swap",
  "C": "sign_error_on_constant",
  "D": "off_by_one_count"
}
```

---

**4. A best-fit line is $y = -2x + 12$. Using this model, predict $y$ when $x = 3$.**

Step 1: Substitute $x = 3$ into the model.
- $y = -2(3) + 12$

Step 2: Compute.
- $y = -6 + 12 = 6$

**Answer: C** ($6$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (computes $-2(3) = -6$ correctly but never adds the $+12$ constant)",
  "B": "Student makes misconception: sign_error_on_constant (flips the sign of the constant, computing $-2(3) - 12 = -18$)",
  "C": "Correct: substitutes $x=3$ into $-2x+12$ for $-6+12=6$",
  "D": "Student makes misconception: slope_intercept_swap (swaps the roles of slope and intercept, computing $12(3) + (-2) = 34$)"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "B": "sign_error_on_constant",
  "D": "slope_intercept_swap"
}
```

---

**5. Data points $(2, 11)$ and $(6, 27)$ lie on a line. Write the equation of the line in slope-intercept form.**

Step 1: Find the slope.
- $\frac{27 - 11}{6 - 2} = \frac{16}{4} = 4$

Step 2: Use one point to solve for the intercept.
- $11 = 4(2) + b$, so $b = 3$

Step 3: Write the equation.
- $y = 4x + 3$

**Answer: B** ($y = 4x + 3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_run_over_rise (computes the slope as $\\frac{4}{16} = 0.25$, then solves for an intercept of 10.5 from that wrong slope)",
  "B": "Correct: slope of 4, and solving $11 = 4(2) + b$ gives an intercept of 3",
  "C": "Student makes misconception: omits_constant_term (finds the correct slope, 4, but never solves for or includes the intercept)",
  "D": "Student makes misconception: slope_intercept_swap (assigns the correctly found slope, 4, and intercept, 3, to each other's positions)"
},
"misconception_tag": {
  "A": "slope_run_over_rise",
  "C": "omits_constant_term",
  "D": "slope_intercept_swap"
}
```

---

**6. In the model $\text{Cost} = 15x + 40$, where $x$ is the number of hours a repair takes, what does the $40$ represent?**

Step 1: In $y = mx + b$ form, $40$ is the constant term, $b$.

Step 2: The constant term is the value of Cost when $x = 0$, a flat amount charged regardless of hours.

**Answer: D** (a flat base fee)

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_intercept_swap (assigns the intercept's meaning, a flat fee, to the slope's role instead)",
  "B": "Student makes misconception: slope_intercept_swap (misreads the constant term as a value to substitute for x rather than as the intercept itself)",
  "C": "Student makes misconception: slope_intercept_swap (confuses the fixed constant term with the variable, x, that the model is written in terms of)",
  "D": "Correct: 40 is the y-intercept, a flat fee charged even when x, the hours, is 0"
},
"misconception_tag": {
  "A": "slope_intercept_swap",
  "B": "slope_intercept_swap",
  "C": "slope_intercept_swap"
}
```

---

**7. In the model $\text{Cost} = 15x + 40$, what does the $15$ represent?**

Step 1: In $y = mx + b$ form, $15$ is the coefficient of $x$, the slope.

Step 2: The slope is the rate of change, here the cost per hour.

**Answer: A** (the cost per hour, the rate)

```json
"distractor_logic": {
  "A": "Correct: 15 is the slope, the cost per hour",
  "B": "Student makes misconception: slope_intercept_swap (assigns the slope's meaning, a rate, to the constant term's role instead)",
  "C": "Student makes misconception: slope_intercept_swap (confuses the rate coefficient with the total cost the model produces)",
  "D": "Student makes misconception: slope_intercept_swap (confuses the fixed coefficient, 15, with the variable, x, it multiplies)"
},
"misconception_tag": {
  "B": "slope_intercept_swap",
  "C": "slope_intercept_swap",
  "D": "slope_intercept_swap"
}
```

---

**8. Two models are proposed for the same scatterplot data: Model A is $y = 2x + 1$, and Model B is $y = 2x + 15$. At $x = 10$, the actual data value is $y = 20$. Which model fits this point better, and why?**

Step 1: Compute each model's prediction at $x = 10$. Model A: $2(10) + 1 = 21$. Model B: $2(10) + 15 = 35$.

Step 2: Compare each prediction to the actual value, $20$. Model A's error: $|21 - 20| = 1$. Model B's error: $|35 - 20| = 15$.

Step 3: The smaller error wins. Model A fits far better.

**Answer: C** (Model A, its prediction is closer to the actual value)

```json
"distractor_logic": {
  "A": "Student makes misconception: fit_judged_by_intercept (judges fit by which model has the larger intercept rather than by comparing predictions to the actual value)",
  "B": "Student makes misconception: fit_judged_by_intercept (dismisses both models based on their shared slope, a structural feature, rather than comparing their actual predictions)",
  "C": "Correct: compares each model's prediction to the actual value and finds Model A far closer",
  "D": "Student makes misconception: fit_judged_by_intercept (names the correct model but for the wrong reason, judging by the smaller intercept rather than by comparing predictions)"
},
"misconception_tag": {
  "A": "fit_judged_by_intercept",
  "B": "fit_judged_by_intercept",
  "D": "fit_judged_by_intercept"
}
```

---

**9. A line passes through $(3, 19)$ and has a slope of $5$. Another point on this line has $x = 8$. What is the $y$-value at that point?**

Step 1: Find the intercept using the known point.
- $19 = 5(3) + b$, so $b = 4$

Step 2: Write the equation and substitute $x = 8$.
- $y = 5(8) + 4 = 44$

**Answer: D** ($44$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (finds the intercept correctly as 4 but flips its sign, computing $5(8) - 4 = 36$)",
  "B": "Student makes misconception: omits_constant_term (computes $5(8) = 40$ and never solves for or adds the intercept)",
  "C": "Student makes misconception: slope_run_over_rise (inverts the slope to $\\frac{1}{5}$ when building the equation, giving a very different intercept and prediction)",
  "D": "Correct: solves for the intercept, 4, then substitutes $x=8$ into $y=5x+4$ for 44"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "B": "omits_constant_term",
  "C": "slope_run_over_rise"
}
```

---

**10. A scatterplot's best-fit line passes through $(0, 20)$ and $(10, 70)$. Using this model, predict the value at $x = 15$, and state whether this prediction is a reliable interpolation or a risky extrapolation, given the data only spans $x = 0$ to $x = 10$.**

Step 1: Find the slope and intercept. Slope: $\frac{70-20}{10-0} = 5$. Since $x=0$ gives $y=20$, the intercept is $20$.

Step 2: Write the model and substitute $x = 15$.
- $y = 5(15) + 20 = 95$

Step 3: Since $x=15$ falls outside the data's $0$ to $10$ range, this prediction extrapolates beyond the data and is riskier than a prediction within that range.

**Answer: B** ($y=95$, risky extrapolation)

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_run_over_rise (computes the slope as $\\frac{10}{50}=0.2$ instead of 5, giving a wrong prediction of 23, though it still correctly identifies the extrapolation risk)",
  "B": "Correct: predicts $y=95$ using the correctly fitted model, and correctly identifies $x=15$ as outside the data's range, a risky extrapolation",
  "C": "Student makes misconception: omits_constant_term (computes $5(15) = 75$ and never adds the intercept, 20, though it still correctly identifies the extrapolation risk)",
  "D": "Student makes misconception: extrapolates_beyond_data (computes the correct prediction, 95, but misjudges $x=15$ as within a safe range when it actually falls outside the data's 0 to 10 span)"
},
"misconception_tag": {
  "A": "slope_run_over_rise",
  "C": "omits_constant_term",
  "D": "extrapolates_beyond_data"
}
```

---

#### **Part 5: Extra Practice**

More of the same skill, for a worksheet rather than for the mastery gate. These items are drawn by the worksheet generator and are not part of the 9-of-12 practice gate or the 3-of-4 quiz gate. Worked solutions for them sit at the end of Part 4.

**Basic Level**

1. A line of best fit passes through the points $(2, 10)$ and $(6, 26)$. What is the slope of this line?
   - A) $\frac{1}{4}$
   - B) $-4$
   - C) $16$
   - D) $4$

2. A line has a slope of $3$ and passes through $(0, 5)$. What is the equation of the line in slope-intercept form?
   - A) $y = 5x + 3$
   - B) $y = 3x + 5$
   - C) $y = 3x$
   - D) $y = 3x - 5$

3. A scatterplot's best-fit line is given by $y = 4x + 7$. What is the $y$-intercept?
   - A) $7$
   - B) $4$
   - C) $-7$
   - D) $8$

4. A best-fit line is $y = -2x + 12$. Using this model, predict $y$ when $x = 3$.
   - A) $-6$
   - B) $-18$
   - C) $6$
   - D) $34$

**Proficient Level** (these require an extra step)

5. Data points $(2, 11)$ and $(6, 27)$ lie on a line. Write the equation of the line in slope-intercept form.
   - A) $y = 0.25x + 10.5$
   - B) $y = 4x + 3$
   - C) $y = 4x$
   - D) $y = 3x + 4$

6. In the model $\text{Cost} = 15x + 40$, where $x$ is the number of hours a repair takes, what does the $40$ represent?
   - A) The cost per hour of labor.
   - B) The total cost when $x = 40$.
   - C) The number of hours the repair took.
   - D) A flat base fee charged regardless of the number of hours.

7. In the model $\text{Cost} = 15x + 40$, what does the $15$ represent?
   - A) The cost per hour of labor, the rate of change.
   - B) The flat base fee.
   - C) The total cost.
   - D) The number of hours.

**Advanced Level** (these need multiple steps or reverse thinking)

8. Two models are proposed for the same scatterplot data: Model A is $y = 2x + 1$, and Model B is $y = 2x + 15$. At $x = 10$, the actual data value is $y = 20$. Which model fits this point better, and why?
   - A) Model B, because it has the larger intercept, $15$.
   - B) Neither model fits well, since both have the same slope.
   - C) Model A, because its prediction, $21$, is much closer to the actual value, $20$, than Model B's prediction, $35$.
   - D) Model A, because it has the smaller intercept, $1$.

9. A line passes through $(3, 19)$ and has a slope of $5$. Another point on this line has $x = 8$. What is the $y$-value at that point?
   - A) $36$
   - B) $40$
   - C) $20$
   - D) $44$

10. A scatterplot's best-fit line passes through $(0, 20)$ and $(10, 70)$. Using this model, predict the value at $x = 15$, and state whether this prediction is a reliable interpolation or a risky extrapolation, given the data only spans $x = 0$ to $x = 10$.
    - A) $y = 23$; this is a risky extrapolation.
    - B) $y = 95$; this is a risky extrapolation, since $x = 15$ falls outside the data's $0$ to $10$ range.
    - C) $y = 75$; this is a risky extrapolation.
    - D) $y = 95$; this is a safe interpolation, since the line already fits the data well.
