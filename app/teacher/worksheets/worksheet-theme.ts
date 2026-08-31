import { SURFACES } from '../../components/curriculum-surface';
import { DASH } from '../../components/dashboard-theme';
import { strandTint } from '../../lib/strands';
import { FONT_HEADING, FONT_BODY } from '../../components/fonts';

// The worksheet generator's page chrome, and nothing else.
//
// TWO SOURCES, SPLIT BY ROLE, AND THE SPLIT IS THE POINT. Every value here used
// to be read out of curriculum-surface.ts LIGHT, which put the generator on the
// lesson pages' warm cream ladder. That was right while the generator was the
// only teacher surface with a palette of its own. It is wrong now that a
// teacher crosses from /teacher to /teacher/worksheets in one session and
// changes colour temperature doing it.
//
//   THE NEUTRALS come from dashboard-theme.ts: page, panel, the two quiet fills
//   and the meter track. IMPORTED rather than restated, so the generator and
//   the dashboard move together. That guarantee is the entire reason for this
//   change; copying the four hexes across would have looked identical today and
//   drifted the first time either surface was touched.
//
//   EVERYTHING ELSE still comes from curriculum-surface.ts LIGHT: ink, the
//   state colours, the CTA family. Those are not ground, they carry meaning,
//   and the dashboards do not disagree with the lesson pages about what a link
//   or a missed answer looks like.
//
// SURFACES.light IS READ HERE, NEVER WRITTEN. Editing it to move these four
// screens would move every lesson, practice and quiz page in the product with
// them: `panel` alone has 22 call sites across 11 files in the curriculum tree,
// and `page` is the body ground under all of them. Pointing the neutrals
// somewhere else is what keeps this change worksheet-shaped, and it is why this
// file now names two theme imports instead of one.
//
// LIGHT ONLY, like the rest of the teacher surface. dashboard-theme.ts records
// why: the teacher pages are not wired to the theme toggle, so reading LIGHT
// directly is the honest thing rather than pretending at a dark mode nothing
// can reach. WS_CHROME_CSS repaints body and .katex for exactly that reason,
// because the ROOT layout is theme-aware even though these pages are not.
//
// WHAT THIS FILE IS NOT. It is not the paper. print-styles.ts owns the printed
// worksheet and the answer key, and the two share no values and no imports --
// print-styles.ts restates its own #E8E0CF as --ws-cream. A change here cannot
// reach a printed sheet, by construction, and the sheet stays cream while the
// chrome around it does not. That is deliberate: the paper is a different
// object from the app, and a teacher holding one is not looking at the other.
//
// ORANGE IS NEVER TEXT. Sunset appears below as `cta` (a fill), `trackFill` (a
// meter fill) and `marker` (a 3px inset rule). There is deliberately no orange
// ink token, so a page cannot reach for one. The design import painted links,
// "Expand all", the add-version control and the active nav item in orange text;
// all four are `link` (#2F6091) or `ink` here.

const S = SURFACES.light;

// THE HAIRLINE IS NOT THE DASHBOARD'S, AND THAT IS NOT AN OVERSIGHT.
//
// The dashboard's card edge is rgba(15,30,53,0.07) PAIRED WITH a 1px shadow,
// `0 1px 2px rgba(15,30,53,0.04)`. Our system forbids that shadow on these
// screens -- radius zero, no elevation -- so a panel here separates on the
// border alone, and 0.07 alone is tuned for a job it is not doing here.
//
// Measured, on a flat #FFFFFF panel over the #F5F5F3 page. An edge is only as
// legible as its weaker side, so the deciding column is the lower of the two:
//
//   alpha   on panel   on page   weaker side
//   0.07      1.148     1.146      1.146      the dashboard value, shadow-fed
//   0.10      1.221     1.218      1.218
//   0.12      1.274     1.270      1.270
//   0.14      1.329     1.324      1.324
//   0.16      1.388     1.382      1.382      <- taken
//   0.18      1.450     1.443      1.443
//
// The bar is what the cream chrome already achieved: #DCD3BE measured 1.465 on
// the cream panel and 1.364 on the cream page, weaker side 1.364. And it was
// helped by a ground step this change removes -- panel-on-page falls from
// 1.292 to 1.092, because #FFFFFF on #F5F5F3 is a far smaller step than
// #FFFDF8 on #E8E0CF. So the border has to carry MORE than it used to, not
// less. 0.16 is the lightest value that clears 1.364, which is the lightest
// that holds the separation the generator ships today.
//
// Checked by eye as well as by ratio: at 0.07 the row divider inside a panel
// effectively disappears against the fill.
//
// Decorative. It carries no text and marks no control, so 1.4.11 does not
// apply. controlBorder below is the token for the case where it does.
const HAIRLINE = 'rgba(15,30,53,0.16)';

export const WS = {
  // ─── the neutral field ────────────────────────────────────────────────────
  // Four rungs where there used to be six steps of cream. page, rail and band
  // are ONE colour now: the header band and the in-page rail stopped being a
  // fill a shade off the ground and became a region bounded by a hairline,
  // which is how the dashboard states the same thing. Every band and rail call
  // site already carried that border, so nothing needed a new one.
  //
  // They stay as three separate tokens rather than collapsing to one, because
  // "the ground", "the rail" and "the band" are three different questions and
  // only one of them has to keep this answer.
  page: DASH.pageBg, // #F5F5F3
  rail: DASH.pageBg, // the field; the rail is its border, not its fill
  band: DASH.pageBg, // likewise the header band
  panel: DASH.cardBg, // #FFFFFF
  insetRow: DASH.rowHoverBg, // #FAFAF7, the row hover and the locked-row fill
  quietBox: DASH.trackBg, // #F2F1EC, the quiet box and the mobile sticky bar

  // ─── ink ──────────────────────────────────────────────────────────────────
  // Every ratio below is re-measured on the neutral field. All of them improve,
  // because the grounds got lighter and the ink did not move.
  ink: S.ink, // #0E0E11, 17.66 on page (was 14.68), 19.27 on panel
  ink2: S.ink2, // 8.39 page to 8.80 panel, was 7.56 to 8.73
  // The design import's mono micro-labels are #8A8474, which measured 2.84 to
  // 3.67 across the cream ladder and failed 4.5:1 on every rung. muted was the
  // only candidate that cleared all six, and it clears the neutral field by
  // more: 4.92 on page, rail and band, 5.06 on panel. Measured, not assumed.
  muted: S.muted,
  // WCAG 1.4.3 exempts inactive controls, and a disabled button at muted ink
  // reads as enabled. It must keep failing: 2.62 on page, 2.66 on panel.
  disabled: S.disabled,

  // ─── lines ────────────────────────────────────────────────────────────────
  // Radius zero everywhere on these screens, so a hairline is the only thing
  // separating a panel from its ground. See the measurement above HAIRLINE.
  hairline: HAIRLINE, // rgba(15,30,53,0.16), 1.39 on panel / 1.38 on page
  // #8A8474, as a BORDER, which is its role. It is the one warm value left in
  // the chrome and it stays: 1.4.11 applies to it at 3:1, and the move to the
  // neutral field is what finally clears that -- 2.84 on cream, 3.41 here.
  controlBorder: S.controlBorder,

  // ─── the one orange, in its three non-text roles ──────────────────────────
  cta: S.cta, // #F0A33E. Sunset, substituted for the import's retired #E89B3C
  ctaInk: S.ctaInk, // #111111, 9.00 on the CTA, unchanged: it is against the fill
  ctaHover: S.ctaHover,
  ctaShadow: S.ctaShadow,
  /** The board's `box-shadow: inset 3px 0 0` selection rule. A rule, not an ink. */
  marker: S.cta,
  track: DASH.trackBg, // #F2F1EC, the meter well. Was the cream hairline hex.
  trackFill: S.trackFill,

  // ─── the dark secondary, one per screen ───────────────────────────────────
  // The board uses #23211C. Deep Midnight is the live near-neighbour and the
  // value ruled in for this system, so the secondary button is ink on panel
  // text rather than a second near-black.
  dark: S.ink,
  darkInk: DASH.cardBg, // 19.27 on ink, and the same white as a panel

  // ─── state ────────────────────────────────────────────────────────────────
  link: S.link, // #2F6091, 6.56 panel / 6.01 on the field, was 6.45 / 4.99
  linkHover: S.linkHover,
  focus: S.focus, // #0F69BA, 5.13 on the field
  // #B0452F measured 4.28 on the CREAM page, which is why the note here used to
  // say a missed-state label belonged on a panel and never on the ground. On
  // the neutral field it is 5.15, and on panel 5.62, so the restriction lifts.
  missed: S.missed,
  missedTint: S.missedTint,
  error: S.error, // #8A5520, 6.17 on panel, 5.66 on the field
  statusComplete: S.statusComplete, // 5.69 on panel, 5.21 on the field
  correctTint: S.correctTint,

  font: { heading: FONT_HEADING, body: FONT_BODY },
} as const;

// The strand tints and their lookup both live in app/lib/strands.ts now.
//
// PR #204 moved the four hexes there and left this file holding a widened alias
// and a local strandTint() beside it. Those two were a re-implementation of
// strands.ts:strandTint, not an extension of it: same map, same trim, same
// upper-case, same fallback. The widening the alias existed for is done inside
// the shared function instead, which is why the alias goes with it.
//
// The shared signature is the wider of the two -- string | null | undefined
// against the local string -- so strandChip below accepts everything it used to
// and a null related_strand besides. Nothing here reads the map directly.

/** A strand's two-letter chip. Tint fill, Deep Midnight ink, radius zero. */
export function strandChip(strand: string): React.CSSProperties {
  return {
    fontFamily: 'ui-monospace, Menlo, monospace',
    fontSize: 10,
    letterSpacing: '0.04em',
    padding: '2px 6px',
    background: strandTint(strand),
    color: WS.ink,
    whiteSpace: 'nowrap',
  };
}

/** The board's small uppercase mono label. */
export const microLabel: React.CSSProperties = {
  fontFamily: 'ui-monospace, Menlo, monospace',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: WS.muted,
};

/** A panel on any ground: lightest surface, one hairline, no radius, no shadow. */
export const panelStyle: React.CSSProperties = {
  background: WS.panel,
  border: `1px solid ${WS.hairline}`,
  borderRadius: 0,
};

/** The one primary action per screen. Orange fill, near-black ink. */
export const ctaStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 0,
  background: WS.cta,
  color: WS.ctaInk,
  fontFamily: WS.font.body,
  fontWeight: 700,
  cursor: 'pointer',
};

/** The one dark secondary per screen. */
export const darkBtnStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 0,
  background: WS.dark,
  color: WS.darkInk,
  fontFamily: WS.font.body,
  fontWeight: 600,
  cursor: 'pointer',
};

/** Everything else: panel fill, hairline, ink. */
export const quietBtnStyle: React.CSSProperties = {
  border: `1px solid ${WS.hairline}`,
  borderRadius: 0,
  background: WS.panel,
  color: WS.ink,
  fontFamily: WS.font.body,
  fontWeight: 600,
  cursor: 'pointer',
};

// The rules an inline style prop cannot express, scoped to .ws-page.
//
// Five jobs, and four of them exist because the ROOT layout is theme-aware
// while these pages are not:
//
//   1. body background. app/layout.tsx paints body with var(--ec-bg), which is
//      a blue-black in dark mode and would show at the edges on overscroll.
//      Custom properties inherit downward only, so the value is written from
//      the same constant instead.
//
//      IT IS AN INLINE STYLE PROP ON <body>, and that is what dictates the
//      shape of the rule. app/layout.tsx:51 is style={{ background:
//      "var(--ec-bg)" }}, an inline declaration, which outranks every
//      stylesheet rule at every specificity unless the rule is !important.
//      The selector this replaced -- body:has(.ws-page) -- carried no
//      !important, so it lost to that inline background on EVERY browser and
//      never once painted. It was filed as Safari-below-15.4 debt on the
//      grounds that :has() is Selectors Level 4; the :has() was real, but it
//      was never the reason the rule did nothing.
//
//      So the selector is a bare `body` (Selectors Level 1, parses in every
//      browser that has CSS at all) and the declaration is !important, which
//      is the only thing that reaches past an inline style. Scope comes from
//      injection, not from the selector: WS_CHROME_CSS is mounted by the three
//      worksheet routes and by nothing else, exactly as every other rule in
//      this string is scoped. No :has(), no order-dependence -- an !important
//      stylesheet declaration beats a non-important inline one regardless of
//      which <style> the browser saw first.
//
//      SCREEN ONLY. Under print the config route also injects PRINT_CSS, whose
//      `html, body { background: #FFF !important }` is likewise !important on
//      the same property, and two important declarations at equal specificity
//      are settled by document order -- precisely the coin toss the .ws-chrome
//      class exists to avoid. Wrapping this in @media screen deletes the rule
//      from print entirely, so PRINT_CSS is unopposed and the chrome ground
//      cannot reach paper.
//   2. .katex. globals.css:19 is `.katex { color: var(--ec-ink) !important }`,
//      which in dark mode is #E8EEF8: near-white math on a white panel, in the
//      preview, invisible. `.ws-page .katex` is 0,2,0 against that rule's
//      0,1,0 and both carry !important, so the more specific selector wins.
//      This is the same fix print-styles.ts makes for the printed sheet, and
//      removing it makes the preview blank in dark mode with nothing on paper
//      to show for it.
//   3. Inherited ink. body sets color: var(--ec-ink), so any element that sets
//      no colour of its own would land on the theme ink.
//   4. Figures. A curriculum figure arrives inside stem_html as a 330 to 340px
//      image and an inline style prop cannot reach a descendant it does not
//      render. Matches .ws-stem-text img in print-styles.ts and .um-prose img
//      on the lesson pages.
//   5. .no-print. There is no .no-print rule in globals.css: the only one in
//      the app lives inside PRINT_CSS, which is injected by the two print
//      routes and must not come onto a config page. So the chrome states its
//      own, scoped, and WITHOUT an @page rule of any kind.
export const WS_CHROME_CSS = `
@media screen {
  body { background: ${WS.page} !important; }
}

.ws-page {
  background: ${WS.page};
  color: ${WS.ink};
  font-family: ${WS.font.body};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
/* Inside the teacher shell the page is no longer the whole viewport: a rail
   sits beside it holding the height open, and under 1024px a menu bar sits
   above it. Keeping min-height:100vh there would stack 100vh under a 58px bar
   and leave every short page with a phantom scroll. flex:1 fills the column
   the shell hands over, which is the same result the 100vh was reaching for.
   Scoped to .um-teacher-content, so the print routes -- which mount no shell
   -- keep the rule above untouched. */
.um-teacher-content .ws-page { min-height: 0; flex: 1; }

.ws-page h1, .ws-page h2, .ws-page h3 { font-family: ${WS.font.heading}; }
.ws-page button, .ws-page input, .ws-page select, .ws-page textarea { font-family: inherit; }

/* SCOPED TO .ws-chrome, WHICH IS NEVER AN ANCESTOR OF A SHEET.
   The real printed sheet now renders inside .ws-page, so a rule written as
   .ws-page .katex and print-styles.ts's .ws-sheet .katex rule (color #000000
   !important) would match the SAME spans. Both are 0,2,0 and both carry
   !important, so the winner would be whichever <style> the browser saw last,
   and if the chrome won, printed maths would come out #0E0E11 instead of
   black.

   Raising specificity only moves the coin toss, so the two selectors are made
   not to overlap. THE EXCLUSION IS A CLASS, NOT A :not(). An earlier version of
   this fix wrote .ws-page .katex:not(.ws-sheet .katex), which is a Selectors
   Level 4 complex :not() and does not parse in Safari 16.3 or earlier. An
   unparseable selector drops its own rule, so there the chrome silently loses
   the dark-mode defence this rule exists to provide. A plain descendant
   selector parses everywhere there is CSS at all.

   .ws-chrome goes on chrome containers that cannot contain a sheet: the whole
   <main> on the index and the builder, neither of which renders one, and the
   config rail and the tab bar on the worksheet page, which does. That invariant
   is asserted rather than promised -- verify_worksheet_cascade.mjs fails if any
   .ws-sheet is found with a .ws-chrome ancestor. */
.ws-chrome .katex { color: ${WS.ink} !important; }

.ws-preview-stem img { display: block; max-width: 100%; height: auto; margin: 6px 0; }

/* Same collision, same fix, same reason for using a class rather than :not().
   .ws-sheet a (color var(--ws-ink)) in print-styles.ts is 0,1,1 against a
   .ws-page a rule's 0,1,1, neither !important, so order would decide again. The
   sheet renders no links today, so this one has never fired; it is closed now
   rather than left as a trap for whoever first puts an anchor on the paper. */
.ws-chrome a { color: ${WS.link}; }
.ws-chrome a:hover { color: ${WS.linkHover}; }

.ws-page :focus-visible { outline: 2px solid ${WS.focus}; outline-offset: 2px; }

.ws-hover:hover { background: ${WS.insetRow}; }

/* A real checkbox behind the board's card, so keyboard and screen reader
   behaviour survive the restyle. The card carries the focus ring on its
   behalf. */
.ws-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.ws-page label:focus-within { outline: 2px solid ${WS.focus}; outline-offset: 2px; }
.ws-cta:hover { background: ${WS.ctaHover}; }

/* ── Interaction, through a custom property ────────────────────────────────

   THE PATTERN IS dashboard-chrome.ts's, AND IT IS HERE RATHER THAN IN
   motion.ts ON PURPOSE. app/motion.ts owns what every surface shares -- the
   durations, the curve, the keyframes, the reduced-motion guard. --card-bg
   is a fact about a worksheet topic card and about nothing else, and pushing
   it into the shared file would put a surface's vocabulary in a system whose
   whole design is that it has none.

   EVERY HOVER BELOW REASSIGNS A VARIABLE, never a property, for the reason
   DASH_HOVER_CSS gives at length: a hover state cannot silently take a
   property the base rule was relying on, because it never names one.

   THE DURATIONS ARE READ FROM motion.ts WITH A FALLBACK, and the fallback is
   load-bearing rather than defensive. This stylesheet is injected by the two
   PRINT routes as well as the config route, and those do not emit MOTION_CSS,
   so --um-dur-1 does not resolve there. A var() that fails inside a shorthand
   invalidates the whole declaration -- which would be harmless here, since a
   dropped transition on paper is the correct outcome anyway -- but the
   fallback makes that a decision rather than an accident. */
.ws-card {
  --card-bg: ${WS.panel};
  --card-border: ${WS.hairline};
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  transition:
    background var(--um-dur-1, 150ms) var(--um-ease-out, ease),
    border-color var(--um-dur-1, 150ms) var(--um-ease-out, ease),
    box-shadow var(--um-dur-1, 150ms) var(--um-ease-out, ease);
}
.ws-card:hover { --card-bg: #FBFAF7; --card-border: rgba(15,30,53,0.18); }

/* NO HOVER ON THE LOCKED CARD, and that is the point rather than an omission.
   It is not pickable -- the checkbox is disabled and the cursor says so -- and
   a ground that answers the pointer is an invitation to click something that
   will not respond. It keeps the dashed edge and the dimming it already had. */
.ws-card-locked {
  background: ${WS.insetRow};
  border: 1px dashed ${WS.hairline};
}

/* State swaps that are not hovers: a marker filling, a CTA going live, a card
   gaining its selected rule. React changes the value inline; this only says how
   long the change takes. An inline background beats these rules on VALUE and is
   supposed to -- transition is a different property and is not contested. */
.ws-swap {
  transition:
    background var(--um-dur-1, 150ms) var(--um-ease-out, ease),
    border-color var(--um-dur-1, 150ms) var(--um-ease-out, ease),
    color var(--um-dur-1, 150ms) var(--um-ease-out, ease),
    box-shadow var(--um-dur-1, 150ms) var(--um-ease-out, ease);
}

/* The checkmark inside a marker. Absolutely placed so it can cross-fade over
   the '+' without either one moving the 16px box. */
.ws-tick {
  position: absolute;
  display: flex;
  transition: opacity var(--um-dur-1, 150ms) var(--um-ease-out, ease);
}

/* ── The unit accordion ────────────────────────────────────────────────────

   0fr to 1fr on a one-row grid, which is the only way to transition to a
   content height without measuring it in JavaScript. The inner element carries
   the overflow:hidden and min-height:0 -- without the second, a grid item
   refuses to shrink below its content and the row never closes.

   DEGRADES TO A SNAP, NEVER TO A BROKEN PANEL. A browser that does not
   interpolate fr values applies the end state immediately: open is open,
   closed is closed, with no animation in between. */
.ws-unitbody {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--um-dur-3, 280ms) var(--um-ease-out, ease);
}
.ws-unitbody-open { grid-template-rows: 1fr; }
.ws-unitbody > * { overflow: hidden; min-height: 0; }

/* Rotation only, no box change -- the same treatment the dashboard's collapse
   chevron gets, at the accordion's duration so the two read as one movement. */
.ws-chev { transition: transform var(--um-dur-3, 280ms) var(--um-ease-out, ease); }

/* ── shell and band header ─────────────────────────────────────────────────
   The board frames every screen at 1280 with a 206px sidebar, leaving about
   1074px of content. These routes carry no sidebar (that is a deferred
   dashboard wide pass), so the same measure is held with a max-width and a
   centred shell instead of inheriting it from a rail. */
.ws-shell { max-width: 1080px; margin: 0 auto; padding: 24px 32px 56px; }
.ws-headband-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 26px 32px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}
.ws-headband-actions { display: flex; align-items: center; gap: 16px; flex: none; }

/* ── index row ─────────────────────────────────────────────────────────────
   Four fixed-role columns and one elastic one, so titles of different lengths
   do not move the stat, the date or the actions off their shared x. */
.ws-row { display: flex; align-items: center; gap: 22px; }
.ws-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 9px; }
.ws-row-stat { width: 112px; flex: none; display: flex; flex-direction: column; gap: 4px; }
.ws-row-date { width: 96px; flex: none; display: flex; flex-direction: column; gap: 4px; }
.ws-row-actions { display: flex; align-items: center; gap: 8px; flex: none; }

/* ── builder ───────────────────────────────────────────────────────────────
   Selection rail left, topic browser right, per the board. Inverted from what
   shipped, which put the tree left and a sticky control card right.

   THE RAIL IS TWO DOM PIECES, not one, and that is what makes the mobile order
   possible. On desktop they stack in column one and read as a single rail. At
   375 the board wants the topic browser FIRST, with the controls under it and
   the totals in a sticky bar, so the two halves sit either side of the browser
   in the source order the grid areas below hand them. */
.ws-builder {
  display: grid;
  grid-template-columns: 356px minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  grid-template-areas: "railtop main" "railbot main";
  flex: 1;
}
.ws-builder-rail-top { grid-area: railtop; }
.ws-builder-rail-bot { grid-area: railbot; }
.ws-builder-main { grid-area: main; min-width: 0; display: flex; flex-direction: column; }
.ws-builder-rail-top, .ws-builder-rail-bot {
  background: ${WS.rail};
  border-right: 1px solid ${WS.hairline};
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.ws-topicgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }

/* The mobile action bar and its desktop counterpart. Exactly one of the two is
   ever in the DOM at a given width, so there is never a second "Generate
   worksheet" button in the accessibility tree. */
.ws-only-mobile { display: none; }

/* ── config and preview ────────────────────────────────────────────────────*/
.ws-config { display: grid; grid-template-columns: 302px minmax(0, 1fr); gap: 0; align-items: stretch; flex: 1; }
.ws-config-rail {
  background: ${WS.rail};
  border-right: 1px solid ${WS.hairline};
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* The main pane and the frame the sheet sits in.
   CLASSES RATHER THAN INLINE STYLE PROPS, and not for tidiness: the print
   block at the foot of this file has to turn both into plain blocks, and an
   inline style prop can only be beaten with !important. Everything else on
   these screens stays inline, per the house rule; these two are the
   exceptions the cascade forces. */
.ws-config-main { min-width: 0; display: flex; flex-direction: column; }
.ws-preview-frame {
  padding: 26px 26px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

/* ── below 900: single column, and 48px tap targets from the token sheet ───
   The 206px rail becoming a hamburger drawer is a dashboard wide pattern and
   is NOT built here. Content goes responsive; nav chrome stays as it is. */
@media (max-width: 900px) {
  .ws-headband-inner { flex-direction: column; gap: 16px; }
  .ws-headband-actions { width: 100%; justify-content: space-between; }
  .ws-row { flex-wrap: wrap; gap: 14px; }
  .ws-config { grid-template-columns: minmax(0, 1fr); }
  /* Topic browser first, then the controls, per the board's mobile note. */
  .ws-builder {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto;
    grid-template-areas: "railtop" "main" "railbot";
    padding-bottom: 84px;
  }
  .ws-builder-rail-top, .ws-builder-rail-bot, .ws-config-rail {
    border-right: none;
    border-bottom: 1px solid ${WS.hairline};
  }
  .ws-topicgrid { grid-template-columns: 1fr; }
  .ws-only-desk { display: none !important; }
  .ws-only-mobile { display: flex; }
  /* The sticky bottom bar. The totals and the one action stay reachable while
     the teacher is scrolling the topic browser, which is the whole point of
     the board's bottom sheet. */
  .ws-stickybar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: ${WS.quietBox};
    border-top: 1px solid ${WS.hairline};
  }
  .ws-tap {
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }
}

@media (max-width: 640px) {
  .ws-shell { padding: 16px 16px 40px; }
  .ws-headband-inner { padding: 18px 16px 14px; }
  .ws-row { flex-direction: column; align-items: stretch; gap: 12px; }
  .ws-row-stat, .ws-row-date { width: auto; flex-direction: row; align-items: baseline; gap: 8px; }
  .ws-row-actions { width: 100%; }
  .ws-row-actions > * { flex: 1; }
}

/* ── what happens when this page meets a printer ───────────────────────────
   The real sheet renders on this route now, so a print from here has to put
   the paper through the SAME box it goes through on a chrome-free route. Every
   rule below removes an ancestor that did not exist there.

   .no-print is stated here, scoped, and carries no @page of any kind. It is
   also stated bare inside PRINT_CSS, which this route now injects too; the two
   declarations are identical, so there is nothing to reconcile.

   THE GRID IS THE ONE THAT WOULD HAVE BITTEN. .ws-config declares two columns
   and the rail is display:none under print -- but a display:none ITEM does not
   remove its TRACK, so column one would still reserve 302px and the sheet
   would print shifted right and 302px narrow. Collapsing the grid to a block
   is not tidying, it is the fix.

   THE FLEX ANCESTORS MATTER TOO, and less obviously. Fragmentation inside a
   flex container is not reliably supported, and the answer key depends
   entirely on the .ws-part + .ws-part break-before:page rule to land its three
   parts on three sheets. Every flex ancestor between body and .ws-sheet is
   turned back into a block so the break has an ordinary block flow to break.
   That includes .um-teacher-content, which TeacherShell sets with an INLINE
   display:flex, so that one needs !important to reach. */
@media print {
  .ws-page .no-print { display: none !important; }

  .um-teacher-content { display: block !important; }

  .ws-page { display: block; min-height: 0; background: #FFFFFF; }
  /* Undoes the flex:1 the shell seam sets, which only makes sense on screen. */
  .um-teacher-content .ws-page { flex: none; }

  .ws-config { display: block; }
  .ws-config-main { display: block; min-width: 0; }
  .ws-preview-frame { display: block; padding: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ws-page *, .ws-page *::before, .ws-page *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;
