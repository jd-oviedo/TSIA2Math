-- GUMU (Get Ur Math Up) — Socratic tutor tables
--
-- A GUMU session opens when an authenticated student answers a curriculum
-- practice item wrong. GUMU asks guiding questions until the student finds
-- their own mistake, hits the turn cap, or asks to see the answer.
--
-- Run this in the Supabase SQL editor. Kept here for version control.


-- ---------------------------------------------------------------------------
-- 1. gumu_sessions — one row per GUMU conversation
-- ---------------------------------------------------------------------------

create table public.gumu_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id),
  -- Carried alongside topic_id for the same reason curriculum_attempts does:
  -- curriculum_topics is keyed on (course_id, topic_id), so a topic id alone
  -- does not identify a topic.
  course_id text not null,
  topic_id text not null,
  section text not null check (section in ('practice', 'mini_quiz')),
  item_number int not null,
  original_selected_answer text not null
    check (original_selected_answer in ('A', 'B', 'C', 'D')),
  -- Null when the item carries no tag. QR.1.1's mini quiz has no
  -- distractor_logic blocks, so its items grade but diagnose nothing --
  -- GUMU still runs, it just has no misconception to record on success.
  misconception_tag text,
  status text not null default 'active' check (status in (
    'active',
    'resolved_retry_success',
    'resolved_flagged',
    'abandoned'
  )),
  -- Student turns only, not GUMU's. The route owns this counter and decides
  -- when the cap is hit; the model is never asked to track it.
  turn_count int not null default 0,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- At most one active session per item per student. This is what makes the
-- retry-success path unambiguous: when a correct answer arrives for an item,
-- the practice route looks up "the open session for this item" and there can
-- only be one. Partial, so resolved sessions accumulate freely -- a student
-- can get the same item wrong again later and open a fresh session.
create unique index gumu_sessions_one_active_per_item
  on public.gumu_sessions (student_id, course_id, topic_id, section, item_number)
  where status = 'active';

-- The practice route's lookup on every correct answer, and the client's
-- "is a session open on this topic" check for gating the answer key.
create index gumu_sessions_student_topic_idx
  on public.gumu_sessions (student_id, course_id, topic_id, status);

alter table public.gumu_sessions enable row level security;

-- Zero grants for anon/authenticated, matching questions, responses,
-- sessions, student_misconceptions, and curriculum_attempts. The row holds
-- misconception_tag, which is answer-bearing -- see sql/curriculum_practice_items.sql.


-- ---------------------------------------------------------------------------
-- 2. gumu_messages — full conversation transcript, one row per message
-- ---------------------------------------------------------------------------

create table public.gumu_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.gumu_sessions(id) on delete cascade,
  role text not null check (role in ('student', 'gumu')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Every turn replays the transcript to build the model's message history, so
-- this ordering is on the hot path.
create index gumu_messages_session_idx
  on public.gumu_messages (session_id, created_at);

alter table public.gumu_messages enable row level security;

-- Zero grants, as above. Note this table stores only what was actually shown
-- to the student: a model response rejected by the leak check is logged as a
-- failure, not written here, so the transcript never contains a leaked answer.


-- ---------------------------------------------------------------------------
-- 3. teacher_notifications — alerts for students still stuck after GUMU
-- ---------------------------------------------------------------------------

create table public.teacher_notifications (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id),
  student_id uuid not null references auth.users(id),
  -- Nullable: a student can be enrolled in no class, or in a class whose
  -- teacher is not the notified teacher. Resolved from the student's active
  -- class_enrollments row at write time.
  class_id uuid references public.classes(id),
  gumu_session_id uuid not null references public.gumu_sessions(id) on delete cascade,
  topic_id text not null,
  misconception_tag text,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- The teacher dashboard's unread-first listing.
create index teacher_notifications_teacher_idx
  on public.teacher_notifications (teacher_id, read, created_at desc);

alter table public.teacher_notifications enable row level security;

-- NOTE: this table deliberately diverges from the zero-grant pattern used
-- everywhere else in this repo, because a teacher reading their own alerts is
-- a legitimate direct-client read. An RLS policy alone would do nothing here
-- -- policies filter, they do not grant -- so the grant below is what makes
-- the policy load-bearing.
--
-- Writes stay admin-only (no insert/update/delete grant), so only server route
-- handlers can create or mark-read a notification.
grant select on public.teacher_notifications to authenticated;

create policy teacher_notifications_select_own
  on public.teacher_notifications
  for select
  to authenticated
  using (teacher_id = auth.uid());


-- ---------------------------------------------------------------------------
-- 4. Constrain record_misconception's source values
-- ---------------------------------------------------------------------------
--
-- Verified against the live database: the function accepts any string for
-- p_source. A probe with p_source = 'totally_made_up' was stored successfully.
-- The allowed values existed only as convention inside the CASE expression, so
-- a typo ('socratc') would write a row that silently never escalates
-- confidence -- exactly the drift this function was written to prevent.
--
-- Two layers, because either alone leaves a gap: the CHECK protects the table
-- against any writer, and the function raises a clear error at the call site
-- instead of surfacing a constraint violation from inside plpgsql.

alter table public.student_misconceptions
  add constraint student_misconceptions_sources_valid
  check (sources <@ array['cat', 'curriculum', 'socratic']::text[]);

-- Also pin the confidence ladder's own vocabulary, for the same reason.
alter table public.student_misconceptions
  add constraint student_misconceptions_confidence_valid
  check (confidence in ('low', 'medium', 'high'));

create or replace function public.record_misconception(
  p_student_id uuid,
  p_misconception text,
  p_strand text,
  p_source text -- 'cat' | 'curriculum' | 'socratic'
) returns void as $$
begin
  if p_source is null or p_source not in ('cat', 'curriculum', 'socratic') then
    raise exception
      'record_misconception: invalid p_source %, expected cat, curriculum, or socratic',
      p_source;
  end if;

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

-- Behaviour is otherwise unchanged from sql/student_misconceptions.sql and was
-- verified live: a first 'socratic' call lands at confidence 'medium', a
-- second at 'high', with sources not duplicated.
