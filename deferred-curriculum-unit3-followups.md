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

## 6. Long display math overflows on a phone

Found while render-testing the retrofit at a 390px viewport, and **not caused by
it**: the line is in GR.3.1's notes at HEAD~1, before any figure was added.

    $$3, 4, 5 \qquad 5, 12, 13 \qquad 8, 15, 17 \qquad 7, 24, 25 \qquad 9, 40, 41$$

KaTeX renders that as a single 458px-wide span inside a 390px viewport, so the
page scrolls sideways. Every figure on the same page behaves correctly, because
images carry a max-width rule and math does not.

`\qquad` display math appears in 9 of the 16 Unit 3 topics, so this is very
unlikely to be the only instance.

The fix is one CSS rule rather than a content edit, something like

    .um-topic .um-prose .katex-display { overflow-x: auto; overflow-y: hidden; }

It was left out of the retrofit deliberately. That rule applies to every topic
in every unit, so it is a styling change with a much wider blast radius than a
three-topic diagram pass, and mobile is this project's primary target, which
makes it worth its own look rather than a change smuggled into an unrelated PR.

Worth checking the other eight topics at 390px at the same time.
