-- gumu_sessions.resolution: tell the escape hatch from the turn cap
--
-- Two different endings write the same status today. `resolveFlagged` in
-- app/api/gumu/session/route.ts is called from both:
--
--   the student asks to be shown the answer   reason = 'student_gave_up'
--   GUMU runs out of turns                    reason = 'turn_cap'
--
-- and both write `status = 'resolved_flagged', resolved_at = now()`. The reason
-- is never stored. It is used once, at route.ts:107, to choose which sentence
-- goes into the teacher's notification -- "they asked to skip to the answer"
-- versus "GUMU could not resolve it" -- and then discarded.
--
-- ─── The recording gap this closes ──────────────────────────────────────────
--
-- That sentence is the ONLY place the distinction survives, and it does not
-- always exist. route.ts:101 returns early when the student is in no class with
-- a teacher:
--
--   const cls = Array.isArray(classes) ? classes[0] : classes;
--   if (!cls?.teacher_id) return;
--
-- So for a self-serve student -- no class, no teacher -- how their GUMU
-- conversation ended is recorded nowhere at all. Not in gumu_sessions, not in
-- teacher_notifications, not anywhere. That is a real loss independent of what
-- reads it: "did students give up or did GUMU run dry" is the first question
-- anyone will ask of the tutor, and today it is unanswerable for exactly the
-- population signing up without a teacher.
--
-- ─── Why a column rather than parsing the notification text ─────────────────
--
-- teacher_notifications.message is prose written for a human, in a table that
-- exists to alert teachers. Deriving a behavioural signal from its wording
-- would make that sentence load-bearing -- unchangeable without breaking a
-- consumer that has nothing to do with notifications -- and would still be
-- blind to every self-serve student, since the row is not written for them.
--
-- ─── Why a CHECK rather than a free-text column ─────────────────────────────
--
-- The constraint is the documentation. Two endings exist, the CHECK names both,
-- and a third ending cannot be added quietly: it fails on write and the person
-- adding it has to come here and decide what the new value means, including
-- what any reader of this column should do with it.
--
-- Run this in the Supabase SQL editor. Kept here for version control.
--
-- Status: applied to production 2026-08-17, via the Supabase SQL editor, by
-- Juan. Verified by the three queries at the foot on the same day; their output
-- is recorded there.
--
-- 18 sessions existed at that point: 16 resolved_flagged, 1 active, 1
-- resolved_retry_success. THE BACKFILL TOUCHED 16 ROWS, all of them to
-- 'turn_cap'. Nothing outside resolved_flagged was written, so the two
-- remaining rows are null and correctly so.
--
-- Re-runnable: the add is guarded with `if not exists`, the backfill is
-- filtered on `resolution is null`, and the constraint is added inside a guard
-- on pg_constraint. A second run is a no-op rather than a reassignment.


-- ─── ORDERING. Read this before merging any code. ───────────────────────────
--
-- THIS DDL MUST RUN BEFORE the application starts writing `resolution`.
--
-- Not a style preference. `resolveFlagged` does not check the error on its
-- update:
--
--   await admin.from("gumu_sessions")
--     .update({ status: "resolved_flagged", resolved_at: ... })
--     .eq("id", session.id);
--
-- Send a column PostgREST does not know about and the whole statement is
-- rejected, so `status` is not written either -- and nothing notices. The
-- session stays 'active' forever. Because gumu_sessions_one_active_per_item is
-- a partial unique index on status = 'active', that student can then never open
-- another session on that item: the insert collides with a row that should have
-- resolved and did not.
--
-- The student would still be shown the answer (the reveal response is returned
-- regardless) and the teacher would still be notified (that insert runs after,
-- and the failed update is not checked), so the failure is silent from every
-- direction anyone would be looking from.


-- ─── The column ─────────────────────────────────────────────────────────────

-- Added nullable, backfilled, then constrained -- the same three steps as
-- sql/sessions_session_type.sql and for the same reason. Adding it with a
-- DEFAULT in one statement would stamp every existing row with a value nobody
-- chose, and the backfill would then be unable to tell a row that was correctly
-- written from one that merely took the default.
alter table public.gumu_sessions
  add column if not exists resolution text;

comment on column public.gumu_sessions.resolution is
  'Which of the two flagged endings closed this session: student_gave_up (the '
  'escape hatch was used and the answer was disclosed) or turn_cap (GUMU ran '
  'out of turns and the answer was not). Null on every session that did not end '
  'flagged -- active, resolved_retry_success and abandoned all leave it null.';


-- ─── Backfill ───────────────────────────────────────────────────────────────

-- Every existing resolved_flagged row becomes 'turn_cap'.
--
-- THIS IS THE SAFE DIRECTION AND IT IS DELIBERATELY THE PESSIMISTIC ONE. The
-- information to do it correctly does not exist: both endings wrote the same
-- status, so for rows already in the table there is nothing to distinguish them
-- by. Some of these students did use the escape hatch and this will label them
-- wrongly.
--
-- It is labelled toward turn_cap because of what the column is about to be read
-- for. 'student_gave_up' means the answer has already been disclosed to that
-- student, which is what releases a worked solution to them. Guessing that way
-- on a row we cannot verify would hand out an explanation nobody earned.
-- Guessing toward turn_cap withholds one that some students did earn. Both are
-- wrong; only one of them is wrong in the direction of disclosure.
--
-- The alternative -- leave them null and have the reader treat null as "not
-- revealed" -- gets the same behaviour and was rejected. It makes null mean two
-- things at once: "this session did not end flagged" and "this session ended
-- flagged before we recorded how", so any later query about GUMU outcomes has
-- to know which era a row is from. An explicit value keeps null meaning exactly
-- one thing.
--
-- Filtered on `resolution is null` so re-running reassigns nothing. Rows
-- written after this migration carry their real value and are not touched.
update public.gumu_sessions
   set resolution = 'turn_cap'
 where status = 'resolved_flagged'
   and resolution is null;


-- ─── The constraint ─────────────────────────────────────────────────────────

-- Null stays legal, and it must: active, resolved_retry_success and abandoned
-- sessions did not end flagged and have no resolution to record. Only the two
-- flagged endings are named.
--
-- Deliberately NOT also constraining `resolution is not null` when status is
-- 'resolved_flagged'. It would be true today and it would turn any future
-- ending that resolves flagged without one of these two reasons into a write
-- failure in production before anybody had a chance to decide what it should
-- be. The CHECK below already forces that decision to be made here; it does not
-- need to force it at 3am.
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'gumu_sessions_resolution_check'
       and conrelid = 'public.gumu_sessions'::regclass
  ) then
    alter table public.gumu_sessions
      add constraint gumu_sessions_resolution_check
      check (resolution is null or resolution in ('turn_cap', 'student_gave_up'));
  end if;
end $$;


-- ─── Verification ───────────────────────────────────────────────────────────

-- Run after applying. These are what turned the counts above from unknown into
-- recorded. Output from the production run on 2026-08-17 is written under each.

-- 1. Every flagged session now carries a resolution, and nothing else does.
--    Expect: resolved_flagged rows all 'turn_cap' after this run, and every
--    other status showing resolution null.
select status,
       resolution,
       count(*) as rows
  from public.gumu_sessions
 group by status, resolution
 order by status, resolution nulls first;
--
--   active                  | null      |  1
--   resolved_flagged        | turn_cap  | 16
--   resolved_retry_success  | null      |  1
--
-- Which is the shape this migration is supposed to produce: every flagged row
-- carries a resolution, and nothing that did not end flagged carries one.

-- 2. The invariant the reader will depend on: no flagged session left null.
--    Expect: 0.
select count(*) as flagged_without_resolution
  from public.gumu_sessions
 where status = 'resolved_flagged'
   and resolution is null;
--
--   flagged_without_resolution = 0

-- 3. And the one the constraint guarantees but is worth seeing once: no value
--    outside the two. Expect: 0 rows.
select distinct resolution
  from public.gumu_sessions
 where resolution is not null
   and resolution not in ('turn_cap', 'student_gave_up');
--
--   0 rows
