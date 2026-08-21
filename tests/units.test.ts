import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UNIT_TITLES, unitTitle, unitLabel } from '../app/lib/units.ts';
import { unitFromParam, unitFromReferer } from '../app/dashboard/modules/referer.ts';
import { allowsTopic, planGrants } from '../app/lib/capabilities.ts';

// The unit titles, and the two ways the modules page learns which unit to open.

test('every unit in the course has a title', () => {
  // Six units, 0 through 5, measured in production 2026-08-21. A seventh unit
  // uploaded without a title here is the case unitTitle returns null for, and
  // this is what would catch the sixth going missing.
  for (let n = 0; n <= 5; n += 1) {
    const title = unitTitle(n);
    assert.equal(typeof title, 'string', `unit ${n} has no title`);
    assert.ok((title as string).length > 3, `unit ${n}'s title is too short to be one`);
  }
  assert.equal(Object.keys(UNIT_TITLES).length, 6);
});

// Bare, so callers can compose. A prefixed constant would force the syllabus to
// strip the prefix back off to set the number and the title separately.
test('titles carry no "Unit N" prefix of their own', () => {
  for (const title of Object.values(UNIT_TITLES)) {
    assert.ok(!/^unit\b/i.test(title), `"${title}" carries its own prefix`);
    assert.ok(!title.includes('·'), `"${title}" carries its own separator`);
  }
});

// House copy rule, and these strings are student-facing.
test('no em dashes or ampersands in the titles', () => {
  for (const title of Object.values(UNIT_TITLES)) {
    assert.ok(!title.includes('—'), `em dash in "${title}"`);
    assert.ok(!title.includes('&'), `ampersand in "${title}", the house style is "and"`);
  }
});

test('an unknown unit returns null rather than an empty-looking heading', () => {
  assert.equal(unitTitle(6), null);
  assert.equal(unitTitle(-1), null);
  assert.equal(unitLabel(6), 'Unit 6');
  assert.equal(unitLabel(0), 'Unit 0 · Foundations');
});

// ─── Which unit opens ────────────────────────────────────────────────────────

test('an explicit ?unit= is read, including unit 0', () => {
  assert.equal(unitFromParam('0'), 0);
  assert.equal(unitFromParam('3'), 3);
  assert.equal(unitFromParam('5'), 5);
});

// Unit 0 is a real unit in this course AND is falsy, which is the trap the
// referer rule already documents. The param reader has to avoid it too.
test('unit 0 survives the falsy trap', () => {
  assert.notEqual(unitFromParam('0'), null);
  assert.notEqual(unitFromReferer('/course/tsia2/math/unit/0/topic/QR.1.5/lesson'), null);
  assert.equal(unitFromParam('0'), 0);
});

test('a malformed ?unit= opens nothing rather than guessing', () => {
  for (const bad of ['', 'three', '3.5', '1e2', ' 3', '-1', 'NaN', undefined, ['3', '4']]) {
    assert.equal(unitFromParam(bad as string), null, JSON.stringify(bad));
  }
});

test('the referer rule still matches this app own topic route and nothing else', () => {
  assert.equal(unitFromReferer('/course/tsia2/math/unit/3/topic/GR.2.1/practice'), 3);
  assert.equal(unitFromReferer(null), null);
  assert.equal(unitFromReferer('https://example.com/course/tsia2/math/unit/3/topic/X/'), 3);
  assert.equal(unitFromReferer('/dashboard/modules'), null);
  assert.equal(unitFromReferer('/course/tsia2/math/unit/3'), null);
});

// ─── The entitlement matrix ──────────────────────────────────────────────────
//
// What each plan may open, asserted against the SAME predicate the modules page
// and the /course gate both call. This is the server-side half of issue #176: the
// page rendered a working link to every topic regardless of plan, so the row a
// student saw and the route they reached disagreed.
//
// The six shapes below are what resolveCourseAccess returns for each plan, read
// off course-access.ts rather than invented:
//   anonymous       :128  NO_COURSE_ACCESS, signedIn false
//   free / pass      :174  NO_COURSE_ACCESS + signedIn true
//   full-course      :150  curriculum + gumu
//   teacher          :162  the second door, viaTeacher
//   derived          :169  a student in an entitled teacher's class

const ANY_TOPIC = 'QR.1.5';
const SAMPLE = 'AR.1.4';
const COURSE = 'tsia2-math';

const ACCESS = {
  anonymous: { curriculum: false, gumu: false, viaTeacher: false, signedIn: false },
  freeTier: { curriculum: false, gumu: false, viaTeacher: false, signedIn: true },
  practicePass: { curriculum: false, gumu: false, viaTeacher: false, signedIn: true },
  fullCourse: { curriculum: true, gumu: true, viaTeacher: false, signedIn: true },
  teacher: { curriculum: true, gumu: true, viaTeacher: true, signedIn: true },
  derivedTeacher: { curriculum: true, gumu: true, viaTeacher: false, signedIn: true },
} as const;

test('anonymous reaches nothing, not even the free sample', () => {
  // The session check is the whole point of allowsTopic's signedIn branch: the
  // sample exemption must not become an anonymous door into the tree.
  assert.equal(allowsTopic(ACCESS.anonymous, 'curriculum', COURSE, SAMPLE), false);
  assert.equal(allowsTopic(ACCESS.anonymous, 'curriculum', COURSE, ANY_TOPIC), false);
});

test('free tier and Practice Pass reach the sample and nothing else', () => {
  for (const key of ['freeTier', 'practicePass'] as const) {
    assert.equal(allowsTopic(ACCESS[key], 'curriculum', COURSE, SAMPLE), true, key);
    assert.equal(allowsTopic(ACCESS[key], 'curriculum', COURSE, ANY_TOPIC), false, key);
    // Never GUMU, at either tier. That is the Full Course differentiator.
    assert.equal(allowsTopic(ACCESS[key], 'gumu', COURSE, SAMPLE), false, key);
  }
});

test('Practice Pass buys no curriculum, which is what makes it identical to free here', () => {
  assert.equal(planGrants('practice-pass', 'curriculum'), false);
  assert.equal(planGrants('practice-pass', 'worksheets'), true);
  // The distinction between the two plans is real in the map and currently
  // unobservable in the product, because worksheets are not built and are not
  // in /course. Recorded so nobody reads the identical rows above as a bug.
  assert.equal(planGrants(null, 'worksheets'), false);
});

test('the three paths that grant the whole tree all reach every topic', () => {
  for (const key of ['fullCourse', 'teacher', 'derivedTeacher'] as const) {
    assert.equal(allowsTopic(ACCESS[key], 'curriculum', COURSE, ANY_TOPIC), true, key);
    assert.equal(allowsTopic(ACCESS[key], 'curriculum', COURSE, SAMPLE), true, key);
  }
});

test('the sample is one topic, not a course-wide exemption', () => {
  // A near-miss must not open: the exemption is an exact pair, and a course id
  // that merely contains the right topic id is not it.
  assert.equal(allowsTopic(ACCESS.freeTier, 'curriculum', COURSE, 'AR.1.5'), false);
  assert.equal(allowsTopic(ACCESS.freeTier, 'curriculum', 'other-course', SAMPLE), false);
});
