---
topic_name: "Linear inequalities in two variables (graphing solution regions)"
unit_number: 2
sequence_in_unit: 12
assessment_layer: "CRC"
estimated_time_minutes: 55
difficulty_band: "Proficient"
related_strand: "AR"
keywords: ["linear inequality", "two variables", "solution region", "boundary line", "shading", "test point", "half-plane"]
---

# AR.2.5 - Linear Inequalities in Two Variables

**Topic ID:** AR.2.5  
**Unit:** 2  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Determine whether a point solves a two-variable inequality by substituting and checking the resulting statement.
- Determine which half-plane to shade using a test point, and whether the boundary is solid or dashed.
- Rewrite an inequality in y-form, flipping the sign when dividing by a negative, and check a point against every constraint in a system.

---

#### **Part 1: Guided Notes**

##### A Region, Not a Line

An equation like $y = 2x + 1$ has a line for its solution set. An **inequality** like $y > 2x + 1$ has half the plane.

That sounds like it needs a picture, and a picture helps, but every question in this topic can be settled by substitution. **Put the point in and see whether the statement comes out true.** No graph required, no judgement call.

Is $(5, 2)$ a solution of $y > 2x - 4$?

- Right side: $2(5) - 4 = 6$
- The claim is $2 > 6$, which is false.

So $(5, 2)$ is not in the region. That is the whole method, and it is the one to fall back on whenever a description confuses you.

**Substitute, then read the comparison in the direction it is written.** Getting a true statement means the point is in; false means out. The error to guard against is doing the arithmetic correctly and then reading $2 > 6$ as though it confirmed something.

---

##### The Mistake That Costs the Most Points

You shade the wrong side.

Given $y > 2x + 1$, students draw the boundary correctly and then shade below it. The inequality says $y$ is **greater** than the line's value, and greater $y$ means higher on the plane, so the region is **above**.

The reliable way to get this right without thinking about it is the **test point**. Pick any point not on the boundary, substitute, and shade the side it lands on if the statement is true.

The origin is usually the easiest. For $y > 2x + 1$, test $(0, 0)$: is $0 > 2(0) + 1 = 1$? No. So the origin is **not** in the region, which means the region is the other side, the side above.

**Use the origin as your test point unless the boundary passes through it.** One substitution settles the shading permanently.

---

##### Solid or Dashed

The boundary line is drawn two different ways and the difference is real.

| Sign | Boundary | Why |
|---|---|---|
| $<$, $>$ | dashed | points on the line are **not** solutions |
| $\le$, $\ge$ | solid | points on the line **are** solutions |

For $y \le 3x + 1$, the boundary is solid because a point sitting exactly on the line satisfies the "or equal to" half. For $y < 3x + 1$ it is dashed, because such a point gives equality, not strict inequality.

**The line style answers a different question from the shading.** One says whether the edge counts, the other says which side counts. Decide them separately.

---

##### Reading a Region

<!-- figure: ar-2-5-region -->
![A coordinate plane with a solid boundary line through (0, 3) and (4, 0). The region above and to the right of the line is shaded, showing the solutions of 3x plus 4y is greater than or equal to 12.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMjUwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjI1MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIGNvb3JkaW5hdGUgcGxhbmUgd2l0aCBhIHNvbGlkIGJvdW5kYXJ5IGxpbmUgdGhyb3VnaCAoMCwgMykgYW5kICg0LCAwKS4gVGhlIHJlZ2lvbiBhYm92ZSBhbmQgdG8gdGhlIHJpZ2h0IG9mIHRoZSBsaW5lIGlzIHNoYWRlZCwgc2hvd2luZyB0aGUgc29sdXRpb25zIG9mIDN4IHBsdXMgNHkgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIDEyLiI+PHJlY3Qgd2lkdGg9IjM0MCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSB4MT0iMjgiIHkxPSIxNiIgeDI9IjI4IiB5Mj0iMjI4Ii8+PGxpbmUgeDE9IjY0Ljc1IiB5MT0iMTYiIHgyPSI2NC43NSIgeTI9IjIyOCIvPjxsaW5lIHgxPSIxMDEuNSIgeTE9IjE2IiB4Mj0iMTAxLjUiIHkyPSIyMjgiLz48bGluZSB4MT0iMTM4LjI1IiB5MT0iMTYiIHgyPSIxMzguMjUiIHkyPSIyMjgiLz48bGluZSB4MT0iMTc1IiB5MT0iMTYiIHgyPSIxNzUiIHkyPSIyMjgiLz48bGluZSB4MT0iMjExLjc1IiB5MT0iMTYiIHgyPSIyMTEuNzUiIHkyPSIyMjgiLz48bGluZSB4MT0iMjQ4LjUiIHkxPSIxNiIgeDI9IjI0OC41IiB5Mj0iMjI4Ii8+PGxpbmUgeDE9IjI4NS4yNSIgeTE9IjE2IiB4Mj0iMjg1LjI1IiB5Mj0iMjI4Ii8+PGxpbmUgeDE9IjMyMiIgeTE9IjE2IiB4Mj0iMzIyIiB5Mj0iMjI4Ii8+PGxpbmUgeDE9IjI4IiB5MT0iMjI4IiB4Mj0iMzIyIiB5Mj0iMjI4Ii8+PGxpbmUgeDE9IjI4IiB5MT0iMjAxLjUiIHgyPSIzMjIiIHkyPSIyMDEuNSIvPjxsaW5lIHgxPSIyOCIgeTE9IjE3NSIgeDI9IjMyMiIgeTI9IjE3NSIvPjxsaW5lIHgxPSIyOCIgeTE9IjE0OC41IiB4Mj0iMzIyIiB5Mj0iMTQ4LjUiLz48bGluZSB4MT0iMjgiIHkxPSIxMjIiIHgyPSIzMjIiIHkyPSIxMjIiLz48bGluZSB4MT0iMjgiIHkxPSI5NS41IiB4Mj0iMzIyIiB5Mj0iOTUuNSIvPjxsaW5lIHgxPSIyOCIgeTE9IjY5IiB4Mj0iMzIyIiB5Mj0iNjkiLz48bGluZSB4MT0iMjgiIHkxPSI0Mi41IiB4Mj0iMzIyIiB5Mj0iNDIuNSIvPjxsaW5lIHgxPSIyOCIgeTE9IjE2IiB4Mj0iMzIyIiB5Mj0iMTYiLz48L2c+PHBvbHlnb24gcG9pbnRzPSIyNjAuNzUsMjI4IDMyMiwyMjggMzIyLDE2IDI4LDE2IDI4LDEwMi4xMyIgZmlsbD0iIzZFOURDOCIgZmlsbC1vcGFjaXR5PSIwLjE4Ii8+PGxpbmUgeDE9IjI4IiB5MT0iMjAxLjUiIHgyPSIzMjIiIHkyPSIyMDEuNSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNiIvPjxsaW5lIHgxPSI2NC43NSIgeTE9IjIyOCIgeDI9IjY0Ljc1IiB5Mj0iMTYiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzBFMEUxMSI+PHRleHQgeD0iMjgiIHk9IjIxNC41IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4tMTwvdGV4dD48dGV4dCB4PSIxMDEuNSIgeT0iMjE0LjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjE8L3RleHQ+PHRleHQgeD0iMTM4LjI1IiB5PSIyMTQuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MjwvdGV4dD48dGV4dCB4PSIxNzUiIHk9IjIxNC41IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4zPC90ZXh0Pjx0ZXh0IHg9IjIxMS43NSIgeT0iMjE0LjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjQ8L3RleHQ+PHRleHQgeD0iMjQ4LjUiIHk9IjIxNC41IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj41PC90ZXh0Pjx0ZXh0IHg9IjI4NS4yNSIgeT0iMjE0LjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjY8L3RleHQ+PHRleHQgeD0iMzIyIiB5PSIyMTQuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NzwvdGV4dD48dGV4dCB4PSI1OC43NSIgeT0iMjMxLjUiIHRleHQtYW5jaG9yPSJlbmQiPi0xPC90ZXh0Pjx0ZXh0IHg9IjU4Ljc1IiB5PSIxNzguNSIgdGV4dC1hbmNob3I9ImVuZCI+MTwvdGV4dD48dGV4dCB4PSI1OC43NSIgeT0iMTUyIiB0ZXh0LWFuY2hvcj0iZW5kIj4yPC90ZXh0Pjx0ZXh0IHg9IjU4Ljc1IiB5PSIxMjUuNSIgdGV4dC1hbmNob3I9ImVuZCI+MzwvdGV4dD48dGV4dCB4PSI1OC43NSIgeT0iOTkiIHRleHQtYW5jaG9yPSJlbmQiPjQ8L3RleHQ+PHRleHQgeD0iNTguNzUiIHk9IjcyLjUiIHRleHQtYW5jaG9yPSJlbmQiPjU8L3RleHQ+PHRleHQgeD0iNTguNzUiIHk9IjQ2IiB0ZXh0LWFuY2hvcj0iZW5kIj42PC90ZXh0Pjx0ZXh0IHg9IjU4Ljc1IiB5PSIxOS41IiB0ZXh0LWFuY2hvcj0iZW5kIj43PC90ZXh0PjwvZz48bGluZSB4MT0iMjgiIHkxPSIxMDIuMTMiIHgyPSIyNjAuNzUiIHkyPSIyMjgiIHN0cm9rZT0iIzZFOURDOCIgc3Ryb2tlLXdpZHRoPSIyLjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjx0ZXh0IHg9IjE2MC4zIiB5PSI1OC40IiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzZFOURDOCI+M3ggKyA0eSA9IDEyPC90ZXh0PjxjaXJjbGUgY3g9IjY0Ljc1IiBjeT0iMTIyIiByPSI0LjUiIGZpbGw9IiNGMEEzM0UiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48dGV4dCB4PSI3Mi43NSIgeT0iMTE0IiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+KDAsIDMpPC90ZXh0PjxjaXJjbGUgY3g9IjIxMS43NSIgY3k9IjIwMS41IiByPSI0LjUiIGZpbGw9IiNGMEEzM0UiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48dGV4dCB4PSIyMTkuNzUiIHk9IjE5My41IiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+KDQsIDApPC90ZXh0Pjwvc3ZnPg==)

The graph shows a **solid** boundary passing through $(0, 3)$ and $(4, 0)$, with the region **above and to the right** of it shaded.

Work out what that region is, using only the description.

- The boundary through those two points is $3x + 4y = 12$. Check: at $(0, 3)$ it gives $12$, and at $(4, 0)$ it gives $12$.
- The boundary is solid, so the sign includes equality.
- Test the origin: $3(0) + 4(0) = 0$, and the shaded side is the one the origin is **not** on, so the inequality must fail at the origin. $0 \ge 12$ is false, which is consistent.

$$3x + 4y \ge 12$$

Notice that reading the shading backward would give $\le$, and reading the solid line as dashed would give $>$. Two independent decisions, two independent ways to be wrong.

---

##### Solving for $y$ First

When the inequality is not already in $y$ form, rearranging is usually easiest, and the AR.2.2 flip rule applies in full.

**Example 1:** $-2y > 4x - 6$

Divide both sides by $-2$. Division by a negative, so the sign flips.

$$y < -2x + 3$$

Now it reads directly: dashed boundary, shaded **below**.

Skipping the flip gives $y > -2x + 3$ and shades the wrong half of the plane. **The flip rule does not stop applying because there are two variables.**

---

##### Inequalities From Situations

**Example 2:** A student has \$40 for notebooks at \$4 each and pens at \$2 each.

$$4n + 2p \le 40$$

The sign is $\le$ because spending exactly \$40 is allowed. Writing $<$ would exclude a purchase the student can actually make, which is the same strictness slip from AR.2.2.

One caution. In a real situation you cannot buy a negative number of notebooks, so a full model would add $n \ge 0$ and $p \ge 0$. But **do not invent restrictions the question did not state.** Adding "and $n \le 5$" for no reason is not a refinement, it is a different problem.

---

##### Systems of Inequalities

Two inequalities at once means a point must satisfy **both**, exactly as with systems of equations.

**Example 3:** Is $(6, 5)$ a solution of $y \ge x + 1$ and $y \le 2x + 3$?

- First: is $5 \ge 6 + 1 = 7$? No.
- Second: is $5 \le 2(6) + 3 = 15$? Yes.

It fails the first, so it is not a solution. **Test every constraint before accepting a point**, and stop as soon as one fails.

---

##### The Four Traps

1. **Shading the wrong side.** Test the origin and shade the side that makes the statement true.
2. **Wrong line style.** Strict signs get a dashed boundary, "or equal to" signs get a solid one.
3. **Forgetting the flip.** Dividing by a negative reverses the sign here too.
4. **Adding restrictions nobody asked for.** Model what the question states.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Is $(5, 2)$ a solution of $y > 2x - 4$?
   - A) No, because $2$ is not greater than $6$.
   - B) Yes, because $2$ is less than $6$.
   - C) Yes, because the point lies in the first quadrant.
   - D) No, because the boundary line is dashed.

2. Should the boundary of $y \le 3x + 1$ be drawn solid or dashed?
   - A) Dashed, because every inequality uses a dashed boundary.
   - B) Solid, because "or equal to" makes the points on the line solutions.
   - C) Solid, but only for $x \ge 0$.
   - D) It depends on which side is shaded.

3. For the inequality $y > 2x + 1$, which region is shaded?
   - A) The region above the line
   - B) The region below the line
   - C) Only the part above the line where $x > 0$
   - D) Only the line itself

4. Is $(0, 0)$ a solution of $3x + 4y \ge 12$?
   - A) Yes, because $0$ is less than $12$.
   - B) No, because the origin cannot be used as a test point.
   - C) Yes, because the boundary passes through the origin.
   - D) No, because substituting gives $0$, which is not at least $12$.

**Proficient Level** (these require an extra step)

5. A graph shows a solid boundary through $(0, 3)$ and $(4, 0)$, with the region above and to the right of it shaded. Which inequality does it represent?
   - A) $3x + 4y \le 12$
   - B) $4x + 3y \ge 12$
   - C) $3x + 4y \ge 12$
   - D) $3x + 4y > 12$

6. A dashed boundary passes through $(0, -2)$ and $(1, 1)$, with the region below it shaded. Which inequality does it represent?
   - A) $y > 3x - 2$
   - B) $y < 3x - 2$
   - C) $y \le 3x - 2$
   - D) $y < \frac{1}{3}x - 2$

7. Is $(6, 5)$ a solution of the system $y \ge x + 1$ and $y \le 2x + 3$?
   - A) Yes, because it satisfies $y \le 2x + 3$.
   - B) No; it satisfies the second inequality but not the first.
   - C) Yes, because it satisfies both.
   - D) No; it satisfies neither.

**Advanced Level** (these need multiple steps or reverse thinking)

8. Rewrite $-2y > 4x - 6$ with $y$ alone, and state which region is shaded.
   - A) $y > -2x + 3$, shaded above
   - B) $y < -2x + 3$, shaded above
   - C) $y < 2x - 3$, shaded below
   - D) $y < -2x + 3$, shaded below

9. A student has \$40 to spend on notebooks costing \$4 each and pens costing \$2 each. Which inequality models what the student can afford, buying $n$ notebooks and $p$ pens?
   - A) $4n + 2p \ge 40$
   - B) $4n + 2p < 40$
   - C) $4n + 2p \le 40$
   - D) $4n + 2p \le 40$, but only for $n \le 5$

10. A region has the dashed boundary $y = -x + 6$, and the side containing the origin is shaded. Which inequality is it, and is $(2, 4)$ in the region?
    - A) $y < -x + 6$; $(2, 4)$ is not in the region, because it lies on the boundary.
    - B) $y < -x + 6$; $(2, 4)$ is in the region.
    - C) $y > -x + 6$; $(2, 4)$ is not in the region.
    - D) $y \le -x + 6$; $(2, 4)$ is in the region.

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

Is $(1, 5)$ a solution of $y > 3x + 1$?

- A) No, because $5$ is greater than $4$.
- B) Yes, because $5$ is greater than $4$.
- C) No, because the boundary line is dashed.
- D) Yes, but only because $x$ is positive.

**Item 2**

Should the boundary of $y < 2x - 5$ be drawn solid or dashed?

- A) Solid, because the boundary is still a line.
- B) Dashed, but only above the x-axis.
- C) Dashed, because the strict sign excludes the points on the line.
- D) It depends on which side is shaded.

**Item 3**

For the inequality $y \ge -x + 4$, which region is shaded?

- A) The region below the line
- B) Only the part above the line where $y > 0$
- C) Only the line itself
- D) The region above the line

**Advanced Level**

**Item 4**

Rewrite $-3y \le 6x - 9$ with $y$ alone.

- A) $y \le -2x + 3$
- B) $y \ge 2x - 3$
- C) $y \ge -2x + 3$
- D) $y \ge -2x - 3$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Is $(5, 2)$ a solution of $y > 2x - 4$?**

Step 1: Substitute the point.
- Right side: $2(5) - 4 = 6$

Step 2: Read the comparison as written.
- The claim is $2 > 6$, which is false.

Step 3: A false statement means the point is not in the region.

**Answer: A** (No, because $2$ is not greater than $6$)

```json
"distractor_logic": {
  "A": "Correct: substituting gives the claim 2 greater than 6, which is false, so the point is outside the region",
  "B": "Student makes misconception: substitution_comparison_misread (substitutes correctly, then treats 2 being less than 6 as confirming an inequality that asked for greater than)",
  "C": "Student makes misconception: unwarranted_domain_restriction_added (decides membership from the quadrant rather than from the inequality, which says nothing about quadrants)",
  "D": "Student makes misconception: boundary_style_mismatched (reasons from the line style, which decides whether the boundary itself counts and not whether a point off the boundary is in the region)"
},
"misconception_tag": {
  "B": "substitution_comparison_misread",
  "C": "unwarranted_domain_restriction_added",
  "D": "boundary_style_mismatched"
}
```

---

**2. Should the boundary of $y \le 3x + 1$ be drawn solid or dashed?**

Step 1: Look at the sign. It is $\le$, which includes equality.

Step 2: A point exactly on the line makes $y$ equal to $3x + 1$, and "or equal to" accepts that.

Step 3: So the points on the line are solutions, and the boundary is solid.

**Answer: B** (Solid, because "or equal to" makes the points on the line solutions)

```json
"distractor_logic": {
  "A": "Student makes misconception: boundary_style_mismatched (applies a dashed boundary to every inequality, ignoring that the two strictness cases are drawn differently)",
  "B": "Correct: the sign includes equality, so points on the line satisfy the inequality and the boundary is solid",
  "C": "Student makes misconception: unwarranted_domain_restriction_added (restricts the boundary to non-negative x, a condition the inequality does not state)",
  "D": "Student makes misconception: wrong_side_shaded (ties the line style to the shading, when the two are independent decisions)"
},
"misconception_tag": {
  "A": "boundary_style_mismatched",
  "C": "unwarranted_domain_restriction_added",
  "D": "wrong_side_shaded"
}
```

---

**3. For the inequality $y > 2x + 1$, which region is shaded?**

Step 1: Use a test point. The origin is not on the boundary, so try $(0, 0)$.
- Is $0 > 2(0) + 1 = 1$? No.

Step 2: The origin is not in the region, so the region is the other side.

Step 3: Confirm by reading the sign. $y$ greater than the line's value means higher on the plane, which is above.

**Answer: A** (The region above the line)

```json
"distractor_logic": {
  "A": "Correct: a greater y sits higher on the plane, and testing the origin confirms the region is the side the origin is not on",
  "B": "Student makes misconception: wrong_side_shaded (draws the boundary correctly and shades the half-plane on the wrong side of it)",
  "C": "Student makes misconception: unwarranted_domain_restriction_added (limits the region to positive x, a restriction the inequality does not impose)",
  "D": "Student makes misconception: boundary_style_mismatched (shades only the boundary, which for a strict inequality is the one part of the plane excluded)"
},
"misconception_tag": {
  "B": "wrong_side_shaded",
  "C": "unwarranted_domain_restriction_added",
  "D": "boundary_style_mismatched"
}
```

---

**4. Is $(0, 0)$ a solution of $3x + 4y \ge 12$?**

Step 1: Substitute.
- $3(0) + 4(0) = 0$

Step 2: Read the comparison.
- The claim is $0 \ge 12$, which is false.

Step 3: So the origin is not in the region, and the shaded side is the one away from the origin.

**Answer: D** (No, because substituting gives $0$, which is not at least $12$)

```json
"distractor_logic": {
  "A": "Student makes misconception: substitution_comparison_misread (substitutes correctly, then treats 0 being less than 12 as satisfying an inequality that asked for at least 12)",
  "B": "Student makes misconception: unwarranted_domain_restriction_added (rules the origin out as a test point, when any point off the boundary may be tested and the origin is off this one)",
  "C": "Student makes misconception: boundary_style_mismatched (claims the boundary passes through the origin, though 3x + 4y = 12 does not, and reasons from the line rather than from the substitution)",
  "D": "Correct: substituting gives 0, and 0 is not at least 12, so the origin is outside the region"
},
"misconception_tag": {
  "A": "substitution_comparison_misread",
  "B": "unwarranted_domain_restriction_added",
  "C": "boundary_style_mismatched"
}
```

---

**Proficient Level**

**5. A graph shows a solid boundary through $(0, 3)$ and $(4, 0)$, with the region above and to the right of it shaded. Which inequality does it represent?**

Step 1: Find the boundary. Both given points satisfy $3x + 4y = 12$.
- At $(0, 3)$: $0 + 12 = 12$. At $(4, 0)$: $12 + 0 = 12$.

Step 2: The boundary is solid, so the sign includes equality.

Step 3: Decide the direction with a test point. The origin is on the unshaded side, so the inequality must be false there.
- $3(0) + 4(0) = 0$, and $0 \ge 12$ is false. Consistent.

Step 4: So the inequality is $3x + 4y \ge 12$.

**Answer: C** ($3x + 4y \ge 12$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_side_shaded (reads the same boundary with the opposite half-plane, which would shade the side containing the origin)",
  "B": "Student makes misconception: slope_run_over_rise (exchanges the coefficients, giving a boundary that fails both given points, since 4x + 3y is 9 at (0, 3) rather than 12)",
  "C": "Correct: the boundary through both points is 3x + 4y = 12, solid means equality is included, and the origin failing the test confirms the shaded side is the one away from it",
  "D": "Student makes misconception: boundary_style_mismatched (reads the solid boundary as strict, excluding the points on the line that the drawing includes)"
},
"misconception_tag": {
  "A": "wrong_side_shaded",
  "B": "slope_run_over_rise",
  "D": "boundary_style_mismatched"
}
```

---

**6. A dashed boundary passes through $(0, -2)$ and $(1, 1)$, with the region below it shaded. Which inequality does it represent?**

Step 1: Find the boundary. The slope is $\frac{1 - (-2)}{1 - 0} = 3$, and the intercept is $-2$.
- $y = 3x - 2$

Step 2: Dashed means the sign is strict.

Step 3: Shaded below means $y$ is less than the line's value.
- $y < 3x - 2$

Step 4: Check with a test point below the line, say $(0, -5)$: is $-5 < -2$? Yes.

**Answer: B** ($y < 3x - 2$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_side_shaded (shades above the boundary when the description says below)",
  "B": "Correct: slope 3 and intercept -2 from the two points, dashed for a strict sign, and below for less than",
  "C": "Student makes misconception: boundary_style_mismatched (reads the dashed boundary as inclusive, when a dashed line marks points that are not solutions)",
  "D": "Student makes misconception: slope_run_over_rise (computes the change in x over the change in y for a slope of one third rather than 3)"
},
"misconception_tag": {
  "A": "wrong_side_shaded",
  "C": "boundary_style_mismatched",
  "D": "slope_run_over_rise"
}
```

---

**7. Is $(6, 5)$ a solution of the system $y \ge x + 1$ and $y \le 2x + 3$?**

Step 1: Test the first inequality.
- Is $5 \ge 6 + 1 = 7$? No.

Step 2: It has already failed, so it is not a solution. Test the second for completeness.
- Is $5 \le 2(6) + 3 = 15$? Yes.

Step 3: A point must satisfy every constraint. Passing one is not enough.

**Answer: B** (No; it satisfies the second inequality but not the first)

```json
"distractor_logic": {
  "A": "Student makes misconception: only_one_constraint_tested (verifies the inequality the point happens to satisfy and accepts it without testing the other)",
  "B": "Correct: the point gives 5 against a required 7 or more in the first inequality, so it fails, even though it satisfies the second",
  "C": "Student makes misconception: only_one_constraint_tested (asserts both hold after checking only the one that works)",
  "D": "Student makes misconception: substitution_comparison_misread (reads the second comparison backward as well, concluding both fail when 5 is comfortably at most 15)"
},
"misconception_tag": {
  "A": "only_one_constraint_tested",
  "C": "only_one_constraint_tested",
  "D": "substitution_comparison_misread"
}
```

---

**Advanced Level**

**8. Rewrite $-2y > 4x - 6$ with $y$ alone, and state which region is shaded.**

Step 1: Divide both sides by $-2$. Division by a negative, so the sign flips.
- $y < -2x + 3$

Step 2: Read the result. $y$ less than the line's value means the region below.

Step 3: Check with a test point. At the origin: $-2(0) = 0$ and $4(0) - 6 = -6$, so the original claim is $0 > -6$, true. The origin should be in the region, and $0 < -2(0) + 3 = 3$ is also true. Consistent.

**Answer: D** ($y < -2x + 3$, shaded below)

```json
"distractor_logic": {
  "A": "Student makes misconception: inequality_direction_not_flipped (divides by -2 without reversing the sign, then shades to match the unflipped inequality)",
  "B": "Student makes misconception: wrong_side_shaded (flips the sign correctly but shades the half-plane on the wrong side of the boundary)",
  "C": "Student makes misconception: drops_negative_sign (divides by 2 rather than -2, losing the negative on both terms of the result)",
  "D": "Correct: dividing by -2 flips the sign to y less than -2x + 3, and less than shades below, which the origin test confirms"
},
"misconception_tag": {
  "A": "inequality_direction_not_flipped",
  "B": "wrong_side_shaded",
  "C": "drops_negative_sign"
}
```

---

**9. A student has \$40 to spend on notebooks costing \$4 each and pens costing \$2 each. Which inequality models what the student can afford, buying $n$ notebooks and $p$ pens?**

Step 1: Build the cost. One term per item, as in QR.3.3.
- $4n + 2p$

Step 2: The spend cannot exceed the money available, and spending exactly \$40 is allowed.
- $4n + 2p \le 40$

Step 3: Check the strictness. A purchase costing exactly \$40 is affordable, so the sign must include equality.

**Answer: C** ($4n + 2p \le 40$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_side_shaded (reverses the comparison, describing purchases costing at least 40 dollars rather than at most)",
  "B": "Student makes misconception: boundary_style_mismatched (uses a strict sign, which excludes spending exactly 40 dollars even though the student can afford it)",
  "C": "Correct: the cost 4n + 2p must not exceed the 40 available, and equality is allowed",
  "D": "Student makes misconception: unwarranted_domain_restriction_added (adds a cap on n that the problem never states)"
},
"misconception_tag": {
  "A": "wrong_side_shaded",
  "B": "boundary_style_mismatched",
  "D": "unwarranted_domain_restriction_added"
}
```

---

**10. A region has the dashed boundary $y = -x + 6$, and the side containing the origin is shaded. Which inequality is it, and is $(2, 4)$ in the region?**

Step 1: Test the origin to fix the direction.
- $-0 + 6 = 6$, and the origin has $y = 0$, so $0 < 6$. The shaded side is where $y$ is less.

Step 2: Dashed means strict.
- $y < -x + 6$

Step 3: Test the point asked about.
- At $x = 2$: $-2 + 6 = 4$. The claim is $4 < 4$, which is false.

Step 4: $(2, 4)$ lies exactly on the boundary, and a dashed boundary is excluded, so the point is not in the region.

**Answer: A** ($y < -x + 6$; $(2, 4)$ is not in the region)

```json
"distractor_logic": {
  "A": "Correct: the origin test gives less than, dashed makes it strict, and (2, 4) sits exactly on the boundary where 4 is not less than 4",
  "B": "Student makes misconception: substitution_comparison_misread (substitutes to 4 against 4 and reads the equality as satisfying a strict inequality)",
  "C": "Student makes misconception: wrong_side_shaded (shades away from the origin although the origin is stated to be in the shaded side)",
  "D": "Student makes misconception: boundary_style_mismatched (reads the dashed boundary as inclusive, which would admit the point lying on it)"
},
"misconception_tag": {
  "B": "substitution_comparison_misread",
  "C": "wrong_side_shaded",
  "D": "boundary_style_mismatched"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Is $(1, 5)$ a solution of $y > 3x + 1$?**

Step 1: Substitute.
- Right side: $3(1) + 1 = 4$

Step 2: Read the comparison.
- The claim is $5 > 4$, which is true.

**Answer: B** (Yes, because $5$ is greater than $4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: substitution_comparison_misread (computes 5 against 4 correctly but reads a true comparison as excluding the point)",
  "B": "Correct: substituting gives the claim 5 greater than 4, which is true, so the point is in the region",
  "C": "Student makes misconception: boundary_style_mismatched (reasons from the line style, which decides only whether the boundary itself counts)",
  "D": "Student makes misconception: unwarranted_domain_restriction_added (attributes membership to the sign of x, which the inequality says nothing about)"
},
"misconception_tag": {
  "A": "substitution_comparison_misread",
  "C": "boundary_style_mismatched",
  "D": "unwarranted_domain_restriction_added"
}
```

---

**Item 2: Should the boundary of $y < 2x - 5$ be drawn solid or dashed?**

Step 1: The sign is strict, with no "or equal to".

Step 2: A point on the line gives equality, which a strict sign rejects.

Step 3: So the boundary is dashed.

**Answer: C** (Dashed, because the strict sign excludes the points on the line)

```json
"distractor_logic": {
  "A": "Student makes misconception: boundary_style_mismatched (draws every boundary solid, ignoring that a strict sign excludes the line)",
  "B": "Student makes misconception: unwarranted_domain_restriction_added (restricts the boundary style to part of the plane, a condition the inequality does not state)",
  "C": "Correct: a strict sign rejects the equality that points on the line produce, so the boundary is dashed",
  "D": "Student makes misconception: wrong_side_shaded (ties the line style to the shading, when the two are decided independently)"
},
"misconception_tag": {
  "A": "boundary_style_mismatched",
  "B": "unwarranted_domain_restriction_added",
  "D": "wrong_side_shaded"
}
```

---

**Item 3: For the inequality $y \ge -x + 4$, which region is shaded?**

Step 1: Test the origin.
- Is $0 \ge -0 + 4 = 4$? No.

Step 2: The origin is not in the region, so the region is the other side, away from the origin.

Step 3: Confirm from the sign. $y$ at least the line's value means at or above it.

**Answer: D** (The region above the line)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_side_shaded (shades the half-plane on the wrong side, the side the origin test rules out)",
  "B": "Student makes misconception: unwarranted_domain_restriction_added (limits the region to positive y, a restriction the inequality does not impose)",
  "C": "Student makes misconception: boundary_style_mismatched (shades only the boundary, when the sign admits an entire half-plane along with it)",
  "D": "Correct: y at least the line's value means at or above it, and the origin failing the test confirms the region lies away from the origin"
},
"misconception_tag": {
  "A": "wrong_side_shaded",
  "B": "unwarranted_domain_restriction_added",
  "C": "boundary_style_mismatched"
}
```

---

**Item 4: Rewrite $-3y \le 6x - 9$ with $y$ alone.**

Step 1: Divide both sides by $-3$. Division by a negative flips the sign.

Step 2: Divide each term.
- $\frac{6x}{-3} = -2x$ and $\frac{-9}{-3} = 3$

Step 3: Assemble with the flipped sign.
- $y \ge -2x + 3$

**Answer: C** ($y \ge -2x + 3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: inequality_direction_not_flipped (divides by -3 without reversing the sign)",
  "B": "Student makes misconception: drops_negative_sign (divides by 3 rather than -3, losing the negative on both terms of the result)",
  "C": "Correct: dividing by -3 flips the sign and negates both terms, giving y at least -2x + 3",
  "D": "Student makes misconception: sign_error_on_constant (flips correctly but keeps the constant negative, when -9 divided by -3 is positive 3)"
},
"misconception_tag": {
  "A": "inequality_direction_not_flipped",
  "B": "drops_negative_sign",
  "D": "sign_error_on_constant"
}
```
