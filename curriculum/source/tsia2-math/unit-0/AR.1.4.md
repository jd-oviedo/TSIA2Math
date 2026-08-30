---
topic_name: "Distinguishing function types (linear, quadratic, exponential, etc.)"
unit_number: 0
sequence_in_unit: 14
assessment_layer: "ENRICHMENT"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "AR"
keywords: ["linear", "quadratic", "exponential", "function family", "first differences", "second differences", "common ratio", "growth"]
---

# AR.1.4 - Distinguishing Function Types (Linear, Quadratic, Exponential)

**Topic ID:** AR.1.4  
**Unit:** 0  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** ENRICHMENT  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Classify a function as linear, quadratic, or exponential based on where the variable sits in its equation.
- Determine a function's family from a table by testing first differences, then second differences, then common ratios, in that order.
- Avoid classifying a function by how fast it appears to grow, and correctly read the base of an exponential expression as a multiplier rather than an added amount.

---

#### **Part 1: Guided Notes**

##### Three Ways to Get Richer

Suppose you start with \$100.

**Plan A:** you add \$10 every year. After four years: $110$, $120$, $130$, $140$.

**Plan B:** you gain $10\%$ every year, so the amount is multiplied by $1.1$ each time. After four years: $110$, $121$, $133.10$, $146.41$.

Plan A adds the same amount each step. Plan B multiplies by the same amount each step. Over four years they look nearly identical. Over forty years Plan B leaves Plan A far behind, and the reason is not that it grows "faster" in some vague way. It is that **adding and multiplying are different operations**, and that difference is the entire topic.

$$\textbf{Linear adds a constant.} \qquad \textbf{Exponential multiplies by a constant.}$$

Quadratic is a third thing, which we will pin down in a moment.

---

##### Telling Them Apart From an Equation: Where Is the Variable?

The test is one question: **where does $x$ sit?**

| Family | Form | Where $x$ is |
|---|---|---|
| Linear | $y = mx + b$ | multiplied, to the first power |
| Quadratic | $y = ax^2 + bx + c$ | squared |
| Exponential | $y = a \cdot b^x$ | **in the exponent** |

The distinction that decides most items is this pair:

$$x^2 \quad \text{versus} \quad 2^x$$

They use the same two symbols and they are completely different functions.

- $x^2$ has a **variable base** and a **constant exponent**. That is quadratic.
- $2^x$ has a **constant base** and a **variable exponent**. That is exponential.

Ask yourself out loud: "is the changing thing on the ground floor or upstairs?" On the ground floor being squared, quadratic. Upstairs in the exponent, exponential.

Check the difference with actual numbers, because the size of it is startling.

| $x$ | $x^2$ | $2^x$ |
|---|---|---|
| $2$ | $4$ | $4$ |
| $3$ | $9$ | $8$ |
| $5$ | $25$ | $32$ |
| $10$ | $100$ | $1024$ |

They agree at $x = 2$, which is exactly why the confusion survives so long.

---

##### Telling Them Apart From a Table

You cannot see an equation here, so you compute. Two tools, applied in order.

**Tool 1: first differences.** Subtract each $y$ from the next one.

**Tool 2: common ratio.** Divide each $y$ by the previous one.

Then read off the verdict:

| What is constant | Family |
|---|---|
| first differences | linear |
| second differences (and not zero) | quadratic |
| ratio between consecutive values | exponential |

**Important: the $x$ values must step evenly** for any of this to work. If $x$ runs $1, 2, 4, 7$, the differences are meaningless. Check the input column first.

---

##### Example 1: Constant First Differences

| $x$ | $1$ | $2$ | $3$ | $4$ |
|---|---|---|---|---|
| $y$ | $5$ | $8$ | $11$ | $14$ |

First differences: $8-5 = 3$, $11-8 = 3$, $14-11 = 3$.

Constant at $3$. **Linear.** Stop here; there is no need to go further.

---

##### Example 2: Constant Second Differences

| $x$ | $1$ | $2$ | $3$ | $4$ | $5$ |
|---|---|---|---|---|---|
| $y$ | $3$ | $6$ | $11$ | $18$ | $27$ |

First differences: $3, 5, 7, 9$. Not constant, so it is not linear.

Second differences, meaning the differences of those: $5-3 = 2$, $7-5 = 2$, $9-7 = 2$.

Constant at $2$. **Quadratic.**

---

##### Example 3: Constant Ratio

| $x$ | $0$ | $1$ | $2$ | $3$ |
|---|---|---|---|---|
| $y$ | $2$ | $6$ | $18$ | $54$ |

First differences: $4, 12, 36$. Not constant, so not linear.

Second differences: $8, 24$. Not constant either, so not quadratic.

Ratios: $6 \div 2 = 3$, $18 \div 6 = 3$, $54 \div 18 = 3$.

Constant at $3$. **Exponential**, and the equation is $y = 2 \cdot 3^x$.

Notice how the $2$ and the $3$ read off the table. The $2$ is the value at $x = 0$, the starting amount. The $3$ is what you multiply by each step.

---

##### The Zero Trap

This one deserves its own section because it catches thorough students specifically.

| $x$ | $1$ | $2$ | $3$ | $4$ |
|---|---|---|---|---|
| $y$ | $7$ | $10$ | $13$ | $16$ |

First differences: $3, 3, 3$.

A student who keeps going computes second differences: $0, 0$. Those are constant. The rule said constant second differences means quadratic, so the answer must be quadratic.

**It is linear.**

Constant second differences indicate a quadratic **only when those second differences are not zero**. A second difference of zero is just a restatement of the first differences already being constant, which is the definition of linear.

So the order matters, and you stop at the first hit:

1. Are the first differences constant? If yes, **linear**. Stop.
2. If not, are the second differences constant and non-zero? If yes, **quadratic**. Stop.
3. If not, is the ratio constant? If yes, **exponential**.

Working the list in order means the zero trap can never fire, because you never reach step 2 on a linear table.

---

##### Do Not Judge by Appearance

"The numbers get big fast, so it is exponential."

That reasoning is wrong often enough to be dangerous. $y = x^2$ at $x = 100$ gives $10{,}000$, which is plenty big and not exponential at all. Quadratics grow fast too. So do cubics.

**Fast growth does not name a family. Only the computation does.** Take the differences. Take the ratio. It costs fifteen seconds and it is the only thing that actually answers the question.

The mirror error is using the wrong tool for the family you suspect. Differences test for linear and quadratic. **Ratios test for exponential.** Computing differences on an exponential table gives $4, 12, 36$, which is not constant and correctly tells you it is not linear, but it will never confirm exponential. You have to divide.

---

##### Reading an Exponential Equation

$$f(x) = 5 \cdot 2^x$$

- The $5$ is the **starting value**, the output when $x = 0$.
- The $2$ is the **growth factor**, what the output is multiplied by each time $x$ goes up by one.

The commonest misreading is treating that $2$ as an amount **added** each step. It is not; it is a multiplier. Starting at $5$: the outputs are $5$, $10$, $20$, $40$. Adding $2$ each time would have given $5$, $7$, $9$, $11$, a completely different function that happens to start in the same place.

A growth factor above $1$ means growth. Below $1$, say $0.8$, it means decay: the quantity shrinks by a constant proportion each step, and it is still exponential.

---

##### The Four Traps

1. **Confusing $x^2$ with $2^x$.** Variable on the ground floor is quadratic; variable upstairs is exponential.
2. **Reading zero second differences as quadratic.** Check the first differences first and stop when they are constant.
3. **Naming a family from how fast it looks.** Compute the differences and the ratio. Always.
4. **Reading a growth factor as an amount added.** In $a \cdot b^x$, the $b$ multiplies.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Which of the following is an exponential function?
   - A) $y = x^2$
   - B) $y = x^3$
   - C) $y = 3^x$
   - D) $y = 3x$

2. Which of the following is a quadratic function?
   - A) $y = 2^x - 4$
   - B) $y = x^2 - 4$
   - C) $y = 2x - 4$
   - D) $y = x^3 - 4$

3. A table shows $x$ values $1, 2, 3, 4$ with $y$ values $5, 8, 11, 14$. Which family does this function belong to?
   - A) Quadratic, because the second differences are constant at $0$.
   - B) Linear, because the first differences are constant at $3$.
   - C) Exponential, because the $y$ values increase at every step.
   - D) Exponential, because the differences between $y$ values are constant.

4. A table shows $x$ values $0, 1, 2, 3$ with $y$ values $2, 6, 18, 54$. Which family does this function belong to?
   - A) Linear, because the differences $4$, $12$, $36$ follow a clear pattern.
   - B) Quadratic, because the $y$ values grow faster and faster.
   - C) Exponential, because consecutive $y$ values have a constant ratio of $3$.
   - D) Linear, because each $y$ value comes from the one before it by a single fixed operation.

**Proficient Level** (these require an extra step)

5. A table shows $x$ values $1, 2, 3, 4, 5$ with $y$ values $3, 6, 11, 18, 27$. Which family does this function belong to?
   - A) Quadratic, because the second differences are constant at $2$.
   - B) Linear, because the $y$ values increase at every step.
   - C) Exponential, because the ratios of consecutive $y$ values are all near $1.6$.
   - D) Cubic, because three rounds of differences are needed before a pattern appears.

6. A table shows $x$ values $1, 2, 3, 4$ with $y$ values $7, 10, 13, 16$. A student computes the second differences, gets $0$ and $0$, and concludes the function is quadratic. Is the student correct?
   - A) No, it is exponential, because the differences between $y$ values are constant.
   - B) Yes, it is quadratic, because the second differences came out constant.
   - C) No, it is exponential, because the $y$ values keep rising.
   - D) No, it is linear. Constant second differences mean quadratic only when they are not zero, and here the first differences are already constant.

7. For the function $f(x) = 5 \cdot 2^x$, which statement is correct?
   - A) It is exponential, and the $2$ is the factor the output is multiplied by at each step.
   - B) It is quadratic, and the $2$ is an exponent applied to $x$.
   - C) It is linear, and the $2$ is the slope multiplying $x$.
   - D) It is exponential, and the $2$ is the amount added to the output at each step.

**Advanced Level** (these need multiple steps or reverse thinking)

8. One savings account starts at \$100 and increases by \$10 each year. A second starts at \$100 and increases by $10\%$ each year. Which statement describes the two accounts?
   - A) The first is linear and the second is quadratic, because percentage growth curves upward.
   - B) Both are linear, because both increase by ten each year.
   - C) Both are exponential, because both grow larger over time.
   - D) The first is linear and the second is exponential.

9. Which equation produces the table with $x$ values $0, 1, 2, 3$ and $y$ values $4, 12, 36, 108$?
   - A) $y = 2x^2 + 6x + 4$
   - B) $y = 4x^3$
   - C) $y = 8x + 4$
   - D) $y = 4 \cdot 3^x$

10. Two functions both pass through the points $(0, 3)$ and $(1, 6)$. One is linear and the other is exponential. What is the value of each function at $x = 3$?
    - A) The linear function gives $24$ and the exponential gives $12$.
    - B) The linear function gives $12$ and the exponential gives $24$.
    - C) Both give $12$, because they agree at the two points given.
    - D) The linear function gives $12$ and the exponential gives $18$.

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Which of the following is an exponential function?

- A) $y = 5^x$
- B) $y = x^5$
- C) $y = 5x$
- D) $y = x^2 + 5$

**Item 2**

A table shows $x$ values $1, 2, 3, 4$ with $y$ values $4, 7, 10, 13$. Which family does this function belong to?

- A) Exponential, because the $y$ values keep increasing.
- B) Quadratic, because the second differences are constant at $0$.
- C) Linear, because the first differences are constant at $3$.
- D) Exponential, because the differences between $y$ values are constant.

**Item 3**

A table shows $x$ values $0, 1, 2, 3$ with $y$ values $3, 12, 48, 192$. Which family does this function belong to?

- A) Quadratic, because the values curve upward sharply.
- B) Exponential, because consecutive $y$ values have a constant ratio of $4$.
- C) Linear, because each value comes from the one before it by a single fixed operation.
- D) Linear, because the first differences $9$, $36$ and $144$ are themselves related by a constant.

**Proficient Level**

**Item 4**

In the function $f(x) = 2 \cdot 3^x$, what does the $3$ represent?

- A) The rate at which the graph curves, which makes the function quadratic.
- B) The amount added to the output for each increase of $1$ in $x$.
- C) The power to which $x$ is raised.
- D) The factor the output is multiplied by for each increase of $1$ in $x$.

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Which of the following is an exponential function?**

Step 1: Ask where the variable sits in each option.
- $3^x$: the variable is in the exponent
- $x^3$: the variable is the base, exponent is constant
- $x^2$: the variable is the base, exponent is constant
- $3x$: the variable is multiplied, first power

Step 2: Exponential means the variable is upstairs, in the exponent.

**Answer: C** ($y = 3^x$)

```json
"distractor_logic": {
  "A": "Student makes misconception: exponent_position_confused (selects the squared form, again placing the variable on the base rather than in the exponent)",
  "B": "Student makes misconception: exponent_position_confused (reads a variable base with a constant exponent as exponential, taking x cubed for 3 to the x)",
  "C": "Correct: the variable sits in the exponent over a constant base, which is exactly the exponential form",
  "D": "Student makes misconception: family_matched_by_surface_growth (matches on the visible 3 without checking where the variable sits, selecting a linear function)"
},
"misconception_tag": {
  "A": "exponent_position_confused",
  "B": "exponent_position_confused",
  "D": "family_matched_by_surface_growth"
}
```

---

**2. Which of the following is a quadratic function?**

Step 1: Quadratic means the variable is squared.

Step 2: Sort the options.
- $x^2 - 4$: variable squared. Quadratic.
- $2^x - 4$: variable in the exponent. Exponential.
- $2x - 4$: variable to the first power. Linear.
- $x^3 - 4$: variable cubed. Cubic, not quadratic.

**Answer: B** ($y = x^2 - 4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: exponent_position_confused (takes 2 to the x for x squared, swapping which of the two symbols is the variable)",
  "B": "Correct: the variable is raised to the second power, which is the quadratic form",
  "C": "Student makes misconception: family_matched_by_surface_growth (matches on the visible 2 rather than on the power the variable carries, selecting a linear function)",
  "D": "Student makes misconception: family_matched_by_surface_growth (selects a form on the strength of it having an exponent at all, without checking that the exponent is 2)"
},
"misconception_tag": {
  "A": "exponent_position_confused",
  "C": "family_matched_by_surface_growth",
  "D": "family_matched_by_surface_growth"
}
```

---

**3. A table shows $x$ values $1, 2, 3, 4$ with $y$ values $5, 8, 11, 14$.**

Step 1: Check the $x$ values step evenly. They go up by $1$ each time.

Step 2: First differences.
- $8 - 5 = 3$, $11 - 8 = 3$, $14 - 11 = 3$

Step 3: Constant at $3$, so it is linear. Stop here.

**Answer: B** (linear)

```json
"distractor_logic": {
  "A": "Student makes misconception: zero_second_differences_read_as_quadratic (continues past the constant first differences and reads second differences of zero as the quadratic signature, when zero simply restates that the first differences were already constant)",
  "B": "Correct: the first differences are constant at 3, which is the definition of linear",
  "C": "Student makes misconception: family_matched_by_surface_growth (names a family from the fact that the values rise, without computing anything)",
  "D": "Student makes misconception: differences_vs_ratios_confused (uses constant differences as evidence for exponential, when constant differences mean linear and exponential is tested with ratios)"
},
"misconception_tag": {
  "A": "zero_second_differences_read_as_quadratic",
  "C": "family_matched_by_surface_growth",
  "D": "differences_vs_ratios_confused"
}
```

---

**4. A table shows $x$ values $0, 1, 2, 3$ with $y$ values $2, 6, 18, 54$.**

Step 1: First differences.
- $4, 12, 36$. Not constant, so not linear.

Step 2: Second differences.
- $8, 24$. Not constant, so not quadratic.

Step 3: Ratios.
- $6 \div 2 = 3$, $18 \div 6 = 3$, $54 \div 18 = 3$

Constant at $3$. Exponential, with equation $y = 2 \cdot 3^x$.

**Answer: C** (exponential)

```json
"distractor_logic": {
  "A": "Student makes misconception: differences_vs_ratios_confused (treats a recognisable pattern among the differences as evidence of linearity, when linear requires those differences to be equal)",
  "B": "Student makes misconception: family_matched_by_surface_growth (names quadratic from the accelerating appearance of the values without computing second differences, which are 8 and 24 and not constant)",
  "C": "Correct: the ratio between consecutive values is a constant 3, which is the exponential signature",
  "D": "Student makes misconception: differences_vs_ratios_confused (notices correctly that one fixed operation generates each value but names the family linear, when the fixed operation here is multiplication rather than addition)"
},
"misconception_tag": {
  "A": "differences_vs_ratios_confused",
  "B": "family_matched_by_surface_growth",
  "D": "differences_vs_ratios_confused"
}
```

---

**Proficient Level**

**5. A table shows $x$ values $1, 2, 3, 4, 5$ with $y$ values $3, 6, 11, 18, 27$.**

Step 1: First differences.
- $3, 5, 7, 9$. Not constant, so not linear.

Step 2: Second differences.
- $5 - 3 = 2$, $7 - 5 = 2$, $9 - 7 = 2$

Step 3: Constant at $2$, and not zero. Quadratic.

**Answer: A** (quadratic)

```json
"distractor_logic": {
  "A": "Correct: the second differences are constant at 2 and non-zero, which is the quadratic signature",
  "B": "Student makes misconception: family_matched_by_surface_growth (names linear from the steady rise without computing the first differences, which are 3, 5, 7 and 9 and are not equal)",
  "C": "Student makes misconception: differences_vs_ratios_confused (computes ratios and accepts values that are merely close to one another as a constant ratio, when the exponential test requires them to be equal)",
  "D": "Student makes misconception: family_matched_by_surface_growth (names a family from how many rounds of differences seemed necessary rather than from where the differences first became constant)"
},
"misconception_tag": {
  "B": "family_matched_by_surface_growth",
  "C": "differences_vs_ratios_confused",
  "D": "family_matched_by_surface_growth"
}
```

---

**6. A student computes second differences of $0$ and $0$ for the table $7, 10, 13, 16$ and concludes the function is quadratic.**

Step 1: Check the first differences first.
- $10 - 7 = 3$, $13 - 10 = 3$, $16 - 13 = 3$

Step 2: They are constant at $3$, so the function is linear and the work is finished.

Step 3: The second differences of zero are not evidence of anything new. They simply restate that the first differences never changed. Constant second differences mean quadratic **only when they are non-zero**.

**Answer: D** (no, it is linear)

```json
"distractor_logic": {
  "A": "Student makes misconception: differences_vs_ratios_confused (uses constant differences as evidence for exponential, when constant differences are the linear signature)",
  "B": "Student makes misconception: zero_second_differences_read_as_quadratic (applies the constant-second-difference rule without the non-zero condition, so every linear table reads as quadratic)",
  "C": "Student makes misconception: family_matched_by_surface_growth (names exponential from the fact that the values rise, without computing differences or ratios)",
  "D": "Correct: the first differences are constant, so the function is linear, and second differences of zero merely restate that fact"
},
"misconception_tag": {
  "A": "differences_vs_ratios_confused",
  "B": "zero_second_differences_read_as_quadratic",
  "C": "family_matched_by_surface_growth"
}
```

---

**7. For the function $f(x) = 5 \cdot 2^x$, which statement is correct?**

Step 1: The variable sits in the exponent, so the function is exponential.

Step 2: The $2$ is the base, the growth factor. Each time $x$ rises by $1$, the output is multiplied by $2$.

Step 3: Check with values. $f(0) = 5$, $f(1) = 10$, $f(2) = 20$, $f(3) = 40$. Each output is double the one before.

**Answer: A** (exponential, and the $2$ is a multiplier)

```json
"distractor_logic": {
  "A": "Correct: identifies the exponential form and reads the base as the factor applied at each step",
  "B": "Student makes misconception: exponent_position_confused (reads the 2 as an exponent sitting on x rather than as a base carrying x as its exponent)",
  "C": "Student makes misconception: family_matched_by_surface_growth (names linear from the presence of a coefficient, ignoring that x is in the exponent)",
  "D": "Student makes misconception: differences_vs_ratios_confused (identifies the family correctly but reads the growth factor as an amount added each step, which would give 5, 7, 9 rather than 5, 10, 20)"
},
"misconception_tag": {
  "B": "exponent_position_confused",
  "C": "family_matched_by_surface_growth",
  "D": "differences_vs_ratios_confused"
}
```

---

**Advanced Level**

**8. One account starts at \$100 and increases by \$10 each year. A second starts at \$100 and increases by $10\%$ each year.**

Step 1: The first account adds the same amount every year: $110$, $120$, $130$. Constant first differences, so linear.

Step 2: The second is multiplied by $1.1$ every year: $110$, $121$, $133.10$. Constant ratio, so exponential.

Step 3: The distinction is adding a fixed amount versus multiplying by a fixed factor. Both start at the same place and the first two years look close, which is exactly why the computation is needed.

**Answer: D** (the first is linear, the second exponential)

```json
"distractor_logic": {
  "A": "Student makes misconception: family_matched_by_surface_growth (names quadratic from the curved appearance of percentage growth rather than from a constant ratio or a second difference)",
  "B": "Student makes misconception: differences_vs_ratios_confused (reads a ten percent increase as adding ten, treating a multiplicative rate as an additive one)",
  "C": "Student makes misconception: family_matched_by_surface_growth (names both exponential because both grow, without distinguishing what operation produces the growth)",
  "D": "Correct: a fixed amount added each year is linear, and a fixed percentage applied each year is a constant multiplier and therefore exponential"
},
"misconception_tag": {
  "A": "family_matched_by_surface_growth",
  "B": "differences_vs_ratios_confused",
  "C": "family_matched_by_surface_growth"
}
```

---

**9. Which equation produces the table with $x$ values $0, 1, 2, 3$ and $y$ values $4, 12, 36, 108$?**

Step 1: First differences are $8, 24, 72$. Not constant, so not linear.

Step 2: Ratios are $12 \div 4 = 3$, $36 \div 12 = 3$, $108 \div 36 = 3$. Constant at $3$, so exponential.

Step 3: The value at $x = 0$ is $4$, so the equation is $y = 4 \cdot 3^x$.

Step 4: Verify every point, not just the first two. $4 \cdot 3^0 = 4$, $4 \cdot 3^1 = 12$, $4 \cdot 3^2 = 36$, $4 \cdot 3^3 = 108$. All four match.

**Answer: D** ($y = 4 \cdot 3^x$)

```json
"distractor_logic": {
  "A": "Student makes misconception: family_matched_by_surface_growth (chooses a quadratic because the values curve upward, which matches the first two points and then gives 24 instead of 36)",
  "B": "Student makes misconception: exponent_position_confused (writes the variable as the base with a constant exponent, giving 4 at x equals 1 rather than 12)",
  "C": "Student makes misconception: differences_vs_ratios_confused (takes the first difference of 8 as a constant rate of change, which matches the first two points and then gives 20 instead of 36)",
  "D": "Correct: the constant ratio of 3 with a starting value of 4 gives 4 times 3 to the x, which reproduces all four points"
},
"misconception_tag": {
  "A": "family_matched_by_surface_growth",
  "B": "exponent_position_confused",
  "C": "differences_vs_ratios_confused"
}
```

---

**10. Two functions pass through $(0, 3)$ and $(1, 6)$. One is linear, the other exponential. Find each at $x = 3$.**

Step 1: The linear one adds a constant. It went from $3$ to $6$, so it adds $3$ each step.
- $x = 0$: $3$, then $6$, then $9$, then $12$
- At $x = 3$ it gives $12$

Step 2: The exponential one multiplies by a constant. It went from $3$ to $6$, so it doubles each step.
- $x = 0$: $3$, then $6$, then $12$, then $24$
- At $x = 3$ it gives $24$

Step 3: Both agree at the two given points and separate immediately afterward, which is the whole reason two points never identify a family on their own.

**Answer: B** (linear $12$, exponential $24$)

```json
"distractor_logic": {
  "A": "Student makes misconception: differences_vs_ratios_confused (swaps which family repeats addition and which repeats multiplication, assigning each result to the wrong function)",
  "B": "Correct: the linear function adds 3 each step to reach 12, and the exponential doubles each step to reach 24",
  "C": "Student makes misconception: family_matched_by_surface_growth (assumes two shared points fix the whole function, so both families must agree everywhere)",
  "D": "Student makes misconception: exponent_position_confused (computes the exponential value by multiplying the base by x rather than raising the base to the power x, reaching 3 times 2 times 3)"
},
"misconception_tag": {
  "A": "differences_vs_ratios_confused",
  "C": "family_matched_by_surface_growth",
  "D": "exponent_position_confused"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Which of the following is an exponential function?**

Step 1: Exponential means the variable sits in the exponent.

Step 2: Only $5^x$ has the variable upstairs. The rest place it on the base or multiply it.

**Answer: A** ($y = 5^x$)

```json
"distractor_logic": {
  "A": "Correct: the variable sits in the exponent over a constant base",
  "B": "Student makes misconception: exponent_position_confused (reads a variable base with a constant exponent as exponential, taking x to the fifth for 5 to the x)",
  "C": "Student makes misconception: family_matched_by_surface_growth (matches on the visible 5 without checking where the variable sits, selecting a linear function)",
  "D": "Student makes misconception: exponent_position_confused (selects a squared form, placing the variable on the base rather than in the exponent)"
},
"misconception_tag": {
  "B": "exponent_position_confused",
  "C": "family_matched_by_surface_growth",
  "D": "exponent_position_confused"
}
```

---

**Item 2: A table shows $x$ values $1, 2, 3, 4$ with $y$ values $4, 7, 10, 13$.**

Step 1: First differences.
- $3, 3, 3$

Step 2: Constant, so linear. Stop.

**Answer: C** (linear)

```json
"distractor_logic": {
  "A": "Student makes misconception: family_matched_by_surface_growth (names a family from the fact that the values rise, without computing anything)",
  "B": "Student makes misconception: zero_second_differences_read_as_quadratic (reads second differences of zero as the quadratic signature, when zero only restates that the first differences were already constant)",
  "C": "Correct: the first differences are constant at 3, which is the linear signature",
  "D": "Student makes misconception: differences_vs_ratios_confused (uses constant differences as evidence for exponential, when exponential is tested with ratios)"
},
"misconception_tag": {
  "A": "family_matched_by_surface_growth",
  "B": "zero_second_differences_read_as_quadratic",
  "D": "differences_vs_ratios_confused"
}
```

---

**Item 3: A table shows $x$ values $0, 1, 2, 3$ with $y$ values $3, 12, 48, 192$.**

Step 1: First differences are $9, 36, 144$. Not constant.

Step 2: Ratios.
- $12 \div 3 = 4$, $48 \div 12 = 4$, $192 \div 48 = 4$

Step 3: Constant at $4$. Exponential, with equation $y = 3 \cdot 4^x$.

**Answer: B** (exponential)

```json
"distractor_logic": {
  "A": "Student makes misconception: family_matched_by_surface_growth (names quadratic from the sharp upward curve without computing second differences, which are 27 and 108 and not constant)",
  "B": "Correct: the ratio between consecutive values is a constant 4, which is the exponential signature",
  "C": "Student makes misconception: differences_vs_ratios_confused (notices correctly that one fixed operation generates each value but names it linear, when the fixed operation is multiplication rather than addition)",
  "D": "Student makes misconception: differences_vs_ratios_confused (finds a constant ratio among the first differences and reports linear, when a constant ratio anywhere in the chain points away from linear rather than toward it)"
},
"misconception_tag": {
  "A": "family_matched_by_surface_growth",
  "C": "differences_vs_ratios_confused",
  "D": "differences_vs_ratios_confused"
}
```

---

**Item 4: In the function $f(x) = 2 \cdot 3^x$, what does the $3$ represent?**

Step 1: The $3$ is the base, with $x$ as its exponent.

Step 2: Each time $x$ rises by $1$, the output picks up one more factor of $3$, so the output is multiplied by $3$.

Step 3: Check. $f(0) = 2$, $f(1) = 6$, $f(2) = 18$. Each is triple the one before.

**Answer: D** (the multiplying factor)

```json
"distractor_logic": {
  "A": "Student makes misconception: family_matched_by_surface_growth (names the function quadratic from its curved growth rather than from where the variable sits)",
  "B": "Student makes misconception: differences_vs_ratios_confused (reads the growth factor as an amount added each step, which would give 2, 5, 8 rather than 2, 6, 18)",
  "C": "Student makes misconception: exponent_position_confused (reads the 3 as an exponent sitting on x rather than as the base carrying x as its exponent)",
  "D": "Correct: the base of an exponential is the factor applied to the output at each unit step in x"
},
"misconception_tag": {
  "A": "family_matched_by_surface_growth",
  "B": "differences_vs_ratios_confused",
  "C": "exponent_position_confused"
}
```
