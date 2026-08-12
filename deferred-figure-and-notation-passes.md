# Deferred: figure coverage and math notation

Opened 2026-08-12, alongside the second figure audit (PR "figure coverage:
scatterplot, line_graph, pictograph"). Everything here was found during that
audit and deliberately left out of it. Companion to `content-fixes-needed.md`,
which tracks item defects; this file tracks work that is scoped out rather than
broken.

---

## 1. Figures for items that state every quantity in prose (65 items)

The second audit split the coverage gap on one line: **does the stem assert that
a visual artifact exists?** Items that do ("A scatterplot has an x-axis
labeled...", "A pictograph shows...") were figured in that pass. Items that
merely describe a shape whose every dimension is already in the sentence were
not.

That second group is 65 items, and it is a product-quality question rather than
a bug:

| Existing type | Items | Where |
|---|---|---|
| `solid_3d` | 28 | GR.2.5, GR.2.6, GR.2.7 |
| `right_triangle` | 37 | GR.3.2, GR.3.3, GR.3.4 |

Both renderers already exist and are already wired into `FigureRenderer`.
`solid_3d` is currently used by **zero** items; `right_triangle` is used by nine,
all of them in GR.3.1, while the three neighbouring right-triangle topics have
none.

The argument for doing it: the TSIA2 sample PDF draws these. Sample item 7 shows
a cylinder labelled only `r` and `h` for a question whose stem gives both
algebraically, and sample item 18 shows a triangle labelled `x` and `x + 1`.
College Board draws the solid even when the numbers are in the text.

The argument for deferring it: it is roughly ten times the content-authoring
volume of the pass that was done, with no code involved at all, so it does not
belong in the same review as three new renderers.

Not started. No code needed, only `figure_props` for 65 items, applied through
`scripts/apply_figures.py` the same way as the two proposal files in that PR.

Related and also not done, smaller and less clear-cut:

- **2D composite figures** (7 items: `GR_A_009/019/021/026/039`, `GR_P_012/042`)
  - L-shapes, rectangle-plus-triangle, rectangle-with-a-cutout. Genuinely
  uncovered: `polygon` draws six named regular shapes and nothing composite.
- **Composite solids** (2 items: `GR_A_029`, `GR_A_034`) - a prism topped by a
  cylinder, a cylinder topped by a cone. `solid_3d` draws one solid.
- **Coordinate plane** (~15 items across AR.2.5 shaded half-planes, AR.1.x
  described graphs, GR.4.x transformations with explicit vertices). The largest
  new-type question left, and the one most worth scoping properly rather than
  bolting onto an existing type.

## 2. Transformation items stay prose-only (10 items)

`GR_B_069`-`GR_B_073` and `GR_P_069`-`GR_P_073` say things like "A figure is
translated 5 units to the right. Which statement best describes the image
compared to the original figure?"

Decided 2026-08-12: leave these without a figure and do not re-author the stems.
They test a congruence rule, not diagram reading, and the stem names neither a
shape nor a position - drawing one means inventing both. `polygon_comparison`
would fit a before/after pair, but only after someone rewrites the stem to name
a concrete shape, which is a content decision and not a rendering gap.

---

## 3. Math notation: two separate gaps, neither needing new code

### 3a. Unicode math never reaches the source files

**Finding:** 171 items carry raw Unicode math (`−` `√` `π` `≈` `°` `²` `×` `÷`
`≤`) outside any `$...$` span in `data/items/`. The bank has 18.

The migration is not missing. It runs on every publish - and that is the
problem. `migrate_math.py` and `migrate_fractions.py` both read and write
`public/data/question_bank.json`, the build artifact, never `data/items/`.
`build_bank.py` regenerates that artifact from source, discarding the previous
migration, and the two migrate scripts then re-apply it. Hence the pipeline
order:

```
build_bank.py  ->  migrate_math.py  ->  migrate_fractions.py  ->  upload
```

So the source cannot converge by running the scripts more often. Every publish
already converts these 171 items, and every publish throws the result away.

**The fix is a one-time redirect, not new detection logic:** point the two
migrate scripts at `data/items/**` once, commit the converted source, and the
`build_bank` output is then already migrated. This is the same divergence
tracked under "One source of truth for the question bank" in
`content-fixes-needed.md`, and should probably be done as part of it.

**Residue after migration: 18 items, all the same character.** The degree sign
`°` is in neither `SYMBOL_MAP` nor the `needs_math` trigger set in
`migrate_math.py`, so it survives every run:

`AR_P_020`, `GR_A_001/004/005/008/014`, `GR_B_004/005/008`, `GR_P_004/005/006`,
`PR_A_007`, `PR_B_003`, `PR_P_067/068`, `QR_B_064`, `QR_P_052`

Adding `"°": r"^{\circ}"` to `SYMBOL_MAP` would cover them, but note that `°`
mostly appears as `73°` and `20°C`, which want `$73^{\circ}$` and
`$20^{\circ}\text{C}$` - worth checking the output rather than assuming.

### 3b. Unwrapped algebraic equations (73 stems)

Separate from 3a and untouched by either migrate script: 73 stems contain a
whole algebraic equation written as plain text rather than wrapped in `$...$`,
for example `2x + 3y = 6`. Count is 73 in the source and 73 in the bank, so no
part of the current pipeline addresses it.

This is a `$...$`-wrapping authoring gap, not a rendering bug - the equations
read correctly, they just render in body text rather than typeset. It is the
reason the equation-separation fix in the second figure audit was done in
content rather than in `MathText.tsx`: a detector keyed on `$...$` would not
have matched the item that was actually reported.

`scripts/scan_unwrapped_latex.py` already finds the inverse case (LaTeX commands
outside a math span). A sibling scan for this one does not exist yet.

---

## 4. Smaller inconsistencies noted in passing

- **`PR_A_012` has `contains_image: false`** while carrying a `table` figure.
  Every other figured item in the bank is `true`, including the 39 added in the
  second audit. Nothing reads the field today (only `scripts/apply_figures.py`
  writes it), so this is cosmetic, but it is the one item out of step.
- **20 items embed a markdown pipe table directly in `question_text`** rather
  than using `figure_type: "table"`: `AR_A_007`, `AR_B_007/028`, `AR_P_003/008`,
  `QR_A_001/076/078/080/081/083`, `QR_B_001`, `QR_P_001/082/083/084/085/086/087/090`.
  These render correctly today - `ItemCard.renderQuestionText` parses pipe
  tables into real `<table>` markup - so this is not a live defect. It is a
  second, parallel way of expressing the same thing, and any renderer other than
  `ItemCard` shows raw pipe characters. The curriculum practice flow builds its
  own `stem_html` and never touches `figure_props` at all.
- **`PR_P_042` renders a box plot with no median line.** Its stem states min, Q1,
  Q3 and max for both plots and no median, because the question is purely about
  IQR. `median` was made optional on the box-plot props rather than have the
  figure assert a value the text never gives. If a median is wanted it belongs in
  the stem first.
