import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topicPlan, resumeStep, type PartInput } from '../app/lib/topic-parts.ts';
import { lessonSectionCount } from '../app/lib/lesson-sections.ts';

// The topic overview states the gating rule that is really enforced. These pin
// the two things easiest to get wrong when translating the design: inventing a
// locked state that no route implements, and inferring a position inside the
// lesson that nothing records.

// A student partway through a normal topic: notes read, practice started.
function base(over: Partial<PartInput> = {}): PartInput {
  return {
    lessonDone: true,
    practiceAttempted: false,
    quizAttempted: false,
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
  // THIS TEST'S NAME WAS RIGHT AND ITS ASSERTION WAS WRONG. It required the
  // literal string "Get 7 of 10 problems right to open the next part", which is
  // precisely the closed-door claim the name forbids, and then checked for
  // "lock" and "opens when" as if those were the only ways to make it. Nothing
  // in the topic tree is ever shut: no part route checks a prior part's gate, a
  // student reaches the mini quiz with practice at 0 of 7, and the attempts are
  // graded. Only the Next control is disabled.
  const practice = topicPlan(base()).parts[1];
  assert.equal(practice.status, 'in_progress');
  assert.match(practice.requirement ?? '', /7 of 10 problems right means you are ready/);
  assert.match(practice.requirement ?? '', /You have 3/);
  // Every way of claiming the next part is shut, including the one this test
  // used to demand.
  assert.doesNotMatch(
    practice.requirement ?? '',
    /lock|Locked|opens when|to open|unlock|before you can|not available/i
  );
});

test('no requirement line anywhere claims a part is closed', () => {
  // The whole plan, not just practice: the lesson line and the quiz line made
  // the same claim, and the quiz one also pointed at a part that does not exist,
  // since the mini quiz closes the topic.
  for (const input of [base(), base({ lessonDone: false }), base({ practiceCorrect: 7 })]) {
    for (const part of topicPlan(input).parts) {
      assert.doesNotMatch(
        part.requirement ?? '',
        /to open|unlock|lock|before you can|not available/i,
        `${part.kind}: ${part.requirement}`
      );
    }
  }
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
  assert.match(plan.parts[1].requirement ?? '', /1 of 1 problem right means you are ready/);
});

test('Modules and the topic overview cannot disagree about where to carry on', () => {
  // The Modules resume card calls resumeStep directly; the topic overview gets
  // the same answer through topicPlan. If those two ever diverge a student is
  // sent to different places by two surfaces describing the same topic, which
  // is invisible until it happens. Pinned across every state that matters.
  const cases: PartInput[] = [
    base({ lessonDone: false, practiceCorrect: 0, quizCorrect: 0 }),
    base({ lessonDone: false, practiceCorrect: 7 }),
    base(),
    base({ practiceCorrect: 7 }),
    base({ practiceCorrect: 7, quizCorrect: 1 }),
    base({ practiceCorrect: 7, quizCorrect: 3 }),
    base({ practiceGated: false }),
    base({ practiceGated: false, quizGated: false }),
    base({ practiceGated: false, quizGated: false, lessonDone: false }),
  ];

  for (const input of cases) {
    const viaPlan = topicPlan(input).resume;
    // sectionCount is the one field resumeStep does not take, because it only
    // ever affected a row's wording. Dropping it must not change the answer.
    // Built by copy-and-delete rather than destructuring, so no unused binding
    // is left behind for lint to object to.
    const withoutSectionCount = { ...input } as Partial<PartInput>;
    delete withoutSectionCount.sectionCount;
    const direct = resumeStep(withoutSectionCount as Omit<PartInput, 'sectionCount'>);
    assert.deepEqual(direct, viaPlan, `resume diverged for ${JSON.stringify(input)}`);
  }
});

test('a student who tried and missed is not told they have not started', () => {
  // The defect this replaced: sectionStatus read `correct > 0`, so one wrong
  // answer left the row saying "Not started" while the requirement line
  // immediately below said "You have 0". The card contradicted itself, and it
  // erred discouraging by erasing the attempt.
  const tried = topicPlan(base({ practiceCorrect: 0, practiceAttempted: true })).parts[1];
  assert.equal(tried.status, 'in_progress');

  const untouched = topicPlan(base({ practiceCorrect: 0, practiceAttempted: false })).parts[1];
  assert.equal(untouched.status, 'not_started');
});

test('attempts never override a finished or ungradable section', () => {
  // Ordering inside sectionStatus: complete and ungated are decided before the
  // attempted branch is reached, so a widened in_progress cannot swallow either.
  assert.equal(
    topicPlan(base({ practiceCorrect: 7, practiceAttempted: true })).parts[1].status,
    'complete'
  );
  assert.equal(
    topicPlan(base({ practiceGated: false, practiceAttempted: true })).parts[1].status,
    'ungated'
  );
});

test('resume says carry on, not start, once something has been attempted', () => {
  // resumeStep only reads in_progress for the button LABEL; where it resumes is
  // decided by complete/ungated, so widening changes the wording and not the
  // destination.
  const missed = resumeStep(base({ practiceCorrect: 0, practiceAttempted: true }));
  assert.equal(missed.kind, 'practice');
  assert.match(missed.label, /Carry on/);

  const fresh = resumeStep(base({ practiceCorrect: 0, practiceAttempted: false }));
  assert.equal(fresh.kind, 'practice');
  assert.match(fresh.label, /Start/);
});
