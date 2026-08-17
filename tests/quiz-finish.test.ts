import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  quizOutcome,
  outcomeHeadline,
  solutionsAvailable,
  type QuizResultLike,
} from '../app/lib/quiz-finish.ts';

// The mini quiz's closing summary. These pin the three things easiest to get
// wrong: finishing early, counting a retried question as still missed, and
// letting a worked solution out during the attempt.

const R = (correct: boolean): QuizResultLike => ({ isCorrect: correct });
const FOUR = [1, 2, 3, 4];

test('a quiz is not finished until every question has an outcome', () => {
  assert.equal(quizOutcome(FOUR, {}).finished, false);
  assert.equal(quizOutcome(FOUR, { 1: R(true) }).finished, false);
  assert.equal(quizOutcome(FOUR, { 1: R(true), 2: R(true), 3: R(true) }).finished, false);
  assert.equal(
    quizOutcome(FOUR, { 1: R(true), 2: R(false), 3: R(true), 4: R(true) }).finished,
    true
  );
});

test('an empty section never reports itself finished', () => {
  // There is nothing to finish, and reporting a 0 of 0 summary on a section
  // with no gradable questions would be a summary of nothing.
  const outcome = quizOutcome([], {});
  assert.equal(outcome.finished, false);
  assert.equal(outcome.total, 0);
});

test('the score counts latest outcomes, so a retry stops counting as missed', () => {
  const wrong = quizOutcome(FOUR, { 1: R(true), 2: R(false), 3: R(true), 4: R(true) });
  assert.deepEqual(wrong.missed, [2]);
  assert.equal(wrong.correct, 3);
  assert.equal(outcomeHeadline(wrong), '3 of 4 correct');

  // Same student, having gone back and got question 2 right.
  const retried = quizOutcome(FOUR, { 1: R(true), 2: R(true), 3: R(true), 4: R(true) });
  assert.deepEqual(retried.missed, []);
  assert.equal(outcomeHeadline(retried), '4 of 4 correct');
});

test('the headline is scored out of the whole quiz, not out of what was answered', () => {
  // Caught by fault injection: every other headline assertion happens on a
  // finished quiz, where answered and total are equal, so none of them could
  // tell the two apart. A partly answered quiz is the only case that can.
  const partial = quizOutcome(FOUR, { 1: R(true), 2: R(false) });
  assert.equal(partial.answered, 2);
  assert.equal(outcomeHeadline(partial), '1 of 4 correct');
});

test('missed questions come back in presentation order', () => {
  const outcome = quizOutcome(FOUR, { 1: R(false), 2: R(true), 3: R(false), 4: R(false) });
  assert.deepEqual(outcome.missed, [1, 3, 4]);
});

test('an unanswered question is not a missed one', () => {
  // The distinction matters: a partly answered quiz must not report the
  // questions the student has not reached yet as things they got wrong.
  const outcome = quizOutcome(FOUR, { 1: R(false), 2: R(true) });
  assert.deepEqual(outcome.missed, [1]);
  assert.equal(outcome.answered, 2);
  assert.equal(outcome.correct, 1);
});

test('no worked solution is offered during a quiz attempt', () => {
  const midway = quizOutcome(FOUR, { 1: R(true), 2: R(true) });
  assert.equal(solutionsAvailable('mini_quiz', midway), false);

  const finished = quizOutcome(FOUR, { 1: R(true), 2: R(false), 3: R(true), 4: R(true) });
  assert.equal(solutionsAvailable('mini_quiz', finished), true);
});

test('practice is unchanged and keeps its reveal throughout', () => {
  // Practice is a workshop: check, reveal, retry. The quiz rule must not leak
  // into it.
  for (const results of [{}, { 1: R(true) }, { 1: R(true), 2: R(false) }]) {
    assert.equal(
      solutionsAvailable('practice', quizOutcome(FOUR, results as Record<number, QuizResultLike>)),
      true
    );
  }
});
