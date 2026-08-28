import type Stripe from "stripe";

// Shared by the cancel page and its two POST routes, and only by them.
//
// profiles deliberately stores no subscription id — every Stripe surface in
// this repo resolves by stripe_customer_id — so the subscription is looked up
// live at the moment of use. That is not a workaround: the id on file would be
// one more thing to go stale, and the swap/cancel below must act on whatever
// subscription is ACTUALLY live, not whatever was live when a row was written.

const LIVE_STATUSES: ReadonlySet<Stripe.Subscription.Status> = new Set([
  "active",
  "trialing",
  "past_due",
]);

/**
 * The customer's one live subscription: active, trialing, or past_due,
 * newest first. Null when nothing is live.
 */
export async function liveSubscriptionFor(
  stripe: Stripe,
  customerId: string
): Promise<Stripe.Subscription | null> {
  const { data } = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  });
  const live = data
    .filter((sub) => LIVE_STATUSES.has(sub.status))
    .sort((a, b) => b.created - a.created);

  if (live.length > 1) {
    // One profile, one stripe_customer_id, so two live subscriptions means a
    // double purchase that already deserved attention. Acting on the newest is
    // the least-wrong choice; the log is the record that it happened.
    console.warn(
      `[teacher/cancel] customer ${customerId} has ${live.length} live subscriptions; ` +
        `using the newest (${live[0].id})`
    );
  }
  return live[0] ?? null;
}

// Same derivation as auth/callback's resolveOrigin: behind Codespaces or
// Vercel the request URL says localhost, and the real host is forwarded.
export function resolveOrigin(req: Request): string {
  const host = req.headers.get("x-forwarded-host");
  if (host) return `${req.headers.get("x-forwarded-proto") ?? "https"}://${host}`;
  return new URL(req.url).origin;
}
