-- curriculum_completion: mastery gate columns
--
-- The table already existed (user_id, topic_id, course_id, completed_at,
-- quiz_score) and was built for exactly this, but nothing had ever written to
-- it: it held zero rows. Wiring up the lesson/practice/quiz gates is what it
-- was for, and it needs somewhere to keep the two facts it has no slot for --
-- whether the guided notes were read, and how the practice section went.
--
-- Snapshot rather than derived, per Juan's call. The append-only
-- curriculum_attempts log stays the record of what actually happened, and every
-- gate read takes the higher of the two, so a snapshot that is missing or stale
-- can never lock a student out of a gate they have already cleared.
--
-- Run this in the Supabase SQL editor. Kept here for version control.
--
-- ─── APPLIED. THIS FILE IS A RECORD, NOT A PENDING MIGRATION ─────────────────
--
-- Confirmed against production 2026-08-21: every column added below is present
-- on the live table. Applied in commit ea21014, "feat(curriculum): split topics
-- into lesson/practice/quiz with mastery-gated nav".
--
-- TWO STATEMENTS ABOVE ARE NOW STALE. Both were true when written. They are
-- named here rather than rewritten, the same way sql/entitlement_columns.sql
-- keeps its superseded capability map, because somebody will come looking for
-- why they changed.
--
--   "it held zero rows"
--       True at authoring. The table holds 36 rows as of 2026-08-21, all with
--       course_id 'tsia2-math', none with a null in user_id, course_id or
--       topic_id, 35 with a lesson_completed_at and 9 with a completed_at.
--
--   "so no grant to authenticated is needed"
--       Read as a claim about what the database actually grants, this is wrong,
--       and it was wrong when it was written. Measured 2026-08-21 against
--       information_schema.role_table_grants: authenticated holds SELECT, and
--       postgres and service_role hold the full set. anon holds nothing.
--
--       The sentence is right about what the APPLICATION needs, which is what it
--       was reasoning about: every read and write goes through the service-role
--       admin client, verified across all three call sites in the repo. It is
--       wrong about what is granted, and the difference matters because the
--       grant exists anyway.
--
--       Nothing leaks. RLS is enabled with no policy, so authenticated's SELECT
--       is authorised, planned, and returns zero rows. That makes RLS the entire
--       distance between a session key that ships in the browser and every
--       student's completion record. Tracked with the rest of the stray-grant
--       cleanup at sql/curriculum_item_templates.sql; not revoked here, because
--       revoking one table of that set makes the class harder to see.

alter table public.curriculum_completion
  add column if not exists lesson_completed_at timestamptz,
  add column if not exists practice_correct int,
  add column if not exists practice_total   int,
  add column if not exists quiz_correct     int,
  add column if not exists quiz_total       int;

-- One row per student per topic, and the conflict target the snapshot upsert
-- names. Without this the writer would append a new row on every answer.
create unique index if not exists curriculum_completion_user_topic_key
  on public.curriculum_completion (user_id, course_id, topic_id);

-- Reads and writes both go through the service role in app code
-- (app/lib/curriculum-progress.ts), so no grant to authenticated is needed.
-- Enabling RLS with no policy is the same zero-grant shape curriculum_attempts
-- uses: a direct browser read returns nothing by design.
alter table public.curriculum_completion enable row level security;
