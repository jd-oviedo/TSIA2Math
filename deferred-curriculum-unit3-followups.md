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

## 3. Two topics reach outside their attached slug lists

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

**Live UX defect, affecting real students now.** Worth its own session; it is a
styling fix, unrelated to curriculum authoring, and nothing about it needs a
content edit or a re-upload.

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

`npx next build && npx next start`, then the survey script used above, which
walks all 16 topics by 3 routes at 390px and reports `scrollWidth` against the
widest `.katex`, `table`, `pre` or `img` on each page. Worth re-running across
Units 0 to 2 as well; nothing here is specific to Unit 3, and only Unit 3 has
been looked at.
