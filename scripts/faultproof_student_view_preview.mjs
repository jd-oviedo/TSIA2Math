// faultproof_student_view_preview.mjs -- prove Student View is a bounded preview,
// by RUNNING the two routes that decide it and counting what they actually did.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/faultproof_student_view_preview.mjs
//
// WHAT IS BEING PROVED
// --------------------
// A teacher reaching the course tree through the second door (course-access.ts:162)
// used to be a full student: every answer wrote curriculum_attempts, rolled a real
// quiz_score into curriculum_completion and accumulated student_misconceptions
// under their own auth id, and Mu ran with no plan check and no ceiling. Three
// things have to hold now, and each is a COUNT rather than an absence:
//
//   1. a teacher's graded answer writes exactly 0 attempt rows
//   2. a student's identical answer still writes exactly 1
//   3. a teacher's Mu is refused once TEACHER_DEMO_TURNS is spent, and a Full
//      Course student at the same count is still served
//   4. a plan without `gumu` cannot POST /api/gumu/session at all
//
// WHY A RUN AND NOT SOURCE ASSERTIONS, which is what the neighbouring faultproof
// scripts use. Their subject is a module-private helper whose correctness is a
// property of the text (faultproof_gumu_resolution.mjs says so, and is right about
// its own case). The subject HERE is "how many rows were written", which no amount
// of reading proves: the guard could be present and the call could still happen on
// a path nobody read. So the handlers are executed and the writes are counted.
//
// WHAT THE STUBS DO AND DO NOT DECIDE. Supabase, Upstash, Anthropic and
// NextResponse are replaced. None of them makes a decision under test: the fakes
// record calls and hand back fixtures, and every branch that matters is executed
// out of the real route source, the real capabilities.ts and, for the demo cap,
// the real consumeLifetimeQuota in rate-limit.ts running against an in-memory
// Redis. What is asserted is what the ROUTE did, never what a stub returned.
//
// NOTHING HERE TOUCHES A DATABASE, a network, or an account. There is no DDL, no
// seeded user, and no environment beyond this file.
//
// EVERY CHECK IS FAULTED. Each assertion below is run a second time against a
// deliberately broken build -- either the pre-change source, restored by rewriting
// the guard back to what it was, or a fixture swapped to the other role -- and is
// required to FAIL there. A check that passes both ways is reported as UNTRUSTED
// and fails the run, because it is measuring nothing.

import { registerHooks } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fileUrl = (p) => pathToFileURL(resolve(ROOT, p)).href;

// ---------------------------------------------------------------------------
// The world the stubs read
// ---------------------------------------------------------------------------

const W = {
  session: null,
  access: null,
  reads: {},
  inserts: [],
  updates: [],
  deletes: [],
  rpcs: [],
  snapshots: [],
  askGumuCalls: 0,
  redis: new Map(),
  redisThrow: false,
  screen: { action: 'continue' },
};
globalThis.__SV = W;

// The five CourseAccess shapes, copied from course-access.ts rather than invented.
// Same fixtures as tests/units.test.ts and tests/tutor-gate.test.ts, deliberately:
// if this file disagrees with those about what a plan is, one of them is wrong.
const ACCESS = {
  freeTier: { curriculum: false, gumu: false, viaTeacher: false, signedIn: true },
  practicePass: { curriculum: false, gumu: false, viaTeacher: false, signedIn: true },
  fullCourse: { curriculum: true, gumu: true, viaTeacher: false, signedIn: true },
  teacher: { curriculum: true, gumu: true, viaTeacher: true, signedIn: true },
  derivedTeacher: { curriculum: true, gumu: true, viaTeacher: false, signedIn: true },
};

// A real uuid, because gumuMessageSchema validates the shape (schemas.ts:122) and
// a readable placeholder is rejected at the zod layer before any gate is reached.
const SESSION_ID = '11111111-2222-4333-8444-555555555555';
const COURSE = 'tsia2-math';
const TOPIC = 'QR.1.5';

// One wrong multiple-choice answer with a misconception tag on the chosen option,
// which is the only shape that exercises every write in the practice route at once.
const TOPIC_ROW = {
  data: {
    related_strand: 'quantitative-reasoning',
    practice_items: {
      practice: {
        items: [
          {
            item_number: 1,
            format: 'multiple_choice',
            stem: 'What is 2 + 2?',
            choices: { A: '4', B: '5' },
            correct_answer: 'A',
            misconception_tag: { B: 'adds-instead-of-multiplies' },
          },
        ],
      },
    },
  },
  error: null,
};

function reset(overrides = {}) {
  W.session = { user: { id: 'u-1' } };
  W.access = ACCESS.fullCourse;
  W.reads = {
    curriculum_topics: TOPIC_ROW,
    gumu_sessions: { data: null, error: null },
    'gumu_sessions:insert': { data: { id: SESSION_ID }, error: null },
    gumu_messages: { data: [], error: null },
  };
  W.inserts = [];
  W.updates = [];
  W.deletes = [];
  W.rpcs = [];
  W.snapshots = [];
  W.askGumuCalls = 0;
  W.redis = new Map();
  W.redisThrow = false;
  W.screen = { action: 'continue' };
  Object.assign(W, overrides);
}

const insertsTo = (table) => W.inserts.filter((r) => r.table === table).length;
const rpcsNamed = (name) => W.rpcs.filter((r) => r.name === name).length;

// ---------------------------------------------------------------------------
// The stubs
// ---------------------------------------------------------------------------

const REAL = '?real=1';

const STUBS = new Map();

STUBS.set('next/server', `
export class NextResponse {
  constructor(body, status) { this._body = body; this.status = status; }
  static json(body, init) {
    const status = (init && init.status) || 200;
    return new NextResponse(body, status);
  }
  async json() { return this._body; }
}
`);

STUBS.set('@upstash/redis', `
// Enough of the client for consumeLifetimeQuota's get/incr, plus a switch that
// makes both throw so the REAL helper's fail-closed branch can be exercised.
export class Redis {
  static fromEnv() { return new Redis(); }
  async get(key) {
    const W = globalThis.__SV;
    if (W.redisThrow) throw new Error('upstash unreachable');
    return W.redis.has(key) ? W.redis.get(key) : null;
  }
  async incr(key) {
    const W = globalThis.__SV;
    if (W.redisThrow) throw new Error('upstash unreachable');
    const next = (W.redis.get(key) || 0) + 1;
    W.redis.set(key, next);
    return next;
  }
}
`);

STUBS.set('@upstash/ratelimit', `
// The sliding windows are not under test here; they always allow, so a 429 can
// never be mistaken for one of the gates this file is about.
export class Ratelimit {
  constructor(opts) { this.opts = opts; }
  static slidingWindow(n, w) { return { n, w }; }
  async limit() { return { success: true, reset: Date.now() + 1000 }; }
}
`);

STUBS.set('app/lib/supabase-admin.ts', `
const W = globalThis.__SV;

// A chainable stand-in for the PostgREST builder. Every terminal form the two
// routes use resolves through result(): .single(), .maybeSingle(), and awaiting
// the builder itself.
function builder(table) {
  const st = { table, op: 'select' };
  const b = {
    select() { return b; },
    eq() { return b; },
    in() { return b; },
    order() { return b; },
    limit() { return b; },
    insert(payload) { st.op = 'insert'; W.inserts.push({ table, payload }); return b; },
    update(payload) { st.op = 'update'; W.updates.push({ table, payload }); return b; },
    delete() { st.op = 'delete'; W.deletes.push({ table }); return b; },
    single() { return Promise.resolve(result(st)); },
    maybeSingle() { return Promise.resolve(result(st)); },
    then(onOk, onErr) { return Promise.resolve(result(st)).then(onOk, onErr); },
  };
  return b;
}

function result(st) {
  const key = st.op === 'insert' ? st.table + ':insert' : st.table;
  const fixture = W.reads[key];
  return fixture === undefined ? { data: null, error: null } : fixture;
}

export function createAdminClient() {
  return {
    from: (table) => builder(table),
    rpc: (name, args) => { W.rpcs.push({ name, args }); return Promise.resolve({ error: null }); },
  };
}
`);

STUBS.set('app/lib/supabase-server.ts', `
export async function createClient() {
  return { auth: { getSession: async () => ({ data: { session: globalThis.__SV.session } }) } };
}
`);

STUBS.set('app/lib/course-access.ts', `
// The resolver is stubbed, the PREDICATE is not: every route under test calls the
// real allowsTopic out of the real capabilities.ts on the shape handed back here.
export async function resolveCourseAccess() { return globalThis.__SV.access; }
export { allowsTopic } from '${fileUrl('app/lib/capabilities.ts')}';
`);

STUBS.set('app/lib/curriculum-progress.ts', `
export async function syncCompletionSnapshot(studentId, courseId, topicId, options) {
  globalThis.__SV.snapshots.push({ studentId, courseId, topicId, options: options || {} });
}
`);

STUBS.set('app/lib/crisis-screen.ts', `
export async function screenStudentMessage() { return globalThis.__SV.screen; }
`);

// Everything real except the paid call. TEACHER_DEMO_TURNS, MAX_STUDENT_TURNS and
// PREVIEW_LIMIT_COPY come from the real module, so the cap under test is the one
// the app ships rather than a number this file made up.
STUBS.set('app/lib/gumu.ts', `
export * from '${fileUrl('app/lib/gumu.ts')}${REAL}';
export async function askGumu() {
  globalThis.__SV.askGumuCalls += 1;
  return { reply: { message: 'stub reply', found_own_mistake: false }, leaked: null, usedFallback: false };
}
`);

// ---------------------------------------------------------------------------
// Fault injection
//
// A fault rewrites one guard back to what it was before this change, at load
// time, so the "broken" build under test is the real route source minus the fix
// rather than a mock of it.
// ---------------------------------------------------------------------------

const FAULTS = {
  'writes-ungated': {
    file: 'app/api/curriculum/practice/route.ts',
    from: 'const recordsProgress = !access.viaTeacher;',
    to: 'const recordsProgress = true;',
  },
  'no-plan-gate': {
    file: 'app/api/gumu/session/route.ts',
    from: 'if (planDenied) return planDenied;',
    to: 'if (false) return planDenied;',
    all: true,
  },
  'no-demo-cap': {
    file: 'app/api/gumu/session/route.ts',
    from: 'if (!access.viaTeacher) return null;',
    to: 'if (true) return null;',
  },
  'lesson-ungated': {
    file: 'app/api/curriculum/progress/route.ts',
    from: 'if (access.viaTeacher) {',
    to: 'if (false) {',
  },
  'no-lesson-plan-gate': {
    file: 'app/api/curriculum/progress/route.ts',
    from: 'if (!allowsTopic(access, "curriculum", course_id, topic_id)) {',
    to: 'if (false) {',
  },
};

let activeFault = null;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (STUBS.has(specifier)) return { url: 'stub:' + specifier, shortCircuit: true };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith('stub:')) {
      return { format: 'module', source: STUBS.get(url.slice(5)), shortCircuit: true };
    }

    const clean = url.split('?')[0];
    const real = url.endsWith(REAL);

    // A repo file that has a stub registered under its repo-relative path.
    if (!real) {
      for (const [key, source] of STUBS) {
        if (key.startsWith('app/') && clean === fileUrl(key)) {
          return { format: 'module', source, shortCircuit: true };
        }
      }
    }

    const loaded = nextLoad(clean, context);

    if (activeFault && clean === fileUrl(activeFault.file)) {
      let source = String(loaded.source);
      const count = source.split(activeFault.from).length - 1;
      if (count === 0) {
        throw new Error(`fault "${activeFault.name}" found no match for: ${activeFault.from}`);
      }
      if (!activeFault.all && count !== 1) {
        throw new Error(`fault "${activeFault.name}" matched ${count} times, expected 1`);
      }
      source = source.split(activeFault.from).join(activeFault.to);
      return { ...loaded, source, shortCircuit: true };
    }

    return loaded;
  },
});

// Each import gets a unique query so the module is re-evaluated with whatever
// fault is active, rather than served from the registry as first loaded.
let build = 0;
async function loadRoute(file, faultName) {
  activeFault = faultName ? { ...FAULTS[faultName], name: faultName } : null;
  try {
    return await import(`${fileUrl(file)}?build=${build++}`);
  } finally {
    activeFault = null;
  }
}

const PRACTICE = 'app/api/curriculum/practice/route.ts';
const PROGRESS = 'app/api/curriculum/progress/route.ts';
const GUMU = 'app/api/gumu/session/route.ts';

function post(body) {
  return new Request('http://localhost/x', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify(body),
  });
}

const PRACTICE_BODY = {
  course_id: COURSE,
  topic_id: TOPIC,
  section: 'practice',
  item_number: 1,
  selected_answer: 'B',
};

const START_BODY = { action: 'start', ...PRACTICE_BODY };

// ---------------------------------------------------------------------------
// The scenarios
//
// Each returns the facts an assertion reads. Kept separate from the assertions
// so the SAME scenario can be run clean and faulted and the only difference is
// the build under it.
// ---------------------------------------------------------------------------

async function gradeAs(access, faultName) {
  reset({ access });
  const { POST } = await loadRoute(PRACTICE, faultName);
  const res = await POST(post(PRACTICE_BODY));
  return {
    status: res.status,
    body: await res.json(),
    attempts: insertsTo('curriculum_attempts'),
    snapshots: W.snapshots.length,
    misconceptions: rpcsNamed('record_misconception'),
  };
}

async function readLessonAs(access, faultName) {
  reset({ access });
  const { POST } = await loadRoute(PROGRESS, faultName);
  const res = await POST(post({ action: 'lesson_complete', course_id: COURSE, topic_id: TOPIC }));
  return { status: res.status, body: await res.json(), snapshots: W.snapshots.length };
}

async function startMuAs(access, { spent = 0, fault, topicId = TOPIC } = {}) {
  reset({ access });
  if (spent > 0) W.redis.set('mu:demo:u-1', spent);
  const { POST } = await loadRoute(GUMU, fault);
  const res = await POST(post({ ...START_BODY, topic_id: topicId }));
  return {
    status: res.status,
    body: await res.json(),
    sessions: insertsTo('gumu_sessions'),
    modelCalls: W.askGumuCalls,
  };
}

async function messageMuAs(access, { spent = 0, fault } = {}) {
  reset({ access });
  W.reads.gumu_sessions = {
    data: {
      id: SESSION_ID,
      student_id: 'u-1',
      course_id: COURSE,
      topic_id: TOPIC,
      section: 'practice',
      item_number: 1,
      original_selected_answer: 'B',
      misconception_tag: 'adds-instead-of-multiplies',
      status: 'active',
      turn_count: 0,
    },
    error: null,
  };
  if (spent > 0) W.redis.set('mu:demo:u-1', spent);
  const { POST } = await loadRoute(GUMU, fault);
  const res = await POST(post({ action: 'message', session_id: SESSION_ID, message: 'I added them' }));
  return {
    status: res.status,
    body: await res.json(),
    messages: insertsTo('gumu_messages'),
    modelCalls: W.askGumuCalls,
  };
}

// ---------------------------------------------------------------------------
// The lane
// ---------------------------------------------------------------------------

let failures = 0;
let untrusted = 0;

// An assertion is a function over the facts. It is run clean (must hold) and
// faulted (must NOT hold). A check that survives its own fault is untrusted and
// fails the run, because it is not measuring the thing it names.
async function prove(name, assertion, cleanRun, faultedRun, faultLabel) {
  const clean = await cleanRun();
  let cleanOk = true;
  let cleanWhy = '';
  try {
    assertion(clean);
  } catch (err) {
    cleanOk = false;
    cleanWhy = err.message;
  }

  const faulted = await faultedRun();
  let faultedOk = true;
  try {
    assertion(faulted);
  } catch {
    faultedOk = false;
  }

  if (!cleanOk) {
    failures += 1;
    console.log(`  [FAIL] ${name}`);
    console.log(`         ${cleanWhy}`);
    return;
  }
  if (faultedOk) {
    untrusted += 1;
    console.log(`  [UNTRUSTED] ${name}`);
    console.log(`         still passed against ${faultLabel}, so it proves nothing`);
    return;
  }
  console.log(`  [PASS] ${name}`);
  console.log(`         and FAILS against ${faultLabel}`);
}

function eq(actual, expected, what) {
  if (actual !== expected) {
    throw new Error(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

async function main() {
  const { TEACHER_DEMO_TURNS } = await import(`${fileUrl('app/lib/gumu.ts')}${REAL}`);

  console.log('\nB. Learner writes stop for a teacher in Student View');
  console.log('   app/api/curriculum/practice/route.ts\n');

  await prove(
    'a teacher grading an answer writes exactly 0 attempt rows, 0 snapshots, 0 misconceptions',
    (r) => {
      eq(r.attempts, 0, 'curriculum_attempts rows');
      eq(r.snapshots, 0, 'curriculum_completion snapshots');
      eq(r.misconceptions, 0, 'record_misconception calls');
    },
    () => gradeAs(ACCESS.teacher),
    () => gradeAs(ACCESS.teacher, 'writes-ungated'),
    'the pre-change guard (recordsProgress = true)'
  );

  await prove(
    'a Full Course student grading the SAME answer still writes exactly 1 of each',
    (r) => {
      eq(r.attempts, 1, 'curriculum_attempts rows');
      eq(r.snapshots, 1, 'curriculum_completion snapshots');
      eq(r.misconceptions, 1, 'record_misconception calls');
    },
    () => gradeAs(ACCESS.fullCourse),
    // The control cannot be broken by the fault, which restores the behaviour it
    // already has. Its sensitivity is proved by swapping the FIXTURE instead: the
    // same assertion run as a teacher has to fail, or "exactly 1" is measuring
    // nothing about who is asking.
    () => gradeAs(ACCESS.teacher),
    'the same assertion run as a teacher'
  );

  await prove(
    'a student in an entitled teacher class (derived, viaTeacher false) still writes 1',
    (r) => eq(r.attempts, 1, 'curriculum_attempts rows'),
    () => gradeAs(ACCESS.derivedTeacher),
    () => gradeAs(ACCESS.teacher),
    'the same assertion run as a teacher'
  );

  await prove(
    'the teacher still gets the tutor offered and the answer withheld',
    (r) => {
      eq(r.body.gumu_available, true, 'gumu_available');
      eq(r.body.correct_answer, null, 'correct_answer');
    },
    () => gradeAs(ACCESS.teacher),
    // Faulting the fixture to a plan with no gumu is what makes this sensitive:
    // if the assertion passed there too it would not be reading the tutor gate.
    () => gradeAs(ACCESS.freeTier),
    'a plan that does not hold gumu'
  );

  await prove(
    'a teacher reading a lesson stamps nothing (0 snapshots)',
    (r) => {
      eq(r.status, 200, 'status');
      eq(r.body.recorded, false, 'recorded');
      eq(r.snapshots, 0, 'curriculum_completion snapshots');
    },
    () => readLessonAs(ACCESS.teacher),
    () => readLessonAs(ACCESS.teacher, 'lesson-ungated'),
    'the preview guard removed'
  );

  await prove(
    'a Full Course student reading the same lesson still stamps exactly 1',
    (r) => {
      eq(r.body.recorded, true, 'recorded');
      eq(r.snapshots, 1, 'curriculum_completion snapshots');
      eq(r.body.lessonCompleted, undefined, 'body carries no gate state');
    },
    () => readLessonAs(ACCESS.fullCourse),
    () => readLessonAs(ACCESS.teacher),
    'the same assertion run as a teacher'
  );

  await prove(
    'the lesson stamp now refuses a plan that does not open the topic (403)',
    (r) => {
      eq(r.status, 403, 'status');
      eq(r.snapshots, 0, 'curriculum_completion snapshots');
    },
    () => readLessonAs(ACCESS.freeTier),
    () => readLessonAs(ACCESS.freeTier, 'no-lesson-plan-gate'),
    'the pre-change route (no capability check at all)'
  );

  await prove(
    'and an anonymous caller still gets the documented 200, not the new 403',
    (r) => {
      eq(r.status, 200, 'status');
      eq(r.body.recorded, false, 'recorded');
    },
    async () => {
      reset({ access: ACCESS.freeTier, session: null });
      const { POST } = await loadRoute(PROGRESS);
      const res = await POST(post({ action: 'lesson_complete', course_id: COURSE, topic_id: TOPIC }));
      return { status: res.status, body: await res.json(), snapshots: W.snapshots.length };
    },
    // Faulted by giving the same caller a session: the signed-in ungated case is
    // the one that must 403, so an assertion that passed there too would not be
    // reading the anonymous branch at all.
    () => readLessonAs(ACCESS.freeTier),
    'the same caller signed in'
  );

  console.log('\nC. Mu is gated by plan, and bounded for a teacher');
  console.log('   app/api/gumu/session/route.ts\n');

  await prove(
    'a free-tier account cannot open a Mu session (403)',
    (r) => {
      eq(r.status, 403, 'status');
      eq(r.sessions, 0, 'gumu_sessions rows');
      eq(r.modelCalls, 0, 'paid model calls');
    },
    () => startMuAs(ACCESS.freeTier),
    () => startMuAs(ACCESS.freeTier, { fault: 'no-plan-gate' }),
    'the pre-change route (no plan gate at all)'
  );

  await prove(
    'a Practice Pass account cannot open a Mu session (403)',
    (r) => {
      eq(r.status, 403, 'status');
      eq(r.modelCalls, 0, 'paid model calls');
    },
    () => startMuAs(ACCESS.practicePass),
    () => startMuAs(ACCESS.practicePass, { fault: 'no-plan-gate' }),
    'the pre-change route (no plan gate at all)'
  );

  await prove(
    'the free SAMPLE topic does not open Mu either (the sample grants curriculum, never gumu)',
    (r) => eq(r.status, 403, 'status'),
    () => startMuAs(ACCESS.freeTier, { topicId: 'AR.1.4' }),
    () => startMuAs(ACCESS.freeTier, { topicId: 'AR.1.4', fault: 'no-plan-gate' }),
    'the pre-change route (no plan gate at all)'
  );

  await prove(
    `a teacher is refused Mu once ${TEACHER_DEMO_TURNS} demo turns are spent, with no model call`,
    (r) => {
      eq(r.status, 200, 'status');
      eq(r.body.stopped, 'preview_limit', 'stopped');
      eq(r.modelCalls, 0, 'paid model calls');
      eq(r.sessions, 0, 'gumu_sessions rows');
    },
    () => startMuAs(ACCESS.teacher, { spent: TEACHER_DEMO_TURNS }),
    () => startMuAs(ACCESS.teacher, { spent: TEACHER_DEMO_TURNS, fault: 'no-demo-cap' }),
    'the cap removed (spendDemoTurn always allows)'
  );

  await prove(
    `a Full Course student at the same count of ${TEACHER_DEMO_TURNS} is still served`,
    (r) => {
      eq(r.status, 200, 'status');
      eq(r.body.stopped, undefined, 'stopped');
      eq(r.modelCalls, 1, 'paid model calls');
      eq(r.body.session_id, SESSION_ID, 'session_id');
    },
    () => startMuAs(ACCESS.fullCourse, { spent: TEACHER_DEMO_TURNS }),
    // Sensitivity again by fixture: the identical count as a TEACHER has to stop.
    () => startMuAs(ACCESS.teacher, { spent: TEACHER_DEMO_TURNS }),
    'the same count run as a teacher'
  );

  await prove(
    `a teacher's ${TEACHER_DEMO_TURNS} turns are spent one per model call and the ${TEACHER_DEMO_TURNS}th still works`,
    (r) => {
      eq(r.status, 200, 'status');
      eq(r.body.stopped, undefined, 'stopped');
      eq(r.modelCalls, 1, 'paid model calls');
    },
    () => startMuAs(ACCESS.teacher, { spent: TEACHER_DEMO_TURNS - 1 }),
    () => startMuAs(ACCESS.teacher, { spent: TEACHER_DEMO_TURNS }),
    'one more turn already spent'
  );

  await prove(
    'the message path is capped too, and writes no transcript when it refuses',
    (r) => {
      eq(r.status, 200, 'status');
      eq(r.body.stopped, 'preview_limit', 'stopped');
      eq(r.modelCalls, 0, 'paid model calls');
      eq(r.messages, 0, 'gumu_messages rows');
    },
    () => messageMuAs(ACCESS.teacher, { spent: TEACHER_DEMO_TURNS }),
    () => messageMuAs(ACCESS.teacher, { spent: TEACHER_DEMO_TURNS, fault: 'no-demo-cap' }),
    'the cap removed (spendDemoTurn always allows)'
  );

  await prove(
    'a student on the message path is untouched by the cap',
    (r) => {
      eq(r.body.stopped, undefined, 'stopped');
      eq(r.modelCalls, 1, 'paid model calls');
    },
    () => messageMuAs(ACCESS.fullCourse, { spent: TEACHER_DEMO_TURNS }),
    () => messageMuAs(ACCESS.teacher, { spent: TEACHER_DEMO_TURNS }),
    'the same count run as a teacher'
  );

  console.log('\nC2. The lifetime counter itself (real consumeLifetimeQuota)');
  console.log('    app/lib/rate-limit.ts\n');

  const { consumeLifetimeQuota } = await import(fileUrl('app/lib/rate-limit.ts'));

  // Runs the counter cap+3 times and reports how many were granted. The scenario
  // is shared by both checks below; only the world it runs in differs.
  const drain = async () => {
    const granted = [];
    for (let i = 0; i < TEACHER_DEMO_TURNS + 3; i += 1) {
      granted.push((await consumeLifetimeQuota('mu:demo:u-1', TEACHER_DEMO_TURNS)).allowed);
    }
    return { granted: granted.filter(Boolean).length };
  };

  await prove(
    `the counter grants exactly ${TEACHER_DEMO_TURNS} and never refreshes`,
    (r) => eq(r.granted, TEACHER_DEMO_TURNS, 'turns granted'),
    async () => { reset(); return drain(); },
    // Faulted by giving the same key a fresh counter every call, which is what a
    // per-session cap would do and is exactly the mistake this constant exists to
    // avoid. Under it the drain grants every attempt.
    async () => {
      reset();
      const granted = [];
      for (let i = 0; i < TEACHER_DEMO_TURNS + 3; i += 1) {
        W.redis = new Map();
        granted.push((await consumeLifetimeQuota('mu:demo:u-1', TEACHER_DEMO_TURNS)).allowed);
      }
      return { granted: granted.filter(Boolean).length };
    },
    'a counter that resets between calls (a per-session cap)'
  );

  await prove(
    'the counter fails CLOSED when Upstash is unreachable',
    (r) => eq(r.granted, 0, 'turns granted'),
    async () => { reset({ redisThrow: true }); return drain(); },
    // The fault is simply a working Redis: if the assertion passed there too it
    // would not be reading the outage branch at all.
    async () => { reset(); return drain(); },
    'a reachable Upstash'
  );

  console.log('');
  if (failures || untrusted) {
    console.log(`FAILED: ${failures} assertion(s) failed, ${untrusted} untrusted.`);
    process.exit(1);
  }
  console.log('All checks passed, and every one of them was shown to fail against a faulted build.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
