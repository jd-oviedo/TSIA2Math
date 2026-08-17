import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unitFromReferer } from '../app/dashboard/modules/referer.ts';

// Auto-expand on the Modules page reads the Referer header and opens the unit a
// student just came from. This is the whole server half of that feature, so it is
// pinned here rather than left to a browser test that cannot reach the page.
//
// The rule it encodes: match this app's own topic route, take the unit number,
// and open nothing on any other input. Every case below is a real shape a referer
// can arrive in.

test('opens the unit a topic page came from', () => {
  assert.equal(
    unitFromReferer('https://app.unpackmath.com/course/tsia2/math/unit/5/topic/PR.4.4/lesson'),
    5,
  );
});

test('matches a topic route with no trailing section', () => {
  assert.equal(
    unitFromReferer('https://app.unpackmath.com/course/tsia2/math/unit/0/topic/QR.1.5'),
    0,
  );
});

test('unit 0 opens, rather than being lost to a falsy check', () => {
  // 0 is a real unit in this course and it is also falsy. A `return n || null`
  // would silently swallow it, so this pins the distinction.
  assert.equal(
    unitFromReferer('https://app.unpackmath.com/course/tsia2/math/unit/0/topic/QR.1.5/quiz'),
    0,
  );
});

test('multi-digit unit numbers are read whole', () => {
  assert.equal(
    unitFromReferer('https://app.unpackmath.com/course/tsia2/math/unit/12/topic/X/quiz'),
    12,
  );
});

test('a non-topic page opens nothing', () => {
  assert.equal(unitFromReferer('https://app.unpackmath.com/dashboard'), null);
  assert.equal(unitFromReferer('https://app.unpackmath.com/dashboard/grades'), null);
});

test('a missing or empty referer opens nothing', () => {
  assert.equal(unitFromReferer(null), null);
  assert.equal(unitFromReferer(''), null);
});

test('a URL containing /unit/N/ but not a topic route opens nothing', () => {
  // Added after a fault proof: loosening the regex to /\/unit\/(\d+)/ passed
  // every other case in this file. Without this, the suite could not tell a topic
  // route from any path that happens to contain a unit segment.
  assert.equal(unitFromReferer('https://app.unpackmath.com/some/unit/5/other'), null);
  assert.equal(unitFromReferer('https://app.unpackmath.com/course/tsia2/math/unit/5'), null);
  assert.equal(unitFromReferer('https://app.unpackmath.com/teacher/unit/5/report'), null);
});

test('a non-numeric unit segment opens nothing', () => {
  assert.equal(
    unitFromReferer('https://app.unpackmath.com/course/tsia2/math/unit/abc/topic/X'),
    null,
  );
});

test('the path shape is what matches, not the host', () => {
  // Worth pinning rather than leaving implicit. The referer is attacker-influenced
  // in the sense that any site can link here and set it, so the question is what
  // the worst case buys: opening a unit that is already on the student's own
  // Modules page. There is no cross-origin read, no navigation, and no state
  // change, so matching on path alone is deliberate rather than an oversight.
  // If that ever stops being true, this test is where the decision is recorded.
  assert.equal(
    unitFromReferer('https://elsewhere.example.com/course/tsia2/math/unit/3/topic/X/lesson'),
    3,
  );
});
