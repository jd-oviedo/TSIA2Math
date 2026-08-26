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
// --ec-bg is a warm paper in light and a blue-black in dark. The teacher
// surface is light-only and cannot reach the theme toggle, so on a worksheet
// route that blue-black is what shows in the overscroll gutter -- html sets no
// background of its own, so body's propagates to the canvas.
//
// WS_CHROME_CSS repaints it, and the rule that does so is:
//
//   @media screen { body { background: <WS.page> !important; } }
//
// NO HEX IS WRITTEN DOWN IN THIS FILE. Every expectation is derived from
// WS.page, so the checks follow the theme rather than pinning a colour the
// theme is free to change. What is asserted is the MECHANISM, not the value.
//
// Two pieces of that rule are load-bearing and each is proved separately below:
//
//   !important     An inline declaration outranks every stylesheet rule at
//                  every specificity unless that rule is !important. Without
//                  it the body background loses to the inline prop in every
//                  browser -- which is exactly what happened for two PRs, when
//                  this was written as a non-important body:has(.ws-page) and
//                  filed as Safari-below-15.4 debt. The :has() was real; it was
//                  never the reason the rule did nothing.
//
//   @media screen  Under print the config route also injects PRINT_CSS, whose
//                  `html, body { background: #FFF !important }` is likewise
//                  !important on the same property. Two important declarations
//                  at equal specificity are settled by document order -- the
//                  coin toss .ws-chrome exists to avoid. The media wrapper
//                  deletes this rule from print entirely, so PRINT_CSS is
//                  unopposed and the chrome ground cannot reach paper.
//
// Scope comes from injection rather than from the selector: WS_CHROME_CSS is
// mounted by the three worksheet routes and by nothing else.
//
// NO DATABASE, NO SESSION, NO SERVER, same as verify_worksheet_cascade.mjs. The
// stylesheet is an exported string and the cascade is a pure function of it plus
// a DOM shape.
//
// ─── --prove ────────────────────────────────────────────────────────────────
//
// Re-runs every assertion twice, once per load-bearing piece, against a chrome
// string with that piece removed, and requires EACH run to fail something. A
// background check that still passes once the mechanism is gone is measuring
// nothing.
//
// The faults are injected into the CURRENT rule rather than restoring a shape
// the codebase no longer contains. Proving against removed history stops
// proving anything the day the history stops being reachable.

import { chromium } from 'playwright';
import { WS, WS_CHROME_CSS } from '../app/teacher/worksheets/worksheet-theme.ts';
import { PRINT_CSS } from '../app/teacher/worksheets/print-styles.ts';

const PROVE = process.argv.includes('--prove');

// The shipped rule, rebuilt from the same constant the stylesheet uses, so the
// fault injection below cannot silently miss after a value change.
const SHIPPED = `@media screen {\n  body { background: ${WS.page} !important; }\n}`;

// Each fault removes exactly one load-bearing piece and leaves the rest of the
// rule valid and parseable. A fault that produced a syntax error would fail for
// the wrong reason.
const FAULTS = [
  {
    name: 'without !important',
    why: 'the inline style prop on <body> outranks a non-important rule',
    css: `@media screen {\n  body { background: ${WS.page}; }\n}`,
  },
  {
    name: 'without @media screen',
    why: 'the chrome ground fights PRINT_CSS under print and can reach paper',
    css: `body { background: ${WS.page} !important; }`,
  },
];

const rgb = (hex) => {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const GROUND = rgb(WS.page);  // the chrome ground, whatever the theme says it is
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

async function runAll(page, chromeCss, quiet) {
  let failures = 0;
  const fail = (m) => { failures++; if (!quiet) console.log(`  FAIL  ${m}`); };
  const pass = (m) => { if (!quiet) console.log(`  ok    ${m}`); };

  // ── 1. the ground is the chrome ground, on all three routes, both orders ──
  for (const [name, route] of Object.entries(ROUTES)) {
    for (const chromeFirst of [true, false]) {
      await page.setContent(doc(route, chromeCss, chromeFirst), { waitUntil: 'load' });
      await page.emulateMedia({ media: 'screen' });
      const got = await bodyBg(page);
      const order = chromeFirst ? 'chrome first' : 'chrome last ';
      if (got === GROUND) pass(`${name.padEnd(7)} ${order}  body ground is ${WS.page}`);
      else fail(`${name.padEnd(7)} ${order}  body ground is ${got}, wanted ${GROUND} (${WS.page})`);
    }
  }

  // ── 2. and it does not depend on which stylesheet came last ──────────────
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

  // ── 3. the chrome ground never reaches paper ─────────────────────────────
  // The guardrail is that a stray Ctrl+P drops the chrome. The page ground IS
  // chrome. @media screen deletes the rule under print, so on the config route
  // PRINT_CSS's `html, body { background: #FFF !important }` runs unopposed.
  for (const [name, route] of Object.entries(ROUTES)) {
    for (const chromeFirst of [true, false]) {
      await page.setContent(doc(route, chromeCss, chromeFirst), { waitUntil: 'load' });
      await page.emulateMedia({ media: 'print' });
      const got = await bodyBg(page);
      const order = chromeFirst ? 'chrome first' : 'chrome last ';
      if (got !== GROUND) pass(`${name.padEnd(7)} ${order}  print ground is not the chrome ground (${got})`);
      else fail(`${name.padEnd(7)} ${order}  print ground is the chrome ground ${GROUND}, chrome reached paper`);

      if (route.printCss) {
        if (got === WHITE) pass(`${name.padEnd(7)} ${order}  print ground is #FFFFFF, PRINT_CSS unopposed`);
        else fail(`${name.padEnd(7)} ${order}  print ground is ${got}, PRINT_CSS did not win`);
      }
    }
  }
  await page.emulateMedia({ media: 'screen' });

  // ── 4. no Selectors Level 4 anywhere in the chrome, not just colour rules ─
  // verify_worksheet_cascade.mjs check 5 scans .katex and anchor lines only,
  // which is exactly why body:has(.ws-page) survived it for two PRs. This one
  // reads the whole stylesheet.
  const L4 = /:not\([^)]*[ >+~][^)]*\)|:has\(/;
  const declarations = chromeCss.replace(/\/\*[\s\S]*?\*\//g, '');
  const offenders = declarations.split('\n').filter((line) => L4.test(line));
  if (offenders.length === 0) pass('no Selectors Level 4 syntax anywhere in WS_CHROME_CSS');
  else fail(`Selectors L4 in the chrome, which older Safari drops: ${JSON.stringify(offenders)}`);

  return failures;
}

const browser = await chromium.launch();
const page = await browser.newPage();

if (!WS_CHROME_CSS.includes(SHIPPED)) {
  console.log('The body rule is not the shape this harness knows how to fault.');
  console.log('Expected to find:\n' + SHIPPED);
  await browser.close();
  process.exit(1);
}

if (PROVE) {
  console.log('PROVE: each load-bearing piece removed in turn, from the CURRENT rule\n');
  let hollow = 0;
  for (const fault of FAULTS) {
    const broken = WS_CHROME_CSS.replace(SHIPPED, fault.css);
    if (broken === WS_CHROME_CSS) {
      console.log(`  HOLLOW  ${fault.name}: the fault did not substitute in.`);
      hollow++;
      continue;
    }
    const failures = await runAll(page, broken, true);
    if (failures > 0) {
      console.log(`  ok      ${fault.name}: ${failures} assertion(s) failed, as required`);
      console.log(`          (${fault.why})`);
    } else {
      console.log(`  HOLLOW  ${fault.name}: every check still passed. This harness is measuring nothing.`);
      hollow++;
    }
  }
  await browser.close();
  console.log('');
  if (hollow > 0) {
    console.log(`PROVE: ${hollow} fault(s) did not turn the harness red.`);
    process.exit(1);
  }
  console.log('PROVE: every load-bearing piece is carrying weight.');
  process.exit(0);
}

console.log('Running against the shipped rule\n');
const failures = await runAll(page, WS_CHROME_CSS, false);
await browser.close();

console.log('');
console.log(failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
