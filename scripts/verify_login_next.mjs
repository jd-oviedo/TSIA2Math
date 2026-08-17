// verify_login_next.mjs -- prove a signed-out deep link into /dashboard comes
// back to the page it asked for, and that an external destination is refused.
//
//   npx next build && npx next start -p 3110
//   node scripts/verify_login_next.mjs --base http://localhost:3110
//   node scripts/verify_login_next.mjs --base http://localhost:3110 --prove
//
// TWO ROUTES, NOT ONE. A redirect target is exactly the kind of thing that can
// be hardcoded to a value that happens to be right for the single case anyone
// tested, so every path assertion runs against /dashboard/grades AND
// /dashboard/announcements and requires the two to differ from each other.
// /dashboard itself is checked as the control, because it is the one route where
// the old hardcoded behaviour and the new behaviour agree -- if it broke, the
// fix would have replaced one wrong answer with another.
//
// THE SECOND DISCARD IS THE POINT. Fixing only the layout changes nothing a
// student can see: /dashboard's gate redirects here with no role param, so the
// screen they land on is the ROLE SELECTOR, whose student link used to hardcode
// next=%2Fdashboard and throw the path away again. Both hops are asserted.
//
// WHAT THIS FILE DOES NOT COVER, deliberately. app/auth/callback's guard is not
// reachable here: without a valid OAuth code the route always redirects to
// /login?error=auth_failed, so a check pointed at it would pass no matter what
// the guard did. It is covered by tests/next-param.test.ts instead. A check that
// cannot fail is worse than no check.

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = baseIdx >= 0 && args[baseIdx + 1] ? args[baseIdx + 1] : 'http://localhost:3110';
const PROVE = args.includes('--prove');

let failed = 0;
const check = async (label, fn) => {
  try {
    if (await fn()) console.log(`  pass  ${label}`);
    else {
      console.log(`  FAIL  ${label}`);
      failed++;
    }
  } catch (err) {
    console.log(`  FAIL  ${label} -- ${err.message.split('\n')[0]}`);
    failed++;
  }
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

console.log(`login next: ${BASE}  (${PROVE ? 'PROVE, faulted expectations' : 'real'})`);

// The raw 307 and its Location. maxRedirects: 0 because following the redirect
// reports the status of wherever it landed, which is 200 in both the working and
// the broken case -- the defect verify_auth_gate.mjs was written to avoid.
const locationFor = async (path) => {
  const res = await context.request.get(`${BASE}${path}`, { maxRedirects: 0 });
  return { status: res.status(), location: res.headers()['location'] ?? '' };
};

// ── THE LAYOUT NOW SENDS THE REQUESTED PATH ─────────────────────────────────
const ROUTES = ['/dashboard/grades', '/dashboard/announcements'];

for (const route of ROUTES) {
  await check(`${route} signed out asks to come back to ${route}`, async () => {
    const { status, location } = await locationFor(route);
    const ok = status === 307 && location === `/login?next=${encodeURIComponent(route)}`;
    if (!PROVE && !ok) console.log(`        ${status} Location:${location || '-'}`);
    return PROVE ? !ok : ok;
  });
}

// The assertion that catches a target hardcoded to whatever the author tested.
await check('the two routes ask for different destinations', async () => {
  const [a, b] = await Promise.all(ROUTES.map(locationFor));
  const differ = a.location !== b.location && a.location !== '' && b.location !== '';
  if (!PROVE && !differ) console.log(`        both: ${a.location}`);
  return PROVE ? !differ : differ;
});

// The control. This is the one route where old and new behaviour coincide.
await check('CONTROL: /dashboard itself still asks for /dashboard', async () => {
  const { status, location } = await locationFor('/dashboard');
  const ok = status === 307 && location === '/login?next=%2Fdashboard';
  if (!PROVE && !ok) console.log(`        ${status} Location:${location || '-'}`);
  return PROVE ? !ok : ok;
});

// A query string on the requested path has to survive being nested in the param.
await check('a query string on the requested route survives', async () => {
  const { location } = await locationFor('/dashboard/grades?term=fall');
  const ok = location === `/login?next=${encodeURIComponent('/dashboard/grades?term=fall')}`;
  if (!PROVE && !ok) console.log(`        Location:${location || '-'}`);
  return PROVE ? !ok : ok;
});

// ── THE ROLE SELECTOR CARRIES IT ONWARD ─────────────────────────────────────
// The student sign-in link lives behind the collapsed student bar.
const studentLinkHref = async (loginUrl) => {
  await page.goto(`${BASE}${loginUrl}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { expanded: false }).first().click();
  const link = page.locator('a[href*="role=student"]').last();
  await link.waitFor({ state: 'visible', timeout: 10000 });
  return link.getAttribute('href');
};

for (const route of ROUTES) {
  await check(`the role selector carries ${route} through to sign-in`, async () => {
    const href = await studentLinkHref(`/login?next=${encodeURIComponent(route)}`);
    const ok = href === `/login?role=student&next=${encodeURIComponent(route)}`;
    if (!PROVE && !ok) console.log(`        href=${href}`);
    return PROVE ? !ok : ok;
  });
}

// ── THE OPEN-REDIRECT GUARD ─────────────────────────────────────────────────
// Each of these is a destination a visitor could be handed if the param were
// passed through. The assertion is on the IDENTITY of where they would go, not
// merely that it is "not evil.com": a link pointing nowhere would satisfy a
// negative check.
const HOSTILE = ['https://evil.com', '//evil.com', '/\\evil.com', 'javascript:alert(1)'];

for (const hostile of HOSTILE) {
  await check(`an external next (${hostile}) is refused, not carried`, async () => {
    const href = await studentLinkHref(`/login?next=${encodeURIComponent(hostile)}`);
    const ok = href === '/login?role=student&next=%2Fdashboard';
    if (!PROVE && !ok) console.log(`        href=${href}`);
    return PROVE ? !ok : ok;
  });
}

// And the whole point of refusing it: following the link must not leave the site.
await check('following the refused link stays on this origin', async () => {
  const href = await studentLinkHref(`/login?next=${encodeURIComponent('https://evil.com')}`);
  await page.goto(`${BASE}${href}`, { waitUntil: 'domcontentloaded' });
  const landedHost = new URL(page.url()).host;
  const ok = landedHost === new URL(BASE).host;
  if (!PROVE && !ok) console.log(`        landed on ${landedHost}`);
  return PROVE ? !ok : ok;
});

await browser.close();

console.log(failed === 0 ? '\nall checks passed' : `\n${failed} check(s) failed`);
if (PROVE) {
  console.log(
    failed > 0
      ? 'PROVE: checks failed as intended, so they are reading the real page'
      : 'PROVE: nothing failed, which means these checks cannot fail. Fix them.'
  );
  process.exit(failed > 0 ? 0 : 1);
}
process.exit(failed === 0 ? 0 : 1);
