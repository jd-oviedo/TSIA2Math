// faultproof_curriculum_progress.mjs -- prove the tenancy boundary and the
// capability gate on /api/teacher/curriculum-progress by BREAKING them.
//
//   node scripts/seed_export_fixture.mjs
//   node scripts/faultproof_curriculum_progress.mjs                    # clean: all green
//   node scripts/faultproof_curriculum_progress.mjs --fault=ownership
//   node scripts/faultproof_curriculum_progress.mjs --fault=capability
//   node scripts/faultproof_curriculum_progress.mjs --fault=membership
//   node scripts/teardown_export_fixture.mjs
//
// WHY A FAULT RUN AND NOT JUST A GREEN SUITE. The route is guarded by three
// lines of Supabase filter. A suite that only ever sees them working cannot tell
// the difference between a boundary that holds and a boundary that is never
// tested -- and both look identical in a green run. So every check here is shown
// failing on a build where the line it depends on has been deleted, and passing
// on the build either side of it.
//
// THE FAULT IS A REAL EDIT TO A REAL SOURCE FILE, applied to the file on disk,
// rebuilt with `next build`, and reverted from a copy held in memory. Nothing is
// stubbed or monkey-patched: the server under test is the server that ships.
// Same discipline as scripts/faultproof_official_scores.mjs, which explains the
// reasoning at more length.
//
// EACH FAULT DECLARES WHICH CHECKS IT MUST REDDEN, and the run fails if the red
// set is not exactly that. Too few means the check was not load-bearing. TOO
// MANY is just as bad and is the failure mode people forget: a fault that
// reddens everything has probably broken the build, and a suite that accepts
// "something went red" would call that a pass.
//
// NEVER `next dev`. The dev server resolves modules differently and a gate proved
// against it is not a gate proved against production.
//
// THE FIXTURE, NOT REAL ACCOUNTS. seed_export_fixture.mjs builds exactly the
// shape this needs and says why in its own header:
//
//   Teacher A owns class A1 and class A2
//   Teacher B owns class B1                    <- A must be refused this
//   Mateo is enrolled in A2 and B1, NOT in A1  <- A must be refused him in A1
//
// Every account is deleted by the teardown.

import { spawn, execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { chromium } from 'playwright';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const PORT = 3112;
const BASE = `http://localhost:${PORT}`;
const ROUTE = '/api/teacher/curriculum-progress';
const EMAIL_DOMAIN = 'csv-export-fixture.example.com';

const SCOPE = 'app/lib/teacher-scope.ts';
const CAPS = 'app/lib/capabilities.ts';

// ─── The faults ──────────────────────────────────────────────────────────────
//
// `expect` names the checks the fault MUST redden, and no others.

const FAULTS = {
  ownership: {
    file: SCOPE,
    describe: 'requireClassOwnership stops filtering on teacher_id',
    // The one line that makes a class "this teacher's". Without it the lookup
    // finds any class by id, and every teacher can read every class.
    find: '    .eq("id", classId)\n    .eq("teacher_id", teacherId)\n    .maybeSingle();',
    replace: '    .eq("id", classId)\n    .maybeSingle();',
    // T2 ONLY, and T4 deliberately not. T4 asks about a student who is not in
    // the class, and the membership half answers that on its own -- Teacher A
    // owns A1 either way, so deleting the ownership filter cannot move it. The
    // two halves are independent and the fault sets say so; expecting T4 here
    // would fail the run as OVER-BROAD and would be the fault list lying about
    // what the boundary is made of.
    expect: ['T2'],
  },
  capability: {
    file: CAPS,
    describe: 'the curriculum-progress grant is removed from Teacher Core',
    // Removed from CORE ONLY, not from both tiers. That makes the fault sharp:
    // a Core teacher must lose the route while a Pro teacher keeps it, which
    // proves the gate reads the grant rather than merely existing.
    find: `  "teacher-core": new Set([
    "teacher-dashboard",
    "worksheets",
    "official-scores",
    "curriculum-progress",
  ]),`,
    replace: `  "teacher-core": new Set([
    "teacher-dashboard",
    "worksheets",
    "official-scores",
  ]),`,
    expect: ['T5'],
  },
  membership: {
    file: SCOPE,
    describe: "the status = 'active' filter is removed from both membership reads",
    // The bug this helper exists to make unwriteable, reintroduced on purpose.
    // See the note over activeStudentIds naming the two live call sites that
    // still carry it.
    find: '    .eq("class_id", classId)\n    .eq("status", "active");',
    replace: '    .eq("class_id", classId);',
    also: {
      find: '    .eq("student_id", studentId)\n    .eq("status", "active")\n    .maybeSingle();',
      replace: '    .eq("student_id", studentId)\n    .maybeSingle();',
    },
    expect: ['T6', 'T7'],
  },
};

const arg = process.argv.find((a) => a.startsWith('--fault='));
const faultName = arg ? arg.slice('--fault='.length) : null;
if (faultName && !FAULTS[faultName]) {
  console.error(`Unknown fault "${faultName}". Known: ${Object.keys(FAULTS).join(', ')}`);
  process.exit(1);
}
const fault = faultName ? FAULTS[faultName] : null;

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Restore, whatever happens ───────────────────────────────────────────────
//
// Registered BEFORE the first edit. A run interrupted between the write and the
// build must not leave a faulted source file on disk.

const ORIGINAL = new Map();
function snapshot(file) {
  if (!ORIGINAL.has(file)) ORIGINAL.set(file, readFileSync(file, 'utf8'));
}
function restoreFiles() {
  for (const [file, text] of ORIGINAL) writeFileSync(file, text);
}
process.on('exit', restoreFiles);
process.on('SIGINT', () => { restoreFiles(); process.exit(130); });

function applyFault(f) {
  snapshot(f.file);
  let text = readFileSync(f.file, 'utf8');
  const edits = [{ find: f.find, replace: f.replace }, ...(f.also ? [f.also] : [])];
  for (const edit of edits) {
    const count = text.split(edit.find).length - 1;
    // A fault that silently matched nothing would produce a CLEAN build and a
    // fully green run, which the report would then present as proof that the
    // deleted line does not matter. Exactly backwards, so this is fatal.
    if (count !== 1) {
      console.error(
        `\nFAULT DID NOT APPLY: expected 1 occurrence in ${f.file}, found ${count}.\n` +
        `The source has moved since this fault was written. Fix the fault, do not skip it.\n` +
        `Looking for:\n${edit.find}\n`
      );
      process.exit(1);
    }
    text = text.replace(edit.find, edit.replace);
  }
  writeFileSync(f.file, text);
}

// ─── Server ──────────────────────────────────────────────────────────────────

async function startServer() {
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

  const deadline = Date.now() + 180000;
  for (;;) {
    if (Date.now() > deadline) { stop(); throw new Error('server did not answer within 180s'); }
    try { await fetch(BASE, { signal: AbortSignal.timeout(2000) }); break; }
    catch { await new Promise((r) => setTimeout(r, 500)); }
  }
  return stop;
}

// ─── Sessions ────────────────────────────────────────────────────────────────
//
// generateLink + verifyOtp with the service-role key, then the SSR cookie jar
// into a Playwright context. Lifted from verify_official_scores_gate.mjs:203-231.
// The Email provider is NOT enabled and must not be; this path does not need it.

async function makeSignIn(browser) {
  return async function signIn(email) {
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
  };
}

// ─── Fixture lookup ──────────────────────────────────────────────────────────

async function loadFixture() {
  const { data: users } = await db.auth.admin.listUsers({ perPage: 1000 });
  const byEmail = new Map((users?.users ?? []).map((u) => [u.email, u]));
  const need = (slug) => {
    const user = byEmail.get(`${slug}@${EMAIL_DOMAIN}`);
    if (!user) {
      console.error(`\nFixture account ${slug} is missing. Run: node scripts/seed_export_fixture.mjs`);
      process.exit(1);
    }
    return user;
  };

  const teacherA = need('teacher-a');
  const teacherB = need('teacher-b');
  const mateo = need('mateo');
  const jose = need('jose');

  const { data: classes } = await db
    .from('classes')
    .select('id, name, teacher_id')
    .in('teacher_id', [teacherA.id, teacherB.id]);

  const byName = (suffix) => {
    const row = (classes ?? []).find((c) => c.name.endsWith(suffix));
    if (!row) {
      console.error(`\nFixture class ending "${suffix}" is missing. Re-seed the fixture.`);
      process.exit(1);
    }
    return row;
  };

  return {
    teacherA,
    teacherB,
    mateo,
    jose,
    a1: byName('A1'),
    a2: byName('A2, Period 3'),
    b1: byName('B1'),
  };
}

// ─── The checks ──────────────────────────────────────────────────────────────

const results = [];
function record(id, label, ok, detail) {
  results.push({ id, label, ok, detail });
  const mark = ok ? '  ok  ' : ' FAIL ';
  console.log(`${mark} ${id}  ${label}`);
  if (detail) console.log(`       ${detail}`);
}

async function main() {
  const fx = await loadFixture();

  if (fault) {
    console.log(`\nFAULT: ${faultName} -- ${fault.describe}`);
    console.log(`  file: ${fault.file}`);
    console.log(`  must redden: ${fault.expect.join(', ')}`);
    applyFault(fault);
  } else {
    console.log('\nCLEAN RUN. No fault applied; every check must pass.');
  }

  await startServer();
  const browser = await chromium.launch();
  const signIn = await makeSignIn(browser);

  // DB mutations this run makes, undone in the finally whatever happens.
  let teacherBPlan = null;
  let joseRestored = true;

  try {
    const aCtx = await signIn(fx.teacherA.email);

    const url = (classId, studentId) =>
      `${BASE}${ROUTE}?class_id=${classId}${studentId ? `&student_id=${studentId}` : ''}`;

    // ─── T1. Control: A reads a class A owns ─────────────────────────────────
    //
    // The control matters as much as the refusals. A build where every request
    // 404s would satisfy a refusal-only suite completely.
    {
      const res = await aCtx.request.get(url(fx.a1.id));
      const body = res.ok() ? await res.json() : null;
      record(
        'T1',
        'Teacher A reads the class rollup for A1, which A owns -> 200',
        res.status() === 200 && body?.rollup?.topicsTotal > 0,
        `status ${res.status()}, topicsTotal ${body?.rollup?.topicsTotal ?? '-'}, enrolled ${body?.rollup?.enrolled ?? '-'}`
      );
    }

    // ─── T2. THE TENANCY BOUNDARY ────────────────────────────────────────────
    {
      const res = await aCtx.request.get(url(fx.b1.id));
      record(
        'T2',
        "Teacher A is refused Teacher B's class B1 -> 404",
        res.status() === 404,
        `status ${res.status()}`
      );
    }

    // ─── T3. Control: A reads a student who is in A's class ──────────────────
    {
      const res = await aCtx.request.get(url(fx.a2.id, fx.mateo.id));
      const body = res.ok() ? await res.json() : null;
      record(
        'T3',
        'Teacher A reads Mateo in A2, where he is enrolled -> 200',
        res.status() === 200 && Array.isArray(body?.topics) && body.topics.length > 0,
        `status ${res.status()}, topics ${body?.topics?.length ?? '-'}`
      );
    }

    // ─── T4. Membership, not just ownership ──────────────────────────────────
    //
    // Mateo is a real student in a real class of Teacher B's. Owning A1 must not
    // be enough to read him through A1.
    {
      const res = await aCtx.request.get(url(fx.a1.id, fx.mateo.id));
      record(
        'T4',
        'Teacher A is refused Mateo through A1, where he is NOT enrolled -> 404',
        res.status() === 404,
        `status ${res.status()}`
      );
    }

    // ─── T5. The capability is held by CORE, not only by Pro ─────────────────
    //
    // Teacher B is flipped to teacher-core for the duration and put back in the
    // finally. Both fixture teachers are seeded teacher-pro, so without this the
    // Core grant would never be exercised by anything.
    {
      const { data: before } = await db
        .from('profiles').select('plan').eq('id', fx.teacherB.id).single();
      teacherBPlan = before?.plan ?? 'teacher-pro';
      await db.from('profiles').update({ plan: 'teacher-core' }).eq('id', fx.teacherB.id);

      const bCtx = await signIn(fx.teacherB.email);
      const res = await bCtx.request.get(url(fx.b1.id));
      record(
        'T5',
        'Teacher B on teacher-core reads B1 -> 200 (Core holds curriculum-progress)',
        res.status() === 200,
        `status ${res.status()}`
      );
    }

    // ─── T6. The status filter, single student ───────────────────────────────
    //
    // José is removed from A1 the way the product removes a student: the row
    // stays, the status changes. He must vanish from the teacher surface.
    {
      joseRestored = false;
      await db
        .from('class_enrollments')
        .update({ status: 'removed' })
        .eq('class_id', fx.a1.id)
        .eq('student_id', fx.jose.id);

      const res = await aCtx.request.get(url(fx.a1.id, fx.jose.id));
      record(
        'T6',
        'A student removed from A1 is refused -> 404',
        res.status() === 404,
        `status ${res.status()}`
      );
    }

    // ─── T7. The status filter, roster ───────────────────────────────────────
    //
    // The same removal, seen through the rollup denominator. A1 seeds five
    // active enrolments; with José removed the class is four.
    {
      const res = await aCtx.request.get(url(fx.a1.id));
      const body = res.ok() ? await res.json() : null;
      record(
        'T7',
        'The rollup counts 4 enrolled after the removal, not 5',
        res.status() === 200 && body?.rollup?.enrolled === 4,
        `status ${res.status()}, enrolled ${body?.rollup?.enrolled ?? '-'}`
      );
    }

    // ─── T8. The hard constraint, on the wire ────────────────────────────────
    //
    // Not a rendering question. completed_at must be absent from the JSON
    // itself, so no future component can reach it. Asserted over the raw text of
    // both response shapes rather than over a parsed field, because a key that
    // arrives nested somewhere unexpected still arrives.
    {
      const classRes = await aCtx.request.get(url(fx.a1.id));
      const studentRes = await aCtx.request.get(url(fx.a2.id, fx.mateo.id));
      const classText = await classRes.text();
      const studentText = await studentRes.text();
      const leaked = [];
      for (const [name, text] of [['class', classText], ['student', studentText]]) {
        for (const key of ['completedAt', 'completed_at']) {
          if (text.includes(key)) leaked.push(`${name}.${key}`);
        }
      }
      record(
        'T8',
        'completedAt / completed_at appear nowhere in either response body',
        leaked.length === 0,
        leaked.length === 0 ? 'both bodies clean' : `LEAKED: ${leaked.join(', ')}`
      );
    }
  } finally {
    if (teacherBPlan) {
      await db.from('profiles').update({ plan: teacherBPlan }).eq('id', fx.teacherB.id);
    }
    if (!joseRestored) {
      await db
        .from('class_enrollments')
        .update({ status: 'active' })
        .eq('class_id', fx.a1.id)
        .eq('student_id', fx.jose.id);
    }
    await browser.close();
  }

  // ─── The verdict ───────────────────────────────────────────────────────────

  const red = results.filter((r) => !r.ok).map((r) => r.id);
  const expected = fault ? [...fault.expect].sort() : [];
  const actual = [...red].sort();

  console.log('\n' + '─'.repeat(72));
  if (!fault) {
    if (actual.length === 0) {
      console.log('CLEAN RUN: all checks green. The boundary holds on an unfaulted build.');
      process.exit(0);
    }
    console.log(`CLEAN RUN FAILED. Red: ${actual.join(', ')}`);
    process.exit(1);
  }

  console.log(`FAULT "${faultName}": ${fault.describe}`);
  console.log(`  expected red: ${expected.join(', ') || '(none)'}`);
  console.log(`  actual red:   ${actual.join(', ') || '(none)'}`);

  const same = expected.length === actual.length && expected.every((id, i) => id === actual[i]);
  if (same) {
    console.log('\nFAULT PROVEN: deleting that line reddens exactly the checks that depend on it.');
    process.exit(0);
  }
  const missing = expected.filter((id) => !actual.includes(id));
  const extra = actual.filter((id) => !expected.includes(id));
  if (missing.length) {
    console.log(`\nNOT PROVEN: ${missing.join(', ')} stayed GREEN with the line deleted.`);
    console.log('That check does not depend on the line it was written to prove.');
  }
  if (extra.length) {
    console.log(`\nOVER-BROAD: ${extra.join(', ')} also went red.`);
    console.log('Either the fault is bigger than intended, or the build is broken.');
  }
  process.exit(1);
}

main().catch((err) => {
  console.error('\nRUN FAILED:', err);
  process.exit(1);
});
