// verify_quiz_register.mjs -- prove the mini quiz reads as assessment rather
// than as practice, and that changing how it LOOKS changed nothing about what it
// counts or what it writes.
//
//   npx next build && npx next start -p 3110
//   node scripts/verify_quiz_register.mjs --base http://localhost:3110
//   node scripts/verify_quiz_register.mjs --base http://localhost:3110 --prove
//
// Four things are asserted, and the last two are the ones that matter most,
// because a register change has no business touching either:
//
//   1. no Sunset Orange primary anywhere during the attempt
//   2. the strip agrees with the cards, per question, not merely in count
//   3. one curriculum_attempts write per Check, unchanged
//   4. the gate is untouched: requiredCorrect, GatedQuiz and TopicNav
//
// (3) is asserted by counting the requests the page actually issues, and (4) by
// reading the requirement line the gate renders, which is computed from the same
// threshold the server enforces.
//
// Signed out, which is what this can reach: grading works anonymously and
// correct_answer comes back inline because gumu_available needs a session.

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = baseIdx >= 0 && args[baseIdx + 1] ? args[baseIdx + 1] : 'http://localhost:3110';
const PROVE = args.includes('--prove');

const TOPIC = { unit: '0', id: 'QR.1.5' };
const QUIZ = `${BASE}/course/tsia2/math/unit/${TOPIC.unit}/topic/${TOPIC.id}/quiz`;
const PRACTICE = `${BASE}/course/tsia2/math/unit/${TOPIC.unit}/topic/${TOPIC.id}/practice`;

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

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
const page = await context.newPage();

// Every write the page issues, so "one row per Check" is counted rather than
// assumed. The route inserts exactly one curriculum_attempts row per POST.
const writes = [];
page.on('request', (r) => {
  if (r.method() === 'POST' && r.url().includes('/api/curriculum/practice')) writes.push(r.url());
});

console.log(`quiz register: ${QUIZ}  (${PROVE ? 'PROVE, faulted expectations' : 'real'})`);
await page.goto(QUIZ, { waitUntil: 'domcontentloaded' });

const cards = page.locator('fieldset');

// Visible, actionable controls painted Sunset. Decorative orange is excluded by
// requiring a or button, the same rule verify_lesson_handoff uses.
const orangePrimaries = () =>
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
  }, SUNSET);

const readStrip = () =>
  page.evaluate(() => {
    const el = document.querySelector('.um-quiz-strip');
    if (!el) return null;
    return {
      label: el.getAttribute('aria-label'),
      segments: [...el.querySelectorAll('span')].map((s) => ({
        state: s.getAttribute('data-state'),
        width: Math.round(s.getBoundingClientRect().width),
        height: Math.round(s.getBoundingClientRect().height),
      })),
    };
  });

// What each card says about itself, in the student's own words.
const cardOutcomes = () =>
  page.evaluate(() =>
    [...document.querySelectorAll('fieldset')].map((f) => {
      const t = f.innerText || '';
      if (t.includes('Nailed it')) return 'correct';
      if (t.includes('Not quite yet')) return 'missed';
      return 'untouched';
    })
  );

// ── THE STRIP EXISTS AND IS THE QUIZ'S OWN ──────────────────────────────────
await check('the quiz has one segment per question, at the quiz size', async () => {
  const s = await readStrip();
  const ok =
    s !== null &&
    s.segments.length === 4 &&
    s.segments.every((x) => x.width === 40 && x.height === 6);
  if (!PROVE && !ok) console.log(`        ${JSON.stringify(s?.segments)}`);
  return PROVE ? !ok : ok;
});

await check('every segment starts untouched, and the label says so', async () => {
  const s = await readStrip();
  const ok =
    s !== null &&
    s.segments.every((x) => x.state === 'untouched') &&
    /0 of 4 answered/.test(s.label ?? '');
  if (!PROVE && !ok) console.log(`        label="${s?.label}"`);
  return PROVE ? !ok : ok;
});

// ── NO ORANGE DURING THE ATTEMPT ────────────────────────────────────────────
// Asserted before answering and again after, because the primary only appears
// while a question is unanswered and a selected choice is what enables it.
await check('no Sunset primary on the untouched quiz', async () => {
  const found = await orangePrimaries();
  if (!PROVE && found.length) console.log(`        ${found.map((f) => f.text || f.cls).join(', ')}`);
  return PROVE ? found.length > 0 : found.length === 0;
});

await check('and none once a choice is selected and Check is live', async () => {
  await cards.first().locator('label').first().click();
  await page.waitForTimeout(120);
  const found = await orangePrimaries();
  if (!PROVE && found.length) console.log(`        ${found.map((f) => f.text || f.cls).join(', ')}`);
  return PROVE ? found.length > 0 : found.length === 0;
});

// The control against a check that would pass on a page with no buttons at all.
await check('CONTROL: practice DOES carry a Sunset primary, so the check discriminates', async () => {
  await page.goto(PRACTICE, { waitUntil: 'domcontentloaded' });
  await page.locator('fieldset label').first().click();
  await page.waitForTimeout(120);
  const found = await orangePrimaries();
  if (!PROVE && !found.length) console.log('        practice had none either; the check proves nothing');
  return PROVE ? found.length === 0 : found.length > 0;
});

// ── THE STRIP AGREES WITH THE CARDS ─────────────────────────────────────────
await check('answering one question moves exactly one segment, and it matches the card', async () => {
  await page.goto(QUIZ, { waitUntil: 'domcontentloaded' });
  writes.length = 0;

  await cards.first().locator('label').first().click();
  await page.getByRole('button', { name: 'Check answer' }).first().click();
  await page.waitForTimeout(1500);

  const s = await readStrip();
  const outcomes = await cardOutcomes();
  if (!s) return PROVE;

  const states = s.segments.map((x) => x.state);
  const answered = states.filter((x) => x !== 'untouched');
  const ok =
    answered.length === 1 &&
    // Per question, not merely in count: segment i has to say what card i says.
    states[0] === outcomes[0] &&
    outcomes[0] !== 'untouched' &&
    states.slice(1).every((x) => x === 'untouched');
  if (!PROVE && !ok) console.log(`        strip=${states.join(',')} cards=${outcomes.join(',')}`);
  return PROVE ? !ok : ok;
});

await check('the accessible label agrees with the colours', async () => {
  const s = await readStrip();
  const outcomes = await cardOutcomes();
  const correct = outcomes.filter((o) => o === 'correct').length;
  const missed = outcomes.filter((o) => o === 'missed').length;
  const ok =
    s !== null &&
    s.label === `1 of 4 answered, ${correct} correct, ${missed} missed.`;
  if (!PROVE && !ok) console.log(`        label="${s?.label}" cards=${outcomes.join(',')}`);
  return PROVE ? !ok : ok;
});

// ── ONE WRITE PER CHECK ─────────────────────────────────────────────────────
await check('one grading request per Check, unchanged by the register', async () => {
  const afterOne = writes.length;
  await cards.nth(1).locator('label').first().click();
  await page.getByRole('button', { name: 'Check answer' }).first().click();
  await page.waitForTimeout(1500);
  const ok = afterOne === 1 && writes.length === 2;
  if (!PROVE && !ok) console.log(`        ${afterOne} then ${writes.length} POSTs`);
  return PROVE ? !ok : ok;
});

// ── THE GATE IS UNTOUCHED ───────────────────────────────────────────────────
// The requirement line is rendered by TopicNav from the same threshold
// requiredCorrect() computes and the server enforces. If the register had
// disturbed the gate, this is where it would show.
await check('the gate still asks for 3 of 4, and says so', async () => {
  const text = await page.evaluate(() => {
    const el = document.querySelector('#topic-nav-requirement');
    return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : null;
  });
  const ok = Boolean(text) && /You need 3 of 4/.test(text);
  if (!PROVE && !ok) console.log(`        requirement="${text}"`);
  return PROVE ? !ok : ok;
});

await check('no worked solution is offered mid-attempt', async () => {
  const reveals = await page.evaluate(
    () =>
      [...document.querySelectorAll('button')].filter((b) =>
        (b.innerText || '').includes('Reveal worked solution')
      ).length
  );
  return PROVE ? reveals > 0 : reveals === 0;
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
