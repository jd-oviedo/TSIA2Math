-- Teacher onboarding tour: the "already seen it" flag.
--
-- The tour is a ten-step spotlight walkthrough of /teacher, shown once and
-- never again. This column is what "never again" means: it is set the moment
-- the teacher finishes or skips, by POST /api/teacher/tour.
--
-- A column rather than localStorage alone, for the same reason is_founder is a
-- column: the answer should follow the account, not the browser. A teacher who
-- sits down at a second machine has already been onboarded and should not be
-- walked through the dashboard again.
--
-- Read by app/teacher/page.tsx, written by app/api/teacher/tour/route.ts.
--
-- Status: already applied, 2026-08-10, via the Supabase SQL editor. Kept in the
-- repo as the record of the change, and re-runnable if the project is ever
-- rebuilt -- the alter below is guarded with `if not exists`.


-- ─── The code works without this file ────────────────────────────────────────
--
-- Worth keeping on record, because it is why the migration was safe to hold
-- back and safe to apply later.
--
-- Before the column existed, the select in app/teacher/page.tsx errored, and
-- that error was swallowed exactly the way the is_founder read swallows its
-- own -- the page still rendered. In that state the tour fell back to a
-- localStorage key (`um_teacher_tour_done`), so it still showed once and still
-- stayed dismissed, just per-browser instead of per-account.
--
-- So there was never a window where shipping the code without the migration
-- left a teacher stuck in a tour that would not go away. Applying this upgraded
-- the flag from per-browser to per-account; it did not switch the feature on.


-- ─── Migration ───────────────────────────────────────────────────────────────

-- Safe to re-run. Defaults false, so every teacher who existed at the time of
-- the alter is treated as not yet onboarded and sees the tour on their next
-- desktop visit to /teacher with at least one class. That is the intended
-- behaviour -- the tour had never been shown to anyone, so nobody had seen it.
alter table public.profiles
  add column if not exists teacher_tour_done boolean not null default false;


-- ─── If you would rather not surface it to existing teachers ─────────────────
--
-- Not part of the migration above, and not known to have been run. Marks
-- everyone who already has a class as onboarded, so the tour only ever meets
-- teachers who sign up after this point:
--
--   update public.profiles p
--   set teacher_tour_done = true
--   where p.role = 'teacher'
--     and exists (select 1 from public.classes c where c.teacher_id = p.id);


-- ─── Grants and RLS ──────────────────────────────────────────────────────────
--
-- Nothing to do. The column is written only by the service-role route, which
-- bypasses RLS, and read only by the server component, which also uses the
-- admin client. No new grant is needed and none should be added -- profiles is
-- not a table the browser should be writing to directly.
--
-- Note this does mean the column inherits whatever grants profiles already
-- carries. If anon or authenticated hold SELECT on profiles, they can now read
-- one more boolean about a teacher, which is not sensitive. That broader grant
-- question is tracked separately and is not this file's to settle.


-- ─── Verifying it took ───────────────────────────────────────────────────────
--
--   select column_name, data_type, column_default, is_nullable
--   from information_schema.columns
--   where table_schema = 'public'
--     and table_name = 'profiles'
--     and column_name = 'teacher_tour_done';
--
-- Expect one row: boolean, default false, not nullable.
--
-- Then load /teacher as a teacher with at least one class. The tour should run.
-- Skip it, reload, and it should not come back.
