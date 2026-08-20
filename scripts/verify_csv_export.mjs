// verify_csv_export.mjs -- prove the teacher CSV exports are correct, and prove
// the authorisation on them can actually fail.
//
//   node scripts/seed_export_fixture.mjs      first
//   node scripts/verify_csv_export.mjs        this
//   node scripts/teardown_export_fixture.mjs  after
//
// Runs against `next build && next start`, never `next dev`.
//
// HOW IT SIGNS IN
//
// This project is Google OAuth only, so there is no password to post and no
// way for a harness to sign in the way verify_auth_gate.mjs describes. The way
// through is an admin-generated magic link pointed at the app's own
// /auth/callback, opened in a real browser. That exercises the real session
// flow and sets the real cookies, rather than hand-assembling an @supabase/ssr
// cookie and hoping the format matches.
//
// If the Supabase project does not allow-list http://localhost:3100/auth/callback
// as a redirect URL, the sign-in lands on an error page and this script says so
// explicitly rather than reporting a mysterious 403.
//
// WHAT COUNTS AS PROOF
//
// A 200 is not evidence a CSV is correct. Every download here is parsed back
// with a from-the-RFC parser, and the assertions are about the CONTENT: the row
// count against what the dashboard's own roster API reports for the same class,
// the column count on every single row, the BOM, the accented names, and the
// email column appearing if and only if it was asked for.
//
// The authorisation cases are the reason the fixture exists. Each is asserted
// to be 403, and the control below asserts the same request succeeds when made
// by the teacher who actually owns the class. Without the control, a server
// that 403s everything would pass.
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const OUT = 'scratchpad/csv-export-verification';
const EMAIL_DOMAIN = 'csv-export-fixture.example.com';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

let pass = 0;
let fail = 0;
const failures = [];

function check(label, ok, detail = '') {
  if (ok) {
    pass++;
    console.log(`  PASS  ${label}${detail ? `  (${detail})` : ''}`);
  } else {
    fail++;
    failures.push(label);
    console.log(`  FAIL  ${label}${detail ? `  (${detail})` : ''}`);
  }
}

// ─── A CSV parser written to the RFC, not to our writer ─────────────────────
function parseCsv(text) {
  const body = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (quoted) {
      if (c === '"') {
        if (body[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\r' && body[i + 1] === '\n') {
      row.push(field); field = ''; rows.push(row); row = []; i++;
    } else field += c;
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  // ─── Locate the fixture ───────────────────────────────────────────────────
  const { data: classes } = await db
    .from('classes')
    .select('id, name, teacher_id')
    .like('name', 'ZZ CSV Export Fixture%')
    .order('name', { ascending: true });

  if (!classes || classes.length < 3) {
    console.error('Fixture not found. Run: node scripts/seed_export_fixture.mjs');
    process.exit(1);
  }
  const A1 = classes.find((c) => c.name.endsWith('A1'));
  const A2 = classes.find((c) => c.name.includes('A2'));
  const B1 = classes.find((c) => c.name.endsWith('B1'));
  const teacherA = A1.teacher_id;
  const teacherB = B1.teacher_id;
  console.log(`Fixture: A1=${A1.id} A2=${A2.id} B1=${B1.id}`);
  console.log(`         teacherA=${teacherA} teacherB=${teacherB}\n`);

  // ─── Build and start ──────────────────────────────────────────────────────
  console.log('Building.');
  execSync('npx next build', { stdio: 'inherit' });
  console.log('Starting on', BASE);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const stop = () => { try { process.kill(-server.pid); } catch { try { server.kill('SIGKILL'); } catch {} } };
  process.on('exit', stop);

  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server did not start in 60s')), 60000);
    server.stdout.on('data', (d) => {
      if (d.toString().includes('Ready') || d.toString().includes('started server')) {
        clearTimeout(t); resolve();
      }
    });
  });
  await new Promise((r) => setTimeout(r, 1500));

  const browser = await chromium.launch();

  /** Open a magic link in a fresh browser context. Returns that context. */
  async function signIn(emailAddr) {
    const { data, error } = await db.auth.admin.generateLink({
      type: 'magiclink',
      email: emailAddr,
      options: { redirectTo: `${BASE}/auth/callback` },
    });
    if (error) throw new Error(`generateLink failed for ${emailAddr}: ${error.message}`);

    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(data.properties.action_link, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    return { ctx, landedOn: page.url() };
  }

  /** GET a URL inside a context, returning status + body + headers. */
  async function get(ctx, path) {
    const res = await ctx.request.get(`${BASE}${path}`);
    return {
      status: res.status(),
      body: await res.text(),
      headers: res.headers(),
    };
  }

  try {
    // ─── 1. Signed out ────────────────────────────────────────────────────
    console.log('\n1. Signed out');
    const anon = await browser.newContext();
    for (const kind of ['roster', 'scores']) {
      const r = await get(anon, `/api/teacher/export/${kind}?classes=${A1.id}`);
      check(`signed out is refused ${kind}`, r.status === 403, `HTTP ${r.status}`);
    }
    await anon.close();

    // ─── 2. Sign in ───────────────────────────────────────────────────────
    console.log('\n2. Sessions');
    const a = await signIn(`teacher-a@${EMAIL_DOMAIN}`);
    const student = await signIn(`ana@${EMAIL_DOMAIN}`);
    if (a.landedOn.includes('error') || a.landedOn.includes('/login')) {
      console.error(`\n  Sign-in landed on ${a.landedOn}`);
      console.error(`  Add ${BASE}/auth/callback to Supabase Auth > URL Configuration > Redirect URLs.`);
      process.exit(1);
    }
    check('teacher A has a session', !a.landedOn.includes('/login'), a.landedOn);

    // ─── 3. The control: the owner CAN read their own class ───────────────
    console.log('\n3. Control (must succeed, or every refusal below is meaningless)');
    const ok = await get(a.ctx, `/api/teacher/export/roster?classes=${A1.id}`);
    check('owner gets 200 for their own class', ok.status === 200, `HTTP ${ok.status}`);
    check(
      'response is a CSV attachment',
      (ok.headers['content-type'] ?? '').includes('text/csv') &&
        (ok.headers['content-disposition'] ?? '').includes('attachment'),
      ok.headers['content-disposition'] ?? ''
    );

    // ─── 4. Authorisation failures ────────────────────────────────────────
    console.log('\n4. Authorisation (each must be 403)');
    const nonTeacher = await get(student.ctx, `/api/teacher/export/roster?classes=${A1.id}`);
    check('a student account is refused', nonTeacher.status === 403, `HTTP ${nonTeacher.status}`);

    const otherClass = await get(a.ctx, `/api/teacher/export/roster?classes=${B1.id}`);
    check("teacher A is refused teacher B's class", otherClass.status === 403, `HTTP ${otherClass.status}`);

    // The multi-select bug: one owned id, one not. A route that validates only
    // the first element returns 200 here and leaks B1.
    const mixed = await get(a.ctx, `/api/teacher/export/roster?classes=${A1.id},${B1.id}`);
    check('a mixed array is refused, not silently narrowed', mixed.status === 403, `HTTP ${mixed.status}`);
    if (mixed.status === 200) {
      check('mixed array did not leak class B rows', !mixed.body.includes('B1'), 'LEAKED');
    }

    // Reversed order, in case the check only looks at the last element.
    const mixedRev = await get(a.ctx, `/api/teacher/export/scores?classes=${B1.id},${A1.id}`);
    check('reversed mixed array is also refused', mixedRev.status === 403, `HTTP ${mixedRev.status}`);

    const bogus = await get(a.ctx, `/api/teacher/export/roster?classes=not-a-uuid`);
    check('malformed class id is a 400', bogus.status === 400, `HTTP ${bogus.status}`);

    // ─── 5. Row counts against the dashboard ──────────────────────────────
    console.log('\n5. Row counts against what the dashboard shows');
    const dash = await get(a.ctx, `/api/teacher/roster?class_id=${A1.id}`);
    const dashRoster = JSON.parse(dash.body).roster;

    const rosterCsv = await get(a.ctx, `/api/teacher/export/roster?classes=${A1.id}`);
    writeFileSync(`${OUT}/roster-A1.csv`, rosterCsv.body);
    const rosterRows = parseCsv(rosterCsv.body);
    const rosterHeader = rosterRows[0];
    const rosterData = rosterRows.slice(1);

    check(
      'roster row count equals the dashboard roster length',
      rosterData.length === dashRoster.length,
      `csv ${rosterData.length} vs dashboard ${dashRoster.length}`
    );

    check(
      'every roster row has exactly as many fields as the header',
      rosterData.every((r) => r.length === rosterHeader.length),
      `header ${rosterHeader.length}`
    );

    // tests_taken must equal the dashboard's attempt_count, per student.
    const nameIdx = rosterHeader.indexOf('student_name');
    const testsIdx = rosterHeader.indexOf('tests_taken');
    const diagIdx = rosterHeader.indexOf('diagnostic_sessions');
    const pracIdx = rosterHeader.indexOf('practice_sessions');
    let attemptsMatch = true;
    let splitAddsUp = true;
    for (const row of rosterData) {
      const dashRow = dashRoster.find((d) => d.name === row[nameIdx]);
      if (!dashRow || String(dashRow.attempt_count) !== row[testsIdx]) attemptsMatch = false;
      if (Number(row[diagIdx]) + Number(row[pracIdx]) !== Number(row[testsIdx])) splitAddsUp = false;
    }
    check('tests_taken matches the dashboard attempt_count for every student', attemptsMatch);
    check('diagnostic + practice equals tests_taken', splitAddsUp);

    const scoresCsv = await get(a.ctx, `/api/teacher/export/scores?classes=${A1.id}`);
    writeFileSync(`${OUT}/scores-A1.csv`, scoresCsv.body);
    const scoreRows = parseCsv(scoresCsv.body);
    const expectedSessions = dashRoster.reduce((n, d) => n + d.attempt_count, 0);
    check(
      'scores row count equals total sessions across the class',
      scoreRows.length - 1 === expectedSessions,
      `csv ${scoreRows.length - 1} vs ${expectedSessions}`
    );
    check(
      'every scores row has exactly as many fields as the header',
      scoreRows.slice(1).every((r) => r.length === scoreRows[0].length)
    );

    // ─── 6. Encoding and escaping, end to end ─────────────────────────────
    console.log('\n6. Encoding and escaping through the real pipeline');
    check('roster file starts with a UTF-8 BOM', rosterCsv.body.charCodeAt(0) === 0xfeff);
    check('scores file starts with a UTF-8 BOM', scoresCsv.body.charCodeAt(0) === 0xfeff);

    const names = rosterData.map((r) => r[nameIdx]);
    check('accented name round-trips', names.includes('Ana Peña'), names.join(' | '));
    check('accented name with a different accent round-trips', names.includes('José Martínez'));
    check("apostrophe name is intact", names.includes("Renée O'Connor"));

    // The one that matters most: a display name beginning with "+" and
    // containing a comma. It must be neutralised AND still be one field.
    const mateo = names.find((n) => n.includes('Mateo'));
    check('formula-leading name is neutralised', mateo === "'+Mateo, Jr.", JSON.stringify(mateo));
    check('formula-leading name did not add a column', rosterData.every((r) => r.length === rosterHeader.length));

    // ─── 7. The email checkbox ────────────────────────────────────────────
    console.log('\n7. The email column is controlled by the flag');
    const noEmail = await get(a.ctx, `/api/teacher/export/roster?classes=${A1.id}&email=0`);
    const withEmail = await get(a.ctx, `/api/teacher/export/roster?classes=${A1.id}&email=1`);
    writeFileSync(`${OUT}/roster-A1-email.csv`, withEmail.body);

    const hNo = parseCsv(noEmail.body)[0];
    const hYes = parseCsv(withEmail.body)[0];
    check('email=0 has no student_email column', !hNo.includes('student_email'), hNo.join(','));
    check('email=1 has a student_email column', hYes.includes('student_email'));
    check('email=1 adds exactly one column', hYes.length === hNo.length + 1, `${hNo.length} -> ${hYes.length}`);
    check(
      'the no-email file contains no fixture address anywhere',
      !noEmail.body.includes(EMAIL_DOMAIN),
      'scanned whole body'
    );
    check('the with-email file does contain them', withEmail.body.includes(EMAIL_DOMAIN));

    // Default must be off.
    const defaulted = await get(a.ctx, `/api/teacher/export/roster?classes=${A1.id}`);
    check('omitting the flag defaults to no email', !defaulted.body.includes(EMAIL_DOMAIN));

    // ─── 8. No answer-bearing data ────────────────────────────────────────
    console.log('\n8. Nothing answer-bearing leaks into the files');
    const forbidden = ['correct_answer', 'explanation', 'distractor_logic', 'answer_choices', 'question_text'];
    const bodies = [rosterCsv.body, scoresCsv.body, withEmail.body];
    for (const key of forbidden) {
      check(`no "${key}" anywhere in the exports`, bodies.every((b) => !b.includes(key)));
    }

    // ─── 9. Multi-class and all-classes ───────────────────────────────────
    console.log('\n9. Multi-class scope');
    const both = await get(a.ctx, `/api/teacher/export/roster?classes=${A1.id},${A2.id}`);
    check('two owned classes succeed', both.status === 200, `HTTP ${both.status}`);
    const bothRows = parseCsv(both.body).slice(1);
    check(
      'two-class roster is the sum of both enrolments',
      bothRows.length === rosterData.length + parseCsv((await get(a.ctx, `/api/teacher/export/roster?classes=${A2.id}`)).body).slice(1).length,
      `${bothRows.length} rows`
    );
    const classIdx = parseCsv(both.body)[0].indexOf('class_name');
    check('both class names appear', new Set(bothRows.map((r) => r[classIdx])).size === 2);
    check(
      'a class name containing a comma stayed one field',
      bothRows.some((r) => r[classIdx].includes('A2, Period 3')),
      'A2 is named "ZZ CSV Export Fixture A2, Period 3"'
    );

    const all = await get(a.ctx, `/api/teacher/export/roster?classes=all`);
    check('all-classes succeeds', all.status === 200, `HTTP ${all.status}`);
    check(
      'all-classes contains no class belonging to teacher B',
      !all.body.includes('Fixture B1'),
      'scanned whole body'
    );

    // ─── 10. Audit log ────────────────────────────────────────────────────
    console.log('\n10. The audit row records the column set, not merely the event');
    const { data: audits } = await db
      .from('audit_log')
      .select('action, table_name, metadata, user_id')
      .eq('action', 'teacher_export')
      .eq('user_id', teacherA)
      .order('created_at', { ascending: false })
      .limit(20);

    check('an audit row was written', (audits?.length ?? 0) > 0, `${audits?.length ?? 0} rows`);
    const withEmailAudit = (audits ?? []).find((r) => r.metadata?.include_email === true);
    const withoutEmailAudit = (audits ?? []).find((r) => r.metadata?.include_email === false);
    check('the email choice is recorded both ways', Boolean(withEmailAudit) && Boolean(withoutEmailAudit));
    check('the column set is recorded', Array.isArray(withEmailAudit?.metadata?.columns) && withEmailAudit.metadata.columns.includes('student_email'));
    check('the class selection is recorded', Array.isArray(withoutEmailAudit?.metadata?.class_ids));
    check('the row count is recorded', typeof withoutEmailAudit?.metadata?.row_count === 'number');
    check('the export type is recorded', typeof withoutEmailAudit?.metadata?.export_type === 'string');

    // A refused request must NOT have written an audit row claiming success.
    const leaked = (audits ?? []).some((r) => (r.metadata?.class_ids ?? []).includes(B1.id));
    check("no audit row claims teacher A exported teacher B's class", !leaked);

    await a.ctx.close();
    await student.ctx.close();
  } finally {
    await browser.close();
    stop();
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`PASS ${pass}   FAIL ${fail}`);
  if (fail > 0) {
    console.log('\nFailures:');
    for (const f of failures) console.log(`  - ${f}`);
  }
  console.log(`Downloaded files in ${OUT}/`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
