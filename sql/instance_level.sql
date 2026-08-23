-- curriculum_item_instances.level
--
-- D2. Gives a rolled instance the difficulty band of the item it was rolled
-- from, so the worksheet builder's difficulty filter treats a rolled question
-- and an authored one identically.
--
--
-- WHAT IS BROKEN WITHOUT IT
--
-- app/lib/worksheet-select.ts records this as schema fact 3: `level` is null on
-- every rolled candidate, because this table had no such column. A rolled item
-- therefore could not satisfy ANY difficulty filter, which is not a rounding
-- error on a templated topic -- it is the whole topic. A teacher who ticks
-- "Basic" and picks QR.3.5 gets nothing from it, and the builder's note has to
-- explain the absence rather than the content.
--
-- That was tolerable while exactly one topic of 97 was templated. It stops being
-- tolerable the moment templating spreads, because the failure grows with the
-- feature: every topic that gains depth loses its difficulty filter.
--
--
-- WHERE THE VALUE COMES FROM, AND WHY IT IS COPIED RATHER THAN JOINED
--
-- The band is authored as a `**Basic Level**` heading in Part 2 of the topic
-- markdown, and the parser labels each item by position under those headings
-- (upload_curriculum.py, LEVEL_RE). Measured across the whole course on
-- 2026-08-23: exactly three labels, 194 uses each -- Basic, Proficient,
-- Advanced. Hence the check constraint below, which is grounded in the corpus
-- rather than in the type in worksheet-select.ts.
--
-- NULLABLE, and that is schema fact 3's other half rather than an oversight.
-- The band headings exist only in Part 2, so no mini_quiz item anywhere in the
-- course carries a level -- all 388 of them are null today, and the four
-- QR.3.5 mini-quiz templates will roll instances that are null here too. A
-- not-null column would be a lie about the content.
--
-- Copied onto the row rather than joined through template_id at read time. The
-- roll is a single-row SELECT on a hot path and the alternative is a three-table
-- join into a jsonb array to recover one string. It is also consistent with
-- what this table already is: `stem` and `choices` are copies too, precomputed
-- at upload time by the harness that verified them. The staleness that copying
-- risks is handled the same way it is for those -- the uploader rewrites the row
-- whenever the source changes and it re-runs.
--
--
-- Run this in the Supabase SQL editor. Kept here for version control.
--
-- SAFE TO RE-RUN. Every statement below is idempotent: the column add is
-- guarded by `if not exists`, the constraint by the pg_constraint check around
-- it, and `comment on` overwrites. Re-running after the uploader has populated
-- the column changes nothing and drops no data.


-- ─── The column ──────────────────────────────────────────────────────────────

alter table public.curriculum_item_instances
  add column if not exists level text;

-- Named, so a violation says which rule was broken rather than naming a
-- generated constraint. Matches the three labels the course actually uses; a
-- fourth band would need a content decision and a change here, in that order.
--
-- GUARDED, because Postgres has no `add constraint if not exists` and the
-- column add above does have one. Without this block the two halves of this
-- file disagree about being re-runnable: a second run would no-op on the column
-- and then abort on 42710, which reads as "this migration is broken" rather
-- than "this migration has already run". A migration you are afraid to re-run
-- is one you end up applying by hand instead.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.curriculum_item_instances'::regclass
      and conname = 'curriculum_item_instances_level_check'
  ) then
    alter table public.curriculum_item_instances
      add constraint curriculum_item_instances_level_check
      check (level is null or level in ('Basic', 'Proficient', 'Advanced'));
  end if;
end
$$;

comment on column public.curriculum_item_instances.level is
  'Difficulty band inherited from the source item, so a rolled question and an '
  'authored one are filtered identically. Null on every mini_quiz instance: the '
  'band headings live in Part 2 only, so no quiz item in the course has one.';


-- ─── After running this ──────────────────────────────────────────────────────
--
-- 1. THE COLUMN ARRIVES NULL ON ALL 26,186 EXISTING ROWS. It is not backfilled
--    here, deliberately. curriculum/migrations/upload_templates.py is the only
--    writer of this table, and a backfill UPDATE would be a second, competing
--    statement of where a level comes from -- written in SQL, against the jsonb
--    in curriculum_topics, agreeing with the Python by inspection only. This
--    table already refuses that trade for `stem` and `choices`; see the header
--    of sql/curriculum_item_instances.sql.
--
--    So: run this, then re-run the uploader, which upserts on
--    (template_id, param_hash) and therefore updates the existing rows in place
--    rather than minting new ones. Instance ids are stable across that, which
--    matters because curriculum_attempts references them.
--
--      python3 curriculum/migrations/upload_templates.py \
--        --course tsia2-math --topic QR.3.5 --unit unit-1 --dry-run
--      python3 curriculum/migrations/upload_templates.py \
--        --course tsia2-math --topic QR.3.5 --unit unit-1
--
--    THE IN-BETWEEN STATE IS SAFE. Between this migration and that upload every
--    instance reads level null, which is exactly what the runtime saw before
--    this column existed: the filter excludes them and the builder says so. The
--    feature turns on when the upload lands, not when the DDL does.
--
-- 2. Confirm the shape, rather than assuming the alter ran:
--
--      select column_name, data_type, is_nullable
--      from information_schema.columns
--      where table_name = 'curriculum_item_instances' and column_name = 'level';
--
--    Expect one row: level, text, YES.
--
-- 3. After the upload, confirm the bands landed on the right rows. The practice
--    instances should carry all three bands and the mini_quiz ones none:
--
--      select t.section, i.level, count(*)
--      from public.curriculum_item_instances i
--      join public.curriculum_item_templates t on t.id = i.template_id
--      where t.topic_id = 'QR.3.5'
--      group by 1, 2
--      order by 1, 2;
--
--    Expect every mini_quiz row to have level null, and no practice row to.
--
-- 4. This file adds no grants and needs none. A column inherits the table's
--    privileges, and curriculum_item_instances holds zero grants for anon and
--    authenticated by design -- see the Grants section of
--    sql/curriculum_item_instances.sql. Worth re-running that file's check
--    anyway, since a stray grant is the failure mode this schema has already
--    had once:
--
--      select grantee, privilege_type
--      from information_schema.role_table_grants
--      where table_name = 'curriculum_item_instances';
--
--    Expect postgres and service_role only.
