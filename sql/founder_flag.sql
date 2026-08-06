-- Founder flag on profiles.
--
-- The founder badge had no implementation before this: no column, and no
-- hardcoded email check either. It is a column rather than a list of emails in
-- code so that adding a founder is a data change, not a deploy.
--
-- Read by app/teacher/page.tsx and rendered by FounderPill in
-- TeacherDashboardClient.
--
-- Status: already applied. The column exists and both accounts below are set.
-- Kept in the repo as the record of the change, and re-runnable if the project
-- is ever rebuilt.

-- 1. Column. Safe to re-run.
alter table public.profiles
  add column if not exists is_founder boolean not null default false;

-- 2. Set the founders.
--
--    profiles has no email column -- auth.users is the authority on email --
--    so this joins rather than filtering profiles directly.
--
--    The remaining teacher accounts on the project are listed commented out
--    below. Uncomment to promote one; nothing else needs to change.
update public.profiles p
set is_founder = true
from auth.users u
where u.id = p.id
  and lower(u.email) in (
    'juan@unpackmath.com',
    'juandoloresoviedo@gmail.com',
    'anwhite@gpapps.galenaparkisd.com'
    -- , 'jdoviedo72@gmail.com'
    -- , 'jdompm@gmail.com'
  );

-- 3. Verify. Expect three rows.
select u.email, p.is_founder, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.is_founder;
