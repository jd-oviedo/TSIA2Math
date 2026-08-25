'use client';

import type { ReactNode } from 'react';
import { useTheme } from '../theme/useTheme';
import { ThemeSwitch } from '../components/ThemeSwitch';
import { L, SURFACES, FONT_MONO, GRID_BACKGROUND, GRID_SIZE } from './login-theme';
import { useBodyBackground } from '../components/useBodyBackground';
import { t } from './copy';
import type { Lang } from './use-login-lang';

// The shell all three login screens sit in: header bar, graph-paper ground,
// footer bar. From options 1a and 1d of the import, which share it exactly.
//
// THIS IS WHERE data-theme IS SET, and it is the only place. Everything below
// reads var(--uml-*) and never asks what the theme is. The value comes from
// useTheme(), which is the app's single ThemeProvider -- so the choice persists
// under the existing "ec-theme" key and a student who switches here has switched
// everywhere. See app/login/login-theme.ts for why the tokens are scoped rather
// than added to themes.ts.

const BAR_LABEL: React.CSSProperties = {
  font: `400 11px/1 ${FONT_MONO}`,
  letterSpacing: '0.1em',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div role="group" aria-label={t(lang, 'langLabel')} style={{ display: 'flex' }}>
      {(['es', 'en'] as const).map((l) => {
        const on = lang === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={on}
            lang={l}
            style={{
              ...BAR_LABEL,
              letterSpacing: '0.08em',
              padding: '7px 11px',
              cursor: 'pointer',
              // Square corners, hard 1px rule. The inactive border is
              // rgba(0,0,0,.45) rather than the import's .18, which measured
              // 1.53:1 -- and unlike the grid this IS a component boundary, the
              // only thing marking the unselected pill as a control.
              border: `1px solid ${on ? L.toggleOn : L.toggleOffLine}`,
              background: on ? L.toggleOn : 'transparent',
              color: on ? L.toggleOnInk : L.ink,
              // The two pills share an edge rather than sitting apart, as drawn.
              marginLeft: l === 'en' ? -1 : 0,
            }}
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

function ChangeRole({ lang, className }: { lang: Lang; className: string }) {
  return (
    <a
      href="/login"
      className={className}
      style={{ ...BAR_LABEL, color: L.inkMono, alignItems: 'center' }}
    >
      {t(lang, 'changeRole')}
    </a>
  );
}

export function LoginChrome({
  lang,
  setLang,
  showChangeRole = false,
  children,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  showChangeRole?: boolean;
  children: ReactNode;
}) {
  const { theme } = useTheme();

  // The overscroll gutter behind this shell. L.ground is a var() reference and
  // body cannot resolve it, so the resolved hex for the current theme is passed.
  useBodyBackground(SURFACES[theme].ground);

  return (
    <div
      className="um-login"
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
        {/* The wordmark stays the shipped PNG rather than the import's live
            two-tone text. Redrawing a provided brand file in type would make
            these three screens the only place the logo is typography, and it
            would drift the first time the file is updated. Sized to 26px, which
            is the height the 390px measurement was taken at. */}
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
          {showChangeRole && <ChangeRole lang={lang} className="uml-role-inbar" />}
          <LangToggle lang={lang} setLang={setLang} />
          <ThemeSwitch
            size={29}
            border={L.toggleOffLine}
            color={L.ink}
            font={`400 13px/1 ${FONT_MONO}`}
            hoverBg={L.tintAmber}
            label={t(lang, 'themeLabel')}
            titleToLight={t(lang, 'toLight')}
            titleToDark={t(lang, 'toDark')}
          />
        </div>
      </header>

      <main
        style={{
          flex: 1,
          padding: '48px 16px 64px',
          background: L.ground,
          backgroundImage: GRID_BACKGROUND,
          backgroundSize: GRID_SIZE,
        }}
      >
        {showChangeRole && (
          // The narrow-width home for the back affordance. Both copies are
          // always rendered and CSS shows exactly one; see login-theme.ts.
          <div style={{ maxWidth: 520, margin: '0 auto 20px' }}>
            <ChangeRole lang={lang} className="uml-role-incol" />
          </div>
        )}
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
          // .58 rather than the import's .50, which measured 3.98:1.
          color: L.inkMono,
        }}
      >
        <span>© {new Date().getFullYear()} UnpackMath</span>
        <a
          href="https://unpackmath.com/privacy"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          {t(lang, 'privacy')}
        </a>
        <a href="https://unpackmath.com/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
          {t(lang, 'terms')}
        </a>
      </footer>
    </div>
  );
}

/** The mono eyebrow with its 22x1px rule, from both 1a and 1d. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        font: `400 11px/1 ${FONT_MONO}`,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        // The rule keeps the import's #C8821F: it is decorative, carries nothing
        // the label does not, and is exempt from the 3:1 it would otherwise miss.
        // The LABEL is the darker --uml-amber, which clears 4.5:1.
        color: L.amber,
      }}
    >
      <span aria-hidden style={{ width: 22, height: 1, background: L.amberRule, flexShrink: 0 }} />
      {children}
    </div>
  );
}
