-- questions: revoke the base-table grants
--
-- SECURITY FIX, and the second half of a fix that was only ever half applied.
--
-- The June 22 audit built `questions_public` -- the bank row minus
-- correct_answer, distractor_logic, explanation, and the psychometrics -- and
-- repointed app/adaptive-test/page.tsx at it. That part shipped and still
-- holds. What never landed was the other half: `questions` itself kept its
-- anon and authenticated SELECT grant, so the safe view was a door beside an
-- open window.
--
-- Measured against production while fixing the identical hole in
-- curriculum_topics:
--
--   curl "$URL/rest/v1/questions?select=item_id,correct_answer" -H "apikey: $ANON_KEY"
--
--   -> 200, all 1124 items, every correct_answer populated, plus
--      distractor_logic and explanation on request. No login.
--
-- Writes were already denied (42501 on UPDATE and DELETE), so this is a read
-- exposure only -- but it is the whole diagnostic bank, which makes it larger
-- than the curriculum one that surfaced it.
--
-- Note scripts/seed_questions.mjs upserts to `questions` with the anon key.
-- That has not worked for some time -- anon has no write grant -- so this
-- revoke does not regress it; it turns a write failure into a read failure at
-- the same step. Repointed at the service-role key in the same change.
--
-- Run this in the Supabase SQL editor. Kept here for version control.


-- Guarantees the view survives the revoke below. A security_invoker view
-- executes as the caller and would start failing the moment anon loses its
-- grant on the base table; the default (invoker = false) runs it as the owner,
-- which is what makes a public projection over a locked table work at all.
-- Asserted rather than assumed -- the view predates this file.
alter view public.questions_public set (security_invoker = false);

revoke all on public.questions from anon, authenticated;

-- Same belt-and-braces as curriculum_topics: no policy, so a grant restored by
-- accident still returns nothing. service_role bypasses RLS.
--
-- ENABLE, never FORCE. questions_public is security definer and reads this
-- table as its owner, and an owner is exempt from RLS only while FORCE is off.
-- Adding FORCE here empties the CAT bank for every student without raising an
-- error anywhere. See the same note in sql/curriculum_topics_public.sql.
alter table public.questions enable row level security;

-- questions_public was found granting anon UPDATE and DELETE, which is a
-- sharper problem than it looks. The view is a plain projection of one table
-- and so is auto-updatable, and it is security definer, so a write through it
-- runs against `questions` as the view's owner. anon has no write grant on
-- `questions` itself -- it would not have needed one. Reduce to SELECT.
revoke all on public.questions_public from anon, authenticated;
grant select on public.questions_public to anon, authenticated;
