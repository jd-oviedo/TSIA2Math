import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isEntitled,
  grantsAccess,
  legacySubscriptionStatus,
  isEntitledWithLegacyFallback,
  accessGraceMs,
  ACCESS_GRACE_MS,
} from '../app/lib/entitlement.ts';
import {
  addMonths,
  productForPaymentLink,
  planForSubscriptionAmount,
  PRODUCTS_BY_PAYMENT_LINK,
  TRIPWIRE_PAYMENT_LINK_ID,
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
  assert.equal(isEntitled('past_due', future, null, NOW), true);
});

test('a granting status alone is not enough once access_until has passed', () => {
  // This is the missed-webhook hole the whole design closes: before Phase 2 a
  // stale 'active' granted forever with nothing in the data able to catch it.
  const wellPast = new Date('2026-01-01T00:00:00Z');
  assert.equal(isEntitled('active', wellPast, null, NOW), false);
});

test('a null access_until never expires, which is comped and migrated access', () => {
  assert.equal(isEntitled('active', null, null, NOW), true);
});

test('the grace interval absorbs a late renewal but not an old lapse', () => {
  const justExpired = new Date(NOW.getTime() - 1000);
  assert.equal(isEntitled('active', justExpired, null, NOW), true, 'inside grace');

  const pastGrace = new Date(NOW.getTime() - ACCESS_GRACE_MS - 1000);
  assert.equal(isEntitled('active', pastGrace, null, NOW), false, 'outside grace');
});

test('a non-granting status is refused however far in the future access_until is', () => {
  const farFuture = new Date('2030-01-01T00:00:00Z');
  assert.equal(isEntitled('canceled', farFuture, null, NOW), false);
  assert.equal(isEntitled('unpaid', farFuture, null, NOW), false);
  assert.equal(isEntitled('paused', farFuture, null, NOW), false);
});

test('an unparseable access_until is refused rather than treated as no expiry', () => {
  assert.equal(isEntitled('active', 'not-a-date', null, NOW), false);
});

test('the legacy flag is derived from the same rule, so the two cannot drift', () => {
  assert.equal(legacySubscriptionStatus('active', null, null, NOW), 'active');
  assert.equal(
    legacySubscriptionStatus('past_due', new Date('2026-09-18T12:00:00Z'), null, NOW),
    'active'
  );
  assert.equal(legacySubscriptionStatus('canceled', null, null, NOW), 'inactive');
  assert.equal(
    legacySubscriptionStatus('active', new Date('2026-01-01T00:00:00Z'), null, NOW),
    'inactive'
  );
});

// ---------------------------------------------------------------------------
// Product identity
// ---------------------------------------------------------------------------

test('every Payment Link resolves, and to a distinct amount', () => {
  // NINE ENTRIES NOW: six public, two founding, and the tripwire, whose id is
  // still a placeholder. The count is asserted rather than the list, so adding a
  // product without deciding what it costs fails here.
  const ids = Object.keys(PRODUCTS_BY_PAYMENT_LINK);
  assert.equal(ids.length, 9, 'six public, two founding, one tripwire');

  const amounts = new Set<number>();
  for (const id of ids) {
    const p = productForPaymentLink(id);
    assert.ok(p, `${id} should resolve`);
    amounts.add(p!.amountTotal);
  }
  assert.equal(amounts.size, 9, 'amounts must stay distinct for the cross-check to mean anything');
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

// ---------------------------------------------------------------------------
// The $5 / 7-day tripwire
// ---------------------------------------------------------------------------

test('the tripwire sells the EXISTING full-course plan, for 7 days, one-time', () => {
  const p = productForPaymentLink(TRIPWIRE_PAYMENT_LINK_ID);
  assert.ok(p, 'the tripwire link must resolve through the same map as every other link');
  assert.equal(p!.plan, 'full-course', 'same plan as the $89 pass -- a price, not a tier');
  assert.equal(p!.term, 'one-time');
  assert.equal(p!.mode, 'payment', 'one-time charge, not a subscription');
  assert.equal(p!.amountTotal, 500);
  assert.equal(p!.days, 7);
  assert.equal(p!.months, undefined, 'a day term and a month term are exclusive');
});

test('the tripwire id is a placeholder, so nothing is live until Juan pastes the real one', () => {
  // THE DEPLOY-BEFORE-THE-LINK PROPERTY, asserted rather than trusted. While
  // this holds, no real checkout can key into the entry above, no row can be
  // identified as a tripwire, and the grace rule matches nothing -- which is
  // what makes shipping this ahead of the Stripe link safe.
  //
  // WHEN JUAN PASTES THE REAL plink_ ID THIS TEST FAILS, ON PURPOSE. It is the
  // reminder that the ordering constraint has been discharged, and it should be
  // deleted in the same commit as the paste.
  assert.equal(TRIPWIRE_PAYMENT_LINK_ID, 'plink_TRIPWIRE_NOT_YET_CREATED');
  assert.ok(
    !/^plink_1[A-Za-z0-9]{20,}$/.test(TRIPWIRE_PAYMENT_LINK_ID),
    'the placeholder must not be shaped like a real Stripe id'
  );
});

test('the tripwire is distinguishable from a real Full Course purchase after the fact', () => {
  // PHASE 2'S DAY-6 EMAIL DEPENDS ON EXACTLY THIS. Both rows carry
  // plan='full-course' and plan_term='one-time', so neither column can target
  // the tripwire; stripe_payment_link_id is the only thing that separates them,
  // and it is written by writeEntitlement on every purchase that names a link.
  const tripwire = productForPaymentLink(TRIPWIRE_PAYMENT_LINK_ID)!;
  const fullCourse = productForPaymentLink('plink_1U5tgXF8f8aZDGVANGvtkoMF')!;

  assert.equal(tripwire.plan, fullCourse.plan, 'plan cannot tell them apart');
  assert.equal(tripwire.term, fullCourse.term, 'plan_term cannot tell them apart');
  assert.notEqual(
    TRIPWIRE_PAYMENT_LINK_ID,
    'plink_1U5tgXF8f8aZDGVANGvtkoMF',
    'the payment link id is the only marker that can'
  );
});

test('the tripwire gets ZERO grace and every other row keeps three days', () => {
  assert.equal(accessGraceMs(TRIPWIRE_PAYMENT_LINK_ID), 0);
  assert.equal(accessGraceMs('plink_1U5tgXF8f8aZDGVANGvtkoMF'), ACCESS_GRACE_MS, 'Full Course');
  assert.equal(accessGraceMs('plink_1U5tejF8f8aZDGVAKbnefl6Z'), ACCESS_GRACE_MS, 'Practice Pass');
  assert.equal(accessGraceMs(null), ACCESS_GRACE_MS, 'subscriptions carry no link');
  assert.equal(accessGraceMs(undefined), ACCESS_GRACE_MS);
  assert.equal(accessGraceMs(''), ACCESS_GRACE_MS);
});

test('a lapsed tripwire is out the moment it expires, where a lapsed pass is not', () => {
  // THE SAME ROW, THE SAME INSTANT, THE SAME STATUS. The only difference between
  // these two calls is which price was paid, which is the whole point of making
  // the grace term-aware rather than lowering the global constant.
  const justExpired = new Date(NOW.getTime() - 1000);

  assert.equal(
    isEntitled('active', justExpired, TRIPWIRE_PAYMENT_LINK_ID, NOW),
    false,
    'the $5 pass ends when it says it ends'
  );
  assert.equal(
    isEntitled('active', justExpired, 'plink_1U5tgXF8f8aZDGVANGvtkoMF', NOW),
    true,
    'the $89 pass keeps its three days -- ACCESS_GRACE_MS is untouched'
  );

  // And a tripwire that has NOT expired is still live, so this is a boundary
  // change and not a revocation.
  const stillRunning = new Date(NOW.getTime() + 1000);
  assert.equal(isEntitled('active', stillRunning, TRIPWIRE_PAYMENT_LINK_ID, NOW), true);
});

test('the legacy flag is computed under the tripwire window too, so the two agree', () => {
  const justExpired = new Date(NOW.getTime() - 1000);
  assert.equal(
    legacySubscriptionStatus('active', justExpired, TRIPWIRE_PAYMENT_LINK_ID, NOW),
    'inactive'
  );
  assert.equal(legacySubscriptionStatus('active', justExpired, null, NOW), 'active');
});

test('the legacy fallback cannot resurrect an expired tripwire on the new columns', () => {
  // isEntitledWithLegacyFallback OR-s in subscription_status, and that column is
  // written from legacySubscriptionStatus above. A tripwire row therefore denies
  // on both halves once it lapses. (A row carrying a stale legacy 'active' still
  // grants -- that is the documented fail-open for legacyActivateOnly, and it is
  // asserted separately.)
  const justExpired = new Date(NOW.getTime() - 1000);
  assert.equal(
    isEntitledWithLegacyFallback('active', justExpired, TRIPWIRE_PAYMENT_LINK_ID, 'inactive', 'test', NOW),
    false
  );
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
  assert.equal(isEntitled(w!.planStatus, w!.accessUntil, null, NOW), false);
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
    isEntitledWithLegacyFallback('active', future, null, 'inactive', 'test'),
    true,
    'the new columns are authoritative; a stale legacy flag must not veto them'
  );
});

test('THE MIGRATION BACKFILL ROW STILL GRANTS, so no existing teacher is locked out', () => {
  // sql/entitlement_columns.sql wrote plan_status='active' with access_until
  // NULL for every active teacher, fail-open on purpose. isEntitled treats null
  // as no expiry. If this ever fails, moving the readers has just cut off every
  // teacher who predates the entitlement columns.
  assert.equal(isEntitledWithLegacyFallback('active', null, null, 'active', 'test'), true);
  assert.equal(isEntitledWithLegacyFallback('active', null, null, 'inactive', 'test'), true);
});

test('THE legacyActivateOnly ROW STILL GRANTS, which is the whole reason this exists', () => {
  // That fallback writes subscription_status='active' and NO plan, because it
  // cannot name the product and a half-written plan violates the pairing
  // constraint. On isEntitled alone this row denies, so the fallback that exists
  // to stop a buyer paying for nothing would become the thing that locks them
  // out.
  assert.equal(quiet(() => isEntitledWithLegacyFallback(null, null, null, 'active', 'test')), true);
});

test('the legacy branch warns, so the fallback is visible rather than silent', () => {
  const seen: string[] = [];
  const original = console.warn;
  console.warn = (msg: unknown) => seen.push(String(msg));
  try {
    isEntitledWithLegacyFallback(null, null, null, 'active', 'requireTeacher');
  } finally {
    console.warn = original;
  }
  assert.equal(seen.length, 1);
  assert.match(seen[0], /requireTeacher/);
  assert.match(seen[0], /legacyActivateOnly/);
});

test('a lapsed row with no legacy flag is refused', () => {
  const past = new Date(Date.now() - 30 * 86_400_000).toISOString();
  assert.equal(isEntitledWithLegacyFallback('active', past, null, 'inactive', 'test'), false);
  assert.equal(isEntitledWithLegacyFallback('canceled', null, null, 'inactive', 'test'), false);
  assert.equal(isEntitledWithLegacyFallback(null, null, null, null, 'test'), false);
  assert.equal(isEntitledWithLegacyFallback(null, null, null, 'inactive', 'test'), false);
});

test('the legacy flag only ever adds, it never subtracts', () => {
  // Both halves are OR-ed, so no value of subscription_status can take away an
  // entitlement the new columns grant. That direction matters: a stale
  // 'inactive' must not revoke a live plan.
  const future = new Date(Date.now() + 86_400_000).toISOString();
  for (const legacy of ['active', 'inactive', null, undefined, '']) {
    assert.equal(
      isEntitledWithLegacyFallback('trialing', future, null, legacy, 'test'),
      true,
      String(legacy)
    );
  }
});
