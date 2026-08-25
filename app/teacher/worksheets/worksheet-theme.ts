import { SURFACES } from '../../components/curriculum-surface';
import { FONT_HEADING, FONT_BODY } from '../../components/fonts';

// The worksheet generator's page chrome, and nothing else.
//
// SCOPED ON PURPOSE. Every value below is read out of curriculum-surface.ts
// LIGHT rather than restated, so this file owns no palette of its own: it is a
// naming layer that says which curriculum token plays which role on these four
// screens. Change a colour there and these pages move with the lesson pages,
// which is the whole point of not hardcoding the design import's hexes.
//
// LIGHT ONLY, like the rest of the teacher surface. dashboard-theme.ts records
// why: the teacher pages are not wired to the theme toggle, so reading
// SURFACES.light directly is the honest thing rather than pretending at a dark
// mode nothing can reach. WS_CHROME_CSS repaints body and .katex for exactly
// that reason, because the ROOT layout is theme-aware even though these pages
// are not.
//
// WHAT THIS FILE IS NOT. It is not the paper. print-styles.ts owns the printed
// worksheet and the answer key, and the two files share no values and no
// imports. A change here cannot reach a printed sheet, by construction.
//
// ORANGE IS NEVER TEXT. Sunset appears below as `cta` (a fill), `trackFill` (a
// meter fill) and `marker` (a 3px inset rule). There is deliberately no orange
// ink token, so a page cannot reach for one. The design import painted links,
// "Expand all", the add-version control and the active nav item in orange text;
// all four are `link` (#2F6091) or `ink` here.

const S = SURFACES.light;

export const WS = {
  // ─── the four surfaces, darkest ground to lightest panel ─────────────────
  page: S.page, // #E8E0CF
  rail: S.rail, // #EDE8DA
  band: S.band, // #F3EFE3
  panel: S.panel, // #FFFDF8
  insetRow: S.insetRow, // #F6F2E8
  quietBox: S.quietBox, // #EDE7D6

  // ─── ink ──────────────────────────────────────────────────────────────────
  ink: S.ink, // #0E0E11, 14.68 on page, 18.96 on panel
  ink2: S.ink2, // 7.56 to 8.73 across the ladder
  // The design import's mono micro-labels are #8A8474, which measures 2.84 to
  // 3.67 across the six surfaces they render on and fails 4.5:1 on every one.
  // muted is the only candidate that clears the whole ladder: 4.62 on page,
  // 4.74 rail, 4.84 band, 5.03 panel, 4.88 insetRow, 4.72 quietBox. Measured,
  // not assumed.
  muted: S.muted,
  // WCAG 1.4.3 exempts inactive controls, and a disabled button at muted ink
  // reads as enabled.
  disabled: S.disabled,

  // ─── lines ────────────────────────────────────────────────────────────────
  // Radius zero everywhere on these screens, so a hairline is the only thing
  // separating a panel from its ground. 1.46 on panel, decorative, exempt.
  hairline: S.hairline, // #DCD3BE
  controlBorder: S.controlBorder, // #8A8474, as a BORDER, which is its role

  // ─── the one orange, in its three non-text roles ──────────────────────────
  cta: S.cta, // #F0A33E. Sunset, substituted for the import's retired #E89B3C
  ctaInk: S.ctaInk, // #111111, 9.00 on the CTA
  ctaHover: S.ctaHover,
  ctaShadow: S.ctaShadow,
  /** The board's `box-shadow: inset 3px 0 0` selection rule. A rule, not an ink. */
  marker: S.cta,
  track: S.track,
  trackFill: S.trackFill,

  // ─── the dark secondary, one per screen ───────────────────────────────────
  // The board uses #23211C. Deep Midnight is the live near-neighbour and the
  // value ruled in for this system, so the secondary button is ink on panel
  // text rather than a second near-black.
  dark: S.ink,
  darkInk: S.panel, // 18.96 on ink

  // ─── state ────────────────────────────────────────────────────────────────
  link: S.link, // #2F6091, 6.45 panel / 5.70 band / 4.99 page
  linkHover: S.linkHover,
  focus: S.focus, // #0F69BA
  // #B0452F measures 5.53 on panel and 4.28 on PAGE, so a missed-state label
  // belongs on a panel or a band and never directly on the page ground.
  missed: S.missed,
  missedTint: S.missedTint,
  error: S.error, // #8A5520, 6.07 on panel
  statusComplete: S.statusComplete,
  correctTint: S.correctTint,

  font: { heading: FONT_HEADING, body: FONT_BODY },
} as const;

// The four strand tints.
//
// RESTATED, NOT IMPORTED, and this is a known duplication rather than an
// oversight. The same four hexes live in WorksheetSheet.tsx, the teacher
// dashboard, the demo and /teacher/inactive; none of them exports the map and
// WorksheetSheet.tsx is on the untouchable side of the boundary, so adding an
// export there to import from here is exactly the edit that is not allowed.
// Folding all five into one module is worth doing and is not this task.
//
// Fill only. Deep Midnight on top measures 12.38 to 12.95 on all four.
const STRAND_TINT: Record<string, string> = {
  QR: '#B5D4F4',
  AR: '#9FE1CB',
  GR: '#FAC775',
  PR: '#CECBF6',
};
/** Sky Blue, so an unresolved strand still reads as a labelled strand. */
const STRAND_FALLBACK = '#87CEEB';

export function strandTint(strand: string): string {
  return STRAND_TINT[(strand ?? '').trim().toUpperCase()] ?? STRAND_FALLBACK;
}

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
//      the same constant instead. Same shape as CURRICULUM_VARS_CSS and
//      dashboard-theme.ts.
//   2. .katex. globals.css:19 is `.katex { color: var(--ec-ink) !important }`,
//      which in dark mode is #E8EEF8: near-white math on a cream panel, in the
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
body:has(.ws-page) { background: ${WS.page}; }

.ws-page {
  background: ${WS.page};
  color: ${WS.ink};
  font-family: ${WS.font.body};
  min-height: 100vh;
}
.ws-page h1, .ws-page h2, .ws-page h3 { font-family: ${WS.font.heading}; }
.ws-page button, .ws-page input, .ws-page select, .ws-page textarea { font-family: inherit; }

.ws-page .katex { color: ${WS.ink} !important; }

.ws-preview-stem img { display: block; max-width: 100%; height: auto; margin: 6px 0; }

.ws-page a { color: ${WS.link}; }
.ws-page a:hover { color: ${WS.linkHover}; }

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
   shipped, which put the tree left and a sticky control card right. */
.ws-builder { display: grid; grid-template-columns: 356px minmax(0, 1fr); gap: 0; align-items: stretch; }
.ws-builder-rail {
  background: ${WS.rail};
  border-right: 1px solid ${WS.hairline};
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.ws-builder-main { min-width: 0; display: flex; flex-direction: column; }
.ws-topicgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }

/* ── config and preview ────────────────────────────────────────────────────*/
.ws-config { display: grid; grid-template-columns: 302px minmax(0, 1fr); gap: 0; align-items: stretch; }
.ws-config-rail {
  background: ${WS.rail};
  border-right: 1px solid ${WS.hairline};
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ── below 900: single column, and 48px tap targets from the token sheet ───
   The 206px rail becoming a hamburger drawer is a dashboard wide pattern and
   is NOT built here. Content goes responsive; nav chrome stays as it is. */
@media (max-width: 900px) {
  .ws-headband-inner { flex-direction: column; gap: 16px; }
  .ws-headband-actions { width: 100%; justify-content: space-between; }
  .ws-row { flex-wrap: wrap; gap: 14px; }
  .ws-builder, .ws-config { grid-template-columns: minmax(0, 1fr); }
  .ws-builder-rail, .ws-config-rail { border-right: none; border-bottom: 1px solid ${WS.hairline}; }
  .ws-topicgrid { grid-template-columns: 1fr; }
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

@media print {
  .ws-page .no-print { display: none !important; }
}

@media (prefers-reduced-motion: reduce) {
  .ws-page *, .ws-page *::before, .ws-page *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;
