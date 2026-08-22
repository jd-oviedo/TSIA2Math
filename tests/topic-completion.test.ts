import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isTopicComplete,
  type CompletionRow,
  type ObservedLike,
  type TopicShapeLike,
} from '../app/lib/topic-completion.ts';


// Definition A, settled 2026-08-22. This is the calculation behind the number a
// student reads as their progress, so the cases that matter are the ones where
// the stored snapshot and the attempt log DISAGREE.
//
// The old definition B (complete when every gradable item is correct, lesson
// never consulted) is pinned here too, as the thing that must NOT come back.

const shape: TopicShapeLike = {
  practice: { gradable: 10 },
  mini_quiz: { gradable: 4 },
};

function snap(over: Partial<CompletionRow> = {}): CompletionRow {
  return {
    completed_at: null,
    lesson_completed_at: '2026-08-01T00:00:00Z',
    practice_correct: 7,
    practice_total: 10,
    quiz_correct: 3,
    quiz_total: 4,
    ...over,
  };
}

function observed(over: Partial<ObservedLike> = {}): ObservedLike {
  return { practiceCorrect: 7, quizCorrect: 3, ...over };
}

test('a stamped completed_at is complete, whatever else says', () => {
  assert.equal(isTopicComplete(snap({ completed_at: '2026-08-02T00:00:00Z' }), undefined, shape), true);
});

test('thresholds are 70 percent of practice and 75 percent of the quiz, not 100', () => {
  // 7 of 10 and 3 of 4. Definition B called this incomplete; A calls it done.
  assert.equal(isTopicComplete(snap(), observed(), shape), true);
});

test('one under the practice gate is not complete', () => {
  assert.equal(
    isTopicComplete(snap({ practice_correct: 6 }), observed({ practiceCorrect: 6 }), shape),
    false
  );
});

test('one under the quiz gate is not complete', () => {
  assert.equal(
    isTopicComplete(snap({ quiz_correct: 2 }), observed({ quizCorrect: 2 }), shape),
    false
  );
});

test('the notes are required: perfect questions without them is not complete', () => {
  assert.equal(
    isTopicComplete(
      snap({ lesson_completed_at: null, practice_correct: 10, quiz_correct: 4 }),
      observed({ practiceCorrect: 10, quizCorrect: 4 }),
      shape
    ),
    false
  );
});

// ─── The reconcile. A stale snapshot must never un-complete a topic. ─────────

test('a stale snapshot is rescued by the attempt log', () => {
  // The snapshot missed the last three practice answers, which the log has.
  const stale = snap({ practice_correct: 4 });
  assert.equal(isTopicComplete(stale, observed({ practiceCorrect: 7 }), shape), true);
});

test('the reconcile takes the HIGHER, so a stale LOG cannot un-complete either', () => {
  assert.equal(isTopicComplete(snap(), observed({ practiceCorrect: 0, quizCorrect: 0 }), shape), true);
});

// ─── Failing open, and not falsely. ─────────────────────────────────────────

test('no snapshot at all is not complete, rather than throwing', () => {
  assert.equal(isTopicComplete(undefined, observed(), shape), false);
});

test('a missing shape is not complete, rather than dividing by an absent total', () => {
  assert.equal(isTopicComplete(snap(), observed(), undefined), false);
});

test('a topic with nothing gradable needs only the notes', () => {
  const empty = { practice: { gradable: 0 }, mini_quiz: { gradable: 0 } };
  assert.equal(isTopicComplete(snap({ practice_correct: 0, quiz_correct: 0 }), undefined, empty), true);
  assert.equal(
    isTopicComplete(snap({ lesson_completed_at: null, practice_correct: 0, quiz_correct: 0 }), undefined, empty),
    false
  );
});
