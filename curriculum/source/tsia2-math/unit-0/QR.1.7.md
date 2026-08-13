---
topic_name: "Order of operations"
unit_number: 0
sequence_in_unit: 3
assessment_layer: "ENRICHMENT"
estimated_time_minutes: 45
difficulty_band: "Basic"
related_strand: "QR"
keywords: ["order of operations", "PEMDAS", "parentheses", "exponents", "grouping symbols", "evaluating expressions"]
---

# QR.1.7 - Order of Operations

**Topic ID:** QR.1.7  
**Unit:** 0  
**Strand:** QR (Quantitative Reasoning)  
**Assessment Layer:** ENRICHMENT  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Why Anyone Bothered to Write a Rule

Take the expression $8 + 3 \times 4$.

Do the addition first and you get $11 \times 4 = 44$. Do the multiplication first and you get $8 + 12 = 20$.

Two people, same expression, two answers. That is intolerable. A bridge cannot be built on an expression that means different things to different engineers, so mathematics settled the argument once, globally, with a fixed order. The answer is $20$, and it is $20$ everywhere on earth.

That is all the order of operations is: an agreement about who goes first. It is not deep. But it is the substrate under every other topic on this test, so a shaky grip here shows up as wrong answers in algebra, geometry and statistics, where you will blame the harder topic instead of the arithmetic.

---

##### The Order

1. **Parentheses** and other grouping symbols, innermost first.
2. **Exponents**.
3. **Multiplication and Division**, left to right.
4. **Addition and Subtraction**, left to right.

You may know this as **PEMDAS**. The mnemonic is fine. It also causes two specific, predictable errors, so read the next section before you trust it.

---

##### The Two Things PEMDAS Lies About

**Lie 1: multiplication does not outrank division.**

They are the same tier. So are addition and subtraction. When you have both from the same tier, you go **left to right**, not M before D.

$$6 \div 2 \times 3$$

Left to right: $6 \div 2 = 3$, then $3 \times 3 = 9$.

A student who reads PEMDAS as "M then D" does $2 \times 3 = 6$ first, then $6 \div 6 = 1$. Wrong, by a factor of nine.

The same trap sits in the last tier. $10 - 4 + 2$ is $6 + 2 = 8$, working left to right. Doing the addition first gives $10 - 6 = 4$.

**Lie 2: the letters are tiers, not steps.**

PEMDAS has six letters and there are only four tiers. Think of it as four rows, with two of the rows holding a tie that left-to-right breaks.

| Tier | Operations | Tie broken by |
|---|---|---|
| 1 | grouping symbols | innermost first |
| 2 | exponents | left to right |
| 3 | multiplication, division | left to right |
| 4 | addition, subtraction | left to right |

---

##### Grouping Symbols Are More Than Parentheses

Parentheses are the obvious one. These also group, and they are the ones students walk past:

- **Brackets** $[\ ]$, used to nest inside parentheses.
- **The fraction bar.** Everything on top is one group and everything on the bottom is another. $\frac{12 + 12}{6 - 2}$ means $(12+12) \div (6-2)$, which is $24 \div 4 = 6$.
- **The radical sign.** Everything under it is grouped.

The fraction bar is the expensive one. Writing $\frac{24}{6-2}$ as $24 \div 6 - 2$ turns $6$ into $2$, and nothing about the written expression warned you.

---

##### Exponents Are Not Multiplication

$3^2$ means $3 \times 3 = 9$. It does not mean $3 \times 2 = 6$.

This gets missed under time pressure more than almost anything else, because $2^2$ and $2 \times 2$ happen to agree, so the habit survives until it meets $3^2$ and quietly breaks.

Say it as "three squared is nine" rather than "three to the two," and the multiplication reading stops suggesting itself.

Also watch what the exponent is attached to. In $5 + 3^2$, the exponent belongs to the $3$ alone, so this is $5 + 9 = 14$. It is not $(5+3)^2 = 64$. An exponent grabs only the thing immediately under it unless parentheses say otherwise.

---

##### Worked Examples

**Example 1:** $4 + 6 \div 2 \times 3$

Step 1: No grouping symbols, no exponents. Go to tier 3, which holds both the division and the multiplication.

Step 2: Left to right within that tier.
- $6 \div 2 = 3$
- $3 \times 3 = 9$

Step 3: Now tier 4.
- $4 + 9 = 13$

The whole difficulty is resisting the urge to multiply first. Left to right.

---

**Example 2:** $-2(5 - 8) + 4$

Step 1: Parentheses first.
- $5 - 8 = -3$

Step 2: Multiply. Two negatives make a positive.
- $-2 \times (-3) = 6$

Step 3: Add.
- $6 + 4 = 10$

The common wreck here is distributing the $-2$ across the parentheses but only onto the first term: $-2 \times 5 - 8 = -18$, then $-14$. If you distribute, distribute onto **both** terms. Or simpler: just evaluate what is inside the parentheses first, which is what the rule told you to do.

---

**Example 3:** $\frac{12 + 3 \times 4}{6 - 2}$

Step 1: The fraction bar groups the top and the bottom separately. Handle each as its own expression.

Step 2: Top. Multiplication before addition.
- $3 \times 4 = 12$, so the top is $12 + 12 = 24$

Step 3: Bottom.
- $6 - 2 = 4$

Step 4: Now divide.
- $24 \div 4 = 6$

---

**Example 4:** $3 + 2[8 - (5 - 2)^2]$

Step 1: Innermost grouping first.
- $5 - 2 = 3$

Step 2: The exponent, which is inside the brackets.
- $3^2 = 9$

Step 3: Finish the brackets.
- $8 - 9 = -1$

Step 4: Multiply.
- $2 \times (-1) = -2$

Step 5: Add.
- $3 + (-2) = 1$

Work from the inside out and each step is small. Try to hold the whole thing in your head at once and you will drop a sign.

---

##### Expressions in Context

Word problems build expressions with a shape you will see over and over: **a flat fee, plus a rate times a count, minus a discount.**

**Example 5:** A caterer charges a \$75 setup fee plus \$12 per guest, then applies a \$40 discount to the total. What is the cost for $18$ guests?

Step 1: Build the expression.
- $75 + 12 \times 18 - 40$

Step 2: Tier 3 first. The rate multiplies the count.
- $12 \times 18 = 216$

Step 3: Tier 4, left to right.
- $75 + 216 = 291$
- $291 - 40 = 251$

So the cost is \$251.

The failure here is adding the setup fee to the per-guest rate before multiplying, which charges every guest for the setup: $(75 + 12) \times 18$ is $1{,}566$, six times the real bill. The setup fee is charged **once**, and the order of operations is what encodes that.

---

##### The Four Traps

1. **Multiplying before dividing.** They are the same tier. Left to right. Same for addition and subtraction.
2. **Reading an exponent as multiplication.** $3^2$ is $9$, not $6$.
3. **Ignoring the fraction bar as a grouping symbol.** The top is one group and the bottom is another.
4. **Answering an intermediate step.** The number you computed inside the parentheses is not the answer to the question.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. What is the value of $8 + 3 \times 4$?
   - A) $44$
   - B) $12$
   - C) $15$
   - D) $20$

2. What is the value of $(5 + 3) \times 2$?
   - A) $16$
   - B) $11$
   - C) $10$
   - D) $8$

3. What is the value of $20 - 12 \div 4$?
   - A) $3$
   - B) $2$
   - C) $17$
   - D) $8$

4. What is the value of $5 + 3^2$?
   - A) $64$
   - B) $11$
   - C) $9$
   - D) $14$

**Proficient Level** (these require an extra step)

5. What is the value of $4 + 6 \div 2 \times 3$?
   - A) $7$
   - B) $13$
   - C) $5$
   - D) $9$

6. What is the value of $-2(5 - 8) + 4$?
   - A) $6$
   - B) $-14$
   - C) $-2$
   - D) $10$

7. What is the value of $\frac{12 + 3 \times 4}{6 - 2}$?
   - A) $24$
   - B) $6$
   - C) $15$
   - D) $12$

**Advanced Level** (these need multiple steps or reverse thinking)

8. What is the value of $3 + 2[8 - (5 - 2)^2]$?
   - A) $7$
   - B) $1$
   - C) $-1$
   - D) $-5$

9. A caterer charges a \$75 setup fee plus \$12 per guest, and then applies a \$40 discount to the total. What is the cost for $18$ guests?
   - A) \$291
   - B) \$1,526
   - C) \$251
   - D) \$216

10. What is the value of $\dfrac{3(8 - 4)^2 - 12}{6}$?
    - A) $6$
    - B) $2$
    - C) $36$
    - D) $22$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

What is the value of $7 + 2 \times 5$?

- A) $14$
- B) $17$
- C) $45$
- D) $10$

**Item 2**

What is the value of $(9 - 4)^2$?

- A) $25$
- B) $10$
- C) $-7$
- D) $5$

**Item 3**

What is the value of $18 \div 3 + 2 \times 4$?

- A) $26$
- B) $32$
- C) $6$
- D) $14$

**Item 4**

A phone plan costs \$35 per month plus \$0.10 per text message, and a \$15 account credit is subtracted from the total. What is the bill for a month with $120$ text messages?

- A) \$4,197
- B) \$12
- C) \$32
- D) \$47

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. What is the value of $8 + 3 \times 4$?**

Step 1: Multiplication is tier 3 and addition is tier 4, so multiply first.
- $3 \times 4 = 12$

Step 2: Add.
- $8 + 12 = 20$

**Answer: D** ($20$)

```json
"distractor_logic": {
  "A": "Student makes misconception: order_of_operations_violated (works left to right, adding 8 and 3 first and then multiplying the sum by 4)",
  "B": "Student makes misconception: answers_intermediate_value (computes 3 times 4 correctly and reports that product without adding the 8)",
  "C": "Student makes misconception: operation_ignored_entirely (treats the multiplication as another addition and totals 8, 3 and 4)",
  "D": "Correct: multiplies 3 by 4 before adding, giving 8 plus 12"
},
"misconception_tag": {
  "A": "order_of_operations_violated",
  "B": "answers_intermediate_value",
  "C": "operation_ignored_entirely"
}
```

---

**2. What is the value of $(5 + 3) \times 2$?**

Step 1: Parentheses are tier 1.
- $5 + 3 = 8$

Step 2: Multiply.
- $8 \times 2 = 16$

**Answer: A** ($16$)

```json
"distractor_logic": {
  "A": "Correct: evaluates the parentheses to 8, then multiplies by 2",
  "B": "Student makes misconception: drops_grouping_symbols (ignores the parentheses and applies the ordinary tier rule to 5 plus 3 times 2, multiplying before adding)",
  "C": "Student makes misconception: operation_ignored_entirely (multiplies 5 by 2 and never applies the addition inside the parentheses)",
  "D": "Student makes misconception: answers_intermediate_value (evaluates the parentheses correctly to 8 and reports it without multiplying)"
},
"misconception_tag": {
  "B": "drops_grouping_symbols",
  "C": "operation_ignored_entirely",
  "D": "answers_intermediate_value"
}
```

---

**3. What is the value of $20 - 12 \div 4$?**

Step 1: Division is tier 3 and subtraction is tier 4, so divide first.
- $12 \div 4 = 3$

Step 2: Subtract.
- $20 - 3 = 17$

**Answer: C** ($17$)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (computes 12 divided by 4 correctly and reports that quotient without subtracting it from 20)",
  "B": "Student makes misconception: order_of_operations_violated (works left to right, subtracting 12 from 20 first and then dividing the difference by 4)",
  "C": "Correct: divides 12 by 4 before subtracting, giving 20 minus 3",
  "D": "Student makes misconception: operation_ignored_entirely (subtracts 12 from 20 and never applies the division at all)"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "B": "order_of_operations_violated",
  "D": "operation_ignored_entirely"
}
```

---

**4. What is the value of $5 + 3^2$?**

Step 1: Exponents are tier 2 and addition is tier 4, so square first.
- $3^2 = 3 \times 3 = 9$

Step 2: Add. The exponent belongs to the $3$ alone, not to $5 + 3$.
- $5 + 9 = 14$

**Answer: D** ($14$)

```json
"distractor_logic": {
  "A": "Student makes misconception: order_of_operations_violated (adds 5 and 3 first and squares the sum, attaching the exponent to a group the expression never wrote)",
  "B": "Student makes misconception: squaring_confused_with_doubling (reads 3 squared as 3 times 2 for 6, then adds 5)",
  "C": "Student makes misconception: answers_intermediate_value (squares the 3 correctly and reports 9 without adding the 5)",
  "D": "Correct: squares the 3 to 9 before adding, giving 5 plus 9"
},
"misconception_tag": {
  "A": "order_of_operations_violated",
  "B": "squaring_confused_with_doubling",
  "C": "answers_intermediate_value"
}
```

---

**Proficient Level**

**5. What is the value of $4 + 6 \div 2 \times 3$?**

Step 1: The division and the multiplication share tier 3, so take them left to right.
- $6 \div 2 = 3$
- $3 \times 3 = 9$

Step 2: Add.
- $4 + 9 = 13$

**Answer: B** ($13$)

```json
"distractor_logic": {
  "A": "Student makes misconception: operation_ignored_entirely (computes 4 plus 6 divided by 2 and never applies the multiplication by 3)",
  "B": "Correct: works tier 3 left to right for 6 divided by 2 then times 3, giving 9, and adds 4",
  "C": "Student makes misconception: order_of_operations_violated (reads PEMDAS as multiplication before division, computing 2 times 3 first and then 6 divided by 6)",
  "D": "Student makes misconception: answers_intermediate_value (finishes tier 3 correctly for 9 and reports it without adding the 4)"
},
"misconception_tag": {
  "A": "operation_ignored_entirely",
  "C": "order_of_operations_violated",
  "D": "answers_intermediate_value"
}
```

---

**6. What is the value of $-2(5 - 8) + 4$?**

Step 1: Parentheses first.
- $5 - 8 = -3$

Step 2: Multiply. Two negative factors give a positive product.
- $-2 \times (-3) = 6$

Step 3: Add.
- $6 + 4 = 10$

**Answer: D** ($10$)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (computes -2 times -3 correctly as 6 and reports it without adding the 4)",
  "B": "Student makes misconception: drops_negative_on_group (distributes the -2 onto the 5 only and leaves the 8 unmultiplied, computing -10 minus 8 plus 4)",
  "C": "Student makes misconception: wrong_sign_on_factor (multiplies the magnitudes correctly for 6 but assigns a negative sign to a product of two negatives, then adds 4)",
  "D": "Correct: evaluates the parentheses to -3, multiplies by -2 for a positive 6, then adds 4"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "B": "drops_negative_on_group",
  "C": "wrong_sign_on_factor"
}
```

---

**7. What is the value of $\frac{12 + 3 \times 4}{6 - 2}$?**

Step 1: The fraction bar groups the top and the bottom separately.

Step 2: Evaluate the top, multiplication before addition.
- $3 \times 4 = 12$, so the top is $12 + 12 = 24$

Step 3: Evaluate the bottom.
- $6 - 2 = 4$

Step 4: Divide.
- $24 \div 4 = 6$

**Answer: B** ($6$)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (evaluates the numerator correctly to 24 and reports it without dividing by the denominator)",
  "B": "Correct: treats the fraction bar as grouping both the top and the bottom, giving 24 divided by 4",
  "C": "Student makes misconception: order_of_operations_violated (adds 12 and 3 in the numerator before multiplying by 4, giving 60 over 4)",
  "D": "Student makes misconception: drops_grouping_symbols (reads the expression as a flat line, computing 12 plus 3 times 4 divided by 6 minus 2, so the bar groups nothing)"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "C": "order_of_operations_violated",
  "D": "drops_grouping_symbols"
}
```

---

**Advanced Level**

**8. What is the value of $3 + 2[8 - (5 - 2)^2]$?**

Step 1: Innermost grouping first.
- $5 - 2 = 3$

Step 2: The exponent inside the brackets.
- $3^2 = 9$

Step 3: Finish the brackets.
- $8 - 9 = -1$

Step 4: Multiply.
- $2 \times (-1) = -2$

Step 5: Add.
- $3 + (-2) = 1$

**Answer: B** ($1$)

```json
"distractor_logic": {
  "A": "Student makes misconception: squaring_confused_with_doubling (reads 3 squared as 3 times 2 for 6, so the bracket becomes 2 and the expression gives 3 plus 4)",
  "B": "Correct: works from the innermost grouping outward, giving 3 plus 2 times -1",
  "C": "Student makes misconception: answers_intermediate_value (evaluates the bracket correctly to -1 and reports it without multiplying by 2 or adding 3)",
  "D": "Student makes misconception: order_of_operations_violated (adds 3 and 2 before applying the bracket, multiplying 5 by -1 instead of multiplying only the 2)"
},
"misconception_tag": {
  "A": "squaring_confused_with_doubling",
  "C": "answers_intermediate_value",
  "D": "order_of_operations_violated"
}
```

---

**9. A caterer charges a \$75 setup fee plus \$12 per guest, and then applies a \$40 discount to the total. What is the cost for $18$ guests?**

Step 1: Build the expression.
- $75 + 12 \times 18 - 40$

Step 2: Tier 3 first. The per-guest rate multiplies the guest count.
- $12 \times 18 = 216$

Step 3: Tier 4, left to right.
- $75 + 216 = 291$
- $291 - 40 = 251$

**Answer: C** (\$251)

```json
"distractor_logic": {
  "A": "Student makes misconception: operation_ignored_entirely (adds the setup fee to the per-guest total for 291 but never subtracts the discount)",
  "B": "Student makes misconception: order_of_operations_violated (adds the setup fee to the per-guest rate first and multiplies the sum by 18, charging every guest for a setup fee that is paid once)",
  "C": "Correct: multiplies the 12 per guest by 18 guests before adding the setup fee and subtracting the discount",
  "D": "Student makes misconception: answers_intermediate_value (computes the per-guest total of 216 correctly and reports it without the setup fee or the discount)"
},
"misconception_tag": {
  "A": "operation_ignored_entirely",
  "B": "order_of_operations_violated",
  "D": "answers_intermediate_value"
}
```

---

**10. What is the value of $\dfrac{3(8 - 4)^2 - 12}{6}$?**

Step 1: Innermost grouping.
- $8 - 4 = 4$

Step 2: The exponent. It belongs to the parentheses only, not to the $3$ in front of them.
- $4^2 = 16$

Step 3: Multiply, then subtract, working the numerator.
- $3 \times 16 = 48$
- $48 - 12 = 36$

Step 4: Divide by the denominator.
- $36 \div 6 = 6$

**Answer: A** ($6$)

```json
"distractor_logic": {
  "A": "Correct: squares the parentheses before multiplying by 3, giving a numerator of 36 and a quotient of 6",
  "B": "Student makes misconception: squaring_confused_with_doubling (reads the square as a doubling, computing 3 times 4 times 2 for a numerator of 12)",
  "C": "Student makes misconception: answers_intermediate_value (evaluates the numerator correctly to 36 and reports it without dividing by 6)",
  "D": "Student makes misconception: order_of_operations_violated (multiplies the 3 into the parentheses before squaring, squaring 12 instead of 4 for a numerator of 132)"
},
"misconception_tag": {
  "B": "squaring_confused_with_doubling",
  "C": "answers_intermediate_value",
  "D": "order_of_operations_violated"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: What is the value of $7 + 2 \times 5$?**

Step 1: Multiply first.
- $2 \times 5 = 10$

Step 2: Add.
- $7 + 10 = 17$

**Answer: B** ($17$)

```json
"distractor_logic": {
  "A": "Student makes misconception: operation_ignored_entirely (treats the multiplication as another addition and totals 7, 2 and 5)",
  "B": "Correct: multiplies 2 by 5 before adding, giving 7 plus 10",
  "C": "Student makes misconception: order_of_operations_violated (works left to right, adding 7 and 2 first and then multiplying the sum by 5)",
  "D": "Student makes misconception: answers_intermediate_value (computes 2 times 5 correctly and reports that product without adding the 7)"
},
"misconception_tag": {
  "A": "operation_ignored_entirely",
  "C": "order_of_operations_violated",
  "D": "answers_intermediate_value"
}
```

---

**Item 2: What is the value of $(9 - 4)^2$?**

Step 1: Parentheses first.
- $9 - 4 = 5$

Step 2: Square the result.
- $5^2 = 25$

**Answer: A** ($25$)

```json
"distractor_logic": {
  "A": "Correct: evaluates the parentheses to 5, then squares it for 25",
  "B": "Student makes misconception: squaring_confused_with_doubling (evaluates the parentheses to 5 but doubles it instead of squaring it)",
  "C": "Student makes misconception: drops_grouping_symbols (ignores the parentheses and squares only the 4, computing 9 minus 16)",
  "D": "Student makes misconception: answers_intermediate_value (evaluates the parentheses correctly to 5 and reports it without applying the exponent)"
},
"misconception_tag": {
  "B": "squaring_confused_with_doubling",
  "C": "drops_grouping_symbols",
  "D": "answers_intermediate_value"
}
```

---

**Item 3: What is the value of $18 \div 3 + 2 \times 4$?**

Step 1: Tier 3 holds both the division and the multiplication. Take them left to right.
- $18 \div 3 = 6$
- $2 \times 4 = 8$

Step 2: Add.
- $6 + 8 = 14$

**Answer: D** ($14$)

```json
"distractor_logic": {
  "A": "Student makes misconception: operation_ignored_entirely (never applies the division, computing 18 plus 2 times 4)",
  "B": "Student makes misconception: order_of_operations_violated (works straight across left to right, computing 18 divided by 3 for 6, then 6 plus 2 for 8, then 8 times 4)",
  "C": "Student makes misconception: answers_intermediate_value (computes 18 divided by 3 correctly and reports 6 without the second term)",
  "D": "Correct: completes both tier 3 operations for 6 and 8, then adds them"
},
"misconception_tag": {
  "A": "operation_ignored_entirely",
  "B": "order_of_operations_violated",
  "C": "answers_intermediate_value"
}
```

---

**Item 4: A phone plan costs \$35 per month plus \$0.10 per text message, and a \$15 account credit is subtracted from the total. What is the bill for a month with $120$ text messages?**

Step 1: Build the expression.
- $35 + 0.10 \times 120 - 15$

Step 2: Tier 3 first.
- $0.10 \times 120 = 12$

Step 3: Tier 4, left to right.
- $35 + 12 = 47$
- $47 - 15 = 32$

**Answer: C** (\$32)

```json
"distractor_logic": {
  "A": "Student makes misconception: order_of_operations_violated (adds the monthly fee to the per-text rate first and multiplies the sum by 120, charging the monthly fee once per message)",
  "B": "Student makes misconception: answers_intermediate_value (computes the text charge of 12 correctly and reports it without the monthly fee or the credit)",
  "C": "Correct: multiplies the per-text rate by 120 before adding the monthly fee and subtracting the credit",
  "D": "Student makes misconception: operation_ignored_entirely (adds the monthly fee to the text charge for 47 but never subtracts the account credit)"
},
"misconception_tag": {
  "A": "order_of_operations_violated",
  "B": "answers_intermediate_value",
  "D": "operation_ignored_entirely"
}
```
