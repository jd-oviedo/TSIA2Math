---
topic_name: "Solving one-variable linear inequalities"
unit_number: 2
sequence_in_unit: 9
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Basic"
related_strand: "AR"
keywords: ["inequality", "solving inequalities", "flipping the sign", "negative coefficient", "strict inequality", "solution set"]
---

# AR.2.2 - Solving One-Variable Linear Inequalities

**Topic ID:** AR.2.2  
**Unit:** 2  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Solve a linear inequality like an equation, flipping the sign only when multiplying or dividing by a negative.
- Preserve strict versus non-strict inequality signs through every step of the solution.
- Round a real-world inequality answer to the value that is actually achievable, not the raw decimal.

---

#### **Part 1: Guided Notes**

##### Almost Exactly Like an Equation

Everything you learned in AR.2.1 transfers. Peel operations away from the variable, doing the same thing to both sides, until it stands alone.

$$3x + 5 > 20 \quad \rightarrow \quad 3x > 15 \quad \rightarrow \quad x > 5$$

Identical moves to an equation. The one difference is the answer's shape. An equation gives you a single number; an inequality gives you a **range**. $x > 5$ says every number above 5 works, and 5 itself does not.

There is exactly one new rule, and it is the entire topic.

---

##### The Mistake That Costs the Most Points

You multiply or divide by a negative and leave the sign pointing the same way.

$$-2x > 8$$

Divide both sides by $-2$ and the tempting answer is $x > -4$. It is wrong. The correct answer is

$$x < -4$$

**When you multiply or divide both sides by a negative number, the inequality sign flips.** Not when you add a negative, not when the answer happens to be negative. Only when you multiply or divide **by** one.

Here is why, and it is worth understanding rather than memorizing. Start with something plainly true:

$$3 < 5$$

Multiply both sides by $-1$. Now you have $-3$ and $-5$. Is $-3 < -5$? No. On a number line $-3$ sits to the **right** of $-5$, so $-3 > -5$. Multiplying by a negative reverses the order of every pair of numbers, so the sign that describes their order has to reverse too.

**Test your answer.** Pick a number in your solution range and put it in the original. For $-2x > 8$, try $x = -5$: $-2(-5) = 10$, and $10 > 8$. True, so $x < -4$ is right. Try $x = 0$ from the other answer: $-2(0) = 0$, and $0 > 8$ is false. That settles it in five seconds and it needs no rule at all.

---

##### Adding a Negative Does Not Flip

$$x - 7 \le 3 \quad \rightarrow \quad x \le 10$$

A negative number appeared, and nothing flipped, because the operation was addition. This is the confusion the rule creates, so hold the boundary firmly: **the trigger is multiplying or dividing by a negative, nothing else.**

---

##### Strict and Non-Strict

The four signs come in two pairs, and the difference matters.

| Sign | Means | Endpoint included? |
|---|---|---|
| $<$, $>$ | strictly less, strictly greater | no |
| $\le$, $\ge$ | at most, at least | yes |

The endpoint carries the difference between "up to and including 6 books" and "fewer than 6 books." Changing a $\le$ into a $<$ on the way through a solution changes the answer set, and it is a common silent slip. **Copy the sign forward at every line and only change it when the negative-division rule fires.**

Words map onto signs: "at most" and "no more than" are $\le$. "At least" and "no fewer than" are $\ge$. "Under" and "below" are $<$.

---

##### Longer Ones

**Example 1:** $5 - 2x \ge 11$

- $-2x \ge 6$ (subtract 5 from both sides; nothing flips, this is addition)
- $x \le -3$ (divide by $-2$; the sign flips)

Check with $x = -4$: $5 - 2(-4) = 5 + 8 = 13$, and $13 \ge 11$. True.

**Example 2:** $4(x - 2) < 2x + 6$

- $4x - 8 < 2x + 6$ (distribute into **both** terms)
- $2x < 14$
- $x < 7$

Check at the boundary: $4(7 - 2) = 20$ and $2(7) + 6 = 20$. Equal exactly at 7, which is why 7 itself is excluded and everything below it works.

**Example 3:** $-3(x + 4) \le 9$

- $-3x - 12 \le 9$ (the $-3$ hits both terms, so the $+4$ becomes $-12$)
- $-3x \le 21$
- $x \ge -7$ (divide by $-3$; flip)

Check at $x = -7$: $-3(-7 + 4) = -3(-3) = 9$, and $9 \le 9$. True, and the $\ge$ correctly includes it.

---

##### Inequalities in Context

**Example 4:** A student has \$50 and books cost \$8 each. How many can they buy?

$$8b \le 50 \quad \rightarrow \quad b \le 6.25$$

The algebra says 6.25, and you cannot buy a quarter of a book. **The context rounds, and it rounds toward what is actually possible**, which here is **down** to 6. Rounding up to 7 would cost \$56, which the student does not have.

Do not round by the usual rule. Ask what the situation permits.

---

##### The Four Traps

1. **Not flipping on a negative multiply or divide.** Test a number from your range in the original.
2. **Flipping when you only added a negative.** Addition never flips.
3. **Changing strict to non-strict.** Copy the sign forward at every step.
4. **Rounding a context answer the wrong way.** Ask what is actually possible, not what the decimal is nearest to.

---

#### **Part 2: Practice Problems**

Solve each inequality. Show your thinking.

**Basic Level** (try these first)

1. Solve $3x + 5 > 20$.
   - A) $x > 5$
   - B) $x < 5$
   - C) $x \ge 5$
   - D) $x > 8.33$

2. Solve $-2x > 8$.
   - A) $x > -4$
   - B) $x < -4$
   - C) $x < 4$
   - D) $x \le -4$

3. Solve $x - 7 \le 3$.
   - A) $x \le -4$
   - B) $x \ge 10$
   - C) $x \le 10$
   - D) $x < 10$

4. Solve $\frac{x}{-3} < 6$.
   - A) $x < -18$
   - B) $x > -18$
   - C) $x > 18$
   - D) $x \ge -18$

**Proficient Level** (these require an extra step)

5. Solve $5 - 2x \ge 11$.
   - A) $x \ge -3$
   - B) $x \le 3$
   - C) $x \le -8$
   - D) $x \le -3$

6. Solve $4(x - 2) < 2x + 6$.
   - A) $x > 7$
   - B) $x < 4$
   - C) $x < 7$
   - D) $x \le 7$

7. A student has \$50 and books cost \$8 each. How many books can the student buy?
   - A) At most $6$ books
   - B) At most $6.25$ books
   - C) At least $6$ books
   - D) At most $7$ books

**Advanced Level** (these need multiple steps or reverse thinking)

8. Solve $-3(x + 4) \le 9$.
   - A) $x \le -7$
   - B) $x \ge -7$
   - C) $x \ge 1$
   - D) $x \ge 7$

9. Solve $6 - x \le 2x - 3$.
   - A) $x \le 3$
   - B) $x \ge 1$
   - C) $x \ge 3$
   - D) $x > 3$

10. A taxi charges \$4 plus \$1.50 per mile. With \$25, how many whole miles can a passenger travel?
    - A) $16$ miles
    - B) $15$ miles
    - C) At least $14$ miles
    - D) $14$ miles

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Solve $4x - 3 < 13$.

- A) $x < 4$
- B) $x > 4$
- C) $x \le 4$
- D) $x < 2.5$

**Item 2**

Solve $-5x \le 20$.

- A) $x \le -4$
- B) $x \ge -4$
- C) $x \ge 4$
- D) $x > -4$

**Proficient Level**

**Item 3**

Solve $7 - 3x > 1$.

- A) $x > 2$
- B) $x < -2$
- C) $x < 2.67$
- D) $x < 2$

**Item 4**

A student has \$60 and tickets cost \$9 each. How many tickets can the student buy?

- A) At most $6.67$ tickets
- B) At most $7$ tickets
- C) At most $6$ tickets
- D) At least $6$ tickets

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Solve $3x + 5 > 20$.**

Step 1: Subtract 5 from both sides. This is addition, so nothing flips.
- $3x > 15$

Step 2: Divide by 3, which is positive, so again nothing flips.
- $x > 5$

Step 3: Test. At $x = 6$: $3(6) + 5 = 23 > 20$. True.

**Answer: A** ($x > 5$)

```json
"distractor_logic": {
  "A": "Correct: subtracts 5 and divides by the positive 3, leaving the sign pointing the same way throughout",
  "B": "Student makes misconception: inequality_direction_not_flipped (reverses the sign although both operations were with positive numbers; testing x equal to 4 gives 17, which is not greater than 20)",
  "C": "Student makes misconception: boundary_strictness_changed (turns the strict inequality into a non-strict one, wrongly including 5, where the expression equals 20 rather than exceeding it)",
  "D": "Student makes misconception: sign_error_on_constant (adds the 5 to the 20 instead of subtracting it, giving 25 over 3, or about 8.33)"
},
"misconception_tag": {
  "B": "inequality_direction_not_flipped",
  "C": "boundary_strictness_changed",
  "D": "sign_error_on_constant"
}
```

---

**2. Solve $-2x > 8$.**

Step 1: Divide both sides by $-2$. This is division by a negative, so the sign flips.
- $x < -4$

Step 2: Test a value in the range. At $x = -5$: $-2(-5) = 10 > 8$. True.

Step 3: Test one outside it. At $x = 0$: $-2(0) = 0$, and $0 > 8$ is false. Correct.

**Answer: B** ($x < -4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: inequality_direction_not_flipped (divides by -2 without reversing the sign; testing x equal to 0 gives 0, which is not greater than 8)",
  "B": "Correct: divides by -2 and flips the sign, giving x less than -4, which checks at x equal to -5",
  "C": "Student makes misconception: drops_negative_sign (divides by 2 rather than -2, losing the negative and producing a range on the wrong side of zero)",
  "D": "Student makes misconception: boundary_strictness_changed (flips correctly but turns the strict inequality into a non-strict one, wrongly including -4, where the expression equals 8)"
},
"misconception_tag": {
  "A": "inequality_direction_not_flipped",
  "C": "drops_negative_sign",
  "D": "boundary_strictness_changed"
}
```

---

**3. Solve $x - 7 \le 3$.**

Step 1: Add 7 to both sides. Addition never flips the sign, even though a negative was involved.
- $x \le 10$

Step 2: Test. At $x = 10$: $10 - 7 = 3$, and $3 \le 3$. True, so the endpoint belongs.

**Answer: C** ($x \le 10$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (subtracts the 7 from the 3 instead of adding it to both sides, producing -4)",
  "B": "Student makes misconception: inequality_direction_not_flipped (reverses the sign although the only operation was addition, which never flips)",
  "C": "Correct: adds 7 to both sides, keeping the sign as it was because addition does not flip it",
  "D": "Student makes misconception: boundary_strictness_changed (turns the non-strict inequality into a strict one, wrongly excluding 10, where the two sides are equal)"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "B": "inequality_direction_not_flipped",
  "D": "boundary_strictness_changed"
}
```

---

**4. Solve $\frac{x}{-3} < 6$.**

Step 1: Multiply both sides by $-3$. Multiplying by a negative flips the sign.
- $x > -18$

Step 2: Test. At $x = 0$: $\frac{0}{-3} = 0 < 6$. True, and 0 is in the range.

**Answer: B** ($x > -18$)

```json
"distractor_logic": {
  "A": "Student makes misconception: inequality_direction_not_flipped (multiplies by -3 without reversing the sign; testing x equal to -20 gives about 6.67, which is not less than 6)",
  "B": "Correct: multiplies by -3 and flips the sign, giving x greater than -18, which checks at x equal to 0",
  "C": "Student makes misconception: drops_negative_sign (multiplies by 3 rather than -3, losing the negative and landing on the wrong side of zero)",
  "D": "Student makes misconception: boundary_strictness_changed (flips correctly but includes -18, where the expression equals 6 rather than falling below it)"
},
"misconception_tag": {
  "A": "inequality_direction_not_flipped",
  "C": "drops_negative_sign",
  "D": "boundary_strictness_changed"
}
```

---

**Proficient Level**

**5. Solve $5 - 2x \ge 11$.**

Step 1: Subtract 5 from both sides. Addition, so no flip.
- $-2x \ge 6$

Step 2: Divide by $-2$. Division by a negative, so the sign flips.
- $x \le -3$

Step 3: Test. At $x = -4$: $5 - 2(-4) = 5 + 8 = 13 \ge 11$. True.

**Answer: D** ($x \le -3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: inequality_direction_not_flipped (divides by -2 without reversing the sign; testing x equal to 0 gives 5, which is not at least 11)",
  "B": "Student makes misconception: drops_negative_sign (divides by 2 rather than -2, losing the negative on the boundary value)",
  "C": "Student makes misconception: sign_error_on_constant (adds the 5 to the 11 instead of subtracting it from both sides, giving 16 over -2, or -8)",
  "D": "Correct: subtracts 5 to reach -2x at least 6, then divides by -2 and flips, giving x at most -3"
},
"misconception_tag": {
  "A": "inequality_direction_not_flipped",
  "B": "drops_negative_sign",
  "C": "sign_error_on_constant"
}
```

---

**6. Solve $4(x - 2) < 2x + 6$.**

Step 1: Distribute the 4 into both terms.
- $4x - 8 < 2x + 6$

Step 2: Collect. Subtract $2x$ and add 8 to both sides.
- $2x < 14$

Step 3: Divide by the positive 2, so no flip.
- $x < 7$

Step 4: Check the boundary. At $x = 7$ both sides equal 20, so 7 is excluded and everything below works.

**Answer: C** ($x < 7$)

```json
"distractor_logic": {
  "A": "Student makes misconception: inequality_direction_not_flipped (reverses the sign although every operation used positive numbers)",
  "B": "Student makes misconception: drops_grouping_symbols (distributes the 4 into the x only, writing 4x - 2, which leaves 2x less than 8 and gives x less than 4)",
  "C": "Correct: distributes to 4x - 8, collects to 2x less than 14, and divides by the positive 2",
  "D": "Student makes misconception: boundary_strictness_changed (includes 7, where the two sides are equal at 20 rather than one being strictly less)"
},
"misconception_tag": {
  "A": "inequality_direction_not_flipped",
  "B": "drops_grouping_symbols",
  "D": "boundary_strictness_changed"
}
```

---

**7. A student has \$50 and books cost \$8 each. How many books can the student buy?**

Step 1: Write the inequality. The spend cannot exceed the money.
- $8b \le 50$

Step 2: Divide by the positive 8.
- $b \le 6.25$

Step 3: Round toward what the situation permits. Books come whole, and 7 books would cost \$56, which is more than \$50.
- At most 6 books

Step 4: Check. $8(6) = 48 \le 50$. True, with \$2 left over.

**Answer: A** (At most $6$ books)

```json
"distractor_logic": {
  "A": "Correct: solves to b at most 6.25, then rounds down to 6 because 7 books would cost 56 dollars",
  "B": "Student makes misconception: answers_intermediate_value (reports the unrounded bound of 6.25 as the answer, though books cannot be bought in quarters)",
  "C": "Student makes misconception: inequality_direction_not_flipped (states the bound as a minimum when the money imposes a maximum; the student cannot buy any number of books at least 6)",
  "D": "Student makes misconception: off_by_one_count (rounds 6.25 up rather than down, giving a purchase costing 56 dollars against 50 available)"
},
"misconception_tag": {
  "B": "answers_intermediate_value",
  "C": "inequality_direction_not_flipped",
  "D": "off_by_one_count"
}
```

---

**Advanced Level**

**8. Solve $-3(x + 4) \le 9$.**

Step 1: Distribute. The $-3$ multiplies both terms, so the $+4$ becomes $-12$.
- $-3x - 12 \le 9$

Step 2: Add 12 to both sides. Addition, so no flip.
- $-3x \le 21$

Step 3: Divide by $-3$. Division by a negative, so the sign flips.
- $x \ge -7$

Step 4: Check at the endpoint. $-3(-7 + 4) = -3(-3) = 9$, and $9 \le 9$. True, so $-7$ belongs.

**Answer: B** ($x \ge -7$)

```json
"distractor_logic": {
  "A": "Student makes misconception: inequality_direction_not_flipped (divides by -3 without reversing the sign; testing x equal to -10 gives 18, which is not at most 9)",
  "B": "Correct: distributes to -3x - 12, adds 12, then divides by -3 with a flip, giving x at least -7",
  "C": "Student makes misconception: drops_negative_on_group (applies the -3 to the x only, writing -3x + 12, which leads to x at least 1)",
  "D": "Student makes misconception: drops_negative_sign (divides by 3 rather than -3, losing the negative on the boundary value)"
},
"misconception_tag": {
  "A": "inequality_direction_not_flipped",
  "C": "drops_negative_on_group",
  "D": "drops_negative_sign"
}
```

---

**9. Solve $6 - x \le 2x - 3$.**

Step 1: Collect the variable terms on the side that keeps them positive. Add $x$ to both sides.
- $6 \le 3x - 3$

Step 2: Add 3 to both sides.
- $9 \le 3x$

Step 3: Divide by the positive 3. No flip.
- $3 \le x$, which is $x \ge 3$

Step 4: Check at the endpoint. $6 - 3 = 3$ and $2(3) - 3 = 3$. Equal, and $\le$ includes it.

**Answer: C** ($x \ge 3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: inequality_direction_not_flipped (reverses the sign although every operation used positive numbers; testing x equal to 0 gives 6 on the left and -3 on the right, so 0 is not a solution)",
  "B": "Student makes misconception: subtracts_in_wrong_order (computes 6 minus 3 as the numerator instead of 6 plus 3, dividing 3 by 3 to reach 1)",
  "C": "Correct: collects to 9 at most 3x and divides by the positive 3, giving x at least 3",
  "D": "Student makes misconception: boundary_strictness_changed (excludes 3, where the two sides are equal at 3 and the non-strict sign includes it)"
},
"misconception_tag": {
  "A": "inequality_direction_not_flipped",
  "B": "subtracts_in_wrong_order",
  "D": "boundary_strictness_changed"
}
```

---

**10. A taxi charges \$4 plus \$1.50 per mile. With \$25, how many whole miles can a passenger travel?**

Step 1: Write the inequality.
- $1.50m + 4 \le 25$

Step 2: Subtract the fixed charge first.
- $1.50m \le 21$

Step 3: Divide.
- $m \le 14$

Step 4: Check. $1.50(14) + 4 = 21 + 4 = 25$, exactly the money available.

**Answer: D** ($14$ miles)

```json
"distractor_logic": {
  "A": "Student makes misconception: divides_before_subtracting_fee (divides the whole 25 by 1.50 without removing the 4 dollar flag-drop fee, reaching about 16.67 and rounding to 16)",
  "B": "Student makes misconception: off_by_one_count (adds a mile beyond the bound; 15 miles would cost 26.50, more than the 25 available)",
  "C": "Student makes misconception: inequality_direction_not_flipped (states the bound as a minimum when the money imposes a maximum)",
  "D": "Correct: subtracts the 4 dollar fee to leave 21, divides by 1.50 for 14 miles, which costs exactly 25 dollars"
},
"misconception_tag": {
  "A": "divides_before_subtracting_fee",
  "B": "off_by_one_count",
  "C": "inequality_direction_not_flipped"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Solve $4x - 3 < 13$.**

Step 1: Add 3 to both sides.
- $4x < 16$

Step 2: Divide by the positive 4. No flip.
- $x < 4$

**Answer: A** ($x < 4$)

```json
"distractor_logic": {
  "A": "Correct: adds 3 and divides by the positive 4, leaving the sign unchanged",
  "B": "Student makes misconception: inequality_direction_not_flipped (reverses the sign although both operations used positive numbers)",
  "C": "Student makes misconception: boundary_strictness_changed (includes 4, where the expression equals 13 rather than falling below it)",
  "D": "Student makes misconception: sign_error_on_constant (subtracts the 3 from the 13 instead of adding it to both sides, giving 10 over 4, or 2.5)"
},
"misconception_tag": {
  "B": "inequality_direction_not_flipped",
  "C": "boundary_strictness_changed",
  "D": "sign_error_on_constant"
}
```

---

**Item 2: Solve $-5x \le 20$.**

Step 1: Divide both sides by $-5$, which flips the sign.
- $x \ge -4$

Step 2: Test. At $x = 0$: $-5(0) = 0 \le 20$. True, and 0 is in the range.

**Answer: B** ($x \ge -4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: inequality_direction_not_flipped (divides by -5 without reversing the sign; testing x equal to -10 gives 50, which is not at most 20)",
  "B": "Correct: divides by -5 and flips the sign, giving x at least -4, which checks at x equal to 0",
  "C": "Student makes misconception: drops_negative_sign (divides by 5 rather than -5, losing the negative on the boundary value)",
  "D": "Student makes misconception: boundary_strictness_changed (excludes -4, where the expression equals 20 and the non-strict sign includes it)"
},
"misconception_tag": {
  "A": "inequality_direction_not_flipped",
  "C": "drops_negative_sign",
  "D": "boundary_strictness_changed"
}
```

---

**Item 3: Solve $7 - 3x > 1$.**

Step 1: Subtract 7 from both sides. Addition, so no flip.
- $-3x > -6$

Step 2: Divide by $-3$, which flips the sign.
- $x < 2$

Step 3: Test. At $x = 0$: $7 - 0 = 7 > 1$. True.

**Answer: D** ($x < 2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: inequality_direction_not_flipped (divides by -3 without reversing the sign; testing x equal to 3 gives -2, which is not greater than 1)",
  "B": "Student makes misconception: drops_negative_sign (loses the negative on the right-hand side, dividing -6 by 3 as though it were positive)",
  "C": "Student makes misconception: sign_error_on_constant (adds the 7 to the 1 instead of subtracting it from both sides, giving 8 over 3, or about 2.67)",
  "D": "Correct: subtracts 7 to reach -3x greater than -6, then divides by -3 with a flip, giving x less than 2"
},
"misconception_tag": {
  "A": "inequality_direction_not_flipped",
  "B": "drops_negative_sign",
  "C": "sign_error_on_constant"
}
```

---

**Item 4: A student has \$60 and tickets cost \$9 each. How many tickets can the student buy?**

Step 1: Write the inequality.
- $9t \le 60$

Step 2: Divide.
- $t \le 6.67$

Step 3: Round toward what is possible. Seven tickets would cost \$63, more than \$60.
- At most 6 tickets

**Answer: C** (At most $6$ tickets)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (reports the unrounded bound of about 6.67, though tickets cannot be bought in fractions)",
  "B": "Student makes misconception: off_by_one_count (rounds up rather than down, giving a purchase costing 63 dollars against 60 available)",
  "C": "Correct: solves to t at most about 6.67, then rounds down to 6 because 7 tickets would cost 63 dollars",
  "D": "Student makes misconception: inequality_direction_not_flipped (states the bound as a minimum when the money imposes a maximum)"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "B": "off_by_one_count",
  "D": "inequality_direction_not_flipped"
}
```
