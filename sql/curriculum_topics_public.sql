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
  updated_at
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
