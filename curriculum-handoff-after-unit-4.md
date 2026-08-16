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

Four, all found during content work rather than by any check, and all the same
shape: a checked-in artefact that stopped matching the thing it describes. They
were deliberately kept out of the content batches and queued for one sitting.

**Status, measured 2026-08-16.** #84 and #88 are **done**. **#86 is open.**

**#101 is open** and is new: ten live topics use `topic_specific` slugs assigned
to other topics, fourteen uses in total, none of them in Unit 5. Found while
establishing a `check_topic.py` baseline during Unit 5 Phase 1, filed rather than
fixed, and the full table is in the issue.

**#102 is open**, and is a product question rather than a tooling defect. Every
topic carries 14 worked solutions in Part 4, and no student can reach any of
them: `answer_key` is not a column on `curriculum_topics_public`, `loadTopic`
selects it only when `requireTeacher()` passes, and both page components sit
behind a `teacher` gate. Across 83 live topics that is roughly 1,162 worked
solutions written for a teacher-only surface. The code is doing exactly what its
comments say it does; the question is whether that is still the intent. **Relevant
to every authoring round**, because each new topic adds fourteen more.

**#103 is open**, product backlog, and pairs with #102. A self-serve student with
no class enrollment who exhausts GUMU's turn cap of 3 reaches no one:
`resolveFlagged` notifies the enrolling teacher only, and returns early when
there is no enrollment. The correct answer stays reachable through the escape
hatch; the worked solution does not, which is the half #102 covers.

An earlier revision of this section listed #88 as open while section 3 described
its retirement as already executed, quoting the tool's output. Both halves were
written at different times and neither was wrong when written. **A status line is
the fastest thing in this document to go stale, so it now carries the date it was
measured.**

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

#### The wider limit #86 sits inside: `--verify` proves builder fidelity, not spec truth

Measured 2026-08-16 while scoping Unit 5's figures. This is not a bug and there is
no issue for it, but it decides what a new figure type's verification can be
expected to do, so it belongs next to #86 rather than in someone's head.

`verifyFigure(spec)` calls `buildSvg(spec)` internally. It therefore builds the
SVG **from the same spec it verifies against**, and the two move together. What it
can prove is that the emitted geometry matches what the spec declared. What it
cannot prove is that the spec's own claim is true.

The two-argument form `verifyPlane(spec, svg)` separates them, which is how the
distinction was measured. A scatter of three points with a declared fitted line:

```
CONTROL  spec vs its own svg      : 0 failed   <- passes
FAULT    svg drawn at wrong slope : 1 failed   line 0 slope(2.5 vs 1.5)
FAULT    svg drawn w/ moved point : 1 failed   point 1 y(17 vs 10)

GAP      line that does NOT fit the cloud, drawn honestly: 0 failed  <- PASSES
```

The first fault run is the harness working: a builder that draws the wrong slope
is caught, and caught by inverting the printed tick labels rather than by trusting
`makeScales`. The GAP line is the limit: a declared line of `m = -4, b = 19`
against a rising point cloud passes every one of the 21 assertions, because the
builder drew faithfully what the spec asked for and nothing cross-checks the two
declarations against each other.

**So "`--verify` recomputes every labeled quantity" means two different jobs**, and
only the first exists today:

| | what it checks | exists |
|---|---|---|
| builder fidelity | emitted geometry matches the spec | yes, and it is good |
| spec consistency | the spec's declarations agree with each other | no |

`verifyCurves` is the closest thing to the second, and worth studying before
building any of it: it recomputes roots, vertex and y-intercept **from the algebra**
rather than from the spec's own numbers, which is why a curve spec cannot simply
assert its own landmarks. A curve is declared by family and parameters and never
as a point list, precisely so the check has something independent to recompute.

Any new mark type should be designed the same way. A bar chart declaring
`values: [3, 7, 5]` gets real builder verification for free by reading heights back
through the tick map. A box plot declaring a five-number summary likewise. But a
**fitted** line is a spec-consistency claim, and verifying it needs the fit
recomputed from the point cloud, which is new machinery rather than a new caller.

A first probe of this missed the distinction entirely and reported "21 assertions,
0 failed" with both of its fault injections coming back blind, because it mutated
the spec and re-derived the SVG from the mutation. **A fault injected into the
input of both sides of a comparison is not a fault.** The control is what caught
it, again.

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

### Arithmetic claims are written in digits, not words

In rationale prose and in worked solutions, write a computation as a computation:
`48 - 45 = 3`, not "forty-eight minus forty-five gives three", and not "puts the
3 red sections over all 8 sections for three eighths".

This is a convention rather than a checker because the checker cannot be one.
`scripts/check_rationale_arithmetic.py` asserts coverage over claim-**shaped**
strings: it can tell you when something that looks like arithmetic failed to
parse, and it does. It cannot see a claim that never looks like arithmetic,
because there is nothing to count. The obvious guard, "any rationale with two or
more numbers must yield a verified claim", false-fires on legitimate
arithmetic-free rationales such as *"finds the working interval 85 to 100 and
then reports its upper end, 100"*.

The cost of the convention is nil and it fails visibly in review. `PR.2.1` and
`PR.3.1` predate it and write their rationales in words, which is why both report
`distractor_logic 0/0` claims while containing real reasoning about numbers.
Nothing is wrong with them; they are simply unverifiable by machine.

### Currency inside JSON string fields

Spell it as a word: `"15 dollars"`. Never `$15`, never `\$15`. A single backslash
before `$` is an invalid JSON escape and will not parse. In markdown prose use the
escaped `\$28`. There are 122 existing examples across 15+ topics. `check_topic.py`
enforces the JSON side. Verify the prose side on the rendered page, not in source:
both failure modes, an unparseable escape and a leaked backslash, are invisible in
review.

**One known violation, deliberately left alone.** `QR.3.5` line 901 carries a bare
`$37` inside a `range_notes` string:

```
"range_notes": "b rolls in steps of 5 so the base fee never lands on $37. ..."
```

It is real currency and it is genuinely unpaired, one dollar sign in the field. It
is also the only surviving `CURRENCY` failure in the course and the same defect
`lint_curriculum_source.py` reports as its one `QR.3.5` error, so the two tools
agree on it.

It was left because **it never reaches a student.** `range_notes` sits inside a
fenced json block in Part 4, and Part 4 is teacher-only twice over: `answer_key`
is not a column on `curriculum_topics_public`, and `loadTopic` only selects it
when `requireTeacher()` passes. Both of its consumers,
`renderMarkdownWithMath(stripAuthoringBlocks(raw))` and `splitAnswerKey`, call
`stripAuthoringBlocks` first, which removes every `` ```json `` fence. Measured
through the real render path on 2026-08-16: the string survives neither strip, and
appears in no rendered HTML, no `solution_html`, and produces no red render.

So the lint contract stays at **6 errors / 10 warnings**. Fixing it would be
cosmetic, and changing content to satisfy a check that is measuring correctly is
the wrong direction. Worth knowing if that field ever becomes student-visible.

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

### Never regenerate `question_bank.json` from `data/items/`

**`scripts/build_bank.py` writes `public/data/question_bank.json`, and running it
to pick up a change destroys the served bank's math rendering.** It is the
obvious tool, it has the obvious name, it exits zero, and the damage is invisible
in review.

`public/data/question_bank.json` is **not** a faithful export of `data/items/`.
The bank carries LaTeX-wrapping migrations (`$x^{2}$`, `$\frac{1}{2}$`,
`$\sqrt{120}$`) that were applied to it directly and never backported to
`data/items/`, which has held bare Unicode since its first commit. `MathText.tsx`
only typesets content inside `$...$` that contains real LaTeX syntax, so
regenerating from source silently downgrades every migrated expression from
typeset math to literal text. Nothing fails. The bank just gets worse.

So the two sides are authoritative for different things:

| | authoritative for |
|---|---|
| `public/data/question_bank.json` | the question **text** |
| `data/items/**/*.json` | `misconception_tag` |

**The correct tool for a tag change is `scripts/merge_misconception_tags.py`**,
which merges that one field and nothing else. It verifies that both sides agree
on what the option letters mean before writing, because a tag maps letters to
slugs and a merge is only sound if the letters match, and it fails without
writing if any check does not pass. Used in the #88 retirement: it reported
`items given a tag: 1, items untouched: 1115` and
`post-merge verification: OK, only misconception_tag differs`.

This was nearly got wrong during #88. The written plan said "rebuild
`public/data/question_bank.json` to match", which is the destructive path,
and it survived review because it sounds like ordinary hygiene.

Two related artefacts, neither load-bearing and both worth knowing:
`data/build/question_bank.json` is tracked, dates to an old commit, contains
neither of #88's slugs and is referenced by nothing. And production `questions`
holds 1124 rows against the bank's 1116. Both logged in issue #94.

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

- The lint attribution in this document, wrong in three successive versions. It
  first said "all in unit-1 files"; the 2026-08-16 correction moved it to
  `unit-0/QR.3.8` (5 errors, 10 warnings) plus `unit-1/QR.3.1` (1 error); measured
  again 2026-08-16 at `6267a05`, all sixteen findings sit in six *other* unit-1
  files and both named files lint clean. The *total* was right every time, so every
  round that reconciled `6 errors, 10 warnings` against the previous round passed
  while carrying a wrong attribution forward, **including the round that believed
  it was fixing exactly this.**

  Note what the second version got wrong. It was not a lazier claim than the
  first. It was more specific, it was arrived at by measuring, and it was wrong in
  a new direction. Correcting an attribution by hand yields another hand-maintained
  attribution, which is the same artefact with a fresher date on it.

  Closed 2026-08-16 by generating it instead: `scripts/curriculum_lint_baseline.json`
  plus `python3 scripts/lint_curriculum_source.py --check-baseline`, which compares
  **file by file**. A guard on the total would have passed all three times, because
  6/10 was never the part that was wrong. Shown able to fail before being trusted:
  fed the second version's attribution, whose totals still sum to 6/10, it reports
  the six real files as NEW and the two named files as CLEARED; fed a unicode math
  symbol injected into `unit-5/PR.2.1`, it reports that file as NEW at 2 errors. A
  clean control run passed on both sides of both faults.

**A check that cannot fail against the wrong object is not a check, and one that
quietly skips what it cannot read is not one either.** When a suite passes first
time, confirm it is reading the object you meant before believing the number. Count
what was skipped and report it.

The lint entry above is this document failing its own rule twice, which is worth
leaving in rather than quietly correcting: a matching aggregate is not a matching
state, and a handoff written to be trusted is exactly the kind of artefact that
accrues this defect unchecked. The second failure is the more instructive one. The
first correction was careful and still wrong, which is the evidence that care is
not the fix here. **When a fact in this document has drifted twice, stop correcting
it and generate it.**

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

### Silent defaults: malformed input that yields a plausible value instead of an error

Two instances found in one session, in unrelated systems, neither caught by any
gate. Named as a class here because the next one will not look like either of
these, and looking for the class is cheaper than finding the instance.

The shape: **an input the author got wrong produces a well-formed, plausible
result rather than a failure.** Nothing throws, nothing logs, and every check
downstream passes, because there is nothing malformed left to detect by the time
anything looks.

- **`rehype-katex` runs KaTeX with `throwOnError: false`.** A mistyped macro does
  not throw and does not carry an error class. It renders the literal source in
  red (`#cc0000`) inside an ordinary `class="katex"` span, so `$A \cupp B$` ships
  to a student as red `\cupp` with `next build`, eslint,
  `lint_curriculum_source.py` and `check_topic.py` all green. Now gated by
  `scripts/check_katex_render.mjs`. Production measured clean when the gate was
  added: 83 topics, 6116 rendered fields, 29348 math spans, 0 red renders.

- **`sequence_in_unit` defaults to `0`.** `upload_curriculum.py` reads it as
  `parsed['metadata'].get('sequence_in_unit', 0)`, which is the *only* assignment
  of that field anywhere: the source declares the sequence, the uploader never
  derives it. A mistyped or missing frontmatter key therefore uploads a topic at
  sequence 0, which sorts it to the front of its unit and breaks the ordering with
  no error at any layer. Now gated at commit time in `check_topic.py`.

- **A fault injection that silently misses still prints a clean pass.** Proving
  the fixed `CURRENCY` rule fires, a `str.replace` targeted choice `"B"` on an
  item whose key was `"D"`. The target string did not exist, the replace was a
  no-op, the check ran against unmodified content and reported `PASS`, and that
  would have been filed as evidence the rule works. **Every fail-proof must
  assert the fault actually landed before asserting the check fires.** A proof
  that cannot confirm its own injection proves nothing, and it fails in the
  direction of false confidence. `assert old in s` is the whole fix.

  **And assert it landed where the check actually reads.** Proving the coverage
  assertion above, a fault was injected into `84 - 60 = 24` in a worked
  solution. The string existed, the assertion passed, and the check still
  reported clean, because pass 3 only reads `distractor_logic` inside json
  fences and never looks at worked-solution prose. Presence in the file is not
  presence in the scanned region. The corrected proof asserts both.

  **And re-run the proof after every edit to the checker, not only after the
  first build.** This is the sharpest instance of the class, and it inverts the
  others: here the *fix* silently shrank the *checker's own coverage*. Extending
  pass 3 to read worked solutions required excluding function application, and
  the stripper used an unbounded `[^()]*`. That also matched the rationale's own
  parenthetical, since `weights_swapped (attaches the 3 to the 60 ...)` reads as
  `d(...)`, so it deleted entire rationale bodies. `PR.2.2` fell from 85 checked
  claims to 53 and still exited zero, reporting "100% coverage" over the subset
  that survived. Reading the code did not catch it. Re-running the fault proof
  did, in seconds, because the injected fault stopped firing.

  A checker edit is a change to what the checker can see. The two numbers that
  detect it are the **coverage count** and **a fault proof that still fires**;
  re-run both on every edit. A clean percentage over a shrinking denominator
  looks exactly like success.

- **A check that processes a subset of its input and exits zero.** This is the
  general form the three above are instances of, and it is worth stating on its
  own. Pass 3 of the distractor ledger was a list of narrow regexes, one per
  phrasing the topic being written happened to use. On `PR.2.3` it parsed 47 of
  56 claims, skipping the topic's two dominant forms, and reported "all claims
  recompute correctly". Extending it by hand only moved the blind spot to the
  next unseen phrasing; it was extended twice that way. Re-run against `PR.2.2`
  afterwards, it turned out to have checked 82 of 85 claims there too.
  **Coverage must be asserted, not inferred from a clean exit.**
  `scripts/check_rationale_arithmetic.py` now counts claim-shaped strings
  encountered, counts those it parsed, prints the ratio, and fails when the two
  differ. Both topics measure 100%.

**The tell is a default that is also a legal value.** `0` is a legal sequence;
red text is a legal render. Where a default is indistinguishable from a real
value, absence of the input cannot be detected downstream, so it has to be caught
at the boundary where the input is read. Both fixes above are boundary checks for
exactly that reason, and neither could have been a post-hoc audit.

When adding any `.get(key, default)` or `throwOnError: false` to this codebase,
ask whether a caller could ever tell the default apart from a real value. If not,
the default is a silent failure with a plausible face on it.

### The fixture harness is the thing most likely to be wrong

Three times in two sessions, a harness built to test something reported a result
about itself instead. Every one was caught by a control, and none would have been
caught without one.

- **A `cd` persisted across a compound command**, so a regeneration diff compared
  the isolated copy against itself and reported a clean match. Caught because the
  "checked-in" side showed a count the repo file did not have.
- **A control topic that was already failing.** `AR.2.6` was picked to show that
  removing a slug breaks `check_topic.py`, but it was already failing on that
  slug for an unrelated reason, so it printed identical output before and after
  and proved nothing.
- **`topic_id` comes from the filename stem.** Faulted fixtures written under new
  names lost their topic identity, so the topic's own slugs fell out of its
  allowed set and even the unmodified control "failed". Nearly reported as a rule
  defect.

The pattern: **the fault you injected is not the only thing that changed.**
Copying a file changes its path, and paths carry meaning. Changing directory
changes what a relative path resolves to. Picking a fixture that already fails
means the fault cannot be seen.

**The check: every fault run needs a clean control run beside it**, and the
control has to pass. A fault that fails proves nothing on its own, because it
does not distinguish the fault from the harness. All three above were found by
the control disagreeing, not by reading the code.

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

**Do not hand-maintain the attribution below. It is generated.** Three successive
versions of this document recorded it by hand and all three were wrong; see the
entry in section 4. The recorded copy now lives in
`scripts/curriculum_lint_baseline.json` and is checked by

```
python3 scripts/lint_curriculum_source.py --check-baseline
```

which compares **per file** and fails on any difference. Regenerate it only when a
change is intended, with
`python3 scripts/lint_curriculum_source.py --json > scripts/curriculum_lint_baseline.json`.

Measured 2026-08-16 on `main` at `6267a05`, by
`python3 scripts/lint_curriculum_source.py` over all 83 source files:

| File | Errors | Warnings |
|---|---|---|
| `unit-1/QR.1.1` | 5 | 2 |
| `unit-1/QR.1.2` | 0 | 2 |
| `unit-1/QR.1.3` | 0 | 2 |
| `unit-1/QR.1.4` | 0 | 2 |
| `unit-1/QR.2.1` | 0 | 2 |
| `unit-1/QR.3.5` | 1 | 0 |
| **Total** | **6** | **10** |

All sixteen findings are in **unit-1**, spread across six files. `unit-0/QR.3.8`
and `unit-1/QR.3.1`, which earlier versions of this table named, both lint clean
at `0 errors, 0 warnings`; confirmed by running each alone through `--topics`.
Reconcile the attribution, not just the total.

**Every attribution claim in this document carries the command and the date that
produced it, from here on.** A table without those is a recollection.

The CAT diagnostic item bank is a separate system mid its own taxonomy cleanup.
Curriculum work does not touch it.
