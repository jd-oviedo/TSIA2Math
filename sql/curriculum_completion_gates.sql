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
