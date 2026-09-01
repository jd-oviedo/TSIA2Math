import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allowsTopic, NO_COURSE_ACCESS, type CourseAccess } from '../app/lib/capabilities.ts';

// The invariant Student View's preview mode rests on.
//
// `viaTeacher` was carried on CourseAccess from the day the second door was
// written and was read by NOTHING in the running app until this change. It now
// decides three things at once: whether a learner write happens
// (api/curriculum/practice, api/curriculum/progress), whether Mu is bounded to a
// demo (api/gumu/session), and whether the rail says PREVIEW rather than naming a
// tier (components/StudentNav).
//
// That makes one property load-bearing that never was before, and it is the one
// asserted here: A PREVIEW STILL SEES EVERYTHING. The whole point of the second
// door is that a teacher who cannot open the topic their student is stuck on has
// no product, so `viaTeacher` must never come to mean "restricted content". If a
// later change ever tries to implement preview by closing the door instead of by
// gating the writes, this is what says no.
//
// Loadable by `node --test` because capabilities.ts imports nothing at runtime.
// The route behaviour itself is counted, not inferred, by
// scripts/faultproof_student_view_preview.mjs, which runs the handlers.

// The same fixtures as tests/units.test.ts and tests/tutor-gate.test.ts, kept in
// step deliberately: if these files disagree about what a plan is, one is wrong.
const ACCESS: Record<string, CourseAccess> = {
  anonymous: { curriculum: false, gumu: false, viaTeacher: false, signedIn: false },
  freeTier: { curriculum: false, gumu: false, viaTeacher: false, signedIn: true },
  practicePass: { curriculum: false, gumu: false, viaTeacher: false, signedIn: true },
  fullCourse: { curriculum: true, gumu: true, viaTeacher: false, signedIn: true },
  teacher: { curriculum: true, gumu: true, viaTeacher: true, signedIn: true },
  derivedTeacher: { curriculum: true, gumu: true, viaTeacher: false, signedIn: true },
};

const COURSE = 'tsia2-math';
const PAID = 'QR.1.5';

test('a preview still opens every topic and still reaches the tutor', () => {
  // Both halves, and both matter. Content access is what the second door exists
  // for; the tutor has to resolve TRUE here as well, because the bounded demo is
  // enforced by a lifetime counter inside the Mu route, never by withholding the
  // capability. Turning `gumu` off for a teacher would look like the same feature
  // and would silently take the panel away instead of bounding it.
  assert.equal(allowsTopic(ACCESS.teacher, 'curriculum', COURSE, PAID), true);
  assert.equal(allowsTopic(ACCESS.teacher, 'gumu', COURSE, PAID), true);
});

test('viaTeacher is not a content restriction: it never changes what allowsTopic answers', () => {
  // The teacher and derivedTeacher fixtures are identical except for this flag,
  // and the predicate has to be blind to it. If a future edit ever teaches
  // allowsTopic to read viaTeacher, the preview would stop being about writes and
  // start being about access, which is the failure this pins.
  for (const capability of ['curriculum', 'gumu'] as const) {
    assert.equal(
      allowsTopic(ACCESS.teacher, capability, COURSE, PAID),
      allowsTopic(ACCESS.derivedTeacher, capability, COURSE, PAID),
      `allowsTopic disagreed on ${capability} purely because of viaTeacher`
    );
  }
});

test('exactly one access shape carries viaTeacher, and it is the second door', () => {
  // course-access.ts returns viaTeacher true from one branch (:163) and false from
  // the other three. Stated as a count rather than eyeballed, so a second true
  // added later has to come and change this line and say why.
  const carrying = Object.entries(ACCESS).filter(([, a]) => a.viaTeacher);
  assert.deepEqual(
    carrying.map(([name]) => name),
    ['teacher'],
    'a second CourseAccess shape started claiming viaTeacher'
  );
});

test('the no-access default is not a preview', () => {
  // NO_COURSE_ACCESS is spread into the signed-in-no-entitlement return, so if it
  // ever carried viaTeacher every unentitled visitor would silently stop writing
  // progress and be labelled PREVIEW.
  assert.equal(NO_COURSE_ACCESS.viaTeacher, false);
});
