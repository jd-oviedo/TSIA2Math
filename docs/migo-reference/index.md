# Migo reference bundle

**Bundle date:** 2026-08-28
**Source commit:** `d38206671aab3204d9572c2d3562387e43e99726`
**Repo:** TSIA2Math (app.unpackmath.com)

## Purpose

This bundle is a read-only description of the item format that already exists in
this repo, extracted so that authoring done elsewhere matches it exactly. It
describes the curriculum content pool the worksheet generator at
`/teacher/worksheets/new` draws from: 97 topics, 1,351 printable items. Nothing
here is a proposal or a redesign. Every field, rule, count and example was read
out of committed repo source at the commit above, and where a number appears it
was measured rather than estimated. If the repo moves, this bundle goes stale;
check the commit SHA before trusting it.

## What each file is

| file | contents |
|---|---|
| `index.md` | this file: purpose, freshness, the rules that apply everywhere |
| `exemplar-items.md` | 4 real items, verbatim, authored markdown then parsed JSON. The gold standard |
| `item-schema.md` | file structure, field types, required vs optional, the flow to a printed sheet, and the full house rules |
| `misconception-tags.md` | the controlled vocabulary, 480 approved slugs, verbatim |
| `topic-pool.md` | all 97 topics: id, name, strand, layer, unit, sequence, and the sort rule |
| `math-format.md` | the `$...$` convention, the real pipeline, and real before/after renders |

Read `item-schema.md` and `exemplar-items.md` before authoring anything. The house
rules at the end of `item-schema.md` are the ones a linter enforces.

## The four rules that override everything else

**1. The parser is the only way in.** You author markdown. There is no path that
accepts a hand-written JSON item. `curriculum/migrations/upload_curriculum.py`
parses your markdown into structured items. Every JSON block in this bundle is
labelled as parser output and exists so you can predict what your markdown
becomes, never to be copied into a file.

**2. Never invent a misconception slug.** Every slug must already exist in
`data/docs/misconception_taxonomy.json` with `status: approved`. All 480 are
listed in `misconception-tags.md`. If nothing fits, that is a finding to report,
not a gap to fill. The linter fails the file.

**3. Figures are generated, not hand-authored.** The base64 data URI in a
figure-bearing stem is baked from a checked-in JSON spec under
`curriculum/figures/`. **Migo does not write base64 and does not author new
figure-bearing items.** If a topic needs a figure to be answerable, flag it and
stop. Do not invent a data URI and do not describe a figure that does not exist. A
fabricated figure either breaks outright or silently disagrees with the numbers in
the stem, and nothing in the pipeline checks the second case.

**4. Never put an answer outside Part 4.** Parts 1, 2 and 3 are published to the
public view raw, with no redaction. Only `practice_items` is protected, and only
by key-based SQL stripping. An answer discussed under Part 3 would be readable by
anyone with the browser's anon key.

## The canonical shape

**10 practice items, banded 4 Basic / 3 Proficient / 3 Advanced, plus 4 mini quiz
items.** 96 of the 97 topics follow it exactly. The linter errors on any
deviation, in both the total and the per-band counts.

Measured at this commit:

| | count |
|---|---:|
| topics | 97 |
| practice items | 972 |
| mini quiz items | 388 |
| printable items (multiple choice with choices) | 1,351 |
| free response items, never drawn onto a worksheet | 9 |
| distinct misconception slugs in use | 455 of 480 |
| tagged distractor instances | 4,074 |

## Do not pattern-match on these two topics

Both are real, both are live, and both are unrepresentative. If you sample the
repo for a shape to copy, do not sample these.

- **QR.1.1** (Comparing magnitudes of rational and irrational numbers). Non-standard
  **12 + 4** shape, and 9 of its 12 practice items are free response, so its
  practice section is not interactive and only 7 of its 16 entries are printable.
  It is the source of all 5 pre-existing linter errors and carries no misconception
  tags at all.
- **QR.3.5** (Manipulating linear expressions, combining like terms). The only **templated**
  topic: its 14 items carry parameter templates and roll fresh numbers per
  worksheet, and its 4 mini quiz items are **unbanded**, so a band filter cannot
  draw them.

Everywhere else, the shape in `exemplar-items.md` is the shape.

## Where things live in the repo

| what | path |
|---|---|
| topic source | `curriculum/source/tsia2-math/unit-<0..5>/<TOPIC_ID>.md` |
| the parser | `curriculum/migrations/upload_curriculum.py` |
| the linter | `scripts/lint_curriculum_source.py` |
| per-topic checker | `scripts/check_topic.py` |
| misconception vocabulary | `data/docs/misconception_taxonomy.json` |
| its generator, the real source of truth | `scripts/build_misconception_taxonomy.py` |
| figure specs | `curriculum/figures/<id>.json` |
| math rendering | `lib/curriculum-utils.ts` |
| worksheet selection rules | `app/lib/worksheet-select.ts` |
| worksheet data access | `app/lib/worksheet-source.ts` |
| the public view | `sql/curriculum_topics_public.sql` |
| template authoring, out of scope here | `docs/template-authoring-spec.md` |

## Known staleness and gaps

- **`data/docs/misconception_taxonomy_draft.md` is stale.** It describes 40 slugs
  across 5 topics, a Phase 1 draft. The live vocabulary is 480 slugs across 97
  topics. Use `misconception_taxonomy.json`, never the draft.
- **The repo may be ahead of the production database.** Recent commits banded 380
  mini quiz items that were previously unbanded. Whether production carries them
  depends on `upload_curriculum.py` having been re-run since. This bundle
  describes the repo, which is the authoring surface, and that is the right
  reference for writing items.
- **The linter baseline is 5 errors and 10 warnings**, all pre-existing, all
  attributable to QR.1.1's shape and to answer-letter skew on five early QR
  topics. Work you author should add zero errors.
