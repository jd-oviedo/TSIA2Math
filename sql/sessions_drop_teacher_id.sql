-- sessions.teacher_id: retire the column
--
-- The column was written on every insert by app/api/sessions/route.ts, always
-- with the test-taker's own id -- a student's uuid in a column named for their
-- teacher. No application query has ever read it: the teacher roster route
-- fetches sessions with .in("user_id", studentIds) and carries a comment saying
-- it is deliberately not filtered by teacher_id.
--
-- But two RLS policies do read it, and an earlier draft of this file wrongly
-- said nothing did. That claim came from grepping app/ and sql/, which only
-- ever proved the repository does not read the column. Policies live in the
-- database and were applied straight through the SQL editor, so they appear in
-- no file here. Postgres refused the drop, and that is how they were found.
--
-- The insert has stopped writing it. This removes it -- but only after dealing
-- with those two policies deliberately, which is most of what this file is.
--
-- NOT RUN. Held for review like every other file here.
-- Run it in the Supabase SQL editor when you want it; kept for version control.


-- ─── Do not run this with CASCADE ────────────────────────────────────────────
--
-- `drop column teacher_id cascade` succeeds instantly and silently drops both
-- policies below. They are policies gating access to student test data. Even
-- though neither currently works (see the next section), a CASCADE leaves no
-- record of what it removed and no decision behind it. Every drop here is
-- written out by name, so the diff says exactly what is being given up.


-- ─── The two dependents, and why neither works ───────────────────────────────
--
-- sessions / teachers_see_student_sessions        to authenticated, for SELECT
--   using (teacher_id = auth.uid())
--
-- teacher_id only ever held the test-taker's own id, so this matched exactly
-- the rows where user_id = auth.uid() -- the same set as the sibling policy
-- select_own_sessions, which says `auth.uid() = user_id` directly. It has never
-- shown a teacher a single student's session. It is a duplicate of the
-- own-sessions policy under a name claiming the opposite.
--
-- responses / "Teachers can read student responses"   to authenticated, SELECT
--   using (exists (select 1
--                  from sessions s
--                  join profiles p on p.id = auth.uid()
--                  where s.id = responses.session_id
--                    and s.teacher_id = auth.uid()
--                    and p.role = 'teacher'))
--
-- `s.teacher_id = auth.uid()` means the caller is the student who took the
-- test; `p.role = 'teacher'` means the caller is a teacher. Both hold at once
-- only for a teacher reading their own diagnostic. It has never let a teacher
-- read a student's responses. It is unreachable regardless: responses grants
-- SELECT to neither anon nor authenticated, and privilege is checked before
-- row security.
--
-- So nothing is lost by dropping them. Teacher access to this data does not
-- come from RLS at all -- it comes from the service-role API routes under
-- app/api/teacher/, which bypass policies entirely.
--
-- If teacher-facing RLS is ever actually wanted, neither of these is the
-- starting point. The association is student -> enrollment -> class -> teacher,
-- through classes.teacher_id, and it belongs in its own reviewed file.


-- ─── Sequencing ──────────────────────────────────────────────────────────────
--
-- Run sql/sessions_revoke_client_select.sql first. It removes anon and
-- authenticated SELECT on sessions, which makes both policies unreachable and
-- takes the urgency out of this file. Dropping a policy nobody can invoke is a
-- much smaller thing than dropping a live one.


-- ─── Before running ──────────────────────────────────────────────────────────
--
-- Confirm what the column drop destroys. Every non-null value should equal
-- user_id on the same row -- the signature of the bad write, and the evidence
-- that no real teacher association is being thrown away:
--
--   select count(*) as total,
--          count(teacher_id) as with_teacher_id,
--          count(*) filter (where teacher_id is distinct from user_id
--                             and teacher_id is not null) as unexpected
--   from public.sessions;
--
-- `unexpected` must be 0. If it is not, something other than the API route set
-- this column with something meaningful in it, and that needs explaining before
-- the column goes.
--
-- Re-confirm the dependent list has not grown since this was written. Do not
-- rely on grepping the repository -- that is the mistake this file documents:
--
--   select cls.relname as on_table,
--          pol.polname as policy,
--          pg_get_expr(pol.polqual, pol.polrelid) as using_expression
--   from pg_policy pol
--   join pg_class cls on cls.oid = pol.polrelid
--   where exists (
--     select 1 from pg_depend d
--     join pg_class t on t.oid = d.refobjid
--     join pg_attribute a on a.attrelid = d.refobjid and a.attnum = d.refobjsubid
--     where d.classid = 'pg_policy'::regclass
--       and d.objid = pol.oid
--       and t.relname = 'sessions'
--       and a.attname = 'teacher_id'
--   );
--
-- Expect exactly the two policies named below. Anything else, stop.


-- ─── Migration ───────────────────────────────────────────────────────────────

-- Both policies must go before the column, and both are named explicitly
-- rather than swept up by CASCADE.

drop policy if exists teachers_see_student_sessions on public.sessions;

drop policy if exists "Teachers can read student responses" on public.responses;

alter table public.sessions
  drop column if exists teacher_id;


-- ─── After running ───────────────────────────────────────────────────────────
--
--   select column_name
--   from information_schema.columns
--   where table_schema = 'public' and table_name = 'sessions'
--   order by ordinal_position;
--
-- Expect: id, created_at, completed_at, final_theta, final_score, max_items,
-- strand_breakdown, user_id. No teacher_id.
--
--   select tablename, policyname from pg_policies
--   where schemaname = 'public' and tablename in ('sessions', 'responses');
--
-- Expect one row: sessions / select_own_sessions. responses is left with RLS
-- enabled and no policies, which is deny-all for anon and authenticated and
-- matches how the table already behaves, since it grants them nothing.
--
-- Nothing else needs changing. There was never an index on the column (see the
-- note in sql/fk_indexes.sql), and no other policy in the database references
-- it once the two above are gone.
--
-- Smoke test the teacher surfaces afterwards -- roster, per-student drill-down,
-- misconception rollup. All three run service-role and should be untouched;
-- they are simply where a mistake here would surface first.
