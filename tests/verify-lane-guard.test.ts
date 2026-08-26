import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertVerifyLaneSafe, verifyLaneEnabled } from '../app/um-verify/guard.ts';

// The guard is what keeps app/um-verify/* off a deploy. Those routes render the
// student shell and the curriculum surface with no auth gate and fabricated
// props, so that UI verifiers can read computed styles off real components.
// They leak no data -- there is none to leak -- but an ungated route that
// renders app chrome is not something a visitor should be able to reach.
//
// It is not enough that the guard exists; it has to be shown to fire, and shown
// NOT to fire in the one place the lane is legitimately used, which is
// `next build && next start` on a laptop.
//
// The sentinel is VERCEL_ENV, not NODE_ENV, because `next start` locally is a
// production build that is not a deployment. These tests pin both halves of
// that distinction so the condition cannot be tightened to NODE_ENV without a
// failure explaining what it costs. Same shape, and the same reasoning, as
// tests/curriculum-fixture-guard.test.ts.

// ── Must throw: the flag is set on a deployed environment ───────────────────

test('throws when the lane flag is set and VERCEL_ENV is present', () => {
  assert.throws(
    () => assertVerifyLaneSafe({ VERCEL_ENV: 'production', UM_VERIFY_LANE: '1' }),
    /Refusing to start/,
    'a production deploy with the lane flag set must not be allowed to run',
  );
});

test('throws on a preview deploy too, not just production', () => {
  for (const vercelEnv of ['production', 'preview', 'development']) {
    assert.throws(
      () => assertVerifyLaneSafe({ VERCEL_ENV: vercelEnv, UM_VERIFY_LANE: '1' }),
      /Refusing to start/,
      `VERCEL_ENV=${vercelEnv} is still a deploy and must be refused`,
    );
  }
});

test('throws regardless of NODE_ENV once VERCEL_ENV is present', () => {
  for (const nodeEnv of ['production', 'development', 'test']) {
    assert.throws(
      () => assertVerifyLaneSafe({ NODE_ENV: nodeEnv, VERCEL_ENV: 'production', UM_VERIFY_LANE: '1' }),
      /Refusing to start/,
      'VERCEL_ENV decides, not NODE_ENV',
    );
  }
});

test('any truthy flag value trips the guard, not just "1"', () => {
  for (const value of ['1', 'true', 'yes', 'please']) {
    assert.throws(
      () => assertVerifyLaneSafe({ VERCEL_ENV: 'production', UM_VERIFY_LANE: value }),
      /Refusing to start/,
      `"${value}" is truthy and must trip the guard`,
    );
  }
});

test('the thrown message names the flag and the reason', () => {
  try {
    assertVerifyLaneSafe({ VERCEL_ENV: 'production', UM_VERIFY_LANE: '1' });
    assert.fail('expected a throw');
  } catch (err) {
    const message = (err as Error).message;
    assert.match(message, /UM_VERIFY_LANE/, 'must name the flag to unset');
    assert.match(message, /no auth gate/, 'must say why the lane is local-only');
    assert.match(message, /VERCEL_ENV=production/, 'must report what it saw');
  }
});

// ── Must NOT throw: the lane is legitimately used locally ───────────────────

test('allows the flag locally when VERCEL_ENV is absent', () => {
  assert.doesNotThrow(() => assertVerifyLaneSafe({ UM_VERIFY_LANE: '1' }));
});

test('allows the flag under a local production build (next start)', () => {
  // THE REGRESSION THIS PINS. `next build && next start` sets
  // NODE_ENV=production and is the only server mode this project runs
  // Playwright against. A guard keyed on NODE_ENV would ban the lane from the
  // only place it is ever used.
  assert.doesNotThrow(
    () => assertVerifyLaneSafe({ NODE_ENV: 'production', UM_VERIFY_LANE: '1' }),
    'a local production build is not a deployment',
  );
});

test('allows a deploy when the flag is absent or empty', () => {
  for (const bag of [
    { VERCEL_ENV: 'production' },
    { VERCEL_ENV: 'production', UM_VERIFY_LANE: '' },
    { VERCEL_ENV: 'preview', UM_VERIFY_LANE: undefined },
  ]) {
    assert.doesNotThrow(() => assertVerifyLaneSafe(bag), 'no flag, no problem');
  }
});

// ── The everyday layer: whether the routes render at all ────────────────────

test('verifyLaneEnabled is false without the flag and true with it', () => {
  assert.equal(verifyLaneEnabled({}), false, 'absent flag means the routes 404');
  assert.equal(verifyLaneEnabled({ UM_VERIFY_LANE: '' }), false, 'empty is not set');
  assert.equal(verifyLaneEnabled({ UM_VERIFY_LANE: '1' }), true);
});

test('the two guard layers are independent', () => {
  // On a deploy with no flag the routes 404 (layer one) and the build is
  // untouched (layer two stays quiet). Both must hold at once, which is what
  // makes an accidental deploy a 404 rather than a broken build.
  const deployNoFlag = { VERCEL_ENV: 'production' };
  assert.equal(verifyLaneEnabled(deployNoFlag), false);
  assert.doesNotThrow(() => assertVerifyLaneSafe(deployNoFlag));
});
