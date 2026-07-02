import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "../../../lib/stripe";
import { createAdminClient } from "../../../lib/supabase-admin";

// Stripe signs webhooks with a shared secret and delivers a raw JSON body.
// We must (a) read the raw body untouched to verify the signature and
// (b) run on the Node.js runtime (constructEvent needs Node crypto).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Admin = ReturnType<typeof createAdminClient>;

// Coerce a Stripe expandable field (string id | object | null) to its id.
function toId(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

// profiles has no email column — email lives in auth.users. Page through
// the auth admin API to resolve an email to its profile/user id. Founding-
// teacher scale, so a bounded scan is fine.
async function findUserIdByEmail(admin: Admin, email: string): Promise<string | null> {
  const target = email.trim().toLowerCase();
  if (!target) return null;
  const perPage = 200;
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) return null;
    const match = data.users.find(
      (u: { id: string; email?: string | null }) => (u.email ?? "").toLowerCase() === target
    );
    if (match) return match.id;
    if (data.users.length < perPage) return null; // reached the last page
  }
  return null;
}

async function findProfileIdByCustomerId(admin: Admin, customerId: string): Promise<string | null> {
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}

// Resolve a profile id from whatever the event gives us: prefer the stored
// stripe_customer_id, then fall back to the customer's email (retrieving the
// Stripe customer when the event itself carries no email).
async function resolveProfileId(
  admin: Admin,
  stripe: Stripe,
  opts: { customerId?: string | null; email?: string | null }
): Promise<string | null> {
  if (opts.customerId) {
    const byCustomer = await findProfileIdByCustomerId(admin, opts.customerId);
    if (byCustomer) return byCustomer;
  }

  let email = opts.email ?? null;
  if (!email && opts.customerId) {
    try {
      const customer = await stripe.customers.retrieve(opts.customerId);
      if (!("deleted" in customer)) email = customer.email;
    } catch (err) {
      console.error("[stripe/webhook] failed to retrieve customer:", err);
    }
  }
  if (!email) return null;
  return findUserIdByEmail(admin, email);
}

async function activate(
  admin: Admin,
  profileId: string,
  customerId: string | null,
  email: string | null
) {
  await admin
    .from("profiles")
    .update({ subscription_status: "active" })
    .eq("id", profileId);

  // Store the customer id only if it isn't already set.
  if (customerId) {
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", profileId)
      .is("stripe_customer_id", null);
  }

  console.log(
    `[stripe/webhook] activated profile for ${email ?? profileId}, customer ${customerId}`
  );
}

async function deactivate(admin: Admin, profileId: string, email: string | null) {
  await admin
    .from("profiles")
    .update({ subscription_status: "inactive" })
    .eq("id", profileId);

  console.log(`[stripe/webhook] deactivated profile for ${email ?? profileId}`);
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Raw body + signature MUST be verified before we trust any of the payload.
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = toId(session.customer);
        const email = session.customer_details?.email ?? session.customer_email ?? null;
        const profileId = await resolveProfileId(admin, stripe, { customerId, email });
        if (!profileId) {
          console.error("[stripe/webhook] no profile match for checkout session", { email, customerId });
          break;
        }
        await activate(admin, profileId, customerId, email);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = toId(sub.customer);
        const profileId = await resolveProfileId(admin, stripe, { customerId });
        if (!profileId) {
          console.error("[stripe/webhook] no profile match for subscription.updated", { customerId });
          break;
        }
        if (sub.status === "active" || sub.status === "trialing") {
          await activate(admin, profileId, customerId, null);
        } else if (
          sub.status === "past_due" ||
          sub.status === "unpaid" ||
          sub.status === "canceled" ||
          sub.status === "incomplete_expired"
        ) {
          await deactivate(admin, profileId, null);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = toId(sub.customer);
        const profileId = await resolveProfileId(admin, stripe, { customerId });
        if (!profileId) {
          console.error("[stripe/webhook] no profile match for subscription.deleted", { customerId });
          break;
        }
        await deactivate(admin, profileId, null);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = toId(invoice.customer);
        const profileId = await resolveProfileId(admin, stripe, { customerId });
        if (!profileId) {
          console.error("[stripe/webhook] no profile match for invoice.payment_failed", { customerId });
          break;
        }
        await deactivate(admin, profileId, null);
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    // Return 500 so Stripe retries — a transient DB error shouldn't be lost.
    console.error(`[stripe/webhook] handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
