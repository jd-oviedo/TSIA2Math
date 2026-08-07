'use client';

import { useTheme } from '../theme/useTheme';

// The light/dark switch, as a component that can sit on any surface.
//
// The logic is not new and is deliberately not re-implemented: useTheme() is
// the same hook the CAT engine's header toggle calls, which reads and writes
// the single ThemeProvider mounted in the root layout. That provider is what
// persists the choice -- localStorage under "ec-theme" -- and what pushes the
// --ec-* variables onto <html>. So a student who switches here has switched
// everywhere the app theme reaches, the adaptive test included.
//
// Only the presentation is parameterised, because this renders on the student
// rail's Mercury Cream in one theme and a warm charcoal in the other, and
// neither can be expressed with the --ec variables the older toggles use.
//
// The sun/moon artwork came from theme/ThemeToggleHome, which now delegates
// here rather than keeping a second copy of it.

export function ThemeModeButton({
  size = 30,
  bg = 'transparent',
  hoverBg,
  border = 'transparent',
  color = 'currentColor',
  shadow,
  onMouseEnter,
  onMouseLeave,
}: {
  size?: number;
  bg?: string;
  hoverBg?: string;
  border?: string;
  color?: string;
  shadow?: string;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
}) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const glyph = Math.round(size * 0.53);

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Switch light or dark mode"
      aria-pressed={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onMouseEnter={(e) => {
        if (hoverBg) (e.currentTarget as HTMLElement).style.background = hoverBg;
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (hoverBg) (e.currentTarget as HTMLElement).style.background = bg;
        onMouseLeave?.(e);
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        border: `1px solid ${border}`,
        background: bg,
        color,
        boxShadow: shadow,
        cursor: 'pointer',
        padding: 0,
        transition: 'background 0.15s ease',
      }}
    >
      {isDark ? (
        <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="4.5" />
          <line x1="12" y1="19.5" x2="12" y2="22" />
          <line x1="2" y1="12" x2="4.5" y2="12" />
          <line x1="19.5" y1="12" x2="22" y2="12" />
          <line x1="4.9" y1="4.9" x2="6.6" y2="6.6" />
          <line x1="17.4" y1="17.4" x2="19.1" y2="19.1" />
          <line x1="4.9" y1="19.1" x2="6.6" y2="17.4" />
          <line x1="17.4" y1="6.6" x2="19.1" y2="4.9" />
        </svg>
      )}
    </button>
  );
}
