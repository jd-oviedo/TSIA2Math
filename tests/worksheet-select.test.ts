import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isGradeable,
  passesLevel,
  allocate,
  seededShuffle,
  selectItems,
  itemKey,
  mergePools,
  countEligible,
  type Candidate,
  type Level,
  type PoolEntry,
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
// An UNBANDED quiz item, which is still what most of the course looks like.
//
// It used to be the only kind, and the helper said so. Band headings now work in
// Part 3 as well as Part 2 (build_practice_items runs one level scan over both
// sections), so the course is being banded topic by topic and both kinds exist.
// The default stays null because that is the majority case and because it is the
// case the filter has to keep refusing.
const quiz = (n: number, level: Level | null = null): Candidate => ({
  ref: { source: 'static', topic_id: 'AR.2.1', section: 'mini_quiz', item_number: n },
  level,
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

test('filtering drops UNBANDED quiz items and SAYS SO', () => {
  // An unbanded topic, which is what 96 of 97 still are: 10 banded practice
  // items, 4 quiz items with no band. Behaviour here is deliberately unchanged
  // by the banding work -- this is the test that proves the change is a safe
  // incremental slice rather than a course-wide switch.
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
    filtered.notes.some((n) => /no difficulty band/i.test(n)),
    'the teacher must be told which items the filter could not draw, and why',
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

// ─── banded mini-quiz items ─────────────────────────────────────────────────
//
// Part 3 can carry band headings, so a mini-quiz item can have a real band. The
// two tests below are the pair that had to be true before any content was
// banded: the filter must admit a banded quiz item ONLY into its own band, and
// the picker badge must never promise more than the draw delivers.

test('a banded quiz item is drawn by its own band and refused by another', () => {
  // AR.2.1 as authored: quiz items 1-3 Basic, item 4 Proficient. Nothing is
  // Advanced, because that topic's mini quiz genuinely has no Advanced item.
  const candidates = [
    ...Array.from({ length: 4 }, (_, i) => practice(i + 1, 'Basic')),
    ...Array.from({ length: 3 }, (_, i) => practice(i + 5, 'Proficient')),
    ...Array.from({ length: 3 }, (_, i) => practice(i + 8, 'Advanced')),
    quiz(1, 'Basic'),
    quiz(2, 'Basic'),
    quiz(3, 'Basic'),
    quiz(4, 'Proficient'),
  ];
  const draw = (levels: Level[]) =>
    selectItems([{ topic_id: 'AR.2.1', candidates }], { count: 20, levels, seed: 5 });

  const quizNumbers = (r: ReturnType<typeof selectItems>) =>
    r.refs
      .filter((ref) => ref.source === 'static' && ref.section === 'mini_quiz')
      .map((ref) => (ref.source === 'static' ? ref.item_number : -1))
      .sort((a, b) => a - b);

  // INCLUDED by a matching band, and only the items authored into it.
  assert.deepEqual(quizNumbers(draw(['Basic'])), [1, 2, 3]);
  assert.deepEqual(quizNumbers(draw(['Proficient'])), [4]);

  // EXCLUDED by a non-matching band. This is the assertion that a band means
  // something: item 4 is Proficient, so an Advanced worksheet must not get it,
  // and nothing may leak in merely for being in the mini quiz.
  assert.deepEqual(quizNumbers(draw(['Advanced'])), []);

  // The counts a teacher sees, per band. 4+3 Basic, 3+1 Proficient, 3+0 Advanced.
  assert.equal(draw(['Basic']).refs.length, 7);
  assert.equal(draw(['Proficient']).refs.length, 4);
  assert.equal(draw(['Advanced']).refs.length, 3);
  assert.equal(draw(['Basic', 'Proficient', 'Advanced']).refs.length, 14);

  // A band selection that admits every item must not report anything set aside.
  // Checked for the set-aside notes specifically, not for an empty array: asking
  // for 20 against a 14-item pool legitimately reports a shortfall as well.
  assert.deepEqual(
    draw(['Basic', 'Proficient', 'Advanced']).notes.filter((n) => /set aside/i.test(n)),
    [],
  );
});

test('the picker badge equals what the draw can deliver, in every state', () => {
  // ONE POOL, TWO CONSUMERS. countEligible is what the browser badge calls and
  // selectItems is what the server draws with; this asserts they agree over the
  // same entries rather than trusting that two call sites stayed in step. The
  // badge overstating is the specific failure: a teacher who is promised 14 and
  // prints 10 finds out by counting.
  const entries: PoolEntry[] = [
    ...Array.from({ length: 4 }, () => ({ section: 'practice' as const, level: 'Basic' as const })),
    ...Array.from({ length: 3 }, () => ({ section: 'practice' as const, level: 'Proficient' as const })),
    ...Array.from({ length: 3 }, () => ({ section: 'practice' as const, level: 'Advanced' as const })),
    { section: 'mini_quiz', level: 'Basic' },
    { section: 'mini_quiz', level: 'Basic' },
    { section: 'mini_quiz', level: 'Basic' },
    { section: 'mini_quiz', level: 'Proficient' },
  ];
  // The same pool as Candidates, so the draw sees exactly what the badge counted.
  const candidates: Candidate[] = entries.map((entry, i) => ({
    ...entry,
    ref:
      entry.section === 'practice'
        ? { source: 'static', topic_id: 'AR.2.1', section: 'practice', item_number: i + 1 }
        : { source: 'static', topic_id: 'AR.2.1', section: 'mini_quiz', item_number: i - 9 },
  }));

  const states: { name: string; levels: Level[]; includeQuiz: boolean; expect: number }[] = [
    { name: 'no filter, quiz on', levels: [], includeQuiz: true, expect: 14 },
    { name: 'no filter, quiz off', levels: [], includeQuiz: false, expect: 10 },
    { name: 'all three bands, quiz on', levels: ['Basic', 'Proficient', 'Advanced'], includeQuiz: true, expect: 14 },
    { name: 'Basic only, quiz on', levels: ['Basic'], includeQuiz: true, expect: 7 },
    // The state the old code could not express: the switch was ignored while a
    // filter was on, and its control was not even rendered.
    { name: 'Basic only, quiz off', levels: ['Basic'], includeQuiz: false, expect: 4 },
    { name: 'Advanced only, quiz on', levels: ['Advanced'], includeQuiz: true, expect: 3 },
  ];

  for (const state of states) {
    const badge = countEligible(entries, { levels: state.levels, includeQuiz: state.includeQuiz });
    const drawn = selectItems([{ topic_id: 'AR.2.1', candidates }], {
      // Ask for more than the pool holds, so the draw returns everything it can
      // and the comparison is against capacity rather than against the request.
      count: 50,
      levels: state.levels,
      includeQuiz: state.includeQuiz,
      seed: 3,
    }).refs.length;

    assert.equal(badge, drawn, `${state.name}: badge ${badge} but the draw delivers ${drawn}`);
    assert.equal(badge, state.expect, `${state.name}: expected ${state.expect}, got ${badge}`);
  }
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

test('an UNLEVELLED rolled item cannot satisfy a difficulty filter', () => {
  // The pre-D2 shape, and still the shape of a mini_quiz instance: nothing to
  // filter on, so the draw comes back empty. Reported, not silently dropped.
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

// ─── D2: a rolled instance carries its source item's band ───────────────────

test('a levelled rolled item is filtered exactly like an authored one', () => {
  // D2. curriculum_item_instances gained a level column inheriting the source
  // item's band, so the filter stops being able to tell the backends apart.
  // Before it, this same request returned nothing from a templated topic.
  const bands: Level[] = ['Basic', 'Proficient', 'Advanced'];
  const rolled: Candidate[] = Array.from({ length: 9 }, (_, i) => ({
    ref: { source: 'instance' as const, topic_id: 'QR.3.5', instance_id: `uuid-${i}` },
    level: bands[i % 3],
    section: 'practice' as const,
  }));

  const result = selectItems([{ topic_id: 'QR.3.5', candidates: rolled }], {
    count: 3,
    levels: ['Basic'],
    seed: 5,
  });
  assert.equal(result.refs.length, 3);
  assert.equal(result.shortfall, 0);
  assert.ok(result.refs.every((r) => r.source === 'instance'));
});

test('the two backends are indistinguishable to the difficulty filter', () => {
  // The same nine bands, half rolled and half authored, drawn under the same
  // filter. Whether a question came from a template must not change whether a
  // teacher can ask for it by difficulty.
  const bands: Level[] = ['Basic', 'Proficient', 'Advanced'];
  const rolledPool: Candidate[] = bands.map((level, i) => ({
    ref: { source: 'instance' as const, topic_id: 'QR.3.5', instance_id: `uuid-${i}` },
    level,
    section: 'practice' as const,
  }));
  const authoredPool: Candidate[] = bands.map((level, i) => practice(i + 1, level));

  const draw = (candidates: Candidate[]) =>
    selectItems([{ topic_id: 'QR.3.5', candidates }], {
      count: 3,
      levels: ['Proficient'],
      seed: 11,
    });

  const fromRolled = draw(rolledPool);
  const fromAuthored = draw(authoredPool);

  assert.equal(fromRolled.refs.length, 1);
  assert.equal(fromAuthored.refs.length, 1);
  assert.equal(fromRolled.shortfall, fromAuthored.shortfall);
  assert.deepEqual(fromRolled.notes, fromAuthored.notes);
});

test('an UNBANDED mini_quiz instance has no band, and the note still says so', () => {
  // D2 does not invent a level where the content has none, and that is still the
  // point: a topic whose Part 3 carries no band heading parses to null, rolled or
  // authored alike, and a band filter must keep refusing it.
  //
  // WHAT CHANGED. This used to assert the stronger fact that ALL 388 quiz items
  // in the course are null, because band headings existed only in Part 2. They
  // work in Part 3 too -- the uploader always ran one level scan over both
  // sections -- so the course is being banded a topic at a time and that count is
  // no longer a fixed property of the section. The behaviour under test is
  // unchanged and is now about the ITEM rather than about the mini quiz.
  const quizInstances: Candidate[] = Array.from({ length: 4 }, (_, i) => ({
    ref: { source: 'instance' as const, topic_id: 'QR.3.5', instance_id: `quiz-${i}` },
    level: null,
    section: 'mini_quiz' as const,
  }));
  const practiceInstances: Candidate[] = Array.from({ length: 10 }, (_, i) => ({
    ref: { source: 'instance' as const, topic_id: 'QR.3.5', instance_id: `prac-${i}` },
    level: 'Basic' as const,
    section: 'practice' as const,
  }));

  const result = selectItems(
    [{ topic_id: 'QR.3.5', candidates: [...practiceInstances, ...quizInstances] }],
    { count: 14, levels: ['Basic'], seed: 7 },
  );
  assert.equal(result.refs.length, 10, 'the 10 practice instances, not the 14');
  assert.equal(result.shortfall, 4);
  assert.ok(
    result.notes.some((n) => n.includes('Mini-quiz')),
    'the four set aside must be explained',
  );
});

// ─── D1: the mixed pool ─────────────────────────────────────────────────────
//
// The rule is per ITEM. A templated topic offers rolled instances for the items
// that rolled and authored numbers for the rest, rather than the all-or-nothing
// swap it used to be. These are the three shapes that behaviour has to get
// right, and the third is the one the old branch got wrong.

const instance = (id: string, section: 'practice' | 'mini_quiz' = 'practice'): Candidate => ({
  ref: { source: 'instance', topic_id: 'AR.2.1', instance_id: id },
  level: null,
  section,
});

test('a partly templated topic offers BOTH backends', () => {
  // Eleven items rolled, three authored -- the shape the all-or-nothing rule
  // made impossible, and the reason D1 exists. An author who cannot template
  // three stems should lose those three to the static bank, not from the sheet.
  const rolled = Array.from({ length: 11 }, (_, i) => instance(`uuid-${i + 1}`));
  const authored = Array.from({ length: 14 }, (_, i) => practice(i + 1, 'Basic'));
  const served = new Set(Array.from({ length: 11 }, (_, i) => itemKey('practice', i + 1)));

  const pool = mergePools(rolled, authored, served);

  assert.equal(pool.length, 14, 'every gradeable item is still offered');
  assert.equal(pool.filter((c) => c.ref.source === 'instance').length, 11);
  assert.equal(pool.filter((c) => c.ref.source === 'static').length, 3);

  // And the three that came from the static bank are exactly the untemplated
  // ones. An item must never be offered twice: same question, different
  // numbers, printed on one sheet reads as a mistake.
  const staticNumbers = pool
    .filter((c) => c.ref.source === 'static')
    .map((c) => (c.ref.source === 'static' ? c.ref.item_number : 0))
    .sort((a, b) => a - b);
  assert.deepEqual(staticNumbers, [12, 13, 14]);
});

test('a fully templated topic offers no authored duplicates', () => {
  const rolled = Array.from({ length: 14 }, (_, i) => instance(`uuid-${i + 1}`));
  const authored = Array.from({ length: 14 }, (_, i) => practice(i + 1, 'Basic'));
  const served = new Set(Array.from({ length: 14 }, (_, i) => itemKey('practice', i + 1)));

  const pool = mergePools(rolled, authored, served);
  assert.equal(pool.length, 14);
  assert.equal(pool.filter((c) => c.ref.source === 'static').length, 0);
});

test('a template whose instances are all retired falls back to its authored item', () => {
  // THE CASE KEYING ON "HAS A TEMPLATE" WOULD LOSE. The item has a template
  // row, so it is not authored-only; the roll produced nothing, so it is not
  // rolled either. Excluding it from both sides is how a question leaves a
  // worksheet with nothing reporting a shortfall.
  const rolled = [instance('uuid-1'), instance('uuid-2')];
  const authored = Array.from({ length: 3 }, (_, i) => practice(i + 1, 'Basic'));
  // Item 3 has a template. Every instance of it has been retired, so the roll
  // answered for 1 and 2 only.
  const served = new Set([itemKey('practice', 1), itemKey('practice', 2)]);

  const pool = mergePools(rolled, authored, served);
  assert.equal(pool.length, 3, 'the retired item is served from the static bank');
  const fallback = pool.filter((c) => c.ref.source === 'static');
  assert.equal(fallback.length, 1);
  assert.equal(fallback[0].ref.source === 'static' && fallback[0].ref.item_number, 3);
});

test('sections do not collide: practice 1 and mini_quiz 1 are different items', () => {
  // itemKey exists for this. Keyed on the number alone, rolling practice 1
  // would suppress the authored mini_quiz 1.
  const rolled = [instance('uuid-p1', 'practice')];
  const authored = [practice(1, 'Basic'), quiz(1)];
  const served = new Set([itemKey('practice', 1)]);

  const pool = mergePools(rolled, authored, served);
  assert.equal(pool.length, 2);
  assert.ok(
    pool.some((c) => c.ref.source === 'static' && c.ref.section === 'mini_quiz'),
    'the quiz item is untouched by a practice roll',
  );
});
