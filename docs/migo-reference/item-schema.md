# Item schema

What you write, what the parser makes of it, and how it reaches a printed page.

## The pipeline, in one line

```
topic markdown  ->  upload_curriculum.py  ->  curriculum_topics.practice_items (jsonb)
                ->  curriculum_topics_public (redacted view)  ->  worksheet generator  ->  printed sheet
```

**The parser is the only way in.** There is no path that accepts a hand-written
JSON item. You author markdown; `curriculum/migrations/upload_curriculum.py`
parses it into structured items at upload time and writes them to the database.
Parsing happens at upload rather than at render so that a shape the parser does
not expect fails on a named file before it ships, instead of failing silently in
front of a student.

## Where the items actually live

Correcting a common misreading: **`curriculum_practice_items` and
`curriculum_misconception_tags` are not tables.** They are `jsonb` **columns on
`public.curriculum_topics`**, named `practice_items` and `misconception_tags`.
The files `sql/curriculum_practice_items.sql` and
`sql/curriculum_misconception_tags.sql` each contain a single
`alter table ... add column`.

The worksheet generator reads **`curriculum_topics_public.practice_items`**, a
redacted view defined in `sql/curriculum_topics_public.sql`. The view applies

```sql
jsonb_strip_keys(practice_items, array['correct_answer', 'misconception_tag'])
```

so the picker and the printed worksheet physically cannot see an answer. The
answer key is a separate read against the base table through the service-role
client, after `requireTeacher()`. Two paths, deliberately never merged.

| what | table | carries answers |
|---|---|---|
| picker, preview, printed questions | `curriculum_topics_public` | no, stripped in SQL |
| answer key and rationales | `curriculum_topics` | yes |
| rolled template variants | `curriculum_item_instances` | only on the key path |

`curriculum_item_templates` exists but is not an authoring target. Exactly one
topic of 97 is templated (QR.3.5). See `index.md`.

## The topic file

One file per topic, at `curriculum/source/tsia2-math/unit-<N>/<TOPIC_ID>.md`.

Two things come from the path, not from the frontmatter:

- **`topic_id` is the filename stem.** There is no `topic_id` frontmatter key.
- **`unit_number` written to the database is the directory number**, parsed from
  `unit-<N>`. The uploader ignores the frontmatter `unit_number` entirely. The
  linter requires the key to be present, so keep the two in agreement; they agree
  on all 97 files today.

The uploader globs `unit-*/[AGPQ][R]*.md`. **A file whose name does not start with
`AR`, `GR`, `PR` or `QR` is silently skipped**, with no warning and no error, and
the run still reports success.

### Frontmatter

All eight keys are present on all 97 files. `lint_curriculum_source.py` errors on
a missing one.

| key | type | required | notes |
|---|---|---|---|
| `topic_name` | string | yes | quoted. House convention is sentence case, not enforced |
| `unit_number` | int | yes | 0 to 5. Keep it equal to the directory number, which is what actually gets stored |
| `sequence_in_unit` | int | yes | position within the unit |
| `assessment_layer` | string | yes | exactly one of `DIAGNOSTIC`, `CRC`, `ENRICHMENT` |
| `estimated_time_minutes` | int | yes | enforced by `require_estimated_time()` |
| `difficulty_band` | string | yes | `Basic`, `Proficient` or `Advanced`. Topic level, **not** the per-item `level` |
| `related_strand` | string | yes | `QR`, `AR`, `GR` or `PR`. Matches the topic id prefix |
| `keywords` | list | yes | JSON-style array of quoted strings |

### The four Parts

The body is split on four headings of the form `#### **Part N: ...**`. The split
is literal and positional. A malformed heading folds one Part into another.

| Part | heading | content | goes to column |
|---|---|---|---|
| 1 | `#### **Part 1: Guided Notes**` | the lesson | `guided_notes` |
| 2 | `#### **Part 2: Practice Problems**` | 10 practice items | `practice_problems` and parsed into `practice_items.practice` |
| 3 | `#### **Part 3: Mini Quiz**` | 4 quiz items | `mini_quiz` and parsed into `practice_items.mini_quiz` |
| 4 | `#### **Part 4: Answer Key**` | worked solutions, answers, tags | `answer_key`, `misconception_tags`, `distractor_prose`, `worked_solutions` |

**Never put an answer in Part 1, 2 or 3.** Those columns are published raw to the
public view with no redaction. The redaction that protects `practice_items` is
key-based SQL; the protection on `practice_problems` and `mini_quiz` is only the
convention that authors keep answers in Part 4. `scripts/audit_anon_exposure.py`
asserts it from the outside.

## The canonical shape

**10 practice items, banded 4 Basic / 3 Proficient / 3 Advanced, plus 4 mini quiz
items. 96 of 97 topics follow it exactly.**

`lint_curriculum_source.py` errors on any deviation:

```
practice has N items, expected 10
Basic level has N items, expected 4
Proficient level has N items, expected 3
Advanced level has N items, expected 3
mini quiz has N items, expected 4
```

Mini quiz items also carry bands, written the same way, but the linter does not
enforce a distribution across the 4.

## Part 2 syntax, practice items

The item header is a number, a period, and whitespace at the start of a line. The
band comes from a `**<Band> Level**` heading, which applies to every item below it
until the next one.

```markdown
**Basic Level** (try these first)

1. Convert $\frac{3}{5}$ to a percent.
   - A) $0.6\%$
   - B) $35\%$
   - C) $60\%$
   - D) $167\%$
```

- Header regex: `^(\d+)\.[ \t]+`
- Choice regex: lines of the form `- A)` through `- D)`
- Band regex: `^\*\*(\w+) Level\*\*`
- The stem is everything between the header and the first choice line, collapsed
  onto one line with newlines turned into single spaces.

An item with **no** `- A)` lines parses as `free_response` and **never reaches a
worksheet.** Only 9 free-response items exist, all in QR.1.1.

## Part 3 syntax, mini quiz items

Different header shape. The stem sits on its own line below the header, not on it.

```markdown
**Basic Level**

**Item 1**

Solve for $x$: $x - 7 = 12$

- A) $x = 5$
- B) $x = 19$
- C) $x = -5$
- D) $x = 84$
```

- Header regex: `^\*\*Item (\d+)\*\*`
- Item numbers restart at 1. `item_number` is unique within a section, not within
  the topic.

## Part 4 syntax, the answer key

Two subsections back to back. The practice half comes first; the mini quiz half
begins at a `##### Mini Quiz` heading and everything after it is parsed with the
quiz header shape.

- Practice item header: `^\*\*(\d+)\.` , which restates the stem in bold
- Quiz item header: `^\*\*Item (\d+):` , with a colon, restating the stem
- Answer line: `^\*\*Answer:\s*([A-D])\*\*` , optionally followed by the value in
  parentheses
- Then one fenced `json` block holding `distractor_logic` and `misconception_tag`

The fenced block is a bare fragment, not a parseable object. It is read with
anchored regexes, not `json.loads`. Keep the exact two-block shape.

See `misconception-tags.md` for the tag rules and `exemplar-items.md` for four
complete worked examples.

## The parsed item: `StoredItem`

**This is parser output. You never hand-write it.** It is documented so you can
predict what your markdown becomes.

Type definition: `app/lib/worksheet-source.ts`. Producer:
`build_practice_items()` in `curriculum/migrations/upload_curriculum.py`.

| field | type | optional | produced from |
|---|---|---|---|
| `item_number` | int | no | the item header number |
| `format` | `"multiple_choice"` or `"free_response"` | no | derived: `multiple_choice` when the item has choice lines |
| `stem` | string | no | text between the item header and the first choice, whitespace collapsed |
| `choices` | object, letter to string | no | the `- A)` through `- D)` lines. `{}` for free response |
| `correct_answer` | string or null | yes | the `**Answer: X**` line in Part 4. `null` for free response |
| `misconception_tag` | object, letter to slug | yes | the `misconception_tag` block in Part 4. `{}` when untagged |
| `level` | `"Basic"`, `"Proficient"`, `"Advanced"` or null | yes | the nearest `**<Band> Level**` heading above the item |

Wrapper written to the column:

```json
{
  "practice":  { "interactive": true, "items": [ ... ] },
  "mini_quiz": { "interactive": true, "items": [ ... ] }
}
```

`interactive` is **derived, not authored.** It is true only when every item in the
section is `multiple_choice` **and** has a known `correct_answer`. A section that
comes back false loses its mastery gate and the page falls back to static
markdown, which `lint_curriculum_source.py` reports as an error.

The public view strips `correct_answer` and `misconception_tag` from every item,
so the shape the worksheet generator sees is the same object with those two keys
absent.

## What the generator will and will not draw

Eligibility is `isPrintable()` in `app/lib/worksheet-select.ts`:

```ts
item.format === 'multiple_choice'
  && !!item.choices
  && Object.keys(item.choices).length > 0
```

Format and choices, and nothing else, because the redacted view has no
`correct_answer` to test. Two consequences you author against:

1. **A free-response item is invisible to the worksheet generator.** It cannot be
   drawn at any setting.
2. **An item with `level: null` is invisible to any band filter.** `passesLevel()`
   requires `level != null` and a match. When a teacher ticks a band, unbanded
   items are set aside with a note. Author the band heading or the item silently
   disappears from filtered worksheets.

Current pool: **1,351 printable items** across 97 topics, 972 practice plus 388
mini quiz, minus the 9 free-response ones.

## How an item reaches a printed worksheet

1. The teacher picks topics at `/teacher/worksheets/new`. `listPickerTopics()`
   reads the public view and ships `PoolEntry[]` (section and band only) to the
   browser so the badge can count with the draw's own rule.
2. `POST /api/teacher/worksheets` calls `getItemsForTopic()` per topic, then
   `selectItems()`, which filters by band and `include_quiz`, allocates across
   topics, and shuffles within each topic against a stored seed.
3. What is stored on the worksheet row is a **reference**, not a copy:

   ```ts
   type ItemRef =
     | { source: 'static';   topic_id: string; section: Section; item_number: number }
     | { source: 'instance'; topic_id: string; instance_id: string };
   ```

   So **editing a topic file changes every existing worksheet that references it.**
   There is no snapshot. A reference that stops resolving (a renumbered item)
   silently shortens the sheet, and the page reports the count as missing.
4. `resolveForPrint()` reads the public view, renders `stem` and each choice
   through `renderInlineWithMath()`, and returns `stem_html` and `choices_html`.
5. `WorksheetSheet.tsx` injects that HTML. Order is exactly as stored, so a
   worksheet reprints identically.
6. The answer key is fetched separately, on demand, by a server action that reads
   the base table. The printed rationale is the `Correct:` line from
   `distractor_logic`, not the worked solution.

Limits enforced by the API: 1 to 20 topics, 1 to 200 questions per worksheet.

## Figures are generated, not authored

Some items carry a figure, written as two lines inside the stem:

```markdown
<!-- figure: gr-2-1-lshape -->
![A full sentence describing the figure.](data:image/svg+xml;base64,...)
```

The comment names a spec at `curriculum/figures/<id>.json`. The data URI is
**baked from that spec by a build step.** It is not typed by a person and it
cannot be reconstructed or approximated by hand.

**The rule: Migo does not write base64 and does not author new figure-bearing
items.** If an item needs a figure to be answerable, flag it and stop. Do not
write the item without the figure, do not invent a data URI, and do not describe a
figure that does not exist. A fabricated figure either breaks or, worse, silently
disagrees with the numbers in the stem, and nothing in the pipeline checks that.

Where a figure does exist, the stem still restates every number in it, so the item
is answerable without the picture. 54 items across 7 topics carry one.

## House rules

These are the rules `scripts/lint_curriculum_source.py` enforces before an upload.
Everything marked ERROR fails the run. Author against these, do not discover them
afterwards.

### ERROR: currency is `\$`, never a bare `$`

A literal dollar sign is `\$28`. It must **never** sit inside math delimiters, so
`$\$28$` is also wrong.

```
A store sells $3$ notebooks for \$12.        correct
A store sells $3$ notebooks for $12.         WRONG
A store sells $3$ notebooks for $\$12$.      WRONG
```

A bare `$12` pairs with the next dollar sign downstream and typesets the prose
between them as mathematics. This is a real defect that shipped three times
(QR.1.2, QR.2.1, QR.3.5). The check works by delimiter pairing, and also fires on
an odd number of unescaped `$` on a line.

### ERROR: no LaTeX outside a `$...$` span

`\frac`, `\sqrt`, `\times`, `\div`, `\leq`, `\geq`, `\neq`, `\approx`, `\cdot`,
`\pi`, `\le`, `\ge` must be inside math delimiters or they render literally.

### ERROR: no raw Unicode math symbols

Write the LaTeX, not the character.

| do not write | write |
|---|---|
| `×` | `\times` |
| `÷` | `\div` |
| `≤` | `\leq` |
| `≥` | `\geq` |
| `≠` | `\neq` |
| `≈` | `\approx` |
| `√` | `\sqrt` |
| `π` | `\pi` |
| `−` (minus sign) | `-` (hyphen) |
| `²` `³` | `^2` `^3` |
| `½` `¼` `¾` | `\frac{1}{2}` and so on |

### ERROR: no em dashes

Anywhere in the file. Use a comma, a colon, or two sentences.

### ERROR: approved misconception slugs only

Every slug must already exist in `data/docs/misconception_taxonomy.json` with
`status: approved`. Inventing one fails the file. See `misconception-tags.md`.

### ERROR: the 10 (4 Basic / 3 Proficient / 3 Advanced) plus 4 shape

Item counts and band distribution, as above. Also errors if a section is not
`interactive`.

### WARN: spread the correct answers across A, B, C and D

`PracticeQuiz.tsx` renders options in fixed order and **does not shuffle**, so a
topic whose answers bunch on one letter is a real defect: a student can score by
picking that letter. Two warnings fire:

- more than 45 percent of the 14 correct answers on one letter
- any of A, B, C, D never used as a correct answer

Warnings do not fail the run, but they are findings. Aim for a roughly even spread
across the 14 items.

### The current baseline

At commit `d382066` the whole course lints to **5 errors and 10 warnings, all
pre-existing.** The 5 errors are all QR.1.1's non-standard shape. The 10 warnings
are answer-letter skew on QR.1.1, QR.1.2, QR.1.3, QR.1.4 and QR.2.1.

Anything you author should add zero errors. Run:

```
python3 scripts/lint_curriculum_source.py --topics QR.2.2
```
