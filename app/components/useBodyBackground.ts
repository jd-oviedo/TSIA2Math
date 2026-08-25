'use client';

import { useEffect } from 'react';

// Paints the document body while a themed surface is mounted, and puts it back
// when that surface unmounts.
//
// ─── WHY THIS IS JAVASCRIPT AND NOT A CSS SELECTOR ──────────────────────────
//
// READ THIS BEFORE "SIMPLIFYING" IT BACK INTO THE STYLESHEET. What looks like
// an obvious tidy-up -- move the colour into the surface's CSS string, where
// every other rule lives -- is how the broken selector gets reintroduced.
//
// The body behind these shells carries the global theme's --ec-bg, which is a
// blue-black in dark mode and would show at the edges on overscroll. Three
// surfaces used to state that in CSS: `body:has(.um-dash)`, `body:has(.um-topic)`
// and `body:has(.um-login)`.
//
// TWO separate things were wrong with that, and fixing either one alone leaves a
// rule that still does not work:
//
//   1. It never painted, on any browser. app/layout.tsx sets the body background
//      from an INLINE style prop, and an inline declaration outranks every
//      stylesheet rule at every specificity unless the rule carries !important.
//      None of the three did.
//
//   2. :has() is Selectors Level 4 and does not parse on Safari below 15.4,
//      where an unparseable selector drops its own rule outright.
//
// So why not a flat `body { background: ... !important }`, which is what
// app/teacher/worksheets/worksheet-theme.ts uses? Because that is only correct
// for a SINGLE-COLOUR surface, which the worksheet chrome is and these three
// are not.
//
// THE THEME MARKER LIVES ON A DESCENDANT. .um-dash, .um-topic and .um-login each
// carry data-theme, set by the client wrapper that renders them. ThemeProvider
// writes only custom properties to documentElement and stamps NO attribute on
// <html> that a body rule could switch on. A flat body selector therefore cannot
// read theme state at all: it can carry exactly one colour, and would paint a
// light gutter behind a dark page. Reaching an ancestor from a descendant's
// state is precisely what body:has(descendant) was for, and it is the one thing
// no Level 1 selector can replicate.
//
// That is the whole bind: the only selector that could express this is the one
// that drops on older Safari. Writing the inline style from the wrapper that
// already knows the theme sidesteps it entirely. It is theme-aware because it is
// recomputed, it beats the layout's own inline value because it replaces it, and
// it involves no selector at all, so there is nothing left to fail to parse.
// Theme-correct on every browser, old Safari included.
//
// If a future change does put a theme attribute on <html>, a stylesheet rule
// becomes possible again -- but it still needs !important to clear the inline
// prop, and it still must not use :has().
//
// The colour must be a RESOLVED value, not a var() reference. --umd-*, --umt-*
// and --uml-* are declared on the container, and custom properties inherit
// downward only, so body cannot read them.
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
