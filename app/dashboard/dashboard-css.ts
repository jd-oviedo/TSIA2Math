// Hover, focus and breakpoint rules for the dashboard tree. Same reason the
// topic page carries one of these: inline styles cannot express any of it.
// Everything is scoped under .um-dash.

export const DASHBOARD_CSS = `
.um-dash a { color: #6E9DC8; text-decoration: none; }
.um-dash a:hover { color: #F0A33E; }
.um-dash .um-nav-item:hover { background: rgba(242,237,223,.08); color: #F2EDDF; }
.um-dash .um-nav-item[aria-current="page"]:hover { background: #F5B15A; color: #0E0E11; }
.um-dash .um-card-link:hover { box-shadow: inset 0 0 0 1.5px #87CEEB; }
.um-dash .um-btn-primary:not(:disabled):hover { background: #F5B15A !important; }
.um-dash .um-btn-primary:not(:disabled):active { transform: translateY(2px); box-shadow: none !important; }
.um-dash button:focus-visible,
.um-dash a:focus-visible,
.um-dash input:focus-visible,
.um-dash textarea:focus-visible { outline: 2px solid #6E9DC8; outline-offset: 2px; }

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
