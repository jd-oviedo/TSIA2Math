---
topic_name: "Circumference of a circle"
unit_number: 3
sequence_in_unit: 2
assessment_layer: "CRC"
estimated_time_minutes: 45
difficulty_band: "Basic"
related_strand: "GR"
keywords: ["circumference", "circle", "radius", "diameter", "pi", "arc length", "perimeter"]
---

# GR.2.2 - Circumference of a Circle

**Topic ID:** GR.2.2  
**Unit:** 3  
**Strand:** GR (Geometric & Spatial Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Calculate circumference using C = 2πr or C = πd, choosing the formula that matches whether a radius or diameter was given.
- Distinguish circumference from area by checking for square units.
- Calculate arc length and sector/semicircle perimeter by applying the correct angle fraction and including straight edges when asked.

---

#### **Part 1: Guided Notes**

##### The Distance Around

Perimeter is the distance around a polygon, which you add up side by side in GR.2.1. A circle has no sides to add, so it gets its own word and its own formula. The distance around a circle is its **circumference**.

<!-- figure: gr-2-2-circle -->
![A circle with its centre marked and a radius drawn from the centre to the edge, labelled r.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjUwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGNpcmNsZSB3aXRoIGl0cyBjZW50cmUgbWFya2VkIGFuZCBhIHJhZGl1cyBkcmF3biBmcm9tIHRoZSBjZW50cmUgdG8gdGhlIGVkZ2UsIGxhYmVsbGVkIHIuIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTI1IiByPSI3OSIgZmlsbD0iIzZFOURDODIyIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyNSIgcj0iMyIgZmlsbD0iIzBFMEUxMSIvPjxsaW5lIHgxPSIxNTAiIHkxPSIxMjUiIHgyPSIyMjkiIHkyPSIxMjUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1pbnRlcm5hbD0iIiB4PSIxODkuNSIgeT0iMTE3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+cjwvdGV4dD48L3N2Zz4=)

The figure shows a circle with its centre marked and a **radius** drawn from the centre out to the edge. Two lengths matter and they are not the same:

- The **radius** $r$ runs from the centre to the edge.
- The **diameter** $d$ runs all the way across through the centre, so $d = 2r$.

That relationship is the source of most lost marks in this topic, because the formula comes in two forms and each expects a different one.

$$C = 2\pi r \qquad \text{or} \qquad C = \pi d$$

They are the same formula. Since $d = 2r$, substituting turns one into the other. **Pick the form that matches the number you were given** and there is nothing else to decide.

Use $\pi \approx 3.14$ unless a question says otherwise.

---

##### The Mistake That Costs the Most Points

You put the diameter into the radius formula.

A circle has diameter 14. Its circumference is

$$C = \pi d = 3.14 \times 14 = 43.96$$

Writing $2\pi(14) = 87.92$ instead uses the diameter where the formula wants the radius, and doubles a length that was already doubled. The answer comes out exactly twice too big.

**Before you substitute, say which length you have.** If the problem gives a diameter, either use $\pi d$, or halve it first and use $2\pi r$. Both work. Mixing them does not.

Two smaller relatives of this error:

- **Dropping the 2**, writing $C = \pi r$. That is half the circumference.
- **Doubling twice**, computing $2\pi r$ and then doubling the result. Same size of error as the first, from the opposite direction.

---

##### Circumference Is Not Area

$$C = 2\pi r \qquad A = \pi r^{2}$$

These look similar and they measure completely different things. Circumference is a **length**, measured in cm or m. Area is a **covering**, measured in square units.

The tell is the square. A radius of 5 gives a circumference of $2(3.14)(5) = 31.4$ and an area of $3.14 \times 25 = 78.5$. Nothing about the situation makes 78.5 a distance.

**Check the units of what the question asked for.** "How far around", "how much fencing", "how far in one lap" are all lengths, so they all use $C$.

---

##### Running It Backward

Given the circumference, you can recover the radius or diameter. Divide rather than multiply.

**Example 1:** A circle has circumference $31.4$. Find its radius.

$$2\pi r = 31.4 \quad \rightarrow \quad r = \frac{31.4}{2 \times 3.14} = \frac{31.4}{6.28} = 5$$

Dividing by $\pi$ alone gives 10, which is the **diameter**, not the radius. It is a real answer to a different question, so read carefully which one was asked for.

---

##### Parts of a Circle

An **arc** is a piece of the circumference. Its length is the same fraction of the circumference as its angle is of a full turn.

$$\text{arc length} = \frac{\text{angle}}{360} \times 2\pi r$$

<!-- figure: gr-2-2-quarter-arc -->
![A circle of radius 10 with a quarter sector shaded from the 3 o'clock position up to the 12 o'clock position, marking a 90 degree arc.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjUwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGNpcmNsZSBvZiByYWRpdXMgMTAgd2l0aCBhIHF1YXJ0ZXIgc2VjdG9yIHNoYWRlZCBmcm9tIHRoZSAzIG8nY2xvY2sgcG9zaXRpb24gdXAgdG8gdGhlIDEyIG8nY2xvY2sgcG9zaXRpb24sIG1hcmtpbmcgYSA5MCBkZWdyZWUgYXJjLiI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyNSIgcj0iNzkiIGZpbGw9IiM2RTlEQzgyMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxMjUiIHI9IjMiIGZpbGw9IiMwRTBFMTEiLz48bGluZSB4MT0iMTUwIiB5MT0iMTI1IiB4Mj0iMjI5IiB5Mj0iMTI1IiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS42Ii8+PHRleHQgZGF0YS1yb2xlPSJsZW5ndGgiIGRhdGEtaW50ZXJuYWw9IiIgeD0iMTg5LjUiIHk9IjExNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPnIgPSAxMDwvdGV4dD48cGF0aCBkPSJNMTUwLDEyNSBMMjI5LDEyNSBBNzksNzkgMCAwIDAgMTUwLDQ2IFoiIGZpbGw9IiNGMEEzM0U1NSIgc3Ryb2tlPSIjRjBBMzNFIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCBkYXRhLXJvbGU9ImlkZW50aWZpZXIiIHg9IjE4MC43MiIgeT0iOTguMjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj45MMKwPC90ZXh0Pjwvc3ZnPg==)

The figure shows a circle of radius 10 with a $90$ degree sector shaded. Ninety degrees is a quarter of a full turn, so the arc along the shaded edge is a quarter of the circumference:

$$\frac{90}{360} \times 2(3.14)(10) = \frac{1}{4} \times 62.8 = 15.7$$

**Reporting the full circumference is the standard error here.** The fraction is not optional, and the question's angle tells you what it is.

One wording trap. The **arc** is the curved part alone. The **perimeter of the sector or semicircle** also includes the straight edges. For a semicircle of radius 6, the arc is $\pi(6) = 18.84$, while the perimeter of the half-disc is $18.84 + 12 = 30.84$, because the flat side is a diameter. Reread which one the question wants.

---

##### The Four Traps

1. **Feeding a diameter into $2\pi r$.** Say which length you have before substituting.
2. **Dropping the 2, or doubling twice.** Both land you a factor of two away.
3. **Using $\pi r^{2}$ for a distance.** Circumference is a length; the square belongs to area.
4. **Ignoring the arc fraction.** A $90$ degree arc is a quarter of the circumference, not all of it.

---

#### **Part 2: Practice Problems**

Use $\pi \approx 3.14$ unless told otherwise. Show your thinking.

**Basic Level** (try these first)

1. A circle has a radius of $5$. What is its circumference?
   - A) $31.4$
   - B) $15.7$
   - C) $78.5$
   - D) $62.8$

2. A circle has a diameter of $14$. What is its circumference?
   - A) $87.92$
   - B) $43.96$
   - C) $21.98$
   - D) $153.86$

3. A circle has a circumference of $31.4$. What is its radius?
   - A) $10$
   - B) $197.19$
   - C) $5$
   - D) $15.7$

4. A circular running track has a radius of $20$ meters. How far is one lap?
   - A) $62.8$ meters
   - B) $1256$ meters
   - C) $251.2$ meters
   - D) $125.6$ meters

**Proficient Level** (these require an extra step)

5. A half-disc has a radius of $6$. What is the perimeter of the half-disc, including its straight edge?
   - A) $18.84$
   - B) $37.68$
   - C) $24.84$
   - D) $30.84$

6. A circle has a radius of $10$. What is the length of a $90$ degree arc?
   - A) $62.8$
   - B) $15.7$
   - C) $31.4$
   - D) $78.5$

7. One circle has a radius of $3$ and another has a radius of $6$. How much longer is the larger circumference?
   - A) $3$
   - B) $9.42$
   - C) $18.84$
   - D) $84.78$

**Advanced Level** (these need multiple steps or reverse thinking)

8. A wheel has a diameter of $0.7$ meters. Using $\pi \approx \frac{22}{7}$, how many complete revolutions does it make travelling $44$ meters?
   - A) $20$
   - B) $40$
   - C) $10$
   - D) $96.8$

9. A circular garden has a circumference of $62.8$ meters. Fencing costs \$12 per meter. What does it cost to fence the garden?
   - A) \$120
   - B) \$3,768
   - C) \$5.23
   - D) \$753.60

10. A running track is made of two straight sections $80$ meters long joined by two semicircular ends, each of diameter $50$ meters. What is the perimeter of the track?
    - A) $157$ meters
    - B) $238.5$ meters
    - C) $317$ meters
    - D) $367$ meters

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

A circle has a radius of $8$. What is its circumference?

- A) $25.12$
- B) $50.24$
- C) $200.96$
- D) $100.48$

**Item 2**

A circle has a diameter of $20$. What is its circumference?

- A) $62.8$
- B) $125.6$
- C) $31.4$
- D) $314$

**Item 3**

A circle has a circumference of $43.96$. What is its diameter?

- A) $7$
- B) $138.03$
- C) $14$
- D) $21.98$

**Proficient Level**

**Item 4**

A half-circle has a radius of $4$. What is the length of its curved edge alone?

- A) $25.12$
- B) $12.56$
- C) $6.28$
- D) $50.24$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. A circle has a radius of $5$. What is its circumference?**

Step 1: A radius was given, so use the radius form.
- $C = 2\pi r$

Step 2: Substitute.
- $2 \times 3.14 \times 5 = 31.4$

Step 3: Check the units. The question asked how far around, which is a length.

**Answer: A** ($31.4$)

```json
"distractor_logic": {
  "A": "Correct: uses C = 2 pi r with the given radius, giving 2 times 3.14 times 5, or 31.4",
  "B": "Student makes misconception: factor_of_two_omitted (computes pi times r as 15.7, which is half the circumference)",
  "C": "Student makes misconception: circumference_area_confusion (uses pi r squared for 78.5, an area, where a distance was asked for)",
  "D": "Student makes misconception: result_doubled_twice (computes 31.4 correctly and doubles it again, producing 62.8)"
},
"misconception_tag": {
  "B": "factor_of_two_omitted",
  "C": "circumference_area_confusion",
  "D": "result_doubled_twice"
}
```

---

**2. A circle has a diameter of $14$. What is its circumference?**

Step 1: A diameter was given, so use the diameter form.
- $C = \pi d$

Step 2: Substitute.
- $3.14 \times 14 = 43.96$

Step 3: Check the other way. The radius is $7$, and $2(3.14)(7) = 43.96$. The two forms agree.

**Answer: B** ($43.96$)

```json
"distractor_logic": {
  "A": "Student makes misconception: radius_diameter_substituted (puts the diameter into the 2 pi r form, doubling a length that was already doubled and giving exactly twice the answer)",
  "B": "Correct: uses C = pi d with the given diameter, giving 3.14 times 14, or 43.96",
  "C": "Student makes misconception: factor_of_two_omitted (computes pi times the radius of 7 as 21.98, which is half the circumference)",
  "D": "Student makes misconception: circumference_area_confusion (uses pi r squared with r equal to 7 for 153.86, an area)"
},
"misconception_tag": {
  "A": "radius_diameter_substituted",
  "C": "factor_of_two_omitted",
  "D": "circumference_area_confusion"
}
```

---

**3. A circle has a circumference of $31.4$. What is its radius?**

Step 1: Write the formula with the unknown in it.
- $2\pi r = 31.4$

Step 2: Divide by the whole factor $2\pi$.
- $r = \frac{31.4}{6.28} = 5$

Step 3: Check forward. $2(3.14)(5) = 31.4$. Correct.

**Answer: C** ($5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: radius_diameter_substituted (divides by pi alone, which recovers the diameter of 10 rather than the radius)",
  "B": "Student makes misconception: inverts_conversion_direction (multiplies by 2 pi instead of dividing, producing about 197.19)",
  "C": "Correct: divides the circumference by the whole factor 2 pi to get a radius of 5, which checks forward to 31.4",
  "D": "Student makes misconception: divides_instead_of_multiplies (halves the circumference to 15.7, treating the 2 in the formula as the only thing to undo)"
},
"misconception_tag": {
  "A": "radius_diameter_substituted",
  "B": "inverts_conversion_direction",
  "D": "divides_instead_of_multiplies"
}
```

---

**4. A circular running track has a radius of $20$ meters. How far is one lap?**

Step 1: One lap is the distance around, so this is circumference.
- $C = 2\pi r$

Step 2: Substitute.
- $2 \times 3.14 \times 20 = 125.6$ meters

**Answer: D** ($125.6$ meters)

```json
"distractor_logic": {
  "A": "Student makes misconception: factor_of_two_omitted (computes pi times r as 62.8, half a lap)",
  "B": "Student makes misconception: circumference_area_confusion (uses pi r squared for 1256, an area in square meters, where a distance was asked for)",
  "C": "Student makes misconception: result_doubled_twice (reaches 125.6 correctly and doubles it again)",
  "D": "Correct: one lap is the circumference, 2 times 3.14 times 20, or 125.6 meters"
},
"misconception_tag": {
  "A": "factor_of_two_omitted",
  "B": "circumference_area_confusion",
  "C": "result_doubled_twice"
}
```

---

**Proficient Level**

**5. A half-disc has a radius of $6$. What is the perimeter of the half-disc, including its straight edge?**

Step 1: The curved edge is half a circumference.
- $\frac{1}{2} \times 2(3.14)(6) = 18.84$

Step 2: The straight edge is a diameter, not a radius.
- $2 \times 6 = 12$

Step 3: Add both parts.
- $18.84 + 12 = 30.84$

**Answer: D** ($30.84$)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_second_component (gives the curved edge of 18.84 and leaves out the straight edge the question asked to include)",
  "B": "Student makes misconception: arc_fraction_not_applied (reports the full circumference of 37.68, never halving it for a half-disc)",
  "C": "Student makes misconception: radius_diameter_substituted (adds the radius of 6 as the straight edge, when the flat side of a half-disc is a diameter of 12)",
  "D": "Correct: half the circumference is 18.84, the straight edge is the diameter 12, and together they give 30.84"
},
"misconception_tag": {
  "A": "omits_second_component",
  "B": "arc_fraction_not_applied",
  "C": "radius_diameter_substituted"
}
```

---

**6. A circle has a radius of $10$. What is the length of a $90$ degree arc?**

Step 1: Find the whole circumference.
- $2(3.14)(10) = 62.8$

Step 2: Take the fraction the angle names. Ninety degrees is a quarter of a full turn.
- $\frac{90}{360} = \frac{1}{4}$

Step 3: Multiply.
- $\frac{1}{4} \times 62.8 = 15.7$

**Answer: B** ($15.7$)

```json
"distractor_logic": {
  "A": "Student makes misconception: arc_fraction_not_applied (reports the full circumference of 62.8, ignoring that only 90 of the 360 degrees were asked for)",
  "B": "Correct: takes a quarter of the 62.8 circumference for an arc of 15.7",
  "C": "Student makes misconception: wrong_fractional_divisor_used (halves the circumference instead of quartering it, producing 31.4)",
  "D": "Student makes misconception: circumference_area_confusion (works from the area of 314 and quarters that, producing 78.5 square units where a length was asked for)"
},
"misconception_tag": {
  "A": "arc_fraction_not_applied",
  "C": "wrong_fractional_divisor_used",
  "D": "circumference_area_confusion"
}
```

---

**7. One circle has a radius of $3$ and another has a radius of $6$. How much longer is the larger circumference?**

Step 1: Find each circumference.
- Small: $2(3.14)(3) = 18.84$
- Large: $2(3.14)(6) = 37.68$

Step 2: Subtract.
- $37.68 - 18.84 = 18.84$

Step 3: Note the pattern. Doubling the radius doubles the circumference, so the difference equals the smaller circumference.

**Answer: C** ($18.84$)

```json
"distractor_logic": {
  "A": "Student makes misconception: answers_intermediate_value (reports the difference in the radii rather than the difference in the circumferences it produces)",
  "B": "Student makes misconception: factor_of_two_omitted (computes pi times the radius difference as 9.42, half the true gap)",
  "C": "Correct: subtracts 18.84 from 37.68 for a difference of 18.84",
  "D": "Student makes misconception: circumference_area_confusion (subtracts the areas, 3.14 times 36 minus 3.14 times 9, for 84.78 square units)"
},
"misconception_tag": {
  "A": "answers_intermediate_value",
  "B": "factor_of_two_omitted",
  "D": "circumference_area_confusion"
}
```

---

**Advanced Level**

**8. A wheel has a diameter of $0.7$ meters. Using $\pi \approx \frac{22}{7}$, how many complete revolutions does it make travelling $44$ meters?**

Step 1: One revolution covers one circumference. A diameter was given, so use $\pi d$.
- $C = \frac{22}{7} \times 0.7 = 2.2$ meters

Step 2: Divide the distance by the distance per revolution.
- $44 \div 2.2 = 20$

Step 3: Check. Twenty revolutions at $2.2$ meters each is $44$ meters exactly.

**Answer: A** ($20$)

```json
"distractor_logic": {
  "A": "Correct: one revolution covers pi times the diameter, or 2.2 meters, and 44 divided by 2.2 is 20 revolutions",
  "B": "Student makes misconception: radius_diameter_substituted (uses the radius of 0.35 in the pi d form for a circumference of 1.1, doubling the revolution count to 40)",
  "C": "Student makes misconception: result_doubled_twice (applies 2 pi d for a circumference of 4.4, halving the revolution count to 10)",
  "D": "Student makes misconception: inverts_conversion_direction (multiplies the 44 meters by the 2.2 meter circumference instead of dividing, producing 96.8)"
},
"misconception_tag": {
  "B": "radius_diameter_substituted",
  "C": "result_doubled_twice",
  "D": "inverts_conversion_direction"
}
```

---

**9. A circular garden has a circumference of $62.8$ meters. Fencing costs \$12 per meter. What does it cost to fence the garden?**

Step 1: The fence runs around the edge, so the length needed is the circumference already given.
- $62.8$ meters

Step 2: Multiply by the rate.
- $62.8 \times 12 = 753.60$

Step 3: Check the units. Meters times dollars per meter gives dollars.

**Answer: D** (\$753.60)

```json
"distractor_logic": {
  "A": "Student makes misconception: radius_diameter_substituted (works back to the radius of 10 and prices that instead of the distance around the garden)",
  "B": "Student makes misconception: circumference_area_confusion (prices the area of 314 square meters rather than the 62.8 meter boundary the fence follows)",
  "C": "Student makes misconception: divides_instead_of_multiplies (divides the length by the rate instead of multiplying, producing about 5.23)",
  "D": "Correct: multiplies the 62.8 meter circumference by the 12 dollars per meter rate for 753.60"
},
"misconception_tag": {
  "A": "radius_diameter_substituted",
  "B": "circumference_area_confusion",
  "C": "divides_instead_of_multiplies"
}
```

---

**10. A running track is made of two straight sections $80$ meters long joined by two semicircular ends, each of diameter $50$ meters. What is the perimeter of the track?**

Step 1: The two straights.
- $2 \times 80 = 160$ meters

Step 2: The two semicircular ends have the same diameter, so together they make one full circle.
- $\pi d = 3.14 \times 50 = 157$ meters

Step 3: Add.
- $160 + 157 = 317$ meters

Step 4: Check that nothing extra was counted. The diameters where the curves meet the straights are not edges of the track, so they do not appear.

**Answer: C** ($317$ meters)

```json
"distractor_logic": {
  "A": "Student makes misconception: omits_second_component (gives the curved ends of 157 meters and leaves out the two straight sections)",
  "B": "Student makes misconception: arc_fraction_not_applied (counts only one semicircle, 78.5, rather than the two that together make a full circle)",
  "C": "Correct: adds the 160 meters of straights to the 157 meters the two semicircular ends make as one full circle",
  "D": "Student makes misconception: phantom_term_introduced (adds a 50 meter diameter that is not an edge of the track, producing 367)"
},
"misconception_tag": {
  "A": "omits_second_component",
  "B": "arc_fraction_not_applied",
  "D": "phantom_term_introduced"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: A circle has a radius of $8$. What is its circumference?**

Step 1: Radius given, so use $C = 2\pi r$.

Step 2: Substitute.
- $2 \times 3.14 \times 8 = 50.24$

**Answer: B** ($50.24$)

```json
"distractor_logic": {
  "A": "Student makes misconception: factor_of_two_omitted (computes pi times r as 25.12, half the circumference)",
  "B": "Correct: 2 times 3.14 times 8 gives a circumference of 50.24",
  "C": "Student makes misconception: circumference_area_confusion (uses pi r squared for 200.96, an area)",
  "D": "Student makes misconception: result_doubled_twice (reaches 50.24 correctly and doubles it again)"
},
"misconception_tag": {
  "A": "factor_of_two_omitted",
  "C": "circumference_area_confusion",
  "D": "result_doubled_twice"
}
```

---

**Item 2: A circle has a diameter of $20$. What is its circumference?**

Step 1: Diameter given, so use $C = \pi d$.

Step 2: Substitute.
- $3.14 \times 20 = 62.8$

**Answer: A** ($62.8$)

```json
"distractor_logic": {
  "A": "Correct: 3.14 times the diameter of 20 gives a circumference of 62.8",
  "B": "Student makes misconception: radius_diameter_substituted (puts the diameter into the 2 pi r form, giving exactly twice the answer)",
  "C": "Student makes misconception: factor_of_two_omitted (computes pi times the radius of 10 as 31.4, half the circumference)",
  "D": "Student makes misconception: circumference_area_confusion (uses pi r squared with r equal to 10 for 314, an area)"
},
"misconception_tag": {
  "B": "radius_diameter_substituted",
  "C": "factor_of_two_omitted",
  "D": "circumference_area_confusion"
}
```

---

**Item 3: A circle has a circumference of $43.96$. What is its diameter?**

Step 1: The diameter form is $C = \pi d$, so divide by $\pi$ alone.
- $d = \frac{43.96}{3.14} = 14$

Step 2: Check forward. $3.14 \times 14 = 43.96$. Correct.

**Answer: C** ($14$)

```json
"distractor_logic": {
  "A": "Student makes misconception: radius_diameter_substituted (divides by 2 pi, which recovers the radius of 7 rather than the diameter)",
  "B": "Student makes misconception: inverts_conversion_direction (multiplies by pi instead of dividing, producing about 138.03)",
  "C": "Correct: divides the circumference by pi to get a diameter of 14, which checks forward to 43.96",
  "D": "Student makes misconception: divides_instead_of_multiplies (halves the circumference to 21.98, treating the 2 as the only thing to undo)"
},
"misconception_tag": {
  "A": "radius_diameter_substituted",
  "B": "inverts_conversion_direction",
  "D": "divides_instead_of_multiplies"
}
```

---

**Item 4: A half-circle has a radius of $4$. What is the length of its curved edge alone?**

Step 1: The whole circumference.
- $2(3.14)(4) = 25.12$

Step 2: The curved edge of a half-circle is half of it.
- $\frac{25.12}{2} = 12.56$

Step 3: The question asked for the curved edge alone, so the straight diameter is not added.

**Answer: B** ($12.56$)

```json
"distractor_logic": {
  "A": "Student makes misconception: arc_fraction_not_applied (reports the full circumference of 25.12, never halving it)",
  "B": "Correct: halves the 25.12 circumference for a curved edge of 12.56",
  "C": "Student makes misconception: wrong_fractional_divisor_used (quarters the circumference instead of halving it, producing 6.28)",
  "D": "Student makes misconception: circumference_area_confusion (uses pi r squared for 50.24, an area, where a length was asked for)"
},
"misconception_tag": {
  "A": "arc_fraction_not_applied",
  "C": "wrong_fractional_divisor_used",
  "D": "circumference_area_confusion"
}
```
