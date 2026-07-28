-- announcements
--
-- Teacher-authored notices shown on the student dashboard at
-- /dashboard/announcements. One row per post.
--
-- class_id scopes a post to a single class, matching how the roster is scoped
-- everywhere else (classes -> class_enrollments -> student). A null class_id is
-- a notice with no class attached, which every signed-in student can read.
--
-- Run this in the Supabase SQL editor. Kept here for version control.

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 200),
  body text not null check (length(trim(body)) between 1 and 5000),
  -- The teacher who wrote it. References auth.users rather than profiles for
  -- the same reason curriculum_attempts.student_id does: the auth id is the
  -- stable identity, and a profile row can be rebuilt.
  created_by uuid not null references auth.users(id),
  class_id uuid references public.classes(id) on delete cascade,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- The student read is "published posts for my classes, newest first", so the
-- index leads with the two columns that filter and ends with the sort.
create index announcements_scope_idx
  on public.announcements (published, class_id, created_at desc);

create index announcements_created_by_idx on public.announcements (created_by);

alter table public.announcements enable row level security;

-- Unlike curriculum_attempts, this table is granted to authenticated: a student
-- reading their own announcements is a legitimate direct-client read, and the
-- dashboard may want to move to one later. A policy alone would do nothing
-- without the grant -- policies filter, they do not grant -- so the grant below
-- is what makes the policy load-bearing.
--
-- Note the select grant is the ONLY grant. Inserts, updates and deletes have no
-- grant at all, so writes are only possible through the service role, which is
-- what /api/teacher/announcements uses. Mirrors profiles and audit_log.
grant select on public.announcements to authenticated;

create policy announcements_select_scoped
  on public.announcements
  for select
  to authenticated
  using (
    published
    and (
      class_id is null
      or exists (
        select 1
        from public.class_enrollments e
        where e.class_id = announcements.class_id
          and e.student_id = auth.uid()
          and coalesce(e.status, 'active') <> 'removed'
      )
      -- A teacher can always read back what they posted, including to a class
      -- they own, so the write form can confirm the insert landed.
      or exists (
        select 1
        from public.classes c
        where c.id = announcements.class_id
          and c.teacher_id = auth.uid()
      )
    )
  );
