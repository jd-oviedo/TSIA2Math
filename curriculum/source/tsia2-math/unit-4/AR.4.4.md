---
topic_name: "Exponent rules for algebraic monomials"
unit_number: 4
sequence_in_unit: 12
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "AR"
keywords: ["exponent rules", "product rule", "quotient rule", "power of a power", "negative exponent", "monomial"]
---

# AR.4.4 - Exponent Rules for Algebraic Monomials

**Topic ID:** AR.4.4  
**Unit:** 4  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Apply the product, quotient, and power-of-a-power rules correctly, adding or subtracting exponents rather than multiplying them.
- Raise every factor inside a parenthesized monomial, including the coefficient, to the outer exponent.
- Rewrite an expression with a negative exponent as its reciprocal with a positive exponent, without changing its sign.

---

#### **Part 1: Guided Notes**

##### Four Rules, One Reason

There are four exponent rules and a single idea underneath all of them: **an exponent is a count of how many times the base is written down.**

Every rule below is just that count being done correctly. If you ever forget which rule applies, write the factors out and count them. It is slower, and it is never wrong.

##### Multiplying: Add the Exponents

$$x^{5} \cdot x^{3} = x^{8}$$

Five $x$'s pushed together with three $x$'s makes eight $x$'s:

$$(x \cdot x \cdot x \cdot x \cdot x)(x \cdot x \cdot x) = x^{8}$$

**Add, do not multiply.** $5 \times 3 = 15$ is not a count of anything here.

##### Dividing: Subtract the Exponents

$$\frac{x^{9}}{x^{4}} = x^{5}$$

Nine $x$'s on top, four on the bottom. Four of them cancel against four, and five are left:

$$\frac{x \cdot x \cdot x \cdot x \cdot x \cdot x \cdot x \cdot x \cdot x}{x \cdot x \cdot x \cdot x} = x^{5}$$

**Top minus bottom, in that order.** $\frac{x^{9}}{x^{4}}$ is $x^{9-4}$, not $x^{4-9}$. Reversing it gives $x^{-5}$, which is the reciprocal of the right answer, so it is not a small error.

##### A Power of a Power: Multiply the Exponents

$$(x^{4})^{3} = x^{12}$$

Here multiplying is right, and the reason is that you have three copies of $x^{4}$:

$$(x^{4})^{3} = x^{4} \cdot x^{4} \cdot x^{4} = x^{4+4+4} = x^{12}$$

So the multiplication is really repeated addition of the same exponent. That is why $(x^{4})^{3}$ multiplies while $x^{4} \cdot x^{3}$ adds: in one case the exponent repeats, in the other two different exponents combine.

**This is the pair students mix up most.** The test is what the outer number is doing. An outer exponent repeats the whole thing; a second factor brings its own count.

##### The Mistake That Costs the Most Points

**Leaving the coefficient alone when the whole monomial is raised to a power.**

$$(3x^{2})^{3}$$

The bracket contains a $3$ and an $x^{2}$, and the outer exponent applies to **everything inside**, coefficient included.

$$(3x^{2})^{3} = (3x^{2})(3x^{2})(3x^{2}) = 3 \cdot 3 \cdot 3 \cdot x^{2} \cdot x^{2} \cdot x^{2} = 27x^{6}$$

The answer is $27x^{6}$, not $3x^{6}$.

**Why it is so easy to miss:** the exponent rule you just learned is about exponents, so attention goes to the $x$ and the $3$ sits there looking like it is not part of the problem. It is.

**The fix:** before applying any rule, say what is inside the bracket out loud. "Three, and x squared." Two things inside means two things get raised.

And a size check catches it instantly. $(3x^{2})^{3}$ at $x = 1$ is $3^{3} = 27$. An answer of $3x^{6}$ gives $3$. Twenty-seven is not three.

**Multiplying the coefficient by the outer power is the other half of this error.** $(3x^{2})^{3}$ is not $9x^{6}$ either. The coefficient is raised, not multiplied: $3^{3} = 27$, not $3 \times 3 = 9$.

##### Everything Inside, Every Time

$$(2x^{3}y)^{4} = 2^{4} \cdot x^{12} \cdot y^{4} = 16x^{12}y^{4}$$

Three things inside the bracket, three things raised:

- $2^{4} = 16$
- $(x^{3})^{4} = x^{12}$, multiplying $3 \times 4$
- $y^{4}$, since $y$ has an unwritten exponent of $1$ and $1 \times 4 = 4$

An invisible exponent of $1$ is still an exponent. It follows the same rule as every other.

##### Negative Exponents Mean Reciprocal, Not Negative

$$x^{-3} = \frac{1}{x^{3}}$$

A negative exponent does **not** make the value negative. It moves the base to the other side of the fraction bar.

Why: keep subtracting exponents past zero and see where the pattern goes.

$$\frac{x^{2}}{x^{5}} = x^{2-5} = x^{-3}$$

Counted directly, two $x$'s on top cancel two of the five below, leaving three underneath:

$$\frac{x \cdot x}{x \cdot x \cdot x \cdot x \cdot x} = \frac{1}{x^{3}}$$

Both routes agree, so $x^{-3}$ and $\frac{1}{x^{3}}$ are the same thing.

**The sign of the exponent says which side of the bar the base belongs on. It says nothing about whether the expression is positive or negative.** Reading $x^{-3}$ as $-x^{3}$ is a different expression entirely.

Note also what the negative exponent does **not** touch. In $10x^{-3}$, only the $x$ moves:

$$10x^{-3} = \frac{10}{x^{3}}$$

The $10$ has no negative exponent, so it stays on top.

##### Putting Them Together

$$\frac{(4x^{5})^{2}}{2x^{3}}$$

Step 1: Handle the bracket first. Everything inside is raised. $(4x^{5})^{2} = 16x^{10}$.

Step 2: Now divide. Coefficients divide, exponents subtract.

$$\frac{16x^{10}}{2x^{3}} = 8x^{7}$$

Coefficients follow ordinary arithmetic, $16 \div 2 = 8$. Exponents follow the rule, $10 - 3 = 7$. The two never mix.

##### The Five Traps

1. **Leaving the coefficient unraised.** $(3x^{2})^{3} = 27x^{6}$. Everything inside the bracket takes the outer power.
2. **Multiplying the coefficient instead of raising it.** $3^{3} = 27$, not $3 \times 3 = 9$.
3. **Adding where you should multiply, or multiplying where you should add.** $x^{4} \cdot x^{3} = x^{7}$, but $(x^{4})^{3} = x^{12}$.
4. **Subtracting in the wrong order.** $\frac{x^{9}}{x^{4}} = x^{5}$, never $x^{-5}$. Top minus bottom.
5. **Reading a negative exponent as a negative value.** $x^{-3}$ is $\frac{1}{x^{3}}$, not $-x^{3}$.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Simplify $x^{5} \cdot x^{3}$.
   - A) $x^{15}$
   - B) $x^{8}$
   - C) $x^{2}$
   - D) $x^{5}$

2. Simplify $\dfrac{x^{9}}{x^{4}}$.
   - A) $x^{36}$
   - B) $x^{13}$
   - C) $x^{5}$
   - D) $x^{-5}$

3. Simplify $(x^{4})^{3}$.
   - A) $x^{12}$
   - B) $x^{7}$
   - C) $x^{64}$
   - D) $x^{1}$

4. Simplify $(3x^{2})^{3}$.
   - A) $3x^{6}$
   - B) $9x^{6}$
   - C) $27x^{5}$
   - D) $27x^{6}$

**Proficient Level**

5. Simplify $(2x^{3}y)^{4}$.
   - A) $8x^{12}y^{4}$
   - B) $16x^{12}y^{4}$
   - C) $16x^{7}y^{4}$
   - D) $16x^{81}y^{4}$

6. Which expression is equivalent to $x^{-3}$?
   - A) $-x^{3}$
   - B) $x^{3}$
   - C) $\dfrac{1}{x^{3}}$
   - D) $-\dfrac{1}{x^{3}}$

7. Simplify $(5x^{4})(2x^{-7})$ and write the result without a negative exponent.
   - A) $\dfrac{10}{x^{3}}$
   - B) $10x^{3}$
   - C) $-10x^{3}$
   - D) $\dfrac{10}{x^{28}}$

**Advanced Level**

8. Simplify $\dfrac{(4x^{5})^{2}}{2x^{3}}$.
   - A) $\dfrac{4x^{7}}{1}$
   - B) $8x^{13}$
   - C) $2x^{7}$
   - D) $8x^{7}$

9. Simplify $(x^{3}y^{-2})^{-2}$ and write the result without negative exponents.
   - A) $\dfrac{x^{6}}{y^{4}}$
   - B) $\dfrac{y^{4}}{x^{6}}$
   - C) $\dfrac{y^{4}}{x^{1}}$
   - D) $-x^{6}y^{4}$

10. Simplify $\dfrac{12x^{3}y^{5}}{4x^{5}y^{2}}$ and write the result without negative exponents.
    - A) $3x^{2}y^{3}$
    - B) $\dfrac{3y^{3}}{x^{8}}$
    - C) $\dfrac{3y^{3}}{x^{2}}$
    - D) $\dfrac{y^{3}}{x^{2}}$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Simplify $x^{6} \cdot x^{7}$.

- A) $x^{42}$
- B) $x^{13}$
- C) $x^{1}$
- D) $x^{7}$

**Item 2**

Simplify $(x^{5})^{4}$.

- A) $x^{20}$
- B) $x^{9}$
- C) $x^{625}$
- D) $x^{1}$

**Item 3**

Simplify $(2x^{3})^{5}$.

- A) $2x^{15}$
- B) $10x^{15}$
- C) $32x^{15}$
- D) $32x^{8}$

**Proficient Level**

**Item 4**

Simplify $\dfrac{10x^{2}}{5x^{6}}$ and write the result without a negative exponent.

- A) $2x^{4}$
- B) $\dfrac{2}{x^{12}}$
- C) $-2x^{4}$
- D) $\dfrac{2}{x^{4}}$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Simplify $x^{5} \cdot x^{3}$.**

Step 1: Multiplying powers of the same base, so the exponents add.

Step 2: $5 + 3 = 8$.

$$x^{8}$$

**Answer: B** ($x^{8}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: multiplies_exponents_wrongly (multiplies the exponents, giving 5 times 3 = 15, which is the rule for a power of a power rather than a product)",
  "B": "Correct: five x's pushed together with three x's makes eight x's, so the exponents add",
  "C": "Student makes misconception: subtracts_exponents_wrongly (subtracts the exponents, giving 5 minus 3 = 2, which is the rule for division rather than multiplication)",
  "D": "Student makes misconception: multiplies_exponents_wrongly (keeps the first exponent and discards the second factor entirely, treating x cubed as though it contributed nothing)"
},
"misconception_tag": {
  "A": "multiplies_exponents_wrongly",
  "C": "subtracts_exponents_wrongly",
  "D": "multiplies_exponents_wrongly"
}
```

---

**2. Simplify $\dfrac{x^{9}}{x^{4}}$.**

Step 1: Dividing powers of the same base, so the exponents subtract.

Step 2: Top minus bottom. $9 - 4 = 5$.

$$x^{5}$$

**Answer: C** ($x^{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: multiplies_exponents_wrongly (multiplies the exponents, giving 9 times 4 = 36, where division requires subtracting them)",
  "B": "Student makes misconception: adds_exponents_wrongly (adds the exponents, giving 9 plus 4 = 13, which is the rule for multiplication rather than division)",
  "C": "Correct: four x's on the bottom cancel four on the top, leaving 9 minus 4 = 5",
  "D": "Student makes misconception: subtracts_in_wrong_order (computes bottom minus top, giving 4 minus 9 = -5, which is the reciprocal of the right answer rather than the answer)"
},
"misconception_tag": {
  "A": "multiplies_exponents_wrongly",
  "B": "adds_exponents_wrongly",
  "D": "subtracts_in_wrong_order"
}
```

---

**3. Simplify $(x^{4})^{3}$.**

Step 1: A power of a power, so the exponents multiply.

Step 2: $4 \times 3 = 12$.

Step 3: Check by writing it out. $(x^{4})^{3} = x^{4} \cdot x^{4} \cdot x^{4} = x^{12}$.

$$x^{12}$$

**Answer: A** ($x^{12}$)

```json
"distractor_logic": {
  "A": "Correct: three copies of x to the 4 gives 4 plus 4 plus 4, which is 4 times 3 = 12",
  "B": "Student makes misconception: adds_exponents_wrongly (adds the exponents, giving 4 plus 3 = 7, which is the rule for a product rather than a power of a power)",
  "C": "Student makes misconception: inner_exponent_raised_not_multiplied (raises the inner exponent to the outer power, computing 4 cubed = 64, rather than multiplying 4 by 3)",
  "D": "Student makes misconception: subtracts_exponents_wrongly (subtracts the exponents, giving 4 minus 3 = 1, which is the rule for division)"
},
"misconception_tag": {
  "B": "adds_exponents_wrongly",
  "C": "inner_exponent_raised_not_multiplied",
  "D": "subtracts_exponents_wrongly"
}
```

---

**4. Simplify $(3x^{2})^{3}$.**

Step 1: Everything inside the bracket is raised to the outer power. There are two things inside, the $3$ and the $x^{2}$.

Step 2: Raise the coefficient. $3^{3} = 27$.

Step 3: Raise the variable part. $(x^{2})^{3} = x^{6}$.

$$27x^{6}$$

Step 4: Check at $x = 1$. The original is $3^{3} = 27$, and the answer gives $27$. Agreement.

**Answer: D** ($27x^{6}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: coefficient_not_raised_to_power (handles the variable correctly but leaves the coefficient 3 untouched; at x = 1 this gives 3 where the original gives 27)",
  "B": "Student makes misconception: coefficient_not_raised_to_power (multiplies the coefficient by the outer power rather than raising it, giving 3 times 3 = 9 where 3 cubed = 27 was required)",
  "C": "Student makes misconception: adds_exponents_wrongly (raises the coefficient correctly but adds the exponents on the variable, giving 2 plus 3 = 5 rather than 2 times 3 = 6)",
  "D": "Correct: the coefficient gives 3 cubed = 27 and the variable gives x to the 2 times 3 = 6"
},
"misconception_tag": {
  "A": "coefficient_not_raised_to_power",
  "B": "coefficient_not_raised_to_power",
  "C": "adds_exponents_wrongly"
}
```

---

**Proficient Level**

**5. Simplify $(2x^{3}y)^{4}$.**

Step 1: Three things inside the bracket, so three things get raised.

Step 2: $2^{4} = 16$.

Step 3: $(x^{3})^{4} = x^{12}$.

Step 4: $y$ has an unwritten exponent of $1$, so $y^{1 \times 4} = y^{4}$.

$$16x^{12}y^{4}$$

**Answer: B** ($16x^{12}y^{4}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: coefficient_not_raised_to_power (raises the coefficient to the wrong power, computing 2 cubed = 8 rather than 2 to the fourth = 16, while handling both variables correctly)",
  "B": "Correct: 2 to the fourth is 16, x to the 3 times 4 is x to the 12, and y to the 1 times 4 is y to the 4",
  "C": "Student makes misconception: adds_exponents_wrongly (adds the exponents on x, giving 3 plus 4 = 7 rather than 3 times 4 = 12)",
  "D": "Student makes misconception: inner_exponent_raised_not_multiplied (raises the inner exponent to the outer power on x, computing 3 to the fourth = 81 rather than 3 times 4 = 12)"
},
"misconception_tag": {
  "A": "coefficient_not_raised_to_power",
  "C": "adds_exponents_wrongly",
  "D": "inner_exponent_raised_not_multiplied"
}
```

---

**6. Which expression is equivalent to $x^{-3}$?**

Step 1: A negative exponent moves the base across the fraction bar.

Step 2: $x^{-3}$ becomes $\frac{1}{x^{3}}$.

Step 3: Check by division. $\frac{x^{2}}{x^{5}} = x^{-3}$ by the rule, and cancelling directly leaves $\frac{1}{x^{3}}$. Both routes agree.

$$\frac{1}{x^{3}}$$

**Answer: C** ($\frac{1}{x^{3}}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: negative_exponent_as_negative_value (reads the minus sign as making the whole expression negative, when it only says which side of the fraction bar the base belongs on)",
  "B": "Student makes misconception: negative_exponent_as_negative_value (drops the negative sign entirely, treating x to the -3 as x cubed and losing the reciprocal)",
  "C": "Correct: a negative exponent moves the base to the denominator, giving 1 over x cubed",
  "D": "Student makes misconception: negative_exponent_as_negative_value (takes the reciprocal correctly but also makes the value negative, applying the minus sign twice)"
},
"misconception_tag": {
  "A": "negative_exponent_as_negative_value",
  "B": "negative_exponent_as_negative_value",
  "D": "negative_exponent_as_negative_value"
}
```

---

**7. Simplify $(5x^{4})(2x^{-7})$ and write the result without a negative exponent.**

Step 1: Multiply the coefficients. $5 \times 2 = 10$.

Step 2: Multiplying powers of the same base, so the exponents add. $4 + (-7) = -3$.

Step 3: The result is $10x^{-3}$. Only the $x$ carries the negative exponent, so only the $x$ moves down.

$$\frac{10}{x^{3}}$$

**Answer: A** ($\frac{10}{x^{3}}$)

```json
"distractor_logic": {
  "A": "Correct: the coefficients give 10, the exponents add to -3, and only the x moves to the denominator",
  "B": "Student makes misconception: negative_exponent_as_negative_value (adds the exponents to -3 but then drops the sign, writing 10x cubed rather than moving the x to the denominator)",
  "C": "Student makes misconception: negative_exponent_as_negative_value (reads the negative exponent as making the whole expression negative, giving -10x cubed)",
  "D": "Student makes misconception: multiplies_exponents_wrongly (multiplies the exponents rather than adding them, giving 4 times -7 = -28, so the denominator becomes x to the 28)"
},
"misconception_tag": {
  "B": "negative_exponent_as_negative_value",
  "C": "negative_exponent_as_negative_value",
  "D": "multiplies_exponents_wrongly"
}
```

---

**Advanced Level**

**8. Simplify $\dfrac{(4x^{5})^{2}}{2x^{3}}$.**

Step 1: Handle the bracket first. Everything inside is raised, so $(4x^{5})^{2} = 16x^{10}$.

Step 2: Divide the coefficients. $16 \div 2 = 8$.

Step 3: Subtract the exponents, top minus bottom. $10 - 3 = 7$.

$$8x^{7}$$

**Answer: D** ($8x^{7}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: coefficient_not_raised_to_power (leaves the coefficient unraised inside the bracket, so 4 squared never happens and the division gives 8 over 2 = 4 rather than 16 over 2 = 8)",
  "B": "Student makes misconception: adds_exponents_wrongly (raises the bracket correctly but adds the exponents when dividing, giving 10 plus 3 = 13 rather than 10 minus 3 = 7)",
  "C": "Student makes misconception: coefficient_not_raised_to_power (multiplies the coefficient by the outer power rather than raising it, giving 4 times 2 = 8 inside the bracket, so the division gives 8 over 2 = 2 with the exponent handled correctly)",
  "D": "Correct: the bracket gives 16x to the 10, and dividing gives 16 over 2 = 8 with 10 minus 3 = 7"
},
"misconception_tag": {
  "A": "coefficient_not_raised_to_power",
  "B": "adds_exponents_wrongly",
  "C": "coefficient_not_raised_to_power"
}
```

---

**9. Simplify $(x^{3}y^{-2})^{-2}$ and write the result without negative exponents.**

Step 1: A power of a power, so each inner exponent is multiplied by the outer one.

Step 2: $x$: $3 \times (-2) = -6$, giving $x^{-6}$.

Step 3: $y$: $(-2) \times (-2) = 4$, giving $y^{4}$.

Step 4: The $x$ carries a negative exponent, so it moves to the denominator. The $y$ does not, so it stays on top.

$$\frac{y^{4}}{x^{6}}$$

**Answer: B** ($\frac{y^{4}}{x^{6}}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: negative_exponent_as_negative_value (gets both exponents right but moves the wrong base, putting the x on top and the y underneath when it is the x that carries the negative exponent)",
  "B": "Correct: multiplying gives x to the -6 and y to the 4, so the x moves to the denominator and the y stays on top",
  "C": "Student makes misconception: adds_exponents_wrongly (adds rather than multiplies on the x, giving 3 plus -2 = 1, so the denominator comes out as x to the first power)",
  "D": "Student makes misconception: negative_exponent_as_negative_value (reads the negative exponent as making the expression negative rather than as a reciprocal, so nothing moves across the bar)"
},
"misconception_tag": {
  "A": "negative_exponent_as_negative_value",
  "C": "adds_exponents_wrongly",
  "D": "negative_exponent_as_negative_value"
}
```

---

**10. Simplify $\dfrac{12x^{3}y^{5}}{4x^{5}y^{2}}$ and write the result without negative exponents.**

Step 1: Divide the coefficients. $12 \div 4 = 3$.

Step 2: Subtract the $x$ exponents, top minus bottom. $3 - 5 = -2$.

Step 3: Subtract the $y$ exponents. $5 - 2 = 3$.

Step 4: The $x$ has a negative exponent, so it moves to the denominator.

$$\frac{3y^{3}}{x^{2}}$$

**Answer: C** ($\frac{3y^{3}}{x^{2}}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: subtracts_in_wrong_order (computes bottom minus top on the x, giving 5 minus 3 = 2 as a positive exponent, so the x stays on top instead of moving down)",
  "B": "Student makes misconception: multiplies_exponents_wrongly (multiplies rather than subtracts on the x, giving 3 times 5 = 15 and then a denominator of x to the 8 after further mishandling, where 3 minus 5 = -2 was required)",
  "C": "Correct: the coefficients give 3, the x exponents give -2 so the x moves down, and the y exponents give 3",
  "D": "Student makes misconception: subtracts_exponents_wrongly (subtracts the coefficients as though they were exponents, giving 12 minus 4 written as a coefficient of 1, while handling the variables correctly)"
},
"misconception_tag": {
  "A": "subtracts_in_wrong_order",
  "B": "multiplies_exponents_wrongly",
  "D": "subtracts_exponents_wrongly"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Simplify $x^{6} \cdot x^{7}$.**

Step 1: Multiplying powers of the same base, so the exponents add.

Step 2: $6 + 7 = 13$.

$$x^{13}$$

**Answer: B** ($x^{13}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: multiplies_exponents_wrongly (multiplies the exponents, giving 6 times 7 = 42, which is the rule for a power of a power)",
  "B": "Correct: six x's together with seven x's makes thirteen x's",
  "C": "Student makes misconception: subtracts_exponents_wrongly (subtracts the exponents, giving 7 minus 6 = 1, which is the rule for division)",
  "D": "Student makes misconception: multiplies_exponents_wrongly (keeps the larger exponent and discards the other factor entirely)"
},
"misconception_tag": {
  "A": "multiplies_exponents_wrongly",
  "C": "subtracts_exponents_wrongly",
  "D": "multiplies_exponents_wrongly"
}
```

---

**Item 2: Simplify $(x^{5})^{4}$.**

Step 1: A power of a power, so the exponents multiply.

Step 2: $5 \times 4 = 20$.

$$x^{20}$$

**Answer: A** ($x^{20}$)

```json
"distractor_logic": {
  "A": "Correct: four copies of x to the 5 gives 5 times 4 = 20",
  "B": "Student makes misconception: adds_exponents_wrongly (adds the exponents, giving 5 plus 4 = 9, which is the rule for a product)",
  "C": "Student makes misconception: inner_exponent_raised_not_multiplied (raises the inner exponent to the outer power, computing 5 to the fourth = 625 rather than 5 times 4 = 20)",
  "D": "Student makes misconception: subtracts_exponents_wrongly (subtracts the exponents, giving 5 minus 4 = 1)"
},
"misconception_tag": {
  "B": "adds_exponents_wrongly",
  "C": "inner_exponent_raised_not_multiplied",
  "D": "subtracts_exponents_wrongly"
}
```

---

**Item 3: Simplify $(2x^{3})^{5}$.**

Step 1: Both things inside the bracket are raised.

Step 2: $2^{5} = 32$.

Step 3: $(x^{3})^{5} = x^{15}$.

$$32x^{15}$$

**Answer: C** ($32x^{15}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: coefficient_not_raised_to_power (raises the variable correctly but leaves the coefficient 2 untouched; at x = 1 this gives 2 where the original gives 32)",
  "B": "Student makes misconception: coefficient_not_raised_to_power (multiplies the coefficient by the outer power rather than raising it, giving 2 times 5 = 10 where 2 to the fifth = 32 was required)",
  "C": "Correct: 2 to the fifth is 32 and x to the 3 times 5 is x to the 15",
  "D": "Student makes misconception: adds_exponents_wrongly (raises the coefficient correctly but adds the exponents on the variable, giving 3 plus 5 = 8 rather than 3 times 5 = 15)"
},
"misconception_tag": {
  "A": "coefficient_not_raised_to_power",
  "B": "coefficient_not_raised_to_power",
  "D": "adds_exponents_wrongly"
}
```

---

**Item 4: Simplify $\dfrac{10x^{2}}{5x^{6}}$ and write the result without a negative exponent.**

Step 1: Divide the coefficients. $10 \div 5 = 2$.

Step 2: Subtract the exponents, top minus bottom. $2 - 6 = -4$.

Step 3: The negative exponent moves the $x$ to the denominator. The $2$ stays on top.

$$\frac{2}{x^{4}}$$

**Answer: D** ($\frac{2}{x^{4}}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: subtracts_in_wrong_order (computes bottom minus top, giving 6 minus 2 = 4 as a positive exponent, so the x stays on top instead of moving down)",
  "B": "Student makes misconception: multiplies_exponents_wrongly (multiplies the exponents rather than subtracting, giving 2 times 6 = 12 in the denominator where 4 was required)",
  "C": "Student makes misconception: negative_exponent_as_negative_value (reads the negative exponent as making the value negative rather than as a reciprocal, so the x stays on top and a minus sign appears)",
  "D": "Correct: the coefficients give 2, the exponents give 2 minus 6 = -4, and only the x moves to the denominator"
},
"misconception_tag": {
  "A": "subtracts_in_wrong_order",
  "B": "multiplies_exponents_wrongly",
  "C": "negative_exponent_as_negative_value"
}
```
