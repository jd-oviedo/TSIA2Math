import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isEntitled,
  grantsAccess,
  legacySubscriptionStatus,
  isEntitledWithLegacyFallback,
  ACCESS_GRACE_MS,
} from '../app/lib/entitlement.ts';
import {
  addMonths,
  productForPaymentLink,
  planForSubscriptionAmount,
  PRODUCTS_BY_PAYMENT_LINK,
  subscriptionPeriodEnd,
  entitlementFromSubscription,
} from '../app/lib/products.ts';

// The entitlement rule and the two identity maps, tested where they are pure
// functions. The database side -- the ordering guard on the UPDATE, and the
// constraints that make a partial write throw -- cannot be exercised here and is
// checked against production in Phase 6.

const NOW = new Date('2026-08-18T12:00:00Z');

// ---------------------------------------------------------------------------
// The rule
// ---------------------------------------------------------------------------

test('only active, trialing and past_due grant access', () => {
  for (const s of ['active', 'trialing', 'past_due']) {
    assert.equal(grantsAccess(s), true, `${s} should grant`);
  }
  for (const s of ['incomplete', 'incomplete_expired', 'unpaid', 'canceled', 'paused', 'expired']) {
    assert.equal(grantsAccess(s), false, `${s} should not grant`);
  }
  assert.equal(grantsAccess(null), false);
  assert.equal(grantsAccess(undefined), false);
});

test('past_due keeps access to the end of the paid period', () => {
  const future = new Date('2026-09-18T12:00:00Z');
  assert.equal(isEntitled('past_due', future, NOW), true);
});

test('a granting status alone is not enough once access_until has passed', () => {
  // This is the missed-webhook hole the whole design closes: before Phase 2 a
  // stale 'active' granted forever with nothing in the data able to catch it.
  const wellPast = new Date('2026-01-01T00:00:00Z');
  assert.equal(isEntitled('active', wellPast, NOW), false);
});

test('a null access_until never expires, which is comped and migrated access', () => {
  assert.equal(isEntitled('active', null, NOW), true);
});

test('the grace interval absorbs a late renewal but not an old lapse', () => {
  const justExpired = new Date(NOW.getTime() - 1000);
  assert.equal(isEntitled('active', justExpired, NOW), true, 'inside grace');

  const pastGrace = new Date(NOW.getTime() - ACCESS_GRACE_MS - 1000);
  assert.equal(isEntitled('active', pastGrace, NOW), false, 'outside grace');
});

test('a non-granting status is refused however far in the future access_until is', () => {
  const farFuture = new Date('2030-01-01T00:00:00Z');
  assert.equal(isEntitled('canceled', farFuture, NOW), false);
  assert.equal(isEntitled('unpaid', farFuture, NOW), false);
  assert.equal(isEntitled('paused', farFuture, NOW), false);
});

test('an unparseable access_until is refused rather than treated as no expiry', () => {
  assert.equal(isEntitled('active', 'not-a-date', NOW), false);
});

test('the legacy flag is derived from the same rule, so the two cannot drift', () => {
  assert.equal(legacySubscriptionStatus('active', null, NOW), 'active');
  assert.equal(legacySubscriptionStatus('past_due', new Date('2026-09-18T12:00:00Z'), NOW), 'active');
  assert.equal(legacySubscriptionStatus('canceled', null, NOW), 'inactive');
  assert.equal(legacySubscriptionStatus('active', new Date('2026-01-01T00:00:00Z'), NOW), 'inactive');
});

// ---------------------------------------------------------------------------
// Product identity
// ---------------------------------------------------------------------------

test('all eight live Payment Links resolve, and to distinct amounts', () => {
  const ids = Object.keys(PRODUCTS_BY_PAYMENT_LINK);
  assert.equal(ids.length, 8, 'eight live links, six public plus two founding');

  const amounts = new Set<number>();
  for (const id of ids) {
    const p = productForPaymentLink(id);
    assert.ok(p, `${id} should resolve`);
    amounts.add(p!.amountTotal);
  }
  assert.equal(amounts.size, 8, 'amounts must stay distinct for the cross-check to mean anything');
});

test('the two founding links map to teacher-core, not a tier of their own', () => {
  assert.equal(productForPaymentLink('plink_1Ts6onF8f8aZDGVA7rSbLxdB')!.plan, 'teacher-core');
  assert.equal(productForPaymentLink('plink_1Ts6pxF8f8aZDGVAGuq8UNof')!.plan, 'teacher-core');
});

test('one-time products carry a term and subscriptions do not', () => {
  assert.equal(productForPaymentLink('plink_1U5tejF8f8aZDGVAKbnefl6Z')!.months, 6);  // Practice Pass
  assert.equal(productForPaymentLink('plink_1U5tgXF8f8aZDGVANGvtkoMF')!.months, 12); // Full Course
  assert.equal(productForPaymentLink('plink_1U5tuZF8f8aZDGVARYelic7d')!.months, undefined);
});

test('an unknown or absent payment link resolves to null rather than a guess', () => {
  assert.equal(productForPaymentLink('plink_notreal'), null);
  assert.equal(productForPaymentLink(null), null);
});

test('subscription amounts identify a plan when the interval agrees', () => {
  assert.deepEqual(planForSubscriptionAmount(1000, 'month'), { plan: 'teacher-core', term: 'monthly' });
  assert.deepEqual(planForSubscriptionAmount(30000, 'year'), { plan: 'teacher-pro', term: 'annual' });
});

test('a disagreeing interval returns null rather than pairing a plan with a wrong term', () => {
  assert.equal(planForSubscriptionAmount(1000, 'year'), null);
  assert.equal(planForSubscriptionAmount(30000, 'month'), null);
  assert.equal(planForSubscriptionAmount(4900, 'month'), null, 'one-time price is not a subscription');
  assert.equal(planForSubscriptionAmount(null, 'month'), null);
});

// ---------------------------------------------------------------------------
// Term arithmetic
// ---------------------------------------------------------------------------

test('adding months clamps instead of rolling into the next month', () => {
  // Aug 31 + 6 months is Feb 28/29, not March 2 or 3. Plain setMonth rolls over,
  // which would hand some buyers extra days purely for buying on the 31st.
  assert.equal(addMonths(new Date('2026-08-31T00:00:00Z'), 6).toISOString().slice(0, 10), '2027-02-28');
  assert.equal(addMonths(new Date('2024-08-31T00:00:00Z'), 6).toISOString().slice(0, 10), '2025-02-28');
  // A leap year target still clamps correctly.
  assert.equal(addMonths(new Date('2023-08-31T00:00:00Z'), 6).toISOString().slice(0, 10), '2024-02-29');
});

test('ordinary dates add cleanly', () => {
  assert.equal(addMonths(new Date('2026-08-18T12:00:00Z'), 6).toISOString().slice(0, 10), '2027-02-18');
  assert.equal(addMonths(new Date('2026-08-18T12:00:00Z'), 12).toISOString().slice(0, 10), '2027-08-18');
});

// ---------------------------------------------------------------------------
// The Stripe v22 field move
// ---------------------------------------------------------------------------

function fakeSub(over: Record<string, unknown> = {}) {
  return {
    id: 'sub_test',
    status: 'active',
    customer: 'cus_test',
    items: { data: [{ current_period_end: 1789000000, price: { unit_amount: 2000, recurring: { interval: 'month' } } }] },
    ...over,
  } as never;
}

test('period end is read from the subscription ITEM, not the subscription', () => {
  // current_period_end does not exist on the Subscription object in stripe-node
  // v22. Reading sub.current_period_end yields undefined and then an Invalid
  // Date, which writes either a constraint violation or garbage.
  assert.deepEqual(subscriptionPeriodEnd(fakeSub()), new Date(1789000000 * 1000));
});

test('the furthest item wins, and no items yields null rather than Invalid Date', () => {
  const multi = fakeSub({
    items: { data: [{ current_period_end: 1700000000 }, { current_period_end: 1800000000 }] },
  });
  assert.deepEqual(subscriptionPeriodEnd(multi), new Date(1800000000 * 1000));

  assert.equal(subscriptionPeriodEnd(fakeSub({ items: { data: [] } })), null);
  assert.equal(subscriptionPeriodEnd(fakeSub({ items: undefined })), null);
});

// ---------------------------------------------------------------------------
// The pairing constraint, which is what a bad subscription write would violate
// ---------------------------------------------------------------------------

test('a subscription event uses the plan already on the profile', () => {
  const w = entitlementFromSubscription(fakeSub(), { plan: 'teacher-pro', term: 'annual' });
  assert.equal(w!.plan, 'teacher-pro');
  assert.equal(w!.planTerm, 'annual');
  assert.equal(w!.planStatus, 'active');
});

test('with no plan on the profile it falls back to the recurring amount', () => {
  // This is the out-of-order case: subscription.updated arriving before the
  // checkout.session.completed that would have set the plan.
  const w = entitlementFromSubscription(fakeSub(), null);
  assert.equal(w!.plan, 'teacher-core');
  assert.equal(w!.planTerm, 'monthly');
});

test('a plan it cannot name returns null, so the caller writes nothing at all', () => {
  // Writing plan_status without plan violates profiles_plan_pairing_check, which
  // throws, 500s, and has Stripe retry the event forever.
  const unknownPrice = fakeSub({
    items: { data: [{ current_period_end: 1789000000, price: { unit_amount: 777, recurring: { interval: 'month' } } }] },
  });
  assert.equal(entitlementFromSubscription(unknownPrice, null), null);
});

test('a deleted subscription is recorded as canceled whatever status it carried', () => {
  const w = entitlementFromSubscription(fakeSub({ status: 'active' }), { plan: 'teacher-core', term: 'monthly' }, 'canceled');
  assert.equal(w!.planStatus, 'canceled');
  assert.equal(isEntitled(w!.planStatus, w!.accessUntil, NOW), false);
});

test('the raw Stripe status is stored verbatim, never judged at write time', () => {
  for (const status of ['incomplete', 'incomplete_expired', 'unpaid', 'paused', 'trialing', 'past_due']) {
    const w = entitlementFromSubscription(fakeSub({ status }), { plan: 'teacher-core', term: 'monthly' });
    assert.equal(w!.planStatus, status, `${status} must survive to the column unchanged`);
  }
});

// ─── The transition predicate ────────────────────────────────────────────────
//
// Every one of the six subscription_status readers now goes through this, so
// what it gets wrong, they all get wrong together. The two cases that matter are
// the two that could lock out a real paying customer.

const quiet = (fn: () => boolean): boolean => {
  // The legacy branch warns on purpose. Silenced here so a passing run is
  // readable, and asserted separately below.
  const original = console.warn;
  console.warn = () => {};
  try {
    return fn();
  } finally {
    console.warn = original;
  }
};

test('a real entitlement is granted without consulting the legacy column', () => {
  const future = new Date(Date.now() + 86_400_000).toISOString();
  assert.equal(
    isEntitledWithLegacyFallback('active', future, 'inactive', 'test'),
    true,
    'the new columns are authoritative; a stale legacy flag must not veto them'
  );
});

test('THE MIGRATION BACKFILL ROW STILL GRANTS, so no existing teacher is locked out', () => {
  // sql/entitlement_columns.sql wrote plan_status='active' with access_until
  // NULL for every active teacher, fail-open on purpose. isEntitled treats null
  // as no expiry. If this ever fails, moving the readers has just cut off every
  // teacher who predates the entitlement columns.
  assert.equal(isEntitledWithLegacyFallback('active', null, 'active', 'test'), true);
  assert.equal(isEntitledWithLegacyFallback('active', null, 'inactive', 'test'), true);
});

test('THE legacyActivateOnly ROW STILL GRANTS, which is the whole reason this exists', () => {
  // That fallback writes subscription_status='active' and NO plan, because it
  // cannot name the product and a half-written plan violates the pairing
  // constraint. On isEntitled alone this row denies, so the fallback that exists
  // to stop a buyer paying for nothing would become the thing that locks them
  // out.
  assert.equal(quiet(() => isEntitledWithLegacyFallback(null, null, 'active', 'test')), true);
});

test('the legacy branch warns, so the fallback is visible rather than silent', () => {
  const seen: string[] = [];
  const original = console.warn;
  console.warn = (msg: unknown) => seen.push(String(msg));
  try {
    isEntitledWithLegacyFallback(null, null, 'active', 'requireTeacher');
  } finally {
    console.warn = original;
  }
  assert.equal(seen.length, 1);
  assert.match(seen[0], /requireTeacher/);
  assert.match(seen[0], /legacyActivateOnly/);
});

test('a lapsed row with no legacy flag is refused', () => {
  const past = new Date(Date.now() - 30 * 86_400_000).toISOString();
  assert.equal(isEntitledWithLegacyFallback('active', past, 'inactive', 'test'), false);
  assert.equal(isEntitledWithLegacyFallback('canceled', null, 'inactive', 'test'), false);
  assert.equal(isEntitledWithLegacyFallback(null, null, null, 'test'), false);
  assert.equal(isEntitledWithLegacyFallback(null, null, 'inactive', 'test'), false);
});

test('the legacy flag only ever adds, it never subtracts', () => {
  // Both halves are OR-ed, so no value of subscription_status can take away an
  // entitlement the new columns grant. That direction matters: a stale
  // 'inactive' must not revoke a live plan.
  const future = new Date(Date.now() + 86_400_000).toISOString();
  for (const legacy of ['active', 'inactive', null, undefined, '']) {
    assert.equal(isEntitledWithLegacyFallback('trialing', future, legacy, 'test'), true, String(legacy));
  }
});
