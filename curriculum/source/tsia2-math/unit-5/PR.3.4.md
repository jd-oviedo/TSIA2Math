---
topic_name: "Conditional probability"
unit_number: 5
sequence_in_unit: 12
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "PR"
keywords: ["conditional probability", "given that", "two-way table", "row total", "restricted sample space", "joint probability"]
---

# PR.3.4 - Conditional Probability

**Topic ID:** PR.3.4  
**Unit:** 5  
**Strand:** PR (Probabilistic and Statistical Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Two Questions, Asked in Order

The previous topic had you draw twice and asked what the chances were that both went your way. This one hands you a group that has **already been observed** and tells you something about the person you picked. Nothing is drawn twice. One thing happened, and you are told part of the answer before you start.

Two questions, in this order:

1. **What is the condition, and who does it leave standing?** The words after "given that" name a smaller group. That group is your new whole world.
2. **Of that smaller group, how many satisfy the thing being asked about?**

**The confusion this topic exists to prevent is dividing by the wrong total.** Almost every wrong answer here is the right count over the wrong denominator, and the wrong denominator is almost always the one printed in the corner of the table.

---

##### The Condition Shrinks the World

$$P(A \mid B) = \frac{n(A \text{ and } B)}{n(B)}$$

Read the bar as **"given that"**. Everything to the right of it stops being an event and becomes the population you are working inside.

Here is the table this lesson uses.

| | Passed | Failed | Total |
|---|---|---|---|
| **Studied** | $18$ | $2$ | $20$ |
| **Did not study** | $6$ | $14$ | $20$ |
| **Total** | $24$ | $16$ | $40$ |

**Example 1:** Find the probability that a student passed, given that they studied.

Step 1: The condition is "studied". Cover the other row with your hand. There are $20$ students left, and $20$ is the denominator.

Step 2: Of those $20$, how many passed? $18$.

Step 3: Divide.
- $\frac{18}{20} = \frac{9}{10}$

Step 1 is the entire topic. **The number $40$ is on that table to be ignored.** It is the size of a world you were told you are no longer in.

---

##### Three Numbers That Are Not the Answer

The table above will hand you four plausible fractions with $18$ on top or nearby. Three of them are wrong, and each is wrong in a way worth naming.

**$\frac{18}{40}$, the joint probability.** This is the probability that a student studied **and** passed, picked from the whole school. It answers "how common is that combination", not "how did the studiers do". It is the answer to the previous topic's kind of question.

**$\frac{18}{24}$, the reversed conditional.** This is $P(\text{studied} \mid \text{passed})$: of the students who passed, what fraction had studied. That is a different question with a different denominator, and it usually has a different answer. Here it is $\frac{3}{4}$ against a true $\frac{9}{10}$.

**$\frac{24}{40}$, the prior.** This is just $P(\text{passed})$, ignoring the condition entirely. It is what you would have said before anyone told you the student studied.

$$\frac{18}{20} \quad \text{not} \quad \frac{18}{40} \quad \text{not} \quad \frac{18}{24} \quad \text{not} \quad \frac{24}{40}$$

**Every one of those is a real quantity.** None of them is the one that was asked for.

---

##### Both Directions Exist

**Example 2:** Using the same table, find the probability that a student studied, given that they passed.

Step 1: The condition is now "passed". Cover the Failed column. There are $24$ students left.

Step 2: Of those $24$, how many studied? $18$.

Step 3: Divide.
- $\frac{18}{24} = \frac{3}{4}$

Same cell, same $18$, different question, different answer. $\frac{9}{10}$ and $\frac{3}{4}$ are both correct answers to questions this table can ask.

**The order matters and it is not symmetric.** $P(A \mid B)$ and $P(B \mid A)$ are different numbers except by coincidence. Read which one is on the right of the bar, because that is the one that becomes the denominator.

---

##### The Mistake That Costs the Most Points

Read this section twice.

**Find the denominator before you find the numerator.**

The numerator is easy. It is the cell where the row and the column meet, and you will find it correctly nearly every time. The denominator is where the item is won or lost, and by the time you are looking for it you have already found $18$ and are keen to divide by something.

The mechanical defence is physical: **put your hand over the part of the table the condition excludes.** If the condition is "studied", the second row is gone. Not de-emphasised, gone. Then the only total still visible is $20$, and the grand total of $40$ is under your palm where it belongs.

Say it as a sentence before you divide: *"Out of the twenty students who studied, eighteen passed."* If your sentence starts with a number that is not your denominator, you have the wrong one.

---

##### When the Margins Are Not Printed

Tables on a test often leave the totals off, and the row total is exactly the number you need.

| | Yes | No |
|---|---|---|
| **Group A** | $21$ | $9$ |
| **Group B** | $12$ | $18$ |

**Example 3:** Find the probability of Yes, given Group A.

Step 1: Build the denominator. Group A has $21 + 9 = 30$ members.

Step 2: Of those, $21$ said Yes.

Step 3: Divide.
- $\frac{21}{30} = \frac{7}{10}$

Adding across the wrong direction is the risk here. The Yes **column** totals $21 + 12 = 33$, and $\frac{21}{33}$ is the answer to a different question. **Add along the row the condition names, not the column the outcome names.**

---

##### Counts That Overlap

The same reasoning works when the data arrives as overlapping group sizes rather than a grid.

**Example 4:** In a group of $60$ people, $24$ own a car, $30$ own a bike, and $18$ own both. Find the probability that a person owns a bike, given that they own a car.

Step 1: The condition is "owns a car", so the world is the $24$ car owners.

Step 2: Of those $24$, how many also own a bike? The overlap: $18$.

Step 3: Divide.
- $\frac{18}{24} = \frac{3}{4}$

The $30$ and the $60$ are both on the page and neither is the denominator. Dividing by $30$ answers "of the bike owners, how many own a car"; dividing by $60$ gives the joint probability.

---

##### The Five Traps

1. **Dividing by the grand total.** That is the joint probability, and it answers a different question.
2. **Reversing the condition.** $P(A \mid B)$ and $P(B \mid A)$ have different denominators. Read which side of the bar the condition is on.
3. **Ignoring the condition entirely.** Reporting the column total over the grand total is the probability before anyone told you anything.
4. **Adding along the wrong direction.** When margins are missing, total the row the condition names.
5. **Reaching for the denominator after the numerator.** Cover the excluded part of the table first, then look.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. What is the probability that a student passed, given that they studied?

   Of the $20$ students who studied, $18$ passed and $2$ failed. Of the $20$ who did not study, $6$ passed and $14$ failed. In all, $24$ passed, $16$ failed, and there are $40$ students.

   - A) $\frac{3}{4}$
   - B) $\frac{9}{10}$
   - C) $\frac{9}{20}$
   - D) $\frac{3}{5}$

2. What is the probability that a student failed, given that they did not study?

   Of the $20$ students who studied, $18$ passed and $2$ failed. Of the $20$ who did not study, $6$ passed and $14$ failed. In all, $24$ passed, $16$ failed, and there are $40$ students.

   - A) $\frac{7}{10}$
   - B) $\frac{7}{8}$
   - C) $\frac{7}{20}$
   - D) $\frac{2}{5}$

3. What is the probability that a student takes the bus, given that they are a junior?

   Of the $25$ juniors, $15$ take the bus and $10$ walk. Of the $25$ seniors, $9$ take the bus and $16$ walk. In all, $24$ take the bus, $26$ walk, and there are $50$ students.

   - A) $\frac{3}{10}$
   - B) $\frac{5}{8}$
   - C) $\frac{3}{5}$
   - D) $\frac{12}{25}$

4. What is the probability that a student walks, given that they are a senior?

   Of the $25$ juniors, $15$ take the bus and $10$ walk. Of the $25$ seniors, $9$ take the bus and $16$ walk. In all, $24$ take the bus, $26$ walk, and there are $50$ students.

   - A) $\frac{13}{25}$
   - B) $\frac{8}{13}$
   - C) $\frac{8}{25}$
   - D) $\frac{16}{25}$

**Proficient Level** (these require an extra step)

5. What is the probability that a person answered Yes, given that they are in Group A?

   Of the $30$ people in Group A, $18$ answered Yes and $12$ answered No. Of the $40$ people in Group B, $6$ answered Yes and $34$ answered No. In all, $24$ answered Yes, $46$ answered No, and there are $70$ people.

   - A) $\frac{9}{35}$
   - B) $\frac{3}{4}$
   - C) $\frac{3}{5}$
   - D) $\frac{12}{35}$

6. What is the probability that a person is in Group A, given that they answered Yes?

   Of the $30$ people in Group A, $18$ answered Yes and $12$ answered No. Of the $40$ people in Group B, $6$ answered Yes and $34$ answered No. In all, $24$ answered Yes, $46$ answered No, and there are $70$ people.

   - A) $\frac{3}{5}$
   - B) $\frac{9}{35}$
   - C) $\frac{3}{4}$
   - D) $\frac{3}{7}$

7. What is the probability that a person answered No, given that they are in Group B?

   Of the $30$ people in Group A, $18$ answered Yes and $12$ answered No. Of the $40$ people in Group B, $6$ answered Yes and $34$ answered No. In all, $24$ answered Yes, $46$ answered No, and there are $70$ people.

   - A) $\frac{17}{23}$
   - B) $\frac{17}{20}$
   - C) $\frac{17}{35}$
   - D) $\frac{23}{35}$

**Advanced Level** (these need multiple steps or reverse thinking)

8. What is the probability that a person answered Yes, given that they are in Group A?

   In Group A, $21$ answered Yes and $9$ answered No. In Group B, $12$ answered Yes and $18$ answered No. No totals are given.

   - A) $\frac{7}{11}$
   - B) $\frac{7}{20}$
   - C) $\frac{11}{20}$
   - D) $\frac{7}{10}$

9. What is the probability that a person is in Group B, given that they answered No?

   In Group A, $21$ answered Yes and $9$ answered No. In Group B, $12$ answered Yes and $18$ answered No. No totals are given.

   - A) $\frac{2}{3}$
   - B) $\frac{3}{5}$
   - C) $\frac{3}{10}$
   - D) $\frac{9}{20}$

10. In a group of $60$ people, $24$ own a car, $30$ own a bike, and $18$ own both. What is the probability that a person owns a bike, given that they own a car?

    - A) $\frac{3}{5}$
    - B) $\frac{3}{4}$
    - C) $\frac{3}{10}$
    - D) $\frac{1}{2}$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

What is the probability that a day had rain, given that it was a weekend day?

Of the $20$ weekend days, $9$ had rain and $11$ were dry. Of the $80$ weekdays, $27$ had rain and $53$ were dry. In all, $36$ days had rain, $64$ were dry, and there are $100$ days.

- A) $\frac{1}{4}$
- B) $\frac{9}{100}$
- C) $\frac{9}{25}$
- D) $\frac{9}{20}$

**Item 2**

What is the probability that a day was a weekday, given that it had rain?

Of the $20$ weekend days, $9$ had rain and $11$ were dry. Of the $80$ weekdays, $27$ had rain and $53$ were dry. In all, $36$ days had rain, $64$ were dry, and there are $100$ days.

- A) $\frac{27}{80}$
- B) $\frac{27}{100}$
- C) $\frac{3}{4}$
- D) $\frac{4}{5}$

**Item 3**

What is the probability that a candidate passed, given that they sat the morning session?

Of the $40$ candidates who sat the morning session, $30$ passed and $10$ failed. Of the $60$ who sat the evening session, $15$ passed and $45$ failed. In all, $45$ passed, $55$ failed, and there are $100$ candidates.

- A) $\frac{3}{4}$
- B) $\frac{2}{3}$
- C) $\frac{3}{10}$
- D) $\frac{9}{20}$

**Item 4**

What is the probability that a candidate failed, given that they sat the evening session?

Of the $40$ candidates who sat the morning session, $30$ passed and $10$ failed. Of the $60$ who sat the evening session, $15$ passed and $45$ failed. In all, $45$ passed, $55$ failed, and there are $100$ candidates.

- A) $\frac{9}{11}$
- B) $\frac{3}{4}$
- C) $\frac{9}{20}$
- D) $\frac{11}{20}$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. What is the probability that a student passed, given that they studied?**

Step 1: The condition is "studied", so the world is the Studied row: $20$ students.

Step 2: Of those $20$, the number who passed is $18$.

Step 3: Divide.
- $\frac{18}{20} = \frac{9}{10}$

**Answer: B** ($\frac{9}{10}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: conditional_reversed (answers P(studied given passed), dividing by the Passed column total of 24 to get 18 over 24, which is 3/4)",
  "B": "Correct: the condition restricts the world to the 20 who studied, and 18 of them passed, so 18 over 20 = 9/10",
  "C": "Student makes misconception: joint_reported_as_conditional (divides by the grand total, giving 18 over 40, which is 9/20, the probability that a student both studied and passed)",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports P(passed) as 24 over 40, which is 3/5, the answer before anyone mentioned studying)"
},
"misconception_tag": {
  "A": "conditional_reversed",
  "C": "joint_reported_as_conditional",
  "D": "prior_reported_ignoring_condition"
}
```

---

**2. What is the probability that a student failed, given that they did not study?**

Step 1: The condition restricts the world to the Did not study row: $20$ students.

Step 2: Of those $20$, the number who failed is $14$.

Step 3: Divide.
- $\frac{14}{20} = \frac{7}{10}$

**Answer: A** ($\frac{7}{10}$)

```json
"distractor_logic": {
  "A": "Correct: the condition restricts the world to the 20 who did not study, and 14 of them failed, so 14 over 20 = 7/10",
  "B": "Student makes misconception: conditional_reversed (answers P(did not study given failed), dividing by the Failed column total of 16 to get 14 over 16, which is 7/8)",
  "C": "Student makes misconception: joint_reported_as_conditional (divides by the grand total, giving 14 over 40, which is 7/20)",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports P(failed) as 16 over 40, which is 2/5, ignoring the condition entirely)"
},
"misconception_tag": {
  "B": "conditional_reversed",
  "C": "joint_reported_as_conditional",
  "D": "prior_reported_ignoring_condition"
}
```

---

**3. What is the probability that a student takes the bus, given that they are a junior?**

Step 1: The condition is "junior", so the world is $25$ students.

Step 2: Of those $25$, the number taking the bus is $15$.

Step 3: Divide.
- $\frac{15}{25} = \frac{3}{5}$

**Answer: C** ($\frac{3}{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: whole_population_as_denominator (keeps the correct numerator but divides by the school total of 50, giving 15 over 50, which is 3/10)",
  "B": "Student makes misconception: conditional_reversed (answers P(junior given bus), dividing by the Bus column total of 24 to get 15 over 24, which is 5/8)",
  "C": "Correct: the condition restricts the world to the 25 juniors, and 15 of them take the bus, so 15 over 25 = 3/5",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports P(bus) as 24 over 50, which is 12/25, without using the condition)"
},
"misconception_tag": {
  "A": "whole_population_as_denominator",
  "B": "conditional_reversed",
  "D": "prior_reported_ignoring_condition"
}
```

---

**4. What is the probability that a student walks, given that they are a senior?**

Step 1: The condition restricts the world to the $25$ seniors.

Step 2: Of those $25$, the number who walk is $16$.

Step 3: Divide.
- $\frac{16}{25}$

**Answer: D** ($\frac{16}{25}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: prior_reported_ignoring_condition (reports P(walk) as 26 over 50, which is 13/25, before the condition is applied)",
  "B": "Student makes misconception: conditional_reversed (answers P(senior given walk), dividing by the Walk column total of 26 to get 16 over 26, which is 8/13)",
  "C": "Student makes misconception: whole_population_as_denominator (keeps the correct numerator but divides by the school total of 50, giving 16 over 50, which is 8/25)",
  "D": "Correct: the condition restricts the world to the 25 seniors, and 16 of them walk, so the answer is 16 over 25"
},
"misconception_tag": {
  "A": "prior_reported_ignoring_condition",
  "B": "conditional_reversed",
  "C": "whole_population_as_denominator"
}
```

---

**Proficient Level**

**5. What is the probability that a person answered Yes, given that they are in Group A?**

Step 1: The condition restricts the world to Group A: $30$ people.

Step 2: Of those $30$, the number answering Yes is $18$.

Step 3: Divide.
- $\frac{18}{30} = \frac{3}{5}$

**Answer: C** ($\frac{3}{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: joint_reported_as_conditional (divides by the grand total, giving 18 over 70, which is 9/35, the probability of being in Group A and answering Yes)",
  "B": "Student makes misconception: conditional_reversed (answers P(Group A given Yes), dividing by the Yes column total of 24 to get 18 over 24, which is 3/4)",
  "C": "Correct: the condition restricts the world to the 30 people in Group A, and 18 answered Yes, so 18 over 30 = 3/5",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports P(Yes) as 24 over 70, which is 12/35, ignoring the group entirely)"
},
"misconception_tag": {
  "A": "joint_reported_as_conditional",
  "B": "conditional_reversed",
  "D": "prior_reported_ignoring_condition"
}
```

---

**6. What is the probability that a person is in Group A, given that they answered Yes?**

Step 1: The condition is now "answered Yes", so the world is the Yes column: $24$ people.

Step 2: Of those $24$, the number in Group A is $18$.

Step 3: Divide.
- $\frac{18}{24} = \frac{3}{4}$

Same cell as problem 5, different condition, different denominator, different answer.

**Answer: C** ($\frac{3}{4}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: conditional_reversed (answers the previous question instead, P(Yes given Group A), dividing by the Group A row total of 30 to get 18 over 30, which is 3/5)",
  "B": "Student makes misconception: joint_reported_as_conditional (divides by the grand total, giving 18 over 70, which is 9/35)",
  "C": "Correct: the condition restricts the world to the 24 who answered Yes, and 18 of them are in Group A, so 18 over 24 = 3/4",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports P(Group A) as 30 over 70, which is 3/7, without using the condition)"
},
"misconception_tag": {
  "A": "conditional_reversed",
  "B": "joint_reported_as_conditional",
  "D": "prior_reported_ignoring_condition"
}
```

---

**7. What is the probability that a person answered No, given that they are in Group B?**

Step 1: The condition restricts the world to Group B: $40$ people.

Step 2: Of those $40$, the number answering No is $34$.

Step 3: Divide.
- $\frac{34}{40} = \frac{17}{20}$

**Answer: B** ($\frac{17}{20}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: conditional_reversed (answers P(Group B given No), dividing by the No column total of 46 to get 34 over 46, which is 17/23)",
  "B": "Correct: the condition restricts the world to the 40 people in Group B, and 34 answered No, so 34 over 40 = 17/20",
  "C": "Student makes misconception: whole_population_as_denominator (keeps the correct numerator but divides by the grand total of 70, giving 34 over 70, which is 17/35)",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports P(No) as 46 over 70, which is 23/35, ignoring the group)"
},
"misconception_tag": {
  "A": "conditional_reversed",
  "C": "whole_population_as_denominator",
  "D": "prior_reported_ignoring_condition"
}
```

---

**Advanced Level**

**8. What is the probability that a person answered Yes, given that they are in Group A?**

Step 1: The table has no totals, so build the one the condition names. Group A has $21 + 9 = 30$ members.

Step 2: Of those $30$, the number answering Yes is $21$.

Step 3: Divide.
- $\frac{21}{30} = \frac{7}{10}$

**Answer: D** ($\frac{7}{10}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: conditional_reversed (totals the Yes column instead of the Group A row, computing 21 + 12 = 33 and answering 21 over 33, which is 7/11)",
  "B": "Student makes misconception: joint_reported_as_conditional (totals the whole table to 21 + 9 + 12 + 18 = 60 and divides by that, giving 21 over 60, which is 7/20)",
  "C": "Student makes misconception: prior_reported_ignoring_condition (reports P(Yes) across everyone, 33 over 60, which is 11/20, ignoring the group)",
  "D": "Correct: Group A totals 21 + 9 = 30, and 21 of them answered Yes, so 21 over 30 = 7/10"
},
"misconception_tag": {
  "A": "conditional_reversed",
  "B": "joint_reported_as_conditional",
  "C": "prior_reported_ignoring_condition"
}
```

---

**9. What is the probability that a person is in Group B, given that they answered No?**

Step 1: The condition is "answered No", so total that column: $9 + 18 = 27$.

Step 2: Of those $27$, the number in Group B is $18$.

Step 3: Divide.
- $\frac{18}{27} = \frac{2}{3}$

**Answer: A** ($\frac{2}{3}$)

```json
"distractor_logic": {
  "A": "Correct: the No column totals 9 + 18 = 27, and 18 of those are in Group B, so 18 over 27 = 2/3",
  "B": "Student makes misconception: conditional_reversed (totals the Group B row instead, computing 12 + 18 = 30 and answering 18 over 30, which is 3/5, the probability of No given Group B)",
  "C": "Student makes misconception: whole_population_as_denominator (keeps the correct numerator but divides by the table total of 60, giving 18 over 60, which is 3/10)",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports P(No) across everyone, 27 over 60, which is 9/20)"
},
"misconception_tag": {
  "B": "conditional_reversed",
  "C": "whole_population_as_denominator",
  "D": "prior_reported_ignoring_condition"
}
```

---

**10. In a group of $60$ people, $24$ own a car, $30$ own a bike, and $18$ own both. What is the probability that a person owns a bike, given that they own a car?**

Step 1: The condition is "owns a car", so the world is the $24$ car owners.

Step 2: Of those $24$, the number who also own a bike is the overlap, $18$.

Step 3: Divide.
- $\frac{18}{24} = \frac{3}{4}$

**Answer: B** ($\frac{3}{4}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: conditional_reversed (answers P(car given bike), dividing by the 30 bike owners to get 18 over 30, which is 3/5)",
  "B": "Correct: the condition restricts the world to the 24 car owners, and 18 of them also own a bike, so 18 over 24 = 3/4",
  "C": "Student makes misconception: joint_reported_as_conditional (divides by the whole group of 60, giving 18 over 60, which is 3/10, the probability of owning both)",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports P(bike) as 30 over 60, which is 1/2, before the condition is applied)"
},
"misconception_tag": {
  "A": "conditional_reversed",
  "C": "joint_reported_as_conditional",
  "D": "prior_reported_ignoring_condition"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: What is the probability that a day had rain, given that it was a weekend day?**

Step 1: The condition restricts the world to the $20$ weekend days.

Step 2: Of those $20$, the number with rain is $9$.

Step 3: Divide.
- $\frac{9}{20}$

**Answer: D** ($\frac{9}{20}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: conditional_reversed (answers P(weekend given rain), dividing by the Rain column total of 36 to get 9 over 36, which is 1/4)",
  "B": "Student makes misconception: joint_reported_as_conditional (divides by the grand total, giving 9 over 100, the probability that a day is both a weekend and rainy)",
  "C": "Student makes misconception: prior_reported_ignoring_condition (reports P(rain) as 36 over 100, which is 9/25, ignoring the condition)",
  "D": "Correct: the condition restricts the world to the 20 weekend days, and 9 had rain, so the answer is 9 over 20"
},
"misconception_tag": {
  "A": "conditional_reversed",
  "B": "joint_reported_as_conditional",
  "C": "prior_reported_ignoring_condition"
}
```

---

**Item 2: What is the probability that a day was a weekday, given that it had rain?**

Step 1: The condition is "had rain", so the world is the Rain column: $36$ days.

Step 2: Of those $36$, the number that were weekdays is $27$.

Step 3: Divide.
- $\frac{27}{36} = \frac{3}{4}$

**Answer: C** ($\frac{3}{4}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: conditional_reversed (answers P(rain given weekday), dividing by the Weekday row total of 80 to get 27 over 80)",
  "B": "Student makes misconception: joint_reported_as_conditional (divides by the grand total, giving 27 over 100)",
  "C": "Correct: the condition restricts the world to the 36 rainy days, and 27 of them were weekdays, so 27 over 36 = 3/4",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports P(weekday) as 80 over 100, which is 4/5, without using the condition)"
},
"misconception_tag": {
  "A": "conditional_reversed",
  "B": "joint_reported_as_conditional",
  "D": "prior_reported_ignoring_condition"
}
```

---

**Item 3: What is the probability that a candidate passed, given that they sat the morning session?**

Step 1: The condition restricts the world to the $40$ morning candidates.

Step 2: Of those $40$, the number who passed is $30$.

Step 3: Divide.
- $\frac{30}{40} = \frac{3}{4}$

**Answer: A** ($\frac{3}{4}$)

```json
"distractor_logic": {
  "A": "Correct: the condition restricts the world to the 40 morning candidates, and 30 passed, so 30 over 40 = 3/4",
  "B": "Student makes misconception: conditional_reversed (answers P(morning given passed), dividing by the Pass column total of 45 to get 30 over 45, which is 2/3)",
  "C": "Student makes misconception: whole_population_as_denominator (keeps the correct numerator but divides by the total of 100, giving 30 over 100, which is 3/10)",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports P(pass) as 45 over 100, which is 9/20, ignoring the session)"
},
"misconception_tag": {
  "B": "conditional_reversed",
  "C": "whole_population_as_denominator",
  "D": "prior_reported_ignoring_condition"
}
```

---

**Item 4: What is the probability that a candidate failed, given that they sat the evening session?**

Step 1: The condition restricts the world to the $60$ evening candidates.

Step 2: Of those $60$, the number who failed is $45$.

Step 3: Divide.
- $\frac{45}{60} = \frac{3}{4}$

**Answer: B** ($\frac{3}{4}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: conditional_reversed (answers P(evening given failed), dividing by the Fail column total of 55 to get 45 over 55, which is 9/11)",
  "B": "Correct: the condition restricts the world to the 60 evening candidates, and 45 failed, so 45 over 60 = 3/4",
  "C": "Student makes misconception: whole_population_as_denominator (keeps the correct numerator but divides by the total of 100, giving 45 over 100, which is 9/20)",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports P(fail) as 55 over 100, which is 11/20, ignoring the session)"
},
"misconception_tag": {
  "A": "conditional_reversed",
  "C": "whole_population_as_denominator",
  "D": "prior_reported_ignoring_condition"
}
```
