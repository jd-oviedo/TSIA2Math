---
topic_name: "Identifying the maximum or minimum of a quadratic"
unit_number: 4
sequence_in_unit: 6
assessment_layer: "CRC"
estimated_time_minutes: 50
difficulty_band: "Proficient"
related_strand: "AR"
keywords: ["vertex", "maximum", "minimum", "parabola", "axis of symmetry", "vertex form", "quadratic"]
---

# AR.3.5 - Identifying the Maximum or Minimum of a Quadratic

**Topic ID:** AR.3.5  
**Unit:** 4  
**Strand:** AR (Algebraic Reasoning)  
**Assessment Layer:** CRC  
**Author:** Juan Dolores Oviedo  

---

#### **Part 1: Guided Notes**

##### Every Parabola Turns Around Exactly Once

A quadratic's graph is a parabola, and a parabola has one turning point. It falls, reaches a lowest place, and rises again. Or it rises, reaches a highest place, and falls again. There is no third shape and no second turn.

That turning point is called the **vertex**, and it is where the maximum or minimum lives.

This matters outside of algebra class more than most topics do. If a quadratic models the height of a thrown ball, the vertex is the highest it gets. If it models cost, the vertex is the cheapest you can do. **The question "what is the best possible value" is a vertex question.**

---

##### Which Way Does It Open?

Whether you get a maximum or a minimum is decided by one number: the coefficient in front of $x^{2}$, called $a$.

| Sign of $a$ | Opens | Vertex is a |
|---|---|---|
| **positive** | upward, like a cup | **minimum** |
| **negative** | downward, like a dome | **maximum** |

The way to keep this straight is to picture the ends rather than memorise the table. If $a$ is positive, then for very large $x$ the $ax^{2}$ term is enormous and positive, so both arms shoot **up**. Arms up means the middle is the lowest point, which is a minimum.

If $a$ is negative, both arms shoot **down**, and the middle is the highest point.

**Only the sign of $a$ decides this.** Not the constant term, not where the graph sits on the page. $f(x) = x^{2} - 100$ has a minimum even though every visible part of it is below the axis, and $f(x) = -x^{2} + 100$ has a maximum even though it is mostly above.

And "neither" is never the answer for a quadratic. A parabola always turns around once.

---

##### Reading the Turning Point off a Graph

<!-- figure: ar-3-5-minimum -->
![The parabola y equals x squared minus 4x plus 3 on a coordinate plane. It opens upward, crosses the x-axis at 1 and at 3, and crosses the y-axis at 3. Its lowest point is marked at (2, -1), halfway between the two x-intercepts.](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAgMjUwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjI1MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJUaGUgcGFyYWJvbGEgeSBlcXVhbHMgeCBzcXVhcmVkIG1pbnVzIDR4IHBsdXMgMyBvbiBhIGNvb3JkaW5hdGUgcGxhbmUuIEl0IG9wZW5zIHVwd2FyZCwgY3Jvc3NlcyB0aGUgeC1heGlzIGF0IDEgYW5kIGF0IDMsIGFuZCBjcm9zc2VzIHRoZSB5LWF4aXMgYXQgMy4gSXRzIGxvd2VzdCBwb2ludCBpcyBtYXJrZWQgYXQgKDIsIC0xKSwgaGFsZndheSBiZXR3ZWVuIHRoZSB0d28geC1pbnRlcmNlcHRzLiI+PHJlY3Qgd2lkdGg9IjM0MCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNGN0YzRTciIHJ4PSIxMCIvPjxnIHN0cm9rZT0iI0UyRENDQSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSB4MT0iMjgiIHkxPSIxNiIgeDI9IjI4IiB5Mj0iMjI4Ii8+PGxpbmUgeDE9Ijc3IiB5MT0iMTYiIHgyPSI3NyIgeTI9IjIyOCIvPjxsaW5lIHgxPSIxMjYiIHkxPSIxNiIgeDI9IjEyNiIgeTI9IjIyOCIvPjxsaW5lIHgxPSIxNzUiIHkxPSIxNiIgeDI9IjE3NSIgeTI9IjIyOCIvPjxsaW5lIHgxPSIyMjQiIHkxPSIxNiIgeDI9IjIyNCIgeTI9IjIyOCIvPjxsaW5lIHgxPSIyNzMiIHkxPSIxNiIgeDI9IjI3MyIgeTI9IjIyOCIvPjxsaW5lIHgxPSIzMjIiIHkxPSIxNiIgeDI9IjMyMiIgeTI9IjIyOCIvPjxsaW5lIHgxPSIyOCIgeTE9IjIxMC4zMyIgeDI9IjMyMiIgeTI9IjIxMC4zMyIvPjxsaW5lIHgxPSIyOCIgeTE9IjE3NSIgeDI9IjMyMiIgeTI9IjE3NSIvPjxsaW5lIHgxPSIyOCIgeTE9IjEzOS42NyIgeDI9IjMyMiIgeTI9IjEzOS42NyIvPjxsaW5lIHgxPSIyOCIgeTE9IjEwNC4zMyIgeDI9IjMyMiIgeTI9IjEwNC4zMyIvPjxsaW5lIHgxPSIyOCIgeTE9IjY5IiB4Mj0iMzIyIiB5Mj0iNjkiLz48bGluZSB4MT0iMjgiIHkxPSIzMy42NyIgeDI9IjMyMiIgeTI9IjMzLjY3Ii8+PC9nPjxsaW5lIHgxPSIyOCIgeTE9IjE3NSIgeDI9IjMyMiIgeTI9IjE3NSIgc3Ryb2tlPSIjMEUwRTExIiBzdHJva2Utd2lkdGg9IjEuNiIvPjxsaW5lIHgxPSI3NyIgeTE9IjIyOCIgeDI9Ijc3IiB5Mj0iMTYiIHN0cm9rZT0iIzBFMEUxMSIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48ZyBmb250LWZhbWlseT0idWktc2Fucy1zZXJpZixzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzBFMEUxMSI+PHRleHQgeD0iMjgiIHk9IjE4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+LTE8L3RleHQ+PHRleHQgeD0iMTI2IiB5PSIxODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjE8L3RleHQ+PHRleHQgeD0iMTc1IiB5PSIxODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjI8L3RleHQ+PHRleHQgeD0iMjI0IiB5PSIxODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjM8L3RleHQ+PHRleHQgeD0iMjczIiB5PSIxODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjQ8L3RleHQ+PHRleHQgeD0iMzIyIiB5PSIxODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjU8L3RleHQ+PHRleHQgeD0iNzEiIHk9IjIxMy44MyIgdGV4dC1hbmNob3I9ImVuZCI+LTI8L3RleHQ+PHRleHQgeD0iNzEiIHk9IjE0My4xNyIgdGV4dC1hbmNob3I9ImVuZCI+MjwvdGV4dD48dGV4dCB4PSI3MSIgeT0iMTA3LjgzIiB0ZXh0LWFuY2hvcj0iZW5kIj40PC90ZXh0Pjx0ZXh0IHg9IjcxIiB5PSI3Mi41IiB0ZXh0LWFuY2hvcj0iZW5kIj42PC90ZXh0Pjx0ZXh0IHg9IjcxIiB5PSIzNy4xNyIgdGV4dC1hbmNob3I9ImVuZCI+ODwvdGV4dD48L2c+PHBvbHlsaW5lIGRhdGEtY3VydmU9IjAiIHBvaW50cz0iMjgsMzMuNjcgMjkuODQsMzcuNjIgMzEuNjcsNDEuNTIgMzMuNTEsNDUuMzcgMzUuMzUsNDkuMTcgMzcuMTksNTIuOTIgMzkuMDMsNTYuNjIgNDAuODYsNjAuMjcgNDIuNyw2My44OCA0NC41NCw2Ny40MyA0Ni4zOCw3MC45MyA0OC4yMSw3NC4zOSA1MC4wNSw3Ny43OSA1MS44OSw4MS4xNCA1My43Myw4NC40NSA1NS41Niw4Ny43IDU3LjQsOTAuOTEgNTkuMjQsOTQuMDYgNjEuMDgsOTcuMTcgNjIuOTEsMTAwLjIyIDY0Ljc1LDEwMy4yMyA2Ni41OSwxMDYuMTkgNjguNDMsMTA5LjA5IDcwLjI2LDExMS45NSA3Mi4xLDExNC43NiA3My45NCwxMTcuNTEgNzUuNzgsMTIwLjIyIDc3LjYxLDEyMi44OCA3OS40NSwxMjUuNDkgODEuMjksMTI4LjA1IDgzLjEzLDEzMC41NiA4NC45NiwxMzMuMDIgODYuOCwxMzUuNDMgODguNjQsMTM3Ljc5IDkwLjQ4LDE0MC4xIDkyLjMxLDE0Mi4zNiA5NC4xNSwxNDQuNTcgOTUuOTksMTQ2LjczIDk3LjgzLDE0OC44NCA5OS42NiwxNTAuOSAxMDEuNSwxNTIuOTIgMTAzLjM0LDE1NC44OCAxMDUuMTgsMTU2Ljc5IDEwNy4wMSwxNTguNjYgMTA4Ljg1LDE2MC40NyAxMTAuNjksMTYyLjIzIDExMi41MywxNjMuOTUgMTE0LjM2LDE2NS42MSAxMTYuMiwxNjcuMjMgMTE4LjA0LDE2OC43OSAxMTkuODgsMTcwLjMxIDEyMS43MSwxNzEuNzcgMTIzLjU1LDE3My4xOSAxMjUuMzksMTc0LjU2IDEyNy4yMywxNzUuODcgMTI5LjA2LDE3Ny4xNCAxMzAuOSwxNzguMzYgMTMyLjc0LDE3OS41MiAxMzQuNTcsMTgwLjY0IDEzNi40MSwxODEuNzEgMTM4LjI1LDE4Mi43MyAxNDAuMDksMTgzLjcgMTQxLjkyLDE4NC42MiAxNDMuNzYsMTg1LjQ5IDE0NS42LDE4Ni4zMSAxNDcuNDQsMTg3LjA4IDE0OS4yOCwxODcuOCAxNTEuMTEsMTg4LjQ3IDE1Mi45NSwxODkuMDkgMTU0Ljc5LDE4OS42NiAxNTYuNjMsMTkwLjE4IDE1OC40NiwxOTAuNjUgMTYwLjMsMTkxLjA4IDE2Mi4xNCwxOTEuNDUgMTYzLjk4LDE5MS43NyAxNjUuODEsMTkyLjA1IDE2Ny42NSwxOTIuMjcgMTY5LjQ5LDE5Mi40NCAxNzEuMzMsMTkyLjU3IDE3My4xNiwxOTIuNjQgMTc1LDE5Mi42NyAxNzYuODQsMTkyLjY0IDE3OC42OCwxOTIuNTcgMTgwLjUxLDE5Mi40NCAxODIuMzUsMTkyLjI3IDE4NC4xOSwxOTIuMDUgMTg2LjAzLDE5MS43NyAxODcuODYsMTkxLjQ1IDE4OS43LDE5MS4wOCAxOTEuNTQsMTkwLjY1IDE5My4zOCwxOTAuMTggMTk1LjIxLDE4OS42NiAxOTcuMDUsMTg5LjA5IDE5OC44OSwxODguNDcgMjAwLjczLDE4Ny44IDIwMi41NiwxODcuMDggMjA0LjQsMTg2LjMxIDIwNi4yNCwxODUuNDkgMjA4LjA4LDE4NC42MiAyMDkuOTEsMTgzLjcgMjExLjc1LDE4Mi43MyAyMTMuNTksMTgxLjcxIDIxNS40MywxODAuNjQgMjE3LjI2LDE3OS41MiAyMTkuMSwxNzguMzYgMjIwLjk0LDE3Ny4xNCAyMjIuNzgsMTc1Ljg3IDIyNC42MSwxNzQuNTYgMjI2LjQ1LDE3My4xOSAyMjguMjksMTcxLjc3IDIzMC4xMywxNzAuMzEgMjMxLjk2LDE2OC43OSAyMzMuOCwxNjcuMjMgMjM1LjY0LDE2NS42MSAyMzcuNDcsMTYzLjk1IDIzOS4zMSwxNjIuMjMgMjQxLjE1LDE2MC40NyAyNDIuOTksMTU4LjY2IDI0NC44MywxNTYuNzkgMjQ2LjY2LDE1NC44OCAyNDguNSwxNTIuOTIgMjUwLjM0LDE1MC45IDI1Mi4xOCwxNDguODQgMjU0LjAxLDE0Ni43MyAyNTUuODUsMTQ0LjU3IDI1Ny42OSwxNDIuMzYgMjU5LjUyLDE0MC4xIDI2MS4zNiwxMzcuNzkgMjYzLjIsMTM1LjQzIDI2NS4wNCwxMzMuMDIgMjY2Ljg4LDEzMC41NiAyNjguNzEsMTI4LjA1IDI3MC41NSwxMjUuNDkgMjcyLjM5LDEyMi44OCAyNzQuMjIsMTIwLjIyIDI3Ni4wNiwxMTcuNTEgMjc3LjksMTE0Ljc2IDI3OS43NCwxMTEuOTUgMjgxLjU4LDEwOS4wOSAyODMuNDEsMTA2LjE5IDI4NS4yNSwxMDMuMjMgMjg3LjA5LDEwMC4yMiAyODguOTMsOTcuMTcgMjkwLjc2LDk0LjA2IDI5Mi42LDkwLjkxIDI5NC40NCw4Ny43IDI5Ni4yNyw4NC40NSAyOTguMTEsODEuMTQgMjk5Ljk1LDc3Ljc5IDMwMS43OSw3NC4zOSAzMDMuNjMsNzAuOTMgMzA1LjQ2LDY3LjQzIDMwNy4zLDYzLjg4IDMwOS4xNCw2MC4yNyAzMTAuOTcsNTYuNjIgMzEyLjgxLDUyLjkyIDMxNC42NSw0OS4xNyAzMTYuNDksNDUuMzcgMzE4LjMzLDQxLjUyIDMyMC4xNiwzNy42MiAzMjIsMzMuNjciIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZFOURDOCIgc3Ryb2tlLXdpZHRoPSIyLjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjE3NSIgY3k9IjE5Mi42NyIgcj0iNC41IiBmaWxsPSIjRjBBMzNFIiBzdHJva2U9IiNGN0YzRTciIHN0cm9rZS13aWR0aD0iMS41Ii8+PHRleHQgeD0iMTg1IiB5PSIyMDYuNjciIGZvbnQtZmFtaWx5PSJ1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMEUwRTExIj5taW5pbXVtICgyLCAtMSk8L3RleHQ+PC9zdmc+)

The graph above is $f(x) = x^{2} - 4x + 3$. Here is everything it shows, in words.

The coefficient $a = 1$ is positive, so the curve opens **upward** and both arms rise. It crosses the x-axis at $x = 1$ and at $x = 3$, and it crosses the y-axis at $3$. Between the two x-intercepts the curve dips below the axis, and the lowest place it reaches is the marked point $(2, -1)$.

Three things are worth noticing about that vertex.

**It sits exactly halfway between the two x-intercepts.** The intercepts are at $1$ and $3$, and $2$ is the midpoint. That is not a coincidence; a parabola is symmetric, so its turning point is always centred between its roots.

**Its two coordinates answer two different questions.** The $2$ answers "where does the minimum happen?" The $-1$ answers "what is the minimum?" Those are different questions with different answers, and mixing them up is the main hazard of this topic.

**The minimum value is $-1$, not $3$.** The $3$ is the y-intercept, the height at $x = 0$. It is the value the graph has at the left edge of the picture, not its lowest value.

---

##### The Mistake That Costs the Most Points

Read this section twice.

**"Where" and "what" are different questions.**

The vertex is a point, so it has two numbers, and each answers only one of these:

- **Where** does the minimum occur? That is the **x-coordinate**.
- **What** is the minimum value? That is the **y-coordinate**.

For the graph above, the minimum **occurs at** $x = 2$ and the minimum **value is** $-1$.

A question asking "what is the minimum value of $f$" wants $-1$. Answering $2$ is answering a question that was not asked. The number $2$ has its own name, the **axis of symmetry**, and you met it in AR.3.4 as $\frac{-b}{2a}$, the number the two roots sit either side of.

The trap is built into how you find the vertex. You compute the x-coordinate first, and it is sitting there in front of you when the question asks for a value. **Finding $x$ is step one, not the answer.**

The fix: after you find $x$, write the words "occurs at" next to it. Then you cannot hand it in as a value.

And when the question asks for the vertex as a point, keep the order $(x, y)$. Writing $(-1, 2)$ instead of $(2, -1)$ reverses which question each number answers.

---

##### Vertex Form Hands You the Answer

Some quadratics arrive already arranged to make the vertex visible:

$$f(x) = a(x - h)^{2} + k$$

In this form the vertex is $(h, k)$, with no work at all.

Why it works: the squared part $(x - h)^{2}$ is never negative, and it equals zero exactly when $x = h$. So the smallest the squared part can be is zero, and there $f$ equals $k$. Every other $x$ adds something on. So if $a$ is positive, $k$ is the minimum and it happens at $x = h$.

**Example 1:** What is the vertex of $f(x) = (x - 3)^{2} + 4$?

Step 1: Match against $a(x - h)^{2} + k$. The bracket is $(x - 3)$, so $h = 3$. The tail is $+4$, so $k = 4$.

Step 2: The vertex is $(h, k) = (3, 4)$.

Step 3: $a = 1$ is positive, so this is a minimum, and the minimum value is $4$.

**The sign inside the bracket flips.** The form has a minus in it, $(x - h)$, so a bracket reading $(x - 3)$ means $h = +3$. This is the same flip you have been doing since AR.3.3, where $(x - 3) = 0$ gave $x = 3$.

**Example 2:** What is the vertex of $f(x) = 2(x + 3)^{2} - 8$?

Step 1: Rewrite the bracket to match the form. $(x + 3)$ is $(x - (-3))$, so $h = -3$.

Step 2: The tail is $-8$, so $k = -8$.

Step 3: The vertex is $(-3, -8)$.

Step 4: $a = 2$ is positive, so the minimum value is $-8$, occurring at $x = -3$.

Reading $h$ straight out of the bracket as $+3$ here would put the vertex at $(3, -8)$, which is six units away from where it actually is.

---

##### From Standard Form: Find x First, Then Substitute

When the quadratic is written the usual way, $f(x) = ax^{2} + bx + c$, the vertex takes two steps.

$$x = \frac{-b}{2a}$$

That gives you **where**. To get **what**, substitute that $x$ back into the function.

**Example 3:** What is the minimum value of $f(x) = x^{2} - 6x + 5$?

Step 1: Read off $a = 1$, $b = -6$, $c = 5$.

Step 2: Find where the vertex is.
- $x = \frac{-(-6)}{2(1)} = \frac{6}{2} = 3$

Step 3: Substitute $x = 3$ back into the function to find the value.
- $f(3) = 9 - 18 + 5 = -4$

Step 4: $a$ is positive, so this is a minimum.

The minimum value is $-4$, occurring at $x = 3$.

Two numbers from this problem are wrong answers waiting to be picked. The $3$ from Step 2 is where, not what. The $5$ from the original expression is the y-intercept, the value at $x = 0$, and $f(0) = 5$ is genuinely a value the function takes, just not its smallest one. **Neither of those is the minimum.**

**Example 4:** What is the maximum value of $f(x) = -x^{2} + 6x - 5$?

Step 1: $a = -1$, $b = 6$, $c = -5$. Since $a$ is negative, expect a maximum.

Step 2: $x = \frac{-6}{2(-1)} = \frac{-6}{-2} = 3$.

Step 3: $f(3) = -9 + 18 - 5 = 4$.

The maximum value is $4$, occurring at $x = 3$.

Watch the double negative in Step 2. With $a$ negative, $2a$ is negative, and $\frac{-b}{2a}$ divides a negative by a negative. Dropping one of those minus signs sends the vertex to the wrong side of the graph.

---

##### The Five Traps

1. **Reporting where instead of what.** For $f(x) = x^{2} - 6x + 5$ the minimum **value** is $-4$. The $3$ is where it happens.
2. **Reporting the constant term as the extreme value.** In $x^{2} - 6x + 5$ the $5$ is the y-intercept, not the minimum.
3. **Reading $h$ literally out of the bracket.** $2(x + 3)^{2} - 8$ has its vertex at $x = -3$, not $x = 3$.
4. **Getting the opening direction backward.** Positive $a$ opens upward and gives a **minimum**. Negative $a$ gives a maximum.
5. **Writing the vertex coordinates in the wrong order.** The vertex of $x^{2} - 4x + 3$ is $(2, -1)$, not $(-1, 2)$.

A parabola always has exactly one of a maximum or a minimum, so "neither" and "both" are never right. When you miss a problem below, name the trap. Naming it is how you stop repeating it.

---

#### **Part 2: Practice Problems**

Solve each problem. Show your thinking.

**Basic Level** (try these first)

1. Does $f(x) = x^{2} - 4x + 3$ have a maximum or a minimum?
   - A) A minimum
   - B) A maximum
   - C) Neither, because a parabola extends forever in both directions
   - D) Both a maximum and a minimum

2. Does $f(x) = -2x^{2} + 8x - 5$ have a maximum or a minimum?
   - A) A minimum
   - B) A maximum
   - C) Neither, because the graph never stops rising
   - D) Neither, because the leading coefficient is negative

3. What is the vertex of $f(x) = (x - 3)^{2} + 4$?
   - A) $(-3, 4)$
   - B) $(3, 4)$
   - C) $(4, 3)$
   - D) $(3, -4)$

4. What is the minimum value of $f(x) = (x - 5)^{2} + 2$?
   - A) $2$
   - B) $5$
   - C) $-5$
   - D) $-2$

**Proficient Level** (these require an extra step)

5. What is the minimum value of $f(x) = x^{2} - 6x + 5$?
   - A) $3$
   - B) $5$
   - C) $-4$
   - D) $4$

6. What is the vertex of $f(x) = x^{2} + 8x + 10$?
   - A) $(4, -6)$
   - B) $(-6, -4)$
   - C) $(-4, 10)$
   - D) $(-4, -6)$

7. What is the maximum value of $f(x) = -x^{2} + 6x - 5$?
   - A) $3$
   - B) $4$
   - C) $-5$
   - D) There is no maximum

**Advanced Level** (these need multiple steps or reverse thinking)

8. What is the vertex of $f(x) = 2(x + 3)^{2} - 8$?
   - A) $(3, -8)$
   - B) $(-8, -3)$
   - C) $(-3, -8)$
   - D) $(-3, 8)$

9. Which statement about $f(x) = -3(x - 2)^{2} + 7$ is true?
   - A) It has a minimum value of $7$
   - B) It has a maximum value of $2$
   - C) It has a maximum value of $7$
   - D) It has no maximum or minimum

10. What is the minimum value of $f(x) = 3x^{2} + 12x + 7$?
    - A) $-2$
    - B) $7$
    - C) $5$
    - D) $-5$

---

#### **Part 3: Mini Quiz** (Complete in under 10 minutes)

**Item 1**

Does $f(x) = -4x^{2} + 3x + 1$ have a maximum or a minimum?

- A) A maximum
- B) A minimum
- C) Neither, because a parabola has no highest or lowest point
- D) A minimum, because the constant term $1$ is positive

**Item 2**

What is the vertex of $f(x) = (x + 6)^{2} - 2$?

- A) $(6, -2)$
- B) $(-6, -2)$
- C) $(-2, -6)$
- D) $(-6, 2)$

**Item 3**

What is the minimum value of $f(x) = x^{2} - 10x + 21$?

- A) $5$
- B) $21$
- C) $-4$
- D) $4$

**Item 4**

Which statement about $f(x) = 5(x - 1)^{2} + 3$ is true?

- A) It has a maximum value of $3$
- B) It has a minimum value of $1$
- C) It has no minimum value
- D) It has a minimum value of $3$

---

#### **Part 4: Answer Key**

##### Practice Problems - Worked Solutions

**Basic Level**

**1. Does $f(x) = x^{2} - 4x + 3$ have a maximum or a minimum?**

Step 1: Read off $a = 1$.

Step 2: $a$ is positive, so both arms of the parabola rise and the curve opens upward.

Step 3: An upward-opening parabola has a lowest point, which is a minimum. The vertex sits at $(2, -1)$.

**Answer: A** (a minimum)

```json
"distractor_logic": {
  "A": "Correct: the leading coefficient 1 is positive, so the parabola opens upward and its vertex is a lowest point",
  "B": "Student makes misconception: opening_direction_rule_reversed (associates a positive leading coefficient with a maximum; a positive coefficient sends both arms upward, which makes the vertex the lowest point rather than the highest)",
  "C": "Student makes misconception: extreme_point_believed_absent (reasons that because the arms extend forever there is no extreme point, but the arms extend upward, so the curve still has a lowest value of -1 at x = 2)",
  "D": "Student makes misconception: extreme_point_believed_absent (claims both extremes exist; a parabola turns exactly once, so it has one of the two and never both)"
},
"misconception_tag": {
  "B": "opening_direction_rule_reversed",
  "C": "extreme_point_believed_absent",
  "D": "extreme_point_believed_absent"
}
```

---

**2. Does $f(x) = -2x^{2} + 8x - 5$ have a maximum or a minimum?**

Step 1: Read off $a = -2$.

Step 2: $a$ is negative, so both arms fall and the curve opens downward.

Step 3: A downward-opening parabola has a highest point, which is a maximum.

**Answer: B** (a maximum)

```json
"distractor_logic": {
  "A": "Student makes misconception: opening_direction_rule_reversed (associates a negative leading coefficient with a minimum; a negative coefficient sends both arms downward, so the vertex is the highest point)",
  "B": "Correct: the leading coefficient -2 is negative, so the parabola opens downward and its vertex is a highest point",
  "C": "Student makes misconception: extreme_point_believed_absent (believes the graph rises without limit, but with a negative leading coefficient the arms fall, so the curve has a highest value)",
  "D": "Student makes misconception: extreme_point_believed_absent (takes a negative leading coefficient to mean no extreme point exists, when it means the extreme point is a maximum)"
},
"misconception_tag": {
  "A": "opening_direction_rule_reversed",
  "C": "extreme_point_believed_absent",
  "D": "extreme_point_believed_absent"
}
```

---

**3. What is the vertex of $f(x) = (x - 3)^{2} + 4$?**

Step 1: Match against $a(x - h)^{2} + k$. The bracket $(x - 3)$ gives $h = 3$.

Step 2: The tail $+4$ gives $k = 4$.

Step 3: The vertex is $(h, k) = (3, 4)$.

**Answer: B** ($(3, 4)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: vertex_form_h_read_literally (reads the -3 inside the bracket as the x-coordinate without flipping it; the form is a(x - h) squared, so a bracket of (x - 3) means h is positive 3)",
  "B": "Correct: matching (x - 3) squared plus 4 against a(x - h) squared plus k gives h = 3 and k = 4",
  "C": "Student makes misconception: coordinates_swapped (writes the pair in the order (k, h) rather than (h, k), so the value 4 is reported as the location and the location 3 as the value)",
  "D": "Student makes misconception: sign_error_on_constant (flips the sign of the tail, reading plus 4 as k = -4)"
},
"misconception_tag": {
  "A": "vertex_form_h_read_literally",
  "C": "coordinates_swapped",
  "D": "sign_error_on_constant"
}
```

---

**4. What is the minimum value of $f(x) = (x - 5)^{2} + 2$?**

Step 1: Match against $a(x - h)^{2} + k$. Here $h = 5$ and $k = 2$.

Step 2: The squared part is never negative and equals zero at $x = 5$, so the smallest $f$ can be is $2$.

Step 3: The minimum value is $2$, occurring at $x = 5$.

**Answer: A** ($2$)

```json
"distractor_logic": {
  "A": "Correct: the squared term is at its smallest, zero, when x = 5, and there f equals the tail value 2",
  "B": "Student makes misconception: axis_reported_as_extreme_value (reports 5, which is where the minimum occurs, when the question asks what the minimum is; substituting x = 5 gives f = 2, so 5 is the input and 2 is the output)",
  "C": "Student makes misconception: vertex_form_h_read_literally (reads the -5 inside the bracket without flipping it and reports it as the answer; the bracket (x - 5) puts the turning point at x = 5, not x = -5)",
  "D": "Student makes misconception: sign_error_on_constant (flips the sign of the tail, reporting -2 instead of 2; the function is a square plus 2, so its outputs are never below 2)"
},
"misconception_tag": {
  "B": "axis_reported_as_extreme_value",
  "C": "vertex_form_h_read_literally",
  "D": "sign_error_on_constant"
}
```

---

**Proficient Level**

**5. What is the minimum value of $f(x) = x^{2} - 6x + 5$?**

Step 1: $a = 1$, $b = -6$, $c = 5$. Since $a$ is positive, expect a minimum.

Step 2: Find where the vertex is.
- $x = \frac{-(-6)}{2(1)} = 3$

Step 3: Substitute back to find the value.
- $f(3) = 9 - 18 + 5 = -4$

The minimum value is $-4$, occurring at $x = 3$.

**Answer: C** ($-4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: axis_reported_as_extreme_value (stops at the x-coordinate of the vertex and reports 3, which is where the minimum happens rather than what it is)",
  "B": "Student makes misconception: constant_term_reported_as_extreme (reports the constant 5, which is the y-intercept; f(0) = 5 is a value the function takes, but f(3) = -4 is smaller)",
  "C": "Correct: the vertex is at x = 3, and substituting gives 9 minus 18 plus 5, which is -4",
  "D": "Student makes misconception: sign_error_on_constant (computes the substitution as 9 minus 18 plus 5 but reports the magnitude with the wrong sign, giving 4 instead of -4)"
},
"misconception_tag": {
  "A": "axis_reported_as_extreme_value",
  "B": "constant_term_reported_as_extreme",
  "D": "sign_error_on_constant"
}
```

---

**6. What is the vertex of $f(x) = x^{2} + 8x + 10$?**

Step 1: $a = 1$, $b = 8$, $c = 10$.

Step 2: Find the x-coordinate.
- $x = \frac{-8}{2(1)} = -4$

Step 3: Substitute back.
- $f(-4) = 16 - 32 + 10 = -6$

The vertex is $(-4, -6)$.

**Answer: D** ($(-4, -6)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (drops the minus in negative b over 2a and computes 8 over 2 as positive 4, then takes the vertex value from k = c minus b squared over 4a, which is 10 minus 16, or -6, a route that never uses h and so stays correct; the second coordinate is right and the first is wrong, since negative b over 2a is -4)",
  "B": "Student makes misconception: coordinates_swapped (finds both numbers correctly but writes them in the order (k, h) rather than (h, k))",
  "C": "Student makes misconception: constant_term_reported_as_extreme (finds the x-coordinate correctly but reports the constant 10 as the y-coordinate instead of substituting; f(0) = 10, whereas f(-4) = -6)",
  "D": "Correct: negative b over 2a gives -4, and substituting gives 16 minus 32 plus 10, which is -6"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "B": "coordinates_swapped",
  "C": "constant_term_reported_as_extreme"
}
```

---

**7. What is the maximum value of $f(x) = -x^{2} + 6x - 5$?**

Step 1: $a = -1$, $b = 6$, $c = -5$. Since $a$ is negative, expect a maximum.

Step 2: Find where the vertex is, watching the double negative.
- $x = \frac{-6}{2(-1)} = \frac{-6}{-2} = 3$

Step 3: Substitute back.
- $f(3) = -9 + 18 - 5 = 4$

The maximum value is $4$, occurring at $x = 3$.

**Answer: B** ($4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: axis_reported_as_extreme_value (reports 3, the x-coordinate of the vertex, when the question asks for the maximum value; f(3) = 4 is the value)",
  "B": "Correct: the vertex is at x = 3, and substituting gives -9 plus 18 minus 5, which is 4",
  "C": "Student makes misconception: constant_term_reported_as_extreme (reports the constant -5, which is the y-intercept; f(0) = -5 is a value the function takes, but the largest is 4)",
  "D": "Student makes misconception: extreme_point_believed_absent (concludes no maximum exists, but the negative leading coefficient sends both arms downward, so the curve has a highest point)"
},
"misconception_tag": {
  "A": "axis_reported_as_extreme_value",
  "C": "constant_term_reported_as_extreme",
  "D": "extreme_point_believed_absent"
}
```

---

**Advanced Level**

**8. What is the vertex of $f(x) = 2(x + 3)^{2} - 8$?**

Step 1: Rewrite the bracket to match $a(x - h)^{2} + k$. Since $(x + 3) = (x - (-3))$, $h = -3$.

Step 2: The tail is $-8$, so $k = -8$.

Step 3: The vertex is $(-3, -8)$.

**Answer: C** ($(-3, -8)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: vertex_form_h_read_literally (reads the 3 inside the bracket as the x-coordinate; the form subtracts h, so a bracket of (x + 3) means h is -3, six units from where this puts it)",
  "B": "Student makes misconception: coordinates_swapped (gets both numbers right but writes the pair in the order (k, h))",
  "C": "Correct: (x + 3) is (x minus -3), so h is -3, and the tail gives k = -8",
  "D": "Student makes misconception: sign_error_on_constant (flips the sign of the tail, reading minus 8 as k = 8)"
},
"misconception_tag": {
  "A": "vertex_form_h_read_literally",
  "B": "coordinates_swapped",
  "D": "sign_error_on_constant"
}
```

---

**9. Which statement about $f(x) = -3(x - 2)^{2} + 7$ is true?**

Step 1: $a = -3$ is negative, so the parabola opens downward and the vertex is a maximum.

Step 2: The bracket $(x - 2)$ gives $h = 2$, and the tail gives $k = 7$.

Step 3: The maximum value is $7$, occurring at $x = 2$.

**Answer: C** (maximum value of $7$)

```json
"distractor_logic": {
  "A": "Student makes misconception: opening_direction_rule_reversed (finds the correct extreme value 7 but calls it a minimum; the leading coefficient -3 is negative, so the parabola opens downward and 7 is the largest output, not the smallest)",
  "B": "Student makes misconception: axis_reported_as_extreme_value (reports 2, where the maximum occurs, as the maximum value; substituting x = 2 gives f = 7)",
  "C": "Correct: the negative leading coefficient makes the vertex a maximum, and vertex form gives its value directly as 7",
  "D": "Student makes misconception: extreme_point_believed_absent (concludes there is no extreme point, but every parabola turns exactly once and this one turns at (2, 7))"
},
"misconception_tag": {
  "A": "opening_direction_rule_reversed",
  "B": "axis_reported_as_extreme_value",
  "D": "extreme_point_believed_absent"
}
```

---

**10. What is the minimum value of $f(x) = 3x^{2} + 12x + 7$?**

Step 1: $a = 3$, $b = 12$, $c = 7$. Since $a$ is positive, expect a minimum.

Step 2: Find where the vertex is.
- $x = \frac{-12}{2(3)} = \frac{-12}{6} = -2$

Step 3: Substitute back.
- $f(-2) = 3(4) + 12(-2) + 7 = 12 - 24 + 7 = -5$

The minimum value is $-5$, occurring at $x = -2$.

**Answer: D** ($-5$)

```json
"distractor_logic": {
  "A": "Student makes misconception: axis_reported_as_extreme_value (reports -2, the x-coordinate of the vertex, when the question asks for the minimum value; f(-2) = -5 is the value)",
  "B": "Student makes misconception: constant_term_reported_as_extreme (reports the constant 7, which is the y-intercept; f(0) = 7 is a value the function takes, but f(-2) = -5 is smaller)",
  "C": "Student makes misconception: sign_error_on_constant (computes 12 minus 24 plus 7 but reports the magnitude with the wrong sign, giving 5 instead of -5)",
  "D": "Correct: the vertex is at x = -2, and substituting gives 12 minus 24 plus 7, which is -5"
},
"misconception_tag": {
  "A": "axis_reported_as_extreme_value",
  "B": "constant_term_reported_as_extreme",
  "C": "sign_error_on_constant"
}
```

---

##### Mini Quiz - Answer Key

**Item 1: Does $f(x) = -4x^{2} + 3x + 1$ have a maximum or a minimum?**

Step 1: Read off $a = -4$.

Step 2: $a$ is negative, so both arms fall and the curve opens downward.

Step 3: A downward-opening parabola has a highest point, so it has a maximum.

**Answer: A** (a maximum)

```json
"distractor_logic": {
  "A": "Correct: the leading coefficient -4 is negative, so the parabola opens downward and its vertex is a highest point",
  "B": "Student makes misconception: opening_direction_rule_reversed (associates a negative leading coefficient with a minimum, when a negative coefficient sends both arms downward and makes the vertex a maximum)",
  "C": "Student makes misconception: extreme_point_believed_absent (denies that a parabola has an extreme point at all; every parabola turns exactly once, and that turning point is the extreme)",
  "D": "Student makes misconception: opening_direction_rule_reversed (decides the direction from the constant term rather than the leading coefficient; only the sign of the coefficient on x squared controls which way the curve opens)"
},
"misconception_tag": {
  "B": "opening_direction_rule_reversed",
  "C": "extreme_point_believed_absent",
  "D": "opening_direction_rule_reversed"
}
```

---

**Item 2: What is the vertex of $f(x) = (x + 6)^{2} - 2$?**

Step 1: Rewrite the bracket. $(x + 6) = (x - (-6))$, so $h = -6$.

Step 2: The tail is $-2$, so $k = -2$.

Step 3: The vertex is $(-6, -2)$.

**Answer: B** ($(-6, -2)$)

```json
"distractor_logic": {
  "A": "Student makes misconception: vertex_form_h_read_literally (reads the 6 inside the bracket as the x-coordinate; the form subtracts h, so (x + 6) means h is -6)",
  "B": "Correct: (x + 6) is (x minus -6), giving h = -6, and the tail gives k = -2",
  "C": "Student makes misconception: coordinates_swapped (finds both numbers correctly but writes the pair in the order (k, h))",
  "D": "Student makes misconception: sign_error_on_constant (flips the sign of the tail, reading minus 2 as k = 2)"
},
"misconception_tag": {
  "A": "vertex_form_h_read_literally",
  "C": "coordinates_swapped",
  "D": "sign_error_on_constant"
}
```

---

**Item 3: What is the minimum value of $f(x) = x^{2} - 10x + 21$?**

Step 1: $a = 1$, $b = -10$, $c = 21$.

Step 2: Find where the vertex is.
- $x = \frac{-(-10)}{2(1)} = 5$

Step 3: Substitute back.
- $f(5) = 25 - 50 + 21 = -4$

The minimum value is $-4$, occurring at $x = 5$.

**Answer: C** ($-4$)

```json
"distractor_logic": {
  "A": "Student makes misconception: axis_reported_as_extreme_value (reports 5, where the minimum occurs, rather than the value there; f(5) = -4)",
  "B": "Student makes misconception: constant_term_reported_as_extreme (reports the constant 21, which is the y-intercept; f(0) = 21, but the smallest output is -4)",
  "C": "Correct: the vertex is at x = 5, and substituting gives 25 minus 50 plus 21, which is -4",
  "D": "Student makes misconception: sign_error_on_constant (computes 25 minus 50 plus 21 but reports the magnitude with the wrong sign, giving 4 instead of -4)"
},
"misconception_tag": {
  "A": "axis_reported_as_extreme_value",
  "B": "constant_term_reported_as_extreme",
  "D": "sign_error_on_constant"
}
```

---

**Item 4: Which statement about $f(x) = 5(x - 1)^{2} + 3$ is true?**

Step 1: $a = 5$ is positive, so the parabola opens upward and the vertex is a minimum.

Step 2: The bracket $(x - 1)$ gives $h = 1$, and the tail gives $k = 3$.

Step 3: The minimum value is $3$, occurring at $x = 1$.

**Answer: D** (minimum value of $3$)

```json
"distractor_logic": {
  "A": "Student makes misconception: opening_direction_rule_reversed (finds the correct extreme value 3 but calls it a maximum; the leading coefficient 5 is positive, so the parabola opens upward and 3 is the smallest output)",
  "B": "Student makes misconception: axis_reported_as_extreme_value (reports 1, where the minimum occurs, as the minimum value; substituting x = 1 gives f = 3)",
  "C": "Student makes misconception: extreme_point_believed_absent (denies the function has a minimum, but the squared term is never negative, so f is never below 3)",
  "D": "Correct: the positive leading coefficient makes the vertex a minimum, and vertex form gives its value directly as 3"
},
"misconception_tag": {
  "A": "opening_direction_rule_reversed",
  "B": "axis_reported_as_extreme_value",
  "C": "extreme_point_believed_absent"
}
```
