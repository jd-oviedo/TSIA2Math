import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CORRECTION_WINDOW_MS,
  DELTA_LABEL,
  DELTA_COLUMN,
  hasPassingScoreWithLevels,
  isCorrectable,
  latestPracticeBefore,
  practiceEstimateBand,
  OFFICIAL_LEVELS,
} from '../app/lib/official-scores.ts';
import { PASSING, placementBand } from '../app/lib/placement.ts';

// The rules official score tracking owns, tested away from the database.
//
// Everything here is pure, which is the reason app/lib/official-scores.ts has no
// runtime imports: the correction window and the delta interval are both gates,
// and a gate whose test cannot be made to fail is not a test.

// ---------------------------------------------------------------------------
// The correction window
// ---------------------------------------------------------------------------

const HOUR = 60 * 60 * 1000;

test('the correction window is 24 hours', () => {
  // The number Juan approved, as an assertion rather than a comment. Raised from
  // a proposed 60 minutes so a teacher working a stack of reports across a
  // planning period can come back to it the next morning.
  assert.equal(CORRECTION_WINDOW_MS, 24 * HOUR);
});

test('a fresh row is correctable and an expired one is not', () => {
  const now = Date.parse('2026-08-23T12:00:00Z');
  const at = (ms: number) => new Date(now - ms).toISOString();

  assert.equal(isCorrectable(at(0), now), true);
  assert.equal(isCorrectable(at(HOUR), now), true);
  assert.equal(isCorrectable(at(23 * HOUR), now), true);
  assert.equal(isCorrectable(at(25 * HOUR), now), false);
});

test('the window boundary is exclusive at exactly 24 hours', () => {
  // Stated explicitly because "expires after 24 hours" has two readings and the
  // server and the UI have to agree on one of them.
  const now = Date.parse('2026-08-23T12:00:00Z');
  const exactly = new Date(now - CORRECTION_WINDOW_MS).toISOString();
  const aMomentInside = new Date(now - CORRECTION_WINDOW_MS + 1000).toISOString();

  assert.equal(isCorrectable(exactly, now), false);
  assert.equal(isCorrectable(aMomentInside, now), true);
});

test('an unusable created_at fails closed, never open', () => {
  const now = Date.now();
  // The cost of a wrong `false` is a support request. The cost of a wrong `true`
  // is an editable academic record that should have been immutable.
  assert.equal(isCorrectable(null, now), false);
  assert.equal(isCorrectable(undefined, now), false);
  assert.equal(isCorrectable('', now), false);
  assert.equal(isCorrectable('not a date', now), false);
});

test('a row stamped in the future is not correctable', () => {
  const now = Date.parse('2026-08-23T12:00:00Z');
  const ahead = new Date(now + 6 * HOUR).toISOString();
  // Clock drift, not a fresh row. Treating it as fresh would extend the window
  // by however far the clock is wrong.
  assert.equal(isCorrectable(ahead, now), false);
});

// ---------------------------------------------------------------------------
// The delta interval: option A
// ---------------------------------------------------------------------------

const session = (
  created: string,
  score: number | null,
  completed: string | null = created
) => ({ created_at: created, final_score: score, completed_at: completed });

// Newest first by created_at, which is the order the route selects in and the
// order this function documents as its precondition.
const newestFirst = [
  session('2026-08-20T10:00:00Z', 948),
  session('2026-08-10T10:00:00Z', 940),
  session('2026-05-01T10:00:00Z', 921),
];

test('the delta measures against the most recent completed run before the test', () => {
  const picked = latestPracticeBefore(newestFirst, '2026-08-22');
  assert.equal(picked?.final_score, 948);
});

test('the interval is NOT the diagnostic, which would be the oldest run', () => {
  // THE DEFECT THIS RULE EXISTS TO AVOID. sessions.session_type promotes exactly
  // the earliest session per student to 'diagnostic', so "most recent completed
  // diagnostic" would always resolve to the student's first ever run and every
  // delta would flatter a student who has practised since.
  const picked = latestPracticeBefore(newestFirst, '2026-08-22');
  assert.notEqual(picked?.final_score, 921);
  assert.equal(picked?.created_at, '2026-08-20T10:00:00Z');
});

test('a run on the test date itself is excluded', () => {
  // Strictly before midnight UTC on test_date. A run taken the morning of the
  // test measures the student on test day, not the preparation the delta
  // describes.
  const picked = latestPracticeBefore(newestFirst, '2026-08-20');
  assert.equal(picked?.final_score, 940);
});

test('an unfinished run is skipped, however recent', () => {
  const withOpen = [session('2026-08-21T10:00:00Z', null, null), ...newestFirst];
  const picked = latestPracticeBefore(withOpen, '2026-08-22');
  assert.equal(picked?.final_score, 948);
});

test('a finished run carrying no score is skipped', () => {
  const withScoreless = [
    session('2026-08-21T10:00:00Z', null, '2026-08-21T10:30:00Z'),
    ...newestFirst,
  ];
  const picked = latestPracticeBefore(withScoreless, '2026-08-22');
  assert.equal(picked?.final_score, 948);
});

test('completed_at is a flag, never a sort key', () => {
  // Production holds sessions whose completed_at PRECEDES their created_at,
  // which is why teacher-export.ts sums elapsed_ms instead of subtracting
  // timestamps. A row like that must still be usable, and must still be ordered
  // by created_at.
  const backwards = [
    session('2026-08-20T10:00:00Z', 948, '2026-08-19T09:00:00Z'),
    session('2026-08-10T10:00:00Z', 940),
  ];
  const picked = latestPracticeBefore(backwards, '2026-08-22');
  assert.equal(picked?.final_score, 948);
});

test('no qualifying run returns null rather than a zero delta', () => {
  // A student can sit the official test having never practised. Null is what
  // lets the panel say so in words; a 0 would read as "no change".
  assert.equal(latestPracticeBefore(newestFirst, '2026-01-01'), null);
  assert.equal(latestPracticeBefore([], '2026-08-22'), null);
});

test('an unparseable test date yields null rather than the newest run', () => {
  assert.equal(latestPracticeBefore(newestFirst, 'not-a-date'), null);
});

test('the delta is named after the interval it actually uses', () => {
  // The label is load-bearing. The number gets read as growth-since-diagnostic
  // the moment it stops saying "practice".
  assert.match(DELTA_LABEL, /practice/i);
  assert.doesNotMatch(DELTA_LABEL, /diagnostic/i);
  assert.match(DELTA_COLUMN, /practice/i);
  assert.doesNotMatch(DELTA_COLUMN, /diagnostic/i);
});

// ---------------------------------------------------------------------------
// The passing-score warning
// ---------------------------------------------------------------------------

test('a passing score carrying a strand level raises the warning', () => {
  // A student who met the standard receives no strand diagnostic, so a level
  // here is a transcription anomaly worth flagging.
  assert.equal(hasPassingScoreWithLevels(PASSING, ['Basic', null, null, null]), true);
  assert.equal(hasPassingScoreWithLevels(990, [null, null, null, 'Advanced']), true);
});

test('a passing score with four null levels is the normal complete state', () => {
  // THE CASE THAT MUST NOT WARN. This is what a passing report actually looks
  // like, and warning on it would train teachers to dismiss the warning.
  assert.equal(hasPassingScoreWithLevels(PASSING, [null, null, null, null]), false);
  assert.equal(hasPassingScoreWithLevels(975, [null, null, null, null]), false);
});

test('a failing score with levels is ordinary and never warns', () => {
  assert.equal(
    hasPassingScoreWithLevels(PASSING - 1, ['Basic', 'Proficient', 'Advanced', 'Basic']),
    false
  );
  assert.equal(hasPassingScoreWithLevels(910, ['Basic', null, null, null]), false);
});

test('the warning threshold is the shared cut score, not a second 950', () => {
  // If PASSING moves, this moves with it. A literal 950 here would be a second
  // source of truth for the college-readiness standard.
  assert.equal(hasPassingScoreWithLevels(PASSING, ['Basic', null, null, null]), true);
  assert.equal(hasPassingScoreWithLevels(PASSING - 1, ['Basic', null, null, null]), false);
});

// ---------------------------------------------------------------------------
// The aggregate band
// ---------------------------------------------------------------------------

test('the aggregate band tracks placementBand, boundary for boundary', () => {
  // The two must not drift: the aggregate is supposed to be the same judgement
  // the teacher already sees on the roster, coarsened.
  const pairs: [number, string, string][] = [
    [990, 'college_ready', 'College ready'],
    [950, 'college_ready', 'College ready'],
    [949, 'approaching', 'Approaching'],
    [935, 'approaching', 'Approaching'],
    [934, 'below_college_ready', 'Below college ready'],
    [910, 'below_college_ready', 'Below college ready'],
  ];
  for (const [score, band, label] of pairs) {
    assert.equal(practiceEstimateBand(score), band, `band for ${score}`);
    assert.equal(placementBand(score).label, label, `label for ${score}`);
  }
});

test('no practice estimate is its own band, not the bottom one', () => {
  // A student who never practised is not a student who scored badly.
  assert.equal(practiceEstimateBand(null), 'no_estimate');
  assert.notEqual(practiceEstimateBand(null), 'below_college_ready');
});

test('every band value is one the database CHECK accepts', () => {
  // The CHECK in sql/official_scores.sql lists exactly these four. A fifth
  // returned here would be refused by Postgres at insert time, which is a 500
  // on a teacher's save rather than a caught mistake.
  const allowed = new Set([
    'college_ready',
    'approaching',
    'below_college_ready',
    'no_estimate',
  ]);
  for (const score of [null, 910, 934, 935, 949, 950, 990]) {
    assert.ok(allowed.has(practiceEstimateBand(score)), `unexpected band for ${score}`);
  }
});

test('the level vocabulary is the product-wide set of three', () => {
  assert.deepEqual([...OFFICIAL_LEVELS], ['Basic', 'Proficient', 'Advanced']);
});
