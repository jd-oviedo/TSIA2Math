-- Placeholder topics for AR, GR and PR
--
-- The curriculum is six topics, all of them QR. The CAT blueprint is QR 6 /
-- AR 7 / GR 3 / PR 4 (app/adaptive-test/engine.ts), so AR is the largest strand
-- on the diagnostic and has no curriculum at all, and three of the four strands
-- a student can come out weakest in have nowhere to send them.
--
-- The recommendation engine could branch on that -- "if the weakest strand has
-- no topics, fall back to QR" -- and the branch would then have to be found and
-- removed, one strand at a time, as content lands. This file takes the other
-- option: give every strand a real row, so "the first topic in this strand's
-- sequence" is a question with an answer for all four and the engine has no
-- empty case to special-case.
--
-- Run this in the Supabase SQL editor. Kept here for version control.
--
-- Status: already applied, 2026-08-12, via the Supabase SQL editor. Kept in the
-- repo as the record of the change, and re-runnable if the project is ever
-- rebuilt -- the add is guarded with `if not exists`, the view is CREATE OR
-- REPLACE, and the insert carries ON CONFLICT DO UPDATE.
--
-- Verified against production on the same day: 9 rows in the view of which 3
-- are placeholders, the three COMING-SOON rows heading AR, GR and PR, and
-- QR.1.1 still heading QR. The view was additionally read back through the
-- anon key rather than only the service role -- CREATE OR REPLACE is supposed
-- to preserve the grants from sql/curriculum_topics_public.sql, and the way to
-- know it did is for the public key to still get 9 rows, which it does.
--
-- Sequencing: no dependency on sql/sessions_session_type.sql. Either order.


-- ─── The flag ────────────────────────────────────────────────────────────────

-- A placeholder is a curriculum_topics row with no content on it, and something
-- has to say so. Three ways were available:
--
--   a naming convention on topic_id  -- every consumer re-implements a string
--                                       test, and gets it subtly different
--   assessment_layer = 'placeholder' -- no migration at all, the column is
--                                       already in the public view; rejected
--                                       because curriculum/migrations/
--                                       upload_curriculum.py defaults that
--                                       column to 'CRC', so an upload over the
--                                       row would silently promote a
--                                       placeholder to real content
--   an explicit boolean              -- this
--
-- DEFAULT false, so every existing topic and every future upload is real unless
-- something deliberately says otherwise. upload_curriculum.py does not mention
-- this column, which means content uploaded through it can never accidentally
-- arrive flagged.
alter table public.curriculum_topics
  add column if not exists is_placeholder boolean not null default false;

comment on column public.curriculum_topics.is_placeholder is
  'True on a content-free row that exists only so a strand has a topic_id to '
  'route to. Excluded from the course sequence by getTopics() in '
  'app/lib/curriculum-progress.ts; renders a coming-soon state instead of a '
  'lesson. Delete the row, or set this false, when real content lands.';


-- ─── Expose it to the student read path ──────────────────────────────────────
--
-- app/course/.../topic-data.ts reads curriculum_topics_public for anyone who is
-- not a teacher, and the topic page has to know not to render an empty lesson,
-- so the flag has to be on the view.
--
-- CREATE OR REPLACE, not DROP and recreate. Replace preserves the grants
-- established in sql/curriculum_topics_public.sql -- select to anon and
-- authenticated, nothing else -- where a drop would silently take them with it
-- and every student would get a 42501 on every topic page.
--
-- Replace can only append columns, never reorder or remove them, so the list
-- below is the original select verbatim with one line added at the end. Do not
-- tidy it. Everything the original excluded -- answer_key, misconception_tags,
-- misconceptions_used, related_cate_items -- is still excluded, and the
-- practice_items redaction is unchanged; see that file for why each one is out.
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
  is_placeholder
from public.curriculum_topics;


-- ─── The rows ────────────────────────────────────────────────────────────────

-- unit_number 1, sequence_in_unit 1: where a real first topic in each strand
-- would sit.
--
-- That collides with QR.1.1, which is also (1, 1). The collision is harmless
-- because getTopics() filters is_placeholder out of the course sequence
-- entirely, so these rows never enter the ordering that the Modules tree, the
-- topic-to-topic navigation and the dashboard's "start here" card are built
-- from. They are reachable by direct URL, which is what the recommendation
-- produces, and by nothing else.
--
-- topic_id is deliberately unmistakable. It renders verbatim in the topic page
-- header ("Topic AR.COMING-SOON") and in any admin or teacher list that shows
-- topic ids, and there is no reading of it that looks like authored content.
--
-- Content columns are empty rather than filled with apologetic prose.
-- curriculum_topics has NOT NULL on guided_notes, practice_problems, mini_quiz,
-- answer_key, misconception_tags and practice_items, so they have to hold
-- something; '' and '{}' are the honest something. The coming-soon copy lives
-- in the React component that renders this state, not in the database
-- masquerading as a lesson -- which also means fixing a typo in it is a code
-- change, not a production data edit.
--
-- estimated_time_minutes stays null so nothing offers a student a duration for
-- a topic that does not exist.
--
-- ON CONFLICT so this file is re-runnable, and DO UPDATE rather than DO NOTHING
-- so that re-running after editing the copy above actually applies the edit.
-- The conflict target is the (course_id, topic_id) unique constraint that
-- upload_curriculum.py already upserts against.
insert into public.curriculum_topics (
  course_id,
  topic_id,
  topic_name,
  unit_number,
  sequence_in_unit,
  related_strand,
  is_placeholder,
  guided_notes,
  practice_problems,
  mini_quiz,
  answer_key,
  misconception_tags,
  practice_items,
  keywords,
  estimated_time_minutes
)
values
  ('tsia2-math', 'AR.COMING-SOON', 'Algebraic Reasoning — coming soon',
   1, 1, 'AR', true, '', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
   '{}'::jsonb, '{}'::text[], null),
  ('tsia2-math', 'GR.COMING-SOON', 'Geometric & Spatial Reasoning — coming soon',
   1, 1, 'GR', true, '', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
   '{}'::jsonb, '{}'::text[], null),
  ('tsia2-math', 'PR.COMING-SOON', 'Probabilistic & Statistical Reasoning — coming soon',
   1, 1, 'PR', true, '', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
   '{}'::jsonb, '{}'::text[], null)
on conflict (course_id, topic_id) do update set
  topic_name       = excluded.topic_name,
  unit_number      = excluded.unit_number,
  sequence_in_unit = excluded.sequence_in_unit,
  related_strand   = excluded.related_strand,
  is_placeholder   = excluded.is_placeholder;


-- ─── Replacing a placeholder with real content ───────────────────────────────
--
-- Two paths, and neither one touches app/lib/recommendation.ts or any routing
-- code. This is a property of how the engine sorts, not a convention someone
-- has to remember.
--
-- The engine asks for the first topic in a strand ordered by
--
--   is_placeholder, unit_number, sequence_in_unit, topic_id
--
-- with is_placeholder first. false sorts before true in Postgres, so a real
-- topic in a strand outranks a placeholder in that strand no matter what
-- unit or sequence numbers either one carries.
--
--   Path A -- upload real content, leave this row alone. Run
--   upload_curriculum.py with the new AR markdown. It arrives with
--   is_placeholder false (the column default, and the script does not set it),
--   so it immediately outranks AR.COMING-SOON and the recommendation follows it
--   from the next request. Deleting the placeholder afterwards is tidiness, not
--   a requirement -- forgetting it cannot route a student wrongly.
--
--   Path B -- take the row over. Update it in place:
--
--     update public.curriculum_topics
--     set is_placeholder = false, topic_id = 'AR.1.1', ...
--     where course_id = 'tsia2-math' and topic_id = 'AR.COMING-SOON';
--
--   Also fine, and the flag flipping to false is the only part the engine
--   cares about.
--
-- The one thing that does need a decision, in either path, is whether these
-- rows should still be hidden from the Modules tree. They are hidden today by
-- the same is_placeholder filter, so clearing the flag reveals the topic
-- everywhere at once -- which is the wanted behaviour, and is why the filter is
-- on the flag rather than on a topic_id pattern.
--
-- To remove a placeholder outright:
--
--   delete from public.curriculum_topics
--   where course_id = 'tsia2-math' and is_placeholder and related_strand = 'AR';


-- ─── After running ───────────────────────────────────────────────────────────
--
-- Every strand has exactly one routable first topic, and QR's is real:
--
--   select related_strand, topic_id, is_placeholder
--   from public.curriculum_topics
--   where course_id = 'tsia2-math'
--   order by related_strand, is_placeholder, unit_number, sequence_in_unit, topic_id;
--
-- Expect QR.1.1 (real) heading QR, and the three COMING-SOON rows heading
-- AR, GR and PR.
--
-- The view still returns rows -- the check sql/curriculum_topics_public.sql
-- asks for after any change to this view, because a security-definer view over
-- an RLS-enabled table fails open to empty, not to an error:
--
--   select count(*), count(*) filter (where is_placeholder) as placeholders
--   from public.curriculum_topics_public;
--
-- Expect 9 and 3.
