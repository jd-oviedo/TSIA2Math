-- assignments + assignment_students
--
-- Whole-topic work a teacher sets for a class, for a subset of a class, or for
-- one student. Build 4a: the teacher write path. The student-facing surface is
-- Build 4b and this file is written so that build needs no further DDL.
--
-- DESIGN, REVIEWED AND CONFIRMED. Juan runs this manually in the Supabase SQL
-- editor, statement block by statement block, in the order below. Safe to run
-- more than once: every statement is IF NOT EXISTS or revoke-then-grant, both
-- of which reach the same end state however many times they run.
--
-- Run this in the Supabase SQL editor. Kept here for version control.
--
--
-- ─── TWO TABLES, AND WHAT IS DELIBERATELY NOT HERE ───────────────────────────
--
-- THERE IS NO GROUP ENTITY, and there must not be one. A teacher assigning to
-- "the four students who missed Tuesday" is describing an ad-hoc subset, not a
-- durable object with a name and a lifecycle. So targeting has exactly two
-- shapes and the second covers both the individual and the subset case:
--
--   target_type = 'class'    0 rows in assignment_students. The target is
--                            resolved LIVE against active enrolments at read
--                            time, so a student who joins next week is included
--                            and a student who is removed drops out, without
--                            anything stored here changing.
--
--   target_type = 'student'  1..N rows in assignment_students. One row is the
--                            individual case; N rows is the ad-hoc subset. Same
--                            shape, same code path, no third concept.
--
-- COMPLETION IS NEVER STORED, and there is no column here for it. Whether a
-- student has finished an assigned topic is derived at read time by
-- getTopicStatuses() in app/lib/curriculum-progress.ts:492, filtered to the
-- assigned topic -- the same live A1 computation the teacher progress surface
-- already reads, and the reason app/api/teacher/curriculum-progress/route.ts:42
-- strips the stored completed_at stamp server-side.
--
-- A stored completion flag would be a second answer to a question that already
-- has one, and the two would disagree the first time a student went back and
-- finished a topic after the flag was written. There is no way to keep them in
-- step that is cheaper than not having the second one.
--
-- STORED TARGETS ARE STILL FILTERED THROUGH ACTIVE MEMBERSHIP ON READ. A
-- 'student' assignment names student ids at write time; the reader intersects
-- them with the active roster, so a removed student disappears from the tracker
-- exactly as they disappear from every other teacher surface. See the note over
-- activeStudentIds in app/lib/teacher-scope.ts:63-87, which is where that
-- filter is made unforgettable rather than remembered.
--
--
-- ─── THE KEY, AND WHY IT IS TWO COLUMNS ──────────────────────────────────────
--
-- (course_id, topic_id), never a composed string. curriculum_attempts,
-- curriculum_completion, gumu_sessions, curriculum_item_templates and
-- worksheets all carry the pair, for the reason sql/worksheets.sql:88-92 gives:
-- curriculum_topics is keyed on both and a topic id alone does not identify a
-- topic. The composed form `${course_id}:${topic_id}` exists in exactly one
-- place -- topicKey() in app/lib/topic-key.ts:12 -- and it is built at read time
-- to look a status up, never persisted. Storing it would be a second key format
-- to keep in step with the first.
--
--
-- ─── ANSWER-BEARING: NO ──────────────────────────────────────────────────────
--
-- Neither table stores curriculum content. An assignment row is a reference to a
-- topic plus a due date; resolving it to a lesson, a question or a correct
-- answer requires curriculum_topics, which holds zero grants for the API roles
-- (sql/curriculum_topics_public.sql:214). That is what allows the policies in A7
-- and A8 to be simple scope tests rather than content redaction.


-- ─────────────────────────────────────────────────────────────────────────────
-- A1. The assignments table
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),

  -- Cascade, matching announcements.class_id (sql/announcements.sql:20) and
  -- official_scores.class_id (sql/official_scores.sql:100): a deleted class
  -- takes its assignments with it. There is nothing an assignment means once
  -- the class it was set for is gone.
  class_id uuid not null references public.classes(id) on delete cascade,

  -- The pair, never a composed key. See the header.
  --
  -- The default matches worksheets.course_id (sql/worksheets.sql:93) and the
  -- one live value, 'tsia2-math' -- app/lib/recommendation.ts:28,
  -- app/api/teacher/worksheets/route.ts:121, app/lib/capabilities.ts:285. The
  -- route sends it explicitly anyway; the default is here so a hand-written row
  -- in the SQL editor lands in the right course rather than failing not-null.
  course_id text not null default 'tsia2-math',
  topic_id  text not null check (length(trim(topic_id)) between 1 and 50),

  -- Which of the two targeting shapes this row is. See the header.
  --
  -- CHECKED HERE AND VALIDATED IN ZOD, both, on purpose: the check is what makes
  -- a third value impossible, and the Zod enum is what turns a bad request into
  -- a sentence instead of a 500 from Postgres. Same split as
  -- official_crc_score, stated at sql/official_scores.sql:105-107.
  target_type text not null check (target_type in ('student', 'class')),

  -- Nullable = no due date, which is a real and common state and not missing
  -- data. "Work through this topic, no deadline" is a thing teachers set.
  --
  -- THE BOUND IS AN IMMUTABLE SANITY RANGE, NOT "in the future" OR "not in the
  -- past", and that is forced rather than chosen. Postgres refuses check
  -- constraints that call now() or current_date -- they are STABLE, not
  -- IMMUTABLE, and the create table fails outright with 42P17. This is the same
  -- split sql/official_scores.sql:110-121 documents for test_date: the database
  -- enforces what it can enforce immutably, which is a mistyped year, and
  -- anything time-relative is enforced by Zod on the route.
  due_at timestamptz
    check (due_at is null
           or due_at between timestamptz '2021-01-01' and timestamptz '2100-01-01'),

  -- Who set it. auth.users rather than profiles, matching announcements.
  -- created_by (sql/announcements.sql:19) and worksheets.teacher_id
  -- (sql/worksheets.sql:83): the auth id is the stable identity and a profile
  -- row can be rebuilt.
  --
  -- NO ON DELETE CLAUSE, deliberately, matching official_scores.entered_by
  -- (sql/official_scores.sql:94). If deleting a teacher account would orphan
  -- this reference the delete should fail loudly rather than quietly erase who
  -- set the work. Note this is written on the server from the session profile
  -- and is never accepted from the request body -- the same rule that keeps
  -- entered_despite_warning off the official-score schema
  -- (app/lib/schemas.ts:271-273).
  created_by uuid not null references auth.users(id),

  created_at timestamptz not null default now()
);

comment on table public.assignments is
  'Whole-topic work a teacher sets for a class. target_type=''class'' carries '
  'zero assignment_students rows and resolves live against active enrolments '
  'at read time; target_type=''student'' carries 1..N rows and covers both the '
  'individual and the ad-hoc subset case. Completion is never stored: status is '
  'derived from getTopicStatuses() filtered to this topic.';

comment on column public.assignments.due_at is
  'Null means no due date, which is a real state. The CHECK is an immutable '
  'sanity range only -- Postgres refuses now()/current_date in a check (42P17) '
  '-- so anything time-relative is enforced by Zod on /api/teacher/assignments.';


-- ─────────────────────────────────────────────────────────────────────────────
-- A2. The assignment_students table
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Rows ONLY when the parent is target_type='student'. A class-target assignment
-- has none, and the reader never consults this table for one.
--
-- THAT INVARIANT IS DEFENDED BY CONSTRUCTION RATHER THAN BY A CONSTRAINT. A
-- cross-row rule ("no children when the parent says 'class'") cannot be a CHECK
-- and would need a trigger. It does not need one: the read path resolves a
-- class-target live from enrolments and never looks here, so a stray row cannot
-- change any answer the product gives. A trigger would refuse a row that is
-- already inert.
--
-- The mirror of that rule matters more and is enforced in the route: a
-- 'student' assignment with zero rows targets NOBODY and must render as such.
-- It must never fall back to the class roster -- that would silently turn a
-- half-written assignment into a class-wide one.

create table if not exists public.assignment_students (
  -- Cascade: deleting the assignment deletes its targets. Nothing here is
  -- meaningful without the parent.
  assignment_id uuid not null
    references public.assignments(id) on delete cascade,

  -- Cascade, matching official_scores.student_id (sql/official_scores.sql:85).
  -- A deleted student must not leave a dangling target row that a tracker would
  -- then count into a denominator.
  student_id uuid not null
    references auth.users(id) on delete cascade,

  -- Composite primary key, doing two jobs. It makes the same student twice in
  -- one assignment impossible, and Postgres indexes a primary key
  -- automatically, so the "who is targeted by this assignment" lookup is served
  -- by the leading column with no separate index needed. The student-side index
  -- in A3 is the one the PK does NOT give.
  primary key (assignment_id, student_id)
);

comment on table public.assignment_students is
  'Which students a target_type=''student'' assignment names. Empty for '
  'class-target assignments, which resolve live against active enrolments '
  'instead. Read filters these ids through active membership, so a removed '
  'student drops out of the tracker.';


-- ─────────────────────────────────────────────────────────────────────────────
-- A3. Indexes
-- ─────────────────────────────────────────────────────────────────────────────

-- The teacher list read: one class's assignments, newest first. Leading column
-- filters, trailing column sorts -- the same shape as worksheets_teacher_idx
-- (sql/worksheets.sql:127) and for the same reason.
create index if not exists assignments_class_created_idx
  on public.assignments (class_id, created_at desc);

-- The student-side read (Build 4b) and the exists() in the A7 student policy:
-- "which assignments name me". NOT covered by the primary key, whose leading
-- column is the assignment -- a lookup by student alone cannot use it.
create index if not exists assignment_students_student_idx
  on public.assignment_students (student_id);

-- NO index on (course_id, topic_id). Nothing filters assignments by topic: the
-- teacher surface asks "what has been set for this class" and the student
-- surface asks "what has been set for me". An index for a query nobody makes is
-- write cost for nothing, and sql/fk_indexes.sql:105-120 is the file that
-- exists because the opposite mistake was made elsewhere.


-- ─────────────────────────────────────────────────────────────────────────────
-- A4. Duplicate prevention
-- ─────────────────────────────────────────────────────────────────────────────
--
-- One live whole-class assignment per topic per class.
--
-- PARTIAL, AND THE `where` CLAUSE IS THE WHOLE DESIGN. Student-targets are
-- deliberately excluded, because assigning one topic to Group A due Friday and
-- Group B due Monday is the ad-hoc-subset case working exactly as intended. A
-- unique index over all rows would refuse it, and would be this schema
-- contradicting its own targeting model.
--
-- WHAT THIS COSTS, stated rather than discovered later: a teacher who wants to
-- re-assign a topic for review later in the term is refused until the first
-- assignment is deleted. Accepted. The route maps 23505 (unique_violation) to a
-- 409 carrying the existing assignment's id, so the UI can offer "change the
-- due date instead" rather than showing a database error -- the same treatment
-- of 23505 the class-create route already gives it
-- (app/api/teacher/classes/route.ts:78-81).
create unique index if not exists assignments_one_class_target_idx
  on public.assignments (class_id, course_id, topic_id)
  where target_type = 'class';


-- ─────────────────────────────────────────────────────────────────────────────
-- A5. Row level security, ON, in this migration and not a later one
-- ─────────────────────────────────────────────────────────────────────────────
--
-- The alternative -- create the tables now, add the policies when the API is
-- wired -- means a window in which every teacher can read every other teacher's
-- assignments and every student can read every other student's. Windows like
-- that are how sql/curriculum_topics_public.sql came to exist, and the argument
-- is already written out at sql/worksheets.sql:144-150.
--
-- RLS enabled with no policy denies everyone, and a policy with RLS off is
-- inert. Both halves ship here: A5 turns it on, A6 grants, A7 and A8 filter.

alter table public.assignments         enable row level security;
alter table public.assignment_students enable row level security;


-- ─────────────────────────────────────────────────────────────────────────────
-- A6. Grants: REVOKE FIRST, THEN GRANT
-- ─────────────────────────────────────────────────────────────────────────────
--
-- A NEW TABLE IN THIS PROJECT DOES NOT ARRIVE WITH AN EMPTY GRANT LIST.
-- Supabase ships ALTER DEFAULT PRIVILEGES for anon and authenticated in the
-- public schema, so a bare `create table` hands both roles privileges before a
-- single line of this file runs. Writing only the grant leaves whatever was
-- inherited sitting underneath it, invisibly, because a grant can only add.
--
-- That is not hypothetical. Query 2 of section 6 of sql/official_scores.sql
-- caught exactly this on official_score_aggregate in production on 2026-08-23:
-- SELECT to authenticated, on a table whose own comments described it as having
-- no grant at all. The revoke below is what makes A5-A8 a description of
-- reality rather than an assertion about it.
--
-- Idempotent by construction: revoke-then-grant reaches the same end state
-- however many times it runs, and whatever the defaults were at create time.
revoke all on public.assignments         from anon, authenticated;
revoke all on public.assignment_students from anon, authenticated;

-- SELECT ONLY, and that is the whole of it.
--
-- THERE IS NO INSERT, UPDATE OR DELETE GRANT AND THERE MUST NOT BE ONE. Every
-- write goes through /api/teacher/assignments on the service-role client, after
-- requireTeacher() and profileGrants(). A teacher whose subscription has lapsed
-- still holds a valid JWT, so a direct-client insert grant would let them write
-- straight past the plan check -- the same posture, for the same reason, as
-- worksheets (sql/worksheets.sql:157-162) and announcements
-- (sql/announcements.sql:40-42).
--
-- ANY anon ROW ON EITHER TABLE IS A BUG. Neither is public in any form.
grant select on public.assignments         to authenticated;
grant select on public.assignment_students to authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- A7. Policies on assignments
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Two readers, two policies. Postgres ORs permissive policies together, so a
-- teacher who is also enrolled somewhere as a student sees both sets and
-- neither policy has to know about the other.
--
-- NOTE WHAT THESE POLICIES ARE FOR. Every teacher route runs on the
-- service-role client, which bypasses RLS entirely: the tenancy boundary for
-- the API is the ownership check in the handler, and that is stated at
-- app/lib/teacher-scope.ts:5-11 and app/api/teacher/official-scores/
-- route.ts:100-105. These policies are the second line -- what protects the
-- tables from a direct PostgREST read with a token, which is the request no
-- application test ever makes.

-- Teacher: ownership resolved through the class, which is the only place
-- teacher identity lives. There is no sharing model and no co-teacher concept.
--
-- This admits a teacher whose subscription has lapsed. auth.uid() is identity,
-- not entitlement, and RLS cannot see profiles.plan without a subquery on every
-- row. Entitlement is enforced one layer up by requireTeacher() plus
-- profileGrants() on every route that touches these tables. RLS here is the
-- tenancy boundary -- "not another teacher's class" -- not the paywall. Same
-- reasoning as official_scores_select_own_class (sql/official_scores.sql:250).
create policy assignments_select_own_class
  on public.assignments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.classes c
      where c.id = assignments.class_id
        and c.teacher_id = auth.uid()
    )
  );

-- Student: class-target AND actively enrolled, OR student-target AND named.
--
-- `e.status = 'active'`, NOT `coalesce(e.status,'active') <> 'removed'`. The
-- column is read both ways in this codebase and the two readings disagree;
-- app/lib/course-access.ts:56 records which one is correct, and every teacher
-- surface goes through activeStudentIds (app/lib/teacher-scope.ts:94), which
-- bakes in `= 'active'`. This policy matches the code path that computes the
-- tracker, so a student cannot see an assignment the teacher's own view says
-- is not theirs. announcements_select_scoped (sql/announcements.sql:58) uses
-- the looser form; that divergence is deliberate here, and query 4 of the
-- verification section below is what confirms no live enrolment carries a null
-- status that this would silently exclude.
--
-- The target_type test is inside each branch rather than around them, so a
-- class-target row can never be admitted by a stale assignment_students row and
-- a student-target row can never be admitted by class enrolment alone. The two
-- targeting shapes stay disjoint at the policy level, exactly as they are in
-- the reader.
create policy assignments_select_targeted
  on public.assignments
  for select
  to authenticated
  using (
    (
      target_type = 'class'
      and exists (
        select 1
        from public.class_enrollments e
        where e.class_id = assignments.class_id
          and e.student_id = auth.uid()
          and e.status = 'active'
      )
    )
    or
    (
      target_type = 'student'
      and exists (
        select 1
        from public.assignment_students s
        where s.assignment_id = assignments.id
          and s.student_id = auth.uid()
      )
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- A8. Policies on assignment_students
-- ─────────────────────────────────────────────────────────────────────────────
--
-- THE FIRST POLICY IS ALSO WHAT MAKES A7'S STUDENT BRANCH WORK, and this is the
-- trap worth naming: a subquery inside a policy runs under the CALLING user's
-- row-level security, not the policy owner's. Without a policy admitting a
-- student to their own assignment_students rows, the exists() in
-- assignments_select_targeted would find nothing and silently deny every
-- student-target assignment -- a failure that looks exactly like "no
-- assignments yet".

create policy assignment_students_select_own
  on public.assignment_students
  for select
  to authenticated
  using (student_id = auth.uid());

-- The teacher side: the rows belong to an assignment in a class this teacher
-- owns. Joined through assignments to classes, because assignment_students
-- carries no class_id of its own -- and it should not, since that would be a
-- second copy of a fact the parent already holds and a way for the two to
-- disagree.
create policy assignment_students_select_teacher
  on public.assignment_students
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.assignments a
      join public.classes c on c.id = a.class_id
      where a.id = assignment_students.assignment_id
        and c.teacher_id = auth.uid()
    )
  );


-- ═════════════════════════════════════════════════════════════════════════════
-- A9. RUN LAST, SEPARATELY -- MAY FAIL, AND NOTHING ABOVE DEPENDS ON IT
-- ═════════════════════════════════════════════════════════════════════════════
--
-- The foreign key to the curriculum, so an assignment cannot name a topic that
-- does not exist.
--
-- WHY THIS IS ITS OWN STATEMENT, RUN LAST. It is the only statement in this
-- file that can fail. sql/fk_indexes.sql:110-112 records that
-- (course_id, topic_id) carries a unique index on curriculum_topics because it
-- is the upsert conflict target in curriculum/migrations/upload_curriculum.py
-- -- but sql/ is not the schema source of truth for this project, and a
-- foreign key needs a unique index on the referenced columns that actually
-- exists in production rather than one this repository believes in. If it is
-- not there, Postgres answers 42830 ("there is no unique constraint matching
-- given keys for referenced table") and A1-A8 are already in place, unharmed.
--
-- WHAT IS LOST IF IT FAILS: nothing that is load-bearing today. The route
-- verifies the topic against curriculum_topics with is_placeholder = false
-- before it inserts, which is a strictly stronger check than this FK -- the FK
-- would admit a placeholder and the route will not. This constraint exists to
-- catch a row written by hand in the SQL editor, and to make a deleted topic
-- impossible to orphan.
--
-- WHAT IT CONSTRAINS GOING FORWARD: the curriculum upload upserts and never
-- deletes, so this does not stand in the way of any authoring flow that exists.
-- It would refuse a DELETE of a topic that has been assigned, which is the
-- correct answer.
--
-- Not IF NOT EXISTS -- Postgres has no such form for add constraint. Re-running
-- this after it has succeeded answers 42710 (duplicate_object), which is
-- harmless and means it is already there.

alter table public.assignments
  add constraint assignments_topic_fk
  foreign key (course_id, topic_id)
  references public.curriculum_topics (course_id, topic_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- After running this
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Verification, in the order the blocks above were run. Each is a query with an
-- expected answer, not something to eyeball. Run all four.
--
--
-- 1. GRANTS. The single most important check in this file: a stray INSERT here
--    would let a lapsed teacher write assignments straight past the plan gate,
--    and a stray anon row would expose both tables to the key that ships in the
--    browser bundle.
--
--      select table_name, grantee, privilege_type
--      from information_schema.role_table_grants
--      where table_name in ('assignments', 'assignment_students')
--      order by table_name, grantee, privilege_type;
--
--    EXPECT exactly: authenticated / SELECT, on both tables, and nothing else
--    for authenticated. postgres and service_role rows are normal and expected.
--    ANY anon row at all is a bug. Any INSERT, UPDATE or DELETE against
--    authenticated is a bug -- re-run A6, which subtracts before it adds.
--
--
-- 2. RLS IS ENABLED. Enabled-with-no-policy denies everyone and policy-with-
--    RLS-off is inert, so this and query 3 are halves of one check.
--
--      select relname, relrowsecurity, relforcerowsecurity
--      from pg_class
--      where oid in ('public.assignments'::regclass,
--                    'public.assignment_students'::regclass);
--
--    EXPECT relrowsecurity = t on BOTH rows.
--
--
-- 3. THE POLICIES ARE PRESENT, all four, with the right commands.
--
--      select polrelid::regclass as table_name,
--             polname,
--             polcmd,
--             pg_get_expr(polqual, polrelid) as using_expr
--      from pg_policy
--      where polrelid in ('public.assignments'::regclass,
--                         'public.assignment_students'::regclass)
--      order by table_name, polname;
--
--    EXPECT four rows, every polcmd = r (select):
--
--      assignments          assignments_select_own_class
--      assignments          assignments_select_targeted
--      assignment_students  assignment_students_select_own
--      assignment_students  assignment_students_select_teacher
--
--    Three rows means one create policy did not run. Read using_expr on
--    assignments_select_targeted and confirm both branches survived -- a policy
--    that lost its student-target branch would deny every subset assignment and
--    look identical to "no assignments yet".
--
--
-- 4. THE STATUS ASSUMPTION IN A7. assignments_select_targeted matches
--    `status = 'active'` exactly, following activeStudentIds
--    (app/lib/teacher-scope.ts:94), while announcements_select_scoped
--    (sql/announcements.sql:58) coalesces a null to active. If live enrolments
--    carry nulls, this policy would silently exclude those students from
--    class-target assignments in Build 4b.
--
--      select status, count(*)
--      from public.class_enrollments
--      group by status
--      order by count(*) desc;
--
--    EXPECT 'active' and 'removed' only. A null row, or any third value, is a
--    decision to bring back before Build 4b wires the student surface -- not
--    something to patch into this policy without deciding what that status
--    means.
--
--
-- 5. NOT VERIFIABLE BY QUERY, and therefore not claimed here. None of the above
--    proves the boundary HOLDS -- it proves the objects exist. That the write
--    path actually refuses another teacher's class, refuses a student who is
--    not an active member, and refuses a placeholder topic is proved by
--    scripts/faultproof_assignments.mjs in the build phase, over HTTP, on a
--    build where each guarding line has been deleted in turn and shown to
--    redden exactly the checks that depend on it.
