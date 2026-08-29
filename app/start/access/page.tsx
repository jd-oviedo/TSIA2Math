'use client';

import { useTheme } from '../../theme/useTheme';
import { useBodyBackground } from '../../components/useBodyBackground';
import { FONT_HEADING, FONT_BODY, FONT_BASE_CSS } from '../../components/fonts';
import { startSurface, RADIUS } from '../start-theme';
import { StartNav, NAV_HEIGHT } from '../StartNav';

// The district access branch, linked from /start.
//
// A PLACEHOLDER, DELIBERATELY. It exists so the link on step 1 has somewhere to
// land and so the route is real before the helper is built. What goes here later
// is the actual admin approval path: the OAuth client id a Workspace admin needs
// to allow-list, a copyable request to send them, and the automatic routing from
// a failed sign in that the line on /start already promises.
//
// THAT PROMISE IS NOT KEPT YET. /start says "if sign-in fails, we'll route you
// here automatically", and nothing routes anyone here automatically today: a
// blocked sign in lands on /login with an error parameter the role selector never
// reads. Closing that is its own task against app/auth/callback/route.ts, which
// this branch does not touch.
//
// No gate on purpose. A teacher who cannot get through Google sign in is by
// definition signed out, so anything that required a session would be a page they
// could never reach.
export default function DistrictAccessPage() {
  const { theme } = useTheme();
  const S = startSurface(theme);

  useBodyBackground(S.pageBg);

  return (
    <div className="um-start">
      <style>{`
        .um-start, .um-start * { box-sizing: border-box; }
        ${FONT_BASE_CSS}
        .um-start a { color: ${S.link}; }
        .um-start a:hover { color: ${S.linkHover}; }
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
          <h1
            style={{
              margin: '0 0 16px',
              font: `600 clamp(26px, 6.5vw, 33px)/1.15 ${FONT_HEADING}`,
              letterSpacing: '-0.02em',
              color: S.ink,
              textWrap: 'pretty',
            }}
          >
            Check your district access
          </h1>

          <p
            style={{
              margin: '0 0 16px',
              font: `400 15px/1.7 ${FONT_BODY}`,
              color: S.muted,
            }}
          >
            Some districts block new apps in Google Workspace by default. If that is how your
            district is set up, signing in with your school Google account will fail until a
            Workspace administrator approves UnpackMath.
          </p>

          <p
            style={{
              margin: 0,
              font: `400 15px/1.7 ${FONT_BODY}`,
              color: S.muted,
            }}
          >
            This is usually a small change on their side, and it only has to happen once for your
            whole campus. Full instructions to send your administrator are coming here shortly.
          </p>

          <hr
            style={{
              margin: '30px 0 22px',
              border: 'none',
              borderTop: `1px solid ${S.rule}`,
            }}
          />

          <a
            href="/start"
            style={{
              display: 'inline-block',
              font: `700 14px/1.5 ${FONT_BODY}`,
              color: S.link,
              textDecoration: 'none',
              borderRadius: RADIUS,
            }}
          >
            ← Back to your trial
          </a>
        </div>
      </main>
    </div>
  );
}
