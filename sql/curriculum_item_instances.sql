-- curriculum_item_instances
--
-- One row per rolled instance of a templated curriculum item: the parameter set
-- plus the *already rendered* stem and four choices. This is where a roll comes
-- from at runtime -- picking a row, not evaluating a formula.
--
-- Why the rendering is precomputed rather than done in the request.
--
-- A choice is authored as a SymPy expression (`(a + b)*m**2`), and turning that
-- into what a student sees means simplifying it and printing it in house LaTeX:
-- descending total degree, then declared variable order, `8x` not `8 x`, a bare
-- `x` for a coefficient of 1. That is `house_latex` in scripts/verify_templates.py,
-- which exists because SymPy's own printer writes `-x + 1` as `1 - x` -- the same
-- expression and the wrong string, and enough to fail practice 10 on its correct
-- answer against the byte-for-byte anchor.
--
-- There is no CAS in the Next runtime, so the alternative was a second renderer
-- in TypeScript that would have to agree with that one byte for byte. It is the
-- Python renderer that produced the verification evidence every row in
-- curriculum_item_templates carries, so a TypeScript twin that disagreed
-- anywhere would put a student in front of output nothing ever verified, while
-- the templates table went on asserting it was checked. Rejected on that basis.
--
-- Instead the verifier's own functions render every parameter set at upload time
-- -- the same `sample_sets`, `ev`, `render` and `house_latex` calls the
-- exhaustive pass already makes -- and the result lands here. One renderer, and
-- the rows a student can reach are literally the strings the harness checked.
--
-- Pool size, measured 2026-08-08 across the 14 QR.3.5 templates: 26,186 rows.
-- Per item, 50 (practice 2) to 5,007 (mini_quiz 4). That matches the recorded
-- total the 4a upload stamped into `verified_param_sets`, which is the
-- consistency check the upload script asserts rather than assumes.
--
-- Run this in the Supabase SQL editor. Kept here for version control.


-- ─── The table ───────────────────────────────────────────────────────────────

create table public.curriculum_item_instances (
  id uuid primary key default gen_random_uuid(),

  -- A real foreign key, unlike anything in sql/curriculum_item_templates.sql.
  --
  -- That file declines an FK to curriculum_topics and says why: the reference is
  -- soft, across a boundary neither gumu_sessions nor curriculum_attempts
  -- declares one over either. This reference is not that. An instance is a
  -- rendering *of* a template and has no meaning without it, both sides are
  -- written by the same script in the same run, and the parent's primary key is
  -- right here. Cascade for the same reason: a deleted template's instances are
  -- not orphans to be preserved, they are renderings of nothing.
  --
  -- Note the item key is deliberately NOT repeated on this row. template_id
  -- already determines (course_id, topic_id, section, item_number), and every
  -- read below reaches an instance either by primary key or by template_id --
  -- see the "Indexes" section for the enumeration. A copy here would be a
  -- second place for the item key to be wrong and would serve no query.
  template_id uuid not null
    references public.curriculum_item_templates(id) on delete cascade,

  -- The rolled parameter values, e.g. {"a": 7, "b": 3}. Kept even though the
  -- rendered strings below are what gets shown: this is what makes an attempt
  -- reconstructible, and it is the join back to a verifier run for anyone
  -- asking "was *this* combination checked".
  parameters jsonb not null,

  -- sha256 over the canonical sorted-key JSON of `parameters`. The upsert
  -- conflict target, so re-running the upload updates a row rather than adding a
  -- duplicate rendering of the same parameter set. A hash rather than the jsonb
  -- itself because jsonb equality is key-order independent but index behaviour
  -- on a wide jsonb is not what a conflict target should rest on.
  param_hash text not null,

  -- Rendered, not templated. `stem` has had its placeholders substituted and
  -- `choices` holds all four letters as house LaTeX, exactly as the harness
  -- printed them. The runtime does no substitution and no simplification.
  stem text not null,
  choices jsonb not null,

  -- ANSWER-BEARING, and the reason for the grants at the bottom of this file.
  --
  -- This column is also what makes grading a rolled instance honest. The
  -- practice route currently grades against curriculum_topics.practice_items,
  -- i.e. against the canonical item, and that happens to be correct for a
  -- rolled instance only because the correct letter never moves across rolls:
  -- choice_formulas covers all four letters and the letter map is anchored to
  -- the source. Nothing in the template schema *enforces* that, so the upload
  -- script asserts it per instance and grading reads the letter from the
  -- instance actually served. The invariant becomes checked rather than assumed.
  correct_answer text not null check (correct_answer in ('A', 'B', 'C', 'D')),

  -- The instance at canonical_parameters: the one that reproduces the source
  -- item byte for byte, and therefore the only one whose authored worked
  -- solution is accurate. Materialised like any other so the pool is complete
  -- and the count assert has nothing carved out of it.
  is_canonical boolean not null default false,

  -- Retired, not deleted. Null means rollable.
  --
  -- A template's range can narrow after instances exist -- that is the whole
  -- reason `exclude_parameter_sets` and `range_notes` are authored fields -- and
  -- the instances that fall outside the new range have to stop being served.
  -- Deleting them is the obvious move and it is wrong: curriculum_attempts
  -- references this table so an answered attempt stays reconstructible, and a
  -- delete either fails on that reference or nulls it out and takes the
  -- reconstruction with it.
  --
  -- That reconstruction is the point. Three wrong answers on one problem and
  -- three wrong answers on three different rolls are very different evidence
  -- about a misconception, and `record_misconception` cannot tell them apart on
  -- its own -- it increments times_hit either way and flips to 'high' at 3. The
  -- instance behind each attempt is what makes them distinguishable after the
  -- fact, so it outlives the range that produced it.
  --
  -- So: the upload script retires what a narrowed range no longer covers, the
  -- roll picker filters on `retired_at is null`, and nothing in this table is
  -- ever deleted while an attempt points at it.
  retired_at timestamptz,

  created_at timestamptz not null default now(),

  -- One rendering per parameter set per template.
  constraint curriculum_item_instances_param_key unique (template_id, param_hash)
);

-- Exactly one *live* canonical instance per template. Partial, so it constrains
-- the one row that matters and says nothing about the other 5,006.
--
-- Worth enforcing in the schema rather than in the script: "which row is the
-- canonical one" is what the anchor guarantee is addressed to, and a second one
-- appearing (a canonical_parameters edit landing before a reconcile, say) is
-- both silent and exactly the kind of drift this table is supposed to make
-- impossible.
--
-- `retired_at is null` is in the predicate because an edit to
-- canonical_parameters retires the old canonical rather than deleting it, so
-- two rows legitimately carry is_canonical -- one of them retired. Without this
-- clause that edit would collide on the index instead of superseding.
create unique index curriculum_item_instances_one_canonical
  on public.curriculum_item_instances (template_id)
  where is_canonical and retired_at is null;

comment on table public.curriculum_item_instances is
  'Precomputed rolled instances of templated curriculum items: parameters plus '
  'the rendered stem, four choices and correct letter. Rendered by the same '
  'harness that verified the template, so a student only ever sees strings that '
  'were checked. Answer-bearing -- no anon or authenticated grants, '
  'service-role writes only.';

comment on column public.curriculum_item_instances.param_hash is
  'sha256 of the canonical sorted-key JSON of parameters. Upsert conflict '
  'target, so re-uploading updates rather than duplicating.';

comment on column public.curriculum_item_instances.is_canonical is
  'The canonical_parameters rendering: the only instance whose authored worked '
  'solution is accurate, and the source item byte for byte.';


-- ─── Indexes ─────────────────────────────────────────────────────────────────
--
-- Nothing beyond the unique constraint and the partial index above, and this is
-- the full enumeration of reads that reach this table:
--
--   1. Roll a variant                    -> where template_id = $1
--                                              and retired_at is null
--   2. Grade a submitted answer          -> where id = $1
--   3. Rebuild GUMU's answer context     -> where id = $1
--   4. Reconcile a re-upload             -> where template_id = $1
--
-- (2) and (3) deliberately do not filter on retired_at. A student mid-attempt on
-- an instance that a re-upload has just retired must still be graded against the
-- problem in front of them, and GUMU must still be talking about it.
--
-- (1) and (4) are served by template_id being the leading column of
-- curriculum_item_instances_param_key; (2) and (3) by the primary key. The roll
-- in (1) is an ORDER BY random() over one template's rows -- at most 5,007, on a
-- human gesture -- rather than a dense roll_index picked at random. A dense index
-- would have to be renumbered every time a narrowed range deletes instances, and
-- a sparse one silently picks nothing.


-- ─── Grants ──────────────────────────────────────────────────────────────────

-- Not optional cleanup, and not inherited from the 4a migration having done it.
--
-- Supabase's default privileges on schema public grant the API roles SELECT at
-- create time, so a new table *arrives* readable by the anon key that ships in
-- the browser bundle. sql/revoke_stray_anon_writes.sql altered the default
-- privileges for writes only -- its own header says reads were left alone on
-- purpose -- so every new table since has needed this line of its own. That is
-- what put it in sql/curriculum_item_templates.sql and it is no more optional
-- here: this table holds `correct_answer` in plaintext, one row per instance.
--
-- ALL, not SELECT: the default privileges cover more than reads, and naming the
-- one privilege that matters today is how the other half gets left behind.
revoke all on public.curriculum_item_instances from anon, authenticated;

-- No view, and no client grant of any kind. A roll happens server-side through
-- the admin client; what reaches the browser is the rendered stem and four
-- choices with `correct_answer` dropped, the same shape PublicPracticeItem
-- already defines for the canonical path.

-- Belt and braces, matching every other locked table in this schema. Zero grants
-- already stops PostgREST with 42501 before RLS is consulted, but RLS with no
-- policy means a grant restored by a later migration or from the dashboard still
-- yields nothing.
--
-- ENABLE, not FORCE, for the reason 4a gives: no security-definer view reads
-- this table, so FORCE would be available, but whether the upload script
-- survives it depends on service_role holding BYPASSRLS as a role attribute
-- rather than merely owning the table, which is unverified. ENABLE matches every
-- other table here and costs nothing.
alter table public.curriculum_item_instances enable row level security;


-- ─── After running this ──────────────────────────────────────────────────────
--
-- 1. Confirm the grants landed, rather than assuming the revoke ran. Reading the
--    SQL is exactly what missed the stray anon SELECT grants on six existing
--    tables, so this is a measurement:
--
--      select grantee, privilege_type
--      from information_schema.role_table_grants
--      where table_name = 'curriculum_item_instances';
--
--    Expect postgres and service_role only. Any anon or authenticated row means
--    the revoke did not take and the table is readable by the browser key.
--
-- 2. Confirm the table is empty and the FK is live. Both should hold before the
--    upload script runs:
--
--      select count(*) from public.curriculum_item_instances;
--
--      select conname, confrelid::regclass
--      from pg_constraint
--      where conrelid = 'public.curriculum_item_instances'::regclass
--        and contype = 'f';
--
--    Expect 0 rows and one FK to curriculum_item_templates.
