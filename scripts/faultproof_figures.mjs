// faultproof_figures.mjs -- prove the figure harness can FAIL on the data-display
// marks, not merely that it passes on the ones we drew.
//
//   node scripts/faultproof_figures.mjs
//
// WHY THE FAULT GOES INTO THE SVG AND NEVER INTO THE SPEC
// -------------------------------------------------------
// verifyFigure(spec) builds the SVG from the spec it is about to verify against,
// so mutating the spec moves BOTH sides of the comparison and the check comes
// back clean. A fault injected into the input of both sides of a comparison is
// not a fault. An earlier probe of exactly this harness reported "21 assertions,
// 0 failed" with both of its injections blind for that reason.
//
// So every fault here is injected into the EMITTED SVG and checked with the
// two-argument form verifyPlane(spec, svg), which is the only form where the two
// sides are independent.
//
// EVERY INJECTION ASSERTS IT LANDED, twice over: the target substring must exist
// before the replace, and after the replace the mutated element must still be
// visible to the verifier's own regexes. Presence in the string is not presence
// in the scanned region, and a proof that cannot confirm its own injection
// proves nothing -- it fails in the direction of false confidence.
//
// EVERY FAULT RUNS BETWEEN TWO CLEAN CONTROLS. A fault that fails proves nothing
// on its own, because it does not distinguish the fault from the harness.
import { readFileSync } from 'fs';
import { figureFromSpec, verifyPlane } from './make_figure.mjs';

const SPEC = 'curriculum/figures/pr-1-3-bar-books.json';
const spec = JSON.parse(readFileSync(SPEC, 'utf8'));
const clean = figureFromSpec(spec).svg;

const RECTS = /<rect data-bar="(\d+)" x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/g;
const CATS = /<text data-cat="(\d+)" x="([-\d.]+)" y="[-\d.]+" text-anchor="middle">([^<]*)<\/text>/g;
const count = (svg, re) => [...svg.matchAll(re)].length;

const failures = svg => verifyPlane(spec, svg).filter(c => !c.ok);
let ok = true;

function control(tag) {
  const all = verifyPlane(spec, clean);
  const bad = all.filter(c => !c.ok);
  const good = bad.length === 0 && all.length > 0;
  ok &&= good;
  console.log(`  [${good ? 'PASS' : 'CONTROL FAILED'}] control ${tag}: `
    + `${all.length} assertions, ${bad.length} failed`);
}

// expect: assertion names that MUST be among the failures. Naming them stops a
// fault "passing" because it happened to break something unrelated.
function fault(label, old, neu, expect, { expectRects = 5, expectCats = 5 } = {}) {
  // 1. the target exists
  if (!clean.includes(old)) {
    console.log(`  [PROOF FAILED] ${label}: target absent, injection would be a no-op`);
    ok = false; return;
  }
  const svg = clean.replace(old, neu);
  // 2. the replace actually changed the document
  if (svg === clean) {
    console.log(`  [PROOF FAILED] ${label}: replace was a no-op`);
    ok = false; return;
  }
  // 3. the mutated element is still in the region the verifier reads, so the
  //    failure below is about POSITION or VALUE and not about an element that
  //    silently stopped parsing
  const r = count(svg, RECTS), c = count(svg, CATS);
  if (r !== expectRects || c !== expectCats) {
    console.log(`  [PROOF FAILED] ${label}: injection left the scanned region `
      + `(${r} rects / ${c} labels visible, expected ${expectRects} / ${expectCats})`);
    ok = false; return;
  }

  const bad = failures(svg);
  const names = bad.map(b => b.name);
  const missing = expect.filter(e => !names.includes(e));
  const caught = bad.length > 0 && missing.length === 0;
  ok &&= caught;
  console.log(`  [${caught ? 'PASS' : 'PROOF FAILED'}] ${label}`);
  console.log(`        ${bad.length} failure(s): ${names.join(', ') || 'NONE'}`);
  if (missing.length) console.log(`        expected but not reported: ${missing.join(', ')}`);
}

console.log('BAR CHART FAULT PROOFS  (spec: pr-1-3-bar-books, 5 bars)\n');
control('before');

console.log('\nfaults injected into the emitted SVG:');

// A bar drawn to the wrong height. Apr is 18; redraw it at 16, keeping its foot
// on the baseline so ONLY the value is wrong.
fault('bar drawn at the wrong height (Apr 18 redrawn as 16)',
  '<rect data-bar="3" x="221.37" y="35.6" width="34.47" height="176.4"',
  '<rect data-bar="3" x="221.37" y="55.2" width="34.47" height="156.8"',
  ['bar 3 value']);

// A bar drawn in the wrong band: Feb moved onto Mar's band position.
fault('bar drawn in the wrong band (Feb moved onto Mar\'s band)',
  '<rect data-bar="1" x="110.17"',
  '<rect data-bar="1" x="165.77"',
  ['bar 1 centred on its band']);

// A bar whose foot has left the baseline: the whole bar slid upward, so its
// height still reads 8 units but it is floating.
fault('bar lifted off the baseline (Jan floats above the axis)',
  '<rect data-bar="0" x="54.57" y="133.6" width="34.47" height="78.4"',
  '<rect data-bar="0" x="54.57" y="113.6" width="34.47" height="78.4"',
  ['bar 0 value', 'bar 0 sits on the baseline']);

// Bars emitted against the wrong names.
fault('category label does not match its bar (Jan relabelled)',
  '<text data-cat="0" x="71.8" y="226" text-anchor="middle">Jan</text>',
  '<text data-cat="0" x="71.8" y="226" text-anchor="middle">Nov</text>',
  ['bar 0 label is "Jan"']);

// An axis whose bands are not evenly spaced makes two bars visually comparable
// when the data does not support the comparison.
fault('category bands unevenly spaced (Mar shifted)',
  '<text data-cat="2" x="183" y="226" text-anchor="middle">Mar</text>',
  '<text data-cat="2" x="197" y="226" text-anchor="middle">Mar</text>',
  ['bar 2 centred on its band', 'category bands evenly spaced']);

// Ragged widths: one bar drawn fatter than the rest.
fault('bars not of equal width (Mar widened)',
  '<rect data-bar="2" x="165.77" y="153.2" width="34.47"',
  '<rect data-bar="2" x="165.77" y="153.2" width="48"',
  ['bars equal width']);

// A bar missing entirely. This one is EXPECTED to change the parsed count, which
// is the whole point of it, so the region assertion is relaxed to 4 rects.
fault('a declared bar not drawn at all (May dropped)',
  '<rect data-bar="4" x="276.97" y="94.4" width="34.47" height="117.6" fill="#6E9DC8"/>',
  '',
  ['every declared bar drawn', 'bar 4 drawn'],
  { expectRects: 4 });

console.log('');
control('after');

console.log(`\nRESULT: ${ok ? 'the bar checks can fail, and do' : 'A PROOF OR CONTROL FAILED'}`);
process.exit(ok ? 0 : 1);
