// Tokens for the onboarding surfaces, /start and /start/access.
//
// TWO MODES, WHICH IS WHY THIS FILE EXISTS AT ALL. The brand palette lives in
// app/components/curriculum-theme.ts and that file is deliberately light only:
// its header says the curriculum pages "commit to one warm light surface". The
// onboarding flow has to carry a light and dark switch in its nav bar, so it
// needs the same colours expressed as a pair. Nothing new is invented here. Every
// value is either a curriculum-theme export or a hex the app already ships.
//
// ─── The one substitution, and why it is not a deviation ─────────────────────
//
// The design brief names Sky Blue #87CEEB and Gemini Blue #6E9DC8 as the link
// colours. Measured on Warm Sand #F2EDDF, the ground these links actually sit
// on, Gemini is 2.45:1 and Sky is 1.49:1. Both fail WCAG AA for body text by a
// wide margin, and this is not a new discovery: the student dashboard hit the
// identical defect and app/dashboard/dashboard-css.ts:26 records the fix, which
// is Gemini darkened to #2F6091 in light and Gemini itself in dark, with the
// accent pair #0F69BA and #5AAAEE carrying hover and focus. Those exact hexes
// are already tokens in app/components/dashboard-theme.ts:320-322.
//
// So the blue family is kept and the specific value is taken from the place that
// already solved it. Sky Blue survives in its non-text role, as the focus and
// hover ring, which is how the dashboard uses it too.
//
// Measured on this page's own two grounds rather than assumed from the
// dashboard's:
//
//   link light   #2F6091 on #F2EDDF   5.61   AA
//   link dark    #6E9DC8 on #0E0E11   6.72   AA
//   hover light  #0F69BA on #F2EDDF   4.79   AA
//   hover dark   #5AAAEE on #0E0E11   7.73   AA
//   body light   #0E0E11 on #F2EDDF  16.48
//   body dark    #F2EDDF on #0E0E11  16.48
//   muted light  ink(0.6) on sand     4.81   AA, and it is INK_MUTED
//   muted dark   onDark(0.65)         7.29   AA
//   cta ink      #0E0E11 on #F0A33E   9.19
//
// ─── Orange ──────────────────────────────────────────────────────────────────
//
// Fill, CTA and marker only, never text. That rule is absolute in this palette
// and is stated in two places already, curriculum-theme.ts and
// dashboard-css.ts:34. The step marker is an orange square, not orange type.

import { C, ink, onDark } from '../components/curriculum-theme';

export interface StartSurface {
  /** Page ground. */
  pageBg: string;
  /** Primary type. */
  ink: string;
  /** Secondary type: the sub, the fine print, the district note. */
  muted: string;
  /** The hairline rule. Decorative separator, so no contrast floor applies. */
  rule: string;
  /** Link at rest. */
  link: string;
  /** Link on hover. */
  linkHover: string;
  /** Focus ring. WCAG 1.4.11 wants 3:1 and both sides clear it. */
  focus: string;
  /** The checkout card's fill, a step above the page ground. */
  cardBg: string;
  /** The card's only boundary. Carries the whole separation in dark, where the
   *  card sits 1.12:1 from the page and the fill alone would not read as an
   *  edge. That is the flat panel system working as intended: an edge is a
   *  rule, never a shadow. */
  cardEdge: string;
  /** The card's header strip, a further step above the card. */
  stripBg: string;
  /** Type on the strip. */
  stripInk: string;
}

export const START_LIGHT: StartSurface = {
  pageBg: C.sand,
  ink: C.midnight,
  muted: ink(0.6),
  // RAIL_LIGHT.divider's exact rgba, which is Deep Midnight at 0.12.
  rule: 'rgba(14,14,17,0.12)',
  link: '#2F6091',
  linkHover: '#0F69BA',
  focus: '#0F69BA',
  // Paper, which curriculum-theme names for exactly this: "cards and bubbles sit
  // a shade above Warm Sand". Deep Midnight on it is 18.96.
  cardBg: C.paper,
  cardEdge: 'rgba(14,14,17,0.16)',
  // Mercury Cream, the strip colour the mock asks for by name. ink(0.6) on it is
  // 4.62, which clears AA, so the tracked label stays readable at 11px.
  stripBg: C.cream,
  stripInk: ink(0.65),
};

export const START_DARK: StartSurface = {
  pageBg: C.midnight,
  ink: C.sand,
  muted: onDark(0.65),
  // RAIL_DARK.divider's exact rgba, which is Warm Sand at 0.14.
  rule: 'rgba(242,237,223,0.14)',
  link: C.gemini,
  linkHover: '#5AAAEE',
  focus: '#5AAAEE',
  // Warm rather than a blue-black, so the card reads as a sibling of the light
  // one. Warm Sand ink on it is 14.72 and onDark(0.65) is 6.87.
  cardBg: '#1C1B18',
  cardEdge: 'rgba(242,237,223,0.16)',
  // RAIL_DARK.bg's exact hex, the app's existing "Mercury Cream in the dark".
  // Warm Sand on it is 13.74, onDark(0.65) is 6.58.
  stripBg: '#23211D',
  stripInk: onDark(0.7),
};

export function startSurface(theme: 'light' | 'dark'): StartSurface {
  return theme === 'dark' ? START_DARK : START_LIGHT;
}

// ─── The nav bar ─────────────────────────────────────────────────────────────
//
// Deep Midnight in BOTH themes, because the brief asks for a dark nav and a dark
// nav that turns cream in light mode is not one. In dark mode it shares the page
// ground, so the bottom hairline is what separates them. That is the flat panel
// system doing its job: an edge is a rule, never a shadow.
export const NAV = {
  bg: C.midnight,
  ink: C.sand,
  rule: 'rgba(242,237,223,0.14)',
  /** Hover ground for the toggle. Warm Sand at a low alpha, same as RAIL_DARK. */
  hoverBg: 'rgba(242,237,223,0.08)',
  /** The toggle's resting edge. */
  line: 'rgba(242,237,223,0.30)',
} as const;

// ─── The primary action ──────────────────────────────────────────────────────
//
// Sunset Orange fill with Deep Midnight type at 9.19:1. Identical in both
// themes: the orange clears AA on either ground and swapping it would make the
// one fixed point on the page move.
//
// NO SHADOW. curriculum-theme exports SHADOW_PRESSABLE, a 2px lip, and it is
// deliberately not used here. The brief rules out shadows outright, so the
// button reads as pressable from its fill alone.
export const CTA = {
  bg: C.sunset,
  ink: C.midnight,
  hoverBg: C.sunsetHover,
} as const;

/** Every container edge and control in this flow is square. */
export const RADIUS = 0;
