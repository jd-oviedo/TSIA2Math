// verify_lesson_outline.mjs -- prove the guided notes split into their authored
// sections without moving the completion gate, and that the outline stayed the
// static list it was scoped to be.
//
//   npx next build && npx next start -p 3110
//   node scripts/verify_lesson_outline.mjs --base http://localhost:3110
//   node scripts/verify_lesson_outline.mjs --base http://localhost:3110 --prove
//
// Runs against AR.1.4, chosen by measurement rather than convenience: 10
// sections, the most in unit 0, and a 59-character heading, the longest in the
// course. A topic with four short sections would let a broken clamp and a
// sentinel that fires early both pass.
//
// THE ASSERTION THIS FILE EXISTS FOR
// ----------------------------------
// The gate must still open on "read to the end of ALL the notes", not "reached
// the end of the first section". Ten cards where there was one is exactly the
// change that could move it, and a check that only scrolls to the bottom of the
// page would pass against a sentinel sitting after card one. So the gate is
// asserted SHUT at the foot of section one first, and only then opened.
//
// THE SECOND THING IT PINS
// ------------------------
// What the outline is NOT. No ids, no anchors, no jump links, no current-section
// marker: those are the first half of section-level resume, which was deferred
// on purpose, and the cheapest way for them to arrive is by someone adding "just
// the highlight" later. The checks below fail if they do.

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = baseIdx >= 0 && args[baseIdx + 1] ? args[baseIdx + 1] : 'http://localhost:3110';
const PROVE = args.includes('--prove');
const TOPIC = args.find((a) => /^[A-Z]{2}\.\d/.test(a)) ?? 'AR.1.4';
const PAGE_URL = `${BASE}/course/tsia2/math/unit/0/topic/${TOPIC}/lesson`;

// Measured from the source, not assumed, so a splitter that quietly drops a
// section cannot agree with itself and pass.
const EXPECTED_SECTIONS = 10;

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

console.log(`lesson outline: ${PAGE_URL}  (${PROVE ? 'PROVE, faulted expectations' : 'real'})`);
await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

const rail = page.locator('nav[aria-label="Lesson outline"]');
const entries = rail.locator('li');
const cards = page.locator('.um-lesson-column > section.um-prose-card');
const handoff = page.locator('section[aria-labelledby="lesson-handoff-heading"]');
const requirement = page.locator('#topic-nav-requirement');

// ── THE SPLIT HAPPENED ──────────────────────────────────────────────────────
await check(`the notes render as ${EXPECTED_SECTIONS} section cards, not one blob`, async () => {
  const n = await cards.count();
  if (!PROVE && n !== EXPECTED_SECTIONS) console.log(`        found ${n}`);
  return PROVE ? n !== EXPECTED_SECTIONS : n === EXPECTED_SECTIONS;
});

await check('the outline lists every section, in the order they appear', async () => {
  const inOutline = await entries.allInnerTexts();
  const inColumn = await cards.locator('h3').allInnerTexts();
  const same =
    inOutline.length === EXPECTED_SECTIONS &&
    inColumn.length === EXPECTED_SECTIONS &&
    inOutline.every((t, i) => t.trim() === inColumn[i].trim());
  return PROVE ? !same : same;
});

await check('each card is numbered against the real total', async () => {
  const all = await page.evaluate(() =>
    [...document.querySelectorAll('.um-lesson-column > section.um-prose-card')].map(
      (s) => s.firstElementChild?.textContent?.trim() ?? ''
    )
  );
  const want = all.map((_, i) => `Section ${i + 1} of ${all.length}`);
  const ok = all.length === EXPECTED_SECTIONS && all.every((t, i) => t === want[i]);
  if (!PROVE && !ok) console.log(`        got ${JSON.stringify(all.slice(0, 3))}`);
  return PROVE ? !ok : ok;
});

await check('the rail says how many sections there are', async () => {
  const text = (await rail.innerText()).replace(/\s+/g, ' ');
  const ok = text.includes(`${EXPECTED_SECTIONS} sections`);
  return PROVE ? !ok : ok;
});

// ── THE GATE HAS NOT MOVED ──────────────────────────────────────────────────
await check('the lesson starts locked, so there is a locked state to test', async () =>
  (await requirement.isVisible()) === (PROVE ? false : true)
);

// The assertion this file exists for. Scrolling to the page bottom would pass
// against a sentinel placed after card one, so the foot of card one is where the
// gate is proved shut.
await check('at the foot of SECTION ONE the gate is still shut', async () => {
  await cards.first().evaluate((el) => el.scrollIntoView({ block: 'end' }));
  await page.waitForTimeout(400);

  const state = await page.evaluate(() => ({
    // How much of the lesson is still below the fold. If this is small the
    // check is vacuous: the sentinel would be on screen for honest reasons.
    remaining: document.body.scrollHeight - (window.scrollY + window.innerHeight),
    card: !!document.querySelector('section[aria-labelledby="lesson-handoff-heading"]'),
  }));

  if (!PROVE && state.remaining < 1000) {
    console.log(`        only ${state.remaining}px left below the fold, check is too weak`);
    return false;
  }
  if (!PROVE && state.card) {
    console.log('        the handoff card appeared at the end of section one');
  }
  return PROVE ? state.card : !state.card;
});

await check('the requirement line is still there at the foot of section one', async () =>
  (await requirement.isVisible()) === (PROVE ? false : true)
);

await check('the gate opens at the end of the LAST section, as before', async () => {
  // Kept scrolling rather than scrolled once. document.body.scrollHeight read at
  // domcontentloaded can be short of the settled height while KaTeX and ten
  // cards are still laying out, which strands the sentinel above the fold and
  // reports a working gate as broken. See the same loop in
  // verify_lesson_handoff.mjs, where this raced intermittently.
  for (let i = 0; i < 40; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    if (await handoff.count()) break;
    await page.waitForTimeout(200);
  }
  await handoff.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  return (await handoff.isVisible()) === (PROVE ? false : true);
});

await check('the sentinel sits after the last section card', async () => {
  const after = await page.evaluate(() => {
    const column = document.querySelector('.um-lesson-column');
    if (!column) return false;
    const kids = [...column.children];
    const last = kids.findLastIndex((el) => el.matches('section.um-prose-card'));
    const sentinelAt = kids.findIndex((el) => el.getAttribute('aria-hidden') === 'true');
    return last >= 0 && sentinelAt > last;
  });
  return PROVE ? !after : after;
});

// ── THE OUTLINE IS STILL STATIC ─────────────────────────────────────────────
await check('the outline has no links, and the sections have no ids to link to', async () => {
  const found = await page.evaluate(() => ({
    links: document.querySelectorAll('nav[aria-label="Lesson outline"] a').length,
    ids: [...document.querySelectorAll('.um-lesson-column > section.um-prose-card')].filter(
      (s) => s.id
    ).length,
  }));
  const clean = found.links === 0 && found.ids === 0;
  if (!PROVE && !clean) console.log(`        ${found.links} links, ${found.ids} ids`);
  return PROVE ? !clean : clean;
});

// A current-section marker is the thing most likely to be added later as "just
// the highlight". Every entry being identically styled is what rules it out, and
// it catches a progress fill or a checkmark column the same way.
await check('no entry is marked as current: all of them are styled alike', async () => {
  const styles = await page.evaluate(() =>
    [...document.querySelectorAll('nav[aria-label="Lesson outline"] li')].map((li) => {
      const cs = getComputedStyle(li);
      return [cs.color, cs.fontWeight, cs.backgroundColor, cs.borderLeftWidth].join('|');
    })
  );
  const uniform = styles.length > 1 && new Set(styles).size === 1;
  if (!PROVE && !uniform) console.log(`        ${new Set(styles).size} distinct entry styles`);
  return PROVE ? !uniform : uniform;
});

// ── LONG HEADINGS ───────────────────────────────────────────────────────────
await check('every entry carries its full heading in title', async () => {
  const rows = await page.evaluate(() =>
    [...document.querySelectorAll('nav[aria-label="Lesson outline"] li')].map((li) => ({
      title: li.getAttribute('title') ?? '',
      text: (li.textContent ?? '').trim(),
    }))
  );
  const ok = rows.length > 0 && rows.every((r) => r.title && r.title === r.text);
  if (!PROVE && !ok) {
    const bad = rows.find((r) => r.title !== r.text);
    console.log(`        ${JSON.stringify(bad)}`);
  }
  return PROVE ? !ok : ok;
});

// Two lines is a CEILING, not a promise of truncation. Measured at this rail
// width, the longest heading in the whole course -- 59 characters, on this topic
// -- wraps to two lines and fits, so nothing is currently cut off and the title
// attribute is insurance rather than the only way to read an entry. The check
// therefore asserts the ceiling holds AND that the clamp is really in force, so a
// longer heading authored later is truncated rather than running to four lines.
await check('no entry exceeds two lines, and the clamp is really in force', async () => {
  const state = await page.evaluate(() => {
    // The clamp is on the span inside the entry, not on the li, so the li's
    // padding cannot be counted as a third line of text.
    const spans = [...document.querySelectorAll('nav[aria-label="Lesson outline"] li span')];
    const lines = spans.map((s) =>
      Math.round(s.clientHeight / parseFloat(getComputedStyle(s).lineHeight))
    );
    const longest = spans.reduce((a, b) =>
      (b.textContent ?? '').length > (a.textContent ?? '').length ? b : a
    );

    // Whether the clamp is in force is asked BEHAVIOURALLY, by narrowing the
    // rail until the text has to overflow and seeing whether it is cut at two
    // lines. Computed style cannot answer it: Chrome 151 reports
    // display:-webkit-box as flow-root, so a style assertion fails against a
    // clamp that is working perfectly well.
    const nav = longest.closest('nav');
    const restore = nav.style.width;
    nav.style.width = '120px';
    const squeezed = {
      lines: Math.round(longest.clientHeight / parseFloat(getComputedStyle(longest).lineHeight)),
      truncating: longest.scrollHeight > longest.clientHeight,
    };
    nav.style.width = restore;

    return {
      count: spans.length,
      maxLines: Math.max(...lines),
      chars: (longest.textContent ?? '').trim().length,
      // Not required to be true at the real width. Reported so that the day a
      // heading does start overflowing, the log says so rather than staying
      // silent about a change in what students can read.
      truncatingAtFullWidth: longest.scrollHeight > longest.clientHeight,
      squeezed,
    };
  });
  // Vacuous unless this topic really does carry a heading long enough to need
  // the second line.
  if (!PROVE && state.chars < 45) {
    console.log(`        longest heading is only ${state.chars} chars, check is too weak`);
    return false;
  }
  const ok =
    state.count === EXPECTED_SECTIONS &&
    state.maxLines <= 2 &&
    state.squeezed.lines === 2 &&
    state.squeezed.truncating;
  if (!PROVE) {
    console.log(
      `        longest ${state.chars} chars, ${state.maxLines} lines max, ` +
        `truncating=${state.truncatingAtFullWidth}; squeezed to 120px: ` +
        `${state.squeezed.lines} lines, truncating=${state.squeezed.truncating}`
    );
  }
  return PROVE ? !ok : ok;
});

// ── 360px ───────────────────────────────────────────────────────────────────
await check('at 360px the rail is gone and the section count survives inline', async () => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.waitForTimeout(200);
  const state = await page.evaluate(() => {
    const railEl = document.querySelector('nav[aria-label="Lesson outline"]');
    const strip = document.querySelector('.um-lesson-strip');
    return {
      railVisible: !!railEl && getComputedStyle(railEl).display !== 'none',
      stripVisible: !!strip && getComputedStyle(strip).display !== 'none',
      stripText: (strip?.textContent ?? '').trim(),
      // Nothing may push the page sideways at the narrowest width we support.
      overflows: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });
  const ok =
    !state.railVisible &&
    state.stripVisible &&
    state.stripText === `${EXPECTED_SECTIONS} sections` &&
    !state.overflows;
  if (!PROVE && !ok) console.log(`        ${JSON.stringify(state)}`);
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
