// faultproof_claim.mjs -- prove that claiming a captured purchase does the right
// thing, and prove each check can fail.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/faultproof_claim.mjs
//
// WHAT IS BEING PROVED
// --------------------
// app/lib/pending-entitlements.ts is the recovery path for a purchase that took
// the money and matched no account. It is the only thing standing between a
// buyer and a $49 charge with nothing behind it, and almost every way of getting
// it wrong is SILENT: a row marked claimed with no entitlement written looks
// exactly like a delivered purchase, and there is no second record to contradict
// it. So the properties below are asserted on OBSERVED BEHAVIOUR, not on text.
//
// WHY THIS ONE RUNS THE CODE, WHERE THE OTHER HARNESSES ASSERT ON SOURCE
// ---------------------------------------------------------------------
// faultproof_role_promotion and faultproof_gumu_resolution assert over source
// text, and say why: the value under test would otherwise be a stub's. That
// reasoning does not hold here. What has to be true of a claim is not a property
// of one statement, it is a property of a SEQUENCE -- link the customer, replay
// the entitlement, and mark the row only if the replay actually landed -- and
// several of the failures are orderings that read perfectly well.
//
// So this harness fakes ONLY the database. Everything above it is the real
// module: the real claimPending, the real writeEntitlement with its ordering
// predicate and its constraint pre-check, the real linkCustomerId with its
// first-writer-wins guard. The fake store is deliberately strict -- it enforces
// the UNIQUE on checkout_session_id, and it throws on any filter grammar it was
// not built for, so a change in how the predicate is written fails loudly here
// rather than passing against a permissive stub.
//
// Nothing here touches the network, Stripe, Supabase, or the real table.
//
// ONE CHECK IS STRUCTURAL, AND IT IS MARKED
// -----------------------------------------
// The auth/callback skip (scenario F) cannot be run: it lives inside a Next
// route handler that needs next/server, a cookie store and an OAuth code
// exchange. It is covered two ways instead -- the guard EXPRESSION is lifted out
// of the source and evaluated against real inputs, which is behavioural, and the
// fact that the claim call sits inside the guarded block is a structural
// assertion over the source, which is not. Everything in scenarios A-E is
// behavioural. See the summary printed at the end.

import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { pathToFileURL } from 'url';

const MODULE = 'app/lib/pending-entitlements.ts';
const CALLBACK = 'app/auth/callback/route.ts';

const ACTIVATION = 'app/lib/stripe-activation.ts';

const moduleSrc = readFileSync(MODULE, 'utf8');
const activationSrc = readFileSync(ACTIVATION, 'utf8');
const callbackSrc = readFileSync(CALLBACK, 'utf8');

let ok = true;
const check = (name, pass, detail = '') => {
  ok &&= pass;
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? `  ${detail}` : ''}`);
  return pass;
};

// ---------------------------------------------------------------------------
// The fake store
//
// Enough of supabase-js's builder to run the two modules under test, and no
// more. Every unsupported call throws, on purpose: a silent no-op here would
// turn "the code stopped doing something" into a green run.
// ---------------------------------------------------------------------------

function parseOrClause(expr) {
  // Exactly the grammar writeEntitlement builds:
  //   plan_updated_at.is.null,plan_updated_at.lt.<iso>
  // The ISO timestamp contains dots, so only the first two segments are the
  // column and the operator.
  return expr.split(',').map((clause) => {
    const parts = clause.split('.');
    const col = parts[0];
    const op = parts[1];
    const value = parts.slice(2).join('.');
    if (op !== 'is' && op !== 'lt') {
      throw new Error(`fake db: unsupported or() operator "${op}" in "${clause}"`);
    }
    return (row) => {
      if (op === 'is') {
        if (value !== 'null') throw new Error(`fake db: unsupported is-value "${value}"`);
        return row[col] === null || row[col] === undefined;
      }
      return row[col] !== null && row[col] !== undefined && row[col] < value;
    };
  });
}

function createFakeDb(seed) {
  const tables = {
    profiles: (seed.profiles ?? []).map((r) => ({ ...r })),
    pending_entitlements: (seed.pending_entitlements ?? []).map((r) => ({ ...r })),
  };
  // Observability: how many times each table was actually written. An assertion
  // that "nothing was written" is far sharper as a count than as a value check,
  // because a second write of the SAME value is invisible in the values.
  const writes = { profiles: 0, pending_entitlements: 0 };
  let nextId = 1;

  class Query {
    constructor(table) {
      this.table = table;
      this.op = null;
      this.payload = null;
      this.filters = [];
      this.returning = false;
      this.orderSpec = null;
      this.wantSingle = false;
      this.conflictIgnored = false;
    }

    select(cols) {
      if (typeof cols !== 'string' || cols.length === 0) {
        throw new Error('fake db: select() needs an explicit column list');
      }
      if (this.op === null) this.op = 'select';
      else this.returning = true;
      return this;
    }

    update(payload) {
      this.op = 'update';
      this.payload = payload;
      return this;
    }

    upsert(payload, options) {
      if (!options || options.ignoreDuplicates !== true || !options.onConflict) {
        throw new Error('fake db: upsert() is only modelled for ignoreDuplicates on a conflict key');
      }
      this.op = 'upsert';
      this.payload = payload;
      this.conflictKey = options.onConflict;
      return this;
    }

    eq(col, value) {
      this.filters.push((row) => row[col] === value);
      return this;
    }

    is(col, value) {
      if (value !== null) throw new Error(`fake db: is() is only modelled for null, got ${value}`);
      this.filters.push((row) => row[col] === null || row[col] === undefined);
      return this;
    }

    or(expr) {
      const clauses = parseOrClause(expr);
      this.filters.push((row) => clauses.some((c) => c(row)));
      return this;
    }

    order(col, opts) {
      this.orderSpec = { col, ascending: opts?.ascending !== false };
      return this;
    }

    maybeSingle() {
      this.wantSingle = true;
      return this;
    }

    #matching() {
      return tables[this.table].filter((row) => this.filters.every((f) => f(row)));
    }

    #run() {
      if (this.op === 'select') {
        let rows = this.#matching();
        if (this.orderSpec) {
          const { col, ascending } = this.orderSpec;
          rows = [...rows].sort((a, b) =>
            a[col] === b[col] ? 0 : (a[col] < b[col] ? -1 : 1) * (ascending ? 1 : -1)
          );
        }
        if (this.wantSingle) {
          if (rows.length > 1) {
            return { data: null, error: { message: 'more than one row returned' } };
          }
          return { data: rows[0] ? { ...rows[0] } : null, error: null };
        }
        return { data: rows.map((r) => ({ ...r })), error: null };
      }

      if (this.op === 'update') {
        const rows = this.#matching();
        for (const row of rows) {
          Object.assign(row, this.payload);
          writes[this.table] += 1;
        }
        return { data: this.returning ? rows.map((r) => ({ ...r })) : null, error: null };
      }

      if (this.op === 'upsert') {
        const key = this.conflictKey;
        const clash = tables[this.table].some((r) => r[key] === this.payload[key]);
        if (clash) return { data: this.returning ? [] : null, error: null };
        const row = { id: `row-${nextId++}`, claimed_at: null, ...this.payload };
        tables[this.table].push(row);
        writes[this.table] += 1;
        return { data: this.returning ? [{ ...row }] : null, error: null };
      }

      throw new Error(`fake db: nothing to run on ${this.table}`);
    }

    // Thenable, so `await query` works with or without a trailing .select().
    then(resolve, reject) {
      try {
        resolve(this.#run());
      } catch (err) {
        reject(err);
      }
    }
  }

  return {
    admin: {
      from(table) {
        if (!(table in tables)) throw new Error(`fake db: unknown table "${table}"`);
        return new Query(table);
      },
    },
    tables,
    writes,
  };
}

// ---------------------------------------------------------------------------
// Loading a possibly-faulted copy of the module
//
// The copy is written INTO app/lib so its relative imports still resolve, under
// a name no glob in this repo picks up, and deleted in a finally. A unique name
// per load defeats the ESM module cache, which would otherwise hand back the
// first version for every subsequent import.
// ---------------------------------------------------------------------------

let loadCounter = 0;

function purgeTempModules() {
  for (const name of readdirSync('app/lib')) {
    if (name.startsWith('__faultproof_tmp_')) unlinkSync(`app/lib/${name}`);
  }
}

async function loadModule(src, activationSrc) {
  const n = loadCounter++;
  const written = [];
  let source = src;

  // A fault in stripe-activation.ts cannot be injected by editing the module
  // under test: it imports the real file by relative path. So the faulted copy
  // is written alongside, and the import in the copy is repointed at it.
  if (activationSrc) {
    const actName = `__faultproof_tmp_act_${process.pid}_${n}`;
    const actPath = `app/lib/${actName}.ts`;
    writeFileSync(actPath, activationSrc);
    written.push(actPath);
    const before = source;
    source = source.replace('from "./stripe-activation"', `from "./${actName}"`);
    if (source === before) throw new Error('could not repoint the stripe-activation import');
  }

  const path = `app/lib/__faultproof_tmp_${process.pid}_${n}.ts`;
  writeFileSync(path, source);
  written.push(path);
  try {
    return await import(pathToFileURL(path).href);
  } finally {
    for (const f of written) unlinkSync(f);
  }
}

// ---------------------------------------------------------------------------
// Fixtures
//
// The event is 60 DAYS IN THE PAST on purpose. A term measured from claim time
// instead of event time then differs from the correct answer by two months,
// which no rounding or clock skew can disguise.
// ---------------------------------------------------------------------------

const DAY = 24 * 60 * 60 * 1000;
const EVENT_AT = new Date(Date.now() - 60 * DAY).toISOString();
const OLDER_EVENT_AT = new Date(Date.now() - 90 * DAY).toISOString();
// Six months from the EVENT, which is what entitlementFromCheckout stored.
const ACCESS_UNTIL = new Date(Date.parse(EVENT_AT) + 182 * DAY).toISOString();
const OLDER_ACCESS_UNTIL = new Date(Date.parse(OLDER_EVENT_AT) + 182 * DAY).toISOString();

const SESSION = 'cs_test_faultproof_primary';

function blankProfile(id) {
  return {
    id,
    role: 'student',
    plan: null,
    plan_term: null,
    plan_status: null,
    access_until: null,
    plan_source: null,
    stripe_payment_link_id: null,
    stripe_customer_id: null,
    plan_updated_at: null,
    subscription_status: 'inactive',
  };
}

function pendingRow(over = {}) {
  return {
    id: 'pending-1',
    email: 'buyer@example.com',
    plan: 'practice-pass',
    plan_term: 'one-time',
    plan_status: 'active',
    access_until: ACCESS_UNTIL,
    plan_source: 'stripe',
    stripe_payment_link_id: 'plink_test',
    stripe_customer_id: 'cus_test_primary',
    event_created_at: EVENT_AT,
    checkout_session_id: SESSION,
    claimed_at: null,
    ...over,
  };
}

// Console output from the module under test is captured rather than printed, so
// a run stays readable -- and so an assertion can look at what was logged.
async function quietly(fn) {
  const logs = [];
  const real = { log: console.log, warn: console.warn, error: console.error };
  for (const level of ['log', 'warn', 'error']) {
    console[level] = (...args) => logs.push(`${level}: ${args.map(String).join(' ')}`);
  }
  try {
    return { value: await fn(), logs };
  } finally {
    Object.assign(console, real);
  }
}

// ---------------------------------------------------------------------------
// Scenarios: run the module, return everything worth asserting on.
// ---------------------------------------------------------------------------

async function observe(src, activationSrc) {
  const mod = await loadModule(src, activationSrc);
  const o = {};

  // --- A. the ordinary session-id claim ------------------------------------
  {
    const db = createFakeDb({
      profiles: [blankProfile('p1')],
      pending_entitlements: [pendingRow()],
    });
    const { value, logs } = await quietly(() =>
      mod.claimPending(db.admin, 'p1', { sessionId: SESSION })
    );
    o.A = {
      results: value,
      profile: db.tables.profiles[0],
      row: db.tables.pending_entitlements[0],
      logs,
    };
  }

  // --- B. a second claim of the same session id, by a DIFFERENT account -----
  // The attack this guards: whoever holds the session id can present it, and
  // there is no email check in the way by design. Single use is what stops one
  // purchase becoming two.
  {
    const db = createFakeDb({
      profiles: [blankProfile('p1'), blankProfile('p2')],
      pending_entitlements: [pendingRow()],
    });
    await quietly(() => mod.claimPending(db.admin, 'p1', { sessionId: SESSION }));
    const writesAfterFirst = db.writes.profiles;
    const { value } = await quietly(() =>
      mod.claimPending(db.admin, 'p2', { sessionId: SESSION })
    );
    o.B = {
      second: value,
      thief: db.tables.profiles.find((p) => p.id === 'p2'),
      extraProfileWrites: db.writes.profiles - writesAfterFirst,
    };
  }

  // --- C. no profile row, then recovery ------------------------------------
  // writeEntitlement cannot tell "no such profile" from "profile has something
  // newer": both are zero rows updated. If the claim marks the row anyway, the
  // debt is erased. The recovery half is the real assertion -- it proves the
  // purchase is still deliverable afterwards.
  {
    const db = createFakeDb({
      profiles: [blankProfile('p1')],
      pending_entitlements: [pendingRow()],
    });
    const { value: ghost } = await quietly(() =>
      mod.claimPending(db.admin, 'ghost-no-such-profile', { sessionId: SESSION })
    );
    const rowAfterGhost = { ...db.tables.pending_entitlements[0] };
    const { value: recovery } = await quietly(() =>
      mod.claimPending(db.admin, 'p1', { sessionId: SESSION })
    );
    o.C = {
      ghost,
      rowAfterGhost,
      recovery,
      profile: db.tables.profiles[0],
    };
  }

  // --- D. the email surface, with two debts --------------------------------
  {
    const db = createFakeDb({
      profiles: [blankProfile('p1')],
      pending_entitlements: [
        pendingRow({
          id: 'pending-new',
          checkout_session_id: 'cs_test_newer',
          plan: 'full-course',
        }),
        pendingRow({
          id: 'pending-old',
          checkout_session_id: 'cs_test_older',
          plan: 'practice-pass',
          event_created_at: OLDER_EVENT_AT,
          access_until: OLDER_ACCESS_UNTIL,
        }),
      ],
    });
    const { value } = await quietly(() =>
      mod.claimPending(db.admin, 'p1', { email: 'BUYER@Example.com  ' })
    );
    o.D = {
      results: value,
      rows: db.tables.pending_entitlements.map((r) => ({ ...r })),
      profile: db.tables.profiles[0],
    };
  }

  // --- E. recording is idempotent on the session id -------------------------
  {
    const db = createFakeDb({ profiles: [], pending_entitlements: [] });
    const args = {
      write: {
        plan: 'practice-pass',
        planTerm: 'one-time',
        planStatus: 'active',
        accessUntil: new Date(ACCESS_UNTIL),
        planSource: 'stripe',
        paymentLinkId: 'plink_test',
      },
      checkoutSessionId: SESSION,
      email: '  Buyer@Example.COM ',
      customerId: 'cus_test_primary',
      eventCreatedMs: Date.parse(EVENT_AT),
      source: 'faultproof',
    };
    const { value: first } = await quietly(() => mod.recordPendingEntitlement(db.admin, args));
    const { value: second } = await quietly(() => mod.recordPendingEntitlement(db.admin, args));
    o.E = { first, second, rows: db.tables.pending_entitlements.map((r) => ({ ...r })) };
  }

  // --- G. the profile already carries a DIFFERENT customer id --------------
  // Seen live on 2026-08-20. linkCustomerId is first-writer-wins, so the id the
  // pending row carried is NOT stored. The guard is right -- clobbering would
  // break renewals for the subscription the existing id belongs to -- but the
  // losing side can be the one that matters, and one profile cannot hold two
  // Stripe customers. So the requirement is that it stops being silent.
  {
    const db = createFakeDb({
      profiles: [{ ...blankProfile('p1'), stripe_customer_id: 'cus_existing_live' }],
      pending_entitlements: [
        pendingRow({
          plan: 'teacher-core',
          plan_term: 'monthly',
          stripe_customer_id: 'cus_from_pending',
        }),
      ],
    });
    const { value, logs } = await quietly(() =>
      mod.claimPending(db.admin, 'p1', { sessionId: SESSION })
    );
    o.G = { results: value, profile: db.tables.profiles[0], logs };
  }

  // --- H. the same collision, but on a ONE-TIME purchase --------------------
  // Nothing renews, so nothing drops. The alert must still fire and must NOT
  // claim renewals are at risk -- an ops message that overstates the damage is
  // the same defect as the one the unmatched-checkout email had.
  {
    const db = createFakeDb({
      profiles: [{ ...blankProfile('p1'), stripe_customer_id: 'cus_existing_live' }],
      pending_entitlements: [pendingRow({ stripe_customer_id: 'cus_from_pending' })],
    });
    const { logs } = await quietly(() => mod.claimPending(db.admin, 'p1', { sessionId: SESSION }));
    o.H = { logs };
  }

  return o;
}

// ---------------------------------------------------------------------------
// Scenario F: the auth/callback skip.
//
// NOT A RUN. See the header. F1 lifts the guard expression out of the source and
// evaluates it, which is behavioural; F2 is a structural claim about where the
// claim call sits, which is not.
// ---------------------------------------------------------------------------

// COMMENTS ARE REMOVED BEFORE ANY STRUCTURAL CHECK, and this is not tidiness.
// Measured: with the raw source, replacing the real call with the comment
// "// the sweep used to call claimPending(admin, ...) here" left BOTH F2 and F3
// green. A structural assertion that a prose mention can satisfy is not an
// assertion. Quote-aware, so a "//" inside a string literal is not mistaken for
// the start of a comment.
function stripComments(src) {
  let out = '';
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      out += c;
      if (c === '\\') { out += next ?? ''; i += 2; continue; }
      if (c === quote) quote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; out += c; i++; continue; }
    if (c === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && next === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function guardBlock(src) {
  // The `if (!headingToClaim) { ... }` body, matched by brace depth rather than
  // by a lazy regex, so a call added after the block cannot be mistaken for one
  // inside it.
  const marker = 'if (!headingToClaim) {';
  const start = src.indexOf(marker);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start + marker.length - 1; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  return null;
}

function guardPredicate(src) {
  const m = src.match(/const headingToClaim = (.+)/);
  if (!m) return null;
  const expr = m[1].replace(/;?\s*$/, '');
  try {
    return new Function('next', `return (${expr});`);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------

const ASSERTIONS = {
  // --- A ---
  'A1 an ordinary claim reports "claimed"': (o) =>
    o.A.results.length === 1 && o.A.results[0].outcome === 'claimed',

  'A2 the entitlement actually reaches the profile': (o) =>
    o.A.profile.plan === 'practice-pass' &&
    o.A.profile.plan_status === 'active' &&
    o.A.profile.plan_term === 'one-time',

  'A3 the row is marked claimed': (o) => o.A.row.claimed_at !== null,

  // The invariant the whole file exists for. Stated as an implication so it can
  // only go red for the reason it names.
  'A4 a MARKED row always has an entitlement behind it': (o) =>
    o.A.row.claimed_at === null || o.A.profile.plan !== null,

  'A5 linkCustomerId ran: the customer is on the profile': (o) =>
    o.A.profile.stripe_customer_id === 'cus_test_primary',

  'A6 access_until is the row\'s, measured from event time, NOT from claim time': (o) =>
    o.A.profile.access_until === ACCESS_UNTIL,

  'A7 the replay is ordered by the EVENT timestamp, not by claim time': (o) =>
    o.A.profile.plan_updated_at === EVENT_AT,

  // --- B ---
  'B1 a second claim of the same session id reports "already-claimed"': (o) =>
    o.B.second.length === 1 && o.B.second[0].outcome === 'already-claimed',

  'B2 a second ACCOUNT receives nothing from an already-claimed session': (o) =>
    o.B.thief.plan === null && o.B.thief.access_until === null,

  'B3 a second claim writes to no profile at all': (o) => o.B.extraProfileWrites === 0,

  // --- C ---
  'C1 a missing profile is reported as no-profile, not as stale': (o) =>
    o.C.ghost.length === 1 && o.C.ghost[0].outcome === 'no-profile',

  'C2 a missing profile leaves the row UNCLAIMED': (o) => o.C.rowAfterGhost.claimed_at === null,

  'C3 and the debt is still deliverable afterwards': (o) =>
    o.C.recovery.length === 1 &&
    o.C.recovery[0].outcome === 'claimed' &&
    o.C.profile.plan === 'practice-pass',

  // --- D ---
  'D1 an email claim settles EVERY debt it finds': (o) =>
    o.D.results.length === 2 && o.D.results.every((r) => r.outcome === 'claimed'),

  'D2 every matched row is marked': (o) => o.D.rows.every((r) => r.claimed_at !== null),

  'D3 oldest first, so the NEWEST purchase is what the profile ends up with': (o) =>
    o.D.profile.plan === 'full-course' && o.D.profile.plan_updated_at === EVENT_AT,

  // --- E ---
  'E1 a first capture is recorded': (o) => o.E.first === 'recorded' && o.E.rows.length === 1,

  'E2 a redelivery is a duplicate, not a second debt': (o) =>
    o.E.second === 'duplicate' && o.E.rows.length === 1,

  'E3 the stored email is lowercased and trimmed': (o) => o.E.rows[0].email === 'buyer@example.com',

  // --- G / H ---
  'G1 a customer id already on the profile is LEFT ALONE': (o) =>
    o.G.profile.stripe_customer_id === 'cus_existing_live',

  'G2 the claim still succeeds despite the customer id not linking': (o) =>
    o.G.results.length === 1 && o.G.results[0].outcome === 'claimed',

  'G3 the unlinked customer is reported, naming the id and the renewal risk': (o) =>
    o.G.logs.some(
      (l) =>
        l.includes('CUSTOMER NOT LINKED') &&
        l.includes('cus_from_pending') &&
        l.includes('RENEWALS WILL RESOLVE TO NOBODY')
    ),

  'H1 the same collision on a ONE-TIME pass reports, but claims no renewal risk': (o) =>
    o.H.logs.some((l) => l.includes('CUSTOMER NOT LINKED') && l.includes('no renewals to lose')) &&
    !o.H.logs.some((l) => l.includes('RENEWALS WILL RESOLVE TO NOBODY')),

  // --- F (see the header: F1 evaluates, F2 is structural) ---
  'F1 the skip predicate is true for /claim and false for everything else': (o, cbSrc) => {
    const p = guardPredicate(stripComments(cbSrc));
    if (!p) return false;
    return (
      p('/claim') === true &&
      p('/claim?checkout_session_id=cs_test') === true &&
      p('/dashboard') === false &&
      p('/teacher') === false &&
      // The near-miss that a startsWith('/claim') alone would get wrong.
      p('/claiming-something') === false
    );
  },

  'F2 [structural] the email claim sits INSIDE the guarded block': (o, cbSrc) => {
    const block = guardBlock(stripComments(cbSrc));
    return block !== null && /claimPending\(/.test(block);
  },

  'F3 [structural] and there is no second, unguarded claimPending call': (o, cbSrc) =>
    (stripComments(cbSrc).match(/claimPending\(/g) ?? []).length === 1,
};

// ---------------------------------------------------------------------------
// Faults. Each is one edit to a COPY of the source. `expect` names every
// assertion that must go red; any other one going red means the fault is too
// broad to prove anything, and any listed one staying green means the check
// did not notice.
// ---------------------------------------------------------------------------

const FAULTS = [
  {
    name: 'the row is marked claimed without the entitlement ever being written',
    target: 'module',
    edit: (s) =>
      s.replace(
        'const written = await writeEntitlement(admin, profileId, write, eventCreatedMs, source);',
        'const written = "written";'
      ),
    expect: [
      'A2 the entitlement actually reaches the profile',
      'A4 a MARKED row always has an entitlement behind it',
      'A6 access_until is the row\'s, measured from event time, NOT from claim time',
      'A7 the replay is ordered by the EVENT timestamp, not by claim time',
      'C1 a missing profile is reported as no-profile, not as stale',
      'C2 a missing profile leaves the row UNCLAIMED',
      'C3 and the debt is still deliverable afterwards',
      'D3 oldest first, so the NEWEST purchase is what the profile ends up with',
    ],
  },
  {
    name: 'the entitlement is written but linkCustomerId is never called',
    target: 'module',
    edit: (s) =>
      s.replace(
        'const linked = await linkCustomerId(admin, profileId, row.stripe_customer_id);',
        'const linked = "none";'
      ),
    expect: [
      'A5 linkCustomerId ran: the customer is on the profile',
      // Collateral, and legitimate: with no link attempted there is no decline
      // to report, so the collision goes unreported too.
      'G3 the unlinked customer is reported, naming the id and the renewal risk',
      'H1 the same collision on a ONE-TIME pass reports, but claims no renewal risk',
    ],
  },
  {
    name: 'the already-claimed guard is dropped, so a second account can take the purchase',
    target: 'module',
    edit: (s) => s.replace('if (row.claimed_at) {', 'if (false) {'),
    expect: [
      'B1 a second claim of the same session id reports "already-claimed"',
      'B2 a second ACCOUNT receives nothing from an already-claimed session',
      'B3 a second claim writes to no profile at all',
    ],
  },
  {
    name: 'access_until is recomputed from claim time instead of read off the row',
    target: 'module',
    edit: (s) =>
      s.replace(
        'accessUntil: row.access_until ? new Date(row.access_until) : null,',
        'accessUntil: row.access_until ? new Date(Date.now() + 182 * 24 * 3600 * 1000) : null,'
      ),
    expect: ['A6 access_until is the row\'s, measured from event time, NOT from claim time'],
  },
  {
    // The injected clock reading is FROZEN rather than Date.now(). With a live
    // clock, two claims in the same email sweep land either one millisecond
    // apart or in the same millisecond depending on machine speed, and the
    // second is written or stale accordingly -- so the fault would be caught
    // flakily. A constant makes the two claims collide every time, which is the
    // worse of the two real behaviours and the one worth pinning.
    name: 'the replay is ordered by a clock reading at claim time, not by the Stripe event timestamp',
    target: 'module',
    edit: (s) =>
      s.replace(
        'const eventCreatedMs = new Date(row.event_created_at).getTime();',
        "const eventCreatedMs = Date.parse('2030-01-01T00:00:00.000Z');"
      ),
    expect: [
      'A7 the replay is ordered by the EVENT timestamp, not by claim time',
      // Collateral, and legitimate: ordering every replay by one claim-time
      // reading makes the second debt in a sweep look stale to its own profile.
      'D1 an email claim settles EVERY debt it finds',
      'D3 oldest first, so the NEWEST purchase is what the profile ends up with',
    ],
  },
  {
    name: 'a missing profile is treated as stale, so the row is marked and the debt erased',
    target: 'module',
    edit: (s) => s.replace('if (!profile) {', 'if (false) {'),
    expect: [
      'C1 a missing profile is reported as no-profile, not as stale',
      'C2 a missing profile leaves the row UNCLAIMED',
      'C3 and the debt is still deliverable afterwards',
    ],
  },
  {
    name: 'the email lookup stops filtering on unclaimed rows',
    target: 'module',
    edit: (s) => s.replace('.is("claimed_at", null)\n    .order("event_created_at"', '.order("event_created_at"'),
    expect: [],
    // Deliberately expects NOTHING: with a clean fixture every row is unclaimed,
    // so removing the filter changes no observable behaviour here. It is listed
    // to record that this harness does NOT cover that filter, rather than to
    // leave the gap unmentioned.
    documentsAGap: true,
  },
  {
    name: 'auth/callback claims by email even when /claim is the destination',
    target: 'callback',
    edit: (s) => s.replace('if (!headingToClaim) {', 'if (true) {'),
    expect: ['F2 [structural] the email claim sits INSIDE the guarded block'],
  },
  {
    // The guard whose absence would have clobbered a live customer id. Faulted
    // in stripe-activation.ts itself, which is why the loader can repoint the
    // import at a faulted copy.
    name: 'linkCustomerId drops its null guard and clobbers an existing customer id',
    target: 'activation',
    edit: (s) =>
      s.replace('    .is("stripe_customer_id", null)\n    .select("id");', '    .select("id");'),
    expect: [
      'G1 a customer id already on the profile is LEFT ALONE',
      'G3 the unlinked customer is reported, naming the id and the renewal risk',
      'H1 the same collision on a ONE-TIME pass reports, but claims no renewal risk',
    ],
  },
  {
    name: 'the claim goes back to discarding the link outcome, so the decline is silent again',
    target: 'module',
    edit: (s) =>
      s.replace(
        '  if (linked === "already-linked") {\n    await alertUnlinkedCustomer(profileId, row, source);\n  }',
        ''
      ),
    expect: [
      'G3 the unlinked customer is reported, naming the id and the renewal risk',
      'H1 the same collision on a ONE-TIME pass reports, but claims no renewal risk',
    ],
  },
  {
    // The alert must not overstate the damage. A one-time pass generates no
    // subscription events, so there is nothing to renew and nothing to drop.
    name: 'the unlinked-customer alert claims renewals are at risk for a one-time pass',
    target: 'module',
    edit: (s) =>
      s.replace(
        'const subscription = row.plan_term === "monthly" || row.plan_term === "annual";',
        'const subscription = true;'
      ),
    expect: ['H1 the same collision on a ONE-TIME pass reports, but claims no renewal risk'],
  },
  {
    // THE FAULT THAT JUSTIFIES stripComments. Before it existed, this edit left
    // F2 and F3 both GREEN: the regex found "claimPending(" in the comment and
    // was satisfied by a sentence describing code that is no longer there.
    name: 'the email claim is deleted, leaving only a comment that mentions claimPending()',
    target: 'callback',
    edit: (s) =>
      s.replace(
        'const results = await claimPending(admin, data.user.id, { email: data.user.email })',
        'const results = [] // the sweep used to call claimPending(admin, ...) here'
      ),
    expect: [
      'F2 [structural] the email claim sits INSIDE the guarded block',
      'F3 [structural] and there is no second, unguarded claimPending call',
    ],
  },
  {
    name: 'the skip predicate is loosened to a bare startsWith',
    target: 'callback',
    edit: (s) =>
      s.replace(
        "const headingToClaim = next === '/claim' || next.startsWith('/claim?')",
        "const headingToClaim = next.startsWith('/claim')"
      ),
    expect: ['F1 the skip predicate is true for /claim and false for everything else'],
  },
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function runAll(src, cbSrc, actSrc) {
  const o = await observe(src, actSrc);
  const results = {};
  for (const [name, predicate] of Object.entries(ASSERTIONS)) {
    try {
      results[name] = Boolean(predicate(o, cbSrc));
    } catch (err) {
      results[name] = false;
      results[`${name} :: threw`] = String(err && err.message);
    }
  }
  return results;
}

async function main() {
  purgeTempModules();

  console.log('\nCLEAN RUN, every property must hold:\n');
  const clean = await runAll(moduleSrc, callbackSrc, null);
  for (const [name, pass] of Object.entries(clean)) {
    if (name.endsWith(':: threw')) continue;
    check(name, pass, clean[`${name} :: threw`] ?? '');
  }

  console.log('\nFAULT INJECTION, each check must notice its own fault:\n');
  for (const fault of FAULTS) {
    const src = fault.target === 'module' ? fault.edit(moduleSrc) : moduleSrc;
    const cbSrc = fault.target === 'callback' ? fault.edit(callbackSrc) : callbackSrc;
    const actSrc = fault.target === 'activation' ? fault.edit(activationSrc) : null;
    const changed =
      fault.target === 'module'
        ? src !== moduleSrc
        : fault.target === 'callback'
          ? cbSrc !== callbackSrc
          : actSrc !== activationSrc;

    if (!changed) {
      check(`fault applies: ${fault.name}`, false, 'the edit matched nothing, so it proves nothing');
      continue;
    }

    let faulted;
    try {
      faulted = await runAll(src, cbSrc, actSrc);
    } catch (err) {
      check(`fault runs: ${fault.name}`, false, `the faulted module threw: ${err.message}`);
      continue;
    }

    let faultOk = true;
    for (const name of Object.keys(ASSERTIONS)) {
      const held = faulted[name];
      const shouldFail = fault.expect.includes(name);
      if (shouldFail && held) {
        faultOk = false;
        console.log(`  [FAIL] ${fault.name}\n           -> "${name}" did NOT notice`);
      }
      if (!shouldFail && !held) {
        faultOk = false;
        console.log(
          `  [FAIL] ${fault.name}\n           -> "${name}" broke as collateral, so the fault is too broad`
        );
      }
    }
    const label = fault.documentsAGap
      ? `gap recorded (nothing notices): ${fault.name}`
      : `fault caught: ${fault.name}`;
    check(label, faultOk);

    // THE CLEAN CONTROL, AFTER EVERY FAULT. Not ceremony: this harness writes
    // temporary modules to disk and mutates a module-level source binding, so a
    // fault that leaked would show up as a clean run that stopped being clean.
    const control = await runAll(moduleSrc, callbackSrc, null);
    const controlOk = Object.keys(ASSERTIONS).every((name) => control[name]);
    check(`  clean control still green after: ${fault.name}`, controlOk);
  }

  purgeTempModules();

  console.log(
    '\nHOW EACH PROPERTY WAS ESTABLISHED\n' +
      '  A1-A7, B1-B3, C1-C3, D1-D3,         BEHAVIOURAL. The real claimPending,\n' +
      '  E1-E3, G1-G3, H1                    writeEntitlement and linkCustomerId ran\n' +
      '                                      against an in-memory store. G and H also\n' +
      '                                      assert on what the code actually logged.\n' +
      '  F1                                  BEHAVIOURAL, narrowly. The guard expression\n' +
      '                                      was lifted from the source and evaluated.\n' +
      '  F2, F3                              STRUCTURAL. That the claim sits inside the\n' +
      '                                      guarded block is read off the source; the\n' +
      '                                      route handler itself is never executed.\n'
  );

  console.log(ok ? 'All claim checks passed.\n' : 'FAILURES above.\n');
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  purgeTempModules();
  console.error(err);
  process.exit(1);
});
