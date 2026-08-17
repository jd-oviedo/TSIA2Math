// verify_topic_overview.mjs -- prove the topic doorway renders and is usable,
// in a real browser, against the real route.
//
//   npx next build && npx next start -p 3110
//   node scripts/verify_topic_overview.mjs --base http://localhost:3110
//   node scripts/verify_topic_overview.mjs --base http://localhost:3110 --prove
//
// WHY THIS ROUTE NEEDS NO PROBE AND NO ACCOUNT
// --------------------------------------------
// Unlike /dashboard/modules, the topic tree is reachable signed out: the bare
// topic URL returns 200 to anyone. So this drives the real page at its real
// address, with hydration, which is what isVisible() and click() require.
//
// What that does NOT cover is stated plainly rather than left to be assumed:
// signed out there is no session, so loadTopicGates returns the zero state and
// every part reads "not started". The authenticated branch -- a part marked
// complete, a threshold partly met, resume pointing at practice -- is not
// exercised here and cannot be until there is a test account. The gate maths
// itself is covered as a pure function in tests/topic-parts.test.ts, which is
// where the states live; this check is about the page being real.
//
// VISIBILITY, NOT PRESENCE
// ------------------------
// Every assertion below is isVisible() or a real click that has to navigate.
// querySelectorAll and locator().count() both return elements a user can never
// reach, so a presence check here would pass on a page that renders nothing.
//
// --prove faults the page's own expectations so the checks are shown failing
// before any of them is trusted.

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
// Guard the absent flag rather than doing arithmetic on -1. indexOf returns -1
// when the flag is missing, and -1 + 1 is 0, which would silently read the
// first argument as the value.
const BASE = baseIdx >= 0 && args[baseIdx + 1] ? args[baseIdx + 1] : 'http://localhost:3110';
const PROVE = args.includes('--prove');

const TOPIC = args.find((a) => /^[A-Z]{2}\.\d/.test(a)) ?? 'QR.1.5';
const PAGE_URL = `${BASE}/course/tsia2/math/unit/0/topic/${TOPIC}`;

let failed = 0;
const check = async (label, fn) => {
  try {
    const ok = await fn();
    if (ok) {
      console.log(`  pass  ${label}`);
    } else {
      console.log(`  FAIL  ${label}`);
      failed++;
    }
  } catch (err) {
    console.log(`  FAIL  ${label} -- ${err.message.split('\n')[0]}`);
    failed++;
  }
};

const browser = await chromium.launch();
// Phone first. 390px is the wide end of the target range and the narrow end of
// what a low-end Android reports.
const context = await browser.newContext({ viewport: { width: 390, height: 780 } });
const page = await context.newPage();

console.log(`topic overview: ${PAGE_URL}  (${PROVE ? 'PROVE, faulted expectations' : 'real'})`);

const res = await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

await check('the bare topic URL renders rather than redirecting to a part', () => {
  const path = new URL(page.url()).pathname;
  const wanted = PROVE ? path.endsWith('/lesson') : !/\/(lesson|practice|quiz)$/.test(path);
  return res.status() === 200 && wanted;
});

// The three parts, each asserted VISIBLE by its own heading.
for (const title of ['Guided notes', 'Practice', 'Mini quiz']) {
  const wanted = PROVE ? `${title} (this string is not on the page)` : title;
  await check(`"${wanted}" is visible`, () =>
    page.getByText(wanted, { exact: true }).first().isVisible()
  );
}

// The step sequence has to be a real ordered list, not three divs, so the order
// is carried by the markup and not only by how it looks.
await check('the parts are an ordered list of three items', async () => {
  const items = page.locator('ol > li');
  const n = await items.count();
  return n === (PROVE ? 99 : 3);
});

// The primary action: visible, big enough to tap, and it actually goes
// somewhere. A disabled or decorative element passes a presence check and fails
// this one.
await check('the primary action is visible and at least 44px tall', async () => {
  const btn = page.locator('a.um-primary').first();
  if (!(await btn.isVisible())) return false;
  const box = await btn.boundingBox();
  return box !== null && box.height >= (PROVE ? 999 : 44);
});

await check('the primary action navigates into a part of the topic', async () => {
  await page.locator('a.um-primary').first().click();
  await page.waitForLoadState('domcontentloaded');
  const path = new URL(page.url()).pathname;
  return PROVE ? path.endsWith(`/topic/${TOPIC}`) : /\/(lesson|practice|quiz)$/.test(path);
});

// Nothing on this surface may claim a part is shut, because no route enforces
// that. This is the assertion that would catch the design's locked state being
// translated literally.
await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
await check('no part is presented as locked', async () => {
  // innerText drops hidden text; textContent would not, and a claim a student
  // cannot see is not a claim this check is about.
  const text = (await page.locator('body').innerText()).toLowerCase();
  const hits = ['locked', 'opens when', 'unlock to', 'complete practice to'].filter((s) =>
    text.includes(s)
  );
  return PROVE ? hits.length > 0 : hits.length === 0;
});

// The page must not scroll sideways on a phone.
await check('no horizontal overflow at 390px', async () => {
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  return PROVE ? over > 100 : over <= 1;
});

await browser.close();

console.log(failed === 0 ? '\nall checks passed' : `\n${failed} check(s) failed`);
// Under --prove the faulted expectations are meant to fail, so a run that
// reports zero failures means the checks are not reading the page at all.
if (PROVE) {
  console.log(
    failed > 0
      ? 'PROVE: checks failed as intended, so they are reading the real page'
      : 'PROVE: nothing failed, which means these checks cannot fail. Fix them.'
  );
  process.exit(failed > 0 ? 0 : 1);
}
process.exit(failed === 0 ? 0 : 1);
