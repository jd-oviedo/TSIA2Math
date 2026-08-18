# The student course experience, as it stands

Written 2026-08-18, at the close of the redesign. Aimed at someone opening this
repo cold with no memory of the work. Every claim carries the PR that made it
true, so it can be checked rather than believed.

Companion documents: `redesign-handoff.md` is the five findings about the student
surface that started this work, with the two that are now partly superseded
marked as such. `curriculum-handoff-after-unit-4.md` is the long record behind
the curriculum itself and the defect classes worth knowing. This file is neither
of those; it is what the product does now.

---

## 1. The experience, surface by surface

A student arrives from the Modules page or the Home recommendation card, both via
`topicHref()`.

### Modules, as a syllabus (#127)

Units are collapsible groupings with unit-level progress; topics are rows with a
status mark, id, time estimate and state label. Not a pile of cards. `RADIUS` and
`hairline()` were introduced here as the tree's shape tokens.

**Runs on the dashboard theme (`V`), not `curriculum-theme.ts`.** That matters:
it is the one surface in this list a curriculum palette change does not reach.

### The topic doorway (#125)

`/course/{test}/{subject}/unit/{unit}/topic/{id}` used to redirect straight to
the lesson. It is now a landing view: the three parts as a sequence, each with
its state, and one primary that carries on from wherever the student stopped.

It **owns progress**. Nothing else in the topic tree reports how far along a
student is.

### Guided notes (#131, #133, #150)

- Split into one card per authored `h5` section, with a section eyebrow and
  heading (#133). Measured across all 97 topics: 781 headings, 4 to 13 per topic,
  median 8, and h5 is the only heading level used anywhere.
- A static outline rail beside them at 264px, listing every section (#133).
- An end-of-lesson handoff card naming what practice is, carrying the single
  primary, with `TopicNav` dropping its Next so there are not two (#131).
- The reading band: the column was split into `.um-lesson-column`, which paints
  `C.band` and fills, and `.um-lesson-measure`, which caps the line length at
  788px (#150).

The completion gate is an `IntersectionObserver` on a sentinel after the last
card. It is observed against the viewport with **no root**, which is why the band
must never become a scroll container -- see §2.

### Practice (#140)

One problem at a time, with a ten-segment strip showing per-problem state:
current, correct, missed, untouched. Previous and Next movement. A **client-side
index, not a URL param**, and the reason is in §2.

Cross-visit seeding: previously-correct items seed the strip from
`gates.practiceSolved`; previously-missed do not, because nothing stores that.

### The mini quiz (#126, #149)

Its own register during the attempt: ink primary rather than Sunset, no worked
solution offered mid-attempt, and a four-segment strip at 40x6 (#149). A finish
state summarising what was missed by name, with that same strip and the score at
size (#126).

The quiz shares `PracticeQuiz` with practice and is **not paged**, which is why
its strip has its own three-state enum rather than practice's four.

### In-course chrome (#148)

Breadcrumb naming course, unit and topic, and a three-segment Lesson / Practice /
Quiz indicator marking which part is being served. All three are live links;
`aria-current="page"` is the only distinction.

The active part is read from the `x-pathname` header `middleware.ts` stamps --
added by #135 for the sign-in redirect, because **a layout is given no part of
the URL**. Measured: it receives `accept`, `host`, `user-agent` and four
`x-forwarded-*`, nothing else.

The indicator does not render on the doorway. The doorway owns position there.

### GUMU

- Entry banner on the quiz, introducing him before anyone is stuck (pre-existing).
- A remediation panel on a missed practice question, replacing a bare orange
  button: he introduces himself on the dark surface, says what he is offering,
  and gives a way to decline (#151).
- The escape hatch reveals the answer at any point, and since #145 that also
  releases the item's worked solution.

### Worked solutions (#119, #143, #145)

Released per item to the student who earned it. Two ways to earn one:

- answered correctly (#119)
- **used the escape hatch and was therefore already shown the answer** (#145)

The second required `gumu_sessions.resolution` (#143), because both flagged
endings previously wrote the same `status` and were indistinguishable.

### Sign-in (#135)

A signed-out deep link returns to the page it asked for.
`/dashboard/grades` redirects to `/login?next=%2Fdashboard%2Fgrades`.
`app/lib/next-param.ts` builds and validates the param in one place.

### Type and colour (#139)

`INK_MUTED` (`ink(0.6)`) for quiet text, `INK_DISABLED` (`ink(0.4)`) for disabled
controls and decoration. The split exists because those two jobs were spelled the
same way and text kept landing on a grey that could not be read.

---

## 2. Settled decisions, with their reasons

These were decided with the evidence attached. **Reopen them if new information
arrives, not because the outcome looks arbitrary.** The reason is the part worth
keeping.

### Cross-topic gating: rejected

`app/lib/topic-parts.ts` states the actual rule: *"Nothing in the topic tree gates
a route: lesson, practice and quiz each read their own section's threshold and
none checks a prior part."* What is gated is the Next control at the foot of each
part, never the route.

The design draws locked rows ("finish QR.1.6 to open"). Building them would mean
inventing a rule the product does not have, and every part is reachable by URL
regardless -- so a locked control would be **a control that lies about a page the
student can simply type**. That is also why the chrome indicator's three segments
are all live links (#148).

### Per-part times: rejected

The design shows "about 20 min" per part. `estimated_time_minutes` is stored per
topic, not per part, so a per-part figure would be invented. The quiz entry's
TIME stat was dropped for the same reason (#149).

### Section-level resume: deferred

"You stopped in section 3" needs two things the product does not have: ids and
scroll observation to know where the reader is, and a stored position beside
`lesson_completed_at`, which is a single timestamp.

The outline in #133 is therefore **static** -- no ids, no anchors, no observer, no
current-section marker, no progress fill, no checkmarks, no time remaining, no
jump links. `verify_lesson_outline` asserts the absence of links and ids, so
"just the highlight" cannot arrive quietly.

### Deferred quiz grading: rejected (#149)

The design writes *"Answers are not graded until you finish."* It cannot coexist
with GUMU opening on a miss, and that moment is the point of the tutor. It would
also change when `curriculum_attempts` rows are written and how many.

Consequence: the quiz strip is **graded during the attempt**, green and amber per
question, because the card beside each question already says "Nailed it" or "Not
quite yet". A neutral strip above graded cards would lie by omission. The
design's neutral-during is downstream of the model that was rejected.

"Start quiz" as a gate was rejected with it: a new control in front of a route
that is currently open.

### Model-generated GUMU opening line: rejected (#151, and see #141)

The design writes a real diagnosis into the remediation panel. Producing one
means `start()`, which inserts a `gumu_sessions` row with `status: 'active'`.
Three reasons, and the third settles it:

1. it opens a session the student never consented to
2. it writes a row per miss whether or not anyone engages
3. **it needs a fourth `resolution` value** for "opened, never entered", which
   `sql/gumu_sessions_resolution.sql` forbids by CHECK on purpose -- and #145 made
   `student_gave_up` load-bearing, so an unclassified session would sit next to
   the one that releases answers

The panel's opening line is static copy. GUMU speaks after "Talk it through".

### Client-side paging, not a URL param (#140)

A URL turn re-renders the server component, discards `results`, and shows an
already-answered problem as unanswered -- so a student re-submitting writes a
**second `curriculum_attempts` row for one intended answer**. No consumer counts
rows that way today, but the log is the append-only record of what a student did.

Accepted cost: no deep link to a problem, no browser Back between problems,
position resets on reload.

### `C.quietBox`: deliberately unconsumed

Named in #133 as the third rung of a four-surface ladder
(cream -> rail -> band -> paper). It was named for the design's "Check yourself"
callout, and **that construct does not exist in this curriculum** -- grep across
all 97 source files returns nothing.

The prose blockquote was considered and rejected: two topics of 97 use one, and a
token applied to two instances is not a system. Kept because the ladder is
incomplete without it; if a callout is ever authored, that is its colour.

### `#F0A33E` is Sunset Orange, always

The recoloured design proposed `#E89B3C`. Live wins, everywhere: sidebar pill,
primary buttons, current-topic bar, progress fill, eyebrows, "In progress"
labels, step markers.

`#C07F22` -- an orange-as-text value -- was dropped entirely. There is no such
role in this product, and the brand orange is worse as text (1.60:1 on cream
against 2.54:1), so the role was the problem rather than the hex.

Only three values were taken from that recolour: `C.band`, `C.rail`,
`C.quietBox`. Everything else was a near-miss of a brand colour.

### `check_topic.py`'s 40/97 baseline (#124)

`scripts/check_topic.py` fails on **40 of 97 topics**, 56 FAIL lines, four kinds
of finding. It is a per-topic pre-commit check and **cannot serve as a
course-wide gate** until those are resolved. Recorded so the number is not
rediscovered; explicitly not part of the redesign.

### The turn-cap student is still shown nothing

The honest limit of #145. A student who spends their GUMU turns, hits the cap and
never asks to be shown the answer gets no worked solution -- releasing there was
considered as option (b) in #141 and rejected, because at that point the answer
has **not** been disclosed and a solution would disclose it.

#103 records the other half: if that student is also in no class, the teacher
notification is never written, so nobody is told either.

`redesign-handoff.md` finding 2 called this gate "inverted relative to need". It
is narrowed, not resolved.

---

## 3. Verification, told straight

### What runs with no server and no account

`npm run test:offline` -- four members, and it fails if any has stopped loading:

| | checks |
|---|---|
| `npm test` (`tests/*.test.ts`) | 79 |
| `test:solutions` per-item worked-solution gate, faults included | 60 |
| `test:gumu-resolution` that `resolution` is written, right way round | 18 |
| `test:gumu-panel` the panel is presentational, dismiss is pre-session only | 27 |

**Nothing runs it automatically.** It is a convention a person types.

### What runs against a built app

Twelve browser probes. All but two take `--base`; `test:auth-gate` and
`test:modules-density` **build their own app and serve on their own port**, so
running either alongside a server on 3110 corrupts both.

`test:lesson-outline` 14, `test:practice-paging` 13, `test:login-next` 12,
`test:lesson-handoff` 11, `test:quiz-finish` 11, `test:topic-chrome` 11,
`test:quiz-register` 10, `test:reading-band` 9, `test:overview` 9,
`test:auth-gate` 9, `test:modules-density` 9, `test:gumu-tier` 6.

Most take `--prove`, which inverts every expectation. A run where nothing fails
under `--prove` is a suite that cannot fail.

### What CI gates

Vercel runs `npm run build`, which is `npm run lint && next build`. So **eslint
and the Next build are gated on every PR**, plus a Supabase preview check.

**`test:offline` and every browser probe are not.** They run in a person's
terminal or not at all.

### The gap, stated plainly

**Every browser probe runs signed out, and the authenticated branch is untested.**

Signed out: `gumu_available` is false, `correct_answer` comes back inline, no
gates apply, `GumuChat` never mounts, and `loadEarnedSolutions` returns
`undefined` before reading anything. So practice, quiz, GUMU, the remediation
panel, worked-solution release and every progress gate are covered **only in the
mode students will not be in**.

What that means concretely, for the surfaces built here:

- the GUMU remediation panel's rendering is asserted **on the source**, not in a
  browser (#151)
- the page-turn GUMU gate release is asserted as a **pure function**, not end to
  end (#140)
- the worked-solution release rule is driven directly against the real functions
  with a real answer key, and never through a page (#119, #145)

This is not a gap the redesign created. It predates it, and it is scoped in
`curriculum-handoff-after-unit-4.md` under "the auth test path: deferred, not
declined". The cost is that this project has one Supabase instance, so a test
account is a real user in production auth writing real `curriculum_attempts`
rows.

`scripts/verify_gumu_tier.mjs` is the pattern to copy for absences: every negative
is paired with a positive on the same page, because an absence passes just as
happily against a page that failed to render.

---

## 4. Open issues, and what each would take

### #134 -- `verify_quiz_finish` passes only on a fresh server

11/11 cold, 0/11 warm. Aborts on a `Check answer` that never enables. Rate
limiting on the answer route is the obvious candidate and **was not confirmed**.

To settle: establish whether the route is rate limited under `next start`, then
either exempt the probe or have it fail loudly on a throttled response rather
than timing out on a disabled button. Until then, give it a fresh server.

### #136 -- `resolveOrigin` trusts `x-forwarded-host`

No allow-list. The value becomes the origin of the post-sign-in redirect. It is
load-bearing -- behind a proxy the real host arrives only in that header -- so it
cannot simply be deleted.

To settle: confirm whether the header is attacker-controllable in the deployments
that matter. On Vercel the platform sets it and strips upstream copies, which
would make this theoretical in production and real for other shapes. If a fix is
wanted, an allow-list with a fallback to `request.url`'s origin.

### #137 -- the middleware token-refresh path is untested

`request.cookies.set` inside `setAll` mutates the cookie header, so a `Headers`
captured earlier would hand downstream a pre-refresh session. The current code is
correct -- `headersWithPath()` is called after the writes -- but **change it to a
captured constant and every test still passes**.

To settle, cheaply: unit-test the middleware with a stubbed `createServerClient`
whose `getUser` invokes `setAll`, then assert the request handed to
`NextResponse.next` carries both the refreshed cookie and `x-pathname`. No
network, no account.

### #138 -- `dashboard-theme` `LIGHT.dim` fails 4.5:1

3.21 on `pageBg`, 3.51 on `cardBg`. Dark mode passes both.

The asymmetry is the tell: `DARK.dim` carries a comment saying 0.46 *"lands at
4.1:1 on the dark card"*, so the dark half was measured and corrected while the
light half it was mirroring never was.

To settle: find what `V.dim` is used for first. Decorative or disabled uses are
exempt from 4.5:1 and raising them would flatten hierarchy for no gain -- the same
question #132 had to answer for `ink(0.45)`. Deliberately **not** the same PR: the
two themes are separate systems and `dashboard-theme.ts` reaches teacher surfaces.

### Also open, outside this arc

#141 records the solution-on-miss options and their rejections; (c) shipped in
#145, so it is a decision record rather than work. #120 (QR.1.1's unsatisfiable
solution precondition), #103, #104, #105, #101, #112, #124, #86, #11 are
curriculum and content debt predating the redesign. #14 stays open pending a
production spot-check after #147's restore.

Two stale PRs, #68 and #69, have been open since 2026-08-12 and are not part of
this work.

---

## 5. Supabase preview: it is installed and inert

**This will surprise whoever runs the next migration, so it is here rather than
in a comment.**

Every PR shows a `Supabase Preview` check. Measured 2026-08-17: it reports
**`skipped` on every PR head commit** and `success` only on merge commits, which
is a no-op result rather than work done.

The reason is structural: **there is no `supabase/` directory in this repo.** No
`config.toml`, no `supabase/migrations/`. Confirmed absent, not gitignored. The
integration creates preview branches by applying `supabase/migrations/`; with
nothing to apply, it skips.

So:

- **there is no branch database**
- **preview deployments run against production data**. The Supabase check's
  project ref and `NEXT_PUBLIC_SUPABASE_URL` are the same project.
- DDL is applied by hand in the production SQL editor. `sql/` is the
  version-controlled record, not an applied migration set.

**The consequence for the next migration**, learned in #143: a preview build of a
PR that expects a new column fails until the DDL is applied, exactly as production
would. Apply the DDL first, then merge the code. `resolveFlagged` is the worked
example -- its update did not check its error, so a missing column would have left
sessions `active` forever and locked students out of GUMU on that item via the
partial unique index. The error is checked now (#143).

Adopting `supabase/migrations/` and making the integration real is a separate
decision. It would give preview branches and stop previews touching production
data. Not recommended here either way; recorded so it is a choice.

---

## Where things live

| | |
|---|---|
| Topic routes | `app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/` |
| Curriculum theme | `app/components/curriculum-theme.ts` |
| Dashboard theme, separate system | `app/components/dashboard-theme.ts` |
| Pure logic loadable by `node --test` | `app/lib/*.ts`, none importing the admin client |
| Probes and fault proofs | `scripts/verify_*.mjs`, `scripts/faultproof_*.mjs` |
| Applied DDL, by hand | `sql/*.sql` |
| Curriculum record and defect classes | `curriculum-handoff-after-unit-4.md` |
| The five findings that started this | `redesign-handoff.md` |
