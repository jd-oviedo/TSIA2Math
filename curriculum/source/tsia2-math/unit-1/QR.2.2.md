---
topic_name: "Multi-step proportion problems"
unit_number: 1
sequence_in_unit: 6
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "QR"
keywords: ["proportion", "multi-step", "unit rate", "scale factor", "alligation", "relative speed", "cross multiplication"]
---

# QR.2.2 - Multi-Step Proportion Problems

**Topic ID:** QR.2.2  
**Unit:** 1  
**Strand:** QR (Quantitative Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### One More Step Than You Expect

In QR.2.1 you scaled a ratio and you were done. One division, one multiplication, answer.

This topic is the same machinery with one extra step bolted on the end. The scaling still works exactly the way it did. What changes is that the number you get from the scaling is not what the question asked for. You have to do something with it.

That is the whole difficulty, and it is worth saying plainly: **these problems are not harder to compute. They are harder to finish.** The arithmetic is the easy part. Knowing that you are not done yet is the hard part.

---

##### The Mistake That Costs the Most Points

You stop one step early.

A pump moves 9 gallons every 2 minutes. How many gallons in 30 minutes?

You find the scale factor: $30 \div 2 = 15$. You write down 15.

15 is a real number that you computed correctly, and it is not the answer. It is the number of 2-minute chunks in half an hour. The gallons are $9 \times 15 = 135$.

Here is why this error is so expensive. A wrong answer from bad arithmetic feels wrong. You sense it. But an answer you stopped early on feels *finished*, because you did compute something and it was right. There is no internal alarm.

So you have to build the alarm yourself. **Before you bubble anything, reread the last line of the question and check that your number has the right units.** The question said gallons. 15 is not gallons, it is chunks. That check takes three seconds and it is the single highest-value habit in this topic.

---

##### The Method

**Step 1:** Find the scale factor or the unit rate, whichever gives friendlier arithmetic.  
**Step 2:** Scale to the quantity the problem is built around.  
**Step 3:** Do whatever the question asks you to do *with* that quantity.  
**Step 4:** Check the units against the question.

Step 3 is the one that is new. Steps 1 and 2 you already own.

**Example 1:** A printer prints 5 pages every 2 minutes. How many pages in 14 minutes?

- Step 1: Scale factor is $14 \div 2 = 7$.
- Step 2: Pages are $5 \times 7 = 35$.
- Step 3: The question asked for pages. Nothing further to do.
- Step 4: 35 is a page count. Units match.

This one only needed two steps, and that is fine. Not every problem uses all four. The method does not break when a step is empty.

**Example 2:** A fruit punch mixes juice and soda in a $3:5$ ratio. A batch is 32 liters. Juice costs \$2 per liter. What does the juice in one batch cost?

- Step 1: The problem gives a total, so add the parts. $3 + 5 = 8$ parts, and $32 \div 8 = 4$ liters per part.
- Step 2: Juice is 3 parts, so $3 \times 4 = 12$ liters of juice.
- Step 3: Now the extra step. The question asked for a **cost**, not a volume. $12 \times 2 = 24$.
- Step 4: The answer is \$24, and dollars is what was asked for.

Notice how many correct-looking numbers this problem generates on the way: 8, 4, 12, 20. Every one of them is a real quantity. Only one of them is the answer.

---

##### Skipping the Division

There is a second error worth naming, and it is pure mechanics.

A tank leaks 7 liters every 4 hours. How long to leak 42 liters?

The setup is $\frac{7}{4} = \frac{42}{t}$. Cross-multiplying gives $7t = 4 \times 42 = 168$, so $t = 168 \div 7 = 24$ hours.

The error is writing down 168. The student cross-multiplied correctly and then never divided. **Cross-multiplication produces an equation, not an answer.** You still have to solve it.

If you prefer to avoid cross-multiplication entirely, you can: $42 \div 7 = 6$, so the tank leaks six times over, and $6 \times 4 = 24$ hours. Same answer, no equation to forget to solve. Use whichever you trust more under time pressure.

---

##### Two Things Changing at Once

**Example 3:** 5 machines produce 240 parts in 3 hours. How many parts do 8 machines produce in 5 hours?

Both the machine count and the time changed. Scale for one and you get a wrong answer that looks reasonable.

Reduce to the smallest unit first: one machine, one hour.

- $240 \div 5 = 48$ parts per hour for the whole line, then $48 \div 3 = 16$ parts per machine per hour.
- Now build back up: $16 \times 8 \times 5 = 640$ parts.

Check the direction. More machines and more time should mean more parts, and $640 > 240$. Good.

If you had scaled only the machines you would have got $240 \times \frac{8}{5} = 384$. If you had scaled only the time you would have got $400$. Both are the answer to a question nobody asked.

---

##### Catch-Up Problems

**Example 4:** Two cyclists leave the same point in the same direction, one at 12 mph and one at 18 mph. How far apart are they after 40 minutes?

The trap is using 18, or using $12 + 18 = 30$. Neither describes the gap.

The gap grows at the **difference** of the speeds, because they are travelling the same way: $18 - 12 = 6$ mph.

Then watch the units. The speeds are per hour and the question is in minutes, so convert: 40 minutes is $\frac{40}{60} = \frac{2}{3}$ of an hour.

$6 \times \frac{2}{3} = 4$ miles.

**Same direction, subtract. Opposite directions, add.** And convert the time before you multiply, never after.

---

##### Working Backward From a Difference

**Example 5:** Cashews to almonds is $2:7$ by weight. There are 200 g more almonds than cashews. What does the bag weigh?

You are given a *difference*, not a total, so add the parts is the wrong first move.

The difference in parts is $7 - 2 = 5$ parts, and that 5 parts is the 200 g.

- $200 \div 5 = 40$ g per part.
- Total is $2 + 7 = 9$ parts, so $9 \times 40 = 360$ g.

Check: cashews $2 \times 40 = 80$, almonds $7 \times 40 = 280$. The difference is $280 - 80 = 200$, and the total is $360$. Both hold.

**Match what you divide by to what you were given.** Given a total, divide by the sum of the parts. Given a difference, divide by the difference of the parts.

---

##### The Four Traps

1. **Stopping one step early.** The scale factor, the unit rate, and the per-part value are tools. Check your units against the question before you answer.
2. **Cross-multiplying and not solving.** $7t = 168$ is not $t = 168$.
3. **Scaling only one of two changes.** When machines and hours both change, reduce to one machine for one hour first.
4. **Dividing by the wrong parts number.** A total means divide by the sum. A difference means divide by the difference.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. A printer prints $5$ pages every $2$ minutes. At this rate, how many pages does it print in $14$ minutes?
   - A) $7$
   - B) $17$
   - C) $35$
   - D) $70$

2. Four identical notebooks cost \$18. At the same rate, what do $10$ notebooks cost?
   - A) \$45
   - B) \$24
   - C) \$180
   - D) \$4.50

3. A recipe for $6$ servings uses $9$ cups of broth. How many cups of broth are needed for $10$ servings?
   - A) $13$ cups
   - B) $15$ cups
   - C) $1.5$ cups
   - D) $90$ cups

4. On a map, $2$ inches represents $25$ miles. How many inches represent $150$ miles?
   - A) $300$ inches
   - B) $127$ inches
   - C) $6$ inches
   - D) $12$ inches

**Proficient Level** (these require an extra step)

5. A fruit punch mixes juice and soda in a $3:5$ ratio. One batch contains $32$ liters of punch. If juice costs \$2 per liter, what is the cost of the juice in one batch?
   - A) \$24
   - B) \$12
   - C) \$40
   - D) \$38.40

6. Two cyclists leave the same point at the same time, riding in the same direction. One rides at $12$ miles per hour and the other at $18$ miles per hour. How far apart are they after $40$ minutes?
   - A) $20$ miles
   - B) $4$ miles
   - C) $240$ miles
   - D) $12$ miles

7. A tank leaks $7$ liters every $4$ hours. At this rate, how long does it take to leak $42$ liters?
   - A) $168$ hours
   - B) $6$ hours
   - C) $24$ hours
   - D) $73.5$ hours

**Advanced Level** (these need multiple steps or reverse thinking)

8. A shop blends coffee costing \$8 per kg with coffee costing \$13 per kg to produce $30$ kg of blend worth \$10 per kg. How many kilograms of the \$13 coffee are used?
   - A) $6$ kg
   - B) $20$ kg
   - C) $18$ kg
   - D) $12$ kg

9. Five machines produce $240$ parts in $3$ hours. Working at the same rate per machine, how many parts do $8$ machines produce in $5$ hours?
   - A) $384$
   - B) $640$
   - C) $16$
   - D) $90$

10. A trail mix uses cashews and almonds in a $2:7$ ratio by weight. A bag contains $200$ grams more almonds than cashews. What is the total weight of the bag?
    - A) $280$ grams
    - B) $40$ grams
    - C) $360$ grams
    - D) $1800$ grams

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

A pump moves $9$ gallons every $2$ minutes. At this rate, how many gallons does it move in $30$ minutes?

- A) $15$ gallons
- B) $135$ gallons
- C) $270$ gallons
- D) $37$ gallons

**Item 2**

Three kilograms of rice cost \$7.50. At the same rate, what do $8$ kilograms cost?

- A) \$60
- B) \$2.50
- C) \$20
- D) \$12.50

**Item 3**

Two runners leave the same point at the same time, running in the same direction, one at $6$ miles per hour and one at $10$ miles per hour. How far apart are they after $45$ minutes?

- A) $7.5$ miles
- B) $12$ miles
- C) $180$ miles
- D) $3$ miles

**Item 4**

A class has boys and girls in a $4:7$ ratio. There are $12$ more girls than boys. How many students are in the class in total?

- A) $28$
- B) $4$
- C) $44$
- D) $132$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. A printer prints $5$ pages every $2$ minutes. At this rate, how many pages does it print in $14$ minutes?**

Step 1: Find the scale factor.
- $14 \div 2 = 7$

Step 2: Scale the pages.
- $5 \times 7 = 35$

Step 3: Check the units. The question asked for pages, and 35 is a page count.

**Answer: C** ($35$)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (divides 14 by 2 to get the scale factor of 7 and reports that instead of scaling the pages)",
  "B": "Student makes misconception: adds_instead_of_scales (sees minutes rise from 2 to 14, a gain of 12, and adds that same 12 to the 5 pages, producing 17)",
  "C": "Correct: divides 14 by 2 to find a scale factor of 7, then multiplies the 5 pages by 7 to get 35",
  "D": "Student makes misconception: proportional_division_step_skipped (multiplies 5 by 14 and never divides by the 2 minutes, producing 70)"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "B": "adds_instead_of_scales",
  "D": "proportional_division_step_skipped"
}
```

---

**2. Four identical notebooks cost \$18. At the same rate, what do $10$ notebooks cost?**

Step 1: Find the unit rate.
- $18 \div 4 = 4.50$, so one notebook is \$4.50

Step 2: Scale up to ten notebooks.
- $10 \times 4.50 = 45$

Step 3: Check the units. The question asked for a cost, and \$45 is a cost.

**Answer: A** (\$45)

```json
"distractor_logic": {
  "A": "Correct: divides 18 by 4 to find a unit rate of 4.50 per notebook, then multiplies by 10 to get 45",
  "B": "Student makes misconception: adds_instead_of_scales (sees notebooks rise from 4 to 10, a gain of 6, and adds that same 6 to the 18, producing 24)",
  "C": "Student makes misconception: proportional_division_step_skipped (multiplies 18 by 10 and never divides by the 4 notebooks, producing 180)",
  "D": "Student makes misconception: answers_intermediate_value (reports the 4.50 unit rate as the answer instead of scaling it up to 10 notebooks)"
},
"misconception_tag": {
  "B": "adds_instead_of_scales",
  "C": "proportional_division_step_skipped",
  "D": "answers_intermediate_value"
}
```

---

**3. A recipe for $6$ servings uses $9$ cups of broth. How many cups of broth are needed for $10$ servings?**

Step 1: Find the unit rate. The scale factor $10 \div 6$ is not clean, so work per serving instead.
- $9 \div 6 = 1.5$ cups per serving

Step 2: Scale up to ten servings.
- $10 \times 1.5 = 15$

Step 3: Check. More servings should need more broth, and $15 > 9$. Good.

**Answer: B** ($15$ cups)

```json
"distractor_logic": {
  "A": "Student makes misconception: adds_instead_of_scales (sees servings rise from 6 to 10, a gain of 4, and adds that same 4 to the 9 cups, producing 13)",
  "B": "Correct: divides 9 by 6 to find a unit rate of 1.5 cups per serving, then multiplies by 10 to get 15",
  "C": "Student makes misconception: answers_intermediate_value (reports the 1.5 cups per serving unit rate as the answer instead of scaling it to 10 servings)",
  "D": "Student makes misconception: proportional_division_step_skipped (multiplies 9 by 10 and never divides by the 6 servings, producing 90)"
},
"misconception_tag": {
  "A": "adds_instead_of_scales",
  "C": "answers_intermediate_value",
  "D": "proportional_division_step_skipped"
}
```

---

**4. On a map, $2$ inches represents $25$ miles. How many inches represent $150$ miles?**

Step 1: Find the scale factor from the miles, since miles is the quantity you were given.
- $150 \div 25 = 6$

Step 2: Scale the inches.
- $2 \times 6 = 12$

Step 3: Check the units. The question asked for inches, and 12 is an inch count. The 6 was a scale factor, not a length.

**Answer: D** ($12$ inches)

```json
"distractor_logic": {
  "A": "Student makes misconception: proportional_division_step_skipped (multiplies 2 by 150 and never divides by the 25 miles, producing 300)",
  "B": "Student makes misconception: adds_instead_of_scales (sees miles rise from 25 to 150, a gain of 125, and adds that same 125 to the 2 inches, producing 127)",
  "C": "Student makes misconception: answers_intermediate_value (divides 150 by 25 to get the scale factor of 6 and reports that instead of scaling the inches)",
  "D": "Correct: divides 150 by 25 to find a scale factor of 6, then multiplies the 2 inches by 6 to get 12"
},
"misconception_tag": {
  "A": "proportional_division_step_skipped",
  "B": "adds_instead_of_scales",
  "C": "answers_intermediate_value"
}
```

---

**Proficient Level**

**5. A fruit punch mixes juice and soda in a $3:5$ ratio. One batch contains $32$ liters of punch. If juice costs \$2 per liter, what is the cost of the juice in one batch?**

Step 1: The problem gives a total, so add the parts.
- $3 + 5 = 8$ parts, and $32 \div 8 = 4$ liters per part

Step 2: Find the juice volume. Juice is 3 parts.
- $3 \times 4 = 12$ liters of juice

Step 3: The question asked for a cost, not a volume.
- $12 \times 2 = 24$

Step 4: Check. Soda is $5 \times 4 = 20$ liters, and $12 + 20 = 32$. The split is right, and \$24 is a cost.

**Answer: A** (\$24)

```json
"distractor_logic": {
  "A": "Correct: adds 3 and 5 for 8 parts, divides 32 by 8 to get 4 liters per part, takes the 3 juice parts for 12 liters, then multiplies by the 2 per liter to get 24",
  "B": "Student makes misconception: answers_intermediate_value (computes the 12 liters of juice correctly and reports that, never applying the per-liter cost)",
  "C": "Student makes misconception: reads_wrong_category (works the 5 soda parts instead of the 3 juice parts, reaching 20 liters and a cost of 40)",
  "D": "Student makes misconception: part_whole_confusion (treats the part-to-part 3 to 5 as a part-to-whole fraction and takes 3/5 of the 32 liters, reaching 19.2 liters and a cost of 38.40)"
},
"misconception_tag": {
  "B": "answers_intermediate_value",
  "C": "reads_wrong_category",
  "D": "part_whole_confusion"
}
```

---

**6. Two cyclists leave the same point at the same time, riding in the same direction. One rides at $12$ miles per hour and the other at $18$ miles per hour. How far apart are they after $40$ minutes?**

Step 1: They travel the same way, so the gap grows at the difference of the speeds.
- $18 - 12 = 6$ miles per hour

Step 2: Convert the time, because the speeds are per hour.
- $40$ minutes $= \frac{40}{60} = \frac{2}{3}$ hour

Step 3: Multiply.
- $6 \times \frac{2}{3} = 4$ miles

Step 4: Check. In $\frac{2}{3}$ hour the first rides $8$ miles and the second rides $12$ miles, and $12 - 8 = 4$. Correct.

**Answer: B** ($4$ miles)

```json
"distractor_logic": {
  "A": "Student makes misconception: adds_instead_of_subtracts (adds the speeds to 30 miles per hour as though the riders were moving apart in opposite directions, then multiplies by 2/3 hour to get 20)",
  "B": "Correct: subtracts for a closing speed of 6 miles per hour, converts 40 minutes to 2/3 hour, and multiplies to get 4 miles",
  "C": "Student makes misconception: inverts_conversion_direction (uses the 40 minutes directly against an hourly rate without dividing by 60, computing 6 times 40 to get 240)",
  "D": "Student makes misconception: relative_speed_ignored (uses the faster rider's 18 miles per hour alone rather than the 6 mile per hour gap, producing 12)"
},
"misconception_tag": {
  "A": "adds_instead_of_subtracts",
  "C": "inverts_conversion_direction",
  "D": "relative_speed_ignored"
}
```

---

**7. A tank leaks $7$ liters every $4$ hours. At this rate, how long does it take to leak $42$ liters?**

Step 1: Find how many times over the 7 liters is leaked.
- $42 \div 7 = 6$

Step 2: Each of those takes 4 hours.
- $6 \times 4 = 24$ hours

Step 3: Check. In 24 hours the tank leaks $6$ lots of $7$ liters, which is $42$. Correct.

**Answer: C** ($24$ hours)

```json
"distractor_logic": {
  "A": "Student makes misconception: proportional_division_step_skipped (cross-multiplies to 4 times 42 for 168 and never divides by the 7 liters)",
  "B": "Student makes misconception: answers_intermediate_value (divides 42 by 7 to get 6 and reports it, never multiplying by the 4 hours)",
  "C": "Correct: divides 42 by 7 to find the leak repeats 6 times, then multiplies by the 4 hours to get 24",
  "D": "Student makes misconception: inverts_conversion_direction (multiplies 42 by the 7 over 4 rate instead of dividing by it, producing 73.5)"
},
"misconception_tag": {
  "A": "proportional_division_step_skipped",
  "B": "answers_intermediate_value",
  "D": "inverts_conversion_direction"
}
```

---

**Advanced Level**

**8. A shop blends coffee costing \$8 per kg with coffee costing \$13 per kg to produce $30$ kg of blend worth \$10 per kg. How many kilograms of the \$13 coffee are used?**

Step 1: Find each coffee's distance from the blend price.
- Cheap: $10 - 8 = 2$
- Expensive: $13 - 10 = 3$

Step 2: The parts go to the *opposite* coffee. A blend priced closer to the cheap coffee must contain more of it, so cheap gets the 3 and expensive gets the 2.
- Cheap to expensive is $3:2$

Step 3: Split the 30 kg.
- $3 + 2 = 5$ parts, and $30 \div 5 = 6$ kg per part
- Expensive is 2 parts, so $2 \times 6 = 12$ kg

Step 4: Check. Cheap is $3 \times 6 = 18$ kg. Total cost is $18 \times 8 + 12 \times 13 = 144 + 156 = 300$, and $300 \div 30 = 10$ per kg. Correct.

**Answer: D** ($12$ kg)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (divides 30 by the 5 total parts to get 6 kg per part and reports that instead of taking the 2 expensive parts)",
  "B": "Student makes misconception: part_whole_confusion (treats the part-to-part 2 to 3 as a part-to-whole fraction and takes 2/3 of the 30 kg, producing 20)",
  "C": "Student makes misconception: alligation_ratio_misapplied (assigns each distance to the coffee it was measured from rather than to the opposite one, giving the expensive coffee 3 parts and producing 18)",
  "D": "Correct: finds distances of 2 and 3, assigns them crosswise for a cheap to expensive ratio of 3 to 2, then takes 2 of the 5 parts of 30 kg to get 12"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "B": "part_whole_confusion",
  "C": "alligation_ratio_misapplied"
}
```

---

**9. Five machines produce $240$ parts in $3$ hours. Working at the same rate per machine, how many parts do $8$ machines produce in $5$ hours?**

Step 1: Reduce to one machine for one hour.
- $240 \div 5 = 48$ parts per hour for the line
- $48 \div 3 = 16$ parts per machine per hour

Step 2: Build back up to 8 machines for 5 hours.
- $16 \times 8 \times 5 = 640$ parts

Step 3: Check the direction. More machines and more time should give more parts, and $640 > 240$. Correct.

**Answer: B** ($640$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_second_component (scales for the machine count alone, computing 240 times 8/5 for 384, and never scales for the change from 3 hours to 5)",
  "B": "Correct: reduces to 16 parts per machine per hour, then multiplies by 8 machines and 5 hours to get 640",
  "C": "Student makes misconception: answers_intermediate_value (computes the per machine per hour rate of 16 and reports it instead of scaling up)",
  "D": "Student makes misconception: inverts_conversion_direction (inverts both scale factors, computing 240 times 5/8 times 3/5 for 90, fewer parts from more machines and more time)"
},
"misconception_tag": {
  "A": "omits_second_component",
  "C": "answers_intermediate_value",
  "D": "inverts_conversion_direction"
}
```

---

**10. A trail mix uses cashews and almonds in a $2:7$ ratio by weight. A bag contains $200$ grams more almonds than cashews. What is the total weight of the bag?**

Step 1: You were given a difference, so use the difference in parts.
- $7 - 2 = 5$ parts, and those 5 parts are the 200 grams

Step 2: Find one part.
- $200 \div 5 = 40$ grams per part

Step 3: The question asked for the total.
- $2 + 7 = 9$ parts, so $9 \times 40 = 360$ grams

Step 4: Check. Cashews are $2 \times 40 = 80$ and almonds are $7 \times 40 = 280$. The difference is $200$ and the total is $360$. Both hold.

**Answer: C** ($360$ grams)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_second_component (computes the 280 grams of almonds and reports it as the bag weight, leaving out the cashews)",
  "B": "Student makes misconception: answers_intermediate_value (divides 200 by the 5 part difference to get 40 grams per part and reports that instead of scaling to the 9 total parts)",
  "C": "Correct: divides the 200 gram difference by the 5 part difference for 40 grams per part, then multiplies by the 9 total parts to get 360",
  "D": "Student makes misconception: multiplies_instead_of_divides (multiplies the 200 grams by the 9 total parts instead of first dividing by the 5 part difference, producing 1800)"
},
"misconception_tag": {
  "A": "omits_second_component",
  "B": "answers_intermediate_value",
  "D": "multiplies_instead_of_divides"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: A pump moves $9$ gallons every $2$ minutes. At this rate, how many gallons does it move in $30$ minutes?**

Step 1: Find the scale factor.
- $30 \div 2 = 15$

Step 2: Scale the gallons.
- $9 \times 15 = 135$

Step 3: Check the units. The question asked for gallons, and 15 was a count of 2-minute chunks.

**Answer: B** ($135$ gallons)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (divides 30 by 2 to get the scale factor of 15 and reports that instead of scaling the gallons)",
  "B": "Correct: divides 30 by 2 to find a scale factor of 15, then multiplies the 9 gallons by 15 to get 135",
  "C": "Student makes misconception: proportional_division_step_skipped (multiplies 9 by 30 and never divides by the 2 minutes, producing 270)",
  "D": "Student makes misconception: adds_instead_of_scales (sees minutes rise from 2 to 30, a gain of 28, and adds that same 28 to the 9 gallons, producing 37)"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "C": "proportional_division_step_skipped",
  "D": "adds_instead_of_scales"
}
```

---

**Item 2: Three kilograms of rice cost \$7.50. At the same rate, what do $8$ kilograms cost?**

Step 1: Find the unit rate.
- $7.50 \div 3 = 2.50$, so one kilogram is \$2.50

Step 2: Scale up to eight kilograms.
- $8 \times 2.50 = 20$

Step 3: Check. More rice should cost more, and \$20 is more than \$7.50. Good.

**Answer: C** (\$20)

```json
"distractor_logic": {
  "A": "Student makes misconception: proportional_division_step_skipped (multiplies 7.50 by 8 and never divides by the 3 kilograms, producing 60)",
  "B": "Student makes misconception: answers_intermediate_value (reports the 2.50 per kilogram unit rate as the answer instead of scaling it to 8 kilograms)",
  "C": "Correct: divides 7.50 by 3 to find a unit rate of 2.50 per kilogram, then multiplies by 8 to get 20",
  "D": "Student makes misconception: adds_instead_of_scales (sees kilograms rise from 3 to 8, a gain of 5, and adds that same 5 to the 7.50, producing 12.50)"
},
"misconception_tag": {
  "A": "proportional_division_step_skipped",
  "B": "answers_intermediate_value",
  "D": "adds_instead_of_scales"
}
```

---

**Item 3: Two runners leave the same point at the same time, running in the same direction, one at $6$ miles per hour and one at $10$ miles per hour. How far apart are they after $45$ minutes?**

Step 1: Same direction, so subtract for the closing speed.
- $10 - 6 = 4$ miles per hour

Step 2: Convert the time.
- $45$ minutes $= \frac{45}{60} = 0.75$ hour

Step 3: Multiply.
- $4 \times 0.75 = 3$ miles

Step 4: Check. The first runs $4.5$ miles, the second runs $7.5$ miles, and $7.5 - 4.5 = 3$. Correct.

**Answer: D** ($3$ miles)

```json
"distractor_logic": {
  "A": "Student makes misconception: relative_speed_ignored (uses the faster runner's 10 miles per hour alone rather than the 4 mile per hour gap, producing 7.5)",
  "B": "Student makes misconception: adds_instead_of_subtracts (adds the speeds to 16 miles per hour as though the runners were moving apart in opposite directions, then multiplies by 0.75 hour to get 12)",
  "C": "Student makes misconception: inverts_conversion_direction (uses the 45 minutes directly against an hourly rate without dividing by 60, computing 4 times 45 to get 180)",
  "D": "Correct: subtracts for a closing speed of 4 miles per hour, converts 45 minutes to 0.75 hour, and multiplies to get 3 miles"
},
"misconception_tag": {
  "A": "relative_speed_ignored",
  "B": "adds_instead_of_subtracts",
  "C": "inverts_conversion_direction"
}
```

---

**Item 4: A class has boys and girls in a $4:7$ ratio. There are $12$ more girls than boys. How many students are in the class in total?**

Step 1: You were given a difference, so use the difference in parts.
- $7 - 4 = 3$ parts, and those 3 parts are the 12 students

Step 2: Find one part.
- $12 \div 3 = 4$ students per part

Step 3: The question asked for the total.
- $4 + 7 = 11$ parts, so $11 \times 4 = 44$

Step 4: Check. Boys are $4 \times 4 = 16$ and girls are $7 \times 4 = 28$. The difference is $12$ and the total is $44$. Both hold.

**Answer: C** ($44$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_second_component (computes the 28 girls and reports that as the class size, leaving out the boys)",
  "B": "Student makes misconception: answers_intermediate_value (divides 12 by the 3 part difference to get 4 students per part and reports that instead of scaling to the 11 total parts)",
  "C": "Correct: divides the 12 student difference by the 3 part difference for 4 per part, then multiplies by the 11 total parts to get 44",
  "D": "Student makes misconception: multiplies_instead_of_divides (multiplies the 12 by the 11 total parts instead of first dividing by the 3 part difference, producing 132)"
},
"misconception_tag": {
  "A": "omits_second_component",
  "B": "answers_intermediate_value",
  "D": "multiplies_instead_of_divides"
}
```
