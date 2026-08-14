# Deferred: follow-ups from the Unit 1 completion round

Opened 2026-08-14, alongside the nine-topic batch that completed Unit 1 (PR
"curriculum Unit 1, nine QR topics"). Everything below was found during that
round and deliberately left out of it. Companion to
`deferred-curriculum-round5-followups.md`, `deferred-curriculum-unit-map.md` and
`deferred-figure-and-notation-passes.md`: work that is scoped out rather than
broken.

---

## 1. The unescaped-currency defect does not reach the student page

`deferred-curriculum-round5-followups.md` item 2 records that QR.1.2, QR.2.1 and
QR.3.5 carry currency written as a bare `$` inside `distractor_logic` prose. That
is still true and still worth fixing. This round adds one fact about its blast
radius, which was not known when it was logged.

`scripts/render_check_curriculum.mjs` runs those three files through the real
`unified` / `remark-math` / `rehype-katex` chain from `lib/curriculum-utils.ts`.
All three render **clean**: zero KaTeX errors, zero math spans with prose
swallowed into them.

The reason is `stripAuthoringBlocks()`, which removes fenced json from the
markdown before rendering. Every one of the bad dollars sits inside a
```json block, so the delimiter never reaches remark-math.

**What this changes.** The defect is a source-quality problem, not a live
rendering problem, at least on this path. It does not need to be treated as
urgent.

**What it does not change.** The strings are still wrong, they are still parsed
into `misconceptions_used` and `misconception_tags` by the uploader, and any
future consumer that renders `distractor_logic` prose without stripping the
fence first would surface the breakage. The Socratic AI route reads per-option
slugs and is the obvious candidate to check before closing this.

Left untouched here: the brief scoped those three files out explicitly.

---

## 2. `QR.1.1` fails the new source linter on its legacy shape

`scripts/lint_curriculum_source.py`, added this round, reports five errors on
`unit-1/QR.1.1`:

```
practice has 12 items, expected 10
Basic level has 5 items, expected 4
Proficient level has 5 items, expected 3
Advanced level has 2 items, expected 3
practice section is not interactive, it loses its mastery gate
```

None of this is new breakage. QR.1.1 is the older free-response shape that
predates the 10 (4/3/3) plus 4 house format, its practice section genuinely is
`interactive: false`, and it is worked around in code as a legacy case. The
linter is reporting it accurately; the file simply is not in the house shape.

**What closing it would take.** Either rewrite QR.1.1's practice section to the
current 10-item multiple-choice format, which would also restore its mastery
gate, or add an explicit allowlist to the linter so a known legacy file does not
fail a run. The first is real content work and a scope call. The second is
cheap but hides a real gap.

Worth noting that the mastery gate is the part with student impact: QR.1.1 is
the first topic in Unit 1, and it is the one topic in the unit that cannot be
completed interactively.

---

## 3. Two misconception slugs are indistinguishable on successive-change items

Found while authoring QR.2.3 and recorded because it constrains how percent
items can be built, not because anything is wrong.

`percent_changes_added` and `percent_applied_to_wrong_stage_base` produce the
**same numeric value** on an item where two percents apply in sequence to one
quantity:

```
original * (1 + a - b)              <- treated the changes as additive
original * (1 + a) - original * b   <- applied the second percent to the original base
```

Those are algebraically identical, so no choice of numbers separates them. Only
one of the two can be tagged on such an item, and tagging either is defensible.

They do separate when the two percents have genuinely different bases, which is
why QR.2.3 practice 9 uses a tax-then-tip-on-the-taxed-amount structure rather
than two successive changes to one price.

**No action proposed.** This is a note for whoever writes the next percent topic
or reviews the tagging on this one, so the coincidence is not mistaken for a
tagging error.

---

## 4. Answer-position skew on the four oldest Unit 1 topics

The linter warns when correct answers bunch on one letter, because
`PracticeQuiz.tsx` renders A to D in fixed order with no shuffling. Current
state of Unit 1:

| Topic | Correct-answer spread |
|---|---|
| QR.2.1 | A on all 14 items |
| QR.1.2 | A on 10 of 14 |
| QR.1.3 | A on 12 of 14 |
| QR.1.4 | A on 12 of 14 |
| QR.1.1 | B on 4 of 7 |

The nine topics authored this round all distribute across A to D, as do all 14
Unit 0 topics and QR.3.5, so the skew is confined to the older files.

A student who learns to pick A does measurably better than they should on
QR.2.1 in particular. Fixing it means permuting the options and rewriting the
matching `distractor_logic` and `misconception_tag` keys for each affected item,
which is mechanical but touches live content, so it wants its own pass and its
own review.

---

## 5. Unit names still do not exist anywhere

Carried forward unchanged from `deferred-curriculum-unit-map.md`, restated only
because Unit 1 is now complete and therefore visible in full. The UI prints
`Unit {unitNumber}`, so the finished unit renders as "Unit 1" rather than by
name. Needs a source of truth for unit names, which is a schema decision rather
than a content one.
