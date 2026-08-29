'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/useTheme';
import { useBodyBackground } from '../components/useBodyBackground';
import { FONT_HEADING, FONT_BODY, FONT_BASE_CSS } from '../components/fonts';
import { C } from '../components/curriculum-theme';
import { startSurface, CTA, RADIUS, type StartSurface } from './start-theme';
import { StartNav, NAV_HEIGHT } from './StartNav';
import {
  TRIAL_PRICE,
  TRIAL_PRICE_EXACT,
  RENEWAL_PRICE,
  TRIAL_DAYS,
} from './trial-price';

// Step 1 of the teacher onboarding flow: the $1 trial entry.
//
// TWO STATES, AND THEY ARE DIFFERENT SCREENS RATHER THAN ONE SCREEN WITH A
// SWAPPED BUTTON. That is the shape the design asks for and it is also the
// honest one, because the two visitors are answering different questions:
//
//   signed out  ->  "is this app going to work for me at all?"
//                   Sign in, and the district access branch for a teacher whose
//                   Workspace may block it. No prices in a card, because nothing
//                   is being bought yet.
//
//   signed in   ->  "what exactly am I agreeing to?"
//                   The checkout card: what is charged today, what is charged
//                   later, and the one button that starts it.
//
// PRESENTATION PLUS ONE BEHAVIOUR CHANGE, and the change is the reason this
// component exists. /start used to bounce a signed out visitor to /login before
// rendering anything, so the page was only ever seen by someone already
// authenticated. That made a "Continue with Google" button on it impossible, and
// it made the district access line meaningless, since a teacher whose Workspace
// blocks the app has to actually attempt sign in here to find out.
//
// NOTHING ABOUT ROLE OR PAYMENT MOVED. Worth stating plainly because it is the
// obvious worry with letting a signed out visitor onto a page that sells
// something. The teacher role is written in exactly two places, both gated on a
// paid teacher plan: app/lib/stripe-activation.ts:279 and
// app/teacher/welcome/page.tsx:137. /auth/callback receives `role` and
// deliberately ignores it, which its own comment block spells out. So signing in
// here produces an ordinary account with no entitlement, which is the same thing
// signing in at /login produced. The gate that matters, profileGrants, is
// untouched and still lives in the server component.

// ─── Prices ──────────────────────────────────────────────────────────────────
//
// Every figure on this page comes from ./trial-price. The design mock says $1
// and that happens to be right, but it is not the authority: the live charge is
// cross checked on every purchase against TRIAL_FEE_CENTS in
// app/lib/stripe-activation.ts:439, and the renewal against products.ts:94.
//
// ─── WHERE THE $30 RENEWAL DISCLOSURE LANDS, AND WHY ONLY ONCE PER VIEW ──────
//
// A trial that converts to a paid subscription has to say so before the buyer
// pays, and it has to say so in whichever view they are actually looking at.
// Stating it twice in one view is worse than stating it once: repeated fine
// print reads as boilerplate and stops being read.
//
//   signed out  ->  once, in the fine print under the Google button.
//                   There is no card in this view, so the fine print is the only
//                   place it can go.
//
//   signed in   ->  once, in the third bullet of the card
//                   ("Then $30/month unless you cancel"). The card states the
//                   full terms itself, so this view carries NO separate fine
//                   print line. Adding one would put $30 on screen twice.
//
// Neither view shows both. If a third view is ever added, it gets exactly one.

// The fourth copy of this mark in the tree, after SignIn, WelcomeClient and
// ClaimClient. Left as a copy rather than lifted into a shared component,
// because hoisting it would mean editing three files this branch has no other
// reason to touch. Google's brand guidelines require the multi colour mark.
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

/** The small tracked monospace label. Used by the step indicator, the card strip
 *  and the DUE TODAY row, so the three cannot drift apart. */
const TRACKED = {
  font: `600 11px/1 ui-monospace, Menlo, monospace`,
  letterSpacing: '0.08em',
} as const;

/** Shared by both states, so the CTA is one treatment with two targets. */
function ctaStyle(dimmed: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    padding: '15px 20px',
    border: 'none',
    borderRadius: RADIUS,
    background: CTA.bg,
    // Deep Midnight at 9.19 on Sunset Orange. White would be 2.10, so the
    // "dark or white per contrast" call is not close.
    color: CTA.ink,
    font: `700 16px/1 ${FONT_BODY}`,
    textDecoration: 'none',
    cursor: dimmed ? 'default' : 'pointer',
    opacity: dimmed ? 0.7 : 1,
    boxSizing: 'border-box',
  };
}

// ─── The canceled notice ─────────────────────────────────────────────────────
//
// The cancel_url on the Checkout Session is /start?canceled=1, so this is load
// bearing rather than decoration: without it, backing out of Stripe returns the
// buyer to an unchanged page with no acknowledgement that nothing was charged.
//
// Rendered above whichever view is showing. In practice only the signed in one
// can reach it, since you have to be signed in to have started a checkout, but
// the flag comes off the URL rather than the session so it is handled in both.
function CanceledNotice({ S }: { S: StartSurface }) {
  return (
    <p
      style={{
        margin: '0 0 22px',
        padding: '11px 13px',
        border: `1px solid ${S.rule}`,
        borderRadius: RADIUS,
        font: `400 13px/1.6 ${FONT_BODY}`,
        color: S.muted,
      }}
    >
      {`Your checkout was canceled and no charge was made. Whenever you're ready, the trial is right here.`}
    </p>
  );
}

// ─── Signed out: the front door ──────────────────────────────────────────────
function SignedOutView({ S }: { S: StartSurface }) {
  const [loading, setLoading] = useState(false);

  // Copied from WelcomeClient.tsx. Same provider, same callback route, same
  // shape, with `next` pointing back here so the server component re runs with a
  // session and renders the checkout card instead.
  //
  // `role=teacher` is set for parity with SignIn.tsx and WelcomeClient.tsx. It is
  // INERT at the callback, which ignores it on purpose, and it is kept only so
  // this URL looks like the other two rather than becoming the odd one out.
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
    <>
      {/* The square is Sunset Orange as a MARKER, which is a fill role. The type
          beside it is ink, never orange. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22 }}>
        <span aria-hidden style={{ width: 8, height: 8, background: C.sunset, flexShrink: 0 }} />
        <span style={{ ...TRACKED, color: S.muted }}>Step 1 of 5</span>
      </div>

      <h1
        style={{
          margin: '0 0 14px',
          font: `600 clamp(28px, 7vw, 36px)/1.15 ${FONT_HEADING}`,
          letterSpacing: '-0.02em',
          color: S.ink,
          textWrap: 'pretty',
        }}
      >
        {`Start your ${TRIAL_DAYS}-day trial for ${TRIAL_PRICE}`}
      </h1>

      <p style={{ margin: '0 0 28px', font: `400 15px/1.65 ${FONT_BODY}`, color: S.muted }}>
        {/* A template literal rather than JSX text, and that is not style.
            Written as JSX text across two source lines, the space after the
            interpolated price is stripped by the JSX whitespace rules and the
            page renders "Just $1to start". Caught in the built page, not in
            review. Every price sentence on this screen is composed in JS for the
            same reason. */}
        {`Full teacher access. Just ${TRIAL_PRICE} to start, and we'll remind you before it renews.`}
      </p>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="um-start-cta"
        style={ctaStyle(loading)}
      >
        {/* The white chip. Square, like everything else in this flow. */}
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

      {/* THE RENEWAL DISCLOSURE FOR THIS VIEW. The only place it appears here,
          and it appears because a trial that converts has to say so before the
          buyer pays. The signed in view states the same terms in its card
          bullets instead and carries no copy of this line. */}
      <p style={{ margin: '12px 0 0', font: `400 13px/1.6 ${FONT_BODY}`, color: S.muted }}>
        {`You'll be charged ${TRIAL_PRICE} today, then ${RENEWAL_PRICE}/month unless you cancel. Cancel any time from your dashboard.`}
      </p>

      {/* A rule, not a shadow and not a panel edge. It is the only thing
          separating the sign in from the district branch below it. */}
      <hr style={{ margin: '30px 0 22px', border: 'none', borderTop: `1px solid ${S.rule}` }} />

      <a
        href="/start/access"
        style={{
          display: 'inline-block',
          font: `700 14px/1.5 ${FONT_BODY}`,
          color: S.link,
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
          parameter the role selector never reads. The promise comes back when the
          routing ships in app/auth/callback, which this branch does not touch. */}
      <p style={{ margin: '10px 0 0', font: `400 13px/1.6 ${FONT_BODY}`, color: S.muted }}>
        Some districts block new apps in Google Workspace.
      </p>
    </>
  );
}

// ─── Signed in: the checkout card ────────────────────────────────────────────
function SignedInView({ S }: { S: StartSurface }) {
  const bullets = [
    `${TRIAL_PRICE} today`,
    `${TRIAL_DAYS} days of full Teacher Pro: dashboard, worksheets, exports, all of it`,
    // The renewal disclosure for this view, and the only copy of it here.
    `Then ${RENEWAL_PRICE}/month unless you cancel. Cancel anytime from your dashboard.`,
  ];

  return (
    <div
      style={{
        background: S.cardBg,
        // The card's only boundary. In dark the fill sits 1.12:1 from the page,
        // so this hairline is carrying the whole separation, which is the flat
        // panel system working rather than a shortcut around a missing shadow.
        border: `1px solid ${S.cardEdge}`,
        borderRadius: RADIUS,
      }}
    >
      {/* ─── Header strip ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '11px 20px',
          background: S.stripBg,
          borderBottom: `1px solid ${S.cardEdge}`,
          color: S.stripInk,
        }}
      >
        <span style={TRACKED}>TEACHER · PRO TRIAL</span>
        <span style={TRACKED}>{`${TRIAL_DAYS} DAYS`}</span>
      </div>

      <div style={{ padding: '26px 20px 22px' }}>
        {/* The price sits in the SAME ink as the rest of the headline. Orange is
            a fill, a CTA, a rule or a marker in this palette, and never type. */}
        <h1
          style={{
            margin: '0 0 20px',
            font: `600 clamp(25px, 6vw, 31px)/1.18 ${FONT_HEADING}`,
            letterSpacing: '-0.02em',
            color: S.ink,
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
                color: S.ink,
              }}
            >
              {/* Marker use, which is a fill role and allowed. The 7px top
                  nudge sets the square on the first line's x-height. */}
              <span
                aria-hidden
                style={{
                  width: 7,
                  height: 7,
                  marginTop: 7,
                  background: C.sunset,
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
            borderTop: `1px solid ${S.rule}`,
            borderBottom: `1px solid ${S.rule}`,
            marginBottom: 20,
          }}
        >
          <span style={{ ...TRACKED, color: S.muted }}>DUE TODAY</span>
          <span
            style={{
              font: `600 20px/1 ${FONT_HEADING}`,
              letterSpacing: '-0.01em',
              color: S.ink,
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

        {/* Muted, deliberately not the link blue and never orange: it is an
            escape hatch, and it should not compete with the CTA above it. */}
        <a
          href="/dashboard"
          className="um-start-quiet"
          style={{
            display: 'block',
            margin: '14px 0 0',
            textAlign: 'center',
            font: `400 13px/1.6 ${FONT_BODY}`,
            color: S.muted,
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
  const { theme } = useTheme();
  const S = startSurface(theme);

  // The sanctioned way to paint the gutter. app/layout.tsx sets the body
  // background from an inline style prop, so a stylesheet rule cannot reach it
  // without !important and a flat body rule cannot read the theme anyway. The
  // full argument is at the top of useBodyBackground.ts.
  useBodyBackground(S.pageBg);

  return (
    <div className="um-start">
      <style>{`
        .um-start, .um-start * { box-sizing: border-box; }
        ${FONT_BASE_CSS}
        .um-start a { color: ${S.link}; }
        .um-start a:hover { color: ${S.linkHover}; }
        /* !important, and it is load bearing. Both the CTA and the quiet link
           set these properties as INLINE style props, and an inline declaration
           outranks every stylesheet rule at every specificity without it. The
           previous revision of this file had the hover rule with no !important
           and it silently never fired. Same trap and same fix as
           app/dashboard/dashboard-css.ts:43. */
        .um-start .um-start-cta:hover { background: ${CTA.hoverBg} !important; }
        .um-start .um-start-quiet:hover { color: ${S.ink} !important; }
        .um-start button:focus-visible,
        .um-start a:focus-visible {
          outline: 2px solid ${S.focus};
          outline-offset: 2px;
        }
      `}</style>

      <StartNav />

      <main
        style={{
          minHeight: `calc(100vh - ${NAV_HEIGHT}px)`,
          background: S.pageBg,
          display: 'flex',
          justifyContent: 'center',
          padding: '56px 20px 72px',
          fontFamily: FONT_BODY,
        }}
      >
        <div style={{ width: '100%', maxWidth: 460 }}>
          {canceled && <CanceledNotice S={S} />}
          {signedIn ? <SignedInView S={S} /> : <SignedOutView S={S} />}
        </div>
      </main>
    </div>
  );
}
