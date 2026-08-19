import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { countTopicPool } from '../app/lib/worksheet-select.ts';

// The picker's count badge, against the shape it actually receives.
//
// WHY THIS TEST EXISTS
//
// Every badge in the builder read 0 and every checkbox was disabled, so no
// worksheet could be built at all. The counting predicate required
// `correct_answer`, and curriculum_topics_public strips exactly that key --
// jsonb_strip_keys(practice_items, array['correct_answer','misconception_tag']).
// The nesting was right; one field was missing. Nothing in the unit tests could
// see it, because they were all written against hand-made candidate objects
// that carried a correct_answer the real view never returns.
//
// So this fixture is not hand-made. It is the verbatim response from
// curriculum_topics_public, read through the ANON key -- the same key and the
// same view the builder uses -- captured on 2026-08-19. If the redaction ever
// changes, re-capture it; do not edit it by hand to make a test pass.
//
// THE TWO TOPICS ARE CHOSEN, NOT ARBITRARY
//
//   AR.2.1  the ordinary case. 14 array entries, all multiple choice.
//   QR.1.1  the outlier. 16 array entries but only 7 multiple choice, because
//           most of its practice section is free-response. It is the one topic
//           where "count the array" and "count the questions" differ, so it is
//           what stops a future fix from counting array length again.

const FIXTURE = JSON.parse(
  readFileSync(new URL('./fixtures/curriculum-topics-public.json', import.meta.url), 'utf8'),
) as Record<string, { practice_items: unknown }>;

test('the fixture really is the redacted shape, not the base table', () => {
  // If this fails, the fixture was captured from curriculum_topics instead of
  // the view, and every assertion below would be testing the wrong thing.
  const items = (FIXTURE['AR.2.1'].practice_items as {
    practice: { items: Record<string, unknown>[] };
  }).practice.items;

  assert.ok(items.length > 0, 'fixture has no items');
  for (const item of items) {
    assert.ok(!('correct_answer' in item), 'fixture leaked correct_answer: not the public view');
    assert.ok(!('misconception_tag' in item), 'fixture leaked misconception_tag: not the public view');
  }
  // And it does carry what the picker needs.
  assert.ok('format' in items[0]);
  assert.ok('choices' in items[0]);
  assert.ok('item_number' in items[0]);
});

test('an ordinary topic counts 14, not 0', () => {
  // THE REGRESSION. This asserted 0 before the fix.
  const { available } = countTopicPool(FIXTURE['AR.2.1'].practice_items);
  assert.equal(available, 14);
});

test('the free-response outlier counts 7, not 16 and not 0', () => {
  // 16 array entries, 7 of them multiple choice. Guards both failure modes at
  // once: counting the array overstates by 9, and requiring correct_answer
  // understates to 0.
  const { available } = countTopicPool(FIXTURE['QR.1.1'].practice_items);
  assert.equal(available, 7);
});

test('levelled counts only questions that carry a difficulty band', () => {
  // Schema fact 3: mini_quiz items have level = null throughout the course, so
  // an ordinary topic offers 14 questions but only its 10 practice items can
  // satisfy a difficulty filter.
  const ordinary = countTopicPool(FIXTURE['AR.2.1'].practice_items);
  assert.equal(ordinary.levelled, 10);
  assert.ok(ordinary.levelled < ordinary.available);

  // QR.1.1: of its 7 questions, only the 3 multiple-choice practice items carry
  // a band. Counting levels across ALL array entries would give 12 here, which
  // is the number a naive fix produces.
  const outlier = countTopicPool(FIXTURE['QR.1.1'].practice_items);
  assert.equal(outlier.levelled, 3);
});

test('an empty or missing practice_items counts zero rather than throwing', () => {
  // The three COMING-SOON placeholder rows carry practice_items = {}. They are
  // filtered out before this is called, but a counter that throws on an empty
  // object would take the whole picker down if that filter ever moved.
  assert.deepEqual(countTopicPool({}), { available: 0, levelled: 0 });
  assert.deepEqual(countTopicPool(null), { available: 0, levelled: 0 });
  assert.deepEqual(countTopicPool(undefined), { available: 0, levelled: 0 });
  assert.deepEqual(countTopicPool({ practice: null, mini_quiz: null }), {
    available: 0,
    levelled: 0,
  });
});

test('the count matches what the draw would actually find', () => {
  // The defect underneath the defect: the badge and the draw answered the same
  // question with different predicates, so the badge said 0 while
  // drawFromStatic would have found 14. Whatever the predicate is, both sides
  // must use it -- a badge that disagrees with the draw is a lie either way
  // round, and this asserts the two agree on the real redacted shape.
  for (const topic of ['AR.2.1', 'QR.1.1']) {
    const sections = FIXTURE[topic].practice_items as Record<
      string,
      { items?: { format?: string; choices?: Record<string, string> }[] } | null
    >;
    let drawable = 0;
    for (const section of ['practice', 'mini_quiz']) {
      for (const item of sections[section]?.items ?? []) {
        // Exactly the predicate drawFromStatic applies.
        if (item.format !== 'multiple_choice') continue;
        if (!item.choices || Object.keys(item.choices).length === 0) continue;
        drawable++;
      }
    }
    assert.equal(
      countTopicPool(FIXTURE[topic].practice_items).available,
      drawable,
      `${topic}: badge and draw disagree`,
    );
  }
});
