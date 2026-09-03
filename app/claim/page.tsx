import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import { createAdminClient } from "../lib/supabase-admin";
import { claimPending } from "../lib/pending-entitlements";
import { claimRateLimit, safeLimit } from "../lib/rate-limit";
import { isEntitledWithLegacyFallback } from "../lib/entitlement";
import ClaimClient from "./ClaimClient";
import ClaimResult, { destinationFor } from "./ClaimResult";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// THE URL IS A BEARER TOKEN. Keep it out of search results and out of the
// Referer header on any link the buyer clicks from here.
export const metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};

// Hand a captured purchase to whoever signs in with its checkout session id.
//
// WHY THIS EXISTS SEPARATELY FROM /teacher/welcome, WHICH IT OTHERWISE MIRRORS.
// The welcome page matches a Stripe session against the signed-in user's EMAIL.
// That check is exactly what makes it useless for the buyer this route serves:
// sign-in is Google-only, so a buyer whose checkout email is not a Google
// address can never produce a matching account, and no amount of waiting will
// change that. Confirmed live, with a real $49 Practice Pass on 2026-08-19.
//
// So this page deliberately performs NO identity match. Presenting the session
// id IS the claim. That is a real trade and it is made with eyes open: the
// compensating controls are that the id is ~60 random characters that only
// reach the buyer through Stripe's own success URL, that a row can be claimed
// once, that the attempt is rate limited on the user id, and that a conflicting
// claim raises an alert.
//
// AND NO STRIPE RETRIEVE, WHICH IS THE OTHER DIFFERENCE FROM /teacher/welcome.
// That page has to call Stripe because a session id off a URL is worthless on
// its own -- only Stripe can say whether it was paid. Here the pending row is
// the proof: it exists only because a signature-verified webhook wrote it. A
// retrieve would add a network dependency, a failure mode, and a live-vs-test
// key trap, to re-learn something already established.
//
// Order of operations:
//   1. no session id     -> /dashboard, which gates itself
//   2. signed out        -> the Google bounce, back to this same URL
//   3. signed in         -> rate limit, then claim, then say what happened
//   4. nothing owed      -> if their own row is already live, the dashboard;
//                           otherwise the not-found card, as the last resort

// The columns the shared predicate needs, and nothing else. `plan` rides along
// only to pick the destination.
const OWN_ROW_COLUMNS = "plan, plan_status, access_until, stripe_payment_link_id, subscription_status";

type OwnRow = {
  plan: string | null;
  plan_status: string | null;
  access_until: string | null;
  stripe_payment_link_id: string | null;
  subscription_status: string | null;
};

/**
 * Where a signed-in buyer with nothing owed should land, or null to show the
 * not-found card.
 *
 * THE CASE THIS CLOSES. A buyer who went through /upgrade was signed in when
 * they paid, so the webhook matched them on client_reference_id and wrote the
 * entitlement straight onto their profile. No pending row was ever needed. The
 * /success page still hands them the claim link, and this page then found no
 * row and told them "we don't have a purchase for this link" while their
 * access was live. Confirmed for the $5 tripwire, the first product sold only
 * through /upgrade.
 *
 * AFTER THE PENDING LOOKUP, NEVER INSTEAD OF IT. The pending row is the proof
 * of a purchase that has not landed, and a buyer holding an older live pass
 * who just bought a newer one must have the newer one applied, not be sent to
 * a dashboard showing the old one. So claimPending runs first and its answer
 * wins; this only decides what "nothing owed" means for someone who already
 * has access. Reading the caller's OWN row reveals nothing they cannot see on
 * their dashboard, and the signed-out branch above is untouched, so no purchase
 * state is exposed before sign-in.
 *
 * PLAN-AGNOSTIC. The shared predicate, not planGrants: the question is "do
 * they hold anything live", and a Practice Pass holder who was told NOT FOUND
 * would be as confused as a Full Course one. planGrants is not consulted at
 * all; the destination comes from destinationFor, the same rule the card's own
 * Continue button follows.
 *
 * A READ ERROR FALLS THROUGH TO THE CARD. It is the state the page showed
 * before this existed, and the card already tells them to refresh.
 */
async function landingForEntitled(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<string | null> {
  const { data, error } = await admin
    .from("profiles")
    .select(OWN_ROW_COLUMNS)
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error(`[claim] could not read ${userId} after a nothing-owed claim:`, error.message);
    return null;
  }
  if (!data) return null;
  const row = data as OwnRow;
  const live = isEntitledWithLegacyFallback(
    row.plan_status,
    row.access_until,
    row.stripe_payment_link_id,
    row.subscription_status,
    "claim/nothing-owed"
  );
  if (!live) return null;
  return destinationFor(row.plan).href;
}
export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_session_id?: string }>;
}) {
  const { checkout_session_id: checkoutSessionId } = await searchParams;

  // No id means there is nothing to claim and no way to find out what was meant.
  // /dashboard is safe: it sends a signed-out visitor to /login and a signed-in
  // one to whatever they actually have.
  if (!checkoutSessionId) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed out. Nothing is looked up and nothing is claimed until there is an
  // account to claim onto -- in particular the page does not reveal whether this
  // id corresponds to a real purchase before sign-in, which would turn it into
  // an oracle for probing ids.
  if (!user) {
    return <ClaimClient checkoutSessionId={checkoutSessionId} />;
  }

  // Keyed on the user id, which exists by here. Fails OPEN, like every other
  // caller: a Redis outage must not stand between a buyer and the purchase they
  // already paid for.
  const { success } = await safeLimit(claimRateLimit, user.id);
  if (!success) {
    console.warn(`[claim] rate limited ${user.id}`);
    return <ClaimResult outcome="rate-limited" plan={null} />;
  }

  // Exactly one result: a session-id claim considers at most one row.
  const admin = createAdminClient();
  const [result] = await claimPending(admin, user.id, { sessionId: checkoutSessionId });

  // Only the not-found outcome asks the second question. Every other outcome is
  // an answer about THIS purchase and is shown as-is.
  if (result.outcome === "nothing-owed") {
    const landing = await landingForEntitled(admin, user.id);
    if (landing) redirect(landing);
  }

  return <ClaimResult outcome={result.outcome} plan={result.plan} />;
}
