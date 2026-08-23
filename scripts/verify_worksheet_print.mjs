// verify_worksheet_print.mjs -- the three printed parts, in a real browser,
// against a real build, with a real teacher session.
//
//   node scripts/seed_export_fixture.mjs
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_worksheet_print.mjs
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_worksheet_print.mjs --prove
//   node scripts/teardown_export_fixture.mjs
//
// NEXT START, NEVER NEXT DEV. The dev server serves a different CSS pipeline and
// a different font-loading path from the one a teacher gets, and this whole
// feature is about what lands on paper. The build runs here so the pages under
// test are the built ones.
//
// PRINT EMULATION IS THE POINT. Every geometric assertion runs after
// emulateMedia({ media: 'print' }), because the two-column flow, the page
// breaks and the @media print overrides only exist in that mode. Measuring the
// screen layout would pass while the printout was broken.
//
// THE WORKSHEET IS CREATED THROUGH THE REAL API and deleted in an awaited
// finally. Nothing here writes curriculum content.
//
// --prove INVERTS EVERY ASSERTION AGAINST FAULTED INPUT. Each check below is
// run twice: once on the page as rendered, and once on a page the harness has
// deliberately broken -- the disclaimer deleted, a text colour set to Sunset
// Orange, a retired hex painted in, the column count collapsed, a question
// forced across a column boundary. A check that cannot be made to fail is not
// measuring anything, so --prove requires every one of them to fail.

import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'fs';
import { spawn, execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { onTeardown, killServer } from './harness-teardown.mjs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const PORT = 5147;
const BASE = `http://localhost:${PORT}`;
const OUT = 'scratchpad/worksheet-print';
const PROVE = process.argv.includes('--prove');

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// The string is the requirement. Written out here in full rather than imported,
// so that a future edit to the component has to disagree with a second copy
// before it can ship a paraphrase.
const DISCLAIMER =
  'Not affiliated with or endorsed by College Board or ACCUPLACER. TSIA2 is a trademark of its respective owner. Practice materials only.';

// Retired, plus every value the mockup invented. Neither set may reach paper.
const RETIRED = ['#C68A2F', '#C07F22', '#E89B3C', '#12253F', '#0F69BA', '#B08328', '#8A6A16', '#0F1E35', '#2C6248'];
const MOCKUP = ['#20242a', '#6bbde6', '#3f88ad', '#2f7fa8', '#8a9199', '#9aa2aa', '#b6bdc4', '#d4dbe0', '#e6ebef'];
const ORANGE_RGB = 'rgb(240, 163, 62)';

let failures = 0;
const failed = [];

// Structural facts are NOT inverted by --prove. "the sheet rendered" failing on
// a faulted page tells nobody anything; it is the checks that are supposed to
// CATCH the fault that have to prove they can.
function fact(label, ok, detail = '') {
  if (!ok) { failures++; failed.push(label); }
  console.log(`  ${ok ? 'pass' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
}

function check(label, ok, detail = '') {
  const pass = PROVE ? !ok : ok;
  if (!pass) { failures++; failed.push(label); }
  console.log(`  ${pass ? 'pass' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
}

async function signIn(browser, email, colorScheme = 'light') {
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
    { cookies: { getAll: () => [], setAll: (list) => jar.push(...list) } }
  );
  await ssr.auth.setSession({
    access_token: verified.session.access_token,
    refresh_token: verified.session.refresh_token,
  });
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 1600 }, colorScheme });
  await ctx.addCookies(jar.map((c) => ({
    name: c.name, value: c.value, domain: 'localhost', path: '/',
    httpOnly: false, secure: false, sameSite: 'Lax',
  })));
  return ctx;
}

// ─── The faults, applied in --prove ─────────────────────────────────────────
//
// One fault per check family, applied to the live DOM, so every assertion runs
// against a page that is genuinely wrong rather than against a mocked return.
//
// THE FAULTS MUST NOT CANCEL EACH OTHER, and the first version of this did.
// Deleting every .katex span and THEN recolouring what was left meant the
// colour check ran over an empty set, and `[].every()` is true -- so a page
// with no math at all passed "all math is black". That is the exact shape of a
// check that stops checking without saying so. The maths faults are ordered
// and the colour checks now require a non-empty set.
const FAULT = `() => {
  const hexes = ${JSON.stringify([...RETIRED, ...MOCKUP])};

  // Palette, in both places the scans look: the literal strings in the sheet's
  // own markup, and one of them resolved into a computed colour.
  const sheet = document.querySelector('.ws-sheet');
  if (sheet) sheet.setAttribute('data-fault-palette', hexes.join(' '));
  document.querySelectorAll('.ws-title').forEach((t) => {
    t.textContent = 'FAULTED TITLE';
    t.style.setProperty('color', '#C68A2F', 'important');
  });

  // Orange as a text colour, which is the one thing it may never be.
  document.querySelectorAll('.ws-n').forEach((n) =>
    n.style.setProperty('color', '#F0A33E', 'important'));

  // Masthead.
  document.querySelectorAll('.ws-meta').forEach((m) => { m.textContent = 'PRACTICE'; });
  document.querySelectorAll('img.ws-mark').forEach((i) => i.setAttribute('src', '/favicon.png'));

  // Footer: the domain, the markers and the page numbers stripped, and the
  // disclaimer broken three separate ways -- paraphrased, shrunk below
  // legibility, and absent.
  document.querySelectorAll('.ws-foot-row').forEach((r) => { r.textContent = ''; });
  [...document.querySelectorAll('.ws-disclaimer')].forEach((el, i) => {
    if (i > 0) { el.remove(); return; }
    el.textContent = 'Not affiliated with College Board. Practice materials only.';
    el.style.setProperty('font-size', '5px', 'important');
    el.style.setProperty('width', '60px', 'important');
  });

  // The two-column flow collapsed, and one question dragged bodily across the
  // column boundary so the orphan check has a real straddle to find.
  const flow = document.querySelector('.ws-flow');
  if (flow) flow.style.setProperty('column-count', '1', 'important');
  // Shifted LEFT, out of the flow box entirely. A rightward shift stayed inside
  // the single wide column the line above creates, so the straddle the orphan
  // check is supposed to find never existed and the check looked blind when it
  // was the fault that was wrong.
  const stray = document.querySelector('.ws-q .ws-choice');
  if (stray) { stray.style.position = 'relative'; stray.style.left = '-400px'; }

  // Eyebrows: wrong tint, wrong ink, no name.
  document.querySelectorAll('.ws-eyebrow-chip').forEach((c) => {
    c.style.setProperty('background', '#6bbde6', 'important');
    c.style.setProperty('color', '#2f7fa8', 'important');
  });
  document.querySelectorAll('.ws-eyebrow-name').forEach((n) => n.remove());

  // Maths. Recolour FIRST, so the colour check has spans to measure, then
  // remove the question flow's spans so the "renders" check has something to
  // miss. See the note above about the order.
  document.querySelectorAll('.katex').forEach((el) =>
    el.style.setProperty('color', '#EEEEEE', 'important'));
  document.querySelectorAll('.ws-flow .katex').forEach((el) => el.replaceWith('x'));

  // Key grid and rationales: wrong track count, and one entry short of the
  // question count in each.
  const grid = document.querySelector('.ws-key-grid');
  if (grid) {
    grid.style.setProperty('grid-template-columns', 'repeat(3, 1fr)', 'important');
    const last = grid.querySelector('.ws-key-cell:last-child');
    if (last) last.remove();
  }
  const rats = document.querySelector('.ws-rats');
  if (rats) {
    rats.style.setProperty('column-count', '1', 'important');
    const lastRat = rats.querySelector('.ws-rat:last-child');
    if (lastRat) lastRat.remove();
  }
  document.querySelectorAll('.ws-rat-text strong').forEach((s) => { s.textContent = 'Answer:'; });

  // The differentiator, deleted -- which is precisely the change this PR was
  // told not to make.
  document.querySelectorAll('.ws-notes').forEach((el) => el.remove());

  // An inline !important on the root outranks an author !important stylesheet,
  // so this genuinely defeats the Session A print override.
  document.documentElement.style.setProperty('--ec-ink', '#E8EEF8', 'important');
}`;

// Playwright evaluates a string as an EXPRESSION. A bare `() => {...}` string
// evaluates to a function object, which is not serialisable, so every probe
// comes back undefined and every check reads a property of nothing. They have
// to be invoked in the page, with their arguments inlined.
function run(page, fn, ...args) {
  return page.evaluate(`(${fn})(${args.map((a) => JSON.stringify(a)).join(', ')})`);
}

async function applyFault(page) {
  if (PROVE) await run(page, FAULT);
}

// ─── Probes, run in the page ────────────────────────────────────────────────

const READ_PARTS = `() => {
  const parts = [...document.querySelectorAll('.ws-part')];
  return parts.map((p) => ({
    cls: p.className,
    heading: (p.querySelector('.ws-title') || {}).textContent || '',
    meta: (p.querySelector('.ws-meta') || {}).textContent || '',
    mark: !!p.querySelector('img.ws-mark'),
    markSrc: (p.querySelector('img.ws-mark') || {}).getAttribute
      ? p.querySelector('img.ws-mark').getAttribute('src') : '',
    footRow: (p.querySelector('.ws-foot-row') || {}).textContent || '',
    disclaimer: (p.querySelector('.ws-disclaimer') || {}).textContent || null,
  }));
}`;

// Every element inside the sheet, with the computed values the palette rules
// care about. Read from getComputedStyle rather than from the stylesheet text,
// so a colour arriving through a variable, a cascade or an inline prop is seen.
const READ_COLORS = `() => {
  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('.ws-sheet, .ws-sheet *')) {
    const cs = getComputedStyle(el);
    const row = {
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className : '',
      color: cs.color,
      background: cs.backgroundColor,
      borderTop: cs.borderTopColor,
      borderLeft: cs.borderLeftColor,
      borderBottom: cs.borderBottomColor,
      columnRule: cs.columnRuleColor,
    };
    const k = JSON.stringify(row);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(row);
  }
  return out;
}`;

// A question is orphaned when the box it occupies straddles a column boundary:
// the stem lands at the foot of column one and the choices at the head of
// column two. Measured on the real rects under print emulation, not inferred
// from the break-inside property -- a property that is set but not honoured
// looks identical to one that works.
const READ_ORPHANS = `() => {
  const flow = document.querySelector('.ws-flow');
  if (!flow) return { cols: 0, straddling: [], total: 0 };
  const cs = getComputedStyle(flow);
  const cols = parseInt(cs.columnCount, 10) || 1;
  const box = flow.getBoundingClientRect();
  const gap = parseFloat(cs.columnGap) || 0;
  const colW = (box.width - gap * (cols - 1)) / cols;
  const bandOf = (x) => {
    for (let i = 0; i < cols; i++) {
      const left = box.left + i * (colW + gap);
      if (x >= left - 1 && x <= left + colW + 1) return i;
    }
    return -1;
  };
  const straddling = [];
  let total = 0;
  for (const q of flow.querySelectorAll('.ws-q')) {
    total++;
    const parts = [q, ...q.querySelectorAll('.ws-stem, .ws-choice')];
    const raw = parts.map((p) => bandOf(p.getBoundingClientRect().left));
    // -1 is "inside no column at all", which is the column gutter. It counts as
    // a straddle rather than being discarded: an earlier version deleted it
    // before counting, which made a choice dragged into the gutter look fine.
    const outOfBand = raw.filter((b) => b === -1).length;
    const bands = new Set(raw.filter((b) => b !== -1));
    if (bands.size > 1 || outOfBand > 0) {
      straddling.push({
        n: (q.querySelector('.ws-n') || {}).textContent || '?',
        bands: [...bands],
        outOfBand,
      });
    }
  }
  return { cols, straddling, total, colW };
}`;

const READ_GRID = `() => {
  const grid = document.querySelector('.ws-key-grid');
  if (!grid) return null;
  const cs = getComputedStyle(grid);
  const tracks = cs.gridTemplateColumns.split(' ').filter(Boolean).length;
  const lefts = [...grid.querySelectorAll('.ws-key-letter')].map(
    (el) => Math.round(el.getBoundingClientRect().left)
  );
  const nRights = [...grid.querySelectorAll('.ws-key-n')].map(
    (el) => Math.round(el.getBoundingClientRect().right)
  );
  return {
    tracks,
    cells: grid.querySelectorAll('.ws-key-cell').length,
    distinctLetterX: [...new Set(lefts)].length,
    distinctNumberRight: [...new Set(nRights)].length,
  };
}`;

const READ_DISCLAIMER_FIT = `() => {
  const el = document.querySelector('.ws-disclaimer');
  if (!el) return null;
  const cs = getComputedStyle(el);
  const size = parseFloat(cs.fontSize);
  const lh = parseFloat(cs.lineHeight) || size * 1.35;
  // The natural single-line width, measured by cloning the node into a
  // nowrap box: clientHeight alone cannot tell one long line from two short.
  const probe = el.cloneNode(true);
  probe.style.position = 'absolute';
  probe.style.whiteSpace = 'nowrap';
  probe.style.visibility = 'hidden';
  probe.style.width = 'auto';
  el.parentElement.appendChild(probe);
  const natural = probe.getBoundingClientRect().width;
  probe.remove();
  return {
    fontSizePx: size,
    lineHeightPx: lh,
    lines: Math.round(el.getBoundingClientRect().height / lh),
    naturalWidth: natural,
    availableWidth: el.getBoundingClientRect().width,
  };
}`;

const READ_KATEX = `() => {
  const all = [...document.querySelectorAll('.katex')];
  const colors = [...new Set(all.map((el) => getComputedStyle(el).color))];
  return {
    total: all.length,
    inFlow: document.querySelectorAll('.ws-flow .katex').length,
    inRats: document.querySelectorAll('.ws-rats .katex').length,
    colors,
  };
}`;

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return `rgb(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)})`;
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  // ─── Fixture ──────────────────────────────────────────────────────────────
  const { data: classes } = await db
    .from('classes').select('id, name, teacher_id').like('name', 'ZZ CSV Export Fixture%');
  const A1 = (classes ?? []).find((c) => c.name.endsWith('A1'));
  if (!A1) {
    console.error('Fixture not found. Run: node scripts/seed_export_fixture.mjs');
    process.exit(1);
  }
  const { data: teacher } = await db
    .from('profiles').select('id, email').eq('id', A1.teacher_id).maybeSingle();

  // Four topics, one per strand, so all four chip tints are on one sheet.
  const { data: topicRows } = await db
    .from('curriculum_topics_public')
    .select('topic_id, topic_name, related_strand')
    .eq('course_id', 'tsia2-math')
    .eq('is_placeholder', false);
  const byStrand = {};
  for (const r of topicRows ?? []) {
    if (!byStrand[r.related_strand]) byStrand[r.related_strand] = r.topic_id;
  }
  const topics = ['QR', 'AR', 'GR', 'PR'].map((s) => byStrand[s]).filter(Boolean);
  console.log(`\nTopics under test: ${topics.join(', ')}`);

  // ─── Build and start ──────────────────────────────────────────────────────
  console.log('\nBuilding.');
  execSync('npx next build', { stdio: 'inherit' });
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(2000) });
    console.error(`\nSomething is already listening on ${BASE}. That would verify a stale build.`);
    process.exit(1);
  } catch { /* nothing there, good */ }

  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'ignore', detached: true });
  onTeardown(() => killServer(server));
  const deadline = Date.now() + 120000;
  for (;;) {
    if (Date.now() > deadline) throw new Error('server did not answer within 120s');
    try { await fetch(BASE, { signal: AbortSignal.timeout(2000) }); break; }
    catch { await new Promise((r) => setTimeout(r, 500)); }
  }

  const browser = await chromium.launch();
  onTeardown(() => browser.close());
  const ctx = await signIn(browser, teacher.email);
  const page = await ctx.newPage();

  const created = [];
  try {
    // ─── Two worksheets: one titled, one left at the builder default ────────
    async function makeWorksheet(title) {
      const res = await page.request.post(`${BASE}/api/teacher/worksheets`, {
        data: { title, topics, count: 20, levels: [], include_quiz: false },
      });
      if (!res.ok()) throw new Error(`POST worksheets ${res.status()}: ${await res.text()}`);
      const body = await res.json();
      if (!body.id) throw new Error(`no worksheet id in ${JSON.stringify(body)}`);
      created.push(body.id);
      if (body.shortfall) console.log(`  note: shortfall ${body.shortfall}, delivered ${body.delivered}`);
      return body.id;
    }

    const titledId = await makeWorksheet('ZZ Print Format Check');
    // Exactly what WorksheetBuilder.tsx sends when the teacher types nothing:
    // `title.trim() || 'Practice worksheet'`. The API rejects a blank title, so
    // the default is applied client-side and this is the string that arrives.
    const defaultId = await makeWorksheet('Practice worksheet');

    // ═══ 1. The questions page ═════════════════════════════════════════════
    console.log('\n1. Questions, page 1');
    await page.goto(`${BASE}/teacher/worksheets/${titledId}/print`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.ws-flow .ws-q');
    await page.emulateMedia({ media: 'print' });
    await applyFault(page);

    const qParts = await run(page, READ_PARTS);
    fact('one printed part on the worksheet route', qParts.length === 1, `${qParts.length}`);
    check('page-1 heading is the teacher title, not a hardcoded string',
      qParts[0].heading === 'ZZ Print Format Check', qParts[0].heading);
    check('meta line reads TSIA2 · MATH · N QUESTIONS',
      /^TSIA2 · MATH · \d+ QUESTIONS?$/.test(qParts[0].meta.trim()), qParts[0].meta);
    check('wordmark is the orange-to-blue lockup, unrecoloured',
      qParts[0].markSrc === '/unpackmath-wordmark.png', qParts[0].markSrc);

    const orphans = await run(page, READ_ORPHANS);
    check('question flow is two columns', orphans.cols === 2, `column-count ${orphans.cols}`);
    check('no question straddles a column boundary',
      orphans.straddling.length === 0,
      `${orphans.straddling.length} of ${orphans.total} straddling`);

    const katexQ = await run(page, READ_KATEX);
    check('KaTeX renders in the question stems and choices',
      katexQ.inFlow > 0, `${katexQ.inFlow} spans`);
    check('all math is black on the questions page',
      katexQ.total > 0 && katexQ.colors.every((c) => c === 'rgb(0, 0, 0)'),
      `${katexQ.total} spans: ${katexQ.colors.join(' ')}`);

    const chips = await run(page, `() => [...document.querySelectorAll('.ws-eyebrow-chip')].map((el) => ({
      id: el.textContent, bg: getComputedStyle(el).backgroundColor, fg: getComputedStyle(el).color,
    }))`);
    const WANT_TINT = { QR: 'rgb(181, 212, 244)', AR: 'rgb(159, 225, 203)', GR: 'rgb(250, 199, 117)', PR: 'rgb(206, 203, 246)' };
    for (const chip of chips) {
      const strand = chip.id.split('.')[0];
      check(`${chip.id} chip carries the ${strand} strand tint`,
        chip.bg === WANT_TINT[strand], `${chip.bg} wanted ${WANT_TINT[strand]}`);
      check(`${chip.id} chip text is Deep Midnight`,
        chip.fg === 'rgb(14, 14, 17)', chip.fg);
    }
    const named = await run(page, `() => document.querySelectorAll('.ws-eyebrow-name').length`);
    check('every topic eyebrow carries a topic name', named === chips.length, `${named}/${chips.length}`);

    await page.screenshot({ path: `${OUT}/01-questions.png`, fullPage: true });

    // ═══ 2. Key, rationales, notes ═════════════════════════════════════════
    console.log('\n2. Answer key, rationales, teacher notes');
    await page.goto(`${BASE}/teacher/worksheets/${titledId}/key`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.ws-key-grid');
    await page.emulateMedia({ media: 'print' });
    await applyFault(page);

    const kParts = await run(page, READ_PARTS);
    fact('key route renders three parts', kParts.length === 3, `${kParts.length}`);
    check('page 2 heading is Answer Key', kParts[0].heading === 'Answer Key', kParts[0].heading);
    check('page 3 heading is Rationales', kParts[1].heading === 'Rationales', kParts[1].heading);
    check('page 2 footer carries the KEY marker', /KEY/.test(kParts[0].footRow), kParts[0].footRow);
    check('page 3 footer carries the RATIONALES marker', /RATIONALES/.test(kParts[1].footRow), kParts[1].footRow);
    check('page 2 footer keeps a page number', /02/.test(kParts[0].footRow), kParts[0].footRow);
    check('page 3 footer keeps a page number', /03/.test(kParts[1].footRow), kParts[1].footRow);
    kParts.forEach((p, i) => {
      check(`key route part ${i + 1} keeps unpackmath.com in the footer`,
        /unpackmath\.com/.test(p.footRow), p.footRow);
    });

    const grid = await run(page, READ_GRID);
    check('answer key grid is five columns', grid && grid.tracks === 5, `${grid && grid.tracks}`);
    check('answer key grid holds one cell per question',
      grid && grid.cells === 20, `${grid && grid.cells}`);
    check('answer key letters align on five column positions',
      grid && grid.distinctLetterX === 5, `${grid && grid.distinctLetterX} distinct x`);
    check('answer key numbers align right on five column positions',
      grid && grid.distinctNumberRight === 5, `${grid && grid.distinctNumberRight} distinct x`);

    const rats = await run(page, `() => ({
      count: document.querySelectorAll('.ws-rat').length,
      cols: parseInt(getComputedStyle(document.querySelector('.ws-rats')).columnCount, 10),
      first: (document.querySelector('.ws-rat-text') || {}).textContent || '',
      leads: [...document.querySelectorAll('.ws-rat-text strong')].map((e) => e.textContent),
    })`);
    check('one rationale per question', rats.count === 20, `${rats.count}`);
    check('rationales flow in two columns', rats.cols === 2, `column-count ${rats.cols}`);
    check('each rationale names the correct choice',
      rats.leads.length > 0 && rats.leads.every((t) => /^Choice [A-D?] is correct:$/.test(t)),
      rats.leads[0]);

    // THE DIFFERENTIATOR, and the check that it was not quietly dropped to
    // match a mockup that has no page for it.
    const notes = await run(page, `() => ({
      panels: document.querySelectorAll('.ws-notes').length,
      label: (document.querySelector('.ws-notes-label') || {}).textContent || '',
      lines: document.querySelectorAll('.ws-note').length,
      rule: document.querySelector('.ws-notes')
        ? getComputedStyle(document.querySelector('.ws-notes')).borderLeftColor : '',
    })`);
    check('the misconception notes are still printed', notes.panels > 0, `${notes.panels} panels`);
    check('the notes keep their heading',
      notes.label === 'What the wrong answers mean', notes.label);
    check('the notes carry per-letter lines', notes.lines > 0, `${notes.lines} lines`);
    check('Sunset Orange is the notes marker rule, as a rule',
      notes.rule === ORANGE_RGB, notes.rule);

    const katexK = await run(page, READ_KATEX);
    check('all math is black on the key route',
      katexK.total > 0 && katexK.colors.every((c) => c === 'rgb(0, 0, 0)'),
      `${katexK.total} spans: ${katexK.colors.join(' ')}`);
    fact(`rationale KaTeX spans against live content: ${katexK.inRats}`, true,
      katexK.inRats === 0 ? 'expected zero, see the synthetic check below' : 'content now carries math');

    await page.screenshot({ path: `${OUT}/02-key-rationales-notes.png`, fullPage: true });
    // Per-part shots as well as the full page. A 8,500px tall screenshot of
    // four stacked parts is not something a reviewer can read the answer grid
    // off, and the grid alignment is one of the things being signed off.
    for (const [sel, name] of [
      ['.ws-part-key', '02a-key'],
      ['.ws-part-rationales', '02b-rationales'],
    ]) {
      const el = await page.$(sel);
      if (el) await el.screenshot({ path: `${OUT}/${name}.png` });
    }

    // ═══ 3. The disclaimer, on every part ══════════════════════════════════
    console.log('\n3. The disclaimer');
    for (const [routeName, parts] of [['worksheet', qParts], ['key route', kParts]]) {
      parts.forEach((p, i) => {
        check(`${routeName} part ${i + 1}: disclaimer present VERBATIM`,
          p.disclaimer === DISCLAIMER,
          p.disclaimer === null ? 'absent' : (p.disclaimer === DISCLAIMER ? '' : p.disclaimer));
      });
    }
    const fit = await run(page, READ_DISCLAIMER_FIT);
    check('disclaimer sets on one line', fit && fit.lines === 1, `${fit && fit.lines} lines`);
    check('disclaimer fits the content width without shrinking',
      fit && fit.naturalWidth <= fit.availableWidth,
      fit && `${Math.round(fit.naturalWidth)}px of ${Math.round(fit.availableWidth)}px`);
    check('disclaimer is at a legible size (>= 7pt)',
      fit && fit.fontSizePx >= 9.3, fit && `${fit.fontSizePx.toFixed(1)}px`);

    // ═══ 4. Palette ════════════════════════════════════════════════════════
    console.log('\n4. Palette');
    // SCOPED TO THE SHEET, and the narrowing is itself proved.
    //
    // The first version of this scan read page.content() -- the whole document
    // -- and reported #0F69BA present. It is not on the paper and never was.
    // The hit is in the RSC flight payload embedded in the page's own script
    // tags: app/theme/themes.ts declares "--ec-accent": "#0F69BA" for the whole
    // product, and the serialised module data carries that string on every
    // route. A scan that counts a colour named in a script payload as a colour
    // on the printed page will report a hit forever and can never be satisfied.
    //
    // So the haystack is the sheet's own markup plus the stylesheet that styles
    // it, identified by .ws-disclaimer because only PRINT_CSS carries it. The
    // control below is what stops that being a quiet narrowing into nothing:
    // the whole-document scan MUST still find the token, so the difference
    // between the two answers is visible rather than assumed.
    const scan = await run(page, `() => {
      const all = [...document.querySelectorAll('style')].map((s) => s.textContent);
      const picked = all.filter((t) => t.includes('.ws-disclaimer'));
      return {
        picked: picked.length,
        css: picked.join('\\n'),
        html: document.querySelector('.ws-sheet').outerHTML,
        wholeDocumentHasToken: /0f69ba/i.test(document.documentElement.outerHTML),
      };
    }`);
    fact('palette scan found exactly one worksheet stylesheet',
      scan.picked === 1 && scan.css.includes('.ws-disclaimer'),
      `${scan.picked} picked, ${scan.css.length} chars`);
    fact('control: the whole-document scan still finds the theme token',
      scan.wholeDocumentHasToken,
      'proves the scoping changed the answer rather than emptying the haystack');
    const haystack = (scan.html + scan.css).toLowerCase();
    for (const hex of RETIRED) {
      check(`retired ${hex} absent from the printed output`,
        !haystack.includes(hex.toLowerCase()), '');
    }
    for (const hex of MOCKUP) {
      check(`mockup-invented ${hex} absent from the printed output`,
        !haystack.includes(hex.toLowerCase()), '');
    }

    const colors = await run(page, READ_COLORS);
    const retiredRgb = RETIRED.map(hexToRgb);
    const orangeText = colors.filter((r) => r.color === ORANGE_RGB);
    check('Sunset Orange is never a text colour',
      orangeText.length === 0,
      orangeText.map((r) => r.cls).join(' | '));
    const retiredComputed = colors.filter((r) =>
      [r.color, r.background, r.borderTop, r.borderLeft, r.borderBottom, r.columnRule]
        .some((v) => retiredRgb.includes(v)));
    check('no retired value survives into a computed style',
      retiredComputed.length === 0, retiredComputed.map((r) => r.cls).join(' | '));

    // ═══ 5. Dark mode, the Session A regression ════════════════════════════
    console.log('\n5. Dark mode');
    const darkCtx = await signIn(browser, teacher.email, 'dark');
    const darkPage = await darkCtx.newPage();
    await darkPage.goto(`${BASE}/teacher/worksheets/${titledId}/print`, { waitUntil: 'networkidle' });
    await darkPage.waitForSelector('.ws-flow .katex');
    await applyFault(darkPage);

    // Screen first: the paper preview must already be black, which is what
    // .ws-sheet .katex outside a media query is for.
    const darkScreen = await run(darkPage, READ_KATEX);
    check('dark mode, on screen: math is black in the paper preview',
      darkScreen.total > 0 && darkScreen.colors.every((c) => c === 'rgb(0, 0, 0)'),
      `${darkScreen.total} spans: ${darkScreen.colors.join(' ')}`);

    await darkPage.emulateMedia({ media: 'print', colorScheme: 'dark' });
    await applyFault(darkPage);
    const darkPrint = await run(darkPage, READ_KATEX);
    check('dark mode, printing: math is black, not near-white',
      darkPrint.total > 0 && darkPrint.colors.every((c) => c === 'rgb(0, 0, 0)'),
      `${darkPrint.total} spans: ${darkPrint.colors.join(' ')}`);
    const inkVar = await run(darkPage, `() => getComputedStyle(document.documentElement).getPropertyValue('--ec-ink').trim()`
    );
    // The built CSS is minified, so globals.css's `#000000` reaches the browser
    // as `#000`. Compared as a colour, not as a string.
    const norm = (v) => v.replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i, '#$1$1$2$2$3$3').toLowerCase();
    check('dark mode, printing: --ec-ink still forced black for figure strokes',
      norm(inkVar) === '#000000', `${inkVar} -> ${norm(inkVar)}`);
    await darkPage.screenshot({ path: `${OUT}/03-dark-print.png`, fullPage: true });
    await darkCtx.close();

    // ═══ 6. The default title ══════════════════════════════════════════════
    console.log('\n6. The builder default title');
    await page.goto(`${BASE}/teacher/worksheets/${defaultId}/print`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.ws-title');
    await page.emulateMedia({ media: 'print' });
    await applyFault(page);
    const defTitle = await run(page, `() => document.querySelector('.ws-title').textContent`);
    check('an untitled worksheet prints the builder default heading',
      defTitle === 'Practice worksheet', defTitle);

    // ═══ 7. The KaTeX path on the rationale field ══════════════════════════
    //
    // Live content does not exercise this: zero of the 1,344 stored correct-
    // option lines carry a dollar sign. So the path is driven directly -- the
    // real renderInlineWithMath output for a synthetic rationale, dropped into
    // the real rationale slot on the real printed page, under the real
    // stylesheet -- and then removed.
    console.log('\n7. Rationale math, synthetic');
    await page.goto(`${BASE}/teacher/worksheets/${titledId}/key`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.ws-rat-text');
    await page.emulateMedia({ media: 'print' });

    // ASSERTED AS FACTS, NOT INVERTED BY --prove, AND PAIRED WITH A CONTROL.
    //
    // There is no fault to inject here: the input is synthetic, so --prove has
    // nothing to break that is not simply the harness lying to itself. Instead
    // the same path is driven twice, with an input that must render and an
    // input that must fail, and both answers are required. That is the
    // check_katex_render.mjs pattern and it is the honest one for a probe whose
    // input it writes itself.
    //
    // The failing control matters more than it looks. rehype-katex runs with
    // throwOnError false, so an unknown macro adds no error class and throws
    // nothing -- it renders the literal source in #cc0000 inside an ordinary
    // class="katex" span. A probe that only ever saw good input would report
    // "renders fine" for a rationale that prints red LaTeX on a teacher's page.
    const { renderInlineWithMath } = await import('../lib/curriculum-utils.ts');
    const GOOD = 'squares each input, so $f(-2) = 4$ and the range is $\\{0, 1, 4\\}$';
    const BAD = 'the set is $A \\notacommand B$';

    const inject = `(html, id) => {
      const holder = document.createElement('span');
      holder.id = id;
      holder.innerHTML = html;
      document.querySelector('.ws-rat-text').appendChild(holder);
      const spans = [...holder.querySelectorAll('.katex')];
      // EVERY descendant, not just the .katex elements. rehype-katex marks a
      // bad macro by putting style="color:#cc0000" on an inner .mord span; the
      // .katex element itself stays default. Reading only .katex is the exact
      // blindness scripts/check_katex_render.mjs was written about.
      //
      // It also answers a question this sheet raises on its own: .ws-sheet
      // .katex forces #000 !important, and an inherited !important does NOT
      // beat a declaration the descendant makes for itself, so the red has to
      // survive. This measures that rather than assuming it.
      const all = [...holder.querySelectorAll('*')];
      const r = {
        spans: spans.length,
        colors: [...new Set(all.map((el) => getComputedStyle(el).color))],
        red: all.filter((el) => getComputedStyle(el).color === 'rgb(204, 0, 0)').length,
        width: holder.getBoundingClientRect().width,
        columnWidth: document.querySelector('.ws-rats').getBoundingClientRect().width,
      };
      holder.remove();
      r.removed = document.getElementById(id) === null;
      return r;
    }`;

    const goodHtml = renderInlineWithMath(GOOD);
    fact('renderInlineWithMath emits KaTeX for a rationale carrying math',
      /class="katex/.test(goodHtml), `${goodHtml.length} chars`);

    const before = await run(page, `() => document.querySelectorAll('.ws-rats .katex').length`);
    fact('live rationales carry no math to start from', before === 0, `${before} spans`);

    // Screenshot with the good entry still in place, then the measured pass
    // re-injects and removes it.
    await run(page, `(html) => {
      const holder = document.createElement('span');
      holder.id = 'synthetic-shot';
      holder.innerHTML = html;
      document.querySelector('.ws-rat-text').appendChild(holder);
    }`, goodHtml);
    await page.screenshot({ path: `${OUT}/04-synthetic-rationale.png`, fullPage: true });
    await run(page, `() => document.getElementById('synthetic-shot').remove()`);

    const good = await run(page, inject, goodHtml, 'synthetic-good');
    fact('synthetic rationale math renders as KaTeX on the printed page',
      good.spans > 0, `${good.spans} spans`);
    fact('synthetic rationale math is black',
      good.spans > 0 && good.colors.every((c) => c === 'rgb(0, 0, 0)'), good.colors.join(' '));
    fact('synthetic rationale math is not a KaTeX parse failure',
      good.red === 0, `${good.red} red spans`);
    fact('synthetic rationale stays inside the rationale column',
      good.width <= good.columnWidth,
      `${Math.round(good.width)}px of ${Math.round(good.columnWidth)}px`);
    fact('synthetic rationale removed after the check', good.removed);

    const bad = await run(page, inject, renderInlineWithMath(BAD), 'synthetic-bad');
    fact('control: a malformed rationale macro renders red, and is detected',
      bad.spans > 0 && bad.red > 0,
      `${bad.red} red nodes across ${bad.spans} katex spans -- proves the red check is not blind, and that the sheet's black override does not hide a broken macro`);
    fact('control entry removed after the check', bad.removed);

  } finally {
    // Awaited, not handed to onTeardown: an exit handler cannot await, so an
    // async delete registered there never completes. Runs on the error path too.
    for (const id of created) {
      const { error } = await db.from('worksheets').delete().eq('id', id);
      console.log(`\n  cleanup: worksheet ${id} ${error ? `FAILED ${error.message}` : 'deleted'}`);
    }
  }

  console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}${PROVE ? '  [--prove: every inverted check had to fail on faulted input]' : ''}`);
  if (failed.length) console.log(failed.map((f) => `  - ${f}`).join('\n'));
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
