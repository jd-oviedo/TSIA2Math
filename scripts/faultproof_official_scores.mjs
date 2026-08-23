// faultproof_official_scores.mjs -- prove that EVERY official-score test can be
// made to fail, and that the suite returns to green after each one.
//
//   node scripts/faultproof_official_scores.mjs
//   node scripts/faultproof_official_scores.mjs --verbose
//
// WHY A SWEEP AND NOT A HANDFUL OF SPOT FAULTS
// -------------------------------------------
// The house rule is that a check nobody has seen fail is not a check. Applied
// one fault at a time, that rule proves whichever assertions the author happened
// to think about. What it cannot tell you is which tests were never exercised at
// all -- and a test that no fault can redden is either asserting something the
// code cannot violate, or asserting nothing.
//
// So this inverts the question. It applies a fault, records the exact set of
// tests that went red, restores, and repeats. At the end it takes the UNION and
// names any test no fault ever reached. That list is the output that matters;
// the passes are just how it is computed.
//
// EVERY FAULT IS A REAL EDIT TO A REAL SOURCE FILE, applied to the file on disk
// and reverted from a copy held in memory. Nothing is stubbed, monkey-patched or
// injected: the suite loads the same modules the product loads, which is the
// only version of this that proves anything about the product.
//
// THE CONTROL RUNS FIRST AND LAST. A sweep where the suite was already red would
// report every test as covered by every fault, which is the failure mode most
// likely to look like success.

import { readFileSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';

const VERBOSE = process.argv.includes('--verbose');

const LIB = 'app/lib/official-scores.ts';
const CAP = 'app/lib/capabilities.ts';
const SUITES = ['tests/official-scores.test.ts', 'tests/capabilities.test.ts'];

const ORIGINAL = new Map([
  [LIB, readFileSync(LIB, 'utf8')],
  [CAP, readFileSync(CAP, 'utf8')],
]);

function restore() {
  for (const [file, text] of ORIGINAL) writeFileSync(file, text);
}
process.on('exit', restore);
process.on('SIGINT', () => { restore(); process.exit(130); });

/**
 * Run both suites and return the set of FAILING test names.
 *
 * TAP, not the spec reporter, because "not ok N - <name>" is a contract and the
 * pretty output is not. A parser built on ✖ and indentation breaks the first
 * time node changes a glyph, and it would break by reporting zero failures --
 * silently turning this whole file into a green rubber stamp.
 */
function runOne(suite) {
  let out;
  try {
    out = execFileSync(
      'node',
      ['--import', './scripts/ts-alias-hook.mjs', '--test', '--test-reporter=tap', suite],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
  } catch (err) {
    // Non-zero exit is the NORMAL case here: a fault is supposed to fail tests.
    out = `${err.stdout ?? ''}${err.stderr ?? ''}`;
  }
  const failing = new Set();
  const passing = new Set();
  for (const line of out.split('\n')) {
    const bad = /^\s*not ok \d+ - (.*)$/.exec(line);
    if (bad) { failing.add(bad[1].trim()); continue; }
    const good = /^\s*ok \d+ - (.*)$/.exec(line);
    if (good) passing.add(good[1].trim());
  }
  return { failing, passing };
}

/**
 * Both suites, run SEPARATELY so every test name can be attributed to its file.
 *
 * One combined run is cheaper and cannot tell tests/capabilities.test.ts apart
 * from tests/official-scores.test.ts, which matters here: capabilities.test.ts
 * is mostly about OTHER capabilities -- the free sample, the tier labels, what
 * Practice Pass buys -- and this sweep has no business demanding that a fault to
 * official-scores can redden them. Attribution is what makes the scope below
 * expressible instead of aspirational.
 */
function runSuites() {
  const failing = new Set();
  const passing = new Set();
  const byFile = new Map();
  for (const suite of SUITES) {
    const r = runOne(suite);
    byFile.set(suite, r);
    for (const t of r.failing) failing.add(t);
    for (const t of r.passing) passing.add(t);
  }
  return { failing, passing, byFile };
}

/**
 * The tests this sweep is responsible for.
 *
 * Everything in official-scores.test.ts, plus the capability tests that are
 * ABOUT official scores, named one by one. Named rather than pattern-matched on
 * the word "official": a test renamed out of that pattern would quietly leave
 * the scope, which is the same silent-shrinking failure the sweep exists to
 * catch.
 *
 * A test in scope that no fault can redden is a FAILURE. A test outside it is
 * simply not this file's business and is reported as such.
 */
const CAPABILITY_TESTS_IN_SCOPE = [
  'class-data-export separates Pro from Core, and nothing else moved',
  'a Teacher Core plan may record official scores',
  'a Teacher Pro plan may record official scores too',
  'no student plan may record an official score',
  'recording an official score and exporting one are different capabilities',
];

/** Apply one textual fault. Throws if the target has moved, never silently skips. */
function applyFault(file, find, replace) {
  const text = ORIGINAL.get(file);
  if (!text.includes(find)) {
    throw new Error(`fault target not found in ${file}:\n${find.slice(0, 120)}`);
  }
  writeFileSync(file, text.replace(find, replace));
}

// ─── The faults ──────────────────────────────────────────────────────────────
//
// Grouped by the rule each one breaks, and named for the BUG rather than for the
// edit, because the name is what appears beside an uncovered test in the report.

const FAULTS = [
  // The correction window
  ['the window is 12 hours instead of 24', LIB,
    'export const CORRECTION_WINDOW_MS = 24 * 60 * 60 * 1000;',
    'export const CORRECTION_WINDOW_MS = 12 * 60 * 60 * 1000;'],
  ['an expired row is still correctable', LIB,
    '  return now - created < windowMs;', '  return true;'],
  ['the window boundary is inclusive', LIB,
    '  return now - created < windowMs;', '  return now - created <= windowMs;'],
  ['a missing created_at fails OPEN', LIB,
    '  if (!createdAt) return false;', '  if (!createdAt) return true;'],
  ['an unparseable created_at fails OPEN', LIB,
    '  if (Number.isNaN(created)) return false;', '  if (Number.isNaN(created)) return true;'],
  ['a future timestamp counts as fresh', LIB,
    '  if (created > now) return false;', '  if (created > now) return now > 0 ? true : false;'],

  // The delta interval
  ['an unfinished run is measured against', LIB,
    '    if (s.completed_at === null) continue;', '    if (false) continue;'],
  ['a run with no score is measured against', LIB,
    '    if (s.final_score === null) continue;', '    if (s.final_score === undefined) continue;'],
  ['a run on the test date itself counts', LIB,
    '  const cutoff = Date.parse(`${testDate}T00:00:00Z`);',
    '  const cutoff = Date.parse(`${testDate}T23:59:59Z`);'],
  ['the interval picks the OLDEST run, the diagnostic', LIB,
    '  for (const s of sessionsNewestFirst) {', '  for (const s of [...sessionsNewestFirst].reverse()) {'],
  ['completed_at is used as the sort key', LIB,
    '  for (const s of sessionsNewestFirst) {',
    '  for (const s of [...sessionsNewestFirst].sort((a, b) => String(a.completed_at).localeCompare(String(b.completed_at)))) {'],
  ['a bad test date falls back to the newest run', LIB,
    '  if (Number.isNaN(cutoff)) return null;',
    '  if (Number.isNaN(cutoff)) return sessionsNewestFirst[0] ?? null;'],
  ['no qualifying run returns the newest run anyway', LIB,
    '    if (started < cutoff) return s;\n  }\n  return null;',
    '    if (started < cutoff) return s;\n  }\n  return sessionsNewestFirst[0] ?? null;'],
  ['the delta is labelled as growth since diagnostic', LIB,
    'export const DELTA_LABEL = "vs latest practice";',
    'export const DELTA_LABEL = "vs diagnostic";'],
  ['the delta column stops naming its interval', LIB,
    'export const DELTA_COLUMN = "delta_vs_latest_practice";',
    'export const DELTA_COLUMN = "delta";'],

  // The passing-score warning
  ['the warning threshold is one point above the cut score', LIB,
    '  return score >= PASSING && levels.some((l) => l !== null);',
    '  return score > PASSING && levels.some((l) => l !== null);'],
  ['the warning needs ALL four levels, not any', LIB,
    '  return score >= PASSING && levels.some((l) => l !== null);',
    '  return score >= PASSING && levels.every((l) => l !== null);'],
  ['a passing row warns even with no levels', LIB,
    '  return score >= PASSING && levels.some((l) => l !== null);',
    '  return score >= PASSING;'],
  ['a failing row with levels warns too', LIB,
    '  return score >= PASSING && levels.some((l) => l !== null);',
    '  return levels.some((l) => l !== null);'],

  // The band
  ['no practice estimate is folded into the bottom band', LIB,
    '  if (score === null) return "no_estimate";',
    '  if (score === null) return "below_college_ready";'],
  ['the approaching boundary drifts off placementBand', LIB,
    '  if (score >= 935) return "approaching";',
    '  if (score >= 930) return "approaching";'],
  ['the band emits the human label the CHECK refuses', LIB,
    '  if (score >= PASSING) return "college_ready";',
    '  if (score >= PASSING) return "College ready" as "college_ready";'],
  ['a fourth proficiency level appears', LIB,
    'export const OFFICIAL_LEVELS = ["Basic", "Proficient", "Advanced"] as const;',
    'export const OFFICIAL_LEVELS = ["Basic", "Proficient", "Advanced", "Mastery"] as const;'],

  // The de-identified aggregate
  ['an identifier leaks into the aggregate row', LIB,
    '  return {\n    official_crc_score: args.officialScore,',
    '  return {\n    student_id: "leaked",\n    official_crc_score: args.officialScore,'],
  ['the exact practice score reaches the aggregate', LIB,
    '    practice_estimate_band: practiceEstimateBand(args.practiceScore),',
    '    practice_estimate_band: args.practiceScore as never,'],
  ['the month is not coarsened', LIB,
    '  return `${m[1]}-${m[2]}-01`;', '  return value.slice(0, 10);'],
  ['an impossible month is accepted', LIB,
    '  if (month < 1 || month > 12) return null;', '  if (month < 0) return null;'],
  ['a null level is defaulted to a level', LIB,
    '    level_qr: args.levels.level_qr,', '    level_qr: args.levels.level_qr ?? "Advanced",'],

  // The roster CSV cells
  ['an official column loses its prefix', LIB,
    '  "official_score",', '  "score",'],
  ['an absent official result becomes zeroes', LIB,
    '  if (!official) return OFFICIAL_ROSTER_COLUMNS.map(() => null);',
    '  if (!official) return OFFICIAL_ROSTER_COLUMNS.map(() => 0);'],
  ['a cell is dropped and the row shifts', LIB,
    '    official.level_pr,\n    practiceScore === null ? null :',
    '    practiceScore === null ? null :'],
  ['a missing delta becomes zero', LIB,
    '    practiceScore === null ? null : official.official_crc_score - practiceScore,',
    '    official.official_crc_score - (practiceScore ?? official.official_crc_score),'],
  ['the delta sign is inverted', LIB,
    '    practiceScore === null ? null : official.official_crc_score - practiceScore,',
    '    practiceScore === null ? null : practiceScore - official.official_crc_score,'],

  // The capability
  ['Core loses official-scores', CAP,
    '"teacher-core": new Set(["teacher-dashboard", "worksheets", "official-scores"]),',
    '"teacher-core": new Set(["teacher-dashboard", "worksheets"]),'],
  ['Pro loses official-scores', CAP,
    '    "official-scores",\n', ''],
  ['official-scores is handed to a student plan', CAP,
    '"practice-pass": new Set(PRACTICE_PASS),',
    '"practice-pass": new Set([...PRACTICE_PASS, "official-scores"] as Capability[]),'],
  ['Core is handed the Pro export capability', CAP,
    '"teacher-core": new Set(["teacher-dashboard", "worksheets", "official-scores"]),',
    '"teacher-core": new Set(["teacher-dashboard", "worksheets", "official-scores", "class-data-export"]),'],
];

// ─── The sweep ───────────────────────────────────────────────────────────────

console.log('Control run, before any fault.');
const control = runSuites();
if (control.failing.size > 0) {
  console.error(`  ${control.failing.size} test(s) already failing. A sweep on a red suite proves nothing:`);
  for (const t of control.failing) console.error(`    - ${t}`);
  process.exit(1);
}
const OFFICIAL_SUITE = control.byFile.get('tests/official-scores.test.ts').passing;
const IN_SCOPE = new Set([...OFFICIAL_SUITE, ...CAPABILITY_TESTS_IN_SCOPE]);

// The named capability tests must actually EXIST. A typo in the list above would
// otherwise show up as an uncovered test and be "fixed" by deleting the entry,
// which is the wrong repair.
const capabilityNames = control.byFile.get('tests/capabilities.test.ts').passing;
const missing = CAPABILITY_TESTS_IN_SCOPE.filter((t) => !capabilityNames.has(t));
if (missing.length > 0) {
  console.error('  These in-scope capability tests do not exist under these names:');
  for (const t of missing) console.error(`    - ${t}`);
  process.exit(1);
}

console.log(`  ${control.passing.size} tests green across both suites.`);
console.log(`  ${IN_SCOPE.size} of them are in this sweep's scope ` +
  `(${OFFICIAL_SUITE.size} official-scores + ${CAPABILITY_TESTS_IN_SCOPE.length} capability).\n`);

const covered = new Set();
const results = [];
let restoreFailures = 0;

for (const [name, file, find, replace] of FAULTS) {
  applyFault(file, find, replace);
  const { failing } = runSuites();
  restore();

  for (const t of failing) covered.add(t);
  results.push([name, failing]);

  const reddened = failing.size;
  console.log(`  ${reddened > 0 ? 'ok  ' : 'DEAD'}  ${name} -- reddened ${reddened}`);
  if (VERBOSE) for (const t of failing) console.log(`          ${t}`);

  // RESTORE-GREEN, checked after every single fault rather than once at the
  // end. A fault that fails to revert would make every LATER fault look more
  // effective than it is, and the sweep would still finish green.
  const after = runSuites();
  if (after.failing.size > 0) {
    console.error(`        RESTORE FAILED after "${name}": ${after.failing.size} test(s) still red`);
    restoreFailures++;
  }
}

const dead = results.filter(([, f]) => f.size === 0).map(([n]) => n);
const uncovered = [...IN_SCOPE].filter((t) => !covered.has(t));
const outOfScopeCovered = [...covered].filter((t) => !IN_SCOPE.has(t));

console.log(`\n${'='.repeat(62)}`);
console.log(`In scope: ${IN_SCOPE.size}   shown failing by at least one fault: ${IN_SCOPE.size - uncovered.length}`);
console.log(`Faults:   ${FAULTS.length}   that reddened nothing: ${dead.length}`);
if (outOfScopeCovered.length > 0) {
  console.log(`\nAlso reddened, outside this sweep's scope (not required, worth knowing):`);
  for (const t of outOfScopeCovered) console.log(`  - ${t}`);
}

if (dead.length > 0) {
  console.log('\nFaults that changed nothing (the edit is inert, or nothing asserts it):');
  for (const d of dead) console.log(`  - ${d}`);
}
if (uncovered.length > 0) {
  console.log('\nIN-SCOPE TESTS NO FAULT COULD REDDEN. Each is asserting something this');
  console.log('sweep cannot break -- either the assertion is vacuous, or a fault is missing:');
  for (const t of uncovered) console.log(`  - ${t}`);
}
if (restoreFailures > 0) {
  console.log(`\n${restoreFailures} fault(s) did not restore to green.`);
}

const finalRun = runSuites();
console.log(`\nFinal control: ${finalRun.failing.size === 0 ? `${finalRun.passing.size} green` : `${finalRun.failing.size} RED`}`);

const bad = dead.length + uncovered.length + restoreFailures + finalRun.failing.size;
console.log(bad === 0 ? '\nEvery test was shown failing, and every fault restored to green.' : `\n${bad} problem(s).`);
process.exit(bad === 0 ? 0 : 1);
