"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { FONT_HEADING, FONT_BODY, FONT_BASE_CSS } from "../../components/fonts";

// Payment is already verified server-side by the time this renders, so this
// component only has two jobs: land the moment, then get them signed in so the
// server can match the receipt to an account.

const GOLD = "#C68A2F";
const NAVY = "#0F1E35";

// How long "Welcome, Founding Teacher!" holds before it hands off.
const GREETING_MS = 2000;
const FADE_MS = 600;

const PERKS = [
  "Class-wide misconception patterns",
  "Per-student strand breakdowns",
  "Roster join codes & email invites",
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

export default function WelcomeClient({ checkoutSessionId }: { checkoutSessionId: string }) {
  // "greeting" -> "signin". Reduced motion is handled entirely in CSS below:
  // what that setting asks us to drop is the movement, not the beat itself, so
  // the greeting still holds -- it just arrives without the rise-and-fade.
  const [phase, setPhase] = useState<"greeting" | "signin">("greeting");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase("signin"), GREETING_MS);
    return () => clearTimeout(t);
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Come back to this same URL after Google: the server component re-runs
    // with a session in hand and does the receipt-to-account match there.
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    callbackUrl.searchParams.set(
      "next",
      `/teacher/welcome?checkout_session_id=${encodeURIComponent(checkoutSessionId)}`
    );
    // Elevates the profile to the teacher role on the way back through.
    callbackUrl.searchParams.set("role", "teacher");

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        /* !important, and it is load-bearing: app/layout.tsx paints the body
           from an INLINE style prop, and an inline declaration outranks every
           stylesheet rule at every specificity unless the rule carries this.
           Without it the gutter falls back to --ec-bg, which is #F0EDE8 in
           light mode -- a cream band bouncing against a navy page. Same fix as
           app/teacher/worksheets/worksheet-theme.ts:290, and correct here for
           the same reason: one colour, no theme switch, nothing to recompute. */
        body { margin: 0; background: ${NAVY} !important; }
        ${FONT_BASE_CSS}
        @keyframes um-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .um-phase { animation: none !important; transition: none !important; }
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          background: NAVY,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          fontFamily: FONT_BODY,
        }}
      >
        {phase === "greeting" ? (
          <div
            className="um-phase"
            style={{
              textAlign: "center",
              animation: `um-rise ${FADE_MS}ms ease-out both`,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: `1px solid rgba(198,138,47,0.45)`,
                color: "#E7BE7B",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.4,
                padding: "3px 8px",
                borderRadius: 5,
                marginBottom: 24,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD }} />
              TEACHER · PRO
            </div>
            <h1
              style={{
                margin: 0,
                fontFamily: FONT_HEADING,
                fontWeight: 600,
                fontSize: "clamp(30px, 6vw, 44px)",
                letterSpacing: -0.6,
                color: "#fff",
                lineHeight: 1.15,
              }}
            >
              Welcome, Founding Teacher!
            </h1>
          </div>
        ) : (
          <div
            className="um-phase"
            style={{
              width: "100%",
              maxWidth: 440,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: `3px solid ${GOLD}`,
              borderRadius: 20,
              padding: "40px 36px 44px",
              animation: `um-rise ${FADE_MS}ms ease-out both`,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: `1px solid rgba(198,138,47,0.45)`,
                color: "#E7BE7B",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.4,
                padding: "3px 8px",
                borderRadius: 5,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD }} />
              PAYMENT CONFIRMED
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily: FONT_HEADING,
                fontWeight: 600,
                fontSize: "clamp(26px, 5vw, 32px)",
                letterSpacing: -0.5,
                color: "#fff",
                lineHeight: 1.15,
              }}
            >
              Let&apos;s get you signed in
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.7,
                maxWidth: 340,
              }}
            >
              &hellip;to give you access to your dashboard.
            </p>

            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                textAlign: "left",
              }}
            >
              {PERKS.map((perk) => (
                <div
                  key={perk}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    fontSize: 13.5,
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  <span style={{ color: GOLD, flexShrink: 0, display: "inline-flex" }}>
                    <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 9.5 7 13.5 15 5" />
                    </svg>
                  </span>
                  {perk}
                </div>
              ))}
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "#fff",
                color: "#1f1f1f",
                cursor: loading ? "default" : "pointer",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <GoogleIcon />
              {loading ? "Redirecting…" : "Continue with Google"}
            </button>

            <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
              Sign in with the same email you used at checkout.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
