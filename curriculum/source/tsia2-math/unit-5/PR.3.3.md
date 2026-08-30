---
topic_name: "Compound probability (independent and dependent events)"
unit_number: 5
sequence_in_unit: 11
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "PR"
keywords: ["compound probability", "independent events", "dependent events", "with replacement", "without replacement", "multiplication rule", "at least one"]
---

# PR.3.3 - Compound Probability (Independent and Dependent Events)

**Topic ID:** PR.3.3  
**Unit:** 5  
**Strand:** PR (Probabilistic and Statistical Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Multiply stage probabilities to find the probability that multiple events all occur, checking that the answer is smaller than every individual stage.
- Distinguish independent events, with replacement, from dependent events, without replacement.
- Compute "at least one" probabilities by subtracting the probability of none from 1.

---

#### **Part 1: Guided Notes**

##### Two Questions, Asked in Order

One event you already know. This topic is about **two or more in a row**, and it asks you two questions before you compute anything:

1. **How many stages are there, and what is the probability at each one?** Write them down as a list before you multiply.
2. **Does the pool change between stages?** If something is taken out and kept, the next stage is working with a smaller pool.

**The confusion this topic exists to prevent is adding when the situation multiplies.** "And" feels like more, and more feels like addition. It is not. Two things both happening is **less** likely than either one alone, and multiplication is what produces a smaller number.

---

##### And Means Multiply

For a sequence of stages, the probability that **all** of them happen is the product:

$$P(A \text{ and then } B) = P(A) \times P(B)$$

**Example 1:** A coin is flipped and a fair die is rolled. Find the probability of heads and then a $4$.

Step 1: List the stages.
- Heads: $\frac{1}{2}$
- A $4$: $\frac{1}{6}$

Step 2: Multiply.
- $\frac{1}{2} \times \frac{1}{6} = \frac{1}{12}$

Step 3: Sanity check the size. $\frac{1}{12}$ is smaller than both $\frac{1}{2}$ and $\frac{1}{6}$, which is what you want. **A compound answer must be smaller than every stage that went into it.**

Step 3 is the cheapest error check in the topic. Adding these two gives $\frac{2}{3}$, which is **larger** than either stage, and that is impossible for an "and" question. You do not need to remember the rule if you remember the direction.

One more failure to name now. Multiplying fractions means multiplying tops and multiplying bottoms:

$$\frac{1}{2} \times \frac{1}{6} = \frac{1 \times 1}{2 \times 6} = \frac{1}{12}$$

Adding the tops while multiplying the bottoms gives $\frac{2}{12} = \frac{1}{6}$, which is wrong and looks reasonable. **Both parts of the fraction get multiplied.**

---

##### Independent: The Pool Does Not Change

Two events are **independent** when the first one does not affect the second. A coin does not remember. A die does not remember. And a marble put **back** in the bag leaves the bag exactly as it was.

**Example 2:** A bag holds $8$ marbles, $3$ of which are green. A marble is drawn, **put back**, and a second marble is drawn. Find the probability that both are green.

Step 1: Stage one. $\frac{3}{8}$.

Step 2: Stage two. The marble went back, so the bag is unchanged: $\frac{3}{8}$ again.

Step 3: Multiply.
- $\frac{3}{8} \times \frac{3}{8} = \frac{9}{64}$

**The words "put back" or "with replacement" are the whole of Step 2.** Read the stem for them before you write anything.

---

##### Dependent: The Pool Shrinks

**Example 3:** A bag holds $10$ marbles, $4$ of which are red. Two marbles are drawn **without replacement**. Find the probability that both are red.

Step 1: Stage one. $\frac{4}{10}$.

Step 2: Stage two. One red marble is gone, so **both numbers change**.
- Reds left: $4 - 1 = 3$
- Marbles left: $10 - 1 = 9$
- So stage two is $\frac{3}{9}$

Step 3: Multiply.
- $\frac{4}{10} \times \frac{3}{9} = \frac{12}{90} = \frac{2}{15}$

Step 2 is the item. There are two ways to get it wrong and they produce different answers:

- **Changing neither.** $\frac{4}{10} \times \frac{4}{10} = \frac{16}{100} = \frac{4}{25}$. This treats a without-replacement draw as a with-replacement one.
- **Changing only the top.** $\frac{4}{10} \times \frac{3}{10} = \frac{12}{100} = \frac{3}{25}$. The red count drops but the total does not, which describes a bag that lost a marble without getting smaller.

**A marble removed from the bag leaves the bag.** Both numbers go down by one, every time.

---

##### The Mistake That Costs the Most Points

Read this section twice.

**Answer every stage the question asked about.**

You will set up stage one correctly. It is the easiest part and you will get it right. Then the answer choices will contain that stage-one probability, sitting there looking finished, and it is the single most common wrong answer in this topic.

In Example 3, $\frac{4}{10}$ reduces to $\frac{2}{5}$, and $\frac{2}{5}$ will be among the options. It is the probability that the **first** marble is red, which is a true statement about a question nobody asked.

**Count the stages in the stem, then count the factors in your product. The two numbers must match.** Two draws means two factors. Three draws means three. If your work has fewer factors than the stem has stages, you stopped early.

This applies to three-stage problems just as hard, where stopping after two feels like most of the work.

---

##### Three Stages, Same Rule

**Example 4:** Three independent events have probabilities $\frac{2}{3}$, $\frac{2}{5}$, and $\frac{1}{2}$. Find the probability that all three occur.

Step 1: Three stages, so three factors.

Step 2: Multiply all of them.
- $\frac{2}{3} \times \frac{2}{5} \times \frac{1}{2} = \frac{4}{30} = \frac{2}{15}$

Stopping after two gives $\frac{2}{3} \times \frac{2}{5} = \frac{4}{15}$, which is exactly twice the right answer and looks like a finished fraction.

**Example 5:** A bag holds $9$ balls, $4$ of which are white. Three are drawn without replacement. Find the probability that all three are white.

Step 1: Three stages, and the pool shrinks each time.
- $\frac{4}{9}$, then $\frac{3}{8}$, then $\frac{2}{7}$

Step 2: Multiply.
- $\frac{4}{9} \times \frac{3}{8} \times \frac{2}{7} = \frac{24}{504} = \frac{1}{21}$

Notice both numbers falling by one at every stage: $4, 3, 2$ on top and $9, 8, 7$ underneath. **Write the two ladders out before multiplying anything.**

---

##### At Least One

Some questions ask for "at least one", and the direct route is long: at least one means one, or two, or three, and those have to be added. The short route is the complement.

$$P(\text{at least one}) = 1 - P(\text{none})$$

"None" is a single compound event, so it multiplies.

**Example 6:** Two independent attempts each succeed with probability $\frac{1}{3}$. Find the probability of at least one success.

Step 1: Find the probability of failure at one attempt.
- $1 - \frac{1}{3} = \frac{2}{3}$

Step 2: Both fail. Two stages, so multiply.
- $\frac{2}{3} \times \frac{2}{3} = \frac{4}{9}$

Step 3: Subtract from $1$.
- $1 - \frac{4}{9} = \frac{5}{9}$

Step 3 is the one that gets dropped. A student who does Steps 1 and 2 perfectly and stops has $\frac{4}{9}$, the probability that **neither** succeeds, which is the opposite of what was asked. **"At least one" is a complement question wearing a compound problem's clothes.**

---

##### The Five Traps

1. **Adding instead of multiplying.** "And" makes the answer smaller. If your answer is bigger than any single stage, you added.
2. **Adding numerators over a product of denominators.** Multiply tops with tops and bottoms with bottoms.
3. **Stopping after the first stage.** Count the stages in the stem, count the factors in your work, and make the two match.
4. **Leaving the total unchanged in a without-replacement draw.** Both the favourable count and the total go down by one.
5. **Reporting "none" when the question said "at least one".** Subtract from $1$ at the end.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. A coin is flipped and a fair six-sided die is rolled. What is the probability of getting heads and then rolling a $4$?
   - A) $\frac{1}{12}$
   - B) $\frac{2}{3}$
   - C) $\frac{1}{2}$
   - D) $\frac{1}{6}$

2. A spinner has $4$ equal sections and one of them is blue. A bag holds $10$ marbles, $3$ of which are red. The spinner is spun and then a marble is drawn. What is the probability of spinning blue and then drawing red?
   - A) $\frac{11}{20}$
   - B) $\frac{1}{4}$
   - C) $\frac{3}{40}$
   - D) $\frac{1}{10}$

3. A bag holds $8$ marbles, $3$ of which are green. One marble is drawn, put back, and a second marble is drawn. What is the probability that both are green?
   - A) $\frac{3}{28}$
   - B) $\frac{9}{64}$
   - C) $\frac{3}{8}$
   - D) $\frac{3}{4}$

4. Two independent events have probabilities $\frac{2}{5}$ and $\frac{1}{3}$. What is the probability that both occur?
   - A) $\frac{11}{15}$
   - B) $\frac{1}{5}$
   - C) $\frac{2}{5}$
   - D) $\frac{2}{15}$

**Proficient Level** (these require an extra step)

5. A bag holds $10$ marbles, $4$ of which are red. Two marbles are drawn without replacement. What is the probability that both are red?
   - A) $\frac{2}{15}$
   - B) $\frac{3}{25}$
   - C) $\frac{4}{25}$
   - D) $\frac{2}{5}$

6. A box holds $12$ cards, $5$ of which are blue. Two cards are drawn without replacement. What is the probability that both are blue?
   - A) $\frac{5}{36}$
   - B) $\frac{5}{33}$
   - C) $\frac{25}{144}$
   - D) $\frac{5}{12}$

7. Three independent events have probabilities $\frac{2}{3}$, $\frac{2}{5}$, and $\frac{1}{2}$. What is the probability that all three occur?
   - A) $\frac{4}{15}$
   - B) $\frac{2}{3}$
   - C) $\frac{2}{15}$
   - D) $\frac{1}{6}$

**Advanced Level** (these need multiple steps or reverse thinking)

8. A bag holds $9$ balls, $4$ of which are white. Three balls are drawn without replacement. What is the probability that all three are white?
   - A) $\frac{1}{6}$
   - B) $\frac{8}{243}$
   - C) $\frac{64}{729}$
   - D) $\frac{1}{21}$

9. Two independent attempts each succeed with probability $\frac{1}{3}$. What is the probability of at least one success?
   - A) $\frac{2}{3}$
   - B) $\frac{4}{9}$
   - C) $\frac{5}{9}$
   - D) $\frac{1}{3}$

10. A box holds $12$ chips: $5$ are red and $7$ are blue. Of the $5$ red chips, exactly $2$ are marked. One chip is drawn and kept, then a second chip is drawn. What is the probability that the first chip is a marked red chip and the second chip is blue?
    - A) $\frac{7}{72}$
    - B) $\frac{7}{66}$
    - C) $\frac{35}{132}$
    - D) $\frac{1}{6}$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Two fair six-sided dice are rolled. What is the probability that both show a $6$?

- A) $\frac{1}{3}$
- B) $\frac{1}{6}$
- C) $\frac{1}{36}$
- D) $\frac{1}{18}$

**Proficient Level**

**Item 2**

A drawer holds $8$ pens, $3$ of which are red. Two pens are drawn without replacement. What is the probability that both are red?

- A) $\frac{3}{28}$
- B) $\frac{3}{32}$
- C) $\frac{9}{64}$
- D) $\frac{3}{8}$

**Item 3**

Three independent events have probabilities $\frac{3}{4}$, $\frac{3}{5}$, and $\frac{1}{2}$. What is the probability that all three occur?

- A) $\frac{7}{40}$
- B) $\frac{9}{20}$
- C) $\frac{3}{4}$
- D) $\frac{9}{40}$

**Advanced Level**

**Item 4**

A crate holds $10$ items, $3$ of which are defective. Two items are drawn without replacement. What is the probability that at least one is defective?

- A) $\frac{7}{15}$
- B) $\frac{8}{15}$
- C) $\frac{3}{5}$
- D) $\frac{29}{50}$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. A coin is flipped and a fair six-sided die is rolled. What is the probability of getting heads and then rolling a $4$?**

Step 1: Two stages. Heads is $\frac{1}{2}$, a $4$ is $\frac{1}{6}$.

Step 2: Multiply tops and bottoms.
- $\frac{1}{2} \times \frac{1}{6} = \frac{1}{12}$

Step 3: Check the size. $\frac{1}{12}$ is smaller than both stages, as an "and" answer must be.

**Answer: A** ($\frac{1}{12}$)

```json
"distractor_logic": {
  "A": "Correct: 1/2 times 1/6 = 1/12, and the result is smaller than both stages as an and-question requires",
  "B": "Student makes misconception: adds_probabilities_instead_of_multiplying (computes 1/2 + 1/6 = 2/3, which is larger than either stage and so cannot be the probability of both happening)",
  "C": "Student makes misconception: single_stage_reported (reports the probability of heads and never uses the die at all)",
  "D": "Student makes misconception: numerators_added_over_product (adds the numerators while multiplying the denominators, giving 2 over 12, which is 1/6)"
},
"misconception_tag": {
  "B": "adds_probabilities_instead_of_multiplying",
  "C": "single_stage_reported",
  "D": "numerators_added_over_product"
}
```

---

**2. A spinner has $4$ equal sections and one of them is blue. A bag holds $10$ marbles, $3$ of which are red. The spinner is spun and then a marble is drawn. What is the probability of spinning blue and then drawing red?**

Step 1: Two stages. Blue is $\frac{1}{4}$, red is $\frac{3}{10}$.

Step 2: Multiply.
- $\frac{1}{4} \times \frac{3}{10} = \frac{3}{40}$

The spinner and the bag have nothing to do with each other, so the stages are independent and neither pool changes.

**Answer: C** ($\frac{3}{40}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: adds_probabilities_instead_of_multiplying (computes 1/4 + 3/10 = 5/20 + 6/20 = 11/20)",
  "B": "Student makes misconception: single_stage_reported (reports the spinner probability of 1/4 and never reaches the bag)",
  "C": "Correct: 1/4 times 3/10 = 3/40",
  "D": "Student makes misconception: numerators_added_over_product (adds the numerators over the product of the denominators, giving 4 over 40, which is 1/10)"
},
"misconception_tag": {
  "A": "adds_probabilities_instead_of_multiplying",
  "B": "single_stage_reported",
  "D": "numerators_added_over_product"
}
```

---

**3. A bag holds $8$ marbles, $3$ of which are green. One marble is drawn, put back, and a second marble is drawn. What is the probability that both are green?**

Step 1: Stage one is $\frac{3}{8}$.

Step 2: The marble went back, so the bag is unchanged and stage two is also $\frac{3}{8}$.

Step 3: Multiply.
- $\frac{3}{8} \times \frac{3}{8} = \frac{9}{64}$

**Answer: B** ($\frac{9}{64}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: replacement_status_wrong (misses put back and shrinks the pool anyway, computing 3/8 times 2/7 = 6/56, which is 3/28)",
  "B": "Correct: the marble is replaced so both stages are 3/8, and 3/8 times 3/8 = 9/64",
  "C": "Student makes misconception: single_stage_reported (reports the probability of the first draw only)",
  "D": "Student makes misconception: adds_probabilities_instead_of_multiplying (computes 3/8 + 3/8 = 6/8, which is 3/4, larger than either stage)"
},
"misconception_tag": {
  "A": "replacement_status_wrong",
  "C": "single_stage_reported",
  "D": "adds_probabilities_instead_of_multiplying"
}
```

---

**4. Two independent events have probabilities $\frac{2}{5}$ and $\frac{1}{3}$. What is the probability that both occur?**

Step 1: Two stages, given directly.

Step 2: Multiply.
- $\frac{2}{5} \times \frac{1}{3} = \frac{2}{15}$

**Answer: D** ($\frac{2}{15}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: adds_probabilities_instead_of_multiplying (computes 2/5 + 1/3 = 6/15 + 5/15 = 11/15)",
  "B": "Student makes misconception: numerators_added_over_product (adds the numerators over the product of denominators, giving 3 over 15, which is 1/5)",
  "C": "Student makes misconception: single_stage_reported (reports the first probability and never uses the second)",
  "D": "Correct: 2/5 times 1/3 = 2/15"
},
"misconception_tag": {
  "A": "adds_probabilities_instead_of_multiplying",
  "B": "numerators_added_over_product",
  "C": "single_stage_reported"
}
```

---

**Proficient Level**

**5. A bag holds $10$ marbles, $4$ of which are red. Two marbles are drawn without replacement. What is the probability that both are red?**

Step 1: Stage one is $\frac{4}{10}$.

Step 2: One red marble has left the bag, so both numbers drop by one.
- $\frac{3}{9}$

Step 3: Multiply.
- $\frac{4}{10} \times \frac{3}{9} = \frac{12}{90} = \frac{2}{15}$

**Answer: A** ($\frac{2}{15}$)

```json
"distractor_logic": {
  "A": "Correct: without replacement the second draw is 3/9, and 4/10 times 3/9 = 12/90, which is 2/15",
  "B": "Student makes misconception: total_not_reduced_between_draws (drops the red count to 3 but leaves the total at 10, computing 4/10 times 3/10 = 12/100, which is 3/25)",
  "C": "Student makes misconception: replacement_status_wrong (treats the draw as with replacement, computing 4/10 times 4/10 = 16/100, which is 4/25)",
  "D": "Student makes misconception: single_stage_reported (reports 4/10, which is 2/5, the probability that the first marble is red)"
},
"misconception_tag": {
  "B": "total_not_reduced_between_draws",
  "C": "replacement_status_wrong",
  "D": "single_stage_reported"
}
```

---

**6. A box holds $12$ cards, $5$ of which are blue. Two cards are drawn without replacement. What is the probability that both are blue?**

Step 1: Stage one is $\frac{5}{12}$.

Step 2: Both numbers drop by one.
- $\frac{4}{11}$

Step 3: Multiply.
- $\frac{5}{12} \times \frac{4}{11} = \frac{20}{132} = \frac{5}{33}$

**Answer: B** ($\frac{5}{33}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_not_reduced_between_draws (drops the blue count to 4 but leaves the total at 12, computing 5/12 times 4/12 = 20/144, which is 5/36)",
  "B": "Correct: without replacement the second draw is 4/11, and 5/12 times 4/11 = 20/132, which is 5/33",
  "C": "Student makes misconception: replacement_status_wrong (treats the draw as with replacement, computing 5/12 times 5/12 = 25/144)",
  "D": "Student makes misconception: single_stage_reported (reports the probability of the first card only)"
},
"misconception_tag": {
  "A": "total_not_reduced_between_draws",
  "C": "replacement_status_wrong",
  "D": "single_stage_reported"
}
```

---

**7. Three independent events have probabilities $\frac{2}{3}$, $\frac{2}{5}$, and $\frac{1}{2}$. What is the probability that all three occur?**

Step 1: Three stages, so three factors.

Step 2: Multiply all three.
- $\frac{2}{3} \times \frac{2}{5} \times \frac{1}{2} = \frac{4}{30} = \frac{2}{15}$

**Answer: C** ($\frac{2}{15}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sequence_stopped_early (multiplies the first two stages only, computing 2/3 times 2/5 = 4/15, and never reaches the third)",
  "B": "Student makes misconception: single_stage_reported (reports the first probability alone)",
  "C": "Correct: 2/3 times 2/5 times 1/2 = 4/30, which is 2/15",
  "D": "Student makes misconception: numerators_added_over_product (adds the three numerators over the product of the denominators, giving 5 over 30, which is 1/6)"
},
"misconception_tag": {
  "A": "sequence_stopped_early",
  "B": "single_stage_reported",
  "D": "numerators_added_over_product"
}
```

---

**Advanced Level**

**8. A bag holds $9$ balls, $4$ of which are white. Three balls are drawn without replacement. What is the probability that all three are white?**

Step 1: Three stages, with both numbers falling by one each time.
- $\frac{4}{9}$, then $\frac{3}{8}$, then $\frac{2}{7}$

Step 2: Multiply all three.
- $\frac{4}{9} \times \frac{3}{8} \times \frac{2}{7} = \frac{24}{504} = \frac{1}{21}$

**Answer: D** ($\frac{1}{21}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sequence_stopped_early (multiplies the first two stages only, computing 4/9 times 3/8 = 12/72, which is 1/6, and never draws the third ball)",
  "B": "Student makes misconception: total_not_reduced_between_draws (drops the white count each time but leaves the total at 9, computing 4/9 times 3/9 times 2/9 = 24/729, which is 8/243)",
  "C": "Student makes misconception: replacement_status_wrong (treats all three draws as with replacement, computing 4/9 times 4/9 times 4/9 = 64/729)",
  "D": "Correct: 4/9 times 3/8 times 2/7 = 24/504, which is 1/21"
},
"misconception_tag": {
  "A": "sequence_stopped_early",
  "B": "total_not_reduced_between_draws",
  "C": "replacement_status_wrong"
}
```

---

**9. Two independent attempts each succeed with probability $\frac{1}{3}$. What is the probability of at least one success?**

Step 1: One attempt fails with probability $1 - \frac{1}{3} = \frac{2}{3}$.

Step 2: Both fail. Two stages, so multiply.
- $\frac{2}{3} \times \frac{2}{3} = \frac{4}{9}$

Step 3: At least one success is the complement of no successes.
- $1 - \frac{4}{9} = \frac{5}{9}$

**Answer: C** ($\frac{5}{9}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: adds_probabilities_instead_of_multiplying (computes 1/3 + 1/3 = 2/3, double-counting the outcome where both attempts succeed)",
  "B": "Student makes misconception: reports_event_not_complement (computes the probability that both attempts fail, 2/3 times 2/3 = 4/9, and reports it without subtracting from 1)",
  "C": "Correct: 1 - (2/3 times 2/3) = 1 - 4/9 = 5/9",
  "D": "Student makes misconception: single_stage_reported (reports the probability of one attempt succeeding and never combines the two)"
},
"misconception_tag": {
  "A": "adds_probabilities_instead_of_multiplying",
  "B": "reports_event_not_complement",
  "D": "single_stage_reported"
}
```

---

**10. A box holds $12$ chips: $5$ are red and $7$ are blue. Of the $5$ red chips, exactly $2$ are marked. One chip is drawn and kept, then a second chip is drawn. What is the probability that the first chip is a marked red chip and the second chip is blue?**

Step 1: Stage one asks for a chip that is red **and** marked. Only $2$ of the $12$ chips satisfy both parts.
- $\frac{2}{12}$

Step 2: One chip has been kept, so $11$ remain. All $7$ blue chips are still there, because the chip removed was red.
- $\frac{7}{11}$

Step 3: Multiply.
- $\frac{2}{12} \times \frac{7}{11} = \frac{14}{132} = \frac{7}{66}$

Step 1 is the item. A chip that is red is not enough; the stem asked for red **and** marked.

**Answer: B** ($\frac{7}{66}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_not_reduced_between_draws (uses the correct 2 over 12 for the first chip but leaves the total at 12 for the second, computing 2/12 times 7/12 = 14/144, which is 7/72)",
  "B": "Correct: 2 of the 12 chips are both red and marked, and 7 of the remaining 11 are blue, so 2/12 times 7/11 = 14/132, which is 7/66",
  "C": "Student makes misconception: omits_second_component (uses all 5 red chips and drops the marked requirement, computing 5/12 times 7/11 = 35/132)",
  "D": "Student makes misconception: single_stage_reported (reports 2/12, which is 1/6, the probability for the first chip alone)"
},
"misconception_tag": {
  "A": "total_not_reduced_between_draws",
  "C": "omits_second_component",
  "D": "single_stage_reported"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Two fair six-sided dice are rolled. What is the probability that both show a $6$?**

Step 1: Two stages, each $\frac{1}{6}$. Dice do not affect each other.

Step 2: Multiply.
- $\frac{1}{6} \times \frac{1}{6} = \frac{1}{36}$

**Answer: C** ($\frac{1}{36}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: adds_probabilities_instead_of_multiplying (computes 1/6 + 1/6 = 2/6, which is 1/3, larger than either die alone)",
  "B": "Student makes misconception: single_stage_reported (reports the probability for one die)",
  "C": "Correct: 1/6 times 1/6 = 1/36",
  "D": "Student makes misconception: numerators_added_over_product (adds the numerators over the product of the denominators, giving 2 over 36, which is 1/18)"
},
"misconception_tag": {
  "A": "adds_probabilities_instead_of_multiplying",
  "B": "single_stage_reported",
  "D": "numerators_added_over_product"
}
```

---

**Item 2: A drawer holds $8$ pens, $3$ of which are red. Two pens are drawn without replacement. What is the probability that both are red?**

Step 1: Stage one is $\frac{3}{8}$.

Step 2: Both numbers drop by one, giving $\frac{2}{7}$.

Step 3: Multiply.
- $\frac{3}{8} \times \frac{2}{7} = \frac{6}{56} = \frac{3}{28}$

**Answer: A** ($\frac{3}{28}$)

```json
"distractor_logic": {
  "A": "Correct: without replacement the second draw is 2/7, and 3/8 times 2/7 = 6/56, which is 3/28",
  "B": "Student makes misconception: total_not_reduced_between_draws (drops the red count to 2 but leaves the total at 8, computing 3/8 times 2/8 = 6/64, which is 3/32)",
  "C": "Student makes misconception: replacement_status_wrong (treats the draw as with replacement, computing 3/8 times 3/8 = 9/64)",
  "D": "Student makes misconception: single_stage_reported (reports the probability of the first pen only)"
},
"misconception_tag": {
  "B": "total_not_reduced_between_draws",
  "C": "replacement_status_wrong",
  "D": "single_stage_reported"
}
```

---

**Item 3: Three independent events have probabilities $\frac{3}{4}$, $\frac{3}{5}$, and $\frac{1}{2}$. What is the probability that all three occur?**

Step 1: Three stages, so three factors.

Step 2: Multiply.
- $\frac{3}{4} \times \frac{3}{5} \times \frac{1}{2} = \frac{9}{40}$

**Answer: D** ($\frac{9}{40}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: numerators_added_over_product (adds the three numerators over the product of the denominators, giving 7 over 40)",
  "B": "Student makes misconception: sequence_stopped_early (multiplies the first two stages only, computing 3/4 times 3/5 = 9/20, and never reaches the third)",
  "C": "Student makes misconception: single_stage_reported (reports the first probability alone)",
  "D": "Correct: 3/4 times 3/5 times 1/2 = 9/40"
},
"misconception_tag": {
  "A": "numerators_added_over_product",
  "B": "sequence_stopped_early",
  "C": "single_stage_reported"
}
```

---

**Item 4: A crate holds $10$ items, $3$ of which are defective. Two items are drawn without replacement. What is the probability that at least one is defective?**

Step 1: The complement of "at least one defective" is "none defective", which means both are good. There are $7$ good items.

Step 2: Both good, without replacement.
- $\frac{7}{10} \times \frac{6}{9} = \frac{42}{90} = \frac{7}{15}$

Step 3: Subtract from $1$.
- $1 - \frac{7}{15} = \frac{8}{15}$

**Answer: B** ($\frac{8}{15}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_event_not_complement (computes the probability that neither item is defective, 7/10 times 6/9 = 7/15, and reports it without subtracting from 1)",
  "B": "Correct: P(none defective) = 7/10 times 6/9 = 7/15, so P(at least one) = 1 - 7/15 = 8/15",
  "C": "Student makes misconception: adds_probabilities_instead_of_multiplying (adds the two defective probabilities, computing 3/10 + 3/10 = 6/10, which is 3/5)",
  "D": "Student makes misconception: total_not_reduced_between_draws (drops the good count to 6 but leaves the total at 10 inside the complement, computing 7/10 times 6/10 = 42/100, which is 21/50, then 1 - 21/50 = 29/50)"
},
"misconception_tag": {
  "A": "reports_event_not_complement",
  "C": "adds_probabilities_instead_of_multiplying",
  "D": "total_not_reduced_between_draws"
}
```
