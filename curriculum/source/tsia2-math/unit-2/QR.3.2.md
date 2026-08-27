---
topic_name: "Identifying expressions that represent rates of change"
unit_number: 2
sequence_in_unit: 1
assessment_layer: "CRC"
estimated_time_minutes: 45
difficulty_band: "Basic"
related_strand: "QR"
keywords: ["rate of change", "slope", "coefficient", "constant term", "per unit", "linear expression", "unit rate"]
---

# QR.3.2 - Identifying Expressions That Represent Rates of Change

**Topic ID:** QR.3.2  
**Unit:** 2  
**Strand:** QR (Quantitative Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### The Number That Rides the Variable

A gym charges a \$40 joining fee plus \$25 a month. In QR.3.1 you learned to write that:

$$C = 25m + 40$$

This topic asks a narrower question about that same expression. **Which number is the rate?**

The answer is $25$, and there is a mechanical way to see it that never fails: **the rate is the number multiplied by the variable.** The $25$ rides on $m$. The $40$ sits by itself.

That is the whole idea. Everything below is practice at not being distracted.

| In $y = mx + b$ | Name | What it means |
|---|---|---|
| $m$, the **coefficient** | rate of change, slope | how much $y$ moves per 1 unit of $x$ |
| $b$, the **constant** | starting value, intercept | where $y$ is when $x$ is $0$ |

Say it with units and it becomes obvious. The \$25 is **dollars per month**: it happens again every month. The \$40 is **dollars**, once. A rate always has a "per" in its units.

---

##### The Mistake That Costs the Most Points

You add the two numbers together.

Looking at $C = 25m + 40$, it is tempting to say the cost is "\$65 per month." That number is not a rate, and it is not anything else either. It is two quantities of different kinds glued together.

Test it. At $m = 1$: $25(1) + 40 = 65$. So \$65 is right for one month, which is exactly why the error survives. Now try $m = 2$: the true cost is $25(2) + 40 = 90$, while "\$65 per month" predicts $130$.

**A rate has to hold for every value, not just the first one.** The joining fee is paid once, so it can never be part of a per-month rate.

The same trap wears two other disguises:

- **Reading the constant as the rate.** "\$40 per month." The $40$ is not attached to $m$, so it does not repeat.
- **Reporting the whole term.** "$25m$ per month." $25m$ is the total membership cost, not the rate. The rate is the $25$ alone, with the variable stripped off.

**Strip the variable and keep the number. That number, with a "per" in its units, is the rate.**

---

##### Negative Rates

A tank holds 200 gallons and drains 8 gallons a minute.

$$V = 200 - 8t$$

The rate of change is $-8$ gallons per minute. The **sign is part of the rate**, and dropping it loses half the meaning: $+8$ describes a tank filling up.

Rewrite it as $V = -8t + 200$ if that helps you see it. Same expression, and now the coefficient is sitting where you expect it.

**A quantity going down has a negative rate.** Draining, cooling, spending, depreciating.

---

##### Rates Hiding in Different Units

**Example 1:** Store A sells rice at 3 pounds for \$7.50. Store B sells it at 5 pounds for \$12. Which has the lower rate per pound?

You cannot compare \$7.50 with \$12 directly. They describe different amounts of rice, so they are not rates at all yet: they are totals.

Divide each into a per-pound rate.

- Store A: $7.50 \div 3 = 2.50$ per pound
- Store B: $12 \div 5 = 2.40$ per pound

Store B is lower.

**Before comparing two rates, put them over the same unit.** Almost every wrong answer in this section comes from comparing two totals that were never comparable.

And keep the order right. Dollars **per pound** means dollars on top. Computing $3 \div 7.50 = 0.40$ gives pounds per dollar, a real quantity answering a different question.

---

##### A Rate Does Not Change With Quantity

**Example 2:** A print shop charges \$0.08 a page plus a \$5 setup fee. A customer says: "the more I print, the cheaper each page gets, so the rate must be dropping."

Half right, and the half that is wrong is the half being tested.

- The **rate** is \$0.08 a page. It never changes.
- The **average cost per page** does fall, because the one-time \$5 spreads over more pages.

At 100 pages the total is $0.08(100) + 5 = 13$, an average of \$0.13 a page. At 500 pages the total is $45$, an average of \$0.09 a page. The average is sliding toward \$0.08 and will never reach it.

**The rate is a property of the expression, not of how much you buy.** What changes is the average, and only because a fixed cost is being divided by a growing number.

---

##### Finding a Rate From Points

When you are given points rather than an expression, the rate is the change in the output divided by the change in the input.

**Example 3:** A relationship contains $(2, 11)$, $(5, 23)$ and $(8, 35)$.

$$\text{rate} = \frac{23 - 11}{5 - 2} = \frac{12}{3} = 4$$

Check it against the other gap: $\frac{35 - 23}{8 - 5} = \frac{12}{3} = 4$. Same, so the rate is constant and the relationship is linear.

Two things to guard. The $12$ on its own is not the rate, it is the rise across three units, and reporting it is the most common slip here. And the division goes **output over input**, never the other way: $\frac{3}{12} = 0.25$ answers a different question.

Subtract in the same order on top and bottom. If you take $23 - 11$ on top, take $5 - 2$ on the bottom, not $2 - 5$.

---

##### The Four Traps

1. **Adding the constant to the coefficient.** \$25 a month plus a \$40 fee is not \$65 a month. Test at two values.
2. **Reading the constant as the rate.** The rate is attached to the variable. The constant is not.
3. **Comparing totals instead of rates.** Put both over the same unit before you compare.
4. **Dropping the sign, or reporting the rise.** A draining tank has a negative rate, and the rise still has to be divided by the run.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. A gym membership costs $C = 25m + 40$ dollars, where $m$ is the number of months. What is the rate of change?
   - A) \$25 per month
   - B) \$40 per month
   - C) \$65 per month
   - D) $25m$ dollars per month

2. A printing job costs $C = 0.15n + 12$ dollars, where $n$ is the number of pages. What is the rate of change?
   - A) \$12 per page
   - B) \$0.15 per page
   - C) \$12.15 per page
   - D) $0.15n$ dollars per page

3. Which expression represents a relationship with a rate of change of $6$?
   - A) $y = 2x + 6$
   - B) $y = 6$
   - C) $y = \frac{x}{6} + 2$
   - D) $y = 6x + 2$

4. A tank holds $200$ gallons and drains steadily, so that $V = 200 - 8t$, where $t$ is minutes. What is the rate of change?
   - A) $200$ gallons per minute
   - B) $8$ gallons per minute
   - C) $-8$ gallons per minute
   - D) $192$ gallons per minute

**Proficient Level** (these require an extra step)

5. Store A sells rice at $3$ pounds for \$7.50. Store B sells rice at $5$ pounds for \$12. Which store has the lower rate per pound?
   - A) Store A, at \$2.50 per pound
   - B) Store B, at \$2.40 per pound
   - C) Store A, because \$7.50 is less than \$12
   - D) Store A, at \$0.40 per pound

6. A print shop charges \$0.08 per page plus a one-time \$5 setup fee. As a customer orders more pages, what happens to the rate of change?
   - A) It stays \$0.08 per page, though the average cost per page falls as the setup fee spreads out.
   - B) It falls, because each page costs less as the order grows.
   - C) It is \$5.08 per page and stays there.
   - D) It is \$5 per page and stays there.

7. A relationship contains the points $(2, 11)$, $(5, 23)$ and $(8, 35)$. What is the rate of change?
   - A) $12$
   - B) $0.25$
   - C) $4$
   - D) $-4$

**Advanced Level** (these need multiple steps or reverse thinking)

8. One car service charges $C = 45 + 0.60m$ and a rival charges $C = 30 + 0.85m$, where $m$ is miles. Which statement about their rates of change is correct?
   - A) The first has the greater rate, because \$45 is more than \$30.
   - B) The second has the greater rate, at \$0.85 per mile.
   - C) The second has the greater rate, at \$30 per mile.
   - D) The first has the greater rate, at \$45.60 per mile.

9. One machine fills $240$ bottles in $8$ minutes. A second fills $380$ bottles in $10$ minutes. Which machine is faster, and at what rate?
   - A) The second, at $380$ bottles per minute
   - B) The first, at $30$ bottles per minute
   - C) The first, at $0.033$ minutes per bottle
   - D) The second, at $38$ bottles per minute

10. A phone plan costs $C = 0.05t + 15$ dollars, where $t$ is minutes of calls. A student says the rate of change is \$15.05 per minute. What is the error, and what is the rate?
    - A) The student added the flat fee to the rate; the rate is \$0.05 per minute.
    - B) There is no error; \$15.05 per minute is correct.
    - C) The student swapped the two numbers; the rate is \$15 per minute.
    - D) The student used the wrong unit; the rate is \$0.05 per hour.

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

For the relationship $y = 9x + 4$, what is the rate of change?

- A) $4$
- B) $9$
- C) $13$
- D) $9x$

**Item 2**

A pool drains so that $V = 500 - 12t$, where $t$ is minutes. What is the rate of change?

- A) $500$ gallons per minute
- B) $12$ gallons per minute
- C) $488$ gallons per minute
- D) $-12$ gallons per minute

**Proficient Level**

**Item 3**

A relationship contains the points $(1, 7)$ and $(4, 19)$. What is the rate of change?

- A) $12$
- B) $0.25$
- C) $4$
- D) $-4$

**Item 4**

Store P sells flour at $4$ kilograms for \$10. Store Q sells flour at $6$ kilograms for \$14.40. Which store has the lower rate per kilogram?

- A) Store P, because \$10 is less than \$14.40
- B) Store P, at \$2.50 per kilogram
- C) Store Q, at \$2.40 per kilogram
- D) Store Q, at \$0.42 per kilogram

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. A gym membership costs $C = 25m + 40$ dollars, where $m$ is the number of months. What is the rate of change?**

Step 1: Find the number attached to the variable.
- $25$ rides on $m$; $40$ stands alone.

Step 2: Strip the variable and attach the units.
- \$25 per month

Step 3: Check at two values. At $m = 1$ the cost is $65$, at $m = 2$ it is $90$, and the gap is $25$. The rate holds.

**Answer: A** (\$25 per month)

```json
"distractor_logic": {
  "A": "Correct: takes the coefficient of m, which is 25, giving a rate of 25 dollars per month",
  "B": "Student makes misconception: constant_read_as_rate (reports the 40 joining fee as the monthly rate, though it is not attached to m and is paid only once)",
  "C": "Student makes misconception: coefficient_plus_constant_as_rate (adds the 25 and the 40 into a single 65 per month, which matches the true cost at one month and overstates it at every month after)",
  "D": "Student makes misconception: variable_term_read_as_rate (reports the whole term 25m rather than isolating its coefficient, giving a total rather than a rate)"
},
"misconception_tag": {
  "B": "constant_read_as_rate",
  "C": "coefficient_plus_constant_as_rate",
  "D": "variable_term_read_as_rate"
}
```

---

**2. A printing job costs $C = 0.15n + 12$ dollars, where $n$ is the number of pages. What is the rate of change?**

Step 1: The variable is $n$, and $0.15$ is multiplied by it.

Step 2: The rate is \$0.15 per page. The \$12 is a one-time charge.

Step 3: Check at two values. At $n = 100$ the cost is $27$, at $n = 200$ it is $42$, and the gap is $15$ for 100 pages, which is \$0.15 each.

**Answer: B** (\$0.15 per page)

```json
"distractor_logic": {
  "A": "Student makes misconception: constant_read_as_rate (reports the 12 dollar setup charge as the per-page rate, though it is not attached to n)",
  "B": "Correct: takes the coefficient of n, which is 0.15, giving a rate of 0.15 dollars per page",
  "C": "Student makes misconception: coefficient_plus_constant_as_rate (adds the 0.15 and the 12 into a single 12.15 per page, which would make 100 pages cost 1215 dollars)",
  "D": "Student makes misconception: variable_term_read_as_rate (reports the whole term 0.15n rather than isolating its coefficient)"
},
"misconception_tag": {
  "A": "constant_read_as_rate",
  "C": "coefficient_plus_constant_as_rate",
  "D": "variable_term_read_as_rate"
}
```

---

**3. Which expression represents a relationship with a rate of change of $6$?**

Step 1: The rate of change is the coefficient of $x$, so look at what multiplies $x$ in each option.

Step 2: Check each.
- $y = 2x + 6$: coefficient $2$, constant $6$
- $y = 6$: no $x$ term at all, so the rate is $0$
- $y = \frac{x}{6} + 2$: coefficient $\frac{1}{6}$
- $y = 6x + 2$: coefficient $6$

**Answer: D** ($y = 6x + 2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_intercept_swap (picks the expression whose constant is 6, assigning the intercept's value to the slope)",
  "B": "Student makes misconception: constant_read_as_rate (reads the bare 6 as the rate, when an expression with no x term has a rate of change of zero)",
  "C": "Student makes misconception: slope_run_over_rise (reads x divided by 6 as a rate of 6, inverting the ratio; its rate is one sixth)",
  "D": "Correct: 6 is the coefficient of x, so y increases by 6 for each 1 unit increase in x"
},
"misconception_tag": {
  "A": "slope_intercept_swap",
  "B": "constant_read_as_rate",
  "C": "slope_run_over_rise"
}
```

---

**4. A tank holds $200$ gallons and drains steadily, so that $V = 200 - 8t$, where $t$ is minutes. What is the rate of change?**

Step 1: Rewrite so the coefficient is easy to see.
- $V = -8t + 200$

Step 2: The coefficient of $t$ is $-8$.

Step 3: Check the sign against the situation. The tank is draining, so the volume falls, so the rate must be negative.

**Answer: C** ($-8$ gallons per minute)

```json
"distractor_logic": {
  "A": "Student makes misconception: constant_read_as_rate (reports the 200 gallon starting volume as the rate, though it is not attached to t)",
  "B": "Student makes misconception: misreads_direction_of_change (finds the magnitude 8 correctly but reports it as positive, describing a tank that is filling rather than draining)",
  "C": "Correct: rewrites as -8t + 200 and reads the coefficient of t as -8 gallons per minute, negative because the tank is emptying",
  "D": "Student makes misconception: coefficient_plus_constant_as_rate (combines the 200 and the 8 into a single 192 and reports that as the rate)"
},
"misconception_tag": {
  "A": "constant_read_as_rate",
  "B": "misreads_direction_of_change",
  "D": "coefficient_plus_constant_as_rate"
}
```

---

**Proficient Level**

**5. Store A sells rice at $3$ pounds for \$7.50. Store B sells rice at $5$ pounds for \$12. Which store has the lower rate per pound?**

Step 1: These are totals for different amounts, so neither is a rate yet. Divide each into dollars per pound.
- Store A: $7.50 \div 3 = 2.50$
- Store B: $12 \div 5 = 2.40$

Step 2: Compare the rates, now that they are over the same unit.
- $2.40 < 2.50$, so Store B is lower.

Step 3: Check. Five pounds at Store A's rate would be $5 \times 2.50 = 12.50$, which is more than Store B's \$12. Correct.

**Answer: B** (Store B, at \$2.40 per pound)

```json
"distractor_logic": {
  "A": "Student makes misconception: misreads_direction_of_change (computes both rates correctly but selects the higher one when the question asked for the lower)",
  "B": "Correct: divides each total by its weight for 2.50 and 2.40 per pound, and Store B's 2.40 is lower",
  "C": "Student makes misconception: rate_not_normalised_to_unit (compares the 7.50 and 12 totals directly, though they cover different amounts of rice and are not rates)",
  "D": "Student makes misconception: slope_run_over_rise (divides 3 pounds by 7.50 dollars, producing 0.40 pounds per dollar rather than dollars per pound)"
},
"misconception_tag": {
  "A": "misreads_direction_of_change",
  "C": "rate_not_normalised_to_unit",
  "D": "slope_run_over_rise"
}
```

---

**6. A print shop charges \$0.08 per page plus a one-time \$5 setup fee. As a customer orders more pages, what happens to the rate of change?**

Step 1: Write the expression. $C = 0.08p + 5$.

Step 2: The rate of change is the coefficient, $0.08$. Nothing in the expression makes it depend on $p$.

Step 3: Separate the rate from the average. At 100 pages the total is $13$, an average of \$0.13 per page. At 500 pages the total is $45$, an average of \$0.09 per page. The average falls because the fixed \$5 is spread wider; the rate itself never moved.

**Answer: A** (It stays \$0.08 per page, though the average cost per page falls)

```json
"distractor_logic": {
  "A": "Correct: the coefficient 0.08 is the rate and does not depend on the number of pages; the average cost per page falls only because the one-time 5 dollars is divided among more pages",
  "B": "Student makes misconception: rate_assumed_quantity_dependent (concludes the per-page rate itself drops as the order grows, confusing the falling average with the constant rate)",
  "C": "Student makes misconception: coefficient_plus_constant_as_rate (adds the 5 dollar setup fee to the 0.08 rate, which would make 100 pages cost 508 dollars)",
  "D": "Student makes misconception: constant_read_as_rate (reports the 5 dollar setup fee as the per-page rate, though it is charged once)"
},
"misconception_tag": {
  "B": "rate_assumed_quantity_dependent",
  "C": "coefficient_plus_constant_as_rate",
  "D": "constant_read_as_rate"
}
```

---

**7. A relationship contains the points $(2, 11)$, $(5, 23)$ and $(8, 35)$. What is the rate of change?**

Step 1: Take the change in the output over the change in the input, using the first two points.
- $\frac{23 - 11}{5 - 2} = \frac{12}{3} = 4$

Step 2: Confirm with the next gap.
- $\frac{35 - 23}{8 - 5} = \frac{12}{3} = 4$

Step 3: Both gaps give $4$, so the rate is constant.

**Answer: C** ($4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (computes the rise of 12 and reports it without dividing by the run of 3, so it describes three units of change rather than one)",
  "B": "Student makes misconception: slope_run_over_rise (divides the run of 3 by the rise of 12, producing 0.25, the reciprocal of the rate)",
  "C": "Correct: divides the rise of 12 by the run of 3 to get 4, confirmed against the second interval",
  "D": "Student makes misconception: subtracts_in_wrong_order (computes 11 minus 23 on top while keeping 5 minus 2 underneath, producing -4 for a relationship that is increasing)"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "B": "slope_run_over_rise",
  "D": "subtracts_in_wrong_order"
}
```

---

**Advanced Level**

**8. One car service charges $C = 45 + 0.60m$ and a rival charges $C = 30 + 0.85m$, where $m$ is miles. Which statement about their rates of change is correct?**

Step 1: Find each rate. It is the coefficient of $m$, not the number in front.
- First: \$0.60 per mile
- Second: \$0.85 per mile

Step 2: Compare.
- $0.85 > 0.60$, so the second has the greater rate.

Step 3: Note what the 45 and 30 are. They are starting charges, and they say nothing about rate. The second service starts cheaper and climbs faster, which is why comparing the two starting values answers a different question.

**Answer: B** (The second has the greater rate, at \$0.85 per mile)

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_intercept_swap (compares the 45 and 30 starting charges as though they were the rates, treating each intercept as a slope)",
  "B": "Correct: compares the coefficients of m, 0.60 against 0.85, so the second service has the greater rate",
  "C": "Student makes misconception: constant_read_as_rate (identifies the second service correctly but reports its 30 dollar starting charge as the per-mile rate)",
  "D": "Student makes misconception: coefficient_plus_constant_as_rate (adds the first service's 45 and 0.60 into a single 45.60 per mile)"
},
"misconception_tag": {
  "A": "slope_intercept_swap",
  "C": "constant_read_as_rate",
  "D": "coefficient_plus_constant_as_rate"
}
```

---

**9. One machine fills $240$ bottles in $8$ minutes. A second fills $380$ bottles in $10$ minutes. Which machine is faster, and at what rate?**

Step 1: The two counts cover different amounts of time, so normalise both to one minute.
- First: $240 \div 8 = 30$ bottles per minute
- Second: $380 \div 10 = 38$ bottles per minute

Step 2: Compare.
- $38 > 30$, so the second is faster.

Step 3: Check. In 10 minutes the first machine would fill $300$ bottles, fewer than the second's $380$. Correct.

**Answer: D** (The second, at $38$ bottles per minute)

```json
"distractor_logic": {
  "A": "Student makes misconception: rate_not_normalised_to_unit (reports the 380 bottle total as though it were a per-minute rate, without dividing by the 10 minutes)",
  "B": "Student makes misconception: misreads_direction_of_change (computes the first machine's 30 bottles per minute correctly but selects it as the faster one)",
  "C": "Student makes misconception: slope_run_over_rise (divides 8 minutes by 240 bottles, producing about 0.033 minutes per bottle rather than bottles per minute)",
  "D": "Correct: divides each count by its time for 30 and 38 bottles per minute, so the second machine is faster"
},
"misconception_tag": {
  "A": "rate_not_normalised_to_unit",
  "B": "misreads_direction_of_change",
  "C": "slope_run_over_rise"
}
```

---

**10. A phone plan costs $C = 0.05t + 15$ dollars, where $t$ is minutes of calls. A student says the rate of change is \$15.05 per minute. What is the error, and what is the rate?**

Step 1: Identify what the student did. $0.05 + 15 = 15.05$, so the coefficient and the constant were added together.

Step 2: Separate them. $0.05$ is attached to $t$ and repeats every minute. $15$ stands alone and is charged once.

Step 3: The rate is \$0.05 per minute.

Step 4: Show why the student's figure cannot be a rate. At \$15.05 per minute, 100 minutes of calls would cost \$1505. The true cost is $0.05(100) + 15 = 20$.

**Answer: A** (The student added the flat fee to the rate; the rate is \$0.05 per minute)

```json
"distractor_logic": {
  "A": "Correct: names the error as adding the 15 dollar flat fee to the 0.05 rate, and gives the rate as the coefficient of t, 0.05 dollars per minute",
  "B": "Student makes misconception: coefficient_plus_constant_as_rate (accepts the sum of the coefficient and the constant as a rate, which would price 100 minutes at 1505 dollars)",
  "C": "Student makes misconception: slope_intercept_swap (treats the 15 dollar monthly charge as the rate and the 0.05 as the starting value)",
  "D": "Student makes misconception: rate_not_normalised_to_unit (keeps the correct number but attaches it to the wrong unit, reporting per hour where the variable counts minutes)"
},
"misconception_tag": {
  "B": "coefficient_plus_constant_as_rate",
  "C": "slope_intercept_swap",
  "D": "rate_not_normalised_to_unit"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: For the relationship $y = 9x + 4$, what is the rate of change?**

Step 1: Find the coefficient of $x$.
- $9$

Step 2: The $4$ is the constant, not the rate.

**Answer: B** ($9$)

```json
"distractor_logic": {
  "A": "Student makes misconception: constant_read_as_rate (reports the constant 4 as the rate, though it is not attached to x)",
  "B": "Correct: the coefficient of x is 9, so y increases by 9 for each 1 unit increase in x",
  "C": "Student makes misconception: coefficient_plus_constant_as_rate (adds the 9 and the 4 into a single 13)",
  "D": "Student makes misconception: variable_term_read_as_rate (reports the whole term 9x rather than isolating its coefficient)"
},
"misconception_tag": {
  "A": "constant_read_as_rate",
  "C": "coefficient_plus_constant_as_rate",
  "D": "variable_term_read_as_rate"
}
```

---

**Item 2: A pool drains so that $V = 500 - 12t$, where $t$ is minutes. What is the rate of change?**

Step 1: Rewrite as $V = -12t + 500$.

Step 2: The coefficient of $t$ is $-12$.

Step 3: The pool is draining, so a negative rate is what the situation requires.

**Answer: D** ($-12$ gallons per minute)

```json
"distractor_logic": {
  "A": "Student makes misconception: constant_read_as_rate (reports the 500 gallon starting volume as the rate)",
  "B": "Student makes misconception: misreads_direction_of_change (finds the magnitude 12 but reports it as positive, describing a pool that is filling)",
  "C": "Student makes misconception: coefficient_plus_constant_as_rate (combines the 500 and the 12 into a single 488)",
  "D": "Correct: rewrites as -12t + 500 and reads the coefficient of t as -12 gallons per minute"
},
"misconception_tag": {
  "A": "constant_read_as_rate",
  "B": "misreads_direction_of_change",
  "C": "coefficient_plus_constant_as_rate"
}
```

---

**Item 3: A relationship contains the points $(1, 7)$ and $(4, 19)$. What is the rate of change?**

Step 1: Change in output over change in input.
- $\frac{19 - 7}{4 - 1} = \frac{12}{3} = 4$

Step 2: Check. From $x = 1$ to $x = 4$ is 3 steps, and $7 + 4 + 4 + 4 = 19$. Correct.

**Answer: C** ($4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (reports the rise of 12 without dividing by the run of 3)",
  "B": "Student makes misconception: slope_run_over_rise (divides the run of 3 by the rise of 12, producing 0.25)",
  "C": "Correct: divides the rise of 12 by the run of 3 to get a rate of 4",
  "D": "Student makes misconception: subtracts_in_wrong_order (computes 7 minus 19 on top while keeping 4 minus 1 underneath, producing -4 for an increasing relationship)"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "B": "slope_run_over_rise",
  "D": "subtracts_in_wrong_order"
}
```

---

**Item 4: Store P sells flour at $4$ kilograms for \$10. Store Q sells flour at $6$ kilograms for \$14.40. Which store has the lower rate per kilogram?**

Step 1: Normalise both to one kilogram.
- Store P: $10 \div 4 = 2.50$
- Store Q: $14.40 \div 6 = 2.40$

Step 2: Compare.
- $2.40 < 2.50$, so Store Q is lower.

Step 3: Check. Six kilograms at Store P's rate would be $15$, more than Store Q's \$14.40. Correct.

**Answer: C** (Store Q, at \$2.40 per kilogram)

```json
"distractor_logic": {
  "A": "Student makes misconception: rate_not_normalised_to_unit (compares the 10 and 14.40 totals directly, though they cover different amounts of flour)",
  "B": "Student makes misconception: misreads_direction_of_change (computes both rates correctly but selects the higher one when the question asked for the lower)",
  "C": "Correct: divides each total by its weight for 2.50 and 2.40 per kilogram, and Store Q's 2.40 is lower",
  "D": "Student makes misconception: slope_run_over_rise (divides 6 kilograms by 14.40 dollars, producing about 0.42 kilograms per dollar rather than dollars per kilogram)"
},
"misconception_tag": {
  "A": "rate_not_normalised_to_unit",
  "B": "misreads_direction_of_change",
  "D": "slope_run_over_rise"
}
```
