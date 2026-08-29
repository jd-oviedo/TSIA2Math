"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { FONT_HEADING, FONT_BODY, FONT_BASE_CSS } from "../components/fonts";
import { MOTION_CSS } from '../motion';

// The signed-out half of /claim: get them into a Google account so the server
// component can hand the purchase to it.
//
// SAME BOUNCE AS WelcomeClient, WITH TWO DELIBERATE DIFFERENCES.
//
//   1. NO `role=teacher` ON THE CALLBACK. WelcomeClient sets it because it only
//      ever runs on a teacher purchase. This page runs on all four products, and
//      a Practice Pass buyer promoted to teacher would get join codes and roster
//      access over other people's students. The role is not needed here anyway:
//      the claim replays through writeEntitlement, whose guarded UPDATE promotes
//      on a teacher plan and only on a teacher plan.
//
//   2. NO "TEACHER · PRO" AND NO "Founding Teacher". Same reason. This screen
//      does not know yet what was bought, and decorating it with the top tier
//      would be a promise to a $49 buyer.
//
// There is also no greeting beat. WelcomeClient earns one because it is the
// moment after paying; someone arriving here is recovering from a purchase that
// did not land, and the kind thing is to be quick.

const GOLD = "#C68A2F";
const NAVY = "#0F1E35";

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

export default function ClaimClient({ checkoutSessionId }: { checkoutSessionId: string }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Come back to this same URL after Google: the server component re-runs with
    // a session in hand and does the claim there. The session id rides in `next`
    // rather than in any state we would have to store.
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    callbackUrl.searchParams.set(
      "next",
      `/claim?checkout_session_id=${encodeURIComponent(checkoutSessionId)}`
    );

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
        /* ─── THE LOCAL @keyframes um-rise IS GONE ────────────────────────
           It was one of three byte-identical copies (ClaimClient, ClaimResult
           and WelcomeClient). @keyframes are global BY NAME regardless of which
           <style> defines them, so those three were never three scoped
           animations -- they were one name defined three times, and it only
           stayed harmless because the bodies happened to agree.

           MOTION_CSS's um-fade-up has the same body, so this is a rename and
           not a retune:

             um-rise      from { opacity: 0; transform: translateY(10px); }
             um-fade-up   from { opacity: 0; transform: translateY(var(--um-rise)); }

           AND THAT var() IS WHY THE WHOLE OF MOTION_CSS IS EMITTED HERE rather
           than just the keyframe. --um-rise is declared in MOTION_CSS's :root
           block and it is 10px. Without that block the var would not resolve,
           the 'transform' in the 'from' frame would compute to none, and the
           element would fade in with no rise at all -- a silent half-migration
           that looks almost right.

           The rest of MOTION_CSS is inert on this page: every other rule in it
           is a strict descendant of .um-motion, which this tree does not carry.
           The entrance below stays an inline 'animation' shorthand with the
           literal 'ease-out', NOT var(--um-ease-out) -- those are two different
           curves (0,0,.58,1 against .4,0,.2,1) and swapping them would be a
           retune. */
        ${MOTION_CSS}
        @media (prefers-reduced-motion: reduce) {
          .um-phase { animation: none !important; }
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
            animation: "um-fade-up 600ms ease-out both",
          }}
        >
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
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD }} />
            PURCHASE FOUND
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
            Sign in to claim it
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
            We&apos;ll add your purchase to whichever Google account you sign in with.
          </p>

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

          {/* The opposite of WelcomeClient's "use the same email you used at
              checkout". That instruction is wrong here and actively harmful: the
              buyer this page exists for is precisely the one whose checkout
              email cannot become an account. */}
          <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
            It does not have to be the email you used at checkout.
          </p>
        </div>
      </main>
    </>
  );
}
