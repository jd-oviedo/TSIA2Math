---
topic_name: "Factoring quadratics"
unit_number: 4
sequence_in_unit: 3
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "AR"
keywords: ["factoring", "quadratic", "difference of squares", "perfect square trinomial", "leading coefficient", "binomial factors"]
---

# AR.3.2 - Factoring Quadratics

**Topic ID:** AR.3.2  
**Unit:** 4  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Distinguish a difference-of-squares expression from a perfect-square trinomial before choosing a factoring pattern.
- Factor a quadratic with a leading coefficient other than 1 by testing arrangements of the constant and coefficient splits and expanding to check the middle term.
- Verify any factored form by expanding it back to confirm it reproduces the original expression, including the leading coefficient.

---

#### **Part 1: Guided Notes**

##### Where the Last Topic Stopped

In AR.3.1 every quadratic you factored started with a plain $x^{2}$. You found two numbers that multiplied to the constant and added to the middle coefficient, and you were done.

This topic handles the three cases that method does not cover:

1. **No middle term at all**, like $x^{2} - 49$.
2. **A perfect square**, like $x^{2} + 12x + 36$.
3. **A number in front of $x^{2}$**, like $2x^{2} + 7x + 3$.

The check from AR.3.1 does not change and never will. **Multiply your answer back out.** If it does not reproduce the original expression, it is wrong, and you have just proved it to yourself in fifteen seconds.

---

##### Two Squares With a Minus Between Them

When you multiply $(x - 7)(x + 7)$, watch the middle:

$$x^{2} + 7x - 7x - 49 = x^{2} - 49$$

The two middle terms are equal and opposite, so they **cancel completely**. That is why the result has no $x$ term.

Run it backward and you get a pattern worth memorising:

$$a^{2} - b^{2} = (a - b)(a + b)$$

So a quadratic with **no middle term** and a **minus sign** factors into the same two numbers, once with a plus and once with a minus.

**Example 1:** Factor $x^{2} - 49$.

Step 1: Check the shape. There is no $x$ term, and the sign is negative. This is a difference of squares.

Step 2: Take the square root of each piece.
- $\sqrt{x^{2}} = x$ and $\sqrt{49} = 7$

Step 3: Write one bracket with a minus and one with a plus.
- $(x - 7)(x + 7)$

Step 4: Check. $x^{2} + 7x - 7x - 49 = x^{2} - 49$. Match.

The order of the brackets does not matter here. $(x + 7)(x - 7)$ is the same answer.

---

##### The Perfect Square Trinomial

Now multiply $(x + 6)(x + 6)$:

$$x^{2} + 6x + 6x + 36 = x^{2} + 12x + 36$$

This time the middle terms are **identical**, so instead of cancelling they **double**. The pattern:

$$(a + b)^{2} = a^{2} + 2ab + b^{2}$$

You can spot one before doing any work. The first and last terms are both perfect squares, and the middle term is twice the product of their roots.

**Example 2:** Factor $x^{2} + 12x + 36$.

Step 1: Are the ends perfect squares? $x^{2}$ is, and $36 = 6^{2}$ is.

Step 2: Is the middle twice the product of the roots? $2 \times x \times 6 = 12x$. Yes.

Step 3: Both brackets carry the sign of the middle term, which is positive.
- $(x + 6)(x + 6)$

Step 4: Check. $x^{2} + 6x + 6x + 36 = x^{2} + 12x + 36$. Match.

**Example 3:** Factor $x^{2} - 20x + 100$.

Step 1: Ends are squares: $x^{2}$ and $100 = 10^{2}$.

Step 2: Middle check: $2 \times x \times 10 = 20x$, and the sign is negative. Yes.

Step 3: The middle term is negative, so **both** brackets get a minus.
- $(x - 10)(x - 10)$

Step 4: Check. $x^{2} - 10x - 10x + 100 = x^{2} - 20x + 100$. Match.

---

##### The Mistake That Costs the Most Points

Read this section twice.

**A difference of squares and a perfect square are not the same thing, and their answers look almost identical.**

Put them side by side:

| Expression | Factors | Why |
|---|---|---|
| $x^{2} - 36$ | $(x - 6)(x + 6)$ | middle terms cancel |
| $x^{2} + 12x + 36$ | $(x + 6)(x + 6)$ | middle terms double |
| $x^{2} - 12x + 36$ | $(x - 6)(x - 6)$ | middle terms double, both negative |

Three different expressions, all built from $x$ and $6$, all with different answers. The only thing that tells them apart is **the middle term**.

So before you factor anything, ask: **is there a middle term or not?**

- **No middle term** and a minus: one bracket plus, one bracket minus.
- **A middle term**: both brackets carry the same sign, the sign of that middle term.

Getting this backward is the single most common error on this topic, because $(x - 6)(x + 6)$ and $(x - 6)(x - 6)$ differ by one character. Expanding catches it every time: the first gives $x^{2} - 36$ and the second gives $x^{2} - 12x + 36$, which are not remotely the same expression.

---

##### When a Number Sits in Front of the Square

If the quadratic starts with $2x^{2}$ or $3x^{2}$, that number has to come from somewhere. It comes from multiplying the two $x$ terms in the brackets.

$$(2x + 1)(x + 3) = 2x^{2} + 6x + x + 3 = 2x^{2} + 7x + 3$$

The $2$ went into one bracket. **It cannot be ignored, and it cannot be left outside.**

**Example 4:** Factor $2x^{2} + 7x + 3$.

Step 1: The leading coefficient is $2$, which splits only as $2 \times 1$. So the brackets start $(2x \quad)(x \quad)$.

Step 2: The constant is $3$, which splits only as $3 \times 1$. So the constants are $3$ and $1$ in some order.

Step 3: There are two orders. Try both and expand.
- $(2x + 3)(x + 1) = 2x^{2} + 2x + 3x + 3 = 2x^{2} + 5x + 3$. Middle term $5x$. No.
- $(2x + 1)(x + 3) = 2x^{2} + 6x + x + 3 = 2x^{2} + 7x + 3$. Middle term $7x$. **Yes.**

Answer: $(2x + 1)(x + 3)$.

Step 3 is the whole topic in one line. **The same two constants in the other order give a different middle term.** You cannot tell which arrangement is right by looking. You expand and see.

---

##### Which Bracket Does Each Constant Go In?

The reason the order matters is that each constant gets multiplied by the **other** bracket's $x$ term, and those terms are not the same size.

In $(2x + 1)(x + 3)$:
- the $3$ meets the $2x$, giving $6x$
- the $1$ meets the $x$, giving $1x$
- total middle term: $7x$

Swap the constants, and in $(2x + 3)(x + 1)$:
- the $1$ meets the $2x$, giving $2x$
- the $3$ meets the $x$, giving $3x$
- total middle term: $5x$

**The bigger constant paired with the bigger coefficient makes a bigger middle term.** That gives you a way to choose which order to try first, but it is a shortcut for guessing, not a substitute for expanding.

**Example 5:** Factor $6x^{2} + 11x + 3$.

Step 1: $6$ splits as $6 \times 1$ or $3 \times 2$. The constant $3$ splits only as $3 \times 1$.

Step 2: Try arrangements and expand each.
- $(6x + 1)(x + 3) = 6x^{2} + 18x + x + 3 = 6x^{2} + 19x + 3$. No.
- $(6x + 3)(x + 1) = 6x^{2} + 6x + 3x + 3 = 6x^{2} + 9x + 3$. No.
- $(3x + 1)(2x + 3) = 6x^{2} + 9x + 2x + 3 = 6x^{2} + 11x + 3$. **Yes.**

Answer: $(3x + 1)(2x + 3)$.

Notice that the winning split of $6$ was $3 \times 2$, not $6 \times 1$. **Try the balanced split as well as the obvious one.**

---

##### Squares and Minus Signs With a Coefficient

The two special shapes still work when there is a number in front. The square root just has to cover the coefficient too.

**Example 6:** Factor $9x^{2} - 25$.

Step 1: No middle term, sign negative. Difference of squares.

Step 2: Square root each piece, coefficient included.
- $\sqrt{9x^{2}} = 3x$ and $\sqrt{25} = 5$

Step 3: One minus, one plus.
- $(3x - 5)(3x + 5)$

Step 4: Check. $9x^{2} + 15x - 15x - 25 = 9x^{2} - 25$. Match.

A student who factors this as $(x - 5)(x + 5)$ has thrown the $9$ away. That expands to $x^{2} - 25$, which is a different expression entirely.

---

##### Pull Out a Common Factor First

This carries over unchanged from AR.3.1. If every term shares a factor, take it out before you do anything else, and **write it in the final answer**.

**Example 7:** Completely factor $2x^{2} - 18$.

Step 1: Both terms are even, so pull out the $2$.
- $2(x^{2} - 9)$

Step 2: What is left is a difference of squares.
- $2(x - 3)(x + 3)$

Step 3: Check. $(x - 3)(x + 3) = x^{2} - 9$, and doubling gives $2x^{2} - 18$. Match.

Pulling the $2$ out first turned a non-monic problem into one you can do on sight. **Always look for the common factor before deciding the problem is hard.**

---

##### The Five Traps

1. **Factoring a difference of squares as a perfect square.** $x^{2} - 36$ is $(x - 6)(x + 6)$, not $(x - 6)(x - 6)$. No middle term means the brackets have opposite signs.
2. **Getting the sign wrong on a perfect square.** $x^{2} - 20x + 100$ needs both brackets negative. Both brackets carry the sign of the middle term.
3. **Ignoring the leading coefficient.** $9x^{2} - 25$ is $(3x - 5)(3x + 5)$. Factoring it as $(x - 5)(x + 5)$ silently deletes the $9$.
4. **Putting the constants in the wrong brackets.** $(2x + 1)(x + 3)$ and $(2x + 3)(x + 1)$ use the same four numbers and give middle terms of $7x$ and $5x$. Expand to tell them apart.
5. **Only trying the obvious split of the leading coefficient.** For $6x^{2} + 11x + 3$ the answer uses $3 \times 2$, not $6 \times 1$.

Every one of these is caught by expanding your answer back out. When you miss a problem below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Which expression is the factored form of $x^{2} - 49$?
   - A) $(x - 7)(x + 7)$
   - B) $(x - 7)(x - 7)$
   - C) $(x + 7)(x + 7)$
   - D) $(x - 49)(x + 1)$

2. Which expression is the factored form of $x^{2} + 12x + 36$?
   - A) $(x + 6)(x - 6)$
   - B) $(x + 6)(x + 6)$
   - C) $(x - 6)(x - 6)$
   - D) $(x + 36)(x + 1)$

3. Which expression is the factored form of $2x^{2} + 7x + 3$?
   - A) $(x + 1)(x + 3)$
   - B) $(2x + 3)(x + 1)$
   - C) $(2x + 1)(x + 3)$
   - D) $(2x - 1)(x - 3)$

4. Which expression is the factored form of $x^{2} - 16$?
   - A) $(x - 4)(x - 4)$
   - B) $(x - 16)(x + 1)$
   - C) $(x + 4)(x + 4)$
   - D) $(x - 4)(x + 4)$

**Proficient Level** (these require an extra step)

5. Which expression is the factored form of $3x^{2} + 10x + 8$?
   - A) $(3x + 4)(x + 2)$
   - B) $(3x + 2)(x + 4)$
   - C) $(x + 4)(x + 2)$
   - D) $(3x - 4)(x - 2)$

6. Which expression is the factored form of $9x^{2} - 25$?
   - A) $(3x - 5)(3x - 5)$
   - B) $(9x - 5)(x + 5)$
   - C) $(3x - 5)(3x + 5)$
   - D) $(x - 5)(x + 5)$

7. Which expression is the factored form of $x^{2} - 20x + 100$?
   - A) $(x + 10)(x + 10)$
   - B) $(x - 10)(x - 10)$
   - C) $(x - 10)(x + 10)$
   - D) $(x - 100)(x - 1)$

**Advanced Level** (these need multiple steps or reverse thinking)

8. Which expression is the complete factored form of $2x^{2} - 18$?
   - A) $(2x - 3)(x + 6)$
   - B) $2(x - 3)(x + 3)$
   - C) $2(x - 3)(x - 3)$
   - D) $(x - 3)(x + 3)$

9. Which expression is the factored form of $6x^{2} + 11x + 3$?
   - A) $(6x + 1)(x + 3)$
   - B) $(3x + 3)(2x + 1)$
   - C) $(3x + 1)(2x + 3)$
   - D) $(x + 1)(x + 3)$

10. Which expression is the factored form of $4x^{2} - 12x + 9$?
    - A) $(2x - 3)(2x + 3)$
    - B) $(2x + 3)(2x + 3)$
    - C) $(x - 3)(x - 3)$
    - D) $(2x - 3)(2x - 3)$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Which expression is the factored form of $x^{2} - 81$?

- A) $(x - 9)(x - 9)$
- B) $(x - 9)(x + 9)$
- C) $(x + 9)(x + 9)$
- D) $(x - 81)(x + 1)$

**Item 2**

Which expression is the factored form of $x^{2} + 16x + 64$?

- A) $(x + 8)(x - 8)$
- B) $(x - 8)(x - 8)$
- C) $(x + 8)(x + 8)$
- D) $(x + 64)(x + 1)$

**Item 3**

Which expression is the factored form of $2x^{2} + 11x + 5$?

- A) $(2x + 5)(x + 1)$
- B) $(x + 1)(x + 5)$
- C) $(2x - 1)(x - 5)$
- D) $(2x + 1)(x + 5)$

**Proficient Level**

**Item 4**

Which expression is the factored form of $25x^{2} - 4$?

- A) $(5x - 2)(5x + 2)$
- B) $(5x - 2)(5x - 2)$
- C) $(x - 2)(x + 2)$
- D) $(25x - 2)(x + 2)$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Which expression is the factored form of $x^{2} - 49$?**

Step 1: There is no middle term and the sign is negative, so this is a difference of squares.

Step 2: Square root each piece. $\sqrt{x^{2}} = x$ and $\sqrt{49} = 7$.

Step 3: One bracket minus, one bracket plus.
- $(x - 7)(x + 7)$

Step 4: Check. $x^{2} + 7x - 7x - 49 = x^{2} - 49$. Match.

**Answer: A** ($(x - 7)(x + 7)$)

```json
"distractor_logic": {
  "A": "Correct: no middle term with a negative sign is a difference of squares, so the roots x and 7 go into one minus bracket and one plus bracket",
  "B": "Student makes misconception: perfect_square_vs_difference_of_squares (treats the expression as a perfect square and makes both brackets negative; expanding gives x squared minus 14x plus 49, which has a middle term and the wrong constant sign)",
  "C": "Student makes misconception: perfect_square_vs_difference_of_squares (makes both brackets positive; expanding gives x squared plus 14x plus 49, again with a middle term the original does not have)",
  "D": "Student makes misconception: constants_assigned_to_wrong_binomials (puts the constant 49 itself into one bracket and 1 into the other rather than the square root 7 into both; expanding gives x squared minus 48x minus 49)"
},
"misconception_tag": {
  "B": "perfect_square_vs_difference_of_squares",
  "C": "perfect_square_vs_difference_of_squares",
  "D": "constants_assigned_to_wrong_binomials"
}
```

---

**2. Which expression is the factored form of $x^{2} + 12x + 36$?**

Step 1: Both ends are perfect squares: $x^{2}$ and $36 = 6^{2}$.

Step 2: Check the middle. $2 \times x \times 6 = 12x$, which matches, so this is a perfect square trinomial.

Step 3: The middle term is positive, so both brackets are positive.
- $(x + 6)(x + 6)$

Step 4: Check. $x^{2} + 6x + 6x + 36 = x^{2} + 12x + 36$. Match.

**Answer: B** ($(x + 6)(x + 6)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: perfect_square_vs_difference_of_squares (uses the difference-of-squares arrangement of one plus and one minus; expanding gives x squared minus 36, which loses the middle term entirely)",
  "B": "Correct: the ends are squares and the middle is twice the product of their roots, so both brackets carry the positive middle sign",
  "C": "Student makes misconception: wrong_sign_on_factor (uses the correct magnitude 6 but makes both brackets negative; expanding gives x squared minus 12x plus 36, so the middle term comes out negative)",
  "D": "Student makes misconception: constants_assigned_to_wrong_binomials (places 36 and 1 as the constants instead of 6 and 6; expanding gives x squared plus 37x plus 36)"
},
"misconception_tag": {
  "A": "perfect_square_vs_difference_of_squares",
  "C": "wrong_sign_on_factor",
  "D": "constants_assigned_to_wrong_binomials"
}
```

---

**3. Which expression is the factored form of $2x^{2} + 7x + 3$?**

Step 1: The leading coefficient $2$ splits only as $2 \times 1$, so the brackets start $(2x \quad)(x \quad)$.

Step 2: The constant $3$ splits only as $3 \times 1$.

Step 3: Try both orders and expand.
- $(2x + 3)(x + 1) = 2x^{2} + 2x + 3x + 3 = 2x^{2} + 5x + 3$. No.
- $(2x + 1)(x + 3) = 2x^{2} + 6x + x + 3 = 2x^{2} + 7x + 3$. Yes.

**Answer: C** ($(2x + 1)(x + 3)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: leading_coefficient_ignored_in_factoring (factors as though the expression were x squared plus 7x plus 3 with no coefficient; expanding gives x squared plus 4x plus 3, which is missing the leading 2 altogether)",
  "B": "Student makes misconception: constants_assigned_to_wrong_binomials (uses the right numbers 2, 1, 3 and 1 but swaps which bracket holds the 3; expanding gives 2x squared plus 5x plus 3, so the middle term is 5x rather than 7x)",
  "C": "Correct: the 3 pairs with the 2x to give 6x and the 1 pairs with the x to give x, and 6x plus x is the required 7x",
  "D": "Student makes misconception: wrong_sign_on_factor (uses the correct arrangement but makes both constants negative; expanding gives 2x squared minus 7x plus 3, so the middle term comes out negative)"
},
"misconception_tag": {
  "A": "leading_coefficient_ignored_in_factoring",
  "B": "constants_assigned_to_wrong_binomials",
  "D": "wrong_sign_on_factor"
}
```

---

**4. Which expression is the factored form of $x^{2} - 16$?**

Step 1: No middle term, negative sign. Difference of squares.

Step 2: Square roots are $x$ and $4$.

Step 3: One minus, one plus.
- $(x - 4)(x + 4)$

Step 4: Check. $x^{2} + 4x - 4x - 16 = x^{2} - 16$. Match.

**Answer: D** ($(x - 4)(x + 4)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: perfect_square_vs_difference_of_squares (treats it as a perfect square with both brackets negative; expanding gives x squared minus 8x plus 16, which has a middle term and a positive constant)",
  "B": "Student makes misconception: constants_assigned_to_wrong_binomials (uses the constant 16 and 1 as the bracket constants rather than the square root 4 in both; expanding gives x squared minus 15x minus 16)",
  "C": "Student makes misconception: perfect_square_vs_difference_of_squares (makes both brackets positive; expanding gives x squared plus 8x plus 16, which is not the original expression)",
  "D": "Correct: the roots are x and 4, and a difference of squares puts one in a minus bracket and one in a plus bracket so the middle terms cancel"
},
"misconception_tag": {
  "A": "perfect_square_vs_difference_of_squares",
  "B": "constants_assigned_to_wrong_binomials",
  "C": "perfect_square_vs_difference_of_squares"
}
```

---

**Proficient Level**

**5. Which expression is the factored form of $3x^{2} + 10x + 8$?**

Step 1: The leading coefficient $3$ splits only as $3 \times 1$.

Step 2: The constant $8$ splits as $8 \times 1$, $4 \times 2$, or $2 \times 4$.

Step 3: Try the balanced arrangement first and expand.
- $(3x + 4)(x + 2) = 3x^{2} + 6x + 4x + 8 = 3x^{2} + 10x + 8$. Yes.

**Answer: A** ($(3x + 4)(x + 2)$)

```json
"distractor_logic": {
  "A": "Correct: the 4 pairs with the x to give 4x and the 2 pairs with the 3x to give 6x, and 4x plus 6x is the required 10x",
  "B": "Student makes misconception: constants_assigned_to_wrong_binomials (uses the same numbers but swaps the 4 and the 2 between brackets; expanding gives 3x squared plus 14x plus 8, so the middle term is 14x rather than 10x)",
  "C": "Student makes misconception: leading_coefficient_ignored_in_factoring (factors as though the leading coefficient were 1; expanding gives x squared plus 6x plus 8, which drops the 3 entirely)",
  "D": "Student makes misconception: wrong_sign_on_factor (keeps the correct arrangement but makes both constants negative; expanding gives 3x squared minus 10x plus 8, so the middle term is negative)"
},
"misconception_tag": {
  "B": "constants_assigned_to_wrong_binomials",
  "C": "leading_coefficient_ignored_in_factoring",
  "D": "wrong_sign_on_factor"
}
```

---

**6. Which expression is the factored form of $9x^{2} - 25$?**

Step 1: No middle term, negative sign. Difference of squares.

Step 2: Square root each piece including the coefficient. $\sqrt{9x^{2}} = 3x$ and $\sqrt{25} = 5$.

Step 3: One minus, one plus.
- $(3x - 5)(3x + 5)$

Step 4: Check. $9x^{2} + 15x - 15x - 25 = 9x^{2} - 25$. Match.

**Answer: C** ($(3x - 5)(3x + 5)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: perfect_square_vs_difference_of_squares (treats the expression as a perfect square with both brackets negative; expanding gives 9x squared minus 30x plus 25, which has a middle term the original lacks)",
  "B": "Student makes misconception: constants_assigned_to_wrong_binomials (splits the 9 as 9 times 1 and places the constants without checking; expanding gives 9x squared plus 40x minus 25)",
  "C": "Correct: the square roots are 3x and 5, and the difference-of-squares arrangement makes the two middle terms cancel",
  "D": "Student makes misconception: leading_coefficient_ignored_in_factoring (takes the square root of 25 but not of 9, so the 9 is silently deleted; expanding gives x squared minus 25)"
},
"misconception_tag": {
  "A": "perfect_square_vs_difference_of_squares",
  "B": "constants_assigned_to_wrong_binomials",
  "D": "leading_coefficient_ignored_in_factoring"
}
```

---

**7. Which expression is the factored form of $x^{2} - 20x + 100$?**

Step 1: Both ends are perfect squares: $x^{2}$ and $100 = 10^{2}$.

Step 2: Check the middle. $2 \times x \times 10 = 20x$, and the sign is negative. Perfect square trinomial.

Step 3: The middle term is negative, so both brackets are negative.
- $(x - 10)(x - 10)$

Step 4: Check. $x^{2} - 10x - 10x + 100 = x^{2} - 20x + 100$. Match.

**Answer: B** ($(x - 10)(x - 10)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_sign_on_factor (uses the correct magnitude 10 but makes both brackets positive; expanding gives x squared plus 20x plus 100, so the middle term has the wrong sign)",
  "B": "Correct: the ends are squares, the middle is twice the product of their roots, and the negative middle term puts a minus in both brackets",
  "C": "Student makes misconception: perfect_square_vs_difference_of_squares (uses the difference-of-squares arrangement of one minus and one plus; expanding gives x squared minus 100, which has no middle term at all)",
  "D": "Student makes misconception: constants_assigned_to_wrong_binomials (places 100 and 1 as the constants rather than 10 and 10; expanding gives x squared minus 101x plus 100)"
},
"misconception_tag": {
  "A": "wrong_sign_on_factor",
  "C": "perfect_square_vs_difference_of_squares",
  "D": "constants_assigned_to_wrong_binomials"
}
```

---

**Advanced Level**

**8. Which expression is the complete factored form of $2x^{2} - 18$?**

Step 1: Both terms are even, so extract the common factor $2$ first.
- $2(x^{2} - 9)$

Step 2: What remains is a difference of squares with roots $x$ and $3$.
- $2(x - 3)(x + 3)$

Step 3: Check. $(x - 3)(x + 3) = x^{2} - 9$, and doubling gives $2x^{2} - 18$. Match.

**Answer: B** ($2(x - 3)(x + 3)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: constants_assigned_to_wrong_binomials (distributes the 2 into one bracket and places the constants 3 and 6 without checking; expanding gives 2x squared plus 9x minus 18, which has a middle term the original does not)",
  "B": "Correct: extracting the 2 leaves a difference of squares, and the extracted 2 is kept in the answer",
  "C": "Student makes misconception: perfect_square_vs_difference_of_squares (extracts the 2 correctly but factors the remainder as a perfect square; expanding gives 2x squared minus 12x plus 18)",
  "D": "Student makes misconception: leading_coefficient_ignored_in_factoring (factors x squared minus 9 correctly but drops the leading 2, leaving an expression equal to half the original)"
},
"misconception_tag": {
  "A": "constants_assigned_to_wrong_binomials",
  "C": "perfect_square_vs_difference_of_squares",
  "D": "leading_coefficient_ignored_in_factoring"
}
```

---

**9. Which expression is the factored form of $6x^{2} + 11x + 3$?**

Step 1: The leading coefficient $6$ splits as $6 \times 1$ or $3 \times 2$. The constant $3$ splits only as $3 \times 1$.

Step 2: Try each arrangement and expand.
- $(6x + 1)(x + 3) = 6x^{2} + 18x + x + 3 = 6x^{2} + 19x + 3$. No.
- $(6x + 3)(x + 1) = 6x^{2} + 6x + 3x + 3 = 6x^{2} + 9x + 3$. No.
- $(3x + 1)(2x + 3) = 6x^{2} + 9x + 2x + 3 = 6x^{2} + 11x + 3$. Yes.

**Answer: C** ($(3x + 1)(2x + 3)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: constants_assigned_to_wrong_binomials (splits the 6 as 6 times 1 and places the 3 with the single x; expanding gives 6x squared plus 19x plus 3, so the middle term is 19x rather than 11x)",
  "B": "Student makes misconception: constants_assigned_to_wrong_binomials (uses the balanced split 3 times 2 but swaps which bracket holds the 3; expanding gives 6x squared plus 9x plus 3)",
  "C": "Correct: the 1 pairs with the 2x to give 2x and the 3 pairs with the 3x to give 9x, and 2x plus 9x is the required 11x",
  "D": "Student makes misconception: leading_coefficient_ignored_in_factoring (factors as though the leading coefficient were 1; expanding gives x squared plus 4x plus 3, with the 6 discarded)"
},
"misconception_tag": {
  "A": "constants_assigned_to_wrong_binomials",
  "B": "constants_assigned_to_wrong_binomials",
  "D": "leading_coefficient_ignored_in_factoring"
}
```

---

**10. Which expression is the factored form of $4x^{2} - 12x + 9$?**

Step 1: Both ends are perfect squares: $4x^{2} = (2x)^{2}$ and $9 = 3^{2}$.

Step 2: Check the middle. $2 \times 2x \times 3 = 12x$, and the sign is negative. Perfect square trinomial.

Step 3: The middle term is negative, so both brackets are negative.
- $(2x - 3)(2x - 3)$

Step 4: Check. $4x^{2} - 6x - 6x + 9 = 4x^{2} - 12x + 9$. Match.

**Answer: D** ($(2x - 3)(2x - 3)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: perfect_square_vs_difference_of_squares (uses the difference-of-squares arrangement; expanding gives 4x squared minus 9, which loses the middle term entirely)",
  "B": "Student makes misconception: wrong_sign_on_factor (uses the correct magnitudes but makes both brackets positive; expanding gives 4x squared plus 12x plus 9, so the middle term has the wrong sign)",
  "C": "Student makes misconception: leading_coefficient_ignored_in_factoring (takes the square root of 9 but not of 4x squared; expanding gives x squared minus 6x plus 9, which drops the leading 4)",
  "D": "Correct: the roots are 2x and 3, the middle term is twice their product, and the negative middle sign puts a minus in both brackets"
},
"misconception_tag": {
  "A": "perfect_square_vs_difference_of_squares",
  "B": "wrong_sign_on_factor",
  "C": "leading_coefficient_ignored_in_factoring"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Which expression is the factored form of $x^{2} - 81$?**

Step 1: No middle term, negative sign. Difference of squares.

Step 2: Square roots are $x$ and $9$.

Step 3: One minus, one plus.
- $(x - 9)(x + 9)$

Step 4: Check. $x^{2} + 9x - 9x - 81 = x^{2} - 81$. Match.

**Answer: B** ($(x - 9)(x + 9)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: perfect_square_vs_difference_of_squares (makes both brackets negative; expanding gives x squared minus 18x plus 81, which has a middle term and a positive constant)",
  "B": "Correct: the roots are x and 9, placed in one minus bracket and one plus bracket so the middle terms cancel",
  "C": "Student makes misconception: perfect_square_vs_difference_of_squares (makes both brackets positive; expanding gives x squared plus 18x plus 81)",
  "D": "Student makes misconception: constants_assigned_to_wrong_binomials (uses 81 and 1 as the bracket constants rather than the square root 9 in both; expanding gives x squared minus 80x minus 81)"
},
"misconception_tag": {
  "A": "perfect_square_vs_difference_of_squares",
  "C": "perfect_square_vs_difference_of_squares",
  "D": "constants_assigned_to_wrong_binomials"
}
```

---

**Item 2: Which expression is the factored form of $x^{2} + 16x + 64$?**

Step 1: Ends are squares: $x^{2}$ and $64 = 8^{2}$.

Step 2: Middle check: $2 \times x \times 8 = 16x$. Perfect square trinomial.

Step 3: Positive middle term, so both brackets positive.
- $(x + 8)(x + 8)$

Step 4: Check. $x^{2} + 8x + 8x + 64 = x^{2} + 16x + 64$. Match.

**Answer: C** ($(x + 8)(x + 8)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: perfect_square_vs_difference_of_squares (uses the one-plus one-minus arrangement; expanding gives x squared minus 64, which has no middle term)",
  "B": "Student makes misconception: wrong_sign_on_factor (uses the correct magnitude 8 but makes both brackets negative; expanding gives x squared minus 16x plus 64)",
  "C": "Correct: the ends are squares and the middle is twice the product of their roots, so both brackets take the positive middle sign",
  "D": "Student makes misconception: constants_assigned_to_wrong_binomials (places 64 and 1 as the constants instead of 8 and 8; expanding gives x squared plus 65x plus 64)"
},
"misconception_tag": {
  "A": "perfect_square_vs_difference_of_squares",
  "B": "wrong_sign_on_factor",
  "D": "constants_assigned_to_wrong_binomials"
}
```

---

**Item 3: Which expression is the factored form of $2x^{2} + 11x + 5$?**

Step 1: The leading coefficient $2$ splits only as $2 \times 1$, and the constant $5$ only as $5 \times 1$.

Step 2: Try both orders and expand.
- $(2x + 5)(x + 1) = 2x^{2} + 2x + 5x + 5 = 2x^{2} + 7x + 5$. No.
- $(2x + 1)(x + 5) = 2x^{2} + 10x + x + 5 = 2x^{2} + 11x + 5$. Yes.

**Answer: D** ($(2x + 1)(x + 5)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: constants_assigned_to_wrong_binomials (uses the right four numbers but puts the 5 with the 2x; expanding gives 2x squared plus 7x plus 5, so the middle term is 7x rather than 11x)",
  "B": "Student makes misconception: leading_coefficient_ignored_in_factoring (factors as though there were no coefficient on x squared; expanding gives x squared plus 6x plus 5)",
  "C": "Student makes misconception: wrong_sign_on_factor (uses the correct arrangement but makes both constants negative; expanding gives 2x squared minus 11x plus 5)",
  "D": "Correct: the 5 pairs with the 2x to give 10x and the 1 pairs with the x to give x, and 10x plus x is the required 11x"
},
"misconception_tag": {
  "A": "constants_assigned_to_wrong_binomials",
  "B": "leading_coefficient_ignored_in_factoring",
  "C": "wrong_sign_on_factor"
}
```

---

**Item 4: Which expression is the factored form of $25x^{2} - 4$?**

Step 1: No middle term, negative sign. Difference of squares.

Step 2: Square root each piece including the coefficient. $\sqrt{25x^{2}} = 5x$ and $\sqrt{4} = 2$.

Step 3: One minus, one plus.
- $(5x - 2)(5x + 2)$

Step 4: Check. $25x^{2} + 10x - 10x - 4 = 25x^{2} - 4$. Match.

**Answer: A** ($(5x - 2)(5x + 2)$)

```json
"distractor_logic": {
  "A": "Correct: the square roots are 5x and 2, and the difference-of-squares arrangement cancels the two middle terms",
  "B": "Student makes misconception: perfect_square_vs_difference_of_squares (makes both brackets negative; expanding gives 25x squared minus 20x plus 4, which has a middle term the original lacks)",
  "C": "Student makes misconception: leading_coefficient_ignored_in_factoring (takes the square root of 4 but not of 25, deleting the coefficient; expanding gives x squared minus 4)",
  "D": "Student makes misconception: constants_assigned_to_wrong_binomials (splits the 25 as 25 times 1 and places the constants without checking; expanding gives 25x squared plus 48x minus 4)"
},
"misconception_tag": {
  "B": "perfect_square_vs_difference_of_squares",
  "C": "leading_coefficient_ignored_in_factoring",
  "D": "constants_assigned_to_wrong_binomials"
}
```
