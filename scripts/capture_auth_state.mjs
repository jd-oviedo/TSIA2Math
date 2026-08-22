// capture_auth_state.mjs -- get a real session, and keep it, so the browser
// checks can visit REAL /course URLs.
//
//   node scripts/capture_auth_state.mjs --base http://localhost:5140
//   node scripts/capture_auth_state.mjs --base <url> --from-cookies cookies.json
//   node scripts/capture_auth_state.mjs --base <url> --interactive
//
// ─── WHY THIS EXISTS ────────────────────────────────────────────────────────
//
// Every /course route 307s to /login without a session: app/course/layout.tsx:60
// calls resolveCourseAccess(), and allowsTopic() returns false for anonymous at
// app/lib/capabilities.ts, whose own comment reads "THE SESSION CHECK IS THE
// POINT OF THIS LINE".
//
// No script in scripts/ could authenticate, so all six probe scripts wrote a
// fake route instead. That auth wall is the structural reason three separate
// checks ended up measuring something other than the product.
//
// ─── THE DEFAULT PATH IS NOW MINT, NOT COOKIE TRANSPLANT ────────────────────
//
// SUPERSEDED 2026-08-22. This file shipped with transplant as the only usable
// path in a Codespace, and recorded that as the standard Playwright answer for
// an OAuth-only app. It is, but it is not the best answer available HERE, and
// the reason it was not taken first was that the option had not been costed.
//
// SUPABASE_SERVICE_ROLE_KEY is ALREADY in .env.local and is already used by nine
// scripts and by app/lib/supabase-admin.ts. Using it for a local harness
// introduces no new secret and no new exposure. So:
//
//   1. admin.auth.admin.generateLink({ type: 'magiclink' })  -> hashed_token
//   2. anon client .auth.verifyOtp({ token_hash })           -> a real session
//   3. serialize it with @supabase/ssr's OWN createChunks    -> the cookies
//
// Step 3 matters. The cookie format is not hand-rolled: it goes through the same
// stringToBase64URL + createChunks the app itself writes with, so a format change
// in the library moves this with it.
//
// THIS IS NOT THE REJECTED OPTION. Forging a session with the project JWT secret
// was rejected, and rightly: that puts the highest-value secret in .env.local and
// mints a token no auth server ever saw. This asks the auth server for a real
// token through a supported admin API, using a key that is already here. Enabling
// email/password on production was refused and is NOT required -- generateLink
// mints a token without sending mail, verified against this project 2026-08-22:
// it returned a 56-char hashed_token, and verifyOtp exchanged it for a session
// with a live refresh token. An env-gated auth bypass in product code was
// rejected outright and nothing here touches app code.
//
// WHAT THE MINT PATH DOES NOT COVER, said out loud rather than left implied: it
// is not the Google OAuth flow. It proves the /course gate accepts a valid
// Supabase session; it does NOT exercise app/login/SignIn.tsx or
// app/auth/callback/route.ts. Those stay covered by verify_login_next.mjs and
// verify_auth_gate.mjs. Do not let this file be read as covering sign-in.
//
// ─── THE ORIGIN CONSTRAINT, WHICH IS THE EASY THING TO GET WRONG ────────────
//
// @supabase/ssr carries the session in COOKIES, and cookies are scoped to an
// origin. Pass the same --base to this script and to the walk. The mint path
// re-scopes onto whatever --base it is given, so it does not need the origin
// allow-listed in Supabase Auth URL Configuration -- step 2 is a direct API call
// and never redirects. The --interactive path DOES need that entry.
//
// ─── OUTPUT ─────────────────────────────────────────────────────────────────
//
// .auth/e2e-storage-state.json, a LIVE SESSION for a real account. .auth/ is
// gitignored, and that is CHECKED at run time rather than trusted. Never commit
// it, never paste its contents anywhere. Access tokens last about an hour;
// re-running is one command, which is the main practical reason mint beats
// transplant.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { stringToBase64URL } from '@supabase/ssr/dist/main/utils/base64url.js';
import { createChunks } from '@supabase/ssr/dist/main/utils/chunker.js';
import { assertSessionOpensCurriculum, GUARD_PATH } from './session-guard.mjs';

const args = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes(name);

const BASE = arg('--base', 'http://localhost:5140');
const FROM_COOKIES = arg('--from-cookies', null);
const INTERACTIVE = has('--interactive');
const EMAIL = arg('--email', 'vics8388@gmail.com');
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

const host = new URL(BASE).hostname;
const cookieShell = (name, value) => ({
  name,
  value,
  domain: host,
  path: '/',
  httpOnly: false,
  secure: BASE.startsWith('https'),
  sameSite: 'Lax',
  expires: -1,
});

function loadEnvLocal() {
  let raw;
  try {
    raw = readFileSync('.env.local', 'utf-8');
  } catch {
    return;
  }
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

// ─── THE GATE EVERY PATH GOES THROUGH ───────────────────────────────────────
//
// No path writes a state file without clearing this. That is the whole point of
// the rewrite: validation used to live on ONE branch, so the other branch wrote
// unentitled and invalid sessions to disk and exited 0.
async function writeStateIfItOpensCurriculum(cookies, how) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addCookies(cookies);
  try {
    const seen = await assertSessionOpensCurriculum(context, BASE);
    writeFileSync(OUT, JSON.stringify({ cookies, origins: [] }, null, 2));
    console.log(`\nSaved ${OUT}  (${how})`);
    console.log(`  scoped to  : ${host}`);
    console.log(`  verified on: ${BASE}${GUARD_PATH}`);
    console.log(`  rendered   : ${seen.katex} KaTeX nodes, ${seen.mathml} with MathML`);
  } catch (e) {
    console.error(`\n${e.message}\n\nNOT SAVED.`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

// ─── Path A (default): mint ─────────────────────────────────────────────────
async function mint() {
  loadEnvLocal();
  const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!URL_ || !ANON || !SRK) {
    console.error(
      'Missing Supabase env. This path needs NEXT_PUBLIC_SUPABASE_URL,\n' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in .env.local.'
    );
    process.exit(2);
  }

  const admin = createClient(URL_, SRK, { auth: { persistSession: false } });
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: EMAIL,
  });
  if (linkErr) {
    // The one failure mode worth naming, because the fix for it is NOT allowed.
    const blocked = linkErr.code === 'email_provider_disabled' || linkErr.status === 422;
    console.error(
      `generateLink failed: ${linkErr.status} ${linkErr.code ?? ''} ${linkErr.message}` +
        (blocked
          ? `\n\nThe Email provider is disabled on this project. DO NOT ENABLE IT.\n` +
            `This project is Google-only on purpose and opening a second auth path on\n` +
            `production to satisfy a test harness is not an acceptable trade.\n` +
            `Use the transplant fallback instead:\n` +
            `  node scripts/capture_auth_state.mjs --base ${BASE} --from-cookies cookies.json`
          : '')
    );
    process.exit(1);
  }

  const pub = createClient(URL_, ANON, {
    auth: { persistSession: false, detectSessionInUrl: false },
  });
  const { data: v, error: otpErr } = await pub.auth.verifyOtp({
    token_hash: link.properties.hashed_token,
    type: 'magiclink',
  });
  if (otpErr) {
    console.error(`verifyOtp failed: ${otpErr.status} ${otpErr.code ?? ''} ${otpErr.message}`);
    process.exit(1);
  }

  const key = `sb-${new URL(URL_).hostname.split('.')[0]}-auth-token`;
  const chunks = createChunks(key, 'base64-' + stringToBase64URL(JSON.stringify(v.session)));
  console.log(`minted a session for ${EMAIL}`);
  console.log(`  cookie: ${chunks.map((c) => `${c.name} (${c.value.length})`).join(', ')}`);
  await writeStateIfItOpensCurriculum(chunks.map((c) => cookieShell(c.name, c.value)), 'minted');
}

// ─── Path B: re-scope an exported cookie jar ────────────────────────────────
//
// THE FALLBACK, for when the mint path is unavailable. Export the Supabase auth
// cookies from a browser already signed in (devtools, Application, Cookies) as a
// JSON ARRAY of {name, value}. Everything else in the export is discarded and
// re-synthesised from --base.
//
// The file must be a top-level array. A {"cookies":[...]} wrapper -- the
// Playwright storageState shape, and what several export extensions emit -- is
// rejected by name below rather than left to throw "raw.filter is not a
// function" with a stack trace.
//
// Supabase chunks a large session across sb-<ref>-auth-token.0 and .1. BOTH are
// required: combineChunks stops at the first missing index, and a lone .0
// decodes to truncated base64 which @supabase/ssr treats as absent, silently.
async function fromCookies(path) {
  const raw = JSON.parse(readFileSync(path, 'utf-8'));
  if (!Array.isArray(raw)) {
    console.error(
      `${path} must be a top-level JSON ARRAY of {name, value}.\n` +
        `Got ${Object.prototype.toString.call(raw)}` +
        (raw && typeof raw === 'object' && Array.isArray(raw.cookies)
          ? `. It looks like a Playwright storageState -- unwrap it and pass the\n` +
            `  "cookies" array on its own.`
          : '.')
    );
    process.exit(1);
  }
  const cookies = raw
    .filter((c) => /^sb-/.test(c?.name ?? ''))
    .map((c) => cookieShell(c.name, c.value));
  if (cookies.length === 0) {
    console.error('No sb-* cookies in that export. Supabase names them sb-<ref>-auth-token.');
    process.exit(1);
  }
  console.log(`re-scoped ${cookies.length} cookie(s) onto ${host}`);
  await writeStateIfItOpensCurriculum(cookies, `transplanted from ${path}`);
}

// ─── Path C: sign in interactively, through the real Google flow ────────────
async function interactive() {
  if (!process.env.DISPLAY) {
    console.error(
      'No DISPLAY, so there is no browser window to sign in through.\n' +
        'This is expected inside a Codespace. Drop --interactive to use the mint path.'
    );
    process.exit(2);
  }
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  console.log(`\nOpening ${BASE}/login -- sign in with Google. This waits for the session.\n`);
  await page.goto(`${BASE}/login`);

  const deadline = Date.now() + 5 * 60_000;
  let cookies = null;
  while (Date.now() < deadline) {
    const all = await context.cookies();
    if (all.some((c) => /^sb-/.test(c.name) && c.value.length > 0)) {
      cookies = all.filter((c) => /^sb-/.test(c.name));
      break;
    }
    await page.waitForTimeout(1000);
  }
  await browser.close();
  if (!cookies) {
    console.error('Timed out after 5 minutes with no sb-* session cookie.');
    process.exit(1);
  }
  await writeStateIfItOpensCurriculum(
    cookies.map((c) => cookieShell(c.name, c.value)),
    'interactive Google sign-in'
  );
}

if (FROM_COOKIES) await fromCookies(FROM_COOKIES);
else if (INTERACTIVE) await interactive();
else await mint();
