// verify_modules_density.mjs -- prove the Modules page still fits six collapsed
// units on a 360px phone after the density change, and that the new bands did
// not push them off screen.
//
//   node scripts/verify_modules_density.mjs
//   node scripts/verify_modules_density.mjs --prove
//
// WHY A PROBE ROUTE
// -----------------
// /dashboard/modules redirects to /login without a session, so Playwright cannot
// reach the real page. Same three options as PR #117 weighed the same way, and
// the same answer: a probe route, written before the run and deleted after,
// never committed, rendering the REAL components with fixture data.
//
// The claim being defended, from PR #117, is that all six units are visible at
// 360px without scrolling. That claim has never had a check: the existing
// collapsible probe renders two synthetic units and asserts semantics, not
// layout. This adds the missing one, because a course band and a resume card
// were just put above the unit list and that is precisely what could break it.
//
// The unit counts below are the real ones, 14/15/15/16/20/17 = 97. Nothing from
// the design mockup, which invented its own.
//
// THE CONTROL
// -----------
// A fit assertion that always passes is worthless, so the same measurement runs
// against a deliberately loosened variant with the pre-change spacing restored
// and larger bands. If six units fit there too, this is not measuring density.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { execSync, spawn } from 'child_process';

const PROBE_DIR = 'app/um-probe-density';
const PORT = 5110;
const BASE = `http://localhost:${PORT}`;
const PROVE = process.argv.includes('--prove');

// Real unit sizes. The topic rows themselves are irrelevant to this measurement
// because every unit renders collapsed, which is the state being defended.
// DASHBOARD_CSS must be injected here. It is normally supplied by
// app/dashboard/layout.tsx, and this probe sits outside /dashboard, so without
// it `.um-dash .um-visually-hidden` is undefined and the screen-reader sentence
// inside each unit header RENDERS VISIBLY. That inflated every header from 52px
// to 128px on the first run of this script and made the page look like it had
// broken the 360px budget when it had not.
//
// Worth knowing beyond this file: the PR #117 probe has the same gap and its
// "touch target clears 44px" assertion has been passing against a 128px header
// ever since, because 128 >= 44.
const probePage = `import CourseBand from '../dashboard/modules/CourseBand';
import ResumeCard from '../dashboard/modules/ResumeCard';
import UnitSection from '../dashboard/modules/UnitSection';
import { DASHBOARD_CSS } from '../dashboard/dashboard-css';

const UNITS = [
  { n: 0, topics: 14 },
  { n: 1, topics: 15 },
  { n: 2, topics: 15 },
  { n: 3, topics: 16 },
  { n: 4, topics: 20 },
  { n: 5, topics: 17 },
];

export default function ProbePage() {
  return (
    <main className="um-dash" style={{ padding: 16 }}>
      <style>{DASHBOARD_CSS}</style>
      <div data-probe="real" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <CourseBand topicCount={97} unitCount={6} done={214} total={1348} />
        <ResumeCard
          topicId="QR.1.5"
          topicName="Operations with rational numbers (signed numbers, decimals)"
          unitNumber={0}
          href="/course/tsia2/math/unit/0/topic/QR.1.5/practice"
          label="Carry on with practice"
        />
        {UNITS.map((u) => (
          <UnitSection
            key={u.n}
            unitNumber={u.n}
            topicCount={u.topics}
            done={12}
            total={100}
            defaultOpen={false}
          >
            <a data-probe-topic={\`\${u.n}-1\`} href="/course/tsia2/math/unit/0/topic/T1">Topic</a>
          </UnitSection>
        ))}
      </div>
    </main>
  );
}
`;

function writeProbe() {
  mkdirSync(PROBE_DIR, { recursive: true });
  writeFileSync(`${PROBE_DIR}/page.tsx`, probePage);
}
function removeProbe() {
  if (existsSync(PROBE_DIR)) rmSync(PROBE_DIR, { recursive: true, force: true });
}

let failed = 0;
const check = (name, pass, detail = '') => {
  if (!pass) failed++;
  console.log(`  ${pass ? 'pass' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

process.on('exit', removeProbe);
process.on('SIGINT', () => { removeProbe(); process.exit(1); });

writeProbe();
console.log('probe route written, building...\n');
execSync('npx next build', { stdio: 'ignore' });
const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  stdio: 'ignore',
  detached: true,
});
await new Promise((r) => setTimeout(r, 9000));

const browser = await chromium.launch();
try {
  // 360x780: the low end of the viewports this product targets, same as the
  // collapsible probe.
  const page = await browser.newPage({ viewport: { width: 360, height: 780 } });
  const resp = await page.goto(`${BASE}/um-probe-density`, { waitUntil: 'networkidle' });
  check('probe route reachable', resp.status() === 200, `status ${resp.status()}`);

  const toggles = page.locator('button[data-unit]');
  check('all six units render a header', (await toggles.count()) === 6, `${await toggles.count()}`);

  // Every unit header must be VISIBLE, not merely in the DOM.
  let allVisible = true;
  for (let i = 0; i < 6; i++) allVisible &&= await toggles.nth(i).isVisible();
  check('every unit header is visible', allVisible);

  // The measurement that matters: the bottom of the LAST unit header, against
  // the viewport height. Read from the layout rather than from a scroll flag,
  // so the failure message says by how much.
  const geo = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button[data-unit]')];
    const last = btns[btns.length - 1].getBoundingClientRect();
    const heights = btns.map((b) => Math.round(b.getBoundingClientRect().height));
    return {
      lastBottom: Math.round(last.bottom),
      viewport: window.innerHeight,
      minHeaderHeight: Math.min(...heights),
      docScroll: document.documentElement.scrollHeight,
      docClient: document.documentElement.clientHeight,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  const budget = PROVE ? 0 : geo.viewport;
  check(
    'all six unit headers fit above the fold at 360x780',
    geo.lastBottom <= budget,
    `last header bottom ${geo.lastBottom}px, viewport ${geo.viewport}px`
  );

  check(
    'the page does not scroll vertically with every unit collapsed',
    geo.docScroll <= geo.docClient + (PROVE ? -1 : 1),
    `scrollHeight ${geo.docScroll}, clientHeight ${geo.docClient}`
  );

  check(
    'unit headers still clear 44px',
    geo.minHeaderHeight >= (PROVE ? 999 : 44),
    `smallest ${geo.minHeaderHeight}px`
  );

  check('no horizontal overflow at 360px', geo.overflowX <= (PROVE ? -1 : 1), `${geo.overflowX}px`);

  // The resume action has to be a real, tappable link.
  const resumeLink = page.locator('a.um-resume-action');
  const resumeBox = (await resumeLink.isVisible()) ? await resumeLink.boundingBox() : null;
  check(
    'the resume action is visible and clears 44px',
    resumeBox !== null && resumeBox.height >= (PROVE ? 999 : 44),
    resumeBox ? `${Math.round(resumeBox.height)}px` : 'not visible'
  );

  // ── THE CONTROL ────────────────────────────────────────────────────────────
  // Loosen the layout back toward the pre-change spacing and re-measure. If six
  // units still fit, the assertion above is not measuring density and proves
  // nothing.
  console.log('\n  CONTROL, the same measurement against a deliberately loosened layout:');
  const loosened = await page.evaluate(() => {
    const wrap = document.querySelector('[data-probe="real"]');
    wrap.style.gap = '28px';
    for (const b of document.querySelectorAll('button[data-unit]')) {
      b.style.minHeight = '96px';
    }
    const btns = [...document.querySelectorAll('button[data-unit]')];
    return {
      lastBottom: Math.round(btns[btns.length - 1].getBoundingClientRect().bottom),
      viewport: window.innerHeight,
    };
  });
  const controlFits = loosened.lastBottom <= loosened.viewport;
  check(
    'CONTROL: a loosened layout does NOT fit, so the fit check discriminates',
    !controlFits,
    `last header bottom ${loosened.lastBottom}px, viewport ${loosened.viewport}px`
  );
} finally {
  await browser.close();
  try { process.kill(-server.pid); } catch { /* already gone */ }
  removeProbe();
}

console.log(failed === 0 ? '\nall checks passed' : `\n${failed} check(s) failed`);
if (PROVE) {
  console.log(
    failed > 0
      ? 'PROVE: checks failed as intended, so they are reading the real layout'
      : 'PROVE: nothing failed, which means these checks cannot fail. Fix them.'
  );
  process.exit(failed > 0 ? 0 : 1);
}
process.exit(failed === 0 ? 0 : 1);
