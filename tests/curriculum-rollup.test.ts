import test from 'node:test';
import assert from 'node:assert/strict';
import {
  furthestUnitFor,
  lastWorkedFor,
  median,
  rollupClass,
  summarizeStudent,
  WEEK_MS,
} from '../app/lib/curriculum-rollup.ts';
import type { TopicRow, TopicStatus } from '../app/lib/curriculum-progress.ts';

// The class rollup reducer.
//
// The properties asserted hardest are the two that would be wrong in the
// flattering direction:
//
//   * that "complete" is read from `status` and never from `completedAt`, which
//     is present on every TopicStatus and is null for the whole population the
//     A1 rule catches;
//   * that the median, not the mean, is what a class of one keen student and
//     twenty-nine idle ones reports.
//
// Both are things a reasonable edit would break while every other test passed.

const NOW = Date.parse('2026-08-24T12:00:00Z');

function topic(unit: number, seq: number, id: string): TopicRow {
  return {
    course_id: 'tsia2-math',
    topic_id: id,
    topic_name: `Topic ${id}`,
    unit_number: unit,
    sequence_in_unit: seq,
    estimated_time_minutes: 10,
  };
}

// Three units, two topics each, so "furthest unit" has somewhere to be wrong.
const TOPICS: TopicRow[] = [
  topic(0, 1, 'QR.0.1'),
  topic(0, 2, 'QR.0.2'),
  topic(1, 1, 'QR.1.1'),
  topic(1, 2, 'QR.1.2'),
  topic(2, 1, 'AR.2.1'),
  topic(2, 2, 'AR.2.2'),
];

/**
 * A TopicStatus with the fields under test set and the rest filled in.
 *
 * completedAt is deliberately given a REAL TIMESTAMP on statuses whose status is
 * NOT 'complete'. That is not a contrived fixture -- it is the shape the writer
 * produces, and it is what makes the assertions below able to tell the two
 * sources apart. A reducer that counted completedAt would read these as
 * complete.
 */
function status(kind: TopicStatus['status'], lastWorkedAt: string | null): TopicStatus {
  return {
    status: kind,
    correct: 0,
    total: 10,
    completedAt: '2026-08-01T00:00:00Z',
    lastWorkedAt,
    lessonDone: kind !== 'not_started',
    practiceCorrect: 0,
    practiceRequired: 7,
    practiceCount: 10,
    practiceGated: true,
    practiceAttempted: kind !== 'not_started',
    quizCorrect: 0,
    quizRequired: 3,
    quizCount: 4,
    quizGated: true,
    quizAttempted: false,
  };
}

function statuses(entries: [string, TopicStatus][]): Map<string, TopicStatus> {
  return new Map(entries.map(([id, s]) => [`tsia2-math:${id}`, s]));
}

// ─── Student summary ─────────────────────────────────────────────────────────

test('a student with no rows at all totals the whole course as not_started', () => {
  // getTopicStatuses fills every id it is given, but the denominator must come
  // from the course rather than from how much the student has done.
  const summary = summarizeStudent(new Map(), TOPICS);
  assert.deepEqual(summary, { complete: 0, inProgress: 0, notStarted: 6, total: 6 });
});

test('the summary counts status, never the stored completed_at stamp', () => {
  // THE HARD CONSTRAINT, AS AN ASSERTION. Every status here carries a non-null
  // completedAt and not one of them says 'complete'. A reducer reading the stamp
  // reports 3 complete; the correct answer is 0.
  const s = statuses([
    ['QR.0.1', status('in_progress', '2026-08-23T10:00:00Z')],
    ['QR.0.2', status('in_progress', '2026-08-23T10:00:00Z')],
    ['QR.1.1', status('not_started', null)],
  ]);
  const summary = summarizeStudent(s, TOPICS);
  assert.equal(summary.complete, 0);
  assert.equal(summary.inProgress, 2);
  assert.equal(summary.notStarted, 4);
});

test('the three counts always sum to the course total', () => {
  const s = statuses([
    ['QR.0.1', status('complete', '2026-08-20T10:00:00Z')],
    ['QR.1.2', status('in_progress', '2026-08-23T10:00:00Z')],
  ]);
  const summary = summarizeStudent(s, TOPICS);
  assert.equal(summary.complete + summary.inProgress + summary.notStarted, summary.total);
  assert.equal(summary.total, TOPICS.length);
});

// ─── Furthest unit ───────────────────────────────────────────────────────────

test('furthest unit is the highest unit reached, not the unit last touched', () => {
  // A student who cleared unit 2 and then went back to revise unit 0. "Furthest"
  // has one correct answer here and the recency-based reading gives the other.
  const s = statuses([
    ['AR.2.1', status('complete', '2026-08-01T10:00:00Z')],
    ['QR.0.1', status('in_progress', '2026-08-24T10:00:00Z')],
  ]);
  assert.equal(furthestUnitFor(s, TOPICS), 2);
});

test('a student who has started nothing has reached no unit', () => {
  // null, not 0. Unit 0 is a real unit, and a student sitting in it must not be
  // counted in the same cell as a student who has never opened the course.
  assert.equal(furthestUnitFor(new Map(), TOPICS), null);
  assert.equal(furthestUnitFor(statuses([['QR.0.1', status('not_started', null)]]), TOPICS), null);
});

// ─── Last worked ─────────────────────────────────────────────────────────────

test('last worked is the latest across topics, whatever order they come in', () => {
  const s = statuses([
    ['QR.0.1', status('in_progress', '2026-08-24T09:00:00Z')],
    ['QR.1.1', status('in_progress', '2026-08-10T09:00:00Z')],
    ['AR.2.1', status('in_progress', '2026-08-18T09:00:00Z')],
  ]);
  assert.equal(lastWorkedFor(s), '2026-08-24T09:00:00Z');
});

test('last worked is null when nothing was ever touched', () => {
  assert.equal(lastWorkedFor(statuses([['QR.0.1', status('not_started', null)]])), null);
});

// ─── Median ──────────────────────────────────────────────────────────────────

test('the median of an even-sized class is the mean of the two middle values', () => {
  assert.equal(median([0, 0, 4, 10]), 2);
});

test('the median of an empty class is 0 rather than NaN', () => {
  // A class with no students must render a number. NaN would reach the panel and
  // JSON.stringify would turn it into null on the way.
  assert.equal(median([]), 0);
});

test('the median does not let one keen student speak for the class', () => {
  // The decision that made this a median. Mean is 4; the honest answer is 0.
  const values = [0, 0, 0, 0, 20];
  assert.equal(median(values), 0);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  assert.equal(mean, 4);
});

// ─── The rollup ──────────────────────────────────────────────────────────────

test('the roster is the denominator, even for a student with no status map', () => {
  // enrolled must come from the roster passed in, not from the keys of the
  // status map. A student missing from the map is a student who has done
  // nothing, not a student who is not in the class.
  const rollup = rollupClass(new Map(), ['a', 'b', 'c'], TOPICS, NOW);
  assert.equal(rollup.enrolled, 3);
  assert.equal(rollup.started, 0);
  assert.equal(rollup.notStarted, 3);
  assert.equal(rollup.workedThisWeek, 0);
});

test('worked-this-week counts activity inside the window and nothing outside it', () => {
  const inside = new Date(NOW - WEEK_MS + 60_000).toISOString();
  const outside = new Date(NOW - WEEK_MS - 60_000).toISOString();
  const byStudent = new Map([
    ['recent', statuses([['QR.0.1', status('in_progress', inside)]])],
    ['stale', statuses([['QR.0.1', status('in_progress', outside)]])],
    ['never', statuses([['QR.0.1', status('not_started', null)]])],
  ]);
  const rollup = rollupClass(byStudent, ['recent', 'stale', 'never'], TOPICS, NOW);
  assert.equal(rollup.workedThisWeek, 1);
  // The stale student has still STARTED. The two numbers answer different
  // questions and a rollup that conflated them would report this class as
  // one-third started.
  assert.equal(rollup.started, 2);
});

test('started counts a student with any topic past not_started', () => {
  const byStudent = new Map([
    ['one', statuses([['QR.0.1', status('in_progress', '2026-08-24T10:00:00Z')]])],
    ['two', statuses([['QR.0.1', status('complete', '2026-08-24T10:00:00Z')]])],
    ['three', statuses([['QR.0.1', status('not_started', null)]])],
  ]);
  const rollup = rollupClass(byStudent, ['one', 'two', 'three'], TOPICS, NOW);
  assert.equal(rollup.started, 2);
  assert.equal(rollup.notStarted, 1);
});

test('the rollup reports 0 complete for a class whose stamps are all set', () => {
  // THE HARD CONSTRAINT AGAIN, AT CLASS LEVEL, and this is the production case:
  // Sample Class 1 holds completion rows and none of them are complete under the
  // live rule. A rollup reading completedAt would tell that teacher their class
  // had finished 12 topics.
  const byStudent = new Map([
    [
      'vic',
      statuses([
        ['QR.0.1', status('in_progress', '2026-08-24T10:00:00Z')],
        ['QR.0.2', status('in_progress', '2026-08-24T10:00:00Z')],
      ]),
    ],
  ]);
  const rollup = rollupClass(byStudent, ['vic'], TOPICS, NOW);
  assert.equal(rollup.completeTotal, 0);
  assert.equal(rollup.completeMedian, 0);
});

test('furthest-unit cells cover every unit in the course and sum to the started count', () => {
  const byStudent = new Map([
    ['a', statuses([['QR.0.1', status('in_progress', '2026-08-24T10:00:00Z')]])],
    ['b', statuses([['AR.2.2', status('complete', '2026-08-24T10:00:00Z')]])],
    ['c', statuses([['QR.0.1', status('not_started', null)]])],
  ]);
  const rollup = rollupClass(byStudent, ['a', 'b', 'c'], TOPICS, NOW);
  assert.deepEqual(rollup.furthestUnit, [
    { unit: 0, students: 1 },
    { unit: 1, students: 0 },
    { unit: 2, students: 1 },
  ]);
  const placed = rollup.furthestUnit.reduce((sum, cell) => sum + cell.students, 0);
  assert.equal(placed, rollup.started);
});

test('the course denominator is derived from the topics passed in', () => {
  // 97 is 100 rows minus 3 placeholders and it is never hardcoded. See the note
  // in app/lib/units.ts.
  const rollup = rollupClass(new Map(), ['a'], TOPICS, NOW);
  assert.equal(rollup.topicsTotal, TOPICS.length);
});
