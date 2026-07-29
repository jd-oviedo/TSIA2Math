# QR.3.5 source items -- templating audit

The 15 items as they exist in `data/items/QR/QR.3.5.json` today, read from the
file rather than from the topic spec. Distractor text below is quoted from the
real `distractor_logic`, because the misconception each template encodes must be
the one already on file: templating may not silently rename or redefine a
misconception that `student_misconceptions` and the teacher dashboard already
display.

Parameter letters are assigned left to right across the expression as written.

---

## Basic

### QR_B_090 -- `3x + 5x`, correct A `8x`

    a=3, b=5    ->    a*x + b*x

| | value | misconception on file |
|---|---|---|
| A | `8x` | correct |
| B | `15x` | "multiplies the coefficients instead of adding them" |
| C | `8x^2` | "adds the coefficients to get 8 but also multiplies the variables together as x * x" |
| D | `8` | "adds the coefficients but drops the variable entirely" |

**Templatable: yes.** All three misconceptions are procedures on the two
coefficients, none depends on the specific values 3 and 5. One collision to
exclude: B meets A whenever `a*b == a + b`, which over positive integers is only
`(2,2)`.

### QR_B_091 -- `7x - 4x + 2`, correct B `3x + 2`

    a=7, b=4, c=2    ->    a*x - b*x + c

| | value | misconception on file |
|---|---|---|
| A | `11x + 2` | "adds the x-coefficients instead of subtracting" |
| B | `3x + 2` | correct |
| C | `3x` | "combines the x-terms correctly but drops the constant term" |
| D | `5x` | "combines all three terms as if they were like" |

**Templatable: yes.** Needs `c != 0` (otherwise C meets D and the constant-drop
misconception becomes invisible) and `a - b >= 2` to keep the answer positive
and away from a bare-`x` coefficient.

### QR_B_092 -- `5x + 2y + 3x`, correct C `8x + 2y`

    a=5, b=2, c=3    ->    a*x + b*y + c*x

| | value | misconception on file |
|---|---|---|
| A | `10x` | "adds every coefficient and attaches a single variable" |
| B | `10xy` | "treats all three terms as like, adding coefficients and merging the variables" |
| C | `8x + 2y` | correct |
| D | `8x` | "discards the 2y as if an unlike term disappears" |

**Templatable: yes.** Needs `b != 0`, else A collapses onto D.

### QR_B_093 -- `6x - (-3x)`, correct D `9x`

    a=6, b=3    ->    a*x - (-b*x)

| | value | misconception on file |
|---|---|---|
| A | `3x` | "keeps only one negative sign, treating -(-3x) as -3x" |
| B | `18x` | "multiplies the coefficients" |
| C | `9` | "adds the coefficients but drops the variable" |
| D | `9x` | correct |

**Templatable: yes.** This is the item carrying the pool's **mandatory
sign-error coverage** -- distractor A is the subtraction sign error, and as a
formula (`(a - b)*x` against a correct `(a + b)*x`) it now appears on *every*
roll rather than only on the instance that happened to have it.

### QR_B_094 -- `4x + 1 + 2x + 5`, correct A `6x + 6`

    a=4, b=1, c=2, d=5    ->    a*x + b + c*x + d

| | value | misconception on file |
|---|---|---|
| A | `6x + 6` | correct |
| B | `12x` | "adds all four terms as if like" |
| C | `6x + 4` | "subtracts the constants instead of adding" |
| D | `6x + 5` | "keeps only the larger constant, dropping the +1" |

**Templatable: yes, with one constraint that is load-bearing.** D's misconception
is "keeps only the *larger* constant". Rather than encode a `Max()` into the
formula -- which would make the answer choice depend on which of two parameters
happened to roll higher, and make the explanation harder to read -- the template
pins `d > b`. D is then always `d`, exactly as the sentence describes.

---

## Proficient

### QR_P_077 -- `5x + 3 - 2x + 7`, correct B `3x + 10`

    a=5, b=3, c=2, d=7    ->    a*x + b - c*x + d

| | value | misconception on file |
|---|---|---|
| A | `7x + 10` | "adds the x-coefficients, ignoring the minus before 2x" |
| B | `3x + 10` | correct |
| C | `3x + 4` | "combines the x-terms correctly but subtracts the constants" |
| D | `13x` | "combines every term as if like" |

**Templatable: yes.** Needs `b != d`, or C's constant goes to zero and C becomes
a bare `3x` that no longer reads as a constant-arithmetic error.

### QR_P_078 -- `10x - (4x - 7)`, correct C `6x + 7`

    a=10, b=4, c=7    ->    a*x - (b*x - c)

| | value | misconception on file |
|---|---|---|
| A | `6x - 7` | "applies the subtraction only to 4x and keeps the -7, missing the sign change on the second term" |
| B | `14x - 7` | "ignores the negative in front of the parentheses and adds the group" |
| C | `6x + 7` | correct |
| D | `13x` | "reaches 6x + 7 but then combines the unlike terms" |

**Templatable: yes.** Second item carrying sign-error coverage, and the cleaner
of the two symbolically: A differs from the correct answer purely in the sign of
`c`, so the error is structural and cannot roll away.

### QR_P_079 -- `2(x + 4) + 3x`, correct D `5x + 8`

    a=2, b=4, c=3    ->    a*(x + b) + c*x

| | value | misconception on file |
|---|---|---|
| A | `5x + 4` | "distributes the 2 to the x but not to the 4" |
| B | `4x + 4` | "ignores the factor of 2, treating 2(x + 4) as x + 4" |
| C | `13x` | "reaches 5x + 8 but then combines the unlike terms" |
| D | `5x + 8` | correct |

**Templatable: yes.** Needs `a != 1` -- at `a = 1` the "forgot to distribute"
misconception and the "ignored the factor" misconception both become no-ops, and
A, B and D all collapse together. The inner coefficient stays a literal `1` so
the stem keeps reading `(x + 4)`.

### QR_P_080 -- `6x + 2 - 4x - 5`, correct A `2x - 3`

    a=6, b=2, c=4, d=5    ->    a*x + b - c*x - d

| | value | misconception on file |
|---|---|---|
| A | `2x - 3` | correct |
| B | `2x + 7` | "treats the -5 as +5 when combining constants" |
| C | `10x - 3` | "adds the x-coefficients instead of subtracting" |
| D | `-x` | "combines every term as if like" |

**Templatable: yes.** `d > b` is required, not cosmetic: the item's own
`skills_targeted` says "combining interleaved like terms that **produce a
negative constant**". A roll with `b > d` would still be arithmetically fine but
would no longer test the skill the item claims to test.

### QR_P_081 -- landscaper, `3x + 20` and `2x + 15`, correct B `5x + 35`

    a=3, b=20, c=2, d=15    ->    (a*x + b) + (c*x + d)

| | value | misconception on file |
|---|---|---|
| A | `6x + 35` | "multiplies the x-coefficients instead of adding" |
| B | `5x + 35` | correct |
| C | `5x + 300` | "multiplies the constants instead of adding" |
| D | `40x` | "adds all four numbers as if all terms were like" |

**Templatable: yes.** The only item in the pool with a real-world context, but
the context is a wrapper: the numbers are an hourly rate and a flat charge, and
any sensible pair works. Constants roll in multiples of 5 so the totals stay
money-shaped. Needs `a*c != a + c`, which again only excludes `(2,2)`.

---

## Advanced

### QR_A_071 -- `3(2x - 1) - 2(x + 4)`, correct C `4x - 11`

    a=3, b=2, c=1, d=2, f=4    ->    a*(b*x - c) - d*(x + f)

| | value | misconception on file |
|---|---|---|
| A | `4x + 5` | "distributes the -2 to the x but not to the +4, writing -2x + 8 instead of -2x - 8" |
| B | `4x - 9` | "multiplies 3 by 2x but forgets to multiply 3 by the -1, writing 6x - 1" |
| C | `4x - 11` | correct |
| D | `8x + 5` | "treats the second group as +2(x + 4), ignoring the subtraction sign" |

**Templatable: yes**, five parameters. The second group's inner x-coefficient
stays a literal `1` so the stem keeps reading `(x + 4)`. Two constraints matter:
`a != 1` (else B stops differing from C), and `2*d*f != c*(a - 1)`, which is the
one non-obvious collision in the pool -- A and B can land on the same constant
for some combinations even though they come from unrelated misconceptions.
`a*b > d` keeps the x-term from cancelling, which would turn this into a
different item (the one below).

### QR_A_072 -- `4(x + 3) - 2(2x - 1)`, correct D `14`

    d=2, e=2, b=3, f=1, and a = d*e    ->    a*(x + b) - d*(e*x - f)

| | value | misconception on file |
|---|---|---|
| A | `8x + 14` | "multiplies -2 by 2x as +4x instead of -4x, so the x-terms do not cancel" |
| B | `10` | "computes -2 * (-1) as -2 instead of +2" |
| C | `4x + 14` | "distributes the -2 only to the -1 and forgets the 2x term" |
| D | `14` | correct |

**Templatable: yes, but it needs a schema extension.** The entire point of this
item is that the x-terms cancel, which is true only when the outer factor equals
the product of the second factor and its inner coefficient. That is a hard
equality between parameters, not a range -- rejection-sampling it out of three
independent rolls would be both slow and fragile. So `a` is not rolled at all:
it is **derived** as `d*e`. This is why `derived_parameters` exists in the
schema; QR_A_072 is the only item in the pool that requires it.

Also constrained `a*b > d*f`, so B's constant stays positive as it is in the
original -- a negative there would read as a different kind of error than the
one the misconception describes.

### QR_A_073 -- `4(x - 3) + 2(x + 5)`, correct A `6x - 2`

    a=4, b=3, c=2, d=5    ->    a*(x - b) + c*(x + d)

| | value | misconception on file |
|---|---|---|
| A | `6x - 2` | correct |
| B | `6x + 2` | "distributes to the x-terms but brings the inner constants down unmultiplied" |
| C | `6x + 22` | "computes 4 * (-3) as +12 instead of -12" |
| D | `4x` | "reaches 6x - 2 but then combines the unlike terms" |

**Templatable: yes.** `a*b > c*d` is required by the item's own
`skills_targeted` ("combining like terms to a negative constant"). `b != d` and
`b*(a-1) != d*(c-1)` close two collisions between B and the others.

### QR_A_074 -- `2(3x + y) - (x - 2y)`, correct B `5x + 4y`

    a=2, b=3    ->    a*(b*x + y) - (x - a*y)

| | value | misconception on file |
|---|---|---|
| A | `5x` | "treats -(x - 2y) as -x - 2y, missing the sign change on -2y, **so the y-terms wrongly cancel**" |
| B | `5x + 4y` | correct |
| C | `5x + 3y` | "distributes the 2 to 3x but not to the y, writing 6x + y" |
| D | `9xy` | "combines the unlike final terms 5x and 4y into one" |

**Templatable, but the thinnest pool of the 15 -- flagged.** Distractor A's
misconception on file does not stop at the sign error; it states the consequence
that *the y-terms cancel*. That consequence holds only when the outer factor
equals the inner y-coefficient of the second group. Since the misconception text
may not be silently reworded, those two are pinned equal -- the second group is
`(x - a*y)`, not an independently rolled coefficient.

The cost is variety: roughly 30 usable combinations rather than the hundreds the
other Advanced templates get. That is still 30x what a static item offers, so
the template is worth keeping, but it is the one most likely to repeat itself in
front of a student who practices heavily.

#### Resolution -- reviewed and settled, keep the narrowed range

Settled by Juan on 2026-07-29 after the general form was worked out explicitly.
Recorded here so a later session does not re-litigate it.

Writing the second group's y-coefficient as its own parameter `g`, over the
structure `a*(b*x + y) - (x - g*y)`:

    correct           (a*b - 1)*x + (a + g)*y
    A, general form   (a*b - 1)*x + (a - g)*y

**A clean general form of the error does exist.** "Missing the sign change on
the second distributed term" is coherent for any `a, b, g`, and A stays a
distinct wrong answer across the whole range. What does *not* generalize is the
sentence on file, which is two clauses:

- "treats `-(x - 2y)` as `-x - 2y`, missing the sign change on `-2y`" -- general
- "`6x + 2y - x - 2y = 5x`, so the y-terms wrongly cancel" -- true only at `a == g`

A's y-coefficient is exactly `a - g`, so it vanishes only on the diagonal:

    a=2 b=3 g=2   A = 5x        cancels    (the original item)
    a=3 b=3 g=2   A = 8x + y    does not
    a=2 b=4 g=5   A = 7x - 3y   does not

Adopting the general form would therefore require deleting the cancellation
clause -- a reword of a description already on file, which the pilot's own rule
forbids: a templated distractor must reuse the SAME misconception, not a
rephrased one. Narrow-but-correct beats broad-but-invented.

Two further costs, had it gone the other way: the general form introduces a new
collision (A meets C whenever `a = 2*g + 1`, needing another hand-derived
constraint), and it produces negative y-coefficients, a shape the original item
never generated.

**Reopen only if** these bank items turn out to carry a short, stable
`misconception_tag` slug the way `curriculum_practice_items` entries do, with
this prose serving as per-item explanation rather than as the dashboard label.
In that case rewording the prose would not rename a misconception, and the
general form becomes available. Unresolved as of this pilot.

### QR_A_075 -- `7x - 3(2x - 4) + 5`, correct C `x + 17`

    a=7, b=3, c=2, d=4, e=5    ->    a*x - b*(c*x - d) + e

| | value | misconception on file |
|---|---|---|
| A | `x - 7` | "computes -3 * (-4) as -12 instead of +12" |
| B | `13x + 17` | "multiplies -3 by 2x as +6x instead of -6x" |
| C | `x + 17` | correct |
| D | `x + 1` | "distributes -3 to 2x but brings the -4 down unmultiplied" |

**Templatable: yes.** Needs `b != 1` (at `b = 1`, A and D become the same
answer) and `a > b*c` so the x-coefficient stays positive and non-zero.

---

## Summary

15 of 15 parameterize. None had to be dropped, and none was forced:

- **13** template cleanly under ordinary range constraints.
- **QR_A_072** needs the `derived_parameters` schema extension, because its
  cancellation is an equality between parameters rather than a range.
- **QR_A_074** is templated at reduced variety (~30 combinations) to preserve a
  misconception sentence that asserts a cancellation. Flagged above; the fix is
  a content decision about that sentence, not a code change.

Mandatory sign-error coverage is present at template level twice, in QR_B_093
(`(a - b)*x` against `(a + b)*x`) and QR_P_078 (`-c` against `+c`), both as
structural sign differences that appear on every roll.
