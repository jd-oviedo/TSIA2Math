# Math format

How mathematics is written in a topic file and what happens to it on the way to a
printed worksheet. Every example below was run through the real pipeline at commit
`d382066`, not reconstructed.

## The convention

**Inline math goes inside single dollar signs: `$...$`.** Display math goes inside
double dollar signs: `$$...$$`. Both are standard remark-math.

House rule, and it is stronger than it looks: **numbers in an item are set as math
even when they are bare integers.** `$3$` notebooks, not `3` notebooks. Read the
exemplars and copy the density; a stem that mixes styled and unstyled numbers reads
as a typographical accident on the page.

## The pipeline

Server side, in `lib/curriculum-utils.ts`:

```
remarkParse -> remarkGfm -> remarkMath -> remarkRehype -> rehypeKatex
            -> rehypeScrollableTables -> rehypeStringify
```

Two entry points:

| function | used for | behaviour |
|---|---|---|
| `renderMarkdownWithMath()` | block content: guided notes, worked solutions | full markdown to HTML |
| `renderInlineWithMath()` | fragments: a stem, one answer choice | same pipeline, then unwraps the single `<p>` so a choice label does not line break |

The output is an HTML **string**, produced on the server, carrying KaTeX's own
markup. `WorksheetSheet.tsx` injects it with `dangerouslySetInnerHTML` as
`stem_html` and `choices_html`. KaTeX's stylesheet is loaded globally from
`app/globals.css`.

### Not MathText.tsx

`app/components/MathText.tsx` is a **client** component that calls KaTeX directly
on a `$...$`-segmented string. It serves the CAT adaptive test, the teacher
dashboard and the demo pages. **It is not in the curriculum or worksheet path at
all.** If you are reasoning about how a curriculum item renders, the answer is
always the remark pipeline above.

The two differ in ways that matter. `MathText` swaps escaped dollars for a
private-use sentinel before parsing, and it downgrades a handful of isolated
symbols (`$\times$` becomes a literal times sign). The remark pipeline does
neither. Do not carry an assumption from one to the other.

## Before and after, run for real

### A single answer choice

Authored:

```
$60\%$
```

`renderInlineWithMath()` output, verbatim:

```html
<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>60</mn><mi mathvariant="normal">%</mi></mrow><annotation encoding="application/x-tex">60\%</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8056em;vertical-align:-0.0556em;"></span><span class="mord">60%</span></span></span></span>
```

Note the paragraph wrapper is gone. That is the whole difference between the two
entry points, and it is why a choice label sits on one line.

### A stem with a fraction

Authored:

```
Convert $\frac{3}{5}$ to a percent.
```

Output, verbatim:

```html
Convert <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>3</mn><mn>5</mn></mfrac></mrow><annotation encoding="application/x-tex">\frac{3}{5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">5</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span> to a percent.
```

The prose survives as prose. Only the `$...$` span becomes KaTeX. The original
LaTeX is preserved inside the MathML `<annotation>` element, which is how the
source is recoverable from the rendered output.

### Currency, the case worth memorising

Authored. Two mathematical numbers in `$...$`, one price escaped as `\$`:

```
A store sells $3$ notebooks for \$12. At the same rate, how much do $7$ notebooks cost?
```

Output, verbatim:

```html
A store sells <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn></mrow><annotation encoding="application/x-tex">3</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">3</span></span></span></span> notebooks for $12. At the same rate, how much do <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>7</mn></mrow><annotation encoding="application/x-tex">7</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">7</span></span></span></span> notebooks cost?
```

**`\$12` rendered as a literal `$12`, as plain text, outside every KaTeX span.**
That is the correct result and it is what the escape is for.

Now the failure. Written as a bare `$12`, remark-math pairs that dollar sign with
the next one downstream and typesets everything between them as mathematics:

```
A store sells $3$ notebooks for $12. At the same rate, how much do $7$ notebooks cost?
                                 ^                                  ^
                                 these two pair, and
                                 ". At the same rate, how much do " becomes math
```

The page does not error. It renders a sentence with a run of italic prose in the
middle of it, in front of a student. This shipped three times before the linter
caught it, on QR.1.2, QR.2.1 and QR.3.5.

`scripts/lint_curriculum_source.py` now fires three ERRORs on this class:

| check | fires when |
|---|---|
| escaped currency inside math delimiters | `$\$28$` |
| prose swallowed into a math span | three or more consecutive lowercase words inside `$...$` |
| odd number of unescaped `$` | the delimiters on a line do not pair |

### The mirror mistake

`$\$28$` is equally wrong. The escaped dollar is still a delimiter to the
scanner, so the span closes in the wrong place.

```
\$28           correct
$\$28$         WRONG, escaped currency inside math
$28            WRONG, bare dollar pairs downstream
```

Prose glosses in `distractor_logic` are scanned by the same checks. The house
solution there is to write the amount in words: "divides 12 dollars by 3 to find a
unit rate of 4 dollars per notebook".

## The escape is resolved at render time, not at parse time

`\$` survives the parser and is stored in the database as `\$`. The parsed
`StoredItem` for QR.2.1 practice 9 carries:

```json
"stem": "A store sells $3$ notebooks for \\$12. At the same rate, how much do $7$ notebooks cost?",
"choices": { "A": "\\$28", "B": "\\$16", "C": "\\$5.14", "D": "\\$4" }
```

(Double backslashes because that is JSON escaping of a single literal backslash.)
So a raw database read shows `\$28`, not `$28`. That is correct and expected.
Nothing downstream should strip it.

## LaTeX that is in use

Measured across the 97 topic files. These render and are safe to use:

`\frac`, `\sqrt`, `\times`, `\div`, `\leq`, `\geq`, `\neq`,
`\approx`, `\cdot`, `\pi`, `\%`, `\text{}`, superscripts with `^`,
subscripts with `_`.

Two hard rules from the linter:

1. **A LaTeX command outside a `$...$` span is an ERROR.** It would render as
   literal backslash text on the page.
2. **A raw Unicode math symbol is an ERROR.** Write `\times`, never the
   multiplication character. The full substitution table is in `item-schema.md`.

## Display math

`$$...$$` works and is used in guided notes:

```
$$\frac{1}{2} \text{ and } 0.5 \text{ and } 50\%$$
```

It is fine in Part 1. **Avoid it in an item stem or a choice**, where a block-level
formula breaks the inline layout of a question and a printed worksheet cell.
