// verify_official_scores_gate.mjs -- prove the entitlement gate on
// /api/teacher/official-scores.
//
//   node scripts/seed_export_fixture.mjs
//   node scripts/verify_official_scores_gate.mjs
//   node scripts/teardown_export_fixture.mjs
//
// WHY THIS IS A SEPARATE SUITE FROM verify_export_tier_gate.mjs. That one
// proves a PRO boundary: Core is refused, Pro is admitted. This one proves a
// CORE boundary, which is the opposite polarity, and the two must not be merged
// or a future edit that flips the capability would satisfy one of them.
//
// WHY THE FIXTURE AND NOT REAL ACCOUNTS. Proving "a student is refused" needs a
// student account whose session we are allowed to mint. Every student-role
// profile in production belongs to a real, mostly school-age person, and
// minting a session for one to watch a 403 happen is not something a gate proof
// justifies. seed_export_fixture.mjs exists for exactly this reason and says so
// in its own header. Teacher B is flipped to teacher-core here for the duration
// of the run; the teardown deletes the account outright, so nothing persists.
//
// WHAT THE 403 FOR A STUDENT DOES AND DOES NOT PROVE, said out loud because
// getting this wrong is how a suite passes vacuously:
//
//   A student is refused by requireTeacher() on TWO independent conditions,
//   role !== 'teacher' AND the plan not granting 'teacher-dashboard'. The new
//   capability check never runs for them. So the student 403 is real, but it is
//   NOT evidence that the new gate works, and removing the new gate does not
//   move it.
//
//   What makes the new gate's own line load-bearing is section 4: a teacher who
//   holds teacher-dashboard but NOT official-scores must be refused, and must
//   stop being refused when the line is deleted. That is the fault pair that
//   actually proves this file's one new gate.
//
// The 200 controls matter as much as the refusals. A build where every request
// 403s would satisfy a refusal-only suite.
//
// THE MATRIX COVERS EVERY VERB, NOT JUST GET. Sections 1 to 4 below prove the
// capability gate and the tenancy boundary on the read path. That is not the
// same proof for the write path, and the difference is not cosmetic:
//
//   * GET takes its student and class from the QUERY STRING. POST takes them
//     from the BODY. PATCH and DELETE take neither -- they take a row id, and
//     the handler has to READ the row to find out which student and class the
//     request is really about before it can judge it. Three different ways of
//     deciding what is being asked for, so three different ways to get it
//     wrong, and a GET-only suite exercises one of them.
//
//   * The write path has a second boundary the read path does not have at all:
//     entered_by. Owning the class is not sufficient to CHANGE a row, because
//     the affirmation names one person.
//
// Sections 5 to 9 close that. Section 8 is the one worth reading: it proves the
// entered_by check by TRANSFERRING the class, because that is the only way the
// branch is reachable at all. See its own note.
import { spawn, execSync } from 'child_process';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { chromium } from 'playwright';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const PORT = 3111;
const BASE = `http://localhost:${PORT}`;
const FIXTURE_DOMAIN = 'csv-export-fixture.example.com';
const ROUTE = '/api/teacher/official-scores';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

let failures = 0;
function check(label, ok, detail = '') {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
}

async function main() {
  // ─── Fixture identity, verified rather than assumed ────────────────────────
  //
  // Every id below is looked up and its profile row is READ BACK before any
  // assertion runs. A suite that assumes "teacher-a is a teacher" and
  // "ana is a student" proves nothing the moment the seeder changes.
  const { data: users } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const fixture = (users?.users ?? []).filter((u) =>
    (u.email ?? '').endsWith(`@${FIXTURE_DOMAIN}`)
  );
  if (fixture.length === 0) {
    console.error('No fixture users. Run: node scripts/seed_export_fixture.mjs');
    process.exit(1);
  }
  const byEmail = new Map(fixture.map((u) => [u.email, u]));
  const teacherA = byEmail.get(`teacher-a@${FIXTURE_DOMAIN}`);
  const teacherB = byEmail.get(`teacher-b@${FIXTURE_DOMAIN}`);
  const student = byEmail.get(`ana@${FIXTURE_DOMAIN}`);
  if (!teacherA || !teacherB || !student) {
    console.error('Fixture is incomplete. Re-run the seeder.');
    process.exit(1);
  }

  // Teacher B becomes Core for this run. Deleted entirely by the teardown.
  const { error: coreErr } = await db
    .from('profiles')
    .update({ plan: 'teacher-core' })
    .eq('id', teacherB.id);
  if (coreErr) {
    console.error(`Could not make Teacher B core: ${coreErr.message}`);
    process.exit(1);
  }

  const { data: profiles } = await db
    .from('profiles')
    .select('id, email, role, plan, plan_status')
    .in('id', [teacherA.id, teacherB.id, student.id]);
  const prof = new Map((profiles ?? []).map((p) => [p.id, p]));

  console.log('\n0. Fixture identity, read back from profiles');
  const sp = prof.get(student.id);
  // THE RULING FROM PHASE 1: the 403 assertion is vacuous unless the account it
  // uses is verified to be a student first. A teacher account would 403 for a
  // completely different reason and the suite would look green.
  check(
    'the 403 fixture account is role=student',
    sp?.role === 'student',
    `role=${sp?.role} plan=${sp?.plan ?? 'null'}`
  );
  check(
    'the 403 fixture account holds no plan',
    sp?.plan == null,
    `plan=${sp?.plan ?? 'null'}`
  );
  const ap = prof.get(teacherA.id);
  check(
    'the Pro fixture account is teacher / teacher-pro / active',
    ap?.role === 'teacher' && ap?.plan === 'teacher-pro' && ap?.plan_status === 'active',
    `${ap?.role} / ${ap?.plan} / ${ap?.plan_status}`
  );
  const bp = prof.get(teacherB.id);
  check(
    'the Core fixture account is teacher / teacher-core / active',
    bp?.role === 'teacher' && bp?.plan === 'teacher-core' && bp?.plan_status === 'active',
    `${bp?.role} / ${bp?.plan} / ${bp?.plan_status}`
  );

  // Classes. A1 is Teacher A's and holds the student; B1 is Teacher B's.
  const { data: classes } = await db
    .from('classes')
    .select('id, name, teacher_id')
    .like('name', 'ZZ CSV Export Fixture%');
  const a1 = (classes ?? []).find((c) => c.name.endsWith('A1'));
  const b1 = (classes ?? []).find((c) => c.name.endsWith('B1'));
  if (!a1 || !b1) {
    console.error('Fixture classes missing. Re-run the seeder.');
    process.exit(1);
  }

  // Teacher B owns no class holding the student, so give the Core 200 case a
  // class it genuinely owns with that student enrolled. Fixture rows only.
  await db
    .from('class_enrollments')
    .upsert(
      { class_id: b1.id, student_id: student.id, enrolled_via: 'join_code', status: 'active' },
      { onConflict: 'class_id,student_id' }
    );

  console.log('\nBuilding.');
  execSync('npx next build', { stdio: 'inherit' });

  try {
    await fetch(BASE, { signal: AbortSignal.timeout(2000) });
    console.error(`\nSomething is already listening on ${BASE}. That would test a stale build.`);
    process.exit(1);
  } catch { /* nothing listening, good */ }

  console.log('Starting on', BASE);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  const stop = () => {
    try { process.kill(-server.pid, 'SIGKILL'); } catch { /* group gone */ }
    try { server.kill('SIGKILL'); } catch { /* child gone */ }
  };
  process.on('exit', stop);

  const deadline = Date.now() + 120000;
  for (;;) {
    if (Date.now() > deadline) { stop(); throw new Error('server did not answer within 120s'); }
    try { await fetch(BASE, { signal: AbortSignal.timeout(2000) }); break; }
    catch { await new Promise((r) => setTimeout(r, 500)); }
  }

  const browser = await chromium.launch();

  async function signIn(email) {
    const { data: link, error: linkErr } = await db.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (linkErr) throw new Error(`generateLink failed for ${email}: ${linkErr.message}`);
    const { data: verified, error: otpErr } = await anonClient.auth.verifyOtp({
      type: 'magiclink',
      token_hash: link.properties.hashed_token,
    });
    if (otpErr) throw new Error(`verifyOtp failed for ${email}: ${otpErr.message}`);

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
    const ctx = await browser.newContext();
    await ctx.addCookies(jar.map((c) => ({
      name: c.name, value: c.value, domain: 'localhost', path: '/',
      httpOnly: false, secure: false, sameSite: 'Lax',
    })));
    return ctx;
  }

  const q = (cls) => `${BASE}${ROUTE}?student_id=${student.id}&class_id=${cls}`;

  // Cleanup state, declared outside the try so the finally can always reach it.
  const createdIds = [];
  let transferred = false;

  // Aggregate rows this run creates, snapshotted BEFORE anything is written.
  //
  // Needed because the finally deletes official_scores rows through the service
  // client rather than through the API, which is right -- a failed run must be
  // cleaned up whatever state the handlers are in -- but means the aggregate
  // rows those writes produced are NOT removed with them. Under a clean run the
  // suite deletes its own row through DELETE and the aggregate follows; under a
  // FAULT run it does not, and the leftovers accumulate in a shared programme
  // table. Snapshot-and-diff is the only safe basis for the delete: the table
  // holds no identifier that could distinguish this run's rows from real ones.
  let aggregateIdsBefore = null;
  {
    const probe = await db.from('official_score_aggregate').select('id');
    if (!probe.error) aggregateIdsBefore = new Set((probe.data ?? []).map((r) => r.id));
  }

  try {
    // ─── 1. A student is refused ──────────────────────────────────────────────
    console.log('\n1. Student account (verified role=student above)');
    const studentCtx = await signIn(student.email);
    const sRes = await studentCtx.request.get(q(a1.id));
    check('a student is refused the route', sRes.status() === 403, `HTTP ${sRes.status()}`);

    // ─── 2. Core is admitted ──────────────────────────────────────────────────
    console.log('\n2. Core account: the decision under test');
    const coreCtx = await signIn(teacherB.email);
    const cRes = await coreCtx.request.get(q(b1.id));
    check('Core is admitted to the route', cRes.status() === 200, `HTTP ${cRes.status()}`);
    if (cRes.status() === 200) {
      const body = await cRes.json();
      // stored:false is the correct answer before sql/official_scores.sql is
      // run. Asserting the SHAPE rather than the rows is what lets this suite
      // run pre-migration without pretending the table exists.
      check(
        'the Core response carries a scores array',
        Array.isArray(body.scores),
        `stored=${body.stored}`
      );
    }

    // ─── 3. Pro is admitted too ───────────────────────────────────────────────
    console.log('\n3. Pro account: Pro must not lose a Core feature');
    const proCtx = await signIn(teacherA.email);
    const pRes = await proCtx.request.get(q(a1.id));
    check('Pro is admitted to the route', pRes.status() === 200, `HTTP ${pRes.status()}`);

    // ─── 4. Tenancy, which the capability gate does not cover ─────────────────
    console.log('\n4. Tenancy: an entitled teacher is still confined to their own class');
    const crossRes = await proCtx.request.get(q(b1.id));
    check(
      'Pro is refused a class they do not own',
      crossRes.status() === 404,
      `HTTP ${crossRes.status()}`
    );

    // ─── The write matrix ─────────────────────────────────────────────────────
    //
    // Everything from here needs official_scores to EXIST, because it asserts
    // things about rows. If section 1 of sql/official_scores.sql has not been
    // run, the writes come back 503 and every refusal below would pass for the
    // wrong reason -- which is precisely the vacuous green this file's header
    // warns about. So it is a hard stop, not a skip.
    const coreBody = cRes.status() === 200 ? await cRes.json() : {};
    if (coreBody.stored !== true) {
      console.error(
        '\nSTOPPING. official_scores does not exist on this database, so the ' +
        'write matrix (sections 5-9) cannot be proved and must not be reported ' +
        'as passing. Run section 1 of sql/official_scores.sql first.'
      );
      failures++;
      throw new Error('official_scores not migrated');
    }

    const TODAY = new Date().toISOString().slice(0, 10);
    const body = (over = {}) => ({
      student_id: student.id,
      class_id: b1.id,
      official_crc_score: 944,
      test_date: TODAY,
      level_qr: 'Basic',
      level_ar: 'Proficient',
      level_gr: null,
      level_pr: null,
      affirmed_official_report: true,
      ...over,
    });

    // ─── 5. The write verbs refuse a student ──────────────────────────────────
    //
    // Same caveat as section 1, restated because it applies verb by verb: a
    // student is refused by requireTeacher() on two independent conditions, so
    // these three 403s are real but are NOT evidence about the new capability
    // gate. Section 9's fault pair is what proves that line.
    console.log('\n5. A student is refused on every write verb, not only on GET');
    const sPost = await studentCtx.request.post(`${BASE}${ROUTE}`, { data: body() });
    check('a student may not POST', sPost.status() === 403, `HTTP ${sPost.status()}`);
    const sPatch = await studentCtx.request.patch(`${BASE}${ROUTE}`, {
      data: { ...body(), id: crypto.randomUUID() },
    });
    check('a student may not PATCH', sPatch.status() === 403, `HTTP ${sPatch.status()}`);
    const sDel = await studentCtx.request.delete(`${BASE}${ROUTE}`, {
      data: { id: crypto.randomUUID() },
    });
    check('a student may not DELETE', sDel.status() === 403, `HTTP ${sDel.status()}`);

    // ─── 6. Core may actually write ───────────────────────────────────────────
    //
    // The control the refusals need. Without it every check in sections 5 to 9
    // is satisfied by a build where writing is broken for everyone.
    console.log('\n6. Core can write: the control the refusals depend on');
    const created = await coreCtx.request.post(`${BASE}${ROUTE}`, { data: body() });
    check('Core may POST to their own class', created.status() === 201, `HTTP ${created.status()}`);
    const row = created.status() === 201 ? (await created.json()).score : null;
    if (row?.id) createdIds.push(row.id);
    check('the created row came back with an id', Boolean(row?.id), String(row?.id));

    // ─── 7. Tenancy on the write path ─────────────────────────────────────────
    //
    // TWO SEPARATE FAILURES, and they are separate on purpose. Owning the class
    // and the student being enrolled in it are different conditions, and a gate
    // that checks only the first admits any student id paired with a class the
    // teacher happens to own.
    console.log('\n7. Tenancy on the write path: ownership AND enrolment');
    const proIntoB = await proCtx.request.post(`${BASE}${ROUTE}`, { data: body() });
    check(
      'Pro may not POST into a class they do not own',
      proIntoB.status() === 404,
      `HTTP ${proIntoB.status()}`
    );

    // Teacher B's own id stands in for "a person who is not enrolled in A1".
    // Any uuid that is not an enrolled student would do; using a real one that
    // exists in profiles makes the 404 come from the ENROLMENT check rather
    // than from the id simply not resolving.
    const notEnrolled = await proCtx.request.post(`${BASE}${ROUTE}`, {
      data: body({ class_id: a1.id, student_id: teacherB.id }),
    });
    check(
      'Pro may not POST for someone not enrolled in a class they do own',
      notEnrolled.status() === 404,
      `HTTP ${notEnrolled.status()}`
    );
    // Tracked for cleanup even though it must not exist. When this check FAILS
    // -- which is exactly what happens under a fault run -- a row was created,
    // and leaving it behind would seed the next run with dirty data.
    if (notEnrolled.status() === 201) {
      createdIds.push((await notEnrolled.json()).score?.id);
    }

    // A row that does not exist is a 404 and never a 500, on both write verbs
    // that address a row by id.
    const ghost = crypto.randomUUID();
    const ghostPatch = await coreCtx.request.patch(`${BASE}${ROUTE}`, {
      data: { ...body(), id: ghost },
    });
    check('PATCH on an unknown id is 404', ghostPatch.status() === 404, `HTTP ${ghostPatch.status()}`);
    const ghostDel = await coreCtx.request.delete(`${BASE}${ROUTE}`, { data: { id: ghost } });
    check('DELETE on an unknown id is 404', ghostDel.status() === 404, `HTTP ${ghostDel.status()}`);

    // A row in a class the caller does not own is 404 on both, and the row must
    // still be there afterwards. Status alone is not proof: a handler that
    // deleted first and refused second would return 404 and still destroy it.
    if (row?.id) {
      const foreignPatch = await proCtx.request.patch(`${BASE}${ROUTE}`, {
        data: { ...body(), id: row.id, official_crc_score: 911 },
      });
      check(
        'Pro may not PATCH a row in a class they do not own',
        foreignPatch.status() === 404,
        `HTTP ${foreignPatch.status()}`
      );
      const foreignDel = await proCtx.request.delete(`${BASE}${ROUTE}`, { data: { id: row.id } });
      check(
        'Pro may not DELETE a row in a class they do not own',
        foreignDel.status() === 404,
        `HTTP ${foreignDel.status()}`
      );
      const { data: after } = await db
        .from('official_scores')
        .select('id, official_crc_score')
        .eq('id', row.id)
        .maybeSingle();
      check(
        'and the row is untouched, not merely un-reported',
        after?.official_crc_score === 944,
        `score=${after?.official_crc_score ?? 'GONE'}`
      );
    }

    // ─── 8. entered_by: owning the class is not enough to change a row ────────
    //
    // WHY THIS NEEDS A CLASS TRANSFER, said out loud because a reader will
    // otherwise assume the test is contrived. classes.teacher_id is a single
    // column: exactly one teacher owns a class, and gate() admits only that
    // teacher. So under ordinary operation entered_by ALWAYS equals the class
    // owner, and refuseIfNotCorrectable()'s entered_by branch is UNREACHABLE.
    //
    // It becomes reachable the moment a class changes hands -- a teacher leaves
    // mid-year and their classes are reassigned -- and at that moment it is the
    // only thing standing between the new owner and silently rewriting an
    // academic record somebody else signed. So the transfer is not a trick to
    // reach the branch; it IS the scenario the branch exists for, and this is
    // the only way to exercise it.
    //
    // The transfer is reverted in the finally block whatever happens.
    if (row?.id) {
      console.log('\n8. entered_by survives a class transfer');
      const { error: xferErr } = await db
        .from('classes')
        .update({ teacher_id: teacherA.id })
        .eq('id', b1.id);
      check('the fixture class transferred to Pro', !xferErr, xferErr?.message ?? '');
      transferred = !xferErr;

      // Pro now owns the class and passes every tenancy check. The row is still
      // Core's signature, so both write verbs must refuse -- with 403, because
      // this IS an authorisation failure, unlike the 409 an expired window gets.
      const xPatch = await proCtx.request.patch(`${BASE}${ROUTE}`, {
        data: { ...body(), id: row.id, official_crc_score: 911 },
      });
      check(
        'the new class owner may not PATCH a row they did not enter',
        xPatch.status() === 403,
        `HTTP ${xPatch.status()}`
      );
      const xDel = await proCtx.request.delete(`${BASE}${ROUTE}`, { data: { id: row.id } });
      check(
        'the new class owner may not DELETE a row they did not enter',
        xDel.status() === 403,
        `HTTP ${xDel.status()}`
      );
      const { data: after } = await db
        .from('official_scores')
        .select('id, official_crc_score')
        .eq('id', row.id)
        .maybeSingle();
      check(
        'and that row is untouched too',
        after?.official_crc_score === 944,
        `score=${after?.official_crc_score ?? 'GONE'}`
      );

      // GET is deliberately NOT expected to refuse here. The new owner may READ
      // the class's official scores -- that is what inheriting a class means.
      // Asserting a 403 on the read would be asserting a bug.
      const xGet = await proCtx.request.get(q(b1.id));
      check(
        'but the new class owner CAN still read the history',
        xGet.status() === 200,
        `HTTP ${xGet.status()}`
      );

      await db.from('classes').update({ teacher_id: teacherB.id }).eq('id', b1.id);
      transferred = false;
    }

    // ─── 9. The enterer may correct, which closes the matrix ──────────────────
    //
    // The last control. Every 403 above is only meaningful if the person who
    // SHOULD be able to change the row can.
    if (row?.id) {
      console.log('\n9. The entering teacher may correct their own row');
      const ownPatch = await coreCtx.request.patch(`${BASE}${ROUTE}`, {
        data: { ...body(), id: row.id, official_crc_score: 946 },
      });
      check('the enterer may PATCH inside the window', ownPatch.status() === 200, `HTTP ${ownPatch.status()}`);
      const { data: fixed } = await db
        .from('official_scores')
        .select('official_crc_score, corrected_at')
        .eq('id', row.id)
        .maybeSingle();
      check('the correction is stored', fixed?.official_crc_score === 946, String(fixed?.official_crc_score));
      check('and corrected_at is stamped', fixed?.corrected_at != null, String(fixed?.corrected_at));

      const ownDel = await coreCtx.request.delete(`${BASE}${ROUTE}`, { data: { id: row.id } });
      check('the enterer may DELETE inside the window', ownDel.status() === 200, `HTTP ${ownDel.status()}`);
      const { data: gone } = await db
        .from('official_scores')
        .select('id')
        .eq('id', row.id)
        .maybeSingle();
      check('and the row is actually gone', gone === null, gone ? 'still present' : 'removed');
      if (gone === null) createdIds.length = 0;
    }
  } catch (err) {
    // A thrown error must not be reported as a pass. The hard stop above throws
    // deliberately; anything else thrown here is a genuine failure too.
    console.error(`\n${err.message}`);
    failures = failures || 1;
  } finally {
    await browser.close();
    stop();

    // Leave the database as it was found, whatever happened above. The teardown
    // script deletes the fixture outright, but a half-transferred class between
    // this run and that one would make the NEXT run's section 7 pass for the
    // wrong reason.
    if (transferred) {
      await db.from('classes').update({ teacher_id: teacherB.id }).eq('id', b1.id);
    }
    if (createdIds.length > 0) {
      await db.from('official_scores').delete().in('id', createdIds);
    }
    if (aggregateIdsBefore) {
      const { data: now } = await db.from('official_score_aggregate').select('id');
      const mine = (now ?? []).map((r) => r.id).filter((id) => !aggregateIdsBefore.has(id));
      if (mine.length > 0) await db.from('official_score_aggregate').delete().in('id', mine);
    }
  }

  console.log(
    `\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) FAILED.`}`
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
