-- curriculum_item_templates.source_fingerprint: constrain it
--
-- Phase 4b, step 3d. The column was added nullable by
-- sql/curriculum_item_templates.sql on purpose -- 4a would have had to backfill
-- rows the same migration was about to write, and 4b owned the definition of the
-- hash. 4b has defined it, the backfill has run, and this closes it.
--
-- What the hash is over: the anchor fields of the parsed practice_items entry --
-- `stem`, all four `choices`, `correct_answer`, and the whole `misconception_tag`
-- map -- as canonical sorted-key JSON, sha256, hex. Exactly the fields
-- anchor_failures() checks in scripts/verify_templates.py, and deliberately not
-- the worked solution. The single definition lives in vt.source_fingerprint();
-- upload_templates.py writes it and the runtime recomputes it to detect a source
-- item reworded out from under a verified template.
--
-- Backfill state, measured against production 2026-08-08 before writing this:
--
--   count(*) curriculum_item_templates                       = 14
--   count(*) where source_fingerprint is not null            = 14
--
-- and every one of the 14 was re-derived from a fresh parse of QR.3.5.md and
-- compared to the stored value: 0 mismatches. So this migration constrains a
-- state that already holds rather than asserting one it hopes for.
--
-- Run this in the Supabase SQL editor. Kept here for version control.


-- ─── Before running ──────────────────────────────────────────────────────────
--
-- Confirm the backfill is actually complete. `alter ... set not null` scans the
-- table and fails on a single null, which is the right behaviour but a poor way
-- to find out:
--
--   select count(*) as total,
--          count(source_fingerprint) as fingerprinted,
--          count(*) - count(source_fingerprint) as missing
--   from public.curriculum_item_templates;
--
-- Expect 14 / 14 / 0. Anything else means re-run
-- `python3 curriculum/migrations/upload_templates.py --course tsia2-math`
-- before continuing.


-- ─── The constraints ─────────────────────────────────────────────────────────

alter table public.curriculum_item_templates
  alter column source_fingerprint set not null;

-- Format, not just presence, and this is the half that actually protects
-- something.
--
-- The failure mode not-null does not cover is a fingerprint that is present and
-- wrong in a way nothing notices: an empty string, a truncated hex digest, a
-- value written by hand. None of those are null, all of them compare unequal to
-- every real digest, and the runtime reads "unequal" as "the source item was
-- reworded" -- so it stops rolling that item and quietly serves the canonical
-- instance forever. Rolling would be off, no error would be raised anywhere, and
-- the templates table would go on reporting the item as verified.
--
-- 64 lowercase hex characters is sha256 and nothing else. Changing the hash means
-- changing this check, which is intended: the runtime comparison has to change in
-- the same commit or every template reads as stale at once.
alter table public.curriculum_item_templates
  add constraint curriculum_item_templates_fingerprint_format
  check (source_fingerprint ~ '^[0-9a-f]{64}$');

comment on column public.curriculum_item_templates.source_fingerprint is
  'sha256 over the canonical sorted-key JSON of the source item anchor fields: '
  'stem, all four choices, correct_answer and the whole misconception_tag map. '
  'Not the worked solution. Written by curriculum/migrations/upload_templates.py '
  'from vt.source_fingerprint(); recomputed at roll time so a reworded source '
  'item stops its template rolling variants of a question that no longer exists.';


-- ─── After running this ──────────────────────────────────────────────────────
--
-- 1. Confirm both constraints are live, by measurement rather than by assuming
--    the statements above took:
--
--      select attnotnull
--      from pg_attribute
--      where attrelid = 'public.curriculum_item_templates'::regclass
--        and attname = 'source_fingerprint';
--
--      select conname, pg_get_constraintdef(oid)
--      from pg_constraint
--      where conrelid = 'public.curriculum_item_templates'::regclass
--        and conname = 'curriculum_item_templates_fingerprint_format';
--
--    Expect `t`, and the check definition naming the 64-hex pattern.
--
-- 2. Confirm the upload script still round-trips. It sends source_fingerprint on
--    every upsert now, so a re-run should succeed and change nothing:
--
--      python3 curriculum/migrations/upload_templates.py --course tsia2-math
--
--    Expect 14 templates and 26,186 instances, "nothing to retire", and
--    updated_at advanced with created_at unchanged.
