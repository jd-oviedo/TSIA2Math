// verify_lesson_handoff.mjs -- prove the end-of-lesson handoff appears only on
// completion, and that it does not put a second primary on the page.
//
//   npx next build && npx next start -p 3110
//   node scripts/verify_lesson_handoff.mjs --base http://localhost:3110
//   node scripts/verify_lesson_handoff.mjs --base http://localhost:3110 --prove
//
// The lesson route is reachable signed out and the scroll gate works in-page
// regardless of session (canRecord is false, so nothing is persisted, but the
// sentinel still fires). So both states are reachable here without an account.
//
// THE TWO ASSERTIONS THIS EXISTS FOR
// ----------------------------------
// 1. The card is ABSENT while the lesson is locked, and the locked nav is
//    untouched: grey disabled Next, the requirement line, and the
//    aria-describedby that ties them together. That is the regression risk in
//    this change, because the card is the only thing that was added and the nav
//    is the thing it must not disturb.
//
// 2. Exactly ONE Sunset Orange primary in the done state, and it is the card's.
//    A bare count is not enough: counting elements would report 1 against a page
//    where the card never rendered and something else happened to be orange, so
//    the check asserts the IDENTITY of the single primary it found, not just how
//    many there were. It also has to be a real actionable control, so decorative
//    orange (the requirement dot is C.sunset too) cannot satisfy it.

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
// Guard the absent flag rather than doing arithmetic on -1.
const BASE = baseIdx >= 0 && args[baseIdx + 1] ? args[baseIdx + 1] : 'http://localhost:3110';
const PROVE = args.includes('--prove');
const TOPIC = args.find((a) => /^[A-Z]{2}\.\d/.test(a)) ?? 'QR.1.5';
const PAGE_URL = `${BASE}/course/tsia2/math/unit/0/topic/${TOPIC}/lesson`;

const SUNSET = 'rgb(240, 163, 62)'; // C.sunset #F0A33E

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

// Visible, actionable controls painted Sunset Orange, with their identity.
// Decorative orange is excluded by requiring a or button.
const orangePrimaries = (page, sunset) =>
  page.evaluate((colour) => {
    const out = [];
    for (const el of document.querySelectorAll('a, button')) {
      const cs = getComputedStyle(el);
      if (cs.backgroundColor !== colour) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden') continue;
      out.push({ tag: el.tagName, cls: el.className || '', text: (el.innerText || '').trim() });
    }
    return out;
  }, sunset);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 780 } });
const page = await context.newPage();

console.log(`lesson handoff: ${PAGE_URL}  (${PROVE ? 'PROVE, faulted expectations' : 'real'})`);
await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

const card = page.locator('section[aria-labelledby="lesson-handoff-heading"]');
const cardAction = page.locator('a.um-lesson-handoff-action');
const requirement = page.locator('#topic-nav-requirement');

// ── LOCKED ──────────────────────────────────────────────────────────────────
// The lesson must not already be complete on load, or there is no locked state
// to test and every assertion below is vacuous.
await check('the lesson starts locked, so there is a locked state to test', async () =>
  (await requirement.isVisible()) === (PROVE ? false : true)
);

await check('the handoff card is ABSENT while locked', async () => {
  const n = await card.count();
  return PROVE ? n > 0 : n === 0;
});

await check('the locked Next is a disabled button, exactly as before', async () => {
  const btn = page.locator('button[aria-describedby="topic-nav-requirement"]');
  const visible = await btn.isVisible();
  const disabled = visible ? await btn.isDisabled() : false;
  return PROVE ? !(visible && disabled) : visible && disabled;
});

await check('aria-describedby still resolves to the requirement line', async () => {
  const resolves = await page.evaluate(() => {
    const b = document.querySelector('button[aria-describedby]');
    const id = b?.getAttribute('aria-describedby');
    return !!(id && document.getElementById(id));
  });
  return PROVE ? !resolves : resolves;
});

// ── REACH THE END ───────────────────────────────────────────────────────────
// Scroll to the bottom so the sentinel intersects, and keep scrolling until the
// page stops growing underneath.
//
// A SINGLE scrollTo IS A RACE, and this file lost it intermittently once the
// guided notes became one card per section. document.body.scrollHeight is read
// at the moment of the call, but KaTeX and the section cards are still laying
// out after domcontentloaded, so that height can be short of where the bottom
// finally settles. Scrolling there once leaves the sentinel below the fold and
// the gate shut -- and the failure looks exactly like a broken gate, which is
// the worst way for a harness to be wrong.
for (let i = 0; i < 40; i++) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  if (await card.count()) break;
  await page.waitForTimeout(200);
}
await card.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

// ── DONE ────────────────────────────────────────────────────────────────────
await check('the handoff card appears once the notes are read to the end', async () =>
  (await card.isVisible()) === (PROVE ? false : true)
);

await check('the requirement line is gone once unlocked', async () =>
  (await requirement.count() > 0) === (PROVE ? true : false)
);

await check('Next has left the nav row', async () => {
  const nextLinks = await page.evaluate(() =>
    [...document.querySelectorAll('nav[aria-label="Topic navigation"] a, nav[aria-label="Topic navigation"] button')]
      .map((el) => (el.innerText || '').trim())
      .filter((t) => t.includes('Next'))
  );
  return PROVE ? nextLinks.length > 0 : nextLinks.length === 0;
});

// The nav row must never be left empty. On every topic but one that means
// Previous is still there; on QR.1.5, the first topic in the course, there is no
// Previous to keep, so the landmark is not rendered at all rather than rendered
// with nothing in it. Both are stated as one invariant so this passes on any
// topic it is pointed at.
await check('the nav row is never left empty: Previous stays, or the landmark goes', async () => {
  const state = await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Topic navigation"]');
    if (!nav) return { present: false, hasPrevious: false };
    return {
      present: true,
      // includes, not startsWith: the link renders as "\u2190 Previous \u00b7 Mini quiz",
      // so an anchored match reports a Previous that is plainly on the page.
      hasPrevious: [...nav.querySelectorAll('a')].some((el) =>
        (el.innerText || '').includes('Previous')
      ),
    };
  });
  const ok = state.present ? state.hasPrevious : true;
  if (!PROVE && state.present && !state.hasPrevious) {
    console.log('        nav landmark rendered with no Previous and no Next');
  }
  return PROVE ? !ok : ok;
});

// The assertion this file exists for. Identity, not a count.
await check('exactly one Sunset Orange primary, and it is the handoff card', async () => {
  const found = await orangePrimaries(page, SUNSET);
  if (PROVE) return !(found.length === 1 && found[0].cls.includes('um-lesson-handoff-action'));
  if (found.length !== 1) {
    console.log(`        found ${found.length}: ${found.map((f) => f.cls || f.tag).join(', ')}`);
    return false;
  }
  return found[0].tag === 'A' && found[0].cls.includes('um-lesson-handoff-action');
});

await check('the handoff action clears 44px', async () => {
  if (!(await cardAction.isVisible())) return false;
  const box = await cardAction.boundingBox();
  return box !== null && box.height >= (PROVE ? 999 : 44);
});

await check('the handoff action navigates to practice', async () => {
  await cardAction.click();
  await page.waitForLoadState('domcontentloaded');
  const path = new URL(page.url()).pathname;
  return PROVE ? !path.endsWith('/practice') : path.endsWith(`/topic/${TOPIC}/practice`);
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
