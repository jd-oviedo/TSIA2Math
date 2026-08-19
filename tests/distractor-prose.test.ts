import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractDistractorProse,
  distractorLine,
} from '../lib/curriculum-utils.ts';

// Unwrapping one stored distractor_prose entry.
//
// The database stores the authored string with its wrapper on -- see
// sql/curriculum_prose_columns.sql for why the strip is not done at upload --
// so this function is the only thing standing between the stored bytes and what
// a teacher reads on a printed answer key.
//
// The case that gets this wrong is not the ordinary one. It is the 184 of 4,032
// entries whose explanation contains parentheses of its own, where a mis-shaped
// pattern returns a shorter sentence that still reads as complete. Those are
// asserted hardest, and the broken alternatives are asserted to actually be
// broken rather than merely assumed to be.

const REAL_WRONG =
  'Student makes misconception: adds_instead_of_subtracts ' +
  '(adds the 9 to 14 instead of subtracting it, producing 23)';

const REAL_CORRECT =
  'Correct: subtracts 9 from both sides to isolate x, giving 5, ' +
  'which checks against the original equation';

// Verbatim from AR.1.1. The explanation contains "f(9)", so it is the shape
// that breaks a lazy matcher.
const REAL_NESTED =
  'Student makes misconception: reads_parens_as_multiplication ' +
  '(reads the parentheses as a multiplication sign, so f(9) = 4 becomes a ' +
  'claim that 9 is being multiplied by 4)';

test('a wrong-answer entry gives up its slug and its sentence', () => {
  const got = extractDistractorProse(REAL_WRONG);
  assert.equal(got?.slug, 'adds_instead_of_subtracts');
  assert.equal(got?.correct, false);
  assert.equal(
    got?.text,
    'adds the 9 to 14 instead of subtracting it, producing 23',
  );
});

test('the correct-option entry is flagged, not treated as a misconception', () => {
  const got = extractDistractorProse(REAL_CORRECT);
  assert.equal(got?.correct, true);
  assert.equal(got?.slug, null);
  assert.match(got!.text, /^subtracts 9 from both sides/);
  // The "Correct:" label must not survive into the text -- the answer key
  // writes its own label.
  assert.doesNotMatch(got!.text, /^Correct:/);
});

test('an explanation containing its own parentheses survives whole', () => {
  const got = extractDistractorProse(REAL_NESTED);

  // The whole sentence, to the final ")". This is the assertion an unanchored
  // pattern fails, silently and plausibly.
  assert.equal(
    got?.text,
    'reads the parentheses as a multiplication sign, so f(9) = 4 becomes a ' +
      'claim that 9 is being multiplied by 4',
  );
  assert.ok(got!.text.endsWith('multiplied by 4'), 'sentence was truncated');
  assert.ok(got!.text.includes('f(9)'), 'inner parentheses were lost');
});

test('the end anchor is what keeps a nested-parenthesis entry whole', () => {
  // Not a test of our code. This pins the REASON the pattern is shaped the way
  // it is, so that anyone "simplifying" it has to delete an assertion that
  // states out loud what they are about to reintroduce.
  //
  // MEASURED, and it corrected the first version of this test. The property
  // that matters is the trailing `\)\s*$` anchor, NOT greediness: with the
  // anchor in place a lazy `([\s\S]*?)` backtracks forward and lands on the same
  // answer as `(.*)`. What actually breaks is dropping the anchor, and using a
  // `[^)]*` character class.
  const WANT =
    'reads the parentheses as a multiplication sign, so f(9) = 4 becomes a ' +
    'claim that 9 is being multiplied by 4';

  const lazyAnchored = /^Student makes misconception:\s*([a-z0-9_]+)\s*\(([\s\S]*?)\)\s*$/;
  const charClassAnchored = /^Student makes misconception:\s*([a-z0-9_]+)\s*\(([^)]*)\)\s*$/;
  const lazyUnanchored = /^Student makes misconception:\s*([a-z0-9_]+)\s*\(([\s\S]*?)\)/;

  // Anchored, lazy or greedy, both reach the final ")".
  assert.equal(lazyAnchored.exec(REAL_NESTED)?.[2], WANT);
  assert.equal(extractDistractorProse(REAL_NESTED)?.text, WANT);

  // A character class cannot cross the inner ")" at all, so it fails to match.
  // Content is not lost -- extractDistractorProse would fall through to the
  // raw-string branch -- but the teacher then reads the wrapper.
  assert.equal(charClassAnchored.exec(REAL_NESTED), null);

  // Dropping the anchor is the genuinely dangerous one: it MATCHES, and returns
  // a truncated sentence that still reads like a finished thought. This is the
  // failure that would ship looking like content.
  const truncated = lazyUnanchored.exec(REAL_NESTED)?.[2];
  assert.notEqual(truncated, WANT);
  assert.ok(truncated!.endsWith('so f(9'), 'expected the mid-clause truncation');
});

test('nothing is ever dropped, however malformed', () => {
  // The failure this guards is a blank line on a printed answer key, which a
  // teacher cannot distinguish from "no explanation was written".
  const junk = 'Student makes misconception adds_instead_of_subtracts no parens';
  const got = extractDistractorProse(junk);
  assert.equal(got?.text, junk);
  assert.equal(got?.slug, null);
  assert.equal(got?.correct, false);
});

test('empty and missing input give null, not an empty line', () => {
  assert.equal(extractDistractorProse(''), null);
  assert.equal(extractDistractorProse('   '), null);
  assert.equal(extractDistractorProse(null), null);
  assert.equal(extractDistractorProse(undefined), null);
  assert.equal(distractorLine('A', null), null);
});

test('distractorLine labels by letter, and by "Correct" for the right one', () => {
  assert.equal(
    distractorLine('C', REAL_WRONG),
    'Chose C: adds the 9 to 14 instead of subtracting it, producing 23',
  );
  assert.match(distractorLine('B', REAL_CORRECT)!, /^Correct: subtracts 9/);
});

test('third person singular is left exactly as authored', () => {
  // Deliberate: rewriting person and number across 4,032 strings is a cosmetic
  // pass that would touch every source file. "Chose A:" reads correctly with
  // the singular, so the content is not worth editing for it.
  assert.match(distractorLine('A', REAL_WRONG)!, /Chose A: adds the 9/);
});
