import { NextResponse } from "next/server";
import { getStripe } from "../../lib/stripe";
import { createClient } from "../../lib/supabase-server";
import { createAdminClient } from "../../lib/supabase-admin";
import { profileGrants } from "../../lib/auth";
import { loginHref } from "../../lib/next-param";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Creates the $1-trial Checkout Session and redirects to Stripe.
//
// Deliberately a separate route from /start's page: a session must be created
// exactly when the buyer clicks, never as a side effect of rendering or
// prefetching the page, and cancel_url must land on something that does NOT
// immediately create another session — /start with cancel_url pointed back at
// itself would loop a cancelling buyer straight into a fresh checkout.
//
// The metadata stamp is the contract with entitlementFromCheckout's trial
// branch (app/lib/stripe-activation.ts). A session without it falls into
// legacyActivateOnly and the buyer pays $1 for a locked dashboard, so the
// stamp is not optional decoration.

const TRIAL_DAYS = 7;

// Same derivation as auth/callback's resolveOrigin: behind Codespaces or
// Vercel the request URL says localhost, and the real host is forwarded.
function resolveOrigin(req: Request): string {
  const host = req.headers.get("x-forwarded-host");
  if (host) return `${req.headers.get("x-forwarded-proto") ?? "https"}://${host}`;
  return new URL(req.url).origin;
}

export async function GET(req: Request) {
  const origin = resolveOrigin(req);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}${loginHref("/start", "teacher")}`);
  }

  // Already entitled? Nothing to sell; go to the dashboard. Without this, a
  // signed-in Pro teacher who clicks the marketing CTA buys a second
  // subscription onto the same customer.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("plan, plan_status, access_until, stripe_payment_link_id, subscription_status")
    .eq("id", user.id)
    .maybeSingle();
  if (profile && profileGrants(profile, "teacher-dashboard", "start/checkout")) {
    return NextResponse.redirect(`${origin}/teacher`);
  }

  const proPrice = process.env.STRIPE_TEACHER_PRO_MONTHLY_PRICE_ID;
  const feePrice = process.env.STRIPE_TRIAL_FEE_PRICE_ID;
  if (!proPrice || !feePrice) {
    console.error("[start/checkout] trial price env vars are not set");
    return NextResponse.redirect("https://unpackmath.com/pricing");
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [
      { price: proPrice, quantity: 1 }, // $30/mo recurring, trialing
      { price: feePrice, quantity: 1 }, // $1 one-time, charged today
    ],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      // The session metadata above is what entitlementFromCheckout reads; this
      // copy rides the SUBSCRIPTION, so trial_will_end and every invoice carry
      // the trial marker for the webhook's email branches. Stamped at birth or
      // never — subscription metadata is not writable from a checkout later.
      metadata: { source: "trial", plan: "teacher-pro" },
    },
    payment_method_collection: "always", // card required — the locked decision
    client_reference_id: user.id,
    ...(user.email ? { customer_email: user.email } : {}),
    metadata: { source: "trial", plan: "teacher-pro" },
    // /teacher/welcome verifies the session with Stripe, matches it to this
    // account by client_reference_id, and activates SYNCHRONOUSLY through the
    // same entitlementFromCheckout the webhook uses — closing the race where
    // the buyer lands back in the app before the webhook has written.
    success_url: `${origin}/teacher/welcome?checkout_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/start?canceled=1`,
  });

  if (!session.url) {
    console.error(`[start/checkout] session ${session.id} has no url`);
    return NextResponse.redirect("https://unpackmath.com/pricing");
  }
  return NextResponse.redirect(session.url, 303);
}
