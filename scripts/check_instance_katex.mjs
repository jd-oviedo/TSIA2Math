// KaTeX-parses strings handed to it on stdin and says which ones render red.
//
// The batch worker behind verify_templates.py's `katex` check. It exists
// because the pool it has to check is not on disk: a template's rolled stems
// and choices are produced by substituting parameters into a formula, so there
// is no file for scripts/check_katex_render.mjs to walk. See the header there
// for what "renders red" means and why the colour is the detection.
//
// WHY THIS IS NOT COVERED BY check_katex_render.mjs
//
// That check renders `stripAuthoringBlocks(source)`, and a curriculum template
// is authored *inside* one of the fenced json blocks that call strips. So a
// stem_template carrying `\notacommand` is invisible to it -- the file reports
// clean while every one of that template's instances renders literal red source
// to a student. The gap is structural, not an oversight: the block has to be
// stripped, because rendering raw JSON into a student's answer key is the thing
// stripAuthoringBlocks was written to prevent.
//
// PROTOCOL. One JSON object in on stdin, one JSON object out on stdout:
//
//   in   {"strings": ["Solve $x + 9 = 14$", "$x = 5$", ...]}
//   out  {"checked": 36351, "red": [{"index": 12, "spans": ["$\\notacommand$"]}]}
//
// stdout carries the payload and nothing else, so the control lines go to
// stderr. A red render is reported IN the payload rather than through the exit
// code: exit 0 means the check ran, and any non-zero exit means it could not,
// which is what lets the caller treat a broken worker as a hard failure instead
// of as a pass.
import { isRed, spansOf, controls } from './check_katex_render.mjs';

const stdin = await new Promise((resolve, reject) => {
  let buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { buf += chunk; });
  process.stdin.on('end', () => resolve(buf));
  process.stdin.on('error', reject);
});

// The same three self-controls the file check runs, on every batch. They cost
// three renders and they are the difference between "no red renders" and "this
// worker is not detecting anything", which are the same output otherwise.
console.error('katex worker controls:');
if (!controls(msg => console.error(msg))) {
  console.error('CONTROLS FAILED. Not measuring what it claims; refusing to report a pass.');
  process.exit(2);
}

const { strings } = JSON.parse(stdin);
if (!Array.isArray(strings)) {
  console.error('stdin payload has no `strings` array');
  process.exit(2);
}

const red = [];
for (const [index, text] of strings.entries()) {
  if (!isRed(text)) continue;
  // Localise, exactly as the file check does. A rolled stem is one line, so the
  // span is usually the whole of the interesting part -- but a stem with two
  // math spans and one bad macro should name the bad one.
  red.push({ index, spans: spansOf(text).filter(isRed) });
}

process.stdout.write(JSON.stringify({ checked: strings.length, red }) + '\n');
