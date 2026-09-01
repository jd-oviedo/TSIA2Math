import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_MAX_ITEMS, STRAND_QUOTAS, buildStrandQueue } from '../app/adaptive-test/engine.ts';

// HOW LONG THE ADAPTIVE TEST IS, STATED TWICE IN engine.ts.
//
// DEFAULT_MAX_ITEMS is the number the reducer counts up to. STRAND_QUOTAS is
// the per-strand breakdown the item queue is built from, and its total is a
// second, independent statement of the same fact.
//
// THE FAILURE THIS CATCHES IS SILENT, which is why it is worth a test rather
// than a comment. app/adaptive-test/useSession.ts ends the session two ways:
//
//   :80  newResponses.length >= state.maxItems   -- the intended finish
//   :89  !nextStrand                             -- the queue ran dry
//
// If the quotas ever sum BELOW DEFAULT_MAX_ITEMS, the second branch fires
// first and the test simply stops early. No error, no warning: the student
// answers fewer questions than the counter promised them, the score is
// computed off a shorter run, and /api/sessions accepts it because its own
// bound is a maximum. If they sum ABOVE, the extra strands are queued and
// never reached, which quietly skews the strand mix away from the published
// blend.
//
// Both numbers are from the College Board TSIA2 Mathematics Test
// Specifications v1.4 (see engine.ts:34), so they are not free to drift apart
// on their own. This holds them together.

test('the strand quotas sum to the test length', () => {
  const total = Object.values(STRAND_QUOTAS).reduce((sum, n) => sum + n, 0);
  assert.equal(
    total,
    DEFAULT_MAX_ITEMS,
    `STRAND_QUOTAS sums to ${total} but DEFAULT_MAX_ITEMS is ${DEFAULT_MAX_ITEMS}. ` +
      'A shortfall ends the test early with no error (useSession.ts:89); ' +
      'a surplus queues strands that are never reached.'
  );
});

// The sum is the requirement, but the queue is what the reducer actually
// consumes, so it is checked directly rather than inferred from the quotas.
test('the built queue is exactly one item long per question', () => {
  const queue = buildStrandQueue();
  assert.equal(queue.length, DEFAULT_MAX_ITEMS);
});

// buildStrandQueue shuffles, so the ORDER is not a fact worth asserting. The
// composition is: every strand has to appear exactly as many times as it was
// promised, or the shuffle has lost or duplicated an entry.
test('the shuffle preserves every strand quota', () => {
  const queue = buildStrandQueue();
  const counted: Record<string, number> = {};
  for (const strand of queue) counted[strand] = (counted[strand] ?? 0) + 1;
  assert.deepEqual(counted, { ...STRAND_QUOTAS });
});
