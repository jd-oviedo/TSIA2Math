import { NextResponse } from "next/server";
import { getStripe } from "../../../lib/stripe";
import { createAdminClient } from "../../../lib/supabase-admin";
import { requireTeacher } from "../../../lib/auth";
import { writeEntitlement } from "../../../lib/stripe-activation";
import { subscriptionPeriodEnd } from "../../../lib/products";
import type { PlanStatus } from "../../../lib/entitlement";
import { liveSubscriptionFor, resolveOrigin } from "../subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The Core save-offer: swap the $30 Pro monthly price for the $20 Core one on
// the live subscription, in place.
//
// proration_behavior "none", confirmed by Juan: during a trial nothing has
// been charged so nothing is lost, and an active mid-cycle Pro subscriber
// switches immediately with no partial credit — the next charge is simply $20.
// No proration invoices, no refunds.
export async function POST(req: Request) {
  const origin = resolveOrigin(req);

  const profile = await requireTeacher();
  if (!profile) return NextResponse.redirect(`${origin}/teacher`, 303);

  const corePrice = process.env.STRIPE_TEACHER_CORE_MONTHLY_PRICE_ID;
  const proPrice = process.env.STRIPE_TEACHER_PRO_MONTHLY_PRICE_ID;
  if (!corePrice || !proPrice) {
    console.error("[teacher/cancel/switch] price env vars are not set");
    return NextResponse.redirect(`${origin}/teacher/cancel?error=stripe`, 303);
  }

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

    // Only the standard Pro monthly price is swappable. An annual or founding
    // subscription reaching here is a stale page or a forged POST; refuse
    // rather than reprice it. Idempotence falls out of the same guard: a
    // double-submit finds the Core price already on the item and refuses.
    const item = sub.items.data[0];
    if (!item || item.price.id !== proPrice) {
      console.warn(
        `[teacher/cancel/switch] ${profile.id}: subscription ${sub.id} is on ` +
          `${item?.price.id ?? "(no item)"}, not the Pro monthly price. Refusing.`
      );
      return NextResponse.redirect(`${origin}/teacher/cancel?error=notpro`, 303);
    }

    const updated = await stripe.subscriptions.update(sub.id, {
      items: [{ id: item.id, price: corePrice }],
      proration_behavior: "none",
      // Keep the stamp truthful for the email branches and future readers.
      metadata: { source: "trial", plan: "teacher-core" },
    });

    // THE WEBHOOK CANNOT DO THIS PART. entitlementFromSubscription prefers the
    // plan already on the profile (sql/entitlement_columns.sql decision 1,
    // which protects the founder-Pro-at-$10 rows), so the swap's own
    // subscription.updated event would carry teacher-pro forward unchanged.
    // The one place that KNOWS the plan changed is right here, so it writes
    // the change through the same single writer everything else uses.
    //
    // Ordering: the swap event's created time precedes this Date.now(), so
    // this write wins whichever of the two lands first, and every later
    // renewal reads teacher-core back through knownPlanFor.
    //
    // If subscriptionPeriodEnd somehow returns null, writeEntitlement refuses
    // (granting status, no end date) and logs loudly; the subscription is
    // already swapped at that point, so the refusal is the alarm that the
    // profile still says teacher-pro and needs a hand.
    const outcome = await writeEntitlement(
      admin,
      profile.id,
      {
        plan: "teacher-core",
        planTerm: "monthly",
        planStatus: updated.status as PlanStatus,
        accessUntil: subscriptionPeriodEnd(updated),
        planSource: "stripe",
        paymentLinkId: null,
      },
      Date.now(),
      "teacher/cancel/switch"
    );

    console.log(
      `[teacher/cancel/switch] ${profile.id} swapped ${sub.id} to Core (write: ${outcome})`
    );
    return NextResponse.redirect(`${origin}/teacher/cancel?done=core`, 303);
  } catch (err) {
    console.error(`[teacher/cancel/switch] switch failed for ${profile.id}:`, err);
    return NextResponse.redirect(`${origin}/teacher/cancel?error=stripe`, 303);
  }
}
