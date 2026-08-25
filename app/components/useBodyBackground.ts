'use client';

import { useEffect } from 'react';

// Paints the document body while a themed surface is mounted, and puts it back
// when that surface unmounts.
//
// WHY THIS IS JAVASCRIPT AND NOT A STYLESHEET RULE.
//
// The body behind these shells still carries the global theme's --ec-bg, which
// is a blue-black in dark mode and would show at the edges on overscroll. The
// surfaces used to state that in CSS, as `body:has(.um-dash)` and
// `body:has(.um-topic)`. Neither rule ever painted, on any browser: app/layout.tsx
// sets the body background from an INLINE style prop, and an inline declaration
// outranks every stylesheet rule at every specificity unless the rule carries
// !important. The :has() was real Selectors Level 4 debt and did fail to parse
// on Safari below 15.4, but it was never the reason those rules did nothing.
//
// app/teacher/worksheets/worksheet-theme.ts fixed the same shape with a bare
// `body { background: ... !important }`, which is the right answer THERE because
// the worksheet chrome is a single colour. It does not transfer here. These two
// surfaces are theme-aware and the theme marker lives on the descendant
// container -- .um-dash and .um-topic carry data-theme, while ThemeProvider
// writes only custom properties to documentElement and stamps no attribute a
// body rule could switch on. So a bare `body` selector could carry exactly one
// colour and would paint a light gutter behind a dark page. Selecting an
// ancestor from a descendant's state is the one thing :has() was doing that no
// Level 1 selector can replicate.
//
// Setting the inline style directly sidesteps the whole question: it is
// theme-aware because it is recomputed, it beats the layout's own inline value
// because it replaces it, and it involves no selector at all, so there is
// nothing left to fail to parse on an older Safari.
//
// The colour must be a resolved value, not a var() reference. --umd-* and --umt-*
// are declared on the container, and custom properties inherit downward only, so
// body cannot read them.
export function useBodyBackground(color: string) {
  useEffect(() => {
    const { body } = document;
    const previous = body.style.background;
    body.style.background = color;

    // Read back what the browser stored rather than comparing against `color`.
    // Setting the `background` shorthand normalises a hex to rgb(), so a naive
    // equality check would never match and the cleanup would never restore.
    const applied = body.style.background;

    return () => {
      // Only clear our own value. On a navigation between two themed surfaces
      // React may run the incoming effect before this cleanup, and blindly
      // restoring would wipe the colour the next surface just set. This is the
      // order-dependence the old rules had, and it is not being reintroduced.
      if (body.style.background === applied) body.style.background = previous;
    };
  }, [color]);
}
