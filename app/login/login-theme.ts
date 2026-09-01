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
import { DARK as DASH_DARK } from '../components/dashboard-theme';

/**
 * The design's one hard rule, in dark.
 *
 * Three tokens are this exact value and none of them may drift from the others:
 * --uml-border draws it as a card edge, --uml-cta-shadow throws it behind a
 * lifted control, and --uml-toggle-off-line draws it around the resting theme
 * switch. They were three identical literals before the dashboard retune; they
 * are one constant now, so a future adjustment cannot move two of the three.
 *
 * Kept cool rather than repointed at the dashboard, deliberately -- see the
 * notes on --uml-border and --uml-cta-shadow below.
 */
const LIFT_RULE = 'rgba(232,238,248,0.42)';

/**
 * A #RRGGBB constant at a given alpha.
 *
 * Exists so a token and its wash are composed from ONE source: tintBlue is
 * blue at 12%, and the three disabled tokens are the dashboard's ink at their
 * original alphas. Writing either as a fresh rgba() would put the same colour
 * in the file twice and let a later edit move one copy.
 *
 * Deliberately narrow: #RRGGBB only, which is every value it is asked for. It
 * throws rather than guessing, because a silently wrong colour is the failure
 * mode a helper like this exists to prevent.
 */
function withAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`withAlpha expects #RRGGBB, received "${hex}"`);
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

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
  // ─── RETUNED ONTO THE DASHBOARD'S DARK SCHEME, 2026-08-29 ──────────────────
  //
  // Ten values below now come from DASH_DARK by reference. The old set was the
  // --ec system's blue-blacks (#0C1120 ground, #161E30 surface, #E8EEF8 cool
  // ink), which is a different colour FAMILY from the warm neutral both
  // dashboards run on. A teacher signing in and landing on /teacher saw the
  // ground change temperature mid-flow.
  //
  // /start already made exactly this move on 2026-08-28, but it made it as a
  // scoped CSS override in app/start/start-dark.ts, because it could not change
  // this file without moving /login too. This IS that move, made at the source.
  //
  // CONSEQUENCE WORTH KNOWING BEFORE EDITING EITHER FILE: start-dark.ts's
  // twelve declarations now set the values this block already carries, so that
  // override is redundant rather than wrong. It is deliberately left in place
  // this pass -- collapsing it is a change to /start, which this pass does not
  // cover -- but it should be retired rather than maintained in parallel.
  //
  // BY REFERENCE, NEVER RE-TYPED. Change a token in dashboard-theme.ts and this
  // follows it. Nothing below is a hex sampled from a screenshot.
  ground: DASH_DARK.pageBg,
  grid: DASH_DARK.hairline,
  bar: DASH_DARK.cardBg,
  // Already rgba(255,255,255,0.12), which is DASH_DARK.line to the byte. Left
  // as a literal so this retune's diff shows only what actually moved.
  barLine: 'rgba(255,255,255,0.12)',
  card: DASH_DARK.cardBg,
  // The one value with no counterpart anywhere in the app. --ec-line dark is
  // rgba(255,255,255,0.07), which is 1.15:1 and would erase the design's
  // signature element; a literal inversion to #E8EEF8 glares. .42 is what
  // clears 3:1 on both dark surfaces (3.67 on ground, 3.61 on card) while
  // still reading as a rule.
  //
  // KEPT THROUGH THE RETUNE, and start-dark.ts:37-51 is the record of why. The
  // dashboard's own edge tokens are far fainter -- cardBorder .09 measures 1.31
  // on the card, panelEdge .12 measures 1.45 -- and they work there only
  // because DashSurface also carries cardShadow doing most of the separating.
  // THIS SURFACE IS SHADOW FREE BY DECISION: its cards float on a border and a
  // ground alone, so taking panelEdge would leave the card at 1.10 of
  // background contrast plus a 1.45 hairline and it would effectively vanish.
  // Re-measured on the NEW grounds: 3.60 on the card, 3.68 on the page.
  border: LIFT_RULE,
  ink: DASH_DARK.ink,
  ink2: DASH_DARK.muted,
  inkMono: DASH_DARK.muted,
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
  // UNDECIDED TOKEN 1 OF 4, RESOLVED: PINNED TO THE BORDER, NOT TO THE
  // DASHBOARD.
  //
  // This is the solid block behind .uml-lift:hover -- `4px 4px 0` with no blur
  // (LOGIN_CSS below). /start never had to decide it because /start never uses
  // .uml-lift; /login uses it at three sites (SignIn:139, RoleSelect:105,
  // JoinClass:226), so the retune cannot skip it.
  //
  // THE DASHBOARD HAS NO EQUIVALENT TO BORROW. Its cardShadow is
  // `0 1px 2px rgba(0,0,0,0.34)`, a soft black blur -- the opposite treatment.
  // Adopting it would not retune the hard offset, it would delete it, and that
  // offset is the design's signature.
  //
  // So it stays the cool-white rule, and is now pinned to the SAME constant as
  // --uml-border rather than repeating its digits: the two are one line in the
  // design, one drawn as an edge and one thrown behind a control, and they must
  // not drift. Measured on the new grounds by that shared value: 3.60 on the
  // card, 3.68 on the page.
  ctaShadow: LIFT_RULE,
  // Cream stops being cream in dark. It was #E8E0CF, a bright Mercury Cream
  // strip that read as a highlight against a near-black card; it now takes the
  // dashboard's own inset fill, and the ink on it follows to match.
  cream: DASH_DARK.subtleBg,
  creamInk: DASH_DARK.ink,
  // THE BORDER DOES NOT FOLLOW THE THEME HERE, and this is the one thing that
  // needed deciding rather than copying. --uml-border is
  // rgba(232,238,248,0.42) in dark, which measures 1.05:1 against a cream fill
  // -- the design's signature hard rule would simply vanish on this one
  // element. #111 gives 14.38:1 on cream in both themes, so the button keeps
  // its outline. It is a dark rule on a light fill either way, which is what
  // the light theme already does.
  creamLine: '#111111',
  // UNDECIDED TOKEN 2 OF 4, RESOLVED: GEMINI BLUE, THE DASHBOARD'S OWN.
  //
  // .uml-lift-blue is the teacher option on the role selector -- a `4px 4px 0`
  // block plus a 12% wash (RoleSelect.tsx:105). /login-only, so /start never
  // met it and start-dark.ts records no decision either way.
  //
  // #6BADDA Sky Blue becomes DASH_DARK.link #6E9DC8 Gemini Blue: the same
  // family, one step along, and a value this product already publishes for dark
  // surfaces rather than a fifth blue minted here. dashboard-theme.ts:369
  // measures it 6.24 on pageBg and 5.66 on cardBg -- comfortably legible as a
  // solid block on the new ground, which is the job it has here.
  //
  // The wash is composed FROM that same constant rather than typed out, so the
  // block and its tint cannot drift to two different blues.
  blue: DASH_DARK.link,
  tintAmber: DASH_DARK.rowHoverBg,
  tintBlue: withAlpha(DASH_DARK.link, 0.12),
  // UNDECIDED TOKEN 3 OF 4, RESOLVED: THE PILL INVERTS AGAINST THE NEW GROUND.
  //
  // This is the ES/EN toggle's selected state (LoginChrome.tsx:49-51): fill in
  // the ink colour, label in the ground colour. toggleOnInk was #0C1120 -- the
  // OLD login navy -- so after the ground moved it would have been the one
  // orphaned reference to a colour no longer anywhere on the page: a cool-white
  // pill carrying navy text on a warm neutral bar.
  //
  // The relationship is preserved and re-pointed at the new pair, so the pill
  // still reads as ink-and-ground inverted. #17171A on #EDECE7 measures 15.12:1.
  toggleOn: DASH_DARK.ink,
  toggleOnInk: DASH_DARK.pageBg,
  // Sized to .42 for WCAG 1.4.11: this is the resting edge of a real control,
  // and the dashboard has no equivalent token to repoint it at -- panelEdge
  // would drop it to 1.45. Kept, for the reason start-dark.ts:53-56 gives.
  toggleOffLine: LIFT_RULE,
  // Already #5AAAEE, which is DASH_DARK.focus to the byte. Left as a literal so
  // this retune's diff shows only what actually moved.
  focus: '#5AAAEE', // [reuse] --ec-accent dark, === DASH_DARK.focus
  // UNDECIDED TOKEN 4 OF 4, RESOLVED: HUE FOLLOWS, INTENT DOES NOT MOVE.
  //
  // The header of this file records these three as deliberately below their
  // nominal targets (~3.0) because WCAG 1.4.3 exempts disabled controls
  // outright. That decision is carried, not revisited: THE ALPHAS ARE
  // UNCHANGED at .08 / .38 / .24, so these sit exactly as far from their
  // ground as they did before.
  //
  // Only the base colour moves, off the cool #E8EEF8 and onto the dashboard's
  // warm ink, because a cool-white disabled control on a warm neutral card is
  // the same family mismatch this whole retune exists to remove. Changing the
  // alphas would have been changing the intent, and that is a separate call.
  disabled: withAlpha(DASH_DARK.ink, 0.08),
  disabledInk: withAlpha(DASH_DARK.ink, 0.38),
  disabledLine: withAlpha(DASH_DARK.ink, 0.24),
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
//
// ─── THE COLOUR IS A PARAMETER BECAUSE THE PATTERN TRAVELS AND THE TOKEN ────
//     DOES NOT
//
// GRID_BACKGROUND below bakes in L.grid, which is `var(--uml-grid)`. That is
// declared ONLY on .um-login, so the constant works on /login and on /start --
// which reuses it by carrying className="um-login um-start" (StartChrome.tsx:69)
// and inheriting the whole --uml-* scope with it.
//
// It does NOT work anywhere else, and it fails in the worst way: an unresolved
// var() makes `background-image` guaranteed-invalid, which computes to `none`.
// No error, no warning, just no grid. A surface with its own token scale --
// the adaptive test's --umc-*, say -- cannot adopt the constant, and must not
// adopt .um-login to get it, because that would drag twenty-six --uml-*
// declarations onto a surface that has its own and let the two collide.
//
// So the shape is the export and the colour is the argument. GRID_BACKGROUND is
// now derived from this function rather than restated, so /login and /start
// cannot drift from the pattern every other surface draws.
export function gridBackground(color: string): string {
  return `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
}

export const GRID_BACKGROUND = gridBackground(L.grid);
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
