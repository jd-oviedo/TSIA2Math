-- sessions.teacher_id: retire the column
--
-- The column was written on every insert by app/api/sessions/route.ts, always
-- with the test-taker's own id -- a student's uuid in a column named for their
-- teacher. Nothing ever read it: the teacher roster route fetches sessions with
-- .in("user_id", studentIds) and carries a comment saying it is deliberately
-- not filtered by teacher_id, and no other query in the codebase or in sql/
-- names it. So it was never a live bug, only wrong data waiting for the first
-- query that trusted the column name.
--
-- The insert has stopped writing it. This removes it.
--
-- NOT RUN. Held for review like every other file here.
-- Run it in the Supabase SQL editor when you want it; kept for version control.


-- ─── Before running ──────────────────────────────────────────────────────────
--
-- Confirm what this destroys. Every non-null value should equal user_id on the
-- same row -- that is the signature of the bad write, and it is the evidence
-- that no real teacher association is being thrown away:
--
--   select count(*) as total,
--          count(teacher_id) as with_teacher_id,
--          count(*) filter (where teacher_id is distinct from user_id
--                             and teacher_id is not null) as unexpected
--   from public.sessions;
--
-- `unexpected` must be 0. If it is not, some other writer set this column with
-- something meaningful in it, and that needs explaining before the column goes.
--
-- Re-confirm nothing reads it, since this is irreversible without a restore:
--
--   grep -rn "teacher_id" app/ sql/ --include=*.ts --include=*.tsx --include=*.sql
--
-- Every hit should be classes.teacher_id, teacher_notifications.teacher_id, or
-- a comment. None should be sessions.


-- ─── Migration ───────────────────────────────────────────────────────────────

alter table public.sessions
  drop column if exists teacher_id;


-- ─── After running ───────────────────────────────────────────────────────────
--
--   select column_name
--   from information_schema.columns
--   where table_schema = 'public' and table_name = 'sessions'
--   order by ordinal_position;
--
-- Expect: id, created_at, completed_at, final_theta, final_score, max_items,
-- strand_breakdown, user_id. No teacher_id.
--
-- Nothing else needs changing. There was no index on the column (see the note
-- in sql/fk_indexes.sql), no foreign key constraint is referenced anywhere in
-- sql/, and no RLS policy in this directory names it.
