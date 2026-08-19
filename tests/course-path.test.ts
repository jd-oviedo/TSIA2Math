import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCoursePath } from '../app/lib/course-path.ts';

// The gate's path parser.
//
// Every assertion here is really one assertion: that "unreadable" is a distinct
// answer from "topic", and that everything the gate cannot understand lands on
// the side that denies. topic-part-route.ts collapses all of these to null,
// which is why this exists separately.

test('a topic doorway parses, and so does every sub-route', () => {
  const expected = { kind: 'topic', courseId: 'tsia2-math', topicId: 'AR.1.4' };
  for (const suffix of ['', '/lesson', '/practice', '/quiz']) {
    assert.deepEqual(
      parseCoursePath(`/course/tsia2/math/unit/0/topic/AR.1.4${suffix}`),
      expected,
      `failed on suffix "${suffix}"`
    );
  }
});

test('the doorway and a sub-route give the SAME answer', () => {
  // The part is deliberately not returned: every route in the tree needs the
  // same capability. If these ever differ, the gate has grown a per-route map
  // and the capability model has split again.
  assert.deepEqual(
    parseCoursePath('/course/tsia2/math/unit/0/topic/AR.1.4'),
    parseCoursePath('/course/tsia2/math/unit/0/topic/AR.1.4/quiz')
  );
});

test('the query string and hash are trimmed', () => {
  assert.deepEqual(parseCoursePath('/course/tsia2/math/unit/0/topic/AR.1.4/lesson?from=modules'), {
    kind: 'topic',
    courseId: 'tsia2-math',
    topicId: 'AR.1.4',
  });
});

test('courseId is built the way every curriculum read keys it', () => {
  const parsed = parseCoursePath('/course/tsia2/math/unit/1/topic/QR.1.1');
  assert.equal(parsed.kind === 'topic' && parsed.courseId, 'tsia2-math');
});

// ─── Everything below must DENY ──────────────────────────────────────────────

test('a missing or empty header is unreadable, not a pass', () => {
  // The single most important case. A middleware that stopped stamping the
  // header must lock the tree, not open it.
  assert.deepEqual(parseCoursePath(null), { kind: 'unreadable' });
  assert.deepEqual(parseCoursePath(undefined), { kind: 'unreadable' });
  assert.deepEqual(parseCoursePath(''), { kind: 'unreadable' });
});

test('a path outside /course is unreadable', () => {
  for (const path of ['/dashboard', '/adaptive-test', '/', '/courses/tsia2/math']) {
    assert.deepEqual(parseCoursePath(path), { kind: 'unreadable' }, path);
  }
});

test('a truncated course path is unreadable', () => {
  for (const path of [
    '/course',
    '/course/tsia2',
    '/course/tsia2/math',
    '/course/tsia2/math/unit/0',
    '/course/tsia2/math/unit/0/topic',
  ]) {
    assert.deepEqual(parseCoursePath(path), { kind: 'unreadable' }, path);
  }
});

test('the literal segments are anchored, so a lookalike path cannot pass', () => {
  // Searching for "topic" rather than anchoring would accept these.
  assert.deepEqual(parseCoursePath('/course/tsia2/math/topic/AR.1.4'), { kind: 'unreadable' });
  assert.deepEqual(parseCoursePath('/course/tsia2/unit/math/unit/0/topic/AR.1.4'), {
    kind: 'unreadable',
  });
});

test('a topic id carrying characters no topic id can carry is unreadable', () => {
  // The same shape app/lib/schemas.ts already enforces on topic_id. These are
  // CHARACTER cases: a segment that could never name a row.
  for (const id of ['AR 1.4', 'AR.1.4;drop', '%2e%2e', 'AR_1.4', 'AR@1.4']) {
    assert.deepEqual(
      parseCoursePath(`/course/tsia2/math/unit/0/topic/${id}`),
      { kind: 'unreadable' },
      id
    );
  }
});

test('a slash inside the topic position names a DIFFERENT topic, and is denied on entitlement', () => {
  // Not a parse failure, and it should not be: a slash is a separator, so
  // /topic/AR/1.4 is topic "AR" with "1.4" as a sub-route. The parser says so
  // honestly rather than pretending it cannot read it.
  //
  // Nothing is granted by that. "AR" is not the free sample, so an unentitled
  // visitor is denied, and an entitled one reaches loadTopic and gets a 404 for
  // a topic that does not exist. The parser's job is to name the topic, not to
  // decide whether it exists.
  assert.deepEqual(parseCoursePath('/course/tsia2/math/unit/0/topic/AR/1.4'), {
    kind: 'topic',
    courseId: 'tsia2-math',
    topicId: 'AR',
  });
});

test('an unrecognised sub-route still resolves the topic', () => {
  // Deliberate: a fifth sub-route added later is gated by default rather than
  // falling through unreadable and being denied to entitled users too.
  assert.deepEqual(parseCoursePath('/course/tsia2/math/unit/0/topic/AR.1.4/notes'), {
    kind: 'topic',
    courseId: 'tsia2-math',
    topicId: 'AR.1.4',
  });
});
