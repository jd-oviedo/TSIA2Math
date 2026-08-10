# Misconception Taxonomy — human-readable companion

> **Generated file — do not edit.** Source of truth is `data/docs/misconception_taxonomy.json`,
> built by `scripts/build_misconception_taxonomy.py`. Edit the script, then regenerate.

Status: `draft_phase2_awaiting_approval`

| | count |
|---|---:|
| total slugs | 475 |
| cross cutting | 85 |
| cross cutting from curriculum | 40 |
| cross cutting new | 45 |
| topic specific | 390 |
| proposed pending decision | 0 |
| topics covered | 97 |

## Boundary rules

### `intermediate_vs_omission` — **approved**

- Slugs: `answers_intermediate_value`, `omits_constant_term`, `omits_variable_term`
- Phase 1 proposal: Stopped mid-procedure -> answers_intermediate_value; procedure completed but the constant was never in it -> omits_constant_term.
- Problem with it: Does not break the tie for 'computes the rate portion and forgets the flat fee', which reads as both; and has no home for the mirror case where the variable term is the one missing.
- Phase 2 proposal: Tag by what is missing from the answer, not by where the student stopped. Missing fixed component -> omits_constant_term. Missing variable component -> omits_variable_term. A correct intermediate quantity of a different kind (scale factor, unit rate, pre-division sum, count of parts) -> answers_intermediate_value. Tie-break: if the reported value is one of the two additive components of a linear model it is an omits_* tag, never answers_intermediate_value.
- **Resolution: Approved as the phase2_proposal, tie-break included. omits_variable_term is an approved slug.**

## Retired slugs

Removed from the vocabulary. Listed so a reader of this file does not
conclude they are still taggable.

| slug | superseded by | items retagged | why |
|---|---|---:|---|
| `conditions_on_wrong_group` | `whole_population_as_denominator`, `conditional_reversed` | 0 | The two survivors are the clearer names: they say which wrong group was used (the whole population) or that the conditional was inverted. The umbrella name said neither. It carried 0 tags. |
| `ignores_without_replacement` | `replacement_status_wrong`, `total_not_reduced_between_draws` | 0 | The survivors separate treating the draws as the wrong kind from reducing the favourable count but not the total -- a distinction the umbrella name lost. It carried 0 tags. |

## Phase 3 findings

| finding | status |
|---|---|
| unused curriculum slugs | `—` |
| redundant slug pairs | `resolved_in_phase3_closeout` |
| migration followups | `required_but_out_of_scope_for_phase3` |

## Cross-cutting slugs

### Reused from the curriculum vocabulary

| slug | definition | strands | topics | notes |
|---|---|---|---:|---|
| `adds_instead_of_scales` | Sees an additive gain in one quantity and adds that same amount to the paired quantity instead of applying the multiplicative scale factor. | — | 0 | Existing curriculum slug, reused unchanged. |
| `adds_instead_of_subtracts` | Combines terms with addition where the expression calls for subtraction. | — | 0 | Existing curriculum slug, reused unchanged. |
| `answers_intermediate_value` | Computes a correct intermediate quantity and reports it as the final answer instead of continuing. | — | 0 | Existing curriculum slug, reused unchanged. |
| `closer_endpoint_error` | Judges which perfect square a radicand is nearer to, and picks the wrong one. | — | 0 | Existing curriculum slug, reused unchanged. |
| `combines_unlike_terms` | Treats terms with different variables or degrees as like terms and merges their coefficients. | — | 0 | Existing curriculum slug, reused unchanged. |
| `drops_negative_on_group` | Applies a leading minus to only the first term of a parenthesised group. | — | 0 | Existing curriculum slug, reused unchanged. |
| `drops_negative_sign` | Ignores a minus sign and reports the magnitude. | — | 0 | Existing curriculum slug, reused unchanged. |
| `drops_unlike_term` | Combines the like terms correctly, then discards the leftover unpaired term. | — | 0 | Existing curriculum slug, reused unchanged. |
| `drops_variable` | Combines coefficients correctly but writes a bare number, losing the variable. | — | 0 | Existing curriculum slug, reused unchanged. |
| `fraction_digit_gluing` | Reads the digits of a fraction straight off as a decimal or percent (3/5 as 0.35 or 35%). | — | 0 | Existing curriculum slug, reused unchanged. |
| `halves_the_radicand` | Treats a square root as division by two. | — | 0 | Existing curriculum slug, reused unchanged. |
| `ignores_unit_coefficient` | Treats a bare variable as if its implied coefficient of 1 were worth nothing. | — | 0 | Existing curriculum slug, reused unchanged. |
| `longer_decimal_is_larger` | Judges a decimal larger because it carries more decimal places. | — | 0 | Existing curriculum slug, reused unchanged. |
| `multiplies_by_ten` | Shifts the decimal one place instead of two when converting to a percent. | — | 0 | Existing curriculum slug, reused unchanged. |
| `multiplies_coefficients` | Multiplies coefficients of like terms instead of adding them. | — | 0 | Existing curriculum slug, reused unchanged. |
| `multiplies_variables` | Adds coefficients correctly but also multiplies the variables together. | — | 0 | Existing curriculum slug, reused unchanged. |
| `numerator_as_percent` | Reports the numerator as the percent, ignoring the denominator. | — | 0 | Existing curriculum slug, reused unchanged. |
| `numerator_denominator_swap` | Builds a fraction with numerator and denominator exchanged. | — | 0 | Existing curriculum slug, reused unchanged. |
| `order_direction_reversed` | Sorts correctly but delivers the opposite of the requested direction. | — | 0 | Existing curriculum slug, reused unchanged. |
| `part_whole_confusion` | Treats a part-to-part ratio as a part-to-whole fraction. | — | 0 | Existing curriculum slug, reused unchanged. |
| `partial_distribution` | Multiplies the outside factor into only the first term inside the parentheses. | — | 0 | Existing curriculum slug, reused unchanged. |
| `percent_as_count` | Reads n% as one part out of n. | — | 0 | Existing curriculum slug, reused unchanged. |
| `percent_decimal_overshift` | Moves the decimal three places instead of two when converting a percent. | PR | 1 | Existing curriculum slug, reused unchanged. Extended to the CAT bank in Phase 2; PR.4.3 drafted it separately as percent_decimal_misplaced before the merge. |
| `percent_denominator_error` | Writes a percent over 10 instead of over 100. | — | 0 | Existing curriculum slug, reused unchanged. |
| `percent_sign_confusion` | Treats n% as the whole number n. | — | 0 | Existing curriculum slug, reused unchanged. |
| `place_value_slip` | Drops or misplaces a digit's place value in a decimal. | — | 0 | Existing curriculum slug, reused unchanged. |
| `radicand_mistaken_for_value` | Reads the number under the radical as the answer itself. | — | 0 | Existing curriculum slug, reused unchanged. |
| `ratio_term_as_value` | Reads a term of the ratio as the actual quantity, ignoring scaling. | — | 0 | Existing curriculum slug, reused unchanged. |
| `refuses_to_compare_forms` | Believes a fraction, decimal or percent cannot be compared without a common form. | — | 0 | Existing curriculum slug, reused unchanged. |
| `reports_discount_not_price` | Computes the discount correctly but reports it instead of the final price. | — | 0 | Existing curriculum slug, reused unchanged. |
| `reversed_division` | Computes b divided by a where a divided by b was required. | — | 0 | Existing curriculum slug, reused unchanged. |
| `rounding_hides_difference` | Rounds two values and concludes they are equal. | — | 0 | Existing curriculum slug, reused unchanged. |
| `rounds_too_early` | Rounds before converting or completing the computation, losing the exact value. | — | 0 | Existing curriculum slug, reused unchanged. |
| `skips_times_100` | Converts to a decimal, then attaches a percent sign without multiplying by 100. | — | 0 | Existing curriculum slug, reused unchanged. |
| `squares_instead_of_roots` | Runs the operation backward, squaring where a root was required. | — | 0 | Existing curriculum slug, reused unchanged. |
| `stops_before_simplifying` | Reaches a correct but unreduced form and stops. | — | 0 | Existing curriculum slug, reused unchanged. |
| `terminating_test_confusion` | Applies a false rule for deciding whether a fraction terminates or repeats. | — | 0 | Existing curriculum slug, reused unchanged. |
| `truncates_repeating_decimal` | Chops a repeating decimal to a finite number of places. | — | 0 | Existing curriculum slug, reused unchanged. |
| `uses_wrong_total` | Divides by a part rather than by the whole. | — | 0 | Existing curriculum slug, reused unchanged. |
| `wrong_perfect_square_bracket` | Brackets a radicand between the wrong pair of perfect squares. | — | 0 | Existing curriculum slug, reused unchanged. |

### New, introduced for the CAT bank

| slug | definition | strands | topics | notes |
|---|---|---|---:|---|
| `absolute_change_as_percent` | Reports the raw difference as if it were the percent change. | PR QR | 2 |  |
| `adds_exponents_wrongly` | Adds exponents where the applicable rule requires multiplying or subtracting them. | AR | 4 | Split from exponent_rule_confusion per decision 1; renamed per Phase 2 review so the name covers every displaced rule, not just the power rule. |
| `adds_probabilities_instead_of_multiplying` | Adds the stage probabilities of a compound event instead of multiplying them. | PR | 2 |  |
| `binomial_square_middle_term_omitted` | Expands a squared binomial as the sum of the squared terms, omitting the middle term. | AR GR | 4 | MERGED in Phase 2 from three separately-drafted topic slugs (AR.3.7, AR.4.2, AR.4.9) plus GR.2.7. |
| `causation_from_association` | Reads an observed association as an established causal claim, in either direction. | PR | 1 | Single topic today; classified cross-cutting per Phase 1 decision 3 so future inference items need no re-touch. |
| `center_spread_confusion` | Uses a measure of centre to judge spread, or a measure of spread to judge centre. | PR | 3 |  |
| `circumference_area_confusion` | Uses a circle's area formula where circumference was required, or vice versa. | GR | 3 | Kept separate per decision 2. |
| `coordinates_swapped` | Writes an ordered pair with its coordinates exchanged. | AR GR | 5 |  |
| `divides_instead_of_multiplies` | Divides where the relationship requires multiplication. | AR GR QR | 8 |  |
| `double_negative_mishandled` | Treats subtracting a negative as subtraction, or a double negation as a single one. | AR QR | 3 |  |
| `drops_grouping_symbols` | Ignores parentheses as a grouping symbol entirely. | QR | 3 |  |
| `extrapolates_beyond_data` | Applies a model outside the range the data support. | PR | 1 | Single topic today; cross-cutting per decision 3. |
| `false_radical_distribution` | Applies a false distributive rule to radicals, or combines radicands where the operation does not permit it. | AR QR | 4 |  |
| `forgets_square_root` | Computes the squared or cubed quantity correctly and reports it without taking the root. | AR GR | 7 | Covers square and cube roots. |
| `inequality_direction_not_flipped` | Fails to reverse the inequality when multiplying or dividing by a negative, or flips it without cause. | AR QR | 4 |  |
| `inverts_conversion_direction` | Multiplies where the conversion or scale factor requires division, or vice versa. | AR GR QR | 9 |  |
| `inverts_trig_ratio` | Inverts a trigonometric ratio, placing the wrong side in the numerator. | GR | 2 | Two topics only, but 12 instances and a distinct remediation. |
| `misreads_direction_of_change` | Computes a magnitude correctly but labels the direction backward. | PR QR | 5 |  |
| `multiplies_exponents_wrongly` | Multiplies exponents where the applicable rule requires adding or subtracting them. | AR | 3 | Split from exponent_rule_confusion per decision 1; renamed per Phase 2 review. |
| `multiplies_instead_of_divides` | Multiplies two quantities where the relationship requires division. | AR GR QR | 9 |  |
| `new_over_original_as_change` | Reports the new value as a percent of the original instead of the percent change. | PR QR | 3 |  |
| `off_by_one_count` | Miscounts a tally by one -- loses count, double-counts, or stops one short. | GR PR QR | 6 |  |
| `omits_constant_term` | Computes the variable or rate portion correctly and omits the fixed component (flat fee, intercept, starting value). | AR GR PR QR | 9 | Boundary with answers_intermediate_value and omits_variable_term is fixed by the approved intermediate_vs_omission rule. |
| `omits_fractional_factor` | Drops the one-half, one-third or four-thirds from an area or volume formula, or applies it twice. | GR | 6 |  |
| `omits_second_component` | Ignores one part of a composite figure, two-part total or two-stage quantity. | AR GR PR QR | 8 |  |
| `omits_variable_term` | Reports the fixed component of a linear model and omits the variable or rate component. | AR PR QR | 4 | Approved in the Phase 2 review alongside the intermediate_vs_omission boundary rule. |
| `order_of_operations_violated` | Evaluates left to right or applies a lower-priority operation first. | AR PR QR | 5 |  |
| `over_rejects_valid_model` | Rejects a model, survey or inference wholesale rather than naming the specific limitation at issue. | PR | 1 | Added in the Phase 3 closeout as the mirror of extrapolates_beyond_data: one error applies a model where it does not hold, the other discards a model that does. Cross-cutting for the same reason decision 3 gave. |
| `overgeneralizes_from_sample` | Treats a sample result as an absolute or population-wide claim. | PR | 3 |  |
| `percent_change_wrong_base` | Divides the change by the new value instead of the original, or applies a percent to the post-change base. | PR QR | 3 |  |
| `percent_changes_added` | Treats successive percent changes as additive rather than multiplicative. | AR PR QR | 5 |  |
| `perimeter_area_confusion` | Computes perimeter where area was required, or vice versa. | GR | 5 | Kept separate from the other two formula swaps per Phase 1 decision 2. |
| `range_from_single_extreme` | Reports the maximum as the range instead of the difference between the extremes. | PR | 3 |  |
| `reads_adjacent_value` | Reads the neighbouring tick, bar, row or column instead of the one asked for. | GR PR QR | 5 |  |
| `reads_wrong_category` | Reads the right kind of value from the wrong labelled group. | PR | 3 |  |
| `reports_event_not_complement` | Reports the probability of the event where its complement was asked for, or omits the final subtraction from one. | PR | 3 |  |
| `reports_wrong_center_measure` | Reports one measure of centre where another was asked for. | PR | 4 |  |
| `sign_error_on_constant` | Flips the sign of a constant while moving it across the equals sign or collecting like terms. | AR GR PR QR | 11 | Distinct from drops_negative_sign: dropping yields the magnitude, flipping yields a wrong-signed value. |
| `slope_intercept_swap` | Assigns the slope's value to the intercept and the intercept's to the slope, including in verbal interpretation. | AR PR QR | 5 |  |
| `slope_run_over_rise` | Computes the change in x over the change in y instead of the change in y over the change in x. | AR PR QR | 6 | Kept separate from reversed_division: the remediation conversation differs. |
| `squaring_confused_with_doubling` | Computes twice a quantity where its square was required, or vice versa. | AR GR QR | 5 |  |
| `subtracts_exponents_wrongly` | Subtracts exponents where the applicable rule requires adding or multiplying them. | AR | 2 | Split from exponent_rule_confusion per decision 1; renamed per Phase 2 review. |
| `subtracts_in_wrong_order` | Computes b minus a where a minus b was required. | AR GR PR QR | 11 |  |
| `volume_surface_area_confusion` | Computes volume where surface area was required, or vice versa. | GR | 2 | Kept separate per decision 2. |
| `wrong_sign_on_factor` | Uses the correct magnitudes in a factored form but assigns the wrong sign to one or both factors. | AR | 6 |  |

## Topic-specific slugs

### AR.1.1 — 4 topic-specific
- `function_notation_as_fraction` — Reads function notation as the function name divided by the input.
- `function_notation_as_multiplication` — Reads function notation as a product of the function name and the input.
- `input_output_reversed` — Reads a function statement with its input and output roles exchanged.
- `symmetric_partner_misidentified` — Identifies the axis of symmetry itself rather than the symmetric partner input.

### AR.1.2 — 5 topic-specific
- `function_rule_converse_applied` — Applies the converse of the function rule as its definition.
- `injectivity_used_as_function_test` — Applies the one-to-one condition as the test for being a function.
- `outputs_checked_not_inputs` — Checks whether outputs repeat rather than whether inputs repeat.
- `single_violation_dismissed` — Concludes a relation is a function because most inputs appear only once.
- `vertical_line_test_misapplied` — Invents a false rule about how vertical lines meet a graph.

### AR.1.3 — 6 topic-specific
- `domain_range_swap` — Assigns output values to the domain and input values to the range.
- `jump_discontinuity_ignored` — Reads a piecewise range as one continuous interval across a jump.
- `piecewise_boundary_openness_error` — Mishandles an open or closed boundary at a piecewise seam.
- `range_as_endpoints_only` — Lists only the two endpoint outputs instead of the interval between them.
- `set_listed_as_multiset` — Repeats a value in a set rather than listing each element once.
- `shift_applied_to_wrong_axis` — Applies a horizontal shift to the range or a vertical shift to the domain.

### AR.1.4 — 4 topic-specific
- `differences_vs_ratios_confused` — Uses first differences where constant ratios distinguish the family, or vice versa.
- `exponent_position_confused` — Confuses a variable base with a variable exponent when naming a function family.
- `family_matched_by_surface_growth` — Matches a function to a family from its growth appearance without computing differences or ratios.
- `zero_second_differences_read_as_quadratic` — Reads constant zero second differences as quadratic rather than linear.

### AR.1.5 — 6 topic-specific
- `cancellation_assumed_to_restore_domain` — Reads the domain from the simplified form, restoring a value the cancelled factor excluded.
- `constant_read_as_excluded_value` — Reads a constant term directly as the excluded value without solving.
- `contextual_condition_as_domain_restriction` — Excludes an input for a contextual reason rather than because the function is undefined.
- `denominator_zero_rule_not_applied` — Concludes a rational function is defined everywhere, ignoring the zero-denominator restriction.
- `radical_endpoint_strictness_error` — Excludes the endpoint of a radical domain where the expression is in fact defined.
- `zero_numerator_treated_as_undefined` — Treats a zero numerator as producing an undefined output.

### AR.2.1 — 4 topic-specific
- `coefficient_subtracted_not_divided` — Subtracts the coefficient instead of dividing by it.
- `contradiction_confused_with_identity` — Concludes an equation is true for all inputs when it has no solution, or vice versa.
- `contradiction_read_as_solution` — Reads a contradiction as giving a solution value.
- `divides_before_isolating` — Divides by the coefficient before removing the constant term.

### AR.2.2 — 1 topic-specific
- `boundary_strictness_changed` — Silently changes a strict boundary to non-strict, or vice versa, in the solution set.

### AR.2.3 — 3 topic-specific
- `fixed_fee_added_twice` — Adds a flat fee a second time to an already-complete total.
- `input_added_instead_of_rate` — Adds the input value to the previous output instead of the rate of change.
- `input_added_to_fee_before_multiplying` — Adds the input to the flat fee before applying the rate.

### AR.2.4 — 5 topic-specific
- `constants_added_to_solve` — Adds the constants from both equations to produce a value for the variable.
- `hybrid_expression_substituted` — Builds a substitution expression by mixing terms from both equations.
- `identical_lines_read_as_parallel` — Reads proportional equations as parallel with no solution rather than as the same line.
- `one_point_reported_for_infinite_solutions` — Reports a single valid point as the unique solution of a dependent system.
- `only_one_equation_checked` — Verifies a candidate against one equation of a system and stops.

### AR.2.5 — 5 topic-specific
- `boundary_style_mismatched` — Uses a solid boundary for a strict inequality or a dashed one for a non-strict inequality.
- `only_one_constraint_tested` — Tests a candidate against one inequality of a system and accepts it.
- `substitution_comparison_misread` — Substitutes correctly but reads the resulting comparison backwards.
- `unwarranted_domain_restriction_added` — Adds a domain restriction the inequality does not imply.
- `wrong_side_shaded` — Identifies the boundary correctly but shades the wrong side.

### AR.2.6 — 5 topic-specific
- `delta_x_used_as_slope` — Uses the change in the input directly as the slope.
- `delta_y_used_as_slope` — Uses the change in the output directly as the slope without dividing.
- `horizontal_vertical_line_confused` — Writes a vertical line's equation for a horizontal line, or vice versa.
- `point_y_used_as_intercept` — Uses a given point's output value as the intercept without solving for it.
- `slope_value_written_as_equation` — Reports the slope value as though it were the equation of the line.

### AR.2.7 — 4 topic-specific
- `negation_without_reciprocal` — Negates the slope but does not take its reciprocal.
- `parallel_vs_identical_not_distinguished` — Concludes lines are parallel from equal slopes without checking the intercepts.
- `raw_coefficients_compared` — Compares coefficients of unconverted equations to judge parallelism or perpendicularity.
- `reciprocal_without_negation` — Takes the reciprocal of the slope but does not negate it.

### AR.2.8 — 3 topic-specific
- `common_factor_not_extracted` — Fails to factor the variable out before isolating it.
- `division_distributed_over_sum` — Applies a false rule that division distributes over addition.
- `wrong_inverse_operation_chosen` — Undoes an operation with the wrong inverse when isolating a variable.

### AR.3.1 — 3 topic-specific
- `factor_pair_sum_unchecked` — Chooses a factor pair with the correct product without checking the sum.
- `gcf_dropped_after_factoring` — Factors the trinomial correctly but omits the extracted common factor from the answer.
- `gcf_not_extracted_first` — Factors into binomials without first extracting the greatest common factor.

### AR.3.2 — 3 topic-specific
- `constants_assigned_to_wrong_binomials` — Uses the right numbers but places the constants in the wrong factors.
- `leading_coefficient_ignored_in_factoring` — Factors a non-monic quadratic as though it were monic.
- `perfect_square_vs_difference_of_squares` — Confuses a perfect-square trinomial with a difference of squares.

### AR.3.3 — 4 topic-specific
- `factor_constants_read_as_roots` — Reports the numbers inside the factors as the roots without flipping their signs.
- `leading_coefficient_ignored_in_root` — Reads a root from a factor without dividing by the leading coefficient.
- `not_rearranged_to_standard_form` — Reads coefficients from an unrearranged equation as the solutions.
- `perfect_square_confused_with_unfactorable_sum` — Treats a perfect-square trinomial as an unfactorable sum and concludes there are no real solutions.

### AR.3.4 — 6 topic-specific
- `axis_of_symmetry_reported_as_root` — Reports the axis of symmetry as a solution.
- `discriminant_miscomputed` — Computes the discriminant with the wrong sign or term.
- `negative_discriminant_read_as_one_root` — Reads a negative discriminant as a single repeated solution.
- `quadratic_formula_denominator_omitted` — Computes the numerator and does not divide by twice the leading coefficient.
- `quadratic_formula_partial_division` — Divides only the radical term by the denominator, leaving the rest undivided.
- `quadratic_formula_wrong_numerator_sign` — Uses the positive linear coefficient in the quadratic formula numerator instead of its negation.

### AR.3.5 — 5 topic-specific
- `axis_reported_as_extreme_value` — Reports the input at the vertex where the extreme value was asked for.
- `constant_term_reported_as_extreme` — Reports the constant term as the maximum or minimum value.
- `extreme_point_believed_absent` — Believes a parabola in a given form has no maximum or minimum.
- `opening_direction_rule_reversed` — Associates the sign of the leading coefficient with the wrong kind of extreme point.
- `vertex_form_h_read_literally` — Takes the number inside the parentheses as the vertex coordinate without flipping its sign.

### AR.3.6 — 4 topic-specific
- `double_root_written_as_two_intercepts` — Factors a single touch point into two distinct intercepts.
- `factor_signs_match_intercepts` — Writes the factors with the same signs as the intercepts instead of the opposite signs.
- `given_point_not_used` — Writes a quadratic from the intercepts or vertex without using the given point to find the leading coefficient.
- `transformation_shift_direction_reversed` — Reverses the direction of a horizontal or vertical shift.  _Merged from AR.3.6 and AR.3.7._

### AR.3.7 — 3 topic-specific
- `balance_term_not_scaled_by_leading_coefficient` — Fails to multiply the balance term by the factored-out leading coefficient.
- `balance_term_not_subtracted_back` — Adds the completing-the-square term without subtracting it back.
- `half_of_b_miscomputed` — Takes the wrong value as half the linear coefficient when completing the square.

### AR.4.1 — 2 topic-specific
- `exponents_added_when_combining` — Adds the exponents of like terms instead of keeping the common exponent.
- `sign_of_first_term_kept` — Combines like terms but keeps the sign of the first term regardless of the operation.

### AR.4.2 — 3 topic-specific
- `cross_product_counted_once` — Includes the cross product once instead of twice.
- `foil_outer_inner_omitted` — Multiplies only the first and last terms of two binomials, omitting the outer and inner products.
- `larger_exponent_kept` — Keeps the larger of two exponents instead of combining them.

### AR.4.3 — 2 topic-specific
- `polynomial_term_never_carried` — Omits one polynomial's term entirely from the sum.
- `terms_of_different_degree_combined` — Combines terms of different degree into one.

### AR.4.4 — 2 topic-specific
- `coefficient_not_raised_to_power` — Leaves the coefficient untouched or multiplies it when it should be raised to the outer power.
- `inner_exponent_raised_not_multiplied` — Raises the inner exponent to the outer power instead of multiplying them.

### AR.4.5 — 4 topic-specific
- `numerator_zeros_confused_with_undefined` — Sets the numerator to zero to find where the expression is undefined.
- `over_cancellation` — Cancels a single factor against more occurrences than the expression contains.
- `restriction_read_from_simplified_form` — Reads the domain restriction from the simplified expression, missing the cancelled factor's exclusion.
- `term_level_cancellation` — Cancels a term from numerator and denominator without factoring first.

### AR.4.6 — 4 topic-specific
- `denominators_combined_with_numerators` — Adds or subtracts the denominators along with the numerators.
- `identical_denominators_multiplied` — Treats identical denominators as different and multiplies them.
- `negative_not_distributed_across_numerator` — Applies a subtraction to only the first term of the second numerator.
- `numerators_not_rescaled` — Uses the correct common denominator but does not rescale the numerators.

### AR.4.7 — 3 topic-specific
- `denominator_misread` — Misreads the denominator expression when substituting.
- `numerator_only_substituted` — Substitutes into the numerator and ignores the denominator.
- `numerator_set_equal_to_output` — Sets the numerator equal to the output value, ignoring the denominator.

### AR.4.8 — 4 topic-specific
- `coefficients_and_radicands_both_combined` — Combines the radicands as well as the coefficients when adding or subtracting like radicals.
- `largest_perfect_square_not_extracted` — Extracts a perfect-square factor that is not the largest, leaving the radical unsimplified.
- `perfect_square_moved_out_unrooted` — Moves a perfect-square factor outside the radical without taking its root.
- `rationalisation_applied_to_one_part` — Multiplies only the numerator or only the denominator when rationalising.

### AR.4.9 — 3 topic-specific
- `extraneous_root_not_checked` — Accepts both candidate roots without checking them in the original equation.
- `squares_before_isolating` — Squares both sides before isolating the radical.
- `valid_root_discarded_as_extraneous` — Discards a valid root on the assumption that one must be extraneous.

### AR.4.10 — 4 topic-specific
- `base_times_exponent` — Evaluates a power by multiplying the base by the exponent.  _Merged from AR.4.10 and AR.4.11._
- `bases_multiplied_with_exponents` — Multiplies the bases as well as combining the exponents.
- `negative_exponent_as_negative_value` — Reads a negative exponent as making the value negative rather than as a reciprocal.  _Merged across three AR topics._
- `zero_exponent_as_zero` — Evaluates a zero exponent as zero.

### AR.4.11 — 4 topic-specific
- `coefficient_added_not_multiplied` — Adds the coefficient to the evaluated power instead of multiplying.
- `coefficient_ignored_in_power` — Evaluates only the power and drops the coefficient.
- `exponent_applied_to_coefficient` — Applies the exponent to the coefficient instead of to the base.
- `linear_instead_of_compound` — Applies a rate linearly where compounding is required.  _Merged from AR.4.11 (linear decay) and AR.4.12._

### AR.4.12 — 5 topic-specific
- `compounding_period_not_adjusted` — Fails to adjust the rate or the exponent for the number of compounding periods.
- `factor_reported_as_rate` — Reports the growth or decay factor as the percent rate.
- `growth_applied_for_wrong_duration` — Applies the growth or decay for the wrong number of periods.
- `growth_decay_factor_direction_wrong` — Builds a growth factor for a decay scenario, or a decay factor for growth.
- `rate_used_as_factor` — Uses the rate itself as the multiplier, omitting the one it must be added to or subtracted from.

### GR.1.1 — 5 topic-specific
- `area_conversion_factor_not_squared` — Applies the linear conversion factor to an area instead of its square.  _Merged from GR.1.1 and QR.2.7._
- `measurement_system_mismatched` — Selects a unit from the wrong measurement system for the context.
- `metric_prefix_factor_wrong` — Uses the wrong power of ten for a metric prefix conversion.
- `unit_magnitude_mismatched` — Selects a unit of the right category but of wildly wrong magnitude for the context.
- `wrong_measurement_category` — Selects a unit from the wrong measurement category entirely.

### GR.1.2 — 5 topic-specific
- `adjacent_vs_vertical_confused` — Confuses the positional relationship of adjacent angles with the opposite-pair relationship of vertical angles.
- `all_intersection_angles_summed` — Sums every angle at an intersection rather than the requested pair.
- `complementary_supplementary_swap` — Applies the supplementary rule where the complementary rule was required, or vice versa.
- `vertical_angles_given_a_sum_rule` — Applies a fixed-sum rule to vertical angles, which are defined by equality.
- `vertical_angles_treated_as_supplementary` — Treats vertical angles as summing to a straight angle rather than being equal.

### GR.1.3 — 3 topic-specific
- `leading_digit_read_only` — Reads the leading digit of a scale label and drops the remaining place.
- `snaps_to_labelled_tick` — Reads the nearest labelled tick instead of interpolating to an unlabelled position.
- `subdivision_count_miscomputed` — Miscounts how many equal parts the unlabelled marks create.

### GR.2.1 — 5 topic-specific
- `irregular_treated_as_rectangle` — Approximates an irregular figure as a rectangle using two of its dimensions.
- `notch_sides_not_accounted` — Fails to account for the sides added or removed by a notch or cutout.
- `side_count_subtracted_from_perimeter` — Subtracts the number of sides from the perimeter instead of dividing by it.
- `side_omitted_from_perimeter` — Omits one side from the sum when computing a perimeter.  _Merged from GR.2.1 and GR.3.1 (drafted there as computed_side_omitted_from_perimeter)._
- `wrong_side_count_for_polygon` — Multiplies a side length by the wrong number of sides for the named polygon.

### GR.2.2 — 4 topic-specific
- `arc_fraction_not_applied` — Reports the full circumference where an arc fraction was required.
- `factor_of_two_omitted` — Omits the factor of two from the radius form of the circumference formula.
- `radius_diameter_substituted` — Substitutes the radius where the diameter belongs, or vice versa.
- `result_doubled_twice` — Applies the correct formula and then doubles the result again.

### GR.2.3 — 4 topic-specific
- `base_height_added_not_multiplied` — Adds the base and height instead of multiplying them.
- `cutout_added_not_subtracted` — Adds a cutout's area to the figure instead of subtracting it.
- `formula_borrowed_from_other_shape` — Applies another shape's area formula to the given figure.
- `slant_height_used_for_perpendicular` — Uses a slant side where the perpendicular height was required.

### GR.2.4 — 3 topic-specific
- `area_squared_instead_of_rooted` — Squares the area instead of taking its square root to recover a side.
- `one_of_two_divisors_omitted` — Divides by only one of the two divisors the formula requires.
- `sum_of_bases_reported_as_one_base` — Reports the sum of two bases where a single base was asked for.

### GR.2.5 — 5 topic-specific
- `base_omitted_from_solid` — Omits the base of a solid from its surface area.
- `both_bases_counted_where_one` — Counts two bases on a solid that has one.
- `lateral_surface_only` — Computes only the lateral surface and omits the bases.
- `opposite_faces_not_doubled` — Sums the distinct face areas without doubling for the opposite pairs.
- `shared_interface_not_removed` — Adds two solids' full surface areas without removing the shared interface.

### GR.2.6 — 4 topic-specific
- `cone_cylinder_ratio_wrong` — Uses the wrong fractional relationship between a cone and its enclosing cylinder.
- `dimensions_added_not_multiplied` — Adds the dimensions instead of multiplying them.
- `half_height_used` — Uses half the height in a volume formula.
- `radius_not_squared` — Uses the radius instead of its square in a volume formula.

### GR.2.7 — 3 topic-specific
- `factor_not_distributed_to_constant` — Distributes a factor to the variable term but not to the constant in a binomial dimension.
- `fractional_factor_applied_to_base_only` — Applies the fractional factor to the base only, ignoring the height.
- `phantom_term_introduced` — Introduces a term with no basis in the given dimensions.

### GR.3.1 — 4 topic-specific
- `legs_combined_without_squaring` — Adds or subtracts two side lengths directly instead of working with their squares.  _Merged across three GR topics._
- `longest_side_assumed_hypotenuse` — Assumes the largest given number is already the hypotenuse.
- `pythagorean_triple_assumed` — Assumes a familiar triple applies without verifying it.
- `space_diagonal_stopped_at_base` — Finds the base diagonal and stops without continuing to the space diagonal.

### GR.3.2 — 5 topic-specific
- `hypotenuse_reported_for_leg` — Reports the hypotenuse where a leg was asked for.  _Merged from GR.3.2 and GR.3.3._
- `no_ratio_applied` — Assumes the given side equals the unknown, applying no special-triangle relationship at all.
- `short_long_leg_roles_confused` — Treats the long leg as the short leg, or vice versa, in a thirty-sixty-ninety triangle.
- `special_ratio_multiplied_not_divided` — Multiplies by a special-triangle ratio where division was required, or vice versa.
- `special_triangle_factor_swapped` — Uses the factor from one special right triangle in the other.

### GR.3.3 — 5 topic-specific
- `inverse_trig_function_mismatched` — Feeds a ratio into the wrong inverse trigonometric function.
- `ratio_numerator_as_side_length` — Reads the numerator of a trigonometric ratio as a literal side length.
- `special_angle_family_wrong` — Uses a ratio from the wrong special-angle family.
- `trig_side_roles_misassigned` — Assigns opposite, adjacent or hypotenuse to the wrong sides.
- `wrong_trig_ratio_selected` — Uses one trigonometric ratio where another was required.

### GR.3.4 — 4 topic-specific
- `adjacent_reported_for_opposite` — Reports the side adjacent to the angle where the opposite side was asked for, or vice versa.
- `angles_combined_before_applying_ratio` — Combines the angles before applying the trigonometric ratio.
- `initial_value_not_subtracted` — Computes the final value and forgets to subtract the initial one.
- `special_factor_applied_to_wrong_part` — Applies a special-triangle factor to the wrong segment.

### GR.4.1 — 6 topic-specific
- `composition_order_reversed` — Applies the transformations of a composition in the wrong order.
- `composition_step_skipped` — Applies only one transformation of a composition and stops.
- `coordinates_swapped_without_negating` — Swaps the coordinates for a reflection but omits the negation.
- `translation_direction_reversed` — Adds where the translation subtracts, or subtracts where it adds.
- `wrong_reflection_axis` — Reflects over the wrong axis or line.
- `wrong_rotation_rule` — Applies the rule for a different rotation angle or direction.

### GR.4.2 — 6 topic-specific
- `area_ratio_confused_with_linear_ratio` — Confuses the ratio of areas with the ratio of corresponding lengths, in either direction.  _Merged from GR.4.2 (area_ratio_reported_as_scale_factor) and GR.4.3 (area_ratio_used_as_side_ratio)._
- `composition_assumed_to_compound_size` — Assumes applying more than one transformation must change the size.
- `dilation_treated_as_congruence_preserving` — Believes a dilation preserves congruence despite the scale factor.
- `false_condition_invented_for_congruence` — Adds a condition that congruence does not require.
- `rigid_motion_treated_as_dilation` — Believes a translation, rotation or reflection changes the figure's size.
- `transformation_misidentified_from_coordinates` — Picks a transformation whose rule does not map the given preimage to the image.

### GR.4.3 — 2 topic-specific
- `area_scaled_by_linear_factor` — Scales an area by the linear scale factor instead of its square.
- `scale_factor_direction_reversed` — Computes the scale factor from image to preimage instead of preimage to image.

### GR.4.4 — 5 topic-specific
- `line_vs_rotational_symmetry_confused` — Confuses line symmetry with rotational symmetry.
- `point_symmetry_wrongly_attributed` — Attributes point symmetry to a polygon whose vertex count prevents it.
- `rotation_angle_reported_for_order` — Reports the smallest angle of rotation instead of the order of symmetry.
- `symmetry_axes_double_counted` — Counts each axis of symmetry twice, once in each direction.
- `symmetry_axes_undercounted` — Finds some of a figure's axes of symmetry and misses the rest.

### GR.4.5 — 4 topic-specific
- `circle_center_signs_not_flipped` — Reads the centre coordinates with their displayed signs instead of flipping them.
- `distance_formula_replaced_by_sum` — Adds the coordinate differences instead of applying the distance formula.
- `linear_coefficient_not_halved` — Uses the full linear coefficient as a centre coordinate instead of half of it.
- `radius_squared_confused_with_radius` — Reports the right-hand side as the radius, or the radius where its square belongs.

### PR.1.1 — 3 topic-specific
- `distinct_values_counted_not_occurrences` — Counts how many distinct values satisfy a condition rather than how many entries do.
- `ordering_violation_located_wrongly` — Identifies the wrong position as the ordering error in a sorted list.
- `threshold_boundary_error` — Counts with an inclusive threshold where an exclusive one was required, or vice versa.  _Merged across three PR topics._

### PR.1.2 — 6 topic-specific
- `category_values_swapped` — Exchanges the recorded values of two categories.
- `error_traced_to_wrong_source` — Correctly spots a data error but attributes it to the wrong source value.
- `false_structural_rule_invented` — Invents a structural limit on a graph or table type that does not exist.  _Merged from PR.1.2 and PR.1.5._
- `fix_applied_to_wrong_element` — Corrects the data where the labels were wrong, or vice versa.
- `frequency_value_misread` — Misreads a single recorded frequency and computes the total from the wrong value.
- `total_accepted_without_verifying` — Accepts a stated total without computing it from the data.  _Merged from PR.1.2 and PR.1.3._

### PR.1.3 — 2 topic-specific
- `pictograph_key_not_applied` — Reads the symbol count directly without applying the key value.
- `wrong_time_point_read` — Reads the value at a different time point than the one asked for.

### PR.1.4 — 4 topic-specific
- `rank_position_error` — Selects the wrong ordinal position when ranking values.
- `row_total_used_for_column_total` — Uses a row total as the denominator where the column total was required, or vice versa.
- `single_cell_read_where_sum_needed` — Reads one cell where two or more must be summed.
- `unrelated_cells_compared` — Compares two cells with no meaningful relationship to the question.

### PR.1.5 — 5 topic-specific
- `averaging_removes_the_variation_studied` — Aggregates or averages across the very dimension the question asks about, removing the variation needed to answer it.  _Added in the Phase 3 closeout; PR_A_021.D was previously tagged graph_type_mismatched_to_variable, but the display suits the data -- the averaging is what discards the evidence._
- `categorical_numerical_misclassified` — Classifies a categorical variable as numerical, or a numerical variable as categorical.
- `discrete_continuous_confused` — Confuses discrete and continuous as descriptions of a numerical variable.
- `graph_type_mismatched_to_variable` — Chooses a display whose requirements the variable type does not meet.
- `nominal_applied_to_measurement` — Applies an unordered-category term to a measurement variable.

### PR.2.1 — 7 topic-specific
- `mean_divisor_miscounted` — Divides the total by the wrong number of values.
- `median_from_unsorted_list` — Takes the middle value without sorting the data first.
- `new_mean_from_averaging_means` — Averages the old mean with a new value instead of rebuilding from the total.
- `new_total_divided_by_old_count` — Divides an updated total by the original count.
- `outlier_resistance_misjudged` — Misjudges which statistic an outlier affects most.
- `two_middles_not_averaged` — Takes one of the two middle values instead of averaging them.
- `zero_dropped_as_no_data` — Treats a zero value as missing data and excludes it.

### PR.2.2 — 5 topic-specific
- `largest_weight_matched_to_largest_score` — Assumes the largest weight belongs to the largest value.
- `missing_weight_reused` — Reuses another category's weight in place of an unstated one.
- `target_weight_not_divided_out` — Subtracts the known contributions from the target but does not divide by the unknown's weight.
- `weights_ignored` — Takes a simple unweighted mean where weights were given.
- `weights_swapped` — Exchanges the weights between categories.

### PR.2.3 — 6 topic-specific
- `mean_subtracted_from_sum` — Subtracts the mean from the sum of the known values.
- `missing_value_assumed_equal_to_mean` — Assumes the unknown value equals the mean.
- `optimisation_bound_misused` — Fails to push the free values to their bound when maximising or minimising an unknown.
- `range_added_to_wrong_extreme` — Adds the range to the maximum instead of the minimum, or vice versa.
- `range_from_known_values_only` — Computes the range from the known values, ignoring that the unknown is a new extreme.
- `total_from_wrong_count` — Multiplies the mean by the count of known values rather than by all values.

### PR.2.4 — 5 topic-specific
- `equal_means_assumed_equal_consistency` — Assumes equal means imply equal consistency.
- `equal_medians_assumed_equal_means` — Assumes equal medians imply equal means.
- `larger_range_read_as_better` — Treats a larger range as evidence of stronger performance rather than greater variability.
- `outlier_effect_on_mean_dismissed` — Uses or defends the mean where an outlier makes it unrepresentative.
- `skew_direction_misread` — Infers the wrong direction of skew from the relationship between mean and median.

### PR.2.5 — 4 topic-specific
- `equal_endpoints_read_as_equal_distributions` — Treats two plots with the same extremes as identical distributions.
- `iqr_computed_using_median` — Uses the median in place of a quartile when computing the interquartile range.
- `quartile_read_as_median` — Reads a box edge as the median.
- `whisker_length_as_typical_value` — Judges the typical value by whisker length rather than by the median.

### PR.3.1 — 5 topic-specific
- `added_items_not_reflected_in_total` — Adds or removes items from one category without updating the total.
- `compound_outcomes_double_counted` — Adds two overlapping outcome groups without removing the shared members.
- `favourable_over_unfavourable` — Divides favourable outcomes by unfavourable outcomes instead of by the total.
- `outcome_total_miscounted` — Miscounts the total number of possible outcomes.
- `proportion_solved_for_wrong_unknown` — Solves a probability proportion for the wrong unknown.

### PR.3.2 — 4 topic-specific
- `complement_assumed_half` — Assumes the complement of any event is an even chance.
- `event_probability_subtracted_twice` — Subtracts the event probability from one twice.
- `event_set_miscounted` — Miscounts which members belong to the event before taking its complement.
- `partial_complement_taken` — Takes the complement of only one of two or more groups.

### PR.3.3 — 5 topic-specific
- `numerators_added_over_product` — Adds the numerators over the product of the denominators.
- `replacement_status_wrong` — Treats draws as with replacement when they are not, or vice versa.
- `sequence_stopped_early` — Multiplies the first stages and stops before the last.
- `single_stage_reported` — Reports one stage's probability as the compound probability.
- `total_not_reduced_between_draws` — Reduces the favourable count between draws but keeps the total unchanged.

### PR.3.4 — 4 topic-specific
- `conditional_reversed` — Computes the conditional probability with its two events exchanged.
- `joint_reported_as_conditional` — Reports the joint probability without dividing by the conditioning probability.
- `prior_reported_ignoring_condition` — Reports the unconditional probability, ignoring the given condition.
- `whole_population_as_denominator` — Uses the whole population as the denominator instead of the conditioning group.

### PR.3.5 — 6 topic-specific
- `complement_misidentified` — Reports the set itself or the universal set as the complement.
- `neither_reported_as_both` — Computes the count in neither set and reports it as the count in both.  _Added in the Phase 3 closeout; PR_A_065.C was previously tagged union_intersection_swapped, but the value is the complement of the union, a third region._
- `overlap_not_subtracted` — Adds two set sizes without subtracting the shared elements.
- `overlap_subtracted_twice` — Subtracts the shared elements twice from a union.
- `triple_overlap_not_added_back` — Subtracts the pairwise overlaps without adding back the triple overlap.
- `union_intersection_swapped` — Reports the union where the intersection was asked for, or vice versa.

### PR.4.1 — 6 topic-specific
- `curved_pattern_forced_linear` — Applies a single linear direction label to a curved pattern.
- `false_precondition_for_association` — Believes an association requires a condition the data need not meet.  _Introduced in Phase 2 to house the PR.4.1 judgement-call items -- see edge_cases._
- `outlier_influence_misjudged` — Overstates or denies the effect of a single point on an association.
- `scatter_read_as_no_association` — Concludes no association exists because the points do not fall exactly on a line.
- `steepness_confused_with_strength` — Judges strength by the steepness of the trend rather than by how tightly the points cluster.
- `strength_confused_with_direction` — Treats the direction of an association as determining its strength.

### PR.4.2 — 3 topic-specific
- `fit_judged_by_intercept` — Judges which model fits better by the size of its intercept rather than by comparing predictions.
- `slope_denominator_summed` — Adds the input values in the slope denominator instead of subtracting them.
- `slope_numerator_summed` — Adds the output values in the slope numerator instead of subtracting them.

### PR.4.3 — 1 topic-specific
- `single_period_counted` — Counts only one period's change in a multi-period percent change.

### PR.4.4 — 5 topic-specific
- `confounder_ignored` — Accepts a direct causal claim while ignoring a plausible confounding variable.
- `model_fit_assumed_to_transfer` — Assumes a good in-range fit guarantees accuracy outside the data range.
- `reverse_causation_asserted` — Asserts the reverse causal direction as established fact.
- `study_design_confused_with_causal_evidence` — Treats an observational or self-selected design as establishing cause.
- `tendency_stated_as_absolute` — Converts an average tendency into an absolute claim about every individual.

### QR.1.1 — 4 topic-specific
- `irrational_assumed_larger` — Assumes an irrational value is automatically greater or less than a nearby rational one without estimating it.
- `negative_reverses_radical_order` — Forgets that a negative sign reverses the ordering of radical magnitudes.
- `radical_coefficient_size_as_value` — Treats the radical with the largest coefficient or radicand as the largest value without simplifying.
- `radical_dropped_for_coefficient` — Replaces a radical expression with its coefficient alone, dropping the radical.

### QR.1.2 — 2 topic-specific
- `benchmark_judged_from_digits` — Judges a value against a benchmark such as one half by inspecting its digits rather than converting.
- `values_assumed_preordered` — Assumes the values are already listed in order and answers with the given sequence.

### QR.1.3 — 4 topic-specific
- `complement_used_instead_of_value` — Uses the complement of the required fraction or proportion in place of the value itself.  _Added in the Phase 3 closeout; QR_P_019.D was previously tagged reads_wrong_category, which implies a labelled group that this item does not have._
- `long_division_stopped_early` — Stops the long division before the repeating pattern emerges and records the partial quotient.
- `repeating_block_denominator_wrong` — Uses the wrong power-of-nine denominator for the length of the repeating block.
- `repeating_block_misidentified` — Applies the pure-repeating rule to digits that are not the repeating block.

### QR.1.4 — 4 topic-specific
- `accuracy_judged_by_format` — Judges which estimate is better by its decimal-place format rather than by squaring.
- `estimate_not_verified_by_squaring` — Accepts an estimate without squaring it to check against the radicand.
- `midpoint_used_as_estimate` — Defaults to the midpoint between two integers instead of testing which bound the value is nearer.
- `rounds_to_bounding_integer` — Rounds to a bounding perfect-square root without refining further.

### QR.1.5 — 5 topic-specific
- `coefficient_lost_in_multistep` — Loses a radical's coefficient partway through a multi-step simplification.
- `conjugate_applied_to_denominator_only` — Multiplies the denominator by its conjugate but leaves the numerator unmultiplied.
- `multiplies_by_denominator_not_conjugate` — Rationalises by multiplying by the denominator itself rather than its conjugate.
- `radical_cancelled_as_factor` — Cancels a radical from numerator and denominator as though it were a common factor.
- `rational_and_irrational_merged` — Merges a rational and an irrational term under a single radical sign.

### QR.1.6 — 6 topic-specific
- `carry_not_propagated` — Begins a rounding carry but writes the digit literally instead of continuing to carry.
- `rounding_as_increment_rightmost` — Treats rounding as incrementing the rightmost digit while keeping all places.
- `rounds_down_despite_five_or_more` — Rounds down although the reference digit is five or greater.
- `rounds_to_wrong_place` — Rounds to a different place value than the one requested.
- `two_step_rounding_assumed_equal` — Assumes rounding in two steps gives the same result as rounding directly.
- `wrong_reference_digit` — Uses the digit in the wrong place to decide whether to round up.

### QR.1.7 — 1 topic-specific
- `operation_ignored_entirely` — Ignores an operation in the expression and evaluates only the remaining terms.

### QR.1.8 — 7 topic-specific
- `absolute_difference_as_product` — Computes the absolute value of a difference as a product of the two values.
- `absolute_equation_one_case_only` — Solves only one case of an absolute-value equation.
- `absolute_inequality_boundary_only` — Reports only the boundary points, not the interval they enclose.
- `absolute_inequality_direction_reversed` — Produces the solution set for the opposite absolute-value inequality.
- `absolute_value_as_additive_inverse` — Reads the absolute value of a number as the value that adds to it to reach zero.
- `absolute_value_as_squaring` — Confuses absolute value with squaring.
- `absolute_value_leaves_sign` — Believes absolute value leaves a negative sign unchanged.

### QR.2.1 — 4 topic-specific
- `ratio_parts_reported_in_answer_units` — Reports the count of ratio parts as the answer quantity.
- `ratio_terms_multiplied` — Multiplies the two terms of a ratio together instead of partitioning by them.
- `rounds_up_where_floor_required` — Rounds a quotient up when the constraint that produced it makes only the whole units below it attainable.  _Added in the Phase 3 closeout; QR_A_035.C was previously tagged off_by_one_count, which describes a tally slip rather than rounding against a constraint._
- `scales_by_wrong_ratio_term` — Finds the unit value correctly but multiplies by the wrong ratio term.

### QR.2.2 — 3 topic-specific
- `alligation_ratio_misapplied` — Reads an alligation ratio as a fraction of the wrong base.
- `proportional_division_step_skipped` — Multiplies the two known quantities without dividing by the third in a proportion.
- `relative_speed_ignored` — Uses one object's speed instead of the closing or relative speed in a catch-up problem.

### QR.2.3 — 3 topic-specific
- `goal_threshold_misread` — Reads a percent-improvement goal as any improvement rather than a threshold.
- `markup_discount_assumed_to_cancel` — Assumes a percent increase followed by an equal percent decrease returns to the original value.
- `percent_applied_to_wrong_stage_base` — Applies a second percent to the wrong stage's base.

### QR.2.4 — 3 topic-specific
- `breakeven_markup_assumed_equal_to_discount` — Assumes the markup needed to offset a discount equals the discount rate.
- `mixture_reports_total_not_added` — Reports the new total volume rather than the amount added.
- `percent_applied_forward_not_reversed` — Applies the percent change again instead of undoing it to recover the original.

### QR.2.5 — 4 topic-specific
- `closing_rate_reported_as_distance` — Reports a computed rate as though it were a distance.
- `single_segment_used_for_whole` — Uses one segment's or one worker's rate for the entire task.
- `speeds_averaged_arithmetically` — Averages two segment speeds instead of dividing total distance by total time.
- `times_added_instead_of_rates_combined` — Adds individual completion times instead of combining rates.

### QR.2.6 — 4 topic-specific
- `conversion_stopped_one_step_early` — Completes an intermediate conversion and stops before reaching the requested unit.
- `converts_whole_number_part_only` — Converts only the whole-number portion and drops the fractional or decimal part.
- `fencepost_error` — Divides a length by a spacing and omits the final endpoint.
- `rates_added_instead_of_netted` — Adds an inflow and an outflow rate instead of subtracting to find the net.

### QR.2.7 — 2 topic-specific
- `conversion_factor_rounded` — Rounds the conversion factor before applying it, losing precision.
- `temperature_offset_omitted` — Omits the additive offset from a temperature conversion formula.

### QR.2.8 — 3 topic-specific
- `constant_difference_as_direct_variation` — Accepts a constant difference as evidence of direct variation rather than a constant ratio.
- `first_value_as_constant_of_variation` — Takes the first output value as the constant of variation instead of computing the ratio.
- `inverse_relationship_treated_as_direct` — Treats an inversely varying factor as though it varied directly.

### QR.3.1 — 4 topic-specific
- `flat_fee_merged_into_rate` — Folds a one-time fixed fee into the per-unit rate so it is applied to every unit.  _Merged from QR.3.1 and QR.4.2 (drafted there as fee_charged_per_unit)._
- `keyword_mistranslated` — Translates a verbal phrase with the wrong operation.
- `less_than_order_reversed` — Writes the terms of a 'less than' phrase in the order they appear in the words.
- `wrong_quantity_grouped` — Applies a grouping to the wrong part of the expression.

### QR.3.2 — 5 topic-specific
- `coefficient_plus_constant_as_rate` — Adds the coefficient and the constant and reports the sum as the rate.
- `constant_read_as_rate` — Reads the constant term as the rate of change.
- `rate_assumed_quantity_dependent` — Believes a constant per-unit rate changes with quantity.
- `rate_not_normalised_to_unit` — Compares rates stated over different unit sizes without normalising them.
- `variable_term_read_as_rate` — Reports the whole variable term rather than isolating its coefficient.

### QR.3.3 — 5 topic-specific
- `comparative_relationship_reversed` — Reverses which quantity is the multiple of the other.
- `per_unit_price_as_flat_charge` — Treats a per-unit price as a one-time flat charge.
- `prices_swapped_between_quantities` — Attaches each per-unit rate to the wrong quantity.
- `quantities_counted_without_rates` — Counts the items but drops the per-unit rates.
- `rates_merged_into_single_rate` — Combines two different per-unit rates into one and applies it to everything.

### QR.3.4 — 3 topic-specific
- `intercept_tied_to_nonzero_input` — Ties the intercept's meaning to a specific non-zero input rather than to zero.
- `rate_called_the_total` — Describes a per-unit rate as the total amount.
- `rate_confused_with_variable` — Describes the coefficient as a count of the variable's units.

### QR.3.6 — 5 topic-specific
- `constant_rate_assumed` — Assumes a table is linear without computing each interval separately.
- `rise_reported_as_rate` — Computes the change in the output and reports it without dividing by the change in the input.
- `row_gaps_counted_as_change` — Divides by the number of listed rows instead of the actual change in the input.
- `run_reported_as_rate` — Reports the change in the input as the rate.
- `wrong_interval_selected` — Computes the rate over a different interval than the one asked for.

### QR.3.7 — 6 topic-specific
- `comparison_declared_impossible` — Believes rates cannot be compared without a graph or further information.
- `crossover_assumed_permanent_tie` — Finds the crossover point and assumes the relationships stay equal beyond it.
- `intercepts_compared_instead_of_slopes` — Compares starting values where rates of change were asked for.
- `larger_start_assumed_to_stay_ahead` — Assumes the larger starting value stays ahead regardless of rate.
- `linearity_assumed_to_imply_equal_rates` — Assumes two linear relationships must change at the same rate.
- `rates_summed_instead_of_differenced` — Adds two rates where their difference was required.

### QR.3.8 — 3 topic-specific
- `gcf_not_greatest` — Factors out a common factor that is not the greatest.
- `gcf_written_terms_not_divided` — Writes the greatest common factor outside but copies the original terms inside undivided.
- `only_one_term_divided_by_gcf` — Divides one term by the greatest common factor and copies the other unchanged.

### QR.4.1 — 2 topic-specific
- `rate_applied_to_increment_only` — Applies the rate only to the additional amount rather than to the new total.
- `tier_rates_reversed` — Applies tiered rates to the wrong tiers.

### QR.4.2 — 2 topic-specific
- `divides_before_subtracting_fee` — Divides the total by the per-unit rate without first removing the fixed fee.
- `wrong_period_count_used` — Uses the wrong number of periods, units or people in the computation.

### QR.4.3 — 5 topic-specific
- `later_total_used_as_starting_value` — Uses a value at a later input as the starting value instead of back-solving for it.
- `model_parameters_swapped_between_entities` — Swaps rates or starting values between two modelled entities.
- `sign_wrong_for_decreasing_rate` — Writes a positive rate for a draining or decreasing quantity.
- `starting_values_summed_not_differenced` — Adds two starting values instead of setting the expressions equal.
- `total_change_used_as_rate` — Uses the total change as the rate without dividing by the interval.
