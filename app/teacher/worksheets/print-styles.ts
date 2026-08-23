// The paper.
//
// One stylesheet, shared by the worksheet and the answer key, injected by each
// print route as a <style> tag rather than living in globals.css. It applies to
// two routes out of the whole app and has no business in the bundle every other
// page loads.
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

export const PRINT_CSS = `
@page { size: letter portrait; margin: 0.6in 0.65in; }

.ws-sheet {
  background: #FFFFFF;
  color: #111111;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 11.5pt;
  line-height: 1.45;
  max-width: 7.2in;
  margin: 0 auto;
  padding: 28px 26px 60px;
  box-sizing: border-box;
}

/* See the header: this must not be inside @media print. */
.ws-sheet .katex { color: #000000 !important; }

/* KaTeX sets 1.21em by default, which on a serif body face makes every inline
   number visibly larger than the words around it -- "adds 9 to 14" comes out
   with two oversized digits. Pulled back so math sits ON the text baseline
   rhythm rather than above it. Measured on the rendered sheet, not guessed. */
.ws-sheet .katex { font-size: 1.05em; }

/* The worked solution is split out of Part 4 on item boundaries, and the
   authored horizontal rule between items lands at the end of the body. It is a
   section separator in the source, not part of the solution, so it prints as a
   stray line above the misconception panel. Hidden here rather than stripped in
   the parser: the parser's output is pinned byte-for-byte against
   splitAnswerKey() by verify_answer_key_parity.mjs, and this is presentation.
   (No backticks in this file -- the whole stylesheet is one template literal.) */
.ws-solution hr { display: none; }
.ws-sheet a { color: #111111; text-decoration: none; }

/* ── masthead ── */
.ws-head {
  border-bottom: 2px solid #111;
  padding-bottom: 10px;
  margin-bottom: 22px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
}
.ws-title { font-size: 17pt; font-weight: 700; margin: 0 0 3px; letter-spacing: -0.01em; }
.ws-sub { font-size: 8.5pt; color: #555; margin: 0; letter-spacing: 0.06em; text-transform: uppercase; }
.ws-fields { font-size: 9.5pt; color: #333; text-align: right; white-space: nowrap; line-height: 2.1; }
.ws-fields span { display: block; }
.ws-rule { display: inline-block; border-bottom: 1px solid #999; width: 1.7in; margin-left: 6px; }

/* ── questions ── */
.ws-q {
  /* The requirement: a question never splits across a page. Both properties,
     because break-inside is the modern name and page-break-inside is what
     older print engines still honour. */
  break-inside: avoid;
  page-break-inside: avoid;
  margin: 0 0 17px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.ws-n {
  font-weight: 700;
  min-width: 1.5em;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.ws-body { flex: 1; min-width: 0; }
.ws-stem { margin: 0 0 7px; }

/* Two columns where the choices are short, one where they are not. The grid
   collapses naturally on a narrow sheet. */
.ws-choices {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3px 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ws-choices.wide { grid-template-columns: minmax(0, 1fr); }
.ws-choice { display: flex; gap: 6px; align-items: baseline; }
.ws-letter { font-weight: 600; min-width: 1.1em; flex-shrink: 0; }

.ws-topic-head {
  break-after: avoid;
  page-break-after: avoid;
  font-size: 8.5pt;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #666;
  border-bottom: 1px solid #DDD;
  padding-bottom: 3px;
  margin: 20px 0 12px;
}
.ws-q + .ws-topic-head { margin-top: 24px; }
.ws-topic-id { font-weight: 700; }
.ws-topic-name { margin-left: 7px; }

.ws-foot {
  margin-top: 30px;
  padding-top: 8px;
  border-top: 1px solid #DDD;
  font-size: 8pt;
  color: #777;
  display: flex;
  justify-content: space-between;
}

/* ── answer key ── */
.ws-key-q {
  break-inside: avoid;
  page-break-inside: avoid;
  margin: 0 0 14px;
  padding: 11px 13px;
  border: 1px solid #E2E2E2;
  border-radius: 3px;
  background: #FDFDFD;
}
.ws-key-head { display: flex; gap: 10px; align-items: baseline; margin-bottom: 6px; }
.ws-key-body { flex: 1; min-width: 0; }
.ws-key-topic {
  font-size: 7.5pt;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #666;
  margin: 0 0 3px;
}
.ws-key-stem { font-size: 10.5pt; }

/* The correct letter, as a filled chip. Reads at a glance while marking. */
.ws-correct {
  flex-shrink: 0;
  background: #111;
  color: #FFF;
  font-family: Georgia, serif;
  font-weight: 700;
  font-size: 10pt;
  line-height: 1;
  padding: 5px 9px;
  border-radius: 3px;
  letter-spacing: 0.02em;
  /* Backgrounds are dropped from print unless the teacher ticks "Background
     graphics", which would turn a black chip into black-on-white text -- still
     legible, so this is a progressive enhancement rather than a dependency.
     print-color-adjust asks for it anyway; it is one small mark per question,
     not a full-bleed area. */
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.ws-solution {
  font-size: 10pt;
  color: #222;
  margin: 8px 0 0;
  padding-left: 11px;
  border-left: 2px solid #DDD;
}
.ws-solution p { margin: 0 0 5px; }
.ws-solution p:last-child { margin-bottom: 0; }

/* ── the misconception notes ──────────────────────────────────────────────
   The differentiator, and the reason this block gets real treatment rather
   than a bulleted list. A teacher marking a stack of these is scanning for
   "what did the ones who chose C get wrong", so the letter is the anchor and
   the sentence hangs off it. */
.ws-notes {
  margin: 9px 0 0;
  padding: 9px 11px;
  background: #F7F5EF;
  border-left: 3px solid #B08328;
  border-radius: 0 3px 3px 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ws-notes-label {
  font-size: 7.5pt;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: #8A6A16;
  font-weight: 700;
  margin: 0 0 6px;
}
.ws-note {
  font-size: 9.5pt;
  line-height: 1.42;
  margin: 0 0 5px;
  display: flex;
  gap: 7px;
  align-items: baseline;
  color: #2A2A2A;
}
.ws-note:last-child { margin-bottom: 0; }
.ws-note-letter {
  flex-shrink: 0;
  font-weight: 700;
  font-size: 8.5pt;
  min-width: 4.4em;
  color: #8A6A16;
  letter-spacing: 0.02em;
}
.ws-note-correct .ws-note-letter { color: #2C6248; }

.ws-caveat {
  margin: 9px 0 0;
  font-size: 9pt;
  color: #666;
  font-style: italic;
}

/* ── screen-only affordances ── */
.ws-toolbar {
  max-width: 7.2in;
  margin: 0 auto;
  padding: 16px 26px 0;
  display: flex;
  gap: 10px;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.ws-btn {
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 15px;
  border-radius: 7px;
  border: 1px solid #D5D3CB;
  background: #FFF;
  color: #1A1A1A;
  cursor: pointer;
}
.ws-btn.primary { background: #0F1E35; border-color: #0F1E35; color: #FFF; }
.ws-btn:focus-visible { outline: 2px solid #0F69BA; outline-offset: 2px; }

@media print {
  .no-print { display: none !important; }
  .ws-sheet { padding: 0; max-width: none; margin: 0; }
  html, body { background: #FFF !important; }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
`;
