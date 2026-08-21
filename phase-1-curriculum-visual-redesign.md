# Phase 1: student curriculum visual redesign, investigation

Branch `feat/curriculum-visual-redesign`, written 2026-08-21. Nothing in this phase
changed a line of product code. Every number below is measured or read out of the
repo, and the design file is quoted from
`TSI Student Course Experience.dc.html` (697 lines) plus `handoff.txt` in the
Claude Design project, both read in full.

---

## 0. The headline: sources 1 and 2 are not the same visual system

You ranked the marketing system shipped on login (source 1) above the Claude Design
import (source 2), and asked me to report conflicts rather than pick. The conflict is
not local. It is the ground, the border, the ink, and both typefaces. These are the
two systems side by side, read out of `app/login/login-theme.ts` and the import's own
token sheet (frame `1i`):

| Role | Source 1, shipped on login | Source 2, the course import | Same? |
|---|---|---|---|
| Page ground | `#FAF8F5` near-white, plus 62px graph paper | `#E8E0CF` cream, no graph paper anywhere | **no** |
| Panel | `#FFFFFF` | `#FFFDF8` | near |
| Border | `#111111` hard 1px | `#DCD3BE` warm hairline 1px | **no** |
| Body ink | `#111111` | `#23211C` | **no** |
| Secondary ink | `rgba(0,0,0,0.55)` | `#57534A` | near |
| Muted / mono | `rgba(0,0,0,0.58)` | `#8A8474` | **no** |
| Primary action | `#E8A33D`, ink `#111111`, hard 4px offset shadow on hover | `#E89B3C`, ink `#23211C`, no shadow | **no** |
| Display face | Nunito (Figtree not loaded) | Figtree 600 | **no** |
| Body face | Nunito | Mulish 400 | **no** |
| Mono face | Space Mono named, not loaded (issue #175) | JetBrains Mono | **no** |
| Corners | squared, radius 0 | squared, radius 0 | yes |
| Dark mode | full, measured, shipped | **none supplied** | n/a |

The two agree on exactly two things: squared corners, and orange reserved for one
action per screen.

**The graph paper is the sharpest case.** It is the signature of source 1 and it
appears nowhere in the course import. Carrying it onto the curriculum surfaces is an
invention; dropping it means the curriculum tree does not look like the login screens
a student just came through. Both readings are defensible and neither is mine to take.

Three ways out, none taken:

- **A. Source 1 wins outright.** Curriculum surfaces move to `#FAF8F5` + graph paper +
  `#111111` hard borders. Maximum consistency with login, and it discards the warm
  cream ladder the curriculum has used since launch, which the import is built on and
  which `curriculum-theme.ts` already implements.
- **B. Source 2 wins on ground and ink, source 1 wins on everything structural.** Keep
  the cream ladder, adopt hard-squared geometry, mono eyebrows, the same CTA anatomy.
  This is the smallest visual break for a returning student and the largest gap to
  login.
- **C. Split by altitude.** Graph paper and `#111111` on the chrome (top bar, rails),
  the cream ladder inside the reading column. Defensible on the argument that reading
  surfaces want warmth and chrome wants the brand system, and it is the option most
  likely to read as two products bolted together if it is done badly.

I recommend nothing here. It is the first question Phase 2 has to answer, because
every token below inherits from it.

---

## 1. Surface inventory: what renders today against what the design specifies

### 1.1 Modules / syllabus (`/dashboard/modules`)

| | Today | Design (frame `1b`) |
|---|---|---|
| Ground | `--umd-*` dashboard tokens, theme-aware, warm grey `#F5F5F3` / `#17171A` | cream `#E8E0CF` page, band `#F3EFE3`, panels `#FFFDF8` |
| Course band | Card, title, "6 units, 97 topics". No progress (removed last PR) | Header band with COURSE eyebrow, 32px title, standing line, and a 300px progress block "18 / 97" + 4px orange bar + "Last worked on Aug 14" |
| Continue | `ResumeCard`, exists | "Pick up where you left off" panel, same idea, orange button right-aligned (desktop) |
| Unit header | Collapsible, "Unit N" + title + topic count + per-unit bar built from **questions** | Collapsible, "Unit 0" + "Foundations and review" + "14 topics, about 9 hours" + 190px bar + **"5/14" topics** |
| Topic row | 44px row, 9px round status dot, name, mono meta, right state label | 11px **square** status glyph, name, mono meta, right state label in a fixed 96px column |
| Row states | complete / in progress / not started / entitlement-gated | complete / in progress / not started / **locked (prereq)** / **coming soon** |
| Radius | 12px throughout | 0 |
| Theme | light + dark, shipped | light only |

Structural gaps: squared geometry, the topic-count denominators, per-unit hour
estimates, and the "about 9 hours" line (which has no data behind it, see 9.4).

### 1.2 Topic overview (`/course/.../topic/[topicId]`)

`TopicOverview.tsx` (200 lines) already renders the three-part card. This is the
surface closest to the design today.

| | Today | Design (frame `1c`) |
|---|---|---|
| Three parts | Yes: lesson, practice, quiz, each with state and a requirement line, from `topic-parts.ts` | Yes: numbered 1/2/3 chips, name, meta line, right state label |
| Resume | Yes, `resumeStep()` computes the carry-on action | "Continue notes, section 3" |
| Numbered chips | No | 26px squared chips, orange filled for the active part |
| Section count | **Yes**, `lessonSectionCount()` | "7 sections" |
| Per-part time | Whole-topic `estimated_time_minutes` only | "about 20 min" per part |
| Locked part | No, and deliberately: `topic-parts.ts:9-11` records that no part is ever shut | "opens when practice is done", greyed, "Locked" |
| Back link | "Back to modules" at the foot | "Back to syllabus" beside the primary action |

### 1.3 Lesson (`/course/.../lesson`)

The single largest gap, and less large than it looks. The section model already
exists.

| | Today | Design (frames `1d`, `1e`) |
|---|---|---|
| Sections | **Exists.** `app/lib/lesson-sections.ts` splits on h5. Measured across all 97 topics: 781 headings, 4 to 13 per topic, median 8, h5 the only level used, no content before the first heading | "Section 3 of 7" |
| Outline rail | **Exists**, `LessonBody.tsx:158+`, 264px, hidden below 760px | 264px rail, `#EDE8DA` |
| Outline is | a **static list**. Its own comment: "No ids, no anchors, no IntersectionObserver over the sections, no current-section marker, no progress fill, no checkmarks, no time remaining" | current section highlighted with 2px orange left border + `#F6F2E8` fill, completed sections check-marked in `#3F7150`, 3px progress bar, "About 12 minutes of reading left" |
| Completion | binary per lesson. One `IntersectionObserver` on an end-of-content sentinel sets `lessonDone` | per-section |
| Per-section time | none | "about 4 min" per section |
| Reading column | capped 788px | capped 740px, on a `#F3EFE3` band |
| Math blocks | inline in prose | display math in a `#FFFDF8` panel with a 1px border |
| Callouts | none. `curriculum-theme.ts` records that "Check yourself" **does not exist in this curriculum** (grep across all 97 source files returns nothing) and that `quietBox` was named for it and left unconsumed | CHECK YOURSELF blocks, `#EDE7D6` fill, 1px border |
| Handoff | `LessonHandoff.tsx` exists | "Next in this topic / Practice, 10 problems" + orange button |

### 1.4 Practice (`/course/.../practice`)

| | Today | Design (frame `1f`) |
|---|---|---|
| Layout | all 10 problems stacked on one page | **one problem at a time** |
| Paging | `app/lib/practice-paging.ts` exists, and `verify_practice_paging.mjs` with it | position "3 of 10" |
| Strip | progress dashes exist | 10 segments, 26x6px, active 26x10px, green/red/orange/grey |
| Choices | rows | full-width rows, `#F2EDDF` fill, 1px `#E2DAC6`, 22px squared letter chip, selected = 2px `#23211C` + `#FFFDF8` |
| Prev/next | no | "Previous problem" / "Next problem" under the card |
| Correct state | inline | green 3px left border, tinted row `#F1F4EF`, one-line explanation |
| Missed state | inline | red 3px left border, student row `#F7EFEC`, correct row `#F1F4EF`, WORKED SOLUTION block, then the tutor card |
| Reveal | gated, see section 5 | unconditional text link |

### 1.5 Quiz (`/course/.../quiz`)

| | Today | Design (frame `1g`) |
|---|---|---|
| Layout | 4 questions stacked under the tutor banner | one question at a time, "Question 1 of 4" |
| Strip | `quiz-strip.ts` + `QuizStrip.tsx` exist | 4 segments, 40x6px |
| Entry | `GumuGate.tsx` banner | tutor banner + a stats row: QUESTIONS / TIME / ATTEMPTS / PRACTICE SCORE |
| Primary button | orange | **dark `#23211C`**, the one non-orange primary in the whole design |
| Finish | `QuizFinish.tsx` exists | 40px numeral score, 4 result bars, WHAT YOU MISSED naming the misconception, "Reread section 4" link, tutor strip, "QR.1.5 marked complete", orange "Next topic" |

---

## 2. Corrections to your reading of the frames

You asked me to verify your list against the file. It is accurate on the whole. Seven
places to correct, all small, none changing the direction:

1. **Continue card button is not full-width on desktop.** Frame `1b` right-aligns it
   beside the text. The full-width treatment is the **mobile** frame `1h`.
2. **Unit header meta differs by breakpoint.** Desktop `1b` reads "14 topics, about 9
   hours" with a 190px bar and "5/14" beside it. "14 topics, 5 done" is the **mobile**
   form.
3. **There are five row glyphs, not four.** Complete (filled `#3F7150`), in progress
   (3px `#E89B3C` ring), not started (1px `#C4BBA4` outline), coming soon (1px
   **dashed**), and locked (1px solid **plus a 45 degree hatch fill**, a separate
   `repeating-linear-gradient`). Locked and coming-soon are visually distinct in the
   design, not one state.
4. **The in-progress row is not a lighter fill.** It keeps the panel fill `#FFFDF8`
   and takes a 3px orange left border. The lighter `#F6F2E8` fill is used on **locked
   and coming-soon** rows, which is the opposite of what a lighter fill usually
   signals here.
5. **"SECTION 3 OF 7" with a bar and an Outline button is the mobile lesson header**
   (frame `1h`). Desktop `1d` puts "Section 3 of 7" and the bar at the top of the
   persistent 264px outline column, with no Outline button at all.
6. **The practice eyebrow is muted, not orange.** In `1f` "PRACTICE, QR.1.5" is
   `#8A8474`. The orange `#C07F22` eyebrow appears on the **topic overview**
   ("Topic QR.1.5, Unit 0") and the **lesson** ("Guided notes, QR.1.5" and
   "SECTION 3 OF 7").
7. **The CHECK YOURSELF callout does have a border**, 1px `#DCD3BE`, over an `#EDE7D6`
   fill. Not borderless.

One addition you did not list: the design's **course home has no left nav rail on
mobile at all**, and the desktop syllabus frame `1b` is the only frame that renders
the icon rail. Every other desktop frame (`1c` through `1g`) replaces it with the
hamburger in the top bar.

---

## 3. Every retired or unapproved colour in the import

You asked for all of them. This is the complete set, from the token sheet and from
every frame body.

### 3.1 Explicitly retired, and the design ships them

| Hex | Design role | Status |
|---|---|---|
| `#E89B3C` | the primary orange. Every button, every progress fill, the active rail item, the in-progress ring, the active row left border | **retired** |
| `#C07F22` | orange as text: topic eyebrow, lesson section eyebrow, "In progress" label, mobile "in progress" meta | **retired** |

These are not incidental. `#E89B3C` is the single most-used accent in the file, and
`#C07F22` is the only orange text token it has.

### 3.2 A third navy, and it is neither of yours

The tutor panels are `#12253F`. That is **not** Deep Navy `#0F1E35` (the superseded
pre-July-2026 brand colour) and **not** Deep Midnight `#0E0E11`. It is a new value the
import introduces. Its supporting values are also new: `#1C3253` avatar plate,
`#2C456B` plate border, `#3C5679` button border, `#8FA6C4` muted text, `#C3D0E0` body
text.

Measured, title `#FFFDF8` and body `#C3D0E0` on each candidate:

| Panel | title | body | button border `#3C5679` |
|---|---|---|---|
| `#12253F` design | 15.17 | 9.85 | **2.06 fail** |
| `#0F1E35` Deep Navy | 16.43 | 10.67 | **2.23 fail** |
| `#0E0E11` Deep Midnight | 18.96 | 12.32 | **2.57 fail** |

The text passes comfortably on all three. The **button border fails 3:1 on every one
of them**, and it is the only thing marking "Talk it through" as a control, so it is a
WCAG 1.4.11 failure the import carries regardless of which navy is chosen.

### 3.3 Not retired, but not on your approved list either

- **`#23211C`**, the design's body ink. The curriculum's ink is Deep Midnight
  `#0E0E11`. Adopting `#23211C` would change the ink on every curriculum surface.
- **`#B0452F`**, "missed" red. This **conflicts with a recorded decision**:
  `curriculum-theme.ts` states that wrong answers are amber-brown `#B5763A` rather
  than red, on the ground that "the student is mid-conversation with GUMU, not being
  alarmed". Note the live value is itself weak: `#B5763A` measures 3.68 on panel and
  3.30 on the missed row, both below 4.5.
- **`#8A8474`**, the muted / mono token. See 9.2; it fails on every surface.
- **`#E8A33D`**, the login CTA, is not on your approved list either. It shipped in
  PR #174 and it is a fourth orange distinct from `#F0A33E`, `#E89B3C` and `#C8A96E`.
  Worth a ruling in Phase 2 even though no curriculum surface uses it yet.

`#C68A2F` does **not** appear anywhere in the import. Nothing to remove.

### 3.4 Values the import shares with the live palette, already approved

`#E8E0CF` cream, `#FFFDF8` paper, `#F3EFE3` band, `#EDE8DA` rail, `#EDE7D6` quietBox,
`#F6F2E8` inset row, `#F2EDDF` sand, `#3F7150` complete. The four-surface ladder the
design is built on is **already in `curriculum-theme.ts`**, adopted 2026-08-17. Only
`band` is recorded as unapplied, because the reading column is capped at 788px and
painting it would draw a stripe rather than a band.

---

## 4. The tutor: what gates it, who has it, what happens without it

### 4.1 The gate

One capability, `"gumu"`, in `app/lib/capabilities.ts`. Resolution in
`app/lib/course-access.ts`:

| Who | `curriculum` | `gumu` | Reaches these surfaces? |
|---|---|---|---|
| Anonymous | no | no | no, `/course/*` 307s to `/login` |
| Free tier, on AR.1.4 only | yes, via `freeSampleGrants` | **no** | yes, tutor absent |
| Free tier, anywhere else | no | no | no |
| Practice Pass | **no** | **no** | **never reaches a `/course` URL at all** |
| Full Course | yes | **yes** | yes, tutor present |
| Teacher, entitled | yes, `viaTeacher` | **yes** | yes |
| Student of an entitled teacher | yes, derived | **yes** | yes |

`freeSampleGrants` returns true for `curriculum` only, with the reason recorded: the
tutor "is the Full Course differentiator and a sample that included it would give away
the thing the $89 buys".

### 4.2 What the three tutor surfaces do today when it is absent

- **Practice miss.** The panel mounts only when the grader says so. Without the
  capability the student lands "in the behaviour the anonymous tier already has, which
  is the correct answer inline and no panel". `verify_gumu_tier.mjs` pins this.
- **Quiz entry.** `GumuGate.tsx` (205 lines) is the banner. Needs checking in Phase 2
  whether the whole banner is suppressed or only its action, because the design's
  entry copy ("no timer, miss one and I will talk it through with you") is the quiz's
  only framing text and losing it leaves the entry state with nothing.
- **Quiz finish.** `QuizFinish.tsx` renders the result summary; the tutor strip in the
  design is additive.

### 4.3 The discrepancy for you

**The design supplies no tutor-absent layout for any of the three.** Frame `1f`'s
missed state ends with the tutor card between the worked solution and the footer;
frame `1g`'s entry is built around the banner; the finish state has a tutor strip
above the completion line. Remove them and there are three holes with no specified
fill.

Per your instruction I will not invent one. What Phase 2 needs from you is a decision
on each: does the space close up, or does something else occupy it.

---

## 5. "Reveal worked solution", and why it cannot be unconditional

`loadEarnedSolutions` (`topic-data.ts:421`) releases the worked solution for an item
only if that item is in `releasableItems(solved, revealed)`:

- **`solved`** comes from the gate snapshot: items the student answered **correctly**.
- **`revealed`** comes from `gumu_sessions` rows whose resolution marks the solution
  as disclosed through the tutor.

Everything else is filtered **server-side before serialization**, deliberately: the
comment notes that filtering in the component would be "the difference between
releasing one solution and shipping all fourteen with thirteen of them merely not
rendered". Anonymous returns `undefined`. A missing or erroring `gumu_sessions` fails
towards withholding.

So, per viewer, on an **unanswered** problem:

| Viewer | Can reach a solution by answering correctly | Can reach one via the tutor | Solution on an unanswered problem |
|---|---|---|---|
| Free tier on AR.1.4 | yes | **no**, no tutor | **none** |
| Full Course | yes | yes | **none** |
| Teacher / derived | yes | yes | **none** |
| Practice Pass | n/a, cannot reach the page | n/a | n/a |

**The design's unconditional "Reveal worked solution" link on an unanswered problem
offers something no plan provides.** This is the same defect class as the pricing copy
already in legal review, and I am flagging it rather than building it.

Three options for what the link becomes, none taken:

- **A. Omit it until earned.** Cleanest, and it removes an affordance students may
  already expect from the current stacked layout.
- **B. Render it disabled with the condition stated**, for example "Answer to unlock
  the worked solution". Honest, and it puts a lock on a surface whose recorded
  principle is that nothing in a topic is ever shut.
- **C. Render it live only where a tutor route exists**, so Full Course sees "Talk it
  through" and free tier sees nothing. Correct per plan, and it makes the two tiers
  visibly different mid-problem.

Note the copy problem in option C: for a Full Course student the tutor route is not
"reveal", it is a conversation that may end in disclosure. The design's label
describes a mechanism the product does not have.

---

## 6. Prerequisite gating does not exist. Confirmed.

Grepped for it and read the two files that would carry it. It is not merely absent, it
is **recorded as deliberately absent** in two places:

- `app/lib/topic-parts.ts:9-11`: "No locked state. Nothing in the topic tree gates a
  route: lesson, practice and quiz each read their own section's threshold and none
  checks a prior part, so every part is reachable at any time."
- The same file's 2026-08-21 narrowing, added last PR, is explicit that the new
  entitlement lock "is about ENTITLEMENT" and the sequence decision "is about
  SEQUENCE", and that the sequence decision stands.

`capabilities.ts` reinforces it: `curriculum` has no sub-capability "and there must
not be one: a split would introduce a mid-topic lock".

### 6.1 The design's row vocabulary mapped onto real states

| Design row state | Real state | Mapping |
|---|---|---|
| Complete | complete | direct. Filled `#3F7150` square |
| In progress | in progress | direct. 3px orange ring, orange left border |
| Not started | not started | direct. 1px outline square |
| **Locked, "finish QR.1.6 to open"** | **nothing** | **drop.** No prerequisite feature exists |
| Coming soon, "notes coming soon" | placeholder (`is_placeholder`) | direct. Dashed square. Note the app currently renders placeholders as a **count line** at the foot of the unit ("3 more topics in this unit are being written"), not as rows |
| *(absent from the design)* | **entitlement-gated** | **no design.** The live "Not available" row on `#F6F2E8` has no counterpart in the import |

Two asymmetries worth your attention: the design's locked fill `#F6F2E8` is the same
value the app already uses for **entitlement-gated** rows, so the visual language for
"locked" is free if you want it for the state that is real; and the design has no
representation at all for the entitlement gate, which is the row state that actually
ships.

Also note the design shows placeholders as full rows with names ("Absolute value,
QR.1.8, notes coming soon"). The app deliberately does not name unwritten topics. That
is a product decision to confirm, not a styling gap.

---

## 7. Nav

**Today.** One component, `app/components/StudentNav.tsx`, five items:

| Label | Href |
|---|---|
| Home | `/dashboard` |
| Announcements | `/dashboard/announcements` |
| Modules | `/dashboard/modules` |
| Grades | `/dashboard/grades` |
| Take a Practice Test | `/adaptive-test` |

It mounts two ways: as a **permanent 200px labelled sidebar** in `/dashboard` via
`StudentShell.tsx`, and as a **drawer only** in the curriculum tree via
`TopicChrome.tsx`. So the curriculum surfaces already have no persistent rail.

**The design.** A 60px icon rail with the mu mark and four squared 34px tiles: SY, AN,
GR, PT. Mapping is unambiguous from position and from the surfaces they sit on:

| Tile | Maps to | Note |
|---|---|---|
| SY | Modules | **renamed to "Syllabus"** |
| AN | Announcements | |
| GR | Grades | |
| PT | Take a Practice Test | |
| mu mark | *(nothing)* | Home has no tile |

Two conflicts. First, **Home is dropped**, silently. Second, the handoff's own section
7 says "Navigation naming, information architecture of the left sidebar... do not
redesign those pages in this pass" and "this handoff does not rename navigation",
while the rail renames Modules to SY. The design contradicts its own brief.

And the rail appears on **one frame only** (`1b`, the syllabus). Every other desktop
frame uses the hamburger. So adopting it means the syllabus grows a rail the rest of
the course experience does not have, which is the opposite of the current split.

---

## 8. Lesson state: what exists, what needs new state, what needs schema

| Design element | Exists today? | Cost |
|---|---|---|
| Section list | **yes**, `splitLessonSections()`, h5-based | none |
| Section count "of 7" | **yes**, `lessonSectionCount()` | none |
| Outline rail | **yes**, static, 264px | none |
| Section heading text for the outline | **yes**, the authored h5 | none |
| Per-section time "about 4 min" | **no** | derivable by dividing `estimated_time_minutes` by section count, which is a fabricated number per section. Honest version needs authored data |
| Current-section highlight | **no** | client only: `IntersectionObserver` over section nodes plus ids. No schema |
| Per-section checkmarks | **no** | needs **persisted per-section position**. New column or new table |
| Section progress bar fill | **no** | follows from current-section, client only, if it means "furthest reached this session" |
| "About 12 minutes of reading left" | **no** | derived from the per-section estimate above, so it inherits the same problem |
| Lesson done | **yes**, binary, sentinel `IntersectionObserver`, persisted as `curriculum_completion.lesson_completed_at` | none |

`LessonBody.tsx:38-41` states the boundary itself: the outline has "no ids, no
anchors, no IntersectionObserver over the sections, no current-section marker, no
progress fill, no checkmarks, no time remaining", and that the persisted half "needs a
column".

**Schema flag, for you, since you run all SQL.** Per-section completion is the only
item here that needs DDL. The cheapest shape is one nullable
`furthest_section int` on the existing `curriculum_completion` row, which already has
a unique index on `(user_id, course_id, topic_id)` and is already written on every
answer and on lesson completion. That is one `alter table ... add column`, no new
table, no new index. I have written no SQL and will not without your instruction.

The design's own note (frame `1a`) independently asks for one new field, a short
per-section outline label, and names its cost: "one optional field on the section, and
a pass over roughly 30 live topics at maybe 5 minutes each". Its stated fallback is to
truncate at two lines and keep the full heading in a `title` attribute, which is what
the app already does.

---

## 9. Progress counting

### 9.1 Topic-level completion is derivable today. Two different definitions already exist.

**Definition A, `curriculum_completion.completed_at`.** Written by
`syncCompletionSnapshot()` on every answer and on lesson completion. A topic is
complete when **all three** hold:

- `lesson_completed_at` is set, and
- practice correct >= `ceil(gradable * 7/10)`, and
- quiz correct >= `ceil(gradable * 3/4)`.

Stamped once and then left alone, so it records first completion rather than last
touch.

**Definition B, `statusOf()` in `app/dashboard/modules/page.tsx`.** A topic is
complete when `correct >= total` across **all** gradable items, practice and quiz
together, and it ignores the lesson entirely.

These disagree. B is strictly harder on questions (100 percent versus 70/75 percent)
and strictly easier overall (it does not require the notes to be read). A student who
read the notes and scored 8/10 and 3/4 is **complete under A and incomplete under B**.
The syllabus is currently rendering B while the database records A.

That has to be settled before a "18 / 97" counter ships, or the number will disagree
with the row states directly beneath it.

### 9.2 What it would cost

- **Per unit and per course, on `/dashboard/modules`: nothing.** The page already
  loads `getTopics()` and `getAttempts()` and computes `progressByTopic`. Counting
  topics where the status is complete is arithmetic over data already in memory. Zero
  extra queries.
- **If you prefer definition A**, it is one additional read of `curriculum_completion`
  filtered by `user_id`, returning at most 97 narrow rows. One round trip, and it
  would make the counter agree with the stored record rather than with a recomputation.
- **On `/dashboard` home**, the same, and that page already calls `getAttempts`.

### 9.3 My read, offered because you asked for the answer and not the build

Definition A is the better denominator: it is already stored, already stamped once,
already the thing the gates use, and it includes the lesson, which is what makes
"complete" mean "I finished this topic" rather than "I got every question right". Its
one weakness is that a student can be complete with 7/10, which some teachers will
read as generous.

Not built. Not decided.

### 9.4 A number in the design with nothing behind it

"14 topics, about 9 hours" per unit, and "about 20 min" per topic part. The unit hours
would be the sum of `estimated_time_minutes` across the unit, which exists. The
per-part split does not: the column is whole-topic. Splitting 50 minutes into
"20 / 20 / 10" as the design does is invention unless you author it.

---

## 10. Dark palette derivation

The import supplies no dark values for any curriculum surface, so this is derived. All
ratios computed on composited values, WCAG 2.1, and every failure named. **Which dark
family to sit in is itself an open question:** login dark is a blue-black
(`#0C1120` / `#161E30`), dashboard dark is warm-neutral (`#17171A` / `#202024`). The
curriculum tree is warm in light, so the table below derives a **warm** ladder as a
sibling of the dashboard's. If Phase 2 picks option A in section 0, this table is
rebuilt against the login blue-black instead.

### 10.1 Light, as the design ships it: the failures

Design ink ramp on the seven surfaces the course uses:

| Surface | `#23211C` design ink | `#0E0E11` app ink | `#57534A` ink2 | `#8A8474` muted |
|---|---|---|---|---|
| page `#E8E0CF` | 12.25 | 14.68 | 5.83 | **2.84 fail** |
| rail `#EDE8DA` | 13.14 | 15.75 | 6.26 | **3.05 fail** |
| band `#F3EFE3` | 13.99 | 16.76 | 6.66 | **3.24 fail** |
| panel `#FFFDF8` | 15.82 | 18.96 | 7.54 | **3.67 fail** |
| quietBox `#EDE7D6` | 13.02 | 15.60 | 6.20 | **3.02 fail** |
| inset row `#F6F2E8` | 14.39 | 17.24 | 6.85 | **3.33 fail** |
| choice `#F2EDDF` | 13.75 | 16.48 | 6.55 | **3.19 fail** |

**`#8A8474` fails 4.5:1 on all seven.** It is the design's token for every mono
eyebrow, every metadata line, every topic ID, and the "Not started" state label, which
is most of the small text in the whole system. The live equivalent, `INK_MUTED` =
`ink(0.6)`, was chosen precisely to clear 4.5 on all of them (4.62 to 5.02) and is
documented as such. **Recommendation: keep `INK_MUTED`, drop `#8A8474`.**

The two retired oranges as text, and the approved one:

| Surface | `#E89B3C` | `#C07F22` | `#A8631F` approved |
|---|---|---|---|
| page `#E8E0CF` | **1.74** | **2.54** | **3.58 fail** |
| rail `#EDE8DA` | **1.87** | **2.72** | **3.84 fail** |
| band `#F3EFE3` | **1.99** | **2.90** | **4.09 fail** |
| panel `#FFFDF8` | **2.25** | **3.28** | 4.62 pass |
| quietBox `#EDE7D6` | **1.85** | **2.70** | **3.80 fail** |
| inset row `#F6F2E8` | **2.05** | **2.98** | **4.20 fail** |
| choice `#F2EDDF` | **1.95** | **2.85** | **4.02 fail** |

**This is the most consequential finding in the report.** `#A8631F` was approved
against the dashboard's white card, where it measures 4.70. On the curriculum's cream
ladder it clears 4.5 on **one** surface out of seven. There is currently **no approved
orange that works as text on the curriculum surfaces**, and the design uses orange as
text in four places (topic eyebrow, lesson section eyebrow, "In progress" label,
mobile meta line).

Either those four move to a non-orange token, or a new darker orange has to be
approved for cream. I am not proposing a hex without your ruling, but for scale: a
value near `#8A5A10` reaches roughly 5.9 on cream, and at that point it no longer
reads as the brand orange.

State colours, light:

| Surface | `#3F7150` green | `#B0452F` red | `#B5763A` live amber |
|---|---|---|---|
| panel `#FFFDF8` | 5.60 | 5.53 | **3.68 fail** |
| correct row `#F1F4EF` | 5.13 | 5.06 | **3.37 fail** |
| missed row `#F7EFEC` | 5.02 | 4.95 | **3.30 fail** |

The design's red passes; the live amber-brown it would replace does not. That makes
the recorded "amber not red" decision a **contrast problem as well as a tone
decision**, which is worth knowing before you rule on it.

Non-text graphics, light, WCAG 1.4.11 target 3:1:

| Element | Ratio | Verdict |
|---|---|---|
| hairline `#DCD3BE` on panel | 1.46 | fail, but arguably exempt as decoration |
| hairline `#DCD3BE` on band | 1.30 | same |
| **choice border `#E2DAC6` on `#F2EDDF`** | **1.19** | **real failure.** This is the only thing marking an answer choice as a control, exactly the case the login theme raised its inactive pill from .18 to .45 for |
| track `#DCD3BE` on band | 1.30 | exempt, paired with a label |
| orange fill `#E89B3C` on track | 1.54 | fail, and it is the progress indicator itself |
| selected choice border `#23211C` | 15.82 | pass |
| login grid on ground, for reference | 1.13 | documented exemption, texture |

### 10.2 Derived dark ladder

Proposed, warm, mirroring the light ladder darkest-page to lightest-panel:

| Role | Light | Proposed dark | ink `#F2EDDF` | ink2 `.70` | muted `.55` |
|---|---|---|---|---|---|
| page | `#E8E0CF` | `#17171A` | 15.29 | 7.97 | 5.38 |
| rail | `#EDE8DA` | `#1E1D1A` | 14.41 | 7.66 | 5.24 |
| band | `#F3EFE3` | `#201F1C` | 14.09 | 7.54 | 5.19 |
| panel | `#FFFDF8` | `#262521` | 13.12 | 7.16 | 5.00 |
| quietBox / choice | `#EDE7D6` / `#F2EDDF` | `#2B2A25` | 12.29 | 6.82 | 4.82 |

All pass. `.52`, the dashboard's dark dim, also clears on every rung (4.47 to 4.94),
so the two dark systems can share a muted tier if that is wanted.

Accents on the dark ladder:

| On | `#F0A33E` sunset | `#F2A541` ec-orange dark | `#E8A33D` login CTA |
|---|---|---|---|
| band `#201F1C` | 7.86 | 8.03 | 7.64 |
| panel `#262521` | 7.31 | 7.48 | 7.11 |

**The brand orange works as text in dark and not in light.** Same asymmetry
`dashboard-theme.ts` already recorded for the status labels, and the same fix applies:
a theme-aware pair, brand orange in dark, something darker in light.

| On | `#7FB894` dash green | `#3F7150` design green | `#E07B72` login red | `#B0452F` design red |
|---|---|---|---|---|
| band `#201F1C` | 7.21 | **2.90 fail** | 5.69 | **2.93 fail** |
| panel `#262521` | 6.71 | **2.69 fail** | 5.29 | **2.73 fail** |

Both design state colours fail in dark. Both already have measured dark counterparts
in the repo: `#7FB894` from `dashboard-theme.ts`, `#E07B72` from `login-theme.ts`
(itself reused from `--ec-red` dark). **Recommendation: reuse both, add nothing.**

Non-text graphics, dark:

| Element | Ratio | Verdict |
|---|---|---|
| hairline `rgba(242,237,223,.14)` on panel | 1.50 | fail, mirrors light, same exemption argument |
| hairline `rgba(242,237,223,.22)` on panel | 1.93 | still short of 3:1 |
| hairline `rgba(242,237,223,.28)` on band | 2.34 | still short |
| login dark border `rgba(232,238,248,.42)` on panel | **3.53** | **passes.** If the hard-border system is adopted, this value already exists and already clears |
| grid `rgba(242,237,223,.05)` on page | 1.12 | matches the login grid's documented 1.13 exemption |
| track `.14` with `#F0A33E` fill | 5.27 | passes comfortably |

### 10.3 Tokens that already exist versus genuinely new

**Reuse, role already covered:**

- `--umd-statusComplete` pair (`#3F7150` / `#7FB894`), exactly this role
- `--umd-statusIdle` pair, for "Not started"
- `--umd-gatedRowBg` pair (`#F6F2E8` / `#26262B`), exactly the design's locked fill
- `--uml-error` dark `#E07B72`, `--uml-success` dark `#5BC48A`
- `--uml-focus` pair and `focusRing()`, which the import defines nothing for
- `--uml-grid`, `GRID_BACKGROUND`, `GRID_SIZE` if option A or C is chosen
- `INK_MUTED`, `INK_DISABLED`, `EYEBROW`, `MATH_LINE_HEIGHT` from `curriculum-theme.ts`
- `C.band`, `C.rail`, `C.quietBox`, `C.paper`, `C.cream`, the whole light ladder

**Genuinely new, dark side only:** the five-rung dark ladder in 10.2, a dark hairline,
and a dark quietBox.

**Genuinely new, both themes:** a text-safe orange for cream (see 10.1), the answer
choice fill and its border, the correct/missed row tints, the practice segment strip,
the quiz segment strip, and the tutor panel if it survives the legal hold.

---

## 11. Theming mechanism for the curriculum routes

**Today.** `topic/[topicId]/layout.tsx:44-46` hardcodes:

```
background: C.cream,
color: C.midnight,
```

on a `<div className="um-topic">`. The class already exists and is already used: by
`topic-page-css.ts` (217 lines) and by the scoped KaTeX rule in `globals.css:50`.

**What it takes.** The pattern is established twice already, `.um-dash` and
`.um-login`, and both work the same way:

1. A token module exporting `LIGHT` and `DARK` and a `VAR_NAMES` map, emitting
   `.um-topic { ... }` and `.um-topic[data-theme="dark"] { ... }`.
2. A **client** component that calls `useTheme()` and writes `data-theme` onto the
   wrapper. This is the only real structural change: `layout.tsx` is a server
   component, so the wrapper div has to move into a client component, exactly as
   `StudentShell.tsx` does for `/dashboard` (`'use client'`, `useTheme()`,
   `className="um-dash" data-theme={theme}`).
3. `body:has(.um-topic)` background rules, to stop the global `--ec-bg` flashing at
   the edges on overscroll. Both existing theme modules carry this and explain why.
4. Replacing the hardcoded values in `topic-page-css.ts` (11 hardcoded colour
   references) and the inline `C.*` uses across the tree with `var()` reads.

**Does it touch the shared provider or the root layout? No.** `useTheme()` is the
existing hook, `ThemeProvider` is already mounted app-wide, and the choice already
persists under the existing `ec-theme` key. `login-theme.ts` says this explicitly:
"The theme itself is NOT re-implemented... There is no second theme storage
mechanism here."

**So this is not an app-wide behaviour change**, and by your instruction it therefore
does not need separate approval. One caveat worth naming: adding a client wrapper
around the topic tree means the tree's outermost element becomes a client component.
Its children stay server components (they are passed as `children`), so no server code
moves to the browser. That is the same shape `/dashboard` already has.

The scoped KaTeX rule `\.um-topic .katex { color: #0E0E11 !important; }` will need to
become a `var()` read, or math goes black-on-black in dark. That rule was added last
PR precisely because dark mode turned the math invisible, and it is currently a
**hardcoded light value**. It is the single highest-risk line in the whole dark-mode
change.

---

## 12. Things the design assumes that the product does not have

Collected, beyond the ones already covered:

1. **Prerequisite gating.** Section 6.
2. **Per-section lesson state.** Section 8.
3. **Per-part time estimates.** Section 9.4.
4. **Per-unit hour totals.** Derivable, but the design's numbers are invented.
5. **"Last worked on Aug 14"** on the syllabus header. There is an attempt log with
   timestamps, so this is derivable, but nothing computes it today.
6. **A one-line explanation on a correct answer** ("Bottoms made to agree at 8, then
   tops added"). Items carry a stem, four choices, a worked solution, and a per-choice
   misconception note. A short correct-answer gloss is **not** one of those fields.
   Either it is the first line of the worked solution, which changes what "reveal"
   means, or it is new authored content across roughly 30 live topics.
7. **"What you missed" naming the misconception in prose** on quiz finish. The
   per-choice misconception note exists, and `misconception-labels.ts` exists, so this
   is probably reachable. Needs confirming in Phase 2 against a real item.
8. **"Reread section 4"** as a deep link from a quiz result into a lesson section.
   Needs section anchors, which do not exist (section 8), and needs a mapping from an
   item to a section, which does not exist at all.
9. **"CHECK YOURSELF" callouts.** `curriculum-theme.ts` records that this construct
   does not exist in the authored curriculum: a grep across all 97 source files
   returns nothing. It is the design's own sample content. The nearest real construct
   is a prose blockquote, used by **two topics out of 97**, which was considered and
   rejected as too rare to be a system.
10. **Named feature blocks** ("The Bank Account Test", "The Five Traps"). The design
    detects these from a pattern rather than a field. Whether that pattern holds
    across 97 topics is unverified and is a Phase 2 measurement.

---

## 13. The mascot asset

### 13.1 Complete inventory

**One file, one reference.**

| | |
|---|---|
| Path | `public/images/GUMU_headshot_transparent.png` |
| Size | 1,247,859 bytes (1.2 MB), 1080px source |
| Referenced by | `GumuAvatar.tsx:27`, a single `const SRC`. Nothing else in the repo names the file |
| Served via | `next/image`, deliberately: "the source is a 1.2 MB 1080px PNG and it renders here at 26 to 64 CSS pixels" |

**Rendered sizes, all four call sites:**

| Call site | Size | Plate | Alt |
|---|---|---|---|
| `quiz/page.tsx:69` | 64px | yes | "GUMU" |
| `GumuChat.tsx:304` | 48px | no | "GUMU" |
| `GumuChat.tsx:221` | 44px | yes | "" decorative |
| `practice/page.tsx:108` | 40px | yes | "" decorative |

**No print or export path references it.** Checked `app/teacher/worksheets/` including
`WorksheetSheet.tsx` and `PrintButton.tsx`, and the `@media print` block in
`globals.css`. Every reference is screen-only, inside the curriculum tree. Replacing
the file cannot affect a printed worksheet.

**One thing to know before the swap.** `GumuAvatar` has a `plate` prop that exists
only because of the current art: against Deep Midnight cards the silhouette drops to
2.9:1 and "about a third of his outline, the ears and the dark face mask, falls below
1.5:1 and simply disappears". The plate is a light rounded backing to rescue it, and
its inset (`size * 0.92`) and radius (`size * 0.28`) are tuned so "a circle inscribed
in this source clips the ear tips". **A mu glyph with cartoon eyes on a transparent
background may not need the plate at all**, and its ear-tip geometry certainly will
not apply. Phase 3 should re-measure and probably delete the prop rather than inherit
it.

### 13.2 Naming

You are right that `mu-mark` is taken. `public/images/brand/mu-mark.png` exists
(113,289 bytes, byte-identical in size to the design project's `assets/mu-mark.png`)
and is referenced by **nothing** in app code, so it is reserved but unused.

Proposed: **`public/images/brand/mu-character.png`**, with the component renamed
`MuAvatar` and the constant `MU_CHARACTER_SRC`.

- Sits beside `mu-mark.png` under `brand/`, so the two glyphs are visibly a pair.
- "character" is the word the handoff itself uses ("GUMU's existing avatar asset is
  the only character art"), and it distinguishes mark-as-logo from mark-as-mascot
  without either word being a substring trap.
- Rejected alternatives: `mu-avatar` (collides with the account-chip avatar concept
  already in `StudentNav`), `mu-tutor` (names a role that may change), `mu-face`
  (fine, but reads as a crop of something larger).

Not moved, not renamed, no new file added. Phase 3, with the code that points at it.

### 13.3 The rename boundary

New tutor UI will be built as **mu** from the start: new component names, new copy,
new token names. No repo-wide rename. For scale, the existing footprint is
`app/api/gumu/`, `app/lib/gumu.ts`, three components, four `sql/` files, three
`scripts/`, one design doc, plus the `"gumu"` capability string and the
`gumu_sessions` table name. The capability string and table name are **data**, not
labels, and renaming them is a migration rather than a find-and-replace. That is why
it is correctly scoped out.

---

## 14. What Phase 2 needs from you before it can produce the two artifacts

Ranked by how much downstream work each unblocks:

1. **Section 0: which visual system.** A, B, or C. Everything else inherits from it.
2. **The orange-as-text problem (10.1).** There is no approved orange that reads on
   cream. Either the four orange text roles change colour, or a new hex gets approved.
3. **Definition of topic complete (9.1).** A or B, before any "18 / 97" ships.
4. **The three tutor-absent layouts (4.3).** The design supplies none.
5. **What "Reveal worked solution" becomes (5).** A, B, or C.
6. **Red versus amber-brown for a missed answer (10.1).** A recorded decision, now
   also a contrast finding.
7. **Whether the icon rail is adopted at all (7).** It appears on one frame, drops
   Home, and renames Modules against the handoff's own instruction.
8. **Whether placeholders become named rows (6.1).**

I have taken none of these.

---

## 15. Method note

Read in full: `handoff.txt`, all 697 lines of `TSI Student Course Experience.dc.html`,
`login-theme.ts`, `curriculum-theme.ts`, `capabilities.ts`, `lesson-sections.ts`,
`topic-parts.ts`, `curriculum-progress.ts`, `GumuAvatar.tsx`, plus the topic layout,
lesson page, and the modules page. Ratios computed with a WCAG 2.1 implementation over
composited alpha, not estimated.

Not read, and flagged as Phase 2 work: `PracticeQuiz.tsx` (784 lines) and
`GumuChat.tsx` (634 lines) in full. Both were grepped for the specific questions above,
but the practice redesign is the largest single surface in this pass and it deserves a
full read before any token table claims to cover it.

`assets/mu-mark.png`, `assets/unpackmath_wordmark.png` and `support.js` were listed and
their roles confirmed from the frames that reference them. `support.js` is the Claude
Design canvas runtime, not product code, and carries nothing to port.
