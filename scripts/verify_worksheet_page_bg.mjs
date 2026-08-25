// verify_worksheet_page_bg.mjs -- the worksheet page ground, measured rather
// than read off the selector.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_worksheet_page_bg.mjs
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_worksheet_page_bg.mjs --prove
//
// ─── WHAT IS BEING PROVED ───────────────────────────────────────────────────
//
// app/layout.tsx:51 paints the body from an INLINE style prop:
//
//   <body className="min-h-dvh" style={{ background: "var(--ec-bg)", ... }}>
//
// --ec-bg is #F0EDE8 in light and #0C1120 in dark. The teacher surface is
// light-only and cannot reach the theme toggle, so on a worksheet route that
// blue-black is what shows in the overscroll gutter -- html sets no background
// of its own, so body's propagates to the canvas.
//
// WS_CHROME_CSS is supposed to repaint it. Until this change it did so with
//
//   body:has(.ws-page) { background: #E8E0CF; }
//
// which was filed as Selectors Level 4 debt: :has() does not parse below Safari
// 15.4, and an unparseable selector drops its own rule. True, and not the
// reason it failed. An inline declaration outranks EVERY stylesheet rule at
// every specificity unless that rule is !important, and this one was not -- so
// the body background lost to the inline prop in Chrome and Safari 18 too. The
// rule had never painted anything, on any browser, since #200.
//
// That is what makes this measurable rather than arguable. The check below runs
// in chromium, which supports :has() completely. If the old rule were merely a
// Safari parsing problem it would PASS here. It does not, and --prove is what
// shows that.
//
// The shipped rule is `@media screen { body { background: #E8E0CF !important } }`:
// a Selectors Level 1 type selector, scoped by injection rather than by the
// selector, and important enough to reach past the inline prop.
//
// NO DATABASE, NO SESSION, NO SERVER, same as verify_worksheet_cascade.mjs. The
// stylesheet is an exported string and the cascade is a pure function of it plus
// a DOM shape.
//
// ─── --prove ────────────────────────────────────────────────────────────────
//
// Re-runs every assertion against the PRE-FIX rule, restored verbatim, and
// requires them to FAIL. A background check that passes against the version
// that never painted is measuring nothing.

import { chromium } from 'playwright';
import { WS, WS_CHROME_CSS } from '../app/teacher/worksheets/worksheet-theme.ts';
import { PRINT_CSS } from '../app/teacher/worksheets/print-styles.ts';

const PROVE = process.argv.includes('--prove');

let failures = 0;
const fail = (m) => { failures++; console.log(`  FAIL  ${m}`); };
const pass = (m) => console.log(`  ok    ${m}`);

// The rule exactly as it read before this change, restored for --prove.
const BROKEN_CHROME = WS_CHROME_CSS.replace(
  `@media screen {\n  body { background: ${WS.page} !important; }\n}`,
  `body:has(.ws-page) { background: ${WS.page}; }`
);

const rgb = (hex) => {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const CREAM = rgb(WS.page);   // #E8E0CF, the chrome ground
const THEME_DARK = '#0C1120'; // --ec-bg, dark. The blue-black in the gutter.
const WHITE = 'rgb(255, 255, 255)';

// The three routes, by the DOM each actually renders. The index and the builder
// mount WS_CHROME_CSS alone; the worksheet page mounts PRINT_CSS beside it and
// nests the whole thing inside the teacher shell's content column.
const ROUTES = {
  index: {
    printCss: false,
    body: `<main class="ws-page ws-chrome">__STYLES__<div class="ws-shell">index</div></main>`,
  },
  builder: {
    printCss: false,
    body: `<main class="ws-page ws-chrome">__STYLES__<div class="ws-builder"><div class="ws-builder-main">builder</div></div></main>`,
  },
  config: {
    printCss: true,
    body: `<div class="um-teacher-content"><main class="ws-page">__STYLES__<div class="ws-config"><div class="ws-config-main"><div class="ws-preview-frame"><div class="ws-sheet">paper</div></div></div><div class="ws-config-rail ws-chrome">rail</div></div></main></div>`,
  },
};

// chromeFirst mirrors the JSX statement order on the worksheet page, where
// <style>{WS_CHROME_CSS}</style> precedes <style>{PRINT_CSS}</style>. Both
// orders are measured because "which <style> the browser saw last" must not be
// load-bearing for any of this.
function doc(route, chromeCss, chromeFirst) {
  const chrome = `<style id="chrome">${chromeCss}</style>`;
  const print = route.printCss ? `<style id="print">${PRINT_CSS}</style>` : '';
  const styles = chromeFirst ? chrome + print : print + chrome;
  return `<!doctype html><html><head>
    <style>:root { --ec-bg: ${THEME_DARK}; }</style>
    <style>body { margin: 0; }</style>
  </head>
  <body class="min-h-dvh" style="background: var(--ec-bg); color: var(--ec-ink)">
    ${route.body.replace('__STYLES__', styles)}
  </body></html>`;
}

// The canvas takes body's background when html declares none, so body's
// computed value IS the overscroll gutter.
const bodyBg = async (page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

const browser = await chromium.launch();
const page = await browser.newPage();

const chromeCss = PROVE ? BROKEN_CHROME : WS_CHROME_CSS;
console.log(PROVE ? 'PROVE: running against the PRE-FIX rule (body:has)\n' : 'Running against the shipped rule\n');

if (PROVE && BROKEN_CHROME === WS_CHROME_CSS) {
  console.log('PROVE: the pre-fix rule did not substitute in. This harness is hollow.');
  await browser.close();
  process.exit(1);
}

// ── 1. the ground is the chrome ground, on all three routes, both orders ───
for (const [name, route] of Object.entries(ROUTES)) {
  for (const chromeFirst of [true, false]) {
    await page.setContent(doc(route, chromeCss, chromeFirst), { waitUntil: 'load' });
    await page.emulateMedia({ media: 'screen' });
    const got = await bodyBg(page);
    const order = chromeFirst ? 'chrome first' : 'chrome last ';
    if (got === CREAM) pass(`${name.padEnd(7)} ${order}  body ground is ${WS.page}`);
    else fail(`${name.padEnd(7)} ${order}  body ground is ${got}, wanted ${CREAM} (${WS.page})`);
  }
}

// ── 2. and it does not depend on which stylesheet came last ────────────────
for (const [name, route] of Object.entries(ROUTES)) {
  await page.setContent(doc(route, chromeCss, true), { waitUntil: 'load' });
  await page.emulateMedia({ media: 'screen' });
  const first = await bodyBg(page);
  await page.setContent(doc(route, chromeCss, false), { waitUntil: 'load' });
  await page.emulateMedia({ media: 'screen' });
  const last = await bodyBg(page);
  if (first === last) pass(`${name.padEnd(7)} ground is order independent (${first})`);
  else fail(`${name.padEnd(7)} ground depends on <style> order: ${first} vs ${last}`);
}

// ── 3. the chrome ground never reaches paper ───────────────────────────────
// The guardrail is that a stray Ctrl+P drops the chrome. A cream ground IS
// chrome. @media screen deletes the rule under print, so on the config route
// PRINT_CSS's `html, body { background: #FFF !important }` runs unopposed --
// two important declarations on one property at equal specificity would
// otherwise be settled by document order, the coin toss .ws-chrome exists to
// avoid.
for (const [name, route] of Object.entries(ROUTES)) {
  for (const chromeFirst of [true, false]) {
    await page.setContent(doc(route, chromeCss, chromeFirst), { waitUntil: 'load' });
    await page.emulateMedia({ media: 'print' });
    const got = await bodyBg(page);
    const order = chromeFirst ? 'chrome first' : 'chrome last ';
    if (got !== CREAM) pass(`${name.padEnd(7)} ${order}  print ground is not the chrome ground (${got})`);
    else fail(`${name.padEnd(7)} ${order}  print ground is the chrome ground ${CREAM}, chrome reached paper`);

    if (route.printCss) {
      if (got === WHITE) pass(`${name.padEnd(7)} ${order}  print ground is #FFFFFF, PRINT_CSS unopposed`);
      else fail(`${name.padEnd(7)} ${order}  print ground is ${got}, PRINT_CSS did not win`);
    }
  }
}
await page.emulateMedia({ media: 'screen' });

// ── 4. no Selectors Level 4 anywhere in the chrome, not just in colour rules ─
// verify_worksheet_cascade.mjs check 5 scans .katex and anchor lines only,
// which is exactly why body:has(.ws-page) survived it for two PRs. This one
// reads the whole stylesheet.
// Scans chromeCss, not WS_CHROME_CSS, so --prove turns this one red too on the
// :has( it restores. Pointed at the shipped string it could never fail.
const L4 = /:not\([^)]*[ >+~][^)]*\)|:has\(/;
const declarations = chromeCss.replace(/\/\*[\s\S]*?\*\//g, '');
const offenders = declarations.split('\n').filter((line) => L4.test(line));
if (offenders.length === 0) pass('no Selectors Level 4 syntax anywhere in WS_CHROME_CSS');
else fail(`Selectors L4 in the chrome, which older Safari drops: ${JSON.stringify(offenders)}`);

await browser.close();

console.log('');
if (PROVE) {
  if (failures > 0) {
    console.log(`PROVE: ${failures} assertion(s) failed against the pre-fix rule, as required.`);
    process.exit(0);
  }
  console.log('PROVE: the pre-fix rule passed every check. This harness is hollow.');
  process.exit(1);
}
console.log(failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
