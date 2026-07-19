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
