// The parts of the topic page that inline styles cannot express: hover and
// focus states, media queries, and the styling of server-rendered markdown,
// which arrives as an HTML string with no props to attach a style object to.
//
// Everything is scoped under .um-topic so none of it reaches the teacher
// dashboard or the adaptive test, which still run on the older --ec theme.

export const TOPIC_PAGE_CSS = `
.um-topic a { color: #6E9DC8; text-decoration: none; }
.um-topic a:hover { color: #F0A33E; }

/* globals.css paints KaTeX with the theme's ink, which in dark mode is a pale
   blue that would vanish on these cream cards. This page commits to one warm
   light surface, so math is pinned to Deep Midnight. */
.um-topic .katex { color: #0E0E11 !important; }
/* Kept for a display equation that arrives already wrapped, but note that
   nothing on these pages does: remark-math only emits a display node for a $$
   fence on its own lines, and this curriculum writes $$...$$ on a single line,
   which parses as inline math. Measured, .katex-display matches 0 elements
   across all 189 topic routes while .katex matches 4189, so this rule alone
   never fired and the real fix is the structural one below. */
.um-topic .katex-display { overflow-x: auto; overflow-y: hidden; padding: 2px 0; }

/* A formula alone in a paragraph is display math in everything but the markup,
   so it is matched by its position rather than by a class it never gets. Wide
   ones then scroll inside their own box instead of rocking the whole page
   sideways on a phone.
   :only-child is load-bearing. Inline math sharing a line with text must keep
   its baseline, and overflow on an inline box drops it to the bottom margin
   edge, which would nudge every formula in a sentence out of alignment.
   The 6px of vertical padding is room for stacked fractions, which overflow
   the box by 2-4px that overflow-y: hidden would otherwise shave off. */
.um-topic .um-prose p > .katex:only-child {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 6px 0;
}

.um-topic .um-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* Two lines, so a clamped answer key label still fits a stacked fraction. */
.um-topic .um-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Buttons carry their colours inline, so the interaction states have to win
   with !important rather than by cascade order. */
.um-topic .um-btn-primary:not(:disabled):hover { background: #F5B15A !important; }
.um-topic .um-btn-primary:not(:disabled):active {
  transform: translateY(2px);
  box-shadow: none !important;
}
.um-topic .um-btn-outline:not(:disabled):hover {
  box-shadow: inset 0 0 0 1.5px rgba(14,14,17,.4) !important;
  color: rgba(14,14,17,.85) !important;
}
.um-topic .um-link:not(:disabled):hover { color: #F0A33E !important; }
.um-topic .um-send:not(:disabled):hover { filter: brightness(1.06); }
.um-topic .um-solution-row:hover { opacity: .82; }

.um-topic .um-choice-live:hover {
  background: #F7F3E7 !important;
  box-shadow: inset 0 0 0 1.5px #87CEEB !important;
}
.um-topic .um-choice:focus-within { outline: 2px solid #6E9DC8; outline-offset: 2px; }
.um-topic .um-input:focus { outline: none; }
.um-topic .um-input::placeholder { color: rgba(14,14,17,.35); }

/* Server-rendered markdown: guided notes, worked solutions, and the static
   fallbacks. */
.um-topic .um-prose > *:first-child { margin-top: 0; }
.um-topic .um-prose > *:last-child { margin-bottom: 0; }
.um-topic .um-prose h1,
.um-topic .um-prose h2,
.um-topic .um-prose h3,
.um-topic .um-prose h4,
.um-topic .um-prose h5,
.um-topic .um-prose h6 {
  font-family: var(--font-kodchasan), 'Kodchasan', sans-serif;
  font-weight: 600;
  color: #0E0E11;
  line-height: 1.35;
  margin: 1.6em 0 .6em;
}
.um-topic .um-prose h1 { font-size: 22px; }
.um-topic .um-prose h2 { font-size: 19px; }
.um-topic .um-prose h3 { font-size: 17px; }
.um-topic .um-prose h4,
.um-topic .um-prose h5,
.um-topic .um-prose h6 { font-size: 15.5px; }
.um-topic .um-prose p { margin: 0 0 1em; }
.um-topic .um-prose ul,
.um-topic .um-prose ol { margin: 0 0 1em; padding-left: 1.4em; }
.um-topic .um-prose li { margin-bottom: .35em; }
.um-topic .um-prose strong { color: #0E0E11; font-weight: 600; }
.um-topic .um-prose hr { border: 0; border-top: 1px solid rgba(14,14,17,.1); margin: 1.4em 0; }
.um-topic .um-prose blockquote {
  margin: 0 0 1em;
  padding: 2px 0 2px 16px;
  border-left: 3px solid rgba(200,169,110,.5);
  color: rgba(14,14,17,.7);
}
.um-topic .um-prose code {
  font-family: ui-monospace, Menlo, monospace;
  font-size: .9em;
  background: rgba(14,14,17,.05);
  border-radius: 4px;
  padding: 1px 5px;
}
.um-topic .um-prose pre {
  overflow-x: auto;
  background: rgba(14,14,17,.05);
  border-radius: 10px;
  padding: 14px 16px;
}
.um-topic .um-prose pre code { background: none; padding: 0; }
/* The scroll box for a table too wide for the card, added around every table by
   rehypeScrollableTables in lib/curriculum-utils.ts. It is a wrapper rather
   than overflow on the table itself because a table needs display: block to
   scroll, and that costs its screen-reader semantics.
   The bottom margin moves here from the table so that spacing is unchanged and
   .um-prose > *:last-child still finds the last block. */
.um-topic .um-prose .um-table-scroll { max-width: 100%; overflow-x: auto; margin: 0 0 1em; }
.um-topic .um-prose .um-table-scroll > table { margin: 0; }
.um-topic .um-prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 1em;
  font-size: .94em;
}
.um-topic .um-prose th,
.um-topic .um-prose td {
  border: 1px solid rgba(14,14,17,.12);
  padding: 8px 11px;
  text-align: left;
}
.um-topic .um-prose th { background: #F2EDDF; font-weight: 600; color: #0E0E11; }
.um-topic .um-prose img { max-width: 100%; height: auto; }
/* Practice and quiz stems can carry a diagram too, and they are not inside
   .um-prose. Without this the SVG renders at its intrinsic width and overflows
   the card on a phone, which is the primary target. */
.um-topic .um-stem img { max-width: 100%; height: auto; display: block; margin: 10px 0 2px; }

/* Mobile is the primary target: a stuck student on a phone is the hardest
   case. Cards lose their side padding first, then type steps down. */
/* The lesson outline rail and the reading column beside it.

   The rail is REMOVED below 760px, not narrowed and not collapsed into a drawer.
   At 760 the page has 692px of usable width, and taking 264 of it for the rail
   leaves 428 for the notes, which is narrower than the phone layout the notes are
   already tuned for. The design removes it at phone width too. What replaces it
   is .um-lesson-strip, which is the one part of the design's mobile strip that
   does not need scroll observation: the section count. The progress fill and the
   current-section counter are absent because they do, and the Outline button is
   absent because the panel behind it was never drawn. */
@media (max-width: 760px) {
  .um-topic .um-lesson-layout { flex-direction: column; gap: 0 !important; }
  .um-topic .um-lesson-rail { display: none !important; }
  .um-topic .um-lesson-column { max-width: 100% !important; }
  .um-topic .um-lesson-strip { display: block !important; }
  .um-topic .um-page { padding: 22px 16px 56px !important; gap: 26px !important; }
  .um-topic .um-bar { padding: 12px 16px !important; gap: 12px !important; }
  .um-topic .um-title { font-size: 25px !important; }
  .um-topic .um-stem { font-size: 17px !important; }
  .um-topic fieldset { padding: 20px 18px 18px !important; }
  .um-topic .um-gumu-card { gap: 16px !important; padding: 18px 20px !important; }
  .um-topic .um-prose-card { padding: 20px 18px !important; }
}

@media (max-width: 460px) {
  /* The breadcrumb keeps the two segments that say where you are and drops the
     course, which is the same on every page a student can reach from here.
     Previously the whole trail was hidden, so a phone had no breadcrumb at all. */
  .um-topic .um-bar-trail { font-size: 12px; }
  .um-topic .um-bar-trail > a:first-of-type { display: none; }
  .um-topic .um-bar-trail > a:first-of-type + span { display: none; }
  /* Three joined segments do not fit beside the trigger, the wordmark and the
     breadcrumb at this width, so the indicator collapses to the name of the part
     you are on. Same information, one word. The design does this at 390. */
  .um-topic .um-bar-parts { display: none !important; }
  .um-topic .um-bar-part-now { display: inline !important; }
  .um-topic .um-btn-primary { width: 100%; justify-content: center; }
}
`;
