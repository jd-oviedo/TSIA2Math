// faultproof_grades_extract.mjs -- prove the extracted grade reducer returns
// BYTE-IDENTICAL results to the loop it was lifted out of.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/faultproof_grades_extract.mjs
//   node --import ./scripts/ts-alias-hook.mjs scripts/faultproof_grades_extract.mjs --fault=ever-correct
//   node --import ./scripts/ts-alias-hook.mjs scripts/faultproof_grades_extract.mjs --fault=denominator
//   node --import ./scripts/ts-alias-hook.mjs scripts/faultproof_grades_extract.mjs --fault=sort
//   node --import ./scripts/ts-alias-hook.mjs scripts/faultproof_grades_extract.mjs --fault=section-merge
//   node --import ./scripts/ts-alias-hook.mjs scripts/faultproof_grades_extract.mjs --fault=blend
//
// WHAT IS AT STAKE. app/dashboard/grades is LIVE. Students read their scores off
// a reducer that was inline in the page, and Build 3 moves it into
// app/lib/grades.ts so a teacher can be shown the same number. If the extract
// changes the arithmetic by so much as one item, every student's score changes
// silently and nothing fails.
//
// SO THE ORIGINAL IS FROZEN, VERBATIM, IN THIS FILE. referenceReducer below is
// app/dashboard/grades/page.tsx:35-61 as it stood at commit ae0e486, copied
// character for character apart from the topic-NAME lookup, which is display
// metadata rather than arithmetic and stays in the page. It is the oracle. It is
// never edited again, and it is deliberately NOT imported from anywhere: the
// point of an oracle is that it cannot move when the thing under test moves.
//
// WHY A FAULT RUN AND NOT JUST A GREEN MATRIX. A matrix that only ever watches
// two implementations agree cannot tell "identical" from "both broken the same
// way", and both look exactly the same in a green run. So five plausible
// mis-extractions are applied to the REAL source file and each one must redden
// EXACTLY the cases named against it:
//
//   ever-correct   3, 5        a retry stops replacing the earlier answer
//   denominator    3           the mastery denominator wired into latest
//   sort           3, 4, 5, 9  the winner picked by the wrong end of time
//   section-merge  6           practice and quiz items collide
//   blend          6           practice folded into the quiz bucket
//
// TOO FEW REDDENED means the case was not load-bearing. TOO MANY is just as bad
// and is the failure people forget: a fault that reddens everything has probably
// broken the module rather than the property.
//
// THE FAULT IS A REAL EDIT TO REAL SOURCE TEXT. app/lib/grades.ts is read from
// disk, the fault's exact target string is asserted present and replaced, and
// the result is written to a temp module beside it and imported. A fault whose
// target has moved FAILS LOUDLY rather than silently applying to nothing --
// which is how a fault run quietly becomes decoration.
//
// A temp module rather than an in-place edit (the shape
// faultproof_assignments.mjs uses) because nothing here needs a rebuilt server:
// this is a pure function, so a copy in the same directory resolves the same
// two imports and runs the same code. It also means a crash mid-run cannot
// leave a faulted grades.ts on disk.
//
// NO next build, NO Supabase, NO browser. Runs in seconds.

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const SRC = path.resolve('app/lib/grades.ts');

// ─── THE ORACLE ──────────────────────────────────────────────────────────────

/**
 * app/dashboard/grades/page.tsx:35-61, frozen at ae0e486.
 *
 * The only edit is the removal of `topic: topicNames.get(...) ?? topicId`, a
 * display-name lookup that is not part of the score and that stays in the page.
 * Everything else -- the `!latest.has(key)` first-wins, the `${a.section}` in
 * both keys, the `total += 1` per distinct item, the `>` string comparison on
 * created_at -- is the original text.
 *
 * IT DEPENDS ON ITS INPUT BEING NEWEST-FIRST, exactly as the page did, because
 * getAttempts orders created_at descending. That dependency is the reason case 9
 * exists.
 */
function referenceReducer(attempts) {
  const latest = new Map();
  for (const a of attempts) {
    const key = `${a.course_id}:${a.topic_id}:${a.section}:${a.item_number}`;
    if (!latest.has(key)) latest.set(key, { is_correct: a.is_correct, created_at: a.created_at });
  }

  const byTopicSection = new Map();
  for (const [key, value] of latest) {
    const [courseId, topicId, section] = key.split(':');
    const rowKey = `${courseId}:${topicId}:${section}`;
    const existing = byTopicSection.get(rowKey);
    if (existing) {
      existing.total += 1;
      if (value.is_correct) existing.correct += 1;
      if (value.created_at > existing.last) existing.last = value.created_at;
    } else {
      byTopicSection.set(rowKey, {
        key: rowKey,
        section,
        correct: value.is_correct ? 1 : 0,
        total: 1,
        last: value.created_at,
      });
    }
  }
  return byTopicSection;
}

// ─── The faults ──────────────────────────────────────────────────────────────
//
// `expect` names the case numbers the fault MUST redden, and no others.

const FAULTS = {
  'ever-correct': {
    describe: 'a retry no longer replaces the earlier answer (mastery smuggled into latest)',
    expect: [3, 5],
    find: `      winner.set(key, {
        is_correct: a.is_correct,
        created_at: a.created_at,
        section: a.section,
        courseId: a.course_id,
        topicId: a.topic_id,
      });
    }
  }`,
    replace: `      winner.set(key, {
        is_correct: a.is_correct || Boolean(held && held.is_correct),
        created_at: a.created_at,
        section: a.section,
        courseId: a.course_id,
        topicId: a.topic_id,
      });
    } else if (a.is_correct) {
      // "mastery counts up, never down" -- correctInSection's rule, applied
      // where the latest-attempt rule belongs.
      held.is_correct = true;
    }
  }`,
  },

  denominator: {
    describe: "latest's denominator wired to the topic's gradable count instead of items attempted",
    expect: [3],
    find: `      quiz: {
        latest: latest.get(sectionKey(a.course_id, a.topic_id, 'mini_quiz')) ?? null,
        mastery: mastery.get(sectionKey(a.course_id, a.topic_id, 'mini_quiz')) ?? null,
      },
      practice: {
        latest: latest.get(sectionKey(a.course_id, a.topic_id, 'practice')) ?? null,
        mastery: mastery.get(sectionKey(a.course_id, a.topic_id, 'practice')) ?? null,
      },`,
    replace: `      quiz: {
        latest: (() => {
          const l = latest.get(sectionKey(a.course_id, a.topic_id, 'mini_quiz'));
          const m = mastery.get(sectionKey(a.course_id, a.topic_id, 'mini_quiz'));
          return l ? { ...l, total: m ? m.total : l.total } : null;
        })(),
        mastery: mastery.get(sectionKey(a.course_id, a.topic_id, 'mini_quiz')) ?? null,
      },
      practice: {
        latest: (() => {
          const l = latest.get(sectionKey(a.course_id, a.topic_id, 'practice'));
          const m = mastery.get(sectionKey(a.course_id, a.topic_id, 'practice'));
          return l ? { ...l, total: m ? m.total : l.total } : null;
        })(),
        mastery: mastery.get(sectionKey(a.course_id, a.topic_id, 'practice')) ?? null,
      },`,
  },

  sort: {
    describe: 'the winning attempt picked by the wrong end of time (earliest, not latest)',
    expect: [3, 4, 5, 9],
    find: `    if (!held || a.created_at > held.created_at) {`,
    replace: `    if (!held || a.created_at < held.created_at) {`,
  },

  'section-merge': {
    describe: 'the per-item key drops the section, so practice and quiz items collide',
    expect: [6],
    find: `    const key = sectionKey(a.course_id, a.topic_id, a.section) + \`:\${a.item_number}\`;`,
    replace: `    const key = topicKey(a.course_id, a.topic_id) + \`:\${a.item_number}\`;`,
  },

  blend: {
    describe: 'practice folded into the quiz bucket',
    expect: [6],
    find: `  const out = new Map<string, SectionScore>();
  for (const w of winner.values()) {
    const key = sectionKey(w.courseId, w.topicId, w.section);`,
    replace: `  const out = new Map<string, SectionScore>();
  for (const w of winner.values()) {
    const key = sectionKey(w.courseId, w.topicId, w.section === 'practice' ? 'mini_quiz' : w.section);`,
  },
};

// ─── The fixture matrix ──────────────────────────────────────────────────────
//
// EVERY CASE CARRIES ITS OWN SHAPES, and every case except 3 is authored so the
// topic's gradable count EQUALS the number of distinct items attempted. That is
// not padding: it is what makes the `denominator` fault redden case 3 alone
// rather than the whole matrix, and case 3 is Vic's real data, where he answered
// three of a four-item quiz.
//
// CASE 6 IS THE ONLY TWO-SECTION FIXTURE, deliberately, so `section-merge` and
// `blend` each have exactly one place to show up. Case 10 puts its non-gradable
// section on the QUIZ rather than on practice for the same reason -- and it
// costs nothing, because latestAttemptScores never consults a shape at all,
// which is precisely the property case 10 pins.

const T = 'tsia2-math';
const A = (topic, section, item, correct, at) => ({
  course_id: T,
  topic_id: topic,
  section,
  item_number: item,
  is_correct: correct,
  created_at: at,
});
const shape = (practice, quiz) => ({ practice: { gradable: practice }, mini_quiz: { gradable: quiz } });

const CASES = [
  {
    n: 1,
    name: 'empty attempt log',
    why: 'an empty map, not a throw',
    rows: [],
    shapes: new Map(),
  },
  {
    n: 2,
    name: 'one right, one wrong, no retries',
    why: 'the base case both definitions agree on',
    rows: [A('QR.2.1', 'mini_quiz', 2, false, '2026-08-10T10:00:02Z'), A('QR.2.1', 'mini_quiz', 1, true, '2026-08-10T10:00:01Z')],
    shapes: new Map([[`${T}:QR.2.1`, shape(10, 2)]]),
  },
  {
    n: 3,
    name: "GR.4.3, vics8388's real rows",
    why: 'the live disagreement: right, then missed on retry, three of four items opened',
    rows: [
      A('GR.4.3', 'mini_quiz', 2, false, '2026-08-19T13:37:14.867155+00:00'),
      A('GR.4.3', 'mini_quiz', 1, true, '2026-08-19T13:37:11.556376+00:00'),
      A('GR.4.3', 'mini_quiz', 3, false, '2026-08-18T01:43:19.638684+00:00'),
      A('GR.4.3', 'mini_quiz', 2, true, '2026-08-18T01:43:16.053719+00:00'),
      A('GR.4.3', 'mini_quiz', 1, true, '2026-08-18T01:43:11.132351+00:00'),
      A('GR.4.3', 'mini_quiz', 1, false, '2026-08-18T01:43:01.291202+00:00'),
      A('GR.4.3', 'mini_quiz', 1, false, '2026-08-18T01:42:46.690870+00:00'),
    ],
    shapes: new Map([[`${T}:GR.4.3`, shape(10, 4)]]),
  },
  {
    n: 4,
    name: 'retry wrong then right',
    why: 'latest must count the improvement',
    rows: [A('AR.1.2', 'mini_quiz', 1, true, '2026-08-11T09:00:02Z'), A('AR.1.2', 'mini_quiz', 1, false, '2026-08-11T09:00:01Z')],
    shapes: new Map([[`${T}:AR.1.2`, shape(10, 1)]]),
  },
  {
    n: 5,
    name: 'retry right then wrong',
    why: 'latest must count the regression -- the case mastery refuses',
    rows: [A('AR.1.3', 'mini_quiz', 1, false, '2026-08-11T09:00:02Z'), A('AR.1.3', 'mini_quiz', 1, true, '2026-08-11T09:00:01Z')],
    shapes: new Map([[`${T}:AR.1.3`, shape(10, 1)]]),
  },
  {
    n: 6,
    name: 'practice and quiz on one topic, colliding item numbers',
    why: 'the sections must never merge and must never sum',
    rows: [
      A('GR.2.2', 'mini_quiz', 2, false, '2026-08-12T12:00:04Z'),
      A('GR.2.2', 'mini_quiz', 1, true, '2026-08-12T12:00:03Z'),
      A('GR.2.2', 'practice', 2, true, '2026-08-12T12:00:02Z'),
      A('GR.2.2', 'practice', 1, true, '2026-08-12T12:00:01Z'),
    ],
    shapes: new Map([[`${T}:GR.2.2`, shape(2, 2)]]),
  },
  {
    n: 7,
    name: 'two topics, interleaved timestamps',
    why: 'bucketing must be by topic, not by adjacency in the log',
    rows: [
      A('QR.1.6', 'mini_quiz', 2, true, '2026-08-13T08:00:04Z'),
      A('QR.1.5', 'mini_quiz', 2, false, '2026-08-13T08:00:03Z'),
      A('QR.1.6', 'mini_quiz', 1, false, '2026-08-13T08:00:02Z'),
      A('QR.1.5', 'mini_quiz', 1, true, '2026-08-13T08:00:01Z'),
    ],
    shapes: new Map([
      [`${T}:QR.1.5`, shape(10, 2)],
      [`${T}:QR.1.6`, shape(10, 2)],
    ]),
  },
  {
    n: 8,
    name: 'identical created_at on two attempts of one item',
    why: 'THE DOCUMENTED BOUNDARY. Both reducers keep the row they saw first, so they agree on a shared input order. Deliberately NOT shuffled: that is the one input on which the extract may differ, and it cannot occur -- created_at is a timestamptz written per answer at microsecond resolution.',
    rows: [A('PR.1.1', 'mini_quiz', 1, true, '2026-08-14T07:00:00Z'), A('PR.1.1', 'mini_quiz', 1, true, '2026-08-14T07:00:00Z')],
    shapes: new Map([[`${T}:PR.1.1`, shape(10, 1)]]),
  },
  {
    n: 9,
    name: 'shuffled input',
    why: 'THE ORDER-INDEPENDENCE CASE. The oracle is handed rows newest-first, which is its documented contract; the extract is handed the SAME rows shuffled. Agreement is the whole claim of the rewrite.',
    rows: [A('PR.2.1', 'mini_quiz', 2, true, '2026-08-15T06:00:03Z'), A('PR.2.1', 'mini_quiz', 1, true, '2026-08-15T06:00:02Z'), A('PR.2.1', 'mini_quiz', 1, false, '2026-08-15T06:00:01Z')],
    shuffleCandidate: true,
    shapes: new Map([[`${T}:PR.2.1`, shape(10, 2)]]),
  },
  {
    n: 10,
    name: 'attempt against a section the shape says is not gradable',
    why: 'the page counts it and progressByTopic drops it; the extract must follow the page',
    rows: [A('QR.1.1', 'mini_quiz', 1, true, '2026-08-16T05:00:01Z')],
    shapes: new Map([[`${T}:QR.1.1`, shape(0, 0)]]),
  },
  {
    n: 11,
    name: 'attempt on a topic absent from the course',
    why: 'unpublished or placeholder since it was attempted -- must not vanish or throw',
    rows: [A('ZZ.9.9', 'mini_quiz', 1, false, '2026-08-17T04:00:01Z')],
    shapes: new Map(),
  },
];

// ─── Projection and comparison ───────────────────────────────────────────────

/** Canonical, sorted, so two maps built in different orders compare equal. */
function canonical(rows) {
  return JSON.stringify(
    [...rows].sort((a, b) => a.key.localeCompare(b.key)),
    null,
    1
  );
}

function fromReference(map) {
  return [...map.values()].map((r) => ({ key: r.key, section: r.section, correct: r.correct, total: r.total, last: r.last }));
}

/** The LATEST halves of gradesFor, flattened to the oracle's shape. */
function fromCandidate(map) {
  const out = [];
  for (const [topic, g] of map) {
    for (const [section, side] of [
      ['mini_quiz', g.quiz],
      ['practice', g.practice],
    ]) {
      if (!side.latest) continue;
      out.push({
        key: `${topic}:${section}`,
        section,
        correct: side.latest.correct,
        total: side.latest.total,
        last: side.latest.lastWorkedAt,
      });
    }
  }
  return out;
}

// Deterministic shuffle, so a red run is reproducible.
function shuffled(rows) {
  const a = [...rows];
  let seed = 20260824;
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Run ─────────────────────────────────────────────────────────────────────

const arg = process.argv.find((a) => a.startsWith('--fault='));
const faultName = arg ? arg.slice('--fault='.length) : null;
if (faultName && !FAULTS[faultName]) {
  console.error(`Unknown fault "${faultName}". Known: ${Object.keys(FAULTS).join(', ')}`);
  process.exit(2);
}
const fault = faultName ? FAULTS[faultName] : null;

let tempPath = null;
let exitCode = 0;

try {
  let modulePath = SRC;

  if (fault) {
    const source = readFileSync(SRC, 'utf8');
    // A fault that matched nothing produces a CLEAN module and a fully green
    // run, which is indistinguishable from a passing check and is exactly how
    // this file would rot into decoration.
    if (!source.includes(fault.find)) {
      console.error(
        `\nFAULT "${faultName}" DID NOT MATCH.\n` +
          `The source has moved since this fault was written. Fix the fault, do not skip it.\n` +
          `Looked for:\n${fault.find}\n`
      );
      process.exit(2);
    }
    tempPath = path.resolve(`app/lib/__grades_fault_${faultName.replace(/-/g, '_')}__.ts`);
    writeFileSync(tempPath, source.replace(fault.find, fault.replace));
    modulePath = tempPath;

    console.log(`\nFAULT: ${faultName} -- ${fault.describe}`);
    console.log(`  applied to: ${path.relative(process.cwd(), tempPath)}`);
    console.log(`  must redden cases: ${fault.expect.join(', ')}\n`);
  } else {
    console.log('\nCLEAN RUN. Every case must match the frozen page reducer.\n');
  }

  const { gradesFor } = await import(pathToFileURL(modulePath).href);

  const reddened = [];

  for (const c of CASES) {
    // The oracle always gets the contract order: newest first, as getAttempts
    // delivers. Case 9 hands the candidate the same rows shuffled.
    const oracleRows = [...c.rows].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const candidateRows = c.shuffleCandidate ? shuffled(oracleRows) : oracleRows;

    const expected = canonical(fromReference(referenceReducer(oracleRows)));
    const actual = canonical(fromCandidate(gradesFor(candidateRows, c.shapes)));
    const same = expected === actual;
    if (!same) reddened.push(c.n);

    console.log(`${same ? ' ok ' : 'DIFF'}  ${String(c.n).padStart(2)}. ${c.name}`);
    if (!same) {
      console.log(`        why this case exists: ${c.why}`);
      console.log(`        oracle   ${expected.replace(/\n\s*/g, ' ')}`);
      console.log(`        extract  ${actual.replace(/\n\s*/g, ' ')}`);
    }
  }

  console.log();

  if (!fault) {
    if (reddened.length > 0) {
      console.log(`CLEAN RUN FAILED. Cases ${reddened.join(', ')} differ from the frozen reducer.`);
      console.log('The extract is NOT byte-identical. Do not ship it.');
      exitCode = 1;
    } else {
      console.log(`CLEAN RUN: all ${CASES.length} cases byte-identical to app/dashboard/grades/page.tsx:35-61.`);
    }
  } else {
    const got = [...reddened].sort((a, b) => a - b).join(',');
    const want = [...fault.expect].sort((a, b) => a - b).join(',');
    if (got === want) {
      console.log(`FAULT "${faultName}" correctly caught. Reddened exactly ${want}, as declared.`);
    } else {
      console.log(`FAULT "${faultName}" MISMATCH.`);
      console.log(`  declared: ${want || '(none)'}`);
      console.log(`  actual:   ${got || '(none)'}`);
      console.log(
        reddened.length === 0
          ? '  The fault reddened NOTHING: the matrix cannot detect this mistake and is decorative.'
          : '  Either the fault is bigger than intended, or a case is not load-bearing.'
      );
      exitCode = 1;
    }
  }
} finally {
  if (tempPath && existsSync(tempPath)) unlinkSync(tempPath);
}

process.exit(exitCode);
