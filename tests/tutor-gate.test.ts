import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allowsTopic, FREE_SAMPLE, type CourseAccess } from '../app/lib/capabilities.ts';

// The tutor gate on the two static banners.
//
// WHY THIS EXISTS. The quiz entry banner and the practice tutor line rendered
// with NO capability check on either route, so every viewer who reached the page
// was told "get one wrong and I'll come talk it through with you". The tutor is
// Full Course. A free-tier student on the free sample holds `curriculum` and not
// `gumu`, reaches the quiz, and was promised a conversation their plan does not
// include.
//
// The routes now call the same pair the grader uses:
//   resolveCourseAccess() -> allowsTopic(access, 'gumu', courseId, topicId)
//
// This file pins the predicate for every plan that can reach those pages. It
// cannot see the JSX, so it is not proof the banner is wired correctly; that is
// what the browser check does. It is proof that the decision the banner asks for
// is the right one, and it is loadable by `node --test` because capabilities.ts
// imports nothing at runtime.

// The five states, built off course-access.ts rather than invented. Same fixtures
// as tests/units.test.ts, kept in step deliberately: if these two files disagree
// about what a plan is, one of them is wrong about the product.
const ACCESS: Record<string, CourseAccess> = {
  anonymous: { curriculum: false, gumu: false, viaTeacher: false, signedIn: false },
  free: { curriculum: false, gumu: false, viaTeacher: false, signedIn: true },
  practicePass: { curriculum: false, gumu: false, viaTeacher: false, signedIn: true },
  fullCourse: { curriculum: true, gumu: true, viaTeacher: false, signedIn: true },
  teacher: { curriculum: true, gumu: true, viaTeacher: true, signedIn: true },
  derivedTeacher: { curriculum: true, gumu: true, viaTeacher: false, signedIn: true },
};

const SAMPLE = FREE_SAMPLE;
const PAID = { courseId: 'tsia2-math', topicId: 'QR.1.5' };

test('the free sample reaches the quiz and NOT the tutor', () => {
  // This pairing is the whole defect. Both assertions have to hold at once:
  // reaching the page is what made the ungated banner visible, and not holding
  // gumu is what made it a promise the plan does not keep.
  assert.equal(
    allowsTopic(ACCESS.free, 'curriculum', SAMPLE.courseId, SAMPLE.topicId),
    true,
    'a free-tier student must still reach the sample topic'
  );
  assert.equal(
    allowsTopic(ACCESS.free, 'gumu', SAMPLE.courseId, SAMPLE.topicId),
    false,
    'the sample must not grant the tutor'
  );
});

test('no plan without gumu reaches the tutor on any topic', () => {
  for (const key of ['anonymous', 'free', 'practicePass'] as const) {
    for (const t of [SAMPLE, PAID]) {
      assert.equal(
        allowsTopic(ACCESS[key], 'gumu', t.courseId, t.topicId),
        false,
        `${key} must not reach the tutor on ${t.topicId}`
      );
    }
  }
});

test('the three paths that buy the tutor all reach it', () => {
  for (const key of ['fullCourse', 'teacher', 'derivedTeacher'] as const) {
    for (const t of [SAMPLE, PAID]) {
      assert.equal(
        allowsTopic(ACCESS[key], 'gumu', t.courseId, t.topicId),
        true,
        `${key} should reach the tutor on ${t.topicId}`
      );
    }
  }
});

// The control. An assertion that "free tier has no tutor" is worth nothing if it
// would also pass for a plan that does, so the two are compared directly rather
// than each being checked against a constant.
test('CONTROL: the gate distinguishes free tier from Full Course on the same topic', () => {
  const free = allowsTopic(ACCESS.free, 'gumu', SAMPLE.courseId, SAMPLE.topicId);
  const paid = allowsTopic(ACCESS.fullCourse, 'gumu', SAMPLE.courseId, SAMPLE.topicId);
  assert.notEqual(free, paid, 'the gate is not reading the plan');
  assert.equal(free, false);
  assert.equal(paid, true);
});

// Practice Pass is the one worth stating out loud: it is a PAID plan, and it is
// identical to free tier here. Its documented boundary is that it never lands on
// a /course URL at all, so if this ever returns true the boundary has moved and
// the banner is the least of it.
test('Practice Pass buys no tutor, which is what makes it identical to free here', () => {
  assert.equal(
    allowsTopic(ACCESS.practicePass, 'gumu', SAMPLE.courseId, SAMPLE.topicId),
    allowsTopic(ACCESS.free, 'gumu', SAMPLE.courseId, SAMPLE.topicId)
  );
});
