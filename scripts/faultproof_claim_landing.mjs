// faultproof_claim_landing.mjs -- prove /claim lands each buyer state where it
// should, prove the pending lookup still runs first and wins, and prove each
// check can go red.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/faultproof_claim_landing.mjs
//
// WHAT RUNS. The real ClaimPage server component in app/claim/page.tsx, the
// real claimPending, claimOne, writeEntitlement, isEntitledWithLegacyFallback
// and destinationFor, over an in-memory database. The page is TypeScript with
// JSX, which Node cannot parse on its own, so a load hook transpiles .tsx
// through the repo's own TypeScript with the same react-jsx setting tsconfig
// uses. The rendered element is inspected, not painted.
//
// WHAT NEVER RUNS. No Supabase client, no Redis, no Stripe, no network:
// globalThis.fetch throws, the credentials are deleted from the environment
// before anything loads, and the three modules that would construct a client
// at import time (supabase-server, supabase-admin, rate-limit) are replaced by
// fakes through a resolve hook. next/navigation's redirect is replaced by one
// that throws a marker, which is what the real one does too.
//
// RED THEN GREEN. Every property is asserted on the real module and then on a
// MUTANT carrying one deliberate fault; the check must fail on the mutant.
// Each needle must appear exactly once.

import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { registerHooks } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'url';
import ts from 'typescript';

for (const k of [
  'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN',
  'RESEND_API_KEY',
]) delete process.env[k];

let fetchCalls = 0;
globalThis.fetch = async (...a) => { fetchCalls += 1; throw new Error(`network call attempted: ${String(a[0])}`); };

// ---------------------------------------------------------------------------
// The world the fakes read, and the fakes
// ---------------------------------------------------------------------------

const world = { user: null, profiles: [], pending: [], log: [] };
globalThis.__claimWorld = world;

const SERVER_FAKE = `
export async function createClient() {
  const w = globalThis.__claimWorld;
  return { auth: { async getUser() { return { data: { user: w.user }, error: null }; },
                   async getSession() { return { data: { session: w.user ? { user: w.user } : null }, error: null }; } } };
}`;

// A small PostgREST-shaped builder over two tables. Enough of the grammar for
// claimPending, claimOne, linkCustomerId and writeEntitlement, and it throws
// on anything else so a new call cannot pass by accident.
const ADMIN_FAKE = `
function matchOr(expr) {
  return (row) => expr.split(',').some((clause) => {
    const [col, op, ...rest] = clause.split('.');
    const val = rest.join('.');
    if (op === 'is' && val === 'null') return row[col] == null;
    if (op === 'lt') return row[col] != null && row[col] < val;
    if (op === 'eq') return row[col] === val;
    throw new Error('fake admin: unmodelled or() clause ' + clause);
  });
}
class Q {
  constructor(w, table) { this.w = w; this.table = table; this.filters = []; this.mode = 'select'; this.patch = null; this.orderBy = null; this.wantSelect = false; }
  select(cols) { if (this.mode === 'select' && typeof cols !== 'string') throw new Error('fake admin: select needs columns'); this.wantSelect = true; return this; }
  update(patch) { this.mode = 'update'; this.patch = patch; return this; }
  upsert() { throw new Error('fake admin: upsert not expected on this path'); }
  eq(c, v) { this.filters.push((r) => r[c] === v); return this; }
  is(c, v) { this.filters.push((r) => v === null ? r[c] == null : r[c] === v); return this; }
  in(c, vs) { this.filters.push((r) => vs.includes(r[c])); return this; }
  or(expr) { this.filters.push(matchOr(expr)); return this; }
  order(c, { ascending }) { this.orderBy = { c, ascending }; return this; }
  rows() { return this.w[this.table === 'profiles' ? 'profiles' : 'pending'].filter((r) => this.filters.every((f) => f(r))); }
  run() {
    this.w.log.push({ table: this.table, mode: this.mode });
    const hits = this.rows();
    if (this.mode === 'update') { for (const r of hits) Object.assign(r, this.patch); }
    let out = hits.map((r) => ({ ...r }));
    if (this.orderBy) out.sort((a, b) => (a[this.orderBy.c] < b[this.orderBy.c] ? -1 : 1) * (this.orderBy.ascending ? 1 : -1));
    return { data: out, error: null };
  }
  async maybeSingle() { const { data } = this.run(); if (data.length > 1) return { data: null, error: { message: 'many rows' } }; return { data: data[0] ?? null, error: null }; }
  async single() { const { data } = this.run(); if (data.length !== 1) return { data: null, error: { message: 'expected one row' } }; return { data: data[0], error: null }; }
  then(res, rej) { try { res(this.run()); } catch (e) { rej(e); } }
}
export function createAdminClient() {
  const w = globalThis.__claimWorld;
  return { from(t) { if (t !== 'profiles' && t !== 'pending_entitlements') throw new Error('fake admin: unknown table ' + t); return new Q(w, t); } };
}`;

const RATE_LIMIT_FAKE = `
export const claimRateLimit = { name: 'fake' };
export async function safeLimit() { return { success: true, reset: 0 }; }`;

// The real one throws a NEXT_REDIRECT error the framework catches. Same shape:
// throw, and let the harness catch it.
const NAVIGATION_FAKE = `
export function redirect(url) { const e = new Error('REDIRECT'); e.redirectTo = url; throw e; }`;
const LINK_FAKE = `export default function Link(props) { return props; }`;
const BROWSER_SUPABASE_FAKE = `export const supabase = { auth: { async signInWithOAuth() { throw new Error('not in harness'); } } };`;
const EMAIL_FAKE = `export async function alertUnlinkedCustomer() {} export function claimUrlFor(id) { return '/claim?checkout_session_id=' + id; }`;

const dataUrl = (src) => `data:text/javascript,${encodeURIComponent(src)}`;
const ROOT = fileURLToPath(new URL('..', import.meta.url));

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'next/navigation') return { url: dataUrl(NAVIGATION_FAKE), shortCircuit: true };
    if (specifier === 'next/link') return { url: dataUrl(LINK_FAKE), shortCircuit: true };
    const r = nextResolve(specifier, context);
    const u = r.url;
    if (u.endsWith('/app/lib/supabase-server.ts')) return { url: dataUrl(SERVER_FAKE), shortCircuit: true };
    if (u.endsWith('/app/lib/supabase-admin.ts')) return { url: dataUrl(ADMIN_FAKE), shortCircuit: true };
    if (u.endsWith('/app/lib/rate-limit.ts')) return { url: dataUrl(RATE_LIMIT_FAKE), shortCircuit: true };
    if (u.endsWith('/app/lib/supabase.ts')) return { url: dataUrl(BROWSER_SUPABASE_FAKE), shortCircuit: true };
    if (u.endsWith('/app/lib/email.ts')) return { url: dataUrl(EMAIL_FAKE), shortCircuit: true };
    return r;
  },
  load(url, context, nextLoad) {
    if (url.startsWith('file:') && url.endsWith('.tsx')) {
      const src = readFileSync(fileURLToPath(url), 'utf8');
      const { outputText } = ts.transpileModule(src, {
        fileName: fileURLToPath(url),
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      });
      return { format: 'module', source: outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});

// ---------------------------------------------------------------------------
// Loading the page: real and mutants
// ---------------------------------------------------------------------------

const PAGE_PATH = 'app/claim/page.tsx';
const SOURCE = readFileSync(PAGE_PATH, 'utf8');
let loadCounter = 0;
function purgeTemp() { for (const n of readdirSync('app/claim')) if (n.startsWith('__faultproof_cl_')) unlinkSync(`app/claim/${n}`); }
async function loadSource(src) {
  const path = `app/claim/__faultproof_cl_${process.pid}_${loadCounter++}.tsx`;
  writeFileSync(path, src);
  try { return await import(pathToFileURL(path).href); } finally { unlinkSync(path); }
}
async function loadMutant(needle, replacement) {
  const n = SOURCE.split(needle).length - 1;
  if (n !== 1) throw new Error(`needle must appear exactly once, found ${n}: ${needle}`);
  return loadSource(SOURCE.replace(needle, replacement));
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

const NOW = Date.now();
const DAY = 86400000;
const iso = (d) => new Date(NOW + d * DAY).toISOString();
const { TRIPWIRE_PAYMENT_LINK_ID } = await import('@/app/lib/products');
const PRACTICE_PASS_LINK = 'plink_1U5tejF8f8aZDGVAKbnefl6Z';

const USER = { id: 'user-0000-0000-0000-000000000001', email: 'buyer@example.com' };
const SESSION = 'cs_test_FAULTPROOF_NOT_A_REAL_SESSION';

const profile = (over = {}) => ({
  id: USER.id, role: 'student', plan: null, plan_term: null, plan_status: null, access_until: null,
  stripe_payment_link_id: null, subscription_status: 'inactive', plan_source: null, plan_updated_at: null,
  stripe_customer_id: null, ...over,
});
const pendingRow = (over = {}) => ({
  id: 'pe-1', email: 'other@example.com', plan: 'full-course', plan_term: 'one-time', plan_status: 'active',
  access_until: iso(7), plan_source: 'stripe', stripe_payment_link_id: TRIPWIRE_PAYMENT_LINK_ID,
  stripe_customer_id: 'cus_FAULTPROOF', event_created_at: new Date(NOW - 60000).toISOString(),
  checkout_session_id: SESSION, claimed_at: null, ...over,
});

const SCENARIOS = {
  'a: signed in, tripwire already applied, no pending row': () => ({
    user: USER, pending: [],
    profiles: [profile({ plan: 'full-course', plan_status: 'active', access_until: iso(6), stripe_payment_link_id: TRIPWIRE_PAYMENT_LINK_ID, subscription_status: 'active' })],
  }),
  'a-pp: signed in, Practice Pass applied, no pending row': () => ({
    user: USER, pending: [],
    profiles: [profile({ plan: 'practice-pass', plan_status: 'active', access_until: iso(150), stripe_payment_link_id: PRACTICE_PASS_LINK, subscription_status: 'active' })],
  }),
  'a-teacher: signed in, teacher plan applied, no pending row': () => ({
    user: USER, pending: [],
    profiles: [profile({ role: 'teacher', plan: 'teacher-pro', plan_status: 'active', access_until: iso(20), subscription_status: 'active' })],
  }),
  'b: signed in, pending row present': () => ({ user: USER, pending: [pendingRow()], profiles: [profile()] }),
  'c: signed out, pending row present': () => ({ user: null, pending: [pendingRow()], profiles: [profile()] }),
  'd: signed in, nothing pending, nothing held': () => ({ user: USER, pending: [], profiles: [profile()] }),
  'd-lapsed: signed in, lapsed tripwire, nothing pending': () => ({
    user: USER, pending: [],
    profiles: [profile({ plan: 'full-course', plan_status: 'active', access_until: iso(-1), stripe_payment_link_id: TRIPWIRE_PAYMENT_LINK_ID, subscription_status: 'inactive' })],
  }),
  'both: signed in, pending row AND an older live pass': () => ({
    user: USER, pending: [pendingRow({ access_until: iso(365), plan: 'full-course', stripe_payment_link_id: 'plink_1U5tgXF8f8aZDGVANGvtkoMF' })],
    profiles: [profile({ plan: 'practice-pass', plan_status: 'active', access_until: iso(100), stripe_payment_link_id: PRACTICE_PASS_LINK, subscription_status: 'active', plan_updated_at: new Date(NOW - 30 * DAY).toISOString() })],
  }),
};

function setWorld(name) {
  const w = SCENARIOS[name]();
  world.user = w.user; world.profiles = w.profiles; world.pending = w.pending; world.log = [];
}

const quiet = async (fn) => {
  const e = console.error, w = console.warn, l = console.log;
  console.error = console.warn = console.log = () => {};
  try { return await fn(); } finally { console.error = e; console.warn = w; console.log = l; }
};

// Runs the page and reduces it to one of: { redirect }, { screen: 'ClaimClient' },
// { screen: 'ClaimResult', outcome, plan }.
async function render(mod, scenario, sessionId = SESSION) {
  setWorld(scenario);
  try {
    const el = await quiet(() => mod.default({ searchParams: Promise.resolve({ checkout_session_id: sessionId }) }));
    const name = el?.type?.name ?? String(el?.type);
    if (name === 'ClaimClient') return { screen: 'ClaimClient' };
    if (name === 'ClaimResult') return { screen: 'ClaimResult', outcome: el.props.outcome, plan: el.props.plan };
    return { screen: name };
  } catch (err) {
    if (err?.redirectTo) return { redirect: err.redirectTo };
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Properties. null when they hold, a reason when they fail.
// ---------------------------------------------------------------------------

async function checkA(mod) {
  const r = await render(mod, 'a: signed in, tripwire already applied, no pending row');
  if (r.redirect !== '/dashboard') return `tripwire holder got ${JSON.stringify(r)}`;
  const pp = await render(mod, 'a-pp: signed in, Practice Pass applied, no pending row');
  if (pp.redirect !== '/dashboard') return `Practice Pass holder got ${JSON.stringify(pp)}`;
  const t = await render(mod, 'a-teacher: signed in, teacher plan applied, no pending row');
  if (t.redirect !== '/teacher') return `teacher got ${JSON.stringify(t)}`;
  return null;
}
async function checkB(mod) {
  const r = await render(mod, 'b: signed in, pending row present');
  if (r.screen !== 'ClaimResult' || r.outcome !== 'claimed') return `got ${JSON.stringify(r)}`;
  const row = world.profiles[0];
  if (row.plan !== 'full-course' || !row.plan_updated_at) return 'entitlement was not written to the profile';
  if (!world.pending[0].claimed_at) return 'pending row was not marked claimed';
  return null;
}
async function checkC(mod) {
  const r = await render(mod, 'c: signed out, pending row present');
  if (r.screen !== 'ClaimClient') return `signed-out visitor got ${JSON.stringify(r)}`;
  if (world.log.length !== 0) return `signed-out render touched the database: ${JSON.stringify(world.log)}`;
  if (world.pending[0].claimed_at) return 'pending row consumed before sign-in';
  // Then they sign in and come back to the same URL.
  world.user = USER;
  const after = await quiet(() => mod.default({ searchParams: Promise.resolve({ checkout_session_id: SESSION }) }));
  if (after?.type?.name !== 'ClaimResult' || after.props.outcome !== 'claimed') return `after sign-in got ${after?.props?.outcome}`;
  return null;
}
async function checkD(mod) {
  const r = await render(mod, 'd: signed in, nothing pending, nothing held');
  if (r.screen !== 'ClaimResult' || r.outcome !== 'nothing-owed') return `got ${JSON.stringify(r)}`;
  const l = await render(mod, 'd-lapsed: signed in, lapsed tripwire, nothing pending');
  if (l.screen !== 'ClaimResult' || l.outcome !== 'nothing-owed') return `lapsed holder got ${JSON.stringify(l)}`;
  return null;
}
async function checkPendingFirst(mod) {
  const r = await render(mod, 'both: signed in, pending row AND an older live pass');
  if (r.redirect) return `redirected to ${r.redirect} instead of claiming the pending purchase`;
  if (r.outcome !== 'claimed') return `got ${JSON.stringify(r)}`;
  const first = world.log[0];
  if (!first || first.table !== 'pending_entitlements') return `first database read was ${JSON.stringify(first)}, not the pending lookup`;
  if (world.profiles[0].plan !== 'full-course') return 'the newer purchase was not applied over the older pass';
  return null;
}
async function checkNoOracle(mod) {
  // The fallback must not run for a signed-out visitor, and must not run for
  // any outcome other than nothing-owed.
  await render(mod, 'c: signed out, pending row present');
  if (world.log.some((e) => e.table === 'profiles')) return 'signed-out render read a profile';
  // A used link held by someone who is ALSO entitled must still say
  // already-claimed, not bounce them past the message.
  setWorld('a: signed in, tripwire already applied, no pending row');
  world.pending = [pendingRow({ claimed_at: iso(-1) })];
  const again = await quiet(() => mod.default({ searchParams: Promise.resolve({ checkout_session_id: SESSION }) })).catch((e) => e);
  if (again?.redirectTo) return 'already-claimed outcome was overridden by the fallback';
  if (again?.props?.outcome !== 'already-claimed') return `expected already-claimed, got ${again?.props?.outcome}`;
  return null;
}

const PROPERTIES = [
  { name: '(a) already-applied buyer is redirected to their dashboard', check: checkA, mutants: [
      { label: 'fallback removed', needle: 'if (result.outcome === "nothing-owed") {', replacement: 'if (false) {' },
      { label: 'predicate downgraded to a curriculum plan check', needle: '  if (!live) return null;\n', replacement: '  if (!live || row.plan !== "full-course") return null;\n' },
      { label: 'teacher destination collapsed', needle: 'return destinationFor(row.plan).href;', replacement: 'return "/dashboard";' },
  ] },
  { name: '(b) signed in with a pending row still claims, unchanged', check: checkB, mutants: [
      { label: 'pending lookup bypassed', needle: 'const [result] = await claimPending(admin, user.id, { sessionId: checkoutSessionId });', replacement: 'const result = { outcome: "nothing-owed", plan: null };' },
  ] },
  { name: '(c) signed out with a pending row signs in first, then claims, unchanged', check: checkC, mutants: [
      { label: 'signed-out branch removed', needle: '  if (!user) {\n    return <ClaimClient checkoutSessionId={checkoutSessionId} />;\n  }\n', replacement: '  if (!user) { return <ClaimResult outcome="nothing-owed" plan={null} />; }\n' },
  ] },
  { name: '(d) nothing pending and nothing held still gets the not-found card', check: checkD, mutants: [
      { label: 'fallback redirects everyone', needle: '  if (!live) return null;\n', replacement: '\n' },
  ] },
  { name: 'pending lookup runs first and wins over an existing live pass', check: checkPendingFirst, mutants: [
      { label: 'fallback consulted for every outcome', needle: 'if (result.outcome === "nothing-owed") {', replacement: 'if (true) {' },
  ] },
  { name: 'no oracle: fallback never runs signed out, never overrides another outcome', check: checkNoOracle, mutants: [] },
];

let failures = 0; const lines = [];
const report = (ok, t) => { lines.push(`${ok ? 'PASS' : 'FAIL'}  ${t}`); if (!ok) failures += 1; };

purgeTemp();
try {
  const real = await loadSource(SOURCE);
  for (const p of PROPERTIES) {
    const why = await p.check(real);
    report(why === null, `${p.name}: green on the real module${why ? ` (${why})` : ''}`);
    for (const m of p.mutants) {
      const mutant = await loadMutant(m.needle, m.replacement);
      const mw = await p.check(mutant).catch((e) => `threw: ${e.message}`);
      report(mw !== null, `${p.name}: RED on mutant "${m.label}"${mw ? `: ${mw}` : ' (mutant passed, check is blind)'}`);
    }
  }
} finally { purgeTemp(); }

report(fetchCalls === 0, `no network: fetch was called ${fetchCalls} times`);
report(!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.STRIPE_SECRET_KEY && !process.env.UPSTASH_REDIS_REST_URL, 'no Supabase, Stripe or Upstash credentials in the environment');
console.log(lines.join('\n'));
console.log(`\n${failures === 0 ? 'ALL GREEN' : `${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
