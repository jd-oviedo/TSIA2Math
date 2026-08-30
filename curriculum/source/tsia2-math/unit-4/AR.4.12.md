---
topic_name: "Exponential growth and decay models"
unit_number: 4
sequence_in_unit: 20
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Advanced"
related_strand: "AR"
keywords: ["exponential growth", "exponential decay", "compound interest", "depreciation", "growth factor", "percent change"]
---

# AR.4.12 - Exponential Growth and Decay Models

**Topic ID:** AR.4.12  
**Unit:** 4  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Build the correct growth or decay factor, $1 + r$ for growth or $1 - r$ for decay, from a stated percent rate, and apply it as a multiplier rather than the raw rate.
- Model repeated percent change using an exponent for the number of periods, recognizing that percent changes compound multiplicatively rather than adding.
- Recover the percent rate from a given growth or decay factor by comparing it to 1, not treating the factor itself as the percent.

---

#### **Part 1: Guided Notes**

##### The Rate Is Not the Multiplier

This is the sentence the whole topic turns on.

If something grows by $4\%$ each year, you do **not** multiply by $0.04$. You multiply by $1.04$.

Why: after a year you still have everything you started with, **plus** the $4\%$. That is $100\%$ plus $4\%$, which is $104\%$, which is $1.04$.

$$\text{growth factor} = 1 + r$$

Multiplying by $0.04$ would keep only the new part and throw away the original, leaving you with $4\%$ of what you had. That is not growth; it is a catastrophe.

##### Decay Subtracts Instead

If something falls by $6\%$ each year, you keep $94\%$ of it.

$$\text{decay factor} = 1 - r$$

So a $6\%$ decrease means multiplying by $0.94$, not by $0.06$ and not by $1.06$.

**Growth adds to one. Decay subtracts from one.** Getting the direction backwards turns a shrinking quantity into a growing one, and the answer is wrong in a way that should be obvious from the story.

| Description | Factor |
|---|---|
| increases by $4\%$ | $1.04$ |
| increases by $25\%$ | $1.25$ |
| decreases by $6\%$ | $0.94$ |
| decreases by $15\%$ | $0.85$ |

**A factor above $1$ grows. A factor below $1$ shrinks.** Check yours against the story before going further.

##### The Model

$$A = P(1 \pm r)^{t}$$

- $P$ is the starting amount.
- $(1 \pm r)$ is the factor, built as above.
- $t$ is the number of periods.

A population of $P$ growing $4\%$ a year for $t$ years:

$$A = P(1.04)^{t}$$

##### The Mistake That Costs the Most Points

**Treating repeated percent change as addition.**

A price rises $10\%$ two years running. Students write $20\%$ and stop.

Work it with a real number. Start at \$100.

- After year one: $100 \times 1.10 = 110$.
- After year two: $110 \times 1.10 = 121$.

The total rise is $21\%$, not $20\%$. The extra $1\%$ is the second year's growth acting on the first year's growth.

**Percent changes multiply. They never add.**

$$1.10 \times 1.10 = 1.21, \qquad \text{not } 1.10 + 1.10$$

**Why it matters more than it looks:** over two years the gap is small enough to shrug at. Over ten it is not. \$100 growing $10\%$ for ten years is about \$259, while adding $10\%$ ten times suggests \$200. The error compounds exactly as the interest does.

**The fix is to write the exponent rather than a multiplication.** The moment you find yourself multiplying a rate by a number of years, stop: that is the linear move, and this is not a linear situation.

##### A Worked Example

A car worth \$20,000 depreciates $15\%$ each year. What is it worth after 3 years?

Step 1: Build the factor. A decrease of $15\%$ means keeping $85\%$, so the factor is $0.85$.

Step 2: Put it in the model. $A = 20000(0.85)^{3}$.

Step 3: Evaluate the power. $0.85^{3} = 0.614125$.

Step 4: Multiply. $20000 \times 0.614125 = 12282.50$.

The car is worth \$12,282.50.

**Check the direction.** The factor is below $1$ and the answer is smaller than \$20,000. Consistent with depreciation.

##### Count the Periods, Not the Years

The exponent counts **compounding periods**, and those are not always years.

If interest compounds quarterly for 3 years, that is $4 \times 3 = 12$ periods, and the rate per period is the annual rate divided by $4$.

$$A = P\left(1 + \frac{r}{4}\right)^{4t}$$

Both parts change together. Adjusting the exponent but not the rate, or the rate but not the exponent, gives an answer that is wrong in one direction or the other.

**When the problem says annually, the exponent is just the number of years.** Most of this topic is annual, so read the wording and do not adjust what does not need adjusting.

##### Reading the Factor Backwards

Given a model, you can recover the rate.

$$A = P(1.07)^{t} \quad\Rightarrow\quad \text{a } 7\% \text{ increase per period}$$

$$A = P(0.88)^{t} \quad\Rightarrow\quad \text{a } 12\% \text{ decrease per period}$$

For decay, subtract the factor from $1$. The factor $0.88$ does not mean $88\%$ decrease; it means $88\%$ **remains**, so $12\%$ was lost.

**Reporting the factor as the rate is a common slip.** $1.07$ is not a $107\%$ increase, and $0.88$ is not an $88\%$ decrease.

##### The Five Traps

1. **Using the rate as the multiplier.** A $4\%$ increase means multiplying by $1.04$, never by $0.04$.
2. **Building the factor in the wrong direction.** Growth is $1 + r$; decay is $1 - r$. Check the factor against the story.
3. **Adding percent changes across periods.** Two years of $10\%$ is $21\%$, not $20\%$. Factors multiply.
4. **Using the wrong number of periods.** The exponent counts periods. Quarterly for 3 years is 12, not 3.
5. **Reporting the factor as the rate.** A factor of $0.88$ is a $12\%$ decrease, not an $88\%$ one.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. A town's population grows by $4\%$ each year, starting from an initial population $P$. Which equation models the population after $t$ years?
   - A) $A = P(0.04)^{t}$
   - B) $A = P(1.04)^{t}$
   - C) $A = P(0.96)^{t}$
   - D) $A = P(4)^{t}$

2. A machine's value decreases by $6\%$ each year, starting from an initial value $V$. Which equation models its value after $t$ years?
   - A) $A = V(1.06)^{t}$
   - B) $A = V(0.06)^{t}$
   - C) $A = V(0.94)^{t}$
   - D) $A = V(6)^{t}$

3. An investment of \$500 grows by $3\%$ each year. Which expression gives its value after 2 years?
   - A) $500(1.03)^{2}$
   - B) $500(0.03)^{2}$
   - C) $500(1.03)(2)$
   - D) $500(0.97)^{2}$

4. A car worth \$20,000 depreciates by $15\%$ each year. Which expression gives its value after 3 years?
   - A) $20000(1.15)^{3}$
   - B) $20000(0.15)^{3}$
   - C) $20000(0.85)(3)$
   - D) $20000(0.85)^{3}$

**Proficient Level**

5. A quantity increases by $7\%$ each period. What is the growth factor?
   - A) $0.07$
   - B) $1.07$
   - C) $0.93$
   - D) $7$

6. An account holds \$1,000 and earns $5\%$ interest compounded annually. Which expression gives the balance after 4 years?
   - A) $1000(0.05)^{4}$
   - B) $1000(1.05)(4)$
   - C) $1000(1.05)^{4}$
   - D) $1000(1.20)^{4}$

7. A model uses the equation $A = P(0.88)^{t}$. By what percent does the quantity change each period?
   - A) It decreases by $12\%$
   - B) It decreases by $88\%$
   - C) It increases by $88\%$
   - D) It decreases by $0.88\%$

**Advanced Level**

8. A deposit of \$800 grows by $10\%$ each year. What is it worth after 2 years?
   - A) \$960
   - B) \$1,000
   - C) \$968.20
   - D) \$968

9. A population of 2,000 decreases by $20\%$ each year. What is it after 3 years?
   - A) $800$
   - B) $1{,}024$
   - C) $1{,}200$
   - D) $1{,}280$

10. An investment of \$1,500 earns $8\%$ compounded annually. Which expression gives its value after 5 years?
    - A) $1500(1.08)(5)$
    - B) $1500(0.08)^{5}$
    - C) $1500(1.08)^{5}$
    - D) $1500(1.40)^{5}$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Proficient Level**

**Item 1**

A quantity increases by $9\%$ each period. What is the growth factor?

- A) $0.09$
- B) $1.09$
- C) $0.91$
- D) $9$

**Advanced Level**

**Item 2**

An item worth \$400 loses $25\%$ of its value each year. What is it worth after 2 years?

- A) \$225
- B) \$200
- C) \$300
- D) \$625

**Basic Level**

**Item 3**

A quantity of $A$ grows by $6\%$ each year. Which equation models it after $t$ years?

- A) $y = A(0.06)^{t}$
- B) $y = A(0.94)^{t}$
- C) $y = A(1.06)^{t}$
- D) $y = A(1.06)(t)$

**Proficient Level**

**Item 4**

An account holds \$2,000 and earns $4\%$ compounded annually. Which expression gives the balance after 3 years?

- A) $2000(0.04)^{3}$
- B) $2000(1.04)(3)$
- C) $2000(1.12)^{3}$
- D) $2000(1.04)^{3}$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. A town's population grows by $4\%$ each year, starting from an initial population $P$. Which equation models the population after $t$ years?**

Step 1: This is growth, so the factor is $1 + r$.

Step 2: $r = 0.04$, so the factor is $1.04$.

$$A = P(1.04)^{t}$$

**Answer: B** ($A = P(1.04)^{t}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: rate_used_as_factor (uses the rate itself as the multiplier, so each year keeps only 4 percent of the population rather than adding 4 percent to it)",
  "B": "Correct: growth means keeping everything and adding 4 percent, which is a factor of 1 plus 0.04",
  "C": "Student makes misconception: growth_decay_factor_direction_wrong (builds a decay factor by subtracting from one, which shrinks a population the problem says is growing)",
  "D": "Student makes misconception: rate_used_as_factor (reads the 4 percent as a factor of 4, quadrupling the population every year)"
},
"misconception_tag": {
  "A": "rate_used_as_factor",
  "C": "growth_decay_factor_direction_wrong",
  "D": "rate_used_as_factor"
}
```

---

**2. A machine's value decreases by $6\%$ each year, starting from an initial value $V$. Which equation models its value after $t$ years?**

Step 1: This is decay, so the factor is $1 - r$.

Step 2: $r = 0.06$, so the factor is $0.94$. Ninety-four percent remains each year.

$$A = V(0.94)^{t}$$

**Answer: C** ($A = V(0.94)^{t}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: growth_decay_factor_direction_wrong (adds to one rather than subtracting, so the machine gains value each year when the problem says it loses value)",
  "B": "Student makes misconception: rate_used_as_factor (uses the rate as the multiplier, so only 6 percent of the value survives each year rather than 94 percent)",
  "C": "Correct: a 6 percent decrease leaves 94 percent, so the factor is 1 minus 0.06",
  "D": "Student makes misconception: rate_used_as_factor (reads the 6 percent as a factor of 6, multiplying the value sixfold each year)"
},
"misconception_tag": {
  "A": "growth_decay_factor_direction_wrong",
  "B": "rate_used_as_factor",
  "D": "rate_used_as_factor"
}
```

---

**3. An investment of \$500 grows by $3\%$ each year. Which expression gives its value after 2 years?**

Step 1: Growth factor is $1.03$.

Step 2: Two years means an exponent of $2$.

$$500(1.03)^{2}$$

**Answer: A** ($500(1.03)^{2}$)

```json
"distractor_logic": {
  "A": "Correct: the growth factor 1.03 raised to the number of years, 2",
  "B": "Student makes misconception: rate_used_as_factor (uses the rate 0.03 as the multiplier, which would leave three percent of the investment rather than growing it)",
  "C": "Student makes misconception: linear_instead_of_compound (multiplies the factor by the number of years rather than raising it to that power, treating compound growth as a single scaling)",
  "D": "Student makes misconception: growth_decay_factor_direction_wrong (subtracts from one rather than adding, modelling a 3 percent loss where the problem states a gain)"
},
"misconception_tag": {
  "B": "rate_used_as_factor",
  "C": "linear_instead_of_compound",
  "D": "growth_decay_factor_direction_wrong"
}
```

---

**4. A car worth \$20,000 depreciates by $15\%$ each year. Which expression gives its value after 3 years?**

Step 1: Depreciation is decay, so the factor is $1 - 0.15 = 0.85$.

Step 2: Three years means an exponent of $3$.

$$20000(0.85)^{3}$$

**Answer: D** ($20000(0.85)^{3}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: growth_decay_factor_direction_wrong (adds to one rather than subtracting, so the car appreciates 15 percent a year when it is depreciating)",
  "B": "Student makes misconception: rate_used_as_factor (uses the rate 0.15 as the multiplier, leaving 15 percent of the value after one year rather than 85 percent)",
  "C": "Student makes misconception: linear_instead_of_compound (multiplies the factor by 3 rather than raising it to the third power, so the depreciation is applied once rather than compounding)",
  "D": "Correct: a 15 percent loss leaves 85 percent, raised to the number of years, 3"
},
"misconception_tag": {
  "A": "growth_decay_factor_direction_wrong",
  "B": "rate_used_as_factor",
  "C": "linear_instead_of_compound"
}
```

---

**Proficient Level**

**5. A quantity increases by $7\%$ each period. What is the growth factor?**

Step 1: Growth keeps everything and adds the increase. $100\% + 7\% = 107\%$.

Step 2: As a decimal, $1.07$.

$$1.07$$

**Answer: B** ($1.07$)

```json
"distractor_logic": {
  "A": "Student makes misconception: rate_used_as_factor (reports the rate itself as the factor; multiplying by 0.07 would keep only seven percent of the quantity)",
  "B": "Correct: 100 percent plus 7 percent is 107 percent, which is 1.07",
  "C": "Student makes misconception: growth_decay_factor_direction_wrong (subtracts from one rather than adding, producing the factor for a 7 percent decrease)",
  "D": "Student makes misconception: rate_used_as_factor (reads the 7 percent as a factor of 7, multiplying the quantity sevenfold each period)"
},
"misconception_tag": {
  "A": "rate_used_as_factor",
  "C": "growth_decay_factor_direction_wrong",
  "D": "rate_used_as_factor"
}
```

---

**6. An account holds \$1,000 and earns $5\%$ interest compounded annually. Which expression gives the balance after 4 years?**

Step 1: Growth factor is $1.05$.

Step 2: Compounded annually for 4 years means the exponent is $4$.

$$1000(1.05)^{4}$$

**Answer: C** ($1000(1.05)^{4}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: rate_used_as_factor (uses the rate 0.05 as the multiplier, which would destroy 95 percent of the balance each year)",
  "B": "Student makes misconception: linear_instead_of_compound (multiplies the factor by 4 rather than raising it to the fourth power, so the interest never earns interest)",
  "C": "Correct: the growth factor 1.05 raised to the four annual periods",
  "D": "Student makes misconception: percent_changes_added (adds the 5 percent across the four years to get 20 percent and builds a factor of 1.20 from it, when the factors multiply rather than the rates adding)"
},
"misconception_tag": {
  "A": "rate_used_as_factor",
  "B": "linear_instead_of_compound",
  "D": "percent_changes_added"
}
```

---

**7. A model uses the equation $A = P(0.88)^{t}$. By what percent does the quantity change each period?**

Step 1: The factor is below $1$, so this is decay.

Step 2: A factor of $0.88$ means $88\%$ remains after each period.

Step 3: What was lost is $100\% - 88\% = 12\%$.

$$\text{a } 12\% \text{ decrease}$$

**Answer: A** (It decreases by $12\%$)

```json
"distractor_logic": {
  "A": "Correct: a factor of 0.88 leaves 88 percent, so 12 percent was lost each period",
  "B": "Student makes misconception: factor_reported_as_rate (reads the factor 0.88 straight off as the percent change, reporting an 88 percent decrease when 88 percent is what remains rather than what is lost)",
  "C": "Student makes misconception: factor_reported_as_rate (reports the factor as the rate and also reverses the direction, calling a shrinking quantity an 88 percent increase when the factor is below one)",
  "D": "Student makes misconception: factor_reported_as_rate (carries the decimal straight through as a percent, giving 0.88 percent rather than converting the factor into the change it represents)"
},
"misconception_tag": {
  "B": "factor_reported_as_rate",
  "C": "factor_reported_as_rate",
  "D": "factor_reported_as_rate"
}
```

---

**Advanced Level**

**8. A deposit of \$800 grows by $10\%$ each year. What is it worth after 2 years?**

Step 1: Growth factor is $1.10$.

Step 2: $800(1.10)^{2} = 800 \times 1.21$.

Step 3: $800 \times 1.21 = 968$.

The deposit is worth 968 dollars.

**Answer: D** (\$968)

```json
"distractor_logic": {
  "A": "Student makes misconception: linear_instead_of_compound (applies 10 percent of the original 800 twice, adding 80 each year to reach 960, so the second year's growth never acts on the first year's)",
  "B": "Student makes misconception: percent_changes_added (adds the two 10 percent rises into a single 25 percent-style adjustment and applies it once, reaching 1000 rather than compounding to 968)",
  "C": "Student makes misconception: compounding_period_not_adjusted (treats the interest as compounding more often than annually and adjusts the exponent without adjusting the rate, inflating the result past 968)",
  "D": "Correct: the factor 1.10 squared is 1.21, and 800 times 1.21 is 968 dollars"
},
"misconception_tag": {
  "A": "linear_instead_of_compound",
  "B": "percent_changes_added",
  "C": "compounding_period_not_adjusted"
}
```

---

**9. A population of 2,000 decreases by $20\%$ each year. What is it after 3 years?**

Step 1: Decay factor is $1 - 0.20 = 0.80$.

Step 2: $0.80^{3} = 0.512$.

Step 3: $2000 \times 0.512 = 1024$.

$$1024$$

**Answer: B** ($1{,}024$)

```json
"distractor_logic": {
  "A": "Student makes misconception: percent_changes_added (adds the three 20 percent falls into a single 60 percent loss, leaving 40 percent of 2000, which is 800; the losses multiply rather than adding)",
  "B": "Correct: the factor 0.80 cubed is 0.512, and 2000 times 0.512 is 1024",
  "C": "Student makes misconception: linear_instead_of_compound (subtracts 20 percent of the original 2000 each year, taking away 400 three times to reach 800, then reports an intermediate figure of 1200 after two of those steps)",
  "D": "Student makes misconception: growth_applied_for_wrong_duration (applies the decay for two years rather than three, giving 2000 times 0.64 = 1280)"
},
"misconception_tag": {
  "A": "percent_changes_added",
  "C": "linear_instead_of_compound",
  "D": "growth_applied_for_wrong_duration"
}
```

---

**10. An investment of \$1,500 earns $8\%$ compounded annually. Which expression gives its value after 5 years?**

Step 1: Growth factor is $1.08$.

Step 2: Five annual periods means the exponent is $5$.

$$1500(1.08)^{5}$$

**Answer: C** ($1500(1.08)^{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: linear_instead_of_compound (multiplies the factor by 5 rather than raising it to the fifth power, so no year's interest earns interest in the years after it)",
  "B": "Student makes misconception: rate_used_as_factor (uses the rate 0.08 as the multiplier, which would leave eight percent of the investment after the first year)",
  "C": "Correct: the growth factor 1.08 raised to the five annual periods",
  "D": "Student makes misconception: percent_changes_added (adds the 8 percent across five years to get 40 percent and builds a factor of 1.40, then still raises it to the fifth power, applying the growth twice over)"
},
"misconception_tag": {
  "A": "linear_instead_of_compound",
  "B": "rate_used_as_factor",
  "D": "percent_changes_added"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: A quantity increases by $9\%$ each period. What is the growth factor?**

Step 1: $100\% + 9\% = 109\%$.

Step 2: As a decimal, $1.09$.

$$1.09$$

**Answer: B** ($1.09$)

```json
"distractor_logic": {
  "A": "Student makes misconception: rate_used_as_factor (reports the rate itself as the factor; multiplying by 0.09 keeps only nine percent of the quantity)",
  "B": "Correct: 100 percent plus 9 percent is 109 percent, which is 1.09",
  "C": "Student makes misconception: growth_decay_factor_direction_wrong (subtracts from one rather than adding, giving the factor for a 9 percent decrease)",
  "D": "Student makes misconception: rate_used_as_factor (reads the 9 percent as a factor of 9)"
},
"misconception_tag": {
  "A": "rate_used_as_factor",
  "C": "growth_decay_factor_direction_wrong",
  "D": "rate_used_as_factor"
}
```

---

**Item 2: An item worth \$400 loses $25\%$ of its value each year. What is it worth after 2 years?**

Step 1: Decay factor is $1 - 0.25 = 0.75$.

Step 2: $0.75^{2} = 0.5625$.

Step 3: $400 \times 0.5625 = 225$.

The item is worth 225 dollars.

**Answer: A** (\$225)

```json
"distractor_logic": {
  "A": "Correct: the factor 0.75 squared is 0.5625, and 400 times 0.5625 is 225 dollars",
  "B": "Student makes misconception: percent_changes_added (adds the two 25 percent losses into a single 50 percent loss, leaving half of 400, which is 200 dollars)",
  "C": "Student makes misconception: linear_instead_of_compound (subtracts 25 percent of the original 400 once, reaching 300 dollars and stopping before the second year)",
  "D": "Student makes misconception: growth_decay_factor_direction_wrong (builds a growth factor of 1.25 for a scenario that loses value, giving 625 dollars where the item should be worth less than it started)"
},
"misconception_tag": {
  "B": "percent_changes_added",
  "C": "linear_instead_of_compound",
  "D": "growth_decay_factor_direction_wrong"
}
```

---

**Item 3: A quantity of $A$ grows by $6\%$ each year. Which equation models it after $t$ years?**

Step 1: Growth factor is $1.06$.

Step 2: The exponent is the number of years, $t$.

$$y = A(1.06)^{t}$$

**Answer: C** ($y = A(1.06)^{t}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: rate_used_as_factor (uses the rate 0.06 as the multiplier, shrinking the quantity to six percent of itself each year)",
  "B": "Student makes misconception: growth_decay_factor_direction_wrong (subtracts from one rather than adding, modelling decay where the problem describes growth)",
  "C": "Correct: growth of 6 percent gives a factor of 1.06, raised to the number of years",
  "D": "Student makes misconception: linear_instead_of_compound (multiplies the factor by t rather than raising it to the power t, which grows by a fixed step instead of compounding)"
},
"misconception_tag": {
  "A": "rate_used_as_factor",
  "B": "growth_decay_factor_direction_wrong",
  "D": "linear_instead_of_compound"
}
```

---

**Item 4: An account holds \$2,000 and earns $4\%$ compounded annually. Which expression gives the balance after 3 years?**

Step 1: Growth factor is $1.04$.

Step 2: Three annual periods means the exponent is $3$.

$$2000(1.04)^{3}$$

**Answer: D** ($2000(1.04)^{3}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: rate_used_as_factor (uses the rate 0.04 as the multiplier, which would leave four percent of the balance after the first year)",
  "B": "Student makes misconception: linear_instead_of_compound (multiplies the factor by 3 rather than raising it to the third power, so the interest never compounds)",
  "C": "Student makes misconception: percent_changes_added (adds the 4 percent across the three years to get 12 percent, builds a factor of 1.12 from it, and then still raises it to the third power)",
  "D": "Correct: the growth factor 1.04 raised to the three annual periods"
},
"misconception_tag": {
  "A": "rate_used_as_factor",
  "B": "linear_instead_of_compound",
  "C": "percent_changes_added"
}
```
