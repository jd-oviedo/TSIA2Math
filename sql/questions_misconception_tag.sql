-- questions.misconception_tag
--
-- DRAFT -- not applied. Run this by hand in the Supabase SQL editor.
--
-- Per-option misconception slug for CAT bank items, keyed by answer letter:
--
--   {"A": "irrational_assumed_larger",
--    "B": "irrational_assumed_larger",
--    "C": "fraction_digit_gluing"}
--
-- The correct option carries no tag and is absent from the map by design, so
-- this column is ANSWER-BEARING: the missing letter is the answer. Same shape
-- and same rule as curriculum_topics.misconception_tags -- see the docstring on
-- extract_misconception_tags() in curriculum/migrations/upload_curriculum.py.
--
-- Values come from the 475-slug taxonomy in
-- data/docs/misconception_taxonomy.json and feed record_misconception()
-- (sql/student_misconceptions.sql) from app/api/sessions/route.ts.
--
-- ORDER OF OPERATIONS. This migration must run BEFORE either of:
--   * deploying the branch that selects misconception_tag (the teacher
--     dashboard degrades gracefully, but returns nothing until the column and
--     the data are both there);
--   * running upload_to_supabase.py, which upserts whole item objects and will
--     fail outright against a table without the column.
-- The upload script preflights for the column and refuses to run without it.


-- 1. The column ------------------------------------------------------------
--
-- not null default '{}' so every existing row is valid immediately and no
-- backfill is needed; the upload then fills in the real maps.

alter table public.questions
  add column if not exists misconception_tag jsonb not null default '{}'::jsonb;


-- 2. questions_public must NOT gain this column ----------------------------
--
-- THIS IS A CONSTRAINT ON FUTURE EDITS, NOT A STATEMENT TO RUN.
--
-- questions_public is an explicit column projection over a locked-down
-- questions table (sql/questions_lockdown.sql), so adding a column here does
-- not add it to the view -- the exclusion is structural, not incidental. Do
-- not "fix" that by adding misconception_tag to the view: it would hand every
-- anonymous test-taker the answer key by omission, which is exactly the class
-- of hole that questions_lockdown.sql was written to close.
--
-- Verify after running section 1 -- this must return zero rows:

--   select column_name
--   from information_schema.columns
--   where table_schema = 'public'
--     and table_name   = 'questions_public'
--     and column_name  = 'misconception_tag';

-- scripts/audit_anon_exposure.py enforces the same thing from outside, against
-- the live anon key, and fails if the column ever appears in the view's
-- OpenAPI spec or in a sampled row.


-- 3. Index -----------------------------------------------------------------
--
-- Deliberately none. Every read of this column today is by primary key --
-- app/lib/misconception-aggregate.ts and app/api/sessions/route.ts both fetch
-- `where item_id in (...)`, and nothing queries the jsonb contents. A GIN
-- index would cost writes on every upload for no read.
--
-- Add one only when something needs "which items test slug X", e.g. an
-- item-count for the teacher card sourced from the bank rather than from a
-- class's wrong answers:
--
--   create index if not exists questions_misconception_tag_gin
--     on public.questions using gin (misconception_tag jsonb_path_ops);


-- 4. Misconception source vocabulary: ALREADY ENFORCED, nothing to do here --
--
-- An earlier draft of this file proposed adding a CHECK on the source
-- vocabulary, on the belief that p_source was unconstrained text. That was
-- wrong. sql/gumu_tables.sql section 4 already applies the enforcement, and it
-- is live in production -- confirmed by direct query on 2026-08-12:
--
--   * public.student_misconceptions has a CHECK on the sources array,
--     restricting it to ('cat', 'curriculum', 'socratic')
--   * it has a second CHECK pinning confidence to ('low', 'medium', 'high')
--   * record_misconception() itself raises on an unknown p_source before it
--     reaches the insert, so the caller gets a named error rather than a
--     constraint violation from inside plpgsql
--
-- Do not re-add those constraints. Applying them twice fails on the duplicate
-- constraint name, and the second attempt is the kind of thing that gets run
-- against prod at speed because it "should be a no-op".
--
-- To re-verify at any point:
--
--   select conname, pg_get_constraintdef(oid)
--   from pg_constraint
--   where conrelid = 'public.student_misconceptions'::regclass
--     and contype = 'c';
--
-- Note what this does and does not buy. The constraints reject an *unknown*
-- source. They cannot reject a *valid* source used in the wrong place: a CAT
-- call site passing 'socratic' satisfies every constraint and silently
-- fast-tracks the confidence ladder. That remains an application-side concern,
-- which is why app/api/sessions/route.ts routes the value through the single
-- named constant CAT_MISCONCEPTION_SOURCE.
--
-- Live data as of 2026-08-12 records only 'curriculum'; the CAT path has not
-- written yet.
