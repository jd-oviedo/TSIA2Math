import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageTurn, segmentState } from '../app/lib/practice-paging.ts';

// Paging, tested where it is a pure function.
//
// The strip's rendered states are checked in the browser by
// scripts/verify_practice_paging.mjs. These cover the two decisions that are
// invisible in a screenshot: WHICH item's GUMU gate a page turn releases, and
// what a segment means when the data disagrees with itself.

const TEN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

test('a page turn releases the gate for the item being LEFT', () => {
  // The whole point. Releasing the arrival key instead would leave the original
  // session counted, solutionsPaused stuck true, and every worked-solution link
  // struck through with nothing on screen to close -- and it looks identical.
  assert.deepEqual(pageTurn(TEN, 2, 3, 'practice'), {
    index: 3,
    releaseKey: 'practice-3',
  });
  // Backwards releases the one being left too, not the lower-numbered one.
  assert.deepEqual(pageTurn(TEN, 5, 4, 'practice'), {
    index: 4,
    releaseKey: 'practice-6',
  });
});

test('the key is built the way PracticeQuiz builds it for GumuChat', () => {
  // handleSessionChange keys on `${section}-${itemNumber}`. A mismatch here
  // releases nothing at all and fails silently.
  assert.equal(pageTurn(TEN, 0, 1, 'practice').releaseKey, 'practice-1');
  assert.equal(pageTurn(TEN, 0, 1, 'mini_quiz').releaseKey, 'mini_quiz-1');
});

test('item numbers are read from the set, not assumed to be the index', () => {
  // Practice item numbers happen to run 1..10 today. Nothing guarantees it, and
  // the maps in PracticeQuiz are keyed by item_number precisely because of that.
  const sparse = [3, 7, 11];
  assert.deepEqual(pageTurn(sparse, 0, 1, 'practice'), {
    index: 1,
    releaseKey: 'practice-3',
  });
  assert.equal(pageTurn(sparse, 2, 1, 'practice').releaseKey, 'practice-11');
});

test('a turn that goes nowhere releases nothing', () => {
  // Pressing Next on the last problem must not drop a live GUMU session for the
  // problem the student is still looking at.
  for (const turn of [
    pageTurn(TEN, 9, 10, 'practice'),
    pageTurn(TEN, 0, -1, 'practice'),
    pageTurn(TEN, 4, 4, 'practice'),
  ]) {
    assert.equal(turn.releaseKey, null);
  }
  assert.equal(pageTurn(TEN, 9, 10, 'practice').index, 9);
  assert.equal(pageTurn(TEN, 0, -1, 'practice').index, 0);
});

test('an empty set cannot be paged', () => {
  assert.deepEqual(pageTurn([], 0, 1, 'practice'), { index: 0, releaseKey: null });
});

// ── the strip ───────────────────────────────────────────────────────────────

const none = new Set<number>();

test('the segment in view is current, whatever its answer state', () => {
  // The card below already says how this one went, so the strip uses the slot
  // to say where you are instead.
  assert.equal(segmentState(3, 2, 2, undefined, none), 'current');
  assert.equal(segmentState(3, 2, 2, { correct: true }, none), 'current');
  assert.equal(segmentState(3, 2, 2, { correct: false }, none), 'current');
  assert.equal(segmentState(3, 2, 2, undefined, new Set([3])), 'current');
});

test('answered this visit reports correct or missed', () => {
  assert.equal(segmentState(5, 0, 4, { correct: true }, none), 'correct');
  assert.equal(segmentState(5, 0, 4, { correct: false }, none), 'missed');
});

test('this visit outranks an earlier one', () => {
  // Got it right last week, wrong just now: the strip says missed. The live
  // answer is the more recent truth and the one the student is looking at.
  assert.equal(segmentState(5, 0, 4, { correct: false }, new Set([5])), 'missed');
});

test('an earlier correct seeds the strip, and an earlier miss cannot', () => {
  assert.equal(segmentState(5, 0, 4, undefined, new Set([5])), 'correct');
  // There is no stored set of previously-missed items, so a problem got wrong on
  // an earlier visit is indistinguishable from one never opened. The strip
  // under-reports rather than inventing a state it cannot know.
  assert.equal(segmentState(5, 0, 4, undefined, none), 'untouched');
});

test('seeding matches on item number, not on position', () => {
  // solvedBefore carries item numbers. Comparing it against the index would
  // light the wrong segment on any set not numbered 1..n in order.
  assert.equal(segmentState(11, 0, 2, undefined, new Set([11])), 'correct');
  assert.equal(segmentState(11, 0, 2, undefined, new Set([2])), 'untouched');
});
