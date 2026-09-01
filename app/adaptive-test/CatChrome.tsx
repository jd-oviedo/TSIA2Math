'use client';

import type { ReactNode } from 'react';
import { useTheme } from '../theme/useTheme';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useBodyBackground } from '../components/useBodyBackground';
import { Entrance } from '../components/Entrance';
import { CAT_CSS, SURFACES } from './cat-theme';

// The shell all four adaptive-test screens sit in: header bar, themed ground,
// footer. It replaces the local `Shell` that used to live in page.tsx and paint
// itself from the global var(--ec-bg).
//
// THIS IS WHERE data-theme IS SET, and it is the only place. Everything below
// reads var(--umc-*) and never asks what the theme is. The value comes from
// useTheme(), which is the app's single ThemeProvider -- so the choice persists
// under the existing "ec-theme" key and the Header's own toggle, which renders
// inside this component, still drives the whole surface. See cat-theme.ts for
// why the tokens are scoped rather than added to themes.ts.
//
// THE MARKER IS ON THIS DIV, A DESCENDANT OF <body>, NOT ON <html>. That is the
// same placement .um-login, .um-dash and .um-topic use, and it is what makes the
// body ground a JavaScript problem rather than a CSS one -- custom properties
// inherit downward only, so <body> cannot read a --umc-* declared here. See the
// useBodyBackground call below.
//
// WHAT STILL READS --ec-* INSIDE THIS TREE, deliberately and unchanged: Header,
// Footer and the Calculator. They are shared components used by /, /login and
// the dashboards, and --ec-* still resolves for them from documentElement
// exactly as before. Rebranding the shared chrome is a separate surface and a
// separate decision; this file changes what the CAT's own content reads and
// nothing else.

export function CatChrome({
  children,
  showCalculator = false,
}: {
  children: ReactNode;
  showCalculator?: boolean;
}) {
  const { theme } = useTheme();

  // The overscroll gutter behind this shell. C.page is a var() reference and
  // body cannot resolve it, so the RESOLVED hex for the current theme is passed.
  // Without this the gutter falls back to --ec-bg, which is #F0EDE8 in light and
  // #0C1120 in dark -- a warm grey and a blue-black, neither of which is this
  // surface's ground. useBodyBackground restores the previous value on unmount.
  useBodyBackground(SURFACES[theme].page);

  return (
    <div
      className="um-cat"
      data-theme={theme}
      // NO `background` OR `color` HERE, AND THAT IS LOAD BEARING.
      //
      // The ground, the grid and the ink are painted by the .um-cat rule in
      // CAT_CSS below. An inline `background: <page>` would beat that rule at
      // every specificity -- and worse, `background` is a SHORTHAND, so it
      // resets background-image and background-size to their initial values.
      // The grid would compute to `none` and vanish with no error.
      //
      // That is not hypothetical: it is what this file did until the computed
      // style was actually read back off the running page. The hero never had
      // the bug only because it was rewritten without an inline background.
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <style>{CAT_CSS}</style>
      <div style={{ position: 'relative' }}>
        <Header showCalculator={showCalculator} />
      </div>
      {/* THE ENTRANCE IS HERE, NOT AROUND THE WHOLE SHELL, so the bar and the
          footer stay still while the content arrives. Chrome does not animate;
          content does.

          IT RUNS ONCE PER PAGE LOAD, NOT ONCE PER PHASE. Every phase in
          page.tsx returns a CatChrome at the same position in the same tree, so
          React reconciles rather than remounts and this Entrance keeps its
          state across loading, ready, active and complete. Advancing a question
          does not re-fire it.

          It is also NOT the per-question stagger. That lives inside ItemCard,
          keyed on item_id, and fires on every question change. The two never
          overlap: this one has finished before the first question is reached,
          because the flow always begins on the loading phase. */}
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%', padding: '110px 24px 80px' }}>
        <Entrance>{children}</Entrance>
      </main>
      <Footer />
    </div>
  );
}
