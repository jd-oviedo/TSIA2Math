-- Pending entitlements: a paid checkout that matched no account.
--
-- DESIGN, FOR REVIEW. Juan runs this manually in the Supabase SQL editor.
-- Safe to run more than once: every statement is idempotent. Section 5 is the
-- manual recovery for the purchase that is already lost and is commented out on
-- purpose, because it must not run until the two questions above it are answered.
--
--
-- WHY THIS EXISTS
--
-- app/api/stripe/webhook/route.ts:159 is a branch that takes the money and
-- writes nothing. All three resolution steps can miss (no client_reference_id,
-- no stored stripe_customer_id, no auth user with that checkout email), and when
-- they do the handler alerts, returns 200, and Stripe never retries. Confirmed
-- on live traffic with a real 49 dollar Practice Pass on 2026-08-19: paid,
-- resolved to no profile, nothing written. Verified again while designing this
-- file: no row in profiles holds plan = 'practice-pass' or 'full-course'. The
-- purchase is not recorded anywhere in this database.
--
-- Part 1 made that visible (console, Sentry, email). Visibility is not recovery.
-- This table is the recovery: the entitlement the webhook already computed is
-- kept until an account exists to receive it.
--
--
-- TWO FAILURE MODES, AND ONLY ONE OF THEM EMAIL CAN FIX
--
--   a. The checkout email is not a Google address. Sign-in is Google only (two
--      signInWithOAuth calls, both provider: 'google', no password, no OTP, no
--      magic link). No sign-in can ever produce a user with that email, so an
--      email keyed row waits forever. This is what the 49 dollar purchase hit.
--
--   b. The checkout email is a Google address the buyer has never signed in
--      with, or simply a different address they typed at checkout. Stripe's form
--      pre-fills nothing on a direct buy.stripe.com link, so this is the default
--      behaviour, not an edge case.
--
-- Hence TWO claim surfaces, and hence the column set below carries both keys:
--
--   auth/callback   claims by EMAIL on sign-in.        Fixes b.
--   /claim          claims by CHECKOUT_SESSION_ID.     Fixes a, because it never
--                                                      consults the email at all.
--
-- The session id reaches the buyer through the Stripe success URL
-- (?checkout_session_id={CHECKOUT_SESSION_ID}), the marketing site's /success,
-- and a link into this app. Nothing about that path involves an email address.
--
--
-- A ROW IS A SERIALIZED EntitlementWrite, NOT A RECEIPT
--
-- By the time the webhook discovers there is no profile it has, or can have,
-- everything writeEntitlement needs: plan, plan_term, plan_status, access_until,
-- plan_source, stripe_payment_link_id. Those columns are that object, field for
-- field, so the claim REPLAYS it through the same writeEntitlement rather than
-- re-deriving anything. One write path is the whole point of
-- app/lib/stripe-activation.ts, and it is what keeps the role promotion from
-- ruling 1 (the `role: 'teacher'` spread inside the guarded UPDATE) on the claim
-- path for free.
--
-- Storing the computed entitlement rather than just the session id is also what
-- makes the claim independent of Stripe being reachable. The row exists only
-- because a signature-verified webhook produced it, so the row IS the proof of
-- payment and the claim needs no second Stripe call to trust it.
--
--
-- access_until COMES FROM event_created_at, NOT FROM CLAIM TIME
--
-- Decision 3 in sql/entitlement_columns.sql: terms run from the PAYMENT date. A
-- buyer who claims a week late gets 6 months from the day they paid, not 6
-- months and a week. event_created_at is the Stripe event timestamp, which is
-- also what orders the replayed write, so a claim is idempotent in exactly the
-- way a webhook redelivery already is.
--
--
-- CLAIM ORDER IS WRITE THEN MARK
--
-- writeEntitlement first, then set claimed_at. If the process dies between them
-- the row stays unclaimed and the next sign-in replays it, which is harmless:
-- writeEntitlement's ordering predicate (plan_updated_at is null or
-- plan_updated_at < event time) makes the second write a no-op. The opposite
-- order would mark a purchase delivered that was never written, which is the
-- original bug with a database row in front of it.
--
-- WHICH OUTCOMES MARK, AND WHICH LEAVE THE DEBT STANDING
--
-- claimed_at is the record that a debt was paid, so only an outcome that
-- actually delivered access may set it. app/lib/pending-entitlements.ts is where
-- that rule lives; it is written here because it is a property of this column.
--
--   written      MARK.   The entitlement is on the profile.
--   stale        MARK, LOUDLY. The profile already carries an entitlement newer
--                than this event, so the purchase is reflected or superseded.
--                Not marking would replay it on every future sign-in forever.
--                The alert is because a stale claim can also mean two products
--                fighting over one profile, and the settled rule is that the
--                newer event wins and a human hears about it.
--   no profile   DO NOT MARK. The profile row does not exist, so the UPDATE
--                matched nothing. writeEntitlement CANNOT TELL THIS APART FROM
--                stale -- both are "zero rows updated" -- which is exactly why
--                the claim checks for the profile itself and reports it as its
--                own outcome. Marking here would record a delivery to an account
--                that does not exist and destroy the only evidence of the debt.
--   refused      DO NOT MARK. writeEntitlement's constraint pre-check declined,
--                so nothing was written. Section 1's access_until check should
--                make this unreachable for a stored row; if it ever fires, the
--                row is malformed and must stay claimable while it is fixed.
--
--
-- RLS AND GRANTS, AND WHY THE REVOKE IN SECTION 3 IS LOAD BEARING
--
-- This table holds checkout_session_id, which is the CLAIM KEY. Anyone who can
-- read it can claim someone else's purchase onto their own account. That makes
-- the read posture a security control here, not hygiene.
--
-- sql/revoke_stray_anon_writes.sql fixed default privileges for INSERT, UPDATE,
-- DELETE only. SELECT was deliberately left alone there and is handled per table.
-- So a new table in this schema still ARRIVES with SELECT granted to anon and
-- authenticated, with RLS-and-no-policy as the only thing standing between the
-- API roles and the rows. That is the exact posture flagged as too thin for six
-- existing tables. This one revokes explicitly.
--
-- Zero grants for anon and authenticated, no policies, service_role only. Every
-- reader and writer is a server route on the admin client.
--
--
-- RETENTION: NO SWEEP, BY DESIGN
--
-- Unclaimed rows are kept indefinitely. An unclaimed row is the ONLY record that
-- a person paid and is owed access; deleting it after 30 or 90 days would
-- destroy the evidence of a debt while the debt still exists, and the mode (a)
-- buyer is precisely the one who may take a long time to come back. There is no
-- growth problem to solve: this table only ever gains a row when a payment
-- fails to match, which is rare and which the Part 1 alert already reports one
-- for one.
--
-- Claimed rows are kept too, as the audit trail of what was granted and when.
-- Same reasoning as "no expiry sweep by design" in sql/entitlement_columns.sql:
-- a sweep that never runs must not be able to grant or destroy anything.


-- ---------------------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------------------

create table if not exists public.pending_entitlements (
  id uuid primary key default gen_random_uuid(),

  -- The checkout email, lowercased at write time. NOT the join key, and NOT
  -- trusted as identity: it is the key for the auth/callback surface (mode b),
  -- the label on the alert, and what a human matches on when doing this by hand.
  -- Nullable because a Stripe session is not guaranteed to carry one.
  email text,

  -- The serialized EntitlementWrite. Same vocabulary and same constraints as
  -- profiles, because these values are replayed into profiles verbatim.
  plan         text not null,
  plan_term    text not null,
  plan_status  text not null,
  access_until timestamptz,
  plan_source  text not null default 'stripe',

  stripe_payment_link_id text,

  -- Carried so the claim can call linkCustomerId. WITHOUT THIS THE FIX IS HALF A
  -- FIX: a teacher would get their initial entitlement and then every renewal
  -- webhook would drop, because resolveProfileId's customer step still would not
  -- find them and the checkout email still would not match.
  stripe_customer_id text,

  -- The Stripe EVENT timestamp. Orders the replayed write and measures any
  -- one-time term. See the header.
  event_created_at timestamptz not null,

  -- The claim key for the /claim surface, and the idempotency key for this
  -- table. UNIQUE, so a Stripe redelivery of the same checkout.session.completed
  -- inserts nothing rather than queueing a second copy of the same purchase.
  checkout_session_id text not null unique,

  -- Single use. Set only after the entitlement has actually been written.
  -- The ONLY claim state this table keeps: null is owed, non-null is delivered.
  -- There is deliberately no claimed_by. See section 7.
  claimed_at timestamptz,

  created_at timestamptz not null default now()
);

-- Same values as profiles, for the same reason: a wrong map entry should fail
-- loudly at the boundary rather than be discovered when it is replayed into
-- profiles and violates the constraint there instead.
alter table public.pending_entitlements
  drop constraint if exists pending_entitlements_plan_check,
  add  constraint pending_entitlements_plan_check check (
    plan in ('practice-pass', 'full-course', 'teacher-core', 'teacher-pro')
  );

alter table public.pending_entitlements
  drop constraint if exists pending_entitlements_plan_term_check,
  add  constraint pending_entitlements_plan_term_check check (
    plan_term in ('monthly', 'annual', 'one-time')
  );

-- EXHAUSTIVE over Stripe's subscription statuses, matching
-- profiles_plan_status_check exactly. A status this table cannot represent is a
-- purchase this table cannot rescue.
alter table public.pending_entitlements
  drop constraint if exists pending_entitlements_plan_status_check,
  add  constraint pending_entitlements_plan_status_check check (
    plan_status in (
      'active', 'trialing', 'past_due', 'incomplete', 'incomplete_expired',
      'unpaid', 'canceled', 'paused', 'expired'
    )
  );

alter table public.pending_entitlements
  drop constraint if exists pending_entitlements_plan_source_check,
  add  constraint pending_entitlements_plan_source_check check (
    plan_source in ('stripe', 'comp', 'migration')
  );

-- The same rule as profiles_access_until_check, enforced here so a row that
-- COULD NOT be replayed can never be stored. Without it, a bad row would be
-- accepted at webhook time and rejected at claim time, which puts the failure in
-- front of the buyer instead of in front of us.
alter table public.pending_entitlements
  drop constraint if exists pending_entitlements_access_until_check,
  add  constraint pending_entitlements_access_until_check check (
    case
      when plan_source = 'stripe'
       and plan_status in ('active', 'trialing', 'past_due')
      then access_until is not null
      else true
    end
  );

-- Lowercased at write time, enforced here so the email lookup in auth/callback
-- can be a plain equality against lower(auth email) with no per-call-site
-- normalisation to get wrong.
alter table public.pending_entitlements
  drop constraint if exists pending_entitlements_email_lower_check,
  add  constraint pending_entitlements_email_lower_check check (
    email is null or email = lower(email)
  );

-- Re-running this file must not resurrect the column dropped in section 7. An
-- earlier draft of this table carried claimed_by; if that draft was ever
-- applied, this removes it and the constraint that paired it with claimed_at.
alter table public.pending_entitlements
  drop constraint if exists pending_entitlements_claim_pairing_check;

alter table public.pending_entitlements
  drop column if exists claimed_by;


-- ---------------------------------------------------------------------------
-- 2. Indexes
--
-- checkout_session_id is already indexed by its UNIQUE constraint, which is the
-- /claim lookup.
--
-- The email index is PARTIAL on unclaimed rows, because that is the only query
-- auth/callback ever runs: "is anything still owed to this address". Claimed
-- rows are audit trail and nothing looks them up by email.
-- ---------------------------------------------------------------------------

create index if not exists pending_entitlements_unclaimed_email_idx
  on public.pending_entitlements (email)
  where claimed_at is null;


-- ---------------------------------------------------------------------------
-- 3. RLS and grants
--
-- Read the header. checkout_session_id is the claim key, so a stray SELECT grant
-- here is not an information leak, it is a way to take someone's purchase.
-- ---------------------------------------------------------------------------

alter table public.pending_entitlements enable row level security;

-- No policies, deliberately. RLS with no policy denies everything to anon and
-- authenticated; service_role bypasses RLS entirely and is what every server
-- route uses.

-- Explicit, because SELECT is still granted by Supabase's default privileges on
-- new tables. Belt and braces on purpose: this is the one table where the grant
-- and the policy protect the same thing.
revoke all on public.pending_entitlements from anon, authenticated;


-- ---------------------------------------------------------------------------
-- 4. Column comments
-- ---------------------------------------------------------------------------

comment on table public.pending_entitlements is
  'A paid Stripe checkout that resolved to no profile. One row is a serialized '
  'EntitlementWrite plus the two keys it can be claimed by (checkout session id, '
  'checkout email). Claiming replays it through writeEntitlement so there stays '
  'one entitlement write path. Service role only: checkout_session_id is the '
  'claim key.';

comment on column public.pending_entitlements.email is
  'The checkout email, lowercased. The key for the sign-in claim surface, and '
  'never trusted as identity by the session-id surface. Null when the Stripe '
  'session carried none.';

comment on column public.pending_entitlements.access_until is
  'Computed from event_created_at, never from claim time. Terms run from the '
  'payment date (sql/entitlement_columns.sql, decision 3).';

comment on column public.pending_entitlements.stripe_customer_id is
  'Carried so the claim can ATTEMPT to link it onto the profile. Without it a '
  'claimed subscription would receive its first entitlement and then drop every '
  'renewal webhook, because the customer would still resolve to no profile. The '
  'link is CONDITIONAL, not guaranteed: linkCustomerId is first-writer-wins, so '
  'a profile that already carries a different customer id keeps it and this one '
  'is not stored. That guard is correct -- clobbering would break renewals for '
  'the subscription the existing id belongs to -- but it means the renewal drop '
  'can happen anyway on the losing side. Not fixable in this schema: profiles '
  'has one stripe_customer_id column. The claim alerts instead.';

comment on column public.pending_entitlements.event_created_at is
  'The Stripe event timestamp. Orders the replayed write and measures the term.';

comment on column public.pending_entitlements.checkout_session_id is
  'The cs_ id. Unique, so a webhook redelivery does not queue a second copy, and '
  'single-use in combination with claimed_at.';

comment on column public.pending_entitlements.claimed_at is
  'Set only AFTER the entitlement has been written. Write then mark: a crash '
  'between the two leaves the row claimable and the replay is a no-op.';


-- ---------------------------------------------------------------------------
-- 5. MANUAL RECOVERY for the 2026-08-19 Practice Pass
--
-- COMMENTED OUT. Do not run it until both questions below are answered, and do
-- not run it before the claim code is deployed, because an unclaimable row is
-- just a note to self.
--
-- WHAT HAPPENED, exactly. A direct buy.stripe.com Practice Pass link, paid as
-- contact@jdoviedo.com. No client_reference_id (only /upgrade sets one, and a
-- direct link never touches it). A brand new Stripe customer, so no profile
-- carried that stripe_customer_id. findUserIdByEmail paged auth.users and found
-- nothing, because that address has no account and, being a non-Google address,
-- can never get one through this app. resolveProfileId returned null, the branch
-- at route.ts:159 alerted and broke, and the handler returned 200. Nothing was
-- written. Stripe considers the event delivered.
--
-- QUESTION 1: WAS IT REFUNDED? The handoff says it was to be refunded and
-- rebought with a Google address. If it was refunded, DO NOT INSERT THIS ROW.
-- checkout.session.completed carries payment_status = 'paid' forever and knows
-- nothing about a later refund, so neither a webhook replay nor this INSERT can
-- tell the difference. A human has to.
--
-- QUESTION 2: WHO SHOULD RECEIVE IT? If the buyer already has access from the
-- rebuy, this row is not owed and should not exist. If they do not, insert it
-- and send them the claim link, which is the only self-service path that works
-- for a non-Google checkout email:
--
--   https://app.unpackmath.com/claim?checkout_session_id=cs_live_...
--
-- FILL IN the three values from the Stripe dashboard (Payments, find the 49
-- dollar charge, open the checkout session): the cs_ id, the event or payment
-- timestamp, and the cus_ id. The plink below is the live Practice Pass link
-- from app/lib/products.ts and needs no lookup.
--
-- access_until is written as the timestamp plus 6 months so the term runs from
-- the payment date, matching addMonths() in app/lib/products.ts for every day of
-- the month that exists in the target month. If the payment fell on the 29th,
-- 30th or 31st, check the result against the month it lands in before trusting
-- it: Postgres clamps the same way addMonths does, but this is the one case
-- worth reading twice.
-- ---------------------------------------------------------------------------

-- insert into public.pending_entitlements (
--   email,
--   plan, plan_term, plan_status, access_until, plan_source,
--   stripe_payment_link_id, stripe_customer_id,
--   event_created_at, checkout_session_id
-- )
-- values (
--   'contact@jdoviedo.com',
--   'practice-pass', 'one-time', 'active',
--   timestamptz 'PASTE_PAYMENT_TIMESTAMP_UTC' + interval '6 months',
--   'stripe',
--   'plink_1U5tejF8f8aZDGVAKbnefl6Z',
--   'PASTE_cus_ID',
--   timestamptz 'PASTE_PAYMENT_TIMESTAMP_UTC',
--   'PASTE_cs_ID'
-- )
-- on conflict (checkout_session_id) do nothing;


-- ---------------------------------------------------------------------------
-- 6. Verification
-- ---------------------------------------------------------------------------

-- 6a. Grants. Expect ZERO rows. Anything here means the revoke in section 3 did
-- not take, and the claim key is readable with the anon key.
select grantee, privilege_type
  from information_schema.role_table_grants
 where table_schema = 'public'
   and table_name = 'pending_entitlements'
   and grantee in ('anon', 'authenticated');

-- 6b. RLS on, and no policies.
select c.relname, c.relrowsecurity, count(p.polname) as policies
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  left join pg_policy p on p.polrelid = c.oid
 where n.nspname = 'public'
   and c.relname = 'pending_entitlements'
 group by c.relname, c.relrowsecurity;

-- 6c. What is owed right now. This is the operational query: every row here is a
-- person who has paid and does not have what they paid for.
select id, email, plan, plan_term, plan_status, access_until,
       stripe_payment_link_id, event_created_at, created_at
  from public.pending_entitlements
 where claimed_at is null
 order by event_created_at desc;

-- 6d. Claim history.
select id, email, plan, plan_term, claimed_at, event_created_at
  from public.pending_entitlements
 where claimed_at is not null
 order by claimed_at desc;


-- ---------------------------------------------------------------------------
-- 7. Deliberately NOT done here
-- ---------------------------------------------------------------------------
--
-- No sweep, no TTL, no expiry column. See the header. An unclaimed row is a
-- debt, and nothing in this schema should be able to quietly discharge one.
--
-- No foreign key from email to anything. The whole premise is that no user with
-- that email exists yet, and in mode (a) none ever will.
--
-- NO claimed_by. An earlier draft carried `claimed_by uuid references
-- auth.users(id)` as an audit column. It is gone, for three reasons that all
-- point the same way.
--
--   It is a FOREIGN KEY WITH NO ON DELETE CLAUSE, which is NO ACTION. Deleting
--   an auth user would then fail on a row in a payments-recovery table. An audit
--   column that can block account deletion is not free, and neither of the
--   alternatives is better: cascade destroys the audit trail it exists to keep,
--   and set null makes it a nullable column nothing can rely on.
--
--   NOTHING READS IT. Every decision this table drives is made on claimed_at
--   alone: null is owed, non-null is delivered. A column no code path consults
--   is a column that can be wrong for a year without anyone noticing.
--
--   THE ANSWER IS ALREADY RECORDED, twice over and in the places that are
--   actually authoritative. profiles.plan_updated_at plus
--   stripe_payment_link_id say which account received which purchase and when,
--   under the constraint set that keeps them honest, and the claim logs the
--   profile id at the moment it claims. Storing a third copy here invites the
--   three to disagree.
--
-- The cost is real and accepted: this table alone cannot answer "who claimed
-- this session id". It can answer "was it claimed", which is the only question
-- any code asks it.
--
-- No row for the subscription branch of the webhook (route.ts, the
-- customer.subscription.updated / .deleted case). That event carries no checkout
-- session at all, so it has no value for the NOT NULL unique key above and no
-- second claim surface that could reach it. Making checkout_session_id nullable
-- to accommodate it would trade this table's idempotency for rows that a renewal
-- storm could multiply and that nobody could claim. The closed loop is:
-- the checkout row is claimed, linkCustomerId stores stripe_customer_id, and
-- every subsequent subscription event resolves by customer id. Renewals dropped
-- in the window between purchase and claim remain a documented gap, covered by
-- the existing Sentry alert on that branch.
--
-- THE LOOP DOES NOT CLOSE when the claiming profile ALREADY carries a different
-- stripe_customer_id. linkCustomerId declines, the new customer is never stored,
-- and its renewals keep resolving to nobody. Confirmed live on 2026-08-20: a
-- claim onto a profile holding an id from an earlier Teacher Core purchase left
-- the pending row's id unstored. Harmless there, because the claimed product was
-- a one-time pass with no renewals, but not harmless in general. One profile
-- cannot hold two Stripe customers, so the claim raises an alert instead of
-- pretending otherwise -- see alertUnlinkedCustomer in
-- app/lib/pending-entitlements.ts.
--
-- No pending row when the Payment Link is UNRECOGNISED and no profile matched.
-- The webhook cannot name a plan in that case, and plan is NOT NULL here for the
-- same reason profiles_plan_pairing_check exists. That double failure keeps the
-- current behaviour, which is to alert and require a human. Section 5 is the
-- template for that human.
--
-- No unique constraint on email. Two separate purchases by the same person are
-- two debts, and both should be claimable.
