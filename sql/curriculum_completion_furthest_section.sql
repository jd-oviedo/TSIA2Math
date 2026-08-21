-- curriculum_completion: furthest lesson section, and three missing NOT NULLs
--
-- RUN AFTER sql/curriculum_completion_timestamptz.sql. Nothing here depends on
-- that file, and it goes first because it is the one blocking the switch to
-- definition A.
--
-- Reviewed against production 2026-08-21: 36 rows, zero nulls in user_id,
-- course_id or topic_id, a single course_id value 'tsia2-math'. Every statement
-- below is therefore a no-op on the data and a change to the constraints only.
--
-- Run the sections in order. They are independent and each is safe to stop at.

-- ─── Section 1: the three NOT NULL constraints ───────────────────────────────
--
-- WHAT THIS ENFORCES. The table's uniqueness rule is the index
-- curriculum_completion_user_topic_key on (user_id, course_id, topic_id), added
-- by sql/curriculum_completion_gates.sql. In Postgres, NULLs are distinct from
-- one another by default, so that index does NOT prevent duplicates on any row
-- where one of the three is null. The upsert in app/lib/curriculum-progress.ts
-- names those same three columns as its on-conflict target, and an on-conflict
-- target that matches nothing falls through to INSERT.
--
-- Measured 2026-08-21, information_schema.columns: all three are is_nullable
-- YES. Only `id` is NOT NULL.
--
-- WHAT BREAKS IF SKIPPED. A single null in any of the three turns the snapshot
-- from one row per student per topic into an append-on-every-answer log. The
-- gate read in topic-data.ts uses .maybeSingle(), which ERRORS on more than one
-- row, so the topic page would stop resolving its gates for that student rather
-- than failing quietly. The student sees a broken topic, not a wrong number.
--
-- WHY IT HAS NOT HAPPENED. Both writers take these values from a Zod-parsed
-- request body (app/lib/schemas.ts:88-97 and :113-114: .min(1), .max(), and a
-- character-class regex), so null cannot currently reach the insert. This closes
-- the gap in the database rather than relying on that staying true, which is the
-- same argument sql/revoke_stray_anon_writes.sql makes about RLS being the whole
-- of a defence.
--
-- WHY NOT `nulls not distinct` ON THE INDEX. It would also work. It states the
-- invariant as index tie-breaking rather than as a property of the column, it
-- requires PostgreSQL 15 or later, and it leaves the columns still accepting
-- nulls everywhere else. NOT NULL says the thing itself.

alter table public.curriculum_completion alter column user_id   set not null;
alter table public.curriculum_completion alter column course_id set not null;
alter table public.curriculum_completion alter column topic_id  set not null;

-- ─── Section 2: furthest_section ─────────────────────────────────────────────
--
-- WHAT THIS ENFORCES. Nothing. It adds storage for per-section lesson progress,
-- which the outline needs for per-section checkmarks and for a reading-time-left
-- estimate. The existing lesson gate is a single timestamp, lesson_completed_at,
-- set when the end-of-content sentinel is seen, and it cannot express partial
-- progress through a lesson.
--
-- WHAT BREAKS IF SKIPPED. Nothing that exists today. Current-section tracking is
-- built client-only and works without this column; the checkmarks and the
-- estimate are the two things that stay unbuilt until it exists.
--
-- Nullable with no default and no backfill, on purpose. NULL means "no position
-- has ever been observed", which is the state all 36 existing rows are in, and
-- it is distinct from 0, which would mean "observed at the first section". Reads
-- must treat NULL as unknown and fall back to the binary gate.
--
-- Sections are counted the way app/lib/lesson-sections.ts counts them: h5
-- headings in the authored markdown, 1-indexed. Measured across all 97 topics,
-- 4 to 13 sections each, median 8. int rather than smallint because the width
-- costs nothing and a topic that grows past 32767 sections is not the failure
-- anyone should be planning for.
--
-- Reads take the HIGHER of stored and observed, the discipline the other gate
-- columns already follow in topic-data.ts, so a stale or missing value can never
-- move a student backwards.

alter table public.curriculum_completion
  add column if not exists furthest_section int;

-- ─── No index ────────────────────────────────────────────────────────────────
--
-- The column is only ever read as part of the existing single-row lookup on
-- (user_id, course_id, topic_id), which curriculum_completion_user_topic_key
-- already covers. An index on furthest_section alone would serve no query the
-- app makes.

-- ─── Deliberately not in this file ───────────────────────────────────────────
--
-- 1. The timestamp conversion. It has its own file and it runs first. See
--    sql/curriculum_completion_timestamptz.sql.
--
-- 2. revoke select on public.curriculum_completion from authenticated;
--    The grant exists, is not needed, and is held off the same as the rest of
--    the stray-grant cleanup. The measurement is recorded at
--    sql/curriculum_item_templates.sql, in the inventory that already tracks it.
--    Revoking one table there while six others keep the same grant would leave
--    the class half-closed and harder to see.
