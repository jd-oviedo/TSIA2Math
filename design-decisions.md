# Design decisions pending

Open decisions about system behaviour, as distinct from `content-fixes-needed.md`,
which tracks authoring defects in the item bank. Nothing here is a bug: each entry
is a place where the current behaviour is defensible but was not deliberately
chosen, and where the alternatives have real tradeoffs. They are written up so the
choice can be made on purpose rather than settled by whoever edits the code next.

---

## CAT evidence can reach `high` confidence in a single sitting

**Status:** Option C chosen and implemented 2026-08-12, with `item_ids` included.
Code is on `feat/misconception-cat-integration`;
`sql/student_misconceptions_session_gate.sql` is **not yet run against
production**. Raised while reviewing that branch.

The rule as shipped: a CAT-only row reaches `high` on three hits spanning two
distinct sessions **and** two distinct items, capping at `medium` short of that.
Three hits in one sitting are `medium`, not `low` -- real evidence, just not
evidence of persistence. Mixed curriculum+CAT rows keep the old rule, since
curriculum hits genuinely are separate occasions. The item dimension closes the
`exposure_max` sibling hole described below.

### The behaviour

`record_misconception()` walks a confidence ladder keyed on `times_hit`:

```sql
confidence = case
  when 'socratic' = any(array_append(student_misconceptions.sources, p_source))
    then 'high'
  when student_misconceptions.times_hit + 1 >= 3 then 'high'
  when student_misconceptions.times_hit + 1 = 2 then 'medium'
  else 'low'
end;
```

`'socratic'` is the only source that fast-tracks. `'cat'` correctly does not -- it
inserts at `low` and climbs to `high` on the third hit. That much is working as
designed and was re-confirmed on this branch.

The gap is that **the ladder counts hits, and nothing ties a hit to a distinct
sitting.** `app/api/sessions/route.ts` records one hit per wrong tagged response
in a submitted session, so three wrong answers on three different items carrying
the same slug -- within one 20-item diagnostic -- produce `times_hit = 3` and
`confidence = 'high'` before the student has left the page.

The comment at the call site describes the ladder as making CAT evidence "earn
high the slow way." Against a student answering repeatedly over weeks that is
true. Against one bad sitting it is not, and the code does not distinguish them.

### Why this matters

`high` is not a cosmetic label. It is the threshold at which a misconception
surfaces to a teacher, and downstream to a parent digest. The argument for making
CAT walk the ladder in the first place -- that a 4-option multiple-choice item
carries a 25% guess rate and is weak evidence of a *belief* rather than a slip --
applies with more force inside a single session, not less. Three wrong answers in
one sitting are also the most likely thing to be correlated: fatigue, a
misread stem, or a shaky twenty minutes.

### How reachable is it

Not the common case, but not exotic, and nothing bounds it. Sessions are 20 items
(`DEFAULT_MAX_ITEMS`), and slug concentration within a strand is high enough to
matter:

| strand | items | most common slug | share of strand |
|---|---|---|---|
| QR | 323 | `answers_intermediate_value` | 47 items, 14.6% |
| AR | 292 | `wrong_sign_on_factor` | 40 items, 13.7% |
| GR | 246 | `answers_intermediate_value` | 23 items, 9.3% |
| PR | 255 | `reports_wrong_center_measure` | 21 items, 8.2% |

**264 of 470 slugs appear on three or more items**, so for the majority of the
taxonomy the single-session path to `high` is available at all. For the head of
the distribution it is reachable in a normal sitting.

A second, quieter path: a student who retakes the diagnostic three times hits the
same slug three times. That is genuinely three sittings and arguably what the
ladder intends -- but it is worth naming, because none of the options below treat
retakes the same way.

### Options

**A. Accept it. Document and move on.**

The ladder is a heuristic, `high` already means "worth a look" rather than
"proven," and a teacher seeing a spurious misconception costs less than missing a
real one. Zero code, zero risk, and it keeps one accumulation rule across all
three sources.

*Against:* it leaves the call-site comment describing a protection stronger than
what exists, and the failure mode is invisible -- nobody will notice a
too-confident row.

**B. Cap CAT hits at one per session per misconception.**

Dedupe by slug in `app/api/sessions/route.ts` before the RPC loop: the whole
session arrives in one request, so this is a `Set` over the tagged wrong
responses. One session, one hit per slug, and `high` then requires three separate
submissions.

*For:* smallest change by a wide margin -- a few lines in one route, no migration,
no RPC signature change, no effect on the curriculum or Socratic paths, and
trivially revertible. It also matches the distinct-evidence model the dashboard
already uses for `affected_students`.

*Against:* it discards real signal. A student who misses the same concept on
three different items has shown something a student who missed it once has not,
and `times_hit` would stop being able to tell them apart. It also makes retakes
the only route to `high` from CAT alone, which raises how much weight retakes
carry -- see the note above.

**C. Require hits to span at least two distinct sessions before `high`.**

Keep counting every hit, but gate the top rung on evidence coming from more than
one sitting. Needs state the RPC does not currently have: a `session_ids uuid[]`
or `distinct_sessions int` on `student_misconceptions`, plus a `p_session_id`
argument.

*For:* the most faithful to the actual intent -- it separates "wrong three times"
from "wrong three times on three different days" without throwing away the
within-session count. `times_hit` keeps its present meaning.

*Against:* the largest blast radius. It changes a shared table and a shared RPC
signature used by three call sites, so the curriculum and Socratic paths must
supply a session id or be exempted, and the migration touches live rows. It also
needs a decision about what the Socratic fast-track means under the new rule --
does a single Socratic hit still reach `high` on its own?

**D. Give CAT a longer ladder than the other sources.**

Leave the mechanism alone and require more CAT hits -- e.g. `high` at five for a
row whose sources are CAT-only, three otherwise.

*For:* expresses the actual belief (CAT evidence is individually weaker) directly
in the one place the ladder lives, and needs no new state -- `sources` is already
on the row.

*Against:* a magic number with nothing behind it, and it does not actually fix
the stated problem: five hits in one sitting is less likely than three, but still
unbounded. It makes the ladder harder to explain to a teacher, and CAT-only rows
would behave differently from mixed rows in a way nobody can see from the UI.

### Recommendation, for what it is worth

**B** if this needs resolving before the branch merges -- it is contained, it is
reversible, and it can be replaced by C later without anything to unwind. **C**
if the intent is to get this right and the migration is acceptable, since it is
the only option that keeps the within-session count while fixing the rung that
uses it. **A** is a legitimate choice, but only if the call-site comment in
`app/api/sessions/route.ts` is corrected to describe what the ladder actually
guarantees.

Not implementing anything until the approach is chosen.

### Related

- `sql/gumu_tables.sql` §4 -- the source-vocabulary CHECK constraints and the
  function's `p_source` guard. Confirmed applied in production on 2026-08-12.
  They reject an unknown source but cannot reject a valid source used from the
  wrong call site, so they do not bear on this decision either way.
- `content-fixes-needed.md` -- the item-bank side of the same system.
- The CAT path's `exposure_max` is declared but never enforced, so there is no
  cross-session exposure control keeping a student away from the same items on a
  retake. That interacts with any option that makes retakes load-bearing.

---

## Routing to the specific topic a student missed, not the strand's first topic

**Status:** Deferred 2026-08-12, deliberately, with the plumbing already in
place. Raised while building the strongest-strand onboarding route on
`feat/diagnostic-recommendation`. Two separate things block it and only one of
them fixes itself.

### What was asked for

The results screen routes a student to their strongest strand and then to that
strand's first topic in sequence. The intent behind it was narrower: land them
on a specific topic in that strand they have **not** mastered. A student who
scores highest in AR but missed a question on quadratic equations should get
the quadratic equations topic, not AR's first topic, and specifically not
linear equations if they answered that correctly.

### The plumbing is ready, and that is worth recording

None of this is a schema change, and the investigation is easy to repeat
wrongly, so:

- `questions.topic_id` exists and is **100% populated** -- 0 nulls across all
  1124 items -- in the **same ID namespace as the curriculum** (`AR.1.1`,
  `QR.2.1`). The bank spans 97 distinct topics: QR 27, AR 32, GR 19, PR 19.
- Per-question correctness is already stored. `sessions.strand_breakdown` is
  only the aggregate; the granular record is the **`responses` table**, one row
  per item with `is_correct`. All 2101 rows resolve to a bank topic, zero
  orphans.
- So per-topic accuracy is `responses` joined to `questions` on `item_id`. It
  is available retroactively for every session ever recorded. Nothing needs
  capturing going forward.
- `curriculum_topics.related_cate_items` is the reverse map and is a red
  herring: nothing reads it, nothing writes it, it appears in no authoring
  source. `questions.topic_id` is the live mapping.

### Why it is deferred: two gaps

**The coverage gap, which authoring fixes.** 91 of the bank's 97 topics have no
curriculum. The 6 that do are all QR.

**The saturation gap, which authoring does not fix.** The *strongest* strand is
by definition where the student missed least, so often there is no missed topic
to route to at all. GR gets 3 items in the whole diagnostic and PR gets 4, and
a strong student sweeps them -- note that the two smallest strands are the two
most often "strongest".

Simulated over all 105 production sessions, routing to a missed topic within
the strongest strand:

| Outcome | Sessions | Share |
| --- | --- | --- |
| Missed a topic, no curriculum exists for it | 56 | 53.3% |
| **No missed topic at all** in the strongest strand | 35 | 33.3% |
| Missed a topic with real curriculum | 14 | 13.3% |

Shipping it today would name a real topic for 14 students in 105 and fall back
to "first topic in the strand" for the other 91 -- the behaviour it was meant
to replace, carried alongside it in the same code.

There is also an evidence-strength point. A 20-item diagnostic touches on
average 6.3 distinct AR topics out of 32 and 2.9 GR topics out of 19, so one
missed question is a single 4-option item with a 25% guess rate. Routing a whole
onboarding on it is a weaker inference than "43% across 7 AR questions". This is
the same argument that put CAT misconceptions behind a two-session confidence
gate in `sql/student_misconceptions_session_gate.sql`.

### The decision this still needs

The coverage gap closes on its own as curriculum is authored. **The saturation
gap needs a decision that does not exist yet:** what should happen when the
student's strongest strand has no missed topic, which was a third of sessions
here and will stay common however much curriculum is written? Candidates: the
first unstarted topic in that strand; the second-strongest strand; or falling
back to the strand's first topic and accepting it. That choice should be made
before this is picked up, not during.

### Related

- `app/lib/recommendation.ts` -- `firstTopicInStrand` is the seam. A
  topic-level router replaces the strand-to-topic step and leaves the
  strand-selection step (`weakestStrand` / `strongestStrand`) alone.
- `sql/curriculum_placeholder_topics.sql` -- the placeholder rows exist because
  of the same coverage gap, and they retire the same way.
