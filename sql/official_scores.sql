-- official_scores, and official_score_aggregate
--
-- A student's official TSIA2A mathematics result, transcribed by their teacher
-- from the College Board Individual Score Report. One row per sitting.
--
-- DESIGN, FOR REVIEW. Juan runs this manually in the Supabase SQL editor, one
-- section at a time. Safe to run more than once.
--
--
-- WHY THIS TABLE IS A SENSITIVITY CHANGE, AND NOT JUST ANOTHER SCORES TABLE
--
-- Everything the product stored before this was a number the product produced
-- about itself. A practice estimate that is wrong is a product defect. What
-- lands here is an official assessment outcome from a third-party testing
-- programme, and a value that is wrong here is a misstatement about a student's
-- academic record which a school may rely on for placement.
--
-- Three things follow, and each one is visible in the DDL below rather than
-- left to the application:
--
--   * The affirmation is a CHECK, not a default. A row nobody affirmed cannot
--     exist. See affirmed_official_report.
--   * Who typed it is stored and never cleared. See entered_by.
--   * The scale is constrained at the column. 910 to 990 is the published CRC
--     range, so a 0 or a 1200 is refused by the database and not only by Zod.
--
--
-- WHY THE COLUMN IS official_crc_score AND NOT crc_score
--
-- CRC is already taken in this codebase and means something else. The
-- curriculum's own frontmatter carries assessment_layer: "CRC" across many
-- topics (curriculum/source/tsia2-math/unit-2/QR.3.6.md and others), and
-- sql/curriculum_placeholder_topics.sql references a column set to 'CRC'. In
-- TSIA2 the acronym is College Readiness Classification; in the curriculum it
-- labels an assessment layer. A bare `crc` column would read as either.
--
--
-- WHY FOUR LEVEL COLUMNS RATHER THAN ONE jsonb
--
-- Exactly four reasoning strands exist and the test blueprint fixes them, so
-- the open-ended shape jsonb buys is worth nothing here. Columns also let the
-- CHECK constrain each value, let the CSV export name them directly, and keep
-- a NULL meaningful per strand.
--
-- NULL IS A COMPLETE STATE, NOT MISSING DATA. A student who meets the
-- college-readiness standard receives no strand diagnostic on their report:
-- there is nothing to transcribe, and there is nothing wrong. Anything that
-- reads these columns must render an absent level as absent, never as
-- 'Advanced' and never as an error. The CSV export asserts exactly this.
--
--
-- WHAT IS DELIBERATELY ABSENT
--
-- No `passed` column. It is official_crc_score >= 950 and nothing else. Storing
-- it creates a second source of truth that can disagree with the first, and the
-- threshold already lives in one place as TSIA2_PASSING in
-- app/adaptive-test/engine.ts.
--
-- No unique constraint on (student_id, test_date). A same-day retake is
-- implausible, but a correction made after the window has closed needs a second
-- row, and a blocked teacher with a wrong score on screen is worse than two
-- visible rows one of which is superseded.
--
-- No expiry column for the correction window. The window is 24 hours from
-- created_at, derived at read time. Storing an expiry would mean changing the
-- window is a backfill instead of a code change, and would let two rows written
-- a minute apart disagree about how long a correction lasts.
--
-- Run this in the Supabase SQL editor. Kept here for version control.


-- ─── Section 1. The table ────────────────────────────────────────────────────

create table if not exists public.official_scores (
  id uuid primary key default gen_random_uuid(),

  -- auth.users rather than profiles, matching worksheets.teacher_id and
  -- curriculum_attempts.student_id: the auth id is the stable identity and a
  -- profile row can be rebuilt.
  --
  -- CASCADE for v1. A deleted account takes its official scores with it. How
  -- long a score should outlive a student leaving a CLASS is a separate
  -- question and is recorded as an open item in the legal audit rather than
  -- guessed at here.
  student_id uuid not null references auth.users(id) on delete cascade,

  -- Who transcribed it. Retained after the correction window closes and after
  -- any correction, because the affirmation below is meaningless if the
  -- affirming party is not named.
  --
  -- NO CASCADE, deliberately, and no ON DELETE clause at all. If deleting a
  -- teacher account would orphan this reference the delete should fail loudly
  -- rather than quietly erase who vouched for a student's official score.
  entered_by uuid not null references auth.users(id),

  -- Which class the entry was made from. This is what the RLS policy below
  -- resolves ownership through, and it is carried explicitly rather than
  -- rediscovered by joining enrollments at read time: a student who later
  -- leaves the class must not take the teacher's own record with them.
  class_id uuid not null references public.classes(id) on delete cascade,

  -- The published CRC scale. Constrained here so a transcription slip is
  -- refused by the database and not only by the route's Zod schema.
  official_crc_score int not null
    check (official_crc_score between 910 and 990),

  -- A date, not a timestamptz. The score report prints a test date, not a test
  -- moment, and storing a timestamp would invent a precision the source
  -- document does not have.
  --
  -- THE BOUND IS A SANITY RANGE, NOT "NOT IN THE FUTURE", and that is forced
  -- rather than chosen. `check (test_date <= current_date)` is the constraint
  -- this obviously wants and Postgres refuses it: check constraints may only
  -- call IMMUTABLE functions, current_date is STABLE, and the create table
  -- fails outright with 42P17, "functions in check constraint must be marked
  -- IMMUTABLE". A constraint that cannot be created is not a weaker guard, it
  -- is no table.
  --
  -- So the database enforces what it can enforce immutably, which is a range
  -- that catches a mistyped year (0225, 2202, 1025), and "not in the future" is
  -- enforced by Zod on the API route instead. Lower bound is TSIA2A's own
  -- introduction; upper bound is far enough out to never need revisiting and
  -- close enough to catch a four-digit slip.
  test_date date not null
    check (test_date between date '2021-01-01' and date '2100-01-01'),

  -- Per-strand diagnostic level. NULL for a student who met the standard.
  --
  -- The vocabulary matches ProficiencyLevel in app/adaptive-test/type.ts and
  -- the worksheet builder's LEVELS, so the product has one set of three words
  -- for difficulty rather than two sets that happen to agree today.
  level_qr text check (level_qr in ('Basic', 'Proficient', 'Advanced')),
  level_ar text check (level_ar in ('Basic', 'Proficient', 'Advanced')),
  level_gr text check (level_gr in ('Basic', 'Proficient', 'Advanced')),
  level_pr text check (level_pr in ('Basic', 'Proficient', 'Advanced')),

  -- The teacher's affirmation that this came off the official report.
  --
  -- NOT a default true, and the CHECK has no false branch. `not null default
  -- true` would let a row exist that nobody affirmed, which is the entire thing
  -- this column is for. Written as a bare CHECK on the column so an insert that
  -- passes false is refused by Postgres rather than by a trigger somebody can
  -- disable.
  affirmed_official_report boolean not null check (affirmed_official_report),

  created_at timestamptz not null default now(),

  -- Null until corrected. Non-null is the record that a correction happened,
  -- which is why a correction updates the row rather than replacing it.
  corrected_at timestamptz,

  -- A strand level was entered alongside a passing score, the teacher was
  -- warned, and they submitted anyway. Never blocks: the report is the
  -- authority and the product is not entitled to refuse what it says. Stored so
  -- the anomaly is findable later rather than only having existed on screen.
  entered_despite_warning boolean not null default false
);


-- ─── Section 2. Indexes ──────────────────────────────────────────────────────

-- The history panel: one student's sittings, newest first. Leading column
-- filters, trailing column sorts.
create index if not exists official_scores_student_idx
  on public.official_scores (student_id, test_date desc);

-- The roster join: every official row for one class, so the most recent per
-- student can be picked without a full scan.
create index if not exists official_scores_class_idx
  on public.official_scores (class_id, student_id);


-- ─── Section 3. Comments ─────────────────────────────────────────────────────

comment on table public.official_scores is
  'A student official TSIA2A mathematics result, transcribed by their teacher '
  'from the College Board Individual Score Report. One row per sitting. '
  'Teacher-scoped by RLS through class_id; every write goes through the API on '
  'the service role after requireTeacher(). Not verified against any College '
  'Board system.';

comment on column public.official_scores.official_crc_score is
  'College Readiness Classification score, 910 to 990. Named in full because '
  'CRC already labels an assessment layer in the curriculum frontmatter and a '
  'bare crc column would read as either.';

comment on column public.official_scores.level_qr is
  'Per-strand diagnostic level, or NULL. NULL is a COMPLETE state: a student '
  'who met the college-readiness standard receives no strand diagnostic on '
  'their report. Never render NULL as Advanced.';

comment on column public.official_scores.affirmed_official_report is
  'The entering teacher affirmed they were reading the student official score '
  'report. CHECK rather than default so an unaffirmed row cannot exist.';

comment on column public.official_scores.entered_by is
  'Who transcribed the row. Retained after correction and after the correction '
  'window closes, because the affirmation names no one without it.';

comment on column public.official_scores.corrected_at is
  'Null until corrected. The correction window is 24 hours from created_at and '
  'is derived at read time, never stored, so changing it is a code change and '
  'not a backfill.';


-- ─── Section 4. RLS and grants for official_scores ───────────────────────────
--
-- Shipped in the same migration as the table, not a later one. The alternative
-- leaves a window in which every teacher can read every other teacher's
-- students' official scores, and windows like that are how
-- sql/curriculum_topics_public.sql came to exist.
alter table public.official_scores enable row level security;

-- The grant is what makes the policy load-bearing: policies filter, they do not
-- grant, so a policy with no grant yields nothing and a grant with no policy
-- yields everything.
--
-- SELECT ONLY, and that is the whole of it. Every write goes through
-- /api/teacher/official-scores on the service role, after requireTeacher() and
-- the capability check. The same posture worksheets and announcements take, for
-- the same reason: the API route is where the plan check lives, and a direct
-- client insert would skip it. A teacher with an expired subscription still
-- holds a valid JWT.
--
-- An insert or update grant here would also let a teacher write an official
-- score with affirmed_official_report set by their own client, which would make
-- the affirmation worthless.
--
-- REVOKE FIRST, THEN GRANT. The revoke is not defensive tidiness, it is the
-- correction: a new table in this project does NOT arrive with an empty grant
-- list. Supabase ships ALTER DEFAULT PRIVILEGES for anon and authenticated in
-- the public schema, so a bare `create table` hands both roles privileges before
-- a single line of this file's own grants runs. Writing only the grant leaves
-- whatever was inherited sitting underneath it, invisibly, because a grant can
-- only add.
--
-- That is not hypothetical here. Query 2 of section 6 caught exactly this on
-- official_score_aggregate in production on 2026-08-23: SELECT to authenticated,
-- on a table this file's own comments describe as having "no grant and no
-- policy at all". It was revoked by hand, and the revoke now lives in section 5
-- so a re-run cannot reinherit it. The same correction belongs here, for the
-- same reason, whether or not this table happened to be caught by it.
--
-- Idempotent by construction: revoke-then-grant reaches the same end state
-- however many times the file is run, and whatever the defaults were when the
-- table was created.
revoke all on public.official_scores from authenticated, anon;
grant select on public.official_scores to authenticated;

-- Ownership resolved through the class, which is the only place teacher
-- identity lives. There is no sharing model and no co-teacher concept.
--
-- This admits a teacher whose subscription has lapsed: auth.uid() is identity,
-- not entitlement, and RLS cannot see profiles.plan without a subquery on every
-- row. Entitlement is enforced one layer up by requireTeacher() plus
-- profileGrants() on every route that reads this table. RLS here is the tenancy
-- boundary, which is "not another teacher's students", not the paywall.
create policy official_scores_select_own_class
  on public.official_scores
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.classes c
      where c.id = official_scores.class_id
        and c.teacher_id = auth.uid()
    )
  );


-- ─── Section 5. The aggregate table ──────────────────────────────────────────
--
-- One de-identified row per official score, for programme-level dashboarding.
--
-- WHAT MAKES THIS ROW UNJOINABLE, precisely:
--
--   1. No identifier column exists. No student_id, class_id, teacher_id, or
--      official_scores.id, and therefore no foreign key that could be followed.
--   2. No grant and no policy. `authenticated` and `anon` can select nothing,
--      so the join cannot be attempted from a client at all.
--
--      THIS TOOK AN EXPLICIT REVOKE, and the first version of this file did not
--      have one. "No grant" was written as a description of a table nobody had
--      granted anything on, which is not what a new table in this schema is:
--      Supabase's ALTER DEFAULT PRIVILEGES hands anon and authenticated
--      privileges at create time. Query 2 of section 6 found SELECT sitting on
--      authenticated in production on 2026-08-23, underneath a comment claiming
--      it could not be there. Point 2 is now enforced rather than asserted.
--   3. The practice estimate is destroyed, not hidden. Only the band survives,
--      so an attacker holding a student's exact practice score cannot match on
--      it.
--   4. Dates are coarsened to the month, day 01 always, so a row cannot be
--      aligned to a school day or to a specific insert by timestamp.
--   5. A random uuid primary key and no sequence, so the Nth aggregate row
--      cannot be paired with the Nth per-student row by ordering.
--
-- WHAT THAT DOES NOT PROVE, stated separately because conflating the two is the
-- failure mode:
--
--   * IT IS NOT ANONYMITY AND IT IS NOT K-ANONYMOUS. Nothing enforces a minimum
--     group size. Four strand levels at four states each, times four bands,
--     times a month, is over a thousand combinations against a cohort currently
--     numbering fifteen. A class of five where one student sits the test in
--     December yields a row anyone who knows that fact can attribute.
--   * It does not protect against the entering teacher, who typed the score.
--     It defends against a future cross-class or cross-district reader.
--   * "No foreign key" is not "not re-identifiable". Points 1 to 5 make the row
--     un-JOINABLE by query. They do not make the student un-IDENTIFIABLE by a
--     person holding outside knowledge.
--   * THE WRITE IS SYNCHRONOUS IN THIS BUILD. Anyone with database log access
--     can pair an aggregate row with its per-student row by transaction time,
--     regardless of what these columns say. Closing that needs a deferred,
--     batched write. Decided out of scope for this build and recorded as an
--     open item in the legal audit.
--   * It does not remove the data from FERPA scope. An education record does
--     not stop being one because a derived copy is hard to join.

create table if not exists public.official_score_aggregate (
  id uuid primary key default gen_random_uuid(),

  official_crc_score int not null
    check (official_crc_score between 910 and 990),

  -- The practice estimate as a band, never the number. Vocabulary and
  -- thresholds come from placementBand() in app/lib/placement.ts, which is
  -- already what the roster, the student detail page and the scores CSV band
  -- column all render. A second banding vocabulary would mean two different
  -- things called "band".
  --
  -- no_estimate is a real state: a student may sit the official test having
  -- never completed a practice run.
  practice_estimate_band text
    check (practice_estimate_band in (
      'college_ready',
      'approaching',
      'below_college_ready',
      'no_estimate'
    )),

  -- Day 01 always. Enforced rather than trusted, because a single row written
  -- with a real day would silently undo coarsening for that row.
  test_month date not null check (extract(day from test_month) = 1),
  recorded_month date not null check (extract(day from recorded_month) = 1),

  -- Unconstrained by CHECK on purpose: these mirror official_scores, which
  -- already constrains them, and a second CHECK here would have to be kept in
  -- step with it for no gain.
  level_qr text,
  level_ar text,
  level_gr text,
  level_pr text
);

comment on table public.official_score_aggregate is
  'De-identified companion to official_scores, for programme-level '
  'dashboarding. Carries no student, class or teacher identifier and no '
  'foreign key, the practice estimate is reduced to a band, and dates are '
  'coarsened to the month. This makes rows un-joinable by query. It does NOT '
  'make them anonymous: no minimum group size is enforced. Treat as '
  'pseudonymous data within FERPA scope.';

-- RLS on, and NO GRANT AND NO POLICY. Both halves matter and neither is
-- sufficient alone: RLS enabled with no policy denies everyone, which is the
-- intent, and the absent grant means even a policy added by mistake later would
-- still yield nothing. Service role only, which bypasses both.
alter table public.official_score_aggregate enable row level security;

-- THE REVOKE IS THE HALF THAT WAS MISSING. Applied to production by hand on
-- 2026-08-23 after query 2 of section 6 found SELECT granted to authenticated,
-- inherited from Supabase's default privileges on the public schema rather than
-- written by anyone. Recorded here so the file matches production and, more to
-- the point, so RE-RUNNING THIS FILE CANNOT REINHERIT IT: `create table if not
-- exists` is a no-op on the second run, but on a fresh database it would take
-- the defaults all over again, and only this line takes them back off.
--
-- Named roles rather than `public`, because that is the grantee the default
-- privileges actually name. Revoking from `public` would leave the anon and
-- authenticated grants untouched and look like it had worked.
--
-- With this line the two defences stop being redundant in the same direction:
-- RLS-with-no-policy denies, AND there is no privilege to filter in the first
-- place. Before it, only the first was true, and one mistakenly added policy
-- would have been the whole distance to exposure.
revoke all on public.official_score_aggregate from authenticated, anon;


-- ─── Section 6. After running this ───────────────────────────────────────────
--
-- Verification, in the order the sections above were run. Each of these is a
-- question with a wrong answer that has actually happened on this project, not
-- a formality.
--
-- 1. Confirm the grants on official_scores are SELECT and nothing more. An
--    insert or update grant would let a lapsed teacher write an official score,
--    with their own affirmation flag, straight past the API:
--
--      select grantee, privilege_type
--      from information_schema.role_table_grants
--      where table_name = 'official_scores'
--      order by grantee, privilege_type;
--
--    Expect authenticated with SELECT only, plus postgres and service_role.
--    Any anon row at all is a bug: this table is not public in any form.
--
--    VERIFIED EMPIRICALLY 2026-08-23 and now covered by a script:
--    scripts/verify_official_scores_grants.mjs asks PostgREST with a real
--    teacher JWT instead of reading this table, and got SELECT 200 with
--    INSERT, UPDATE and DELETE all 42501. Worth running as well as this query,
--    because a privilege reachable through a role the grant table does not
--    obviously implicate is exactly what was missed on the aggregate below.
--
-- 2. Confirm official_score_aggregate grants NOTHING to authenticated or anon:
--
--      select grantee, privilege_type
--      from information_schema.role_table_grants
--      where table_name = 'official_score_aggregate'
--      order by grantee, privilege_type;
--
--    Expect postgres and service_role only. An authenticated row here breaks
--    the unjoinability argument in section 5 at point 2.
--
--    THIS QUERY ACTUALLY FIRED, on 2026-08-23: it found SELECT granted to
--    authenticated, inherited from Supabase's default privileges rather than
--    written by anyone, under a comment claiming the table had no grant at all.
--    Revoked by hand and now revoked by section 5, so a re-run cannot bring it
--    back.
--
--    Two things the incident is worth remembering for. First, ANON LOOKED
--    CLEAN THE WHOLE TIME -- 42501 on both tables -- so an anon-only probe,
--    which is what scripts/audit_anon_exposure.py is, could never have seen
--    this and reported nothing wrong. A signed-in teacher is not a stranger,
--    and "no stranger can read it" is a weaker claim than section 5 makes.
--    Second, the failure mode is quiet: with RLS on and no policy, the grant
--    yields an EMPTY ARRAY rather than an error, which reads as safe.
--
-- 3. Confirm RLS is on AND the policy exists on official_scores. Either alone
--    is not the fix: RLS enabled with no policy denies everyone, and a policy
--    with RLS off is inert.
--
--      select relrowsecurity, relforcerowsecurity
--      from pg_class where oid = 'public.official_scores'::regclass;
--
--      select polname, polcmd, pg_get_expr(polqual, polrelid)
--      from pg_policy where polrelid = 'public.official_scores'::regclass;
--
--    Expect relrowsecurity = t, and one policy named
--    official_scores_select_own_class with polcmd = r.
--
--    Then the same relrowsecurity check for official_score_aggregate, which
--    must be t with ZERO rows from pg_policy.
--
-- 4. Prove the affirmation CHECK actually refuses, rather than reading it and
--    concluding. As service_role, against a real student and class id:
--
--      insert into public.official_scores
--        (student_id, entered_by, class_id, official_crc_score, test_date,
--         affirmed_official_report)
--      values ('<student uuid>', '<teacher uuid>', '<class uuid>', 945,
--              current_date, false);
--
--    Expect: new row violates check constraint. A successful insert means the
--    affirmation is decoration. Roll back either way.
--
-- 5. Prove the scale CHECK refuses, same shape, with official_crc_score = 909
--    and again with 991, affirmed_official_report = true. Both must be
--    refused. 910 and 990 must both be accepted, or the bounds are off by one
--    in the wrong direction. Roll back.
--
-- 6. Prove the tenancy boundary holds, rather than reading the policy. With two
--    teacher accounts owning different classes, signed in as the first:
--
--      curl "$URL/rest/v1/official_scores?select=id,official_crc_score" \
--           -H "apikey: $ANON_KEY" -H "Authorization: Bearer $TEACHER_A_JWT"
--
--    Expect only rows whose class belongs to A. Repeat with B's token and
--    confirm the sets are disjoint. A 200 with an empty array is the correct
--    answer for a teacher with no entries; a 200 containing another teacher's
--    student is the failure this policy exists to prevent.
--
-- 7. Prove the aggregate is unreadable by a signed-in teacher:
--
--      curl "$URL/rest/v1/official_score_aggregate?select=id" \
--           -H "apikey: $ANON_KEY" -H "Authorization: Bearer $TEACHER_A_JWT"
--
--    Expect a permission error, not an empty array. An empty array would mean
--    the grant exists and only the policy is filtering, which is one deleted
--    policy away from exposure.
--
--    That sentence stopped being hypothetical on 2026-08-23. Re-checked after
--    the revoke: a real teacher JWT now gets 42501, not [].
--    scripts/verify_official_scores_grants.mjs is the standing regression
--    check, and it distinguishes the two states by name rather than by status
--    code, because both hand the caller zero rows and only one of them is safe.
