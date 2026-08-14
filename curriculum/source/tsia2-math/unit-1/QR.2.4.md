---
topic_name: "Percents in algebraic contexts"
unit_number: 1
sequence_in_unit: 8
assessment_layer: "CRC"
estimated_time_minutes: 55
difficulty_band: "Proficient"
related_strand: "QR"
keywords: ["reverse percent", "percent equation", "mixture", "markup", "break even", "commission", "solving for the original"]
---

# QR.2.4 - Percents in Algebraic Contexts

**Topic ID:** QR.2.4  
**Unit:** 1  
**Strand:** QR (Quantitative Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Running the Percent Backward

In QR.2.3 you were always given the starting value. Here you are given the *ending* value and asked for the start.

That single change is what makes this topic algebraic. You can no longer just multiply and be done, because the number you would multiply is the number you are looking for.

The fix is small and it is mechanical. Write the sentence as an equation, put a letter where the unknown is, and solve.

After a $20\%$ discount, a coat costs \$96. What was the original price?

$$0.80 \times \text{original} = 96$$

$$\text{original} = 96 \div 0.80 = 120$$

Check it forward: $120 \times 0.80 = 96$. Correct.

**The forward direction multiplies. The backward direction divides.** That is the entire idea, and everything below is a variation on it.

---

##### The Mistake That Costs the Most Points

You run the percent forward again instead of undoing it.

The coat costs \$96 after $20\%$ off. The tempting move is to add $20\%$ back: $96 \times 1.20 = 115.20$. Or to take $20\%$ off again: $96 \times 0.80 = 76.80$. Both feel like "doing the percent," and both are wrong.

Here is why adding $20\%$ back does not work. The \$20 percent came off the **original** price, which was larger than \$96. So the discount was worth more than $20\%$ of \$96. Adding back $20\%$ of the smaller number cannot return you to the bigger one.

The numbers make it obvious. The real original is \$120, the discount was \$24, and \$24 is $25\%$ of \$96, not $20\%$.

**A percent taken off a big number cannot be undone by a percent added to a small number.** Divide by the factor. Do not multiply by it again.

And always check forward. It costs five seconds: take your answer, apply the discount, and see whether you land on the number the problem gave you. $115.20 \times 0.80 = 92.16$, which is not \$96, so that answer was never right.

---

##### The Three Backward Shapes

**Shape 1: a percent of an unknown.** "$30\%$ of a number is 45."

$$0.30n = 45 \quad \rightarrow \quad n = 45 \div 0.30 = 150$$

**Shape 2: an unknown after an increase.** "A number increased by $25\%$ gives 90."

Increased by $25\%$ means multiplied by $1.25$.

$$1.25n = 90 \quad \rightarrow \quad n = 90 \div 1.25 = 72$$

**Shape 3: an unknown after a decrease.** "After an $8\%$ tax, a book costs \$27."

A tax added means multiplied by $1.08$.

$$1.08n = 27 \quad \rightarrow \quad n = 27 \div 1.08 = 25$$

Every one of them is the same two moves: write the factor, then divide by it. The only thing you have to get right is the factor, and there are exactly three of those.

- Take $p\%$ **of** something: the factor is $p$ as a decimal.
- **Increase** by $p\%$: the factor is $1 + p$.
- **Decrease** by $p\%$: the factor is $1 - p$.

---

##### Percents Inside a Larger Expression

**Example 1:** A salesperson earns a base of \$400 plus $6\%$ commission on \$5,000 of sales. What are the total earnings?

- Commission: $0.06 \times 5000 = 300$
- Total: $400 + 300 = 700$

The percent applies to the sales, not to the base. The base is a flat amount that sits outside the percent entirely.

Two errors live here and they are mirror images. Reporting \$300 drops the base. Reporting \$400 drops the commission. Both are half the answer, and both feel complete because you did compute something. **When a problem has a flat part and a percent part, write both down before you add.**

---

##### Mixture Problems

These look harder than they are. The trick is that **adding to a mixture changes the total as well as the part**, and students routinely forget the second half.

**Example 2:** A 40-liter solution is $10\%$ salt. How many liters of pure salt must be added to make it $20\%$ salt?

Start by writing what you have: $0.10 \times 40 = 4$ liters of salt in 40 liters of liquid.

Now let $x$ be the salt added. Both the salt and the total go up:

- Salt afterwards: $4 + x$
- Total afterwards: $40 + x$

The target says the salt is $20\%$ of the total:

$$\frac{4 + x}{40 + x} = 0.20$$

$$4 + x = 0.20(40 + x) = 8 + 0.20x$$

$$0.80x = 4 \quad \rightarrow \quad x = 5$$

Check: 9 liters of salt in 45 liters total, and $\frac{9}{45} = 0.20$. Correct.

The classic wrong answer is 4. It comes from computing $20\%$ of the *original* 40 liters, getting 8, and subtracting the 4 already there. That treats the total as fixed at 40, but you poured 5 more liters in, so it is not 40 any more. **If you are adding something, it goes in the denominator too.**

The other wrong answer is 45, which is the new total volume rather than the amount added. Reread the question: it asked how much to add.

---

##### Break-Even Markup

**Example 3:** A store discounts an item by $20\%$. By what percent must it mark up the sale price to get back to the original price?

The intuitive answer is $20\%$, and it is wrong for exactly the reason from QR.2.3: the two percents are taken on different bases.

Start at \$100. After $20\%$ off it is \$80. To get from \$80 back to \$100 you must add \$20, and

$$\frac{20}{80} = 0.25 = 25\%$$

A $20\%$ discount needs a $25\%$ markup to undo it.

The general version: if the discount factor is $d$, the markup factor is $\frac{1}{d}$. Here $d = 0.80$ and $\frac{1}{0.80} = 1.25$, a $25\%$ markup. Note that $1.25$ is the *factor*; the markup is the $0.25$ above 1, not $125\%$.

**Going down and coming back up are never the same percent.** The way down is measured against the larger number and the way back up against the smaller one.

---

##### The Four Traps

1. **Running the percent forward to undo it.** Divide by the factor. Then check forward against the given number.
2. **Dropping half of a flat-plus-percent expression.** Base and commission, both, then add.
3. **Freezing the total in a mixture.** What you pour in changes the denominator too.
4. **Assuming a discount and its recovery markup are equal percents.** $20\%$ off needs $25\%$ on.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. After a $20\%$ discount, a coat costs \$96. What was the original price?
   - A) \$120
   - B) \$115.20
   - C) \$116
   - D) \$19.20

2. $30\%$ of a number is $45$. What is the number?
   - A) $13.5$
   - B) $1500$
   - C) $150$
   - D) $1.5$

3. A number increased by $25\%$ gives $90$. What is the number?
   - A) $67.5$
   - B) $65$
   - C) $22.5$
   - D) $72$

4. A salesperson earns a base salary of \$400 plus a $6\%$ commission on sales. In a month with \$5,000 in sales, what are the total earnings?
   - A) \$700
   - B) \$300
   - C) \$400
   - D) \$3400

**Proficient Level** (these require an extra step)

5. A $40$-liter solution is $10\%$ salt. How many liters of pure salt must be added to make the solution $20\%$ salt?
   - A) $4$ liters
   - B) $5$ liters
   - C) $8$ liters
   - D) $45$ liters

6. A store discounts an item by $20\%$. By what percent must the store then mark up the sale price to return to the original price?
   - A) $20\%$
   - B) $25\%$
   - C) $125\%$
   - D) $80\%$

7. After an $8\%$ sales tax is added, a book costs \$27. What was the price before tax?
   - A) \$24.84
   - B) \$19
   - C) \$25
   - D) \$2.16

**Advanced Level** (these need multiple steps or reverse thinking)

8. How many liters of a $50\%$ acid solution must be mixed with $30$ liters of a $20\%$ acid solution to produce a $30\%$ acid solution?
   - A) $45$ liters
   - B) $15$ liters
   - C) $60$ liters
   - D) $9$ liters

9. A price was increased by $10\%$ and then decreased by $20\%$, ending at \$88. What was the original price?
   - A) \$97.78
   - B) \$110
   - C) \$77.44
   - D) \$100

10. A shop buys an item for \$60 and wants a profit equal to $25\%$ of the **selling** price. What should the selling price be?
    - A) \$75
    - B) \$80
    - C) \$15
    - D) \$45

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

After a $15\%$ discount, a lamp costs \$68. What was the original price?

- A) \$78.20
- B) \$83
- C) \$80
- D) \$10.20

**Item 2**

$40\%$ of a number is $26$. What is the number?

- A) $10.4$
- B) $65$
- C) $650$
- D) $0.65$

**Item 3**

A $50$-liter solution is $12\%$ salt. How many liters of pure water must be added to dilute it to $10\%$ salt?

- A) $60$ liters
- B) $1$ liter
- C) $6$ liters
- D) $10$ liters

**Item 4**

A store discounts an item by $25\%$. By what percent must the store then mark up the sale price to return to the original price?

- A) $25\%$
- B) $75\%$
- C) $33.3\%$
- D) $133\%$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. After a $20\%$ discount, a coat costs \$96. What was the original price?**

Step 1: Write the factor. A $20\%$ discount means paying $80\%$.
- Factor is $0.80$

Step 2: The forward direction multiplies, so the backward direction divides.
- $96 \div 0.80 = 120$

Step 3: Check forward. $120 \times 0.80 = 96$. Correct.

**Answer: A** (\$120)

```json
"distractor_logic": {
  "A": "Correct: divides the 96 by the 0.80 discount factor to recover an original price of 120, which checks forward to 96",
  "B": "Student makes misconception: percent_applied_forward_not_reversed (adds 20 percent back onto the 96 instead of dividing, producing 115.20, which discounts forward to 92.16 rather than 96)",
  "C": "Student makes misconception: percent_sign_confusion (treats 20 percent as the whole number 20 and adds it to 96, producing 116)",
  "D": "Student makes misconception: answers_intermediate_value (computes 20 percent of the 96 sale price for 19.20 and reports that instead of the original price)"
},
"misconception_tag": {
  "B": "percent_applied_forward_not_reversed",
  "C": "percent_sign_confusion",
  "D": "answers_intermediate_value"
}
```

---

**2. $30\%$ of a number is $45$. What is the number?**

Step 1: Write the equation.
- $0.30n = 45$

Step 2: Divide by the factor.
- $n = 45 \div 0.30 = 150$

Step 3: Check forward. $0.30 \times 150 = 45$. Correct.

**Answer: C** ($150$)

```json
"distractor_logic": {
  "A": "Student makes misconception: multiplies_instead_of_divides (multiplies 45 by 0.30 instead of dividing, producing 13.5, a number smaller than the part it contains)",
  "B": "Student makes misconception: percent_decimal_overshift (moves the decimal three places instead of two, dividing by 0.03 rather than 0.30, producing 1500)",
  "C": "Correct: divides 45 by the 0.30 factor to get 150, which checks forward to 45",
  "D": "Student makes misconception: percent_sign_confusion (treats 30 percent as the whole number 30 and divides 45 by 30, producing 1.5)"
},
"misconception_tag": {
  "A": "multiplies_instead_of_divides",
  "B": "percent_decimal_overshift",
  "D": "percent_sign_confusion"
}
```

---

**3. A number increased by $25\%$ gives $90$. What is the number?**

Step 1: Write the factor. Increased by $25\%$ means multiplied by $1.25$.
- $1.25n = 90$

Step 2: Divide.
- $n = 90 \div 1.25 = 72$

Step 3: Check forward. $72 \times 1.25 = 90$. Correct.

**Answer: D** ($72$)

```json
"distractor_logic": {
  "A": "Student makes misconception: percent_applied_forward_not_reversed (takes 25 percent off the 90 instead of dividing by 1.25, producing 67.5, which increases forward to 84.375 rather than 90)",
  "B": "Student makes misconception: percent_sign_confusion (treats 25 percent as the whole number 25 and subtracts it from 90, producing 65)",
  "C": "Student makes misconception: answers_intermediate_value (computes 25 percent of the 90 for 22.5 and reports the increase itself instead of the original number)",
  "D": "Correct: divides 90 by the 1.25 increase factor to get 72, which checks forward to 90"
},
"misconception_tag": {
  "A": "percent_applied_forward_not_reversed",
  "B": "percent_sign_confusion",
  "C": "answers_intermediate_value"
}
```

---

**4. A salesperson earns a base salary of \$400 plus a $6\%$ commission on sales. In a month with \$5,000 in sales, what are the total earnings?**

Step 1: Compute the commission. The percent applies to the sales.
- $0.06 \times 5000 = 300$

Step 2: Add the base, which sits outside the percent.
- $400 + 300 = 700$

Step 3: Check that both pieces are present. Base \$400, commission \$300, total \$700.

**Answer: A** (\$700)

```json
"distractor_logic": {
  "A": "Correct: takes 6 percent of the 5000 in sales for a commission of 300, then adds the 400 base for 700",
  "B": "Student makes misconception: omits_constant_term (computes the 300 commission correctly and reports it without adding the 400 base salary)",
  "C": "Student makes misconception: omits_variable_term (reports the 400 base salary and never adds the commission the sales earned)",
  "D": "Student makes misconception: multiplies_by_ten (moves the decimal one place instead of two, using 0.6 rather than 0.06, for a commission of 3000 and a total of 3400)"
},
"misconception_tag": {
  "B": "omits_constant_term",
  "C": "omits_variable_term",
  "D": "multiplies_by_ten"
}
```

---

**Proficient Level**

**5. A $40$-liter solution is $10\%$ salt. How many liters of pure salt must be added to make the solution $20\%$ salt?**

Step 1: Find the salt you start with.
- $0.10 \times 40 = 4$ liters of salt

Step 2: Let $x$ be the salt added. Both the salt and the total rise.
- Salt afterwards: $4 + x$
- Total afterwards: $40 + x$

Step 3: Set the salt to $20\%$ of the new total and solve.
- $\frac{4 + x}{40 + x} = 0.20$
- $4 + x = 8 + 0.20x$
- $0.80x = 4$, so $x = 5$

Step 4: Check. Salt is $4 + 5 = 9$, total is $40 + 5 = 45$, and $\frac{9}{45} = 0.20$. Correct.

**Answer: B** ($5$ liters)

```json
"distractor_logic": {
  "A": "Student makes misconception: percent_change_wrong_base (applies the target 20 percent to the original 40 liters for 8, then subtracts the 4 already present to get 4, holding the total fixed at 40 when the added salt raises it)",
  "B": "Correct: sets (4 + x) over (40 + x) equal to 0.20 and solves for 5 liters, giving 9 liters of salt in 45 total",
  "C": "Student makes misconception: answers_intermediate_value (computes the 8 liters of salt the final mixture must contain and reports it instead of the amount that has to be added)",
  "D": "Student makes misconception: mixture_reports_total_not_added (solves correctly but reports the 45 liter final volume rather than the 5 liters added)"
},
"misconception_tag": {
  "A": "percent_change_wrong_base",
  "C": "answers_intermediate_value",
  "D": "mixture_reports_total_not_added"
}
```

---

**6. A store discounts an item by $20\%$. By what percent must the store then mark up the sale price to return to the original price?**

Step 1: Work with \$100 to keep it concrete.
- After $20\%$ off: $100 \times 0.80 = 80$

Step 2: Find the amount needed to get back, and measure it against the sale price.
- Needed: $100 - 80 = 20$
- $\frac{20}{80} = 0.25$

Step 3: Convert.
- $0.25 = 25\%$

Step 4: Check. $80 \times 1.25 = 100$. Correct. The discount was measured against 100 and the markup against 80, which is why they are not the same percent.

**Answer: B** ($25\%$)

```json
"distractor_logic": {
  "A": "Student makes misconception: breakeven_markup_assumed_equal_to_discount (assumes the markup that undoes a 20 percent discount is itself 20 percent, ignoring that the two are measured against different bases)",
  "B": "Correct: goes from a sale price of 80 back to 100 by adding 20, and 20 over 80 is a 25 percent markup",
  "C": "Student makes misconception: answers_intermediate_value (computes the recovery factor of 1.25 and reports it as 125 percent instead of the 25 percent increase it represents)",
  "D": "Student makes misconception: new_over_original_as_change (reports the sale price as 80 percent of the original rather than the markup needed to reverse the discount)"
},
"misconception_tag": {
  "A": "breakeven_markup_assumed_equal_to_discount",
  "C": "answers_intermediate_value",
  "D": "new_over_original_as_change"
}
```

---

**7. After an $8\%$ sales tax is added, a book costs \$27. What was the price before tax?**

Step 1: Write the factor. Tax added means multiplied by $1.08$.
- $1.08n = 27$

Step 2: Divide.
- $n = 27 \div 1.08 = 25$

Step 3: Check forward. $25 \times 1.08 = 27$. Correct.

**Answer: C** (\$25)

```json
"distractor_logic": {
  "A": "Student makes misconception: percent_applied_forward_not_reversed (takes 8 percent off the 27 instead of dividing by 1.08, producing 24.84, which taxes forward to 26.83 rather than 27)",
  "B": "Student makes misconception: percent_sign_confusion (treats 8 percent as the whole number 8 and subtracts it from 27, producing 19)",
  "C": "Correct: divides 27 by the 1.08 tax factor to get 25, which checks forward to 27",
  "D": "Student makes misconception: answers_intermediate_value (computes 8 percent of the 27 for 2.16 and reports the tax amount instead of the pre-tax price)"
},
"misconception_tag": {
  "A": "percent_applied_forward_not_reversed",
  "B": "percent_sign_confusion",
  "D": "answers_intermediate_value"
}
```

---

**Advanced Level**

**8. How many liters of a $50\%$ acid solution must be mixed with $30$ liters of a $20\%$ acid solution to produce a $30\%$ acid solution?**

Step 1: Let $x$ be the liters of the $50\%$ solution. Count the acid on each side.
- Acid in: $0.50x + 0.20(30) = 0.50x + 6$
- Acid out: $0.30(x + 30) = 0.30x + 9$

Step 2: Set them equal and solve.
- $0.50x + 6 = 0.30x + 9$
- $0.20x = 3$, so $x = 15$

Step 3: Check. Acid is $0.50(15) + 6 = 13.5$, total is $15 + 30 = 45$, and $\frac{13.5}{45} = 0.30$. Correct.

**Answer: B** ($15$ liters)

```json
"distractor_logic": {
  "A": "Student makes misconception: mixture_reports_total_not_added (solves correctly but reports the 45 liter final volume rather than the 15 liters of the 50 percent solution that were added)",
  "B": "Correct: balances the acid, 0.50x + 6 = 0.30(x + 30), and solves for 15 liters, giving 13.5 liters of acid in 45 total",
  "C": "Student makes misconception: inverts_conversion_direction (inverts the mixing ratio, using two parts of the 50 percent solution to one of the 20 percent instead of one to two, producing 60)",
  "D": "Student makes misconception: answers_intermediate_value (computes 30 percent of the 30 liters given for 9 and reports that instead of solving for the unknown volume)"
},
"misconception_tag": {
  "A": "mixture_reports_total_not_added",
  "C": "inverts_conversion_direction",
  "D": "answers_intermediate_value"
}
```

---

**9. A price was increased by $10\%$ and then decreased by $20\%$, ending at \$88. What was the original price?**

Step 1: Write the combined factor. Successive percents multiply.
- $1.10 \times 0.80 = 0.88$

Step 2: Divide the ending price by it.
- $88 \div 0.88 = 100$

Step 3: Check forward. $100 \times 1.10 = 110$, then $110 \times 0.80 = 88$. Correct.

**Answer: D** (\$100)

```json
"distractor_logic": {
  "A": "Student makes misconception: percent_changes_added (treats the changes as additive for a net 10 percent decrease and divides 88 by 0.90, producing about 97.78)",
  "B": "Student makes misconception: omits_second_component (undoes only the 20 percent decrease, dividing 88 by 0.80 to reach 110, and never undoes the 10 percent increase)",
  "C": "Student makes misconception: percent_applied_forward_not_reversed (multiplies the 88 by the 0.88 combined factor instead of dividing by it, producing 77.44)",
  "D": "Correct: multiplies the factors to 0.88, divides 88 by it for an original of 100, and checks forward through 110 back to 88"
},
"misconception_tag": {
  "A": "percent_changes_added",
  "B": "omits_second_component",
  "C": "percent_applied_forward_not_reversed"
}
```

---

**10. A shop buys an item for \$60 and wants a profit equal to $25\%$ of the selling price. What should the selling price be?**

Step 1: Read the base carefully. The profit is $25\%$ of the **selling** price, not of the cost.
- Let $S$ be the selling price. Profit is $0.25S$.

Step 2: Cost is what is left of the selling price after the profit.
- $S - 0.25S = 0.75S = 60$

Step 3: Divide.
- $S = 60 \div 0.75 = 80$

Step 4: Check. Profit is $80 - 60 = 20$, and $\frac{20}{80} = 0.25$, which is $25\%$ of the selling price as required.

**Answer: B** (\$80)

```json
"distractor_logic": {
  "A": "Student makes misconception: percent_change_wrong_base (applies the 25 percent to the 60 cost instead of to the selling price, producing 75, where the profit of 15 is only 20 percent of the selling price)",
  "B": "Correct: sets 0.75S equal to the 60 cost and divides for a selling price of 80, whose 20 profit is 25 percent of 80",
  "C": "Student makes misconception: answers_intermediate_value (computes 25 percent of the 60 cost for 15 and reports the profit instead of the selling price)",
  "D": "Student makes misconception: multiplies_instead_of_divides (multiplies the 60 by 0.75 instead of dividing by it, producing 45, a selling price below cost)"
},
"misconception_tag": {
  "A": "percent_change_wrong_base",
  "C": "answers_intermediate_value",
  "D": "multiplies_instead_of_divides"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: After a $15\%$ discount, a lamp costs \$68. What was the original price?**

Step 1: Write the factor. A $15\%$ discount means paying $85\%$.
- Factor is $0.85$

Step 2: Divide.
- $68 \div 0.85 = 80$

Step 3: Check forward. $80 \times 0.85 = 68$. Correct.

**Answer: C** (\$80)

```json
"distractor_logic": {
  "A": "Student makes misconception: percent_applied_forward_not_reversed (adds 15 percent back onto the 68 instead of dividing, producing 78.20, which discounts forward to 66.47 rather than 68)",
  "B": "Student makes misconception: percent_sign_confusion (treats 15 percent as the whole number 15 and adds it to 68, producing 83)",
  "C": "Correct: divides the 68 by the 0.85 discount factor for an original price of 80, which checks forward to 68",
  "D": "Student makes misconception: answers_intermediate_value (computes 15 percent of the 68 sale price for 10.20 and reports that instead of the original price)"
},
"misconception_tag": {
  "A": "percent_applied_forward_not_reversed",
  "B": "percent_sign_confusion",
  "D": "answers_intermediate_value"
}
```

---

**Item 2: $40\%$ of a number is $26$. What is the number?**

Step 1: Write the equation.
- $0.40n = 26$

Step 2: Divide.
- $n = 26 \div 0.40 = 65$

Step 3: Check forward. $0.40 \times 65 = 26$. Correct.

**Answer: B** ($65$)

```json
"distractor_logic": {
  "A": "Student makes misconception: multiplies_instead_of_divides (multiplies 26 by 0.40 instead of dividing, producing 10.4, a number smaller than the part it contains)",
  "B": "Correct: divides 26 by the 0.40 factor to get 65, which checks forward to 26",
  "C": "Student makes misconception: percent_decimal_overshift (moves the decimal three places instead of two, dividing by 0.04 rather than 0.40, producing 650)",
  "D": "Student makes misconception: percent_sign_confusion (treats 40 percent as the whole number 40 and divides 26 by 40, producing 0.65)"
},
"misconception_tag": {
  "A": "multiplies_instead_of_divides",
  "C": "percent_decimal_overshift",
  "D": "percent_sign_confusion"
}
```

---

**Item 3: A $50$-liter solution is $12\%$ salt. How many liters of pure water must be added to dilute it to $10\%$ salt?**

Step 1: Find the salt. Adding water does not change it.
- $0.12 \times 50 = 6$ liters of salt

Step 2: Let $w$ be the water added. The salt stays at 6 and the total becomes $50 + w$.
- $\frac{6}{50 + w} = 0.10$

Step 3: Solve.
- $50 + w = 6 \div 0.10 = 60$, so $w = 10$

Step 4: Check. 6 liters of salt in 60 liters total is $\frac{6}{60} = 0.10$. Correct.

**Answer: D** ($10$ liters)

```json
"distractor_logic": {
  "A": "Student makes misconception: mixture_reports_total_not_added (solves correctly but reports the 60 liter final volume rather than the 10 liters of water added)",
  "B": "Student makes misconception: percent_change_wrong_base (applies the target 10 percent to the original 50 liters for 5, then subtracts it from the 6 liters of salt to get 1, holding the total fixed at 50 when the added water raises it)",
  "C": "Student makes misconception: answers_intermediate_value (computes the 6 liters of salt in the solution and reports it instead of the water to be added)",
  "D": "Correct: holds the salt at 6 liters, sets 6 over (50 + w) equal to 0.10, and solves for 10 liters of water"
},
"misconception_tag": {
  "A": "mixture_reports_total_not_added",
  "B": "percent_change_wrong_base",
  "C": "answers_intermediate_value"
}
```

---

**Item 4: A store discounts an item by $25\%$. By what percent must the store then mark up the sale price to return to the original price?**

Step 1: Work with \$100.
- After $25\%$ off: $100 \times 0.75 = 75$

Step 2: Measure the recovery against the sale price.
- Needed: $100 - 75 = 25$
- $\frac{25}{75} = \frac{1}{3} \approx 0.333$

Step 3: Convert.
- $\frac{1}{3} \approx 33.3\%$

Step 4: Check. $75 \times 1.333 \approx 100$. Correct.

**Answer: C** ($33.3\%$)

```json
"distractor_logic": {
  "A": "Student makes misconception: breakeven_markup_assumed_equal_to_discount (assumes the markup that undoes a 25 percent discount is itself 25 percent, ignoring that the two are measured against different bases)",
  "B": "Student makes misconception: new_over_original_as_change (reports the sale price as 75 percent of the original rather than the markup needed to reverse the discount)",
  "C": "Correct: goes from a sale price of 75 back to 100 by adding 25, and 25 over 75 is one third, a markup of about 33.3 percent",
  "D": "Student makes misconception: answers_intermediate_value (computes the recovery factor of about 1.333 and reports it as 133 percent instead of the 33.3 percent increase it represents)"
},
"misconception_tag": {
  "A": "breakeven_markup_assumed_equal_to_discount",
  "B": "new_over_original_as_change",
  "D": "answers_intermediate_value"
}
```
