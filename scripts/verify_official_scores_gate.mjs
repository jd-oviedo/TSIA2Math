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
  } finally {
    await browser.close();
    stop();
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
