// verify_items_self_contained.mjs -- assert every practice and quiz item is
// answerable from ITS OWN RENDERED BLOCK, against what the page actually emits.
//
//   node scripts/verify_items_self_contained.mjs PR.3.4 --base URL --unit 5
//
// WHY THIS READS RENDERED OUTPUT AND NOT SOURCE
// ----------------------------------------------
// Every other quality check in this repo reads the source markdown, where a
// shared table sits a few lines above the item that uses it and everything looks
// fine. `PracticeQuiz` renders only parsed item blocks, stem plus choices, one
// item at a time, and drops the section preamble entirely. So an item whose data
// lived in that preamble rendered as an unanswerable question:
//
//   PROBLEM 1 OF 10
//   What is the range of Set A?      A 10   B 14   C 4   D 8
//
// with Set A never shown. PR.3.4 shipped that way, 13 of its 14 items, and every
// source-reading gate passed on it.
//
// The check: for each item, take the tokens its stem depends on and require them
// to appear inside that item's own rendered block. A token is a datum the student
// cannot answer without: a table's row and column headers, a named data set.
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = baseIdx === -1 ? 'http://localhost:3000' : args[baseIdx + 1];
const unitIdx = args.indexOf('--unit');
const UNIT = unitIdx === -1 ? '5' : args[unitIdx + 1];
const valueIdx = new Set([baseIdx, unitIdx].filter((i) => i !== -1).map((i) => i + 1));
const topics = args.filter((a, i) => !a.startsWith('--') && !valueIdx.has(i));

// Tokens an item's rendered block must contain to be answerable on its own.
// Keyed by topic, then by a phrase that identifies the stem.
const REQUIRED = {
  'PR.3.4': [
    [/given that they studied/i, ['Passed', 'Failed', 'Studied', 'Did not study']],
    [/given that they did not study/i, ['Passed', 'Failed', 'Studied', 'Did not study']],
    [/given that they are a junior/i, ['Bus', 'Walk', 'Junior', 'Senior']],
    [/given that they are a senior/i, ['Bus', 'Walk', 'Junior', 'Senior']],
    [/answered Yes, given that they are in Group A/i, ['Yes', 'No', 'Group A', 'Group B']],
    [/in Group A, given that they answered Yes/i, ['Yes', 'No', 'Group A', 'Group B']],
    [/answered No, given that they are in Group B/i, ['Yes', 'No', 'Group A', 'Group B']],
    [/in Group B, given that they answered No/i, ['Yes', 'No', 'Group A', 'Group B']],
    [/had rain, given that it was a weekend/i, ['Rain', 'Dry', 'Weekend', 'Weekday']],
    [/weekday, given that it had rain/i, ['Rain', 'Dry', 'Weekend', 'Weekday']],
    [/passed, given that they sat the morning/i, ['Pass', 'Fail', 'Morning', 'Evening']],
    [/failed, given that they sat the evening/i, ['Pass', 'Fail', 'Morning', 'Evening']],
  ],
};

const browser = await chromium.launch();
const page = await browser.newPage();
let checked = 0, failed = 0;

for (const topic of topics) {
  const rules = REQUIRED[topic] ?? [];
  for (const route of ['practice', 'quiz']) {
    await page.goto(`${BASE}/course/tsia2/math/unit/${UNIT}/topic/${topic}/${route}`,
      { waitUntil: 'networkidle' });
    // One block per item, split on the renderer's own item headers.
    const blocks = await page.evaluate(() => {
      const t = document.body.innerText;
      const marks = [...t.matchAll(/(PROBLEM \d+ OF \d+|ITEM \d+ OF \d+)/g)];
      if (!marks.length) return [];
      return marks.map((m, i) => t.slice(m.index, i + 1 < marks.length ? marks[i + 1].index : undefined));
    });
    if (!blocks.length) {
      console.log(`  [FAIL] ${topic} ${route}: no item blocks found in the rendered page`);
      failed++; continue;
    }
    for (const block of blocks) {
      const label = (block.match(/(PROBLEM|ITEM) \d+ OF \d+/) || ['?'])[0];
      const rule = rules.find(([re]) => re.test(block));
      if (!rule) continue;                       // no declared dependency
      const missing = rule[1].filter((tok) => !block.includes(tok));
      checked++;
      if (missing.length) {
        failed++;
        console.log(`  [FAIL] ${topic} ${route} ${label}: block is missing ${JSON.stringify(missing)}`);
      } else {
        console.log(`  [ ok ] ${topic} ${route} ${label}: carries its own ${rule[1].length} required token(s)`);
      }
    }
  }
}
await browser.close();
console.log(`\n${checked} item(s) checked against rendered output, ${failed} unanswerable`);
process.exit(failed ? 1 : 0);
