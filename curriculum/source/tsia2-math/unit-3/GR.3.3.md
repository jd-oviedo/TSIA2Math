---
topic_name: "Basic trigonometric ratios"
unit_number: 3
sequence_in_unit: 10
assessment_layer: "CRC"
estimated_time_minutes: 55
difficulty_band: "Proficient"
related_strand: "GR"
keywords: ["sine", "cosine", "tangent", "SOH CAH TOA", "opposite", "adjacent", "hypotenuse", "inverse trig"]
---

# GR.3.3 - Basic Trigonometric Ratios

**Topic ID:** GR.3.3  
**Unit:** 3  
**Strand:** GR (Geometric & Spatial Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Learning Objectives**

- Set up sin, cos, and tan correctly by labeling a triangle's opposite, adjacent, and hypotenuse relative to the angle in question.
- Solve for a missing side using the correct ratio and direction.
- Find a missing angle using the inverse trig function that matches the ratio built from the two known sides.

---

#### **Part 1: Guided Notes**

##### What Trigonometry Adds

The Pythagorean theorem in GR.3.1 connects three **sides**. It says nothing about angles. Trigonometry is the bridge: it connects an **angle** to a pair of sides, so you can find a side from an angle or an angle from two sides.

Every one of these ratios is a fraction of two side lengths. That means a ratio is a plain number with no unit attached. **A ratio is never a length**, and reporting $0.6$ as the answer to "how long is the side" is the most frequent slip in this topic.

---

##### Naming the Sides

<!-- figure: gr-3-3-345-triangle -->
![A right triangle with the angle theta marked at the lower right. The side adjacent to theta is 4, the side opposite it is 3, and the hypotenuse is 5. The legs are drawn in a 4 to 3 proportion.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggdGhlIGFuZ2xlIHRoZXRhIG1hcmtlZCBhdCB0aGUgbG93ZXIgcmlnaHQuIFRoZSBzaWRlIGFkamFjZW50IHRvIHRoZXRhIGlzIDQsIHRoZSBzaWRlIG9wcG9zaXRlIGl0IGlzIDMsIGFuZCB0aGUgaHlwb3RlbnVzZSBpcyA1LiBUaGUgbGVncyBhcmUgZHJhd24gaW4gYSA0IHRvIDMgcHJvcG9ydGlvbi4iPjxyZWN0IHdpZHRoPSIzMzAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz48cG9seWdvbiBwb2ludHM9IjEwMy4yMSwxODQgMjczLjg4LDE4NCAxMDMuMjEsNTYiIGZpbGw9IiM2RTlEQzgyMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjIiLz48cG9seWxpbmUgcG9pbnRzPSIxMTQuMjEsMTg0IDExNC4yMSwxNzMgMTAzLjIxLDE3MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxwYXRoIGQ9Ik0yNDcuODgsMTg0IEEyNiwyNiAwIDAgMSAyNTMuMDgsMTY4LjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjMiLz48dGV4dCBkYXRhLXJvbGU9ImFuZ2xlIiB4PSIyMzUuOTMiIHk9IjE3NS4zNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPs64PC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iMTAzLjIxLDE4NCwyNzMuODgsMTg0IiB4PSIxODguNTUiIHk9IjIwMi44OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPmFkamFjZW50IDQ8L3RleHQ+PHRleHQgZGF0YS1yb2xlPSJsZW5ndGgiIGRhdGEtZGltPSIxMDMuMjEsMTg0LDEwMy4yMSw1NiIgeD0iOTQuMjEiIHk9IjEyMy41MSIgdGV4dC1hbmNob3I9ImVuZCIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPm9wcG9zaXRlIDM8L3RleHQ+PHRleHQgZGF0YS1yb2xlPSJsZW5ndGgiIGRhdGEtZGltPSIyNzMuODgsMTg0LDEwMy4yMSw1NiIgeD0iMjE2LjU5IiB5PSI4Ni4xMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPmh5cG90ZW51c2UgNTwvdGV4dD48L3N2Zz4=)

The figure shows a right triangle with the angle $\theta$ marked at the lower right. The side adjacent to $\theta$ is $4$, the side opposite it is $3$, and the hypotenuse is $5$. The legs are drawn in a $4$ to $3$ proportion.

Three names, and **two of the three depend on which angle you picked**:

- **Hypotenuse:** always across from the right angle. This one never moves.
- **Opposite:** the leg across the triangle from $\theta$.
- **Adjacent:** the leg that touches $\theta$ and is not the hypotenuse.

Move to the other acute angle and opposite and adjacent trade places. The hypotenuse stays put. **Label the sides before you write a single ratio**, because almost every wrong answer in this topic starts with a side in the wrong role.

---

##### SOH CAH TOA

$$\sin\theta = \frac{\text{opposite}}{\text{hypotenuse}} \qquad \cos\theta = \frac{\text{adjacent}}{\text{hypotenuse}} \qquad \tan\theta = \frac{\text{opposite}}{\text{adjacent}}$$

For the triangle above:

$$\sin\theta = \frac{3}{5} = 0.6 \qquad \cos\theta = \frac{4}{5} = 0.8 \qquad \tan\theta = \frac{3}{4} = 0.75$$

Two checks that cost nothing:

1. **Sine and cosine are never more than $1$.** Both divide by the hypotenuse, which is the longest side, so the fraction is at most $1$. If you get $\frac{5}{3}$ you have flipped the fraction.
2. **Tangent has no such limit.** It divides one leg by the other, so it can be anything.

---

##### Finding a Side

<!-- figure: gr-3-3-solve-for-side -->
![A right triangle with a 35 degree angle at the lower right, the side adjacent to it labelled 10, and the side opposite it labelled x. The opposite side is drawn at 10 times the tangent of 35 degrees, so about seven tenths the length of the adjacent side.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggYSAzNSBkZWdyZWUgYW5nbGUgYXQgdGhlIGxvd2VyIHJpZ2h0LCB0aGUgc2lkZSBhZGphY2VudCB0byBpdCBsYWJlbGxlZCAxMCwgYW5kIHRoZSBzaWRlIG9wcG9zaXRlIGl0IGxhYmVsbGVkIHguIFRoZSBvcHBvc2l0ZSBzaWRlIGlzIGRyYXduIGF0IDEwIHRpbWVzIHRoZSB0YW5nZW50IG9mIDM1IGRlZ3JlZXMsIHNvIGFib3V0IHNldmVuIHRlbnRocyB0aGUgbGVuZ3RoIG9mIHRoZSBhZGphY2VudCBzaWRlLiI+PHJlY3Qgd2lkdGg9IjMzMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxwb2x5Z29uIHBvaW50cz0iNzMuNiwxODQgMjU2LjQsMTg0IDczLjYsNTYiIGZpbGw9IiM2RTlEQzgyMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjIiLz48cG9seWxpbmUgcG9pbnRzPSI4NC42LDE4NCA4NC42LDE3MyA3My42LDE3MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxwYXRoIGQ9Ik0yMzAuNCwxODQgQTI2LDI2IDAgMCAxIDIzNS4xLDE2OS4wOSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuMyIvPjx0ZXh0IGRhdGEtcm9sZT0iYW5nbGUiIHg9IjIxOC4yNSIgeT0iMTc1Ljk3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+MzXCsDwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09IjczLjYsMTg0LDI1Ni40LDE4NCIgeD0iMTY1IiB5PSIyMDIuODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj4xMDwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09IjczLjYsMTg0LDczLjYsNTYiIHg9IjY0LjYiIHk9IjEyNC41NSIgdGV4dC1hbmNob3I9ImVuZCIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPng8L3RleHQ+PC9zdmc+)

The figure shows a right triangle with a $35^\circ$ angle at the lower right, the side adjacent to it labelled $10$, and the side opposite it labelled $x$. The opposite side is drawn at $10$ times the tangent of $35^\circ$, so about seven tenths the length of the adjacent side.

Pick the ratio that uses **the side you have and the side you want**, and nothing else.

Here you have the adjacent and want the opposite, so that is tangent.

$$\tan 35^\circ = \frac{x}{10} \quad \rightarrow \quad x = 10 \tan 35^\circ = 10(0.700) = 7.0$$

**Example 1:** A hypotenuse of $20$, and $\sin\theta = 0.6$. Find the side opposite $\theta$.

$$\sin\theta = \frac{\text{opposite}}{20} \quad \rightarrow \quad \text{opposite} = 20(0.6) = 12$$

The unknown was on top, so you **multiply**. Dividing gives $33.3$, which is longer than the hypotenuse and therefore impossible.

**Example 2:** A side of $7$ opposite a $30^\circ$ angle. Find the hypotenuse.

$$\sin 30^\circ = \frac{7}{\text{hypotenuse}} \quad \rightarrow \quad 0.5 = \frac{7}{\text{hypotenuse}} \quad \rightarrow \quad \text{hypotenuse} = \frac{7}{0.5} = 14$$

The unknown was on the bottom, so you **divide**. Multiplying gives $3.5$, and a hypotenuse shorter than a leg is impossible.

**One rule covers both.** Unknown on top, multiply. Unknown on the bottom, divide. Then look at the answer and ask whether that side could really be that long.

---

##### Finding an Angle

If you have two sides and want the angle, run the ratio backwards with an inverse function.

$$\theta = \sin^{-1}\!\left(\frac{\text{opposite}}{\text{hypotenuse}}\right) \qquad \theta = \cos^{-1}\!\left(\frac{\text{adjacent}}{\text{hypotenuse}}\right) \qquad \theta = \tan^{-1}\!\left(\frac{\text{opposite}}{\text{adjacent}}\right)$$

**The inverse has to match the ratio you built.** If your two sides are a leg and a leg, that is a tangent, so it goes into $\tan^{-1}$. Feeding a leg-over-leg fraction into $\sin^{-1}$ answers a question nobody asked.

**Example 3:** A side of $8$ opposite $\theta$ and a side of $15$ adjacent to it.

$$\theta = \tan^{-1}\!\left(\frac{8}{15}\right) \approx 28.1^\circ$$

---

##### The Special Angles

| $\theta$ | $\sin\theta$ | $\cos\theta$ | $\tan\theta$ |
|---|---|---|---|
| $30^\circ$ | $0.5$ | $0.866$ | $0.577$ |
| $45^\circ$ | $0.707$ | $0.707$ | $1$ |
| $60^\circ$ | $0.866$ | $0.5$ | $1.732$ |

These are GR.3.2's triangles written as decimals. $\sin 30^\circ = 0.5$ is the short leg being half the hypotenuse; $\tan 45^\circ = 1$ is the two legs being equal.

Note that $\sin 30^\circ$ and $\sin 60^\circ$ are **not** the same number. Reaching for $0.866$ when the angle is $30^\circ$ is a whole error on its own, and the fix is the sanity check: the side opposite the smaller angle is the shorter side.

---

##### When the Third Side Is Missing

Sometimes you are given two legs and asked for a ratio that needs the hypotenuse. Find it with the Pythagorean theorem first.

**Example 4:** Legs of $5$ and $12$. Find the sine of the angle opposite the $5$.

$$5^{2} + 12^{2} = 169, \qquad \sqrt{169} = 13, \qquad \sin\theta = \frac{5}{13}$$

The hypotenuse is $13$, not $17$. **Legs do not add.** Adding them gives $17$, which would make a triangle with a right angle impossible to close.

---

##### The Five Traps

1. **Reporting the ratio as a length.** $0.6$ is a number, not a side.
2. **Flipping the fraction.** Sine and cosine cannot exceed $1$.
3. **Picking the wrong ratio.** Match the two sides you have to the formula that names them.
4. **Mislabelling opposite and adjacent.** They swap when you change angle.
5. **Adding the legs instead of squaring them.**

---

#### **Part 2: Practice Problems**

Round decimals to one place where the answer is not exact.

**Basic Level** (try these first)

1. A right triangle has the side opposite $\theta$ equal to $3$, the side adjacent to $\theta$ equal to $4$, and a hypotenuse of $5$. What is $\sin\theta$?

<!-- figure: gr-3-3-p1 -->
![A right triangle with the angle theta at the bottom-right vertex. The leg adjacent to theta is 4, the leg opposite theta is 3, and the hypotenuse is 5. The right angle is marked at the bottom-left corner.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggdGhlIGFuZ2xlIHRoZXRhIGF0IHRoZSBib3R0b20tcmlnaHQgdmVydGV4LiBUaGUgbGVnIGFkamFjZW50IHRvIHRoZXRhIGlzIDQsIHRoZSBsZWcgb3Bwb3NpdGUgdGhldGEgaXMgMywgYW5kIHRoZSBoeXBvdGVudXNlIGlzIDUuIFRoZSByaWdodCBhbmdsZSBpcyBtYXJrZWQgYXQgdGhlIGJvdHRvbS1sZWZ0IGNvcm5lci4iPjxyZWN0IHdpZHRoPSIzMzAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz48cG9seWdvbiBwb2ludHM9Ijc5LjY3LDE4NCAyNTAuMzMsMTg0IDc5LjY3LDU2IiBmaWxsPSIjNkU5REM4MjIiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBvbHlsaW5lIHBvaW50cz0iOTAuNjcsMTg0IDkwLjY3LDE3MyA3OS42NywxNzMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48cGF0aCBkPSJNMjI0LjMzLDE4NCBBMjYsMjYgMCAwIDEgMjI5LjUzLDE2OC40IiBmaWxsPSJub25lIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS4zIi8+PHRleHQgZGF0YS1yb2xlPSJhbmdsZSIgeD0iMjEyLjM4IiB5PSIxNzUuMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj7OuDwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09Ijc5LjY3LDE4NCwyNTAuMzMsMTg0IiB4PSIxNjUiIHk9IjIwMi44OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPjQ8L3RleHQ+PHRleHQgZGF0YS1yb2xlPSJsZW5ndGgiIGRhdGEtZGltPSI3OS42NywxODQsNzkuNjcsNTYiIHg9IjcwLjY3IiB5PSIxMjQuNTUiIHRleHQtYW5jaG9yPSJlbmQiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj4zPC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iMjUwLjMzLDE4NCw3OS42Nyw1NiIgeD0iMTc0LjgxIiB5PSIxMTEuNDciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj41PC90ZXh0Pjwvc3ZnPg==)

   - A) $\frac{3}{5}$
   - B) $\frac{4}{5}$
   - C) $\frac{5}{3}$
   - D) $3$

2. A right triangle has the side opposite $\theta$ equal to $3$, the side adjacent to $\theta$ equal to $4$, and a hypotenuse of $5$. What is $\cos\theta$?

<!-- figure: gr-3-3-p2 -->
![A right triangle with the angle theta at the bottom-right vertex. The leg adjacent to theta is 4, the leg opposite theta is 3, and the hypotenuse is 5. The right angle is marked at the bottom-left corner.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggdGhlIGFuZ2xlIHRoZXRhIGF0IHRoZSBib3R0b20tcmlnaHQgdmVydGV4LiBUaGUgbGVnIGFkamFjZW50IHRvIHRoZXRhIGlzIDQsIHRoZSBsZWcgb3Bwb3NpdGUgdGhldGEgaXMgMywgYW5kIHRoZSBoeXBvdGVudXNlIGlzIDUuIFRoZSByaWdodCBhbmdsZSBpcyBtYXJrZWQgYXQgdGhlIGJvdHRvbS1sZWZ0IGNvcm5lci4iPjxyZWN0IHdpZHRoPSIzMzAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz48cG9seWdvbiBwb2ludHM9Ijc5LjY3LDE4NCAyNTAuMzMsMTg0IDc5LjY3LDU2IiBmaWxsPSIjNkU5REM4MjIiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBvbHlsaW5lIHBvaW50cz0iOTAuNjcsMTg0IDkwLjY3LDE3MyA3OS42NywxNzMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48cGF0aCBkPSJNMjI0LjMzLDE4NCBBMjYsMjYgMCAwIDEgMjI5LjUzLDE2OC40IiBmaWxsPSJub25lIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS4zIi8+PHRleHQgZGF0YS1yb2xlPSJhbmdsZSIgeD0iMjEyLjM4IiB5PSIxNzUuMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj7OuDwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09Ijc5LjY3LDE4NCwyNTAuMzMsMTg0IiB4PSIxNjUiIHk9IjIwMi44OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPjQ8L3RleHQ+PHRleHQgZGF0YS1yb2xlPSJsZW5ndGgiIGRhdGEtZGltPSI3OS42NywxODQsNzkuNjcsNTYiIHg9IjcwLjY3IiB5PSIxMjQuNTUiIHRleHQtYW5jaG9yPSJlbmQiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj4zPC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iMjUwLjMzLDE4NCw3OS42Nyw1NiIgeD0iMTc0LjgxIiB5PSIxMTEuNDciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj41PC90ZXh0Pjwvc3ZnPg==)

   - A) $\frac{3}{5}$
   - B) $\frac{4}{5}$
   - C) $\frac{5}{4}$
   - D) $4$

3. A right triangle has the side opposite $\theta$ equal to $3$, the side adjacent to $\theta$ equal to $4$, and a hypotenuse of $5$. What is $\tan\theta$?

<!-- figure: gr-3-3-p3 -->
![A right triangle with the angle theta at the bottom-right vertex. The leg adjacent to theta is 4, the leg opposite theta is 3, and the hypotenuse is 5. The right angle is marked at the bottom-left corner.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggdGhlIGFuZ2xlIHRoZXRhIGF0IHRoZSBib3R0b20tcmlnaHQgdmVydGV4LiBUaGUgbGVnIGFkamFjZW50IHRvIHRoZXRhIGlzIDQsIHRoZSBsZWcgb3Bwb3NpdGUgdGhldGEgaXMgMywgYW5kIHRoZSBoeXBvdGVudXNlIGlzIDUuIFRoZSByaWdodCBhbmdsZSBpcyBtYXJrZWQgYXQgdGhlIGJvdHRvbS1sZWZ0IGNvcm5lci4iPjxyZWN0IHdpZHRoPSIzMzAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz48cG9seWdvbiBwb2ludHM9Ijc5LjY3LDE4NCAyNTAuMzMsMTg0IDc5LjY3LDU2IiBmaWxsPSIjNkU5REM4MjIiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBvbHlsaW5lIHBvaW50cz0iOTAuNjcsMTg0IDkwLjY3LDE3MyA3OS42NywxNzMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48cGF0aCBkPSJNMjI0LjMzLDE4NCBBMjYsMjYgMCAwIDEgMjI5LjUzLDE2OC40IiBmaWxsPSJub25lIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS4zIi8+PHRleHQgZGF0YS1yb2xlPSJhbmdsZSIgeD0iMjEyLjM4IiB5PSIxNzUuMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj7OuDwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09Ijc5LjY3LDE4NCwyNTAuMzMsMTg0IiB4PSIxNjUiIHk9IjIwMi44OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPjQ8L3RleHQ+PHRleHQgZGF0YS1yb2xlPSJsZW5ndGgiIGRhdGEtZGltPSI3OS42NywxODQsNzkuNjcsNTYiIHg9IjcwLjY3IiB5PSIxMjQuNTUiIHRleHQtYW5jaG9yPSJlbmQiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj4zPC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iMjUwLjMzLDE4NCw3OS42Nyw1NiIgeD0iMTc0LjgxIiB5PSIxMTEuNDciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj41PC90ZXh0Pjwvc3ZnPg==)

   - A) $\frac{4}{3}$
   - B) $\frac{3}{5}$
   - C) $3$
   - D) $\frac{3}{4}$

4. A right triangle has legs of $6$ and $8$ and a hypotenuse of $10$. The angle $\theta$ is opposite the leg of $6$. What is $\cos\theta$?

<!-- figure: gr-3-3-p4 -->
![A right triangle with the angle theta at the bottom-right vertex. The leg adjacent to theta is 8, the leg opposite theta is 6, and the hypotenuse is 10.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggdGhlIGFuZ2xlIHRoZXRhIGF0IHRoZSBib3R0b20tcmlnaHQgdmVydGV4LiBUaGUgbGVnIGFkamFjZW50IHRvIHRoZXRhIGlzIDgsIHRoZSBsZWcgb3Bwb3NpdGUgdGhldGEgaXMgNiwgYW5kIHRoZSBoeXBvdGVudXNlIGlzIDEwLiI+PHJlY3Qgd2lkdGg9IjMzMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxwb2x5Z29uIHBvaW50cz0iNzkuNjcsMTg0IDI1MC4zMywxODQgNzkuNjcsNTYiIGZpbGw9IiM2RTlEQzgyMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjIiLz48cG9seWxpbmUgcG9pbnRzPSI5MC42NywxODQgOTAuNjcsMTczIDc5LjY3LDE3MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxwYXRoIGQ9Ik0yMjQuMzMsMTg0IEEyNiwyNiAwIDAgMSAyMjkuNTMsMTY4LjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjMiLz48dGV4dCBkYXRhLXJvbGU9ImFuZ2xlIiB4PSIyMTIuMzgiIHk9IjE3NS4zNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPs64PC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iNzkuNjcsMTg0LDI1MC4zMywxODQiIHg9IjE2NSIgeT0iMjAyLjg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+ODwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09Ijc5LjY3LDE4NCw3OS42Nyw1NiIgeD0iNzAuNjciIHk9IjEyNC41NSIgdGV4dC1hbmNob3I9ImVuZCIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPjY8L3RleHQ+PHRleHQgZGF0YS1yb2xlPSJsZW5ndGgiIGRhdGEtZGltPSIyNTAuMzMsMTg0LDc5LjY3LDU2IiB4PSIxNzYuNjciIHk9IjEwOSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPjEwPC90ZXh0Pjwvc3ZnPg==)

   - A) $\frac{3}{5}$
   - B) $\frac{4}{3}$
   - C) $\frac{4}{5}$
   - D) $\frac{5}{4}$

**Proficient Level** (these require an extra step)

5. A right triangle has a hypotenuse of $20$, and $\sin\theta = 0.6$. What is the length of the side opposite $\theta$?

<!-- figure: gr-3-3-p5 -->
![A right triangle with the angle theta at the bottom-right vertex and a hypotenuse of 20. The leg opposite theta is marked with a question mark, the unknown to find.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggdGhlIGFuZ2xlIHRoZXRhIGF0IHRoZSBib3R0b20tcmlnaHQgdmVydGV4IGFuZCBhIGh5cG90ZW51c2Ugb2YgMjAuIFRoZSBsZWcgb3Bwb3NpdGUgdGhldGEgaXMgbWFya2VkIHdpdGggYSBxdWVzdGlvbiBtYXJrLCB0aGUgdW5rbm93biB0byBmaW5kLiI+PHJlY3Qgd2lkdGg9IjMzMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxwb2x5Z29uIHBvaW50cz0iNzkuNjcsMTg0IDI1MC4zMywxODQgNzkuNjcsNTYiIGZpbGw9IiM2RTlEQzgyMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjIiLz48cG9seWxpbmUgcG9pbnRzPSI5MC42NywxODQgOTAuNjcsMTczIDc5LjY3LDE3MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxwYXRoIGQ9Ik0yMjQuMzMsMTg0IEEyNiwyNiAwIDAgMSAyMjkuNTMsMTY4LjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjMiLz48dGV4dCBkYXRhLXJvbGU9ImFuZ2xlIiB4PSIyMTIuMzgiIHk9IjE3NS4zNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPs64PC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iNzkuNjcsMTg0LDc5LjY3LDU2IiB4PSI3MC42NyIgeT0iMTI0LjU1IiB0ZXh0LWFuY2hvcj0iZW5kIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+PzwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09IjI1MC4zMywxODQsNzkuNjcsNTYiIHg9IjE3Ni42NyIgeT0iMTA5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+MjA8L3RleHQ+PC9zdmc+)

   - A) $12$
   - B) $33.3$
   - C) $16$
   - D) $0.6$

6. In a right triangle, the side opposite a $30^\circ$ angle is $7$. What is the length of the hypotenuse? Use $\sin 30^\circ = 0.5$ and $\sin 60^\circ = 0.866$.

<!-- figure: gr-3-3-p6 -->
![A right triangle with a 30 degree angle at the bottom-right vertex. The leg opposite the 30 degree angle is 7, and the hypotenuse is marked with a question mark, the unknown to find.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggYSAzMCBkZWdyZWUgYW5nbGUgYXQgdGhlIGJvdHRvbS1yaWdodCB2ZXJ0ZXguIFRoZSBsZWcgb3Bwb3NpdGUgdGhlIDMwIGRlZ3JlZSBhbmdsZSBpcyA3LCBhbmQgdGhlIGh5cG90ZW51c2UgaXMgbWFya2VkIHdpdGggYSBxdWVzdGlvbiBtYXJrLCB0aGUgdW5rbm93biB0byBmaW5kLiI+PHJlY3Qgd2lkdGg9IjMzMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxwb2x5Z29uIHBvaW50cz0iNTYsMTgyLjkzIDI3NCwxODIuOTMgNTYsNTcuMDciIGZpbGw9IiM2RTlEQzgyMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjIiLz48cG9seWxpbmUgcG9pbnRzPSI2NywxODIuOTMgNjcsMTcxLjkzIDU2LDE3MS45MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxwYXRoIGQ9Ik0yNDgsMTgyLjkzIEEyNiwyNiAwIDAgMSAyNTEuNDgsMTY5LjkzIiBmaWxsPSJub25lIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS4zIi8+PHRleHQgZGF0YS1yb2xlPSJhbmdsZSIgeD0iMjM1LjM2IiB5PSIxNzYuNTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj4zMMKwPC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iNTYsMTgyLjkzLDU2LDU3LjA3IiB4PSI0NyIgeT0iMTI0LjU1IiB0ZXh0LWFuY2hvcj0iZW5kIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+NzwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09IjI3NCwxODIuOTMsNTYsNTcuMDciIHg9IjE3Mi44NCIgeT0iMTEwLjk2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+PzwvdGV4dD48L3N2Zz4=)

   - A) $8.1$
   - B) $14$
   - C) $3.5$
   - D) $0.5$

7. In a right triangle, the side adjacent to $\theta$ is $9$ and the hypotenuse is $15$. What is $\cos\theta$?

<!-- figure: gr-3-3-p7 -->
![A right triangle with the angle theta at the bottom-right vertex. The leg adjacent to theta is 9 and the hypotenuse is 15.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggdGhlIGFuZ2xlIHRoZXRhIGF0IHRoZSBib3R0b20tcmlnaHQgdmVydGV4LiBUaGUgbGVnIGFkamFjZW50IHRvIHRoZXRhIGlzIDkgYW5kIHRoZSBoeXBvdGVudXNlIGlzIDE1LiI+PHJlY3Qgd2lkdGg9IjMzMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxwb2x5Z29uIHBvaW50cz0iMTE3LDE4NCAyMTMsMTg0IDExNyw1NiIgZmlsbD0iIzZFOURDODIyIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMiIvPjxwb2x5bGluZSBwb2ludHM9IjEyOCwxODQgMTI4LDE3MyAxMTcsMTczIiBmaWxsPSJub25lIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS40Ii8+PHBhdGggZD0iTTE4NywxODQgQTI2LDI2IDAgMCAxIDE5Ny40LDE2My4yIiBmaWxsPSJub25lIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS4zIi8+PHRleHQgZGF0YS1yb2xlPSJhbmdsZSIgeD0iMTc3LjIyIiB5PSIxNzAuMTEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj7OuDwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09IjExNywxODQsMjEzLDE4NCIgeD0iMTY1IiB5PSIyMDIuODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj45PC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iMjEzLDE4NCwxMTcsNTYiIHg9IjE3MS4wNSIgeT0iMTEyLjI5IiB0ZXh0LWFuY2hvcj0ic3RhcnQiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj4xNTwvdGV4dD48L3N2Zz4=)

   - A) $\frac{4}{5}$
   - B) $\frac{5}{3}$
   - C) $\frac{3}{4}$
   - D) $\frac{3}{5}$

**Advanced Level** (these need multiple steps or reverse thinking)

8. A right triangle has legs of $5$ and $12$. What is the sine of the angle opposite the leg of $5$?

<!-- figure: gr-3-3-p8 -->
![A right triangle with the angle theta at the bottom-right vertex. The leg adjacent to theta is 12, the leg opposite theta is 5, and the hypotenuse is 13.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggdGhlIGFuZ2xlIHRoZXRhIGF0IHRoZSBib3R0b20tcmlnaHQgdmVydGV4LiBUaGUgbGVnIGFkamFjZW50IHRvIHRoZXRhIGlzIDEyLCB0aGUgbGVnIG9wcG9zaXRlIHRoZXRhIGlzIDUsIGFuZCB0aGUgaHlwb3RlbnVzZSBpcyAxMy4iPjxyZWN0IHdpZHRoPSIzMzAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz48cG9seWdvbiBwb2ludHM9IjU2LDE2NS40MiAyNzQsMTY1LjQyIDU2LDc0LjU4IiBmaWxsPSIjNkU5REM4MjIiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBvbHlsaW5lIHBvaW50cz0iNjcsMTY1LjQyIDY3LDE1NC40MiA1NiwxNTQuNDIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48cGF0aCBkPSJNMjQ4LDE2NS40MiBBMjYsMjYgMCAwIDEgMjUwLDE1NS40MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuMyIvPjx0ZXh0IGRhdGEtcm9sZT0iYW5nbGUiIHg9IjIzNC43OCIgeT0iMTYxLjU3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+zrg8L3RleHQ+PHRleHQgZGF0YS1yb2xlPSJsZW5ndGgiIGRhdGEtZGltPSI1NiwxNjUuNDIsMjc0LDE2NS40MiIgeD0iMTY1IiB5PSIxODQuMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPjEyPC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iNTYsMTY1LjQyLDU2LDc0LjU4IiB4PSI0NyIgeT0iMTI0LjU1IiB0ZXh0LWFuY2hvcj0iZW5kIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+NTwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09IjI3NCwxNjUuNDIsNTYsNzQuNTgiIHg9IjE3MS44OCIgeT0iMTA4LjA1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+MTM8L3RleHQ+PC9zdmc+)

   - A) $\frac{5}{17}$
   - B) $\frac{12}{13}$
   - C) $\frac{5}{13}$
   - D) $\frac{13}{5}$

9. In a right triangle, the side opposite $\theta$ is $8$ and the side adjacent to $\theta$ is $15$. Which calculation gives $\theta$?

<!-- figure: gr-3-3-p9 -->
![A right triangle with the angle theta at the bottom-right vertex. The leg adjacent to theta is 15 and the leg opposite theta is 8.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggdGhlIGFuZ2xlIHRoZXRhIGF0IHRoZSBib3R0b20tcmlnaHQgdmVydGV4LiBUaGUgbGVnIGFkamFjZW50IHRvIHRoZXRhIGlzIDE1IGFuZCB0aGUgbGVnIG9wcG9zaXRlIHRoZXRhIGlzIDguIj48cmVjdCB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI0ZGRkZGRiIgcng9IjEwIi8+PHBvbHlnb24gcG9pbnRzPSI1NiwxNzguMTMgMjc0LDE3OC4xMyA1Niw2MS44NyIgZmlsbD0iIzZFOURDODIyIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMiIvPjxwb2x5bGluZSBwb2ludHM9IjY3LDE3OC4xMyA2NywxNjcuMTMgNTYsMTY3LjEzIiBmaWxsPSJub25lIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS40Ii8+PHBhdGggZD0iTTI0OCwxNzguMTMgQTI2LDI2IDAgMCAxIDI1MS4wNiwxNjUuOSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuMyIvPjx0ZXh0IGRhdGEtcm9sZT0iYW5nbGUiIHg9IjIzNS4xOSIgeT0iMTcyLjQzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+zrg8L3RleHQ+PHRleHQgZGF0YS1yb2xlPSJsZW5ndGgiIGRhdGEtZGltPSI1NiwxNzguMTMsMjc0LDE3OC4xMyIgeD0iMTY1IiB5PSIxOTcuMDEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj4xNTwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09IjU2LDE3OC4xMyw1Niw2MS44NyIgeD0iNDciIHk9IjEyNC41NSIgdGV4dC1hbmNob3I9ImVuZCIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPjg8L3RleHQ+PC9zdmc+)

   - A) $\tan^{-1}\!\left(\frac{8}{15}\right)$
   - B) $\sin^{-1}\!\left(\frac{8}{15}\right)$
   - C) $\tan^{-1}\!\left(\frac{15}{8}\right)$
   - D) $\tan^{-1}\!\left(\frac{8}{17}\right)$

10. In a right triangle, the side adjacent to a $40^\circ$ angle is $12$. What is the length of the side opposite it? Use $\tan 40^\circ = 0.839$ and $\cos 40^\circ = 0.766$.

<!-- figure: gr-3-3-p10 -->
![A right triangle with a 40 degree angle at the bottom-right vertex. The leg adjacent to the 40 degree angle is 12, and the leg opposite it is marked with a question mark, the unknown to find.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggYSA0MCBkZWdyZWUgYW5nbGUgYXQgdGhlIGJvdHRvbS1yaWdodCB2ZXJ0ZXguIFRoZSBsZWcgYWRqYWNlbnQgdG8gdGhlIDQwIGRlZ3JlZSBhbmdsZSBpcyAxMiwgYW5kIHRoZSBsZWcgb3Bwb3NpdGUgaXQgaXMgbWFya2VkIHdpdGggYSBxdWVzdGlvbiBtYXJrLCB0aGUgdW5rbm93biB0byBmaW5kLiI+PHJlY3Qgd2lkdGg9IjMzMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxwb2x5Z29uIHBvaW50cz0iODguNzMsMTg0IDI0MS4yNywxODQgODguNzMsNTYiIGZpbGw9IiM2RTlEQzgyMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjIiLz48cG9seWxpbmUgcG9pbnRzPSI5OS43MywxODQgOTkuNzMsMTczIDg4LjczLDE3MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxwYXRoIGQ9Ik0yMTUuMjcsMTg0IEEyNiwyNiAwIDAgMSAyMjEuMzUsMTY3LjI5IiBmaWxsPSJub25lIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS4zIi8+PHRleHQgZGF0YS1yb2xlPSJhbmdsZSIgeD0iMjAzLjY4IiB5PSIxNzQuMzIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj40MMKwPC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iODguNzMsMTg0LDI0MS4yNywxODQiIHg9IjE2NSIgeT0iMjAyLjg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+MTI8L3RleHQ+PHRleHQgZGF0YS1yb2xlPSJsZW5ndGgiIGRhdGEtZGltPSI4OC43MywxODQsODguNzMsNTYiIHg9Ijc5LjczIiB5PSIxMjQuNTUiIHRleHQtYW5jaG9yPSJlbmQiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj4/PC90ZXh0Pjwvc3ZnPg==)

   - A) $14.3$
   - B) $10.1$
   - C) $15.7$
   - D) $0.839$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Basic Level**

**Item 1**

A right triangle has the side opposite $\theta$ equal to $6$, the side adjacent to $\theta$ equal to $8$, and a hypotenuse of $10$. What is $\sin\theta$?


<!-- figure: gr-3-3-mq1 -->
![A right triangle with the angle theta at the bottom-right vertex. The leg adjacent to theta is 8, the leg opposite theta is 6, and the hypotenuse is 10.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggdGhlIGFuZ2xlIHRoZXRhIGF0IHRoZSBib3R0b20tcmlnaHQgdmVydGV4LiBUaGUgbGVnIGFkamFjZW50IHRvIHRoZXRhIGlzIDgsIHRoZSBsZWcgb3Bwb3NpdGUgdGhldGEgaXMgNiwgYW5kIHRoZSBoeXBvdGVudXNlIGlzIDEwLiI+PHJlY3Qgd2lkdGg9IjMzMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxwb2x5Z29uIHBvaW50cz0iNzkuNjcsMTg0IDI1MC4zMywxODQgNzkuNjcsNTYiIGZpbGw9IiM2RTlEQzgyMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjIiLz48cG9seWxpbmUgcG9pbnRzPSI5MC42NywxODQgOTAuNjcsMTczIDc5LjY3LDE3MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxwYXRoIGQ9Ik0yMjQuMzMsMTg0IEEyNiwyNiAwIDAgMSAyMjkuNTMsMTY4LjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjMiLz48dGV4dCBkYXRhLXJvbGU9ImFuZ2xlIiB4PSIyMTIuMzgiIHk9IjE3NS4zNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPs64PC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iNzkuNjcsMTg0LDI1MC4zMywxODQiIHg9IjE2NSIgeT0iMjAyLjg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+ODwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09Ijc5LjY3LDE4NCw3OS42Nyw1NiIgeD0iNzAuNjciIHk9IjEyNC41NSIgdGV4dC1hbmNob3I9ImVuZCIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPjY8L3RleHQ+PHRleHQgZGF0YS1yb2xlPSJsZW5ndGgiIGRhdGEtZGltPSIyNTAuMzMsMTg0LDc5LjY3LDU2IiB4PSIxNzYuNjciIHk9IjEwOSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPjEwPC90ZXh0Pjwvc3ZnPg==)

- A) $\frac{4}{5}$
- B) $\frac{5}{3}$
- C) $6$
- D) $\frac{3}{5}$

**Item 2**

A right triangle has the side opposite $\theta$ equal to $6$, the side adjacent to $\theta$ equal to $8$, and a hypotenuse of $10$. What is $\tan\theta$?


<!-- figure: gr-3-3-mq2 -->
![A right triangle with the angle theta at the bottom-right vertex. The leg adjacent to theta is 8, the leg opposite theta is 6, and the hypotenuse is 10.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggdGhlIGFuZ2xlIHRoZXRhIGF0IHRoZSBib3R0b20tcmlnaHQgdmVydGV4LiBUaGUgbGVnIGFkamFjZW50IHRvIHRoZXRhIGlzIDgsIHRoZSBsZWcgb3Bwb3NpdGUgdGhldGEgaXMgNiwgYW5kIHRoZSBoeXBvdGVudXNlIGlzIDEwLiI+PHJlY3Qgd2lkdGg9IjMzMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxwb2x5Z29uIHBvaW50cz0iNzkuNjcsMTg0IDI1MC4zMywxODQgNzkuNjcsNTYiIGZpbGw9IiM2RTlEQzgyMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjIiLz48cG9seWxpbmUgcG9pbnRzPSI5MC42NywxODQgOTAuNjcsMTczIDc5LjY3LDE3MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxwYXRoIGQ9Ik0yMjQuMzMsMTg0IEEyNiwyNiAwIDAgMSAyMjkuNTMsMTY4LjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjMiLz48dGV4dCBkYXRhLXJvbGU9ImFuZ2xlIiB4PSIyMTIuMzgiIHk9IjE3NS4zNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPs64PC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iNzkuNjcsMTg0LDI1MC4zMywxODQiIHg9IjE2NSIgeT0iMjAyLjg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+ODwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09Ijc5LjY3LDE4NCw3OS42Nyw1NiIgeD0iNzAuNjciIHk9IjEyNC41NSIgdGV4dC1hbmNob3I9ImVuZCIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPjY8L3RleHQ+PHRleHQgZGF0YS1yb2xlPSJsZW5ndGgiIGRhdGEtZGltPSIyNTAuMzMsMTg0LDc5LjY3LDU2IiB4PSIxNzYuNjciIHk9IjEwOSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPjEwPC90ZXh0Pjwvc3ZnPg==)

- A) $\frac{3}{5}$
- B) $\frac{3}{4}$
- C) $\frac{4}{3}$
- D) $6$

**Proficient Level**

**Item 3**

A right triangle has a hypotenuse of $30$, and $\cos\theta = 0.8$. What is the length of the side adjacent to $\theta$?


<!-- figure: gr-3-3-mq3 -->
![A right triangle with the angle theta at the bottom-right vertex and a hypotenuse of 30. The leg adjacent to theta is marked with a question mark, the unknown to find.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggdGhlIGFuZ2xlIHRoZXRhIGF0IHRoZSBib3R0b20tcmlnaHQgdmVydGV4IGFuZCBhIGh5cG90ZW51c2Ugb2YgMzAuIFRoZSBsZWcgYWRqYWNlbnQgdG8gdGhldGEgaXMgbWFya2VkIHdpdGggYSBxdWVzdGlvbiBtYXJrLCB0aGUgdW5rbm93biB0byBmaW5kLiI+PHJlY3Qgd2lkdGg9IjMzMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNGRkZGRkYiIHJ4PSIxMCIvPjxwb2x5Z29uIHBvaW50cz0iNzkuNjcsMTg0IDI1MC4zMywxODQgNzkuNjcsNTYiIGZpbGw9IiM2RTlEQzgyMiIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjIiLz48cG9seWxpbmUgcG9pbnRzPSI5MC42NywxODQgOTAuNjcsMTczIDc5LjY3LDE3MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxwYXRoIGQ9Ik0yMjQuMzMsMTg0IEEyNiwyNiAwIDAgMSAyMjkuNTMsMTY4LjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjMiLz48dGV4dCBkYXRhLXJvbGU9ImFuZ2xlIiB4PSIyMTIuMzgiIHk9IjE3NS4zNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPs64PC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iNzkuNjcsMTg0LDI1MC4zMywxODQiIHg9IjE2NSIgeT0iMjAyLjg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+PzwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09IjI1MC4zMywxODQsNzkuNjcsNTYiIHg9IjE3Ni42NyIgeT0iMTA5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+MzA8L3RleHQ+PC9zdmc+)

- A) $37.5$
- B) $18$
- C) $24$
- D) $0.8$

**Advanced Level**

**Item 4**

A right triangle has legs of $9$ and $12$. What is the cosine of the angle opposite the leg of $9$?


<!-- figure: gr-3-3-mq4 -->
![A right triangle with the angle theta at the bottom-right vertex. The leg adjacent to theta is 12, the leg opposite theta is 9, and the hypotenuse is 15.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzAgMjQwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjI0MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJBIHJpZ2h0IHRyaWFuZ2xlIHdpdGggdGhlIGFuZ2xlIHRoZXRhIGF0IHRoZSBib3R0b20tcmlnaHQgdmVydGV4LiBUaGUgbGVnIGFkamFjZW50IHRvIHRoZXRhIGlzIDEyLCB0aGUgbGVnIG9wcG9zaXRlIHRoZXRhIGlzIDksIGFuZCB0aGUgaHlwb3RlbnVzZSBpcyAxNS4iPjxyZWN0IHdpZHRoPSIzMzAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz48cG9seWdvbiBwb2ludHM9Ijc5LjY3LDE4NCAyNTAuMzMsMTg0IDc5LjY3LDU2IiBmaWxsPSIjNkU5REM4MjIiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBvbHlsaW5lIHBvaW50cz0iOTAuNjcsMTg0IDkwLjY3LDE3MyA3OS42NywxNzMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjQiLz48cGF0aCBkPSJNMjI0LjMzLDE4NCBBMjYsMjYgMCAwIDEgMjI5LjUzLDE2OC40IiBmaWxsPSJub25lIiBzdHJva2U9IiMwRTBFMTEiIHN0cm9rZS13aWR0aD0iMS4zIi8+PHRleHQgZGF0YS1yb2xlPSJhbmdsZSIgeD0iMjEyLjM4IiB5PSIxNzUuMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj7OuDwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09Ijc5LjY3LDE4NCwyNTAuMzMsMTg0IiB4PSIxNjUiIHk9IjIwMi44OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InVpLXNhbnMtc2VyaWYsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwRTBFMTEiPjEyPC90ZXh0Pjx0ZXh0IGRhdGEtcm9sZT0ibGVuZ3RoIiBkYXRhLWRpbT0iNzkuNjcsMTg0LDc5LjY3LDU2IiB4PSI3MC42NyIgeT0iMTI0LjU1IiB0ZXh0LWFuY2hvcj0iZW5kIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+OTwvdGV4dD48dGV4dCBkYXRhLXJvbGU9Imxlbmd0aCIgZGF0YS1kaW09IjI1MC4zMywxODQsNzkuNjcsNTYiIHg9IjE3Ni42NyIgeT0iMTA5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBFMEUxMSI+MTU8L3RleHQ+PC9zdmc+)

- A) $\frac{3}{7}$
- B) $\frac{3}{5}$
- C) $\frac{4}{5}$
- D) $\frac{5}{4}$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. The side opposite $\theta$ is $3$, the adjacent is $4$, the hypotenuse is $5$. What is $\sin\theta$?**

Step 1: Sine is opposite over hypotenuse.
- $\frac{3}{5}$

Step 2: Check. It is less than $1$, as every sine must be.

**Answer: A** ($\frac{3}{5}$)

```json
"distractor_logic": {
  "A": "Correct: opposite over hypotenuse gives three fifths, a value below 1 as every sine must be",
  "B": "Student makes misconception: wrong_trig_ratio_selected (builds adjacent over hypotenuse, which is the cosine)",
  "C": "Student makes misconception: inverts_trig_ratio (puts the hypotenuse on top, giving five thirds, which no sine can equal)",
  "D": "Student makes misconception: ratio_numerator_as_side_length (hands back the opposite side of 3 rather than the ratio)"
},
"misconception_tag": {
  "B": "wrong_trig_ratio_selected",
  "C": "inverts_trig_ratio",
  "D": "ratio_numerator_as_side_length"
}
```

---

**2. The side opposite $\theta$ is $3$, the adjacent is $4$, the hypotenuse is $5$. What is $\cos\theta$?**

Step 1: Cosine is adjacent over hypotenuse.
- $\frac{4}{5}$

Step 2: Check. It is less than $1$, as every cosine must be.

**Answer: B** ($\frac{4}{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_trig_ratio_selected (builds opposite over hypotenuse, which is the sine)",
  "B": "Correct: adjacent over hypotenuse gives four fifths, a value below 1 as every cosine must be",
  "C": "Student makes misconception: inverts_trig_ratio (puts the hypotenuse on top, giving five quarters, which no cosine can equal)",
  "D": "Student makes misconception: ratio_numerator_as_side_length (hands back the adjacent side of 4 rather than the ratio)"
},
"misconception_tag": {
  "A": "wrong_trig_ratio_selected",
  "C": "inverts_trig_ratio",
  "D": "ratio_numerator_as_side_length"
}
```

---

**3. The side opposite $\theta$ is $3$, the adjacent is $4$, the hypotenuse is $5$. What is $\tan\theta$?**

Step 1: Tangent is opposite over adjacent. The hypotenuse plays no part.
- $\frac{3}{4}$

**Answer: D** ($\frac{3}{4}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: inverts_trig_ratio (puts the adjacent on top, giving four thirds)",
  "B": "Student makes misconception: wrong_trig_ratio_selected (divides by the hypotenuse, which builds the sine rather than the tangent)",
  "C": "Student makes misconception: ratio_numerator_as_side_length (hands back the opposite side of 3 rather than the ratio)",
  "D": "Correct: opposite over adjacent gives three quarters, with the hypotenuse playing no part"
},
"misconception_tag": {
  "A": "inverts_trig_ratio",
  "B": "wrong_trig_ratio_selected",
  "C": "ratio_numerator_as_side_length"
}
```

---

**4. A right triangle has legs of $6$ and $8$ and a hypotenuse of $10$. The angle $\theta$ is opposite the leg of $6$. What is $\cos\theta$?**

Step 1: Label the sides for **this** angle. Opposite is $6$, so adjacent is $8$, and the hypotenuse is $10$.

Step 2: Cosine is adjacent over hypotenuse.
- $\frac{8}{10} = \frac{4}{5}$

**Answer: C** ($\frac{4}{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: trig_side_roles_misassigned (uses the leg of 6 as the adjacent side when it is the opposite one)",
  "B": "Student makes misconception: wrong_trig_ratio_selected (divides one leg by the other, which is a tangent relationship rather than a cosine)",
  "C": "Correct: with the leg of 6 opposite, the adjacent is 8 and the hypotenuse 10, giving four fifths",
  "D": "Student makes misconception: inverts_trig_ratio (puts the hypotenuse on top, giving five quarters, which no cosine can equal)"
},
"misconception_tag": {
  "A": "trig_side_roles_misassigned",
  "B": "wrong_trig_ratio_selected",
  "D": "inverts_trig_ratio"
}
```

---

**Proficient Level**

**5. A right triangle has a hypotenuse of $20$, and $\sin\theta = 0.6$. What is the length of the side opposite $\theta$?**

Step 1: Write the relationship.
- $0.6 = \frac{\text{opposite}}{20}$

Step 2: The unknown is on top, so multiply.
- $20(0.6) = 12$

Step 3: Check. A leg of $12$ is shorter than the hypotenuse of $20$, as it must be.

**Answer: A** ($12$)

```json
"distractor_logic": {
  "A": "Correct: the unknown sits on top, so multiplying the hypotenuse by 0.6 gives a leg of 12, shorter than the hypotenuse as required",
  "B": "Student makes misconception: divides_instead_of_multiplies (divides 20 by 0.6 for 33.3, a leg longer than the hypotenuse and therefore impossible)",
  "C": "Student makes misconception: wrong_trig_ratio_selected (works with the cosine of 0.8 and returns the adjacent side of 16 instead)",
  "D": "Student makes misconception: ratio_numerator_as_side_length (hands back the ratio 0.6 as though it were a length)"
},
"misconception_tag": {
  "B": "divides_instead_of_multiplies",
  "C": "wrong_trig_ratio_selected",
  "D": "ratio_numerator_as_side_length"
}
```

---

**6. In a right triangle, the side opposite a $30^\circ$ angle is $7$. What is the length of the hypotenuse?**

Step 1: Opposite and hypotenuse means sine.
- $\sin 30^\circ = \frac{7}{\text{hypotenuse}}$, so $0.5 = \frac{7}{\text{hypotenuse}}$

Step 2: The unknown is on the bottom, so divide.
- $\frac{7}{0.5} = 14$

Step 3: Check. The hypotenuse of $14$ is longer than the leg of $7$, as it must be.

**Answer: B** ($14$)

```json
"distractor_logic": {
  "A": "Student makes misconception: special_angle_family_wrong (uses sin 60 of 0.866 in place of sin 30, reaching 8.1)",
  "B": "Correct: dividing 7 by 0.5 gives a hypotenuse of 14, longer than the leg of 7 as required",
  "C": "Student makes misconception: multiplies_instead_of_divides (multiplies 7 by 0.5 for 3.5, a hypotenuse shorter than a leg and therefore impossible)",
  "D": "Student makes misconception: ratio_numerator_as_side_length (hands back the ratio 0.5 as though it were a length)"
},
"misconception_tag": {
  "A": "special_angle_family_wrong",
  "C": "multiplies_instead_of_divides",
  "D": "ratio_numerator_as_side_length"
}
```

---

**7. In a right triangle, the side adjacent to $\theta$ is $9$ and the hypotenuse is $15$. What is $\cos\theta$?**

Step 1: Cosine is adjacent over hypotenuse, and both are already given.
- $\frac{9}{15} = \frac{3}{5}$

Step 2: Check. It is less than $1$, as every cosine must be.

**Answer: D** ($\frac{3}{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_trig_ratio_selected (finds the opposite side of 12 and builds the sine of four fifths instead)",
  "B": "Student makes misconception: inverts_trig_ratio (puts the hypotenuse on top, giving five thirds, which no cosine can equal)",
  "C": "Student makes misconception: trig_side_roles_misassigned (pairs the adjacent side of 9 with the opposite side of 12 rather than with the hypotenuse)",
  "D": "Correct: adjacent over hypotenuse gives nine fifteenths, which simplifies to three fifths"
},
"misconception_tag": {
  "A": "wrong_trig_ratio_selected",
  "B": "inverts_trig_ratio",
  "C": "trig_side_roles_misassigned"
}
```

---

**Advanced Level**

**8. A right triangle has legs of $5$ and $12$. What is the sine of the angle opposite the leg of $5$?**

Step 1: Sine needs the hypotenuse, which is not given. Find it.
- $5^{2} + 12^{2} = 25 + 144 = 169$, and $\sqrt{169} = 13$

Step 2: Opposite over hypotenuse.
- $\frac{5}{13}$

**Answer: C** ($\frac{5}{13}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: legs_combined_without_squaring (adds the legs to 17 as the hypotenuse instead of squaring them first)",
  "B": "Student makes misconception: wrong_trig_ratio_selected (builds adjacent over hypotenuse, which is the cosine)",
  "C": "Correct: squares the legs for a hypotenuse of 13, then takes opposite over hypotenuse for five thirteenths",
  "D": "Student makes misconception: inverts_trig_ratio (puts the hypotenuse on top, giving thirteen fifths, which no sine can equal)"
},
"misconception_tag": {
  "A": "legs_combined_without_squaring",
  "B": "wrong_trig_ratio_selected",
  "D": "inverts_trig_ratio"
}
```

---

**9. In a right triangle, the side opposite $\theta$ is $8$ and the side adjacent to $\theta$ is $15$. Which calculation gives $\theta$?**

Step 1: The two sides you have are a leg and a leg, which is the tangent relationship.
- $\tan\theta = \frac{8}{15}$

Step 2: Undo it with the matching inverse.
- $\theta = \tan^{-1}\!\left(\frac{8}{15}\right) \approx 28.1^\circ$

Step 3: Check. $\theta$ faces the shorter leg, so it should be the smaller acute angle, and $28.1^\circ$ is well under $45^\circ$.

**Answer: A** ($\tan^{-1}\!\left(\frac{8}{15}\right)$)

```json
"distractor_logic": {
  "A": "Correct: two legs make a tangent, so the matching inverse is arctangent, giving about 28.1 degrees",
  "B": "Student makes misconception: inverse_trig_function_mismatched (feeds a leg-over-leg ratio into the inverse sine, which expects a leg over the hypotenuse)",
  "C": "Student makes misconception: inverts_trig_ratio (puts the adjacent on top, which returns the other acute angle)",
  "D": "Student makes misconception: trig_side_roles_misassigned (uses the hypotenuse of 17 where the adjacent side of 15 belonged)"
},
"misconception_tag": {
  "B": "inverse_trig_function_mismatched",
  "C": "inverts_trig_ratio",
  "D": "trig_side_roles_misassigned"
}
```

---

**10. In a right triangle, the side adjacent to a $40^\circ$ angle is $12$. What is the length of the side opposite it?**

Step 1: You have the adjacent and want the opposite, which is tangent.
- $\tan 40^\circ = \frac{x}{12}$, so $0.839 = \frac{x}{12}$

Step 2: The unknown is on top, so multiply.
- $12(0.839) = 10.07$, which rounds to $10.1$

Step 3: Check. $40^\circ$ is under $45^\circ$, so the opposite side should be shorter than the adjacent, and $10.1 < 12$.

**Answer: B** ($10.1$)

```json
"distractor_logic": {
  "A": "Student makes misconception: divides_instead_of_multiplies (divides 12 by 0.839 for 14.3, when the unknown sat on top and called for multiplication)",
  "B": "Correct: multiplies 12 by the tangent of 0.839 for about 10.1, shorter than the adjacent side as an angle under 45 degrees requires",
  "C": "Student makes misconception: hypotenuse_reported_for_leg (uses the cosine to reach the hypotenuse of 15.7 rather than the opposite leg)",
  "D": "Student makes misconception: ratio_numerator_as_side_length (hands back the ratio 0.839 as though it were a length)"
},
"misconception_tag": {
  "A": "divides_instead_of_multiplies",
  "C": "hypotenuse_reported_for_leg",
  "D": "ratio_numerator_as_side_length"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: The side opposite $\theta$ is $6$, the adjacent is $8$, the hypotenuse is $10$. What is $\sin\theta$?**

Step 1: Opposite over hypotenuse.
- $\frac{6}{10} = \frac{3}{5}$

**Answer: D** ($\frac{3}{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_trig_ratio_selected (builds adjacent over hypotenuse, which is the cosine)",
  "B": "Student makes misconception: inverts_trig_ratio (puts the hypotenuse on top, giving five thirds, which no sine can equal)",
  "C": "Student makes misconception: ratio_numerator_as_side_length (hands back the opposite side of 6 rather than the ratio)",
  "D": "Correct: opposite over hypotenuse gives six tenths, which simplifies to three fifths"
},
"misconception_tag": {
  "A": "wrong_trig_ratio_selected",
  "B": "inverts_trig_ratio",
  "C": "ratio_numerator_as_side_length"
}
```

---

**Item 2: The side opposite $\theta$ is $6$, the adjacent is $8$, the hypotenuse is $10$. What is $\tan\theta$?**

Step 1: Opposite over adjacent.
- $\frac{6}{8} = \frac{3}{4}$

**Answer: B** ($\frac{3}{4}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: wrong_trig_ratio_selected (divides by the hypotenuse, which builds the sine rather than the tangent)",
  "B": "Correct: opposite over adjacent gives six eighths, which simplifies to three quarters",
  "C": "Student makes misconception: inverts_trig_ratio (puts the adjacent on top, giving four thirds)",
  "D": "Student makes misconception: ratio_numerator_as_side_length (hands back the opposite side of 6 rather than the ratio)"
},
"misconception_tag": {
  "A": "wrong_trig_ratio_selected",
  "C": "inverts_trig_ratio",
  "D": "ratio_numerator_as_side_length"
}
```

---

**Item 3: A right triangle has a hypotenuse of $30$, and $\cos\theta = 0.8$. What is the length of the side adjacent to $\theta$?**

Step 1: $0.8 = \frac{\text{adjacent}}{30}$

Step 2: The unknown is on top, so multiply.
- $30(0.8) = 24$

Step 3: Check. A leg of $24$ is shorter than the hypotenuse of $30$, as it must be.

**Answer: C** ($24$)

```json
"distractor_logic": {
  "A": "Student makes misconception: divides_instead_of_multiplies (divides 30 by 0.8 for 37.5, a leg longer than the hypotenuse and therefore impossible)",
  "B": "Student makes misconception: wrong_trig_ratio_selected (works with the sine of 0.6 and returns the opposite side of 18 instead)",
  "C": "Correct: the unknown sits on top, so multiplying the hypotenuse by 0.8 gives an adjacent side of 24",
  "D": "Student makes misconception: ratio_numerator_as_side_length (hands back the ratio 0.8 as though it were a length)"
},
"misconception_tag": {
  "A": "divides_instead_of_multiplies",
  "B": "wrong_trig_ratio_selected",
  "D": "ratio_numerator_as_side_length"
}
```

---

**Item 4: A right triangle has legs of $9$ and $12$. What is the cosine of the angle opposite the leg of $9$?**

Step 1: Find the hypotenuse.
- $9^{2} + 12^{2} = 81 + 144 = 225$, and $\sqrt{225} = 15$

Step 2: The leg of $9$ is opposite, so the leg of $12$ is adjacent.
- $\cos\theta = \frac{12}{15} = \frac{4}{5}$

**Answer: C** ($\frac{4}{5}$)

```json
"distractor_logic": {
  "A": "Student makes misconception: legs_combined_without_squaring (adds the legs to 21 as the hypotenuse instead of squaring them first)",
  "B": "Student makes misconception: wrong_trig_ratio_selected (builds opposite over hypotenuse, which is the sine)",
  "C": "Correct: squares the legs for a hypotenuse of 15, then takes the adjacent 12 over 15 for four fifths",
  "D": "Student makes misconception: inverts_trig_ratio (puts the hypotenuse on top, giving five quarters, which no cosine can equal)"
},
"misconception_tag": {
  "A": "legs_combined_without_squaring",
  "B": "wrong_trig_ratio_selected",
  "D": "inverts_trig_ratio"
}
```
