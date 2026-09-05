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
import { buildTable, verifyTable } from './figure_table.mjs';
import { buildShape, verifyShape } from './figure_shapes.mjs';

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

// ─── SCATTERPLOTS ────────────────────────────────────────────────────────────
console.log('\n\nSCATTERPLOT FAULT PROOFS  (harness-scatterplot-practice, 16-point cloud)\n');
const scatter = new Harness('curriculum/figures/harness-scatterplot-practice.json');
scatter.control('before');
console.log('\nfaults injected into the emitted SVG:');

// A cloud point moved off the position scatterCloud() actually generated for
// it, the same class of defect a mis-scaled axis or a jitter typo produces.
scatter.fault('a cloud point drawn away from its generated position',
  '<circle data-scatter="0-0" cx="69.68" cy="180.65"',
  '<circle data-scatter="0-0" cx="109.68" cy="180.65"',
  ['plot 0 point 0 x']);

// A point dropped from the cloud outright. Every later point then reads as
// shifted by one position, because the comparison is positional (point k
// against generated point k), which is what makes a silent drop visible
// rather than merely undercounting.
scatter.fault('a cloud point dropped (count now 15, not the declared 16)',
  '<circle data-scatter="0-5" cx="142.1" cy="122.63" r="3" fill="#F0A33E" stroke="#0E0E11" stroke-width="0.8"/>',
  '',
  ['plot 0 cloud count', 'plot 0 point 5 x']);

console.log('');
scatter.control('after');

// The trend-direction check needs two DIFFERENT declarations compared against
// the same drawn cloud, which Harness's single-spec model does not express,
// so it is proven directly rather than through the class above.
{
  const rising = JSON.parse(readFileSync('curriculum/figures/harness-scatterplot-practice.json', 'utf8'));
  const falling = { ...rising, plots: [{ ...rising.plots[0], path: [[1, 46], [11, 8]] }] };
  const svgFalling = figureFromSpec(falling).svg;

  const selfBad = verifyPlane(falling, svgFalling).filter(c => !c.ok);
  const selfGood = selfBad.length === 0;
  ok &&= selfGood;
  console.log(`  [${selfGood ? 'PASS' : 'CONTROL FAILED'}] control: a falling spec against its own honestly-drawn falling cloud`);

  // The SAME drawn SVG, checked against a spec that declares the OPPOSITE
  // trend. A declared path and a drawn cloud that merely agree with each
  // other pass no matter what they claim (see the doc comment above
  // verifyScatter) -- this proves the one thing that IS independently
  // checkable: the drawn cloud's own gross direction against what the spec
  // in hand says it should be.
  const mismatchBad = verifyPlane(rising, svgFalling).filter(c => !c.ok);
  const caught = mismatchBad.some(c => c.name === 'plot 0 cloud trend direction');
  ok &&= caught;
  console.log(`  [${caught ? 'PASS' : 'PROOF FAILED'}] a spec declaring a RISING trend checked against a cloud honestly drawn FALLING`);
  console.log(`        ${mismatchBad.length} failure(s), trend check ${caught ? 'fired' : 'did not fire'}`);
}

// ─── DOT PLOTS ───────────────────────────────────────────────────────────────
console.log('\n\nDOT PLOT FAULT PROOFS  (harness-dot-plot-pets, 4 stacks)\n');
{
  const spec = JSON.parse(readFileSync('curriculum/figures/harness-dot-plot-pets.json', 'utf8'));
  const clean = buildShape(spec);
  const cleanBad = verifyShape(spec, clean).filter(c => !c.ok);
  const cleanGood = cleanBad.length === 0;
  ok &&= cleanGood;
  console.log(`  [${cleanGood ? 'PASS' : 'CONTROL FAILED'}] control before: ${verifyShape(spec, clean).length} assertions, ${cleanBad.length} failed`);
  console.log('\nfaults injected into the emitted SVG:');

  const fault = (label, old, neu, expect) => {
    if (!clean.includes(old)) { console.log(`  [PROOF FAILED] ${label}: target absent`); ok = false; return; }
    const faulted = clean.replace(old, neu);
    if (faulted === clean) { console.log(`  [PROOF FAILED] ${label}: replace was a no-op`); ok = false; return; }
    const bad = verifyShape(spec, faulted).filter(c => !c.ok);
    const names = bad.map(b => b.name);
    const missing = expect.filter(e => !names.some(nm => nm.includes(e)));
    const caught = bad.length > 0 && missing.length === 0;
    ok &&= caught;
    console.log(`  [${caught ? 'PASS' : 'PROOF FAILED'}] ${label}`);
    console.log(`        ${bad.length} failure(s): ${names.join(', ') || 'NONE'}`);
    if (missing.length) console.log(`        expected but not reported: ${missing.join(', ')}`);
  };

  // A dot dropped from a stack: the tally for that value is now wrong.
  fault('a dot dropped from a stack (value 1 now shows 2, not the declared 3)',
    '<circle data-dot="1-2" cx="142.5" cy="50" r="7" fill="#F0A33E" stroke="#0E0E11" stroke-width="0.8"/>',
    '',
    ['stack 1 dot count']);

  // A dot floating off its own tick's x, as opposed to stacked above it.
  fault('a dot drawn off its own tick (value 2 dot drifts sideways)',
    '<circle data-dot="2-0" cx="217.5" cy="84"',
    '<circle data-dot="2-0" cx="235" cy="84"',
    ['stack 2 dot aligned to its tick']);

  // A tick relabelled so it no longer names the value its stack is counting.
  fault('a tick label does not match its declared value (0 relabelled 9)',
    '<text data-role="tick" x="67.5" y="111" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="12" fill="#0E0E11">0</text>',
    '<text data-role="tick" x="67.5" y="111" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="12" fill="#0E0E11">9</text>',
    ['stack 0 label is "0"']);

  console.log(`\n  [${verifyShape(spec, clean).filter(c => !c.ok).length === 0 ? 'PASS' : 'CONTROL FAILED'}] control after: unchanged spec still verifies clean`);
}

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

// ─── DATA TABLES AND PICTOGRAPHS ─────────────────────────────────────────────
console.log('\n\nDATA TABLE FAULT PROOFS\n');
{
  const spec = JSON.parse(readFileSync('curriculum/figures/pr-1-3-pictograph-pizzas.json', 'utf8'));
  const twoway = JSON.parse(readFileSync('curriculum/figures/harness-table-twoway.json', 'utf8'));
  const clean = (sp) => verifyTable(sp, buildTable(sp)).filter((c) => !c.ok);
  const ctrl = (tag, sp, name) => {
    const bad = clean(sp); const good = bad.length === 0;
    ok &&= good;
    console.log(`  [${good ? 'PASS' : 'CONTROL FAILED'}] control ${tag} (${name}): ${verifyTable(sp, buildTable(sp)).length} assertions, ${bad.length} failed`);
  };
  ctrl('before', twoway, 'two-way');
  ctrl('before', spec, 'pictograph');

  const fault = (label, sp, old, neu, expect, region) => {
    const svg = buildTable(sp);
    if (!svg.includes(old)) { console.log(`  [PROOF FAILED] ${label}: target absent, injection would be a no-op`); ok = false; return; }
    const faulted = svg.replace(old, neu);
    if (faulted === svg) { console.log(`  [PROOF FAILED] ${label}: replace was a no-op`); ok = false; return; }
    // The mutated element must still be visible to the verifier's own regexes.
    const seen = (t) => [...t.matchAll(region)].length;
    if (seen(faulted) !== seen(svg)) {
      console.log(`  [PROOF FAILED] ${label}: injection left the scanned region (${seen(faulted)} vs ${seen(svg)})`);
      ok = false; return;
    }
    const bad = verifyTable(sp, faulted).filter((c) => !c.ok);
    const hit = bad.some((c) => c.name.includes(expect));
    ok &&= hit;
    console.log(`  [${hit ? 'PASS' : 'PROOF FAILED'}] ${label}`);
    console.log(`        ${bad.length} failure(s): ${bad.slice(0, 3).map((c) => c.name).join('; ') || 'NONE'}`);
  };

  const CELLS = /<text data-cell="\d+-\d+"/g;
  const SYMS = /<path data-symbol="\d+-\d+"/g;

  // The cell's own coordinates, READ OFF THE BUILT SVG rather than written in.
  //
  // These were literals -- x="89" y="52" -- and the moment column widths changed
  // the injections silently became no-ops, which the harness correctly reported
  // as two failed proofs. A fault proof that hardcodes the output it is mutating
  // stops proving anything the first time the layout moves, so the anchor is now
  // derived and the shifted values are derived from it.
  const cellSvg = buildTable(twoway);
  const cell01 = cellSvg.match(/<text data-cell="0-1" x="([0-9.]+)" y="([0-9.]+)"/);
  if (!cell01) { console.log('  [PROOF FAILED] cell 0-1 not found in the built table'); ok = false; }
  const [cellAnchor, cellX, cellY] = cell01 ?? ['', '0', '0'];
  const vlines = [...cellSvg.matchAll(/<line data-vline="\d+" x1="([0-9.]+)"/g)].map((m) => Number(m[1]));
  const rowH = 24, cellPadHalf = 5;

  // A cell in the wrong ROW: the top data cell dropped into the row below.
  fault('a cell drawn in the wrong row', twoway,
    cellAnchor, `<text data-cell="0-1" x="${cellX}" y="${Number(cellY) + rowH}"`,
    'in row 0', CELLS);
  // A cell in the wrong COLUMN: same cell shifted one data column right.
  fault('a cell drawn in the wrong column', twoway,
    cellAnchor, `<text data-cell="0-1" x="${vlines[2] + cellPadHalf}" y="${cellY}"`,
    'in column 1', CELLS);

  // A pictograph key that disagrees with its symbols: one symbol removed while the
  // row still declares its total, so count x key no longer reaches it.
  {
    const svg = buildTable(spec);
    const one = svg.match(/<path data-symbol="1-4" d="[^"]+" fill="[^"]*" stroke="[^"]*" stroke-width="[^"]*"\/>/);
    if (!one) { console.log('  [PROOF FAILED] key/symbol disagreement: target absent'); ok = false; }
    else {
      const faulted = svg.replace(one[0], '');
      const bad = verifyTable(spec, faulted).filter((c) => !c.ok);
      const hit = bad.some((c) => c.name.includes('symbol count'))
        && bad.some((c) => c.name.includes('times key equals its total'));
      ok &&= hit;
      console.log(`  [${hit ? 'PASS' : 'PROOF FAILED'}] a pictograph key that disagrees with its symbols`);
      console.log(`        ${bad.length} failure(s): ${bad.map((c) => c.name).join('; ')}`);
    }
  }

  // THE DRAWN-GLYPH CASE. A symbol rescaled so it is still exactly ONE path -- the
  // count still reads correct -- but wrong as geometry. A text glyph could not be
  // checked this way at all, which is why the symbols are drawn.
  {
    const svg = buildTable(spec);
    const m = svg.match(/<path data-symbol="0-1" d="([^"]+)"/);
    const shrunk = m[1].replace(/-?\d+(?:\.\d+)?/g, (v, i) => String(Number(v) * 0.5));
    fault('a symbol drawn at the wrong SCALE, count still correct', spec,
      `d="${m[1]}"`, `d="${shrunk}"`, 'width', SYMS);
    const moved = m[1].replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g,
      (_, a, b) => `${Number(a)} ${Number(b) + 30}`);
    fault('a symbol drawn in the wrong ROW, count still correct', spec,
      `d="${m[1]}"`, `d="${moved}"`, 'in row 0', SYMS);
  }

  // THE WIDTH GUARD, observed refusing. One character over the boundary must throw
  // and one character under must build: a guard never seen refusing is an assumption.
  {
    const fits = { type: 'data_table', columns: ['', 'A'], rows: [], alt: 'x' };
    const widest = (label) => ({ ...fits, rows: [{ label, cells: ['1'] }] });
    // Binary-search the longest label that still builds.
    let lo = 1, hi = 200;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      try { buildTable(widest('x'.repeat(mid))); lo = mid; } catch { hi = mid - 1; }
    }
    let threwOver = false, builtUnder = false, msg = '';
    try { buildTable(widest('x'.repeat(lo))); builtUnder = true; } catch (e) { msg = e.message; }
    try { buildTable(widest('x'.repeat(lo + 1))); } catch (e) { threwOver = true; msg = e.message; }
    const good = builtUnder && threwOver;
    ok &&= good;
    console.log(`  [${good ? 'PASS' : 'PROOF FAILED'}] the width guard refuses above 316px`);
    console.log(`        ${lo} chars builds, ${lo + 1} chars throws: ${msg.slice(0, 96)}`);
  }

  ctrl('after', twoway, 'two-way');
  ctrl('after', spec, 'pictograph');
}

// -- CURVES (parabolas) -------------------------------------------------------
// A TANGENT parabola touches the x-axis at its vertex and never crosses. The
// root check cannot count that touch (a graze reads as 0 or 2 sign changes),
// so verifyCurves asserts instead that the curve stays on one side of the
// axis. Prove that assertion can fail: drop the touch point below the axis so
// the drawn curve crosses, and confirm the tangent check reports it.
console.log('\n\nCURVE FAULT PROOFS  (ar-3-6-p4, upward parabola tangent to the x-axis at x=3)\n');
const tangent = new Harness('curriculum/figures/ar-3-6-p4.json');
tangent.control('before');
console.log('\nfault injected into the emitted SVG:');
tangent.fault('the tangent redrawn crossing the axis (touch point dropped below the x-axis)',
  '173.16,192.64 175,192.67 176.84,192.64',
  '173.16,192.64 175,228 176.84,192.64',
  ['tangent touches axis without crossing']);
tangent.control('after');

console.log(`\nRESULT: ${ok ? 'the bar, box, series, bounds, table and curve checks can fail, and do' : 'A PROOF OR CONTROL FAILED'}`);
process.exit(ok ? 0 : 1);
