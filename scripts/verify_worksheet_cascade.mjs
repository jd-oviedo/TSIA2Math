// verify_worksheet_cascade.mjs -- the two selector collisions, settled by
// measurement rather than by reading the specificity off the page.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_worksheet_cascade.mjs
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_worksheet_cascade.mjs --prove
//
// ─── WHAT IS BEING PROVED ───────────────────────────────────────────────────
//
// The real sheet now renders inside .ws-page on the worksheet page, so two
// stylesheets that never met before are on one document:
//
//   PRINT_CSS       .ws-sheet .katex { color: #000000 !important }   0,2,0
//   WS_CHROME_CSS   .ws-page  .katex { color: #0E0E11 !important }   0,2,0
//
// Identical specificity, both important, both matching the same spans. The
// winner is then whichever <style> the browser saw last, which is a property of
// JSX statement order -- and if the chrome won, printed maths would come out
// #0E0E11 instead of black, which is a guardrail A violation nobody would spot
// without a densitometer.
//
// The fix is not to raise specificity, which only moves the coin toss. It is to
// stop the selectors overlapping, so BOTH orderings produce the same paper.
// That is what this measures: the same DOM is rendered twice, once with the
// chrome stylesheet first and once with it last, and the computed colour of a
// span inside the sheet must be identical and must be black.
//
// NO DATABASE, NO SESSION, NO SERVER. The two stylesheets are plain exported
// strings, and the cascade is a pure function of them plus a DOM shape. This
// runs anywhere, which is the point: it is the half of guardrail C that does
// not need a Supabase to settle.
//
// ─── --prove ────────────────────────────────────────────────────────────────
//
// Re-runs every check against the PRE-FIX selectors, restored here verbatim,
// and requires the order-independence assertions to FAIL. A cascade check that
// passes against the version with the bug is measuring nothing.

import { chromium } from 'playwright';
import { WS_CHROME_CSS } from '../app/teacher/worksheets/worksheet-theme.ts';
import { PRINT_CSS } from '../app/teacher/worksheets/print-styles.ts';

const PROVE = process.argv.includes('--prove');

let failures = 0;
const fail = (m) => { failures++; console.log(`  FAIL  ${m}`); };
const pass = (m) => console.log(`  ok    ${m}`);

// The pre-fix rules, exactly as they read before this change. Used only by
// --prove, to show the checks below can actually go red.
const BROKEN_CHROME = WS_CHROME_CSS
  .replace('.ws-page .katex:not(.ws-sheet .katex)', '.ws-page .katex')
  .replace('.ws-page a:not(.ws-sheet a):hover', '.ws-page a:hover')
  .replace('.ws-page a:not(.ws-sheet a)', '.ws-page a');

// The nesting the worksheet page actually produces: the shell's content column,
// the page, the config grid, the preview frame, then the sheet.
const BODY = `
<div class="um-teacher-content">
  <main class="ws-page">
    <div class="ws-config">
      <div class="ws-config-main">
        <div class="ws-preview-frame">
          <div class="ws-sheet">
            <div class="ws-flow">
              <span class="katex" id="sheet-math">x</span>
              <a class="ws-link" id="sheet-link" href="#">a link on the paper</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="ws-config-rail">
      <span class="katex" id="chrome-math">x</span>
      <a id="chrome-link" href="#">a link in the chrome</a>
    </div>
  </main>
</div>`;

function doc(chromeCss, chromeFirst) {
  const a = `<style id="chrome">${chromeCss}</style>`;
  const b = `<style id="print">${PRINT_CSS}</style>`;
  // globals.css's rule is the reason both of the above exist at all, so it is
  // present here too, at the top, exactly where the real document has it.
  const globals = `<style>.katex { color: #E8EEF8 !important; }</style>`;
  return `<!doctype html><html><head>${globals}</head><body>${chromeFirst ? a + b : b + a}${BODY}</body></html>`;
}

async function colours(page, chromeCss, chromeFirst) {
  await page.setContent(doc(chromeCss, chromeFirst), { waitUntil: 'domcontentloaded' });
  return page.evaluate(() => {
    const get = (id) => getComputedStyle(document.getElementById(id)).color;
    return {
      sheetMath: get('sheet-math'),
      sheetLink: get('sheet-link'),
      chromeMath: get('chrome-math'),
      chromeLink: get('chrome-link'),
    };
  });
}

const BLACK = 'rgb(0, 0, 0)';
const SHEET_INK = 'rgb(14, 14, 17)'; // var(--ws-ink) on .ws-sheet a

const browser = await chromium.launch();
const page = await browser.newPage();

const chromeCss = PROVE ? BROKEN_CHROME : WS_CHROME_CSS;
console.log(PROVE ? 'PROVE: running against the PRE-FIX selectors\n' : 'Running against the shipped selectors\n');

const first = await colours(page, chromeCss, true);
const last = await colours(page, chromeCss, false);

console.log('chrome stylesheet FIRST:', JSON.stringify(first));
console.log('chrome stylesheet LAST :', JSON.stringify(last));
console.log('');

// ── 1. order independence, which is the actual requirement ─────────────────
if (first.sheetMath === last.sheetMath) pass(`sheet KaTeX colour is order independent (${first.sheetMath})`);
else fail(`sheet KaTeX colour depends on <style> order: ${first.sheetMath} vs ${last.sheetMath}`);

if (first.sheetLink === last.sheetLink) pass(`sheet anchor colour is order independent (${first.sheetLink})`);
else fail(`sheet anchor colour depends on <style> order: ${first.sheetLink} vs ${last.sheetLink}`);

// ── 2. and the value it settles on is the printed one ──────────────────────
if (first.sheetMath === BLACK && last.sheetMath === BLACK) pass('sheet KaTeX is #000000 in both orders');
else fail(`sheet KaTeX is not black: ${first.sheetMath} / ${last.sheetMath}`);

if (first.sheetLink === SHEET_INK && last.sheetLink === SHEET_INK) pass('sheet anchor is var(--ws-ink) in both orders');
else fail(`sheet anchor is not the sheet ink: ${first.sheetLink} / ${last.sheetLink}`);

// ── 3. the chrome keeps its own treatment, which is what the rule is for ───
// Without this the "fix" could be to delete the chrome rules, which would leave
// chrome maths near-white on cream in dark mode, the bug those rules exist for.
if (first.chromeMath !== BLACK && first.chromeMath === last.chromeMath) pass(`chrome KaTeX still takes the chrome ink (${first.chromeMath})`);
else fail(`chrome KaTeX lost its own rule: ${first.chromeMath} / ${last.chromeMath}`);

if (first.chromeLink === last.chromeLink && first.chromeLink !== SHEET_INK) pass(`chrome anchor still takes the chrome link colour (${first.chromeLink})`);
else fail(`chrome anchor lost its own rule: ${first.chromeLink} / ${last.chromeLink}`);

await browser.close();

console.log('');
if (PROVE) {
  if (failures > 0) {
    console.log(`PROVE: ${failures} assertion(s) failed against the pre-fix selectors, as required.`);
    process.exit(0);
  }
  console.log('PROVE: the pre-fix selectors passed every check. This harness is hollow.');
  process.exit(1);
}
console.log(failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
