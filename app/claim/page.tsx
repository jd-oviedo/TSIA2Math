import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import { createAdminClient } from "../lib/supabase-admin";
import { claimPending } from "../lib/pending-entitlements";
import { claimRateLimit, safeLimit } from "../lib/rate-limit";
import ClaimClient from "./ClaimClient";
import ClaimResult from "./ClaimResult";

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

  return <ClaimResult outcome={result.outcome} plan={result.plan} />;
}
