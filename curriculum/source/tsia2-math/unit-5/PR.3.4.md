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

#### **Learning Objectives**

- Calculate a conditional probability by restricting the total to the group named by the condition, not the grand total.
- Distinguish P(A given B) from P(B given A), recognizing they use different denominators and are not interchangeable.
- Build a row or column total from raw counts when a two-way table's margins are not printed.

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


<!-- figure: pr-3-4-p1 -->
![A two-way table of studying and passing. Columns are Passed, Failed, and Total. Students who studied: 18 passed, 2 failed, 20 in total. Students who did not study: 6 passed, 14 failed, 20 in total. Column totals: 24 passed, 16 failed, 40 students altogether.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTIwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHR3by13YXkgdGFibGUgb2Ygc3R1ZHlpbmcgYW5kIHBhc3NpbmcuIENvbHVtbnMgYXJlIFBhc3NlZCwgRmFpbGVkLCBhbmQgVG90YWwuIFN0dWRlbnRzIHdobyBzdHVkaWVkOiAxOCBwYXNzZWQsIDIgZmFpbGVkLCAyMCBpbiB0b3RhbC4gU3R1ZGVudHMgd2hvIGRpZCBub3Qgc3R1ZHk6IDYgcGFzc2VkLCAxNCBmYWlsZWQsIDIwIGluIHRvdGFsLiBDb2x1bW4gdG90YWxzOiAyNCBwYXNzZWQsIDE2IGZhaWxlZCwgNDAgc3R1ZGVudHMgYWx0b2dldGhlci4iPjxyZWN0IHdpZHRoPSIzNDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz48cmVjdCB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNTkuNDMiIGhlaWdodD0iMjQiIGZpbGw9IiM2RTlEQzgiIGZpbGwtb3BhY2l0eT0iMC4xOCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSBkYXRhLXZsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMSIgeDE9IjExMS40NiIgeTE9IjEyIiB4Mj0iMTExLjQ2IiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMiIgeDE9IjE3MS4xMiIgeTE9IjEyIiB4Mj0iMTcxLjEyIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMyIgeDE9IjIyNS4zMSIgeTE9IjEyIiB4Mj0iMjI1LjMxIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iNCIgeDE9IjI3MS40MyIgeTE9IjEyIiB4Mj0iMjcxLjQzIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS1obGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIyNzEuNDMiIHkyPSIxMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjEiIHgxPSIxMiIgeTE9IjM2IiB4Mj0iMjcxLjQzIiB5Mj0iMzYiLz48bGluZSBkYXRhLWhsaW5lPSIyIiB4MT0iMTIiIHkxPSI2MCIgeDI9IjI3MS40MyIgeTI9IjYwIi8+PGxpbmUgZGF0YS1obGluZT0iMyIgeDE9IjEyIiB5MT0iODQiIHgyPSIyNzEuNDMiIHkyPSI4NCIvPjxsaW5lIGRhdGEtaGxpbmU9IjQiIHgxPSIxMiIgeTE9IjEwOCIgeDI9IjI3MS40MyIgeTI9IjEwOCIvPjwvZz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzBFMEUxMSI+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSIxMTYuNDYiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5QYXNzZWQ8L3RleHQ+PHRleHQgZGF0YS1oZWFkPSIyIiB4PSIxNzYuMTIiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5GYWlsZWQ8L3RleHQ+PHRleHQgZGF0YS1oZWFkPSIzIiB4PSIyMzAuMzEiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMCIgeD0iMTciIHk9IjUyIiBmb250LXdlaWdodD0iNjAwIj5TdHVkaWVkPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0xIiB4PSIxMTYuNDYiIHk9IjUyIj4xODwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMiIgeD0iMTc2LjEyIiB5PSI1MiI+MjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMyIgeD0iMjMwLjMxIiB5PSI1MiI+MjA8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTAiIHg9IjE3IiB5PSI3NiIgZm9udC13ZWlnaHQ9IjYwMCI+RGlkIG5vdCBzdHVkeTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMSIgeD0iMTE2LjQ2IiB5PSI3NiI+NjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMiIgeD0iMTc2LjEyIiB5PSI3NiI+MTQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTMiIHg9IjIzMC4zMSIgeT0iNzYiPjIwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iMTE2LjQ2IiB5PSIxMDAiPjI0PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0yIiB4PSIxNzYuMTIiIHk9IjEwMCI+MTY8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTMiIHg9IjIzMC4zMSIgeT0iMTAwIj40MDwvdGV4dD48L2c+PC9zdmc+)

   - A) $\frac{3}{4}$
   - B) $\frac{9}{10}$
   - C) $\frac{9}{20}$
   - D) $\frac{3}{5}$

2. What is the probability that a student failed, given that they did not study?

   Of the $20$ students who studied, $18$ passed and $2$ failed. Of the $20$ who did not study, $6$ passed and $14$ failed. In all, $24$ passed, $16$ failed, and there are $40$ students.


<!-- figure: pr-3-4-p2 -->
![A two-way table of studying and passing. Columns are Passed, Failed, and Total. Students who studied: 18 passed, 2 failed, 20 in total. Students who did not study: 6 passed, 14 failed, 20 in total. Column totals: 24 passed, 16 failed, 40 students altogether.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTIwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHR3by13YXkgdGFibGUgb2Ygc3R1ZHlpbmcgYW5kIHBhc3NpbmcuIENvbHVtbnMgYXJlIFBhc3NlZCwgRmFpbGVkLCBhbmQgVG90YWwuIFN0dWRlbnRzIHdobyBzdHVkaWVkOiAxOCBwYXNzZWQsIDIgZmFpbGVkLCAyMCBpbiB0b3RhbC4gU3R1ZGVudHMgd2hvIGRpZCBub3Qgc3R1ZHk6IDYgcGFzc2VkLCAxNCBmYWlsZWQsIDIwIGluIHRvdGFsLiBDb2x1bW4gdG90YWxzOiAyNCBwYXNzZWQsIDE2IGZhaWxlZCwgNDAgc3R1ZGVudHMgYWx0b2dldGhlci4iPjxyZWN0IHdpZHRoPSIzNDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz48cmVjdCB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNTkuNDMiIGhlaWdodD0iMjQiIGZpbGw9IiM2RTlEQzgiIGZpbGwtb3BhY2l0eT0iMC4xOCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSBkYXRhLXZsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMSIgeDE9IjExMS40NiIgeTE9IjEyIiB4Mj0iMTExLjQ2IiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMiIgeDE9IjE3MS4xMiIgeTE9IjEyIiB4Mj0iMTcxLjEyIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMyIgeDE9IjIyNS4zMSIgeTE9IjEyIiB4Mj0iMjI1LjMxIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iNCIgeDE9IjI3MS40MyIgeTE9IjEyIiB4Mj0iMjcxLjQzIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS1obGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIyNzEuNDMiIHkyPSIxMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjEiIHgxPSIxMiIgeTE9IjM2IiB4Mj0iMjcxLjQzIiB5Mj0iMzYiLz48bGluZSBkYXRhLWhsaW5lPSIyIiB4MT0iMTIiIHkxPSI2MCIgeDI9IjI3MS40MyIgeTI9IjYwIi8+PGxpbmUgZGF0YS1obGluZT0iMyIgeDE9IjEyIiB5MT0iODQiIHgyPSIyNzEuNDMiIHkyPSI4NCIvPjxsaW5lIGRhdGEtaGxpbmU9IjQiIHgxPSIxMiIgeTE9IjEwOCIgeDI9IjI3MS40MyIgeTI9IjEwOCIvPjwvZz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzBFMEUxMSI+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSIxMTYuNDYiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5QYXNzZWQ8L3RleHQ+PHRleHQgZGF0YS1oZWFkPSIyIiB4PSIxNzYuMTIiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5GYWlsZWQ8L3RleHQ+PHRleHQgZGF0YS1oZWFkPSIzIiB4PSIyMzAuMzEiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMCIgeD0iMTciIHk9IjUyIiBmb250LXdlaWdodD0iNjAwIj5TdHVkaWVkPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0xIiB4PSIxMTYuNDYiIHk9IjUyIj4xODwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMiIgeD0iMTc2LjEyIiB5PSI1MiI+MjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMyIgeD0iMjMwLjMxIiB5PSI1MiI+MjA8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTAiIHg9IjE3IiB5PSI3NiIgZm9udC13ZWlnaHQ9IjYwMCI+RGlkIG5vdCBzdHVkeTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMSIgeD0iMTE2LjQ2IiB5PSI3NiI+NjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMiIgeD0iMTc2LjEyIiB5PSI3NiI+MTQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTMiIHg9IjIzMC4zMSIgeT0iNzYiPjIwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iMTE2LjQ2IiB5PSIxMDAiPjI0PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0yIiB4PSIxNzYuMTIiIHk9IjEwMCI+MTY8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTMiIHg9IjIzMC4zMSIgeT0iMTAwIj40MDwvdGV4dD48L2c+PC9zdmc+)

   - A) $\frac{7}{10}$
   - B) $\frac{7}{8}$
   - C) $\frac{7}{20}$
   - D) $\frac{2}{5}$

3. What is the probability that a student takes the bus, given that they are a junior?

   Of the $25$ juniors, $15$ take the bus and $10$ walk. Of the $25$ seniors, $9$ take the bus and $16$ walk. In all, $24$ take the bus, $26$ walk, and there are $50$ students.


<!-- figure: pr-3-4-p3 -->
![A two-way table of grade level and how students get to school. Columns are Bus, Walk, and Total. Juniors: 15 take the bus, 10 walk, 25 in total. Seniors: 9 take the bus, 16 walk, 25 in total. Column totals: 24 take the bus, 26 walk, 50 students altogether.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTIwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHR3by13YXkgdGFibGUgb2YgZ3JhZGUgbGV2ZWwgYW5kIGhvdyBzdHVkZW50cyBnZXQgdG8gc2Nob29sLiBDb2x1bW5zIGFyZSBCdXMsIFdhbGssIGFuZCBUb3RhbC4gSnVuaW9yczogMTUgdGFrZSB0aGUgYnVzLCAxMCB3YWxrLCAyNSBpbiB0b3RhbC4gU2VuaW9yczogOSB0YWtlIHRoZSBidXMsIDE2IHdhbGssIDI1IGluIHRvdGFsLiBDb2x1bW4gdG90YWxzOiAyNCB0YWtlIHRoZSBidXMsIDI2IHdhbGssIDUwIHN0dWRlbnRzIGFsdG9nZXRoZXIuIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iMTc2LjUiIGhlaWdodD0iMjQiIGZpbGw9IiM2RTlEQzgiIGZpbGwtb3BhY2l0eT0iMC4xOCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSBkYXRhLXZsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMSIgeDE9IjY2LjE5IiB5MT0iMTIiIHgyPSI2Ni4xOSIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjIiIHgxPSIxMDEuNjEiIHkxPSIxMiIgeDI9IjEwMS42MSIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjMiIHgxPSIxNDIuMzgiIHkxPSIxMiIgeDI9IjE0Mi4zOCIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjQiIHgxPSIxODguNSIgeTE9IjEyIiB4Mj0iMTg4LjUiIHkyPSIxMDgiLz48bGluZSBkYXRhLWhsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjE4OC41IiB5Mj0iMTIiLz48bGluZSBkYXRhLWhsaW5lPSIxIiB4MT0iMTIiIHkxPSIzNiIgeDI9IjE4OC41IiB5Mj0iMzYiLz48bGluZSBkYXRhLWhsaW5lPSIyIiB4MT0iMTIiIHkxPSI2MCIgeDI9IjE4OC41IiB5Mj0iNjAiLz48bGluZSBkYXRhLWhsaW5lPSIzIiB4MT0iMTIiIHkxPSI4NCIgeDI9IjE4OC41IiB5Mj0iODQiLz48bGluZSBkYXRhLWhsaW5lPSI0IiB4MT0iMTIiIHkxPSIxMDgiIHgyPSIxODguNSIgeTI9IjEwOCIvPjwvZz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzBFMEUxMSI+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSI3MS4xOSIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPkJ1czwvdGV4dD48dGV4dCBkYXRhLWhlYWQ9IjIiIHg9IjEwNi42MSIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPldhbGs8L3RleHQ+PHRleHQgZGF0YS1oZWFkPSIzIiB4PSIxNDcuMzgiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMCIgeD0iMTciIHk9IjUyIiBmb250LXdlaWdodD0iNjAwIj5KdW5pb3I8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTEiIHg9IjcxLjE5IiB5PSI1MiI+MTU8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTIiIHg9IjEwNi42MSIgeT0iNTIiPjEwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0zIiB4PSIxNDcuMzgiIHk9IjUyIj4yNTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMCIgeD0iMTciIHk9Ijc2IiBmb250LXdlaWdodD0iNjAwIj5TZW5pb3I8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTEiIHg9IjcxLjE5IiB5PSI3NiI+OTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMiIgeD0iMTA2LjYxIiB5PSI3NiI+MTY8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTMiIHg9IjE0Ny4zOCIgeT0iNzYiPjI1PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iNzEuMTkiIHk9IjEwMCI+MjQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTIiIHg9IjEwNi42MSIgeT0iMTAwIj4yNjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMyIgeD0iMTQ3LjM4IiB5PSIxMDAiPjUwPC90ZXh0PjwvZz48L3N2Zz4=)

   - A) $\frac{3}{10}$
   - B) $\frac{5}{8}$
   - C) $\frac{3}{5}$
   - D) $\frac{12}{25}$

4. What is the probability that a student walks, given that they are a senior?

   Of the $25$ juniors, $15$ take the bus and $10$ walk. Of the $25$ seniors, $9$ take the bus and $16$ walk. In all, $24$ take the bus, $26$ walk, and there are $50$ students.


<!-- figure: pr-3-4-p4 -->
![A two-way table of grade level and how students get to school. Columns are Bus, Walk, and Total. Juniors: 15 take the bus, 10 walk, 25 in total. Seniors: 9 take the bus, 16 walk, 25 in total. Column totals: 24 take the bus, 26 walk, 50 students altogether.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTIwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHR3by13YXkgdGFibGUgb2YgZ3JhZGUgbGV2ZWwgYW5kIGhvdyBzdHVkZW50cyBnZXQgdG8gc2Nob29sLiBDb2x1bW5zIGFyZSBCdXMsIFdhbGssIGFuZCBUb3RhbC4gSnVuaW9yczogMTUgdGFrZSB0aGUgYnVzLCAxMCB3YWxrLCAyNSBpbiB0b3RhbC4gU2VuaW9yczogOSB0YWtlIHRoZSBidXMsIDE2IHdhbGssIDI1IGluIHRvdGFsLiBDb2x1bW4gdG90YWxzOiAyNCB0YWtlIHRoZSBidXMsIDI2IHdhbGssIDUwIHN0dWRlbnRzIGFsdG9nZXRoZXIuIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iMTc2LjUiIGhlaWdodD0iMjQiIGZpbGw9IiM2RTlEQzgiIGZpbGwtb3BhY2l0eT0iMC4xOCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSBkYXRhLXZsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMSIgeDE9IjY2LjE5IiB5MT0iMTIiIHgyPSI2Ni4xOSIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjIiIHgxPSIxMDEuNjEiIHkxPSIxMiIgeDI9IjEwMS42MSIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjMiIHgxPSIxNDIuMzgiIHkxPSIxMiIgeDI9IjE0Mi4zOCIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjQiIHgxPSIxODguNSIgeTE9IjEyIiB4Mj0iMTg4LjUiIHkyPSIxMDgiLz48bGluZSBkYXRhLWhsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjE4OC41IiB5Mj0iMTIiLz48bGluZSBkYXRhLWhsaW5lPSIxIiB4MT0iMTIiIHkxPSIzNiIgeDI9IjE4OC41IiB5Mj0iMzYiLz48bGluZSBkYXRhLWhsaW5lPSIyIiB4MT0iMTIiIHkxPSI2MCIgeDI9IjE4OC41IiB5Mj0iNjAiLz48bGluZSBkYXRhLWhsaW5lPSIzIiB4MT0iMTIiIHkxPSI4NCIgeDI9IjE4OC41IiB5Mj0iODQiLz48bGluZSBkYXRhLWhsaW5lPSI0IiB4MT0iMTIiIHkxPSIxMDgiIHgyPSIxODguNSIgeTI9IjEwOCIvPjwvZz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzBFMEUxMSI+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSI3MS4xOSIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPkJ1czwvdGV4dD48dGV4dCBkYXRhLWhlYWQ9IjIiIHg9IjEwNi42MSIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPldhbGs8L3RleHQ+PHRleHQgZGF0YS1oZWFkPSIzIiB4PSIxNDcuMzgiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMCIgeD0iMTciIHk9IjUyIiBmb250LXdlaWdodD0iNjAwIj5KdW5pb3I8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTEiIHg9IjcxLjE5IiB5PSI1MiI+MTU8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTIiIHg9IjEwNi42MSIgeT0iNTIiPjEwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0zIiB4PSIxNDcuMzgiIHk9IjUyIj4yNTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMCIgeD0iMTciIHk9Ijc2IiBmb250LXdlaWdodD0iNjAwIj5TZW5pb3I8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTEiIHg9IjcxLjE5IiB5PSI3NiI+OTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMiIgeD0iMTA2LjYxIiB5PSI3NiI+MTY8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTMiIHg9IjE0Ny4zOCIgeT0iNzYiPjI1PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iNzEuMTkiIHk9IjEwMCI+MjQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTIiIHg9IjEwNi42MSIgeT0iMTAwIj4yNjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMyIgeD0iMTQ3LjM4IiB5PSIxMDAiPjUwPC90ZXh0PjwvZz48L3N2Zz4=)

   - A) $\frac{13}{25}$
   - B) $\frac{8}{13}$
   - C) $\frac{8}{25}$
   - D) $\frac{16}{25}$

**Proficient Level** (these require an extra step)

5. What is the probability that a person answered Yes, given that they are in Group A?

   Of the $30$ people in Group A, $18$ answered Yes and $12$ answered No. Of the $40$ people in Group B, $6$ answered Yes and $34$ answered No. In all, $24$ answered Yes, $46$ answered No, and there are $70$ people.


<!-- figure: pr-3-4-p5 -->
![A two-way table of group and answer. Columns are Yes, No, and Total. Group A: 18 answered Yes, 12 answered No, 30 in total. Group B: 6 answered Yes, 34 answered No, 40 in total. Column totals: 24 answered Yes, 46 answered No, 70 people altogether.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTIwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHR3by13YXkgdGFibGUgb2YgZ3JvdXAgYW5kIGFuc3dlci4gQ29sdW1ucyBhcmUgWWVzLCBObywgYW5kIFRvdGFsLiBHcm91cCBBOiAxOCBhbnN3ZXJlZCBZZXMsIDEyIGFuc3dlcmVkIE5vLCAzMCBpbiB0b3RhbC4gR3JvdXAgQjogNiBhbnN3ZXJlZCBZZXMsIDM0IGFuc3dlcmVkIE5vLCA0MCBpbiB0b3RhbC4gQ29sdW1uIHRvdGFsczogMjQgYW5zd2VyZWQgWWVzLCA0NiBhbnN3ZXJlZCBObywgNzAgcGVvcGxlIGFsdG9nZXRoZXIuIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iMTcwLjgiIGhlaWdodD0iMjQiIGZpbGw9IiM2RTlEQzgiIGZpbGwtb3BhY2l0eT0iMC4xOCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSBkYXRhLXZsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMSIgeDE9IjczLjkyIiB5MT0iMTIiIHgyPSI3My45MiIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjIiIHgxPSIxMDkuMzQiIHkxPSIxMiIgeDI9IjEwOS4zNCIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjMiIHgxPSIxMzYuNjgiIHkxPSIxMiIgeDI9IjEzNi42OCIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjQiIHgxPSIxODIuOCIgeTE9IjEyIiB4Mj0iMTgyLjgiIHkyPSIxMDgiLz48bGluZSBkYXRhLWhsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjE4Mi44IiB5Mj0iMTIiLz48bGluZSBkYXRhLWhsaW5lPSIxIiB4MT0iMTIiIHkxPSIzNiIgeDI9IjE4Mi44IiB5Mj0iMzYiLz48bGluZSBkYXRhLWhsaW5lPSIyIiB4MT0iMTIiIHkxPSI2MCIgeDI9IjE4Mi44IiB5Mj0iNjAiLz48bGluZSBkYXRhLWhsaW5lPSIzIiB4MT0iMTIiIHkxPSI4NCIgeDI9IjE4Mi44IiB5Mj0iODQiLz48bGluZSBkYXRhLWhsaW5lPSI0IiB4MT0iMTIiIHkxPSIxMDgiIHgyPSIxODIuOCIgeTI9IjEwOCIvPjwvZz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzBFMEUxMSI+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSI3OC45MiIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPlllczwvdGV4dD48dGV4dCBkYXRhLWhlYWQ9IjIiIHg9IjExNC4zNCIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPk5vPC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMyIgeD0iMTQxLjY4IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+VG90YWw8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTAiIHg9IjE3IiB5PSI1MiIgZm9udC13ZWlnaHQ9IjYwMCI+R3JvdXAgQTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iNzguOTIiIHk9IjUyIj4xODwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMiIgeD0iMTE0LjM0IiB5PSI1MiI+MTI8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTMiIHg9IjE0MS42OCIgeT0iNTIiPjMwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPkdyb3VwIEI8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTEiIHg9Ijc4LjkyIiB5PSI3NiI+NjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMiIgeD0iMTE0LjM0IiB5PSI3NiI+MzQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTMiIHg9IjE0MS42OCIgeT0iNzYiPjQwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iNzguOTIiIHk9IjEwMCI+MjQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTIiIHg9IjExNC4zNCIgeT0iMTAwIj40NjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMyIgeD0iMTQxLjY4IiB5PSIxMDAiPjcwPC90ZXh0PjwvZz48L3N2Zz4=)

   - A) $\frac{9}{35}$
   - B) $\frac{3}{4}$
   - C) $\frac{3}{5}$
   - D) $\frac{12}{35}$

6. What is the probability that a person is in Group A, given that they answered Yes?

   Of the $30$ people in Group A, $18$ answered Yes and $12$ answered No. Of the $40$ people in Group B, $6$ answered Yes and $34$ answered No. In all, $24$ answered Yes, $46$ answered No, and there are $70$ people.


<!-- figure: pr-3-4-p6 -->
![A two-way table of group and answer. Columns are Yes, No, and Total. Group A: 18 answered Yes, 12 answered No, 30 in total. Group B: 6 answered Yes, 34 answered No, 40 in total. Column totals: 24 answered Yes, 46 answered No, 70 people altogether.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTIwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHR3by13YXkgdGFibGUgb2YgZ3JvdXAgYW5kIGFuc3dlci4gQ29sdW1ucyBhcmUgWWVzLCBObywgYW5kIFRvdGFsLiBHcm91cCBBOiAxOCBhbnN3ZXJlZCBZZXMsIDEyIGFuc3dlcmVkIE5vLCAzMCBpbiB0b3RhbC4gR3JvdXAgQjogNiBhbnN3ZXJlZCBZZXMsIDM0IGFuc3dlcmVkIE5vLCA0MCBpbiB0b3RhbC4gQ29sdW1uIHRvdGFsczogMjQgYW5zd2VyZWQgWWVzLCA0NiBhbnN3ZXJlZCBObywgNzAgcGVvcGxlIGFsdG9nZXRoZXIuIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iMTcwLjgiIGhlaWdodD0iMjQiIGZpbGw9IiM2RTlEQzgiIGZpbGwtb3BhY2l0eT0iMC4xOCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSBkYXRhLXZsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMSIgeDE9IjczLjkyIiB5MT0iMTIiIHgyPSI3My45MiIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjIiIHgxPSIxMDkuMzQiIHkxPSIxMiIgeDI9IjEwOS4zNCIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjMiIHgxPSIxMzYuNjgiIHkxPSIxMiIgeDI9IjEzNi42OCIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjQiIHgxPSIxODIuOCIgeTE9IjEyIiB4Mj0iMTgyLjgiIHkyPSIxMDgiLz48bGluZSBkYXRhLWhsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjE4Mi44IiB5Mj0iMTIiLz48bGluZSBkYXRhLWhsaW5lPSIxIiB4MT0iMTIiIHkxPSIzNiIgeDI9IjE4Mi44IiB5Mj0iMzYiLz48bGluZSBkYXRhLWhsaW5lPSIyIiB4MT0iMTIiIHkxPSI2MCIgeDI9IjE4Mi44IiB5Mj0iNjAiLz48bGluZSBkYXRhLWhsaW5lPSIzIiB4MT0iMTIiIHkxPSI4NCIgeDI9IjE4Mi44IiB5Mj0iODQiLz48bGluZSBkYXRhLWhsaW5lPSI0IiB4MT0iMTIiIHkxPSIxMDgiIHgyPSIxODIuOCIgeTI9IjEwOCIvPjwvZz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzBFMEUxMSI+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSI3OC45MiIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPlllczwvdGV4dD48dGV4dCBkYXRhLWhlYWQ9IjIiIHg9IjExNC4zNCIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPk5vPC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMyIgeD0iMTQxLjY4IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+VG90YWw8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTAiIHg9IjE3IiB5PSI1MiIgZm9udC13ZWlnaHQ9IjYwMCI+R3JvdXAgQTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iNzguOTIiIHk9IjUyIj4xODwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMiIgeD0iMTE0LjM0IiB5PSI1MiI+MTI8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTMiIHg9IjE0MS42OCIgeT0iNTIiPjMwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPkdyb3VwIEI8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTEiIHg9Ijc4LjkyIiB5PSI3NiI+NjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMiIgeD0iMTE0LjM0IiB5PSI3NiI+MzQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTMiIHg9IjE0MS42OCIgeT0iNzYiPjQwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iNzguOTIiIHk9IjEwMCI+MjQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTIiIHg9IjExNC4zNCIgeT0iMTAwIj40NjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMyIgeD0iMTQxLjY4IiB5PSIxMDAiPjcwPC90ZXh0PjwvZz48L3N2Zz4=)

   - A) $\frac{3}{5}$
   - B) $\frac{9}{35}$
   - C) $\frac{3}{4}$
   - D) $\frac{3}{7}$

7. What is the probability that a person answered No, given that they are in Group B?

   Of the $30$ people in Group A, $18$ answered Yes and $12$ answered No. Of the $40$ people in Group B, $6$ answered Yes and $34$ answered No. In all, $24$ answered Yes, $46$ answered No, and there are $70$ people.


<!-- figure: pr-3-4-p7 -->
![A two-way table of group and answer. Columns are Yes, No, and Total. Group A: 18 answered Yes, 12 answered No, 30 in total. Group B: 6 answered Yes, 34 answered No, 40 in total. Column totals: 24 answered Yes, 46 answered No, 70 people altogether.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTIwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHR3by13YXkgdGFibGUgb2YgZ3JvdXAgYW5kIGFuc3dlci4gQ29sdW1ucyBhcmUgWWVzLCBObywgYW5kIFRvdGFsLiBHcm91cCBBOiAxOCBhbnN3ZXJlZCBZZXMsIDEyIGFuc3dlcmVkIE5vLCAzMCBpbiB0b3RhbC4gR3JvdXAgQjogNiBhbnN3ZXJlZCBZZXMsIDM0IGFuc3dlcmVkIE5vLCA0MCBpbiB0b3RhbC4gQ29sdW1uIHRvdGFsczogMjQgYW5zd2VyZWQgWWVzLCA0NiBhbnN3ZXJlZCBObywgNzAgcGVvcGxlIGFsdG9nZXRoZXIuIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iMTcwLjgiIGhlaWdodD0iMjQiIGZpbGw9IiM2RTlEQzgiIGZpbGwtb3BhY2l0eT0iMC4xOCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSBkYXRhLXZsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMSIgeDE9IjczLjkyIiB5MT0iMTIiIHgyPSI3My45MiIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjIiIHgxPSIxMDkuMzQiIHkxPSIxMiIgeDI9IjEwOS4zNCIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjMiIHgxPSIxMzYuNjgiIHkxPSIxMiIgeDI9IjEzNi42OCIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjQiIHgxPSIxODIuOCIgeTE9IjEyIiB4Mj0iMTgyLjgiIHkyPSIxMDgiLz48bGluZSBkYXRhLWhsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjE4Mi44IiB5Mj0iMTIiLz48bGluZSBkYXRhLWhsaW5lPSIxIiB4MT0iMTIiIHkxPSIzNiIgeDI9IjE4Mi44IiB5Mj0iMzYiLz48bGluZSBkYXRhLWhsaW5lPSIyIiB4MT0iMTIiIHkxPSI2MCIgeDI9IjE4Mi44IiB5Mj0iNjAiLz48bGluZSBkYXRhLWhsaW5lPSIzIiB4MT0iMTIiIHkxPSI4NCIgeDI9IjE4Mi44IiB5Mj0iODQiLz48bGluZSBkYXRhLWhsaW5lPSI0IiB4MT0iMTIiIHkxPSIxMDgiIHgyPSIxODIuOCIgeTI9IjEwOCIvPjwvZz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzBFMEUxMSI+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSI3OC45MiIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPlllczwvdGV4dD48dGV4dCBkYXRhLWhlYWQ9IjIiIHg9IjExNC4zNCIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPk5vPC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMyIgeD0iMTQxLjY4IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+VG90YWw8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTAiIHg9IjE3IiB5PSI1MiIgZm9udC13ZWlnaHQ9IjYwMCI+R3JvdXAgQTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iNzguOTIiIHk9IjUyIj4xODwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMiIgeD0iMTE0LjM0IiB5PSI1MiI+MTI8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTMiIHg9IjE0MS42OCIgeT0iNTIiPjMwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPkdyb3VwIEI8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTEiIHg9Ijc4LjkyIiB5PSI3NiI+NjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMiIgeD0iMTE0LjM0IiB5PSI3NiI+MzQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTMiIHg9IjE0MS42OCIgeT0iNzYiPjQwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iNzguOTIiIHk9IjEwMCI+MjQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTIiIHg9IjExNC4zNCIgeT0iMTAwIj40NjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMyIgeD0iMTQxLjY4IiB5PSIxMDAiPjcwPC90ZXh0PjwvZz48L3N2Zz4=)

   - A) $\frac{17}{23}$
   - B) $\frac{17}{20}$
   - C) $\frac{17}{35}$
   - D) $\frac{23}{35}$

**Advanced Level** (these need multiple steps or reverse thinking)

8. What is the probability that a person answered Yes, given that they are in Group A?

   In Group A, $21$ answered Yes and $9$ answered No. In Group B, $12$ answered Yes and $18$ answered No. No totals are given.


<!-- figure: pr-3-4-p8 -->
![A two-way table of group and answer with no totals shown. Columns are Yes and No. Group A: 21 answered Yes and 9 answered No. Group B: 12 answered Yes and 18 answered No.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgOTYiIHdpZHRoPSIzNDAiIGhlaWdodD0iOTYiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0iQSB0d28td2F5IHRhYmxlIG9mIGdyb3VwIGFuZCBhbnN3ZXIgd2l0aCBubyB0b3RhbHMgc2hvd24uIENvbHVtbnMgYXJlIFllcyBhbmQgTm8uIEdyb3VwIEE6IDIxIGFuc3dlcmVkIFllcyBhbmQgOSBhbnN3ZXJlZCBOby4gR3JvdXAgQjogMTIgYW5zd2VyZWQgWWVzIGFuZCAxOCBhbnN3ZXJlZCBOby4iPjxyZWN0IHdpZHRoPSIzNDAiIGhlaWdodD0iOTYiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjEyNC42OCIgaGVpZ2h0PSIyNCIgZmlsbD0iIzZFOURDOCIgZmlsbC1vcGFjaXR5PSIwLjE4Ii8+PGcgc3Ryb2tlPSIjRTJEQ0NBIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIGRhdGEtdmxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTIiIHkyPSI4NCIvPjxsaW5lIGRhdGEtdmxpbmU9IjEiIHgxPSI3My45MiIgeTE9IjEyIiB4Mj0iNzMuOTIiIHkyPSI4NCIvPjxsaW5lIGRhdGEtdmxpbmU9IjIiIHgxPSIxMDkuMzQiIHkxPSIxMiIgeDI9IjEwOS4zNCIgeTI9Ijg0Ii8+PGxpbmUgZGF0YS12bGluZT0iMyIgeDE9IjEzNi42OCIgeTE9IjEyIiB4Mj0iMTM2LjY4IiB5Mj0iODQiLz48bGluZSBkYXRhLWhsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjEzNi42OCIgeTI9IjEyIi8+PGxpbmUgZGF0YS1obGluZT0iMSIgeDE9IjEyIiB5MT0iMzYiIHgyPSIxMzYuNjgiIHkyPSIzNiIvPjxsaW5lIGRhdGEtaGxpbmU9IjIiIHgxPSIxMiIgeTE9IjYwIiB4Mj0iMTM2LjY4IiB5Mj0iNjAiLz48bGluZSBkYXRhLWhsaW5lPSIzIiB4MT0iMTIiIHkxPSI4NCIgeDI9IjEzNi42OCIgeTI9Ijg0Ii8+PC9nPjxnIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmaWxsPSIjMEUwRTExIj48dGV4dCBkYXRhLWhlYWQ9IjEiIHg9Ijc4LjkyIiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+WWVzPC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMiIgeD0iMTE0LjM0IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+Tm88L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTAiIHg9IjE3IiB5PSI1MiIgZm9udC13ZWlnaHQ9IjYwMCI+R3JvdXAgQTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iNzguOTIiIHk9IjUyIj4yMTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMiIgeD0iMTE0LjM0IiB5PSI1MiI+OTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMCIgeD0iMTciIHk9Ijc2IiBmb250LXdlaWdodD0iNjAwIj5Hcm91cCBCPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0xIiB4PSI3OC45MiIgeT0iNzYiPjEyPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0yIiB4PSIxMTQuMzQiIHk9Ijc2Ij4xODwvdGV4dD48L2c+PC9zdmc+)

   - A) $\frac{7}{11}$
   - B) $\frac{7}{20}$
   - C) $\frac{11}{20}$
   - D) $\frac{7}{10}$

9. What is the probability that a person is in Group B, given that they answered No?

   In Group A, $21$ answered Yes and $9$ answered No. In Group B, $12$ answered Yes and $18$ answered No. No totals are given.


<!-- figure: pr-3-4-p9 -->
![A two-way table of group and answer with no totals shown. Columns are Yes and No. Group A: 21 answered Yes and 9 answered No. Group B: 12 answered Yes and 18 answered No.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgOTYiIHdpZHRoPSIzNDAiIGhlaWdodD0iOTYiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0iQSB0d28td2F5IHRhYmxlIG9mIGdyb3VwIGFuZCBhbnN3ZXIgd2l0aCBubyB0b3RhbHMgc2hvd24uIENvbHVtbnMgYXJlIFllcyBhbmQgTm8uIEdyb3VwIEE6IDIxIGFuc3dlcmVkIFllcyBhbmQgOSBhbnN3ZXJlZCBOby4gR3JvdXAgQjogMTIgYW5zd2VyZWQgWWVzIGFuZCAxOCBhbnN3ZXJlZCBOby4iPjxyZWN0IHdpZHRoPSIzNDAiIGhlaWdodD0iOTYiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjEyNC42OCIgaGVpZ2h0PSIyNCIgZmlsbD0iIzZFOURDOCIgZmlsbC1vcGFjaXR5PSIwLjE4Ii8+PGcgc3Ryb2tlPSIjRTJEQ0NBIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIGRhdGEtdmxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTIiIHkyPSI4NCIvPjxsaW5lIGRhdGEtdmxpbmU9IjEiIHgxPSI3My45MiIgeTE9IjEyIiB4Mj0iNzMuOTIiIHkyPSI4NCIvPjxsaW5lIGRhdGEtdmxpbmU9IjIiIHgxPSIxMDkuMzQiIHkxPSIxMiIgeDI9IjEwOS4zNCIgeTI9Ijg0Ii8+PGxpbmUgZGF0YS12bGluZT0iMyIgeDE9IjEzNi42OCIgeTE9IjEyIiB4Mj0iMTM2LjY4IiB5Mj0iODQiLz48bGluZSBkYXRhLWhsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjEzNi42OCIgeTI9IjEyIi8+PGxpbmUgZGF0YS1obGluZT0iMSIgeDE9IjEyIiB5MT0iMzYiIHgyPSIxMzYuNjgiIHkyPSIzNiIvPjxsaW5lIGRhdGEtaGxpbmU9IjIiIHgxPSIxMiIgeTE9IjYwIiB4Mj0iMTM2LjY4IiB5Mj0iNjAiLz48bGluZSBkYXRhLWhsaW5lPSIzIiB4MT0iMTIiIHkxPSI4NCIgeDI9IjEzNi42OCIgeTI9Ijg0Ii8+PC9nPjxnIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmaWxsPSIjMEUwRTExIj48dGV4dCBkYXRhLWhlYWQ9IjEiIHg9Ijc4LjkyIiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+WWVzPC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMiIgeD0iMTE0LjM0IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+Tm88L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTAiIHg9IjE3IiB5PSI1MiIgZm9udC13ZWlnaHQ9IjYwMCI+R3JvdXAgQTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iNzguOTIiIHk9IjUyIj4yMTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMiIgeD0iMTE0LjM0IiB5PSI1MiI+OTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMCIgeD0iMTciIHk9Ijc2IiBmb250LXdlaWdodD0iNjAwIj5Hcm91cCBCPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0xIiB4PSI3OC45MiIgeT0iNzYiPjEyPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0yIiB4PSIxMTQuMzQiIHk9Ijc2Ij4xODwvdGV4dD48L2c+PC9zdmc+)

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

**Basic Level**

**Item 1**

What is the probability that a day had rain, given that it was a weekend day?

Of the $20$ weekend days, $9$ had rain and $11$ were dry. Of the $80$ weekdays, $27$ had rain and $53$ were dry. In all, $36$ days had rain, $64$ were dry, and there are $100$ days.


<!-- figure: pr-3-4-mq1 -->
![A two-way table of day type and weather. Columns are Rain, Dry, and Total. Weekend days: 9 had rain, 11 were dry, 20 in total. Weekdays: 27 had rain, 53 were dry, 80 in total. Column totals: 36 days had rain, 64 were dry, 100 days altogether.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTIwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHR3by13YXkgdGFibGUgb2YgZGF5IHR5cGUgYW5kIHdlYXRoZXIuIENvbHVtbnMgYXJlIFJhaW4sIERyeSwgYW5kIFRvdGFsLiBXZWVrZW5kIGRheXM6IDkgaGFkIHJhaW4sIDExIHdlcmUgZHJ5LCAyMCBpbiB0b3RhbC4gV2Vla2RheXM6IDI3IGhhZCByYWluLCA1MyB3ZXJlIGRyeSwgODAgaW4gdG90YWwuIENvbHVtbiB0b3RhbHM6IDM2IGRheXMgaGFkIHJhaW4sIDY0IHdlcmUgZHJ5LCAxMDAgZGF5cyBhbHRvZ2V0aGVyLiI+PHJlY3Qgd2lkdGg9IjM0MCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjE4Ny4zMiIgaGVpZ2h0PSIyNCIgZmlsbD0iIzZFOURDOCIgZmlsbC1vcGFjaXR5PSIwLjE4Ii8+PGcgc3Ryb2tlPSIjRTJEQ0NBIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIGRhdGEtdmxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTIiIHkyPSIxMDgiLz48bGluZSBkYXRhLXZsaW5lPSIxIiB4MT0iNzkuNzQiIHkxPSIxMiIgeDI9Ijc5Ljc0IiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMiIgeDE9IjEyMC41MSIgeTE9IjEyIiB4Mj0iMTIwLjUxIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMyIgeDE9IjE1My4yIiB5MT0iMTIiIHgyPSIxNTMuMiIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjQiIHgxPSIxOTkuMzIiIHkxPSIxMiIgeDI9IjE5OS4zMiIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtaGxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTk5LjMyIiB5Mj0iMTIiLz48bGluZSBkYXRhLWhsaW5lPSIxIiB4MT0iMTIiIHkxPSIzNiIgeDI9IjE5OS4zMiIgeTI9IjM2Ii8+PGxpbmUgZGF0YS1obGluZT0iMiIgeDE9IjEyIiB5MT0iNjAiIHgyPSIxOTkuMzIiIHkyPSI2MCIvPjxsaW5lIGRhdGEtaGxpbmU9IjMiIHgxPSIxMiIgeTE9Ijg0IiB4Mj0iMTk5LjMyIiB5Mj0iODQiLz48bGluZSBkYXRhLWhsaW5lPSI0IiB4MT0iMTIiIHkxPSIxMDgiIHgyPSIxOTkuMzIiIHkyPSIxMDgiLz48L2c+PGcgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMwRTBFMTEiPjx0ZXh0IGRhdGEtaGVhZD0iMSIgeD0iODQuNzQiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5SYWluPC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMiIgeD0iMTI1LjUxIiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+RHJ5PC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMyIgeD0iMTU4LjIiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMCIgeD0iMTciIHk9IjUyIiBmb250LXdlaWdodD0iNjAwIj5XZWVrZW5kPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0xIiB4PSI4NC43NCIgeT0iNTIiPjk8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTIiIHg9IjEyNS41MSIgeT0iNTIiPjExPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0zIiB4PSIxNTguMiIgeT0iNTIiPjIwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPldlZWtkYXk8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTEiIHg9Ijg0Ljc0IiB5PSI3NiI+Mjc8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTIiIHg9IjEyNS41MSIgeT0iNzYiPjUzPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0zIiB4PSIxNTguMiIgeT0iNzYiPjgwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iODQuNzQiIHk9IjEwMCI+MzY8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTIiIHg9IjEyNS41MSIgeT0iMTAwIj42NDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMyIgeD0iMTU4LjIiIHk9IjEwMCI+MTAwPC90ZXh0PjwvZz48L3N2Zz4=)

- A) $\frac{1}{4}$
- B) $\frac{9}{100}$
- C) $\frac{9}{25}$
- D) $\frac{9}{20}$

**Proficient Level**

**Item 2**

What is the probability that a day was a weekday, given that it had rain?

Of the $20$ weekend days, $9$ had rain and $11$ were dry. Of the $80$ weekdays, $27$ had rain and $53$ were dry. In all, $36$ days had rain, $64$ were dry, and there are $100$ days.


<!-- figure: pr-3-4-mq2 -->
![A two-way table of day type and weather. Columns are Rain, Dry, and Total. Weekend days: 9 had rain, 11 were dry, 20 in total. Weekdays: 27 had rain, 53 were dry, 80 in total. Column totals: 36 days had rain, 64 were dry, 100 days altogether.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTIwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHR3by13YXkgdGFibGUgb2YgZGF5IHR5cGUgYW5kIHdlYXRoZXIuIENvbHVtbnMgYXJlIFJhaW4sIERyeSwgYW5kIFRvdGFsLiBXZWVrZW5kIGRheXM6IDkgaGFkIHJhaW4sIDExIHdlcmUgZHJ5LCAyMCBpbiB0b3RhbC4gV2Vla2RheXM6IDI3IGhhZCByYWluLCA1MyB3ZXJlIGRyeSwgODAgaW4gdG90YWwuIENvbHVtbiB0b3RhbHM6IDM2IGRheXMgaGFkIHJhaW4sIDY0IHdlcmUgZHJ5LCAxMDAgZGF5cyBhbHRvZ2V0aGVyLiI+PHJlY3Qgd2lkdGg9IjM0MCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjE4Ny4zMiIgaGVpZ2h0PSIyNCIgZmlsbD0iIzZFOURDOCIgZmlsbC1vcGFjaXR5PSIwLjE4Ii8+PGcgc3Ryb2tlPSIjRTJEQ0NBIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIGRhdGEtdmxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTIiIHkyPSIxMDgiLz48bGluZSBkYXRhLXZsaW5lPSIxIiB4MT0iNzkuNzQiIHkxPSIxMiIgeDI9Ijc5Ljc0IiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMiIgeDE9IjEyMC41MSIgeTE9IjEyIiB4Mj0iMTIwLjUxIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMyIgeDE9IjE1My4yIiB5MT0iMTIiIHgyPSIxNTMuMiIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjQiIHgxPSIxOTkuMzIiIHkxPSIxMiIgeDI9IjE5OS4zMiIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtaGxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTk5LjMyIiB5Mj0iMTIiLz48bGluZSBkYXRhLWhsaW5lPSIxIiB4MT0iMTIiIHkxPSIzNiIgeDI9IjE5OS4zMiIgeTI9IjM2Ii8+PGxpbmUgZGF0YS1obGluZT0iMiIgeDE9IjEyIiB5MT0iNjAiIHgyPSIxOTkuMzIiIHkyPSI2MCIvPjxsaW5lIGRhdGEtaGxpbmU9IjMiIHgxPSIxMiIgeTE9Ijg0IiB4Mj0iMTk5LjMyIiB5Mj0iODQiLz48bGluZSBkYXRhLWhsaW5lPSI0IiB4MT0iMTIiIHkxPSIxMDgiIHgyPSIxOTkuMzIiIHkyPSIxMDgiLz48L2c+PGcgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMwRTBFMTEiPjx0ZXh0IGRhdGEtaGVhZD0iMSIgeD0iODQuNzQiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5SYWluPC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMiIgeD0iMTI1LjUxIiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+RHJ5PC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMyIgeD0iMTU4LjIiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMCIgeD0iMTciIHk9IjUyIiBmb250LXdlaWdodD0iNjAwIj5XZWVrZW5kPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0xIiB4PSI4NC43NCIgeT0iNTIiPjk8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTIiIHg9IjEyNS41MSIgeT0iNTIiPjExPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0zIiB4PSIxNTguMiIgeT0iNTIiPjIwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPldlZWtkYXk8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTEiIHg9Ijg0Ljc0IiB5PSI3NiI+Mjc8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTIiIHg9IjEyNS41MSIgeT0iNzYiPjUzPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0zIiB4PSIxNTguMiIgeT0iNzYiPjgwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iODQuNzQiIHk9IjEwMCI+MzY8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTIiIHg9IjEyNS41MSIgeT0iMTAwIj42NDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMyIgeD0iMTU4LjIiIHk9IjEwMCI+MTAwPC90ZXh0PjwvZz48L3N2Zz4=)

- A) $\frac{27}{80}$
- B) $\frac{27}{100}$
- C) $\frac{3}{4}$
- D) $\frac{4}{5}$

**Basic Level**

**Item 3**

What is the probability that a candidate passed, given that they sat the morning session?

Of the $40$ candidates who sat the morning session, $30$ passed and $10$ failed. Of the $60$ who sat the evening session, $15$ passed and $45$ failed. In all, $45$ passed, $55$ failed, and there are $100$ candidates.


<!-- figure: pr-3-4-mq3 -->
![A two-way table of exam session and result. Columns are Passed, Failed, and Total. Morning session: 30 passed, 10 failed, 40 in total. Evening session: 15 passed, 45 failed, 60 in total. Column totals: 45 passed, 55 failed, 100 candidates altogether.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTIwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHR3by13YXkgdGFibGUgb2YgZXhhbSBzZXNzaW9uIGFuZCByZXN1bHQuIENvbHVtbnMgYXJlIFBhc3NlZCwgRmFpbGVkLCBhbmQgVG90YWwuIE1vcm5pbmcgc2Vzc2lvbjogMzAgcGFzc2VkLCAxMCBmYWlsZWQsIDQwIGluIHRvdGFsLiBFdmVuaW5nIHNlc3Npb246IDE1IHBhc3NlZCwgNDUgZmFpbGVkLCA2MCBpbiB0b3RhbC4gQ29sdW1uIHRvdGFsczogNDUgcGFzc2VkLCA1NSBmYWlsZWQsIDEwMCBjYW5kaWRhdGVzIGFsdG9nZXRoZXIuIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iMjI0Ljk3IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNkU5REM4IiBmaWxsLW9wYWNpdHk9IjAuMTgiLz48ZyBzdHJva2U9IiNFMkRDQ0EiIHN0cm9rZS13aWR0aD0iMSI+PGxpbmUgZGF0YS12bGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxMiIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjEiIHgxPSI3NyIgeTE9IjEyIiB4Mj0iNzciIHkyPSIxMDgiLz48bGluZSBkYXRhLXZsaW5lPSIyIiB4MT0iMTM2LjY2IiB5MT0iMTIiIHgyPSIxMzYuNjYiIHkyPSIxMDgiLz48bGluZSBkYXRhLXZsaW5lPSIzIiB4MT0iMTkwLjg1IiB5MT0iMTIiIHgyPSIxOTAuODUiIHkyPSIxMDgiLz48bGluZSBkYXRhLXZsaW5lPSI0IiB4MT0iMjM2Ljk3IiB5MT0iMTIiIHgyPSIyMzYuOTciIHkyPSIxMDgiLz48bGluZSBkYXRhLWhsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjIzNi45NyIgeTI9IjEyIi8+PGxpbmUgZGF0YS1obGluZT0iMSIgeDE9IjEyIiB5MT0iMzYiIHgyPSIyMzYuOTciIHkyPSIzNiIvPjxsaW5lIGRhdGEtaGxpbmU9IjIiIHgxPSIxMiIgeTE9IjYwIiB4Mj0iMjM2Ljk3IiB5Mj0iNjAiLz48bGluZSBkYXRhLWhsaW5lPSIzIiB4MT0iMTIiIHkxPSI4NCIgeDI9IjIzNi45NyIgeTI9Ijg0Ii8+PGxpbmUgZGF0YS1obGluZT0iNCIgeDE9IjEyIiB5MT0iMTA4IiB4Mj0iMjM2Ljk3IiB5Mj0iMTA4Ii8+PC9nPjxnIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmaWxsPSIjMEUwRTExIj48dGV4dCBkYXRhLWhlYWQ9IjEiIHg9IjgyIiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+UGFzc2VkPC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMiIgeD0iMTQxLjY2IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+RmFpbGVkPC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMyIgeD0iMTk1Ljg1IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+VG90YWw8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTAiIHg9IjE3IiB5PSI1MiIgZm9udC13ZWlnaHQ9IjYwMCI+TW9ybmluZzwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iODIiIHk9IjUyIj4zMDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMiIgeD0iMTQxLjY2IiB5PSI1MiI+MTA8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTMiIHg9IjE5NS44NSIgeT0iNTIiPjQwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPkV2ZW5pbmc8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTEiIHg9IjgyIiB5PSI3NiI+MTU8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTIiIHg9IjE0MS42NiIgeT0iNzYiPjQ1PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0zIiB4PSIxOTUuODUiIHk9Ijc2Ij42MDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMCIgeD0iMTciIHk9IjEwMCIgZm9udC13ZWlnaHQ9IjYwMCI+VG90YWw8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTEiIHg9IjgyIiB5PSIxMDAiPjQ1PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0yIiB4PSIxNDEuNjYiIHk9IjEwMCI+NTU8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTMiIHg9IjE5NS44NSIgeT0iMTAwIj4xMDA8L3RleHQ+PC9nPjwvc3ZnPg==)

- A) $\frac{3}{4}$
- B) $\frac{2}{3}$
- C) $\frac{3}{10}$
- D) $\frac{9}{20}$

**Item 4**

What is the probability that a candidate failed, given that they sat the evening session?

Of the $40$ candidates who sat the morning session, $30$ passed and $10$ failed. Of the $60$ who sat the evening session, $15$ passed and $45$ failed. In all, $45$ passed, $55$ failed, and there are $100$ candidates.


<!-- figure: pr-3-4-mq4 -->
![A two-way table of exam session and result. Columns are Passed, Failed, and Total. Morning session: 30 passed, 10 failed, 40 in total. Evening session: 15 passed, 45 failed, 60 in total. Column totals: 45 passed, 55 failed, 100 candidates altogether.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTIwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHR3by13YXkgdGFibGUgb2YgZXhhbSBzZXNzaW9uIGFuZCByZXN1bHQuIENvbHVtbnMgYXJlIFBhc3NlZCwgRmFpbGVkLCBhbmQgVG90YWwuIE1vcm5pbmcgc2Vzc2lvbjogMzAgcGFzc2VkLCAxMCBmYWlsZWQsIDQwIGluIHRvdGFsLiBFdmVuaW5nIHNlc3Npb246IDE1IHBhc3NlZCwgNDUgZmFpbGVkLCA2MCBpbiB0b3RhbC4gQ29sdW1uIHRvdGFsczogNDUgcGFzc2VkLCA1NSBmYWlsZWQsIDEwMCBjYW5kaWRhdGVzIGFsdG9nZXRoZXIuIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iMjI0Ljk3IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNkU5REM4IiBmaWxsLW9wYWNpdHk9IjAuMTgiLz48ZyBzdHJva2U9IiNFMkRDQ0EiIHN0cm9rZS13aWR0aD0iMSI+PGxpbmUgZGF0YS12bGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxMiIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtdmxpbmU9IjEiIHgxPSI3NyIgeTE9IjEyIiB4Mj0iNzciIHkyPSIxMDgiLz48bGluZSBkYXRhLXZsaW5lPSIyIiB4MT0iMTM2LjY2IiB5MT0iMTIiIHgyPSIxMzYuNjYiIHkyPSIxMDgiLz48bGluZSBkYXRhLXZsaW5lPSIzIiB4MT0iMTkwLjg1IiB5MT0iMTIiIHgyPSIxOTAuODUiIHkyPSIxMDgiLz48bGluZSBkYXRhLXZsaW5lPSI0IiB4MT0iMjM2Ljk3IiB5MT0iMTIiIHgyPSIyMzYuOTciIHkyPSIxMDgiLz48bGluZSBkYXRhLWhsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjIzNi45NyIgeTI9IjEyIi8+PGxpbmUgZGF0YS1obGluZT0iMSIgeDE9IjEyIiB5MT0iMzYiIHgyPSIyMzYuOTciIHkyPSIzNiIvPjxsaW5lIGRhdGEtaGxpbmU9IjIiIHgxPSIxMiIgeTE9IjYwIiB4Mj0iMjM2Ljk3IiB5Mj0iNjAiLz48bGluZSBkYXRhLWhsaW5lPSIzIiB4MT0iMTIiIHkxPSI4NCIgeDI9IjIzNi45NyIgeTI9Ijg0Ii8+PGxpbmUgZGF0YS1obGluZT0iNCIgeDE9IjEyIiB5MT0iMTA4IiB4Mj0iMjM2Ljk3IiB5Mj0iMTA4Ii8+PC9nPjxnIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmaWxsPSIjMEUwRTExIj48dGV4dCBkYXRhLWhlYWQ9IjEiIHg9IjgyIiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+UGFzc2VkPC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMiIgeD0iMTQxLjY2IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+RmFpbGVkPC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMyIgeD0iMTk1Ljg1IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+VG90YWw8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTAiIHg9IjE3IiB5PSI1MiIgZm9udC13ZWlnaHQ9IjYwMCI+TW9ybmluZzwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iODIiIHk9IjUyIj4zMDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMiIgeD0iMTQxLjY2IiB5PSI1MiI+MTA8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTMiIHg9IjE5NS44NSIgeT0iNTIiPjQwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPkV2ZW5pbmc8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTEiIHg9IjgyIiB5PSI3NiI+MTU8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTIiIHg9IjE0MS42NiIgeT0iNzYiPjQ1PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0zIiB4PSIxOTUuODUiIHk9Ijc2Ij42MDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMCIgeD0iMTciIHk9IjEwMCIgZm9udC13ZWlnaHQ9IjYwMCI+VG90YWw8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTEiIHg9IjgyIiB5PSIxMDAiPjQ1PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0yIiB4PSIxNDEuNjYiIHk9IjEwMCI+NTU8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTMiIHg9IjE5NS44NSIgeT0iMTAwIj4xMDA8L3RleHQ+PC9nPjwvc3ZnPg==)

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

##### Extra Practice - Answer Key

**1. In a class of $30$ students, $18$ are girls. Of the girls, $12$ play a sport. What is the probability that a randomly chosen student plays a sport, GIVEN that the student is a girl?**

Step 1: The condition "given a girl" restricts the group to the $18$ girls, not all $30$ students.

Step 2: Divide the girls who play a sport by the total girls.
- $\frac{12}{18} = \frac{2}{3}$

**Answer: C** ($\frac{2}{3}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: whole_population_as_denominator (divides the 12 girls who play a sport by all 30 students instead of by the 18 girls)",
  "B": "Student makes misconception: conditional_reversed (divides the total girls, 18, by the girls who play a sport, 12, exchanging the two events)",
  "C": "Correct: divides the 12 girls who play a sport by the 18 girls, the conditioning group, for 2/3",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports the proportion of girls in the class, 18/30, ignoring the actual condition being asked about)"
},
"misconception_tag": {
  "A": "whole_population_as_denominator",
  "B": "conditional_reversed",
  "D": "prior_reported_ignoring_condition"
}
```

---

**2. A survey of $50$ people finds $20$ own a dog. Of the dog owners, $15$ also own a cat. What is the probability a person owns a cat, GIVEN they own a dog?**

Step 1: The condition restricts the group to the $20$ dog owners.

Step 2: Divide the dog owners who also own a cat by the total dog owners.
- $\frac{15}{20} = \frac{3}{4}$

**Answer: D** ($\frac{3}{4}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: whole_population_as_denominator (divides the 15 cat-and-dog owners by all 50 people instead of by the 20 dog owners)",
  "B": "Student makes misconception: conditional_reversed (divides the total dog owners, 20, by the dog owners who also own a cat, 15, exchanging the two events)",
  "C": "Student makes misconception: prior_reported_ignoring_condition (reports the proportion of dog owners in the survey, 20/50, ignoring the actual condition being asked about)",
  "D": "Correct: divides the 15 dog owners who also own a cat by the 20 dog owners, the conditioning group, for 3/4"
},
"misconception_tag": {
  "A": "whole_population_as_denominator",
  "B": "conditional_reversed",
  "C": "prior_reported_ignoring_condition"
}
```

---

**3. Among $40$ job applicants, $24$ have a college degree. Of those with a degree, $18$ were called for an interview. What is the probability an applicant was called for an interview, GIVEN they have a degree?**

Step 1: The condition restricts the group to the $24$ applicants with a degree.

Step 2: Divide the degree holders who were interviewed by the total degree holders.
- $\frac{18}{24} = \frac{3}{4}$

**Answer: B** ($\frac{3}{4}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: whole_population_as_denominator (divides the 18 interviewed degree holders by all 40 applicants instead of by the 24 with a degree)",
  "B": "Correct: divides the 18 interviewed degree holders by the 24 with a degree, the conditioning group, for 3/4",
  "C": "Student makes misconception: conditional_reversed (divides the total degree holders, 24, by those interviewed, 18, exchanging the two events)",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports the proportion of applicants with a degree, 24/40, ignoring the actual condition being asked about)"
},
"misconception_tag": {
  "A": "whole_population_as_denominator",
  "C": "conditional_reversed",
  "D": "prior_reported_ignoring_condition"
}
```

---

**4. In a bag, $10$ marbles are red, and $6$ of those red marbles are also striped, out of $30$ marbles total. What is the probability a marble is striped, GIVEN that it is red?**

Step 1: The condition restricts the group to the $10$ red marbles.

Step 2: Divide the striped red marbles by the total red marbles.
- $\frac{6}{10} = \frac{3}{5}$

**Answer: A** ($\frac{3}{5}$)

```json
"distractor_logic": {
  "A": "Correct: divides the 6 striped red marbles by the 10 red marbles, the conditioning group, for 3/5",
  "B": "Student makes misconception: whole_population_as_denominator (divides the 6 striped red marbles by all 30 marbles instead of by the 10 red marbles)",
  "C": "Student makes misconception: conditional_reversed (divides the total red marbles, 10, by the striped red marbles, 6, exchanging the two events)",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports the proportion of marbles that are red, 10/30, ignoring the actual condition being asked about)"
},
"misconception_tag": {
  "B": "whole_population_as_denominator",
  "C": "conditional_reversed",
  "D": "prior_reported_ignoring_condition"
}
```

---

**5. In a group, $P(A \text{ and } B) = 0.24$ and $P(B) = 0.4$. What is $P(A \mid B)$?**

Step 1: Apply the conditional probability formula.
- $P(A \mid B) = \dfrac{P(A \text{ and } B)}{P(B)}$

Step 2: Divide.
- $\dfrac{0.24}{0.4} = 0.6$

**Answer: D** ($0.6$)

```json
"distractor_logic": {
  "A": "Student makes misconception: joint_reported_as_conditional (reports the joint probability, 0.24, without dividing by 0.4)",
  "B": "Student makes misconception: conditional_reversed (divides 0.4 by 0.24 instead of 0.24 by 0.4)",
  "C": "Student makes misconception: prior_reported_ignoring_condition (reports the given P(B), 0.4, instead of completing the conditional calculation)",
  "D": "Correct: divides the joint probability, 0.24, by P(B), 0.4, for 0.6"
},
"misconception_tag": {
  "A": "joint_reported_as_conditional",
  "B": "conditional_reversed",
  "C": "prior_reported_ignoring_condition"
}
```

---

**6. $P(X \text{ and } Y) = 0.15$ and $P(X) = 0.3$. What is $P(Y \mid X)$?**

Step 1: Apply the conditional probability formula.
- $P(Y \mid X) = \dfrac{P(X \text{ and } Y)}{P(X)}$

Step 2: Divide.
- $\dfrac{0.15}{0.3} = 0.5$

**Answer: C** ($0.5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: joint_reported_as_conditional (reports the joint probability, 0.15, without dividing by 0.3)",
  "B": "Student makes misconception: conditional_reversed (divides 0.3 by 0.15 instead of 0.15 by 0.3)",
  "C": "Correct: divides the joint probability, 0.15, by P(X), 0.3, for 0.5",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports the given P(X), 0.3, instead of completing the conditional calculation)"
},
"misconception_tag": {
  "A": "joint_reported_as_conditional",
  "B": "conditional_reversed",
  "D": "prior_reported_ignoring_condition"
}
```

---

**7. In a survey, $65\%$ of respondents exercise regularly, and $45\%$ of respondents both exercise regularly AND eat a balanced diet. What is the probability a respondent eats a balanced diet, GIVEN that they exercise regularly?**

Step 1: Apply the conditional probability formula.
- $P(\text{diet} \mid \text{exercise}) = \dfrac{P(\text{exercise} \text{ and } \text{diet})}{P(\text{exercise})}$

Step 2: Divide.
- $\dfrac{0.45}{0.65} = \frac{9}{13}$

**Answer: B** ($\frac{9}{13}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: joint_reported_as_conditional (reports the joint probability, 0.45, without dividing by 0.65)",
  "B": "Correct: divides the joint probability, 0.45, by the probability of exercising, 0.65, for 9/13",
  "C": "Student makes misconception: conditional_reversed (divides 0.65 by 0.45 instead of 0.45 by 0.65)",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports the given exercise rate, 0.65, instead of completing the conditional calculation)"
},
"misconception_tag": {
  "A": "joint_reported_as_conditional",
  "C": "conditional_reversed",
  "D": "prior_reported_ignoring_condition"
}
```

---

**8. A school has $200$ students. $120$ are in band, and of those, $80$ also play a varsity sport. Of the $80$ students not in band, $50$ play a varsity sport. What is the probability a student plays a varsity sport, GIVEN that they are NOT in band?**

Step 1: The condition restricts the group to the $80$ students not in band.

Step 2: Divide the non-band students who play a sport by the total non-band students.
- $\frac{50}{80} = \frac{5}{8}$

**Answer: A** ($\frac{5}{8}$)

```json
"distractor_logic": {
  "A": "Correct: divides the 50 non-band sport players by the 80 non-band students, the conditioning group, for 5/8",
  "B": "Student makes misconception: whole_population_as_denominator (divides the 50 non-band sport players by all 200 students instead of by the 80 not in band)",
  "C": "Student makes misconception: conditional_reversed (divides the 80 non-band students by the 50 who play a sport, exchanging the two events)",
  "D": "Student makes misconception: prior_reported_ignoring_condition (combines both groups' sport players, 80 plus 50 over 200, ignoring the actual not-in-band condition)"
},
"misconception_tag": {
  "B": "whole_population_as_denominator",
  "C": "conditional_reversed",
  "D": "prior_reported_ignoring_condition"
}
```

---

**9. In a population, $P(A \mid B) = 0.4$ and $P(B) = 0.5$. What is $P(A \text{ and } B)$?**

Step 1: Rearrange the conditional probability formula.
- $P(A \text{ and } B) = P(A \mid B) \times P(B)$

Step 2: Multiply.
- $0.4 \times 0.5 = 0.2$

**Answer: D** ($0.2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: conditional_reversed (divides 0.4 by 0.5 instead of multiplying)",
  "B": "Student makes misconception: joint_reported_as_conditional (reports the given conditional probability, 0.4, directly as though it were already the joint probability)",
  "C": "Student makes misconception: prior_reported_ignoring_condition (reports the given P(B), 0.5, instead of completing the multiplication)",
  "D": "Correct: multiplies P(A given B), 0.4, by P(B), 0.5, for a joint probability of 0.2"
},
"misconception_tag": {
  "A": "conditional_reversed",
  "B": "joint_reported_as_conditional",
  "C": "prior_reported_ignoring_condition"
}
```

---

**10. A factory has two machines. Machine A produces $60\%$ of all items and has a $5\%$ defect rate. Machine B produces the remaining $40\%$ and has a $10\%$ defect rate. What is the probability that a randomly selected item was made by Machine A, GIVEN that it is defective?**

Step 1: Find the probability an item is both from Machine A and defective.
- $0.6 \times 0.05 = 0.03$

Step 2: Find the total probability an item is defective, from either machine.
- $0.6 \times 0.05 + 0.4 \times 0.10 = 0.03 + 0.04 = 0.07$

Step 3: Divide the joint probability by the total probability of being defective, the conditioning group.
- $\dfrac{0.03}{0.07} = \frac{3}{7}$

**Answer: C** ($\frac{3}{7}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: whole_population_as_denominator (divides the joint probability, 0.03, by 1, the whole population, instead of by the total defective probability, 0.07)",
  "B": "Student makes misconception: conditional_reversed (divides the total defective probability, 0.07, by the joint probability, 0.03, exchanging the two)",
  "C": "Correct: divides the joint probability, 0.03, by the total defective probability, 0.07, for 3/7",
  "D": "Student makes misconception: prior_reported_ignoring_condition (reports Machine A's overall production share, 0.6, ignoring the defective condition entirely)"
},
"misconception_tag": {
  "A": "whole_population_as_denominator",
  "B": "conditional_reversed",
  "D": "prior_reported_ignoring_condition"
}
```

---

#### **Part 5: Extra Practice**

More of the same skill, for a worksheet rather than for the mastery gate. These items are drawn by the worksheet generator and are not part of the 9-of-12 practice gate or the 3-of-4 quiz gate. Worked solutions for them sit at the end of Part 4.

**Basic Level**

1. In a class of $30$ students, $18$ are girls. Of the girls, $12$ play a sport. What is the probability that a randomly chosen student plays a sport, GIVEN that the student is a girl?
   - A) $\frac{2}{5}$
   - B) $\frac{3}{2}$
   - C) $\frac{2}{3}$
   - D) $\frac{3}{5}$

2. A survey of $50$ people finds $20$ own a dog. Of the dog owners, $15$ also own a cat. What is the probability a person owns a cat, GIVEN they own a dog?
   - A) $\frac{3}{10}$
   - B) $\frac{4}{3}$
   - C) $\frac{2}{5}$
   - D) $\frac{3}{4}$

3. Among $40$ job applicants, $24$ have a college degree. Of those with a degree, $18$ were called for an interview. What is the probability an applicant was called for an interview, GIVEN they have a degree?
   - A) $\frac{9}{20}$
   - B) $\frac{3}{4}$
   - C) $\frac{4}{3}$
   - D) $\frac{3}{5}$

4. In a bag, $10$ marbles are red, and $6$ of those red marbles are also striped, out of $30$ marbles total. What is the probability a marble is striped, GIVEN that it is red?
   - A) $\frac{3}{5}$
   - B) $\frac{1}{5}$
   - C) $\frac{5}{3}$
   - D) $\frac{1}{3}$

**Proficient Level** (these require an extra step)

5. In a group, $P(A \text{ and } B) = 0.24$ and $P(B) = 0.4$. What is $P(A \mid B)$?
   - A) $0.24$
   - B) $1.67$
   - C) $0.4$
   - D) $0.6$

6. $P(X \text{ and } Y) = 0.15$ and $P(X) = 0.3$. What is $P(Y \mid X)$?
   - A) $0.15$
   - B) $2$
   - C) $0.5$
   - D) $0.3$

7. In a survey, $65\%$ of respondents exercise regularly, and $45\%$ of respondents both exercise regularly AND eat a balanced diet. What is the probability a respondent eats a balanced diet, GIVEN that they exercise regularly?
   - A) $0.45$
   - B) $\frac{9}{13}$
   - C) $\frac{13}{9}$
   - D) $0.65$

**Advanced Level** (these need multiple steps or reverse thinking)

8. A school has $200$ students. $120$ are in band, and of those, $80$ also play a varsity sport. Of the $80$ students not in band, $50$ play a varsity sport. What is the probability a student plays a varsity sport, GIVEN that they are NOT in band?

<!-- figure: pr-3-4-e8 -->
![A two-way table of band membership and playing a varsity sport, with some cells left blank to fill in. Columns are Sport, No sport, and Total. Band: 80 play a sport, the No-sport cell is blank, 120 in total. Not in band: 50 play a sport, the No-sport cell is blank, 80 in total. The Sport and No-sport column totals are blank; the grand total is 200 students.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTIwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHR3by13YXkgdGFibGUgb2YgYmFuZCBtZW1iZXJzaGlwIGFuZCBwbGF5aW5nIGEgdmFyc2l0eSBzcG9ydCwgd2l0aCBzb21lIGNlbGxzIGxlZnQgYmxhbmsgdG8gZmlsbCBpbi4gQ29sdW1ucyBhcmUgU3BvcnQsIE5vIHNwb3J0LCBhbmQgVG90YWwuIEJhbmQ6IDgwIHBsYXkgYSBzcG9ydCwgdGhlIE5vLXNwb3J0IGNlbGwgaXMgYmxhbmssIDEyMCBpbiB0b3RhbC4gTm90IGluIGJhbmQ6IDUwIHBsYXkgYSBzcG9ydCwgdGhlIE5vLXNwb3J0IGNlbGwgaXMgYmxhbmssIDgwIGluIHRvdGFsLiBUaGUgU3BvcnQgYW5kIE5vLXNwb3J0IGNvbHVtbiB0b3RhbHMgYXJlIGJsYW5rOyB0aGUgZ3JhbmQgdG90YWwgaXMgMjAwIHN0dWRlbnRzLiI+PHJlY3Qgd2lkdGg9IjM0MCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjI0NC4zNCIgaGVpZ2h0PSIyNCIgZmlsbD0iIzZFOURDOCIgZmlsbC1vcGFjaXR5PSIwLjE4Ii8+PGcgc3Ryb2tlPSIjRTJEQ0NBIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIGRhdGEtdmxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTIiIHkyPSIxMDgiLz48bGluZSBkYXRhLXZsaW5lPSIxIiB4MT0iOTguMDMiIHkxPSIxMiIgeDI9Ijk4LjAzIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMiIgeDE9IjE0NC4xNSIgeTE9IjEyIiB4Mj0iMTQ0LjE1IiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iMyIgeDE9IjIxMC4yMiIgeTE9IjEyIiB4Mj0iMjEwLjIyIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS12bGluZT0iNCIgeDE9IjI1Ni4zNCIgeTE9IjEyIiB4Mj0iMjU2LjM0IiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS1obGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIyNTYuMzQiIHkyPSIxMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjEiIHgxPSIxMiIgeTE9IjM2IiB4Mj0iMjU2LjM0IiB5Mj0iMzYiLz48bGluZSBkYXRhLWhsaW5lPSIyIiB4MT0iMTIiIHkxPSI2MCIgeDI9IjI1Ni4zNCIgeTI9IjYwIi8+PGxpbmUgZGF0YS1obGluZT0iMyIgeDE9IjEyIiB5MT0iODQiIHgyPSIyNTYuMzQiIHkyPSI4NCIvPjxsaW5lIGRhdGEtaGxpbmU9IjQiIHgxPSIxMiIgeTE9IjEwOCIgeDI9IjI1Ni4zNCIgeTI9IjEwOCIvPjwvZz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzBFMEUxMSI+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSIxMDMuMDMiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5TcG9ydDwvdGV4dD48dGV4dCBkYXRhLWhlYWQ9IjIiIHg9IjE0OS4xNSIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPk5vIHNwb3J0PC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMyIgeD0iMjE1LjIyIiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+VG90YWw8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTAiIHg9IjE3IiB5PSI1MiIgZm9udC13ZWlnaHQ9IjYwMCI+QmFuZDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iMTAzLjAzIiB5PSI1MiI+ODA8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTIiIHg9IjE0OS4xNSIgeT0iNTIiPjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMyIgeD0iMjE1LjIyIiB5PSI1MiI+MTIwPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPk5vdCBpbiBiYW5kPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0xIiB4PSIxMDMuMDMiIHk9Ijc2Ij41MDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMiIgeD0iMTQ5LjE1IiB5PSI3NiI+PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0zIiB4PSIyMTUuMjIiIHk9Ijc2Ij44MDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMCIgeD0iMTciIHk9IjEwMCIgZm9udC13ZWlnaHQ9IjYwMCI+VG90YWw8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTEiIHg9IjEwMy4wMyIgeT0iMTAwIj48L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTIiIHg9IjE0OS4xNSIgeT0iMTAwIj48L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTMiIHg9IjIxNS4yMiIgeT0iMTAwIj4yMDA8L3RleHQ+PC9nPjwvc3ZnPg==)

   - A) $\frac{5}{8}$
   - B) $\frac{1}{4}$
   - C) $\frac{8}{5}$
   - D) $\frac{13}{20}$

9. In a population, $P(A \mid B) = 0.4$ and $P(B) = 0.5$. What is $P(A \text{ and } B)$?
   - A) $0.8$
   - B) $0.4$
   - C) $0.5$
   - D) $0.2$

10. A factory has two machines. Machine A produces $60\%$ of all items and has a $5\%$ defect rate. Machine B produces the remaining $40\%$ and has a $10\%$ defect rate. What is the probability that a randomly selected item was made by Machine A, GIVEN that it is defective?
    - A) $0.03$
    - B) $\frac{7}{3}$
    - C) $\frac{3}{7}$
    - D) $0.6$
