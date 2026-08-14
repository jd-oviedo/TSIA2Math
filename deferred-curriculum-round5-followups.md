# Deferred: follow-ups from the Unit 0 completion round

Opened 2026-08-13, alongside the eleven-topic batch that completed Unit 0 (PR
"curriculum Round 5, Unit 0 completion"). Both items below were found during
that round and deliberately left out of it. Companion to
`deferred-curriculum-unit-map.md` and `deferred-figure-and-notation-passes.md`:
work that is scoped out rather than broken.

---

## 1. `upload_curriculum.py` has no per-topic filter

`upload_curriculum.py --course tsia2-math` globs the whole course and upserts
every source file it finds. There is no way to say "upload only these topics."

So the Unit 0 round, which added 11 topics, sent **29** upserts: the 11 new rows
plus a rewrite of all 18 rows that were already live.

**Why this was safe tonight, and why that is not a general argument.** Before the
upload, all 18 live rows were pulled from Supabase and diffed field by field
against the payload the uploader would build for those same `topic_id`s from the
local source. All 15 uploader-written fields matched byte for byte on all 18
rows, so the rewrite was a genuine no-op and the run was approved on that
evidence rather than on the assumption that it would be one.

That check is the thing worth keeping, and it is currently a throwaway script
rather than part of the tool. The exposure is that a future round runs the
uploader with a local source tree that has drifted from production on some topic
nobody is thinking about, and silently overwrites the live row.

**What closing it would take.** A `--topics QR.1.5,QR.1.6` filter on the glob,
so a round can write only what it authored. Worth pairing with a
`--diff-live` mode that reports drift on the rows a run would touch and exits
non-zero, which is the check above promoted into the tool.

Not urgent. The uploader is only ever run deliberately, by a human, against a
reviewed diff.

---

## 2. RESOLVED: Unescaped `$` inside answer-key `distractor_logic` prose (3 topics)

> **Closed. Two claims below are wrong and the fix it proposes must not be
> applied.** There was no rendering defect on the teacher view or anywhere else,
> and QR.3.5 was never affected. Escaping as `\$` would have broken
> `scripts/verify_templates.py`, since `\$` is an invalid JSON escape. Resolved
> instead by spelling the currency as a word in QR.1.2 and QR.2.1, matching the
> 15 other money topics. Full measurements in
> `deferred-curriculum-unit1-followups.md` item 1.

`QR.1.2`, `QR.2.1` and `QR.3.5` carry currency written as a bare `$` inside
`distractor_logic` strings in Part 4. For example, in QR.2.1:

```
"A": "Correct: divides $12 by 3 to find a unit rate of $4 per ..."
```

Curriculum renders through the `rehype-katex` pipeline in
`lib/curriculum-utils.ts`, where a pair of `$` delimiters opens and closes a math
span. Those two dollar signs pair with each other, so the text between them
renders as math rather than as the sentence it is.

**Scope of the damage is small and teacher-only.** Part 4 is gated behind
`requireTeacher()` and never reaches a student's page, so this is a rendering
defect on the teacher answer-key view, not a content error and not a leak. The
authored answers themselves are correct.

Found by the style lint written for the Unit 0 round, which checks for currency
sealed inside math delimiters. The 11 topics authored in that round are clean;
these three predate the check.

**What closing it would take.** Escape the currency as `\$` in the three files
and re-upload those topics. That is a content edit to live topics outside the
Unit 0 batch, which is why it was not folded into that PR. It wants its own
small pass and its own review, and it is the obvious first customer for the
`--topics` filter in item 1.
