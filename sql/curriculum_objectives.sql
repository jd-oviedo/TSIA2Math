-- curriculum_objectives
--
-- Run this in the Supabase SQL editor. Kept here for version control.
--
-- Adds curriculum_topics.objectives and puts it on curriculum_topics_public.
-- Safe to run more than once: the ALTER is IF NOT EXISTS and the view is a
-- CREATE OR REPLACE.
--
--
-- WHAT IT HOLDS
--
-- The three bullets under the `#### **Learning Objectives**` heading that every
-- one of the 97 source markdown files already carries, as an ordered list of
-- short strings. upload_curriculum.py parses them (parse_objectives) and sends
-- them in the upsert; lib/curriculum-fixture.ts parses the same block the same
-- way for the local render path, and scripts/verify_fixture_parity.mjs compares
-- the two.
--
-- Strings are stored as authored, which means `$...$` math spans arrive RAW.
-- They are markdown, exactly as guided_notes is, and rendering is the reader's
-- job. Nothing in this column is pre-rendered HTML.
--
--
-- WHY jsonb DEFAULT '[]' AND NOT '{}'
--
-- The four jsonb columns already on this table (practice_items,
-- misconception_tags, distractor_prose, worked_solutions) are all
-- `jsonb not null default '{}'::jsonb` because every one of them is a MAP,
-- keyed by section and item number. objectives is a LIST: order is meaningful,
-- the bullets are read top to bottom, and nothing keys into them. So it takes
-- the same not-null jsonb shape with the empty ARRAY as its default.
--
-- That difference is load-bearing rather than cosmetic. Defaulting a list
-- column to '{}' would hand every unpopulated row an empty OBJECT, and
-- `jsonb_array_elements` and every array-shaped read in front of it would fail
-- on it at runtime rather than at deploy time.
--
--
-- WHY IT IS SAFE ON THE PUBLIC VIEW, WHICH ITS NEIGHBOURS ARE NOT
--
-- distractor_prose and worked_solutions (sql/curriculum_prose_columns.sql) are
-- deliberately kept OFF curriculum_topics_public: they are answer-bearing, and
-- that file's verification step 3 treats a single row coming back from the view
-- as a failure. answer_key, misconception_tags and misconceptions_used are off
-- it for the same reason, and practice_items is on it only after
-- jsonb_strip_keys has recursively removed correct_answer and
-- misconception_tag.
--
-- objectives is the opposite case. It is the "what you will be able to do"
-- header a student is meant to read BEFORE attempting anything, it names skills
-- rather than results, and it is derived from a section of the markdown that
-- sits above Part 1 and therefore cannot contain an answer key. It goes on the
-- view unredacted and on purpose.
--
-- That is a claim about authored content, not a structural guarantee, and it is
-- worth naming as such: an author who wrote a worked answer into an objective
-- bullet would publish it to anon and nothing here would fire. The same
-- residual risk already applies to Parts 2 and 3, which are served raw, and it
-- is asserted from the outside by scripts/check_topic.py rather than in SQL.
--
--
-- APPEND ONLY
--
-- THREE files now issue a CREATE OR REPLACE of curriculum_topics_public:
--
--   sql/curriculum_topics_public.sql
--   sql/curriculum_placeholder_topics.sql
--   sql/curriculum_objectives.sql          (this file)
--
-- They must select the same columns in the same order. CREATE OR REPLACE VIEW
-- can only APPEND: it cannot drop, reorder, rename or retype an existing
-- column, so objectives goes on the END of all three lists and the existing
-- order is not to be tidied. Read the header of sql/curriculum_topics_public.sql
-- before touching any of them; issue #84 is what happens when they drift.
--
-- CREATE OR REPLACE also PRESERVES the view's grants, which a DROP would take
-- with it. Nothing in this file re-grants anything, and nothing should.


-- ─── The column ──────────────────────────────────────────────────────────────

alter table public.curriculum_topics
  add column if not exists objectives jsonb not null default '[]'::jsonb;

comment on column public.curriculum_topics.objectives is
  'Learning objectives: ordered list of short strings. NOT answer-bearing, '
  'safe for the public view. Populated from the Learning Objectives markdown '
  'section.';


-- ─── The view ────────────────────────────────────────────────────────────────

-- Reproduced verbatim from sql/curriculum_topics_public.sql with objectives
-- appended last. Do not reorder or tidy anything above it.
create or replace view public.curriculum_topics_public
with (security_invoker = false) as
select
  id,
  course_id,
  topic_id,
  topic_name,
  unit_number,
  sequence_in_unit,
  estimated_time_minutes,
  difficulty_band,
  assessment_layer,
  related_strand,
  keywords,
  prerequisites,
  guided_notes,
  public.jsonb_strip_keys(
    practice_items,
    array['correct_answer', 'misconception_tag']
  ) as practice_items,
  practice_problems,
  mini_quiz,
  created_at,
  updated_at,
  is_placeholder,
  objectives
from public.curriculum_topics;


-- ─── After running this ──────────────────────────────────────────────────────
--
-- 1. Confirm the column exists with the right type and default:
--
--      select column_name, data_type, is_nullable, column_default
--      from information_schema.columns
--      where table_schema = 'public'
--        and table_name = 'curriculum_topics'
--        and column_name = 'objectives';
--
--    Expect one row: objectives, jsonb, NO, '[]'::jsonb.
--
-- 2. Confirm the view exposes it:
--
--      select column_name
--      from information_schema.columns
--      where table_schema = 'public'
--        and table_name = 'curriculum_topics_public'
--        and column_name = 'objectives';
--
--    Expect ONE row. This is the reverse of the expectation for
--    distractor_prose and worked_solutions in sql/curriculum_prose_columns.sql,
--    where zero rows is the pass, and the difference is the point: those are
--    answer-bearing and this is not.
--
-- 3. Confirm the view still returns rows at all, since replacing it is the one
--    step here that could take the read path down:
--
--      select count(*) from public.curriculum_topics_public;
--
--    Expect the live topic count, not 0.
--
-- 4. Confirm every row starts at the default, BEFORE any upload:
--
--      select count(*) filter (where objectives = '[]'::jsonb) as empty,
--             count(*) as total
--      from public.curriculum_topics;
--
--    Expect empty = total. Nothing is populated by this file.
--
-- 5. AFTER upload_curriculum.py has run, the same query should show only the
--    placeholder rows still empty, because they have no markdown to parse:
--
--      select topic_id
--      from public.curriculum_topics
--      where objectives = '[]'::jsonb
--      order by topic_id;
--
--    Expect exactly the *.COMING-SOON rows from
--    sql/curriculum_placeholder_topics.sql and nothing else. A real topic_id in
--    this list means the uploader parsed no bullets for it, which is a content
--    fault in that file's Learning Objectives block, not a fault here.
--
-- 6. Spot-check one row end to end, through the view rather than the table:
--
--      select topic_id, jsonb_array_length(objectives) as n, objectives
--      from public.curriculum_topics_public
--      where course_id = 'tsia2-math' and topic_id = 'GR.3.2';
--
--    Expect n = 3, and the `$...$` spans present and unrendered.
