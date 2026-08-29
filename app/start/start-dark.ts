import { DARK } from '../components/dashboard-theme';

// Retunes the onboarding flow's DARK theme onto the student dashboard's dark
// scheme. Light mode is not touched by this file at all.
//
// ─── HOW IT WORKS ────────────────────────────────────────────────────────────
//
// The flow renders inside StartChrome, whose wrapper carries
// `className="um-login um-start"`, so every colour resolves through the --uml-*
// custom properties that login-theme.ts declares on `.um-login` and
// `.um-login[data-theme="dark"]`. This block redeclares a subset of those under
// `.um-login.um-start[data-theme="dark"]`, which is specificity (0,3,0) against
// the (0,2,0) it overrides, so it wins on specificity rather than on source
// order and cannot be undone by a future reshuffle of the style blocks.
//
// Every value is read from the DARK export of app/components/dashboard-theme.ts.
// Nothing here is a literal, and nothing was sampled from a screenshot: change a
// token in the dashboard and this follows it.
//
// ─── WHAT MOVED ──────────────────────────────────────────────────────────────
//
// Measured on the new grounds rather than assumed:
//
//   ground   #0C1120 navy near-black  ->  DARK.pageBg  #17171A
//   bar      #161E30                  ->  DARK.cardBg  #202024
//   card     #161E30                  ->  DARK.cardBg  #202024
//   ink      #E8EEF8 cool             ->  DARK.ink     #EDECE7   15.12 on page
//   ink2     rgba(232,238,248,.58)    ->  DARK.muted             7.42 on page
//   strip    #E8E0CF bright cream     ->  DARK.subtleBg #26262B  ink 12.73 on it
//
// The old dark was the login screen's navy, which is a different family from the
// dashboard's warm neutral. A teacher moving from this flow into /dashboard saw
// the ground change colour temperature mid-flow.
//
// ─── THE TWO TOKENS THAT DELIBERATELY DID NOT MOVE ───────────────────────────
//
// 1. --uml-border, the card edge. This is the one place the two systems are
//    genuinely incompatible, so it is a decision rather than an oversight.
//
//    The dashboard's card sits at 1.10:1 against its own page, and its edge
//    tokens are faint: cardBorder .09 measures 1.31 on the card and panelEdge
//    .12 measures 1.45. That works there because DashSurface also carries
//    cardShadow, `0 1px 2px rgba(0,0,0,0.34)`, and the shadow is doing most of
//    the separating.
//
//    THIS FLOW IS SHADOW FREE BY DECISION. Its cards float on a border and a
//    ground alone. Taking panelEdge would leave 1.10 of background contrast plus
//    a 1.45 hairline, and the card would effectively disappear. So the border
//    keeps login's own rgba(232,238,248,0.42), which measures 3.60 on the new
//    card and 3.68 on the new page: still a visible rule, and an existing token
//    rather than a new value.
//
// 2. --uml-toggle-off-line, the theme switch's resting edge. That IS a component
//    boundary under WCAG 1.4.11, which wants 3:1. Login sized it to .42 for
//    exactly that reason. The dashboard has no equivalent control token, and
//    repointing it at panelEdge would drop a real control boundary to 1.45.
//
// Brand tokens are also left alone: --uml-cta, --uml-cta-ink, --uml-amber and
// --uml-amber-rule. The orange CTA does not invert in either system, and the
// amber link is what light mode uses, so repointing only the dark half at the
// dashboard's Gemini blue would give the flow two different link colours
// depending on the theme.

/**
 * The dark override, scoped to the onboarding flow. Appended after LOGIN_CSS in
 * each onboarding surface's style block.
 */
export const START_DARK_CSS = `
.um-login.um-start[data-theme="dark"] {
  --uml-ground: ${DARK.pageBg};
  --uml-grid: ${DARK.hairline};
  --uml-bar: ${DARK.cardBg};
  --uml-bar-line: ${DARK.line};
  --uml-card: ${DARK.cardBg};
  --uml-ink: ${DARK.ink};
  --uml-ink-2: ${DARK.muted};
  --uml-ink-mono: ${DARK.muted};
  --uml-cream: ${DARK.subtleBg};
  --uml-cream-ink: ${DARK.ink};
  --uml-tint-amber: ${DARK.rowHoverBg};
  --uml-focus: ${DARK.focus};
}
`;

/**
 * The resolved page ground for the current theme, for useBodyBackground.
 *
 * body cannot read a custom property declared on one of its own descendants, so
 * the overscroll gutter needs a resolved value. StartChrome used to take this
 * from login-theme's SURFACES; in dark it now has to come from the dashboard
 * instead, or the gutter stays navy behind a neutral page.
 */
export function startGround(theme: 'light' | 'dark', lightGround: string): string {
  return theme === 'dark' ? DARK.pageBg : lightGround;
}
