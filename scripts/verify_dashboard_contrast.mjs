// verify_dashboard_contrast.mjs -- measure the tertiary ink and the section
// eyebrows on /dashboard against the grounds they actually render on.
//
//   node scripts/verify_dashboard_contrast.mjs
//   node scripts/verify_dashboard_contrast.mjs --prove
//
// WHY A PROBE ROUTE
// -----------------
// /dashboard redirects to /login without a session, and a session needs Google
// OAuth, which cannot be automated. Same answer as verify_modules_states.mjs: a
// probe route, written before the run and deleted after, never committed,
// rendering the REAL components. The probe supplies no colours of its own --
// every value measured here is painted by DiagnosticCta, Eyebrow, Card or
// ResumeCard out of the --umd-* variables, and read back off rendered pixels.
//
// WHAT IS MEASURED, AND ON WHICH GROUND
// -------------------------------------
// V.dim renders on three grounds across its 18 call sites:
//
//   cardBg   #FFFFFF  14 sites  Card, DiagnosticCta, the grades tables, settings
//   pageBg   #F5F5F3   3 sites  ResumeCard's two lines and UnitSection's marker,
//                               none of which sit in a card
//   subtleBg #FBFBF9   1 site   FlagsPanel's flag meta line
//
// The first two are measured from rendered pixels below. The third needs a
// signed-in teacher and a fetched flag to reach, so it is measured at the token
// level instead: the four values are read off the live stylesheet, not written
// down here, and every dim-on-ground pairing is checked. A stale hex in this
// file cannot make that check pass.
//
// THE CONTROL. A contrast probe that returns a healthy number regardless of
// which element it is handed proves nothing, so every ground also measures the
// heading on the same surface and requires the two to differ.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { spawn } from 'child_process';
import { onTeardown, killServer, clearNextTypes } from './harness-teardown.mjs';

const PROBE_DIR = 'app/um-probe-contrast';
const PORT = 5130;
const BASE = `http://localhost:${PORT}`;
const PROVE = process.argv.includes('--prove');

// .tsx, not .jsx: a probe exempt from the type system is half a probe. See the
// header of verify_modules_states.mjs.
const probePage = `import DiagnosticCta from '../dashboard/DiagnosticCta';
import ResumeCard from '../dashboard/modules/ResumeCard';
import FlagsPanel from '../dashboard/FlagsPanel';
import JoinClassPanel from '../dashboard/JoinClassPanel';
import { Card, CardTitle, Eyebrow } from '../dashboard/ui';
import { DASHBOARD_CSS } from '../dashboard/dashboard-css';

// DASHBOARD_CSS carries the --umd-* declarations AND .um-visually-hidden. It is
// normally supplied by app/dashboard/layout.tsx; this probe sits outside
// /dashboard, so it injects it exactly as the other Modules probes do.
export default async function Probe({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const { theme = 'light' } = await searchParams;
  return (
    <>
      <style>{DASHBOARD_CSS}</style>
      <div
        className="um-dash"
        data-theme={theme}
        style={{ minHeight: '100dvh', padding: 24, background: 'var(--umd-page-bg)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 940 }}>
          {/* GROUND 1: the white card. The real DiagnosticCta, whose eyebrow was
              the #B5763A failure, and a real Card holding the real Eyebrow,
              whose default is the token under test. */}
          <div data-probe="cta">
            <DiagnosticCta />
          </div>

          <div data-probe="card">
            <Card>
              <Eyebrow>Pick up where you left off</Eyebrow>
              <CardTitle>Operations with rational numbers</CardTitle>
            </Card>
          </div>

          {/* GROUND 2: the page itself. ResumeCard deliberately has no card, so
              its eyebrow and its meta line sit on --umd-page-bg. */}
          {/* GROUND 3: notice copy and the status chips, inside a card exactly as
              /dashboard mounts them. Both components reach their coloured
              branches only through the network, so the run stubs /api/flags and
              /api/enroll and lets the REAL components render the result. No
              markup and no colour in this probe is written by the check. */}
          <div data-probe="flags">
            <Card padding="16px 24px">
              <FlagsPanel />
            </Card>
          </div>

          <div data-probe="join">
            <Card>
              <JoinClassPanel />
            </Card>
          </div>

          <div data-probe="resume">
            <ResumeCard
              topicId="QR.1.5"
              topicName="Operations with rational numbers"
              unitNumber={1}
              href="/course/tsia2/math/unit/1/topic/QR.1.5/practice"
              label="Carry on with practice"
            />
          </div>
        </div>
      </div>
    </>
  );
}
`;

onTeardown(() => { if (existsSync(PROBE_DIR)) rmSync(PROBE_DIR, { recursive: true, force: true }); });
onTeardown(clearNextTypes);

mkdirSync(PROBE_DIR, { recursive: true });
writeFileSync(`${PROBE_DIR}/page.tsx`, probePage);

console.log('probe route written, building...\n');
await new Promise((res, rej) => {
  // Captured, not ignored: the probe is deleted on exit, so a build failure that
  // printed nothing would take its own evidence with it.
  let out = '';
  const b = spawn('npx', ['next', 'build']);
  b.stdout.on('data', (d) => (out += d));
  b.stderr.on('data', (d) => (out += d));
  b.on('exit', (c) => {
    if (c === 0) return res();
    console.error(out.split('\n').slice(-40).join('\n'));
    rej(new Error('build failed'));
  });
});

const server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'ignore', detached: true });
onTeardown(() => killServer(server));
await new Promise((r) => setTimeout(r, 7000));

let failed = 0;
const check = async (label, fn) => {
  try {
    const ok = await fn();
    const pass = PROVE ? !ok : ok;
    console.log(`  ${pass ? 'pass' : 'FAIL'}  ${label}`);
    if (!pass) failed++;
  } catch (e) {
    console.log(`  FAIL  ${label} -- ${e.message.split('\n')[0]}`);
    failed++;
  }
};

// Read from rendered pixels, not from the constants: the effective background is
// found by walking up past transparent parents, and text alpha is composited
// over whatever it lands on. Same maths as verify_modules_states.mjs so the two
// files cannot disagree about a ratio.
const contrastProbe = `(sel) => {
  const el = document.querySelector(sel);
  if (!el) throw new Error('no element for ' + sel);
  const parse = (c) => c.match(/[\\d.]+/g).map(Number);
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  let bg = [255, 255, 255];
  for (let n = el; n; n = n.parentElement) {
    const c = parse(getComputedStyle(n).backgroundColor);
    if (c.length < 4 || c[3] > 0) { bg = c.slice(0, 3); break; }
  }
  const fg = parse(getComputedStyle(el).color);
  const a = fg.length > 3 ? fg[3] : 1;
  const over = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
  const [hi, lo] = [lum(over), lum(bg)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}`;

// The token-level pass, for the ground no probe can render. Every value comes
// off the live stylesheet via getComputedStyle, so this cannot pass against a
// hex that is only written down in this file.
// The notice components carry no probe attributes, so these elements are
// addressed by the copy they render. Same maths, same compositing.
const contrastByText = `(sel, text) => {
  const el = [...document.querySelectorAll(sel)].find((n) => n.textContent.trim() === text);
  if (!el) throw new Error('no element matching ' + JSON.stringify(text));
  const parse = (c) => c.match(/[\\d.]+/g).map(Number);
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  let bg = [255, 255, 255];
  for (let n = el; n; n = n.parentElement) {
    const c = parse(getComputedStyle(n).backgroundColor);
    if (c.length < 4 || c[3] > 0) { bg = c.slice(0, 3); break; }
  }
  const fg = parse(getComputedStyle(el).color);
  const a = fg.length > 3 ? fg[3] : 1;
  const over = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
  const [hi, lo] = [lum(over), lum(bg)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}`;

const tokenProbe = `() => {
  const cs = getComputedStyle(document.querySelector('.um-dash'));
  const v = (n) => cs.getPropertyValue(n).trim();
  const parse = (c) => {
    if (c.startsWith('#')) {
      let h = c.slice(1);
      if (h.length === 3) h = [...h].map((x) => x + x).join('');
      return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    }
    return c.match(/[\\d.]+/g).map(Number).slice(0, 3);
  };
  const lin = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (a, b) => {
    const [hi, lo] = [lum(parse(a)), lum(parse(b))].sort((x, y) => y - x);
    return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
  };
  const dim = v('--umd-dim');
  return {
    dim,
    pageBg: ratio(dim, v('--umd-page-bg')),
    subtleBg: ratio(dim, v('--umd-subtle-bg')),
    cardBg: ratio(dim, v('--umd-card-bg')),
  };
}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });

// The network, and ONLY the network. Both notice components reach their
// coloured branches through a fetch; stubbing the response drives the real
// state machine, the real branch and the real tokens, where hand-writing the
// markup would only confirm the check against itself.
const FLAGS = {
  flags: [
    { id: 'f1', created_at: '2026-08-20T10:00:00Z', item_id: 'QR.1.5-q3',
      user_email: 'student@example.com', category: 'other', comment: null, status: 'open' },
    { id: 'f2', created_at: '2026-08-19T10:00:00Z', item_id: 'QR.1.6-q1',
      user_email: null, category: 'other', comment: null, status: 'resolved' },
  ],
};
await ctx.route('**/api/flags', (r) => r.fulfill({ json: FLAGS }));
let enrollFails = true;
await ctx.route('**/api/enroll', (r) =>
  enrollFails
    ? r.fulfill({ status: 400, json: { error: 'That join code was not recognised.' } })
    : r.fulfill({ json: { class_name: 'Period 3 Algebra' } })
);

const page = await ctx.newPage();
await page.goto(`${BASE}/um-probe-contrast`);
await page.waitForTimeout(600);

// ── Item 5: the two eyebrows that were orange as text ───────────────────────
const ctaEyebrow = await page.evaluate(`(${contrastProbe})('[data-probe="cta"] section > div > div:first-child')`);
const cardEyebrow = await page.evaluate(`(${contrastProbe})('[data-probe="card"] section > div:first-child')`);
const resumeEyebrow = await page.evaluate(`(${contrastProbe})('[data-probe="resume"] section > div:first-child > div:first-child')`);
const resumeMeta = await page.evaluate(`(${contrastProbe})('[data-probe="resume"] section > div:first-child > div:last-child')`);

await check(`"Start with this" clears 4.5:1 on the card (got ${ctaEyebrow})`, () => ctaEyebrow >= 4.5);
await check(`"Pick up where you left off" clears 4.5:1 on the card (got ${cardEyebrow})`, () => cardEyebrow >= 4.5);

// ── Item 6: the token, on the grounds it renders on ─────────────────────────
await check(`ResumeCard eyebrow clears 4.5:1 on the page ground (got ${resumeEyebrow})`, () => resumeEyebrow >= 4.5);
await check(`ResumeCard meta line clears 4.5:1 on the page ground (got ${resumeMeta})`, () => resumeMeta >= 4.5);

const tok = await page.evaluate(`(${tokenProbe})()`);
await check(`--umd-dim ${tok.dim} clears 4.5:1 on --umd-page-bg (got ${tok.pageBg})`, () => tok.pageBg >= 4.5);
await check(`--umd-dim ${tok.dim} clears 4.5:1 on --umd-subtle-bg (got ${tok.subtleBg})`, () => tok.subtleBg >= 4.5);
await check(`--umd-dim ${tok.dim} clears 4.5:1 on --umd-card-bg (got ${tok.cardBg})`, () => tok.cardBg >= 4.5);

// ── Controls ────────────────────────────────────────────────────────────────
//
// Both prove the probe reads the element it is pointed at rather than returning
// a constant: a heading on the same ground must measure much higher than the
// eyebrow above it, and the two must not be equal.
const cardHeading = await page.evaluate(`(${contrastProbe})('[data-probe="card"] section > h2')`);
const resumeHeading = await page.evaluate(`(${contrastProbe})('[data-probe="resume"] section > div:first-child > div:nth-child(2)')`);
await check(`CONTROL: the card heading measures higher than its eyebrow (${cardHeading} vs ${cardEyebrow})`,
  () => cardHeading > cardEyebrow);
await check(`CONTROL: the page-ground heading measures higher than its eyebrow (${resumeHeading} vs ${resumeEyebrow})`,
  () => resumeHeading > resumeEyebrow);

// ── The five colour-as-text failures ────────────────────────────────────────
//
// FlagsPanel lives behind a <details>, and only fetches once opened.
const drive = async (p) => {
  await p.click('[data-probe="flags"] summary');
  await p.waitForTimeout(500);
  await p.fill('[data-probe="join"] input', 'BADCOD');
  await p.click('[data-probe="join"] button:has-text("Join")');
  await p.waitForTimeout(400);
};
await drive(page);

const flagsError = null; // the flags fetch succeeds here; its error branch is covered below
const joinError = await page.evaluate(
  `(${contrastByText})('p', 'That join code was not recognised.')`);
const chipOpen = await page.evaluate(`(${contrastByText})('span', 'Open')`);
const chipResolved = await page.evaluate(`(${contrastByText})('span', 'Resolved')`);
// Captured HERE, while the flag rows are still rendered: the stubs are flipped
// below to reach the other branches, and a 500 leaves no rows behind.
const resolveBtn = await page.evaluate(`(${contrastByText})('button', 'Reopen')`);

await check(`JoinClassPanel error copy clears 4.5:1 on the card (got ${joinError})`, () => joinError >= 4.5);
await check(`"Open" chip clears 4.5:1 on its amber fill (got ${chipOpen})`, () => chipOpen >= 4.5);
await check(`"Resolved" chip clears 4.5:1 on its green fill (got ${chipResolved})`, () => chipResolved >= 4.5);

// The success branch, and with it FlagsPanel's error branch, need different
// responses, so the page is reloaded with the stubs flipped.
enrollFails = false;
await ctx.unroute('**/api/flags');
await ctx.route('**/api/flags', (r) => r.fulfill({ status: 500, json: { error: 'Failed to load flags.' } }));
await page.goto(`${BASE}/um-probe-contrast`);
await page.waitForTimeout(600);
await drive(page);

const joinOk = await page.evaluate(
  `(${contrastByText})('p', "You've joined Period 3 Algebra.")`);
const flagsErr = await page.evaluate(
  `(${contrastByText})('p', 'Failed to load flags.')`);

await check(`JoinClassPanel success copy clears 4.5:1 on the card (got ${joinOk})`, () => joinOk >= 4.5);
await check(`FlagsPanel error copy clears 4.5:1 on the card (got ${flagsErr})`, () => flagsErr >= 4.5);

// grades/page.tsx:145 renders V.noticeOk on the same cardBg as the success copy
// just measured, so it is the identical token on the identical ground. Asserted
// at the token level rather than by mounting a page that needs a session.
const noticeTok = await page.evaluate(`(${tokenProbe.replace('--umd-dim', '--umd-notice-ok')})()`);
await check(`--umd-notice-ok ${noticeTok.dim} clears 4.5:1 on --umd-card-bg (got ${noticeTok.cardBg})`,
  () => noticeTok.cardBg >= 4.5);

// CONTROL. The chips gave up their coloured text for ink; if the probe cannot
// tell the chip apart from the neutral button beside it, it is not reading the
// fill it thinks it is.
await check(`CONTROL: the chip and the neutral button beside it measure differently (${chipResolved} vs ${resolveBtn})`,
  () => chipResolved !== resolveBtn);

// ── Dark, which this branch does not change but must not break ───────────────
await page.goto(`${BASE}/um-probe-contrast?theme=dark`);
await page.waitForTimeout(600);
const darkCta = await page.evaluate(`(${contrastProbe})('[data-probe="cta"] section > div > div:first-child')`);
const darkResume = await page.evaluate(`(${contrastProbe})('[data-probe="resume"] section > div:first-child > div:first-child')`);
await check(`"Start with this" clears 4.5:1 in dark (got ${darkCta})`, () => darkCta >= 4.5);
await check(`ResumeCard eyebrow clears 4.5:1 in dark (got ${darkResume})`, () => darkResume >= 4.5);

// The notices failed in dark too, so dark is a fix here rather than a guard.
await drive(page);
const darkFlagsErr = await page.evaluate(`(${contrastByText})('p', 'Failed to load flags.')`);
const darkJoinOk = await page.evaluate(`(${contrastByText})('p', "You've joined Period 3 Algebra.")`);
await check(`FlagsPanel error copy clears 4.5:1 in dark (got ${darkFlagsErr})`, () => darkFlagsErr >= 4.5);
await check(`JoinClassPanel success copy clears 4.5:1 in dark (got ${darkJoinOk})`, () => darkJoinOk >= 4.5);

await browser.close();
console.log(failed === 0 ? '\nall checks passed' : `\n${failed} check(s) failed`);
if (PROVE) {
  console.log(failed > 0 ? 'PROVE: failed as intended, the checks read the real page'
                         : 'PROVE: nothing failed, these checks cannot fail. Fix them.');
  process.exit(failed > 0 ? 0 : 1);
}
process.exit(failed === 0 ? 0 : 1);
