import GumuAvatar from '../../course/[test]/[subject]/unit/[unit]/topic/[topicId]/GumuAvatar';
import { FONT_HEADING, FONT_BODY } from '../../components/fonts';
import { C } from '../../components/curriculum-theme';
import { L, LOGIN_CSS, FONT_MONO } from '../../login/login-theme';
import { StartChrome } from '../../start/StartChrome';
import { TRIAL_PRICE, TRIAL_DAYS } from '../../start/trial-price';

// Step 3 of teacher onboarding: the moment after paying.
//
// ─── WHAT THIS REPLACED, AND WHAT IT DID NOT ────────────────────────────────
//
// app/teacher/welcome/page.tsx ends its paid-and-matched path with a sequence of
// activation calls and then, historically, a bare redirect("/teacher"). The
// buyer paid and was dropped onto a dashboard with no acknowledgement that
// anything had happened.
//
// ONLY THAT TERMINAL REDIRECT BECAME A RENDER. Every activation call above it is
// untouched and still runs, in the same order, before this component is
// returned: linkCustomerId, entitlementFromCheckout, the guarded role write, and
// writeEntitlement. So access is fully granted by the time this paints, and the
// CTA below leads to a dashboard the buyer already owns.
//
// The five OTHER redirect("/teacher") calls in that file are failure and
// mismatch paths, and every one of them stays a redirect. A visitor with an
// unpaid session, an unretrievable session, or someone else's receipt must not
// be shown a page that congratulates them on a purchase.
//
// ─── THE MU MARK ─────────────────────────────────────────────────────────────
//
// GumuAvatar, the existing component, rather than the raw PNG or anything newly
// drawn. Worth knowing: its own header records that the art is Sunset Orange on
// transparent and measures POORLY on light warm grounds, median 2.10 on cream
// with 27% of the art below 1.5:1. This card is light, so this is close to its
// weakest ground.
//
// Rendered bare anyway, and marked decorative with title="", because here it
// carries no information: the headline says "You're in." and the line under it
// names Mu. Nothing is lost if it does not resolve. It is deliberately NOT given
// a plate, which is the fix GumuAvatar explicitly rules out for this art.

const CHECKS = [
  'Class roster and misconception grid',
  'Assignable curriculum and worksheet generator',
  'CSV export',
];

function Check() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 18 18"
      fill="none"
      stroke={C.sunset}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: 3 }}
    >
      <polyline points="3 9.5 7 13.5 15 5" />
    </svg>
  );
}

export default function WelcomeIn() {
  return (
    <>
      <style>{`
        ${LOGIN_CSS}
        .um-start, .um-start * { box-sizing: border-box; }
        .um-start h1, .um-start h2 { font-family: ${FONT_HEADING}; }
        .um-start { font-family: ${FONT_BODY}; }
        /* !important, and load bearing: the CTA sets background as an INLINE
           style prop, which outranks any stylesheet rule without it. Background
           only, no transform and no box-shadow. */
        .um-start .um-start-cta:not(:disabled):hover { background: ${C.sunsetHover} !important; }
      `}</style>

      <StartChrome>
        <div
          style={{
            maxWidth: 440,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <GumuAvatar size={76} title="" />
            <h1
              style={{
                margin: 0,
                font: `600 clamp(30px, 7vw, 38px)/1.12 ${FONT_HEADING}`,
                letterSpacing: '-0.02em',
                color: L.ink,
                textAlign: 'center',
              }}
            >
              {`You're in.`}
            </h1>
            <p
              style={{
                margin: 0,
                font: `400 15px/1.6 ${FONT_BODY}`,
                color: L.ink2,
                textAlign: 'center',
              }}
            >
              {`Mu's got your class for the next ${TRIAL_DAYS} days.`}
            </p>
          </div>

          {/* The float: flat fill, hard 1px rule, grid behind. No shadow. */}
          <div
            style={{
              background: L.card,
              border: `1px solid ${L.border}`,
              borderRadius: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '11px 18px',
                background: L.cream,
                borderBottom: `1px solid ${L.border}`,
                color: L.creamInk,
              }}
            >
              <span
                style={{
                  font: `400 11px/1 ${FONT_MONO}`,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                Full Teacher Pro access
              </span>
              {/* The chip. A hard rule on the strip rather than a second fill,
                  so it reads as a marker and not a button.

                  L.border rather than L.creamLine. Identical in light, where both
                  are #111111, but the two diverge in dark: creamLine stays
                  #111111 so the orange CTA keeps a dark outline, and #111111 on
                  the dark strip would be an invisible chip. */}
              <span
                style={{
                  font: `400 10.5px/1 ${FONT_MONO}`,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  border: `1px solid ${L.border}`,
                  padding: '4px 7px',
                  whiteSpace: 'nowrap',
                }}
              >
                {`Day 1 of ${TRIAL_DAYS}`}
              </span>
            </div>

            <ul style={{ margin: 0, padding: '20px 18px', listStyle: 'none' }}>
              {CHECKS.map((item, i) => (
                <li
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginBottom: i === CHECKS.length - 1 ? 0 : 11,
                    font: `400 14px/1.6 ${FONT_BODY}`,
                    color: L.ink,
                  }}
                >
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <a
            href="/teacher"
            className="um-start-cta"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '15px 20px',
              border: `1px solid ${L.creamLine}`,
              borderRadius: 0,
              background: L.cta,
              color: L.ctaInk,
              font: `700 16px/1 ${FONT_BODY}`,
              textDecoration: 'none',
              boxSizing: 'border-box',
            }}
          >
            Set up my class
          </a>

          {/* Bound to the live charged amount, never a literal. TRIAL_PRICE
              mirrors TRIAL_FEE_CENTS in app/lib/stripe-activation.ts:439, which
              is cross checked against session.amount_total on every purchase. */}
          <p style={{ margin: 0, font: `400 13px/1.6 ${FONT_BODY}`, color: L.ink2 }}>
            {`You paid ${TRIAL_PRICE} to start. Nothing else charges until your trial converts, and we'll remind you first.`}
          </p>
        </div>
      </StartChrome>
    </>
  );
}
