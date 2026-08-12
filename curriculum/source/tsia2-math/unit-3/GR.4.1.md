---
topic_name: "Transformations: translations, rotations, reflections, dilations"
unit_number: 3
sequence_in_unit: 12
assessment_layer: "CRC"
estimated_time_minutes: 55
difficulty_band: "Basic"
related_strand: "GR"
keywords: ["transformation", "translation", "reflection", "rotation", "dilation", "coordinate rules", "composition"]
---

# GR.4.1 - Transformations: Translations, Rotations, Reflections, Dilations

**Topic ID:** GR.4.1  
**Unit:** 3  
**Strand:** GR (Geometric and Spatial Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Four Ways to Move a Shape

Slide a book across a desk. Flip it over. Spin it. Photocopy it at $200$ percent. Four things you can do to an object, and each has a name.

| Name | What it does | Does the shape change? |
|---|---|---|
| **Translation** | slides it | no, same size and shape |
| **Reflection** | flips it over a line | no, same size and shape |
| **Rotation** | spins it about a point | no, same size and shape |
| **Dilation** | resizes it | shape stays, **size changes** |

The first three are **rigid motions**: the image is identical to the original, just somewhere else. Only a dilation changes size.

Vocabulary you will see in the questions. The starting figure is the **pre-image**, the result is the **image**, and the image's points are marked with primes: $A$ becomes $A'$, read "A prime."

The whole topic reduces to four coordinate rules. Learn them cold and every item becomes arithmetic.

---

##### Translations: Add to the Coordinates

A translation slides every point by the same amounts.

$$(x, y) \to (x + a, y + b)$$

Do exactly what the rule says. Add when it says add, subtract when it says subtract.

**Example 1:** Translate $(3, -2)$ by the rule $(x, y) \to (x + 4, y - 5)$.

Step 1: Handle $x$.
- $3 + 4 = 7$

Step 2: Handle $y$.
- $-2 - 5 = -7$

Step 3: Write the image.
- $(7, -7)$

Step 2 is where the points are lost. The starting $y$ is already negative, and the rule subtracts $5$ more, so it goes further down: $-7$. A student who computes $-2 + 5 = 3$ has read the minus as a plus.

**Read the rule's signs off the rule, not off your expectations.** Write the arithmetic out rather than doing it in your head.

---

##### Reflections: Negate One Coordinate

$$\text{Over the } x\text{-axis:} \quad (x, y) \to (x, -y)$$
$$\text{Over the } y\text{-axis:} \quad (x, y) \to (-x, y)$$

The pairing looks backward at first and it is not. Reflecting over the **x-axis** flips the figure **up or down**, and up and down is the $y$ direction, so **$y$** changes sign. The axis you reflect over is the mirror; the coordinate that changes is the one measured **across** it.

Here is the memory hook that survives pressure: **the axis you flip over is the one that stays.** Over the x-axis, $x$ stays. Over the y-axis, $y$ stays.

**Example 2:** Reflect $(5, 4)$ over the x-axis.

- $x$ stays $5$, $y$ becomes $-4$
- Image: $(5, -4)$

**Example 3:** Reflect $(-3, 6)$ over the y-axis.

- $y$ stays $6$, $x$ becomes $-(-3) = 3$
- Image: $(3, 6)$

Note Example 3's sign work. Negating $-3$ gives **positive** $3$. Negation flips whatever sign is there; it does not stamp a minus onto everything.

One more rule that appears occasionally:

$$\text{Over the line } y = x: \quad (x, y) \to (y, x)$$

The coordinates swap, and no sign changes.

---

##### The Mistake That Costs the Most Points

Read this section twice.

**Rotations swap the coordinates and negate one of them. Which one depends on the angle.**

All rotations here are about the origin.

| Rotation | Rule | What happens |
|---|---|---|
| $90^{\circ}$ counterclockwise | $(x, y) \to (-y, x)$ | swap, then negate the **new first** |
| $180^{\circ}$ | $(x, y) \to (-x, -y)$ | **no swap**, negate both |
| $270^{\circ}$ counterclockwise | $(x, y) \to (y, -x)$ | swap, then negate the **new second** |

Three things to hold onto.

**$180^{\circ}$ does not swap.** It only negates both coordinates. Swapping here is a pure error.

**$90^{\circ}$ counterclockwise is the same as $270^{\circ}$ clockwise**, and $270^{\circ}$ counterclockwise is the same as $90^{\circ}$ clockwise. Same destination, two ways to describe the trip. Read the direction word carefully.

**Swapping without negating is not a rotation.** $(4, 2) \to (2, 4)$ is a reflection over the line $y = x$. A rotation always changes at least one sign.

**Example 4:** Rotate $(4, 2)$ by $90^{\circ}$ counterclockwise.

Step 1: Apply $(x, y) \to (-y, x)$. Here $x = 4$ and $y = 2$.

Step 2: The new first coordinate is $-y = -2$.

Step 3: The new second coordinate is $x = 4$.

Step 4: Image: $(-2, 4)$.

Sanity check it with the quadrants. $(4, 2)$ sits in the upper right. Turning counterclockwise by a quarter turn should carry it to the upper left, where $x$ is negative and $y$ is positive. And $(-2, 4)$ is upper left. Correct.

**That quadrant check is the most valuable habit in this topic.** It catches a wrong rotation rule without your having to remember which rule was right.

**Example 5:** Rotate $(-5, 3)$ by $180^{\circ}$.

- No swap. Negate both.
- $(5, -3)$

Check: $(-5, 3)$ is upper left, and a half turn must land in the opposite quadrant, lower right. $(5, -3)$ is lower right. Correct.

**Example 6:** Rotate $(6, -1)$ by $270^{\circ}$ counterclockwise.

- Apply $(x, y) \to (y, -x)$: new first is $y = -1$, new second is $-x = -6$
- Image: $(-1, -6)$

Check: $(6, -1)$ is lower right. Three quarters counterclockwise from lower right lands in lower left. $(-1, -6)$ is lower left. Correct.

---

##### Dilations: Multiply Both Coordinates

$$(x, y) \to (kx, ky)$$

The number $k$ is the **scale factor**, and both coordinates get multiplied by it.

- $k > 1$ makes the figure bigger.
- $0 < k < 1$ makes it smaller.

**Example 7:** Dilate $(2, -4)$ about the origin by a factor of $3$.

- $3 \times 2 = 6$ and $3 \times (-4) = -12$
- Image: $(6, -12)$

Three errors, all common. Adding the scale factor instead of multiplying gives $(5, -1)$. Multiplying only the $x$ gives $(6, -4)$. Dividing by $3$ gives $\left(\frac{2}{3}, -\frac{4}{3}\right)$, which shrinks the figure when the factor of $3$ says to enlarge it.

**Both coordinates, and multiply.** A factor above $1$ must produce coordinates further from the origin.

---

##### Transforming a Whole Figure

Apply the rule to each vertex separately. Nothing else changes.

**Example 8:** Triangle $ABC$ has $A(1, 2)$, $B(3, 5)$, $C(4, 1)$. Reflect it over the x-axis.

The rule is $(x, y) \to (x, -y)$, applied one vertex at a time.

- $A(1, 2) \to A'(1, -2)$
- $B(3, 5) \to B'(3, -5)$
- $C(4, 1) \to C'(4, -1)$

Every $x$ survived untouched; every $y$ flipped sign. A choice where the $x$ values changed is not a reflection over the x-axis.

---

##### Compositions: Two Transformations in Order

When a question chains two transformations, **the order is part of the question**. Finish the first completely, write down the intermediate point, and only then start the second.

**Example 9:** Reflect $(3, 5)$ over the x-axis, then translate the image by $(x, y) \to (x - 2, y + 4)$.

Step 1: The reflection. $(3, 5) \to (3, -5)$.

Step 2: **Write that intermediate point down.** It is $(3, -5)$.

Step 3: The translation, applied to $(3, -5)$ and not to the original.
- $3 - 2 = 1$
- $-5 + 4 = -1$

Step 4: Final image: $(1, -1)$.

Step 2 is not busywork. Students who try to hold the intermediate point in their heads while applying the second rule either translate the original point by mistake, giving $(1, 9)$, or forget the second step entirely.

**Example 10:** Rotate $(2, 3)$ by $90^{\circ}$ counterclockwise, then reflect over the y-axis.

Step 1: Rotation, $(x, y) \to (-y, x)$.
- $(2, 3) \to (-3, 2)$

Step 2: Reflection over the y-axis on $(-3, 2)$, so negate the $x$.
- $-(-3) = 3$, and $y$ stays $2$
- Final image: $(3, 2)$

Note the sign in Step 2. The $x$ was already negative, so negating it made it positive.

**Example 11:** Dilate $(-2, 4)$ by a factor of $2$, then translate by $(x, y) \to (x + 1, y - 3)$.

Step 1: Dilation. $(-2, 4) \to (-4, 8)$.

Step 2: Translation on $(-4, 8)$.
- $-4 + 1 = -3$
- $8 - 3 = 5$
- Final image: $(-3, 5)$

Reversing the order here gives a different answer, which is exactly why order matters. Translating first would give $(-1, 1)$, and dilating that gives $(-2, 2)$. Not the same point.

---

##### Working Backward: Naming the Transformation

Given a pre-image and an image, identify what happened.

**Example 12:** Segment $AB$ has $A(1, 2)$, $B(3, 4)$. Its image is $A'(-2, 1)$, $B'(-4, 3)$. Which single transformation did this?

Step 1: Compare one point carefully. $A(1, 2) \to A'(-2, 1)$.

Step 2: Look at what happened structurally. The coordinates **swapped** ($1$ and $2$ became $2$ and $1$ in the other order) and one picked up a minus sign. Swapping plus one negation means a rotation of $90^{\circ}$ or $270^{\circ}$.

Step 3: Test the $90^{\circ}$ counterclockwise rule, $(x, y) \to (-y, x)$.
- $A(1, 2) \to (-2, 1)$. Match.

Step 4: Confirm with the second point, which is the step that makes this a proof rather than a guess.
- $B(3, 4) \to (-4, 3)$. Match.

Answer: rotation $90^{\circ}$ counterclockwise about the origin.

Step 4 is mandatory. A rule that fits one point can fail on another, and a single point rarely pins down a unique transformation.

---

##### The Five Traps

1. **Reading a translation's signs wrong.** $(x, y) \to (x + 4, y - 5)$ on $(3, -2)$ gives $(7, -7)$. The $y$ goes down twice.
2. **Flipping the wrong coordinate.** Over the x-axis, $y$ changes. The axis you flip over is the one that stays.
3. **Swapping on a $180^{\circ}$ rotation.** A half turn negates both coordinates and swaps nothing.
4. **Swapping without negating.** That is a reflection over $y = x$, not a rotation.
5. **Losing the order of a composition.** Do the first transformation completely, write the point down, then start the second.

The quadrant check catches most of these on its own. When you miss a problem below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. The point $(3, -2)$ is translated using the rule $(x, y) \to (x + 4, y - 5)$. What are the coordinates of the image?
   - A) $(-1, 3)$
   - B) $(7, -7)$
   - C) $(7, 3)$
   - D) $(-1, -7)$

2. The point $(5, 4)$ is reflected over the x-axis. What are the coordinates of the image?
   - A) $(-5, 4)$
   - B) $(4, 5)$
   - C) $(5, -4)$
   - D) $(-5, -4)$

3. The point $(-3, 6)$ is reflected over the y-axis. What are the coordinates of the image?
   - A) $(3, 6)$
   - B) $(-3, -6)$
   - C) $(3, -6)$
   - D) $(6, -3)$

4. The point $(2, -4)$ is dilated about the origin by a scale factor of $3$. What are the coordinates of the image?
   - A) $(5, -1)$
   - B) $(6, -4)$
   - C) $\left(\frac{2}{3}, -\frac{4}{3}\right)$
   - D) $(6, -12)$

**Proficient Level** (these require an extra step)

5. The point $(4, 2)$ is rotated $90^{\circ}$ counterclockwise about the origin. What are the coordinates of the image?
   - A) $(-2, 4)$
   - B) $(2, -4)$
   - C) $(-4, -2)$
   - D) $(2, 4)$

6. The point $(-5, 3)$ is rotated $180^{\circ}$ about the origin. What are the coordinates of the image?
   - A) $(5, 3)$
   - B) $(-5, -3)$
   - C) $(5, -3)$
   - D) $(-3, 5)$

7. Triangle $ABC$ has vertices $A(1, 2)$, $B(3, 5)$, and $C(4, 1)$. The triangle is reflected over the x-axis. What are the coordinates of the image triangle?
   - A) $A'(-1, 2)$, $B'(-3, 5)$, $C'(-4, 1)$
   - B) $A'(1, -2)$, $B'(3, -5)$, $C'(4, -1)$
   - C) $A'(2, 1)$, $B'(5, 3)$, $C'(1, 4)$
   - D) $A'(-1, -2)$, $B'(-3, -5)$, $C'(-4, -1)$

**Advanced Level** (these need multiple steps or reverse thinking)

8. The point $(3, 5)$ is first reflected over the x-axis, and then the image is translated using the rule $(x, y) \to (x - 2, y + 4)$. What are the coordinates of the final image?
   - A) $(1, -9)$
   - B) $(1, 9)$
   - C) $(1, -1)$
   - D) $(5, -1)$

9. The point $(-2, 4)$ is first dilated about the origin by a scale factor of $2$, and then the image is translated using the rule $(x, y) \to (x + 1, y - 3)$. What are the coordinates of the final image?
   - A) $(-3, 5)$
   - B) $(-2, 2)$
   - C) $(-4, 8)$
   - D) $(-1, 1)$

10. Segment $AB$ has endpoints $A(1, 2)$ and $B(3, 4)$. Its image has endpoints $A'(-2, 1)$ and $B'(-4, 3)$. Which single transformation maps $AB$ onto its image?
    - A) Rotation $90^{\circ}$ clockwise about the origin
    - B) Reflection over the line $y = x$
    - C) Rotation $180^{\circ}$ about the origin
    - D) Rotation $90^{\circ}$ counterclockwise about the origin

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

The point $(-1, -1)$ is translated using the rule $(x, y) \to (x - 2, y + 6)$. What are the coordinates of the image?

- A) $(-3, 5)$
- B) $(1, -7)$
- C) $(-3, -7)$
- D) $(1, 5)$

**Item 2**

The point $(6, -1)$ is rotated $270^{\circ}$ counterclockwise about the origin. What are the coordinates of the image?

- A) $(1, 6)$
- B) $(-1, -6)$
- C) $(-6, 1)$
- D) $(-1, 6)$

**Item 3**

The point $(-4, 7)$ is reflected over the y-axis. What are the coordinates of the image?

- A) $(-4, -7)$
- B) $(4, -7)$
- C) $(7, -4)$
- D) $(4, 7)$

**Item 4**

The point $(2, 3)$ is first rotated $90^{\circ}$ counterclockwise about the origin, and then the image is reflected over the y-axis. What are the coordinates of the final image?

- A) $(-3, 2)$
- B) $(3, 2)$
- C) $(-3, -2)$
- D) $(2, -3)$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. The point $(3, -2)$ is translated using the rule $(x, y) \to (x + 4, y - 5)$. What are the coordinates of the image?**

Step 1: Apply the rule to $x$.
- $3 + 4 = 7$

Step 2: Apply the rule to $y$. The starting value is already negative and the rule subtracts more.
- $-2 - 5 = -7$

Step 3: Image: $(7, -7)$.

**Answer: B** ($(7, -7)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: translation_direction_reversed (reverses both operations, subtracting 4 from the x and adding 5 to the y)",
  "B": "Correct: adds 4 to the x for 7 and subtracts 5 from the -2 for -7, following the rule exactly as written",
  "C": "Student makes misconception: translation_direction_reversed (handles the x correctly but reads the y rule as adding 5, computing -2 plus 5 for 3)",
  "D": "Student makes misconception: translation_direction_reversed (handles the y correctly but subtracts 4 from the x rather than adding, producing -1)"
},
"misconception_tag": {
  "A": "translation_direction_reversed",
  "C": "translation_direction_reversed",
  "D": "translation_direction_reversed"
}
```

---

**2. The point $(5, 4)$ is reflected over the x-axis. What are the coordinates of the image?**

Step 1: The rule for the x-axis is $(x, y) \to (x, -y)$. The axis you flip over is the one that stays, so $x$ is unchanged.

Step 2: Apply it.
- $x$ stays $5$, and $y$ becomes $-4$

Step 3: Image: $(5, -4)$.

**Answer: C** ($(5, -4)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_reflection_axis (negates the x instead of the y, which is the rule for reflecting over the y-axis)",
  "B": "Student makes misconception: coordinates_swapped_without_negating (swaps the coordinates, which is a reflection over the line y = x rather than over the x-axis)",
  "C": "Correct: keeps the x at 5 and negates the y to -4, as reflecting over the x-axis requires",
  "D": "Student makes misconception: wrong_rotation_rule (negates both coordinates, which is a 180 degree rotation rather than a reflection)"
},
"misconception_tag": {
  "A": "wrong_reflection_axis",
  "B": "coordinates_swapped_without_negating",
  "D": "wrong_rotation_rule"
}
```

---

**3. The point $(-3, 6)$ is reflected over the y-axis. What are the coordinates of the image?**

Step 1: The rule for the y-axis is $(x, y) \to (-x, y)$, so $y$ stays.

Step 2: Negate the $x$. It is already negative, so negating gives a positive.
- $-(-3) = 3$

Step 3: Image: $(3, 6)$.

**Answer: A** ($(3, 6)$)

```json
"distractor_logic": {
  "A": "Correct: keeps the y at 6 and negates the x, so -3 becomes positive 3",
  "B": "Student makes misconception: wrong_reflection_axis (negates the y instead of the x, which is the rule for the x-axis)",
  "C": "Student makes misconception: wrong_rotation_rule (negates both coordinates, which is a 180 degree rotation)",
  "D": "Student makes misconception: wrong_rotation_rule (swaps the coordinates and negates the new second one, which is the 270 degree rotation rule rather than a reflection)"
},
"misconception_tag": {
  "B": "wrong_reflection_axis",
  "C": "wrong_rotation_rule",
  "D": "wrong_rotation_rule"
}
```

---

**4. The point $(2, -4)$ is dilated about the origin by a scale factor of $3$. What are the coordinates of the image?**

Step 1: A dilation multiplies **both** coordinates by the scale factor.

Step 2: Apply it.
- $3 \times 2 = 6$
- $3 \times (-4) = -12$

Step 3: Image: $(6, -12)$.

Step 4: Check. A factor above $1$ enlarges, so both coordinates should sit further from the origin, and both do.

**Answer: D** ($(6, -12)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: inverts_conversion_direction (adds the scale factor to each coordinate instead of multiplying, computing 2 plus 3 and -4 plus 3)",
  "B": "Student makes misconception: inverts_conversion_direction (multiplies only the x coordinate and leaves the y unchanged, so the figure is stretched in one direction rather than dilated)",
  "C": "Student makes misconception: inverts_conversion_direction (divides by the scale factor instead of multiplying, shrinking the point toward the origin when a factor of 3 enlarges)",
  "D": "Correct: multiplies both coordinates by 3, giving 6 and -12, both further from the origin as an enlargement requires"
},
"misconception_tag": {
  "A": "inverts_conversion_direction",
  "B": "inverts_conversion_direction",
  "C": "inverts_conversion_direction"
}
```

---

**Proficient Level**

**5. The point $(4, 2)$ is rotated $90^{\circ}$ counterclockwise about the origin. What are the coordinates of the image?**

Step 1: The rule is $(x, y) \to (-y, x)$, with $x = 4$ and $y = 2$.

Step 2: New first coordinate is $-y = -2$. New second is $x = 4$.

Step 3: Image: $(-2, 4)$.

Step 4: Quadrant check. $(4, 2)$ is upper right, and a quarter turn counterclockwise lands in the upper left, where $x$ is negative and $y$ positive. Correct.

**Answer: A** ($(-2, 4)$)

```json
"distractor_logic": {
  "A": "Correct: applies the rule (x, y) to (-y, x) for (-2, 4), which the quadrant check confirms lands in the upper left",
  "B": "Student makes misconception: wrong_rotation_rule (applies the 270 degree counterclockwise rule, swapping and negating the second coordinate instead of the first)",
  "C": "Student makes misconception: wrong_rotation_rule (negates both coordinates without swapping, which is the 180 degree rule)",
  "D": "Student makes misconception: coordinates_swapped_without_negating (swaps the coordinates but negates neither, which is a reflection over the line y = x rather than a rotation)"
},
"misconception_tag": {
  "B": "wrong_rotation_rule",
  "C": "wrong_rotation_rule",
  "D": "coordinates_swapped_without_negating"
}
```

---

**6. The point $(-5, 3)$ is rotated $180^{\circ}$ about the origin. What are the coordinates of the image?**

Step 1: The rule is $(x, y) \to (-x, -y)$. There is **no swap**.

Step 2: Negate both.
- $-(-5) = 5$, and $-(3) = -3$

Step 3: Image: $(5, -3)$.

Step 4: Quadrant check. $(-5, 3)$ is upper left, and a half turn must land in the opposite quadrant, lower right. $(5, -3)$ is lower right. Correct.

**Answer: C** ($(5, -3)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_rotation_rule (negates only the x and leaves the y alone, producing a reflection over the y-axis rather than a half turn)",
  "B": "Student makes misconception: wrong_rotation_rule (negates only the y, producing a reflection over the x-axis rather than a half turn)",
  "C": "Correct: negates both coordinates without swapping, giving (5, -3), which the quadrant check places in the opposite quadrant as a half turn requires",
  "D": "Student makes misconception: coordinates_swapped (negates both coordinates correctly to (5, -3) but then writes the pair with its coordinates exchanged, though a 180 degree rotation never swaps)"
},
"misconception_tag": {
  "A": "wrong_rotation_rule",
  "B": "wrong_rotation_rule",
  "D": "coordinates_swapped"
}
```

---

**7. Triangle $ABC$ has vertices $A(1, 2)$, $B(3, 5)$, and $C(4, 1)$. The triangle is reflected over the x-axis. What are the coordinates of the image triangle?**

Step 1: The rule is $(x, y) \to (x, -y)$, applied to each vertex separately.

Step 2: Apply it three times.
- $A(1, 2) \to A'(1, -2)$
- $B(3, 5) \to B'(3, -5)$
- $C(4, 1) \to C'(4, -1)$

Step 3: Check the pattern. Every $x$ is unchanged and every $y$ flipped sign.

**Answer: B** ($A'(1, -2)$, $B'(3, -5)$, $C'(4, -1)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_reflection_axis (negates every x and leaves every y, reflecting over the y-axis instead of the x-axis)",
  "B": "Correct: keeps each x and negates each y, applying the x-axis rule to all three vertices",
  "C": "Student makes misconception: wrong_rotation_rule (swaps each pair of coordinates, applying a reflection over the line y = x rather than over the x-axis)",
  "D": "Student makes misconception: wrong_rotation_rule (negates both coordinates of every vertex, which is a 180 degree rotation rather than a single reflection)"
},
"misconception_tag": {
  "A": "wrong_reflection_axis",
  "C": "wrong_rotation_rule",
  "D": "wrong_rotation_rule"
}
```

---

**Advanced Level**

**8. The point $(3, 5)$ is first reflected over the x-axis, and then the image is translated using the rule $(x, y) \to (x - 2, y + 4)$. What are the coordinates of the final image?**

Step 1: The reflection over the x-axis keeps $x$ and negates $y$.
- $(3, 5) \to (3, -5)$

Step 2: Write the intermediate point down: $(3, -5)$.

Step 3: Apply the translation to that point, not to the original.
- $3 - 2 = 1$
- $-5 + 4 = -1$

Step 4: Final image: $(1, -1)$.

**Answer: C** ($(1, -1)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: composition_order_reversed (reflects after translating rather than before, so the +4 is applied to the positive 5 and the whole result is then negated, producing -9)",
  "B": "Student makes misconception: composition_step_skipped (skips the reflection entirely and only translates the original point, giving 5 plus 4 for 9)",
  "C": "Correct: reflects to (3, -5) first, then translates that intermediate point to (1, -1)",
  "D": "Student makes misconception: translation_direction_reversed (reflects correctly to (3, -5) but then adds 2 to the x rather than subtracting it, producing (5, -1))"
},
"misconception_tag": {
  "A": "composition_order_reversed",
  "B": "composition_step_skipped",
  "D": "translation_direction_reversed"
}
```

---

**9. The point $(-2, 4)$ is first dilated about the origin by a scale factor of $2$, and then the image is translated using the rule $(x, y) \to (x + 1, y - 3)$. What are the coordinates of the final image?**

Step 1: The dilation multiplies both coordinates by $2$.
- $(-2, 4) \to (-4, 8)$

Step 2: Write the intermediate point down: $(-4, 8)$.

Step 3: Translate that point.
- $-4 + 1 = -3$
- $8 - 3 = 5$

Step 4: Final image: $(-3, 5)$.

**Answer: A** ($(-3, 5)$)

```json
"distractor_logic": {
  "A": "Correct: dilates to (-4, 8) first, then translates that intermediate point to (-3, 5)",
  "B": "Student makes misconception: composition_order_reversed (translates the original point first to (-1, 1) and then dilates, producing (-2, 2), which is not the same point because the order matters)",
  "C": "Student makes misconception: composition_step_skipped (dilates correctly and stops, reporting the intermediate point without applying the translation)",
  "D": "Student makes misconception: composition_step_skipped (skips the dilation and only translates the original point, giving (-1, 1))"
},
"misconception_tag": {
  "B": "composition_order_reversed",
  "C": "composition_step_skipped",
  "D": "composition_step_skipped"
}
```

---

**10. Segment $AB$ has endpoints $A(1, 2)$ and $B(3, 4)$. Its image has endpoints $A'(-2, 1)$ and $B'(-4, 3)$. Which single transformation maps $AB$ onto its image?**

Step 1: Compare $A(1, 2)$ with $A'(-2, 1)$. The coordinates swapped, and one gained a minus sign. That means a $90^{\circ}$ or $270^{\circ}$ rotation.

Step 2: Test the $90^{\circ}$ counterclockwise rule, $(x, y) \to (-y, x)$.
- $A(1, 2) \to (-2, 1)$. Match.

Step 3: Confirm on the second point, which turns a guess into a proof.
- $B(3, 4) \to (-4, 3)$. Match.

Step 4: Both points fit, so the transformation is a $90^{\circ}$ counterclockwise rotation about the origin.

**Answer: D** (Rotation $90^{\circ}$ counterclockwise about the origin)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_rotation_rule (identifies the swap-and-negate pattern but assigns the wrong direction, since 90 degrees clockwise would send A(1, 2) to (2, -1) rather than (-2, 1))",
  "B": "Student makes misconception: coordinates_swapped_without_negating (notices the coordinates swapped and stops there, though reflection over y = x would give (2, 1) with no negation)",
  "C": "Student makes misconception: wrong_rotation_rule (assumes a half turn, which would send A(1, 2) to (-1, -2) without any swap)",
  "D": "Correct: the rule (x, y) to (-y, x) maps A to (-2, 1) and B to (-4, 3), matching both endpoints"
},
"misconception_tag": {
  "A": "wrong_rotation_rule",
  "B": "coordinates_swapped_without_negating",
  "C": "wrong_rotation_rule"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: The point $(-1, -1)$ is translated using the rule $(x, y) \to (x - 2, y + 6)$. What are the coordinates of the image?**

Step 1: Apply the rule to $x$.
- $-1 - 2 = -3$

Step 2: Apply the rule to $y$.
- $-1 + 6 = 5$

Step 3: Image: $(-3, 5)$.

**Answer: A** ($(-3, 5)$)

```json
"distractor_logic": {
  "A": "Correct: subtracts 2 from the x for -3 and adds 6 to the y for 5, following the rule as written",
  "B": "Student makes misconception: translation_direction_reversed (reverses both operations, adding 2 to the x and subtracting 6 from the y)",
  "C": "Student makes misconception: translation_direction_reversed (handles the x correctly but subtracts 6 from the y instead of adding)",
  "D": "Student makes misconception: translation_direction_reversed (handles the y correctly but adds 2 to the x instead of subtracting)"
},
"misconception_tag": {
  "B": "translation_direction_reversed",
  "C": "translation_direction_reversed",
  "D": "translation_direction_reversed"
}
```

---

**Item 2: The point $(6, -1)$ is rotated $270^{\circ}$ counterclockwise about the origin. What are the coordinates of the image?**

Step 1: The rule is $(x, y) \to (y, -x)$, with $x = 6$ and $y = -1$.

Step 2: New first coordinate is $y = -1$. New second is $-x = -6$.

Step 3: Image: $(-1, -6)$.

Step 4: Quadrant check. $(6, -1)$ is lower right, and three quarters of a turn counterclockwise lands in the lower left. $(-1, -6)$ is lower left. Correct.

**Answer: B** ($(-1, -6)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_rotation_rule (applies the 90 degree counterclockwise rule instead, negating the first coordinate rather than the second, and lands in the upper right)",
  "B": "Correct: applies the rule (x, y) to (y, -x) for (-1, -6), which the quadrant check places in the lower left",
  "C": "Student makes misconception: wrong_rotation_rule (negates both coordinates without swapping, which is the 180 degree rule)",
  "D": "Student makes misconception: coordinates_swapped_without_negating (swaps the coordinates and keeps the existing signs rather than negating the new second coordinate)"
},
"misconception_tag": {
  "A": "wrong_rotation_rule",
  "C": "wrong_rotation_rule",
  "D": "coordinates_swapped_without_negating"
}
```

---

**Item 3: The point $(-4, 7)$ is reflected over the y-axis. What are the coordinates of the image?**

Step 1: Over the y-axis, $y$ stays and $x$ is negated.

Step 2: Negate the $x$, which is already negative.
- $-(-4) = 4$

Step 3: Image: $(4, 7)$.

**Answer: D** ($(4, 7)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_reflection_axis (negates the y instead of the x, applying the x-axis rule)",
  "B": "Student makes misconception: wrong_rotation_rule (negates both coordinates, which is a 180 degree rotation rather than a reflection)",
  "C": "Student makes misconception: coordinates_swapped_without_negating (swaps the coordinates and negates one, applying neither reflection rule)",
  "D": "Correct: keeps the y at 7 and negates the x, so -4 becomes positive 4"
},
"misconception_tag": {
  "A": "wrong_reflection_axis",
  "B": "wrong_rotation_rule",
  "C": "coordinates_swapped_without_negating"
}
```

---

**Item 4: The point $(2, 3)$ is first rotated $90^{\circ}$ counterclockwise about the origin, and then the image is reflected over the y-axis. What are the coordinates of the final image?**

Step 1: Rotation, $(x, y) \to (-y, x)$.
- $(2, 3) \to (-3, 2)$

Step 2: Write the intermediate point down: $(-3, 2)$.

Step 3: Reflect over the y-axis, so negate the $x$. It is already negative.
- $-(-3) = 3$, and $y$ stays $2$

Step 4: Final image: $(3, 2)$.

**Answer: B** ($(3, 2)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: composition_step_skipped (rotates to (-3, 2) and stops, reporting the intermediate point without reflecting it)",
  "B": "Correct: rotates to (-3, 2), then negates that x for a final image of (3, 2)",
  "C": "Student makes misconception: wrong_reflection_axis (rotates correctly but then negates the y instead of the x, applying the x-axis rule)",
  "D": "Student makes misconception: composition_step_skipped (skips the rotation and reflects the original point over the x-axis instead, producing (2, -3))"
},
"misconception_tag": {
  "A": "composition_step_skipped",
  "C": "wrong_reflection_axis",
  "D": "composition_step_skipped"
}
```
