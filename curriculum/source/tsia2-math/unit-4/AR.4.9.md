---
topic_name: "Solving radical equations"
unit_number: 4
sequence_in_unit: 17
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Advanced"
related_strand: "AR"
keywords: ["radical equation", "squaring both sides", "extraneous solution", "isolating the radical", "checking solutions"]
---

# AR.4.9 - Solving Radical Equations

**Topic ID:** AR.4.9  
**Unit:** 4  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Squaring Undoes a Square Root

A square root traps the variable underneath it. Squaring both sides lets it out.

$$\sqrt{x + 3} = 4$$

Step 1: Square both sides. On the left the root and the square cancel, leaving what was underneath.

$$x + 3 = 16$$

Step 2: Solve normally. $x = 13$.

Step 3: Check in the **original** equation. $\sqrt{13 + 3} = \sqrt{16} = 4$. Correct.

That check is not optional here, and the reason is the whole rest of this topic.

##### Isolate the Radical First

$$\sqrt{x} + 3 = 7$$

The radical is not alone. Squaring now would square the whole left side, and $(\sqrt{x} + 3)^{2}$ is not $x + 9$.

Step 1: Get the radical by itself. Subtract $3$.

$$\sqrt{x} = 4$$

Step 2: Now square. $x = 16$.

Step 3: Check. $\sqrt{16} + 3 = 4 + 3 = 7$. Correct.

**Squaring before isolating gives a different, wrong answer.** Doing it here would give $x + 9 = 49$ and $x = 40$, and $\sqrt{40} + 3$ is about $9.3$, not $7$.

##### Squaring a Two-Term Side Has Three Terms

When the other side is a binomial, squaring it needs the full expansion.

$$\sqrt{x + 7} = x + 1$$

Step 1: Square both sides. The right side is $(x + 1)^{2}$, which is $x^{2} + 2x + 1$, **not** $x^{2} + 1$.

$$x + 7 = x^{2} + 2x + 1$$

Step 2: Rearrange to standard form. $0 = x^{2} + x - 6$.

Step 3: Factor and solve. $(x + 3)(x - 2) = 0$, so $x = -3$ or $x = 2$.

Step 4: Check both, in the original.

- $x = 2$: $\sqrt{9} = 3$ and $2 + 1 = 3$. **Valid.**
- $x = -3$: $\sqrt{4} = 2$ and $-3 + 1 = -2$. **Not valid**, because $2 \neq -2$.

So the answer is $x = 2$ only.

##### The Mistake That Costs the Most Points

**Not checking, and reporting both roots.**

The quadratic in the example above genuinely has two solutions. But it is the quadratic's equation, not the original one. Squaring created a solution that the original never had.

Why: squaring destroys sign information. $2$ and $-2$ are different numbers, but their squares are identical. So when you square, an equation that was false because two sides had opposite signs becomes true, and a value that never solved the original arrives looking like a solution.

**A square root is never negative.** $\sqrt{4}$ is $2$, not $-2$. So if the other side of the equation comes out negative when you substitute, that value cannot be a solution no matter what the algebra said.

**The fix is a habit with a fixed place in the procedure.** Checking is not something you do if you have time. It is step four of four, every time:

1. Isolate the radical.
2. Square both sides.
3. Solve.
4. **Substitute every candidate into the original equation.**

##### Not Every Second Root Is Extraneous

This is the other half of the error, and it costs just as much.

Having learned that squaring can create false solutions, students start discarding a root on suspicion. Sometimes **both** roots are genuine, and throwing one away loses a real answer.

The check decides, not the pattern. A candidate is extraneous only when substituting it into the original **fails**. If it works, it stays, however suspicious it looked.

$$\sqrt{x + 11} = x - 1$$

Squaring gives $x + 11 = x^{2} - 2x + 1$, so $x^{2} - 3x - 10 = 0$ and $(x - 5)(x + 2) = 0$.

- $x = 5$: $\sqrt{16} = 4$ and $5 - 1 = 4$. **Valid.**
- $x = -2$: $\sqrt{9} = 3$ and $-2 - 1 = -3$. **Not valid.**

Here one survives. In a different equation both might. **Substitute both and let the arithmetic decide.**

##### Squaring Is Not Doubling

$$(\sqrt{x})^{2} = x, \qquad \text{not } 2\sqrt{x}$$

$$5^{2} = 25, \qquad \text{not } 10$$

Squaring multiplies a quantity by itself. Doubling adds it to itself. They agree only at $0$ and $2$, and nowhere else, so an answer built on doubling is wrong everywhere that matters.

##### The Five Traps

1. **Not checking the candidates.** Squaring can invent solutions the original never had. Substituting is step four, always.
2. **Discarding a valid root on suspicion.** Extraneous means it failed the check, not that it looked odd. Both roots can be genuine.
3. **Squaring before isolating.** Get the radical alone first, or you square a sum and change the problem.
4. **Expanding a squared binomial as two terms.** $(x + 1)^{2}$ is $x^{2} + 2x + 1$, never $x^{2} + 1$.
5. **Confusing squaring with doubling.** $(\sqrt{x})^{2}$ is $x$. $5^{2}$ is $25$.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Solve $\sqrt{x + 3} = 4$.
   - A) $x = 1$
   - B) $x = 13$
   - C) $x = 19$
   - D) $x = 5$

2. Solve $\sqrt{x - 5} = 3$.
   - A) $x = 4$
   - B) $x = 8$
   - C) $x = 14$
   - D) $x = 11$

3. Solve $\sqrt{x} = 7$.
   - A) $x = 49$
   - B) $x = 14$
   - C) $x = 7$
   - D) $x = 3.5$

4. Solve $\sqrt{2x + 1} = 5$.
   - A) $x = 2$
   - B) $x = 24$
   - C) $x = 13$
   - D) $x = 12$

**Proficient Level**

5. Solve $\sqrt{x + 7} = x + 1$.
   - A) $x = -3$ and $x = 2$
   - B) $x = 2$
   - C) $x = -3$
   - D) There is no solution

6. Solve $\sqrt{3x + 4} = x$.
   - A) $x = -1$ and $x = 4$
   - B) $x = -1$
   - C) $x = 4$
   - D) There is no solution

7. Solve $\sqrt{x + 5} + 2 = 6$.
   - A) $x = 11$
   - B) $x = 31$
   - C) $x = 27$
   - D) $x = 1$

**Advanced Level**

8. Solve $\sqrt{x - 1} = x - 3$.
   - A) $x = 2$ and $x = 5$
   - B) $x = 2$
   - C) There is no solution
   - D) $x = 5$

9. Solve $\sqrt{x + 11} = x - 1$.
   - A) $x = -2$ and $x = 5$
   - B) $x = 5$
   - C) $x = -2$
   - D) There is no solution

10. Solve $\sqrt{x} + 3 = 7$.
    - A) $x = 40$
    - B) $x = 4$
    - C) $x = 16$
    - D) $x = 100$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

Solve $\sqrt{x + 2} = 5$.

- A) $x = 3$
- B) $x = 23$
- C) $x = 27$
- D) $x = 7$

**Item 2**

Solve $\sqrt{x - 4} = 6$.

- A) $x = 40$
- B) $x = 32$
- C) $x = 10$
- D) $x = 2$

**Item 3**

Solve $\sqrt{x + 6} = x$.

- A) $x = -2$ and $x = 3$
- B) $x = -2$
- C) $x = 3$
- D) There is no solution

**Item 4**

Solve $\sqrt{x} - 2 = 3$.

- A) $x = 1$
- B) $x = 5$
- C) $x = 10$
- D) $x = 25$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Solve $\sqrt{x + 3} = 4$.**

Step 1: The radical is already isolated, so square both sides. $x + 3 = 16$.

Step 2: Solve. $x = 13$.

Step 3: Check in the original. $\sqrt{13 + 3} = \sqrt{16} = 4$. Correct.

**Answer: B** ($x = 13$)

```json
"distractor_logic": {
  "A": "Student makes misconception: squaring_confused_with_doubling (doubles the 4 rather than squaring it, giving x + 3 = 8 and x = 5, then subtracts again to reach 1)",
  "B": "Correct: squaring gives x + 3 = 16, so x = 13, and substituting back gives root 16 = 4",
  "C": "Student makes misconception: wrong_sign_on_factor (adds the 3 rather than subtracting it after squaring, giving 16 plus 3 = 19; substituting 19 gives root 22, not 4)",
  "D": "Student makes misconception: squaring_confused_with_doubling (doubles the 4 to get 8, giving x + 3 = 8 and x = 5; substituting 5 gives root 8, which is about 2.8)"
},
"misconception_tag": {
  "A": "squaring_confused_with_doubling",
  "C": "wrong_sign_on_factor",
  "D": "squaring_confused_with_doubling"
}
```

---

**2. Solve $\sqrt{x - 5} = 3$.**

Step 1: Square both sides. $x - 5 = 9$.

Step 2: Solve. $x = 14$.

Step 3: Check. $\sqrt{14 - 5} = \sqrt{9} = 3$. Correct.

**Answer: C** ($x = 14$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_sign_on_factor (subtracts the 5 rather than adding it after squaring, giving 9 minus 5 = 4; substituting 4 gives the root of -1, which is not real)",
  "B": "Student makes misconception: squaring_confused_with_doubling (doubles the 3 rather than squaring it, giving x - 5 = 6 and x = 11, then mishandles the constant to reach 8)",
  "C": "Correct: squaring gives x - 5 = 9, so x = 14, and substituting back gives root 9 = 3",
  "D": "Student makes misconception: squaring_confused_with_doubling (doubles the 3 to get 6, giving x - 5 = 6 and x = 11; substituting 11 gives root 6, which is about 2.4)"
},
"misconception_tag": {
  "A": "wrong_sign_on_factor",
  "B": "squaring_confused_with_doubling",
  "D": "squaring_confused_with_doubling"
}
```

---

**3. Solve $\sqrt{x} = 7$.**

Step 1: Square both sides. $x = 49$.

Step 2: Check. $\sqrt{49} = 7$. Correct.

**Answer: A** ($x = 49$)

```json
"distractor_logic": {
  "A": "Correct: squaring both sides gives x = 49, and the root of 49 is 7",
  "B": "Student makes misconception: squaring_confused_with_doubling (doubles the 7 rather than squaring it; the root of 14 is about 3.7, not 7)",
  "C": "Student makes misconception: false_radical_distribution (treats the root sign as having no effect and reports the right side unchanged; the root of 7 is about 2.6)",
  "D": "Student makes misconception: false_radical_distribution (treats the square root as a division by two, halving the 7; the root of 3.5 is about 1.9)"
},
"misconception_tag": {
  "B": "squaring_confused_with_doubling",
  "C": "false_radical_distribution",
  "D": "false_radical_distribution"
}
```

---

**4. Solve $\sqrt{2x + 1} = 5$.**

Step 1: Square both sides. $2x + 1 = 25$.

Step 2: Subtract $1$. $2x = 24$.

Step 3: Divide by $2$. $x = 12$.

Step 4: Check. $\sqrt{24 + 1} = \sqrt{25} = 5$. Correct.

**Answer: D** ($x = 12$)

```json
"distractor_logic": {
  "A": "Student makes misconception: squaring_confused_with_doubling (doubles the 5 rather than squaring it, giving 2x + 1 = 10 and then mishandling the division to reach 2)",
  "B": "Student makes misconception: false_radical_distribution (squares correctly to 2x + 1 = 25 and subtracts the 1 but never divides by the 2, reporting the numerator 24)",
  "C": "Student makes misconception: wrong_sign_on_factor (divides by 2 before subtracting the 1, giving 25 over 2 then subtracting, which lands on 13 rather than 12)",
  "D": "Correct: squaring gives 2x + 1 = 25, so 2x = 24 and x = 12, and substituting back gives root 25 = 5"
},
"misconception_tag": {
  "A": "squaring_confused_with_doubling",
  "B": "false_radical_distribution",
  "C": "wrong_sign_on_factor"
}
```

---

**Proficient Level**

**5. Solve $\sqrt{x + 7} = x + 1$.**

Step 1: Square both sides, expanding the binomial in full. $(x + 1)^{2} = x^{2} + 2x + 1$.

$$x + 7 = x^{2} + 2x + 1$$

Step 2: Rearrange. $x^{2} + x - 6 = 0$.

Step 3: Factor. $(x + 3)(x - 2) = 0$, so the candidates are $-3$ and $2$.

Step 4: Check both in the original.
- $x = 2$: $\sqrt{9} = 3$ and $2 + 1 = 3$. Valid.
- $x = -3$: $\sqrt{4} = 2$ and $-3 + 1 = -2$. Not valid, since a square root is never negative.

**Answer: B** ($x = 2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: extraneous_root_not_checked (reports both candidates from the quadratic without substituting either; x = -3 gives root 4 = 2 on the left and -2 on the right, so it solves the squared equation but not the original)",
  "B": "Correct: both candidates are checked, and only x = 2 satisfies the original equation",
  "C": "Student makes misconception: valid_root_discarded_as_extraneous (keeps the candidate that fails the check and discards the one that passes, reversing which root was extraneous)",
  "D": "Student makes misconception: valid_root_discarded_as_extraneous (having learned that squaring can invent solutions, discards both candidates on suspicion; x = 2 checks out and is a genuine solution)"
},
"misconception_tag": {
  "A": "extraneous_root_not_checked",
  "C": "valid_root_discarded_as_extraneous",
  "D": "valid_root_discarded_as_extraneous"
}
```

---

**6. Solve $\sqrt{3x + 4} = x$.**

Step 1: Square both sides. $3x + 4 = x^{2}$.

Step 2: Rearrange. $x^{2} - 3x - 4 = 0$.

Step 3: Factor. $(x - 4)(x + 1) = 0$, so the candidates are $4$ and $-1$.

Step 4: Check both.
- $x = 4$: $\sqrt{16} = 4$ and the right side is $4$. Valid.
- $x = -1$: $\sqrt{1} = 1$ and the right side is $-1$. Not valid.

**Answer: C** ($x = 4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: extraneous_root_not_checked (reports both roots of the quadratic without substituting; x = -1 gives 1 on the left and -1 on the right)",
  "B": "Student makes misconception: valid_root_discarded_as_extraneous (keeps the failing candidate and discards the passing one, so the answer reported is precisely the extraneous root)",
  "C": "Correct: both candidates are checked, and only x = 4 satisfies the original equation",
  "D": "Student makes misconception: valid_root_discarded_as_extraneous (discards both candidates because one was extraneous, when x = 4 passes the check and is genuine)"
},
"misconception_tag": {
  "A": "extraneous_root_not_checked",
  "B": "valid_root_discarded_as_extraneous",
  "D": "valid_root_discarded_as_extraneous"
}
```

---

**7. Solve $\sqrt{x + 5} + 2 = 6$.**

Step 1: Isolate the radical. Subtract $2$ from both sides. $\sqrt{x + 5} = 4$.

Step 2: Square. $x + 5 = 16$.

Step 3: Solve. $x = 11$.

Step 4: Check. $\sqrt{16} + 2 = 4 + 2 = 6$. Correct.

**Answer: A** ($x = 11$)

```json
"distractor_logic": {
  "A": "Correct: isolating gives root of (x + 5) = 4, squaring gives x + 5 = 16, so x = 11",
  "B": "Student makes misconception: squares_before_isolating (squares before subtracting the 2, giving x + 5 + 4 = 36 and x = 27, then mishandles the constant to reach 31)",
  "C": "Student makes misconception: squares_before_isolating (squares both sides while the 2 is still there, treating the left as x + 5 + 4 = 36, which gives x = 27; substituting 27 gives root 32 plus 2, about 7.7, not 6)",
  "D": "Student makes misconception: squaring_confused_with_doubling (doubles the isolated 4 rather than squaring it, giving x + 5 = 8 and x = 3, then mishandles to reach 1)"
},
"misconception_tag": {
  "B": "squares_before_isolating",
  "C": "squares_before_isolating",
  "D": "squaring_confused_with_doubling"
}
```

---

**Advanced Level**

**8. Solve $\sqrt{x - 1} = x - 3$.**

Step 1: Square both sides, expanding fully. $(x - 3)^{2} = x^{2} - 6x + 9$.

$$x - 1 = x^{2} - 6x + 9$$

Step 2: Rearrange. $x^{2} - 7x + 10 = 0$.

Step 3: Factor. $(x - 2)(x - 5) = 0$, so the candidates are $2$ and $5$.

Step 4: Check both.
- $x = 5$: $\sqrt{4} = 2$ and $5 - 3 = 2$. Valid.
- $x = 2$: $\sqrt{1} = 1$ and $2 - 3 = -1$. Not valid.

**Answer: D** ($x = 5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: extraneous_root_not_checked (reports both roots of the quadratic; x = 2 gives 1 on the left and -1 on the right, so it fails the original)",
  "B": "Student makes misconception: valid_root_discarded_as_extraneous (keeps the failing candidate and discards the passing one, reporting exactly the extraneous root)",
  "C": "Student makes misconception: valid_root_discarded_as_extraneous (discards both candidates on the assumption that a squared equation must have produced false solutions, when x = 5 checks out)",
  "D": "Correct: both candidates are checked, and only x = 5 satisfies the original equation"
},
"misconception_tag": {
  "A": "extraneous_root_not_checked",
  "B": "valid_root_discarded_as_extraneous",
  "C": "valid_root_discarded_as_extraneous"
}
```

---

**9. Solve $\sqrt{x + 11} = x - 1$.**

Step 1: Square both sides. $(x - 1)^{2} = x^{2} - 2x + 1$.

$$x + 11 = x^{2} - 2x + 1$$

Step 2: Rearrange. $x^{2} - 3x - 10 = 0$.

Step 3: Factor. $(x - 5)(x + 2) = 0$, so the candidates are $5$ and $-2$.

Step 4: Check both.
- $x = 5$: $\sqrt{16} = 4$ and $5 - 1 = 4$. Valid.
- $x = -2$: $\sqrt{9} = 3$ and $-2 - 1 = -3$. Not valid.

**Answer: B** ($x = 5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: extraneous_root_not_checked (reports both roots of the quadratic without substituting; x = -2 gives 3 on the left and -3 on the right)",
  "B": "Correct: both candidates are checked, and only x = 5 satisfies the original equation",
  "C": "Student makes misconception: valid_root_discarded_as_extraneous (reports the failing candidate and discards the passing one)",
  "D": "Student makes misconception: binomial_square_middle_term_omitted (expands the right side as x squared plus 1 with no middle term, giving x + 11 = x squared + 1 and x squared - x - 10 = 0, which has no whole-number roots, so the student concludes there is no solution)"
},
"misconception_tag": {
  "A": "extraneous_root_not_checked",
  "C": "valid_root_discarded_as_extraneous",
  "D": "binomial_square_middle_term_omitted"
}
```

---

**10. Solve $\sqrt{x} + 3 = 7$.**

Step 1: Isolate the radical. $\sqrt{x} = 4$.

Step 2: Square. $x = 16$.

Step 3: Check. $\sqrt{16} + 3 = 4 + 3 = 7$. Correct.

**Answer: C** ($x = 16$)

```json
"distractor_logic": {
  "A": "Student makes misconception: squares_before_isolating (squares while the 3 is still on the left, treating it as x + 9 = 49 and giving x = 40; substituting 40 gives root 40 plus 3, about 9.3, not 7)",
  "B": "Student makes misconception: squaring_confused_with_doubling (isolates correctly to root x = 4 but halves rather than squares, giving x = 4; substituting 4 gives 2 plus 3 = 5)",
  "C": "Correct: isolating gives root x = 4, and squaring gives x = 16",
  "D": "Student makes misconception: squares_before_isolating (squares the 7 and the 3 separately, reaching 100 by treating the left side as a single squared quantity)"
},
"misconception_tag": {
  "A": "squares_before_isolating",
  "B": "squaring_confused_with_doubling",
  "D": "squares_before_isolating"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Solve $\sqrt{x + 2} = 5$.**

Step 1: Square both sides. $x + 2 = 25$.

Step 2: Solve. $x = 23$.

Step 3: Check. $\sqrt{25} = 5$. Correct.

**Answer: B** ($x = 23$)

```json
"distractor_logic": {
  "A": "Student makes misconception: squaring_confused_with_doubling (doubles the 5 rather than squaring it, giving x + 2 = 10 and x = 8, then mishandles the constant to reach 3)",
  "B": "Correct: squaring gives x + 2 = 25, so x = 23, and substituting back gives root 25 = 5",
  "C": "Student makes misconception: wrong_sign_on_factor (adds the 2 rather than subtracting it after squaring, giving 25 plus 2 = 27; substituting 27 gives root 29, not 5)",
  "D": "Student makes misconception: squaring_confused_with_doubling (doubles the 5 to get 10, giving x + 2 = 10 and x = 8, reported here after a further slip as 7)"
},
"misconception_tag": {
  "A": "squaring_confused_with_doubling",
  "C": "wrong_sign_on_factor",
  "D": "squaring_confused_with_doubling"
}
```

---

**Item 2: Solve $\sqrt{x - 4} = 6$.**

Step 1: Square both sides. $x - 4 = 36$.

Step 2: Solve. $x = 40$.

Step 3: Check. $\sqrt{36} = 6$. Correct.

**Answer: A** ($x = 40$)

```json
"distractor_logic": {
  "A": "Correct: squaring gives x - 4 = 36, so x = 40, and substituting back gives root 36 = 6",
  "B": "Student makes misconception: wrong_sign_on_factor (subtracts the 4 rather than adding it after squaring, giving 36 minus 4 = 32; substituting 32 gives root 28, about 5.3)",
  "C": "Student makes misconception: squaring_confused_with_doubling (doubles the 6 rather than squaring it, giving x - 4 = 12 and x = 16, then mishandles the constant to reach 10)",
  "D": "Student makes misconception: false_radical_distribution (treats the square root as a division by two, giving x - 4 = 3 and x = 7, reported here after a further slip as 2)"
},
"misconception_tag": {
  "B": "wrong_sign_on_factor",
  "C": "squaring_confused_with_doubling",
  "D": "false_radical_distribution"
}
```

---

**Item 3: Solve $\sqrt{x + 6} = x$.**

Step 1: Square both sides. $x + 6 = x^{2}$.

Step 2: Rearrange. $x^{2} - x - 6 = 0$.

Step 3: Factor. $(x - 3)(x + 2) = 0$, so the candidates are $3$ and $-2$.

Step 4: Check both.
- $x = 3$: $\sqrt{9} = 3$ and the right side is $3$. Valid.
- $x = -2$: $\sqrt{4} = 2$ and the right side is $-2$. Not valid.

**Answer: C** ($x = 3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: extraneous_root_not_checked (reports both roots of the quadratic without substituting; x = -2 gives 2 on the left and -2 on the right)",
  "B": "Student makes misconception: valid_root_discarded_as_extraneous (keeps the failing candidate and discards the passing one, so the answer given is the extraneous root itself)",
  "C": "Correct: both candidates are checked, and only x = 3 satisfies the original equation",
  "D": "Student makes misconception: valid_root_discarded_as_extraneous (discards both candidates because squaring was involved, when x = 3 passes the check)"
},
"misconception_tag": {
  "A": "extraneous_root_not_checked",
  "B": "valid_root_discarded_as_extraneous",
  "D": "valid_root_discarded_as_extraneous"
}
```

---

**Item 4: Solve $\sqrt{x} - 2 = 3$.**

Step 1: Isolate the radical. $\sqrt{x} = 5$.

Step 2: Square. $x = 25$.

Step 3: Check. $\sqrt{25} - 2 = 5 - 2 = 3$. Correct.

**Answer: D** ($x = 25$)

```json
"distractor_logic": {
  "A": "Student makes misconception: squares_before_isolating (squares while the -2 is still on the left, treating it as x + 4 = 9 and giving x = 5, then mishandles to reach 1)",
  "B": "Student makes misconception: squares_before_isolating (squares both sides before isolating, giving x + 4 = 9 and x = 5; substituting 5 gives root 5 minus 2, about 0.24, not 3)",
  "C": "Student makes misconception: squaring_confused_with_doubling (isolates correctly to root x = 5 but doubles rather than squares, giving x = 10; substituting 10 gives root 10 minus 2, about 1.2)",
  "D": "Correct: isolating gives root x = 5, and squaring gives x = 25"
},
"misconception_tag": {
  "A": "squares_before_isolating",
  "B": "squares_before_isolating",
  "C": "squaring_confused_with_doubling"
}
```
