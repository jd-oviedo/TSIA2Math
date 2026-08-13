# Content fixes needed

Content-authoring defects found while wiring up misconception tagging. These
are not code bugs — nothing here is fixed by changing the app. They need a
pass over the curriculum source markdown in `curriculum/source/tsia2-math/`.

Both items below are the same underlying cause: the distractors were authored
formulaically rather than per-problem. They should be fixed in one pass.

Open decisions about *system behaviour* — where the code is defensible but the
alternatives need weighing — live in `design-decisions.md` instead.

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

**Nothing shuffles at render time — confirmed 2026-08-13.** This is what turns
the skew above from a statistical wart into an exploitable one, and it was not
written down anywhere until now. `PracticeQuiz.tsx` contains no shuffle, sort,
or randomisation of any kind; it renders `answer_choices` in authored A–D
order, so the position bias reaches students exactly as stored. `GatedQuiz.tsx`
and the CAT `ItemCard.tsx` likewise render in authored order.

`build_bank.py` used to soften its own skew warning with "Ignore if your app
shuffles choices at render time." That escape hatch was false — no such
shuffling exists — and the warning has been reworded to say so (2026-08-13).

**Fix:** shuffle correct-answer positions to roughly uniform across A–D.
Note this requires editing both the item body and the answer key together,
since `distractor_logic` and `misconception_tag` are keyed by option letter.
Doing it at render time instead would need the shuffle to carry
`distractor_logic` and `misconception_tag` along with each option, since both
are keyed by letter — a render-time shuffle that moves only the visible text
would silently mis-tag every misconception it records.

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

### Second, separate issue on the same item — `GR_A_034` option A tag

Found 2026-08-13, while checking whether `AR_A_010`'s prose mismatch shared a
root cause with the compound distractor above. It does not — and this is a
third, unrelated defect again: `AR_A_010` was prose pointing at the wrong
*choice*, option B above is a *compound* distractor, and this one is prose
disagreeing with its *tag*. **Two separate problems therefore live on
`GR_A_034`** (option B and option A), logged apart so neither gets closed by
fixing the other.

Option A is tagged **`omits_second_component`**, but its prose describes no
omission at all:

> "Student uses the cylinder formula for the entire composite height
> (10 + 6 = 16): πr²(16) = 3.14 × 16 × 16 = 803.84 cm³."

That student did not drop the cone — they *merged* it into the cylinder,
treating the whole solid as one prism-like body of height 16. Both components
are still present in their calculation; what is wrong is the shape assumed for
the top one. `omits_second_component` is the right tag for option **C**, whose
prose genuinely does omit the cone ("computes only the cylinder volume and omits
the cone entirely: 502.4 cm³") — and C carries that same slug today. So the two
options share a tag that only describes one of them.

The value itself is fine: 3.14 × 16 × 16 = 803.84 is exactly choice A, and a
single error reaches it, so this is **not** a compound distractor.

**Fix:** retag option A with a slug naming the actual error — the cone treated
as a continuation of the cylinder rather than a cone (something in the shape of
`component_shape_ignored` / `cone_treated_as_cylinder`; needs a slug that exists
in the taxonomy, or a new one added to it). Not a prose change — the prose is
accurate, the tag is not. Deliberately left alone in the 2026-08-13 pass, which
was scoped to rendering and to prose that pointed at the wrong answer choice.

**Why it matters.** Every wrong pick on A *or* C currently records
`omits_second_component`, so the aggregate cannot distinguish a student who
forgot the cone from one who used the wrong formula for it. Those need different
remediation, and `record_misconception()` will escalate confidence on the merged
signal. Same failure mode as the slug-per-position problem in issue 2 above.

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

## Eight items carry malformed math delimiters — RESOLVED 2026-08-13

> **Status:** closed. 5 items fixed, 3 turned out not to be defects. Nothing here
> is outstanding — see "Current state of this list" below before acting on the
> historical detail that follows it.

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

> **Naming.** The three groups below are **Shape A / Shape B / Shape C**. They
> were called "class 1/2/3" until 2026-08-13; renamed because "Class 1 / Class 2"
> now means something different and unrelated in the slash-notation audit at the
> end of this file (unconverted slash vs. corrupted `\frac`). Two numbering
> schemes for two different taxonomies was a trap waiting for a future session.

Three shapes. **Correction 2026-08-13:** the original entry said all three
"break rendering" because "a mispaired delimiter takes the following prose into
a math span with it." That mechanism is wrong, and the difference matters for
triage. `parseMathSegments` only ever forms a span from a *matched pair* of `$`.
Every surviving item has exactly **one** unescaped `$`, so no pair forms, no
span opens, and no prose is swallowed. What actually happens is milder and
varies by shape — see the per-shape verdicts below.

**Shape A. Unclosed `$` — an opening delimiter with no closing one**

| item | field | text | status |
|---|---|---|---|
| `AR_A_010` | `distractor_logic.B` | `...to obtain $\frac{1}{x - k}, then reads the domain...` | **FIXED 2026-08-13** |
| `AR_B_041` | `distractor_logic.B` | `...computing $\frac{x_2 - x_1}{y_2 - y_1} = \frac{3}{-6} = \frac{-1}{2}.` | **FIXED 2026-08-13** |
| `AR_B_043` | `strategy_hints[0]` | `$Slope = \frac{y_2 - y_1}{x_2 - x_1}. Be careful subtracting...` | dead code — field never rendered |

*Actual effect:* no math renders at all in that string — the whole field
degrades to plain text, so the reader sees **raw LaTeX source**, e.g. literally
`Student inverts the formula, computing $\frac{x_2 - x_1}{y_2 - y_1} = ...`.
Ugly and visibly wrong, but the prose is intact and nothing is hidden.

**Shape B. Nested `$` inside a `\frac` argument**

| item | field | text | status |
|---|---|---|---|
| `GR_A_033` | `distractor_logic.D` | `$\sqrt{($\sqrt{}$16)}$` | **FIXED 2026-08-13** |
| `QR_A_025` | `distractor_logic.D` | `$\frac{$\sqrt{3}$ + 1}{$\sqrt{3}$ + 1}$` | **FIXED 2026-08-13** |
| `QR_A_027` | `distractor_logic.C` | `$\frac{$\sqrt{5}$ + $\sqrt{2}$}{$\sqrt{5}$ + $\sqrt{2}$}$` | **FIXED 2026-08-13** |

All three of Shape B are now closed. `QR_A_025` and `QR_A_027` were repaired as
a side effect of the QR.1.5 slash-notation pass; `GR_A_033` was repaired
directly. Crucially, the *source* of this class was never nested `$` at all —
it was raw Unicode (`√`, `Δ`, `²`) sitting inside an existing `$...$` span,
which `migrate_math.py` then wrapped a second time at build time. That build
defect is fixed too (see below), so this class cannot reappear on the next
build.

This class is the one most likely to be missed by a checker: the dollar count is
*even*, so any balance-counting guard passes it. The renderer still closes the
span at the first inner `$`, leaving `\frac{` unterminated and the rest of the
sentence inside math mode. `GR_A_033` additionally has an empty `\sqrt{}`.

**Shape C. Unescaped literal `$` in prose**

| item | field | text | status |
|---|---|---|---|
| `PR_P_067` | `question_text` | y-axis labeled `'Monthly Energy Bill ($)'` | not broken — latent only |
| `PR_A_070` | `question_text` | y-axis labeled `'Monthly Grocery Spending ($)'` | not broken — latent only |

Both items escape their other currency amounts correctly (`\$200`, `\$400`), so
the axis-label `$` is a single unescaped delimiter with no partner. Note the
neighbouring `PR_P_070` is **clean** — it is not part of this set.

*Actual effect:* **none — these two render correctly today.** With one unescaped
`$` and no partner, no span forms, so the axis label displays as
`Monthly Energy Bill ($)`, which is exactly what the author intended, and the
escaped `\$200` / `\$80` amounts still render as `$200` / `$80`. Shape C is a
**latent fragility, not a live defect**: the stray delimiter would pair with the
first `$` anyone adds to that field later, and *then* swallow the prose between.

**Fix:** an authoring pass over the affected fields. Not scriptable with
confidence: Shape B in particular needed a human to decide what the intended
expression was, since the inner `$` pairs had to be removed rather than
balanced. Deliberately not fixed as part of the restore or the misconception
work.

---

### Current state of this list — verified 2026-08-13

**Every item on this list that was rendering wrong has been fixed.** Five of the
eight were repaired; the other three turned out not to be live defects at all.
Read the two tables below as "5 fixed, 3 reclassified" — **not** as five
outstanding bugs.

**Fixed (5 of 8)**

| item | field | shape | fixed by |
|---|---|---|---|
| `QR_A_025` | `distractor_logic.D` | B | QR.1.5 slash-notation pass (side effect) |
| `QR_A_027` | `distractor_logic.C` | B | QR.1.5 slash-notation pass (side effect) |
| `GR_A_033` | `distractor_logic.D` | B | build-defect pass, fixed directly |
| `AR_A_010` | `distractor_logic.B` | A | closed the unpaired `$`, 2026-08-13 |
| `AR_B_041` | `distractor_logic.B` | A | closed the unpaired `$`, 2026-08-13 |

`AR_A_010` and `AR_B_041` were the only two items on this list a human could
actually see rendered wrong: both showed **raw LaTeX as literal text** to a
signed-in student who picked option B, and to teachers on the dashboard. Both
were delimiter-only edits — no prose rewritten — and both still match their
answer choice and misconception tag (`AR_B_041`: Δx/Δy = 3/−6 = −½ → choice B,
`slope_run_over_rise`; `AR_A_010`: cancelling (x+k) does give 1/(x−k)).

**Not defects — reclassified, no action needed (3 of 8)**

| item | field | true status |
|---|---|---|
| `AR_B_043` | `strategy_hints[0]` | **Dead code.** No component renders `strategy_hints`; it exists only as a type declaration at `app/adaptive-test/type.ts:52`. Invisible to students and teachers alike. Source tidiness only. |
| `PR_P_067` | `question_text` | **Not broken.** Renders correctly — see Shape C above. Logged as latent fragility only. |
| `PR_A_070` | `question_text` | **Not broken.** Same. Logged as latent fragility only. |

`AR_B_043`'s other field, `distractor_logic.D`, *was* a real defect and was
fixed in the build-defect pass. Only its hint remains untouched, and that is the
dead-code field above.

Render surfaces were checked in code, not assumed. `distractor_logic` reaches
students as `distractor_note` from `app/api/items/reveal/route.ts:39`, which
returns it **only when the request is authenticated**, and reaches teachers as
`distractor_text` in `TeacherDashboardClient.tsx:579` and
`teacher/student/[id]/page.tsx:335`.

**Verification of the two 2026-08-13 fixes.** Whole-bank KaTeX parse: 1 hard
failure bank-wide, and it is `AR_A_009`'s `\fract` (issue #33, unrelated).
Unpaired-`$` scan across every content field now returns only the three
reclassified fields above. Both repaired strings were rendered through the real
`MathText` component in a browser with the text fetched live from prod, and both
typeset. **The teacher dashboard page itself was not visually confirmed** — it
is auth-gated and no credentials were used — so what is verified is the shared
rendering component and the exact prod string, not the dashboard chrome around
them.

**Found during verification, since FIXED — `AR_A_010` option B prose.** Noticed
while re-checking the misconception after the delimiter repair, and corrected in
a separate content pass (see the entry below).

**Root cause of Shape B, found 2026-08-13.** `migrate_math.py`'s
`convert_string()` applied every Unicode→LaTeX rule to the whole string with no
math-span guard, unlike its two sibling scripts which both skip `$...$`
segments. Two ways it broke: (a) a rule fired inside a span that came from the
source (`$\frac{Δx}{Δy}$` → `$\frac{$\Delta$x}{$\Delta$y}$`), and (b) a rule
fired inside a span the same function had *just created* — the radical rule
built `$\sqrt{(x²)}$`, then the superscript rule wrote into it, giving
`$\sqrt{($x^{2}$)}$`. Mode (b) is why guarding once at entry is insufficient;
the fix re-splits before every rule. This also explains the "lost operand"
above: `GR_A_033`'s `\sqrt{}` never had one — the bare-`√` fallback emits an
empty radical and leaves the operand as trailing text.

**Adjacent, noticed while reading:** `AR_B_043`'s second hint writes
`$(x_1, y_2)$ = (0, -2)` where the first coordinate should be `(x_1, y_1)`.
Same field, different (non-delimiter) defect — worth catching in the same pass.

**This extends the scanner gap** noted in the entry above.
`scan_unwrapped_latex.py` looks for LaTeX commands sitting outside `$...$`, so
it is blind to *missing* wrapping (documented above) and equally blind to
*malformed* wrapping (all three shapes here). A guard that only counts
delimiters would still miss Shape B. Worth folding into the same piece of work.

---

## Slash-notation audit — Class 1 (open) and Class 2 (fixed)

Found 2026-08-13, while chasing a report that `QR_A_027` choice D rendered as
"10√ 3/3" on the live adaptive test. A sweep of all four strands for slash
notation that should be `\frac` turned up **two unrelated categories**, named
here so later sessions can refer to them precisely:

- **Class 1 — unconverted plain slash.** The original `migrate_fractions.py`
  gap: it only ever handled simple digit/digit fractions, never multi-term
  expressions. **Still open by decision** — see the end of this section.
- **Class 2 — corrupted `\frac`.** A *regression*, not a gap: a later script
  wrapped fragments of expressions and changed the mathematics. **Fixed**, and
  the script that caused it is quarantined. Detailed below.

These two are **not** the same taxonomy as Shape A/B/C in the malformed-delimiter
entry earlier in this file — different defect, different items, different fix.

### Class 2 — ten items corrupted by `migrate_letter_fracs.py`

`migrate_letter_fracs.py` (run once, in commit `7ff9803`, 2026-06-24) carried
this rule:

```python
re.sub(r'(?<![\\$\w])(\d+)\s*/\s*(\d+)(?!\d)', ...)
```

`\s*` lets it span the spaces in `a / b`, and its left guard is `\w` — which
U+221A (`√`) is not. So it matched *fragments* of larger expressions and wrapped
them as standalone fractions, changing the mathematics rather than just the
notation:

| item | field | authored | after the script |
|---|---|---|---|
| `QR_A_027` | `answer_choices.D` | `10√3 / 3` | `10√$\frac{3}{3}$` |
| `QR_A_025` | `answer_choices.B` | `7√3 / 2` | `7√$\frac{3}{2}$` |
| `PR_A_031` | `explanation` | `21.5 / 0.25` | `21.$\frac{5}{0}$.25` |
| `PR_A_063` | `explanation`, `dl.D` | `0.30 / 0.40` | `0.$\frac{30}{0}$.40` |
| `PR_A_076` | `explanation`, `dl.B/C/D` | `25 / 1.25` | `$\frac{25}{1}$.25` |
| `PR_A_079` | `explanation`, `dl.D` | `75 / 1.25` | `$\frac{75}{1}$.25` |
| `PR_P_061` | `explanation` | `0.24 / 0.60` | `0.$\frac{24}{0}$.60` |
| `QR_A_042` | `strategy_hints[2]` | `1 / 0.80` | `$\frac{1}{0}$.80` |
| `QR_A_046` | `strategy_hints[2]` | `200 / 1.5` | `$\frac{200}{1}$.5` |
| `QR_B_050` | `dl.C` | `1 / 0.08` | `$\frac{1}{0}$.08` |
| `QR_A_027` | `strategy_hints[1]` | `10 / 3.6` | `$\frac{10}{3}$.6` |
| `QR_A_025` | `strategy_hints[1]` | `9.1 / 2` | `9.$\frac{1}{2}$` |

Two variants: a decimal split across the slash (most of them), and a radical
left stranded outside the span it belonged to (the two answer choices). The answer
choices are the damaging ones — `QR_A_027.D` was authored as
$\frac{10\sqrt{3}}{3}$ = 5.774, the distractor for "student applies
√a − √b = √(a − b)". Rendered as `10√` followed by a stacked ³∕₃, it is a
different quantity and the misconception it probes is destroyed.

All twelve strings were repaired by hand and each result re-checked
numerically against the surrounding prose. **The script is quarantined** in
`deprecated/migrate_letter_fracs.py` behind a refuse-to-run guard: it is a
completed one-shot migration, so a corrected regex would have no safe use, and
re-running the original re-corrupts `data/items/`.

### Class 1 — still open, deliberately

The gap this script was written to close is real
and remains: roughly 51 items use plain-slash notation for multi-term
expressions in `explanation` and `distractor_logic`. Those are prose, not
student-facing answer choices, and read acceptably inline
(`(4 + 4 + 7 + 10 + 5) / 5 = $\frac{30}{5}$ = 6`). Converting all ~114
occurrences is a large content rewrite with no visible defect driving it, so it
was scoped out. The student-facing subset — `question_text` and
`answer_choices` across all four strands, 6 items — *was* converted.

---

## Distractor prose that resolved to the wrong choice — `AR_A_010` option B (AR.1.5)

Found and fixed 2026-08-13, while re-verifying the misconception tag after that
item's unpaired-`$` repair. **This is a content-logic defect, not a rendering
one** — the LaTeX was fine, the reasoning pointed at the wrong answer.

The item asks for the domain of $f(x) = \frac{x + k}{x^{2} - k^{2}}$, k a
positive constant. Since $x^{2} - k^{2} = (x - k)(x + k)$, the correct answer is
choice C: all reals except x = k and x = −k.

Option B is **"All real numbers, because the (x + k) factors cancel."** Its
prose read:

> "…cancels the common factor (x + k) … to obtain $\frac{1}{x - k}$, then
> **reads the domain of the simplified form as the domain of the original
> function** …"

But the domain of $\frac{1}{x - k}$ is ℝ \ {k} — which is **choice A**, not
choice B. A student following that prose exactly would pick A. The distractor
described a real misconception, just not the one its own option encodes.

**Fixed by** replacing the closing reasoning so it reaches "all real numbers":
the student treats the *act of cancelling* as having removed the restriction and
never inspects the surviving denominator. Verified afterwards that all four
options resolve to themselves:

| option | prose leads to | choice text | |
|---|---|---|---|
| A | excludes only x = k | "except x = k" | match |
| B | no restriction at all | "All real numbers" | **match** (previously → A) |
| C | denominator zero at both roots | "except x = k and x = −k" | match (correct answer) |
| D | solves x = k² rather than x² = k² | "except x = k²" | match |

The `misconception_tag` was already correct and is unchanged — the new prose is
a literal statement of `cancellation_assumed_to_restore_domain`. The opening
clause is preserved verbatim, so the student's actual work ($\frac{1}{x - k}$)
still appears.

**Checked and ruled out as the same root cause:** `GR_A_034` option B. Its prose
*does* resolve to its own choice (301.44 is exactly πr²h for the cone) — its
problem is that two errors are needed to get there. Different defect, still
open, see that entry above. Likewise `GR_A_034` option A's tag mismatch, logged
there as a separate item.

**Worth a sweep.** This class — distractor prose whose reasoning terminates on a
*different* option than the one it is attached to — is invisible to every check
currently in the repo. `build_bank.py` validates structure, the KaTeX pass
validates rendering, and neither reads the prose. `AR_A_010` was found only
because a delimiter repair forced a manual re-read. A pass that re-derives each
distractor's stated arithmetic and confirms it lands on its own option would be
worth writing; there is no reason to think this is the only instance.
