import test from 'node:test';
import assert from 'node:assert/strict';
import { allowsTopic, type CourseAccess } from '../app/lib/capabilities.ts';

// The gate's decision, given a resolved access shape.
//
// resolveCourseAccess itself needs Supabase and is not tested here; what IS
// tested is the predicate every route asks, because that is where an exemption
// can quietly become a door.

const anonymous: CourseAccess = {
  curriculum: false,
  gumu: false,
  viaTeacher: false,
  signedIn: false,
};
const freeTier: CourseAccess = { ...anonymous, signedIn: true };
const fullCourse: CourseAccess = { curriculum: true, gumu: true, viaTeacher: false, signedIn: true };
const teacher: CourseAccess = { curriculum: true, gumu: true, viaTeacher: true, signedIn: true };

const SAMPLE = ['tsia2-math', 'AR.1.4'] as const;
const OTHER = ['tsia2-math', 'QR.1.1'] as const;

test('ANONYMOUS GETS NO CURRICULUM, INCLUDING THE FREE SAMPLE', () => {
  // The exemption is the one path that does not consult a plan, so it is the one
  // place an anonymous visitor could slip through. It nearly did: the first
  // version of allowsTopic checked isFreeSample without checking for a session,
  // which granted the sample to anonymous while every free-tier test still
  // passed.
  assert.equal(allowsTopic(anonymous, 'curriculum', ...SAMPLE), false);
  assert.equal(allowsTopic(anonymous, 'gumu', ...SAMPLE), false);
  assert.equal(allowsTopic(anonymous, 'curriculum', ...OTHER), false);
});

test('a signed-in free-tier visitor gets the sample and nothing else', () => {
  assert.equal(allowsTopic(freeTier, 'curriculum', ...SAMPLE), true);
  assert.equal(allowsTopic(freeTier, 'curriculum', ...OTHER), false);
});

test('the sample never grants GUMU, to anyone who only has the sample', () => {
  // GUMU is the Full Course differentiator. A sample that included it would give
  // away the thing the $89 buys.
  assert.equal(allowsTopic(freeTier, 'gumu', ...SAMPLE), false);
});

test('Full Course reaches every topic, and GUMU on every topic', () => {
  for (const [course, topic] of [SAMPLE, OTHER]) {
    assert.equal(allowsTopic(fullCourse, 'curriculum', course, topic), true);
    assert.equal(allowsTopic(fullCourse, 'gumu', course, topic), true);
  }
});

test('a teacher reaches the tree through the second door', () => {
  assert.equal(allowsTopic(teacher, 'curriculum', ...OTHER), true);
  assert.equal(allowsTopic(teacher, 'gumu', ...OTHER), true);
});

test('an entitled visitor is not blocked by the sample being a different topic', () => {
  // The exemption is additive. It must never be the only reason someone gets in
  // when they have a plan that already covers it.
  assert.equal(allowsTopic(fullCourse, 'curriculum', 'tsia2-math', 'GR.4.3'), true);
});

test('the sample is scoped to its course', () => {
  assert.equal(allowsTopic(freeTier, 'curriculum', 'tsia2-english', 'AR.1.4'), false);
});

test('curriculum access alone never implies GUMU', () => {
  // The derived teacher path grants both together, but a shape carrying only
  // curriculum must not leak GUMU, since that is what the free tier is.
  const curriculumOnly: CourseAccess = { ...freeTier, curriculum: true };
  assert.equal(allowsTopic(curriculumOnly, 'gumu', ...OTHER), false);
});
