// The trial fee, as a number and as the string every /start surface prints.
//
// WHY THIS FILE EXISTS. The onboarding copy states the price three times: the
// headline, the sub, and the fine print under the button. Those three had to
// agree with each other and with what Stripe actually charges, and the way that
// goes wrong is someone editing one of them.
//
// WHERE THE REAL NUMBER LIVES. The charge is a Stripe Price object, referenced
// by STRIPE_TRIAL_FEE_PRICE_ID and added as a line item in
// app/start/checkout/route.ts:69. Nothing in this repo can set it. What the repo
// does hold is the value it EXPECTS, in app/lib/stripe-activation.ts:439:
//
//     const TRIAL_FEE_CENTS = 100;
//
// and that constant is not decoration. entitlementFromTrialCheckout compares it
// against session.amount_total on every trial purchase and logs an error when
// they disagree, so a price changed in the Stripe dashboard and not here is a
// loud failure rather than a silent one.
//
// THIS IS A MIRROR OF THAT CONSTANT, NOT A SECOND SOURCE OF TRUTH. It is
// duplicated rather than imported because stripe-activation.ts does not export
// it, and this branch is presentation only and does not touch Stripe wiring. If
// the trial fee ever moves, both this file and stripe-activation.ts:439 have to
// move together. Exporting the original and importing it here is the better
// shape and is left as a follow-up.
export const TRIAL_FEE_CENTS = 100;

// ─── The renewal price ───────────────────────────────────────────────────────
//
// The second line item on the trial checkout is the recurring subscription,
// STRIPE_TEACHER_PRO_MONTHLY_PRICE_ID at app/start/checkout/route.ts:68. It is
// charged nothing today and becomes the monthly rate when the trial ends, which
// is the fact the pre-payment disclosure has to state.
//
// The repo's expected value for it is app/lib/products.ts:94:
//
//     amountTotal: 3000, label: "Teacher Pro $30/mo",
//
// cross-checked against session.amount_total at stripe-activation.ts:366 the
// same way the trial fee is. Mirrored here for the same reason and with the same
// caveat as TRIAL_FEE_CENTS above: PRODUCTS_BY_PAYMENT_LINK is keyed by Payment
// Link id and the trial is a server-created session with no Payment Link, so
// there is no honest lookup to import. If the Teacher Pro monthly rate moves,
// products.ts:94 and this constant move together.
export const RENEWAL_CENTS = 3000;

/**
 * A cent amount as display copy. Whole dollars print without cents, so 100 gives
 * "$1" rather than "$1.00", which is how the buyer emails and the marketing page
 * already say it.
 */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/**
 * The same amount with cents always shown. The checkout card's DUE TODAY row
 * sits in a money column and reads as a receipt line, where "$1" next to a label
 * looks like a rounding rather than an exact charge.
 */
export function formatPriceExact(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Precomputed, because several call sites want the same strings. */
export const TRIAL_PRICE = formatPrice(TRIAL_FEE_CENTS);
export const TRIAL_PRICE_EXACT = formatPriceExact(TRIAL_FEE_CENTS);
export const RENEWAL_PRICE = formatPrice(RENEWAL_CENTS);

/** Matches TRIAL_DAYS in app/start/checkout/route.ts:25. Printed in the headline. */
export const TRIAL_DAYS = 7;
