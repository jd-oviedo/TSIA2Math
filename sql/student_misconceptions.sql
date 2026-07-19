-- student_misconceptions
--
-- Aggregate table: one row per (student, misconception), updated as new
-- evidence arrives rather than recomputed from raw `responses` each read.
-- Shared source of truth for the teacher dashboard, the Socratic AI, and
-- the parent digest.
--
-- Run this in the Supabase SQL editor. Kept here for version control.

create table public.student_misconceptions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id),
  misconception text not null,
  strand text not null,
  times_hit int not null default 1,
  sources text[] not null default '{}',
  confidence text not null default 'low',
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, misconception)
);

alter table public.student_misconceptions enable row level security;

-- Zero grants for anon/authenticated, matching the pattern already used for
-- `questions`, `responses`, and `sessions`. RLS is enabled with no policies,
-- so all reads and writes go through the service-role admin client
-- (app/lib/supabase-admin.ts) from server route handlers only.


-- record_misconception
--
-- Postgres function rather than app-side logic so the confidence calculation
-- can't drift between callers (CAT reveal, curriculum practice, Socratic AI).
--
-- Idempotency: re-running with the same source does NOT duplicate the sources
-- array, but DOES increment times_hit. That is intentional -- a repeat wrong
-- answer is real evidence.

create or replace function public.record_misconception(
  p_student_id uuid,
  p_misconception text,
  p_strand text,
  p_source text -- 'cat' | 'curriculum' | 'socratic'
) returns void as $$
begin
  insert into public.student_misconceptions
    (student_id, misconception, strand, times_hit, sources, confidence)
  values
    (p_student_id, p_misconception, p_strand, 1, array[p_source],
     case when p_source = 'socratic' then 'medium' else 'low' end)
  on conflict (student_id, misconception) do update set
    times_hit = student_misconceptions.times_hit + 1,
    sources = case
      when p_source = any(student_misconceptions.sources)
      then student_misconceptions.sources
      else array_append(student_misconceptions.sources, p_source)
    end,
    last_seen = now(),
    updated_at = now(),
    confidence = case
      when 'socratic' = any(array_append(student_misconceptions.sources, p_source))
        then 'high'
      when student_misconceptions.times_hit + 1 >= 3 then 'high'
      when student_misconceptions.times_hit + 1 = 2 then 'medium'
      else 'low'
    end;
end;
$$ language plpgsql security definer;

-- security definer so it runs with elevated privileges regardless of caller,
-- since no role has direct grants on the table.


-- Controlled vocabulary for `misconception`
--
-- Values must be stable slugs that repeat across items, otherwise the
-- unique(student_id, misconception) aggregate degenerates to one row per item
-- and times_hit never exceeds 1.
--
-- The curriculum markdown (curriculum/source/tsia2-math/) already follows this
-- convention, embedding slugs in distractor prose as:
--     "Student makes misconception: reversed_division (...)"
-- 30 distinct slugs are in use there as of Unit 1.
--
-- The CAT item bank (data/items/**) does NOT yet carry these tags: all 3,348
-- of its distractor_logic strings are bespoke prose, 3,337 of them unique.
-- Tagging that bank is a prerequisite before /api/items/reveal can call this
-- function with source = 'cat'. Until then the intended first caller is the
-- Socratic AI route, which operates on curriculum items and already has clean
-- tags to pass.
