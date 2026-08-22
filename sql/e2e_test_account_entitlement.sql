-- The browser-harness test account: confirm, then grant if needed.
--
-- WHY THIS EXISTS. scripts/capture_auth_state.mjs signs in once and saves the
-- session so scripts/walk_curriculum.mjs can visit real /course URLs. The
-- capture refuses to save a session that cannot open curriculum, which is the
-- right failure but a late one: it happens AFTER the manual Google sign-in.
-- Section 1 answers the same question before you spend that trip.
--
-- READ SECTION 1 FIRST. It changes nothing. Only run section 2 if section 1
-- shows the account is not already entitled.
--
-- Replace the email in both sections. Nothing else needs editing.
--
-- AND CHECK THAT YOU DID. This shipped with the literal string
-- REPLACE_WITH_TEST_ACCOUNT_EMAIL in both where clauses, and it cost an hour.
-- No profile has that email, so section 2's UPDATE matched zero rows and
-- section 1's SELECT returned zero rows, and the Supabase SQL editor reports
-- BOTH as "Success. No rows returned". That reads like a pass and is not one.
--
-- The tell is section 1: a real account returns exactly ONE row with
-- curriculum_ok in it. Zero rows never means "entitled" -- it means either the
-- email is wrong or the account has never signed in. Never move on from a
-- section 1 that returned nothing.
--
-- NOTE ON THIS FILE'S AUTHORITY: sql/ is not the schema source of truth, and
-- production carries constraints that are not in this directory. Every predicate
-- below was read out of app/lib/entitlement.ts and app/lib/capabilities.ts,
-- which are what actually gate the request, and the column values were checked
-- against the constraints in sql/entitlement_columns.sql. If section 2 throws,
-- send me the error rather than adjusting it: a constraint I could not see is
-- exactly the case this note exists for.


-- ─── Section 1: READ ONLY. Is this account already entitled? ────────────────
--
-- HOW TO READ THE RESULT. `curriculum_ok` is the whole answer. It reproduces
-- resolveCourseAccess() in SQL:
--
--   plan must be 'full-course'   -> capabilities.ts:102, the only student plan
--                                   carrying both "curriculum" and "gumu"
--   plan_status must grant       -> entitlement.ts:33, GRANTING is
--                                   ('active','trialing','past_due')
--   access_until must not have   -> entitlement.ts:59-69, with a 3 day grace.
--   passed, or be null              Null means no expiry: comped access only.
--
-- If curriculum_ok is true, stop. The account is ready and you can sign in.
-- If the query returns NO ROWS, the account has never signed in, so there is no
-- profile row yet. Sign in with Google ONCE first to create it, then come back
-- and run section 2.

select
  id,
  email,
  role,
  plan,
  plan_status,
  plan_source,
  access_until,
  subscription_status,
  (
    plan = 'full-course'
    and plan_status in ('active', 'trialing', 'past_due')
    and (access_until is null or access_until + interval '3 days' > now())
  ) as curriculum_ok
from public.profiles
where email = 'REPLACE_WITH_TEST_ACCOUNT_EMAIL';


-- ─── Section 2: grant Full Course. ONLY IF SECTION 1 SAYS curriculum_ok IS
-- ─── FALSE, AND ONLY AFTER THE ACCOUNT HAS SIGNED IN ONCE ───────────────────
--
-- WHY plan_source = 'comp' AND access_until = null.
--
-- This is a comped account, not a purchase, and saying so keeps it out of every
-- revenue read. It also satisfies profiles_access_until_check, which requires an
-- access_until only when plan_source = 'stripe' and the status grants: a comp
-- row legitimately has no period end because no renewal is coming. Null
-- access_until then means "no expiry" to isEntitled(), which is documented at
-- entitlement.ts:56 as comped or migrated access only. Exactly this case.
--
-- Writing a fake stripe row instead would put a test account into the customer
-- data with an invented period end, and someone would eventually count it.
--
-- role is left ALONE, deliberately, but NOT for the reason first written here.
--
-- CORRECTED 2026-08-22. This used to say role must stay 'student' because
-- 'teacher' "would route the walk through the derived viaTeacher branch". That
-- is wrong, and it was checked against course-access.ts rather than assumed.
-- resolveCourseAccess evaluates the buyer branch FIRST -- plan grants
-- 'curriculum' and the entitlement holds -- and returns viaTeacher: false there.
-- With plan = 'full-course' the role is never read at all. The teacher branch
-- below it could not fire even if it were reached, because it also requires
-- planGrants(plan, 'teacher-dashboard'), and 'teacher-dashboard' appears only on
-- teacher-core and teacher-pro (capabilities.ts CAPABILITIES).
--
-- So role is orthogonal to /course access for a full-course row. The real reason
-- not to touch it is narrower: role decides the STUDENT RAIL's chrome on
-- /dashboard/modules -- StudentNav.tsx:193,208 renders the band as
-- "TEACHER · PREVIEW" rather than "STUDENT" for a teacher without a teacher
-- plan, and :289 adds a Teacher Dashboard link. A walk that pins those strings
-- has to expect the persona it is actually running as.
--
-- subscription_status is set in lockstep because six readers still consult the
-- legacy column (entitlement.ts:71-79). Not setting it would leave this account
-- entitled by one path and not the other.
--
-- Scoped by email and asserted to touch one row. If it reports 0, the account
-- has not signed in yet; if more than 1, stop and tell me.

update public.profiles
set
  plan                = 'full-course',
  plan_status         = 'active',
  plan_source         = 'comp',
  plan_term           = null,
  access_until        = null,
  subscription_status = 'active'
where email = 'REPLACE_WITH_TEST_ACCOUNT_EMAIL';


-- ─── Section 3: READ ONLY. Confirm the grant landed ─────────────────────────
--
-- Re-run section 1. curriculum_ok must now be true. If it is not, do not sign
-- in: the capture will refuse anyway and the manual trip is wasted.
