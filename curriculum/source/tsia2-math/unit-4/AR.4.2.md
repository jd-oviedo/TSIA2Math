---
topic_name: "Multiplying polynomials including FOIL"
unit_number: 4
sequence_in_unit: 10
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "AR"
keywords: ["polynomial multiplication", "FOIL", "distributive property", "binomial", "monomial", "product rule for exponents"]
---

# AR.4.2 - Multiplying Polynomials Including FOIL

**Topic ID:** AR.4.2  
**Unit:** 4  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Every Piece Times Every Piece

There is one rule under all of this, and it is the distributive property.

When you multiply two expressions, **every term in the first has to meet every term in the second.** Not most of them. All of them.

That is the whole topic. FOIL is not a separate rule; it is a name for what happens when both expressions have exactly two terms, and counting the pieces is what keeps you honest:

- Two terms times two terms is $2 \times 2 = 4$ products.
- Two terms times three terms is $2 \times 3 = 6$ products.
- One term times three terms is $3$ products.

If you wrote fewer products than that, you dropped something.

##### Monomials First: Multiply the Numbers, Add the Exponents

Before polynomials, get single terms right.

$$(2x^{3}y^{2})(6x^{4}y^{5}) = 12x^{7}y^{7}$$

Step 1: Multiply the coefficients. $2 \times 6 = 12$.

Step 2: For each base, **add** the exponents. $x^{3} \cdot x^{4} = x^{7}$, and $y^{2} \cdot y^{5} = y^{7}$.

Why adding is right: $x^{3}$ is three $x$'s and $x^{4}$ is four $x$'s. Push them together and you have seven $x$'s.

$$x^{3} \cdot x^{4} = (x \cdot x \cdot x)(x \cdot x \cdot x \cdot x) = x^{7}$$

**Multiplying the exponents is the most common wrong move here.** $3 \times 4 = 12$ has nothing to do with counting $x$'s. Write the factors out once, count them, and the rule stops being something you have to remember.

##### One Term Times Many

$$3x^{2}(4x^{3} + 5x)$$

The single term outside meets each term inside, one at a time.

Step 1: $3x^{2} \cdot 4x^{3} = 12x^{5}$.

Step 2: $3x^{2} \cdot 5x = 15x^{3}$.

$$3x^{2}(4x^{3} + 5x) = 12x^{5} + 15x^{3}$$

Two terms inside means two products. Count them.

##### Two Binomials: Four Products

$$(x + 3)(x + 5)$$

Four products, because two terms times two terms.

- **First:** $x \cdot x = x^{2}$
- **Outer:** $x \cdot 5 = 5x$
- **Inner:** $3 \cdot x = 3x$
- **Last:** $3 \cdot 5 = 15$

$$x^{2} + 5x + 3x + 15 = x^{2} + 8x + 15$$

The two middle products combine because they are like terms. That combining is where the middle coefficient comes from, and it is why the answer is $8x$ rather than $5x$ or $3x$.

##### The Mistake That Costs the Most Points

**Multiplying only the first terms and the last terms.**

$$(x + 3)(x + 5) \quad\text{written as}\quad x^{2} + 15$$

It looks tidy. It is missing half the work. The outer and inner products, $5x$ and $3x$, were never written down, so the entire middle term is gone.

**Here is the check that catches it.** Substitute a number into both, and they have to agree.

Try $x = 1$ in the original: $(1 + 3)(1 + 5) = 4 \times 6 = 24$.

Try $x = 1$ in $x^{2} + 15$: $1 + 15 = 16$.

Those disagree, so the answer is wrong. Sixteen is not twenty-four, and no amount of confidence changes that.

**The habit that prevents it:** count the products before you write any of them. Two times two is four. If you have written three, you are not finished.

##### Squaring a Binomial Is Still Four Products

$$(x + 4)^{2}$$

A squared binomial is the binomial times itself. There is no shortcut where you square each piece.

$$(x + 4)^{2} = (x + 4)(x + 4) = x^{2} + 4x + 4x + 16 = x^{2} + 8x + 16$$

**It is not $x^{2} + 16$.** That answer squares each term separately and throws away both cross products.

The two cross products are identical, $4x$ and $4x$, which is exactly why the middle term is **twice** the product of the pieces. Writing only one of them gives $x^{2} + 4x + 16$, which is a different and equally wrong answer.

Check with $x = 1$: the original gives $(1 + 4)^{2} = 25$. The correct expansion gives $1 + 8 + 16 = 25$. Agreement.

##### When the Middle Term Disappears

$$(x + 6)(x - 6) = x^{2} - 6x + 6x - 36 = x^{2} - 36$$

Here the two middle products cancel, because one is positive and one is negative and they have the same size. This is the one case where a two-term answer is correct.

**It is correct because the middles cancelled, not because they were skipped.** The difference matters: you still write all four products, and then two of them vanish. Same signs in both brackets and nothing cancels.

##### Bigger Polynomials, Same Rule

$$(x + 2)(x^{2} - 3x + 4)$$

Two terms times three terms is six products.

Step 1: $x$ meets each term. $x^{3} - 3x^{2} + 4x$.

Step 2: $2$ meets each term. $2x^{2} - 6x + 8$.

Step 3: Add and combine like terms.

$$x^{3} - 3x^{2} + 4x + 2x^{2} - 6x + 8 = x^{3} - x^{2} - 2x + 8$$

Six products written, then combined. The rule never changed; only the counting did.

##### The Five Traps

1. **Omitting the outer and inner products.** Two binomials give four products, not two. $(x + 3)(x + 5)$ is not $x^{2} + 15$.
2. **Counting a cross product once when it happens twice.** $(x + 4)^{2}$ has two copies of $4x$, so the middle term is $8x$, not $4x$.
3. **Multiplying exponents instead of adding them.** $x^{3} \cdot x^{4} = x^{7}$. Write out the factors and count if you doubt it.
4. **Keeping the larger exponent.** $x^{3} \cdot x^{4}$ is not $x^{4}$. Nothing in multiplication discards a factor.
5. **Squaring a binomial term by term.** $(x + 4)^{2}$ is not $x^{2} + 16$. It is the binomial times itself, all four products.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. What is $(2x^{3}y^{2})(6x^{4}y^{5})$?
   - A) $12x^{12}y^{10}$
   - B) $12x^{7}y^{7}$
   - C) $12x^{4}y^{5}$
   - D) $12x^{7}y^{10}$

2. What is $3x^{2}(4x^{3} + 5x)$?
   - A) $12x^{6} + 15x^{2}$
   - B) $12x^{3} + 15x^{2}$
   - C) $12x^{5} + 15x^{3}$
   - D) $12x^{6} + 15x^{3}$

3. What is $(x + 3)(x + 5)$?
   - A) $x^{2} + 8x + 15$
   - B) $x^{2} + 15$
   - C) $x^{2} + 5x + 15$
   - D) $x^{2} + 3x + 15$

4. What is $(x^{3} + 4)^{2}$?
   - A) $x^{6} + 16$
   - B) $x^{6} + 4x^{3} + 16$
   - C) $x^{5} + 8x^{3} + 16$
   - D) $x^{6} + 8x^{3} + 16$

**Proficient Level**

5. What is $(x + 6)(x - 6)$?
   - A) $x^{2} + 12x - 36$
   - B) $x^{2} - 36$
   - C) $x^{2} - 6x - 36$
   - D) $x^{2} + 6x - 36$

6. What is $(2x + 3)(x + 4)$?
   - A) $2x^{2} + 12$
   - B) $2x^{2} + 8x + 12$
   - C) $2x^{2} + 11x + 12$
   - D) $2x^{2} + 3x + 12$

7. What is $(3x - 2)(2x + 5)$?
   - A) $6x^{2} + 11x - 10$
   - B) $6x^{2} - 10$
   - C) $6x^{2} + 15x - 10$
   - D) $6x^{2} - 4x - 10$

**Advanced Level**

8. What is $(2x + 5)^{2}$?
   - A) $4x^{2} + 25$
   - B) $4x^{2} + 10x + 25$
   - C) $2x^{2} + 20x + 25$
   - D) $4x^{2} + 20x + 25$

9. What is $(x + 2)(x^{2} - 3x + 4)$?
   - A) $x^{3} - 3x^{2} + 4x + 8$
   - B) $x^{3} - x^{2} - 2x + 8$
   - C) $x^{3} + 8$
   - D) $x^{3} - x^{2} + 4x + 8$

10. What is $(4x^{2}y)(3xy^{3})(2y)$?
    - A) $24x^{2}y^{3}$
    - B) $24x^{2}y^{9}$
    - C) $24x^{3}y^{5}$
    - D) $9x^{3}y^{5}$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

What is $(5x^{4})(3x^{6})$?

- A) $15x^{24}$
- B) $15x^{10}$
- C) $15x^{6}$
- D) $8x^{10}$

**Item 2**

What is $(x + 7)(x - 2)$?

- A) $x^{2} + 5x - 14$
- B) $x^{2} - 14$
- C) $x^{2} - 2x - 14$
- D) $x^{2} + 7x - 14$

**Item 3**

What is $(x - 5)^{2}$?

- A) $x^{2} + 25$
- B) $x^{2} - 5x + 25$
- C) $x^{2} - 10x + 25$
- D) $x^{2} - 25$

**Item 4**

What is $(3x + 1)(2x - 7)$?

- A) $6x^{2} - 7$
- B) $6x^{2} - 21x - 7$
- C) $6x^{2} + 2x - 7$
- D) $6x^{2} - 19x - 7$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. What is $(2x^{3}y^{2})(6x^{4}y^{5})$?**

Step 1: Multiply the coefficients. $2 \times 6 = 12$.

Step 2: Add the exponents on $x$. $3 + 4 = 7$.

Step 3: Add the exponents on $y$. $2 + 5 = 7$.

$$12x^{7}y^{7}$$

**Answer: B** ($12x^{7}y^{7}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: multiplies_exponents_wrongly (multiplies both pairs of exponents rather than adding them, giving 3 times 4 = 12 on x and 2 times 5 = 10 on y)",
  "B": "Correct: coefficients multiply to 12, and the exponents add to give x to the 7 and y to the 7",
  "C": "Student makes misconception: larger_exponent_kept (keeps the larger exponent from each pair, 4 on x and 5 on y, discarding the other factor entirely)",
  "D": "Student makes misconception: multiplies_exponents_wrongly (adds correctly on x but multiplies on y, giving 2 times 5 = 10 where 2 plus 5 = 7 was required)"
},
"misconception_tag": {
  "A": "multiplies_exponents_wrongly",
  "C": "larger_exponent_kept",
  "D": "multiplies_exponents_wrongly"
}
```

---

**2. What is $3x^{2}(4x^{3} + 5x)$?**

Step 1: Multiply the outside term by the first term inside. $3x^{2} \cdot 4x^{3} = 12x^{5}$.

Step 2: Multiply the outside term by the second term inside. $3x^{2} \cdot 5x = 15x^{3}$.

$$12x^{5} + 15x^{3}$$

Step 3: Check at $x = 1$. The original gives $3(4 + 5) = 27$, and $12 + 15 = 27$. Agreement.

**Answer: C** ($12x^{5} + 15x^{3}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: multiplies_exponents_wrongly (multiplies the exponents in both products, giving 2 times 3 = 6 and 2 times 1 = 2, so the powers come out as 6 and 2 rather than 5 and 3)",
  "B": "Student makes misconception: larger_exponent_kept (keeps the larger exponent in each product rather than adding, giving 3 on the first term and 2 on the second)",
  "C": "Correct: the coefficients multiply to 12 and 15, and the exponents add to give x to the 5 and x to the 3",
  "D": "Student makes misconception: multiplies_exponents_wrongly (multiplies the exponents on the first product only, giving 6 where 5 was required, while handling the second correctly)"
},
"misconception_tag": {
  "A": "multiplies_exponents_wrongly",
  "B": "larger_exponent_kept",
  "D": "multiplies_exponents_wrongly"
}
```

---

**3. What is $(x + 3)(x + 5)$?**

Step 1: Count the products. Two terms times two terms is four.

Step 2: Write all four. $x \cdot x = x^{2}$, $x \cdot 5 = 5x$, $3 \cdot x = 3x$, $3 \cdot 5 = 15$.

Step 3: Combine the like terms. $5x + 3x = 8x$.

$$x^{2} + 8x + 15$$

Step 4: Check at $x = 1$. The original gives $(4)(6) = 24$, and $1 + 8 + 15 = 24$. Agreement.

**Answer: A** ($x^{2} + 8x + 15$)

```json
"distractor_logic": {
  "A": "Correct: all four products are written, and the outer and inner products 5x and 3x combine to 8x",
  "B": "Student makes misconception: foil_outer_inner_omitted (multiplies only the first terms and the last terms, dropping both middle products; at x = 1 this gives 16 while the original gives 24)",
  "C": "Student makes misconception: cross_product_counted_once (writes the outer product 5x but never the inner product 3x, so the middle term is 5x rather than 8x)",
  "D": "Student makes misconception: cross_product_counted_once (writes the inner product 3x but never the outer product 5x, so the middle term is 3x rather than 8x)"
},
"misconception_tag": {
  "B": "foil_outer_inner_omitted",
  "C": "cross_product_counted_once",
  "D": "cross_product_counted_once"
}
```

---

**4. What is $(x^{3} + 4)^{2}$?**

Step 1: A squared binomial is the binomial times itself. $(x^{3} + 4)(x^{3} + 4)$.

Step 2: First terms. $x^{3} \cdot x^{3} = x^{6}$, because the exponents add.

Step 3: The two cross products are both $4x^{3}$, giving $8x^{3}$.

Step 4: Last terms. $4 \cdot 4 = 16$.

$$x^{6} + 8x^{3} + 16$$

**Answer: D** ($x^{6} + 8x^{3} + 16$)

```json
"distractor_logic": {
  "A": "Student makes misconception: binomial_square_middle_term_omitted (squares each term separately and drops both cross products; at x = 1 this gives 17 while the original gives 25)",
  "B": "Student makes misconception: cross_product_counted_once (includes the cross product 4 x cubed once rather than twice, so the middle term is 4 x cubed instead of 8 x cubed)",
  "C": "Student makes misconception: adds_exponents_wrongly (adds the exponents when squaring x cubed, giving 3 plus 2 = 5, where squaring requires multiplying them to get 6)",
  "D": "Correct: x cubed times x cubed is x to the 6, the two cross products give 8 x cubed, and 4 times 4 is 16"
},
"misconception_tag": {
  "A": "binomial_square_middle_term_omitted",
  "B": "cross_product_counted_once",
  "C": "adds_exponents_wrongly"
}
```

---

**Proficient Level**

**5. What is $(x + 6)(x - 6)$?**

Step 1: Write all four products. $x^{2}$, $-6x$, $6x$, $-36$.

Step 2: The two middle products cancel, because $-6x + 6x = 0$.

$$x^{2} - 36$$

Step 3: Check at $x = 1$. The original gives $(7)(-5) = -35$, and $1 - 36 = -35$. Agreement.

**Answer: B** ($x^{2} - 36$)

```json
"distractor_logic": {
  "A": "Student makes misconception: cross_product_counted_once (treats both cross products as positive 6x and adds them, producing a middle term of 12x where the two actually cancel)",
  "B": "Correct: the outer product -6x and the inner product 6x cancel, leaving x squared minus 36",
  "C": "Student makes misconception: cross_product_counted_once (writes only the outer product -6x and never the inner one, so nothing cancels and a middle term of -6x survives)",
  "D": "Student makes misconception: cross_product_counted_once (writes only the inner product 6x and never the outer one, leaving a middle term of 6x)"
},
"misconception_tag": {
  "A": "cross_product_counted_once",
  "C": "cross_product_counted_once",
  "D": "cross_product_counted_once"
}
```

---

**6. What is $(2x + 3)(x + 4)$?**

Step 1: Four products. $2x \cdot x = 2x^{2}$, $2x \cdot 4 = 8x$, $3 \cdot x = 3x$, $3 \cdot 4 = 12$.

Step 2: Combine the middles. $8x + 3x = 11x$.

$$2x^{2} + 11x + 12$$

Step 3: Check at $x = 1$. The original gives $(5)(5) = 25$, and $2 + 11 + 12 = 25$. Agreement.

**Answer: C** ($2x^{2} + 11x + 12$)

```json
"distractor_logic": {
  "A": "Student makes misconception: foil_outer_inner_omitted (multiplies only first and last, dropping both middle products; at x = 1 this gives 14 while the original gives 25)",
  "B": "Student makes misconception: cross_product_counted_once (writes the outer product 8x and never the inner product 3x, so the middle term is 8x rather than 11x)",
  "C": "Correct: all four products are written, and 8x plus 3x combine to 11x",
  "D": "Student makes misconception: cross_product_counted_once (writes the inner product 3x and never the outer product 8x, so the middle term is 3x rather than 11x)"
},
"misconception_tag": {
  "A": "foil_outer_inner_omitted",
  "B": "cross_product_counted_once",
  "D": "cross_product_counted_once"
}
```

---

**7. What is $(3x - 2)(2x + 5)$?**

Step 1: Four products, tracking signs. $3x \cdot 2x = 6x^{2}$, $3x \cdot 5 = 15x$, $-2 \cdot 2x = -4x$, $-2 \cdot 5 = -10$.

Step 2: Combine the middles. $15x - 4x = 11x$.

$$6x^{2} + 11x - 10$$

Step 3: Check at $x = 1$. The original gives $(1)(7) = 7$, and $6 + 11 - 10 = 7$. Agreement.

**Answer: A** ($6x^{2} + 11x - 10$)

```json
"distractor_logic": {
  "A": "Correct: the outer product 15x and the inner product -4x combine to 11x, and the last terms give -10",
  "B": "Student makes misconception: foil_outer_inner_omitted (multiplies only first and last; at x = 1 this gives -4 while the original gives 7)",
  "C": "Student makes misconception: cross_product_counted_once (writes the outer product 15x and never the inner product -4x, so the middle term is 15x rather than 11x)",
  "D": "Student makes misconception: cross_product_counted_once (writes the inner product -4x and never the outer product 15x, so the middle term is -4x rather than 11x)"
},
"misconception_tag": {
  "B": "foil_outer_inner_omitted",
  "C": "cross_product_counted_once",
  "D": "cross_product_counted_once"
}
```

---

**Advanced Level**

**8. What is $(2x + 5)^{2}$?**

Step 1: The binomial times itself. $(2x + 5)(2x + 5)$.

Step 2: First terms. $2x \cdot 2x = 4x^{2}$. The coefficient is squared as well as the variable.

Step 3: The two cross products are both $10x$, giving $20x$.

Step 4: Last terms. $5 \cdot 5 = 25$.

$$4x^{2} + 20x + 25$$

Step 5: Check at $x = 1$. The original gives $7^{2} = 49$, and $4 + 20 + 25 = 49$. Agreement.

**Answer: D** ($4x^{2} + 20x + 25$)

```json
"distractor_logic": {
  "A": "Student makes misconception: binomial_square_middle_term_omitted (squares each term separately and drops both cross products; at x = 1 this gives 29 while the original gives 49)",
  "B": "Student makes misconception: cross_product_counted_once (includes the cross product 10x once rather than twice, so the middle term is 10x instead of 20x)",
  "C": "Student makes misconception: multiplies_exponents_wrongly (squares the variable but leaves the coefficient 2 unsquared, giving 2x squared where 2x times 2x is 4x squared)",
  "D": "Correct: 2x times 2x is 4x squared, the two cross products give 20x, and 5 times 5 is 25"
},
"misconception_tag": {
  "A": "binomial_square_middle_term_omitted",
  "B": "cross_product_counted_once",
  "C": "multiplies_exponents_wrongly"
}
```

---

**9. What is $(x + 2)(x^{2} - 3x + 4)$?**

Step 1: Count the products. Two terms times three terms is six.

Step 2: $x$ meets each term. $x^{3} - 3x^{2} + 4x$.

Step 3: $2$ meets each term. $2x^{2} - 6x + 8$.

Step 4: Combine like terms. $-3x^{2} + 2x^{2} = -x^{2}$, and $4x - 6x = -2x$.

$$x^{3} - x^{2} - 2x + 8$$

Step 5: Check at $x = 1$. The original gives $(3)(2) = 6$, and $1 - 1 - 2 + 8 = 6$. Agreement.

**Answer: B** ($x^{3} - x^{2} - 2x + 8$)

```json
"distractor_logic": {
  "A": "Student makes misconception: cross_product_counted_once (distributes the x across all three terms but takes only the last product from the 2, so the 2 times x squared and 2 times -3x products never appear)",
  "B": "Correct: all six products are written, and combining gives x cubed minus x squared minus 2x plus 8",
  "C": "Student makes misconception: foil_outer_inner_omitted (multiplies only the first terms and the last terms, giving x cubed plus 8; at x = 1 this gives 9 while the original gives 6)",
  "D": "Student makes misconception: cross_product_counted_once (combines the x squared terms correctly but takes only the 4x from the x row, never the -6x from the 2 row, leaving 4x as the linear term)"
},
"misconception_tag": {
  "A": "cross_product_counted_once",
  "C": "foil_outer_inner_omitted",
  "D": "cross_product_counted_once"
}
```

---

**10. What is $(4x^{2}y)(3xy^{3})(2y)$?**

Step 1: Multiply the coefficients. $4 \times 3 \times 2 = 24$.

Step 2: Add the exponents on $x$. $2 + 1 = 3$.

Step 3: Add the exponents on $y$. $1 + 3 + 1 = 5$.

$$24x^{3}y^{5}$$

**Answer: C** ($24x^{3}y^{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: larger_exponent_kept (keeps the largest exponent on each base rather than adding, taking 2 from x squared and 3 from y cubed)",
  "B": "Student makes misconception: multiplies_exponents_wrongly (adds on x but multiplies on y, giving 1 times 3 times 1 = 3 on x squared kept as 2 and 9 on y where 5 was required)",
  "C": "Correct: the coefficients multiply to 24, the x exponents add to 3, and the y exponents add to 5",
  "D": "Student makes misconception: adds_exponents_wrongly (adds the coefficients 4 plus 3 plus 2 = 9 as though they were exponents, while handling the variable exponents correctly)"
},
"misconception_tag": {
  "A": "larger_exponent_kept",
  "B": "multiplies_exponents_wrongly",
  "D": "adds_exponents_wrongly"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: What is $(5x^{4})(3x^{6})$?**

Step 1: Multiply the coefficients. $5 \times 3 = 15$.

Step 2: Add the exponents. $4 + 6 = 10$.

$$15x^{10}$$

**Answer: B** ($15x^{10}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: multiplies_exponents_wrongly (multiplies the exponents, giving 4 times 6 = 24 where 4 plus 6 = 10 was required)",
  "B": "Correct: the coefficients multiply to 15 and the exponents add to 10",
  "C": "Student makes misconception: larger_exponent_kept (keeps the larger exponent 6 and discards the other factor)",
  "D": "Student makes misconception: adds_exponents_wrongly (adds the coefficients 5 plus 3 = 8 as though they were exponents, while adding the exponents correctly)"
},
"misconception_tag": {
  "A": "multiplies_exponents_wrongly",
  "C": "larger_exponent_kept",
  "D": "adds_exponents_wrongly"
}
```

---

**Item 2: What is $(x + 7)(x - 2)$?**

Step 1: Four products. $x^{2}$, $-2x$, $7x$, $-14$.

Step 2: Combine the middles. $-2x + 7x = 5x$.

$$x^{2} + 5x - 14$$

Step 3: Check at $x = 1$. The original gives $(8)(-1) = -8$, and $1 + 5 - 14 = -8$. Agreement.

**Answer: A** ($x^{2} + 5x - 14$)

```json
"distractor_logic": {
  "A": "Correct: the outer product -2x and the inner product 7x combine to 5x, and the last terms give -14",
  "B": "Student makes misconception: foil_outer_inner_omitted (multiplies only first and last; at x = 1 this gives -13 while the original gives -8)",
  "C": "Student makes misconception: cross_product_counted_once (writes the outer product -2x and never the inner product 7x, leaving a middle term of -2x)",
  "D": "Student makes misconception: cross_product_counted_once (writes the inner product 7x and never the outer product -2x, leaving a middle term of 7x)"
},
"misconception_tag": {
  "B": "foil_outer_inner_omitted",
  "C": "cross_product_counted_once",
  "D": "cross_product_counted_once"
}
```

---

**Item 3: What is $(x - 5)^{2}$?**

Step 1: The binomial times itself. $(x - 5)(x - 5)$.

Step 2: The two cross products are both $-5x$, giving $-10x$.

Step 3: The last terms give $(-5)(-5) = 25$, which is positive.

$$x^{2} - 10x + 25$$

**Answer: C** ($x^{2} - 10x + 25$)

```json
"distractor_logic": {
  "A": "Student makes misconception: binomial_square_middle_term_omitted (squares each term separately and drops both cross products; at x = 1 this gives 26 while the original gives 16)",
  "B": "Student makes misconception: cross_product_counted_once (includes the cross product -5x once rather than twice, so the middle term is -5x instead of -10x)",
  "C": "Correct: the two cross products give -10x, and -5 times -5 gives positive 25",
  "D": "Student makes misconception: binomial_square_middle_term_omitted (drops both cross products and also treats the squared constant as negative, giving a difference of squares that the expression is not)"
},
"misconception_tag": {
  "A": "binomial_square_middle_term_omitted",
  "B": "cross_product_counted_once",
  "D": "binomial_square_middle_term_omitted"
}
```

---

**Item 4: What is $(3x + 1)(2x - 7)$?**

Step 1: Four products. $3x \cdot 2x = 6x^{2}$, $3x \cdot (-7) = -21x$, $1 \cdot 2x = 2x$, $1 \cdot (-7) = -7$.

Step 2: Combine the middles. $-21x + 2x = -19x$.

$$6x^{2} - 19x - 7$$

Step 3: Check at $x = 1$. The original gives $(4)(-5) = -20$, and $6 - 19 - 7 = -20$. Agreement.

**Answer: D** ($6x^{2} - 19x - 7$)

```json
"distractor_logic": {
  "A": "Student makes misconception: foil_outer_inner_omitted (multiplies only first and last; at x = 1 this gives -1 while the original gives -20)",
  "B": "Student makes misconception: cross_product_counted_once (writes the outer product -21x and never the inner product 2x, leaving a middle term of -21x)",
  "C": "Student makes misconception: cross_product_counted_once (writes the inner product 2x and never the outer product -21x, leaving a middle term of 2x)",
  "D": "Correct: the outer product -21x and the inner product 2x combine to -19x, and the last terms give -7"
},
"misconception_tag": {
  "A": "foil_outer_inner_omitted",
  "B": "cross_product_counted_once",
  "C": "cross_product_counted_once"
}
```
