'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { FONT_HEADING, FONT_BODY } from '../components/fonts';
// Only for sunsetHover. /login declares no hover fill for its CTA, because its
// own hover is the .uml-lift translate, and this flow is shadow free so it does
// not use that. Taken by reference from the brand palette rather than written as
// a fresh hex.
import { C } from '../components/curriculum-theme';
import { L, LOGIN_CSS } from '../login/login-theme';
import { StepIndicator } from './StepIndicator';
import { StartChrome, BAR_LABEL } from './StartChrome';
import {
  TRIAL_PRICE,
  TRIAL_PRICE_EXACT,
  RENEWAL_PRICE,
  TRIAL_DAYS,
} from './trial-price';

// Step 1 of the teacher onboarding flow: the $1 trial entry.
//
// ─── THE SKIN IS /login's, THE CONTENT IS UNCHANGED ─────────────────────────
//
// This surface used to carry its own palette in app/start/start-theme.ts: a
// Warm Sand ground, a Deep Midnight nav banner, and a link blue darkened to
// #2F6091 because Gemini failed AA on sand. All of that is gone. The flow now
// renders inside StartChrome, which is LoginChrome's structure, and every colour
// is a var(--uml-*) reference resolved by login-theme.ts. There are no hexes in
// this file.
//
// What that deletes, worth listing because each was a real decision that no
// longer has anything to decide:
//
//   the dark nav banner      -> L.bar, the same light bar /login uses
//   the Warm Sand ground     -> L.ground plus the 62px graph-paper grid
//   the #2F6091 link blue    -> L.amber, which /login already measured for its
//                               own ground at 4.58 light and 4.86 on card
//   the card fill and strip  -> L.card and L.cream, /login's own
//
// The two-state logic, the copy, the $30 disclosure placement, the DUE TODAY
// row and the CTA target are all untouched.
//
// ─── THE FLOAT IS A BORDER, NOT A SHADOW ─────────────────────────────────────
//
// The card reads as lifted off the page because a hard 1px rule sits between a
// flat fill and a visible grid, which is exactly how /login's cards do it. There
// is no box-shadow on the card and none should be added: the grid is what the
// border is contrasting against, so a shadow would be doing a second job that is
// already done and would break the flat panel system at the same time. Radius
// stays 0.
//
// ─── TWO STATES ──────────────────────────────────────────────────────────────
//
//   signed out  ->  "is this app going to work for me at all?"
//                   Sign in, and the district access branch for a teacher whose
//                   Workspace may block it.
//
//   signed in   ->  "what exactly am I agreeing to?"
//                   The checkout card: what is charged today, what is charged
//                   later, and the one button that starts it.
//
// PRESENTATION PLUS ONE BEHAVIOUR CHANGE, made earlier and unchanged here.
// /start used to bounce a signed out visitor to /login before rendering, so a
// "Continue with Google" button on it was impossible. NOTHING ABOUT ROLE OR
// PAYMENT MOVED: the teacher role is written only by
// app/lib/stripe-activation.ts:279 and app/teacher/welcome/page.tsx:137, both
// gated on a paid teacher plan, and /auth/callback ignores the role parameter on
// purpose. The gate that matters, profileGrants, still lives in the server
// component.

// ─── Prices ──────────────────────────────────────────────────────────────────
//
// Every figure comes from ./trial-price, which mirrors TRIAL_FEE_CENTS
// (stripe-activation.ts:439) and the Teacher Pro monthly amount
// (products.ts:94). No price is written literally in this file.
//
// THE $30 RENEWAL DISCLOSURE APPEARS ONCE PER VIEW, NEVER TWICE IN ONE:
//
//   signed out  ->  the fine print under the Google button. There is no card in
//                   this view, so it is the only place it can go.
//   signed in   ->  the third card bullet. The card states the full terms, so
//                   this view carries NO separate fine print line.

// The fourth copy of this mark in the tree, after SignIn, WelcomeClient and
// ClaimClient. Left as a copy rather than hoisted, because hoisting would mean
// editing three files this branch has no other reason to touch. Google's brand
// guidelines require the multi colour mark.
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={{ display: 'block' }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

/** The content column. 440px is SignIn.tsx's width, so the two screens line up
 *  when a teacher moves between them. */
const COLUMN = 440;

/** Shared by both states, so the CTA is one treatment with two targets.
 *  L.ctaInk is #111111 on L.cta #F0A33E at 9.00:1, which is /login's own pair. */
function ctaStyle(dimmed: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    padding: '15px 20px',
    borderRadius: 0,
    // The hard rule, as on every /login control.
    border: `1px solid ${L.creamLine}`,
    background: L.cta,
    color: L.ctaInk,
    font: `700 16px/1 ${FONT_BODY}`,
    textDecoration: 'none',
    cursor: dimmed ? 'default' : 'pointer',
    opacity: dimmed ? 0.7 : 1,
    boxSizing: 'border-box',
  };
}

/** The small tracked mono label. /login spells this the same way in its bar and
 *  footer; shared here so the strip and the DUE TODAY row cannot drift apart. */
const TRACKED: React.CSSProperties = {
  ...BAR_LABEL,
  letterSpacing: '0.12em',
  whiteSpace: 'normal',
};

// ─── The canceled notice ─────────────────────────────────────────────────────
//
// The cancel_url on the Checkout Session is /start?canceled=1, so this is load
// bearing rather than decoration: without it, backing out of Stripe returns the
// buyer to an unchanged page with no acknowledgement that nothing was charged.
function CanceledNotice() {
  return (
    <p
      style={{
        margin: '0 0 22px',
        padding: '11px 13px',
        border: `1px solid ${L.border}`,
        background: L.card,
        borderRadius: 0,
        font: `400 13px/1.6 ${FONT_BODY}`,
        color: L.ink2,
      }}
    >
      {`Your checkout was canceled and no charge was made. Whenever you're ready, the trial is right here.`}
    </p>
  );
}

// ─── Signed out: the front door ──────────────────────────────────────────────
function SignedOutView() {
  const [loading, setLoading] = useState(false);

  // Copied from WelcomeClient.tsx. Same provider, same callback route, same
  // shape, with `next` pointing back here so the server component re runs with a
  // session and renders the checkout card instead.
  //
  // `role=teacher` is set for parity with SignIn.tsx and WelcomeClient.tsx. It is
  // INERT at the callback, which ignores it on purpose, and is kept only so this
  // URL looks like the other two rather than becoming the odd one out.
  const handleGoogleLogin = async () => {
    setLoading(true);
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    callbackUrl.searchParams.set('next', '/start');
    callbackUrl.searchParams.set('role', 'teacher');

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* /login's own eyebrow, rule and all, rather than a second small-label
          treatment invented for this screen. */}
      {/* Was /login's <Eyebrow>. Swapped for the shared slim indicator so step 1
          and step 2 show progress the same way; an eyebrow on one screen and a
          progress track on the next reads as two different flows. */}
      <StepIndicator step={1} label="Start your trial" />

      <h1
        style={{
          margin: 0,
          font: `600 clamp(28px, 7vw, 34px)/1.15 ${FONT_HEADING}`,
          letterSpacing: '-0.02em',
          color: L.ink,
          textWrap: 'pretty',
        }}
      >
        {`Start your ${TRIAL_DAYS}-day trial for ${TRIAL_PRICE}`}
      </h1>

      <p style={{ margin: 0, font: `400 15px/1.65 ${FONT_BODY}`, color: L.ink2 }}>
        {/* A template literal rather than JSX text, and that is not style.
            Written as JSX text across two source lines, the space after the
            interpolated price is stripped by the JSX whitespace rules and the
            page renders "Just $1to start". Caught in the built page, not in
            review. Every price sentence here is composed in JS for that reason. */}
        {`Full teacher access. Just ${TRIAL_PRICE} to start, and we'll remind you before it renews.`}
      </p>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="um-start-cta"
        style={ctaStyle(loading)}
      >
        {/* The white chip. Square, like everything else on this surface. */}
        <span
          aria-hidden
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            background: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          <GoogleIcon />
        </span>
        {loading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      {/* THE RENEWAL DISCLOSURE FOR THIS VIEW, and the only copy of it here. A
          trial that converts has to say so before the buyer pays. The signed in
          view states the same terms in its card bullets instead. */}
      <p style={{ margin: 0, font: `400 13px/1.6 ${FONT_BODY}`, color: L.ink2 }}>
        {`You'll be charged ${TRIAL_PRICE} today, then ${RENEWAL_PRICE}/month unless you cancel. Cancel any time from your dashboard.`}
      </p>

      <hr style={{ margin: '8px 0 0', border: 'none', borderTop: `1px solid ${L.barLine}` }} />

      <a
        href="/start/access"
        style={{
          font: `700 14px/1.5 ${FONT_BODY}`,
          color: L.amber,
          textDecoration: 'none',
        }}
      >
        {/* Non-breaking space before the arrow. At 390px the line wraps and
            without it the arrow orphans onto a line of its own. */}
        {`First teacher from your district? Check access first →`}
      </a>

      {/* STATES A FACT, PROMISES NOTHING. This used to end with "if sign-in
          fails, we'll route you here automatically", which described behaviour
          that does not exist: a blocked sign in lands on /login with an error
          parameter the role selector never reads. The promise comes back when
          the routing ships in app/auth/callback, which this branch does not
          touch. */}
      <p style={{ margin: '-10px 0 0', font: `400 13px/1.6 ${FONT_BODY}`, color: L.ink2 }}>
        Some districts block new apps in Google Workspace.
      </p>
    </div>
  );
}

// ─── Signed in: the checkout card ────────────────────────────────────────────
function SignedInView() {
  const bullets = [
    `${TRIAL_PRICE} today`,
    `${TRIAL_DAYS} days of full Teacher Pro: dashboard, worksheets, exports, all of it`,
    // The renewal disclosure for this view, and the only copy of it here.
    `Then ${RENEWAL_PRICE}/month unless you cancel. Cancel anytime from your dashboard.`,
  ];

  return (
    <div
      style={{
        background: L.card,
        // THE FLOAT. A hard 1px rule between a flat fill and the graph paper
        // behind it, which is how every /login card lifts off the page. There is
        // no box-shadow here and there must not be one.
        border: `1px solid ${L.border}`,
        borderRadius: 0,
      }}
    >
      {/* ─── Header strip ─────────────────────────────────────────────────
          L.cream is /login's own Mercury Cream and it deliberately does NOT
          invert; L.creamInk stays #111111 in both themes, because the label's
          contrast is against the fill rather than the page. That is
          login-theme.ts's documented decision, reused rather than re-litigated. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '11px 20px',
          background: L.cream,
          borderBottom: `1px solid ${L.border}`,
          color: L.creamInk,
        }}
      >
        <span style={TRACKED}>TEACHER · PRO TRIAL</span>
        <span style={TRACKED}>{`${TRIAL_DAYS} DAYS`}</span>
      </div>

      <div style={{ padding: '26px 20px 22px' }}>
        {/* The price sits in the SAME ink as the rest of the headline. Orange is
            a fill, a CTA, a rule or a marker on this surface, never type. */}
        <h1
          style={{
            margin: '0 0 20px',
            font: `600 clamp(25px, 6vw, 30px)/1.18 ${FONT_HEADING}`,
            letterSpacing: '-0.02em',
            color: L.ink,
            textWrap: 'pretty',
          }}
        >
          {`Try Teacher Pro for ${TRIAL_PRICE}.`}
        </h1>

        <ul style={{ margin: '0 0 22px', padding: 0, listStyle: 'none' }}>
          {bullets.map((item) => (
            <li
              key={item}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 11,
                marginBottom: 11,
                font: `400 14px/1.6 ${FONT_BODY}`,
                color: L.ink,
              }}
            >
              {/* Marker use, which is a fill role and allowed. The 7px top nudge
                  sets the square on the first line's x-height. */}
              <span
                aria-hidden
                style={{
                  width: 7,
                  height: 7,
                  marginTop: 7,
                  background: L.cta,
                  flexShrink: 0,
                }}
              />
              {item}
            </li>
          ))}
        </ul>

        {/* ─── Due today ──────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 12,
            padding: '14px 0',
            borderTop: `1px solid ${L.barLine}`,
            borderBottom: `1px solid ${L.barLine}`,
            marginBottom: 20,
          }}
        >
          <span style={{ ...TRACKED, color: L.inkMono }}>DUE TODAY</span>
          <span
            style={{
              font: `600 20px/1 ${FONT_HEADING}`,
              letterSpacing: '-0.01em',
              color: L.ink,
            }}
          >
            {TRIAL_PRICE_EXACT}
          </span>
        </div>

        {/* Wired exactly as it has always been: a plain link, because
            /start/checkout owns Stripe session creation. Restyled only. */}
        <a href="/start/checkout" className="um-start-cta" style={ctaStyle(false)}>
          {`Start your ${TRIAL_DAYS}-day trial →`}
        </a>

        {/* Muted, deliberately not the amber link and never the orange: it is an
            escape hatch and must not compete with the CTA above it. */}
        <a
          href="/dashboard"
          className="um-start-quiet"
          style={{
            display: 'block',
            margin: '14px 0 0',
            textAlign: 'center',
            font: `400 13px/1.6 ${FONT_BODY}`,
            color: L.ink2,
            textDecoration: 'none',
          }}
        >
          Not now, go to the student dashboard instead
        </a>
      </div>
    </div>
  );
}

export default function StartClient({
  signedIn,
  canceled,
}: {
  signedIn: boolean;
  canceled: boolean;
}) {
  return (
    <>
      {/* /login's own stylesheet, imported rather than restated. It carries the
          --uml-* declarations for both themes, the two-tone focus ring, and the
          narrow-width rules. The .uml-lift hover classes come with it but are
          not used here: that hover paints a 4px hard offset shadow, and this
          flow is shadow free by decision. */}
      <style>{`
        ${LOGIN_CSS}
        .um-start, .um-start * { box-sizing: border-box; }
        .um-start h1, .um-start h2 { font-family: ${FONT_HEADING}; }
        .um-start { font-family: ${FONT_BODY}; }
        /* !important, and it is load bearing. Both the CTA and the quiet link
           set these properties as INLINE style props, and an inline declaration
           outranks every stylesheet rule at every specificity without it. An
           earlier revision had the hover rule with no !important and it silently
           never fired. Same trap and same fix as
           app/dashboard/dashboard-css.ts:43.

           Background only. No transform and no box-shadow, so the CTA brightens
           in place rather than lifting. */
        .um-start .um-start-cta:not(:disabled):hover { background: ${C.sunsetHover} !important; }
        .um-start .um-start-quiet:hover { color: ${L.ink} !important; }
      `}</style>

      <StartChrome>
        <div style={{ maxWidth: COLUMN, margin: '0 auto' }}>
          {canceled && <CanceledNotice />}
          {signedIn ? <SignedInView /> : <SignedOutView />}
        </div>
      </StartChrome>
    </>
  );
}
