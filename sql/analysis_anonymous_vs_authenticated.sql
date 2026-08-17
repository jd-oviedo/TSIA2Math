-- Anonymous vs authenticated: how much of the product is used signed out
--
-- READ-ONLY. Five SELECTs, no DDL, no writes. Run in the Supabase SQL editor.
--
-- WHY THIS EXISTS
-- ---------------
-- The curriculum practice surface treats the two tiers in opposite directions,
-- and the asymmetry runs the wrong way:
--
--                        correct answer      GUMU     worked solution
--   anonymous            given immediately   no       no
--   authenticated        withheld            yes      earned per item
--
-- The tier that gets the least support gets the answer handed to it fastest.
-- Whether that is the main event or a rounding error depends entirely on how
-- many real users are anonymous, which is what these queries measure.
--
--
-- READ THIS BEFORE THE QUERIES: HALF THE QUESTION IS NOT MEASURABLE
-- ------------------------------------------------------------------
-- The literal question -- "anonymous versus authenticated across curriculum
-- practice attempts" -- cannot be answered from this database, and no query
-- below will answer it. curriculum_attempts.student_id is
--
--   student_id uuid not null references auth.users(id)
--
-- so an anonymous attempt cannot be stored. It is not that those rows are rare;
-- they cannot exist. app/api/curriculum/practice/route.ts:22 says so outright:
-- "Anonymous students are graded but nothing is recorded." Every anonymous
-- answer to every practice item in the course has left no trace anywhere.
--
-- So curriculum_attempts can only ever report the authenticated side, and a
-- ratio computed from it would read as 100% authenticated no matter what is
-- actually happening. That is the trap this file exists to avoid walking into.
--
-- The CAT sessions table IS instrumented for both tiers -- sessions.user_id is
-- null for an anonymous run -- so it is the only place the split is directly
-- visible. Queries 1 and 2 measure it there. Query 4 measures how far the
-- anonymous population converts. Query 5 is the honesty check.
--
-- How good a proxy is CAT for curriculum practice? Partial. Both are reached
-- signed out and the CAT is the marketing-site front door, so it is the better
-- indicator of top-of-funnel behaviour. But a signed-out visitor who works
-- through practice items is doing something more committed than taking a free
-- 20-item test, and nothing here can size that group. Treat the CAT split as an
-- upper bound on how anonymous the audience is, not as a measurement of the
-- practice surface. If the proxy is not good enough to decide on, the fix is
-- anonymous instrumentation on the practice route -- a counter carrying no
-- identity -- which is its own piece of work and is not proposed here.


-- ─── 1. CAT sessions by tier, over time ──────────────────────────────────────
--
-- month                             calendar month the session was created
-- anonymous_sessions                runs with no user_id: signed out
-- authenticated_sessions            runs with a user_id: signed in
-- distinct_authenticated_students   how many people the authenticated runs
--                                   represent; anonymous has no equivalent,
--                                   since two anonymous runs cannot be linked
-- pct_anonymous                     anonymous share of that month's runs
--
-- Monthly rather than a single total because the mix is the thing that moves:
-- a product that was 90% anonymous at launch and is 30% now is a different
-- situation from one that has sat at 60% throughout, and one number hides that.
--
-- completed_at is reported alongside rather than filtered on. A row with a null
-- completed_at is an abandoned run, and abandonment is very likely to differ by
-- tier -- a signed-out visitor has less invested in finishing. Filtering those
-- out silently would remove exactly the behaviour that distinguishes the two
-- groups; counting them without saying so would inflate the anonymous share.
-- Both numbers are shown so the difference is visible rather than assumed.
select
  date_trunc('month', created_at)::date          as month,
  count(*) filter (where user_id is null)        as anonymous_sessions,
  count(*) filter (where user_id is not null)    as authenticated_sessions,
  count(*) filter (where user_id is null and completed_at is not null)
                                                 as anonymous_completed,
  count(*) filter (where user_id is not null and completed_at is not null)
                                                 as authenticated_completed,
  count(distinct user_id)                        as distinct_authenticated_students,
  round(
    100.0 * count(*) filter (where user_id is null) / nullif(count(*), 0),
    1
  )                                              as pct_anonymous,
  round(
    100.0 * count(*) filter (where user_id is null and completed_at is not null)
      / nullif(count(*) filter (where completed_at is not null), 0),
    1
  )                                              as pct_anonymous_completed_only
from public.sessions
group by 1
order by 1;


-- ─── 2. The same split, all time, with the session_type breakdown ────────────
--
-- total_sessions        every completed CAT run ever
-- anonymous             no user_id
-- authenticated         has a user_id
-- pct_anonymous         anonymous share of all runs
-- anon_diagnostic       anonymous runs, all of which are 'diagnostic' by
--                       definition (sql/sessions_session_type.sql)
-- auth_diagnostic       each signed-in student's FIRST run
-- auth_practice         every later run by a signed-in student
--
-- auth_practice is the number to watch beside the split. It is repeat
-- engagement by signed-in users, and it is the closest thing in this table to
-- "someone actually using the product rather than sampling it".
select
  count(*)                                             as total_sessions,
  count(*) filter (where user_id is null)              as anonymous,
  count(*) filter (where user_id is not null)          as authenticated,
  round(100.0 * count(*) filter (where user_id is null) / nullif(count(*), 0), 1)
                                                       as pct_anonymous,
  count(*) filter (where user_id is null and session_type = 'diagnostic')
                                                       as anon_diagnostic,
  count(*) filter (where user_id is not null and session_type = 'diagnostic')
                                                       as auth_diagnostic,
  count(*) filter (where user_id is not null and session_type = 'practice')
                                                       as auth_practice
from public.sessions;


-- ─── 3. Curriculum practice attempts: the authenticated side only ────────────
--
-- month              calendar month of the attempt
-- attempts           answers submitted
-- distinct_students  how many people those attempts represent
-- distinct_topics    how much of the 97-topic course was touched
-- correct            attempts that were right
-- pct_correct        share right, as a sanity check on the tier's engagement
--
-- There is no anonymous column here and there cannot be one. See the header.
-- This measures the size and shape of the authenticated curriculum audience,
-- which is the denominator the tier question is really about.
select
  date_trunc('month', created_at)::date  as month,
  count(*)                               as attempts,
  count(distinct student_id)             as distinct_students,
  count(distinct topic_id)               as distinct_topics,
  count(*) filter (where is_correct)     as correct,
  round(100.0 * count(*) filter (where is_correct) / nullif(count(*), 0), 1)
                                         as pct_correct
from public.curriculum_attempts
group by 1
order by 1;


-- ─── 4. Population sizes, for the conversion picture ─────────────────────────
--
-- anonymous_cat_sessions       signed-out CAT runs, all time
-- student_profiles             accounts with role = 'student'
-- students_with_cat_activity   accounts that have completed a CAT run
-- students_with_curriculum     accounts that have answered a practice item
-- students_with_10plus         accounts with 10+ attempts: past sampling,
--                              genuinely working through the course
--
-- The gap between anonymous_cat_sessions and student_profiles is the funnel
-- loss. The gap between student_profiles and students_with_curriculum is how
-- many people signed up and then never started the course.
select
  (select count(*) from public.sessions where user_id is null)          as anonymous_cat_sessions,
  (select count(*) from public.profiles where role = 'student')         as student_profiles,
  (select count(distinct user_id) from public.sessions
     where user_id is not null)                                         as students_with_cat_activity,
  (select count(distinct student_id) from public.curriculum_attempts)   as students_with_curriculum,
  (select count(*) from (
     select student_id from public.curriculum_attempts
     group by student_id having count(*) >= 10
   ) t)                                                                 as students_with_10plus;


-- ─── 5. The honesty check ────────────────────────────────────────────────────
--
-- anonymous_attempt_rows must come back 0. Not because anonymous students are
-- rare, but because the NOT NULL foreign key makes such a row impossible. If
-- this ever returns non-zero the schema has changed and everything above needs
-- rereading.
--
-- Run it so that "0 anonymous curriculum attempts" is a measured fact rather
-- than an inference from the DDL.
select count(*) as anonymous_attempt_rows
from public.curriculum_attempts
where student_id is null;


-- ─── What each shape of the answer supports ──────────────────────────────────
--
-- Read query 1's pct_anonymous trend together with query 4's
-- students_with_10plus. The first says how anonymous the traffic is; the second
-- says whether the authenticated side is a real audience or a handful of rows.
--
-- HIGH ANONYMOUS (say 60%+) AND students_with_curriculum SMALL
--   The inverted tier is the main event. Most people who touch the product
--   never sign in, and the surface they meet hands them the answer with no
--   explanation and no tutor -- the worst teaching outcome available, delivered
--   to the majority. The per-item worked-solution gate just shipped reaches
--   almost nobody, and the anonymous path becomes the first thing to fix.
--   It is still a GTM decision, not a code cleanup: what a signed-out visitor
--   gets is the product's front door and the shape of the free tier.
--
-- HIGH ANONYMOUS BUT students_with_10plus HEALTHY
--   Two distinct populations: samplers who bounce, and students who sign in and
--   work. The anonymous experience is marketing, not teaching, and judging it as
--   pedagogy is a category error. Leave it. Spend the effort on the
--   authenticated failure paths instead -- the turn_cap dead end for self-serve
--   students, and the fact that a student who never gets an item right still
--   never sees its worked solution.
--
-- LOW ANONYMOUS (say under 25%)
--   A rounding error. The asymmetry is real but it is not where the students
--   are. Note it, do not schedule it, and let the redesign concentrate on the
--   authenticated dead ends.
--
-- ANY SHAPE, IF students_with_curriculum IS IN SINGLE DIGITS
--   None of the above is decidable yet and no ratio computed from these tables
--   should be trusted to set direction. The honest read is that the product has
--   not been used enough to tell, and the redesign should be argued from
--   pedagogy rather than from data. Say so rather than reading a trend into
--   fifteen rows.
--
-- Two cautions that apply to every shape.
--
-- Query 1 counts SESSIONS, not people, on the anonymous side, because two
-- anonymous runs cannot be linked to one visitor. One person taking the test
-- five times reads as five anonymous users. That biases pct_anonymous UPWARD,
-- so a high anonymous share is weaker evidence than it looks and a low one is
-- stronger.
--
-- And prefer pct_anonymous_completed_only when the two columns disagree. If
-- anonymous runs abandon at a much higher rate, the all-rows percentage is
-- counting arrivals while the completed-only percentage is counting people who
-- actually took the test -- and it is the second group whose experience the
-- tier asymmetry is about.
