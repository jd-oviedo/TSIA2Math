import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activeTopicPart } from '../app/lib/topic-part-route.ts';

// Reading the current part out of the path. The rendered indicator is checked in
// the browser by scripts/verify_topic_chrome.mjs; these cover the parsing, and
// in particular the two ways it must return null rather than guess.

const base = '/course/tsia2/math/unit/0/topic/AR.1.4';

test('each of the three parts is read from its own route', () => {
  assert.equal(activeTopicPart(`${base}/lesson`), 'lesson');
  assert.equal(activeTopicPart(`${base}/practice`), 'practice');
  assert.equal(activeTopicPart(`${base}/quiz`), 'quiz');
});

test('the doorway has no part', () => {
  // /topic/{id} is the overview, which owns position on its own route. An
  // indicator there would describe nothing.
  assert.equal(activeTopicPart(base), null);
  assert.equal(activeTopicPart(`${base}/`), null);
});

test('the query string middleware appends is trimmed', () => {
  // x-pathname carries pathname + search.
  assert.equal(activeTopicPart(`${base}/practice?item=3`), 'practice');
  assert.equal(activeTopicPart(`${base}/lesson#section-2`), 'lesson');
});

test('a topic whose id happens to be a part name is still a doorway', () => {
  // The reason the part is found by position after "topic" rather than by
  // reading the last segment. /topic/lesson is a topic called "lesson".
  assert.equal(activeTopicPart('/course/tsia2/math/unit/0/topic/lesson'), null);
  assert.equal(activeTopicPart('/course/tsia2/math/unit/0/topic/quiz'), null);
  // And that same topic's lesson page still resolves.
  assert.equal(activeTopicPart('/course/tsia2/math/unit/0/topic/lesson/lesson'), 'lesson');
});

test('anything it cannot read is null, never a guess', () => {
  for (const p of [
    null,
    undefined,
    '',
    '/',
    '/dashboard',
    '/dashboard/grades',
    '/course/tsia2/math/unit/0',
    `${base}/answers`, // a fourth sub-route that does not exist yet
    '/lesson',
    'lesson',
  ]) {
    assert.equal(activeTopicPart(p), null, JSON.stringify(p));
  }
});

test('an unrecognised part does not fall through to a neighbouring segment', () => {
  // Guarding the shape of the lookup: a miss must be null, not the topic id and
  // not the unit.
  assert.equal(activeTopicPart(`${base}/practise`), null); // British spelling
  assert.equal(activeTopicPart(`${base}/Lesson`), null); // case matters
});
