<!-- The PR description for feat/curriculum-visual-redesign, kept in the repo rather than
     in a scratch directory because a Codespace restart lost an earlier set of reports
     once already. Paste as the PR body. -->

References #178, #179, #180, #138, #175. Opens #182 for the work deliberately left out.

**The visual restructure is NOT in this PR.** See "What is not here" at the end.

This is the foundation for the curriculum redesign plus every defect the investigation
turned up on the way. The two phase reports are committed alongside it.

## The two investigation phases

`phase-1-curriculum-visual-redesign.md` and `phase-2-curriculum-visual-redesign.md`, both
written before a line of product code changed.

The headline from Phase 1 is that the two sources of truth are not the same visual system.
The marketing system shipped on login is a near-white graph-paper ground with hard `#111111`
borders; the course design import is a warm cream ladder with `#DCD3BE` hairlines. They
disagree on ground, border, ink and all three typefaces, and agree on squared corners and
rationed orange. Resolved as **split by altitude**: chrome and structure from the login
system, the reading surface from the course import, graph paper on `/dashboard` only.

## Dark mode, which was the standing instruction

The curriculum tree was light only. That was a recorded decision and it is superseded in
place at both sites, with its date, rather than deleted.

The reason it was recorded is real and is answered rather than dismissed: `globals.css`
paints KaTeX from `--ec-ink`, which inverts, while the page under it was pinned to cream, so
switching to dark did not theme the lesson, it turned the equations off. `topic-page-css.ts`
answered that by pinning `.katex` to `#0E0E11`, and that pin became the hazard once the page
could move: a fixed dark ink is the same failure with the themes swapped.

`.katex` follows `--umt-ink` now. `scripts/verify_curriculum_dark.mjs` measures the rendered
pixels in both themes, and its control renders the removed rule at matching specificity:

| | light | dark |
|---|---|---|
| inline math | 16.76 | 14.09 |
| display math | 18.96 | 13.12 |
| mono metadata | 4.84 | 5.19 |
| prose link | 5.70 | 5.74 |
| **control, the removed pin** | link **2.50** | math **1.17** |

The control caught its own first version: an inline style could not reproduce the old rule,
because the live rule is `!important` and beat it, so the faulted twin silently measured the
healthy value.

## The live defect this PR exists to fix

**Both tutor banners shipped with no capability check.** The quiz entry banner told every
visitor "get one wrong and I'll come talk it through with you". The tutor is Full Course; a
free-tier student on the AR.1.4 sample holds `curriculum` and not `gumu`, reaches the quiz,
and was promised a conversation their plan does not include.

Both routes now call `resolveCourseAccess()` and `allowsTopic(access, 'gumu', ...)`, the same
pair the grader already uses at `api/curriculum/practice/route.ts:216`. Not a second gating
path: if the two disagreed, the page would advertise a tutor the API then refuses.

**Tutor-absent is the default rendering, not a fallback.** The design supplies no
tutor-absent layout for either surface, so rather than invent chrome the absent version keeps
the same panel and rhythm, drops the promise, and keeps what is true on every plan.

`tests/tutor-gate.test.ts` pins the predicate for all six entitlement states with a control
comparing free tier against Full Course on the same topic. Shown failing on faulted input
first: with the sample granting every capability, 3 of 5 go red including the control.

Logged for attorney review as a misrepresentation item, with the exposure window dated from
git: 2026-08-19, when plan-based curriculum access created the class of users who could see
the page without holding the tutor, to 2026-08-21.

## Four contrast defects, three of them found rather than looked for

1. **Every prose link in the curriculum tree has failed AA since it shipped.** `C.gemini`
   `#6E9DC8` measures 2.19 on the cream page, 2.50 on the band, 2.82 on paper. Fine in dark.
   `--umt-link` is Gemini darkened to `#2F6091` in light and Gemini itself in dark.
2. **The answer key's `C.violet` fails on all four surfaces** it renders on (2.79 to 3.61).
   Darkened to `#7F4A9E` for light, lightened to `#C79BE0` for dark. Teacher-facing, which is
   why it outlived the student-side sweep.
3. **The topic header eyebrow was orange on cream at 1.60:1.** Takes `INK_MUTED`.
4. **One this PR introduced, caught by looking at a screenshot.** The mechanical
   `C.sunset` to `T.cta` conversion was right about the token and wrong about the one place
   it was text: `TopicOverview` painted the "In progress" state label in it, 1.99 on the band.
   `tsc` and `eslint` both passed through it. The general lesson is recorded at the top of
   `curriculum-surface.ts`, because the remaining surfaces get converted the same way.

## Database

Three files, all reviewed before running, two applied by Juan and one held.

- **`curriculum_completion_timestamptz.sql`, applied.** `completed_at` was `timestamp
  without time zone` while the app writes ISO-8601 UTC, so Postgres discarded the offset and
  stored a UTC wall clock in a column typed as local. Harmless while nothing read it, and
  about to stop being harmless. Existing values proven already-UTC by comparing against the
  timestamptz written in the same upsert.
- **`curriculum_completion_furthest_section.sql`, partially applied.** All three of
  `user_id`, `course_id` and `topic_id` measured nullable, which meant the unique index did
  not enforce uniqueness and the upsert's on-conflict target could miss. NOT NULLs applied;
  `furthest_section` deliberately not run, it waits for the checkmark work.
- **`curriculum_completion_gates.sql`, corrected in place.** It is applied, not pending, and
  its "zero rows" and "no grant to authenticated is needed" lines are named as stale rather
  than rewritten.

## `lessonDone` fails open

The reconcile discipline the other gate facts follow did not cover the lesson, and it failed
where there is no second source: `curriculum_attempts` holds answers, so a lesson read exists
in one place only. A lost write was inherited as null forever, the guided-notes row reverted
to "Not started", and `completed_at` could never be stamped.

Practice or quiz activity now counts as proof the student is past the lesson. The token means
"not before the lesson", not "read the lesson", and that redefinition is recorded where it is
computed along with the three rejected alternatives. The write site is tagged
`SNAPSHOT_WRITE_LOST` so the decision can be revisited with numbers rather than an argument.

## What is NOT here

**The visual restructure.** Tracked as **#182**. Screenshots from this branch read as the old
layout in new colours because that is exactly what they are: the surfaces moved onto theme
tokens so dark mode works, and their shape was left alone.

Specifically still outstanding:

- `RADIUS = 12` everywhere the design specifies radius 0
- the primary button's 2px pressable lip, where the design is flat
- rounded panels with inset ring shadows, where the design uses 1px borders and hairlines
- practice still stacking all ten problems rather than paging one at a time, which is the
  largest item and the only interaction change among them
- the back-arrow question on the mobile header, decided as "leave it" and carried to #182

Split off deliberately. Everything in this PR is independently valuable and independently
reviewable; the restructure is a large interaction change and does not belong bolted onto a
PR already this size.

## Verification

`tsc`, `eslint`, `next build`, `npm test` (252), `verify_curriculum_dark.mjs`,
`verify_modules_states.mjs`, and a browser walk in both themes at 1280 and 390px with real
KaTeX rendered through the real pipeline. Zero horizontal overflow at 390px in both themes.

Two checks were shown failing on faulted input before being trusted: the tutor gate, by
faulting `allowsTopic`, and the dark-mode contrast checks, by rendering the removed `.katex`
pin at matching specificity.

**Not verified, and it cannot be from here:** the browser walk as a real signed-in free-tier
student on AR.1.4, confirming no tutor copy appears. That needs an account on that plan, and
creating one is a production entitlement write. The predicate is pinned by
`tests/tutor-gate.test.ts`; what is unproven is that the banner is wired to the right boolean.
