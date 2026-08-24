// faultproof_assignments.mjs -- prove the write boundary on
// /api/teacher/assignments by BREAKING it.
//
//   node scripts/seed_export_fixture.mjs
//   node scripts/faultproof_assignments.mjs                       # clean: all green
//   node scripts/faultproof_assignments.mjs --fault=ownership
//   node scripts/faultproof_assignments.mjs --fault=targets
//   node scripts/faultproof_assignments.mjs --fault=membership
//   node scripts/faultproof_assignments.mjs --fault=placeholder
//   node scripts/faultproof_assignments.mjs --fault=fallback
//   node scripts/teardown_export_fixture.mjs
//
// WHY A FAULT RUN AND NOT JUST A GREEN SUITE. Build 4a is the first WRITE in
// this arc, and a write is guarded by about six lines of Supabase filter. A
// suite that only ever sees those lines working cannot tell a boundary that
// holds from a boundary that is never tested, and both look identical in a green
// run. So every check here is shown FAILING on a build where the line it depends
// on has been deleted, and passing on the build either side of it.
//
// THE FAULT IS A REAL EDIT TO A REAL SOURCE FILE, applied on disk, rebuilt with
// `next build`, reverted from a copy held in memory. Nothing is stubbed: the
// server under test is the server that ships. Same discipline as
// scripts/faultproof_curriculum_progress.mjs, whose machinery this reuses.
//
// EACH FAULT DECLARES WHICH CHECKS IT MUST REDDEN and the run fails if the red
// set is not exactly that. Too few means the check was not load-bearing. TOO
// MANY is just as bad and is the failure people forget: a fault that reddens
// everything has probably broken the build.
//
// A WRITE SUITE HAS TO CLEAN UP AFTER ITSELF, and this one does it two ways.
// Every assignment id it creates is remembered and deleted in the finally, and
// the finally then sweeps assignments for all three fixture classes in case a
// faulted build wrote a row this script did not expect -- which is precisely
// what the ownership fault does on purpose.
//
// NEVER `next dev`. The dev server resolves modules differently and a gate
// proved against it is not a gate proved against production.

import { spawn, execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { chromium } from 'playwright';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const PORT = 3114;
const BASE = `http://localhost:${PORT}`;
const ROUTE = '/api/teacher/assignments';
const EMAIL_DOMAIN = 'csv-export-fixture.example.com';
const COURSE = 'tsia2-math';

const SCOPE = 'app/lib/teacher-scope.ts';
const ROUTE_FILE = 'app/api/teacher/assignments/route.ts';
const PROGRESS = 'app/lib/curriculum-progress.ts';

// ─── The faults ──────────────────────────────────────────────────────────────
//
// `expect` names the checks the fault MUST redden, and no others.

const FAULTS = {
  ownership: {
    file: SCOPE,
    describe: 'requireClassOwnership stops filtering on teacher_id',
    // The one line that makes a class "this teacher's". Without it every teacher
    // may write into every class.
    find: '    .eq("id", classId)\n    .eq("teacher_id", teacherId)\n    .maybeSingle();',
    replace: '    .eq("id", classId)\n    .maybeSingle();',
    // W2 is the write; W8 is the delete. Both resolve authority through the same
    // call, so both must fall. Naming only one would be the fault list lying
    // about what the boundary is made of.
    expect: ['W2', 'W8'],
  },
  targets: {
    file: ROUTE_FILE,
    describe: 'the route stops refusing student ids that are not in the class',
    // THE WRITE TENANT VECTOR, deleted. Ownership still holds, so the teacher
    // still only writes into their own class -- they can now put ANY student id
    // in the product into it.
    find:
      '    const rejected = input.student_ids.filter((id) => !activeSet.has(id));\n' +
      '    if (rejected.length > 0) {\n' +
      '      return NextResponse.json(\n' +
      '        { error: "One or more students not in this class", rejected },\n' +
      '        { status: 404 }\n' +
      '      );\n' +
      '    }\n',
    replace: '    const rejected = input.student_ids.filter((id) => !activeSet.has(id));\n    void rejected;\n',
    // W3 is a student in another teacher's class; W4b is a student removed from
    // this one. Two different ways of not being a member, one line refusing both.
    expect: ['W3', 'W4b'],
  },
  membership: {
    file: SCOPE,
    describe: "the status = 'active' filter is removed from activeStudentIds",
    // The bug app/lib/teacher-scope.ts exists to make unwriteable, reintroduced.
    find: '    .eq("class_id", classId)\n    .eq("status", "active");',
    replace: '    .eq("class_id", classId);',
    // W4 is the read side: a removed student must vanish from the tracker. W4b
    // is the write side: they must not be assignable either. Both read the
    // roster through this one function.
    expect: ['W4', 'W4b'],
  },
  placeholder: {
    file: PROGRESS,
    describe: 'isAssignableTopic stops filtering out placeholder topics',
    find: "    .eq('topic_id', topicId)\n    .eq('is_placeholder', false)\n    .maybeSingle();",
    replace: "    .eq('topic_id', topicId)\n    .maybeSingle();",
    // W5 ONLY, and W5b deliberately NOT. W5b names a topic id that does not
    // exist at all, which maybeSingle refuses on its own -- expecting it here
    // would fail the run as OVER-BROAD and would misdescribe which line does
    // which job.
    expect: ['W5'],
  },
  fallback: {
    file: ROUTE_FILE,
    describe: 'resolveTargets falls back to the class roster when no target resolves',
    // THE ONE FAILURE MODE THAT LEAKS TO THE WHOLE CLASS. Written the way a
    // well-meaning "handle the empty case" edit would write it.
    find:
      '  if (row.target_type === "class") return activeIds;\n' +
      '  const active = new Set(activeIds);\n' +
      '  return storedIds.filter((id) => active.has(id));',
    replace:
      '  if (row.target_type === "class") return activeIds;\n' +
      '  const active = new Set(activeIds);\n' +
      '  const out = storedIds.filter((id) => active.has(id));\n' +
      '  return out.length > 0 ? out : activeIds;',
    // W9 only. W4 is deliberately built to keep ONE target after the removal, so
    // it never reaches the empty case and this fault cannot move it.
    expect: ['W9'],
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

const ORIGINAL = new Map();
function snapshot(file) {
  if (!ORIGINAL.has(file)) ORIGINAL.set(file, readFileSync(file, 'utf8'));
}
function restoreFiles() {
  for (const [file, text] of ORIGINAL) writeFileSync(file, text);
}
process.on('exit', restoreFiles);
process.on('SIGINT', () => { restoreFiles(); process.exit(130); });
// SIGTERM TOO, AND THIS IS NOT BELT-AND-BRACES. `process.on('exit')` does not
// fire for a signal, so a run killed with a plain `kill` -- or by a `pkill -f`
// aimed at something else -- leaves the faulted source sitting on disk, where
// the next person to build gets a boundary that has been deliberately removed.
// That happened once while this suite was being written, which is why it is
// here rather than trusted to habit.
process.on('SIGTERM', () => { restoreFiles(); process.exit(143); });

function applyFault(f) {
  snapshot(f.file);
  let text = readFileSync(f.file, 'utf8');
  const edits = [{ find: f.find, replace: f.replace }, ...(f.also ? [f.also] : [])];
  for (const edit of edits) {
    const count = text.split(edit.find).length - 1;
    // A fault that silently matched nothing produces a CLEAN build and a fully
    // green run, which a report would then present as proof the deleted line
    // does not matter. Exactly backwards, so this is fatal.
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
  // stdio IGNORED, NOT PIPED, AND THE CHILD IS UNREF'D. Both matter, and neither
  // is tidiness.
  //
  // Piping a child's stdout and stderr and then never reading them leaves two
  // open handles on THIS process's event loop, so node does not exit when main()
  // resolves -- it prints its verdict and then hangs forever. That is not merely
  // annoying: `process.on('exit')` never fires, so the FAULTED SOURCE FILE STAYS
  // ON DISK, which is the one thing this suite must never do. It behaved exactly
  // that way twice while being written, before the cause was found, and the
  // second time it left a deleted tenancy filter sitting in the working tree.
  //
  // Nothing here reads the server's output, so discarding it costs nothing.
  // unref() is the belt to that brace.
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    stdio: ['ignore', 'ignore', 'ignore'],
    detached: true,
  });
  server.unref();
  const stop = () => {
    try { process.kill(-server.pid, 'SIGKILL'); } catch { /* group gone */ }
    try { server.kill('SIGKILL'); } catch { /* child gone */ }
    // AND WHATEVER IS STILL HOLDING THE PORT. `next start` runs through an npm
    // wrapper that puts the real next-server in its own process group, so the
    // group kill above reliably kills npm and just as reliably misses the
    // server. The orphan then holds the port, and the NEXT run refuses to start
    // rather than test a stale build -- which is the check working correctly and
    // a fault run silently not happening. Killing by port is what actually ends
    // the server this run started.
    try {
      const out = execSync(`ss -tlnp 2>/dev/null | grep ':${PORT} ' || true`, { encoding: 'utf8' });
      for (const pid of new Set([...out.matchAll(/pid=(\d+)/g)].map((m) => m[1]))) {
        try { process.kill(Number(pid), 'SIGKILL'); } catch { /* already gone */ }
      }
    } catch { /* ss unavailable; the group kill above is all there is */ }
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
// into a Playwright context. The Email provider is NOT enabled and must not be.

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

  // Real topics, read from the course rather than hardcoded: a topic id pinned
  // in a script is one curriculum edit away from making this suite fail for a
  // reason that has nothing to do with the boundary it tests.
  const { data: realTopics } = await db
    .from('curriculum_topics')
    .select('topic_id')
    .eq('course_id', COURSE)
    .eq('is_placeholder', false)
    .order('unit_number')
    .order('sequence_in_unit')
    .limit(4);
  const { data: placeholders } = await db
    .from('curriculum_topics')
    .select('topic_id')
    .eq('course_id', COURSE)
    .eq('is_placeholder', true)
    .limit(1);

  if ((realTopics ?? []).length < 4 || (placeholders ?? []).length < 1) {
    console.error('\nThe course has fewer topics than this suite needs. Cannot run.');
    process.exit(1);
  }

  return {
    teacherA,
    teacherB,
    ana: need('ana'),
    jose: need('jose'),
    mateo: need('mateo'),
    a1: byName('A1'),
    a2: byName('A2, Period 3'),
    b1: byName('B1'),
    topics: realTopics.map((t) => t.topic_id),
    placeholder: placeholders[0].topic_id,
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

/** Every assignment id this run creates, for the teardown. */
const created = new Set();

async function post(ctx, body) {
  const res = await ctx.request.post(`${BASE}${ROUTE}`, { data: body });
  let json = null;
  try { json = await res.json(); } catch { /* not json */ }
  if (json?.assignment?.id) created.add(json.assignment.id);
  return { status: res.status(), body: json };
}

async function getList(ctx, classId) {
  const res = await ctx.request.get(`${BASE}${ROUTE}?class_id=${classId}`);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status(), body: json, text };
}

function findRow(list, topicId) {
  return (list?.assignments ?? []).find((a) => a.topic_id === topicId) ?? null;
}

async function main() {
  const fx = await loadFixture();
  const [T1, T2, T3, T4] = fx.topics;

  // A previous interrupted run could have left rows behind, and a leftover
  // class-target would make W1 a 409 rather than a 201.
  await db.from('assignments').delete().in('class_id', [fx.a1.id, fx.a2.id, fx.b1.id]);

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

  let joseRestored = true;

  try {
    const aCtx = await signIn(fx.teacherA.email);
    const bCtx = await signIn(fx.teacherB.email);

    // ─── W1. Control: A sets work in a class A owns ──────────────────────────
    //
    // The control matters as much as the refusals: a build where every POST 404s
    // would satisfy a refusal-only suite completely.
    let w1Id = null;
    {
      const r = await post(aCtx, {
        class_id: fx.a1.id, course_id: COURSE, topic_id: T1, target_type: 'class',
      });
      w1Id = r.body?.assignment?.id ?? null;
      record(
        'W1',
        `Teacher A assigns ${T1} to the whole of A1, which A owns -> 201`,
        r.status === 201 && Boolean(w1Id),
        `status ${r.status}, id ${w1Id ?? '-'}`
      );
    }

    // ─── W5. A placeholder topic is not assignable ───────────────────────────
    {
      const r = await post(aCtx, {
        class_id: fx.a1.id, course_id: COURSE, topic_id: fx.placeholder, target_type: 'class',
      });
      record(
        'W5',
        `A "Coming soon" topic (${fx.placeholder}) is refused -> 400`,
        r.status === 400,
        `status ${r.status}, error ${JSON.stringify(r.body?.error ?? null)}`
      );
    }

    // ─── W5b. A topic that does not exist is not assignable ──────────────────
    {
      const r = await post(aCtx, {
        class_id: fx.a1.id, course_id: COURSE, topic_id: 'ZZ.9.9', target_type: 'class',
      });
      record(
        'W5b',
        'A topic id that does not exist is refused -> 400',
        r.status === 400,
        `status ${r.status}`
      );
    }

    // ─── W2. THE WRITE TENANCY BOUNDARY ──────────────────────────────────────
    //
    // TWO ASSERTIONS, AND THE SECOND IS THE IMPORTANT ONE. A 404 returned AFTER
    // a row was written is still a breach: the teacher is refused a response
    // while the row sits in another teacher's class.
    {
      const before = await db
        .from('assignments').select('id', { count: 'exact', head: true }).eq('class_id', fx.b1.id);
      const r = await post(aCtx, {
        class_id: fx.b1.id, course_id: COURSE, topic_id: T2, target_type: 'class',
      });
      const after = await db
        .from('assignments').select('id', { count: 'exact', head: true }).eq('class_id', fx.b1.id);
      record(
        'W2',
        "Teacher A cannot assign into Teacher B's class B1 -> 404, and B1 gains no row",
        r.status === 404 && before.count === after.count,
        `status ${r.status}, B1 rows ${before.count} -> ${after.count}`
      );
    }

    // ─── W3. A student who is not in the class cannot be targeted ────────────
    //
    // Mateo is a real student in a real class of Teacher B's. Owning A1 must not
    // be enough to name him in an A1 assignment.
    {
      const before = await db
        .from('assignments').select('id', { count: 'exact', head: true }).eq('class_id', fx.a1.id);
      const r = await post(aCtx, {
        class_id: fx.a1.id,
        course_id: COURSE,
        topic_id: T2,
        target_type: 'student',
        student_ids: [fx.mateo.id],
      });
      const after = await db
        .from('assignments').select('id', { count: 'exact', head: true }).eq('class_id', fx.a1.id);
      const { count: links } = await db
        .from('assignment_students')
        .select('student_id', { count: 'exact', head: true })
        .eq('student_id', fx.mateo.id);
      record(
        'W3',
        'Teacher A cannot target Mateo through A1, where he is NOT enrolled -> 404, nothing written',
        r.status === 404 && before.count === after.count && links === 0,
        `status ${r.status}, A1 rows ${before.count} -> ${after.count}, mateo link rows ${links}`
      );
    }

    // ─── W6. Control: a whole-class target resolves live ─────────────────────
    {
      const active = await db
        .from('class_enrollments')
        .select('student_id', { count: 'exact', head: true })
        .eq('class_id', fx.a1.id)
        .eq('status', 'active');
      const list = await getList(aCtx, fx.a1.id);
      const row = findRow(list.body, T1);
      record(
        'W6',
        'The whole-class assignment resolves to the live active roster',
        list.status === 200 && row !== null && row.target_count === active.count,
        `status ${list.status}, target_count ${row?.target_count ?? '-'}, active roster ${active.count}`
      );
    }

    // ─── W9. A student-target with no target rows reaches NOBODY ─────────────
    //
    // THE SINGLE FAILURE MODE THAT LEAKS TO THE WHOLE CLASS. A half-failed write
    // or a hand-deleted row leaves a 'student' assignment with no children, and
    // the tempting "handle the empty case" edit is to fall back to the roster --
    // which silently turns one student's work into everybody's.
    {
      const r = await post(aCtx, {
        class_id: fx.a1.id,
        course_id: COURSE,
        topic_id: T3,
        target_type: 'student',
        student_ids: [fx.ana.id],
      });
      const id = r.body?.assignment?.id;

      const beforeList = await getList(aCtx, fx.a1.id);
      const beforeRow = findRow(beforeList.body, T3);

      // Straight at the table, the way a manual cleanup or a failed compensating
      // delete would leave it.
      await db.from('assignment_students').delete().eq('assignment_id', id);

      const afterList = await getList(aCtx, fx.a1.id);
      const afterRow = findRow(afterList.body, T3);

      const rosterSize = beforeList.body?.assignments?.find((a) => a.topic_id === T1)?.target_count ?? -1;
      record(
        'W9',
        'A student-target whose target rows are gone resolves to ZERO, never the class roster',
        r.status === 201 && beforeRow?.target_count === 1 && afterRow?.target_count === 0,
        `created ${r.status}, target_count ${beforeRow?.target_count ?? '-'} -> ` +
        `${afterRow?.target_count ?? '-'} (class roster is ${rosterSize})`
      );
    }

    // ─── WIRE. No scores and no completion stamp on the wire ─────────────────
    //
    // Not a rendering question. These keys must be absent from the JSON itself,
    // so no future component can reach them. Asserted over the raw text, because
    // a key that arrives nested somewhere unexpected still arrives. Quoted forms
    // are used so a topic NAME containing the word cannot raise a false alarm.
    {
      const list = await getList(aCtx, fx.a1.id);
      const leaked = [];
      for (const key of [
        'completedAt', 'completed_at',
        '"correct"', '"total"',
        'practiceCorrect', 'quizCorrect', 'practiceRequired', 'quizRequired',
        'lessonDone', 'lastWorkedAt',
      ]) {
        if (list.text.includes(key)) leaked.push(key);
      }
      record(
        'WIRE',
        'completedAt / completed_at and every score field appear nowhere in the GET body',
        leaked.length === 0,
        leaked.length === 0 ? `body clean (${list.text.length} bytes)` : `LEAKED: ${leaked.join(', ')}`
      );
    }

    // ─── W4. A removed student drops out of the tracker ──────────────────────
    //
    // TWO STUDENTS ON PURPOSE, not one. With a single target the removal empties
    // the list, which is W9's case and would let the fallback fault redden this
    // check too -- muddling "the status filter works" with "there is no roster
    // fallback". Keeping one target alive after the removal separates them.
    let w4Id = null;
    {
      const r = await post(aCtx, {
        class_id: fx.a1.id,
        course_id: COURSE,
        topic_id: T4,
        target_type: 'student',
        student_ids: [fx.jose.id, fx.ana.id],
      });
      w4Id = r.body?.assignment?.id ?? null;

      const before = findRow((await getList(aCtx, fx.a1.id)).body, T4);

      // José is removed the way the product removes a student: the row stays,
      // the status changes.
      joseRestored = false;
      await db
        .from('class_enrollments')
        .update({ status: 'removed' })
        .eq('class_id', fx.a1.id)
        .eq('student_id', fx.jose.id);

      const after = findRow((await getList(aCtx, fx.a1.id)).body, T4);
      record(
        'W4',
        'A student removed from the class drops out of an assignment that named them',
        r.status === 201 && before?.target_count === 2 && after?.target_count === 1,
        `target_count ${before?.target_count ?? '-'} -> ${after?.target_count ?? '-'} after removal`
      );
    }

    // ─── W4b. A removed student cannot be targeted by a NEW assignment ───────
    {
      const r = await post(aCtx, {
        class_id: fx.a1.id,
        course_id: COURSE,
        topic_id: T2,
        target_type: 'student',
        student_ids: [fx.jose.id],
      });
      record(
        'W4b',
        'A student removed from the class cannot be named in a new assignment -> 404',
        r.status === 404,
        `status ${r.status}, rejected ${JSON.stringify(r.body?.rejected ?? null)}`
      );
    }

    // ─── W8. Delete is scoped to the owning teacher ──────────────────────────
    {
      const res = await bCtx.request.delete(`${BASE}${ROUTE}`, { data: { id: w1Id } });
      const { data: survivor } = await db
        .from('assignments').select('id').eq('id', w1Id).maybeSingle();
      record(
        'W8',
        "Teacher B cannot delete Teacher A's assignment -> 404, and the row survives",
        res.status() === 404 && Boolean(survivor),
        `status ${res.status()}, row still present: ${Boolean(survivor)}`
      );
    }
  } finally {
    if (!joseRestored) {
      await db
        .from('class_enrollments')
        .update({ status: 'active' })
        .eq('class_id', fx.a1.id)
        .eq('student_id', fx.jose.id);
    }
    // By id first, then a sweep of the fixture classes: a faulted build writes
    // rows this script did not create, and W2 exists precisely to catch one.
    if (created.size > 0) {
      await db.from('assignments').delete().in('id', [...created]);
    }
    await db.from('assignments').delete().in('class_id', [fx.a1.id, fx.a2.id, fx.b1.id]);
    await browser.close();
  }

  // ─── The verdict ───────────────────────────────────────────────────────────

  const red = results.filter((r) => !r.ok).map((r) => r.id).sort();
  const expected = fault ? [...fault.expect].sort() : [];

  console.log('');
  if (!fault) {
    if (red.length === 0) {
      console.log('CLEAN RUN: all checks green. The boundary holds on an unfaulted build.');
      return;
    }
    console.log(`CLEAN RUN FAILED. Red: ${red.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  console.log(`FAULT "${faultName}": ${fault.describe}`);
  console.log(`  expected red: ${expected.join(', ') || '(none)'}`);
  console.log(`  actual red:   ${red.join(', ') || '(none)'}`);

  const missing = expected.filter((id) => !red.includes(id));
  const extra = red.filter((id) => !expected.includes(id));

  if (missing.length === 0 && extra.length === 0) {
    console.log('\nFAULT PROVEN: deleting that line reddens exactly the checks that depend on it.');
    return;
  }
  if (missing.length > 0) {
    console.log(`\nNOT PROVEN: ${missing.join(', ')} stayed GREEN with the line deleted.`);
    console.log('That check is not load-bearing. Fix the check, not the report.');
  }
  if (extra.length > 0) {
    console.log(`\nOVER-BROAD: ${extra.join(', ')} also went red.`);
    console.log('Either the fault is bigger than intended, or the build is broken.');
  }
  process.exitCode = 1;
}

// EXPLICIT EXIT, rather than trusting the event loop to drain. The detached
// server above is unref'd and its stdio discarded, so nothing SHOULD hold this
// process open -- but "should" is what produced the hang described over
// startServer, and a suite whose entire value rests on restoring a source file
// does not get to rely on an inference about open handles. restoreFiles() and
// stop() are both registered on 'exit' and run synchronously before this
// returns.
main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(process.exitCode ?? 0);
  });
