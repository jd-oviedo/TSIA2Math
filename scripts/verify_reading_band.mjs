// verify_reading_band.mjs -- prove the reading band paints, and prove it has not
// become the thing that breaks the completion gate.
//
//   npx next build && npx next start -p 3110
//   node scripts/verify_reading_band.mjs --base http://localhost:3110
//   node scripts/verify_reading_band.mjs --base http://localhost:3110 --prove
//
// THE ASSERTION THIS FILE EXISTS FOR
// ----------------------------------
// The band must not become a scroll container. The completion sentinel is
// observed with NO root, so intersection is computed against the viewport; if
// the notes scroll INSIDE the band, the sentinel can be scrolled past without the
// viewport ever seeing it. The gate then never opens and the student cannot
// leave the lesson.
//
// The precise condition, measured rather than assumed: `overflow: hidden` alone
// does NOT do it. Without a height constraint the element grows to fit its
// content, nothing scrolls inside, and the gate is unharmed. It takes overflow
// AND a height. Both checks below are kept anyway -- the declaration one is a
// cheap guard that fires before the behaviour does.
//
// That property is not hypothetical. The design's own mockup carries
// `overflow:hidden` on exactly this element -- a device for clipping a static
// 1060px-tall card, not a spec -- so it is the single most likely thing for
// someone to copy in later while "matching the design".
//
// So this checks the mechanism directly: that the page scrolls at the DOCUMENT
// and that the band is not scrollable, rather than only checking that the gate
// happens to work today.
//
// verify_lesson_outline still owns the gate's own assertions -- shut at the foot
// of section one, sentinel after the last card. Both are re-run on this branch
// and neither moved; they sit above the wrapper this PR adds.

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = baseIdx >= 0 && args[baseIdx + 1] ? args[baseIdx + 1] : 'http://localhost:3110';
const PROVE = args.includes('--prove');

const TOPIC = { unit: '0', id: 'AR.1.4' };
const LESSON = `${BASE}/course/tsia2/math/unit/${TOPIC.unit}/topic/${TOPIC.id}/lesson`;

// C.band #F3EFE3 and C.cream #E8E0CF, as the browser reports them.
const BAND = 'rgb(243, 239, 227)';
const CREAM = 'rgb(232, 224, 207)';

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

console.log(`reading band: ${LESSON}  (${PROVE ? 'PROVE, faulted expectations' : 'real'})`);
await page.goto(LESSON, { waitUntil: 'domcontentloaded' });

const readBand = () =>
  page.evaluate(() => {
    const band = document.querySelector('.um-lesson-column');
    const measure = document.querySelector('.um-lesson-measure');
    const rail = document.querySelector('.um-lesson-rail');
    if (!band) return null;
    const cs = getComputedStyle(band);
    const b = band.getBoundingClientRect();
    return {
      background: cs.backgroundColor,
      overflowX: cs.overflowX,
      overflowY: cs.overflowY,
      // A scroll container reports more content than box. On a correct band
      // these are equal, because it clips nothing and scrolls nothing.
      scrollsInside: band.scrollHeight > band.clientHeight + 1,
      width: Math.round(b.width),
      measureWidth: measure ? Math.round(measure.getBoundingClientRect().width) : null,
      // The rail must be OUTSIDE the band: a sibling, not a descendant.
      railInsideBand: rail ? band.contains(rail) : null,
      railBackground: rail ? getComputedStyle(rail).backgroundColor : null,
    };
  });

// ── IT PAINTS, AND IT FILLS ─────────────────────────────────────────────────
await check('the band is painted C.band, not left on the page cream', async () => {
  const b = await readBand();
  const ok = b !== null && b.background === BAND;
  if (!PROVE && !ok) console.log(`        background ${b?.background}, expected ${BAND}`);
  return PROVE ? !ok : ok;
});

await check('it fills past the measure rather than being a stripe', async () => {
  const b = await readBand();
  if (!b) return PROVE;
  // The whole reason for the wrapper: if band width equals measure width, the
  // cap is still on the painted element and this is the stripe it replaced.
  const ok = b.measureWidth !== null && b.width > b.measureWidth;
  if (!PROVE && !ok) console.log(`        band ${b.width}px, measure ${b.measureWidth}px`);
  return PROVE ? !ok : ok;
});

await check('the rail sits outside the band, on its own surface', async () => {
  const b = await readBand();
  if (!b) return PROVE;
  const ok = b.railInsideBand === false && b.railBackground !== b.background;
  if (!PROVE && !ok) {
    console.log(`        inside=${b.railInsideBand} railBg=${b.railBackground} bandBg=${b.background}`);
  }
  return PROVE ? !ok : ok;
});

// ── AND IT IS NOT A SCROLL CONTAINER ────────────────────────────────────────
await check('the band declares no overflow of its own', async () => {
  const b = await readBand();
  if (!b) return PROVE;
  const ok = b.overflowX === 'visible' && b.overflowY === 'visible';
  if (!PROVE && !ok) console.log(`        overflow ${b.overflowX} / ${b.overflowY}`);
  return PROVE ? !ok : ok;
});

await check('nothing scrolls inside the band', async () => {
  const b = await readBand();
  if (!b) return PROVE;
  return PROVE ? b.scrollsInside : !b.scrollsInside;
});

// The behavioural half. The two above read declarations; this reads what
// actually happens when the page is scrolled, which is what the sentinel cares
// about.
await check('the page scrolls at the document, not inside the band', async () => {
  const before = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(150);
  const state = await page.evaluate(() => {
    const band = document.querySelector('.um-lesson-column');
    return {
      documentMoved: window.scrollY,
      documentScrollable: document.documentElement.scrollHeight > window.innerHeight,
      bandScrollTop: band ? band.scrollTop : null,
    };
  });
  const ok =
    state.documentScrollable &&
    state.documentMoved > before &&
    // A band that had become the scroller would take the scroll instead.
    state.bandScrollTop === 0;
  if (!PROVE && !ok) console.log(`        ${JSON.stringify(state)}`);
  return PROVE ? !ok : ok;
});

// And the consequence, end to end: the gate still opens. This is the thing the
// checks above exist to protect, asserted directly so a clipping ancestor cannot
// pass them all and still strand the student.
await check('the completion gate still opens at the end of the notes', async () => {
  await page.goto(LESSON, { waitUntil: 'domcontentloaded' });
  const handoff = page.locator('section[aria-labelledby="lesson-handoff-heading"]');
  for (let i = 0; i < 40; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    if (await handoff.count()) break;
    await page.waitForTimeout(200);
  }
  const visible = await handoff.isVisible().catch(() => false);
  return PROVE ? !visible : visible;
});

// ── 360px ───────────────────────────────────────────────────────────────────
await check('at 360px the band is inset by the page padding, not edge to edge', async () => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto(LESSON, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(150);
  const state = await page.evaluate(() => {
    const band = document.querySelector('.um-lesson-column');
    const b = band.getBoundingClientRect();
    return {
      background: getComputedStyle(band).backgroundColor,
      left: Math.round(b.left),
      right: Math.round(window.innerWidth - b.right),
      overflows: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });
  // .um-page drops to 16px side padding at this width and keeps it: the band is
  // inset by it rather than zeroing it, which would reach all four topic routes.
  const ok =
    state.background === BAND &&
    state.left >= 14 &&
    state.left <= 18 &&
    state.right >= 14 &&
    state.right <= 18 &&
    !state.overflows;
  if (!PROVE && !ok) console.log(`        ${JSON.stringify(state)}`);
  return PROVE ? !ok : ok;
});

await check('and the page behind it is still cream', async () => {
  const pageBg = await page.evaluate(
    () => getComputedStyle(document.querySelector('.um-topic')).backgroundColor
  );
  const ok = pageBg === CREAM;
  if (!PROVE && !ok) console.log(`        page ${pageBg}, expected ${CREAM}`);
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
