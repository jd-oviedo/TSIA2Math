---
topic_name: "Evaluating exponential functions"
unit_number: 4
sequence_in_unit: 19
assessment_layer: "CRC"
estimated_time_minutes: 45
difficulty_band: "Basic"
related_strand: "AR"
keywords: ["exponential function", "evaluating", "coefficient", "base", "order of operations", "growth factor"]
---

# AR.4.11 - Evaluating Exponential Functions

**Topic ID:** AR.4.11  
**Unit:** 4  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Two Numbers, Two Different Jobs

An exponential function looks like this:

$$f(x) = a \cdot b^{x}$$

Two numbers sit in front of you and they do completely different things.

- **$b$ is the base.** It is what gets multiplied by itself, $x$ times. It is where the growing happens.
- **$a$ is the coefficient.** It is the starting amount, and it multiplies the result once at the end.

**The exponent belongs to $b$ alone.** It never touches $a$.

$$f(x) = 3 \cdot 2^{x}$$

Here $2$ is doubling and $3$ is the starting size. The $x$ is attached to the $2$, not to the $3$.

##### Power First, Coefficient Second

$$f(x) = 3 \cdot 2^{x}, \qquad f(4) = ?$$

Step 1: Substitute. $f(4) = 3 \cdot 2^{4}$.

Step 2: **Evaluate the power first.** $2^{4} = 16$.

Step 3: **Then multiply by the coefficient.** $3 \times 16 = 48$.

$$f(4) = 48$$

The order matters and it is not a convention you have to memorise. The exponent is attached to the $2$, so $2^{4}$ is a single quantity. The $3$ multiplies that quantity once it exists.

##### The Mistake That Costs the Most Points

**Applying the exponent to the coefficient.**

$$3 \cdot 2^{4} \quad\text{read as}\quad (3 \cdot 2)^{4} = 6^{4} = 1296$$

The real answer is $48$. Those are not in the same neighbourhood.

**Why it happens:** the $3$ and the $2$ sit side by side, and brackets that are not there get imagined. Without a bracket, an exponent attaches only to the thing immediately beneath it.

**The fix is to put the bracket in yourself, around the part that is actually raised.**

$$3 \cdot 2^{4} = 3 \cdot (2^{4})$$

Once you have written that, the $3$ is visibly outside and cannot be dragged in.

**A size check catches it too.** If your answer is enormously bigger than the coefficient times a small power, you have probably raised the coefficient as well.

##### Do Not Add the Coefficient

$$3 \cdot 2^{4} = 3 \times 16 = 48, \qquad \text{not } 3 + 16 = 19$$

The dot between $a$ and $b^{x}$ is a multiplication. It is easy to lose, because a dot is a small mark, and the two numbers then look like a sum.

##### Do Not Drop the Coefficient

$$f(4) = 3 \cdot 2^{4}$$

Evaluating $2^{4} = 16$ and reporting $16$ leaves out the starting amount entirely. The function is not $2^{x}$; it is three times $2^{x}$.

**Every evaluation has two steps, and both of them count.**

##### An Input of Zero

$$f(x) = 6 \cdot 2^{x}, \qquad f(0) = 6 \cdot 2^{0} = 6 \times 1 = 6$$

Because $2^{0} = 1$, the function at zero returns the coefficient. That is exactly what makes $a$ the **starting amount**: it is the value before any growth has happened.

This is worth recognising on sight. If a question asks for $f(0)$, the answer is $a$.

##### A Negative Input

$$f(x) = 3 \cdot 2^{x}, \qquad f(-2) = 3 \cdot 2^{-2} = 3 \times \frac{1}{4} = \frac{3}{4}$$

A negative exponent gives a reciprocal, so the power becomes a fraction and the answer comes out smaller than the coefficient. It does not become negative. Going backwards in $x$ shrinks the output; it never flips its sign.

##### Growth Is Multiplicative, Not Additive

$$f(x) = 5 \cdot 3^{x}$$

Each step in $x$ multiplies the output by $3$. It does not add $3$.

$$f(0) = 5, \quad f(1) = 15, \quad f(2) = 45, \quad f(3) = 135$$

The gaps are $10$, $30$, $90$, growing every time. A function that added $3$ each step would give $5, 8, 11, 14$, with a constant gap. **Exponential growth accelerates; linear growth does not.**

That distinction is the whole of the next topic, so it is worth seeing here first.

##### The Five Traps

1. **Raising the coefficient too.** $3 \cdot 2^{4}$ is $48$, not $6^{4}$. Write the bracket around $2^{4}$ yourself.
2. **Adding the coefficient instead of multiplying.** $3 \cdot 2^{4}$ is $3 \times 16$, not $3 + 16$.
3. **Dropping the coefficient.** Evaluating $2^{4} = 16$ and stopping leaves out the starting amount.
4. **Multiplying the base by the exponent.** $2^{4}$ is $16$, not $8$.
5. **Reading a negative input as a negative output.** $f(-2)$ gives a small positive number, not a negative one.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. If $f(x) = 3 \cdot 2^{x}$, what is $f(4)$?
   - A) $1296$
   - B) $48$
   - C) $16$
   - D) $243$

2. If $f(x) = 5 \cdot 3^{x}$, what is $f(2)$?
   - A) $225$
   - B) $9$
   - C) $45$
   - D) $30$

3. If $f(x) = 2 \cdot 4^{x}$, what is $f(3)$?
   - A) $128$
   - B) $512$
   - C) $64$
   - D) $24$

4. If $f(x) = 4 \cdot 2^{x}$, what is $f(5)$?
   - A) $32768$
   - B) $32$
   - C) $36$
   - D) $128$

**Proficient Level**

5. If $f(x) = 6 \cdot 2^{x}$, what is $f(0)$?
   - A) $0$
   - B) $6$
   - C) $1$
   - D) $12$

6. If $f(x) = 2 \cdot 5^{x}$, what is $f(3)$?
   - A) $1000$
   - B) $125$
   - C) $250$
   - D) $30$

7. If $f(x) = 10 \cdot 3^{x}$, what is $f(2)$?
   - A) $90$
   - B) $900$
   - C) $9$
   - D) $60$

**Advanced Level**

8. If $f(x) = 3 \cdot 2^{x}$, what is $f(-2)$?
   - A) $-12$
   - B) $12$
   - C) $-\dfrac{3}{4}$
   - D) $\dfrac{3}{4}$

9. If $f(x) = 100 \cdot 2^{x}$, what is $f(3)$?
   - A) $8000000$
   - B) $800$
   - C) $8$
   - D) $400$

10. If $f(x) = 7 \cdot 4^{x}$, what is $f(2)$?
    - A) $784$
    - B) $16$
    - C) $112$
    - D) $56$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

If $f(x) = 2 \cdot 3^{x}$, what is $f(4)$?

- A) $1296$
- B) $162$
- C) $81$
- D) $24$

**Item 2**

If $f(x) = 5 \cdot 2^{x}$, what is $f(3)$?

- A) $40$
- B) $1000$
- C) $8$
- D) $30$

**Item 3**

If $f(x) = 3 \cdot 5^{x}$, what is $f(2)$?

- A) $225$
- B) $25$
- C) $75$
- D) $30$

**Item 4**

If $f(x) = 8 \cdot 3^{x}$, what is $f(0)$?

- A) $0$
- B) $1$
- C) $24$
- D) $8$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. If $f(x) = 3 \cdot 2^{x}$, what is $f(4)$?**

Step 1: Substitute. $3 \cdot 2^{4}$.

Step 2: Evaluate the power first. $2^{4} = 16$.

Step 3: Multiply by the coefficient. $3 \times 16 = 48$.

$$48$$

**Answer: B** ($48$)

```json
"distractor_logic": {
  "A": "Student makes misconception: exponent_applied_to_coefficient (raises the coefficient as well, computing 3 times 2 = 6 and then 6 to the fourth = 1296; without a bracket the exponent attaches only to the 2)",
  "B": "Correct: 2 to the fourth is 16, and 3 times 16 is 48",
  "C": "Student makes misconception: coefficient_ignored_in_power (evaluates 2 to the fourth as 16 and reports it, leaving out the starting amount entirely)",
  "D": "Student makes misconception: adds_exponents_wrongly (treats the coefficient as another power of one base, reading 3 times 2 to the fourth as 3 to the 1 plus 4, and evaluates 3 to the fifth = 243)"
},
"misconception_tag": {
  "A": "exponent_applied_to_coefficient",
  "C": "coefficient_ignored_in_power",
  "D": "adds_exponents_wrongly"
}
```

---

**2. If $f(x) = 5 \cdot 3^{x}$, what is $f(2)$?**

Step 1: $3^{2} = 9$.

Step 2: $5 \times 9 = 45$.

$$45$$

**Answer: C** ($45$)

```json
"distractor_logic": {
  "A": "Student makes misconception: exponent_applied_to_coefficient (raises the coefficient too, computing 5 times 3 = 15 and then 15 squared = 225)",
  "B": "Student makes misconception: coefficient_ignored_in_power (evaluates 3 squared as 9 and stops, dropping the coefficient)",
  "C": "Correct: 3 squared is 9, and 5 times 9 is 45",
  "D": "Student makes misconception: squaring_confused_with_doubling (doubles the base rather than squaring it, giving 6 where 3 squared is 9, then multiplies by 5 to reach 30)"
},
"misconception_tag": {
  "A": "exponent_applied_to_coefficient",
  "B": "coefficient_ignored_in_power",
  "D": "squaring_confused_with_doubling"
}
```

---

**3. If $f(x) = 2 \cdot 4^{x}$, what is $f(3)$?**

Step 1: $4^{3} = 64$.

Step 2: $2 \times 64 = 128$.

$$128$$

**Answer: A** ($128$)

```json
"distractor_logic": {
  "A": "Correct: 4 cubed is 64, and 2 times 64 is 128",
  "B": "Student makes misconception: exponent_applied_to_coefficient (raises the coefficient too, computing 2 times 4 = 8 and then 8 cubed = 512)",
  "C": "Student makes misconception: coefficient_ignored_in_power (evaluates 4 cubed as 64 and reports it without multiplying by the 2)",
  "D": "Student makes misconception: base_times_exponent (multiplies the base by the exponent, giving 4 times 3 = 12, then doubles to reach 24)"
},
"misconception_tag": {
  "B": "exponent_applied_to_coefficient",
  "C": "coefficient_ignored_in_power",
  "D": "base_times_exponent"
}
```

---

**4. If $f(x) = 4 \cdot 2^{x}$, what is $f(5)$?**

Step 1: $2^{5} = 32$.

Step 2: $4 \times 32 = 128$.

$$128$$

**Answer: D** ($128$)

```json
"distractor_logic": {
  "A": "Student makes misconception: exponent_applied_to_coefficient (raises the coefficient too, computing 4 times 2 = 8 and then 8 to the fifth = 32768)",
  "B": "Student makes misconception: coefficient_ignored_in_power (evaluates 2 to the fifth as 32 and stops, dropping the coefficient)",
  "C": "Student makes misconception: coefficient_added_not_multiplied (evaluates the power correctly to 32 but adds the coefficient rather than multiplying, giving 4 plus 32 = 36)",
  "D": "Correct: 2 to the fifth is 32, and 4 times 32 is 128"
},
"misconception_tag": {
  "A": "exponent_applied_to_coefficient",
  "B": "coefficient_ignored_in_power",
  "C": "coefficient_added_not_multiplied"
}
```

---

**Proficient Level**

**5. If $f(x) = 6 \cdot 2^{x}$, what is $f(0)$?**

Step 1: $2^{0} = 1$.

Step 2: $6 \times 1 = 6$.

$$6$$

The function at zero returns its coefficient, which is why $a$ is called the starting amount.

**Answer: B** ($6$)

```json
"distractor_logic": {
  "A": "Student makes misconception: base_times_exponent (multiplies the base by the exponent, giving 2 times 0 = 0, so the whole product collapses to zero)",
  "B": "Correct: 2 to the zero is 1, and 6 times 1 is 6",
  "C": "Student makes misconception: coefficient_ignored_in_power (evaluates 2 to the zero as 1 and reports it, dropping the coefficient)",
  "D": "Student makes misconception: base_times_exponent (treats the zero input as leaving one factor of the base, giving 6 times 2 = 12)"
},
"misconception_tag": {
  "A": "base_times_exponent",
  "C": "coefficient_ignored_in_power",
  "D": "base_times_exponent"
}
```

---

**6. If $f(x) = 2 \cdot 5^{x}$, what is $f(3)$?**

Step 1: $5^{3} = 125$.

Step 2: $2 \times 125 = 250$.

$$250$$

**Answer: C** ($250$)

```json
"distractor_logic": {
  "A": "Student makes misconception: exponent_applied_to_coefficient (raises the coefficient too, computing 2 times 5 = 10 and then 10 cubed = 1000)",
  "B": "Student makes misconception: coefficient_ignored_in_power (evaluates 5 cubed as 125 and stops, dropping the coefficient)",
  "C": "Correct: 5 cubed is 125, and 2 times 125 is 250",
  "D": "Student makes misconception: base_times_exponent (multiplies the base by the exponent, giving 5 times 3 = 15, then doubles to reach 30)"
},
"misconception_tag": {
  "A": "exponent_applied_to_coefficient",
  "B": "coefficient_ignored_in_power",
  "D": "base_times_exponent"
}
```

---

**7. If $f(x) = 10 \cdot 3^{x}$, what is $f(2)$?**

Step 1: $3^{2} = 9$.

Step 2: $10 \times 9 = 90$.

$$90$$

**Answer: A** ($90$)

```json
"distractor_logic": {
  "A": "Correct: 3 squared is 9, and 10 times 9 is 90",
  "B": "Student makes misconception: exponent_applied_to_coefficient (raises the coefficient too, computing 10 times 3 = 30 and then 30 squared = 900)",
  "C": "Student makes misconception: coefficient_ignored_in_power (evaluates 3 squared as 9 and reports it without the coefficient)",
  "D": "Student makes misconception: base_times_exponent (multiplies the base by the exponent, giving 3 times 2 = 6, then multiplies by 10 to reach 60)"
},
"misconception_tag": {
  "B": "exponent_applied_to_coefficient",
  "C": "coefficient_ignored_in_power",
  "D": "base_times_exponent"
}
```

---

**Advanced Level**

**8. If $f(x) = 3 \cdot 2^{x}$, what is $f(-2)$?**

Step 1: A negative exponent gives a reciprocal. $2^{-2} = \frac{1}{4}$.

Step 2: $3 \times \frac{1}{4} = \frac{3}{4}$.

$$\frac{3}{4}$$

The output is smaller than the coefficient, and positive. Going backwards in $x$ shrinks the value; it never changes its sign.

**Answer: D** ($\frac{3}{4}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: negative_exponent_as_negative_value (reads the negative input as making the output negative and evaluates 2 squared as 4, giving -12)",
  "B": "Student makes misconception: negative_exponent_as_negative_value (drops the minus sign entirely and evaluates f(2) instead, giving 3 times 4 = 12)",
  "C": "Student makes misconception: negative_exponent_as_negative_value (takes the reciprocal correctly but also makes the result negative, applying the minus sign twice)",
  "D": "Correct: 2 to the -2 is one quarter, and 3 times one quarter is three quarters"
},
"misconception_tag": {
  "A": "negative_exponent_as_negative_value",
  "B": "negative_exponent_as_negative_value",
  "C": "negative_exponent_as_negative_value"
}
```

---

**9. If $f(x) = 100 \cdot 2^{x}$, what is $f(3)$?**

Step 1: $2^{3} = 8$.

Step 2: $100 \times 8 = 800$.

$$800$$

**Answer: B** ($800$)

```json
"distractor_logic": {
  "A": "Student makes misconception: exponent_applied_to_coefficient (raises the coefficient too, computing 100 times 2 = 200 and then 200 cubed, which is 8 million)",
  "B": "Correct: 2 cubed is 8, and 100 times 8 is 800",
  "C": "Student makes misconception: coefficient_ignored_in_power (evaluates 2 cubed as 8 and reports it, dropping the coefficient entirely)",
  "D": "Student makes misconception: linear_instead_of_compound (adds the starting amount once per period rather than multiplying by the base, giving 100 then 200 then 300 then 400, which grows by a fixed step where exponential growth accelerates)"
},
"misconception_tag": {
  "A": "exponent_applied_to_coefficient",
  "C": "coefficient_ignored_in_power",
  "D": "linear_instead_of_compound"
}
```

---

**10. If $f(x) = 7 \cdot 4^{x}$, what is $f(2)$?**

Step 1: $4^{2} = 16$.

Step 2: $7 \times 16 = 112$.

$$112$$

**Answer: C** ($112$)

```json
"distractor_logic": {
  "A": "Student makes misconception: exponent_applied_to_coefficient (raises the coefficient too, computing 7 times 4 = 28 and then 28 squared = 784)",
  "B": "Student makes misconception: coefficient_ignored_in_power (evaluates 4 squared as 16 and stops, dropping the coefficient)",
  "C": "Correct: 4 squared is 16, and 7 times 16 is 112",
  "D": "Student makes misconception: base_times_exponent (multiplies the base by the exponent, giving 4 times 2 = 8, then multiplies by 7 to reach 56)"
},
"misconception_tag": {
  "A": "exponent_applied_to_coefficient",
  "B": "coefficient_ignored_in_power",
  "D": "base_times_exponent"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: If $f(x) = 2 \cdot 3^{x}$, what is $f(4)$?**

Step 1: $3^{4} = 81$.

Step 2: $2 \times 81 = 162$.

$$162$$

**Answer: B** ($162$)

```json
"distractor_logic": {
  "A": "Student makes misconception: exponent_applied_to_coefficient (raises the coefficient too, computing 2 times 3 = 6 and then 6 to the fourth = 1296)",
  "B": "Correct: 3 to the fourth is 81, and 2 times 81 is 162",
  "C": "Student makes misconception: coefficient_ignored_in_power (evaluates 3 to the fourth as 81 and reports it without doubling)",
  "D": "Student makes misconception: base_times_exponent (multiplies the base by the exponent, giving 3 times 4 = 12, then doubles to reach 24)"
},
"misconception_tag": {
  "A": "exponent_applied_to_coefficient",
  "C": "coefficient_ignored_in_power",
  "D": "base_times_exponent"
}
```

---

**Item 2: If $f(x) = 5 \cdot 2^{x}$, what is $f(3)$?**

Step 1: $2^{3} = 8$.

Step 2: $5 \times 8 = 40$.

$$40$$

**Answer: A** ($40$)

```json
"distractor_logic": {
  "A": "Correct: 2 cubed is 8, and 5 times 8 is 40",
  "B": "Student makes misconception: exponent_applied_to_coefficient (raises the coefficient too, computing 5 times 2 = 10 and then 10 cubed = 1000)",
  "C": "Student makes misconception: coefficient_ignored_in_power (evaluates 2 cubed as 8 and stops, dropping the coefficient)",
  "D": "Student makes misconception: base_times_exponent (multiplies the base by the exponent, giving 2 times 3 = 6, then multiplies by 5 to reach 30)"
},
"misconception_tag": {
  "B": "exponent_applied_to_coefficient",
  "C": "coefficient_ignored_in_power",
  "D": "base_times_exponent"
}
```

---

**Item 3: If $f(x) = 3 \cdot 5^{x}$, what is $f(2)$?**

Step 1: $5^{2} = 25$.

Step 2: $3 \times 25 = 75$.

$$75$$

**Answer: C** ($75$)

```json
"distractor_logic": {
  "A": "Student makes misconception: exponent_applied_to_coefficient (raises the coefficient too, computing 3 times 5 = 15 and then 15 squared = 225)",
  "B": "Student makes misconception: coefficient_ignored_in_power (evaluates 5 squared as 25 and reports it without the coefficient)",
  "C": "Correct: 5 squared is 25, and 3 times 25 is 75",
  "D": "Student makes misconception: base_times_exponent (multiplies the base by the exponent, giving 5 times 2 = 10, then multiplies by 3 to reach 30)"
},
"misconception_tag": {
  "A": "exponent_applied_to_coefficient",
  "B": "coefficient_ignored_in_power",
  "D": "base_times_exponent"
}
```

---

**Item 4: If $f(x) = 8 \cdot 3^{x}$, what is $f(0)$?**

Step 1: $3^{0} = 1$.

Step 2: $8 \times 1 = 8$.

$$8$$

**Answer: D** ($8$)

```json
"distractor_logic": {
  "A": "Student makes misconception: base_times_exponent (multiplies the base by the exponent, giving 3 times 0 = 0, so the product collapses to zero)",
  "B": "Student makes misconception: coefficient_ignored_in_power (evaluates 3 to the zero as 1 and reports it, dropping the coefficient)",
  "C": "Student makes misconception: base_times_exponent (treats the zero input as leaving one factor of the base, giving 8 times 3 = 24)",
  "D": "Correct: 3 to the zero is 1, and 8 times 1 is 8, which is the coefficient and therefore the starting amount"
},
"misconception_tag": {
  "A": "base_times_exponent",
  "B": "coefficient_ignored_in_power",
  "C": "base_times_exponent"
}
```
