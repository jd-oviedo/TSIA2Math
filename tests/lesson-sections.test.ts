import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitLessonSections, lessonSectionCount } from '../app/lib/lesson-sections.ts';

// The section split, tested where it is a pure function. The rendered result is
// checked in the browser by scripts/verify_lesson_outline.mjs; these pin the
// cases that are cheap here and awkward there, and the two that would silently
// corrupt a lesson rather than visibly break it.

const headings = (md: string) => splitLessonSections(md).map((s) => s.heading);

test('splits on the authored h5 and nothing else', () => {
  const md = '##### One\nalpha\n\n##### Two\nbeta';
  assert.deepEqual(headings(md), ['One', 'Two']);
  assert.deepEqual(
    splitLessonSections(md).map((s) => s.body),
    ['alpha', 'beta']
  );
  // Four hashes and six hashes are not section boundaries, and neither is a
  // ##### that is not at the start of a line.
  assert.deepEqual(headings('##### Real\n#### Four\n###### Six\ntext ##### mid'), ['Real']);
});

test('the heading text is the line without its hashes', () => {
  assert.deepEqual(headings('#####   Spaced Out  \nbody'), ['Spaced Out']);
});

// The two guards that matter. Neither fires on the course as it stands -- one
// topic has a fenced block in its guided notes, 81 use $$, and zero have a #####
// inside either -- so without a test they could be removed and everything would
// still look fine until somebody authored the case that breaks a lesson.
test('a ##### inside a fenced block is content, not a heading', () => {
  const md = '##### Real\n```\n##### not a heading\n```\ntail';
  assert.deepEqual(headings(md), ['Real']);
  assert.match(splitLessonSections(md)[0].body, /##### not a heading/);
  // Tildes fence too, and a longer closing fence still closes.
  assert.deepEqual(headings('##### Real\n~~~\n##### no\n~~~~\nx'), ['Real']);
});

test('a ##### inside a $$ display block is content, not a heading', () => {
  assert.deepEqual(headings('##### Real\n$$\n##### no\n$$\ntail'), ['Real']);
  // A single-line $$...$$ is inline math, which is how this curriculum writes
  // it, and must not put the scanner into a block state that swallows the rest.
  assert.deepEqual(headings('##### One\n$$x + 1$$\n##### Two\nb'), ['One', 'Two']);
});

test('the authored rule between sections does not survive as a rule at a card edge', () => {
  const md = '##### One\nalpha\n\n---\n\n##### Two\nbeta\n\n---';
  assert.deepEqual(
    splitLessonSections(md).map((s) => s.body),
    ['alpha', 'beta']
  );
});

test('a setext heading is not mistaken for a trailing rule', () => {
  // "text" immediately above "---" is an h2 in markdown, not a paragraph and a
  // rule. Trimming the --- here would quietly demote a heading, which is why the
  // trim requires a blank line above it.
  const [only] = splitLessonSections('##### One\nStill A Heading\n---');
  assert.equal(only.body, 'Still A Heading\n---');
});

test('content above the first heading makes the split refuse rather than hide it', () => {
  // Nothing in the course does this. If something ever does, the lesson page
  // falls back to the whole blob, which shows the orphaned text, rather than
  // dropping it or inventing an "Introduction" nobody authored.
  assert.deepEqual(splitLessonSections('orphan text\n\n##### One\nalpha'), []);
  // A rule or blank lines above the first heading are not content.
  assert.deepEqual(headings('---\n\n##### One\nalpha'), ['One']);
});

test('no headings, or no notes at all, is not splittable', () => {
  assert.deepEqual(splitLessonSections('just prose'), []);
  assert.deepEqual(splitLessonSections(''), []);
  assert.deepEqual(splitLessonSections(null), []);
});

// The overview and the lesson outline both say "N sections" about the same
// topic, so they have to agree. They share one scanner for exactly that reason.
test('the count agrees with the split, and stays honest when the split refuses', () => {
  const md = '##### One\na\n##### Two\nb\n##### Three\nc';
  assert.equal(lessonSectionCount(md), splitLessonSections(md).length);

  // The one case where they part company, and the direction matters: the lesson
  // degrades to one blob, but the overview still reports the real number rather
  // than telling a student a lesson with three sections has none.
  const orphaned = 'orphan\n##### One\na\n##### Two\nb\n##### Three\nc';
  assert.equal(splitLessonSections(orphaned).length, 0);
  assert.equal(lessonSectionCount(orphaned), 3);
});
