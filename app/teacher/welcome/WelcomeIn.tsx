import GumuAvatar from '../../course/[test]/[subject]/unit/[unit]/topic/[topicId]/GumuAvatar';
import { FONT_HEADING, FONT_BODY } from '../../components/fonts';
import { C } from '../../components/curriculum-theme';
import { L, LOGIN_CSS, FONT_MONO } from '../../login/login-theme';
import { MOTION_CSS } from '../../motion';
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
        ${MOTION_CSS}
        .um-start, .um-start * { box-sizing: border-box; }
        .um-start h1, .um-start h2 { font-family: ${FONT_HEADING}; }
        .um-start { font-family: ${FONT_BODY}; }
        /* !important, and load bearing: the CTA sets background as an INLINE
           style prop, which outranks any stylesheet rule without it. Background
           only, no transform and no box-shadow. */
        .um-start .um-start-cta:not(:disabled):hover { background: ${C.sunsetHover} !important; }
      `}</style>

      <StartChrome>
        {/* ─── THE OPT-IN, AND IT IS THE ONLY ONE IN THE PRODUCT ─────────────
            .um-motion is lock 1 of the shared motion system: every rule in
            MOTION_CSS is written as a strict descendant of this class, so no
            surface that omits it can animate. This wrapper carries it rather
            than the column below because the column is also the .um-stagger
            container, and a strict-descendant selector cannot match its own
            element. The div is layout neutral -- StartChrome's <main> lays out
            a full-width block either way, and the column keeps its own
            maxWidth and auto margins.

            StartChrome is deliberately NOT the host. Putting .um-motion there
            would opt /start, /start/access and every future onboarding surface
            in at once, which is Wave 2's decision to make, not this file's. */}
        <div className="um-motion">
          <div
            className="um-stagger"
            style={{
              maxWidth: 440,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
            }}
          >
            {/* Beat 1: the mark, the headline and the line under it, as ONE
                unit. They are a single statement and staggering inside the
                group would make the page read as assembling itself rather
                than arriving. */}
            <div
              className="um-fade-up"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
            >
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
            {/* Beat 2. The whole card arrives as one object -- the strip, the
                chip and the three rows do not stagger against each other. */}
            <div
              className="um-fade-up"
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

            {/* Beat 3, AND THE ENTRANCE IS ON THE WRAPPER RATHER THAN ON THE
                ANCHOR. That is the standing rule for this system, not a detail
                of this page: an entrance and a hover must never animate
                `transform` on the same node, because a running animation's
                transform wins over a transition's and the hover would simply
                stop working for the length of the entrance.

                The rule costs nothing to honour here -- .um-start-cta's hover
                is background-only, so there is no conflict to avoid yet. It is
                held anyway because Wave 2 puts this system next to .uml-lift,
                whose hover DOES translate (login-theme.ts:331), and a pattern
                that is only applied once it is needed is a pattern that gets
                missed on the surface that needed it. */}
            <div className="um-fade-up">
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
            </div>

            {/* Bound to the live charged amount, never a literal. TRIAL_PRICE
                mirrors TRIAL_FEE_CENTS in app/lib/stripe-activation.ts:439, which
                is cross checked against session.amount_total on every purchase. */}
            {/* Beat 4, AND IT IS ANIMATED FOR A REASON RATHER THAN FOR SYMMETRY.
                The brief named three beats. Leaving this one out would not
                leave it still -- it would leave it painted at full opacity from
                the first frame while the three elements ABOVE it glided in over
                780ms, so the smallest print on the page would arrive first and
                alone. Everything in the column settles, or the settle reads as
                a fault. */}
            <p
              className="um-fade-up"
              style={{ margin: 0, font: `400 13px/1.6 ${FONT_BODY}`, color: L.ink2 }}
            >
              {`You paid ${TRIAL_PRICE} to start. Nothing else charges until your trial converts, and we'll remind you first.`}
            </p>
          </div>
        </div>
      </StartChrome>
    </>
  );
}
