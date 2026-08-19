-- worksheets
--
-- A saved worksheet: an ordered list of item REFERENCES, the options it was
-- generated under, and who owns it. One row per worksheet.
--
-- DESIGN, FOR REVIEW. Juan runs this manually in the Supabase SQL editor.
-- Safe to run more than once.
--
--
-- WHY REFERENCES AND NOT RENDERED CONTENT
--
-- The single most important property of this table is that reprinting a
-- worksheet a month later produces the same paper. A teacher hands out copies
-- on Monday, loses them, reprints on Friday, and the two must be the same
-- document -- otherwise the answer key she already printed is wrong.
--
-- Storing rendered HTML would guarantee that trivially and is still the wrong
-- choice: it freezes a KaTeX version, a print stylesheet and a house LaTeX
-- convention into a database row, so a content fix or a rendering fix never
-- reaches a worksheet already made. Storing references keeps rendering current
-- while keeping the SELECTION fixed, which is the half that actually has to be
-- stable. An item's text can be corrected; which items were on the sheet cannot
-- change.
--
--
-- THE REFERENCE SHAPE, AND WHY IT IS A TAGGED UNION
--
-- `items` is a jsonb array. Every element is one of exactly two shapes:
--
--   {"source": "static",
--    "topic_id": "AR.2.1", "section": "practice", "item_number": 3}
--
--   {"source": "instance",
--    "topic_id": "QR.3.5", "instance_id": "<uuid>"}
--
-- Two shapes because there are two item backends and a worksheet may mix them:
-- 96 topics have only hand-authored items in curriculum_topics.practice_items,
-- and QR.3.5 additionally has 26,186 rolled rows in curriculum_item_instances.
-- app/lib/worksheet-source.ts resolves either without the caller knowing which,
-- so a topic that gets templated later deepens automatically and nothing stored
-- here has to be migrated.
--
-- topic_id is carried on BOTH shapes, including the instance one where
-- template_id already determines it. That is a deliberate exception to the rule
-- sql/curriculum_item_instances.sql states about not duplicating the item key:
-- there, the copy would serve no query; here it is what lets the worksheet
-- render its topic headings and group its questions without resolving every
-- reference first, and what keeps a worksheet readable in the SQL editor when
-- something has gone wrong.
--
-- NO FOREIGN KEY on either shape, and it cannot be one -- a jsonb array element
-- cannot carry an FK. That is the cost of the tagged union, and it is the
-- reason instances are RETIRED rather than deleted (see retired_at in
-- sql/curriculum_item_instances.sql): a reference here stays resolvable even
-- after a narrowed template range takes its instance out of circulation.
--
--
-- ANSWER-BEARING: NO. Deliberately.
--
-- This table stores references, not answers. Resolving a reference to a correct
-- letter requires curriculum_topics or curriculum_item_instances, both of which
-- hold zero grants for the API roles. So the worksheet row itself is safe to
-- expose to its owner, and the answer key stays behind requireTeacher() and the
-- admin client. Splitting it this way is what allows the RLS policy below to be
-- a simple ownership test.
--
-- Run this in the Supabase SQL editor. Kept here for version control.


-- ─── The table ───────────────────────────────────────────────────────────────

create table if not exists public.worksheets (
  id uuid primary key default gen_random_uuid(),

  -- The owning teacher. auth.users rather than profiles, matching
  -- announcements.created_by and curriculum_attempts.student_id: the auth id is
  -- the stable identity and a profile row can be rebuilt.
  --
  -- CASCADE, unlike announcements, which declares no delete behaviour. A
  -- worksheet is private working material with no audience beyond its author,
  -- so a deleted account should take its worksheets with it rather than leave
  -- unreachable rows owned by nobody.
  teacher_id uuid not null references auth.users(id) on delete cascade,

  title text not null
    check (length(trim(title)) between 1 and 120),

  -- Which course the referenced topics live in. Carried explicitly rather than
  -- inferred, because curriculum_topics is keyed on (course_id, topic_id) and a
  -- topic id alone does not identify a topic -- the same reason
  -- curriculum_attempts, gumu_sessions and curriculum_item_templates all carry
  -- the pair.
  course_id text not null default 'tsia2-math',

  -- The ordered item references. See the header for the two element shapes.
  --
  -- Constrained rather than trusted: a worksheet with no items is not a
  -- worksheet, and the empty array would render a blank page with a title on
  -- it. The upper bound is a sanity limit, not a product rule -- 200 questions
  -- is far past any classroom worksheet and well short of anything that would
  -- make the jsonb awkward.
  items jsonb not null
    check (jsonb_typeof(items) = 'array'
           and jsonb_array_length(items) between 1 and 200),

  -- What the teacher asked for, kept so the builder can be reopened with its
  -- controls where she left them, and so a worksheet can be regenerated later
  -- under the same intent rather than reverse-engineered from its items.
  --
  -- Shape, all optional: {"topics": [...], "count": 20,
  --                       "levels": ["Basic","Proficient"],
  --                       "include_quiz": true, "seed": 12345}
  --
  -- Deliberately NOT normalised into columns. These are the generator's inputs
  -- and they will change as the picker grows; freezing today's set into a
  -- column list would make every future control a migration. Nothing filters on
  -- them.
  options jsonb not null default '{}'::jsonb
    check (jsonb_typeof(options) = 'object'),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The index the index page needs: one teacher's worksheets, newest first.
-- Leading column filters, trailing column sorts.
create index if not exists worksheets_teacher_idx
  on public.worksheets (teacher_id, created_at desc);

comment on table public.worksheets is
  'A saved worksheet: an ordered jsonb array of item references plus the '
  'options it was built under. References, never rendered content, so a '
  'reprint selects the same items while picking up any content or rendering '
  'fix since. Teacher-scoped by RLS.';

comment on column public.worksheets.items is
  'Ordered array of item references, each either '
  '{"source":"static","topic_id","section","item_number"} or '
  '{"source":"instance","topic_id","instance_id"}. Resolved by '
  'app/lib/worksheet-source.ts. No FK is possible on a jsonb element, which is '
  'why curriculum_item_instances retires rather than deletes.';


-- ─── RLS, in this migration and not a later one ──────────────────────────────
--
-- This is the first migration for this table and the policy ships with it. The
-- alternative -- create the table now, add the policy when the API is wired --
-- means a window in which every teacher can read every other teacher's
-- worksheets, and windows like that are how sql/curriculum_topics_public.sql
-- came to exist.
alter table public.worksheets enable row level security;

-- The grant is what makes the policy load-bearing: policies filter, they do not
-- grant, so a policy with no grant yields nothing and a grant with no policy
-- yields everything.
--
-- SELECT ONLY, and that is the whole of it. Every write goes through
-- /api/teacher/worksheets on the service role, after requireTeacher() -- the
-- same posture announcements takes, and for the same reason: the API route is
-- where the plan check lives, and a direct client insert would skip it. A
-- teacher with an expired subscription still holds a valid JWT.
grant select on public.worksheets to authenticated;

-- Ownership, and nothing else. There is no sharing model, no class scoping and
-- no co-teacher concept in this table, so the policy has exactly one clause.
--
-- Note this admits a teacher whose subscription has lapsed: auth.uid() is
-- identity, not entitlement, and RLS cannot see profiles.plan without a
-- subquery that would run on every row. Entitlement is enforced one layer up by
-- requireTeacher() on every route that reads this table. RLS here is the
-- tenancy boundary -- "not someone else's worksheets" -- not the paywall.
create policy worksheets_select_own
  on public.worksheets
  for select
  to authenticated
  using (teacher_id = auth.uid());


-- ─── After running this ──────────────────────────────────────────────────────
--
-- 1. Confirm the grants are SELECT and nothing more. An insert or update grant
--    here would let a lapsed teacher write worksheets straight past the API:
--
--      select grantee, privilege_type
--      from information_schema.role_table_grants
--      where table_name = 'worksheets'
--      order by grantee, privilege_type;
--
--    Expect authenticated with SELECT only, plus postgres and service_role.
--    Any anon row at all is a bug: this table is not public in any form.
--
-- 2. Confirm RLS is on AND the policy exists. Either alone is not the fix --
--    RLS enabled with no policy denies everyone, and a policy with RLS off is
--    inert:
--
--      select relrowsecurity, relforcerowsecurity
--      from pg_class where oid = 'public.worksheets'::regclass;
--
--      select polname, polcmd, pg_get_expr(polqual, polrelid)
--      from pg_policy where polrelid = 'public.worksheets'::regclass;
--
--    Expect relrowsecurity = t, and one policy named worksheets_select_own
--    with polcmd = r over (teacher_id = auth.uid()).
--
-- 3. Prove the tenancy boundary actually holds, rather than reading the policy
--    and concluding. With two teacher accounts, signed in as the first:
--
--      curl "$URL/rest/v1/worksheets?select=id,title" -H "apikey: $ANON_KEY" \
--           -H "Authorization: Bearer $TEACHER_A_JWT"
--
--    Expect only A's rows. Repeat with B's token and confirm the sets are
--    disjoint. A 200 with an empty array is the correct answer for a teacher
--    with no worksheets; a 200 containing someone else's row is the failure
--    this policy exists to prevent.
