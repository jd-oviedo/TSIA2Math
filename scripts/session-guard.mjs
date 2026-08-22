// session-guard.mjs -- the one question every browser check has to answer first:
// is this session actually opening curriculum, or am I about to measure the
// login page?
//
// ─── WHY THIS IS A SHARED MODULE AND NOT A CHECK INSIDE THE WALK ────────────
//
// scripts/capture_auth_state.mjs used to validate on ONE of its two paths. The
// interactive path opened QR.1.5 before saving; the --from-cookies path wrote
// the file and exited 0 with no validation of any kind. Measured, not assumed:
// a fabricated session -- well-formed base64 JSON, garbage tokens -- produced
//
//     wrote .auth/e2e-storage-state.json with 2 cookie(s) scoped to localhost
//     exit=0
//
// That is the same defect class the whole branch has been unpicking: a check
// that reports success while measuring nothing. So the validation is lifted out
// of the capture script, where it could be on one branch and not the other, into
// a module that BOTH capture paths must clear before a state file is written and
// that the walk re-runs as step 0.
//
// ─── WHY THE ASSERTIONS ARE POSITIVE AND EXACT ──────────────────────────────
//
// The old boundary check read `!url.includes('/topic/QR.1.5/lesson')`. An
// absence assertion passes when the server 500s, when the dev server is down,
// and when the URL has a typo. Every assertion here names the value it expects:
//
//   status   === 200                 not "not a redirect"
//   pathname === the requested path  not "does not start with /login"
//   h1       === the topic's title   not "an h1 exists"
//
// QR.1.5 IS THE MARKER, and it is a Full-Course-only one. The free sample is
// AR.1.4 (capabilities.ts FREE_SAMPLE), so a signed-in free-tier account is sent
// to /dashboard/upgrade for this topic and an anonymous one to /login. Landing
// on it with content rendered means allowsTopic returned true for 'curriculum',
// which only an entitled account gets.

export const GUARD_TOPIC = 'tsia2/math/unit/0/topic/QR.1.5';
export const GUARD_PATH = `/course/${GUARD_TOPIC}/lesson`;

// Read off the real render rather than transcribed from the authoring source:
// the source is markdown and what has to match is what the pipeline produced.
export const GUARD_H1 =
  'Operations with rational numbers (signed numbers, fractions, decimals)';

/**
 * Prove a session opens curriculum, or throw.
 *
 * Takes a Playwright BrowserContext already carrying the session, so it can run
 * against cookies that have not been written to disk yet -- which is the point:
 * an unentitled session must never reach a state file.
 *
 * @returns {Promise<{katex:number, mathml:number, theme:string}>} on success
 * @throws {Error} with every observed value in the message, on any failure
 */
export async function assertSessionOpensCurriculum(context, base) {
  const page = await context.newPage();
  const url = `${base}${GUARD_PATH}`;
  const fail = (why, observed) => {
    throw new Error(
      `SESSION DOES NOT OPEN CURRICULUM.\n` +
        `  ${why}\n` +
        `  asked for : ${url}\n` +
        Object.entries(observed)
          .map(([k, v]) => `  ${k.padEnd(10)}: ${v}`)
          .join('\n') +
        `\n\nA session cookie that exists is not a session that is entitled. Check\n` +
        `sql/e2e_test_account_entitlement.sql section 1 for this account, and check\n` +
        `that the capture used the SAME --base as this run: the session is\n` +
        `cookie-borne and cookies are scoped to an origin.`
    );
  };

  let res;
  try {
    // NOT networkidle. Measured 2026-08-22: the quiz surface never reaches it
    // and times out at 30s with zero requests outstanding, so every check that
    // waited on it was one surface away from hanging. Waiting on the element
    // that must exist is both faster and the thing actually being asserted.
    res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  } catch (e) {
    fail(`navigation threw: ${e.message.split('\n')[0]}`, { status: 'none', landed: 'none' });
  }

  const landed = new URL(page.url()).pathname;
  if (res.status() !== 200) fail(`expected status 200, got ${res.status()}`, { status: res.status(), landed });
  if (landed !== GUARD_PATH) {
    fail(
      landed === '/login'
        ? 'redirected to /login: no valid session'
        : landed === '/dashboard/upgrade'
          ? 'redirected to /dashboard/upgrade: signed in, but NOT entitled'
          : `landed somewhere unexpected`,
      { status: res.status(), landed, expected: GUARD_PATH }
    );
  }

  await page.waitForSelector('.um-topic .um-prose .katex', { timeout: 15_000 }).catch(() => {});

  const seen = await page.evaluate(() => {
    const wrap = document.querySelector('.um-topic');
    return {
      wrapper: !!wrap,
      theme: wrap?.dataset?.theme ?? null,
      h1: document.querySelector('h1')?.textContent?.trim() ?? null,
      hasCode: document.body.innerText.includes('QR.1.5'),
      katex: document.querySelectorAll('.um-prose .katex').length,
      mathml: document.querySelectorAll('.um-prose .katex .katex-mathml').length,
    };
  });

  if (!seen.wrapper) fail('the .um-topic surface wrapper never rendered', { status: 200, landed, ...seen });
  if (seen.h1 !== GUARD_H1) fail(`h1 is not the topic title`, { status: 200, landed, h1: seen.h1, expected: GUARD_H1 });
  if (!seen.hasCode) fail('the topic code QR.1.5 is not on the page', { status: 200, landed, ...seen });
  // MathML is the provenance check: real KaTeX emits it and a hand-written span
  // cannot. Zero here with an h1 present would mean the shell rendered and the
  // content did not, which is a render fault wearing a passing URL.
  if (seen.mathml === 0) fail('no KaTeX MathML in the prose: content did not render', { status: 200, landed, ...seen });

  await page.close();
  return { katex: seen.katex, mathml: seen.mathml, theme: seen.theme };
}
