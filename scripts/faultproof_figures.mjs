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
import { figureFromSpec, verifyPlane, verifyBounds } from './make_figure.mjs';

const REGIONS = {
  bars: /<rect data-bar="(\d+)"/g,
  cats: /<text data-cat="(\d+)"/g,
  boxes: /<rect data-box="(\d+)"/g,
  medians: /<line data-median="(\d+)"/g,
  whiskers: /<line data-whisker="(\d+)(lo|hi)"/g,
  lanes: /<text data-lane="(\d+)"/g,
  series: /<polyline data-series="(\d+)"/g,
  texts: /<text /g,
};
const census = svg => Object.fromEntries(
  Object.entries(REGIONS).map(([k, re]) => [k, [...svg.matchAll(re)].length]));

let ok = true;

class Harness {
  constructor(path) {
    this.spec = JSON.parse(readFileSync(path, 'utf8'));
    this.clean = figureFromSpec(this.spec).svg;
    this.base = census(this.clean);
  }
  control(tag) {
    const all = verifyPlane(this.spec, this.clean);
    verifyBounds(this.clean, (name, actual, expected, tol) =>
      all.push({ name, actual, expected, ok: Math.abs(actual - expected) <= tol }));
    const bad = all.filter(c => !c.ok);
    const good = bad.length === 0 && all.length > 0;
    ok &&= good;
    console.log(`  [${good ? 'PASS' : 'CONTROL FAILED'}] control ${tag}: ${all.length} assertions, ${bad.length} failed`);
  }
  // expect: assertion names that MUST be among the failures. Naming them stops a
  // fault "passing" because it happened to break something unrelated.
  fault(label, old, neu, expect, regionOverride = {}) {
    if (!this.clean.includes(old)) {
      console.log(`  [PROOF FAILED] ${label}: target absent, injection would be a no-op`);
      ok = false; return;
    }
    const svg = this.clean.replace(old, neu);
    if (svg === this.clean) {
      console.log(`  [PROOF FAILED] ${label}: replace was a no-op`);
      ok = false; return;
    }
    // The mutated element must still be in the region the verifier reads, so the
    // failure below is about POSITION or VALUE and not about an element that
    // silently stopped parsing.
    const want = { ...this.base, ...regionOverride };
    const got = census(svg);
    const drifted = Object.keys(want).filter(k => want[k] !== got[k]);
    if (drifted.length) {
      console.log(`  [PROOF FAILED] ${label}: injection left the scanned region -> `
        + drifted.map(k => `${k} ${got[k]} (expected ${want[k]})`).join(', '));
      ok = false; return;
    }

    // Bounds assertions name their first offender, so the expected-failure list
    // is matched as a substring rather than an equality.
    const bad = verifyPlane(this.spec, svg).filter(c => !c.ok);
    verifyBounds(svg, (name, actual, expected, tol) => {
      if (Math.abs(actual - expected) > tol) bad.push({ name, actual, expected, ok: false });
    });
    const names = bad.map(b => b.name);
    const missing = expect.filter(e => !names.some(nm => nm.includes(e)));
    const caught = bad.length > 0 && missing.length === 0;
    ok &&= caught;
    console.log(`  [${caught ? 'PASS' : 'PROOF FAILED'}] ${label}`);
    console.log(`        ${bad.length} failure(s): ${names.join(', ') || 'NONE'}`);
    if (missing.length) console.log(`        expected but not reported: ${missing.join(', ')}`);
  }
}

// ─── BARS ────────────────────────────────────────────────────────────────────
console.log('BAR CHART FAULT PROOFS  (pr-1-3-bar-books, 5 bars, categorical x)\n');
const bar = new Harness('curriculum/figures/pr-1-3-bar-books.json');
bar.control('before');
console.log('\nfaults injected into the emitted SVG:');

bar.fault('bar drawn at the wrong height (Apr 18 redrawn as 16)',
  '<rect data-bar="3" x="221.37" y="35.6" width="34.47" height="176.4"',
  '<rect data-bar="3" x="221.37" y="55.2" width="34.47" height="156.8"',
  ['bar 3 value']);

bar.fault('bar drawn in the wrong band (Feb moved onto Mar\'s band)',
  '<rect data-bar="1" x="110.17"', '<rect data-bar="1" x="165.77"',
  ['bar 1 centred on its band']);

bar.fault('bar lifted off the baseline (Jan floats above the axis)',
  '<rect data-bar="0" x="54.57" y="133.6" width="34.47" height="78.4"',
  '<rect data-bar="0" x="54.57" y="113.6" width="34.47" height="78.4"',
  ['bar 0 value', 'bar 0 sits on the baseline']);

bar.fault('category label does not match its bar (Jan relabelled)',
  '<text data-cat="0" x="71.8" y="226" text-anchor="middle">Jan</text>',
  '<text data-cat="0" x="71.8" y="226" text-anchor="middle">Nov</text>',
  ['bar 0 label is "Jan"']);

bar.fault('category bands unevenly spaced (Mar shifted)',
  '<text data-cat="2" x="183" y="226" text-anchor="middle">Mar</text>',
  '<text data-cat="2" x="197" y="226" text-anchor="middle">Mar</text>',
  ['bar 2 centred on its band', 'category bands evenly spaced']);

bar.fault('bars not of equal width (Mar widened)',
  '<rect data-bar="2" x="165.77" y="153.2" width="34.47"',
  '<rect data-bar="2" x="165.77" y="153.2" width="48"',
  ['bars equal width']);

bar.fault('a declared bar not drawn at all (May dropped)',
  '<rect data-bar="4" x="276.97" y="94.4" width="34.47" height="117.6" fill="#6E9DC8"/>', '',
  ['every declared bar drawn', 'bar 4 drawn'], { bars: 4 });

console.log('');
bar.control('after');

// ─── BOX PLOTS ───────────────────────────────────────────────────────────────
// Run against the PAIRED spec deliberately. PR.2.4 depends on two boxes sharing
// one value axis, and an untested pair is an assumption; faulting box 0 of a
// pair also proves the per-box checks address the right box.
console.log('\n\nBOX PLOT FAULT PROOFS  (pr-2-4-box-paired, 2 lanes, categorical y)\n');
const box = new Harness('curriculum/figures/pr-2-4-box-paired.json');
box.control('before');
console.log('\nfaults injected into the emitted SVG:');

// A quartile at the wrong position: Team A's box left edge moved from q1 = 22 to
// 24, with the right edge held at q3 = 38 so ONLY q1 is wrong.
box.fault('quartile at the wrong position (Team A q1 22 drawn at 24)',
  '<rect data-box="0" x="151" y="42.95" width="72"',
  '<rect data-box="0" x="160" y="42.95" width="63"',
  ['box 0 q1 (box left edge)']);

// The median drawn outside the box it divides.
box.fault('median outside its own box (Team A median past q3)',
  '<line data-median="0" x1="187" y1="42.95" x2="187" y2="87.05"',
  '<line data-median="0" x1="240" y1="42.95" x2="240" y2="87.05"',
  ['box 0 median', 'box 0 median lies inside its box',
    'box 0 drawn in order min<=q1<=median<=q3<=max']);

// A whisker that stops short of the minimum it declares.
box.fault('whisker short of its declared min (Team A min 12 drawn at 18)',
  '<line data-whisker="0lo" x1="106"', '<line data-whisker="0lo" x1="133"',
  ['box 0 min (low whisker end)']);

// A box drawn in the wrong lane: Team A moved down into Team B's lane.
box.fault('box in the wrong lane (Team A drawn in Team B\'s lane)',
  '<rect data-box="0" x="151" y="42.95"', '<rect data-box="0" x="151" y="140.95"',
  ['box 0 centred in its lane']);

// Lane names swapped against their boxes.
box.fault('lane label does not match its box (Team A relabelled)',
  '<text data-lane="0" x="46" y="68.5" text-anchor="end">Team A</text>',
  '<text data-lane="0" x="46" y="68.5" text-anchor="end">Team C</text>',
  ['box 0 label is "Team A"']);

// Unequal box heights make two groups look differently weighted.
box.fault('boxes not of equal height (Team B flattened)',
  '<rect data-box="1" x="169" y="140.95" width="81" height="44.1"',
  '<rect data-box="1" x="169" y="140.95" width="81" height="30"',
  ['boxes equal height']);

console.log('');
box.control('after');

// ─── SERIES (LINE GRAPHS) ────────────────────────────────────────────────────
console.log('\n\nSERIES FAULT PROOFS  (pr-1-3-quiz-scores-line, 4 vertices)\n');
const ser = new Harness('curriculum/figures/pr-1-3-quiz-scores-line.json');
ser.control('before');
console.log('\nfaults injected into the emitted SVG:');

// A vertex at the wrong position: week 2 drawn at the wrong score.
ser.fault('series vertex at the wrong position (week 2 drawn low)',
  'points="99.6,133.6 155.2,94.4 210.8,149.28 266.4,55.2"',
  'points="99.6,133.6 155.2,110 210.8,149.28 266.4,55.2"',
  ['series 0 vertex 1 y']);

// The same four points joined in a different order is a different picture and a
// different claim about the trend, so it must not pass.
ser.fault('series drawn through the wrong point order (weeks 2 and 3 swapped)',
  'points="99.6,133.6 155.2,94.4 210.8,149.28 266.4,55.2"',
  'points="99.6,133.6 210.8,149.28 155.2,94.4 266.4,55.2"',
  ['series 0 vertex 1 x', 'series 0 vertex 1 y',
    'series 0 vertex 2 x', 'series 0 vertex 2 y']);

console.log('');
ser.control('after');

// ─── BOUNDS: THE LEGIBILITY GAP ──────────────────────────────────────────────
//
// The actual regression guard. Each of these three specs has an axis range that
// excludes zero, which is the shape that produced labels 500px off a 250-tall
// canvas while --verify reported 9 of 9. The assertion is a bounds check on
// emitted coordinates, never a visual judgement.
//
// y="749.8" below is not an invented number: it is the coordinate measured on the
// original defect, reproduced here so the guard is proven against the real thing.
console.log('\n\nBOUNDS FAULT PROOFS  (axis ranges excluding zero)\n');
const BOUNDS_CASES = [
  ['harness-axis-nozero-x', 'x excludes 0', '<text x="22" y="231.5" text-anchor="end">-1</text>',
    '<text x="-40" y="231.5" text-anchor="end">-1</text>'],
  ['harness-axis-nozero-y', 'y excludes 0', '<text x="28" y="241" text-anchor="middle">0</text>',
    '<text x="28" y="749.8" text-anchor="middle">0</text>'],
  ['harness-axis-nozero-both', 'both exclude 0', '<text x="28" y="241" text-anchor="middle">100</text>',
    '<text x="28" y="749.8" text-anchor="middle">100</text>'],
];
for (const [name, why, old, neu] of BOUNDS_CASES) {
  const h = new Harness(`curriculum/figures/${name}.json`);
  console.log(`${name}  (${why})`);
  h.control('before');
  // The clean control must ALSO show the labels are actually inside the canvas,
  // otherwise "0 failures" could mean the check is not looking.
  const vb = h.clean.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const labels = [...h.clean.matchAll(/<text x="([-\d.]+)" y="([-\d.]+)"/g)].map(m => [+m[1], +m[2]]);
  const inside = labels.every(([x, y]) => x >= 0 && x <= +vb[1] && y >= 0 && y <= +vb[2]);
  ok &&= inside && labels.length > 0;
  console.log(`  [${inside && labels.length ? 'PASS' : 'PROOF FAILED'}] ${labels.length} labels, all inside 0..${vb[1]} x 0..${vb[2]}`
    + ` (lowest y = ${Math.max(...labels.map(l => l[1]))})`);
  h.fault('a label pushed outside the viewBox', old, neu,
    ['all marks and labels inside the viewBox']);
  h.control('after');
  console.log('');
}

console.log(`\nRESULT: ${ok ? 'the bar, box, series and bounds checks can fail, and do' : 'A PROOF OR CONTROL FAILED'}`);
process.exit(ok ? 0 : 1);
