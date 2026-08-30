---
topic_name: "Absolute value"
unit_number: 0
sequence_in_unit: 4
assessment_layer: "ENRICHMENT"
estimated_time_minutes: 45
difficulty_band: "Basic"
related_strand: "QR"
keywords: ["absolute value", "distance from zero", "magnitude", "absolute value equations", "absolute value inequalities", "tolerance"]
---

# QR.1.8 - Absolute Value

**Topic ID:** QR.1.8  
**Unit:** 0  
**Strand:** QR (Quantitative Reasoning)  
**Assessment Layer:** ENRICHMENT  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Evaluate absolute value expressions as "distance from zero," distinguishing the operation from squaring or negating a number.
- Solve absolute value equations by splitting into two cases and checking both resulting solutions.
- Translate absolute value inequalities into the correct solution shape: a bounded interval for "less than," two separate tails for "greater than."

---

#### **Part 1: Guided Notes**

##### How Far, Not Which Way

Two people leave the same house. One walks three blocks east, the other walks three blocks west.

How far did each of them walk? Three blocks. Both of them. Nobody walked negative three blocks.

That is absolute value. It answers **how far from zero**, and it throws away **which direction**. Distance is never negative, because there is no such thing as walking a negative distance.

The notation is a pair of straight bars:

$$|-3| = 3 \qquad |3| = 3 \qquad |0| = 0$$

Read $|-3|$ out loud as "the distance from $-3$ to zero." Say it that way and the answer arrives on its own. Read it as "absolute value of negative three" and you will find yourself hunting for a rule.

---

##### The Only Rule You Need

**If the number inside is negative, drop the sign. If it is positive or zero, leave it alone.**

That is the entire mechanic. It is genuinely that simple, and the difficulty in this topic is never the rule. It is three specific confusions about what the bars do.

**Confusion 1: the bars are not a squaring machine.** $|-4|$ is $4$, not $16$. Squaring also destroys a negative sign, which is why the two get tangled, but squaring changes the size and absolute value does not.

**Confusion 2: the bars do not flip a positive.** $|5|$ is $5$. The bars only ever remove a minus sign; they never add one. A student who reports $-5$ has read the bars as "give me the opposite," which is a different operation entirely.

**Confusion 3: the bars are not invisible.** $|-7|$ is $7$, not $-7$. If your answer still carries a minus sign, the bars did nothing, and then why were they written.

---

##### A Minus Sign Outside the Bars Survives

This is the item that separates students who understand absolute value from students who have memorized "make it positive."

$$-|-6| = ?$$

Work it strictly inside out.

Step 1: Evaluate what is inside the bars. $|-6| = 6$.

Step 2: Now apply the minus sign that was sitting **outside**.
- $-6$

So $-|-6| = -6$. The answer is negative, and that is correct.

The bars only govern what is between them. A sign outside is not their business, exactly the way parentheses work. Absolute value is a grouping symbol as much as it is an operation.

---

##### Absolute Value Measures Distance Between Two Numbers

Here is the idea that makes absolute value useful rather than decorative.

$$|a - b| = \text{the distance between } a \text{ and } b \text{ on a number line}$$

**Example 1:** How far apart are $-3$ and $5$?

Step 1: Subtract them, in either order.
- $5 - (-3) = 5 + 3 = 8$

Step 2: Take the absolute value. $|8| = 8$.

The distance is $8$.

Subtract in the other order and you get $-3 - 5 = -8$, and $|-8| = 8$ as well. **The order does not matter**, which is exactly why absolute value is the right tool: distance from Dallas to Houston is the same as from Houston to Dallas.

Two errors live here. Multiplying the two numbers instead of subtracting gives $-15$, which is not a distance and is not even positive. And computing $-3 - 5 = -8$ and then reporting $-8$ forgets the bars at the last second.

---

##### Absolute Value Equations Have Two Answers

$$|x| = 6$$

Which numbers sit exactly $6$ away from zero? Two of them: $6$ and $-6$. Both are correct, and reporting only one is reporting half the answer.

**Every absolute value equation splits into two cases.** Set the inside equal to the positive value, then set it equal to the negative value.

**Example 2:** Solve $|x - 3| = 5$.

Step 1: Split into two cases. The inside is $x - 3$.
- Case 1: $x - 3 = 5$
- Case 2: $x - 3 = -5$

Step 2: Solve each.
- Case 1: $x = 8$
- Case 2: $x = -2$

Step 3: Check both in the original.
- $|8 - 3| = |5| = 5$. Correct.
- $|-2 - 3| = |-5| = 5$. Correct.

So $x = 8$ or $x = -2$.

Watch the constant when you solve case 2. The equation is $x - 3 = -5$, so $x = -5 + 3 = -2$. Students who write $x = 5 - 3 = 2$ have flipped the sign of the constant, and the check catches it: $|2 - 3| = 1$, not $5$.

**Always check both answers.** It takes ten seconds and it catches every sign slip in the topic.

---

##### Absolute Value Inequalities: Inside or Outside

Two shapes, two pictures. Draw the number line and you will never mix them up.

**Less than means squeezed in the middle.**

$$|x| < 4 \quad \text{means} \quad -4 < x < 4$$

Which numbers are less than $4$ away from zero? Everything between $-4$ and $4$. One connected stretch containing zero.

**Greater than means split to the outside.**

$$|x| > 4 \quad \text{means} \quad x < -4 \ \text{ or } \ x > 4$$

Which numbers are more than $4$ away from zero? Everything far out on the left, and everything far out on the right. Two separate pieces, with a gap in the middle.

The memory hook: **less than is a band, greater than is two tails.**

The other failure is reporting only the boundary points. The solution to $|x| < 4$ is not "$x = -4$ or $x = 4$." Those two numbers are the edges, and they are not even in the solution set. The answer is every number between them.

---

##### Where This Shows Up: Tolerance

Manufacturing is the reason absolute value inequalities exist on a placement test.

**Example 3:** A bolt is supposed to be $12.5$ mm long. The difference between the actual length $L$ and $12.5$ must be at most $0.3$ mm. Which lengths pass inspection?

Step 1: Translate. "The difference between $L$ and $12.5$" is $|L - 12.5|$, and "at most $0.3$" is $\le 0.3$.
- $|L - 12.5| \le 0.3$

Step 2: This is a less-than shape, so it is a band.
- $-0.3 \le L - 12.5 \le 0.3$

Step 3: Add $12.5$ to all three parts.
- $12.2 \le L \le 12.8$

Any bolt between $12.2$ mm and $12.8$ mm passes.

Notice what absolute value bought you: one short inequality covering "too long" and "too short" at once, without caring which way the error went. That is the whole point of the operation.

---

##### The Four Traps

1. **Leaving the sign on.** $|-7|$ is $7$. If a minus survived the bars, the bars did nothing.
2. **Confusing the bars with squaring.** $|-4|$ is $4$, not $16$.
3. **Solving only one case.** An absolute value equation almost always has two answers. Find both, check both.
4. **Reporting boundaries instead of the interval.** $|x| < 4$ is every number between $-4$ and $4$, not the two edges.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. What is the value of $|-7|$?
   - A) $-7$
   - B) $7$
   - C) $49$
   - D) $0$

2. What is the value of $|3 - 8|$?
   - A) $11$
   - B) $-5$
   - C) $24$
   - D) $5$

3. What is the value of $-|-6|$?
   - A) $6$
   - B) $-6$
   - C) $36$
   - D) $0$

4. What is the distance between $-3$ and $5$ on a number line?
   - A) $-15$
   - B) $2$
   - C) $-8$
   - D) $8$

**Proficient Level** (these require an extra step)

5. What are all the solutions to $|x| = 6$?
   - A) $x = 6$ or $x = -6$
   - B) $x = 6$
   - C) $x = 36$
   - D) $x = 0$

6. What are all the solutions to $|x - 3| = 5$?
   - A) $x = 5$ or $x = -5$
   - B) $x = 8$
   - C) $x = 8$ or $x = 2$
   - D) $x = 8$ or $x = -2$

7. What is the value of $|2 - 9| - |-3|$?
   - A) $-4$
   - B) $4$
   - C) $10$
   - D) $-10$

**Advanced Level** (these need multiple steps or reverse thinking)

8. What are all the solutions to $|2x + 1| = 9$?
   - A) $x = 4$ or $x = -5$
   - B) $x = 4$
   - C) $x = 5$ or $x = -4$
   - D) $x = 4.5$ or $x = -4.5$

9. Which of the following describes all solutions to $|x| < 4$?
   - A) $x < 4$
   - B) $x = -4$ or $x = 4$
   - C) $-4 < x < 4$
   - D) $x < -4$ or $x > 4$

10. A bolt is supposed to be $12.5$ mm long. To pass inspection, the difference between the actual length $L$ and $12.5$ mm must be at most $0.3$ mm, so $|L - 12.5| \le 0.3$. Which lengths pass inspection?
    - A) $L \le 12.2$ or $L \ge 12.8$
    - B) $L = 12.2$ or $L = 12.8$
    - C) $12.2 \le L \le 12.8$
    - D) $L \le 12.8$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

What is the value of $|-12|$?

- A) $144$
- B) $-12$
- C) $0$
- D) $12$

**Item 2**

What is the value of $|4 - 11|$?

- A) $-7$
- B) $7$
- C) $44$
- D) $15$

**Proficient Level**

**Item 3**

What are all the solutions to $|x + 2| = 7$?

- A) $x = 5$ or $x = -9$
- B) $x = 5$
- C) $x = 9$ or $x = -5$
- D) $x = 7$ or $x = -7$

**Advanced Level**

**Item 4**

Which of the following describes all solutions to $|x| > 3$?

- A) $-3 < x < 3$
- B) $x = -3$ or $x = 3$
- C) $x < -3$ or $x > 3$
- D) $x > 3$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. What is the value of $|-7|$?**

Step 1: Ask how far $-7$ is from zero. It is $7$ units away.

Step 2: Distance is never negative, so the sign drops.

**Answer: B** ($7$)

```json
"distractor_logic": {
  "A": "Student makes misconception: absolute_value_leaves_sign (copies the number out of the bars unchanged, so the operation did nothing)",
  "B": "Correct: reads the bars as distance from zero, which drops the minus sign and leaves 7",
  "C": "Student makes misconception: absolute_value_as_squaring (squares the number to remove the minus sign, which also changes its size from 7 to 49)",
  "D": "Student makes misconception: absolute_value_as_additive_inverse (adds the number to its own opposite and reports the zero that results, reading the bars as an instruction to cancel the value rather than to measure it)"
},
"misconception_tag": {
  "A": "absolute_value_leaves_sign",
  "C": "absolute_value_as_squaring",
  "D": "absolute_value_as_additive_inverse"
}
```

---

**2. What is the value of $|3 - 8|$?**

Step 1: Evaluate inside the bars first. The bars group, like parentheses.
- $3 - 8 = -5$

Step 2: Apply the absolute value.
- $|-5| = 5$

**Answer: D** ($5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: adds_instead_of_subtracts (takes each value's distance from zero separately and adds them, computing 3 plus 8 where the bars enclose a difference)",
  "B": "Student makes misconception: absolute_value_leaves_sign (subtracts correctly for -5 but carries the minus sign out through the bars)",
  "C": "Student makes misconception: absolute_difference_as_product (multiplies the two values inside the bars instead of subtracting them)",
  "D": "Correct: subtracts inside the bars for -5, then takes the distance from zero for 5"
},
"misconception_tag": {
  "A": "adds_instead_of_subtracts",
  "B": "absolute_value_leaves_sign",
  "C": "absolute_difference_as_product"
}
```

---

**3. What is the value of $-|-6|$?**

Step 1: Work inside out. Evaluate the bars first.
- $|-6| = 6$

Step 2: Apply the minus sign that sits outside the bars.
- $-6$

The bars govern only what is between them. A sign outside survives.

**Answer: B** ($-6$)

```json
"distractor_logic": {
  "A": "Student makes misconception: drops_negative_sign (evaluates the bars correctly but ignores the minus sign sitting outside them, treating absolute value as a rule that makes any expression positive)",
  "B": "Correct: evaluates the bars to 6, then applies the outside minus sign for -6",
  "C": "Student makes misconception: absolute_value_as_squaring (squares the 6 instead of taking its distance from zero)",
  "D": "Student makes misconception: absolute_value_as_additive_inverse (reads the leading minus and the bars as cancelling each other to zero)"
},
"misconception_tag": {
  "A": "drops_negative_sign",
  "C": "absolute_value_as_squaring",
  "D": "absolute_value_as_additive_inverse"
}
```

---

**4. What is the distance between $-3$ and $5$ on a number line?**

Step 1: Distance is the absolute value of the difference.
- $|5 - (-3)|$

Step 2: Minus a negative is plus.
- $|5 + 3| = |8| = 8$

Step 3: Check by subtracting the other way. $|-3 - 5| = |-8| = 8$. Same answer, as distance requires.

**Answer: D** ($8$)

```json
"distractor_logic": {
  "A": "Student makes misconception: absolute_difference_as_product (multiplies -3 by 5 instead of subtracting, reporting a negative value as a distance)",
  "B": "Student makes misconception: double_negative_mishandled (reads 5 minus negative 3 as 5 minus 3, treating the two minus signs as one)",
  "C": "Student makes misconception: absolute_value_leaves_sign (subtracts in the other order for -8 and reports it without applying the bars, giving a negative distance)",
  "D": "Correct: takes the absolute value of the difference, reading 5 minus negative 3 as 5 plus 3"
},
"misconception_tag": {
  "A": "absolute_difference_as_product",
  "B": "double_negative_mishandled",
  "C": "absolute_value_leaves_sign"
}
```

---

**Proficient Level**

**5. What are all the solutions to $|x| = 6$?**

Step 1: Ask which numbers sit exactly $6$ away from zero.

Step 2: There are two, one on each side.
- $x = 6$ and $x = -6$

Step 3: Check both. $|6| = 6$ and $|-6| = 6$. Both work.

**Answer: A** ($x = 6$ or $x = -6$)

```json
"distractor_logic": {
  "A": "Correct: finds both numbers whose distance from zero is 6",
  "B": "Student makes misconception: absolute_equation_one_case_only (reports the positive solution and stops, missing the negative case that satisfies the equation equally)",
  "C": "Student makes misconception: absolute_value_as_squaring (treats the bars as squaring and undoes them by squaring the 6)",
  "D": "Student makes misconception: absolute_value_as_additive_inverse (reads the bars as an instruction to cancel to zero rather than to measure distance)"
},
"misconception_tag": {
  "B": "absolute_equation_one_case_only",
  "C": "absolute_value_as_squaring",
  "D": "absolute_value_as_additive_inverse"
}
```

---

**6. What are all the solutions to $|x - 3| = 5$?**

Step 1: Split into two cases on the expression inside the bars.
- Case 1: $x - 3 = 5$
- Case 2: $x - 3 = -5$

Step 2: Solve each by adding $3$ to both sides.
- Case 1: $x = 8$
- Case 2: $x = -2$

Step 3: Check both. $|8 - 3| = 5$ and $|-2 - 3| = |-5| = 5$. Both work.

**Answer: D** ($x = 8$ or $x = -2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (drops the -3 inside the bars and solves the equation as though it read the absolute value of x equals 5)",
  "B": "Student makes misconception: absolute_equation_one_case_only (solves the positive case for 8 and stops, never setting the inside equal to -5)",
  "C": "Student makes misconception: sign_error_on_constant (solves the second case as 5 minus 3 rather than -5 plus 3, giving 2, which fails the check because the absolute value of 2 minus 3 is 1)",
  "D": "Correct: splits into the two cases and adds 3 to both sides of each, giving 8 and -2"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "B": "absolute_equation_one_case_only",
  "C": "sign_error_on_constant"
}
```

---

**7. What is the value of $|2 - 9| - |-3|$?**

Step 1: Evaluate each absolute value separately. The bars group.
- $|2 - 9| = |-7| = 7$
- $|-3| = 3$

Step 2: Subtract.
- $7 - 3 = 4$

**Answer: B** ($4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: subtracts_in_wrong_order (computes 3 minus 7, reversing the order the expression gives)",
  "B": "Correct: resolves both absolute values to 7 and 3, then subtracts",
  "C": "Student makes misconception: adds_instead_of_subtracts (resolves both absolute values correctly but adds 7 and 3 where the expression subtracts)",
  "D": "Student makes misconception: absolute_value_leaves_sign (carries the minus signs out through both sets of bars, computing -7 minus 3)"
},
"misconception_tag": {
  "A": "subtracts_in_wrong_order",
  "C": "adds_instead_of_subtracts",
  "D": "absolute_value_leaves_sign"
}
```

---

**Advanced Level**

**8. What are all the solutions to $|2x + 1| = 9$?**

Step 1: Split into two cases on the whole expression inside the bars.
- Case 1: $2x + 1 = 9$
- Case 2: $2x + 1 = -9$

Step 2: Solve case 1. Subtract $1$, then divide by $2$.
- $2x = 8$, so $x = 4$

Step 3: Solve case 2 the same way.
- $2x = -10$, so $x = -5$

Step 4: Check both. $|2(4) + 1| = |9| = 9$ and $|2(-5) + 1| = |-9| = 9$. Both work.

**Answer: A** ($x = 4$ or $x = -5$)

```json
"distractor_logic": {
  "A": "Correct: splits into two cases, subtracts 1 and divides by 2 in each, giving 4 and -5",
  "B": "Student makes misconception: absolute_equation_one_case_only (solves the positive case for 4 and stops, never setting the inside equal to -9)",
  "C": "Student makes misconception: sign_error_on_constant (adds the 1 instead of subtracting it when moving it across the equals sign, solving 2x equals 10 and 2x equals -8)",
  "D": "Student makes misconception: omits_constant_term (drops the plus 1 inside the bars and divides 9 by 2 directly, solving as though the equation read the absolute value of 2x equals 9)"
},
"misconception_tag": {
  "B": "absolute_equation_one_case_only",
  "C": "sign_error_on_constant",
  "D": "omits_constant_term"
}
```

---

**9. Which of the following describes all solutions to $|x| < 4$?**

Step 1: Read it as a distance question. Which numbers are less than $4$ away from zero?

Step 2: Less than is a band. Everything between $-4$ and $4$ qualifies, and nothing outside does.
- $-4 < x < 4$

Step 3: Spot check. $x = 3$ gives $|3| = 3 < 4$, so it belongs. $x = 5$ gives $|5| = 5$, which is not less than $4$, so it does not.

**Answer: C** ($-4 < x < 4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: absolute_equation_one_case_only (handles only the positive case and never bounds the solution set from below)",
  "B": "Student makes misconception: absolute_inequality_boundary_only (reports the two edge values instead of the interval between them, and those two values do not even satisfy a strict inequality)",
  "C": "Correct: reads less than as a single band around zero, containing every number within 4 units of it",
  "D": "Student makes misconception: absolute_inequality_direction_reversed (gives the two-tail solution set that belongs to the greater-than inequality)"
},
"misconception_tag": {
  "A": "absolute_equation_one_case_only",
  "B": "absolute_inequality_boundary_only",
  "D": "absolute_inequality_direction_reversed"
}
```

---

**10. A bolt is supposed to be $12.5$ mm long. To pass inspection, the difference between the actual length $L$ and $12.5$ mm must be at most $0.3$ mm, so $|L - 12.5| \le 0.3$. Which lengths pass inspection?**

Step 1: This is a less-than shape, so it becomes a band.
- $-0.3 \le L - 12.5 \le 0.3$

Step 2: Add $12.5$ to all three parts.
- $12.2 \le L \le 12.8$

Step 3: Sanity check. A bolt at exactly $12.5$ is dead centre and clearly passes, and $12.5$ sits inside the interval. A bolt at $13$ is off by $0.5$, which is more than the tolerance, and $13$ sits outside.

**Answer: C** ($12.2 \le L \le 12.8$)

```json
"distractor_logic": {
  "A": "Student makes misconception: absolute_inequality_direction_reversed (gives the two-tail set, which describes exactly the bolts that fail inspection rather than the ones that pass)",
  "B": "Student makes misconception: absolute_inequality_boundary_only (reports the two extreme acceptable lengths instead of the whole interval of lengths that pass)",
  "C": "Correct: reads the at-most condition as a band and shifts it by 12.5, giving every length within 0.3 of the target",
  "D": "Student makes misconception: absolute_equation_one_case_only (bounds the length from above only, accepting any bolt that is too short)"
},
"misconception_tag": {
  "A": "absolute_inequality_direction_reversed",
  "B": "absolute_inequality_boundary_only",
  "D": "absolute_equation_one_case_only"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: What is the value of $|-12|$?**

Step 1: Ask how far $-12$ is from zero. It is $12$ units away.

Step 2: Drop the sign.

**Answer: D** ($12$)

```json
"distractor_logic": {
  "A": "Student makes misconception: absolute_value_as_squaring (squares the number to remove the minus sign, changing its size from 12 to 144)",
  "B": "Student makes misconception: absolute_value_leaves_sign (copies the number out of the bars unchanged)",
  "C": "Student makes misconception: absolute_value_as_additive_inverse (reads the bars as an instruction to cancel the value to zero rather than to measure it)",
  "D": "Correct: reads the bars as distance from zero, giving 12"
},
"misconception_tag": {
  "A": "absolute_value_as_squaring",
  "B": "absolute_value_leaves_sign",
  "C": "absolute_value_as_additive_inverse"
}
```

---

**Item 2: What is the value of $|4 - 11|$?**

Step 1: Evaluate inside the bars.
- $4 - 11 = -7$

Step 2: Apply the absolute value.
- $|-7| = 7$

**Answer: B** ($7$)

```json
"distractor_logic": {
  "A": "Student makes misconception: absolute_value_leaves_sign (subtracts correctly for -7 but carries the minus sign out through the bars)",
  "B": "Correct: subtracts inside the bars for -7, then takes the distance from zero for 7",
  "C": "Student makes misconception: absolute_difference_as_product (multiplies the two values inside the bars instead of subtracting them)",
  "D": "Student makes misconception: adds_instead_of_subtracts (takes each value's distance from zero separately and adds them, computing 4 plus 11 where the bars enclose a difference)"
},
"misconception_tag": {
  "A": "absolute_value_leaves_sign",
  "C": "absolute_difference_as_product",
  "D": "adds_instead_of_subtracts"
}
```

---

**Item 3: What are all the solutions to $|x + 2| = 7$?**

Step 1: Split into two cases.
- Case 1: $x + 2 = 7$
- Case 2: $x + 2 = -7$

Step 2: Solve each by subtracting $2$.
- Case 1: $x = 5$
- Case 2: $x = -9$

Step 3: Check both. $|5 + 2| = 7$ and $|-9 + 2| = |-7| = 7$. Both work.

**Answer: A** ($x = 5$ or $x = -9$)

```json
"distractor_logic": {
  "A": "Correct: splits into the two cases and subtracts 2 from both sides of each, giving 5 and -9",
  "B": "Student makes misconception: absolute_equation_one_case_only (solves the positive case for 5 and stops, never setting the inside equal to -7)",
  "C": "Student makes misconception: sign_error_on_constant (adds the 2 instead of subtracting it when moving it across the equals sign, giving 9 and -5)",
  "D": "Student makes misconception: omits_constant_term (drops the plus 2 inside the bars and solves as though the equation read the absolute value of x equals 7)"
},
"misconception_tag": {
  "B": "absolute_equation_one_case_only",
  "C": "sign_error_on_constant",
  "D": "omits_constant_term"
}
```

---

**Item 4: Which of the following describes all solutions to $|x| > 3$?**

Step 1: Read it as a distance question. Which numbers are more than $3$ away from zero?

Step 2: Greater than is two tails. Everything far to the left, and everything far to the right.
- $x < -3$ or $x > 3$

Step 3: Spot check. $x = 5$ gives $|5| = 5 > 3$, so it belongs. $x = -5$ gives $|-5| = 5 > 3$, so it belongs too. $x = 0$ gives $|0| = 0$, which is not more than $3$, so the middle is excluded.

**Answer: C** ($x < -3$ or $x > 3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: absolute_inequality_direction_reversed (gives the band solution set that belongs to the less-than inequality)",
  "B": "Student makes misconception: absolute_inequality_boundary_only (reports the two edge values instead of the regions beyond them, and those two values do not even satisfy a strict inequality)",
  "C": "Correct: reads greater than as two tails, taking every number more than 3 units from zero on either side",
  "D": "Student makes misconception: absolute_equation_one_case_only (keeps only the right-hand tail and never handles the negative case)"
},
"misconception_tag": {
  "A": "absolute_inequality_direction_reversed",
  "B": "absolute_inequality_boundary_only",
  "D": "absolute_equation_one_case_only"
}
```
