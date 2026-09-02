import { redirect } from "next/navigation";
import Link from "next/link";
import { getStripe } from "../../lib/stripe";
import { createClient } from "../../lib/supabase-server";
import { createAdminClient } from "../../lib/supabase-admin";
import { profileGrants } from "../../lib/auth";
import { subscriptionPeriodEnd } from "../../lib/products";
import { teacherTierLabel } from "../../lib/capabilities";
import { BodyGround } from "../../components/BodyGround";
import { DASH } from "../../components/dashboard-theme";
import { FONT_HEADING, FONT_BODY, FONT_BASE_CSS } from "../../components/fonts";
import { liveSubscriptionFor } from "./subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The one final screen before a cancellation, and the home of the Core
// save-offer. Three options, each one click, equally prominent — "cancel
// anyway" is a peer of the other two, not a hedge behind a wall, because
// cancelling must stay as easy as signing up.
//
// Same server-side gate as /teacher/settings: session, teacher role, live
// teacher plan. A trialing teacher passes (trialing grants), which is the
// point — this page's main audience is day-4 trialists arriving from the
// reminder email.
//
// Everything this page STATES is read live from Stripe, not from the profile:
// the price, the renewal date, whether a cancellation is already scheduled.
// The profile lags Stripe by a webhook on its best day, and a page about
// money must not render its lag.

function fmt(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { timeZone: "America/Chicago", dateStyle: "long" });
}

function usd(cents: number | null | undefined): string {
  if (cents == null) return "";
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

const CARD: React.CSSProperties = {
  background: "#fff",
  border: "1px solid rgba(15,30,53,0.07)",
  borderRadius: 12,
  boxShadow: "0 1px 2px rgba(15,30,53,0.04)",
  padding: "18px 20px",
};

const BUTTON: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  border: "none",
  cursor: "pointer",
  fontFamily: FONT_BODY,
  fontWeight: 700,
  fontSize: 14.5,
  padding: "12px 20px",
  borderRadius: 10,
  textDecoration: "none",
};

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; error?: string }>;
}) {
  const { done, error } = await searchParams;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login?role=teacher&next=" + encodeURIComponent("/teacher/cancel"));
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select(
      "plan, plan_status, access_until, stripe_payment_link_id, subscription_status, role, stripe_customer_id"
    )
    .eq("id", session.user.id)
    .single();

  if (!profile || profile.role !== "teacher") redirect("/dashboard");
  if (!profileGrants(profile, "teacher-dashboard", "teacher/cancel")) {
    redirect("/teacher/inactive");
  }

  // --- Confirmation states: no Stripe round trip needed ---------------------
  if (done === "canceled" || done === "core") {
    const accessUntil = profile.access_until ? new Date(profile.access_until) : null;
    return (
      <Shell>
        <h1 style={H1}>{done === "core" ? "You're on Teacher Core" : "Canceled"}</h1>
        <div style={CARD}>
          <p style={{ margin: 0, fontSize: 14, color: "#3a3a3a", lineHeight: 1.65 }}>
            {done === "core"
              ? "Your plan is now Teacher Core at $20/month. Same dashboard, assignments, grades, and official scores; CSV exports are Pro-only and worksheets cap at 15 a month."
              : `Your subscription is set to cancel${accessUntil ? ` on ${fmt(accessUntil)}` : ""}. You keep full access until then, and there are no further charges.`}
          </p>
        </div>
        <Link href="/teacher" style={{ ...BUTTON, background: "#0F1E35", color: "#fff", marginTop: 16 }}>
          Back to your dashboard
        </Link>
      </Shell>
    );
  }

  // --- The live facts -------------------------------------------------------
  const customerId: string | null = profile.stripe_customer_id ?? null;
  if (!customerId) redirect("/teacher/billing");

  const sub = await liveSubscriptionFor(getStripe(), customerId);
  if (!sub) redirect("/teacher/billing");

  const item = sub.items.data[0] ?? null;
  const priceCents = item?.price?.unit_amount ?? null;
  const label = teacherTierLabel(profile.plan) === "CORE" ? "Teacher Core" : "Teacher Pro";
  const isTrial = sub.status === "trialing";
  const endsAt = isTrial && sub.trial_end
    ? new Date(sub.trial_end * 1000)
    : subscriptionPeriodEnd(sub);
  const canSwitch =
    item != null &&
    item.price.id === process.env.STRIPE_TEACHER_PRO_MONTHLY_PRICE_ID &&
    profile.plan !== "teacher-core";

  // Already scheduled to cancel: nothing here to do twice.
  if (sub.cancel_at_period_end) {
    return (
      <Shell>
        <h1 style={H1}>Already canceled</h1>
        <div style={CARD}>
          <p style={{ margin: 0, fontSize: 14, color: "#3a3a3a", lineHeight: 1.65 }}>
            Your {label} subscription is already set to cancel
            {endsAt ? ` on ${fmt(endsAt)}` : ""}. You keep full access until then. Changed your
            mind? You can resume it from the{" "}
            <a href="/teacher/billing" style={{ color: "#C68A2F", fontWeight: 600 }}>
              billing portal
            </a>
            .
          </p>
        </div>
        <Link href="/teacher" style={{ ...BUTTON, background: "#0F1E35", color: "#fff", marginTop: 16 }}>
          Back to your dashboard
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 style={H1}>Before you go</h1>
      <p style={{ margin: "0 0 20px", fontSize: 13.5, color: "#5F5E5A", lineHeight: 1.6 }}>
        {isTrial
          ? `Your ${label} trial ends ${fmt(endsAt)} — after that it's ${usd(priceCents)}/month.`
          : `Your ${label} plan renews ${fmt(endsAt)} at ${usd(priceCents)}/month.`}
      </p>

      {error && (
        <div style={{ ...CARD, borderColor: "#c65f2f", marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 13.5, color: "#8a3a1a", lineHeight: 1.6 }}>
            {error === "notpro"
              ? "This subscription isn't on the standard Teacher Pro monthly price, so it can't be switched here. Nothing was changed."
              : "Something went wrong talking to Stripe. Nothing was changed — try again, or reply to any of our emails."}
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* 1. Stay */}
        <div style={CARD}>
          <p style={OPTION_HEAD}>Keep {label}</p>
          <p style={OPTION_BODY}>Nothing changes. Head back to your dashboard.</p>
          <Link href="/teacher" style={{ ...BUTTON, background: "#0F1E35", color: "#fff" }}>
            Keep my plan
          </Link>
        </div>

        {/* 2. The save-offer, shown only for the standard Pro monthly price:
            an annual or founding subscription must never be repriced here. */}
        {canSwitch && (
          <div style={CARD}>
            <p style={OPTION_HEAD}>Switch to Teacher Core — $20/month</p>
            <p style={OPTION_BODY}>
              Same dashboard, assignments, grades, and official scores. CSV exports are Pro-only,
              and worksheets cap at 15 a month. Applies right away; your next charge is $20.
            </p>
            <form method="post" action="/teacher/cancel/switch">
              <button type="submit" style={{ ...BUTTON, background: "#C68A2F", color: "#fff" }}>
                Switch to Core
              </button>
            </form>
          </div>
        )}

        {/* 3. Cancel: one click, a peer of the others, no wall. */}
        <div style={CARD}>
          <p style={OPTION_HEAD}>Cancel my subscription</p>
          <p style={OPTION_BODY}>
            One click. You keep full access until {fmt(endsAt)}, and there are no further charges.
          </p>
          <form method="post" action="/teacher/cancel/confirm">
            <button
              type="submit"
              style={{ ...BUTTON, background: "#fff", color: "#8a3a1a", border: "1px solid #c65f2f" }}
            >
              Cancel anyway
            </button>
          </form>
        </div>
      </div>
    </Shell>
  );
}

const H1: React.CSSProperties = {
  margin: "0 0 6px",
  fontFamily: FONT_HEADING,
  fontWeight: 600,
  fontSize: 27,
  letterSpacing: -0.4,
  color: "#0F1E35",
};

const OPTION_HEAD: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: 15,
  fontWeight: 700,
  color: "#0F1E35",
};

const OPTION_BODY: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 13.5,
  color: "#5F5E5A",
  lineHeight: 1.6,
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; -webkit-font-smoothing: antialiased; }
        ${FONT_BASE_CSS}
      `}</style>
      <BodyGround color={DASH.pageBg} />
      <div style={{ minHeight: "100vh", background: DASH.pageBg, fontFamily: FONT_BODY, color: "#1A1A1A" }}>
        <header style={{ background: "#fff", borderBottom: "1px solid rgba(15,30,53,0.08)", padding: "0 28px", minHeight: 60, display: "flex", alignItems: "center" }}>
          <Link
            href="/teacher"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#0F1E35", textDecoration: "none" }}
          >
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 4 6 9 11 14" /></svg>
            Back to dashboard
          </Link>
        </header>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 60px" }}>{children}</div>
      </div>
    </>
  );
}
