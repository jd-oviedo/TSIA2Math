# Parameterized item templates

A template is an existing, already-verified bank item whose numbers have been
lifted out into named parameters. The same template rolls a fresh instance every
time a student needs one -- so a wrong answer can be followed by a *similar*
problem rather than by the answer to the problem in front of them.

No AI is in this loop. A template's correct answer and each of its distractors
are hand-authored formulas, checked by `scripts/verify_templates.py` against the
whole parameter range. That is the same rule the bank already runs on ("every
wrong-answer choice must be independently verified as numerically reachable via
its stated misconception"), applied one level up: to the formula rather than to
the instance.

Templates live in a separate table (`public.curriculum_item_templates`). The CAT
diagnostic bank, `questions`, and `questions_public` are untouched by any of
this -- the exposure-control separation between the placement bank and
curriculum content stays intact.

## Status -- Phase A complete, Phase B parked

**Phase A is done and independently verified.** All 15 QR.3.5 templates pass
`scripts/verify_templates.py`: 14,554 parameter sets, exhaustive (full grid
enumeration, not sampling) for every template, run 2026-08-06.

**Nothing here is wired to a student.** Phase B -- rolling a template at runtime
so a wrong answer is followed by a similar problem -- is deliberately deferred.

**These 15 templates are CAT-bank-scoped.** Their sources are the 15 QR.3.5
items in `data/items/QR/QR.3.5.json`, and that is a description of what exists
today, not of where templates ultimately belong. The intended destination is
still curriculum practice, but the bridge does not exist yet in either
direction:

- QR.3.5 has no curriculum practice content at all. `curriculum/source/` covers
  QR.1.1--QR.1.4 and QR.2.1; units 2--5 are empty.
- Runtime wiring needs to attribute a wrong answer to a misconception, which
  needs a stable slug. Curriculum practice items carry `misconception_tag`
  keyed by option letter. Bank items do not -- all 323 items under
  `data/items/` carry `distractor_logic` prose and no slug field at any level.

Authoring new slugs for the bank items would close that gap fastest, and was
rejected: it violates the rule against inventing misconception vocabulary, and
the QR_A_074 resolution is built on that rule. The unblocking step is authoring
QR.3.5 curriculum practice content, a separate project.

## Files

    QR.3.5.json               templates, one array entry per source item
    QR.3.5_source_audit.md    the 15 source items as they exist today, and the
                              per-item judgment on whether each parameterizes

## Schema

A template extends a schema v2.0 item; it does not replace or copy one.
`QR.3.5.json` holds only the fields below, keyed by `item_id`, and is joined to
the source item in `data/items/QR/QR.3.5.json` at load time. Nothing about the
source item is duplicated here, so the two cannot drift apart in the one
direction that would matter -- a template silently carrying a stale copy of a
misconception the bank has since reworded.

The source item's `question_text`, `answer_choices`, `explanation` and
`distractor_logic` therefore keep documenting the *canonical instance*: the roll
you get by substituting `canonical_parameters`. The harness asserts that the
template reproduces all of them byte for byte, which makes the original item a
permanent regression anchor -- a template that drifts away from the item it came
from fails rather than quietly becoming a different question.

| field | type | meaning |
|---|---|---|
| `is_templated` | bool | `true` for pilot items |
| `parameters` | array | `{name, min, max, exclude, integer, step}` -- the rolled values; `step` defaults to 1 and exists so a money amount can roll in multiples of 5 rather than landing on $37 |
| `derived_parameters` | array | `{name, formula, render}` -- computed from parameters, not rolled. `render: "coefficient"` writes 1 as an empty string and -1 as `-`, so a rolled explanation reads `= x` rather than `= 1x` |
| `canonical_parameters` | object | the values that reproduce the original item |
| `constraints` | array | rules beyond individual ranges, e.g. `"a*b != a + b"` |
| `question_template` | string | `question_text` with `{a}`-style placeholders |
| `unsimplified_expression` | string | the question's raw structure, before any simplifying |
| `correct_answer_formula` | string | the simplified answer, in terms of the parameters |
| `distractor_formulas` | object | all four letters; the correct letter repeats the answer formula |
| `distractor_derivations` | object | the three wrong letters, as *unsimplified procedures* |
| `explanation_template` | string | `explanation` with placeholders |
| `verification_status` | string | `pending` / `passed` / `failed` -- written by the harness, never by hand |

`item_id`, `topic_id` and `proficiency_level` repeat from the source item as the
join key and as enough context to read a block on its own.

### Why both `distractor_formulas` and `distractor_derivations`

Checking that a formula equals itself proves nothing. `distractor_formulas` is
the answer choice a student sees; `distractor_derivations` is a second,
independent transcription of what the misconception in `distractor_logic`
actually *does*, written to mirror that sentence step by step and left
unsimplified. The harness simplifies the derivation and requires it to equal the
stored formula. When they disagree, either the formula is wrong or the
misconception was described in a way that does not produce it -- both are real
defects, and neither is visible if you only store one of the two.

`unsimplified_expression` plays the same role for the correct answer: SymPy
re-derives the answer from the question's own structure instead of trusting the
formula that was typed in.

### Signs live in the template, not in the parameters

Every parameter is a positive magnitude. A minus sign is literal text in
`question_template`. This is deliberate: a signed parameter renders `3x + -5x`
and forces sign-repair logic into the display layer, where it would be one more
thing that can be wrong in front of a student. Structural signs never move, so
the rolled question always reads the way the authored one does.

### Difficulty lives in the range, not in the instance

A Basic template whose range can roll a Proficient-difficulty instance is a
defect, not an edge case. Ranges are narrowed (and constraints added) so the
hardest reachable roll still sits inside its own tier -- Basic stays mentally
computable, no rolled combination introduces arithmetic the original tier did
not already ask for.
