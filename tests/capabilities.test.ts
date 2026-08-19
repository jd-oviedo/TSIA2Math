import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAPABILITIES,
  planGrants,
  isFreeSample,
  freeSampleGrants,
  FREE_SAMPLE,
  type Capability,
} from '../app/lib/capabilities.ts';

// The capability map, and the free sample.
//
// The map went through three versions in one day and two of them were wrong, so
// the properties that were got wrong are the ones asserted hardest: that
// Practice Pass holds nothing in /course, and that Full Course is a superset
// rather than an overlapping set.

test('a Practice Pass holder never reaches /course', () => {
  // The boundary the whole map exists to encode. Both earlier wrong versions
  // failed this or its mirror.
  assert.equal(planGrants('practice-pass', 'curriculum'), false);
  assert.equal(planGrants('practice-pass', 'gumu'), false);
});

test('Full Course holds the curriculum and GUMU', () => {
  assert.equal(planGrants('full-course', 'curriculum'), true);
  assert.equal(planGrants('full-course', 'gumu'), true);
});

test('Full Course is a strict superset of Practice Pass', () => {
  // "EVERYTHING IN PRACTICE PASS, PLUS" is published on the pricing page. This
  // is that commitment as an assertion rather than a comment.
  for (const capability of CAPABILITIES['practice-pass']) {
    assert.ok(
      CAPABILITIES['full-course'].has(capability),
      `full-course is missing ${capability}, which practice-pass has`
    );
  }
  assert.ok(CAPABILITIES['full-course'].size > CAPABILITIES['practice-pass'].size);
});

test('teacher plans sell no curriculum, and that is deliberate', () => {
  // Teachers DO reach /course, through the second door in the gate predicate.
  // The map records what a plan sells, and Teacher Core does not sell student
  // curriculum access. If this ever passes, the second door has been merged into
  // the map and the two reasons have stopped being separately legible.
  assert.equal(planGrants('teacher-core', 'curriculum'), false);
  assert.equal(planGrants('teacher-pro', 'curriculum'), false);
  assert.equal(planGrants('teacher-core', 'teacher-dashboard'), true);
  assert.equal(planGrants('teacher-pro', 'teacher-dashboard'), true);
});

test('worksheets belong to Practice Pass and up, including both teacher tiers', () => {
  for (const plan of ['practice-pass', 'full-course', 'teacher-core', 'teacher-pro'] as const) {
    assert.equal(planGrants(plan, 'worksheets'), true, `${plan} should hold worksheets`);
  }
});

test('no plan means no capability, and an unknown plan grants nothing', () => {
  const caps: Capability[] = ['curriculum', 'gumu', 'worksheets', 'teacher-dashboard'];
  for (const capability of caps) {
    assert.equal(planGrants(null, capability), false);
    assert.equal(planGrants(undefined, capability), false);
    // A value the constraint would reject, in case one ever reaches this by a
    // path that skips the database.
    assert.equal(planGrants('founding-teacher', capability), false);
    assert.equal(planGrants('', capability), false);
  }
});

test('there are exactly four plans, so a fifth row cannot appear unnoticed', () => {
  assert.deepEqual(Object.keys(CAPABILITIES).sort(), [
    'full-course',
    'practice-pass',
    'teacher-core',
    'teacher-pro',
  ]);
});

// ─── The free sample ─────────────────────────────────────────────────────────

test('the free sample is AR.1.4 on the live course, and nothing else is', () => {
  assert.equal(isFreeSample('tsia2-math', 'AR.1.4'), true);
  assert.equal(isFreeSample('tsia2-math', 'QR.1.1'), false);
  assert.equal(isFreeSample('tsia2-math', 'GR.4.3'), false);
});

test('the free sample is scoped to its course, not to a topic id anywhere', () => {
  // Topic ids are only unique within a course. A second course carrying an
  // AR.1.4 must not inherit the exemption.
  assert.equal(isFreeSample('tsia2-english', 'AR.1.4'), false);
  assert.equal(isFreeSample('', 'AR.1.4'), false);
});

test('the free sample grants the curriculum but never GUMU', () => {
  // GUMU is the Full Course differentiator. A sample that included it would give
  // away the thing the $89 buys.
  assert.equal(freeSampleGrants('curriculum'), true);
  assert.equal(freeSampleGrants('gumu'), false);
});

test('the free sample grants nothing outside the course tree', () => {
  assert.equal(freeSampleGrants('worksheets'), false);
  assert.equal(freeSampleGrants('teacher-dashboard'), false);
});

test('the sample constant and the predicate cannot drift', () => {
  assert.equal(isFreeSample(FREE_SAMPLE.courseId, FREE_SAMPLE.topicId), true);
});
