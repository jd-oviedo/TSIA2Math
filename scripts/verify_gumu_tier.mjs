// verify_gumu_tier.mjs -- prove the tier boundary the remediation panel sits on:
// a signed-out student gets no GUMU at all, and gets the answer inline instead.
//
//   npx next build && npx next start -p 3110
//   node scripts/verify_gumu_tier.mjs --base http://localhost:3110
//   node scripts/verify_gumu_tier.mjs --base http://localhost:3110 --prove
//
// WHAT THIS IS, AND WHAT IT IS NOT
// -------------------------------
// It is NOT a check on the panel. None of the panel is reachable here:
// gumu_available initialises false and is set only inside `if (session)`
// (app/api/curriculum/practice/route.ts:100, :189), so a signed-out visitor never
// mounts GumuChat and never sees its pre-session state either. The panel's own
// properties are asserted on the source by scripts/faultproof_gumu_panel.mjs.
//
// What this pins is the BOUNDARY. "No GUMU on the page" is an absence, and an
// absence passes just as happily against a page that failed to render, a 404, or
// a card that never got answered. So every negative here is paired with a
// positive on the same page: the card rendered, the answer was graded, and the
// correct answer came back INLINE -- which is the tier's actual behaviour and the
// thing that would change if the boundary moved.
//
// Recorded in redesign-handoff.md finding 3 as the tier asymmetry, and
// deliberately not altered by the panel.

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = baseIdx >= 0 && args[baseIdx + 1] ? args[baseIdx + 1] : 'http://localhost:3110';
const PROVE = args.includes('--prove');

const TOPIC = { unit: '0', id: 'AR.1.4' };
const PRACTICE = `${BASE}/course/tsia2/math/unit/${TOPIC.unit}/topic/${TOPIC.id}/practice`;

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
const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
const page = await context.newPage();

// What the grading route actually returned, so "inline" is read off the wire
// rather than inferred from the rendering.
let graded = null;
page.on('response', async (r) => {
  if (r.request().method() === 'POST' && r.url().includes('/api/curriculum/practice')) {
    graded = await r.json().catch(() => null);
  }
});

console.log(`gumu tier: ${PRACTICE}  (${PROVE ? 'PROVE, faulted expectations' : 'real'})`);
await page.goto(PRACTICE, { waitUntil: 'domcontentloaded' });

const gumuOnPage = () =>
  page.evaluate(() => ({
    panels: document.querySelectorAll('.um-gumu-panel').length,
    starts: document.querySelectorAll('.um-gumu-start').length,
    dismisses: document.querySelectorAll('.um-gumu-dismiss').length,
    logs: document.querySelectorAll('[aria-label="Conversation with Mu"]').length,
  }));

// ── THE POSITIVE HALF, FIRST ────────────────────────────────────────────────
// Each negative below is worthless without these: they establish that there IS a
// rendered, answerable, graded question on the page to be absent from.
await check('a practice card rendered and can be answered', async () => {
  const cards = await page.locator('fieldset').count();
  const choices = await page.locator('fieldset label').count();
  const ok = cards === 1 && choices >= 2;
  if (!PROVE && !ok) console.log(`        ${cards} cards, ${choices} choices`);
  return PROVE ? !ok : ok;
});

await check('answering it grades, signed out', async () => {
  await page.locator('fieldset label').first().click();
  await page.getByRole('button', { name: 'Check answer' }).first().click();
  await page.waitForTimeout(1500);
  const ok = graded !== null && typeof graded.isCorrect === 'boolean';
  if (!PROVE && !ok) console.log(`        response ${JSON.stringify(graded)}`);
  return PROVE ? !ok : ok;
});

await check('and the card reports an outcome', async () => {
  const text = await page.locator('fieldset').first().innerText();
  const ok = text.includes('Nailed it') || text.includes('Not quite');
  return PROVE ? !ok : ok;
});

// ── THE BOUNDARY ────────────────────────────────────────────────────────────
await check('the correct answer came back INLINE, not withheld for GUMU', async () => {
  // The tier's defining behaviour: gumu_available false means correct_answer is
  // returned rather than held back. If this ever flips, the negatives below stop
  // meaning what they say.
  const ok = graded !== null && graded.gumu_available !== true && graded.correct_answer !== null;
  if (!PROVE && !ok) {
    console.log(`        gumu_available=${graded?.gumu_available} correct_answer=${graded?.correct_answer}`);
  }
  return PROVE ? !ok : ok;
});

await check('no GUMU panel, no start, no dismiss, no transcript', async () => {
  const found = await gumuOnPage();
  const clean = Object.values(found).every((n) => n === 0);
  if (!PROVE && !clean) console.log(`        ${JSON.stringify(found)}`);
  return PROVE ? !clean : clean;
});

// Answering wrong is the state that would open GUMU for a signed-in student, so
// it is the one worth checking rather than a fresh page.
await check('still none after a wrong answer, which is when GUMU would open', async () => {
  const wrong = graded !== null && graded.isCorrect === false;
  if (!wrong) {
    // The first choice happened to be right. Retry and pick another.
    await page.getByRole('button', { name: 'Try this one again' }).first().click();
    await page.waitForTimeout(300);
    await page.locator('fieldset label').nth(1).click();
    await page.getByRole('button', { name: 'Check answer' }).first().click();
    await page.waitForTimeout(1500);
  }
  const found = await gumuOnPage();
  const clean = Object.values(found).every((n) => n === 0);
  if (!PROVE && !clean) console.log(`        ${JSON.stringify(found)}`);
  return PROVE ? !clean : clean;
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
