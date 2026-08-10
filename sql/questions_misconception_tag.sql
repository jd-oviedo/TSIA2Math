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


-- 4. Optional hardening: constrain the misconception source ----------------
--
-- Found while wiring the CAT call site. record_misconception() branches on the
-- literal 'socratic' to award high confidence immediately, and every other
-- source walks the ladder (low, medium at 2 hits, high at 3). Nothing enforces
-- the vocabulary: p_source is plain text with no CHECK, no enum, and the
-- allowed values live only in a comment on the function signature. A caller
-- passing 'socratic' from the CAT path -- by typo, or by a refactor that
-- copies the curriculum call site -- silently fast-tracks 4-option
-- multiple-choice evidence to the confidence level that surfaces to a parent.
--
-- The application side is defended (CAT_MISCONCEPTION_SOURCE in
-- app/api/sessions/route.ts is the single named constant), but that is a
-- convention, not a guarantee.
--
-- Run the check FIRST. If it returns anything outside the three known values,
-- fix the data before adding the constraint:

--   select distinct unnest(sources) as source
--   from public.student_misconceptions
--   order by source;

-- Then, only if that returned nothing unexpected:

--   alter table public.student_misconceptions
--     add constraint student_misconceptions_sources_known
--     check (sources <@ array['cat', 'curriculum', 'socratic']::text[]);
--
--   alter table public.student_misconceptions
--     add constraint student_misconceptions_confidence_known
--     check (confidence in ('low', 'medium', 'high'));

-- Left commented because it alters an existing table with live rows, which is
-- your call to make, not a side effect of adding a column to another one.
