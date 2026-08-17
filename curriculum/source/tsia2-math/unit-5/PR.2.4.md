---
topic_name: "Comparing distributions using measures of center and spread"
unit_number: 5
sequence_in_unit: 7
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "PR"
keywords: ["comparing distributions", "center and spread", "range", "interquartile range", "outliers", "skew", "consistency"]
---

# PR.2.4 - Comparing Distributions Using Measures of Center and Spread

**Topic ID:** PR.2.4  
**Unit:** 5  
**Strand:** PR (Probabilistic and Statistical Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Two Questions, Asked in Order

You already know how to compute a mean, a median and a range. This topic is about **two data sets side by side**, and it asks you two questions before you say anything about them:

1. **Where is each set centred?** Mean or median, and say which one you used.
2. **How spread out is each set around that centre?** Range, or the interquartile range for the middle half.

**The confusion this topic exists to prevent is answering a spread question with a centre.** Two sets can share a mean exactly and still be nothing alike. "Which team is more consistent" is not asking who scored more. It is asking how tightly the scores cluster, and the mean cannot tell you that.

Centre and spread are two separate readings. A comparison needs both, and it needs you to say which one you are using.

---

##### A Centre Is Not a Spread

**Example 1:** Set A is $4, 6, 7, 9, 14$. Set B is $6, 7, 8, 9, 10$. Compare them.

Step 1: Find each centre.
- Set A: $4 + 6 + 7 + 9 + 14 = 40$, and $40 / 5 = 8$
- Set B: $6 + 7 + 8 + 9 + 10 = 40$, and $40 / 5 = 8$

Step 2: Find each spread.
- Set A: $14 - 4 = 10$
- Set B: $10 - 6 = 4$

Step 3: Say what that means.

The means are **identical**. The spreads are not close: Set A's values are scattered over $10$ units and Set B's sit inside $4$. Set B is the more consistent set.

**Equal means do not make two sets alike.** They tell you the two sets balance at the same place and nothing more.

---

##### A Bigger Range Is Not a Better Set

A range is a measure of **variability**, not of quality. Set A's range of $10$ does not mean Set A performed better; it means Set A was less consistent.

Read the question for which one it wants:

- "Who scored higher on average" wants a **centre**.
- "Who was more consistent" or "more predictable" wants a **spread**, and the **smaller** spread wins.

---

##### Equal Medians, Different Means

**Example 2:** Set C is $2, 5, 8, 9, 11$. Set D is $6, 7, 8, 9, 20$. Both have a median of $8$. Do they have the same mean?

Step 1: Both middles.
- Set C sorted: $2, 5, 8, 9, 11$, so the median is $8$.
- Set D sorted: $6, 7, 8, 9, 20$, so the median is $8$.

Step 2: Both means.
- Set C: $2 + 5 + 8 + 9 + 11 = 35$, and $35 / 5 = 7$
- Set D: $6 + 7 + 8 + 9 + 20 = 50$, and $50 / 5 = 10$

Step 3: Compare.

Same median of $8$, and means of $7$ and $10$. **A shared median says nothing about the means.** The median only counts positions; it does not care how far the outer values sit.

---

##### What One Extreme Value Does to a Mean

**Example 3:** Set E is $12, 14, 15, 16, 68$. Which number describes a typical value?

Step 1: The mean.
- $12 + 14 + 15 + 16 + 68 = 125$, and $125 / 5 = 25$

Step 2: The median.
- Sorted, the middle value is $15$.

Step 3: Look at where each one sits.

The mean of $25$ is **larger than four of the five values**. No typical member of this set is anywhere near $25$. The median of $15$ sits inside the cluster where most of the data actually is.

**When one value sits far from the rest, the median describes the set and the mean describes the pull of that one value.**

---

##### Reading Two Box Plots on One Axis

<!-- figure: pr-2-4-box-paired -->
![Two box plots stacked on one shared number line running from 0 to 60 points, marked every 10. Team A is the upper plot: minimum 12, lower quartile 22, median 30, upper quartile 38, maximum 52. Team B is the lower plot: minimum 18, lower quartile 26, median 30, upper quartile 44, maximum 56. Both teams have the same median of 30, but Team B's box is wider, so its middle half is more spread out.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMjUwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjI1MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJUd28gYm94IHBsb3RzIHN0YWNrZWQgb24gb25lIHNoYXJlZCBudW1iZXIgbGluZSBydW5uaW5nIGZyb20gMCB0byA2MCBwb2ludHMsIG1hcmtlZCBldmVyeSAxMC4gVGVhbSBBIGlzIHRoZSB1cHBlciBwbG90OiBtaW5pbXVtIDEyLCBsb3dlciBxdWFydGlsZSAyMiwgbWVkaWFuIDMwLCB1cHBlciBxdWFydGlsZSAzOCwgbWF4aW11bSA1Mi4gVGVhbSBCIGlzIHRoZSBsb3dlciBwbG90OiBtaW5pbXVtIDE4LCBsb3dlciBxdWFydGlsZSAyNiwgbWVkaWFuIDMwLCB1cHBlciBxdWFydGlsZSA0NCwgbWF4aW11bSA1Ni4gQm90aCB0ZWFtcyBoYXZlIHRoZSBzYW1lIG1lZGlhbiBvZiAzMCwgYnV0IFRlYW0gQidzIGJveCBpcyB3aWRlciwgc28gaXRzIG1pZGRsZSBoYWxmIGlzIG1vcmUgc3ByZWFkIG91dC4iPjxyZWN0IHdpZHRoPSIzNDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjdGM0U3IiByeD0iMTAiLz48ZyBzdHJva2U9IiNFMkRDQ0EiIHN0cm9rZS13aWR0aD0iMSI+PGxpbmUgeDE9IjUyIiB5MT0iMTYiIHgyPSI1MiIgeTI9IjIxMiIvPjxsaW5lIHgxPSI5NyIgeTE9IjE2IiB4Mj0iOTciIHkyPSIyMTIiLz48bGluZSB4MT0iMTQyIiB5MT0iMTYiIHgyPSIxNDIiIHkyPSIyMTIiLz48bGluZSB4MT0iMTg3IiB5MT0iMTYiIHgyPSIxODciIHkyPSIyMTIiLz48bGluZSB4MT0iMjMyIiB5MT0iMTYiIHgyPSIyMzIiIHkyPSIyMTIiLz48bGluZSB4MT0iMjc3IiB5MT0iMTYiIHgyPSIyNzciIHkyPSIyMTIiLz48bGluZSB4MT0iMzIyIiB5MT0iMTYiIHgyPSIzMjIiIHkyPSIyMTIiLz48L2c+PGxpbmUgZGF0YS13aGlza2VyPSIwbG8iIHgxPSIxMDYiIHkxPSI2NSIgeDI9IjE1MSIgeTI9IjY1IiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS40Ii8+PGxpbmUgZGF0YS13aGlza2VyPSIwaGkiIHgxPSIyMjMiIHkxPSI2NSIgeDI9IjI4NiIgeTI9IjY1IiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS40Ii8+PGxpbmUgZGF0YS1jYXA9IjBsbyIgeDE9IjEwNiIgeTE9IjUyLjg3IiB4Mj0iMTA2IiB5Mj0iNzcuMTMiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48bGluZSBkYXRhLWNhcD0iMGhpIiB4MT0iMjg2IiB5MT0iNTIuODciIHgyPSIyODYiIHkyPSI3Ny4xMyIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxyZWN0IGRhdGEtYm94PSIwIiB4PSIxNTEiIHk9IjQyLjk1IiB3aWR0aD0iNzIiIGhlaWdodD0iNDQuMSIgZmlsbD0iIzZFOURDOCIgZmlsbC1vcGFjaXR5PSIwLjM1IiBzdHJva2U9IiM2RTlEQzgiIHN0cm9rZS13aWR0aD0iMS42Ii8+PGxpbmUgZGF0YS1tZWRpYW49IjAiIHgxPSIxODciIHkxPSI0Mi45NSIgeDI9IjE4NyIgeTI9Ijg3LjA1IiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIGRhdGEtd2hpc2tlcj0iMWxvIiB4MT0iMTMzIiB5MT0iMTYzIiB4Mj0iMTY5IiB5Mj0iMTYzIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS40Ii8+PGxpbmUgZGF0YS13aGlza2VyPSIxaGkiIHgxPSIyNTAiIHkxPSIxNjMiIHgyPSIzMDQiIHkyPSIxNjMiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48bGluZSBkYXRhLWNhcD0iMWxvIiB4MT0iMTMzIiB5MT0iMTUwLjg3IiB4Mj0iMTMzIiB5Mj0iMTc1LjEzIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS40Ii8+PGxpbmUgZGF0YS1jYXA9IjFoaSIgeDE9IjMwNCIgeTE9IjE1MC44NyIgeDI9IjMwNCIgeTI9IjE3NS4xMyIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxyZWN0IGRhdGEtYm94PSIxIiB4PSIxNjkiIHk9IjE0MC45NSIgd2lkdGg9IjgxIiBoZWlnaHQ9IjQ0LjEiIGZpbGw9IiNGMEEzM0UiIGZpbGwtb3BhY2l0eT0iMC4zNSIgc3Ryb2tlPSIjRjBBMzNFIiBzdHJva2Utd2lkdGg9IjEuNiIvPjxsaW5lIGRhdGEtbWVkaWFuPSIxIiB4MT0iMTg3IiB5MT0iMTQwLjk1IiB4Mj0iMTg3IiB5Mj0iMTg1LjA1IiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSI1MiIgeTE9IjIxMiIgeDI9IjMyMiIgeTI9IjIxMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNiIvPjxsaW5lIHgxPSI1MiIgeTE9IjIxMiIgeDI9IjUyIiB5Mj0iMTYiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzBFMEUxMSI+PHRleHQgeD0iNTIiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MDwvdGV4dD48dGV4dCB4PSI5NyIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4xMDwvdGV4dD48dGV4dCB4PSIxNDIiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MjA8L3RleHQ+PHRleHQgeD0iMTg3IiB5PSIyMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjMwPC90ZXh0Pjx0ZXh0IHg9IjIzMiIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj40MDwvdGV4dD48dGV4dCB4PSIyNzciIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NTA8L3RleHQ+PHRleHQgeD0iMzIyIiB5PSIyMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjYwPC90ZXh0Pjx0ZXh0IGRhdGEtbGFuZT0iMCIgeD0iNDYiIHk9IjY4LjUiIHRleHQtYW5jaG9yPSJlbmQiPlRlYW0gQTwvdGV4dD48dGV4dCBkYXRhLWxhbmU9IjEiIHg9IjQ2IiB5PSIxNjYuNSIgdGV4dC1hbmNob3I9ImVuZCI+VGVhbSBCPC90ZXh0PjwvZz48dGV4dCB4PSIxODciIHk9IjI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMwRTBFMTEiPlBvaW50cyBzY29yZWQ8L3RleHQ+PC9zdmc+)

Both teams have a median of $30$, marked by the line inside each box. The boxes are not the same width.

Step 1: Read the middle half of each.
- Team A's box runs from $22$ to $38$, so $38 - 22 = 16$
- Team B's box runs from $26$ to $44$, so $44 - 26 = 18$

Step 2: Read the full spread of each.
- Team A: $52 - 12 = 40$
- Team B: $56 - 18 = 38$

Step 3: Say what that means.

Identical centres, different spreads. Team A has the wider **total** range at $40$, while Team B has the wider **middle half** at $18$. Those two answers can disagree, and which one the question wants is the whole task.

**The interquartile range describes the middle half and ignores the extremes. The range is built entirely from the two extremes.**

---

##### Mean Above Median Means a Right Tail

If a set's mean sits **above** its median, values are stretching out to the high side and pulling the mean up with them. That is **skewed right**.

If the mean sits **below** the median, the tail runs to the low side, and the set is **skewed left**.

The mean chases the tail. The median stays where the count is.

---

##### The Mistake That Costs the Most Points

**Answering a spread question with a centre.** The question asks which set is more consistent, and the work computes two means, finds them equal, and answers "the same."

The means being equal is exactly the setup that makes the question worth asking. **Every comparison item is built so that one reading alone cannot answer it.** If both centres match, the answer is in the spread. If both spreads match, the answer is in the centre.

Before you answer, name the measure you used out loud. If the question said "consistent" and you named a mean, you have answered a different question.

---

##### The Five Traps

1. **Equal means read as equal sets.** Two sets can balance at the same point and be nothing alike. Check a spread before you call them the same.
2. **Equal medians read as equal means.** A median counts positions and ignores distances. Compute both.
3. **A bigger range read as a better result.** A range measures variability. The smaller spread is the more consistent one.
4. **The maximum reported as the range.** The range is the difference, $\text{max} - \text{min}$, not the largest value.
5. **Defending a mean that one extreme value has dragged.** If a value sits far from the rest, say so and use the median.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Set A is $4, 6, 7, 9, 14$ and Set B is $6, 7, 8, 9, 10$. What is the range of Set A?
   - A) $10$
   - B) $14$
   - C) $4$
   - D) $8$

2. Set A is $4, 6, 7, 9, 14$ and Set B is $6, 7, 8, 9, 10$. Which set is more consistent?
   - A) Set A, because its largest value, $14$, is the greatest value in either set
   - B) Set B, because its values sit within $4$ of each other while Set A's spread over $10$
   - C) They are equally consistent, because both sets have a mean of $8$
   - D) Set A, because its range of $10$ is the larger number

3. Set C is $2, 5, 8, 9, 11$ and Set D is $6, 7, 8, 9, 20$. What is the mean of Set C?
   - A) $8$
   - B) $9$
   - C) $7$
   - D) $10$

4. Set C is $2, 5, 8, 9, 11$ and Set D is $6, 7, 8, 9, 20$. Both have a median of $8$. What does that tell you about their means?
   - A) Both means are $8$, because equal medians force equal means
   - B) The two sets are equally spread out, because their middles match
   - C) Set D's mean is also $8$, because the $20$ is an outlier and outliers do not move a mean
   - D) Nothing on its own: Set C's mean is $7$ and Set D's mean is $10$

**Proficient Level** (these require an extra step)

5. What is the median score for Class 1?

<!-- figure: pr-2-4-box-classes -->
![Two box plots stacked on one shared number line of test scores running from 50 to 100, marked every 5. Class 1 is the upper plot: minimum 60, lower quartile 70, median 74, upper quartile 82, maximum 96. Class 2 is the lower plot: minimum 58, lower quartile 72, median 80, upper quartile 86, maximum 94. Both classes have a range of 36, but Class 2's box is wider and sits further right.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMjUwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjI1MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJUd28gYm94IHBsb3RzIHN0YWNrZWQgb24gb25lIHNoYXJlZCBudW1iZXIgbGluZSBvZiB0ZXN0IHNjb3JlcyBydW5uaW5nIGZyb20gNTAgdG8gMTAwLCBtYXJrZWQgZXZlcnkgNS4gQ2xhc3MgMSBpcyB0aGUgdXBwZXIgcGxvdDogbWluaW11bSA2MCwgbG93ZXIgcXVhcnRpbGUgNzAsIG1lZGlhbiA3NCwgdXBwZXIgcXVhcnRpbGUgODIsIG1heGltdW0gOTYuIENsYXNzIDIgaXMgdGhlIGxvd2VyIHBsb3Q6IG1pbmltdW0gNTgsIGxvd2VyIHF1YXJ0aWxlIDcyLCBtZWRpYW4gODAsIHVwcGVyIHF1YXJ0aWxlIDg2LCBtYXhpbXVtIDk0LiBCb3RoIGNsYXNzZXMgaGF2ZSBhIHJhbmdlIG9mIDM2LCBidXQgQ2xhc3MgMidzIGJveCBpcyB3aWRlciBhbmQgc2l0cyBmdXJ0aGVyIHJpZ2h0LiI+PHJlY3Qgd2lkdGg9IjM0MCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNGN0YzRTciIHJ4PSIxMCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSB4MT0iNTgiIHkxPSIxNiIgeDI9IjU4IiB5Mj0iMjEyIi8+PGxpbmUgeDE9Ijg0LjQiIHkxPSIxNiIgeDI9Ijg0LjQiIHkyPSIyMTIiLz48bGluZSB4MT0iMTEwLjgiIHkxPSIxNiIgeDI9IjExMC44IiB5Mj0iMjEyIi8+PGxpbmUgeDE9IjEzNy4yIiB5MT0iMTYiIHgyPSIxMzcuMiIgeTI9IjIxMiIvPjxsaW5lIHgxPSIxNjMuNiIgeTE9IjE2IiB4Mj0iMTYzLjYiIHkyPSIyMTIiLz48bGluZSB4MT0iMTkwIiB5MT0iMTYiIHgyPSIxOTAiIHkyPSIyMTIiLz48bGluZSB4MT0iMjE2LjQiIHkxPSIxNiIgeDI9IjIxNi40IiB5Mj0iMjEyIi8+PGxpbmUgeDE9IjI0Mi44IiB5MT0iMTYiIHgyPSIyNDIuOCIgeTI9IjIxMiIvPjxsaW5lIHgxPSIyNjkuMiIgeTE9IjE2IiB4Mj0iMjY5LjIiIHkyPSIyMTIiLz48bGluZSB4MT0iMjk1LjYiIHkxPSIxNiIgeDI9IjI5NS42IiB5Mj0iMjEyIi8+PGxpbmUgeDE9IjMyMiIgeTE9IjE2IiB4Mj0iMzIyIiB5Mj0iMjEyIi8+PC9nPjxsaW5lIGRhdGEtd2hpc2tlcj0iMGxvIiB4MT0iMTEwLjgiIHkxPSI2NSIgeDI9IjE2My42IiB5Mj0iNjUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48bGluZSBkYXRhLXdoaXNrZXI9IjBoaSIgeDE9IjIyNi45NiIgeTE9IjY1IiB4Mj0iMzAwLjg4IiB5Mj0iNjUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48bGluZSBkYXRhLWNhcD0iMGxvIiB4MT0iMTEwLjgiIHkxPSI1Mi44NyIgeDI9IjExMC44IiB5Mj0iNzcuMTMiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48bGluZSBkYXRhLWNhcD0iMGhpIiB4MT0iMzAwLjg4IiB5MT0iNTIuODciIHgyPSIzMDAuODgiIHkyPSI3Ny4xMyIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxyZWN0IGRhdGEtYm94PSIwIiB4PSIxNjMuNiIgeT0iNDIuOTUiIHdpZHRoPSI2My4zNiIgaGVpZ2h0PSI0NC4xIiBmaWxsPSIjNkU5REM4IiBmaWxsLW9wYWNpdHk9IjAuMzUiIHN0cm9rZT0iIzZFOURDOCIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48bGluZSBkYXRhLW1lZGlhbj0iMCIgeDE9IjE4NC43MiIgeTE9IjQyLjk1IiB4Mj0iMTg0LjcyIiB5Mj0iODcuMDUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgZGF0YS13aGlza2VyPSIxbG8iIHgxPSIxMDAuMjQiIHkxPSIxNjMiIHgyPSIxNzQuMTYiIHkyPSIxNjMiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48bGluZSBkYXRhLXdoaXNrZXI9IjFoaSIgeDE9IjI0OC4wOCIgeTE9IjE2MyIgeDI9IjI5MC4zMiIgeTI9IjE2MyIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxsaW5lIGRhdGEtY2FwPSIxbG8iIHgxPSIxMDAuMjQiIHkxPSIxNTAuODciIHgyPSIxMDAuMjQiIHkyPSIxNzUuMTMiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48bGluZSBkYXRhLWNhcD0iMWhpIiB4MT0iMjkwLjMyIiB5MT0iMTUwLjg3IiB4Mj0iMjkwLjMyIiB5Mj0iMTc1LjEzIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS40Ii8+PHJlY3QgZGF0YS1ib3g9IjEiIHg9IjE3NC4xNiIgeT0iMTQwLjk1IiB3aWR0aD0iNzMuOTIiIGhlaWdodD0iNDQuMSIgZmlsbD0iI0YwQTMzRSIgZmlsbC1vcGFjaXR5PSIwLjM1IiBzdHJva2U9IiNGMEEzM0UiIHN0cm9rZS13aWR0aD0iMS42Ii8+PGxpbmUgZGF0YS1tZWRpYW49IjEiIHgxPSIyMTYuNCIgeTE9IjE0MC45NSIgeDI9IjIxNi40IiB5Mj0iMTg1LjA1IiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSI1OCIgeTE9IjIxMiIgeDI9IjMyMiIgeTI9IjIxMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNiIvPjxsaW5lIHgxPSI1OCIgeTE9IjIxMiIgeDI9IjU4IiB5Mj0iMTYiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzBFMEUxMSI+PHRleHQgeD0iNTgiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NTA8L3RleHQ+PHRleHQgeD0iODQuNCIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj41NTwvdGV4dD48dGV4dCB4PSIxMTAuOCIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj42MDwvdGV4dD48dGV4dCB4PSIxMzcuMiIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj42NTwvdGV4dD48dGV4dCB4PSIxNjMuNiIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj43MDwvdGV4dD48dGV4dCB4PSIxOTAiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NzU8L3RleHQ+PHRleHQgeD0iMjE2LjQiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+ODA8L3RleHQ+PHRleHQgeD0iMjQyLjgiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+ODU8L3RleHQ+PHRleHQgeD0iMjY5LjIiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+OTA8L3RleHQ+PHRleHQgeD0iMjk1LjYiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+OTU8L3RleHQ+PHRleHQgeD0iMzIyIiB5PSIyMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjEwMDwvdGV4dD48dGV4dCBkYXRhLWxhbmU9IjAiIHg9IjUyIiB5PSI2OC41IiB0ZXh0LWFuY2hvcj0iZW5kIj5DbGFzcyAxPC90ZXh0Pjx0ZXh0IGRhdGEtbGFuZT0iMSIgeD0iNTIiIHk9IjE2Ni41IiB0ZXh0LWFuY2hvcj0iZW5kIj5DbGFzcyAyPC90ZXh0PjwvZz48dGV4dCB4PSIxOTAiIHk9IjI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMwRTBFMTEiPlRlc3Qgc2NvcmU8L3RleHQ+PC9zdmc+)
   - A) $96$
   - B) $74$
   - C) $36$
   - D) $80$

6. Both classes have a range of $36$. Which class's middle half is more spread out?

<!-- figure: pr-2-4-box-classes -->
![Two box plots stacked on one shared number line of test scores running from 50 to 100, marked every 5. Class 1 is the upper plot: minimum 60, lower quartile 70, median 74, upper quartile 82, maximum 96. Class 2 is the lower plot: minimum 58, lower quartile 72, median 80, upper quartile 86, maximum 94. Both classes have a range of 36, but Class 2's box is wider and sits further right.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMjUwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjI1MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJUd28gYm94IHBsb3RzIHN0YWNrZWQgb24gb25lIHNoYXJlZCBudW1iZXIgbGluZSBvZiB0ZXN0IHNjb3JlcyBydW5uaW5nIGZyb20gNTAgdG8gMTAwLCBtYXJrZWQgZXZlcnkgNS4gQ2xhc3MgMSBpcyB0aGUgdXBwZXIgcGxvdDogbWluaW11bSA2MCwgbG93ZXIgcXVhcnRpbGUgNzAsIG1lZGlhbiA3NCwgdXBwZXIgcXVhcnRpbGUgODIsIG1heGltdW0gOTYuIENsYXNzIDIgaXMgdGhlIGxvd2VyIHBsb3Q6IG1pbmltdW0gNTgsIGxvd2VyIHF1YXJ0aWxlIDcyLCBtZWRpYW4gODAsIHVwcGVyIHF1YXJ0aWxlIDg2LCBtYXhpbXVtIDk0LiBCb3RoIGNsYXNzZXMgaGF2ZSBhIHJhbmdlIG9mIDM2LCBidXQgQ2xhc3MgMidzIGJveCBpcyB3aWRlciBhbmQgc2l0cyBmdXJ0aGVyIHJpZ2h0LiI+PHJlY3Qgd2lkdGg9IjM0MCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNGN0YzRTciIHJ4PSIxMCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSB4MT0iNTgiIHkxPSIxNiIgeDI9IjU4IiB5Mj0iMjEyIi8+PGxpbmUgeDE9Ijg0LjQiIHkxPSIxNiIgeDI9Ijg0LjQiIHkyPSIyMTIiLz48bGluZSB4MT0iMTEwLjgiIHkxPSIxNiIgeDI9IjExMC44IiB5Mj0iMjEyIi8+PGxpbmUgeDE9IjEzNy4yIiB5MT0iMTYiIHgyPSIxMzcuMiIgeTI9IjIxMiIvPjxsaW5lIHgxPSIxNjMuNiIgeTE9IjE2IiB4Mj0iMTYzLjYiIHkyPSIyMTIiLz48bGluZSB4MT0iMTkwIiB5MT0iMTYiIHgyPSIxOTAiIHkyPSIyMTIiLz48bGluZSB4MT0iMjE2LjQiIHkxPSIxNiIgeDI9IjIxNi40IiB5Mj0iMjEyIi8+PGxpbmUgeDE9IjI0Mi44IiB5MT0iMTYiIHgyPSIyNDIuOCIgeTI9IjIxMiIvPjxsaW5lIHgxPSIyNjkuMiIgeTE9IjE2IiB4Mj0iMjY5LjIiIHkyPSIyMTIiLz48bGluZSB4MT0iMjk1LjYiIHkxPSIxNiIgeDI9IjI5NS42IiB5Mj0iMjEyIi8+PGxpbmUgeDE9IjMyMiIgeTE9IjE2IiB4Mj0iMzIyIiB5Mj0iMjEyIi8+PC9nPjxsaW5lIGRhdGEtd2hpc2tlcj0iMGxvIiB4MT0iMTEwLjgiIHkxPSI2NSIgeDI9IjE2My42IiB5Mj0iNjUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48bGluZSBkYXRhLXdoaXNrZXI9IjBoaSIgeDE9IjIyNi45NiIgeTE9IjY1IiB4Mj0iMzAwLjg4IiB5Mj0iNjUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48bGluZSBkYXRhLWNhcD0iMGxvIiB4MT0iMTEwLjgiIHkxPSI1Mi44NyIgeDI9IjExMC44IiB5Mj0iNzcuMTMiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48bGluZSBkYXRhLWNhcD0iMGhpIiB4MT0iMzAwLjg4IiB5MT0iNTIuODciIHgyPSIzMDAuODgiIHkyPSI3Ny4xMyIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxyZWN0IGRhdGEtYm94PSIwIiB4PSIxNjMuNiIgeT0iNDIuOTUiIHdpZHRoPSI2My4zNiIgaGVpZ2h0PSI0NC4xIiBmaWxsPSIjNkU5REM4IiBmaWxsLW9wYWNpdHk9IjAuMzUiIHN0cm9rZT0iIzZFOURDOCIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48bGluZSBkYXRhLW1lZGlhbj0iMCIgeDE9IjE4NC43MiIgeTE9IjQyLjk1IiB4Mj0iMTg0LjcyIiB5Mj0iODcuMDUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgZGF0YS13aGlza2VyPSIxbG8iIHgxPSIxMDAuMjQiIHkxPSIxNjMiIHgyPSIxNzQuMTYiIHkyPSIxNjMiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48bGluZSBkYXRhLXdoaXNrZXI9IjFoaSIgeDE9IjI0OC4wOCIgeTE9IjE2MyIgeDI9IjI5MC4zMiIgeTI9IjE2MyIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxsaW5lIGRhdGEtY2FwPSIxbG8iIHgxPSIxMDAuMjQiIHkxPSIxNTAuODciIHgyPSIxMDAuMjQiIHkyPSIxNzUuMTMiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48bGluZSBkYXRhLWNhcD0iMWhpIiB4MT0iMjkwLjMyIiB5MT0iMTUwLjg3IiB4Mj0iMjkwLjMyIiB5Mj0iMTc1LjEzIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS40Ii8+PHJlY3QgZGF0YS1ib3g9IjEiIHg9IjE3NC4xNiIgeT0iMTQwLjk1IiB3aWR0aD0iNzMuOTIiIGhlaWdodD0iNDQuMSIgZmlsbD0iI0YwQTMzRSIgZmlsbC1vcGFjaXR5PSIwLjM1IiBzdHJva2U9IiNGMEEzM0UiIHN0cm9rZS13aWR0aD0iMS42Ii8+PGxpbmUgZGF0YS1tZWRpYW49IjEiIHgxPSIyMTYuNCIgeTE9IjE0MC45NSIgeDI9IjIxNi40IiB5Mj0iMTg1LjA1IiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSI1OCIgeTE9IjIxMiIgeDI9IjMyMiIgeTI9IjIxMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNiIvPjxsaW5lIHgxPSI1OCIgeTE9IjIxMiIgeDI9IjU4IiB5Mj0iMTYiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzBFMEUxMSI+PHRleHQgeD0iNTgiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NTA8L3RleHQ+PHRleHQgeD0iODQuNCIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj41NTwvdGV4dD48dGV4dCB4PSIxMTAuOCIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj42MDwvdGV4dD48dGV4dCB4PSIxMzcuMiIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj42NTwvdGV4dD48dGV4dCB4PSIxNjMuNiIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj43MDwvdGV4dD48dGV4dCB4PSIxOTAiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NzU8L3RleHQ+PHRleHQgeD0iMjE2LjQiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+ODA8L3RleHQ+PHRleHQgeD0iMjQyLjgiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+ODU8L3RleHQ+PHRleHQgeD0iMjY5LjIiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+OTA8L3RleHQ+PHRleHQgeD0iMjk1LjYiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+OTU8L3RleHQ+PHRleHQgeD0iMzIyIiB5PSIyMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjEwMDwvdGV4dD48dGV4dCBkYXRhLWxhbmU9IjAiIHg9IjUyIiB5PSI2OC41IiB0ZXh0LWFuY2hvcj0iZW5kIj5DbGFzcyAxPC90ZXh0Pjx0ZXh0IGRhdGEtbGFuZT0iMSIgeD0iNTIiIHk9IjE2Ni41IiB0ZXh0LWFuY2hvcj0iZW5kIj5DbGFzcyAyPC90ZXh0PjwvZz48dGV4dCB4PSIxOTAiIHk9IjI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMwRTBFMTEiPlRlc3Qgc2NvcmU8L3RleHQ+PC9zdmc+)
   - A) Class 1, because its whisker reaches down to $60$ and up to $96$
   - B) Class 1, because a larger maximum of $96$ shows stronger performance
   - C) Class 2, because its box runs from $72$ to $86$, an interquartile range of $14$, against Class 1's $12$
   - D) Neither, because Class 1's median of $74$ and Class 2's of $80$ are both near the middle

7. Set E is $12, 14, 15, 16, 68$. What is the median?
   - A) $15$
   - B) $25$
   - C) $56$
   - D) $68$

**Advanced Level** (these need multiple steps or reverse thinking)

8. Set E is $12, 14, 15, 16, 68$. A teacher says the mean of $25$ describes a typical value well. What is wrong with that?
   - A) Nothing is wrong, because the mean uses every value in the set
   - B) The mean should be $15$, the middle value, because a mean and a median are the same thing
   - C) The range is $56$, so the spread is what describes the centre here
   - D) The $68$ pulls the mean above four of the five values, while the median of $15$ sits among the data

9. Set P has a mean of $20$ and a range of $4$. Set Q has a mean of $20$ and a range of $30$. Which statement is correct?
   - A) They are equally consistent, because their means match
   - B) The two sets balance at the same place, but Q's values are far more spread out
   - C) Set Q performed better, because its range of $30$ is the larger number
   - D) Set P has the higher typical value, because its range is smaller

10. A data set has a mean of $42$ and a median of $35$. What does that say about its shape?
    - A) It is skewed left, because the mean sits above the median
    - B) It is symmetric, because a mean and a median both describe the centre
    - C) It is skewed right, because the mean sits above the median
    - D) You cannot tell without the range

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

Set F is $5, 8, 11, 14, 22$. What is the range?

- A) $17$
- B) $22$
- C) $12$
- D) $11$

**Item 2**

Set G is $20, 22, 24, 25, 89$. Which number better represents a typical value, and why?

- A) The mean, $36$, because the range of $69$ is large
- B) The median, $24$, because the $89$ sits far above the rest and drags the mean up
- C) The mean, $36$, because it uses every value in the set
- D) The maximum, $89$, because it is the largest value

**Item 3**

Set H and Set J both have a median of $50$. Set H has a mean of $50$ and Set J has a mean of $62$. What follows?

- A) Set J's mean must also be $50$, because the medians match
- B) The two sets are equally consistent, because their middles match
- C) Set J has values stretching above its middle, pulling its mean up
- D) Set J is skewed left, because its mean is higher than its median

**Item 4**

Team X has a median of $30$ and an interquartile range of $16$. Team Y has a median of $30$ and an interquartile range of $8$. Which team is more consistent?

- A) Team X, because its interquartile range of $16$ is the larger number
- B) They are equally consistent, because both medians are $30$
- C) Team X, because its median of $30$ matches Team Y's, so the interquartile range does not matter
- D) Team Y, because its middle half spans $8$ against Team X's $16$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. What is the range of Set A?**

Step 1: Find the extremes of Set A.
- Largest is $14$, smallest is $4$.

Step 2: Subtract.
- $14 - 4 = 10$

**Answer: A** ($10$)

```json
"distractor_logic": {
  "A": "Correct: 14 - 4 = 10",
  "B": "Student makes misconception: range_from_single_extreme (reports the maximum, 14, as the range instead of the difference)",
  "C": "Student makes misconception: reads_wrong_category (computes the range of Set B, 10 - 6 = 4, instead of Set A)",
  "D": "Student makes misconception: center_spread_confusion (reports the mean of Set A, 40 / 5 = 8, where a spread was asked for)"
},
"misconception_tag": {
  "B": "range_from_single_extreme",
  "C": "reads_wrong_category",
  "D": "center_spread_confusion"
}
```

---

**2. Which set is more consistent?**

Step 1: Both spreads.
- Set A: $14 - 4 = 10$
- Set B: $10 - 6 = 4$

Step 2: The smaller spread is the more consistent set.
- $4$ is less than $10$, so Set B.

**Answer: B**

```json
"distractor_logic": {
  "A": "Student makes misconception: range_from_single_extreme (judges by the single largest value, 14, rather than by the difference between the extremes)",
  "B": "Correct: Set B spans 10 - 6 = 4 while Set A spans 14 - 4 = 10, and the smaller spread is the more consistent set",
  "C": "Student makes misconception: equal_means_assumed_equal_consistency (both means are 40 / 5 = 8, and the student reads equal means as equal spread)",
  "D": "Student makes misconception: larger_range_read_as_better (treats the larger range of 10 as the stronger result rather than as greater variability)"
},
"misconception_tag": {
  "A": "range_from_single_extreme",
  "C": "equal_means_assumed_equal_consistency",
  "D": "larger_range_read_as_better"
}
```

---

**3. What is the mean of Set C?**

Step 1: Add the values.
- $2 + 5 + 8 + 9 + 11 = 35$

Step 2: Divide by how many there are.
- $35 / 5 = 7$

**Answer: C** ($7$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reports_wrong_center_measure (reports the median of Set C, 8, where the mean was asked for)",
  "B": "Student makes misconception: center_spread_confusion (reports the range of Set C, 11 - 2 = 9, where a centre was asked for)",
  "C": "Correct: 2 + 5 + 8 + 9 + 11 = 35, and 35 / 5 = 7",
  "D": "Student makes misconception: reads_wrong_category (computes the mean of Set D, 50 / 5 = 10, instead of Set C)"
},
"misconception_tag": {
  "A": "reports_wrong_center_measure",
  "B": "center_spread_confusion",
  "D": "reads_wrong_category"
}
```

---

**4. Both sets have a median of $8$. What does that tell you about their means?**

Step 1: Compute both means.
- Set C: $2 + 5 + 8 + 9 + 11 = 35$, and $35 / 5 = 7$
- Set D: $6 + 7 + 8 + 9 + 20 = 50$, and $50 / 5 = 10$

Step 2: Compare with the shared median.
- The medians are both $8$, and the means are $7$ and $10$.

A median counts positions and ignores how far the outer values sit, so it constrains nothing about the mean.

**Answer: D**

```json
"distractor_logic": {
  "A": "Student makes misconception: equal_medians_assumed_equal_means (reads a shared median of 8 as forcing both means to 8, when they are 7 and 10)",
  "B": "Student makes misconception: center_spread_confusion (reads matching centres as matching spreads, when the ranges are 11 - 2 = 9 and 20 - 6 = 14)",
  "C": "Student makes misconception: outlier_effect_on_mean_dismissed (denies that the 20 moves the mean, when the 20 is exactly what lifts Set D's mean to 50 / 5 = 10 while its median stays at 8)",
  "D": "Correct: the medians are both 8 while the means are 35 / 5 = 7 and 50 / 5 = 10"
},
"misconception_tag": {
  "A": "equal_medians_assumed_equal_means",
  "B": "center_spread_confusion",
  "C": "outlier_effect_on_mean_dismissed"
}
```

---

**Proficient Level**

**5. What is the median score for Class 1?**

Step 1: Find Class 1's box on the graph, the upper one.

Step 2: Read the line inside the box, not an edge and not a whisker end.
- The median line sits at $74$.

**Answer: B** ($74$)

```json
"distractor_logic": {
  "A": "Student makes misconception: range_from_single_extreme (reports Class 1's maximum, 96, the far end of the right whisker)",
  "B": "Correct: the median line inside Class 1's box sits at 74",
  "C": "Student makes misconception: center_spread_confusion (reports Class 1's range, 96 - 60 = 36, where a centre was asked for)",
  "D": "Student makes misconception: reads_wrong_category (reads the median of Class 2, 80, from the other lane)"
},
"misconception_tag": {
  "A": "range_from_single_extreme",
  "C": "center_spread_confusion",
  "D": "reads_wrong_category"
}
```

---

**6. Both classes have a range of $36$. Which class's middle half is more spread out?**

Step 1: The middle half is the box, so use the interquartile range.
- Class 1: $82 - 70 = 12$
- Class 2: $86 - 72 = 14$

Step 2: Compare.
- $14$ is greater than $12$, so Class 2's middle half is more spread out.

The equal ranges are the setup. Both are $96 - 60 = 36$ and $94 - 58 = 36$, so the total spread cannot separate these two and the middle half is what does.

**Answer: C**

```json
"distractor_logic": {
  "A": "Student makes misconception: range_from_single_extreme (judges spread from the whisker ends, 60 and 96, which give the same 36 for both classes and cannot separate them)",
  "B": "Student makes misconception: larger_range_read_as_better (treats the larger maximum of 96 as stronger performance rather than as a statement about spread)",
  "C": "Correct: Class 2's box spans 86 - 72 = 14 against Class 1's 82 - 70 = 12",
  "D": "Student makes misconception: center_spread_confusion (uses the two medians, 74 and 80, to answer a question about spread)"
},
"misconception_tag": {
  "A": "range_from_single_extreme",
  "B": "larger_range_read_as_better",
  "D": "center_spread_confusion"
}
```

---

**7. Set E is $12, 14, 15, 16, 68$. What is the median?**

Step 1: The values are already in order.

Step 2: Take the middle one of $5$ values, the third.
- The median is $15$.

**Answer: A** ($15$)

```json
"distractor_logic": {
  "A": "Correct: with 5 values in order the median is the third, 15",
  "B": "Student makes misconception: reports_wrong_center_measure (reports the mean, 125 / 5 = 25, where the median was asked for)",
  "C": "Student makes misconception: center_spread_confusion (reports the range, 68 - 12 = 56, where a centre was asked for)",
  "D": "Student makes misconception: range_from_single_extreme (reports the maximum, 68)"
},
"misconception_tag": {
  "B": "reports_wrong_center_measure",
  "C": "center_spread_confusion",
  "D": "range_from_single_extreme"
}
```

---

**Advanced Level**

**8. A teacher says the mean of $25$ describes a typical value well. What is wrong with that?**

Step 1: Compute the mean.
- $12 + 14 + 15 + 16 + 68 = 125$, and $125 / 5 = 25$

Step 2: Compare it with the values themselves.
- Four of the five values are $12, 14, 15$ and $16$, every one of them below $25$.

Step 3: Compare with the median.
- The median is $15$, which sits inside the cluster.

**Answer: D**

```json
"distractor_logic": {
  "A": "Student makes misconception: outlier_effect_on_mean_dismissed (defends the mean because it uses every value, which is exactly why the 68 drags it)",
  "B": "Student makes misconception: reports_wrong_center_measure (treats a mean and a median as the same measure, when 125 / 5 = 25 and the median is 15)",
  "C": "Student makes misconception: center_spread_confusion (offers the range, 68 - 12 = 56, as the description of the centre)",
  "D": "Correct: the mean of 125 / 5 = 25 sits above 12, 14, 15 and 16, while the median of 15 sits among them"
},
"misconception_tag": {
  "A": "outlier_effect_on_mean_dismissed",
  "B": "reports_wrong_center_measure",
  "C": "center_spread_confusion"
}
```

---

**9. Set P has a mean of $20$ and a range of $4$. Set Q has a mean of $20$ and a range of $30$. Which statement is correct?**

Step 1: Compare the centres.
- Both means are $20$, so the two sets balance at the same place.

Step 2: Compare the spreads.
- $30 - 4 = 26$, so Q's values are spread over a far wider stretch.

**Answer: B**

```json
"distractor_logic": {
  "A": "Student makes misconception: equal_means_assumed_equal_consistency (reads the shared mean of 20 as making the sets equally consistent, when the ranges are 4 and 30)",
  "B": "Correct: the means are both 20 while the ranges are 4 and 30, a difference of 30 - 4 = 26",
  "C": "Student makes misconception: larger_range_read_as_better (treats Q's range of 30 as the stronger result rather than as greater variability)",
  "D": "Student makes misconception: center_spread_confusion (uses the ranges to rank the typical value, when both means are 20)"
},
"misconception_tag": {
  "A": "equal_means_assumed_equal_consistency",
  "C": "larger_range_read_as_better",
  "D": "center_spread_confusion"
}
```

---

**10. A data set has a mean of $42$ and a median of $35$. What does that say about its shape?**

Step 1: Compare the two centres.
- $42 - 35 = 7$, so the mean sits above the median.

Step 2: Ask what pulls a mean up.
- Values stretching out to the high side. That tail is on the right.

**Answer: C**

```json
"distractor_logic": {
  "A": "Student makes misconception: skew_direction_misread (has the direction backwards: 42 - 35 = 7 puts the mean above the median, which is a right tail, not a left one)",
  "B": "Student makes misconception: reports_wrong_center_measure (treats a mean and a median as interchangeable, when the gap of 42 - 35 = 7 is the whole signal)",
  "C": "Correct: 42 - 35 = 7, so the mean sits above the median and the tail runs to the high side",
  "D": "Student makes misconception: center_spread_confusion (asks for a spread to answer a question the two centres already settle)"
},
"misconception_tag": {
  "A": "skew_direction_misread",
  "B": "reports_wrong_center_measure",
  "D": "center_spread_confusion"
}
```

---

##### Mini Quiz - Worked Solutions

**Item 1: Set F is $5, 8, 11, 14, 22$. What is the range?**

Step 1: Identify the extremes.
- Largest is $22$, smallest is $5$.

Step 2: Subtract.
- $22 - 5 = 17$

**Answer: A** ($17$)

```json
"distractor_logic": {
  "A": "Correct: 22 - 5 = 17",
  "B": "Student makes misconception: range_from_single_extreme (reports the maximum, 22, as the range)",
  "C": "Student makes misconception: center_spread_confusion (reports the mean, 60 / 5 = 12, where a spread was asked for)",
  "D": "Student makes misconception: reports_wrong_center_measure (reports the median, 11, where a spread was asked for)"
},
"misconception_tag": {
  "B": "range_from_single_extreme",
  "C": "center_spread_confusion",
  "D": "reports_wrong_center_measure"
}
```

---

**Item 2: Set G is $20, 22, 24, 25, 89$. Which number better represents a typical value, and why?**

Step 1: Both centres.
- Mean: $20 + 22 + 24 + 25 + 89 = 180$, and $180 / 5 = 36$
- Median: the third of $5$ ordered values, $24$.

Step 2: Compare against the data.
- Four values are $20, 22, 24$ and $25$, all below $36$.

**Answer: B** (the median, $24$)

```json
"distractor_logic": {
  "A": "Student makes misconception: center_spread_confusion (uses the range, 89 - 20 = 69, to justify a choice of centre)",
  "B": "Correct: the mean is 180 / 5 = 36, above four of the five values, while the median of 24 sits among them",
  "C": "Student makes misconception: outlier_effect_on_mean_dismissed (defends the mean of 36 because it uses every value, which is what lets the 89 drag it)",
  "D": "Student makes misconception: range_from_single_extreme (reports the largest value, 89, as the summary)"
},
"misconception_tag": {
  "A": "center_spread_confusion",
  "C": "outlier_effect_on_mean_dismissed",
  "D": "range_from_single_extreme"
}
```

---

**Item 3: Set H and Set J both have a median of $50$. Set H has a mean of $50$ and Set J has a mean of $62$. What follows?**

Step 1: Compare each set's own two centres.
- Set H: mean $50$ and median $50$, so $50 - 50 = 0$.
- Set J: mean $62$ and median $50$, so $62 - 50 = 12$.

Step 2: Read the gap.
- A mean $12$ above the median means values stretch out above the middle.

**Answer: C**

```json
"distractor_logic": {
  "A": "Student makes misconception: equal_medians_assumed_equal_means (reads the shared median of 50 as forcing Set J's mean to 50, when it is given as 62)",
  "B": "Student makes misconception: equal_means_assumed_equal_consistency (reads matching centres as matching consistency, which is a claim about spread and is not given here)",
  "C": "Correct: 62 - 50 = 12, so Set J's mean sits above its median and values stretch above the middle",
  "D": "Student makes misconception: skew_direction_misread (has the direction backwards: a mean above the median is a right tail, not a left one)"
},
"misconception_tag": {
  "A": "equal_medians_assumed_equal_means",
  "B": "equal_means_assumed_equal_consistency",
  "D": "skew_direction_misread"
}
```

---

**Item 4: Team X has a median of $30$ and an interquartile range of $16$. Team Y has a median of $30$ and an interquartile range of $8$. Which team is more consistent?**

Step 1: Consistency is a spread question, so use the interquartile ranges.
- Team X: $16$. Team Y: $8$.

Step 2: The smaller spread is the more consistent team.
- $16 - 8 = 8$, so Team Y's middle half is half as wide.

**Answer: D**

```json
"distractor_logic": {
  "A": "Student makes misconception: larger_range_read_as_better (treats the larger interquartile range of 16 as the stronger result rather than as greater variability)",
  "B": "Student makes misconception: equal_medians_assumed_equal_means (reads the shared median of 30 as settling a question the spreads of 16 and 8 decide)",
  "C": "Student makes misconception: center_spread_confusion (uses the matching centres to dismiss the spread, which is the only thing separating the two teams)",
  "D": "Correct: Team Y's middle half spans 8 against Team X's 16, and 16 - 8 = 8"
},
"misconception_tag": {
  "A": "larger_range_read_as_better",
  "B": "equal_medians_assumed_equal_means",
  "C": "center_spread_confusion"
}
```
