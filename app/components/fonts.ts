// Font stacks for the teacher-facing surfaces (/teacher, /teacher/student/[id],
// /demo, /demo/student/camila).
//
// Both faces are loaded once in app/layout.tsx via next/font/google, which
// exposes them as the CSS variables below. These constants exist so the inline
// style={{ fontFamily }} pattern the dashboards use can reference them without
// each page re-declaring a literal font stack.
//
// FONT_HEADING — Kodchasan. Headings and heading-weight labels.
// FONT_BODY    — Nunito. Everything else: body copy, labels, tables, buttons.
//
// FONT_BODY is also the document default, set on body in globals.css, so a
// component that sets no font-family at all still lands on Nunito.

export const FONT_HEADING = "var(--font-kodchasan), 'Kodchasan', sans-serif";
export const FONT_BODY = "var(--font-nunito), 'Nunito', sans-serif";

// Dropped into each page's <style> block so non-inline text, form controls, and
// semantic headings pick up the right face without touching every element.
export const FONT_BASE_CSS = `
  body { font-family: ${FONT_BODY}; }
  h1, h2, h3, h4, h5, h6 { font-family: ${FONT_HEADING}; }
  button, input, select, textarea { font-family: inherit; }
`;
