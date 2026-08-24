import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isPastLesson,
  isTopicComplete,
  topicStatusFor,
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

// The full curriculum_completion row as it actually exists, not the six columns
// isTopicComplete happens to read. A fixture narrowed to the reader's interest
// cannot catch a reader that starts caring about a seventh column.
type CompletionRowLive = CompletionRow & {
  id: string;
  user_id: string;
  topic_id: string;
  course_id: string;
  quiz_score: number | null;
  created_at: string;
};

function snap(over: Partial<CompletionRowLive> = {}): CompletionRowLive {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    user_id: '22222222-2222-4222-8222-222222222222',
    course_id: 'tsia2-math',
    topic_id: 'AR.1.4',
    completed_at: null,
    quiz_score: null,
    created_at: '2026-08-01T00:00:00Z',
    lesson_completed_at: '2026-08-01T00:00:00Z',
    practice_correct: 7,
    practice_total: 10,
    quiz_correct: 3,
    quiz_total: 4,
    ...over,
  };
}

// The attempted flags default TRUE because that is the only self-consistent
// pairing with the correct counts above: a student cannot have 7 practice items
// right without having attempted the practice. Tests that need the
// never-attempted case say so explicitly.
function observed(over: Partial<ObservedLike> = {}): ObservedLike {
  return {
    practiceCorrect: 7,
    quizCorrect: 3,
    practiceAttempted: true,
    quizAttempted: true,
    ...over,
  };
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

// ─── A1, and the test it replaced ───────────────────────────────────────────
//
// What stood here was:
//
//   test('the notes are required: perfect questions without them is not
//         complete', ...)  -> asserted FALSE
//
// It pinned the STRICT form, and it went red the moment A1 landed -- which is
// correct, because A1 is precisely the removal of the rule it pinned. It is
// rewritten rather than deleted: the case still matters, the expected answer
// changed, and a reader looking for "why can a topic complete without the
// lesson stamp" should land here.

test('A1: activity in either section stands in for the missing lesson stamp', () => {
  assert.equal(
    isTopicComplete(
      snap({ lesson_completed_at: null, practice_correct: 10, quiz_correct: 4 }),
      observed({ practiceCorrect: 10, quizCorrect: 4 }),
      shape
    ),
    true
  );
});

test('A1 gives nothing away: no stamp AND nothing attempted is still not complete', () => {
  // The companion to the test above, and it differs from it in the two
  // attempted flags ONLY. Everything else -- the stamp, both correct counts,
  // both totals, the shape -- is held identical, so the difference in outcome
  // can be attributed to one axis and to nothing else.
  assert.equal(
    isTopicComplete(
      snap({ lesson_completed_at: null, practice_correct: 10, quiz_correct: 4 }),
      observed({
        practiceCorrect: 10,
        quizCorrect: 4,
        practiceAttempted: false,
        quizAttempted: false,
      }),
      shape
    ),
    false
  );
});

test('isPastLesson is satisfied by the stamp alone, or by either section alone', () => {
  const none = { practiceAttempted: false, quizAttempted: false };
  assert.equal(isPastLesson(snap(), none), true, 'the stamp alone');
  assert.equal(
    isPastLesson(snap({ lesson_completed_at: null }), { ...none, practiceAttempted: true }),
    true,
    'practice alone'
  );
  assert.equal(
    isPastLesson(snap({ lesson_completed_at: null }), { ...none, quizAttempted: true }),
    true,
    'the quiz alone'
  );
  assert.equal(isPastLesson(snap({ lesson_completed_at: null }), none), false, 'neither');
  assert.equal(isPastLesson(undefined, undefined), false, 'nothing at all');
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

// ─── The four named fixtures ─────────────────────────────────────────────────
//
// Rows shaped like the real curriculum_completion table, driven through
// topicStatusFor -- the status a student actually reads on Modules -- rather
// than through isTopicComplete alone, because 'complete' is only one of three
// answers and the other two are where the interesting mistakes live.
//
// WHICH OF THESE IS THE FAULT PROOF, stated so nobody has to guess: D. A and C
// are ordinary coverage. B is a REGRESSION PIN and is deliberately NOT the
// fault proof -- it holds its answer identically under the strict form and
// under A1, because 3 of 10 misses the 70% practice gate either way, so it can
// never go red on that flip. Only D moves.

const shape10x4: TopicShapeLike = { practice: { gradable: 10 }, mini_quiz: { gradable: 4 } };

test('fixture A: notes read, practice 0/10, quiz 2/4 -> in_progress, not complete', () => {
  const row = snap({
    lesson_completed_at: '2026-08-10T14:00:00Z',
    practice_correct: 0,
    practice_total: 10,
    quiz_correct: 2,
    quiz_total: 4,
  });
  const seen = observed({
    practiceCorrect: 0,
    quizCorrect: 2,
    practiceAttempted: true,
    quizAttempted: true,
  });
  assert.equal(isTopicComplete(row, seen, shape10x4), false, 'practice 0/10 misses the 70% gate');
  assert.equal(topicStatusFor(row, seen, shape10x4), 'in_progress');
});

test('fixture B (regression pin): no stamp, practice 3/10 attempted -> in_progress', () => {
  // The shape of the one live row caught in the strict/fail-open divergence.
  // Under the strict form this student could never reach 'complete' no matter
  // what they went on to score, because lesson_completed_at was null and nothing
  // could ever set it. A1 is what unsticks them -- but note the status here is
  // in_progress under BOTH forms, which is exactly why this fixture cannot serve
  // as the fault proof. See fixture D.
  const row = snap({
    lesson_completed_at: null,
    practice_correct: 3,
    practice_total: 10,
    quiz_correct: 0,
    quiz_total: 4,
  });
  const seen = observed({
    practiceCorrect: 3,
    quizCorrect: 0,
    practiceAttempted: true,
    quizAttempted: false,
  });
  assert.equal(topicStatusFor(row, seen, shape10x4), 'in_progress', 'not not_started');
  assert.equal(isTopicComplete(row, seen, shape10x4), false, 'and not complete either');
});

test('fixture C: notes read, practice 8/10, quiz 4/4 -> complete', () => {
  const row = snap({
    lesson_completed_at: '2026-08-11T09:30:00Z',
    practice_correct: 8,
    practice_total: 10,
    quiz_correct: 4,
    quiz_total: 4,
  });
  const seen = observed({
    practiceCorrect: 8,
    quizCorrect: 4,
    practiceAttempted: true,
    quizAttempted: true,
  });
  assert.equal(isTopicComplete(row, seen, shape10x4), true);
  assert.equal(topicStatusFor(row, seen, shape10x4), 'complete');
});

// ─── Fixture D: THE FAULT PROOF ──────────────────────────────────────────────
//
// No lesson stamp, both gates cleared, activity in both sections.
//
//   under A1      complete
//   under strict  in_progress   <- this is the red
//
// THE RED IS ISOLATED TO ONE AXIS, and that is the point of the pairing below.
// D clears the practice gate (8 >= ceil(10 * 0.7) = 7) and clears the quiz gate
// (4 >= ceil(4 * 0.75) = 3), with margin on both, so neither gate is anywhere
// near the boundary and neither can be what moves. D and its companion are
// byte-identical rows -- same null stamp, same 8/10, same 4/4, same shape --
// and differ ONLY in practiceAttempted/quizAttempted. So when D goes red on a
// strict revert and the companion does not, the lesson-null divergence is the
// only variable that changed.

const fixtureD = snap({
  lesson_completed_at: null,
  practice_correct: 8,
  practice_total: 10,
  quiz_correct: 4,
  quiz_total: 4,
});

test('fixture D: no stamp but both gates cleared and both sections attempted -> complete', () => {
  const seen = observed({
    practiceCorrect: 8,
    quizCorrect: 4,
    practiceAttempted: true,
    quizAttempted: true,
  });
  assert.equal(isTopicComplete(fixtureD, seen, shape10x4), true);
  assert.equal(topicStatusFor(fixtureD, seen, shape10x4), 'complete');
});

test('fixture D companion: the same row untouched by the student -> not_started', () => {
  const seen = observed({
    practiceCorrect: 8,
    quizCorrect: 4,
    practiceAttempted: false,
    quizAttempted: false,
  });
  assert.equal(isTopicComplete(fixtureD, seen, shape10x4), false);
  assert.equal(topicStatusFor(fixtureD, seen, shape10x4), 'not_started');
});

test('the gates still bite under A1: attempted is not a way past 70/75 percent', () => {
  // Guards the obvious misreading of A1 -- that "attempted" makes a topic
  // complete. It replaces the lesson stamp and nothing else.
  const seen = observed({
    practiceCorrect: 6,
    quizCorrect: 4,
    practiceAttempted: true,
    quizAttempted: true,
  });
  const row = snap({ lesson_completed_at: null, practice_correct: 6, quiz_correct: 4 });
  assert.equal(isTopicComplete(row, seen, shape10x4), false, '6 of 10 is under the practice gate');
  assert.equal(topicStatusFor(row, seen, shape10x4), 'in_progress');
});
