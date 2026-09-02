// Whether an entitlement is live right now.
//
// This is the one place that decides what a plan_status MEANS. The column stores
// the raw Stripe subscription status verbatim, all eight of them, so that no
// value Stripe can send is unrepresentable and no webhook write can throw on an
// ordinary event. The grants-or-not decision lives here instead, next to the
// grace interval, for the same reason the grace interval is not a column: it is
// policy, it will change, and changing it should not require a migration or a
// backfill of historical rows.
//
// Phase 4 reads this. Nothing else should reimplement the comparison.
//
// STILL RUNTIME-PURE FOR THE HARNESSES, AND FOR THE BROWSER. The one import
// below is a VALUE import, which is new, and it is deliberately of products.ts
// -- the only other module in app/lib whose every import is `import type` and
// therefore erased. So `node --test` still loads this file directly, and the
// client component that reads it (app/components/Header.tsx) still pulls in no
// runtime dependency beyond a frozen map of ids that are already public in
// every buy.stripe.com URL.
//
// NOT A CYCLE AT RUNTIME. products.ts imports `type { PlanStatus }` from here,
// which the type-stripping loader and the bundler both erase, so the edge only
// exists for the compiler.

import { TRIPWIRE_PAYMENT_LINK_ID } from "./products";

export type PlanStatus =
  // Stripe subscription statuses, all eight
  | "active"
  | "trialing"
  | "past_due"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "canceled"
  | "paused"
  // not a Stripe value: a one-time pass whose term ran out
  | "expired";

// The three that grant access. Everything else does not.
//
// past_due grants deliberately. Stripe retries a failed card for days, and the
// previous behaviour revoked access on the FIRST failure, so a card that failed
// once and succeeded on retry locked the teacher out in between. A past_due
// teacher keeps the period they already paid for, which access_until already
// encodes.
const GRANTING: ReadonlySet<string> = new Set(["active", "trialing", "past_due"]);

// Absorbs a LATE renewal webhook.
//
// Storing current_period_end makes the system fail closed, which is the point:
// a cancellation whose webhook never arrives now lapses at period end instead of
// granting access forever. The mirror risk is that a DELAYED renewal briefly
// locks out someone who has in fact paid, and this is the forgiveness for that.
//
// Applied uniformly rather than only to subscriptions. For a one-time pass no
// renewal is coming, so this is three days of courtesy rather than three days of
// tolerance. That is a deliberate simplification: one code path, no branch on
// term, and erring toward the buyer on a boundary nobody can observe.
//
// STILL THE RULE FOR EVERY PASS BUT ONE. See accessGraceMs below: the $5 / 7-day
// tripwire gets zero. This constant is unchanged and is still what every other
// row gets, which matters -- lowering it globally to serve one price would
// quietly shorten every subscription and every $49/$89 pass in the product.
export const ACCESS_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * How much grace THIS row gets, from the price that was paid for it.
 *
 * ZERO FOR THE TRIPWIRE, three days for everything else.
 *
 * WHY THE GRACE HAD TO BECOME TERM-AWARE AT ALL. Three days on a 7-day pass is
 * 43% of the product given away, and it is given away at precisely the moment
 * the funnel is trying to convert: the day-6 email says access ends tomorrow,
 * and a flat grace makes that false for three more days. On a 6- or 12-month
 * pass the same three days is rounding error, which is why it stays.
 *
 * IDENTIFIED BY PAYMENT LINK, NOT BY PLAN OR TERM, and there is no third
 * option. The tripwire row's plan is 'full-course' -- the same value an $89
 * buyer carries -- and its plan_term is 'one-time', the same value a $49
 * Practice Pass carries. stripe_payment_link_id is the ONLY per-row record of
 * which price was paid, so it is the only thing that can tell the two apart
 * after the fact. That is the same marker Phase 2's day-6 email targets, which
 * is not a coincidence: one marker, or the email and the expiry disagree about
 * who is on the tripwire.
 *
 * A null id is not a tripwire. Subscriptions carry none (a subscription event
 * has no payment link), comped and migrated rows carry none, and every row
 * written before this shipped carries none. All of them keep three days.
 */
export function accessGraceMs(paymentLinkId: string | null | undefined): number {
  return paymentLinkId === TRIPWIRE_PAYMENT_LINK_ID ? 0 : ACCESS_GRACE_MS;
}

export function grantsAccess(planStatus: string | null | undefined): boolean {
  return planStatus != null && GRANTING.has(planStatus);
}

/**
 * The rule. Both halves matter: a granting status is not enough on its own,
 * because that is exactly the missed-webhook hole this design closes.
 *
 * A null accessUntil means no expiry, which is comped or migrated access only.
 * The DDL refuses a stripe-sourced granting row without one.
 *
 * paymentLinkId IS REQUIRED, AND POSITIONED WITH THE OTHER TWO ROW FIELDS
 * RATHER THAN AFTER THE CLOCK. It could have been an optional trailing
 * parameter defaulting to null, and every existing call site would have kept
 * compiling -- silently taking three days of grace on a seven-day pass. Making
 * it required turns "a reader forgot the column" from a runtime behaviour into
 * a compile error at the call site, which is the same trade auth.ts already
 * made for Capability and gives the same guarantee: the readers cannot drift
 * away from the rule one at a time.
 *
 * Pass null for any read that genuinely has no link to offer.
 */
export function isEntitled(
  planStatus: string | null | undefined,
  accessUntil: string | Date | null | undefined,
  paymentLinkId: string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!grantsAccess(planStatus)) return false;
  if (accessUntil == null) return true;
  const endsAt = accessUntil instanceof Date ? accessUntil : new Date(accessUntil);
  if (Number.isNaN(endsAt.getTime())) return false;
  return endsAt.getTime() + accessGraceMs(paymentLinkId) > now.getTime();
}

/**
 * The legacy flag, derived rather than tracked separately.
 *
 * subscription_status is still read in six places including the live teacher
 * gate, so Phase 3 keeps writing it in lockstep with the new columns. Deriving
 * it here rather than setting it by hand at each call site is what stops the two
 * from drifting while both exist. Phase 4 moves the readers onto isEntitled and
 * only then does dropping the column become a safe separate change.
 */
export function legacySubscriptionStatus(
  planStatus: string | null | undefined,
  accessUntil: string | Date | null | undefined,
  paymentLinkId: string | null | undefined,
  now: Date = new Date()
): "active" | "inactive" {
  return isEntitled(planStatus, accessUntil, paymentLinkId, now) ? "active" : "inactive";
}

/**
 * THE TRANSITION PREDICATE, and the reason it is not just isEntitled.
 *
 * legacyActivateOnly (stripe-activation.ts:171) writes subscription_status
 * 'active' with NO plan, because writing a plan without a status violates
 * profiles_plan_pairing_check and it cannot name the product. It fires when a
 * checkout arrives on a Payment Link this build does not know, which is exactly
 * a link created after the current deploy.
 *
 * A reader on isEntitled alone reads plan_status null on such a row and DENIES,
 * so the fallback that exists to stop a buyer paying for nothing would become the
 * thing that locks them out. Accepting both while the column still exists is the
 * agreed shape, and the warning makes the fallback's use visible instead of
 * silent.
 *
 * THIS IS WHY subscription_status CANNOT BE DROPPED YET, and legacyActivateOnly
 * is the blocker by name. Dropping the column waits on that path being able to
 * name a product, most likely by resolving it with a paymentLinks.retrieve
 * before falling back. Every reader in the codebase goes through here, so the
 * drop becomes a single-file change once that is done.
 */
export function isEntitledWithLegacyFallback(
  planStatus: string | null | undefined,
  accessUntil: string | Date | null | undefined,
  paymentLinkId: string | null | undefined,
  subscriptionStatus: string | null | undefined,
  source: string,
  now: Date = new Date()
): boolean {
  if (isEntitled(planStatus, accessUntil, paymentLinkId, now)) return true;
  if (subscriptionStatus === "active") {
    console.warn(
      `[entitlement] ${source} granted on legacy subscription_status with no plan. ` +
        `Written by legacyActivateOnly, which blocks dropping the column.`
    );
    return true;
  }
  return false;
}
