import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isGradeable,
  passesLevel,
  allocate,
  seededShuffle,
  selectItems,
  type Candidate,
  type Level,
} from '../app/lib/worksheet-select.ts';

// The worksheet draw.
//
// These rules are the ones a teacher notices when they are wrong: asking for 20
// questions and getting 13, or the same question printed twice. The schema facts
// they encode were measured against the real content, so the tests use the real
// numbers rather than round ones.

// ─── counting ───────────────────────────────────────────────────────────────

test('gradeable means multiple choice WITH a parsed answer and choices', () => {
  const good = { format: 'multiple_choice', correct_answer: 'B', choices: { A: '1', B: '2' } };
  assert.equal(isGradeable(good), true);

  // The QR.1.1 shape: free-response entries sit in the same array.
  assert.equal(isGradeable({ format: 'free_response', correct_answer: null, choices: {} }), false);

  // Parsed as multiple choice but the answer key never yielded a letter. Printing
  // this leaves a blank on the answer key, which is worse than omitting it.
  assert.equal(isGradeable({ format: 'multiple_choice', correct_answer: null, choices: { A: '1' } }), false);
  assert.equal(isGradeable({ format: 'multiple_choice', correct_answer: '', choices: { A: '1' } }), false);

  // Choices missing entirely.
  assert.equal(isGradeable({ format: 'multiple_choice', correct_answer: 'A', choices: {} }), false);
});

test('array length is not the count: the QR.1.1 case', () => {
  // Verbatim shape from the real topic: 12 practice entries of which 3 are
  // multiple choice, plus 4 quiz entries. 16 in the array, 7 gradeable.
  const entries = [
    ...Array.from({ length: 9 }, () => ({ format: 'free_response', correct_answer: null, choices: {} })),
    ...Array.from({ length: 3 }, () => ({ format: 'multiple_choice', correct_answer: 'A', choices: { A: '1' } })),
    ...Array.from({ length: 4 }, () => ({ format: 'multiple_choice', correct_answer: 'B', choices: { B: '2' } })),
  ];
  assert.equal(entries.length, 16);
  assert.equal(entries.filter(isGradeable).length, 7);
});

// ─── the difficulty rule ────────────────────────────────────────────────────

const practice = (n: number, level: Level | null): Candidate => ({
  ref: { source: 'static', topic_id: 'AR.2.1', section: 'practice', item_number: n },
  level,
  section: 'practice',
});
const quiz = (n: number): Candidate => ({
  ref: { source: 'static', topic_id: 'AR.2.1', section: 'mini_quiz', item_number: n },
  // Schema fact 3: null on every mini_quiz item in the course.
  level: null,
  section: 'mini_quiz',
});

test('no filter admits everything, including unlevelled items', () => {
  assert.equal(passesLevel(quiz(1), undefined), true);
  assert.equal(passesLevel(quiz(1), []), true);
});

test('a difficulty filter can never admit an unlevelled item', () => {
  assert.equal(passesLevel(quiz(1), ['Basic']), false);
  assert.equal(passesLevel(practice(1, 'Basic'), ['Basic']), true);
  assert.equal(passesLevel(practice(1, 'Advanced'), ['Basic']), false);
});

test('filtering drops the quiz section and SAYS SO', () => {
  // The real per-topic shape: 10 levelled practice items, 4 unlevelled quiz.
  const candidates = [
    ...Array.from({ length: 10 }, (_, i) => practice(i + 1, 'Basic')),
    ...Array.from({ length: 4 }, (_, i) => quiz(i + 1)),
  ];
  const filtered = selectItems([{ topic_id: 'AR.2.1', candidates }], {
    count: 14,
    levels: ['Basic'],
    seed: 1,
  });

  // 14 asked for, only the 10 practice items are eligible.
  assert.equal(filtered.refs.length, 10);
  assert.equal(filtered.shortfall, 4);

  // The failure this guards is a SILENT short worksheet.
  assert.ok(
    filtered.notes.some((n) => /difficulty filter/i.test(n)),
    'the teacher must be told the filter removed the quiz items',
  );
  assert.ok(filtered.notes.some((n) => /Asked for 14, found 10/.test(n)));
});

test('without a filter the same pool delivers all 14', () => {
  const candidates = [
    ...Array.from({ length: 10 }, (_, i) => practice(i + 1, 'Basic')),
    ...Array.from({ length: 4 }, (_, i) => quiz(i + 1)),
  ];
  const all = selectItems([{ topic_id: 'AR.2.1', candidates }], { count: 14, seed: 1 });
  assert.equal(all.refs.length, 14);
  assert.equal(all.shortfall, 0);
  assert.deepEqual(all.notes, []);
});

// ─── allocation and duplicates ──────────────────────────────────────────────

test('a request is spread across topics, not taken from the first', () => {
  const alloc = allocate(
    [
      { topic_id: 'A', available: 14 },
      { topic_id: 'B', available: 14 },
      { topic_id: 'C', available: 14 },
    ],
    20,
  );
  assert.equal([...alloc.values()].reduce((a, b) => a + b, 0), 20);
  // Even to within one, rather than 14/6/0.
  for (const v of alloc.values()) assert.ok(v >= 6 && v <= 7, `uneven share: ${v}`);
});

test('a shallow topic does not cost the worksheet its questions', () => {
  // QR.1.1 offers 7; the others can cover the rest.
  const alloc = allocate(
    [
      { topic_id: 'QR.1.1', available: 7 },
      { topic_id: 'AR.2.1', available: 14 },
      { topic_id: 'GR.2.1', available: 14 },
    ],
    30,
  );
  assert.equal([...alloc.values()].reduce((a, b) => a + b, 0), 30);
  assert.equal(alloc.get('QR.1.1'), 7);
});

test('allocation never exceeds a pool', () => {
  const alloc = allocate([{ topic_id: 'A', available: 3 }], 99);
  assert.equal(alloc.get('A'), 3);
});

test('no question is ever drawn twice', () => {
  const candidates = Array.from({ length: 14 }, (_, i) => practice(i + 1, 'Basic'));
  // Ask for more than exists: the pool is exhausted, never repeated.
  const result = selectItems([{ topic_id: 'AR.2.1', candidates }], { count: 40, seed: 99 });
  const keys = result.refs.map((r) => JSON.stringify(r));
  assert.equal(new Set(keys).size, keys.length, 'a reference was repeated');
  assert.equal(result.refs.length, 14);
  assert.equal(result.shortfall, 26);
});

// ─── determinism ────────────────────────────────────────────────────────────

test('the same seed reproduces the same sheet, a different seed does not', () => {
  const candidates = Array.from({ length: 14 }, (_, i) => practice(i + 1, 'Basic'));
  const pools = [{ topic_id: 'AR.2.1', candidates }];

  const a = selectItems(pools, { count: 8, seed: 4242 });
  const b = selectItems(pools, { count: 8, seed: 4242 });
  const c = selectItems(pools, { count: 8, seed: 99 });

  assert.deepEqual(a.refs, b.refs, 'a reprint must select the same items');
  assert.notDeepEqual(a.refs, c.refs, 'a different seed should draw differently');
});

test('shuffling is a permutation, not a filter', () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  const out = seededShuffle(input, 7);
  assert.equal(out.length, input.length);
  assert.deepEqual([...out].sort((x, y) => x - y), input);
  // And it does not mutate its argument.
  assert.deepEqual(input, [1, 2, 3, 4, 5, 6, 7, 8]);
});

// ─── the mixed-backend case ─────────────────────────────────────────────────

test('static and rolled candidates are drawn identically', () => {
  // The whole point of the abstraction: selectItems cannot tell them apart.
  const mixed: Candidate[] = [
    ...Array.from({ length: 7 }, (_, i) => practice(i + 1, 'Basic')),
    ...Array.from({ length: 7 }, (_, i) => ({
      ref: { source: 'instance' as const, topic_id: 'QR.3.5', instance_id: `uuid-${i}` },
      level: null,
      section: 'practice' as const,
    })),
  ];
  const result = selectItems([{ topic_id: 'QR.3.5', candidates: mixed }], { count: 14, seed: 3 });
  assert.equal(result.refs.length, 14);
  assert.equal(result.refs.filter((r) => r.source === 'instance').length, 7);
  assert.equal(result.refs.filter((r) => r.source === 'static').length, 7);
});

test('a rolled item cannot satisfy a difficulty filter', () => {
  // curriculum_item_instances has no level column, so every rolled candidate
  // carries null and is filtered out. Reported, not silently dropped.
  const rolled: Candidate[] = Array.from({ length: 14 }, (_, i) => ({
    ref: { source: 'instance' as const, topic_id: 'QR.3.5', instance_id: `uuid-${i}` },
    level: null,
    section: 'practice' as const,
  }));
  const result = selectItems([{ topic_id: 'QR.3.5', candidates: rolled }], {
    count: 10,
    levels: ['Basic'],
    seed: 5,
  });
  assert.equal(result.refs.length, 0);
  assert.equal(result.shortfall, 10);
  assert.ok(result.notes.length > 0, 'an empty draw must explain itself');
});
