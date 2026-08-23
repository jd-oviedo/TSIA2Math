# Template authoring spec

The prompt for a template authoring session. One topic per session, one branch,
one PR. Read this file end to end before authoring anything.

A template is an existing, already-verified curriculum practice item whose
numbers have been lifted out into named parameters. The same template rolls a
fresh instance every time a student needs one. **No AI is in the roll loop.** The
correct answer and every distractor are hand-authored formulas, checked by
`scripts/verify_templates.py` against the whole parameter range.

Reference implementation: the 14 templates in
`curriculum/source/tsia2-math/unit-1/QR.3.5.md`, 26,186 parameter sets,
exhaustive. Read one before writing one.

## Where a template lives

Authored as a third sibling key in the same fenced ```json block as
`distractor_logic` and `misconception_tag`, in Part 4 of the topic markdown,
beside the item it belongs to. Never in a file of its own: a content edit and its
template must never be more than a few lines apart.
`stripAuthoringBlocks` hides the block from the rendered page.

Stored in `public.curriculum_item_templates`, one row per
`(course_id, topic_id, section, item_number)`. Rolled instances are materialised
into `public.curriculum_item_instances` by
`curriculum/migrations/upload_templates.py`.

## Schema

Every field below is read by `scripts/verify_templates.py`. Nothing is decorative.

| field | type | what it controls |
|---|---|---|
| `variables` | array of str | The symbols that survive into the answer, in render order. **Empty when the answer is a number.** See the `house_latex` trap below. |
| `parameters` | array | `{name, min, max, exclude, integer, step}`. The rolled values. `step` defaults to 1 and lets a money amount roll in multiples of 5. Read by `param_values` (verify_templates.py:101). |
| `derived_parameters` | array | `{name, formula, render}`. Computed, not rolled. `render: "coefficient"` writes 1 as an empty string and -1 as `-`. Read by `derive` (:112). |
| `constraints` | array of str | Boolean expressions over parameter values, evaluated by `passes` (:120) in an empty namespace. Properties of the mathematics. |
| `constraint_notes` | object | One sentence per constraint saying which distractor it protects. Not machine read. Required by review. |
| `exclude_parameter_sets` | array | Specific combos struck out by hand, read by `excluded` (:139). A judgment about one instance, not a property of the mathematics. |
| `exclusion_notes` | str | Why. Required whenever `exclude_parameter_sets` is present. |
| `range_notes` | str | Why the ranges are what they are, in difficulty and visibility terms. |
| `canonical_parameters` | object | The values that reproduce the source item exactly. |
| `correct_answer` | str | The correct letter. Restated from the source item and anchored against it. |
| `misconception_tag` | object | The whole letter to slug map, restated from the source item and anchored byte for byte. |
| `stem_template` | str | The stem with `{a}`-style placeholders. Rendered by `render` (:352). |
| `choice_prefix` | str | Optional. Literal LaTeX emitted inside every choice's `$...$`, before the expression, so a "solve for x" item can anchor against `$x = 5$`. Not substituted and never applied to the stem. Checked by `check_choice_prefix`. |
| `unsimplified_expression` | str | The question's raw structure before simplifying. SymPy re-derives the answer from this instead of trusting what was typed. |
| `choice_formulas` | object | All four letters. The correct letter repeats the answer. |
| `choice_derivations` | object | The three wrong letters, as **unsimplified procedures** mirroring the `distractor_logic` sentence step by step. |

### Why both `choice_formulas` and `choice_derivations`

Checking that a formula equals itself proves nothing. `choice_formulas` is what a
student sees. `choice_derivations` is a second, independent transcription of what
the misconception actually *does*. The harness simplifies the derivation and
requires it to equal the stored formula. When they disagree, either the formula
is wrong or the misconception was described in a way that does not produce it.
Both are real defects and neither is visible if you store only one.

`unsimplified_expression` plays the same role for the correct answer.

### Signs live in the template, not in the parameters

Every parameter is a positive magnitude. A minus sign is literal text in
`stem_template`. A signed parameter renders `3x + -5x` and forces sign repair
into the display layer, where it becomes one more thing that can be wrong in
front of a student.

### Difficulty lives in the range, not in the instance

A Basic template whose range can roll a Proficient instance is a defect, not an
edge case. Narrow ranges and add constraints so the hardest reachable roll still
sits inside its own tier. No rolled combination may introduce arithmetic the
original tier did not already ask for.

That rule is what makes the stored band honest, and D2 is what makes it
load-bearing. `level` is authored in Part 2 band headings and exists only on
practice items -- all 388 mini_quiz items across all 97 topics have
`level = null` -- and `curriculum_item_instances` now carries a `level` column
inheriting the source item's band (`sql/instance_level.sql`), written by the
uploader on every instance row.

So **a rolled item is filtered exactly like an authored one**, and templating a
topic no longer removes it from difficulty-filtered worksheets. It used to: a
templated topic contributed 0 questions to a filtered draw while the builder's
badge still promised its 10 levelled practice items, because that badge is
counted from the authored `practice_items` either way.

The band is a copy on the instance row, not a join, so it only becomes true
after an upload. A pool uploaded before the migration reads null everywhere,
which is the pre-D2 behaviour rather than a new failure.

## The anchor

At `canonical_parameters` the template must still *be* the source item: `stem`,
all four `choices`, `correct_answer`, and the whole `misconception_tag` map, byte
for byte. Checked by `anchor_failures` (:523) and hashed into
`source_fingerprint` (:317) so a source item reworded after verification is
detectable at read time.

It does **not** anchor the worked solution. That is a slice of the Part 4 markdown
blob, it is teacher-only, and its substitution checks are sign sensitive.

**Known consequence, accepted.** A rolled instance makes the authored worked
solution stale for that roll. The key shows the canonical solution with a note
that the student saw a rolled variant. Do not try to template the solution.

## Distractor rules

Carried over from the item-bank handoffs. All four hold for every roll, not just
the canonical one.

1. **Every distractor traces to exactly one named student error.** The slug is
   the misconception's identity. One letter, one slug, one procedure.
2. **No distractor implies an invalid rule is valid.** A wrong answer must be
   reachable by a real error a real student makes, not by a rule that does not
   exist.
3. **Every wrong value is independently verified.** That is what
   `choice_derivations` is for. Write the procedure the way the
   `distractor_logic` sentence describes it, unsimplified, and let the harness
   prove it produces the stored formula.
4. **No distractor is trivially eliminable.** A choice that is obviously absurd
   at every roll teaches a student to guess by shape.
5. **No two choices may be equal in value at any roll.** Compared by value, not
   by string. This is the check that caught `x/2` against `4x/8`. The one
   exception requires **both** that the form itself is the topic's named assessed
   skill and that the slug names precisely the error the student made, and it is
   allowlisted per item in `scripts/check_topic.py`. "The stem said reduce
   completely" is not the test.
6. **The slug must already exist in `data/docs/misconception_taxonomy.json`.**
   480 approved slugs. **Never invent one.** That file is generated and carries
   `do_not_edit`. `verify_templates.py` does not check slugs; `check_topic.py`
   does, which is why the stage 3 checklist runs both.

## LaTeX and rendering rules

House style, checked on rendered output by `latex_problems` (:367): no `$$`, no
unbalanced `$`, no em or en dashes, no slash fractions, no coefficient written as
`1x`.

Three traps used to be listed here as things the checker could not catch. All
three were confirmed by measurement rather than inferred, and the hardening
branch has since closed all three. They are kept, because each one still
constrains what you can author -- what changed is that the harness now tells you
instead of shipping it.

**`render()` cannot handle LaTeX braces in a stem.** Placeholders are `{name}`
and any leftover `{\w+}` raises. So `\frac{x}{2}`, `x^{2}`, `\sqrt{9}` and
subscripts are all unusable inside `stem_template`. `\frac{a}{2}` is worse than
unusable: `{a}` is substituted as a parameter first, silently. **If the item's
stem needs a brace, the item cannot be templated as the schema stands** -- which
rules out AR.2.1 practice 7 and three of QR.1.1's four mini-quiz stems. Note the
tension: `latex_problems` tells you house style is `\frac{}{}` while `render`
makes it impossible in a stem. `check_stem_braces` now rejects the stem up front
and names the collision, instead of leaving you to read "unresolved placeholders
['x', '2']" as a harness bug.

**`house_latex` truncates non-integer coefficients whenever `variables` is
non-empty.** The `Poly` branch called `int(coeff)`. Measured: `13/2` rendered
`$6$`, `-1/2` rendered `$0$`, `3*x/2` rendered `$x$`, and `x/2 + 5/2` rendered
`$2$` with the x term gone entirely. When `variables` is empty the function
returns early through plain `latex()` and rationals render correctly. **So:
never declare a variable on a template whose formulas can produce a fractional
coefficient** -- but it now raises rather than truncating, so this is a failed
run and not a wrong answer choice in front of a student.

**Choices used to render as `$<expression>$` and nothing else,** which put a
choice of `$x = 5$` out of reach and with it most of the algebra strand: the
anchor compares byte for byte against the source choice, so all four letters
drifted. `choice_prefix` is that schema addition. It emits literal LaTeX inside
the span, before the expression, and is not substituted -- a prefix that varied
with the parameters would be part of the answer, and the answer is what
`choice_formulas` is for.

A **suffix** is still out of reach, and is a different problem rather than the
same field turned around: `$26$ cm` puts its unit outside the span, so it is a
change to how a choice is assembled, not to what goes inside it. No live
template needs one.

Three more the checker **does** catch, all new enough to be worth knowing
before you author rather than after. A rendered stem is capped at 240
characters. No answer letter may carry more than 40% of the pool weighted by
parameter sets -- which is not the 3/4/4/3 item tally `check_topic.py` pins,
because a template's correct letter cannot move across its instances. And every
rendered stem and choice is KaTeX-parsed, on the materialised instances rather
than on the source, because `check_katex_render.mjs` renders
`stripAuthoringBlocks(source)` and therefore cannot see a template at all: an
unknown macro in a `stem_template` is invisible on disk and red on every
instance.

## Calculator policy

No calculator. Every rolled instance must be solvable by hand at the tier the
item sits in. The bank agrees by measurement: `requires_calculator` is false on
1,092 of 1,116 items.

Concretely, and this is where ranges get narrowed:

- Answers come out **clean**. Integer solutions, exact division, perfect squares
  where a root is taken, sums that do not need carrying at Basic.
- A constraint that keeps an answer integral is required, not optional. Roll the
  *solution* and derive the constant, rather than rolling the constant and hoping
  the solution divides.
- Products stay inside a mentally computable range. QR.3.5 caps coefficients at 9
  so the multiply-instead-of-add distractor stays in a Basic student's head.
- If a distractor is fractional by nature, the correct answer must still be
  clean, and `variables` must be empty. See the truncation trap above.

## Stage 3 checklist

Run in this order. Every step gates the next. Nothing uploads without a green
run of the first two in the same session.

1. `python3 scripts/check_topic.py curriculum/source/tsia2-math/<unit>/<TOPIC>.md`
   Duplicate-valued choices, the A:3 B:4 C:4 D:3 answer tally, slugs against the
   taxonomy, unpaired dollar signs inside JSON strings, em dashes. **Run before
   committing, not after.** Note that a `$` inside a template `range_notes`
   string trips the currency check; spell currency as a word.
2. `python3 scripts/verify_templates.py --topic <TOPIC> --unit <unit>`
   Anchor, formula vocabulary, pairwise distinctness, correct answer re-derived
   from the question's structure, every derivation against its stored formula,
   house LaTeX, a KaTeX parse of every rolled string, sign-error coverage, and
   the cross-pool exposure rule. Must report every item passing and **zero
   MISSING**. Items listed as `static` are fine; those are the ones you
   deliberately held out.
3. `node scripts/check_katex_render.mjs curriculum/source/tsia2-math/<unit>/<TOPIC>.md`
   Detects LaTeX that KaTeX renders as red literal source text without throwing.
   Note it strips authoring blocks, so it checks the static item and **cannot
   see a template at all**. The rolled instances are covered instead by step 2,
   which KaTeX-parses every rendered stem and choice in the pool. Both are
   needed: this one covers the prose and the worked solutions, that one covers
   what the template produces.
4. `python3 curriculum/migrations/upload_templates.py --course tsia2-math --topic <TOPIC> --unit <unit> --dry-run`
   Prints one rendered non-canonical roll per item. **Read all fourteen by eye.**
   This is the only place a human sees what a student will actually be shown.
5. `npx tsc --noEmit`, then commit and open the PR. Do not upload. Juan uploads.

### Mixed pools are legal. Held-out items must SAY they are held out

This used to be an all-or-nothing rule: any live instance replaced a topic's
authored pool outright, so a topic where three items resisted templating could
not ship three static plus eleven rolled -- it shipped eleven, and the other
three silently left every worksheet. **Either all fourteen template, or the
topic is not a candidate.** That is no longer true, and the scope decision it
forced is no longer yours to make up front.

What replaced it is one rule with two halves, and the whole design is in the
difference between them:

| in the fenced block | verifier | what the item is |
|---|---|---|
| `"template": { ... }` | verified, rolled | templated |
| `"template": "static"` | **pass**, listed as `static` | deliberately held out |
| no `template` key | **hard fail**, listed as `MISSING` | forgotten |

An item nobody has considered must not ship by omission. Declaring an item
static is a decision with a name on it; leaving the key out is an oversight, and
the two are indistinguishable unless one of them is written down. So the
harness makes you write it down.

`getItemsForTopic` composes the two backends per item, and the rule itself is
`mergePools` in `app/lib/worksheet-select.ts`, which is runtime-pure and unit
tested. A rolled instance is offered for every item that actually rolled; every
other printable item comes from the static bank. Note "actually rolled" and not
"has a template row": when every instance of one template has been retired, that
item's authored version comes back into the pool rather than disappearing from
both sides.

`upload_templates.py` still refuses to build records while any item is
`MISSING`, and its dry run now names the held-static items, because "11
templates" reads like a whole pool otherwise.

So: template what templates cleanly, mark what does not, and say which in the
PR. A topic is a candidate as soon as *some* of it templates.

## What a template session PR contains

One topic. The topic markdown with a `template` key added to **every** gradeable
item -- a real template, or `"static"` for the ones you are holding out -- and no
other content change. A verifier run pasted in full showing every item passing,
zero MISSING, the held-static items named, the parameter-set count and whether
the mode was exhaustive or sampled.
The dry-run output showing one rolled instance per item, each with the band it
inherited. A topic no longer loses its difficulty filters by being templated, so
what the PR states instead is any item whose band looks wrong for the range it
rolls. No upload, and no SQL.
