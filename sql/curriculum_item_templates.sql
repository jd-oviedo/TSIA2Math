-- curriculum_item_templates
--
-- One row per parameterized curriculum practice item: the authored template
-- block lifted out of the topic markdown, so the runtime can roll a fresh
-- instance of an item instead of re-showing the one the student just got wrong.
--
-- Phase B's pool is the 14 graded items in
-- curriculum/source/tsia2-math/unit-1/QR.3.5.md -- practice 1-10 and mini_quiz
-- 1-4, all 14 verified templatable in
-- data/templates/QR.3.5_curriculum_source_audit.md. The 15 CAT-bank templates
-- in data/templates/QR.3.5.json are parked and are not uploaded here; the
-- placement bank stays out of this table entirely.
--
-- Table rather than a column on curriculum_topics. An earlier draft of
-- data/templates/README.md argued the other way, on the grounds that a template
-- should travel with the item it belongs to. It still does -- the template is
-- authored in the topic markdown beside the distractor_logic and
-- misconception_tag blocks, and that stays true. What moves is where it lands:
-- a template is addressed per item, by (section, item_number), which is the key
-- space GUMU already uses, and a jsonb column on the topic row would have to be
-- read whole and indexed into on every roll.
--
-- Run this in the Supabase SQL editor. Kept here for version control.


-- ─── The table ───────────────────────────────────────────────────────────────

create table public.curriculum_item_templates (
  id uuid primary key default gen_random_uuid(),

  -- Carried as a pair for the same reason curriculum_attempts and gumu_sessions
  -- carry it: curriculum_topics is keyed on (course_id, topic_id), so a topic id
  -- alone does not identify a topic.
  --
  -- No foreign key, matching both of those tables -- neither declares one, and
  -- this is not the migration to start. The reference is soft and the upload
  -- script is the only writer.
  course_id text not null,
  topic_id text not null,

  -- The same two section names the practice route and gumu_sessions use. An
  -- item is addressed by (section, item_number) and nothing else; there is no
  -- item_id in the curriculum key space.
  section text not null check (section in ('practice', 'mini_quiz')),
  item_number int not null check (item_number > 0),

  -- The authored `template` object, verbatim.
  --
  -- One column rather than eleven, and not for want of a shape: every block
  -- carries variables, parameters, constraints, range_notes,
  -- canonical_parameters, correct_answer, misconception_tag, stem_template,
  -- unsimplified_expression, choice_formulas and choice_derivations, with
  -- constraint_notes on 12 of 14 and exclude_parameter_sets / exclusion_notes on
  -- 1. Nothing filters on any of them -- a roll reads the whole template or none
  -- of it -- so columns would buy no query path while freezing a field set that
  -- is still moving.
  --
  -- It also keeps the anti-drift rule intact. correct_answer and
  -- misconception_tag live inside this object and are not copied out into
  -- columns beside it, so there is no second copy to go stale against the
  -- authored source.
  --
  -- Answer-bearing, in full: correct_answer, misconception_tag and
  -- choice_formulas together are the answer key plus the misconception
  -- taxonomy, in a form that generalises past the canonical instance. That is
  -- what the grants at the bottom of this file are for.
  template jsonb not null,

  -- Nullable now, populated and checked in Phase 4b.
  --
  -- A template anchors on the parsed practice_items entry it came from -- stem,
  -- all four choices, correct_answer and the whole misconception_tag map, byte
  -- for byte at canonical_parameters. Nothing currently detects the source item
  -- being reworded after the template was verified, which would leave a template
  -- rolling variants of a question that no longer exists. The fingerprint is
  -- what makes that detectable at read time instead of at review time.
  --
  -- Created nullable deliberately: adding it not null in 4b would mean
  -- backfilling rows this migration is about to write, and 4b owns the
  -- definition of the check.
  source_fingerprint text,

  -- Written by the upload script from the verifier's own output, not by hand.
  -- scripts/verify_templates.py records verification_status into the json for
  -- the bank pool only; the curriculum pool is report-only, so the run result
  -- has nowhere to live unless it lands here.
  --
  -- verification_mode distinguishes a full grid enumeration from a sampled run.
  -- 'exhaustive' over a small parameter range is a materially stronger claim
  -- than the same param-set count sampled from a large one, and a bare integer
  -- cannot tell them apart.
  verified_at timestamptz,
  verified_param_sets int check (verified_param_sets > 0),
  verification_mode text check (verification_mode in ('exhaustive', 'sampled')),

  created_at timestamptz not null default now(),
  -- Set explicitly by the upload script on every upsert, the way
  -- student_misconceptions does it. There is no trigger anywhere in this schema
  -- and this file does not add the first one; a default alone would leave this
  -- column reading as the insert time forever.
  updated_at timestamptz not null default now(),

  -- One template per item, and the upsert conflict target.
  --
  -- A constraint, not `create unique index`. Both would serve the upsert --
  -- on_conflict infers from either -- but only a constraint can back a foreign
  -- key, and this is the row other tables would reference if the templating work
  -- ever grows one. Declaring it as an index would make that a second migration
  -- for no saving now. Same key space as gumu_sessions_one_active_per_item,
  -- minus student_id.
  constraint curriculum_item_templates_item_key
    unique (course_id, topic_id, section, item_number)
);

comment on table public.curriculum_item_templates is
  'Parameterized curriculum practice items: one row per (course_id, topic_id, '
  'section, item_number), holding the authored template block. Answer-bearing '
  'in full -- no anon or authenticated grants, service-role writes only.';

comment on column public.curriculum_item_templates.template is
  'The authored template object verbatim: parameters, constraints, '
  'canonical_parameters, stem_template, choice_formulas, choice_derivations, '
  'correct_answer and misconception_tag. Single source -- nothing here is '
  'copied into a sibling column.';

comment on column public.curriculum_item_templates.source_fingerprint is
  'Nullable until Phase 4b. Hash of the anchor fields on the source '
  'practice_items entry, so a reworded source item invalidates its template '
  'rather than silently rolling variants of a question that no longer exists.';


-- ─── Indexes ─────────────────────────────────────────────────────────────────
--
-- Deliberately none beyond the unique constraint, which Postgres indexes for
-- free. Every read is either the full set for one topic or one exact item, and
-- (course_id, topic_id) is a leading prefix of the constraint's columns, so both
-- are already served. The pool is 14 rows.


-- ─── Grants ──────────────────────────────────────────────────────────────────

-- This is not optional cleanup, and it is not the same statement it is in
-- sql/curriculum_topics_public.sql.
--
-- There, the revoke removes grants that had accumulated on an existing table.
-- Here the table is brand new, and Supabase's default privileges on schema
-- public grant the API roles SELECT at create time -- so without this line the
-- table arrives readable by the anon key that ships in the browser bundle.
--
-- sql/revoke_stray_anon_writes.sql already altered the default privileges, but
-- for writes only; its own header says reads were left alone on purpose. That
-- is still true: measured against production while writing this file,
-- gumu_sessions, curriculum_attempts, student_misconceptions,
-- curriculum_completion, classes and announcements all answer the anon key with
-- 200 and an empty array -- grant present, RLS returning nothing. Tracked as a
-- separate cleanup; the point for this file is that "new table + enable RLS"
-- does not produce zero grants here, and nothing about the pattern this follows
-- would have caught that.
--
-- ALL, not SELECT: the default privileges cover more than reads, and naming the
-- one privilege that happens to matter today is how the other half gets left
-- behind.
revoke all on public.curriculum_item_templates from anon, authenticated;

-- No view. curriculum_topics and questions each needed a redacted projection
-- because a student page reads them; nothing client-side reads a template. A
-- roll happens server-side through the admin client, and the rolled instance --
-- stem and four choices, no correct_answer, no misconception_tag -- is what
-- reaches the browser. That is Phase 4b's job and it needs no grant here.

-- Belt and braces, matching every other locked table in this schema: zero
-- grants already stops PostgREST with 42501 before RLS is consulted, but RLS
-- with no policy means a grant restored by a later migration or by the
-- dashboard still yields nothing.
--
-- ENABLE, not FORCE. The distinction is load-bearing on curriculum_topics
-- because a security-definer view reads that table as its owner and an owner is
-- exempt from RLS only while FORCE is off. No view reads this table, so that
-- reasoning does not apply and FORCE would be available -- but whether the
-- upload script survives it depends on service_role holding the BYPASSRLS role
-- attribute rather than merely owning the table, which is unverified here.
-- ENABLE matches every other table in this schema and costs nothing.
-- service_role bypasses RLS, so the admin client and the upload script are
-- unaffected.
alter table public.curriculum_item_templates enable row level security;


-- ─── After running this ──────────────────────────────────────────────────────
--
-- Confirm the grants actually landed, rather than assuming the revoke ran:
--
--   select grantee, privilege_type
--   from information_schema.role_table_grants
--   where table_name = 'curriculum_item_templates';
--
-- Expect postgres and service_role only. Any anon or authenticated row means
-- the revoke did not take and the table is readable by the browser key.
