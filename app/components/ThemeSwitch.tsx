'use client';

import { useTheme } from '../theme/useTheme';

// The squared light/dark switch, built for the login redesign and built to
// leave it. The rest of the app moves onto this surface later, so the API is
// presentation-parameterised the same way ThemeModeButton is: nothing about the
// login palette is baked in, and a caller supplies its own colours.
//
// NOT A REPLACEMENT FOR ThemeModeButton, and deliberately a second component
// rather than a fourth set of props on it. That one is round, sized in a single
// `size` prop that drives a border-radius:50%, and is live on the student rail
// where it reads as a circular icon among circular icons. This one is a square
// with a hard 1px rule, sized to sit in a row with the ES/EN control and read
// as part of it. Two shapes, two components, one hook.
//
// THE LOGIC IS NOT NEW. useTheme() is the same hook both of them call, reading
// and writing the single ThemeProvider mounted in the root layout. That provider
// is what persists the choice -- localStorage under "ec-theme" -- and what
// pushes the --ec-* variables onto <html>. A student who switches here has
// switched everywhere the app theme reaches.
//
// A GLYPH RATHER THAN A WORD, which is a deliberate departure from the ES/EN
// control it otherwise matches. A labelled two-segment pill in the style of
// ES/EN measures 78px against this square's 29px, and the login header has 12px
// of slack at 390px: the label is the difference between fitting and not. It
// also spares a fourth string from needing a Spanish translation.

export function ThemeSwitch({
  size = 29,
  bg = 'transparent',
  border = 'currentColor',
  color = 'currentColor',
  font,
  hoverBg,
  label = 'Switch light or dark mode',
  titleToLight = 'Switch to light mode',
  titleToDark = 'Switch to dark mode',
}: {
  size?: number;
  bg?: string;
  border?: string;
  color?: string;
  /** Shorthand font for the glyph, so a caller can hand it the same monospace stack its labels use. */
  font?: string;
  hoverBg?: string;
  label?: string;
  titleToLight?: string;
  titleToDark?: string;
}) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
      aria-pressed={isDark}
      title={isDark ? titleToLight : titleToDark}
      onMouseEnter={(e) => {
        if (hoverBg) (e.currentTarget as HTMLElement).style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (hoverBg) (e.currentTarget as HTMLElement).style.background = bg;
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        boxSizing: 'border-box',
        // Square corners are the point of this component. No border-radius.
        border: `1px solid ${border}`,
        background: bg,
        color,
        font,
        lineHeight: 1,
        cursor: 'pointer',
        padding: 0,
        transition: 'background 0.15s ease',
      }}
    >
      {/* The glyph names the theme you would GET, matching the title text: a
          sun to go light, a moon to go dark. aria-hidden because the button
          already has an accessible name and a title.

          These two characters specifically, U+263C and U+263E, because they are
          the pair app/components/Header.tsx already ships and so are known to
          render. U+2600 was tried first and falls back to a bare asterisk in
          Chromium's headless font set, which is exactly the kind of thing that
          renders fine on the machine it was written on and badly elsewhere. */}
      <span aria-hidden>{isDark ? '☼' : '☾'}</span>
    </button>
  );
}
