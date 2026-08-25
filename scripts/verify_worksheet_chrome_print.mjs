// verify_worksheet_chrome_print.mjs -- what survives a Ctrl+P on the worksheet
// page, and what shape the sheet is left in when it does.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_worksheet_chrome_print.mjs
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_worksheet_chrome_print.mjs --prove
//
// ─── WHY A STATIC PAGE ──────────────────────────────────────────────────────
//
// This asserts things that are pure functions of three real stylesheets and one
// DOM shape, so it needs no database, no session and no server. That matters
// twice over: it runs anywhere, and it isolates the CSS question from every
// other reason a real page might look wrong.
//
// It is NOT a substitute for verify_worksheet_print.mjs, which measures real
// resolved content on a real build and is the thing that settles guardrail A.
// This settles the part of guardrail C that does not depend on content.
//
// ─── THE ONE THAT WOULD HAVE SHIPPED SILENTLY ───────────────────────────────
//
// .ws-config is `display: grid; grid-template-columns: 302px minmax(0, 1fr)`.
// Under print the rail is display:none -- but a display:none ITEM does not
// remove its TRACK. Column one keeps its 302px, and the sheet prints shifted
// right and 302px narrower, on every page, forever. Nothing about that looks
// like a bug on screen. The width assertion below is the one that catches it.
//
// ─── --prove, AND THE DOCUMENT-ORDER TRAP ───────────────────────────────────
//
// The fault is injected into <body>, not <head>, and that is not a detail. The
// chrome's own print rules are emitted from a <style> INSIDE the body, so a
// fault placed in the head loses on document order, the check passes, and the
// pass says nothing at all. Injecting into the body means the fault genuinely
// beats the rule it is meant to defeat.

import { chromium } from 'playwright';
import { WS_CHROME_CSS } from '../app/teacher/worksheets/worksheet-theme.ts';
import { PRINT_CSS } from '../app/teacher/worksheets/print-styles.ts';
import { SHELL_CHROME_CSS } from '../app/teacher/teacher-shell-css.ts';

const PROVE = process.argv.includes('--prove');

let failures = 0;
const fail = (m) => { failures++; console.log(`  FAIL  ${m}`); };
const pass = (m) => console.log(`  ok    ${m}`);

// Defeats every rule this harness checks, and sits in the body so it wins on
// document order as well as on !important.
const FAULT = `<style>
@media print {
  .um-teacher-chrome { display: flex !important; }
  .ws-page .no-print { display: block !important; }
  .ws-config { display: grid !important; }
}
</style>`;

const VIEWPORT = { width: 1280, height: 900 };

// The worksheet page's real nesting, chrome and all.
const BODY = `
<div class="um-teacher-shell" style="display:flex;min-height:100vh">
  <aside class="um-teacher-chrome" id="rail" style="width:200px;flex:0 0 200px">rail</aside>
  <div class="um-teacher-content" style="flex:1;min-width:0;display:flex;flex-direction:column">
    <div class="um-teacher-chrome" id="menubar">menu</div>
    <main class="ws-page">
      <div class="ws-config">
        <div class="ws-config-rail no-print" id="configrail">this worksheet</div>
        <div class="ws-config-main">
          <div class="ws-config-bar no-print" id="tabbar">tabs</div>
          <div class="ws-preview-frame">
            <div class="ws-sheet" id="sheet"><div class="ws-part">paper</div></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>`;

const html = `<!doctype html><html><head></head><body>
<style>${SHELL_CHROME_CSS}</style>
${BODY.replace('<main class="ws-page">', '<main class="ws-page"><style>' + WS_CHROME_CSS + '</style><style>' + PRINT_CSS + '</style>')}
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });
await page.setContent(html, { waitUntil: 'domcontentloaded' });

if (PROVE) await page.evaluate((f) => document.body.insertAdjacentHTML('beforeend', f), FAULT);

await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(120);

const seen = await page.evaluate(() => {
  const d = (id) => getComputedStyle(document.getElementById(id)).display;
  const sheet = document.getElementById('sheet');
  const r = sheet.getBoundingClientRect();
  const chain = [];
  for (let el = sheet.parentElement; el && el !== document.body; el = el.parentElement) {
    chain.push({ cls: el.className || el.tagName, display: getComputedStyle(el).display });
  }
  return {
    rail: d('rail'), menubar: d('menubar'), configrail: d('configrail'), tabbar: d('tabbar'),
    sheetLeft: Math.round(r.left), sheetWidth: Math.round(r.width),
    // The body's own content edge, not zero. This static page carries no
    // globals.css reset, so the browser's default 8px body margin is present
    // here and is an artefact of the harness rather than anything the product
    // does. Comparing against the body box measures what is actually being
    // asked -- whether a chrome TRACK survives -- without that artefact.
    bodyLeft: Math.round(document.body.getBoundingClientRect().left),
    bodyWidth: Math.round(document.body.getBoundingClientRect().width),
    chain,
  };
});

console.log(JSON.stringify(seen, null, 2), '\n');

// ── 1. every piece of chrome is gone ───────────────────────────────────────
for (const [name, value] of [['shell rail', seen.rail], ['compact menu bar', seen.menubar], ['config rail', seen.configrail], ['tab bar', seen.tabbar]]) {
  if (value === 'none') pass(`print: ${name} is display:none`);
  else fail(`print: ${name} is "${value}", not none`);
}

// ── 2. nothing between body and the sheet is still flex or grid ────────────
// Fragmentation inside a flex or grid container is not reliably supported, and
// the answer key needs .ws-part + .ws-part { break-before: page } to land three
// parts on three sheets.
const boxy = seen.chain.filter((a) => a.display === 'flex' || a.display === 'grid' || a.display === 'inline-flex');
if (boxy.length === 0) pass(`print: all ${seen.chain.length} ancestors of .ws-sheet are block-level`);
else fail(`print: ${boxy.length} ancestor(s) still flex/grid: ${JSON.stringify(boxy)}`);

// ── 3. the grid track is really gone ───────────────────────────────────────
// The rail's 302px column must not still be reserved. Measured, because a
// display:none item leaves its track behind and nothing on screen says so.
if (seen.sheetLeft === seen.bodyLeft) pass('print: the sheet starts at the body content edge, so no rail track survives');
else fail(`print: the sheet starts ${seen.sheetLeft - seen.bodyLeft}px in from the body edge, so a chrome track survives`);

if (seen.sheetWidth === seen.bodyWidth) pass(`print: the sheet is the full ${seen.sheetWidth}px content width`);
else fail(`print: the sheet is ${seen.sheetWidth}px against ${seen.bodyWidth}px available`);

await browser.close();

console.log('');
if (PROVE) {
  if (failures > 0) { console.log(`PROVE: ${failures} assertion(s) failed under the injected fault, as required.`); process.exit(0); }
  console.log('PROVE: the fault changed nothing. This harness is hollow.');
  process.exit(1);
}
console.log(failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
