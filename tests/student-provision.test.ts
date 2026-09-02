import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateStudentCode, STUDENT_CODE_LENGTH } from '../app/lib/student-code.ts';
import { provisionStudent } from '../app/lib/student-provision.ts';
import { CODE_LENGTH } from '../app/lib/join-code.ts';

// "Add with code": minting one student account from the teacher dashboard.
//
// Tested against a stub client rather than a database, for the reason
// tests/join-code.test.ts gives about the same table: the branches that matter
// are the CONFLICT branches, and provoking a real 23505 would mean two
// concurrent writers. The stub lets the conflict be the starting condition.
//
// The conflict here is not hypothetical. handle_pending_invites() is an AFTER
// INSERT trigger on auth.users that enrols a new account from a matching
// pending_invites row, so on a student who was invited first the database has
// already made the enrolment before the route's own enrol step runs.

// ─── The generator ───────────────────────────────────────────────────────────

const ALPHABET = new Set('23456789ABCDEFGHJKMNPQRSTUVWXYZ'.split(''));

test('a code is 12 characters drawn from the readable alphabet', () => {
  for (let i = 0; i < 500; i += 1) {
    const code = generateStudentCode();
    assert.equal(code.length, STUDENT_CODE_LENGTH);
    assert.equal(code.length, 12);
    for (const ch of code) {
      assert.ok(ALPHABET.has(ch), `${ch} is not in the alphabet (code ${code})`);
    }
  }
});

// THIS IS A PASSWORD, NOT A JOIN CODE. If someone ever "simplifies" this module
// into a call to generateJoinCode, the length collapses from 59.4 bits to 29.7
// and this fails. The assertion is on the relationship, not just the number.
test('a code is not the join-code shape', () => {
  assert.notEqual(STUDENT_CODE_LENGTH, CODE_LENGTH);
  assert.ok(STUDENT_CODE_LENGTH > CODE_LENGTH);
  assert.equal(generateStudentCode().length !== CODE_LENGTH, true);
});

// The glyphs join-code.ts dropped because they get misread off paper. A student
// types this exactly once, from a slip of paper, into a password field that will
// not tell them which character was wrong.
test('ambiguous glyphs never appear', () => {
  for (let i = 0; i < 500; i += 1) {
    assert.doesNotMatch(generateStudentCode(), /[01OIL]/);
  }
});

// Supabase has a "letters and digits" password policy tier a project can turn
// on. A uniform draw misses a digit 3.3% of the time, so without the redraw a
// small share of students would fail createUser for a reason nobody could act on.
test('every code carries at least one digit and one letter', () => {
  for (let i = 0; i < 2000; i += 1) {
    const code = generateStudentCode();
    assert.match(code, /[0-9]/, `no digit in ${code}`);
    assert.match(code, /[A-Z]/, `no letter in ${code}`);
  }
});

// The entropy smoke test, and it is worth being precise about what it catches,
// because it was proved against a faulted generator rather than assumed. It does
// NOT catch a shortened code: at the join-code's own 31^6 keyspace, 5,000 draws
// still almost never collide, and the length assertions above are what fail
// there. What this catches is a source that has stopped being random -- a
// stubbed or monkey-patched crypto, a shimmed node:crypto under a browser
// target, a constant seed -- which shows up here as duplicates immediately.
test('5,000 draws are all distinct', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 5000; i += 1) seen.add(generateStudentCode());
  assert.equal(seen.size, 5000, 'a repeated code means the draw is not random');
});

// ─── The stub client ─────────────────────────────────────────────────────────

const TEACHER = 'teacher-1';
const CLASS = 'class-1';
const CONFLICT = { code: '23505', message: 'duplicate key value violates unique constraint' };

interface StubOpts {
  /** auth.users rows the paged lookup will walk. */
  users?: { id: string; email: string }[];
  /** Make listUsers report a read failure. */
  listError?: { message: string };
  /** Make createUser refuse. */
  createError?: { code?: string; message: string };
  /** The id createUser hands back. */
  createdId?: string;
  /** Users that only appear on the SECOND lookup (the race case). */
  usersAfterCreate?: { id: string; email: string }[];
  /** Error the class_enrollments insert returns. */
  insertError?: { code?: string; message: string } | null;
  /** The row the conflict branch reads back. */
  existing?: { id: string; status: string } | null;
  updateError?: { message: string } | null;
}

function stubAdmin(opts: StubOpts) {
  const writes: Record<string, unknown>[] = [];
  const updates: Record<string, unknown>[] = [];
  const created: Record<string, unknown>[] = [];
  let listCalls = 0;

  const client = {
    auth: {
      admin: {
        listUsers: async () => {
          listCalls += 1;
          if (opts.listError) return { data: null, error: opts.listError };
          const pool = listCalls > 1 && opts.usersAfterCreate ? opts.usersAfterCreate : opts.users ?? [];
          return { data: { users: pool }, error: null };
        },
        createUser: async (payload: Record<string, unknown>) => {
          created.push(payload);
          if (opts.createError) return { data: null, error: opts.createError };
          return { data: { user: { id: opts.createdId ?? 'new-user' } }, error: null };
        },
      },
    },
    from: () => {
      const chain: Record<string, unknown> = {
        insert: async (row: Record<string, unknown>) => {
          writes.push(row);
          return { error: opts.insertError ?? null };
        },
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => ({ data: opts.existing ?? null, error: null }),
        update: (row: Record<string, unknown>) => {
          updates.push(row);
          return { eq: async () => ({ error: opts.updateError ?? null }) };
        },
      };
      return chain;
    },
  };

  return { client, writes, updates, created, listCalls: () => listCalls };
}

const INPUT = {
  classId: CLASS,
  teacherId: TEACHER,
  email: 'Ana.Reyes@district.edu',
  firstName: 'Ana',
  lastName: 'Reyes',
};

// ─── 1. The clean mint ───────────────────────────────────────────────────────

test('a new student gets an account, a code, and an enrolment', async () => {
  const { client, writes, created } = stubAdmin({ users: [], createdId: 'stu-1' });
  const r = await provisionStudent(client as never, INPUT);

  assert.equal(r.outcome, 'created');
  assert.equal(r.enrolment, 'enrolled');
  assert.equal(r.userId, 'stu-1');
  assert.equal(r.error, null);
  assert.equal(typeof r.code, 'string');
  assert.equal(r.code!.length, STUDENT_CODE_LENGTH);

  // The email is normalised once, and the SAME normalised value is what the
  // account is keyed on and what comes back to the teacher.
  assert.equal(r.email, 'ana.reyes@district.edu');
  assert.equal(created[0].email, 'ana.reyes@district.edu');
  assert.equal(created[0].password, r.code);
  // No confirmation mail, and the name lands in metadata because profiles has
  // no name column.
  assert.equal(created[0].email_confirm, true);
  assert.deepEqual(created[0].user_metadata, { full_name: 'Ana Reyes' });

  assert.deepEqual(writes, [
    { class_id: CLASS, student_id: 'stu-1', enrolled_via: 'teacher_invite' },
  ]);
});

// ─── 2. The trigger case: already enrolled before we enrolled ────────────────

test('an enrolment the trigger already made is SUCCESS, and the code still comes back', async () => {
  const { client, updates } = stubAdmin({
    users: [],
    createdId: 'stu-1',
    insertError: CONFLICT,
    existing: { id: 'enr-1', status: 'active' },
  });
  const r = await provisionStudent(client as never, INPUT);

  assert.equal(r.outcome, 'created');
  assert.equal(r.enrolment, 'already-enrolled');
  // THE POINT OF THE WHOLE ROUTE. handle_pending_invites() enrolled this student
  // the instant the account was created; that must not read as an error, and it
  // must not cost the teacher the one sight of the password.
  assert.equal(typeof r.code, 'string');
  assert.equal(r.error, null);
  // Nothing is rewritten for a student who is already in the class.
  assert.deepEqual(updates, []);
});

// ─── 3. A removed row is reactivated, status only ────────────────────────────

test('a previously removed student is flipped back to active', async () => {
  const { client, updates } = stubAdmin({
    users: [],
    createdId: 'stu-1',
    insertError: CONFLICT,
    existing: { id: 'enr-1', status: 'removed' },
  });
  const r = await provisionStudent(client as never, INPUT);

  assert.equal(r.outcome, 'created');
  assert.equal(r.enrolment, 'reactivated');
  // status ONLY. enrolled_via records how a student first arrived, and a student
  // who arrived by join code did still arrive by join code.
  assert.deepEqual(updates, [{ status: 'active' }]);
});

// ─── 4. The account already exists ───────────────────────────────────────────

test('an existing account is enrolled, and NO code is invented', async () => {
  const { client, writes, created } = stubAdmin({
    users: [{ id: 'stu-9', email: 'ana.reyes@district.edu' }],
  });
  const r = await provisionStudent(client as never, INPUT);

  assert.equal(r.outcome, 'existing');
  // Supabase hashes the password. There is nothing to return, and minting a
  // replacement would silently lock the student out of the account they use.
  assert.equal(r.code, null);
  assert.equal(r.userId, 'stu-9');
  assert.equal(r.enrolment, 'enrolled');
  assert.deepEqual(created, [], 'createUser must not be called for an account that exists');
  assert.deepEqual(writes, [
    { class_id: CLASS, student_id: 'stu-9', enrolled_via: 'teacher_invite' },
  ]);
});

// The lookup is case-insensitive on both sides, because a district hands out
// addresses in whatever case it likes and a second account for the same person
// is the failure this whole module exists to avoid.
test('a differently-cased address resolves to the same account', async () => {
  const { client, created } = stubAdmin({
    users: [{ id: 'stu-9', email: 'ANA.REYES@District.edu' }],
  });
  const r = await provisionStudent(client as never, INPUT);
  assert.equal(r.outcome, 'existing');
  assert.deepEqual(created, []);
});

// ─── 5. Idempotency: the same add, twice ─────────────────────────────────────

test('running the same add twice never 500s and never doubles anything', async () => {
  // First run: nobody there.
  const first = stubAdmin({ users: [], createdId: 'stu-1' });
  const r1 = await provisionStudent(first.client as never, INPUT);
  assert.equal(r1.outcome, 'created');
  assert.equal(first.writes.length, 1);
  assert.equal(first.created.length, 1);

  // Second run: the account from the first run now exists, and so does its
  // enrolment, so the insert conflicts.
  const second = stubAdmin({
    users: [{ id: 'stu-1', email: 'ana.reyes@district.edu' }],
    insertError: CONFLICT,
    existing: { id: 'enr-1', status: 'active' },
  });
  const r2 = await provisionStudent(second.client as never, INPUT);

  assert.equal(r2.outcome, 'existing');
  assert.equal(r2.enrolment, 'already-enrolled');
  assert.equal(r2.code, null);
  assert.equal(r2.error, null, 'the second run must not be an error');
  assert.deepEqual(second.created, [], 'no second account');
  assert.equal(second.writes.length, 1, 'one insert attempted, and the database refused it');
  assert.deepEqual(second.updates, [], 'an active row is left alone');
});

// ─── 6. The teacher's own address ────────────────────────────────────────────

test('a teacher cannot add themselves as a student', async () => {
  const { client, writes, created } = stubAdmin({
    users: [{ id: TEACHER, email: 'ana.reyes@district.edu' }],
  });
  const r = await provisionStudent(client as never, INPUT);

  assert.equal(r.outcome, 'own-account');
  assert.equal(r.code, null);
  assert.equal(r.enrolment, null);
  assert.deepEqual(writes, [], 'nothing is written');
  assert.deepEqual(created, [], 'nothing is created');
});

// ─── 7. A failed lookup must never become an account ─────────────────────────

test('a lookup that could not read is a failure, not "no such user"', async () => {
  const { client, created, writes } = stubAdmin({ listError: { message: 'connection reset' } });
  const r = await provisionStudent(client as never, INPUT);

  assert.equal(r.outcome, 'failed');
  assert.equal(r.code, null);
  // THE MISTAKE THIS PREVENTS: "not found" and "could not look" are the same
  // value to a caller that only gets null, and one of them means createUser.
  assert.deepEqual(created, [], 'a page that failed to read must not mint an account');
  assert.deepEqual(writes, []);
  assert.match(r.error ?? '', /Nothing was created/);
});

// ─── 8. Losing the race with another writer ──────────────────────────────────

test('a createUser refused as already-registered resolves to the existing account', async () => {
  const { client, writes } = stubAdmin({
    // The first lookup sees nobody, so we try to create...
    users: [],
    createError: { code: 'email_exists', message: 'A user with this email address has already been registered' },
    // ...and the re-resolution finds the account the other writer made.
    usersAfterCreate: [{ id: 'stu-7', email: 'ana.reyes@district.edu' }],
  });
  const r = await provisionStudent(client as never, INPUT);

  assert.equal(r.outcome, 'existing');
  assert.equal(r.code, null, 'the code that was drawn but never used must not escape');
  assert.equal(r.userId, 'stu-7');
  assert.deepEqual(writes, [
    { class_id: CLASS, student_id: 'stu-7', enrolled_via: 'teacher_invite' },
  ]);
});

test('a createUser refused for any other reason is a plain failure', async () => {
  const { client, writes } = stubAdmin({
    users: [],
    createError: { code: 'weak_password', message: 'Password does not meet requirements' },
  });
  const r = await provisionStudent(client as never, INPUT);

  assert.equal(r.outcome, 'failed');
  assert.equal(r.code, null);
  assert.equal(r.error, 'Password does not meet requirements');
  assert.deepEqual(writes, []);
});

// ─── 9. Created, but the enrolment fell over ─────────────────────────────────

test('an account that was created returns its code even when the enrolment fails', async () => {
  const { client } = stubAdmin({
    users: [],
    createdId: 'stu-1',
    insertError: { code: '23503', message: 'insert or update violates foreign key constraint' },
  });
  const r = await provisionStudent(client as never, INPUT);

  assert.equal(r.outcome, 'created');
  assert.equal(r.enrolment, 'failed');
  // The account exists and Supabase has hashed the password. A failed enrolment
  // is a student who has to be added again; a swallowed code is a student who
  // can never sign in at all.
  assert.equal(typeof r.code, 'string');
  assert.equal(r.code!.length, STUDENT_CODE_LENGTH);
});

// ─── The landmines, pinned in the route's source ─────────────────────────────
//
// Cheap regressions for three decisions that are invisible at runtime in a unit
// test but expensive to get wrong in production.

const ROUTE = readFileSync(new URL('../app/api/teacher/provision/route.ts', import.meta.url), 'utf8');

// ASSERTED ON THE CALL SITE, NOT ON THE IMPORT, and that correction came out of
// fault-proofing rather than review. The first spelling of the limiter check was
// /provisionRateLimit/, which stayed GREEN when the whole safeLimit() block was
// deleted from the route -- because the now-unused import line still carried the
// word. A guard that a deleted gate cannot trip is worse than no guard, since it
// reads as coverage.
test('the route is gated and rate limited', () => {
  assert.match(ROUTE, /await requireTeacher\(\)/, 'must be behind requireTeacher');
  assert.match(
    ROUTE,
    /safeLimit\(\s*provisionRateLimit\s*,\s*profile\.id\s*\)/,
    'must actually charge its own limiter, keyed on the teacher'
  );
  assert.match(ROUTE, /status: 429/, 'must refuse when the limiter says no');
  assert.match(ROUTE, /\.eq\("teacher_id", profile\.id\)/, 'must verify class ownership');
});

// The unpaginated listUsers() at invite/route.ts:49 sees one page of 50 and
// reports "no such user" about people who plainly exist. On the invite route
// that costs a redundant email. Here it would try to MINT an account that
// already exists, so the paged helper is not optional.
test('the route never reaches for the unpaginated listUsers', () => {
  assert.doesNotMatch(ROUTE, /listUsers/, 'use findUserByEmail, not listUsers');
});

// class-data-export is the Pro-only capability behind the CSV downloads, and the
// export routes spend it through profileGrants(). Adding a student to your own
// class is not an export and must not inherit that gate.
//
// ASSERTED ON THE CALL, NOT ON THE CAPABILITY NAME, because the route's own
// header comment names class-data-export in order to say it is NOT used. A
// string match there would fail on the documentation rather than on the code.
test('the route does not inherit the Pro-only export capability', () => {
  assert.doesNotMatch(ROUTE, /profileGrants/, 'no capability gate belongs on this route');
  assert.doesNotMatch(ROUTE, /from ["'].*capabilities["']/);
});
