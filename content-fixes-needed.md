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

**Nothing consumes this file *today*.** `scripts/build_bank.py` writes it; no
reader was found. Supabase is seeded by `scripts/seed_questions.mjs`, which
reads `public/data/question_bank.json`.

**But the rows are not inert — they reached prod.** An earlier version of this
note said they were, on the strength of the current code paths. A direct read of
the prod `questions` table disproved it: prod holds **1,124 rows against the
bank's 1,116**, and the extra eight are exactly the eight IDs above. Some
earlier upload carried them in. See the orphan-rows entry below.

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

---

## Eight orphan rows live in prod — needs a decision

`QR_A_006`, `QR_A_008`, `QR_A_009`, `QR_B_008`, `QR_B_009`, `QR_P_006`,
`QR_P_008`, `QR_P_009`

Confirmed by reading the prod `questions` table directly: it holds **1,124 rows
where the served bank holds 1,116**, and the eight extra are exactly these. They
are the same IDs as the stale-artifact entry above — the artifact is where they
survive in the repo, but prod is where they are actually being served.

What is true of them in prod:

- **No counterpart in current source.** Absent from `data/items/` and from
  `public/data/question_bank.json`. Nothing regenerates or validates them.
- **Untagged.** They carry no `misconception_tag` — 1,116 of prod's 1,124 rows
  have one, and these eight are the entire remainder. Any coverage query that
  reports "8 untagged items" is counting these, not a gap in the tagging pass.
- **Four of their sibling IDs collide.** `QR_A_007`, `QR_B_007` and `QR_P_007`
  are QR.1.5 in current source; `QR_B_006` is QR.1.2. So the ID space these rows
  live in is one where the same key means different questions in different
  corpora.

**Why it needs a decision rather than a fix.** Deleting them is destructive and
they may have student answer history attached; leaving them means prod keeps
serving items no one can regenerate, review or retag. Neither is obviously
right, and the choice depends on facts not visible from the repo:

- Do `student_responses` / `student_misconceptions` reference these `item_id`s?
- Were they ever actually served, or are they inert rows the CAT never selects?

**Options:**

- **Delete from prod** once confirmed unreferenced — smallest surface, removes
  the collision hazard.
- **Reconcile** — re-author them into `data/items/` under IDs that do not
  collide, then let them flow through the normal path.

Do not resolve this by regenerating or re-uploading the bank. A straight upload
from the bank writes the 1,116 rows it knows about and **leaves these eight
untouched**, because the seed matches on `item_id` and never sees them.

---

## One source of truth for the question bank (tech debt)

`public/data/question_bank.json` and `data/items/` are two files that disagree,
with **no generator and no guard between them**. This is the root cause behind
the closed PR #58 and the entry above; #59 worked around it rather than fixing
it.

The divergence: the bank carries LaTeX-wrapping migrations (`$x^{2}$`,
`$\frac{1}{2}$`, `$\sqrt{120}$`) applied to it directly and never back-ported.
`data/items/` has held bare Unicode since its first commit. `MathText.tsx` only
typesets `$...$` spans containing real LaTeX syntax, so the two files render
differently: regenerating the bank from source silently downgrades 439
superscripts, 169 radicals and 48 fractions to literal text.

Three things are missing, and each is a separate piece of work:

1. **Port the LaTeX migrations back into `data/items/`** so one file is
   genuinely authoritative. Touches notation across 1,116 items and needs its
   own review — this is the bulk of the effort.
2. **Give the bank a real generator.** Nothing writes
   `public/data/question_bank.json` today; `build_bank.py` writes `data/build/`,
   which nothing reads. Until an export step exists, "regenerate the bank" is
   not an operation anyone can safely perform.
3. **Close the scanner's blind spot.** `scan_unwrapped_latex.py` finds LaTeX
   commands sitting *outside* `$...$`, so it reports CLEAN on both the wrapped
   and the stripped bank — it cannot see *missing* wrapping. It needs a check
   for math-like content (superscripts, radicals, fractions) appearing outside a
   math span, or a direct source-vs-bank notation diff.

**Not urgent, but real.** Nothing forces these files back into agreement, so the
next person to touch either one re-opens the same divergence, and the existing
guard will not report it.

---

## Eight items carry malformed math delimiters

Found on 2026-08-12 by an independent verification pass over the prod
`questions` table, run to confirm the text restore of 2026-08-11 landed cleanly.
It did — all 1,116 matched rows match the served bank byte for byte on all five
content fields. These eight are a separate, **pre-existing** defect that the
restore neither caused nor repaired.

They were checked against the pre-restore snapshot
(`questions_before_20260811T031840Z.json`) and were already malformed in prod
before that write. For `AR_A_010` the restore's only change to the affected
string was a Unicode `−` to an ASCII `-`; the broken delimiter passed straight
through. They are identical in `public/data/question_bank.json` and in prod, so
this is bank content, not a deployment artifact.

Three classes, all of which break rendering rather than merely reading oddly —
`MathText.tsx` typesets `$...$` spans, so a mispaired delimiter takes the
following prose into a math span with it.

**1. Unclosed `$` — an opening delimiter with no closing one**

| item | field | text |
|---|---|---|
| `AR_A_010` | `distractor_logic.B` | `...to obtain $\frac{1}{x - k}, then reads the domain...` |
| `AR_B_041` | `distractor_logic.B` | `...computing $\frac{x_2 - x_1}{y_2 - y_1} = \frac{3}{-6} = \frac{-1}{2}.` |
| `AR_B_043` | `strategy_hints[0]` | `$Slope = \frac{y_2 - y_1}{x_2 - x_1}. Be careful subtracting...` |

**2. Nested `$` inside a `\frac` argument**

| item | field | text |
|---|---|---|
| `GR_A_033` | `distractor_logic.D` | `$\sqrt{($\sqrt{}$16)}$` |
| `QR_A_025` | `distractor_logic.D` | `$\frac{$\sqrt{3}$ + 1}{$\sqrt{3}$ + 1}$` |
| `QR_A_027` | `distractor_logic.C` | `$\frac{$\sqrt{5}$ + $\sqrt{2}$}{$\sqrt{5}$ + $\sqrt{2}$}$` |

This class is the one most likely to be missed by a checker: the dollar count is
*even*, so any balance-counting guard passes it. The renderer still closes the
span at the first inner `$`, leaving `\frac{` unterminated and the rest of the
sentence inside math mode. `GR_A_033` additionally has an empty `\sqrt{}`.

**3. Unescaped literal `$` in prose**

| item | field | text |
|---|---|---|
| `PR_P_067` | `question_text` | y-axis labeled `'Monthly Energy Bill ($)'` |
| `PR_A_070` | `question_text` | y-axis labeled `'Monthly Grocery Spending ($)'` |

Both items escape their other currency amounts correctly (`\$200`, `\$400`), so
the axis-label `$` is a single unescaped delimiter that opens a span with no
partner. Note the neighbouring `PR_P_070` is **clean** — it is not part of this
set.

**Fix:** an authoring pass over the affected fields. Not scriptable with
confidence: class 2 in particular needs a human to decide what the intended
expression was, since the inner `$` pairs have to be removed rather than
balanced, and `GR_A_033`'s empty `\sqrt{}` has lost its operand. Deliberately
not fixed as part of the restore or the misconception work.

**Adjacent, noticed while reading:** `AR_B_043`'s second hint writes
`$(x_1, y_2)$ = (0, -2)` where the first coordinate should be `(x_1, y_1)`.
Same field, different (non-delimiter) defect — worth catching in the same pass.

**This extends the scanner gap** noted in the entry above.
`scan_unwrapped_latex.py` looks for LaTeX commands sitting outside `$...$`, so
it is blind to *missing* wrapping (documented above) and equally blind to
*malformed* wrapping (all three classes here). A guard that only counts
delimiters would still miss class 2. Worth folding into the same piece of work.
