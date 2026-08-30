---
topic_name: "Calculating simple probability of a single random event"
unit_number: 5
sequence_in_unit: 9
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Basic"
related_strand: "PR"
keywords: ["probability", "favorable outcomes", "total outcomes", "complement", "compound event", "sample space"]
---

# PR.3.1 - Calculating Simple Probability of a Single Random Event

**Topic ID:** PR.3.1  
**Unit:** 5  
**Strand:** PR (Probabilistic and Statistical Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Calculate the probability of an event as favorable outcomes over total outcomes, verifying the total rather than dividing by the unfavorable count.
- Combine outcomes correctly for "or" events, remove double-counted overlaps, and compute the complement for "not" events.
- Solve backward from a given probability to find a missing count, and update both the numerator and denominator when items are added to or removed from a set.

---

#### **Part 1: Guided Notes**

##### Counting, Then One Division

A bag holds $10$ marbles and $4$ of them are black. You reach in without looking. What are the chances you pull a black one?

$4$ out of $10$. You did not need a formula, and you were right.

$$P(\text{event}) = \frac{\text{number of favorable outcomes}}{\text{total number of outcomes}}$$

Every problem in this topic is two counts and one division. The arithmetic is never the difficulty. **The difficulty is always the denominator**, and knowing that in advance is most of the battle.

---

##### Favorable Over Total

**Example 1:** A spinner has $8$ equal sections: $3$ red, $2$ blue, $2$ green, $1$ yellow. Find the probability of landing on red.

Step 1: Count the favorable outcomes. Red sections: $3$.

Step 2: Count the **total** outcomes. All sections: $8$. The problem says so, and you can verify it: $3 + 2 + 2 + 1 = 8$.

Step 3: Divide.
- $P(\text{red}) = \frac{3}{8}$

Step 2 has the trap in it, and it is worth naming now. The denominator is **everything**, not everything else. A student who writes $\frac{3}{5}$ has divided the reds by the non-reds. That is a comparison of red to not-red, and it is a different quantity from probability.

$$\frac{\text{favorable}}{\text{total}} \quad \text{not} \quad \frac{\text{favorable}}{\text{unfavorable}}$$

**The favorable outcomes are part of the total.** Red is included in the $8$.

---

##### Always Verify the Total

**Example 2:** A box contains $6$ pens: $2$ black, $3$ blue, $1$ red. Find the probability of selecting a black pen.

Step 1: Favorable: $2$ black.

Step 2: Total. The problem says $6$, and the parts confirm it: $2 + 3 + 1 = 6$.

Step 3: Divide and simplify.
- $P(\text{black}) = \frac{2}{6} = \frac{1}{3}$

Step 2 takes four seconds and is worth doing every time. **Add the categories and check that they hit the stated total.** If they do not, you have misread something.

Step 3 matters too. Answer choices are usually given in lowest terms, so if your fraction is not reduced you may not find it and may talk yourself into a wrong choice.

---

##### Simplify, and Know the Common Equivalents

| Unreduced | Reduced |
|---|---|
| $\frac{2}{6}$, $\frac{3}{9}$, $\frac{4}{12}$ | $\frac{1}{3}$ |
| $\frac{4}{10}$, $\frac{6}{15}$ | $\frac{2}{5}$ |
| $\frac{2}{8}$, $\frac{3}{12}$, $\frac{5}{20}$ | $\frac{1}{4}$ |
| $\frac{4}{8}$, $\frac{5}{10}$, $\frac{6}{12}$ | $\frac{1}{2}$ |
| $\frac{6}{10}$, $\frac{9}{15}$ | $\frac{3}{5}$ |

Every probability lands between $0$ and $1$. An answer above $1$ is impossible, and that alone eliminates choices.

---

##### Events With More Than One Winning Outcome

The word **or** widens what counts as favorable. The denominator does not move.

**Example 3:** A standard die is rolled once. Find the probability of rolling a $2$ or a $5$.

Step 1: Favorable outcomes: $2$ and $5$. That is $2$ outcomes.

Step 2: Total outcomes on a die: $6$.

Step 3: Divide and simplify.
- $P = \frac{2}{6} = \frac{1}{3}$

The error is answering $\frac{1}{6}$, which is the probability of a $2$ alone. **"Or" means count both.** The other error is $\frac{2}{5}$, from putting the count of losing faces underneath.

**Example 4:** A bag has $10$ marbles: $4$ red, $3$ blue, $2$ green, $1$ yellow. Find the probability of drawing red or yellow.

Step 1: Favorable: $4$ red plus $1$ yellow, which is $5$.

Step 2: Total: $10$.

Step 3: Divide.
- $P = \frac{5}{10} = \frac{1}{2}$

---

##### Counting a Described Set

Sometimes the favorable outcomes are described by a property and you have to build the list yourself.

**Example 5:** A set of $12$ cards is numbered $1$ through $12$. Find the probability of drawing a prime number.

Step 1: List the primes up to $12$. A prime has exactly two factors, itself and $1$.
- $2, 3, 5, 7, 11$. That is $5$ cards.

Step 2: Total: $12$.

Step 3: Divide.
- $P = \frac{5}{12}$

Two counting warnings, and both cost points regularly.

**$1$ is not prime.** It has only one factor. Including it gives $6$ and the wrong answer.

**$2$ is prime.** It is the only even prime, and students exclude it out of a vague sense that primes are odd.

**Example 6:** A set of $20$ cards is numbered $1$ through $20$. Find the probability of drawing a multiple of $4$.

Step 1: List them rather than estimating.
- $4, 8, 12, 16, 20$. That is $5$.

Step 2: Divide.
- $P = \frac{5}{20} = \frac{1}{4}$

Writing the list out is what makes this safe. Counting multiples in your head is exactly where an off-by-one creeps in, usually by forgetting that $20$ itself qualifies.

---

##### Threshold Words

**Example 7:** A set of $10$ cards is numbered $1$ through $10$. Find the probability of drawing a number **greater than** $7$.

Step 1: "Greater than $7$" excludes $7$ itself.
- $8, 9, 10$. That is $3$ cards.

Step 2: Divide.
- $P = \frac{3}{10}$

Including the $7$ gives $\frac{4}{10} = \frac{2}{5}$, which is what "$7$ or greater" would have meant. **Read the boundary word and decide, out loud, whether the boundary value is in.**

---

##### The Mistake That Costs the Most Points

Read this section twice.

**The word NOT flips the event, and there are two ways to handle it.**

**Example 8:** A bag has $10$ marbles: $6$ red, $3$ blue, $1$ green. Find the probability the marble is **not** red.

**Route 1, count directly.** Not red means blue or green.
- $3 + 1 = 4$ favorable
- $P = \frac{4}{10} = \frac{2}{5}$

**Route 2, subtract from one.** All probabilities of all outcomes sum to $1$, so:
- $P(\text{red}) = \frac{6}{10} = \frac{3}{5}$
- $P(\text{not red}) = 1 - \frac{3}{5} = \frac{2}{5}$

Same answer, and running both is a complete check on the item.

That relationship has a name. **Complement:**

$$P(\text{not } A) = 1 - P(A)$$

The dominant error is answering $\frac{3}{5}$, the probability that it **is** red. The counting was perfect and the question was misread. When you see the word NOT, circle it, and check your answer against it before bubbling: if red is the majority colour, "not red" has to come out **below** $\frac{1}{2}$. And $\frac{2}{5} < \frac{1}{2}$.

---

##### When Categories Overlap

Two conditions can share members, and shared members must not be counted twice.

**Example 9:** A spinner has $8$ sections numbered $1$ through $8$. Find the probability of landing on a number that is odd **or** greater than $5$.

Step 1: List each set.
- Odd: $1, 3, 5, 7$
- Greater than $5$: $6, 7, 8$

Step 2: Notice the overlap. $7$ is in both lists, because it is odd and it is greater than $5$.

Step 3: Combine into one list of distinct outcomes.
- $1, 3, 5, 6, 7, 8$. That is $6$ outcomes.

Step 4: Divide.
- $P = \frac{6}{8} = \frac{3}{4}$

Adding the counts blindly gives $4 + 3 = 7$ and $\frac{7}{8}$, which counts the $7$ twice. **Merge the lists and count distinct outcomes.** With small sets, listing beats any formula.

---

##### Working Backward From a Probability

If you know a probability and one count, you can find the other.

**Example 10:** A bag holds only red and blue marbles. There are $12$ blue, and the probability of drawing red is $\frac{1}{4}$. How many red marbles are there?

Step 1: Read what $\frac{1}{4}$ says. One in every four marbles is red, so **three in every four are blue**.

Step 2: The $12$ blue marbles are that three-quarters.
- $\frac{3}{4}$ of the total is $12$, so the total is $16$.

Step 3: Reds are the rest.
- $16 - 12 = 4$ red marbles

Step 4: Check. $\frac{4}{16} = \frac{1}{4}$. Correct.

Step 1 is the whole problem. The trap is treating the $12$ as the total and computing $\frac{1}{4}$ of $12$ to get $3$. But $12$ is a **part**, not the whole. Whenever a probability describes a part-to-whole relationship, decide which of the two you were handed.

**Example 11:** In a class, the probability a randomly chosen student plays a sport is $\frac{3}{5}$. If $18$ students play a sport, how many students are in the class?

Here the $18$ genuinely is the favorable count, and the total is unknown.

- $\frac{3}{5}$ of the total is $18$
- One fifth is $18 \div 3 = 6$
- The total is $6 \times 5 = 30$ students

Check: $\frac{18}{30} = \frac{3}{5}$. Correct.

---

##### When the Bag Changes

Adding or removing items changes the favorable count **and** the total. Both.

**Example 12:** A bag has $4$ red and $6$ blue marbles. Two more red marbles are added. Find the new probability of drawing red.

Step 1: New red count.
- $4 + 2 = 6$

Step 2: New **total**. The bag grew, so the total grew too.
- $10 + 2 = 12$

Step 3: Divide.
- $P = \frac{6}{12} = \frac{1}{2}$

Step 2 is the entire item. Updating the numerator and leaving the denominator at $10$ gives $\frac{6}{10} = \frac{3}{5}$, which is the commonest wrong answer here. **Marbles added to the bag are in the bag.** They count in the total.

**Example 13:** A bag has $5$ red and $7$ green. Three green are removed. Find the new probability of drawing green.

- New green count: $7 - 3 = 4$
- New total: $12 - 3 = 9$
- $P = \frac{4}{9}$

Removals move both numbers too.

---

##### The Five Traps

1. **Wrong denominator.** Probability is favorable over **total**, never favorable over unfavorable.
2. **Missing the word "or".** Two winning outcomes means both go in the numerator.
3. **Answering the event instead of its complement.** With NOT, either count the losers or subtract from $1$.
4. **Double counting an overlap.** Odd or greater than $5$ on an eight-section spinner is $6$ outcomes, not $7$.
5. **Forgetting to update the total.** Adding two marbles changes the denominator as well as the numerator.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. A spinner is divided into $8$ equal sections: $3$ red, $2$ blue, $2$ green, and $1$ yellow. If the spinner is spun once, what is the probability that it lands on red?
   - A) $\frac{3}{8}$
   - B) $\frac{3}{5}$
   - C) $\frac{5}{8}$
   - D) $\frac{3}{4}$

2. A box contains $6$ pens: $2$ black, $3$ blue, and $1$ red. If one pen is selected at random, what is the probability of selecting a black pen?
   - A) $\frac{2}{5}$
   - B) $\frac{1}{2}$
   - C) $\frac{1}{3}$
   - D) $\frac{2}{3}$

3. A standard six-sided die is rolled once. What is the probability of rolling a $2$ or a $5$?
   - A) $\frac{1}{6}$
   - B) $\frac{2}{5}$
   - C) $\frac{1}{2}$
   - D) $\frac{1}{3}$

4. A bag holds $10$ marbles: $6$ white and $4$ black. If one marble is drawn at random, what is the probability of drawing a black marble?
   - A) $\frac{2}{3}$
   - B) $\frac{2}{5}$
   - C) $\frac{3}{5}$
   - D) $\frac{6}{4}$

**Proficient Level** (these require an extra step)

5. A set of $10$ cards is numbered $1$ through $10$. One card is drawn at random. What is the probability of drawing a card with a number greater than $7$?
   - A) $\frac{2}{5}$
   - B) $\frac{3}{10}$
   - C) $\frac{3}{7}$
   - D) $\frac{7}{10}$

6. A set of $12$ cards is numbered $1$ through $12$. One card is drawn at random. What is the probability of drawing a card with a prime number?
   - A) $\frac{1}{2}$
   - B) $\frac{1}{3}$
   - C) $\frac{5}{11}$
   - D) $\frac{5}{12}$

7. A bag contains $10$ marbles: $6$ red, $3$ blue, and $1$ green. If one marble is drawn at random, what is the probability that it is NOT red?
   - A) $\frac{2}{5}$
   - B) $\frac{3}{5}$
   - C) $\frac{2}{3}$
   - D) $\frac{3}{10}$

**Advanced Level** (these need multiple steps or reverse thinking)

8. A spinner has $8$ equal sections numbered $1$ through $8$. What is the probability that a single spin lands on a number that is odd or greater than $5$?
   - A) $\frac{7}{8}$
   - B) $\frac{1}{2}$
   - C) $\frac{3}{4}$
   - D) $\frac{3}{8}$

9. A bag contains only red and blue marbles. There are $12$ blue marbles, and the probability of drawing a red marble is $\frac{1}{4}$. How many red marbles are in the bag?
   - A) $3$
   - B) $16$
   - C) $4$
   - D) $48$

10. A bag has $4$ red and $6$ blue marbles. If $2$ more red marbles are added to the bag, what is the new probability of drawing a red marble?
    - A) $\frac{3}{5}$
    - B) $\frac{2}{5}$
    - C) $\frac{1}{3}$
    - D) $\frac{1}{2}$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

A jar holds $12$ candies: $5$ lemon, $4$ cherry, and $3$ grape. If one candy is taken at random, what is the probability that it is cherry?

- A) $\frac{1}{3}$
- B) $\frac{1}{2}$
- C) $\frac{2}{3}$
- D) $\frac{1}{4}$

**Proficient Level**

**Item 2**

A set of $20$ cards is numbered $1$ through $20$. One card is drawn at random. What is the probability of drawing a multiple of $4$?

- A) $\frac{1}{5}$
- B) $\frac{1}{4}$
- C) $\frac{3}{20}$
- D) $\frac{1}{2}$

**Basic Level**

**Item 3**

A bag contains $9$ tiles: $2$ blue and $7$ yellow. What is the probability of drawing a tile that is NOT yellow?

- A) $\frac{7}{9}$
- B) $\frac{2}{7}$
- C) $\frac{1}{2}$
- D) $\frac{2}{9}$

**Advanced Level**

**Item 4**

A bag has $5$ red and $7$ green marbles. If $3$ green marbles are removed from the bag, what is the new probability of drawing a green marble?

- A) $\frac{4}{9}$
- B) $\frac{1}{3}$
- C) $\frac{5}{9}$
- D) $\frac{7}{9}$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. A spinner is divided into $8$ equal sections: $3$ red, $2$ blue, $2$ green, and $1$ yellow. If the spinner is spun once, what is the probability that it lands on red?**

Step 1: Favorable outcomes: $3$ red sections.

Step 2: Total outcomes: $8$ sections. Check: $3 + 2 + 2 + 1 = 8$. Confirmed.

Step 3: Divide.
- $P = \frac{3}{8}$

**Answer: A** ($\frac{3}{8}$)

```json
"distractor_logic": {
  "A": "Correct: puts the 3 red sections over all 8 sections for three eighths",
  "B": "Student makes misconception: favourable_over_unfavourable (divides the 3 red sections by the 5 non-red sections, comparing red to not-red instead of red to the whole spinner)",
  "C": "Student makes misconception: reports_event_not_complement (counts the 5 sections that are not red and reports their probability instead of red's)",
  "D": "Student makes misconception: uses_wrong_total (divides the 3 reds by 4, the number of colour categories, rather than by the 8 sections a spin can land on)"
},
"misconception_tag": {
  "B": "favourable_over_unfavourable",
  "C": "reports_event_not_complement",
  "D": "uses_wrong_total"
}
```

---

**2. A box contains $6$ pens: $2$ black, $3$ blue, and $1$ red. If one pen is selected at random, what is the probability of selecting a black pen?**

Step 1: Favorable: $2$ black pens.

Step 2: Total: $6$ pens. Check: $2 + 3 + 1 = 6$. Confirmed.

Step 3: Divide and simplify.
- $P = \frac{2}{6} = \frac{1}{3}$

**Answer: C** ($\frac{1}{3}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: outcome_total_miscounted (miscounts the box as holding 5 pens rather than 6, reporting two fifths)",
  "B": "Student makes misconception: favourable_over_unfavourable (divides the 2 black pens by the 4 pens that are not black, giving one half, and so compares black to not-black rather than to the whole box)",
  "C": "Correct: puts the 2 black pens over all 6 pens and simplifies two sixths to one third",
  "D": "Student makes misconception: reports_event_not_complement (computes the probability that the pen is not black, four sixths or two thirds, rather than that it is black)"
},
"misconception_tag": {
  "A": "outcome_total_miscounted",
  "B": "favourable_over_unfavourable",
  "D": "reports_event_not_complement"
}
```

---

**3. A standard six-sided die is rolled once. What is the probability of rolling a $2$ or a $5$?**

Step 1: The word "or" means both count. Favorable outcomes: $2$ and $5$, so $2$ outcomes.

Step 2: Total: $6$ faces.

Step 3: Divide and simplify.
- $P = \frac{2}{6} = \frac{1}{3}$

**Answer: D** ($\frac{1}{3}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_second_component (counts only one of the two winning faces, reporting the probability of rolling a 2 alone)",
  "B": "Student makes misconception: favourable_over_unfavourable (puts the 2 winning faces over the 5 that are not winners rather than over all 6)",
  "C": "Student makes misconception: uses_wrong_total (puts the 2 favorable outcomes over 4 rather than over the 6 faces of the die, giving one half)",
  "D": "Correct: counts both the 2 and the 5 as favorable, puts them over the 6 faces, and simplifies to one third"
},
"misconception_tag": {
  "A": "omits_second_component",
  "B": "favourable_over_unfavourable",
  "C": "uses_wrong_total"
}
```

---

**4. A bag holds $10$ marbles: $6$ white and $4$ black. If one marble is drawn at random, what is the probability of drawing a black marble?**

Step 1: Favorable: $4$ black.

Step 2: Total: $10$ marbles. Check: $6 + 4 = 10$. Confirmed.

Step 3: Divide and simplify.
- $P = \frac{4}{10} = \frac{2}{5}$

**Answer: B** ($\frac{2}{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: favourable_over_unfavourable (divides the 4 black marbles by the 6 white ones, comparing black to white instead of black to the whole bag)",
  "B": "Correct: puts the 4 black marbles over all 10 and simplifies four tenths to two fifths",
  "C": "Student makes misconception: reports_event_not_complement (computes the probability of drawing white, six tenths or three fifths, rather than black)",
  "D": "Student makes misconception: numerator_denominator_swap (puts the 6 white marbles over the 4 black ones, building the fraction upside down and producing a value above 1, which no probability can be)"
},
"misconception_tag": {
  "A": "favourable_over_unfavourable",
  "C": "reports_event_not_complement",
  "D": "numerator_denominator_swap"
}
```

---

**Proficient Level**

**5. A set of $10$ cards is numbered $1$ through $10$. One card is drawn at random. What is the probability of drawing a card with a number greater than $7$?**

Step 1: "Greater than $7$" excludes $7$ itself.
- $8, 9, 10$. That is $3$ cards.

Step 2: Total: $10$ cards.

Step 3: Divide.
- $P = \frac{3}{10}$

**Answer: B** ($\frac{3}{10}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: threshold_boundary_error (includes the 7 itself, counting 4 cards and reporting four tenths, which answers 7 or greater rather than greater than 7)",
  "B": "Correct: counts 8, 9 and 10 as the three cards strictly greater than 7 and puts them over the 10 cards",
  "C": "Student makes misconception: uses_wrong_total (puts the 3 favorable cards over the 7 cards below the threshold rather than over all 10)",
  "D": "Student makes misconception: reports_event_not_complement (counts the 7 cards that are not greater than 7 and reports their probability instead)"
},
"misconception_tag": {
  "A": "threshold_boundary_error",
  "C": "uses_wrong_total",
  "D": "reports_event_not_complement"
}
```

---

**6. A set of $12$ cards is numbered $1$ through $12$. One card is drawn at random. What is the probability of drawing a card with a prime number?**

Step 1: List the primes from $1$ to $12$. A prime has exactly two factors.
- $2, 3, 5, 7, 11$. That is $5$ cards.

Step 2: Confirm the edge cases. $1$ is not prime, and $2$ is.

Step 3: Divide.
- $P = \frac{5}{12}$

**Answer: D** ($\frac{5}{12}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: outcome_total_miscounted (counts 6 primes by including 1 as prime, then reports six twelfths as one half)",
  "B": "Student makes misconception: outcome_total_miscounted (drops the 2 from the prime list on the assumption that primes are odd, counting 4 and reporting one third)",
  "C": "Student makes misconception: uses_wrong_total (counts the primes correctly but puts them over 11, excluding one card from the sample space)",
  "D": "Correct: identifies 2, 3, 5, 7 and 11 as the five primes among the twelve cards"
},
"misconception_tag": {
  "A": "outcome_total_miscounted",
  "B": "outcome_total_miscounted",
  "C": "uses_wrong_total"
}
```

---

**7. A bag contains $10$ marbles: $6$ red, $3$ blue, and $1$ green. If one marble is drawn at random, what is the probability that it is NOT red?**

Step 1: Count the marbles that are not red.
- $3$ blue plus $1$ green is $4$

Step 2: Divide by the total.
- $P = \frac{4}{10} = \frac{2}{5}$

Step 3: Check with the complement. $P(\text{red}) = \frac{6}{10} = \frac{3}{5}$, and $1 - \frac{3}{5} = \frac{2}{5}$. Match.

Step 4: Sanity check. Red is the majority colour, so "not red" must be below one half, and $\frac{2}{5}$ is.

**Answer: A** ($\frac{2}{5}$)

```json
"distractor_logic": {
  "A": "Correct: counts the 4 non-red marbles over the 10 total for two fifths, confirmed by subtracting the red probability from 1",
  "B": "Student makes misconception: reports_event_not_complement (computes the probability that the marble IS red, six tenths or three fifths, ignoring the word NOT)",
  "C": "Student makes misconception: favourable_over_unfavourable (divides the 4 non-red marbles by the 6 red ones rather than by the whole bag)",
  "D": "Student makes misconception: omits_second_component (counts only the 3 blue marbles as not red and leaves the green one out of the favorable count)"
},
"misconception_tag": {
  "B": "reports_event_not_complement",
  "C": "favourable_over_unfavourable",
  "D": "omits_second_component"
}
```

---

**Advanced Level**

**8. A spinner has $8$ equal sections numbered $1$ through $8$. What is the probability that a single spin lands on a number that is odd or greater than $5$?**

Step 1: List each set separately.
- Odd: $1, 3, 5, 7$
- Greater than $5$: $6, 7, 8$

Step 2: Spot the overlap. $7$ appears in both, since it is odd and greater than $5$.

Step 3: Merge into distinct outcomes.
- $1, 3, 5, 6, 7, 8$. That is $6$.

Step 4: Divide and simplify.
- $P = \frac{6}{8} = \frac{3}{4}$

**Answer: C** ($\frac{3}{4}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: compound_outcomes_double_counted (adds the 4 odd numbers to the 3 numbers above 5 for 7, counting the 7 twice because it belongs to both sets)",
  "B": "Student makes misconception: omits_second_component (counts only the 4 odd numbers and ignores the second condition, reporting four eighths as one half)",
  "C": "Correct: merges the two sets into the six distinct outcomes 1, 3, 5, 6, 7 and 8 and reports six eighths as three quarters",
  "D": "Student makes misconception: omits_second_component (counts only the 3 numbers greater than 5 and ignores the odd condition entirely)"
},
"misconception_tag": {
  "A": "compound_outcomes_double_counted",
  "B": "omits_second_component",
  "D": "omits_second_component"
}
```

---

**9. A bag contains only red and blue marbles. There are $12$ blue marbles, and the probability of drawing a red marble is $\frac{1}{4}$. How many red marbles are in the bag?**

Step 1: Read what the probability says. One in four marbles is red, so three in four are blue.

Step 2: The $12$ blue marbles are that three quarters, so one quarter is $12 \div 3 = 4$, and the total is $4 \times 4 = 16$.

Step 3: Reds are the remainder.
- $16 - 12 = 4$ red marbles

Step 4: Check. $\frac{4}{16} = \frac{1}{4}$. Correct.

**Answer: C** ($4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: proportion_solved_for_wrong_unknown (treats the 12 blue marbles as the whole bag and takes one quarter of 12, producing 3, though 12 is only the blue part)",
  "B": "Student makes misconception: proportion_solved_for_wrong_unknown (solves for the total number of marbles, 16, and reports it instead of the number of reds)",
  "C": "Correct: recognises the 12 blues as three quarters of the bag, finds a total of 16, and subtracts to reach 4 reds",
  "D": "Student makes misconception: proportion_solved_for_wrong_unknown (multiplies 12 by 4 rather than dividing by 3 to reach the total, producing 48)"
},
"misconception_tag": {
  "A": "proportion_solved_for_wrong_unknown",
  "B": "proportion_solved_for_wrong_unknown",
  "D": "proportion_solved_for_wrong_unknown"
}
```

---

**10. A bag has $4$ red and $6$ blue marbles. If $2$ more red marbles are added to the bag, what is the new probability of drawing a red marble?**

Step 1: New red count.
- $4 + 2 = 6$

Step 2: New total. The added marbles are in the bag, so the total rises too.
- $10 + 2 = 12$

Step 3: Divide and simplify.
- $P = \frac{6}{12} = \frac{1}{2}$

**Answer: D** ($\frac{1}{2}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: added_items_not_reflected_in_total (updates the red count to 6 but leaves the total at the original 10, reporting six tenths as three fifths)",
  "B": "Student makes misconception: added_items_not_reflected_in_total (leaves both counts at their original values, reporting the bag's probability of red before the two marbles were added)",
  "C": "Student makes misconception: added_items_not_reflected_in_total (updates the total to 12 but leaves the red count at 4, reporting four twelfths as one third)",
  "D": "Correct: raises the red count to 6 and the total to 12, since the added marbles join the bag, for a probability of one half"
},
"misconception_tag": {
  "A": "added_items_not_reflected_in_total",
  "B": "added_items_not_reflected_in_total",
  "C": "added_items_not_reflected_in_total"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: A jar holds $12$ candies: $5$ lemon, $4$ cherry, and $3$ grape. If one candy is taken at random, what is the probability that it is cherry?**

Step 1: Favorable: $4$ cherry.

Step 2: Total: $12$ candies. Check: $5 + 4 + 3 = 12$. Confirmed.

Step 3: Divide and simplify.
- $P = \frac{4}{12} = \frac{1}{3}$

**Answer: A** ($\frac{1}{3}$)

```json
"distractor_logic": {
  "A": "Correct: puts the 4 cherry candies over all 12 and simplifies four twelfths to one third",
  "B": "Student makes misconception: favourable_over_unfavourable (divides the 4 cherry candies by the 8 that are not cherry, giving one half, comparing cherry to not-cherry rather than to the jar)",
  "C": "Student makes misconception: reports_event_not_complement (computes the probability the candy is NOT cherry, eight twelfths reduced to two thirds)",
  "D": "Student makes misconception: reads_wrong_category (counts the 3 grape candies instead of the 4 cherry ones, reporting three twelfths as one quarter)"
},
"misconception_tag": {
  "B": "favourable_over_unfavourable",
  "C": "reports_event_not_complement",
  "D": "reads_wrong_category"
}
```

---

**Item 2: A set of $20$ cards is numbered $1$ through $20$. One card is drawn at random. What is the probability of drawing a multiple of $4$?**

Step 1: List the multiples of $4$ up to $20$.
- $4, 8, 12, 16, 20$. That is $5$ cards, and $20$ itself counts.

Step 2: Divide and simplify.
- $P = \frac{5}{20} = \frac{1}{4}$

**Answer: B** ($\frac{1}{4}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: off_by_one_count (misses the 20 at the end of the list, counting 4 multiples and reporting four twentieths as one fifth)",
  "B": "Correct: counts 4, 8, 12, 16 and 20 as the five multiples and simplifies five twentieths to one quarter",
  "C": "Student makes misconception: off_by_one_count (counts only 3 multiples, stopping the list early, and reports three twentieths)",
  "D": "Student makes misconception: outcome_total_miscounted (counts every even number as a multiple of 4, reaching 10 and reporting one half)"
},
"misconception_tag": {
  "A": "off_by_one_count",
  "C": "off_by_one_count",
  "D": "outcome_total_miscounted"
}
```

---

**Item 3: A bag contains $9$ tiles: $2$ blue and $7$ yellow. What is the probability of drawing a tile that is NOT yellow?**

Step 1: Not yellow means blue, and there are $2$ blue tiles.

Step 2: Divide by the total.
- $P = \frac{2}{9}$

Step 3: Check with the complement. $P(\text{yellow}) = \frac{7}{9}$, and $1 - \frac{7}{9} = \frac{2}{9}$. Match.

**Answer: D** ($\frac{2}{9}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (computes the probability the tile IS yellow, seven ninths, ignoring the word NOT)",
  "B": "Student makes misconception: favourable_over_unfavourable (divides the 2 blue tiles by the 7 yellow ones rather than by all 9 tiles)",
  "C": "Student makes misconception: outcome_total_miscounted (treats the two colour categories as two equally likely outcomes and reports one half, ignoring how many tiles each category holds)",
  "D": "Correct: counts the 2 non-yellow tiles over the 9 total, confirmed by subtracting seven ninths from 1"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "B": "favourable_over_unfavourable",
  "C": "outcome_total_miscounted"
}
```

---

**Item 4: A bag has $5$ red and $7$ green marbles. If $3$ green marbles are removed from the bag, what is the new probability of drawing a green marble?**

Step 1: New green count.
- $7 - 3 = 4$

Step 2: New total. The removed marbles are gone, so the total falls too.
- $12 - 3 = 9$

Step 3: Divide.
- $P = \frac{4}{9}$

**Answer: A** ($\frac{4}{9}$)

```json
"distractor_logic": {
  "A": "Correct: lowers the green count to 4 and the total to 9, since the removed marbles leave the bag, for four ninths",
  "B": "Student makes misconception: added_items_not_reflected_in_total (lowers the green count to 4 but leaves the total at the original 12, reporting four twelfths as one third)",
  "C": "Student makes misconception: reads_wrong_category (updates the total to 9 correctly but puts the 5 red marbles on top, reporting the probability of red rather than green)",
  "D": "Student makes misconception: added_items_not_reflected_in_total (lowers the total to 9 but leaves the green count at the original 7, reporting seven ninths)"
},
"misconception_tag": {
  "B": "added_items_not_reflected_in_total",
  "C": "reads_wrong_category",
  "D": "added_items_not_reflected_in_total"
}
```
