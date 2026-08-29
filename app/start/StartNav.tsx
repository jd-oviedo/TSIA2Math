'use client';

import { ThemeSwitch } from '../components/ThemeSwitch';
import { NAV } from './start-theme';

// The onboarding flow's nav bar. Shared by /start and /start/access so the two
// steps cannot drift apart, which is the whole risk with a five step flow.
//
// Deep Midnight in both themes. See the note on NAV in start-theme.ts for why it
// does not invert: a dark nav that turns cream in light mode is not a dark nav.
export const NAV_HEIGHT = 56;

export function StartNav() {
  return (
    <header
      style={{
        background: NAV.bg,
        borderBottom: `1px solid ${NAV.rule}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '0 20px',
        minHeight: NAV_HEIGHT,
      }}
    >
      {/* The shipped two tone PNG, not typeset text. Every other surface in the
          app uses this file, and LoginChrome.tsx records why: redrawing the logo
          in type would make one screen the only place it is typography, and it
          would drift the first time the file is updated. */}
      <a href="https://www.unpackmath.com" style={{ display: 'flex', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/unpackmath-wordmark.png"
          alt="UnpackMath"
          width={2000}
          height={485}
          style={{ height: 24, width: 'auto', display: 'block' }}
        />
      </a>

      <ThemeSwitch
        size={29}
        border={NAV.line}
        color={NAV.ink}
        font="400 13px/1 ui-monospace, Menlo, monospace"
        hoverBg={NAV.hoverBg}
      />
    </header>
  );
}
