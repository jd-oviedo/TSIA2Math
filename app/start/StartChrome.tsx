'use client';

import type { ReactNode } from 'react';
import { useTheme } from '../theme/useTheme';
import { useBodyBackground } from '../components/useBodyBackground';
import { ThemeSwitch } from '../components/ThemeSwitch';
import {
  L,
  SURFACES,
  FONT_MONO,
  GRID_BACKGROUND,
  GRID_SIZE,
} from '../login/login-theme';

// The shell the onboarding flow sits in: header bar, graph-paper ground, footer
// bar. A direct mirror of app/login/LoginChrome.tsx, which is the reference
// surface for this flow.
//
// ─── IT REUSES /login's TOKENS RATHER THAN COPYING THEM ──────────────────────
//
// The wrapper below carries className="um-login", and that is the load bearing
// part rather than a naming convenience. login-theme.ts declares every --uml-*
// custom property on the `.um-login` selector and its `[data-theme="dark"]`
// twin, and custom properties inherit DOWNWARD ONLY. Drop that class and every
// L.* reference in this tree resolves to nothing: backgrounds fall back to
// transparent and colours silently inherit whatever is above them. So the class
// is what makes "reuse by reference, do not duplicate hexes" actually work, and
// removing it does not fail loudly.
//
// data-theme is set HERE and only here, exactly as LoginChrome does it, from the
// app's single ThemeProvider. Everything below reads var(--uml-*) and never asks
// what the theme is.
//
// ─── WHY THIS IS NOT LoginChrome ITSELF ──────────────────────────────────────
//
// LoginChrome takes `lang` and `setLang` and renders an ES/EN toggle beside the
// theme switch. The onboarding copy is English only, so mounting that control
// here would put a language switch on screen that changes nothing when pressed.
// A dead control is worse than a missing one. Everything else, the bar, the
// grid, the footer, the spacing, is the same structure and the same tokens.
//
// If the onboarding copy is ever translated, this file should collapse into
// LoginChrome rather than growing its own toggle.

/** /login's bar label: mono, tracked, no underline. Mirrors LoginChrome's own. */
export const BAR_LABEL: React.CSSProperties = {
  font: `400 11px/1 ${FONT_MONO}`,
  letterSpacing: '0.1em',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

export function StartChrome({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  // The overscroll gutter behind this shell. L.ground is a var() reference and
  // body cannot resolve one declared on a descendant, so the RESOLVED hex for
  // the current theme is passed. Same call and same reasoning as LoginChrome.
  useBodyBackground(SURFACES[theme].ground);

  return (
    <div
      className="um-login um-start"
      data-theme={theme}
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: L.ground,
        color: L.ink,
        boxSizing: 'border-box',
      }}
    >
      {/* ─── Header ────────────────────────────────────────────────────────
          Light bar on the light ground, not the dark banner this flow used to
          carry. L.bar is #FFFFFF in light and #161E30 in dark, both of them
          /login's own values. */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '16px',
          background: L.bar,
          borderBottom: `1px solid ${L.barLine}`,
        }}
      >
        {/* The shipped PNG at 26px, the height LoginChrome's 390px measurement
            was taken at. */}
        <a href="https://www.unpackmath.com" style={{ display: 'flex', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/unpackmath-wordmark.png"
            alt="UnpackMath"
            width={2000}
            height={485}
            style={{ height: 26, width: 'auto', display: 'block' }}
          />
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemeSwitch
            size={29}
            border={L.toggleOffLine}
            color={L.ink}
            font={`400 13px/1 ${FONT_MONO}`}
            hoverBg={L.tintAmber}
          />
        </div>
      </header>

      {/* ─── The graph-paper ground ────────────────────────────────────────
          Two 1px gradients on a 62px grid, imported from login-theme rather than
          restated, so there is exactly one grid in the codebase. */}
      <main
        style={{
          flex: 1,
          padding: '48px 16px 64px',
          background: L.ground,
          backgroundImage: GRID_BACKGROUND,
          backgroundSize: GRID_SIZE,
        }}
      >
        {children}
      </main>

      <footer
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 18,
          padding: 16,
          background: L.bar,
          borderTop: `1px solid ${L.barLine}`,
          font: `400 11px/1 ${FONT_MONO}`,
          letterSpacing: '0.06em',
          color: L.inkMono,
        }}
      >
        <span>© {new Date().getFullYear()} UnpackMath</span>
        <a
          href="https://unpackmath.com/privacy"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          Privacy
        </a>
        <a href="https://unpackmath.com/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
          Terms
        </a>
      </footer>
    </div>
  );
}
