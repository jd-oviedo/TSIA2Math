// verify_worksheet_quota.mjs -- the Teacher Core worksheet meter, end to end.
//
//   node scripts/seed_export_fixture.mjs
//   node scripts/verify_worksheet_quota.mjs
//   node scripts/verify_worksheet_quota.mjs --prove
//   node scripts/teardown_export_fixture.mjs
//
// IT RUNS IN TWO STATES, AND SAYS WHICH ONE IT IS IN.
//
// sql/worksheet_quota.sql is written but not run: Juan runs migrations by hand,
// so between this deploy and that moment production has the app-side meter and
// no functions for it to call. That is not a gap in the test, it is the state
// production is actually in first, and it is the one that breaks every Teacher
// Core create if the fail-open path is wrong. So:
//
//   MIGRATION ABSENT  -> assert the meter fails OPEN. Creation still works, no
//                        indicator is rendered, and the response carries no
//                        count. This is what ships on merge.
//   MIGRATION PRESENT -> assert the cap actually holds: the counter increments,
//                        the 15th is allowed, the 16th is refused with 429, the
//                        index shows the meter and the cap notice, and both
//                        create buttons are disabled.
//
// The script detects which by calling the read-only function and reading the
// error code, then asserts the matching set. After Juan runs the SQL, re-running
// this exercises the second set with no edits.
//
// ONE INVARIANT IS ASSERTED IN BOTH STATES, and it is the commercially
// dangerous one: an unlimited plan must never be metered, never show an
// indicator, and never have its counter touched.
//
// NEXT START, NEVER NEXT DEV.
//
// --prove INVERTS THE ASSERTIONS AGAINST FAULTED INPUT, and the faults here are
// mostly POSITIVE controls, which is the shape this particular harness needs.
//
// Most of what section 2 asserts in the absent state is an ABSENCE: no
// indicator, no cap notice, a live link. A probe with a wrong selector reports
// exactly that absence forever and looks like a pass. So --prove injects the
// elements the probes are looking for and requires them to be FOUND: if the
// probe can see an injected meter, its silence on the real page means
// something. The API assertions are faulted at the input instead, by sending a
// create the route must refuse.

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

const PORT = 5149;
const BASE = `http://localhost:${PORT}`;
const OUT = 'scratchpad/worksheet-quota';
const PROVE = process.argv.includes('--prove');
const CAP = 15;

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let failures = 0;
const failed = [];

function fact(label, ok, detail = '') {
  if (!ok) { failures++; failed.push(label); }
  console.log(`  ${ok ? 'pass' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
}

function check(label, ok, detail = '') {
  const pass = PROVE ? !ok : ok;
  if (!pass) { failures++; failed.push(label); }
  console.log(`  ${pass ? 'pass' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
}

// The elements the DOM probes hunt for, built to match the real markup rather
// than the selector -- copy that only satisfies the regex would prove the regex
// works and nothing else.
const FAULT = `() => {
  const meter = document.createElement('p');
  meter.textContent = '8 of 15 worksheets created this month';
  document.body.appendChild(meter);

  const notice = document.createElement('div');
  notice.setAttribute('role', 'status');
  notice.innerHTML = '<p>Teacher Core includes 15 worksheets a month, and you have created all 15 of them.</p>'
    + '<a href="/upgrade?plan=teacher-pro-annual">See Teacher Pro</a>';
  document.body.appendChild(notice);

  const cta = [...document.querySelectorAll('a')]
    .find((el) => (el.textContent || '').trim() === 'New worksheet');
  if (cta) {
    const span = document.createElement('span');
    span.textContent = 'New worksheet';
    span.setAttribute('aria-disabled', 'true');
    cta.replaceWith(span);
  }

  const btn = [...document.querySelectorAll('button')]
    .find((b) => /Build worksheet/i.test(b.textContent || ''));
  if (btn) btn.disabled = true;

  const h1 = document.querySelector('h1');
  if (h1) h1.style.setProperty('color', '#F0A33E', 'important');
}`;

async function applyFault(page) {
  if (PROVE) await page.evaluate(`(${FAULT})()`);
}

function run(page, fn, ...args) {
  return page.evaluate(`(${fn})(${args.map((a) => JSON.stringify(a)).join(', ')})`);
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
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
  await ctx.addCookies(jar.map((c) => ({
    name: c.name, value: c.value, domain: 'localhost', path: '/',
    httpOnly: false, secure: false, sameSite: 'Lax',
  })));
  return ctx;
}

// Reads what the page renders about the quota, without knowing what it should
// say. The assertions do the deciding.
const READ_INDEX = `() => {
  const meter = [...document.querySelectorAll('p')]
    .find((p) => /worksheets created this month/i.test(p.textContent || ''));
  const notice = [...document.querySelectorAll('[role="status"]')]
    .find((n) => /worksheets a month/i.test(n.textContent || ''));
  const cta = [...document.querySelectorAll('a, span')]
    .find((el) => (el.textContent || '').trim() === 'New worksheet');
  return {
    meterText: meter ? meter.textContent.replace(/\\s+/g, ' ').trim() : null,
    noticeText: notice ? notice.textContent.replace(/\\s+/g, ' ').trim() : null,
    ctaTag: cta ? cta.tagName.toLowerCase() : null,
    ctaDisabled: cta ? cta.getAttribute('aria-disabled') === 'true' : null,
    upgradeHref: notice
      ? (notice.querySelector('a[href*="upgrade"]') || {}).getAttribute
        ? notice.querySelector('a[href*="upgrade"]').getAttribute('href') : null
      : null,
    orangeText: [...document.querySelectorAll('body *')]
      .filter((el) => {
        const c = getComputedStyle(el).color;
        return c === 'rgb(240, 163, 62)' || c === 'rgb(168, 99, 31)';
      })
      .map((el) => el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className : ''))
      .slice(0, 5),
  };
}`;

// SELECTS A TOPIC FIRST, and that is not incidental. The build button is
// legitimately disabled while nothing is chosen, so reading it on a fresh page
// reports "disabled" for a page with no cap in sight. The first version of this
// probe did exactly that and called a working pre-migration build a failure.
// Choosing a topic removes the other reason the button could be off, so what is
// left is the cap.
const READ_BUILDER = `() => {
  const box = document.querySelector('input[type="checkbox"]');
  if (box && !box.checked) box.click();
  const btn = [...document.querySelectorAll('button')]
    .find((b) => /Build worksheet/i.test(b.textContent || ''));
  const meter = [...document.querySelectorAll('p')]
    .find((p) => /worksheets created this month/i.test(p.textContent || ''));
  const notice = [...document.querySelectorAll('[role="status"]')]
    .find((n) => /worksheets a month/i.test(n.textContent || ''));
  return {
    topicChosen: !!(box && box.checked),
    buttonDisabled: btn ? btn.disabled : null,
    meterText: meter ? meter.textContent.replace(/\\s+/g, ' ').trim() : null,
    noticeText: notice ? notice.textContent.replace(/\\s+/g, ' ').trim() : null,
  };
}`;

async function setPlan(userId, plan) {
  const { error } = await db.from('profiles').update({ plan }).eq('id', userId);
  if (error) throw new Error(`could not set plan=${plan}: ${error.message}`);
}

/** Does sql/worksheet_quota.sql exist on this database? */
async function migrationPresent(userId) {
  const { error } = await db.rpc('worksheet_quota_used', { p_user: userId });
  if (!error) return true;
  if (error.code === '42883' || error.code === 'PGRST202') return false;
  throw new Error(`unexpected error probing worksheet_quota_used: ${error.message} (${error.code})`);
}

async function setCounter(userId, used) {
  // First day of the current UTC month, the same anchor the functions use.
  const now = new Date();
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
  const { error } = await db
    .from('profiles')
    .update({ worksheet_period: period, worksheet_count: used })
    .eq('id', userId);
  if (error) throw new Error(`could not set counter: ${error.message}`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  const { data: classes } = await db
    .from('classes').select('id, name, teacher_id').like('name', 'ZZ CSV Export Fixture%');
  const A1 = (classes ?? []).find((c) => c.name.endsWith('A1'));
  if (!A1) {
    console.error('Fixture not found. Run: node scripts/seed_export_fixture.mjs');
    process.exit(1);
  }
  const { data: teacher } = await db
    .from('profiles').select('id, email, plan').eq('id', A1.teacher_id).maybeSingle();
  const originalPlan = teacher.plan;

  const { data: topicRows } = await db
    .from('curriculum_topics_public')
    .select('topic_id')
    .eq('course_id', 'tsia2-math')
    .eq('is_placeholder', false)
    .limit(3);
  const topics = (topicRows ?? []).map((r) => r.topic_id);

  const present = await migrationPresent(teacher.id);
  console.log(`\nMigration state: sql/worksheet_quota.sql is ${present ? 'PRESENT' : 'ABSENT'} on this database.`);
  console.log(present
    ? '  Asserting the cap holds.'
    : '  Asserting the meter fails OPEN. This is the state production is in on merge.');

  console.log('\nBuilding.');
  execSync('npx next build', { stdio: 'inherit' });
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(2000) });
    console.error(`\nSomething is already listening on ${BASE}.`);
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

  const made = [];
  try {
    async function create(page) {
      const res = await page.request.post(`${BASE}/api/teacher/worksheets`, {
        // Under --prove the topic list is emptied, which the route refuses with
        // a 400. That faults every status and count assertion below at the
        // input rather than by rewriting what they read.
        data: {
          title: 'ZZ Quota Check',
          topics: PROVE ? [] : topics,
          count: 5,
          levels: [],
          include_quiz: true,
        },
      });
      const body = await res.json().catch(() => ({}));
      if (body.id) made.push(body.id);
      return { status: res.status(), body };
    }

    // ═══ 1. Teacher Pro is never metered, in either migration state ═════════
    console.log('\n1. Teacher Pro is never metered');
    await setPlan(teacher.id, 'teacher-pro');
    let ctx = await signIn(browser, teacher.email);
    let page = await ctx.newPage();

    await page.goto(`${BASE}/teacher/worksheets`, { waitUntil: 'networkidle' });
    await applyFault(page);
    const proIndex = await run(page, READ_INDEX);
    check('Pro shows no usage indicator', proIndex.meterText === null, proIndex.meterText ?? 'absent');
    check('Pro shows no cap notice', proIndex.noticeText === null, proIndex.noticeText ? 'present' : 'absent');
    check('Pro keeps a live New worksheet link', proIndex.ctaTag === 'a', `<${proIndex.ctaTag}>`);

    const proCreate = await create(page);
    check('Pro can create', proCreate.status === 201, String(proCreate.status));
    check('Pro create reports no count', proCreate.body.used === null, String(proCreate.body.used));
    check('Pro create reports no cap', proCreate.body.cap === null, String(proCreate.body.cap));

    if (present) {
      const { data: after } = await db
        .from('profiles').select('worksheet_count, worksheet_period').eq('id', teacher.id).maybeSingle();
      check('Pro create left the counter untouched',
        (after.worksheet_count ?? 0) === 0 && after.worksheet_period === null,
        `count=${after.worksheet_count} period=${after.worksheet_period}`);
    } else {
      fact('counter columns do not exist yet, so there is nothing for Pro to touch', true);
    }
    await ctx.close();

    // ═══ 2. Teacher Core ═══════════════════════════════════════════════════
    console.log(`\n2. Teacher Core, migration ${present ? 'present' : 'absent'}`);
    await setPlan(teacher.id, 'teacher-core');
    ctx = await signIn(browser, teacher.email);
    page = await ctx.newPage();

    if (!present) {
      // THE STATE THAT SHIPS FIRST. If this is wrong, every Teacher Core create
      // 500s on deploy and the feature is dead until the migration lands.
      await page.goto(`${BASE}/teacher/worksheets`, { waitUntil: 'networkidle' });
      await applyFault(page);
      const idx = await run(page, READ_INDEX);
      check('pre-migration: no indicator is rendered', idx.meterText === null, idx.meterText ?? 'absent');
      check('pre-migration: no cap notice is rendered', idx.noticeText === null, idx.noticeText ? 'present' : 'absent');
      check('pre-migration: the create link stays live', idx.ctaTag === 'a', `<${idx.ctaTag}>`);

      const c = await create(page);
      check('pre-migration: Core can still create', c.status === 201, String(c.status));
      check('pre-migration: the create reports no count', c.body.used === null, String(c.body.used));

      await page.goto(`${BASE}/teacher/worksheets/new`, { waitUntil: 'networkidle' });
      await page.waitForSelector('button');
      // TWO CALLS, AND THE ORDER MATTERS. READ_BUILDER clicks the topic box on
      // its first run, which makes React re-render and recompute the button's
      // disabled prop -- undoing a fault applied before it. So the first call
      // just settles the selection, the fault lands on the settled page, and the
      // second call reads it. The click is idempotent: the box is already
      // checked by then, so nothing re-renders.
      await run(page, READ_BUILDER);
      await applyFault(page);
      const b = await run(page, READ_BUILDER);
      fact('a topic was selected, so the button state is about the cap', b.topicChosen);
      check('pre-migration: the build button is enabled with a topic chosen',
        b.buttonDisabled === false, String(b.buttonDisabled));
      check('pre-migration: the builder shows no cap notice',
        b.noticeText === null, b.noticeText ? 'present' : 'absent');
      await page.screenshot({ path: `${OUT}/01-pre-migration.png`, fullPage: true });

      fact('the capped states cannot be exercised until Juan runs sql/worksheet_quota.sql', true,
        're-run this script afterwards and section 2 asserts the cap instead');
    } else {
      // ─── Under the cap ───────────────────────────────────────────────────
      await setCounter(teacher.id, 8);
      await page.goto(`${BASE}/teacher/worksheets`, { waitUntil: 'networkidle' });
      await applyFault(page);
      const under = await run(page, READ_INDEX);
      check('under cap: the meter reads 8 of 15',
        under.meterText === `8 of ${CAP} worksheets created this month`, under.meterText ?? 'absent');
      check('under cap: no cap notice', under.noticeText === null, under.noticeText ? 'present' : 'absent');
      check('under cap: the create link is live', under.ctaTag === 'a', `<${under.ctaTag}>`);
      check('the meter says "created", not "used" or "saved"',
        /created this month/.test(under.meterText ?? ''), under.meterText ?? '');
      await page.screenshot({ path: `${OUT}/02-under-cap.png`, fullPage: true });

      const c9 = await create(page);
      check('under cap: create is allowed', c9.status === 201, String(c9.status));
      check('under cap: the create reports the enforced count', c9.body.used === 9, String(c9.body.used));
      const usedAfter = await db.rpc('worksheet_quota_used', { p_user: teacher.id });
      check('the read-only function agrees with the enforcing one',
        usedAfter.data === 9, String(usedAfter.data));

      // ─── The last one, then the refusal ──────────────────────────────────
      await setCounter(teacher.id, CAP - 1);
      const last = await create(page);
      check('the 15th worksheet is allowed', last.status === 201, String(last.status));
      check('the 15th lands exactly on the cap', last.body.used === CAP, String(last.body.used));

      const over = await create(page);
      check('the 16th is refused', over.status === 429, String(over.status));
      check('the refusal is flagged as a cap, not a generic error',
        over.body.capped === true, JSON.stringify(over.body.error ?? '').slice(0, 60));
      check('the refusal carries used and cap',
        over.body.used === CAP && over.body.cap === CAP,
        `used=${over.body.used} cap=${over.body.cap}`);
      const stillCap = await db.rpc('worksheet_quota_used', { p_user: teacher.id });
      check('the refused create did not increment', stillCap.data === CAP, String(stillCap.data));

      // ─── The cap-reached surfaces ────────────────────────────────────────
      await page.goto(`${BASE}/teacher/worksheets`, { waitUntil: 'networkidle' });
      await applyFault(page);
      const at = await run(page, READ_INDEX);
      check('at cap: the index shows the cap notice',
        at.noticeText !== null && /Teacher Core includes 15 worksheets a month/.test(at.noticeText),
        (at.noticeText ?? 'absent').slice(0, 70));
      check('at cap: the create link is disabled', at.ctaDisabled === true && at.ctaTag === 'span',
        `<${at.ctaTag}> aria-disabled=${at.ctaDisabled}`);
      check('at cap: the notice offers the existing upgrade route',
        at.upgradeHref === '/upgrade?plan=teacher-pro-monthly', at.upgradeHref ?? 'none');
      check('at cap: the copy is not punitive',
        !/run out|exceeded|denied|blocked|sorry/i.test(at.noticeText ?? ''), '');
      check('at cap: the copy says reprints still work',
        /print and reprint/i.test(at.noticeText ?? ''), '');
      await page.screenshot({ path: `${OUT}/03-at-cap-index.png`, fullPage: true });

      await page.goto(`${BASE}/teacher/worksheets/new`, { waitUntil: 'networkidle' });
      await page.waitForSelector('button');
      await run(page, READ_BUILDER);
      await applyFault(page);
      const bAt = await run(page, READ_BUILDER);
      fact('a topic was selected, so the button state is about the cap', bAt.topicChosen);
      check('at cap: the build button is disabled even with a topic chosen',
        bAt.buttonDisabled === true, String(bAt.buttonDisabled));
      check('at cap: the builder shows the same notice',
        bAt.noticeText !== null && /Teacher Core includes 15 worksheets a month/.test(bAt.noticeText),
        (bAt.noticeText ?? 'absent').slice(0, 70));
      await page.screenshot({ path: `${OUT}/04-at-cap-builder.png`, fullPage: true });

      // ─── A new month reads as zero, with nothing having run ──────────────
      const prev = new Date();
      prev.setUTCMonth(prev.getUTCMonth() - 1);
      const prevPeriod = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, '0')}-01`;
      await db.from('profiles')
        .update({ worksheet_period: prevPeriod, worksheet_count: CAP })
        .eq('id', teacher.id);
      const rolled = await db.rpc('worksheet_quota_used', { p_user: teacher.id });
      check('a stale period reads as zero used, with no reset job',
        rolled.data === 0, `${rolled.data} with period ${prevPeriod} and count ${CAP}`);
      const afterRoll = await create(page);
      check('the first create of a new month is allowed', afterRoll.status === 201, String(afterRoll.status));
      check('the new month starts the count at 1, not 16',
        afterRoll.body.used === 1, String(afterRoll.body.used));

      // ─── A null cap raises rather than reading as unlimited ──────────────
      const nullCap = await db.rpc('consume_worksheet_quota', { p_user: teacher.id, p_cap: null });
      check('a null cap raises instead of granting unlimited',
        nullCap.error !== null, nullCap.error ? nullCap.error.message.slice(0, 60) : 'NO ERROR');
    }

    // ═══ 3. Orange is never a text colour on either surface ═════════════════
    console.log('\n3. Palette');
    await page.goto(`${BASE}/teacher/worksheets`, { waitUntil: 'networkidle' });
    await applyFault(page);
    const palette = await run(page, READ_INDEX);
    check('no orange text on the worksheets index',
      palette.orangeText.length === 0, palette.orangeText.join(' | '));

  } finally {
    for (const id of made) {
      await db.from('worksheets').delete().eq('id', id);
    }
    if (present) {
      await db.from('profiles')
        .update({ worksheet_period: null, worksheet_count: 0 })
        .eq('id', teacher.id);
    }
    await setPlan(teacher.id, originalPlan);
    console.log(`\n  cleanup: ${made.length} worksheets deleted, plan restored to ${originalPlan}${present ? ', counter reset' : ''}`);
  }

  console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}${PROVE ? '  [--prove]' : ''}`);
  if (failed.length) console.log(failed.map((f) => `  - ${f}`).join('\n'));
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
