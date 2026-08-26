import { DASH_VARS_CSS } from '@/app/components/dashboard-theme';
import { HOVER_LABEL_CSS } from '@/app/components/HoverLabel';

// Hover, focus and breakpoint rules for the dashboard tree. Same reason the
// topic page carries one of these: inline styles cannot express any of it.
// Everything is scoped under .um-dash apart from the body reset, which cannot
// be.
//
// DASH_VARS_CSS publishes the content surface as --umd-* custom properties, in
// both themes. That indirection is what lets the server-rendered pages under
// /dashboard read theme-dependent colours at all: they cannot call useTheme(),
// but they can write var(--umd-card-bg) and let StudentShell's data-theme
// attribute decide which value that resolves to.

export const DASHBOARD_CSS = `
/* Tailwind's preflight never runs in this app -- there is no postcss config --
   so the user-agent's 8px body margin survives and floats the whole shell off
   the viewport edges. The teacher dashboard zeroes it in its own style block;
   this is the same reset for the student tree. */
body { margin: 0; -webkit-font-smoothing: antialiased; }
.um-dash, .um-dash * { box-sizing: border-box; }

${DASH_VARS_CSS}
${HOVER_LABEL_CSS}

/* Links were #6E9DC8, Gemini Blue, hardcoded and so the same in both themes.
   Measured on the two grounds they actually render on -- the page ground under
   upgrade/page.tsx:55 and a card under grades/page.tsx:103 -- that is 2.63 and
   2.87 in light: failing AA since this shell shipped, and passing in dark.
   --umd-link is Gemini darkened to #2F6091 in light (6.01 / 6.56) and is Gemini
   itself in dark, where it already cleared. The identical defect and the
   identical fix as the curriculum tree's; see dashboard-theme.ts.

   The hover was #F0A33E, which is orange carrying text. That is the one
   absolute in this palette -- orange is a fill, a CTA or a marker, never text
   -- and it also measured 2.10 at its best. --umd-link-hover is the accent
   pair, #0F69BA light and #5AAAEE dark, so the link brightens rather than
   changing family. It is deliberately NOT the curriculum tree's own hover,
   which is orange; see the token's comment for why the mirror stops here. */
.um-dash a { color: var(--umd-link); text-decoration: none; }
.um-dash a:hover { color: var(--umd-link-hover); }
.um-dash .um-card-link:hover { box-shadow: inset 0 0 0 1.5px #87CEEB; }
.um-dash .um-btn-primary:not(:disabled):hover { background: #F5B15A !important; }
.um-dash .um-btn-primary:not(:disabled):active { transform: translateY(2px); box-shadow: none !important; }
/* The ring marks a control boundary, so the obligation is WCAG 1.4.11 at 3:1.
   #6E9DC8 measured 2.19 on the cream rail, where every nav link and the logout
   button focus, and that rail is the binding ground rather than the page.
   --umd-focus is #0F69BA light (4.27 on the rail) and #5AAAEE dark (6.44). */
.um-dash button:focus-visible,
.um-dash a:focus-visible,
.um-dash input:focus-visible,
.um-dash textarea:focus-visible { outline: 2px solid var(--umd-focus); outline-offset: 2px; }

/* There used to be .um-nav-item hover rules here. They never fired: sidebar
   links set colour and background inline for the active state, and an inline
   declaration beats a stylesheet :hover rule. Nav hover is React state in
   StudentNav now, which is also how the teacher sidebar does it. */

.um-dash .um-visually-hidden {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; border: 0;
}

/* Tables scroll inside their own card rather than widening the page. */
.um-dash .um-scroll-x { overflow-x: auto; }
.um-dash table { border-collapse: collapse; width: 100%; }

@media (max-width: 900px) {
  .um-dash .um-sidebar { display: none !important; }
  .um-dash .um-topbar { display: flex !important; }
  .um-dash .um-dash-main { padding: 22px 16px 56px !important; }

  /* THE TWO-COLUMN PAGE HEAD STACKS. PageHeadRow (ui.tsx) puts a panel beside
     the page title; below the rail's breakpoint there is no room for one and
     the title would be the column that gave way.

     !important because the row's base layout is inline, and an inline
     declaration beats a plain stylesheet rule -- the lesson already recorded
     twenty lines up, about the .um-nav-item hover rules that never fired. The
     three rules above it in this block carry it for the same reason.

     THE CHILD RULE IS NOT DECORATION. flex: 0 1 320px is a basis along the
     MAIN axis, so the moment the direction turns to column those 320px become
     a HEIGHT, and both columns would be laid out 320px tall. align-items:
     stretch is what widens the join panel to the full column once it is no
     longer holding a 320px cross-size of its own. */
  .um-dash .um-head-row { flex-direction: column !important; flex-wrap: nowrap !important; align-items: stretch !important; }
  .um-dash .um-head-row > * { flex: 0 0 auto !important; }
}
`;
