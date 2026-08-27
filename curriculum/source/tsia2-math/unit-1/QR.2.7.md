---
topic_name: "Unit conversion between systems"
unit_number: 1
sequence_in_unit: 11
assessment_layer: "CRC"
estimated_time_minutes: 55
difficulty_band: "Proficient"
related_strand: "QR"
keywords: ["unit conversion", "metric to customary", "conversion factor", "square units", "temperature conversion", "Celsius", "Fahrenheit"]
---

# QR.2.7 - Unit Conversion Between Systems

**Topic ID:** QR.2.7  
**Unit:** 1  
**Strand:** QR (Quantitative Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### The Factor Is Given to You

Converting between the metric and customary systems works exactly like QR.2.6, with one difference that makes it easier and one that makes it harder.

Easier: **you are always given the conversion factor.** Nobody expects you to know that an inch is 2.54 centimeters. The test prints it.

Harder: the factors are ugly. $2.54$, $1.61$, $2.2$, $3.79$. Ugly numbers invite two specific mistakes that clean numbers do not, and both are worth naming before you start.

The direction rule from QR.2.6 still does all the work: **smaller unit, bigger number.** A centimeter is smaller than an inch, so 10 inches is 25.4 centimeters, and the number grew. If you had divided and got $3.94$, the direction alone tells you it is wrong.

---

##### The Mistake That Costs the Most Points

You round the conversion factor, and your answer lands next to the right one instead of on it.

Convert 80 kilometers to miles, given $1$ mile $\approx 1.61$ km.

Miles are bigger, so divide: $80 \div 1.61 = 49.7$ miles.

But $1.61$ is awkward, and $1.6$ is right there. $80 \div 1.6 = 50$. Clean. Satisfying. Wrong.

Here is why this error is more dangerous than an ordinary slip. A wrong answer from bad arithmetic is usually far away, so it stands out. A rounded factor produces an answer that is **almost** right, and the test writers know it: $50$ will be sitting in the option list next to $49.7$, looking like the tidy answer a correct solution ought to produce.

**Use the factor exactly as printed, and round only at the very end, only if asked.** If two options differ by a percent or two, that is the signal this trap is being set.

---

##### Straight Conversions

**Example 1:** Convert 15 kilograms to pounds, given $1$ kg $\approx 2.2$ lb.

Pounds are the smaller unit here, so the number grows: $15 \times 2.2 = 33$ pounds.

**Example 2:** Convert 20 pounds to kilograms, same factor.

Now you are going the other way, to the bigger unit, so the number shrinks: $20 \div 2.2 \approx 9.09$ kilograms.

Same factor, opposite operation, and the direction rule tells you which without any memorizing. A person weighing 20 pounds' worth of kilograms should be a small number. 44 would be absurd.

---

##### Square Units Need a Squared Factor

This is the one genuinely new idea in the topic, and it is missed constantly.

**Example 3:** A room is 12 square meters. How many square feet, given $1$ m $\approx 3.28$ ft?

The tempting move is $12 \times 3.28 = 39.36$. That is wrong, and not slightly.

Think about what a square meter is: a square 1 meter on each side. In feet, that square is $3.28$ feet on each side. Its area is

$$3.28 \times 3.28 = 10.7584 \text{ square feet}$$

**Both dimensions convert.** So one square meter is not 3.28 square feet, it is about 10.76 of them.

$$12 \times 10.7584 \approx 129.1 \text{ square feet}$$

The check that makes this stick: a square meter is a bit more than a yard on a side, so it is a bit more than 9 square feet. About 10.76. That is in the right neighbourhood, and 3.28 is not.

**Linear factor for lengths. Squared factor for areas. Cubed factor for volumes.** The same logic runs all the way up: a cubic meter is $3.28^3 \approx 35.3$ cubic feet.

---

##### Temperature Is Not a Conversion Factor

Every other conversion in this unit is a multiplication. Temperature is not, and that is why it gets its own section.

$$F = \frac{9}{5}C + 32 \qquad C = \frac{5}{9}(F - 32)$$

There is a $+32$ in there, and it is not decoration. It is there because the two scales do not start at the same place: water freezes at $0$ Celsius and $32$ Fahrenheit. A pure multiplication would force both scales to agree at zero, and they do not.

**Example 4:** Convert 25 degrees Celsius to Fahrenheit.

- $\frac{9}{5} \times 25 = 45$
- $45 + 32 = 77$ degrees Fahrenheit

Dropping the 32 gives 45, which is chilly, when 25 Celsius is a warm day. The offset is most of the answer.

**Example 5:** Convert 98.6 degrees Fahrenheit to Celsius.

Going this way you subtract **first**, then multiply.

- $98.6 - 32 = 66.6$
- $\frac{5}{9} \times 66.6 = 37$ degrees Celsius

The parentheses in $\frac{5}{9}(F - 32)$ are load-bearing. Multiplying first gives $98.6 \times \frac{5}{9} = 54.8$, then subtracting 32 gives $22.8$, and neither is body temperature.

**Going to Fahrenheit: multiply, then add. Going to Celsius: subtract, then multiply.** The offset moves to the opposite end and changes sign.

Two anchors worth carrying: $0$ C is $32$ F, and $100$ C is $212$ F. If an answer is not between those in a sensible way, recheck.

---

##### Converting a Rate

**Example 6:** A car gets 32 miles per gallon. What is that in kilometers per liter, given $1$ mile $\approx 1.61$ km and $1$ gallon $\approx 3.79$ L?

A rate has a unit on top and a unit underneath, and **both have to be converted**. Take them one at a time.

- Top: $32 \times 1.61 = 51.52$ kilometers per gallon.
- Bottom: those 51.52 kilometers still come from one gallon, which is 3.79 liters, so divide: $51.52 \div 3.79 \approx 13.59$ kilometers per liter.

Convert the top and stop and you have 51.52, a real quantity in the wrong units. The direction check catches it: a liter is much smaller than a gallon, so kilometers **per liter** must be a much smaller number than kilometers per gallon.

---

##### The Four Traps

1. **Rounding the given factor.** Use $1.61$, not $1.6$. The tidy answer is the trap.
2. **Using the linear factor on an area.** Square the factor. A square meter is about 10.76 square feet, not 3.28.
3. **Dropping the $+32$, or applying it at the wrong end.** To Fahrenheit: multiply then add. To Celsius: subtract then multiply.
4. **Converting only half of a rate.** Top and bottom both change.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking. Use the conversion factors exactly as given.

**Basic Level** (try these first)

1. Convert $10$ inches to centimeters, given that $1$ inch $= 2.54$ centimeters.
   - A) $25.4$ centimeters
   - B) $3.94$ centimeters
   - C) $25$ centimeters
   - D) $254$ centimeters

2. Convert $15$ kilograms to pounds, given that $1$ kilogram $\approx 2.2$ pounds.
   - A) $6.82$ pounds
   - B) $30$ pounds
   - C) $33$ pounds
   - D) $330$ pounds

3. Convert $80$ kilometers to miles, given that $1$ mile $\approx 1.61$ kilometers.
   - A) $128.8$ miles
   - B) $49.7$ miles
   - C) $50$ miles
   - D) $4.97$ miles

4. Convert $25$ degrees Celsius to Fahrenheit, using $F = \frac{9}{5}C + 32$.
   - A) $45$ degrees Fahrenheit
   - B) $102.6$ degrees Fahrenheit
   - C) $-3.89$ degrees Fahrenheit
   - D) $77$ degrees Fahrenheit

**Proficient Level** (these require an extra step)

5. A room has an area of $12$ square meters. What is its area in square feet, given that $1$ meter $\approx 3.28$ feet?
   - A) $39.36$ square feet
   - B) $129.1$ square feet
   - C) $1.12$ square feet
   - D) $130.7$ square feet

6. A car's fuel tank holds $15$ gallons. How many liters is that, given that $1$ gallon $\approx 3.79$ liters?
   - A) $3.96$ liters
   - B) $57$ liters
   - C) $568.5$ liters
   - D) $56.85$ liters

7. Convert $98.6$ degrees Fahrenheit to Celsius, using $C = \frac{5}{9}(F - 32)$.
   - A) $54.8$ degrees Celsius
   - B) $22.8$ degrees Celsius
   - C) $37$ degrees Celsius
   - D) $209.5$ degrees Celsius

**Advanced Level** (these need multiple steps or reverse thinking)

8. A field has an area of $2{,}400$ square feet. What is its area in square meters, given that $1$ meter $\approx 3.28$ feet?
   - A) $731.7$ square meters
   - B) $25{,}820$ square meters
   - C) $223.1$ square meters
   - D) $220.4$ square meters

9. A car's fuel economy is $32$ miles per gallon. What is that in kilometers per liter, given that $1$ mile $\approx 1.61$ kilometers and $1$ gallon $\approx 3.79$ liters?
   - A) $75.33$ kilometers per liter
   - B) $51.52$ kilometers per liter
   - C) $13.47$ kilometers per liter
   - D) $13.59$ kilometers per liter

10. At what temperature do the Fahrenheit and Celsius scales show the same number?
    - A) $0$ degrees
    - B) $-40$ degrees
    - C) $32$ degrees
    - D) $40$ degrees

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Convert $6$ inches to centimeters, given that $1$ inch $= 2.54$ centimeters.

- A) $2.36$ centimeters
- B) $15$ centimeters
- C) $15.24$ centimeters
- D) $152.4$ centimeters

**Item 2**

Convert $40$ degrees Celsius to Fahrenheit, using $F = \frac{9}{5}C + 32$.

- A) $72$ degrees Fahrenheit
- B) $104$ degrees Fahrenheit
- C) $129.6$ degrees Fahrenheit
- D) $4.44$ degrees Fahrenheit

**Proficient Level**

**Item 3**

A tabletop has an area of $5$ square meters. What is its area in square feet, given that $1$ meter $\approx 3.28$ feet?

- A) $16.4$ square feet
- B) $54.45$ square feet
- C) $0.46$ square feet
- D) $53.8$ square feet

**Basic Level**

**Item 4**

Convert $20$ pounds to kilograms, given that $1$ kilogram $\approx 2.2$ pounds.

- A) $9.09$ kilograms
- B) $44$ kilograms
- C) $10$ kilograms
- D) $0.909$ kilograms

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Convert $10$ inches to centimeters, given that $1$ inch $= 2.54$ centimeters.**

Step 1: Centimeters are smaller than inches, so the number must grow. Multiply.
- $10 \times 2.54 = 25.4$

Step 2: Check the direction. The number grew, as a move to a smaller unit requires.

**Answer: A** ($25.4$ centimeters)

```json
"distractor_logic": {
  "A": "Correct: multiplies 10 inches by the exact factor 2.54 to get 25.4 centimeters",
  "B": "Student makes misconception: inverts_conversion_direction (divides 10 by 2.54 instead of multiplying, producing 3.94 when a move to a smaller unit must give a bigger number)",
  "C": "Student makes misconception: conversion_factor_rounded (rounds the 2.54 to 2.5 before multiplying, producing 25 instead of 25.4)",
  "D": "Student makes misconception: place_value_slip (multiplies correctly but misplaces the decimal, reporting 254 instead of 25.4)"
},
"misconception_tag": {
  "B": "inverts_conversion_direction",
  "C": "conversion_factor_rounded",
  "D": "place_value_slip"
}
```

---

**2. Convert $15$ kilograms to pounds, given that $1$ kilogram $\approx 2.2$ pounds.**

Step 1: Pounds are smaller than kilograms, so multiply.
- $15 \times 2.2 = 33$

Step 2: Check the direction. The number grew. Correct.

**Answer: C** ($33$ pounds)

```json
"distractor_logic": {
  "A": "Student makes misconception: inverts_conversion_direction (divides 15 by 2.2 instead of multiplying, producing 6.82 when a move to a smaller unit must give a bigger number)",
  "B": "Student makes misconception: conversion_factor_rounded (rounds the 2.2 to 2 before multiplying, producing 30 instead of 33)",
  "C": "Correct: multiplies 15 kilograms by 2.2 to get 33 pounds",
  "D": "Student makes misconception: place_value_slip (multiplies correctly but misplaces the decimal, reporting 330 instead of 33)"
},
"misconception_tag": {
  "A": "inverts_conversion_direction",
  "B": "conversion_factor_rounded",
  "D": "place_value_slip"
}
```

---

**3. Convert $80$ kilometers to miles, given that $1$ mile $\approx 1.61$ kilometers.**

Step 1: Miles are bigger than kilometers, so the number must shrink. Divide.
- $80 \div 1.61 \approx 49.7$

Step 2: Check the direction. The number shrank, as a move to a bigger unit requires.

**Answer: B** ($49.7$ miles)

```json
"distractor_logic": {
  "A": "Student makes misconception: inverts_conversion_direction (multiplies 80 by 1.61 instead of dividing, producing 128.8 when a move to a bigger unit must give a smaller number)",
  "B": "Correct: divides 80 by the exact factor 1.61 to get about 49.7 miles",
  "C": "Student makes misconception: conversion_factor_rounded (rounds the 1.61 to 1.6 before dividing, producing exactly 50, an answer that sits right beside the correct one)",
  "D": "Student makes misconception: place_value_slip (divides correctly but misplaces the decimal, reporting 4.97 instead of 49.7)"
},
"misconception_tag": {
  "A": "inverts_conversion_direction",
  "C": "conversion_factor_rounded",
  "D": "place_value_slip"
}
```

---

**4. Convert $25$ degrees Celsius to Fahrenheit, using $F = \frac{9}{5}C + 32$.**

Step 1: Multiply first.
- $\frac{9}{5} \times 25 = 45$

Step 2: Then add the offset.
- $45 + 32 = 77$

Step 3: Check against an anchor. $0$ C is $32$ F, so a warm 25 C should be comfortably above 32 F. 77 is. Correct.

**Answer: D** ($77$ degrees Fahrenheit)

```json
"distractor_logic": {
  "A": "Student makes misconception: temperature_offset_omitted (multiplies by 9/5 for 45 and never adds the 32, giving a chilly reading for a warm day)",
  "B": "Student makes misconception: order_of_operations_violated (adds the 32 before multiplying, computing 57 times 9/5 for 102.6 instead of multiplying first)",
  "C": "Student makes misconception: inverts_conversion_direction (uses the Fahrenheit to Celsius formula in the wrong direction, computing 5/9 of 25 minus 32 for about -3.89)",
  "D": "Correct: multiplies 25 by 9/5 for 45, then adds the 32 offset to get 77"
},
"misconception_tag": {
  "A": "temperature_offset_omitted",
  "B": "order_of_operations_violated",
  "C": "inverts_conversion_direction"
}
```

---

**Proficient Level**

**5. A room has an area of $12$ square meters. What is its area in square feet, given that $1$ meter $\approx 3.28$ feet?**

Step 1: This is an area, so the factor must be squared. Both dimensions convert.
- $3.28 \times 3.28 = 10.7584$ square feet in one square meter

Step 2: Multiply.
- $12 \times 10.7584 \approx 129.1$ square feet

Step 3: Check. A square meter is a little more than a square yard, which is 9 square feet, so about 10.76 is right and 3.28 is not.

**Answer: B** ($129.1$ square feet)

```json
"distractor_logic": {
  "A": "Student makes misconception: area_conversion_factor_not_squared (applies the linear 3.28 to an area, producing 39.36 when both dimensions of the square have to convert)",
  "B": "Correct: squares the factor to 10.7584 square feet per square meter, then multiplies by 12 for about 129.1",
  "C": "Student makes misconception: inverts_conversion_direction (divides 12 by 10.7584 instead of multiplying, producing 1.12 when square feet are smaller and must give a bigger number)",
  "D": "Student makes misconception: conversion_factor_rounded (rounds the 3.28 to 3.3 before squaring, using 10.89 and producing about 130.7 instead of 129.1)"
},
"misconception_tag": {
  "A": "area_conversion_factor_not_squared",
  "C": "inverts_conversion_direction",
  "D": "conversion_factor_rounded"
}
```

---

**6. A car's fuel tank holds $15$ gallons. How many liters is that, given that $1$ gallon $\approx 3.79$ liters?**

Step 1: Liters are smaller than gallons, so multiply.
- $15 \times 3.79 = 56.85$ liters

Step 2: Check the direction. The number grew. Correct.

**Answer: D** ($56.85$ liters)

```json
"distractor_logic": {
  "A": "Student makes misconception: inverts_conversion_direction (divides 15 by 3.79 instead of multiplying, producing 3.96 when a move to a smaller unit must give a bigger number)",
  "B": "Student makes misconception: conversion_factor_rounded (rounds the 3.79 to 3.8 before multiplying, producing exactly 57 instead of 56.85)",
  "C": "Student makes misconception: place_value_slip (multiplies correctly but misplaces the decimal, reporting 568.5 instead of 56.85)",
  "D": "Correct: multiplies 15 gallons by 3.79 to get 56.85 liters"
},
"misconception_tag": {
  "A": "inverts_conversion_direction",
  "B": "conversion_factor_rounded",
  "C": "place_value_slip"
}
```

---

**7. Convert $98.6$ degrees Fahrenheit to Celsius, using $C = \frac{5}{9}(F - 32)$.**

Step 1: Going to Celsius, subtract first. The parentheses say so.
- $98.6 - 32 = 66.6$

Step 2: Then multiply.
- $\frac{5}{9} \times 66.6 = 37$

Step 3: Check. $98.6$ F is body temperature, which is $37$ C. Correct.

**Answer: C** ($37$ degrees Celsius)

```json
"distractor_logic": {
  "A": "Student makes misconception: temperature_offset_omitted (multiplies 98.6 by 5/9 for about 54.8 and never subtracts the 32)",
  "B": "Student makes misconception: order_of_operations_violated (multiplies before subtracting, computing 5/9 of 98.6 and then taking away 32, producing about 22.8 rather than working inside the parentheses first)",
  "C": "Correct: subtracts 32 for 66.6, then multiplies by 5/9 to get 37 degrees Celsius",
  "D": "Student makes misconception: inverts_conversion_direction (uses the Celsius to Fahrenheit formula in the wrong direction, computing 9/5 of 98.6 plus 32 for about 209.5)"
},
"misconception_tag": {
  "A": "temperature_offset_omitted",
  "B": "order_of_operations_violated",
  "D": "inverts_conversion_direction"
}
```

---

**Advanced Level**

**8. A field has an area of $2{,}400$ square feet. What is its area in square meters, given that $1$ meter $\approx 3.28$ feet?**

Step 1: Square the factor, because this is an area.
- $3.28^2 = 10.7584$ square feet in one square meter

Step 2: Square meters are bigger than square feet, so the number must shrink. Divide.
- $2400 \div 10.7584 \approx 223.1$ square meters

Step 3: Check the direction. The number shrank by roughly a factor of ten, which is what a square meter being about 10.76 square feet should do.

**Answer: C** ($223.1$ square meters)

```json
"distractor_logic": {
  "A": "Student makes misconception: area_conversion_factor_not_squared (divides by the linear 3.28 instead of by its square, producing about 731.7)",
  "B": "Student makes misconception: inverts_conversion_direction (multiplies 2400 by 10.7584 instead of dividing, producing about 25,820 when a move to a bigger unit must give a smaller number)",
  "C": "Correct: squares the factor to 10.7584, then divides 2400 by it for about 223.1 square meters",
  "D": "Student makes misconception: conversion_factor_rounded (rounds the 3.28 to 3.3 before squaring, dividing by 10.89 and producing about 220.4 instead of 223.1)"
},
"misconception_tag": {
  "A": "area_conversion_factor_not_squared",
  "B": "inverts_conversion_direction",
  "D": "conversion_factor_rounded"
}
```

---

**9. A car's fuel economy is $32$ miles per gallon. What is that in kilometers per liter, given that $1$ mile $\approx 1.61$ kilometers and $1$ gallon $\approx 3.79$ liters?**

Step 1: Convert the top. Kilometers are smaller than miles, so multiply.
- $32 \times 1.61 = 51.52$ kilometers per gallon

Step 2: Convert the bottom. Those kilometers come from one gallon, which is 3.79 liters, so divide.
- $51.52 \div 3.79 \approx 13.59$ kilometers per liter

Step 3: Check the direction. A liter is much smaller than a gallon, so a car goes far fewer kilometers on one, and $13.59$ is much less than $51.52$. Correct.

**Answer: D** ($13.59$ kilometers per liter)

```json
"distractor_logic": {
  "A": "Student makes misconception: inverts_conversion_direction (multiplies by 3.79 and divides by 1.61, inverting both halves of the rate, producing about 75.33)",
  "B": "Student makes misconception: omits_second_component (converts the miles to kilometers for 51.52 and stops, never converting gallons to liters, so the answer is still per gallon)",
  "C": "Student makes misconception: conversion_factor_rounded (rounds 1.61 to 1.6 and 3.79 to 3.8, producing about 13.47 instead of 13.59)",
  "D": "Correct: multiplies by 1.61 for 51.52 kilometers per gallon, then divides by 3.79 for about 13.59 kilometers per liter"
},
"misconception_tag": {
  "A": "inverts_conversion_direction",
  "B": "omits_second_component",
  "C": "conversion_factor_rounded"
}
```

---

**10. At what temperature do the Fahrenheit and Celsius scales show the same number?**

Step 1: "Same number" means $F = C$. Substitute $C$ for $F$ in the formula.
- $C = \frac{9}{5}C + 32$

Step 2: Collect the $C$ terms.
- $C - \frac{9}{5}C = 32$
- $-\frac{4}{5}C = 32$

Step 3: Solve.
- $C = 32 \div \left(-\frac{4}{5}\right) = -40$

Step 4: Check both directions. $\frac{9}{5}(-40) + 32 = -72 + 32 = -40$. The scales agree at $-40$.

**Answer: B** ($-40$ degrees)

```json
"distractor_logic": {
  "A": "Student makes misconception: temperature_offset_omitted (drops the 32 and solves C = 9/5 C, which gives 0, the temperature the scales would share if there were no offset)",
  "B": "Correct: sets F equal to C, solves -4/5 C = 32 for -40, and verifies that 9/5 of -40 plus 32 returns -40",
  "C": "Student makes misconception: answers_intermediate_value (reports the 32 offset itself as the temperature where the scales meet)",
  "D": "Student makes misconception: drops_negative_sign (solves correctly in magnitude but reports 40 instead of -40)"
},
"misconception_tag": {
  "A": "temperature_offset_omitted",
  "C": "answers_intermediate_value",
  "D": "drops_negative_sign"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Convert $6$ inches to centimeters, given that $1$ inch $= 2.54$ centimeters.**

Step 1: Centimeters are smaller, so multiply.
- $6 \times 2.54 = 15.24$

Step 2: Check the direction. The number grew. Correct.

**Answer: C** ($15.24$ centimeters)

```json
"distractor_logic": {
  "A": "Student makes misconception: inverts_conversion_direction (divides 6 by 2.54 instead of multiplying, producing about 2.36 when a move to a smaller unit must give a bigger number)",
  "B": "Student makes misconception: conversion_factor_rounded (rounds the 2.54 to 2.5 before multiplying, producing exactly 15 instead of 15.24)",
  "C": "Correct: multiplies 6 inches by the exact factor 2.54 to get 15.24 centimeters",
  "D": "Student makes misconception: place_value_slip (multiplies correctly but misplaces the decimal, reporting 152.4 instead of 15.24)"
},
"misconception_tag": {
  "A": "inverts_conversion_direction",
  "B": "conversion_factor_rounded",
  "D": "place_value_slip"
}
```

---

**Item 2: Convert $40$ degrees Celsius to Fahrenheit, using $F = \frac{9}{5}C + 32$.**

Step 1: Multiply first.
- $\frac{9}{5} \times 40 = 72$

Step 2: Add the offset.
- $72 + 32 = 104$

Step 3: Check against an anchor. $100$ C is $212$ F, so $40$ C should land well below that. It does.

**Answer: B** ($104$ degrees Fahrenheit)

```json
"distractor_logic": {
  "A": "Student makes misconception: temperature_offset_omitted (multiplies by 9/5 for 72 and never adds the 32)",
  "B": "Correct: multiplies 40 by 9/5 for 72, then adds the 32 offset to get 104",
  "C": "Student makes misconception: order_of_operations_violated (adds the 32 before multiplying, computing 72 times 9/5 for 129.6 instead of multiplying first)",
  "D": "Student makes misconception: inverts_conversion_direction (uses the Fahrenheit to Celsius formula in the wrong direction, computing 5/9 of 40 minus 32 for about 4.44)"
},
"misconception_tag": {
  "A": "temperature_offset_omitted",
  "C": "order_of_operations_violated",
  "D": "inverts_conversion_direction"
}
```

---

**Item 3: A tabletop has an area of $5$ square meters. What is its area in square feet, given that $1$ meter $\approx 3.28$ feet?**

Step 1: Square the factor.
- $3.28^2 = 10.7584$ square feet per square meter

Step 2: Multiply.
- $5 \times 10.7584 \approx 53.8$ square feet

Step 3: Check. A square meter is a bit more than the 9 square feet in a square yard, so 5 of them should be a little over 45. Correct.

**Answer: D** ($53.8$ square feet)

```json
"distractor_logic": {
  "A": "Student makes misconception: area_conversion_factor_not_squared (applies the linear 3.28 to an area, producing 16.4 when both dimensions of the square have to convert)",
  "B": "Student makes misconception: conversion_factor_rounded (rounds the 3.28 to 3.3 before squaring, using 10.89 and producing 54.45 instead of 53.8)",
  "C": "Student makes misconception: inverts_conversion_direction (divides 5 by 10.7584 instead of multiplying, producing about 0.46 when square feet are smaller and must give a bigger number)",
  "D": "Correct: squares the factor to 10.7584 square feet per square meter, then multiplies by 5 for about 53.8"
},
"misconception_tag": {
  "A": "area_conversion_factor_not_squared",
  "B": "conversion_factor_rounded",
  "C": "inverts_conversion_direction"
}
```

---

**Item 4: Convert $20$ pounds to kilograms, given that $1$ kilogram $\approx 2.2$ pounds.**

Step 1: Kilograms are bigger than pounds, so the number must shrink. Divide.
- $20 \div 2.2 \approx 9.09$ kilograms

Step 2: Check the direction. The number shrank. Correct.

**Answer: A** ($9.09$ kilograms)

```json
"distractor_logic": {
  "A": "Correct: divides 20 pounds by 2.2 to get about 9.09 kilograms",
  "B": "Student makes misconception: inverts_conversion_direction (multiplies 20 by 2.2 instead of dividing, producing 44 when a move to a bigger unit must give a smaller number)",
  "C": "Student makes misconception: conversion_factor_rounded (rounds the 2.2 to 2 before dividing, producing exactly 10 instead of 9.09)",
  "D": "Student makes misconception: place_value_slip (divides correctly but misplaces the decimal, reporting 0.909 instead of 9.09)"
},
"misconception_tag": {
  "B": "inverts_conversion_direction",
  "C": "conversion_factor_rounded",
  "D": "place_value_slip"
}
```
