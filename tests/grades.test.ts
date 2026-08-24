import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPLETION_SECTIONS,
  LETTER_MIN_GRADED_ITEMS,
  LETTER_MIN_GRADED_TOPICS,
  gradesFor,
  latestAttemptScores,
  masteryScores,
  rollupLetter,
  topicCompletion,
  type CompletionInput,
  type TopicShapeLike,
} from '../app/lib/grades.ts';
import type { AttemptRow } from '../app/lib/attempt-sets.ts';

// The grade reducers.
//
// scripts/faultproof_grades_extract.mjs already pins latestAttemptScores against
// the frozen page loop, byte for byte, with five mis-extractions that must each
// redden their named fixtures. THIS file pins the things that harness cannot,
// because they have no oracle to be compared against -- they are new:
//
//   * the minimum-evidence gate, which is the difference between vics8388
//     reading "—" and reading an F off five questions;
//   * equal-topic weighting, which is invisible while every quiz has four items
//     and is the whole grade the day one does not;
//   * absent-is-not-zero, in both directions -- the trap this build exists to
//     avoid and the one a later edit is most likely to walk back into;
//   * the two denominators, which are SUPPOSED to disagree.

const T = 'tsia2-math';

function A(topic: string, section: string, item: number, correct: boolean, at: string): AttemptRow {
  return { course_id: T, topic_id: topic, section, item_number: item, is_correct: correct, created_at: at };
}
const shape = (practice: number, quiz: number): TopicShapeLike => ({
  practice: { gradable: practice },
  mini_quiz: { gradable: quiz },
});
const key = (topic: string) => `${T}:${topic}`;

// ---------------------------------------------------------------------------
// The two definitions, on the data that made them disagree
// ---------------------------------------------------------------------------

// vics8388, GR.4.3, read from production 2026-08-24. Item 2 was answered
// correctly and then missed on a retry the next day; item 4 was never opened.
const VIC_GR43: AttemptRow[] = [
  A('GR.4.3', 'mini_quiz', 2, false, '2026-08-19T13:37:14.867155+00:00'),
  A('GR.4.3', 'mini_quiz', 1, true, '2026-08-19T13:37:11.556376+00:00'),
  A('GR.4.3', 'mini_quiz', 3, false, '2026-08-18T01:43:19.638684+00:00'),
  A('GR.4.3', 'mini_quiz', 2, true, '2026-08-18T01:43:16.053719+00:00'),
  A('GR.4.3', 'mini_quiz', 1, true, '2026-08-18T01:43:11.132351+00:00'),
  A('GR.4.3', 'mini_quiz', 1, false, '2026-08-18T01:43:01.291202+00:00'),
  A('GR.4.3', 'mini_quiz', 1, false, '2026-08-18T01:42:46.690870+00:00'),
];
const VIC_QR11: AttemptRow[] = [
  A('QR.1.1', 'mini_quiz', 2, false, '2026-08-07T13:30:00.932697+00:00'),
  A('QR.1.1', 'mini_quiz', 1, true, '2026-08-07T13:29:49.097426+00:00'),
];
const VIC_SHAPES = new Map<string, TopicShapeLike>([
  [key('GR.4.3'), shape(10, 4)],
  // QR.1.1's practice is written work: interactive false, gradable 0.
  [key('QR.1.1'), shape(0, 4)],
  [key('QR.1.5'), shape(10, 4)],
  [key('AR.1.1'), shape(10, 4)],
]);

test('the two definitions disagree on real data, on BOTH halves of the fraction', () => {
  const latest = latestAttemptScores(VIC_GR43).get(`${key('GR.4.3')}:mini_quiz`)!;
  const mastery = masteryScores(VIC_GR43, VIC_SHAPES).get(`${key('GR.4.3')}:mini_quiz`)!;

  // Latest: item 1 right, item 2 wrong (the retry), item 3 wrong. Over three
  // items attempted.
  assert.deepEqual([latest.correct, latest.total], [1, 3]);
  // Mastery: items 1 and 2 were each right at least once. Over four authored.
  assert.deepEqual([mastery.correct, mastery.total], [2, 4]);

  // If these ever coincide, the fixture has been softened and both surfaces
  // would agree for the wrong reason.
  assert.notEqual(latest.correct, mastery.correct);
  assert.notEqual(latest.total, mastery.total);
});

test('a section never attempted is ABSENT, never present with zero', () => {
  const grades = gradesFor(VIC_GR43, VIC_SHAPES);
  const g = grades.get(key('GR.4.3'))!;

  assert.ok(g.quiz.mastery, 'the quiz was attempted');
  // THE WHOLE OF RULING A. curriculum_completion.quiz_score would have said 0
  // here for a practice section never opened; the reducer says null.
  assert.equal(g.practice.latest, null);
  assert.equal(g.practice.mastery, null);

  // And a topic with no attempts at all is not in the map at all.
  assert.equal(grades.get(key('AR.1.1')), undefined);
});

test('a non-gradable section falls back to what was attempted rather than dividing by zero', () => {
  // QR.1.1's practice is gradable 0. A student who worked it must not read x/0.
  const rows = [A('QR.1.1', 'practice', 1, true, '2026-08-07T13:00:00Z')];
  const m = masteryScores(rows, VIC_SHAPES).get(`${key('QR.1.1')}:practice`)!;
  assert.deepEqual([m.correct, m.total, m.attempted], [1, 1, 1]);
});

// ---------------------------------------------------------------------------
// The letter
// ---------------------------------------------------------------------------

test("vics8388 reads a dash today, not an F -- the case this build exists for", () => {
  // His assigned-or-attempted set, from production: two topics assigned and
  // quizzed, one assigned and untouched, one practised and never quizzed.
  const grades = gradesFor(
    [...VIC_GR43, ...VIC_QR11, A('QR.1.5', 'practice', 1, false, '2026-08-22T22:15:21.592074+00:00')],
    VIC_SHAPES
  );
  const result = rollupLetter(grades, [key('GR.4.3'), key('QR.1.1'), key('AR.1.1'), key('QR.1.5')]);

  assert.equal(result.kind, 'withheld');
  if (result.kind !== 'withheld') return;
  assert.equal(result.display, '—');
  assert.equal(result.reason, 'not_enough_topics');
  assert.equal(result.subtitle, '2 of 3 topics quizzed');
  assert.equal(result.gradedTopics, 2);
  // Five quiz items answered: three on GR.4.3, two on QR.1.1. QR.1.5's practice
  // item is not among them, and that is the point of the next test.
  assert.equal(result.gradedItems, 5);

  // Said plainly, because it is the requirement rather than a property: without
  // the gate he would have scored (50 + 25) / 2 = 37.5% and read an F off five
  // questions, neither quiz finished.
  const ungated = (2 / 4) * 100 / 2 + (1 / 4) * 100 / 2;
  assert.equal(Math.round(ungated), 38);
});

test('a topic practised but never quizzed is NOT in the grade denominator', () => {
  // THE TWO-AXIS RULE, as an assertion. Same practice rows, two roles.
  const rows = [
    // Topic A: quizzed, full marks.
    A('AR.2.1', 'mini_quiz', 1, true, '2026-08-20T10:00:01Z'),
    A('AR.2.1', 'mini_quiz', 2, true, '2026-08-20T10:00:02Z'),
    A('AR.2.1', 'mini_quiz', 3, true, '2026-08-20T10:00:03Z'),
    A('AR.2.1', 'mini_quiz', 4, true, '2026-08-20T10:00:04Z'),
    // Topic B: ten practice items, every one WRONG, and no quiz attempt.
    ...Array.from({ length: 10 }, (_, i) => A('AR.2.2', 'practice', i + 1, false, `2026-08-20T11:00:0${i % 10}Z`)),
  ];
  const shapes = new Map<string, TopicShapeLike>([
    [key('AR.2.1'), shape(10, 4)],
    [key('AR.2.2'), shape(10, 4)],
  ]);
  const grades = gradesFor(rows, shapes);

  const withB = rollupLetter(grades, [key('AR.2.1'), key('AR.2.2')]);
  const withoutB = rollupLetter(grades, [key('AR.2.1')]);

  // Ten wrong practice answers must not move the grade by a single point.
  assert.deepEqual(withB, withoutB);
  assert.equal(withB.gradedTopics, 1);

  // And the practice IS visible -- just on the other axis.
  assert.ok(grades.get(key('AR.2.2'))!.practice.mastery, 'practice is still reported as context');
  assert.equal(grades.get(key('AR.2.2'))!.quiz.mastery, null, 'but the quiz is absent, not zero');
});

test('untouched assigned work never lowers the grade', () => {
  const rows = [
    A('GR.1.1', 'mini_quiz', 1, true, '2026-08-20T10:00:01Z'),
    A('GR.1.1', 'mini_quiz', 2, true, '2026-08-20T10:00:02Z'),
    A('GR.1.1', 'mini_quiz', 3, true, '2026-08-20T10:00:03Z'),
    A('GR.1.1', 'mini_quiz', 4, true, '2026-08-20T10:00:04Z'),
    A('GR.1.2', 'mini_quiz', 1, true, '2026-08-20T10:01:01Z'),
    A('GR.1.2', 'mini_quiz', 2, true, '2026-08-20T10:01:02Z'),
    A('GR.1.2', 'mini_quiz', 3, true, '2026-08-20T10:01:03Z'),
    A('GR.1.2', 'mini_quiz', 4, true, '2026-08-20T10:01:04Z'),
    A('GR.1.3', 'mini_quiz', 1, true, '2026-08-20T10:02:01Z'),
    A('GR.1.3', 'mini_quiz', 2, true, '2026-08-20T10:02:02Z'),
    A('GR.1.3', 'mini_quiz', 3, true, '2026-08-20T10:02:03Z'),
    A('GR.1.3', 'mini_quiz', 4, true, '2026-08-20T10:02:04Z'),
  ];
  const shapes = new Map<string, TopicShapeLike>(
    ['GR.1.1', 'GR.1.2', 'GR.1.3', 'GR.1.4', 'GR.1.5'].map((t) => [key(t), shape(10, 4)])
  );
  const grades = gradesFor(rows, shapes);

  // Three perfect quizzes, plus two topics assigned and not yet started.
  const result = rollupLetter(grades, ['GR.1.1', 'GR.1.2', 'GR.1.3', 'GR.1.4', 'GR.1.5'].map(key));
  assert.equal(result.kind, 'letter');
  if (result.kind !== 'letter') return;
  assert.equal(result.percent, 100);
  assert.equal(result.letter, 'A');
  assert.equal(result.gradedTopics, 3);
});

test('each topic weighs the same, whatever the quiz length', () => {
  // The property that is invisible today -- every authored quiz has four items
  // -- and becomes the entire grade the day somebody authors a longer one.
  const rows = [
    // Short quiz, 2 items, both right -> 100%.
    A('QR.3.1', 'mini_quiz', 1, true, '2026-08-21T10:00:01Z'),
    A('QR.3.1', 'mini_quiz', 2, true, '2026-08-21T10:00:02Z'),
    // Long quiz, 10 items, 2 right -> 20%.
    A('QR.3.2', 'mini_quiz', 1, true, '2026-08-21T11:00:01Z'),
    A('QR.3.2', 'mini_quiz', 2, true, '2026-08-21T11:00:02Z'),
    ...Array.from({ length: 8 }, (_, i) => A('QR.3.2', 'mini_quiz', i + 3, false, `2026-08-21T11:01:0${i}Z`)),
    // A third, to clear the topics gate. 4 items, 2 right -> 50%.
    A('QR.3.3', 'mini_quiz', 1, true, '2026-08-21T12:00:01Z'),
    A('QR.3.3', 'mini_quiz', 2, true, '2026-08-21T12:00:02Z'),
    A('QR.3.3', 'mini_quiz', 3, false, '2026-08-21T12:00:03Z'),
    A('QR.3.3', 'mini_quiz', 4, false, '2026-08-21T12:00:04Z'),
  ];
  const shapes = new Map<string, TopicShapeLike>([
    [key('QR.3.1'), shape(10, 2)],
    [key('QR.3.2'), shape(10, 10)],
    [key('QR.3.3'), shape(10, 4)],
  ]);
  const result = rollupLetter(gradesFor(rows, shapes), [key('QR.3.1'), key('QR.3.2'), key('QR.3.3')]);

  assert.equal(result.kind, 'letter');
  if (result.kind !== 'letter') return;
  // Equal topic weight: (100 + 20 + 50) / 3 = 56.7 -> 57.
  assert.equal(result.percent, 57);
  assert.equal(result.letter, 'F');

  // Pooled points would have said (2 + 2 + 2) / (2 + 10 + 4) = 37.5% -> 38, a
  // whole band lower. Asserted so the choice cannot be reversed silently.
  assert.notEqual(result.percent, 38);
});

test('no quizzed topics reads as no graded work, not as zero', () => {
  const result = rollupLetter(new Map(), [key('AR.1.1'), key('AR.1.2')]);
  assert.equal(result.kind, 'withheld');
  if (result.kind !== 'withheld') return;
  assert.equal(result.reason, 'no_graded_work');
  assert.equal(result.subtitle, 'No graded work yet');
  assert.equal(result.display, '—');
});

test('the item gate catches three topics with one question each', () => {
  const rows = ['AR.3.1', 'AR.3.2', 'AR.3.3'].map((t, i) =>
    A(t, 'mini_quiz', 1, true, `2026-08-22T10:00:0${i}Z`)
  );
  const shapes = new Map<string, TopicShapeLike>(
    ['AR.3.1', 'AR.3.2', 'AR.3.3'].map((t) => [key(t), shape(10, 4)])
  );
  const result = rollupLetter(gradesFor(rows, shapes), ['AR.3.1', 'AR.3.2', 'AR.3.3'].map(key));

  // Topics gate cleared (3 >= 3), items gate not (3 < 8). Without the second
  // gate this student would read an A off three questions.
  assert.equal(result.kind, 'withheld');
  if (result.kind !== 'withheld') return;
  assert.equal(result.reason, 'not_enough_items');
  assert.equal(result.subtitle, '3 of 8 questions answered');
});

test('the thresholds are constants, and the gate is written in terms of them', () => {
  // Pins that the subtitle strings are derived rather than typed, so raising a
  // threshold does not leave the copy lying.
  assert.equal(LETTER_MIN_GRADED_TOPICS, 3);
  assert.equal(LETTER_MIN_GRADED_ITEMS, 8);

  const rows = Array.from({ length: LETTER_MIN_GRADED_TOPICS - 1 }, (_, i) =>
    A(`ZZ.1.${i}`, 'mini_quiz', 1, true, `2026-08-23T10:00:0${i}Z`)
  );
  const shapes = new Map<string, TopicShapeLike>(
    rows.map((r) => [key(r.topic_id), shape(10, 4)])
  );
  const result = rollupLetter(gradesFor(rows, shapes), rows.map((r) => key(r.topic_id)));
  assert.equal(result.kind, 'withheld');
  if (result.kind !== 'withheld') return;
  assert.equal(result.subtitle, `${LETTER_MIN_GRADED_TOPICS - 1} of ${LETTER_MIN_GRADED_TOPICS} topics quizzed`);
});

// ---------------------------------------------------------------------------
// The other axis: completion
// ---------------------------------------------------------------------------

const CLEARED: CompletionInput = {
  lessonDone: true,
  practiceCorrect: 7,
  practiceRequired: 7,
  practiceCount: 10,
  practiceAttempted: true,
  quizCorrect: 3,
  quizRequired: 3,
  quizCount: 4,
  quizAttempted: true,
};

test('completion counts three sections, and practice is one of them', () => {
  assert.equal(topicCompletion(CLEARED)!.done, COMPLETION_SECTIONS);
  assert.equal(topicCompletion(CLEARED)!.total, 3);

  // The case the two-axis note is written for: notes read, practice cleared,
  // quiz never opened.
  const practisedNotQuizzed = topicCompletion({
    ...CLEARED,
    quizCorrect: 0,
    quizAttempted: false,
  })!;
  assert.equal(practisedNotQuizzed.done, 2);
  assert.deepEqual(
    [practisedNotQuizzed.lesson, practisedNotQuizzed.practice, practisedNotQuizzed.quiz],
    [true, true, false]
  );
});

test('an untouched topic reads null, which surfaces as a dash and never as 0%', () => {
  assert.equal(
    topicCompletion({
      lessonDone: false,
      practiceCorrect: 0,
      practiceRequired: 7,
      practiceCount: 10,
      practiceAttempted: false,
      quizCorrect: 0,
      quizRequired: 3,
      quizCount: 4,
      quizAttempted: false,
    }),
    null
  );
  assert.equal(topicCompletion(undefined), null);

  // A student who TRIED and missed everything is NOT untouched. They are 1/3 --
  // the lesson, via A1's fail-open rule -- and reading them as a dash would lose
  // the only evidence they turned up.
  const tried = topicCompletion({
    lessonDone: true,
    practiceCorrect: 0,
    practiceRequired: 7,
    practiceCount: 10,
    practiceAttempted: true,
    quizCorrect: 0,
    quizRequired: 3,
    quizCount: 4,
    quizAttempted: true,
  })!;
  assert.equal(tried.done, 1);
});

test('a section with no gradable items counts as cleared, as the gate treats it', () => {
  // QR.1.1's practice is written work. If it did not count as cleared, that
  // topic could never reach 3/3 -- the same reason isTopicComplete short-circuits
  // on a zero total.
  const c = topicCompletion({
    ...CLEARED,
    practiceCorrect: 0,
    practiceRequired: 0,
    practiceCount: 0,
    practiceAttempted: false,
  })!;
  assert.equal(c.practice, true);
  assert.equal(c.done, 3);
});
