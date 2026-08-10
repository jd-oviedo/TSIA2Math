-- sessions: revoke SELECT from anon and authenticated
--
-- public.sessions granted SELECT to both anon and authenticated. anon is the
-- key that ships in every browser bundle, so row level security was the only
-- thing standing between public traffic and student test results -- scores,
-- theta, strand breakdowns, and the user_id they belong to.
--
-- Nothing in the application needs that grant. Every read and write of sessions
-- goes through createAdminClient() (service role, which bypasses both grants
-- and RLS): app/dashboard/data.ts, app/api/sessions/route.ts, the three
-- app/api/teacher/* routes, and app/auth/callback/route.ts. No "use client"
-- file touches the table, and there are no realtime subscriptions anywhere in
-- the codebase. So this removes reachability that no code was using.
--
-- Deliberately narrow. This changes privileges only. The two policies on the
-- table are left exactly as they are -- see the note below on why that is safe,
-- and why they are a separate conversation.
--
-- Status: already applied, 2026-08-10, via the Supabase SQL editor. Kept in the
-- repo as the record of the change, and re-runnable if the project is ever
-- rebuilt -- revoking a privilege that is already gone is a no-op.


-- ─── What this makes inert ───────────────────────────────────────────────────
--
-- Privilege is checked before row security: with no SELECT grant, a role is
-- refused at the privilege check and policy expressions are never evaluated.
-- Both policies on sessions target `authenticated`, so both stop being
-- reachable the moment this runs:
--
--   select_own_sessions            using (auth.uid() = user_id)
--   teachers_see_student_sessions  using (teacher_id = auth.uid())
--
-- Losing select_own_sessions costs nothing today: a student's own results are
-- rendered by server components through the service-role client (Grades reads
-- getTestSessions in app/dashboard/data.ts), not by a browser query. If a
-- browser-side "read my own sessions" is ever wanted, the grant plus that one
-- policy is the thing to restore -- not a blanket grant.
--
-- The policies are left in place rather than dropped. Dropping them is bound up
-- with the sessions.teacher_id question and belongs with that decision, not
-- here. Leaving them costs nothing while the grant is gone.


-- ─── Before running ──────────────────────────────────────────────────────────
--
-- Confirm the grant is really there, so the revoke is not a no-op hiding
-- something else:
--
--   select grantee, privilege_type
--   from information_schema.role_table_grants
--   where table_schema = 'public' and table_name = 'sessions'
--     and grantee in ('anon', 'authenticated');
--
-- Expect two SELECT rows, one per role.
--
-- Then check nothing else reaches session rows through a policy of its own.
-- An RLS policy expression is evaluated as the querying role, so a policy on
-- another table that subqueries sessions needs that role to hold SELECT on
-- sessions. One such policy exists today:
--
--   responses / "Teachers can read student responses"
--     using (exists (select 1 from sessions s join profiles p on p.id = auth.uid()
--                    where s.id = responses.session_id
--                      and s.teacher_id = auth.uid()
--                      and p.role = 'teacher'))
--
-- It is unreachable right now -- responses grants SELECT to neither anon nor
-- authenticated, so it is refused before that expression runs. This revoke
-- therefore does not change its behaviour. But it does mean the policy cannot
-- simply be switched on later by granting SELECT on responses: with sessions
-- revoked, that subquery has no permission to read sessions. Anything that
-- turns responses into a client-readable table has to solve that, and the
-- honest fix is a security definer function rather than re-granting sessions.
--
-- Look for any others before running:
--
--   select tablename, policyname, qual
--   from pg_policies
--   where schemaname = 'public' and qual::text like '%sessions%';


-- ─── Migration ───────────────────────────────────────────────────────────────

revoke select on public.sessions from anon;
revoke select on public.sessions from authenticated;


-- ─── After running ───────────────────────────────────────────────────────────
--
--   select grantee, privilege_type
--   from information_schema.role_table_grants
--   where table_schema = 'public' and table_name = 'sessions'
--     and grantee in ('anon', 'authenticated');
--
-- Expect zero rows.
--
-- Then confirm from outside the database, with the anon key, that the table has
-- gone from "readable but empty" to "refused". Before this migration it answers
-- 200 with []; after, it must be 401 with code 42501:
--
--   curl -s -o /dev/null -w '%{http_code}\n' \
--     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/sessions?select=id&limit=1" \
--     -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
--
-- That distinction matters: 200 [] means the grant exists and RLS filtered
-- everything, which is one policy edit away from leaking. 42501 means the door
-- is shut. scripts/audit_anon_exposure.py is the standing regression check.
--
-- Smoke test the app afterwards. All of it should be unaffected, because all of
-- it runs service-role, but these are the paths that would show a regression
-- first: /dashboard/grades (a student's own session list), the teacher roster
-- and per-student drill-down, and finishing a run on /adaptive-test.


-- ─── Not covered by this file ────────────────────────────────────────────────
--
-- public.qualified_sessions is a view over this data -- session_id, user_id,
-- final_score, final_theta, strand_breakdown, created_at, completed_at,
-- duration_minutes -- and anon can read it. It is empty today and no code in
-- this repository references it, so it leaks nothing at the moment, but a plain
-- view runs with its owner's privileges: revoking the base table here does not
-- necessarily close it, and it would start exposing rows the moment the view
-- has any.
--
-- Left alone on purpose. Deciding it needs to know whether the view was created
-- with security_invoker, and whether anything outside this repository reads it.
-- It wants its own file and its own review.
