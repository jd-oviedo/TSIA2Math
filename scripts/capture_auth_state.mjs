// capture_auth_state.mjs -- sign in once, by hand, and keep the session so the
// browser checks can visit REAL /course URLs.
//
//   node scripts/capture_auth_state.mjs --base http://localhost:5140
//   node scripts/capture_auth_state.mjs --base <url> --from-cookies cookies.json
//
// ─── WHY THIS EXISTS ────────────────────────────────────────────────────────
//
// Every /course route 307s to /login without a session: app/course/layout.tsx:60
// calls resolveCourseAccess(), and allowsTopic() returns false for anonymous at
// app/lib/capabilities.ts:258, whose own comment reads "THE SESSION CHECK IS THE
// POINT OF THIS LINE".
//
// No script in scripts/ could authenticate, so all six probe scripts wrote a
// fake route instead. That auth wall is the structural reason three separate
// checks ended up measuring something other than the product. This file removes
// the reason.
//
// ─── WHY NOT EMAIL/PASSWORD ─────────────────────────────────────────────────
//
// The project is Google OAuth only (app/login/SignIn.tsx:83). Enabling a second
// auth method on a production project to satisfy a test harness was considered
// and REFUSED by Juan, correctly. Forging a session with the project JWT secret
// and adding an env-gated auth bypass to app code were both considered and
// rejected: the first puts the highest-value secret in .env.local to save a
// manual sign-in, the second is an auth bypass shipped in product code.
//
// So: sign in for real, once, and keep the cookies. This is the standard
// Playwright answer for an OAuth-only app.
//
// ─── THE ORIGIN CONSTRAINT, WHICH IS THE EASY THING TO GET WRONG ────────────
//
// app/lib/supabase-server.ts uses @supabase/ssr, so the session is CARRIED IN
// COOKIES, and cookies are scoped to an origin. SignIn.tsx:66 builds its
// redirectTo from `window.location.origin`.
//
// Therefore THE SIGN-IN MUST HAPPEN ON THE SAME ORIGIN THE WALK WILL USE. A
// session captured at app.unpackmath.com is not sent to http://localhost:5140.
// Pass the same --base to this script and to the walk.
//
// That origin must also be allow-listed in Supabase Auth URL Configuration, and
// a fresh Codespace gets a fresh hostname, so it has to be re-added there.
//
// ─── OUTPUT ─────────────────────────────────────────────────────────────────
//
// .auth/e2e-storage-state.json, which is a LIVE SESSION for a real account.
// .auth/ is in .gitignore (verified before this file was written, not after).
// Never commit it, never paste its contents anywhere.
//
// It expires. Access tokens last about an hour; the refresh token carries it
// further, but if refresh-token rotation is on, a run that refreshes invalidates
// the saved copy. Re-run this when the walk starts redirecting to /login.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const BASE = arg('--base', 'http://localhost:5140');
const FROM_COOKIES = arg('--from-cookies', null);
const OUT_DIR = '.auth';
const OUT = `${OUT_DIR}/e2e-storage-state.json`;

// REFUSE TO WRITE A SESSION SOMEWHERE GIT CAN SEE IT. Checked here rather than
// trusted, because the cost of being wrong is a live credential in a public
// repo, and .gitignore is one careless edit away from not covering this.
try {
  execSync(`git check-ignore -q ${OUT}`, { stdio: 'ignore' });
} catch {
  console.error(
    `REFUSING TO WRITE. ${OUT} is not gitignored.\n` +
      `Add ".auth/" to .gitignore before running this. It holds a live session.`
  );
  process.exit(1);
}
mkdirSync(OUT_DIR, { recursive: true });

const origin = new URL(BASE).hostname;

// ─── Path B: re-scope an exported cookie jar ────────────────────────────────
//
// For an environment with no interactive browser, which includes this Codespace:
// there is no DISPLAY, so nobody can click Google's consent screen here.
//
// Export the Supabase auth cookies from a browser already signed in (devtools,
// Application, Cookies), save them as a JSON array of {name, value}, and this
// re-scopes them onto the target origin. The server validates the JWT, not the
// cookie's domain, so a session issued for one host is accepted on another.
// That is a property of bearer tokens, not a loophole being exploited.
if (FROM_COOKIES) {
  const raw = JSON.parse(readFileSync(FROM_COOKIES, 'utf-8'));
  const cookies = raw
    .filter((c) => /^sb-/.test(c.name))
    .map((c) => ({
      name: c.name,
      value: c.value,
      domain: origin,
      path: '/',
      httpOnly: false,
      secure: BASE.startsWith('https'),
      sameSite: 'Lax',
      expires: -1,
    }));
  if (cookies.length === 0) {
    console.error('No sb-* cookies in that export. Supabase names them sb-<ref>-auth-token.');
    process.exit(1);
  }
  writeFileSync(OUT, JSON.stringify({ cookies, origins: [] }, null, 2));
  console.log(`wrote ${OUT} with ${cookies.length} cookie(s) scoped to ${origin}`);
  process.exit(0);
}

// ─── Path A: sign in interactively ──────────────────────────────────────────
if (!process.env.DISPLAY) {
  console.error(
    'No DISPLAY, so there is no browser window to sign in through.\n\n' +
      'This is expected inside a Codespace. Two ways forward:\n\n' +
      '  1. Run this script on a machine with a desktop, against the same --base\n' +
      '     the walk will use, then copy .auth/e2e-storage-state.json across.\n\n' +
      '  2. Sign in normally in any browser, export the sb-* cookies from\n' +
      '     devtools as JSON, and re-run with:\n' +
      `       node scripts/capture_auth_state.mjs --base ${BASE} --from-cookies cookies.json\n`
  );
  process.exit(2);
}

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

console.log(`\nOpening ${BASE}/login`);
console.log('Sign in with Google in the window. This script waits for the session.\n');
await page.goto(`${BASE}/login`);

// Waits for the cookie rather than for a URL, because the post-auth landing
// page varies (dashboard, or a `next` destination) and a URL check would be
// guessing at which.
const deadline = Date.now() + 5 * 60_000;
let ok = false;
while (Date.now() < deadline) {
  const cookies = await context.cookies();
  if (cookies.some((c) => /^sb-/.test(c.name) && c.value.length > 0)) {
    ok = true;
    break;
  }
  await page.waitForTimeout(1000);
}

if (!ok) {
  console.error('Timed out after 5 minutes with no sb-* session cookie.');
  await browser.close();
  process.exit(1);
}

// PROVE THE SESSION ACTUALLY OPENS CURRICULUM before saving it. A cookie that
// exists is not a cookie that is entitled: a signed-in account with no plan
// still bounces off /course to /dashboard/upgrade, and saving that would produce
// a walk that silently screenshots the upgrade page 20 times.
const probeUrl = `${BASE}/course/tsia2/math/unit/0/topic/QR.1.5/lesson`;
await page.goto(probeUrl, { waitUntil: 'domcontentloaded' });
const landed = page.url();
if (!landed.includes('/topic/QR.1.5/lesson')) {
  console.error(
    `Signed in, but this account cannot open curriculum.\n` +
      `  asked for: ${probeUrl}\n` +
      `  landed on: ${landed}\n` +
      `It needs the Full Course entitlement. Not saving.`
  );
  await browser.close();
  process.exit(1);
}

await context.storageState({ path: OUT });
await browser.close();
console.log(`\nSaved ${OUT}`);
console.log(`Verified: it opens ${probeUrl}`);
