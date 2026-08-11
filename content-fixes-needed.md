# Content fixes needed

Content-authoring defects found while wiring up misconception tagging. These
are not code bugs — nothing here is fixed by changing the app. They need a
pass over the curriculum source markdown in `curriculum/source/tsia2-math/`.

Both items below are the same underlying cause: the distractors were authored
formulaically rather than per-problem. They should be fixed in one pass.

---

## 1. Correct-answer position bias

The correct answer sits at option **A** in 78% of Unit 1 answer-key items, and
option **D** is *never* correct in the entire unit.

| Topic | Items | A | B | C | D |
|---|---|---|---|---|---|
| QR.1.1 | 7 | 1 | 4 | 2 | 0 |
| QR.1.2 | 14 | 10 | 1 | 3 | 0 |
| QR.1.3 | 14 | 12 | 2 | 0 | 0 |
| QR.1.4 | 14 | 12 | 2 | 0 | 0 |
| QR.2.1 | 14 | **14** | 0 | 0 | 0 |
| **Total** | **63** | **49** | 9 | 5 | **0** |

QR.2.1 is the worst case: every one of its 14 items answers A.

**Why it matters beyond assessment validity.** A student who always picks A
scores ~78% without reading the questions, and — more damaging for us —
generates almost **zero** misconception evidence, because correct options
carry no tag. The `student_misconceptions` table stays empty for exactly the
students who most need remediation. This corrupts the aggregate the teacher
dashboard, Socratic AI, and parent digest all read.

**Fix:** shuffle correct-answer positions to roughly uniform across A–D.
Note this requires editing both the item body and the answer key together,
since `distractor_logic` and `misconception_tag` are keyed by option letter.

---

## 2. Repeated slug-per-position tuples

Within a single topic, many items map B/C/D to the *same three slugs in the
same order*. Every tagged topic shows this:

| Topic | Blocks | Repeated tuples | Worst case |
|---|---|---|---|
| QR.1.2 | 14 | 1 | ×3 — B=percent_sign_confusion, C=fraction_digit_gluing, D=percent_decimal_overshift |
| QR.1.3 | 14 | 2 | ×2 — B=place_value_slip, C=stops_before_simplifying, D=numerator_denominator_swap |
| QR.1.4 | 14 | 4 | ×3 — B=halves_the_radicand, C=wrong_perfect_square_bracket, D=radicand_mistaken_for_value |
| QR.2.1 | 14 | 3 | **×5** — B=adds_instead_of_scales, C=reversed_division, D=ratio_term_as_value |

**Why it matters.** When the slug is a fixed function of the option letter, a
student's recorded misconception reflects *which position they habitually
guess*, not what they actually misunderstand. Combined with issue 1, a student
who always picks B in QR.2.1 gets `adds_instead_of_scales` recorded five times
and reaches `confidence = 'high'` on a misconception there is no evidence they
hold. That is worse than no data: `record_misconception()` will escalate
confidence on noise.

Two narrower cases worth flagging:

- **QR.1.3 item 10** tags all three wrong options with the *same* slug
  (`terminating_test_confusion` for B, C, and D). No matter which wrong answer
  the student picks, the diagnosis is identical, so the item distinguishes
  nothing.
- **QR.1.4** has one block with no B tag, i.e. B is the correct answer there —
  one of the few non-A items in the unit.

**Fix:** vary which misconception each distractor embodies, per problem, so the
option letter carries no information about the slug.

---

## 3. `distractor_logic` blocks are rendered to students

Pre-existing, lower severity, but related.

`answer_key.raw` is passed to `dangerouslySetInnerHTML` in
`app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/page.tsx:126`, so the
fenced ` ```json ` blocks — including the `misconception_tag` maps — display
as raw code inside the answer-key `<details>` on the topic page.

**Fix:** strip fenced JSON blocks at render time in
`renderMarkdownWithMath()` (or before it). That also lets the tag metadata grow
without cluttering the student view.

---

## Not a defect, but a gap

**QR.1.1 has no `distractor_logic` blocks at all.** It uses an older format
with per-option prose and several free-response items, and carries zero
misconception slugs, so it contributes nothing to `misconception_tags`
(stored as `{}`). It needs conversion to the newer format before it can feed
the misconception aggregate. Tagging it today would mean inventing
attributions that the content does not support.

---

## Compound-error distractor — `GR_A_034` option B (GR.2.6)

Found during Phase 3 misconception tagging. The distractor names **two
entangled errors in one option**, which violates the bank's standard that a
distractor traces to exactly one coherent error:

> "Student computes the cone's contribution without the ⅓ factor:
> πr²h = 3.14 × 16 × 6 = 301.44 cm³ **and reports that alone**."

The item asks for the total volume of a cylinder (r=4, h=10) topped by a cone
(r=4, h=6); the correct answer is 602.88 cm³.

Neither error reaches choice B's value on its own:

| student does | result | matches |
|---|---|---|
| omits ⅓ on the cone, still adds the cylinder | 502.4 + 301.44 = 803.84 | choice **A** |
| reports the cone alone, ⅓ applied correctly | 100.48 | no choice |
| **omits ⅓ *and* reports the cone alone** | 301.44 | choice **B** |

**Tagged as** `omits_fractional_factor` — the arithmetic the value actually
verifies is the missing ⅓ (301.44 is exactly πr²h for the cone). The "reports
it alone" clause is the second, untagged error.

**Fix:** rewrite so option B traces to one error, or change the value so a
single error reaches it. Not resolvable by tagging — a compound distractor
cannot be attributed to one misconception without discarding half of what it
describes.

---

## Stale build artifact — `data/build/question_bank.json`

Not a content defect. Recorded here because it *looks* like one, and cost a
round of investigation before it resolved as a false alarm.

Eight QR.1.1 item IDs appear to be untagged items missing from the misconception
work:

`QR_A_006`, `QR_A_008`, `QR_A_009`, `QR_B_008`, `QR_B_009`, `QR_P_006`,
`QR_P_008`, `QR_P_009`

**They are not a gap.** They exist in exactly one file in the repo —
`data/build/question_bank.json`, a stale build artifact holding 465 items with
zero misconception tags bank-wide, last regenerated at `9d78916` ("Add PR.1.4 &
PR.1.5 items"). They are absent from `data/items` (canonical, 1,116 items) and
from `public/data/question_bank.json`. The tagging pass ran over `data/items`,
so these rows were never in scope. They also carry full per-option
`distractor_logic` — they are not the older format described in the QR.1.1 note
above, and the two issues are unrelated.

**Nothing consumes this file.** `scripts/build_bank.py` writes it; no reader
was found. Supabase is seeded by `scripts/seed_questions.mjs`, which reads
`public/data/question_bank.json`. So the stale rows are inert on the current
paths.

**The real risk: item IDs are reused across corpora.** Four IDs that the stale
artifact files under QR.1.1 now identify *different questions under different
topics* in current source:

| item ID | stale artifact | current `data/items` |
|---|---|---|
| `QR_A_007` | QR.1.1 | QR.1.5 |
| `QR_B_007` | QR.1.1 | QR.1.5 |
| `QR_P_007` | QR.1.1 | QR.1.5 |
| `QR_B_006` | QR.1.1 | QR.1.2 |

Any future reconciliation keyed on `item_id` — backfilling tags, auditing
coverage, diffing against a deployed bank, reconciling `student_misconceptions`
rows — that reaches for this artifact will **match successfully and silently
attribute the wrong question**. The failure is quiet: no missing key, no error,
just a row describing a QR.1.5 problem filed under QR.1.1.

**Fix — two options, not yet decided:**

- **If the artifact is dead:** delete `data/build/` and add it to `.gitignore`,
  so a build output stops being mistaken for source.
- **If it is not dead:** document what writes it, what reads it, and when it is
  expected to be regenerated — and note that its `item_id`s are not stable
  across time, so it must never be used as a reconciliation key.

Determining which of these applies requires knowing whether anything outside
this repo pulls from `data/build/`.
