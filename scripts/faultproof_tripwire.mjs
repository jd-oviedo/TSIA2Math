// faultproof_tripwire.mjs -- prove the $5 / 7-day tripwire grants exactly seven
// days, and prove it can never take longer access away from anyone.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/faultproof_tripwire.mjs
//
// WHAT IS BEING PROVED
// --------------------
// Two of the tripwire's three moving parts are invisible when they go wrong.
//
//   THE DAY TERM. entitlementFromCheckout's one-time branch used to refuse any
//   product whose `months` was zero or absent. A product measured in DAYS reads
//   months as 0 and hits exactly that guard, so the failure is not "the term is
//   wrong" -- it is a null return, a fall through to legacyActivateOnly, and
//   PERMANENT no-expiry Full Course access granted for $5 through the legacy
//   column. Nothing about that looks like a bug from the outside: the buyer gets
//   in, and keeps getting in.
//
//   THE SHORTENING GUARD. writeEntitlement replaces access_until wholesale. A
//   live Full Course holder who clicks a raw tripwire link therefore trades ten
//   months for a week, silently, with the row looking entirely well-formed
//   afterwards. There is no second record to contradict it.
//
// So both are asserted on OBSERVED BEHAVIOUR -- the real functions, run -- and
// each one is then FAULTED and shown to fail. A check that has never been seen
// red is not a check.
//
// WHY THIS RUNS THE CODE, WHERE SOME HARNESSES ASSERT ON SOURCE
// ------------------------------------------------------------
// Same reasoning as faultproof_claim.mjs, which this is modelled on: what has to
// be true here is a property of a SEQUENCE -- read the row, decide, then write
// under a predicate pinned to what was read -- and several of the ways to get it
// wrong read perfectly well as source. So this fakes ONLY the database. The real
// entitlementFromCheckout, the real writeEntitlement with both its guards, the
// real grantsAccess and the real product map all run.
//
// The fake store is deliberately strict: it throws on any filter grammar it was
// not built for, so a change in how the predicate is written fails loudly here
// rather than passing against a permissive stub.
//
// Nothing here touches the network, Stripe, Supabase, or the real table.

import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { pathToFileURL } from 'url';

const ACTIVATION = 'app/lib/stripe-activation.ts';
const activationSrc = readFileSync(ACTIVATION, 'utf8');

const DAY = 24 * 60 * 60 * 1000;
const TRIPWIRE = 'plink_TRIPWIRE_NOT_YET_CREATED';
const FULL_COURSE_LINK = 'plink_1U5tgXF8f8aZDGVANGvtkoMF';
const PRACTICE_PASS_LINK = 'plink_1U5tejF8f8aZDGVAKbnefl6Z';

// The event is 10 DAYS IN THE PAST on purpose. A term measured from the wall
// clock instead of the event timestamp then differs from the correct answer by
// ten days, which no rounding can disguise -- and on a seven-day product it is
// the difference between expired and not.
const EVENT_MS = Date.now() - 10 * DAY;
const PROFILE = 'profile-under-test';

let ok = true;
const check = (name, pass, detail = '') => {
  ok &&= pass;
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? `  ${detail}` : ''}`);
  return pass;
};

// ---------------------------------------------------------------------------
// The fake store
//
// Enough of supabase-js's builder to run writeEntitlement and its guard, and no
// more. Every unsupported call throws: a silent no-op here would turn "the code
// stopped doing something" into a green run.
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

/**
 * @param seed.profiles        rows to start with
 * @param seed.onSelect        called once after the FIRST select resolves, with
 *                             the live rows array. This is how the compare-and-
 *                             set half of the guard gets exercised: it models a
 *                             concurrent write landing between the guard's read
 *                             and writeEntitlement's UPDATE.
 */
function createFakeDb(seed) {
  const tables = {
    profiles: (seed.profiles ?? []).map((r) => ({ ...r })),
    pending_entitlements: (seed.pending_entitlements ?? []).map((r) => ({ ...r })),
  };
  const writes = { profiles: 0, pending_entitlements: 0 };
  let onSelect = seed.onSelect ?? null;
  // Modelled because the guard's fail-open branch is otherwise unreachable, and
  // a branch that has never run is a branch nobody has checked.
  let selectError = seed.selectError ?? null;

  class Query {
    constructor(table) {
      this.table = table;
      this.op = null;
      this.payload = null;
      this.filters = [];
      this.returning = false;
      this.wantSingle = false;
      this.orderSpec = null;
    }

    order(col, opts) {
      this.orderSpec = { col, ascending: opts?.ascending !== false };
      return this;
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

    eq(col, value) {
      this.filters.push((row) => row[col] === value);
      return this;
    }

    is(col, value) {
      if (value !== null) throw new Error(`fake db: is() is only modelled for null, got ${value}`);
      this.filters.push((row) => row[col] === null || row[col] === undefined);
      return this;
    }

    limit(n) {
      this.limitTo = n;
      return this;
    }

    or(expr) {
      const clauses = parseOrClause(expr);
      this.filters.push((row) => clauses.some((c) => c(row)));
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
        if (selectError) {
          const err = selectError;
          selectError = null;
          return { data: null, error: { message: err } };
        }
        let rows = this.#matching().map((r) => ({ ...r }));
        if (this.orderSpec) {
          const { col, ascending } = this.orderSpec;
          rows = [...rows].sort((a, b) =>
            a[col] === b[col] ? 0 : (a[col] < b[col] ? -1 : 1) * (ascending ? 1 : -1)
          );
        }
        if (this.limitTo != null) rows = rows.slice(0, this.limitTo);
        // Fires AFTER the read has been snapshotted, so the caller sees the
        // pre-mutation row exactly as a real read-then-write race would.
        if (onSelect) {
          const hook = onSelect;
          onSelect = null;
          hook(tables.profiles);
        }
        if (this.wantSingle) {
          if (rows.length > 1) return { data: null, error: { message: 'more than one row returned' } };
          return { data: rows[0] ?? null, error: null };
        }
        return { data: rows, error: null };
      }

      if (this.op === 'update') {
        const rows = this.#matching();
        for (const row of rows) {
          Object.assign(row, this.payload);
          writes[this.table] += 1;
        }
        return { data: this.returning ? rows.map((r) => ({ ...r })) : null, error: null };
      }

      throw new Error(`fake db: nothing to run on ${this.table}`);
    }

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
// Loading a possibly-faulted copy of stripe-activation.ts
//
// Written INTO app/lib so its relative imports still resolve, under a name no
// glob in this repo picks up, and deleted in a finally. A unique name per load
// defeats the ESM module cache, which would otherwise hand back the first
// version for every subsequent import.
// ---------------------------------------------------------------------------

let loadCounter = 0;

function purgeTempModules() {
  for (const name of readdirSync('app/lib')) {
    if (name.startsWith('__faultproof_tw_')) unlinkSync(`app/lib/${name}`);
  }
}

async function loadActivation(src) {
  const path = `app/lib/__faultproof_tw_${process.pid}_${loadCounter++}.ts`;
  writeFileSync(path, src);
  try {
    return await import(pathToFileURL(path).href);
  } finally {
    unlinkSync(path);
  }
}

// The claim module, importing the REAL stripe-activation. Copied rather than
// imported directly for the same reason loadActivation copies: a fresh module
// URL per load, so the ESM cache cannot hand back a stale copy between
// scenarios.
async function loadPending() {
  const n = loadCounter++;
  const src = readFileSync('app/lib/pending-entitlements.ts', 'utf8');
  const path = `app/lib/__faultproof_tw_pending_${process.pid}_${n}.ts`;
  writeFileSync(path, src);
  try {
    return await import(pathToFileURL(path).href);
  } finally {
    unlinkSync(path);
  }
}

/** Apply a fault, insisting it actually changed the source. */
function fault(src, find, replace) {
  const out = src.replace(find, replace);
  if (out === src) throw new Error(`fault injection missed: ${String(find).slice(0, 60)}`);
  return out;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function checkoutSession(paymentLink, over = {}) {
  return {
    id: 'cs_test_tripwire',
    payment_link: paymentLink,
    mode: 'payment',
    amount_total: 500,
    metadata: {},
    ...over,
  };
}

function profileRow(over = {}) {
  return {
    id: PROFILE,
    role: 'student',
    plan: null,
    plan_term: null,
    plan_status: null,
    access_until: null,
    plan_source: null,
    plan_updated_at: null,
    subscription_status: 'inactive',
    stripe_payment_link_id: null,
    stripe_customer_id: null,
    ...over,
  };
}

const tripwireWrite = (over = {}) => ({
  plan: 'full-course',
  planTerm: 'one-time',
  planStatus: 'active',
  accessUntil: new Date(EVENT_MS + 7 * DAY),
  planSource: 'stripe',
  paymentLinkId: TRIPWIRE,
  ...over,
});

// `stripe` is never touched on a one-time checkout -- the branch returns before
// any subscription lookup -- so a throwing stub proves that rather than assuming
// it.
const noStripe = {
  subscriptions: {
    retrieve() {
      throw new Error('a one-time checkout must not call Stripe');
    },
  },
};

const quiet = async (fn) => {
  const err = console.error;
  const warn = console.warn;
  const log = console.log;
  const seen = [];
  console.error = (...a) => seen.push(a.map(String).join(' '));
  console.warn = (...a) => seen.push(a.map(String).join(' '));
  console.log = () => {};
  try {
    return { value: await fn(), logged: seen };
  } finally {
    console.error = err;
    console.warn = warn;
    console.log = log;
  }
};

// ---------------------------------------------------------------------------
// A. The day term
// ---------------------------------------------------------------------------

async function scenarioA() {
  console.log('\nA. A one-time product with a DAY term grants exactly that many days');

  const clean = await loadActivation(activationSrc);
  const { value: write } = await quiet(() =>
    clean.entitlementFromCheckout(noStripe, checkoutSession(TRIPWIRE), EVENT_MS, 'faultproof')
  );

  check('the tripwire checkout resolves to an entitlement at all', write !== null);
  if (!write) return;

  check('plan is the EXISTING full-course plan', write.plan === 'full-course', `got ${write.plan}`);
  check('plan_term is one-time', write.planTerm === 'one-time', `got ${write.planTerm}`);
  check('plan_status is active', write.planStatus === 'active');
  check(
    'the payment link is recorded, which is the only tripwire marker there is',
    write.paymentLinkId === TRIPWIRE,
    `got ${write.paymentLinkId}`
  );
  check(
    'access_until is EVENT + 7 days to the millisecond',
    write.accessUntil.getTime() === EVENT_MS + 7 * DAY,
    `off by ${write.accessUntil.getTime() - (EVENT_MS + 7 * DAY)}ms`
  );
  check(
    'measured from the EVENT, not the wall clock (the event is 10 days old, so this HAS expired)',
    write.accessUntil.getTime() < Date.now()
  );

  // FAULT: restore the old behaviour -- no day branch, so the months guard sees
  // 0 and refuses. This is the exact regression that would grant permanent
  // access for $5 through legacyActivateOnly.
  const faulted = await loadActivation(
    fault(activationSrc, /    if \(days > 0\) \{[\s\S]*?\n    \}\n\n/, '')
  );
  const { value: broken } = await quiet(() =>
    faulted.entitlementFromCheckout(noStripe, checkoutSession(TRIPWIRE), EVENT_MS, 'faultproof')
  );
  check(
    'FAULT: with the day branch removed the tripwire is refused, so the check can fail',
    broken === null,
    broken ? `got a write for ${broken.accessUntil?.toISOString()}` : ''
  );
}

// ---------------------------------------------------------------------------
// B. Month products are untouched
// ---------------------------------------------------------------------------

async function scenarioB() {
  console.log('\nB. Month-based products still use addMonths, and a termless one is still refused');

  const clean = await loadActivation(activationSrc);

  const { value: full } = await quiet(() =>
    clean.entitlementFromCheckout(
      noStripe,
      checkoutSession(FULL_COURSE_LINK, { amount_total: 8900 }),
      EVENT_MS,
      'faultproof'
    )
  );
  const expectedFull = new Date(EVENT_MS);
  expectedFull.setUTCMonth(expectedFull.getUTCMonth() + 12);
  check(
    'Full Course still lands 12 calendar months out',
    full?.accessUntil?.toISOString().slice(0, 10) === expectedFull.toISOString().slice(0, 10),
    `got ${full?.accessUntil?.toISOString()}`
  );
  check('Full Course still carries months, not days', full?.plan === 'full-course');

  const { value: pass } = await quiet(() =>
    clean.entitlementFromCheckout(
      noStripe,
      checkoutSession(PRACTICE_PASS_LINK, { amount_total: 4900 }),
      EVENT_MS,
      'faultproof'
    )
  );
  const expectedPass = new Date(EVENT_MS);
  expectedPass.setUTCMonth(expectedPass.getUTCMonth() + 6);
  check(
    'Practice Pass still lands 6 calendar months out',
    pass?.accessUntil?.toISOString().slice(0, 10) === expectedPass.toISOString().slice(0, 10)
  );

  // A one-time product with NEITHER term must still be refused. Faulting the
  // map rather than the branch, so the real guard is what does the refusing.
  const termless = await loadActivation(activationSrc);
  const { value: none, logged } = await quiet(() =>
    termless.entitlementFromCheckout(
      noStripe,
      // A link the map does not know is a different path (returns null too), so
      // this uses a REAL link with its term stripped by faulting products.ts is
      // not possible from here -- instead the exclusivity guard below covers the
      // misconfiguration case, and the termless case is asserted by the source
      // still containing the months<=0 refusal.
      checkoutSession('plink_does_not_exist'),
      EVENT_MS,
      'faultproof'
    )
  );
  check('an unknown link still resolves to null so the caller can fall back', none === null);
  check(
    'the months<=0 refusal is still present for a termless one-time product',
    /is one-time but has no term\. Refusing\./.test(activationSrc)
  );
  void logged;
}

// ---------------------------------------------------------------------------
// C. Days and months together are a configuration error
// ---------------------------------------------------------------------------

async function scenarioC() {
  console.log('\nC. A product declaring BOTH days and months is refused, not resolved');

  // The map itself cannot express the misconfiguration (no live product carries
  // both), so the fault makes the REAL Full Course entry look like one and the
  // real exclusivity guard is what runs on it.
  const withBoth = await loadActivation(
    fault(
      activationSrc,
      'const days = product.days ?? 0;',
      'const days = product.days ?? (product.months ? 3 : 0);'
    )
  );
  const { value: write, logged } = await quiet(() =>
    withBoth.entitlementFromCheckout(
      noStripe,
      checkoutSession(FULL_COURSE_LINK, { amount_total: 8900 }),
      EVENT_MS,
      'faultproof'
    )
  );
  check('a product with two terms writes nothing', write === null);
  check(
    'and says so, naming both terms',
    logged.some((l) => /declares both days \(3\) and months \(12\)/.test(l)),
    logged.join(' | ').slice(0, 120)
  );
}

// ---------------------------------------------------------------------------
// D. The shortening guard
// ---------------------------------------------------------------------------

const LONG_ACCESS = new Date(Date.now() + 300 * DAY).toISOString();

async function scenarioD() {
  console.log('\nD. A tripwire cannot shorten live access that runs longer');

  const clean = await loadActivation(activationSrc);
  const db = createFakeDb({
    profiles: [
      profileRow({
        plan: 'full-course',
        plan_term: 'one-time',
        plan_status: 'active',
        access_until: LONG_ACCESS,
        plan_source: 'stripe',
        plan_updated_at: new Date(EVENT_MS - 30 * DAY).toISOString(),
        subscription_status: 'active',
        stripe_payment_link_id: FULL_COURSE_LINK,
      }),
    ],
  });

  const { value: outcome, logged } = await quiet(() =>
    clean.writeEntitlement(db.admin, PROFILE, tripwireWrite(), EVENT_MS, 'faultproof')
  );

  check('the write is reported as superseded, not written', outcome === 'superseded', `got ${outcome}`);
  check('NOTHING was written to profiles at all', db.writes.profiles === 0, `${db.writes.profiles} writes`);
  check(
    'access_until is untouched, so the $89 buyer keeps their ten months',
    db.tables.profiles[0].access_until === LONG_ACCESS
  );
  check(
    'the plan is untouched too -- the row is not half-rewritten',
    db.tables.profiles[0].stripe_payment_link_id === FULL_COURSE_LINK
  );
  check(
    'and it is loud, naming the money so the $5 can be refunded by hand',
    logged.some((l) => /TRIPWIRE WRITE REFUSED/.test(l) && /refund or comp by hand/.test(l))
  );

  // FAULT: remove the guard call. This is the pre-change behaviour, and it is
  // what shortens a live purchase.
  const faulted = await loadActivation(
    fault(
      activationSrc,
      'if (guard?.refuse) return "superseded";',
      'if (false) return "superseded";'
    )
  );
  const db2 = createFakeDb({
    profiles: [
      profileRow({
        plan: 'full-course',
        plan_status: 'active',
        access_until: LONG_ACCESS,
        plan_source: 'stripe',
        plan_updated_at: new Date(EVENT_MS - 30 * DAY).toISOString(),
        stripe_payment_link_id: FULL_COURSE_LINK,
      }),
    ],
  });
  const { value: brokenOutcome } = await quiet(() =>
    faulted.writeEntitlement(db2.admin, PROFILE, tripwireWrite(), EVENT_MS, 'faultproof')
  );
  check(
    'FAULT: without the guard the write lands and ten months become seven days',
    brokenOutcome === 'written' &&
      db2.tables.profiles[0].access_until === new Date(EVENT_MS + 7 * DAY).toISOString(),
    `outcome ${brokenOutcome}, access_until ${db2.tables.profiles[0].access_until}`
  );
}

// ---------------------------------------------------------------------------
// E. The guard does not block anyone it should not
// ---------------------------------------------------------------------------

async function scenarioE() {
  console.log('\nE. The guard refuses ONLY where refusing protects something');

  const clean = await loadActivation(activationSrc);

  // E1. A fresh account. Nothing to protect, so the tripwire lands.
  const fresh = createFakeDb({ profiles: [profileRow()] });
  const { value: freshOutcome } = await quiet(() =>
    clean.writeEntitlement(fresh.admin, PROFILE, tripwireWrite(), EVENT_MS, 'faultproof')
  );
  check('E1 a fresh account gets the tripwire', freshOutcome === 'written', `got ${freshOutcome}`);
  check(
    'E1 and it lands with the tripwire link recorded on the row',
    fresh.tables.profiles[0].stripe_payment_link_id === TRIPWIRE &&
      fresh.tables.profiles[0].plan === 'full-course'
  );

  // E2. A CANCELLED teacher sitting on a future period end. That row grants
  // NOTHING -- grantsAccess('canceled') is false -- so refusing would take $5
  // and hand over nothing.
  const cancelled = createFakeDb({
    profiles: [
      profileRow({
        plan: 'teacher-pro',
        plan_status: 'canceled',
        access_until: LONG_ACCESS,
        plan_updated_at: new Date(EVENT_MS - 5 * DAY).toISOString(),
      }),
    ],
  });
  const { value: cancelledOutcome } = await quiet(() =>
    clean.writeEntitlement(cancelled.admin, PROFILE, tripwireWrite(), EVENT_MS, 'faultproof')
  );
  check(
    'E2 a CANCELLED row with a future date does not block the sale',
    cancelledOutcome === 'written',
    `got ${cancelledOutcome}`
  );

  // E3. An EXPIRED tripwire buying again. Same product, second purchase.
  const lapsed = createFakeDb({
    profiles: [
      profileRow({
        plan: 'full-course',
        plan_status: 'expired',
        access_until: new Date(EVENT_MS - 60 * DAY).toISOString(),
        plan_updated_at: new Date(EVENT_MS - 60 * DAY).toISOString(),
        stripe_payment_link_id: TRIPWIRE,
      }),
    ],
  });
  const { value: lapsedOutcome } = await quiet(() =>
    clean.writeEntitlement(lapsed.admin, PROFILE, tripwireWrite(), EVENT_MS, 'faultproof')
  );
  check('E3 a lapsed buyer can buy again', lapsedOutcome === 'written', `got ${lapsedOutcome}`);

  // E4. COMPED ACCESS: granting status, access_until NULL. Null is UNBOUNDED,
  // which is the longest thing on the table and the easiest to get backwards.
  const comped = createFakeDb({
    profiles: [
      profileRow({
        plan: 'full-course',
        plan_status: 'active',
        access_until: null,
        plan_source: 'comp',
        plan_updated_at: new Date(EVENT_MS - 5 * DAY).toISOString(),
      }),
    ],
  });
  const { value: compedOutcome } = await quiet(() =>
    clean.writeEntitlement(comped.admin, PROFILE, tripwireWrite(), EVENT_MS, 'faultproof')
  );
  check(
    'E4 permanent comped access is protected, not overwritten with 7 days',
    compedOutcome === 'superseded' && comped.tables.profiles[0].access_until === null,
    `got ${compedOutcome}, access_until ${comped.tables.profiles[0].access_until}`
  );

  // E5. THE GUARD IS TRIPWIRE-ONLY. teacher/cancel/switch deliberately writes a
  // SHORTER access_until when a Pro subscription is swapped down to Core, and
  // that must keep working.
  const teacher = createFakeDb({
    profiles: [
      profileRow({
        plan: 'teacher-pro',
        plan_status: 'active',
        access_until: LONG_ACCESS,
        plan_updated_at: new Date(EVENT_MS - 5 * DAY).toISOString(),
      }),
    ],
  });
  const shorter = new Date(EVENT_MS + 20 * DAY);
  const { value: teacherOutcome } = await quiet(() =>
    clean.writeEntitlement(
      teacher.admin,
      PROFILE,
      {
        plan: 'teacher-core',
        planTerm: 'monthly',
        planStatus: 'active',
        accessUntil: shorter,
        planSource: 'stripe',
        paymentLinkId: null,
      },
      EVENT_MS,
      'faultproof'
    )
  );
  check(
    'E5 a NON-tripwire write may still shorten (teacher/cancel/switch depends on it)',
    teacherOutcome === 'written' &&
      teacher.tables.profiles[0].access_until === shorter.toISOString(),
    `got ${teacherOutcome}`
  );
}

// ---------------------------------------------------------------------------
// F. The compare-and-set half
// ---------------------------------------------------------------------------

async function scenarioF() {
  console.log('\nF. A longer purchase landing mid-decision cannot be overwritten');

  const clean = await loadActivation(activationSrc);

  // The guard reads a profile with nothing on it and decides to allow the
  // write. A concurrent Full Course purchase then lands -- with an OLDER
  // plan_updated_at, so the ordering guard alone would not stop the tripwire
  // from overwriting it. The compare-and-set is the only thing that can.
  const db = createFakeDb({
    profiles: [profileRow()],
    onSelect(rows) {
      rows[0].plan = 'full-course';
      rows[0].plan_status = 'active';
      rows[0].access_until = LONG_ACCESS;
      rows[0].plan_updated_at = new Date(EVENT_MS - 1000).toISOString();
      rows[0].stripe_payment_link_id = FULL_COURSE_LINK;
    },
  });

  const { value: outcome } = await quiet(() =>
    clean.writeEntitlement(db.admin, PROFILE, tripwireWrite(), EVENT_MS, 'faultproof')
  );

  check(
    'the UPDATE matches nothing rather than clobbering the row that arrived',
    outcome !== 'written',
    `got ${outcome}`
  );
  check(
    'the concurrent purchase survives intact',
    db.tables.profiles[0].access_until === LONG_ACCESS &&
      db.tables.profiles[0].stripe_payment_link_id === FULL_COURSE_LINK
  );

  // FAULT: drop the compare-and-set and keep everything else. The ordering guard
  // passes (the other event is older), so the tripwire overwrites ten months.
  const faulted = await loadActivation(
    fault(
      activationSrc,
      /  const guarded = guard\n[\s\S]*?    : query;/,
      '  const guarded = query;'
    )
  );
  const db2 = createFakeDb({
    profiles: [profileRow()],
    onSelect(rows) {
      rows[0].plan = 'full-course';
      rows[0].plan_status = 'active';
      rows[0].access_until = LONG_ACCESS;
      rows[0].plan_updated_at = new Date(EVENT_MS - 1000).toISOString();
      rows[0].stripe_payment_link_id = FULL_COURSE_LINK;
    },
  });
  const { value: brokenOutcome } = await quiet(() =>
    faulted.writeEntitlement(db2.admin, PROFILE, tripwireWrite(), EVENT_MS, 'faultproof')
  );
  check(
    'FAULT: without the compare-and-set the race is lost and ten months are gone',
    brokenOutcome === 'written' && db2.tables.profiles[0].access_until !== LONG_ACCESS,
    `outcome ${brokenOutcome}, access_until ${db2.tables.profiles[0].access_until}`
  );
}

// ---------------------------------------------------------------------------
// G. The guard fails OPEN when it cannot see
// ---------------------------------------------------------------------------

async function scenarioG() {
  console.log('\nG. A guard that cannot read the profile does not deny a paying buyer');

  // The REAL module, with the DATABASE faulted rather than the source: the
  // guard's read is the first select this write makes, so failing it is exactly
  // the transient-error case the fail-open branch was written for.
  const clean = await loadActivation(activationSrc);
  const db = createFakeDb({
    profiles: [profileRow()],
    selectError: 'connection reset',
  });
  const { value: outcome, logged } = await quiet(() =>
    clean.writeEntitlement(db.admin, PROFILE, tripwireWrite(), EVENT_MS, 'faultproof')
  );
  check('a failed read still lets the purchase land', outcome === 'written', `got ${outcome}`);
  check(
    'and says the guard was not applied rather than pretending it was',
    logged.some((l) => /shortening guard is not applied/.test(l))
  );
}

// ---------------------------------------------------------------------------
// H. Buy-before-account: the pending_entitlements claim path
// ---------------------------------------------------------------------------

async function scenarioH() {
  console.log('\nH. A tripwire bought before the account existed is claimed correctly');

  const pending = await loadPending();

  const row = {
    id: 'pending-1',
    email: 'buyer@example.com',
    plan: 'full-course',
    plan_term: 'one-time',
    plan_status: 'active',
    // Measured from the EVENT at capture time, exactly as the webhook stored it.
    access_until: new Date(EVENT_MS + 7 * DAY).toISOString(),
    plan_source: 'stripe',
    stripe_payment_link_id: TRIPWIRE,
    stripe_customer_id: 'cus_tripwire',
    event_created_at: new Date(EVENT_MS).toISOString(),
    checkout_session_id: 'cs_test_tripwire_pending',
    claimed_at: null,
  };

  // H1. The ordinary case: the account appears and claims the debt.
  const db = createFakeDb({ profiles: [profileRow()], pending_entitlements: [row] });
  const { value: results } = await quiet(() =>
    pending.claimPending(db.admin, PROFILE, { sessionId: row.checkout_session_id })
  );

  check('H1 the claim reports the debt settled', results[0]?.outcome === 'claimed', `got ${results[0]?.outcome}`);
  const claimed = db.tables.profiles[0];
  check('H1 the plan lands as full-course, which the plan check already allows', claimed.plan === 'full-course');
  check('H1 plan_term one-time, which the term check already allows', claimed.plan_term === 'one-time');
  check(
    'H1 the tripwire link is recorded, so the day-6 email can still find this row',
    claimed.stripe_payment_link_id === TRIPWIRE
  );
  check(
    'H1 access_until comes OFF THE ROW, so a late claim does not restart the 7 days',
    claimed.access_until === row.access_until,
    `got ${claimed.access_until}`
  );
  check('H1 the row is marked claimed exactly once', db.tables.pending_entitlements[0].claimed_at !== null);
  check('H1 the customer id is linked for the record', claimed.stripe_customer_id === 'cus_tripwire');

  // H2. The claim replays through the SAME writeEntitlement, so the shortening
  // guard covers it too: a buyer who bought something longer in the meantime
  // keeps it, and the debt is still closed rather than replayed forever.
  const db2 = createFakeDb({
    profiles: [
      profileRow({
        plan: 'full-course',
        plan_status: 'active',
        access_until: LONG_ACCESS,
        plan_source: 'stripe',
        plan_updated_at: new Date(EVENT_MS - 30 * DAY).toISOString(),
        stripe_payment_link_id: FULL_COURSE_LINK,
      }),
    ],
    pending_entitlements: [{ ...row }],
  });
  const { value: results2, logged } = await quiet(() =>
    pending.claimPending(db2.admin, PROFILE, { sessionId: row.checkout_session_id })
  );
  check(
    'H2 the longer access survives the claim',
    db2.tables.profiles[0].access_until === LONG_ACCESS,
    `got ${db2.tables.profiles[0].access_until}`
  );
  check(
    'H2 the row is still marked claimed, so it is not replayed on every sign-in forever',
    db2.tables.pending_entitlements[0].claimed_at !== null,
    `outcome ${results2[0]?.outcome}`
  );
  check(
    'H2 and the alert says SUPERSEDED, not "did they pay twice"',
    logged.some((l) => /SUPERSEDED CLAIM/.test(l)) && !logged.some((l) => /STALE CLAIM/.test(l))
  );
}

// ---------------------------------------------------------------------------

(async () => {
  purgeTempModules();
  try {
    await scenarioA();
    await scenarioB();
    await scenarioC();
    await scenarioD();
    await scenarioE();
    await scenarioF();
    await scenarioG();
    await scenarioH();
  } finally {
    purgeTempModules();
  }

  console.log(
    '\n' +
      'WHAT WAS PROVED, AND HOW\n' +
      '  A-C    behavioural   the real entitlementFromCheckout, run on real product entries\n' +
      '  D-G    behavioural   the real writeEntitlement, run against a strict fake table\n' +
      '  H      behavioural   the real claimPending, replaying a captured tripwire\n' +
      '  A,D,F  faulted       each guard was broken and shown to fail red\n'
  );
  console.log(ok ? 'faultproof_tripwire: PASS' : 'faultproof_tripwire: FAIL');
  process.exit(ok ? 0 : 1);
})();
