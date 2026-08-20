-- Founder Pro grant: two founding teachers move to teacher-pro.
--
-- APPLIED 2026-08-20. Verified after the run: exactly two rows moved. anwhite
-- teacher-pro/annual, jsekely teacher-pro/monthly, both plan_source
-- 'founder-grant', both is_founder true, both access_until null. bsutton
-- unchanged at teacher-core with a real access_until. No other row touched.
-- Re-runnable: section 1 is drop-then-add, section 2 writes fixed values keyed
-- on email.
--
-- Juan runs this manually in the Supabase SQL editor, section by section. The
-- editor returns only the last result on a multi-statement run.
--
-- Both terms were confirmed in the live Stripe dashboard on 2026-08-20:
-- anwhite is annual (cus_V0QKgnWc7W4JJv), jsekely is monthly
-- (cus_V2J5GS5olgkDbj). The placeholder that made section 2 fail on an
-- unedited run has been replaced with the confirmed value.
--
--
-- THE ONE PATH THAT REVERSES THIS GRANT
--
-- Renewals cannot demote these rows. A fresh checkout can. If either account
-- ever goes through a new purchase on any Payment Link,
-- entitlementFromCheckout maps that plink_ to its product and overwrites plan
-- with whatever the link sells, silently. Neither of these two may ever be sent
-- a purchase link, including a founding link, including as a convenience.
-- Their subscriptions renew on their own and need no further checkout.
--
--
-- THE RULING, AND WHY THE DATA DISAGREES WITH IT
--
-- anwhite@gpapps.galenaparkisd.com and jsekely@gpapps.galenaparkisd.com were
-- promised Pro capabilities and a Founding Teacher badge. The promise governs.
-- The repo never knew about it, and it also never knew that anwhite switched
-- from monthly to annual in the Stripe dashboard after signup.
--
-- Both rows currently read plan = 'teacher-core', and that value was not
-- observed from anything. It was written by the backfill in
-- sql/entitlement_columns.sql section 3, which sets 'teacher-core' for every
-- active teacher with a null plan and reads nothing about what anyone bought.
-- Six production rows carry that statement's exact microsecond
-- (2026-08-18T23:32:29.629286Z), these two among them.
--
-- So this is not a correction of a Stripe-sourced fact. It is the first time
-- these two rows have ever recorded a deliberate decision about what these
-- teachers hold.
--
-- WHAT THEY ACTUALLY GAIN TODAY: nothing functional. teacher-core and
-- teacher-pro are capability-identical in app/lib/capabilities.ts, and
-- app/api/teacher/worksheets/route.ts states that it meters nothing because no
-- quota has been chosen. What changes is the tier NAME on the sidebar band
-- (CORE becomes PRO) and the record of what they are owed when the tiers do
-- diverge. That is the point of writing it now rather than when a quota lands:
-- the promise is recorded before there is anything to enforce.
--
-- BSUTTON IS NOT IN THIS FILE. bsutton@gpapps.galenaparkisd.com is the first
-- customer on the public pricing, bought Teacher Core $20/mo on
-- plink_1U5tuZF8f8aZDGVARYelic7d, and is correctly teacher-core. She is named
-- here only so a future reader does not wonder whether she was missed.
--
--
-- PLAN_SOURCE: A DISTINCT VALUE IS REQUIRED, NOT MERELY PREFERABLE
--
-- 'stripe' is not available for these two rows. profiles_access_until_check is
--
--   case when plan_source = 'stripe'
--         and plan_status in ('active','trialing','past_due')
--        then access_until is not null else true end
--
-- and both rows carry access_until = null, which section 3 below argues should
-- stay null. So writing plan_source = 'stripe' with a null expiry is refused by
-- the database. The choice is therefore between keeping 'migration', which now
-- states something false (its column comment reads "predate these columns and
-- carry no reliable plan"), and introducing a value that says what this is.
--
-- 'founder-grant' says what this is. Section 1 adds it to the constraint.
--
-- BE AWARE OF ITS HALF-LIFE. writeEntitlement always writes
-- plan_source = 'stripe', so the FIRST RENEWAL WEBHOOK for each of these
-- customers overwrites this marker, together with plan_term and a real
-- access_until, in one statement. For jsekely that is weeks away; for anwhite,
-- on an annual term, up to a year. That is not a defect and it needs no guard:
-- when it happens the row becomes plan = 'teacher-pro', plan_source = 'stripe',
-- access_until = a real period end, is_founder = true, which is a truthful and
-- self-consistent description of a founding teacher on Pro. The marker's job is
-- to make the row legible in the meantime.
--
-- THE DURABLE RECORD OF THE PROMISE IS NOT A COLUMN. It is is_founder = true,
-- this file, and decision 1 in sql/entitlement_columns.sql, which has been
-- rewritten in the same change because it asserted the opposite.
--
--
-- WHAT MAKES THE GRANT ITSELF PERMANENT
--
-- The plan value survives every future webhook. entitlementFromSubscription
-- prefers knownPlanFor, which reads the plan already on the profile, so once
-- 'teacher-pro' is written every renewal carries it forward and refreshes only
-- the status and the expiry. Nothing in the codebase can demote it. The mirror
-- of that is the reason this file exists at all: nothing can CORRECT it either,
-- so a wrong value here is permanent too. Read section 4 before running it.


-- ---------------------------------------------------------------------------
-- 1. Allow the new plan_source value
--
-- Mirrors the existing constraint exactly, plus one value. Written as
-- drop-then-add like every other constraint in sql/entitlement_columns.sql, so
-- it is re-runnable.
-- ---------------------------------------------------------------------------

alter table public.profiles
  drop constraint if exists profiles_plan_source_check,
  add  constraint profiles_plan_source_check check (
    plan_source is null or plan_source in (
      'stripe',
      'comp',
      'migration',
      -- A tier granted by a promise rather than by a price. Written by hand,
      -- never by the webhook, and replaced by 'stripe' at the next renewal.
      'founder-grant'
    )
  );

comment on column public.profiles.plan_source is
  'How the entitlement was granted. Migration rows predate these columns and '
  'carry no reliable plan or expiry until a webhook corrects them. '
  'founder-grant marks a tier granted by promise rather than by the price paid; '
  'see sql/founder_pro_grant.sql. Only stripe is ever written by code.';


-- ---------------------------------------------------------------------------
-- 2. The two rows
--
-- -- Both terms read off the live Stripe dashboard, 2026-08-20.
--
-- anwhite: annual (cus_V0QKgnWc7W4JJv). She switched from monthly to annual in
-- the dashboard after signup, which is a fact no webhook ever delivered and
-- which nothing in this database records.
--
-- jsekely: monthly (cus_V2J5GS5olgkDbj).
--
-- Neither value was inferred from the signup date or the price. Do not
-- recompute either: anwhite's cadence changed after signup, which is the fact
-- that started all of this.
--
-- PLAN_TERM IS LOAD BEARING HERE, WHICH IS NOT TRUE ANYWHERE ELSE. Its column
-- comment says "informational only, never gated on", and for access decisions
-- that is still right. It is not right for THIS grant.
--
-- knownPlanFor in app/api/stripe/webhook/route.ts:111 reads
--
--   if (!data?.plan || !data?.plan_term) return null;
--
-- so a profile carrying plan = 'teacher-pro' with a NULL plan_term reports no
-- known plan at all. entitlementFromSubscription then falls back to identifying
-- the product by its recurring amount, and PLAN_BY_SUBSCRIPTION_AMOUNT maps the
-- founding prices this way:
--
--   1000  -> teacher-core monthly     (founding $10)
--   10000 -> teacher-core annual      (founding $100)
--
-- Both rows carry plan_term = null TODAY. So writing plan = 'teacher-pro' and
-- leaving plan_term null would hand the tier straight back: the next renewal
-- would resolve them by price, write teacher-core, and the grant would be gone
-- with nothing in the data to explain it.
--
-- WRITE PLAN AND PLAN_TERM TOGETHER OR NOT AT ALL. If the placeholder below
-- blocks you, get the value from Stripe. Do not drop the column from the
-- statement to make it run.
--
-- plan_updated_at = now() on purpose. It is the ordering predicate every future
-- webhook write is compared against, so setting it to now makes this grant
-- newer than any Stripe event already in flight or eligible for redelivery. A
-- stale event cannot undo it; a genuine future renewal, being later, still can
-- and should refresh the status and the expiry.
--
-- is_founder is NOT written here. Both rows already carry true, and section 4
-- verifies it rather than setting it, so this file cannot quietly promote
-- anyone.
-- ---------------------------------------------------------------------------

update public.profiles
   set plan            = 'teacher-pro',
       plan_term       = 'annual',
       plan_status     = 'active',
       plan_source     = 'founder-grant',
       plan_updated_at = now()
 where email = 'anwhite@gpapps.galenaparkisd.com';

update public.profiles
   set plan            = 'teacher-pro',
       plan_term       = 'monthly',
       plan_status     = 'active',
       plan_source     = 'founder-grant',
       plan_updated_at = now()
 where email = 'jsekely@gpapps.galenaparkisd.com';


-- ---------------------------------------------------------------------------
-- 3. access_until stays null, and that is a decision rather than an omission
--
-- null means no expiry. For a live subscription that is the wrong shape: the
-- whole reason access_until exists is that a granting row with no end date is
-- the missed-webhook bug, and these two rows are exactly that shape today.
--
-- It stays null anyway, for the length of one billing period, for three
-- reasons:
--
--   1. THE TRUE VALUE CANNOT BE READ FROM HERE. current_period_end lives in
--      live Stripe. Typing a date by hand into the column that terminates
--      access, for two people who have been promised permanent access, is the
--      one error in this file that would lock out a paying founder. A wrong
--      access_until is worse than none.
--
--   2. IT SELF-CORRECTS. Both customers are linked (anwhite
--      cus_V0QKgnWc7W4JJv, jsekely cus_V2J5GS5olgkDbj), so resolveProfileId
--      matches them on customer id and the next customer.subscription.updated
--      writes a real period end, in the same statement that flips plan_source to
--      'stripe'. No window exists in which the row is granting, stripe-sourced,
--      and unbounded.
--
--   3. IT FAILS OPEN, WHICH IS RIGHT HERE AND ONLY HERE. This is the same
--      reasoning sql/entitlement_columns.sql section 3 gives for the backfill:
--      fail closed is correct for a new purchase and wrong for a correction,
--      where the mistake locks out a customer who did nothing.
--
-- If you would rather it were bounded now, read the next invoice date off each
-- subscription in the dashboard and set access_until to it. Do not compute one
-- from the signup date: anwhite's cadence changed after signup, which is the
-- fact that started all of this.


-- ---------------------------------------------------------------------------
-- 4. Verification. Run BEFORE and AFTER.
-- ---------------------------------------------------------------------------

-- 4a. Before: what is there now, and confirm the two addresses are the ones you
-- mean. anwhite is anwhite@GPAPPS.galenaparkisd.com; the shorter form does not
-- exist in this database.
select email, plan, plan_term, plan_status, plan_source, is_founder,
       access_until, stripe_customer_id, plan_updated_at, created_at
  from public.profiles
 where email in (
   'anwhite@gpapps.galenaparkisd.com',
   'jsekely@gpapps.galenaparkisd.com',
   'bsutton@gpapps.galenaparkisd.com'   -- control: must stay teacher-core
 )
 order by created_at;

-- 4b. After: exactly two rows, both teacher-pro, both founder-grant, both
-- is_founder. If is_founder is false on either, STOP: the badge is part of the
-- promise and something else has changed.
select email, plan, plan_term, plan_status, plan_source, is_founder, access_until
  from public.profiles
 where plan = 'teacher-pro';

-- 4c. Nobody else moved. Expect bsutton and the remaining migration rows,
-- unchanged and still teacher-core.
select plan, plan_term, plan_source, count(*), min(plan_updated_at), max(plan_updated_at)
  from public.profiles
 where role = 'teacher'
 group by 1, 2, 3
 order by 1, 2, 3;


-- ---------------------------------------------------------------------------
-- 5. Deliberately NOT done here
-- ---------------------------------------------------------------------------
--
-- No change to app/lib/capabilities.ts. teacher-core and teacher-pro grant the
-- same set today, and inventing a difference to justify this ruling would put a
-- made-up quota in the map, which capabilities.ts explicitly declines to do.
-- These two hold the Pro NAME and the promise; when the tiers diverge they are
-- already on the right side of it.
--
-- No touch to the four other is_founder rows. jdoviedo72@gmail.com and
-- jdompm@gmail.com carry is_founder = true and are unaffected by this file,
-- but see the separate finding: both are linked to TEST-MODE Stripe customers
-- while sitting in production as active teachers.
--
-- sql/founder_flag.sql is NOT updated to match. It lists three emails and
-- production has six, so it has already drifted; correcting it is a separate
-- record-keeping change and does not belong in a grant file.
