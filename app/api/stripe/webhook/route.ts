import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "../../../lib/stripe";
import { createAdminClient } from "../../../lib/supabase-admin";
import {
  entitlementFromCheckout,
  findUserIdByEmail,
  legacyActivateOnly,
  linkCustomerId,
  writeEntitlement,
} from "../../../lib/stripe-activation";
import {
  entitlementFromSubscription,
  type Plan,
  type PlanTerm,
} from "../../../lib/products";

// Stripe signs webhooks with a shared secret and delivers a raw JSON body.
// We must (a) read the raw body untouched to verify the signature and
// (b) run on the Node.js runtime (constructEvent needs Node crypto).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// This is the ONLY path that activates anyone. All eight Payment Links redirect
// to the marketing site's /success, so /teacher/welcome never runs on a real
// purchase. If a branch here declines to write, nobody else picks it up.
//
// Every branch obeys the same two rules:
//
//   1. Record what Stripe SENT. plan_status holds the raw subscription status
//      verbatim, all eight of them. Whether a status grants access is decided in
//      app/lib/entitlement.ts, never here. A handler that had to judge a status
//      before storing it would throw on the first value nobody anticipated, and
//      a throw here means a 500 and an infinite Stripe retry.
//
//   2. Write a whole entitlement or none of it. plan and plan_status travel
//      together under profiles_plan_pairing_check, so a branch that cannot name
//      the plan writes nothing and says why.

const SOURCE = "stripe/webhook";

type Admin = ReturnType<typeof createAdminClient>;

// Coerce a Stripe expandable field (string id | object | null) to its id.
function toId(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

async function findProfileIdByCustomerId(admin: Admin, customerId: string): Promise<string | null> {
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}

// Resolve a profile id from whatever the event gives us: prefer the
// client_reference_id set by our /upgrade redirect, then the stored
// stripe_customer_id, then fall back to the customer's email (retrieving the
// Stripe customer when the event itself carries no email).
//
// Unchanged by Phase 3. This is the part that already worked.
async function resolveProfileId(
  admin: Admin,
  stripe: Stripe,
  opts: { customerId?: string | null; email?: string | null; clientReferenceId?: string | null }
): Promise<string | null> {
  if (opts.clientReferenceId) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("id", opts.clientReferenceId)
      .maybeSingle();
    if (data?.id) return data.id;
  }

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
      console.error(`[${SOURCE}] failed to retrieve customer:`, err);
    }
  }
  if (!email) return null;
  return findUserIdByEmail(admin, email);
}

// The plan already recorded against a profile, so a subscription event does not
// have to re-derive an identity it can simply be told.
async function knownPlanFor(
  admin: Admin,
  profileId: string
): Promise<{ plan: Plan; term: PlanTerm } | null> {
  const { data } = await admin
    .from("profiles")
    .select("plan, plan_term")
    .eq("id", profileId)
    .maybeSingle();
  if (!data?.plan || !data?.plan_term) return null;
  return { plan: data.plan as Plan, term: data.plan_term as PlanTerm };
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error(`[${SOURCE}] STRIPE_WEBHOOK_SECRET is not set`);
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
    console.error(`[${SOURCE}] signature verification failed:`, err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  // The event's own timestamp, not the wall clock. Every downstream write is
  // ordered by this and every one-time term is measured from it, so a Stripe
  // redelivery is idempotent rather than a fresh write that extends access.
  const eventCreatedMs = event.created * 1000;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = toId(session.customer);
        const email = session.customer_details?.email ?? session.customer_email ?? null;
        const clientReferenceId = session.client_reference_id ?? null;
        const paymentLink = toId(session.payment_link);

        const profileId = await resolveProfileId(admin, stripe, {
          customerId,
          email,
          clientReferenceId,
        });
        if (!profileId) {
          console.error(`[${SOURCE}] no profile match for checkout session`, {
            email,
            customerId,
            clientReferenceId,
            paymentLink,
          });
          break;
        }

        await linkCustomerId(admin, profileId, customerId);

        const write = await entitlementFromCheckout(stripe, session, eventCreatedMs, SOURCE);
        if (!write) {
          // An unknown Payment Link. Never leave a payer with nothing: fall back
          // to exactly the pre-Phase-3 behaviour, loudly.
          await legacyActivateOnly(
            admin,
            profileId,
            SOURCE,
            `unrecognised payment link ${paymentLink ?? "(none)"}`
          );
          break;
        }

        await writeEntitlement(admin, profileId, write, eventCreatedMs, SOURCE);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = toId(sub.customer);
        const profileId = await resolveProfileId(admin, stripe, { customerId });
        if (!profileId) {
          console.error(`[${SOURCE}] no profile match for ${event.type}`, { customerId });
          break;
        }

        // A deleted subscription is reported by Stripe with whatever status it
        // ended on; 'canceled' is the truthful record of what happened and is
        // what the entitlement rule reads.
        const statusOverride = event.type === "customer.subscription.deleted"
          ? ("canceled" as const)
          : undefined;

        const write = entitlementFromSubscription(
          sub,
          await knownPlanFor(admin, profileId),
          statusOverride
        );

        if (!write) {
          // Neither the profile nor the subscription's own price could name a
          // plan. Writing plan_status alone would violate the pairing
          // constraint, throw, 500, and have Stripe retry forever, so this
          // writes nothing on purpose.
          console.error(
            `[${SOURCE}] ${event.type} for ${profileId}: cannot identify a plan from the ` +
              `profile or the subscription price. No entitlement written.`,
            { customerId, subscription: sub.id, status: sub.status }
          );
          break;
        }

        await writeEntitlement(admin, profileId, write, eventCreatedMs, SOURCE);
        break;
      }

      case "invoice.payment_failed": {
        // OBSERVATIONAL ONLY, and this is a deliberate behaviour change.
        //
        // This branch used to revoke access on the FIRST failed charge. Stripe
        // retries a card for days, so a payment that failed once and succeeded
        // on retry locked the teacher out in between, with a dunning email
        // telling them everything was fine.
        //
        // Stripe already reports the same fact as customer.subscription.updated
        // with status past_due, which that branch records, and past_due grants
        // access until the period the customer already paid for actually ends.
        // Writing here as well would be a second, competing opinion about the
        // same event, so this logs and stops.
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[${SOURCE}] invoice.payment_failed`, {
          customer: toId(invoice.customer),
          invoice: invoice.id,
        });
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    // Return 500 so Stripe retries -- a transient DB error shouldn't be lost.
    console.error(`[${SOURCE}] handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
