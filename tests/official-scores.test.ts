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
  buildAggregateRow,
  monthFloor,
  officialRosterCells,
  OFFICIAL_ROSTER_COLUMNS,
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
  // THE OPEN RUN CARRIES A SCORE. That is the whole point of the fixture and it
  // was not always so: with final_score null as well, the row was excluded by
  // the score guard and this test passed with the completed_at guard DELETED --
  // asserting a rule it was not actually exercising. Found by
  // scripts/faultproof_official_scores.mjs, which is what that sweep is for.
  //
  // A session in progress genuinely can hold a provisional score, which is why
  // "finished" and "scored" are two separate conditions in the first place.
  const withOpen = [session('2026-08-21T10:00:00Z', 951, null), ...newestFirst];
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


// ---------------------------------------------------------------------------
// The de-identified aggregate row
//
// This is the security property of the feature expressed as a function, so it
// can be asserted rather than reviewed. The tests below check what the row does
// NOT carry at least as carefully as what it does.
// ---------------------------------------------------------------------------

const AGG_ARGS = {
  officialScore: 944,
  testDate: '2026-05-14',
  recordedAt: '2026-06-02T18:22:09.412Z',
  practiceScore: 958,
  levels: {
    level_qr: 'Basic' as const,
    level_ar: 'Proficient' as const,
    level_gr: null,
    level_pr: 'Advanced' as const,
  },
};

test('the aggregate row carries no identifier of any kind', () => {
  // THE KEY SET, not the values. A student_id added to the insert later would
  // pass every value assertion in this file while destroying the unjoinability
  // argument at section 5 point 1 of sql/official_scores.sql. This is the test
  // that catches that, and it is the reason the row is built by a function
  // rather than inline at the insert site.
  const row = buildAggregateRow(AGG_ARGS)!;
  assert.deepEqual(Object.keys(row).sort(), [
    'level_ar',
    'level_gr',
    'level_pr',
    'level_qr',
    'official_crc_score',
    'practice_estimate_band',
    'recorded_month',
    'test_month',
  ]);

  // Said again as a prohibition, because the list above reads as a description
  // and this reads as a rule.
  for (const forbidden of ['student_id', 'class_id', 'teacher_id', 'entered_by', 'id']) {
    assert.ok(!(forbidden in row), `${forbidden} must never reach the aggregate`);
  }
});

test('the practice score is destroyed, not merely hidden', () => {
  const row = buildAggregateRow(AGG_ARGS)!;
  // Point 3: an attacker holding a student's exact practice score must not be
  // able to match on it. The band survives; 958 must appear nowhere.
  assert.equal(row.practice_estimate_band, 'college_ready');
  assert.ok(
    !JSON.stringify(row).includes('958'),
    'the exact practice score leaked into the aggregate row'
  );
});

test('both dates are coarsened to the first of the month', () => {
  const row = buildAggregateRow(AGG_ARGS)!;
  // Point 4: a row must not be alignable to a school day or to a specific
  // insert by timestamp. The CHECK in section 5 refuses any other day, so a
  // regression here surfaces as a refused insert, but it should fail HERE.
  assert.equal(row.test_month, '2026-05-01');
  assert.equal(row.recorded_month, '2026-06-01');
  assert.ok(!JSON.stringify(row).includes('2026-05-14'), 'the exact test date survived');
  assert.ok(!JSON.stringify(row).includes('18:22'), 'the insert time survived');
});

test('a student who never practised bands as no_estimate, not as the bottom band', () => {
  // A real state, not an error: a student can sit the official test having
  // never completed a run. Folding them into below_college_ready would invent
  // a measurement the product never made.
  const row = buildAggregateRow({ ...AGG_ARGS, practiceScore: null })!;
  assert.equal(row.practice_estimate_band, 'no_estimate');
});

test('a passing student\'s four null levels reach the aggregate as nulls', () => {
  const row = buildAggregateRow({
    ...AGG_ARGS,
    officialScore: 960,
    practiceScore: 951,
    levels: { level_qr: null, level_ar: null, level_gr: null, level_pr: null },
  })!;
  // Not dropped, not defaulted to a level. The complete state for a report that
  // carries no strand detail, and the shape removeOneAggregate has to match on
  // with .is() rather than .eq().
  assert.equal(row.level_qr, null);
  assert.equal(row.level_ar, null);
  assert.equal(row.level_gr, null);
  assert.equal(row.level_pr, null);
});

test('an uncoarsenable date yields no row rather than a guessed month', () => {
  // Refusing to write is the right failure. An aggregate row is a dashboard
  // number and a wrong month is worse than an absent row.
  assert.equal(buildAggregateRow({ ...AGG_ARGS, testDate: 'not a date' }), null);
  assert.equal(buildAggregateRow({ ...AGG_ARGS, recordedAt: '' }), null);
  assert.equal(buildAggregateRow({ ...AGG_ARGS, testDate: '2026-13-01' }), null);
});

test('monthFloor coarsens by slicing and never by timezone', () => {
  // The bug this forecloses: parsing into a Date and formatting locally moves a
  // first-of-the-month or a last-of-the-month row into the neighbouring bucket
  // whenever the server is not on UTC. Both edges are asserted.
  assert.equal(monthFloor('2026-05-01'), '2026-05-01');
  assert.equal(monthFloor('2026-05-31'), '2026-05-01');
  assert.equal(monthFloor('2026-01-01T00:00:00.000Z'), '2026-01-01');
  assert.equal(monthFloor('2026-12-31T23:59:59.999Z'), '2026-12-01');
  assert.equal(monthFloor(null), null);
  assert.equal(monthFloor('2026-00-10'), null);
});


// ---------------------------------------------------------------------------
// The roster CSV columns
// ---------------------------------------------------------------------------

test('the official roster columns are prefixed so they cannot be read as practice data', () => {
  // roster.csv already carries qr_accuracy_pct and friends from the product's
  // own practice runs. An unprefixed level_qr beside them invites exactly the
  // conflation this feature exists to prevent.
  const [, ...rest] = [...OFFICIAL_ROSTER_COLUMNS];
  for (const col of OFFICIAL_ROSTER_COLUMNS) {
    assert.ok(
      col.startsWith('official_') || col === DELTA_COLUMN,
      `${col} is neither prefixed nor the named-interval delta column`
    );
  }
  assert.ok(rest.length > 0);
});

test('the delta column names its interval, and names the same one as the label', () => {
  // If the column is ever renamed to something that does not say "practice",
  // the number gets read as growth since diagnostic. Same failure the label
  // constant exists to prevent, asserted on the CSV side too.
  assert.ok(DELTA_COLUMN.includes('practice'));
  assert.ok(DELTA_LABEL.includes('practice'));
});

test('a cell is produced for every official column, always', () => {
  // A row shorter than its header silently shifts every value after it into the
  // wrong column. Asserted for both branches, because the empty branch is the
  // one that gets written with a hardcoded list of nulls and drifts.
  assert.equal(officialRosterCells(null, null).length, OFFICIAL_ROSTER_COLUMNS.length);
  assert.equal(
    officialRosterCells(
      {
        official_crc_score: 944,
        test_date: '2026-05-14',
        level_qr: 'Basic',
        level_ar: 'Basic',
        level_gr: 'Basic',
        level_pr: 'Basic',
      },
      958
    ).length,
    OFFICIAL_ROSTER_COLUMNS.length
  );
});

test('a student with no official result gets empty cells, never zeroes', () => {
  // Zero is a real point on a 910-990 scale. A zero here would read as a
  // catastrophic score rather than as an absent one, and this is the state most
  // students are in for most of the year.
  const cells = officialRosterCells(null, null);
  assert.deepEqual(cells, [null, null, null, null, null, null, null]);
  assert.ok(!cells.includes(0));
});

test('the delta is null, not zero, when there is no practice run to measure against', () => {
  const cells = officialRosterCells(
    {
      official_crc_score: 944,
      test_date: '2026-05-14',
      level_qr: 'Basic',
      level_ar: null,
      level_gr: null,
      level_pr: null,
    },
    null
  );
  // A zero here would read as "no change", which is the one thing it does not
  // mean. The score and date are still present: only the delta is unknown.
  assert.equal(cells[0], 944);
  assert.equal(cells[6], null);
});

test('the delta is official minus practice, in that order', () => {
  // Sign matters and is easy to invert. 944 after a 958 practice run is a DROP
  // of 14, and must not read as a gain.
  const cells = officialRosterCells(
    {
      official_crc_score: 944,
      test_date: '2026-05-14',
      level_qr: null,
      level_ar: null,
      level_gr: null,
      level_pr: null,
    },
    958
  );
  assert.equal(cells[6], -14);
});
