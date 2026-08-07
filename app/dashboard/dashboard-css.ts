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

.um-dash a { color: #6E9DC8; text-decoration: none; }
.um-dash a:hover { color: #F0A33E; }
.um-dash .um-card-link:hover { box-shadow: inset 0 0 0 1.5px #87CEEB; }
.um-dash .um-btn-primary:not(:disabled):hover { background: #F5B15A !important; }
.um-dash .um-btn-primary:not(:disabled):active { transform: translateY(2px); box-shadow: none !important; }
.um-dash button:focus-visible,
.um-dash a:focus-visible,
.um-dash input:focus-visible,
.um-dash textarea:focus-visible { outline: 2px solid #6E9DC8; outline-offset: 2px; }

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
}
`;
