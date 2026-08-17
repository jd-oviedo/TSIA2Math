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

const REGIONS = {
  bars: /<rect data-bar="(\d+)"/g,
  cats: /<text data-cat="(\d+)"/g,
  boxes: /<rect data-box="(\d+)"/g,
  medians: /<line data-median="(\d+)"/g,
  whiskers: /<line data-whisker="(\d+)(lo|hi)"/g,
  lanes: /<text data-lane="(\d+)"/g,
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

    const bad = verifyPlane(this.spec, svg).filter(c => !c.ok);
    const names = bad.map(b => b.name);
    const missing = expect.filter(e => !names.includes(e));
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

console.log(`\nRESULT: ${ok ? 'the bar and box checks can fail, and do' : 'A PROOF OR CONTROL FAILED'}`);
process.exit(ok ? 0 : 1);
