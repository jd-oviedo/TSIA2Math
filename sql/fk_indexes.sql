-- Foreign-key indexes for the tables that predate the sql/ convention.
--
-- Postgres auto-indexes primary keys and unique constraints, and nothing else.
-- Every table in sql/ was written with its indexes declared inline, so those
-- are covered. The tables below were created ad hoc in the Supabase dashboard
-- before that convention started, and their FK columns have never been
-- verified. This file assumes the worst and creates what is missing.
--
-- Every statement is IF NOT EXISTS, so running it against a database that
-- already has some of these is a no-op on those and safe to re-run.
--
-- BEFORE running, capture the current state so we know what actually changed:
--
--   SELECT tablename, indexname, indexdef
--   FROM pg_indexes
--   WHERE schemaname = 'public'
--   ORDER BY tablename, indexname;
--
-- Run in the Supabase SQL editor. Kept here for version control.


-- ---------------------------------------------------------------------------
-- sessions
-- ---------------------------------------------------------------------------
-- Hot. Every teacher roster read, the per-student drill-down, the misconception
-- rollup and the student dashboard all filter sessions on user_id and sort by
-- created_at desc. The composite serves both the filter and the sort, and a
-- leading-column lookup on user_id alone still uses it, so no separate
-- single-column index is needed.
create index if not exists sessions_user_created_idx
  on public.sessions (user_id, created_at desc);

-- teacher_id is written on every insert (app/api/sessions/route.ts) but nothing
-- currently reads by it. Left out on purpose -- an index on a column no query
-- touches is write cost with no read benefit. Add it when a query needs it.


-- ---------------------------------------------------------------------------
-- responses
-- ---------------------------------------------------------------------------
-- Hot. Both misconception routes fetch wrong answers with
-- .in("session_id", [...]).eq("is_correct", false), so the composite matches
-- the query exactly rather than filtering is_correct after the scan.
create index if not exists responses_session_correct_idx
  on public.responses (session_id, is_correct);

-- responses.item_id is never a WHERE predicate -- it is read out and joined to
-- questions in JS. No index proposed.


-- ---------------------------------------------------------------------------
-- class_enrollments
-- ---------------------------------------------------------------------------
-- The teacher side always asks "who is in this class, actively".
create index if not exists class_enrollments_class_status_idx
  on public.class_enrollments (class_id, status);

-- The student side asks the mirror question: "what classes am I in".
-- Used by the dashboard and by GUMU's teacher-notification lookup.
create index if not exists class_enrollments_student_idx
  on public.class_enrollments (student_id);


-- ---------------------------------------------------------------------------
-- classes
-- ---------------------------------------------------------------------------
-- Every teacher API route re-verifies class ownership before returning
-- anything, so this is on the path of every single teacher request.
create index if not exists classes_teacher_idx
  on public.classes (teacher_id)
  where archived_at is null;


-- ---------------------------------------------------------------------------
-- audit_log
-- ---------------------------------------------------------------------------
-- Cold today: written on every completed test, read by nobody in app code.
-- Indexed anyway because the first time anyone investigates an incident they
-- will filter by user and time, and by then the table is large.
create index if not exists audit_log_user_created_idx
  on public.audit_log (user_id, created_at desc);


-- ---------------------------------------------------------------------------
-- item_flags
-- ---------------------------------------------------------------------------
-- Cold. The teacher review queue lists flags newest-first.
create index if not exists item_flags_created_idx
  on public.item_flags (created_at desc);


-- ---------------------------------------------------------------------------
-- pending_invites
-- ---------------------------------------------------------------------------
-- Cold. Looked up by the invited email when a new account is claimed.
create index if not exists pending_invites_email_idx
  on public.pending_invites (email);


-- ---------------------------------------------------------------------------
-- Deliberately not included
-- ---------------------------------------------------------------------------
-- profiles.id            primary key, already indexed. Every read is an
--                        own-row lookup by id; nothing filters on role.
-- questions.item_id      has a unique constraint (upload_to_supabase.py and
--                        scripts/seed_questions.mjs both upsert on it), so it
--                        is already indexed.
-- curriculum_topics      (course_id, topic_id) is the upsert conflict target in
--                        curriculum/migrations/upload_curriculum.py, so it
--                        carries a unique index already.
-- curriculum_attempts    covered by sql/curriculum_attempts.sql
-- curriculum_completion  covered by sql/curriculum_completion_gates.sql
-- gumu_sessions          covered by sql/gumu_tables.sql
-- gumu_messages          covered by sql/gumu_tables.sql
-- teacher_notifications  covered by sql/gumu_tables.sql
-- student_misconceptions covered by sql/student_misconceptions.sql
-- announcements          covered by sql/announcements.sql
