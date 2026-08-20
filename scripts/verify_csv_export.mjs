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
// This project is Google OAuth only, so there is no password to post and no way
// for a harness to sign in the way verify_auth_gate.mjs describes.
//
// The first attempt at this walked an admin-generated magic link through the
// app's own /auth/callback in a browser. That does not work, and the reason is
// worth recording: admin.generateLink returns an IMPLICIT-flow link, which
// lands on the redirect URL with the tokens in the fragment
// (#access_token=...&type=magiclink), while /auth/callback is written for the
// PKCE flow and looks for ?code=. The callback finds no code and redirects to
// /login?error=auth_failed. Nothing is misconfigured; the two halves are simply
// different flows.
//
// So the session is minted directly instead:
//
//   1. admin.generateLink  -> properties.hashed_token
//   2. anon verifyOtp      -> a real access_token / refresh_token pair
//   3. @supabase/ssr setSession, with a cookie jar in place of a response, to
//      get the EXACT cookie the app will read
//
// Step 3 matters. The cookie is base64-encoded JSON under a project-scoped name
// and @supabase/ssr chunks it past a size threshold, so hand-assembling it
// would be testing our guess at the format. Letting the library serialise it
// means the harness proves the gate rather than the encoding.
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
import { createServerClient } from '@supabase/ssr';
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
  // Refuse to run against a server this script did not start. A leftover
  // `next start` on this port would be serving an OLDER build, and every check
  // below would pass or fail against code that is not the code under test.
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(2000) });
    console.error(`\nSomething is already listening on ${BASE}.`);
    console.error('That would test a stale build. Stop it and re-run:');
    console.error(`  ss -ltnp | grep ${PORT}`);
    process.exit(1);
  } catch {
    // Nothing listening, which is what we want.
  }

  console.log('Starting on', BASE);
  // detached so the whole process group can be killed. `npx next start` spawns
  // a grandchild that actually binds the port, and killing only the direct
  // child leaves that grandchild holding it -- which is exactly how the first
  // run of this script orphaned a server and made the second run time out.
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  const stop = () => {
    try { process.kill(-server.pid, 'SIGKILL'); } catch { /* group already gone */ }
    try { server.kill('SIGKILL'); } catch { /* child already gone */ }
  };
  process.on('exit', stop);

  // Poll the port rather than matching a phrase on stdout. The readiness banner
  // is Next's to change; a socket that answers is not.
  const deadline = Date.now() + 90000;
  for (;;) {
    if (Date.now() > deadline) {
      stop();
      throw new Error('server did not answer on ' + BASE + ' within 90s');
    }
    try {
      await fetch(BASE, { signal: AbortSignal.timeout(2000) });
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const browser = await chromium.launch();

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  /** A browser context already holding a real session for this account. */
  async function signIn(emailAddr) {
    const { data: link, error: linkErr } = await db.auth.admin.generateLink({
      type: 'magiclink',
      email: emailAddr,
    });
    if (linkErr) throw new Error(`generateLink failed for ${emailAddr}: ${linkErr.message}`);

    const { data: verified, error: otpErr } = await anonClient.auth.verifyOtp({
      type: 'magiclink',
      token_hash: link.properties.hashed_token,
    });
    if (otpErr) throw new Error(`verifyOtp failed for ${emailAddr}: ${otpErr.message}`);

    // Serialise through the library the app reads with, not by hand.
    const jar = [];
    const ssr = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll: () => [], setAll: (list) => jar.push(...list) } }
    );
    await ssr.auth.setSession({
      access_token: verified.session.access_token,
      refresh_token: verified.session.refresh_token,
    });
    if (jar.length === 0) throw new Error(`no session cookie produced for ${emailAddr}`);

    const ctx = await browser.newContext();
    await ctx.addCookies(
      jar.map((c) => ({
        name: c.name,
        value: c.value,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      }))
    );
    return { ctx, userId: verified.user.id, cookieCount: jar.length };
  }

  /** GET a URL inside a context, returning status + body + headers. */
  //
  // A 429 aborts the whole run rather than being folded into a check. The
  // export routes are rate limited at 20 per 10 minutes per teacher, and when
  // that fires every subsequent response is a JSON error body: the parser then
  // reports a one-column CSV and a dozen unrelated checks fail for a reason
  // that has nothing to do with what they test. Failing loudly here is the
  // difference between "the limiter fired" and half an hour spent debugging
  // the wrong thing.
  async function get(ctx, path) {
    const res = await ctx.request.get(`${BASE}${path}`);

    // Aborts HERE, on the request that saw it, not at the next section
    // boundary. The first version of this set a flag and checked it between
    // sections, which is not good enough and was caught being not good enough
    // twice: a 429 landing mid-section still let every remaining check in that
    // section run against JSON error bodies and report failures that had
    // nothing to do with what they test.
    if (res.status() === 429) {
      console.error(`\n  HTTP 429 on ${path}`);
      console.error('  The export rate limit fired: 20 per 10 minutes per teacher.');
      console.error('  This run makes 14 requests, so a single run fits, but two runs');
      console.error('  inside one window do not. Wait for the window to clear and');
      console.error('  re-run. Nothing below this point would have meant anything.');
      process.exit(1);
    }

    return {
      status: res.status(),
      body: await res.text(),
      headers: res.headers(),
    };
  }
  /** Retained as a no-op call site marker; get() now aborts on the spot. */
  function abortIfRateLimited() {}

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
    check('teacher A session minted', a.userId === teacherA, `${a.cookieCount} cookie(s)`);
    check('student session minted', Boolean(student.userId), `${student.cookieCount} cookie(s)`);

    // The session is only proven by a page that requires one. /teacher redirects
    // a signed-out visitor to /login, so a 200 here is the session working.
    const dashPage = await a.ctx.request.get(`${BASE}/teacher`);
    check('teacher A can load /teacher', dashPage.status() === 200, `HTTP ${dashPage.status()}`);

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

    abortIfRateLimited();
    // ─── 5. Row counts against the dashboard ──────────────────────────────
    console.log('\n5. Row counts against what the dashboard shows');
    const dash = await get(a.ctx, `/api/teacher/roster?class_id=${A1.id}`);
    const dashRoster = JSON.parse(dash.body).roster;

    // Reuses the control response rather than fetching the same file again.
    // Every redundant request eats the teacher's rate-limit budget, and this
    // harness previously spent it twice over on identical downloads.
    const rosterCsv = ok;
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
    //
    // Read from the A2 export, not A1. Mateo is enrolled in A2 and B1 only, so
    // asserting this against the A1 file searched a roster he was never on:
    // the "is neutralised" check failed with undefined, and the "did not add a
    // column" check beside it passed vacuously, which is the more dangerous of
    // the two. Assert against the file the name is actually in.
    const a2Csv = await get(a.ctx, `/api/teacher/export/roster?classes=${A2.id}`);
    writeFileSync(`${OUT}/roster-A2.csv`, a2Csv.body);
    const a2Rows = parseCsv(a2Csv.body);
    const a2Header = a2Rows[0];
    const a2Data = a2Rows.slice(1);
    const a2NameIdx = a2Header.indexOf('student_name');
    const a2Names = a2Data.map((r) => r[a2NameIdx]);

    check('the A2 roster really does contain the formula-leading name',
      a2Names.some((n) => n.includes('Mateo')), a2Names.join(' | '));

    const mateo = a2Names.find((n) => n.includes('Mateo'));
    check('formula-leading name is neutralised', mateo === "'+Mateo, Jr.", JSON.stringify(mateo));
    check('formula-leading name did not add a column',
      a2Data.every((r) => r.length === a2Header.length), `header ${a2Header.length}`);
    check('the neutralised field is quoted, because it contains a comma',
      a2Csv.body.includes('"\'+Mateo, Jr."'), 'raw bytes');

    abortIfRateLimited();
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

    // Default must be off. The control response at step 3 was fetched with no
    // email parameter at all, so it is the evidence for this, and re-fetching
    // it would only spend budget to learn the same thing.
    check('omitting the flag defaults to no email', !ok.body.includes(EMAIL_DOMAIN));

    // ─── 8. No answer-bearing data ────────────────────────────────────────
    console.log('\n8. Nothing answer-bearing leaks into the files');
    const forbidden = ['correct_answer', 'explanation', 'distractor_logic', 'answer_choices', 'question_text'];
    const bodies = [rosterCsv.body, scoresCsv.body, withEmail.body];
    // (the misconceptions file is scanned separately at 9b, after it is fetched)
    for (const key of forbidden) {
      check(`no "${key}" anywhere in the exports`, bodies.every((b) => !b.includes(key)));
    }

    abortIfRateLimited();
    // ─── 9. Multi-class and all-classes ───────────────────────────────────
    console.log('\n9. Multi-class scope');
    const both = await get(a.ctx, `/api/teacher/export/roster?classes=${A1.id},${A2.id}`);
    check('two owned classes succeed', both.status === 200, `HTTP ${both.status}`);
    const bothRows = parseCsv(both.body).slice(1);
    check(
      'two-class roster is the sum of both enrolments',
      bothRows.length === rosterData.length + a2Data.length,
      `${bothRows.length} = ${rosterData.length} + ${a2Data.length}`
    );
    const classIdx = parseCsv(both.body)[0].indexOf('class_name');
    check('both class names appear', new Set(bothRows.map((r) => r[classIdx])).size === 2);
    check(
      'a class name containing a comma stayed one field',
      bothRows.some((r) => r[classIdx].includes('A2, Period 3')),
      'A2 is named "ZZ CSV Export Fixture A2, Period 3"'
    );

    writeFileSync(`${OUT}/roster-A1-and-A2.csv`, both.body);

    const all = await get(a.ctx, `/api/teacher/export/roster?classes=all`);
    writeFileSync(`${OUT}/roster-all-classes.csv`, all.body);
    check('all-classes succeeds', all.status === 200, `HTTP ${all.status}`);
    check(
      'all-classes contains no class belonging to teacher B',
      !all.body.includes('Fixture B1'),
      'scanned whole body'
    );

    // ─── 9b. Misconceptions ───────────────────────────────────────────────
    abortIfRateLimited();
    console.log('\n9b. Misconceptions, against the grid it must agree with');

    const miscCsv = await get(a.ctx, `/api/teacher/export/misconceptions?classes=${A1.id}`);
    writeFileSync(`${OUT}/misconceptions-A1.csv`, miscCsv.body);
    check('misconceptions export succeeds', miscCsv.status === 200, `HTTP ${miscCsv.status}`);
    check(
      'the filename states the scope',
      (miscCsv.headers['content-disposition'] ?? '').includes('misconceptions-latest-session'),
      miscCsv.headers['content-disposition'] ?? ''
    );

    const miscRows = parseCsv(miscCsv.body);
    const miscHeader = miscRows[0];
    const miscData = miscRows.slice(1);
    check('the file is not empty', miscData.length > 0, `${miscData.length} rows`);
    check(
      'every misconception row has exactly as many fields as the header',
      miscData.every((r) => r.length === miscHeader.length),
      `header ${miscHeader.length}`
    );

    const mTag = miscHeader.indexOf('misconception_tag');
    const mLabel = miscHeader.indexOf('misconception_label');
    const mRaw = miscHeader.indexOf('misconception_label_raw');
    const mScope = miscHeader.indexOf('export_scope');
    const mName = miscHeader.indexOf('student_name');
    const mFreq = miscHeader.indexOf('times_selected');

    check(
      'every row carries the scope stamp',
      miscData.every((r) => r[mScope] === 'latest_session_cat_only'),
      'latest_session_cat_only'
    );

    // The label promise: every slug resolved, so no cell fell back to the slug.
    const unresolved = miscData.filter((r) => r[mLabel] === r[mTag]);
    check(
      'every slug resolved to a real definition, none fell back to the slug',
      unresolved.length === 0,
      unresolved.length ? unresolved.map((r) => r[mTag]).join(', ') : 'all resolved'
    );
    check(
      'labels carry no LaTeX',
      miscData.every((r) => !r[mLabel].includes('$') && !r[mLabel].includes('\\')),
      'scanned every label cell'
    );
    check(
      'the raw column is present and differs from the label',
      mRaw !== -1 && miscData.some((r) => r[mRaw] && r[mRaw] !== r[mLabel]),
      'raw is the representative distractor prose'
    );

    // THE CHECK THIS FILE EXISTS FOR: it must agree with the grid on screen.
    // The grid is class-level and top-10; this file is per student. Summing
    // times_selected per slug must reproduce the grid's frequency, and the
    // distinct student count must reproduce affected_students.
    const gridRes = await get(a.ctx, `/api/teacher/misconceptions?class_id=${A1.id}`);
    const grid = JSON.parse(gridRes.body).misconceptions ?? [];
    check('the dashboard grid returned data to compare against', grid.length > 0, `${grid.length} cards`);

    let freqMatches = true;
    let studentMatches = true;
    for (const card of grid) {
      const rowsForTag = miscData.filter((r) => r[mTag] === card.misconception_tag);
      const freq = rowsForTag.reduce((n, r) => n + Number(r[mFreq]), 0);
      const students = new Set(rowsForTag.map((r) => r[mName])).size;
      if (freq !== card.frequency) freqMatches = false;
      if (students !== card.affected_students) studentMatches = false;
    }
    check('times_selected sums to the grid frequency for every card', freqMatches);
    check('distinct students matches the grid affected_students for every card', studentMatches);

    check(
      'the file is a superset of the grid, which is only a top 10',
      new Set(miscData.map((r) => r[mTag])).size >= grid.length,
      `${new Set(miscData.map((r) => r[mTag])).size} slugs vs ${grid.length} cards`
    );

    // Untested students must be absent, not present with empty cells.
    check(
      'a student who has never tested has no rows',
      !miscData.some((r) => r[mName] === 'Noel Sin-Examen'),
      'Noel Sin-Examen has no sessions'
    );

    // ANSWER LEAK, the vector specific to this file. misconception_label_raw is
    // real distractor prose, which is approved, but the prose attached to the
    // CORRECT option in questions.distractor_logic states the answer.
    //
    // This was a string check matching a leading "Correct:". That was the wrong
    // shape of assertion: it depended on an authoring convention rather than on
    // the data, so a legitimate label beginning with that word would have
    // broken it, and a leak whose prose happened not to start that way would
    // have slipped through.
    //
    // The product exclusion is structural and does not involve prose at all.
    // aggregateMisconceptions reads only rows with is_correct = false, and
    // looks the label up as distractor_logic[selected_answer], which on such a
    // row can never be the correct option's letter. So the check is structural
    // too: trace each exported string back to the option it came from, and
    // assert that option is not the item's correct_answer.
    const mItem = miscHeader.indexOf('example_item_id');
    const exampleItems = [...new Set(miscData.map((r) => r[mItem]))];
    const { data: exampleRows, error: exampleErr } = await db
      .from('questions')
      .select('item_id, correct_answer, distractor_logic')
      .in('item_id', exampleItems);
    if (exampleErr) throw new Error(`could not read example items: ${exampleErr.message}`);
    const byItem = new Map((exampleRows ?? []).map((q) => [q.item_id, q]));

    let fromCorrectOption = 0;
    let untraceable = 0;
    for (const r of miscData) {
      const item = byItem.get(r[mItem]);
      if (!item) { untraceable++; continue; }
      const options = Object.entries(item.distractor_logic ?? {})
        .filter(([, text]) => text === r[mRaw])
        .map(([option]) => option);
      if (options.length === 0) untraceable++;
      else if (options.includes(item.correct_answer)) fromCorrectOption++;
    }

    check(
      'every exported label traces back to a WRONG option, structurally',
      fromCorrectOption === 0 && untraceable === 0,
      `${miscData.length - fromCorrectOption - untraceable}/${miscData.length} traced to a wrong option, ` +
        `${fromCorrectOption} to the correct option, ${untraceable} untraceable`
    );
    check(
      'the check had correct-option prose available to catch',
      new Set(
        (exampleRows ?? []).map((q) => (q.distractor_logic ?? {})[q.correct_answer]).filter(Boolean)
      ).size > 0,
      'otherwise the assertion above is vacuous'
    );
    for (const key of ['correct_answer', 'answer_choices', 'question_text']) {
      check(`no "${key}" in the misconceptions file`, !miscCsv.body.includes(key));
    }

    // Authorisation applies here too.
    const miscForbidden = await get(a.ctx, `/api/teacher/export/misconceptions?classes=${B1.id}`);
    check("misconceptions refuses another teacher's class", miscForbidden.status === 403, `HTTP ${miscForbidden.status}`);

    // Email flag applies here too.
    const miscEmail = await get(a.ctx, `/api/teacher/export/misconceptions?classes=${A1.id}&email=1`);
    check('misconceptions honours the email flag',
      parseCsv(miscEmail.body)[0].includes('student_email') && !miscHeader.includes('student_email'));
    check('the no-email misconceptions file leaks no address', !miscCsv.body.includes(EMAIL_DOMAIN));

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
