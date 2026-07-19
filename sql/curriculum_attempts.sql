-- curriculum_attempts
--
-- One row per answer submitted to a curriculum practice or mini-quiz item.
-- Raw event log, not an aggregate: progress tracking and the parent digest
-- read from here, while `student_misconceptions` stays the rolled-up
-- "what does this student struggle with" view.
--
-- Deliberately append-only. A retry of the same item inserts another row
-- rather than updating, so the sequence of attempts stays visible -- "got it
-- wrong twice then right" is the signal progress tracking needs, and
-- collapsing it to a latest-answer row would destroy it.
--
-- Run this in the Supabase SQL editor. Kept here for version control.

create table public.curriculum_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id),
  course_id text not null,
  topic_id text not null,
  section text not null check (section in ('practice', 'mini_quiz')),
  item_number int not null,
  selected_answer text not null check (selected_answer in ('A', 'B', 'C', 'D')),
  is_correct boolean not null,
  -- Slug for the chosen wrong option, null when correct or untagged. Copied
  -- at write time rather than looked up later: if the content is re-tagged,
  -- this row should still say what the student was diagnosed with at the time.
  misconception text,
  created_at timestamptz not null default now()
);

-- course_id is carried alongside topic_id because curriculum_topics is keyed
-- on the pair -- topic ids are only unique within a course.
create index curriculum_attempts_student_topic_idx
  on public.curriculum_attempts (student_id, course_id, topic_id);

-- Progress tracking pages a student's recent activity.
create index curriculum_attempts_student_time_idx
  on public.curriculum_attempts (student_id, created_at desc);

alter table public.curriculum_attempts enable row level security;

-- Zero grants for anon/authenticated, matching `questions`, `responses`,
-- `sessions`, and `student_misconceptions`. All reads and writes go through
-- the service-role admin client from server route handlers only.
--
-- Note this table is answer-bearing in aggregate: is_correct across items
-- reveals the answer key to anyone who can read it, which is another reason
-- it stays server-side.
