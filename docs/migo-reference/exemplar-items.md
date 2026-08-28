# Exemplar items

Four real items, copied from the repo at commit `d382066`. LaTeX is preserved
exactly. These are the gold standard: match this shape.

Each exemplar shows the **authored markdown first** (what you write) and the
**parsed JSON second** (what the parser produces). You never write the JSON.

The three clean exemplars are QR.1.2, AR.2.1 and QR.2.1. The fourth, GR.2.1, is a
reference for reading figure-bearing items, not a template for writing one. See
"Figures are generated, not authored" at the end.

---

## Exemplar 1: QR.1.2, practice item 1

Topic: `QR.1.2`, Ordering values across forms (fractions, decimals, percents).
Strand QR, layer CRC, unit 1, sequence 2.

The plainest possible item. One skill, four options, three named errors.

### Part 2, as authored

```markdown
**Basic Level** (try these first)

1. Convert $\frac{3}{5}$ to a percent.
   - A) $0.6\%$
   - B) $35\%$
   - C) $60\%$
   - D) $167\%$
```

### Part 4, as authored

````markdown
**1. Convert $\frac{3}{5}$ to a percent.**

Step 1: Divide top by bottom.
- $3 \div 5 = 0.6$

Step 2: Multiply by $100$ to reach a percent.
- $0.6 \times 100 = 60$

**Answer: C** ($60\%$)

```json
"distractor_logic": {
  "A": "Student makes misconception: skips_times_100 (converts 3/5 to 0.6, then attaches a percent sign without multiplying by 100, producing 0.6%)",
  "B": "Student makes misconception: fraction_digit_gluing (reads the digits of 3/5 straight off as a percent, producing 35%)",
  "C": "Correct: divides 3 by 5 to get 0.6, then multiplies by 100 to get 60%",
  "D": "Student makes misconception: reversed_division (computes 5 divided by 3 instead of 3 divided by 5, getting 1.667 and producing 167%)"
},
"misconception_tag": {
  "A": "skips_times_100",
  "B": "fraction_digit_gluing",
  "D": "reversed_division"
}
```
````

### Parsed `StoredItem` (parser output, never hand-written)

```json
{
  "item_number": 1,
  "format": "multiple_choice",
  "stem": "Convert $\\frac{3}{5}$ to a percent.",
  "choices": {
    "A": "$0.6\\%$",
    "B": "$35\\%$",
    "C": "$60\\%$",
    "D": "$167\\%$"
  },
  "correct_answer": "C",
  "misconception_tag": {
    "A": "skips_times_100",
    "B": "fraction_digit_gluing",
    "D": "reversed_division"
  },
  "level": "Basic"
}
```

Note what happened. The `**Basic Level**` heading above the item became
`"level": "Basic"`. The `**Answer: C**` line became `"correct_answer": "C"`. The
`- A)` lines became the `choices` map. Nothing in the JSON was typed by hand.

---

## Exemplar 2: AR.2.1, mini quiz item 1

Topic: `AR.2.1`, Solving one-variable linear equations. Strand AR, layer CRC,
unit 2, sequence 8.

This is the mini quiz form. Note the different item header: `**Item 1**`, not
`1.`, and the stem sits on its own line below it rather than on the header line.

### Part 3, as authored

```markdown
**Basic Level**

**Item 1**

Solve for $x$: $x - 7 = 12$

- A) $x = 5$
- B) $x = 19$
- C) $x = -5$
- D) $x = 84$
```

### Part 4, as authored

The mini quiz key sits under its own `##### Mini Quiz` heading, and its item
headers carry a colon and restate the stem.

````markdown
##### Mini Quiz - Answer Key

**Item 1: Solve for $x$: $x - 7 = 12$**

Step 1: The equation subtracts $7$, so add $7$ to both sides.
- $x = 19$

Step 2: Check. $19 - 7 = 12$. Correct.

**Answer: B** ($x = 19$)

```json
"distractor_logic": {
  "A": "Student makes misconception: sign_error_on_constant (subtracts the 7 from 12 instead of adding it, producing 5, which fails the check at -2)",
  "B": "Correct: adds 7 to both sides to reach 19, which checks against the original equation",
  "C": "Student makes misconception: subtracts_in_wrong_order (computes 7 minus 12 rather than 12 plus 7, producing -5)",
  "D": "Student makes misconception: multiplies_instead_of_divides (multiplies 12 by 7, treating the constant as a factor rather than a subtracted term, producing 84)"
},
"misconception_tag": {
  "A": "sign_error_on_constant",
  "C": "subtracts_in_wrong_order",
  "D": "multiplies_instead_of_divides"
}
```
````

### Parsed `StoredItem` (parser output, never hand-written)

```json
{
  "item_number": 1,
  "format": "multiple_choice",
  "stem": "Solve for $x$: $x - 7 = 12$",
  "choices": {
    "A": "$x = 5$",
    "B": "$x = 19$",
    "C": "$x = -5$",
    "D": "$x = 84$"
  },
  "correct_answer": "B",
  "misconception_tag": {
    "A": "sign_error_on_constant",
    "C": "subtracts_in_wrong_order",
    "D": "multiplies_instead_of_divides"
  },
  "level": "Basic"
}
```

Two things to copy from this one. The worked solution ends with a **check**, which
is house style for equation solving. And the `distractor_logic` for A names not
just the wrong value but why it fails: "which fails the check at -2".

---

## Exemplar 3: QR.2.1, practice item 9

Topic: `QR.2.1`, Applying a simple ratio to calculate a value. Strand QR, layer
CRC, unit 1, sequence 5.

The currency exemplar. **This is the item to reread before writing any question
about money.** Every literal dollar sign is `\$`. Every mathematical value is
inside `$...$`.

### Part 2, as authored

```markdown
9. A store sells $3$ notebooks for \$12. At the same rate, how much do $7$ notebooks cost?
   - A) \$28
   - B) \$16
   - C) \$5.14
   - D) \$4
```

Read that closely. `$3$` and `$7$` are the numbers three and seven set as math.
`\$12`, `\$28`, `\$16`, `\$5.14` and `\$4` are prices. A bare `$12` here would
pair with the next dollar sign downstream and typeset the prose between them as
mathematics.

### Part 4, as authored

````markdown
**9. A store sells $3$ notebooks for \$12. At the same rate, how much do $7$ notebooks cost?**

Step 1: Find the unit rate. One notebook costs:
- $12 \div 3 = 4$, so one notebook is \$4

Step 2: Scale up to 7 notebooks.
- $7 \times 4 = 28$, so seven notebooks cost \$28

Step 3: Check. Is $3:12$ the same rate as $7:28$? Both reduce to $1:4$. Correct.

**Answer: A** (\$28)

```json
"distractor_logic": {
  "A": "Correct: divides 12 dollars by 3 to find a unit rate of 4 dollars per notebook, then multiplies by 7 to get 28 dollars",
  "B": "Student makes misconception: adds_instead_of_scales (sees notebooks rise from 3 to 7, a gain of 4, and adds that same 4 dollars to the 12 dollars, producing 16 dollars)",
  "C": "Student makes misconception: reversed_division (multiplies 12 dollars by 3/7 instead of 7/3, flipping the rate and producing 5.14 dollars)",
  "D": "Student makes misconception: answers_intermediate_value (reports the 4 dollar unit rate as the answer instead of scaling it up to 7 notebooks)"
},
"misconception_tag": {
  "B": "adds_instead_of_scales",
  "C": "reversed_division",
  "D": "answers_intermediate_value"
}
```
````

Note the prose glosses say "12 dollars" and "4 dollars" in words rather than using
a dollar sign. `distractor_logic` is scanned by the currency check too, and
writing the amount in words sidesteps the delimiter question entirely.

### Parsed `StoredItem` (parser output, never hand-written)

```json
{
  "item_number": 9,
  "format": "multiple_choice",
  "stem": "A store sells $3$ notebooks for \\$12. At the same rate, how much do $7$ notebooks cost?",
  "choices": {
    "A": "\\$28",
    "B": "\\$16",
    "C": "\\$5.14",
    "D": "\\$4"
  },
  "correct_answer": "A",
  "misconception_tag": {
    "B": "adds_instead_of_scales",
    "C": "reversed_division",
    "D": "answers_intermediate_value"
  },
  "level": "Advanced"
}
```

The escape survives into storage as `\$`. It is resolved at render time, not at
parse time. See `math-format.md`.

---

## Exemplar 4: GR.2.1, practice item 8, READ ONLY

Topic: `GR.2.1`, Perimeter of polygons and multi-sided figures. Strand GR, layer
CRC, unit 3, sequence 1.

**This is a reference for reading figure-bearing items. It is not a template for
writing one.** See the rule below.

The base64 payload is 2,468 characters and has been replaced with
`[base64 SVG elided]`. Everything else is verbatim.

### Part 2, as authored

```markdown
8. An L-shaped figure has the following side lengths going around its boundary: $10$ m, $4$ m, $6$ m, $4$ m, $4$ m, and $8$ m. What is the perimeter of the figure?

<!-- figure: gr-2-1-lshape -->
![An L-shaped figure with its six sides labelled in order around the boundary: 10 m along the bottom, 4 m up the right side, 6 m left across the step, 4 m up the inner side, 4 m left across the top, and 8 m down the left side. Every side is drawn at its stated length, so the step is genuinely where the numbers put it.]([base64 SVG elided])
   - A) $36$ m
   - B) $32$ m
   - C) $80$ m
   - D) $28$ m
```

Two lines make the figure:

1. `<!-- figure: gr-2-1-lshape -->`, an HTML comment naming the spec. The spec
   lives at `curriculum/figures/gr-2-1-lshape.json`.
2. `![alt text](data:image/svg+xml;base64,...)`, a standard markdown image whose
   source is a baked data URI. The alt text is a full sentence describing the
   figure, because a student using a screen reader has to be able to answer the
   question from it alone.

The stem also **restates every number that appears in the figure**. The item is
answerable without seeing the picture. That is deliberate and it is why this item
survives being printed on a worksheet at all.

### Part 4, as authored

````markdown
**8. An L-shaped figure has the following side lengths going around its boundary: $10$ m, $4$ m, $6$ m, $4$ m, $4$ m, and $8$ m. What is the perimeter of the figure?**

Step 1: Count the sides given. Six.

Step 2: Add with a running total, crossing off each number as it is used.
- $10 + 4 = 14$
- $14 + 6 = 20$
- $20 + 4 = 24$
- $24 + 4 = 28$
- $28 + 8 = 36$ m

Step 3: Note that three of the six sides measure $4$ m. All three count.

**Answer: A** ($36$ m)

```json
"distractor_logic": {
  "A": "Correct: adds all six listed boundary sides, including all three of the 4 m sides, for 36 m",
  "B": "Student makes misconception: side_omitted_from_perimeter (loses one of the three repeated 4 m sides while adding, producing 32)",
  "C": "Student makes misconception: perimeter_area_confusion (multiplies the two largest dimensions as though finding the area of a bounding rectangle, producing 80)",
  "D": "Student makes misconception: side_omitted_from_perimeter (omits the final 8 m side, stopping the running total at 28)"
},
"misconception_tag": {
  "B": "side_omitted_from_perimeter",
  "C": "perimeter_area_confusion",
  "D": "side_omitted_from_perimeter"
}
```
````

### Parsed `StoredItem` (parser output, never hand-written)

The figure comment and the image are swallowed into the stem, because the parser
takes everything from the item header to the first `- A)` line. On a worksheet
this prints as an inline image inside the question.

```json
{
  "item_number": 8,
  "format": "multiple_choice",
  "stem": "An L-shaped figure has the following side lengths going around its boundary: $10$ m, $4$ m, $6$ m, $4$ m, $4$ m, and $8$ m. What is the perimeter of the figure? <!-- figure: gr-2-1-lshape --> ![An L-shaped figure with its six sides labelled in order around the boundary: 10 m along the bottom, 4 m up the right side, 6 m left across the step, 4 m up the inner side, 4 m left across the top, and 8 m down the left side. Every side is drawn at its stated length, so the step is genuinely where the numbers put it.]([base64 SVG elided])",
  "choices": {
    "A": "$36$ m",
    "B": "$32$ m",
    "C": "$80$ m",
    "D": "$28$ m"
  },
  "correct_answer": "A",
  "misconception_tag": {
    "B": "side_omitted_from_perimeter",
    "C": "perimeter_area_confusion",
    "D": "side_omitted_from_perimeter"
  },
  "level": "Advanced"
}
```

### Figures are generated, not authored

**Migo does not write base64. Migo does not author new figure-bearing items.**

The data URI is produced by a build step from a checked-in JSON spec under
`curriculum/figures/`. It is not something a person types, and it cannot be
reconstructed by hand or approximated. Fabricating one produces either a broken
image or a picture that disagrees with the numbers in the stem, and nothing in
the pipeline would catch the second case.

If a topic needs a figure to be answerable, **flag it and stop.** Do not write the
item without the figure, do not invent a data URI, and do not describe a figure
that does not exist. Hand the topic back with a note saying which item needs which
figure.

54 items across 7 topics currently carry an embedded figure.
