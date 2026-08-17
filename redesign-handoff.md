# What the student surface actually does

Written for whoever picks up the student dashboard redesign. Five findings, not a
history. Each one is something the code does today that you would otherwise have
to discover by reading it.

The long record is in `curriculum-handoff-after-unit-4.md`. Nothing here needs it.

---

## 1. Worked solutions reach students now, per item

All 1,358 authored worked solutions were teacher-only. A student now gets the
solution to an item **they have already answered correctly**, and only that item.

Three layers held them back. **Two are still there and should stay there.**

| | |
|---|---|
| Layer 1 | `answer_key` is not a column on `curriculum_topics_public` at all |
| Layer 2 | `loadTopic` selects it only when `requireTeacher()` passes |
| Layer 3 | `splitAnswerKey` returns empty entries for everyone else |

Only layer 2 was relaxed, and not by widening the student's topic read. That read
goes to the view **because** the view is what strips `correct_answer` and
`misconception_tag` out of `practice_items`; pointing it at the base table to
pick up `answer_key` would hand the student every correct answer on the topic as
a side effect. The key is fetched separately in `loadEarnedSolutions`, filtered
against the student's solved item numbers, and returned. The view is untouched
and the read stays on the admin client.

**Filtering happens before serialization.** `PracticeQuiz` is a client component,
so an unearned solution is not merely unrendered, it is never sent.

**Brute force unlocks a solution and that is accepted, not overlooked.** Four
options means answering until correct works. Those four wrong answers write four
`is_correct = false` rows that feed the teacher dashboard, so the behaviour
reports itself rather than hiding. Revealing unlocks nothing — the escape hatch
writes no attempt row.

`app/lib/attempt-sets.ts`, `loadEarnedSolutions` in `topic-data.ts`,
`npm run test:solutions`.

---

## 2. The open design question: the gate is inverted relative to need

This is the one to decide before building on top of it.

**A student who answers correctly gets the worked explanation. A student who
answers wrong, spends three GUMU turns and still does not understand gets a
letter and silence.** The student who most needs a worked solution is precisely
the one the completion gate withholds it from.

Completion-gating is the right shape for preventing answer-farming and the wrong
shape for teaching. **Those two pull in opposite directions and the tension is
real** — it is not resolvable by picking a better predicate, because the two
goals disagree about the same student.

Layer 2 does not fix this and was not meant to. It rewards the students already
succeeding. Both failure paths are exactly as they were.

---

## 3. The tier asymmetry runs the wrong way

`app/api/curriculum/practice/route.ts:100` and `:204`.

| | correct answer | GUMU | worked solution |
|---|---|---|---|
| **anonymous** | **given immediately** | no | no |
| **authenticated** | withheld | 3 turns | earned per item |

`gumuAvailable` initialises `false` and is set true only inside `if (session)`,
and the response returns `correct_answer: gumuAvailable ? null : ...`. So the
tier with the least support gets the answer fastest, with no explanation and no
tutor — the worst teaching outcome available, delivered to the tier that has
invested least and is most likely to be deciding whether the product is any good.

**Not touched, deliberately.** What a signed-out visitor sees is the product's
front door and the shape of the free tier, so changing it is a GTM decision, not
a code cleanup. Do not treat it as a bug to fix on the way past.

---

## 4. The number that would settle #3 cannot be measured today

The obvious next move is to size the anonymous population and let that decide
whether #3 is the main event or a rounding error. **On the practice surface that
is impossible by construction, not merely missing.**

```sql
student_id uuid not null references auth.users(id)
```

An anonymous `curriculum_attempts` row cannot exist. `route.ts:22` states it
outright: *"Anonymous students are graded but nothing is recorded."* Every
anonymous answer to every practice item in the course has left no trace anywhere.

**So any ratio computed from that table reads as 100% authenticated regardless of
what is actually happening.** That is the trap; it looks like an answer.

`sessions` is the only table instrumenting both tiers — `user_id` is null for an
anonymous run — so the CAT split is the available proxy. Treat it as an **upper
bound on how anonymous the audience is**, not a measurement of the practice
surface: anonymous rows count runs rather than people, since two anonymous runs
cannot be linked, which biases the share upward.

**If that number ever needs to be real, it needs an instrumentation change
first** — a counter on the practice route carrying no identity. Queries and the
full interpretation guide are in `sql/analysis_anonymous_vs_authenticated.sql`.

---

## 5. QR.1.1 is not special; the gate has a gap

QR.1.1's practice is `interactive: false` — 12 written-work items, no
`PracticeQuiz`, so no grading, so **no attempts row can ever exist for them.** The
per-item solution gate's precondition is unsatisfiable: those 12 solutions are
unreachable for every student forever, not because the gate rejects them but
because nothing can satisfy it.

The accurate framing: **`sectionShape()` in `app/lib/curriculum-progress.ts`
already solves this exact situation correctly**, returning `gradable: 0` so a
non-interactive section gets no completion gate rather than one no student can
clear. The solution gate has the same known problem in a place that was not
updated.

Not a regression — those solutions were equally unreachable before. But every
other topic now has a path and this one does not, so it will read as a bug.

Two candidate answers, neither chosen: gate non-interactive sections on
`lesson_completed_at`, which already exists and is already read by `loadGates`;
or state that written-work sections have no solution path by design, since
nothing is submitted and "earned" has no meaning. Which one depends on whether
more non-interactive sections are coming. Filed as #120.

---

## Two things that are covered, and one that is not

`npm run test:auth-gate` asserts every route under `app/dashboard` returns 307 to
`/login` signed out. Routes are discovered from the filesystem, so a new page is
covered the moment it exists.

`npm run test:solutions` asserts the per-item release rule, with each assertion
proven to fail first.

**The five dashboard pages themselves are untested and stay untested**, along with
the entire authenticated branch of `/course` — signed out, `gumu_available` is
always false and `GumuChat` never mounts, so none of that behaviour is exercised.
Closing it needs a real test account, which is deferred rather than declined and
whose costs are written up in `curriculum-handoff-after-unit-4.md`. The short
version: `signInWithPassword` sidesteps the OAuth redirect problem entirely, and
the real cost is a production auth user writing real `curriculum_attempts` rows.
**It becomes obvious the moment the redesign starts**, because changing five
untested pages at once is a different proposition from changing one widget.

One small thing noticed while measuring and left alone: all five dashboard routes
redirect to `/login?next=%2Fdashboard` regardless of which was requested, so a
deep link to `/dashboard/grades` lands on `/dashboard` after signing in. One line
in `app/dashboard/layout.tsx` whenever you are in there.
