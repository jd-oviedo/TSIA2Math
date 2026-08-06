# QR.3.5 curriculum practice items -- templating audit

The 14 graded items in `curriculum/source/tsia2-math/unit-1/QR.3.5.md` as they
exist today, read through `build_practice_items()` rather than from the topic
spec, so what is audited is exactly what the pipeline produces.

This is Phase B's source pool. The 15 CAT-bank templates in `QR.3.5.json` are
parked and are not the runtime source; see the status section of `README.md` for
why.

**What each distractor is identified by has changed.** In the bank, the
`distractor_logic` sentence *is* the misconception's identity, because there is
no slug field anywhere in that schema -- which is what forced QR_A_074's
narrowed range. Curriculum items carry a `misconception_tag` slug per option.
The slug is the identity, the prose is per-item explanation, and a template must
reuse the same **slug**. Rewording an explanation renames nothing.

**Anchor.** A template here anchors on the parsed `practice_items` entry --
`stem`, all four `choices`, `correct_answer`, and the whole `misconception_tag`
map, byte for byte at `canonical_parameters`. Not on the worked solution; see
"The anchor for curriculum-scoped templates" in `README.md`.

Parameter letters are assigned left to right across the expression as written,
**skipping any letter the item already uses as its variable**. That is why
practice 3 starts at `b` and practice 8 at `b`: both use `a` as the variable.
The variable is literal text in `question_template`, never a parameter.

Everything below labelled "verified" was checked by exhaustive enumeration of
the stated range on 2026-08-06, not by inspection.

---

## Practice -- Basic

### practice 1 -- `9m + 4m`, correct B `13m`

    a=9, b=4    ->    a*m + b*m

| | value | misconception slug |
|---|---|---|
| A | `36m` | `multiplies_coefficients` |
| B | `13m` | correct |
| C | `13m^2` | `multiplies_variables` |
| D | `13` | `drops_variable` |

**Templatable: yes.** All three misconceptions are procedures on the two
coefficients and none depends on the values 9 and 4.

One option collision, verified: A meets B exactly when `a*b == a + b`, which over
this range happens only at `(2,2)`. C never meets B (different degree) and D
never meets anything (it is the only choice with no variable).

**This is the one template in the pool that can roll a CAT-bank question.**
At `(a,b) = (3,5)` it renders `3m + 5m`, which is QR_B_090's `3x + 5x` with the
variable renamed. Excluded. `(5,3)` is excluded too: it renders `5m + 3m`, which
the structural check does not flag because the string differs, but it is the
same question to a student who has taken the diagnostic, and exposure control is
about recognition. Flagged as a judgment rather than a computed result.

Range: `a, b` in 2..9. Deliberately not widened. 2..10 would give 78 sets instead
of 61, but pushes A's product to 100, past the mental range a Basic item should
stay inside -- the same cap Phase A put on QR_B_090 and for the same reason.
**61 parameter sets.**

### practice 2 -- `8n - 3n - n`, correct D `4n`

    a=8, b=3    ->    a*n - b*n - n

| | value | misconception slug |
|---|---|---|
| A | `5n` | `ignores_unit_coefficient` |
| B | `6n` | `adds_instead_of_subtracts` |
| C | `4` | `drops_variable` |
| D | `4n` | correct |

**Templatable: yes.** The third term is a bare `n` and stays literal -- it is the
whole point of the item, and `ignores_unit_coefficient` is the misconception of
reading it as worth nothing. A and B sit one coefficient either side of D, so
they can never meet it or each other.

One collision, verified: C is the bare number `a - b - 1` and D is the same
number times the variable, so the two coincide when that number is 0. Ruled out
by the tier constraint anyway.

Constraint `a - b - 1 >= 2`: keeps the answer off `1n` (which renders as a bare
`n` and makes D and the item's own teaching point collide visually) and off 0.

Range: `a` in 6..15, `b` in 2..7. Widened from 6..12 / 2..5 after checking that
the larger range stays collision-free; the arithmetic is a two-step subtraction
either way, so nothing leaves the Basic tier. **50 parameter sets, the thinnest
in the pool.** Still comfortably above the ~30 Phase A accepted for QR_A_074.

### practice 3 -- `6a + 7 + 2a - 3`, correct A `8a + 4`

    b=6, c=7, d=2, e=3    ->    b*a + c + d*a - e

| | value | misconception slug |
|---|---|---|
| A | `8a + 4` | correct |
| B | `8a + 10` | `adds_instead_of_subtracts` |
| C | `12a` | `combines_unlike_terms` |
| D | `8a` | `drops_unlike_term` |

**Templatable: yes, with one constraint doing all the work.** A, C and D all
collapse together at `c == e`: the combined constant `c - e` goes to zero, so A
becomes D, and C's coefficient `b + c + d - e` becomes `b + d`, which is D's.
1344 colliding sets across three pairs, every one of them that single cause.
Constraint `c != e` removes all of them, verified.

Range: `b, d` in 2..9, `c` in 3..12, `e` in 2..9. **4672 parameter sets.**

### practice 4 -- `5p + 4q - 2p`, correct C `3p + 4q`

    a=5, b=4, c=2    ->    a*p + b*q - c*p

| | value | misconception slug |
|---|---|---|
| A | `7p + 4q` | `adds_instead_of_subtracts` |
| B | `3p` | `drops_unlike_term` |
| C | `3p + 4q` | correct |
| D | `7p` | `combines_unlike_terms` |

**Templatable: yes, and it is the cleanest of the fourteen.** Zero collisions
anywhere in the range, verified -- the two-variable answers (A, C) can never meet
the single-variable ones (B, D), and within each pair the coefficients differ by
`2c`, which is never zero.

Range: `a` in 4..9, `b` in 2..9, `c` in 2..7. **288 parameter sets.**

---

## Practice -- Proficient

### practice 5 -- `3(2n + 5) - 4n`, correct B `2n + 15`

    a=3, b=2, c=5, d=4    ->    a*(b*n + c) - d*n

| | value | misconception slug |
|---|---|---|
| A | `10n + 15` | `adds_instead_of_subtracts` |
| B | `2n + 15` | correct |
| C | `6n + 11` | `combines_unlike_terms` |
| D | `2n + 5` | `partial_distribution` |

**Templatable: yes.** Zero collisions over the range, verified. D differs from B
only in the constant (`c` against `a*c`), which is why `a != 1` matters and is
already enforced by the range starting at 2.

Constraint `a*b - d >= 2` keeps the answer's coefficient positive and off a bare
`n`, which is what the tier expects at Proficient.

Range: `a` in 2..5, `b` in 2..4, `c` in 3..9, `d` in 2..9. **490 parameter sets.**

### practice 6 -- `8y - 5 - 3y + 9`, correct A `5y + 4`

    a=8, b=5, c=3, d=9    ->    a*y - b - c*y + d

| | value | misconception slug |
|---|---|---|
| A | `5y + 4` | correct |
| B | `11y + 4` | `adds_instead_of_subtracts` |
| C | `5y + 14` | `drops_negative_sign` |
| D | `9y` | `combines_unlike_terms` |

**Templatable: yes.** One collision, verified: A meets D whenever `b == d`, since
A's constant `d - b` vanishes and D's coefficient `a - b - c + d` reduces to
`a - c`, which is A's. 448 sets, all that one cause. Constraint `b != d`.

Two further constraints are tier rules rather than collision fixes: `a - c >= 2`
keeps the answer off a bare `y`, and `d - b >= 1` keeps the combined constant
positive, matching the authored item. Together they cut the pool by more than
half, which is the cost of keeping every roll inside its own tier.

Range: `a` in 5..12, `b` in 2..9, `c` in 2..9, `d` in 3..12. **2236 parameter
sets.**

### practice 7 -- phone plan, correct C `7g + 22`

    a=12, b=30, c=5, d=8    ->    (a*g + b) - (c*g + d)

| | value | misconception slug |
|---|---|---|
| A | `17g + 38` | `adds_instead_of_subtracts` |
| B | `29g` | `combines_unlike_terms` |
| C | `7g + 22` | correct |
| D | `7g + 38` | `drops_negative_on_group` |

**Templatable: yes.** Zero collisions, verified. This is the pool's clearest
carrier of the mandatory sign-error coverage: D differs from C by the sign on
`d` alone, structurally, so the sign error is on the page at every single roll
rather than only on the instance that happened to have it.

Constraints are realism rather than mathematics: `a - c >= 3` keeps the final
per-gigabyte rate meaningfully positive, and `b - d >= 10` keeps the promotion
smaller than the base fee so the stem still describes something a phone company
would do. `b` rolls in steps of 5 so the base fee never lands on \$37.

Range: `a` in 8..15, `b` in 20..40 step 5, `c` in 2..9, `d` in 4..12.
**2322 parameter sets.**

---

## Practice -- Advanced

### practice 8 -- `5(2a - 3) - 4(a - 2)`, correct D `6a - 7`

    b=5, c=2, d=3, e=4, g=2    ->    b*(c*a - d) - e*(a - g)

| | value | misconception slug |
|---|---|---|
| A | `14a - 7` | `adds_instead_of_subtracts` |
| B | `6a - 23` | `drops_negative_on_group` |
| C | `6a - 5` | `partial_distribution` |
| D | `6a - 7` | correct |

**Templatable: yes, with the pool's only non-obvious constraint.** C and D share
a coefficient and differ only in the constant: C's is `-d - g` (the two inner
terms brought down unmultiplied) and D's is `e*g - b*d`. Setting them equal and
rearranging gives `d*(b - 1) == g*(e + 1)`, which is a genuine two-sided
relation, not a single bad value -- 117 sets hit it across the range, e.g.
`b=3, c=2, d=5, e=4, g=2`. Constraint `d*(b - 1) != g*(e + 1)`, verified to
remove all of them.

`b*c - e >= 2` is the tier rule, keeping the answer's coefficient positive and
off a bare `a`.

Range: `b` in 3..7, `c` in 2..4, `d` in 2..7, `e` in 2..6, `g` in 2..5.
**1637 parameter sets.**

### practice 9 -- `9k - (3k - 8) + 2`, correct B `6k + 10`

    a=9, b=3, c=8, d=2    ->    a*k - (b*k - c) + d

| | value | misconception slug |
|---|---|---|
| A | `12k + 10` | `adds_instead_of_subtracts` |
| B | `6k + 10` | correct |
| C | `6k - 6` | `drops_negative_on_group` |
| D | `6k + 8` | `stops_before_simplifying` |

**Templatable: yes.** One collision, verified: C's constant is `d - c` and D's is
`c`, so they meet when `d == 2*c`. 96 sets. Constraint `d != 2*c`.

Worth noting what does *not* need a constraint: D is "combines the k terms and
picks up the `c` but never adds the trailing `d`", so it differs from B by
exactly `d`, and `d` is never 0 in range. `a - b >= 3` is the tier rule.

Range: `a` in 6..13, `b` in 2..7, `c` in 3..11, `d` in 2..9. **2660 parameter
sets.**

### practice 10 -- `-2(3x - 4) + 5x - 7`, correct C `-x + 1`

    a=2, b=3, c=4, d=5, e=7    ->    -a*(b*x - c) + d*x - e

| | value | misconception slug |
|---|---|---|
| A | `11x + 1` | `drops_negative_sign` |
| B | `-x - 15` | `drops_negative_on_group` |
| C | `-x + 1` | correct |
| D | `-x - 11` | `partial_distribution` |

**Templatable: yes.** Zero collisions over the range, verified.

The leading negative factor is the item's whole difficulty and it is structural,
so it survives every roll: A is the error of ignoring it when combining
(`a*b + d` instead of `d - a*b`), B is the error of getting `-a * -c` wrong, D is
distributing to the first term only. All three stay distinct because they differ
in different places -- A in the coefficient, B and D in the constant by
`a*c + c`, which is never zero.

Constraint `d != a*b` keeps the x-terms from cancelling entirely. A roll where
they cancel is a legitimate problem but a *different* one, closer to QR_A_072's
territory, and the authored item's answer has an x term.

Range: `a` in 2..4, `b` in 2..5, `c` in 2..7, `d` in 3..9, `e` in 3..11.
**4212 parameter sets.**

---

## Mini quiz

### mini_quiz 1 -- `6c + 9 - c`, correct A `5c + 9`

    a=6, b=9    ->    a*c + b - c

| | value | misconception slug |
|---|---|---|
| A | `5c + 9` | correct |
| B | `7c + 9` | `adds_instead_of_subtracts` |
| C | `6c + 8` | `combines_unlike_terms` |
| D | `5c` | `drops_unlike_term` |

**Templatable: yes.** Zero collisions, verified. The bare trailing `c` stays
literal, as in practice 2.

Range: `a` in 3..11, `b` in 3..20. `b` widened from 3..12 after confirming the
wider range stays collision-free: `b` is a standing constant that never enters
the arithmetic, so widening it adds variety at no tier cost. **162 parameter
sets.**

### mini_quiz 2 -- `3d + 8e - 5d + 2e`, correct B `-2d + 10e`

    a=3, b=8, c=5, g=2    ->    a*d + b*e - c*d + g*e

| | value | misconception slug |
|---|---|---|
| A | `8d + 10e` | `adds_instead_of_subtracts` |
| B | `-2d + 10e` | correct |
| C | `2d + 10e` | `drops_negative_sign` |
| D | `8de` | `combines_unlike_terms` |

**Templatable: yes, and the constraint is the item's teaching point rather than a
collision fix.** B's `d` coefficient is `a - c` and C's is `c - a`; they meet
when `a == c`, at 270 sets. But `a < c` is required anyway: the whole point of
the item is that a negative coefficient is a legitimate answer, and at `a > c`
the correct answer turns positive and C stops being a wrong answer at all.
Constraint `a < c`, which is strictly stronger than `a != c` and removes the
collision as a side effect. Verified.

Range: `a` in 2..7, `b` in 3..11, `c` in 3..9, `g` in 2..7. **1458 parameter
sets.**

### mini_quiz 3 -- `4(3w - 2) - 5w`, correct C `7w - 8`

    a=4, b=3, c=2, d=5    ->    a*(b*w - c) - d*w

| | value | misconception slug |
|---|---|---|
| A | `17w - 8` | `adds_instead_of_subtracts` |
| B | `7w - 2` | `partial_distribution` |
| C | `7w - 8` | correct |
| D | `12w - 13` | `combines_unlike_terms` |

**Templatable: yes.** Zero collisions, verified. B differs from C by `a*c - c`,
which is non-zero for every `a >= 2` in range, so the partial-distribution
distractor never collapses onto the answer.

Constraint `a*b - d >= 2` is the tier rule. Range: `a` in 2..6, `b` in 2..5,
`c` in 2..8, `d` in 2..9. **931 parameter sets.**

### mini_quiz 4 -- `10t - 2(4t - 6) - 9`, correct D `2t + 3`

    a=10, b=2, c=4, d=6, e=9    ->    a*t - b*(c*t - d) - e

| | value | misconception slug |
|---|---|---|
| A | `2t - 21` | `drops_negative_on_group` |
| B | `18t + 3` | `adds_instead_of_subtracts` |
| C | `2t + 12` | `stops_before_simplifying` |
| D | `2t + 3` | correct |

**Templatable: yes.** Zero collisions over the range, verified.

Two constraints, both structural rather than corrective: `a != b*c` keeps the
t-terms from cancelling (same reasoning as practice 10), and `b*d != e` keeps C
distinct from D, since C is D without the trailing `- e`.

Range: `a` in 6..14, `b` in 2..4, `c` in 2..4, `d` in 3..9, `e` in 3..12.
**5007 parameter sets, the largest in the pool.**

---

## Cross-pool exposure

New in Phase B, and it has no Phase A equivalent: those templates *were* the bank
items, so there was nothing to collide with. Here a rolled curriculum question
could land on a CAT diagnostic question, which is exactly the separation PR #45
was careful to establish item by item.

Checked by rendering every roll of all 14 templates and comparing the **stem**
against all 15 bank stems with the variable normalized. The comparison is
structural on purpose. An earlier pass compared expanded expressions and flagged
12 of 14, which was measuring the wrong thing -- `6k - (3k - 3) + 7` and
`5x + 3 - 2x + 7` expand to the same polynomial but are not the same question,
since one asks the student to distribute a minus across a group and the other
does not. What breaches exposure control is a student recognizing the question.

**Result: one collision in the whole pool**, practice 1 at `(3,5)`, excluded
above along with its commutative twin `(5,3)`.

Five templates render a bank item's shape once every `+` and `-` is erased, which
is not a breach but is worth recording, because in each case the sign *is* the
difference the item is testing:

| template | same skeleton as | differs by |
|---|---|---|
| practice 1 | QR_B_090 | nothing but the numbers; the `(3,5)` exclusion covers it |
| practice 3 | QR_P_077 | the sign on the final constant |
| practice 4 | QR_B_092 | the sign on the third term |
| practice 6 | QR_P_077, QR_P_080 | the sign pattern across all four terms |
| mini_quiz 4 | QR_A_075 | the sign on the trailing constant |

**Recommendation: make this a standing pool rule in the harness**, not a
one-time check. Ranges drift when a template is edited, and the cost of a breach
is a diagnostic item appearing in practice. `verify_templates.py` should fail any
curriculum template whose rendered stem can equal a bank stem for the same topic
under variable renaming.

---

## Summary

**14 of 14 parameterize.** None had to be dropped and none was forced.

- **7** template with no option collisions anywhere in their range: practice 4,
  5, 7, 10, mini_quiz 1, 3, 4.
- **6** need one constraint each, every one traced to a single verified cause
  rather than assumed: practice 1 (`a*b != a+b`), practice 3 (`c != e`),
  practice 6 (`b != d`), practice 9 (`d != 2*c`), mini_quiz 2 (`a < c`), and
  practice 2's degenerate zero, which its tier rule already excludes.
- **1** needs the only two-sided relation in the pool: practice 8's
  `d*(b-1) != g*(e+1)`.

All constraints were confirmed by re-running the full enumeration with them
applied: **zero option collisions remain across all 14 templates.**

Pool sizes run from 50 (practice 2) to 5007 (mini_quiz 4), **26,186 parameter
sets in total**. The two thinnest, practice 1 at 61 and practice 2 at 50, are
both Basic items capped by tier arithmetic rather than by collisions; both sit
above the ~30 Phase A accepted for QR_A_074.

**Mandatory sign-error coverage is carried five times**, in practice 7, 8, 9, 10
and mini_quiz 4, in every case as a structural sign difference that appears on
every roll rather than at particular values. Phase A carried it twice. It is also
now *derivable* rather than hand-declared: `sign_error_coverage` is a boolean
somebody has to remember to set on a bank template, where here it is just
`any(tag == "drops_negative_on_group")` and cannot be set wrong.

Nothing in this document writes a template. It fixes the ranges, the constraints
and the anchor so that authoring is transcription rather than judgment.

### Reproducing the checks

The three checks behind the numbers above -- canonical reproduction, exhaustive
option-collision search, and structural cross-pool comparison -- were run as
throwaway analysis and are deliberately not committed as a one-off script. All
three are Phase 2 work on `scripts/verify_templates.py`, where they belong as
standing rules rather than as a snapshot somebody has to remember to re-run:

- canonical reproduction replaces the bank-item byte-for-byte anchor
- option-collision search is the existing `distinct` check, already per-roll
- cross-pool comparison is new, and is the pool-level rule recommended above

Until that lands, the numbers here are dated evidence, not a live guarantee.
