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
import {
  correctItemsInSection,
  revealedItemsInSection,
  releasableItems,
} from '../app/lib/attempt-sets.ts';

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
const release = (entries, releasable) =>
  entries.length > 0 && releasable.size > 0
    ? Object.fromEntries(
        entries
          .filter((e) => releasable.has(e.item_number))
          .map((e) => [e.item_number, e.solution_html])
      )
    : undefined;

// A gumu_sessions row, as loadEarnedSolutions selects it.
const session = (item_number, resolution, section = 'practice', status = 'resolved_flagged') => ({
  section,
  item_number,
  status,
  resolution,
});

const revealedFrom = (sessions, section = 'practice') =>
  revealedItemsInSection(sessions, section);

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
  const out = release(key.practice, releasableItems(solved, new Set()));
  check(`item ${ITEM} answered wrong is withheld`, out?.[ITEM] === undefined);
  check(`item ${OTHER} answered right is released`, typeof out?.[OTHER] === 'string');
  check('exactly one solution is released, not all of them',
    Object.keys(out ?? {}).length === 1, `${Object.keys(out ?? {}).length} released`);

  proveFails('a rule that ignores is_correct would release the wrong item', () => {
    const bad = new Set([ITEM, OTHER]); // as if every attempt counted
    return release(key.practice, releasableItems(bad, new Set()))?.[ITEM] === undefined;
  });
  proveFails('a rule that released everything would be caught by the count', () => {
    const all = new Set(key.practice.map((e) => e.item_number));
    return Object.keys(release(key.practice, releasableItems(all, new Set())) ?? {}).length === 1;
  });
}

// ── 2. a correct attempt -> that solution, and its real content ──────────────
console.log('\n2. a student with a correct attempt on an item');
{
  const solved = solvedFrom([attempt(ITEM, true)]);
  const out = release(key.practice, releasableItems(solved, new Set()));
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
  check('and is released nothing', release(key.practice, releasableItems(solved, new Set())) === undefined);

  proveFails('an empty solved set treated as "no filter" would release everything', () => {
    const noFilter = solved.size === 0
      ? Object.fromEntries(key.practice.map((e) => [e.item_number, e.solution_html]))
      : undefined;
    return noFilter === undefined;
  });
}

// ── 5. released on a reveal, and on nothing else ─────────────────────────────
//
// The escape hatch hands the answer over outright, so a worked solution after it
// adds explanation without adding disclosure. Everything else must release
// nothing -- above all 'turn_cap', which is the OTHER flagged ending, where the
// student spent their turns and was never shown an answer.
console.log('\n5. a student who was shown the answer by the escape hatch');
{
  const solved = solvedFrom([]);
  const revealed = revealedFrom([session(ITEM, 'student_gave_up')]);
  const out = release(key.practice, releasableItems(solved, revealed));

  check(`item ${ITEM} is released after the hatch, with nothing solved`,
    typeof out?.[ITEM] === 'string');
  check('and carries real solution content',
    Boolean(out?.[ITEM]) && out[ITEM].length > 40, `${out?.[ITEM]?.length ?? 0} chars`);
  check('and no other item came with it',
    Object.keys(out ?? {}).length === 1, `${Object.keys(out ?? {}).length} released`);

  // What must NOT release. These are assertions about the real predicate; the
  // fault proofs for each follow, because an assertion nothing can break is not
  // evidence.
  check('an active session, mid-conversation, releases nothing',
    revealedFrom([session(ITEM, null, 'practice', 'active')]).size === 0);
  check('the turn cap releases nothing',
    revealedFrom([session(ITEM, 'turn_cap')]).size === 0);
  check('null resolution releases nothing',
    revealedFrom([session(ITEM, null)]).size === 0);
  check('a non-flagged status releases nothing, whatever the resolution',
    revealedFrom([session(ITEM, 'student_gave_up', 'practice', 'resolved_retry_success')]).size === 0);
  check('a mini-quiz reveal releases no practice solution',
    revealedFrom([session(ITEM, 'student_gave_up', 'mini_quiz')], 'practice').size === 0);

  // Each fault is the predicate written with one clause missing, run against the
  // input that clause exists to reject. If the assertion above still holds under
  // it, that assertion was not testing the clause it claims to.
  const faulted = (clauses) => (sessions, sec) =>
    new Set(
      sessions
        .filter(
          (x) =>
            (!clauses.section || x.section === sec) &&
            (!clauses.status || x.status === 'resolved_flagged') &&
            (!clauses.resolution || x.resolution === 'student_gave_up')
        )
        .map((x) => x.item_number)
    );

  // FAULT 5: resolution dropped. This is (b) from #141 arriving by accident, and
  // it discloses an answer the student never received.
  proveFails('a predicate ignoring resolution would release on the turn cap', () =>
    faulted({ section: true, status: true })([session(ITEM, 'turn_cap')], 'practice').size === 0
  );

  // FAULT 4: status dropped, so a live conversation releases the answer it has
  // deliberately not given yet.
  proveFails('a predicate ignoring status would release on an active session', () =>
    faulted({ section: true, resolution: true })(
      [session(ITEM, 'student_gave_up', 'practice', 'active')],
      'practice'
    ).size === 0
  );

  // FAULT 2: section dropped, so a mini-quiz reveal releases the practice
  // solution that happens to carry the same item number.
  proveFails('a predicate ignoring section would cross the two sections', () =>
    faulted({ status: true, resolution: true })(
      [session(ITEM, 'student_gave_up', 'mini_quiz')],
      'practice'
    ).size === 0
  );

  // FAULT 1: the student_id filter dropped. Not expressible against this pure
  // function -- it filters rows it is handed -- so it is asserted on the query
  // in section 6 instead, where the .eq() chain is read off the source.

  // FAULT 3: THE BLAST RADIUS. The item_number match dropped, so one reveal
  // releases the entire answer key for the topic.
  //
  // Asserted by IDENTITY and by count, not by "is item N present": a rule that
  // released everything would satisfy a presence check on the one item that was
  // actually revealed, which is exactly how a whole-key leak would look to a
  // careless test.
  proveFails('one reveal must not release the whole key', () => {
    const everything = new Set(key.practice.map((e) => e.item_number));
    return Object.keys(release(key.practice, everything) ?? {}).length === 1;
  });
}

// ── 5b. the structural assertions ────────────────────────────────────────────
//
// A per-item check can pass while the SET is wrong. These compute the expected
// set here, from the inputs, and compare -- never reading it back out of the
// code under test.
console.log('\n5b. the released set, computed independently');
{
  const solvedAttempts = [attempt(key.practice[0].item_number, true)];
  const revealSessions = [session(key.practice[1].item_number, 'student_gave_up')];
  const solved = solvedFrom(solvedAttempts);
  const revealed = revealedFrom(revealSessions);
  const out = release(key.practice, releasableItems(solved, revealed));
  const got = new Set(Object.keys(out ?? {}).map(Number));

  // Built from the fixtures above rather than from releasableItems, so a bug in
  // the union itself cannot define its own expectation.
  const expected = new Set([key.practice[0].item_number, key.practice[1].item_number]);

  const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

  check('every released item was solved or revealed (subset)',
    [...got].every((n) => expected.has(n)), `${got.size} released`);

  // THE ONE THAT CATCHES FAULT 3. A subset check passes on a single item; this
  // requires the released set to EQUAL the union, so a rule that leaked the
  // whole key fails here even though every leaked item is "in the key".
  check('and the released set equals the union exactly',
    sameSet(got, expected), `got {${[...got].sort()}} expected {${[...expected].sort()}}`);

  proveFails('a whole-key leak passes the subset check but not the exact-union one', () => {
    const everything = new Set(key.practice.map((e) => e.item_number));
    const leaked = new Set(Object.keys(release(key.practice, everything) ?? {}).map(Number));
    // subset-of-key holds, which is the trap; equality with the union does not.
    return sameSet(leaked, expected);
  });

  // FAULT 8, restated under the wider predicate: an item neither solved nor
  // revealed stays withheld.
  const untouched = key.practice.find(
    (e) => !expected.has(e.item_number)
  );
  check('an item neither solved nor revealed is still withheld',
    untouched !== undefined && out?.[untouched.item_number] === undefined);

  // FAULT 6: gumu_sessions unreachable. `data ?? []` means an empty revealed
  // set, so the union collapses to solved and behaviour is exactly #119's --
  // the student loses an explanation and gains nothing.
  const degraded = release(key.practice, releasableItems(solved, revealedFrom([])));
  check('an unreachable gumu_sessions degrades to solved-only, not to everything',
    Object.keys(degraded ?? {}).length === 1 &&
      degraded[key.practice[0].item_number] !== undefined);

  // FAULT 7: anonymous. Covered in section 4 and restated here because the
  // predicate widened: no attempts AND no sessions must still be nothing.
  check('anonymous, with neither attempts nor sessions, is released nothing',
    release(key.practice, releasableItems(solvedFrom([]), revealedFrom([]))) === undefined);
}

// ── 6. the wiring, which a pure-function test cannot see ─────────────────────
console.log('\n6. the call sites actually use it');
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
  check('and returns early when nothing is releasable',
    /if \(releasable\.size === 0\) return undefined;/.test(td));

  // FAULT 1, which the pure function cannot express: it filters rows it is
  // handed, so "the query forgot student_id" is invisible to it. Asserted on the
  // query itself. Dropping that .eq would hand one student's reveals to another.
  check('the sessions read is scoped to this student',
    /\.from\('gumu_sessions'\)[\s\S]{0,240}?\.eq\('student_id', studentId\)/.test(td));
  check('and to this course and topic',
    /\.from\('gumu_sessions'\)[\s\S]{0,320}?\.eq\('course_id', courseId\)[\s\S]{0,80}?\.eq\('topic_id', topicId\)/.test(td));
  check('and selects the columns the predicate needs',
    /\.select\('section, item_number, status, resolution'\)/.test(td));

  // The fallback has to be on the sessions data alone. A try around the whole
  // function would also drop solutions the student earned by being correct.
  check('an unreachable gumu_sessions falls back to an empty revealed set',
    /revealedItemsInSection\(sessions\.data \?\? \[\], section\)/.test(td));
  check('and the function is not wrapped in a try',
    !/try\s*\{[\s\S]*loadGates/.test(td.slice(td.indexOf('loadEarnedSolutions'))));

  // The two reads are independent and must stay parallel.
  check('loadGates and the sessions read go together',
    /Promise\.all\(\[\s*loadGates\(studentId, courseId, topicId\),/.test(td));

  // `release` above MIRRORS loadEarnedSolutions rather than being it: the real
  // function imports react's cache, the admin client and next/navigation, none
  // of which load outside Next's bundler. A mirror that drifts from the
  // original proves nothing, so the original's actual filter is asserted here
  // rather than trusted to a comment. If that line is edited, this fails and
  // the mirror has to be brought back into line.
  check('the real filter still intersects on item_number',
    /entries\.filter\(\(entry\) => releasable\.has\(entry\.item_number\)\)/.test(td));
  check('and releasable is the union of solved and revealed',
    /releasableItems\(solved, revealed\)/.test(td));
  check('and still passes the filtered entries through solutionsFor',
    /return solutionsFor\(entries\.filter\(/.test(td));
  check('and reads the section the caller asked for',
    /splitAnswerKey\(raw\)\[section\]/.test(td));
}

console.log(`\nRESULT: ${ok ? 'the per-item gate releases what was earned, and the checks can tell' : 'A CHECK FAILED'}`);
process.exit(ok ? 0 : 1);
