'use client';

import { FONT_HEADING, FONT_BODY } from '../../components/fonts';
import { L, LOGIN_CSS } from '../../login/login-theme';
import { Eyebrow } from '../../login/LoginChrome';
import { StartChrome } from '../StartChrome';

// The district access branch, linked from /start.
//
// Same skin as the rest of the onboarding flow: StartChrome, which is
// LoginChrome's structure, and every colour a var(--uml-*) reference resolved by
// login-theme.ts. No hexes in this file.
//
// A PLACEHOLDER, DELIBERATELY. It exists so the link on step 1 has somewhere to
// land and so the route is real before the helper is built. What goes here later
// is the actual admin approval path: the OAuth client id a Workspace admin needs
// to allow-list, a copyable request to send them, and the automatic routing from
// a failed sign in.
//
// THAT ROUTING DOES NOT EXIST YET, which is why /start no longer promises it. A
// blocked sign in lands on /login with an error parameter the role selector never
// reads. Closing that is its own task against app/auth/callback/route.ts, which
// this branch does not touch.
//
// No gate on purpose. A teacher who cannot get through Google sign in is by
// definition signed out, so anything that required a session would be a page
// they could never reach.
export default function DistrictAccessPage() {
  return (
    <>
      <style>{`
        ${LOGIN_CSS}
        .um-start, .um-start * { box-sizing: border-box; }
        .um-start h1, .um-start h2 { font-family: ${FONT_HEADING}; }
        .um-start { font-family: ${FONT_BODY}; }
        .um-start .um-start-quiet:hover { color: ${L.ink} !important; }
      `}</style>

      <StartChrome>
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          {/* The card floats on the grid the same way /login's do: a flat fill,
              a hard 1px rule, no shadow, no radius. */}
          <div
            style={{
              background: L.card,
              border: `1px solid ${L.border}`,
              borderRadius: 0,
              padding: '30px 24px 26px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <Eyebrow>District access</Eyebrow>

            <h1
              style={{
                margin: 0,
                font: `600 clamp(25px, 6vw, 30px)/1.18 ${FONT_HEADING}`,
                letterSpacing: '-0.02em',
                color: L.ink,
                textWrap: 'pretty',
              }}
            >
              Check your district access
            </h1>

            <p style={{ margin: 0, font: `400 15px/1.7 ${FONT_BODY}`, color: L.ink2 }}>
              Some districts block new apps in Google Workspace by default. If that is how your
              district is set up, signing in with your school Google account will fail until a
              Workspace administrator approves UnpackMath.
            </p>

            <p style={{ margin: 0, font: `400 15px/1.7 ${FONT_BODY}`, color: L.ink2 }}>
              This is usually a small change on their side, and it only has to happen once for your
              whole campus. Full instructions to send your administrator are coming here shortly.
            </p>

            <hr style={{ margin: '4px 0 0', border: 'none', borderTop: `1px solid ${L.barLine}` }} />

            <a
              href="/start"
              style={{
                font: `700 14px/1.5 ${FONT_BODY}`,
                color: L.amber,
                textDecoration: 'none',
              }}
            >
              {`← Back to your trial`}
            </a>
          </div>
        </div>
      </StartChrome>
    </>
  );
}
