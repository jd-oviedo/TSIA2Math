// The login surface palette, from the "Unpackmath login redesign" design import
// (options 1a and 1d). Three screens run on it: the role selector, the teacher
// sign-in and the student sign-in.
//
// WHY THIS IS NOT IN app/theme/themes.ts. ThemeProvider loops over every var in
// a theme and writes it onto <html> as an inline style, on every page in the app
// (ThemeProvider.tsx:36-41). Putting twenty-six login-only properties there
// would stamp them onto the teacher dashboard, the CAT engine and every topic
// page for the benefit of three screens.
//
// So this mirrors app/components/dashboard-theme.ts, which solved the same
// problem for /dashboard and says so in its own header: scoped variables on a
// wrapper element, flipped by one data-theme attribute, named --uml-* rather
// than --ec-* so they cannot collide with the global theme underneath.
//
// The theme itself is NOT re-implemented. The wrapper reads useTheme(), which is
// the same hook and the same single ThemeProvider the rest of the app uses, and
// the choice persists under the existing "ec-theme" localStorage key. There is
// no second theme storage mechanism here.
//
// ─── Where the dark values came from ─────────────────────────────────────────
//
// The import is light only. Six dark values are the app's existing ones rather
// than parallel inventions, marked [reuse] below. The rest are new because the
// design introduces roles the app has never had: a hard 1px rule, graph paper,
// and a two-state monospace toggle.
//
// ─── Where the LIGHT values deviate from the import ──────────────────────────
//
// Six, all contrast-driven, all measured and approved rather than adjusted by
// eye. Ratios are WCAG 2.1 with alpha composited over the stated ground.
//
//   amber as TEXT   #C8821F -> #9E6512   2.97:1 on ground, 3.15:1 on card. The
//                                        eyebrow is 11px and links are 13px, so
//                                        neither qualifies for the 3:1 large-text
//                                        allowance. #9E6512 gives 4.58 / 4.86.
//                                        The app's own teacher gold #C68A2F is
//                                        WORSE (2.80 / 2.97), so there was no
//                                        brand value to fall back to.
//   amber as RULE   #C8821F kept         Decorative 22x1px dash beside the
//                                        eyebrow, carrying nothing the label
//                                        does not. Exempt, so it keeps the
//                                        design's colour.
//   footer mono     .50 -> .58           3.98:1 -> 5.32:1.
//   inactive pill   .18 -> .45           1.53:1 -> 3.35:1. Unlike the grid this
//                                        IS a component boundary (WCAG 1.4.11):
//                                        it is the only thing marking the
//                                        unselected pill as a control.
//   error / success                      --ec-red and --ec-green FAIL in light
//                                        (4.00 and 3.33), so light gets its own
//                                        values. Their dark counterparts pass
//                                        and are reused.
//   focus                                The import defines no focus treatment
//                                        at all and sets outline:none on its
//                                        inputs. See FOCUS_RING below.
//
// ─── Deliberately below threshold, do not "fix" ──────────────────────────────
//
// grid (1.13 / 1.12), barLine (1.32 / 1.44) and the three disabled tokens
// (~3.0) are all under their nominal targets ON PURPOSE. WCAG 1.4.11 covers
// graphics required to understand content or identify a component; 62px graph
// paper is texture and the header hairline separates two already-distinct
// fills. Disabled controls are exempt from 1.4.3 outright. Recorded here so a
// later audit reads them as decisions rather than misses.

import type { ThemeName } from '../theme/themes';

export interface LoginSurface {
  ground: string;
  grid: string;
  bar: string;
  barLine: string;
  card: string;
  border: string;
  ink: string;
  ink2: string;
  inkMono: string;
  amber: string;
  amberRule: string;
  cta: string;
  ctaInk: string;
  ctaShadow: string;
  cream: string;
  creamInk: string;
  creamLine: string;
  blue: string;
  tintAmber: string;
  tintBlue: string;
  toggleOn: string;
  toggleOnInk: string;
  toggleOffLine: string;
  focus: string;
  disabled: string;
  disabledInk: string;
  disabledLine: string;
  error: string;
  success: string;
}

const LIGHT: LoginSurface = {
  ground: '#FAF8F5',
  grid: 'rgba(0,0,0,0.055)',
  bar: '#FFFFFF',
  barLine: 'rgba(0,0,0,0.12)',
  card: '#FFFFFF',
  border: '#111111',
  ink: '#111111',
  ink2: 'rgba(0,0,0,0.55)',
  inkMono: 'rgba(0,0,0,0.58)',
  amber: '#9E6512',
  amberRule: '#C8821F',
  cta: '#F0A33E',
  ctaInk: '#111111',
  ctaShadow: '#111111',
  // Cream, from the current brand palette (curriculum-theme.ts C.cream). The
  // darkest of the seven creams there, chosen because it is the one with any
  // separation at all from the page ground -- and even it is only 1.24:1.
  cream: '#E8E0CF',
  creamInk: '#111111',
  creamLine: '#111111',
  blue: '#6BADDA',
  tintAmber: '#FDF3E3',
  tintBlue: '#EEF6FC',
  toggleOn: '#111111',
  toggleOnInk: '#FFFFFF',
  toggleOffLine: 'rgba(0,0,0,0.45)',
  focus: '#0F69BA',
  disabled: 'rgba(0,0,0,0.06)',
  disabledInk: 'rgba(0,0,0,0.42)',
  disabledLine: 'rgba(0,0,0,0.30)',
  error: '#B84A40',
  success: '#2F7F53',
};

const DARK: LoginSurface = {
  ground: '#0C1120', // [reuse] --ec-bg dark
  grid: 'rgba(255,255,255,0.05)',
  bar: '#161E30', // [reuse] --ec-surface dark
  barLine: 'rgba(255,255,255,0.12)',
  card: '#161E30', // [reuse] --ec-surface dark
  // The one value with no counterpart anywhere in the app. --ec-line dark is
  // rgba(255,255,255,0.07), which is 1.15:1 and would erase the design's
  // signature element; a literal inversion to #E8EEF8 glares. .42 is what
  // clears 3:1 on both dark surfaces (3.67 on ground, 3.61 on card) while
  // still reading as a rule.
  border: 'rgba(232,238,248,0.42)',
  ink: '#E8EEF8', // [reuse] --ec-ink dark
  ink2: 'rgba(232,238,248,0.58)', // [reuse] --ec-ink-muted dark
  inkMono: 'rgba(232,238,248,0.58)',
  amber: '#F2A541', // [reuse] --ec-orange dark
  amberRule: '#F2A541',
  // The CTA does not invert. Its label contrast is against the fill, not the
  // page, so it holds in both themes -- and an orange button is the one thing
  // on these screens a returning student recognises before reading.
  //
  // #F0A33E Sunset, was #E8A33D. UNIFIED 2026-08-22, discrepancy D1.
  // curriculum-surface.ts unified on Sunset on 2026-08-21 and this file did not,
  // which left two oranges live on adjacent surfaces for a day. Both cleared
  // their #111111 label (9.00 and 8.76) so nothing was failing; the reason to
  // pick one is that nobody sees them side by side and everybody who reads the
  // palette later has to explain why there are two.
  cta: '#F0A33E',
  ctaInk: '#111111',
  ctaShadow: 'rgba(232,238,248,0.42)',
  // Cream does not invert either, for the same reason the orange did not: the
  // label's contrast is against the fill, so 14.38:1 holds in both themes.
  cream: '#E8E0CF',
  creamInk: '#111111',
  // THE BORDER DOES NOT FOLLOW THE THEME HERE, and this is the one thing that
  // needed deciding rather than copying. --uml-border is
  // rgba(232,238,248,0.42) in dark, which measures 1.05:1 against a cream fill
  // -- the design's signature hard rule would simply vanish on this one
  // element. #111 gives 14.38:1 on cream in both themes, so the button keeps
  // its outline. It is a dark rule on a light fill either way, which is what
  // the light theme already does.
  creamLine: '#111111',
  blue: '#6BADDA',
  tintAmber: 'rgba(232,163,61,0.12)',
  tintBlue: 'rgba(107,173,218,0.12)',
  toggleOn: '#E8EEF8',
  toggleOnInk: '#0C1120',
  toggleOffLine: 'rgba(232,238,248,0.42)',
  focus: '#5AAAEE', // [reuse] --ec-accent dark
  disabled: 'rgba(232,238,248,0.08)',
  disabledInk: 'rgba(232,238,248,0.38)',
  disabledLine: 'rgba(232,238,248,0.24)',
  error: '#E07B72', // [reuse] --ec-red dark
  success: '#5BC48A', // [reuse] --ec-green dark
};

export const SURFACES: Record<ThemeName, LoginSurface> = { light: LIGHT, dark: DARK };

const VAR_NAMES: Record<keyof LoginSurface, string> = {
  ground: '--uml-ground',
  grid: '--uml-grid',
  bar: '--uml-bar',
  barLine: '--uml-bar-line',
  card: '--uml-card',
  border: '--uml-border',
  ink: '--uml-ink',
  ink2: '--uml-ink-2',
  inkMono: '--uml-ink-mono',
  amber: '--uml-amber',
  amberRule: '--uml-amber-rule',
  cta: '--uml-cta',
  ctaInk: '--uml-cta-ink',
  ctaShadow: '--uml-cta-shadow',
  cream: '--uml-cream',
  creamInk: '--uml-cream-ink',
  creamLine: '--uml-cream-line',
  blue: '--uml-blue',
  tintAmber: '--uml-tint-amber',
  tintBlue: '--uml-tint-blue',
  toggleOn: '--uml-toggle-on',
  toggleOnInk: '--uml-toggle-on-ink',
  toggleOffLine: '--uml-toggle-off-line',
  focus: '--uml-focus',
  disabled: '--uml-disabled',
  disabledInk: '--uml-disabled-ink',
  disabledLine: '--uml-disabled-line',
  error: '--uml-error',
  success: '--uml-success',
};

const KEYS = Object.keys(VAR_NAMES) as (keyof LoginSurface)[];

function declarations(s: LoginSurface): string {
  return KEYS.map((k) => `  ${VAR_NAMES[k]}: ${s[k]};`).join('\n');
}

/** The var() reference for a token, for use in inline styles. */
export const L: Record<keyof LoginSurface, string> = Object.fromEntries(
  KEYS.map((k) => [k, `var(${VAR_NAMES[k]})`])
) as Record<keyof LoginSurface, string>;

// ─── Type ────────────────────────────────────────────────────────────────────
//
// TWO TOKENS, AND THEY ARE PLACEHOLDERS PENDING A DECISION. The import asks for
// Nunito 800 headlines and Space Mono labels. Neither is loaded today: layout.tsx
// carries Nunito at 400-700 and there is no monospace face in the brand system
// at all.
//
// Until that is settled nothing new is loaded here. Headlines render at the 700
// already available, and the mono stack names 'Space Mono' first so it takes
// effect the moment the face is added without another edit to the call sites.
//
// Measured, so the cost of the fallback is known rather than assumed: "CAMBIAR
// ROL" sets 110.7px in Space Mono and 106.1px in ui-monospace. That 4.6px
// matters -- the header has 12px of slack at 390px -- so the responsive
// verification is not final until the face is fixed.
export const FONT_DISPLAY = "var(--font-nunito), 'Nunito', sans-serif";
export const FONT_MONO = "'Space Mono', ui-monospace, Menlo, monospace";
export const DISPLAY_WEIGHT = 700;

/**
 * The focus treatment, which the import does not define and which one colour
 * cannot provide: #0F69BA is 5.28:1 on the ground but only 2.60:1 on the orange
 * CTA, the control where it matters most.
 *
 * Two-tone instead. The inner 2px ring is painted in the surface behind the
 * control, so the visible ring is separated from the fill and only ever has to
 * clear 3:1 against the PAGE -- which it does in both themes (5.28 light, 7.54
 * dark) regardless of what it sits on. Square, no radius, matching everything
 * else here.
 */
export function focusRing(surface: string = L.ground): string {
  return `0 0 0 2px ${surface}, 0 0 0 4px ${L.focus}`;
}

/** Light by default, dark under [data-theme="dark"]. Dropped into LOGIN_CSS. */
export const LOGIN_VARS_CSS = `
.um-login {
${declarations(LIGHT)}
}
.um-login[data-theme="dark"] {
${declarations(DARK)}
}
`;

// The graph-paper ground. Two 1px linear gradients on a 62px grid, straight
// from the import.
export const GRID_BACKGROUND = `linear-gradient(${L.grid} 1px, transparent 1px), linear-gradient(90deg, ${L.grid} 1px, transparent 1px)`;
export const GRID_SIZE = '62px 62px';

export const LOGIN_CSS = `
${LOGIN_VARS_CSS}

/* THE BODY GROUND IS NOT SET HERE, AND MUST NOT BE MOVED BACK.
   ===========================================================
   Two rules used to sit at this spot:

     body:has(.um-login) { background: <ground>; }
     body:has(.um-login[data-theme="dark"]) { background: <ground dark>; }

   They never painted on any browser -- app/layout.tsx sets the body background
   from an inline style prop, which outranks any stylesheet rule that is not
   !important -- and :has() is Selectors Level 4, so they also dropped entirely
   on Safari below 15.4.

   Adding !important would fix the first problem but not the second, and a flat
   body type selector cannot fix either properly: the theme marker is data-theme on
   .um-login, a DESCENDANT set by LoginChrome, and ThemeProvider stamps no
   attribute on <html>, so a body rule cannot read theme state and would paint one
   colour behind both themes. body:has(descendant) was the only selector that
   could express this, and it is the one older Safari drops.

   So LoginChrome writes it as a theme-aware inline style through
   useBodyBackground, which is theme-correct on every browser. See
   app/components/useBodyBackground.ts for the full reasoning.

   Note DARK.ground is #0C1120, deliberately reused from --ec-bg dark, so in dark
   mode this was already the colour the body happened to show. The light ground
   #FAF8F5 is the one that actually moves, off --ec-bg light #F0EDE8. */

/* Inline styles cannot express :focus-visible or :hover, so the handful of
   rules that need them live here rather than in a mouse-event handler. */
.um-login :focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--uml-ground), 0 0 0 4px var(--uml-focus);
}
.um-login .uml-card:focus-visible,
.um-login .uml-oncard:focus-visible {
  box-shadow: 0 0 0 2px var(--uml-card), 0 0 0 4px var(--uml-focus);
}

/* The import's hover: a 2px lift with a hard offset shadow, no blur. */
.um-login .uml-lift {
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
}
.um-login .uml-lift:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--uml-cta-shadow);
}
.um-login .uml-lift-blue:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--uml-blue);
  background: var(--uml-tint-blue);
}

@media (prefers-reduced-motion: reduce) {
  .um-login .uml-lift,
  .um-login .uml-lift:hover,
  .um-login .uml-lift-blue:hover {
    transition: none;
    transform: none;
  }
}

/* ─── The header at narrow widths ──────────────────────────────────────────
   Measured rather than guessed, in Chromium with the real wordmark: the bar
   needs 378px for wordmark + CHANGE ROLE + ES/EN + theme. That fits 390px with
   12px to spare and OVERFLOWS at 375 (iPhone SE and 6-8) and 360 (the commonest
   Android width) -- both more common than the 390 it was checked at.

   So CHANGE ROLE, the only element here that is navigation rather than a
   persistent control, drops out of the bar and into the top of the content
   column below 400px. Nothing is removed at any width. Done in CSS rather than
   a viewport hook so there is no hydration mismatch and no JS in the path.

   Both copies are always rendered; exactly one is displayed. */
.um-login .uml-role-inbar { display: inline-flex; }
.um-login .uml-role-incol { display: none; }
@media (max-width: 399px) {
  .um-login .uml-role-inbar { display: none; }
  .um-login .uml-role-incol { display: inline-flex; }
}

.um-login .uml-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
`;
