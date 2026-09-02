import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseRosterPaste,
  summarisePaste,
  isRosterEmail,
  BULK_PROVISION_MAX_ROWS,
} from '../app/lib/roster-paste.ts';
import {
  rowPresentation,
  csvStatus,
  buildRosterCsv,
  rosterCsvFilename,
  type BulkRowResult,
} from '../app/lib/roster-results.ts';
import { provisionStudent } from '../app/lib/student-provision.ts';
import { safeLimit } from '../app/lib/rate-limit.ts';
import { bulkProvisionSchema } from '../app/lib/schemas.ts';

// "Add roster": one pasted class, one request, one account per line.
//
// The provisioning itself is covered by tests/student-provision.test.ts and is
// not re-tested here. What this file covers is everything bulk ADDS on top: the
// parser that decides which lines may be minted at all, the presentation rule
// that stops a minted-but-not-enrolled student reading as a success, the shape
// of the route's gates, and the one shared helper this build had to touch.

// ─── 1. The parser ───────────────────────────────────────────────────────────
//
// Table driven, because the whole surface is "what does this line mean" and the
// cases that matter are the ones a teacher's actual clipboard produces.

const READY = 'ready';

const PARSE_CASES: {
  name: string;
  paste: string;
  expect: { line: number; first: string; last: string; email: string; status: string }[];
}[] = [
  {
    // Google Sheets and Excel both put tabs between the cells of a dragged
    // selection. This is the paste the feature was built for.
    name: 'tab separated, straight out of a spreadsheet',
    paste: 'Ana\tReyes\tana.reyes@district.edu\nLuis\tOrtega\tluis.ortega@district.edu',
    expect: [
      { line: 1, first: 'Ana', last: 'Reyes', email: 'ana.reyes@district.edu', status: READY },
      { line: 2, first: 'Luis', last: 'Ortega', email: 'luis.ortega@district.edu', status: READY },
    ],
  },
  {
    name: 'comma separated, typed by hand',
    paste: 'Ana,Reyes,ana.reyes@district.edu',
    expect: [{ line: 1, first: 'Ana', last: 'Reyes', email: 'ana.reyes@district.edu', status: READY }],
  },
  {
    // A typed list almost always has spaces after the commas.
    name: 'comma separated with spaces, and both separators in one paste',
    paste: 'Ana, Reyes, ana.reyes@district.edu\nLuis\tOrtega\tluis.ortega@district.edu',
    expect: [
      { line: 1, first: 'Ana', last: 'Reyes', email: 'ana.reyes@district.edu', status: READY },
      { line: 2, first: 'Luis', last: 'Ortega', email: 'luis.ortega@district.edu', status: READY },
    ],
  },
  {
    // THE RAGGED LINE, and the reason it is refused rather than truncated. A
    // student with two surnames typed "Reyes, Ana Maria, ana@..." splits into
    // four. Keeping the first three would mint an account for "Ana Maria"
    // whose email column holds a surname.
    name: 'more than three fields is refused, never truncated',
    paste: 'Ana\tMaria\tReyes\tana.reyes@district.edu',
    expect: [{ line: 1, first: 'Ana', last: 'Maria', email: 'Reyes', status: 'missing-field' }],
  },
  {
    name: 'two fields is a missing field, not a blank email',
    paste: 'Ana\tReyes',
    expect: [{ line: 1, first: 'Ana', last: 'Reyes', email: '', status: 'missing-field' }],
  },
  {
    name: 'an empty field in the middle is a missing field',
    paste: 'Ana,,ana.reyes@district.edu',
    expect: [{ line: 1, first: 'Ana', last: '', email: 'ana.reyes@district.edu', status: 'missing-field' }],
  },
  {
    name: 'a malformed address is bad-email, and the row still shows what was typed',
    paste: 'Ana\tReyes\tana.reyes@district',
    expect: [{ line: 1, first: 'Ana', last: 'Reyes', email: 'ana.reyes@district', status: 'bad-email' }],
  },
  {
    // Blank lines are dropped rather than reported: a spreadsheet paste carries
    // a trailing newline every time, and a row saying "line 3 is empty" is noise
    // the teacher has to clear before the Add button unlocks.
    name: 'blank lines are skipped and do not consume a number',
    paste: 'Ana\tReyes\tana.reyes@district.edu\n\n   \nLuis\tOrtega\tluis.ortega@district.edu\n',
    expect: [
      { line: 1, first: 'Ana', last: 'Reyes', email: 'ana.reyes@district.edu', status: READY },
      { line: 2, first: 'Luis', last: 'Ortega', email: 'luis.ortega@district.edu', status: READY },
    ],
  },
  {
    name: 'the second copy of an email is the duplicate, and it names the first',
    paste: 'Ana\tReyes\tana@district.edu\nAna\tR\tana@district.edu',
    expect: [
      { line: 1, first: 'Ana', last: 'Reyes', email: 'ana@district.edu', status: READY },
      { line: 2, first: 'Ana', last: 'R', email: 'ana@district.edu', status: 'duplicate' },
    ],
  },
  {
    // provisionStudent lowercases before it looks anything up
    // (student-provision.ts:101), so these are one account, not two.
    name: 'duplicates are case insensitive',
    paste: 'Ana\tReyes\tAna@District.edu\nAna\tReyes\tana@district.edu',
    expect: [
      { line: 1, first: 'Ana', last: 'Reyes', email: 'Ana@District.edu', status: READY },
      { line: 2, first: 'Ana', last: 'Reyes', email: 'ana@district.edu', status: 'duplicate' },
    ],
  },
  {
    // Names on a district roster are not ASCII. A parser that mangled these
    // would mint accounts under mangled display names.
    name: 'unicode names survive intact',
    paste: 'José\tPeña-Núñez\tjose.pena@district.edu\nZoë\tO’Brien\tzoe.obrien@district.edu',
    expect: [
      { line: 1, first: 'José', last: 'Peña-Núñez', email: 'jose.pena@district.edu', status: READY },
      { line: 2, first: 'Zoë', last: 'O’Brien', email: 'zoe.obrien@district.edu', status: READY },
    ],
  },
  {
    name: 'carriage returns from a Windows clipboard are not fields',
    paste: 'Ana\tReyes\tana@district.edu\r\nLuis\tOrtega\tluis@district.edu\r\n',
    expect: [
      { line: 1, first: 'Ana', last: 'Reyes', email: 'ana@district.edu', status: READY },
      { line: 2, first: 'Luis', last: 'Ortega', email: 'luis@district.edu', status: READY },
    ],
  },
];

for (const c of PARSE_CASES) {
  test(`parse: ${c.name}`, () => {
    const parsed = parseRosterPaste(c.paste);
    assert.equal(parsed.rows.length, c.expect.length, 'row count');
    c.expect.forEach((want, i) => {
      const got = parsed.rows[i];
      assert.equal(got.line, want.line, `row ${i} line number`);
      assert.equal(got.firstName, want.first, `row ${i} first name`);
      assert.equal(got.lastName, want.last, `row ${i} last name`);
      assert.equal(got.email, want.email, `row ${i} email`);
      assert.equal(got.status, want.status, `row ${i} status`);
    });
  });
}

test('every non-ready row carries a message the teacher can act on', () => {
  const parsed = parseRosterPaste(
    'Ana\tReyes\nLuis\tOrtega\tnope@nowhere\nAna\tReyes\tana@district.edu\nAna\tR\tana@district.edu'
  );
  for (const row of parsed.rows) {
    if (row.status === 'ready') {
      assert.equal(row.message, '', 'a ready row says nothing');
    } else {
      assert.ok(row.message.length > 0, `row ${row.line} has no message`);
    }
  }
  // The duplicate points at the line it collides with, not at itself.
  assert.match(parsed.rows[3].message, /line 3/);
});

test('ready and problem counts partition the rows', () => {
  const parsed = parseRosterPaste('Ana\tReyes\tana@district.edu\nbroken line\nLuis\tOrtega\tluis@district.edu');
  assert.equal(parsed.rows.length, 3);
  assert.equal(parsed.readyCount, 2);
  assert.equal(parsed.problemCount, 1);
  assert.equal(parsed.readyCount + parsed.problemCount, parsed.rows.length);
  assert.equal(parsed.ready.length, 2, 'ready[] is the subset the modal sends');
  assert.ok(parsed.ready.every((r) => r.status === 'ready'));
});

// ─── 2. The email rule ───────────────────────────────────────────────────────
//
// SHARED WITH THE ROUTE. schemas.ts refines the bulk row against this exact
// predicate rather than zod's .email(), because zod validates the whole body at
// once: one address the preview called ready and the schema refused would 400
// the entire paste after the teacher had been told every line was fine.

test('the email rule accepts what a district roster actually contains', () => {
  for (const ok of [
    'ana.reyes@district.edu',
    'a@b.co',
    'first.last+tag@sub.district.k12.tx.us',
    'student_1234@my.district.edu',
    "o'brien@district.edu",
  ]) {
    assert.ok(isRosterEmail(ok), `${ok} should be accepted`);
  }
});

test('the email rule refuses the shapes that would mint a dead account', () => {
  for (const bad of [
    '',
    '   ',
    'ana.reyes',
    'ana.reyes@district', // the truncated domain, the most common roster typo
    '@district.edu',
    'ana@',
    'ana reyes@district.edu',
    'ana@district .edu',
    'ana@@district.edu',
    'ana@district..edu',
    `${'a'.repeat(250)}@district.edu`,
  ]) {
    assert.equal(isRosterEmail(bad), false, `${JSON.stringify(bad)} should be refused`);
  }
});

test('the schema refines against the same predicate the preview uses', () => {
  const row = { first_name: 'Ana', last_name: 'Reyes', email: 'ana@district' };
  const body = { class_id: '00000000-0000-4000-8000-000000000000', students: [row] };
  assert.equal(bulkProvisionSchema.safeParse(body).success, false, 'preview refuses it, so must the schema');

  const good = { ...body, students: [{ ...row, email: 'ana@district.edu' }] };
  assert.equal(bulkProvisionSchema.safeParse(good).success, true);
});

test('the schema is bounded at the number the preview enforces', () => {
  const student = (i: number) => ({ first_name: 'A', last_name: 'B', email: `s${i}@district.edu` });
  const body = (n: number) => ({
    class_id: '00000000-0000-4000-8000-000000000000',
    students: Array.from({ length: n }, (_, i) => student(i)),
  });
  assert.equal(bulkProvisionSchema.safeParse(body(BULK_PROVISION_MAX_ROWS)).success, true);
  assert.equal(bulkProvisionSchema.safeParse(body(BULK_PROVISION_MAX_ROWS + 1)).success, false);
  assert.equal(bulkProvisionSchema.safeParse(body(0)).success, false, 'an empty roster is not a request');
});

test('the count summary reads as a sentence in both directions', () => {
  assert.equal(summarisePaste(parseRosterPaste('')), 'Nothing pasted yet.');
  assert.equal(summarisePaste(parseRosterPaste('Ana\tReyes\tana@district.edu')), '1 ready');
  assert.equal(summarisePaste(parseRosterPaste('Ana\tReyes\tana@district.edu\nbroken')), '1 ready, 1 needs a fix');
  assert.equal(
    summarisePaste(parseRosterPaste('Ana\tReyes\tana@district.edu\nbroken\nalso broken')),
    '1 ready, 2 need a fix'
  );
});

// ─── 3. One batch, four outcomes ─────────────────────────────────────────────
//
// The test that matters most. A real class produces every outcome at once, and
// the row this is really about is Carmen: an account WAS minted, her code is in
// the response and exists nowhere else, and she is NOT in the class. The route
// reports that honestly; the question here is whether anything downstream can
// still render it as a success.

const TEACHER = 'teacher-1';
const CLASS = 'class-1';

interface BatchPlan {
  /** Accounts that already exist: email -> user id. */
  users: Record<string, string>;
  /** createUser refusals, by email. */
  createErrors?: Record<string, { code?: string; message: string }>;
  /** class_enrollments insert failures, by the student id being enrolled. */
  insertErrors?: Record<string, { code?: string; message: string }>;
}

function batchStub(plan: BatchPlan) {
  const client = {
    auth: {
      admin: {
        listUsers: async () => ({
          data: { users: Object.entries(plan.users).map(([email, id]) => ({ id, email })) },
          error: null,
        }),
        createUser: async (payload: Record<string, unknown>) => {
          const email = String(payload.email);
          const err = plan.createErrors?.[email];
          if (err) return { data: null, error: err };
          const id = `new-${email}`;
          // The account now exists, so a later lookup in the same batch finds it.
          plan.users[email] = id;
          return { data: { user: { id } }, error: null };
        },
      },
    },
    from: () => {
      const chain: Record<string, unknown> = {
        insert: async (row: Record<string, unknown>) => ({
          error: plan.insertErrors?.[String(row.student_id)] ?? null,
        }),
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => ({ data: null, error: null }),
        update: () => ({ eq: async () => ({ error: null }) }),
      };
      return chain;
    },
  };
  return client;
}

/**
 * The loop the bulk route runs, over the real primitive.
 *
 * Deliberately not a re-implementation of the route: it calls provisionStudent
 * exactly as the route does and maps the result into the shared BulkRowResult
 * shape, which is the same mapping the route performs. The route's own gates
 * and its per-row try/catch are asserted against its source further down.
 */
async function runBatch(
  client: unknown,
  rows: { first_name: string; last_name: string; email: string }[]
): Promise<BulkRowResult[]> {
  const out: BulkRowResult[] = [];
  for (const row of rows) {
    const r = await provisionStudent(client as never, {
      classId: CLASS,
      teacherId: TEACHER,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
    });
    out.push({
      first_name: row.first_name,
      last_name: row.last_name,
      email: r.email,
      outcome: r.outcome,
      code: r.code,
      enrolment: r.enrolment,
      error: r.error,
    });
  }
  return out;
}

const BATCH_ROWS = [
  { first_name: 'Ana', last_name: 'Reyes', email: 'ana@district.edu' },
  { first_name: 'Beto', last_name: 'Cruz', email: 'beto@district.edu' },
  { first_name: 'The', last_name: 'Teacher', email: 'teacher@district.edu' },
  { first_name: 'Carmen', last_name: 'Diaz', email: 'carmen@district.edu' },
  { first_name: 'Diego', last_name: 'Mora', email: 'diego@district.edu' },
];

function batchFixture() {
  return batchStub({
    users: {
      // Beto already has an account, so he enrols without a code.
      'beto@district.edu': 'stu-beto',
      // The teacher's own address.
      'teacher@district.edu': TEACHER,
    },
    createErrors: {
      'diego@district.edu': { message: 'Password is too weak' },
    },
    insertErrors: {
      // Carmen's account is created, then her enrolment fails outright. Not
      // 23505 -- that resolves to success -- but a real refusal.
      'new-carmen@district.edu': { code: '42501', message: 'permission denied' },
    },
  });
}

test('one batch carries created, existing, own-account and failed at once', async () => {
  const results = await runBatch(batchFixture(), BATCH_ROWS);

  assert.deepEqual(
    results.map((r) => r.outcome),
    ['created', 'existing', 'own-account', 'created', 'failed'],
    'each row reports itself, and no row changes another'
  );

  // Order is preserved, so the results table lines up with the paste.
  assert.deepEqual(
    results.map((r) => r.first_name),
    ['Ana', 'Beto', 'The', 'Carmen', 'Diego']
  );

  const [ana, beto, teacher, carmen, diego] = results;

  assert.ok(ana.code, 'a new account comes back with its code');
  assert.equal(ana.enrolment, 'enrolled');

  assert.equal(beto.code, null, 'no code is invented for an account that existed');
  assert.equal(beto.enrolment, 'enrolled');

  assert.equal(teacher.code, null);
  assert.equal(teacher.enrolment, null);

  assert.equal(diego.code, null);
  assert.equal(diego.outcome, 'failed');

  // THE ROW THIS FEATURE LIVES OR DIES ON. Created, code in hand, not in the
  // class. student-provision.ts:153-157 returns the code anyway on purpose,
  // because the password is already unrecoverable and withholding it would
  // leave a student who can never sign in at all.
  assert.equal(carmen.outcome, 'created');
  assert.ok(carmen.code, 'the code still comes back when the enrolment failed');
  assert.equal(carmen.enrolment, 'failed');
});

test('the results table cannot render code-but-not-enrolled as a success', async () => {
  const results = await runBatch(batchFixture(), BATCH_ROWS);
  const [ana, , , carmen] = results;

  const good = rowPresentation(ana);
  const stranded = rowPresentation(carmen);

  // Both minted an account, so the account column agrees. Everything that says
  // whether the student is actually in the class must disagree.
  assert.equal(good.account, stranded.account, 'both are new accounts');
  assert.ok(good.code, 'the enrolled student has a code');
  assert.ok(stranded.code, 'so does the stranded one, and that is the trap');

  assert.equal(good.inClass, 'yes');
  assert.equal(stranded.inClass, 'no');
  assert.notEqual(good.inClassLabel, stranded.inClassLabel);
  assert.equal(good.warn, false);
  assert.equal(stranded.warn, true, 'the disagreeing row must carry the row-level warning');
  assert.notEqual(good.tone, stranded.tone, 'and must not be coloured like a success');

  // Said in full on the row itself, so the table does not rely on a legend or
  // on the teacher noticing a colour.
  assert.equal(good.note, '');
  assert.match(stranded.note, /NOT in your class/);
  assert.match(stranded.note, /add them again/i);
});

test('an enrolment the trigger already made is not a warning', () => {
  // "already-enrolled" is the 23505 conflict resolved to success
  // (class-enrol.ts:54-59). A teacher who invited the student first hits this on
  // every row, and flagging it would cry wolf across a whole class.
  for (const enrolment of ['enrolled', 'reactivated', 'already-enrolled']) {
    const p = rowPresentation({
      first_name: 'Ana', last_name: 'Reyes', email: 'ana@district.edu',
      outcome: 'created', code: 'ABC123DEF456', enrolment, error: null,
    });
    assert.equal(p.inClass, 'yes', `${enrolment} means the student is in the class`);
    assert.equal(p.warn, false);
  }
});

test('an existing account that failed to enrol is reported, but is not a warn row', () => {
  // Nothing here is unrecoverable: no code was minted, so re-running the add
  // costs nothing. The warn treatment is reserved for the row where a code
  // exists and cannot be got back.
  const p = rowPresentation({
    first_name: 'Beto', last_name: 'Cruz', email: 'beto@district.edu',
    outcome: 'existing', code: null, enrolment: 'failed', error: null,
  });
  assert.equal(p.inClass, 'no');
  assert.equal(p.warn, false);
  assert.equal(p.tone, 'bad');
  assert.match(p.note, /Add them again/i);
});

// ─── 4. The CSV ──────────────────────────────────────────────────────────────

test('the CSV carries the code and the status of every row, in order', async () => {
  const results = await runBatch(batchFixture(), BATCH_ROWS);
  const csv = buildRosterCsv(results);
  const lines = csv.split('\r\n');

  assert.equal(lines[0], '﻿first_name,last_name,email,code,status', 'header, BOM included');
  assert.equal(lines.length, results.length + 2, 'one line per row, plus header and trailing CRLF');

  const [ana, , , carmen] = results;
  assert.ok(csv.includes(`Ana,Reyes,ana@district.edu,${ana.code},created`));

  // THE STATUS WORD CARRIES THE WARNING INTO THE FILE. The CSV outlives the
  // modal: it is what gets kept and printed. A row exported as plain "created"
  // when the student is not in the class moves the silent failure into the
  // artifact that is still being read next week.
  assert.ok(csv.includes(`Carmen,Diaz,carmen@district.edu,${carmen.code},created_not_in_class`));
  assert.equal(csvStatus(carmen), 'created_not_in_class');
  assert.equal(csvStatus(ana), 'created');
  assert.ok(csv.includes('Beto,Cruz,beto@district.edu,,existing'), 'no code, and the field is empty');
  assert.ok(csv.includes('Diego,Mora,diego@district.edu,,failed'));
  assert.ok(csv.includes('teacher@district.edu,,own_account'));
});

test('a pasted name cannot become a spreadsheet formula', () => {
  // The existing exports read names out of the database. This one reads them
  // out of a textarea, which is a much shorter path from somebody else's typing
  // to a cell that executes when the file is opened in Excel.
  const csv = buildRosterCsv([
    {
      first_name: '=cmd|\' /c calc\'!A0', last_name: '+SUM(1)', email: 'x@district.edu',
      outcome: 'created', code: 'ABC123DEF456', enrolment: 'enrolled', error: null,
    },
  ]);
  assert.ok(!/\n=cmd/.test(csv) && !csv.includes('﻿=cmd'), 'no cell may start with =');
  assert.ok(csv.includes("'=cmd"), 'the formula lead is neutralised with an apostrophe');
  assert.ok(csv.includes("'+SUM(1)"));
});

test('the filename is dated so two downloads do not collide silently', () => {
  assert.equal(rosterCsvFilename(new Date('2026-09-02T15:04:05Z')), 'roster-codes-2026-09-02.csv');
  assert.match(rosterCsvFilename(), /^roster-codes-\d{4}-\d{2}-\d{2}\.csv$/);
});

// ─── 5. safeLimit stayed additive ────────────────────────────────────────────
//
// This build widened a helper that fourteen call sites already depended on, so
// "the existing callers are unchanged" has to be a proof rather than a claim.

function fakeLimiter() {
  const calls: unknown[][] = [];
  const limiter = {
    limit: async (...args: unknown[]) => {
      calls.push(args);
      return { success: true, reset: 0 };
    },
  };
  return { limiter, calls };
}

test('a caller that passes no cost reaches limit() with exactly one argument', async () => {
  const { limiter, calls } = fakeLimiter();
  await safeLimit(limiter as never, 'teacher-1');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].length, 1, 'no options object may be introduced behind an existing caller');
  assert.equal(calls[0][0], 'teacher-1');
});

test('an explicit cost of 1 is also the untouched call', async () => {
  const { limiter, calls } = fakeLimiter();
  await safeLimit(limiter as never, 'teacher-1', 1);
  assert.equal(calls[0].length, 1);
});

test('a cost above 1 spends that many tokens', async () => {
  const { limiter, calls } = fakeLimiter();
  await safeLimit(limiter as never, 'teacher-1', 35);
  assert.equal(calls[0].length, 2);
  assert.deepEqual(calls[0][1], { rate: 35 });
});

test('a cost still fails open when Upstash is unreachable', async () => {
  const exploding = { limit: async () => { throw new Error('ECONNREFUSED'); } };
  const r = await safeLimit(exploding as never, 'teacher-1', 35);
  assert.equal(r.success, true, 'rate limiting is auxiliary; a Redis outage must not 500 a mint');
});

/**
 * Comments stripped before scanning, and this is not fussiness.
 *
 * The first version of the scan below counted `safeLimit()` inside rate-limit.ts's
 * own header comment as a call site with zero arguments, which is the same
 * failure mode student-provision.test.ts:370-374 records: a source assertion
 * that matches the prose rather than the code. The `sites.length >= 14` check
 * keeps this honest in the other direction, since a stripper that ate too much
 * would take real call sites with it.
 */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

// Every safeLimit call in the app, found by walking the tree rather than by a
// list somebody has to remember to update.
function safeLimitCallSites(): { file: string; args: number }[] {
  const found: { file: string; args: number }[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!/\.tsx?$/.test(entry.name)) continue;
      const src = stripComments(readFileSync(full, 'utf8'));
      let i = src.indexOf('safeLimit(');
      while (i !== -1) {
        // Skip the declaration itself.
        if (!/export async function\s*$/.test(src.slice(Math.max(0, i - 30), i))) {
          let depth = 0;
          let j = i + 'safeLimit'.length;
          const start = j + 1;
          for (; j < src.length; j++) {
            if (src[j] === '(') depth++;
            else if (src[j] === ')') { depth--; if (depth === 0) break; }
          }
          const inner = src.slice(start, j);
          // Count top-level commas only, so Math.max(1, chargeable) is one arg.
          let d = 0;
          let args = inner.trim() ? 1 : 0;
          for (const ch of inner) {
            if (ch === '(' || ch === '[' || ch === '{') d++;
            else if (ch === ')' || ch === ']' || ch === '}') d--;
            else if (ch === ',' && d === 0) args++;
          }
          found.push({ file: full, args });
        }
        i = src.indexOf('safeLimit(', i + 1);
      }
    }
  };
  walk('app');
  return found;
}

test('only the bulk route passes a cost; every other call site is two arguments', () => {
  const sites = safeLimitCallSites();
  assert.ok(sites.length >= 14, `expected the known call sites, found ${sites.length}`);

  const withCost = sites.filter((s) => s.args > 2);
  assert.equal(withCost.length, 1, 'exactly one call spends more than one token');
  assert.match(withCost[0].file, /provision\/bulk\/route\.ts$/);

  for (const site of sites.filter((s) => s.args <= 2)) {
    assert.equal(site.args, 2, `${site.file} should still call safeLimit(limiter, id)`);
  }
});

// ─── 6. The route's gates ────────────────────────────────────────────────────
//
// Source assertions, in the style of student-provision.test.ts:375-403 and for
// the reason recorded there: the first spelling of a limiter check stayed green
// when the whole gate was deleted, because the unused import still carried the
// word. Each assertion below was proved to go red against a faulted route.

const ROUTE = readFileSync(new URL('../app/api/teacher/provision/bulk/route.ts', import.meta.url), 'utf8');

test('the bulk route is gated exactly like the single-add route', () => {
  assert.match(ROUTE, /await requireTeacher\(\)/, 'must be behind requireTeacher');
  assert.match(ROUTE, /\.eq\("teacher_id", profile\.id\)/, 'must verify class ownership');
  assert.match(ROUTE, /status: 404/, 'a class the teacher does not own is not found');
  assert.doesNotMatch(ROUTE, /listUsers/, 'use findUserByEmail, not the unpaginated listUsers');
  assert.doesNotMatch(ROUTE, /profileGrants/, 'adding a student is not a Pro-only export');
});

test('the bulk route charges its OWN limiter, per student', () => {
  assert.doesNotMatch(
    ROUTE,
    /safeLimit\(\s*provisionRateLimit/,
    'the 40/hour single-add limiter must not be reused; one class would exhaust it'
  );
  assert.match(
    ROUTE,
    /safeLimit\(\s*bulkProvisionRateLimit,\s*profile\.id,\s*Math\.max\(1, chargeable\)\s*\)/s,
    'must charge the bulk limiter, keyed on the teacher, one token per student'
  );
  assert.match(ROUTE, /status: 429/, 'must refuse when the limiter says no');
});

test('a row can never sink the batch', () => {
  // own-account is a 400 and a failed mint is a 500 on the single-add route
  // (provision/route.ts:80-89). Either one in the middle of a paste would throw
  // away the codes of every row that had already succeeded.
  assert.doesNotMatch(ROUTE, /status: 500/, 'no row-level failure may become a 5xx');
  assert.match(ROUTE, /outcome: r\.outcome/, 'outcomes are reported as data');

  // The per-row try/catch. An unexpected throw from provisionStudent would
  // otherwise escape the loop and discard every code minted before it.
  assert.match(
    ROUTE,
    /try \{[\s\S]{0,400}?await provisionStudent\(admin[\s\S]{0,600}?\} catch/,
    'every provisionStudent call must be wrapped'
  );
});

test('the route reports not-enrolled from the enrolment, not from the outcome word', () => {
  assert.match(
    ROUTE,
    /created_not_enrolled:[\s\S]{0,80}enrolment === "failed"/,
    'the count that matters must read the enrolment field'
  );
});

test('the route states its own duration ceiling', () => {
  // Nothing else in the repo sets one. A request killed mid-loop has already
  // minted accounts whose codes no longer exist anywhere.
  assert.match(ROUTE, /export const maxDuration = 300/);
});

// ─── 7. The modal's guards ───────────────────────────────────────────────────

const MODAL = readFileSync(new URL('../app/components/ModalShell.tsx', import.meta.url), 'utf8');
const DASHBOARD = readFileSync(
  new URL('../app/teacher/TeacherDashboardClient.tsx', import.meta.url),
  'utf8'
);

test('lockDismiss removes both casual exits, not just one', () => {
  assert.match(MODAL, /onClick=\{lockDismiss \? undefined : onClose\}/, 'the backdrop stops closing');
  assert.match(MODAL, /\{!lockDismiss && \([\s\S]{0,200}aria-label="Close"/, 'and the X goes with it');
});

test('both provisioning doors raise the dismiss lock, single-add included', () => {
  // One code is as unrecoverable as thirty. The single-add panel has carried
  // this hazard since #254.
  assert.match(DASHBOARD, /if \(data\.code\) onHoldOpen\(true\)/, 'single-add locks once a code is shown');
  assert.match(DASHBOARD, /onHoldOpen\(\(data\.summary\?\.created \?\? 0\) > 0\)/, 'bulk locks only if codes came back');
  assert.match(DASHBOARD, /lockDismiss=\{holdOpen\}/);
});

test('the unload warning is armed for the mint window and nothing else', () => {
  // In flight only. A prompt that also fired on a finished-but-not-downloaded
  // state is one teachers learn to click through, which spends the warning
  // exactly where it still matters.
  assert.match(
    DASHBOARD,
    /if \(status !== 'loading'\) return;[\s\S]{0,200}addEventListener\('beforeunload'/,
    'beforeunload must be gated on the in-flight state'
  );
  assert.match(DASHBOARD, /removeEventListener\('beforeunload', warn\)/, 'and torn down after');
});

test('the paste survives a stray tab click', () => {
  // Hoisted into InviteModal: switching tabs unmounts the panel that is not
  // showing, which would cost a whole typed-out class.
  assert.match(DASHBOARD, /const \[paste, setPaste\] = useState\(''\)/);
  assert.match(DASHBOARD, /paste=\{paste\}\s*\n\s*onPaste=\{setPaste\}/);
});

test('the Add button is gated on the preview, not on the row count alone', () => {
  assert.match(
    DASHBOARD,
    /const canAdd = parse\.readyCount > 0 && parse\.problemCount === 0 && !overCap/,
    'a paste with any bad line cannot be minted'
  );
  assert.match(DASHBOARD, /disabled=\{!canAdd \|\| status === 'loading'\}/);
});
