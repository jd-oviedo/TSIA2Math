# Deferred: follow-ups from the Unit 3 round

Opened 2026-08-14, alongside the thirteen-topic batch that completed Unit 3
(GR.2.2 through GR.4.5). Every item here was found during that round and
deliberately left out of it. Companion to
`deferred-curriculum-unit1-followups.md`,
`deferred-curriculum-unit2-followups.md`,
`deferred-curriculum-round5-followups.md`, `deferred-curriculum-unit-map.md`
and `deferred-figure-and-notation-passes.md`: work that is scoped out rather
than broken.

---

## 1. RESOLVED: the three pre-existing Unit 3 topics now have figures

*Closed 2026-08-14 by the retrofit pass. Original note kept below for context.*

Seventeen figures added: GR.2.1 four in the notes plus two on practice items,
GR.3.1 two in the notes plus four on practice items, GR.4.1 five in the notes.
The mapping in the note below held for GR.3.1 and GR.4.1 with no new builder
code. GR.2.1 needed one, a `path` polygon taking an explicit vertex list,
because no named shape expresses an L or a notched rectangle.

### Original note

Scoped out explicitly at the start of the round.

GR.2.1 (seq 1, perimeter), GR.3.1 (seq 8, Pythagorean theorem) and GR.4.1
(seq 12, transformations) were authored and published before this session's
figure pipeline existed. All thirteen topics written this round carry two
verified diagrams each. Those three carry none.

They are not wrong and they are not broken. They read as prose-only topics in
a unit where every other topic is illustrated, which is a consistency gap
rather than a defect.

Retrofitting is cheap now that the pipeline exists, and the natural figures are
obvious:

| Topic | Figure | Builder type | Notes |
|---|---|---|---|
| GR.2.1 | a labelled rectangle and a composite L-shape | `polygon` | the L-shape needs a new sub-shape in `polygonModel` |
| GR.3.1 | a right triangle with legs and hypotenuse labelled | `right_triangle` | supported today, no new code |
| GR.4.1 | one `transform_pair` per transformation, or one showing all four | `transform_pair` | supported today, no new code |

Two of the three need no new builder code at all. The L-shape for GR.2.1 is the
only piece of work.

The cost is not the figures, it is the re-upload: a retrofit changes the
`lesson_content` of three live topics, so it needs the same diff-then-confirm
gate as any other content change.

**Do not do this without asking.** It was ruled out of the Unit 3 round by
name.

---

## 2. RESOLVED: `coordinate_plane` is now verified too

*Closed 2026-08-14, before the Unit 3 upload.*

Originally logged as a gap: `verifyFigure` dispatched on the geometric
`BUILDERS` map only, so `coordinate_plane` fell through to `return []` and the
one such figure (`qr-3-7-two-plans.json`, Unit 2) reported zero assertions. The
skip was printed rather than silent, but nothing automated had ever checked that
figure - it was verified in the Unit 2 round by rendering and looking.

`verifyPlane` now covers it. It recovers the data-to-pixel map from the axis
tick labels in the emitted SVG, inverts it, and reads each drawn line back as a
slope and an intercept to compare against the spec, plus the position of every
marked point and a count that every declared line was actually drawn.

Measuring against the printed ticks rather than `makeScales()` is the point: a
builder that mis-scaled an axis would move the ticks and the line together under
its own scale function, and a check written that way would pass.

Confirmed by tampering with the emitted SVG and re-measuring against an
untouched spec. Caught: an endpoint shifted 20px, a line translated 15px, a
marked point moved 18px, a y axis whose ticks were stretched 12%, and a declared
line not drawn at all. The unmodified control passes.

Note for whoever writes the next verifier: mutating the *spec* proves nothing,
because `verifyFigure` rebuilds the SVG from that same spec and both sides of
the comparison move together. Tamper with the drawing.

The whole-directory run is now **111 assertions across 27 files, 0 failed, 0
skipped**.

Still uncovered, but unused by any current figure: the statistical types
(`bar_chart`, `dot_plot`, `box_plot`, `scatterplot`) that exist in
`FigureRenderer.tsx` but have no spec-driven equivalent. Nothing to verify until
something draws one.

---

## 3. RESOLVED: two topics reach outside their attached slug lists

`data/docs/misconception_taxonomy.json` attaches slugs to topics. Two of this
round's topics used approved slugs that are attached to a neighbouring topic
rather than to themselves:

- **GR.3.4** (applications of right triangle relationships) used
  `hypotenuse_reported_for_leg`, `divides_instead_of_multiplies` and
  `multiplies_instead_of_divides`, all attached to GR.3.1 through GR.3.3.
- **GR.4.3** (properties of similar polygons) used `multiplies_instead_of_divides`,
  whose pair `divides_instead_of_multiplies` *is* attached to GR.4.3.

In both cases the slug's definition fits the distractor exactly, the slug is
`status: approved`, and no new slug was minted. The reach is defensible on the
content: GR.3.4 composes GR.3.1 through GR.3.3, so it inherits their error
modes, and reporting a line of sight as a height is one of the two commonest
ways an applications item goes wrong.

The taxonomy is nonetheless now slightly out of step with what the curriculum
uses. Two options, and the first is probably right:

1. Extend the `topics` list on those four slugs to include GR.3.4 and GR.4.3.
   Pure metadata, no content change.
2. Leave it, and accept that attachment lists describe the CAT bank rather than
   the curriculum.

Blocked on nothing. It is a data edit to one file, but it touches the
authoritative taxonomy, which is not something to change unilaterally.

### Resolution

Option 1, applied. It is three slugs and four attachments, not "four slugs":
`multiplies_instead_of_divides` needed both topics, the other two needed only
GR.3.4.

```
hypotenuse_reported_for_leg     + GR.3.4
divides_instead_of_multiplies   + GR.3.4          (GR.4.3 was already there)
multiplies_instead_of_divides   + GR.3.4, GR.4.3
```

One supporting fact that was not in the original note and that settles the
choice between the two options: every slug already carries a separate
`cat_topics_observed` field, and it routinely disagrees with `topics`. The
CAT-bank-only reading in option 2 is therefore already served by its own field,
which leaves `topics` free to describe curriculum attachment.

**The scope in the heading was wrong, and it matters.** Measured across the
whole course rather than just this round, slug uses fall into three classes:

```
attached to the using topic                        362
slug's topics list is empty (39 slugs)             145
topics list exists but omits the using topic       107   <- the class above
```

So this was never two topics. After the four attachments above, 107 cases of
the same class remain, spread over roughly 30 topics in every unit. The four
fixed here are the ones this round introduced and were reviewed on their
content; the rest have not been looked at and are logged as item 7 rather than
swept in silently.

---

## 4. `FigureRenderer.tsx` and `figure_shapes.mjs` now overlap

The CAT bank's React component (`app/components/FigureRenderer.tsx`, 12 types)
and this round's SVG builders (`scripts/figure_shapes.mjs`, 10 types) draw the
same vocabulary in the same palette, and they share the oblique projection
convention for 3D solids.

They differ in one way that matters, and it was a deliberate call this round:
`FigureRenderer`'s geometric types are **schematic**. `shapePoints()` hardcodes
vertices, and `right_triangle` is fixed at A=(20,140), B=(20,20), C=(200,140)
regardless of the side lengths in the item. `figure_shapes.mjs` computes every
vertex from the stated dimensions and verifies the result.

So a CAT item and a curriculum item describing the same triangle will draw it
differently, and only one of the two will be to scale.

Nothing is broken. CAT items are not shown beside curriculum items. But the
divergence will widen, and the sensible end state is one shared geometry layer
with two renderers on top of it.

Large enough to want its own session.

---

## 5. Degree notation had no precedent before this round

No curriculum topic before GR.3.2 contained a degree sign or a `^\circ`. Three
topics this round needed one, and they use `^\circ`, which is what KaTeX
expects and what renders consistently.

SVG figure labels use the Unicode `°` glyph, since SVG text is not LaTeX and the
glyph is what a reader sees.

Recorded here so the next author does not have to rediscover the split. It is a
convention, not a defect, and it is worth writing into the house style notes the
next time those are touched.


---

## 6. Two Unit 3 lesson pages scroll sideways on a phone

**RESOLVED** on branch `fix/mobile-math-table-overflow`. The measurement below
is the pre-fix state and is kept because it is what the fix was verified
against; the outcome is recorded at the end of this item. It was, as predicted,
a pure styling fix: no content edit and no re-upload.

### What was measured

Every Unit 3 topic, all three routes, against live production rows at a 390px
viewport (iPhone-class width), after the figure retrofit:

```
viewport 390px -- routes that scroll sideways: 2 of 48

topic    route     scrollW  over   widest offender
GR.3.1   lesson    502      +112   katex 467px  "3, 4, 5 \qquad 5, 12, 13 \qquad ..."
GR.4.4   lesson    398      +8     table 363px  "Figure | Lines | Order | Point symmetry"

affected topics (2/16): GR.3.1, GR.4.4
```

GR.3.1 is the real one: a **112px** overflow, so roughly a third of the line is
off-screen and the whole page rocks sideways. GR.4.4 is 8px, cosmetic but the
same root cause class.

Every figure added by the retrofit fits at 390px. Images carry a max-width rule;
math and tables do not.

### Two corrections to the original note

The first version of this item, written before anything was measured, said the
bug affected **9 of 16 topics**. That number came from grepping for `\qquad`,
which is a proxy, not a measurement. Measured, it is **2 of 16**. Most `\qquad`
lines are short enough to fit.

It also proposed the fix

```css
.um-topic .um-prose .katex-display { overflow-x: auto; }
```

**That would do nothing.** There is no `.katex-display` element on the page:

```
katexDisplayCount: 0     katexCount: 168
```

This pipeline emits every formula as a bare `span.katex`, display math included,
with no display wrapper. The overflowing span sits directly inside a `<p>`:

```
span.katex  <  p  <  div.um-prose.um-prose-card  <  section
     467px       320px parent, overflow-x: visible
```

### What the fix actually has to do

Two different offenders, so probably two rules.

Wide formulas, where the span is inline and 147px wider than its parent:

```css
.um-topic .um-prose .katex { max-width: 100%; display: inline-block;
                             overflow-x: auto; vertical-align: middle; }
```

Wide tables, which are already block-level:

```css
.um-topic .um-prose table { display: block; width: max-content;
                            max-width: 100%; overflow-x: auto; }
```

Both need checking against the rest of the app, since `.um-prose` is shared by
every topic in every unit, and `display: block` on a table changes how its
borders collapse. Neither is a one-liner to be dropped into an unrelated PR,
which is why the retrofit left them alone.

### Reproducing

The survey is now a committed script, `scripts/measure_topic_widths.mjs`:

```
npx next build && npx next start &
node scripts/measure_topic_widths.mjs --units=0,1,2,3
```

It reads the topic list from `curriculum_topics_public` with the anon key, so it
walks exactly the rows a student gets, and it counts selector matches on every
page so a rule that silently stops matching shows up as a number going to zero.

### What was done

Two rules, each verified against the rendered DOM before being written.

`.um-topic .um-prose p > .katex:only-child` gets `display: block` and
`overflow-x: auto`. The structural selector is the point: this pipeline emits no
`.katex-display` at all, and every one of the five wide formulas measured across
four units turned out to be the only child of its paragraph, so position is what
identifies display math here. `:only-child` keeps the rule off inline math,
which would lose its baseline if it became a scroll container.

Tables are wrapped in a `div.um-table-scroll` by a small rehype plugin in
`lib/curriculum-utils.ts`, and the wrapper scrolls. The obvious CSS-only
alternative, `display: block` on the table, was measured and does work, but a
table that is not `display: table` stops being announced as a table by screen
readers. These are data tables in study material, so the wrapper was worth the
extra moving part. `overflow-x: auto` on the table alone does nothing.

### Outcome, measured the same way

```
viewport 390px, Units 0-3, 189 routes

before:  8 routes scroll sideways
after:   0 routes scroll sideways
```

Regression check, comparing every element's geometry on all 189 routes before
and after:

```
figures   0 changed of 683
tables    0 changed of 51
cells     0 changed of 657
math    492 changed of 9147   <- exactly the p > .katex:only-child match count
```

The figures from the retrofit are untouched, and so is every table's own box:
the wrapper scrolls, the table does not move. The 492 changed formulas are the
standalone ones the rule targets. They get 6px of vertical padding, which is
room for a stacked fraction that would otherwise be shaved by `overflow-y`, and
they now occupy their true height instead of overflowing their line box, so
lesson pages with a lot of display math get modestly longer. That is a
correction: tall fractions were previously overlapping the lines around them.

### Units 0 to 2 were not clean

The previous note assumed this was a Unit 3 problem. It was not. Surveying
Units 0 to 2 as part of the regression check found **six more affected routes**,
one of them worse than anything in Unit 3:

```
AR.1.2  lesson  714  +324   katex   "If any vertical line crosses the g..."
AR.1.4  lesson  647  +257   katex   "Linear adds a constant.Exponential..."
GR.1.1  lesson  443   +53   table   "Category | What it measures | Cust..."
QR.3.6  lesson  426   +36   table   "Year | 1990 | 1995 | 2000..."
QR.1.8  lesson  414   +24   katex   "|a-b| = the distance between a and b"
AR.1.1  lesson  409   +19   katex   "f(5) means: run the rule f with 5..."
```

All six are fixed by the same two rules -- they are the same two shapes, not new
ones -- so the planned survey pass for Units 0 to 2 is closed rather than
pending. A latent seventh, a table on AR.2.6 sitting 12px over its container
without quite pushing the page, is fixed too.

Units 4 and 5 (AR.3.1, AR.4.1, PR.2.1, PR.3.1, PR.4.1) were measured too, after
the fix: 0 of 15 routes scroll, and nothing on them is wide enough to need a
scroll container at all, so there was no latent problem there to begin with.
Nothing about this defect is left open.


---

## 7. The misconception taxonomy's `topics` lists are broadly out of step

Surfaced while closing item 3, which turned out to be four instances of a
course-wide pattern rather than a Unit 3 problem. No action taken: item 3's four
attachments were reviewed on their content and applied, and nothing else was
touched.

`data/docs/misconception_taxonomy.json` is the authoritative 481-slug
vocabulary. Every slug carries two topic fields that do not agree with each
other or with the curriculum:

- `topics`, a curated attachment list.
- `cat_topics_observed`, where the slug has actually been seen in the CAT bank.

Measured over every `Student makes misconception:` use in the curriculum source:

```
attached to the using topic                        362
slug's topics list is empty (39 slugs)             145
topics list exists but omits the using topic       107
```

Three separate things are tangled here, and they probably want different
answers rather than one sweep:

1. **39 slugs have an empty `topics` list.** All are `origin: curriculum`, so
   they were minted from curriculum authoring and never got an attachment list;
   their real usage sits in `cat_topics_observed` instead. Example:
   `fraction_digit_gluing` has `topics: []` and
   `cat_topics_observed: [QR.1.1, QR.1.2, QR.1.3]`.

2. **107 uses hit a slug whose list exists but omits the using topic.** About
   two thirds are not recorded in `cat_topics_observed` either, so the use is
   genuinely unrecorded. `AR.2.7` alone accounts for four
   (`delta_y_used_as_slope`, `horizontal_vertical_line_confused`,
   `point_y_used_as_intercept`, `slope_intercept_swap`).

3. **`cat_topics_observed` can list topics absent from `topics`.** On
   `multiplies_instead_of_divides`, `cat_topics_observed` carries AR.2.2,
   AR.4.8 and QR.1.4, none of which appear in `topics`. This is the specific
   mismatch noticed during the item 3 work.

The prior question is what `topics` is *for*. If it is a curriculum attachment
list, it is badly incomplete. If it describes the CAT bank, then
`cat_topics_observed` already does that and `topics` is redundant. Worth
settling before any bulk edit, because a sweep that guesses wrong writes 250-odd
wrong rows into the authoritative file.

A reporting script would be the cheap first step: the classification above came
from about twenty lines of throwaway python and would be worth keeping.
