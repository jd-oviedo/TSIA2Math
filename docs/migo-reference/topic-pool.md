# Topic pool

Every topic a worksheet can draw from. Extracted from the frontmatter of the 97
files under `curriculum/source/tsia2-math/`, at commit `d382066`.

**97 topics. Not 96, not 100.** The number that sometimes reads as 100 is the row
count of `curriculum_topics` in the database: 97 real topics plus 3 content-free
placeholder rows. See "Placeholders" below.

## The sort rule

**Sort by `unit_number`, then `sequence_in_unit`, then `topic_id` as a final
tiebreak. Never sort by `topic_id` alone.**

Topic ids do not track unit numbers. QR.3.8 is in unit 0, QR.3.1 is in unit 1, and
QR.3.2 is in unit 2. An id sort scrambles the teaching order inside three of the
six units. This is the rule `listPickerTopics()` follows in
`app/lib/worksheet-source.ts`, and the table below is already in that order.

## Layers

`assessment_layer` is one of exactly three values:

| layer | topics |
|---|---:|
| `DIAGNOSTIC` | 6 |
| `CRC` | 77 |
| `ENRICHMENT` | 14 |

## Strands

| strand | name | topics |
|---|---|---:|
| `QR` | Quantitative Reasoning | 27 |
| `AR` | Algebraic Reasoning | 32 |
| `GR` | Geometric and Spatial Reasoning | 19 |
| `PR` | Probabilistic and Statistical Reasoning | 19 |

The strand is `related_strand` in the frontmatter and always matches the topic id
prefix.

## `difficulty_band` is not `level`

The frontmatter carries a topic-level `difficulty_band`. It is metadata about the
topic and it is **not** the per-item `level` the worksheet difficulty filter reads.
A topic banded `Basic` still contains Basic, Proficient and Advanced items. Do not
derive one from the other.

Topic-level bands: Basic 43, Proficient 48, Advanced 6.

## The 97 topics

| topic_id | topic_name | strand | layer | unit | seq |
|---|---|---|---|---:|---:|
| `QR.1.5` | Operations with rational numbers (signed numbers, fractions, decimals) | QR | DIAGNOSTIC | 0 | 1 |
| `QR.1.6` | Rounding to a given place value | QR | DIAGNOSTIC | 0 | 2 |
| `QR.1.7` | Order of operations | QR | ENRICHMENT | 0 | 3 |
| `QR.1.8` | Absolute value | QR | ENRICHMENT | 0 | 4 |
| `QR.3.8` | Distributive property | QR | ENRICHMENT | 0 | 5 |
| `GR.1.1` | Identifying common units of measurement | GR | DIAGNOSTIC | 0 | 6 |
| `GR.1.2` | Identifying and defining types of angles (supplementary, complementary, vertical) | GR | DIAGNOSTIC | 0 | 7 |
| `GR.1.3` | Reading and interpreting measurement scales | GR | ENRICHMENT | 0 | 8 |
| `PR.1.1` | Sorting and counting data | PR | DIAGNOSTIC | 0 | 9 |
| `PR.1.2` | Constructing simple graphs and tables | PR | DIAGNOSTIC | 0 | 10 |
| `AR.1.1` | Definition of a function and function notation | AR | ENRICHMENT | 0 | 11 |
| `AR.1.2` | Recognizing if a relation is a function | AR | ENRICHMENT | 0 | 12 |
| `AR.1.3` | Domain and range | AR | ENRICHMENT | 0 | 13 |
| `AR.1.4` | Distinguishing function types (linear, quadratic, exponential, etc.) | AR | ENRICHMENT | 0 | 14 |
| `QR.1.1` | Comparing magnitudes of rational and irrational numbers | QR | CRC | 1 | 1 |
| `QR.1.2` | Ordering values across forms (fractions, decimals, percents) | QR | CRC | 1 | 2 |
| `QR.1.3` | Decimal equivalents of common fractions | QR | CRC | 1 | 3 |
| `QR.1.4` | Estimating square roots of non-perfect squares | QR | CRC | 1 | 4 |
| `QR.2.1` | Applying a simple ratio to calculate a value | QR | CRC | 1 | 5 |
| `QR.2.2` | Multi-step proportion problems | QR | CRC | 1 | 6 |
| `QR.2.3` | Percents and percent change | QR | CRC | 1 | 7 |
| `QR.2.4` | Percents in algebraic contexts | QR | CRC | 1 | 8 |
| `QR.2.5` | Rates and unit rates | QR | CRC | 1 | 9 |
| `QR.2.6` | Unit conversion within a system | QR | CRC | 1 | 10 |
| `QR.2.7` | Unit conversion between systems | QR | CRC | 1 | 11 |
| `QR.2.8` | Direct variation | QR | ENRICHMENT | 1 | 12 |
| `QR.3.1` | Translating verbal descriptions to algebraic expressions | QR | CRC | 1 | 13 |
| `QR.3.5` | Manipulating linear expressions (combining like terms) | QR | CRC | 1 | 14 |
| `QR.4.1` | Proportional relationship problems in context | QR | CRC | 1 | 15 |
| `QR.3.2` | Identifying expressions that represent rates of change | QR | CRC | 2 | 1 |
| `QR.3.3` | Creating a two-variable expression from a situation | QR | CRC | 2 | 2 |
| `QR.3.4` | Interpreting slope/intercept meaning in context | QR | CRC | 2 | 3 |
| `QR.3.6` | Average rate of change | QR | CRC | 2 | 4 |
| `QR.3.7` | Comparing multiple rates of change | QR | CRC | 2 | 5 |
| `QR.4.2` | Multi-step problems combining proportional and linear reasoning | QR | CRC | 2 | 6 |
| `QR.4.3` | Analyzing a multistep problem and creating a linear equation | QR | CRC | 2 | 7 |
| `AR.2.1` | Solving one-variable linear equations | AR | CRC | 2 | 8 |
| `AR.2.2` | Solving one-variable linear inequalities | AR | CRC | 2 | 9 |
| `AR.2.3` | Evaluating linear functions for a given value | AR | CRC | 2 | 10 |
| `AR.2.4` | Solving systems of linear equations | AR | CRC | 2 | 11 |
| `AR.2.5` | Linear inequalities in two variables (graphing solution regions) | AR | CRC | 2 | 12 |
| `AR.2.6` | Slope, slope-intercept form, and writing equations of lines | AR | CRC | 2 | 13 |
| `AR.2.7` | Parallel and perpendicular lines | AR | ENRICHMENT | 2 | 14 |
| `AR.2.8` | Literal equations (solving for a variable in a formula) | AR | ENRICHMENT | 2 | 15 |
| `GR.2.1` | Perimeter of polygons and multi-sided figures | GR | CRC | 3 | 1 |
| `GR.2.2` | Circumference of a circle | GR | CRC | 3 | 2 |
| `GR.2.3` | Area of 2D figures | GR | CRC | 3 | 3 |
| `GR.2.4` | Inverse measurement problems | GR | CRC | 3 | 4 |
| `GR.2.5` | Surface area of 3D figures | GR | CRC | 3 | 5 |
| `GR.2.6` | Volume of 3D figures | GR | CRC | 3 | 6 |
| `GR.2.7` | Expressing measurement with algebraic expressions | GR | CRC | 3 | 7 |
| `GR.3.1` | Pythagorean theorem | GR | CRC | 3 | 8 |
| `GR.3.2` | Special right triangles | GR | CRC | 3 | 9 |
| `GR.3.3` | Basic trigonometric ratios | GR | CRC | 3 | 10 |
| `GR.3.4` | Applications of right triangle relationships | GR | CRC | 3 | 11 |
| `GR.4.1` | Transformations: translations, rotations, reflections, dilations | GR | CRC | 3 | 12 |
| `GR.4.2` | Using transformations to investigate congruence and similarity | GR | CRC | 3 | 13 |
| `GR.4.3` | Properties of similar polygons | GR | CRC | 3 | 14 |
| `GR.4.4` | Symmetry of plane figures | GR | CRC | 3 | 15 |
| `GR.4.5` | Equation of a circle | GR | CRC | 3 | 16 |
| `AR.1.5` | Domain restrictions of rational and radical functions | AR | CRC | 4 | 1 |
| `AR.3.1` | Identifying factors of a simple quadratic expression | AR | CRC | 4 | 2 |
| `AR.3.2` | Factoring quadratics | AR | CRC | 4 | 3 |
| `AR.3.3` | Solving quadratic equations by factoring | AR | CRC | 4 | 4 |
| `AR.3.4` | Solving quadratic equations using the quadratic formula | AR | CRC | 4 | 5 |
| `AR.3.5` | Identifying the maximum or minimum of a quadratic | AR | CRC | 4 | 6 |
| `AR.3.6` | Identifying a quadratic equation that corresponds to a given graph | AR | CRC | 4 | 7 |
| `AR.3.7` | Vertex form and graphing parabolas | AR | ENRICHMENT | 4 | 8 |
| `AR.4.1` | Simplifying polynomial expressions | AR | CRC | 4 | 9 |
| `AR.4.2` | Multiplying polynomials including FOIL | AR | CRC | 4 | 10 |
| `AR.4.3` | Adding and subtracting polynomials | AR | CRC | 4 | 11 |
| `AR.4.4` | Exponent rules for algebraic monomials | AR | CRC | 4 | 12 |
| `AR.4.5` | Simplifying rational expressions | AR | CRC | 4 | 13 |
| `AR.4.6` | Combining rational expressions using common denominators | AR | CRC | 4 | 14 |
| `AR.4.7` | Evaluating rational functions for a single value | AR | CRC | 4 | 15 |
| `AR.4.8` | Simplifying and operating with radical expressions | AR | CRC | 4 | 16 |
| `AR.4.9` | Solving radical equations | AR | CRC | 4 | 17 |
| `AR.4.10` | Exponent properties for exponential expressions | AR | CRC | 4 | 18 |
| `AR.4.11` | Evaluating exponential functions | AR | CRC | 4 | 19 |
| `AR.4.12` | Exponential growth and decay models | AR | CRC | 4 | 20 |
| `PR.1.3` | Reading bar graphs, line graphs, and pictographs | PR | CRC | 5 | 1 |
| `PR.1.4` | Reading and interpreting tables and two-way tables | PR | CRC | 5 | 2 |
| `PR.1.5` | Classifying data and choosing appropriate representations | PR | CRC | 5 | 3 |
| `PR.2.1` | Calculating mean, median, mode, and range | PR | CRC | 5 | 4 |
| `PR.2.2` | Calculating weighted mean | PR | CRC | 5 | 5 |
| `PR.2.3` | Inverse problems: finding a missing data value given the mean or range | PR | CRC | 5 | 6 |
| `PR.2.4` | Comparing distributions using measures of center and spread | PR | CRC | 5 | 7 |
| `PR.2.5` | Box and whisker plots | PR | ENRICHMENT | 5 | 8 |
| `PR.3.1` | Calculating simple probability of a single random event | PR | CRC | 5 | 9 |
| `PR.3.2` | Probability of an event and its complement | PR | CRC | 5 | 10 |
| `PR.3.3` | Compound probability (independent and dependent events) | PR | CRC | 5 | 11 |
| `PR.3.4` | Conditional probability | PR | CRC | 5 | 12 |
| `PR.3.5` | Set notation foundations (union, intersection, complement) | PR | ENRICHMENT | 5 | 13 |
| `PR.4.1` | Identifying linear relationships in scatterplots (positive, negative, none) | PR | CRC | 5 | 14 |
| `PR.4.2` | Fitting a linear model to scatterplot data | PR | CRC | 5 | 15 |
| `PR.4.3` | Calculating percent change from data over time | PR | CRC | 5 | 16 |
| `PR.4.4` | Drawing conclusions and making predictions from data | PR | CRC | 5 | 17 |

## Placeholders

Three rows exist in `curriculum_topics` with `is_placeholder = true` and no repo
source file, inserted by `sql/curriculum_placeholder_topics.sql`:

| topic_id | topic_name | strand |
|---|---|---|
| `AR.COMING-SOON` | Algebraic Reasoning, coming soon | AR |
| `GR.COMING-SOON` | Geometric & Spatial Reasoning, coming soon | GR |
| `PR.COMING-SOON` | Probabilistic & Statistical Reasoning, coming soon | PR |

They exist so the recommendation engine always has a topic to route to per strand.
They carry `practice_items = '{}'`, they render a coming-soon page, and
`listPickerTopics()` filters them out with `.eq('is_placeholder', false)` so they
never appear in the worksheet picker.

**Migo cannot author into a placeholder.** There is no source file. Every one of
the 97 rows above is real content with `is_placeholder = false`, which is the
column default that `upload_curriculum.py` never sets.

## Per-unit counts

| unit | topics |
|---|---:|
| 0 | 14 |
| 1 | 15 |
| 2 | 15 |
| 3 | 16 |
| 4 | 20 |
| 5 | 17 |
| **total** | **97** |
