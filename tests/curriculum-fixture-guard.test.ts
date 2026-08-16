import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFixtureSafe } from '../lib/curriculum-fixture.ts';

// The guard is the only thing preventing a misconfigured deploy from serving
// topic rows that never went through curriculum_topics_public -- rows that still
// carry correct_answer and misconception_tag. It is not enough that the guard
// exists; it has to be shown to fire, and shown not to fire where the fixture is
// legitimately used.
//
// The sentinel is VERCEL_ENV, not NODE_ENV, because `next start` on a laptop is
// a production build that is not a deployment. See the comment on
// assertFixtureSafe for why, and sentry.server.config.ts:14 for the precedent.
// These tests pin both halves of that distinction so the condition cannot be
// tightened back to NODE_ENV without a failure explaining the cost.

// ── Must throw: the flag is set on a deployed environment ───────────────────

test('throws when the flag is set and VERCEL_ENV is present', () => {
  assert.throws(
    () => assertFixtureSafe({ VERCEL_ENV: 'production', CURRICULUM_FIXTURE_SOURCE: '1' }),
    /Refusing to start/,
    'a production deploy with the fixture flag set must not be allowed to run',
  );
});

test('throws on a preview deploy too, not just production', () => {
  for (const vercelEnv of ['production', 'preview', 'development']) {
    assert.throws(
      () => assertFixtureSafe({ VERCEL_ENV: vercelEnv, CURRICULUM_FIXTURE_SOURCE: '1' }),
      /Refusing to start/,
      `VERCEL_ENV=${vercelEnv} is still a deploy and must be refused`,
    );
  }
});

test('throws regardless of NODE_ENV once VERCEL_ENV is present', () => {
  assert.throws(
    () => assertFixtureSafe({
      VERCEL_ENV: 'production', NODE_ENV: 'development', CURRICULUM_FIXTURE_SOURCE: '1',
    }),
    /Refusing to start/,
    'a deploy claiming NODE_ENV=development must still be refused',
  );
});

test('any truthy flag value trips the guard, not just "1"', () => {
  for (const value of ['1', 'true', 'yes', 'on', '0000']) {
    assert.throws(
      () => assertFixtureSafe({ VERCEL_ENV: 'production', CURRICULUM_FIXTURE_SOURCE: value }),
      /Refusing to start/,
      `flag value ${JSON.stringify(value)} must trip the guard`,
    );
  }
});

test('the thrown message names the flag and the reason', () => {
  try {
    assertFixtureSafe({ VERCEL_ENV: 'production', CURRICULUM_FIXTURE_SOURCE: '1' });
    assert.fail('expected a throw');
  } catch (err) {
    const msg = (err as Error).message;
    assert.match(msg, /CURRICULUM_FIXTURE_SOURCE/, 'must name the flag to unset');
    assert.match(msg, /correct_answer/, 'must say what leaks');
    assert.match(msg, /anonymous/, 'must say who it leaks to');
  }
});

// ── Must not throw: local use, which is the whole point ─────────────────────

test('allows the flag locally when VERCEL_ENV is absent', () => {
  assert.doesNotThrow(() => assertFixtureSafe({ CURRICULUM_FIXTURE_SOURCE: '1' }));
});

test('allows the flag under a local production build (next start)', () => {
  // The case that made NODE_ENV the wrong sentinel. `next start` sets
  // NODE_ENV=production on a laptop; with no VERCEL_ENV it is not a deployment,
  // and it is the only server mode Playwright can run against here.
  assert.doesNotThrow(
    () => assertFixtureSafe({ NODE_ENV: 'production', CURRICULUM_FIXTURE_SOURCE: '1' }),
    'gating on NODE_ENV would make the fixture unusable under next start',
  );
});

test('allows a deploy when the flag is absent or empty', () => {
  assert.doesNotThrow(() => assertFixtureSafe({ VERCEL_ENV: 'production' }));
  assert.doesNotThrow(() => assertFixtureSafe({ VERCEL_ENV: 'production', CURRICULUM_FIXTURE_SOURCE: '' }));
});

// ── The throw must happen at import, not only when called by hand ───────────

async function importUnder(env: Record<string, string>) {
  const { spawnSync } = await import('node:child_process');
  const url = new URL('../lib/curriculum-fixture.ts', import.meta.url).pathname;
  return spawnSync(process.execPath, ['-e', `import(${JSON.stringify(url)})`], {
    env: { ...process.env, VERCEL_ENV: '', CURRICULUM_FIXTURE_SOURCE: '', ...env },
    encoding: 'utf-8',
  });
}

test('the module itself throws on import when deployed with the flag set', async () => {
  const result = await importUnder({ VERCEL_ENV: 'production', CURRICULUM_FIXTURE_SOURCE: '1' });
  assert.notEqual(result.status, 0, 'importing the module must fail the process');
  assert.match(result.stderr, /Refusing to start/, 'the load-time throw must surface');
});

test('the module imports cleanly under a local production build', async () => {
  const result = await importUnder({ NODE_ENV: 'production', CURRICULUM_FIXTURE_SOURCE: '1' });
  assert.equal(result.status, 0, `import should succeed locally, stderr: ${result.stderr}`);
});
