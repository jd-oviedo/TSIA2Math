import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UNIT_TITLES, unitTitle, unitLabel } from '../app/lib/units.ts';
import { unitFromParam, unitFromReferer } from '../app/dashboard/modules/referer.ts';

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
