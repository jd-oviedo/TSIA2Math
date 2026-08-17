// verify_practice_paging.mjs -- prove practice shows one problem at a time and
// that the strip beside it is reporting the real set rather than decorating it.
//
//   npx next build && npx next start -p 3110
//   node scripts/verify_practice_paging.mjs --base http://localhost:3110
//   node scripts/verify_practice_paging.mjs --base http://localhost:3110 --prove
//
// THE SHAPE THIS AVOIDS. A strip is ten small coloured rectangles, so a check
// that counts them, or asserts "none is red", passes just as happily against a
// strip that rendered blank, rendered detached from the data, or did not render
// at all. Every assertion here is positive and identifying: exactly one segment
// is current, its position EQUALS the problem number on screen, its rendered
// height is greater than its neighbours', and after an answer the strip's state
// for that problem MATCHES what the card said. A strip wired to nothing fails
// all four.
//
// Signed out on purpose, which is what this can reach: grading works
// anonymously (nothing is persisted), and correct_answer comes back inline
// because gumu_available requires a session.
//
// NOT COVERED HERE, and it is the important gap. The GUMU page-turn release
// cannot be reached from a browser without an account: gumu_available is false
// for anonymous visitors, so GumuChat never mounts, activeCount never rises, and
// the worked-solution links it would pause are themselves only rendered for a
// signed-in student with earned solutions. The whole interaction is behind auth.
// It is covered by tests/practice-paging.test.ts as a pure function, faults
// included, and the end-to-end assertion waits on the deferred auth test path
// along with the rest of the authenticated branch.

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = baseIdx >= 0 && args[baseIdx + 1] ? args[baseIdx + 1] : 'http://localhost:3110';
const PROVE = args.includes('--prove');

const TOPIC = { unit: '0', id: 'AR.1.4' };
const WRITTEN = { unit: '1', id: 'QR.1.1' }; // practiceInteractive === false

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

const practiceUrl = (t) => `${BASE}/course/tsia2/math/unit/${t.unit}/topic/${t.id}/practice`;
console.log(`practice paging: ${practiceUrl(TOPIC)}  (${PROVE ? 'PROVE, faulted expectations' : 'real'})`);
await page.goto(practiceUrl(TOPIC), { waitUntil: 'domcontentloaded' });

const cards = page.locator('fieldset');
const nextBtn = page.locator('button.um-practice-next');
const prevBtn = page.locator('button.um-practice-prev');

// Reads the strip as rendered: semantic state AND measured geometry, so a strip
// carrying the right data attributes while painting nothing still fails.
const readStrip = () =>
  page.evaluate(() => {
    const el = document.querySelector('.um-practice-strip');
    if (!el) return null;
    return [...el.querySelectorAll('span')].map((s) => ({
      state: s.getAttribute('data-state'),
      height: Math.round(s.getBoundingClientRect().height),
      width: Math.round(s.getBoundingClientRect().width),
      colour: getComputedStyle(s).backgroundColor,
    }));
  });

// "Problem 3 of 10" from the card's own eyebrow, as the student reads it.
const problemNumber = async () => {
  const text = await page.locator('fieldset legend').first().innerText();
  const m = text.match(/Problem (\d+) of (\d+)/);
  return m ? { n: Number(m[1]), of: Number(m[2]) } : null;
};

// ── ONE AT A TIME ───────────────────────────────────────────────────────────
await check('exactly one problem is on the page, not the whole stack', async () => {
  const n = await cards.count();
  if (!PROVE && n !== 1) console.log(`        ${n} problem cards rendered`);
  return PROVE ? n !== 1 : n === 1;
});

await check('the set is still ten problems, and the card says which one', async () => {
  const p = await problemNumber();
  const ok = p !== null && p.n === 1 && p.of === 10;
  if (!PROVE && !ok) console.log(`        legend read ${JSON.stringify(p)}`);
  return PROVE ? !ok : ok;
});

// ── THE STRIP IS REAL ───────────────────────────────────────────────────────
await check('the strip has one segment per problem', async () => {
  const s = await readStrip();
  const ok = s !== null && s.length === 10;
  if (!PROVE && !ok) console.log(`        ${s ? s.length : 'no strip'}`);
  return PROVE ? !ok : ok;
});

await check('exactly one segment is current, and it is the problem on screen', async () => {
  const s = await readStrip();
  const p = await problemNumber();
  if (!s || !p) return PROVE;
  const currents = s.map((x, i) => (x.state === 'current' ? i : -1)).filter((i) => i >= 0);
  const ok = currents.length === 1 && currents[0] === p.n - 1;
  if (!PROVE && !ok) console.log(`        current at ${currents}, card says problem ${p.n}`);
  return PROVE ? !ok : ok;
});

// Geometry, not just the attribute: the design makes the current segment taller
// rather than only recolouring it, and a strip that renders nothing has no
// height at all.
await check('the current segment is drawn taller than the rest', async () => {
  const s = await readStrip();
  if (!s) return PROVE;
  const cur = s.find((x) => x.state === 'current');
  const others = s.filter((x) => x.state !== 'current');
  const ok =
    Boolean(cur) &&
    cur.height > 0 &&
    others.length > 0 &&
    others.every((o) => o.height > 0 && cur.height > o.height) &&
    s.every((x) => x.width > 0);
  if (!PROVE && !ok) console.log(`        heights ${s.map((x) => x.height).join(',')}`);
  return PROVE ? !ok : ok;
});

await check('untouched segments all start untouched', async () => {
  const s = await readStrip();
  if (!s) return PROVE;
  const untouched = s.filter((x) => x.state === 'untouched').length;
  const ok = untouched === 9;
  if (!PROVE && !ok) console.log(`        ${untouched} untouched, expected 9`);
  return PROVE ? !ok : ok;
});

// ── MOVEMENT ────────────────────────────────────────────────────────────────
await check('Previous is unavailable on the first problem', async () => {
  const disabled = await prevBtn.isDisabled();
  return PROVE ? !disabled : disabled;
});

await check('Next moves to the second problem, and the strip follows', async () => {
  const before = await page.locator('.um-stem').first().innerText();
  await nextBtn.click();
  await page.waitForTimeout(150);
  const p = await problemNumber();
  const s = await readStrip();
  const after = await page.locator('.um-stem').first().innerText();
  const currents = (s ?? []).map((x, i) => (x.state === 'current' ? i : -1)).filter((i) => i >= 0);
  const ok =
    p?.n === 2 &&
    after !== before &&
    (await cards.count()) === 1 &&
    currents.length === 1 &&
    currents[0] === 1;
  if (!PROVE && !ok) console.log(`        problem ${p?.n}, current at ${currents}, stem changed=${after !== before}`);
  return PROVE ? !ok : ok;
});

await check('Previous goes back, and the first stem returns', async () => {
  const second = await page.locator('.um-stem').first().innerText();
  await prevBtn.click();
  await page.waitForTimeout(150);
  const p = await problemNumber();
  const first = await page.locator('.um-stem').first().innerText();
  const ok = p?.n === 1 && first !== second;
  if (!PROVE && !ok) console.log(`        back at problem ${p?.n}`);
  return PROVE ? !ok : ok;
});

await check('Next is unavailable on the last problem', async () => {
  for (let i = 0; i < 9; i++) {
    await nextBtn.click();
    await page.waitForTimeout(60);
  }
  const p = await problemNumber();
  const disabled = await nextBtn.isDisabled();
  const ok = p?.n === 10 && disabled;
  if (!PROVE && !ok) console.log(`        problem ${p?.n}, next disabled=${disabled}`);
  return PROVE ? !ok : ok;
});

// ── THE STRIP REPORTS THE ANSWER ────────────────────────────────────────────
// The assertion that ties the strip to the data. It does not care WHICH answer
// the student gave: it requires the strip's state for that problem to be the one
// the card reported, so a strip painting a fixed pattern cannot satisfy it.
await check('after answering, the strip agrees with what the card said', async () => {
  await page.goto(practiceUrl(TOPIC), { waitUntil: 'domcontentloaded' });
  await page.locator('fieldset label').first().click();
  await page.getByRole('button', { name: 'Check answer' }).first().click();
  await page.waitForTimeout(1200);

  // What the card reported, from the status chip the student sees.
  const chip = await page.locator('fieldset').first().innerText();
  const cardSaysCorrect = chip.includes('Nailed it');
  const cardSaysMissed = chip.includes('Not quite yet');
  if (!cardSaysCorrect && !cardSaysMissed) {
    if (!PROVE) console.log('        the card reported neither outcome; grading did not land');
    return PROVE;
  }

  // Move off problem one so its segment stops being `current` and has to show
  // its own state.
  await nextBtn.click();
  await page.waitForTimeout(150);
  const s = await readStrip();
  const first = s?.[0]?.state;
  const expected = cardSaysCorrect ? 'correct' : 'missed';
  const ok = first === expected;
  if (!PROVE && !ok) console.log(`        card said ${expected}, strip says ${first}`);
  return PROVE ? !ok : ok;
});

await check('answering changed the strip: fewer untouched than before', async () => {
  const s = await readStrip();
  if (!s) return PROVE;
  const untouched = s.filter((x) => x.state === 'untouched').length;
  const ok = untouched === 8; // ten, less the answered one, less the current one
  if (!PROVE && !ok) console.log(`        ${untouched} untouched, expected 8`);
  return PROVE ? !ok : ok;
});

// ── QR.1.1, WHERE NOTHING IS GRADABLE ───────────────────────────────────────
// The separation is held by a check rather than by the `if` in practice/page.tsx,
// so a later refactor that unifies the two branches cannot quietly page a
// written-work section into a one-problem pager with a one-segment strip.
await check('QR.1.1 renders no strip, no pager and no problem cards', async () => {
  await page.goto(practiceUrl(WRITTEN), { waitUntil: 'domcontentloaded' });
  const found = await page.evaluate(() => ({
    strip: document.querySelectorAll('.um-practice-strip').length,
    pager: document.querySelectorAll('nav[aria-label="Practice problems"]').length,
    cards: document.querySelectorAll('fieldset').length,
    // Positive control: the written-work prose really is on the page, so this is
    // not passing against a 404 or an empty render.
    prose: document.querySelectorAll('.um-prose-card').length,
  }));
  const ok = found.strip === 0 && found.pager === 0 && found.cards === 0 && found.prose > 0;
  if (!PROVE && !ok) console.log(`        ${JSON.stringify(found)}`);
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
