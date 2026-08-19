# Phase 4, the student entitlement gate. Design report.

*August 19, 2026. Branch `feat/entitlement-columns`.*

> ## STATUS: DESIGN, REVISED AGAINST FOUR RULINGS. NOT BUILT.
>
> Revised 2026-08-19. No code has been written. `/course` still has no auth gate
> of any kind, `app/course/layout.tsx` is still a twelve-line passthrough, and
> every topic is still readable by an anonymous visitor.
>
> **Nothing in section 5 is open any more.** The four questions this document
> previously carried have been ruled on:
>
> | # | Question | Ruling |
> |---|---|---|
> | 1 | What anonymous and free-tier visitors see | One free topic, signed-in only. Anonymous gets no curriculum at all. Section 5 |
> | 2 | Whether `practice-pass` unlocks a topic's practice | Yes. The capability model splits three ways. Section 2 |
> | 3 | The `subscription_status` transition predicate | Accepted, and `legacyActivateOnly` is the named blocker. Section 4.2 |
> | 4 | Whether teacher plans imply curriculum read | Gate predicate is curriculum OR teacher-dashboard, and the map is NOT widened. Section 2.4 |
>
> **Ruling 2 was itself withdrawn later the same day.** The capability model does
> NOT split: it is `curriculum` (Full Course only) and `gumu` (Full Course only,
> plus the derived teacher path), with `worksheets` sitting outside `/course`
> entirely. A Practice Pass holder never lands on a `/course` URL. Section 2
> records both wrong versions rather than only the conclusion, because both were
> reached from confident readings of written sources: the first from the SQL
> shorthand, the second from the live pricing copy. The pricing copy is wrong and
> is carried to section 6.
>
> The consequence is that the gate is ONE plan check at the course root, and the
> three surfaces the split would have disturbed are untouched. Section 2.5 is what
> is left of that cost, which is one new tier state and no locked routes.

Read alongside `checkout-entitlement-handoff.md` section 3.4 and
`sql/entitlement_columns.sql` section 2.

---

## 0. What this phase actually is

`app/course/layout.tsx` is twelve lines, one div, no imports. There is no auth
check anywhere in the `/course` tree, and none above it: `middleware.ts` refreshes
tokens and stamps `x-pathname` and deliberately gates nothing. Every topic is
readable by an anonymous visitor.

So Phase 4 is not moving a gate or tightening one. It is the first gate this tree
has ever had, and everything currently attached to the tree was built on the
assumption that it has none. Section 1 is the measure of that.

One consequence worth stating before the inventory, because it reframes the
priority: **the $89 Full Course currently unlocks nothing**, since the curriculum
it would unlock is already free, public and complete. Phase 4 is what makes the
product real, not what makes it stricter.

---

## 1. Complete anonymous inventory of `/course`

### 1.1 Routes

Four routes exist, all under one dynamic path. There is no page component at
`/course`, `/course/[test]`, `/course/[test]/[subject]` or `.../unit/[unit]`, so
those four levels 404. The tree is reachable only by a full topic URL.

| Route | File | Anonymous today |
|---|---|---|
| `.../topic/[topicId]` | `topic/[topicId]/page.tsx` | **Open.** Topic doorway, `TopicOverview` with per-part state |
| `.../topic/[topicId]/lesson` | `lesson/page.tsx` | **Open.** Complete guided notes, fully rendered |
| `.../topic/[topicId]/practice` | `practice/page.tsx` | **Open.** All practice items, interactive and graded |
| `.../topic/[topicId]/quiz` | `quiz/page.tsx` | **Open.** All mini quiz items, interactive and graded |

Multiplied across the live curriculum this is roughly 97 topics times four
routes. `loadNavigation` (`topic-data.ts:242`) sequences previous and next across
the *entire course*, so an anonymous visitor who lands on any one topic can walk
the whole thing linearly without ever signing in. The only surfaces that link
*into* the tree (`/dashboard/modules` and the Home recommendation card) sit behind
the dashboard gate, so discovery is by URL rather than by navigation, but the URLs
are structured and predictable.

### 1.2 Data reachable without authentication

**Through the page render** (`topic-data.ts:157-164`, anon client against
`curriculum_topics_public`):

- `topic_name`, `is_placeholder`, `related_strand`, `estimated_time_minutes`
- `guided_notes`, the complete authored lesson prose, rendered server side
- `practice_items`, both sections, with `correct_answer` and `misconception_tag`
  recursively stripped by `jsonb_strip_keys`

**Not reachable through the render**, and this part is genuinely well built:
`answer_key` is not a column on the view at all, `misconception_tags`,
`misconceptions_used` and `related_cate_items` are dropped, and `anon` holds no
grant on the base table. Withholding the answers is not something the page code
remembers to do, it is something that query cannot undo.

**Through the API, and this is the sharp finding.**
`POST /api/curriculum/practice` accepts anonymous callers by design
(`route.ts:54-58`, "anonymous users are graded, but nothing is persisted"). It
reads the answer-bearing row through the admin client and returns:

```
correct_answer: gumuAvailable ? null : item.correct_answer     (route.ts:205)
```

`gumuAvailable` initialises `false` and is only ever set inside `if (session)`
(`route.ts:100`, `:189`). **For an anonymous caller it is always false, so
`correct_answer` is always returned.** That is deliberate and documented: it is
the tier asymmetry `scripts/verify_gumu_tier.mjs` exists to pin, and for a
student clicking through a page it is reasonable behaviour.

As an extraction surface it is a different thing. One request per item yields
that item's answer, with no session, at 60 requests per 5 minutes per IP
(`rate-limit.ts:47`). Roughly 1,358 authored items across the course is about two
hours from a single address. The worked solutions in `answer_key` stay protected;
the correct options do not.

`POST /api/curriculum/progress` accepts anonymous callers and returns
`{recorded:false}` without writing. `POST /api/items/reveal` (the CAT bank, not
curriculum) returns `isCorrect` and `correct_answer` to anonymous callers and
withholds `explanation` and `distractor_note`.

**Nothing is written for an anonymous visitor.** No `curriculum_attempts`, no
`curriculum_completion`, no `student_misconceptions`, no `gumu_sessions`. Every
one of those keys on a real `auth.users` id.

### 1.3 Gate state

`loadGates` / `loadTopicGates` with a null `studentId` return the base state and
skip every read (`topic-data.ts:314`). So server side, an anonymous visitor has
zero progress. The in-page gate in `GatedQuiz` still applies, so they must
actually answer 7 of 10 to unlock Next, but that state is client side and lives
only for the visit.

`loadEarnedSolutions` returns `undefined` immediately for a null `studentId`
(`topic-data.ts:419`), so no worked solution is ever serialized to an anonymous
page.

### 1.4 The GUMU surface

GUMU is **advertised anonymously and unusable anonymously**. Both halves matter.

Unusable:

- `GumuChat` never mounts, because `gumu_available` is false on every anonymous
  grade (section 1.2).
- `POST /api/gumu/session` returns 401 `"Sign in to use GUMU"` (`route.ts:177`)
  before doing anything else.
- Instead of a conversation, the anonymous visitor gets the correct answer inline,
  which is the asymmetry described above.

Advertised:

- The quiz page renders the full GUMU introduction card for everyone, avatar
  included, with the copy branching to a sign-in link for signed-out visitors
  (`quiz/page.tsx:58-95`).
- The practice page renders a GUMU banner on written-work topics
  (`practice/page.tsx:98-120`).
- The layout renders a sign-in nudge: "to save your progress and work through the
  ones you miss with GUMU" (`layout.tsx:106-129`).

**All three of those copy strings promise that signing in is sufficient.** Under
any gating in section 5 that becomes false for a signed-in free-tier student, so
the copy has to move with the gate. Flagging it rather than fixing it, since which
copy is right depends on the decision.

`GumuGate.tsx` is not an entitlement gate despite the name. It hides the answer
key while a live GUMU conversation is running. The answer key itself is teacher
only and rendered absent rather than hidden (`quiz/page.tsx:137`), so it is
already closed to anonymous visitors and to students alike.

### 1.5 Chrome and identity

`TopicChrome` renders for anonymous visitors with `name` falling back to the
literal string `'Student'` and `role='student'` (`layout.tsx:51-52`). The nav
menu, the part indicator and the whole shell are drawn. Nothing in the chrome
signals that the visitor is not a customer.

### 1.6 What depends on this openness, and it is more than the funnel

This is the part I would not have predicted before looking.

`scripts/verify_auth_gate.mjs:84` names a course route as a **control that must
return 200 signed out**:

```js
const OPEN = ['/adaptive-test', '/course/tsia2/math/unit/1/topic/QR.1.1/lesson'];
```

That control exists so the suite cannot pass against a server that is down or a
middleware that redirects everything. Gating `/course` turns the control red, and
the fix is not cosmetic: the suite needs *some* route that is genuinely open to
prove it is measuring anything.

Beyond that, **fourteen further Playwright probes drive `/course` routes with no
session**, because there is no authenticated harness:

```
check_item_renders        verify_collapsible_units   verify_lesson_handoff
measure_topic_widths      verify_items_self_contained verify_lesson_outline
verify_practice_paging    verify_quiz_register        verify_modules_density
verify_topic_chrome       verify_quiz_finish          verify_topic_render
verify_reading_band       verify_topic_overview
```

Plus `verify_gumu_tier.mjs`, whose entire premise is a signed-out visitor
reaching a practice page and being graded.

The handoff records "the authenticated branch has no automated probe coverage" as
a known structural gap. Inverted, that reads: **the course tree's only automated
coverage is anonymous, so gating the tree removes the coverage on the same change
that adds the gate.** That cost belongs in the section 5 decision, not in a
footnote.

---

## 2. The capability map, as code

**REVISED TWICE ON 2026-08-19, AND IT WAS WRONG IN BOTH DIRECTIONS.** The
history matters more than the conclusion here, because both errors were made
from confident readings of written sources.

The first version took the shorthand in `sql/entitlement_columns.sql` literally:
"practice-pass: practice only ... NO GUMU, NO curriculum". The second version
overturned that on the strength of the live `/pricing` bullets, which name "Full
practice bank across all 97 topics" and "Progress tracking by topic" under
Practice Pass, and split curriculum into `curriculum-practice` and
`curriculum-lesson`.

**Both are withdrawn. The long-standing product boundary is the authority, and
neither the SQL shorthand nor the pricing copy stated it correctly.**

> **A Practice Pass holder never lands on a `/course` URL.** Practice Pass is the
> worksheet generator. Curriculum, lessons and GUMU are Full Course.

The pricing bullets are not evidence against that boundary; they are evidence
that the pricing copy is wrong, which is carried to section 6.

### 2.1 The capabilities

Two that matter to Phase 4, and two that do not.

```ts
import type { Plan } from "./products";

export type Capability =
  | "curriculum"         // the whole topic tree: lesson, practice, quiz, worked
                         // examples, completion gates. FULL COURSE ONLY.
  | "gumu"               // the Socratic tutor. Full Course only, plus the
                         // derived teacher path in section 3.
  | "worksheets"         // the generator. Practice Pass and above. NOT in
                         // /course, and not built yet.
  | "teacher-dashboard"; // /teacher and every teacher API route.

// Practice Pass named separately so Full Course is BUILT from it rather than
// restating it. The superset is a live public commitment, and a commitment
// expressed as two hand-maintained lists is one edit from breaking silently.
const PRACTICE_PASS: readonly Capability[] = ["worksheets"];

export const CAPABILITIES: Readonly<Record<Plan, ReadonlySet<Capability>>> = {
  "practice-pass": new Set(PRACTICE_PASS),
  "full-course":   new Set([...PRACTICE_PASS, "curriculum", "gumu"]),
  "teacher-core":  new Set(["teacher-dashboard", "worksheets"]),
  "teacher-pro":   new Set(["teacher-dashboard", "worksheets"]),
};

// Core and Pro differ by QUOTA, not by feature presence. null means unlimited.
// REGULAR_WORKSHEET_QUOTA is still unfilled and blocks nothing until worksheets
// ship.
export const WORKSHEET_QUOTA: Readonly<Record<Plan, number | null>> = {
  "practice-pass": REGULAR_WORKSHEET_QUOTA,
  "full-course":   REGULAR_WORKSHEET_QUOTA,
  "teacher-core":  REGULAR_WORKSHEET_QUOTA,
  "teacher-pro":   null,
};
```

`curriculum-practice` and `curriculum-lesson` do not exist. Four plan rows, no
fifth, and `profiles_plan_check` untouched: the plan VALUES were never wrong in
any version of this, only the prose about what they unlock.

### 2.2 The gate is one check at the course root

Every route in the tree requires the same thing, so there is no per-route map:

```
planGrants(plan, "curriculum") OR teacher-dashboard
```

evaluated once in `app/course/layout.tsx`, with the free topic as the single
exemption.

### 2.3 `/adaptive-test` is not plan-gated at all

Free to everyone including anonymous visitors, so it needs no capability. The
anonymous-versus-signed-in difference there already exists and is an AUTH check,
not an entitlement one: `app/api/items/reveal/route.ts:38-41` returns `isCorrect`
and `correct_answer` to anyone and withholds `explanation` and `distractor_note`
without a session. Phase 4 does not touch it.

### 2.4 Teachers reach the course tree by a second door, and the map is not widened

`teacher-core` and `teacher-pro` hold no `curriculum` capability, and that is
correct: the map is also the record of what each plan SELLS, and Teacher Core
does not sell student curriculum access.

But teachers must reach `/course`, because the teacher answer-key surface IS the
course tree: `topic-data.ts:112` calls `requireTeacher()` to decide whether to
read the base table, and `quiz/page.tsx:137` renders the answer key only for
them. A teacher who cannot open the topic their student is stuck on has no
product.

So the gate predicate carries both reasons, kept separately legible rather than
merged into the map. Worth recording, because it is how this nearly got missed:
**nothing under `app/teacher` links into `/course`.** Teachers arrive through
`/dashboard/modules`, which the dashboard layout admits them to read-only. The
path is real and undocumented, so a gate written from the teacher tree alone
would not have seen it.

### 2.5 What survives of the split's cost, which is much less than before

The previous revision claimed the split forced three surfaces beyond the gate.
**All three of those claims are withdrawn with the split.** There is no mid-topic
lock, so:

- `topic-parts.ts:9` ("No locked state. Nothing in the topic tree gates a route")
  and `TopicOverview.tsx:14-18` ("drawing a padlock would be inventing a lock
  that does not exist") **stay true.** No locked parts, no padlock, no upsell
  affordance inside a topic. That deliberate decision is not reversed.
- `loadNavigation`'s lesson to practice to quiz sequence is **untouched**.
- `topicPlan`'s resume needs **no special case**.

One thing does survive, and it is smaller and different in kind: **the free topic
grants `curriculum` but not `gumu`**, so a signed-in free-tier student on the
free topic is a state that does not exist today.

That is not a route lock, because GUMU is not a route. It is a panel that mounts
only when the grader says so. `gumu_available` initialises false and is set only
inside `if (session)` (`app/api/curriculum/practice/route.ts:100`, `:189`), so
the flag becomes `session && hasGumu`. And because `correct_answer` is withheld
exactly when `gumu_available` is true (`:205`), that student falls into the
behaviour the anonymous tier already has: the correct answer inline, no panel.
`verify_gumu_tier.mjs` already pins that pairing, which is convenient, since the
new state reuses a path rather than adding one.

### 2.6 What the free sample actually shows, which is less than "misconception feedback"

Flagging rather than resolving, because it affects how the sample is described
on the pricing page rather than how it is built.

The sample is required to show "the misconception feedback". **The curriculum
grader does not return a misconception to a student at any tier.**
`app/api/curriculum/practice/route.ts:193` is explicit: "The misconception slug
is internal taxonomy and is not returned: it means nothing to a student, and
echoing it back would put the tag map within reach of anyone probing option by
option." The tag is recorded for the teacher surface through
`record_misconception` and goes no further.

So a free-tier student on AR.1.4 who gets an item wrong sees: the item marked
wrong, and the correct answer inline. They do not see a named misconception, and
they do not see a worked solution either, because `loadEarnedSolutions` releases
one only for items already answered correctly or disclosed through GUMU's escape
hatch, and they have neither.

That is still a reasonable sample: the full lesson, ten real practice items, a
four item quiz, server-side grading, and the worked solution unlocking as they
get things right. It is just not what "misconception feedback" implies, and the
gap is in the description rather than in the product.

## 3. GUMU's two entitlement paths

Both must pass. Either alone is sufficient. A student in a teacher's class bought
nothing and must get in.

### 3.1 Path A, direct purchase

```
profile.plan grants "gumu"                          -> only full-course
AND isEntitled(profile.plan_status, profile.access_until)
```

Both halves. `planGrants` alone would admit a lapsed Full Course buyer;
`isEntitled` alone would admit an entitled Practice Pass buyer. `isEntitled`
already exists and already carries the grace interval and the expiry comparison
(`app/lib/entitlement.ts:59`). Nothing reimplements the comparison.

### 3.2 Path B, teacher assigned, derived live

Derived at read time, never copied onto the student row. `sql/entitlement_columns.sql:389-393`
records why: a copy goes stale the moment the teacher lapses, and a lapsed
teacher's class must stop granting.

```
class_enrollments  (student_id = X, status = 'active')
  -> classes       (archived_at is null)
    -> profiles    (id = classes.teacher_id)
         plan grants "teacher-dashboard"
         AND isEntitled(plan_status, access_until)
```

A student in several classes is entitled if **any one** teacher is entitled.

One PostgREST call, admin client, mirroring the embedded-select shape already
used at `app/api/gumu/session/route.ts:115` and `app/dashboard/data.ts:38`:

```ts
admin.from("class_enrollments")
  .select("status, classes(archived_at, profiles(plan, plan_status, access_until))")
  .eq("student_id", studentId)
  .eq("status", "active")
```

then `.some(...)` over the rows in memory. Row counts are trivial (5 classes, 3
enrolments today) and keeping the rule in one pure function means a harness can
run it without a database.

**Three traps in the existing code that this derivation must not inherit.**
RULED 2026-08-19: all three are to be fixed in the new derivation rather than
carried, and the existing call sites are left alone unless named otherwise.

1. **`.limit(1).maybeSingle()`.** `app/api/gumu/session/route.ts:119-120` takes the
   first enrolment only. That is correct for "who do I notify", and wrong for
   entitlement: a student whose first-returned class has a lapsed teacher would be
   denied even though a second class grants. The entitlement query must not limit.
2. **`status` is read two different ways today.** `dashboard/data.ts:42` filters
   `status !== 'removed'`; `gumu/session/route.ts:118` filters `status === 'active'`.
   The handoff records the column as `status='active'` with `enrolled_via` in
   `('join_code','teacher_invite')`. Recommend `= 'active'`, which fails closed on
   any third value. Logging the inconsistency as a pre-existing defect rather than
   fixing it here.
3. **`archived_at` is honoured in one place and not the other.**
   `dashboard/data.ts:50` filters archived classes out; the GUMU teacher lookup
   does not. An archived class must not grant, so the entitlement query filters it.

Trap 2's resolution is `= 'active'`, chosen because it fails closed on any third
value the column might ever carry. Trap 1's is: no `.limit(1)`, evaluate every
active enrolment, and grant if any one teacher is entitled.

### 3.3 The derived path grants the full-course set, not just `gumu`

Stating this explicitly because it looks like an invented fifth row and is not.

GUMU is only reachable from inside a curriculum page. He is introduced on the quiz
page and opens from a graded wrong answer on practice or quiz. A student granted
`gumu` but not `curriculum` cannot reach any surface on which GUMU exists, so the
grant would be inert.

So Path B resolves to **the `full-course` capability set**, sourced from the
teacher's entitlement rather than from a purchase. The plan column on the student
row stays null, because they bought nothing and nothing should suggest they did.

### 3.4 Where it is enforced

| Point | File | Role |
|---|---|---|
| `POST /api/gumu/session` | `app/api/gumu/session/route.ts:177` | **Authoritative.** Extend the existing 401 with the entitlement check |
| `gumuAvailable` | `app/api/curriculum/practice/route.ts:100,189` | Controls whether the panel mounts **and whether `correct_answer` is withheld** |
| Page render | `quiz/page.tsx`, `practice/page.tsx` | Presentation only |

The middle row carries a coupling worth naming: withholding `correct_answer` is
currently tied to GUMU availability, so any change to who has GUMU silently changes
who is handed the answer. Under the map that pairs correctly (full-course grants
both), but the two should be decided from the entitlement rather than from each
other.

### 3.5 Cost and caching

One extra query per gated request on Path B. Wrap the resolver in React `cache()`
keyed on the student id, exactly as `loadTopic` and `loadGates` already are, so a
page pays for it once rather than once per part. **Per-request only.** Nothing
cross-request: a teacher lapsing must take effect on the student's next page load,
which is the entire reason this is derived rather than stored.

---

## 4. Moving the six `subscription_status` readers onto `isEntitled`

Nothing drops the column until every reader has moved. All six, located:

| # | Reader | File and line | Gates what | Kind |
|---|---|---|---|---|
| 1 | `requireTeacher()` | `app/lib/auth.ts:56` select, `:61` test | Teacher answer key on every topic page, and every teacher API route | **Real gate, widest blast radius** |
| 2 | `TeacherPage` | `app/teacher/page.tsx:22` select, `:29` test | `/teacher`, redirects to `/teacher/inactive` | Real gate |
| 3 | `TeacherSettingsPage` | `app/teacher/settings/page.tsx:29` select, `:36` test | `/teacher/settings`, same redirect | Real gate |
| 4 | `getProfile()` into `DashboardLayout` | `app/lib/auth.ts:81` select, consumed `app/dashboard/layout.tsx:46` | Nothing. Passed to the shell as a prop | Plumbing |
| 5 | `StudentNav` badge | `app/components/StudentNav.tsx:163` | Cosmetic `PRO` / `PREVIEW` chip | Cosmetic |
| 6 | `Header` nav role | `app/components/Header.tsx:68` select, `:72` test | Cosmetic nav shape. **Client side, browser anon key** | Cosmetic |

Reconciling with the handoff's table: `topic-data.ts:112` is a *call* to
`requireTeacher()`, not an independent read, so it is covered by row 1 and is not
a seventh site. Rows 2 and 3 are one entry in the handoff and two files here.

### 4.1 Order, and why

**1. `app/lib/auth.ts`, shape only.** Widen `Profile` and both selects to carry
`plan`, `plan_status`, `access_until`. Purely additive, no behaviour change, and
every other reader gets its data through this. Doing it first means the five
downstream moves are each a one-line predicate swap rather than a query change.

*The failure mode if this is skipped or done partially:* both helpers currently
select `id, role, subscription_status` only. `isEntitled(undefined, undefined)`
returns false, so a reader moved before its select is widened denies everyone,
including every teacher. Loud, immediate, and worth stating because it is the
whole reason the shape moves first.

**2. Cosmetic readers, 5 and 6.** Nothing breaks if they are wrong, so they are
where the new predicate gets exercised before a gate depends on it. Row 6 should
additionally stop reading `profiles` from the browser and take a server-fed prop;
it is the user's own row under RLS so there is no new leak, but a nav that
decides its own shape from a client-side query is the wrong place for entitlement
logic to live.

**3. Plumbing, row 4.** `DashboardLayout` passes the flag through to
`StudentShell`. Moves with row 5 or immediately after.

**4. Narrow gates, rows 2 and 3.** Two files, identical predicate, same redirect
target. Real behaviour, small radius.

**5. `requireTeacher()`, row 1, last.** It gates the answer key on every topic
page and every teacher API route. Everything else having moved first means it is
the only thing left changing when it changes, which is what you want from the
widest one.

Rows 1, 2 and 3 become `planGrants(plan, "teacher-dashboard") && isEntitled(...)`,
which is a genuine tightening: today an active *student* row promoted to
`role='teacher'` by any of the three promotion paths in handoff 3.2 passes the
teacher gate. That is the child safety exposure in handoff section 7, and this is
the change that closes it.

### 4.2 The blocker on dropping the column

**`legacyActivateOnly` (`app/lib/stripe-activation.ts:171`) writes
`subscription_status: "active"` and deliberately writes no `plan` and no
`plan_status`,** because writing one without the other violates
`profiles_plan_pairing_check`. It fires when a checkout arrives on a Payment Link
this build does not know, which is exactly a link created after the current
deploy.

A reader moved to `isEntitled` reads `plan_status = null` on such a row and
**denies**. The fallback that exists to keep a buyer from paying for nothing turns
into the thing that locks them out.

Options:

- **(a) Make the fallback write a plan.** It cannot: it does not know which product
  was bought, and the pairing constraint forbids half a row.
- **(b) Accept both during the transition.**
  `isEntitled(...) || subscription_status === 'active'`, with a logged warning on
  the second branch. This is literally what "nothing drops the column until every
  reader has moved" already commits to, and the log makes the fallback's use
  visible instead of silent.

**RULED 2026-08-19: (b), accepted.** Readers take
`isEntitled(...) || subscription_status === 'active'` during the transition, with
a logged warning on the second branch so the fallback's use is visible instead of
silent.

**`legacyActivateOnly` (`app/lib/stripe-activation.ts:171`) is the named blocker
on dropping `subscription_status`.** The column cannot be dropped while that
function can still write a plan-less active row. Resolving it is its own change,
most likely resolving the product with a `paymentLinks.retrieve` before falling
back, and it is a precondition for the drop rather than part of Phase 4.
Resolving that is its own change (most likely: resolve the product with a
`paymentLinks.retrieve` before falling back), and it is a precondition for the
drop rather than part of Phase 4.

Two things that are *not* blockers, checked:

- The Phase 2 backfill wrote `plan='teacher-core'`, `plan_status='active'`,
  `access_until=null`, `plan_source='migration'`. `isEntitled` returns true on a
  null `access_until` (`entitlement.ts:65`), so no existing teacher, comped or
  paying, loses access when the readers move.
- The 22 student rows carry a null plan and are `inactive` today, so they are
  denied identically before and after. No student entitlement exists to migrate.

---

## 5. The decision, ruled

**RULED 2026-08-19. Nothing here is open.** Recorded with the reasoning, and with
two arguments that were made for this option and are now wrong, because a
justification that has stopped being true should not be left standing.

### 5.1 The tiers

| Tier | Curriculum | Everything else |
|---|---|---|
| **anonymous** | **None. No topic, not even the free one.** | The CAT engine at `/adaptive-test`. No score breakdown, no rationale on any question |
| **signed in, free** | **One free topic. See 5.1a for exactly what that is** | Everything anonymous gets, plus saved results, progress, class join, dashboard |
| **practice-pass** | **None. A Practice Pass holder never lands on a `/course` URL** | The worksheet generator, when it ships |
| **full-course** | The whole topic tree, all topics, plus GUMU | plus worksheets |
| **teacher tiers** | Curriculum read, for the answer-key surface. See 2.4 | Dashboard, worksheets |

### 5.1a What the free sample actually is

**CORRECTED 2026-08-19.** An earlier version of this section said the sample
shows "the misconception feedback". That was wrong, and the error was in the
description rather than in the product. The sample is:

- the full guided-notes lesson
- ten interactive practice items
- a four item mini quiz
- server-side grading on every item
- the correct answer inline on a miss
- worked solutions unlocking as the student gets things right

**No named misconception, and no GUMU.**

`app/api/curriculum/practice/route.ts:193` withholds the misconception slug from
students at every tier, and that is correct and stays: relaxing it for a free
tier would reopen the answer-key extraction surface through a side door, since
the tag map is probeable option by option. It is not being touched.

That is still enough to judge the product, and it does not change the free-topic
decision. What it does change is how the free tier is described on `/pricing`,
which is carried to section 6.

Two things this shape does deliberately.

**Anonymous keeps exactly the surface it already has.** The CAT engine, with
`explanation` and `distractor_note` withheld, which is what the June security
session built and what `/api/items/reveal` already enforces. Phase 4 removes
anonymous curriculum access rather than designing a new anonymous tier.

**The free topic excludes GUMU.** GUMU is the Full Course differentiator, and a
sample that included it would give away the thing the $89 buys. The sample still
shows the lesson, the practice, the quiz, and the named misconception on a wrong
answer, which is enough to judge the product.

### 5.2 The free topic: AR.1.4, and the data decides it

The two candidates were the topics the probes already use. Read from production:

| | practice interactive | practice items | with misconception tags | mini quiz | tagged |
|---|---|---|---|---|---|
| **AR.1.4** | **yes** | 10, all multiple choice | **10 of 10** | 4, interactive | **4 of 4** |
| QR.1.1 | **no** | 12, only 3 multiple choice | **0** | 4, interactive | **0** |

`AR.1.4`, "Distinguishing function types (linear, quadratic, exponential)", 50
minutes.

QR.1.1 is disqualified by the ruling itself rather than by preference. The
sample is required to show "the misconception feedback", and **QR.1.1 carries no
misconception tags anywhere**, in either section. Its practice is also written
work with nothing to submit, which is why `practice/page.tsx:57` has a whole
non-interactive branch naming it. So a QR.1.1 sample would show a static page of
text where the practice should be, grade four quiz questions, and diagnose
nothing. It would demonstrate the absence of the two features Practice Pass is
sold on.

AR.1.4 is also the standard shape, 10 plus 4, every item multiple choice, every
item diagnosing. A sample should show the product working normally, not one of
its two exceptions.

### 5.3 The arguments for this option that have stopped being true

**The no-login hallway demo does not survive the correction.** The original case
for one free topic was that a teacher showing a colleague needs something to
show, and that no-login access is worth real money in a teacher-first word of
mouth motion. Under this ruling the colleague has to sign in first, so that
argument is gone. What remains is narrower and still holds: asking someone to pay
$89 with no preview of the actual product is a hard ask, and a signed-in free
sample is a normal funnel.

**The probe-coverage argument is also gone, and it was mine.** I recommended
option B partly because it would keep the anonymous Playwright suite alive by
repointing it at the free topic. Under this shape the free topic requires a
session, the harness cannot complete a Google OAuth sign-in, and so the probes go
dark exactly as they would under a hard gate. **Option B no longer preserves the
harness.** That was the load-bearing half of my recommendation and it does not
survive.

### 5.4 The coverage loss, stated plainly

Sixteen scripts reference `/course`. Fifteen drive it as their subject in a real
browser with no session, and `verify_auth_gate.mjs:84` names a course lesson
route as a control that must return 200 signed out.

All of that goes dark. Specifically:

- `verify_auth_gate.mjs`'s OPEN control loses its course entry and is left with
  `/adaptive-test` alone. Still a valid control, since it still proves the server
  is up and not redirecting everything, but it is down to one route.
- `verify_gumu_tier.mjs` cannot run at all: its entire premise is a signed-out
  visitor reaching a practice page and being graded inline.
- The topic render, chrome, reading band, paging, quiz register, quiz finish,
  lesson outline, lesson handoff, collapsible units, item render and width probes
  all lose their subject.

**The authenticated branch still has no automated probe**, which the handoff has
recorded as a known structural gap since Phase 1. Phase 4 does not close it and
makes it bite for the first time. An exact per-script audit belongs in the build,
not in an estimate here, and I will report the real number rather than this one.

That is the cost of the ruling. It is a real cost and it is not an argument
against the ruling, which was taken on product grounds.

## 6. Not in scope for Phase 4, logged

- `legacyActivateOnly` cannot name a product, which blocks dropping
  `subscription_status`. Section 4.2.
- `.limit(1)` on the GUMU teacher lookup, the two readings of
  `class_enrollments.status`, and `archived_at` honoured in one query and not the
  other. Section 3.2. Pre-existing, untouched.
- `REGULAR_WORKSHEET_QUOTA` has no value anywhere. Section 2. Needed before
  worksheets ship, not before Phase 4.
- `findUserIdByEmail` still scans 50 pages of the auth admin API though
  `profiles.email` exists. Carried from Phase 3.
- The three role-promotion paths in handoff 3.2. Path 1 is live and is Phase 5's.
- Teacher verification, and what a paid but unverified teacher sees. Handoff
  section 7.
- GUMU crisis escalation. Handoff section 7, and the highest priority item on
  that list.

---


### Carried out of Phase 4 by ruling, 2026-08-19

**The `/pricing` copy for Practice Pass is wrong and needs rewording.** "A worked
solution on every problem" does not describe what a Practice Pass holder gets: a
Practice Pass holder never reaches a `/course` URL, so they meet worked reasoning
through the CAT engine rationale and through worksheet solutions, neither of
which is a "worked problem" in the sense that bullet implies. The other bullets,
"Full practice bank across all 97 topics" and "Progress tracking by topic", are
what misled this document into splitting the capability model, so the copy has
cost something already.

**The free tier's description on `/pricing` will need to match section 5.1a.**
Once the free sample ships, the pricing page has to say what it actually
contains, and in particular must not promise named misconception feedback, which
no student sees at any tier.

Both are marketing-repo changes, in `unpackmath-home`, and belong in
`legal-audit-2026-08.md` with the other defects. Neither is in this repo and
neither can be fixed from here.

**The probe gap, with one addition to the audit commitment.** Section 5.4 commits
to a per-script audit of what goes dark. Ruled addition: **before trusting any
repaired probe, make it fail on purpose.** A probe that has never failed is a
probe that has not been verified. That is the same standard as everywhere else in
this repo, and it matters more here than usual, because the suite currently
reports green while covering almost nothing Phase 4 touches. A repaired probe
that silently stopped asserting would leave the suite green and the tree
unguarded, which is worse than a probe that is honestly dark.

## 7. Reachability requirements for the build

Phase 4 is a gate, and a gate is entirely about reachability. The lesson carried
forward from the crisis-screen work is that assertions prove what code DOES, not
whether a branch is REACHABLE: the fault-proof there passed against a version
whose success path fell through to a 500, because every assertion was about
behaviour and none about reachability. Review caught it, the harness could not
have. So these are stated as build requirements rather than left to a check.

All four were accepted 2026-08-19 and are not optional.

### 7.1 The gate runs before `loadTopic`'s `notFound()`

`loadTopic` calls `notFound()` for an unknown topic. If the gate runs after it, an
unentitled visitor distinguishes a 404 from a gate response and can enumerate
every valid topic id. If it runs before, they cannot. Cheap to get right and
silent if got wrong.

### 7.2 An unreadable path must DENY, and the existing helper cannot express that

A `/course`-level layout receives no route params, so the gate reads the path from
the `x-pathname` header middleware already stamps. That is the same mechanism the
chrome uses through `app/lib/topic-part-route.ts`.

**That helper must not be reused for the gate as-is.** `activeTopicPart` returns
`null` for four different situations: a missing header, a path with no `topic`
segment, a valid topic path with no part (the doorway), and an unrecognised part.
Collapsing them is right for chrome, where every null renders no indicator, and
wrong for a gate, where "the doorway, allow if either capability" and "I could not
read this, deny" must be different answers.

So the gate needs its own parser returning a discriminated result, something like
`{ kind: "topic", topicId } | { kind: "unreadable" }`, pure and unit-testable,
same discipline as `topic-part-route.ts` itself. The part is no longer needed,
since every route in the tree requires the same capability, so the only two
questions are which topic and whether the path could be read at all.

**`unreadable` fails CLOSED and reports to Sentry.** Denying alone is not enough:
a header-read failure is a real defect, and if it only ever manifests as a locked
out customer it will reach us as a support ticket with no diagnostic attached.
Reporting it means the failure surfaces as the bug it is rather than as free
access or as a mystery. Sentry is already wired (`sentry.server.config.ts`,
`instrumentation.ts`); there are no explicit `captureException` call sites in
application code today, so this would be the first.

### 7.3 The gated layout sets `force-dynamic` explicitly

`app/course/layout.tsx` sets nothing today because it reads nothing. Reading
cookies would make it dynamic in practice, but the failure being avoided is a
cached gated page served to someone who should not have it, so it is declared
rather than inferred. The topic layout already sets it.

### 7.4 `/api/curriculum/practice` does not inherit the page gate

It accepts anonymous callers and returns `correct_answer` on every graded
submission, so gating pages alone leaves the answer key extractable at one request
per item. It must gate separately, on `curriculum`.

**The free-topic exemption comes from ONE shared constant** that both the layout
and the route import. Two copies will disagree, and the disagreement will be
silent: the page would gate a topic the endpoint still grades, or the reverse.

### 7.5 Where the gate lives, and the tension in it

`app/course/layout.tsx` is the one place all four routes must pass through, which
is what makes a fifth sub-route impossible to add ungated. That is the reasoning
`middleware.ts:33-35` already gives for keeping the dashboard gate in a layout.

The load-bearing reachability fact is already verified in this repo rather than
assumed from framework docs: the topic layout's placeholder branch notes that not
rendering `{children}` means the page component is never invoked, because a server
component is only a description until React renders it, so `loadNavigation` and
`loadGates` never run. A `redirect()` thrown from the layout has the same
property.

---

## 8. Build order

Shorter than the previous revision, because the capability collapse removed three
steps.

1. `app/lib/capabilities.ts`, runtime-pure, plus the free-topic constant. Tests
   first: the superset property, and the free topic granting `curriculum` but
   never `gumu`.
2. The path parser from 7.2, pure and faulted, with `unreadable` proved to deny
   AND proved to report.
3. The entitlement resolver: direct plan, the derived teacher path with all three
   traps in 3.2 fixed, and the teacher-dashboard second door.
4. The gate in `app/course/layout.tsx`, before `loadTopic`, `force-dynamic`.
5. `/api/curriculum/practice`: the `curriculum` check, the `gumu_available`
   change from 2.5, and the free-topic constant shared with step 4.
6. The six readers, in the order in section 4.1.
7. Probe audit, and every repaired probe shown failing before it is trusted.

Steps 1 through 5 are the gate. Step 6 is independent of it and could be its own
review. Step 7 depends on 1 through 5 being done.

REMOVED from the previous revision, with the capability split: `TopicOverview`
locked parts, `loadNavigation` skipping, and `topicPlan` resume special-casing.
None of those are needed.
