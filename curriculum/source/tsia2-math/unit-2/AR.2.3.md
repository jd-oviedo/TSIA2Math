---
topic_name: "Evaluating linear functions for a given value"
unit_number: 2
sequence_in_unit: 10
assessment_layer: "CRC"
estimated_time_minutes: 45
difficulty_band: "Basic"
related_strand: "AR"
keywords: ["function notation", "evaluating", "substitution", "order of operations", "linear function", "back-solving"]
---

# AR.2.3 - Evaluating Linear Functions for a Given Value

**Topic ID:** AR.2.3  
**Unit:** 2  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Substitute, Then Follow the Order of Operations

$f(x) = 4x + 7$ is a set of instructions: take the input, multiply by 4, then add 7. Evaluating at $x = 5$ means running them in that order.

$$f(5) = 4(5) + 7 = 20 + 7 = 27$$

Two habits make this reliable and both are worth doing on paper.

**Put the input in brackets.** Write $4(5) + 7$, not $45 + 7$. The brackets keep multiplication visible and they are the difference between 27 and nonsense when the input is negative.

**Multiply before you add.** The order of operations is not optional here, and the whole family of errors below comes from breaking it.

---

##### The Mistake That Costs the Most Points

You add the constant to the input before multiplying.

Evaluating $P(n) = 15n + 50$ at $n = 6$, students write $15(6 + 50) = 15(56) = 840$.

The 50 is not part of the input. It is added at the end, after the multiplication has already happened. Reading the expression aloud in order settles it: fifteen times the input, **then** plus fifty.

$$P(6) = 15(6) + 50 = 90 + 50 = 140$$

The scale of the error is the tell. In a fee-plus-rate model, 840 for six units of something priced at 15 with a 50 fee is absurd on its face. **Sanity-check the size of your answer against the situation.** Six units cannot cost more than fifty of them would.

Two relatives of this error:

- **Dropping the constant**, answering 90. You did the multiplication and stopped.
- **Adding the constant twice**, answering 190. Usually from writing $90 + 50$ and then adding the 50 again while copying.

---

##### Negative Inputs

$h(x) = -2x + 9$, evaluated at $x = -3$.

$$h(-3) = -2(-3) + 9 = 6 + 9 = 15$$

The brackets earn their place here. A negative times a negative is positive, so $-2(-3)$ is $+6$, and the 9 is added to it. Writing $-6 + 9 = 3$ loses the sign rule and lands three units short of a much larger answer.

**Say the sign out loud as you multiply.** Negative two times negative three is positive six.

---

##### Running It Backward

Sometimes you are given the output and asked for the input. Undo the instructions in reverse order.

**Example 1:** $f(x) = 7x + 9$ and $f(a) = 65$. Find $a$.

Forward the rule multiplies then adds, so backward it subtracts then divides.

- $7a + 9 = 65$
- $7a = 56$
- $a = 8$

Check forward: $7(8) + 9 = 65$. Correct.

Dividing first gives $65 \div 7 \approx 9.29$, which fails the check: $7(9.29) + 9 \approx 74$, not 65. This is the same "subtract before you divide" discipline as QR.4.2, now in function notation.

---

##### Feeding One Output Into Another

**Example 2:** $f(x) = 5x - 4$. Find $f(f(2))$.

Work from the inside out, exactly as with brackets.

- Inner: $f(2) = 5(2) - 4 = 6$
- Outer: $f(6) = 5(6) - 4 = 26$

The 6 is an intermediate value, not the answer, and reporting it is the usual slip. So is adding the two results to get 12, which is not an operation anything asked for.

---

##### Watch the Units of the Input

**Example 3:** A rental costs $C(d) = 30d + 45$, where $d$ is **days**. What does a three-week rental cost?

The function counts days, so convert before substituting.

- $3$ weeks $= 21$ days
- $C(21) = 30(21) + 45 = 630 + 45 = 675$

Substituting 3 gives $C(3) = 135$, the cost of three days. **Check that what you are substituting is measured in the unit the function expects.**

---

##### The Four Traps

1. **Adding the constant before multiplying.** Multiply first, then add. Sanity-check the size of the answer.
2. **Dropping the constant, or adding it twice.** Write both pieces down, then add once.
3. **Losing a sign on a negative input.** Use brackets and say the sign rule aloud.
4. **Dividing before subtracting when running backward.** Undo in reverse order, then check forward.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. If $f(x) = 4x + 7$, what is $f(5)$?
   - A) $27$
   - B) $20$
   - C) $48$
   - D) $16$

2. If $g(x) = 3x - 8$, what is $g(6)$?
   - A) $18$
   - B) $10$
   - C) $26$
   - D) $1$

3. If $C(m) = 25m + 40$, what is $C(4)$?
   - A) $100$
   - B) $40$
   - C) $140$
   - D) $180$

4. If $h(x) = -2x + 9$, what is $h(-3)$?
   - A) $6$
   - B) $3$
   - C) $15$
   - D) $4$

**Proficient Level** (these require an extra step)

5. If $f(x) = 6x + 12$, by how much does $f(x)$ change as the input goes from $3$ to $8$?
   - A) $90$
   - B) $60$
   - C) $5$
   - D) $30$

6. A student evaluates $P(n) = 15n + 50$ at $n = 6$ and writes $15(6 + 50) = 840$. What is the error, and what is $P(6)$?
   - A) The student added the fee before multiplying; $P(6) = 140$.
   - B) There is no error; $P(6) = 840$.
   - C) The student should have added the $50$ twice; $P(6) = 190$.
   - D) The student should have dropped the $50$; $P(6) = 90$.

7. If $f(x) = 0.4x + 3.5$, what is $f(2.5)$?
   - A) $1$
   - B) $4.5$
   - C) $2.4$
   - D) $6.4$

**Advanced Level** (these need multiple steps or reverse thinking)

8. If $f(x) = 5x - 4$, what is $f(f(2))$?
   - A) $6$
   - B) $12$
   - C) $30$
   - D) $26$

9. If $f(x) = 7x + 9$ and $f(a) = 65$, what is $a$?
   - A) $9.29$
   - B) $8$
   - C) $10.57$
   - D) $56$

10. A rental costs $C(d) = 30d + 45$ dollars, where $d$ is days. What does a three-week rental cost?
    - A) \$135
    - B) \$630
    - C) \$675
    - D) \$720

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

If $f(x) = 5x + 6$, what is $f(4)$?

- A) $26$
- B) $20$
- C) $50$
- D) $15$

**Item 2**

If $g(x) = 2x - 9$, what is $g(-3)$?

- A) $-6$
- B) $-15$
- C) $-3$
- D) $-10$

**Item 3**

If $C(m) = 18m + 25$, what is $C(5)$?

- A) $90$
- B) $25$
- C) $115$
- D) $140$

**Item 4**

If $f(x) = 4x + 11$ and $f(a) = 51$, what is $a$?

- A) $12.75$
- B) $15.5$
- C) $40$
- D) $10$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. If $f(x) = 4x + 7$, what is $f(5)$?**

Step 1: Substitute with brackets.
- $4(5) + 7$

Step 2: Multiply first.
- $20 + 7$

Step 3: Add.
- $27$

**Answer: A** ($27$)

```json
"distractor_logic": {
  "A": "Correct: multiplies 4 by 5 for 20, then adds the 7",
  "B": "Student makes misconception: omits_constant_term (multiplies to 20 and stops without adding the 7)",
  "C": "Student makes misconception: input_added_to_fee_before_multiplying (adds the 7 to the input first, computing 4 times 12 for 48)",
  "D": "Student makes misconception: input_added_instead_of_rate (adds the 4, the 5 and the 7 rather than multiplying the coefficient by the input)"
},
"misconception_tag": {
  "B": "omits_constant_term",
  "C": "input_added_to_fee_before_multiplying",
  "D": "input_added_instead_of_rate"
}
```

---

**2. If $g(x) = 3x - 8$, what is $g(6)$?**

Step 1: Substitute.
- $3(6) - 8$

Step 2: Multiply, then subtract.
- $18 - 8 = 10$

**Answer: B** ($10$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (multiplies to 18 and stops without subtracting the 8)",
  "B": "Correct: multiplies 3 by 6 for 18, then subtracts the 8",
  "C": "Student makes misconception: sign_error_on_constant (adds the 8 instead of subtracting it, producing 26)",
  "D": "Student makes misconception: input_added_instead_of_rate (adds the 3 and the 6 before subtracting the 8, producing 1)"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "C": "sign_error_on_constant",
  "D": "input_added_instead_of_rate"
}
```

---

**3. If $C(m) = 25m + 40$, what is $C(4)$?**

Step 1: Substitute and multiply.
- $25(4) = 100$

Step 2: Add the constant, once.
- $100 + 40 = 140$

**Answer: C** ($140$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (multiplies to 100 and stops without adding the 40)",
  "B": "Student makes misconception: omits_variable_term (reports the 40 constant and never multiplies by the input)",
  "C": "Correct: multiplies 25 by 4 for 100, then adds the 40 once",
  "D": "Student makes misconception: fixed_fee_added_twice (reaches 140 correctly and adds the 40 a second time, producing 180)"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "B": "omits_variable_term",
  "D": "fixed_fee_added_twice"
}
```

---

**4. If $h(x) = -2x + 9$, what is $h(-3)$?**

Step 1: Substitute with brackets, so the two negatives stay visible.
- $-2(-3) + 9$

Step 2: Multiply. Negative times negative is positive.
- $6 + 9$

Step 3: Add.
- $15$

**Answer: C** ($15$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (multiplies to 6 and stops without adding the 9)",
  "B": "Student makes misconception: drops_negative_sign (treats -2 times -3 as -6, losing the rule that two negatives give a positive, and reaches 3)",
  "C": "Correct: multiplies -2 by -3 for a positive 6, then adds the 9 for 15",
  "D": "Student makes misconception: input_added_instead_of_rate (adds the -2, the -3 and the 9 rather than multiplying, producing 4)"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "B": "drops_negative_sign",
  "D": "input_added_instead_of_rate"
}
```

---

**Proficient Level**

**5. If $f(x) = 6x + 12$, by how much does $f(x)$ change as the input goes from $3$ to $8$?**

Step 1: Evaluate at both inputs.
- $f(3) = 6(3) + 12 = 30$
- $f(8) = 6(8) + 12 = 60$

Step 2: Subtract to get the change.
- $60 - 30 = 30$

Step 3: Check against the rate. The input rose by 5 and the rate is 6, so the change is $6 \times 5 = 30$. The constant cancels out of a difference, which is why it plays no part.

**Answer: D** ($30$)

```json
"distractor_logic": {
  "A": "Student makes misconception: fixed_fee_added_twice (adds the two outputs, 60 and 30, instead of subtracting them, so the constant 12 is counted twice over)",
  "B": "Student makes misconception: answers_intermediate_value (reports f(8) alone rather than the change between the two outputs)",
  "C": "Student makes misconception: input_added_instead_of_rate (reports the change in the input, 5, rather than the change in the output it causes)",
  "D": "Correct: evaluates to 30 and 60 and subtracts for a change of 30, which matches the rate of 6 across 5 units of input"
},
"misconception_tag": {
  "A": "fixed_fee_added_twice",
  "B": "answers_intermediate_value",
  "C": "input_added_instead_of_rate"
}
```

---

**6. A student evaluates $P(n) = 15n + 50$ at $n = 6$ and writes $15(6 + 50) = 840$. What is the error, and what is $P(6)$?**

Step 1: Name the error. The 50 was pulled inside the brackets and added to the input before multiplying.

Step 2: The 50 is added after the multiplication.
- $P(6) = 15(6) + 50 = 90 + 50 = 140$

Step 3: Sanity-check the student's figure. At 840, six units would cost more than fifty units priced at 15 each, which is impossible for a fee-plus-rate model.

**Answer: A** (The student added the fee before multiplying; $P(6) = 140$)

```json
"distractor_logic": {
  "A": "Correct: names the error as adding the 50 to the input before multiplying, and evaluates in order for 90 plus 50, or 140",
  "B": "Student makes misconception: input_added_to_fee_before_multiplying (accepts the student's grouping, which prices 6 units above what 50 units would cost)",
  "C": "Student makes misconception: fixed_fee_added_twice (adds the 50 constant a second time on top of the correct 140)",
  "D": "Student makes misconception: omits_constant_term (drops the 50 entirely and reports the multiplication alone)"
},
"misconception_tag": {
  "B": "input_added_to_fee_before_multiplying",
  "C": "fixed_fee_added_twice",
  "D": "omits_constant_term"
}
```

---

**7. If $f(x) = 0.4x + 3.5$, what is $f(2.5)$?**

Step 1: Substitute and multiply first.
- $0.4(2.5) = 1$

Step 2: Add the constant.
- $1 + 3.5 = 4.5$

**Answer: B** ($4.5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (multiplies to 1 and stops without adding the 3.5)",
  "B": "Correct: multiplies 0.4 by 2.5 for 1, then adds the 3.5 for 4.5",
  "C": "Student makes misconception: input_added_to_fee_before_multiplying (adds the 3.5 to the input first, computing 0.4 times 6 for 2.4)",
  "D": "Student makes misconception: input_added_instead_of_rate (adds the 0.4, the 2.5 and the 3.5 rather than multiplying, producing 6.4)"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "C": "input_added_to_fee_before_multiplying",
  "D": "input_added_instead_of_rate"
}
```

---

**Advanced Level**

**8. If $f(x) = 5x - 4$, what is $f(f(2))$?**

Step 1: Work from the inside out. Evaluate the inner one first.
- $f(2) = 5(2) - 4 = 6$

Step 2: Feed that result back in as the new input.
- $f(6) = 5(6) - 4 = 26$

Step 3: The 6 was an intermediate value. The question asked for the outer result.

**Answer: D** ($26$)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (computes the inner f(2) as 6 and reports it without applying f again)",
  "B": "Student makes misconception: input_added_instead_of_rate (adds the inner result to itself rather than feeding it back through the function, producing 12)",
  "C": "Student makes misconception: omits_constant_term (applies f to the 6 but drops the -4 on the outer step, producing 30)",
  "D": "Correct: evaluates the inner f(2) as 6, then f(6) as 26"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "B": "input_added_instead_of_rate",
  "C": "omits_constant_term"
}
```

---

**9. If $f(x) = 7x + 9$ and $f(a) = 65$, what is $a$?**

Step 1: Write the equation.
- $7a + 9 = 65$

Step 2: Undo in reverse order. Forward multiplies then adds, so subtract first.
- $7a = 56$

Step 3: Then divide.
- $a = 8$

Step 4: Check forward. $7(8) + 9 = 65$. Correct.

**Answer: B** ($8$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (divides the 65 by 7 without first subtracting the 9, producing about 9.29, which runs forward to about 74)",
  "B": "Correct: subtracts 9 to reach 7a equal to 56, divides by 7 for a equal to 8, and checks forward to 65",
  "C": "Student makes misconception: sign_error_on_constant (adds the 9 to the 65 instead of subtracting it, dividing 74 by 7 for about 10.57)",
  "D": "Student makes misconception: answers_intermediate_value (reports the 56 left after subtracting rather than dividing it by the coefficient)"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "C": "sign_error_on_constant",
  "D": "answers_intermediate_value"
}
```

---

**10. A rental costs $C(d) = 30d + 45$ dollars, where $d$ is days. What does a three-week rental cost?**

Step 1: The function counts days, so convert the weeks first.
- $3 \times 7 = 21$ days

Step 2: Substitute and multiply.
- $30(21) = 630$

Step 3: Add the constant.
- $630 + 45 = 675$

**Answer: C** (\$675)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_period_count_used (substitutes the 3 weeks directly into a function that counts days, pricing a three-day rental at 135)",
  "B": "Student makes misconception: omits_constant_term (multiplies to 630 and stops without adding the 45)",
  "C": "Correct: converts 3 weeks to 21 days, multiplies by 30 for 630, and adds the 45 for 675",
  "D": "Student makes misconception: fixed_fee_added_twice (reaches 675 correctly and adds the 45 a second time, producing 720)"
},
"misconception_tag": {
  "A": "wrong_period_count_used",
  "B": "omits_constant_term",
  "D": "fixed_fee_added_twice"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: If $f(x) = 5x + 6$, what is $f(4)$?**

Step 1: Multiply first.
- $5(4) = 20$

Step 2: Add.
- $20 + 6 = 26$

**Answer: A** ($26$)

```json
"distractor_logic": {
  "A": "Correct: multiplies 5 by 4 for 20, then adds the 6",
  "B": "Student makes misconception: omits_constant_term (multiplies to 20 and stops without adding the 6)",
  "C": "Student makes misconception: input_added_to_fee_before_multiplying (adds the 6 to the input first, computing 5 times 10 for 50)",
  "D": "Student makes misconception: input_added_instead_of_rate (adds the 5, the 4 and the 6 rather than multiplying, producing 15)"
},
"misconception_tag": {
  "B": "omits_constant_term",
  "C": "input_added_to_fee_before_multiplying",
  "D": "input_added_instead_of_rate"
}
```

---

**Item 2: If $g(x) = 2x - 9$, what is $g(-3)$?**

Step 1: Substitute with brackets.
- $2(-3) - 9$

Step 2: Multiply, then subtract.
- $-6 - 9 = -15$

**Answer: B** ($-15$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (multiplies to -6 and stops without subtracting the 9)",
  "B": "Correct: multiplies 2 by -3 for -6, then subtracts the 9 for -15",
  "C": "Student makes misconception: sign_error_on_constant (adds the 9 instead of subtracting it, producing 3 and then reporting -3)",
  "D": "Student makes misconception: input_added_instead_of_rate (adds the 2 and the -3 before subtracting the 9, producing -10)"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "C": "sign_error_on_constant",
  "D": "input_added_instead_of_rate"
}
```

---

**Item 3: If $C(m) = 18m + 25$, what is $C(5)$?**

Step 1: Multiply.
- $18(5) = 90$

Step 2: Add the constant, once.
- $90 + 25 = 115$

**Answer: C** ($115$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (multiplies to 90 and stops without adding the 25)",
  "B": "Student makes misconception: omits_variable_term (reports the 25 constant and never multiplies by the input)",
  "C": "Correct: multiplies 18 by 5 for 90, then adds the 25 once",
  "D": "Student makes misconception: fixed_fee_added_twice (reaches 115 correctly and adds the 25 a second time, producing 140)"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "B": "omits_variable_term",
  "D": "fixed_fee_added_twice"
}
```

---

**Item 4: If $f(x) = 4x + 11$ and $f(a) = 51$, what is $a$?**

Step 1: Write the equation.
- $4a + 11 = 51$

Step 2: Subtract first.
- $4a = 40$

Step 3: Then divide.
- $a = 10$

Step 4: Check forward. $4(10) + 11 = 51$. Correct.

**Answer: D** ($10$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_constant_term (divides the 51 by 4 without first subtracting the 11, producing 12.75)",
  "B": "Student makes misconception: sign_error_on_constant (adds the 11 to the 51 instead of subtracting it, dividing 62 by 4 for 15.5)",
  "C": "Student makes misconception: answers_intermediate_value (reports the 40 left after subtracting rather than dividing it by the coefficient)",
  "D": "Correct: subtracts 11 to reach 4a equal to 40, divides by 4 for a equal to 10, and checks forward to 51"
},
"misconception_tag": {
  "A": "omits_constant_term",
  "B": "sign_error_on_constant",
  "C": "answers_intermediate_value"
}
```
