---
topic_name: "Direct variation"
unit_number: 1
sequence_in_unit: 12
assessment_layer: "ENRICHMENT"
estimated_time_minutes: 45
difficulty_band: "Proficient"
related_strand: "QR"
keywords: ["direct variation", "constant of variation", "proportional", "inverse variation", "varies directly", "constant ratio"]
---

# QR.2.8 - Direct Variation

**Topic ID:** QR.2.8  
**Unit:** 1  
**Strand:** QR (Quantitative Reasoning)  
**Assessment Layer:** ENRICHMENT  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### A Name for Something You Already Do

Direct variation is the formal name for the proportional reasoning you have been doing since QR.2.1. Nothing new is being asked of you. A vocabulary is being attached to it.

**$y$ varies directly with $x$** means

$$y = kx$$

for some fixed number $k$, called the **constant of variation**. That is it. Double $x$ and $y$ doubles. Triple $x$ and $y$ triples. Exactly the ratio behaviour from QR.2.1, written as an equation.

And because $y = kx$ rearranges to

$$k = \frac{y}{x}$$

the constant of variation is just the **ratio of $y$ to $x$**, and it is the same for every pair. That second form is the one that does the work on the test.

**To find $k$, divide $y$ by $x$.** Not the other way round, and not the difference between them.

---

##### The Mistake That Costs the Most Points

You check for a constant **difference** instead of a constant **ratio**.

Suppose $x$ goes 2, 4, 6 and $y$ goes 5, 7, 9. Is that direct variation?

It looks orderly. Every time $x$ goes up by 2, $y$ goes up by 2. Something is clearly constant. But the ratios are

$$\frac{5}{2} = 2.5, \qquad \frac{7}{4} = 1.75, \qquad \frac{9}{6} = 1.5$$

and those are not equal. This is **not** direct variation.

Here is the cleanest way to see it. Direct variation demands that when $x$ is zero, $y$ is zero, because $y = k \cdot 0 = 0$. Follow that table back: at $x = 0$ you would have $y = 3$. Something is there when there should be nothing, so the relationship cannot be proportional.

That gives you a fast real-world filter. **A flat fee breaks direct variation.** A taxi that charges \$3 plus \$2 per mile is not direct variation, because a zero-mile ride still costs \$3. A worker paid \$15 an hour with no base is direct variation, because zero hours pays zero.

Constant difference means *linear*. Constant ratio means *direct variation*. Every direct variation is linear, but most linear relationships are not direct variations.

---

##### Finding and Using $k$

**Example 1:** $y$ varies directly with $x$, and $y = 20$ when $x = 5$. Find $y$ when $x = 9$.

- Step 1: Find $k$. $k = \frac{20}{5} = 4$.
- Step 2: Write the equation. $y = 4x$.
- Step 3: Substitute. $y = 4 \times 9 = 36$.

Two errors live in step 1 and they are both about grabbing the wrong number.

Taking $k = 20$ uses the $y$ value itself rather than the ratio, and gives $y = 180$, which is wildly too big. Taking $k = 20 - 5 = 15$ uses the difference, and gives $y = 24$.

**Check your $k$ against the pair you were given.** If $k = 4$, then $4 \times 5$ should return 20. It does. If $k = 20$, then $20 \times 5 = 100$, not 20, so that $k$ was wrong before you ever used it.

---

##### Running It Backward

**Example 2:** $y$ varies directly with $x$. When $x = 8$, $y = 20$. Find $x$ when $y = 35$.

Same first move.

- $k = \frac{20}{8} = 2.5$, so $y = 2.5x$.
- Now $35 = 2.5x$, so $x = 35 \div 2.5 = 14$.

Solving for $x$ divides where solving for $y$ multiplied. Multiplying by mistake gives $35 \times 2.5 = 87.5$, and the direction check kills it: $y$ went from 20 up to 35, so $x$ must rise from 8 by the same proportion, to 14. It cannot jump to 87.5.

---

##### The Shortcut Worth Knowing

You often do not need $k$ at all.

If $x$ triples, $y$ triples. If $x$ rises by $20\%$, $y$ rises by $20\%$. The constant cancels out:

$$\frac{y_2}{y_1} = \frac{kx_2}{kx_1} = \frac{x_2}{x_1}$$

So $y = 18$ when $x = 4.5$, and $x$ is tripled, means $y = 18 \times 3 = 54$. No $k$ required.

This is worth having because percent-change questions about direct variation are otherwise fiddly, and the answer is almost always "the same percent."

---

##### When It Is Not Direct

**Example 3:** A job takes 6 workers 10 days. How long for 15 workers?

More workers, **fewer** days. As one goes up the other goes down, so this is not direct variation at all. It is **inverse** variation, where the *product* is constant rather than the ratio:

$$xy = k$$

- $6 \times 10 = 60$ worker-days of labour in the job.
- $60 \div 15 = 4$ days.

Treating it as direct gives $10 \times \frac{15}{6} = 25$ days, which says adding workers makes the job take longer. **Ask which direction the second quantity moves before you pick a model.** Same direction is direct. Opposite directions is inverse.

---

##### Varying With a Power

Sometimes $y$ varies directly with the **square** of $x$, written $y = kx^2$. The method does not change; the thing you divide by does.

**Example 4:** $y$ varies directly with the square of $x$, and $y = 45$ when $x = 3$. Find $y$ when $x = 6$.

- $k = \frac{45}{3^2} = \frac{45}{9} = 5$
- $y = 5 \times 6^2 = 5 \times 36 = 180$

Doubling $x$ did not double $y$; it quadrupled it, because the 6 gets squared before the constant touches it. Answering 90 is the reflex of assuming the doubling carries straight through, and it is exactly the error the item is built to catch.

---

##### The Four Traps

1. **Testing for a constant difference.** Divide, do not subtract. And check that $x = 0$ would give $y = 0$.
2. **Using the $y$ value as $k$.** $k$ is the ratio. Test it against the pair you were given.
3. **Multiplying when solving for $x$.** Finding $y$ multiplies by $k$; finding $x$ divides by it.
4. **Forcing a direct model onto an inverse relationship.** If one quantity falls as the other rises, the product is constant, not the ratio.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. If $y$ varies directly with $x$, and $y = 12$ when $x = 3$, what is the constant of variation?
   - A) $4$
   - B) $12$
   - C) $0.25$
   - D) $9$

2. If $y$ varies directly with $x$, and $y = 20$ when $x = 5$, what is $y$ when $x = 9$?
   - A) $24$
   - B) $180$
   - C) $36$
   - D) $11.1$

3. The cost of apples varies directly with the weight purchased. If $4$ pounds cost \$6, what do $10$ pounds cost?
   - A) \$60
   - B) \$12
   - C) \$6.67
   - D) \$15

4. Which equation represents a direct variation?
   - A) $y = 5x + 3$
   - B) $y = \frac{5}{x}$
   - C) $y = 5x$
   - D) $y = 5$

**Proficient Level** (these require an extra step)

5. If $y$ varies directly with $x$, and $y = 20$ when $x = 8$, what is $x$ when $y = 35$?
   - A) $87.5$
   - B) $23$
   - C) $1.75$
   - D) $14$

6. A relationship contains the pairs $(2, 7)$, $(5, 17.5)$ and $(9, 31.5)$. Does $y$ vary directly with $x$, and if so what is the constant of variation?
   - A) Yes, with $k = 3.5$
   - B) Yes, with $k = 7$
   - C) No, because the differences between consecutive $y$ values are not constant
   - D) Yes, with $k = 0.286$

7. A job takes $6$ workers $10$ days. Working at the same rate each, how long would $15$ workers take?
   - A) $25$ days
   - B) $60$ days
   - C) $4$ days
   - D) $1$ day

**Advanced Level** (these need multiple steps or reverse thinking)

8. If $y$ varies directly with the square of $x$, and $y = 45$ when $x = 3$, what is $y$ when $x = 6$?
   - A) $90$
   - B) $180$
   - C) $540$
   - D) $1620$

9. If $y$ varies directly with $x$ and the value of $x$ increases by $20\%$, what happens to $y$?
   - A) It increases by $120\%$.
   - B) It increases by $20\%$.
   - C) It increases by $40\%$.
   - D) It decreases by $20\%$.

10. If $y$ varies directly with $x$, and $y = 18$ when $x = 4.5$, what is $y$ when $x$ is tripled?
    - A) $27$
    - B) $243$
    - C) $6$
    - D) $54$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

If $y$ varies directly with $x$, and $y = 21$ when $x = 7$, what is the constant of variation?

- A) $3$
- B) $21$
- C) $14$
- D) $0.33$

**Item 2**

If $y$ varies directly with $x$, and $y = 24$ when $x = 6$, what is $y$ when $x = 10$?

- A) $28$
- B) $40$
- C) $240$
- D) $14.4$

**Item 3**

Which equation represents a direct variation?

- A) $y = 7x - 1$
- B) $y = \frac{7}{x}$
- C) $y = 7x$
- D) $y = 7$

**Proficient Level**

**Item 4**

Six machines can fill an order in $8$ hours. Working at the same rate each, how long would $12$ machines take?

- A) $16$ hours
- B) $4$ hours
- C) $48$ hours
- D) $2$ hours

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. If $y$ varies directly with $x$, and $y = 12$ when $x = 3$, what is the constant of variation?**

Step 1: The constant of variation is the ratio of $y$ to $x$.
- $k = \frac{12}{3} = 4$

Step 2: Test it against the pair given. $4 \times 3 = 12$. Correct.

**Answer: A** ($4$)

```json
"distractor_logic": {
  "A": "Correct: divides y by x to get a constant of variation of 4, which returns 12 when multiplied by the given x of 3",
  "B": "Student makes misconception: first_value_as_constant_of_variation (takes the y value of 12 as the constant itself rather than computing the ratio)",
  "C": "Student makes misconception: reversed_division (divides x by y instead of y by x, producing 0.25)",
  "D": "Student makes misconception: constant_difference_as_direct_variation (subtracts to get 12 minus 3 and treats that difference of 9 as the constant, when direct variation is defined by a constant ratio)"
},
"misconception_tag": {
  "B": "first_value_as_constant_of_variation",
  "C": "reversed_division",
  "D": "constant_difference_as_direct_variation"
}
```

---

**2. If $y$ varies directly with $x$, and $y = 20$ when $x = 5$, what is $y$ when $x = 9$?**

Step 1: Find $k$.
- $k = \frac{20}{5} = 4$

Step 2: Write the equation and substitute.
- $y = 4x$, so $y = 4 \times 9 = 36$

Step 3: Check. $x$ rose from 5 to 9, and $y$ rose from 20 to 36. Both grew by the same factor of $1.8$. Correct.

**Answer: C** ($36$)

```json
"distractor_logic": {
  "A": "Student makes misconception: constant_difference_as_direct_variation (treats the difference of 15 between y and x as constant and adds it to the new x, producing 24)",
  "B": "Student makes misconception: first_value_as_constant_of_variation (uses the y value of 20 as the constant and computes 20 times 9, producing 180)",
  "C": "Correct: divides 20 by 5 for a constant of 4, then multiplies by the new x of 9 to get 36",
  "D": "Student makes misconception: inverse_relationship_treated_as_direct (treats the product as constant instead of the ratio, computing 20 times 5 for 100 and dividing by 9 to get about 11.1, a value that falls when x rises)"
},
"misconception_tag": {
  "A": "constant_difference_as_direct_variation",
  "B": "first_value_as_constant_of_variation",
  "D": "inverse_relationship_treated_as_direct"
}
```

---

**3. The cost of apples varies directly with the weight purchased. If $4$ pounds cost \$6, what do $10$ pounds cost?**

Step 1: Find the constant of variation, which here is the price per pound.
- $k = \frac{6}{4} = 1.5$

Step 2: Multiply by the new weight.
- $1.5 \times 10 = 15$

Step 3: Check. More apples should cost more, and 10 pounds is 2.5 times 4 pounds, so the cost should be 2.5 times \$6. It is.

**Answer: D** (\$15)

```json
"distractor_logic": {
  "A": "Student makes misconception: first_value_as_constant_of_variation (uses the 6 dollar cost as the constant and computes 6 times 10, producing 60)",
  "B": "Student makes misconception: constant_difference_as_direct_variation (treats the relationship as a constant difference and adds the 6 pound gain in weight to the 6 dollar cost, producing 12)",
  "C": "Student makes misconception: reversed_division (divides 4 by 6 for a constant of about 0.667 and multiplies by 10, producing about 6.67, which is less than 4 pounds cost)",
  "D": "Correct: divides 6 by 4 for a price per pound of 1.5, then multiplies by 10 pounds to get 15"
},
"misconception_tag": {
  "A": "first_value_as_constant_of_variation",
  "B": "constant_difference_as_direct_variation",
  "C": "reversed_division"
}
```

---

**4. Which equation represents a direct variation?**

Step 1: Direct variation has the form $y = kx$, with nothing added and no other power of $x$.

Step 2: Test each against the rule that $x = 0$ must give $y = 0$.
- $y = 5x + 3$ gives $y = 3$ at $x = 0$, so it is linear but not proportional.
- $y = \frac{5}{x}$ has $y$ falling as $x$ rises, which is inverse variation.
- $y = 5x$ gives $y = 0$ at $x = 0$ and a constant ratio of 5. This is the one.
- $y = 5$ never changes at all, so $y$ does not vary with $x$.

**Answer: C** ($y = 5x$)

```json
"distractor_logic": {
  "A": "Student makes misconception: constant_difference_as_direct_variation (accepts a linear relationship as a direct variation, when the constant term of 3 means a zero x gives a non-zero y and the ratio is not constant)",
  "B": "Student makes misconception: inverse_relationship_treated_as_direct (reads an inverse variation, where the product is constant and y falls as x rises, as a direct one)",
  "C": "Correct: y = 5x has the form y = kx, passes through the origin, and holds a constant ratio of 5",
  "D": "Student makes misconception: first_value_as_constant_of_variation (picks the equation that displays the constant on its own, mistaking a fixed value of y for a constant of variation)"
},
"misconception_tag": {
  "A": "constant_difference_as_direct_variation",
  "B": "inverse_relationship_treated_as_direct",
  "D": "first_value_as_constant_of_variation"
}
```

---

**Proficient Level**

**5. If $y$ varies directly with $x$, and $y = 20$ when $x = 8$, what is $x$ when $y = 35$?**

Step 1: Find $k$.
- $k = \frac{20}{8} = 2.5$

Step 2: The equation is $y = 2.5x$, and this time $y$ is known.
- $35 = 2.5x$

Step 3: Solving for $x$ divides.
- $x = 35 \div 2.5 = 14$

Step 4: Check. $2.5 \times 14 = 35$. Correct, and $x$ rose from 8 to 14 as $y$ rose from 20 to 35, both by a factor of $1.75$.

**Answer: D** ($14$)

```json
"distractor_logic": {
  "A": "Student makes misconception: multiplies_instead_of_divides (multiplies 35 by the constant 2.5 instead of dividing, producing 87.5, far beyond the growth y showed)",
  "B": "Student makes misconception: constant_difference_as_direct_variation (treats the difference of 12 between y and x as constant and subtracts it from 35, producing 23)",
  "C": "Student makes misconception: first_value_as_constant_of_variation (uses the y value of 20 as the constant and divides 35 by it, producing 1.75)",
  "D": "Correct: divides 20 by 8 for a constant of 2.5, then divides 35 by 2.5 to get x equal to 14"
},
"misconception_tag": {
  "A": "multiplies_instead_of_divides",
  "B": "constant_difference_as_direct_variation",
  "C": "first_value_as_constant_of_variation"
}
```

---

**6. A relationship contains the pairs $(2, 7)$, $(5, 17.5)$ and $(9, 31.5)$. Does $y$ vary directly with $x$, and if so what is the constant of variation?**

Step 1: Direct variation means a constant ratio, so divide $y$ by $x$ for every pair.
- $\frac{7}{2} = 3.5$
- $\frac{17.5}{5} = 3.5$
- $\frac{31.5}{9} = 3.5$

Step 2: All three ratios agree, so it is a direct variation with $k = 3.5$.

Step 3: Check. $y = 3.5x$ gives $3.5 \times 2 = 7$, $3.5 \times 5 = 17.5$ and $3.5 \times 9 = 31.5$. All three pairs are reproduced.

**Answer: A** (Yes, with $k = 3.5$)

```json
"distractor_logic": {
  "A": "Correct: divides y by x for all three pairs, gets 3.5 every time, and confirms that y = 3.5x reproduces each pair",
  "B": "Student makes misconception: first_value_as_constant_of_variation (takes the first y value of 7 as the constant rather than the ratio, which would give 14 at x equal to 2)",
  "C": "Student makes misconception: constant_difference_as_direct_variation (tests for a constant difference between consecutive y values, finds a rise of 10.5 and then one of 14, and rejects a relationship whose ratios are in fact constant)",
  "D": "Student makes misconception: reversed_division (divides x by y instead of y by x, producing about 0.286, the reciprocal of the true constant)"
},
"misconception_tag": {
  "B": "first_value_as_constant_of_variation",
  "C": "constant_difference_as_direct_variation",
  "D": "reversed_division"
}
```

---

**7. A job takes $6$ workers $10$ days. Working at the same rate each, how long would $15$ workers take?**

Step 1: Check the direction first. More workers means fewer days, so the two quantities move oppositely. This is inverse variation, not direct.

Step 2: For inverse variation the product is constant.
- $6 \times 10 = 60$ worker-days in the job

Step 3: Divide by the new number of workers.
- $60 \div 15 = 4$ days

Step 4: Check. $15 \times 4 = 60$, the same total labour. Correct, and 4 days is less than 10, as more workers should give.

**Answer: C** ($4$ days)

```json
"distractor_logic": {
  "A": "Student makes misconception: inverse_relationship_treated_as_direct (scales the days up with the workers, computing 10 times 15/6 for 25 days, which claims that adding workers makes the job take longer)",
  "B": "Student makes misconception: answers_intermediate_value (computes the 60 worker-days of total labour and reports it as though it were the number of days)",
  "C": "Correct: recognises the inverse relationship, finds 60 worker-days, and divides by 15 workers for 4 days",
  "D": "Student makes misconception: constant_difference_as_direct_variation (treats the change as a constant difference, subtracting the 9 extra workers from the 10 days to get 1)"
},
"misconception_tag": {
  "A": "inverse_relationship_treated_as_direct",
  "B": "answers_intermediate_value",
  "D": "constant_difference_as_direct_variation"
}
```

---

**Advanced Level**

**8. If $y$ varies directly with the square of $x$, and $y = 45$ when $x = 3$, what is $y$ when $x = 6$?**

Step 1: The model is $y = kx^2$, so divide by the **square** of $x$ to find $k$.
- $k = \frac{45}{3^2} = \frac{45}{9} = 5$

Step 2: Substitute the new $x$, squaring it first.
- $y = 5 \times 6^2 = 5 \times 36 = 180$

Step 3: Check. $x$ doubled from 3 to 6, and $y$ went from 45 to 180, which is four times larger. Doubling the input quadruples the output when the square is involved. Correct.

**Answer: B** ($180$)

```json
"distractor_logic": {
  "A": "Student makes misconception: squaring_confused_with_doubling (sees x double from 3 to 6 and doubles y to 90, carrying the doubling straight through instead of squaring it)",
  "B": "Correct: divides 45 by 3 squared for a constant of 5, then multiplies by 6 squared to get 180",
  "C": "Student makes misconception: wrong_fractional_divisor_used (divides 45 by 3 rather than by 3 squared, reaching a constant of 15, then multiplies by 36 to get 540)",
  "D": "Student makes misconception: first_value_as_constant_of_variation (uses the y value of 45 as the constant and multiplies by 36, producing 1620)"
},
"misconception_tag": {
  "A": "squaring_confused_with_doubling",
  "C": "wrong_fractional_divisor_used",
  "D": "first_value_as_constant_of_variation"
}
```

---

**9. If $y$ varies directly with $x$ and the value of $x$ increases by $20\%$, what happens to $y$?**

Step 1: Use the shortcut. In $y = kx$, the constant cancels from a ratio of two cases.
- $\frac{y_2}{y_1} = \frac{kx_2}{kx_1} = \frac{x_2}{x_1}$

Step 2: $x$ became $1.20$ times larger, so $y$ becomes $1.20$ times larger.
- $y$ increases by $20\%$

Step 3: Check with numbers. If $k = 3$ and $x$ goes from 10 to 12, then $y$ goes from 30 to 36, and $\frac{6}{30} = 0.20$. Correct.

**Answer: B** (It increases by $20\%$.)

```json
"distractor_logic": {
  "A": "Student makes misconception: new_over_original_as_change (reports the 120 percent that y becomes of its old value rather than the 20 percent change)",
  "B": "Correct: the constant cancels from the ratio, so y grows by the same factor as x, an increase of 20 percent",
  "C": "Student makes misconception: percent_changes_added (adds the 20 percent to itself as though the increase applied twice, once through the constant and once through x, producing 40 percent)",
  "D": "Student makes misconception: inverse_relationship_treated_as_direct (treats the relationship as inverse and has y fall as x rises)"
},
"misconception_tag": {
  "A": "new_over_original_as_change",
  "C": "percent_changes_added",
  "D": "inverse_relationship_treated_as_direct"
}
```

---

**10. If $y$ varies directly with $x$, and $y = 18$ when $x = 4.5$, what is $y$ when $x$ is tripled?**

Step 1: Use the shortcut. Tripling $x$ triples $y$.
- $18 \times 3 = 54$

Step 2: Confirm the long way. $k = \frac{18}{4.5} = 4$, and the new $x$ is $4.5 \times 3 = 13.5$, so $y = 4 \times 13.5 = 54$. The two methods agree.

**Answer: D** ($54$)

```json
"distractor_logic": {
  "A": "Student makes misconception: constant_difference_as_direct_variation (treats the relationship as a constant difference and adds the 9 unit gain in x to the 18, producing 27)",
  "B": "Student makes misconception: first_value_as_constant_of_variation (uses the y value of 18 as the constant and multiplies by the new x of 13.5, producing 243)",
  "C": "Student makes misconception: inverse_relationship_treated_as_direct (divides y by 3 instead of multiplying, producing 6, so y falls while x rises)",
  "D": "Correct: tripling x triples y, giving 54, which the constant of 4 applied to the new x of 13.5 confirms"
},
"misconception_tag": {
  "A": "constant_difference_as_direct_variation",
  "B": "first_value_as_constant_of_variation",
  "C": "inverse_relationship_treated_as_direct"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: If $y$ varies directly with $x$, and $y = 21$ when $x = 7$, what is the constant of variation?**

Step 1: Divide $y$ by $x$.
- $k = \frac{21}{7} = 3$

Step 2: Test it. $3 \times 7 = 21$. Correct.

**Answer: A** ($3$)

```json
"distractor_logic": {
  "A": "Correct: divides 21 by 7 for a constant of 3, which returns 21 when multiplied by the given x of 7",
  "B": "Student makes misconception: first_value_as_constant_of_variation (takes the y value of 21 as the constant itself rather than computing the ratio)",
  "C": "Student makes misconception: constant_difference_as_direct_variation (subtracts to get 21 minus 7 and treats that difference of 14 as the constant)",
  "D": "Student makes misconception: reversed_division (divides x by y instead of y by x, producing about 0.33)"
},
"misconception_tag": {
  "B": "first_value_as_constant_of_variation",
  "C": "constant_difference_as_direct_variation",
  "D": "reversed_division"
}
```

---

**Item 2: If $y$ varies directly with $x$, and $y = 24$ when $x = 6$, what is $y$ when $x = 10$?**

Step 1: Find $k$.
- $k = \frac{24}{6} = 4$

Step 2: Substitute.
- $y = 4 \times 10 = 40$

Step 3: Check. $x$ rose from 6 to 10 and $y$ rose from 24 to 40, both by a factor of about $1.67$. Correct.

**Answer: B** ($40$)

```json
"distractor_logic": {
  "A": "Student makes misconception: constant_difference_as_direct_variation (treats the difference of 18 between y and x as constant and adds it to the new x, producing 28)",
  "B": "Correct: divides 24 by 6 for a constant of 4, then multiplies by the new x of 10 to get 40",
  "C": "Student makes misconception: first_value_as_constant_of_variation (uses the y value of 24 as the constant and computes 24 times 10, producing 240)",
  "D": "Student makes misconception: inverse_relationship_treated_as_direct (treats the product as constant, computing 24 times 6 for 144 and dividing by 10 to get 14.4, a value that falls when x rises)"
},
"misconception_tag": {
  "A": "constant_difference_as_direct_variation",
  "C": "first_value_as_constant_of_variation",
  "D": "inverse_relationship_treated_as_direct"
}
```

---

**Item 3: Which equation represents a direct variation?**

Step 1: Direct variation is $y = kx$ exactly, which must pass through the origin.

Step 2: Test each.
- $y = 7x - 1$ gives $y = -1$ at $x = 0$, so it is linear but not proportional.
- $y = \frac{7}{x}$ falls as $x$ rises, which is inverse variation.
- $y = 7x$ passes through the origin with a constant ratio of 7.
- $y = 7$ does not change with $x$ at all.

**Answer: C** ($y = 7x$)

```json
"distractor_logic": {
  "A": "Student makes misconception: constant_difference_as_direct_variation (accepts a linear relationship as a direct variation, when the constant term of -1 means a zero x gives a non-zero y and the ratio is not constant)",
  "B": "Student makes misconception: inverse_relationship_treated_as_direct (reads an inverse variation, where the product is constant and y falls as x rises, as a direct one)",
  "C": "Correct: y = 7x has the form y = kx, passes through the origin, and holds a constant ratio of 7",
  "D": "Student makes misconception: first_value_as_constant_of_variation (picks the equation that displays the constant on its own, mistaking a fixed value of y for a constant of variation)"
},
"misconception_tag": {
  "A": "constant_difference_as_direct_variation",
  "B": "inverse_relationship_treated_as_direct",
  "D": "first_value_as_constant_of_variation"
}
```

---

**Item 4: Six machines can fill an order in $8$ hours. Working at the same rate each, how long would $12$ machines take?**

Step 1: Check the direction. More machines means fewer hours, so this is inverse variation.

Step 2: The product is constant.
- $6 \times 8 = 48$ machine-hours in the order

Step 3: Divide by the new count.
- $48 \div 12 = 4$ hours

Step 4: Check. Doubling the machines halved the time, from 8 hours to 4. Correct.

**Answer: B** ($4$ hours)

```json
"distractor_logic": {
  "A": "Student makes misconception: inverse_relationship_treated_as_direct (scales the hours up with the machines, computing 8 times 12/6 for 16 hours, which claims that adding machines makes the order take longer)",
  "B": "Correct: recognises the inverse relationship, finds 48 machine-hours, and divides by 12 machines for 4 hours",
  "C": "Student makes misconception: answers_intermediate_value (computes the 48 machine-hours of total work and reports it as though it were the number of hours)",
  "D": "Student makes misconception: constant_difference_as_direct_variation (treats the change as a constant difference, subtracting the 6 extra machines from the 8 hours to get 2)"
},
"misconception_tag": {
  "A": "inverse_relationship_treated_as_direct",
  "C": "answers_intermediate_value",
  "D": "constant_difference_as_direct_variation"
}
```
