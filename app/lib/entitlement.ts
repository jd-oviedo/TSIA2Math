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
export const ACCESS_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

export function grantsAccess(planStatus: string | null | undefined): boolean {
  return planStatus != null && GRANTING.has(planStatus);
}

/**
 * The rule. Both halves matter: a granting status is not enough on its own,
 * because that is exactly the missed-webhook hole this design closes.
 *
 * A null accessUntil means no expiry, which is comped or migrated access only.
 * The DDL refuses a stripe-sourced granting row without one.
 */
export function isEntitled(
  planStatus: string | null | undefined,
  accessUntil: string | Date | null | undefined,
  now: Date = new Date()
): boolean {
  if (!grantsAccess(planStatus)) return false;
  if (accessUntil == null) return true;
  const endsAt = accessUntil instanceof Date ? accessUntil : new Date(accessUntil);
  if (Number.isNaN(endsAt.getTime())) return false;
  return endsAt.getTime() + ACCESS_GRACE_MS > now.getTime();
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
  now: Date = new Date()
): "active" | "inactive" {
  return isEntitled(planStatus, accessUntil, now) ? "active" : "inactive";
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
  subscriptionStatus: string | null | undefined,
  source: string,
  now: Date = new Date()
): boolean {
  if (isEntitled(planStatus, accessUntil, now)) return true;
  if (subscriptionStatus === "active") {
    console.warn(
      `[entitlement] ${source} granted on legacy subscription_status with no plan. ` +
        `Written by legacyActivateOnly, which blocks dropping the column.`
    );
    return true;
  }
  return false;
}
