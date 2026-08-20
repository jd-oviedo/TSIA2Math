import test from 'node:test';
import assert from 'node:assert/strict';
import { misconceptionLabel, labelOrFallback, knownSlugCount } from '../app/lib/misconception-labels.ts';
import taxonomy from '../data/docs/misconception_taxonomy.json' with { type: 'json' };

// Labels for the misconception export.
//
// The build spec asked for the label to be distractor prose with LaTeX
// stripped. It is the taxonomy definition instead, and the whole justification
// for that substitution is a claim about the data: that the definitions need no
// stripping because they contain no math. If that claim is ever false, the
// export ships raw LaTeX to a teacher under a column named "label" and nobody
// finds out from a green test suite.
//
// So the claim is asserted here rather than trusted, over every entry.

const ENTRIES = (taxonomy as { slugs: { slug: string; definition: string }[] }).slugs;

test('the taxonomy is large enough to be the real file', () => {
  // Guards against the import silently resolving to an empty or stub object,
  // which would make every assertion below pass over zero entries.
  assert.ok(ENTRIES.length > 400, `only ${ENTRIES.length} entries`);
  assert.equal(knownSlugCount(), ENTRIES.length);
});

test('a known slug resolves to its plain-English definition', () => {
  // Verbatim from the generated taxonomy. Both slugs were observed in real
  // production grid output during the Phase 1 audit.
  assert.equal(
    misconceptionLabel('sign_error_on_constant'),
    'Flips the sign of a constant while moving it across the equals sign or collecting like terms.'
  );
  assert.equal(
    misconceptionLabel('denominator_zero_rule_not_applied'),
    'Concludes a rational function is defined everywhere, ignoring the zero-denominator restriction.'
  );
});

test('no definition contains math, which is why no stripping is needed', () => {
  // The load-bearing claim. 2667 of the 4000 distractor_logic strings in the
  // bank carry inline math and 720 carry \frac; the definitions carry neither,
  // which is the entire reason they are the label source.
  const withDollar = ENTRIES.filter((e) => e.definition.includes('$'));
  const withBackslash = ENTRIES.filter((e) => e.definition.includes('\\'));

  assert.deepEqual(withDollar.map((e) => e.slug), [], 'definitions containing a dollar sign');
  assert.deepEqual(withBackslash.map((e) => e.slug), [], 'definitions containing a backslash');
});

test('every definition is non-empty', () => {
  const blank = ENTRIES.filter((e) => !e.definition || e.definition.trim() === '');
  assert.deepEqual(blank.map((e) => e.slug), [], 'slugs with a blank definition');
});

test('an unknown slug falls back to the slug, never to an empty cell', () => {
  // The realistic path here is an item tagged with a new slug before the
  // taxonomy is regenerated. An empty cell would read as "no misconception",
  // which is a different and wrong claim.
  assert.equal(misconceptionLabel('a_slug_that_does_not_exist'), 'a_slug_that_does_not_exist');
  assert.notEqual(misconceptionLabel('a_slug_that_does_not_exist'), '');
  assert.equal(misconceptionLabel(''), '');
});

test('every slug in the taxonomy resolves to something', () => {
  const unresolved = ENTRIES.filter((e) => {
    const label = misconceptionLabel(e.slug);
    return !label || label.trim() === '';
  });
  assert.deepEqual(unresolved.map((e) => e.slug), []);
});

test('a blank or whitespace definition falls back to the slug', () => {
  // Unreachable through misconceptionLabel() with the current taxonomy, since
  // no entry has a blank definition. Asserted on the decision directly, because
  // a guard that no test can fail is a guard nobody can trust.
  assert.equal(labelOrFallback(undefined, 'my_slug'), 'my_slug');
  assert.equal(labelOrFallback('', 'my_slug'), 'my_slug');
  assert.equal(labelOrFallback('   ', 'my_slug'), 'my_slug');
  assert.equal(labelOrFallback('\n\t ', 'my_slug'), 'my_slug');
  assert.equal(labelOrFallback('A real definition.', 'my_slug'), 'A real definition.');
});
