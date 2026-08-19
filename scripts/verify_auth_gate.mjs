// verify_auth_gate.mjs -- prove every /dashboard route is closed to a signed-out
// visitor, in a real browser, against the real gate.
//
//   node scripts/verify_auth_gate.mjs           run the checks
//   node scripts/verify_auth_gate.mjs --prove   remove the gate, show the checks fail,
//                                               restore, show they pass again
//
// WHY THIS EXISTS
// ---------------
// The /dashboard tree is the one student surface with no automated coverage at
// all, because it redirects to /login without a session and the harness has no
// way to sign in. That gap is about to matter: the pages behind it are being
// redesigned, and the highest-severity regression on that surface is not a
// broken layout, it is a page rendering to someone who is not signed in.
//
// This check does not cover the rendering. It covers the gate, which is the part
// that is both untested today and cheap to test, and it needs no test account,
// no credentials and no auth configuration.
//
// ROUTES ARE DISCOVERED, NOT LISTED
// ----------------------------------
// A hardcoded list of the five routes that exist today would stay green forever
// after someone adds a sixth, which is the exact failure this check is meant to
// prevent. The route set is read off the filesystem instead, so a new page under
// app/dashboard is covered the moment it is created.
//
// That makes the discovery itself load-bearing: if the glob silently matches
// nothing, a route-by-route loop passes vacuously with zero iterations. So the
// discovered set is asserted non-empty AND asserted to contain the five routes
// known to exist, and either failing fails the suite.
//
// WHAT COUNTS AS CLOSED
// ---------------------
// Not "did not return 200". A 500 is also not 200, and a page that crashes
// before rendering is not a page that is gated -- it would pass a negative check
// while the gate itself was gone. Each route must return 307 specifically, name
// /login in Location, and actually land on the login page when followed.
//
// THE CONTROL
// -----------
// Two routes that are SUPPOSED to be open signed out are checked to be 200. A
// suite that reports everything closed would otherwise pass just as well against
// a server that was down, a build that 404s everything, or a middleware that
// redirected the entire site.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { execSync, spawn } from 'child_process';
import { onTeardown, killServer } from './harness-teardown.mjs';

const LAYOUT = 'app/dashboard/layout.tsx';
const COURSE_LAYOUT = 'app/course/layout.tsx';
const PORT = 5101;
const BASE = `http://localhost:${PORT}`;
const PROVE = process.argv.includes('--prove');

// ── route discovery ──────────────────────────────────────────────────────────
// Every page.tsx under app/dashboard becomes a route. Route groups (parenthesised
// directories) contribute no path segment; dynamic segments are skipped, since a
// bare [id] has no value to request.
function discoverDashboardRoutes(dir = 'app/dashboard', prefix = '/dashboard') {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = `${dir}/${entry}`;
    if (entry === 'page.tsx') out.push(prefix);
    else if (statSync(full).isDirectory()) {
      if (entry.startsWith('[')) continue;
      const seg = entry.startsWith('(') ? prefix : `${prefix}/${entry}`;
      out.push(...discoverDashboardRoutes(full, seg));
    }
  }
  return out.sort();
}

// Known to exist at the time of writing. Not the source of truth for what is
// checked -- discovery is -- but a floor, so a broken discovery cannot pass.
const KNOWN = [
  '/dashboard',
  '/dashboard/announcements',
  '/dashboard/grades',
  '/dashboard/modules',
  '/dashboard/settings',
];

// Supposed to be reachable signed out. The control.
//
// A course lesson route used to be the second entry here, and it was correct at
// the time: /course had no gate of any kind. Phase 4 gated the whole tree, so
// that route moved from being a control to being a subject, and it is asserted
// CLOSED below instead.
//
// This is now a single-route control, which is thinner than it was. It still
// does the job the control exists for, which is to prove the suite is not
// passing against a server that is down, a build that 404s everything, or a
// middleware redirecting the entire site. But one route is the minimum, and if
// /adaptive-test ever gains a gate this list must gain something else rather
// than being emptied.
const OPEN = ['/adaptive-test'];

// Closed by Phase 4, and asserted here for the same reason the dashboard routes
// are: a gate nothing checks is a gate that quietly stops existing.
//
// NOT DISCOVERED FROM THE FILESYSTEM, unlike the dashboard set. The course tree
// is one dynamic route serving roughly 97 topics, so there is no directory to
// enumerate; these are named instead, and each one is a different property:
//
//   a paid topic          the ordinary case
//   the FREE SAMPLE topic the exemption, which must still be closed to
//                         ANONYMOUS visitors: it is for signed-in free-tier
//                         users only, and it is the one route where a wrong
//                         answer opens the whole tree to nobody-in-particular
//   a NONEXISTENT topic   must be indistinguishable from a real one, or topic
//                         ids can be enumerated by telling 404 from the gate
const COURSE_CLOSED = [
  '/course/tsia2/math/unit/1/topic/QR.1.1/lesson',
  '/course/tsia2/math/unit/0/topic/AR.1.4/lesson',
  '/course/tsia2/math/unit/9/topic/ZZ.9.9/lesson',
];

// ── the faulted layout, for --prove ──────────────────────────────────────────
// The regression being simulated is the realistic one: the gate is taken out but
// the page still renders. Deleting only the redirect would throw on profile.role
// and return 500, which is a different failure and one a "not 200" check would
// wrongly pass.
//
// SO THE FAULT IS AT THE SOURCE OF profile, NOT AT THE REDIRECTS. Substituting a
// stand-in profile makes every downstream check pass and the page serve to an
// anonymous visitor, which is exactly the regression, and it targets ONE short
// line instead of a multi-line block.
//
// That matters, because the previous version targeted the whole block including
// its redirect call, and it went stale: #135 changed the redirect from a
// hardcoded '/login?next=/dashboard' to loginHref(safeNext(...)), the literal
// stopped matching, and --prove has been refusing to run ever since. The guard
// below caught it and exited rather than running a meaningless proof, which is
// the right failure, but nobody ran it, so nothing had demonstrated this check
// could fail. A shorter and more stable target is the fix.
const GATE = `  const profile = await getProfile();`;

const NO_GATE = `  const profile =
    (await getProfile()) ??
    ({
      id: 'faulted',
      role: 'student',
      subscription_status: 'inactive',
      plan: null,
      plan_status: null,
      access_until: null,
      email: null,
    } as NonNullable<Awaited<ReturnType<typeof getProfile>>>);`;

// The same idea for the course tree, added when Phase 4 gated it. The realistic
// regression is again that the gate goes and the page still renders, so the
// redirect is replaced by nothing rather than by a throw.
//
// Faulting BOTH in one run is deliberate. The suite now asserts two independent
// gates, and a proof that only ever removes one of them would let the other rot:
// the course checks would keep passing while nothing had shown they could fail.
const COURSE_GATE = `  if (!allowsTopic(access, 'curriculum', parsed.courseId, parsed.topicId)) {`;
const COURSE_NO_GATE = `  if (false) {`;

const original = readFileSync(LAYOUT, 'utf8');
const courseOriginal = readFileSync(COURSE_LAYOUT, 'utf8');

function faultLayout() {
  if (!courseOriginal.includes(COURSE_GATE)) {
    console.error(`\nFAULT TARGET ABSENT in ${COURSE_LAYOUT}. The course gate does not`);
    console.error('match the text this script expects to remove, so the fault would be a');
    console.error('no-op and the proof would be meaningless. Update COURSE_GATE and re-run.');
    process.exit(1);
  }
  if (!original.includes(GATE)) {
    console.error(`\nFAULT TARGET ABSENT in ${LAYOUT}. The gate does not match the`);
    console.error('text this proof knows how to remove, so the injection would be a');
    console.error('no-op and the proof would be meaningless. Update GATE and re-run.');
    process.exit(2);
  }
  const faulted = original
    .replace(GATE, NO_GATE)
    .replace('role={profile.role}', "role={profile?.role ?? 'student'}")
    .replace('subscriptionStatus={profile.subscription_status}', 'subscriptionStatus={profile?.subscription_status}');
  if (faulted === original) {
    console.error('\nFAULT PRODUCED NO CHANGE. Refusing to report a proof.');
    process.exit(2);
  }
  writeFileSync(LAYOUT, faulted);
  writeFileSync(COURSE_LAYOUT, courseOriginal.replace(COURSE_GATE, COURSE_NO_GATE));
}

function restoreLayout() {
  if (readFileSync(LAYOUT, 'utf8') !== original) writeFileSync(LAYOUT, original);
  if (readFileSync(COURSE_LAYOUT, 'utf8') !== courseOriginal) {
    writeFileSync(COURSE_LAYOUT, courseOriginal);
  }
}

// The working tree must survive any exit path, including a crash or a Ctrl-C
// mid-build. Restoring is idempotent, so registering it several times is safe.
process.on('exit', restoreLayout);
process.on('SIGINT', () => { restoreLayout(); process.exit(1); });
process.on('SIGTERM', () => { restoreLayout(); process.exit(1); });
process.on('uncaughtException', (e) => { restoreLayout(); console.error(e); process.exit(1); });

// ── runner ───────────────────────────────────────────────────────────────────
async function runSuite(label) {
  console.log(`\n${label}`);
  console.log('-'.repeat(label.length));

  execSync('npx next build', { stdio: 'ignore' });
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'ignore', detached: true });
  // Registered IMMEDIATELY after spawn. runSuite is called twice under --prove,
  // and before this a throw in either pass left a server holding the port.
  // killServer is a no-op on a child that has already exited, so registering one
  // task per suite is safe.
  onTeardown(() => killServer(server));
  await new Promise((r) => setTimeout(r, 9000));

  let ok = true;
  const check = (name, pass, detail = '') => {
    ok &&= pass;
    console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? `  ${detail}` : ''}`);
    return pass;
  };

  const browser = await chromium.launch();
  try {
    // A fresh context per suite: no storage state, no cookies, genuinely signed out.
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    const routes = discoverDashboardRoutes();
    check('route discovery found pages under app/dashboard',
      routes.length > 0, `${routes.length} found`);
    const missing = KNOWN.filter((r) => !routes.includes(r));
    check('discovery includes every route known to exist',
      missing.length === 0, missing.length ? `missing ${missing.join(', ')}` : routes.join(' '));

    for (const route of routes) {
      // TWO INSTRUMENTS, because one of them cannot see what it is asked about.
      //
      // page.goto FOLLOWS redirects and reports the status of wherever it ended
      // up, so it returns 200 for the login page and asserting 307 on it is
      // always false. Measured, both faulted and clean:
      //
      //   gate removed   goto -> status 200, url /dashboard
      //   gate present   goto -> status 200, url /login
      //
      // The status is identical in both states; only the landed path differs.
      // So the redirect itself is read with maxRedirects:0, which returns the
      // raw 307 and its Location, and the browser navigation is kept for where
      // a real visitor actually ends up.
      const raw = await ctx.request.get(`${BASE}${route}`, { maxRedirects: 0 })
        .catch(() => null);
      const status = raw ? raw.status() : 0;
      const location = raw ? (raw.headers()['location'] ?? '') : '';

      await page.goto(`${BASE}${route}`, { waitUntil: 'commit' }).catch(() => null);
      const landed = new URL(page.url()).pathname;

      // 307 specifically, not merely "not 200": a 500 from a page that crashes
      // before rendering is also not 200, and is not a gate.
      check(`${route} is closed signed out`,
        status === 307 && location.startsWith('/login') && landed === '/login',
        `${status} Location:${location || '-'} landed:${landed}`);
    }

    console.log('\n  /course, closed by Phase 4:');
    const courseLanded = [];
    for (const route of COURSE_CLOSED) {
      const raw = await ctx.request.get(`${BASE}${route}`, { maxRedirects: 0 }).catch(() => null);
      const status = raw ? raw.status() : 0;
      const location = raw ? (raw.headers()['location'] ?? '') : '';
      courseLanded.push(location);
      check(`${route} is closed signed out`,
        status === 307 && location.startsWith('/login'),
        `${status} Location:${location || '-'}`);
    }

    // The enumeration property, which is why the nonexistent topic is in the
    // list at all. A 404 on an unknown topic and a redirect on a known one would
    // let an unentitled visitor walk the whole topic id space.
    const [, , nonexistent] = courseLanded;
    check('a nonexistent topic is indistinguishable from a real one',
      Boolean(nonexistent) && nonexistent.startsWith('/login'),
      `Location:${nonexistent || '-'}`);

    console.log('\n  CONTROL, routes that are supposed to be OPEN signed out:');
    for (const route of OPEN) {
      const raw = await ctx.request.get(`${BASE}${route}`, { maxRedirects: 0 }).catch(() => null);
      const status = raw ? raw.status() : 0;
      check(`${route} still returns 200`, status === 200, `status ${status}`);
    }
  } finally {
    await browser.close();
    killServer(server);
    await new Promise((r) => setTimeout(r, 1000));
  }
  return ok;
}

// ── main ─────────────────────────────────────────────────────────────────────
if (!PROVE) {
  const ok = await runSuite('AUTH GATE, /dashboard closed to signed-out visitors');
  console.log(`\nRESULT: ${ok ? 'every dashboard route is gated' : 'A CHECK FAILED'}`);
  process.exit(ok ? 0 : 1);
}

console.log('PROOF MODE. The checks are only worth running if they can fail.\n');

faultLayout();
console.log(`gate removed from ${LAYOUT} and ${COURSE_LAYOUT}`);
const faultedPassed = await runSuite('WITH THE GATE REMOVED, the suite must FAIL');
restoreLayout();
console.log(`\n${LAYOUT} and ${COURSE_LAYOUT} restored`);

if (faultedPassed) {
  console.log('\nPROOF FAILED: the suite passed with no gate at all. It is not');
  console.log('measuring the gate, and nothing it reports can be trusted.');
  process.exit(1);
}

const cleanPassed = await runSuite('WITH THE GATE RESTORED, the suite must PASS');
if (!cleanPassed) {
  console.log('\nPROOF FAILED: the suite fails on unmodified code, so its failure');
  console.log('above says nothing about the gate.');
  process.exit(1);
}

console.log('\nPROVEN: fails without the gate, passes with it.');
process.exit(0);
