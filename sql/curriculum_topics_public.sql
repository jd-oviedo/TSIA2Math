-- curriculum_topics_public
--
-- SECURITY FIX. Before this migration, `curriculum_topics` carried direct
-- grants for anon and authenticated, so the public anon key -- which ships in
-- the browser bundle, by design -- could read every column of every topic
-- straight off PostgREST with no login:
--
--   curl "$URL/rest/v1/curriculum_topics?select=*" -H "apikey: $ANON_KEY"
--
-- That returned, for QR.1.1 through QR.3.5:
--
--   practice_items      every item's correct_answer and misconception_tag
--   answer_key          the full worked solutions, teacher-only in the UI
--   misconception_tags  the topic-level section -> item -> option tag map
--
-- The application layer was never the problem: topic-data.ts strips the
-- answer-bearing fields before anything reaches the browser, and only selects
-- answer_key after requireTeacher(). None of that matters when the table
-- itself answers to the anon key -- an attacker skips the app entirely.
--
-- The grants also covered UPDATE and DELETE. Probing with a self-contradictory
-- filter returned 204 rather than 42501, which proves the write grants exist:
-- the statement was authorised and planned, and matched no row. Whether RLS
-- would then have stopped a real write was deliberately left untested -- the
-- only way to answer it is to mutate production content. A write grant on the
-- authored curriculum, held by a key that ships in the browser, is worth
-- removing on the strength of the grant alone.
--
-- This is the same shape of hole the CAT diagnostic bank had, and it gets the
-- same fix: a redacted view for the public path, zero grants on the base
-- table, and the service-role admin client for anything that genuinely needs
-- an answer. See sql/questions_lockdown.sql, which closes the half of that
-- earlier fix that was never applied.
--
-- Run this in the Supabase SQL editor. Kept here for version control.
--
--
-- ─── AUTHORITATIVE DEFINITION, AND HOW IT GOT EXTENDED ───────────────────────
--
-- This file is the authoritative full definition of curriculum_topics_public.
-- The select list below is the complete deployed column list, 19 columns, and
-- running this file alone reproduces the deployed view.
--
-- That was not true between 2026-08-12 and 2026-08-16. The view was extended by
-- a LATER migration, sql/curriculum_placeholder_topics.sql, which appended
-- is_placeholder and did not backport it here. For four days this file looked
-- authoritative and described a view with one column fewer than production had.
-- The column is now carried here as well, so the two files agree.
--
-- INVARIANT: sql/curriculum_placeholder_topics.sql issues its own CREATE OR
-- REPLACE of this same view. Both must select the same columns in the same
-- order. If you change one, change the other in the same commit. Comments may
-- differ; the column sequence may not.
--
-- APPEND ONLY. CREATE OR REPLACE VIEW can add columns to the end of the list
-- and can do nothing else: it cannot drop, reorder, rename or retype an
-- existing one. So a new column goes on the END of the select list, and the
-- existing order is not to be tidied, alphabetised, or regrouped, however
-- untidy it looks. Verified against Postgres 15: replacing this view with a
-- shorter list fails with `ERROR: cannot drop columns from view`.
--
-- What that error means in practice, because the failure mode is not the
-- obvious one. Run a stale copy of this file in the Supabase SQL editor and it
-- does NOT silently drop the column: the whole file is sent as one implicit
-- transaction, the error aborts it, and the view keeps both its columns and its
-- grants. Nothing changes. The two ways to actually break it are:
--
--   1. Clearing that error with `drop view public.curriculum_topics_public`
--      and re-running. A drop takes the grants with it as well as the column,
--      so anon gets 42501 on top of a missing column. topic-data.ts selects
--      is_placeholder on the anonymous path, so loadTopic falls to notFound()
--      and every topic page 404s for every signed-out student.
--   2. Building a fresh environment from sql/ that runs this file but not
--      sql/curriculum_placeholder_topics.sql. Same 404, no error anywhere.
--
-- Keeping the two files in sync is what closes both. See issue #84.


-- ─── Redaction helper ────────────────────────────────────────────────────────

-- Recursively removes the named keys from a jsonb value, at any depth, inside
-- objects and arrays alike.
--
-- Written generically rather than as a targeted rebuild of
-- {practice,mini_quiz} -> items[] -> {correct_answer, misconception_tag}
-- because a shape-specific redactor silently stops redacting the moment the
-- authored shape drifts -- a third section, a nested sub-item, a renamed
-- wrapper -- and a redactor that silently stops redacting is how this class of
-- bug ships in the first place. Key-based stripping cannot miss a branch.
--
-- IMMUTABLE because the output depends only on the input, which lets the
-- planner fold it and keeps the view cheap enough to sit on the read path.
create or replace function public.jsonb_strip_keys(target jsonb, keys text[])
returns jsonb
language sql
immutable
parallel safe
set search_path = ''
as $$
  select case jsonb_typeof(target)
    when 'object' then coalesce(
      (
        select jsonb_object_agg(entry.key, public.jsonb_strip_keys(entry.value, keys))
        from jsonb_each(target) as entry
        where not (entry.key = any(keys))
      ),
      '{}'::jsonb
    )
    when 'array' then coalesce(
      (
        select jsonb_agg(public.jsonb_strip_keys(element.value, keys) order by element.ord)
        from jsonb_array_elements(target) with ordinality as element(value, ord)
      ),
      '[]'::jsonb
    )
    else target
  end
$$;

comment on function public.jsonb_strip_keys(jsonb, text[]) is
  'Recursively strips the named keys from a jsonb value. Backs the redacted '
  'practice_items column on curriculum_topics_public.';


-- ─── The public view ─────────────────────────────────────────────────────────

-- Everything a student-facing page is allowed to see, and nothing else.
--
-- Deliberately NOT security_invoker. The view runs with its owner's rights so
-- that it keeps working after the base-table grants below are revoked -- that
-- separation is the entire mechanism: the caller can reach the redacted
-- projection and has no path to the row behind it.
--
-- Excluded on purpose:
--
--   answer_key          worked solutions. Teacher-only, and teachers now read
--                       it through the admin client in topic-data.ts.
--   misconception_tags  the addressable option -> slug map. Same information
--                       the redaction strips out of practice_items; leaving
--                       the column would hand back what the redaction removed.
--   misconceptions_used the topic-level slug list. /api/curriculum/practice
--                       already refuses to echo a slug back to a student on
--                       the grounds that it is internal taxonomy; publishing
--                       the whole list would contradict that for no gain.
--   related_cate_items  maps a topic to CAT bank item ids. Nothing reads it
--                       client-side, and a topic -> item map is a head start
--                       on the bank for anyone who wants one.
--
-- practice_problems and mini_quiz are included: they hold the raw authored
-- markdown of the question text only, with the solutions living in the
-- separate answer_key column. Verified against the shipped topics -- no
-- "Answer:", "Correct", or distractor_logic block appears in either.
--
-- Re-verified 2026-08-16 against all 86 live rows read through the anon key,
-- and against the parsed sections of all 83 source files. Still clean. The item
-- objects anon receives carry exactly stem, level, format, choices and
-- item_number.
--
-- BUT NOTE THE ASYMMETRY, because it is the weak point of this view. Those two
-- columns are selected RAW. practice_items is protected by jsonb_strip_keys,
-- which is key-based and cannot miss a branch; practice_problems and mini_quiz
-- are safe only because the authored markdown happens never to put an answer in
-- Part 2 or Part 3. That is a content convention, not a mechanism, and nothing
-- in this view enforces it. upload_curriculum.py splits the source on the four
-- `#### **Part N:` headings, so a topic that discussed an answer under Part 3,
-- or a malformed `#### **Part 4:` heading that failed to close Part 3 and
-- folded the answer key into it, would publish worked solutions to anon with no
-- check firing. Asserted from the outside by scripts/audit_anon_exposure.py
-- rather than fixed here: making it structural would mean parsing authored
-- markdown in SQL.
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
  -- Appended 2026-08-12 by sql/curriculum_placeholder_topics.sql, which added
  -- the column to curriculum_topics and put it on this view in the same run.
  -- Backported here 2026-08-16 (issue #84) so this file stops describing a view
  -- that production had already moved past. LAST, because CREATE OR REPLACE can
  -- only append; see the append-only note in the header.
  is_placeholder
from public.curriculum_topics;

comment on view public.curriculum_topics_public is
  'Student-safe projection of curriculum_topics: answer_key, misconception_tags, '
  'misconceptions_used and related_cate_items dropped, and correct_answer / '
  'misconception_tag recursively stripped from practice_items. The only path '
  'anon and authenticated have to topic content.';


-- ─── Lock the base table ─────────────────────────────────────────────────────

-- ALL, not just SELECT: the UPDATE and DELETE grants are the more dangerous
-- half of what was there.
revoke all on public.curriculum_topics from anon, authenticated;

-- Belt and braces. Zero grants is already sufficient -- PostgREST rejects with
-- 42501 before RLS is ever consulted -- but RLS with no policy means a grant
-- restored by accident, by a future migration or by the dashboard, still
-- yields nothing. Matches curriculum_attempts, responses, and sessions.
-- service_role bypasses RLS, so the admin client is unaffected.
--
-- ENABLE, never FORCE, and that distinction is load-bearing here rather than
-- stylistic. The view above is security definer, so it reads the base table as
-- its own owner, and a table's owner is exempt from RLS unless FORCE is set.
-- Running this file in the SQL editor makes postgres the owner of both the
-- view and the table, so the exemption holds and the view keeps returning
-- rows. Add FORCE to this table and curriculum_topics_public silently starts
-- returning nothing to every student -- a 200 with an empty body, not an
-- error. Verify the view still returns rows after this runs.
alter table public.curriculum_topics enable row level security;

-- SELECT and nothing else, and the revoke is not redundant paranoia.
--
-- This view is a plain projection of a single table, which makes it
-- auto-updatable: Postgres will happily route an UPDATE or DELETE on the view
-- through to curriculum_topics. Combined with security definer, a write grant
-- here would execute against the base table as the view's owner -- handing
-- back, through the front door, exactly the write access the revoke above just
-- took away. questions_public was found holding precisely that grant.
revoke all on public.curriculum_topics_public from anon, authenticated;
grant select on public.curriculum_topics_public to anon, authenticated;
