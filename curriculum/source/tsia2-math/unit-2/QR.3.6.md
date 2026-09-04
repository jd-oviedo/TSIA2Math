---
topic_name: "Average rate of change"
unit_number: 2
sequence_in_unit: 4
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "QR"
keywords: ["average rate of change", "slope", "interval", "table", "rise over run", "non-linear", "per unit"]
---

# QR.3.6 - Average Rate of Change

**Topic ID:** QR.3.6  
**Unit:** 2  
**Strand:** QR (Quantitative Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Calculate an average rate of change from a table or two points as output change over input change.
- Identify the correct denominator as the change in input values themselves, not a count of rows or gaps.
- Recognize a relationship is not linear by testing each interval separately, while still finding the average over a named stretch.

---

#### **Part 1: Guided Notes**

##### The Same Division, Over a Chosen Stretch

Average rate of change is one formula:

$$\text{average rate of change} = \frac{\text{change in the output}}{\text{change in the input}}$$

You already used it in QR.3.2 to find a rate from two points. What is new is the word **average**, and it earns its place only when the rate is not constant.

If a relationship is linear, every stretch gives the same answer and "average" adds nothing. If it is not linear, the answer depends on **which stretch you pick**, and the question always tells you which.

**Read the interval before you touch the numbers.** More items in this topic are lost to computing the right thing over the wrong stretch than to arithmetic.

---

##### The Mistake That Costs the Most Points

You report the change in the output and stop.

A car's odometer reads 120 miles at 2 pm and 300 miles at 5 pm.

The change in distance is $300 - 120 = 180$ miles. That number is real, it took work to get, and it is not the answer. It is the rise. You still have to divide by the run.

$$\frac{300 - 120}{5 - 2} = \frac{180}{3} = 60 \text{ miles per hour}$$

This is the same "stopped one step early" failure from QR.2.2, and the same defence works: **name the units of your answer.** The question asks for a rate, so the answer must be miles **per hour**. 180 is miles. It cannot be the answer.

Its mirror is reporting the run, answering "3", which is hours. Same test kills it.

**Rise over run. Output on top, input underneath, always.** Flipping to $\frac{3}{180}$ gives hours per mile, a real quantity answering a different question.

---

##### Subtract in the Same Order

$$\frac{y_2 - y_1}{x_2 - x_1}$$

If the outputs go second-minus-first on top, the inputs must go second-minus-first underneath. Mixing the orders flips the sign and turns an increase into a decrease.

The sign is not decoration. A tank falling from 90 liters to 30 liters in 4 minutes has an average rate of

$$\frac{30 - 90}{4} = \frac{-60}{4} = -15 \text{ liters per minute}$$

Negative, because the quantity fell. Reporting $+15$ describes a tank filling.

---

##### Reading From a Table

This is where the topic lives on the test. Here is a function's values:

| $x$ | $0$ | $2$ | $5$ | $9$ |
|---|---|---|---|---|
| $f(x)$ | $5$ | $11$ | $26$ | $42$ |

**Example 1:** Find the average rate of change from $x = 2$ to $x = 9$.

Take only the two rows the question named. The values in between do not enter the calculation at all.

$$\frac{42 - 11}{9 - 2} = \frac{31}{7} \approx 4.43$$

The classic wrong answers come from using the wrong pair. From $0$ to $9$ gives $\frac{37}{9} \approx 4.11$. From $2$ to $5$ gives $5$. Both are correct arithmetic on the wrong interval.

**Circle the two rows the question names before you subtract anything.**

---

##### Do Not Count Rows

**Example 2:** A town's population, recorded every five years:

| Year | $1990$ | $1995$ | $2000$ | $2005$ |
|---|---|---|---|---|
| Population | $12{,}000$ | $15{,}000$ | $21{,}000$ | $24{,}000$ |

Average rate of change from 1990 to 2005, per year:

$$\frac{24{,}000 - 12{,}000}{2005 - 1990} = \frac{12{,}000}{15} = 800 \text{ people per year}$$

The denominator is **15 years**, not 3 gaps and not 4 rows. The table happens to list every fifth year, which is a fact about the table, not about time. Dividing by 3 gives 4,000 and dividing by 4 gives 3,000, and both describe a per-listing rate that nothing asked for.

**The denominator is the change in the input's own units.** Subtract the two input values. Never count entries.

---

##### When the Rate Is Not Constant

**Example 3:**

| $x$ | $0$ | $1$ | $2$ | $3$ |
|---|---|---|---|---|
| $y$ | $2$ | $6$ | $12$ | $20$ |

Check whether the rate is constant by taking each step separately: $6 - 2 = 4$, then $12 - 6 = 6$, then $20 - 12 = 8$. The steps grow, so this is **not** linear and there is no single rate.

The average rate of change from $x = 0$ to $x = 3$ still exists:

$$\frac{20 - 2}{3 - 0} = \frac{18}{3} = 6$$

Read that carefully. The relationship never changes at 6 per step, not once. The 6 is what a straight line from the first point to the last would have done. **An average rate of change describes the whole stretch, not any moment inside it.**

So do not assume a table is linear because it looks orderly. Test each interval separately when the question asks whether the rate is constant.

**Example 4:** A drone's altitude in meters:

| $t$ (seconds) | $0$ | $3$ | $7$ | $10$ |
|---|---|---|---|---|
| Altitude | $0$ | $120$ | $200$ | $80$ |

- $0$ to $3$: $\frac{120}{3} = 40$ m/s
- $3$ to $7$: $\frac{80}{4} = 20$ m/s
- $7$ to $10$: $\frac{80 - 200}{3} = -40$ m/s

Three intervals, three different answers, one of them negative. Which one is "the" rate depends entirely on the interval named.

---

##### The Four Traps

1. **Reporting the rise.** Divide by the run. Check that your answer's units have a "per" in them.
2. **Mixing subtraction orders.** Second minus first, on top and underneath.
3. **Counting rows instead of subtracting inputs.** Fifteen years is 15, not 3 gaps.
4. **Using the wrong interval.** Circle the two rows named before you compute.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. A relationship contains the points $(1, 4)$ and $(6, 24)$. What is the average rate of change?
   - A) $20$
   - B) $5$
   - C) $4$
   - D) $0.25$

2. A function has $f(2) = 7$ and $f(6) = 31$. What is the average rate of change from $x = 2$ to $x = 6$?
   - A) $24$
   - B) $6$
   - C) $4$
   - D) $-6$

3. A car's odometer reads $120$ miles at 2 pm and $300$ miles at 5 pm. What is the average rate of change?
   - A) $180$ miles per hour
   - B) $3$ miles per hour
   - C) $60$ miles per hour
   - D) $0.017$ miles per hour

4. A tank falls from $90$ liters to $30$ liters over $4$ minutes. What is the average rate of change?
   - A) $-15$ liters per minute
   - B) $15$ liters per minute
   - C) $-60$ liters per minute
   - D) $4$ liters per minute

**Proficient Level** (these require an extra step)

5. A function has the values $f(0) = 5$, $f(2) = 11$, $f(5) = 26$ and $f(9) = 42$. What is the average rate of change from $x = 2$ to $x = 9$?
   - A) $4.11$
   - B) $7$
   - C) $31$
   - D) $4.43$

6. A relationship contains the points $(0, 2)$, $(1, 6)$, $(2, 12)$ and $(3, 20)$. Is the rate of change constant, and what is the average rate of change from $x = 0$ to $x = 3$?
   - A) The rate is constant at $6$.
   - B) The rate is not constant; the average rate of change is $6$.
   - C) The rate is not constant; the average rate of change is $18$.
   - D) The rate is not constant; the average rate of change is $4$.

7. A town's population was $12{,}000$ in $1990$, $15{,}000$ in $1995$, $21{,}000$ in $2000$ and $24{,}000$ in $2005$. What is the average rate of change per year from $1990$ to $2005$?
   - A) $4{,}000$ people per year
   - B) $15$ people per year
   - C) $800$ people per year
   - D) $12{,}000$ people per year

**Advanced Level** (these need multiple steps or reverse thinking)

8. A drone's altitude in meters is $0$ at $t = 0$, $120$ at $t = 3$, $200$ at $t = 7$ and $80$ at $t = 10$ seconds. What is the average rate of change from $t = 7$ to $t = 10$?

<!-- figure: qr-3-6-drone -->
![A line graph with time in seconds along the bottom, running from 0 to 10, and altitude in meters up the side, running from 0 to 200 and marked every 20. Four points are plotted and joined in order: 0 meters at 0 seconds, 120 meters at 3 seconds, 200 meters at 7 seconds, and 80 meters at 10 seconds. The line climbs to its highest point at 7 seconds, then falls to 10 seconds.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMjUwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjI1MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGxpbmUgZ3JhcGggd2l0aCB0aW1lIGluIHNlY29uZHMgYWxvbmcgdGhlIGJvdHRvbSwgcnVubmluZyBmcm9tIDAgdG8gMTAsIGFuZCBhbHRpdHVkZSBpbiBtZXRlcnMgdXAgdGhlIHNpZGUsIHJ1bm5pbmcgZnJvbSAwIHRvIDIwMCBhbmQgbWFya2VkIGV2ZXJ5IDIwLiBGb3VyIHBvaW50cyBhcmUgcGxvdHRlZCBhbmQgam9pbmVkIGluIG9yZGVyOiAwIG1ldGVycyBhdCAwIHNlY29uZHMsIDEyMCBtZXRlcnMgYXQgMyBzZWNvbmRzLCAyMDAgbWV0ZXJzIGF0IDcgc2Vjb25kcywgYW5kIDgwIG1ldGVycyBhdCAxMCBzZWNvbmRzLiBUaGUgbGluZSBjbGltYnMgdG8gaXRzIGhpZ2hlc3QgcG9pbnQgYXQgNyBzZWNvbmRzLCB0aGVuIGZhbGxzIHRvIDEwIHNlY29uZHMuIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PGcgc3Ryb2tlPSIjRTJEQ0NBIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIHgxPSI1MCIgeTE9IjE2IiB4Mj0iNTAiIHkyPSIyMTIiLz48bGluZSB4MT0iNzcuMiIgeTE9IjE2IiB4Mj0iNzcuMiIgeTI9IjIxMiIvPjxsaW5lIHgxPSIxMDQuNCIgeTE9IjE2IiB4Mj0iMTA0LjQiIHkyPSIyMTIiLz48bGluZSB4MT0iMTMxLjYiIHkxPSIxNiIgeDI9IjEzMS42IiB5Mj0iMjEyIi8+PGxpbmUgeDE9IjE1OC44IiB5MT0iMTYiIHgyPSIxNTguOCIgeTI9IjIxMiIvPjxsaW5lIHgxPSIxODYiIHkxPSIxNiIgeDI9IjE4NiIgeTI9IjIxMiIvPjxsaW5lIHgxPSIyMTMuMiIgeTE9IjE2IiB4Mj0iMjEzLjIiIHkyPSIyMTIiLz48bGluZSB4MT0iMjQwLjQiIHkxPSIxNiIgeDI9IjI0MC40IiB5Mj0iMjEyIi8+PGxpbmUgeDE9IjI2Ny42IiB5MT0iMTYiIHgyPSIyNjcuNiIgeTI9IjIxMiIvPjxsaW5lIHgxPSIyOTQuOCIgeTE9IjE2IiB4Mj0iMjk0LjgiIHkyPSIyMTIiLz48bGluZSB4MT0iMzIyIiB5MT0iMTYiIHgyPSIzMjIiIHkyPSIyMTIiLz48bGluZSB4MT0iNTAiIHkxPSIyMTIiIHgyPSIzMjIiIHkyPSIyMTIiLz48bGluZSB4MT0iNTAiIHkxPSIxOTIuNCIgeDI9IjMyMiIgeTI9IjE5Mi40Ii8+PGxpbmUgeDE9IjUwIiB5MT0iMTcyLjgiIHgyPSIzMjIiIHkyPSIxNzIuOCIvPjxsaW5lIHgxPSI1MCIgeTE9IjE1My4yIiB4Mj0iMzIyIiB5Mj0iMTUzLjIiLz48bGluZSB4MT0iNTAiIHkxPSIxMzMuNiIgeDI9IjMyMiIgeTI9IjEzMy42Ii8+PGxpbmUgeDE9IjUwIiB5MT0iMTE0IiB4Mj0iMzIyIiB5Mj0iMTE0Ii8+PGxpbmUgeDE9IjUwIiB5MT0iOTQuNCIgeDI9IjMyMiIgeTI9Ijk0LjQiLz48bGluZSB4MT0iNTAiIHkxPSI3NC44IiB4Mj0iMzIyIiB5Mj0iNzQuOCIvPjxsaW5lIHgxPSI1MCIgeTE9IjU1LjIiIHgyPSIzMjIiIHkyPSI1NS4yIi8+PGxpbmUgeDE9IjUwIiB5MT0iMzUuNiIgeDI9IjMyMiIgeTI9IjM1LjYiLz48bGluZSB4MT0iNTAiIHkxPSIxNiIgeDI9IjMyMiIgeTI9IjE2Ii8+PC9nPjxsaW5lIHgxPSI1MCIgeTE9IjIxMiIgeDI9IjMyMiIgeTI9IjIxMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNiIvPjxsaW5lIHgxPSI1MCIgeTE9IjIxMiIgeDI9IjUwIiB5Mj0iMTYiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzBFMEUxMSI+PHRleHQgeD0iNzcuMiIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4xPC90ZXh0Pjx0ZXh0IHg9IjEwNC40IiB5PSIyMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjI8L3RleHQ+PHRleHQgeD0iMTMxLjYiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MzwvdGV4dD48dGV4dCB4PSIxNTguOCIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj40PC90ZXh0Pjx0ZXh0IHg9IjE4NiIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj41PC90ZXh0Pjx0ZXh0IHg9IjIxMy4yIiB5PSIyMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjY8L3RleHQ+PHRleHQgeD0iMjQwLjQiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NzwvdGV4dD48dGV4dCB4PSIyNjcuNiIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj44PC90ZXh0Pjx0ZXh0IHg9IjI5NC44IiB5PSIyMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjk8L3RleHQ+PHRleHQgeD0iMzIyIiB5PSIyMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjEwPC90ZXh0Pjx0ZXh0IHg9IjQ0IiB5PSIxOTUuOSIgdGV4dC1hbmNob3I9ImVuZCI+MjA8L3RleHQ+PHRleHQgeD0iNDQiIHk9IjE3Ni4zIiB0ZXh0LWFuY2hvcj0iZW5kIj40MDwvdGV4dD48dGV4dCB4PSI0NCIgeT0iMTU2LjciIHRleHQtYW5jaG9yPSJlbmQiPjYwPC90ZXh0Pjx0ZXh0IHg9IjQ0IiB5PSIxMzcuMSIgdGV4dC1hbmNob3I9ImVuZCI+ODA8L3RleHQ+PHRleHQgeD0iNDQiIHk9IjExNy41IiB0ZXh0LWFuY2hvcj0iZW5kIj4xMDA8L3RleHQ+PHRleHQgeD0iNDQiIHk9Ijk3LjkiIHRleHQtYW5jaG9yPSJlbmQiPjEyMDwvdGV4dD48dGV4dCB4PSI0NCIgeT0iNzguMyIgdGV4dC1hbmNob3I9ImVuZCI+MTQwPC90ZXh0Pjx0ZXh0IHg9IjQ0IiB5PSI1OC43IiB0ZXh0LWFuY2hvcj0iZW5kIj4xNjA8L3RleHQ+PHRleHQgeD0iNDQiIHk9IjM5LjEiIHRleHQtYW5jaG9yPSJlbmQiPjE4MDwvdGV4dD48dGV4dCB4PSI0NCIgeT0iMTkuNSIgdGV4dC1hbmNob3I9ImVuZCI+MjAwPC90ZXh0PjwvZz48cG9seWxpbmUgZGF0YS1zZXJpZXM9IjAiIHBvaW50cz0iNTAsMjEyIDEzMS42LDk0LjQgMjQwLjQsMTYgMzIyLDEzMy42IiBmaWxsPSJub25lIiBzdHJva2U9IiM2RTlEQzgiIHN0cm9rZS13aWR0aD0iMi42IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48Y2lyY2xlIGRhdGEtdmVydGV4PSIwLTAiIGN4PSI1MCIgY3k9IjIxMiIgcj0iMy41IiBmaWxsPSIjNkU5REM4IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMS41Ii8+PGNpcmNsZSBkYXRhLXZlcnRleD0iMC0xIiBjeD0iMTMxLjYiIGN5PSI5NC40IiByPSIzLjUiIGZpbGw9IiM2RTlEQzgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48Y2lyY2xlIGRhdGEtdmVydGV4PSIwLTIiIGN4PSIyNDAuNCIgY3k9IjE2IiByPSIzLjUiIGZpbGw9IiM2RTlEQzgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48Y2lyY2xlIGRhdGEtdmVydGV4PSIwLTMiIGN4PSIzMjIiIGN5PSIxMzMuNiIgcj0iMy41IiBmaWxsPSIjNkU5REM4IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMS41Ii8+PHRleHQgZGF0YS1yb2xlPSJpZGVudGlmaWVyIiB4PSIxODYiIHk9IjI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMwRTBFMTEiPlRpbWUgKHNlY29uZHMpPC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0iaWRlbnRpZmllciIgeD0iMTIiIHk9IjExNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgdHJhbnNmb3JtPSJyb3RhdGUoLTkwIDEyIDExNCkiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmaWxsPSIjMEUwRTExIj5BbHRpdHVkZSAobWV0ZXJzKTwvdGV4dD48L3N2Zz4=)
   - A) $-40$ meters per second
   - B) $40$ meters per second
   - C) $-120$ meters per second
   - D) $8$ meters per second

9. A drone's altitude in meters is $0$ at $t = 0$, $120$ at $t = 3$, $200$ at $t = 7$ and $80$ at $t = 10$ seconds. Over which interval is the average rate of change greatest?

<!-- figure: qr-3-6-drone -->
![A line graph with time in seconds along the bottom, running from 0 to 10, and altitude in meters up the side, running from 0 to 200 and marked every 20. Four points are plotted and joined in order: 0 meters at 0 seconds, 120 meters at 3 seconds, 200 meters at 7 seconds, and 80 meters at 10 seconds. The line climbs to its highest point at 7 seconds, then falls to 10 seconds.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMjUwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjI1MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGxpbmUgZ3JhcGggd2l0aCB0aW1lIGluIHNlY29uZHMgYWxvbmcgdGhlIGJvdHRvbSwgcnVubmluZyBmcm9tIDAgdG8gMTAsIGFuZCBhbHRpdHVkZSBpbiBtZXRlcnMgdXAgdGhlIHNpZGUsIHJ1bm5pbmcgZnJvbSAwIHRvIDIwMCBhbmQgbWFya2VkIGV2ZXJ5IDIwLiBGb3VyIHBvaW50cyBhcmUgcGxvdHRlZCBhbmQgam9pbmVkIGluIG9yZGVyOiAwIG1ldGVycyBhdCAwIHNlY29uZHMsIDEyMCBtZXRlcnMgYXQgMyBzZWNvbmRzLCAyMDAgbWV0ZXJzIGF0IDcgc2Vjb25kcywgYW5kIDgwIG1ldGVycyBhdCAxMCBzZWNvbmRzLiBUaGUgbGluZSBjbGltYnMgdG8gaXRzIGhpZ2hlc3QgcG9pbnQgYXQgNyBzZWNvbmRzLCB0aGVuIGZhbGxzIHRvIDEwIHNlY29uZHMuIj48cmVjdCB3aWR0aD0iMzQwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PGcgc3Ryb2tlPSIjRTJEQ0NBIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIHgxPSI1MCIgeTE9IjE2IiB4Mj0iNTAiIHkyPSIyMTIiLz48bGluZSB4MT0iNzcuMiIgeTE9IjE2IiB4Mj0iNzcuMiIgeTI9IjIxMiIvPjxsaW5lIHgxPSIxMDQuNCIgeTE9IjE2IiB4Mj0iMTA0LjQiIHkyPSIyMTIiLz48bGluZSB4MT0iMTMxLjYiIHkxPSIxNiIgeDI9IjEzMS42IiB5Mj0iMjEyIi8+PGxpbmUgeDE9IjE1OC44IiB5MT0iMTYiIHgyPSIxNTguOCIgeTI9IjIxMiIvPjxsaW5lIHgxPSIxODYiIHkxPSIxNiIgeDI9IjE4NiIgeTI9IjIxMiIvPjxsaW5lIHgxPSIyMTMuMiIgeTE9IjE2IiB4Mj0iMjEzLjIiIHkyPSIyMTIiLz48bGluZSB4MT0iMjQwLjQiIHkxPSIxNiIgeDI9IjI0MC40IiB5Mj0iMjEyIi8+PGxpbmUgeDE9IjI2Ny42IiB5MT0iMTYiIHgyPSIyNjcuNiIgeTI9IjIxMiIvPjxsaW5lIHgxPSIyOTQuOCIgeTE9IjE2IiB4Mj0iMjk0LjgiIHkyPSIyMTIiLz48bGluZSB4MT0iMzIyIiB5MT0iMTYiIHgyPSIzMjIiIHkyPSIyMTIiLz48bGluZSB4MT0iNTAiIHkxPSIyMTIiIHgyPSIzMjIiIHkyPSIyMTIiLz48bGluZSB4MT0iNTAiIHkxPSIxOTIuNCIgeDI9IjMyMiIgeTI9IjE5Mi40Ii8+PGxpbmUgeDE9IjUwIiB5MT0iMTcyLjgiIHgyPSIzMjIiIHkyPSIxNzIuOCIvPjxsaW5lIHgxPSI1MCIgeTE9IjE1My4yIiB4Mj0iMzIyIiB5Mj0iMTUzLjIiLz48bGluZSB4MT0iNTAiIHkxPSIxMzMuNiIgeDI9IjMyMiIgeTI9IjEzMy42Ii8+PGxpbmUgeDE9IjUwIiB5MT0iMTE0IiB4Mj0iMzIyIiB5Mj0iMTE0Ii8+PGxpbmUgeDE9IjUwIiB5MT0iOTQuNCIgeDI9IjMyMiIgeTI9Ijk0LjQiLz48bGluZSB4MT0iNTAiIHkxPSI3NC44IiB4Mj0iMzIyIiB5Mj0iNzQuOCIvPjxsaW5lIHgxPSI1MCIgeTE9IjU1LjIiIHgyPSIzMjIiIHkyPSI1NS4yIi8+PGxpbmUgeDE9IjUwIiB5MT0iMzUuNiIgeDI9IjMyMiIgeTI9IjM1LjYiLz48bGluZSB4MT0iNTAiIHkxPSIxNiIgeDI9IjMyMiIgeTI9IjE2Ii8+PC9nPjxsaW5lIHgxPSI1MCIgeTE9IjIxMiIgeDI9IjMyMiIgeTI9IjIxMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNiIvPjxsaW5lIHgxPSI1MCIgeTE9IjIxMiIgeDI9IjUwIiB5Mj0iMTYiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzBFMEUxMSI+PHRleHQgeD0iNzcuMiIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4xPC90ZXh0Pjx0ZXh0IHg9IjEwNC40IiB5PSIyMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjI8L3RleHQ+PHRleHQgeD0iMTMxLjYiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MzwvdGV4dD48dGV4dCB4PSIxNTguOCIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj40PC90ZXh0Pjx0ZXh0IHg9IjE4NiIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj41PC90ZXh0Pjx0ZXh0IHg9IjIxMy4yIiB5PSIyMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjY8L3RleHQ+PHRleHQgeD0iMjQwLjQiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NzwvdGV4dD48dGV4dCB4PSIyNjcuNiIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj44PC90ZXh0Pjx0ZXh0IHg9IjI5NC44IiB5PSIyMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjk8L3RleHQ+PHRleHQgeD0iMzIyIiB5PSIyMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjEwPC90ZXh0Pjx0ZXh0IHg9IjQ0IiB5PSIxOTUuOSIgdGV4dC1hbmNob3I9ImVuZCI+MjA8L3RleHQ+PHRleHQgeD0iNDQiIHk9IjE3Ni4zIiB0ZXh0LWFuY2hvcj0iZW5kIj40MDwvdGV4dD48dGV4dCB4PSI0NCIgeT0iMTU2LjciIHRleHQtYW5jaG9yPSJlbmQiPjYwPC90ZXh0Pjx0ZXh0IHg9IjQ0IiB5PSIxMzcuMSIgdGV4dC1hbmNob3I9ImVuZCI+ODA8L3RleHQ+PHRleHQgeD0iNDQiIHk9IjExNy41IiB0ZXh0LWFuY2hvcj0iZW5kIj4xMDA8L3RleHQ+PHRleHQgeD0iNDQiIHk9Ijk3LjkiIHRleHQtYW5jaG9yPSJlbmQiPjEyMDwvdGV4dD48dGV4dCB4PSI0NCIgeT0iNzguMyIgdGV4dC1hbmNob3I9ImVuZCI+MTQwPC90ZXh0Pjx0ZXh0IHg9IjQ0IiB5PSI1OC43IiB0ZXh0LWFuY2hvcj0iZW5kIj4xNjA8L3RleHQ+PHRleHQgeD0iNDQiIHk9IjM5LjEiIHRleHQtYW5jaG9yPSJlbmQiPjE4MDwvdGV4dD48dGV4dCB4PSI0NCIgeT0iMTkuNSIgdGV4dC1hbmNob3I9ImVuZCI+MjAwPC90ZXh0PjwvZz48cG9seWxpbmUgZGF0YS1zZXJpZXM9IjAiIHBvaW50cz0iNTAsMjEyIDEzMS42LDk0LjQgMjQwLjQsMTYgMzIyLDEzMy42IiBmaWxsPSJub25lIiBzdHJva2U9IiM2RTlEQzgiIHN0cm9rZS13aWR0aD0iMi42IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48Y2lyY2xlIGRhdGEtdmVydGV4PSIwLTAiIGN4PSI1MCIgY3k9IjIxMiIgcj0iMy41IiBmaWxsPSIjNkU5REM4IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMS41Ii8+PGNpcmNsZSBkYXRhLXZlcnRleD0iMC0xIiBjeD0iMTMxLjYiIGN5PSI5NC40IiByPSIzLjUiIGZpbGw9IiM2RTlEQzgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48Y2lyY2xlIGRhdGEtdmVydGV4PSIwLTIiIGN4PSIyNDAuNCIgY3k9IjE2IiByPSIzLjUiIGZpbGw9IiM2RTlEQzgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48Y2lyY2xlIGRhdGEtdmVydGV4PSIwLTMiIGN4PSIzMjIiIGN5PSIxMzMuNiIgcj0iMy41IiBmaWxsPSIjNkU5REM4IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMS41Ii8+PHRleHQgZGF0YS1yb2xlPSJpZGVudGlmaWVyIiB4PSIxODYiIHk9IjI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMwRTBFMTEiPlRpbWUgKHNlY29uZHMpPC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0iaWRlbnRpZmllciIgeD0iMTIiIHk9IjExNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgdHJhbnNmb3JtPSJyb3RhdGUoLTkwIDEyIDExNCkiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmaWxsPSIjMEUwRTExIj5BbHRpdHVkZSAobWV0ZXJzKTwvdGV4dD48L3N2Zz4=)
   - A) From $t = 3$ to $t = 7$, at $80$ meters per second
   - B) From $t = 7$ to $t = 10$, at $40$ meters per second
   - C) From $t = 0$ to $t = 10$, at $8$ meters per second
   - D) From $t = 0$ to $t = 3$, at $40$ meters per second

10. A quantity has an average rate of change of $-6$ per hour over a $5$-hour stretch and ends at $12$. What was it at the start of the stretch?
    - A) $-18$
    - B) $42$
    - C) $30$
    - D) $18$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

A relationship contains the points $(2, 5)$ and $(8, 29)$. What is the average rate of change?

- A) $24$
- B) $6$
- C) $4$
- D) $0.25$

**Item 2**

A pool falls from $200$ liters to $80$ liters over $6$ minutes. What is the average rate of change?

- A) $-20$ liters per minute
- B) $20$ liters per minute
- C) $-120$ liters per minute
- D) $6$ liters per minute

**Proficient Level**

**Item 3**

A function has $f(1) = 3$, $f(4) = 15$ and $f(9) = 25$. What is the average rate of change from $x = 4$ to $x = 9$?

- A) $10$
- B) $2$
- C) $2.75$
- D) $5$

**Item 4**

A city's population was $400$ in $1980$, $700$ in $1990$ and $1{,}500$ in $2000$. What is the average rate of change per year from $1980$ to $2000$?

- A) $550$ people per year
- B) $1{,}100$ people per year
- C) $20$ people per year
- D) $55$ people per year

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. A relationship contains the points $(1, 4)$ and $(6, 24)$. What is the average rate of change?**

Step 1: Change in the output.
- $24 - 4 = 20$

Step 2: Change in the input.
- $6 - 1 = 5$

Step 3: Divide.
- $\frac{20}{5} = 4$

**Answer: C** ($4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: rise_reported_as_rate (reports the change in the output, 20, without dividing by the change in the input)",
  "B": "Student makes misconception: run_reported_as_rate (reports the change in the input, 5, as though it were the rate)",
  "C": "Correct: divides the rise of 20 by the run of 5 to get a rate of 4",
  "D": "Student makes misconception: slope_run_over_rise (divides the run of 5 by the rise of 20, producing 0.25, the reciprocal of the rate)"
},
"misconception_tag": {
  "A": "rise_reported_as_rate",
  "B": "run_reported_as_rate",
  "D": "slope_run_over_rise"
}
```

---

**2. A function has $f(2) = 7$ and $f(6) = 31$. What is the average rate of change from $x = 2$ to $x = 6$?**

Step 1: Rise.
- $31 - 7 = 24$

Step 2: Run.
- $6 - 2 = 4$

Step 3: Divide.
- $\frac{24}{4} = 6$

**Answer: B** ($6$)

```json
"distractor_logic": {
  "A": "Student makes misconception: rise_reported_as_rate (reports the change in the output, 24, without dividing by the run of 4)",
  "B": "Correct: divides the rise of 24 by the run of 4 to get a rate of 6",
  "C": "Student makes misconception: run_reported_as_rate (reports the change in the input, 4, as though it were the rate)",
  "D": "Student makes misconception: subtracts_in_wrong_order (computes 7 minus 31 on top while keeping 6 minus 2 underneath, producing -6 for an increasing function)"
},
"misconception_tag": {
  "A": "rise_reported_as_rate",
  "C": "run_reported_as_rate",
  "D": "subtracts_in_wrong_order"
}
```

---

**3. A car's odometer reads $120$ miles at 2 pm and $300$ miles at 5 pm. What is the average rate of change?**

Step 1: Rise, in miles.
- $300 - 120 = 180$

Step 2: Run, in hours.
- $5 - 2 = 3$

Step 3: Divide, and check the units. Miles divided by hours is miles per hour.
- $\frac{180}{3} = 60$

**Answer: C** ($60$ miles per hour)

```json
"distractor_logic": {
  "A": "Student makes misconception: rise_reported_as_rate (reports the 180 mile change without dividing by the 3 hours; 180 is a distance, not a speed)",
  "B": "Student makes misconception: run_reported_as_rate (reports the 3 hour change as though it were the speed)",
  "C": "Correct: divides the 180 mile rise by the 3 hour run for 60 miles per hour",
  "D": "Student makes misconception: slope_run_over_rise (divides 3 hours by 180 miles, producing about 0.017 hours per mile rather than miles per hour)"
},
"misconception_tag": {
  "A": "rise_reported_as_rate",
  "B": "run_reported_as_rate",
  "D": "slope_run_over_rise"
}
```

---

**4. A tank falls from $90$ liters to $30$ liters over $4$ minutes. What is the average rate of change?**

Step 1: Rise, taking second minus first.
- $30 - 90 = -60$

Step 2: Run.
- $4$ minutes

Step 3: Divide, keeping the sign.
- $\frac{-60}{4} = -15$

Step 4: Check the sign against the situation. The tank is emptying, so the rate must be negative.

**Answer: A** ($-15$ liters per minute)

```json
"distractor_logic": {
  "A": "Correct: divides the -60 liter change by the 4 minutes for -15 liters per minute, negative because the tank is emptying",
  "B": "Student makes misconception: misreads_direction_of_change (computes the magnitude of 15 correctly but reports it as positive, describing a tank that is filling)",
  "C": "Student makes misconception: rise_reported_as_rate (reports the -60 liter change without dividing by the 4 minutes)",
  "D": "Student makes misconception: run_reported_as_rate (reports the 4 minute run as though it were the rate)"
},
"misconception_tag": {
  "B": "misreads_direction_of_change",
  "C": "rise_reported_as_rate",
  "D": "run_reported_as_rate"
}
```

---

**Proficient Level**

**5. A function has the values $f(0) = 5$, $f(2) = 11$, $f(5) = 26$ and $f(9) = 42$. What is the average rate of change from $x = 2$ to $x = 9$?**

Step 1: Use only the two values the question names, $f(2) = 11$ and $f(9) = 42$. The values at $0$ and $5$ do not enter.

Step 2: Rise and run.
- $42 - 11 = 31$ and $9 - 2 = 7$

Step 3: Divide.
- $\frac{31}{7} \approx 4.43$

**Answer: D** ($4.43$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_interval_selected (computes from x equal to 0 to x equal to 9 instead of from 2 to 9, giving 37 over 9, or about 4.11)",
  "B": "Student makes misconception: run_reported_as_rate (reports the run of 7 as though it were the rate)",
  "C": "Student makes misconception: rise_reported_as_rate (reports the rise of 31 without dividing by the run of 7)",
  "D": "Correct: uses only f(2) and f(9), dividing the rise of 31 by the run of 7 for about 4.43"
},
"misconception_tag": {
  "A": "wrong_interval_selected",
  "B": "run_reported_as_rate",
  "C": "rise_reported_as_rate"
}
```

---

**6. A relationship contains the points $(0, 2)$, $(1, 6)$, $(2, 12)$ and $(3, 20)$. Is the rate of change constant, and what is the average rate of change from $x = 0$ to $x = 3$?**

Step 1: Test each interval separately rather than assuming.
- $6 - 2 = 4$, then $12 - 6 = 6$, then $20 - 12 = 8$

Step 2: The steps grow, so the rate is not constant and the relationship is not linear.

Step 3: The average rate of change over the whole stretch still exists.
- $\frac{20 - 2}{3 - 0} = \frac{18}{3} = 6$

Step 4: Note that the relationship never actually changes at 6 in any single step. The 6 describes the whole stretch, not any moment in it.

**Answer: B** (Not constant; the average rate of change is $6$)

```json
"distractor_logic": {
  "A": "Student makes misconception: constant_rate_assumed (treats the table as linear without testing each interval, so the successive steps of 4, 6 and 8 are never checked)",
  "B": "Correct: finds the steps 4, 6 and 8 are unequal so the rate is not constant, then divides the total rise of 18 by the run of 3 for an average of 6",
  "C": "Student makes misconception: rise_reported_as_rate (reports the total rise of 18 without dividing by the run of 3)",
  "D": "Student makes misconception: wrong_interval_selected (computes over the first interval only, from x equal to 0 to x equal to 1, giving 4 rather than the average over the whole stretch)"
},
"misconception_tag": {
  "A": "constant_rate_assumed",
  "C": "rise_reported_as_rate",
  "D": "wrong_interval_selected"
}
```

---

**7. A town's population was $12{,}000$ in $1990$, $15{,}000$ in $1995$, $21{,}000$ in $2000$ and $24{,}000$ in $2005$. What is the average rate of change per year from $1990$ to $2005$?**

Step 1: Rise, in people.
- $24{,}000 - 12{,}000 = 12{,}000$

Step 2: Run, in the input's own units. The input is years, so subtract the years.
- $2005 - 1990 = 15$

Step 3: Divide.
- $\frac{12{,}000}{15} = 800$ people per year

Step 4: Check the units. The question asked per year, and the denominator was years.

**Answer: C** ($800$ people per year)

```json
"distractor_logic": {
  "A": "Student makes misconception: row_gaps_counted_as_change (divides by the 3 gaps between listed entries instead of the 15 years, producing 4,000 per listing rather than per year)",
  "B": "Student makes misconception: run_reported_as_rate (reports the 15 year run as though it were the rate)",
  "C": "Correct: divides the 12,000 person rise by the 15 year run for 800 people per year",
  "D": "Student makes misconception: rise_reported_as_rate (reports the 12,000 person change without dividing by the 15 years)"
},
"misconception_tag": {
  "A": "row_gaps_counted_as_change",
  "B": "run_reported_as_rate",
  "D": "rise_reported_as_rate"
}
```

---

**Advanced Level**

**8. A drone's altitude in meters is $0$ at $t = 0$, $120$ at $t = 3$, $200$ at $t = 7$ and $80$ at $t = 10$ seconds. What is the average rate of change from $t = 7$ to $t = 10$?**

Step 1: Use only the two named values, $200$ at $t = 7$ and $80$ at $t = 10$.

Step 2: Rise and run, second minus first in both.
- $80 - 200 = -120$ and $10 - 7 = 3$

Step 3: Divide.
- $\frac{-120}{3} = -40$

Step 4: Check the sign. The drone is descending over this stretch, so a negative rate is required.

**Answer: A** ($-40$ meters per second)

```json
"distractor_logic": {
  "A": "Correct: divides the -120 meter change by the 3 seconds for -40 meters per second, negative because the drone is descending",
  "B": "Student makes misconception: misreads_direction_of_change (computes the magnitude of 40 correctly but reports it as positive, describing a climb over a stretch where the drone fell)",
  "C": "Student makes misconception: rise_reported_as_rate (reports the -120 meter change without dividing by the 3 seconds)",
  "D": "Student makes misconception: wrong_interval_selected (computes over the whole flight from t equal to 0 to t equal to 10, giving 80 over 10, or 8)"
},
"misconception_tag": {
  "B": "misreads_direction_of_change",
  "C": "rise_reported_as_rate",
  "D": "wrong_interval_selected"
}
```

---

**9. A drone's altitude in meters is $0$ at $t = 0$, $120$ at $t = 3$, $200$ at $t = 7$ and $80$ at $t = 10$ seconds. Over which interval is the average rate of change greatest?**

Step 1: Compute all three intervals separately.
- $0$ to $3$: $\frac{120 - 0}{3} = 40$
- $3$ to $7$: $\frac{200 - 120}{4} = 20$
- $7$ to $10$: $\frac{80 - 200}{3} = -40$

Step 2: Compare. The greatest is $40$, over $t = 0$ to $t = 3$.

Step 3: Note that the last interval has the same magnitude but the opposite sign, so it is the smallest, not tied for greatest.

**Answer: D** (From $t = 0$ to $t = 3$, at $40$ meters per second)

```json
"distractor_logic": {
  "A": "Student makes misconception: rise_reported_as_rate (reports the 80 meter rise over the middle interval without dividing by its 4 seconds; the rate there is 20)",
  "B": "Student makes misconception: misreads_direction_of_change (treats the final interval's -40 as though it were +40, making a descent look tied with the fastest climb)",
  "C": "Student makes misconception: wrong_interval_selected (computes over the whole flight rather than comparing the three intervals the data marks out)",
  "D": "Correct: computes 40, 20 and -40 over the three intervals, and the greatest is 40 from t equal to 0 to t equal to 3"
},
"misconception_tag": {
  "A": "rise_reported_as_rate",
  "B": "misreads_direction_of_change",
  "C": "wrong_interval_selected"
}
```

---

**10. A quantity has an average rate of change of $-6$ per hour over a $5$-hour stretch and ends at $12$. What was it at the start of the stretch?**

Step 1: Find the total change over the stretch.
- $-6 \times 5 = -30$

Step 2: The quantity fell by 30 to reach 12, so it started 30 higher.
- $12 + 30 = 42$

Step 3: Check forward. Starting at 42 and falling 6 per hour for 5 hours gives $42 - 30 = 12$. Correct.

**Answer: B** ($42$)

```json
"distractor_logic": {
  "A": "Student makes misconception: misreads_direction_of_change (subtracts the 30 from the ending value instead of adding it, producing -18, which would mean the quantity rose over a stretch with a negative rate)",
  "B": "Correct: multiplies the rate by the 5 hours for a change of -30, then adds 30 back to the ending 12 to recover a start of 42",
  "C": "Student makes misconception: rise_reported_as_rate (reports the total change of 30 rather than the starting value it implies)",
  "D": "Student makes misconception: wrong_interval_selected (applies the rate for a single hour rather than across the whole 5-hour stretch, producing 18)"
},
"misconception_tag": {
  "A": "misreads_direction_of_change",
  "C": "rise_reported_as_rate",
  "D": "wrong_interval_selected"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: A relationship contains the points $(2, 5)$ and $(8, 29)$. What is the average rate of change?**

Step 1: Rise and run.
- $29 - 5 = 24$ and $8 - 2 = 6$

Step 2: Divide.
- $\frac{24}{6} = 4$

**Answer: C** ($4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: rise_reported_as_rate (reports the rise of 24 without dividing by the run of 6)",
  "B": "Student makes misconception: run_reported_as_rate (reports the run of 6 as though it were the rate)",
  "C": "Correct: divides the rise of 24 by the run of 6 to get a rate of 4",
  "D": "Student makes misconception: slope_run_over_rise (divides the run of 6 by the rise of 24, producing 0.25, the reciprocal of the rate)"
},
"misconception_tag": {
  "A": "rise_reported_as_rate",
  "B": "run_reported_as_rate",
  "D": "slope_run_over_rise"
}
```

---

**Item 2: A pool falls from $200$ liters to $80$ liters over $6$ minutes. What is the average rate of change?**

Step 1: Rise, second minus first.
- $80 - 200 = -120$

Step 2: Divide by the run.
- $\frac{-120}{6} = -20$

Step 3: The pool is emptying, so the negative sign is required.

**Answer: A** ($-20$ liters per minute)

```json
"distractor_logic": {
  "A": "Correct: divides the -120 liter change by the 6 minutes for -20 liters per minute",
  "B": "Student makes misconception: misreads_direction_of_change (computes the magnitude of 20 but reports it as positive, describing a pool that is filling)",
  "C": "Student makes misconception: rise_reported_as_rate (reports the -120 liter change without dividing by the 6 minutes)",
  "D": "Student makes misconception: run_reported_as_rate (reports the 6 minute run as though it were the rate)"
},
"misconception_tag": {
  "B": "misreads_direction_of_change",
  "C": "rise_reported_as_rate",
  "D": "run_reported_as_rate"
}
```

---

**Item 3: A function has $f(1) = 3$, $f(4) = 15$ and $f(9) = 25$. What is the average rate of change from $x = 4$ to $x = 9$?**

Step 1: Use only $f(4) = 15$ and $f(9) = 25$.

Step 2: Rise and run.
- $25 - 15 = 10$ and $9 - 4 = 5$

Step 3: Divide.
- $\frac{10}{5} = 2$

**Answer: B** ($2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: rise_reported_as_rate (reports the rise of 10 without dividing by the run of 5)",
  "B": "Correct: uses only f(4) and f(9), dividing the rise of 10 by the run of 5 for a rate of 2",
  "C": "Student makes misconception: wrong_interval_selected (computes from x equal to 1 to x equal to 9 instead of from 4 to 9, giving 22 over 8, or 2.75)",
  "D": "Student makes misconception: run_reported_as_rate (reports the run of 5 as though it were the rate)"
},
"misconception_tag": {
  "A": "rise_reported_as_rate",
  "C": "wrong_interval_selected",
  "D": "run_reported_as_rate"
}
```

---

**Item 4: A city's population was $400$ in $1980$, $700$ in $1990$ and $1{,}500$ in $2000$. What is the average rate of change per year from $1980$ to $2000$?**

Step 1: Rise, in people.
- $1{,}500 - 400 = 1{,}100$

Step 2: Run, in years.
- $2000 - 1980 = 20$

Step 3: Divide.
- $\frac{1{,}100}{20} = 55$ people per year

**Answer: D** ($55$ people per year)

```json
"distractor_logic": {
  "A": "Student makes misconception: row_gaps_counted_as_change (divides by the 2 gaps between listed entries instead of the 20 years, producing 550 per listing rather than per year)",
  "B": "Student makes misconception: rise_reported_as_rate (reports the 1,100 person change without dividing by the 20 years)",
  "C": "Student makes misconception: run_reported_as_rate (reports the 20 year run as though it were the rate)",
  "D": "Correct: divides the 1,100 person rise by the 20 year run for 55 people per year"
},
"misconception_tag": {
  "A": "row_gaps_counted_as_change",
  "B": "rise_reported_as_rate",
  "C": "run_reported_as_rate"
}
```
