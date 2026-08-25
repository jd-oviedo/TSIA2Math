// verify_surface_page_bg.mjs -- the student dashboard and curriculum grounds,
// measured rather than read off the selector.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_surface_page_bg.mjs
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_surface_page_bg.mjs --prove
//
// The sibling of verify_worksheet_page_bg.mjs, for the two surfaces that one
// left out of scope.
//
// ─── WHAT IS BEING PROVED ───────────────────────────────────────────────────
//
// app/layout.tsx:51 paints the body from an INLINE style prop:
//
//   <body className="min-h-dvh" style={{ background: "var(--ec-bg)", ... }}>
//
// --ec-bg is #F0EDE8 in light and #0C1120 in dark, and html sets no background
// of its own, so body's value propagates to the canvas and is what shows in the
// overscroll gutter.
//
// DASH_VARS_CSS and CURRICULUM_VARS_CSS used to repaint it with
//
//   body:has(.um-dash)  { background: #F5F5F3; }
//   body:has(.um-topic) { background: #E8E0CF; }
//
// filed as Selectors Level 4 debt, on the grounds that :has() does not parse
// below Safari 15.4 and an unparseable selector drops its own rule. True, and
// not the reason they failed. An inline declaration outranks EVERY stylesheet
// rule at every specificity unless that rule is !important, and these were not,
// so they lost to the inline prop in Chrome and Safari 18 as well. Neither rule
// had ever painted anything, on any browser.
//
// That is what makes this measurable rather than arguable. The checks below run
// in chromium, which supports :has() completely. If this were merely a Safari
// parsing problem the pre-fix rules would PASS here. They do not, and --prove is
// what shows that.
//
// ─── WHY THE WORKSHEET FIX DID NOT TRANSFER ─────────────────────────────────
//
// The worksheet chrome is a single colour, so a bare `body { background: ...
// !important }` was enough there. These two surfaces are theme-aware, and the
// theme marker lives on the DESCENDANT container: .um-dash and .um-topic carry
// data-theme, while ThemeProvider writes only custom properties to
// documentElement and stamps no attribute a body rule could switch on. A bare
// body selector could therefore carry exactly one colour and would paint a light
// gutter behind a dark page. Selecting an ancestor from a descendant's state is
// the one thing :has() was doing that no Level 1 selector can replicate.
//
// So the colour is written as an inline style by the client wrapper that already
// knows the theme -- StudentShell and TopicSurface, through useBodyBackground.
// It is theme-aware because it is recomputed, it beats the layout's own inline
// value because it replaces it, and it involves no selector at all, so there is
// nothing left to fail to parse on an older Safari.
//
// NO DATABASE, NO SESSION, NO SERVER, same as verify_worksheet_page_bg.mjs. What
// is asserted is the cascade, which is a pure function of the stylesheet plus a
// DOM shape. The hook's own wiring -- that each wrapper passes the resolved
// colour for the current theme -- is covered by tsc and was measured live
// against `next build && next start` when it shipped.
//
// ─── --prove ────────────────────────────────────────────────────────────────
//
// Re-runs every assertion against the PRE-FIX arrangement, restored verbatim,
// and requires them to FAIL. A background check that passes against the version
// that never painted is measuring nothing.

import { chromium } from 'playwright';
import { LIGHT, DARK, DASH_VARS_CSS } from '../app/components/dashboard-theme.ts';
import { SURFACES, CURRICULUM_VARS_CSS } from '../app/components/curriculum-surface.ts';

const PROVE = process.argv.includes('--prove');

let failures = 0;
const fail = (m) => { failures++; console.log(`  FAIL  ${m}`); };
const pass = (m) => console.log(`  ok    ${m}`);

const rgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

// --ec-bg, the global theme ground the body falls back to when nothing repaints it.
const EC_BG = { light: '#F0EDE8', dark: '#0C1120' };

const SURFACE_CASES = [
  {
    name: 'dashboard',
    cls: 'um-dash',
    vars: DASH_VARS_CSS,
    ground: { light: LIGHT.pageBg, dark: DARK.pageBg },
    // The rules exactly as they read before this change.
    prefix: `body:has(.um-dash) { background: ${LIGHT.pageBg}; }\n` +
            `body:has(.um-dash[data-theme="dark"]) { background: ${DARK.pageBg}; }`,
  },
  {
    name: 'curriculum',
    cls: 'um-topic',
    vars: CURRICULUM_VARS_CSS,
    ground: { light: SURFACES.light.page, dark: SURFACES.dark.page },
    prefix: `body:has(.um-topic) { background: ${SURFACES.light.page}; }\n` +
            `body:has(.um-topic[data-theme="dark"]) { background: ${SURFACES.dark.page}; }`,
  },
];

// The real DOM shape: the root layout's inline-styled body, the surface
// stylesheet, and the themed container inside it.
function doc(c, theme, extraCss) {
  return `<!doctype html><html><head>
    <style>:root { --ec-bg: ${EC_BG[theme]}; }</style>
    <style>body { margin: 0; }</style>
    <style id="surface">${c.vars}${extraCss ? '\n' + extraCss : ''}</style>
  </head>
  <body class="min-h-dvh" style="background: var(--ec-bg); color: var(--ec-ink)">
    <div class="${c.cls}" data-theme="${theme}" style="min-height: 100dvh">surface</div>
  </body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.emulateMedia({ media: 'screen' });

console.log(
  PROVE
    ? 'PROVE: running against the PRE-FIX rules (body:has, no inline write)\n'
    : 'Running against the shipped arrangement\n'
);

// ── 1. the gutter is the surface ground, in both themes, on both surfaces ──
for (const c of SURFACE_CASES) {
  for (const theme of ['light', 'dark']) {
    // Pre-fix: the stylesheet rule is restored and nothing writes the inline
    // style. Shipped: no body rule exists, and the wrapper writes the colour the
    // way useBodyBackground does.
    await page.setContent(doc(c, theme, PROVE ? c.prefix : ''), { waitUntil: 'load' });
    if (!PROVE) {
      await page.evaluate((color) => { document.body.style.background = color; }, c.ground[theme]);
    }

    const got = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const want = rgb(c.ground[theme]);
    const label = `${c.name.padEnd(10)} ${theme.padEnd(5)}`;

    if (got === want) pass(`${label} gutter is ${c.ground[theme]}`);
    else if (got === rgb(EC_BG[theme]))
      fail(`${label} gutter fell back to --ec-bg ${EC_BG[theme]}, the rule never painted`);
    else fail(`${label} gutter is ${got}, wanted ${want} (${c.ground[theme]})`);
  }
}

// ── 2. the two themes do not collapse onto one colour ─────────────────────
// The failure mode a bare `body` type selector would have introduced: one
// colour for both themes, so a dark page gets a light gutter.
for (const c of SURFACE_CASES) {
  if (c.ground.light !== c.ground.dark) pass(`${c.name.padEnd(10)} light and dark grounds are distinct`);
  else fail(`${c.name.padEnd(10)} light and dark grounds are both ${c.ground.light}`);
}

// ── 3. no Selectors Level 4 anywhere in either stylesheet ─────────────────
// Scans the string that is actually in play, so --prove turns this red too on
// the :has( it restores. Pointed only at the shipped strings it could never fail.
const L4 = /:not\([^)]*[ >+~][^)]*\)|:has\(/;
for (const c of SURFACE_CASES) {
  const css = c.vars + (PROVE ? '\n' + c.prefix : '');
  const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const offenders = declarations.split('\n').filter((line) => L4.test(line));
  if (offenders.length === 0) pass(`${c.name.padEnd(10)} no Selectors Level 4 syntax in the stylesheet`);
  else fail(`${c.name.padEnd(10)} Selectors L4, which older Safari drops: ${JSON.stringify(offenders)}`);
}

await browser.close();

console.log('');
if (PROVE) {
  if (failures > 0) {
    console.log(`PROVE: ${failures} assertion(s) failed against the pre-fix rules, as required.`);
    process.exit(0);
  }
  console.log('PROVE: the pre-fix rules passed every check. This harness is hollow.');
  process.exit(1);
}
console.log(failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
