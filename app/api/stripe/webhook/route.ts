import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "../../../lib/stripe";
import { createAdminClient } from "../../../lib/supabase-admin";
import {
  alertUnlinkedCustomer,
  entitlementFromCheckout,
  findUserIdByEmail,
  legacyActivateOnly,
  linkCustomerId,
  writeEntitlement,
} from "../../../lib/stripe-activation";
import {
  entitlementFromSubscription,
  productForPaymentLink,
  type Plan,
  type PlanTerm,
} from "../../../lib/products";
import {
  recordPendingEntitlement,
  type RecordOutcome,
} from "../../../lib/pending-entitlements";
import { sendUnmatchedCheckoutAlert, type UnmatchedCheckoutCapture } from "../../../lib/email";
import * as Sentry from "@sentry/nextjs";

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

        // HOISTED ABOVE THE NO-PROFILE BRANCH, and that is the whole shape of
        // the fix. Both branches need the same thing -- the entitlement this
        // purchase earns -- and they must not compute it two different ways. The
        // matched branch writes it to a profile; the unmatched branch stores it
        // until there is a profile to write it to. One derivation, consumed
        // twice.
        //
        // It costs a Stripe subscriptions.retrieve on the subscription path,
        // which already ran on every matched checkout. It now also runs on an
        // unmatched one, which is exactly the call that makes the purchase
        // recoverable rather than lost.
        const write = await entitlementFromCheckout(stripe, session, eventCreatedMs, SOURCE);

        if (!profileId) {
          // THE MONEY WAS TAKEN AND NO ACCOUNT COULD BE FOUND.
          //
          // All three resolution steps failed: no profile with that
          // client_reference_id, no profile carrying that Stripe customer, and
          // no auth user with that email. Nothing here creates an account.
          //
          // This used to be where the purchase died -- alert, return 200, write
          // nothing, no retry -- and it did, live, with a real $49 Practice Pass
          // on 2026-08-19. Part 1 made that visible in three channels.
          // Visibility is not recovery. Now the purchase is CAPTURED, and the
          // buyer claims it at /claim or at their next sign-in.
          console.error(`[${SOURCE}] no profile match for checkout session`, {
            email,
            customerId,
            clientReferenceId,
            paymentLink,
          });

          const product = productForPaymentLink(paymentLink);

          // CAPTURE FIRST, THEN ALERT, so the alert can say which of these
          // actually happened. The old copy asserted flatly that the buyer had
          // nothing, which is now false in the ordinary case and false in the
          // direction that sends a person chasing a refund by hand.
          //
          // A failure here is held rather than thrown, so that the alert still
          // goes out, and rethrown below once it has. An unreported capture
          // failure is the original bug again.
          let capture: UnmatchedCheckoutCapture;
          let recordError: unknown = null;

          if (!write) {
            // Unrecognised Payment Link AND no profile. There is no plan to
            // name, and plan is NOT NULL on pending_entitlements for the same
            // reason profiles_plan_pairing_check exists: half an entitlement is
            // worse than none. This double failure keeps the old behaviour --
            // alert, and require a human.
            capture = "unrecognised-link";
          } else {
            try {
              const recorded: RecordOutcome = await recordPendingEntitlement(admin, {
                write,
                checkoutSessionId: session.id,
                email,
                customerId,
                eventCreatedMs,
                source: SOURCE,
              });
              capture = recorded;
            } catch (err) {
              capture = "failed";
              recordError = err;
              console.error(`[${SOURCE}] FAILED TO CAPTURE AN UNMATCHED PAID CHECKOUT`, err);
            }
          }

          Sentry.captureMessage("stripe: paid checkout matched no account", {
            // A captured purchase is recoverable and a lost one is not, so they
            // do not deserve the same severity. Both still raise an issue.
            level: capture === "recorded" || capture === "duplicate" ? "warning" : "error",
            tags: { source: SOURCE, payment_link: paymentLink ?? "none", capture },
            extra: {
              checkoutSessionId: session.id,
              email,
              customerId,
              hadClientReferenceId: Boolean(clientReferenceId),
              product: product?.label ?? null,
              amountTotal: session.amount_total,
              currency: session.currency,
            },
          });

          // Never allowed to change the response. A failed alert must not turn a
          // capture into a 500, and it must not mask the failure either, so it
          // is logged loudly.
          try {
            await sendUnmatchedCheckoutAlert({
              checkoutSessionId: session.id,
              email,
              paymentLinkId: paymentLink,
              productLabel: product?.label ?? null,
              amountTotal: session.amount_total,
              currency: session.currency,
              hadClientReferenceId: Boolean(clientReferenceId),
              capture,
            });
          } catch (err) {
            console.error(`[${SOURCE}] UNMATCHED-CHECKOUT ALERT FAILED TO SEND`, err);
          }

          // 200 WAS RIGHT WHEN THERE WAS NOWHERE TO PUT THE PURCHASE. Retrying
          // an event that cannot resolve on its own was a lottery on whether the
          // buyer happened to sign up inside the window. That premise expired
          // the moment pending_entitlements existed: a failed insert is the
          // purchase lost a second time, and a transient database error is
          // exactly what Stripe's ~3 day retry window is for.
          //
          // Only a CAPTURE FAILURE retries. An unresolvable identity still
          // returns 200, because no number of retries will conjure an account.
          if (recordError) throw recordError;

          break;
        }

        const linked = await linkCustomerId(admin, profileId, customerId);

        if (!write) {
          // An unknown Payment Link. Never leave a payer with nothing: fall back
          // to exactly the pre-Phase-3 behaviour, loudly.
          //
          // No unlinked-customer alert on this path even if the link was
          // declined: with no plan there is no term, so the collision cannot be
          // classified, and legacyActivateOnly is already shouting about a
          // bigger problem.
          await legacyActivateOnly(
            admin,
            profileId,
            SOURCE,
            `unrecognised payment link ${paymentLink ?? "(none)"}`
          );
          break;
        }

        const written = await writeEntitlement(admin, profileId, write, eventCreatedMs, SOURCE);

        // A MATCHED PURCHASE CAN STILL LOSE ITS CUSTOMER ID, and nothing else
        // notices.
        //
        // A teacher already carrying cus_A buys again through /upgrade with a
        // different checkout email. Stripe makes cus_B. client_reference_id
        // matches them, so the entitlement lands and the purchase looks entirely
        // fine -- but linkCustomerId is first-writer-wins, cus_A stays, and cus_B
        // is stored nowhere. Every renewal for cus_B then resolves to nobody and
        // the teacher lapses looking like an ordinary expiry.
        //
        // There is no pending row here, so none of the claim-path machinery sees
        // it. profiles holds one stripe_customer_id and one profile genuinely
        // cannot hold two Stripe customers, so this reports rather than repairs.
        //
        // GATED ON A WRITE THAT ACTUALLY LANDED, which buys two things: a stale
        // redelivery does not re-alert for a collision its first delivery already
        // reported, and a profileId that resolved through auth.users without a
        // profiles row cannot produce a false positive, because that returns
        // "stale" too.
        //
        // Cannot throw and cannot change the response. Failing to link is not
        // worth a 500 and a retry storm.
        if (written === "written" && linked === "already-linked") {
          await alertUnlinkedCustomer({
            profileId,
            customerId,
            plan: write.plan,
            planTerm: write.planTerm,
            checkoutSessionId: session.id,
            email,
            source: SOURCE,
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = toId(sub.customer);
        const profileId = await resolveProfileId(admin, stripe, { customerId });
        if (!profileId) {
          // THE SAME SILENT DROP AS THE CHECKOUT BRANCH, with a different and
          // slower consequence.
          //
          // This is a RENEWAL or a cancellation. If the customer cannot be
          // resolved, access_until simply stops advancing, and the teacher lapses
          // at the end of the period they last paid for, with nothing anywhere to
          // explain why. Unlike the checkout case there is no moment of obvious
          // failure: it looks exactly like an expiry.
          //
          // No email here, deliberately. This event carries no checkout session,
          // no payment link and no amount, so the alert would say little more
          // than "a customer id did not resolve", and a renewal storm would send
          // one per event. A Sentry issue groups them and carries the customer
          // id, which is the thing worth chasing.
          console.error(`[${SOURCE}] no profile match for ${event.type}`, { customerId });

          Sentry.captureMessage("stripe: subscription event matched no account", {
            level: "error",
            tags: { source: SOURCE, stripe_event: event.type },
            extra: { customerId, subscriptionId: sub.id, status: sub.status },
          });

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
