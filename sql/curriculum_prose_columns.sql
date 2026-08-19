-- curriculum_topics.distractor_prose and curriculum_topics.worked_solutions
--
-- Two addressable, per-item columns carved out of the answer key: the
-- teacher-readable explanation of every answer choice, and the worked solution
-- for every item.
--
-- DESIGN, FOR REVIEW. Juan runs this manually in the Supabase SQL editor.
-- Safe to run more than once: every statement is idempotent.
--
--
-- WHY THIS EXISTS
--
-- The prose is not new content and this migration does not import any. Every
-- topic's Part 4 already carries a `distractor_logic` block beside its
-- `misconception_tag` block -- 1,344 blocks over 96 of the 97 source files,
-- 5,376 per-letter entries, measured -- and the whole of Part 4 is ALREADY in
-- this table, verbatim, inside answer_key.raw. The upload writes
-- `{'raw': <the entire Part 4 markdown>}`, fenced json included.
--
-- So the prose is in the database today and has been all along. What it is not
-- is reachable:
--
--   * It is one opaque text blob per topic. Nothing can ask "what does option C
--     on practice item 4 mean" without re-parsing markdown at request time.
--   * stripAuthoringBlocks() in lib/curriculum-utils.ts deletes every ```json
--     fence before rendering, so the prose is removed from the only path that
--     currently reads answer_key.
--
-- This migration is therefore a STRUCTURING change, not an import. The same
-- bytes, addressable. That matters for the risk assessment on the re-upload:
-- nothing here can lose content that was not already stored.
--
--
-- WHY TWO COLUMNS AND NOT ONE
--
-- They are keyed differently, and collapsing them would force one of the two
-- into a shape it does not have:
--
--   distractor_prose   section -> item_number -> option letter -> prose
--   worked_solutions   section -> item_number -> prose
--
-- A worked solution belongs to the item, not to any option. Nesting it under a
-- letter would require inventing one.
--
--
-- WHY answer_key STAYS
--
-- It is not superseded and must not be dropped. Three live consumers read it:
--
--   topic-data.ts:161      selects it for a teacher, through the admin client
--   topic-data.ts:480-484  a second query that selects answer_key alone
--   quiz/page.tsx:142      renders the whole blob as fallbackHtml
--
-- More to the point, splitAnswerKey() in lib/curriculum-utils.ts already splits
-- this blob per item at render time, and its own contract is that it "returns
-- empty lists for any section it cannot parse -- a topic uploaded under an
-- older content shape, say -- and the caller falls back to rendering the whole
-- blob." answer_key.raw IS that fallback. Removing it removes the safety net
-- the existing split depends on, in the same commit that adds a second way to
-- get the same text wrong.
--
--
-- THE DUPLICATION THIS CREATES, STATED PLAINLY
--
-- After this migration the per-item split of Part 4 exists twice: once in
-- Python at upload time (extract_worked_solutions in upload_curriculum.py) and
-- once in TypeScript at request time (splitAnswerKey in lib/curriculum-utils.ts).
-- Neither can be deleted -- see above.
--
-- AUTHORITATIVE: the stored columns. splitAnswerKey remains the fallback for
-- rows written before this migration, and for any row whose columns are empty.
--
-- That sentence is a convention and conventions rot, so it is not left to hold
-- on its own. scripts/verify_answer_key_parity.mjs runs BOTH implementations
-- over the same topics and fails when they disagree, and it carries its own
-- fault injections proving it can fail. Registered as `npm run
-- test:answer-key-parity`. If the two ever drift, that is what says so.
--
--
-- ANSWER-BEARING, BOTH OF THEM
--
-- distractor_prose carries the "Correct: ..." entry for the correct option, so
-- the answer is stated in plain language, not merely recoverable by omission
-- the way misconception_tags leaks it. worked_solutions is the worked answer by
-- definition. Neither may reach a student.
--
-- Run this in the Supabase SQL editor. Kept here for version control.


-- ─── The columns ─────────────────────────────────────────────────────────────

-- `not null default '{}'` rather than nullable, matching practice_items and
-- misconception_tags. A topic with no prose yet is an empty object, so every
-- reader indexes into a jsonb rather than testing for null first -- and a
-- missing key is then the same shape as an empty topic, which is what callers
-- already expect from misconception_tags.
--
-- Both defaults are constant, so on PG11+ this is a catalog-only change: no
-- table rewrite, no long lock on a table every topic page reads.
--
-- MUST be applied before re-running the migration pipeline. PostgREST rejects
-- an upsert naming a column that does not exist, so upload_curriculum.py will
-- fail on the first topic without this.
alter table public.curriculum_topics
  add column if not exists distractor_prose jsonb not null default '{}'::jsonb,
  add column if not exists worked_solutions jsonb not null default '{}'::jsonb;

comment on column public.curriculum_topics.distractor_prose is
  'Per-option teacher-facing explanation, keyed section -> item_number -> '
  'option letter -> prose. Stored EXACTLY as authored, including the '
  '"Student makes misconception: <slug> (" wrapper and the "Correct: ..." '
  'entry for the correct option. Wrapper stripping happens at render time in '
  'extractDistractorProse() (lib/curriculum-utils.ts), never at authoring '
  'time. ANSWER-BEARING: the correct option is named in plain prose.';

comment on column public.curriculum_topics.worked_solutions is
  'Per-item worked solution markdown, keyed section -> item_number. The same '
  'text splitAnswerKey() derives at render time, split once at upload instead. '
  'Authoring fences and stray level headings removed; the "**Answer: X**" line '
  'is KEPT, because it is part of the authored solution. ANSWER-BEARING.';


-- ─── Why the prose is stored with its wrapper on ─────────────────────────────
--
-- Every wrong-answer entry is authored as:
--
--   "Student makes misconception: adds_instead_of_subtracts (adds the 9 to 14
--    instead of subtracting it, producing 23)"
--
-- and the UI wants only the parenthetical. The transformation is not done here
-- and not done at upload, for two reasons.
--
-- First, it is lossy. The slug inside the wrapper is the same taxonomy
-- misconception_tags carries, and storing the stripped prose would put a
-- derived string in the database while the thing it was derived from lived only
-- in a markdown file. The authored source stays the source.
--
-- Second, the strip is one regex and it belongs where the rendering is. It is
-- also easy to get wrong in a way that looks fine: 184 of the 4,032 wrong-answer
-- strings contain parentheses OF THEIR OWN -- "reads f(9) as f divided by 9".
-- The form that holds is:
--
--   /^Student makes misconception:\s*[a-z0-9_]+\s*\((.*)\)\s*$/s
--
-- and the load-bearing part is the trailing anchor, not the greediness. With
-- `\)\s*$` present, a lazy `(.*?)` backtracks forward to the same answer. Drop
-- the anchor and it returns "...so f(9" -- a truncated sentence that still
-- reads like a finished thought. Use a `[^)]*` class and it fails to match at
-- all.
--
-- tests/distractor-prose.test.ts pins all three, on a verbatim AR.1.1 entry.


-- ─── Grants and RLS ──────────────────────────────────────────────────────────
--
-- INHERITED, NOT NEW. Grants in Postgres are per table, not per column, so
-- these two columns arrive under whatever curriculum_topics already holds --
-- which sql/curriculum_topics_public.sql already set to zero for the API roles.
-- There is no new posture to establish and none should be invented.
--
-- Both statements below are re-assertions rather than changes. They are here
-- because "the posture is already right" is exactly the assumption that missed
-- the stray anon SELECT grants on six other tables: the way to know is to run
-- the revoke and then measure, not to read an earlier file and conclude.
--
-- ALL, not SELECT: the default privileges cover more than reads, and naming the
-- one privilege that matters today is how the other half gets left behind.
revoke all on public.curriculum_topics from anon, authenticated;

-- ENABLE, never FORCE, and that distinction is load-bearing on THIS table
-- rather than stylistic. curriculum_topics_public is a security-definer view,
-- so it reads this table as its owner, and an owner is exempt from RLS only
-- while FORCE is off. Setting FORCE here makes the public view silently return
-- nothing to every student -- a 200 with an empty body, not an error.
alter table public.curriculum_topics enable row level security;


-- ─── curriculum_topics_public: NOT TOUCHED, DELIBERATELY ─────────────────────
--
-- Neither column goes in the view, so this migration does NOT need the
-- two-file update that sql/curriculum_topics_public.sql's header describes, and
-- the APPEND-ONLY hazard around issue #84 is not in play here.
--
-- That is a decision, not an omission. The view's own header lists what is
-- excluded and why, and both of these fall squarely in the same category:
--
--   answer_key          worked solutions, teacher-only -> worked_solutions is
--                       the same content, split up
--   misconception_tags  the option -> slug map -> distractor_prose carries the
--                       same slugs AND names the correct option outright
--
-- Teachers already reach answer_key through the admin client after
-- requireTeacher() in topic-data.ts. These two columns follow that identical
-- path and need no grant of their own.
--
-- IF THAT EVER CHANGES -- if a student-facing page is ever meant to show a
-- worked solution after a completed attempt, say -- then BOTH files defining
-- the view must be updated in the SAME commit:
--
--   sql/curriculum_topics_public.sql
--   sql/curriculum_placeholder_topics.sql
--
-- They each issue their own CREATE OR REPLACE of the same view and must select
-- the same columns in the same order. CREATE OR REPLACE VIEW can only APPEND,
-- so a new column goes on the END of both select lists and the existing order
-- is not to be tidied. Read that file's header before attempting it.


-- ─── After running this ──────────────────────────────────────────────────────
--
-- 1. Confirm both columns exist with the right type and default:
--
--      select column_name, data_type, is_nullable, column_default
--      from information_schema.columns
--      where table_schema = 'public'
--        and table_name = 'curriculum_topics'
--        and column_name in ('distractor_prose', 'worked_solutions');
--
--    Expect two rows, jsonb, NO, '{}'::jsonb.
--
-- 2. Confirm the grants, by measurement rather than by assuming the revoke ran:
--
--      select grantee, privilege_type
--      from information_schema.role_table_grants
--      where table_name = 'curriculum_topics';
--
--    Expect postgres and service_role only. Any anon or authenticated row means
--    the revoke did not take and the answer key is readable by the browser key.
--
-- 3. Confirm the public view did NOT pick the columns up. This is the check
--    that matters most, because the failure is silent -- a leaked answer key
--    reads as a working page:
--
--      select column_name
--      from information_schema.columns
--      where table_schema = 'public'
--        and table_name = 'curriculum_topics_public'
--        and column_name in ('distractor_prose', 'worked_solutions');
--
--    Expect ZERO rows. Any row here means a student can read the answer key.
--
-- 4. Confirm the view still returns rows to the anon key at all, since step 2
--    revoked on the base table:
--
--      select count(*) from public.curriculum_topics_public;
--
--    Expect the live topic count, not 0.
--
-- 5. THEN re-upload, which is what actually populates the columns. Until it
--    runs, both are '{}' on every row and every reader falls back:
--
--      python3 curriculum/migrations/upload_curriculum.py --course tsia2-math --dry-run
--      python3 curriculum/migrations/upload_curriculum.py --course tsia2-math
--
-- 6. Confirm the populate landed, across all topics rather than by spot check:
--
--      select
--        count(*)                                                  as topics,
--        count(*) filter (where distractor_prose = '{}'::jsonb)     as prose_empty,
--        count(*) filter (where worked_solutions = '{}'::jsonb)     as solutions_empty
--      from public.curriculum_topics
--      where course_id = 'tsia2-math' and not is_placeholder;
--
--    Expect topics = 97, solutions_empty = 0, and prose_empty = 1.
--
--    prose_empty = 1 is CORRECT and is not a failure. QR.1.1 is the one source
--    file with no distractor_logic block anywhere -- its practice section is
--    mostly free-response, so most items have no options to explain. Expecting
--    0 here would send someone hunting a bug that is authored content.
