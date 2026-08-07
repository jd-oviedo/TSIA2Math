-- Drop the leftover anon/authenticated write grants across the schema
--
-- Found while auditing the curriculum_topics exposure, by sweeping every
-- relation rather than only the one that was reported. Twelve tables grant
-- anon UPDATE and DELETE:
--
--   announcements          curriculum_courses     item_flags
--   class_enrollments      gumu_messages          pending_invites
--   classes                gumu_sessions          student_misconceptions
--   curriculum_attempts    curriculum_completion  teacher_notifications
--
-- None of them is exploitable today. Every one has RLS enabled with no policy,
-- so the statement is authorised, planned, and then matches zero rows. That is
-- the whole of the defence, and it is one `alter table ... disable row level
-- security` away from not existing -- a line somebody could plausibly run while
-- debugging why a query returns nothing, which is the exact circumstance in
-- which RLS looks like the problem rather than the protection.
--
-- curriculum_topics carried the same grants and was, unlike these twelve,
-- fully readable by anon -- so whatever protects these tables demonstrably was
-- not protecting that one. Its grants were no more deliberate than these are.
--
-- Safe to apply. Every write in the application goes through the service-role
-- admin client from a server route -- verified across all 18 write sites, with
-- no browser-side writes anywhere in the codebase -- and service_role is
-- unaffected by grants to anon and authenticated. The seed and upload scripts
-- (scripts/seed_questions.mjs, curriculum/migrations/upload_curriculum.py)
-- also run on the service-role key.
--
-- Reads are deliberately left alone here. This file only removes write
-- privileges nothing uses; the read side is handled per-table by
-- sql/curriculum_topics_public.sql and sql/questions_lockdown.sql.
--
-- Run this in the Supabase SQL editor. Kept here for version control.

revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public
  from anon, authenticated;

-- New tables would otherwise arrive with whatever the default privileges say.
-- Supabase ships defaults that grant the API roles everything, which is how
-- the grants above appeared without anyone choosing them.
alter default privileges in schema public
  revoke insert, update, delete, truncate, references, trigger
  on tables from anon, authenticated;
