# Phase 2: reconciliation, token table and discrepancy list

Branch `feat/curriculum-visual-redesign`, written 2026-08-21, under the split-by-altitude
system. Investigation only. No product code changed and no SQL run.

---

## Part 0: the eight, ranked, with what is now settled

Ranked as in Phase 1, by how much each unblocks.

| # | Decision | Status after your answers |
|---|---|---|
| 1 | Which visual system | **SETTLED.** Split by altitude. Chrome and structure from source 1, reading surface from source 2, graph paper on syllabus and modules only |
| 2 | Orange as text on cream | **OPEN, narrowed.** You asked what the four roles look like taking ink first. Answered in 2.1. My finding: nothing is gutted, so **no fourth orange is needed** |
| 3 | Definition of topic complete | **OPEN, and it is a live defect.** Full report in Part 4. Recommendation made |
| 4 | Three tutor-absent layouts | **SETTLED.** Tutor-absent is the default rendering, composed from shipped primitives, tutor additive behind the capability check |
| 5 | What "Reveal worked solution" becomes | **OPEN by your instruction.** Three options with per-plan renderings in Part 5 |
| 6 | Red versus amber-brown on a miss | **OPEN.** Not in your answers. Raised again in Part 6, discrepancy D7 |
| 7 | Icon rail | **SETTLED, and cheaper than expected.** Keep Modules, Home gets a tile, and the app already has all five glyphs. See 2.4 |
| 8 | Placeholders as named rows | **OPEN.** Not in your answers. Discrepancy D9 |

Four settled, four open. Of the open four, only #3 blocks implementation.

---

## Part 1: the seam, reported before the tables

You asked me to tell you where the split produces an ugly seam rather than defend the
line. There is exactly one, and it is not where either of us was looking.

### 1.1 In light, the split is clean

Chrome ground `#FAF8F5` sits above reading ground `#E8E0CF`. That is a warm step in one
direction, both faintly warm, and the graph paper on the chrome side gives the eye a
reason for the change. It reads as two zones of one surface.

### 1.2 In dark, the two halves collide

Source 1's dark is a **blue-black**: ground `#0C1120`, bar and card `#161E30`. The
reading surface's derived dark is **warm neutral**: page `#17171A`, band `#201F1C`.

Measured against each other:

| Pair | Ratio |
|---|---|
| login bar `#161E30` against reading band `#201F1C` | **1.01** |
| login ground `#0C1120` against reading page `#17171A` | **1.05** |

They are the same brightness and a different hue. That is the worst possible
relationship: no luminance step to read as structure, and a visible blue-versus-brown
temperature shift with nothing explaining it. A hairline between them would not help,
because the eye reads the hue change as a rendering fault rather than as a boundary.

### 1.3 Where I would move the line

**Keep source 1's structure in dark and drop its hue.** The login system's dark
identity is carried by the hard border, the graph paper, the mono, the squared
geometry and the orange CTA, none of which are blue. The blue-black is the one part
that exists because the login screens had no warm surface to sit against. The
curriculum tree does.

Proposed dark chrome, warm, matching the reading ladder:

| Role | Login dark | Proposed curriculum dark chrome | Ink `#F2EDDF` on it |
|---|---|---|---|
| chrome ground | `#0C1120` | `#17171A` (same as reading page) | 15.29 |
| chrome bar | `#161E30` | `#1B1A18` | 14.87 |

This keeps light mode exactly as you specified and makes dark mode one temperature.
The cost is that the dark login screen and the dark lesson page will not share a
ground colour, which is a smaller inconsistency than two temperatures on one page.

If you would rather hold the blue-black, say so and I will build it; the seam is
cosmetic, not a failure, and it only appears in dark.

### 1.4 Graph paper, on the same question

I cannot honestly judge whether dropping graph paper behind lesson prose reads as
deliberate until both are rendered side by side, and I will report on it at
verification with screenshots. What I can say now is structural: the boundary is a
**route** boundary (`/dashboard/*` has it, `/course/*` does not), not a boundary inside
a page, so a student never sees the two grounds at once except for the half second of a
navigation. That is the condition under which this kind of split usually reads as
deliberate.

The one place it would appear within a single view is the topic overview, which is a
`/course` route that behaves like a syllabus page. Under your split it takes the
reading ground with no grid. Flagging it as the most likely spot to look wrong.

---

## Part 2: the four questions you asked before the tables

### 2.1 Orange as text, if it simply stops being orange

The four roles, and what each becomes taking `INK_MUTED` (`ink(0.6)`) instead:

| Role | Design | Taking ink | Ratio range across the seven cream surfaces |
|---|---|---|---|
| Topic overview eyebrow "Topic QR.1.5, Unit 0" | `#C07F22` | `INK_MUTED` | 4.62 to 5.03, passes everywhere |
| Lesson eyebrow "SECTION 3 OF 7" | `#C07F22` | `INK_MUTED` | same |
| "In progress" state label | `#C07F22` | `INK_MUTED` | same |
| Mobile meta "QR.1.5, in progress" | `#C07F22` | `INK_MUTED` | same |

**Nothing is gutted, and the reason is that the design never relied on the colour
alone.** In frame `1b` an in-progress row carries three separate signals: a 3px orange
left border on the row, a 3px orange ring as the status glyph, and the orange word. Two
of those three are fills and rules, which is exactly where you said orange survives.
Dropping the third costs the row nothing a student can use, and the two eyebrow roles
are labels above a heading, where hierarchy is already carried by size, weight, case and
family.

The one real loss is in the **lesson section eyebrow**, where "SECTION 3 OF 7" in
orange is the only thing distinguishing the current section's eyebrow from the
neighbouring dimmed sections' eyebrows. That distinction can be carried by the orange
left border the design already puts on the current outline entry, plus the section
being at full opacity while its neighbours sit at `.45` and `.5`. Both are already in
the design.

**Recommendation: no fourth orange. Orange stays a fill, a rule and the CTA.** If you
later want one text role back, the eyebrow on the topic overview is the cheapest place
to spend it, and I would come back with a hex then rather than now.

### 2.2 `INK_MUTED` instead of `#8A8474`, and the visual delta

| Surface | Design `#8A8474` | `INK_MUTED` composited | Ratio, design to INK_MUTED |
|---|---|---|---|
| page `#E8E0CF` | 2.84 | `#65625D` | 4.62 |
| rail `#EDE8DA` | 3.05 | `#676561` | 4.74 |
| band `#F3EFE3` | 3.24 | `#6A6865` | 4.84 |
| panel `#FFFDF8` | 3.67 | `#6E6E6D` | 5.03 |
| quietBox `#EDE7D6` | 3.02 | `#676560` | 4.72 |
| inset row `#F6F2E8` | 3.33 | `#6B6967` | 4.88 |
| choice `#F2EDDF` | 3.19 | `#696763` | 4.81 |

**The delta, stated honestly.** `INK_MUTED` lands roughly 40 units darker in each
channel and slightly less yellow: the design's grey is `#8A8474`, a warm sand, and the
composited result is `#65625D` to `#6E6E6D`, a warm-neutral mid grey. Every mono
metadata line, topic ID, eyebrow and "Not started" label therefore reads **heavier and
less sandy** than the mockup. On a page with many of them (a unit expanded to fifteen
rows) that is a visible increase in overall ink density.

That is the cost, and it is the right trade: the design's value fails on all seven
surfaces including the one it is most used on, and the audience reads on Chromebooks at
school brightness. `INK_MUTED` was measured against exactly these surfaces and its
docstring says so.

**One place `#8A8474` should be kept, in a different role.** As a *border* rather than
text it measures 3.19 on the answer-choice fill, which clears WCAG 1.4.11's 3:1 for a
component boundary. See discrepancy D4: it is the fix for the choice border the design
gets wrong.

### 2.3 The tutor card on Deep Midnight, and the border fix

`#12253F` does not enter the codebase. On `C.midnight` `#0E0E11`:

| Element | Value | Ratio | Verdict |
|---|---|---|---|
| Title | `#FFFDF8` | 18.96 | pass |
| Body | `C.sand` `#F2EDDF` | 16.48 | pass, and it is the existing `onDark` base |
| Body, design's | `#C3D0E0` | 12.32 | passes, but it is a blue-grey from the retired navy family |
| **Button border, design's `#3C5679`** | | **2.57** | **fails 3:1** |

Candidates for the button border, needing 3:1:

| Candidate | Ratio | Note |
|---|---|---|
| `onDark(0.30)` | 2.43 | fails |
| `onDark(0.36)` | 2.99 | fails, just |
| **`onDark(0.42)`** | **3.66** | **passes.** `#6E6C68` composited |
| `onDark(0.48)` | 4.44 | passes, heavier than needed |
| `C.gemini` `#6E9DC8` | 6.72 | passes, and is the brand's "quiet UI" blue |
| `C.gold` `#C8A96E` | 8.59 | passes, but gold means editorial aside |

**Recommendation: `onDark(0.42)`, 3.66:1.** It is neutral, it needs no new constant
(`onDark()` already exists in `curriculum-theme.ts`), and `0.42` is the same alpha
`login-theme.ts` landed on for its dark border after the same 3:1 test, where it
measures 3.53 to 3.67. Two files reaching the same number by the same method is a good
sign rather than a coincidence.

`C.gemini` is the fallback if the border needs to read as a control more loudly.

### 2.4 The nav rail, and the Home glyph you asked for

**You do not need one.** `app/components/StudentNav.tsx:61` already has a `navIcon()`
function with a real SVG for every one of the five items, including Home (a house with
a doorway) and a default that serves Modules.

So the rail should use the icons the app already ships, not the design's two-letter
mono tiles. That resolves three things at once:

- Home gets a tile, with a glyph that already exists.
- "Modules" stays Modules, because an icon carries no name to rename.
- The rail and the 200px labelled sidebar stay one source of truth, so an item added to
  one appears in the other.

The design's SY/AN/GR/PT tiles were solving a problem the app had already solved. The
34px squared tile, the 1px border, the filled active state and the mono are all worth
keeping; only the letters go.

---

## Part 3: the token table, light and dark, under the split

Two token groups, because the split is real: `--umc-*` for chrome, `--umr-*` for the
reading surface. Names provisional.

### 3.1 Chrome tokens (source 1)

| Token | Light | Ratio, light | Dark | Ratio, dark | Provenance |
|---|---|---|---|---|---|
| `ground` | `#FAF8F5` | ground | `#17171A` | ground | light **reuse** `--uml-ground`; dark **new**, see Part 1.3 |
| `grid` | `rgba(0,0,0,0.055)` | 1.13, exempt texture | `rgba(242,237,223,0.05)` | 1.12, exempt | **reuse** `--uml-grid` light; dark re-derived warm |
| `bar` | `#FFFFFF` | ground | `#1B1A18` | ground | light **reuse** `--uml-bar`; dark **new** |
| `border` | `#111111` | 17.81 on ground, 18.88 on bar | `rgba(232,238,248,0.42)` | 3.53 on bar | **reuse** `--uml-border` both |
| `ink` | `#111111` | 17.81 | `#F2EDDF` | 14.87 on bar | light **reuse**; dark uses the cream ink for temperature |
| `ink2` | `rgba(0,0,0,0.55)` | 5.32 | `rgba(242,237,223,0.70)` | 7.97 | **reuse** `--uml-ink-2` shape |
| `inkMono` | `rgba(0,0,0,0.58)` | 5.32 | `rgba(242,237,223,0.70)` | 7.97 | **reuse** `--uml-ink-mono` |
| `cta` | `#E8A33D` or `#F0A33E` | see D1 | same | same | **open**, discrepancy D1 |
| `ctaInk` | `#111111` | 8.76 on `#E8A33D`, 9.00 on `#F0A33E` | `#111111` | same | **reuse** `--uml-cta-ink` |
| `focus` | `#0F69BA` | 5.28 | `#5AAAEE` | 7.54 | **reuse** `--uml-focus` and `focusRing()` |
| `tabActive` | `#E8E0CF` | 14.38 with `#111111` | `#2B2A25` | 12.29 with `#F2EDDF` | design's tab fill, cream; dark from the reading ladder |

### 3.2 Reading-surface tokens (source 2)

| Token | Light | Dark | Ink on it, light / dark | Provenance |
|---|---|---|---|---|
| `page` | `#E8E0CF` | `#17171A` | 14.68 / 15.29 | light **reuse** `C.cream`; dark **new** |
| `rail` | `#EDE8DA` | `#1E1D1A` | 15.75 / 14.41 | light **reuse** `C.rail`; dark **new** |
| `band` | `#F3EFE3` | `#201F1C` | 16.76 / 14.09 | light **reuse** `C.band`; dark **new** |
| `panel` | `#FFFDF8` | `#262521` | 18.96 / 13.12 | light **reuse** `C.paper`; dark **new** |
| `quietBox` | `#EDE7D6` | `#2B2A25` | 15.60 / 12.29 | light **reuse** `C.quietBox`, finally consumed; dark **new** |
| `insetRow` | `#F6F2E8` | `#26262B` | 17.24 / n/a | **reuse** `--umd-gated-row-bg`, both sides |
| `choice` | `#F2EDDF` | `#2B2A25` | 16.48 / 12.29 | light **reuse** `C.sand`; dark shares `quietBox` |
| `ink` | `#0E0E11` | `#F2EDDF` | 14.68 to 18.96 / 12.29 to 15.29 | **reuse** `C.midnight` / `C.sand` |
| `ink2` | `ink(0.75)` | `onDark(0.70)` | 7.56 to 8.73 / 7.16 to 7.97 | **reuse** existing helpers |
| `muted` | `INK_MUTED` = `ink(0.6)` | `onDark(0.55)` | 4.62 to 5.03 / 4.82 to 5.38 | **reuse** `INK_MUTED`; dark alpha **new** |
| `hairline` | `#DCD3BE` | `onDark(0.14)` | 1.46 / 1.50, exempt | light from design; dark **new** |
| `controlBorder` | `#8A8474` | `onDark(0.42)` | 3.19 / 3.66 | **repurposed**, see D4 |

### 3.3 State and indicator tokens

| Token | Light | Ratio | Dark | Ratio | Provenance |
|---|---|---|---|---|---|
| `statusComplete` | `#3F7150` | 5.60 on panel | `#7FB894` | 6.71 on panel | **reuse** `--umd-status-complete`, exact role |
| `statusIdle` | `#6B6A65` | 5.42 | `onDark(0.52)` | 4.62 | **reuse** `--umd-status-idle` |
| `statusProgress` | see 2.1, now ink | n/a | n/a | n/a | **eliminated**, orange no longer a text role |
| `correct` | `#3F7150` | 5.13 on the tint | `#7FB894` | 6.52 on the tint | **reuse** |
| `correctTint` | `#F1F4EF` | ink 16.4 | `#1E2A22` | ink 12.74 | light from design; dark **new** |
| `missed` | `#B0452F` **or** `#B5763A` | 4.95 / 3.30 | `#E07B72` | 5.14 | **open**, discrepancy D7 |
| `missedTint` | `#F7EFEC` | ink 17.0 | `#2A1E1C` | ink 13.80 | light from design; dark **new** |
| `track` | `#DCD3BE` | 1.30, exempt | `onDark(0.14)` | 1.49, exempt | design / derived |
| `trackFill` | `#F0A33E` | 1.54 on track | `#F0A33E` | 5.27 on track | **brand orange**, replacing `#E89B3C` |
| `tutorSurface` | `#0E0E11` | n/a | `#0E0E11` | n/a | **reuse** `C.midnight`, does not invert |
| `tutorBorder` | `onDark(0.42)` | 3.66 | `onDark(0.42)` | 3.66 | see 2.3 |

### 3.4 Genuinely new versus reused, counted

- **Reused unchanged:** 19 tokens, from `--uml-*` (7), `--umd-*` (3) and
  `curriculum-theme.ts` (9).
- **New, dark side only:** 9, the warm dark ladder and its hairline.
- **New, both themes:** 4, the correct and missed tints and their dark counterparts.
- **Repurposed:** 1, `#8A8474` from a failing text token to a passing border token.
- **Eliminated:** 1, orange as text.

No new font family. No fourth orange. `#12253F`, `#E89B3C`, `#C07F22`, `#23211C` and
`#8A8474`-as-text do not enter the codebase.

### 3.5 What breaks in the design's type hierarchy in the shipped faces

The design runs three families: Figtree 600 display, Mulish 400 body, JetBrains Mono.
Shipped: Nunito 400 to 700, Kodchasan, and Space Mono named but **not loaded**
(issue #175).

| Design | Shipped substitute | What breaks |
|---|---|---|
| Figtree 600 34/41 topic title | Nunito 600 | Nunito is rounder and wider at the same size. The design's `letter-spacing:-.015em` was set for a geometric face; on Nunito it will read cramped rather than tight, and should go to 0 |
| Figtree 600 22/29 section heading | Nunito 600 | same, less severe at 22px |
| Mulish 400 16/28 body | Nunito 400 | Nunito has a larger x-height than Mulish at the same px, so 16/1.75 will look tighter than the mockup. Expect to need roughly 1.8 line-height to match the design's colour |
| JetBrains Mono 10/.14em eyebrow | `ui-monospace` | Space Mono is not loaded. Measured in PR #174: a 110px mono string differs by 4.6px between Space Mono and `ui-monospace`, so eyebrow widths are not final until #175 is decided |

**The structural loss.** The design separates display (geometric) from body (humanist),
two distinct voices. In Nunito-only, display and body are the **same family**, so the
entire hierarchy has to come from size, weight and case. That is the real cost of "no
new families", and it is most visible on the topic overview, where a 34px title sits
directly above 15px body in the mockup and relies on the family change to separate
them.

Kodchasan is available and is the dashboards' display face, but it is a Thai-Latin
display face with a very different character from Figtree, and using it here would
introduce the curriculum tree's first heading face. **Recommendation: Nunito 600/700 for
display, and buy the separation back with size and weight rather than reaching for
Kodchasan.** Flag if you want Kodchasan tried instead.

Figtree, Mulish and JetBrains Mono to be added to issue #175, as instructed. Not yet
done, since this phase writes nothing but the report.

---

## Part 4: progress counting, settled in full

You asked me to stop and settle this. Here it is.

### 4.1 The two definitions

**Definition A, the stored snapshot.** `curriculum_completion.completed_at`, written by
`syncCompletionSnapshot()` in `app/lib/curriculum-progress.ts:350` on every answer and
on lesson completion. A topic is complete when all three hold:

- `lesson_completed_at` is set (the notes were read to the end), and
- practice correct >= `ceil(gradable * 7/10)`, and
- quiz correct >= `ceil(gradable * 3/4)`.

Stamped once and never re-stamped, so it records first completion.

**Definition B, recomputed at render.** `statusOf()` in
`app/dashboard/modules/page.tsx:42`. Complete when `correct >= total` across **all**
gradable items, practice and quiz together. The lesson is not consulted.

### 4.2 Which surfaces read which

I traced every reader.

| Surface | Reads | Note |
|---|---|---|
| `/dashboard/modules` row status | **B** | The only completion state a student sees |
| `/dashboard` home progress | neither, it counts questions | `doneItems / totalItems` |
| Topic overview part states | neither | `topic-parts.ts` uses per-section thresholds, a third calculation, but only per part |
| Quiz unlock gate | `lesson_completed_at`, `practice_correct`, `quiz_correct` | Reads the snapshot's **columns**, not `completed_at` |
| Anything at all | **`completed_at`** | **nothing** |

**`curriculum_completion.completed_at` is written on every answer and read by nothing.**
The other columns of the same row are read by `loadGates()` at
`topic-data.ts:330`, so the table is live, but the whole-topic completion stamp itself
has no consumer.

### 4.3 So is the wrong one load bearing?

**No, and that is the useful part of this answer.** Definition B is load bearing on
exactly one surface, the modules row label. Definition A is load bearing nowhere. There
is no migration to do and nothing to unpick: switching the syllabus to A is a change to
one function and one query.

### 4.4 Which is correct pedagogically

**A, and not narrowly.**

B says a topic is complete only when the student has answered **every** practice
problem and **every** quiz question correctly, and says nothing about whether they read
the notes. Three things follow, all bad:

1. It is unreachable for most students on most topics. Ten practice problems plus four
   quiz questions at 100 percent, with no partial credit for a topic worked hard and
   nearly mastered.
2. It rewards the wrong behaviour. A student who skips the notes entirely and grinds
   the questions is "complete"; a student who reads carefully and misses one is not.
   The product's whole thesis is guided notes first.
3. It contradicts the gates the product already enforces. The quiz unlocks at 70 percent
   of practice. B tells a student who cleared that gate, took the quiz and scored 3 of 4
   that they have completed nothing.

A is the definition the product already behaves as if it holds: it is what the gates
use, it includes the lesson, and its thresholds (70 and 75 percent) are the ones already
chosen and shipped for exactly this purpose.

The one honest objection to A is that 7 of 10 is generous for a word like "complete".
If that is the worry, the lever is `PRACTICE_RATIO` and `QUIZ_RATIO`, which are two
constants in one file, rather than a different definition.

### 4.5 Recommendation

**Adopt A. Retire B.** Concretely:

- `statusOf()` reads the stored snapshot rather than recomputing from attempts.
- One extra query on `/dashboard/modules`: `curriculum_completion` filtered by
  `user_id`, at most 97 narrow rows, one round trip. The page already makes several.
- Per-unit and per-course counters then count topics whose `completed_at` is set, which
  is what the design's "18 / 97" and "5/14" mean.
- Keep the existing reconcile-with-attempts discipline: take the higher of stored and
  observed, as `loadGates()` already does, so a stale snapshot cannot un-complete a
  topic.

**One consequence to accept deliberately.** Switching from B to A will flip some
existing students' rows from "In progress" to "Complete" the first time they load the
page, because A is easier on questions. That is a visible change to people who have
already used the product, and it is a correction rather than a regression, but you
should know it happens rather than discover it.

**Not built.** No counter renders until you pick.

---

## Part 5: "Reveal worked solution", three options, per plan

Only two plans can reach a practice page: free tier on AR.1.4, and Full Course. Practice
Pass never lands on a `/course` URL, so it has no rendering here at all. Both are shown
below on an **unanswered** problem, which is the case the design gets wrong.

| Option | Free tier, unanswered | Full Course, unanswered | Practice Pass |
|---|---|---|---|
| **A. Omit until earned** | No link. Check answer is the only action | No link. Check answer is the only action | n/a |
| **B. Disabled with the condition stated** | "Answer to unlock the worked solution", `INK_DISABLED`, not focusable | Same string, same treatment | n/a |
| **C. Live only where a tutor route exists** | No link | "Talk it through", live, opens the tutor | n/a |

Notes that bear on the choice:

- **A** is the only option that adds nothing to the page. It also silently removes an
  affordance from the current stacked layout, where the reveal control is present.
- **B** puts a visible lock on a surface whose recorded principle
  (`topic-parts.ts:9-11`) is that nothing inside a topic is ever shut. It is a soft lock
  on a control rather than a route, so it does not contradict that decision outright,
  but it is the closest any of the three comes.
- **C** is the only option where the two plans differ mid-problem, which makes the
  Full Course upgrade visible at the moment a student is stuck. It is also the only one
  whose label is honest about the mechanism: for a Full Course student there is no
  "reveal", there is a conversation that may end in disclosure.

**All three satisfy your constraint**, since none offers something the plan does not
include. I have not picked.

---

## Part 6: discrepancy list

Every place the design conflicts with the marketing system, the retired palette, or the
product's capabilities. Recommendation on each, none taken.

| # | Discrepancy | Recommendation |
|---|---|---|
| **D1** | **Two live oranges for one role.** Login ships `#E8A33D`; your stated brand orange is `#F0A33E`. Both pass with `#111111` ink (8.76 and 9.00). No curriculum surface uses either yet | Unify on `#F0A33E`, the stated brand value, and accept that the login CTA shifts by a hair. Alternative: keep `#E8A33D` on chrome for exact login parity and have two oranges in the codebase forever |
| **D2** | `#E89B3C` and `#C07F22`, retired, are the design's only oranges | Already excluded. `#F0A33E` for fills, ink for text |
| **D3** | `#12253F` is a third navy | Excluded per your ruling. `C.midnight` `#0E0E11`, border `onDark(0.42)` at 3.66 |
| **D4** | **Answer-choice border `#E2DAC6` measures 1.19 on the choice fill.** It is the only thing marking a choice as a control, so WCAG 1.4.11 applies at 3:1 | Use `#8A8474` at 3.19. The design's failing text token becomes a passing border token. Same fix shape as the login theme raising its inactive pill from .18 to .45 |
| **D5** | Design ink `#23211C` versus `C.midnight` `#0E0E11` | Keep `C.midnight`. It is darker on every surface and already shipped |
| **D6** | Design muted `#8A8474` fails on all seven surfaces as text | `INK_MUTED`. Delta reported in 2.2 |
| **D7** | **Missed answers: design red `#B0452F` (4.95) versus recorded amber-brown `#B5763A` (3.30).** The recorded decision is "not being alarmed"; the recorded value also fails AA | **Open, needs your ruling.** Three ways: adopt the design's red; darken the amber-brown until it passes and keep the tone; or keep amber-brown as the row tint and use a passing colour for the word "Not right yet" |
| **D8** | Prerequisite locking, "finish QR.1.6 to open" | Not built. Four real states. `#F6F2E8` is reused for entitlement-gated, and a code comment will say so, so nobody reads it later as prerequisite locking |
| **D9** | **Placeholders shown as named rows** ("Absolute value, notes coming soon"). The app deliberately shows an unnamed count line instead | **Open.** Naming unwritten topics tells a student what is coming and also advertises what is missing. Product call |
| **D10** | Icon rail with letter tiles, drops Home, renames Modules | Use the app's existing `navIcon()` glyphs. See 2.4 |
| **D11** | Rail appears on one frame of six | Adopt the rail on `/dashboard/*` only, matching where it already lives. The curriculum tree keeps the drawer |
| **D12** | "CHECK YOURSELF" callouts do not exist in the authored curriculum, in any of 97 topics | Build the callout token and component, apply it to nothing. `C.quietBox` finally gets a consumer if a callout is ever authored. Do not invent content to fill it |
| **D13** | Per-part time estimates ("about 20 min") have no data | Show the whole-topic estimate on the overview, no per-part split. Do not divide by three and present the result as measured |
| **D14** | Per-unit hours ("about 9 hours") | Derivable as a sum of `estimated_time_minutes`. Safe to build |
| **D15** | "Last worked on Aug 14" | Derivable from the attempt log. Safe to build, one aggregate |
| **D16** | A one-line explanation on a correct answer | Not a field. Either it is the first line of the worked solution, which changes what "reveal" means, or it is new authored content across ~30 topics. **Recommend omitting** |
| **D17** | "Reread section 4" deep link from a quiz result | Needs section anchors (Part 7 builds them) **and** an item-to-section mapping, which does not exist in any form. **Recommend omitting** |
| **D18** | Quiz "Next question" is the one dark primary button in the design | Keep it. A deliberate register shift for assessment, and it costs nothing |
| **D19** | Named feature blocks detected by pattern, unverified across 97 topics | Measure before building. If the pattern does not hold, the blocks render as ordinary prose, which is what happens today |
| **D20** | Dark chrome hue clash | Part 1.3. Warm chrome in dark, or accept the seam |

---

## Part 7: the SQL, written for your review, not run

Per-section checkmarks are the only item in this pass needing DDL. One nullable column
on a row that already exists, already has a unique index, and is already written on
every answer.

```sql
-- curriculum_completion: furthest lesson section reached
--
-- Per-section progress in the lesson outline. The existing lesson gate is
-- binary (lesson_completed_at, set when the end-of-content sentinel is seen),
-- which cannot drive per-section checkmarks or a "12 minutes left" estimate.
--
-- Nullable with no default and no backfill, on purpose. NULL means "we have
-- never observed a position for this student on this topic", which is exactly
-- the state every existing row is in, and it is distinct from 0, which would
-- mean "observed at the first section". Reads must treat NULL as unknown and
-- fall back to the binary gate.
--
-- Sections are counted the way app/lib/lesson-sections.ts counts them: h5
-- headings in the authored markdown, 1-indexed. Measured across all 97 topics:
-- 4 to 13 sections each, median 8, so a smallint would do and int costs nothing
-- and avoids a migration if a topic ever grows.
--
-- Reads take the HIGHER of stored and observed, the same discipline
-- loadGates() already applies to the other columns, so a stale or missing value
-- can never move a student backwards.

alter table public.curriculum_completion
  add column if not exists furthest_section int;
```

No index: the column is read only as part of the existing single-row lookup on
`(user_id, course_id, topic_id)`, which the unique index already covers. No grant
change: reads and writes both go through the service role. No RLS change: the table
already has RLS enabled with no policy, which is the zero-grant shape the rest of the
curriculum tables use.

**Not run.** Per your instruction, current-section tracking is built client-only and the
checkmarks drop in later against this column without rework: the client already has to
compute the current section from an `IntersectionObserver`, and persisting it is one
`POST` to the existing `/api/curriculum/progress` route.

---

## Part 8: what Phase 3 needs before it starts

Open, in the order they block work:

1. **Definition of complete** (Part 4). Blocks every counter and the row states.
2. **Reveal worked solution** (Part 5). Blocks the practice surface.
3. **Missed-answer colour**, D7. Blocks the practice missed state.
4. **Dark chrome hue**, Part 1.3. Blocks the dark pass, which is the pass you care most
   about.
5. **One orange or two**, D1. Cosmetic, but it should not be decided by accident.
6. **Placeholders as named rows**, D9.

Settled and ready to build: the split, tutor-absent-first, `C.midnight` for the tutor
card, the four real row states, the existing nav glyphs, no new fonts, no fourth orange,
`INK_MUTED` for mono, and the full token table in Part 3.
