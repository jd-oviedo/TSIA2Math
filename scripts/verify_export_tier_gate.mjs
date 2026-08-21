// verify_export_tier_gate.mjs -- observe the Teacher Pro gate on the CSV exports
// actually refusing a Core account, and actually admitting a Pro one.
//
//   node scripts/verify_export_tier_gate.mjs
//
// Runs against `next build && next start`, never `next dev`.
//
// WHY THIS IS SEPARATE FROM verify_csv_export.mjs
//
// That script proves the files are correct and needs a seeded fixture to do it.
// This one proves a tier boundary, and a tier boundary can only be observed
// against accounts that really hold those tiers. There is no fixture for that:
// the plans live on real profiles rows, and inventing a fake Pro account would
// test the fake rather than the boundary.
//
// WHICH ACCOUNTS, AND WHY THESE
//
//   Core (must be refused)  juandoloresoviedo@gmail.com
//   Pro  (must be admitted) anwhite@gpapps.galenaparkisd.com
//                           jsekely@gpapps.galenaparkisd.com
//
// The Core account is one of Juan's own. bsutton@gpapps is the only paying
// Teacher Core customer who could reach the export, and is deliberately NOT
// used: proving a gate is not a reason to touch a customer's account.
//
// The two Pro accounts are real teachers on founder grants, named explicitly
// by Juan for this check. Signing in as them mints an auth session via an
// admin-generated one-time token. It sends no email, changes no profile row
// and writes no data. It is still somebody else's account, so it is done here
// and nowhere else.
//
// WHAT COUNTS AS PROOF
//
// A hidden button is not a gate. Every check below hits the route by URL, the
// way anyone who reads the network tab or keeps an old bookmark would. The
// dashboard HTML is checked separately, and only as the cosmetic half.
//
// The control matters as much as the refusal: a build where every export 403s
// would pass a refusal-only suite. Pro must come back 200.
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { readFileSync } from 'fs';

const PORT = 3101;
const BASE = `http://localhost:${PORT}`;

const CORE_ACCOUNT = 'juandoloresoviedo@gmail.com';
const PRO_ACCOUNTS = ['anwhite@gpapps.galenaparkisd.com', 'jsekely@gpapps.galenaparkisd.com'];
const EXPORTS = ['roster', 'scores', 'misconceptions'];

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

let pass = 0;
let fail = 0;
const failures = [];
function check(label, ok, detail = '') {
  if (ok) { pass++; console.log(`  PASS  ${label}${detail ? `  (${detail})` : ''}`); }
  else { fail++; failures.push(label); console.log(`  FAIL  ${label}${detail ? `  (${detail})` : ''}`); }
}

async function main() {
  // ─── Confirm the accounts really hold the tiers we are about to test ──────
  const { data: profiles, error } = await db
    .from('profiles')
    .select('id, email, role, plan, plan_status')
    .in('email', [CORE_ACCOUNT, ...PRO_ACCOUNTS]);
  if (error) throw new Error(error.message);

  const byEmail = new Map((profiles ?? []).map((p) => [p.email, p]));
  console.log('Accounts under test, read live:');
  for (const e of [CORE_ACCOUNT, ...PRO_ACCOUNTS]) {
    const p = byEmail.get(e);
    console.log(`   ${e.padEnd(38)} plan=${p?.plan} status=${p?.plan_status}`);
  }
  console.log();

  // If the premise is wrong the whole run is meaningless, so it is asserted
  // rather than assumed. A Core account that silently became Pro would turn
  // this suite into a very convincing lie.
  if (byEmail.get(CORE_ACCOUNT)?.plan !== 'teacher-core') {
    throw new Error(`${CORE_ACCOUNT} is not teacher-core; this suite proves nothing`);
  }
  for (const e of PRO_ACCOUNTS) {
    if (byEmail.get(e)?.plan !== 'teacher-pro') {
      throw new Error(`${e} is not teacher-pro; this suite proves nothing`);
    }
  }

  console.log('Building.');
  execSync('npx next build', { stdio: 'inherit' });

  try {
    await fetch(BASE, { signal: AbortSignal.timeout(2000) });
    console.error(`\nSomething is already listening on ${BASE}. That would test a stale build.`);
    process.exit(1);
  } catch { /* nothing listening, good */ }

  console.log('Starting on', BASE);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  const stop = () => {
    try { process.kill(-server.pid, 'SIGKILL'); } catch { /* group gone */ }
    try { server.kill('SIGKILL'); } catch { /* child gone */ }
  };
  process.on('exit', stop);

  const deadline = Date.now() + 90000;
  for (;;) {
    if (Date.now() > deadline) { stop(); throw new Error('server did not answer within 90s'); }
    try { await fetch(BASE, { signal: AbortSignal.timeout(2000) }); break; }
    catch { await new Promise((r) => setTimeout(r, 500)); }
  }

  const browser = await chromium.launch();

  async function signIn(email) {
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
    const ctx = await browser.newContext();
    await ctx.addCookies(jar.map((c) => ({
      name: c.name, value: c.value, domain: 'localhost', path: '/',
      httpOnly: false, secure: false, sameSite: 'Lax',
    })));
    return ctx;
  }

  /**
   * Is the Export control on screen for this account?
   *
   * Loads the page in a REAL BROWSER and waits for the roster to render, rather
   * than string-matching the server HTML. The dashboard fetches its roster
   * client side and renders a Spinner until it arrives (loading = roster ===
   * null), so `data-tour="export"` is absent from EVERY server response, for
   * Core and Pro alike.
   *
   * The first version of this check read that server HTML. The Pro assertion
   * failed honestly. The Core assertion passed VACUOUSLY: it confirmed the
   * absence of something that is absent from every response, which is not
   * evidence of a gate. Waiting for #roster first is what makes an absence
   * afterwards mean something.
   */
  async function exportControlVisible(ctx, label) {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/teacher`, { waitUntil: 'domcontentloaded' });
    // The roster section only exists once the client fetch resolves. Without
    // this wait, "not found" means "not rendered yet".
    await page.waitForSelector('#roster', { timeout: 20000 });
    const count = await page.locator('[data-tour="export"]').count();
    const rosterPresent = await page.locator('#roster').count();
    await page.close();
    return { count, rosterPresent, label };
  }

  try {
    // ─── 1. Core is refused, by URL, on every export ──────────────────────
    console.log(`\n1. Core account by direct URL: ${CORE_ACCOUNT}`);
    const core = await signIn(CORE_ACCOUNT);
    for (const kind of EXPORTS) {
      const res = await core.request.get(`${BASE}/api/teacher/export/${kind}?classes=all`);
      check(`Core is refused /export/${kind}`, res.status() === 403, `HTTP ${res.status()}`);
    }
    // Also with an explicit class id, in case "all" took a different path.
    const { data: ownClasses } = await db
      .from('classes').select('id')
      .eq('teacher_id', byEmail.get(CORE_ACCOUNT).id).limit(1);
    if (ownClasses?.length) {
      const res = await core.request.get(`${BASE}/api/teacher/export/roster?classes=${ownClasses[0].id}`);
      check('Core is refused even for a class they own', res.status() === 403, `HTTP ${res.status()}`);
    }

    // ─── 2. Core still has the rest of the dashboard ──────────────────────
    // The gate had to REMOVE one thing, not lock a paying teacher out of the
    // product. If this fails the change is far worse than the bug it fixes.
    const coreDash = await core.request.get(`${BASE}/teacher`);
    check('Core can still load /teacher', coreDash.status() === 200, `HTTP ${coreDash.status()}`);
    const coreHtml = await coreDash.text();
    check('Core still gets its roster', (await core.request.get(`${BASE}/api/teacher/roster?class_id=${ownClasses?.[0]?.id ?? ''}`)).status() !== 403);
    check('Core dashboard shows the CORE badge', coreHtml.includes('CORE'), 'tier badge intact');
    check('Core dashboard is not labelled PRO', !coreHtml.includes('TEACHER · PRO'));

    const coreUi = await exportControlVisible(core, 'core');
    check('the Core roster actually rendered, so an absence below means something',
      coreUi.rosterPresent === 1, 'guards against a vacuous pass');
    check('Core dashboard hides the Export control',
      coreUi.count === 0, `found ${coreUi.count} export controls`);
    await core.close();

    // ─── 3. Pro is admitted ───────────────────────────────────────────────
    for (const email of PRO_ACCOUNTS) {
      console.log(`\n3. Pro account: ${email}`);
      const pro = await signIn(email);
      for (const kind of EXPORTS) {
        const res = await pro.request.get(`${BASE}/api/teacher/export/${kind}?classes=all`);
        check(`Pro gets ${kind}`, res.status() === 200, `HTTP ${res.status()}`);
        if (res.status() === 200) {
          const body = await res.text();
          check(`  ${kind} is a real CSV`, body.charCodeAt(0) === 0xfeff, 'BOM present');
        }
      }
      const proDash = await pro.request.get(`${BASE}/teacher`);
      const proHtml = await proDash.text();
      check('Pro dashboard shows the PRO badge', proHtml.includes('PRO'), 'tier badge intact');

      const proUi = await exportControlVisible(pro, email);
      check('the Pro roster actually rendered', proUi.rosterPresent === 1);
      check('Pro dashboard shows the Export control',
        proUi.count === 1, `found ${proUi.count} export controls`);
      await pro.close();
    }

    // ─── 4. Signed out is still refused ───────────────────────────────────
    console.log('\n4. Signed out');
    const anon = await browser.newContext();
    for (const kind of EXPORTS) {
      const res = await anon.request.get(`${BASE}/api/teacher/export/${kind}?classes=all`);
      check(`signed out is refused /export/${kind}`, res.status() === 403, `HTTP ${res.status()}`);
    }
    await anon.close();
  } finally {
    await browser.close();
    stop();
  }

  console.log(`\n${'='.repeat(56)}`);
  console.log(`PASS ${pass}   FAIL ${fail}`);
  if (fail > 0) { console.log('\nFailures:'); for (const f of failures) console.log(`  - ${f}`); }
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });
