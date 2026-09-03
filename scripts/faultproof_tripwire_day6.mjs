// faultproof_tripwire_day6.mjs -- prove the day-6 tripwire reminder routes,
// windows, dedupes and excludes correctly, and prove each check can go red.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/faultproof_tripwire_day6.mjs
//
// WHAT RUNS. The real runTripwireReminderSweep, the real renderTripwireReminder
// and the real copy, over a fake database, a fake Redis, a fake sender and a
// fake attempts read. Every dependency arrives through `deps`, which is the
// whole reason the sweep takes them that way.
//
// WHAT NEVER RUNS. No Supabase client is ever constructed (the fake admin has
// no key), no Resend call is possible (the fake sender records and returns),
// and globalThis.fetch is replaced with a function that throws, so any code
// path that tried to reach the network would fail loudly here. The service-role,
// Resend and Upstash variables are deleted from the environment before the
// module loads. Zero real emails and zero prod reads are properties of the
// setup, not a claim.
//
// RED THEN GREEN. Each of the four properties is asserted against the real
// module, and then against a MUTANT: the source with one deliberate fault,
// written to a temp file next to the original so its relative imports still
// resolve. The check must FAIL on the mutant. A harness that has never seen
// its own check go red proves nothing. The harness also asserts that each
// mutation's needle exists exactly once, so a refactor cannot silently turn a
// mutant into a copy of the original.

import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { pathToFileURL } from 'url';

for (const k of [
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_POSTHOG_KEY',
]) {
  delete process.env[k];
}

// email.ts constructs its Resend client at module load and the constructor
// refuses an empty key. This is not a key: it is a sentinel that lets the
// module load. The sweep never calls the client (send is injected) and any
// attempt would hit the throwing fetch below.
const RESEND_SENTINEL = 're_FAULTPROOF_NOT_A_KEY';
process.env.RESEND_API_KEY = RESEND_SENTINEL;

let fetchCalls = 0;
globalThis.fetch = async (...args) => {
  fetchCalls += 1;
  throw new Error(`network call attempted: ${String(args[0])}`);
};

const { TRIPWIRE_PAYMENT_LINK_ID } = await import('@/app/lib/products');
const REAL_FULL_COURSE_PLINK = 'plink_1U5tgXF8f8aZDGVANGvtkoMF';
const {
  FULL_COURSE_UPGRADE_URL,
  PRACTICE_PASS_UPGRADE_URL,
  TRIPWIRE_REMINDER_COPY,
} = await import('@/app/lib/email');

// ---------------------------------------------------------------------------
// Fakes
// ---------------------------------------------------------------------------

function createFakeDb(seed) {
  const tables = {
    profiles: (seed.profiles ?? []).map((r) => ({ ...r })),
    pending_entitlements: (seed.pending_entitlements ?? []).map((r) => ({ ...r })),
  };

  class Query {
    constructor(table) {
      this.table = table;
      this.filters = [];
    }
    select(cols) {
      if (typeof cols !== 'string' || cols.length === 0) {
        throw new Error('fake db: select() needs an explicit column list');
      }
      return this;
    }
    eq(col, value) {
      this.filters.push((row) => row[col] === value);
      return this;
    }
    is(col, value) {
      if (value !== null) throw new Error(`fake db: is() only modelled for null`);
      this.filters.push((row) => row[col] === null || row[col] === undefined);
      return this;
    }
    gte(col, value) {
      this.filters.push((row) => row[col] != null && row[col] >= value);
      return this;
    }
    lt(col, value) {
      this.filters.push((row) => row[col] != null && row[col] < value);
      return this;
    }
    then(resolve, reject) {
      try {
        const rows = tables[this.table]
          .filter((row) => this.filters.every((f) => f(row)))
          .map((r) => ({ ...r }));
        resolve({ data: rows, error: null });
      } catch (err) {
        reject(err);
      }
    }
  }

  return {
    from(table) {
      if (!(table in tables)) throw new Error(`fake db: unknown table "${table}"`);
      return new Query(table);
    },
    auth: {
      admin: {
        getUserById() {
          throw new Error('fake db: the sweep must not call auth directly; userFor is injected');
        },
      },
    },
  };
}

function createFakeRedis() {
  const store = new Map();
  return {
    store,
    reserve: async (key, ttl) => {
      if (typeof ttl !== 'number' || ttl <= 0) throw new Error('fake redis: bad ttl');
      if (store.has(key)) return false;
      store.set(key, ttl);
      return true;
    },
    release: async (key) => {
      store.delete(key);
    },
  };
}

function createFakeSender(opts = {}) {
  const sent = [];
  return {
    sent,
    send: async (message) => {
      if (opts.failFor && opts.failFor(message)) throw new Error('resend: simulated failure');
      sent.push(message);
    },
  };
}

// ---------------------------------------------------------------------------
// Fixtures. NOW is the scheduled slot: 14:00 UTC, 9am Central, on a Tuesday.
// The window is [Wed 14:00 UTC, Thu 14:00 UTC), i.e. 24 to 48 hours out.
// ---------------------------------------------------------------------------

const NOW = new Date('2026-09-08T14:00:00.000Z');
const ONE_DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const hoursOut = (h) => new Date(NOW.getTime() + h * HOUR);

const expiring = {
  today: hoursOut(6),
  tomorrow: hoursOut(25.5),
  tomorrowLate: hoursOut(38.5),
  dayAfter: hoursOut(49.5),
  at36h: hoursOut(36),
  at12h: hoursOut(12),
  at60h: hoursOut(60),
};

const USERS = {
  engaged: { email: 'engaged@example.com', firstName: 'Tess' },
  idle: { email: 'idle@example.com', firstName: 'Ravi' },
  late: { email: 'late@example.com', firstName: 'Ana' },
  upgraded: { email: 'upgraded@example.com', firstName: 'Kim' },
  wrongday: { email: 'wrongday@example.com', firstName: 'Lee' },
  today: { email: 'today@example.com', firstName: 'Sam' },
  h36: { email: 'h36@example.com', firstName: 'Ida' },
  h12: { email: 'h12@example.com', firstName: 'Bo' },
  h60: { email: 'h60@example.com', firstName: 'Cy' },
};

const attemptsByProfile = {
  engaged: [
    { course_id: 'tsia2', topic_id: 'QR.1.1', section: 'practice', item_number: 1, is_correct: true, created_at: new Date(expiring.tomorrow.getTime() - 3 * ONE_DAY).toISOString() },
    { course_id: 'tsia2', topic_id: 'QR.1.1', section: 'mini_quiz', item_number: 1, is_correct: false, created_at: new Date(expiring.tomorrow.getTime() - 2 * ONE_DAY).toISOString() },
    { course_id: 'tsia2', topic_id: 'AR.2.3', section: 'practice', item_number: 2, is_correct: true, created_at: new Date(expiring.tomorrow.getTime() - ONE_DAY).toISOString() },
  ],
  // Worked topics, but all BEFORE this pass started: that is idle for this pass.
  idle: [
    { course_id: 'tsia2', topic_id: 'QR.1.1', section: 'practice', item_number: 1, is_correct: true, created_at: new Date(expiring.tomorrow.getTime() - 20 * ONE_DAY).toISOString() },
  ],
  late: [],
  upgraded: [
    { course_id: 'tsia2', topic_id: 'QR.1.1', section: 'practice', item_number: 1, is_correct: true, created_at: new Date(NOW.getTime() - ONE_DAY).toISOString() },
  ],
  wrongday: [],
  today: [],
  h36: [],
  h12: [],
  h60: [],
};

function profile(id, accessUntil, overrides = {}) {
  return {
    id,
    plan: 'full-course',
    plan_status: 'active',
    access_until: accessUntil.toISOString(),
    stripe_payment_link_id: TRIPWIRE_PAYMENT_LINK_ID,
    ...overrides,
  };
}

function pending(id, email, accessUntil, overrides = {}) {
  return {
    id,
    email,
    access_until: accessUntil.toISOString(),
    stripe_payment_link_id: TRIPWIRE_PAYMENT_LINK_ID,
    claimed_at: null,
    checkout_session_id: `cs_${id}`,
    ...overrides,
  };
}

function seedDb() {
  return createFakeDb({
    profiles: [
      profile('engaged', expiring.tomorrow),
      profile('idle', expiring.tomorrow),
      profile('late', expiring.tomorrowLate),
      // Bought the tripwire, then real Full Course: the link id was overwritten.
      profile('upgraded', expiring.tomorrow, { stripe_payment_link_id: REAL_FULL_COURSE_PLINK }),
      profile('wrongday', expiring.dayAfter),
      profile('today', expiring.today),
      profile('h36', expiring.at36h),
      profile('h12', expiring.at12h),
      profile('h60', expiring.at60h),
    ],
    pending_entitlements: [
      pending('pe-unclaimed', 'never@example.com', expiring.tomorrow),
      pending('pe-claimed', 'claimed@example.com', expiring.tomorrow, { claimed_at: '2026-09-03T00:00:00.000Z' }),
      pending('pe-wrongday', 'never2@example.com', expiring.dayAfter),
      pending('pe-notripwire', 'other@example.com', expiring.tomorrow, { stripe_payment_link_id: REAL_FULL_COURSE_PLINK }),
    ],
  });
}

function depsFor(mod, { db = seedDb(), redis = createFakeRedis(), sender = createFakeSender(), captured = [] } = {}) {
  return {
    deps: {
      admin: db,
      attemptsFor: async (id) => attemptsByProfile[id] ?? [],
      userFor: async (id) => USERS[id] ?? { email: null, firstName: 'there' },
      reserve: redis.reserve,
      release: redis.release,
      send: sender.send,
      capture: (e) => captured.push(e),
      now: NOW,
    },
    db,
    redis,
    sender,
    captured,
  };
}

async function sweep(mod, ctx) {
  const result = await mod.runTripwireReminderSweep(mod.TRIPWIRE_DAY6, ctx.deps);
  return result;
}

// ---------------------------------------------------------------------------
// Mutant loading
// ---------------------------------------------------------------------------

const SOURCE_PATH = 'app/lib/tripwire-reminder.ts';
const SOURCE = readFileSync(SOURCE_PATH, 'utf8');
let loadCounter = 0;

function purgeTempModules() {
  for (const name of readdirSync('app/lib')) {
    if (name.startsWith('__faultproof_d6_')) unlinkSync(`app/lib/${name}`);
  }
}

async function loadMutant(needle, replacement) {
  const count = SOURCE.split(needle).length - 1;
  if (count !== 1) {
    throw new Error(`mutation needle must appear exactly once in ${SOURCE_PATH}, found ${count}: ${needle}`);
  }
  const src = SOURCE.replace(needle, replacement);
  const path = `app/lib/__faultproof_d6_${process.pid}_${loadCounter++}.ts`;
  writeFileSync(path, src);
  try {
    return await import(pathToFileURL(path).href);
  } finally {
    unlinkSync(path);
  }
}

// ---------------------------------------------------------------------------
// Checks. Each returns null when it holds and a reason string when it fails.
// ---------------------------------------------------------------------------

function byPass(result) {
  return Object.fromEntries(result.sent.map((e) => [e.passId, e]));
}

async function checkRouting(mod) {
  const ctx = depsFor(mod);
  const result = await sweep(mod, ctx);
  const got = byPass(result);
  const want = { engaged: 'engaged', idle: 'idle', late: 'idle', 'pe-unclaimed': 'never-claimed' };
  for (const [pass, state] of Object.entries(want)) {
    if (!got[pass]) return `${pass} was not emailed at all`;
    if (got[pass].state !== state) return `${pass} routed to ${got[pass].state}, expected ${state}`;
  }
  const messages = Object.fromEntries(ctx.sender.sent.map((m) => [m.to, m]));
  const engaged = messages['engaged@example.com'];
  const idle = messages['idle@example.com'];
  const never = messages['never@example.com'];
  if (!engaged.text.includes('Howdy Tess,')) return 'engaged: first name not merged';
  if (!engaged.text.includes('you worked through 2 topics')) return `engaged: topics_worked wrong: ${engaged.text.match(/worked through .*? topics/)?.[0]}`;
  if (!engaged.text.includes('ends September 9.')) return 'engaged: expiry date wrong';
  if (!engaged.text.includes(FULL_COURSE_UPGRADE_URL) || !engaged.text.includes(PRACTICE_PASS_UPGRADE_URL)) return 'engaged: upgrade links missing';
  if (!idle.text.includes("haven't started yet")) return 'idle: wrong copy';
  if (!idle.text.includes('Howdy Ravi,')) return 'idle: first name not merged';
  if (idle.text.includes('worked through')) return 'idle: engaged copy leaked in';
  if (!never.text.startsWith('Howdy,\n')) return 'never-claimed: must open "Howdy," with no first name';
  if (!never.text.includes('/claim?checkout_session_id=cs_pe-unclaimed')) return 'never-claimed: claim link missing';
  if (never.text.includes('/upgrade')) return 'never-claimed: must not carry upgrade links';
  if (never.subject !== TRIPWIRE_REMINDER_COPY['never-claimed'].subject) return 'never-claimed: subject';
  if (engaged.subject !== 'Tomorrow, the rest of your course locks') return 'engaged: subject';
  if (!engaged.html.includes("Your progress stays saved. The lessons and Mu don&#39;t.")) return 'engaged: preheader missing from html';
  if (/\{\{\w+\}\}/.test(engaged.text + idle.text + never.text)) return 'an unfilled merge field survived';
  if (/\u2014/.test(engaged.text + idle.text + never.text + engaged.html)) return 'em dash in rendered copy';
  return null;
}

async function checkWindow(mod) {
  const ctx = depsFor(mod);
  const result = await sweep(mod, ctx);
  const got = byPass(result);
  // Behaviour first, so a mutant goes red on what was SENT, not on a timestamp.
  if (!got.h36) return 'a pass 36 hours out was not emailed';
  if (got.h12) return 'a pass 12 hours out was emailed';
  if (got.h60) return 'a pass 60 hours out was emailed';
  if (got.wrongday) return 'a pass 49.5 hours out was emailed';
  if (got['pe-wrongday']) return 'an unclaimed pass 49.5 hours out was emailed';
  if (got.today) return 'a pass 6 hours out was emailed';
  if (!got.engaged) return 'a pass 25.5 hours out was not emailed';
  if (!got.late) return 'a pass 38.5 hours out was not emailed';
  if (result.window.start !== '2026-09-09T14:00:00.000Z') return `window start ${result.window.start}`;
  if (result.window.end !== '2026-09-10T14:00:00.000Z') return `window end ${result.window.end}`;
  return null;
}

// Exactly once, BY THE WINDOW ALONE. Dedupe is disabled (reserve always says
// yes) and the database is fresh for each run, so the only thing that can
// keep a pass from being emailed twice, or from being emailed at all, is the
// window arithmetic. Passes sit at every hour from 0 to 96 out, including the
// exact boundaries at 24, 48 and 72, and the second run is jittered seven
// minutes late the way a real cron can be.
async function checkExactlyOnce(mod) {
  const offsets = Array.from({ length: 97 }, (_, h) => h);
  const seedFor = () =>
    createFakeDb({
      profiles: offsets.map((h) => profile(`h${h}`, hoursOut(h))),
      pending_entitlements: [],
    });
  const noDedupe = { reserve: async () => true, release: async () => {}, store: new Map() };
  const runs = [NOW, new Date(NOW.getTime() + ONE_DAY + 7 * 60 * 1000)];
  const caught = new Map(offsets.map((h) => [`h${h}`, 0]));
  const sender = createFakeSender();
  for (const at of runs) {
    const ctx = depsFor(mod, { db: seedFor(), redis: noDedupe, sender });
    ctx.deps.now = at;
    ctx.deps.userFor = async (id) => ({ email: `${id}@example.com`, firstName: 'X' });
    const result = await sweep(mod, ctx);
    for (const e of result.sent) caught.set(e.passId, caught.get(e.passId) + 1);
  }
  const twice = offsets.filter((h) => caught.get(`h${h}`) > 1);
  if (twice.length) return `double-caught across two daily runs at hours ${twice.join(',')}`;
  const missed = offsets.filter((h) => h >= 24 && h < 72 && caught.get(`h${h}`) !== 1);
  if (missed.length) return `missed across two daily runs at hours ${missed.join(',')}`;
  const outside = offsets.filter((h) => (h < 24 || h >= 72) && caught.get(`h${h}`) !== 0);
  if (outside.length) return `caught outside the two windows at hours ${outside.join(',')}`;
  if (sender.sent.length !== 48) return `sent ${sender.sent.length} across two runs, expected 48`;
  return null;
}

async function checkDedupe(mod) {
  const ctx = depsFor(mod);
  const first = await sweep(mod, ctx);
  if (first.sent.length !== 5) return `first run sent ${first.sent.length}, expected 5`;
  const again = depsFor(mod, { db: seedDb(), redis: ctx.redis, sender: ctx.sender });
  const second = await sweep(mod, again);
  if (second.sent.length !== 0) return `second run re-sent ${second.sent.length}`;
  if (second.duplicates.length !== 5) return `second run reported ${second.duplicates.length} duplicates`;
  if (ctx.sender.sent.length !== 5) return `sender saw ${ctx.sender.sent.length} sends across two runs`;
  const keys = [...ctx.redis.store.keys()];
  if (!keys.every((k) => k.startsWith('tripwire-day6:'))) return `key prefix: ${keys}`;
  if (!keys.includes(`tripwire-day6:engaged:${expiring.tomorrow.toISOString()}`)) return `profile key shape: ${keys}`;
  if (!keys.includes(`tripwire-day6:never@example.com:${expiring.tomorrow.toISOString()}`)) return `email key shape: ${keys}`;
  if (![...ctx.redis.store.values()].every((ttl) => ttl > 7 * 24 * 60 * 60)) return 'TTL not longer than the pass';
  return null;
}

async function checkExclusion(mod) {
  const ctx = depsFor(mod);
  const result = await sweep(mod, ctx);
  const got = byPass(result);
  if (got.upgraded) return 'a row upgraded to real Full Course was emailed';
  if (got['pe-notripwire']) return 'a pending row on a non-tripwire link was emailed';
  if (got['pe-claimed']) return 'an already-claimed pending row was emailed';
  if (ctx.sender.sent.some((m) => m.to === 'upgraded@example.com')) return 'sender saw the upgraded buyer';
  return null;
}

// Not one of the four, but cheap and load-bearing: a failed send must release
// its key, and nothing may run without the secret.
async function checkExtras(mod) {
  const sender = createFakeSender({ failFor: (m) => m.to === 'idle@example.com' });
  const ctx = depsFor(mod, { sender });
  const result = await sweep(mod, ctx);
  if (result.failed.length !== 1 || result.failed[0].passId !== 'idle') return 'failed send not reported';
  if (ctx.redis.store.has(result.failed[0].key)) return 'failed send left its dedupe key reserved';
  if (result.sent.length !== 4) return `sent ${result.sent.length} around the failure`;
  if (ctx.captured.length !== 4) return `captured ${ctx.captured.length} analytics events, expected 4`;
  if (!ctx.captured.every((e) => e.event === 'tripwire_reminder_sent' && e.properties.reminder === 'tripwire-day6')) return 'analytics event shape';

  if (mod.isCronAuthorized('Bearer s3cret', 's3cret') !== true) return 'auth: correct secret rejected';
  if (mod.isCronAuthorized('Bearer wrong', 's3cret') !== false) return 'auth: wrong secret accepted';
  if (mod.isCronAuthorized(null, 's3cret') !== false) return 'auth: missing header accepted';
  if (mod.isCronAuthorized('Bearer s3cret', undefined) !== false) return 'auth: unset secret accepted';
  if (mod.isCronAuthorized('Bearer ', '') !== false) return 'auth: empty secret accepted';

  // A run before today's slot belongs to yesterday's slot; a late run to today's.
  const early = mod.sweepWindow(new Date('2026-09-08T13:59:00.000Z'), mod.TRIPWIRE_DAY6);
  if (early.start.toISOString() !== '2026-09-08T14:00:00.000Z') return `pre-slot run anchored to ${early.start.toISOString()}`;
  const late = mod.sweepWindow(new Date('2026-09-08T14:07:00.000Z'), mod.TRIPWIRE_DAY6);
  if (late.start.toISOString() !== '2026-09-09T14:00:00.000Z') return `late run anchored to ${late.start.toISOString()}`;
  if (mod.CRON_SLOT_UTC_HOUR !== 14) return 'slot hour is not 14:00 UTC';
  const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const job = vercel.crons.find((c) => c.path === '/api/cron/tripwire-day6');
  if (!job || job.schedule !== `0 ${mod.CRON_SLOT_UTC_HOUR} * * *`) return `vercel.json schedule ${job?.schedule} disagrees with CRON_SLOT_UTC_HOUR`;
  return null;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const real = await import('@/app/lib/tripwire-reminder');

const PROPERTIES = [
  {
    name: 'state routing',
    check: checkRouting,
    mutants: [
      {
        label: 'idle counted as engaged (threshold >= 0)',
        needle: 'state: topicsWorked > 0 ? "engaged" : "idle"',
        replacement: 'state: topicsWorked >= 0 ? "engaged" : "idle"',
      },
      {
        label: 'never-claimed row labelled idle',
        needle: 'state: "never-claimed",',
        replacement: 'state: "idle",',
      },
      {
        label: 'engagement window ignores the pass start',
        needle: 'topicsWorkedSince(attempts, passStart(accessUntil))',
        replacement: 'topicsWorkedSince(attempts, new Date(0))',
      },
    ],
  },
  {
    name: 'window',
    check: checkWindow,
    mutants: [
      {
        label: 'window slid one day late',
        needle: 'const start = new Date(slot.getTime() + config.leadHours * HOUR_MS);',
        replacement: 'const start = new Date(slot.getTime() + (config.leadHours + 24) * HOUR_MS);',
      },
      {
        label: 'window widened to 48 hours',
        needle: 'const end = new Date(start.getTime() + config.widthHours * HOUR_MS);',
        replacement: 'const end = new Date(start.getTime() + 2 * config.widthHours * HOUR_MS);',
      },
    ],
  },
  {
    name: 'exactly once across two daily runs (dedupe disabled)',
    check: checkExactlyOnce,
    mutants: [
      {
        label: 'window widened to 48 hours (double-catch)',
        needle: 'const end = new Date(start.getTime() + config.widthHours * HOUR_MS);',
        replacement: 'const end = new Date(start.getTime() + 2 * config.widthHours * HOUR_MS);',
      },
      {
        label: 'window anchored to the wall clock, not the slot (jitter opens a gap)',
        needle: 'const slot = scheduledSlot(now, config.slotUtcHour);',
        replacement: 'const slot = now;',
      },
    ],
  },
  {
    name: 'dedupe',
    check: checkDedupe,
    mutants: [
      {
        label: 'reservation result ignored',
        needle: 'if (!reserved) {',
        replacement: 'if (reserved && false) {',
      },
      {
        label: 'key drops the pass identity',
        needle: 'return `${config.name}:${who.trim().toLowerCase()}:${accessUntilIso}`;',
        replacement: 'return `${config.name}:${who.trim().toLowerCase()}:${accessUntilIso}:${Math.random()}`;',
      },
    ],
  },
  {
    name: 'exclusion',
    check: checkExclusion,
    mutants: [
      {
        label: 'profiles query no longer filters on the tripwire link id',
        needle: '.select(PROFILE_COLUMNS)\n    .eq("stripe_payment_link_id", TRIPWIRE_PAYMENT_LINK_ID)',
        replacement: '.select(PROFILE_COLUMNS)',
      },
      {
        label: 'pending query no longer requires claimed_at null',
        needle: '.is("claimed_at", null)\n',
        replacement: '\n',
      },
    ],
  },
  { name: 'extras (send failure releases key, auth, slot anchoring, vercel.json)', check: checkExtras, mutants: [] },
];

let failures = 0;
const lines = [];
function report(ok, text) {
  lines.push(`${ok ? 'PASS' : 'FAIL'}  ${text}`);
  if (!ok) failures += 1;
}

purgeTempModules();
try {
  for (const prop of PROPERTIES) {
    const reason = await prop.check(real);
    report(reason === null, `${prop.name}: green on the real module${reason ? ` (${reason})` : ''}`);
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
report(!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.UPSTASH_REDIS_REST_URL, 'no service-role or Upstash credentials in the environment');
report(process.env.RESEND_API_KEY === RESEND_SENTINEL, 'Resend key is the sentinel, not a real key');

console.log(lines.join('\n'));
console.log(`\n${failures === 0 ? 'ALL GREEN' : `${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
