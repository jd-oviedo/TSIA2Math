---
topic_name: "Distributive property"
unit_number: 0
sequence_in_unit: 5
assessment_layer: "ENRICHMENT"
estimated_time_minutes: 45
difficulty_band: "Basic"
related_strand: "QR"
keywords: ["distributive property", "distributing", "factoring", "greatest common factor", "expanding expressions", "like terms"]
---

# QR.3.8 - Distributive Property

**Topic ID:** QR.3.8  
**Unit:** 0  
**Strand:** QR (Quantitative Reasoning)  
**Assessment Layer:** ENRICHMENT  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Three People, Three Combo Meals

You are buying lunch for three people. Each meal is a \$7 burger and a \$3 drink.

You can total it two ways.

**Way 1:** Each meal costs $7 + 3 = 10$ dollars, and there are three of them, so $3 \times 10 = 30$.

**Way 2:** Three burgers cost $3 \times 7 = 21$, three drinks cost $3 \times 3 = 9$, and $21 + 9 = 30$.

Same bill. That is the distributive property, and you have been using it since the first time you split a restaurant check.

$$3(7 + 3) = 3 \times 7 + 3 \times 3$$

Written in general:

$$a(b + c) = ab + ac$$

The reason it matters in algebra is that Way 1 stops working the moment you do not know one of the numbers. If the drink costs \$d and you cannot add $7 + d$ into a single number, Way 2 is the only road open: $3(7 + d) = 21 + 3d$.

---

##### The Rule: Everyone Inside Gets Multiplied

The factor outside the parentheses multiplies **every single term** inside. Not the first one. Every one.

$$4(2x + 3) = 8x + 12$$

The most common error in this entire topic is multiplying the first term and copying the second one across untouched, producing $8x + 3$. Everyone knows the rule and does this anyway, under time pressure, because the eye moves on after the first multiplication.

**The fix is physical.** Draw an arrow from the outside factor to each term inside before you multiply anything. Two terms inside means two arrows. If you have drawn two arrows, you cannot forget the second multiplication.

---

##### Negatives Are Where the Points Go

A negative factor outside changes the sign of every term inside, including the ones that were already negative.

**Example 1:** $-2(x - 5)$

Step 1: Multiply the first term.
- $-2 \times x = -2x$

Step 2: Multiply the second term. The term inside is $-5$, and $-2 \times (-5)$ is a positive.
- $-2 \times (-5) = +10$

Step 3: Write the result.
- $-2x + 10$

That plus sign is the whole item. A student who writes $-2x - 10$ has let the minus sign apply to the first term and then gone back to copying, which is the same partial-distribution error wearing a different coat.

**Check it with a number.** Let $x = 1$. The original is $-2(1 - 5) = -2(-4) = 8$. Your answer should give $8$ too: $-2(1) + 10 = 8$. It does. Had you written $-2x - 10$, you would get $-12$, and the mismatch tells you immediately.

That substitution check takes fifteen seconds and catches every sign error in this topic. Use it.

---

##### A Bare Minus Sign Means Multiply by Negative One

$$-(3x - 7)$$

There is no visible number outside, which makes students think there is nothing to distribute. There is. An invisible $-1$ is sitting there.

$$-(3x - 7) = -1(3x - 7) = -3x + 7$$

**Every sign inside flips.** The $3x$ becomes $-3x$ and the $-7$ becomes $+7$.

Writing the $-1$ in explicitly, every time, costs you one second and removes the guesswork.

---

##### Distribute, Then Combine

Most real problems ask for both steps.

**Example 2:** Simplify $5(2x - 3) + 4x$.

Step 1: Distribute. Two arrows.
- $5 \times 2x = 10x$
- $5 \times (-3) = -15$
- So far: $10x - 15 + 4x$

Step 2: Combine like terms. The $x$ terms go together; the constant stays on its own.
- $10x + 4x = 14x$
- $14x - 15$

Step 3: Stop. $14x$ and $-15$ are **not** like terms and cannot be merged.

That last step is a real trap. A student who writes $-x$ has treated $14x$ and $-15$ as combinable and computed $14 - 15$. You can only add terms that carry the same variable to the same power. $14x$ means "fourteen of something unknown" and $-15$ means "negative fifteen." There is no way to total those into one number.

---

##### Factoring: The Distributive Property Backward

Factoring undoes distribution. You are given $12x + 18$ and asked to find what was multiplied out to produce it.

**Step 1: Find the greatest common factor** of the coefficients. What is the largest number dividing both $12$ and $18$?
- Factors of $12$: $1, 2, 3, 4, 6, 12$
- Factors of $18$: $1, 2, 3, 6, 9, 18$
- The greatest shared one is $6$.

**Step 2: Write it outside, and divide each term by it.**
- $12 \div 6 = 2$
- $18 \div 6 = 3$
- $6(2x + 3)$

**Step 3: Check by distributing back.** $6 \times 2x = 12x$ and $6 \times 3 = 18$. Match.

Three things go wrong here, and all three are caught by step 3.

**Not taking the greatest factor.** $3(4x + 6)$ is a true statement, but $4$ and $6$ still share a factor of $2$, so it is not factored completely. When a question says "completely," pull out everything.

**Writing the factor outside and forgetting to divide.** $6(12x + 18)$ distributes back to $72x + 108$, six times too big. The terms inside must be what is **left after** dividing.

**Dividing only one term.** $6(2x + 18)$ divides the $12x$ but copies the $18$ across untouched. Distributing back gives $12x + 108$, and the mismatch names the error.

---

##### Variables Can Be Part of the Common Factor

**Example 3:** Factor $12x^2 + 18x$ completely.

Step 1: The greatest common numerical factor is $6$, as before.

Step 2: Now look at the variables. The first term has $x^2$ and the second has $x$. Both contain at least one $x$, so an $x$ comes out too.

Step 3: The full common factor is $6x$. Divide each term by it.
- $12x^2 \div 6x = 2x$
- $18x \div 6x = 3$
- $6x(2x + 3)$

Step 4: Check by distributing. $6x \times 2x = 12x^2$ and $6x \times 3 = 18x$. Match.

Pulling out only the $6$ gives $6(2x^2 + 3x)$, which is true but not complete, because the inside still has an $x$ in both terms.

---

##### Where This Shows Up

**Example 4:** A gym charges a \$25 joining fee plus \$18 per month. Three family members each sign up separately. Write an expression for the total cost after $m$ months.

Step 1: One person's cost is $25 + 18m$.

Step 2: Three people each pay that.
- $3(25 + 18m)$

Step 3: Distribute.
- $3 \times 25 = 75$
- $3 \times 18m = 54m$
- $75 + 54m$

Both forms are correct and they say different things. $3(25 + 18m)$ says "three people, each paying a joining fee and a monthly rate." $75 + 54m$ says "seventy-five dollars up front, then fifty-four dollars a month." Being able to move between those two readings is most of what this topic is for.

---

##### The Four Traps

1. **Distributing to the first term only.** Draw one arrow per term inside. Two terms, two arrows.
2. **Losing a sign.** $-2(x - 5)$ is $-2x + 10$. Check by substituting a number.
3. **Combining unlike terms.** $14x - 15$ is finished. It does not collapse to $-x$.
4. **Factoring incompletely, or forgetting to divide.** Pull out the greatest factor, divide every term by it, then distribute back to check.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Which expression is equivalent to $3(x + 4)$?
   - A) $3x + 4$
   - B) $3x + 12$
   - C) $15x$
   - D) $3x + 7$

2. Which expression is equivalent to $-2(x - 5)$?
   - A) $2x - 10$
   - B) $-2x - 10$
   - C) $-2x + 10$
   - D) $-2x - 5$

3. Which expression is equivalent to $4(2x + 3)$?
   - A) $20x$
   - B) $8x + 3$
   - C) $6x + 7$
   - D) $8x + 12$

4. Which expression is $12x + 18$ factored completely?
   - A) $6(2x + 18)$
   - B) $6(12x + 18)$
   - C) $3(4x + 6)$
   - D) $6(2x + 3)$

**Proficient Level** (these require an extra step)

5. Which expression is equivalent to $-(3x - 7)$?
   - A) $3x - 7$
   - B) $-3x - 7$
   - C) $-3x + 7$
   - D) $-3x$

6. Which expression is equivalent to $5(2x - 3) + 4x$?
   - A) $14x - 15$
   - B) $14x - 3$
   - C) $10x - 15 + 4x$
   - D) $-x$

7. Which expression is $8x - 20$ factored completely?
   - A) $4(2x - 5)$
   - B) $2(4x - 10)$
   - C) $4(8x - 20)$
   - D) $4(2x - 20)$

**Advanced Level** (these need multiple steps or reverse thinking)

8. Which expression is equivalent to $-3(2x - 4) + 2(x + 5)$?
   - A) $-4x - 2$
   - B) $-4x + 22$
   - C) $-4x + 17$
   - D) $18$

9. A gym charges a \$25 joining fee plus \$18 per month. Three family members each sign up separately and pay their own fees. Which expression gives the total cost for all three after $m$ months?
   - A) $129m$
   - B) $75 + 54m$
   - C) $28 + 21m$
   - D) $75 + 18m$

10. Which expression is $12x^2 + 18x$ factored completely?
    - A) $6x(2x^2 + 3x)$
    - B) $6(2x^2 + 3x)$
    - C) $6x(2x + 18x)$
    - D) $6x(2x + 3)$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Which expression is equivalent to $5(x + 3)$?

- A) $20x$
- B) $5x + 3$
- C) $x + 8$
- D) $5x + 15$

**Item 2**

Which expression is equivalent to $-4(x - 2)$?

- A) $-4x - 2$
- B) $-4x - 8$
- C) $-4x + 8$
- D) $4x - 8$

**Item 3**

Which expression is $20x + 30$ factored completely?

- A) $5(4x + 6)$
- B) $10(2x + 3)$
- C) $10(2x + 30)$
- D) $10(20x + 30)$

**Proficient Level**

**Item 4**

Which expression is equivalent to $2(3x - 1) + 5x$?

- A) $11x - 2$
- B) $11x - 1$
- C) $9x$
- D) $6x - 2 + 5x$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Which expression is equivalent to $3(x + 4)$?**

Step 1: Draw two arrows. The $3$ multiplies both terms inside.

Step 2: Multiply each.
- $3 \times x = 3x$
- $3 \times 4 = 12$

Step 3: $3x$ and $12$ are unlike terms, so the expression is finished.

**Answer: B** ($3x + 12$)

```json
"distractor_logic": {
  "A": "Student makes misconception: partial_distribution (multiplies the 3 into the x and copies the 4 across untouched)",
  "B": "Correct: multiplies the 3 into both terms, giving 3x plus 12",
  "C": "Student makes misconception: combines_unlike_terms (distributes correctly to 3x plus 12, then merges a variable term with a constant as though they were like terms)",
  "D": "Student makes misconception: adds_instead_of_scales (multiplies the first term correctly but adds the 3 to the second term instead of multiplying by it)"
},
"misconception_tag": {
  "A": "partial_distribution",
  "C": "combines_unlike_terms",
  "D": "adds_instead_of_scales"
}
```

---

**2. Which expression is equivalent to $-2(x - 5)$?**

Step 1: Multiply the first term.
- $-2 \times x = -2x$

Step 2: Multiply the second term. The term inside is $-5$, and a negative times a negative is positive.
- $-2 \times (-5) = +10$

Step 3: Check by substituting $x = 1$. The original gives $-2(1-5) = -2(-4) = 8$, and $-2(1) + 10 = 8$. Match.

**Answer: C** ($-2x + 10$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_sign_on_factor (distributes the magnitudes correctly but treats the outside factor as a positive 2, flipping the sign of both products)",
  "B": "Student makes misconception: drops_negative_on_group (applies the minus to the first term only, leaving the second product negative when two negative factors make it positive)",
  "C": "Correct: multiplies both terms by -2, so the -5 becomes a positive 10",
  "D": "Student makes misconception: partial_distribution (multiplies the -2 into the x and copies the -5 across untouched)"
},
"misconception_tag": {
  "A": "wrong_sign_on_factor",
  "B": "drops_negative_on_group",
  "D": "partial_distribution"
}
```

---

**3. Which expression is equivalent to $4(2x + 3)$?**

Step 1: Two arrows, two multiplications.
- $4 \times 2x = 8x$
- $4 \times 3 = 12$

Step 2: The terms are unlike, so stop.

**Answer: D** ($8x + 12$)

```json
"distractor_logic": {
  "A": "Student makes misconception: combines_unlike_terms (distributes correctly to 8x plus 12, then merges a variable term with a constant)",
  "B": "Student makes misconception: partial_distribution (multiplies the 4 into the 2x and copies the 3 across untouched)",
  "C": "Student makes misconception: adds_instead_of_scales (adds the outside factor to each inside term rather than multiplying, giving 4 plus 2 and 4 plus 3)",
  "D": "Correct: multiplies the 4 into both terms, giving 8x plus 12"
},
"misconception_tag": {
  "A": "combines_unlike_terms",
  "B": "partial_distribution",
  "C": "adds_instead_of_scales"
}
```

---

**4. Which expression is $12x + 18$ factored completely?**

Step 1: Find the greatest common factor of $12$ and $18$. It is $6$.

Step 2: Write $6$ outside and divide each term by it.
- $12 \div 6 = 2$
- $18 \div 6 = 3$

Step 3: Check by distributing back. $6 \times 2x = 12x$ and $6 \times 3 = 18$. Match.

**Answer: D** ($6(2x + 3)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: only_one_term_divided_by_gcf (divides the 12x by 6 but copies the 18 unchanged, so distributing back gives 12x plus 108)",
  "B": "Student makes misconception: gcf_written_terms_not_divided (writes the 6 outside but copies the original terms inside, so distributing back gives 72x plus 108)",
  "C": "Student makes misconception: gcf_not_greatest (pulls out 3, a genuine common factor, but leaves 4 and 6 inside still sharing a factor of 2)",
  "D": "Correct: pulls out the greatest common factor 6 and divides both terms by it"
},
"misconception_tag": {
  "A": "only_one_term_divided_by_gcf",
  "B": "gcf_written_terms_not_divided",
  "C": "gcf_not_greatest"
}
```

---

**Proficient Level**

**5. Which expression is equivalent to $-(3x - 7)$?**

Step 1: The bare minus sign is an invisible $-1$. Write it in.
- $-1(3x - 7)$

Step 2: Multiply both terms by $-1$. Every sign flips.
- $-1 \times 3x = -3x$
- $-1 \times (-7) = +7$

Step 3: Check with $x = 1$. The original gives $-(3-7) = -(-4) = 4$, and $-3(1) + 7 = 4$. Match.

**Answer: C** ($-3x + 7$)

```json
"distractor_logic": {
  "A": "Student makes misconception: drops_grouping_symbols (removes the parentheses without applying the leading minus to anything, copying the expression unchanged)",
  "B": "Student makes misconception: drops_negative_on_group (applies the minus to the 3x only and leaves the -7 negative)",
  "C": "Correct: treats the bare minus as multiplication by -1, flipping the sign of both terms",
  "D": "Student makes misconception: omits_constant_term (negates the variable term and drops the constant from the expression entirely)"
},
"misconception_tag": {
  "A": "drops_grouping_symbols",
  "B": "drops_negative_on_group",
  "D": "omits_constant_term"
}
```

---

**6. Which expression is equivalent to $5(2x - 3) + 4x$?**

Step 1: Distribute the $5$ into both terms.
- $5 \times 2x = 10x$
- $5 \times (-3) = -15$
- $10x - 15 + 4x$

Step 2: Combine the like terms.
- $10x + 4x = 14x$

Step 3: $14x$ and $-15$ are unlike, so the expression is finished.

**Answer: A** ($14x - 15$)

```json
"distractor_logic": {
  "A": "Correct: distributes into both terms, then combines only the two x terms",
  "B": "Student makes misconception: partial_distribution (multiplies the 5 into the 2x and copies the -3 across untouched, then combines the x terms)",
  "C": "Student makes misconception: stops_before_simplifying (distributes correctly but never combines the 10x and the 4x into a single term)",
  "D": "Student makes misconception: combines_unlike_terms (reaches 14x minus 15 and then merges a variable term with a constant, computing 14 minus 15)"
},
"misconception_tag": {
  "B": "partial_distribution",
  "C": "stops_before_simplifying",
  "D": "combines_unlike_terms"
}
```

---

**7. Which expression is $8x - 20$ factored completely?**

Step 1: The greatest common factor of $8$ and $20$ is $4$.

Step 2: Divide each term by $4$.
- $8 \div 4 = 2$
- $-20 \div 4 = -5$

Step 3: Check by distributing back. $4 \times 2x = 8x$ and $4 \times (-5) = -20$. Match.

**Answer: A** ($4(2x - 5)$)

```json
"distractor_logic": {
  "A": "Correct: pulls out the greatest common factor 4 and divides both terms by it",
  "B": "Student makes misconception: gcf_not_greatest (pulls out 2, a genuine common factor, but leaves 4 and 10 inside still sharing a factor of 2)",
  "C": "Student makes misconception: gcf_written_terms_not_divided (writes the 4 outside but copies the original terms inside, so distributing back gives 32x minus 80)",
  "D": "Student makes misconception: only_one_term_divided_by_gcf (divides the 8x by 4 but copies the -20 unchanged, so distributing back gives 8x minus 80)"
},
"misconception_tag": {
  "B": "gcf_not_greatest",
  "C": "gcf_written_terms_not_divided",
  "D": "only_one_term_divided_by_gcf"
}
```

---

**Advanced Level**

**8. Which expression is equivalent to $-3(2x - 4) + 2(x + 5)$?**

Step 1: Distribute the $-3$ into both terms of the first group.
- $-3 \times 2x = -6x$
- $-3 \times (-4) = +12$

Step 2: Distribute the $2$ into both terms of the second group.
- $2 \times x = 2x$
- $2 \times 5 = 10$

Step 3: Collect everything.
- $-6x + 12 + 2x + 10$

Step 4: Combine like terms separately.
- $-6x + 2x = -4x$
- $12 + 10 = 22$
- $-4x + 22$

**Answer: B** ($-4x + 22$)

```json
"distractor_logic": {
  "A": "Student makes misconception: drops_negative_on_group (applies the -3 to the 2x only, leaving the second product as -12 instead of +12, which shifts the constant total to -2)",
  "B": "Correct: distributes both factors into both of their terms, then combines the x terms and the constants separately",
  "C": "Student makes misconception: partial_distribution (distributes the first group correctly but multiplies the 2 into the x only, copying the 5 across untouched for a constant total of 17)",
  "D": "Student makes misconception: combines_unlike_terms (reaches -4x plus 22 and merges a variable term with a constant, computing -4 plus 22)"
},
"misconception_tag": {
  "A": "drops_negative_on_group",
  "C": "partial_distribution",
  "D": "combines_unlike_terms"
}
```

---

**9. A gym charges a \$25 joining fee plus \$18 per month. Three family members each sign up separately and pay their own fees. Which expression gives the total cost for all three after $m$ months?**

Step 1: Write one person's cost.
- $25 + 18m$

Step 2: Three people each pay that amount.
- $3(25 + 18m)$

Step 3: Distribute into both terms.
- $3 \times 25 = 75$
- $3 \times 18m = 54m$
- $75 + 54m$

Step 4: Sanity check with $m = 1$. One person pays \$43 for a month, so three pay \$129. The expression gives $75 + 54 = 129$. Match.

**Answer: B** ($75 + 54m$)

```json
"distractor_logic": {
  "A": "Student makes misconception: combines_unlike_terms (distributes correctly to 75 plus 54m and then merges the one-time fee with the monthly rate, charging the joining fee every month)",
  "B": "Correct: multiplies both the joining fee and the monthly rate by 3, since each of the three members pays both",
  "C": "Student makes misconception: adds_instead_of_scales (adds the 3 to each term instead of multiplying, giving 3 plus 25 and 3 plus 18)",
  "D": "Student makes misconception: partial_distribution (triples the joining fee but copies the monthly rate across untouched, charging three joining fees but only one person's monthly rate)"
},
"misconception_tag": {
  "A": "combines_unlike_terms",
  "C": "adds_instead_of_scales",
  "D": "partial_distribution"
}
```

---

**10. Which expression is $12x^2 + 18x$ factored completely?**

Step 1: The greatest common numerical factor of $12$ and $18$ is $6$.

Step 2: Both terms contain at least one $x$, so an $x$ comes out as well. The full common factor is $6x$.

Step 3: Divide each term by $6x$.
- $12x^2 \div 6x = 2x$
- $18x \div 6x = 3$

Step 4: Check by distributing back. $6x \times 2x = 12x^2$ and $6x \times 3 = 18x$. Match.

**Answer: D** ($6x(2x + 3)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: gcf_written_terms_not_divided (writes 6x outside but divides neither term by the x, so distributing back gives 12x cubed plus 18x squared)",
  "B": "Student makes misconception: gcf_not_greatest (pulls out only the 6 and leaves an x in both inside terms, so the expression is factored but not completely)",
  "C": "Student makes misconception: only_one_term_divided_by_gcf (divides the first term by 6x but copies the 18x unchanged, so distributing back gives 12x squared plus 108x squared)",
  "D": "Correct: pulls out both the numerical factor 6 and the shared x, then divides both terms by 6x"
},
"misconception_tag": {
  "A": "gcf_written_terms_not_divided",
  "B": "gcf_not_greatest",
  "C": "only_one_term_divided_by_gcf"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Which expression is equivalent to $5(x + 3)$?**

Step 1: Two arrows.
- $5 \times x = 5x$
- $5 \times 3 = 15$

**Answer: D** ($5x + 15$)

```json
"distractor_logic": {
  "A": "Student makes misconception: combines_unlike_terms (distributes correctly to 5x plus 15, then merges a variable term with a constant)",
  "B": "Student makes misconception: partial_distribution (multiplies the 5 into the x and copies the 3 across untouched)",
  "C": "Student makes misconception: adds_instead_of_scales (adds the outside factor to the constant instead of multiplying, and leaves the x term unscaled)",
  "D": "Correct: multiplies the 5 into both terms, giving 5x plus 15"
},
"misconception_tag": {
  "A": "combines_unlike_terms",
  "B": "partial_distribution",
  "C": "adds_instead_of_scales"
}
```

---

**Item 2: Which expression is equivalent to $-4(x - 2)$?**

Step 1: Multiply both terms by $-4$.
- $-4 \times x = -4x$
- $-4 \times (-2) = +8$

Step 2: Check with $x = 1$. The original gives $-4(1-2) = -4(-1) = 4$, and $-4(1) + 8 = 4$. Match.

**Answer: C** ($-4x + 8$)

```json
"distractor_logic": {
  "A": "Student makes misconception: partial_distribution (multiplies the -4 into the x and copies the -2 across untouched)",
  "B": "Student makes misconception: drops_negative_on_group (applies the minus to the first term only, leaving the second product negative when two negative factors make it positive)",
  "C": "Correct: multiplies both terms by -4, so the -2 becomes a positive 8",
  "D": "Student makes misconception: wrong_sign_on_factor (distributes the magnitudes correctly but treats the outside factor as a positive 4, flipping the sign of both products)"
},
"misconception_tag": {
  "A": "partial_distribution",
  "B": "drops_negative_on_group",
  "D": "wrong_sign_on_factor"
}
```

---

**Item 3: Which expression is $20x + 30$ factored completely?**

Step 1: The greatest common factor of $20$ and $30$ is $10$.

Step 2: Divide each term by $10$.
- $20 \div 10 = 2$
- $30 \div 10 = 3$

Step 3: Check by distributing back. $10 \times 2x = 20x$ and $10 \times 3 = 30$. Match.

**Answer: B** ($10(2x + 3)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: gcf_not_greatest (pulls out 5, a genuine common factor, but leaves 4 and 6 inside still sharing a factor of 2)",
  "B": "Correct: pulls out the greatest common factor 10 and divides both terms by it",
  "C": "Student makes misconception: only_one_term_divided_by_gcf (divides the 20x by 10 but copies the 30 unchanged, so distributing back gives 20x plus 300)",
  "D": "Student makes misconception: gcf_written_terms_not_divided (writes the 10 outside but copies the original terms inside, so distributing back gives 200x plus 300)"
},
"misconception_tag": {
  "A": "gcf_not_greatest",
  "C": "only_one_term_divided_by_gcf",
  "D": "gcf_written_terms_not_divided"
}
```

---

**Item 4: Which expression is equivalent to $2(3x - 1) + 5x$?**

Step 1: Distribute the $2$ into both terms.
- $2 \times 3x = 6x$
- $2 \times (-1) = -2$
- $6x - 2 + 5x$

Step 2: Combine the like terms.
- $6x + 5x = 11x$
- $11x - 2$

**Answer: A** ($11x - 2$)

```json
"distractor_logic": {
  "A": "Correct: distributes into both terms, then combines only the two x terms",
  "B": "Student makes misconception: partial_distribution (multiplies the 2 into the 3x and copies the -1 across untouched, then combines the x terms)",
  "C": "Student makes misconception: combines_unlike_terms (reaches 11x minus 2 and then merges a variable term with a constant, computing 11 minus 2)",
  "D": "Student makes misconception: stops_before_simplifying (distributes correctly but never combines the 6x and the 5x into a single term)"
},
"misconception_tag": {
  "B": "partial_distribution",
  "C": "combines_unlike_terms",
  "D": "stops_before_simplifying"
}
```
