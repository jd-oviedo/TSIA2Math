// The live Payment Links, what each one sells, and how to read a product
// out of a Stripe object.
//
// EIGHT LIVE, PLUS ONE THAT DOES NOT EXIST YET. The ninth entry is the $5 / 7-day
// tripwire, keyed on TRIPWIRE_PAYMENT_LINK_ID, which is still a placeholder: the
// code that recognises the link ships BEFORE the link is created, deliberately.
// See the constant for why that order is not optional.
//
// RUNTIME-PURE ON PURPOSE. Every import here is `import type`, which the
// type-stripping loader erases, so `node --test` can load this directly the same
// way it loads next-param.ts. The moment this file gains a real import it stops
// being testable without a bundler, so the subscription derivation lives here
// rather than in stripe-activation.ts, which must import the admin client.
//
// This is the only place a Stripe identifier is turned into a product. The
// webhook reads `payment_link` off the checkout session -- a plink_ id that is
// already in the payload and was previously discarded -- and looks it up here.
// No extra Stripe API call, no price id map, and nothing about product identity
// is inferred from an amount.
//
// TWO OF THESE ARE THE FOUNDING TEACHER RATE, AND THEY BELONG HERE.
//
// The founding tier is closed and must never be SOLD again: /upgrade has no path
// to those two links and Phase 5 drops the `monthly` and `annual` slugs that used
// to reach them. But receiving a webhook is not selling. The tier stays open to
// warm contacts until it closes, existing subscribers renew off those prices
// forever, and a founding teacher who buys must get a correct entitlement like
// anyone else. Leaving them out of this map would take their money and record
// nothing.
//
// The founding rate is a PRICE, not a tier. Both founding links map to
// plan 'teacher-core', the same as the $20/$200 public links. Who bought at the
// founding rate is recorded by is_founder plus stripe_payment_link_id, and there
// is deliberately no third marker.

import type Stripe from "stripe";
import type { PlanStatus } from "./entitlement";

export type Plan = "practice-pass" | "full-course" | "teacher-core" | "teacher-pro";
export type PlanTerm = "monthly" | "annual" | "one-time";

export type EntitlementWrite = {
  plan: Plan;
  planTerm: PlanTerm;
  planStatus: PlanStatus;
  accessUntil: Date | null;
  planSource: "stripe" | "comp" | "migration";
  paymentLinkId?: string | null;
};

export type Product = {
  plan: Plan;
  term: PlanTerm;
  /** Stripe checkout mode this link produces. */
  mode: "payment" | "subscription";
  /** Expected session.amount_total in cents. Cross-check only, never the key. */
  amountTotal: number;
  /** Access length for one-time passes, in whole months. Undefined for
   *  subscriptions, whose expiry comes from the subscription period instead,
   *  and undefined for a pass whose term is measured in `days`. */
  months?: number;
  /**
   * Access length for one-time passes, in days.
   *
   * A SECOND UNIT RATHER THAN A FRACTIONAL `months`, because 7 days is not a
   * fraction of a month -- addMonths is deliberately calendar-aware and clamps
   * to the end of the target month, so there is no number of "months" that
   * means seven days. Anything shorter than a month has to be counted in days
   * or not counted correctly.
   *
   * EXCLUSIVE WITH `months`. A product declares one or the other; declaring
   * both is a configuration error and entitlementFromCheckout refuses it rather
   * than picking a winner. Nothing here enforces that at the type level, so the
   * refusal is the enforcement -- see stripe-activation.ts's one-time branch.
   *
   * No addDays() to go with addMonths(). Month arithmetic needs a helper
   * because the naive version silently overruns a short month; day arithmetic
   * is plain milliseconds, and the trial branch of stripe-activation.ts already
   * spells it out inline. One spelling, in the two places that need it.
   */
  days?: number;
  /** For logs. Never shown to a buyer. */
  label: string;
};

/**
 * THE $5 / 7-DAY TRIPWIRE PAYMENT LINK. ONE CONSTANT, AND THIS IS IT.
 *
 * JUAN PASTES THE REAL plink_ ID HERE, ON THIS LINE, AND NOWHERE ELSE. Three
 * separate rules key off it and they must never be able to disagree about which
 * price is the tripwire:
 *
 *   1. the product entry below            what a purchase on this link grants
 *   2. entitlement.ts's accessGraceMs     the tripwire gets ZERO grace
 *   3. Phase 2's day-6 email              which rows to send to
 *
 * WHY A PAYMENT LINK ID IS THE MARKER AND NOT A NEW PLAN. The tripwire sells
 * the EXISTING full-course plan -- identical capabilities, identical capability
 * map, identical constraints -- for 7 days instead of 12 months. So `plan`
 * cannot tell a $5 tripwire row from an $89 Full Course row, and
 * stripe_payment_link_id is the only per-row record of which PRICE was paid.
 * That is the same reasoning that already records the founding teacher rate
 * (see the header): the rate is a price, not a tier.
 *
 * THE PLACEHOLDER IS LOAD-BEARING UNTIL IT IS REPLACED. It cannot equal any
 * real Stripe id, so until the paste happens every rule above matches nothing
 * and this whole feature is inert: no product entry can be hit, no row can be
 * identified as a tripwire, and no grace changes. Deploying this before the
 * link exists is therefore safe, which is the point -- see the launch order
 * below.
 *
 * LAUNCH ORDER, AND IT IS NOT NEGOTIABLE. This code must be live in production
 * BEFORE the Stripe Payment Link is created. If the link exists first, a
 * purchase arrives on a plink this build does not know, entitlementFromCheckout
 * returns null, and the webhook falls back to legacyActivateOnly() -- which
 * writes subscription_status 'active' with NO plan and NO access_until, i.e.
 * PERMANENT, NO-EXPIRY Full Course access for $5, granted through
 * isEntitledWithLegacyFallback and not revocable by any expiry.
 *
 *   Deploy first. Create the link second. Paste the id third.
 */
export const TRIPWIRE_PAYMENT_LINK_ID = "plink_TRIPWIRE_NOT_YET_CREATED";

export const PRODUCTS_BY_PAYMENT_LINK: Readonly<Record<string, Product>> = {
  // Founding teacher tier. Closed to new sales, retained for existing
  // subscribers and warm contacts until it closes. See the header.
  plink_1Ts6onF8f8aZDGVA7rSbLxdB: {
    plan: "teacher-core", term: "monthly", mode: "subscription",
    amountTotal: 1000, label: "Founding teacher $10/mo",
  },
  plink_1Ts6pxF8f8aZDGVAGuq8UNof: {
    plan: "teacher-core", term: "annual", mode: "subscription",
    amountTotal: 10000, label: "Founding teacher $100/yr",
  },

  // Student products. One-time payments: Stripe charges once and then forgets,
  // so the term below is the only thing that ever ends this access.
  plink_1U5tejF8f8aZDGVAKbnefl6Z: {
    plan: "practice-pass", term: "one-time", mode: "payment",
    amountTotal: 4900, months: 6, label: "Practice Pass $49",
  },
  plink_1U5tgXF8f8aZDGVANGvtkoMF: {
    plan: "full-course", term: "one-time", mode: "payment",
    amountTotal: 8900, months: 12, label: "Full Course $89",
  },

  // THE $5 TRIPWIRE. THE SAME PLAN AS THE $89 LINE ABOVE, ON PURPOSE.
  //
  // plan 'full-course' is not a shorthand and not a placeholder: the tripwire
  // sells exactly the Full Course product -- curriculum, worksheets, mu -- for
  // 7 days rather than 12 months. Giving it a plan of its own would mean a new
  // value in profiles_plan_check and pending_entitlements_plan_check, a new row
  // in CAPABILITIES, WORKSHEET_QUOTA and PLAN_LABELS, and a second definition
  // of a product that is already defined. It is a PRICE, not a plan, and it is
  // recorded the way the founding teacher rate is recorded: by
  // stripe_payment_link_id.
  //
  // Computed key, so the constant above is the only place the id is written.
  [TRIPWIRE_PAYMENT_LINK_ID]: {
    plan: "full-course", term: "one-time", mode: "payment",
    amountTotal: 500, days: 7, label: "Tripwire Pass $5 / 7 days",
  },

  // Teacher subscriptions, public rates.
  plink_1U5tuZF8f8aZDGVARYelic7d: {
    plan: "teacher-core", term: "monthly", mode: "subscription",
    amountTotal: 2000, label: "Teacher Core $20/mo",
  },
  plink_1U5txdF8f8aZDGVAIEKoo1EF: {
    plan: "teacher-core", term: "annual", mode: "subscription",
    amountTotal: 20000, label: "Teacher Core $200/yr",
  },
  plink_1U5u2HF8f8aZDGVAtPJtpWiE: {
    plan: "teacher-pro", term: "monthly", mode: "subscription",
    amountTotal: 3000, label: "Teacher Pro $30/mo",
  },
  plink_1U5u3PF8f8aZDGVASKoXV5Fb: {
    plan: "teacher-pro", term: "annual", mode: "subscription",
    amountTotal: 30000, label: "Teacher Pro $300/yr",
  },
};

export function productForPaymentLink(plinkId: string | null): Product | null {
  if (!plinkId) return null;
  return PRODUCTS_BY_PAYMENT_LINK[plinkId] ?? null;
}

// Fallback identity for a subscription event that arrives with no plan already
// on the profile.
//
// Stripe does not guarantee event ordering, so customer.subscription.updated can
// land BEFORE the checkout.session.completed that would have set the plan. A
// subscription event carries no payment link, so the plink map above cannot help
// there. Every subscription price is a distinct amount, so the recurring unit
// amount identifies the plan unambiguously without needing a price id map.
//
// This is identity of last resort. It is never consulted when the profile
// already carries a plan.
const PLAN_BY_SUBSCRIPTION_AMOUNT: Readonly<Record<number, { plan: Plan; term: PlanTerm }>> = {
  1000:  { plan: "teacher-core", term: "monthly" },  // founding
  10000: { plan: "teacher-core", term: "annual" },   // founding
  2000:  { plan: "teacher-core", term: "monthly" },
  20000: { plan: "teacher-core", term: "annual" },
  3000:  { plan: "teacher-pro",  term: "monthly" },
  30000: { plan: "teacher-pro",  term: "annual" },
};

export function planForSubscriptionAmount(
  unitAmount: number | null | undefined,
  interval: string | null | undefined
): { plan: Plan; term: PlanTerm } | null {
  if (unitAmount == null) return null;
  const hit = PLAN_BY_SUBSCRIPTION_AMOUNT[unitAmount];
  if (!hit) return null;
  // The amount alone is decisive, but if Stripe also tells us the interval and
  // it disagrees with the table, trust nothing and return null rather than
  // guessing a term onto a plan.
  if (interval === "month" && hit.term !== "monthly") return null;
  if (interval === "year" && hit.term !== "annual") return null;
  return hit;
}

// Adds whole months without letting the short-month rollover silently extend
// access. new Date(2026,0,31) + 1 month is March 3 in plain JS, which would hand
// a buyer three free days and, worse, make the end date depend on which day they
// happened to buy. Clamped to the last day of the target month instead.
export function addMonths(from: Date, months: number): Date {
  const out = new Date(from.getTime());
  const targetMonth = out.getUTCMonth() + months;
  const day = out.getUTCDate();
  out.setUTCDate(1);
  out.setUTCMonth(targetMonth);
  const lastDayOfTargetMonth = new Date(
    Date.UTC(out.getUTCFullYear(), out.getUTCMonth() + 1, 0)
  ).getUTCDate();
  out.setUTCDate(Math.min(day, lastDayOfTargetMonth));
  return out;
}

/**
 * The period end of a subscription.
 *
 * current_period_end IS NOT ON THE SUBSCRIPTION OBJECT in stripe-node v22. It
 * moved to the subscription ITEM, so `sub.current_period_end` reads undefined,
 * produces an Invalid Date, and writes either a constraint violation or garbage.
 * Read from the items instead, taking the furthest one, since `items` is a list
 * and nothing guarantees a single entry.
 */
export function subscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  const ends = (sub.items?.data ?? [])
    .map((item) => item.current_period_end)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (ends.length === 0) return null;
  return new Date(Math.max(...ends) * 1000);
}

/**
 * Resolve a subscription event into an entitlement.
 *
 * `knownPlan` is the plan already on the profile. When it is null this falls
 * back to identifying the product by its recurring amount, because Stripe does
 * not guarantee ordering and customer.subscription.updated can arrive BEFORE the
 * checkout.session.completed that would have set the plan. Writing plan_status
 * without a plan violates profiles_plan_pairing_check, so a subscription event
 * that cannot name a plan must write nothing at all rather than half a row.
 */
export function entitlementFromSubscription(
  sub: Stripe.Subscription,
  knownPlan: { plan: Plan; term: PlanTerm } | null,
  statusOverride?: PlanStatus
): EntitlementWrite | null {
  let identity = knownPlan;

  if (!identity) {
    const price = sub.items?.data?.[0]?.price;
    identity = planForSubscriptionAmount(price?.unit_amount, price?.recurring?.interval ?? null);
  }
  if (!identity) return null;

  return {
    plan: identity.plan,
    planTerm: identity.term,
    planStatus: statusOverride ?? (sub.status as PlanStatus),
    accessUntil: subscriptionPeriodEnd(sub),
    planSource: "stripe",
  };
}
