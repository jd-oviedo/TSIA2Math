---
topic_name: "Sorting and counting data"
unit_number: 0
sequence_in_unit: 9
assessment_layer: "DIAGNOSTIC"
estimated_time_minutes: 40
difficulty_band: "Basic"
related_strand: "PR"
keywords: ["sorting", "counting", "frequency", "data set", "ascending order", "threshold", "tally"]
---

# PR.1.1 - Sorting and Counting Data

**Topic ID:** PR.1.1  
**Unit:** 0  
**Strand:** PR (Probabilistic and Statistical Reasoning)  
**Assessment Layer:** DIAGNOSTIC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### The Easiest Points on the Test, Lost Anyway

There is no formula in this topic. Nothing to memorize, nothing to rearrange, no rule you could forget. You are handed a list of numbers and asked how many of them do something.

And students still lose these points, for one reason: they count in their heads while reading fast. That is it. That is the entire failure mode.

So the skill being built here is not arithmetic. It is a **counting procedure** disciplined enough that speed cannot break it.

---

##### Count by Marking, Not by Remembering

Here are seven quiz scores:

$$84, \; 71, \; 90, \; 65, \; 78, \; 90, \; 71$$

How many students scored exactly $71$?

The wrong method is to scan the list and hold a tally in your head. Your eye jumps, you lose your place, and you answer $1$ or $3$ when the answer is $2$.

The right method: **walk the list left to right, one entry at a time, and mark each hit.**

- $84$: no
- $71$: **yes** (that is $1$)
- $90$: no
- $65$: no
- $78$: no
- $90$: no
- $71$: **yes** (that is $2$)

Answer: $2$.

That felt slow. It took nine seconds. An off-by-one error costs the entire question, so nine seconds is cheap. **Touch every entry exactly once and say the running count out loud in your head as you go.**

---

##### Counting Categories

The same procedure handles words instead of numbers.

Eight students named a favorite subject: Math, Science, Math, English, Math, Science, English, Math.

How many chose Math?

Walk it: Math ($1$), Science, Math ($2$), English, Math ($3$), Science, English, Math ($4$).

Answer: $4$.

Notice the temptation to answer $3$. Math appears early and often, and the eye stops registering it. The last entry is easy to miss precisely because you already feel finished. **The final entry deserves the same attention as the first.**

---

##### The Mistake That Costs the Most Points

Read this section twice.

**"How many entries" and "how many different values" are different questions.**

Take these nine test scores:

$$55, \; 72, \; 88, \; 55, \; 66, \; 72, \; 91, \; 55, \; 80$$

Two questions that sound almost identical:

**Question A:** How many scores are $55$? Walk it. $55$ appears at positions $1$, $4$, and $8$. The answer is $3$. You counted **entries**.

**Question B:** How many distinct values appear more than once? Now you are counting **values**, not entries. Which values repeat? $55$ repeats, and $72$ repeats. That is $2$ values. The answer is $2$, even though those two values account for five entries between them.

A student who answers $5$ to Question B counted the entries. A student who answers $3$ counted how many times the most common value showed up. Both misread which of the two questions was being asked.

**The tell is the word "distinct" or "different."** When you see it, you are counting how many *kinds* of thing, not how many *things*. Circle that word when it appears.

---

##### Threshold Words Decide the Boundary

When a question sets a cutoff, the exact wording tells you whether the cutoff itself counts.

| Wording | Does the boundary value count? |
|---|---|
| less than $74$ | No. $74$ is out. |
| $74$ or less, at most $74$ | Yes. $74$ is in. |
| greater than $74$ | No. $74$ is out. |
| $74$ or more, at least $74$ | Yes. $74$ is in. |

**Example 1:** These are eight daily high temperatures in degrees Fahrenheit:

$$73, \; 68, \; 75, \; 68, \; 80, \; 73, \; 68, \; 75$$

How many days were **below** $74$ degrees?

Step 1: Read the boundary word. "Below" means strictly less than, so $74$ itself would not count. No entry is $74$ anyway, but check every time.

Step 2: Walk the list and mark each hit.
- $73$: yes ($1$)
- $68$: yes ($2$)
- $75$: no
- $68$: yes ($3$)
- $80$: no
- $73$: yes ($4$)
- $68$: yes ($5$)
- $75$: no

Step 3: Answer: $5$ days.

Step 4: Check by counting the misses. Three entries failed ($75$, $80$, $75$), and $5 + 3 = 8$, the size of the list. The two counts have to add to the total, and this is the cheapest error check in the topic. **Use it every time.**

---

##### Two Conditions at Once

**Example 2:** Ten students reported how many siblings they have:

$$0, \; 2, \; 1, \; 3, \; 2, \; 0, \; 1, \; 2, \; 3, \; 1$$

How many reported **$2$ or more** siblings?

Step 1: Read the boundary. "$2$ or more" includes $2$ itself.

Step 2: Walk and mark.
- $0$: no
- $2$: yes ($1$)
- $1$: no
- $3$: yes ($2$)
- $2$: yes ($3$)
- $0$: no
- $1$: no
- $2$: yes ($4$)
- $3$: yes ($5$)
- $1$: no

Step 3: Answer: $5$ students.

Step 4: Check with the complement. The entries below $2$ are $0, 1, 0, 1, 1$, which is $5$. And $5 + 5 = 10$. Correct.

A note on the zeros. A student reporting $0$ siblings gave a real answer, and that entry counts as one of the ten students. **Zero is data.** Do not skip an entry because its value is nothing.

---

##### Sorting, and Finding Where Sorting Failed

**Ascending** means smallest to largest. **Descending** means largest to smallest.

A question may hand you a list that is *almost* sorted and ask where the error is.

**Example 3:** A student claims this list is in ascending order:

$$14, \; 18, \; 22, \; 19, \; 27, \; 31$$

Where is the error?

Step 1: Compare each **neighbouring pair**, left to right. That is the whole method: a list is ascending exactly when every entry is smaller than the one after it.

- $14 < 18$: fine
- $18 < 22$: fine
- $22 < 19$: **fails**
- $19 < 27$: fine
- $27 < 31$: fine

Step 2: The single failure is between $22$ and $19$. So $19$ should come before $22$.

The trap is answering with a pair that is perfectly fine. $27$ and $31$ are in order. $14$ and $18$ are in order. Only one pair breaks, and pairwise comparison finds it without any guessing.

---

##### Counting After the Data Change

Some questions add values to a set and ask what happens to a count.

**Example 4:** A sorted set of $12$ values has exactly $5$ values below $40$. Three new values are added, all of them greater than $40$. How many values are now below $40$?

The answer is $5$.

Nothing was added below $40$, so nothing changed below $40$. The set is bigger, the total is now $15$, and the count below $40$ is untouched.

This looks like a trick and it is not. The instinct is to do arithmetic because numbers were given, so students compute $5 + 3 = 8$. But the three new values all sit **above** the threshold. They cannot affect a count of what is below it.

**Ask what changed on the side of the boundary you are counting.** If nothing did, the count does not move.

**Example 5:** Now a case where it does move. This sorted set has eight values:

$$10, \; 12, \; 15, \; 15, \; 20, \; 22, \; 25, \; 30$$

A value of $14$ is added. After inserting it in sorted position, how many values are **less than** $15$?

Step 1: Insert $14$ where it belongs, between $12$ and $15$.
- $10, 12, 14, 15, 15, 20, 22, 25, 30$

Step 2: Read the boundary word. "Less than $15$" is strict, so neither $15$ counts.

Step 3: Walk and mark: $10$ (yes), $12$ (yes), $14$ (yes), then $15$ stops being below.
- Answer: $3$

Step 4: Check. Before inserting, two values were below $15$. The new value landed below the boundary, so the count rose by exactly one, from $2$ to $3$. Consistent.

Step 2 is where this item is won or lost. A student who counts $15$ as "less than $15$" gets $5$, and the only error was reading a boundary word.

---

##### Comparing Two Counts

**Example 6:** Twelve students named a favourite colour. Red was chosen by $4$, Blue by $3$, and Green by $5$. How many more students preferred Green than Red?

Step 1: Identify the two groups the question names. Green and Red. Blue is not part of this question at all.

Step 2: Read the direction. "How many more Green than Red" means Green minus Red.
- $5 - 4 = 1$

Answer: $1$ student.

Two traps, both about reading rather than subtracting. Reversing the order gives $4 - 5 = -1$, and a count cannot be negative, which is your signal that the subtraction ran backward. Pulling in the wrong pair, say Green minus Blue, answers a question nobody asked. **Underline the two groups named before you subtract.**

---

##### The Five Traps

1. **Counting in your head.** Walk the list entry by entry. Speed is what causes off-by-one errors.
2. **Confusing entries with distinct values.** "How many are $55$" counts entries. "How many distinct values repeat" counts kinds. Circle the word "distinct."
3. **Misreading the boundary.** "Less than $15$" excludes $15$. "At least $15$" includes it.
4. **Doing arithmetic when nothing changed.** Values added above a threshold do not change the count below it.
5. **Subtracting backward.** "How many more Green than Red" is Green minus Red. A negative count means you reversed it.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. A teacher recorded the following quiz scores for $7$ students: $84, 71, 90, 65, 78, 90, 71$. How many students scored exactly $71$?
   - A) $1$
   - B) $2$
   - C) $3$
   - D) $4$

2. A teacher asked $8$ students to name their favorite subject. The responses were: Math, Science, Math, English, Math, Science, English, Math. How many students chose Math?
   - A) $2$
   - B) $3$
   - C) $5$
   - D) $4$

3. The high temperatures in degrees Fahrenheit recorded over $8$ days were: $73, 68, 75, 68, 80, 73, 68, 75$. How many days had a temperature below $74$ degrees?
   - A) $5$
   - B) $2$
   - C) $4$
   - D) $7$

4. A list of $6$ values is: $12, 9, 15, 9, 20, 9$. How many times does the value $9$ appear?
   - A) $3$
   - B) $2$
   - C) $1$
   - D) $4$

**Proficient Level** (these require an extra step)

5. A dataset lists the number of siblings reported by $10$ students: $0, 2, 1, 3, 2, 0, 1, 2, 3, 1$. How many students reported having $2$ or more siblings?
   - A) $3$
   - B) $5$
   - C) $2$
   - D) $8$

6. A frequency table shows the color preferences of $12$ students. Red was chosen by $4$ students, Blue by $3$ students, and Green by $5$ students. How many more students preferred Green than Red?
   - A) $1$
   - B) $2$
   - C) $9$
   - D) $-1$

7. A list of $9$ test scores is: $55, 72, 88, 55, 66, 72, 91, 55, 80$. How many distinct values appear more than once in this dataset?
   - A) $3$
   - B) $5$
   - C) $2$
   - D) $1$

**Advanced Level** (these need multiple steps or reverse thinking)

8. A student claims to have arranged the following values in ascending order: $14, 18, 22, 19, 27, 31$. Which statement correctly identifies the error in the student's list?
   - A) $14$ and $18$ are out of order, since $18$ should come before $14$.
   - B) $27$ and $31$ are out of order, since $31$ should come before $27$.
   - C) $19$ and $22$ are out of order, since $19$ should appear before $22$.
   - D) $22$ is correctly placed because it is greater than $18$.

9. A sorted dataset of $12$ values contains exactly $5$ values that are less than $40$. Three new values, all greater than $40$, are added to the dataset. How many values in the updated dataset are less than $40$?
   - A) $8$
   - B) $3$
   - C) $9$
   - D) $5$

10. A dataset contains $8$ values sorted in ascending order: $10, 12, 15, 15, 20, 22, 25, 30$. A value of $14$ is added to the dataset. After inserting $14$ in its correct sorted position, how many values in the updated dataset are less than $15$?
    - A) $2$
    - B) $3$
    - C) $4$
    - D) $5$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

A coach recorded the number of goals scored in $7$ games: $2, 0, 3, 2, 1, 2, 0$. How many games had exactly $2$ goals?

- A) $2$
- B) $5$
- C) $3$
- D) $1$

**Item 2**

A list of $9$ ages is: $19, 22, 25, 22, 31, 19, 40, 25, 19$. How many distinct values appear more than once?

- A) $3$
- B) $5$
- C) $2$
- D) $7$

**Item 3**

A survey of $10$ households recorded the number of cars owned: $1, 2, 0, 3, 1, 1, 2, 0, 4, 1$. How many households own at least $2$ cars?

- A) $8$
- B) $4$
- C) $2$
- D) $5$

**Item 4**

A student claims to have arranged these values in ascending order: $8, 13, 21, 17, 25$. Which statement correctly identifies the error?

- A) $8$ and $13$ are out of order, since $13$ should come before $8$.
- B) $21$ and $17$ are out of order, since $17$ should appear before $21$.
- C) $25$ is out of place and should come before $17$.
- D) The list is already in ascending order.

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. A teacher recorded the following quiz scores for $7$ students: $84, 71, 90, 65, 78, 90, 71$. How many students scored exactly $71$?**

Step 1: Walk the list left to right, marking every $71$.
- $84$ no, $71$ **yes** ($1$), $90$ no, $65$ no, $78$ no, $90$ no, $71$ **yes** ($2$)

Step 2: Two hits.

Step 3: Check with the complement. Five entries were not $71$, and $2 + 5 = 7$. Correct.

**Answer: B** ($2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: off_by_one_count (spots the 71 near the front of the list and misses the one in the final position, stopping at 1)",
  "B": "Correct: walks all seven entries and finds 71 in exactly two positions, confirmed against the five non-matching entries",
  "C": "Student makes misconception: off_by_one_count (counts one entry twice while scanning, most easily the repeated 90, and reports 3)",
  "D": "Student makes misconception: distinct_values_counted_not_occurrences (counts the entries belonging to any repeated value, adding the two 71s and the two 90s to reach 4 rather than counting only the 71s)"
},
"misconception_tag": {
  "A": "off_by_one_count",
  "C": "off_by_one_count",
  "D": "distinct_values_counted_not_occurrences"
}
```

---

**2. A teacher asked $8$ students to name their favorite subject. The responses were: Math, Science, Math, English, Math, Science, English, Math. How many students chose Math?**

Step 1: Walk the list, marking each Math.
- Math ($1$), Science, Math ($2$), English, Math ($3$), Science, English, Math ($4$)

Step 2: Four hits.

Step 3: Check with the complement. Science appears twice and English twice, so $4 + 2 + 2 = 8$. Correct.

**Answer: D** ($4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: reads_wrong_category (counts the Science responses instead of the Math ones, reporting 2)",
  "B": "Student makes misconception: off_by_one_count (misses the Math in the final position, which is the easiest entry to skip once the list feels finished, and reports 3)",
  "C": "Student makes misconception: off_by_one_count (counts the four Math entries and carries one neighbouring response into the tally, reporting 5, which is more Math entries than the list holds)",
  "D": "Correct: walks all eight responses and finds Math in four positions, confirmed against the two Science and two English entries"
},
"misconception_tag": {
  "A": "reads_wrong_category",
  "B": "off_by_one_count",
  "C": "off_by_one_count"
}
```

---

**3. The high temperatures in degrees Fahrenheit recorded over $8$ days were: $73, 68, 75, 68, 80, 73, 68, 75$. How many days had a temperature below $74$ degrees?**

Step 1: Read the boundary. "Below $74$" is strict, so $74$ itself would not count. No entry equals $74$ here, but check anyway.

Step 2: Walk and mark.
- $73$ yes ($1$), $68$ yes ($2$), $75$ no, $68$ yes ($3$), $80$ no, $73$ yes ($4$), $68$ yes ($5$), $75$ no

Step 3: Five hits. Note that only two distinct values sit below the boundary, $73$ and $68$, but they cover five days between them. The question asked for days.

Step 4: Check with the complement. Three entries failed ($75$, $80$, $75$), and $5 + 3 = 8$. Correct.

**Answer: A** ($5$)

```json
"distractor_logic": {
  "A": "Correct: walks all eight entries against a strict boundary of 74 and finds five below it, confirmed against the three entries at or above it",
  "B": "Student makes misconception: distinct_values_counted_not_occurrences (counts how many distinct values fall below 74, namely 73 and 68, rather than how many days those two values cover)",
  "C": "Student makes misconception: off_by_one_count (misses one of the three 68 entries while scanning and reports 4)",
  "D": "Student makes misconception: threshold_boundary_error (counts every day at or below 75 instead of below 74, admitting both 75s and reaching 7)"
},
"misconception_tag": {
  "B": "distinct_values_counted_not_occurrences",
  "C": "off_by_one_count",
  "D": "threshold_boundary_error"
}
```

---

**4. A list of $6$ values is: $12, 9, 15, 9, 20, 9$. How many times does the value $9$ appear?**

Step 1: Walk the list, marking each $9$.
- $12$ no, $9$ **yes** ($1$), $15$ no, $9$ **yes** ($2$), $20$ no, $9$ **yes** ($3$)

Step 2: Three hits.

Step 3: Check with the complement. Three entries were not $9$, and $3 + 3 = 6$. Correct.

**Answer: A** ($3$)

```json
"distractor_logic": {
  "A": "Correct: walks all six entries and finds 9 in three positions, confirmed against the three non-matching entries",
  "B": "Student makes misconception: off_by_one_count (misses the 9 in the final position and reports 2)",
  "C": "Student makes misconception: distinct_values_counted_not_occurrences (reports that 9 is one distinct value rather than counting how many entries hold it)",
  "D": "Student makes misconception: off_by_one_count (counts one entry twice while scanning and reports 4, one more than the list contains)"
},
"misconception_tag": {
  "B": "off_by_one_count",
  "C": "distinct_values_counted_not_occurrences",
  "D": "off_by_one_count"
}
```

---

**Proficient Level**

**5. A dataset lists the number of siblings reported by $10$ students: $0, 2, 1, 3, 2, 0, 1, 2, 3, 1$. How many students reported having $2$ or more siblings?**

Step 1: Read the boundary. "$2$ or more" includes $2$ itself.

Step 2: Walk and mark.
- $0$ no, $2$ yes ($1$), $1$ no, $3$ yes ($2$), $2$ yes ($3$), $0$ no, $1$ no, $2$ yes ($4$), $3$ yes ($5$), $1$ no

Step 3: Five hits.

Step 4: Check with the complement. The entries below $2$ are $0, 1, 0, 1, 1$, which is five, and $5 + 5 = 10$. Correct.

**Answer: B** ($5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: off_by_one_count (scans the three 2s and two 3s but drops one of them, reporting 3 where five entries qualify)",
  "B": "Correct: counts every entry of 2 or more, finding three 2s and two 3s for a total of 5, confirmed against the five entries below 2",
  "C": "Student makes misconception: threshold_boundary_error (reads 2 or more as strictly more than 2, excluding all three 2s and counting only the two 3s)",
  "D": "Student makes misconception: threshold_boundary_error (sets the boundary a step too low and counts every student reporting at least 1 sibling, which is all ten minus the two zeros, reaching 8)"
},
"misconception_tag": {
  "A": "off_by_one_count",
  "C": "threshold_boundary_error",
  "D": "threshold_boundary_error"
}
```

---

**6. A frequency table shows the color preferences of $12$ students. Red was chosen by $4$ students, Blue by $3$ students, and Green by $5$ students. How many more students preferred Green than Red?**

Step 1: Identify the two groups named. Green ($5$) and Red ($4$). Blue is not involved.

Step 2: Read the direction. Green minus Red.
- $5 - 4 = 1$

Step 3: Sanity check. Green is only slightly more popular than Red, so a difference of $1$ is reasonable, and a count of students can never come out negative.

**Answer: A** ($1$)

```json
"distractor_logic": {
  "A": "Correct: subtracts the Red count of 4 from the Green count of 5 to get a difference of 1",
  "B": "Student makes misconception: reads_wrong_category (compares Green against Blue instead of Red, computing 5 minus 3 to get 2)",
  "C": "Student makes misconception: reads_wrong_category (adds the two named counts instead of comparing them, computing 5 plus 4 to get 9)",
  "D": "Student makes misconception: subtracts_in_wrong_order (subtracts Green from Red rather than Red from Green, computing 4 minus 5 to get -1, a negative value that cannot be a number of students)"
},
"misconception_tag": {
  "B": "reads_wrong_category",
  "C": "reads_wrong_category",
  "D": "subtracts_in_wrong_order"
}
```

---

**7. A list of $9$ test scores is: $55, 72, 88, 55, 66, 72, 91, 55, 80$. How many distinct values appear more than once in this dataset?**

Step 1: Note the word "distinct." This counts kinds of value, not entries.

Step 2: Tally each value.
- $55$: three times
- $72$: twice
- $88$: once
- $66$: once
- $91$: once
- $80$: once

Step 3: Which values appear more than once? $55$ and $72$. That is two values.

Step 4: Guard against the trap. Those two values cover five entries, but the question asked how many values repeat, not how many entries they hold.

**Answer: C** ($2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: distinct_values_counted_not_occurrences (reports how many times the most frequent value appears, giving the three 55s rather than the count of repeated values)",
  "B": "Student makes misconception: distinct_values_counted_not_occurrences (counts the entries belonging to repeated values, adding the three 55s and the two 72s to reach 5)",
  "C": "Correct: tallies each value and finds exactly two of them, 55 and 72, appearing more than once",
  "D": "Student makes misconception: off_by_one_count (spots that 55 repeats and stops scanning before reaching the second 72, reporting 1)"
},
"misconception_tag": {
  "A": "distinct_values_counted_not_occurrences",
  "B": "distinct_values_counted_not_occurrences",
  "D": "off_by_one_count"
}
```

---

**Advanced Level**

**8. A student claims to have arranged the following values in ascending order: $14, 18, 22, 19, 27, 31$. Which statement correctly identifies the error in the student's list?**

Step 1: Compare each neighbouring pair left to right.
- $14 < 18$: fine
- $18 < 22$: fine
- $22 < 19$: **fails**
- $19 < 27$: fine
- $27 < 31$: fine

Step 2: The only failing pair is $22$ and $19$. Since $19$ is smaller, it belongs before $22$.

**Answer: C** ($19$ and $22$ are out of order, since $19$ should appear before $22$.)

```json
"distractor_logic": {
  "A": "Student makes misconception: ordering_violation_located_wrongly (names the first pair in the list as the error, though 14 is less than 18 and that pair is correctly ordered)",
  "B": "Student makes misconception: ordering_violation_located_wrongly (names the last pair as the error, though 27 is less than 31 and that pair is correctly ordered)",
  "C": "Correct: pairwise comparison finds the single failure at 22 followed by 19, so 19 belongs before 22",
  "D": "Student makes misconception: ordering_violation_located_wrongly (checks 22 only against the entry before it, finds that comparison sound, and concludes 22 is correctly placed without checking the entry after it)"
},
"misconception_tag": {
  "A": "ordering_violation_located_wrongly",
  "B": "ordering_violation_located_wrongly",
  "D": "ordering_violation_located_wrongly"
}
```

---

**9. A sorted dataset of $12$ values contains exactly $5$ values that are less than $40$. Three new values, all greater than $40$, are added to the dataset. How many values in the updated dataset are less than $40$?**

Step 1: Ask what changed **below** the boundary of $40$.

Step 2: Nothing did. All three new values are above $40$.

Step 3: So the count below $40$ is unchanged.
- Still $5$

Step 4: Confirm the totals separately. The dataset grew from $12$ to $15$, and the count above $40$ grew from $7$ to $10$. The below count stayed put. Consistent.

**Answer: D** ($5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: added_items_not_reflected_in_total (adds all three new values to the below-40 count, computing 5 plus 3 to get 8, though every new value sits above the boundary)",
  "B": "Student makes misconception: off_by_one_count (reports the number of values added rather than the count the question asks about)",
  "C": "Student makes misconception: added_items_not_reflected_in_total (adds the three new values to the seven values that were at or above 40, reporting 9 and answering about the wrong side of the boundary)",
  "D": "Correct: recognises that all three additions lie above 40, so the count of values below 40 is untouched at 5"
},
"misconception_tag": {
  "A": "added_items_not_reflected_in_total",
  "B": "off_by_one_count",
  "C": "added_items_not_reflected_in_total"
}
```

---

**10. A dataset contains $8$ values sorted in ascending order: $10, 12, 15, 15, 20, 22, 25, 30$. A value of $14$ is added to the dataset. After inserting $14$ in its correct sorted position, how many values in the updated dataset are less than $15$?**

Step 1: Insert $14$ between $12$ and $15$.
- $10, 12, 14, 15, 15, 20, 22, 25, 30$

Step 2: Read the boundary. "Less than $15$" is strict, so neither $15$ counts.

Step 3: Walk and mark.
- $10$ yes ($1$), $12$ yes ($2$), $14$ yes ($3$), $15$ stops

Step 4: Check. Before the insertion, two values were below $15$. The new value landed below the boundary, so the count rose by exactly one, to $3$.

**Answer: B** ($3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: added_items_not_reflected_in_total (counts the two original values below 15 and never adds the newly inserted 14, which also falls below the boundary)",
  "B": "Correct: inserts 14 in sorted position and counts 10, 12 and 14 as the three values strictly below 15",
  "C": "Student makes misconception: threshold_boundary_error (admits one of the two 15s as though the boundary were inclusive, reaching 4)",
  "D": "Student makes misconception: threshold_boundary_error (reads less than 15 as 15 or less and counts both 15s, reaching 5)"
},
"misconception_tag": {
  "A": "added_items_not_reflected_in_total",
  "C": "threshold_boundary_error",
  "D": "threshold_boundary_error"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: A coach recorded the number of goals scored in $7$ games: $2, 0, 3, 2, 1, 2, 0$. How many games had exactly $2$ goals?**

Step 1: Walk the list, marking each $2$.
- $2$ yes ($1$), $0$ no, $3$ no, $2$ yes ($2$), $1$ no, $2$ yes ($3$), $0$ no

Step 2: Three hits.

Step 3: Check with the complement. Four entries were not $2$, and $3 + 4 = 7$. Correct.

**Answer: C** ($3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: off_by_one_count (loses the scan partway and reports 2, missing the third occurrence)",
  "B": "Student makes misconception: threshold_boundary_error (counts every game that scored at least one goal rather than exactly two, admitting the 3 and the 1 alongside the three 2s to reach 5)",
  "C": "Correct: walks all seven games and finds exactly three with 2 goals, confirmed against the four games that had a different number",
  "D": "Student makes misconception: distinct_values_counted_not_occurrences (reports that 2 is one value appearing in the list rather than counting how many games hold it)"
},
"misconception_tag": {
  "A": "off_by_one_count",
  "B": "threshold_boundary_error",
  "D": "distinct_values_counted_not_occurrences"
}
```

---

**Item 2: A list of $9$ ages is: $19, 22, 25, 22, 31, 19, 40, 25, 19$. How many distinct values appear more than once?**

Step 1: Note the word "distinct." Count kinds, not entries.

Step 2: Tally each value.
- $19$: three times
- $22$: twice
- $25$: twice
- $31$: once
- $40$: once

Step 3: The values appearing more than once are $19$, $22$ and $25$. That is three values.

**Answer: A** ($3$)

```json
"distractor_logic": {
  "A": "Correct: tallies each value and finds three of them, 19, 22 and 25, appearing more than once",
  "B": "Student makes misconception: distinct_values_counted_not_occurrences (counts the distinct values present in the list at all, reaching 5, rather than only those that repeat)",
  "C": "Student makes misconception: off_by_one_count (finds 19 and 22 repeating and stops before checking the second 25, reporting 2)",
  "D": "Student makes misconception: distinct_values_counted_not_occurrences (counts the entries belonging to repeated values, adding three 19s, two 22s and two 25s to reach 7)"
},
"misconception_tag": {
  "B": "distinct_values_counted_not_occurrences",
  "C": "off_by_one_count",
  "D": "distinct_values_counted_not_occurrences"
}
```

---

**Item 3: A survey of $10$ households recorded the number of cars owned: $1, 2, 0, 3, 1, 1, 2, 0, 4, 1$. How many households own at least $2$ cars?**

Step 1: Read the boundary. "At least $2$" includes $2$ itself.

Step 2: Walk and mark.
- $1$ no, $2$ yes ($1$), $0$ no, $3$ yes ($2$), $1$ no, $1$ no, $2$ yes ($3$), $0$ no, $4$ yes ($4$), $1$ no

Step 3: Four hits.

Step 4: Check with the complement. The entries below $2$ are $1, 0, 1, 1, 0, 1$, which is six, and $4 + 6 = 10$. Correct.

**Answer: B** ($4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: threshold_boundary_error (counts households owning at least 1 car instead of at least 2, admitting the four 1s alongside the four qualifying households to reach 8)",
  "B": "Correct: counts the two 2s, the 3 and the 4 for a total of 4, confirmed against the six households below the boundary",
  "C": "Student makes misconception: threshold_boundary_error (reads at least 2 as strictly more than 2, excluding both 2s and counting only the 3 and the 4)",
  "D": "Student makes misconception: off_by_one_count (counts one qualifying household twice while scanning and reports 5)"
},
"misconception_tag": {
  "A": "threshold_boundary_error",
  "C": "threshold_boundary_error",
  "D": "off_by_one_count"
}
```

---

**Item 4: A student claims to have arranged these values in ascending order: $8, 13, 21, 17, 25$. Which statement correctly identifies the error?**

Step 1: Compare each neighbouring pair.
- $8 < 13$: fine
- $13 < 21$: fine
- $21 < 17$: **fails**
- $17 < 25$: fine

Step 2: The only failing pair is $21$ and $17$, and $17$ is the smaller, so it belongs first.

**Answer: B** ($21$ and $17$ are out of order, since $17$ should appear before $21$.)

```json
"distractor_logic": {
  "A": "Student makes misconception: ordering_violation_located_wrongly (names the opening pair as the error, though 8 is less than 13 and that pair is correctly ordered)",
  "B": "Correct: pairwise comparison finds the single failure at 21 followed by 17, so 17 belongs before 21",
  "C": "Student makes misconception: ordering_violation_located_wrongly (blames the largest value at the end of the list, though 25 is correctly placed after 17)",
  "D": "Student makes misconception: ordering_violation_located_wrongly (accepts the list as sorted, having checked only that it starts and ends with its smallest and largest values rather than comparing every neighbouring pair)"
},
"misconception_tag": {
  "A": "ordering_violation_located_wrongly",
  "C": "ordering_violation_located_wrongly",
  "D": "ordering_violation_located_wrongly"
}
```
