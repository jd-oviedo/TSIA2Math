import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import { createAdminClient } from "../lib/supabase-admin";
import { profileGrants } from "../lib/auth";
import { loginHref } from "../lib/next-param";
import { FONT_HEADING, FONT_BODY, FONT_BASE_CSS } from "../components/fonts";

export const dynamic = "force-dynamic";

// The $1-trial start page: the app-side entry the marketing CTA links to.
//
// Account first, then money — a district OAuth block surfaces here, before
// payment, not after. Signed out goes to the teacher sign-in with a return to
// this page; signed in renders one button and the terms stated plainly. The
// button links to /start/checkout, which is where the Stripe session is
// actually created; see the note there for why the two are separate routes.
//
// ?canceled=1 is the Checkout Session's cancel_url. Same page, one extra line
// saying no charge was made, so backing out of Stripe never loops into a
// fresh checkout.
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
  if (!user) {
    redirect(loginHref("/start", "teacher"));
  }

  // An already-entitled teacher has nothing to buy here.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("plan, plan_status, access_until, subscription_status")
    .eq("id", user.id)
    .maybeSingle();
  if (profile && profileGrants(profile, "teacher-dashboard", "start")) {
    redirect("/teacher");
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        /* !important for the same reason as /teacher/inactive: app/layout.tsx
           paints the body from an INLINE style prop, and only !important
           outranks an inline declaration. One colour, no theme switch. */
        body { margin: 0; background: #0F1E35 !important; }
        ${FONT_BASE_CSS}
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "#0F1E35",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          fontFamily: FONT_BODY,
        }}
      >
        <div style={{ maxWidth: 480, width: "100%" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid rgba(198,138,47,0.45)",
              color: "#E7BE7B",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1.4,
              padding: "3px 8px",
              borderRadius: 5,
              marginBottom: 24,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C68A2F" }} />
            TEACHER · PRO TRIAL
          </div>

          <h1
            style={{
              margin: "0 0 16px",
              fontFamily: FONT_HEADING,
              fontWeight: 600,
              fontSize: 34,
              letterSpacing: -0.5,
              color: "#fff",
              lineHeight: 1.15,
            }}
          >
            Try Teacher Pro for $1.
          </h1>

          {canceled === "1" && (
            <p
              style={{
                margin: "0 0 20px",
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                padding: "10px 14px",
                lineHeight: 1.6,
              }}
            >
              Your checkout was canceled — no charge was made. Whenever you&apos;re ready, the
              trial is right here.
            </p>
          )}

          {/* The terms, stated plainly before any money moves. */}
          <ul
            style={{
              margin: "0 0 28px",
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {[
              "$1 today",
              "7 days of full Teacher Pro — dashboard, worksheets, exports, all of it",
              "Then $30/month unless you cancel. Cancel anytime from your dashboard.",
            ].map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.6,
                }}
              >
                <span style={{ color: "#C68A2F", marginTop: 2, flexShrink: 0 }}>—</span>
                {item}
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* A plain link, not a form: /start/checkout owns session creation. */}
            <a
              href="/start/checkout"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#C68A2F",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 15,
                padding: "13px 24px",
                borderRadius: 10,
              }}
            >
              Start your 7-day trial →
            </a>
            <a
              href="/dashboard"
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
              }}
            >
              Not now — go to the student dashboard instead
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
