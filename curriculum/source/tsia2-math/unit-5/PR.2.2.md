---
topic_name: "Calculating weighted mean"
unit_number: 5
sequence_in_unit: 5
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Basic"
related_strand: "PR"
keywords: ["weighted mean", "weighted average", "weights", "percentage weights", "combined average", "course grade"]
---

# PR.2.2 - Calculating Weighted Mean

**Topic ID:** PR.2.2  
**Unit:** 5  
**Strand:** PR (Probabilistic and Statistical Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Calculate a weighted mean by pairing each weight with its own score, summing the weighted products, and dividing by the total weight.
- Find a missing weight when weights must sum to 100% before computing a weighted average.
- Solve backward from a target weighted mean to find an unknown score, dividing by the weight of that unknown.

---

#### **Part 1: Guided Notes**

##### Two Questions, Asked in Order

Your final grade is not the average of your scores. If the final exam is worth half the grade and a homework set is worth two percent, treating them as equals would be absurd, and you already know that.

A **weighted mean** is the tool for exactly this situation: some numbers count more than others. Every problem in this topic asks you two questions, and you answer them in this order:

1. **Which number is the weight, and which is the score?** One says how much something counts. The other says how well you did.
2. **What do the weights add to, and did you divide by that?**

Almost every lost point in this topic is one of those two questions answered wrongly. Question 1 is a reading problem. Question 2 is a habit. **The confusion this topic exists to prevent is treating a weighted mean as a plain average**, and the whole lesson is built to make that mistake feel wrong when you see it.

---

##### Why the Plain Average Is Wrong Here

Suppose labs count $6$, quizzes count $3$, and participation counts $1$. You scored $60$ on labs, $70$ on quizzes, and $80$ on participation.

The plain average of $60$, $70$, and $80$ is $70$. But that answer treats participation, worth $1$, as though it mattered as much as labs, worth $6$. It does not.

The heaviest thing here is your worst score, so the true result must be **below** $70$. Knowing that before you compute anything is worth more than the computation.

$$\text{weighted mean} = \frac{\text{sum of (weight} \times \text{score)}}{\text{sum of the weights}}$$

That is the entire topic. Two sums and one division.

---

##### The Formula, Worked Once, Slowly

**Example 1:** Labs count $6$ with a score of $60$, quizzes count $3$ with a score of $70$, participation counts $1$ with a score of $80$. Find the weighted mean.

Step 1: Multiply each weight by its own score.
- $6 \times 60 = 360$
- $3 \times 70 = 210$
- $1 \times 80 = 80$

Step 2: Add those products.
- $360 + 210 + 80 = 650$

Step 3: Add the weights.
- $6 + 3 + 1 = 10$

Step 4: Divide.
- $\frac{650}{10} = 65$

The answer is $65$, and it is below $70$ exactly as predicted. **Predict the direction before you compute.** If your answer lands on the wrong side of the plain average, you have made an error and you will catch it in four seconds.

---

##### Each Weight Belongs to Its Own Score

Step 1 above is where items are lost, and it is worth slowing down.

The $6$ belongs to the labs, and the labs score is $60$. Pairing the $6$ with $70$ instead gives

- $3 \times 60 = 180$, $6 \times 70 = 420$, $1 \times 80 = 80$
- $\frac{180 + 420 + 80}{10} = \frac{680}{10} = 68$

which is a real number that is also completely wrong. Nothing about $68$ looks suspicious. **The only defence is writing each pair down before multiplying anything.**

There is a second version of this error that feels like reasoning. A student assumes the heaviest weight must go with the highest score, because that is how they would like the grade to work:

- $1 \times 60 = 60$, $3 \times 70 = 210$, $6 \times 80 = 480$
- $\frac{60 + 210 + 480}{10} = \frac{750}{10} = 75$

That is $75$, above the plain average instead of below it. **The weights are assigned by the syllabus, not by your scores.** Read which is which.

---

##### When the Weights Are Percentages

Percentages are weights that have been chosen to add to $100$. Nothing else changes.

**Example 2:** Exams are $50\%$ with a score of $70$, projects are $30\%$ with a score of $80$, and a presentation is $20\%$ with a score of $90$. Find the course grade.

Step 1: Multiply each weight by its score.
- $50 \times 70 = 3500$
- $30 \times 80 = 2400$
- $20 \times 90 = 1800$

Step 2: Add.
- $3500 + 2400 + 1800 = 7700$

Step 3: The weights add to $50 + 30 + 20 = 100$.

Step 4: Divide.
- $\frac{7700}{100} = 77$

Because the weights add to $100$, the division is just moving a decimal point. That convenience is also the trap: it is the step people skip, and skipping it turns $77$ into $7700$.

---

##### When the Weights Are Counts

Weights do not have to be percentages. A count works the same way, and this is how two groups get combined.

**Example 3:** One class of $25$ students averaged $58$ on a test. A second class of $15$ students averaged $78$. A third class of $10$ students averaged $98$. What is the average across all three classes?

The classes are different sizes, so their averages do not count equally. The headcounts are the weights.

Step 1: Multiply.
- $25 \times 58 = 1450$
- $15 \times 78 = 1170$
- $10 \times 98 = 980$

Step 2: Add the products.
- $1450 + 1170 + 980 = 3600$

Step 3: Add the weights, which is the total number of students.
- $25 + 15 + 10 = 50$

Step 4: Divide.
- $\frac{3600}{50} = 72$

The plain average of $58$, $78$, and $98$ is $78$. The real answer is $72$, six points lower, because the biggest class did the worst. **When groups differ in size, the plain average of their averages is not the average.**

---

##### When One Weight Is Missing

A stem will often list some weights and leave one out, because the ones given must add to $100$ with it.

**Example 4:** A grade is $50\%$ homework, $30\%$ midterm, and the rest final exam. The scores are $60$ on homework, $70$ on the midterm, and $80$ on the final. Find the grade.

Step 1: Find the missing weight first, before touching any score.
- $100 - 50 - 30 = 20$, so the final is worth $20\%$

Step 2: Multiply.
- $50 \times 60 = 3000$
- $30 \times 70 = 2100$
- $20 \times 80 = 1600$

Step 3: Add and divide.
- $\frac{3000 + 2100 + 1600}{100} = \frac{6700}{100} = 67$

Step 1 is the whole item. A student who does not compute the missing weight will often reuse the one next to it, taking the final as $30\%$ because the midterm was:

- $\frac{3000 + 2100 + 30 \times 80}{100} = \frac{3000 + 2100 + 2400}{100} = \frac{7500}{100} = 75$

$75$ against a true $67$, from one number never computed. **The word "rest" is an instruction. Do the subtraction and write the number down.**

---

##### The Mistake That Costs the Most Points

Read this section twice.

**Divide by the total weight, not by how many categories there are.**

In Example 3 there were three classes, and the temptation is to divide by $3$. There were $50$ students, and $50$ is the divisor. Dividing $3600$ by $3$ gives $1200$, which is not a test score, so that one announces itself.

The dangerous version is quieter. In Example 1 the weights were $6$, $3$, and $1$, and there were three categories. Divide $650$ by $3$ and you get about $217$. Also obviously wrong.

So why is this the costliest mistake? Because **the version that survives is the one where the two divisors are close.** Weights of $4$, $3$, and $3$ total $10$ across three categories. Dividing by $3$ instead of $10$ produces a number in the right neighbourhood, and nothing on the page looks wrong.

**The denominator is the sum of the weights. Always. Write it down as its own step, the way Step 3 does above, and it cannot go missing.**

---

##### Working Backward From a Target

The hardest version gives you the answer and hides one score.

**Example 5:** Coursework is $75\%$ of the grade and you have $80$. The final exam is the other $25\%$. You want an $83$ overall. What do you need on the final?

Step 1: Write what the finished grade will be, using $x$ for the unknown score.
- $\frac{75 \times 80 + 25 \times x}{100} = 83$

Step 2: Multiply both sides by $100$.
- $6000 + 25x = 8300$

Step 3: Subtract the part you already have.
- $25x = 2300$

Step 4: **Divide by the weight of the unknown.**
- $x = \frac{2300}{25} = 92$

You need a $92$.

Step 4 is the one that gets dropped. A student who stops at Step 3 has $2300$, sees that the numbers are on a $100$ scale, and reports $23$. That is the same error in a smaller costume: they found how many points the final must contribute, then forgot that the final only counts for a quarter. **Points contributed and score earned are different quantities.** The weight is what converts one into the other, and you divide by it.

Check the answer by putting it back:

- $\frac{75 \times 80 + 25 \times 92}{100} = \frac{6000 + 2300}{100} = \frac{8300}{100} = 83$

Correct. **Every backward problem can be checked forward in fifteen seconds.** Do it.

---

##### The Five Traps

1. **Ignoring the weights.** The plain average is a different quantity. Predict which side of it the true answer falls on, then verify you landed there.
2. **Pairing a weight with the wrong score.** Write each weight next to its own score before multiplying anything.
3. **Assuming the biggest weight sits on the biggest score.** The syllabus assigns the weights; your performance does not.
4. **Dividing by the number of categories instead of the total weight.** The denominator is the sum of the weights, and it deserves its own written step.
5. **Reporting points contributed instead of the score earned.** In a backward problem, divide by the weight of the unknown at the end.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. A course grade uses these weights: labs count $6$, quizzes count $3$, and participation counts $1$. A student scores $60$ on labs, $70$ on quizzes, and $80$ on participation. What is the weighted mean?
   - A) $70$
   - B) $65$
   - C) $68$
   - D) $75$

2. A course grade is $50\%$ exams, $30\%$ projects, and $20\%$ presentation. A student scores $70$ on exams, $80$ on projects, and $90$ on the presentation. What is the course grade?
   - A) $77$
   - B) $80$
   - C) $79$
   - D) $83$

3. A grade uses weights of $6$ for essays, $3$ for tests, and $1$ for attendance. A student scores $62$ on essays, $72$ on tests, and $82$ on attendance. What is the weighted mean?
   - A) $70$
   - B) $72$
   - C) $67$
   - D) $77$

4. A training score uses weights of $5$ for practical work, $4$ for written work, and $1$ for safety. A trainee scores $58$ on practical, $78$ on written, and $98$ on safety. What is the weighted score?
   - A) $72$
   - B) $78$
   - C) $86$
   - D) $70$

**Proficient Level** (these require an extra step)

5. A course grade is $50\%$ homework, $30\%$ midterm, and the rest final exam. A student scores $60$ on homework, $70$ on the midterm, and $80$ on the final. What is the course grade?
   - A) $70$
   - B) $67$
   - C) $73$
   - D) $75$

6. Three classes take the same test. A class of $25$ students averages $58$, a class of $15$ students averages $78$, and a class of $10$ students averages $98$. What is the average score across all three classes?
   - A) $76$
   - B) $78$
   - C) $72$
   - D) $84$

7. A grade is $40\%$ homework, $20\%$ quizzes, $25\%$ midterm, and the rest final exam. A student scores $56$ on homework, $88$ on quizzes, $84$ on the midterm, and $60$ on the final. What is the course grade?
   - A) $70$
   - B) $72$
   - C) $74$
   - D) $76$

**Advanced Level** (these need multiple steps or reverse thinking)

8. Coursework is worth $75\%$ of a grade and a student has $80$. The final exam is worth the other $25\%$. What score does the student need on the final exam to finish with exactly $83$ overall?
   - A) $23$
   - B) $84$
   - C) $86$
   - D) $92$

9. Coursework is worth $80\%$ of a grade and a student has $90$. The final exam is worth the other $20\%$. What score does the student need on the final exam to finish with exactly $86$ overall?
   - A) $14$
   - B) $70$
   - C) $82$
   - D) $85$

10. A grade is $50\%$ theory, $30\%$ practical, and $20\%$ oral. A student scores $92$ on theory, $56$ on practical, and $86$ on oral. What is the course grade?
    - A) $78$
    - B) $83$
    - C) $80$
    - D) $86$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

A grade is $70\%$ coursework, $20\%$ project, and $10\%$ attendance. A student scores $58$ on coursework, $78$ on the project, and $98$ on attendance. What is the grade?

- A) $66$
- B) $76$
- C) $78$
- D) $90$

**Item 2**

A grade is $45\%$ writing, $35\%$ reading, and $20\%$ speaking. A student scores $58$ on writing, $78$ on reading, and $98$ on speaking. What is the grade?

- A) $75$
- B) $78$
- C) $83$
- D) $73$

**Item 3**

A grade is $50\%$ exams, $30\%$ labs, and $20\%$ homework. A student scores $96$ on exams, $60$ on labs, and $90$ on homework. What is the grade?

- A) $82$
- B) $84$
- C) $87$
- D) $90$

**Advanced Level**

**Item 4**

Coursework is worth $75\%$ of a grade and a student has $84$. The final exam is worth the other $25\%$. What score does the student need on the final exam to finish with exactly $87$ overall?

- A) $90$
- B) $24$
- C) $96$
- D) $88$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. A course grade uses these weights: labs count $6$, quizzes count $3$, and participation counts $1$. A student scores $60$ on labs, $70$ on quizzes, and $80$ on participation. What is the weighted mean?**

Step 1: Pair each weight with its own score and multiply.
- $6 \times 60 = 360$
- $3 \times 70 = 210$
- $1 \times 80 = 80$

Step 2: Add the products.
- $360 + 210 + 80 = 650$

Step 3: Add the weights.
- $6 + 3 + 1 = 10$

Step 4: Divide.
- $\frac{650}{10} = 65$

Check the direction: the heaviest weight sits on the lowest score, so the answer must fall below the plain average of $70$. It does.

**Answer: B** ($65$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_ignored (averages 60, 70 and 80 as equals for 210 over 3, which is 70, discarding the 6, 3 and 1 entirely)",
  "B": "Correct: 6(60) + 3(70) + 1(80) = 650, divided by the total weight 10, giving 65",
  "C": "Student makes misconception: weights_swapped (attaches the 3 to the 60 and the 6 to the 70, giving 180 + 420 + 80 = 680 over 10, which is 68)",
  "D": "Student makes misconception: largest_weight_matched_to_largest_score (assumes the weight of 6 belongs to the highest score, computing 1(60) + 3(70) + 6(80) = 750 over 10, which is 75)"
},
"misconception_tag": {
  "A": "weights_ignored",
  "C": "weights_swapped",
  "D": "largest_weight_matched_to_largest_score"
}
```

---

**2. A course grade is $50\%$ exams, $30\%$ projects, and $20\%$ presentation. A student scores $70$ on exams, $80$ on projects, and $90$ on the presentation. What is the course grade?**

Step 1: Multiply each weight by its score.
- $50 \times 70 = 3500$
- $30 \times 80 = 2400$
- $20 \times 90 = 1800$

Step 2: Add.
- $3500 + 2400 + 1800 = 7700$

Step 3: The weights add to $100$.

Step 4: Divide.
- $\frac{7700}{100} = 77$

**Answer: A** ($77$)

```json
"distractor_logic": {
  "A": "Correct: 50(70) + 30(80) + 20(90) = 7700, divided by the total weight 100, giving 77",
  "B": "Student makes misconception: weights_ignored (averages 70, 80 and 90 as equals for 240 over 3, which is 80)",
  "C": "Student makes misconception: weights_swapped (attaches the 30 to the 70 and the 50 to the 80, giving 2100 + 4000 + 1800 = 7900 over 100, which is 79)",
  "D": "Student makes misconception: largest_weight_matched_to_largest_score (assumes the 50 percent belongs to the highest score, computing 20(70) + 30(80) + 50(90) = 8300 over 100, which is 83)"
},
"misconception_tag": {
  "B": "weights_ignored",
  "C": "weights_swapped",
  "D": "largest_weight_matched_to_largest_score"
}
```

---

**3. A grade uses weights of $6$ for essays, $3$ for tests, and $1$ for attendance. A student scores $62$ on essays, $72$ on tests, and $82$ on attendance. What is the weighted mean?**

Step 1: Multiply.
- $6 \times 62 = 372$
- $3 \times 72 = 216$
- $1 \times 82 = 82$

Step 2: Add.
- $372 + 216 + 82 = 670$

Step 3: Total weight: $6 + 3 + 1 = 10$.

Step 4: Divide.
- $\frac{670}{10} = 67$

**Answer: C** ($67$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_swapped (attaches the 3 to the 62 and the 6 to the 72, giving 186 + 432 + 82 = 700 over 10, which is 70)",
  "B": "Student makes misconception: weights_ignored (averages 62, 72 and 82 as equals for 216 over 3, which is 72)",
  "C": "Correct: 6(62) + 3(72) + 1(82) = 670, divided by the total weight 10, giving 67",
  "D": "Student makes misconception: largest_weight_matched_to_largest_score (assumes the weight of 6 belongs to the highest score, computing 1(62) + 3(72) + 6(82) = 770 over 10, which is 77)"
},
"misconception_tag": {
  "A": "weights_swapped",
  "B": "weights_ignored",
  "D": "largest_weight_matched_to_largest_score"
}
```

---

**4. A training score uses weights of $5$ for practical work, $4$ for written work, and $1$ for safety. A trainee scores $58$ on practical, $78$ on written, and $98$ on safety. What is the weighted score?**

Step 1: Multiply.
- $5 \times 58 = 290$
- $4 \times 78 = 312$
- $1 \times 98 = 98$

Step 2: Add.
- $290 + 312 + 98 = 700$

Step 3: Total weight: $5 + 4 + 1 = 10$.

Step 4: Divide.
- $\frac{700}{10} = 70$

**Answer: D** ($70$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_swapped (attaches the 4 to the 58 and the 5 to the 78, giving 232 + 390 + 98 = 720 over 10, which is 72)",
  "B": "Student makes misconception: weights_ignored (averages 58, 78 and 98 as equals for 234 over 3, which is 78)",
  "C": "Student makes misconception: largest_weight_matched_to_largest_score (assumes the weight of 5 belongs to the highest score, computing 1(58) + 4(78) + 5(98) = 860 over 10, which is 86)",
  "D": "Correct: 5(58) + 4(78) + 1(98) = 700, divided by the total weight 10, giving 70"
},
"misconception_tag": {
  "A": "weights_swapped",
  "B": "weights_ignored",
  "C": "largest_weight_matched_to_largest_score"
}
```

---

**Proficient Level**

**5. A course grade is $50\%$ homework, $30\%$ midterm, and the rest final exam. A student scores $60$ on homework, $70$ on the midterm, and $80$ on the final. What is the course grade?**

Step 1: Find the missing weight before anything else.
- $100 - 50 - 30 = 20$, so the final is worth $20\%$

Step 2: Multiply.
- $50 \times 60 = 3000$
- $30 \times 70 = 2100$
- $20 \times 80 = 1600$

Step 3: Add and divide by $100$.
- $\frac{3000 + 2100 + 1600}{100} = \frac{6700}{100} = 67$

**Answer: B** ($67$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_ignored (averages 60, 70 and 80 as equals for 210 over 3, which is 70, never using the percentages at all)",
  "B": "Correct: the missing weight is 100 - 50 - 30 = 20, then 50(60) + 30(70) + 20(80) = 6700 over 100, giving 67",
  "C": "Student makes misconception: largest_weight_matched_to_largest_score (assumes the 50 percent belongs to the highest score, computing 20(60) + 30(70) + 50(80) = 7300 over 100, which is 73)",
  "D": "Student makes misconception: missing_weight_reused (never computes the missing weight and reuses the midterm's 30 for the final, giving 3000 + 2100 + 2400 = 7500 over 100, which is 75)"
},
"misconception_tag": {
  "A": "weights_ignored",
  "C": "largest_weight_matched_to_largest_score",
  "D": "missing_weight_reused"
}
```

---

**6. Three classes take the same test. A class of $25$ students averages $58$, a class of $15$ students averages $78$, and a class of $10$ students averages $98$. What is the average score across all three classes?**

The classes are different sizes, so the headcounts are the weights.

Step 1: Multiply each headcount by its class average.
- $25 \times 58 = 1450$
- $15 \times 78 = 1170$
- $10 \times 98 = 980$

Step 2: Add the products. This is the total of every student's score.
- $1450 + 1170 + 980 = 3600$

Step 3: Add the weights. This is the total number of students.
- $25 + 15 + 10 = 50$

Step 4: Divide.
- $\frac{3600}{50} = 72$

The largest class scored lowest, so the answer sits well below the plain average of $78$.

**Answer: C** ($72$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_swapped (attaches the 15 to the 58 and the 25 to the 78, giving 870 + 1950 + 980 = 3800 over 50, which is 76)",
  "B": "Student makes misconception: weights_ignored (averages the three class averages 58, 78 and 98 as equals for 234 over 3, which is 78, treating unequal classes as equal)",
  "C": "Correct: 25(58) + 15(78) + 10(98) = 3600 total points over 50 students, giving 72",
  "D": "Student makes misconception: largest_weight_matched_to_largest_score (assumes the largest class produced the highest average, computing 10(58) + 15(78) + 25(98) = 4200 over 50, which is 84)"
},
"misconception_tag": {
  "A": "weights_swapped",
  "B": "weights_ignored",
  "D": "largest_weight_matched_to_largest_score"
}
```

---

**7. A grade is $40\%$ homework, $20\%$ quizzes, $25\%$ midterm, and the rest final exam. A student scores $56$ on homework, $88$ on quizzes, $84$ on the midterm, and $60$ on the final. What is the course grade?**

Step 1: Find the missing weight.
- $100 - 40 - 20 - 25 = 15$, so the final is worth $15\%$

Step 2: Multiply.
- $40 \times 56 = 2240$
- $20 \times 88 = 1760$
- $25 \times 84 = 2100$
- $15 \times 60 = 900$

Step 3: Add and divide by $100$.
- $\frac{2240 + 1760 + 2100 + 900}{100} = \frac{7000}{100} = 70$

**Answer: A** ($70$)

```json
"distractor_logic": {
  "A": "Correct: the missing weight is 100 - 40 - 20 - 25 = 15, then 40(56) + 20(88) + 25(84) + 15(60) = 7000 over 100, giving 70",
  "B": "Student makes misconception: weights_ignored (averages 56, 88, 84 and 60 as equals for 288 over 4, which is 72)",
  "C": "Student makes misconception: weights_swapped (exchanges the first two weights and the last two, giving 20(56) + 40(88) + 15(84) + 25(60) = 7400 over 100, which is 74)",
  "D": "Student makes misconception: missing_weight_reused (never computes the missing weight and reuses the midterm's 25 for the final, giving 2240 + 1760 + 2100 + 1500 = 7600 over 100, which is 76)"
},
"misconception_tag": {
  "B": "weights_ignored",
  "C": "weights_swapped",
  "D": "missing_weight_reused"
}
```

---

**Advanced Level**

**8. Coursework is worth $75\%$ of a grade and a student has $80$. The final exam is worth the other $25\%$. What score does the student need on the final exam to finish with exactly $83$ overall?**

Step 1: Write the finished grade with $x$ for the unknown.
- $\frac{75 \times 80 + 25 \times x}{100} = 83$

Step 2: Multiply both sides by $100$.
- $6000 + 25x = 8300$

Step 3: Subtract the coursework contribution.
- $25x = 2300$

Step 4: Divide by the weight of the unknown.
- $x = \frac{2300}{25} = 92$

Check forward: $\frac{6000 + 25 \times 92}{100} = \frac{8300}{100} = 83$. Correct.

**Answer: D** ($92$)

```json
"distractor_logic": {
  "A": "Student makes misconception: target_weight_not_divided_out (stops at Step 3 with the points the final must contribute, 83 - 60 = 23, and reports that instead of dividing by the final's weight of 25 percent)",
  "B": "Student makes misconception: weights_swapped (treats coursework as the 25 percent and the final as the 75 percent, solving (8300 - 25(80)) / 75 = 6300 / 75 = 84)",
  "C": "Student makes misconception: weights_ignored (treats the two parts as equally weighted, so the final must be 2(83) - 80 = 86)",
  "D": "Correct: 25x = 8300 - 6000 = 2300, so x = 2300 / 25 = 92, confirmed by expanding forward to 83"
},
"misconception_tag": {
  "A": "target_weight_not_divided_out",
  "B": "weights_swapped",
  "C": "weights_ignored"
}
```

---

**9. Coursework is worth $80\%$ of a grade and a student has $90$. The final exam is worth the other $20\%$. What score does the student need on the final exam to finish with exactly $86$ overall?**

Step 1: Set it up.
- $\frac{80 \times 90 + 20 \times x}{100} = 86$

Step 2: Multiply by $100$.
- $7200 + 20x = 8600$

Step 3: Subtract.
- $20x = 1400$

Step 4: Divide by the weight of the unknown.
- $x = \frac{1400}{20} = 70$

Check forward: $\frac{7200 + 20 \times 70}{100} = \frac{8600}{100} = 86$. Correct.

Notice the answer is below the target. The student is carrying a $90$ into an $86$ target, so the final can afford to be weaker.

**Answer: B** ($70$)

```json
"distractor_logic": {
  "A": "Student makes misconception: target_weight_not_divided_out (stops at the points the final must contribute, 86 - 72 = 14, and reports that rather than dividing by the final's weight of 20 percent)",
  "B": "Correct: 20x = 8600 - 7200 = 1400, so x = 1400 / 20 = 70, confirmed by expanding forward to 86",
  "C": "Student makes misconception: weights_ignored (treats the two parts as equally weighted, so the final must be 2(86) - 90 = 82)",
  "D": "Student makes misconception: weights_swapped (treats coursework as the 20 percent and the final as the 80 percent, solving (8600 - 20(90)) / 80 = 6800 / 80 = 85)"
},
"misconception_tag": {
  "A": "target_weight_not_divided_out",
  "C": "weights_ignored",
  "D": "weights_swapped"
}
```

---

**10. A grade is $50\%$ theory, $30\%$ practical, and $20\%$ oral. A student scores $92$ on theory, $56$ on practical, and $86$ on oral. What is the course grade?**

Step 1: Multiply.
- $50 \times 92 = 4600$
- $30 \times 56 = 1680$
- $20 \times 86 = 1720$

Step 2: Add and divide by $100$.
- $\frac{4600 + 1680 + 1720}{100} = \frac{8000}{100} = 80$

The heaviest weight sits on the highest score here, so the answer lands above the plain average of $78$.

**Answer: C** ($80$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_ignored (averages 92, 56 and 86 as equals for 234 over 3, which is 78)",
  "B": "Student makes misconception: largest_weight_matched_to_largest_score (reorders so the 50 percent sits on the highest score and the 20 percent on the lowest, computing 20(56) + 30(86) + 50(92) = 8300 over 100, which is 83)",
  "C": "Correct: 50(92) + 30(56) + 20(86) = 8000 over 100, giving 80",
  "D": "Student makes misconception: reports_wrong_center_measure (reports the median of the three scores 56, 86 and 92, which is 86, instead of computing a weighted mean at all)"
},
"misconception_tag": {
  "A": "weights_ignored",
  "B": "largest_weight_matched_to_largest_score",
  "D": "reports_wrong_center_measure"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: A grade is $70\%$ coursework, $20\%$ project, and $10\%$ attendance. A student scores $58$ on coursework, $78$ on the project, and $98$ on attendance. What is the grade?**

Step 1: Multiply.
- $70 \times 58 = 4060$
- $20 \times 78 = 1560$
- $10 \times 98 = 980$

Step 2: Add and divide by $100$.
- $\frac{4060 + 1560 + 980}{100} = \frac{6600}{100} = 66$

**Answer: A** ($66$)

```json
"distractor_logic": {
  "A": "Correct: 70(58) + 20(78) + 10(98) = 6600 over 100, giving 66",
  "B": "Student makes misconception: weights_swapped (attaches the 20 to the 58 and the 70 to the 78, giving 1160 + 5460 + 980 = 7600 over 100, which is 76)",
  "C": "Student makes misconception: weights_ignored (averages 58, 78 and 98 as equals for 234 over 3, which is 78)",
  "D": "Student makes misconception: largest_weight_matched_to_largest_score (assumes the 70 percent belongs to the highest score, computing 10(58) + 20(78) + 70(98) = 9000 over 100, which is 90)"
},
"misconception_tag": {
  "B": "weights_swapped",
  "C": "weights_ignored",
  "D": "largest_weight_matched_to_largest_score"
}
```

---

**Item 2: A grade is $45\%$ writing, $35\%$ reading, and $20\%$ speaking. A student scores $58$ on writing, $78$ on reading, and $98$ on speaking. What is the grade?**

Step 1: Multiply.
- $45 \times 58 = 2610$
- $35 \times 78 = 2730$
- $20 \times 98 = 1960$

Step 2: Add and divide by $100$.
- $\frac{2610 + 2730 + 1960}{100} = \frac{7300}{100} = 73$

**Answer: D** ($73$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_swapped (attaches the 35 to the 58 and the 45 to the 78, giving 2030 + 3510 + 1960 = 7500 over 100, which is 75)",
  "B": "Student makes misconception: weights_ignored (averages 58, 78 and 98 as equals for 234 over 3, which is 78)",
  "C": "Student makes misconception: largest_weight_matched_to_largest_score (assumes the 45 percent belongs to the highest score, computing 20(58) + 35(78) + 45(98) = 8300 over 100, which is 83)",
  "D": "Correct: 45(58) + 35(78) + 20(98) = 7300 over 100, giving 73"
},
"misconception_tag": {
  "A": "weights_swapped",
  "B": "weights_ignored",
  "C": "largest_weight_matched_to_largest_score"
}
```

---

**Item 3: A grade is $50\%$ exams, $30\%$ labs, and $20\%$ homework. A student scores $96$ on exams, $60$ on labs, and $90$ on homework. What is the grade?**

Step 1: Multiply.
- $50 \times 96 = 4800$
- $30 \times 60 = 1800$
- $20 \times 90 = 1800$

Step 2: Add and divide by $100$.
- $\frac{4800 + 1800 + 1800}{100} = \frac{8400}{100} = 84$

**Answer: B** ($84$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_ignored (averages 96, 60 and 90 as equals for 246 over 3, which is 82)",
  "B": "Correct: 50(96) + 30(60) + 20(90) = 8400 over 100, giving 84",
  "C": "Student makes misconception: largest_weight_matched_to_largest_score (reorders so the 50 percent sits on the highest score and the 20 percent on the lowest, computing 20(60) + 30(90) + 50(96) = 8700 over 100, which is 87)",
  "D": "Student makes misconception: reports_wrong_center_measure (reports the median of the three scores 60, 90 and 96, which is 90, instead of computing a weighted mean at all)"
},
"misconception_tag": {
  "A": "weights_ignored",
  "C": "largest_weight_matched_to_largest_score",
  "D": "reports_wrong_center_measure"
}
```

---

**Item 4: Coursework is worth $75\%$ of a grade and a student has $84$. The final exam is worth the other $25\%$. What score does the student need on the final exam to finish with exactly $87$ overall?**

Step 1: Set it up.
- $\frac{75 \times 84 + 25 \times x}{100} = 87$

Step 2: Multiply by $100$.
- $6300 + 25x = 8700$

Step 3: Subtract.
- $25x = 2400$

Step 4: Divide by the weight of the unknown.
- $x = \frac{2400}{25} = 96$

Check forward: $\frac{6300 + 25 \times 96}{100} = \frac{8700}{100} = 87$. Correct.

**Answer: C** ($96$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_ignored (treats the two parts as equally weighted, so the final must be 2(87) - 84 = 90)",
  "B": "Student makes misconception: target_weight_not_divided_out (stops at the points the final must contribute, 87 - 63 = 24, and reports that rather than dividing by the final's weight of 25 percent)",
  "C": "Correct: 25x = 8700 - 6300 = 2400, so x = 2400 / 25 = 96, confirmed by expanding forward to 87",
  "D": "Student makes misconception: weights_swapped (treats coursework as the 25 percent and the final as the 75 percent, solving (8700 - 25(84)) / 75 = 6600 / 75 = 88)"
},
"misconception_tag": {
  "A": "weights_ignored",
  "B": "target_weight_not_divided_out",
  "D": "weights_swapped"
}
```

##### Extra Practice - Answer Key

**1. A grade combines a Test score of $90$ (weight $3$) and a Quiz score of $80$ (weight $1$). What is the weighted mean?**

Step 1: Multiply each score by its weight.
- $90 \times 3 = 270$
- $80 \times 1 = 80$

Step 2: Add the products and divide by the total weight.
- $(270 + 80) \div (3 + 1) = 350 \div 4 = 87.5$

**Answer: B** ($87.5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_ignored (takes the simple average of 90 and 80, giving 85, instead of weighting them)",
  "B": "Correct: multiplies each score by its weight, adds, and divides by the total weight for 87.5",
  "C": "Student makes misconception: weights_swapped (applies weight 1 to the Test and weight 3 to the Quiz)",
  "D": "Student makes misconception: answers_intermediate_value (reports the sum of the weighted products, 350, without dividing by the total weight)"
},
"misconception_tag": {
  "A": "weights_ignored",
  "C": "weights_swapped",
  "D": "answers_intermediate_value"
}
```

---

**2. A GPA combines Course A, a grade of $88$ (weight $4$ credits), and Course B, a grade of $92$ (weight $2$ credits). What is the weighted mean?**

Step 1: Multiply each grade by its credit weight.
- $88 \times 4 = 352$
- $92 \times 2 = 184$

Step 2: Add and divide by the total credits.
- $(352 + 184) \div (4 + 2) = 536 \div 6 \approx 89.33$

**Answer: C** ($89.33$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_ignored (takes the simple average of 88 and 92, giving 90, instead of weighting by credits)",
  "B": "Student makes misconception: answers_intermediate_value (reports the sum of the weighted products, 536, without dividing by the total credits)",
  "C": "Correct: weights each grade by its credits, adds, and divides by the total credits for about 89.33",
  "D": "Student makes misconception: weights_swapped (applies weight 2 to Course A and weight 4 to Course B)"
},
"misconception_tag": {
  "A": "weights_ignored",
  "B": "answers_intermediate_value",
  "D": "weights_swapped"
}
```

---

**3. A survey combines Group A, a score of $70$ from $20$ respondents, and Group B, a score of $90$ from $5$ respondents. What is the weighted mean score?**

Step 1: Multiply each score by its number of respondents.
- $70 \times 20 = 1400$
- $90 \times 5 = 450$

Step 2: Add and divide by the total respondents.
- $(1400 + 450) \div (20 + 5) = 1850 \div 25 = 74$

**Answer: D** ($74$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_ignored (takes the simple average of 70 and 90, giving 80, instead of weighting by respondents)",
  "B": "Student makes misconception: answers_intermediate_value (reports the sum of the weighted products, 1850, without dividing by the total respondents)",
  "C": "Student makes misconception: weights_swapped (applies 5 respondents to Group A and 20 to Group B)",
  "D": "Correct: weights each score by its respondents, adds, and divides by the total respondents for 74"
},
"misconception_tag": {
  "A": "weights_ignored",
  "B": "answers_intermediate_value",
  "C": "weights_swapped"
}
```

---

**4. A school average combines Section 1, an average of $75$ with $10$ students, and Section 2, an average of $85$ with $30$ students. What is the weighted mean?**

Step 1: Multiply each average by its number of students.
- $75 \times 10 = 750$
- $85 \times 30 = 2550$

Step 2: Add and divide by the total students.
- $(750 + 2550) \div (10 + 30) = 3300 \div 40 = 82.5$

**Answer: A** ($82.5$)

```json
"distractor_logic": {
  "A": "Correct: weights each average by its student count, adds, and divides by the total students for 82.5",
  "B": "Student makes misconception: weights_ignored (takes the simple average of 75 and 85, giving 80, instead of weighting by student count)",
  "C": "Student makes misconception: answers_intermediate_value (reports the sum of the weighted products, 3300, without dividing by the total students)",
  "D": "Student makes misconception: weights_swapped (applies 30 students to Section 1 and 10 to Section 2)"
},
"misconception_tag": {
  "B": "weights_ignored",
  "C": "answers_intermediate_value",
  "D": "weights_swapped"
}
```

---

**5. A course grade combines Exam $85$ (weight $5$), Homework $95$ (weight $2$), and Project $75$ (weight $3$). What is the weighted mean?**

Step 1: Multiply each score by its weight.
- $85 \times 5 = 425$
- $95 \times 2 = 190$
- $75 \times 3 = 225$

Step 2: Add and divide by the total weight.
- $(425 + 190 + 225) \div (5 + 2 + 3) = 840 \div 10 = 84$

**Answer: C** ($84$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_ignored (takes the simple average of 85, 95 and 75, giving 85, instead of weighting the three scores)",
  "B": "Student makes misconception: answers_intermediate_value (reports the sum of the weighted products, 840, without dividing by the total weight)",
  "C": "Correct: weights each score, adds the products, and divides by the total weight for 84",
  "D": "Student makes misconception: weights_swapped (exchanges the weights between Exam and Project, using weight 3 for Exam and weight 5 for Project)"
},
"misconception_tag": {
  "A": "weights_ignored",
  "B": "answers_intermediate_value",
  "D": "weights_swapped"
}
```

---

**6. A student's course grade is a weighted mean of Tests (weight $4$) and Homework (weight $2$). Tests average $90$, and the overall weighted mean is $84$. What is the homework average?**

Step 1: Set up the weighted mean equation.
- $(90 \times 4 + h \times 2) \div (4 + 2) = 84$

Step 2: Multiply both sides by $6$.
- $360 + 2h = 504$

Step 3: Solve for $h$.
- $2h = 144$, so $h = 72$

**Answer: B** ($72$)

```json
"distractor_logic": {
  "A": "Student makes misconception: target_weight_not_divided_out (subtracts the known contribution, 360, from the required total, 504, but never divides the result, 144, by homework's weight of 2)",
  "B": "Correct: solves $360 + 2h = 504$ for $h$, giving a homework average of 72",
  "C": "Student makes misconception: weights_ignored (assumes equal weighting and solves $h = 2(84) - 90 = 78$, the unweighted reverse-mean formula)",
  "D": "Student makes misconception: weights_swapped (applies weight 2 to Tests and weight 4 to Homework in the equation, solving $180 + 4h = 504$ for $h = 81$)"
},
"misconception_tag": {
  "A": "target_weight_not_divided_out",
  "C": "weights_ignored",
  "D": "weights_swapped"
}
```

---

**7. A restaurant's average rating combines Food, a score of $84$ (weight $5$), Service, a score of $76$ (weight $3$), and Ambiance, a score of $92$ (weight $2$). What is the weighted mean rating?**

Step 1: Multiply each score by its weight.
- $84 \times 5 = 420$
- $76 \times 3 = 228$
- $92 \times 2 = 184$

Step 2: Add and divide by the total weight.
- $(420 + 228 + 184) \div (5 + 3 + 2) = 832 \div 10 = 83.2$

**Answer: D** ($83.2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_ignored (takes the simple average of 84, 76 and 92, giving 84, instead of weighting the three scores)",
  "B": "Student makes misconception: answers_intermediate_value (reports the sum of the weighted products, 832, without dividing by the total weight)",
  "C": "Student makes misconception: weights_swapped (exchanges the weights between Food and Ambiance, using weight 2 for Food and weight 5 for Ambiance)",
  "D": "Correct: weights each score, adds the products, and divides by the total weight for 83.2"
},
"misconception_tag": {
  "A": "weights_ignored",
  "B": "answers_intermediate_value",
  "C": "weights_swapped"
}
```

---

**8. A student needs a weighted mean of $90$ across Tests (weight $3$, average $84$) and a Final Exam (weight $2$). What average does the student need on the Final Exam?**

Step 1: Set up the weighted mean equation.
- $(84 \times 3 + f \times 2) \div (3 + 2) = 90$

Step 2: Multiply both sides by $5$.
- $252 + 2f = 450$

Step 3: Solve for $f$.
- $2f = 198$, so $f = 99$

**Answer: A** ($99$)

```json
"distractor_logic": {
  "A": "Correct: solves $252 + 2f = 450$ for $f$, giving a needed Final Exam average of 99",
  "B": "Student makes misconception: target_weight_not_divided_out (subtracts the known contribution, 252, from the required total, 450, but never divides the result, 198, by the Final Exam's weight of 2)",
  "C": "Student makes misconception: weights_ignored (assumes equal weighting and solves $f = 2(90) - 84 = 96$, the unweighted reverse-mean formula)",
  "D": "Student makes misconception: weights_swapped (applies weight 2 to Tests and weight 3 to the Final Exam in the equation, solving $168 + 3f = 450$ for $f = 94$)"
},
"misconception_tag": {
  "B": "target_weight_not_divided_out",
  "C": "weights_ignored",
  "D": "weights_swapped"
}
```

---

**9. Class A has $20$ students with an average score of $78$, and Class B has $30$ students with an average score of $88$. What is the combined weighted mean score of both classes?**

Step 1: Multiply each average by its class size.
- $78 \times 20 = 1560$
- $88 \times 30 = 2640$

Step 2: Add and divide by the total students.
- $(1560 + 2640) \div (20 + 30) = 4200 \div 50 = 84$

**Answer: C** ($84$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_ignored (takes the simple average of 78 and 88, giving 83, instead of weighting by class size)",
  "B": "Student makes misconception: answers_intermediate_value (reports the sum of the weighted products, 4200, without dividing by the total students)",
  "C": "Correct: weights each class average by its size, adds, and divides by the total students for 84",
  "D": "Student makes misconception: weights_swapped (applies 30 students to Class A and 20 to Class B)"
},
"misconception_tag": {
  "A": "weights_ignored",
  "B": "answers_intermediate_value",
  "D": "weights_swapped"
}
```

---

**10. A student's final grade is a weighted mean of Tests, average $85$, and Projects, average $95$, and the overall weighted mean comes out to $89$. If Tests carry a weight of $3$, what weight do Projects carry?**

Step 1: Set up the weighted mean equation, letting $w$ be the Projects weight.
- $(85 \times 3 + 95 \times w) \div (3 + w) = 89$

Step 2: Multiply both sides by $(3 + w)$.
- $255 + 95w = 267 + 89w$

Step 3: Solve for $w$.
- $6w = 12$, so $w = 2$

**Answer: B** ($2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: weights_ignored (guesses the weights must match since the result is close to a simple average, reporting a Projects weight equal to Tests' weight of 3)",
  "B": "Correct: solves $255 + 95w = 267 + 89w$ for $w$, giving a Projects weight of 2",
  "C": "Student makes misconception: target_weight_not_divided_out (finds $6w = 12$ but reports 12 directly instead of dividing by the coefficient 6)",
  "D": "Student makes misconception: weights_swapped (sets up the equation with Projects fixed at weight 3 and Tests as the unknown, solving $285 + 85w = 267 + 89w$ for $w = 4.5$)"
},
"misconception_tag": {
  "A": "weights_ignored",
  "C": "target_weight_not_divided_out",
  "D": "weights_swapped"
}
```

---

#### **Part 5: Extra Practice**

More of the same skill, for a worksheet rather than for the mastery gate. These items are drawn by the worksheet generator and are not part of the 9-of-12 practice gate or the 3-of-4 quiz gate. Worked solutions for them sit at the end of Part 4.

**Basic Level**

1. A grade combines a Test score of $90$ (weight $3$) and a Quiz score of $80$ (weight $1$). What is the weighted mean?
   - A) $85$
   - B) $87.5$
   - C) $82.5$
   - D) $350$

2. A GPA combines Course A, a grade of $88$ (weight $4$ credits), and Course B, a grade of $92$ (weight $2$ credits). What is the weighted mean?
   - A) $90$
   - B) $536$
   - C) $89.33$
   - D) $90.67$

3. A survey combines Group A, a score of $70$ from $20$ respondents, and Group B, a score of $90$ from $5$ respondents. What is the weighted mean score?
   - A) $80$
   - B) $1850$
   - C) $86$
   - D) $74$

4. A school average combines Section 1, an average of $75$ with $10$ students, and Section 2, an average of $85$ with $30$ students. What is the weighted mean?
   - A) $82.5$
   - B) $80$
   - C) $3300$
   - D) $77.5$

**Proficient Level** (these require an extra step)

5. A course grade combines Exam $85$ (weight $5$), Homework $95$ (weight $2$), and Project $75$ (weight $3$). What is the weighted mean?
   - A) $85$
   - B) $840$
   - C) $84$
   - D) $82$

6. A student's course grade is a weighted mean of Tests (weight $4$) and Homework (weight $2$). Tests average $90$, and the overall weighted mean is $84$. What is the homework average?
   - A) $144$
   - B) $72$
   - C) $78$
   - D) $81$

7. A restaurant's average rating combines Food, a score of $84$ (weight $5$), Service, a score of $76$ (weight $3$), and Ambiance, a score of $92$ (weight $2$). What is the weighted mean rating?
   - A) $84$
   - B) $832$
   - C) $85.6$
   - D) $83.2$

**Advanced Level** (these need multiple steps or reverse thinking)

8. A student needs a weighted mean of $90$ across Tests (weight $3$, average $84$) and a Final Exam (weight $2$). What average does the student need on the Final Exam?
   - A) $99$
   - B) $198$
   - C) $96$
   - D) $94$

9. Class A has $20$ students with an average score of $78$, and Class B has $30$ students with an average score of $88$. What is the combined weighted mean score of both classes?
   - A) $83$
   - B) $4200$
   - C) $84$
   - D) $82$

10. A student's final grade is a weighted mean of Tests, average $85$, and Projects, average $95$, and the overall weighted mean comes out to $89$. If Tests carry a weight of $3$, what weight do Projects carry?
    - A) $3$
    - B) $2$
    - C) $12$
    - D) $4.5$
