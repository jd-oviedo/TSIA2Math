-- sessions.session_type: tell a student's first CAT run from every later one
--
-- The recommendation engine routes a student from their diagnostic result to a
-- curriculum topic. "Their diagnostic result" needs a definition, and the table
-- did not have one: a `sessions` row records a completed 20-item run and
-- nothing on it says whether that run was the free diagnostic a student takes
-- once or the fifth practice retake they took last Tuesday.
--
-- Six of the fifteen students with sessions today have more than one; the
-- heaviest has thirty-one. Picking the wrong one changes which strand comes out
-- weakest and therefore where the student is sent.
--
-- Run this in the Supabase SQL editor. Kept here for version control.
--
-- Status: already applied, 2026-08-12, via the Supabase SQL editor. Kept in the
-- repo as the record of the change, and re-runnable if the project is ever
-- rebuilt -- the add is guarded with `if not exists` and each backfill is
-- filtered on `session_type is null`, so a second run is a no-op rather than a
-- reassignment.
--
-- Verified against production on the same day, by the two queries at the foot
-- of this file: 15 authenticated students with exactly one diagnostic each and
-- none with zero, and a 41 anonymous / 15 authenticated / 49 practice split
-- totalling 105.


-- ─── Why a column rather than "earliest by created_at" ───────────────────────
--
-- The first session per student is already derivable -- order by created_at,
-- limit 1 -- and that derivation is exactly what the backfill below runs. So
-- the column stores no information that could not be recomputed, which is
-- normally an argument against having it.
--
-- It is here for two reasons that are not about information content.
--
-- The derived version cannot express anything except "earliest". The moment a
-- teacher-assigned placement run, or a re-diagnostic at the end of a course,
-- becomes a thing, the ordering rule silently gives the wrong answer and every
-- caller has to be found and changed. A column takes a new value in the CHECK
-- constraint instead.
--
-- And the derived version is invisible when something goes wrong. "Why was this
-- student sent to Geometry" is answerable by looking at a row if the row says
-- which session drove it, and requires re-running a query in your head if it
-- does not.


-- ─── The column ──────────────────────────────────────────────────────────────

-- Added nullable, backfilled, then constrained. Adding it NOT NULL DEFAULT
-- 'practice' in one statement would be shorter and would be wrong: every one of
-- the 105 existing rows would take the default, and the backfill below would
-- then have to distinguish "row that was correctly written as practice" from
-- "row that got the default because it predates the column". Leaving it null
-- until the backfill runs makes the unbackfilled state visibly incomplete
-- rather than plausibly finished.
alter table public.sessions
  add column if not exists session_type text;


-- ─── Backfill ────────────────────────────────────────────────────────────────

-- Anonymous sessions first. 41 of the 105 rows have no user_id, and there is no
-- way to tell whether the same person took two of them -- no account, and the
-- table holds nothing else that would link them.
--
-- They are all 'diagnostic'. That is the honest reading of what an anonymous
-- run is: someone arrives on the marketing site, takes the free 20-item test,
-- and that is their diagnostic. It is also the reading the recommendation needs
-- -- an anonymous test-taker is shown a "start here" topic computed from the
-- session in front of them, and calling that session 'practice' would mean
-- withholding the one thing the page exists to offer.
--
-- The alternative, leaving them null, was rejected: null would then mean both
-- "anonymous, unknowable" and "row written before the column existed", and the
-- NOT NULL below could never be applied.
update public.sessions
set session_type = 'diagnostic'
where user_id is null
  and session_type is null;

-- Authenticated sessions: everything is practice, then the earliest per student
-- is promoted. Written in that order rather than as one CASE so that a student
-- with exactly one session is handled by the same code path as a student with
-- thirty-one, instead of by a branch that only the single-session case reaches.
update public.sessions
set session_type = 'practice'
where user_id is not null
  and session_type is null;

-- distinct on (user_id) with a matching order by is Postgres's "first row per
-- group". id is the second sort key so that two sessions sharing a created_at
-- to the microsecond still resolve to one deterministic winner rather than
-- whichever the planner reached first -- re-running this file must not be able
-- to move the diagnostic flag from one row to another.
update public.sessions
set session_type = 'diagnostic'
where id in (
  select distinct on (user_id) id
  from public.sessions
  where user_id is not null
  order by user_id, created_at, id
);


-- ─── Constrain ───────────────────────────────────────────────────────────────

-- DEFAULT 'practice', and the direction matters.
--
-- If a future insert path forgets to set this column, the failure with a
-- 'practice' default is that the student's recommendation does not fire and
-- they see the generic "start here" card -- a missing feature. The failure with
-- a 'diagnostic' default is that every retake writes a second diagnostic, and
-- the engine starts recommending from whichever one it happens to read, which
-- silently moves a student around the curriculum. Quiet and wrong is worse than
-- visibly absent.
alter table public.sessions
  alter column session_type set default 'practice';

-- Fails loudly if the backfill above left anything null, which is the point:
-- this statement is the check that the backfill covered every row.
alter table public.sessions
  alter column session_type set not null;

-- The vocabulary, closed. Same reasoning as the source CHECK on
-- student_misconceptions: an unknown value here would not throw, it would just
-- never match 'diagnostic' and the student would quietly get no recommendation.
alter table public.sessions
  drop constraint if exists sessions_session_type_check;

alter table public.sessions
  add constraint sessions_session_type_check
  check (session_type in ('diagnostic', 'practice'));

comment on column public.sessions.session_type is
  'diagnostic = this student''s first completed CAT run, or any anonymous run; '
  'practice = every later run. Drives the post-diagnostic curriculum '
  'recommendation. Written by app/api/sessions/route.ts.';


-- ─── Deliberately not added: a unique index ──────────────────────────────────
--
--   create unique index on public.sessions (user_id)
--     where session_type = 'diagnostic' and user_id is not null;
--
-- This would enforce one diagnostic per student, and it is the obvious thing to
-- reach for, because the insert path has a real race: two submissions landing
-- together both see no prior session and both write 'diagnostic'.
--
-- It is not added because of what it does when that race happens. The unique
-- violation aborts the second insert, and that insert is a student's completed
-- test result -- twenty answered questions, already paid for with twenty
-- minutes of their time. Trading a lost test result for a tidy invariant is the
-- wrong trade.
--
-- The read side absorbs the race instead: every lookup takes the *earliest*
-- diagnostic (order by created_at, limit 1), so a duplicate flag is harmless --
-- it picks the same row either way. See firstDiagnosticSession() in
-- app/lib/recommendation.ts.


-- ─── Repairing the deploy window ─────────────────────────────────────────────
--
-- This migration was applied before the code that writes session_type shipped,
-- which is the required order -- app/lib/curriculum-progress.ts filters on a
-- column that has to exist first. The cost of that order is a window: between
-- this file running and the deploy landing, the old insert path does not set
-- session_type, so every session written in the window takes the DEFAULT and
-- is recorded as 'practice'. Including a student's genuine first one.
--
-- The backfill above does not repair those. It is filtered on
-- `session_type is null`, which is what makes it safe to re-run, and a row that
-- took the default is not null -- it is confidently wrong. Re-running this file
-- will not touch them.
--
-- The window was empty when the migration was applied (checked: zero
-- authenticated students without a diagnostic row, zero anonymous sessions
-- marked practice). Check again after deploying:
--
--   select count(*) from public.sessions
--   where user_id is null and session_type = 'practice';
--
--   select count(*) from (
--     select user_id from public.sessions
--     where user_id is not null
--     group by user_id
--     having count(*) filter (where session_type = 'diagnostic') = 0
--   ) missing;
--
-- Both zero means nothing was completed in the window and there is nothing to
-- do. If either is non-zero, run the two statements below -- they are the
-- backfill again, rewritten to key on "has no diagnostic" rather than "is
-- null", which is the condition that actually describes a window casualty.
--
--   update public.sessions
--   set session_type = 'diagnostic'
--   where user_id is null and session_type = 'practice';
--
--   update public.sessions
--   set session_type = 'diagnostic'
--   where id in (
--     select distinct on (user_id) id
--     from public.sessions
--     where user_id is not null
--       and user_id in (
--         select user_id from public.sessions
--         where user_id is not null
--         group by user_id
--         having count(*) filter (where session_type = 'diagnostic') = 0
--       )
--     order by user_id, created_at, id
--   );
--
-- Both are safe to run repeatedly: the first matches nothing once anonymous
-- rows are all diagnostic, and the second's subquery excludes any student who
-- already has one, so it can never move the flag off a row it has already set.


-- ─── After running ───────────────────────────────────────────────────────────
--
-- Expect exactly one diagnostic per authenticated student, and no student with
-- zero:
--
--   select count(*) filter (where n_diagnostic = 1) as ok,
--          count(*) filter (where n_diagnostic <> 1) as broken
--   from (
--     select user_id, count(*) filter (where session_type = 'diagnostic') as n_diagnostic
--     from public.sessions
--     where user_id is not null
--     group by user_id
--   ) per_student;
--
-- broken must be 0. Against today's data, ok should be 15.
--
-- And the totals, which should come to 41 anonymous diagnostics + 15
-- authenticated diagnostics = 56 diagnostic, 49 practice:
--
--   select session_type, user_id is null as anonymous, count(*)
--   from public.sessions
--   group by 1, 2
--   order by 1, 2;
