// Proves the fixture path is a faithful stand-in for the real read.
//
// lib/curriculum-fixture.ts reimplements, in TypeScript, the markdown parsing
// that curriculum/migrations/upload_curriculum.py does in Python. Two
// implementations of one set of rules is a divergence risk, and a verification
// path that has silently diverged from the real one is worth less than no
// verification path at all.
//
// So the claim is measured rather than asserted. For a topic that is already
// live, this renders the guided notes twice -- once from the source markdown
// through the fixture, once from the row the uploader actually wrote -- and
// compares the resulting HTML byte for byte. Identical HTML means the TS parser
// and the Python parser agree, and that the round trip through Postgres changed
// nothing.
//
// Usage:  node scripts/verify_fixture_parity.mjs [TOPIC_ID]
//
// Reads production through the anon key and the public view, which is the same
// path a signed-out student takes. Writes nothing.

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { renderMarkdownWithMath } from '../lib/curriculum-utils.ts';

const TOPIC = process.argv[2] || 'AR.3.5';
const COURSE = 'tsia2-math';

// The fixture module refuses to load with NODE_ENV=production, by design.
process.env.NODE_ENV = 'development';
process.env.CURRICULUM_FIXTURE_SOURCE = '1';
const { loadTopicFixture } = await import('../lib/curriculum-fixture.ts');

for (const line of readFileSync('.env.local', 'utf-8').split('\n')) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
);

const { data: live, error } = await sb
  .from('curriculum_topics_public')
  .select('topic_id, topic_name, related_strand, estimated_time_minutes, guided_notes, practice_items, practice_problems, mini_quiz')
  .eq('course_id', COURSE)
  .eq('topic_id', TOPIC)
  .single();

if (error || !live) {
  console.error(`Could not read ${TOPIC} from production: ${error?.message ?? 'no row'}`);
  console.error('This script compares against a topic that is already live.');
  process.exit(1);
}

const fixture = loadTopicFixture(COURSE, TOPIC);
if (!fixture) {
  console.error(`No source markdown found for ${TOPIC}.`);
  process.exit(1);
}

const results = [];
const check = (name, a, b) => {
  const ok = a === b;
  results.push({ name, ok, a, b });
  return ok;
};

// Postgres jsonb does not preserve key insertion order, so the row that comes
// back from PostgREST is ordered differently from the object the parser builds.
// That is a serialization detail and not a content difference -- nothing
// downstream reads a JSON object by position -- so both sides are serialized
// with keys sorted before comparing. Comparing raw JSON.stringify output here
// measures Postgres's key ordering rather than the item content.
const sortKeys = (v) =>
  Array.isArray(v)
    ? v.map(sortKeys)
    : v && typeof v === 'object'
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]))
      : v;
const j = (v) => JSON.stringify(sortKeys(v), null, 0);

// The rendered HTML is the thing that actually matters: it is what the browser
// receives, and rendering is a pure function of the markdown string.
const liveHtml = renderMarkdownWithMath(live.guided_notes);
const fixtureHtml = renderMarkdownWithMath(fixture.guided_notes);
check('guided notes: rendered HTML', liveHtml, fixtureHtml);

// The inputs, so a mismatch above can be localised.
check('guided notes: source markdown', live.guided_notes, fixture.guided_notes);
check('topic_name', live.topic_name, fixture.topic_name);
check('related_strand', live.related_strand, fixture.related_strand);
check('estimated_time_minutes', live.estimated_time_minutes, fixture.estimated_time_minutes);
check('practice_problems.raw', live.practice_problems?.raw, fixture.practice_problems.raw);
check('mini_quiz.raw', live.mini_quiz?.raw, fixture.mini_quiz.raw);
check('practice_items (whole structure)', j(live.practice_items), j(fixture.practice_items));

console.log('='.repeat(78));
console.log(`fixture parity: ${TOPIC}`);
console.log('='.repeat(78));
for (const r of results) {
  const detail = r.ok
    ? typeof r.a === 'string'
      ? `${r.a.length} chars identical`
      : 'identical'
    : 'DIFFERS';
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(34)} ${detail}`);
}

const failed = results.filter((r) => !r.ok);
for (const r of failed) {
  console.log(`\n--- ${r.name} ---`);
  const a = String(r.a ?? ''), b = String(r.b ?? '');
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  console.log(`first difference at index ${i} (live ${a.length} chars, fixture ${b.length})`);
  console.log(`  live   : ...${JSON.stringify(a.slice(Math.max(0, i - 60), i + 60))}`);
  console.log(`  fixture: ...${JSON.stringify(b.slice(Math.max(0, i - 60), i + 60))}`);
}

console.log('='.repeat(78));
console.log(`${results.length} comparisons, ${results.length - failed.length} identical, ${failed.length} differing`);
console.log(`rendered HTML: ${liveHtml.length} chars from production, ${fixtureHtml.length} from source`);
process.exit(failed.length ? 1 : 0);
