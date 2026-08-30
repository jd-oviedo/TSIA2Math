---
topic_name: "Analyzing a multistep problem and creating a linear equation"
unit_number: 2
sequence_in_unit: 7
assessment_layer: "CRC"
estimated_time_minutes: 55
difficulty_band: "Proficient"
related_strand: "QR"
keywords: ["linear equation", "modeling", "starting value", "rate", "decreasing rate", "two entities", "back-solving"]
---

# QR.4.3 - Analyzing a Multistep Problem and Creating a Linear Equation

**Topic ID:** QR.4.3  
**Unit:** 2  
**Strand:** QR (Quantitative Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Write a linear equation by finding the value at zero and the signed change per one unit.
- Back a mid-stream given value out to the true zero-point intercept rather than using it directly.
- Set two models equal to find when they match, subtracting starting values and keeping each entity's own rate and start separate.

---

#### **Part 1: Guided Notes**

##### Building the Equation, Not Just the Answer

Earlier topics asked you to compute a value. This one asks you to hand back the **equation**, and then often to use it. The target is always

$$y = (\text{rate}) \cdot x + (\text{starting value})$$

so the job reduces to answering two questions in order:

1. What is the value when the input is **zero**?
2. How much does it change per **one** unit of input, and in which direction?

Get those two and the equation writes itself. Everything below is about the four ways the test hides them.

---

##### The Mistake That Costs the Most Points

You use a value from partway through as the starting value.

A savings account holds \$1,200 **after 3 months** and grows \$150 a month. Write the balance $B$ after $m$ months.

Writing $B = 150m + 1200$ is the reflex, and it is wrong. That equation says the account held \$1,200 at month zero, but \$1,200 is what it held at month **three**. Three months of growth are already baked into it.

Back the growth out to reach month zero:

$$1200 - 150(3) = 1200 - 450 = 750$$

$$B = 150m + 750$$

Check at the value you were given: $150(3) + 750 = 1200$. Correct.

**The intercept is the value at zero, and a problem rarely hands it to you directly.** Whenever the given value comes with a non-zero input attached to it, back the rate out before you write anything down.

---

##### Direction Belongs in the Sign

A tank holds 500 liters and drains 20 liters a minute.

$$V = 500 - 20t$$

The rate is negative because the quantity being modelled falls. Writing $V = 500 + 20t$ describes a tank filling, and every later answer built on it is wrong in a way that looks fine.

**Ask what the quantity does as the input grows.** Falls, drains, depreciates, empties, cools: negative. That is the whole rule and it costs a second.

---

##### A Rate Is Per One Unit

**Example 1:** A car is worth \$18,000 and falls to \$12,000 over 4 years, linearly. Write its value $V$ after $t$ years.

The total change is $12{,}000 - 18{,}000 = -6{,}000$. That is **not** the rate. It is four years of change stacked together, so divide.

$$\frac{-6000}{4} = -1500 \text{ per year}$$

$$V = 18000 - 1500t$$

Check both ends. At $t = 0$: \$18,000. At $t = 4$: $18000 - 6000 = 12000$. Both given values are reproduced.

**A rate always has a "per one" in it.** Using the total change as the rate is the same "stopped one step early" error from QR.3.6, wearing a modelling costume.

---

##### Two Entities at Once

**Example 2:** Runner P starts at kilometre 0 and runs 8 km/h. Runner Q starts at kilometre 5 and runs 6 km/h.

$$d_P = 8t \qquad d_Q = 6t + 5$$

Each runner keeps **their own** rate and **their own** start. The test's favourite trick is to swap one across, giving $d_P = 6t$ and $d_Q = 8t + 5$, which is fully plausible-looking and describes different people.

**Write each entity's pair down separately before you combine anything.**

**Example 3:** Tank A holds 300 liters and drains 10 a minute. Tank B holds 120 liters and fills 5 a minute. When are they equal?

$$300 - 10t = 120 + 5t$$

Move the variable terms one way and the constants the other. The constants **subtract**:

$$300 - 120 = 5t + 10t$$
$$180 = 15t$$
$$t = 12$$

At 12 minutes: Tank A is $300 - 120 = 180$ and Tank B is $120 + 60 = 180$. They agree.

The standard wrong move is adding the starting values to get 420, giving $t = 28$. Check it and it fails: at 28 minutes Tank A holds only 20 liters. **When you set two models equal, the starting values come together by subtraction, never by addition.**

---

##### From Two Points

**Example 4:** A gym had 240 members in month 2 and 384 in month 8, growing linearly.

- Rate: $\frac{384 - 240}{8 - 2} = \frac{144}{6} = 24$ per month
- Starting value: back up from month 2. $240 - 24(2) = 192$
- $M = 24m + 192$

Check both: $24(2) + 192 = 240$ and $24(8) + 192 = 384$. Both given points are reproduced, which is the test that catches every version of this error at once.

---

##### The Four Traps

1. **Using a mid-stream value as the intercept.** Back the rate out to zero first, then check against the value you were given.
2. **Losing the sign.** If the quantity falls as the input grows, the rate is negative.
3. **Using the total change as the rate.** Divide by the number of units it spanned.
4. **Adding starting values when setting two models equal.** They subtract.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. A tank holds $500$ liters and drains $20$ liters per minute. Which equation gives the volume $V$ after $t$ minutes?
   - A) $V = 500 + 20t$
   - B) $V = 500 - 20t$
   - C) $V = 20t - 500$
   - D) $V = -20t$

2. A plant is $12$ cm tall and grows $3$ cm per week. Which equation gives the height $h$ after $w$ weeks?
   - A) $h = 12w + 3$
   - B) $h = 3w$
   - C) $h = 12 - 3w$
   - D) $h = 3w + 12$

3. A car is worth \$18,000 and falls to \$12,000 over $4$ years, linearly. Which equation gives its value $V$ after $t$ years?
   - A) $V = 18000 - 6000t$
   - B) $V = 18000 - 1500t$
   - C) $V = 12000 - 1500t$
   - D) $V = 18000 + 1500t$

4. A membership costs \$45 to join plus \$20 per month. Which equation gives the total cost $C$ after $m$ months?
   - A) $C = 45m + 20$
   - B) $C = 20m$
   - C) $C = 20m + 45$
   - D) $C = 45 - 20m$

**Proficient Level** (these require an extra step)

5. A savings account holds \$1,200 after $3$ months and grows \$150 per month. Which equation gives the balance $B$ after $m$ months from the start?
   - A) $B = 150m + 1200$
   - B) $B = 150m + 750$
   - C) $B = 1200m + 150$
   - D) $B = 150m$

6. Runner P starts at kilometre $0$ and runs at $8$ km/h. Runner Q starts at kilometre $5$ and runs at $6$ km/h. Which pair of equations gives their distances $d$ after $t$ hours?
   - A) $d_P = 6t$ and $d_Q = 8t + 5$
   - B) $d_P = 8t$ and $d_Q = 6t$
   - C) $d_P = 8t$ and $d_Q = 6t + 5$
   - D) $d_P = 8t + 5$ and $d_Q = 6t$

7. Tank A holds $300$ liters and drains $10$ liters per minute. Tank B holds $120$ liters and fills at $5$ liters per minute. When do they hold the same amount, and how much is it?
   - A) At $12$ minutes, holding $180$ liters
   - B) At $28$ minutes, holding $20$ liters
   - C) At $12$ minutes, holding $300$ liters
   - D) They never hold the same amount.

**Advanced Level** (these need multiple steps or reverse thinking)

8. A gym had $240$ members in month $2$ and $384$ members in month $8$, growing linearly. Which equation gives the membership $M$ after $m$ months?
   - A) $M = 24m + 240$
   - B) $M = 144m + 192$
   - C) $M = 192m + 24$
   - D) $M = 24m + 192$

9. A printer starts with $800$ sheets and uses $35$ per day. Which equation gives the sheets $S$ remaining after $t$ days, and when do $100$ sheets remain?
   - A) $S = 800 - 35t$, with $100$ sheets remaining after $20$ days
   - B) $S = 800 + 35t$, and $100$ sheets are never reached
   - C) $S = 800 - 35t$, with $100$ sheets remaining after about $22.9$ days
   - D) $S = 35t - 800$, with $100$ sheets remaining after about $25.7$ days

10. Company R has $500$ employees and loses $20$ per month. Company S has $200$ employees and gains $30$ per month. When do they have the same number, and what is it?
    - A) At $14$ months, with $220$ employees
    - B) They never have the same number.
    - C) At $6$ months, with $380$ employees
    - D) At $6$ months, with $500$ employees

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

A pool holds $400$ liters and drains $25$ liters per minute. Which equation gives the volume $V$ after $t$ minutes?

- A) $V = 400 + 25t$
- B) $V = 25t - 400$
- C) $V = 400 - 25t$
- D) $V = -25t$

**Item 2**

A tree is $80$ cm tall and grows $6$ cm per month. Which equation gives the height $h$ after $m$ months?

- A) $h = 6m + 80$
- B) $h = 80m + 6$
- C) $h = 6m$
- D) $h = 80 - 6m$

**Item 3**

A phone is worth \$400 and falls to \$160 over $4$ years, linearly. Which equation gives its value $V$ after $t$ years?

- A) $V = 400 - 240t$
- B) $V = 160 - 60t$
- C) $V = 400 + 60t$
- D) $V = 400 - 60t$

**Proficient Level**

**Item 4**

An account holds \$900 after $2$ months and grows \$120 per month. Which equation gives the balance $B$ after $m$ months from the start?

- A) $B = 120m + 900$
- B) $B = 120m + 660$
- C) $B = 900m + 120$
- D) $B = 120m$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. A tank holds $500$ liters and drains $20$ liters per minute. Which equation gives the volume $V$ after $t$ minutes?**

Step 1: Value at zero minutes.
- $500$, so that is the constant.

Step 2: Change per minute, with direction. The tank drains, so the volume falls.
- $-20$

Step 3: Assemble.
- $V = 500 - 20t$

**Answer: B** ($V = 500 - 20t$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_wrong_for_decreasing_rate (writes a positive rate for a draining tank, so the volume grows without limit)",
  "B": "Correct: starts at 500 at zero minutes and falls 20 liters for each minute that passes",
  "C": "Student makes misconception: slope_intercept_swap (puts the starting volume where the rate belongs and vice versa, giving a tank that begins at negative 500 liters)",
  "D": "Student makes misconception: omits_constant_term (keeps the rate but drops the 500 liter starting volume)"
},
"misconception_tag": {
  "A": "sign_wrong_for_decreasing_rate",
  "C": "slope_intercept_swap",
  "D": "omits_constant_term"
}
```

---

**2. A plant is $12$ cm tall and grows $3$ cm per week. Which equation gives the height $h$ after $w$ weeks?**

Step 1: Value at zero weeks.
- $12$

Step 2: Change per week, growing, so positive.
- $+3$

Step 3: Assemble and check at a value. After 5 weeks: $3(5) + 12 = 27$ cm, which is 15 cm of growth on top of the original 12.

**Answer: D** ($h = 3w + 12$)

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_intercept_swap (attaches the 12 cm starting height to the variable and leaves the 3 cm growth as the constant)",
  "B": "Student makes misconception: omits_constant_term (keeps the growth rate but drops the 12 cm the plant already had)",
  "C": "Student makes misconception: sign_wrong_for_decreasing_rate (writes a negative rate for a plant that is growing, so it shrinks to nothing after 4 weeks)",
  "D": "Correct: starts at 12 cm at zero weeks and adds 3 cm for each week that passes"
},
"misconception_tag": {
  "A": "slope_intercept_swap",
  "B": "omits_constant_term",
  "C": "sign_wrong_for_decreasing_rate"
}
```

---

**3. A car is worth \$18,000 and falls to \$12,000 over $4$ years, linearly. Which equation gives its value $V$ after $t$ years?**

Step 1: Value at zero years.
- $18{,}000$

Step 2: Total change, then divide to get the rate per one year.
- $12{,}000 - 18{,}000 = -6{,}000$, and $-6{,}000 \div 4 = -1{,}500$

Step 3: Assemble.
- $V = 18000 - 1500t$

Step 4: Check both ends. At $t = 0$ it gives 18,000; at $t = 4$ it gives $18{,}000 - 6{,}000 = 12{,}000$. Both match.

**Answer: B** ($V = 18000 - 1500t$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_change_used_as_rate (uses the whole 6,000 drop as the yearly rate without dividing by the 4 years, so the car is worthless after 3 years)",
  "B": "Correct: starts at 18,000 and falls 1,500 a year, reproducing 12,000 at year 4",
  "C": "Student makes misconception: later_total_used_as_starting_value (uses the year-4 value of 12,000 as the value at year zero)",
  "D": "Student makes misconception: sign_wrong_for_decreasing_rate (writes a positive rate for a car that is losing value)"
},
"misconception_tag": {
  "A": "total_change_used_as_rate",
  "C": "later_total_used_as_starting_value",
  "D": "sign_wrong_for_decreasing_rate"
}
```

---

**4. A membership costs \$45 to join plus \$20 per month. Which equation gives the total cost $C$ after $m$ months?**

Step 1: Cost at zero months is the joining fee alone.
- $45$

Step 2: Change per month.
- $+20$

Step 3: Assemble.
- $C = 20m + 45$

**Answer: C** ($C = 20m + 45$)

```json
"distractor_logic": {
  "A": "Student makes misconception: slope_intercept_swap (attaches the one-time 45 dollar fee to the variable and leaves the monthly 20 as the constant)",
  "B": "Student makes misconception: omits_constant_term (keeps the monthly rate but drops the 45 dollar joining fee)",
  "C": "Correct: 45 dollars at zero months, rising 20 dollars for each month that passes",
  "D": "Student makes misconception: sign_wrong_for_decreasing_rate (subtracts the monthly charge, so the total cost falls as the membership continues)"
},
"misconception_tag": {
  "A": "slope_intercept_swap",
  "B": "omits_constant_term",
  "D": "sign_wrong_for_decreasing_rate"
}
```

---

**Proficient Level**

**5. A savings account holds \$1,200 after $3$ months and grows \$150 per month. Which equation gives the balance $B$ after $m$ months from the start?**

Step 1: The \$1,200 is not the starting value. It is the value at month 3, with three months of growth already in it.

Step 2: Back the growth out to month zero.
- $1200 - 150(3) = 1200 - 450 = 750$

Step 3: Assemble.
- $B = 150m + 750$

Step 4: Check against the value given. $150(3) + 750 = 1200$. Correct.

**Answer: B** ($B = 150m + 750$)

```json
"distractor_logic": {
  "A": "Student makes misconception: later_total_used_as_starting_value (uses the month-3 balance of 1,200 as the value at month zero, which puts the account 450 dollars ahead throughout)",
  "B": "Correct: backs three months of growth out of the 1,200 to reach 750 at month zero, and checks that month 3 returns 1,200",
  "C": "Student makes misconception: slope_intercept_swap (attaches the balance to the variable and leaves the rate as the constant)",
  "D": "Student makes misconception: omits_constant_term (keeps the growth rate but drops the starting balance entirely)"
},
"misconception_tag": {
  "A": "later_total_used_as_starting_value",
  "C": "slope_intercept_swap",
  "D": "omits_constant_term"
}
```

---

**6. Runner P starts at kilometre $0$ and runs at $8$ km/h. Runner Q starts at kilometre $5$ and runs at $6$ km/h. Which pair of equations gives their distances $d$ after $t$ hours?**

Step 1: Write each runner's own pair before combining anything.
- P: starts at $0$, rate $8$
- Q: starts at $5$, rate $6$

Step 2: Assemble separately.
- $d_P = 8t$ and $d_Q = 6t + 5$

Step 3: Check at $t = 1$. P has run 8 km; Q has run 6 km from the 5 km mark, so Q is at 11 km. Both sensible.

**Answer: C** ($d_P = 8t$ and $d_Q = 6t + 5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: model_parameters_swapped_between_entities (gives P's 8 km/h rate to Q and Q's 6 km/h rate to P, describing two different runners)",
  "B": "Student makes misconception: omits_constant_term (drops Q's 5 km head start, so both runners begin at the same place)",
  "C": "Correct: each runner keeps their own rate and their own starting position",
  "D": "Student makes misconception: model_parameters_swapped_between_entities (moves Q's 5 km head start onto P, giving the wrong runner the lead)"
},
"misconception_tag": {
  "A": "model_parameters_swapped_between_entities",
  "B": "omits_constant_term",
  "D": "model_parameters_swapped_between_entities"
}
```

---

**7. Tank A holds $300$ liters and drains $10$ liters per minute. Tank B holds $120$ liters and fills at $5$ liters per minute. When do they hold the same amount, and how much is it?**

Step 1: Write both models.
- $A = 300 - 10t$ and $B = 120 + 5t$

Step 2: Set them equal and collect. The variable terms come together and the constants **subtract**.
- $300 - 120 = 5t + 10t$, so $180 = 15t$

Step 3: Solve.
- $t = 12$

Step 4: Check both. Tank A: $300 - 120 = 180$. Tank B: $120 + 60 = 180$. They agree.

**Answer: A** (At $12$ minutes, holding $180$ liters)

```json
"distractor_logic": {
  "A": "Correct: sets 300 - 10t equal to 120 + 5t, subtracts the starting values for 180 = 15t, and confirms both tanks hold 180 liters at 12 minutes",
  "B": "Student makes misconception: starting_values_summed_not_differenced (adds the 300 and 120 to 420 instead of subtracting, giving 28 minutes, where Tank A actually holds only 20 liters)",
  "C": "Student makes misconception: later_total_used_as_starting_value (finds the 12 minutes correctly but reports Tank A's starting 300 liters as the shared amount)",
  "D": "Student makes misconception: sign_wrong_for_decreasing_rate (treats Tank A as filling rather than draining, so the two never meet)"
},
"misconception_tag": {
  "B": "starting_values_summed_not_differenced",
  "C": "later_total_used_as_starting_value",
  "D": "sign_wrong_for_decreasing_rate"
}
```

---

**Advanced Level**

**8. A gym had $240$ members in month $2$ and $384$ members in month $8$, growing linearly. Which equation gives the membership $M$ after $m$ months?**

Step 1: Rate from the two points.
- $\frac{384 - 240}{8 - 2} = \frac{144}{6} = 24$ per month

Step 2: Back up to month zero from either point.
- $240 - 24(2) = 192$

Step 3: Assemble.
- $M = 24m + 192$

Step 4: Check both points. $24(2) + 192 = 240$ and $24(8) + 192 = 384$. Both reproduced.

**Answer: D** ($M = 24m + 192$)

```json
"distractor_logic": {
  "A": "Student makes misconception: later_total_used_as_starting_value (uses the month-2 count of 240 as the value at month zero, which overshoots both given points)",
  "B": "Student makes misconception: total_change_used_as_rate (uses the whole 144 member increase as the monthly rate without dividing by the 6 months it spanned)",
  "C": "Student makes misconception: slope_intercept_swap (attaches the starting value to the variable and leaves the rate as the constant)",
  "D": "Correct: finds a rate of 24 per month, backs up from month 2 to a start of 192, and reproduces both given points"
},
"misconception_tag": {
  "A": "later_total_used_as_starting_value",
  "B": "total_change_used_as_rate",
  "C": "slope_intercept_swap"
}
```

---

**9. A printer starts with $800$ sheets and uses $35$ per day. Which equation gives the sheets $S$ remaining after $t$ days, and when do $100$ sheets remain?**

Step 1: Sheets fall, so the rate is negative.
- $S = 800 - 35t$

Step 2: Set $S$ to 100 and solve.
- $100 = 800 - 35t$, so $35t = 700$ and $t = 20$

Step 3: Check. $800 - 35(20) = 800 - 700 = 100$. Correct.

**Answer: A** ($S = 800 - 35t$, with $100$ sheets remaining after $20$ days)

```json
"distractor_logic": {
  "A": "Correct: models the fall as 800 - 35t and solves 100 = 800 - 35t for 20 days, which checks back to 100 sheets",
  "B": "Student makes misconception: sign_wrong_for_decreasing_rate (writes a positive rate for a printer that is consuming sheets, so the stock grows and never falls to 100)",
  "C": "Student makes misconception: omits_constant_term (divides the full 800 sheets by 35 per day, answering when the printer runs out entirely rather than when 100 remain)",
  "D": "Student makes misconception: slope_intercept_swap (writes the model with the starting stock negated, then solves to about 25.7 days)"
},
"misconception_tag": {
  "B": "sign_wrong_for_decreasing_rate",
  "C": "omits_constant_term",
  "D": "slope_intercept_swap"
}
```

---

**10. Company R has $500$ employees and loses $20$ per month. Company S has $200$ employees and gains $30$ per month. When do they have the same number, and what is it?**

Step 1: Write both models.
- $R = 500 - 20t$ and $S = 200 + 30t$

Step 2: Set equal and collect, subtracting the starting values.
- $500 - 200 = 30t + 20t$, so $300 = 50t$

Step 3: Solve and evaluate.
- $t = 6$, and $R = 500 - 120 = 380$, $S = 200 + 180 = 380$

**Answer: C** (At $6$ months, with $380$ employees)

```json
"distractor_logic": {
  "A": "Student makes misconception: starting_values_summed_not_differenced (adds the 500 and 200 to 700 instead of subtracting, giving 14 months, where Company R actually has 220 employees)",
  "B": "Student makes misconception: sign_wrong_for_decreasing_rate (treats Company R as growing rather than shrinking, so the two never meet)",
  "C": "Correct: subtracts the starting values for 300 = 50t, giving 6 months, where both companies have 380 employees",
  "D": "Student makes misconception: later_total_used_as_starting_value (finds 6 months correctly but reports Company R's starting 500 as the shared number)"
},
"misconception_tag": {
  "A": "starting_values_summed_not_differenced",
  "B": "sign_wrong_for_decreasing_rate",
  "D": "later_total_used_as_starting_value"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: A pool holds $400$ liters and drains $25$ liters per minute. Which equation gives the volume $V$ after $t$ minutes?**

Step 1: Value at zero is $400$.

Step 2: The pool drains, so the rate is $-25$.

**Answer: C** ($V = 400 - 25t$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_wrong_for_decreasing_rate (writes a positive rate for a draining pool)",
  "B": "Student makes misconception: slope_intercept_swap (puts the starting volume where the rate belongs, giving a pool that begins at negative 400 liters)",
  "C": "Correct: starts at 400 liters and falls 25 for each minute that passes",
  "D": "Student makes misconception: omits_constant_term (keeps the rate but drops the 400 liter starting volume)"
},
"misconception_tag": {
  "A": "sign_wrong_for_decreasing_rate",
  "B": "slope_intercept_swap",
  "D": "omits_constant_term"
}
```

---

**Item 2: A tree is $80$ cm tall and grows $6$ cm per month. Which equation gives the height $h$ after $m$ months?**

Step 1: Value at zero is $80$.

Step 2: The tree grows, so the rate is $+6$.

**Answer: A** ($h = 6m + 80$)

```json
"distractor_logic": {
  "A": "Correct: starts at 80 cm and adds 6 cm for each month that passes",
  "B": "Student makes misconception: slope_intercept_swap (attaches the 80 cm starting height to the variable and leaves the 6 cm growth as the constant)",
  "C": "Student makes misconception: omits_constant_term (keeps the growth rate but drops the 80 cm the tree already had)",
  "D": "Student makes misconception: sign_wrong_for_decreasing_rate (writes a negative rate for a tree that is growing)"
},
"misconception_tag": {
  "B": "slope_intercept_swap",
  "C": "omits_constant_term",
  "D": "sign_wrong_for_decreasing_rate"
}
```

---

**Item 3: A phone is worth \$400 and falls to \$160 over $4$ years, linearly. Which equation gives its value $V$ after $t$ years?**

Step 1: Value at zero is $400$.

Step 2: Total change is $160 - 400 = -240$, so the yearly rate is $-240 \div 4 = -60$.

Step 3: Check the far end. $400 - 60(4) = 160$. Correct.

**Answer: D** ($V = 400 - 60t$)

```json
"distractor_logic": {
  "A": "Student makes misconception: total_change_used_as_rate (uses the whole 240 dollar drop as the yearly rate without dividing by the 4 years)",
  "B": "Student makes misconception: later_total_used_as_starting_value (uses the year-4 value of 160 as the value at year zero)",
  "C": "Student makes misconception: sign_wrong_for_decreasing_rate (writes a positive rate for a phone that is losing value)",
  "D": "Correct: starts at 400 and falls 60 a year, reproducing 160 at year 4"
},
"misconception_tag": {
  "A": "total_change_used_as_rate",
  "B": "later_total_used_as_starting_value",
  "C": "sign_wrong_for_decreasing_rate"
}
```

---

**Item 4: An account holds \$900 after $2$ months and grows \$120 per month. Which equation gives the balance $B$ after $m$ months from the start?**

Step 1: The \$900 is the value at month 2, not at month zero.

Step 2: Back two months of growth out.
- $900 - 120(2) = 900 - 240 = 660$

Step 3: Check. $120(2) + 660 = 900$. Correct.

**Answer: B** ($B = 120m + 660$)

```json
"distractor_logic": {
  "A": "Student makes misconception: later_total_used_as_starting_value (uses the month-2 balance of 900 as the value at month zero, which puts the account 240 dollars ahead throughout)",
  "B": "Correct: backs two months of growth out of the 900 to reach 660 at month zero, and checks that month 2 returns 900",
  "C": "Student makes misconception: slope_intercept_swap (attaches the balance to the variable and leaves the rate as the constant)",
  "D": "Student makes misconception: omits_constant_term (keeps the growth rate but drops the starting balance entirely)"
},
"misconception_tag": {
  "A": "later_total_used_as_starting_value",
  "C": "slope_intercept_swap",
  "D": "omits_constant_term"
}
```
