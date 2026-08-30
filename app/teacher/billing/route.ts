import { NextResponse } from "next/server";
import { getStripe } from "../../lib/stripe";
import { createClient } from "../../lib/supabase-server";
import { createAdminClient } from "../../lib/supabase-admin";
import { loginHref } from "../../lib/next-param";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Signs the current user into the Stripe Customer Portal and redirects there.
//
// This is where the buyer emails' "cancel" and "update your card" links land.
// A6 puts the in-app cancel screen (with the Core save-offer) in front of the
// cancel path; the portal remains the card-update surface either way, because
// collecting card details is Stripe's job, not ours.
//
// Requires the Customer Portal to be ACTIVATED in the Stripe dashboard
// (Settings -> Billing -> Customer portal, saved default configuration) in the
// matching mode, or billingPortal.sessions.create errors. That failure is
// caught and lands on /teacher rather than a 500 page.
//
// Every failure path redirects to /teacher: its own gate sorts out who the
// visitor is, and a billing link that dead-ends on an error page would be
// arriving from an email about money.

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
    return NextResponse.redirect(`${origin}${loginHref("/teacher/billing", "teacher")}`);
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const customerId = profile?.stripe_customer_id ?? null;
  if (!customerId) {
    // Nothing to manage: never bought, or bought through a path that failed to
    // link the customer id (which alertUnlinkedCustomer already shouted about).
    console.warn(`[teacher/billing] ${user.id} has no stripe_customer_id`);
    return NextResponse.redirect(`${origin}/teacher`);
  }

  try {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/teacher`,
    });
    return NextResponse.redirect(portal.url, 303);
  } catch (err) {
    console.error(`[teacher/billing] portal session failed for ${user.id}:`, err);
    return NextResponse.redirect(`${origin}/teacher`);
  }
}
