# Phase 1 report: Worksheet Generator page redesign

Read-only investigation. No implementation code written. Branch `feat/worksheet-generator-redesign`, clean.

Design read: `Worksheet Generator.dc.html` (738 lines, all of it), `TeacherSidebar.dc.html` (the `dc-import` on six of seven boards), `wordmark.png`, and the `data-dc-script` logic block that supplies the sample data.

---

## 0. Headline findings, before the tables

1. **The design's four cream surfaces already exist in this codebase, token for token.** `app/components/curriculum-surface.ts` LIGHT carries page `#E8E0CF`, rail `#EDE8DA`, band `#F3EFE3`, panel `#FFFDF8`, hairline `#DCD3BE`, insetRow `#F6F2E8`, quietBox `#EDE7D6`. Those are the same seven values the design file uses. This is not a new palette, it is the student curriculum palette arriving on a teacher surface.
2. **Two retired hexes are in the design and both were already ruled on, in writing, in that same file.** `#E89B3C` and `#12253F` appear throughout the board. `curriculum-surface.ts:294` and `:332` record the prior ruling: Sunset `#F0A33E` replaces the first, Deep Midnight `#0E0E11` replaces the second.
3. **The sidebar question has a third answer.** It is neither `#0F1E35` nor `#0E0E11`. See section 4.
4. **Figtree and Mulish are not loaded anywhere in the app.** They fall back to `sans-serif` today. See section 5.
5. **The preview page does not currently render the worksheet component at all.** It has its own bespoke question list. Embedding `WorksheetSheet` is possible and safe, but it is a change to the preview, not a restyle of one. See section 3.
6. **The builder's per-topic question stepper is the single biggest out-of-scope item.** The API takes one global `count`; the design assigns a count per topic.

---

## 1. Gap tables

Verdicts used:

- **RESTYLE**: page chrome that exists today and needs only the new visual.
- **NEW CHROME**: net-new UI, but pure client-side over data the page already holds. No backend, no artifact impact. Cheap, still a scope call because it is not a restyle.
- **OUT-OF-SCOPE (artifact)**: would change the printed worksheet or answer key.
- **OUT-OF-SCOPE (backend)**: net-new logic, data, schema, or tier.

### Board 01 and 02, index populated and empty (`/teacher/worksheets`)

| Design element | Today | Verdict |
|---|---|---|
| Cream page, band header, radius-zero hairlines | `DASH.pageBg` #F5F5F3, 900px centred column, 9px radii | RESTYLE |
| 206px teacher sidebar | Does not exist on this route | See section 6, scope call |
| "TEACHER" eyebrow, H2, subtitle | H1 + subtitle, no eyebrow | RESTYLE |
| Quota meter "8 / 15 THIS MONTH" + 136x3 bar | `QuotaMeter` renders the same two numbers as text | RESTYLE (bar is new visual on existing data) |
| "+ New worksheet" orange CTA | Navy `DASH.heading` button | RESTYLE (colour substitution, section 4) |
| Search worksheets input | Does not exist | NEW CHROME, client filter over the loaded list |
| Strand chips QR/AR/GR/PR as filters | Does not exist | NEW CHROME, strand derives from the topic id prefix already on `WorksheetSummary.topics` |
| Row: title, question count, topic count, date | All present | RESTYLE |
| Row: strand tag chips | Not shown; topic ids are | NEW CHROME, derived |
| Row: "{mins} MIN" | Not on the index (builder computes it client-side) | NEW CHROME, derived from item_count at the builder's 1.5 min rule |
| Row: short code "W3K2" | No such column. The id is a uuid | OUT-OF-SCOPE (backend) |
| Row: "A + B" badge | No version B | OUT-OF-SCOPE (backend) |
| Print / Answer key buttons | Present as links | RESTYLE |
| Duplicate button | No duplicate endpoint | OUT-OF-SCOPE (backend). Also a quota question: a duplicate is a create |
| Delete + confirm | Present today, **absent from the design** | KEEP. Design omission, not a removal instruction |
| "Older worksheets from spring are archived / View archive" | No archive concept | OUT-OF-SCOPE (backend) |
| Empty state panel, heading, copy, CTA | Present, plainer | RESTYLE |
| Empty state "GUMU art" 92px placeholder | No asset | Needs an asset decision |
| Empty state "Or start from a sub plan template" | No templates | OUT-OF-SCOPE (backend) |
| Empty state copy promising "a version B with different numbers" | Version B does not exist | COPY MUST NOT SHIP as written |

### Board 03, builder (`/teacher/worksheets/new`)

| Design element | Today | Verdict |
|---|---|---|
| Two-pane layout: 356px selection rail left, topic browser right | Inverted: topic tree left, 300px sticky control card right | RESTYLE (layout only) |
| Worksheet name input | Present | RESTYLE |
| Selected-topics list with drag handle | Selection is a `Set`, no ordered list UI | RESTYLE for the list, **OUT-OF-SCOPE (backend) for drag-to-reorder** (nothing stores or consumes a topic order; item order comes out of `selectItems`) |
| **Per-topic +/- question stepper** | **API takes one global `count`; `selectItems` distributes across topics** | **OUT-OF-SCOPE (backend). The largest single gap on the board** |
| "x" remove per row | `toggle()` | RESTYLE |
| Totals band: QUESTIONS, ESTIMATED TIME | `capped` and `minutes` both computed today | RESTYLE |
| Difficulty segmented Basic / Mixed / Advanced | Multi-select pills Basic / Proficient / Advanced | RESTYLE the control, **keep existing semantics and the real level names**. The design's 3-way single-select with "Mixed" is different behaviour and a level name that does not exist in the schema |
| Format: Multiple choice / Free response | Every item is multiple choice | OUT-OF-SCOPE (backend + artifact) |
| "Also generate version B" | Does not exist | OUT-OF-SCOPE (backend) |
| "Generate worksheet" CTA | "Build worksheet" | RESTYLE |
| Search by topic name or ID | Does not exist | NEW CHROME, client filter over loaded topics |
| Strand filter chips | Does not exist | NEW CHROME, `related_strand` is on `PickerTopic` |
| Unit accordions, chevrons, "Expand all" | Units always expanded | NEW CHROME, client-only |
| Topic card grid, 2-col, strand tag + id + "{n} AVAILABLE" + check marker | Single-column checkbox rows carrying the same four facts | RESTYLE |
| "COMING SOON" locked card, dashed, 0.55 opacity | `available === 0` renders disabled at 0.45 opacity | RESTYLE |
| "SHOW LOCKED" toggle | Zero-pool topics are always shown, disabled | NEW CHROME, small |
| Unit names (Unit 3 "Geometric and Spatial Reasoning", Unit 4 "Probabilistic and Statistical Reasoning", Unit 5 "Test Strategy") | App: Unit 3 "Geometry & Measurement", Unit 4 "Functions & Modelling", Unit 5 "Probability & Statistics" | USE THE APP'S. Design taxonomy is sample data |
| **Present today, absent from the design** | | **KEEP ALL FOUR** |
| "deep" chip on templated topics | `t.templated` | Keep |
| "Include mini-quiz questions" checkbox | Drives `include_quiz` and the pool maths | Keep, it changes what is drawn |
| "Mini-quiz questions are not tagged with a difficulty" explainer | Explains why counts drop under a filter | Keep, it explains a real number change |
| "Only N questions available" short-pool warning | Real | Keep |

### Boards 04 and 05, preview and print config (`/teacher/worksheets/[id]`)

| Design element | Today | Verdict |
|---|---|---|
| 302px config rail | No rail; buttons in a header row | RESTYLE for the frame, but see the rail contents below |
| "Back to worksheets" | Present | RESTYLE |
| Title field (readonly on the board) | Rendered as an H1 | RESTYLE |
| Version A / B toggle and "+" | No versions | OUT-OF-SCOPE (backend) |
| **Header fields LEFT / CENTER / RIGHT (Name, Date, Class period)** | Sheet prints NAME and DATE, fixed, no class field | **OUT-OF-SCOPE (artifact)** |
| **Repeat header on each page** | Not configurable | **OUT-OF-SCOPE (artifact)** |
| **Page size dropdown** | `@page { size: letter portrait }`, fixed | **OUT-OF-SCOPE (artifact)** |
| **Student work space Compact / Medium / Generous** | No work space exists at all on the sheet | **OUT-OF-SCOPE (artifact)** |
| **Directions field** | Nothing prints between the fields row and question 1 | **OUT-OF-SCOPE (artifact)** |
| **Answer key QR code** | Does not exist | **OUT-OF-SCOPE (artifact + backend)**, named in the brief |
| Questions / Answer key tabs | Two separate chrome-free routes | **See the hard flag below** |
| "PAGE 1 / 4" indicator | No page model on screen; page count is only knowable from the print engine | OUT-OF-SCOPE (backend) |
| "Download PDF" button | No PDF path. `[id]/print/page.tsx:16` records the decision to have no PDF library | OUT-OF-SCOPE (backend) |
| Print / Print key CTA | Present as links | RESTYLE |
| Preview pane frame (band toolbar, cream gutter, white page on a hairline) | Bespoke question card | RESTYLE the frame, embed `WorksheetSheet` inside it (section 3) |
| The rendered sheet itself | `WorksheetSheet` on `/print` | **UNTOUCHED** |
| Answer key rail toggles: worked solution line, misconception notes, compact key | Key prints a fixed 2 parts | **OUT-OF-SCOPE (artifact)** |
| "Where these come from" navy note panel | Does not exist | NEW CHROME, informational. Recolour off `#12253F` |
| Key sheet with green letter chips and per-item misconception panels | Key is a 5-column grid plus a rationales list | **OUT-OF-SCOPE (artifact)**. This is a different answer key from the one that prints |

**Hard flag, tabs.** `[id]/key/page.tsx:13-22` documents the deliberate two-route split: the key route walks `resolveForKey`, which reads the base `curriculum_topics` table through the admin client for `correct_answer`, `worked_solutions` and `distractor_prose`. The worksheet route never holds an answer at all. Client-side tabs on one page would mean the preview payload carries answers. **Recommendation: render the tabs as links to the two existing routes, styled as the design's segmented control.** Visually identical, and the data-path separation survives.

### Board 06, mobile 375

| Design element | Today | Verdict |
|---|---|---|
| Navy top bar, hamburger, wordmark, avatar | No chrome on these routes | Tied to the sidebar scope call, section 6 |
| Index cards stacked, 48px tap targets | Rows wrap, targets are ~31px | RESTYLE |
| Version A / B / Key segmented | Key is real, B is not | PARTIAL: Key only |
| "Email PDF" | Does not exist | OUT-OF-SCOPE (backend) |
| Builder single column, sticky bottom bar that expands to a sheet | Two-column grid collapses badly below ~760px | RESTYLE |

The design's own mobile note says the sub-900px hamburger drawer "is a dashboard wide pattern, not a worksheet fix, so it should land as its own pass across Dashboard, Misconceptions and Students at the same time." I agree, and it is also what section 6 concludes independently.

### Board 07, cap reached

| Design element | Today | Verdict |
|---|---|---|
| Header, red meter, red bar fill | `QuotaCapNotice` carries the same message | RESTYLE. `#B0452F` is already the app's `missed` token, measured |
| Panel copy "Your count resets on September 1" | **`QuotaNotice.tsx:20-24` deliberately refuses to name a reset date**, because computing a month boundary in TypeScript would be a second implementation of the rule `sql/worksheet_quota.sql` owns | **DO NOT INTRODUCE.** Keep "the start of next month" |
| "Teacher Pro Plus", "version C and D", "class specific difficulty" | Upgrade target today is Teacher Pro at `/upgrade?plan=teacher-pro-monthly` | OUT-OF-SCOPE (new tier). Keep existing copy and target |
| 15-dot "This month" grid | Derivable from used/cap | RESTYLE, recolour off `#C87F22` |
| "15 built, 41 printed" | No print counter exists | OUT-OF-SCOPE (backend) |
| "Remind me September 1" | No reminder system | OUT-OF-SCOPE (backend) |
| Dimmed but still-printable saved list | Today the list renders normally under the notice | RESTYLE |

**Reachability caveat.** Per `worksheet-metering-sql-pending`, `sql/worksheet_quota.sql` has not been run on prod, so the meter fails open. Board 07 may not be reachable live until that DDL runs. It is still worth building, it just cannot be spot-checked against prod data.

---

## 2. The boundary, named on both sides

The line is: **anything reachable from `[id]/print/page.tsx` or `[id]/key/page.tsx` is the artifact.** Those two routes are the only things that produce paper.

### ARTIFACT side, will not be touched

| File | Why it is on this side |
|---|---|
| `app/teacher/worksheets/WorksheetSheet.tsx` | The paper itself. `WorksheetSheet` and `AnswerKeySheet`, plus `SheetHead`, `SheetFoot`, the `DISCLAIMER` constant (Audit Entry 7, verbatim) and `STRAND_TINT` |
| `app/teacher/worksheets/print-styles.ts` | `PRINT_CSS`: `@page`, the two-column flow, the masthead, the footer, the disclaimer sizing, every `break-inside` rule |
| `app/teacher/worksheets/[id]/print/page.tsx` | The worksheet print route |
| `app/teacher/worksheets/[id]/key/page.tsx` | The answer key route, and the only route that walks the answer-bearing data path |
| `app/teacher/worksheets/PrintButton.tsx` | Only used by those two routes |
| `app/components/fonts.ts` | **`print-styles.ts:1` imports `FONT_HEADING` and `FONT_BODY` from it.** Editing this file repaints the printed sheet. This is the trap in the font question, section 5 |
| `app/lib/worksheet-source.ts`, `worksheet-select.ts`, `worksheet-quota.ts` | Resolvers, the draw, the meter |
| `app/api/teacher/worksheets/route.ts`, `[id]/route.ts` | Create, list, delete |
| `app/teacher/worksheets/worksheet-data.ts` | `buildRationales` and `loadTopicMeta` feed the sheet. Read-only: the preview may **call** `loadTopicMeta`, it will not change it |
| `app/globals.css` `@media print` block | Keeps paper ink black |

Note on `print-styles.ts`: it also holds `.ws-toolbar` and `.ws-btn`, which are screen chrome by nature. I am still leaving the file byte-identical, so the toolbar on `/print` and `/key` keeps its current look. Restyling that toolbar would mean editing the file that owns the paper, and the cost of a clean boundary is worth more than a matching toolbar on two chrome-free routes. Flagging it as a deliberate inconsistency rather than an oversight.

### CHROME side, in scope

| File | Role |
|---|---|
| `app/teacher/worksheets/page.tsx` | Index, boards 01, 02, 07 |
| `app/teacher/worksheets/WorksheetList.tsx` | Rows and empty state |
| `app/teacher/worksheets/QuotaNotice.tsx` | Meter and cap panel |
| `app/teacher/worksheets/new/page.tsx` | Builder server shell |
| `app/teacher/worksheets/new/WorksheetBuilder.tsx` | Builder, board 03 |
| `app/teacher/worksheets/[id]/page.tsx` | Preview and config frame, boards 04, 05 |
| NEW: `app/teacher/worksheets/worksheet-theme.ts` | The board's tokens, worksheet-scoped, in the shape of `login-theme.ts` |
| NEW, only if section 6 is approved: an extracted sidebar plus `app/teacher/worksheets/layout.tsx` | |

---

## 3. Can the preview pane embed the existing worksheet render unchanged?

**Yes, with two caveats that are worth your ruling.**

`WorksheetSheet` is a server component with no `'use client'` directive, no data access, and no imports beyond types. Its comment header (`WorksheetSheet.tsx:12-14`) states the intent directly: it is renderable outside Next. Every style it needs is class-scoped under `.ws-sheet` in `PRINT_CSS`. So `[id]/page.tsx` can import both and render the sheet inside the design's preview frame with no edit to either file.

**Caveat 1: the preview does not render the sheet today.** `[id]/page.tsx:83-120` builds its own question cards. So this is not a restyle of an existing embed, it is replacing a bespoke preview with the real render. That is the right call under your rule, and it makes the preview genuinely faithful for the first time, but it is a change to what the page shows and I want it named rather than slipped in.

**Caveat 2: `PRINT_CSS` is not preview-safe as a whole.** Injecting it into the preview route brings `@page { size: letter portrait; margin: 0.6in 0.65in }` and `@media print { .no-print { display: none } ... }` onto a route that previously had neither. Consequence: pressing Ctrl+P on the preview page would print the sheet **plus** all the surrounding chrome, since the chrome has no `.no-print` class. Two ways to handle it:

- **Recommended:** mark all preview chrome `.no-print`. Printing from the preview then yields the same sheet the `/print` route yields, which is the honest behaviour, and it needs zero edits to `print-styles.ts`.
- Alternative: do not inject `PRINT_CSS` on the preview and duplicate the `.ws-sheet` rules. Rejected. That is a second stylesheet for the paper, which is the exact drift `print-styles.ts:5-11` exists to prevent.

**One added read.** `WorksheetSheet` takes `topicMeta`, which the preview does not currently load. It would call the existing `loadTopicMeta()`, which reads `curriculum_topics_public` and selects `topic_id, topic_name, related_strand`. Nothing answer-bearing, and it is the same call `/print` already makes.

**Width.** `.ws-sheet` is `max-width: 7.2in` (about 691px). The design's preview column at 1280 is about 720px of usable width, so the sheet fits at 1:1 with no scaling. Below that it wants a horizontal-scroll container or a CSS transform on a wrapper. Both are chrome-side and cannot reach print.

---

## 4. Palette audit

### Retired-list check against the design file's actual values

| Retired hex | In the design? | Where |
|---|---|---|
| `#C68A2F` | No | Clean |
| `#C07F22` | No, but see below | Clean literally |
| `#E89B3C` | **Yes, throughout** | Every primary CTA fill, every `inset 3px 0 0` selection rule, every checkbox fill, the selected-topic marker, the sidebar active nav **text**, the `a:hover` colour, the board number badges |
| `#12253F` | **Yes** | `TeacherSidebar.dc.html` background, the mobile top bar on all three 375 boards, the "Where these come from" panel on board 05 |

`#C87F22` also appears (link colour, quota bar fill, the 15 cap dots). It is one digit off `#C07F22` and fills the same orange-as-text role that `curriculum-theme.ts:31` says was "dropped outright". Treating it as the same retirement.

### Orange as text: four instances on real screens

1. `a { color: #C87F22 }` and `a:hover { color: #E89B3C }`, the global rule. It reaches "View archive", "Remind me September 1", and "Back to worksheets".
2. "Expand all" on the builder, inline `#C87F22`.
3. The add-version "+" on board 04, inline `#C87F22`.
4. The sidebar's active nav item, `color: #E89B3C` on the navy rail.

Also `#C8A96E` as text on the sidebar tier band and the FOUNDER chip. That one is Cipher Gold in its labelling role, which is how the live sidebar already uses it, so it is consistent rather than a violation.

`#B0452F` on the cap-reached meter is a rust, not an orange, and it is already the app's measured `missed` token. Fine as text.

### Proposed substitution table

Every replacement is a value already in `app/components/curriculum-surface.ts`, so this is adoption, not invention.

| Design value | Role | Proposed | Source |
|---|---|---|---|
| `#E8E0CF` | page | `#E8E0CF` | `C.cream` / `LIGHT.page`, exact match |
| `#EDE8DA` | rail | `#EDE8DA` | `LIGHT.rail`, exact match |
| `#F3EFE3` | band | `#F3EFE3` | `LIGHT.band`, exact match |
| `#FFFDF8` | panel | `#FFFDF8` | `LIGHT.panel`, exact match |
| `#DCD3BE` | hairline | `#DCD3BE` | `LIGHT.hairline`, exact match |
| `#F6F2E8` | inset row | `#F6F2E8` | `LIGHT.insetRow`, exact match |
| `#EDE7D6` | quiet box | `#EDE7D6` | `LIGHT.quietBox`, exact match |
| `#B5D4F4 #9FE1CB #FAC775 #CECBF6` | strand tints | unchanged | Exact match with `WorksheetSheet.tsx` `STRAND_TINT` |
| **`#E89B3C`** | CTA fill, rules, markers | **`#F0A33E`** | `LIGHT.cta`. Ruling at `curriculum-surface.ts:294` |
| **`#12253F`** | sidebar, mobile bar, note panel | **`#0E0E11`** | `LIGHT.tutorSurface`. Ruling at `curriculum-surface.ts:332` |
| **`#C87F22`** | link text, bar fill, dots | **`#2F6091`** as link text, **`#F0A33E`** as fill | `LIGHT.link`, `LIGHT.trackFill`. Orange-as-text role retired at `curriculum-theme.ts:31` |
| `#23211C` | ink | `#0E0E11` | `LIGHT.ink`. Near-miss warm black. Recommend live wins, same as the 2026-08-17 precedent |
| `#57534A` | muted ink | `rgba(14,14,17,0.6)` | `LIGHT.muted`. Same reasoning |
| **`#8A8474`** | mono micro-labels | **`rgba(14,14,17,0.6)`** | `LIGHT.muted`. **Measured: `#8A8474` fails 4.5:1 as text on all six cream surfaces.** See the measurement block below |
| `#C9C0AB`, `#DED6C6`, `#EDE8DC` | one-off greys | fold into `hairline` / `page` | Not worth three new tokens |
| `#B0452F` | cap-reached meter | `#B0452F` | `LIGHT.missed`, exact match |
| `#C8A96E` | sidebar tier label | `#C8A96E` | `LIGHT.rule`, matches live sidebar |
| `#0F69BA` | not in design | add as focus ring | `LIGHT.focus`. The board specifies no focus state at all |

### Measured, not assumed: the micro-label colour

The board paints every mono micro-label ("QUESTIONS", "4 TOPICS SELECTED", "DRAG TO REORDER", "PAGE 1 / 4", "8 / 15 THIS MONTH") in `#8A8474`. Measured against the six cream surfaces it actually renders on:

| Ink | page #E8E0CF | rail #EDE8DA | band #F3EFE3 | panel #FFFDF8 | insetRow #F6F2E8 | quietBox #EDE7D6 |
|---|---|---|---|---|---|---|
| `#8A8474` (design) | 2.84 FAIL | 3.05 FAIL | 3.24 FAIL | 3.67 FAIL | 3.33 FAIL | 3.02 FAIL |
| `#6B6A65` (`statusIdle`) | 4.13 FAIL | 4.43 FAIL | 4.71 pass | 5.33 pass | 4.85 pass | 4.39 FAIL |
| `rgba(14,14,17,0.6)` (`muted`) | 4.62 pass | 4.74 pass | 4.84 pass | 5.03 pass | 4.88 pass | 4.72 pass |

`#8A8474` fails on every surface. It is `LIGHT.controlBorder`, a border token, and the board is using it in a text role it was never measured for. `statusIdle` only clears three of six. **`LIGHT.muted` is the only candidate that passes the whole ladder, so that is the substitution.**

For completeness, the two near-miss inks I am recommending against also both pass, so this is a precedent call and not a contrast one: design ink `#23211C` runs 12.25 to 15.82 against live `#0E0E11` at 14.68 to 18.96, and design muted `#57534A` runs 5.83 to 7.54 against live `rgba(14,14,17,0.6)` at 4.62 to 5.03.

### Your sidebar question, answered

**The design uses neither.** `TeacherSidebar.dc.html` line 10 is `background:#12253F`, which is on your retired list, and `curriculum-surface.ts:332` already calls it out by name: "a third navy, neither Deep Navy #0F1E35 nor Deep Midnight, and it does not enter the codebase."

For context on what would actually change: the live teacher sidebar renders from `DASH.heading`, which is `#0F1E35`, the old navy. So the three candidates are the live `#0F1E35`, the design's retired `#12253F`, and Deep Midnight `#0E0E11`.

**My recommendation is `#0E0E11`,** on the precedent already set: the curriculum redesign hit this exact substitution and ruled Deep Midnight. But it is your call, and it is bigger than this task, because the sidebar is shared with `/teacher` (section 6). Recolouring it recolours the dashboard too.

---

## 5. Font reality

**Figtree and Mulish are loaded nowhere.** `grep` for either name across `app/`, `lib/` and all CSS returns nothing. Referencing them by name today produces the `sans-serif` fallback.

What is loaded, in `app/layout.tsx:9`, via `next/font/google`: **Kodchasan** (`--font-kodchasan`) and **Nunito** (`--font-nunito`). `app/components/fonts.ts` exports these as `FONT_HEADING` and `FONT_BODY`.

**The trap:** `print-styles.ts:1` imports `FONT_HEADING` and `FONT_BODY` from that file. `.ws-title` is `FONT_HEADING`, `.ws-sheet` body copy is `FONT_BODY`, and `.ws-disclaimer` is explicitly `FONT_BODY` with its width measured against that face. **Editing `app/components/fonts.ts` to point at Figtree and Mulish would re-typeset the printed worksheet and the answer key, and would invalidate the measured claim that the 134-character disclaimer fits on one line.** That is a direct hit on the one rule.

Three options:

- **A, recommended: add the faces, do not touch `fonts.ts`.** New `next/font/google` entries for Figtree and Mulish in `app/layout.tsx`, exposed as new variables, consumed through a new `worksheet-theme.ts`. `fonts.ts` and therefore the paper stay exactly as they are. Cost: two more font families in the bundle, on top of Kodchasan and Nunito.
- **B: ship the board's layout on the app's existing faces.** Kodchasan for headings, Nunito for body. Zero font risk, zero bundle cost, and the pages match the rest of the teacher surface. Cost: the boards will not look exactly like the design at the type level.
- **C: adopt Figtree and Mulish app-wide.** Rejected for this task without a separate decision. It repaints the printed sheet and every other surface.

Also relevant: your `worksheet-print-format` note records "Fredoka vs Nunito open" on the printed sheet. That question is still open and this task does not touch it either way.

---

## 6. The sidebar, a scope call I need you to make

The design puts a 206px teacher sidebar on six of seven boards. Facts:

- The worksheet routes have **no** sidebar today. They are bare `<main>` elements.
- A teacher sidebar **does** exist, at `/teacher`: `SidebarInner` inside `app/teacher/TeacherDashboardClient.tsx`, a 1663-line client component. It is 200px, collapsible to 64px, with a mobile slide-over, nav icons, a tier band, a founder chip and a support modal hook.
- It is not a shared layout and not importable as-is. Putting it on the worksheet routes means extracting it, which touches `/teacher`.
- Its breakpoints are 640 and 1024 (`useViewport`, `TeacherDashboardClient.tsx:214`). The design asks for 900.

Three ways to go:

1. **Extract `SidebarInner` into a shared component, add `app/teacher/worksheets/layout.tsx`.** Faithful to the board. Blast radius into `/teacher`, and it forces the recolour question (section 4) onto the dashboard at the same time.
2. **Restyle the worksheet pages without a sidebar,** keeping the current "back to Dashboard" link. Smallest and safest. Diverges from the board on every screen.
3. **Defer the sidebar to a dashboard-wide chrome pass,** which is also what the design's own mobile note recommends for the sub-900px drawer.

**My recommendation is 3, executed as 2 for now:** restyle the worksheet pages on the new palette with no sidebar this pass, and let the sidebar plus the 900px drawer land as one dashboard-wide pass across Dashboard, Misconceptions, Students and Worksheets together. Otherwise the worksheet routes become the only teacher pages with a cream sidebar, which reads as a bug rather than as a redesign in progress.

---

## 7. SQL

**None needed.** Everything marked RESTYLE or NEW CHROME reads data the pages already hold. The only items that would need schema are all marked OUT-OF-SCOPE (backend): version B, per-topic counts, short codes, duplicate, archive, print counters, header and directions persistence, the QR code, the new tier.

Not running anything. Two existing DDL items are relevant context but neither is mine to run: `sql/worksheet_quota.sql` is still pending on prod, and `sql/instance_level.sql` from PR #189 is still unrun.

---

## 8. Things I am less than fully confident in, named

1. ~~`#8A8474` used as text.~~ **Resolved by measurement, see section 4.** It fails 4.5:1 on all six cream surfaces (2.84 to 3.67). Substituting `LIGHT.muted`, which passes the whole ladder. Not a residual risk.
2. **The design's ink `#23211C` and muted `#57534A`.** I am recommending the live `#0E0E11` and `rgba(14,14,17,0.6)` on the 2026-08-17 "live wins near-misses" precedent, but I am inferring that precedent applies here rather than being told it does.
3. **The 1.5 min per question rule on the index.** The builder uses `Math.max(1, Math.round((capped * 1.5) / 5) * 5)`; the design's script uses `totalQ * 1.6`. If minutes go on the index rows I would reuse the builder's rule, but the two disagree and neither is grounded in real timing data (the builder comment says as much).
4. **Whether `.no-print` on the preview chrome is the behaviour you want.** It makes Ctrl+P on the preview produce the sheet. The alternative is that it produces nothing useful. I think the first is right but it is a product call.
5. **Board 07 is unverifiable against prod** until `sql/worksheet_quota.sql` runs, because the meter fails open. I can build it and check it against a forced local state, not against a real capped teacher.
6. ~~The quota bar's "8 / 15".~~ **Resolved.** `capabilities.ts:269` sets `teacher-core: 15` and null for every other plan. The design's denominator is correct, and Teacher Core is the only capped tier, so the meter renders for exactly one plan.
7. **Two-font-family bundle cost** under option A in section 5. I have not measured what adding Figtree and Mulish does to the teacher route payload.

---

## 9. What I would do in Phase 2, on approval

Commits, in order, each with `npx tsc --noEmit` and `npx next build` green before it lands:

1. `worksheet-theme.ts` plus the font decision from section 5.
2. Index, boards 01, 02, 07: page frame, header band, meter, rows, empty state, cap panel.
3. Builder, board 03: two-pane inversion, search, strand filters, unit accordions, topic card grid, totals band, segmented controls. Existing semantics preserved.
4. Preview, boards 04, 05: frame, config rail with only the controls that exist, segmented tabs as links, `WorksheetSheet` embedded.
5. Responsive to 375 across all three.

Verification, per your rules: `next build && next start`, never `next dev`. The artifact-unchanged proof is two-part, a `git diff` proving the seven artifact-side files are untouched, plus a before-and-after render of `/print` and `/key` on the same worksheet id. `scripts/verify_worksheet_print.mjs --prove` already exists and already inverts every assertion against faulted input, which is the standard; note that per `print-harness-seeds-prod` it seeds real users into prod, so I would want your call before running it rather than running it as routine.

No push, no PR opened, nothing live until you say so.
