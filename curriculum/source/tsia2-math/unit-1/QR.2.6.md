---
topic_name: "Unit conversion within a system"
unit_number: 1
sequence_in_unit: 10
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Basic"
related_strand: "QR"
keywords: ["unit conversion", "metric", "customary", "conversion factor", "fence post", "net rate", "multi-step conversion"]
---

# QR.2.6 - Unit Conversion Within a System

**Topic ID:** QR.2.6  
**Unit:** 1  
**Strand:** QR (Quantitative Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Convert between units in the same system using the correct direction: a smaller unit produces a bigger number.
- Carry a multi-step unit conversion through to completion, matching the final unit to the one the question asks for.
- Apply the correct fence-post count for a straight run versus a closed loop, and net opposing rates by subtracting.

---

#### **Part 1: Guided Notes**

##### Bigger Unit, Smaller Number

Every conversion question comes down to one decision: multiply or divide. Get that right and the arithmetic is trivial. Get it wrong and you are off by a factor of 144 with a straight face.

There is a single rule that decides it, and it needs no memorized table.

**Going to a smaller unit gives you a bigger number. Going to a bigger unit gives you a smaller number.**

Feet are smaller than yards, so 3 yards is 9 feet: the number went up. Grams are smaller than kilograms, so 2.5 kilograms is 2500 grams: up again. Going the other way, 2500 grams is 2.5 kilograms: the number came down.

That is the whole rule, and it is self-checking. If you convert 3 yards to feet and get $0.083$, you do not need to know the conversion factor to know you are wrong. Feet are smaller. The number had to grow.

**Do the conversion, then ask whether the number moved the direction it should have.** This one check catches almost every conversion error on the test.

---

##### The Mistake That Costs the Most Points

You stop partway through a chain.

How many inches are in 3 yards?

There is no direct yards-to-inches step most people have memorized, so you go through feet:

- $3 \text{ yards} \times 3 = 9 \text{ feet}$
- $9 \text{ feet} \times 12 = 108 \text{ inches}$

The error is writing down 9. You did a correct conversion and then answered with it. It is the same failure as stopping at the scale factor in QR.2.2, and it feels the same from the inside: you computed something real, so you feel finished.

The defence is the same too. **Name the unit of your answer out loud and compare it with the unit in the question.** The question said inches. 9 is feet. That is a three-second check and it never fails you.

A cousin of this error is skipping the middle step entirely: $3 \times 12 = 36$, treating yards as if they were feet. Same fix. 36 inches is 1 yard, so 3 yards cannot be 36 inches.

---

##### Chains

**Example 1:** A recipe calls for 3 gallons of stock. How many cups is that?

Nobody memorizes gallons to cups. You walk the chain you do know.

- $1$ gallon $= 4$ quarts
- $1$ quart $= 2$ pints
- $1$ pint $= 2$ cups

So one gallon is $4 \times 2 \times 2 = 16$ cups, and 3 gallons is $3 \times 16 = 48$ cups.

Every step goes to a smaller unit, so every step multiplies and the number grows the whole way: 3, 12, 24, 48. If any step in a chain moves the number the wrong direction, that is where the error is.

Note that 16 is the cups **per gallon**, not the answer. The question asked about 3 gallons.

---

##### Decimals Convert Too

**Example 2:** Convert $2.75$ liters to milliliters.

Milliliters are smaller, so multiply: $2.75 \times 1000 = 2750$ mL.

The error worth naming here is converting the 2 and forgetting the $.75$, which gives 2000. The decimal part is not decoration. $0.75$ of a liter is 750 millilitres, which is most of a large drink.

**Convert the whole quantity, not the whole number in front of it.**

---

##### Fence Posts

This one shows up on the test more than it should, and it is not really about units at all. It is about counting.

**Example 3:** Posts are set every 4 feet along a straight 40-foot fence, with a post at each end. How many posts?

$40 \div 4 = 10$. That 10 is the number of **gaps**, not the number of posts.

Draw a short version. A 12-foot fence with posts every 4 feet:

```
|----|----|----|
0    4    8    12
```

Three gaps. Four posts. **On a straight run, posts = gaps + 1**, because the far end needs a post and no gap follows it.

So the 40-foot fence needs $10 + 1 = 11$ posts.

Now the twist that catches people who learned the rule: **on a closed loop there is no extra post.** Go around a rectangular garden and the last gap brings you back to the first post, so posts = gaps exactly. A 84-foot perimeter with posts every 6 feet needs $84 \div 6 = 14$ posts, not 15.

**Ask whether the run ends or comes back on itself.** That decides the $+1$.

---

##### Rates That Work Against Each Other

**Example 4:** A tank fills at 12 gallons per minute and drains at 5 gallons per minute at the same time. How long to add 210 gallons?

The two rates do not add. They fight, so they **subtract**.

- Net rate: $12 - 5 = 7$ gallons per minute
- Time: $210 \div 7 = 30$ minutes

Adding them to 17 gives 12.35 minutes, which claims the tank fills faster because it is also draining. That cannot be true, and noticing that it cannot be true is the check.

**When something works against the flow, net the rates before you divide.** This is the same reasoning as the catch-up problems in QR.2.2: same direction, subtract.

---

##### The Four Traps

1. **Stopping partway through a chain.** Say the unit of your answer and compare it with the question.
2. **Converting the wrong direction.** Smaller unit means bigger number. Check the direction before you move on.
3. **Forgetting the $+1$, or adding it on a loop.** A straight run has one more post than gaps. A closed loop has exactly as many.
4. **Adding rates that oppose each other.** Fill against drain nets out. The answer must be slower than the fill rate alone.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. How many inches are in $3$ yards?
   - A) $9$ inches
   - B) $36$ inches
   - C) $108$ inches
   - D) $0.083$ inches

2. Convert $4.5$ kilometers to meters.
   - A) $4000$ meters
   - B) $4500$ meters
   - C) $0.0045$ meters
   - D) $450$ meters

3. Convert $2.75$ liters to milliliters.
   - A) $2000$ milliliters
   - B) $275$ milliliters
   - C) $0.00275$ milliliters
   - D) $2750$ milliliters

4. Fence posts are placed every $4$ feet along a straight $40$-foot fence, with a post at each end. How many posts are needed?
   - A) $11$ posts
   - B) $10$ posts
   - C) $12$ posts
   - D) $160$ posts

**Proficient Level** (these require an extra step)

5. A tank is filled at $12$ gallons per minute while simultaneously draining at $5$ gallons per minute. How long does it take to add $210$ gallons?
   - A) $12.35$ minutes
   - B) $17.5$ minutes
   - C) $30$ minutes
   - D) $7$ minutes

6. A recipe calls for $3$ gallons of stock. How many cups is that? (There are $4$ quarts in a gallon, $2$ pints in a quart, and $2$ cups in a pint.)
   - A) $24$ cups
   - B) $48$ cups
   - C) $0.1875$ cups
   - D) $16$ cups

7. A car's fuel tank holds $16$ gallons. While idling, the car burns $3$ quarts of fuel per hour. How many hours of idling would empty a full tank? (There are $4$ quarts in a gallon.)
   - A) $5.33$ hours
   - B) $192$ hours
   - C) $21.33$ hours
   - D) $1.33$ hours

**Advanced Level** (these need multiple steps or reverse thinking)

8. A rectangular garden measures $24$ feet by $18$ feet. Fence posts are set every $6$ feet around the entire perimeter, with a post at each corner. How many posts are needed?
   - A) $15$ posts
   - B) $7$ posts
   - C) $504$ posts
   - D) $14$ posts

9. A pipe delivers $250$ milliliters of water per second. How many liters does it deliver in $4$ minutes?
   - A) $60$ liters
   - B) $60{,}000$ liters
   - C) $1$ liter
   - D) $240$ liters

10. A reservoir gains $3{,}000$ liters per hour from a stream and loses $800$ liters per hour to evaporation. Starting empty, how many kiloliters does it hold after $5$ hours? (There are $1{,}000$ liters in a kiloliter.)
    - A) $19$ kiloliters
    - B) $11{,}000$ kiloliters
    - C) $15$ kiloliters
    - D) $11$ kiloliters

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

How many inches are in $5$ yards?

- A) $15$ inches
- B) $180$ inches
- C) $60$ inches
- D) $0.14$ inches

**Item 2**

Convert $3.25$ kilograms to grams.

- A) $3000$ grams
- B) $325$ grams
- C) $3250$ grams
- D) $0.00325$ grams

**Item 3**

Posts are placed every $5$ feet along a straight $60$-foot rail, with a post at each end. How many posts are needed?

- A) $12$ posts
- B) $14$ posts
- C) $300$ posts
- D) $13$ posts

**Proficient Level**

**Item 4**

A tub fills at $9$ liters per minute while draining at $4$ liters per minute. How long does it take to reach $60$ liters?

- A) $12$ minutes
- B) $4.6$ minutes
- C) $6.67$ minutes
- D) $5$ minutes

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. How many inches are in $3$ yards?**

Step 1: Yards to feet. Feet are smaller, so multiply.
- $3 \times 3 = 9$ feet

Step 2: Feet to inches. Inches are smaller, so multiply again.
- $9 \times 12 = 108$ inches

Step 3: Check the unit. The question asked for inches, and the number grew at every step as it should.

**Answer: C** ($108$ inches)

```json
"distractor_logic": {
  "A": "Student makes misconception: conversion_stopped_one_step_early (converts yards to the 9 feet correctly and reports that, never converting on to inches)",
  "B": "Student makes misconception: omits_second_component (multiplies 3 by 12 directly, skipping the yards to feet step, producing 36, which is the number of inches in a single yard)",
  "C": "Correct: converts 3 yards to 9 feet, then 9 feet to 108 inches",
  "D": "Student makes misconception: inverts_conversion_direction (divides 3 by 36 instead of multiplying, producing 0.083 when converting to a smaller unit must give a bigger number)"
},
"misconception_tag": {
  "A": "conversion_stopped_one_step_early",
  "B": "omits_second_component",
  "D": "inverts_conversion_direction"
}
```

---

**2. Convert $4.5$ kilometers to meters.**

Step 1: Meters are smaller than kilometers, so multiply.
- $4.5 \times 1000 = 4500$ meters

Step 2: Check the direction. The number grew, which is what a move to a smaller unit must do.

**Answer: B** ($4500$ meters)

```json
"distractor_logic": {
  "A": "Student makes misconception: converts_whole_number_part_only (converts the 4 kilometers to 4000 meters and drops the 0.5, which is another 500 meters)",
  "B": "Correct: multiplies 4.5 by 1000 to get 4500 meters",
  "C": "Student makes misconception: inverts_conversion_direction (divides by 1000 instead of multiplying, producing 0.0045 when a move to a smaller unit must give a bigger number)",
  "D": "Student makes misconception: place_value_slip (moves the decimal two places instead of three, producing 450)"
},
"misconception_tag": {
  "A": "converts_whole_number_part_only",
  "C": "inverts_conversion_direction",
  "D": "place_value_slip"
}
```

---

**3. Convert $2.75$ liters to milliliters.**

Step 1: Milliliters are smaller, so multiply.
- $2.75 \times 1000 = 2750$ milliliters

Step 2: Check. The decimal part converts too: $0.75$ of a liter is 750 milliliters, and $2000 + 750 = 2750$.

**Answer: D** ($2750$ milliliters)

```json
"distractor_logic": {
  "A": "Student makes misconception: converts_whole_number_part_only (converts the 2 liters to 2000 milliliters and drops the 0.75, which is another 750 milliliters)",
  "B": "Student makes misconception: place_value_slip (moves the decimal two places instead of three, producing 275)",
  "C": "Student makes misconception: inverts_conversion_direction (divides by 1000 instead of multiplying, producing 0.00275 when a move to a smaller unit must give a bigger number)",
  "D": "Correct: multiplies 2.75 by 1000 to get 2750 milliliters"
},
"misconception_tag": {
  "A": "converts_whole_number_part_only",
  "B": "place_value_slip",
  "C": "inverts_conversion_direction"
}
```

---

**4. Fence posts are placed every $4$ feet along a straight $40$-foot fence, with a post at each end. How many posts are needed?**

Step 1: Find the number of gaps.
- $40 \div 4 = 10$ gaps

Step 2: This is a straight run, not a loop, so the far end needs a post with no gap after it.
- $10 + 1 = 11$ posts

Step 3: Check on a small case. A 12-foot fence with posts every 4 feet has gaps at 0 to 4, 4 to 8 and 8 to 12, which is 3 gaps and 4 posts. The pattern holds.

**Answer: A** ($11$ posts)

```json
"distractor_logic": {
  "A": "Correct: divides 40 by 4 for 10 gaps, then adds 1 for the post at the far end, giving 11",
  "B": "Student makes misconception: fencepost_error (divides the length by the spacing and reports the 10 gaps as the post count, omitting the final endpoint)",
  "C": "Student makes misconception: off_by_one_count (adds one post too many, counting 12 for a run that has 10 gaps)",
  "D": "Student makes misconception: multiplies_instead_of_divides (multiplies the 40 feet by the 4 foot spacing instead of dividing, producing 160)"
},
"misconception_tag": {
  "B": "fencepost_error",
  "C": "off_by_one_count",
  "D": "multiplies_instead_of_divides"
}
```

---

**Proficient Level**

**5. A tank is filled at $12$ gallons per minute while simultaneously draining at $5$ gallons per minute. How long does it take to add $210$ gallons?**

Step 1: The rates oppose each other, so net them.
- $12 - 5 = 7$ gallons per minute

Step 2: Divide the target by the net rate.
- $210 \div 7 = 30$ minutes

Step 3: Check the direction. A tank that is also draining must take longer than one that is not, and filling 210 gallons at the full 12 per minute would take 17.5 minutes. Thirty is longer. Correct.

**Answer: C** ($30$ minutes)

```json
"distractor_logic": {
  "A": "Student makes misconception: rates_added_instead_of_netted (adds the fill and drain rates to 17 gallons per minute, producing about 12.35 minutes and claiming the tank fills faster because it is also draining)",
  "B": "Student makes misconception: omits_second_component (uses the 12 gallon per minute fill rate alone and ignores the drain, producing 17.5 minutes)",
  "C": "Correct: nets the rates to 7 gallons per minute, then divides 210 by 7 to get 30 minutes",
  "D": "Student makes misconception: answers_intermediate_value (computes the net rate of 7 gallons per minute and reports it as though it were the time)"
},
"misconception_tag": {
  "A": "rates_added_instead_of_netted",
  "B": "omits_second_component",
  "D": "answers_intermediate_value"
}
```

---

**6. A recipe calls for $3$ gallons of stock. How many cups is that?**

Step 1: Walk the chain, one step at a time. Every unit is smaller than the last, so every step multiplies.
- $3$ gallons $\times 4 = 12$ quarts
- $12$ quarts $\times 2 = 24$ pints
- $24$ pints $\times 2 = 48$ cups

Step 2: Check. One gallon is $4 \times 2 \times 2 = 16$ cups, and $3 \times 16 = 48$. Agrees.

**Answer: B** ($48$ cups)

```json
"distractor_logic": {
  "A": "Student makes misconception: conversion_stopped_one_step_early (reaches 24 pints and reports that, stopping one step before cups)",
  "B": "Correct: multiplies 3 by 4, then 2, then 2, reaching 48 cups",
  "C": "Student makes misconception: inverts_conversion_direction (divides 3 by the 16 cups per gallon instead of multiplying, producing 0.1875 when a move to a smaller unit must give a bigger number)",
  "D": "Student makes misconception: answers_intermediate_value (computes the 16 cups per gallon conversion factor and reports it instead of scaling it to the 3 gallons)"
},
"misconception_tag": {
  "A": "conversion_stopped_one_step_early",
  "C": "inverts_conversion_direction",
  "D": "answers_intermediate_value"
}
```

---

**7. A car's fuel tank holds $16$ gallons. While idling, the car burns $3$ quarts of fuel per hour. How many hours of idling would empty a full tank?**

Step 1: The tank and the burn rate are in different units, so convert one. Quarts are smaller, so multiply.
- $16 \times 4 = 64$ quarts in the tank

Step 2: Divide by the rate.
- $64 \div 3 \approx 21.33$ hours

Step 3: Check. In 21.33 hours the car burns $3 \times 21.33 = 64$ quarts, which is the full 16 gallons. Correct.

**Answer: C** ($21.33$ hours)

```json
"distractor_logic": {
  "A": "Student makes misconception: conversion_stopped_one_step_early (divides the 16 gallons by the 3 quarts per hour without converting the tank to quarts first, producing about 5.33)",
  "B": "Student makes misconception: multiplies_instead_of_divides (multiplies the 64 quarts by the 3 quarts per hour instead of dividing, producing 192)",
  "C": "Correct: converts the tank to 64 quarts, then divides by 3 quarts per hour for about 21.33 hours",
  "D": "Student makes misconception: inverts_conversion_direction (divides the 16 gallons by 4 instead of multiplying, reaching 4 quarts, then divides by 3 for about 1.33 hours)"
},
"misconception_tag": {
  "A": "conversion_stopped_one_step_early",
  "B": "multiplies_instead_of_divides",
  "D": "inverts_conversion_direction"
}
```

---

**Advanced Level**

**8. A rectangular garden measures $24$ feet by $18$ feet. Fence posts are set every $6$ feet around the entire perimeter, with a post at each corner. How many posts are needed?**

Step 1: Find the perimeter, which is all four sides.
- $2 \times (24 + 18) = 84$ feet

Step 2: Find the gaps.
- $84 \div 6 = 14$ gaps

Step 3: This is a closed loop, so the last gap returns to the first post. No extra post is needed.
- $14$ posts

Step 4: Check. $6 \times 14 = 84$, exactly the perimeter, so the posts come out even with no leftover.

**Answer: D** ($14$ posts)

```json
"distractor_logic": {
  "A": "Student makes misconception: fencepost_error (applies the straight-run plus one rule to a closed loop, producing 15 when the last gap already returns to the first post)",
  "B": "Student makes misconception: omits_second_component (uses only one length and one width, dividing 42 by 6 for 7, and never doubles for the opposite pair of sides)",
  "C": "Student makes misconception: multiplies_instead_of_divides (multiplies the 84 foot perimeter by the 6 foot spacing instead of dividing, producing 504)",
  "D": "Correct: finds the 84 foot perimeter, divides by 6 for 14 gaps, and adds nothing because a closed loop has as many posts as gaps"
},
"misconception_tag": {
  "A": "fencepost_error",
  "B": "omits_second_component",
  "C": "multiplies_instead_of_divides"
}
```

---

**9. A pipe delivers $250$ milliliters of water per second. How many liters does it deliver in $4$ minutes?**

Step 1: Convert the time to seconds, because the rate is per second.
- $4 \times 60 = 240$ seconds

Step 2: Multiply by the rate.
- $250 \times 240 = 60{,}000$ milliliters

Step 3: The question asked for liters, which are bigger, so divide.
- $60{,}000 \div 1000 = 60$ liters

Step 4: Check. 60 liters in 4 minutes is 15 liters per minute, and 250 mL per second is also 15 liters per minute. Agrees.

**Answer: A** ($60$ liters)

```json
"distractor_logic": {
  "A": "Correct: converts 4 minutes to 240 seconds, multiplies by 250 for 60,000 milliliters, then divides by 1000 for 60 liters",
  "B": "Student makes misconception: conversion_stopped_one_step_early (reaches 60,000 milliliters correctly and reports that figure as liters, never making the final conversion)",
  "C": "Student makes misconception: inverts_conversion_direction (multiplies the 250 by the 4 minutes without converting minutes to seconds, reaching 1000 milliliters, or 1 liter)",
  "D": "Student makes misconception: answers_intermediate_value (computes the 240 seconds and reports it as though it were the volume)"
},
"misconception_tag": {
  "B": "conversion_stopped_one_step_early",
  "C": "inverts_conversion_direction",
  "D": "answers_intermediate_value"
}
```

---

**10. A reservoir gains $3{,}000$ liters per hour from a stream and loses $800$ liters per hour to evaporation. Starting empty, how many kiloliters does it hold after $5$ hours?**

Step 1: The rates oppose each other, so net them.
- $3000 - 800 = 2200$ liters per hour

Step 2: Multiply by the time.
- $2200 \times 5 = 11{,}000$ liters

Step 3: Convert to kiloliters, which are bigger, so divide.
- $11{,}000 \div 1000 = 11$ kiloliters

Step 4: Check the unit. The question asked for kiloliters, and 11,000 was the answer in liters.

**Answer: D** ($11$ kiloliters)

```json
"distractor_logic": {
  "A": "Student makes misconception: rates_added_instead_of_netted (adds the gain and the loss to 3800 liters per hour, reaching 19,000 liters, or 19 kiloliters, as though evaporation filled the reservoir)",
  "B": "Student makes misconception: conversion_stopped_one_step_early (nets the rates correctly to reach 11,000 liters and reports that figure as kiloliters)",
  "C": "Student makes misconception: omits_second_component (uses the 3000 liter per hour gain alone and ignores the evaporation, producing 15,000 liters, or 15 kiloliters)",
  "D": "Correct: nets the rates to 2200 liters per hour, multiplies by 5 hours for 11,000 liters, then divides by 1000 for 11 kiloliters"
},
"misconception_tag": {
  "A": "rates_added_instead_of_netted",
  "B": "conversion_stopped_one_step_early",
  "C": "omits_second_component"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: How many inches are in $5$ yards?**

Step 1: Yards to feet.
- $5 \times 3 = 15$ feet

Step 2: Feet to inches.
- $15 \times 12 = 180$ inches

Step 3: Check. One yard is 36 inches, and $5 \times 36 = 180$. Agrees.

**Answer: B** ($180$ inches)

```json
"distractor_logic": {
  "A": "Student makes misconception: conversion_stopped_one_step_early (converts to the 15 feet correctly and reports that, never converting on to inches)",
  "B": "Correct: converts 5 yards to 15 feet, then 15 feet to 180 inches",
  "C": "Student makes misconception: omits_second_component (multiplies 5 by 12 directly, skipping the yards to feet step, producing 60)",
  "D": "Student makes misconception: inverts_conversion_direction (divides 5 by 36 instead of multiplying, producing about 0.14 when a move to a smaller unit must give a bigger number)"
},
"misconception_tag": {
  "A": "conversion_stopped_one_step_early",
  "C": "omits_second_component",
  "D": "inverts_conversion_direction"
}
```

---

**Item 2: Convert $3.25$ kilograms to grams.**

Step 1: Grams are smaller, so multiply.
- $3.25 \times 1000 = 3250$ grams

Step 2: Check. The $0.25$ of a kilogram is 250 grams, and $3000 + 250 = 3250$.

**Answer: C** ($3250$ grams)

```json
"distractor_logic": {
  "A": "Student makes misconception: converts_whole_number_part_only (converts the 3 kilograms to 3000 grams and drops the 0.25, which is another 250 grams)",
  "B": "Student makes misconception: place_value_slip (moves the decimal two places instead of three, producing 325)",
  "C": "Correct: multiplies 3.25 by 1000 to get 3250 grams",
  "D": "Student makes misconception: inverts_conversion_direction (divides by 1000 instead of multiplying, producing 0.00325 when a move to a smaller unit must give a bigger number)"
},
"misconception_tag": {
  "A": "converts_whole_number_part_only",
  "B": "place_value_slip",
  "D": "inverts_conversion_direction"
}
```

---

**Item 3: Posts are placed every $5$ feet along a straight $60$-foot rail, with a post at each end. How many posts are needed?**

Step 1: Find the gaps.
- $60 \div 5 = 12$ gaps

Step 2: A straight run needs a post at the far end with no gap after it.
- $12 + 1 = 13$ posts

Step 3: Check. 13 posts leave 12 gaps of 5 feet, which is 60 feet. Correct.

**Answer: D** ($13$ posts)

```json
"distractor_logic": {
  "A": "Student makes misconception: fencepost_error (reports the 12 gaps as the post count, omitting the final endpoint)",
  "B": "Student makes misconception: off_by_one_count (adds one post too many, counting 14 for a run that has 12 gaps)",
  "C": "Student makes misconception: multiplies_instead_of_divides (multiplies the 60 feet by the 5 foot spacing instead of dividing, producing 300)",
  "D": "Correct: divides 60 by 5 for 12 gaps, then adds 1 for the post at the far end, giving 13"
},
"misconception_tag": {
  "A": "fencepost_error",
  "B": "off_by_one_count",
  "C": "multiplies_instead_of_divides"
}
```

---

**Item 4: A tub fills at $9$ liters per minute while draining at $4$ liters per minute. How long does it take to reach $60$ liters?**

Step 1: The rates oppose each other, so net them.
- $9 - 4 = 5$ liters per minute

Step 2: Divide.
- $60 \div 5 = 12$ minutes

Step 3: Check the direction. A tub that is also draining must take longer than one that is not, and at the full 9 per minute it would take about 6.67 minutes. Twelve is longer. Correct.

**Answer: A** ($12$ minutes)

```json
"distractor_logic": {
  "A": "Correct: nets the rates to 5 liters per minute, then divides 60 by 5 to get 12 minutes",
  "B": "Student makes misconception: rates_added_instead_of_netted (adds the fill and drain rates to 13 liters per minute, producing about 4.6 minutes and claiming the tub fills faster because it is also draining)",
  "C": "Student makes misconception: omits_second_component (uses the 9 liter per minute fill rate alone and ignores the drain, producing about 6.67 minutes)",
  "D": "Student makes misconception: answers_intermediate_value (computes the net rate of 5 liters per minute and reports it as though it were the time)"
},
"misconception_tag": {
  "B": "rates_added_instead_of_netted",
  "C": "omits_second_component",
  "D": "answers_intermediate_value"
}
```
