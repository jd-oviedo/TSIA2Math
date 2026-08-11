import { redirect } from "next/navigation";
import { getStripe } from "../../lib/stripe";
import { createClient } from "../../lib/supabase-server";
import { createAdminClient } from "../../lib/supabase-admin";
import { activate } from "../../lib/stripe-activation";
import WelcomeClient from "./WelcomeClient";

// The Stripe SDK needs Node crypto, and the whole page turns on a query
// parameter, so there is nothing here to prerender.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Post-checkout landing page. Stripe's Payment Link "After payment" redirect
// sends the buyer here with ?checkout_session_id={CHECKOUT_SESSION_ID}.
//
// The buyer usually arrives SIGNED OUT: they can reach the Payment Link from
// the marketing site without ever touching this app, so there is no session to
// read and, on that path, no client_reference_id either (only the /upgrade
// redirect sets that, and /upgrade requires a login first). So the identity
// this page trusts is the one Stripe collected at checkout --
// customer_details.email -- matched against whoever completes Google sign-in.
// That is the same email fallback the webhook already uses to resolve a
// payment to an account.
//
// Order of operations:
//   1. no/unretrievable/unpaid session -> /teacher, never a false confirmation
//   2. paid + signed out               -> the intro animation and sign-in
//   3. paid + signed in + identity match -> activate, then /teacher
//   4. paid + signed in + no match     -> /teacher (someone else's receipt)
//
// /teacher is a safe destination in every failure case: its own gate sends a
// non-teacher to /dashboard and an unpaid teacher to /teacher/inactive, so
// nobody lands on a dashboard they have not paid for and nobody gets stuck.
export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_session_id?: string }>;
}) {
  const { checkout_session_id: checkoutSessionId } = await searchParams;

  if (!checkoutSessionId) redirect("/teacher");

  // --- 1. Verify the payment with Stripe --------------------------------
  // retrieve() is the whole point of the gate: the session id in the URL is
  // worthless on its own, and only Stripe can say whether it was paid. A
  // failure here is also how a key/mode mismatch surfaces (a test-mode key
  // cannot read a live-mode session), so log it rather than failing silently.
  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(checkoutSessionId);
  } catch (err) {
    console.error("[teacher/welcome] could not retrieve checkout session:", err);
    redirect("/teacher");
  }

  if (session.payment_status !== "paid") {
    console.warn(
      `[teacher/welcome] session ${checkoutSessionId} is ${session.payment_status}, not paid`
    );
    redirect("/teacher");
  }

  const paidEmail = session.customer_details?.email ?? session.customer_email ?? null;
  const clientReferenceId = session.client_reference_id ?? null;
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

  // --- 2. Signed out: show the welcome, then let them sign in -----------
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <WelcomeClient checkoutSessionId={checkoutSessionId} />;
  }

  // --- 3. Signed in: does this receipt belong to this account? ----------
  // client_reference_id is our own auth id when /upgrade set it, so it is the
  // strongest signal available -- but it is only ever present on the logged-in
  // purchase path, so it is a bonus match and never a requirement. Email is
  // the check that works for a buyer who came straight from the Payment Link.
  const referenceMatches = clientReferenceId !== null && clientReferenceId === user.id;
  const emailMatches =
    paidEmail !== null &&
    user.email != null &&
    paidEmail.trim().toLowerCase() === user.email.trim().toLowerCase();

  if (!referenceMatches && !emailMatches) {
    console.warn(
      `[teacher/welcome] session ${checkoutSessionId} does not match signed-in user ${user.id}`
    );
    redirect("/teacher");
  }

  // --- 4. Matched: grant access -----------------------------------------
  // The webhook normally does this, but it is the same decision made from the
  // same evidence, and it must not depend on webhook delivery -- the buyer is
  // standing here now. activate() only ever moves a profile forward, so
  // running both is harmless.
  const admin = createAdminClient();

  // They bought a teacher product, so make sure the role matches before the
  // /teacher gate reads it -- otherwise a buyer whose profile is still
  // 'student' gets bounced to /dashboard right after paying.
  await admin.from("profiles").update({ role: "teacher" }).eq("id", user.id);
  await activate(admin, user.id, customerId, user.email ?? null, "teacher/welcome");

  redirect("/teacher");
}
