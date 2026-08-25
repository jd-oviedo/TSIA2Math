// verify_surface_page_bg.mjs -- the student dashboard, curriculum and login
// grounds, measured rather than read off the selector.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_surface_page_bg.mjs
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_surface_page_bg.mjs --prove
//
// The sibling of verify_worksheet_page_bg.mjs, for the three theme-aware
// surfaces that one left out of scope.
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
// The three surface stylesheets used to repaint it with
//
//   body:has(.um-dash)  { background: #F5F5F3; }
//   body:has(.um-topic) { background: #E8E0CF; }
//   body:has(.um-login) { background: #FAF8F5; }
//
// filed as Selectors Level 4 debt, on the grounds that :has() does not parse
// below Safari 15.4 and an unparseable selector drops its own rule. True, and
// not the reason they failed. An inline declaration outranks EVERY stylesheet
// rule at every specificity unless that rule is !important, and none of these
// were, so they lost to the inline prop in Chrome and Safari 18 as well. Not
// one of them had ever painted anything, on any browser.
//
// That is what makes this measurable rather than arguable. The checks below run
// in chromium, which supports :has() completely. If this were merely a Safari
// parsing problem the pre-fix rules would PASS here. They do not, and --prove is
// what shows that.
//
// ─── WHY THE WORKSHEET FIX DID NOT TRANSFER ─────────────────────────────────
//
// The worksheet chrome is a single colour, so a bare `body { background: ...
// !important }` was enough there. These three surfaces are theme-aware, and the
// theme marker lives on the DESCENDANT container: .um-dash, .um-topic and
// .um-login carry data-theme, while ThemeProvider writes only custom properties
// to documentElement and stamps no attribute a body rule could switch on. A bare
// body selector could therefore carry exactly one colour and would paint a light
// gutter behind a dark page. Selecting an ancestor from a descendant's state is
// the one thing :has() was doing that no Level 1 selector can replicate.
//
// So the colour is written as an inline style by the client wrapper that already
// knows the theme -- StudentShell, TopicSurface and LoginChrome, through
// useBodyBackground.
//
// The dashboard case scans DASH_VARS_CSS rather than the whole DASHBOARD_CSS:
// that module also pulls in HoverLabel.tsx, which this script's loader hook does
// not resolve. The remaining rules in app/dashboard/dashboard-css.ts are plain
// hover, focus and breakpoint rules and are covered by the repo-wide sweep.
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
//
// One case cannot be falsified by colour alone: login's DARK ground is #0C1120,
// deliberately reused from --ec-bg dark, so in dark mode the pre-fix fallback
// and the correct ground are the same pixel. Check 1 says so out loud rather
// than counting it, and checks 2 and 3 are structural precisely so that case is
// still covered.

import { chromium } from 'playwright';
import { LIGHT, DARK, DASH_VARS_CSS } from '../app/components/dashboard-theme.ts';
import { SURFACES as TOPIC_SURFACES } from '../app/components/curriculum-surface.ts';
import { TOPIC_PAGE_CSS } from '../app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/topic-page-css.ts';
import { SURFACES as LOGIN_SURFACES, LOGIN_CSS } from '../app/login/login-theme.ts';

const PROVE = process.argv.includes('--prove');

let failures = 0;
let hollow = 0;
const fail = (m) => { failures++; console.log(`  FAIL  ${m}`); };
const pass = (m) => console.log(`  ok    ${m}`);
const note = (m) => console.log(`  --    ${m}`);

const rgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

// --ec-bg, the global theme ground the body falls back to when nothing repaints it.
const EC_BG = { light: '#F0EDE8', dark: '#0C1120' };

const CASES = [
  {
    name: 'dashboard',
    cls: 'um-dash',
    css: DASH_VARS_CSS,
    ground: { light: LIGHT.pageBg, dark: DARK.pageBg },
    // The rules exactly as they read before this change.
    prefix: `body:has(.um-dash) { background: ${LIGHT.pageBg}; }\n` +
            `body:has(.um-dash[data-theme="dark"]) { background: ${DARK.pageBg}; }`,
  },
  {
    name: 'curriculum',
    cls: 'um-topic',
    css: TOPIC_PAGE_CSS,
    ground: { light: TOPIC_SURFACES.light.page, dark: TOPIC_SURFACES.dark.page },
    prefix: `body:has(.um-topic) { background: ${TOPIC_SURFACES.light.page}; }\n` +
            `body:has(.um-topic[data-theme="dark"]) { background: ${TOPIC_SURFACES.dark.page}; }`,
  },
  {
    name: 'login',
    cls: 'um-login',
    css: LOGIN_CSS,
    ground: { light: LOGIN_SURFACES.light.ground, dark: LOGIN_SURFACES.dark.ground },
    prefix: `body:has(.um-login) { background: ${LOGIN_SURFACES.light.ground}; }\n` +
            `body:has(.um-login[data-theme="dark"]) { background: ${LOGIN_SURFACES.dark.ground}; }`,
  },
];

// The real DOM shape: the root layout's inline-styled body, the surface
// stylesheet, and the themed container inside it.
function doc(c, theme, extraCss) {
  return `<!doctype html><html><head>
    <style>:root { --ec-bg: ${EC_BG[theme]}; }</style>
    <style id="surface">${c.css}${extraCss ? '\n' + extraCss : ''}</style>
  </head>
  <body class="min-h-dvh" style="background: var(--ec-bg); color: var(--ec-ink)">
    <div class="${c.cls}" data-theme="${theme}" style="min-height: 100dvh">surface</div>
  </body></html>`;
}

// Strip CSS comments, then walk the rules. Used by check 3.
function bodyBackgroundRules(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  for (const m of stripped.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const selector = m[1].trim();
    const declarations = m[2];
    // A body rule that touches `background` at all. `body { margin: 0 }` is
    // fine and is deliberately not flagged.
    if (/(^|,)\s*body\b/.test(selector) && /\bbackground\b/.test(declarations)) {
      out.push(`${selector} { ${declarations.trim()} }`);
    }
  }
  return out;
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.emulateMedia({ media: 'screen' });

console.log(
  PROVE
    ? 'PROVE: running against the PRE-FIX rules (body:has, no inline write)\n'
    : 'Running against the shipped arrangement\n'
);

// ── 1. the gutter is the surface ground, in both themes, on all three ─────
console.log('1. measured gutter');
for (const c of CASES) {
  for (const theme of ['light', 'dark']) {
    await page.setContent(doc(c, theme, PROVE ? c.prefix : ''), { waitUntil: 'load' });
    if (!PROVE) {
      // What useBodyBackground does, and the only thing it does.
      await page.evaluate((color) => { document.body.style.background = color; }, c.ground[theme]);
    }

    const got = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const want = rgb(c.ground[theme]);
    const label = `${c.name.padEnd(10)} ${theme.padEnd(5)}`;

    // The one case where the correct ground and the fallback are the same pixel.
    if (c.ground[theme].toUpperCase() === EC_BG[theme].toUpperCase()) {
      hollow++;
      note(`${label} ground ${c.ground[theme]} IS --ec-bg, not falsifiable by colour (see checks 2 and 3)`);
      continue;
    }

    if (got === want) pass(`${label} gutter is ${c.ground[theme]}`);
    else if (got === rgb(EC_BG[theme]))
      fail(`${label} gutter fell back to --ec-bg ${EC_BG[theme]}, the rule never painted`);
    else fail(`${label} gutter is ${got}, wanted ${want} (${c.ground[theme]})`);
  }
}

// ── 2. the body carries its own resolved ground, not a var() fallback ─────
// Structural, so it still bites on login dark where the two colours coincide.
// Pre-fix, body's own specified value is the layout's `var(--ec-bg)` and the
// stylesheet never overrides it.
console.log('\n2. body specified value');
for (const c of CASES) {
  for (const theme of ['light', 'dark']) {
    await page.setContent(doc(c, theme, PROVE ? c.prefix : ''), { waitUntil: 'load' });
    if (!PROVE) {
      await page.evaluate((color) => { document.body.style.background = color; }, c.ground[theme]);
    }
    const specified = await page.evaluate(() => document.body.style.background);
    const label = `${c.name.padEnd(10)} ${theme.padEnd(5)}`;
    if (specified === rgb(c.ground[theme])) pass(`${label} body declares ${c.ground[theme]} itself`);
    else fail(`${label} body still declares "${specified}", the ground is not its own`);
  }
}

// ── 3. no stylesheet tries to set the body background at all ──────────────
// The shipped invariant: the ground comes from the wrapper, so a body
// background rule reappearing in one of these strings is the regression.
console.log('\n3. no body background rule in the stylesheet');
for (const c of CASES) {
  const css = c.css + (PROVE ? '\n' + c.prefix : '');
  const offenders = bodyBackgroundRules(css);
  if (offenders.length === 0) pass(`${c.name.padEnd(10)} stylesheet sets no body background`);
  else fail(`${c.name.padEnd(10)} stylesheet sets the body background: ${JSON.stringify(offenders)}`);
}

// ── 4. the two themes do not collapse onto one colour ─────────────────────
// The failure mode a bare `body` type selector would have introduced: one
// colour for both themes, so a dark page gets a light gutter.
console.log('\n4. themes stay distinct');
for (const c of CASES) {
  if (c.ground.light !== c.ground.dark) pass(`${c.name.padEnd(10)} light and dark grounds are distinct`);
  else fail(`${c.name.padEnd(10)} light and dark grounds are both ${c.ground.light}`);
}

// ── 5. no Selectors Level 4 anywhere in any of the three stylesheets ──────
// Scans the string that is actually in play, so --prove turns this red too on
// the :has( it restores. Pointed only at the shipped strings it could never fail.
console.log('\n5. no Selectors Level 4');
const L4 = /:not\([^)]*[ >+~][^)]*\)|:has\(/;
for (const c of CASES) {
  const css = c.css + (PROVE ? '\n' + c.prefix : '');
  const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const offenders = declarations.split('\n').filter((line) => L4.test(line));
  if (offenders.length === 0) pass(`${c.name.padEnd(10)} no Selectors Level 4 syntax in the stylesheet`);
  else fail(`${c.name.padEnd(10)} Selectors L4, which older Safari drops: ${JSON.stringify(offenders)}`);
}

await browser.close();

console.log('');
if (PROVE) {
  if (hollow > 0) console.log(`(${hollow} colour assertion(s) skipped as not falsifiable, by design)`);
  if (failures > 0) {
    console.log(`PROVE: ${failures} assertion(s) failed against the pre-fix rules, as required.`);
    process.exit(0);
  }
  console.log('PROVE: the pre-fix rules passed every check. This harness is hollow.');
  process.exit(1);
}
console.log(failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
