# Misconception tags: the controlled vocabulary

Every wrong answer choice carries a misconception slug. The slug is the
misconception's identity: one letter, one slug, one student procedure.

## The hard rule

**Never invent a slug.** Every slug written into a topic file must already exist in
the vocabulary below. `scripts/lint_curriculum_source.py` fails the file with
`misconception slug X is not in the taxonomy` and the upload does not proceed.

If no existing slug fits the misconception, that is a finding to report, not a gap
to fill. New slugs are added by editing the generator
`scripts/build_misconception_taxonomy.py`, regenerating, and running
`scripts/check_taxonomy_generated.py`. Hand-editing the JSON is a known past defect
(issue #94) and regenerating would silently delete the additions.

## Source of truth

| file | role |
|---|---|
| `scripts/build_misconception_taxonomy.py` | the actual source of truth, the data tables live here |
| `data/docs/misconception_taxonomy.json` | generated artefact, `authoritative: true`, what the linter reads |
| `data/docs/misconception_taxonomy.md` | generated human companion |
| `data/docs/misconception_taxonomy_draft.md` | **STALE, do not use.** A Phase 1 draft that describes 40 slugs across 5 topics |

`sql/curriculum_misconception_tags.sql` documents the storage column
(`curriculum_topics.misconception_tags`), not the vocabulary. It contains no slug
definitions.

The table below is copied from `data/docs/misconception_taxonomy.json` at commit
`d382066`. Definitions and notes are verbatim.

## Counts

| | count |
|---|---:|
| total slugs | 480 |
| cross cutting | 88 |
| cross cutting, from the original curriculum vocabulary | 40 |
| cross cutting, new | 48 |
| topic specific | 392 |
| proposed, pending decision | 0 |
| topics covered | 97 |

Taxonomy status: `approved_phase3_complete`. **All 480 records carry `status: approved`**, so every slug
in the table below is usable today.

## How a tag is authored

Two sibling blocks in one fenced `json` block in Part 4, beside the item they
belong to. They are parsed together by `parse_answer_key()` because they are three
parts of one fact: which option is right, what each wrong option means, and how to
say that to a teacher.

```json
"distractor_logic": {
  "A": "Student makes misconception: skips_times_100 (converts 3/5 to 0.6, then attaches a percent sign without multiplying by 100, producing 0.6%)",
  "B": "Student makes misconception: fraction_digit_gluing (reads the digits of 3/5 straight off as a percent, producing 35%)",
  "C": "Correct: divides 3 by 5 to get 0.6, then multiplies by 100 to get 60%",
  "D": "Student makes misconception: reversed_division (computes 5 divided by 3 instead of 3 divided by 5, getting 1.667 and producing 167%)"
},
"misconception_tag": {
  "A": "skips_times_100",
  "B": "fraction_digit_gluing",
  "D": "reversed_division"
}
```

Rules that follow from the shape:

1. **`distractor_logic` covers all four letters. `misconception_tag` covers exactly
   the three wrong ones.** The correct option carries no tag and is absent from the
   map. This is how the correct answer is recorded twice, independently, and
   `validate_practice_items()` cross-checks the two. If the `**Answer: X**` line and
   the untagged letter disagree, the upload warns and grading cannot be trusted.
2. **The prose gloss names the slug and then explains it in parentheses.** The house
   form is `Student makes misconception: <slug> (<what the student did, with the
   actual numbers, and the value it produces>)`. The correct letter uses
   `Correct: <the right procedure>`.
3. **The correct-option prose is the printed rationale.** `buildRationales()` in
   `app/teacher/worksheets/worksheet-data.ts` takes the `Correct:` line and prints
   it on the worksheet answer key. Write it as a sentence a teacher can read aloud.
4. **Every distractor traces to exactly one named student error**, and no distractor
   may imply that an invalid rule is valid. A wrong answer must be reachable by a
   real error a real student makes.

Both blocks are stripped from the rendered page by `stripAuthoringBlocks()`, so the
taxonomy never reaches a student.

## Measured usage

Computed from the 97 topic files at commit `d382066`. This is measurement, not
part of the vocabulary.

| | count |
|---|---:|
| tagged instances across the curriculum | 4074 |
| distinct slugs actually used | 455 |
| used slugs outside the taxonomy | 0 |
| taxonomy slugs not yet used by the curriculum | 25 |
| topics carrying at least one tag | 96 of 97 |

QR.1.1 is the one topic with no tags at all: 9 of its 12 practice items are free
response and carry no options to tag.

**Read the `topics` column below as CAT item bank observation, not as curriculum
usage.** It is populated from `data/items/**`, so the 40 curriculum-origin slugs
mostly show an empty list even though they are heavily used by the curriculum.
An empty `topics` cell does not mean the slug is unused or unusable.

## Retired slugs

Removed from the vocabulary. **Do not use these.** Listed so a reader does not
conclude they are still taggable.

| slug | superseded by | why |
|---|---|---|
| `cancellation_assumed_to_restore_domain` | `restriction_read_from_simplified_form` | Named the same student error as restriction_read_from_simplified_form from the other side. A student who cancels (x - 3) and then declares x = 3 legal has committed both, and no item can separate them, so the pair split one class-wide signal into two weaker ones on the teacher dashboard misconception grid. The survivor is the more precise of the two definitions and sits on AR.4.5, where the cancelling actually happens and where the curriculum already carries three tagged items. See issue #88. |
| `conditions_on_wrong_group` | `whole_population_as_denominator`, `conditional_reversed` | The two survivors are the clearer names: they say which wrong group was used (the whole population) or that the conditional was inverted. The umbrella name said neither. It carried 0 tags. |
| `ignores_without_replacement` | `replacement_status_wrong`, `total_not_reduced_between_draws` | The survivors separate treating the draws as the wrong kind from reducing the favourable count but not the total -- a distinction the umbrella name lost. It carried 0 tags. |

## Boundary rules

Where two slugs could both look right, these say which one wins.

### `intermediate_vs_omission`

- Status: `approved`
- Slugs: `answers_intermediate_value`, `omits_constant_term`, `omits_variable_term`
- Phase1 proposal: Stopped mid-procedure -> answers_intermediate_value; procedure completed but the constant was never in it -> omits_constant_term.
- Phase1 problem: Does not break the tie for 'computes the rate portion and forgets the flat fee', which reads as both; and has no home for the mirror case where the variable term is the one missing.
- Phase2 proposal: Tag by what is missing from the answer, not by where the student stopped. Missing fixed component -> omits_constant_term. Missing variable component -> omits_variable_term. A correct intermediate quantity of a different kind (scale factor, unit rate, pre-division sum, count of parts) -> answers_intermediate_value. Tie-break: if the reported value is one of the two additive components of a linear model it is an omits_* tag, never answers_intermediate_value.
- Resolution: Approved as the phase2_proposal, tie-break included. omits_variable_term is an approved slug.

## Edge cases

Recorded resolutions. These concern CAT item bank ids (`PR_P_005.C` and the like),
not curriculum topic files, and are carried here so the vocabulary record is
complete.

### `dual_error_rewrites`

- Status: `approved_for_phase3`
- Decision: Rewrite to single-error prose rather than multi-tagging, to protect record_misconception() counting.
- Note: PR_P_005.D exposed an item defect: answer choice D stated a total of 18 while its stated reason (omitting the Yellow row) yields 16. Approved resolution is option (a) -- correct the arithmetic in answer_choices.D to 16, keep the omission reasoning, tag single_cell_read_where_sum_needed. This is the one approved edit outside distractor_logic.
- Items: `PR_P_005.C`, `PR_P_005.D`, `PR_A_006.C`, `AR_P_030.C`

### `pr41_judgement_calls`

- Status: `resolved_in_phase2`
- Resolution: Split by kind. Direction reversals tag under misreads_direction_of_change. False beliefs about what an association requires tag under the new false_precondition_for_association.
- Items: `PR_P_069.A`, `PR_P_069.C`, `PR_P_066.B`, `PR_P_065.C`, `PR_P_068.C`, `PR_P_068.D`, `PR_B_069.C`, `PR_B_067.C`, `PR_A_067.D`, `PR_A_070.C`, `PR_A_071.D`

## The vocabulary

All 480 approved slugs, in the order the generator emits them.

| slug | definition | layer | origin | topics | strands | notes |
|---|---|---|---|---|---|---|
| `absolute_change_as_percent` | Reports the raw difference as if it were the percent change. | cross_cutting | cat_bank | PR.4.3, QR.2.3 | PR, QR |  |
| `absolute_difference_as_product` | Computes the absolute value of a difference as a product of the two values. | topic_specific | cat_bank | QR.1.8 | QR |  |
| `absolute_equation_one_case_only` | Solves only one case of an absolute-value equation. | topic_specific | cat_bank | QR.1.8 | QR |  |
| `absolute_inequality_boundary_only` | Reports only the boundary points, not the interval they enclose. | topic_specific | cat_bank | QR.1.8 | QR |  |
| `absolute_inequality_direction_reversed` | Produces the solution set for the opposite absolute-value inequality. | topic_specific | cat_bank | QR.1.8 | QR |  |
| `absolute_value_as_additive_inverse` | Reads the absolute value of a number as the value that adds to it to reach zero. | topic_specific | cat_bank | QR.1.8 | QR |  |
| `absolute_value_as_squaring` | Confuses absolute value with squaring. | topic_specific | cat_bank | QR.1.8 | QR |  |
| `absolute_value_leaves_sign` | Believes absolute value leaves a negative sign unchanged. | topic_specific | cat_bank | QR.1.8 | QR |  |
| `accuracy_judged_by_format` | Judges which estimate is better by its decimal-place format rather than by squaring. | topic_specific | cat_bank | QR.1.4 | QR |  |
| `added_items_not_reflected_in_total` | Adds or removes items from one category without updating the total. | topic_specific | cat_bank | PR.3.1 | PR |  |
| `adds_exponents_wrongly` | Adds exponents where the applicable rule requires multiplying or subtracting them. | cross_cutting | cat_bank | AR.4.10, AR.4.11, AR.4.2, AR.4.4 | AR | Split from exponent_rule_confusion per decision 1; renamed per Phase 2 review so the name covers every displaced rule, not just the power rule. |
| `adds_instead_of_scales` | Sees an additive gain in one quantity and adds that same amount to the paired quantity instead of applying the multiplicative scale factor. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `adds_instead_of_subtracts` | Combines terms with addition where the expression calls for subtraction. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `adds_probabilities_instead_of_multiplying` | Adds the stage probabilities of a compound event instead of multiplying them. | cross_cutting | cat_bank | PR.3.2, PR.3.3 | PR |  |
| `adjacent_reported_for_opposite` | Reports the side adjacent to the angle where the opposite side was asked for, or vice versa. | topic_specific | cat_bank | GR.3.4 | GR |  |
| `adjacent_vs_vertical_confused` | Confuses the positional relationship of adjacent angles with the opposite-pair relationship of vertical angles. | topic_specific | cat_bank | GR.1.2 | GR |  |
| `all_intersection_angles_summed` | Sums every angle at an intersection rather than the requested pair. | topic_specific | cat_bank | GR.1.2 | GR |  |
| `alligation_ratio_misapplied` | Reads an alligation ratio as a fraction of the wrong base. | topic_specific | cat_bank | QR.2.2 | QR |  |
| `angles_combined_before_applying_ratio` | Combines the angles before applying the trigonometric ratio. | topic_specific | cat_bank | GR.3.4 | GR |  |
| `answers_intermediate_value` | Computes a correct intermediate quantity and reports it as the final answer instead of continuing. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `applies_fractional_factor_twice` | Applies the one-half or one-third factor a second time, scaling down a result that already included it. | cross_cutting | cat_bank | GR.2.3, GR.2.6 | GR | Split out 2026-08-13 from an over-broad tagging rule; see content-fixes-needed.md. |
| `arc_fraction_not_applied` | Reports the full circumference where an arc fraction was required. | topic_specific | cat_bank | GR.2.2 | GR |  |
| `area_conversion_factor_not_squared` | Applies the linear conversion factor to an area instead of its square. | topic_specific | cat_bank | GR.1.1, QR.2.7 | GR, QR | Merged from GR.1.1 and QR.2.7. |
| `area_ratio_confused_with_linear_ratio` | Confuses the ratio of areas with the ratio of corresponding lengths, in either direction. | topic_specific | cat_bank | GR.4.2, GR.4.3 | GR | Merged from GR.4.2 (area_ratio_reported_as_scale_factor) and GR.4.3 (area_ratio_used_as_side_ratio). |
| `area_scaled_by_linear_factor` | Scales an area by the linear scale factor instead of its square. | topic_specific | cat_bank | GR.4.3 | GR |  |
| `area_squared_instead_of_rooted` | Squares the area instead of taking its square root to recover a side. | topic_specific | cat_bank | GR.2.4 | GR |  |
| `averaging_removes_the_variation_studied` | Aggregates or averages across the very dimension the question asks about, removing the variation needed to answer it. | topic_specific | cat_bank | PR.1.5 | PR | Added in the Phase 3 closeout; PR_A_021.D was previously tagged graph_type_mismatched_to_variable, but the display suits the data -- the averaging is what discards the evidence. |
| `axis_of_symmetry_reported_as_root` | Reports the axis of symmetry as a solution. | topic_specific | cat_bank | AR.3.4 | AR |  |
| `axis_reported_as_extreme_value` | Reports the input at the vertex where the extreme value was asked for. | topic_specific | cat_bank | AR.3.5 | AR |  |
| `balance_term_not_scaled_by_leading_coefficient` | Fails to multiply the balance term by the factored-out leading coefficient. | topic_specific | cat_bank | AR.3.7 | AR |  |
| `balance_term_not_subtracted_back` | Adds the completing-the-square term without subtracting it back. | topic_specific | cat_bank | AR.3.7 | AR |  |
| `base_height_added_not_multiplied` | Adds the base and height instead of multiplying them. | topic_specific | cat_bank | GR.2.3 | GR |  |
| `base_omitted_from_solid` | Omits the base of a solid from its surface area. | topic_specific | cat_bank | GR.2.5 | GR |  |
| `base_times_exponent` | Evaluates a power by multiplying the base by the exponent. | topic_specific | cat_bank | AR.4.10, AR.4.11 | AR | Merged from AR.4.10 and AR.4.11. |
| `bases_multiplied_with_exponents` | Multiplies the bases as well as combining the exponents. | topic_specific | cat_bank | AR.4.10 | AR |  |
| `benchmark_judged_from_digits` | Judges a value against a benchmark such as one half by inspecting its digits rather than converting. | topic_specific | cat_bank | QR.1.2 | QR |  |
| `binomial_square_middle_term_omitted` | Expands a squared binomial as the sum of the squared terms, omitting the middle term. | cross_cutting | cat_bank | AR.3.7, AR.4.2, AR.4.9, GR.2.7 | AR, GR | MERGED in Phase 2 from three separately-drafted topic slugs (AR.3.7, AR.4.2, AR.4.9) plus GR.2.7. |
| `both_bases_counted_where_one` | Counts two bases on a solid that has one. | topic_specific | cat_bank | GR.2.5 | GR |  |
| `boundary_strictness_changed` | Silently changes a strict boundary to non-strict, or vice versa, in the solution set. | topic_specific | cat_bank | AR.2.2 | AR |  |
| `boundary_style_mismatched` | Uses a solid boundary for a strict inequality or a dashed one for a non-strict inequality. | topic_specific | cat_bank | AR.2.5 | AR |  |
| `breakeven_markup_assumed_equal_to_discount` | Assumes the markup needed to offset a discount equals the discount rate. | topic_specific | cat_bank | QR.2.4 | QR |  |
| `carry_not_propagated` | Begins a rounding carry but writes the digit literally instead of continuing to carry. | topic_specific | cat_bank | QR.1.6 | QR |  |
| `categorical_numerical_misclassified` | Classifies a categorical variable as numerical, or a numerical variable as categorical. | topic_specific | cat_bank | PR.1.5 | PR |  |
| `category_values_swapped` | Exchanges the recorded values of two categories. | topic_specific | cat_bank | PR.1.2 | PR |  |
| `causation_from_association` | Reads an observed association as an established causal claim, in either direction. | cross_cutting | cat_bank | PR.4.4 | PR | Single topic today; classified cross-cutting per Phase 1 decision 3 so future inference items need no re-touch. |
| `center_spread_confusion` | Uses a measure of centre to judge spread, or a measure of spread to judge centre. | cross_cutting | cat_bank | PR.2.1, PR.2.4, PR.2.5 | PR |  |
| `circle_center_signs_not_flipped` | Reads the centre coordinates with their displayed signs instead of flipping them. | topic_specific | cat_bank | GR.4.5 | GR |  |
| `circumference_area_confusion` | Uses a circle's area formula where circumference was required, or vice versa. | cross_cutting | cat_bank | GR.2.2, GR.2.3, GR.2.7 | GR | Kept separate per decision 2. |
| `closer_endpoint_error` | Judges which perfect square a radicand is nearer to, and picks the wrong one. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `closing_rate_reported_as_distance` | Reports a computed rate as though it were a distance. | topic_specific | cat_bank | QR.2.5 | QR |  |
| `coefficient_added_not_multiplied` | Adds the coefficient to the evaluated power instead of multiplying. | topic_specific | cat_bank | AR.4.11 | AR |  |
| `coefficient_ignored_in_power` | Evaluates only the power and drops the coefficient. | topic_specific | cat_bank | AR.4.11 | AR |  |
| `coefficient_lost_in_multistep` | Loses a radical's coefficient partway through a multi-step simplification. | topic_specific | cat_bank | QR.1.5 | QR |  |
| `coefficient_not_raised_to_power` | Leaves the coefficient untouched or multiplies it when it should be raised to the outer power. | topic_specific | cat_bank | AR.4.4 | AR |  |
| `coefficient_plus_constant_as_rate` | Adds the coefficient and the constant and reports the sum as the rate. | topic_specific | cat_bank | QR.3.2 | QR |  |
| `coefficient_subtracted_not_divided` | Subtracts the coefficient instead of dividing by it. | topic_specific | cat_bank | AR.2.1 | AR |  |
| `coefficients_and_radicands_both_combined` | Combines the radicands as well as the coefficients when adding or subtracting like radicals. | topic_specific | cat_bank | AR.4.8 | AR |  |
| `combines_unlike_terms` | Treats terms with different variables or degrees as like terms and merges their coefficients. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `common_factor_not_extracted` | Fails to factor the variable out before isolating it. | topic_specific | cat_bank | AR.2.8 | AR |  |
| `comparative_relationship_reversed` | Reverses which quantity is the multiple of the other. | topic_specific | cat_bank | QR.3.3 | QR |  |
| `comparison_declared_impossible` | Believes rates cannot be compared without a graph or further information. | topic_specific | cat_bank | QR.3.7 | QR |  |
| `complement_assumed_half` | Assumes the complement of any event is an even chance. | topic_specific | cat_bank | PR.3.2 | PR |  |
| `complement_misidentified` | Reports the set itself or the universal set as the complement. | topic_specific | cat_bank | PR.3.5 | PR |  |
| `complement_used_instead_of_value` | Uses the complement of the required fraction or proportion in place of the value itself. | topic_specific | cat_bank | QR.1.3 | QR | Added in the Phase 3 closeout; QR_P_019.D was previously tagged reads_wrong_category, which implies a labelled group that this item does not have. |
| `complementary_supplementary_swap` | Applies the supplementary rule where the complementary rule was required, or vice versa. | topic_specific | cat_bank | GR.1.2 | GR |  |
| `composition_assumed_to_compound_size` | Assumes applying more than one transformation must change the size. | topic_specific | cat_bank | GR.4.2 | GR |  |
| `composition_order_reversed` | Applies the transformations of a composition in the wrong order. | topic_specific | cat_bank | GR.4.1 | GR |  |
| `composition_step_skipped` | Applies only one transformation of a composition and stops. | topic_specific | cat_bank | GR.4.1 | GR |  |
| `compound_outcomes_double_counted` | Adds two overlapping outcome groups without removing the shared members. | topic_specific | cat_bank | PR.3.1 | PR |  |
| `compounding_period_not_adjusted` | Fails to adjust the rate or the exponent for the number of compounding periods. | topic_specific | cat_bank | AR.4.12 | AR |  |
| `conditional_reversed` | Computes the conditional probability with its two events exchanged. | topic_specific | cat_bank | PR.3.4 | PR |  |
| `cone_cylinder_ratio_wrong` | Uses the wrong fractional relationship between a cone and its enclosing cylinder. | topic_specific | cat_bank | GR.2.6 | GR |  |
| `confounder_ignored` | Accepts a direct causal claim while ignoring a plausible confounding variable. | topic_specific | cat_bank | PR.4.4 | PR |  |
| `conjugate_applied_to_denominator_only` | Multiplies the denominator by its conjugate but leaves the numerator unmultiplied. | topic_specific | cat_bank | QR.1.5 | QR |  |
| `constant_difference_as_direct_variation` | Accepts a constant difference as evidence of direct variation rather than a constant ratio. | topic_specific | cat_bank | QR.2.8 | QR |  |
| `constant_rate_assumed` | Assumes a table is linear without computing each interval separately. | topic_specific | cat_bank | QR.3.6 | QR |  |
| `constant_read_as_excluded_value` | Reads a constant term directly as the excluded value without solving. | topic_specific | cat_bank | AR.1.5 | AR |  |
| `constant_read_as_rate` | Reads the constant term as the rate of change. | topic_specific | cat_bank | QR.3.2 | QR |  |
| `constant_term_reported_as_extreme` | Reports the constant term as the maximum or minimum value. | topic_specific | cat_bank | AR.3.5 | AR |  |
| `constants_added_to_solve` | Adds the constants from both equations to produce a value for the variable. | topic_specific | cat_bank | AR.2.4 | AR |  |
| `constants_assigned_to_wrong_binomials` | Uses the right numbers but places the constants in the wrong factors. | topic_specific | cat_bank | AR.3.2 | AR |  |
| `contextual_condition_as_domain_restriction` | Excludes an input for a contextual reason rather than because the function is undefined. | topic_specific | cat_bank | AR.1.5 | AR |  |
| `contradiction_confused_with_identity` | Concludes an equation is true for all inputs when it has no solution, or vice versa. | topic_specific | cat_bank | AR.2.1 | AR |  |
| `contradiction_read_as_solution` | Reads a contradiction as giving a solution value. | topic_specific | cat_bank | AR.2.1 | AR |  |
| `conversion_factor_rounded` | Rounds the conversion factor before applying it, losing precision. | topic_specific | cat_bank | QR.2.7 | QR |  |
| `conversion_stopped_one_step_early` | Completes an intermediate conversion and stops before reaching the requested unit. | topic_specific | cat_bank | QR.2.6 | QR |  |
| `converts_whole_number_part_only` | Converts only the whole-number portion and drops the fractional or decimal part. | topic_specific | cat_bank | QR.2.6 | QR |  |
| `coordinates_swapped` | Writes an ordered pair with its coordinates exchanged. | cross_cutting | cat_bank | AR.2.4, AR.3.5, AR.3.7, GR.4.1, GR.4.5 | AR, GR |  |
| `coordinates_swapped_without_negating` | Swaps the coordinates for a reflection but omits the negation. | topic_specific | cat_bank | GR.4.1 | GR |  |
| `cross_product_counted_once` | Includes the cross product once instead of twice. | topic_specific | cat_bank | AR.4.2 | AR |  |
| `crossover_assumed_permanent_tie` | Finds the crossover point and assumes the relationships stay equal beyond it. | topic_specific | cat_bank | QR.3.7 | QR |  |
| `curved_pattern_forced_linear` | Applies a single linear direction label to a curved pattern. | topic_specific | cat_bank | PR.4.1 | PR |  |
| `cutout_added_not_subtracted` | Adds a cutout's area to the figure instead of subtracting it. | topic_specific | cat_bank | GR.2.3 | GR |  |
| `delta_x_used_as_slope` | Uses the change in the input directly as the slope. | topic_specific | cat_bank | AR.2.6 | AR |  |
| `delta_y_used_as_slope` | Uses the change in the output directly as the slope without dividing. | topic_specific | cat_bank | AR.2.6 | AR |  |
| `denominator_misread` | Misreads the denominator expression when substituting. | topic_specific | cat_bank | AR.4.7 | AR |  |
| `denominator_zero_rule_not_applied` | Concludes a rational function is defined everywhere, ignoring the zero-denominator restriction. | topic_specific | cat_bank | AR.1.5 | AR |  |
| `denominators_combined_with_numerators` | Adds or subtracts the denominators along with the numerators. | topic_specific | cat_bank | AR.4.6 | AR |  |
| `differences_vs_ratios_confused` | Uses first differences where constant ratios distinguish the family, or vice versa. | topic_specific | cat_bank | AR.1.4 | AR |  |
| `dilation_treated_as_congruence_preserving` | Believes a dilation preserves congruence despite the scale factor. | topic_specific | cat_bank | GR.4.2 | GR |  |
| `dimensions_added_not_multiplied` | Adds the dimensions instead of multiplying them. | topic_specific | cat_bank | GR.2.6 | GR |  |
| `discrete_continuous_confused` | Confuses discrete and continuous as descriptions of a numerical variable. | topic_specific | cat_bank | PR.1.5 | PR |  |
| `discriminant_miscomputed` | Computes the discriminant with the wrong sign or term. | topic_specific | cat_bank | AR.3.4 | AR |  |
| `distance_formula_replaced_by_sum` | Adds the coordinate differences instead of applying the distance formula. | topic_specific | cat_bank | GR.4.5 | GR |  |
| `distinct_values_counted_not_occurrences` | Counts how many distinct values satisfy a condition rather than how many entries do. | topic_specific | cat_bank | PR.1.1 | PR |  |
| `divides_before_isolating` | Divides by the coefficient before removing the constant term. | topic_specific | cat_bank | AR.2.1 | AR |  |
| `divides_before_subtracting_fee` | Divides the total by the per-unit rate without first removing the fixed fee. | topic_specific | cat_bank | QR.4.2 | QR |  |
| `divides_instead_of_multiplies` | Divides where the relationship requires multiplication. | cross_cutting | cat_bank | AR.2.1, GR.2.2, GR.2.3, GR.3.2, GR.3.3, GR.3.4, GR.4.3, QR.2.6, QR.2.7 | AR, GR, QR |  |
| `division_distributed_over_sum` | Applies a false rule that division distributes over addition. | topic_specific | cat_bank | AR.2.8 | AR |  |
| `domain_range_swap` | Assigns output values to the domain and input values to the range. | topic_specific | cat_bank | AR.1.3 | AR |  |
| `double_negative_mishandled` | Treats subtracting a negative as subtraction, or a double negation as a single one. | cross_cutting | cat_bank | AR.4.3, QR.1.5, QR.3.8 | AR, QR |  |
| `double_root_written_as_two_intercepts` | Factors a single touch point into two distinct intercepts. | topic_specific | cat_bank | AR.3.6 | AR |  |
| `drops_grouping_symbols` | Ignores parentheses as a grouping symbol entirely. | cross_cutting | cat_bank | QR.1.7, QR.3.1, QR.3.3 | QR |  |
| `drops_negative_on_group` | Applies a leading minus to only the first term of a parenthesised group. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `drops_negative_sign` | Ignores a minus sign and reports the magnitude. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `drops_unlike_term` | Combines the like terms correctly, then discards the leftover unpaired term. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `drops_variable` | Combines coefficients correctly but writes a bare number, losing the variable. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `equal_endpoints_read_as_equal_distributions` | Treats two plots with the same extremes as identical distributions. | topic_specific | cat_bank | PR.2.5 | PR |  |
| `equal_means_assumed_equal_consistency` | Assumes equal means imply equal consistency. | topic_specific | cat_bank | PR.2.4 | PR |  |
| `equal_medians_assumed_equal_means` | Assumes equal medians imply equal means. | topic_specific | cat_bank | PR.2.4 | PR |  |
| `error_traced_to_wrong_source` | Correctly spots a data error but attributes it to the wrong source value. | topic_specific | cat_bank | PR.1.2 | PR |  |
| `estimate_not_verified_by_squaring` | Accepts an estimate without squaring it to check against the radicand. | topic_specific | cat_bank | QR.1.4 | QR |  |
| `event_probability_subtracted_twice` | Subtracts the event probability from one twice. | topic_specific | cat_bank | PR.3.2 | PR |  |
| `event_set_miscounted` | Miscounts which members belong to the event before taking its complement. | topic_specific | cat_bank | PR.3.2 | PR |  |
| `exponent_applied_to_coefficient` | Applies the exponent to the coefficient instead of to the base. | topic_specific | cat_bank | AR.4.11 | AR |  |
| `exponent_position_confused` | Confuses a variable base with a variable exponent when naming a function family. | topic_specific | cat_bank | AR.1.4 | AR |  |
| `exponents_added_when_combining` | Adds the exponents of like terms instead of keeping the common exponent. | topic_specific | cat_bank | AR.4.1 | AR |  |
| `extraneous_root_not_checked` | Accepts both candidate roots without checking them in the original equation. | topic_specific | cat_bank | AR.4.9 | AR |  |
| `extrapolates_beyond_data` | Applies a model outside the range the data support. | cross_cutting | cat_bank | PR.4.4 | PR | Single topic today; cross-cutting per decision 3. |
| `extreme_point_believed_absent` | Believes a parabola in a given form has no maximum or minimum. | topic_specific | cat_bank | AR.3.5 | AR |  |
| `factor_constants_read_as_roots` | Reports the numbers inside the factors as the roots without flipping their signs. | topic_specific | cat_bank | AR.3.3 | AR |  |
| `factor_not_distributed_to_constant` | Distributes a factor to the variable term but not to the constant in a binomial dimension. | topic_specific | cat_bank | GR.2.7 | GR |  |
| `factor_of_two_omitted` | Omits the factor of two from the radius form of the circumference formula. | topic_specific | cat_bank | GR.2.2 | GR |  |
| `factor_pair_sum_unchecked` | Chooses a factor pair with the correct product without checking the sum. | topic_specific | cat_bank | AR.3.1 | AR |  |
| `factor_reported_as_rate` | Reports the growth or decay factor as the percent rate. | topic_specific | cat_bank | AR.4.12 | AR |  |
| `factor_signs_match_intercepts` | Writes the factors with the same signs as the intercepts instead of the opposite signs. | topic_specific | cat_bank | AR.3.6 | AR |  |
| `false_condition_invented_for_congruence` | Adds a condition that congruence does not require. | topic_specific | cat_bank | GR.4.2 | GR |  |
| `false_precondition_for_association` | Believes an association requires a condition the data need not meet. | topic_specific | cat_bank | PR.4.1 | PR | Introduced in Phase 2 to house the PR.4.1 judgement-call items -- see edge_cases. |
| `false_radical_distribution` | Applies a false distributive rule to radicals, or combines radicands where the operation does not permit it. | cross_cutting | cat_bank | AR.4.8, AR.4.9, QR.1.1, QR.1.5 | AR, QR |  |
| `false_structural_rule_invented` | Invents a structural limit on a graph or table type that does not exist. | topic_specific | cat_bank | PR.1.2, PR.1.5 | PR | Merged from PR.1.2 and PR.1.5. |
| `family_matched_by_surface_growth` | Matches a function to a family from its growth appearance without computing differences or ratios. | topic_specific | cat_bank | AR.1.4 | AR |  |
| `favourable_over_unfavourable` | Divides favourable outcomes by unfavourable outcomes instead of by the total. | topic_specific | cat_bank | PR.3.1 | PR |  |
| `fencepost_error` | Divides a length by a spacing and omits the final endpoint. | topic_specific | cat_bank | QR.2.6 | QR |  |
| `first_value_as_constant_of_variation` | Takes the first output value as the constant of variation instead of computing the ratio. | topic_specific | cat_bank | QR.2.8 | QR |  |
| `fit_judged_by_intercept` | Judges which model fits better by the size of its intercept rather than by comparing predictions. | topic_specific | cat_bank | PR.4.2 | PR |  |
| `fix_applied_to_wrong_element` | Corrects the data where the labels were wrong, or vice versa. | topic_specific | cat_bank | PR.1.2 | PR |  |
| `fixed_fee_added_twice` | Adds a flat fee a second time to an already-complete total. | topic_specific | cat_bank | AR.2.3 | AR |  |
| `flat_fee_merged_into_rate` | Folds a one-time fixed fee into the per-unit rate so it is applied to every unit. | topic_specific | cat_bank | QR.3.1, QR.4.2 | QR | Merged from QR.3.1 and QR.4.2 (drafted there as fee_charged_per_unit). |
| `foil_outer_inner_omitted` | Multiplies only the first and last terms of two binomials, omitting the outer and inner products. | topic_specific | cat_bank | AR.4.2 | AR |  |
| `forgets_square_root` | Computes the squared or cubed quantity correctly and reports it without taking the root. | cross_cutting | cat_bank | AR.3.4, GR.2.3, GR.2.4, GR.2.5, GR.2.6, GR.3.1, GR.3.2 | AR, GR | Covers square and cube roots. |
| `formula_borrowed_from_other_shape` | Applies another shape's area formula to the given figure. | topic_specific | cat_bank | GR.2.3 | GR |  |
| `fraction_digit_gluing` | Reads the digits of a fraction straight off as a decimal or percent (3/5 as 0.35 or 35%). | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `fractional_factor_applied_to_base_only` | Applies the fractional factor to the base only, ignoring the height. | topic_specific | cat_bank | GR.2.7 | GR |  |
| `fractional_factor_applied_to_one_term_only` | Applies the fractional factor to one term of a sum and leaves the remaining term unscaled. | cross_cutting | cat_bank | GR.2.7 | GR | Split out 2026-08-13 from an over-broad tagging rule; see content-fixes-needed.md. |
| `frequency_value_misread` | Misreads a single recorded frequency and computes the total from the wrong value. | topic_specific | cat_bank | PR.1.2 | PR |  |
| `function_notation_as_fraction` | Reads function notation as the function name divided by the input. | topic_specific | cat_bank | AR.1.1 | AR |  |
| `function_notation_as_multiplication` | Reads function notation as a product of the function name and the input. | topic_specific | cat_bank | AR.1.1 | AR |  |
| `function_rule_converse_applied` | Applies the converse of the function rule as its definition. | topic_specific | cat_bank | AR.1.2 | AR |  |
| `gcf_dropped_after_factoring` | Factors the trinomial correctly but omits the extracted common factor from the answer. | topic_specific | cat_bank | AR.3.1 | AR |  |
| `gcf_not_extracted_first` | Factors into binomials without first extracting the greatest common factor. | topic_specific | cat_bank | AR.3.1 | AR |  |
| `gcf_not_greatest` | Factors out a common factor that is not the greatest. | topic_specific | cat_bank | QR.3.8 | QR |  |
| `gcf_written_terms_not_divided` | Writes the greatest common factor outside but copies the original terms inside undivided. | topic_specific | cat_bank | QR.3.8 | QR |  |
| `given_point_not_used` | Writes a quadratic from the intercepts or vertex without using the given point to find the leading coefficient. | topic_specific | cat_bank | AR.3.6 | AR |  |
| `goal_threshold_misread` | Reads a percent-improvement goal as any improvement rather than a threshold. | topic_specific | cat_bank | QR.2.3 | QR |  |
| `graph_type_mismatched_to_variable` | Chooses a display whose requirements the variable type does not meet. | topic_specific | cat_bank | PR.1.5 | PR |  |
| `growth_applied_for_wrong_duration` | Applies the growth or decay for the wrong number of periods. | topic_specific | cat_bank | AR.4.12 | AR |  |
| `growth_decay_factor_direction_wrong` | Builds a growth factor for a decay scenario, or a decay factor for growth. | topic_specific | cat_bank | AR.4.12 | AR |  |
| `half_height_used` | Uses half the height in a volume formula. | topic_specific | cat_bank | GR.2.6 | GR |  |
| `half_of_b_miscomputed` | Takes the wrong value as half the linear coefficient when completing the square. | topic_specific | cat_bank | AR.3.7 | AR |  |
| `halves_the_radicand` | Treats a square root as division by two. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `horizontal_vertical_line_confused` | Writes a vertical line's equation for a horizontal line, or vice versa. | topic_specific | cat_bank | AR.2.6 | AR |  |
| `hybrid_expression_substituted` | Builds a substitution expression by mixing terms from both equations. | topic_specific | cat_bank | AR.2.4 | AR |  |
| `hypotenuse_reported_for_leg` | Reports the hypotenuse where a leg was asked for. | topic_specific | cat_bank | GR.3.2, GR.3.3, GR.3.4 | GR | Merged from GR.3.2 and GR.3.3. |
| `identical_denominators_multiplied` | Treats identical denominators as different and multiplies them. | topic_specific | cat_bank | AR.4.6 | AR |  |
| `identical_lines_read_as_parallel` | Reads proportional equations as parallel with no solution rather than as the same line. | topic_specific | cat_bank | AR.2.4 | AR |  |
| `ignores_unit_coefficient` | Treats a bare variable as if its implied coefficient of 1 were worth nothing. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `inequality_direction_not_flipped` | Fails to reverse the inequality when multiplying or dividing by a negative, or flips it without cause. | cross_cutting | cat_bank | AR.1.5, AR.2.2, AR.2.5, QR.1.8 | AR, QR |  |
| `initial_value_not_subtracted` | Computes the final value and forgets to subtract the initial one. | topic_specific | cat_bank | GR.3.4 | GR |  |
| `injectivity_used_as_function_test` | Applies the one-to-one condition as the test for being a function. | topic_specific | cat_bank | AR.1.2 | AR |  |
| `inner_exponent_raised_not_multiplied` | Raises the inner exponent to the outer power instead of multiplying them. | topic_specific | cat_bank | AR.4.4 | AR |  |
| `input_added_instead_of_rate` | Adds the input value to the previous output instead of the rate of change. | topic_specific | cat_bank | AR.2.3 | AR |  |
| `input_added_to_fee_before_multiplying` | Adds the input to the flat fee before applying the rate. | topic_specific | cat_bank | AR.2.3 | AR |  |
| `input_output_reversed` | Reads a function statement with its input and output roles exchanged. | topic_specific | cat_bank | AR.1.1 | AR |  |
| `intercept_tied_to_nonzero_input` | Ties the intercept's meaning to a specific non-zero input rather than to zero. | topic_specific | cat_bank | QR.3.4 | QR |  |
| `intercepts_compared_instead_of_slopes` | Compares starting values where rates of change were asked for. | topic_specific | cat_bank | QR.3.7 | QR |  |
| `inverse_relationship_treated_as_direct` | Treats an inversely varying factor as though it varied directly. | topic_specific | cat_bank | QR.2.8 | QR |  |
| `inverse_trig_function_mismatched` | Feeds a ratio into the wrong inverse trigonometric function. | topic_specific | cat_bank | GR.3.3 | GR |  |
| `inverts_conversion_direction` | Multiplies where the conversion or scale factor requires division, or vice versa. | cross_cutting | cat_bank | AR.2.1, GR.1.1, GR.2.2, GR.4.2, GR.4.3, QR.2.5, QR.2.6, QR.2.7, QR.4.1 | AR, GR, QR |  |
| `inverts_trig_ratio` | Inverts a trigonometric ratio, placing the wrong side in the numerator. | cross_cutting | cat_bank | GR.3.3, GR.3.4 | GR | Two topics only, but 12 instances and a distinct remediation. |
| `iqr_computed_using_median` | Uses the median in place of a quartile when computing the interquartile range. | topic_specific | cat_bank | PR.2.5 | PR |  |
| `irrational_assumed_larger` | Assumes an irrational value is automatically greater or less than a nearby rational one without estimating it. | topic_specific | cat_bank | QR.1.1 | QR |  |
| `irregular_treated_as_rectangle` | Approximates an irregular figure as a rectangle using two of its dimensions. | topic_specific | cat_bank | GR.2.1 | GR |  |
| `joint_reported_as_conditional` | Reports the joint probability without dividing by the conditioning probability. | topic_specific | cat_bank | PR.3.4 | PR |  |
| `jump_discontinuity_ignored` | Reads a piecewise range as one continuous interval across a jump. | topic_specific | cat_bank | AR.1.3 | AR |  |
| `keyword_mistranslated` | Translates a verbal phrase with the wrong operation. | topic_specific | cat_bank | QR.3.1 | QR |  |
| `larger_exponent_kept` | Keeps the larger of two exponents instead of combining them. | topic_specific | cat_bank | AR.4.2 | AR |  |
| `larger_range_read_as_better` | Treats a larger range as evidence of stronger performance rather than greater variability. | topic_specific | cat_bank | PR.2.4 | PR |  |
| `larger_start_assumed_to_stay_ahead` | Assumes the larger starting value stays ahead regardless of rate. | topic_specific | cat_bank | QR.3.7 | QR |  |
| `largest_perfect_square_not_extracted` | Extracts a perfect-square factor that is not the largest, leaving the radical unsimplified. | topic_specific | cat_bank | AR.4.8 | AR |  |
| `largest_weight_matched_to_largest_score` | Assumes the largest weight belongs to the largest value. | topic_specific | cat_bank | PR.2.2 | PR |  |
| `later_total_used_as_starting_value` | Uses a value at a later input as the starting value instead of back-solving for it. | topic_specific | cat_bank | QR.4.3 | QR |  |
| `lateral_surface_only` | Computes only the lateral surface and omits the bases. | topic_specific | cat_bank | GR.2.5 | GR |  |
| `leading_coefficient_ignored_in_factoring` | Factors a non-monic quadratic as though it were monic. | topic_specific | cat_bank | AR.3.2 | AR |  |
| `leading_coefficient_ignored_in_root` | Reads a root from a factor without dividing by the leading coefficient. | topic_specific | cat_bank | AR.3.3 | AR |  |
| `leading_digit_read_only` | Reads the leading digit of a scale label and drops the remaining place. | topic_specific | cat_bank | GR.1.3 | GR |  |
| `legs_combined_without_squaring` | Adds or subtracts two side lengths directly instead of working with their squares. | topic_specific | cat_bank | GR.3.1, GR.3.3, GR.3.4 | GR | Merged across three GR topics. |
| `less_than_order_reversed` | Writes the terms of a 'less than' phrase in the order they appear in the words. | topic_specific | cat_bank | QR.3.1 | QR |  |
| `line_vs_rotational_symmetry_confused` | Confuses line symmetry with rotational symmetry. | topic_specific | cat_bank | GR.4.4 | GR |  |
| `linear_coefficient_not_halved` | Uses the full linear coefficient as a centre coordinate instead of half of it. | topic_specific | cat_bank | GR.4.5 | GR |  |
| `linear_instead_of_compound` | Applies a rate linearly where compounding is required. | topic_specific | cat_bank | AR.4.11, AR.4.12 | AR | Merged from AR.4.11 (linear decay) and AR.4.12. |
| `linearity_assumed_to_imply_equal_rates` | Assumes two linear relationships must change at the same rate. | topic_specific | cat_bank | QR.3.7 | QR |  |
| `long_division_stopped_early` | Stops the long division before the repeating pattern emerges and records the partial quotient. | topic_specific | cat_bank | QR.1.3 | QR |  |
| `longer_decimal_is_larger` | Judges a decimal larger because it carries more decimal places. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `longest_side_assumed_hypotenuse` | Assumes the largest given number is already the hypotenuse. | topic_specific | cat_bank | GR.3.1 | GR |  |
| `markup_discount_assumed_to_cancel` | Assumes a percent increase followed by an equal percent decrease returns to the original value. | topic_specific | cat_bank | QR.2.3 | QR |  |
| `mean_divisor_miscounted` | Divides the total by the wrong number of values. | topic_specific | cat_bank | PR.2.1 | PR |  |
| `mean_subtracted_from_sum` | Subtracts the mean from the sum of the known values. | topic_specific | cat_bank | PR.2.3 | PR |  |
| `measurement_system_mismatched` | Selects a unit from the wrong measurement system for the context. | topic_specific | cat_bank | GR.1.1 | GR |  |
| `median_from_unsorted_list` | Takes the middle value without sorting the data first. | topic_specific | cat_bank | PR.2.1 | PR |  |
| `metric_prefix_factor_wrong` | Uses the wrong power of ten for a metric prefix conversion. | topic_specific | cat_bank | GR.1.1 | GR |  |
| `midpoint_used_as_estimate` | Defaults to the midpoint between two integers instead of testing which bound the value is nearer. | topic_specific | cat_bank | QR.1.4 | QR |  |
| `misreads_direction_of_change` | Computes a magnitude correctly but labels the direction backward. | cross_cutting | cat_bank | PR.4.1, PR.4.3, QR.2.6, QR.3.4, QR.3.6 | PR, QR |  |
| `missing_value_assumed_equal_to_mean` | Assumes the unknown value equals the mean. | topic_specific | cat_bank | PR.2.3 | PR |  |
| `missing_weight_reused` | Reuses another category's weight in place of an unstated one. | topic_specific | cat_bank | PR.2.2 | PR |  |
| `mixture_reports_total_not_added` | Reports the new total volume rather than the amount added. | topic_specific | cat_bank | QR.2.4 | QR |  |
| `model_fit_assumed_to_transfer` | Assumes a good in-range fit guarantees accuracy outside the data range. | topic_specific | cat_bank | PR.4.4 | PR |  |
| `model_parameters_swapped_between_entities` | Swaps rates or starting values between two modelled entities. | topic_specific | cat_bank | QR.4.3 | QR |  |
| `multiplies_by_denominator_not_conjugate` | Rationalises by multiplying by the denominator itself rather than its conjugate. | topic_specific | cat_bank | QR.1.5 | QR |  |
| `multiplies_by_ten` | Shifts the decimal one place instead of two when converting to a percent. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `multiplies_coefficients` | Multiplies coefficients of like terms instead of adding them. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `multiplies_exponents_wrongly` | Multiplies exponents where the applicable rule requires adding or subtracting them. | cross_cutting | cat_bank | AR.4.10, AR.4.2, AR.4.4 | AR | Split from exponent_rule_confusion per decision 1; renamed per Phase 2 review. |
| `multiplies_instead_of_divides` | Multiplies two quantities where the relationship requires division. | cross_cutting | cat_bank | AR.2.1, AR.4.7, GR.2.1, GR.2.3, GR.2.4, GR.3.2, GR.3.3, GR.3.4, GR.4.3, QR.2.3, QR.2.5 | AR, GR, QR |  |
| `multiplies_variables` | Adds coefficients correctly but also multiplies the variables together. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `negation_without_reciprocal` | Negates the slope but does not take its reciprocal. | topic_specific | cat_bank | AR.2.7 | AR |  |
| `negative_discriminant_read_as_one_root` | Reads a negative discriminant as a single repeated solution. | topic_specific | cat_bank | AR.3.4 | AR |  |
| `negative_exponent_as_negative_value` | Reads a negative exponent as making the value negative rather than as a reciprocal. | topic_specific | cat_bank | AR.4.10, AR.4.11, AR.4.4 | AR | Merged across three AR topics. |
| `negative_not_distributed_across_numerator` | Applies a subtraction to only the first term of the second numerator. | topic_specific | cat_bank | AR.4.6 | AR |  |
| `negative_reverses_radical_order` | Forgets that a negative sign reverses the ordering of radical magnitudes. | topic_specific | cat_bank | QR.1.1 | QR |  |
| `neither_reported_as_both` | Computes the count in neither set and reports it as the count in both. | topic_specific | cat_bank | PR.3.5 | PR | Added in the Phase 3 closeout; PR_A_065.C was previously tagged union_intersection_swapped, but the value is the complement of the union, a third region. |
| `new_mean_from_averaging_means` | Averages the old mean with a new value instead of rebuilding from the total. | topic_specific | cat_bank | PR.2.1 | PR |  |
| `new_over_original_as_change` | Reports the new value as a percent of the original instead of the percent change. | cross_cutting | cat_bank | PR.4.3, QR.2.3, QR.2.8 | PR, QR |  |
| `new_total_divided_by_old_count` | Divides an updated total by the original count. | topic_specific | cat_bank | PR.2.1 | PR |  |
| `no_ratio_applied` | Assumes the given side equals the unknown, applying no special-triangle relationship at all. | topic_specific | cat_bank | GR.3.2 | GR |  |
| `nominal_applied_to_measurement` | Applies an unordered-category term to a measurement variable. | topic_specific | cat_bank | PR.1.5 | PR |  |
| `not_rearranged_to_standard_form` | Reads coefficients from an unrearranged equation as the solutions. | topic_specific | cat_bank | AR.3.3 | AR |  |
| `notch_sides_not_accounted` | Fails to account for the sides added or removed by a notch or cutout. | topic_specific | cat_bank | GR.2.1 | GR |  |
| `numerator_as_percent` | Reports the numerator as the percent, ignoring the denominator. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `numerator_denominator_swap` | Builds a fraction with numerator and denominator exchanged. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `numerator_only_substituted` | Substitutes into the numerator and ignores the denominator. | topic_specific | cat_bank | AR.4.7 | AR |  |
| `numerator_set_equal_to_output` | Sets the numerator equal to the output value, ignoring the denominator. | topic_specific | cat_bank | AR.4.7 | AR |  |
| `numerator_zeros_confused_with_undefined` | Sets the numerator to zero to find where the expression is undefined. | topic_specific | cat_bank | AR.4.5 | AR |  |
| `numerators_added_over_product` | Adds the numerators over the product of the denominators. | topic_specific | cat_bank | PR.3.3 | PR |  |
| `numerators_not_rescaled` | Uses the correct common denominator but does not rescale the numerators. | topic_specific | cat_bank | AR.4.6 | AR |  |
| `off_by_one_count` | Miscounts a tally by one -- loses count, double-counts, or stops one short. | cross_cutting | cat_bank | GR.4.4, PR.1.1, PR.1.2, PR.1.3, PR.3.1, QR.2.6 | GR, PR, QR |  |
| `omits_constant_term` | Computes the variable or rate portion correctly and omits the fixed component (flat fee, intercept, starting value). | cross_cutting | cat_bank | AR.2.3, AR.2.6, GR.2.1, PR.4.2, QR.3.3, QR.3.6, QR.4.1, QR.4.2, QR.4.3 | AR, GR, PR, QR | Boundary with answers_intermediate_value and omits_variable_term is fixed by the approved intermediate_vs_omission rule. |
| `omits_fractional_factor` | Drops the one-half, one-third or four-thirds from an area or volume formula. | cross_cutting | cat_bank | GR.2.3, GR.2.4, GR.2.5, GR.2.6, GR.2.7, GR.3.4 | GR | Narrowed 2026-08-13: previously read '... or applies it twice', which bundled the opposite error. Applying it twice is now applies_fractional_factor_twice. |
| `omits_second_component` | Ignores one part of a composite figure, two-part total or two-stage quantity. | cross_cutting | cat_bank | AR.4.3, GR.2.3, GR.2.5, GR.2.6, PR.3.3, QR.2.1, QR.2.5, QR.2.6 | AR, GR, PR, QR |  |
| `omits_variable_term` | Reports the fixed component of a linear model and omits the variable or rate component. | cross_cutting | cat_bank | AR.2.3, PR.4.2, QR.4.2, QR.4.3 | AR, PR, QR | Approved in the Phase 2 review alongside the intermediate_vs_omission boundary rule. |
| `one_of_two_divisors_omitted` | Divides by only one of the two divisors the formula requires. | topic_specific | cat_bank | GR.2.4 | GR |  |
| `one_point_reported_for_infinite_solutions` | Reports a single valid point as the unique solution of a dependent system. | topic_specific | cat_bank | AR.2.4 | AR |  |
| `only_one_constraint_tested` | Tests a candidate against one inequality of a system and accepts it. | topic_specific | cat_bank | AR.2.5 | AR |  |
| `only_one_equation_checked` | Verifies a candidate against one equation of a system and stops. | topic_specific | cat_bank | AR.2.4 | AR |  |
| `only_one_term_divided_by_gcf` | Divides one term by the greatest common factor and copies the other unchanged. | topic_specific | cat_bank | QR.3.8 | QR |  |
| `opening_direction_rule_reversed` | Associates the sign of the leading coefficient with the wrong kind of extreme point. | topic_specific | cat_bank | AR.3.5 | AR |  |
| `operation_ignored_entirely` | Ignores an operation in the expression and evaluates only the remaining terms. | topic_specific | cat_bank | QR.1.7 | QR |  |
| `opposite_faces_not_doubled` | Sums the distinct face areas without doubling for the opposite pairs. | topic_specific | cat_bank | GR.2.5 | GR |  |
| `optimisation_bound_misused` | Fails to push the free values to their bound when maximising or minimising an unknown. | topic_specific | cat_bank | PR.2.3 | PR |  |
| `order_direction_reversed` | Sorts correctly but delivers the opposite of the requested direction. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `order_of_operations_violated` | Evaluates left to right or applies a lower-priority operation first. | cross_cutting | cat_bank | AR.1.1, AR.2.8, PR.4.2, QR.1.7, QR.3.1 | AR, PR, QR |  |
| `ordering_violation_located_wrongly` | Identifies the wrong position as the ordering error in a sorted list. | topic_specific | cat_bank | PR.1.1 | PR |  |
| `outcome_total_miscounted` | Miscounts the total number of possible outcomes. | topic_specific | cat_bank | PR.3.1 | PR |  |
| `outlier_effect_on_mean_dismissed` | Uses or defends the mean where an outlier makes it unrepresentative. | topic_specific | cat_bank | PR.2.4 | PR |  |
| `outlier_influence_misjudged` | Overstates or denies the effect of a single point on an association. | topic_specific | cat_bank | PR.4.1 | PR |  |
| `outlier_resistance_misjudged` | Misjudges which statistic an outlier affects most. | topic_specific | cat_bank | PR.2.1 | PR |  |
| `output_value_assumed_in_domain` | Treats a value that appears as an output as therefore belonging to the domain, conflating a shared numeric value with membership in the input set. | topic_specific | cat_bank | AR.1.3 | AR | Split out 2026-08-13 from an over-broad tagging rule; see content-fixes-needed.md. |
| `outputs_checked_not_inputs` | Checks whether outputs repeat rather than whether inputs repeat. | topic_specific | cat_bank | AR.1.2 | AR |  |
| `over_cancellation` | Cancels a single factor against more occurrences than the expression contains. | topic_specific | cat_bank | AR.4.5 | AR |  |
| `over_rejects_valid_model` | Rejects a model, survey or inference wholesale rather than naming the specific limitation at issue. | cross_cutting | cat_bank | PR.4.4 | PR | Added in the Phase 3 closeout as the mirror of extrapolates_beyond_data: one error applies a model where it does not hold, the other discards a model that does. Cross-cutting for the same reason decision 3 gave. |
| `overgeneralizes_from_sample` | Treats a sample result as an absolute or population-wide claim. | cross_cutting | cat_bank | PR.1.5, PR.4.1, PR.4.4 | PR |  |
| `overlap_not_subtracted` | Adds two set sizes without subtracting the shared elements. | topic_specific | cat_bank | PR.3.5 | PR |  |
| `overlap_subtracted_twice` | Subtracts the shared elements twice from a union. | topic_specific | cat_bank | PR.3.5 | PR |  |
| `parallel_vs_identical_not_distinguished` | Concludes lines are parallel from equal slopes without checking the intercepts. | topic_specific | cat_bank | AR.2.7 | AR |  |
| `part_whole_confusion` | Treats a part-to-part ratio as a part-to-whole fraction. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `partial_complement_taken` | Takes the complement of only one of two or more groups. | topic_specific | cat_bank | PR.3.2 | PR |  |
| `partial_distribution` | Multiplies the outside factor into only the first term inside the parentheses. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `per_unit_price_as_flat_charge` | Treats a per-unit price as a one-time flat charge. | topic_specific | cat_bank | QR.3.3 | QR |  |
| `percent_applied_forward_not_reversed` | Applies the percent change again instead of undoing it to recover the original. | topic_specific | cat_bank | QR.2.4 | QR |  |
| `percent_applied_to_wrong_stage_base` | Applies a second percent to the wrong stage's base. | topic_specific | cat_bank | QR.2.3 | QR |  |
| `percent_as_count` | Reads n% as one part out of n. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `percent_change_wrong_base` | Divides the change by the new value instead of the original, or applies a percent to the post-change base. | cross_cutting | cat_bank | PR.4.3, QR.2.3, QR.2.4 | PR, QR |  |
| `percent_changes_added` | Treats successive percent changes as additive rather than multiplicative. | cross_cutting | cat_bank | AR.4.12, PR.4.3, QR.2.3, QR.2.4, QR.2.8 | AR, PR, QR |  |
| `percent_decimal_overshift` | Moves the decimal three places instead of two when converting a percent. | cross_cutting | curriculum | PR.4.3 | PR | Existing curriculum slug, reused unchanged. Extended to the CAT bank in Phase 2; PR.4.3 drafted it separately as percent_decimal_misplaced before the merge. |
| `percent_denominator_error` | Writes a percent over 10 instead of over 100. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `percent_sign_confusion` | Treats n% as the whole number n. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `perfect_square_confused_with_unfactorable_sum` | Treats a perfect-square trinomial as an unfactorable sum and concludes there are no real solutions. | topic_specific | cat_bank | AR.3.3 | AR |  |
| `perfect_square_moved_out_unrooted` | Moves a perfect-square factor outside the radical without taking its root. | topic_specific | cat_bank | AR.4.8 | AR |  |
| `perfect_square_vs_difference_of_squares` | Confuses a perfect-square trinomial with a difference of squares. | topic_specific | cat_bank | AR.3.2 | AR |  |
| `perimeter_area_confusion` | Computes perimeter where area was required, or vice versa. | cross_cutting | cat_bank | GR.2.1, GR.2.3, GR.2.4, GR.2.7, GR.3.1 | GR | Kept separate from the other two formula swaps per Phase 1 decision 2. |
| `phantom_term_introduced` | Introduces a term with no basis in the given dimensions. | topic_specific | cat_bank | GR.2.7 | GR |  |
| `pictograph_key_not_applied` | Reads the symbol count directly without applying the key value. | topic_specific | cat_bank | PR.1.3 | PR |  |
| `piecewise_boundary_openness_error` | Mishandles an open or closed boundary at a piecewise seam. | topic_specific | cat_bank | AR.1.3 | AR |  |
| `place_value_slip` | Drops or misplaces a digit's place value in a decimal. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `point_symmetry_wrongly_attributed` | Attributes point symmetry to a polygon whose vertex count prevents it. | topic_specific | cat_bank | GR.4.4 | GR |  |
| `point_y_used_as_intercept` | Uses a given point's output value as the intercept without solving for it. | topic_specific | cat_bank | AR.2.6 | AR |  |
| `polynomial_term_never_carried` | Omits one polynomial's term entirely from the sum. | topic_specific | cat_bank | AR.4.3 | AR |  |
| `prices_swapped_between_quantities` | Attaches each per-unit rate to the wrong quantity. | topic_specific | cat_bank | QR.3.3 | QR |  |
| `prior_reported_ignoring_condition` | Reports the unconditional probability, ignoring the given condition. | topic_specific | cat_bank | PR.3.4 | PR |  |
| `proportion_solved_for_wrong_unknown` | Solves a probability proportion for the wrong unknown. | topic_specific | cat_bank | PR.3.1 | PR |  |
| `proportional_division_step_skipped` | Multiplies the two known quantities without dividing by the third in a proportion. | topic_specific | cat_bank | QR.2.2 | QR |  |
| `pythagorean_triple_assumed` | Assumes a familiar triple applies without verifying it. | topic_specific | cat_bank | GR.3.1 | GR |  |
| `quadratic_formula_denominator_omitted` | Computes the numerator and does not divide by twice the leading coefficient. | topic_specific | cat_bank | AR.3.4 | AR |  |
| `quadratic_formula_partial_division` | Divides only the radical term by the denominator, leaving the rest undivided. | topic_specific | cat_bank | AR.3.4 | AR |  |
| `quadratic_formula_wrong_numerator_sign` | Uses the positive linear coefficient in the quadratic formula numerator instead of its negation. | topic_specific | cat_bank | AR.3.4 | AR |  |
| `quantities_counted_without_rates` | Counts the items but drops the per-unit rates. | topic_specific | cat_bank | QR.3.3 | QR |  |
| `quartile_read_as_median` | Reads a box edge as the median. | topic_specific | cat_bank | PR.2.5 | PR |  |
| `radical_cancelled_as_factor` | Cancels a radical from numerator and denominator as though it were a common factor. | topic_specific | cat_bank | QR.1.5 | QR |  |
| `radical_coefficient_size_as_value` | Treats the radical with the largest coefficient or radicand as the largest value without simplifying. | topic_specific | cat_bank | QR.1.1 | QR |  |
| `radical_dropped_for_coefficient` | Replaces a radical expression with its coefficient alone, dropping the radical. | topic_specific | cat_bank | QR.1.1 | QR |  |
| `radical_endpoint_strictness_error` | Excludes the endpoint of a radical domain where the expression is in fact defined. | topic_specific | cat_bank | AR.1.5 | AR |  |
| `radicand_mistaken_for_value` | Reads the number under the radical as the answer itself. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `radius_diameter_substituted` | Substitutes the radius where the diameter belongs, or vice versa. | topic_specific | cat_bank | GR.2.2 | GR |  |
| `radius_not_squared` | Uses the radius instead of its square in a volume formula. | topic_specific | cat_bank | GR.2.6 | GR |  |
| `radius_squared_confused_with_radius` | Reports the right-hand side as the radius, or the radius where its square belongs. | topic_specific | cat_bank | GR.4.5 | GR |  |
| `range_added_to_wrong_extreme` | Adds the range to the maximum instead of the minimum, or vice versa. | topic_specific | cat_bank | PR.2.3 | PR |  |
| `range_as_endpoints_only` | Lists only the two endpoint outputs instead of the interval between them. | topic_specific | cat_bank | AR.1.3 | AR |  |
| `range_from_known_values_only` | Computes the range from the known values, ignoring that the unknown is a new extreme. | topic_specific | cat_bank | PR.2.3 | PR |  |
| `range_from_single_extreme` | Reports the maximum as the range instead of the difference between the extremes. | cross_cutting | cat_bank | PR.2.1, PR.2.4, PR.2.5 | PR |  |
| `range_read_from_domain_endpoints` | Reads the range endpoints straight off the domain boundaries without applying the function rule. | topic_specific | cat_bank | AR.1.3 | AR | Split out 2026-08-13 from an over-broad tagging rule; see content-fixes-needed.md. |
| `rank_position_error` | Selects the wrong ordinal position when ranking values. | topic_specific | cat_bank | PR.1.4 | PR |  |
| `rate_applied_to_increment_only` | Applies the rate only to the additional amount rather than to the new total. | topic_specific | cat_bank | QR.4.1 | QR |  |
| `rate_assumed_quantity_dependent` | Believes a constant per-unit rate changes with quantity. | topic_specific | cat_bank | QR.3.2 | QR |  |
| `rate_called_the_total` | Describes a per-unit rate as the total amount. | topic_specific | cat_bank | QR.3.4 | QR |  |
| `rate_confused_with_variable` | Describes the coefficient as a count of the variable's units. | topic_specific | cat_bank | QR.3.4 | QR |  |
| `rate_not_normalised_to_unit` | Compares rates stated over different unit sizes without normalising them. | topic_specific | cat_bank | QR.3.2 | QR |  |
| `rate_used_as_factor` | Uses the rate itself as the multiplier, omitting the one it must be added to or subtracted from. | topic_specific | cat_bank | AR.4.12 | AR |  |
| `rates_added_instead_of_netted` | Adds an inflow and an outflow rate instead of subtracting to find the net. | topic_specific | cat_bank | QR.2.6 | QR |  |
| `rates_merged_into_single_rate` | Combines two different per-unit rates into one and applies it to everything. | topic_specific | cat_bank | QR.3.3 | QR |  |
| `rates_summed_instead_of_differenced` | Adds two rates where their difference was required. | topic_specific | cat_bank | QR.3.7 | QR |  |
| `ratio_numerator_as_side_length` | Reads the numerator of a trigonometric ratio as a literal side length. | topic_specific | cat_bank | GR.3.3 | GR |  |
| `ratio_parts_reported_in_answer_units` | Reports the count of ratio parts as the answer quantity. | topic_specific | cat_bank | QR.2.1 | QR |  |
| `ratio_term_as_value` | Reads a term of the ratio as the actual quantity, ignoring scaling. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `ratio_terms_multiplied` | Multiplies the two terms of a ratio together instead of partitioning by them. | topic_specific | cat_bank | QR.2.1 | QR |  |
| `rational_and_irrational_merged` | Merges a rational and an irrational term under a single radical sign. | topic_specific | cat_bank | QR.1.5 | QR |  |
| `rationalisation_applied_to_one_part` | Multiplies only the numerator or only the denominator when rationalising. | topic_specific | cat_bank | AR.4.8 | AR |  |
| `raw_coefficients_compared` | Compares coefficients of unconverted equations to judge parallelism or perpendicularity. | topic_specific | cat_bank | AR.2.7 | AR |  |
| `reads_adjacent_value` | Reads the neighbouring tick, bar, row or column instead of the one asked for. | cross_cutting | cat_bank | GR.1.3, PR.1.3, PR.1.4, PR.2.5, QR.3.6 | GR, PR, QR |  |
| `reads_wrong_category` | Reads the right kind of value from the wrong labelled group. | cross_cutting | cat_bank | PR.1.3, PR.1.4, PR.2.4 | PR |  |
| `reciprocal_without_negation` | Takes the reciprocal of the slope but does not negate it. | topic_specific | cat_bank | AR.2.7 | AR |  |
| `refuses_to_compare_forms` | Believes a fraction, decimal or percent cannot be compared without a common form. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `relative_speed_ignored` | Uses one object's speed instead of the closing or relative speed in a catch-up problem. | topic_specific | cat_bank | QR.2.2 | QR |  |
| `repeated_output_excludes_input` | Excludes an input because its output duplicates one already produced, treating a repeated output as disqualifying. | topic_specific | cat_bank | AR.1.3 | AR | Split out 2026-08-13 from an over-broad tagging rule; see content-fixes-needed.md. |
| `repeating_block_denominator_wrong` | Uses the wrong power-of-nine denominator for the length of the repeating block. | topic_specific | cat_bank | QR.1.3 | QR |  |
| `repeating_block_misidentified` | Applies the pure-repeating rule to digits that are not the repeating block. | topic_specific | cat_bank | QR.1.3 | QR |  |
| `replacement_status_wrong` | Treats draws as with replacement when they are not, or vice versa. | topic_specific | cat_bank | PR.3.3 | PR |  |
| `reports_discount_not_price` | Computes the discount correctly but reports it instead of the final price. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `reports_event_not_complement` | Reports the probability of the event where its complement was asked for, or omits the final subtraction from one. | cross_cutting | cat_bank | PR.3.2, PR.3.3, PR.3.5 | PR |  |
| `reports_wrong_center_measure` | Reports one measure of centre where another was asked for. | cross_cutting | cat_bank | PR.2.1, PR.2.2, PR.2.4, PR.2.5 | PR |  |
| `restriction_read_from_simplified_form` | Reads the domain restriction from the simplified expression, missing the cancelled factor's exclusion. | topic_specific | cat_bank | AR.4.5 | AR | Survivor of the #88 retirement: cancellation_assumed_to_restore_domain named the same student error from the other side and was retired into this slug. Topics stays AR.4.5 only. The AR.1.5 CAT item now tagged against it (AR_A_010.B) is recorded in cat_topics_observed, which is computed from the bank; adding AR.1.5 here would assert a curriculum pre-assignment that no AR.1.5 item uses. |
| `result_doubled_twice` | Applies the correct formula and then doubles the result again. | topic_specific | cat_bank | GR.2.2 | GR |  |
| `reverse_causation_asserted` | Asserts the reverse causal direction as established fact. | topic_specific | cat_bank | PR.4.4 | PR |  |
| `reversed_division` | Computes b divided by a where a divided by b was required. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `rigid_motion_treated_as_dilation` | Believes a translation, rotation or reflection changes the figure's size. | topic_specific | cat_bank | GR.4.2 | GR |  |
| `rise_reported_as_rate` | Computes the change in the output and reports it without dividing by the change in the input. | topic_specific | cat_bank | QR.3.6 | QR |  |
| `rotation_angle_reported_for_order` | Reports the smallest angle of rotation instead of the order of symmetry. | topic_specific | cat_bank | GR.4.4 | GR |  |
| `rounding_as_increment_rightmost` | Treats rounding as incrementing the rightmost digit while keeping all places. | topic_specific | cat_bank | QR.1.6 | QR |  |
| `rounding_hides_difference` | Rounds two values and concludes they are equal. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `rounds_down_despite_five_or_more` | Rounds down although the reference digit is five or greater. | topic_specific | cat_bank | QR.1.6 | QR |  |
| `rounds_to_bounding_integer` | Rounds to a bounding perfect-square root without refining further. | topic_specific | cat_bank | QR.1.4 | QR |  |
| `rounds_to_wrong_place` | Rounds to a different place value than the one requested. | topic_specific | cat_bank | QR.1.6 | QR |  |
| `rounds_too_early` | Rounds before converting or completing the computation, losing the exact value. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `rounds_up_where_floor_required` | Rounds a quotient up when the constraint that produced it makes only the whole units below it attainable. | topic_specific | cat_bank | QR.2.1 | QR | Added in the Phase 3 closeout; QR_A_035.C was previously tagged off_by_one_count, which describes a tally slip rather than rounding against a constraint. |
| `row_gaps_counted_as_change` | Divides by the number of listed rows instead of the actual change in the input. | topic_specific | cat_bank | QR.3.6 | QR |  |
| `row_total_used_for_column_total` | Uses a row total as the denominator where the column total was required, or vice versa. | topic_specific | cat_bank | PR.1.4 | PR |  |
| `run_reported_as_rate` | Reports the change in the input as the rate. | topic_specific | cat_bank | QR.3.6 | QR |  |
| `scale_factor_direction_reversed` | Computes the scale factor from image to preimage instead of preimage to image. | topic_specific | cat_bank | GR.4.3 | GR |  |
| `scales_by_wrong_ratio_term` | Finds the unit value correctly but multiplies by the wrong ratio term. | topic_specific | cat_bank | QR.2.1 | QR |  |
| `scatter_read_as_no_association` | Concludes no association exists because the points do not fall exactly on a line. | topic_specific | cat_bank | PR.4.1 | PR |  |
| `sequence_stopped_early` | Multiplies the first stages and stops before the last. | topic_specific | cat_bank | PR.3.3 | PR |  |
| `set_listed_as_multiset` | Repeats a value in a set rather than listing each element once. | topic_specific | cat_bank | AR.1.3 | AR |  |
| `shared_interface_not_removed` | Adds two solids' full surface areas without removing the shared interface. | topic_specific | cat_bank | GR.2.5 | GR |  |
| `shift_applied_to_wrong_axis` | Applies a horizontal shift to the range or a vertical shift to the domain. | topic_specific | cat_bank | AR.1.3 | AR |  |
| `short_long_leg_roles_confused` | Treats the long leg as the short leg, or vice versa, in a thirty-sixty-ninety triangle. | topic_specific | cat_bank | GR.3.2 | GR |  |
| `side_count_subtracted_from_perimeter` | Subtracts the number of sides from the perimeter instead of dividing by it. | topic_specific | cat_bank | GR.2.1 | GR |  |
| `side_omitted_from_perimeter` | Omits one side from the sum when computing a perimeter. | topic_specific | cat_bank | GR.2.1, GR.3.1 | GR | Merged from GR.2.1 and GR.3.1 (drafted there as computed_side_omitted_from_perimeter). |
| `sign_error_on_constant` | Flips the sign of a constant while moving it across the equals sign or collecting like terms. | cross_cutting | cat_bank | AR.1.5, AR.2.1, AR.2.3, AR.2.7, AR.3.5, AR.3.6, AR.4.3, GR.2.7, PR.4.2, QR.3.1, QR.3.5 | AR, GR, PR, QR | Distinct from drops_negative_sign: dropping yields the magnitude, flipping yields a wrong-signed value. |
| `sign_of_first_term_kept` | Combines like terms but keeps the sign of the first term regardless of the operation. | topic_specific | cat_bank | AR.4.1 | AR |  |
| `sign_wrong_for_decreasing_rate` | Writes a positive rate for a draining or decreasing quantity. | topic_specific | cat_bank | QR.4.3 | QR |  |
| `single_cell_read_where_sum_needed` | Reads one cell where two or more must be summed. | topic_specific | cat_bank | PR.1.4 | PR |  |
| `single_period_counted` | Counts only one period's change in a multi-period percent change. | topic_specific | cat_bank | PR.4.3 | PR |  |
| `single_segment_used_for_whole` | Uses one segment's or one worker's rate for the entire task. | topic_specific | cat_bank | QR.2.5 | QR |  |
| `single_stage_reported` | Reports one stage's probability as the compound probability. | topic_specific | cat_bank | PR.3.3 | PR |  |
| `single_violation_dismissed` | Concludes a relation is a function because most inputs appear only once. | topic_specific | cat_bank | AR.1.2 | AR |  |
| `skew_direction_misread` | Infers the wrong direction of skew from the relationship between mean and median. | topic_specific | cat_bank | PR.2.4 | PR |  |
| `skips_times_100` | Converts to a decimal, then attaches a percent sign without multiplying by 100. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `slant_height_used_for_perpendicular` | Uses a slant side where the perpendicular height was required. | topic_specific | cat_bank | GR.2.3 | GR |  |
| `slope_denominator_summed` | Adds the input values in the slope denominator instead of subtracting them. | topic_specific | cat_bank | PR.4.2 | PR |  |
| `slope_intercept_swap` | Assigns the slope's value to the intercept and the intercept's to the slope, including in verbal interpretation. | cross_cutting | cat_bank | AR.2.6, PR.4.2, QR.3.2, QR.3.4, QR.4.3 | AR, PR, QR |  |
| `slope_numerator_summed` | Adds the output values in the slope numerator instead of subtracting them. | topic_specific | cat_bank | PR.4.2 | PR |  |
| `slope_run_over_rise` | Computes the change in x over the change in y instead of the change in y over the change in x. | cross_cutting | cat_bank | AR.2.5, AR.2.6, PR.4.2, QR.3.2, QR.3.6, QR.3.7 | AR, PR, QR | Kept separate from reversed_division: the remediation conversation differs. |
| `slope_value_written_as_equation` | Reports the slope value as though it were the equation of the line. | topic_specific | cat_bank | AR.2.6 | AR |  |
| `snaps_to_labelled_tick` | Reads the nearest labelled tick instead of interpolating to an unlabelled position. | topic_specific | cat_bank | GR.1.3 | GR |  |
| `space_diagonal_stopped_at_base` | Finds the base diagonal and stops without continuing to the space diagonal. | topic_specific | cat_bank | GR.3.1 | GR |  |
| `special_angle_family_wrong` | Uses a ratio from the wrong special-angle family. | topic_specific | cat_bank | GR.3.3 | GR |  |
| `special_factor_applied_to_wrong_part` | Applies a special-triangle factor to the wrong segment. | topic_specific | cat_bank | GR.3.4 | GR |  |
| `special_ratio_multiplied_not_divided` | Multiplies by a special-triangle ratio where division was required, or vice versa. | topic_specific | cat_bank | GR.3.2 | GR |  |
| `special_triangle_factor_swapped` | Uses the factor from one special right triangle in the other. | topic_specific | cat_bank | GR.3.2 | GR |  |
| `speeds_averaged_arithmetically` | Averages two segment speeds instead of dividing total distance by total time. | topic_specific | cat_bank | QR.2.5 | QR |  |
| `squares_before_isolating` | Squares both sides before isolating the radical. | topic_specific | cat_bank | AR.4.9 | AR |  |
| `squares_instead_of_roots` | Runs the operation backward, squaring where a root was required. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `squaring_confused_with_doubling` | Computes twice a quantity where its square was required, or vice versa. | cross_cutting | cat_bank | AR.4.10, AR.4.11, AR.4.9, GR.2.2, QR.1.7 | AR, GR, QR |  |
| `starting_values_summed_not_differenced` | Adds two starting values instead of setting the expressions equal. | topic_specific | cat_bank | QR.4.3 | QR |  |
| `steepness_confused_with_strength` | Judges strength by the steepness of the trend rather than by how tightly the points cluster. | topic_specific | cat_bank | PR.4.1 | PR |  |
| `stops_before_simplifying` | Reaches a correct but unreduced form and stops. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `strength_confused_with_direction` | Treats the direction of an association as determining its strength. | topic_specific | cat_bank | PR.4.1 | PR |  |
| `study_design_confused_with_causal_evidence` | Treats an observational or self-selected design as establishing cause. | topic_specific | cat_bank | PR.4.4 | PR |  |
| `subdivision_count_miscomputed` | Miscounts how many equal parts the unlabelled marks create. | topic_specific | cat_bank | GR.1.3 | GR |  |
| `substitution_comparison_misread` | Substitutes correctly but reads the resulting comparison backwards. | topic_specific | cat_bank | AR.2.5 | AR |  |
| `subtracts_exponents_wrongly` | Subtracts exponents where the applicable rule requires adding or multiplying them. | cross_cutting | cat_bank | AR.4.10, AR.4.4 | AR | Split from exponent_rule_confusion per decision 1; renamed per Phase 2 review. |
| `subtracts_in_wrong_order` | Computes b minus a where a minus b was required. | cross_cutting | cat_bank | AR.2.2, AR.4.10, AR.4.4, AR.4.6, AR.4.7, GR.3.4, PR.1.1, PR.1.3, PR.1.4, QR.3.1, QR.3.6 | AR, GR, PR, QR |  |
| `sum_of_bases_reported_as_one_base` | Reports the sum of two bases where a single base was asked for. | topic_specific | cat_bank | GR.2.4 | GR |  |
| `symmetric_partner_misidentified` | Identifies the axis of symmetry itself rather than the symmetric partner input. | topic_specific | cat_bank | AR.1.1 | AR |  |
| `symmetry_axes_double_counted` | Counts each axis of symmetry twice, once in each direction. | topic_specific | cat_bank | GR.4.4 | GR |  |
| `symmetry_axes_undercounted` | Finds some of a figure's axes of symmetry and misses the rest. | topic_specific | cat_bank | GR.4.4 | GR |  |
| `target_weight_not_divided_out` | Subtracts the known contributions from the target but does not divide by the unknown's weight. | topic_specific | cat_bank | PR.2.2 | PR |  |
| `temperature_offset_omitted` | Omits the additive offset from a temperature conversion formula. | topic_specific | cat_bank | QR.2.7 | QR |  |
| `tendency_stated_as_absolute` | Converts an average tendency into an absolute claim about every individual. | topic_specific | cat_bank | PR.4.4 | PR |  |
| `term_level_cancellation` | Cancels a term from numerator and denominator without factoring first. | topic_specific | cat_bank | AR.4.5 | AR |  |
| `terminating_test_confusion` | Applies a false rule for deciding whether a fraction terminates or repeats. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `terms_of_different_degree_combined` | Combines terms of different degree into one. | topic_specific | cat_bank | AR.4.3 | AR |  |
| `threshold_boundary_error` | Counts with an inclusive threshold where an exclusive one was required, or vice versa. | topic_specific | cat_bank | PR.1.1, PR.1.3, PR.3.1 | PR | Merged across three PR topics. |
| `tier_rates_reversed` | Applies tiered rates to the wrong tiers. | topic_specific | cat_bank | QR.4.1 | QR |  |
| `times_added_instead_of_rates_combined` | Adds individual completion times instead of combining rates. | topic_specific | cat_bank | QR.2.5 | QR |  |
| `total_accepted_without_verifying` | Accepts a stated total without computing it from the data. | topic_specific | cat_bank | PR.1.2, PR.1.3 | PR | Merged from PR.1.2 and PR.1.3. |
| `total_change_used_as_rate` | Uses the total change as the rate without dividing by the interval. | topic_specific | cat_bank | QR.4.3 | QR |  |
| `total_from_wrong_count` | Multiplies the mean by the count of known values rather than by all values. | topic_specific | cat_bank | PR.2.3 | PR |  |
| `total_not_reduced_between_draws` | Reduces the favourable count between draws but keeps the total unchanged. | topic_specific | cat_bank | PR.3.3 | PR |  |
| `transformation_misidentified_from_coordinates` | Picks a transformation whose rule does not map the given preimage to the image. | topic_specific | cat_bank | GR.4.2 | GR |  |
| `transformation_shift_direction_reversed` | Reverses the direction of a horizontal or vertical shift. | topic_specific | cat_bank | AR.3.6, AR.3.7 | AR | Merged from AR.3.6 and AR.3.7. |
| `translation_direction_reversed` | Adds where the translation subtracts, or subtracts where it adds. | topic_specific | cat_bank | GR.4.1 | GR |  |
| `trig_side_roles_misassigned` | Assigns opposite, adjacent or hypotenuse to the wrong sides. | topic_specific | cat_bank | GR.3.3 | GR |  |
| `triple_overlap_not_added_back` | Subtracts the pairwise overlaps without adding back the triple overlap. | topic_specific | cat_bank | PR.3.5 | PR |  |
| `truncates_repeating_decimal` | Chops a repeating decimal to a finite number of places. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `two_middles_not_averaged` | Takes one of the two middle values instead of averaging them. | topic_specific | cat_bank | PR.2.1 | PR |  |
| `two_step_rounding_assumed_equal` | Assumes rounding in two steps gives the same result as rounding directly. | topic_specific | cat_bank | QR.1.6 | QR |  |
| `union_intersection_swapped` | Reports the union where the intersection was asked for, or vice versa. | topic_specific | cat_bank | PR.3.5 | PR |  |
| `unit_magnitude_mismatched` | Selects a unit of the right category but of wildly wrong magnitude for the context. | topic_specific | cat_bank | GR.1.1 | GR |  |
| `unrelated_cells_compared` | Compares two cells with no meaningful relationship to the question. | topic_specific | cat_bank | PR.1.4 | PR |  |
| `unwarranted_domain_restriction_added` | Adds a domain restriction the inequality does not imply. | topic_specific | cat_bank | AR.2.5 | AR |  |
| `uses_wrong_total` | Divides by a part rather than by the whole. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `valid_root_discarded_as_extraneous` | Discards a valid root on the assumption that one must be extraneous. | topic_specific | cat_bank | AR.4.9 | AR |  |
| `values_assumed_preordered` | Assumes the values are already listed in order and answers with the given sequence. | topic_specific | cat_bank | QR.1.2 | QR |  |
| `variable_term_read_as_rate` | Reports the whole variable term rather than isolating its coefficient. | topic_specific | cat_bank | QR.3.2 | QR |  |
| `vertex_form_h_read_literally` | Takes the number inside the parentheses as the vertex coordinate without flipping its sign. | topic_specific | cat_bank | AR.3.5 | AR |  |
| `vertical_angles_given_a_sum_rule` | Applies a fixed-sum rule to vertical angles, which are defined by equality. | topic_specific | cat_bank | GR.1.2 | GR |  |
| `vertical_angles_treated_as_supplementary` | Treats vertical angles as summing to a straight angle rather than being equal. | topic_specific | cat_bank | GR.1.2 | GR |  |
| `vertical_line_test_misapplied` | Invents a false rule about how vertical lines meet a graph. | topic_specific | cat_bank | AR.1.2 | AR |  |
| `volume_surface_area_confusion` | Computes volume where surface area was required, or vice versa. | cross_cutting | cat_bank | GR.2.5, GR.2.6 | GR | Kept separate per decision 2. |
| `weights_ignored` | Takes a simple unweighted mean where weights were given. | topic_specific | cat_bank | PR.2.2 | PR |  |
| `weights_swapped` | Exchanges the weights between categories. | topic_specific | cat_bank | PR.2.2 | PR |  |
| `whisker_length_as_typical_value` | Judges the typical value by whisker length rather than by the median. | topic_specific | cat_bank | PR.2.5 | PR |  |
| `whole_population_as_denominator` | Uses the whole population as the denominator instead of the conditioning group. | topic_specific | cat_bank | PR.3.4 | PR |  |
| `wrong_fractional_divisor_used` | Divides by a number other than the one the formula requires, rather than omitting the factor. | cross_cutting | cat_bank | GR.2.6 | GR | Split out 2026-08-13 from an over-broad tagging rule; see content-fixes-needed.md. |
| `wrong_interval_selected` | Computes the rate over a different interval than the one asked for. | topic_specific | cat_bank | QR.3.6 | QR |  |
| `wrong_inverse_operation_chosen` | Undoes an operation with the wrong inverse when isolating a variable. | topic_specific | cat_bank | AR.2.8 | AR |  |
| `wrong_measurement_category` | Selects a unit from the wrong measurement category entirely. | topic_specific | cat_bank | GR.1.1 | GR |  |
| `wrong_perfect_square_bracket` | Brackets a radicand between the wrong pair of perfect squares. | cross_cutting | curriculum |  |  | Existing curriculum slug, reused unchanged. |
| `wrong_period_count_used` | Uses the wrong number of periods, units or people in the computation. | topic_specific | cat_bank | QR.4.2 | QR |  |
| `wrong_quantity_grouped` | Applies a grouping to the wrong part of the expression. | topic_specific | cat_bank | QR.3.1 | QR |  |
| `wrong_reference_digit` | Uses the digit in the wrong place to decide whether to round up. | topic_specific | cat_bank | QR.1.6 | QR |  |
| `wrong_reflection_axis` | Reflects over the wrong axis or line. | topic_specific | cat_bank | GR.4.1 | GR |  |
| `wrong_rotation_rule` | Applies the rule for a different rotation angle or direction. | topic_specific | cat_bank | GR.4.1 | GR |  |
| `wrong_side_count_for_polygon` | Multiplies a side length by the wrong number of sides for the named polygon. | topic_specific | cat_bank | GR.2.1 | GR |  |
| `wrong_side_shaded` | Identifies the boundary correctly but shades the wrong side. | topic_specific | cat_bank | AR.2.5 | AR |  |
| `wrong_sign_on_factor` | Uses the correct magnitudes in a factored form but assigns the wrong sign to one or both factors. | cross_cutting | cat_bank | AR.3.1, AR.3.2, AR.3.3, AR.3.6, AR.4.5, AR.4.9 | AR |  |
| `wrong_time_point_read` | Reads the value at a different time point than the one asked for. | topic_specific | cat_bank | PR.1.3 | PR |  |
| `wrong_trig_ratio_selected` | Uses one trigonometric ratio where another was required. | topic_specific | cat_bank | GR.3.3 | GR |  |
| `zero_dropped_as_no_data` | Treats a zero value as missing data and excludes it. | topic_specific | cat_bank | PR.2.1 | PR |  |
| `zero_exponent_as_zero` | Evaluates a zero exponent as zero. | topic_specific | cat_bank | AR.4.10 | AR |  |
| `zero_numerator_treated_as_undefined` | Treats a zero numerator as producing an undefined output. | topic_specific | cat_bank | AR.1.5 | AR |  |
| `zero_second_differences_read_as_quadratic` | Reads constant zero second differences as quadratic rather than linear. | topic_specific | cat_bank | AR.1.4 | AR |  |
