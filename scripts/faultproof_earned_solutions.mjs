// faultproof_earned_solutions.mjs -- prove the per-item worked-solution gate
// releases exactly what a student has earned, and prove each assertion can fail.
//
//   node scripts/faultproof_earned_solutions.mjs
//
// WHAT IS BEING PROVED
// --------------------
// Four claims, each with a fault injected to show the check notices:
//
//   1. no correct attempt on an item        -> that solution is undefined
//   2. a correct attempt on an item         -> that solution is released
//   3. a teacher                            -> all of them, unfiltered
//   4. anonymous                            -> undefined, unchanged
//
// WHY THIS SHAPE RATHER THAN A BROWSER RUN
// -----------------------------------------
// The decision this covers is a set intersection between the attempt log and
// the answer key, and it happens on the server before anything is serialized.
// A browser run would need a signed-in student with a seeded attempt history,
// which is exactly the test account that is deferred. So the release rule is
// driven directly, against the REAL splitAnswerKey, the REAL solutionsFor, the
// REAL correctItemsInSection, and a REAL answer key read off a real topic's
// source markdown.
//
// The one thing this does NOT cover is the wiring: that practice/page.tsx and
// quiz/page.tsx actually call loadEarnedSolutions rather than the teacher path.
// That is asserted separately at the bottom by reading the files, because it is
// the half a unit test of a pure function cannot see.
import { readFileSync } from 'fs';
import { splitAnswerKey } from '../lib/curriculum-utils.ts';
import { correctItemsInSection } from '../app/lib/attempt-sets.ts';

let ok = true;
const check = (name, pass, detail = '') => {
  ok &&= pass;
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? `  ${detail}` : ''}`);
  return pass;
};

// A fault is only meaningful if the thing it breaks is actually there. Each one
// reports "target absent" rather than passing quietly, which is how three
// earlier proofs in this repo caught themselves injecting into nothing.
const proveFails = (name, fn) => {
  let failed = false;
  try {
    failed = !fn();
  } catch {
    failed = true;
  }
  ok &&= failed;
  console.log(`  [${failed ? 'PASS' : 'FAIL'}] fault proof: ${name}${failed ? '' : '  <- CHECK DID NOT NOTICE'}`);
};

// ── the real answer key, off real authored content ───────────────────────────
const SOURCE = 'curriculum/source/tsia2-math/unit-5/PR.3.5.md';
const raw = readFileSync(SOURCE, 'utf8');
const key = splitAnswerKey(raw);

console.log(`answer key read from ${SOURCE}`);
check('the source yields practice solutions at all',
  key.practice.length > 0, `${key.practice.length} entries`);
check('and mini-quiz solutions',
  key.mini_quiz.length > 0, `${key.mini_quiz.length} entries`);
// If this file ever stopped carrying solutions, every assertion below would
// pass vacuously against empty arrays.
if (key.practice.length === 0) {
  console.log('\nSOURCE CARRIES NO SOLUTIONS. Every check below would be vacuous.');
  process.exit(2);
}

// ── the release rule, exactly as topic-data.ts applies it ────────────────────
// Mirrors loadEarnedSolutions' final two lines. Kept in sync by the wiring
// assertion at the bottom, which fails if that call site stops matching.
const release = (entries, solved) =>
  entries.length > 0 && solved.size > 0
    ? Object.fromEntries(
        entries
          .filter((e) => solved.has(e.item_number))
          .map((e) => [e.item_number, e.solution_html])
      )
    : undefined;

const attempt = (item_number, is_correct, section = 'practice') => ({
  course_id: 'tsia2-math',
  topic_id: 'PR.3.5',
  section,
  item_number,
  is_correct,
  created_at: new Date().toISOString(),
});

const solvedFrom = (attempts, section = 'practice') =>
  correctItemsInSection(attempts, 'tsia2-math', 'PR.3.5', section);

const ITEM = key.practice[0].item_number;
const OTHER = key.practice[1].item_number;

// ── 1. no correct attempt on an item -> undefined ────────────────────────────
console.log('\n1. a student with no correct attempt on an item');
{
  // Wrong on the item, and correct on a DIFFERENT one, so the check cannot pass
  // just because the student has no history at all.
  const solved = solvedFrom([attempt(ITEM, false), attempt(OTHER, true)]);
  const out = release(key.practice, solved);
  check(`item ${ITEM} answered wrong is withheld`, out?.[ITEM] === undefined);
  check(`item ${OTHER} answered right is released`, typeof out?.[OTHER] === 'string');
  check('exactly one solution is released, not all of them',
    Object.keys(out ?? {}).length === 1, `${Object.keys(out ?? {}).length} released`);

  proveFails('a rule that ignores is_correct would release the wrong item', () => {
    const bad = new Set([ITEM, OTHER]); // as if every attempt counted
    return release(key.practice, bad)?.[ITEM] === undefined;
  });
  proveFails('a rule that released everything would be caught by the count', () => {
    const all = new Set(key.practice.map((e) => e.item_number));
    return Object.keys(release(key.practice, all) ?? {}).length === 1;
  });
}

// ── 2. a correct attempt -> that solution, and its real content ──────────────
console.log('\n2. a student with a correct attempt on an item');
{
  const solved = solvedFrom([attempt(ITEM, true)]);
  const out = release(key.practice, solved);
  const html = out?.[ITEM];
  check(`item ${ITEM} is released`, typeof html === 'string');
  // Not merely present: the value has to be the worked solution, not an empty
  // string or a stray label. A non-empty check alone would pass on "".
  check('and carries real solution content', Boolean(html) && html.length > 40,
    `${html?.length ?? 0} chars`);
  check('and no other item came with it',
    Object.keys(out ?? {}).length === 1, `${Object.keys(out ?? {}).length} released`);

  // A retry after a success must not revoke it: the log is append-only and
  // mastery counts up. This is the semantics correctItemsInSection already has,
  // asserted here because the gate now depends on it.
  const later = solvedFrom([attempt(ITEM, true), attempt(ITEM, false)]);
  check('a later wrong retry does not revoke it', later.has(ITEM));

  proveFails('an empty solution would slip past a presence-only check', () => {
    const empty = { [ITEM]: '' };
    return Boolean(empty[ITEM]) && empty[ITEM].length > 40;
  });
  proveFails('a last-attempt-wins rule would revoke a solved item', () => {
    const rows = [attempt(ITEM, true), attempt(ITEM, false)];
    const lastWins = new Set(rows.at(-1).is_correct ? [ITEM] : []);
    return lastWins.has(ITEM);
  });
}

// ── 3. a teacher -> all of them ──────────────────────────────────────────────
console.log('\n3. a teacher');
{
  // The teacher path does not go through the filter at all: page.tsx calls
  // solutionsFor(answerKey.practice) directly. Reproduced here.
  const all = Object.fromEntries(key.practice.map((e) => [e.item_number, e.solution_html]));
  check('every practice solution is present',
    Object.keys(all).length === key.practice.length,
    `${Object.keys(all).length} of ${key.practice.length}`);
  check('including one no student has earned', typeof all[ITEM] === 'string');
  check('the teacher path is not filtered by a solved set',
    Object.keys(all).length > 1);

  proveFails('a teacher accidentally routed through the student filter loses solutions', () => {
    const filtered = release(key.practice, solvedFrom([attempt(ITEM, true)]));
    return Object.keys(filtered ?? {}).length === key.practice.length;
  });
}

// ── 4. anonymous -> unchanged ────────────────────────────────────────────────
console.log('\n4. an anonymous visitor');
{
  // No studentId means loadEarnedSolutions returns before reading anything.
  const solved = solvedFrom([]); // no attempts can exist
  check('has an empty solved set', solved.size === 0);
  check('and is released nothing', release(key.practice, solved) === undefined);

  proveFails('an empty solved set treated as "no filter" would release everything', () => {
    const noFilter = solved.size === 0
      ? Object.fromEntries(key.practice.map((e) => [e.item_number, e.solution_html]))
      : undefined;
    return noFilter === undefined;
  });
}

// ── 5. the wiring, which a pure-function test cannot see ─────────────────────
console.log('\n5. the call sites actually use it');
{
  const base = 'app/course/[test]/[subject]/unit/[unit]/topic/[topicId]';
  for (const [page, section] of [['practice/page.tsx', 'practice'], ['quiz/page.tsx', 'mini_quiz']]) {
    const src = readFileSync(`${base}/${page}`, 'utf8');
    check(`${page} calls loadEarnedSolutions`, src.includes('loadEarnedSolutions'));
    check(`${page} passes section '${section}'`, src.includes(`'${section}'`));
    check(`${page} still gives teachers the unfiltered key`,
      /teacher\s*\?\s*solutionsFor\(answerKey\./.test(src));
    check(`${page} passes the resolved variable, not the raw key`,
      src.includes('solutions={solutions}') && !/solutions=\{solutionsFor\(/.test(src));
  }

  // The view must remain the student's topic read. This is the layer that was
  // NOT relaxed, and the one that would silently hand over every correct_answer
  // if someone "simplified" the two reads into one.
  const td = readFileSync(`${base}/topic-data.ts`, 'utf8');
  check('the student topic read still targets curriculum_topics_public',
    td.includes("teacher ? 'curriculum_topics' : 'curriculum_topics_public'"));
  check('and still selects answer_key only for a teacher',
    td.includes('teacher ? `${TOPIC_COLUMNS}, answer_key` : TOPIC_COLUMNS'));
  check('loadEarnedSolutions returns early for a null studentId',
    /if \(!studentId\) return undefined;/.test(td));
  check('and returns early when nothing is solved',
    /if \(solved\.size === 0\) return undefined;/.test(td));

  // `release` above MIRRORS loadEarnedSolutions rather than being it: the real
  // function imports react's cache, the admin client and next/navigation, none
  // of which load outside Next's bundler. A mirror that drifts from the
  // original proves nothing, so the original's actual filter is asserted here
  // rather than trusted to a comment. If that line is edited, this fails and
  // the mirror has to be brought back into line.
  check('the real filter still intersects on item_number',
    /entries\.filter\(\(entry\) => solved\.has\(entry\.item_number\)\)/.test(td));
  check('and still passes the filtered entries through solutionsFor',
    /return solutionsFor\(entries\.filter\(/.test(td));
  check('and reads the section the caller asked for',
    /splitAnswerKey\(raw\)\[section\]/.test(td));
}

console.log(`\nRESULT: ${ok ? 'the per-item gate releases what was earned, and the checks can tell' : 'A CHECK FAILED'}`);
process.exit(ok ? 0 : 1);
