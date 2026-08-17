// verify_quiz_finish.mjs -- drive a whole mini quiz in a real browser and prove
// the closing summary is real.
//
//   npx next build && npx next start -p 3110
//   node scripts/verify_quiz_finish.mjs --base http://localhost:3110
//   node scripts/verify_quiz_finish.mjs --base http://localhost:3110 --prove
//
// WHY THIS NEEDS NO ACCOUNT, AND WHAT THAT COSTS
// -----------------------------------------------
// The topic tree is reachable signed out and /api/curriculum/practice grades an
// anonymous answer, it just records nothing. So a full four-question attempt can
// be driven end to end here without a test account.
//
// What that does NOT cover, stated rather than implied:
//
//   - loadEarnedSolutions returns undefined for an anonymous visitor, so no
//     worked solution exists on this page in the first place. The "no reveal
//     during the attempt" assertion below is therefore true for a SECOND reason
//     signed out, and passing it is not evidence the rule works. The rule is
//     covered as a pure function in tests/quiz-finish.test.ts, where the
//     section and the outcome are the only inputs.
//   - gumu_available is always false signed out, so GumuChat never mounts and
//     the missed-answer path a signed-in student sees is not exercised.
//
// Both close when there is a test account, and neither is claimed here.
//
// ACTIONABILITY, NOT PRESENCE
// ---------------------------
// The quiz is driven by clicking real labels wrapping real radio inputs and
// real buttons. Every assertion is isVisible() or a click that has to take
// effect. Counting elements would pass on a page nobody could use.

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
// Guard the absent flag rather than doing arithmetic on -1.
const BASE = baseIdx >= 0 && args[baseIdx + 1] ? args[baseIdx + 1] : 'http://localhost:3110';
const PROVE = args.includes('--prove');
const TOPIC = args.find((a) => /^[A-Z]{2}\.\d/.test(a)) ?? 'QR.1.5';
const PAGE_URL = `${BASE}/course/tsia2/math/unit/0/topic/${TOPIC}/quiz`;

let failed = 0;
const check = async (label, fn) => {
  try {
    if (await fn()) {
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
const context = await browser.newContext({ viewport: { width: 390, height: 780 } });
const page = await context.newPage();

console.log(`quiz finish: ${PAGE_URL}  (${PROVE ? 'PROVE, faulted expectations' : 'real'})`);
await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

const finishPanel = page.locator('section[aria-labelledby="quiz-finish-heading"]');
const liveChoice = page.locator('label.um-choice-live');
const checkButton = page.getByRole('button', { name: 'Check answer' });

// Before a single answer, there is nothing to summarise.
await check('no summary before the quiz is attempted', async () =>
  (await finishPanel.isVisible()) === (PROVE ? true : false)
);

const questionCount = await checkButton.count();
await check('the quiz presents questions to answer', () =>
  questionCount === (PROVE ? 99 : 4)
);

// Answer every question by clicking the first still-live choice, then the first
// remaining Check answer button. um-choice-live is dropped once an item is
// answered, so "first live" walks the quiz in order without index bookkeeping.
for (let i = 0; i < questionCount; i++) {
  await liveChoice.first().click();
  await checkButton.first().click();
  // The button for that item unmounts once it is answered, which is the signal
  // the grade landed. Waiting on the count is what makes this deterministic
  // rather than a sleep.
  await page.waitForFunction(
    (remaining) => document.querySelectorAll('label.um-choice-live').length < remaining,
    await liveChoice.count(),
    { timeout: 15000 }
  );

  if (i === 0) {
    await check('still no summary partway through the attempt', async () =>
      (await finishPanel.isVisible()) === (PROVE ? true : false)
    );
    await check('no worked solution is offered mid-attempt (see header caveat)', async () => {
      const n = await page.getByRole('button', { name: /worked solution/i }).count();
      return PROVE ? n > 0 : n === 0;
    });
  }
}

await check('the summary appears once every question is answered', async () =>
  (await finishPanel.isVisible()) === (PROVE ? false : true)
);

await check('the summary is scored out of the whole quiz', async () => {
  const text = await finishPanel.innerText();
  return PROVE
    ? !/\bof\s+4\s+correct\b/.test(text)
    : new RegExp(`\\b[0-4] of ${questionCount} correct\\b`).test(text);
});

// The whole point of the surface: a miss is named, and named by the question's
// own stem rather than by any diagnosis.
await check('a missed question is named, or the quiz was clean', async () => {
  const text = await finishPanel.innerText();
  const clean = /Every question right/.test(text);
  // Case-insensitive: the eyebrow is text-transform: uppercase, so innerText
  // returns it as rendered. A case-sensitive match here failed against a panel
  // that was entirely correct.
  const named = /what you missed/i.test(text) && /Question \d+/.test(text);
  return PROVE ? !(clean || named) : clean || named;
});

// No section claim anywhere. This is the assertion that catches the design's
// "Section 4 covers it" being translated literally, which nothing can verify.
await check('the summary makes no claim about which section covers a miss', async () => {
  const text = (await finishPanel.innerText()).toLowerCase();
  const hits = ['section 1', 'section 2', 'section 3', 'section 4', 'covers it', 'reread section'];
  const found = hits.filter((s) => text.includes(s));
  return PROVE ? found.length > 0 : found.length === 0;
});

// The misconception taxonomy must not reach the browser. Checked against the
// served HTML, not the rendered text, since a hidden field would still be in
// the payload.
await check('no misconception data is serialized to the page', async () => {
  const html = await page.content();
  const hits = ['misconception', 'misconception_tag', 'distractor_logic'].filter((s) =>
    html.includes(s)
  );
  return PROVE ? hits.length > 0 : hits.length === 0;
});

await check('the way back to the notes is visible and tall enough to tap', async () => {
  const link = page.locator('a.um-quiz-finish-lesson');
  if (!(await link.isVisible())) return false;
  const box = await link.boundingBox();
  return box !== null && box.height >= (PROVE ? 999 : 44);
});

await check('the way back to the notes actually navigates to the lesson', async () => {
  await page.locator('a.um-quiz-finish-lesson').click();
  await page.waitForLoadState('domcontentloaded');
  const path = new URL(page.url()).pathname;
  return PROVE ? !path.endsWith('/lesson') : path.endsWith(`/topic/${TOPIC}/lesson`);
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
