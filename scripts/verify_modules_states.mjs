// verify_modules_states.mjs -- walk the Modules surface in every entitlement
// state and both themes, and prove a gated row is not a link.
//
//   node scripts/verify_modules_states.mjs
//   node scripts/verify_modules_states.mjs --prove
//
// WHY A PROBE ROUTE
// -----------------
// /dashboard/modules redirects to /login without a session, and a session needs
// Google OAuth, which cannot be automated. Reaching the free-tier and Practice
// Pass states for real would also need production accounts on those plans, which
// is a production write. Same three options as verify_modules_density.mjs weighed
// the same way and the same answer: a probe route, written before the run and
// deleted after, never committed, rendering the REAL components.
//
// WHAT THIS DOES AND DOES NOT COVER. The server-side decision -- which plan
// reaches which topic -- is asserted in tests/units.test.ts against allowsTopic,
// the same predicate the page and the /course gate both call. This file covers
// the other half: that a row handed status='gated' renders as something a student
// cannot click, in both themes, at both widths.
//
// THE CONTROL. An assertion that a gated row has no href is worthless if it
// passes on an ungated one too, so every href check runs against BOTH and
// requires them to differ.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { spawn } from 'child_process';

const PROBE_DIR = 'app/um-probe-states';
const PORT = 5120;
const BASE = `http://localhost:${PORT}`;
const PROVE = process.argv.includes('--prove');
const SHOTS = process.env.SHOTS ?? 'scratch-shots';

const probePage = `import CourseBand from '../dashboard/modules/CourseBand';
import UnitSection from '../dashboard/modules/UnitSection';
import TopicListRow from '../dashboard/modules/TopicListRow';
import { DASHBOARD_CSS } from '../dashboard/dashboard-css';
import { unitTitle } from '../lib/units';

// DASHBOARD_CSS is normally supplied by app/dashboard/layout.tsx. This probe sits
// outside /dashboard, and without it .um-dash .um-visually-hidden is undefined
// and the screen-reader sentence inside each unit header renders VISIBLY, which
// is the trap verify_modules_density.mjs documents.
export default async function Probe({ searchParams }) {
  const { theme = 'light', state = 'full' } = await searchParams;
  const gated = state !== 'full';
  return (
    <>
      <style>{DASHBOARD_CSS}</style>
      <div className="um-dash" data-theme={theme} style={{ minHeight: '100dvh', padding: 20, background: 'var(--umd-page-bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 940 }}>
          <CourseBand topicCount={97} unitCount={6} />
          <UnitSection unitNumber={1} unitTitle={unitTitle(1)} topicCount={15} done={12} total={100} defaultOpen>
            <TopicListRow probeAttr="complete" topicId="QR.1.1" topicName="Operations with whole numbers"
              href="/course/tsia2/math/unit/1/topic/QR.1.1" status={gated ? 'gated' : 'complete'}
              estimatedMinutes={40} correct={12} total={12} first />
            <TopicListRow probeAttr="progress" topicId="QR.1.5" topicName="Operations with rational numbers"
              href="/course/tsia2/math/unit/1/topic/QR.1.5" status={gated ? 'gated' : 'in_progress'}
              estimatedMinutes={50} correct={4} total={14} first={false} />
            <TopicListRow probeAttr="idle" topicId="QR.1.6" topicName="Rounding to a given place value"
              href="/course/tsia2/math/unit/1/topic/QR.1.6" status={gated ? 'gated' : 'not_started'}
              estimatedMinutes={40} correct={0} total={0} first={false} />
            {/* The free sample stays open at every tier. */}
            <TopicListRow probeAttr="sample" topicId="AR.1.4" topicName="The free sample topic"
              href="/course/tsia2/math/unit/1/topic/AR.1.4" status="not_started"
              estimatedMinutes={45} correct={0} total={0} first={false} />
            <p style={{ margin: 0, padding: '10px 6px 2px', font: '400 12.5px var(--font-nunito), Nunito, sans-serif', color: 'var(--umd-status-idle)' }}>
              3 more topics in this unit are being written.
            </p>
          </UnitSection>
        </div>
      </div>
    </>
  );
}
`;

// The KaTeX probe: a .um-topic wrapper with real KaTeX markup, to prove the
// scoped rule keeps maths dark on the cream page whatever the global theme says.
const katexPage = `import 'katex/dist/katex.min.css';
export default function KatexProbe() {
  return (
    <div className="um-topic" style={{ minHeight: '100dvh', background: '#E8E0CF', padding: 40 }}>
      <p style={{ color: '#0E0E11', font: '400 17px system-ui' }}>
        Prose stays readable in both themes because it is hardcoded.
      </p>
      <p data-probe="math">
        <span className="katex"><span className="katex-mathml">x</span><span className="katex-html" aria-hidden="true">3/4 + 7/8 = 13/8</span></span>
      </p>
    </div>
  );
}
`;

let server;
const cleanup = () => {
  try { rmSync(PROBE_DIR, { recursive: true, force: true }); } catch {}
  try { rmSync('app/um-probe-katex', { recursive: true, force: true }); } catch {}
  try { if (server) process.kill(-server.pid); } catch {}
};
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(1); });

mkdirSync(PROBE_DIR, { recursive: true });
writeFileSync(`${PROBE_DIR}/page.jsx`, probePage);
mkdirSync('app/um-probe-katex', { recursive: true });
writeFileSync('app/um-probe-katex/page.jsx', katexPage);
mkdirSync(SHOTS, { recursive: true });

console.log('building with the probe routes...');
await new Promise((res, rej) => {
  // Output captured rather than ignored. A build that fails silently here is
  // indistinguishable from a probe that will not compile, and the probe files
  // are deleted on exit, so the evidence goes with them.
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
server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 6000));

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

const browser = await chromium.launch();

for (const theme of ['light', 'dark']) {
  for (const [w, wl] of [[1280, 'desktop'], [390, 'mobile']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 1000 } });
    const p = await ctx.newPage();
    for (const state of ['full', 'gated']) {
      await p.goto(`${BASE}/um-probe-states?theme=${theme}&state=${state}`);
      await p.waitForTimeout(500);
      await p.screenshot({ path: `${SHOTS}/modules-${theme}-${wl}-${state}.png`, fullPage: true });
    }
    await ctx.close();
  }
}

const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

// THE CONTROL PAIR. Ungated and gated, same component, same run.
await page.goto(`${BASE}/um-probe-states?state=full`);
const openHref = await page.getAttribute('[data-probe-topic="progress"]', 'href');
const openTag = await page.evaluate(() => document.querySelector('[data-probe-topic="progress"]').tagName);
await page.goto(`${BASE}/um-probe-states?state=gated`);
const gatedHref = await page.getAttribute('[data-probe-topic="progress"]', 'href');
const gatedTag = await page.evaluate(() => document.querySelector('[data-probe-topic="progress"]').tagName);

await check('CONTROL: an ungated row IS a link with an href', () => openTag === 'A' && !!openHref);
await check('a gated row is not an anchor', () => gatedTag !== 'A');
await check('a gated row emits no href at all', () => gatedHref === null);
await check('the two differ, so the check is measuring something', () => openTag !== gatedTag);
// One selector, not a fallback pair. The first version queried a
// data-probe-topic that this probe never renders, and getAttribute WAITS for a
// missing selector rather than returning null, so it timed out at 30s before the
// || could reach the working half. A check that hangs is not a check that fails.
await check('a gated row is announced as disabled', async () =>
  (await page.getAttribute('[data-probe-topic="progress"]', 'aria-disabled')) === 'true');
await check('a gated row is not keyboard focusable', async () =>
  await page.evaluate(() => {
    const el = document.querySelector('[data-probe-topic="progress"]');
    el.focus?.();
    return document.activeElement !== el;
  }));
await check('the free sample stays a working link while the rest is gated', async () =>
  (await page.getAttribute('[data-probe-topic="sample"]', 'href')) !== null &&
  (await page.evaluate(() => document.querySelector('[data-probe-topic="sample"]').tagName)) === 'A');
await check('the course band states no progress', async () => {
  const t = await page.textContent('section');
  return !/%/.test(t) && !/\d+\s*\/\s*\d+/.test(t);
});
// The unit's own h2, not the first on the page: CourseBand renders "TSIA2 Math"
// in an h2 above it, which is what the first version was reading.
await check('the unit header names the unit', async () =>
  (await page.textContent('h2:has(button)')).includes('Number Sense and Quantitative Foundations'));
await check('the unwritten-topics line renders', async () =>
  (await page.textContent('body')).includes('3 more topics in this unit are being written.'));

// KaTeX, in the theme that used to break it.
for (const theme of ['light', 'dark']) {
  const kctx = await browser.newContext({ viewport: { width: 900, height: 600 } });
  const kp = await kctx.newPage();
  await kp.goto(`${BASE}/um-probe-katex`);
  await kp.evaluate((t) => localStorage.setItem('ec-theme', t), theme);
  await kp.goto(`${BASE}/um-probe-katex`);
  await kp.waitForTimeout(600);
  const colour = await kp.evaluate(() => getComputedStyle(document.querySelector('.katex')).color);
  await check(`KaTeX stays dark ink in ${theme} (got ${colour})`, () => colour === 'rgb(14, 14, 17)');
  await kp.screenshot({ path: `${SHOTS}/katex-${theme}.png` });
  await kctx.close();
}

await browser.close();
console.log(failed === 0 ? '\nall checks passed' : `\n${failed} check(s) failed`);
if (PROVE) {
  console.log(failed > 0 ? 'PROVE: failed as intended, the checks read the real page'
                         : 'PROVE: nothing failed, these checks cannot fail. Fix them.');
  process.exit(failed > 0 ? 0 : 1);
}
process.exit(failed === 0 ? 0 : 1);
