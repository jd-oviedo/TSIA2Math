// faultproof_tripwire_upgrade.mjs -- prove /upgrade?plan=tripwire routes every
// kind of visitor correctly, and prove each check can go red.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/faultproof_tripwire_upgrade.mjs
//
// WHAT RUNS. The real GET handler in app/upgrade/route.ts, the real
// resolveCourseAccess, the real isEntitledWithLegacyFallback, accessGraceMs and
// planGrants, and the real NextResponse. Only the two Supabase client factories
// are replaced, by a resolve hook that swaps app/lib/supabase-server.ts and
// app/lib/supabase-admin.ts for in-memory fakes fed from this file.
//
// WHAT NEVER RUNS. No Supabase client is constructed, no cookie store is read,
// globalThis.fetch throws, and the Supabase and Stripe variables are deleted
// from the environment before anything loads. The route makes no Stripe call
// by design (faultproof_upgrade_slugs.mjs asserts that separately). Zero prod
// reads and zero Stripe calls are properties of the setup, not a claim.
//
// THE SELLABLE STATE IS WHAT IS TESTED. The tripwire URL is read out of the
// route's own table. While it was the PASTE_THE_ placeholder the route refused
// the slug, so the clean module was asserted to bounce to /pricing and every
// routing property ran on a copy with a fake sellable link swapped in. Now the
// real link is pasted, the clean module IS the sellable state and is tested
// as-is; the placeholder branch stays so the harness keeps working if a row
// ever ships unpasted again.
//
// RED THEN GREEN. Each property is asserted on the pasted module and then on a
// MUTANT of it carrying one deliberate fault. The check must FAIL on the
// mutant. Each needle must appear exactly once, so a refactor cannot turn a
// mutant into a copy of the original.

import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { registerHooks } from 'node:module';
import { pathToFileURL } from 'url';

for (const k of [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
]) {
  delete process.env[k];
}

let fetchCalls = 0;
globalThis.fetch = async (...args) => {
  fetchCalls += 1;
  throw new Error(`network call attempted: ${String(args[0])}`);
};

// ---------------------------------------------------------------------------
// The fakes, and the hook that puts them where the route expects the real thing
// ---------------------------------------------------------------------------

// One mutable world the fakes read from. Replaced per scenario.
const world = { user: null, profiles: [], enrollments: [], failProfileRead: false };
globalThis.__faultproofUpgradeWorld = world;

let adminConstructions = 0;
globalThis.__faultproofAdminConstructed = () => {
  adminConstructions += 1;
};

const SERVER_FAKE = `
export async function createClient() {
  const w = globalThis.__faultproofUpgradeWorld;
  return {
    auth: {
      async getUser() { return { data: { user: w.user }, error: null }; },
      async getSession() { return { data: { session: w.user ? { user: w.user } : null }, error: null }; },
    },
  };
}
`;

const ADMIN_FAKE = `
class Query {
  constructor(w, table) { this.w = w; this.table = table; this.filters = []; }
  select(cols) {
    if (typeof cols !== 'string' || cols.length === 0) throw new Error('fake admin: select() needs explicit columns');
    this.cols = cols;
    return this;
  }
  eq(col, v) { this.filters.push((r) => r[col] === v); return this; }
  in(col, vs) { this.filters.push((r) => vs.includes(r[col])); return this; }
  rows() {
    if (this.table === 'profiles' && this.w.failProfileRead) {
      return { data: null, error: { message: 'fake admin: forced read failure' } };
    }
    const src = this.table === 'profiles' ? this.w.profiles : this.w.enrollments;
    const rows = src.filter((r) => this.filters.every((f) => f(r))).map((r) => ({ ...r }));
    return { data: rows, error: null };
  }
  async maybeSingle() {
    const { data, error } = this.rows();
    if (error) return { data: null, error };
    if (data.length > 1) return { data: null, error: { message: 'more than one row' } };
    return { data: data[0] ?? null, error: null };
  }
  async single() {
    const { data, error } = this.rows();
    if (error) return { data: null, error };
    if (data.length !== 1) return { data: null, error: { message: 'expected exactly one row' } };
    return { data: data[0], error: null };
  }
  then(resolve, reject) { try { resolve(this.rows()); } catch (e) { reject(e); } }
}
export function createAdminClient() {
  globalThis.__faultproofAdminConstructed();
  const w = globalThis.__faultproofUpgradeWorld;
  return {
    from(table) {
      if (table !== 'profiles' && table !== 'class_enrollments') throw new Error('fake admin: unknown table ' + table);
      return new Query(w, table);
    },
  };
}
`;

// course-access.ts wraps its resolver in React's cache(), and the react package
// on disk is the 18.3 CommonJS build, which Node's ESM loader cannot read a
// named `cache` from (Next bundles its own React and never hits this). Outside
// a render React's cache() is a pass-through, which is exactly what this is.
const REACT_FAKE = `
export const cache = (fn) => fn;
export default { cache };
`;

const dataUrl = (src) => `data:text/javascript,${encodeURIComponent(src)}`;

registerHooks({
  resolve(specifier, context, nextResolve) {
    // Node needs the extension Next's package exports do not require of a bundler.
    if (specifier === 'next/server') return nextResolve('next/server.js', context);
    // Scoped to this repo's own modules: next/server.js requires react
    // internally through CommonJS, which must keep reaching the real package.
    if (specifier === 'react' && /\/app\/lib\/course-access\.ts$/.test(context.parentURL ?? '')) {
      return { url: dataUrl(REACT_FAKE), shortCircuit: true };
    }
    const r = nextResolve(specifier, context);
    if (r.url.endsWith('/app/lib/supabase-server.ts')) return { url: dataUrl(SERVER_FAKE), shortCircuit: true };
    if (r.url.endsWith('/app/lib/supabase-admin.ts')) return { url: dataUrl(ADMIN_FAKE), shortCircuit: true };
    return r;
  },
});

// ---------------------------------------------------------------------------
// Loading the route: clean, pasted, and mutants of pasted
// ---------------------------------------------------------------------------

const ROUTE_PATH = 'app/upgrade/route.ts';
const CLEAN = readFileSync(ROUTE_PATH, 'utf8');

const tripwireRow = /"tripwire":\s*\{\s*url:\s*"([^"]+)"/.exec(CLEAN);
if (!tripwireRow) throw new Error('could not find the tripwire row in the route');
const SHIPPED_URL = tripwireRow[1];
const UNPASTED = SHIPPED_URL.includes('PASTE_THE_');
const FAKE_TRIPWIRE_URL = UNPASTED
  ? 'https://buy.stripe.com/test_FAULTPROOF_TRIPWIRE_NOT_A_LINK'
  : SHIPPED_URL;
if (CLEAN.split(SHIPPED_URL).length - 1 !== 1) {
  throw new Error('expected the tripwire URL exactly once in the route');
}
const PASTED = UNPASTED ? CLEAN.replace(SHIPPED_URL, FAKE_TRIPWIRE_URL) : CLEAN;

let loadCounter = 0;
function purgeTempModules() {
  for (const name of readdirSync('app/upgrade')) {
    if (name.startsWith('__faultproof_tw_')) unlinkSync(`app/upgrade/${name}`);
  }
}
async function loadSource(src) {
  const path = `app/upgrade/__faultproof_tw_${process.pid}_${loadCounter++}.ts`;
  writeFileSync(path, src);
  try {
    return await import(pathToFileURL(path).href);
  } finally {
    unlinkSync(path);
  }
}
async function loadMutant(needle, replacement) {
  const count = PASTED.split(needle).length - 1;
  if (count !== 1) {
    throw new Error(`mutation needle must appear exactly once, found ${count}: ${needle}`);
  }
  return loadSource(PASTED.replace(needle, replacement));
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;
const iso = (offsetDays) => new Date(NOW + offsetDays * DAY).toISOString();

const { TRIPWIRE_PAYMENT_LINK_ID } = await import('@/app/lib/products');
const FULL_COURSE_LINK = 'plink_1U5tgXF8f8aZDGVANGvtkoMF';
const PRACTICE_PASS_LINK = 'plink_1U5tejF8f8aZDGVAKbnefl6Z';

const STUDENT = { id: 'student-0000-0000-0000-000000000001', email: 'student@example.com' };
const TEACHER_ID = 'teacher-0000-0000-0000-000000000001';

function row(over) {
  return {
    id: STUDENT.id,
    role: 'student',
    plan: null,
    plan_status: null,
    access_until: null,
    stripe_payment_link_id: null,
    subscription_status: 'inactive',
    ...over,
  };
}

const SCENARIOS = {
  anonymous: () => ({ user: null, profiles: [], enrollments: [] }),
  'free student': () => ({ user: STUDENT, profiles: [row({})], enrollments: [] }),
  'active full course': () => ({
    user: STUDENT,
    profiles: [row({ plan: 'full-course', plan_status: 'active', access_until: iso(300), stripe_payment_link_id: FULL_COURSE_LINK, subscription_status: 'active' })],
    enrollments: [],
  }),
  'active practice pass': () => ({
    user: STUDENT,
    profiles: [row({ plan: 'practice-pass', plan_status: 'active', access_until: iso(150), stripe_payment_link_id: PRACTICE_PASS_LINK, subscription_status: 'active' })],
    enrollments: [],
  }),
  'entitled teacher': () => ({
    user: STUDENT,
    profiles: [row({ role: 'teacher', plan: 'teacher-pro', plan_status: 'active', access_until: iso(20), subscription_status: 'active' })],
    enrollments: [],
  }),
  'teacher-covered student': () => ({
    user: STUDENT,
    profiles: [
      row({}),
      { id: TEACHER_ID, role: 'teacher', plan: 'teacher-core', plan_status: 'active', access_until: iso(20), stripe_payment_link_id: null, subscription_status: 'active' },
    ],
    enrollments: [{ student_id: STUDENT.id, status: 'active', classes: { teacher_id: TEACHER_ID, archived_at: null } }],
  }),
  // The production shape of a lapsed tripwire: nothing in the app ever writes
  // plan_status 'expired', so the row keeps 'active' with access_until in the
  // past. Zero grace on this link is what makes it "lapsed" at all.
  'lapsed tripwire': () => ({
    user: STUDENT,
    profiles: [row({ plan: 'full-course', plan_status: 'active', access_until: iso(-1), stripe_payment_link_id: TRIPWIRE_PAYMENT_LINK_ID, subscription_status: 'inactive' })],
    enrollments: [],
  }),
  'legacy row (no plan, subscription_status active)': () => ({
    user: STUDENT,
    profiles: [row({ subscription_status: 'active' })],
    enrollments: [],
  }),
};

function setWorld(name) {
  const w = SCENARIOS[name]();
  world.user = w.user;
  world.profiles = w.profiles;
  world.enrollments = w.enrollments;
  world.failProfileRead = false;
}

const quiet = async (fn) => {
  const err = console.error, warn = console.warn;
  console.error = () => {};
  console.warn = () => {};
  try { return await fn(); } finally { console.error = err; console.warn = warn; }
};

async function hit(mod, scenario, slug = 'tripwire') {
  setWorld(scenario);
  const req = new Request(`https://app.unpackmath.com/upgrade?plan=${slug}`);
  const res = await quiet(() => mod.GET(req));
  return { status: res.status, location: res.headers.get('location') ?? '' };
}

const isPayForward = (r) => r.location.startsWith(FAKE_TRIPWIRE_URL);
const has = (r, needle) => r.location.includes(needle);

// ---------------------------------------------------------------------------
// Properties. Each returns null when it holds and a reason when it fails.
// ---------------------------------------------------------------------------

async function checkFullCourseBlocked(mod) {
  const r = await hit(mod, 'active full course');
  if (isPayForward(r)) return `forwarded to pay: ${r.location}`;
  if (!has(r, '/dashboard?upgrade=held')) return `unexpected destination ${r.location}`;
  return null;
}

async function checkPracticePassBlocked(mod) {
  const r = await hit(mod, 'active practice pass');
  if (isPayForward(r)) return `Practice Pass holder forwarded to pay: ${r.location}`;
  if (!has(r, '/dashboard?upgrade=held')) return `unexpected destination ${r.location}`;
  return null;
}

async function checkTeacherToDashboard(mod) {
  const r = await hit(mod, 'entitled teacher');
  if (isPayForward(r)) return `teacher forwarded to pay: ${r.location}`;
  if (!/\/teacher$/.test(r.location)) return `unexpected destination ${r.location}`;
  return null;
}

async function checkCoveredStudentTold(mod) {
  const r = await hit(mod, 'teacher-covered student');
  if (isPayForward(r)) return `class-covered student forwarded to pay: ${r.location}`;
  if (!has(r, '/dashboard?upgrade=class')) return `unexpected destination ${r.location}`;
  return null;
}

async function checkLapsedTripwireAllowed(mod) {
  const r = await hit(mod, 'lapsed tripwire');
  if (!isPayForward(r)) return `lapsed holder was held: ${r.location}`;
  return null;
}

async function checkFreeStudentForwarded(mod) {
  const r = await hit(mod, 'free student');
  if (!isPayForward(r)) return `not forwarded: ${r.location}`;
  const u = new URL(r.location);
  if (u.searchParams.get('client_reference_id') !== STUDENT.id) return 'client_reference_id missing';
  if (u.searchParams.get('prefilled_email') !== STUDENT.email) return 'prefilled_email missing';
  return null;
}

async function checkAnonymousSignsInFirst(mod) {
  const r = await hit(mod, 'anonymous');
  if (isPayForward(r)) return `anonymous forwarded straight to the link: ${r.location}`;
  const u = new URL(r.location);
  if (u.pathname !== '/login') return `unexpected destination ${r.location}`;
  if (u.searchParams.get('next') !== '/upgrade?plan=tripwire') return `next is ${u.searchParams.get('next')}`;
  if (u.searchParams.get('role') !== 'student') return `role is ${u.searchParams.get('role')}`;
  return null;
}

async function checkExtras(mod) {
  // A legacy row with no plan is live under the fallback and must be held.
  const legacy = await hit(mod, 'legacy row (no plan, subscription_status active)');
  if (isPayForward(legacy)) return `legacy row forwarded to pay: ${legacy.location}`;

  // The guard is tripwire-only: the same Full Course holder is forwarded on the
  // $89 slug exactly as before this change.
  const other = await hit(mod, 'active full course', 'full-course');
  if (!other.location.startsWith('https://buy.stripe.com/3cI4gz5J6aTOeml7nh7AI05')) {
    return `full-course slug no longer forwards a holder: ${other.location}`;
  }

  // A profile read that errors fails open to the forward, like the shortening
  // guard, because the webhook guard still stands behind this one.
  setWorld('active full course');
  world.failProfileRead = true;
  const res = await quiet(() => mod.GET(new Request('https://app.unpackmath.com/upgrade?plan=tripwire')));
  world.failProfileRead = false;
  const loc = res.headers.get('location') ?? '';
  if (!loc.startsWith(FAKE_TRIPWIRE_URL)) return `read error did not fail open: ${loc}`;
  return null;
}

const PROPERTIES = [
  {
    name: 'active Full Course holder is held to /dashboard',
    check: checkFullCourseBlocked,
    mutants: [
      {
        label: 'guard never called',
        needle: 'if (plan === TRIPWIRE_SLUG) {',
        replacement: 'if (plan === "never") {',
      },
    ],
  },
  {
    name: 'active Practice Pass holder is held (the case planGrants would miss)',
    check: checkPracticePassBlocked,
    mutants: [
      {
        label: 'predicate downgraded to planGrants(plan, "curriculum")',
        needle: 'if (ownLive) {',
        replacement: 'if (planGrants(row.plan, "curriculum") && ownLive) {',
      },
    ],
  },
  {
    name: 'entitled teacher is sent to /teacher, not to pay',
    check: checkTeacherToDashboard,
    mutants: [
      {
        label: 'teacher destination collapsed onto the student one',
        needle: 'return teacher ? "/teacher" : "/dashboard?upgrade=held";',
        replacement: 'return "/dashboard?upgrade=held";',
      },
    ],
  },
  {
    name: 'teacher-covered student is told, not sold',
    check: checkCoveredStudentTold,
    mutants: [
      {
        label: 'third door removed',
        needle: 'if (access.curriculum) return "/dashboard?upgrade=class";',
        replacement: 'if (false) return "/dashboard?upgrade=class";',
      },
    ],
  },
  {
    name: 'lapsed tripwire holder may buy again',
    check: checkLapsedTripwireAllowed,
    mutants: [
      {
        label: 'link id dropped from the predicate, so three days of grace hold a seven-day pass',
        needle: '      row.stripe_payment_link_id,\n      row.subscription_status,\n      "upgrade tripwire guard"',
        replacement: '      null,\n      row.subscription_status,\n      "upgrade tripwire guard"',
      },
    ],
  },
  {
    name: 'free signed-in student is forwarded with client_reference_id',
    check: checkFreeStudentForwarded,
    mutants: [
      {
        label: 'client_reference_id no longer attached',
        needle: 'paymentLink.searchParams.set("client_reference_id", user.id);',
        replacement: '',
      },
    ],
  },
  {
    name: 'anonymous visitor signs in first, never a raw-link forward',
    check: checkAnonymousSignsInFirst,
    mutants: [
      {
        label: 'anonymous forwarded straight to the Payment Link',
        needle: '  if (!user) {\n',
        replacement: '  if (!user) return NextResponse.redirect(product.url);\n  if (false) {\n',
      },
    ],
  },
  { name: 'extras (legacy row held, $89 slug unguarded, read error fails open)', check: checkExtras, mutants: [] },
];

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

let failures = 0;
const lines = [];
function report(ok, text) {
  lines.push(`${ok ? 'PASS' : 'FAIL'}  ${text}`);
  if (!ok) failures += 1;
}

purgeTempModules();
try {
  // The shipped state. Unpasted: slug refused, nothing sellable. Pasted: the
  // slug is sellable and no visitor is bounced to /pricing.
  const clean = await loadSource(CLEAN);
  for (const scenario of ['anonymous', 'free student', 'active full course']) {
    const r = await hit(clean, scenario);
    const bounced = r.location === 'https://unpackmath.com/pricing';
    report(
      UNPASTED ? bounced : !bounced,
      UNPASTED
        ? `shipped placeholder: ${scenario} on ?plan=tripwire bounces to /pricing (${r.location})`
        : `shipped real link: ${scenario} on ?plan=tripwire is not bounced to /pricing (${r.location})`
    );
  }
  report(!UNPASTED, `the shipped tripwire URL is a real link, not a placeholder (${SHIPPED_URL})`);

  const pasted = await loadSource(PASTED);
  for (const prop of PROPERTIES) {
    const reason = await prop.check(pasted);
    report(reason === null, `${prop.name}: green on the pasted module${reason ? ` (${reason})` : ''}`);
    for (const m of prop.mutants) {
      const mutant = await loadMutant(m.needle, m.replacement);
      const mutantReason = await prop.check(mutant);
      report(
        mutantReason !== null,
        `${prop.name}: RED on mutant "${m.label}"${mutantReason ? `: ${mutantReason}` : ' (mutant passed, check is blind)'}`
      );
    }
  }
} finally {
  purgeTempModules();
}

report(fetchCalls === 0, `no network: fetch was called ${fetchCalls} times`);
report(adminConstructions > 0, `the fake admin client was the one constructed (${adminConstructions} times)`);
report(
  !process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.STRIPE_SECRET_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL,
  'no Supabase or Stripe credentials in the environment'
);

console.log(lines.join('\n'));
console.log(`\n${failures === 0 ? 'ALL GREEN' : `${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
