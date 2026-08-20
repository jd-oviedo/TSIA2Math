import type Stripe from "stripe";
import { createAdminClient } from "./supabase-admin";
import { grantsAccess, legacySubscriptionStatus, type PlanStatus } from "./entitlement";
import {
  addMonths,
  productForPaymentLink,
  subscriptionPeriodEnd,
  type EntitlementWrite,
  type Plan,
  type PlanTerm,
} from "./products";

// Turning a Stripe payment into account access.
//
// Shared by the webhook (app/api/stripe/webhook/route.ts), which fires
// server-to-server and is the ONLY path that activates anyone today, and by
// /teacher/welcome, which is dead on every live path because all eight Payment
// Links redirect to the marketing site's /success instead. The welcome page is
// kept working rather than deleted so that a manual visit still does the right
// thing, and so the two cannot drift.
//
// EVERY ENTITLEMENT WRITE GOES THROUGH writeEntitlement. That is the point of
// this module: the columns have constraints that make a partial write throw, and
// a throw here becomes a 500, and a 500 makes Stripe retry the same event
// forever. One writer means one place that gets the invariants right.

type Admin = ReturnType<typeof createAdminClient>;

// profiles has no email column -- email lives in auth.users. Page through
// the auth admin API to resolve an email to its profile/user id. Founding-
// teacher scale, so a bounded scan is fine.
//
// NOTE: profiles.email now exists, so this could be a single indexed lookup
// instead of up to 50 admin API calls. Deliberately left alone to keep this
// change reviewable; it is flagged as separate cleanup, not a Phase 3 fix.
export async function findUserIdByEmail(admin: Admin, email: string): Promise<string | null> {
  const target = email.trim().toLowerCase();
  if (!target) return null;
  const perPage = 200;
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) return null;
    const match = data.users.find(
      (u: { id: string; email?: string | null }) => (u.email ?? "").toLowerCase() === target
    );
    if (match) return match.id;
    if (data.users.length < perPage) return null; // reached the last page
  }
  return null;
}

export type LinkOutcome =
  /** The id was stored. The profile had none before. */
  | "linked"
  /** A DIFFERENT id was already there and won. Nothing was written. */
  | "already-linked"
  /** There was no id to store. */
  | "none";

/**
 * Store the customer id only if it isn't already set.
 *
 * FIRST WRITER WINS, and the guard is in the WHERE clause rather than in an
 * `if`. A read-then-write would have a window in it where two concurrent events
 * both find the column free; a predicate on the UPDATE cannot. So the "skip" is
 * a statement that matches zero rows, not a branch that declines to run.
 *
 * Why first-writer-wins at all: clobbering would repoint the account at a
 * different Stripe customer, and every subsequent event for the ORIGINAL
 * customer would then resolve to nobody. For a live subscription that means
 * renewals stop landing and the teacher lapses at the end of the period they
 * already paid for, with nothing in the data to explain it.
 *
 * THE RETURN VALUE EXISTS BECAUSE THE DECLINE IS OTHERWISE INVISIBLE, and it is
 * not always harmless. When the incoming id belongs to a NEW SUBSCRIPTION, the
 * losing side is the one that will drop: the profile keeps the old customer, and
 * renewals for the new one resolve to nobody. profiles has a single
 * stripe_customer_id and one profile genuinely cannot hold two Stripe customers,
 * so this is not fixable here -- callers that can tell a subscription from a
 * one-time purchase are expected to say something rather than let it pass.
 */
export async function linkCustomerId(
  admin: Admin,
  profileId: string,
  customerId: string | null
): Promise<LinkOutcome> {
  if (!customerId) return "none";
  const { data, error } = await admin
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("id", profileId)
    .is("stripe_customer_id", null)
    .select("id");

  // Logged, never thrown. This has always swallowed its errors, and the webhook
  // depends on that: failing to link is not worth a 500 and an infinite Stripe
  // retry when the entitlement write that follows is the part that matters.
  if (error) {
    console.error(`[stripe-activation] linking ${customerId} to ${profileId} failed:`, error.message);
    return "already-linked";
  }

  // Zero rows means the predicate did not match. Almost always that is a
  // different id already sitting there; it is also what a nonexistent profile
  // returns, which is why callers that care resolve profile existence
  // separately rather than reading it out of this.
  return data && data.length > 0 ? "linked" : "already-linked";
}

/**
 * A purchase's Stripe customer was NOT linked, because the profile already
 * carried a different one.
 *
 * LIVES HERE, NEXT TO linkCustomerId, AND IS SHARED BY BOTH CALLERS ON PURPOSE.
 * The webhook and the pending-entitlement claim hit the identical collision, and
 * two copies of this would be two opinions about how serious it is. That drift
 * is the kind someone tidies up later by assuming one of them is a mistake.
 *
 * SEVERITY TRACKS WHETHER ANYTHING WILL ACTUALLY DROP, and the message must not
 * claim otherwise.
 *
 *   monthly / annual -> error.   There is a live subscription under the customer
 *                                that lost, its renewals resolve to nobody, and
 *                                the teacher will lapse at the end of the period
 *                                they already paid for. That is the slow,
 *                                invisible failure -- it looks like an expiry.
 *   one-time         -> warning. A one-time pass generates no subscription
 *                                events, so there are no renewals to lose. The
 *                                mismatch is still recorded, because it is how
 *                                two Stripe customers for one person get noticed,
 *                                but nobody needs to be paged for it.
 *
 * NEVER THROWS. Sentry is imported lazily and every failure is swallowed: an
 * alert must not be able to change the outcome of a purchase, turn a 200 into a
 * 500, or start a Stripe retry storm. It is also loaded outside Next by
 * scripts/faultproof_claim.mjs, where the SDK's server entry is not what
 * resolves and captureMessage is undefined.
 */
export async function alertUnlinkedCustomer(args: {
  profileId: string;
  /** The id that did NOT get stored. */
  customerId: string | null;
  plan: Plan;
  planTerm: PlanTerm;
  checkoutSessionId: string | null;
  email: string | null;
  source: string;
}): Promise<void> {
  const { profileId, customerId, plan, planTerm, checkoutSessionId, email, source } = args;
  const subscription = planTerm === "monthly" || planTerm === "annual";

  console.error(
    `[${source}] CUSTOMER NOT LINKED: profile ${profileId} already carries a different ` +
      `stripe_customer_id, so ${customerId} from session ` +
      `${checkoutSessionId ?? "(unknown)"} was not stored. ` +
      (subscription
        ? `This is a ${planTerm} ${plan} -- ITS RENEWALS WILL RESOLVE TO NOBODY and the ` +
          `teacher will lapse at the end of the period they paid for. Reconcile the two Stripe ` +
          `customers by hand.`
        : `This is a one-time ${plan}, so there are no renewals to lose. Recorded only.`)
  );

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureMessage?.("stripe: purchase's customer id could not be linked", {
      level: subscription ? "error" : "warning",
      tags: { source, plan, plan_term: planTerm },
      extra: {
        profileId,
        checkoutSessionId,
        unlinkedCustomerId: customerId,
        plan,
        planTerm,
        renewalsAtRisk: subscription,
        email,
      },
    });
  } catch (err) {
    console.error(`[${source}] could not raise a Sentry issue for the unlinked customer:`, err);
  }
}

export type WriteOutcome = "written" | "stale" | "refused";

/**
 * The only writer of the entitlement columns.
 *
 * Two protections, both of which exist because the alternative is an event that
 * Stripe retries forever at 2am:
 *
 * 1. THE ORDERING GUARD. Stripe does not guarantee delivery order, and a stale
 *    event overwriting newer state is how someone silently loses access with
 *    nothing in the data to explain it. The guard is a predicate on the UPDATE
 *    rather than a read-then-write, so two concurrent deliveries cannot both
 *    decide they are newest. `eventCreatedMs` is the Stripe event timestamp, not
 *    the wall clock: it is stable across redeliveries, so a retry is a no-op
 *    rather than a fresh write.
 *
 * 2. THE CONSTRAINT PRE-CHECK. profiles_access_until_check refuses a
 *    stripe-sourced row that grants access with no end date. That is the right
 *    constraint, but letting the database enforce it means a 500 and an infinite
 *    retry loop. Caught here instead, logged, and refused, so a malformed write
 *    fails loudly and exactly once.
 */
export async function writeEntitlement(
  admin: Admin,
  profileId: string,
  write: EntitlementWrite,
  eventCreatedMs: number,
  source: string
): Promise<WriteOutcome> {
  if (
    write.planSource === "stripe" &&
    grantsAccess(write.planStatus) &&
    write.accessUntil == null
  ) {
    console.error(
      `[${source}] refusing entitlement write: ${write.plan}/${write.planStatus} grants access ` +
        `but carries no access_until. This would violate profiles_access_until_check.`,
      { profileId }
    );
    return "refused";
  }

  const eventAt = new Date(eventCreatedMs).toISOString();
  const accessUntilIso = write.accessUntil ? write.accessUntil.toISOString() : null;

  const { data, error } = await admin
    .from("profiles")
    .update({
      plan: write.plan,
      plan_term: write.planTerm,
      plan_status: write.planStatus,
      access_until: accessUntilIso,
      plan_source: write.planSource,
      // Only overwrite the recorded link when this event actually names one.
      // A subscription event carries no payment link, and blanking the field on
      // every renewal would destroy the only per-row record of whether a teacher
      // bought at the founding rate.
      ...(write.paymentLinkId ? { stripe_payment_link_id: write.paymentLinkId } : {}),
      plan_updated_at: eventAt,
      // Written in lockstep, derived rather than set by hand, so the legacy flag
      // and the new columns cannot disagree while both exist.
      subscription_status: legacySubscriptionStatus(write.planStatus, write.accessUntil),
      // ROLE, ON A TEACHER PURCHASE ONLY, AND IN THIS STATEMENT ON PURPOSE.
      //
      // Until now the only live writer of role='teacher' was auth/callback, which
      // fires on a URL parameter at sign-in and therefore only for a buyer who
      // arrives SIGNED OUT through /upgrade. That missed two cases and both are
      // live: a signed-in buyer never passes through /login at all, and the
      // direct buy.stripe.com links being sent to warm contacts touch neither
      // /upgrade nor /login. In both, the buyer paid, writeEntitlement recorded
      // plan = teacher-core, role stayed 'student', and requireTeacher denied
      // them on role before it ever looked at the plan. A paying teacher, locked
      // out, with nothing in the data to explain it.
      //
      // The webhook is the only path every purchase goes through, so it is where
      // role belongs.
      //
      // SAME STATEMENT, NOT A SECOND ONE. The natural instinct is to write role
      // after checking that this call returned "written", but that outcome does
      // not exist until this UPDATE has run, so gating on it would require a
      // second statement and a window where the entitlement lands and the role
      // does not. It is unnecessary: "written" IS the ordering predicate below
      // matching a row, so putting role in this object inherits exactly that
      // guarantee, atomically. A stale redelivery writes neither.
      //
      // PROMOTE ONLY. The spread is absent for student plans, so nothing is
      // written and nothing can be demoted. A cancelled teacher keeps
      // role='teacher' and is denied by the plan check instead, which is
      // correct: role is identity and the entitlement is what lapsed. Demoting
      // would also strip the course tree's second door from someone mid-renewal.
      //
      // The two plan literals rather than planGrants(plan, 'teacher-dashboard'),
      // which is equivalent today. Spelled out because this is a role write and
      // the rule should be readable here without following it into the
      // capability map. Same shape teacher/welcome already uses.
      ...(write.plan === "teacher-core" || write.plan === "teacher-pro"
        ? { role: "teacher" }
        : {}),
    })
    .eq("id", profileId)
    .or(`plan_updated_at.is.null,plan_updated_at.lt.${eventAt}`)
    .select("id");

  if (error) {
    // Surfaced to the caller as a throw so the webhook returns 500 and Stripe
    // retries: a transient database error is worth retrying, unlike the two
    // cases above.
    throw new Error(`[${source}] entitlement write failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.warn(
      `[${source}] ignoring stale event for ${profileId}: profile has an entitlement ` +
        `newer than this event (${eventAt})`
    );
    return "stale";
  }

  console.log(
    `[${source}] ${profileId} -> ${write.plan}/${write.planStatus}, ` +
      `access_until ${accessUntilIso ?? "none"}`
  );
  return "written";
}

/**
 * Last-resort write for a checkout whose Payment Link this build does not know.
 *
 * Never worse than the behaviour before Phase 3: it sets only
 * subscription_status, exactly as the old activate() did, so a buyer through a
 * link created after this deploy still gets access rather than paying for
 * nothing. It deliberately does NOT touch plan or plan_status, because writing
 * one without the other violates profiles_plan_pairing_check.
 */
export async function legacyActivateOnly(
  admin: Admin,
  profileId: string,
  source: string,
  reason: string
): Promise<void> {
  console.error(`[${source}] ${reason}. Falling back to subscription_status only.`, { profileId });
  await admin.from("profiles").update({ subscription_status: "active" }).eq("id", profileId);
}

/**
 * Resolve a completed checkout session into an entitlement.
 *
 * Returns null when the session's Payment Link is unknown, so the caller can
 * fall back rather than guess.
 *
 * The subscription retrieve is the non-obvious part. A checkout session carries
 * no period end, so a subscription purchase would otherwise be written as
 * "grants access, no end date", which profiles_access_until_check refuses. One
 * retrieve on the purchase path is cheap; a provisional term-based end date is
 * used if it fails, and the next customer.subscription.updated corrects it.
 */
export async function entitlementFromCheckout(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  eventCreatedMs: number,
  source: string
): Promise<EntitlementWrite | null> {
  const paymentLinkId =
    typeof session.payment_link === "string"
      ? session.payment_link
      : session.payment_link?.id ?? null;

  const product = productForPaymentLink(paymentLinkId);
  if (!product) return null;

  // Cross-check, never the key. A price change or a coupon should not take
  // checkout down, so a mismatch is logged loudly and the map still wins.
  if (session.amount_total != null && session.amount_total !== product.amountTotal) {
    console.error(
      `[${source}] amount mismatch for ${paymentLinkId} (${product.label}): ` +
        `session says ${session.amount_total}, map says ${product.amountTotal}. ` +
        `Honouring the map.`
    );
  }
  if (session.mode !== product.mode) {
    console.error(
      `[${source}] mode mismatch for ${paymentLinkId} (${product.label}): ` +
        `session says ${session.mode}, map says ${product.mode}. Honouring the map.`
    );
  }

  const base: Omit<EntitlementWrite, "accessUntil" | "planStatus"> = {
    plan: product.plan,
    planTerm: product.term,
    planSource: "stripe",
    paymentLinkId,
  };

  // One-time pass. Stripe charges once and never revisits, so the term computed
  // here is the only thing that ever ends this access. Derived from the EVENT
  // timestamp rather than Date.now() so a redelivery recomputes the same end
  // date instead of quietly extending it.
  if (product.mode === "payment") {
    const months = product.months ?? 0;
    if (months <= 0) {
      console.error(`[${source}] ${product.label} is one-time but has no term. Refusing.`);
      return null;
    }
    return {
      ...base,
      planStatus: "active",
      accessUntil: addMonths(new Date(eventCreatedMs), months),
    };
  }

  // Subscription. Ask Stripe for the period end, because the session does not
  // carry one.
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  if (subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const periodEnd = subscriptionPeriodEnd(sub);
      if (periodEnd) {
        return { ...base, planStatus: sub.status as PlanStatus, accessUntil: periodEnd };
      }
      console.error(`[${source}] subscription ${subscriptionId} carries no period end.`);
    } catch (err) {
      console.error(`[${source}] could not retrieve subscription ${subscriptionId}:`, err);
    }
  }

  // Provisional. Better than refusing the write and leaving a payer with
  // nothing; corrected by the next customer.subscription.updated.
  console.warn(
    `[${source}] using a provisional ${product.term} access_until for ${product.label}. ` +
      `The next subscription event will correct it.`
  );
  return {
    ...base,
    planStatus: "active",
    accessUntil: addMonths(new Date(eventCreatedMs), product.term === "annual" ? 12 : 1),
  };
}
