import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CODE_ALPHABET,
  CODE_LENGTH,
  JOIN_COOKIE_OPTIONS,
  checkJoinCode,
  isPlausibleJoinCode,
} from '../app/lib/join-code.ts';
import { enrolFromJoinCode, isJoinSuccess } from '../app/lib/join-enroll.ts';
import { messageFor } from '../app/dashboard/join-result-copy.ts';

// The join code as a shape, and the post-auth enrolment that acts on it.
//
// The enrolment half is tested against a stub client rather than a database
// because the branch that matters is the CONFLICT branch, and provoking a real
// 23505 would mean two concurrent writers. The stub lets the conflict be the
// starting condition instead of something to race into.

// ─── checkJoinCode ───────────────────────────────────────────────────────────

test('a well-formed code is accepted and normalised', () => {
  for (const [raw, expected] of [
    ['XK7R2P', 'XK7R2P'],
    ['xk7r2p', 'XK7R2P'],
    ['  XK7R2P  ', 'XK7R2P'],
    ['XK7 R2P', 'XK7R2P'],
    ['XK7-R2P', 'XK7R2P'],
    ['x k 7 - r 2 p', 'XK7R2P'],
  ] as const) {
    const r = checkJoinCode(raw);
    assert.equal(r.ok, true, raw);
    assert.equal(r.code, expected, raw);
    assert.equal(r.reason, null, raw);
  }
});

// THE CHARSET IS NOT VALIDATED, and this test is here to keep it that way.
//
// A charset check against CODE_ALPHABET was written first and looked obviously
// right. Production disagreed: of 7 active classes, three carry a join_code
// containing '0' or '1'. Those codes predate the alphabet and nothing migrated
// them, so validating against it would have told three real classrooms their
// teacher's code was impossible and refused to look it up.
//
// The strings below are shaped like the live ones. If someone reinstates the
// charset check, this fails.
test('codes outside the generator alphabet are still accepted, because live ones exist', () => {
  for (const raw of ['18ABCD', '55AB0C', 'B10XYZ', 'XK7R2O', 'XKIR2P', 'XKLR2P']) {
    const r = checkJoinCode(raw);
    assert.equal(r.ok, true, raw);
    assert.equal(r.code, raw.toUpperCase(), raw);
  }
});

test('length and emptiness are the only refusals', () => {
  assert.equal(checkJoinCode('').reason, 'empty');
  assert.equal(checkJoinCode('   ').reason, 'empty');
  assert.equal(checkJoinCode(null).reason, 'empty');
  assert.equal(checkJoinCode(undefined).reason, 'empty');
  assert.equal(checkJoinCode(123456).reason, 'empty');
  assert.equal(checkJoinCode({ code: 'XK7R2P' }).reason, 'empty');
  assert.equal(checkJoinCode('XK7R2').reason, 'length');
  assert.equal(checkJoinCode('XK7R2PQ').reason, 'length');
});

// Punctuation is not refused either, for the same reason: the validator's job is
// to reject a field that cannot be a code, not to guess which characters a
// teacher's code is allowed to contain. Nothing here can match a row, so it
// costs one lookup and a miss.
test('a six-character string is accepted whatever it contains', () => {
  for (const raw of ['XK7R2!', 'XK7R2#', "XK7R2'"]) {
    assert.equal(checkJoinCode(raw).ok, true, raw);
  }
});

// The generator in app/api/teacher/classes/route.ts draws from CODE_ALPHABET.
// If the validator ever refused a glyph the generator can emit, real classes
// would mint codes that could not be typed in.
test('every code the generator can emit passes the validator', () => {
  assert.equal(CODE_ALPHABET.length, 31);
  for (const ch of CODE_ALPHABET) {
    const code = ch.repeat(CODE_LENGTH);
    assert.equal(checkJoinCode(code).ok, true, code);
  }
});

test('the courtesy check agrees with the real one', () => {
  assert.equal(isPlausibleJoinCode('XK7R2P'), true);
  assert.equal(isPlausibleJoinCode('B10XYZ'), true);
  assert.equal(isPlausibleJoinCode('XK7R2'), false);
});

// The cookie is the whole reason the code is not in the URL any more.
test('the handoff cookie cannot be read by script or sent cross-site', () => {
  assert.equal(JOIN_COOKIE_OPTIONS.httpOnly, true);
  assert.equal(JOIN_COOKIE_OPTIONS.secure, true);
  // Lax and not Strict: the return from accounts.google.com is a top-level GET
  // navigation from another origin, which Lax permits and Strict would drop --
  // taking the entire feature with it.
  assert.equal(JOIN_COOKIE_OPTIONS.sameSite, 'lax');
  assert.ok(JOIN_COOKIE_OPTIONS.maxAge > 0 && JOIN_COOKIE_OPTIONS.maxAge <= 30 * 60);
});

// ─── enrolFromJoinCode ───────────────────────────────────────────────────────

const CLASS = { id: 'class-1', name: 'Period 3 Algebra', teacher_id: 'teacher-1' };
const STUDENT = 'student-1';

type StubOpts = {
  cls?: typeof CLASS | null;
  clsError?: { message: string } | null;
  insertError?: { code?: string; message: string } | null;
  existing?: { id: string; status: string } | null;
  existingError?: { message: string } | null;
  updateError?: { message: string } | null;
};

/** Records what was written, so a test can assert on the write and not just the outcome. */
function stubAdmin(opts: StubOpts) {
  const writes: Record<string, unknown>[] = [];
  const updates: Record<string, unknown>[] = [];
  const client = {
    from(table: string) {
      if (table === 'classes') {
        const chain = {
          select: () => chain,
          eq: () => chain,
          is: () => chain,
          maybeSingle: async () => ({
            data: opts.clsError ? null : opts.cls ?? null,
            error: opts.clsError ?? null,
          }),
        };
        return chain;
      }
      const chain = {
        insert: async (row: Record<string, unknown>) => {
          writes.push(row);
          return { error: opts.insertError ?? null };
        },
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => ({
          data: opts.existingError ? null : opts.existing ?? null,
          error: opts.existingError ?? null,
        }),
        update: (row: Record<string, unknown>) => {
          updates.push(row);
          return { eq: async () => ({ error: opts.updateError ?? null }) };
        },
      };
      return chain;
    },
  };
  return { client, writes, updates };
}

const CONFLICT = { code: '23505', message: 'duplicate key value violates unique constraint' };

test('a clean insert enrols, and writes enrolled_via join_code', async () => {
  const { client, writes } = stubAdmin({ cls: CLASS });
  const r = await enrolFromJoinCode(client as never, STUDENT, 'xk7r2p');
  assert.equal(r.outcome, 'enrolled');
  assert.equal(r.className, 'Period 3 Algebra');
  assert.equal(isJoinSuccess(r.outcome), true);
  assert.deepEqual(writes, [
    { class_id: 'class-1', student_id: STUDENT, enrolled_via: 'join_code' },
  ]);
});

// The two doors into class_enrollments must tell a student the same story.
// /api/enroll:48-50 answers "already enrolled" for an active row.
test('an active existing row is already-enrolled, not a silent success', async () => {
  const { client, updates } = stubAdmin({
    cls: CLASS,
    insertError: CONFLICT,
    existing: { id: 'enr-1', status: 'active' },
  });
  const r = await enrolFromJoinCode(client as never, STUDENT, 'XK7R2P');
  assert.equal(r.outcome, 'already-enrolled');
  assert.equal(r.className, 'Period 3 Algebra');
  assert.equal(isJoinSuccess(r.outcome), false);
  // Nothing is rewritten for a student who is already in the class.
  assert.deepEqual(updates, []);
});

// /api/enroll:52-57 reactivates a removed row and reports success.
test('a removed row is flipped back to active and counts as success', async () => {
  const { client, updates } = stubAdmin({
    cls: CLASS,
    insertError: CONFLICT,
    existing: { id: 'enr-1', status: 'removed' },
  });
  const r = await enrolFromJoinCode(client as never, STUDENT, 'XK7R2P');
  assert.equal(r.outcome, 'reactivated');
  assert.equal(isJoinSuccess(r.outcome), true);
  // Status only, matching /api/enroll rather than the teacher-invite route,
  // which also rewrites enrolled_via.
  assert.deepEqual(updates, [{ status: 'active' }]);
});

test('a class archived or deleted between lookup and callback is its own outcome', async () => {
  const { client, writes } = stubAdmin({ cls: null });
  const r = await enrolFromJoinCode(client as never, STUDENT, 'XK7R2P');
  assert.equal(r.outcome, 'class-gone');
  assert.equal(r.className, null);
  // Nothing was attempted against a class that is not there.
  assert.deepEqual(writes, []);
});

// Carried across from /api/enroll:36-38. The likeliest person to hit it is a
// teacher walking their own student flow.
test('a teacher cannot enrol in their own class', async () => {
  const { client, writes } = stubAdmin({ cls: CLASS });
  const r = await enrolFromJoinCode(client as never, 'teacher-1', 'XK7R2P');
  assert.equal(r.outcome, 'own-class');
  assert.equal(r.className, 'Period 3 Algebra');
  assert.deepEqual(writes, []);
});

test('a tampered cookie is refused before it can become a write', async () => {
  const { client, writes } = stubAdmin({ cls: CLASS });
  for (const bad of ['', 'XK7R2', '../../etc', 'XK7R2P XK7R2P']) {
    const r = await enrolFromJoinCode(client as never, STUDENT, bad);
    assert.equal(r.outcome, 'invalid', bad);
  }
  assert.deepEqual(writes, []);
});

// A failure must never be reported as success. This is the outcome the student
// sees as "we could not add you to the class", and it has to be reachable.
test('a non-conflict insert error fails rather than claiming success', async () => {
  const { client } = stubAdmin({
    cls: CLASS,
    insertError: { code: '23503', message: 'foreign key violation' },
  });
  const r = await enrolFromJoinCode(client as never, STUDENT, 'XK7R2P');
  assert.equal(r.outcome, 'failed');
  assert.equal(isJoinSuccess(r.outcome), false);
  // The class name survives, so the copy can still name what they were joining.
  assert.equal(r.className, 'Period 3 Algebra');
});

test('a lookup error is a failure, never a not-found', async () => {
  const { client } = stubAdmin({ clsError: { message: 'connection reset' } });
  const r = await enrolFromJoinCode(client as never, STUDENT, 'XK7R2P');
  assert.equal(r.outcome, 'failed');
  assert.notEqual(r.outcome, 'class-gone');
});

test('a conflict whose row cannot be read back fails rather than guessing', async () => {
  const { client } = stubAdmin({
    cls: CLASS,
    insertError: CONFLICT,
    existing: null,
  });
  const r = await enrolFromJoinCode(client as never, STUDENT, 'XK7R2P');
  assert.equal(r.outcome, 'failed');
});

test('a reactivation that fails to write is not reported as reactivated', async () => {
  const { client } = stubAdmin({
    cls: CLASS,
    insertError: CONFLICT,
    existing: { id: 'enr-1', status: 'removed' },
    updateError: { message: 'write failed' },
  });
  const r = await enrolFromJoinCode(client as never, STUDENT, 'XK7R2P');
  assert.equal(r.outcome, 'failed');
  assert.equal(isJoinSuccess(r.outcome), false);
});

// The guard /api/enroll uses is a read-then-write, which two concurrent submits
// can both pass. This path does not read first at all: the insert goes in and
// the constraint decides. Asserting the ORDER, because a re-introduced pre-read
// would still pass every outcome test above.
test('no existence check happens before the insert', async () => {
  const calls: string[] = [];
  const client = {
    from(table: string) {
      const chain = {
        select: () => {
          calls.push(`select:${table}`);
          return chain;
        },
        eq: () => chain,
        is: () => chain,
        maybeSingle: async () => ({ data: table === 'classes' ? CLASS : null, error: null }),
        insert: async () => {
          calls.push(`insert:${table}`);
          return { error: null };
        },
        update: () => ({ eq: async () => ({ error: null }) }),
      };
      return chain;
    },
  };
  await enrolFromJoinCode(client as never, STUDENT, 'XK7R2P');
  assert.deepEqual(calls, ['select:classes', 'insert:class_enrollments']);
});

// ─── What the student is told on arrival ─────────────────────────────────────
//
// The enrolment now happens in the OAuth callback, so the student learns whether
// it worked on a page they did not submit anything from. The one property that
// has to hold is that NO outcome is silent -- landing on the dashboard neither
// enrolled nor told is the failure the whole flow exists to prevent.

test('every join outcome produces a sentence, including unrecognised ones', () => {
  const outcomes = [
    'enrolled',
    'reactivated',
    'already-enrolled',
    'class-gone',
    'own-class',
    'expired',
    'invalid',
    'failed',
    // Not a real outcome. If the callback ever grows one and nobody adds copy,
    // this is the branch that catches them, and it must still say something.
    'something-nobody-has-written-yet',
  ];
  for (const outcome of outcomes) {
    for (const name of ['Period 3 Algebra', null]) {
      const m = messageFor(outcome, name);
      assert.ok(m.text.trim().length > 20, `${outcome}/${name}: too short to be a real sentence`);
      assert.ok(['good', 'warn', 'bad'].includes(m.tone), `${outcome}: bad tone`);
    }
  }
});

test('only the outcomes that actually enrolled read as good news', () => {
  for (const good of ['enrolled', 'reactivated', 'already-enrolled']) {
    assert.equal(messageFor(good, 'Algebra').tone, 'good', good);
  }
  for (const notGood of ['class-gone', 'own-class', 'expired', 'invalid', 'failed']) {
    assert.notEqual(messageFor(notGood, 'Algebra').tone, 'good', notGood);
  }
});

test('a missing class name never leaves a hole in the sentence', () => {
  for (const outcome of ['enrolled', 'already-enrolled', 'failed']) {
    const text = messageFor(outcome, null).text;
    assert.ok(!text.includes('null') && !text.includes('undefined'), outcome);
    assert.ok(!text.includes('““') && !text.includes('""'), outcome);
  }
});

// User-facing copy, so it follows the house rule the rest of the product does.
test('no em dashes or stray double hyphens reach the student', () => {
  const all = [
    ...['enrolled', 'reactivated', 'already-enrolled', 'class-gone', 'own-class', 'expired', 'failed']
      .flatMap((o) => [messageFor(o, 'Algebra').text, messageFor(o, null).text]),
  ];
  for (const text of all) {
    assert.ok(!text.includes('—'), `em dash in: ${text}`);
    assert.ok(!text.includes('--'), `double hyphen in: ${text}`);
  }
});
