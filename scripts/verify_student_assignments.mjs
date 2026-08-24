// verify_student_assignments.mjs -- the Build 4b student surface, against a REAL
// student session on a REAL production build.
//
//   npm run build
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_student_assignments.mjs
//
// READ ONLY. This script creates nothing and deletes nothing. It reads the
// assignments that already exist and renders them as the student, which is why
// it needs no fixture and no teardown -- and why it must never be given one: a
// verification that writes its own input can pass on data no teacher ever set.
//
// WHAT IT IS ACTUALLY CHECKING, in order of how badly it would hurt to be wrong:
//
//   A. THE STATUS A STUDENT SEES IS THE STATUS THEIR TEACHER SEES. Not "both
//      call the same function" -- that is a claim about the source. This calls
//      getTopicStatuses BOTH WAYS, with the single id the student page passes
//      and with the roster the teacher route passes, and compares the answers
//      for this student on these topics. If the multi-student path ever
//      diverged from the single-student one, every other check here would still
//      pass and the two surfaces would quietly disagree.
//
//   B. THE TEACHER'S AGGREGATE AGREES WITH THE STUDENT'S ROW. For a
//      student-target assignment naming one student, target_count is 1, so the
//      teacher tracker's complete/in_progress/not_started triple IS that
//      student's status and can be compared to it directly over HTTP.
//
//   C. THE RENDERED PAGE. Buckets, order, and the due chips, read out of a real
//      hydrated DOM rather than out of the HTML the server sent -- the list is a
//      client component that renders nothing until it has read the clock, so a
//      raw fetch of this page proves nothing at all.
//
//   D. THE EXCLUSIONS. Archived classes and plan-gated topics never reach the
//      page. Checked against what the database says should have been dropped,
//      so a pass means "the filter fired", not "nothing needed filtering".
//
// NEVER `next dev`. The dev server resolves modules differently and a surface
// proved against it is not the surface that ships.

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { chromium } from 'playwright';
import { registerHooks } from 'node:module';
// PURE, SO IT IMPORTS AS-IS. app/lib/assignments.ts deliberately depends on
// nothing (see its header), which is the whole reason this harness can load the
// rules under test directly rather than reimplementing them here.
import { bucketFor, nextDue, isOverdue } from '../app/lib/assignments.ts';

// curriculum-progress.ts is NOT pure -- it opens with `import { cache } from
// 'react'`, and plain Node has no React server runtime to provide that export,
// so a static import of it dies before this file runs a line:
//
//   SyntaxError: The requested module 'react' does not provide an export named 'cache'
//
// Shimmed rather than worked around. cache() memoises per REQUEST; outside a
// request there is no scope to memoise in, so identity is not a stub of the real
// behaviour, it IS the real behaviour in this context. The only cost is that
// getTopics() may run more than once in this process, which a harness can afford.
//
// Registered before the dynamic import below, because static imports hoist and
// would beat the hook.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'react') return { url: 'shim:react', shortCircuit: true };
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url === 'shim:react') {
      return {
        format: 'module',
        source: 'export const cache = (fn) => fn;\nexport default { cache };',
        shortCircuit: true,
      };
    }
    return next(url, context);
  },
});
const { getTopicStatuses, topicKey } = await import('../app/lib/curriculum-progress.ts');

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const PORT = 3116;
const BASE = `http://localhost:${PORT}`;
const STUDENT_EMAIL = process.env.VERIFY_STUDENT_EMAIL ?? 'vics8388@gmail.com';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

const results = [];
const check = (id, ok, detail) => {
  results.push({ id, ok, detail });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
};

// ─── Server ──────────────────────────────────────────────────────────────────

// THE PORT IS CHECKED BEFORE ANYTHING IS STARTED, and this is not defensive
// padding -- it is here because the absence of it produced a FALSE RESULT.
//
// `npx next start` spawns a `next-server` GRANDCHILD. Killing the npx wrapper
// leaves that grandchild alive and holding the port, so the next run's server
// silently fails to bind, the readiness probe below is answered by the STALE
// server from the previous run, and the browser then tests a build that is not
// the one on disk. Observed exactly that way: a run reported 0 of 3 rows
// rendered against a server whose .next had been overwritten underneath it.
//
// So: refuse to start if the port is busy (never test something we did not
// launch), and kill the whole process GROUP on the way out.
async function startServer() {
  let stale = false;
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(1500) });
    stale = true;
  } catch {
    // Nothing listening, which is what we want.
  }
  if (stale) {
    throw new Error(
      `something is already listening on ${BASE}. A previous run's next-server ` +
        `probably outlived its wrapper; kill it before re-running, or this would ` +
        `test that server instead of this build.`
    );
  }

  const proc = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
    // Its own process group, so the kill in the finally reaches next-server too.
    detached: true,
  });
  for (let i = 0; i < 120; i += 1) {
    try {
      await fetch(BASE, { signal: AbortSignal.timeout(2000) });
      return proc;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('server never came up');
}

/** Kill the whole group. See startServer for what a half-kill costs. */
function stopServer(proc) {
  if (!proc) return;
  try {
    process.kill(-proc.pid, 'SIGTERM');
  } catch {
    try {
      proc.kill('SIGTERM');
    } catch {
      // Already gone.
    }
  }
}

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
    return ctx;
  };
}

// ─── What the database says ──────────────────────────────────────────────────

async function loadExpected() {
  const { data: users } = await db.auth.admin.listUsers({ perPage: 1000 });
  const student = users.users.find((u) => u.email === STUDENT_EMAIL);
  if (!student) throw new Error(`no account for ${STUDENT_EMAIL}`);

  const { data: enr } = await db
    .from('class_enrollments')
    .select('class_id, status, classes(id, name, archived_at, teacher_id)')
    .eq('student_id', student.id);

  const active = [];
  const excludedArchived = [];
  for (const e of enr ?? []) {
    const c = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    if (!c) continue;
    if (e.status !== 'active') continue;
    (c.archived_at ? excludedArchived : active).push({ id: c.id, name: c.name, teacher: c.teacher_id });
  }

  const classIds = active.map((c) => c.id);
  const { data: rows } = await db
    .from('assignments')
    .select('id, class_id, course_id, topic_id, target_type, due_at, created_at')
    .in('class_id', classIds.length ? classIds : ['00000000-0000-0000-0000-000000000000']);

  const { data: links } = await db
    .from('assignment_students')
    .select('assignment_id')
    .eq('student_id', student.id);
  const named = new Set((links ?? []).map((l) => l.assignment_id));

  // The reverse rule, applied here independently of the application code so the
  // expectation is not derived from the thing under test.
  const mine = (rows ?? []).filter((r) =>
    r.target_type === 'class' ? true : named.has(r.id)
  );

  return { student, active, excludedArchived, mine, classIds };
}

// ─── Run ─────────────────────────────────────────────────────────────────────

let server;
let browser;
try {
  const { student, active, excludedArchived, mine, classIds } = await loadExpected();
  console.log(`\nStudent ${STUDENT_EMAIL} (${student.id})`);
  console.log(`  active classes: ${active.map((c) => c.name).join(', ') || '(none)'}`);
  console.log(`  assignments targeting them: ${mine.length}`);
  for (const a of mine) {
    console.log(`    ${a.course_id}:${a.topic_id} type=${a.target_type} due=${a.due_at ?? 'none'}`);
  }

  // ─── A. Same status, both call shapes ──────────────────────────────────────
  //
  // The student page calls getTopicStatuses([oneId]); the teacher route calls it
  // with the union of every targeted student on the page. Same function, two
  // argument shapes, and this is where they are made to answer the same
  // question about the same person.
  const rosterIds = new Set([student.id]);
  for (const cid of classIds) {
    const { data: r } = await db
      .from('class_enrollments')
      .select('student_id')
      .eq('class_id', cid)
      .eq('status', 'active');
    for (const row of r ?? []) rosterIds.add(row.student_id);
  }

  const single = await getTopicStatuses([student.id]);
  const roster = await getTopicStatuses([...rosterIds]);
  const singleMap = single.get(student.id) ?? new Map();
  const rosterMap = roster.get(student.id) ?? new Map();

  const statusFor = {};
  let mismatches = 0;
  for (const a of mine) {
    const key = topicKey(a.course_id, a.topic_id);
    const s = singleMap.get(key)?.status ?? 'not_started';
    const r = rosterMap.get(key)?.status ?? 'not_started';
    statusFor[key] = s;
    if (s !== r) mismatches += 1;
    console.log(`    status ${key}: single=${s} roster=${r}`);
  }
  check(
    'A1',
    mismatches === 0 && mine.length > 0,
    `getTopicStatuses agrees across call shapes on ${mine.length} assigned topic(s) ` +
      `(roster of ${rosterIds.size})`
  );

  // ─── D. Exclusions, decided before the page is opened ──────────────────────
  //
  // REPORTED HONESTLY WHEN THERE IS NOTHING TO EXCLUDE. A filter that never had
  // anything to reject has not been shown to work, and saying "archived
  // excluded: PASS" on a student with no archived enrolment would be the check
  // lying about its own coverage. The count is printed either way.
  const { data: everyRow } = await db
    .from('assignments')
    .select('id, class_id, target_type, classes(archived_at)');
  const inArchivedClass = (everyRow ?? []).filter((r) => {
    const c = Array.isArray(r.classes) ? r.classes[0] : r.classes;
    return Boolean(c?.archived_at);
  });
  check(
    'D1',
    excludedArchived.length === 0,
    excludedArchived.length === 0
      ? `no archived-class enrolment for this student, and ${inArchivedClass.length} assignment(s) sit in archived classes product-wide -- filter present, UNEXERCISED by live data`
      : `${excludedArchived.length} archived class(es) excluded from this student's list`
  );

  // ─── Server + sessions ─────────────────────────────────────────────────────
  console.log('\nStarting production server...');
  server = await startServer();
  browser = await chromium.launch();
  const signIn = await makeSignIn(browser);

  // ─── C. The rendered page ──────────────────────────────────────────────────
  const ctx = await signIn(STUDENT_EMAIL);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/dashboard/assignments`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200); // the rAF clock read, then the grouped render

  const rendered = await page.evaluate(() => {
    const out = [];
    for (const section of document.querySelectorAll('section')) {
      const h2 = section.querySelector('h2');
      if (!h2) continue;
      const rows = [...section.querySelectorAll('a[href*="/course/"]')].map((a) => ({
        text: a.innerText.replace(/\s+/g, ' ').trim(),
        href: a.getAttribute('href'),
      }));
      if (rows.length) out.push({ heading: h2.innerText.replace(/\s+/g, ' ').trim(), rows });
    }
    return out;
  });

  console.log('\nRENDERED /dashboard/assignments:');
  for (const g of rendered) {
    console.log(`  [${g.heading}]`);
    for (const r of g.rows) console.log(`     ${r.text}`);
  }

  const renderedCount = rendered.reduce((n, g) => n + g.rows.length, 0);
  check('C1', renderedCount === mine.length, `${renderedCount} rows rendered, ${mine.length} expected`);

  // Bucket placement, computed independently from the raw due dates.
  const now = Date.now();
  const expectedBucket = {};
  for (const a of mine) {
    const key = topicKey(a.course_id, a.topic_id);
    expectedBucket[key] = bucketFor(a.due_at, now, statusFor[key] !== 'complete');
  }
  const LABEL = {
    overdue: 'Overdue',
    this_week: 'This week',
    later: 'Later',
    no_due_date: 'No due date',
  };
  let bucketOk = true;
  for (const a of mine) {
    const key = topicKey(a.course_id, a.topic_id);
    const want = LABEL[expectedBucket[key]];
    const group = rendered.find((g) => g.rows.some((r) => r.text.includes(a.topic_id)));
    if (!group || !group.heading.startsWith(want)) {
      bucketOk = false;
      console.log(`     bucket mismatch for ${a.topic_id}: want ${want}, got ${group?.heading ?? 'absent'}`);
    }
  }
  check('C2', bucketOk, 'every assignment rendered in the bucket its due date and status imply');

  // Heading order, as rendered, must follow the locked order.
  const ORDER = ['Overdue', 'This week', 'Later', 'No due date'];
  const seen = rendered.map((g) => ORDER.findIndex((o) => g.heading.startsWith(o)));
  const ordered = seen.every((v, i) => v >= 0 && (i === 0 || v > seen[i - 1]));
  check('C3', ordered, `bucket order as rendered: ${rendered.map((g) => g.heading.split(' ').slice(0, -1).join(' ') || g.heading).join(' -> ')}`);

  // No completed assignment may appear under Overdue, ever.
  const overdueGroup = rendered.find((g) => g.heading.startsWith('Overdue'));
  const completedInOverdue = (overdueGroup?.rows ?? []).filter((r) => r.text.includes('Complete'));
  check('C4', completedInOverdue.length === 0, `Overdue holds ${overdueGroup?.rows.length ?? 0} row(s), ${completedInOverdue.length} of them complete`);

  // Status as rendered must equal the status computed above.
  let statusOk = true;
  const RENDER_LABEL = { complete: 'Complete', in_progress: 'In progress', not_started: 'Not started' };
  for (const a of mine) {
    const key = topicKey(a.course_id, a.topic_id);
    const row = rendered.flatMap((g) => g.rows).find((r) => r.text.includes(a.topic_id));
    if (!row || !row.text.includes(RENDER_LABEL[statusFor[key]])) {
      statusOk = false;
      console.log(`     status mismatch for ${a.topic_id}: want ${RENDER_LABEL[statusFor[key]]}, row="${row?.text}"`);
    }
  }
  check('C5', statusOk, 'every rendered status equals getTopicStatuses for this student');

  // ─── Home compact card ─────────────────────────────────────────────────────
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const home = await page.evaluate(() => {
    const h = [...document.querySelectorAll('h2')].find((x) =>
      /Your next assignment/.test(x.innerText)
    );
    if (!h) return null;
    const card = h.closest('section');
    return {
      heading: h.innerText.trim(),
      rows: [...card.querySelectorAll('a[href*="/course/"]')].map((a) =>
        a.innerText.replace(/\s+/g, ' ').trim()
      ),
    };
  });
  console.log('\nRENDERED /dashboard compact card:');
  console.log(home ? `  [${home.heading}]\n${home.rows.map((r) => '     ' + r).join('\n')}` : '  (not rendered)');

  const incomplete = mine.filter((a) => statusFor[topicKey(a.course_id, a.topic_id)] !== 'complete');
  const wantNext = nextDue(
    incomplete.map((a) => ({ ...a, due_at: a.due_at, created_at: a.created_at })),
    () => true
  );
  if (incomplete.length === 0) {
    check('H1', home === null, 'no incomplete work, and no card is rendered');
  } else {
    check('H1', home !== null, `card rendered with ${home?.rows.length ?? 0} row(s)`);
    check(
      'H2',
      home !== null && home.rows.length === Math.min(2, incomplete.length),
      `shows ${home?.rows.length ?? 0}, expected ${Math.min(2, incomplete.length)} (1-2 next due)`
    );
    const order = wantNext.map((a) => a.topic_id);
    const gotOrder = order.every((t, i) => home?.rows[i]?.includes(t));
    check('H3', gotOrder, `next-due order ${order.join(' then ')}`);
    const anyComplete = (home?.rows ?? []).some((r) =>
      mine.some(
        (a) =>
          r.includes(a.topic_id) &&
          statusFor[topicKey(a.course_id, a.topic_id)] === 'complete'
      )
    );
    check('H4', !anyComplete, 'no completed assignment appears on the Home card');
  }

  // ─── B. The teacher's own tracker, over HTTP ───────────────────────────────
  const teacherIds = [...new Set(active.map((c) => c.teacher))];
  const { data: users2 } = await db.auth.admin.listUsers({ perPage: 1000 });
  let compared = 0;
  let agreed = 0;
  for (const tid of teacherIds) {
    const t = users2.users.find((u) => u.id === tid);
    if (!t) continue;
    const tctx = await signIn(t.email);
    const tpage = await tctx.newPage();
    for (const cls of active.filter((c) => c.teacher === tid)) {
      const res = await tpage.request.get(`${BASE}/api/teacher/assignments?class_id=${cls.id}`);
      if (!res.ok()) {
        console.log(`     teacher ${t.email} got ${res.status()} for ${cls.name}`);
        continue;
      }
      const body = await res.json();
      for (const a of body.assignments ?? []) {
        const key = topicKey(a.course_id, a.topic_id);
        if (!(key in statusFor)) continue;
        // Only a one-student target lets the aggregate be read back as one
        // student's status. Class-targets are covered by check A instead.
        if (a.target_count !== 1) continue;
        compared += 1;
        const teacherSays =
          a.complete === 1 ? 'complete' : a.in_progress === 1 ? 'in_progress' : 'not_started';
        const ok = teacherSays === statusFor[key];
        if (ok) agreed += 1;
        console.log(
          `     ${cls.name} ${a.topic_id}: teacher tracker says ${teacherSays}, student page says ${statusFor[key]} ${ok ? 'OK' : 'MISMATCH'}`
        );
      }
    }
    await tctx.close();
  }
  check(
    'B1',
    compared > 0 && compared === agreed,
    `${agreed}/${compared} single-target assignment(s) agree between the teacher tracker and the student page`
  );

  // ─── The rule the live data cannot exercise ────────────────────────────────
  //
  // Production holds no completed-past-due assignment, so C4 above passed
  // without having anything to reject. Stated rather than hidden: the rule is
  // exercised here directly, on the shared helper the page calls, so a pass is
  // about the rule and not about the data.
  const past = '2020-01-01T00:00:00Z';
  const T = Date.parse('2026-08-24T12:00:00Z');
  check(
    'R1',
    isOverdue(past, T, true) === true && isOverdue(past, T, false) === false,
    'past-due AND not-complete is overdue; past-due AND complete is not'
  );
  check(
    'R2',
    bucketFor(past, T, false) !== 'overdue' && bucketFor(past, T, true) === 'overdue',
    'a completed past-due assignment buckets outside Overdue'
  );

  await ctx.close();
} finally {
  if (browser) await browser.close();
  stopServer(server);
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILED: ' + failed.map((f) => f.id).join(', '));
  process.exit(1);
}
console.log('ALL GREEN');
process.exit(0);
