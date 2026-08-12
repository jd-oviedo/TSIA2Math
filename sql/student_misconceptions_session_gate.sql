-- student_misconceptions: gate 'high' confidence on evidence that spans
-- more than one sitting and more than one item.
--
-- Run this in the Supabase SQL editor. Kept here for version control.
--
-- WHY -----------------------------------------------------------------------
--
-- record_misconception() walked a ladder keyed on times_hit alone: low, medium
-- at 2, high at 3. Nothing tied a hit to a distinct sitting, so three wrong
-- answers on three items carrying the same slug inside one 20-item diagnostic
-- reached 'high' before the student left the page. 'high' is the threshold at
-- which a misconception surfaces to a teacher and downstream to a parent, and
-- the argument for making CAT evidence walk the ladder at all -- a 4-option
-- item carries a 25% guess rate and is weak evidence of a belief rather than a
-- slip -- applies with more force inside a single sitting, not less. Three
-- wrong answers in one sitting are also the most likely to be correlated:
-- fatigue, a misread stem, a shaky twenty minutes.
--
-- A sibling hole: `exposure_max` is declared on items but never enforced, so
-- nothing stops a retaking student seeing the same item again. Counting
-- sittings alone would let three attempts at ONE question reach 'high' -- one
-- misconception observed on one question three times, which is weaker evidence
-- than the three-items-in-one-sitting case this migration blocks. So the gate
-- requires distinct items as well as distinct sittings. Enforcing exposure_max
-- properly is a separate project in the CAT selection engine.
--
-- Rationale and the options considered: design-decisions.md.
--
-- SCOPE ---------------------------------------------------------------------
--
-- The new rung binds CAT-only rows and nothing else. Curriculum and Socratic
-- behaviour is byte-identical to before:
--
--   * the curriculum route is per-item and has no session concept at all --
--     curriculum_attempts is an append-only event log with no grouping key --
--     so it passes no session id, and the gate does not apply to it
--   * Socratic still fast-tracks to 'high' on the first hit, unchanged
--   * a mixed row (curriculum + cat) is not CAT-only and keeps the old rule.
--     Deliberate: curriculum hits genuinely are separate occasions, so one CAT
--     hit tipping such a row to 'high' is real evidence, not a loophole.
--
-- Both new arguments default to null, so EXISTING 4-ARGUMENT CALLERS KEEP
-- WORKING UNCHANGED. The curriculum call site needs no edit, now or later.
--
-- BACKFILL ------------------------------------------------------------------
--
-- None required. The column defaults cover every existing row, and as of
-- 2026-08-12 all 26 live rows are 'curriculum'-sourced -- the CAT path has
-- never written one. The gate ignores them either way.


-- 1. New state ---------------------------------------------------------------
--
-- Arrays rather than integer counters. A counter needs a companion
-- "last_session_id" to avoid double-counting and still gets it wrong when
-- sittings interleave; the array is exact, and it is auditable when a teacher
-- disputes why a misconception was marked high.

alter table public.student_misconceptions
  add column if not exists session_ids uuid[] not null default '{}',
  add column if not exists item_ids    text[] not null default '{}';

comment on column public.student_misconceptions.session_ids is
  'Distinct sessions.id values that contributed CAT evidence. Append-only, '
  'capped at 20 (nothing above 2 affects the ladder). Empty for curriculum '
  'and Socratic hits, which supply no session id.';

comment on column public.student_misconceptions.item_ids is
  'Distinct questions.item_id values that contributed CAT evidence. Same '
  'cap and same emptiness rule as session_ids.';


-- 2. The ladder, as its own function -----------------------------------------
--
-- Split out because the confidence expression now takes four inputs and would
-- otherwise have to repeat three long array expressions inline inside the
-- upsert, where a typo in one copy would be invisible. Same reason the ladder
-- lives in Postgres at all: one place, so it cannot drift between callers.
--
-- Covers the UPDATE path only. The INSERT path keeps its own two-branch
-- expression, because a first Socratic hit lands at 'medium' and only reaches
-- 'high' on a later one -- existing behaviour, deliberately preserved.

create or replace function public.misconception_confidence(
  p_sources       text[],
  p_times_hit     int,
  p_session_count int,
  p_item_count    int
) returns text as $$
  select case
    -- Socratic evidence is a dialogue the student worked through, not a
    -- guess against four options. Unchanged: it still fast-tracks.
    when 'socratic' = any(p_sources) then 'high'

    -- CAT-only: 'high' additionally requires the evidence to span at least
    -- two sittings AND at least two distinct items.
    when p_sources <@ array['cat']::text[]
     and p_times_hit >= 3
     and p_session_count >= 2
     and p_item_count >= 2
      then 'high'

    -- CAT-only, enough hits but all from one sitting or one item. Capped at
    -- 'medium': three wrong answers are real evidence, they are just not
    -- evidence of persistence across time.
    when p_sources <@ array['cat']::text[]
     and p_times_hit >= 3
      then 'medium'

    -- Everything else: the original ladder, untouched.
    when p_times_hit >= 3 then 'high'
    when p_times_hit  = 2 then 'medium'
    else 'low'
  end;
$$ language sql immutable;


-- 3. record_misconception ----------------------------------------------------
--
-- DROP then CREATE, in one transaction, rather than CREATE OR REPLACE.
--
-- `create or replace` with a different argument list creates an OVERLOAD, not
-- a replacement: the old 4-argument function survives, and because the new
-- arguments have defaults a 4-argument call then matches both and fails with
-- "function record_misconception is not unique". Dropping first inside the
-- transaction means there is never a moment where both exist.
--
-- Carried over from sql/gumu_tables.sql section 4 and NOT to be dropped: the
-- p_source guard. The table's CHECK constraints would still catch a bad value,
-- but as a constraint violation raised from inside plpgsql rather than a named
-- error at the call site.

begin;

drop function if exists public.record_misconception(uuid, text, text, text);

create function public.record_misconception(
  p_student_id    uuid,
  p_misconception text,
  p_strand        text,
  p_source        text,           -- 'cat' | 'curriculum' | 'socratic'
  p_session_id    uuid default null,  -- CAT only; null elsewhere
  p_item_id       text default null   -- CAT only; null elsewhere
) returns void as $$
begin
  if p_source is null or p_source not in ('cat', 'curriculum', 'socratic') then
    raise exception
      'record_misconception: invalid p_source %, expected cat, curriculum, or socratic',
      p_source;
  end if;

  insert into public.student_misconceptions
    (student_id, misconception, strand, times_hit, sources, confidence,
     session_ids, item_ids)
  values
    (p_student_id, p_misconception, p_strand, 1, array[p_source],
     case when p_source = 'socratic' then 'medium' else 'low' end,
     case when p_session_id is null then '{}'::uuid[] else array[p_session_id] end,
     case when p_item_id    is null then '{}'::text[] else array[p_item_id]    end)
  on conflict (student_id, misconception) do update set
    times_hit = student_misconceptions.times_hit + 1,

    sources = case
      when p_source = any(student_misconceptions.sources)
      then student_misconceptions.sources
      else array_append(student_misconceptions.sources, p_source)
    end,

    -- Append only a genuinely new id, and stop at 20: nothing above 2 changes
    -- the ladder, and an unbounded array on a hot row is a slow leak.
    session_ids = case
      when p_session_id is null
        or p_session_id = any(student_misconceptions.session_ids)
        or coalesce(array_length(student_misconceptions.session_ids, 1), 0) >= 20
      then student_misconceptions.session_ids
      else array_append(student_misconceptions.session_ids, p_session_id)
    end,

    item_ids = case
      when p_item_id is null
        or p_item_id = any(student_misconceptions.item_ids)
        or coalesce(array_length(student_misconceptions.item_ids, 1), 0) >= 20
      then student_misconceptions.item_ids
      else array_append(student_misconceptions.item_ids, p_item_id)
    end,

    last_seen  = now(),
    updated_at = now(),

    -- The same three expressions as above, so the ladder sees the state as it
    -- will be after this write rather than as it was before it.
    confidence = public.misconception_confidence(
      case
        when p_source = any(student_misconceptions.sources)
        then student_misconceptions.sources
        else array_append(student_misconceptions.sources, p_source)
      end,
      student_misconceptions.times_hit + 1,
      coalesce(array_length(
        case
          when p_session_id is null
            or p_session_id = any(student_misconceptions.session_ids)
            or coalesce(array_length(student_misconceptions.session_ids, 1), 0) >= 20
          then student_misconceptions.session_ids
          else array_append(student_misconceptions.session_ids, p_session_id)
        end, 1), 0),
      coalesce(array_length(
        case
          when p_item_id is null
            or p_item_id = any(student_misconceptions.item_ids)
            or coalesce(array_length(student_misconceptions.item_ids, 1), 0) >= 20
          then student_misconceptions.item_ids
          else array_append(student_misconceptions.item_ids, p_item_id)
        end, 1), 0)
    );
end;
$$ language plpgsql security definer;

commit;

-- Fails safe: if the CAT route ever omits p_session_id, session_ids stays
-- empty, the count stays 0, and the row caps at 'medium'. A bug there
-- under-reports confidence rather than over-reporting it.


-- VERIFY ---------------------------------------------------------------------
--
-- 1. Exactly one record_misconception, taking six arguments:
--
--   select p.oid::regprocedure
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public' and p.proname = 'record_misconception';
--
--   expected: one row, record_misconception(uuid,text,text,text,uuid,text)
--
-- 2. The columns exist with the right defaults:
--
--   select column_name, data_type, column_default, is_nullable
--   from information_schema.columns
--   where table_name = 'student_misconceptions'
--     and column_name in ('session_ids', 'item_ids');
--
-- 3. The section 4 guards are still in place (this migration must not have
--    dropped them):
--
--   select conname, pg_get_constraintdef(oid)
--   from pg_constraint
--   where conrelid = 'public.student_misconceptions'::regclass
--     and contype = 'c';
--
-- 4. The ladder itself, without writing anything:
--
--   select
--     public.misconception_confidence(array['cat'],3,1,3)             as one_sitting,      -- medium
--     public.misconception_confidence(array['cat'],3,3,1)             as one_item,         -- medium
--     public.misconception_confidence(array['cat'],3,2,2)             as spread,           -- high
--     public.misconception_confidence(array['cat'],2,2,2)             as two_hits,         -- medium
--     public.misconception_confidence(array['cat','curriculum'],3,1,1) as mixed,            -- high
--     public.misconception_confidence(array['curriculum'],3,0,0)      as curriculum_only,  -- high
--     public.misconception_confidence(array['socratic'],1,0,0)        as socratic;         -- high


-- ROLLBACK -------------------------------------------------------------------
--
-- Restores the previous behaviour exactly. No data is destroyed: the columns
-- are left in place, unread and harmless, so a re-apply does not need a
-- backfill.
--
--   begin;
--   drop function if exists public.record_misconception(uuid,text,text,text,uuid,text);
--   -- then re-run the create function block from sql/gumu_tables.sql section 4
--   commit;
--   drop function if exists public.misconception_confidence(text[],int,int,int);
