import { NextResponse } from "next/server";
import { getStripe } from "../../../lib/stripe";
import { createAdminClient } from "../../../lib/supabase-admin";
import { requireTeacher } from "../../../lib/auth";
import { liveSubscriptionFor, resolveOrigin } from "../subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// "Cancel anyway", from the /teacher/cancel screen. One click, by design.
//
// cancel_at_period_end, never an immediate cancel: the teacher keeps what they
// paid for (or the trial days they were promised), and NO entitlement write is
// needed here — the status stays trialing/active until the period ends, which
// is exactly what the profile already says, and the period-end
// customer.subscription.deleted event records 'canceled' through the existing
// webhook branch. This path genuinely self-heals; the switch route is the one
// that cannot.
export async function POST(req: Request) {
  const origin = resolveOrigin(req);

  const profile = await requireTeacher();
  if (!profile) return NextResponse.redirect(`${origin}/teacher`, 303);

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", profile.id)
    .maybeSingle();
  const customerId: string | null = row?.stripe_customer_id ?? null;
  if (!customerId) return NextResponse.redirect(`${origin}/teacher/billing`, 303);

  try {
    const stripe = getStripe();
    const sub = await liveSubscriptionFor(stripe, customerId);
    if (!sub) return NextResponse.redirect(`${origin}/teacher/billing`, 303);

    // Idempotent: a double-submit finds cancel_at_period_end already true and
    // sets it true again, which is a no-op on Stripe's side.
    await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });

    console.log(`[teacher/cancel] ${profile.id} scheduled ${sub.id} to cancel at period end`);
    return NextResponse.redirect(`${origin}/teacher/cancel?done=canceled`, 303);
  } catch (err) {
    console.error(`[teacher/cancel] cancel failed for ${profile.id}:`, err);
    return NextResponse.redirect(`${origin}/teacher/cancel?error=stripe`, 303);
  }
}
