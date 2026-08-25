// verify_teacher_shell.mjs -- the two guardrails on the sidebar extraction.
//
//   node scripts/verify_teacher_shell.mjs --base http://localhost:5140 --capture before
//   node scripts/verify_teacher_shell.mjs --base http://localhost:5140 --capture after
//   node scripts/verify_teacher_shell.mjs --base http://localhost:5140 --compare
//   node scripts/verify_teacher_shell.mjs --base http://localhost:5140 --worksheets
//   node scripts/verify_teacher_shell.mjs --base http://localhost:5140 --worksheets --prove
//
// ─── GUARDRAIL A: the dashboard is unchanged ────────────────────────────────
//
// --capture walks /teacher through the five states the rail actually has --
// desktop, desktop collapsed, the account menu open, compact, and the compact
// slide-over -- and writes the rendered body of each to disk. Run it once on
// main and once on the branch; --compare diffs the two sets.
//
// It compares RENDERED HTML, not source. The extraction moved 372 lines between
// files and rewired where two callbacks come from, and none of that is visible
// in a diff of what the browser was actually handed. What IS visible there is
// any node that moved, any attribute that stopped being emitted, and any style
// value that changed on the way through.
//
// The five states are not decoration. Three of the seven edits to the moved
// code only show up in one of them: the two data-tour keys need the rail on
// screen, "Take a Tour" needs the account menu open, and the slide-over needs a
// viewport under 1024 AND a click.
//
// ─── GUARDRAIL B: the chrome still does not print ───────────────────────────
//
// --worksheets asserts, under emulateMedia({ media: 'print' }), that every piece
// of shell chrome computes to display:none on all three worksheet routes, and
// that the sheet's own container does not.
//
// --prove INVERTS it. It injects a style block that defeats the no-print rule
// and then requires the check to FAIL. A check that cannot be made to fail is
// not evidence, and this one has a specific way of being hollow: the fault has
// to go in <body>, not <head>. The chrome's own rule is emitted from a <style>
// inside the body, so a fault injected into the head loses on document order
// and the check passes for a reason that has nothing to do with the product.
//
// ─── WHAT THIS DOES NOT DO ──────────────────────────────────────────────────
//
// It writes nothing, anywhere. Every route it visits is a read, and the session
// comes from .auth/e2e-storage-state.json, which scripts/capture_auth_state.mjs
// mints. Unlike verify_worksheet_print.mjs it seeds no rows and needs no
// teardown, so it does not carry that script's reason for being parked.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';

const args = process.argv.slice(2);
const arg = (n, d = null) => { const i = args.indexOf(n); return i === -1 ? d : args[i + 1]; };
const has = (n) => args.includes(n);

const BASE = arg('--base', 'http://localhost:5140');
const STATE = '.auth/e2e-storage-state.json';
const DIR = arg('--dir', '.shell-snapshots');
const PROVE = has('--prove');

if (!existsSync(STATE)) {
  console.error(`No session at ${STATE}. Run:\n  node scripts/capture_auth_state.mjs --base ${BASE}`);
  process.exit(2);
}

const WORKSHEET_ROUTES = ['/teacher/worksheets', '/teacher/worksheets/new'];

let failures = 0;
const fail = (m) => { failures++; console.log(`  FAIL  ${m}`); };
const pass = (m) => console.log(`  ok    ${m}`);

// Three things are normalised out, and it is worth being exact about what they
// are, because a normaliser is how a comparison quietly stops proving anything.
//
//   1. React's hydration marker comments.
//   2. The Next build id. It is regenerated on every build from nothing to do
//      with the source, so leaving it in would make any two builds differ.
//   3. The bundler's chunk manifest -- the <script src> preloads and the chunk
//      list attached to the dashboard's client module reference.
//
// (3) is the one that matters, so: this change necessarily alters it. Splitting
// one client file into two puts a new module in the client graph, and the
// dashboard's chunk list went from 7 entries to 8. That is a fact about
// webpack's output, not about what the browser rendered, and no arrangement of
// this refactor could avoid it.
//
// WHAT IS STILL COMPARED, which is the part that carries the guarantee: the
// entire rendered DOM, every attribute and every inline style value, AND the
// rest of the RSC flight payload -- including every prop serialised into the
// dashboard's client component. If a node moved, an attribute stopped being
// emitted, a style value changed or a prop changed, it is still in the diff.
function normalise(html) {
  const buildId = html.match(/\\"b\\":\\"([A-Za-z0-9_-]+)\\"/);
  let out = html
    .replace(/<!--\$-->|<!--\/\$-->|<!--\$\?-->|<!--\$!-->/g, '')
    .replace(/\s+data-reactroot=""/g, '')
    .replace(/<script src="\/_next\/static\/chunks\/[^"]+"[^>]*><\/script>/g, '')
    .replace(/\[\\"\$\\",\\"script\\",\\"script-\d+\\",\{\\"src\\":\\"\/_next\/static\/chunks\/[^"]+?\\",\\"async\\":true,\\"nonce\\":\\"\$undefined\\"\}\],?/g, '')
    .replace(/\\"\/_next\/static\/chunks\/[^"]+?\\"/g, 'CHUNK')
    .replace(/(CHUNK,)+CHUNK/g, 'CHUNKS');
  if (buildId) out = out.split(buildId[1]).join('BUILDID');
  return out.trim();
}

async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  // The roster fetch is what flips `loading` off, and several sections are
  // unrendered until it lands. Snapshotting before it does would compare two
  // different loading states rather than two builds.
  await page.waitForTimeout(1200);
}

async function capture(label) {
  mkdirSync(`${DIR}/${label}`, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ storageState: STATE, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const write = (n, h) => writeFileSync(`${DIR}/${label}/${n}.html`, h);

  await page.goto(`${BASE}/teacher`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  write('desktop', await page.locator('body').innerHTML());

  // Collapsed rail. The width transition is 220ms.
  await page.click('button[aria-label="Collapse sidebar"]');
  await page.waitForTimeout(500);
  write('desktop-collapsed', await page.locator('body').innerHTML());
  await page.click('button[aria-label="Expand sidebar"]');
  await page.waitForTimeout(500);

  // The account menu, which is where "Take a Tour" and Help live.
  await page.click('button[aria-label="Profile"]');
  await page.waitForTimeout(200);
  write('account-menu', await page.locator('[role="menu"]').innerHTML());
  await page.keyboard.press('Escape').catch(() => {});

  // Compact: the rail leaves the DOM and the hamburger appears in TopBar.
  await page.setViewportSize({ width: 900, height: 900 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await settle(page);
  write('compact', await page.locator('body').innerHTML());

  await page.click('button[aria-label="Open menu"]');
  await page.waitForTimeout(400);
  write('compact-slideover', await page.locator('body').innerHTML());

  await browser.close();
  console.log(`captured ${label} -> ${DIR}/${label}/`);
}

function compare() {
  const names = ['desktop', 'desktop-collapsed', 'account-menu', 'compact', 'compact-slideover'];
  console.log('\nGUARDRAIL A  /teacher rendered body, before vs after');
  for (const n of names) {
    const a = `${DIR}/before/${n}.html`;
    const b = `${DIR}/after/${n}.html`;
    if (!existsSync(a) || !existsSync(b)) { fail(`${n}: missing capture`); continue; }
    // Normalised on READ, not on write, so the captures on disk stay raw and a
    // change to what is normalised can be re-run against captures already taken
    // rather than needing both builds stood up again.
    const x = normalise(readFileSync(a, 'utf-8'));
    const y = normalise(readFileSync(b, 'utf-8'));
    if (x === y) pass(`${n}: identical (${x.length} chars)`);
    else {
      let i = 0;
      while (i < x.length && i < y.length && x[i] === y[i]) i++;
      fail(`${n}: differs at char ${i}`);
      console.log(`        before: ...${x.slice(Math.max(0, i - 80), i + 80)}...`);
      console.log(`        after : ...${y.slice(Math.max(0, i - 80), i + 80)}...`);
    }
  }
}

// The fault. It goes in <body> and it carries !important, so it beats the
// chrome's own rule on both specificity and document order. If the print check
// still passes with this in place, the check is measuring nothing.
const FAULT = `
<style>
@media print { .um-teacher-chrome { display: flex !important; } }
</style>`;

async function worksheets() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ storageState: STATE, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // One worksheet id, if the account has one, so /teacher/worksheets/[id] is
  // covered too. Absent, the two static routes still carry the check.
  await page.goto(`${BASE}/teacher/worksheets`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  const href = await page.locator('a[href^="/teacher/worksheets/"]')
    .evaluateAll((els) => {
      const m = els.map((e) => e.getAttribute('href'))
        .filter((h) => /^\/teacher\/worksheets\/[0-9a-f-]{16,}$/.test(h ?? ''));
      return m[0] ?? null;
    });
  const routes = href ? [...WORKSHEET_ROUTES, href] : WORKSHEET_ROUTES;
  if (!href) console.log('  note  no worksheet row on this account; [id] route not covered');

  for (const route of routes) {
    console.log(`\n${route}`);
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // --- the rail is actually there -------------------------------------
    await page.emulateMedia({ media: 'screen' });
    const rail = page.locator('aside.um-teacher-chrome');
    if (await rail.count() === 1) pass('rail rendered');
    else fail(`rail: expected 1 aside.um-teacher-chrome, found ${await rail.count()}`);

    const active = await page.locator('aside.um-teacher-chrome nav a')
      .evaluateAll((els) => els.filter((e) => e.style.fontWeight === '600').map((e) => e.getAttribute('aria-label')));
    if (active.length === 1 && active[0].startsWith('Worksheets')) pass(`active nav item is "${active[0]}"`);
    else fail(`active nav item: expected one Worksheets, got ${JSON.stringify(active)}`);

    // --- no dangling tour hooks -----------------------------------------
    const tourAttrs = await page.locator('[data-tour], [data-tour-rail]').count();
    if (tourAttrs === 0) pass('no data-tour / data-tour-rail on the page');
    else fail(`${tourAttrs} tour hook(s) present on a route the tour does not run on`);

    const tourItem = await page.locator('button[role="menuitem"]', { hasText: 'Take a Tour' }).count();
    if (tourItem === 0) pass('no "Take a Tour" item');
    else fail('"Take a Tour" is rendered on a route with no tour steps');

    // --- guardrail B ------------------------------------------------------
    if (PROVE) await page.evaluate((f) => document.body.insertAdjacentHTML('beforeend', f), FAULT);
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(150);

    const shown = await page.locator('.um-teacher-chrome')
      .evaluateAll((els) => els.filter((e) => getComputedStyle(e).display !== 'none').length);
    if (shown === 0) pass('print: every .um-teacher-chrome element is display:none');
    else fail(`print: ${shown} chrome element(s) still displayed`);

    // The sheet side must NOT have been dropped along with the chrome.
    const pageVisible = await page.locator('.ws-page')
      .evaluateAll((els) => els.filter((e) => getComputedStyle(e).display !== 'none').length);
    if (pageVisible >= 1) pass('print: .ws-page still displayed');
    else fail('print: .ws-page was dropped too');

    await page.emulateMedia({ media: 'screen' });
  }

  await browser.close();
}

const run = async () => {
  if (arg('--capture')) return capture(arg('--capture'));
  if (has('--compare')) return compare();
  if (has('--worksheets')) return worksheets();
  console.error('Pass --capture <label>, --compare, or --worksheets.');
  process.exit(2);
};

await run();

if (PROVE) {
  console.log('');
  if (failures > 0) console.log(`PROVE: ${failures} assertion(s) failed under the injected fault, as required.`);
  else { console.log('PROVE: the fault changed nothing. The check is hollow.'); process.exit(1); }
  process.exit(0);
}
console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
