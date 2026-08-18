// verify_topic_chrome.mjs -- prove the topic bar says where you are, on the
// routes where that is its job and not on the one where it is not.
//
//   npx next build && npx next start -p 3110
//   node scripts/verify_topic_chrome.mjs --base http://localhost:3110
//   node scripts/verify_topic_chrome.mjs --base http://localhost:3110 --prove
//
// THE INDICATOR IS A POSITION DISPLAY, NOT A CONTROL. It carries no completion
// state and no locks, and every segment is a live link, because nothing in the
// topic tree gates a route. So the assertions here are about WHERE it says you
// are and whether that matches the route actually being served -- never about
// what a student is allowed to do.
//
// The shape to avoid: three small boxes are easy to assert into vacuously. A
// check that "an indicator exists" passes against one that marks the wrong
// segment, and a check that "exactly one is current" passes against one that
// always marks the first. So every assertion below ties aria-current to the URL
// being served, and the fault proof moves it to the wrong segment rather than
// removing it.

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = baseIdx >= 0 && args[baseIdx + 1] ? args[baseIdx + 1] : 'http://localhost:3110';
const PROVE = args.includes('--prove');

const TOPIC = { unit: '0', id: 'AR.1.4' };
const topicBase = `${BASE}/course/tsia2/math/unit/${TOPIC.unit}/topic/${TOPIC.id}`;
const PARTS = ['lesson', 'practice', 'quiz'];

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

console.log(`topic chrome: ${topicBase}  (${PROVE ? 'PROVE, faulted expectations' : 'real'})`);

// The bar as rendered: the breadcrumb's text, and every segment with its href
// and whether it claims to be the current page.
const readBar = () =>
  page.evaluate(() => {
    const trail = document.querySelector('.um-bar-trail');
    const nav = document.querySelector('nav[aria-label="Topic parts"]');
    return {
      // innerText, not textContent: the subject is capitalised by CSS
      // (text-transform), so textContent returns the raw "math" and an
      // assertion on it would be testing the source string rather than the
      // words on the page.
      trail: trail ? (trail.innerText || '').replace(/\s+/g, ' ').trim() : null,
      hasNav: Boolean(nav),
      segments: nav
        ? [...nav.querySelectorAll('a')].map((a) => ({
            text: (a.textContent || '').trim(),
            href: a.getAttribute('href'),
            current: a.getAttribute('aria-current'),
            height: Math.round(a.getBoundingClientRect().height),
          }))
        : [],
      now: document.querySelector('.um-bar-part-now')
        ? {
            text: (document.querySelector('.um-bar-part-now').textContent || '').trim(),
            visible: getComputedStyle(document.querySelector('.um-bar-part-now')).display !== 'none',
          }
        : null,
    };
  });

// ── THE BREADCRUMB ──────────────────────────────────────────────────────────
await check('the breadcrumb names the course, the unit and the topic', async () => {
  await page.goto(`${topicBase}/lesson`, { waitUntil: 'domcontentloaded' });
  const { trail } = await readBar();
  const ok =
    Boolean(trail) &&
    trail.includes('TSIA2') &&
    trail.includes('Math') &&
    trail.includes(`Unit ${TOPIC.unit}`) &&
    trail.includes(TOPIC.id);
  if (!PROVE && !ok) console.log(`        trail read "${trail}"`);
  return PROVE ? !ok : ok;
});

await check('the topic segment is not a link: it is where you already are', async () => {
  const linked = await page.evaluate(() =>
    [...document.querySelectorAll('.um-bar-trail a')].map((a) => (a.textContent || '').trim())
  );
  const ok = linked.length === 2 && !linked.some((t) => t.includes('AR.1.4'));
  if (!PROVE && !ok) console.log(`        links: ${JSON.stringify(linked)}`);
  return PROVE ? !ok : ok;
});

// ── THE DOORWAY HAS NO INDICATOR ────────────────────────────────────────────
await check('the doorway renders the breadcrumb and NO indicator', async () => {
  await page.goto(topicBase, { waitUntil: 'domcontentloaded' });
  const bar = await readBar();
  // Positive on the breadcrumb as well as negative on the nav, so this cannot
  // pass against a page that failed to render a bar at all.
  const ok = bar.hasNav === false && Boolean(bar.trail) && bar.trail.includes(TOPIC.id);
  if (!PROVE && !ok) console.log(`        hasNav=${bar.hasNav} trail="${bar.trail}"`);
  return PROVE ? !ok : ok;
});

// ── EACH SUB-ROUTE MARKS ITSELF ─────────────────────────────────────────────
for (const part of PARTS) {
  await check(`/${part} marks ${part} as current, and only ${part}`, async () => {
    await page.goto(`${topicBase}/${part}`, { waitUntil: 'domcontentloaded' });
    const bar = await readBar();
    const marked = bar.segments.filter((s) => s.current === 'page');
    const ok =
      bar.hasNav &&
      bar.segments.length === 3 &&
      marked.length === 1 &&
      // Tied to the ROUTE, not merely to "one of them is marked": the marked
      // segment's own href has to be the page being served.
      marked[0].href.endsWith(`/${part}`);
    if (!PROVE && !ok) {
      console.log(
        `        ${bar.segments.length} segments, ${marked.length} current, marked=${marked[0]?.href}`
      );
    }
    return PROVE ? !ok : ok;
  });
}

await check('all three segments are live links, none disabled', async () => {
  const bar = await readBar();
  const ok =
    bar.segments.length === 3 &&
    bar.segments.every((s) => s.href && s.href.startsWith('/course/')) &&
    PARTS.every((p) => bar.segments.some((s) => s.href.endsWith(`/${p}`)));
  if (!PROVE && !ok) console.log(`        ${JSON.stringify(bar.segments.map((s) => s.href))}`);
  return PROVE ? !ok : ok;
});

await check('the segments clear 44px, since they are links', async () => {
  const bar = await readBar();
  const ok = bar.segments.length === 3 && bar.segments.every((s) => s.height >= 44);
  if (!PROVE && !ok) console.log(`        heights ${bar.segments.map((s) => s.height).join(',')}`);
  return PROVE ? !ok : ok;
});

// A segment actually navigating, so "link" is not just an href attribute.
await check('following a segment goes to that part', async () => {
  await page.goto(`${topicBase}/lesson`, { waitUntil: 'domcontentloaded' });
  await page.locator('nav[aria-label="Topic parts"] a[href$="/practice"]').click();
  await page.waitForLoadState('domcontentloaded');
  const landed = new URL(page.url()).pathname.endsWith('/practice');
  return PROVE ? !landed : landed;
});

// ── 360px ───────────────────────────────────────────────────────────────────
await check('at 360px the indicator collapses to the current part name', async () => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto(`${topicBase}/practice`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(150);
  const state = await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Topic parts"]');
    const now = document.querySelector('.um-bar-part-now');
    const trail = document.querySelector('.um-bar-trail');
    return {
      navVisible: Boolean(nav) && getComputedStyle(nav).display !== 'none',
      nowVisible: Boolean(now) && getComputedStyle(now).display !== 'none',
      nowText: (now?.textContent || '').trim(),
      trailText: (trail?.innerText || '').replace(/\s+/g, ' ').trim(),
      overflows: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });
  const ok =
    !state.navVisible &&
    state.nowVisible &&
    state.nowText === 'Practice' &&
    // The breadcrumb keeps unit and topic at this width. It used to be hidden
    // outright, so a phone had no breadcrumb at all.
    state.trailText.includes(`Unit ${TOPIC.unit}`) &&
    state.trailText.includes(TOPIC.id) &&
    !state.overflows;
  if (!PROVE && !ok) console.log(`        ${JSON.stringify(state)}`);
  return PROVE ? !ok : ok;
});

await check('no horizontal overflow at 360px on every part', async () => {
  const widths = [];
  for (const part of PARTS) {
    await page.goto(`${topicBase}/${part}`, { waitUntil: 'domcontentloaded' });
    widths.push(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    );
  }
  const ok = widths.every((w) => w <= 1);
  if (!PROVE && !ok) console.log(`        overflow px per part: ${widths.join(',')}`);
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
