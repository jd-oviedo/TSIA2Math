// Fails when curriculum source contains LaTeX that KaTeX cannot parse.
//
// Why this check exists, and why it is not obvious it was needed:
//
// rehype-katex runs KaTeX with throwOnError false. An unknown macro therefore
// does not throw, does not add an error class, and does not fail the build, the
// lint, next build, or check_topic.py. It renders the LITERAL SOURCE TEXT in red
// (#cc0000) inside an ordinary class="katex" span. So `$A \cupp B$` ships to a
// student as red "\cupp" on the page, and every automated gate stays green.
//
// The detection is therefore on the #cc0000 colour. Detecting on a `katex-error`
// class -- the obvious choice, and the one tried first -- reports every malformed
// macro as fine, because that class is never emitted.
//
//   node scripts/check_katex_render.mjs                     # whole course
//   node scripts/check_katex_render.mjs curriculum/source/tsia2-math/unit-5/PR.3.5.md
//
// The contract is zero hits, so there is no baseline file to maintain: production
// and all 83 live source topics measured clean on 2026-08-16 (6116 rendered
// fields, 29348 math spans, 0 red renders).
//
// The three self-controls below run on every invocation and fail the run if any
// of them misbehaves. A check that can go blind without saying so is worth less
// than no check, and this one has already been blind once: the first version of
// this probe reported 21 of 21 spans fine while detecting nothing at all.
//
// EXPORTED, AND WHY. scripts/verify_templates.py runs the same detection over
// the rolled instances of a template pool, which this file cannot see: the
// templates live in the fenced json blocks that `renderable` below strips
// before rendering, so a stem_template carrying `\notacommand` renders red on
// every one of its thousands of instances while this check reports the file
// clean. That harness imports `isRed` and `controls` rather than restating the
// colour and the pipeline, because two spellings of "what counts as red" is
// how one of them goes quietly blind.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { renderMarkdownWithMath, stripAuthoringBlocks } from '../lib/curriculum-utils.ts';

export const RED = '#cc0000';
const SOURCE = 'curriculum/source/tsia2-math';

export const isRed = md => renderMarkdownWithMath(md).includes(RED);

// Individual spans, used only to localise a hit once a file is known to be bad.
export const spansOf = md =>
  [...md.matchAll(/\$\$[^\n]*?\$\$|(?<!\\)\$(?:[^$\n\\]|\\.)+?(?<!\\)\$/g)].map(m => m[0]);

// Match what the pages actually render: frontmatter never reaches a renderer,
// and the fenced json authoring blocks are removed by stripAuthoringBlocks
// before the answer key is rendered.
const renderable = raw => stripAuthoringBlocks(raw.replace(/^---\n[\s\S]*?\n---\n/, ''));

// `log` is injectable because the batch worker's stdout carries a JSON payload
// and nothing else, so its control lines have to go to stderr. Defaulting to
// console.log keeps this file's own CLI output exactly as it was.
export function controls(log = console.log) {
  const results = [
    ['bogus macro is detected', isRed(String.raw`$A \cupp B$`) === true],
    ['good macro stays clean', isRed(String.raw`$A \cup B$`) === false],
    // Without this one the check could detect a bad file and still point at the
    // wrong span, which is how a report becomes unactionable.
    ['localiser finds the bad span', spansOf(String.raw`ok $x + 1$ and $\badmacro{x}$ here`).filter(isRed).length === 1],
  ];
  const failed = results.filter(([, ok]) => !ok);
  for (const [name, ok] of results) log(`  ${ok ? 'ok  ' : 'FAIL'} control: ${name}`);
  return failed.length === 0;
}

if (import.meta.main) runCli();

function runCli() {
  const files = process.argv.slice(2).length
    ? process.argv.slice(2)
    : readdirSync(SOURCE)
        .filter(u => u.startsWith('unit-'))
        .flatMap(u => readdirSync(join(SOURCE, u)).filter(f => f.endsWith('.md')).map(f => join(SOURCE, u, f)))
        .sort();

  console.log('controls:');
  if (!controls()) {
    console.log('\nCONTROLS FAILED. This check is not measuring what it claims; fix it before trusting a pass.');
    process.exit(2);
}

let spanCount = 0;
const hits = [];
for (const path of files) {
  const md = renderable(readFileSync(path, 'utf8'));
  spanCount += spansOf(md).length;
  if (isRed(md)) {
    const bad = spansOf(md).filter(isRed);
    if (bad.length) for (const s of bad) hits.push([path, s]);
    else hits.push([path, '(file renders red, no single span isolated)']);
  }
}

console.log(`\n${files.length} file(s), ${spanCount} math span(s)`);
if (hits.length) {
  console.log(`\n${hits.length} SPAN(S) RENDER AS LITERAL RED SOURCE:`);
  for (const [p, s] of hits) console.log(`  ${p}\n    ${s}`);
  process.exit(1);
}
console.log('no span renders as literal red source.');
}
