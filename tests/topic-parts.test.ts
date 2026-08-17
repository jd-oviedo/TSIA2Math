import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topicPlan, type PartInput } from '../app/lib/topic-parts.ts';
import { lessonSectionCount } from '../app/lib/lesson-sections.ts';

// The topic overview states the gating rule that is really enforced. These pin
// the two things easiest to get wrong when translating the design: inventing a
// locked state that no route implements, and inferring a position inside the
// lesson that nothing records.

// A student partway through a normal topic: notes read, practice started.
function base(over: Partial<PartInput> = {}): PartInput {
  return {
    lessonDone: true,
    practiceGated: true,
    practiceCount: 10,
    practiceCorrect: 3,
    practiceRequired: 7,
    quizGated: true,
    quizCount: 4,
    quizCorrect: 0,
    quizRequired: 3,
    sectionCount: 7,
    ...over,
  };
}

const statuses = (i: PartInput) => topicPlan(i).parts.map((p) => p.status);

test('no part is ever locked, in any state', () => {
  // There is no route-level gate anywhere in the topic tree, so no combination
  // of inputs may produce one. If a `locked` status is ever added, this fails.
  const cases: PartInput[] = [
    base({ lessonDone: false, practiceCorrect: 0 }),
    base(),
    base({ practiceCorrect: 7, quizCorrect: 0 }),
    base({ practiceCorrect: 10, quizCorrect: 4 }),
    base({ practiceGated: false, quizGated: false }),
  ];
  const allowed = new Set(['complete', 'in_progress', 'not_started', 'ungated']);
  for (const input of cases) {
    for (const status of statuses(input)) {
      assert.ok(allowed.has(status), `unexpected status ${status}`);
    }
  }
});

test('a threshold is described as what Next needs, not as a closed door', () => {
  const practice = topicPlan(base()).parts[1];
  assert.equal(practice.status, 'in_progress');
  assert.match(practice.requirement ?? '', /Get 7 of 10 problems right to open the next part/);
  assert.match(practice.requirement ?? '', /You have 3/);
  // The words a locked door would use must not appear.
  assert.doesNotMatch(practice.requirement ?? '', /lock|Locked|opens when|finish .* to open/i);
});

test('resume is the first unfinished part', () => {
  assert.equal(topicPlan(base({ lessonDone: false })).resume.kind, 'lesson');
  assert.equal(topicPlan(base()).resume.kind, 'practice');
  assert.equal(topicPlan(base({ practiceCorrect: 7 })).resume.kind, 'quiz');
  assert.equal(
    topicPlan(base({ practiceCorrect: 7, quizCorrect: 3 })).resume.kind,
    'lesson',
    'a finished topic sends the student back to the notes rather than nowhere'
  );
});

test('the lesson is complete or not, never partway', () => {
  // lesson_completed_at is one timestamp and LessonBody watches a single
  // sentinel at the end of the notes, so there is no third state to report.
  // This is the guard against a "you stopped in section 3" creeping in.
  assert.equal(topicPlan(base({ lessonDone: false })).parts[0].status, 'not_started');
  assert.equal(topicPlan(base({ lessonDone: true })).parts[0].status, 'complete');
  const seen = new Set<string>();
  for (const done of [true, false]) {
    for (const sectionCount of [0, 1, 7, 13]) {
      seen.add(topicPlan(base({ lessonDone: done, sectionCount })).parts[0].status);
    }
  }
  assert.deepEqual([...seen].sort(), ['complete', 'not_started']);
});

test('an ungraded practice section gets no gate and does not trap resume', () => {
  // QR.1.1: 12 written items, no PracticeQuiz, so no attempt row can exist.
  const plan = topicPlan(base({ practiceGated: false, practiceCount: 12, practiceRequired: 0 }));
  const practice = plan.parts[1];
  assert.equal(practice.status, 'ungated');
  assert.equal(practice.requirement, undefined, 'a section with nothing to grade states no threshold');
  assert.equal(practice.detail, 'Written work, nothing to submit');
  assert.equal(plan.resume.kind, 'quiz', 'resume steps over it rather than stalling on it');
});

test('section count comes from authored h5 headings', () => {
  assert.equal(lessonSectionCount('##### One\ntext\n##### Two\nmore'), 2);
  assert.equal(lessonSectionCount(''), 0);
  assert.equal(lessonSectionCount(null), 0);
  // Only a real line-start h5 counts.
  assert.equal(lessonSectionCount('#### Four\n###### Six\ntext ##### mid-line'), 0);
  assert.equal(lessonSectionCount('##### Real\n#### Not\n##### Real two'), 2);
});

test('counts and plurals read correctly at one', () => {
  const plan = topicPlan(base({ sectionCount: 1, practiceCount: 1, practiceRequired: 1, practiceCorrect: 0 }));
  assert.equal(plan.parts[0].detail, '1 section to read');
  assert.match(plan.parts[1].requirement ?? '', /Get 1 of 1 problem right/);
});
