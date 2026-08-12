---
topic_name: "Identifying factors of a simple quadratic expression"
unit_number: 4
sequence_in_unit: 2
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Basic"
related_strand: "AR"
keywords: ["factoring", "quadratic", "trinomial", "binomial factors", "greatest common factor", "FOIL"]
---

# AR.3.1 - Identifying Factors of a Simple Quadratic Expression

**Topic ID:** AR.3.1  
**Unit:** 4  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Multiplication, Run Backward

You know that $6 \times 7 = 42$. So if someone asks "what two numbers multiply to $42$?", you can answer, because you already know the multiplication table in both directions.

Factoring a quadratic is the same move on expressions instead of numbers.

Forward, you multiply two binomials:

$$(x + 3)(x + 4) = x^{2} + 7x + 12$$

Backward, you factor:

$$x^{2} + 7x + 12 = (x + 3)(x + 4)$$

Same statement, read from the other end. And here is the enormous advantage this gives you on a multiple-choice test:

**You can always check a factoring answer by multiplying it back out.**

There is no guesswork available to you if you refuse it. Multiply the choice, see whether you get the original. That is a complete, self-contained proof, and it takes fifteen seconds.

---

##### Multiplying Two Binomials

Since checking depends on multiplying, get fast at it. Every term in the first bracket multiplies every term in the second.

**Example 1:** Expand $(x - 4)(x + 5)$.

Step 1: First terms.
- $x \times x = x^{2}$

Step 2: Outer terms.
- $x \times 5 = 5x$

Step 3: Inner terms.
- $-4 \times x = -4x$

Step 4: Last terms.
- $-4 \times 5 = -20$

Step 5: Combine the two middle terms.
- $5x - 4x = x$

Result: $x^{2} + x - 20$.

Step 5 is where the signs decide everything. The middle terms were $+5x$ and $-4x$, and they **partly cancelled** to leave just $x$. A student who adds the magnitudes gets $9x$, which would require both middle terms to be positive. **Carry each sign into the addition.**

---

##### The Pattern That Makes Factoring Fast

Look at what happened above. In $x^{2} + bx + c$ coming from $(x + m)(x + n)$:

$$m \times n = c \qquad m + n = b$$

The two numbers **multiply to the constant** and **add to the middle coefficient**.

So to factor $x^{2} + 7x + 12$, find two numbers that multiply to $12$ and add to $7$.

- $1$ and $12$: multiply to $12$, add to $13$. No.
- $2$ and $6$: multiply to $12$, add to $8$. No.
- $3$ and $4$: multiply to $12$, add to $7$. **Yes.**

Answer: $(x + 3)(x + 4)$.

Notice that all three pairs multiply to $12$. **Getting the product right is not enough.** Every wrong answer choice on these items also multiplies to the right constant, because that is what makes them tempting. The sum is what separates the answer from the traps.

---

##### The Mistake That Costs the Most Points

Read this section twice.

**Check the sum, not just the product.**

Given $x^{2} + 9x + 20$, a student lists the pairs that multiply to $20$: $1$ and $20$, $2$ and $10$, $4$ and $5$. Then, seeing $(x + 2)(x + 10)$ in the choices with a correct product of $20$, picks it and moves on.

But $2 + 10 = 12$, and the middle coefficient is $9$. The right pair is $4$ and $5$, because $4 + 5 = 9$.

**Both conditions or neither.** Say the pair out loud as a sentence: "four times five is twenty, four plus five is nine." If you cannot say both halves, keep looking.

And if you ever doubt yourself, multiply the choice back out. $(x + 2)(x + 10) = x^{2} + 12x + 20$, which is visibly not what you started with.

---

##### Getting the Signs Right

The signs of the constant and the middle term tell you the signs inside the brackets before you find any numbers.

| Expression | Signs of the two numbers |
|---|---|
| $x^{2} + bx + c$ | both **positive** |
| $x^{2} - bx + c$ | both **negative** |
| $x^{2} + bx - c$ | one of each, and the **positive** one is larger |
| $x^{2} - bx - c$ | one of each, and the **negative** one is larger |

The logic is worth seeing rather than memorizing. A **positive** constant means the two numbers have the **same** sign, because only same signs multiply to a positive. A **negative** constant means they have **different** signs. Once you know that, the middle term's sign tells you which of the two is bigger.

**Example 2:** Factor $x^{2} - 8x + 12$.

Step 1: The constant $+12$ is positive, so both numbers share a sign. The middle term $-8$ is negative, so both are negative.

Step 2: Find negatives that multiply to $12$ and add to $-8$.
- $-1$ and $-12$: add to $-13$. No.
- $-2$ and $-6$: add to $-8$. **Yes.**
- $-3$ and $-4$: add to $-7$. No.

Step 3: Write it.
- $(x - 2)(x - 6)$

Step 4: Check by expanding. $x^{2} - 6x - 2x + 12 = x^{2} - 8x + 12$. Match.

**Example 3:** Factor $x^{2} - x - 6$.

Step 1: The constant $-6$ is negative, so the two numbers have different signs. The middle coefficient is $-1$, so the negative one is larger in size.

Step 2: Find a pair multiplying to $-6$ that adds to $-1$.
- $-3$ and $+2$: multiply to $-6$, add to $-1$. **Yes.**

Step 3: Write it.
- $(x - 3)(x + 2)$

Step 4: Check. $x^{2} + 2x - 3x - 6 = x^{2} - x - 6$. Match.

The trap on this item is $(x + 3)(x - 2)$, which uses the same digits with the signs swapped. It expands to $x^{2} - 2x + 3x - 6 = x^{2} + x - 6$, giving a middle term of $+x$ instead of $-x$. **Swapping which one carries the minus changes the answer.** The check catches it instantly.

---

##### Finding Just One Factor

Some questions hand you a quadratic and ask which single binomial divides it.

**Example 4:** Which binomial is a factor of $x^{2} + 2x - 15$?

Factor it completely first, then read off the answer.

Step 1: The constant is negative, so the signs differ. The middle term is positive, so the positive number is larger.

Step 2: Pairs multiplying to $-15$: $(1, -15)$, $(-1, 15)$, $(3, -5)$, $(-3, 5)$. Which adds to $2$?
- $-3 + 5 = 2$. **Yes.**

Step 3: The factorization is $(x - 3)(x + 5)$.

Step 4: So both $(x - 3)$ and $(x + 5)$ are factors. Whichever appears in the choices is the answer.

**Example 5:** One factor of $x^{2} + 3x - 28$ is $(x + 7)$. What is the other?

The two numbers multiply to $-28$ and add to $3$. One of them is $7$, so the other must satisfy $7 \times n = -28$, giving $n = -4$.

Other factor: $(x - 4)$. Check: $7 + (-4) = 3$, which is the middle coefficient. Correct.

Note the operation. You **divide** $-28$ by $7$ to get $-4$. A student who subtracts, computing $-28 - 7 = -35$, produces $(x - 35)$, and $7 \times -35$ is nowhere near $-28$.

---

##### Take the Common Factor Out First

When every term shares a factor, pull it out before anything else. "Completely factored" means nothing is left to pull.

**Example 6:** Completely factor $2x^{2} + 10x + 12$.

Step 1: Look for a common factor in all three terms. $2$, $10$ and $12$ are all even, so $2$ comes out.
- $2(x^{2} + 5x + 6)$

Step 2: Factor what is left in the brackets. Two numbers multiplying to $6$ and adding to $5$: $2$ and $3$.
- $2(x + 2)(x + 3)$

Step 3: Check by expanding back. $(x + 2)(x + 3) = x^{2} + 5x + 6$, and $2(x^{2} + 5x + 6) = 2x^{2} + 10x + 12$. Match.

Two wrong answers live on this kind of item, and they are wrong in different ways.

**$(2x + 4)(x + 3)$** actually expands to $2x^{2} + 10x + 12$, which is correct. But it is not **completely** factored, because $(2x + 4)$ still has a $2$ inside it. Pulling the common factor out first would have prevented it.

**$(x + 2)(x + 3)$** has the brackets right and **loses the $2$ entirely**. It expands to $x^{2} + 5x + 6$, which is half of the original expression. The common factor you pull out has to appear in the final answer, not get discarded on the way.

**Extract the common factor first, and then remember to write it down.**

---

##### The Five Traps

1. **Checking the product and not the sum.** Every wrong choice multiplies to the right constant. The sum is what decides.
2. **Getting the signs backward.** $(x - 3)(x + 2)$ and $(x + 3)(x - 2)$ are different expressions. A positive constant means same signs, a negative constant means different ones.
3. **Not extracting the common factor first.** $(2x + 4)(x + 3)$ expands correctly but is not completely factored.
4. **Dropping the common factor from the answer.** If you pull out a $2$, the $2$ belongs in the final answer.
5. **Subtracting where you should divide.** If one factor is $7$ and the constant is $-28$, the partner is $-28 \div 7 = -4$, not $-35$.

Every one of these is caught by expanding your answer back out. When you miss a problem below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Which expression is the factored form of $x^{2} + 7x + 12$?
   - A) $(x + 2)(x + 6)$
   - B) $(x + 3)(x + 4)$
   - C) $(x - 3)(x - 4)$
   - D) $(x + 1)(x + 12)$

2. Which expression is the factored form of $x^{2} + 8x + 15$?
   - A) $(x + 1)(x + 15)$
   - B) $(x - 3)(x - 5)$
   - C) $(x + 3)(x + 5)$
   - D) $(x + 5)(x - 3)$

3. Which expression is the factored form of $x^{2} + 9x + 20$?
   - A) $(x + 2)(x + 10)$
   - B) $(x + 1)(x + 20)$
   - C) $(x - 4)(x - 5)$
   - D) $(x + 4)(x + 5)$

4. Which quadratic expression is equal to $(x - 4)(x + 5)$?
   - A) $x^{2} + 9x - 20$
   - B) $x^{2} - x - 20$
   - C) $x^{2} + x + 20$
   - D) $x^{2} + x - 20$

**Proficient Level** (these require an extra step)

5. Which expression is the factored form of $x^{2} - x - 6$?
   - A) $(x + 3)(x - 2)$
   - B) $(x - 6)(x + 1)$
   - C) $(x - 3)(x + 2)$
   - D) $(x + 3)(x + 2)$

6. Which binomial is a factor of $x^{2} + 2x - 15$?
   - A) $(x + 3)$
   - B) $(x + 5)$
   - C) $(x - 5)$
   - D) $(x + 15)$

7. Which expression is the factored form of $x^{2} - 8x + 12$?
   - A) $(x - 2)(x - 6)$
   - B) $(x + 2)(x + 6)$
   - C) $(x - 3)(x - 4)$
   - D) $(x - 1)(x - 12)$

**Advanced Level** (these need multiple steps or reverse thinking)

8. Which expression is the complete factored form of $2x^{2} + 10x + 12$?
   - A) $2(x + 2)(x + 3)$
   - B) $(2x + 4)(x + 3)$
   - C) $(x + 2)(x + 3)$
   - D) $2(x + 1)(x + 6)$

9. One factor of $x^{2} + 3x - 28$ is $(x + 7)$. What is the other factor?
   - A) $(x + 4)$
   - B) $(x - 35)$
   - C) $(x - 4)$
   - D) $(x - 7)$

10. Which expression is the complete factored form of $3x^{2} - 12x + 9$?
    - A) $(3x - 3)(x - 3)$
    - B) $3(x - 1)(x - 3)$
    - C) $(x - 1)(x - 3)$
    - D) $3(x + 1)(x + 3)$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

Which expression is the factored form of $x^{2} + 6x + 8$?

- A) $(x + 1)(x + 8)$
- B) $(x - 2)(x - 4)$
- C) $(x + 2)(x + 4)$
- D) $(x + 2)(x - 4)$

**Item 2**

Which expression is the factored form of $x^{2} + 10x + 21$?

- A) $(x + 3)(x + 7)$
- B) $(x + 1)(x + 21)$
- C) $(x - 3)(x - 7)$
- D) $(x + 3)(x - 7)$

**Item 3**

Which binomial is a factor of $x^{2} - 2x - 8$?

- A) $(x + 4)$
- B) $(x - 8)$
- C) $(x - 2)$
- D) $(x - 4)$

**Item 4**

Which expression is the complete factored form of $2x^{2} + 14x + 20$?

- A) $(2x + 4)(x + 5)$
- B) $2(x + 2)(x + 5)$
- C) $(x + 2)(x + 5)$
- D) $2(x + 1)(x + 10)$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Which expression is the factored form of $x^{2} + 7x + 12$?**

Step 1: Both the constant and the middle term are positive, so both numbers are positive.

Step 2: Find a pair multiplying to $12$ and adding to $7$.
- $1$ and $12$: product $12$, sum $13$. No.
- $2$ and $6$: product $12$, sum $8$. No.
- $3$ and $4$: product $12$, sum $7$. Yes.

Step 3: Check by expanding. $(x + 3)(x + 4) = x^{2} + 4x + 3x + 12 = x^{2} + 7x + 12$. Match.

**Answer: B** ($(x + 3)(x + 4)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: factor_pair_sum_unchecked (picks 2 and 6 because they multiply to 12, without checking that they add to 8 rather than 7, and expanding gives a middle term of 8x)",
  "B": "Correct: 3 and 4 multiply to 12 and add to 7, and expanding returns the original expression",
  "C": "Student makes misconception: wrong_sign_on_factor (uses the correct magnitudes 3 and 4 but makes both negative, which expands to a middle term of -7x)",
  "D": "Student makes misconception: factor_pair_sum_unchecked (picks the most obvious product pair 1 and 12, whose sum is 13 rather than 7)"
},
"misconception_tag": {
  "A": "factor_pair_sum_unchecked",
  "C": "wrong_sign_on_factor",
  "D": "factor_pair_sum_unchecked"
}
```

---

**2. Which expression is the factored form of $x^{2} + 8x + 15$?**

Step 1: Both signs are positive, so both numbers are positive.

Step 2: Find a pair multiplying to $15$ and adding to $8$.
- $1$ and $15$: sum $16$. No.
- $3$ and $5$: sum $8$. Yes.

Step 3: Check. $(x + 3)(x + 5) = x^{2} + 5x + 3x + 15 = x^{2} + 8x + 15$. Match.

**Answer: C** ($(x + 3)(x + 5)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: factor_pair_sum_unchecked (uses 1 and 15, which multiply to 15 but add to 16 rather than 8)",
  "B": "Student makes misconception: wrong_sign_on_factor (uses the right magnitudes but makes both negative, giving a middle term of -8x)",
  "C": "Correct: 3 and 5 multiply to 15 and add to 8, confirmed by expanding",
  "D": "Student makes misconception: wrong_sign_on_factor (mixes the signs, so the product becomes -15 rather than +15 and the middle term comes out as 2x)"
},
"misconception_tag": {
  "A": "factor_pair_sum_unchecked",
  "B": "wrong_sign_on_factor",
  "D": "wrong_sign_on_factor"
}
```

---

**3. Which expression is the factored form of $x^{2} + 9x + 20$?**

Step 1: Both signs positive, so both numbers are positive.

Step 2: Find a pair multiplying to $20$ and adding to $9$.
- $1$ and $20$: sum $21$. No.
- $2$ and $10$: sum $12$. No.
- $4$ and $5$: sum $9$. Yes.

Step 3: Check. $(x + 4)(x + 5) = x^{2} + 5x + 4x + 20 = x^{2} + 9x + 20$. Match.

**Answer: D** ($(x + 4)(x + 5)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: factor_pair_sum_unchecked (uses 2 and 10, a correct product pair whose sum is 12 rather than 9)",
  "B": "Student makes misconception: factor_pair_sum_unchecked (uses 1 and 20, a correct product pair whose sum is 21 rather than 9)",
  "C": "Student makes misconception: wrong_sign_on_factor (uses the correct magnitudes 4 and 5 but makes both negative, giving a middle term of -9x)",
  "D": "Correct: 4 and 5 multiply to 20 and add to 9, confirmed by expanding"
},
"misconception_tag": {
  "A": "factor_pair_sum_unchecked",
  "B": "factor_pair_sum_unchecked",
  "C": "wrong_sign_on_factor"
}
```

---

**4. Which quadratic expression is equal to $(x - 4)(x + 5)$?**

Step 1: Multiply the first terms.
- $x \times x = x^{2}$

Step 2: Multiply the outer and inner terms.
- Outer: $x \times 5 = 5x$
- Inner: $-4 \times x = -4x$

Step 3: Multiply the last terms.
- $-4 \times 5 = -20$

Step 4: Combine the middle terms, carrying their signs.
- $5x - 4x = x$

Result: $x^{2} + x - 20$.

**Answer: D** ($x^{2} + x - 20$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (adds the magnitudes of the two middle terms as though both were positive, computing 5 plus 4 for a middle term of 9x)",
  "B": "Student makes misconception: sign_error_on_constant (combines the middle terms as -4 plus -5 rather than 5 minus 4, giving -x where the true middle term is +x)",
  "C": "Student makes misconception: drops_negative_sign (multiplies -4 by 5 and reports the constant as +20, discarding the minus sign on the product)",
  "D": "Correct: expands to x squared plus 5x minus 4x minus 20, then combines the middle terms to x for x squared plus x minus 20"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "B": "sign_error_on_constant",
  "C": "drops_negative_sign"
}
```

---

**Proficient Level**

**5. Which expression is the factored form of $x^{2} - x - 6$?**

Step 1: The constant $-6$ is negative, so the two numbers have different signs. The middle coefficient is $-1$, so the negative number is the larger in size.

Step 2: Find a pair multiplying to $-6$ and adding to $-1$.
- $-3$ and $2$: product $-6$, sum $-1$. Yes.

Step 3: Check. $(x - 3)(x + 2) = x^{2} + 2x - 3x - 6 = x^{2} - x - 6$. Match.

**Answer: C** ($(x - 3)(x + 2)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_sign_on_factor (uses the right magnitudes but puts the minus on the 2 instead of the 3, which expands to a middle term of +x rather than -x)",
  "B": "Student makes misconception: factor_pair_sum_unchecked (uses -6 and 1, which multiply to -6 but add to -5 rather than -1)",
  "C": "Correct: -3 and 2 multiply to -6 and add to -1, confirmed by expanding",
  "D": "Student makes misconception: drops_negative_sign (makes both numbers positive, so the constant comes out as +6 rather than -6)"
},
"misconception_tag": {
  "A": "wrong_sign_on_factor",
  "B": "factor_pair_sum_unchecked",
  "D": "drops_negative_sign"
}
```

---

**6. Which binomial is a factor of $x^{2} + 2x - 15$?**

Step 1: The constant is negative, so the signs differ. The middle term is positive, so the positive number is larger.

Step 2: Find a pair multiplying to $-15$ and adding to $2$.
- $-3$ and $5$: product $-15$, sum $2$. Yes.

Step 3: The full factorization is $(x - 3)(x + 5)$.

Step 4: Check which of these appears among the choices. $(x + 5)$ does.

**Answer: B** ($(x + 5)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_sign_on_factor (finds the magnitudes 3 and 5 but takes the 3 as positive, when the working pair is -3 with +5, so the genuine factor is (x - 3) rather than (x + 3))",
  "B": "Correct: the expression factors as (x - 3)(x + 5), so (x + 5) is a factor",
  "C": "Student makes misconception: wrong_sign_on_factor (assigns the minus to the 5 rather than the 3, which would give a middle term of -2x)",
  "D": "Student makes misconception: factor_pair_sum_unchecked (reaches for the constant itself as a factor, pairing 15 with -1 for a sum of 14 rather than 2)"
},
"misconception_tag": {
  "A": "wrong_sign_on_factor",
  "C": "wrong_sign_on_factor",
  "D": "factor_pair_sum_unchecked"
}
```

---

**7. Which expression is the factored form of $x^{2} - 8x + 12$?**

Step 1: The constant $+12$ is positive, so the numbers share a sign. The middle term $-8$ is negative, so both are negative.

Step 2: Find negatives multiplying to $12$ and adding to $-8$.
- $-1$ and $-12$: sum $-13$. No.
- $-2$ and $-6$: sum $-8$. Yes.
- $-3$ and $-4$: sum $-7$. No.

Step 3: Check. $(x - 2)(x - 6) = x^{2} - 6x - 2x + 12 = x^{2} - 8x + 12$. Match.

**Answer: A** ($(x - 2)(x - 6)$)

```json
"distractor_logic": {
  "A": "Correct: -2 and -6 multiply to 12 and add to -8, confirmed by expanding",
  "B": "Student makes misconception: wrong_sign_on_factor (uses the correct magnitudes 2 and 6 but makes both positive, giving a middle term of +8x)",
  "C": "Student makes misconception: factor_pair_sum_unchecked (uses -3 and -4, which multiply to 12 but add to -7 rather than -8)",
  "D": "Student makes misconception: factor_pair_sum_unchecked (uses -1 and -12, which multiply to 12 but add to -13 rather than -8)"
},
"misconception_tag": {
  "B": "wrong_sign_on_factor",
  "C": "factor_pair_sum_unchecked",
  "D": "factor_pair_sum_unchecked"
}
```

---

**Advanced Level**

**8. Which expression is the complete factored form of $2x^{2} + 10x + 12$?**

Step 1: Every coefficient is even, so extract the common factor $2$ first.
- $2(x^{2} + 5x + 6)$

Step 2: Factor the trinomial inside. Two numbers multiplying to $6$ and adding to $5$: $2$ and $3$.
- $2(x + 2)(x + 3)$

Step 3: Check by expanding back. $(x + 2)(x + 3) = x^{2} + 5x + 6$, and doubling gives $2x^{2} + 10x + 12$. Match.

**Answer: A** ($2(x + 2)(x + 3)$)

```json
"distractor_logic": {
  "A": "Correct: extracts the common factor 2, factors the remaining trinomial as (x + 2)(x + 3), and keeps the 2 in the answer",
  "B": "Student makes misconception: gcf_not_extracted_first (expands to the right expression, but the common factor was never pulled out, so (2x + 4) still holds a factor of 2 and the form is not complete)",
  "C": "Student makes misconception: gcf_dropped_after_factoring (factors the bracketed trinomial correctly but discards the extracted 2, leaving an expression equal to half the original)",
  "D": "Student makes misconception: factor_pair_sum_unchecked (extracts the 2 correctly but then picks 1 and 6 for the trinomial, a pair multiplying to 6 whose sum is 7 rather than 5)"
},
"misconception_tag": {
  "B": "gcf_not_extracted_first",
  "C": "gcf_dropped_after_factoring",
  "D": "factor_pair_sum_unchecked"
}
```

---

**9. One factor of $x^{2} + 3x - 28$ is $(x + 7)$. What is the other factor?**

Step 1: The two numbers multiply to the constant $-28$ and add to the middle coefficient $3$. One of them is $7$.

Step 2: Divide to find the partner.
- $-28 \div 7 = -4$

Step 3: Check the sum. $7 + (-4) = 3$, which matches the middle coefficient.

Step 4: The other factor is $(x - 4)$.

**Answer: C** ($(x - 4)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: drops_negative_sign (finds the magnitude 4 by dividing 28 by 7 but reports it as positive, which would make the constant +28 and the middle term 11x)",
  "B": "Student makes misconception: factor_pair_sum_unchecked (subtracts the known 7 from the constant instead of dividing, producing -35, and 7 times -35 is -245 rather than -28)",
  "C": "Correct: divides -28 by 7 to get -4, and 7 plus -4 gives the middle coefficient of 3",
  "D": "Student makes misconception: wrong_sign_on_factor (mirrors the known factor's number with the opposite sign, giving a product of -49 rather than -28)"
},
"misconception_tag": {
  "A": "drops_negative_sign",
  "B": "factor_pair_sum_unchecked",
  "D": "wrong_sign_on_factor"
}
```

---

**10. Which expression is the complete factored form of $3x^{2} - 12x + 9$?**

Step 1: Every coefficient is divisible by $3$, so extract it.
- $3(x^{2} - 4x + 3)$

Step 2: Factor the trinomial. The constant is positive and the middle term negative, so both numbers are negative. Multiplying to $3$ and adding to $-4$: $-1$ and $-3$.
- $3(x - 1)(x - 3)$

Step 3: Check. $(x - 1)(x - 3) = x^{2} - 4x + 3$, and tripling gives $3x^{2} - 12x + 9$. Match.

**Answer: B** ($3(x - 1)(x - 3)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: gcf_not_extracted_first (expands to the correct expression, but the 3 was distributed into the first bracket rather than extracted, so (3x - 3) still holds a common factor and the form is incomplete)",
  "B": "Correct: extracts the common factor 3, factors the remainder as (x - 1)(x - 3), and keeps the 3 in the answer",
  "C": "Student makes misconception: gcf_dropped_after_factoring (factors the bracketed trinomial correctly but leaves the extracted 3 out of the answer, giving an expression equal to a third of the original)",
  "D": "Student makes misconception: wrong_sign_on_factor (extracts the 3 correctly but makes both numbers positive, which expands to 3x squared plus 12x plus 9)"
},
"misconception_tag": {
  "A": "gcf_not_extracted_first",
  "C": "gcf_dropped_after_factoring",
  "D": "wrong_sign_on_factor"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Which expression is the factored form of $x^{2} + 6x + 8$?**

Step 1: Both signs positive, so both numbers are positive.

Step 2: Find a pair multiplying to $8$ and adding to $6$.
- $1$ and $8$: sum $9$. No.
- $2$ and $4$: sum $6$. Yes.

Step 3: Check. $(x + 2)(x + 4) = x^{2} + 4x + 2x + 8 = x^{2} + 6x + 8$. Match.

**Answer: C** ($(x + 2)(x + 4)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: factor_pair_sum_unchecked (uses 1 and 8, which multiply to 8 but add to 9 rather than 6)",
  "B": "Student makes misconception: wrong_sign_on_factor (uses the correct magnitudes but makes both negative, giving a middle term of -6x)",
  "C": "Correct: 2 and 4 multiply to 8 and add to 6, confirmed by expanding",
  "D": "Student makes misconception: wrong_sign_on_factor (mixes the signs, so the constant becomes -8 rather than +8)"
},
"misconception_tag": {
  "A": "factor_pair_sum_unchecked",
  "B": "wrong_sign_on_factor",
  "D": "wrong_sign_on_factor"
}
```

---

**Item 2: Which expression is the factored form of $x^{2} + 10x + 21$?**

Step 1: Both signs positive, so both numbers are positive.

Step 2: Find a pair multiplying to $21$ and adding to $10$.
- $1$ and $21$: sum $22$. No.
- $3$ and $7$: sum $10$. Yes.

Step 3: Check. $(x + 3)(x + 7) = x^{2} + 7x + 3x + 21 = x^{2} + 10x + 21$. Match.

**Answer: A** ($(x + 3)(x + 7)$)

```json
"distractor_logic": {
  "A": "Correct: 3 and 7 multiply to 21 and add to 10, confirmed by expanding",
  "B": "Student makes misconception: factor_pair_sum_unchecked (uses 1 and 21, which multiply to 21 but add to 22 rather than 10)",
  "C": "Student makes misconception: wrong_sign_on_factor (uses the correct magnitudes but makes both negative, giving a middle term of -10x)",
  "D": "Student makes misconception: wrong_sign_on_factor (mixes the signs, so the constant becomes -21 and the middle term -4x)"
},
"misconception_tag": {
  "B": "factor_pair_sum_unchecked",
  "C": "wrong_sign_on_factor",
  "D": "wrong_sign_on_factor"
}
```

---

**Item 3: Which binomial is a factor of $x^{2} - 2x - 8$?**

Step 1: The constant is negative, so the signs differ. The middle term is negative, so the negative number is larger.

Step 2: Find a pair multiplying to $-8$ and adding to $-2$.
- $-4$ and $2$: product $-8$, sum $-2$. Yes.

Step 3: The factorization is $(x - 4)(x + 2)$, so $(x - 4)$ is a factor.

**Answer: D** ($(x - 4)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_sign_on_factor (puts the minus on the 2 instead of the 4, a pairing that would give a middle term of +2x)",
  "B": "Student makes misconception: factor_pair_sum_unchecked (reaches for the constant itself, pairing -8 with 1 for a sum of -7 rather than -2)",
  "C": "Student makes misconception: wrong_sign_on_factor (takes the 2 as the negative member of the pair, which reverses the sign of the middle term)",
  "D": "Correct: the expression factors as (x - 4)(x + 2), so (x - 4) is a factor"
},
"misconception_tag": {
  "A": "wrong_sign_on_factor",
  "B": "factor_pair_sum_unchecked",
  "C": "wrong_sign_on_factor"
}
```

---

**Item 4: Which expression is the complete factored form of $2x^{2} + 14x + 20$?**

Step 1: Every coefficient is even, so extract the $2$.
- $2(x^{2} + 7x + 10)$

Step 2: Factor the trinomial. Two numbers multiplying to $10$ and adding to $7$: $2$ and $5$.
- $2(x + 2)(x + 5)$

Step 3: Check. $(x + 2)(x + 5) = x^{2} + 7x + 10$, and doubling gives $2x^{2} + 14x + 20$. Match.

**Answer: B** ($2(x + 2)(x + 5)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: gcf_not_extracted_first (expands to the correct expression, but (2x + 4) still carries a factor of 2, so the form is not complete)",
  "B": "Correct: extracts the common factor 2, factors the remainder as (x + 2)(x + 5), and keeps the 2 in the answer",
  "C": "Student makes misconception: gcf_dropped_after_factoring (factors the bracket correctly but omits the extracted 2, leaving half the original expression)",
  "D": "Student makes misconception: factor_pair_sum_unchecked (extracts the 2 but then uses 1 and 10, a pair multiplying to 10 whose sum is 11 rather than 7)"
},
"misconception_tag": {
  "A": "gcf_not_extracted_first",
  "C": "gcf_dropped_after_factoring",
  "D": "factor_pair_sum_unchecked"
}
```
