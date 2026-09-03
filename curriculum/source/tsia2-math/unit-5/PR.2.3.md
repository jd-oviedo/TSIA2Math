---
topic_name: "Inverse problems: finding a missing data value given the mean or range"
unit_number: 5
sequence_in_unit: 6
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "PR"
keywords: ["inverse problem", "missing value", "mean", "range", "working backward", "total", "constraint"]
---

# PR.2.3 - Inverse Problems: Finding a Missing Data Value Given the Mean or Range

**Topic ID:** PR.2.3  
**Unit:** 5  
**Strand:** PR (Probabilistic and Statistical Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Find a missing value from a mean by converting the mean to a total and subtracting the known values.
- Find a missing value from a range by adding or subtracting the range from the correct known extreme, depending on whether the missing value is the new largest or smallest.
- Solve for a minimum required value or for two unknowns given both a mean and a range simultaneously.

---

#### **Part 1: Guided Notes**

##### Two Questions, Asked in Order

You already know how to find a mean: add the values, divide by how many there are. This topic hands you the mean and takes away one of the values.

That sounds harder. It is actually the same equation read from the other end, and there are only two questions to answer before you start:

1. **Which summary was I given, the mean or the range?** They lead to completely different first moves.
2. **Am I running it forward or backward?** Forward produces a summary from data. Backward produces data from a summary.

**The confusion this topic exists to prevent is answering the forward question when the backward one was asked.** A student handed four values and a target mean will very often compute the mean of the four values they can see. That produces a real number, it is arithmetically flawless, and it is not what was asked. Watch for it in yourself.

---

##### The Mean Is a Total in Disguise

Every inverse mean problem turns on one rearrangement.

$$\text{mean} = \frac{\text{total}}{\text{count}} \qquad \text{becomes} \qquad \text{total} = \text{mean} \times \text{count}$$

The mean by itself tells you nothing about any individual value. **The total does.** So the first move backward is always the same: turn the mean into a total, because the total is a number you can subtract from.

**Example 1:** Four values have a mean of $16$. Three of them are $12$, $18$, and $15$. Find the fourth.

Step 1: Turn the mean into a total. There are $4$ values.
- $16 \times 4 = 64$

Step 2: Add the values you were given.
- $12 + 18 + 15 = 45$

Step 3: Subtract. Whatever is left over is the missing value.
- $64 - 45 = 19$

Step 4: Check by running it forward.
- $\frac{12 + 18 + 15 + 19}{4} = \frac{64}{4} = 16$

The missing value is $19$. **Every one of these can be checked forward in ten seconds, and you should.**

---

##### The Count Includes the Value You Cannot See

Step 1 is where this goes wrong, and it goes wrong quietly.

There are four values. One of them is missing, but it still exists, so the count is $4$ and not $3$. A student who multiplies $16 \times 3 = 48$ and subtracts $45$ gets $3$.

Now look at what $3$ would mean. It claims the four numbers are $12$, $18$, $15$ and $3$, whose mean is $12$, not $16$. **The missing value is missing from your list, not from the data set.** Count the values the problem describes, not the values it prints.

**Example 2:** Five numbers have a mean of $11$. Four of them are $7$, $11$, $9$, and $13$. Find the fifth.

Step 1: Total, using a count of $5$.
- $11 \times 5 = 55$

Step 2: Sum of the known values.
- $7 + 11 + 9 + 13 = 40$

Step 3: Subtract.
- $55 - 40 = 15$

Step 4: Check. $\frac{40 + 15}{5} = \frac{55}{5} = 11$. Correct.

Notice that $15$ is larger than every value except one. That makes sense: the four known values average $10$, which is below the target of $11$, so the missing value has to pull the mean up. **Predict whether the answer sits above or below the known values before you compute it.**

---

##### Finding a Missing Value From the Range

The range is a different tool and needs a different first move.

$$\text{range} = \text{largest value} - \text{smallest value}$$

Only two values in the whole set matter. Everything between the extremes is decoration for this purpose.

So the question becomes: **is the missing value the new largest, or the new smallest?** The problem always tells you, and the answer follows in one step.

- If the missing value is the new **largest**: it sits a full range above the smallest known value.
- If the missing value is the new **smallest**: it sits a full range below the largest known value.

**Example 3:** A data set has values $23$, $31$, $27$, and one more value that is the largest in the set. The range is $20$. Find the missing value.

Step 1: Identify the extremes among the known values.
- Smallest known: $23$. Largest known: $31$.

Step 2: The missing value is the new largest, so the smallest value in the finished set is still $23$.

Step 3: Add the range to that smallest value.
- $23 + 20 = 43$

Step 4: Check. The set is $23$, $27$, $31$, $43$. Largest minus smallest is $43 - 23 = 20$. Correct.

Step 3 is the whole item. Adding the range to $31$, the largest known value, gives $51$, and $51$ is wrong because $31$ was never the smallest value in anything. **The range is measured from the bottom of the finished set, so it is added to the bottom.**

**Example 4:** Daily low temperatures were $14$, $22$, $19$, and $25$ degrees, plus one more day that was the coldest of them all. The range is $18$. Find the missing temperature.

Step 1: Largest known: $25$. The missing value is the new smallest, so $25$ stays the largest.

Step 2: Subtract the range from that largest value.
- $25 - 18 = 7$

Step 3: Check. The set is $7$, $14$, $19$, $22$, $25$. Range is $25 - 7 = 18$. Correct.

---

##### The Mistake That Costs the Most Points

Read this section twice.

**Answer the question that was asked, not the one you know how to answer.**

In Example 3 you were given three values and a range, and asked for a fourth value. The reflex is to compute the range of the three values you can see:

- $31 - 23 = 8$

That is a correct calculation of something nobody asked about. It is the forward move performed on a backward question, and it is the single most common way this topic is failed. The same reflex on a mean problem computes the average of the visible values instead of solving for the hidden one.

**The tell is that you never used one of the given numbers.** In Example 3 the range of $20$ was handed to you. If your work never touches it, you have answered a different question.

Before you write anything down, say what you are solving for out loud: *"I am looking for a value, not a summary."* Then check afterwards that every number in the stem got used.

---

##### Two Conditions at Once

Harder problems remove two values and give you both summaries. Two unknowns need two equations, and you already have both.

**Example 5:** A set of five numbers has a mean of $12$ and a range of $20$. Three of the numbers are $6$, $10$, and $14$. The two missing numbers are the largest and the smallest in the set. Find them.

Step 1: Use the mean to get the total.
- $12 \times 5 = 60$

Step 2: Subtract the known values to get what the two missing ones must add to.
- $6 + 10 + 14 = 30$, so the pair sums to $60 - 30 = 30$

Step 3: Use the range. The missing values are the largest and smallest, so they differ by the range.
- Their difference is $20$

Step 4: Two numbers adding to $30$ and differing by $20$. Add the two facts and halve.
- Larger: $\frac{30 + 20}{2} = 25$
- Smaller: $\frac{30 - 20}{2} = 5$

Step 5: Check both conditions. The set is $5$, $6$, $10$, $14$, $25$.
- Mean: $\frac{60}{5} = 12$. Correct.
- Range: $25 - 5 = 20$. Correct.

**Check both conditions, not one.** A pair that satisfies the mean and fails the range is a wrong answer that looks half right, and half right earns nothing.

---

##### How Small Can It Be

The last variety asks not for a value but for a **limit** on a value.

**Example 6:** A student has four test scores of $78$, $85$, $90$, and $62$. There is one test left, and every test is scored from $0$ to $100$. The student needs a mean of at least $80$ across all five. What is the lowest score that will do it?

Step 1: Turn the requirement into a total. "At least $80$" across $5$ tests means the total must be at least

- $80 \times 5 = 400$

Step 2: Add what is already banked.
- $78 + 85 + 90 + 62 = 315$

Step 3: Subtract to find what the last test must contribute.
- $400 - 315 = 85$

So the fifth score must be at least $85$. Any score from $85$ to $100$ works, and the question asked for the **lowest** one, so the answer is $85$.

Step 3 gives you a whole interval, and the question always names which end of it it wants. A student who finds the interval correctly and reports $100$ has done the mathematics and then answered a different question. **Find the boundary, then re-read which end was asked for.**

Check: $\frac{315 + 85}{5} = \frac{400}{5} = 80$. Exactly $80$, which satisfies "at least $80$".

---

##### The Five Traps

1. **Solving forward.** Computing the mean or range of the values you can see, instead of solving for the one you cannot. If a number in the stem went unused, this is what happened.
2. **Counting only the visible values.** The missing value is part of the data set, so it is part of the count. Multiply the mean by the full count.
3. **Assuming the missing value equals the mean.** The mean is a property of the set, not a member of it.
4. **Adding the range to the wrong extreme.** A new largest sits a range above the smallest; a new smallest sits a range below the largest.
5. **Reporting the wrong end of an interval.** When the answer is a limit, find the boundary and then re-read whether the question wanted the largest or the smallest.

When you miss one below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Four numbers have a mean of $16$. Three of them are $12$, $18$, and $15$. What is the fourth number?
   - A) $3$
   - B) $29$
   - C) $19$
   - D) $16$

2. Five numbers have a mean of $11$. Four of them are $7$, $11$, $9$, and $13$. What is the fifth number?
   - A) $4$
   - B) $15$
   - C) $29$
   - D) $11$

3. Four numbers have a mean of $27$. Three of them are $24$, $30$, and $21$. What is the fourth number?
   - A) $33$
   - B) $6$
   - C) $27$
   - D) $48$

4. Five numbers have a mean of $12$. Four of them are $8$, $14$, $6$, and $12$. What is the fifth number?
   - A) $8$
   - B) $12$
   - C) $28$
   - D) $20$

**Proficient Level** (these require an extra step)

5. A data set contains $23$, $31$, $27$, and one more value, which is the largest in the set. The range of the set is $20$. What is the missing value?
   - A) $51$
   - B) $43$
   - C) $8$
   - D) $11$

6. Six numbers have a mean of $50$. Five of them are $45$, $52$, $38$, $61$, and $49$. What is the sixth number?
   - A) $5$
   - B) $50$
   - C) $55$
   - D) $105$

7. Daily low temperatures for five days were $14$, $22$, $19$, and $25$ degrees, plus one more day that was the coldest of the five. The range of the five temperatures is $18$ degrees. What was the missing temperature?
   - A) $7$
   - B) $11$
   - C) $32$
   - D) $-4$

**Advanced Level** (these need multiple steps or reverse thinking)

8. A set of five numbers has a mean of $12$ and a range of $20$. Three of the numbers are $6$, $10$, and $14$, and the two missing numbers are the largest and the smallest in the set. What is the larger missing number?
   - A) $8$
   - B) $19$
   - C) $34$
   - D) $25$

9. A student has test scores of $78$, $85$, $90$, and $62$. One test remains, and every test is scored from $0$ to $100$. What is the lowest score on the last test that gives a mean of at least $80$ across all five tests?
   - A) $5$
   - B) $85$
   - C) $80$
   - D) $100$

10. A set of six numbers has a mean of $40$ and a range of $32$. Four of the numbers are $30$, $42$, $36$, and $48$, and the two missing numbers are the largest and the smallest in the set. What is the smaller missing number?
    - A) $6$
    - B) $16$
    - C) $26$
    - D) $18$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Four numbers have a mean of $21$. Three of them are $16$, $20$, and $24$. What is the fourth number?

- A) $24$
- B) $3$
- C) $39$
- D) $21$

**Proficient Level**

**Item 2**

A data set contains $55$, $68$, $61$, and one more value, which is the largest in the set. The range of the set is $25$. What is the missing value?

- A) $93$
- B) $13$
- C) $43$
- D) $80$

**Basic Level**

**Item 3**

Five numbers have a mean of $36$. Four of them are $33$, $41$, $29$, and $37$. What is the fifth number?

- A) $4$
- B) $36$
- C) $40$
- D) $76$

**Advanced Level**

**Item 4**

A student has quiz scores of $15$, $18$, and $12$. One quiz remains, and every quiz is scored from $0$ to $20$. What is the lowest score on the last quiz that gives a mean of at least $16$ across all four quizzes?

- A) $3$
- B) $19$
- C) $20$
- D) $16$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Four numbers have a mean of $16$. Three of them are $12$, $18$, and $15$. What is the fourth number?**

Step 1: Turn the mean into a total, using the full count of $4$.
- $16 \times 4 = 64$

Step 2: Add the known values.
- $12 + 18 + 15 = 45$

Step 3: Subtract.
- $64 - 45 = 19$

Step 4: Check forward. $\frac{45 + 19}{4} = \frac{64}{4} = 16$. Correct.

**Answer: C** ($19$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_from_wrong_count (multiplies the mean by 3, the number of values printed, instead of 4, the number of values in the set, giving 48 - 45 = 3)",
  "B": "Student makes misconception: mean_subtracted_from_sum (subtracts the mean from the sum of the known values, computing 45 - 16 = 29, which uses the total of the wrong three numbers)",
  "C": "Correct: the total must be 16 times 4 = 64, and 64 - 45 = 19, confirmed by averaging forward back to 16",
  "D": "Student makes misconception: missing_value_assumed_equal_to_mean (reports the mean itself as the missing value, treating 16 as a member of the set rather than a property of it)"
},
"misconception_tag": {
  "A": "total_from_wrong_count",
  "B": "mean_subtracted_from_sum",
  "D": "missing_value_assumed_equal_to_mean"
}
```

---

**2. Five numbers have a mean of $11$. Four of them are $7$, $11$, $9$, and $13$. What is the fifth number?**

Step 1: Total, with a count of $5$.
- $11 \times 5 = 55$

Step 2: Sum of the known values.
- $7 + 11 + 9 + 13 = 40$

Step 3: Subtract.
- $55 - 40 = 15$

Step 4: Check. $\frac{40 + 15}{5} = \frac{55}{5} = 11$. Correct.

**Answer: B** ($15$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_from_wrong_count (multiplies the mean by 4 rather than 5, giving 44 - 40 = 4)",
  "B": "Correct: the total must be 11 times 5 = 55, and 55 - 40 = 15, confirmed by averaging forward back to 11",
  "C": "Student makes misconception: mean_subtracted_from_sum (subtracts the mean from the sum of the known values, computing 40 - 11 = 29)",
  "D": "Student makes misconception: missing_value_assumed_equal_to_mean (reports the mean itself, 11, which is also one of the printed values and so looks confirmed)"
},
"misconception_tag": {
  "A": "total_from_wrong_count",
  "C": "mean_subtracted_from_sum",
  "D": "missing_value_assumed_equal_to_mean"
}
```

---

**3. Four numbers have a mean of $27$. Three of them are $24$, $30$, and $21$. What is the fourth number?**

Step 1: Total, with a count of $4$.
- $27 \times 4 = 108$

Step 2: Sum of the known values.
- $24 + 30 + 21 = 75$

Step 3: Subtract.
- $108 - 75 = 33$

Step 4: Check. $\frac{75 + 33}{4} = \frac{108}{4} = 27$. Correct.

**Answer: A** ($33$)

```json
"distractor_logic": {
  "A": "Correct: the total must be 27 times 4 = 108, and 108 - 75 = 33, confirmed by averaging forward back to 27",
  "B": "Student makes misconception: total_from_wrong_count (multiplies the mean by 3 rather than 4, giving 81 - 75 = 6)",
  "C": "Student makes misconception: missing_value_assumed_equal_to_mean (reports the mean itself, 27, as the missing value)",
  "D": "Student makes misconception: mean_subtracted_from_sum (subtracts the mean from the sum of the known values, computing 75 - 27 = 48)"
},
"misconception_tag": {
  "B": "total_from_wrong_count",
  "C": "missing_value_assumed_equal_to_mean",
  "D": "mean_subtracted_from_sum"
}
```

---

**4. Five numbers have a mean of $12$. Four of them are $8$, $14$, $6$, and $12$. What is the fifth number?**

Step 1: Total, with a count of $5$.
- $12 \times 5 = 60$

Step 2: Sum of the known values.
- $8 + 14 + 6 + 12 = 40$

Step 3: Subtract.
- $60 - 40 = 20$

Step 4: Check. $\frac{40 + 20}{5} = \frac{60}{5} = 12$. Correct.

The four known values average $10$, below the target of $12$, so the missing value must sit well above them. It does.

**Answer: D** ($20$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_from_wrong_count (multiplies the mean by 4 rather than 5, giving 48 - 40 = 8)",
  "B": "Student makes misconception: missing_value_assumed_equal_to_mean (reports the mean itself, 12, which is also one of the printed values and so looks confirmed)",
  "C": "Student makes misconception: mean_subtracted_from_sum (subtracts the mean from the sum of the known values, computing 40 - 12 = 28)",
  "D": "Correct: the total must be 12 times 5 = 60, and 60 - 40 = 20, confirmed by averaging forward back to 12"
},
"misconception_tag": {
  "A": "total_from_wrong_count",
  "B": "missing_value_assumed_equal_to_mean",
  "C": "mean_subtracted_from_sum"
}
```

---

**Proficient Level**

**5. A data set contains $23$, $31$, $27$, and one more value, which is the largest in the set. The range of the set is $20$. What is the missing value?**

Step 1: Find the extremes among the known values.
- Smallest known: $23$. Largest known: $31$.

Step 2: The missing value is the new largest, so the smallest value in the finished set is still $23$.

Step 3: Add the range to the smallest value.
- $23 + 20 = 43$

Step 4: Check. The set is $23$, $27$, $31$, $43$, and $43 - 23 = 20$. Correct.

**Answer: B** ($43$)

```json
"distractor_logic": {
  "A": "Student makes misconception: range_added_to_wrong_extreme (adds the range to the largest known value, computing 31 + 20 = 51, when the range is measured up from the smallest value in the finished set)",
  "B": "Correct: the missing value is the new largest, so it sits one range above the smallest value 23, giving 23 + 20 = 43, confirmed because 43 - 23 = 20",
  "C": "Student makes misconception: range_from_known_values_only (computes the range of the three printed values, 31 - 23 = 8, answering the forward question and never using the given range of 20 at all)",
  "D": "Student makes misconception: range_added_to_wrong_extreme (subtracts the range from the largest known value, computing 31 - 20 = 11, which is the move for a missing value that is the new smallest)"
},
"misconception_tag": {
  "A": "range_added_to_wrong_extreme",
  "C": "range_from_known_values_only",
  "D": "range_added_to_wrong_extreme"
}
```

---

**6. Six numbers have a mean of $50$. Five of them are $45$, $52$, $38$, $61$, and $49$. What is the sixth number?**

Step 1: Total, with a count of $6$.
- $50 \times 6 = 300$

Step 2: Sum of the known values.
- $45 + 52 + 38 + 61 + 49 = 245$

Step 3: Subtract.
- $300 - 245 = 55$

Step 4: Check. $\frac{245 + 55}{6} = \frac{300}{6} = 50$. Correct.

**Answer: C** ($55$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_from_wrong_count (multiplies the mean by 5, the number of values printed, giving 250 - 245 = 5)",
  "B": "Student makes misconception: missing_value_assumed_equal_to_mean (reports the mean itself, 50, as the missing value)",
  "C": "Correct: the total must be 50 times 6 = 300, and 300 - 245 = 55, confirmed by averaging forward back to 50",
  "D": "Student makes misconception: total_from_wrong_count (counts the missing value twice and multiplies the mean by 7, giving 350 - 245 = 105)"
},
"misconception_tag": {
  "A": "total_from_wrong_count",
  "B": "missing_value_assumed_equal_to_mean",
  "D": "total_from_wrong_count"
}
```

---

**7. Daily low temperatures for five days were $14$, $22$, $19$, and $25$ degrees, plus one more day that was the coldest of the five. The range of the five temperatures is $18$ degrees. What was the missing temperature?**

Step 1: Largest known value: $25$. The missing value is the new coldest, so $25$ stays the largest.

Step 2: Subtract the range from the largest value.
- $25 - 18 = 7$

Step 3: Check. The set is $7$, $14$, $19$, $22$, $25$, and $25 - 7 = 18$. Correct.

**Answer: A** ($7$)

```json
"distractor_logic": {
  "A": "Correct: the missing value is the new smallest, so it sits one range below the largest value 25, giving 25 - 18 = 7, confirmed because 25 - 7 = 18",
  "B": "Student makes misconception: range_from_known_values_only (computes the range of the four printed temperatures, 25 - 14 = 11, answering the forward question and never using the given range of 18)",
  "C": "Student makes misconception: range_added_to_wrong_extreme (adds the range to the smallest known value, computing 14 + 18 = 32, which is the move for a missing value that is the new largest)",
  "D": "Student makes misconception: range_added_to_wrong_extreme (subtracts the range from the smallest known value, computing 14 - 18 = -4, measuring down from the wrong end of the set)"
},
"misconception_tag": {
  "B": "range_from_known_values_only",
  "C": "range_added_to_wrong_extreme",
  "D": "range_added_to_wrong_extreme"
}
```

---

**Advanced Level**

**8. A set of five numbers has a mean of $12$ and a range of $20$. Three of the numbers are $6$, $10$, and $14$, and the two missing numbers are the largest and the smallest in the set. What is the larger missing number?**

Step 1: Use the mean to get the total.
- $12 \times 5 = 60$

Step 2: Subtract the known values to find what the missing pair adds to.
- $6 + 10 + 14 = 30$, so the pair sums to $60 - 30 = 30$

Step 3: The missing values are the largest and the smallest, so they differ by the range, $20$.

Step 4: Add the two facts and halve.
- Larger: $\frac{30 + 20}{2} = 25$
- Smaller: $\frac{30 - 20}{2} = 5$

Step 5: Check both conditions. The set is $5$, $6$, $10$, $14$, $25$. Mean is $\frac{60}{5} = 12$, and range is $25 - 5 = 20$. Both correct.

**Answer: D** ($25$)

```json
"distractor_logic": {
  "A": "Student makes misconception: range_from_known_values_only (computes the range of the three printed values, 14 - 6 = 8, answering a forward question and using neither the mean nor the given range)",
  "B": "Student makes misconception: total_from_wrong_count (multiplies the mean by 4 rather than 5, so the pair is taken to sum to 48 - 30 = 18, and the larger comes out as 19)",
  "C": "Student makes misconception: range_added_to_wrong_extreme (adds the range to the largest known value, computing 14 + 20 = 34, ignoring that the smallest value in the finished set is itself one of the missing numbers)",
  "D": "Correct: the pair sums to 60 - 30 = 30 and differs by 20, so the larger is 25 and the smaller is 5, confirmed against both the mean and the range"
},
"misconception_tag": {
  "A": "range_from_known_values_only",
  "B": "total_from_wrong_count",
  "C": "range_added_to_wrong_extreme"
}
```

---

**9. A student has test scores of $78$, $85$, $90$, and $62$. One test remains, and every test is scored from $0$ to $100$. What is the lowest score on the last test that gives a mean of at least $80$ across all five tests?**

Step 1: Turn the requirement into a total. A mean of at least $80$ across $5$ tests needs a total of at least

- $80 \times 5 = 400$

Step 2: Add what is already banked.
- $78 + 85 + 90 + 62 = 315$

Step 3: Subtract to find what the last test must contribute.
- $400 - 315 = 85$

Any score from $85$ to $100$ works. The question asked for the lowest, so the answer is $85$.

Step 4: Check. $\frac{315 + 85}{5} = \frac{400}{5} = 80$, which satisfies "at least $80$".

**Answer: B** ($85$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_from_wrong_count (multiplies the required mean by 4, the number of tests already taken, giving 320 - 315 = 5)",
  "B": "Correct: the total must reach 80 times 5 = 400, and 400 - 315 = 85, which is the lowest score in the range 85 to 100 that works",
  "C": "Student makes misconception: missing_value_assumed_equal_to_mean (reports the required mean itself, 80, assuming a score equal to the target average will produce that average)",
  "D": "Student makes misconception: optimisation_bound_misused (finds the working interval 85 to 100 correctly and then reports its upper end, 100, answering which scores work rather than which is lowest)"
},
"misconception_tag": {
  "A": "total_from_wrong_count",
  "C": "missing_value_assumed_equal_to_mean",
  "D": "optimisation_bound_misused"
}
```

---

**10. A set of six numbers has a mean of $40$ and a range of $32$. Four of the numbers are $30$, $42$, $36$, and $48$, and the two missing numbers are the largest and the smallest in the set. What is the smaller missing number?**

Step 1: Use the mean to get the total.
- $40 \times 6 = 240$

Step 2: Subtract the known values.
- $30 + 42 + 36 + 48 = 156$, so the missing pair sums to $240 - 156 = 84$

Step 3: The pair differs by the range, $32$.

Step 4: Subtract the two facts and halve.
- Smaller: $\frac{84 - 32}{2} = 26$
- Larger: $\frac{84 + 32}{2} = 58$

Step 5: Check both conditions. The set is $26$, $30$, $36$, $42$, $48$, $58$. Mean is $\frac{240}{6} = 40$, and range is $58 - 26 = 32$. Both correct.

**Answer: C** ($26$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_from_wrong_count (multiplies the mean by 5 rather than 6, so the pair is taken to sum to 200 - 156 = 44, and the smaller comes out as 6)",
  "B": "Student makes misconception: range_added_to_wrong_extreme (subtracts the range from the largest known value, computing 48 - 32 = 16, ignoring that the largest value in the finished set is itself one of the missing numbers)",
  "C": "Correct: the pair sums to 240 - 156 = 84 and differs by 32, so the smaller is 26 and the larger is 58, confirmed against both the mean and the range",
  "D": "Student makes misconception: range_from_known_values_only (computes the range of the four printed values, 48 - 30 = 18, answering a forward question and using neither the mean nor the given range)"
},
"misconception_tag": {
  "A": "total_from_wrong_count",
  "B": "range_added_to_wrong_extreme",
  "D": "range_from_known_values_only"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Four numbers have a mean of $21$. Three of them are $16$, $20$, and $24$. What is the fourth number?**

Step 1: Total, with a count of $4$.
- $21 \times 4 = 84$

Step 2: Sum of the known values.
- $16 + 20 + 24 = 60$

Step 3: Subtract.
- $84 - 60 = 24$

Step 4: Check. $\frac{60 + 24}{4} = \frac{84}{4} = 21$. Correct.

**Answer: A** ($24$)

```json
"distractor_logic": {
  "A": "Correct: the total must be 21 times 4 = 84, and 84 - 60 = 24, confirmed by averaging forward back to 21",
  "B": "Student makes misconception: total_from_wrong_count (multiplies the mean by 3 rather than 4, giving 63 - 60 = 3)",
  "C": "Student makes misconception: mean_subtracted_from_sum (subtracts the mean from the sum of the known values, computing 60 - 21 = 39)",
  "D": "Student makes misconception: missing_value_assumed_equal_to_mean (reports the mean itself, 21, as the missing value)"
},
"misconception_tag": {
  "B": "total_from_wrong_count",
  "C": "mean_subtracted_from_sum",
  "D": "missing_value_assumed_equal_to_mean"
}
```

---

**Item 2: A data set contains $55$, $68$, $61$, and one more value, which is the largest in the set. The range of the set is $25$. What is the missing value?**

Step 1: Smallest known value: $55$. The missing value is the new largest, so $55$ stays the smallest.

Step 2: Add the range to the smallest value.
- $55 + 25 = 80$

Step 3: Check. The set is $55$, $61$, $68$, $80$, and $80 - 55 = 25$. Correct.

**Answer: D** ($80$)

```json
"distractor_logic": {
  "A": "Student makes misconception: range_added_to_wrong_extreme (adds the range to the largest known value, computing 68 + 25 = 93, when the range is measured up from the smallest value in the finished set)",
  "B": "Student makes misconception: range_from_known_values_only (computes the range of the three printed values, 68 - 55 = 13, answering the forward question and never using the given range of 25)",
  "C": "Student makes misconception: range_added_to_wrong_extreme (subtracts the range from the largest known value, computing 68 - 25 = 43, which is the move for a missing value that is the new smallest)",
  "D": "Correct: the missing value is the new largest, so it sits one range above the smallest value 55, giving 55 + 25 = 80, confirmed because 80 - 55 = 25"
},
"misconception_tag": {
  "A": "range_added_to_wrong_extreme",
  "B": "range_from_known_values_only",
  "C": "range_added_to_wrong_extreme"
}
```

---

**Item 3: Five numbers have a mean of $36$. Four of them are $33$, $41$, $29$, and $37$. What is the fifth number?**

Step 1: Total, with a count of $5$.
- $36 \times 5 = 180$

Step 2: Sum of the known values.
- $33 + 41 + 29 + 37 = 140$

Step 3: Subtract.
- $180 - 140 = 40$

Step 4: Check. $\frac{140 + 40}{5} = \frac{180}{5} = 36$. Correct.

**Answer: C** ($40$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_from_wrong_count (multiplies the mean by 4, the number of values printed, giving 144 - 140 = 4)",
  "B": "Student makes misconception: missing_value_assumed_equal_to_mean (reports the mean itself, 36, as the missing value)",
  "C": "Correct: the total must be 36 times 5 = 180, and 180 - 140 = 40, confirmed by averaging forward back to 36",
  "D": "Student makes misconception: total_from_wrong_count (counts the missing value twice and multiplies the mean by 6, giving 216 - 140 = 76)"
},
"misconception_tag": {
  "A": "total_from_wrong_count",
  "B": "missing_value_assumed_equal_to_mean",
  "D": "total_from_wrong_count"
}
```

---

**Item 4: A student has quiz scores of $15$, $18$, and $12$. One quiz remains, and every quiz is scored from $0$ to $20$. What is the lowest score on the last quiz that gives a mean of at least $16$ across all four quizzes?**

Step 1: Turn the requirement into a total. A mean of at least $16$ across $4$ quizzes needs a total of at least

- $16 \times 4 = 64$

Step 2: Add what is already banked.
- $15 + 18 + 12 = 45$

Step 3: Subtract.
- $64 - 45 = 19$

Any score from $19$ to $20$ works, and the question asked for the lowest, so the answer is $19$.

Step 4: Check. $\frac{45 + 19}{4} = \frac{64}{4} = 16$, which satisfies "at least $16$".

**Answer: B** ($19$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_from_wrong_count (multiplies the required mean by 3, the number of quizzes already taken, giving 48 - 45 = 3)",
  "B": "Correct: the total must reach 16 times 4 = 64, and 64 - 45 = 19, which is the lowest score in the range 19 to 20 that works",
  "C": "Student makes misconception: optimisation_bound_misused (finds the working interval 19 to 20 correctly and then reports its upper end, 20, answering which scores work rather than which is lowest)",
  "D": "Student makes misconception: missing_value_assumed_equal_to_mean (reports the required mean itself, 16, assuming a score equal to the target average will produce that average)"
},
"misconception_tag": {
  "A": "total_from_wrong_count",
  "C": "optimisation_bound_misused",
  "D": "missing_value_assumed_equal_to_mean"
}
```

##### Extra Practice - Answer Key

**1. Four numbers have a mean of $15$. Three of them are $10, 14, 20$. What is the fourth number?**

Step 1: Find the total all four numbers must sum to.
- $15 \times 4 = 60$

Step 2: Add the three known numbers.
- $10 + 14 + 20 = 44$

Step 3: Subtract to find the fourth number.
- $60 - 44 = 16$

**Answer: D** ($16$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_from_wrong_count (multiplies the mean by 3 instead of 4, getting a required total of 45, and reports $45 - 44 = 1$)",
  "B": "Student makes misconception: answers_intermediate_value (reports the required total, 60, instead of subtracting the known sum)",
  "C": "Student makes misconception: answers_intermediate_value (reports the known sum, 44, instead of finishing the subtraction)",
  "D": "Correct: finds the required total, 60, subtracts the known sum, 44, and gets a fourth number of 16"
},
"misconception_tag": {
  "A": "total_from_wrong_count",
  "B": "answers_intermediate_value",
  "C": "answers_intermediate_value"
}
```

---

**2. A data set has a range of $15$. The maximum value is $42$. What is the minimum value?**

Step 1: The range is the maximum minus the minimum.
- $\text{range} = \text{maximum} - \text{minimum}$

Step 2: Solve for the minimum.
- $\text{minimum} = 42 - 15 = 27$

**Answer: B** ($27$)

```json
"distractor_logic": {
  "A": "Student makes misconception: range_added_to_wrong_extreme (adds the range to the maximum instead of subtracting, giving 57)",
  "B": "Correct: subtracts the range, 15, from the maximum, 42, for a minimum of 27",
  "C": "Student makes misconception: answers_intermediate_value (reports the given range, 15, as though it were the minimum)",
  "D": "Student makes misconception: range_from_known_values_only (reports the given maximum, 42, as though it were also the minimum)"
},
"misconception_tag": {
  "A": "range_added_to_wrong_extreme",
  "C": "answers_intermediate_value",
  "D": "range_from_known_values_only"
}
```

---

**3. Five numbers have a mean of $12$. Four of them are $6, 9, 13, 17$. What is the fifth number?**

Step 1: Find the total all five numbers must sum to.
- $12 \times 5 = 60$

Step 2: Add the four known numbers.
- $6 + 9 + 13 + 17 = 45$

Step 3: Subtract to find the fifth number.
- $60 - 45 = 15$

**Answer: C** ($15$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_from_wrong_count (multiplies the mean by 4 instead of 5, getting a required total of 48, and reports $48 - 45 = 3$)",
  "B": "Student makes misconception: answers_intermediate_value (reports the required total, 60, instead of subtracting the known sum)",
  "C": "Correct: finds the required total, 60, subtracts the known sum, 45, and gets a fifth number of 15",
  "D": "Student makes misconception: answers_intermediate_value (reports the known sum, 45, instead of finishing the subtraction)"
},
"misconception_tag": {
  "A": "total_from_wrong_count",
  "B": "answers_intermediate_value",
  "D": "answers_intermediate_value"
}
```

---

**4. A data set has a range of $19$. The minimum value is $11$. What is the maximum value?**

Step 1: The range is the maximum minus the minimum.
- $\text{range} = \text{maximum} - \text{minimum}$

Step 2: Solve for the maximum.
- $\text{maximum} = 19 + 11 = 30$

**Answer: A** ($30$)

```json
"distractor_logic": {
  "A": "Correct: adds the range, 19, to the minimum, 11, for a maximum of 30",
  "B": "Student makes misconception: range_added_to_wrong_extreme (subtracts the minimum from the range, 19 minus 11, instead of adding)",
  "C": "Student makes misconception: answers_intermediate_value (reports the given range, 19, as though it were the maximum)",
  "D": "Student makes misconception: range_from_known_values_only (reports the given minimum, 11, as though it were also the maximum)"
},
"misconception_tag": {
  "B": "range_added_to_wrong_extreme",
  "C": "answers_intermediate_value",
  "D": "range_from_known_values_only"
}
```

---

**5. Six numbers have a mean of $20$. Five of them are $14, 18, 22, 24, 26$. What is the sixth number?**

Step 1: Find the total all six numbers must sum to.
- $20 \times 6 = 120$

Step 2: Add the five known numbers.
- $14 + 18 + 22 + 24 + 26 = 104$

Step 3: Subtract to find the sixth number.
- $120 - 104 = 16$

**Answer: D** ($16$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_from_wrong_count (multiplies the mean by 5 instead of 6, getting a required total of 100, and reports $100 - 104 = -4$)",
  "B": "Student makes misconception: answers_intermediate_value (reports the required total, 120, instead of subtracting the known sum)",
  "C": "Student makes misconception: answers_intermediate_value (reports the known sum, 104, instead of finishing the subtraction)",
  "D": "Correct: finds the required total, 120, subtracts the known sum, 104, and gets a sixth number of 16"
},
"misconception_tag": {
  "A": "total_from_wrong_count",
  "B": "answers_intermediate_value",
  "C": "answers_intermediate_value"
}
```

---

**6. A data set has values $12, 18, 25$, plus one unknown value. The range of all four values is $30$. If the unknown value is greater than all three known values, what is it?**

Step 1: Since the unknown value is the greatest, it becomes the new maximum, and the known minimum, $12$, stays the minimum.

Step 2: The range is the maximum minus the minimum.
- $\text{unknown} - 12 = 30$

Step 3: Solve.
- $\text{unknown} = 30 + 12 = 42$

**Answer: B** ($42$)

```json
"distractor_logic": {
  "A": "Student makes misconception: range_from_known_values_only (computes the range from the three known values alone, 25 minus 12, and reports the known maximum, 25, instead of solving for the unknown)",
  "B": "Correct: since the unknown value is the new maximum, adds the range, 30, to the known minimum, 12, for 42",
  "C": "Student makes misconception: range_added_to_wrong_extreme (adds the range to the known maximum, 25, instead of the minimum, giving 55)",
  "D": "Student makes misconception: answers_intermediate_value (reports the given range, 30, as though it were the unknown value)"
},
"misconception_tag": {
  "A": "range_from_known_values_only",
  "C": "range_added_to_wrong_extreme",
  "D": "answers_intermediate_value"
}
```

---

**7. The mean of seven numbers is $18$. Six of them are $10, 14, 16, 20, 22, 24$. What is the seventh number?**

Step 1: Find the total all seven numbers must sum to.
- $18 \times 7 = 126$

Step 2: Add the six known numbers.
- $10 + 14 + 16 + 20 + 22 + 24 = 106$

Step 3: Subtract to find the seventh number.
- $126 - 106 = 20$

**Answer: C** ($20$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_from_wrong_count (multiplies the mean by 6 instead of 7, getting a required total of 108, and reports $108 - 106 = 2$)",
  "B": "Student makes misconception: answers_intermediate_value (reports the required total, 126, instead of subtracting the known sum)",
  "C": "Correct: finds the required total, 126, subtracts the known sum, 106, and gets a seventh number of 20",
  "D": "Student makes misconception: answers_intermediate_value (reports the known sum, 106, instead of finishing the subtraction)"
},
"misconception_tag": {
  "A": "total_from_wrong_count",
  "B": "answers_intermediate_value",
  "D": "answers_intermediate_value"
}
```

---

**8. A data set has six values with a range of $34$ and a minimum of $8$. Five of the six values are $8, 15, 20, 27, 33$. What is the sixth value?**

Step 1: The known maximum among the five given values is $33$, but the range requires a maximum of $8 + 34 = 42$, which none of the five known values reach.

Step 2: So the sixth value must be the new maximum.
- $42$

**Answer: A** ($42$)

```json
"distractor_logic": {
  "A": "Correct: the range requires a maximum of $8 + 34 = 42$, which no known value reaches, so the sixth value is 42",
  "B": "Student makes misconception: range_from_known_values_only (computes the range from the five known values alone, 33 minus 8, instead of recognizing the sixth value must be a new extreme)",
  "C": "Student makes misconception: range_added_to_wrong_extreme (adds the range to the known maximum, 33, instead of the minimum, giving 67)",
  "D": "Student makes misconception: answers_intermediate_value (reports the given range, 34, as though it were the sixth value)"
},
"misconception_tag": {
  "B": "range_from_known_values_only",
  "C": "range_added_to_wrong_extreme",
  "D": "answers_intermediate_value"
}
```

---

**9. Eight numbers have a mean of $25$. Seven of them are $18, 20, 22, 24, 28, 30, 32$. What is the eighth number?**

Step 1: Find the total all eight numbers must sum to.
- $25 \times 8 = 200$

Step 2: Add the seven known numbers.
- $18 + 20 + 22 + 24 + 28 + 30 + 32 = 174$

Step 3: Subtract to find the eighth number.
- $200 - 174 = 26$

**Answer: D** ($26$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_from_wrong_count (multiplies the mean by 7 instead of 8, getting a required total of 175, and reports $175 - 174 = 1$)",
  "B": "Student makes misconception: answers_intermediate_value (reports the required total, 200, instead of subtracting the known sum)",
  "C": "Student makes misconception: answers_intermediate_value (reports the known sum, 174, instead of finishing the subtraction)",
  "D": "Correct: finds the required total, 200, subtracts the known sum, 174, and gets an eighth number of 26"
},
"misconception_tag": {
  "A": "total_from_wrong_count",
  "B": "answers_intermediate_value",
  "C": "answers_intermediate_value"
}
```

---

**10. A data set's range is $27$. The maximum value is $50$. After a new value of $19$ is added to the set, does the range change, and if so, to what?**

Step 1: Find the current minimum.
- $50 - 27 = 23$

Step 2: Compare the new value, $19$, to the current minimum, $23$. Since $19 < 23$, the new value becomes the new minimum.

Step 3: Recompute the range with the new minimum.
- $50 - 19 = 31$

**Answer: B** (yes, the range increases to $31$)

```json
"distractor_logic": {
  "A": "Student makes misconception: range_from_known_values_only (assumes adding one value never changes the range, without checking whether it is a new extreme)",
  "B": "Correct: the new value, 19, is below the current minimum of 23, so it becomes the new minimum, and the range grows to $50 - 19 = 31$",
  "C": "Student makes misconception: range_added_to_wrong_extreme (adds the new value to the maximum, 50 plus 19, instead of subtracting it as the new minimum)",
  "D": "Student makes misconception: answers_intermediate_value (reports the newly found minimum, 23, itself as though it were the new range)"
},
"misconception_tag": {
  "A": "range_from_known_values_only",
  "C": "range_added_to_wrong_extreme",
  "D": "answers_intermediate_value"
}
```

---

#### **Part 5: Extra Practice**

More of the same skill, for a worksheet rather than for the mastery gate. These items are drawn by the worksheet generator and are not part of the 9-of-12 practice gate or the 3-of-4 quiz gate. Worked solutions for them sit at the end of Part 4.

**Basic Level**

1. Four numbers have a mean of $15$. Three of them are $10, 14, 20$. What is the fourth number?
   - A) $1$
   - B) $60$
   - C) $44$
   - D) $16$

2. A data set has a range of $15$. The maximum value is $42$. What is the minimum value?
   - A) $57$
   - B) $27$
   - C) $15$
   - D) $42$

3. Five numbers have a mean of $12$. Four of them are $6, 9, 13, 17$. What is the fifth number?
   - A) $3$
   - B) $60$
   - C) $15$
   - D) $45$

4. A data set has a range of $19$. The minimum value is $11$. What is the maximum value?
   - A) $30$
   - B) $8$
   - C) $19$
   - D) $11$

**Proficient Level** (these require an extra step)

5. Six numbers have a mean of $20$. Five of them are $14, 18, 22, 24, 26$. What is the sixth number?
   - A) $-4$
   - B) $120$
   - C) $104$
   - D) $16$

6. A data set has values $12, 18, 25$, plus one unknown value. The range of all four values is $30$. If the unknown value is greater than all three known values, what is it?
   - A) $25$
   - B) $42$
   - C) $55$
   - D) $30$

7. The mean of seven numbers is $18$. Six of them are $10, 14, 16, 20, 22, 24$. What is the seventh number?
   - A) $2$
   - B) $126$
   - C) $20$
   - D) $106$

**Advanced Level** (these need multiple steps or reverse thinking)

8. A data set has six values with a range of $34$ and a minimum of $8$. Five of the six values are $8, 15, 20, 27, 33$. What is the sixth value?
   - A) $42$
   - B) $25$
   - C) $67$
   - D) $34$

9. Eight numbers have a mean of $25$. Seven of them are $18, 20, 22, 24, 28, 30, 32$. What is the eighth number?
   - A) $1$
   - B) $200$
   - C) $174$
   - D) $26$

10. A data set's range is $27$. The maximum value is $50$. After a new value of $19$ is added to the set, does the range change, and if so, to what?
    - A) No, the range stays $27$, since only one value was added.
    - B) Yes, the range increases to $31$.
    - C) Yes, the range increases to $69$.
    - D) Yes, the range decreases to $23$.
