-- gumu_sessions.status gains 'ended_support': a session that stopped being
-- about math.
--
-- DESIGN AND DDL, FOR REVIEW. Juan runs this manually in the Supabase SQL
-- editor. Idempotent: the constraint is dropped by name and recreated, so
-- re-running it is a no-op.
--
--
-- WHY A NEW STATUS AND NOT A NEW RESOLUTION
--
-- Four statuses exist, and 'resolved_flagged' splits into two endings recorded
-- in `resolution`: 'student_gave_up' (the escape hatch, the answer was
-- disclosed) and 'turn_cap' (GUMU ran out of turns). Both mean the same thing at
-- a higher level: GUMU could not get the student there ON THE MATH. Neither can
-- carry a conversation that stopped being about math at all, and filing one
-- under 'resolved_flagged' would conflate a crisis with a math failure in every
-- query that groups by status.
--
-- The sharper reason is app/lib/attempt-sets.ts. revealedItemsInSection releases
-- a worked solution on `status = 'resolved_flagged' AND resolution =
-- 'student_gave_up'`. A new RESOLUTION under 'resolved_flagged' would be safe
-- today and one careless edit away from releasing a worked solution to a student
-- whose session ended in a crisis stop. A new STATUS cannot match that predicate
-- at all. The mistake becomes impossible rather than merely not-yet-made.
--
--
-- gumu_sessions_resolution_check IS NOT TOUCHED, AND MUST NOT BE
--
-- It reads:
--
--   check (resolution is null or resolution in ('turn_cap', 'student_gave_up'))
--
-- It already permits null, and sql/gumu_sessions_resolution.sql records that
-- null must stay legal because 'active', 'resolved_retry_success' and
-- 'abandoned' all leave it null. An 'ended_support' row leaves it null too and
-- passes that constraint unchanged. So exactly one constraint changes here, not
-- two.
--
--
-- THE SHAPE OF THE STATUS CHECK IS PRESERVED
--
-- Unlike the resolution check, gumu_sessions_status_check has NO `is null or`
-- branch, because status is `not null default 'active'`. That is deliberate and
-- is carried over below verbatim: only the array gains a member. Adding an
-- `is null or` branch while recreating it would quietly make the column
-- null-permissive at the check level, which is not what this change is for.
--
--
-- RUN THIS BEFORE DEPLOYING THE CODE THAT WRITES IT
--
-- Same hazard as sql/gumu_sessions_resolution.sql, which says "THIS DDL MUST RUN
-- BEFORE the application starts writing `resolution`". If the deploy lands
-- first, the crisis stop's UPDATE violates this constraint and fails.
--
-- The student is not harmed by that ordering: stopForSupport in
-- app/api/gumu/session/route.ts checks the error, logs it naming this file, and
-- returns the crisis resources regardless, because a bookkeeping write must
-- never gate showing someone a crisis line. But the session would stay 'active',
-- the notification would still fire, and nothing would record that it happened.
-- So: DDL first, then deploy.
--
--
-- NO OTHER SCHEMA CHANGE
--
-- The design proposed a `support_detected_by` column recording which detector
-- fired. It is NOT included: the instruction for this constraint was to add
-- 'ended_support' and change nothing else, and the same information now goes to
-- the server log instead, where it carries no student id and no message text and
-- needs no schema. If the split between the lexical floor and the classifier
-- turns out to need per-row analysis, that is a separate change with its own
-- retention question.
--
-- The student's message is deliberately persisted NOWHERE on a crisis stop. It
-- is not written to gumu_messages (the screen runs before that insert, so this
-- is ordering rather than a delete, which would leave the row in WAL and in
-- backups) and there is no table for it here. That is the conservative posture
-- while the counselor questions are open, and it has a known cost: without the
-- text there is no way to measure the false-positive rate empirically. Recorded
-- in gumu-crisis-screen-design.md rather than solved.


-- ---------------------------------------------------------------------------
-- 1. The constraint
-- ---------------------------------------------------------------------------

-- Confirmed against production before writing this, rather than guessed:
--
--   gumu_sessions_status_check
--     CHECK ((status = ANY (ARRAY['active'::text, 'resolved_retry_success'::text,
--       'resolved_flagged'::text, 'abandoned'::text])))
--
-- 'abandoned' is in the array and nothing in the codebase writes it. Adding a
-- value ahead of the code that writes it is therefore established practice here.

alter table public.gumu_sessions
  drop constraint if exists gumu_sessions_status_check,
  add  constraint gumu_sessions_status_check check (status in (
    'active',
    'resolved_retry_success',
    'resolved_flagged',
    'abandoned',
    -- The crisis screen stopped this session. The student was shown crisis
    -- resources, the tutor was never called, and their message was not written
    -- to gumu_messages. resolution stays null: this is not one of the two math
    -- endings.
    'ended_support'
  ));


-- ---------------------------------------------------------------------------
-- 2. One session left stranded by testing this before the DDL ran
--
-- OPTIONAL, and specific to the 2026-08-19 browser verification. Skip it if the
-- select below returns nothing.
--
-- The crisis path was exercised on production data before this file was run, on
-- purpose, to prove that a failed status write does not stop a student seeing
-- the crisis resources. It proved it: the update was rejected with 23514
-- against gumu_sessions_status_check, the route still returned 200, the
-- notification still sent, and the card still rendered.
--
-- The cost of that proof is one row. Because the write was rejected, the session
-- kept status = 'active', and gumu_sessions_one_active_per_item is a partial
-- unique index on exactly that status. So that student cannot open a new GUMU
-- session on that item until the row is closed. This is precisely the silent
-- lockout described in sql/gumu_sessions_resolution.sql, arrived at from the
-- other direction.
--
-- Run section 1 FIRST. Until the constraint admits 'ended_support' this update
-- fails the same way the application's did.

select id, student_id, course_id, topic_id, section, item_number, status, created_at
  from public.gumu_sessions
 where status = 'active'
   and created_at < now() - interval '1 hour';

-- The row from the verification run. resolution stays null: this was not one of
-- the two maths endings, which is the whole point of the new status.
update public.gumu_sessions
   set status      = 'ended_support',
       resolved_at = now()
 where id = '18ad9d1f-3f0d-49be-9166-e6d5c33afc82'
   and status = 'active';


-- ---------------------------------------------------------------------------
-- 3. Verification
-- ---------------------------------------------------------------------------

-- 3a. The constraint now admits five values and still has no null branch.
select conname, pg_get_constraintdef(oid) as definition
  from pg_constraint
 where conrelid = 'public.gumu_sessions'::regclass
   and conname = 'gumu_sessions_status_check';

-- 3b. The resolution constraint is untouched. Expect the original two values
-- plus the null branch.
select conname, pg_get_constraintdef(oid) as definition
  from pg_constraint
 where conrelid = 'public.gumu_sessions'::regclass
   and conname = 'gumu_sessions_resolution_check';

-- 3c. Nothing existing was reclassified. Expect the same counts as before this
-- ran, and zero 'ended_support' rows until the code deploys.
select status, resolution, count(*)
  from public.gumu_sessions
 group by status, resolution
 order by status, resolution nulls first;

-- 3d. A crisis stop must never release a worked solution. This is the predicate
-- in app/lib/attempt-sets.ts revealedItemsInSection, run directly: an
-- 'ended_support' row cannot appear in it, because the predicate requires
-- 'resolved_flagged'. Expect zero 'ended_support' rows in the result, forever.
select id, status, resolution
  from public.gumu_sessions
 where status = 'resolved_flagged'
   and resolution = 'student_gave_up';
