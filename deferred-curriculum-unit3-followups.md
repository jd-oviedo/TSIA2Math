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

## 1. The three pre-existing Unit 3 topics have no figures

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

## 2. `verifyShape` covers eight of the ten figure types

`scripts/make_figure.mjs --verify` re-parses each emitted SVG and checks
scale-invariant ratios and angles against the spec. It deliberately re-reads the
drawing rather than recomputing from the builder's own numbers, so a builder bug
cannot pass itself.

Two types return no assertions:

- `coordinate_plane` (Unit 2, `qr-3-7-two-plans.json`) - reported honestly as
  `no geometric assertions for type coordinate_plane`
- `bar`-style and other statistical types, which this unit never used

The `--verify` run for the whole figure directory currently reports 81
assertions across the geometric types and one skipped file. The skip is visible
rather than silent, which is the right behaviour, but a line-plot verifier for
`coordinate_plane` would close the gap: check that each plotted line's slope and
intercept match the spec's stated equation.

Low value while only one such figure exists. Worth doing before the next unit
that leans on coordinate-plane diagrams.

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
