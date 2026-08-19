-- Entitlement columns on profiles.
--
-- DESIGN, FOR REVIEW. Juan runs this manually in the Supabase SQL editor.
-- Safe to run more than once: every statement is idempotent and the backfill in
-- section 3 keys on current state rather than a fixed row count, so it can be
-- re-run after Friday to pick up any founding teacher who paid in the meantime.
--
-- WHY THIS EXISTS
--
-- profiles today records THAT someone paid and nothing else. subscription_status
-- is a single text field holding 'active' or 'inactive', and it is doing the work
-- of three separate questions:
--
--   1. is this account paid up?          <- it answers this
--   2. what did they buy?                <- it cannot answer this
--   3. until when?                       <- it cannot answer this
--
-- Eight live Payment Links now exist across four capability levels, and two of
-- the products are one time payments with fixed terms that Stripe charges once
-- and then forgets. A single boolean cannot carry that. Worse, `role` has been
-- absorbing question 2 by proxy: three code paths promote a buyer to
-- role='teacher' without ever looking at what was purchased, so "what you bought"
-- is currently encoded as "what kind of user you are". Those are different facts
-- and they need different columns.
--
-- The shape below separates identity (role) from entitlement (plan, plan_status,
-- access_until). role goes back to meaning only "what kind of user is this".
--
-- ONE MODEL, NOT TWO
--
-- Student passes and teacher subscriptions share these columns. They differ in
-- how access_until is computed and in what the plan unlocks, and neither of those
-- is a schema difference:
--
--   one time     access_until = paid_at + 6 or 12 months, written once, never revisited
--   subscription access_until = current_period_end, refreshed on every renewal
--
-- What a plan unlocks is a code level map (plan -> capabilities), not a column.
-- One column set means one "is this entitlement live" rule, one place to get
-- expiry wrong, and one thing for Phase 4 to read.
--
--
-- THE COLUMN STORES WHAT STRIPE SENT. THE CODE DECIDES WHAT IT MEANS.
--
-- This is the single most important decision in this file, and the first draft
-- got it wrong in a way that would have taken production down.
--
-- That draft enumerated a reduced set of statuses and omitted trialing, unpaid
-- and incomplete_expired, all three of which the CURRENT webhook already
-- observes and branches on. A subscription moving to `unpaid` would have
-- violated the constraint, thrown on write, returned 500, and Stripe would have
-- retried that event forever. A schema that cannot represent a value its own
-- source of truth emits is not a constraint, it is an outage with a delay on it.
--
-- So: plan_status holds the raw Stripe subscription status verbatim, all eight
-- of them, plus one non Stripe value for the one time passes. No Stripe value is
-- unrepresentable, and the webhook never has to decide whether a status is
-- "allowed" before it can record what happened.
--
-- The grants-access decision lives in app/lib/entitlement.ts, next to the grace
-- interval, and for exactly the same reason the grace interval is not a column:
-- it is policy, it will change, and changing it should not require a migration
-- or a backfill of historical rows.
--
--   Stripe subscription statuses, all eight:
--
--     active              GRANTS
--     trialing            GRANTS
--     past_due            GRANTS. Stripe is retrying a card. See below.
--     incomplete          does not grant. Created, initial payment never completed.
--     incomplete_expired  does not grant. The initial payment window closed.
--     unpaid              does not grant. All retries failed.
--     canceled            does not grant.
--     paused              does not grant. pause_collection is set, so not billing.
--
--   Plus one value Stripe never sends:
--
--     expired             does not grant. One time passes only. See the note on
--                         sweeps below; nothing writes this today.
--
-- THE RULE, stated once so it is not reinvented per call site:
--
--   entitled = plan_status in ('active', 'trialing', 'past_due')
--              and (access_until is null or access_until > now())
--
-- past_due grants deliberately. Stripe retries a failed card for days; today
-- invoice.payment_failed revokes access on the FIRST failure, so a card that
-- fails once and succeeds on retry locks the teacher out in between. Under this
-- rule a past_due teacher keeps access until the period they already paid for
-- actually ends, which access_until already encodes.
--
-- The rule cannot be a generated column, because now() is not immutable.
--
-- NO EXPIRY SWEEP EXISTS, AND THE GATE DOES NOT NEED ONE. Expiry is enforced by
-- comparing access_until to now() at read time, not by a cron flipping
-- plan_status to 'expired'. That value exists so a future sweep or a support
-- correction has somewhere to write, not because the gate reads it. A missed
-- sweep therefore cannot grant access it should not.
--
-- FAIL CLOSED ON PURPOSE
--
-- Storing current_period_end for subscriptions is the fix for the missed webhook
-- problem. Today, if Stripe's cancellation webhook is never delivered,
-- subscription_status stays 'active' forever and nothing in the data can catch
-- it. With access_until, a missed renewal lapses naturally at period end.
--
-- The cost is the mirror case: a DELAYED renewal webhook could briefly lock out a
-- paying teacher. That is handled with a grace interval applied in the code
-- helper, not stored here, so the column keeps exactly what Stripe said and the
-- forgiveness stays adjustable without a migration.
--
-- RLS
--
-- No new grants, and none should be added. anon and authenticated hold SELECT
-- only on profiles, under a single "users can read own profile" policy with
-- polcmd = r. All writes are service_role. These columns inherit that posture
-- unchanged: a signed in user can read their own entitlement and cannot write it.
-- Section 4 confirms no view or definer function leaks them.


-- ---------------------------------------------------------------------------
-- 1. Columns
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists plan                   text,
  add column if not exists plan_term              text,
  add column if not exists plan_status            text,
  add column if not exists access_until           timestamptz,
  add column if not exists plan_source            text,
  add column if not exists stripe_payment_link_id text,
  add column if not exists plan_updated_at        timestamptz;

comment on column public.profiles.plan is
  'What was bought, at capability granularity. Null means no entitlement. '
  'Monthly and annual collapse to the same plan because they unlock the same '
  'thing; the billing cadence lives in plan_term. The founding teacher rate is '
  'a PRICE, not a tier: founding teachers hold plan = teacher-core, and '
  'is_founder plus stripe_payment_link_id record the rate.';

comment on column public.profiles.plan_term is
  'Billing cadence. Informational only, never gated on. Null for comped access.';

comment on column public.profiles.plan_status is
  'The raw Stripe subscription status, verbatim, or ''expired'' for a lapsed one '
  'time pass. Storage only: whether a status grants access is decided in '
  'app/lib/entitlement.ts, never here and never by the webhook at write time.';

comment on column public.profiles.access_until is
  'Hard end of access. For one time passes, the payment date plus 6 or 12 '
  'months. For subscriptions, Stripe current_period_end, refreshed on every '
  'renewal. NULL means no expiry, which is comped or migrated access only. Any '
  'grace interval is applied in code, not stored here.';

comment on column public.profiles.plan_source is
  'How the entitlement was granted. Migration rows predate these columns and '
  'carry no reliable plan or expiry until a webhook corrects them.';

comment on column public.profiles.stripe_payment_link_id is
  'The plink_ id that produced this entitlement. Audit trail, so a wrong plink '
  'to plan mapping can be found after the fact rather than inferred. This is '
  'also the only per row record of whether a teacher bought at the founding '
  'rate or the public one, since both map to plan = teacher-core.';


-- ---------------------------------------------------------------------------
-- 2. Value constraints
--
-- These exist to catch a wrong MAP ENTRY, not to second guess Stripe. plan,
-- plan_term and plan_source are written from tables this repo controls, so a bad
-- value there is a bug and should fail loudly. plan_status is written from
-- Stripe, so it is enumerated exhaustively and never rejects a real value.
--
-- CAPABILITY MAP, recorded here because the plan constraint is meaningless
-- without it. Phase 4 implements this and must not invent a fifth row.
--
-- CORRECTED TWICE ON 2026-08-19, AND IT WAS WRONG IN BOTH DIRECTIONS WITHIN ONE
-- SESSION. Both errors are recorded rather than quietly replaced, because both
-- were reached from confident readings of written sources, and the second was a
-- correction OF the first that overshot.
--
-- Version 1, wrong: "practice-pass: practice only ... NO GUMU, NO curriculum".
-- Shorthand that read, literally, as Practice Pass unlocking no part of a
-- curriculum topic. Taken at face value it made /course/.../practice a Full
-- Course route despite its name.
--
-- Version 2, also wrong: read the live /pricing bullets as evidence against
-- that, since Practice Pass advertises "Full practice bank across all 97 topics"
-- and "Progress tracking by topic", and split the model into
-- curriculum-practice and curriculum-lesson. That split does not exist.
--
-- Version 3, correct, and it is the long-standing product boundary that neither
-- the shorthand nor the pricing copy stated properly:
--
--   A PRACTICE PASS HOLDER NEVER LANDS ON A /course URL.
--   Practice Pass is the worksheet generator.
--   Curriculum, lessons and GUMU are Full Course.
--
-- The pricing bullets are not evidence against the boundary. They are evidence
-- that the pricing copy is wrong, and it is being fixed in the marketing repo
-- (unpackmath-home, legal-audit-2026-08.md). "A worked solution on every
-- problem" is the sharpest of them: a Practice Pass holder meets worked
-- reasoning through the CAT engine rationale and through worksheet solutions,
-- neither of which is a worked problem in the sense that bullet implies.
--
-- The map, at capability granularity:
--
--   practice-pass  the worksheet generator when it ships. NOTHING in /course:
--                  no lesson, no practice section, no mini quiz, no GUMU.
--   full-course    EVERYTHING IN PRACTICE PASS, PLUS the whole topic tree
--                  (lesson, practice, quiz, worked examples, completion gates)
--                  and GUMU. A strict superset. This is a live public
--                  commitment: the Full Course column on unpackmath.com/pricing
--                  reads "EVERYTHING IN PRACTICE PASS, PLUS". Not an assumption,
--                  and not something Phase 4 may quietly narrow.
--   teacher-core   teacher dashboard, regular worksheet access
--   teacher-pro    teacher dashboard, UNLIMITED worksheets
--
-- So Phase 4's gate is ONE plan check at the course root, not a per route map.
-- There is no mid topic lock, and app/lib/topic-parts.ts's "No locked state" and
-- TopicOverview's "drawing a padlock would be inventing a lock that does not
-- exist" both remain true.
--
-- Teacher Core and Teacher Pro differ by worksheet quota, not by feature
-- presence. The worksheet generator itself belongs to Practice Pass on the
-- student side.
--
-- TEACHER PLANS DELIBERATELY HOLD NO CURRICULUM CAPABILITY. Teachers do reach
-- /course, because the teacher answer-key surface IS the course tree, but that
-- is not something Teacher Core SELLS. This map is the record of what each plan
-- sells, so the second reason to reach the route is expressed in the gate
-- predicate instead, as "curriculum OR teacher-dashboard", and the two reasons
-- stay separately legible. See phase-4-entitlement-gate-design.md section 2.4.
--
-- NOTHING BELOW THIS COMMENT CHANGED IN ANY OF THE THREE VERSIONS. The plan
-- VALUES were never wrong, only the prose describing what they unlock, so
-- profiles_plan_check is untouched throughout.
-- ---------------------------------------------------------------------------

alter table public.profiles
  drop constraint if exists profiles_plan_check,
  add  constraint profiles_plan_check check (
    plan is null or plan in (
      'practice-pass',   -- $49, one time, 6 month term,  student
      'full-course',     -- $89, one time, 12 month term, student
      'teacher-core',    -- $20 monthly / $200 annual, and the $10/$100 founding rate
      'teacher-pro'      -- $30 monthly / $300 annual
    )
  );

alter table public.profiles
  drop constraint if exists profiles_plan_term_check,
  add  constraint profiles_plan_term_check check (
    plan_term is null or plan_term in ('monthly', 'annual', 'one-time')
  );

-- EXHAUSTIVE over Stripe's subscription statuses. Adding a value Stripe can send
-- is not optional: an unrepresentable status throws on write, the webhook returns
-- 500, and Stripe retries that event forever. If Stripe ever introduces a ninth
-- status, this constraint is the thing that must change first.
--
-- Grants and does-not-grant are documented in the header and enforced in
-- app/lib/entitlement.ts. This constraint expresses no opinion about access.
alter table public.profiles
  drop constraint if exists profiles_plan_status_check,
  add  constraint profiles_plan_status_check check (
    plan_status is null or plan_status in (
      -- Stripe subscription statuses, all eight, stored verbatim
      'active',
      'trialing',
      'past_due',
      'incomplete',
      'incomplete_expired',
      'unpaid',
      'canceled',
      'paused',
      -- not a Stripe value: a one time pass whose term ran out
      'expired'
    )
  );

alter table public.profiles
  drop constraint if exists profiles_plan_source_check,
  add  constraint profiles_plan_source_check check (
    plan_source is null or plan_source in ('stripe', 'comp', 'migration')
  );

-- A plan and its status travel together. Either both are set or neither is.
-- This catches a half written activation, which is the failure mode most likely
-- to leave someone paying and locked out.
alter table public.profiles
  drop constraint if exists profiles_plan_pairing_check,
  add  constraint profiles_plan_pairing_check check (
    (plan is null and plan_status is null)
    or (plan is not null and plan_status is not null)
  );

-- A stripe sourced row that GRANTS access must say when that access ends,
-- because a granting row with no end date is the missed webhook bug in a new
-- costume.
--
-- Scoped to the granting statuses on purpose. The first draft required an
-- access_until for every stripe sourced row, which is the same defect as the
-- status enum: an `incomplete` or `incomplete_expired` subscription legitimately
-- has no usable period end, so that constraint would have thrown on write for a
-- perfectly ordinary Stripe event. Written as a CASE so the precedence is
-- unambiguous rather than clever.
alter table public.profiles
  drop constraint if exists profiles_access_until_check,
  add  constraint profiles_access_until_check check (
    case
      when plan_source = 'stripe'
       and plan_status in ('active', 'trialing', 'past_due')
      then access_until is not null
      else true
    end
  );


-- ---------------------------------------------------------------------------
-- 3. Backfill
--
-- Confirmed against production while designing this: 32 profiles, of which
-- 22 student/inactive, 7 teacher/active, 3 teacher/inactive.
--
-- NO STUDENT HAS EVER HELD active STATUS. There is no student entitlement to
-- migrate, so this touches teachers only and the student rows are left alone.
--
-- KEYED ON STATE, NOT ON A COUNT. The predicate is "active teacher with no
-- entitlement yet", so this statement is idempotent and re-runnable. The
-- founding tier closes Friday and warm contacts can still buy until then; any
-- founding teacher who pays before Phase 3 ships arrives as
-- subscription_status='active' with plan null, and re-running this picks them up
-- with no double write and no need to know how many there were.
--
-- 'teacher-core' IS CORRECT FOR ALL OF THEM. No Teacher Pro has ever sold, and
-- founding teachers at $10/$100 hold the teacher-core capability set; the
-- founding rate is a price, not a tier. No hand correction is expected after
-- this runs.
--
-- FAIL OPEN HERE, deliberately, and only here. Every migrated row gets
-- access_until = null, so nobody signed in loses access the moment this runs.
-- Fail closed is right for a NEW purchase and wrong for a migration, where a
-- mistake locks out a paying customer who did nothing. plan_source='migration'
-- marks these rows so they stay distinguishable from genuine comps, and the next
-- customer.subscription.updated webhook overwrites plan_term, access_until and
-- plan_source with real Stripe data for anyone holding a live subscription.
--
-- "Grandfathered for life" is preserved by the PRICE continuing to renew, not by
-- access_until staying null. Once a founding teacher's next renewal webhook
-- fires, access_until becomes current_period_end and refreshes on every renewal
-- thereafter, which is correct. is_founder remains the record of who is on the
-- founding rate.

update public.profiles
   set plan            = 'teacher-core',
       plan_status     = 'active',
       plan_source     = 'migration',
       access_until    = null,
       plan_updated_at = now()
 where role = 'teacher'
   and subscription_status = 'active'
   and plan is null;

-- Re-run this any time to see who still needs picking up. Expect zero rows
-- immediately after the update above, and possibly a few after Friday.
select id, role, subscription_status, is_founder, stripe_customer_id, created_at
  from public.profiles
 where role = 'teacher'
   and subscription_status = 'active'
   and plan is null;


-- ---------------------------------------------------------------------------
-- 4. Verification
-- ---------------------------------------------------------------------------

-- 4a. Does any view expose the new columns?
--
-- The concern is a view defined as `select * from profiles`, which would pick up
-- the new columns automatically and hand them to whatever role holds a grant on
-- the view. Expect ZERO rows. A non empty result means that view needs its
-- column list pinned before Phase 3 writes anything real into these columns.
select c.relname             as view_name,
       c.relkind,
       pg_get_viewdef(c.oid) as definition
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public'
   and c.relkind in ('v', 'm')
   and pg_get_viewdef(c.oid) ilike '%profiles%';

-- 4b. Does any SECURITY DEFINER function read profiles and return it wholesale?
-- A definer function bypasses RLS, so one returning a profiles row hands back the
-- new columns to any caller. This is the same hazard class as the
-- qualified_sessions security_invoker finding. Expect zero, or only functions you
-- recognise.
select p.proname,
       p.prosecdef as security_definer,
       pg_get_function_result(p.oid) as returns
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.prosecdef
   and pg_get_functiondef(p.oid) ilike '%profiles%';

-- 4c. Confirm the grant posture is unchanged after the DDL.
-- Expect SELECT only for anon and authenticated. Anything else is a regression.
select grantee, privilege_type
  from information_schema.role_table_grants
 where table_schema = 'public'
   and table_name = 'profiles'
   and grantee in ('anon', 'authenticated')
 order by grantee, privilege_type;

-- 4d. Sanity check the backfill.
select role, subscription_status, plan, plan_status, plan_source, access_until,
       count(*)
  from public.profiles
 group by 1, 2, 3, 4, 5, 6
 order by 1, 2;


-- ---------------------------------------------------------------------------
-- 5. Deliberately NOT done here
-- ---------------------------------------------------------------------------
--
-- subscription_status is NOT dropped and NOT changed. It is read in six places
-- including the live teacher gate. Phase 3 writes both it and the new columns in
-- lockstep, Phase 4 moves the readers onto the shared helper, and only then does
-- dropping it become a safe separate change. Two sources of truth is a real cost,
-- accepted for exactly the length of Phases 3 and 4.
--
-- No index on access_until. Useful only for a future expiry sweep, and there is
-- no sweep by design (see header). At 32 rows any scan is sequential anyway.
--
-- No teacher_id or class linkage column for teacher assigned student access.
-- That entitlement is DERIVED, not stored: a student in a teacher's class has
-- access because the teacher's row is entitled, and copying that onto the student
-- row would go stale the moment the teacher lapses. Phase 4 resolves it live
-- through class_enrollments -> classes -> the teacher's profiles row.
--
-- No column marking the founding rate. is_founder already records it, and
-- stripe_payment_link_id will carry the specific link for anyone who buys through
-- a webhook after Phase 3. A third marker would be a third thing to keep in sync.
--
-- is_founding_teacher is false on all 32 rows and is dead. Not dropped here
-- because dropping a column is not part of this change. Separate cleanup.


-- ---------------------------------------------------------------------------
-- 6. Decisions, settled
--
-- Recorded so they are not re-litigated in Phase 3 or Phase 4. Nothing in this
-- file is open.
-- ---------------------------------------------------------------------------
--
-- 1. Teacher tiers. No Teacher Pro has ever sold. Founding teachers at $10/$100
--    hold the teacher-core capability set. The blanket 'teacher-core' backfill is
--    correct for every existing active teacher, and no hand correction is
--    expected.
--
-- 2. Full Course is a strict SUPERSET of Practice Pass, including the worksheet
--    generator when it ships, plus the ENTIRE topic tree and GUMU. Practice Pass
--    holds no part of /course at all; see the capability map in section 2, which
--    records the two wrong versions this went through on 2026-08-19 before
--    landing on the long-standing product boundary. This is published on
--    unpackmath.com/pricing as "EVERYTHING IN PRACTICE PASS, PLUS" and is a live
--    commitment, so Phase 4 may not implement it as a disjoint set.
--
-- 3. Terms run from the PAYMENT DATE. access_until = paid_at + 6 months for
--    Practice Pass, paid_at + 12 months for Full Course. Not a fixed course
--    start, so two buyers on different days get different end dates.
--
-- 4. past_due grants access until access_until. incomplete, incomplete_expired,
--    unpaid and paused are handled explicitly and grant nothing. No Stripe status
--    falls through without a write.
