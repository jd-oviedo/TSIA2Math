# Misconception Taxonomy — PHASE 1 DRAFT (not approved, nothing tagged)

Status: **draft for review**. No item file has been modified. This document is the
Phase 1 deliverable only: the cross-cutting families, the shape of the long tail, and
the flagged edge cases. Long-tail slugs are *not* finalised here — see Phase 2.

Scope: the CAT item bank, `data/items/**` — 1,116 items, 97 topics, 3,348 distractor
strings (the correct-answer slot of `distractor_logic` is excluded throughout).

---

## 0. Source of truth for the existing 40 slugs

`sql/curriculum_misconception_tags.sql` documents the **column**
(`curriculum_topics.misconception_tags`), not the vocabulary. It contains no slug
definitions.

The actual source of truth is the topic markdown under
`curriculum/source/tsia2-math/unit-1/`, where each wrong option carries both a
structured tag and a prose gloss:

```json
"distractor_logic": {
  "A": "Student makes misconception: skips_times_100 (converts 3/5 to 0.6, then
        attaches a percent sign without multiplying by 100, producing 0.6%)"
},
"misconception_tag": { "A": "skips_times_100" }
```

`curriculum/migrations/upload_curriculum.py` parses both blocks
(`extract_misconceptions`, `extract_misconception_tags`) and writes them to Supabase.

**Counted from the structured `misconception_tag` blocks: 252 tagged instances, 40
distinct slugs, across 5 topics** (QR.1.2 = 16 slugs, QR.1.3 = 9, QR.1.4 = 8,
QR.2.1 = 6, QR.3.5 = 11; QR.1.1 is untagged). Reuse rate 6.3 instances per slug.

There is no glossary file. Definitions below are reconstructed from the parenthetical
glosses. **A canonical definitions file does not exist yet and will need to be created
as part of Phase 2** — that is a gap, not an oversight on my part.

### The 40 existing slugs, with reconstructed definitions

| slug | definition (from gloss) |
|---|---|
| `adds_instead_of_scales` | Sees an additive gain in one quantity and adds that same amount to the paired quantity instead of applying the multiplicative scale factor. |
| `adds_instead_of_subtracts` | Combines terms with addition where the expression calls for subtraction. |
| `answers_intermediate_value` | Computes a correct intermediate quantity and reports it as the final answer instead of continuing. |
| `closer_endpoint_error` | Judges which perfect square a radicand is nearer to, and picks the wrong one. |
| `combines_unlike_terms` | Treats terms with different variables or degrees as like terms and merges their coefficients. |
| `drops_negative_on_group` | Applies a leading minus to only the first term of a parenthesised group. |
| `drops_negative_sign` | Ignores a minus sign and reports the magnitude. |
| `drops_unlike_term` | Combines the like terms correctly, then discards the leftover unpaired term. |
| `drops_variable` | Combines coefficients correctly but writes a bare number, losing the variable. |
| `fraction_digit_gluing` | Reads the digits of a fraction straight off as a decimal or percent (3/5 → 0.35 or 35%). |
| `halves_the_radicand` | Treats a square root as division by two. |
| `ignores_unit_coefficient` | Treats a bare variable as if its implied coefficient of 1 were worth nothing. |
| `longer_decimal_is_larger` | Judges a decimal larger because it carries more decimal places. |
| `multiplies_by_ten` | Shifts the decimal one place instead of two when converting to a percent. |
| `multiplies_coefficients` | Multiplies coefficients of like terms instead of adding them. |
| `multiplies_variables` | Adds coefficients correctly but also multiplies the variables (m + m → m²). |
| `numerator_as_percent` | Reports the numerator as the percent, ignoring the denominator. |
| `numerator_denominator_swap` | Builds a fraction with numerator and denominator exchanged. |
| `order_direction_reversed` | Sorts correctly but delivers the opposite of the requested direction. |
| `part_whole_confusion` | Treats a part-to-part ratio as a part-to-whole fraction. |
| `partial_distribution` | Multiplies the outside factor into only the first term inside the parentheses. |
| `percent_as_count` | Reads n% as "one part out of n". |
| `percent_decimal_overshift` | Moves the decimal three places instead of two (62% → 0.062). |
| `percent_denominator_error` | Writes a percent over 10 instead of over 100. |
| `percent_sign_confusion` | Treats n% as the whole number n. |
| `place_value_slip` | Drops or misplaces a digit's place value in a decimal. |
| `radicand_mistaken_for_value` | Reads the number under the radical as the answer itself. |
| `ratio_term_as_value` | Reads a term of the ratio as the actual quantity, ignoring scaling. |
| `refuses_to_compare_forms` | Believes a fraction, decimal, or percent cannot be compared without a common form. |
| `reports_discount_not_price` | Computes the discount correctly but reports it instead of the final price. |
| `reversed_division` | Computes b ÷ a instead of a ÷ b. |
| `rounding_hides_difference` | Rounds two values and concludes they are equal. |
| `rounds_too_early` | Rounds before converting or completing the computation, losing the exact value. |
| `skips_times_100` | Converts to a decimal, then attaches a percent sign without multiplying by 100. |
| `squares_instead_of_roots` | Runs the operation backward, squaring where a root was required. |
| `stops_before_simplifying` | Reaches a correct but unreduced form and stops. |
| `terminating_test_confusion` | Applies a false rule for deciding whether a fraction terminates or repeats. |
| `truncates_repeating_decimal` | Chops a repeating decimal to a finite number of places. |
| `uses_wrong_total` | Divides by a part rather than by the whole. |
| `wrong_perfect_square_bracket` | Brackets a radicand between the wrong pair of perfect squares. |

---

## 1. Method, and what the numbers mean

I read all 3,348 distractor strings (grouped by topic, with numbers and LaTeX
normalised out). I then wrote a regex classifier over the 68 candidate families below
to produce grounded counts.

**Read the counts as a floor, not as coverage.** The classifier matched 1,071 of 3,348
strings (32%). That is a *recall* limit of hand-written patterns against prose that
never shared a vocabulary — it is not the claim that 68% of the bank is topic-specific.
From reading, my judgement is that the cross-cutting layer genuinely accounts for
roughly 45–55% of distractors once tagging is done by reading rather than by regex.

The **topic count and strand spread** per family are the more trustworthy signal:
those tell you whether a concept actually recurs, which is the whole question.

---

## 2. Cross-cutting families

### 2a. Existing slugs that carry real CAT volume — reuse, do not re-create

These 18 of the 40 already describe errors that recur across the CAT bank. Counts are
regex floors; topic/strand columns are reliable.

| slug | hits⌊⌋ | topics | strands | note on extension |
|---|---:|---:|---|---|
| `answers_intermediate_value` | 103 | 44 | all 4 | **The single largest family in the bank.** Absorbs "stops there", "reports the unit rate as the answer", "forgets to add the starting value back". |
| `adds_instead_of_scales` | 71 | 29 | all 4 | Extends cleanly from QR.2.1 ratios to AR exponent/coefficient work and GR scale factors. |
| `adds_instead_of_subtracts` | 56 | 28 | all 4 | |
| `drops_negative_sign` | 52 | 24 | AR PR QR | |
| `partial_distribution` | 39 | 14 | AR GR QR | |
| `reversed_division` | 33 | 11 | all 4 | See merge note under `slope_run_over_rise`. |
| `order_direction_reversed` | 29 | 10 | all 4 | |
| `combines_unlike_terms` | 15 | 4 | AR QR | |
| `drops_unlike_term` | 13 | 9 | AR GR QR | |
| `drops_negative_on_group` | 14 | 6 | AR QR | |
| `numerator_denominator_swap` | 14 | 8 | AR QR | |
| `uses_wrong_total` | 16 | 6 | PR QR | Extends into PR two-way tables and probability denominators. |
| `part_whole_confusion` | 11 | 4 | PR QR | Extends into PR.3.1 "compares red to non-red as a ratio". |
| `place_value_slip` | 12 | 5 | GR PR QR | |
| `truncates_repeating_decimal` | 12 | 2 | QR | |
| `stops_before_simplifying` | 10 | 4 | AR QR | Extends into AR.3.1/3.2 "not completely factored" and AR.4.8 unsimplified radicals. |
| `halves_the_radicand` | 9 | 3 | AR QR | |
| `rounding_hides_difference` | 6 | 4 | QR | |

### 2b. Existing slugs that stay in the vocabulary but barely touch the CAT bank

These 22 are real and correctly defined, but they describe QR Unit-1 territory
(fraction ↔ decimal ↔ percent conversion, square-root estimation) that the CAT bank
covers in only a few topics. **Keep them — do not merge or retire.** They will tag a
small number of CAT items and continue to tag curriculum items.

`fraction_digit_gluing`, `percent_sign_confusion`, `percent_decimal_overshift`,
`percent_denominator_error`, `percent_as_count`, `numerator_as_percent`,
`skips_times_100`, `multiplies_by_ten`, `rounds_too_early`, `longer_decimal_is_larger`,
`refuses_to_compare_forms`, `terminating_test_confusion`, `radicand_mistaken_for_value`,
`wrong_perfect_square_bracket`, `closer_endpoint_error`, `squares_instead_of_roots`,
`ratio_term_as_value`, `reports_discount_not_price`, `drops_variable`,
`multiplies_coefficients`, `multiplies_variables`, `ignores_unit_coefficient`

Two worth flagging: `reports_discount_not_price` extends to QR.4.1 ("computes the
discount amount and reports it as the sale price"), and `ignores_unit_coefficient`
extends to AR.4.3/AR.4.4 ("overlooks the implied coefficient of 1").

### 2c. Proposed NEW cross-cutting slugs — 42

Grouped by theme. Each is a concept I found in **3 or more topics** (exceptions
flagged). Counts are regex floors.

#### Sign and negative handling (4 new)

| slug | definition | hits⌊⌋ | topics | strands |
|---|---|---:|---:|---|
| `sign_error_on_constant` | Flips the sign of a constant while moving it across the equals sign or collecting like terms. | 26 | 16 | all 4 |
| `wrong_sign_on_factor` | Uses the correct magnitudes in a factored form but assigns the wrong sign to one or both factors. | 25 | 6 | AR |
| `inequality_direction_not_flipped` | Fails to reverse the inequality when multiplying or dividing by a negative — or flips it without cause. | 10 | 4 | AR QR |
| `double_negative_mishandled` | Treats subtracting a negative as subtraction, or −(−a) as −a. | 4 | 2 | QR |

*Merge check:* `sign_error_on_constant` is distinct from the existing
`drops_negative_sign` — dropping a sign yields the magnitude, flipping one yields a
wrong-signed value, and the remediation differs. Keeping both. `wrong_sign_on_factor`
is confined to AR factoring but appears in 6 topics there, so it earns a slug.

#### Inversion, swap, reversal (6 new)

| slug | definition | hits⌊⌋ | topics | strands |
|---|---|---:|---:|---|
| `subtracts_in_wrong_order` | Computes b − a where a − b was required. | 30 | 19 | all 4 |
| `slope_intercept_swap` | Assigns the slope's value to the intercept and the intercept's to the slope, including in verbal interpretation. | 27 | 5 | AR PR QR |
| `slope_run_over_rise` | Computes Δx/Δy instead of Δy/Δx. | 23 | 7 | all 4 |
| `inverts_conversion_direction` | Multiplies where the conversion or scale factor requires division, or vice versa. | 21 | 10 | AR GR QR |
| `coordinates_swapped` | Writes an ordered pair as (y, x). | 13 | 5 | AR GR |
| `inverts_trig_ratio` | Inverts a trigonometric ratio (adjacent/opposite for tangent, etc.). | 12 | 2 | GR |

*Merge check:* `slope_run_over_rise`, `inverts_trig_ratio` and
`inverts_conversion_direction` are all "inverted a ratio" and could collapse into
`reversed_division`. **I recommend against it.** A student who inverts rise/run needs
different remediation from one who divides 5 by 3 instead of 3 by 5, and the whole
point of the taxonomy is to tell a teacher which. Reserving `reversed_division` for
the bare arithmetic case. `inverts_trig_ratio` sits in only 2 topics (GR.3.3, GR.3.4)
but with 12 instances — flagging it as a judgement call.

#### Wrong operation substituted (8 new)

| slug | definition | hits⌊⌋ | topics | strands |
|---|---|---:|---:|---|
| `exponent_rule_confusion` | Applies the wrong exponent rule — adds where the power rule multiplies, multiplies where the product rule adds, subtracts where it adds. | 31 | 5 | AR |
| `multiplies_instead_of_divides` | Multiplies two quantities where the relationship requires division. | 23 | 13 | AR GR QR |
| `circumference_area_confusion` | Uses a circle's area formula where circumference was required, or vice versa. | 14 | 7 | GR |
| `divides_instead_of_multiplies` | Divides where the relationship requires multiplication. | 14 | 10 | AR GR QR |
| `adds_probabilities_instead_of_multiplying` | Adds the stage probabilities of a compound event instead of multiplying them. | 16 | 6 | PR (AR hits are false positives) |
| `false_radical_distribution` | Applies √a ± √b = √(a ± b), or adds radicands when multiplying radicals. | 12 | 3 | AR QR |
| `perimeter_area_confusion` | Computes perimeter where area was required, or vice versa. | 12 | 5 | GR |
| `volume_surface_area_confusion` | Computes volume where surface area was required, or vice versa. | 6 | 2 | GR |

*Merge check:* the three geometry formula-swap slugs could be one
`wrong_formula_for_measure`. I have kept them separate because the pairs a student
confuses are diagnostically different, and each already has 5–7 topics of support.
Open to collapsing on your call. `exponent_rule_confusion` is currently one slug
covering three distinct errors and **should probably split into three in Phase 2**
(`adds_exponents_instead_of_multiplying`, `multiplies_exponents_instead_of_adding`,
`subtracts_exponents_instead_of_adding`) — flagging rather than deciding.

#### Omission (4 new)

| slug | definition | hits⌊⌋ | topics | strands |
|---|---|---:|---:|---|
| `omits_constant_term` | Computes the variable/rate portion correctly and forgets the fixed amount (flat fee, intercept, starting value). | 34 | 13 | all 4 |
| `omits_fractional_factor` | Drops the ½, ⅓ or 4/3 from an area or volume formula — or applies it twice. | 30 | 8 | GR |
| `omits_second_component` | Ignores one part of a composite figure, two-part total, or two-stage quantity. | 19 | 11 | all 4 |
| `forgets_square_root` | Computes the squared quantity correctly (sum of squares, r², s³) and reports it without rooting. | 14 | 6 | AR GR |

*Merge check:* `omits_constant_term` overlaps `answers_intermediate_value` where the
student "stops after the rate portion". I read the distinction as: if the student
stopped mid-procedure, it is `answers_intermediate_value`; if the student completed the
procedure but never had the constant in it, it is `omits_constant_term`. This boundary
will need a written rule in Phase 2 — it is the most likely source of tagging drift.

#### Percent and proportional reasoning (4 new)

| slug | definition | hits⌊⌋ | topics | strands |
|---|---|---:|---:|---|
| `percent_change_wrong_base` | Divides the change by the new value instead of the original, or applies a percent to the post-change base. | 14 | 3 | PR QR |
| `percent_changes_added` | Treats successive percent changes as additive rather than multiplicative. | 10 | 5 | PR QR |
| `absolute_change_as_percent` | Reports the raw difference as if it were the percent change. | 10 | 2 | PR QR |
| `new_over_original_as_change` | Reports new ÷ original as the percent change (121% rather than 21%). | 9 | 2 | PR QR |

*Note:* PR.4.3 alone contributes 8 identical instances of
`percent_change_wrong_base` and 8 of `absolute_change_as_percent` — these are the
highest-confidence merges in the whole bank.

#### Reading data and figures (3 new)

| slug | definition | hits⌊⌋ | topics | strands |
|---|---|---:|---:|---|
| `reads_adjacent_value` | Reads the neighbouring tick, bar, row or column instead of the one asked for. | 24 | 4 | GR PR QR |
| `reads_wrong_category` | Reads the right kind of value from the wrong labelled group. | 23 | 3 | PR |
| `off_by_one_count` | Miscounts a tally by one — loses count, double-counts, or stops one early. | 19 | 9 | AR GR PR |

#### Statistics (3 new)

| slug | definition | hits⌊⌋ | topics | strands |
|---|---|---:|---:|---|
| `reports_wrong_center_measure` | Reports the median when the mean was asked (or mode for median, range for mode). | 20 | 4 | PR |
| `center_spread_confusion` | Uses a measure of centre to judge spread, or spread to judge centre. | 20 | 6 | AR PR QR |
| `range_from_single_extreme` | Reports the maximum as the range instead of max − min. | 4 | 2 | PR |

#### Probability (3 new)

| slug | definition | hits⌊⌋ | topics | strands |
|---|---|---:|---:|---|
| `reports_event_not_complement` | Reports P(event) where P(not event) was asked, or forgets the final 1 − p. | 18 | 2 | PR |
| `conditions_on_wrong_group` | Uses the wrong denominator group for a conditional probability. | 18 | 2 | GR PR |
| `ignores_without_replacement` | Fails to reduce the favourable count or the total between draws (or reduces when replacement occurred). | 17 | 4 | PR |

#### Statistical reasoning and inference (4 new)

| slug | definition | hits⌊⌋ | topics | strands |
|---|---|---:|---:|---|
| `overgeneralizes_from_sample` | Treats a sample result as an absolute or population-wide claim. | 14 | 4 | AR GR PR |
| `misreads_direction_of_change` | Computes a magnitude correctly but labels the direction backward (an increase for a decrease). | 14 | 4 | PR |
| `causation_from_association` | Reads an observed association as an established causal claim (in either direction). | 13 | 1 | PR |
| `extrapolates_beyond_data` | Applies a model outside the range the data support. | 8 | 1 | PR |

*Note:* the last two sit in a single topic each (PR.4.4) but with 13 and 8 instances
and are the defining errors of statistical inference — they will recur the moment more
inference items are authored. Flagging as a judgement call: **these two are the weakest
"cross-cutting" claims in the list.**

#### Expression structure and order (3 new)

| slug | definition | hits⌊⌋ | topics | strands |
|---|---|---:|---:|---|
| `order_of_operations_violated` | Evaluates left-to-right or applies a lower-priority operation first. | 13 | 6 | all 4 |
| `squaring_confused_with_doubling` | Computes 2n where n² was required, or vice versa. | 12 | 5 | AR GR QR |
| `drops_grouping_symbols` | Ignores parentheses as a grouping symbol entirely. | 7 | 2 | QR |

---

## 3. The long tail — shape only, no final slugs

Per your instruction I have **not** drafted individual slugs. Below is the count of
distinct topic-specific misconceptions I can identify per topic, each with a one-line
description. These are concepts *not* already covered by section 2.

Counts are my reading judgement. Expect Phase 2 to merge across topics (marked ⇄ where
I already suspect a merge).

### QR — 27 topics, ~111 topic-specific concepts

- **QR.1.1** — 5: irrational assumed automatically larger than a nearby rational; negative sign flips radical ordering; radical coefficient size read as value size; radical dropped and replaced by its coefficient; near-tie between π-expressions broken by visual complexity.
- **QR.1.2** — 2: values assumed already in order and listed as written; benchmark comparison ("more than half") judged from digits.
- **QR.1.3** — 3: repeating-block denominator wrong (999 for a two-digit period); repeating block misidentified; long division stopped after one step before the pattern emerges.
- **QR.1.4** — 4: midpoint used as a default estimate without testing; estimate accepted without squaring to verify; rounds to a bounding integer without refining; accuracy judged by decimal-place format rather than by squaring.
- **QR.1.5** — 5: conjugate applied to the denominator but not the numerator; multiplies by the original denominator rather than its conjugate; cancels a radical as if it were a factor; coefficient lost during multi-step simplification; rational and irrational merged under one radical.
- **QR.1.6** — 6: rounds to the wrong place entirely; uses the wrong reference digit to decide; rounds down despite a reference digit ≥ 5; "increments the rightmost digit" as the rounding rule; carry not propagated through the round; two-step rounding assumed to equal direct rounding.
- **QR.1.7** — 2: division step ignored outright; addition applied before multiplication inside a group.
- **QR.1.8** — 6: absolute value assumed to leave sign unchanged; absolute value confused with squaring; |a| read as the additive inverse; |a−b| computed as a product; only the positive case solved; absolute-value inequality direction reversed.
- **QR.2.1** — 3: two ratio terms multiplied together; scaled by the wrong ratio term; total parts reported in the answer's units.
- **QR.2.2** — 4: proportional division step skipped in a shadow/height setup; relative closing speed ignored in catch-up problems; alligation ratio misread as a fraction of the wrong base; head start divided by the wrong machine's rate.
- **QR.2.3** — 3: markup then discount assumed to return to the original; tip computed on the wrong base (pre- vs post-tax); improvement goal read as "any positive change".
- **QR.2.4** — 4: percent applied forward instead of reversed; another discount applied instead of undoing one; mixture problem reports total volume rather than volume added; break-even markup assumed equal to the coupon rate.
- **QR.2.5** — 4: two segment speeds averaged arithmetically; individual times added instead of combining rates; one segment's speed used for the whole trip; closing rate reported as a distance.
- **QR.2.6** — 5: only the whole-number part converted; conversion stopped one step early; fencepost error (final post omitted); fill and drain rates added instead of netted; one component of a two-rate system used alone.
- **QR.2.7** — 4: temperature offset omitted from the conversion; area conversion factor not squared; conversion factor rounded before use; converted value reported in the wrong unit's role. ⇄ some overlap with QR.2.6.
- **QR.2.8** — 4: constant difference accepted as evidence of direct variation; first y-value taken as the constant of variation; inverse relationship treated as direct; k applied as a multiplier where division was needed.
- **QR.3.1** — 5: keyword mistranslation ("more than" as subtraction, "product" as sum, "twice" as "two more"); subtraction order reversed for "less than"; the wrong quantity grouped; flat fee merged into the per-unit rate; fee multiplied by the rate.
- **QR.3.2** — 5: constant term read as the rate; whole variable term read as the rate; coefficient + constant summed as the rate; rate not normalised to a common unit (per dozen vs per one); rate assumed to depend on quantity.
- **QR.3.3** — 5: two prices swapped between quantities; two prices merged into a single rate; quantities counted with the rates dropped; "twice as many" relationship reversed; per-unit price treated as a one-time flat charge.
- **QR.3.4** — 3: rate confused with the variable it multiplies; intercept tied to a specific non-zero input; rate called the total.
- **QR.3.5** — 2: (curriculum topic, well covered) subtraction applied to only the first term of the second group; factor of 1 treated as absent.
- **QR.3.6** — 5: rise reported as the rate; run reported as the rate; wrong interval selected from the table; gaps between listed rows counted instead of the actual change; constant rate assumed without checking each interval.
- **QR.3.7** — 6: intercepts compared instead of slopes; both being linear assumed to mean equal rates; comparison declared impossible without a graph; rates summed instead of differenced; crossover point assumed to be a permanent tie; larger starting value assumed to stay ahead.
- **QR.3.8** — 3: GCF extracted but not the greatest; GCF written outside while terms are copied undivided; only one term divided by the GCF.
- **QR.4.1** — 4: rate applied only to the increment rather than the new total; scale factor added instead of multiplied; tier rates reversed; model difference not converted through the scale.
- **QR.4.2** — 4: fee folded into the per-unit rate and charged every time; divides before subtracting the fixed fee; adds the fee instead of subtracting before dividing; wrong count of periods used.
- **QR.4.3** — 5: sign wrong for a draining/decreasing rate; a later total used as the starting value; total change used as the rate without dividing by the interval; starting amounts summed instead of differenced; two tanks' rates or volumes swapped.

### AR — 32 topics, ~145 topic-specific concepts

- **AR.1.1** — 5: function notation read as multiplication; f(x) read as a fraction; input and output roles reversed; symmetric partner of a quadratic input misidentified; f(k)=f(2) treated as requiring opposite signs.
- **AR.1.2** — 5: checks outputs rather than inputs for repetition; injectivity applied as the function test; the converse of the function rule applied; vertical line test misapplied via an invented rule; "majority rule" — one violation dismissed.
- **AR.1.3** — 6: domain and range swapped; range reported as endpoints only; a set listed as a multiset with a repeat; horizontal shift applied to the range instead of the domain; open/closed boundary mishandled at a piecewise seam; jump discontinuity ignored.
- **AR.1.4** — 5: growth pattern matched to the wrong family without computing differences; exponent position (base vs exponent) confused; first differences vs ratios confused; visual curvature pattern-matched to exponential; zero second differences read as quadratic.
- **AR.1.5** — 6: denominator-cannot-be-zero rule not applied; constant term read directly as the excluded value; zero numerator treated as undefined; cancellation assumed to restore an excluded value; strict vs non-strict endpoint on a radical domain; contextual condition confused with a domain restriction.
- **AR.2.1** — 4: subtracts the coefficient instead of dividing by it; divides before subtracting the constant; contradiction read as a solution; identity confused with contradiction.
- **AR.2.2** — 3: boundary strictness silently changed; forgets to divide after isolating; subtracts on only one side.
- **AR.2.3** — 4: input value added instead of the rate of change; flat fee added twice; miles added to the fee before multiplying; intercept confused with the rate in a context sentence.
- **AR.2.4** — 5: only the first equation checked; constants from both equations added to find x; hybrid expression built from both equations; identical lines read as parallel; one valid point on a shared line reported as the unique solution.
- **AR.2.5** — 5: solid/dashed boundary mismatched to the inequality symbol; wrong side shaded; only one constraint tested in a system; comparison direction misread when substituting; unwarranted domain restriction added.
- **AR.2.6** — 5: Δy used directly as the slope; Δx used directly as the slope; the given y-coordinate used as the intercept without solving; horizontal and vertical line equations confused; slope value reported as the line equation.
- **AR.2.7** — 5: reciprocal taken without negating; negated without taking the reciprocal; raw x-coefficients compared without converting to slope-intercept form; parallel vs identical lines not distinguished; perpendicularity test applied to a pre-division coefficient.
- **AR.2.8** — 4: wrong inverse operation chosen when isolating; division distributed over a sum; common factor not recognised before isolating; the factored coefficient divided by only part of itself.
- **AR.3.1** — 4: factor pair chosen for the product without checking the sum; GCF not extracted before factoring; trinomial factored but the GCF not written back; constant subtracted instead of divided when finding a partner factor.
- **AR.3.2** — 4: perfect square and difference of squares confused; leading coefficient ignored and factored as monic; constants assigned to the wrong binomials; a middle term introduced where none exists.
- **AR.3.3** — 4: numbers inside the factors reported as roots without flipping signs; leading coefficient ignored when reading a root; equation not rearranged to standard form; perfect-square trinomial confused with an unfactorable sum.
- **AR.3.4** — 6: uses +b instead of −b in the numerator; forgets to divide the whole numerator by 2a; divides only the radical term; discriminant miscomputed (sign of 4ac); negative discriminant read as one repeated root; axis of symmetry reported as a root.
- **AR.3.5** — 5: vertex-form h read literally with the displayed sign; axis of symmetry reported as the extreme value; direction-of-opening rule reversed; constant term reported as the maximum; the input time reported as the output height.
- **AR.3.6** — 5: factor signs written to match the intercepts rather than oppose them; leading coefficient sign wrong; the given point never used to solve for a; horizontal/vertical shift direction reversed; a double root written as two distinct intercepts.
- **AR.3.7** — 5: balance term added but not subtracted back; balance term not multiplied by the factored-out coefficient; half of b miscomputed; binomial square expanded without its middle term; transformation direction reversed.
- **AR.4.1** — 2: exponents added when combining like terms; sign of the first term kept when combining.
- **AR.4.2** — 4: only First and Last products computed (Outer/Inner omitted); the cross product counted once instead of twice; binomial square expanded term-by-term without the middle term; the larger exponent kept instead of the sum.
- **AR.4.3** — 3: terms of different degree combined; implied coefficient of 1 overlooked; one polynomial's term never carried into the sum.
- **AR.4.4** — 3: coefficient not raised to the outer power; inner exponent raised to the outer instead of multiplied; negative exponent read as a negative value.
- **AR.4.5** — 5: term-level cancellation without factoring; over-cancellation against both factors; sign error in factoring the numerator or denominator; restriction read from the simplified form only; numerator zeros confused with undefined points.
- **AR.4.6** — 4: denominators added or subtracted along with numerators; numerators not rescaled to the LCD; negative not distributed across the whole second numerator; identical denominators multiplied to form a "common" one.
- **AR.4.7** — 4: substitutes into the numerator only; denominator misread; numerator set equal to the output, ignoring the denominator; input confused with output.
- **AR.4.8** — 5: largest perfect-square factor not extracted; the perfect square moved outside unrooted; coefficients and radicands both combined; rationalisation applied to only one of numerator/denominator; variable part left unsimplified.
- **AR.4.9** — 5: squares before isolating the radical; binomial squared term-by-term; extraneous root accepted without checking; a valid root discarded as "must be extraneous"; doubles instead of squaring.
- **AR.4.10** — 4: zero exponent evaluated as 0; negative exponent read as negation; base multiplied by exponent; bases multiplied along with the exponents.
- **AR.4.11** — 5: coefficient ignored and only the power evaluated; exponent applied to the coefficient instead of the base; base multiplied by exponent; coefficient added rather than multiplied; decay treated as linear.
- **AR.4.12** — 6: growth/decay factor built in the wrong direction; the rate itself used as the factor (forgetting the 1±r); simple interest used where compounding is required; compounding period not divided into the rate; exponent not multiplied by the period count; growth factor reported as the rate.

### GR — 19 topics, ~99 topic-specific concepts

- **GR.1.1** — 5: unit chosen from the wrong measurement category entirely; unit magnitude wildly mismatched to context; metric prefix factor wrong (÷100 vs ÷1000); measurement system mismatched to context; area conversion factor not squared. ⇄ merges with QR.2.7.
- **GR.1.2** — 6: complementary and supplementary swapped; vertical angles treated as supplementary; vertical angles treated as summing to a fixed value; adjacent vs vertical confused; multi-step angle chain stopped after step one; all four angles at an intersection summed.
- **GR.1.3** — 4: snaps to the nearest labelled tick instead of interpolating; number of subdivisions miscomputed; interpolation skipped to the next label; leading digit read and the units place dropped.
- **GR.2.1** — 5: wrong side count used for the polygon; one side omitted from the sum; irregular figure approximated as a rectangle; notch/cutout sides not accounted for; side count subtracted from the perimeter instead of divided.
- **GR.2.2** — 5: radius substituted for diameter (or vice versa); the factor of 2 omitted from 2πr; correct result doubled a second time; arc fraction not applied to the full circumference; ratio of circumferences confused with ratio of areas.
- **GR.2.3** — 5: base and height added instead of multiplied; slant side used as the perpendicular height; formula borrowed from a different shape; one part of a composite figure omitted; a cutout added instead of subtracted.
- **GR.2.4** — 4: wrong inverse operation when solving for a dimension; the sum of two bases reported as one base; area divided by only one of two required divisors; area squared instead of rooted.
- **GR.2.5** — 5: opposite faces not doubled; base omitted from a pyramid or cone; lateral surface computed alone; two bases counted where one exists; shared interface of a composite solid not removed.
- **GR.2.6** — 6: fractional factor omitted (⅓ for cone/pyramid, 4/3 for sphere); radius not squared; dimensions added instead of multiplied; cone/cylinder volume ratio wrong; cube root not taken; half the height used.
- **GR.2.7** — 5: factor not distributed to the constant inside a binomial dimension; binomial square expanded without the middle term; a phantom constant term introduced; ½ applied to the base only; expression doubled a second time.
- **GR.3.1** — 6: legs added or subtracted directly instead of via their squares; longest given side assumed to be the hypotenuse; space diagonal stopped after the base diagonal; a Pythagorean triple assumed without verifying; computed side omitted from the perimeter; legs assumed to sum to the hypotenuse.
- **GR.3.2** — 5: 45-45-90 and 30-60-90 factors swapped; short leg and long leg roles confused; multiplies by the ratio where division is required; hypotenuse reported when a leg was asked; the given side assumed to need no ratio at all.
- **GR.3.3** — 6: wrong trig ratio selected (sine for cosine, tangent for sine); side roles (opposite/adjacent/hypotenuse) misassigned; ratio numerator read as a literal side length; inverse trig function mismatched to the ratio; hypotenuse found by adding the legs; ratio from the wrong special-angle family used.
- **GR.3.4** — 5: adjacent side reported when the opposite was asked; special-triangle factor applied to the wrong part; multi-step application stopped after one step; initial height not subtracted from the final; angles subtracted before applying tangent.
- **GR.4.1** — 7: translation direction reversed on one or both axes; wrong reflection axis; wrong rotation rule; composition order reversed; one step of a composition skipped; coordinates swapped without negating; dilation added instead of multiplied.
- **GR.4.2** — 6: rigid motion treated as a dilation; dilation treated as congruence-preserving; a false extra condition invented for congruence; area ratio reported as the linear scale factor; transformation misidentified from the coordinate change; composition assumed to compound size.
- **GR.4.3** — 4: scale factor added instead of multiplied; scale factor direction reversed (B→A instead of A→B); area scaled by the linear factor instead of its square; area ratio used directly as the side ratio.
- **GR.4.4** — 5: symmetry axes double-counted (once per direction); axes undercounted; line symmetry confused with rotational symmetry; rotation angle reported instead of order; point symmetry attributed to an odd-vertex polygon.
- **GR.4.5** — 5: center signs not flipped from the equation form; radius reported where radius squared belongs (or vice versa); linear coefficient not halved when completing the square; distance formula replaced by adding coordinate differences; one coordinate squared and the other ignored.

### PR — 19 topics, ~100 topic-specific concepts

- **PR.1.1** — 4: threshold boundary error (< read as ≤); distinct values counted instead of occurrences; ordering violation located at the wrong position; repeated values totalled instead of counted.
- **PR.1.2** — 5: two categories' values swapped in a table; a real error traced to the wrong source value; a false structural rule invented about a graph type; the fix applied to the data instead of the headers; total accepted without verification.
- **PR.1.3** — 5: pictograph key not applied to the symbol count; wrong time point read; direction of change misidentified; above-average boundary inclusive/exclusive; a claimed total accepted without summing.
- **PR.1.4** — 5: row total used as the denominator where the column total was required; a single cell read where two must be summed; rank position off by one; wrong cell used as the numerator; two unrelated cells compared.
- **PR.1.5** — 5: categorical/numerical misclassification; discrete/continuous confusion; "nominal" applied to a measurement variable; graph type mismatched to the variable type; a false structural limit invented for a graph type.
- **PR.2.1** — 7: divisor miscounted when computing a mean; median taken from an unsorted list; the two middle values not averaged; a zero dropped as "no data"; a new mean built by averaging the old mean with the new value; new total divided by the old count; outlier resistance of a statistic misjudged.
- **PR.2.2** — 6: weights ignored entirely (simple mean taken); weights swapped between categories; largest weight matched to the largest score; a missing weight reused from another category; the final's weight not divided out; weighting assumed to make no difference.
- **PR.2.3** — 6: total built from the wrong count of values; the missing value assumed to equal the mean; range added to the wrong extreme; range computed from the known values only; the mean subtracted from the sum; optimisation bound misused when maximising or minimising an unknown.
- **PR.2.4** — 5: outlier's effect on the mean dismissed; a larger range read as better performance; skew direction misread from mean vs median; equal means assumed to imply equal consistency; equal medians assumed to imply equal means.
- **PR.2.5** — 6: quartile read as the median; IQR computed using the median in place of a quartile; full range compared instead of IQR; whisker length used to judge the typical value; equal endpoints read as identical distributions; skew direction misread from whisker length.
- **PR.3.1** — 7: favourable compared to unfavourable instead of to the total; total miscounted; complement reported instead of the event; threshold inclusive/exclusive error ("greater than" as "or greater"); compound outcomes double-counted at the overlap; a proportion solved for the wrong unknown; the part used as the total.
- **PR.3.2** — 5: complement assumed to be an even chance; the event reported instead of its complement; the event probability subtracted twice; complement taken of only one of two groups; a member miscounted into or out of the event set.
- **PR.3.3** — 5: only one stage's probability reported; replacement status wrong in either direction; the total not reduced between draws while the favourable count is; numerators added over a product of denominators; the sequence stopped one draw early.
- **PR.3.4** — 5: whole population used as the denominator instead of the conditioning group; the conditional reversed (P(A|B) for P(B|A)); the joint probability reported as the conditional; the prior reported, ignoring the condition; overlap not subtracted before conditioning.
- **PR.3.5** — 5: union and intersection swapped; complement misidentified as the set itself or as the universal set; overlap not subtracted in a union; overlap subtracted twice; triple overlap not added back.
- **PR.4.1** — 7: strength confused with direction; scatter read as no association at all; a curved pattern forced into a linear label; a single outlier's influence overstated or denied; equal spacing believed necessary for a linear association; a correlation coefficient believed necessary to name a direction; steepness confused with strength. *(See §4 — some of these are the flagged judgement-call items.)*
- **PR.4.2** — 4: x-values summed rather than differenced in the slope denominator; y-values summed rather than differenced; fit judged by intercept size; slope read as a total rather than a rate.
- **PR.4.3** — 2: decimal misplaced when converting the computed ratio to a percent; only one of two periods' growth counted.
- **PR.4.4** — 6: association read as causation; reverse causal direction asserted; a confounder ignored in favour of a direct cause; a tendency turned into an absolute claim; sample size alone treated as justifying generalisation; a model's in-range fit assumed to guarantee out-of-range accuracy.

### Long-tail totals

| strand | topics | est. topic-specific concepts |
|---|---:|---:|
| QR | 27 | ~111 |
| AR | 32 | ~145 |
| GR | 19 | ~99 |
| PR | 19 | ~100 |
| **total** | **97** | **~455 before cross-topic merging** |

I expect Phase 2 merging to remove 20–30% of these (the ⇄ marks are the ones I already
spotted; e.g. GR.1.1 unit conversion vs QR.2.7, AR.3.6/AR.3.7 shift-direction reversal,
the "stops one step early" variants across GR.1.2 / GR.3.4 / QR.2.6). **Expect roughly
320–360 long-tail slugs to survive.**

---

## 4. Edge cases — flagged, no slug forced

### 4a. Dual-error "perhaps / or" distractors — 4 items

These describe two alternative student errors in one string. No single tag is correct
for them; they need an authoring decision before they can be tagged.

| item | option | text |
|---|---|---|
| `PR_P_005` (PR.1.2) | C | "Student makes a mid-addition arithmetic slip, **perhaps** computing 5 + 8 + 4 + 4 = 21 by misreading Green as 4." |
| `PR_P_005` (PR.1.2) | D | "Student drops the Yellow frequency entirely and sums only three rows: 5 + 8 + 3 = 16, then arrives at 18 through a separate arithmetic error — **or** reads Yellow = 2 and adds 5 + 8 + 3 + 2 = 18." |
| `PR_A_006` (PR.1.2) | C | "Student makes an arithmetic slip when summing: **perhaps** computing 7 + 5 + 4 + 6 as … **or** misreads Category D as 5, giving 7 + 5 + 4 + 5 = 21." |
| `AR_P_030` (AR.2.7) | C | "Student converts both equations to slope-intercept form correctly but makes an arithmetic error computing m₁ × m₂, **arriving at a value other than −1** and concluding neither." |

Two further items in this family that you named are, on inspection, **not** dual-error
and can be tagged normally — reporting the correction rather than leaving it implied:

- `AR_P_022` (AR.2.4) option C names one specific error ("omits subtracting 6" during
  back-substitution) → tags as a single arithmetic-step omission.
- `QR_P_025` (QR.1.5) option B names one specific error ("subtracting 12 from 17 as
  17 − 10 = 7") → tags as a single place-value/arithmetic slip.

Options for the genuine four, for your decision in Phase 2:
1. Rewrite the distractor prose to name one error (changes item content — needs your sign-off).
2. Allow an array of tags for these four only (breaks the one-tag-per-option shape the curriculum side uses, and `record_misconception` would double-count).
3. Tag the *first-named* error and accept the loss of the alternative.

**I recommend (1)** — four items is a small rewrite, and options 2 and 3 both damage
the confidence ladder. Not proceeding until you choose.

### 4b. PR.4.1 judgement-call distractors — 11 items

These name a *reasoning judgement* rather than a procedure. They are legitimate
misconceptions and tag cleanly under `misreads_direction_of_change`,
`center_spread_confusion` or a PR.4.1-specific slug — but they will cluster differently
from procedural errors, and a teacher-facing card reading "student over-reads random
scatter" is advice, not a diagnosis.

| item | option | text |
|---|---|---|
| `PR_P_069` | A | Student over-reads random scatter as a slight upward trend. |
| `PR_P_069` | C | Student over-reads random scatter as a slight downward trend. |
| `PR_P_066` | B | Student misreads the direction of an upward drift. |
| `PR_P_065` | C | Student reverses the direction of an upward-rising pattern. |
| `PR_P_068` | C | Student reverses the direction of a downward pattern. |
| `PR_P_068` | D | Student believes any scatter at all rules out an association. |
| `PR_B_069` | C | Student believes five points are too few to identify a trend. |
| `PR_B_067` | C | Student assumes imperfect real-world data means no association exists. |
| `PR_A_067` | D | Student assumes a single point can never affect an association. |
| `PR_A_070` | C | Student misreads the direction of the apparent pattern entirely. |
| `PR_A_071` | D | Student confuses a negative direction with a weak association. |

My read: these split into two kinds — **direction reversals** (tag under
`misreads_direction_of_change`, no problem) and **false beliefs about what an
association requires** (needs its own slug, e.g. a `false_precondition_for_association`
concept). Proposing that split in Phase 2 rather than forcing it now.

---

## 5. Phase 1 totals

| layer | count |
|---|---:|
| Existing curriculum slugs, reused unchanged | **40** (18 with real CAT volume, 22 QR-bound) |
| New cross-cutting slugs proposed | **42** |
| **Cross-cutting layer total** | **82** |
| Long-tail concepts identified, pre-merge | ~455 |
| Long-tail slugs expected post-merge | ~320–360 |
| **Projected full taxonomy** | **~400–440 slugs** |
| Distractors to tag | 3,348 |
| Edge cases held back | 4 dual-error + 11 PR.4.1 judgement-call |

Consistent with the 300–500 range estimated in the prior audit.

---

## 6. Open questions for your Phase 1 sign-off

1. **Split `exponent_rule_confusion` into three?** (`adds_exponents_instead_of_multiplying`, `multiplies_exponents_instead_of_adding`, `subtracts_exponents_instead_of_adding`.) I lean yes.
2. **Keep the three GR formula-swap slugs separate, or collapse to one `wrong_formula_for_measure`?** I lean separate.
3. **`causation_from_association` and `extrapolates_beyond_data` sit in one topic each.** Cross-cutting or long tail? I lean cross-cutting — they are the defining errors of the strand and will recur.
4. **The `answers_intermediate_value` / `omits_constant_term` boundary** needs a written rule before tagging, or it will drift. Proposing: stopped mid-procedure → `answers_intermediate_value`; procedure completed but the constant was never in it → `omits_constant_term`.
5. **The 4 dual-error items** — rewrite (my recommendation), multi-tag, or first-error-only?
6. **A canonical definitions file does not exist** for the 40 curriculum slugs. Phase 2 should create one. Where should it live — `data/docs/`, or beside the curriculum source?
