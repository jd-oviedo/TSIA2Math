import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFixtureSafe } from '../lib/curriculum-fixture.ts';

// The guard is the only thing preventing a misconfigured production deploy from
// serving topic rows that never went through curriculum_topics_public -- rows
// that still carry correct_answer and misconception_tag. It is not enough that
// the guard exists; it has to be shown to fire.

test('throws when the fixture flag is set in a production build', () => {
  assert.throws(
    () => assertFixtureSafe({ NODE_ENV: 'production', CURRICULUM_FIXTURE_SOURCE: '1' }),
    /Refusing to start/,
    'a production build with the fixture flag set must not be allowed to run',
  );
});

test('the thrown message names the flag and the reason', () => {
  try {
    assertFixtureSafe({ NODE_ENV: 'production', CURRICULUM_FIXTURE_SOURCE: '1' });
    assert.fail('expected a throw');
  } catch (err) {
    const msg = (err as Error).message;
    assert.match(msg, /CURRICULUM_FIXTURE_SOURCE/, 'must name the flag to unset');
    assert.match(msg, /correct_answer/, 'must say what leaks');
    assert.match(msg, /anonymous/, 'must say who it leaks to');
  }
});

test('any truthy flag value trips the guard, not just "1"', () => {
  for (const value of ['1', 'true', 'yes', 'on', '0000']) {
    assert.throws(
      () => assertFixtureSafe({ NODE_ENV: 'production', CURRICULUM_FIXTURE_SOURCE: value }),
      /Refusing to start/,
      `flag value ${JSON.stringify(value)} must trip the guard`,
    );
  }
});

test('allows a production build when the flag is absent', () => {
  assert.doesNotThrow(() => assertFixtureSafe({ NODE_ENV: 'production' }));
  assert.doesNotThrow(() => assertFixtureSafe({ NODE_ENV: 'production', CURRICULUM_FIXTURE_SOURCE: '' }));
});

test('allows development and test builds with the flag set', () => {
  assert.doesNotThrow(() => assertFixtureSafe({ NODE_ENV: 'development', CURRICULUM_FIXTURE_SOURCE: '1' }));
  assert.doesNotThrow(() => assertFixtureSafe({ NODE_ENV: 'test', CURRICULUM_FIXTURE_SOURCE: '1' }));
  assert.doesNotThrow(() => assertFixtureSafe({ CURRICULUM_FIXTURE_SOURCE: '1' }));
});

// Importing the module runs assertFixtureSafe(process.env) at load. Proven in a
// child process, because the throw has to happen at import time -- a test that
// only ever calls the exported function cannot show that.
test('the module itself throws on import in a production build', async () => {
  const { spawnSync } = await import('node:child_process');
  const url = new URL('../lib/curriculum-fixture.ts', import.meta.url).pathname;
  const result = spawnSync(process.execPath, ['-e', `import(${JSON.stringify(url)})`], {
    env: { ...process.env, NODE_ENV: 'production', CURRICULUM_FIXTURE_SOURCE: '1' },
    encoding: 'utf-8',
  });
  assert.notEqual(result.status, 0, 'importing the module must fail the process');
  assert.match(result.stderr, /Refusing to start/, 'the load-time throw must surface');
});
