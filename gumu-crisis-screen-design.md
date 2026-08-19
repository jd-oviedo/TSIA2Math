# GUMU crisis screening. Design report.

*August 19, 2026. Branch `feat/entitlement-columns`.*

> ## STATUS: DESIGN. NOT BUILT, NOT APPLIED.
>
> This document being committed does not mean any of it exists. As of the commit
> that added it:
>
> - **No code has been written.** There is no `app/lib/crisis.ts`, no screen in
>   `app/api/gumu/session/route.ts`, no resource card in `GumuChat.tsx`.
> - **The DDL in section 3.2 has NOT been run.** `gumu_sessions.status` still
>   admits only the original four values and there is no `support_detected_by`
>   column. Do not assume the constraint is widened.
> - **GUMU is live in production with no crisis handling of any kind.** That is
>   the condition this document describes and proposes to change, not a condition
>   it has changed.
> - **Three items are unresolved placeholders** awaiting a school counselor,
>   marked `[COUNSELOR]` and `[COUNSELOR?]` inline throughout and listed in
>   section 8. The student-facing strings in section 2.2 are literally
>   `[PLACEHOLDER, COUNSELOR]` and must not be shipped as written.
>
> The one thing here that HAS shipped is the rate limiter reorder in section 6,
> committed separately as `3fba12d`. Everything else in this file is a proposal.

Ahead of Phase 4 by decision, 2026-08-19. Two items are explicitly NOT designed
here and are marked `[COUNSELOR]` throughout: the exact wording shown to a
student, and whether teacher notification is appropriate at all. A third,
`[COUNSELOR?]`, I am raising because the design has to accommodate it either
way.

---

## 0. What changes, in one view

Current `message` path, `app/api/gumu/session/route.ts`:

```
rate limit (IP) :152  ->  parse :158  ->  schema :165  ->  auth :171
  ->  session lookup :312  ->  loadItem :327  ->  reveal? :348
  ->  status active? :360  ->  history :367
  ->  INSERT student message :373        <-- disclosure persisted here
  ->  askGumu :389                       <-- disclosure enters the tutoring loop
```

Proposed:

```
auth  ->  rate limit (user)  ->  parse  ->  schema
  ->  session lookup  ->  reveal?  ->  status active?
  ->  SCREEN                             <-- new branch, before any write
       |
       +-- hit  -> terminate session, return resources, NOTHING written to gumu_messages
       |
       +-- clear -> loadItem -> history -> INSERT student message -> askGumu
```

Three separable changes: the screen and its stop behavior, one DDL statement, and
the rate limiter reorder. The notification path is a fourth and is not decided
here.

**Scope note.** Only `action === "message"` carries student free text. The `start`
action's opening turn is composed server side from the item stem and choices
(`route.ts:267-275`), and `reveal` carries no text at all. So the screen has
exactly one entry point, which is a smaller surface than it first appears.

---

## 1. The screening layer

### 1.1 Where the branch goes

Between the status check at `:365` and the history read at `:367`.

That position is chosen for four reasons, all load-bearing:

- **Before `gumu_messages`.** The insert is at `:373`. Screening after it would
  persist the disclosure before deciding what to do about it, and the fix would
  then be a delete, which is worse (section 5.2).
- **Before `askGumu`.** The tutoring model never sees a screened message.
- **After session ownership.** `:312-319` scopes the lookup with
  `.eq("student_id", studentId)`, so only a message on the caller's own live
  session is ever screened. Screening earlier would run the classifier on requests
  for sessions that do not exist.
- **Before the history read and `loadItem`.** No point paying for the transcript
  or the curriculum row on a turn that is about to stop. `loadItem` currently sits
  at `:327`, above the reveal branch, so it stays where it is for `reveal`'s sake;
  the screen simply runs before the history read.

### 1.2 Why this is a branch and not a prompt

The current system prompt at `gumu.ts:22` reads:

> "If they express frustration, be encouraging and lighten the tone, but keep
> guiding rather than solving it for them."

That is the only instruction covering a student in difficulty and it points the
wrong way. Rewording it does not fix the class of problem, for reasons the
codebase already documents about itself:

- `gumu.ts:19-21`: *"The model is asked for one thing per call, the next message,
  and is never asked to track turns, decide when to stop, or judge its own
  output."* Safety triage is a second thing per call.
- `gumu.ts:49-51`, on em dashes: *"a prompt instruction is a preference, not a
  guarantee, the same reason the leak check exists."* The repo already treats
  prompt instructions as unreliable and backs the important ones with a
  deterministic check. This is the important one.
- `askGumu` retries up to twice and can substitute `SAFE_FALLBACK_MESSAGE`
  (`:288-309`). A safety signal riding on the reply schema can be discarded by
  that ladder.

So the screen is a separate decision, made before the tutoring call exists.

### 1.3 Shape: a floor and a primary

Two detectors, layered. This is not a cost optimization, it is a fail-safe
structure, and section 5.1 argues the point properly.

**The floor: a lexical check.** Deliberately narrow and high precision. It catches
only unambiguous explicit statements. Runtime pure, no network, no model, held in
`app/lib/crisis.ts` under the same discipline as `app/lib/products.ts` (every
import `import type`) so `node --test` can load and fault it directly.

Narrow on purpose. A broad keyword net is where the false positives live: "this
problem is killing me" and "I'm dying" are ordinary frustrated-teenager register
in the middle of algebra, and a net wide enough to catch indirect disclosure is
wide enough to catch those constantly. The floor exists to be right when it fires,
not to catch everything.

**The primary: a dedicated classifier call.** A small fast model (Haiku 4.5), tight
JSON schema, single graded enum, low `max_tokens`. It runs when the floor does not
fire. Its advantage over the floor is precisely the case the floor cannot do:
telling hyperbole apart from disclosure, and catching indirect disclosure that
contains no keyword at all ("what's the point", "everyone would be better off
without me").

**Grade, act on one threshold.** The classifier should return a graded value even
if v1 collapses everything above `none` into a single stop. That makes adding a
gentler middle tier later a code change rather than a reclassification, and it
keeps the tuning data at full resolution. See `[COUNSELOR?]` in section 8.

### 1.4 Failure direction, which is not obvious

`safeLimit` fails **open** for rate limiting and says why (`rate-limit.ts:89-93`):
rate limiting is auxiliary, and 500ing every request because Redis hiccuped is
worse than briefly having none. That reasoning does not transfer here, and neither
does its opposite.

- Fail open (classifier errors, proceed to tutoring): the protection is absent
  exactly when infrastructure is degraded. That is the failure we are fixing.
- Fail closed (classifier errors, show resources): a model outage shows crisis
  resources to every student mid-algebra, at maximum scale. That is the systemic
  corrosion in section 5.1 at its worst.

Neither is acceptable, so the failure direction is a third thing: **never tutor an
unscreened message, and never show crisis resources on an infrastructure error.**

On classifier failure, the floor's verdict stands if it fired. If it did not, the
turn is refused with the existing 503 `"GUMU is unavailable right now"`
(`route.ts:392`), which already exists, already reads correctly to a student, and
correctly says nothing about why. The student's turn is not consumed and their
message is not persisted.

This is the reason the floor is worth having at all. It is not there to save a
model call, it is there so that a classifier outage degrades to reduced sensitivity
rather than to none.

**Related, worth fixing in the same pass:** that 503 is currently returned for both
a model refusal (`gumu.ts:228-230`) and a network failure, and the two are
indistinguishable in the logs. With a screen in front, refusals should become rare,
and a refusal that still happens is a signal that the screen missed something.
Distinguishing them costs one log field.

---

## 2. The stop behavior

On a hit, in this order:

1. **No tutoring.** `askGumu` is not called. No Socratic follow-up, no
   encouragement, no "let's keep going".
2. **Nothing written to `gumu_messages`.** Achieved by ordering, not by a delete.
   See 5.2 for where it goes instead.
3. **The session is terminated** with the new status (section 3). It does not go
   through `resolveFlagged`, deliberately: that function's whole body is the math
   endings and the teacher notification, and the notification decision is pending
   (`[COUNSELOR]`, section 4).
4. **The student sees resources**, as a terminal card, not a chat bubble.

### 2.1 The write must not gate the response

The status update can fail. It will certainly fail if the DDL in section 3 has not
run yet, and it can fail for ordinary reasons afterwards.

**The student sees the resources regardless.** The response is composed and
returned whether or not the write succeeded; the write error is checked and logged
loudly. This is the inverse of the `resolveFlagged` bug that `c5819bc` fixed: there
the error was unchecked and the failure was silent, here the error must be checked
and must not block the thing that matters.

### 2.2 Response shape and the client contract

`GumuChat.tsx:127` does this unconditionally on every `message` response:

```js
setMessages((m) => [...m, { role: 'gumu', content: data.message }]);
```

**So if the crisis response reuses the `message` field, the crisis text renders as
a GUMU chat bubble, in GUMU's voice, as a turn in the conversation.** That is the
wrong presentation for this content and the client must branch before that line.

The response therefore carries a discriminator and **no `message` field at all**,
so a client that fails to branch renders nothing rather than rendering crisis text
styled as tutor speech:

```
{
  session_id,
  status:    <new terminal status>,
  stopped:   "support",          // the discriminator the client branches on
  resources: [ ... ],            // structured, see 2.3
  headline:  "[PLACEHOLDER, COUNSELOR]",
  body:      "[PLACEHOLDER, COUNSELOR]"
}
```

Two things the existing client already gets right, for free:

- `:129-131` sets `finished` on any `status !== 'active'`, and `:337` renders the
  composer behind `{!finished && ...}`. **A new status value removes the input with
  no client change.** There is nothing to reply to, which is the correct end state.
- The same branch calls `onSessionChange(false)`, which releases the GumuGate
  answer-key pause. Correct: a crisis stop should not leave the answer key
  suspended.

The one required client change is the branch at `:127`.

### 2.3 The resources, presented plainly and tappable

Structured data, not prose, so the client renders them as buttons and the wording
around them can change without touching the links.

| Service | Action | Link | Visible label |
|---|---|---|---|
| 988 Suicide and Crisis Lifeline | Call | `tel:988` | Call 988 |
| 988 Suicide and Crisis Lifeline | Text | `sms:988` | Text 988 |
| Crisis Text Line | Text | `sms:741741` body `HOME` | Text HOME to 741741 |

Mechanics that matter:

- On mobile, `tel:` and `sms:` open the dialer and the messaging app directly, which
  is what "tappable, not buried in prose" requires.
- Prefilling the `HOME` keyword via `sms:741741?body=HOME` works on iOS and is
  inconsistent across Android handsets. **The number and the keyword must therefore
  be visible text as well**, so a student on a non-prefilling handset or on desktop
  can still act. Never depend on the prefill.
- The links must be real anchors, not JavaScript handlers, so they work if
  hydration has not completed.

Everything else on that card, the headline, the body copy, the tone, is
`[COUNSELOR]`.

### 2.4 Two interactions I checked, because they could silently destroy the record

**Reveal after a crisis stop.** `reveal` is documented as always available, never
blocked (`route.ts:345-347`), and it calls `resolveFlagged` only
`if (gumuSession.status === "active")` (`:349`). After a crisis stop the status is
terminal, so `resolveFlagged` is skipped and the crisis record survives. This
happens to be correct today. It is correct by one conditional, and it is the kind
of thing that breaks quietly, so it needs an explicit assertion in the verification
suite rather than a comment.

**Worked solution release.** `revealedItemsInSection`
(`app/lib/attempt-sets.ts:89-102`) releases a solution only on
`status === 'resolved_flagged' && resolution === 'student_gave_up'`. A new *status*
value cannot match, so a crisis stop releases nothing. This is why section 3
recommends a new status rather than a new resolution: it makes the mistake
structurally impossible instead of merely currently-not-made.

---

## 3. The new status value, and the DDL

### 3.1 New `status`, not new `resolution`

Recommended: add one value to the `status` constraint at `gumu_tables.sql:30-35`.
Working name `ended_support`, chosen to be neither clinical nor alarming, since it
may surface in a teacher-facing list. Final name is yours.

Why a status and not a resolution under `resolved_flagged`:

- `resolved_flagged` means "GUMU could not get them there on the math". Both its
  endings are math failures. A crisis stop is not a flavour of that, and filing it
  there conflates the two in every query that groups by status.
- It makes the solution-release bug in 2.4 impossible rather than avoided. Under a
  new resolution, the predicate is one careless edit from `status === 'resolved_flagged'`
  alone, and then a crisis stop would release a worked solution.
- Terminal-state semantics are already correct: the partial unique index
  `gumu_sessions_one_active_per_item` is `where status = 'active'`, and the practice
  route's open-session lookup filters on active, so a terminated session correctly
  stops matching both.

**Only one constraint changes, not two.** The resolution constraint at
`gumu_sessions_resolution.sql:155` reads
`check (resolution is null or resolution in ('turn_cap','student_gave_up'))`, and
`:136-140` records that null must stay legal because `active`,
`resolved_retry_success` and `abandoned` all leave it null. So a new status with a
null resolution passes that constraint untouched.

### 3.2 The statements

```sql
-- 1. widen the status constraint
alter table public.gumu_sessions
  drop constraint if exists gumu_sessions_status_check,
  add  constraint gumu_sessions_status_check check (status in (
    'active',
    'resolved_retry_success',
    'resolved_flagged',
    'abandoned',
    'ended_support'          -- new
  ));

-- 2. detector provenance, for tuning. Null on every other row.
alter table public.gumu_sessions
  add column if not exists support_detected_by text
    check (support_detected_by is null
           or support_detected_by in ('lexical', 'classifier'));
```

Confirm the live constraint name before running; `gumu_tables.sql:30` declares it
inline, so Postgres generated the name and it may not be
`gumu_sessions_status_check`. One `\d gumu_sessions` settles it. The runnable file
with the verification queries comes after you approve the shape, following the
`sql/entitlement_columns.sql` pattern.

**Ordering hazard, same as the last one.** `gumu_sessions_resolution.sql:63` warns
"THIS DDL MUST RUN BEFORE the application starts writing `resolution`". Same here,
and the consequence is sharper: if the deploy lands first, the crisis stop's update
throws on the constraint. Section 2.1 is what keeps that from mattering to the
student, but it would mean crisis sessions silently not recorded. **DDL first, then
deploy.**

**Why `support_detected_by` is worth a column.** It is the only way to measure the
split between the floor and the classifier, and therefore the only way to tune
either. It records which detector fired, not what was said, so it carries no
disclosure content and needs no special handling.

**Precedent worth noting:** `abandoned` is in the constraint and nothing anywhere
writes it. Adding an enum value ahead of the code that writes it is established
practice here.

---

## 4. Notification for a student with no teacher

**Options, not a pick.** And this section is downstream of `[COUNSELOR]`, so I have
deliberately not narrowed it.

### 4.1 The structural facts

- `teacher_notifications.teacher_id` is `uuid not null references auth.users(id)`
  (`gumu_tables.sql:92`). A self-serve student has no teacher, so that table
  **structurally cannot** hold this event. This is not a policy choice to revisit,
  it is a NOT NULL. Any option that records something for a self-serve student
  needs a different destination.
- The notification only fires from `resolveFlagged`, on the two math endings, for a
  student in an active class, with text templated to "is stuck on ..."
  (`route.ts:130-136`).
- Roughly half the student base is self-serve, and 3 enrolments exist across 5
  classes.

### 4.2 The options

**N1. Resources only. No notification, no record beyond the session row.**
The student gets 988 and 741741 and the product gets out of the way. Simplest,
smallest data footprint, no implied duty. Defensible as a clear statement that this
is a math product surfacing professional help, not a mental health service. The cost
is that nobody who could act ever learns, and repeat hits by the same student
accumulate nowhere anyone looks.

**N2. Internal alert to an operator.** Email or Slack to a monitored address.
`RESEND_API_KEY` is already provisioned and `/api/support` already sends to a
support inbox, so the mechanism exists. The problem is not technical: an alert
creates a de facto expectation of response, at unknown volume, out of hours, by
people who are not clinicians. An alert that nobody is on call for is worse than no
alert, because it has the shape of a safeguard without the substance. And the
content question is unavoidable: an alert without the message is not actionable, an
alert with it puts a minor's disclosure in an ops inbox.

**N3. Record only, reviewed on a cadence. No real-time alert.**
Write the event somewhere queryable, notify nobody immediately, and have a named
person review on a defined schedule. Honest about capability: it does not pretend
to a response time it cannot meet, and it supports pattern detection across
sessions. The cost is that time-to-human is unbounded by design, which is the wrong
property for the acute case and the right one for the recurring case.

**N4. Teacher when one exists, operator alert when not.**
Uses the existing path where it works. The objection is that the same disclosure
produces a different response depending on whether the student happens to be
enrolled, which is hard to defend to a parent and harder to defend to a regulator.

**N5. Ask the student.** "Would you like us to let someone know?"
Directly addresses the suppression concern, which is the exact thing you are taking
to the counselor: a student who knows the channel is confidential may disclose more
readily. The cost is asking a kid in distress to make a decision at the worst
possible moment, and one more screen between them and the phone number.

### 4.3 The structural consequence, whichever you pick

**Build the crisis stop so it does not call `resolveFlagged` and so notification is
a single empty seam.** If the counselor concludes that teacher notification
suppresses disclosure, that conclusion applies to students who *have* teachers too,
and the existing notification would need removing from this path rather than
extending. A design that routes crisis stops through the math notification path
prejudges the question you are explicitly not letting me prejudge.

---

## 5. The three design questions

### 5.1 Where the screen runs, and the false-positive economics

You framed it as: a false positive interrupts a kid doing algebra, a false negative
is the thing we are fixing. That asymmetry is real and it does point toward
sensitivity. I want to sharpen it in one direction before agreeing, because taken
literally it argues for a very loose screen and I think that is wrong.

A false positive is not free, and its costs are not all borne by the one student:

- It ends their session and shows a 14-year-old crisis resources they did not need.
  Individually recoverable, mildly alarming.
- **If it fires often, students learn the trigger.** A screen that stops the
  conversation every time someone types "this is killing me" teaches kids to not say
  how they feel to this product. That is an anti-safety outcome produced by a safety
  feature, and it degrades the very channel the screen exists to watch.
- If notification is on, a false positive tells a teacher a student is in crisis
  when they are not. That is a serious and hard-to-undo harm to trust.

So the honest framing is: **false negatives are catastrophic and irreversible;
false positives are individually recoverable but systemically corrosive at volume.**
That does not flip the asymmetry, it bounds it. It means the goal is not maximum
sensitivity, it is high sensitivity to disclosure with high precision on hyperbole
specifically. Those are different targets and they select different mechanisms.

Against that, the four options:

**A. Lexical only.** Zero latency, zero cost, deterministic, fully testable offline,
no dependency, no failure mode. Catches explicit statements. Misses indirect
disclosure entirely, which is a large share of real disclosure. And its weakest
point is exactly the one that determines whether the false-positive rate is
tolerable: distinguishing "I want to die" typed by a kid on question 7 of a quiz
from the same words meant literally. A keyword list cannot do that. Widening it to
catch indirect disclosure makes the hyperbole problem worse in the same motion.

**B. A dedicated classifier call.** One extra call per student message, capped at 3
per session by `MAX_STUDENT_TURNS`, and only on `message`, never on `start` or
`reveal`. A Haiku 4.5 call with a single-enum schema and low `max_tokens` is small
next to the tutoring call it precedes, which is Sonnet 5 with adaptive thinking at
`max_tokens: 2048` (`gumu.ts:213`). So the marginal latency is real but
proportionally modest, and the marginal cost is a fraction of a call the flow
already makes. Its advantage is precisely the hyperbole/disclosure distinction that
decides the whole tradeoff. Its disadvantage is that it can fail, which section 1.4
handles.

**C. A field on the tutoring model's own reply schema.** Free, and wrong. It is a
prompt instruction wearing a schema, which is the thing you ruled out. It also
violates the module's stated doctrine of one thing per call (`gumu.ts:19-21`), and
it rides the retry-and-fallback ladder that can substitute a canned message
(`:288-309`), so the signal can be dropped by the leak checker's error handling. And
it means a Socratic reply to a disclosure has already been generated by the time
anything notices.

**D. Lexical net first, escalate to the classifier only on a hit.** Presented as a
cost optimization it does not work: the disclosures that need the classifier are the
ones containing no keyword, so a net narrow enough to be cheap misses them and a net
wide enough to catch them fires constantly. The saving is illusory.

**Where I land, and it is a recomposition of A and D rather than a pick.** Run the
narrow lexical floor first and treat a hit as decisive without a model call, because
by construction the floor only fires on the unambiguous. Otherwise run the
classifier. Keep the floor not to save calls but so that a classifier outage
degrades to reduced sensitivity instead of to nothing (1.4). Run it serially rather
than in parallel with the tutoring call: parallelizing would save latency but sends
the disclosure to the tutoring model anyway, pays for a Sonnet call that is discarded
on every hit, and makes the discard path something that can have a bug in it. If
measured latency turns out to be unacceptable in the chat interface, parallel is the
optimization to reach for, and not before.

Your call.

### 5.2 Should the message still be persisted

**Arguments for persisting:**

- It is the only record of what was actually said. "The system detected something
  and we do not know what" is a bad position in front of a parent, a counselor, or
  anyone reviewing an incident.
- **You cannot tune the screen without it.** The entire false-positive question in
  5.1 is unanswerable empirically if the text is discarded. You would be adjusting
  sensitivity blind on the exact tradeoff you care most about.
- Every other session retains its transcript. A gap only on the most serious ones is
  a strange shape.

**Arguments against:**

- It is a minor's disclosure of distress in an application database. Nothing in this
  system has a retention policy, so persisted means persisted indefinitely.
- `gumu_messages` may later be read by a teacher-facing transcript view, which does
  not exist yet but is an obvious thing to build. A disclosure would then flow into
  a UI designed for reviewing math.

**The architectural argument that I think settles the location, if not the
question.** `gumu_messages` has a stated purpose and a stated invariant. Its purpose
is replaying the transcript to build the model's history (`gumu_tables.sql:76-77`),
and its invariant is that it *"stores only what was actually shown to the student: a
model response rejected by the leak check is logged as a failure, not written here"*
(`:83-85`). A screened message never becomes model history and never enters the
conversation. By that table's own definition it does not belong in it.

**My lean: persist, but not into `gumu_messages`.** A separate table with its own
grants and its own retention posture. That keeps the tuning data, keeps the
disclosure out of any future teacher transcript view, and makes retention a property
of one small table you can reason about and defend, rather than a property of the
whole transcript store.

**And do it by ordering, never by writing then deleting.** Under the section 1.1
placement the message is simply never written to `gumu_messages`, which is the clean
version. A write followed by a delete leaves the row in WAL and in backups, which is
a worse posture than never having written it and a much worse one to have to explain.

Retention window and who may read that table are `[COUNSELOR]` and legal, not mine.

### 5.3 Should existing sessions be retroactively reviewable

The data exists. `gumu_messages` holds every transcript, and 16 flagged sessions
existed as of `c5819bc` on 2026-08-17. I have not counted total sessions and did not
query production for this report; that number is worth getting before deciding, and
it is likely small.

**For:**

- If a disclosure already happened and nobody saw it, that is the harm being fixed,
  and the record is sitting there. Choosing not to look is a choice.
- It is bounded and one-time, so latency and cost are irrelevant and a much stronger
  model could be used than the live path can afford.
- **It is the only real calibration data that exists.** Running the screen over real
  historical transcripts before launch would give a measured false-positive rate on
  actual student language instead of a guess, which is directly the input 5.1 is
  missing.

**Against:**

- A hit on a three-week-old session raises a duty question with no good answer.
  Reaching out to a student about something they said weeks ago is itself an
  intervention and may be worse than not.
- It sets a precedent of re-reading student transcripts for a purpose they were not
  collected for.

**My lean: yes, but as a one-time human read, not an automated retroactive classifier
with an alerting path.** The volume is almost certainly small enough for a person to
read directly, which sidesteps the precedent problem, and it puts a human between any
historical hit and any action, which is the only sane way to answer "what do we do
about a stale disclosure". Do it before launch, with the counselor, so it doubles as
calibration.

Also worth separating: reviewing *transcripts* and running the *screen* over them are
different acts with different implications. The first is a person reading; the second
creates a classified record of minors' historical disclosures. If you do the second,
the output of that batch should be treated with the same retention question as 5.2.

---

## 6. The rate limiter reorder

**The bug.** `safeLimit(gumuRateLimit, ip)` runs at `:152-156`; the auth check is at
`:171-178`. An unauthenticated request consumes IP budget and is then rejected. On a
school NAT, one anonymous flood denies a paid feature to every legitimate student
behind that address.

**The fix.** Move the limiter to immediately after the auth check.

**The larger fix, which I recommend taking at the same time.** Once the limiter runs
after auth, `authSession.user.id` is in hand, and the limiter should key on that
instead of IP. `supportRateLimit` already does exactly this and states the reason
(`rate-limit.ts:69-70`): *"Keyed on the signed-in user id rather than IP, since the
route already requires a session."* GUMU has always required a session; the IP keying
is a leftover from the endpoints that do not.

Keying on user id actually fixes the classroom NAT problem, which reordering alone
does not. `rate-limit.ts:56-57` names that problem and defers it: *"a shared classroom
NAT shares the budget, acceptable while GUMU only fires on wrong answers, worth
revisiting if it goes wider."* Thirty students in one room currently share 20 requests
per 5 minutes.

Tradeoff: IP keying gives some protection against one attacker cycling many accounts.
Account creation is Google OAuth, which is a real barrier, and the platform firewall is
the right layer for that anyway.

**Resize the threshold if you rekey.** 20 per 5 minutes was sized per IP. Per user it is
very loose: one session is at most 1 start, 3 messages and 1 reveal. Sizing is a
judgment call, but the denominator has changed by roughly the size of a classroom and
the number should not stay the same by default.

**Proposed final order**, with the reasoning for each move:

```
auth        (401 before anything else is spent)
rate limit  (keyed on user id; must precede any model call)
parse       (only authenticated callers can make us parse a 2MB body)
schema
session lookup + ownership
reveal / status checks
SCREEN      (behind the limiter, so classifier calls are metered)
tutoring
```

The screen sitting behind the limiter is not incidental. The classifier is a paid
model call driven by user input, so it must be metered, and moving the limiter up to
just after auth is what guarantees that.

**One thing this does not change.** Moving the limiter leaves unauthenticated requests
unmetered at this route, which sounds like a new exposure and is not: `middleware.ts`
already runs on `/api/gumu/session` (the matcher excludes only `api/stripe/webhook`)
and already calls `getUser()`, a Supabase round trip, on every request before the route
is reached. That cost is unmetered today and is unchanged by this reorder. The route's
own `getSession()` reads and decodes the cookie locally, so the added work for an
unauthenticated caller is negligible.

---

## 7. Verification

`prove-checks-can-fail` applies here with more force than anywhere it has been applied
so far: a safety check that silently does nothing is worse than no safety check,
because it is believed in.

The suite must **drive the real route**, not a reimplementation, and must show the
faulted state failing before the clean state passing.

**Fault injection, the check is load-bearing:**

- Disable the screen. A disclosure fixture must reach `askGumu` and must land in
  `gumu_messages`. **This must be demonstrated failing**, or nothing proves the screen
  is doing the work.
- Restore. The same fixture must stop, and `gumu_messages` must hold no student row for
  it.

**Clean controls, so the suite is not passing vacuously:**

- A plainly mathematical message ("I multiplied instead of dividing") is screened
  clear, reaches the tutor, gets a reply, and IS written to `gumu_messages`. An absence
  assertion needs a paired positive; this is `verify_gumu_tier.mjs`'s own doctrine
  (`:16-21`) applied here.
- **A named hyperbole fixture set** that must NOT trip: "this problem is killing me",
  "I'm dying", "I want to die" typed mid-quiz alongside a wrong answer, "this is
  torture". This is the false-positive tradeoff from 5.1 made into an assertion rather
  than an intention, and it is the set most likely to regress when someone widens the
  lexical floor.

**Interaction assertions, from 2.4:**

- `reveal` after a crisis stop returns the answer and does NOT overwrite the crisis
  status or resolution.
- A crisis-stopped session releases no worked solution through
  `revealedItemsInSection`.

**Failure-direction assertions, from 1.4:**

- Classifier unreachable, floor silent, message not obviously mathematical: the turn
  503s. It does not tutor, and it does not show crisis resources.
- Classifier unreachable, floor fires: it stops.

**Ordering assertion, from 6:**

- An unauthenticated POST returns 401 and consumes no rate-limit budget.

The lexical floor and the response composition are runtime pure and belong in
`tests/*.test.ts` under `node --test`. The route-level ordering and the client
rendering need the browser harness, against `next build && next start`.

---

## 8. Flagged, not designed

`[COUNSELOR]` **The wording shown to the student.** Headline and body on the resource
card. The design treats these as opaque strings so they can change without touching
the branch, the links, or the DDL.

`[COUNSELOR]` **Whether teacher notification is appropriate at all**, or would suppress
disclosure. Section 4.3 records the structural consequence: the crisis stop is built to
bypass `resolveFlagged` so this stays answerable in either direction, including
"remove it for students who do have teachers".

`[COUNSELOR?]` **One threshold or two.** Whether "not math, but not crisis" (a student
describing anxiety, exhaustion, something happening at home) needs its own gentler
off-ramp, or whether everything above the line gets the same full stop. I lean to one
threshold in v1, because any middle tier that keeps tutoring is the current wrong
direction in a new costume, and defining what else a middle tier could do is a clinical
question. But this is squarely a counselor's call, and section 1.3 keeps the classifier
graded so adding a tier later does not mean redoing anything.

Also open, and mine to raise rather than decide:

- **Retention and access policy** for the persisted disclosures in 5.2.
- **Whether a crisis-stopped student can immediately reopen GUMU on the same item.**
  Mechanically they can: `gumu_sessions_one_active_per_item` is partial on
  `status = 'active'`, so a terminated session frees the slot. Every message is screened
  regardless, so reopening is not unsafe. It is a care question, not a safety one:
  does the product try to keep them with the resources, or let them go back to work if
  that is what they want.
- **Total session and message counts**, needed to size 5.3. Not queried for this report.

---

## 9. Sequencing

1. `[COUNSELOR]` answers on wording and notification.
2. Decisions on 5.1, 5.2, 5.3 and the section 4 option.
3. DDL, run manually by you, **before** any deploy that writes the new status.
4. Build: `app/lib/crisis.ts`, the route branch, the client card, the limiter reorder.
5. Verification suite, faulted first.
6. Review, then Phase 4 resumes.

The rate limiter reorder in section 6 is independent of every counselor question and
could go first if you want something landed while those are pending.

`phase-4-entitlement-gate-design.md` is untouched on disk, as instructed.

Stopping here.
