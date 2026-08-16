# Curriculum handoff, after Unit 4

Written at the close of Round 5 (Unit 4, twenty AR topics, four batches). Aimed at
a cold session with no memory of that work. Everything below was verified against
production or the repo at the time of writing rather than recalled.

---

## 1. Where the course stands

**83 of 97 topics are live.** Units 0 through 4 are complete and gapless.

| Unit | Topics live | Sequence | Gaps |
|---|---|---|---|
| 0 | 14 | 1 to 14 | none |
| 1 | 15 | 1 to 15 | none |
| 2 | 15 | 1 to 15 | none |
| 3 | 16 | 1 to 16 | none |
| 4 | 20 | 1 to 20 | none |
| 5 | 3 | 4, 9, 14 | eleven, plus whatever sits past 14 |

Production also holds three content-free rows, `AR.COMING-SOON`,
`GR.COMING-SOON` and `PR.COMING-SOON`, which the diagnostic points a student at
when their weakest strand has no curriculum yet. They have no source file, so the
uploader's glob never reaches them and they never appear as modifications.

### What remains: Unit 5, fourteen topics

Three are live and act as anchors, exactly as `AR.3.1` and `AR.4.1` did for
Unit 4:

```
seq  4  PR.2.1  Calculating mean, median, mode, and range
seq  9  PR.3.1  Calculating simple probability of a single random event
seq 14  PR.4.1  Identifying linear relationships in scatterplots
```

Fourteen topics remain to reach the 97-topic course total. Eleven of those fill
gaps at or below sequence 14; the other three imply the unit runs to 17. **Confirm
that against `deferred-curriculum-unit-map.md` before authoring**, because the
Unit Map is authoritative over the item bank's `unit` field, which disagreed on 47
of 97 topics. Do not take the bank's word for placement.

### Repo and production agree

Verified after the Batch D merge: `main` carries all twenty Unit 4 source files,
and a full-course pre-upload diff reports `0 inserts, 0 modifications, 83
unchanged, 3 orphans`. A fresh clone of `main` is a faithful picture of what
students see.

That was briefly untrue during Round 5, and the way it happened is worth knowing.
Batch D's content was uploaded and verified, but its PR was never opened, so five
source files were live to students while sitting only on an unmerged branch. The
content was fine; the repo simply did not describe production. See section 4.

---

## 2. Open tooling issues

Three, all found during content work rather than by any check, and all the same
shape: a checked-in artefact that stopped matching the thing it describes. They
were deliberately kept out of the content batches and queued for one sitting.

**Work them in this order.** #84 is done; #86 and #88 are open.

### First: #84, `sql/curriculum_topics_public.sql` has drifted from the deployed view (RESOLVED)

The checked-in view definition does not list `is_placeholder`. `topic-data.ts`
selects that column on the anonymous path, against `curriculum_topics_public`. If
the deployed view matched the file, PostgREST would reject the select and
`loadTopic` would fall through to `notFound()`, so every topic page would 404 for
every signed-out student. They do not 404, so the deployed view has the column and
the file does not.

**Resolved 2026-08-16.** Both halves of the description above were wrong, and how
they were wrong is the useful part.

*The repo did have the definition.* `sql/curriculum_placeholder_topics.sql`, a
later migration, appended `is_placeholder` to the view and did not backport it.
So this was never missing knowledge; it was two files describing one object with
no statement of which superseded which. `topic-data.ts:60-61` had named the
second file the whole time.

*`create or replace view` cannot drop a column.* It fails with `ERROR: cannot
drop columns from view`, and in the Supabase SQL editor the file is one implicit
transaction, so the error aborts the batch and the view keeps its columns **and**
its grants. Verified in a throwaway Postgres 15 container. The two things that do
produce the 404 are clearing that error with a `drop view` and re-running, which
loses the grants as well, and building a fresh environment that runs one file and
not the other. The staging-environment concern was therefore real; the
maintenance-rerun concern was not.

The fix was to backport the column so either file alone reproduces the view, and
to state the invariant and the append-only constraint in both.

**The lesson worth carrying:** the issue was written from the repo, and every
claim in it that came from reading rather than probing was wrong. The deployed
object is the source of truth, and it is one `curl` away with the anon key.

### Second: #86, `verifyCurves` cannot verify a parabola tangent to the x-axis

`scripts/make_figure.mjs` measures a curve's axis crossings from the emitted SVG
and compares against the algebraic root count. A tangency has no sign change, so
detection depends on whether a sample lands exactly on zero. Two probes failed in
opposite directions: `y = x^2` measured 2 crossings where 1 was expected, and
`y = (x - 2)^2` measured 0.

This bit Unit 4 directly. `AR.3.6`'s slug set includes
`double_root_written_as_two_intercepts`, whose whole subject is a parabola that
touches rather than crosses, and it had to be assessed from prose-described graphs
because the figure could not pass `--verify`. Unit 4 has no other double-root
graphs; Unit 5 may.

Add both probes as regression fixtures whatever fix is chosen.

### Third: #88, two approved slugs describe one misconception

`cancellation_assumed_to_restore_domain` (topics: `AR.1.5`) and
`restriction_read_from_simplified_form` (topics: `AR.4.5`) name the same student
error from two sides. A student who simplifies and then declares the cancelled
value legal has committed both, and no item can separate them.

**Not cosmetic.** The taxonomy is the key the teacher dashboard misconception grid
groups by, so one class-wide error reports as two weaker signals, exactly at the
size where a teacher decides whether to reteach.

Resolve by retiring one through the existing `retired_slugs` mechanism with
`superseded_by` and `items_retagged` filled in. `restriction_read_from_simplified_form`
is the better survivor: it sits on the topic where cancellation actually happens,
and curriculum items are already tagged against it. Then check whether the same
pattern exists elsewhere in the 481 slugs, since this pair was found by accident.

---

## 3. What Unit 4 established that did not exist before it

### The fixture path, and its named limits

`lib/curriculum-fixture.ts`, added in PR #85. The topic route reads exclusively
from Supabase, so before this a topic could not be looked at until it was live,
which put Playwright after the upload and meant rendering defects were found after
students could already have seen them.

```
npm run build
CURRICULUM_FIXTURE_SOURCE=1 npx next start -p 3100
node scripts/verify_topic_render.mjs AR.5.1 --base http://localhost:3100 --figure
```

**What it does not cover, stated so nobody reads it as sufficient.** The row is
injected inside `loadTopic`. Everything downstream is the code a student runs.
Everything upstream is skipped: client selection, the `curriculum_topics_public`
projection, the column list PostgREST accepts, RLS, the grants, and the JSON round
trip. Issue #84 is an upstream defect and this path would not have caught it.

**It does not render navigation faithfully.** Previous and next links come from
`loadNavigation`, which reads the topic list out of `curriculum_topics`, not the
source files. A topic absent from the database gets different nav chrome. The body
is faithful; the chrome is not. Measured: fixture and real pages were byte-identical
in the topic body once live, and differed by 83 characters before, all of it nav.

**The post-upload Playwright run stays.** This front-loads the rendering check; it
does not replace the real-route check.

**The guard is a throw, not a conditional**, because this path returns a row that
never went through the view that strips `correct_answer` and `misconception_tag`.
It is gated on `VERCEL_ENV`, not `NODE_ENV`: `next start` on a laptop sets
`NODE_ENV=production` and is not a deployment, and gating on it banned the fixture
from the only server mode Playwright can use here. `sentry.server.config.ts:14`
carries the same distinction. Ten tests cover both directions, including two that
prove the throw fires at import.

### `scripts/check_topic.py`, run before each topic commit

```
python3 scripts/check_topic.py curriculum/source/tsia2-math/unit-5/PR.2.2.md
```

Checks duplicate-valued choices, the A:3 B:4 C:4 D:3 tally, slugs against the
topic's pre-assigned set, dollar signs inside JSON strings, and em dashes. Exit
code gates the commit. **Run it before committing, not after.**

Its docstring carries the equal-valued-distractor rule, which is the test rather
than the precedent. An equal-valued distractor is permitted only when **both**
hold: the form itself is the topic's named assessed skill, not incidental tidying,
**and** the slug names precisely the error the student made. `AR.4.8` qualifies and
its three instances are allowlisted individually, by topic, item and letter pair,
so a new duplicate in the same file still fails. `AR.4.6 Q3` failed both halves and
was fixed rather than allowlisted. **"The stem said reduce completely" is not the
test.** A stem carrying an allowlisted distractor must also state the required form
explicitly, and the item must keep two genuinely wrong distractors.

### The three-pass distractor ledger

Every distractor gets its stated error procedure executed on the item's actual
input, and the result compared to the answer choice. Three passes, because the
defects came in kinds that only one pass each can see:

1. **By hand**, procedure by procedure.
2. **Independent recomputation.** Every choice re-encoded as a function, every stem
   as a predicate, compared with exact `Fraction` arithmetic. Reads none of the
   rationale text, so it can contradict the first pass rather than echo it. This is
   what found the `AR.4.6` defect, via a count mismatch, not a reading.
3. **Every explicit arithmetic claim in the rationale prose** recomputed. Batch A's
   only arithmetic defect lived here.

### Figure contract: 330 assertions / 54 specs / 0 failed

`node scripts/make_figure.mjs --verify`. Unit 4 moved it from 196/46 through
358/56 and back to 330/54 when two AR.3.7 stem figures were pulled. **Measure it,
do not carry a remembered number forward.** A stale count caused one false
reconciliation during this unit, and a spec count was recorded one low for several
rounds before being caught.

### Currency inside JSON string fields

Spell it as a word: `"15 dollars"`. Never `$15`, never `\$15`. A single backslash
before `$` is an invalid JSON escape and will not parse. In markdown prose use the
escaped `\$28`. There are 122 existing examples across 15+ topics. `check_topic.py`
enforces the JSON side. Verify the prose side on the rendered page, not in source:
both failure modes, an unparseable escape and a leaked backslash, are invisible in
review.

### The figure selector rule

**Every figured topic asserts against `img[src^="data:image/svg+xml"]`, never
`img.first()` or a bare `img` locator.** Figures are inlined as base64 SVG data
URIs, so the src prefix is what identifies one. `img.first()` resolves to the
UnpackMath wordmark in the page header, which has non-zero dimensions and a
non-empty alt, so it passes every assertion while proving nothing. It reported
18 of 18 passing with the figure entirely unverified. Encoded in
`scripts/verify_topic_render.mjs`.

### There is no on-update trigger on `curriculum_topics`

Confirmed across three whole-course uploads. `AR.3.1` and `AR.4.1` have read
`2026-08-12T19:58:36.932341` and `...:37.010878` throughout, and each batch's rows
hold their insert stamps through every later run. The uploader globs the whole
course with no `--topics` filter, so every run reissues dozens of idempotent
upserts; those cost redundant writes but move no timestamps. `updated_at` behaves
as an insert-time stamp. **Re-confirm it once per batch anyway.** It is one query
and it is the only evidence.

### `security_invoker` on the three anon-facing views, and the trap in them

Read directly from `pg_class.reloptions` on 2026-08-16. Measured values, not
inferred from any file:

| View | `reloptions` | Owner | Correct? |
|---|---|---|---|
| `curriculum_topics_public` | `{security_invoker=false}` | `postgres` | yes, load-bearing |
| `questions_public` | `{security_invoker=false}` | `postgres` | yes, load-bearing |
| `qualified_sessions` | `{security_invoker=true}` | `postgres` | yes, and **false would be a breach** |

On the first two, `false` is the entire mechanism. anon holds zero grants on
`curriculum_topics` and `questions`, so the view running with its owner's rights
is the only reason a student page returns anything at all. Set either to `true`
and every topic page and every practice item stops resolving.

**On `qualified_sessions` the same value would do the opposite.** It is a view
over `sessions`, and `true` is what keeps it shut: the view executes with the
caller's rights, anon has nothing on `sessions`, and an anon request fails with
`42501 permission denied for table sessions`, naming the base table rather than
the view. Set it to `false` and the view would read `sessions` as its owner and
hand every qualified session to anon.

**So anyone standardising the three views onto one setting opens this one.**
That is the non-obvious part. Two of the three want `false`, the third wants
`true`, and the reason is not visible from the view definitions: it is that the
first two are redacted projections built to be read by strangers, while the
third is a plain projection of private rows that was never meant to be.

`qualified_sessions` holds 0 rows today, and **the row count is not the
trigger.** An empty view invites the reading that it can be checked later, when
content arrives. Nothing about populating it changes its exposure; the
configuration does. Read it before anyone tidies the three views, not before
anyone fills this one.

```sql
select c.relname                   as view_name,
       pg_get_userbyid(c.relowner) as owner,
       c.reloptions
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('questions_public', 'curriculum_topics_public',
                    'qualified_sessions')
order by c.relname;
```

One loose end while here. anon holds a SELECT grant on `qualified_sessions`; the
42501 comes from the base table, which is why the grant on the view is invisible
until you read it. **A grant that only fails closed because of `security_invoker`
is defence by coincidence rather than by design**, and it is a candidate for the
known stray-anon-SELECT-grant cleanup. Revoking it would make the view closed for
a stated reason instead of an incidental one, and would remove the standardising
trap above along with it. Not urgent, and not done.

Also do not "fix" that 42501 by granting anon on `sessions`. It is the check
working.

### The upload requires a human to run it

`.claude/settings.json` carries a deny rule plus a `PreToolUse` hook blocking any
execution of `upload_curriculum.py`, by any path or interpreter. Reading the script
still works; only running it is blocked.

**The guard has no notion of "approved", deliberately.** It blocks an authorised
upload exactly as hard as an accidental one, because any escape hatch an agent can
reach is not a guard on the agent. Approved uploads are run by hand:

```
! python3 curriculum/migrations/upload_curriculum.py --course tsia2-math
```

Always after a shown, approved pre-upload diff, never before.

---

## 4. Defect classes to watch for in Unit 5

Four, each found more than once in Unit 4, and each invisible to ordinary review.

### Duplicate-valued answer choices

Two choices that are the same number. **Four occurrences in Unit 4**, in
`AR.4.6 Q3`, `AR.4.7` items 8 and 9, `AR.4.8` (three items), and `AR.4.10 P8`.

In every case the item **read** correctly: stem right, arithmetic right, distractor
procedures real. Only the values disagreed. Worse, the accepted fix for `AR.4.6 Q3`
created a *new* duplicate against a different choice in the same item, one commit
after the scan that caught it was written.

Compare by value, never by string. `x/2` against `4x/8`, `4x/16` against `2x/8`,
`4√3` against `2√12`: four pairs, eight different-looking strings.
`check_topic.py` does this. Run it before committing.

### Underdetermined stems that lean on a figure

A stem that does not determine a unique answer, and gets away with it because a
figure supplies the missing parameter, or because every option happens to share it.

Found in both `AR.3.7` stem figures. Each gave a vertex but never fixed the leading
coefficient; the items were answerable only because all four options carried the
same one. The figure hid it, since a picture shows the width and nothing looked
missing. Both stems now pin the parameter from given data and are stronger for it.

**The test: read every stem as prose with the options covered, and ask whether it
names exactly one object.** Cheap, and impossible once a figure is present.

### Unused pre-assigned slugs

The house convention is that every slug pre-assigned to a topic gets used. Two
Unit 4 topics missed it on first pass: `AR.4.11` used 5 of 8 and `AR.4.12` 6 of 7.

Sometimes the gap is real rather than lazy. `factor_reported_as_rate` needs a
factor present to be misreported, so an item asking *for* the factor cannot carry
it; the item had to be reversed to recover a rate *from* a model. When a slug will
not fit, say so and explain, rather than inventing a contrived item or silently
dropping it. `check_topic.py` reports unused slugs as a note.

Also confirm the pre-assigned set **before** authoring. `AR.4.5` was assigned a
deferred slug that was not in its set at all, and the check caught it before the
topic was written rather than after.

### A batch treated as done before its PR is merged

Uploading is not merging, and this round proved the two can drift apart. Batch D's
five topics were uploaded, verified against the real route, and treated as
finished, while their source sat on a branch that never reached `main`. For a
while production served content the repo did not contain.

Nothing was wrong with the content, which is what makes it easy to miss: every
check that ran, passed. The gap was in a step that never ran at all.

**The check: confirm the batch's PR is merged before calling the batch done.**
`git log --oneline main | grep batch-<n>` answers it, and a full-course pre-upload
diff from a fresh checkout of `main` should report zero inserts. Anything else
means the repo is behind production, and the next round will branch from a `main`
that is missing files.

### Checks that pass while measuring the wrong object

The most expensive class, because it produces confident green output.

- `img.first()` measured the site wordmark and reported 18 of 18.
- A parity comparator reported a difference between two identical structures; it
  was measuring Postgres `jsonb` key ordering.
- A ledger comparator flagged three radical identities as mismatched; it was using
  exact float equality on irrationals.
- `check_topic.py`'s first version reported 48 of 56 `AR.4.8` choices as
  unparseable, which would have made it blind on the one topic made of radicals.

- This document said the lint baseline was "all in unit-1 files". Five of the six
  errors and all ten warnings are in `unit-0/QR.3.8`. The *total* was right, so
  every round that reconciled `6 errors, 10 warnings` against the previous round
  passed while carrying a wrong attribution forward. Found 2026-08-16 by
  attributing the findings to files instead of counting them.

**A check that cannot fail against the wrong object is not a check, and one that
quietly skips what it cannot read is not one either.** When a suite passes first
time, confirm it is reading the object you meant before believing the number. Count
what was skipped and report it.

The lint entry above is this document failing its own rule, which is worth leaving
in rather than quietly correcting: a matching aggregate is not a matching state,
and a handoff written to be trusted is exactly the kind of artefact that accrues
this defect unchecked.

### An artefact asserting a mechanism that does not occur

The same defect, three times in one session, each in a different artefact:

- **Issue #84's stated failure mode.** It claimed `create or replace view` would
  drop a column "without complaint". It cannot; it errors with `cannot drop
  columns from view` and aborts the batch.
- **This document's lint attribution.** "All in unit-1", when fifteen of sixteen
  findings are in unit-0.
- **`audit_anon_exposure.py`'s spec-check docstring.** It called the anon
  OpenAPI spec check the load-bearing half. The endpoint answers anon with 401,
  so that check had never run once.

All three were written by someone who understood the system, all three read as
authoritative, and all three passed review, because in every case the claim was
*plausible* and nobody executed the thing it described. Plausibility is what
makes this class survive review; it is not evidence.

**The check: run the thing the artefact describes before trusting the
description.** Re-run the file, call the endpoint, execute the statement in a
throwaway container, attribute the findings instead of counting them. Each of the
three above took under five minutes to disprove once someone tried.

---

## Where things live

| | |
|---|---|
| Source | `curriculum/source/tsia2-math/unit-N/TOPIC.md` |
| Upload | `python3 curriculum/migrations/upload_curriculum.py --course tsia2-math` |
| Figures | `curriculum/figures/*.json`, built by `scripts/make_figure.mjs` |
| Per-topic checks | `scripts/check_topic.py` |
| Render checks | `scripts/verify_topic_render.mjs` |
| Fixture parity | `scripts/verify_fixture_parity.mjs` |
| Lint | `scripts/lint_curriculum_source.py` |
| Unit Map | `deferred-curriculum-unit-map.md` (authoritative over the item bank) |
| Taxonomy | `data/docs/misconception_taxonomy.json` (do not edit while authoring) |

Lint baseline is `6 errors, 10 warnings`, unchanged since before Unit 4. Any new
error in a file you are authoring is a blocker; those ten warnings and six errors
are pre-existing and are not.

They are not where an earlier version of this document said they were. Measured
2026-08-16:

| File | Errors | Warnings |
|---|---|---|
| `unit-0/QR.3.8` | 5 | 10 |
| `unit-1/QR.3.1` | 1 | 0 |

Fifteen of the sixteen findings are in **unit-0**, not unit-1. Reconcile the
attribution, not just the total.

The CAT diagnostic item bank is a separate system mid its own taxonomy cleanup.
Curriculum work does not touch it.
