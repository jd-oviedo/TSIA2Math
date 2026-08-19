# Phase 4, the student entitlement gate. Design report.

*August 19, 2026. Branch `feat/entitlement-columns`.*

> ## STATUS: DESIGN. NOT BUILT.
>
> No code has been written against this document. `/course` still has no auth
> gate of any kind, `app/course/layout.tsx` is still a twelve-line passthrough,
> and every topic is still readable by an anonymous visitor. Section 5 records an
> OPEN decision that is deliberately not resolved here, and no work should start
> until it is answered.
>
> **Parked behind the GUMU crisis screening work** as of 2026-08-19, by decision.
> See `gumu-crisis-screen-design.md`, which is itself blocked on counselor input.

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

Proposed new module `app/lib/capabilities.ts`, held to the same discipline as
`app/lib/products.ts`: every import `import type` only, so `node --test` can load
it without a bundler and the map can be asserted directly.

```ts
import type { Plan } from "./products";

export type Capability =
  | "practice"           // /adaptive-test, the CAT practice test
  | "worksheets"         // the worksheet generator, when it ships
  | "curriculum"         // the /course tree: lesson, practice, quiz
  | "gumu"               // the Socratic tutor
  | "teacher-dashboard"; // /teacher and every teacher API route

// Practice Pass, named separately so Full Course can be BUILT from it rather
// than restating it. The superset is a live public commitment (the pricing page
// reads "EVERYTHING IN PRACTICE PASS, PLUS"), and a commitment expressed as two
// hand-maintained lists is one edit away from being broken silently.
const PRACTICE_PASS: readonly Capability[] = ["practice", "worksheets"];

export const CAPABILITIES: Readonly<Record<Plan, ReadonlySet<Capability>>> = {
  "practice-pass": new Set(PRACTICE_PASS),
  "full-course":   new Set([...PRACTICE_PASS, "curriculum", "gumu"]),
  "teacher-core":  new Set(["teacher-dashboard", "worksheets"]),
  "teacher-pro":   new Set(["teacher-dashboard", "worksheets"]),
};

// Core and Pro differ by QUOTA, not by feature presence, so the difference is a
// number and not a capability. null means unlimited.
export const WORKSHEET_QUOTA: Readonly<Record<Plan, number | null>> = {
  "practice-pass": REGULAR_WORKSHEET_QUOTA,
  "full-course":   REGULAR_WORKSHEET_QUOTA,
  "teacher-core":  REGULAR_WORKSHEET_QUOTA,
  "teacher-pro":   null,
};

export function planGrants(plan: Plan | null | undefined, cap: Capability): boolean {
  return plan != null && (CAPABILITIES[plan]?.has(cap) ?? false);
}
```

Four rows, matching `sql/entitlement_columns.sql:177-185` exactly. No fifth row.

**Two things about the shape, both deliberate:**

*The superset is structural, not documented.* `full-course` is spread from
`PRACTICE_PASS`, so it cannot narrow by editing one list. A test asserts that
every Practice Pass capability is in Full Course, which is the published promise
stated as an assertion rather than a comment.

*Core and Pro hold the same capability set.* Their difference is
`WORKSHEET_QUOTA`, which is what "differ by quota, not by feature presence"
means when written down. `REGULAR_WORKSHEET_QUOTA` is an unfilled number: the map
says "regular access" and does not say how many. Worksheets have not shipped, so
this blocks nothing now, but it is an input that will be needed and is not
currently recorded anywhere.

**One naming collision that will cause a real bug if it is not called out.**

`/course/[test]/[subject]/unit/[unit]/topic/[topicId]/**practice**` is a
curriculum route. It is Part 2 of a topic, it lives inside the curriculum, and it
belongs to the `curriculum` capability, **not** to the `practice` capability. The
`practice` capability is `/adaptive-test`, which is what the student nav calls
"Take a Practice Test" (`StudentNav.tsx:41`).

So the map's "practice only ... No GUMU, no curriculum" reads, concretely:

- practice-pass **does** unlock `/adaptive-test` and the future worksheet generator
- practice-pass **does not** unlock `/course/.../practice`, despite the URL

I am reading the map literally rather than resolving it. If the intent was that
Practice Pass buys the topic practice sections too, that is a different product
and the section 5 answer changes with it, so it is worth a sentence of
confirmation even though I believe the literal reading is right.

---

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

**Three traps in the existing code that this derivation must not inherit:**

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

**Recommend (b).** With the consequence recorded plainly: the column cannot be
dropped while `legacyActivateOnly` can still write a plan-less active row.
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

## 5. The open decision, for you

**Not resolved here. Stating the options, the tradeoffs and a recommendation, and
stopping.**

The question: after gating, what do an anonymous visitor and a signed-in
free-tier student see in `/course`?

They may deserve different answers, and it is worth deciding both. A signed-in
free-tier student is 22 of the 32 existing profiles.

The tension is real in both directions. Leaving `/course` open means the $89
product unlocks nothing (section 0). Closing it takes away the anonymous funnel
into the curriculum *and* the course tree's only automated test coverage
(section 1.6).

### Option A. Hard gate the whole tree

Signed out redirects to `/login?next=`. Signed in without `curriculum` gets an
upgrade holding page.

- Closes the leak completely, including the answer extraction in section 1.2.
- Simplest to implement and to reason about: one check in `app/course/layout.tsx`,
  nowhere for a fifth sub-route to slip past, matching the pattern
  `verify_auth_gate.mjs` already exists to protect on `/dashboard`.
- Removes the anonymous curriculum funnel entirely. `/adaptive-test` becomes the
  only open product surface.
- Turns `verify_auth_gate.mjs:84`'s OPEN control red and breaks all fourteen
  anonymous course probes plus `verify_gumu_tier.mjs`. Restoring coverage needs an
  authenticated Playwright harness, which does not exist today and is not a small
  piece of work.

### Option B. One free topic, everything else gated

A named topic (or a named unit) stays open; the rest requires `curriculum`.

- Preserves a real anonymous funnel with real content to show.
- Preserves the probe suite by pointing it at the free topic, which is roughly a
  one-constant change across the fourteen scripts rather than an authenticated
  harness. `verify_auth_gate.mjs` keeps a legitimately open control.
- Bounds the answer extraction to one topic's items instead of 1,358.
- Costs one real topic of content, given away permanently.
- Adds an allowlist that has to stay honest, and a second thing to remember when
  topics are added. Mitigated by keeping it a single exported constant that both
  the gate and the probes import.
- `QR.1.1` (the auth-gate control) and `AR.1.4` (the GUMU tier probe) are the two
  the probes already use, so the choice is not free-form.

### Option C. Lesson open, practice and quiz gated

- Matches a familiar shape: read the notes, pay to practice.
- Closes the interactive surface, which is where the grading endpoint leaks
  answers.
- **Gives away the most content of any option.** `guided_notes` is the bulk of the
  authored value on a topic, and this hands over all 97 topics' worth.
- Splits the probe suite: lesson probes keep passing anonymously, practice and
  quiz probes still need auth. Partial coverage loss rather than total.
- The `/api/curriculum/practice` leak is **not** bounded by this option, since
  gating the page does not gate the endpoint.

### Option D. Metered preview

First N topics, or first visit, then gate.

- Best funnel of the four.
- Most code, and it needs durable anonymous state, which is precisely the thing
  this app deliberately does not keep (section 1.2: nothing is written for an
  anonymous visitor). Cookie-based metering is trivially reset.

### Recommendation

**Option B, one free topic.** It closes the $89 leak, keeps an anonymous funnel
with something real in it, bounds the answer extraction, and is the only option
that keeps the course tree's automated coverage alive through the change that
gates it. A is cleaner to build and pays for that by deleting fourteen probes on
the same day the tree gets its first gate. C gives away more than it protects.

**Independent of which option you pick:** `POST /api/curriculum/practice` must be
gated in the same change. Gating pages alone leaves the answer key extractable at
one request per item for whatever remains open, and under C that is not bounded at
all. The endpoint should require the same `curriculum` capability the page does,
with the free-topic exemption under B applied in one shared place so the page and
the endpoint cannot disagree.

And the three copy strings in section 1.4 need to change with whatever is decided,
because all three currently promise that signing in is enough.

---

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

## 7. What I need before writing code

1. The section 5 decision: what anonymous and free-tier visitors see, and whether
   those two answers differ.
2. Confirmation of the section 2 reading, that `practice-pass` does not unlock
   `/course/.../practice` despite the route name.
3. Acceptance of option (b) in section 4.2, that readers accept
   `isEntitled(...) || subscription_status === 'active'` during the transition and
   the column cannot be dropped until `legacyActivateOnly` is resolved.

Stopping here.
