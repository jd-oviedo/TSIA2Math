import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quizSegmentState, quizStripSummary } from '../app/lib/quiz-strip.ts';

// The quiz strip's own state model. The rendered strip is checked in the browser
// by scripts/verify_quiz_register.mjs; these pin the enum and, in particular,
// that it is NOT practice's.

const ITEMS = [1, 2, 3, 4];

test('a question shows how it went, or that it has not been answered', () => {
  const results = { 1: { isCorrect: true }, 2: { isCorrect: false } };
  assert.equal(quizSegmentState(1, results), 'correct');
  assert.equal(quizSegmentState(2, results), 'missed');
  assert.equal(quizSegmentState(3, results), 'untouched');
});

test('there is no current state, because the quiz is not paged', () => {
  // The reason this enum exists rather than reusing practice's segmentState.
  // Every reachable value is one of these three, whatever the input.
  const seen = new Set<string>();
  for (const results of [
    {},
    { 1: { isCorrect: true } },
    { 1: { isCorrect: false } },
    { 1: { isCorrect: true }, 2: { isCorrect: false }, 3: { isCorrect: true }, 4: { isCorrect: true } },
  ]) {
    for (const n of ITEMS) seen.add(quizSegmentState(n, results));
  }
  assert.deepEqual([...seen].sort(), ['correct', 'missed', 'untouched']);
});

test('the strip is graded, not neutral, while the attempt is open', () => {
  // Deliberate, and the opposite of the design. The card beside each question
  // already says "Nailed it" or "Not quite yet" the moment it is checked, so a
  // neutral strip would withhold what the page is already showing.
  const midAttempt = { 1: { isCorrect: false } };
  assert.equal(quizSegmentState(1, midAttempt), 'missed');
  assert.notEqual(quizSegmentState(1, midAttempt), 'untouched');
});

test('a retry is respected: the latest outcome is what shows', () => {
  // results holds the latest outcome per item, matching quizOutcome, so a
  // question got wrong and then right stops reading as missed.
  assert.equal(quizSegmentState(1, { 1: { isCorrect: true } }), 'correct');
});

test('the summary counts what the colours say', () => {
  const results = { 1: { isCorrect: true }, 2: { isCorrect: false }, 3: { isCorrect: true } };
  assert.deepEqual(quizStripSummary(ITEMS, results), {
    correct: 2,
    missed: 1,
    answered: 3,
    total: 4,
  });
});

test('an untouched quiz summarises as nothing answered', () => {
  assert.deepEqual(quizStripSummary(ITEMS, {}), {
    correct: 0,
    missed: 0,
    answered: 0,
    total: 4,
  });
});

test('the summary counts the items it was given, not the results map', () => {
  // A result for an item not in this section must not inflate the count.
  const results = { 1: { isCorrect: true }, 99: { isCorrect: true } };
  assert.equal(quizStripSummary(ITEMS, results).correct, 1);
  assert.equal(quizStripSummary(ITEMS, results).total, 4);
});
