import { FONT_HEADING, FONT_BODY } from '../../components/fonts';

// The paper.
//
// ONE STYLESHEET FOR ALL THREE PRINTED PARTS. The worksheet, the answer key and
// the rationales share a type scale, a margin, a masthead and a footer, and they
// share them by being the same rules rather than three sets that agree today.
// That is the whole reason this is a single exported string injected by both
// routes as a <style> tag: two stylesheets would drift the moment one part got a
// tweak, and a drifting footer is exactly the failure the disclaimer cannot
// afford. It applies to two routes out of the whole app and has no business in
// the bundle every other page loads.
//
//
// THE PALETTE IS THE CURRENT ONE, AND ORANGE IS NEVER TEXT
//
//   Deep Midnight  #0E0E11   ink, and every muted tone as an alpha of it
//   Sky Blue       #87CEEB   masthead rules
//   Warm Sand      #F2EDDF   chip and panel fills
//   Mercury Cream  #E8E0CF   chip borders, weighted hairlines
//   Sunset Orange  #F0A33E   the marker rule on the misconception panel, ONLY
//   Gemini Blue    #6E9DC8   the screen focus ring
//
// Every grey on the sheet is Deep Midnight at an alpha rather than an invented
// neutral, so there is no third colour system to keep in step with the palette.
// Sunset Orange appears once, as a 3px rule. It is never a text colour anywhere
// on any of the three parts.
//
// The four strand tints (QR #B5D4F4, AR #9FE1CB, GR #FAC775, PR #CECBF6) are NOT
// here. They are data -- which chip a topic gets depends on its strand -- so
// they are inline style props on the chip in WorksheetSheet.tsx, and this file
// only says what shape a chip is.
//
//
// THE SHEET IS WHITE IN BOTH THEMES, ON SCREEN AS WELL AS ON PAPER
//
// These routes are a preview of a printed page, so they render as paper
// regardless of the app theme. A teacher checking the sheet in dark mode should
// see what will come out of the printer, not a dark rendering of it.
//
// That creates a problem the @media print block in globals.css does NOT solve.
// That block fixes `.katex { color: var(--ec-ink) !important }` only while
// printing. On SCREEN in dark mode --ec-ink is #E8EEF8, so a paper-white sheet
// would carry near-white math on it -- invisible, in the preview, before
// anything reaches a printer.
//
// So the override is repeated here without a media query. `.ws-sheet .katex`
// (specificity 0,2,0) beats the bare `.katex` (0,1,0) in globals.css, and both
// carry !important, so the more specific selector wins in both directions.
// Removing this makes the preview blank in dark mode while the printout stays
// correct, which is a bug nobody would look for.
//
// The --ec-* redefinitions on .ws-sheet below do the same job for anything drawn
// with the theme variables rather than with .katex. They are deliberately NOT
// !important, so the `:root { --ec-ink: #000 !important }` block in globals.css
// still wins while printing -- the Session A fix stays in charge of paper, and
// this only fixes the on-screen preview.

const FONT_MONO = "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";

export const PRINT_CSS = `
@page { size: letter portrait; margin: 0.6in 0.65in; }

.ws-sheet {
  --ws-ink: #0E0E11;
  --ws-muted: rgba(14, 14, 17, 0.58);
  --ws-faint: rgba(14, 14, 17, 0.40);
  --ws-hair: rgba(14, 14, 17, 0.13);
  --ws-sky: #87CEEB;
  --ws-sand: #F2EDDF;
  --ws-cream: #E8E0CF;
  --ws-orange: #F0A33E;
  --ws-blue: #6E9DC8;

  /* See the header. Screen-preview only; globals.css keeps paper black. */
  --ec-ink: #0E0E11;
  --ec-ink-muted: rgba(14, 14, 17, 0.58);
  --ec-ink-faint: rgba(14, 14, 17, 0.40);
  --ec-line: rgba(14, 14, 17, 0.20);
  --ec-accent: rgba(14, 14, 17, 0.55);
  --ec-surface: #FFFFFF;
  --ec-surface2: #FFFFFF;
  --ec-bg: #FFFFFF;

  background: #FFFFFF;
  color: var(--ws-ink);
  font-family: ${FONT_BODY};
  font-size: 10.5pt;
  line-height: 1.5;
  max-width: 7.2in;
  margin: 0 auto;
  padding: 24px 26px 34px;
  box-sizing: border-box;
}

/* See the header: this must not be inside @media print. */
.ws-sheet .katex { color: #000000 !important; }

/* KaTeX sets 1.21em by default, which makes every inline number visibly larger
   than the words around it -- "adds 9 to 14" comes out with two oversized
   digits. Pulled back so math sits ON the text baseline rhythm rather than
   above it. Measured on the rendered sheet, not guessed. */
.ws-sheet .katex { font-size: 1.05em; }

.ws-sheet a { color: var(--ws-ink); text-decoration: none; }

/* One printed part: masthead, content, footer. Three of them exist -- the
   worksheet on its own route, the key and the rationales on the other -- and
   every rule below that is not scoped to a part applies to all three. */
.ws-part + .ws-part {
  break-before: page;
  page-break-before: always;
}

/* ── masthead ─────────────────────────────────────────────────────────────── */
.ws-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 22px;
  border-bottom: 2px solid var(--ws-sky);
  padding-bottom: 11px;
  margin: 0 0 15px;
}
.ws-title {
  font-family: ${FONT_HEADING};
  font-size: 20pt;
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.1;
  margin: 0;
  color: var(--ws-ink);
}
.ws-part-key .ws-title,
.ws-part-rationales .ws-title { font-size: 17pt; }

.ws-meta {
  font-family: ${FONT_MONO};
  font-size: 8pt;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--ws-muted);
  margin: 8px 0 0;
}

/* The lockup, unrecoloured and at full opacity. The mockup tints it to 90%,
   which is a screen affectation -- on paper it only costs contrast. */
.ws-mark {
  height: 38px;
  width: auto;
  display: block;
  flex-shrink: 0;
}
.ws-part-key .ws-mark,
.ws-part-rationales .ws-mark { height: 32px; }

/* ── the student's fill-in fields ─────────────────────────────────────────── */
.ws-fields {
  display: flex;
  gap: 30px;
  margin: 0 0 18px;
  font-family: ${FONT_MONO};
  font-size: 8pt;
  letter-spacing: 0.09em;
  color: var(--ws-muted);
}
.ws-field { display: flex; gap: 9px; align-items: baseline; flex: 1; }
.ws-field-date { flex: 0 0 1.85in; }
.ws-field-rule { flex: 1; border-bottom: 1px solid var(--ws-cream); }

/* ── the two-column question flow ─────────────────────────────────────────── */
.ws-flow {
  column-count: 2;
  column-gap: 34px;
  column-rule: 1px solid var(--ws-hair);
  font-size: 10pt;
  line-height: 1.5;
}

.ws-eyebrow {
  /* A topic label stranded at the foot of a column belongs to nothing. */
  break-inside: avoid;
  break-after: avoid;
  page-break-after: avoid;
  display: flex;
  gap: 8px;
  align-items: baseline;
  flex-wrap: wrap;
  margin: 15px 0 9px;
}
.ws-eyebrow:first-child { margin-top: 0; }
.ws-eyebrow-chip {
  font-family: ${FONT_MONO};
  font-size: 7.5pt;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--ws-ink);
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid;
  /* Fill and border colour arrive as an inline style prop, keyed on strand.
     The border carries the same value as the fill so the chip still reads as a
     chip when the teacher prints with background graphics off -- borders print,
     backgrounds do not. */
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ws-eyebrow-name {
  font-size: 8.5pt;
  letter-spacing: 0.01em;
  color: var(--ws-muted);
}

.ws-q {
  /* The requirement: a question never splits, and in two columns that means it
     never splits across a COLUMN break either, which is the failure that puts
     a stem at the foot of column one and its choices at the head of column two.
     Both properties, because break-inside is the modern name and
     page-break-inside is what older print engines still honour. */
  break-inside: avoid;
  page-break-inside: avoid;
  margin: 0 0 13px;
}
.ws-stem { margin: 0; }
.ws-n {
  font-family: ${FONT_MONO};
  font-size: 9.5pt;
  font-weight: 600;
  color: var(--ws-ink);
  margin-right: 5px;
  font-variant-numeric: tabular-nums;
}
/* The number sits INLINE with the stem rather than in a hanging column. A
   hanging indent costs the same gutter twice over in a two-column layout, and
   the column is 3.4in wide. renderInlineWithMath already unwraps a
   single-paragraph stem, so this is inline text in every real case; the p rule
   covers a stem that genuinely parsed to blocks. */
.ws-stem-text { display: inline; }
.ws-stem-text p { display: inline; margin: 0; }

/* ── figures ──────────────────────────────────────────────────────────────── */
/*
   A curriculum figure is a markdown image carrying a base64 SVG, so it arrives
   inside stem_html at its natural size: 330 to 340px against a 3.4in column,
   which is 326px. Every figured item was one bad rounding away from pushing its
   own column sideways, and there was no rule anywhere on these routes to stop
   it. The lesson pages have shipped the same two declarations under
   .um-prose img since Unit 2; this is that rule, scoped to the sheet.

   display:block with a small margin because the stem is inline text (see
   .ws-stem-text): an inline image sits on the text baseline and drags the line
   box down around it. A figure wants its own line. */
.ws-stem-text img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 6px 0;
}

.ws-choices {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 3px;
  margin: 6px 0 0;
  padding: 0 0 0 13px;
  list-style: none;
}
.ws-choice { display: flex; gap: 7px; align-items: flex-start; }

/* The letter as a chip, per the format spec. The mockup prints a bare coloured
   glyph; a bordered box survives a mono printer and a background-graphics-off
   print, and it is the thing a student's eye lands on when circling an answer. */
.ws-letter {
  flex-shrink: 0;
  font-family: ${FONT_MONO};
  font-size: 7.5pt;
  font-weight: 600;
  line-height: 1;
  color: var(--ws-ink);
  background: var(--ws-sand);
  border: 1px solid var(--ws-cream);
  border-radius: 4px;
  padding: 2.5px 4.5px;
  margin-top: 1.5px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ws-choice-text { min-width: 0; }

/* ── the answer key grid ──────────────────────────────────────────────────── */
.ws-key-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 11px 18px;
  max-width: 5in;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}
.ws-key-cell {
  display: flex;
  gap: 9px;
  align-items: baseline;
  break-inside: avoid;
  page-break-inside: avoid;
}
.ws-key-n {
  font-family: ${FONT_MONO};
  font-size: 8.5pt;
  color: var(--ws-muted);
  /* Wide enough for the longest number the table allows, so every letter in a
     column starts at the same x. At 1.7em the numerals 1-9 fit and 10-20 do
     not, which pushed the letter right on three rows out of four and put ten
     distinct x positions in a five-column grid. Measured, not guessed. */
  min-width: 2.6em;
  text-align: right;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
/* Black, not a tint. This is the mark a teacher reads off a stack of twenty
   papers, so it gets the highest contrast on the sheet. */
.ws-key-letter {
  font-size: 12pt;
  font-weight: 700;
  line-height: 1;
  color: var(--ws-ink);
}

/* ── the rationales ───────────────────────────────────────────────────────── */
.ws-rats {
  column-count: 2;
  column-gap: 32px;
  column-rule: 1px solid var(--ws-hair);
  font-size: 9.5pt;
  line-height: 1.48;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}
.ws-rat {
  break-inside: avoid;
  page-break-inside: avoid;
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin: 0 0 8px;
}
.ws-rat-n {
  font-family: ${FONT_MONO};
  font-size: 8.5pt;
  font-weight: 600;
  color: var(--ws-muted);
  min-width: 1.6em;
  text-align: right;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.ws-rat-text { min-width: 0; }
.ws-rat-text p { display: inline; margin: 0; }
.ws-rat-missing { color: var(--ws-muted); font-style: italic; }

/* ── the footer, on every part ────────────────────────────────────────────── */
.ws-foot {
  margin-top: 22px;
  padding-top: 8px;
  border-top: 1px solid var(--ws-hair);
}
.ws-foot-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  font-family: ${FONT_MONO};
  font-size: 7.5pt;
  letter-spacing: 0.06em;
  color: var(--ws-faint);
}
.ws-foot-mark { display: flex; gap: 12px; }

/* AUDIT ENTRY 7, and the reason row one keeps its own font. The string is 134
   characters. Measured against the 7.2in content box (691px at 96dpi):
   monospace overflows at every legible size, still 101% of the width at 6.5pt,
   so the disclaimer cannot share the footer's mono face. In the body face it
   fits on one line with room to spare. Sized here rather than shrunk to fit --
   if it ever stops fitting, it wraps to two lines and the size stays. */
.ws-disclaimer {
  margin: 7px 0 0;
  font-family: ${FONT_BODY};
  font-size: 7.5pt;
  line-height: 1.35;
  letter-spacing: 0.005em;
  color: var(--ws-muted);
  text-align: center;
}

/* ── screen-only affordances ──────────────────────────────────────────────── */
.ws-toolbar {
  max-width: 7.2in;
  margin: 0 auto;
  padding: 16px 26px 0;
  display: flex;
  gap: 10px;
  align-items: center;
  font-family: ${FONT_BODY};
}
.ws-btn {
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 15px;
  border-radius: 8px;
  border: 1px solid #E8E0CF;
  background: #FFFFFF;
  color: #0E0E11;
  cursor: pointer;
}
.ws-btn.primary { background: #0E0E11; border-color: #0E0E11; color: #FFFFFF; }
.ws-btn:focus-visible { outline: 2px solid #6E9DC8; outline-offset: 2px; }

@media print {
  .no-print { display: none !important; }
  .ws-sheet { padding: 0; max-width: none; margin: 0; }
  html, body { background: #FFF !important; }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
`;
