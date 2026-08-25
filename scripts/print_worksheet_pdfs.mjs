// print_worksheet_pdfs.mjs -- print one real worksheet to PDF and measure it.
//
//   npx next build            (or the selective build, see below)
//   node scripts/print_worksheet_pdfs.mjs <worksheet-id>
//
// SEPARATE FROM verify_worksheet_print.mjs on purpose. That harness builds its
// own throwaway worksheets from a seeded fixture and asserts layout geometry in
// the DOM under print emulation. This one takes an EXISTING worksheet by id and
// puts it through the browser's actual PDF writer, because the two questions
// are different: "does the flow lay out correctly" is a DOM question, and "how
// many sheets of paper is this" is only answerable by paginating for real.
//
// The page count is the thing. The key route's Teacher Notes part was one
// section that flowed, so nothing in the DOM said "fourteen pages"; it took a
// print-to-PDF to see that a twenty-question key was sixteen sheets.
//
// WHAT IT ASSERTS
//   * page count per route
//   * the disclaimer, verbatim, on every part
//   * every figure's background rect is white, read out of the decoded SVG
//     rather than eyeballed off a screenshot
//   * every dimension label still sits on its segment, by re-measuring the
//     rendered figures the same way verify_figure_labels.mjs does
//
// It signs in as the worksheet's OWNER, because a worksheet is scoped to its
// teacher by loadWorksheet's own query and there is no way to render someone
// else's. Session minting is generateLink + verifyOtp with the service-role
// key, the same pattern verify_worksheet_print.mjs uses.

import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { spawn } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { onTeardown, killServer } from './harness-teardown.mjs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const WORKSHEET = process.argv[2];
if (!WORKSHEET) {
  console.error('usage: node scripts/print_worksheet_pdfs.mjs <worksheet-id>');
  process.exit(1);
}

const PORT = 5149;
const BASE = `http://localhost:${PORT}`;
const OUT = 'scratchpad/worksheet-pdf';

const DISCLAIMER =
  'Not affiliated with or endorsed by College Board or ACCUPLACER. TSIA2 is a trademark of its respective owner. Practice materials only.';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let failures = 0;
function check(label, ok, detail = '') {
  if (!ok) failures++;
  console.log(`  ${ok ? 'pass' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
}

// Chromium writes an uncompressed page tree, so the count is readable straight
// out of the bytes. /Count on the root Pages node is authoritative; counting
// /Type /Page objects is the fallback and is checked against it.
function pdfPageCount(buf) {
  const text = buf.toString('latin1');
  const counts = [...text.matchAll(/\/Type\s*\/Pages[\s\S]{0,400}?\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
  const objects = (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
  return { declared: counts.length ? Math.max(...counts) : null, objects };
}

async function signIn(browser, email) {
  const { data: link, error: linkErr } = await db.auth.admin.generateLink({ type: 'magiclink', email });
  if (linkErr) throw new Error(`generateLink failed for ${email}: ${linkErr.message}`);
  const { data: verified, error: otpErr } = await anonClient.auth.verifyOtp({
    type: 'magiclink',
    token_hash: link.properties.hashed_token,
  });
  if (otpErr) throw new Error(`verifyOtp failed for ${email}: ${otpErr.message}`);

  const jar = [];
  const ssr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => [], setAll: (list) => jar.push(...list) } },
  );
  await ssr.auth.setSession({
    access_token: verified.session.access_token,
    refresh_token: verified.session.refresh_token,
  });
  // PAPER WIDTH, and this is load-bearing. emulateMedia({ media: 'print' })
  // applies the print stylesheet but does NOT resize the viewport, so a
  // screen-width context reports a 533px question column while page.pdf()
  // paginates at 7.2in of content, where the column is 328.5px. The first
  // version of this file measured at 1100px and its "figure fits its column"
  // check passed on figures that overflow by 11.5px on paper.
  //
  // 691px is Letter minus the @page margins: 8.5 - 0.65 - 0.65 = 7.2in at 96dpi.
  const ctx = await browser.newContext({ viewport: { width: 691, height: 1600 } });
  await ctx.addCookies(jar.map((c) => ({
    name: c.name, value: c.value, domain: 'localhost', path: '/',
    httpOnly: false, secure: false, sameSite: 'Lax',
  })));
  return ctx;
}

// The same three measurements verify_figure_labels.mjs makes, run against the
// figures as they render INSIDE the sheet rather than standalone. A label that
// survives the generator and then collides once the page scales the image is
// still a broken label.
const READ_FIGURES = `() => {
  const out = [];
  for (const img of document.querySelectorAll('.ws-stem-text img, .ws-key-stem img')) {
    const src = img.getAttribute('src') || '';
    const m = src.match(/^data:image\\/svg\\+xml;base64,(.+)$/);
    if (!m) { out.push({ error: 'not a data uri', src: src.slice(0, 40) }); continue; }
    const svg = atob(m[1]);
    const bg = svg.match(/<rect[^>]*fill="(#[0-9A-Fa-f]{6})"/);
    const box = img.getBoundingClientRect();
    out.push({
      background: bg ? bg[1] : null,
      cream: svg.includes('#F7F3E7'),
      labels: (svg.match(/<text/g) || []).length,
      dims: (svg.match(/data-dim=/g) || []).length,
      renderedWidth: box.width,
      naturalWidth: img.naturalWidth,
      // The question block, not the stem span. .ws-stem-text is display:inline,
      // and an inline box's rect spans its text runs rather than its column.
      columnWidth: (img.closest('.ws-q') || img.closest('.ws-key-q') || img.parentElement)
        .getBoundingClientRect().width,
    });
  }
  return out;
}`;

const READ_PARTS = `() => [...document.querySelectorAll('.ws-part')].map((p) => ({
  cls: p.className,
  heading: (p.querySelector('.ws-title') || {}).textContent || '',
  footRow: (p.querySelector('.ws-foot-row') || {}).textContent || '',
  disclaimer: (p.querySelector('.ws-disclaimer') || {}).textContent || '',
}))`;

async function main() {
  mkdirSync(OUT, { recursive: true });

  const { data: ws } = await db
    .from('worksheets').select('id, title, teacher_id, items').eq('id', WORKSHEET).maybeSingle();
  if (!ws) { console.error(`worksheet ${WORKSHEET} not found`); process.exit(1); }
  const { data: owner } = await db
    .from('profiles').select('email').eq('id', ws.teacher_id).maybeSingle();
  console.log(`Worksheet: ${ws.title} (${ws.items.length} items), owner ${owner.email}\n`);

  // Refuse to run against a server this script did not start. A stale
  // next-server left listening on this port serves a DIFFERENT build, which is
  // the one thing a print verification must never do quietly.
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(1500) });
    console.error(`Something is already listening on ${BASE}. That would verify a stale build.`);
    process.exit(1);
  } catch { /* nothing there, which is what we want */ }

  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'ignore', detached: true });
  onTeardown(() => killServer(server));
  // Probe the ROUTE, not the origin. A selective build serves 404 at `/`, and a
  // 404 is a live server, so probing the origin returns as soon as the socket is
  // open and before the route can answer.
  const probe = `${BASE}/teacher/worksheets/${WORKSHEET}`;
  for (let i = 0; i < 90; i++) {
    try {
      const r = await fetch(probe, { redirect: 'manual', signal: AbortSignal.timeout(2000) });
      if (r.status < 500) break;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 1000));
  }

  const browser = await chromium.launch();
  onTeardown(() => browser.close());
  const ctx = await signIn(browser, owner.email);

  // expectedPages is null where the count is reported rather than required.
  // The KEY has a required count: two parts, two pages, which is the point of
  // the change. The worksheet's length is a function of how many of its twenty
  // questions carry a figure, so it is measured and printed rather than
  // asserted against a number nobody specified.
  // REPOINTED. /print and /key are gone; both sheets live on the worksheet
  // page under tabs. The worksheet is the default tab and is server-rendered;
  // the key is fetched by a server action when its tab activates, so reaching
  // it means arriving with ?tab=key and then WAITING for the action to land.
  // That is what the .ws-key-grid wait below is for, and why the key's wait
  // cannot be the same selector as the worksheet's.
  for (const [tab, name, expectedPages, ready] of [
    ['questions', 'worksheet', null, '.ws-flow .ws-q'],
    ['key', 'key', 2, '.ws-key-grid'],
  ]) {
    const suffix = tab === 'key' ? '?tab=key' : '';
    console.log(`\n${name} (/teacher/worksheets/${WORKSHEET}${suffix})`);
    // A FRESH TAB PER ROUTE, closed at the end of the loop. A four-page sheet
    // plus its PDF is the largest thing this script holds, and keeping the
    // worksheet's render alive while the key renders crashed the tab on a
    // memory-constrained machine. Nothing here needs state to survive a route.
    const page = await ctx.newPage();
    // 'load' plus an explicit selector, not 'networkidle'. The key route holds
    // its connection open long enough that networkidle never fires here, and a
    // wait that never returns looks exactly like a page that never rendered.
    // Retried, because `next start` under memory pressure closes a connection
    // mid-response often enough to abort a first navigation, and a flaky
    // transport must not read as a broken page. Three attempts, then give up
    // loudly.
    const url = `${BASE}/teacher/worksheets/${WORKSHEET}${suffix}`;
    let lastErr = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        // The sheet-specific selector, not the generic .ws-part: on the tabbed
        // page a .ws-part exists as soon as the QUESTIONS sheet renders, so
        // waiting on it would let the key's PDF be captured off the worksheet.
        await page.waitForSelector(ready, { timeout: 60000 });
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        console.log(`  ....  ${name}: navigation attempt ${attempt} failed (${err.message.split('\n')[0]})`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
    if (lastErr) throw lastErr;
    await page.emulateMedia({ media: 'print' });

    // Invoked in the page, not passed as a bare arrow. Playwright evaluates a
    // string as an EXPRESSION, so `() => ...` evaluates to a function object,
    // which is not serialisable: every probe comes back undefined and every
    // check then reads a property of nothing.
    const parts = await page.evaluate(`(${READ_PARTS})()`);
    const figures = await page.evaluate(`(${READ_FIGURES})()`);

    const pdf = await page.pdf({
      path: `${OUT}/${name}.pdf`,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.6in', bottom: '0.6in', left: '0.65in', right: '0.65in' },
    });
    const pages = pdfPageCount(pdf);

    if (expectedPages === null) {
      console.log(`  ....  ${name}: prints ${pages.declared} page(s), ${parts.length} part(s) (reported, not asserted)`);
    } else {
      check(`${name}: prints ${expectedPages} page(s)`,
        pages.declared === expectedPages, `declared ${pages.declared}, page objects ${pages.objects}`);
      check(`${name}: renders ${expectedPages} part(s)`,
        parts.length === expectedPages, parts.map((p) => p.heading).join(' | '));
    }
    check(`${name}: page tree agrees with the object count`,
      pages.declared === pages.objects, `${pages.declared} vs ${pages.objects}`);

    parts.forEach((p, i) => {
      check(`${name}: part ${i + 1} disclaimer verbatim`, p.disclaimer === DISCLAIMER, p.disclaimer.slice(0, 60));
      check(`${name}: part ${i + 1} footer keeps unpackmath.com`, /unpackmath\.com/.test(p.footRow), p.footRow);
      check(`${name}: part ${i + 1} footer keeps a page number`, /\d\d/.test(p.footRow), p.footRow);
    });

    check(`${name}: no Teacher Notes part`,
      !parts.some((p) => p.cls.includes('ws-part-notes')), parts.map((p) => p.cls).join(' | '));

    console.log(`  ${figures.length} figure(s) on this route`);
    figures.forEach((f, i) => {
      check(`${name}: figure ${i + 1} background is white`, f.background === '#FFFFFF', `${f.background}`);
      check(`${name}: figure ${i + 1} carries no cream anywhere`, f.cream === false, f.cream ? 'found #F7F3E7' : '');
      check(`${name}: figure ${i + 1} fits its column`,
        f.renderedWidth <= f.columnWidth + 0.5,
        `${f.renderedWidth.toFixed(1)}px in ${f.columnWidth.toFixed(1)}px (natural ${f.naturalWidth})`);
    });

    // Best effort, and deliberately not fatal. The PDF is the artifact under
    // test; the PNG is a convenience for review, and a full-page capture of a
    // four-page sheet is the single largest allocation this script makes. On a
    // machine already short of memory it can crash the tab, and losing a
    // convenience must not lose the run that produced the PDF.
    try {
      await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    } catch (err) {
      console.log(`  ....  ${name}: screenshot skipped (${err.message.split('\n')[0]})`);
    }
    await page.close();
  }

  console.log(`\nPDFs and screenshots in ${OUT}/`);
  console.log(`${failures} failure(s)`);
  process.exitCode = failures ? 1 : 0;
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
