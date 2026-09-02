import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import { createAdminClient } from "../lib/supabase-admin";
import { profileGrants } from "../lib/auth";
import StartClient from "./StartClient";

export const dynamic = "force-dynamic";

// The $1-trial start page: the app-side entry the marketing CTA links to, and
// step 1 of the teacher onboarding flow.
//
// Account first, then money. A district OAuth block surfaces here, before
// payment, not after. That principle is unchanged; what changed is that the page
// now hosts the sign-in itself instead of delegating it.
//
// ─── THE GATE THAT WAS REMOVED, AND WHY IT WAS SAFE ──────────────────────────
//
// This page used to open with:
//
//     if (!user) {
//       redirect(loginHref("/start", "teacher"));
//     }
//
// so a signed out visitor never saw it. That is now gone, and the page renders
// for everyone. Three things make that safe, and they are worth stating because
// "a logged out visitor can now reach the page that sells something" is the
// obvious worry:
//
//   1. IT GRANTED NOTHING. The redirect sent people to /login, and /login does
//      not assign the teacher role either. It branches on ?role only to choose
//      which screen to render (app/login/page.tsx:19-20). /auth/callback receives
//      the same parameter and deliberately ignores it, under a comment block that
//      records the day it stopped being a profile write.
//
//   2. ROLE IS WRITTEN IN EXACTLY TWO PLACES, both gated on a paid teacher plan:
//      app/lib/stripe-activation.ts:279, inside the guarded entitlement UPDATE,
//      and app/teacher/welcome/page.tsx:137, after a verified checkout. Neither
//      is reachable from this page. Signing in here produces an ordinary account
//      with no entitlement, which is exactly what signing in at /login produced.
//
//   3. THE GATE THAT ACTUALLY MATTERS IS STILL HERE. profileGrants below still
//      runs server side against the service-role client, and /start/checkout
//      repeats it independently before creating a Stripe session. An unentitled
//      visitor reaching this page can do precisely one thing they could always
//      do: start a checkout.
//
// Nothing about checkout, Stripe wiring, success_url or the charged amount is
// touched by this file.
//
// ?canceled=1 is the Checkout Session's cancel_url. Same page, one extra line
// saying no charge was made, so backing out of Stripe never loops into a fresh
// checkout.
export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { canceled } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // An already-entitled teacher has nothing to buy here. Only meaningful for a
  // signed in visitor, so the admin round trip is skipped entirely when there is
  // no session to check.
  if (user) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("plan, plan_status, access_until, stripe_payment_link_id, subscription_status")
      .eq("id", user.id)
      .maybeSingle();
    if (profile && profileGrants(profile, "teacher-dashboard", "start")) {
      redirect("/teacher");
    }
  }

  return <StartClient signedIn={user !== null} canceled={canceled === "1"} />;
}
