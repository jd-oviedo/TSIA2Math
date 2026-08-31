// walk_official_scores.mjs -- walk the three official-score surfaces in a real
// browser, screenshot them, and measure the contrast of every element they
// introduced.
//
//   node scripts/seed_export_fixture.mjs
//   node scripts/walk_official_scores.mjs
//   node scripts/walk_official_scores.mjs --prove
//   node scripts/teardown_export_fixture.mjs
//
// NO PROBE ROUTE. verify_dashboard_contrast.mjs needs one because /dashboard is
// behind Google OAuth, which cannot be automated. /teacher is not: the fixture
// harness can mint a real teacher session with generateLink + verifyOtp on the
// service-role key, so this walks the REAL /teacher and the REAL student detail
// page with a real session. Nothing here renders a component the product does
// not render, in a layout the product does not use, with props no route
// supplies -- which are the three ways a probe quietly stops testing the thing.
//
// LIGHT ONLY, AND THAT IS AN ASSERTION RATHER THAN AN OMISSION. Section 4 below
// proves there is no dark variant to walk: app/components/dashboard-theme.ts
// exports DASH = LIGHT without branching, and no element in the teacher tree
// carries data-theme. A walk that simply never tried dark would look identical
// to a walk that tried and missed, so the absence is checked.
//
// THE THRESHOLD IS COMPUTED, NOT WRITTEN DOWN. Every measurement reads the
// element's own font-size and weight and applies the WCAG rule -- 3.0 for large
// text (>=24px, or >=18.66px at weight 700+), 4.5 for everything else. Writing
// "expect 4.5" beside each element is how a 12px label ends up silently held to
// a large-text bar after a restyle.
//
// --prove INVERTS EVERY EXPECTATION. A contrast harness that cannot be made to
// fail measures nothing, so the run can be asked to require failure and must
// then report failures across the board.

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

const PORT = 5141;
const BASE = `http://localhost:${PORT}`;
const OUT = 'scratchpad/official-scores-walk';
const PROVE = process.argv.includes('--prove');

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let failures = 0;
const failed = [];
function check(label, ok, detail = '') {
  if (!ok) { failures++; failed.push(label); }
  console.log(`  ${ok ? 'pass' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
}

// Contrast expectations honour --prove; plain structural checks do NOT.
// Inverting "the roster rendered" would mean a --prove run passes only when the
// page is broken, which tells nobody anything.
function expectContrast(label, ratio, required) {
  const ok = ratio >= required;
  const pass = PROVE ? !ok : ok;
  if (!pass) { failures++; failed.push(label); }
  console.log(`  ${pass ? 'pass' : 'FAIL'}  ${label}  ${ratio}:1 (needs ${required})`);
}

// Read from RENDERED PIXELS. The effective ground is found by walking up past
// transparent parents, and text alpha is composited over whatever it lands on.
// Same maths as verify_dashboard_contrast.mjs so the two cannot disagree.
// Built as an IIFE string at the call site, exactly as
// verify_dashboard_contrast.mjs does it. page.evaluate() given a bare function
// STRING evaluates it as an expression and hands back undefined -- it does not
// call it with the second argument, which is the trap this comment exists for.
const MEASURE = `(args) => {
  const { sel, text } = args;
  const nodes = [...document.querySelectorAll(sel)];
  const el = text === null
    ? nodes[0]
    : nodes.find((n) => n.textContent.trim() === text)
      || nodes.find((n) => n.textContent.trim().startsWith(text));
  if (!el) throw new Error('no element for ' + sel + (text === null ? '' : ' :: ' + JSON.stringify(text)));

  const parse = (c) => c.match(/[\\d.]+/g).map(Number);
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

  let bg = [255, 255, 255];
  for (let n = el; n; n = n.parentElement) {
    const c = parse(getComputedStyle(n).backgroundColor);
    if (c.length < 4 || c[3] > 0) { bg = c.slice(0, 3); break; }
  }
  const cs = getComputedStyle(el);
  const fg = parse(cs.color);
  const a = fg.length > 3 ? fg[3] : 1;
  const over = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
  const [hi, lo] = [lum(over), lum(bg)].sort((x, y) => y - x);

  const size = parseFloat(cs.fontSize);
  const weight = parseInt(cs.fontWeight, 10) || 400;
  const large = size >= 24 || (size >= 18.66 && weight >= 700);
  return {
    ratio: Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100,
    size, weight, large,
    required: large ? 3 : 4.5,
  };
}`;

async function measure(page, label, sel, text = null) {
  const r = await page.evaluate(`(${MEASURE})(${JSON.stringify({ sel, text })})`);
  expectContrast(`${label} [${r.size}px/${r.weight}]`, r.ratio, r.required);
  return r;
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
    { cookies: { getAll: () => [], setAll: (list) => jar.push(...list) } }
  );
  await ssr.auth.setSession({
    access_token: verified.session.access_token,
    refresh_token: verified.session.refresh_token,
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1600 } });
  await ctx.addCookies(jar.map((c) => ({
    name: c.name, value: c.value, domain: 'localhost', path: '/',
    httpOnly: false, secure: false, sameSite: 'Lax',
  })));
  return ctx;
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  // ─── Fixture ───────────────────────────────────────────────────────────────
  const { data: classes } = await db
    .from('classes').select('id, name, teacher_id').like('name', 'ZZ CSV Export Fixture%');
  const A1 = (classes ?? []).find((c) => c.name.endsWith('A1'));
  if (!A1) {
    console.error('Fixture not found. Run: node scripts/seed_export_fixture.mjs');
    process.exit(1);
  }
  const { data: teacher } = await db
    .from('profiles').select('id, email').eq('id', A1.teacher_id).maybeSingle();

  const { data: enrolled } = await db
    .from('class_enrollments').select('student_id').eq('class_id', A1.id).eq('status', 'active');
  const studentIds = (enrolled ?? []).map((e) => e.student_id);
  if (studentIds.length < 3) {
    console.error(`A1 has ${studentIds.length} students; this walk needs at least 3.`);
    process.exit(1);
  }

  // TWO recorded, the rest deliberately left blank. Every state the new UI has
  // needs to be on screen at once or the walk measures whichever one happened
  // to render: a failing result WITH strand levels, a passing result with none,
  // and students with no official row at all.
  const today = new Date().toISOString().slice(0, 10);
  const seedRows = [
    {
      student_id: studentIds[0], class_id: A1.id, entered_by: A1.teacher_id,
      official_crc_score: 941, test_date: today,
      level_qr: 'Basic', level_ar: 'Proficient', level_gr: 'Basic', level_pr: 'Advanced',
      affirmed_official_report: true, entered_despite_warning: false,
    },
    {
      student_id: studentIds[1], class_id: A1.id, entered_by: A1.teacher_id,
      official_crc_score: 967, test_date: today,
      level_qr: null, level_ar: null, level_gr: null, level_pr: null,
      affirmed_official_report: true, entered_despite_warning: false,
    },
  ];
  const { data: seeded, error: seedErr } = await db
    .from('official_scores').insert(seedRows).select('id');
  if (seedErr) {
    console.error(`Could not seed official scores: ${seedErr.code} ${seedErr.message}`);
    console.error('Section 1 of sql/official_scores.sql may not have been run.');
    process.exit(1);
  }
  const seededIds = (seeded ?? []).map((r) => r.id);
  // NOT registered with onTeardown(). That helper's own header says it takes a
  // SYNCHRONOUS cleanup, because an 'exit' handler cannot await -- so an async
  // database delete handed to it never completes. Registering one there is
  // exactly what leaked four identical rows into the fixture across two crashed
  // runs before this was noticed. The rows are removed in an awaited finally
  // below, which runs on the error path too.

  // ─── Build and start ───────────────────────────────────────────────────────
  console.log('Building.');
  execSync('npx next build', { stdio: 'inherit' });
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(2000) });
    console.error(`\nSomething is already listening on ${BASE}. That would walk a stale build.`);
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

  // THE TOUR IS DISMISSED FIRST, and that is not cosmetic. TeacherTour renders a
  // dimming overlay over /teacher for any teacher whose teacher_tour_done is
  // false, which every freshly seeded fixture teacher is. The contrast numbers
  // are unaffected -- they come from getComputedStyle, not from screen pixels --
  // but the SCREENSHOTS are the other half of what a walk produces, and a walk
  // that photographs every new surface through a grey scrim is not showing what
  // a teacher sees. Restored afterwards so the fixture is left as it was found.
  const { data: tourBefore } = await db
    .from('profiles').select('teacher_tour_done').eq('id', A1.teacher_id).maybeSingle();
  const tourWasDone = tourBefore?.teacher_tour_done ?? false;
  await db.from('profiles').update({ teacher_tour_done: true }).eq('id', A1.teacher_id);

  const browser = await chromium.launch();
  onTeardown(() => browser.close());
  const ctx = await signIn(browser, teacher.email);
  const page = await ctx.newPage();

  console.log(`\nWalking ${PROVE ? '(--prove: every contrast expectation inverted)' : ''}`);

  try {

    // ─── 1. The roster column ──────────────────────────────────────────────────
    console.log('\n1. /teacher -- the official score column on the roster');
    await page.goto(`${BASE}/teacher`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#roster', { timeout: 30000 });
    await page.waitForFunction(
      () => document.body.innerText.includes('Not recorded'),
      { timeout: 30000 }
    );
    await page.screenshot({ path: `${OUT}/1-roster.png`, fullPage: true });

    const bodyText = await page.evaluate(() => document.body.innerText);
    check('a recorded official score is on the roster', bodyText.includes('941'), '');
    check('and so is the passing one', bodyText.includes('967'), '');
    check(
      'students with no official result read "Not recorded", not a blank cell',
      bodyText.includes('Not recorded'),
      ''
    );

    // Both branches of the cell, on the card ground they render on. The date line
    // is the smallest new text on any of these surfaces at 11.5px, so it is the
    // one most likely to be the failure and is measured explicitly rather than
    // being assumed to ride along with the score above it.
    await measure(page, 'roster: "Not recorded"', 'span', 'Not recorded');
    await measure(page, 'roster: the official score', '#roster div', '941');
    const officialDate = new Date(`${today}T00:00:00Z`).toLocaleDateString('en-US', {
      month: 'short', year: 'numeric', timeZone: 'UTC',
    });
    await measure(page, 'roster: the sitting date', '#roster div', officialDate);

    // ─── 2. THE CLASS STRAND GRID, REMOVED 2026-08-30 ─────────────────────────
    //
    // This section probed [data-tour="official-strand"] on /teacher: the
    // read-only per-strand level grid, its three level names, and the sentence
    // counting students who met the standard separately. That panel was deleted
    // from the dashboard, so the probes went with it rather than being left to
    // fail on an element that is not coming back.
    //
    // THE SCRIPT IS NOT RETIRED WITH IT, because the grid was one of its four
    // jobs and the other three are untouched: the roster's official score column
    // (section 1), the student detail entry panel (section 3), and the
    // light-only proof (section 4). Only the OFFICIAL SCORE AGGREGATE went; the
    // official score itself is still rendered, still entered, and still walked.
    //
    // Sections below keep their original numbers. Renumbering would silently
    // invalidate every screenshot filename and every line of this walk's
    // recorded output.

    // ─── 3. The panel, the form and the warning ────────────────────────────────
    console.log('\n3. /teacher/student/[id] -- the entry panel');
    await page.goto(
      `${BASE}/teacher/student/${studentIds[0]}?class_id=${A1.id}`,
      { waitUntil: 'networkidle' }
    );
    await page.waitForFunction(
      () => document.body.innerText.includes('Official TSIA2 result'),
      { timeout: 30000 }
    );
    await page.waitForFunction(
      () => !document.body.innerText.includes('Loading…'),
      { timeout: 30000 }
    );
    await page.screenshot({ path: `${OUT}/3-panel.png`, fullPage: true });

    const panelText = await page.evaluate(() => document.body.innerText);
    check('the panel shows the recorded score', panelText.includes('941'), '');
    check('with the scale named beside it', panelText.includes('official / 990'), '');
    check('and the strand levels read back', panelText.includes('Advanced'), '');

    await measure(page, 'panel: heading', 'h2', 'Official TSIA2 result');
    await measure(page, 'panel: report provenance', 'span', 'From the student’s College Board score report');
    await measure(page, 'panel: the scale label', 'span', 'official / 990');

    // The form. Opened by clicking the real control, never by setting state: the
    // control being reachable is half of what this section proves.
    const addBtn = await page.$('button:has-text("Record official score")')
      || await page.$('button:has-text("Add another")')
      || await page.$('button:has-text("Record another")');
    check('the entry control is on the page', Boolean(addBtn), '');
    if (addBtn) {
      await addBtn.click();
      await page.waitForFunction(
        () => /New official result|Correct this entry/.test(document.body.innerText),
        { timeout: 15000 }
      );
      await page.screenshot({ path: `${OUT}/4-form.png`, fullPage: true });

      await measure(page, 'form: a field label', 'label', null);
      // Orange as a CTA FILL with ink on it. This pairing is hardcoded (#F0A33E
      // under DASH.ink) rather than coming from the token table, so it is the one
      // most worth measuring here.
      const submit = await page.$('form button[type="submit"]');
      check('the form has a submit control', Boolean(submit), '');
      if (submit) {
        const r = await submit.evaluate((el) => {
          const parse = (c) => c.match(/[\d.]+/g).map(Number);
          const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
          const lum = ([a, b, c]) => 0.2126 * lin(a) + 0.7152 * lin(b) + 0.0722 * lin(c);
          const cs = getComputedStyle(el);
          const bg = parse(cs.backgroundColor).slice(0, 3);
          const fg = parse(cs.color).slice(0, 3);
          const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
          const size = parseFloat(cs.fontSize);
          const weight = parseInt(cs.fontWeight, 10) || 400;
          const large = size >= 24 || (size >= 18.66 && weight >= 700);
          return { ratio: Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100, size, weight, large, required: large ? 3 : 4.5 };
        });
        expectContrast(`form: primary button ink on the orange fill [${r.size}px/${r.weight}]`, r.ratio, r.required);
      }

      // The 950-plus warning: a tinted panel with ink on it, never orange words.
      // Driven through the real inputs so the real branch renders.
      const scoreInput = await page.$('form input[type="number"]')
        || await page.$('form input[name="official_crc_score"]');
      if (scoreInput) {
        await scoreInput.fill('955');
        const levelSelect = await page.$('form select');
        if (levelSelect) await levelSelect.selectOption({ label: 'Advanced' }).catch(() => {});
        await page.waitForTimeout(400);
        const warned = await page.evaluate(() =>
          /college-readiness standard/i.test(document.body.innerText));
        check('the 950-plus warning appears, and does not block', warned, '');
        if (warned) {
          await page.screenshot({ path: `${OUT}/5-warning.png`, fullPage: true });
          await measure(
            page, 'warning: ink on the tinted panel', 'p',
            'A score of 950 or above means the student met the college-readiness standard, and those reports do not carry strand diagnostic levels. Check the report before saving. You can save it either way.'
          );
        }
      }
    }

    // ─── 4. Light only, asserted rather than omitted ───────────────────────────
    console.log('\n4. Light only -- proved, not merely skipped');
    const themed = await page.evaluate(() => document.querySelectorAll('[data-theme]').length);
    check('no element in the teacher tree carries data-theme', themed === 0, `${themed} found`);

    const themeSrc = readFileSync('app/components/dashboard-theme.ts', 'utf8');
    check(
      'dashboard-theme exports DASH = LIGHT without branching',
      /export const DASH\s*(:[^=]*)?=\s*LIGHT/.test(themeSrc),
      ''
    );

    // Same page under a dark preference must be UNCHANGED. This is what separates
    // "light only" from "dark was never tried": if a stylesheet ever grows a
    // prefers-color-scheme branch under this tree, these pixels move.
    const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const darkCtx = await browser.newContext({ viewport: { width: 1440, height: 1600 }, colorScheme: 'dark' });
    const darkCookies = await ctx.cookies();
    await darkCtx.addCookies(darkCookies);
    const darkPage = await darkCtx.newPage();
    await darkPage.goto(`${BASE}/teacher/student/${studentIds[0]}?class_id=${A1.id}`, { waitUntil: 'networkidle' });
    await darkPage.waitForFunction(
      () => document.body.innerText.includes('Official TSIA2 result'), { timeout: 30000 });
    const darkBg = await darkPage.evaluate(() => getComputedStyle(document.body).backgroundColor);
    check('the page is identical under a dark colour-scheme preference', lightBg === darkBg, `${lightBg} vs ${darkBg}`);
    await darkPage.screenshot({ path: `${OUT}/6-dark-preference-unchanged.png`, fullPage: true });
    await darkCtx.close();

  } finally {
    // Awaited, and on the error path too. See the note where seededIds is built.
    if (seededIds.length > 0) {
      await db.from('official_scores').delete().in('id', seededIds);
    }
    if (!tourWasDone) {
      await db.from('profiles').update({ teacher_tour_done: false }).eq('id', A1.teacher_id);
    }
  }

  console.log(`\n${'='.repeat(58)}`);
  console.log(failures === 0 ? 'All checks passed.' : `${failures} check(s) FAILED:`);
  for (const f of failed) console.log(`  - ${f}`);
  console.log(`Screenshots in ${OUT}/`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => { console.error(err); process.exit(1); });
