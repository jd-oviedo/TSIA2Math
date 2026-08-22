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
// The claim being defended, from PR #117, WAS that all six units are visible at
// 360px without scrolling. That claim has never had a check: the existing
// collapsible probe renders two synthetic units and asserts semantics, not
// layout. This adds the missing one, because a course band and a resume card
// were just put above the unit list and that is precisely what could break it.
//
// THE FOLD MOVED, 2026-08-21. READ THIS BEFORE TIGHTENING IT BACK.
// -----------------------------------------------------------------
// Unit titles now render beside the unit number, and at 360px the long ones wrap
// to a second line. Measured here, both layouts, same probe:
//
//   one line, ellipsis   last header bottom 621px   fits the old budget
//                        and clips "Number Sense and Quantitative Foundations"
//                        to "Num..." at 390px
//   wrapped, two lines   last header bottom 836px   overflows 780px by 56px
//                        every title readable in full at every width
//
// Juan chose the wrap on 2026-08-21, on the ground that clipping removes exactly
// the words that tell one unit from another, which makes a visible title the
// requirement and the single-viewport fold the thing that gives. So the budget
// below is a stated constant rather than the viewport height, and this file no
// longer defends "no scrolling".
//
// WHAT IT DEFENDS INSTEAD: that the collapsed list still costs at most one short
// scroll to reach unit 5, and that it cannot grow further without failing. The
// headroom is deliberately smaller than one more unit header, so a seventh unit
// trips both checks while a title gaining a word does not. Not asserted,
// measured: a seventh unit was added to the fixture on 2026-08-21 and the run
// gave last header bottom 900px against the 880px budget and 136px of overflow
// against the 96px one, failing both. Widening these constants to admit that
// seventh unit is a design decision and belongs with Juan, not in a green run.
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
import { onTeardown, killServer, clearNextTypes } from './harness-teardown.mjs';

const PROBE_DIR = 'app/um-probe-density';
const PORT = 5110;
const BASE = `http://localhost:${PORT}`;
const PROVE = process.argv.includes('--prove');

// The moved fold. Both numbers are measurements plus stated headroom, and the
// reasoning for each is in the header block above.
const FOLD_BUDGET = 880; // measured 836, plus 44px -- one touch target of slack
const SCROLL_BUDGET = 96; // measured 72px of overflow, plus ~24px, one title line

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
import { unitTitle } from '../lib/units';
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
        {/* Course progress is back, as TOPICS. The 2026-08-21 removal was of a
            whole-course QUESTION denominator, which never visibly moved; 0f1f969
            re-added the band's bar over 97 topics, where one finished topic is a
            full point, and made completedTopics required. Passing it is not
            decoration here: without it this probe stopped compiling, which is
            why the build below had been failing TS2741. The per-unit bars are
            still the ones this probe measures for density. */}
        <CourseBand topicCount={97} unitCount={6} completedTopics={18} />
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
            unitTitle={unitTitle(u.n)}
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

// Registered before the probe is written, so an early failure cannot leave the
// probe route or its generated types behind.
onTeardown(removeProbe);
onTeardown(clearNextTypes);

writeProbe();
console.log('probe route written, building...\n');
execSync('npx next build', { stdio: 'ignore' });
const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  stdio: 'ignore',
  detached: true,
});
// Registered IMMEDIATELY after spawn, so a throw before the try/finally below
// cannot leak the server and hold the port against the next run.
onTeardown(() => killServer(server));
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

  const budget = PROVE ? 0 : FOLD_BUDGET;
  check(
    `all six unit headers land within ${FOLD_BUDGET}px at 360x780`,
    geo.lastBottom <= budget,
    `last header bottom ${geo.lastBottom}px, budget ${budget}px, viewport ${geo.viewport}px`
  );

  check(
    `the collapsed list costs at most ${SCROLL_BUDGET}px of scroll`,
    geo.docScroll - geo.docClient <= (PROVE ? -1 : SCROLL_BUDGET),
    `scrollHeight ${geo.docScroll}, clientHeight ${geo.docClient}, overflow ${geo.docScroll - geo.docClient}px`
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
  // Measured against FOLD_BUDGET, not the viewport. The control has to face the
  // same threshold the real check does, or it proves the old budget still
  // discriminates while saying nothing about the new one.
  const controlFits = loosened.lastBottom <= FOLD_BUDGET;
  check(
    'CONTROL: a loosened layout does NOT fit, so the fit check discriminates',
    !controlFits,
    `last header bottom ${loosened.lastBottom}px, budget ${FOLD_BUDGET}px`
  );
} finally {
  await browser.close();
  killServer(server);
  removeProbe();
  clearNextTypes();
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
