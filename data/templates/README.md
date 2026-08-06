# Parameterized item templates

A template is an existing, already-verified item whose numbers have been lifted
out into named parameters. The same template rolls a fresh instance every time a
student needs one -- so a wrong answer can be followed by a *similar* problem
rather than by the answer to the problem in front of them.

Two pools are described in this directory, and they are not equals. The 15
CAT-bank templates in `QR.3.5.json` are **parked**: verified, complete, and not
the runtime source. Phase B templates the curriculum practice items instead.
Read the status section next before using anything here.

No AI is in this loop. A template's correct answer and each of its distractors
are hand-authored formulas, checked by `scripts/verify_templates.py` against the
whole parameter range. That is the same rule the bank already runs on ("every
wrong-answer choice must be independently verified as numerically reachable via
its stated misconception"), applied one level up: to the formula rather than to
the instance.

The CAT diagnostic bank, `questions`, and `questions_public` are untouched by any
of this -- the exposure-control separation between the placement bank and
curriculum content stays intact.

(An earlier draft of this file said templates live in a table named
`public.curriculum_item_templates`. No such table was ever created, and with
Phase B scoped to curriculum practice none is needed: a curriculum template is
authored in the topic markdown and lands in a column on `curriculum_topics`,
the same path `practice_items` and `misconception_tags` already take.)

## Status -- these 15 templates are PARKED, and are not the runtime source

Settled by Juan on 2026-08-06. Phase B targets the **curriculum practice**
items, not these. Recorded here so a later session does not re-litigate it or
mistake a passing `verification_status` for something a student can reach.

**What these 15 are:** a complete, independently verified proof that the method
works. All 15 pass `scripts/verify_templates.py` at 14,554 parameter sets,
exhaustive (full grid enumeration, not sampling) for every template, run
2026-08-06. That result stands and is not being thrown away.

**What they are not:** the eventual runtime source. Nothing here is wired to a
student, and on current plans nothing here ever will be.

### Why the scope moved

The pilot exists to serve one thing: GUMU's retry and remediation loop, where a
wrong answer is followed by a *similar* problem instead of the answer. That loop
is structurally out of reach for a bank item.

- `record_misconception` is called from exactly one place,
  `app/api/curriculum/practice/route.ts`. The CAT flow, `app/api/sessions/route.ts`,
  never calls it -- it only increments exposure counters.
- `gumu_sessions` is keyed on `(course_id, topic_id, section, item_number)` plus
  `original_selected_answer` and `misconception_tag` (`sql/gumu_tables.sql`).
  There is no `item_id` column. A CAT-bank item cannot be named in that key
  space at all, so the Socratic loop cannot address one.
- Attributing a wrong answer to a misconception needs a stable slug. Curriculum
  practice items carry `misconception_tag` keyed by option letter. Bank items do
  not: every item under `data/items/` carries `distractor_logic` prose and no
  slug field at any level.

Authoring new slugs for the bank items would have closed that gap fastest, and
was rejected -- it invents misconception vocabulary, and the QR_A_074 resolution
below is built on that rule holding. The unblocking step named at the time was
authoring QR.3.5 curriculum practice content. That shipped in PR #45, and Phase B
follows it rather than these templates.

### What that changes for QR_A_074

QR_A_074's narrowed range was accepted because, in the bank, the
`distractor_logic` sentence *is* the misconception's identity, so rewording it
would silently rename a misconception the teacher dashboard already displays.
On the curriculum side the slug is the identity and the prose is per-item
explanation, so the same reword renames nothing. The general form that was
correctly refused here is available to a curriculum-scoped template. That is a
consequence of the scope change, not a reversal of the QR_A_074 decision, which
remains correct for as long as this file is bank-scoped.

### Conditions for reviving these 15

Not "someday" -- specifically. A CAT-scoped template pays off only as exposure
control, and that mechanism is not currently enforced: `exposure_max` is declared
at `app/adaptive-test/type.ts:53` and never read anywhere, `times_administered`
is incremented and never consumed, and `selectNextItem` filters only on
within-session `seenIds`. Wiring real cross-session exposure control is the
prerequisite; until then a rolled bank item varies numbers nothing is asking to
have varied. Tracked as a separate future item, deliberately out of scope for
Phase B.

### Where the live work is

`QR.3.5_curriculum_source_audit.md` in this directory, against the 14 graded
items in `curriculum/source/tsia2-math/unit-1/QR.3.5.md`. The schema, the
harness, and the rules below are shared; only the anchor and the source pool
differ. See that file's header for the anchor change.

## Files

    QR.3.5.json               PARKED. 15 CAT-bank templates, one array entry
                              per source item. Verified, not the runtime source.
    QR.3.5_source_audit.md    PARKED. The 15 bank items as they exist today, and
                              the per-item judgment on whether each parameterizes

    QR.3.5_curriculum_source_audit.md
                              LIVE. The 14 graded curriculum practice items, and
                              the same per-item judgment. Phase B's source pool.

Curriculum-scoped templates are not stored in this directory at all. They live
as a fenced `json` block beside the `distractor_logic` and `misconception_tag`
blocks already in Part 4 of the topic markdown, so one item's question, answer
key, misconception slugs and template stay in one place and cannot drift apart.
`stripAuthoringBlocks` already hides those blocks from the rendered page.

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

### The anchor for curriculum-scoped templates

Same idea, different fields, because the two pools do not store the same things
and do not show the same things to a student.

A curriculum template anchors on the parsed `practice_items` entry: `stem`, all
four `choices`, `correct_answer`, and the whole `misconception_tag` map, all
byte for byte at `canonical_parameters`. It does **not** anchor on the worked
solution. Two reasons, and the second is the load-bearing one:

- The worked solution is not a field. It is a slice of the Part 4 markdown blob
  in `curriculum_topics.answer_key`, cut at read time by `splitAnswerKey`, and
  it is teacher-only -- `loadTopic` does not even select the column for a
  student. A CAT `explanation`, by contrast, is student-facing:
  `app/api/items/reveal/route.ts` serves it to any authenticated student. The
  anchor is protecting a different audience on each side.
- Curriculum solutions carry substitution checks ("Check with `a = 1`. Original:
  `5(-1) - 4(-1) = -5 + 4 = -1`"). Those values are sign-sensitive: a different
  roll turns `5(-1)` into `5(1)` and `-5 + 4` into `-5 - 4`. Reproducing them
  byte for byte would require exactly the sign-repair logic this schema keeps
  out on purpose (see "Signs live in the template, not in the parameters"), in
  order to protect text no student ever reads.

Anchoring `misconception_tag` is not a consolation for dropping the explanation.
It is stronger than anything the bank-scoped anchor can do: the slug is what
GUMU consumes, bank items have no slug field, and so the CAT anchor cannot check
it at all. It also makes the pool-level sign-error rule derivable rather than
hand-set -- `sign_error_coverage` is a hand-written boolean on a bank template,
where on a curriculum template it is just
`any(tag == "drops_negative_on_group")` and cannot be set wrong.

**Known consequence, accepted.** A rolled instance makes the authored worked
solution stale for that roll: a teacher reviewing the attempt sees the canonical
problem's solution, not the one the student answered. Decided 2026-08-06 to
accept this and show the canonical solution with a plain note that the student
saw a rolled variant. Templating the solution itself was considered and
declined -- it buys teacher-facing polish at the cost of the sign-repair
machinery above.

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
