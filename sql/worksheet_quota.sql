-- worksheet_quota
--
-- The Teacher Core worksheet meter: two columns on profiles, and two functions
-- that are the only things allowed to read or move them.
--
-- DESIGN, FOR REVIEW. Juan runs this manually in the Supabase SQL editor.
-- Safe to run more than once.
--
--
-- WHAT IS BEING METERED, AND WHAT IS NOT
--
-- One worksheet = one row inserted into public.worksheets, which happens in
-- exactly one place in the codebase: the POST handler in
-- app/api/teacher/worksheets/route.ts. Every other touch of that table is a
-- select or a delete. So there is a single chokepoint and this is what guards
-- it.
--
-- Previewing and tweaking do NOT count, and that needs no defending here
-- because there is nothing to defend against: the builder makes exactly one
-- fetch in its entire file, and it is the create. Topic selection is client
-- state over a server-rendered list. Nothing reaches the server until the
-- teacher commits.
--
-- Reprinting and reopening do NOT count. /print, /key and /[id] are pure
-- selects and never call either function below.
--
-- DELETING DOES NOT REFUND, and that is a decision rather than an oversight.
-- This counts CREATION EVENTS IN A PERIOD, not live rows. A decrement on delete
-- would let a capped teacher create-delete-create without limit, which is the
-- same as having no cap. The cost is that a teacher who deletes a mistake has
-- still spent one of fifteen; the UI copy says "created this month" rather than
-- "saved" so the number it shows is the number being enforced.
--
--
-- ONLY ONE PLAN IS CAPPED
--
-- teacher-core is capped at 15. practice-pass, full-course and teacher-pro are
-- unlimited. The cap lives in app/lib/capabilities.ts as WORKSHEET_QUOTA and is
-- passed IN to consume_worksheet_quota as p_cap rather than being written here,
-- so the number has one home and this file cannot disagree with it.
--
-- The API skips consume_worksheet_quota entirely for an unlimited plan. It is
-- not that the function no-ops for them -- it is never called. That keeps the
-- write off the hot path for the plans that pay most, and it keeps the plan
-- rules in one language instead of two.
--
--
-- PERIOD-ANCHORED, SO THERE IS NO RESET JOB TO MISS
--
-- worksheet_period holds the first day of the month the count belongs to. A new
-- month reads as zero because the stored period no longer matches, not because
-- anything ran. A bare integer plus a monthly reset job has a failure mode where
-- the job does not run and every capped teacher is locked out until someone
-- notices; this shape has no such state.
--
-- The same fail-safe reasoning as the entitlement expiry logic: derive from a
-- date rather than depend on a sweeper.
--
--
-- UTC, PINNED, NOT INHERITED
--
-- Both functions say `now() at time zone 'utc'` rather than trusting the
-- instance TimeZone setting. Supabase defaults to UTC, but a default is a thing
-- someone can change, and if it changed the month boundary would move silently
-- and the two functions would still agree with each other while both being
-- wrong. Pinned, the boundary is a property of the function.
--
-- The consequence, accepted: a teacher in US Central sees the month roll over at
-- 6 or 7pm on the last day of the month, so they get a fresh 15 a few hours
-- early. That is generous rather than punitive, and a monthly cap does not
-- justify per-user timezone handling.


-- ─── Section 1. The columns ──────────────────────────────────────────────────
--
-- DEFAULTS MATTER HERE. worksheet_count defaults to 0 and worksheet_period to
-- null, so an existing profile row and a freshly created one both read as zero
-- used without a backfill. The null period simply never matches the current
-- month, which is the same answer as a stale one.

alter table public.profiles
  add column if not exists worksheet_period date,
  add column if not exists worksheet_count integer not null default 0;

comment on column public.profiles.worksheet_period is
  'First day (UTC) of the month worksheet_count belongs to. A period that is not the current UTC month reads as zero used, so a new month needs no reset job.';

comment on column public.profiles.worksheet_count is
  'Worksheets CREATED in worksheet_period. Creation events, not live rows: deleting a worksheet does not decrement. Moved only by consume_worksheet_quota.';

-- A count can never be negative. Cheap, and it turns a future arithmetic
-- mistake into a failed statement rather than a teacher with -3 used.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_worksheet_count_nonneg'
  ) then
    alter table public.profiles
      add constraint profiles_worksheet_count_nonneg check (worksheet_count >= 0);
  end if;
end $$;


-- ─── Section 2. The enforcing function ───────────────────────────────────────
--
-- Increments only if the caller is under the cap, and returns both the decision
-- and the new total in one round trip.
--
-- ONE STATEMENT, WHICH IS THE WHOLE POINT. A read-then-write from the API would
-- have a window between the check and the increment, and two creates fired
-- together would both read 14 and both write 15. The update below tests the cap
-- in its own WHERE clause, so Postgres does the compare and the write under one
-- row lock and the second create sees 15.
--
-- SECURITY DEFINER because the client never writes this counter. No API role
-- holds update on profiles, and none should: a counter the client can move is
-- not a counter. Modelled on record_misconception in sql/gumu_tables.sql.
--
-- search_path IS PINNED, which the function it is modelled on does not do. A
-- security definer function runs with the owner's privileges, so an unpinned
-- search_path lets a caller who can create a schema shadow `profiles` with
-- their own table and have this function write to it as the owner. Pinning to
-- pg_catalog, public closes that. (record_misconception should get the same
-- treatment; that is a separate, non-blocking change and is NOT made here.)
--
-- The RESET IS PART OF THE SAME STATEMENT. When the stored period is not the
-- current month the update writes count = 1 and period = this month; there is
-- no separate "start a new period" path that could run and then fail before the
-- increment.

create or replace function public.consume_worksheet_quota(
  p_user uuid,
  p_cap integer
) returns table (allowed boolean, used integer) as $$
declare
  v_month date := date_trunc('month', now() at time zone 'utc')::date;
  v_used integer;
begin
  -- A null cap has no business reaching this function: the API is supposed to
  -- skip it entirely for an unlimited plan. Raising rather than treating null
  -- as unlimited means a caller that loses that branch fails loudly instead of
  -- quietly writing a counter nobody reads.
  if p_cap is null then
    raise exception 'consume_worksheet_quota called with a null cap for %; unlimited plans must not call it', p_user;
  end if;

  update public.profiles
     set worksheet_count =
           case when worksheet_period = v_month then worksheet_count + 1 else 1 end,
         worksheet_period = v_month
   where id = p_user
     and case when worksheet_period = v_month then worksheet_count else 0 end < p_cap
  returning worksheet_count into v_used;

  if found then
    return query select true, v_used;
    return;
  end if;

  -- No row updated. Either the cap is reached, or the profile does not exist.
  -- They are told apart below so a missing profile does not read as a teacher
  -- who has used their allowance.
  select case when worksheet_period = v_month then worksheet_count else 0 end
    into v_used
    from public.profiles
   where id = p_user;

  if v_used is null then
    raise exception 'consume_worksheet_quota: no profile %', p_user;
  end if;

  return query select false, v_used;
end;
$$ language plpgsql security definer set search_path = pg_catalog, public;


-- ─── Section 3. The read-only companion ──────────────────────────────────────
--
-- What the usage indicator shows.
--
-- IT EXISTS SO THE MONTH HAS EXACTLY ONE DEFINITION. The display path could
-- select the two columns raw and compare the period in TypeScript, and that
-- would be a SECOND implementation of "this month" sitting beside the one in
-- section 2. The two would agree until one of them was edited. Here the rule is
-- written once and both paths call it, so the number a teacher is shown is by
-- construction the number being enforced.
--
-- Stable, not volatile: it writes nothing. Same definer and search_path
-- treatment as section 2, for the same reason -- no API role holds select on
-- these columns either.

create or replace function public.worksheet_quota_used(p_user uuid)
returns integer as $$
  select coalesce(
    (select case
              when p.worksheet_period = date_trunc('month', now() at time zone 'utc')::date
              then p.worksheet_count
              else 0
            end
       from public.profiles p
      where p.id = p_user),
    0);
$$ language sql stable security definer set search_path = pg_catalog, public;


-- ─── Section 4. Grants ───────────────────────────────────────────────────────
--
-- REVOKE FIRST, THEN GRANT, for the reason sql/official_scores.sql section 4
-- gives at length: Supabase's default privileges hand new objects to
-- `authenticated` (and sometimes `anon`) before a line of this file runs, so
-- writing only the grant leaves whatever was inherited sitting underneath it.
-- A grant cannot subtract.
--
-- NEITHER FUNCTION IS GRANTED TO ANY API ROLE. Both are called through the
-- service-role client from server code that has already cleared requireTeacher()
-- and profileGrants(). A signed-in teacher must not be able to call
-- consume_worksheet_quota with a cap of their choosing, and must not be able to
-- call it at all.
--
-- The columns are not granted either. profiles already has its own grants and
-- this file does not widen them: nothing on the client reads these columns, and
-- the read-only function is what server code uses.

revoke all on function public.consume_worksheet_quota(uuid, integer) from public, authenticated, anon;
revoke all on function public.worksheet_quota_used(uuid) from public, authenticated, anon;


-- ─── Section 5. After running this ───────────────────────────────────────────
--
-- Verification, in the order the sections above were run. Each is a query with
-- an expected answer, not a thing to eyeball.
--
-- 1. Confirm both columns exist with the defaults that make a fresh row read as
--    zero used. Expect worksheet_period / date / null default, and
--    worksheet_count / integer / 0 / not null.
--
--      select column_name, data_type, column_default, is_nullable
--        from information_schema.columns
--       where table_schema = 'public' and table_name = 'profiles'
--         and column_name in ('worksheet_period', 'worksheet_count')
--       order by column_name;
--
-- 2. Confirm both functions are SECURITY DEFINER with search_path pinned. An
--    unpinned definer function is the actual vulnerability here, and it is
--    invisible unless asked for directly. Expect prosecdef = true and
--    proconfig containing search_path=pg_catalog, public for BOTH rows.
--
--      select proname, prosecdef, proconfig
--        from pg_proc
--       where pronamespace = 'public'::regnamespace
--         and proname in ('consume_worksheet_quota', 'worksheet_quota_used');
--
-- 3. Confirm no API role can call either one. Expect ZERO rows. A row here
--    means a signed-in user can move their own counter, or pass whatever cap
--    they like.
--
--      select r.routine_name, p.grantee, p.privilege_type
--        from information_schema.routine_privileges p
--        join information_schema.routines r
--          on r.specific_name = p.specific_name
--       where r.routine_schema = 'public'
--         and r.routine_name in ('consume_worksheet_quota', 'worksheet_quota_used')
--         and p.grantee in ('anon', 'authenticated', 'PUBLIC');
--
-- 4. Prove the meter counts, rather than reading the function and believing it.
--    Substitute a real teacher-core profile id. Expect (true, 1) then (true, 2),
--    and worksheet_quota_used to agree with the second.
--
--      select * from public.consume_worksheet_quota('<uuid>', 15);
--      select * from public.consume_worksheet_quota('<uuid>', 15);
--      select public.worksheet_quota_used('<uuid>');
--
-- 5. Prove the cap REFUSES, which is the half that matters and the half a
--    passing increment does not demonstrate. Run with a cap of 2 after step 4.
--    Expect (false, 2): denied, and the count did not move.
--
--      select * from public.consume_worksheet_quota('<uuid>', 2);
--      select public.worksheet_quota_used('<uuid>');   -- still 2
--
-- 6. Prove a new month reads as zero with nothing having run. Backdate the
--    period by hand, then read. Expect 0, and the next consume to return
--    (true, 1) rather than (true, 3).
--
--      update public.profiles
--         set worksheet_period = (date_trunc('month', now() at time zone 'utc') - interval '1 month')::date
--       where id = '<uuid>';
--      select public.worksheet_quota_used('<uuid>');   -- 0
--      select * from public.consume_worksheet_quota('<uuid>', 15);   -- (true, 1)
--
-- 7. Prove a null cap raises rather than being read as unlimited. Expect an
--    exception naming the user, NOT a successful increment.
--
--      select * from public.consume_worksheet_quota('<uuid>', null);
--
-- 8. Reset whatever the steps above left behind on the test profile:
--
--      update public.profiles
--         set worksheet_period = null, worksheet_count = 0
--       where id = '<uuid>';
--
--
-- UNTIL THIS FILE IS RUN, THE METER IS OFF AND CREATION STILL WORKS.
--
-- The API treats a missing function as a pre-migration deploy and allows the
-- create, logging loudly, exactly as app/teacher/worksheets/page.tsx already
-- treats a missing worksheets table. A shipped feature that paying teachers use
-- should not break because a migration has not been run yet; the bounded cost is
-- that Teacher Core is uncapped for the window between deploy and this file.
-- app/lib/worksheet-quota.ts says the same thing at the call site.
