// The mastery gate does not see Part 5. Proved, not assumed.
//
// WHY THIS FILE EXISTS AT ALL
// ---------------------------
// The investigation that led to Part 5 found one defect worth the whole design:
// `practice_items.practice` was both what a student works through AND the pool a
// worksheet draws from, and requiredCorrect() is a RATIO of the section's live
// item count (app/lib/topic-completion.ts:130-137). So deepening the pool for
// teachers raised the bar for students -- a topic grown from 10 practice items
// to 20 demands 14 correct where it demanded 7, and a student sitting at 7 is
// re-locked mid-topic with the completion badge still reading complete, because
// isTopicComplete() reads the snapshot's own practice_total instead.
//
// extra_practice exists so that cannot happen. This asserts it, and asserts it
// the only way worth doing: by running the REAL gate functions over a topic
// shape derived from the REAL GR.2.6 markdown by the REAL parser, rather than
// over a hand-built object that agrees with the design by construction.
//
// THE CONTROL IS THE POINT. Every invariant below is also run against a FAULTED
// shape -- one where extra_practice has been folded into practice, which is
// exactly what the naive implementation of this feature would have produced --
// and every one of them must FAIL there. A gate assertion that passes on the
// faulted shape is not testing anything, and this file says so out loud rather
// than reporting green.
//
//     node --import ./scripts/ts-alias-hook.mjs scripts/faultproof_extra_practice_gate.mjs
//
// No database, no network, no Supabase client: sectionShape's inputs are plain
// jsonb, and topic-completion.ts imports nothing at all.

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  requiredCorrect,
  isTopicComplete,
  isPastLesson,
} from '../app/lib/topic-completion.ts';
import { poolEntries, countEligible, selectItems } from '../app/lib/worksheet-select.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOPIC = path.join(ROOT, 'curriculum/source/tsia2-math/unit-3/GR.2.6.md');

let failures = 0;
let checks = 0;

function check(label, fn) {
  checks++;
  let ok = false;
  let detail = '';
  try {
    const result = fn();
    ok = result === true;
    if (!ok && typeof result === 'string') detail = result;
  } catch (err) {
    detail = err.message;
  }
  if (!ok) failures++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? `  -- ${detail}` : ''}`);
  return ok;
}

// ── the real parser, on the real file ───────────────────────────────────────
//
// Shelling out to Python rather than reimplementing the parse. A second parser
// written in JS would agree with upload_curriculum.py right up until it didn't,
// and this file's whole claim is about what the uploader actually stores.
const practiceItems = JSON.parse(
  execFileSync(
    path.join(ROOT, '.venv/bin/python3'),
    [
      '-c',
      [
        'import json,sys',
        `sys.path.insert(0, ${JSON.stringify(path.join(ROOT, 'curriculum/migrations'))})`,
        'from upload_curriculum import parse_markdown_curriculum, build_practice_items',
        `p = parse_markdown_curriculum(${JSON.stringify(TOPIC)})`,
        "print(json.dumps(build_practice_items(p['practice_problems'], p['mini_quiz'], p['answer_key'], p['extra_practice'])))",
      ].join('\n'),
    ],
    { encoding: 'utf8' },
  ),
);

// sectionShape() in app/lib/curriculum-progress.ts, reproduced here for one
// reason: that module imports the admin Supabase client at load time, so it
// cannot be loaded without credentials. This is the same six lines, and the
// assertion below that it is still the same six lines is what keeps the copy
// honest.
function sectionShape(section) {
  const interactive = Boolean(section?.interactive);
  if (!interactive) return { interactive: false, gradable: 0 };
  return {
    interactive: true,
    gradable: (section.items ?? []).filter((i) => i.format === 'multiple_choice').length,
  };
}

// The shape the gates are built from, exactly as curriculum-progress.ts builds
// it: BY NAME on two keys, never by iterating the object.
const shapeOf = (items) => ({
  practice: sectionShape(items.practice),
  mini_quiz: sectionShape(items.mini_quiz),
});

// THE FAULT. Part 5 folded into practice, which is what "just raise the item
// count" would have shipped. Everything below must behave differently here.
const faulted = {
  ...practiceItems,
  practice: {
    interactive: true,
    items: [
      ...practiceItems.practice.items,
      ...practiceItems.extra_practice.items.map((i) => ({
        ...i,
        item_number: i.item_number + 100,
      })),
    ],
  },
};

const live = shapeOf(practiceItems);
const fault = shapeOf(faulted);

// A student who cleared the old gate: 7 of 10 practice, 4 of 4 quiz.
const snapshot = {
  completed_at: '2026-08-01T00:00:00Z',
  lesson_completed_at: '2026-08-01T00:00:00Z',
  practice_correct: 7,
  practice_total: 10,
  quiz_correct: 4,
  quiz_total: 4,
};

console.log(`\nGR.2.6 as parsed: sections ${JSON.stringify(Object.keys(practiceItems))}`);
console.log(
  `  practice ${practiceItems.practice.items.length}` +
    `  mini_quiz ${practiceItems.mini_quiz.items.length}` +
    `  extra_practice ${practiceItems.extra_practice.items.length}`,
);

// ── 1. the gates ────────────────────────────────────────────────────────────

console.log('\nLIVE SHAPE -- Part 5 present and stored');
check('practice.gradable is 10, not 16', () =>
  live.practice.gradable === 10 || `got ${live.practice.gradable}`);
check('mini_quiz.gradable is 4', () =>
  live.mini_quiz.gradable === 4 || `got ${live.mini_quiz.gradable}`);
check('practice gate still requires 7', () =>
  requiredCorrect('practice', live.practice.gradable) === 7 ||
  `got ${requiredCorrect('practice', live.practice.gradable)}`);
check('quiz gate still requires 3', () =>
  requiredCorrect('quiz', live.mini_quiz.gradable) === 3 ||
  `got ${requiredCorrect('quiz', live.mini_quiz.gradable)}`);
check('a student at 7 of 10 keeps the practice gate open', () =>
  snapshot.practice_correct >= requiredCorrect('practice', live.practice.gradable));
check('the topic still reads complete', () => isTopicComplete(snapshot) === true);
check('the lesson still reads past', () => isPastLesson(snapshot) === true);

console.log('\nFAULTED SHAPE -- Part 5 folded into practice (the bug this design avoids)');
const faultChecks = [
  ['practice.gradable is 10, not 16', () =>
    fault.practice.gradable === 10 || `got ${fault.practice.gradable}`],
  ['practice gate still requires 7', () =>
    requiredCorrect('practice', fault.practice.gradable) === 7 ||
    `got ${requiredCorrect('practice', fault.practice.gradable)}`],
  ['a student at 7 of 10 keeps the practice gate open', () =>
    snapshot.practice_correct >= requiredCorrect('practice', fault.practice.gradable) ||
    `needs ${requiredCorrect('practice', fault.practice.gradable)}, has 7`],
];

let faultCaught = 0;
for (const [label, fn] of faultChecks) {
  let passed = false;
  try {
    passed = fn() === true;
  } catch {
    passed = false;
  }
  if (!passed) faultCaught++;
  console.log(`  ${passed ? 'PASSED (check is inert!)' : 'failed as required'}  ${label}`);
}
checks++;
if (faultCaught !== faultChecks.length) {
  failures++;
  console.log(
    `  FAIL  only ${faultCaught} of ${faultChecks.length} gate checks fail on the faulted ` +
      `shape; the rest would pass whatever this change did`,
  );
} else {
  console.log(
    `  ok    all ${faultChecks.length} gate checks fail on the faulted shape, so they are ` +
      `measuring the thing they claim to`,
  );
}

// ── 2. the worksheet pool, which SHOULD see all three ───────────────────────

console.log('\nWORKSHEET POOL -- the one consumer that must see Part 5');
const entries = poolEntries(practiceItems);
check('pool is 20 entries: 10 + 4 + 6', () =>
  entries.length === 20 || `got ${entries.length}`);
check('6 of them are extra_practice', () =>
  entries.filter((e) => e.section === 'extra_practice').length === 6);
check('every extra_practice entry carries a band', () =>
  entries.filter((e) => e.section === 'extra_practice').every((e) => e.level != null));
check('a Basic-only draw can now reach 6, up from 4 practice + 4 quiz', () =>
  countEligible(entries, { levels: ['Basic'] }) === 10 ||
  `got ${countEligible(entries, { levels: ['Basic'] })}`);

const candidates = entries.map((e, i) => ({
  ...e,
  ref: { source: 'static', topic_id: 'GR.2.6', section: e.section, item_number: i + 1 },
}));
const drawn = selectItems([{ topic_id: 'GR.2.6', candidates }], { count: 18, seed: 4242 });
check('a single topic can now fill an 18-question worksheet (14 before)', () =>
  drawn.refs.length === 18 || `got ${drawn.refs.length}, shortfall ${drawn.shortfall}`);
check('the draw reaches into extra_practice', () =>
  drawn.refs.some((r) => r.section === 'extra_practice'));

// ── 3. the copied sectionShape has not drifted ──────────────────────────────

console.log('\nSOURCE GUARD');
const progressSrc = await import('node:fs').then((fs) =>
  fs.readFileSync(path.join(ROOT, 'app/lib/curriculum-progress.ts'), 'utf8'),
);
check('curriculum-progress.ts still builds its shape from two NAMED keys', () =>
  /practice:\s*sectionShape\(row\.practice_items\?\.practice\)/.test(progressSrc) &&
  /mini_quiz:\s*sectionShape\(row\.practice_items\?\.mini_quiz\)/.test(progressSrc));
check('and does not iterate practice_items to build it', () =>
  !/for\s*\(const\s+\w+\s+of\s+Object\.keys\(row\.practice_items/.test(progressSrc));
check('sectionShape still counts multiple_choice only', () =>
  /items\.filter\(\(item\) => item\.format === 'multiple_choice'\)\.length/.test(progressSrc));

const schemas = await import('node:fs').then((fs) =>
  fs.readFileSync(path.join(ROOT, 'app/lib/schemas.ts'), 'utf8'),
);
check('the student grading API still refuses any section but practice/mini_quiz', () =>
  (schemas.match(/z\.enum\(\["practice", "mini_quiz"\]/g) ?? []).length === 2);

// The teacher-facing answer key on the topic page. splitAnswerKey now returns a
// third section, and the one component that consumes the whole object has to
// keep reaching into it BY NAME -- an Object.entries() here would start
// rendering extra-practice solutions onto the quiz page.
const gumuGate = await import('node:fs').then((fs) =>
  fs.readFileSync(
    path.join(ROOT, 'app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/GumuGate.tsx'),
    'utf8',
  ),
);
check('GumuGate reads entries.practice and entries.mini_quiz by name', () =>
  /entries\.practice/.test(gumuGate) && /entries\.mini_quiz/.test(gumuGate));
check('GumuGate does not iterate the answer key object', () =>
  !/Object\.(keys|entries|values)\(entries\)/.test(gumuGate));

// ─── The rendered answer key ─────────────────────────────────────────────────
//
// THE BASIS OF THESE THREE CHECKS CHANGED, AND THE OLD ONE MUST NOT COME BACK.
//
// They used to compare the WORKING TREE against HEAD. `previous` was
// `git show HEAD:<topic>`, `keyAfter` was the file on disk, and the assertions
// read "practice and mini_quiz are byte-identical to HEAD, and extra_practice
// went from 0 entries to 6".
//
// That is a diff guard, and a diff guard against HEAD is alive for exactly one
// branch. It self-invalidates the moment its own PR merges, because HEAD then
// BECOMES the after-state:
//
//   before e42ccb8 merged   HEAD = b8db578, no Part 5    keyBefore.extra = 0  ok
//   after  e42ccb8 merged   HEAD = e42ccb8, has Part 5   keyBefore.extra = 6  dead
//
// So `keyBefore.extra_practice.length === 0` was unsatisfiable from the merge
// onward, and the check sat red on main for every commit after it. Measured
// rather than reasoned: on current main the working tree and HEAD are
// byte-identical, and both sides parse to practice=10, mini_quiz=4,
// extra_practice=6.
//
// THE TWO SIBLINGS WERE WORSE, because they were GREEN. Comparing HEAD to
// itself, "byte-identical to HEAD" is true of any content whatsoever: they
// reported ok while asserting nothing at all. A check that cannot fail is the
// failure this whole file exists to refuse, and it was sitting two lines above
// the one that could not pass.
//
// The replacement states the invariant absolutely, against current content, so
// it means the same thing on every commit forever. What is being protected is
// unchanged: Part 5 exists, it is six entries, and it did not leak into either
// gated section. The counts below are the shape GR.2.6 has had since e42ccb8,
// and the control block after them proves each one can still fail.
//
// DO NOT REINTRODUCE A HEAD DIFF HERE. If a future change needs to prove "this
// commit did not alter X", that belongs in review or in a fixture committed
// alongside, not in an assertion that decays into a lie the day it lands.
const EXPECTED_KEY = { practice: 10, mini_quiz: 4, extra_practice: 6 };

const part4 = (text) => {
  const from = text.indexOf('#### **Part 4:');
  const to = text.indexOf('#### **Part 5:');
  return text.slice(from, to === -1 ? text.length : to);
};
const { splitAnswerKey } = await import('../lib/curriculum-utils.ts');
const { readFileSync } = await import('node:fs');
const answerKey = splitAnswerKey(part4(readFileSync(TOPIC, 'utf8')));

/**
 * One section of the key, asserted by count AND by contents.
 *
 * THE COUNT ALONE IS NOT ENOUGH, which is the lesson of the checks this
 * replaces. `length === 6` is satisfied by six empty objects, so a parser change
 * that produced the right number of blanks would pass. Every entry therefore has
 * to carry the two fields the teacher-facing page renders.
 *
 * Returns a string rather than false on failure, so the report names the number
 * it actually found instead of only that it disagreed.
 */
function keySection(key, section, expected) {
  const entries = key[section];
  if (!Array.isArray(entries)) return `section is absent from the parsed key`;
  if (entries.length !== expected) return `${entries.length} entries, expected ${expected}`;
  const blank = entries.findIndex((e) => !e.item_number || !e.solution_html);
  if (blank !== -1) return `entry ${blank + 1} carries no item_number or no solution`;
  return true;
}

for (const [section, expected] of Object.entries(EXPECTED_KEY)) {
  check(`answerKey.${section} holds exactly ${expected} rendered entries`, () =>
    keySection(answerKey, section, expected));
}

// ─── and the three can still fail ────────────────────────────────────────────
//
// The same control the gate checks get above, for the same reason: three
// assertions that were just rewritten are three assertions nobody has watched
// fail. Each fault below is a way this could actually go wrong -- a lost entry,
// an emptied section, Part 5 folded back into the gated pool (the naive
// implementation this feature exists to prevent), and a blank that keeps the
// count right -- and the section it targets must report failure.
const keyFaults = [
  {
    label: 'extra_practice loses one entry',
    section: 'extra_practice',
    apply: (k) => ({ ...k, extra_practice: k.extra_practice.slice(0, -1) }),
  },
  {
    label: 'extra_practice is emptied',
    section: 'extra_practice',
    apply: (k) => ({ ...k, extra_practice: [] }),
  },
  {
    label: 'Part 5 is folded back into practice',
    section: 'practice',
    apply: (k) => ({ ...k, practice: [...k.practice, ...k.extra_practice], extra_practice: [] }),
  },
  {
    label: 'mini_quiz loses one entry',
    section: 'mini_quiz',
    apply: (k) => ({ ...k, mini_quiz: k.mini_quiz.slice(0, -1) }),
  },
  {
    label: 'an extra_practice solution is blanked, count intact',
    section: 'extra_practice',
    apply: (k) => ({
      ...k,
      extra_practice: k.extra_practice.map((e, i) =>
        i === 0 ? { ...e, solution_html: '' } : e),
    }),
  },
];

let keyFaultsCaught = 0;
for (const fault of keyFaults) {
  const result = keySection(fault.apply(answerKey), fault.section, EXPECTED_KEY[fault.section]);
  const caught = result !== true;
  if (caught) keyFaultsCaught++;
  console.log(
    `  ${caught ? 'failed as required' : 'PASSED (check is inert!)'}  ` +
      `${fault.label}  -- answerKey.${fault.section}${caught ? `: ${result}` : ''}`,
  );
}
checks++;
if (keyFaultsCaught !== keyFaults.length) {
  failures++;
  console.log(
    `  FAIL  only ${keyFaultsCaught} of ${keyFaults.length} answer-key faults were caught; ` +
      `the rest would pass whatever the content did`,
  );
} else {
  console.log(
    `  ok    all ${keyFaults.length} answer-key faults are caught, so the three counts above ` +
      `are measuring the content and not the parser`,
  );
}

console.log(
  `\n${checks} check(s), ${failures} failure(s)` +
    (failures ? '' : ' -- Part 5 is invisible to every gate and visible to the worksheet'),
);
process.exit(failures ? 1 : 0);
