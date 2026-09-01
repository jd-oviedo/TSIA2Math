// The adaptive test palette. Four screens run on it: the "before you begin"
// start card, the question, the reveal, and the results.
//
// WHY THIS IS NOT IN app/theme/themes.ts. ThemeProvider loops over every var in
// a theme and writes it onto <html> as an inline style, on every page in the app
// (ThemeProvider.tsx:36-41). The global --ec-* set is read by /, /teacher,
// /reporte, Header, Footer, Calculator and FigureRenderer, so retuning it to
// brand the CAT would repaint the entire product for the benefit of four
// screens.
//
// So this mirrors app/login/login-theme.ts and app/components/dashboard-theme.ts,
// which solved the same problem for /login and /dashboard: scoped variables on a
// wrapper element, flipped by one data-theme attribute, named --umc-* rather
// than --ec-* so they cannot collide with the global theme underneath.
//
// The theme itself is NOT re-implemented. CatChrome reads useTheme(), the same
// hook and the same single ThemeProvider the rest of the app uses, and the
// choice persists under the existing "ec-theme" localStorage key. The Header's
// own toggle still drives this surface. There is no second theme storage
// mechanism here.
//
// WHAT THIS SURFACE USED TO BE, recorded because the change is large. Every one
// of the 178 colour references across page.tsx, ItemCard.tsx and
// ResultsSummary.tsx read --ec-*. That meant the CAT inherited a Deep Navy CTA
// (#1A1F2E light / #5AAAEE dark), a blue accent that resolved to #0F69BA, and
// fifteen box shadows. None of it was wrong; none of it was the brand either.
//
// ─── TWO VALUES DEVIATE FROM THE BRIEF, AND BOTH ARE CONTRAST FIXES ─────────
//
// The brief asks for eyebrow gold #C8A96E and data blue #6E9DC8 as TEXT. Both
// fail AA on the light side, and this repo has already measured and rejected
// both in exactly that role:
//
//   gold #C8A96E as text   2.24 on white     dashboard-theme.ts:122
//                          1.92 on sand      TeacherDashboardClient.tsx:269
//   blue #6E9DC8 as text   2.19 on cream     curriculum-surface.ts:443-450
//                          2.50 on the band, 2.82 on paper
//
// curriculum-surface.ts fixed the blue by darkening it to #2F6091 for the light
// side and keeping #6E9DC8 unmodified in dark, where it already passes. That is
// the same shape dashboard-theme.ts:125-128 uses for Sunset:
//
//   "#A8631F IS A DARKENED TEXT-ONLY VARIANT OF SUNSET, NOT A COMPETING
//    ORANGE ... paired with C.sunset's exact hex in dark, where that already
//    passes. One orange doing two jobs across two themes."
//
// This file follows that rule rather than inventing a third one. goldInk and
// blueInk are TEXT-ONLY variants; gold and blue keep the brand hexes and are
// used for fills and rules, where contrast is not a text requirement. Measured
// on the surfaces these actually render on:
//
//                        light card #FFFFFF   dark card #17171B
//   goldInk  #9E6512 / #C8A96E      4.86                8.20
//   blueInk  #2F6091 / #6E9DC8      6.56                6.33
//
// #9E6512 is login-theme.ts's amber-as-text value, reused rather than re-derived.
// #2F6091 is curriculum-surface.ts's link value, likewise.
//
// ONE MEASUREMENT WORTH RECORDING: goldInk light is 4.45 on the PAGE ground
// #F5F5F3, which is under 4.5. No consumer sits there. Every eyebrow and section
// label on this surface renders on a card, where it is 4.86. If a gold label is
// ever put directly on the page ground, that is the point to darken it further,
// not to assume this number covered it.
//
// ─── ONE MEASUREMENT UNDER THRESHOLD IN THE GROUNDED PAIR, FLAGGED ─────────
//
// The reveal eyebrow is the only place a state colour carries text at label
// size. Measured on the panel it actually renders on, at 11px weight 700, which
// does NOT qualify for the 3:1 large-text allowance:
//
//                                            light          dark
//   correctInk on correctPanel      #4E7A51 / #EEF4EE  4.45   #8FBE93 / #182618  7.49
//   incorrectInk on incorrectPanel  #B23A2E / #F9EFED  5.26   #DC9086 / #261613  6.71
//
// Light correct is 4.45 against a 4.5 target. It is a 1 percent miss on one
// label and the values are the brief's, specified as a fixed pair, so it is
// recorded here rather than silently retuned. Darkening correctInk to about
// #4A7550 clears it without moving the border or the fill, which read against
// the card rather than the panel. That is a one-line change if it is wanted.
//
// ─── ORANGE IS A FILL, NEVER A LABEL ────────────────────────────────────────
//
// Same standing rule as curriculum-surface.ts:80. #F0A33E measures 2.10 on white
// and cannot carry text at any size. It is the CTA fill, the selected-option
// border and the progress fill on this surface, and nothing else. The reveal
// eyebrow that used to be orange (ItemCard.tsx:255) takes a state colour in
// Phase 2.

import { gridBackground, GRID_SIZE } from '../login/login-theme';
// BY REFERENCE, NEVER RE-TYPED, exactly as login-theme.ts takes its own dark
// values from this module. The grid line in dark IS the dashboard hairline.
import { DARK as DASH_DARK } from '../components/dashboard-theme';

export type CatThemeName = 'light' | 'dark';

export interface CatSurface {
  /** Page ground. Also what CatChrome writes to document.body. */
  page: string;
  /** Cards, option rows, panels, form controls. */
  card: string;
  /** The hairline. Card edges, dividers, table rules. */
  border: string;
  /** Body copy, headings, question and option text. */
  ink: string;
  /** Secondary copy, fine print, stat labels, table headers. */
  muted: string;

  /** Cipher Gold as a FILL or RULE. Never text: see the header. */
  gold: string;
  /** Cipher Gold as TEXT. Eyebrows and section labels. */
  goldInk: string;
  /** Gemini Blue as a FILL or RULE. */
  blue: string;
  /** Gemini Blue as TEXT. Data figures, scores, strand labels. */
  blueInk: string;
  /** The wash behind a data chip (difficulty badge, level chip). */
  blueTint: string;
  /** The edge of a data chip. Replaces a hardcoded rgba(15,105,186,0.15). */
  blueLine: string;

  /** Sunset Orange. CTA fill, selected border, progress fill. Never text. */
  cta: string;
  /** Ink on the orange fill. Dark in both themes: the CTA does not invert. */
  ctaInk: string;
  /** Selected-but-not-yet-submitted option: border. */
  selLine: string;
  /** Selected-but-not-yet-submitted option: background. */
  selBg: string;

  /** Secondary control text (Cancel, "Flag an issue"). */
  ctlInk: string;
  /** Secondary control edge. Clears 3:1 as a control boundary, WCAG 1.4.11. */
  ctlLine: string;

  /** Google sign-in fill. Deliberately NOT the CTA: see the header note below. */
  signinBg: string;
  /** Google sign-in label. */
  signinInk: string;
  /** Google sign-in edge. The only thing marking it as a control. */
  signinLine: string;

  /** The graph-paper line on the page ground. Texture only, carries nothing. */
  grid: string;
  /** Unfilled portion of a progress or category bar. */
  track: string;
  /** Disabled control fill. */
  disabled: string;
  /** Disabled control label. */
  disabledInk: string;

  /** Correct, as text: the check glyph, "College Ready". */
  correctInk: string;
  /** Correct, as a border. */
  correctLine: string;
  /** Correct, as a solid fill: the option marker, a strong category bar. */
  correctFill: string;
  /** Correct, as a card wash: the correct option row after reveal. */
  correctCard: string;
  /** Correct, as a panel wash: the explanation panel under a right answer. */
  correctPanel: string;
  /** Incorrect, as text: the cross glyph, error copy. */
  incorrectInk: string;
  /** Incorrect, as a border. */
  incorrectLine: string;
  /** Incorrect, as a solid fill: the option marker. */
  incorrectFill: string;
  /** Incorrect, as a card wash: a wrongly chosen option, the error box. */
  incorrectCard: string;
  /** Incorrect, as a panel wash: the explanation panel under a wrong answer. */
  incorrectPanel: string;
  /** The glyph on a filled correct/incorrect marker. White in both themes. */
  markerInk: string;
}

const LIGHT: CatSurface = {
  page: '#F5F5F3',
  card: '#FFFFFF',
  border: '#E6E2D8',
  ink: '#0E0E11',
  muted: '#5F5E5A', // 6.49 on card, 5.95 on page

  gold: '#C8A96E',
  goldInk: '#9E6512', // 4.86 on card. login-theme.ts's amber-as-text value.
  blue: '#6E9DC8',
  blueInk: '#2F6091', // 6.56 on card. curriculum-surface.ts's link value.
  blueTint: '#EEF4FA',
  blueLine: 'rgba(110,157,200,0.45)',

  cta: '#F0A33E',
  ctaInk: '#0E0E11', // 9.09 on the fill
  selLine: '#F0A33E',
  selBg: '#FDF4E7',

  ctlInk: '#0F1E35',
  ctlLine: 'rgba(15,30,53,0.35)',

  // A white button on a white card needs its edge to do the work, so this is
  // .45 rather than the decorative hairline. Same reasoning, and the same
  // value, as login-theme.ts's toggleOffLine: a component boundary under WCAG
  // 1.4.11 has to clear 3:1, and the hairline #E6E2D8 is 1.14.
  signinBg: '#FFFFFF',
  signinInk: '#0E0E11',
  signinLine: 'rgba(14,14,17,0.45)',

  grid: 'rgba(0,0,0,0.055)', // login-theme.ts LIGHT.grid, verbatim
  track: 'rgba(14,14,17,0.10)',
  disabled: 'rgba(14,14,17,0.06)',
  disabledInk: 'rgba(14,14,17,0.42)',

  correctInk: '#4E7A51', // 4.97 on card
  correctLine: '#4E7A51',
  correctFill: '#4E7A51',
  correctCard: '#EAF3EA',
  correctPanel: '#EEF4EE',
  incorrectInk: '#B23A2E', // 5.94 on card
  incorrectLine: '#B23A2E',
  incorrectFill: '#B23A2E',
  incorrectCard: '#F7ECEA',
  incorrectPanel: '#F9EFED',
  markerInk: '#FFFFFF',
};

const DARK: CatSurface = {
  page: '#0E0E11',
  card: '#17171B',
  border: 'rgba(255,255,255,0.10)',
  ink: '#E8E0CF', // 13.83 on card
  muted: '#8C8B80', // 5.29 on card

  // Both brand values hold as text on a #17171B card, so dark takes the brand
  // hex for the ink role as well. Same shape as curriculum-surface.ts, where
  // only the light side needed darkening.
  gold: '#C8A96E',
  goldInk: '#C8A96E', // 8.20 on card
  blue: '#6E9DC8',
  blueInk: '#6E9DC8', // 6.33 on card
  blueTint: 'rgba(110,157,200,0.16)',
  blueLine: 'rgba(110,157,200,0.35)',

  // The CTA does not invert, for the reason login-theme.ts and
  // curriculum-surface.ts both give about their own: the label's contrast is
  // against the fill, so 9.09 holds in both themes, and an orange button is
  // what a returning student recognises before reading it.
  cta: '#F0A33E',
  ctaInk: '#0E0E11',
  selLine: '#F0A33E',
  selBg: '#241C10',

  // Navy #0F1E35 is a secondary-control ink on a light ground and would be
  // 1.15 on this one. Dark takes the page ink instead, and the control keeps
  // its identity from the border rather than from the text colour.
  ctlInk: '#E8E0CF',
  ctlLine: 'rgba(255,255,255,0.30)',

  signinBg: '#17171B',
  signinInk: '#E8E0CF',
  signinLine: 'rgba(255,255,255,0.40)',

  grid: DASH_DARK.hairline, // login-theme.ts DARK.grid, by the same reference
  track: 'rgba(255,255,255,0.12)',
  disabled: 'rgba(255,255,255,0.07)',
  disabledInk: 'rgba(255,255,255,0.38)',

  correctInk: '#8FBE93', // 8.61 on card
  correctLine: '#4E7A51',
  correctFill: '#4E7A51',
  correctCard: '#1A2A1C',
  correctPanel: '#182618',
  incorrectInk: '#DC9086', // 7.24 on card
  incorrectLine: '#B23A2E',
  incorrectFill: '#B23A2E',
  incorrectCard: '#2A1815',
  incorrectPanel: '#261613',
  markerInk: '#FFFFFF',
};

const VAR_NAMES: Record<keyof CatSurface, string> = {
  page: '--umc-page',
  card: '--umc-card',
  border: '--umc-border',
  ink: '--umc-ink',
  muted: '--umc-muted',
  gold: '--umc-gold',
  goldInk: '--umc-gold-ink',
  blue: '--umc-blue',
  blueInk: '--umc-blue-ink',
  blueTint: '--umc-blue-tint',
  blueLine: '--umc-blue-line',
  cta: '--umc-cta',
  ctaInk: '--umc-cta-ink',
  selLine: '--umc-sel-line',
  selBg: '--umc-sel-bg',
  ctlInk: '--umc-ctl-ink',
  ctlLine: '--umc-ctl-line',
  signinBg: '--umc-signin-bg',
  signinInk: '--umc-signin-ink',
  signinLine: '--umc-signin-line',
  grid: '--umc-grid',
  track: '--umc-track',
  disabled: '--umc-disabled',
  disabledInk: '--umc-disabled-ink',
  correctInk: '--umc-correct-ink',
  correctLine: '--umc-correct-line',
  correctFill: '--umc-correct-fill',
  correctCard: '--umc-correct-card',
  correctPanel: '--umc-correct-panel',
  incorrectInk: '--umc-incorrect-ink',
  incorrectLine: '--umc-incorrect-line',
  incorrectFill: '--umc-incorrect-fill',
  incorrectCard: '--umc-incorrect-card',
  incorrectPanel: '--umc-incorrect-panel',
  markerInk: '--umc-marker-ink',
};

const KEYS = Object.keys(VAR_NAMES) as (keyof CatSurface)[];

function declarations(s: CatSurface): string {
  return KEYS.map((k) => `  ${VAR_NAMES[k]}: ${s[k]};`).join('\n');
}

/**
 * The resolved values, keyed by theme.
 *
 * Read this ONLY where a var() reference cannot be resolved by the element that
 * needs it. Today that is exactly one caller: CatChrome passing the page ground
 * to useBodyBackground, because custom properties inherit downward and <body>
 * is an ANCESTOR of the wrapper that declares them. Everything else uses C.
 */
export const SURFACES: Record<CatThemeName, CatSurface> = { light: LIGHT, dark: DARK };

/** The var() reference for a token, for use in inline styles. */
export const C: Record<keyof CatSurface, string> = Object.fromEntries(
  KEYS.map((k) => [k, `var(${VAR_NAMES[k]})`])
) as Record<keyof CatSurface, string>;

/**
 * Type.
 *
 * Headings stay Kodchasan, which is what this surface already used for the two
 * display headlines. Prose is Nunito, the document default set in globals.css.
 *
 * NOTHING NEW IS LOADED, AND THAT IS THE DECISION RATHER THAN AN OMISSION.
 * ItemCard carried "Georgia, 'Times New Roman', serif" on five inline styles --
 * the question, the option text, the explanation, the distractor note and the
 * sign-in copy -- which made the CAT the only surface in the product setting
 * prose in a serif. Those five are removed, so prose falls to Nunito with the
 * rest of the app.
 *
 * KaTeX keeps its own faces, which arrive from katex/dist/katex.min.css and
 * were never affected by the inline serif. Math is therefore the only serif
 * left on the surface, which is the target. NO .katex FONT RULE IS ADDED HERE
 * OR ANYWHERE: globals.css:19-60 records at length why reaching inside KaTeX
 * from app CSS is a trap, and none of that changes.
 */
export const FONT_HEADING = "var(--font-kodchasan), 'Kodchasan', sans-serif";
export const FONT_BODY = "var(--font-nunito), 'Nunito', sans-serif";

/**
 * ─── MOTION ──────────────────────────────────────────────────────────────────
 *
 * Theme-independent: a duration does not change between light and dark, so
 * these sit outside CatSurface rather than being declared twice.
 *
 * THE JS NUMBERS AND THE CSS TOKENS ARE THE SAME VALUES FROM ONE PLACE. Some of
 * this motion is a CSS transition and some of it is a script counting frames,
 * and the two have to agree: the next-question cross-fade holds the outgoing
 * question in a setTimeout for exactly as long as the CSS transition that is
 * fading it. MOTION below is the source, and CAT_MOTION_CSS is generated from
 * it, so the two cannot drift.
 */
export const MOTION = {
  /** One curve for everything on this surface. */
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
  /** A state swap: an option border taking the selected colour. */
  durFast: 150,
  /** A thing arriving or leaving: the question card, an option, the badge. */
  durBase: 240,
  /** The largest move here: the explanation opening, the progress bar. */
  durSlow: 400,
  /** How far an entering element travels up into place. */
  enterTravel: 10,
  /** How far a leaving element lifts out. Shorter than the entrance: the exit
      is a dismissal and the entrance is an arrival. */
  exitTravel: 8,
  /** The results score counting up to its value. */
  scoreCountDur: 900,
  /** One cycle of the "Adjusting to your level" dot. */
  pulseDur: 1400,
} as const;

/**
 * The motion tokens, plus THREE OVERRIDES OF app/motion.ts's OWN TOKENS.
 *
 * The entrance on this surface is the shared two-lock system: .um-motion on the
 * question wrapper, .um-fade-up on the card and each option, .um-stagger on the
 * option list. That buys the keyframes, the nth-child stagger, the tail clamp
 * and -- the reason it is worth reusing rather than reimplementing -- the
 * reduced-motion guard, all of which are already written and already verified.
 *
 * What it does NOT buy is this surface's pacing. app/motion.ts paces a page
 * settling in: 600ms at 60ms steps. A question arriving inside a test the
 * student is already looking at is a faster event, and the brief sets it at
 * 240ms and 70ms.
 *
 * --um-dur-4, --um-stagger and --um-ease-out are custom properties, and custom
 * properties inherit, so redeclaring them on .um-cat re-paces the shared
 * classes for this surface and NOTHING ELSE. app/motion.ts is not edited, the
 * :root values it declares are untouched, and every other surface that opts in
 * keeps the 600/60 entrance. This is the same mechanism the question card uses
 * to bring FigureRenderer onto the CAT palette.
 *
 * --um-rise is deliberately NOT overridden: it is already 10px, which is
 * exactly the brief's enterTravel. Restating it would create a second name for
 * one number and a second thing to keep in step.
 */
export const CAT_MOTION_CSS = `
.um-cat, .um-home {
  --umc-ease: ${MOTION.ease};
  --umc-dur-fast: ${MOTION.durFast}ms;
  --umc-dur-base: ${MOTION.durBase}ms;
  --umc-dur-slow: ${MOTION.durSlow}ms;
  --umc-enter-travel: ${MOTION.enterTravel}px;
  --umc-exit-travel: ${MOTION.exitTravel}px;

  /* Re-pacing the shared entrance for this surface only. See the note above. */
  --um-dur-4: ${MOTION.durBase}ms;
  --um-stagger: 70ms;
  --um-ease-out: ${MOTION.ease};
}
`;

/**
 * Light by default, dark under [data-theme="dark"]. Dropped into CAT_CSS.
 *
 * ─── TWO SELECTORS, AND .um-home IS NOT AN AFTERTHOUGHT ────────────────────
 *
 * The home hero and the adaptive test are the only two surfaces that render
 * the shared Header, and this pass moves both onto the same flat ground, the
 * same hairline, the same grid and the same orange CTA. They are one visual
 * system with two routes, so they read one token scale.
 *
 * .um-home rather than putting .um-cat on the marketing page: the class name
 * would be a lie, and a lie in a selector is the kind that survives for years.
 * Adding the second selector here costs one line and keeps both names honest.
 */
export const CAT_VARS_CSS = `
.um-cat, .um-home {
${declarations(LIGHT)}
}
.um-cat[data-theme="dark"], .um-home[data-theme="dark"] {
${declarations(DARK)}
}
`;

/**
 * Everything the surface needs in one <style>, emitted by CatChrome.
 *
 * ─── THE BODY GROUND IS NOT SET HERE, AND MUST NOT BE MOVED INTO IT ─────────
 *
 * The obvious tidy-up is a `body:has(.um-cat) { background: ... }` rule at this
 * spot. It is the same rule that was removed from /login, /dashboard and
 * /course, and it is broken for the same two reasons, which are written out in
 * full at app/components/useBodyBackground.ts:71-120:
 *
 *   1. app/layout.tsx:51 paints the body background from an INLINE style prop,
 *      and an inline declaration outranks every stylesheet rule at every
 *      specificity unless the rule carries !important.
 *   2. :has() is Selectors Level 4 and does not parse on Safari below 15.4,
 *      where an unparseable selector drops its own rule outright.
 *
 * And a flat `body { background: ... !important }` cannot work either, because
 * the theme marker lives on a DESCENDANT: ThemeProvider stamps no attribute on
 * <html> for a body rule to switch on, so one flat selector would paint a light
 * gutter behind a dark page. CatChrome calls useBodyBackground instead.
 *
 * ─── NEVER WRITE AN OPENING STYLE TAG INSIDE THE TEMPLATE BELOW ─────────────
 *
 * Not even in a CSS comment. React escapes an embedded style tag differently on
 * the server than on the client, and every page emitting the string logs a
 * hydration mismatch that names the <style> element as the culprit. See
 * app/motion.ts's note on the same trap. Write "stylesheet" instead.
 */
export const CAT_CSS = `
${CAT_VARS_CSS}
${CAT_MOTION_CSS}

/* The surface owns its own ground and ink rather than inheriting the global
   --ec-bg / --ec-ink that app/layout.tsx puts on body. Scoped, so nothing
   outside these two routes moves.

   background-color and background-image are set SEPARATELY rather than through
   the background shorthand. NO BACKTICKS IN THIS COMMENT, deliberately: it
   lives inside a template literal, and one would end the string here. Same
   family of trap as the style-tag note above.

   The shorthand resets every background-* property it does not name, including
   background-size, so a later shorthand would silently drop the 62px tile and
   leave the grid drawn at its default size. */
.um-cat, .um-home {
  background-color: ${C.page};
  background-image: ${gridBackground(C.grid)};
  background-size: ${GRID_SIZE};
  color: ${C.ink};
}

/* THE REDUCED-MOTION GUARD FOR THE PAGE-LOAD ENTRANCE.
   ===================================================
   app/components/Entrance.tsx mounts its content at opacity 0 and releases it
   after the theme commits. That hidden state is in the SERVER MARKUP, which is
   what makes the entrance flash-free for everyone else -- and what made it
   wrong for a visitor who asked for less motion, who was shown a translated,
   invisible block until React hydrated and could clear it.

   No script can fix that, because the offending frame is painted before any
   script has run. A media query can: it applies at first paint, with no
   JavaScript, on the static HTML. Same shape as the guard at the bottom of
   app/motion.ts, and the same reasoning -- the preference is a CSS fact, so the
   answer to it is CSS.

   !important because Entrance sets opacity and transform as INLINE style props,
   and nothing weaker than !important outranks an inline declaration. */
@media (prefers-reduced-motion: reduce) {
  .um-entrance {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}

/* KaTeX is the ONLY serif on this surface, and the only thing this rule does is
   stop the global --ec-ink from painting math in a colour the CAT no longer
   uses. Colour only. No font, no size, no spacing: see globals.css:19-60. */
.um-cat .katex, .um-home .katex { color: ${C.ink} !important; }
`;
