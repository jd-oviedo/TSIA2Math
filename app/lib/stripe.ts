import Stripe from "stripe";

// Server-only Stripe client. Uses the test-mode secret key from the
// environment. Never import this into a "use client" file — the secret
// key must never ship to the browser.
//
// We deliberately do NOT pin an apiVersion here so the SDK uses the
// version bundled with this stripe-node release, which its types match.

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export function getStripe(): Stripe {
  if (!stripeSecretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add the test-mode secret key to " +
        ".env.local (and Vercel env vars). Find it in the Stripe dashboard " +
        "under Developers > API keys while in Test mode."
    );
  }
  return new Stripe(stripeSecretKey);
}
