---
topic_name: "Constructing simple graphs and tables"
unit_number: 0
sequence_in_unit: 10
assessment_layer: "DIAGNOSTIC"
estimated_time_minutes: 45
difficulty_band: "Basic"
related_strand: "PR"
keywords: ["frequency table", "grouped frequency", "intervals", "bar graph", "line graph", "constructing tables", "verifying totals"]
---

# PR.1.2 - Constructing Simple Graphs and Tables

**Topic ID:** PR.1.2  
**Unit:** 0  
**Strand:** PR (Probabilistic and Statistical Reasoning)  
**Assessment Layer:** DIAGNOSTIC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Build a frequency table from raw data and verify it by summing the frequencies against the known total.
- Find a missing frequency by subtracting the known frequencies from the stated total, not by reporting the running subtotal.
- Construct grouped frequency intervals that are equal width and non-overlapping, and correctly determine whether a data value or the stated total is the source of any mismatch.

---

#### **Part 1: Guided Notes**

##### A Table Makes a Promise

When you write a frequency table, you are promising something specific: **every value in the data landed in exactly one row, and no row invented anything.**

That promise is checkable, and checking it is one subtraction. Add up your frequencies. The sum must equal the number of things you counted. If it does not, the table is wrong, and you know that before anyone grades it.

The previous topic was about reading data that somebody else organized. This one is about being the person who organizes it, which means you are also the person responsible for it being right.

---

##### Building a Frequency Table

**Example 1:** Ten students named a favourite fruit: apple, banana, apple, cherry, banana, apple, cherry, apple, banana, apple.

Step 1: List every distinct category that appears.
- apple, banana, cherry

Step 2: Walk the data once, marking a tally for each entry. **Once through, in order.** Do not scan back and forth hunting for one category at a time, which is how entries get double counted.

| Fruit | Frequency |
|---|---|
| apple | $5$ |
| banana | $3$ |
| cherry | $2$ |

Step 3: **Verify.** Add the frequencies.
- $5 + 3 + 2 = 10$

Ten responses were collected and ten are accounted for. The table keeps its promise.

Step 3 is not optional and it is not a formality. It is the only step that catches a miscount, and it takes four seconds.

---

##### The Missing Row

A very common question shape gives you the total and all but one category.

**Example 2:** Twenty students were asked how they get to school. The table shows Walk $6$, Bus $8$, Car $4$, and Bike blank. What goes in the Bike row?

Step 1: Add what you have.
- $6 + 8 + 4 = 18$

Step 2: Subtract from the total.
- $20 - 18 = 2$

Step 3: Verify. $6 + 8 + 4 + 2 = 20$. Correct.

The trap here is stopping at step 1 and writing $18$. That number is real, it appeared in your working, and it is not the answer. The missing frequency is what is **left over**, not what is already used.

---

##### When the Total Does Not Match: Find the Real Culprit

This is the part that separates a careful worker from a fast one.

If the frequencies do not sum to the stated total, something is wrong. But **what** is wrong has more than one possible answer, and fixing the wrong thing is worse than not fixing anything.

**Example 3:** A table lists Math $7$, Science $5$, History $6$, Art $4$, with a stated total of $23$. The survey actually had $22$ students.

Step 1: Add the frequencies.
- $7 + 5 + 6 + 4 = 22$

Step 2: Compare against the two claims. The frequencies sum to $22$, which matches the number of students. The stated total of $23$ matches neither.

Step 3: So the data are fine and the **total row** is the error. Change $23$ to $22$.

A student who instead reduces Math from $7$ to $6$ has "fixed" the table by breaking correct data. The frequencies were never the problem. **Before you change anything, work out which element disagrees with the evidence.**

Sometimes it goes the other way. If a survey had $12$ respondents and the table lists Red $7$ and Blue $4$, the frequencies sum to $11$ and one respondent is unaccounted for. Reducing the total to $11$ hides a missing person. The right fix is to find the response that was never recorded and give it a row.

Two different symptoms, two different repairs, and the only way to tell them apart is to check the frequencies against the raw data rather than against the total.

---

##### Grouped Frequency Tables

When data spread over a wide range, individual values are useless as categories. Group them into intervals.

**Example 4:** These scores go into intervals of ten: $3, 7, 12, 15, 18, 22, 25, 29$.

| Interval | Frequency |
|---|---|
| $0$ to $9$ | $2$ |
| $10$ to $19$ | $3$ |
| $20$ to $29$ | $3$ |

Verify: $2 + 3 + 3 = 8$, and there are $8$ values. Good.

**Intervals have three requirements, and one of them gets broken constantly.**

1. **Equal width.** Every interval spans the same amount, so the frequencies are comparable.
2. **No overlap.** This is the one that breaks.
3. **Complete coverage.** Every value in the data has a home.

**The overlap trap.** Intervals written as $10$ to $20$, $20$ to $30$, $30$ to $40$ look tidy and are broken. A value of exactly $20$ belongs to two intervals at once, so two people building the same table get different answers. Write them as $10$ to $19$, $20$ to $29$, $30$ to $39$ instead, so each value has exactly one home.

Notice these intervals are still equal width and still cover everything. The **only** defect in the first version was the shared endpoints, and naming the defect precisely is the skill being tested.

---

##### Regrouping Into Wider Intervals

Combining intervals means **adding their frequencies**, not picking one of them.

**Example 5:** A table shows $60$ to $69$: $5$, $70$ to $79$: $11$, $80$ to $89$: $9$, $90$ to $99$: $5$. Rebuild it with intervals $60$ to $79$ and $80$ to $99$.

- $60$ to $79$: $5 + 11 = 16$
- $80$ to $99$: $9 + 5 = 14$

Verify: $16 + 14 = 30$, and the original four frequencies also sum to $30$. The regrouping conserved everything, which is exactly what regrouping must do.

---

##### Choosing a Display

A short version, because the reasoning is mostly common sense.

| Display | Use it for |
|---|---|
| Bar graph | comparing separate categories |
| Line graph | showing change across ordered time |
| Pie chart | showing each part's share of one whole |

One caution: do not invent rules that do not exist. A bar graph is not limited to four bars. A frequency table is not required to start at zero. A pie chart does not need a minimum number of slices. Restrictions students half remember from a worksheet are a real source of wrong answers, and if you cannot say why a rule would exist, it probably does not.

---

##### The Four Traps

1. **Skipping the verification.** Sum your frequencies and compare against the count. Every time.
2. **Reporting the running subtotal.** In a missing-row problem, the answer is what is left over.
3. **Fixing the wrong element.** Work out whether the data or the total is the thing that disagrees before you change either.
4. **Overlapping intervals.** $10$ to $19$ and $20$ to $29$, never $10$ to $20$ and $20$ to $30$.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Ten students named a favourite fruit: apple, banana, apple, cherry, banana, apple, cherry, apple, banana, apple. In a frequency table of these responses, what frequency should be recorded for apple?
   - A) $5$
   - B) $4$
   - C) $3$
   - D) $10$

2. A frequency table records Red $4$, Blue $5$, and Green $2$, and states a total of $12$. What is the actual sum of the recorded frequencies?

<!-- figure: pr-1-2-p2 -->
![A frequency table of colors. Red 4, Blue 5, Green 2, and a stated Total of 12.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTQ0IiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE0NCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGZyZXF1ZW5jeSB0YWJsZSBvZiBjb2xvcnMuIFJlZCA0LCBCbHVlIDUsIEdyZWVuIDIsIGFuZCBhIHN0YXRlZCBUb3RhbCBvZiAxMi4iPjxyZWN0IHdpZHRoPSIzNDAiIGhlaWdodD0iMTQ0IiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz48cmVjdCB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxMzAuMDEiIGhlaWdodD0iMjQiIGZpbGw9IiM2RTlEQzgiIGZpbGwtb3BhY2l0eT0iMC4xOCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSBkYXRhLXZsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iMTMyIi8+PGxpbmUgZGF0YS12bGluZT0iMSIgeDE9IjYwLjg1IiB5MT0iMTIiIHgyPSI2MC44NSIgeTI9IjEzMiIvPjxsaW5lIGRhdGEtdmxpbmU9IjIiIHgxPSIxNDIuMDEiIHkxPSIxMiIgeDI9IjE0Mi4wMSIgeTI9IjEzMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTQyLjAxIiB5Mj0iMTIiLz48bGluZSBkYXRhLWhsaW5lPSIxIiB4MT0iMTIiIHkxPSIzNiIgeDI9IjE0Mi4wMSIgeTI9IjM2Ii8+PGxpbmUgZGF0YS1obGluZT0iMiIgeDE9IjEyIiB5MT0iNjAiIHgyPSIxNDIuMDEiIHkyPSI2MCIvPjxsaW5lIGRhdGEtaGxpbmU9IjMiIHgxPSIxMiIgeTE9Ijg0IiB4Mj0iMTQyLjAxIiB5Mj0iODQiLz48bGluZSBkYXRhLWhsaW5lPSI0IiB4MT0iMTIiIHkxPSIxMDgiIHgyPSIxNDIuMDEiIHkyPSIxMDgiLz48bGluZSBkYXRhLWhsaW5lPSI1IiB4MT0iMTIiIHkxPSIxMzIiIHgyPSIxNDIuMDEiIHkyPSIxMzIiLz48L2c+PGcgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMwRTBFMTEiPjx0ZXh0IGRhdGEtaGVhZD0iMCIgeD0iMTciIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5Db2xvcjwvdGV4dD48dGV4dCBkYXRhLWhlYWQ9IjEiIHg9IjY1Ljg1IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+RnJlcXVlbmN5PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0wIiB4PSIxNyIgeT0iNTIiIGZvbnQtd2VpZ2h0PSI2MDAiPlJlZDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iNjUuODUiIHk9IjUyIj40PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPkJsdWU8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTEiIHg9IjY1Ljg1IiB5PSI3NiI+NTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMCIgeD0iMTciIHk9IjEwMCIgZm9udC13ZWlnaHQ9IjYwMCI+R3JlZW48L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTEiIHg9IjY1Ljg1IiB5PSIxMDAiPjI8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIzLTAiIHg9IjE3IiB5PSIxMjQiIGZvbnQtd2VpZ2h0PSI2MDAiPlRvdGFsPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMy0xIiB4PSI2NS44NSIgeT0iMTI0Ij4xMjwvdGV4dD48L2c+PC9zdmc+)
   - A) $9$
   - B) $12$
   - C) $10$
   - D) $11$

3. A dataset contains the values $3, 7, 12, 15, 18, 22, 25, 29$. A grouped frequency table uses the intervals $0$ to $9$, $10$ to $19$, and $20$ to $29$. How many values fall in the $10$ to $19$ interval?
   - A) $4$
   - B) $2$
   - C) $3$
   - D) $8$

4. Nine people reported these shoe sizes: $8, 9, 8, 10, 9, 8, 11, 9, 9$. In a frequency table of these sizes, what frequency should be recorded for size $9$?
   - A) $5$
   - B) $3$
   - C) $4$
   - D) $9$

**Proficient Level** (these require an extra step)

5. Twenty students were asked how they travel to school. A frequency table shows Walk $6$, Bus $8$, Car $4$, and leaves the Bike row blank. What frequency belongs in the Bike row?

<!-- figure: pr-1-2-p5 -->
![A frequency table of how students travel to school. Walk 6, Bus 8, Car 4, Bike left blank, and a Total of 20.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTY4IiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE2OCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGZyZXF1ZW5jeSB0YWJsZSBvZiBob3cgc3R1ZGVudHMgdHJhdmVsIHRvIHNjaG9vbC4gV2FsayA2LCBCdXMgOCwgQ2FyIDQsIEJpa2UgbGVmdCBibGFuaywgYW5kIGEgVG90YWwgb2YgMjAuIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE2OCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iMTg5LjI5IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNkU5REM4IiBmaWxsLW9wYWNpdHk9IjAuMTgiLz48ZyBzdHJva2U9IiNFMkRDQ0EiIHN0cm9rZS13aWR0aD0iMSI+PGxpbmUgZGF0YS12bGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxMiIgeTI9IjE1NiIvPjxsaW5lIGRhdGEtdmxpbmU9IjEiIHgxPSIxMjAuMTMiIHkxPSIxMiIgeDI9IjEyMC4xMyIgeTI9IjE1NiIvPjxsaW5lIGRhdGEtdmxpbmU9IjIiIHgxPSIyMDEuMjkiIHkxPSIxMiIgeDI9IjIwMS4yOSIgeTI9IjE1NiIvPjxsaW5lIGRhdGEtaGxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMjAxLjI5IiB5Mj0iMTIiLz48bGluZSBkYXRhLWhsaW5lPSIxIiB4MT0iMTIiIHkxPSIzNiIgeDI9IjIwMS4yOSIgeTI9IjM2Ii8+PGxpbmUgZGF0YS1obGluZT0iMiIgeDE9IjEyIiB5MT0iNjAiIHgyPSIyMDEuMjkiIHkyPSI2MCIvPjxsaW5lIGRhdGEtaGxpbmU9IjMiIHgxPSIxMiIgeTE9Ijg0IiB4Mj0iMjAxLjI5IiB5Mj0iODQiLz48bGluZSBkYXRhLWhsaW5lPSI0IiB4MT0iMTIiIHkxPSIxMDgiIHgyPSIyMDEuMjkiIHkyPSIxMDgiLz48bGluZSBkYXRhLWhsaW5lPSI1IiB4MT0iMTIiIHkxPSIxMzIiIHgyPSIyMDEuMjkiIHkyPSIxMzIiLz48bGluZSBkYXRhLWhsaW5lPSI2IiB4MT0iMTIiIHkxPSIxNTYiIHgyPSIyMDEuMjkiIHkyPSIxNTYiLz48L2c+PGcgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMwRTBFMTEiPjx0ZXh0IGRhdGEtaGVhZD0iMCIgeD0iMTciIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5UcmF2ZWwgbWV0aG9kPC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMSIgeD0iMTI1LjEzIiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+RnJlcXVlbmN5PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0wIiB4PSIxNyIgeT0iNTIiIGZvbnQtd2VpZ2h0PSI2MDAiPldhbGs8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTEiIHg9IjEyNS4xMyIgeT0iNTIiPjY8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTAiIHg9IjE3IiB5PSI3NiIgZm9udC13ZWlnaHQ9IjYwMCI+QnVzPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0xIiB4PSIxMjUuMTMiIHk9Ijc2Ij44PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5DYXI8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTEiIHg9IjEyNS4xMyIgeT0iMTAwIj40PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMy0wIiB4PSIxNyIgeT0iMTI0IiBmb250LXdlaWdodD0iNjAwIj5CaWtlPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMy0xIiB4PSIxMjUuMTMiIHk9IjEyNCI+PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iNC0wIiB4PSIxNyIgeT0iMTQ4IiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjQtMSIgeD0iMTI1LjEzIiB5PSIxNDgiPjIwPC90ZXh0PjwvZz48L3N2Zz4=)
   - A) $18$
   - B) $2$
   - C) $20$
   - D) $3$

6. A student builds a grouped frequency table using the intervals $10$ to $20$, $20$ to $30$, and $30$ to $40$. What is the structural problem with these intervals?
   - A) There is no problem with these intervals.
   - B) The intervals are unequal in width, so their frequencies cannot be compared.
   - C) A grouped frequency table may not use more than two intervals.
   - D) The intervals share endpoints, so a value of $20$ could be counted in two intervals.

7. A frequency table lists Math $7$, Science $5$, History $6$, and Art $4$, and states a total of $23$. The survey was given to $22$ students. Which single change makes the table correct?

<!-- figure: pr-1-2-p7 -->
![A frequency table of favorite subject. Math 7, Science 5, History 6, Art 4, and a stated Total of 23.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTY4IiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE2OCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGZyZXF1ZW5jeSB0YWJsZSBvZiBmYXZvcml0ZSBzdWJqZWN0LiBNYXRoIDcsIFNjaWVuY2UgNSwgSGlzdG9yeSA2LCBBcnQgNCwgYW5kIGEgc3RhdGVkIFRvdGFsIG9mIDIzLiI+PHJlY3Qgd2lkdGg9IjM0MCIgaGVpZ2h0PSIxNjgiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjE0Ni4xNiIgaGVpZ2h0PSIyNCIgZmlsbD0iIzZFOURDOCIgZmlsbC1vcGFjaXR5PSIwLjE4Ii8+PGcgc3Ryb2tlPSIjRTJEQ0NBIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIGRhdGEtdmxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTIiIHkyPSIxNTYiLz48bGluZSBkYXRhLXZsaW5lPSIxIiB4MT0iNzciIHkxPSIxMiIgeDI9Ijc3IiB5Mj0iMTU2Ii8+PGxpbmUgZGF0YS12bGluZT0iMiIgeDE9IjE1OC4xNiIgeTE9IjEyIiB4Mj0iMTU4LjE2IiB5Mj0iMTU2Ii8+PGxpbmUgZGF0YS1obGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxNTguMTYiIHkyPSIxMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjEiIHgxPSIxMiIgeTE9IjM2IiB4Mj0iMTU4LjE2IiB5Mj0iMzYiLz48bGluZSBkYXRhLWhsaW5lPSIyIiB4MT0iMTIiIHkxPSI2MCIgeDI9IjE1OC4xNiIgeTI9IjYwIi8+PGxpbmUgZGF0YS1obGluZT0iMyIgeDE9IjEyIiB5MT0iODQiIHgyPSIxNTguMTYiIHkyPSI4NCIvPjxsaW5lIGRhdGEtaGxpbmU9IjQiIHgxPSIxMiIgeTE9IjEwOCIgeDI9IjE1OC4xNiIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtaGxpbmU9IjUiIHgxPSIxMiIgeTE9IjEzMiIgeDI9IjE1OC4xNiIgeTI9IjEzMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjYiIHgxPSIxMiIgeTE9IjE1NiIgeDI9IjE1OC4xNiIgeTI9IjE1NiIvPjwvZz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzBFMEUxMSI+PHRleHQgZGF0YS1oZWFkPSIwIiB4PSIxNyIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPlN1YmplY3Q8L3RleHQ+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSI4MiIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPkZyZXF1ZW5jeTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMCIgeD0iMTciIHk9IjUyIiBmb250LXdlaWdodD0iNjAwIj5NYXRoPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0xIiB4PSI4MiIgeT0iNTIiPjc8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTAiIHg9IjE3IiB5PSI3NiIgZm9udC13ZWlnaHQ9IjYwMCI+U2NpZW5jZTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMSIgeD0iODIiIHk9Ijc2Ij41PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5IaXN0b3J5PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0xIiB4PSI4MiIgeT0iMTAwIj42PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMy0wIiB4PSIxNyIgeT0iMTI0IiBmb250LXdlaWdodD0iNjAwIj5BcnQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIzLTEiIHg9IjgyIiB5PSIxMjQiPjQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSI0LTAiIHg9IjE3IiB5PSIxNDgiIGZvbnQtd2VpZ2h0PSI2MDAiPlRvdGFsPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iNC0xIiB4PSI4MiIgeT0iMTQ4Ij4yMzwvdGV4dD48L2c+PC9zdmc+)
   - A) Change the total to $22$, because the four frequencies already sum to $22$.
   - B) Change Math from $7$ to $6$, so that the frequencies sum to a smaller number.
   - C) Make no change, because the table already states a total.
   - D) Nothing can be done, because a frequency table must have exactly three categories.

**Advanced Level** (these need multiple steps or reverse thinking)

8. A class of $25$ students was surveyed about pets. A table records Dog $10$, Cat $8$, Fish $3$, and None $5$, and states a total of $25$. By how much do the recorded frequencies exceed the number of students surveyed?

<!-- figure: pr-1-2-p8 -->
![A frequency table of pets. Dog 10, Cat 8, Fish 3, None 5, and a stated Total of 25.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTY4IiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE2OCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGZyZXF1ZW5jeSB0YWJsZSBvZiBwZXRzLiBEb2cgMTAsIENhdCA4LCBGaXNoIDMsIE5vbmUgNSwgYW5kIGEgc3RhdGVkIFRvdGFsIG9mIDI1LiI+PHJlY3Qgd2lkdGg9IjM0MCIgaGVpZ2h0PSIxNjgiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjEyNy4yOCIgaGVpZ2h0PSIyNCIgZmlsbD0iIzZFOURDOCIgZmlsbC1vcGFjaXR5PSIwLjE4Ii8+PGcgc3Ryb2tlPSIjRTJEQ0NBIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIGRhdGEtdmxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTIiIHkyPSIxNTYiLz48bGluZSBkYXRhLXZsaW5lPSIxIiB4MT0iNTguMTIiIHkxPSIxMiIgeDI9IjU4LjEyIiB5Mj0iMTU2Ii8+PGxpbmUgZGF0YS12bGluZT0iMiIgeDE9IjEzOS4yOCIgeTE9IjEyIiB4Mj0iMTM5LjI4IiB5Mj0iMTU2Ii8+PGxpbmUgZGF0YS1obGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxMzkuMjgiIHkyPSIxMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjEiIHgxPSIxMiIgeTE9IjM2IiB4Mj0iMTM5LjI4IiB5Mj0iMzYiLz48bGluZSBkYXRhLWhsaW5lPSIyIiB4MT0iMTIiIHkxPSI2MCIgeDI9IjEzOS4yOCIgeTI9IjYwIi8+PGxpbmUgZGF0YS1obGluZT0iMyIgeDE9IjEyIiB5MT0iODQiIHgyPSIxMzkuMjgiIHkyPSI4NCIvPjxsaW5lIGRhdGEtaGxpbmU9IjQiIHgxPSIxMiIgeTE9IjEwOCIgeDI9IjEzOS4yOCIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtaGxpbmU9IjUiIHgxPSIxMiIgeTE9IjEzMiIgeDI9IjEzOS4yOCIgeTI9IjEzMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjYiIHgxPSIxMiIgeTE9IjE1NiIgeDI9IjEzOS4yOCIgeTI9IjE1NiIvPjwvZz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzBFMEUxMSI+PHRleHQgZGF0YS1oZWFkPSIwIiB4PSIxNyIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPlBldDwvdGV4dD48dGV4dCBkYXRhLWhlYWQ9IjEiIHg9IjYzLjEyIiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+RnJlcXVlbmN5PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0wIiB4PSIxNyIgeT0iNTIiIGZvbnQtd2VpZ2h0PSI2MDAiPkRvZzwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iNjMuMTIiIHk9IjUyIj4xMDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMCIgeD0iMTciIHk9Ijc2IiBmb250LXdlaWdodD0iNjAwIj5DYXQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTEiIHg9IjYzLjEyIiB5PSI3NiI+ODwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMCIgeD0iMTciIHk9IjEwMCIgZm9udC13ZWlnaHQ9IjYwMCI+RmlzaDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iNjMuMTIiIHk9IjEwMCI+MzwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjMtMCIgeD0iMTciIHk9IjEyNCIgZm9udC13ZWlnaHQ9IjYwMCI+Tm9uZTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjMtMSIgeD0iNjMuMTIiIHk9IjEyNCI+NTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjQtMCIgeD0iMTciIHk9IjE0OCIgZm9udC13ZWlnaHQ9IjYwMCI+VG90YWw8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSI0LTEiIHg9IjYzLjEyIiB5PSIxNDgiPjI1PC90ZXh0PjwvZz48L3N2Zz4=)
   - A) $0$
   - B) $1$
   - C) $26$
   - D) $2$

9. A grouped frequency table of $30$ test scores shows $60$ to $69$: $5$, $70$ to $79$: $11$, $80$ to $89$: $9$, and $90$ to $99$: $5$. The same data are rebuilt using the wider intervals $60$ to $79$ and $80$ to $99$. What frequencies should the new table show?

<!-- figure: pr-1-2-p9 -->
![A grouped frequency table of 30 test scores. 60 to 69: 5, 70 to 79: 11, 80 to 89: 9, 90 to 99: 5, Total 30.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTY4IiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE2OCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGdyb3VwZWQgZnJlcXVlbmN5IHRhYmxlIG9mIDMwIHRlc3Qgc2NvcmVzLiA2MCB0byA2OTogNSwgNzAgdG8gNzk6IDExLCA4MCB0byA4OTogOSwgOTAgdG8gOTk6IDUsIFRvdGFsIDMwLiI+PHJlY3Qgd2lkdGg9IjM0MCIgaGVpZ2h0PSIxNjgiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjE0Ni40IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNkU5REM4IiBmaWxsLW9wYWNpdHk9IjAuMTgiLz48ZyBzdHJva2U9IiNFMkRDQ0EiIHN0cm9rZS13aWR0aD0iMSI+PGxpbmUgZGF0YS12bGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxMiIgeTI9IjE1NiIvPjxsaW5lIGRhdGEtdmxpbmU9IjEiIHgxPSI3Ny4yNCIgeTE9IjEyIiB4Mj0iNzcuMjQiIHkyPSIxNTYiLz48bGluZSBkYXRhLXZsaW5lPSIyIiB4MT0iMTU4LjQiIHkxPSIxMiIgeDI9IjE1OC40IiB5Mj0iMTU2Ii8+PGxpbmUgZGF0YS1obGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxNTguNCIgeTI9IjEyIi8+PGxpbmUgZGF0YS1obGluZT0iMSIgeDE9IjEyIiB5MT0iMzYiIHgyPSIxNTguNCIgeTI9IjM2Ii8+PGxpbmUgZGF0YS1obGluZT0iMiIgeDE9IjEyIiB5MT0iNjAiIHgyPSIxNTguNCIgeTI9IjYwIi8+PGxpbmUgZGF0YS1obGluZT0iMyIgeDE9IjEyIiB5MT0iODQiIHgyPSIxNTguNCIgeTI9Ijg0Ii8+PGxpbmUgZGF0YS1obGluZT0iNCIgeDE9IjEyIiB5MT0iMTA4IiB4Mj0iMTU4LjQiIHkyPSIxMDgiLz48bGluZSBkYXRhLWhsaW5lPSI1IiB4MT0iMTIiIHkxPSIxMzIiIHgyPSIxNTguNCIgeTI9IjEzMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjYiIHgxPSIxMiIgeTE9IjE1NiIgeDI9IjE1OC40IiB5Mj0iMTU2Ii8+PC9nPjxnIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmaWxsPSIjMEUwRTExIj48dGV4dCBkYXRhLWhlYWQ9IjAiIHg9IjE3IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+U2NvcmU8L3RleHQ+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSI4Mi4yNCIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPkZyZXF1ZW5jeTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMCIgeD0iMTciIHk9IjUyIiBmb250LXdlaWdodD0iNjAwIj42MCB0byA2OTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iODIuMjQiIHk9IjUyIj41PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPjcwIHRvIDc5PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0xIiB4PSI4Mi4yNCIgeT0iNzYiPjExPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj44MCB0byA4OTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iODIuMjQiIHk9IjEwMCI+OTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjMtMCIgeD0iMTciIHk9IjEyNCIgZm9udC13ZWlnaHQ9IjYwMCI+OTAgdG8gOTk8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIzLTEiIHg9IjgyLjI0IiB5PSIxMjQiPjU8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSI0LTAiIHg9IjE3IiB5PSIxNDgiIGZvbnQtd2VpZ2h0PSI2MDAiPlRvdGFsPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iNC0xIiB4PSI4Mi4yNCIgeT0iMTQ4Ij4zMDwvdGV4dD48L2c+PC9zdmc+)
   - A) $5$ and $9$
   - B) $16$ and $14$
   - C) $11$ and $5$
   - D) $30$ and $30$

10. A survey had $12$ respondents. A frequency table lists Red $7$ and Blue $4$. Checking the raw responses confirms that $7$ people chose Red and $4$ chose Blue, and that one respondent chose Green. What is the correct repair to the table?

<!-- figure: pr-1-2-p10 -->
![A frequency table listing only two colors. Red 7 and Blue 4.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgOTYiIHdpZHRoPSIzNDAiIGhlaWdodD0iOTYiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0iQSBmcmVxdWVuY3kgdGFibGUgbGlzdGluZyBvbmx5IHR3byBjb2xvcnMuIFJlZCA3IGFuZCBCbHVlIDQuIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz48cmVjdCB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxMjcuMjgiIGhlaWdodD0iMjQiIGZpbGw9IiM2RTlEQzgiIGZpbGwtb3BhY2l0eT0iMC4xOCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSBkYXRhLXZsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iODQiLz48bGluZSBkYXRhLXZsaW5lPSIxIiB4MT0iNTguMTIiIHkxPSIxMiIgeDI9IjU4LjEyIiB5Mj0iODQiLz48bGluZSBkYXRhLXZsaW5lPSIyIiB4MT0iMTM5LjI4IiB5MT0iMTIiIHgyPSIxMzkuMjgiIHkyPSI4NCIvPjxsaW5lIGRhdGEtaGxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTM5LjI4IiB5Mj0iMTIiLz48bGluZSBkYXRhLWhsaW5lPSIxIiB4MT0iMTIiIHkxPSIzNiIgeDI9IjEzOS4yOCIgeTI9IjM2Ii8+PGxpbmUgZGF0YS1obGluZT0iMiIgeDE9IjEyIiB5MT0iNjAiIHgyPSIxMzkuMjgiIHkyPSI2MCIvPjxsaW5lIGRhdGEtaGxpbmU9IjMiIHgxPSIxMiIgeTE9Ijg0IiB4Mj0iMTM5LjI4IiB5Mj0iODQiLz48L2c+PGcgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMwRTBFMTEiPjx0ZXh0IGRhdGEtaGVhZD0iMCIgeD0iMTciIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5Db2xvcjwvdGV4dD48dGV4dCBkYXRhLWhlYWQ9IjEiIHg9IjYzLjEyIiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+RnJlcXVlbmN5PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0wIiB4PSIxNyIgeT0iNTIiIGZvbnQtd2VpZ2h0PSI2MDAiPlJlZDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iNjMuMTIiIHk9IjUyIj43PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPkJsdWU8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTEiIHg9IjYzLjEyIiB5PSI3NiI+NDwvdGV4dD48L2c+PC9zdmc+)
    - A) Make no change, because $11$ and $12$ are close enough.
    - B) Change Blue from $4$ to $5$, because the table is one short.
    - C) Change the stated total from $12$ to $11$, to match the two rows shown.
    - D) Add a Green row with frequency $1$, because Red and Blue are both correct.

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Nine students answered a yes or no question with these responses: yes, no, yes, yes, no, yes, no, yes, yes. In a frequency table, what frequency should be recorded for yes?

- A) $3$
- B) $5$
- C) $6$
- D) $9$

**Item 2**

A frequency table records A $6$, B $4$, and C $3$, and states a total of $14$. What is the actual sum of the recorded frequencies?

<!-- figure: pr-1-2-q2 -->
![A frequency table. Option A 6, B 4, C 3, and a stated Total of 14.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTQ0IiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE0NCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGZyZXF1ZW5jeSB0YWJsZS4gT3B0aW9uIEEgNiwgQiA0LCBDIDMsIGFuZCBhIHN0YXRlZCBUb3RhbCBvZiAxNC4iPjxyZWN0IHdpZHRoPSIzNDAiIGhlaWdodD0iMTQ0IiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz48cmVjdCB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxMzUuMzUiIGhlaWdodD0iMjQiIGZpbGw9IiM2RTlEQzgiIGZpbGwtb3BhY2l0eT0iMC4xOCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSBkYXRhLXZsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iMTMyIi8+PGxpbmUgZGF0YS12bGluZT0iMSIgeDE9IjY2LjE5IiB5MT0iMTIiIHgyPSI2Ni4xOSIgeTI9IjEzMiIvPjxsaW5lIGRhdGEtdmxpbmU9IjIiIHgxPSIxNDcuMzUiIHkxPSIxMiIgeDI9IjE0Ny4zNSIgeTI9IjEzMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTQ3LjM1IiB5Mj0iMTIiLz48bGluZSBkYXRhLWhsaW5lPSIxIiB4MT0iMTIiIHkxPSIzNiIgeDI9IjE0Ny4zNSIgeTI9IjM2Ii8+PGxpbmUgZGF0YS1obGluZT0iMiIgeDE9IjEyIiB5MT0iNjAiIHgyPSIxNDcuMzUiIHkyPSI2MCIvPjxsaW5lIGRhdGEtaGxpbmU9IjMiIHgxPSIxMiIgeTE9Ijg0IiB4Mj0iMTQ3LjM1IiB5Mj0iODQiLz48bGluZSBkYXRhLWhsaW5lPSI0IiB4MT0iMTIiIHkxPSIxMDgiIHgyPSIxNDcuMzUiIHkyPSIxMDgiLz48bGluZSBkYXRhLWhsaW5lPSI1IiB4MT0iMTIiIHkxPSIxMzIiIHgyPSIxNDcuMzUiIHkyPSIxMzIiLz48L2c+PGcgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMwRTBFMTEiPjx0ZXh0IGRhdGEtaGVhZD0iMCIgeD0iMTciIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5PcHRpb248L3RleHQ+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSI3MS4xOSIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPkZyZXF1ZW5jeTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMCIgeD0iMTciIHk9IjUyIiBmb250LXdlaWdodD0iNjAwIj5BPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0xIiB4PSI3MS4xOSIgeT0iNTIiPjY8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTAiIHg9IjE3IiB5PSI3NiIgZm9udC13ZWlnaHQ9IjYwMCI+QjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMSIgeD0iNzEuMTkiIHk9Ijc2Ij40PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5DPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0xIiB4PSI3MS4xOSIgeT0iMTAwIj4zPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMy0wIiB4PSIxNyIgeT0iMTI0IiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjMtMSIgeD0iNzEuMTkiIHk9IjEyNCI+MTQ8L3RleHQ+PC9nPjwvc3ZnPg==)

- A) $10$
- B) $14$
- C) $12$
- D) $13$

**Proficient Level**

**Item 3**

Eighteen students were surveyed about how they travel to school. A table shows Walk $5$ and Bus $7$, and leaves the Car row blank. What frequency belongs in the Car row?

<!-- figure: pr-1-2-q3 -->
![A frequency table of how students travel to school. Walk 5, Bus 7, Car left blank, and a Total of 18.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTQ0IiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE0NCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGZyZXF1ZW5jeSB0YWJsZSBvZiBob3cgc3R1ZGVudHMgdHJhdmVsIHRvIHNjaG9vbC4gV2FsayA1LCBCdXMgNywgQ2FyIGxlZnQgYmxhbmssIGFuZCBhIFRvdGFsIG9mIDE4LiI+PHJlY3Qgd2lkdGg9IjM0MCIgaGVpZ2h0PSIxNDQiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjE4OS4yOSIgaGVpZ2h0PSIyNCIgZmlsbD0iIzZFOURDOCIgZmlsbC1vcGFjaXR5PSIwLjE4Ii8+PGcgc3Ryb2tlPSIjRTJEQ0NBIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIGRhdGEtdmxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTIiIHkyPSIxMzIiLz48bGluZSBkYXRhLXZsaW5lPSIxIiB4MT0iMTIwLjEzIiB5MT0iMTIiIHgyPSIxMjAuMTMiIHkyPSIxMzIiLz48bGluZSBkYXRhLXZsaW5lPSIyIiB4MT0iMjAxLjI5IiB5MT0iMTIiIHgyPSIyMDEuMjkiIHkyPSIxMzIiLz48bGluZSBkYXRhLWhsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjIwMS4yOSIgeTI9IjEyIi8+PGxpbmUgZGF0YS1obGluZT0iMSIgeDE9IjEyIiB5MT0iMzYiIHgyPSIyMDEuMjkiIHkyPSIzNiIvPjxsaW5lIGRhdGEtaGxpbmU9IjIiIHgxPSIxMiIgeTE9IjYwIiB4Mj0iMjAxLjI5IiB5Mj0iNjAiLz48bGluZSBkYXRhLWhsaW5lPSIzIiB4MT0iMTIiIHkxPSI4NCIgeDI9IjIwMS4yOSIgeTI9Ijg0Ii8+PGxpbmUgZGF0YS1obGluZT0iNCIgeDE9IjEyIiB5MT0iMTA4IiB4Mj0iMjAxLjI5IiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS1obGluZT0iNSIgeDE9IjEyIiB5MT0iMTMyIiB4Mj0iMjAxLjI5IiB5Mj0iMTMyIi8+PC9nPjxnIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmaWxsPSIjMEUwRTExIj48dGV4dCBkYXRhLWhlYWQ9IjAiIHg9IjE3IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+VHJhdmVsIG1ldGhvZDwvdGV4dD48dGV4dCBkYXRhLWhlYWQ9IjEiIHg9IjEyNS4xMyIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPkZyZXF1ZW5jeTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMCIgeD0iMTciIHk9IjUyIiBmb250LXdlaWdodD0iNjAwIj5XYWxrPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0xIiB4PSIxMjUuMTMiIHk9IjUyIj41PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPkJ1czwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMSIgeD0iMTI1LjEzIiB5PSI3NiI+NzwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMCIgeD0iMTciIHk9IjEwMCIgZm9udC13ZWlnaHQ9IjYwMCI+Q2FyPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0xIiB4PSIxMjUuMTMiIHk9IjEwMCI+PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMy0wIiB4PSIxNyIgeT0iMTI0IiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjMtMSIgeD0iMTI1LjEzIiB5PSIxMjQiPjE4PC90ZXh0PjwvZz48L3N2Zz4=)

- A) $12$
- B) $6$
- C) $18$
- D) $5$

**Item 4**

A student builds a grouped frequency table using the intervals $0$ to $10$, $10$ to $20$, and $20$ to $30$. What is the structural problem with these intervals?

- A) The intervals share endpoints, so a value of $10$ could be counted in two intervals.
- B) The intervals are unequal in width, so their frequencies cannot be compared.
- C) A grouped frequency table may not use an interval that begins at zero.
- D) There is no problem with these intervals.

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Ten students named a favourite fruit. In a frequency table of these responses, what frequency should be recorded for apple?**

Step 1: Walk the list once, in order, marking each apple.
- apple, banana, **apple**, cherry, banana, **apple**, cherry, **apple**, banana, **apple**, counting the first entry as well

Step 2: Apple appears at the first, third, sixth, eighth and tenth positions.
- $5$

Step 3: Verify the whole table. Apple $5$, banana $3$, cherry $2$, and $5 + 3 + 2 = 10$, which matches the ten responses.

**Answer: A** ($5$)

```json
"distractor_logic": {
  "A": "Correct: counts every apple entry once on a single pass, giving 5, and the full table sums to the 10 responses",
  "B": "Student makes misconception: off_by_one_count (loses one apple while scanning, most often the first or last entry in the list)",
  "C": "Student makes misconception: reads_wrong_category (reports the frequency of banana, the right kind of value read off the wrong category)",
  "D": "Student makes misconception: total_accepted_without_verifying (reports the number of responses collected as though it were a single category's frequency)"
},
"misconception_tag": {
  "B": "off_by_one_count",
  "C": "reads_wrong_category",
  "D": "total_accepted_without_verifying"
}
```

---

**2. A frequency table records Red $4$, Blue $5$, and Green $2$, and states a total of $12$. What is the actual sum of the recorded frequencies?**

Step 1: Add the three recorded frequencies.
- $4 + 5 + 2 = 11$

Step 2: Compare to the stated total. The table says $12$ but its own rows sum to $11$, so the table is inconsistent.

**Answer: D** ($11$)

```json
"distractor_logic": {
  "A": "Student makes misconception: frequency_value_misread (reads Blue as 3 rather than 5 and totals from the wrong value)",
  "B": "Student makes misconception: total_accepted_without_verifying (repeats the stated total instead of adding the rows, which is exactly the check the question asks for)",
  "C": "Student makes misconception: off_by_one_count (loses one while adding the three frequencies)",
  "D": "Correct: adds the three recorded frequencies for 11, which exposes the stated total of 12 as inconsistent"
},
"misconception_tag": {
  "A": "frequency_value_misread",
  "B": "total_accepted_without_verifying",
  "C": "off_by_one_count"
}
```

---

**3. A dataset contains the values $3, 7, 12, 15, 18, 22, 25, 29$. How many values fall in the $10$ to $19$ interval?**

Step 1: Read the interval boundaries. It holds values from $10$ through $19$ inclusive.

Step 2: Walk the data and select those values.
- $12$, $15$, $18$

Step 3: Count them.
- $3$

Step 4: Verify the whole table. $2 + 3 + 3 = 8$, and there are $8$ values.

**Answer: C** ($3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reads_adjacent_value (pulls 22 in from the neighbouring interval, counting a value that belongs to the 20 to 29 row)",
  "B": "Student makes misconception: off_by_one_count (loses one value while scanning the list)",
  "C": "Correct: selects 12, 15 and 18 as the values between 10 and 19 inclusive",
  "D": "Student makes misconception: total_accepted_without_verifying (reports the size of the whole dataset instead of the count in the interval asked for)"
},
"misconception_tag": {
  "A": "reads_adjacent_value",
  "B": "off_by_one_count",
  "D": "total_accepted_without_verifying"
}
```

---

**4. Nine people reported these shoe sizes: $8, 9, 8, 10, 9, 8, 11, 9, 9$. What frequency should be recorded for size $9$?**

Step 1: Walk the list once, marking each $9$.
- Positions two, five, eight and nine

Step 2: Count.
- $4$

Step 3: Verify the whole table. Size $8$ appears $3$ times, size $9$ appears $4$, size $10$ once, size $11$ once, and $3 + 4 + 1 + 1 = 9$, matching the nine responses.

**Answer: C** ($4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: off_by_one_count (double counts one entry while scanning back through the list)",
  "B": "Student makes misconception: category_values_swapped (records the frequency belonging to size 8 in the size 9 row, exchanging the two categories' values)",
  "C": "Correct: counts the four entries equal to 9, and the full table sums to the nine responses",
  "D": "Student makes misconception: total_accepted_without_verifying (reports the number of responses collected as a single category's frequency)"
},
"misconception_tag": {
  "A": "off_by_one_count",
  "B": "category_values_swapped",
  "D": "total_accepted_without_verifying"
}
```

---

**Proficient Level**

**5. Twenty students were asked how they travel to school. The table shows Walk $6$, Bus $8$, Car $4$, and leaves the Bike row blank. What frequency belongs in the Bike row?**

Step 1: Add the three known frequencies.
- $6 + 8 + 4 = 18$

Step 2: Subtract from the total. The missing row holds what is left over.
- $20 - 18 = 2$

Step 3: Verify. $6 + 8 + 4 + 2 = 20$. Correct.

**Answer: B** ($2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (reports the running subtotal of the three known categories instead of the amount left over)",
  "B": "Correct: subtracts the 18 already accounted for from the 20 students, leaving 2 for the blank row",
  "C": "Student makes misconception: total_accepted_without_verifying (writes the overall total into the blank row without subtracting the categories already recorded)",
  "D": "Student makes misconception: off_by_one_count (loses one while adding the three known frequencies, subtracting 17 from 20)"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "C": "total_accepted_without_verifying",
  "D": "off_by_one_count"
}
```

---

**6. A student builds a grouped frequency table using the intervals $10$ to $20$, $20$ to $30$, and $30$ to $40$. What is the structural problem with these intervals?**

Step 1: Check equal width. Each interval spans $10$, so widths are fine.

Step 2: Check coverage. Values from $10$ to $40$ all have a home, so coverage is fine.

Step 3: Check overlap. The value $20$ appears as the top of the first interval and the bottom of the second. It belongs to both, so two people building this table can get different answers.

Step 4: The fix is to write the intervals as $10$ to $19$, $20$ to $29$, $30$ to $39$, which keeps the equal widths and the coverage while giving every value exactly one home.

**Answer: D** (the intervals share endpoints)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_accepted_without_verifying (accepts the intervals as given without testing a boundary value against them)",
  "B": "Student makes misconception: error_traced_to_wrong_source (senses correctly that the intervals are malformed but blames their widths, which are in fact all equal at 10)",
  "C": "Student makes misconception: false_structural_rule_invented (asserts a cap on the number of intervals a grouped frequency table may use, which is not a real restriction)",
  "D": "Correct: identifies the shared endpoints as the defect, since a value of 20 falls in two intervals at once"
},
"misconception_tag": {
  "A": "total_accepted_without_verifying",
  "B": "error_traced_to_wrong_source",
  "C": "false_structural_rule_invented"
}
```

---

**7. A frequency table lists Math $7$, Science $5$, History $6$, and Art $4$, and states a total of $23$. The survey was given to $22$ students. Which single change makes the table correct?**

Step 1: Add the frequencies.
- $7 + 5 + 6 + 4 = 22$

Step 2: Compare against both claims. The frequencies sum to $22$, which matches the number of students surveyed. The stated total of $23$ matches neither.

Step 3: So the data are right and the total row is the one element that disagrees. Correct it to $22$.

**Answer: A** (change the total to $22$)

```json
"distractor_logic": {
  "A": "Correct: finds that the frequencies already sum to the 22 students surveyed, leaving the stated total as the only element that disagrees",
  "B": "Student makes misconception: fix_applied_to_wrong_element (edits a category frequency when the frequencies were the part that agreed with the raw data, breaking correct data to satisfy a wrong total)",
  "C": "Student makes misconception: total_accepted_without_verifying (treats the stated total as authoritative without ever adding the rows to test it)",
  "D": "Student makes misconception: false_structural_rule_invented (asserts a fixed number of categories a frequency table must have, which is not a real restriction)"
},
"misconception_tag": {
  "B": "fix_applied_to_wrong_element",
  "C": "total_accepted_without_verifying",
  "D": "false_structural_rule_invented"
}
```

---

**Advanced Level**

**8. A class of $25$ students was surveyed about pets. A table records Dog $10$, Cat $8$, Fish $3$, and None $5$, and states a total of $25$. By how much do the recorded frequencies exceed the number of students surveyed?**

Step 1: Add the recorded frequencies.
- $10 + 8 + 3 + 5 = 26$

Step 2: Compare against the number of students.
- $26 - 25 = 1$

The frequencies account for one more response than there were students, which usually means one student was counted in two categories.

**Answer: B** ($1$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_accepted_without_verifying (accepts the stated total of 25 as the sum of the rows and so finds no discrepancy at all)",
  "B": "Correct: sums the rows to 26 and subtracts the 25 students, giving an excess of 1",
  "C": "Student makes misconception: answers_intermediate_value (computes the sum of the frequencies correctly and reports it instead of the excess the question asks for)",
  "D": "Student makes misconception: off_by_one_count (miscounts while adding the four frequencies, reaching 27 and an excess of 2)"
},
"misconception_tag": {
  "A": "total_accepted_without_verifying",
  "C": "answers_intermediate_value",
  "D": "off_by_one_count"
}
```

---

**9. A grouped frequency table of $30$ test scores shows $60$ to $69$: $5$, $70$ to $79$: $11$, $80$ to $89$: $9$, and $90$ to $99$: $5$. The same data are rebuilt using the wider intervals $60$ to $79$ and $80$ to $99$. What frequencies should the new table show?**

Step 1: Each wide interval swallows two of the narrow ones, so add their frequencies.
- $60$ to $79$: $5 + 11 = 16$
- $80$ to $99$: $9 + 5 = 14$

Step 2: Verify. $16 + 14 = 30$, and the original four frequencies also sum to $30$. Regrouping conserved every score.

**Answer: B** ($16$ and $14$)

```json
"distractor_logic": {
  "A": "Student makes misconception: frequency_value_misread (takes only the first narrow frequency in each wide interval and computes from those values alone, losing 14 of the 30 scores)",
  "B": "Correct: adds the two narrow frequencies inside each wide interval, and the totals still sum to 30",
  "C": "Student makes misconception: reads_adjacent_value (takes the second narrow frequency in each pair rather than combining both)",
  "D": "Student makes misconception: total_accepted_without_verifying (writes the overall total into both rows without checking that the rows must themselves sum to it)"
},
"misconception_tag": {
  "A": "frequency_value_misread",
  "C": "reads_adjacent_value",
  "D": "total_accepted_without_verifying"
}
```

---

**10. A survey had $12$ respondents. A frequency table lists Red $7$ and Blue $4$. Checking the raw responses confirms that $7$ people chose Red and $4$ chose Blue, and that one respondent chose Green. What is the correct repair to the table?**

Step 1: Add the recorded frequencies.
- $7 + 4 = 11$, one short of the $12$ respondents

Step 2: Check each recorded frequency against the raw responses. Both Red and Blue are confirmed correct, so neither is the source of the shortfall.

Step 3: The raw data name a response the table has no row for. The missing element is a category, not a wrong number.

Step 4: Add a Green row with frequency $1$. Verify: $7 + 4 + 1 = 12$. Correct.

**Answer: D** (add a Green row with frequency $1$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_accepted_without_verifying (declines to reconcile the rows against the respondent count at all)",
  "B": "Student makes misconception: error_traced_to_wrong_source (spots the shortfall of one correctly but attributes it to the Blue count, which the raw responses confirm is right)",
  "C": "Student makes misconception: fix_applied_to_wrong_element (edits the total to match the incomplete rows, which hides a respondent rather than recording them)",
  "D": "Correct: confirms both recorded frequencies against the raw data and adds the missing category, bringing the table to 12"
},
"misconception_tag": {
  "A": "total_accepted_without_verifying",
  "B": "error_traced_to_wrong_source",
  "C": "fix_applied_to_wrong_element"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Nine students answered a yes or no question. What frequency should be recorded for yes?**

Step 1: Walk the list once.
- yes at the first, third, fourth, sixth, eighth and ninth positions

Step 2: Count.
- $6$

Step 3: Verify. No appears $3$ times, and $6 + 3 = 9$, matching the nine responses.

**Answer: C** ($6$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reads_wrong_category (reports the frequency of no, the right kind of value read off the wrong category)",
  "B": "Student makes misconception: off_by_one_count (loses one yes while scanning the list)",
  "C": "Correct: counts the six yes responses on a single pass, and the table sums to the nine responses",
  "D": "Student makes misconception: total_accepted_without_verifying (reports the number of responses collected as a single category's frequency)"
},
"misconception_tag": {
  "A": "reads_wrong_category",
  "B": "off_by_one_count",
  "D": "total_accepted_without_verifying"
}
```

---

**Item 2: A frequency table records A $6$, B $4$, and C $3$, and states a total of $14$. What is the actual sum of the recorded frequencies?**

Step 1: Add the rows.
- $6 + 4 + 3 = 13$

Step 2: The stated total of $14$ does not match, so the table is inconsistent.

**Answer: D** ($13$)

```json
"distractor_logic": {
  "A": "Student makes misconception: frequency_value_misread (reads A as 3 rather than 6 and totals from the wrong value)",
  "B": "Student makes misconception: total_accepted_without_verifying (repeats the stated total instead of adding the rows)",
  "C": "Student makes misconception: off_by_one_count (loses one while adding the three frequencies)",
  "D": "Correct: adds the three recorded frequencies for 13, exposing the stated total of 14 as inconsistent"
},
"misconception_tag": {
  "A": "frequency_value_misread",
  "B": "total_accepted_without_verifying",
  "C": "off_by_one_count"
}
```

---

**Item 3: Eighteen students were surveyed. A table shows Walk $5$ and Bus $7$, and leaves the Car row blank. What frequency belongs in the Car row?**

Step 1: Add the known frequencies.
- $5 + 7 = 12$

Step 2: Subtract from the total.
- $18 - 12 = 6$

Step 3: Verify. $5 + 7 + 6 = 18$. Correct.

**Answer: B** ($6$)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (reports the running subtotal of the two known categories instead of the amount left over)",
  "B": "Correct: subtracts the 12 already accounted for from the 18 students, leaving 6 for the blank row",
  "C": "Student makes misconception: total_accepted_without_verifying (writes the overall total into the blank row without subtracting the categories already recorded)",
  "D": "Student makes misconception: off_by_one_count (miscounts the subtraction by one, reporting 5 where 6 is left over)"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "C": "total_accepted_without_verifying",
  "D": "off_by_one_count"
}
```

---

**Item 4: A student builds a grouped frequency table using the intervals $0$ to $10$, $10$ to $20$, and $20$ to $30$. What is the structural problem with these intervals?**

Step 1: Widths are all $10$, so equal width is satisfied.

Step 2: Coverage from $0$ to $30$ is complete.

Step 3: The value $10$ tops the first interval and starts the second, so it belongs to both. The same is true of $20$.

Step 4: Rewrite as $0$ to $9$, $10$ to $19$, $20$ to $29$.

**Answer: A** (the intervals share endpoints)

```json
"distractor_logic": {
  "A": "Correct: identifies the shared endpoints as the defect, since a value of 10 falls in two intervals at once",
  "B": "Student makes misconception: error_traced_to_wrong_source (senses correctly that the intervals are malformed but blames their widths, which are in fact all equal at 10)",
  "C": "Student makes misconception: false_structural_rule_invented (asserts that an interval may not begin at zero, which is not a real restriction)",
  "D": "Student makes misconception: total_accepted_without_verifying (accepts the intervals as given without testing a boundary value against them)"
},
"misconception_tag": {
  "B": "error_traced_to_wrong_source",
  "C": "false_structural_rule_invented",
  "D": "total_accepted_without_verifying"
}
```

##### Extra Practice - Answer Key

**1. Fifteen students named a favorite color. What frequency should be recorded for red?**

Step 1: Walk the list once, marking each red.
Step 2: Red appears at positions one, three, six, eight, ten, thirteen and fifteen.
- $7$

Step 3: Verify. Blue $4$, green $4$, red $7$, and $4 + 4 + 7 = 15$, matching the fifteen responses.

**Answer: B** ($7$)

```json
"distractor_logic": {
  "A": "Student makes misconception: off_by_one_count (loses one red while scanning the list)",
  "B": "Correct: counts the seven red entries on a single pass, and the full table sums to the 15 responses",
  "C": "Student makes misconception: total_accepted_without_verifying (reports the number of responses collected as though it were a single category's frequency)",
  "D": "Student makes misconception: reads_wrong_category (reports the frequency of blue or green, the right kind of value read off the wrong category)"
},
"misconception_tag": {
  "A": "off_by_one_count",
  "C": "total_accepted_without_verifying",
  "D": "reads_wrong_category"
}
```

---

**2. A frequency table records Yes $9$, No $6$, and Maybe $3$, and states a total of $19$. What is the actual sum of the recorded frequencies?**

Step 1: Add the three recorded frequencies.
- $9 + 6 + 3 = 18$

Step 2: Compare to the stated total. The table says $19$ but its own rows sum to $18$, so the table is inconsistent.

**Answer: D** ($18$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_accepted_without_verifying (repeats the stated total instead of adding the rows, which is exactly the check the question asks for)",
  "B": "Student makes misconception: off_by_one_count (loses one while adding the three frequencies)",
  "C": "Student makes misconception: frequency_value_misread (reads No as 3 rather than 6 and totals from the wrong value)",
  "D": "Correct: adds the three recorded frequencies for 18, which exposes the stated total of 19 as inconsistent"
},
"misconception_tag": {
  "A": "total_accepted_without_verifying",
  "B": "off_by_one_count",
  "C": "frequency_value_misread"
}
```

---

**3. A dataset contains the values $4, 9, 13, 16, 19, 24, 27, 31$. How many values fall in the $10$ to $19$ interval?**

Step 1: Read the interval boundaries. It holds values from $10$ through $19$ inclusive.

Step 2: Walk the data and select those values.
- $13$, $16$, $19$

Step 3: Count them.
- $3$

Step 4: Verify the whole table. $2 + 3 + 2 + 1 = 8$, and there are $8$ values.

**Answer: A** ($3$)

```json
"distractor_logic": {
  "A": "Correct: selects 13, 16 and 19 as the values between 10 and 19 inclusive",
  "B": "Student makes misconception: off_by_one_count (loses one value while scanning the list)",
  "C": "Student makes misconception: reads_adjacent_value (pulls 24 in from the neighbouring 20 to 29 interval)",
  "D": "Student makes misconception: total_accepted_without_verifying (reports the size of the whole dataset instead of the count in the interval asked for)"
},
"misconception_tag": {
  "B": "off_by_one_count",
  "C": "reads_adjacent_value",
  "D": "total_accepted_without_verifying"
}
```

---

**4. Twelve cars were counted by color passing an intersection. What frequency should be recorded for white?**

Step 1: Walk the list once, marking each white.
Step 2: White appears at positions one, three, six, eight, ten and twelve.
- $6$

Step 3: Verify. Black $3$, silver $3$, white $6$, and $3 + 3 + 6 = 12$, matching the twelve cars.

**Answer: C** ($6$)

```json
"distractor_logic": {
  "A": "Student makes misconception: off_by_one_count (loses one white entry while scanning the list)",
  "B": "Student makes misconception: total_accepted_without_verifying (reports the number of cars counted as a single category's frequency)",
  "C": "Correct: counts the six white entries on a single pass, and the full table sums to the 12 cars",
  "D": "Student makes misconception: reads_wrong_category (reports the frequency of black or silver, the right kind of value read off the wrong category)"
},
"misconception_tag": {
  "A": "off_by_one_count",
  "B": "total_accepted_without_verifying",
  "D": "reads_wrong_category"
}
```

---

**5. Twenty-four students were asked their favorite subject. A frequency table shows Math $7$, Science $6$, English $5$, and leaves the History row blank. What frequency belongs in the History row?**

Step 1: Add the three known frequencies.
- $7 + 6 + 5 = 18$

Step 2: Subtract from the total. The missing row holds what is left over.
- $24 - 18 = 6$

Step 3: Verify. $7 + 6 + 5 + 6 = 24$. Correct.

**Answer: D** ($6$)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (reports the running subtotal of the three known categories instead of the amount left over)",
  "B": "Student makes misconception: total_accepted_without_verifying (writes the overall total into the blank row without subtracting the categories already recorded)",
  "C": "Student makes misconception: off_by_one_count (miscounts while adding the three known frequencies, subtracting 19 from 24)",
  "D": "Correct: subtracts the 18 already accounted for from the 24 students, leaving 6 for the blank row"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "B": "total_accepted_without_verifying",
  "C": "off_by_one_count"
}
```

---

**6. A student builds a grouped frequency table using the intervals $0$ to $9$, $10$ to $29$, and $30$ to $34$. What is the structural problem with these intervals?**

Step 1: Check overlap. $9$ and $10$ are distinct, $29$ and $30$ are distinct, so no value falls in two intervals.

Step 2: Check coverage. Values from $0$ to $34$ all have a home.

Step 3: Check width. The first interval spans $10$, the second spans $20$, the third spans $5$. The widths are not equal, so frequencies from different intervals cannot be fairly compared.

**Answer: B** (the intervals are unequal in width)

```json
"distractor_logic": {
  "A": "Student makes misconception: error_traced_to_wrong_source (senses correctly that the intervals are malformed but blames shared endpoints, when 9 to 10 and 29 to 30 do not in fact overlap)",
  "B": "Correct: identifies the unequal widths, 10, 20 and 5, as the defect that breaks fair comparison between intervals",
  "C": "Student makes misconception: false_structural_rule_invented (asserts a grouped frequency table must always split its range into exactly three equal parts, which is not a real restriction)",
  "D": "Student makes misconception: total_accepted_without_verifying (accepts the intervals as given without checking width, overlap or coverage)"
},
"misconception_tag": {
  "A": "error_traced_to_wrong_source",
  "C": "false_structural_rule_invented",
  "D": "total_accepted_without_verifying"
}
```

---

**7. A frequency table lists Cats $9$, Dogs $6$, Birds $3$, and Fish $4$, and states a total of $21$. The survey was given to $22$ students. Which single change makes the table correct?**

Step 1: Add the frequencies.
- $9 + 6 + 3 + 4 = 22$

Step 2: Compare against both claims. The frequencies sum to $22$, which matches the number of students surveyed. The stated total of $21$ matches neither.

Step 3: So the data are right and the total row is the one element that disagrees. Correct it to $22$.

**Answer: C** (change the total to $22$)

```json
"distractor_logic": {
  "A": "Student makes misconception: fix_applied_to_wrong_element (edits a category frequency when the frequencies were the part that agreed with the raw data)",
  "B": "Student makes misconception: total_accepted_without_verifying (treats the stated total as authoritative without ever adding the rows to test it)",
  "C": "Correct: finds that the frequencies already sum to the 22 students surveyed, leaving the stated total as the only element that disagrees",
  "D": "Student makes misconception: false_structural_rule_invented (asserts a fixed number of categories a frequency table must have, which is not a real restriction)"
},
"misconception_tag": {
  "A": "fix_applied_to_wrong_element",
  "B": "total_accepted_without_verifying",
  "D": "false_structural_rule_invented"
}
```

---

**8. A class of $28$ students was surveyed about siblings. A table records $0$ siblings $9$, $1$ sibling $11$, $2$ siblings $6$, $3$ or more siblings $3$, and states a total of $28$. By how much do the recorded frequencies exceed the number of students surveyed?**

Step 1: Add the recorded frequencies.
- $9 + 11 + 6 + 3 = 29$

Step 2: Compare against the number of students.
- $29 - 28 = 1$

**Answer: A** ($1$)

```json
"distractor_logic": {
  "A": "Correct: sums the rows to 29 and subtracts the 28 students, giving an excess of 1",
  "B": "Student makes misconception: total_accepted_without_verifying (accepts the stated total of 28 as the sum of the rows and so finds no discrepancy at all)",
  "C": "Student makes misconception: answers_intermediate_value (computes the sum of the frequencies correctly and reports it instead of the excess the question asks for)",
  "D": "Student makes misconception: off_by_one_count (miscounts while adding the four frequencies, reaching 30 and an excess of 2)"
},
"misconception_tag": {
  "B": "total_accepted_without_verifying",
  "C": "answers_intermediate_value",
  "D": "off_by_one_count"
}
```

---

**9. A grouped frequency table of $40$ commute times shows $0$ to $9$ minutes: $6$, $10$ to $19$ minutes: $14$, $20$ to $29$ minutes: $12$, and $30$ to $39$ minutes: $8$. The same data are rebuilt using the wider intervals $0$ to $19$ and $20$ to $39$. What frequencies should the new table show?**

Step 1: Each wide interval swallows two of the narrow ones, so add their frequencies.
- $0$ to $19$: $6 + 14 = 20$
- $20$ to $39$: $12 + 8 = 20$

Step 2: Verify. $20 + 20 = 40$, and the original four frequencies also sum to $40$.

**Answer: D** ($20$ and $20$)

```json
"distractor_logic": {
  "A": "Student makes misconception: frequency_value_misread (takes only the first narrow frequency in each wide interval, 6 and 12, losing the rest)",
  "B": "Student makes misconception: reads_adjacent_value (takes the second narrow frequency in each pair, 14 and 8, rather than combining both)",
  "C": "Student makes misconception: total_accepted_without_verifying (writes the overall total into both rows without checking that the rows must themselves sum to it)",
  "D": "Correct: adds the two narrow frequencies inside each wide interval, and the totals still sum to 40"
},
"misconception_tag": {
  "A": "frequency_value_misread",
  "B": "reads_adjacent_value",
  "C": "total_accepted_without_verifying"
}
```

---

**10. A survey had $15$ respondents. A frequency table lists Tea $9$ and Coffee $5$. Checking the raw responses confirms that $9$ people chose Tea and $5$ chose Coffee, and that one respondent chose Water. What is the correct repair to the table?**

Step 1: Add the recorded frequencies.
- $9 + 5 = 14$, one short of the $15$ respondents

Step 2: Check each recorded frequency against the raw responses. Both Tea and Coffee are confirmed correct, so neither is the source of the shortfall.

Step 3: The raw data name a response the table has no row for.

Step 4: Add a Water row with frequency $1$. Verify: $9 + 5 + 1 = 15$. Correct.

**Answer: B** (add a Water row with frequency $1$)

```json
"distractor_logic": {
  "A": "Student makes misconception: fix_applied_to_wrong_element (edits the total to match the incomplete rows, which hides a respondent rather than recording them)",
  "B": "Correct: confirms both recorded frequencies against the raw data and adds the missing category, bringing the table to 15",
  "C": "Student makes misconception: total_accepted_without_verifying (declines to reconcile the rows against the respondent count at all)",
  "D": "Student makes misconception: error_traced_to_wrong_source (spots the shortfall of one correctly but attributes it to the Coffee count, which the raw responses confirm is right)"
},
"misconception_tag": {
  "A": "fix_applied_to_wrong_element",
  "C": "total_accepted_without_verifying",
  "D": "error_traced_to_wrong_source"
}
```

---

#### **Part 5: Extra Practice**

More of the same skill, for a worksheet rather than for the mastery gate. These items are drawn by the worksheet generator and are not part of the 9-of-12 practice gate or the 3-of-4 quiz gate. Worked solutions for them sit at the end of Part 4.

**Basic Level**

1. Fifteen students named a favorite color: red, blue, red, green, blue, red, green, red, blue, red, green, blue, red, green, red. In a frequency table of these responses, what frequency should be recorded for red?
   - A) $6$
   - B) $7$
   - C) $15$
   - D) $4$

2. A frequency table records Yes $9$, No $6$, and Maybe $3$, and states a total of $19$. What is the actual sum of the recorded frequencies?

<!-- figure: pr-1-2-e2 -->
![A frequency table of responses. Yes 9, No 6, Maybe 3, and a stated Total of 19.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTQ0IiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE0NCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGZyZXF1ZW5jeSB0YWJsZSBvZiByZXNwb25zZXMuIFllcyA5LCBObyA2LCBNYXliZSAzLCBhbmQgYSBzdGF0ZWQgVG90YWwgb2YgMTkuIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE0NCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iMTU2Ljk4IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNkU5REM4IiBmaWxsLW9wYWNpdHk9IjAuMTgiLz48ZyBzdHJva2U9IiNFMkRDQ0EiIHN0cm9rZS13aWR0aD0iMSI+PGxpbmUgZGF0YS12bGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxMiIgeTI9IjEzMiIvPjxsaW5lIGRhdGEtdmxpbmU9IjEiIHgxPSI4Ny44MiIgeTE9IjEyIiB4Mj0iODcuODIiIHkyPSIxMzIiLz48bGluZSBkYXRhLXZsaW5lPSIyIiB4MT0iMTY4Ljk4IiB5MT0iMTIiIHgyPSIxNjguOTgiIHkyPSIxMzIiLz48bGluZSBkYXRhLWhsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjE2OC45OCIgeTI9IjEyIi8+PGxpbmUgZGF0YS1obGluZT0iMSIgeDE9IjEyIiB5MT0iMzYiIHgyPSIxNjguOTgiIHkyPSIzNiIvPjxsaW5lIGRhdGEtaGxpbmU9IjIiIHgxPSIxMiIgeTE9IjYwIiB4Mj0iMTY4Ljk4IiB5Mj0iNjAiLz48bGluZSBkYXRhLWhsaW5lPSIzIiB4MT0iMTIiIHkxPSI4NCIgeDI9IjE2OC45OCIgeTI9Ijg0Ii8+PGxpbmUgZGF0YS1obGluZT0iNCIgeDE9IjEyIiB5MT0iMTA4IiB4Mj0iMTY4Ljk4IiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS1obGluZT0iNSIgeDE9IjEyIiB5MT0iMTMyIiB4Mj0iMTY4Ljk4IiB5Mj0iMTMyIi8+PC9nPjxnIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmaWxsPSIjMEUwRTExIj48dGV4dCBkYXRhLWhlYWQ9IjAiIHg9IjE3IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+UmVzcG9uc2U8L3RleHQ+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSI5Mi44MiIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPkZyZXF1ZW5jeTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMCIgeD0iMTciIHk9IjUyIiBmb250LXdlaWdodD0iNjAwIj5ZZXM8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTEiIHg9IjkyLjgyIiB5PSI1MiI+OTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMCIgeD0iMTciIHk9Ijc2IiBmb250LXdlaWdodD0iNjAwIj5ObzwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMSIgeD0iOTIuODIiIHk9Ijc2Ij42PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5NYXliZTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iOTIuODIiIHk9IjEwMCI+MzwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjMtMCIgeD0iMTciIHk9IjEyNCIgZm9udC13ZWlnaHQ9IjYwMCI+VG90YWw8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIzLTEiIHg9IjkyLjgyIiB5PSIxMjQiPjE5PC90ZXh0PjwvZz48L3N2Zz4=)
   - A) $19$
   - B) $17$
   - C) $15$
   - D) $18$

3. A dataset contains the values $4, 9, 13, 16, 19, 24, 27, 31$. A grouped frequency table uses the intervals $0$ to $9$, $10$ to $19$, $20$ to $29$, and $30$ to $39$. How many values fall in the $10$ to $19$ interval?
   - A) $3$
   - B) $2$
   - C) $4$
   - D) $8$

4. Twelve cars were counted by color passing an intersection: white, black, white, silver, black, white, silver, white, black, white, silver, white. In a frequency table of these colors, what frequency should be recorded for white?
   - A) $5$
   - B) $12$
   - C) $6$
   - D) $3$

**Proficient Level**

5. Twenty-four students were asked their favorite subject. A frequency table shows Math $7$, Science $6$, English $5$, and leaves the History row blank. What frequency belongs in the History row?

<!-- figure: pr-1-2-e5 -->
![A frequency table of favorite subject. Math 7, Science 6, English 5, History left blank, and a Total of 24.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTY4IiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE2OCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGZyZXF1ZW5jeSB0YWJsZSBvZiBmYXZvcml0ZSBzdWJqZWN0LiBNYXRoIDcsIFNjaWVuY2UgNiwgRW5nbGlzaCA1LCBIaXN0b3J5IGxlZnQgYmxhbmssIGFuZCBhIFRvdGFsIG9mIDI0LiI+PHJlY3Qgd2lkdGg9IjM0MCIgaGVpZ2h0PSIxNjgiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjE0Ni4xNiIgaGVpZ2h0PSIyNCIgZmlsbD0iIzZFOURDOCIgZmlsbC1vcGFjaXR5PSIwLjE4Ii8+PGcgc3Ryb2tlPSIjRTJEQ0NBIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIGRhdGEtdmxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTIiIHkyPSIxNTYiLz48bGluZSBkYXRhLXZsaW5lPSIxIiB4MT0iNzciIHkxPSIxMiIgeDI9Ijc3IiB5Mj0iMTU2Ii8+PGxpbmUgZGF0YS12bGluZT0iMiIgeDE9IjE1OC4xNiIgeTE9IjEyIiB4Mj0iMTU4LjE2IiB5Mj0iMTU2Ii8+PGxpbmUgZGF0YS1obGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxNTguMTYiIHkyPSIxMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjEiIHgxPSIxMiIgeTE9IjM2IiB4Mj0iMTU4LjE2IiB5Mj0iMzYiLz48bGluZSBkYXRhLWhsaW5lPSIyIiB4MT0iMTIiIHkxPSI2MCIgeDI9IjE1OC4xNiIgeTI9IjYwIi8+PGxpbmUgZGF0YS1obGluZT0iMyIgeDE9IjEyIiB5MT0iODQiIHgyPSIxNTguMTYiIHkyPSI4NCIvPjxsaW5lIGRhdGEtaGxpbmU9IjQiIHgxPSIxMiIgeTE9IjEwOCIgeDI9IjE1OC4xNiIgeTI9IjEwOCIvPjxsaW5lIGRhdGEtaGxpbmU9IjUiIHgxPSIxMiIgeTE9IjEzMiIgeDI9IjE1OC4xNiIgeTI9IjEzMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjYiIHgxPSIxMiIgeTE9IjE1NiIgeDI9IjE1OC4xNiIgeTI9IjE1NiIvPjwvZz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzBFMEUxMSI+PHRleHQgZGF0YS1oZWFkPSIwIiB4PSIxNyIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPlN1YmplY3Q8L3RleHQ+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSI4MiIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPkZyZXF1ZW5jeTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMCIgeD0iMTciIHk9IjUyIiBmb250LXdlaWdodD0iNjAwIj5NYXRoPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0xIiB4PSI4MiIgeT0iNTIiPjc8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTAiIHg9IjE3IiB5PSI3NiIgZm9udC13ZWlnaHQ9IjYwMCI+U2NpZW5jZTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMSIgeD0iODIiIHk9Ijc2Ij42PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj5FbmdsaXNoPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0xIiB4PSI4MiIgeT0iMTAwIj41PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMy0wIiB4PSIxNyIgeT0iMTI0IiBmb250LXdlaWdodD0iNjAwIj5IaXN0b3J5PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMy0xIiB4PSI4MiIgeT0iMTI0Ij48L3RleHQ+PHRleHQgZGF0YS1jZWxsPSI0LTAiIHg9IjE3IiB5PSIxNDgiIGZvbnQtd2VpZ2h0PSI2MDAiPlRvdGFsPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iNC0xIiB4PSI4MiIgeT0iMTQ4Ij4yNDwvdGV4dD48L2c+PC9zdmc+)
   - A) $18$
   - B) $24$
   - C) $5$
   - D) $6$

6. A student builds a grouped frequency table using the intervals $0$ to $9$, $10$ to $29$, and $30$ to $34$. What is the structural problem with these intervals?
   - A) The intervals share endpoints, so a value could be counted in two intervals.
   - B) The intervals are unequal in width, so their frequencies cannot be fairly compared.
   - C) A grouped frequency table must always split the range into exactly three equal parts.
   - D) There is no problem with these intervals.

7. A frequency table lists Cats $9$, Dogs $6$, Birds $3$, and Fish $4$, and states a total of $21$. The survey was given to $22$ students. Which single change makes the table correct?

<!-- figure: pr-1-2-e7 -->
![A frequency table of pets. Cats 9, Dogs 6, Birds 3, Fish 4, and a stated Total of 21.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTY4IiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE2OCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGZyZXF1ZW5jeSB0YWJsZSBvZiBwZXRzLiBDYXRzIDksIERvZ3MgNiwgQmlyZHMgMywgRmlzaCA0LCBhbmQgYSBzdGF0ZWQgVG90YWwgb2YgMjEuIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE2OCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iMTI3LjI4IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNkU5REM4IiBmaWxsLW9wYWNpdHk9IjAuMTgiLz48ZyBzdHJva2U9IiNFMkRDQ0EiIHN0cm9rZS13aWR0aD0iMSI+PGxpbmUgZGF0YS12bGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxMiIgeTI9IjE1NiIvPjxsaW5lIGRhdGEtdmxpbmU9IjEiIHgxPSI1OC4xMiIgeTE9IjEyIiB4Mj0iNTguMTIiIHkyPSIxNTYiLz48bGluZSBkYXRhLXZsaW5lPSIyIiB4MT0iMTM5LjI4IiB5MT0iMTIiIHgyPSIxMzkuMjgiIHkyPSIxNTYiLz48bGluZSBkYXRhLWhsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjEzOS4yOCIgeTI9IjEyIi8+PGxpbmUgZGF0YS1obGluZT0iMSIgeDE9IjEyIiB5MT0iMzYiIHgyPSIxMzkuMjgiIHkyPSIzNiIvPjxsaW5lIGRhdGEtaGxpbmU9IjIiIHgxPSIxMiIgeTE9IjYwIiB4Mj0iMTM5LjI4IiB5Mj0iNjAiLz48bGluZSBkYXRhLWhsaW5lPSIzIiB4MT0iMTIiIHkxPSI4NCIgeDI9IjEzOS4yOCIgeTI9Ijg0Ii8+PGxpbmUgZGF0YS1obGluZT0iNCIgeDE9IjEyIiB5MT0iMTA4IiB4Mj0iMTM5LjI4IiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS1obGluZT0iNSIgeDE9IjEyIiB5MT0iMTMyIiB4Mj0iMTM5LjI4IiB5Mj0iMTMyIi8+PGxpbmUgZGF0YS1obGluZT0iNiIgeDE9IjEyIiB5MT0iMTU2IiB4Mj0iMTM5LjI4IiB5Mj0iMTU2Ii8+PC9nPjxnIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmaWxsPSIjMEUwRTExIj48dGV4dCBkYXRhLWhlYWQ9IjAiIHg9IjE3IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+UGV0PC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMSIgeD0iNjMuMTIiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5GcmVxdWVuY3k8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTAiIHg9IjE3IiB5PSI1MiIgZm9udC13ZWlnaHQ9IjYwMCI+Q2F0czwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iNjMuMTIiIHk9IjUyIj45PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPkRvZ3M8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTEiIHg9IjYzLjEyIiB5PSI3NiI+NjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMCIgeD0iMTciIHk9IjEwMCIgZm9udC13ZWlnaHQ9IjYwMCI+QmlyZHM8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIyLTEiIHg9IjYzLjEyIiB5PSIxMDAiPjM8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIzLTAiIHg9IjE3IiB5PSIxMjQiIGZvbnQtd2VpZ2h0PSI2MDAiPkZpc2g8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIzLTEiIHg9IjYzLjEyIiB5PSIxMjQiPjQ8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSI0LTAiIHg9IjE3IiB5PSIxNDgiIGZvbnQtd2VpZ2h0PSI2MDAiPlRvdGFsPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iNC0xIiB4PSI2My4xMiIgeT0iMTQ4Ij4yMTwvdGV4dD48L2c+PC9zdmc+)
   - A) Change Cats from $9$ to $8$, so that the frequencies sum to a smaller number.
   - B) Make no change, because the table already states a total.
   - C) Change the total to $22$, because the four frequencies already sum to $22$.
   - D) Nothing can be done, because a frequency table must have exactly four categories.

**Advanced Level**

8. A class of $28$ students was surveyed about siblings. A table records $0$ siblings $9$, $1$ sibling $11$, $2$ siblings $6$, $3$ or more siblings $3$, and states a total of $28$. By how much do the recorded frequencies exceed the number of students surveyed?

<!-- figure: pr-1-2-e8 -->
![A frequency table of number of siblings. 0 siblings 9, 1 sibling 11, 2 siblings 6, 3 or more 3, and a stated Total of 28.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTY4IiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE2OCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGZyZXF1ZW5jeSB0YWJsZSBvZiBudW1iZXIgb2Ygc2libGluZ3MuIDAgc2libGluZ3MgOSwgMSBzaWJsaW5nIDExLCAyIHNpYmxpbmdzIDYsIDMgb3IgbW9yZSAzLCBhbmQgYSBzdGF0ZWQgVG90YWwgb2YgMjguIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE2OCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iMTU0LjcyIiBoZWlnaHQ9IjI0IiBmaWxsPSIjNkU5REM4IiBmaWxsLW9wYWNpdHk9IjAuMTgiLz48ZyBzdHJva2U9IiNFMkRDQ0EiIHN0cm9rZS13aWR0aD0iMSI+PGxpbmUgZGF0YS12bGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxMiIgeTI9IjE1NiIvPjxsaW5lIGRhdGEtdmxpbmU9IjEiIHgxPSI4NS41NiIgeTE9IjEyIiB4Mj0iODUuNTYiIHkyPSIxNTYiLz48bGluZSBkYXRhLXZsaW5lPSIyIiB4MT0iMTY2LjcyIiB5MT0iMTIiIHgyPSIxNjYuNzIiIHkyPSIxNTYiLz48bGluZSBkYXRhLWhsaW5lPSIwIiB4MT0iMTIiIHkxPSIxMiIgeDI9IjE2Ni43MiIgeTI9IjEyIi8+PGxpbmUgZGF0YS1obGluZT0iMSIgeDE9IjEyIiB5MT0iMzYiIHgyPSIxNjYuNzIiIHkyPSIzNiIvPjxsaW5lIGRhdGEtaGxpbmU9IjIiIHgxPSIxMiIgeTE9IjYwIiB4Mj0iMTY2LjcyIiB5Mj0iNjAiLz48bGluZSBkYXRhLWhsaW5lPSIzIiB4MT0iMTIiIHkxPSI4NCIgeDI9IjE2Ni43MiIgeTI9Ijg0Ii8+PGxpbmUgZGF0YS1obGluZT0iNCIgeDE9IjEyIiB5MT0iMTA4IiB4Mj0iMTY2LjcyIiB5Mj0iMTA4Ii8+PGxpbmUgZGF0YS1obGluZT0iNSIgeDE9IjEyIiB5MT0iMTMyIiB4Mj0iMTY2LjcyIiB5Mj0iMTMyIi8+PGxpbmUgZGF0YS1obGluZT0iNiIgeDE9IjEyIiB5MT0iMTU2IiB4Mj0iMTY2LjcyIiB5Mj0iMTU2Ii8+PC9nPjxnIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmaWxsPSIjMEUwRTExIj48dGV4dCBkYXRhLWhlYWQ9IjAiIHg9IjE3IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+U2libGluZ3M8L3RleHQ+PHRleHQgZGF0YS1oZWFkPSIxIiB4PSI5MC41NiIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPkZyZXF1ZW5jeTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMCIgeD0iMTciIHk9IjUyIiBmb250LXdlaWdodD0iNjAwIj4wPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0xIiB4PSI5MC41NiIgeT0iNTIiPjk8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTAiIHg9IjE3IiB5PSI3NiIgZm9udC13ZWlnaHQ9IjYwMCI+MTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjEtMSIgeD0iOTAuNTYiIHk9Ijc2Ij4xMTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMCIgeD0iMTciIHk9IjEwMCIgZm9udC13ZWlnaHQ9IjYwMCI+MjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iOTAuNTYiIHk9IjEwMCI+NjwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjMtMCIgeD0iMTciIHk9IjEyNCIgZm9udC13ZWlnaHQ9IjYwMCI+MyBvciBtb3JlPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMy0xIiB4PSI5MC41NiIgeT0iMTI0Ij4zPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iNC0wIiB4PSIxNyIgeT0iMTQ4IiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjQtMSIgeD0iOTAuNTYiIHk9IjE0OCI+Mjg8L3RleHQ+PC9nPjwvc3ZnPg==)
   - A) $1$
   - B) $0$
   - C) $29$
   - D) $2$

9. A grouped frequency table of $40$ commute times shows $0$ to $9$ minutes: $6$, $10$ to $19$ minutes: $14$, $20$ to $29$ minutes: $12$, and $30$ to $39$ minutes: $8$. The same data are rebuilt using the wider intervals $0$ to $19$ and $20$ to $39$. What frequencies should the new table show?

<!-- figure: pr-1-2-e9 -->
![A grouped frequency table of 40 commute times in minutes. 0 to 9: 6, 10 to 19: 14, 20 to 29: 12, 30 to 39: 8, Total 40.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMTY4IiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjE2OCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGdyb3VwZWQgZnJlcXVlbmN5IHRhYmxlIG9mIDQwIGNvbW11dGUgdGltZXMgaW4gbWludXRlcy4gMCB0byA5OiA2LCAxMCB0byAxOTogMTQsIDIwIHRvIDI5OiAxMiwgMzAgdG8gMzk6IDgsIFRvdGFsIDQwLiI+PHJlY3Qgd2lkdGg9IjM0MCIgaGVpZ2h0PSIxNjgiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjE0Ni40IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNkU5REM4IiBmaWxsLW9wYWNpdHk9IjAuMTgiLz48ZyBzdHJva2U9IiNFMkRDQ0EiIHN0cm9rZS13aWR0aD0iMSI+PGxpbmUgZGF0YS12bGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxMiIgeTI9IjE1NiIvPjxsaW5lIGRhdGEtdmxpbmU9IjEiIHgxPSI3Ny4yNCIgeTE9IjEyIiB4Mj0iNzcuMjQiIHkyPSIxNTYiLz48bGluZSBkYXRhLXZsaW5lPSIyIiB4MT0iMTU4LjQiIHkxPSIxMiIgeDI9IjE1OC40IiB5Mj0iMTU2Ii8+PGxpbmUgZGF0YS1obGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxNTguNCIgeTI9IjEyIi8+PGxpbmUgZGF0YS1obGluZT0iMSIgeDE9IjEyIiB5MT0iMzYiIHgyPSIxNTguNCIgeTI9IjM2Ii8+PGxpbmUgZGF0YS1obGluZT0iMiIgeDE9IjEyIiB5MT0iNjAiIHgyPSIxNTguNCIgeTI9IjYwIi8+PGxpbmUgZGF0YS1obGluZT0iMyIgeDE9IjEyIiB5MT0iODQiIHgyPSIxNTguNCIgeTI9Ijg0Ii8+PGxpbmUgZGF0YS1obGluZT0iNCIgeDE9IjEyIiB5MT0iMTA4IiB4Mj0iMTU4LjQiIHkyPSIxMDgiLz48bGluZSBkYXRhLWhsaW5lPSI1IiB4MT0iMTIiIHkxPSIxMzIiIHgyPSIxNTguNCIgeTI9IjEzMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjYiIHgxPSIxMiIgeTE9IjE1NiIgeDI9IjE1OC40IiB5Mj0iMTU2Ii8+PC9nPjxnIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmaWxsPSIjMEUwRTExIj48dGV4dCBkYXRhLWhlYWQ9IjAiIHg9IjE3IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+TWludXRlczwvdGV4dD48dGV4dCBkYXRhLWhlYWQ9IjEiIHg9IjgyLjI0IiB5PSIyOCIgZm9udC13ZWlnaHQ9IjcwMCI+RnJlcXVlbmN5PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0wIiB4PSIxNyIgeT0iNTIiIGZvbnQtd2VpZ2h0PSI2MDAiPjAgdG8gOTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjAtMSIgeD0iODIuMjQiIHk9IjUyIj42PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0wIiB4PSIxNyIgeT0iNzYiIGZvbnQtd2VpZ2h0PSI2MDAiPjEwIHRvIDE5PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0xIiB4PSI4Mi4yNCIgeT0iNzYiPjE0PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMi0wIiB4PSIxNyIgeT0iMTAwIiBmb250LXdlaWdodD0iNjAwIj4yMCB0byAyOTwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjItMSIgeD0iODIuMjQiIHk9IjEwMCI+MTI8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIzLTAiIHg9IjE3IiB5PSIxMjQiIGZvbnQtd2VpZ2h0PSI2MDAiPjMwIHRvIDM5PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMy0xIiB4PSI4Mi4yNCIgeT0iMTI0Ij44PC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iNC0wIiB4PSIxNyIgeT0iMTQ4IiBmb250LXdlaWdodD0iNjAwIj5Ub3RhbDwvdGV4dD48dGV4dCBkYXRhLWNlbGw9IjQtMSIgeD0iODIuMjQiIHk9IjE0OCI+NDA8L3RleHQ+PC9nPjwvc3ZnPg==)
   - A) $6$ and $12$
   - B) $14$ and $8$
   - C) $40$ and $40$
   - D) $20$ and $20$

10. A survey had $15$ respondents. A frequency table lists Tea $9$ and Coffee $5$. Checking the raw responses confirms that $9$ people chose Tea and $5$ chose Coffee, and that one respondent chose Water. What is the correct repair to the table?

<!-- figure: pr-1-2-e10 -->
![A frequency table listing only two drinks. Tea 9 and Coffee 5.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgOTYiIHdpZHRoPSIzNDAiIGhlaWdodD0iOTYiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0iQSBmcmVxdWVuY3kgdGFibGUgbGlzdGluZyBvbmx5IHR3byBkcmlua3MuIFRlYSA5IGFuZCBDb2ZmZWUgNS4iPjxyZWN0IHdpZHRoPSIzNDAiIGhlaWdodD0iOTYiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjEzNS4zNSIgaGVpZ2h0PSIyNCIgZmlsbD0iIzZFOURDOCIgZmlsbC1vcGFjaXR5PSIwLjE4Ii8+PGcgc3Ryb2tlPSIjRTJEQ0NBIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIGRhdGEtdmxpbmU9IjAiIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTIiIHkyPSI4NCIvPjxsaW5lIGRhdGEtdmxpbmU9IjEiIHgxPSI2Ni4xOSIgeTE9IjEyIiB4Mj0iNjYuMTkiIHkyPSI4NCIvPjxsaW5lIGRhdGEtdmxpbmU9IjIiIHgxPSIxNDcuMzUiIHkxPSIxMiIgeDI9IjE0Ny4zNSIgeTI9Ijg0Ii8+PGxpbmUgZGF0YS1obGluZT0iMCIgeDE9IjEyIiB5MT0iMTIiIHgyPSIxNDcuMzUiIHkyPSIxMiIvPjxsaW5lIGRhdGEtaGxpbmU9IjEiIHgxPSIxMiIgeTE9IjM2IiB4Mj0iMTQ3LjM1IiB5Mj0iMzYiLz48bGluZSBkYXRhLWhsaW5lPSIyIiB4MT0iMTIiIHkxPSI2MCIgeDI9IjE0Ny4zNSIgeTI9IjYwIi8+PGxpbmUgZGF0YS1obGluZT0iMyIgeDE9IjEyIiB5MT0iODQiIHgyPSIxNDcuMzUiIHkyPSI4NCIvPjwvZz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzBFMEUxMSI+PHRleHQgZGF0YS1oZWFkPSIwIiB4PSIxNyIgeT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiPkRyaW5rPC90ZXh0Pjx0ZXh0IGRhdGEtaGVhZD0iMSIgeD0iNzEuMTkiIHk9IjI4IiBmb250LXdlaWdodD0iNzAwIj5GcmVxdWVuY3k8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIwLTAiIHg9IjE3IiB5PSI1MiIgZm9udC13ZWlnaHQ9IjYwMCI+VGVhPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMC0xIiB4PSI3MS4xOSIgeT0iNTIiPjk8L3RleHQ+PHRleHQgZGF0YS1jZWxsPSIxLTAiIHg9IjE3IiB5PSI3NiIgZm9udC13ZWlnaHQ9IjYwMCI+Q29mZmVlPC90ZXh0Pjx0ZXh0IGRhdGEtY2VsbD0iMS0xIiB4PSI3MS4xOSIgeT0iNzYiPjU8L3RleHQ+PC9nPjwvc3ZnPg==)
    - A) Change the stated total from $15$ to $14$, to match the two rows shown.
    - B) Add a Water row with frequency $1$.
    - C) Make no change, because $14$ and $15$ are close enough.
    - D) Change Coffee from $5$ to $6$.
