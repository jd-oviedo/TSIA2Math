// make_figure.mjs -- turn a checked-in JSON figure spec into a base64 data URI
// that can be pasted into curriculum markdown as `![alt](<uri>)`.
//
// Why a data URI rather than a file in public/: curriculum content is uploaded
// to Supabase independently of app deploys, so a /images/... path would 404
// between a content upload and the next deploy. A data URI keeps the figure
// atomic with the markdown that uses it. Base64 specifically because SVG source
// contains spaces and parentheses, both of which break markdown's ![](...)
// syntax; base64 contains neither, and it also carries no `---`, which the
// uploader's stem parser strips.
//
// Why not app/components/FigureRenderer.tsx: that is a React client component
// and curriculum renders through a string-HTML pipeline with no mount point.
// Its conventions are followed here -- structured props in, hand-rolled SVG
// out, no chart library, no raster -- but none of its code is shared, and its
// twelve types do not include a Cartesian plot, which is what Unit 2 needs.
//
// Colours are hardcoded to the live curriculum page palette in
// topic-page-css.ts. They cannot be CSS variables: an <img> is an isolated
// context that custom properties do not cross. That costs nothing here because
// the curriculum pages are light-only and use no --ec-* variables themselves.
//
//   node scripts/make_figure.mjs curriculum/figures/ar-2-6-slope.json
//   node scripts/make_figure.mjs curriculum/figures/ar-2-6-slope.json --svg
//   node scripts/make_figure.mjs --all          # regenerate every spec, check drift
//   node scripts/make_figure.mjs --inject path/to/topic.md   # rewrite figures in place
//   node scripts/make_figure.mjs --verify        # re-measure every figure's geometry
//
// The JSON spec is the reviewable artifact. The base64 blob in the markdown is
// generated output; regenerate rather than hand-edit it.

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { buildShape, verifyShape, SHAPE_TYPES } from './figure_shapes.mjs';
import { basename, resolve } from 'path';
import { fileURLToPath } from 'url';

const INK = '#0E0E11';       // axes, text
const LINE = '#6E9DC8';      // primary plotted line
const ACCENT = '#F0A33E';    // points of interest, second line
const SURFACE = '#F7F3E7';   // figure background
const GRID = '#E2DCCA';      // gridlines: a tint of SURFACE, the one derived value

const W = 340, H = 250;

// Padding is asymmetric and computed per figure. A fixed pad collided the
// rotated y-axis title with three-digit tick labels on the money axes.
function padding(spec, yTicks) {
  const widest = Math.max(...yTicks.map(v => String(v).length));
  return {
    l: 16 + widest * 6 + (spec.yLabel ? 16 : 0),
    r: 18,
    t: 16,
    b: 22 + (spec.xLabel ? 16 : 0),
  };
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Round to 2dp and drop a trailing .00, so the SVG source stays readable and
// small. Sub-pixel precision buys nothing at this size.
const n = v => Math.round(v * 100) / 100;

function makeScales(xRange, yRange, pad) {
  const [x0, x1] = xRange, [y0, y1] = yRange;
  return {
    X: x => n(pad.l + ((x - x0) / (x1 - x0)) * (W - pad.l - pad.r)),
    // Flipped: SVG y grows downward, the plane's y grows upward.
    Y: y => n(H - pad.b - ((y - y0) / (y1 - y0)) * (H - pad.t - pad.b)),
  };
}

// Ticks on a nice-number ladder, so a money axis lands on 20s rather than on
// whatever span/10 happens to be. Picks the smallest step giving <= 10 ticks.
const NICE_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
function ticks([lo, hi]) {
  const span = hi - lo;
  const step = NICE_STEPS.find(s => span / s <= 10) ?? Math.ceil(span / 10);
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(n(v));
  return out;
}

// A line as {m, b}, {x} for a vertical, or {through: [[x1,y1],[x2,y2]]}.
// Returns the two endpoints clipped to the plot window.
function lineEndpoints(line, xRange, yRange) {
  if (line.x !== undefined) return [[line.x, yRange[0]], [line.x, yRange[1]]];
  let { m, b } = line;
  if (line.through) {
    const [[ax, ay], [bx, by]] = line.through;
    m = (by - ay) / (bx - ax);
    b = ay - m * ax;
  }
  // Clip to the window so a steep line does not run outside the frame.
  const pts = [];
  for (const x of xRange) {
    const y = m * x + b;
    if (y >= yRange[0] - 1e-9 && y <= yRange[1] + 1e-9) pts.push([x, y]);
  }
  for (const y of yRange) {
    const x = (y - b) / m;
    if (x > xRange[0] + 1e-9 && x < xRange[1] - 1e-9) pts.push([x, y]);
  }
  return pts.slice(0, 2);
}

// ─── Curves ──────────────────────────────────────────────────────────────────

// Unit 4 needs a plotted function, which is the one Cartesian mark this file
// never had. It is added to `coordinate_plane` as a `curves` array rather than
// as a new top-level type: the grid, ticks, axes, points and padding above are
// all reusable as they stand, and figure_shapes.mjs already shows what forking
// them costs -- circle_plane re-implements the grid, and now has to be kept in
// step with this one by hand.
//
// A curve is declared by family and parameters, never as a list of points. The
// point list is precisely what verifyCurves recomputes from the emitted SVG, so
// a spec that supplied one would reduce the check to comparing the builder's
// input with itself.
const CURVE_KINDS = {
  quadratic:   c => x => c.a * x * x + c.b * x + c.c,
  vertex:      c => x => c.a * (x - c.h) * (x - c.h) + c.k,
  exponential: c => x => c.a * Math.pow(c.r, x),
};

export function curveFn(c) {
  const make = CURVE_KINDS[c.kind];
  if (!make) throw new Error(`unknown curve kind: ${c.kind} (known: ${Object.keys(CURVE_KINDS).join(', ')})`);
  return make(c);
}

// The landmarks a reader is expected to read off the picture, derived
// ALGEBRAICALLY from the spec's parameters. Deliberately not by evaluating
// curveFn: the builder plots by evaluating curveFn, so a landmark obtained the
// same way would agree with the plot no matter what either of them did. Going
// through -b/2a and the completed square instead makes the vertex and root
// checks in verifyCurves independent computations that can genuinely disagree.
export function curveLandmarks(c) {
  if (c.kind === 'exponential') {
    return { vertex: null, roots: [], yIntercept: c.a };
  }
  const a = c.a;
  const h = c.kind === 'vertex' ? c.h : -c.b / (2 * a);
  const k = c.kind === 'vertex' ? c.k : c.c - (c.b * c.b) / (4 * a);
  // From the vertex form a(x-h)^2 + k = 0, so (x-h)^2 = -k/a.
  const sq = -k / a;
  const roots = sq < 0 ? [] : sq === 0 ? [h] : [h - Math.sqrt(sq), h + Math.sqrt(sq)];
  const yIntercept = c.kind === 'vertex' ? a * h * h + k : c.c;
  return { vertex: [h, k], roots, yIntercept };
}

// ~2px of plot width per sample at W = 340. Fine enough that the chord between
// two samples is indistinguishable from the curve at this size, and the
// residual tolerance below is set against that.
const CURVE_SAMPLES = 160;

// Samples a curve across xRange and splits it into the runs that lie inside
// yRange, so an arm that leaves the top of the frame stops at the frame instead
// of being drawn outside it.
//
// The exit point is found by bisecting for the x where the curve actually meets
// the boundary, not by interpolating the chord to the first outside sample. A
// chord endpoint sits slightly off the curve, and since verifyCurves measures
// every emitted vertex against the function, that would leave the check
// measuring this clipper's error rather than the plot's.
function curveRuns(c, xRange, yRange) {
  const f = curveFn(c);
  const [x0, x1] = xRange, [ylo, yhi] = yRange;
  const inside = y => Number.isFinite(y) && y >= ylo - 1e-12 && y <= yhi + 1e-12;
  const step = (x1 - x0) / CURVE_SAMPLES;

  const cross = (xa, xb, bound) => {
    let lo = xa, hi = xb;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if ((f(lo) - bound) * (f(mid) - bound) <= 0) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  };

  const runs = [];
  let run = [], prevX = null, prevY = null, prevIn = false;

  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const x = i === CURVE_SAMPLES ? x1 : x0 + i * step;
    const y = f(x);
    const isIn = inside(y);

    if (isIn && !prevIn && prevX !== null && Number.isFinite(prevY)) {
      const bound = prevY > yhi ? yhi : ylo;
      run.push([cross(prevX, x, bound), bound]);
    }
    if (isIn) run.push([x, y]);
    if (!isIn && prevIn && Number.isFinite(y)) {
      const bound = y > yhi ? yhi : ylo;
      run.push([cross(prevX, x, bound), bound]);
      runs.push(run);
      run = [];
    } else if (!isIn && prevIn) {
      runs.push(run);
      run = [];
    }
    prevX = x; prevY = y; prevIn = isIn;
  }
  if (run.length > 1) runs.push(run);
  return runs.filter(r => r.length > 1);
}

// A bar chart is `coordinate_plane` with a `bars` array, not a new top-level
// type, for the same reason curves were: the grid, the y ticks, the padding, the
// axis titles and the alt-text contract are all reusable as they stand, and
// figure_shapes.mjs already shows what forking them costs -- circle_plane
// re-implements the grid and now has to be kept in step by hand.
//
// What IS new is that the x-axis stops being numeric. A categorical axis has no
// tick ladder to invert, which is the whole reason verifyPlane could not check a
// bar until this change: it recovers the data-to-pixel map from numeric tick
// labels and bails when an axis carries fewer than two.
//
// The categorical replacement for the tick ladder is the PRINTED CATEGORY
// LABELS. That keeps the measuring principle intact rather than abandoning it:
// on a numeric axis the check reads the numbers a reader sees, and on a
// categorical axis it reads the names a reader sees. Band placement is then
// verified against where those names were printed, not against the builder's
// own padding arithmetic.
function barLayout(bars, pad) {
  const plotL = pad.l, plotR = W - pad.r;
  const band = (plotR - plotL) / bars.length;
  return { band, barW: n(band * 0.62), centre: i => plotL + (i + 0.5) * band };
}

function buildSvg(spec) {
  const bars = spec.bars ?? [];
  const categorical = bars.length > 0;

  // Boundary checks, not defaults. A spec that mixes a categorical x-axis with
  // numeric-x marks, or that omits the axis top, would otherwise produce a
  // well-formed and meaningless picture -- the silent-default shape.
  if (categorical) {
    for (const k of ['lines', 'curves', 'points'])
      if (spec[k]?.length)
        throw new Error(`bars put a categorical x-axis on the plane, so "${k}" cannot share it: those marks are placed by numeric x`);
    if (!spec.yRange)
      throw new Error('a bar chart must declare yRange: where a value axis stops is an editorial choice about how the data reads, never a default');
    for (const [i, B] of bars.entries()) {
      if (typeof B.value !== 'number' || !Number.isFinite(B.value))
        throw new Error(`bar ${i} ("${B.label}") has no finite value`);
      if (!B.label) throw new Error(`bar ${i} has no label: a categorical axis is read by its names`);
      if (B.value > spec.yRange[1]) throw new Error(`bar ${i} ("${B.label}") value ${B.value} runs past the top of yRange`);
      if (B.value < spec.yRange[0]) throw new Error(`bar ${i} ("${B.label}") value ${B.value} sits below the baseline yRange[0]`);
    }
  }

  const xRange = spec.xRange ?? [-1, 9];
  const yRange = spec.yRange ?? [-1, 9];
  const gy0 = ticks(yRange);
  const pad = padding(spec, gy0);
  const { X, Y } = makeScales(xRange, yRange, pad);
  const parts = [];
  // On a categorical axis there is no x = 0 to hang the y labels off, and the
  // default xRange would put X(0) somewhere inside the plot.
  const axisX = categorical ? pad.l : X(0);

  parts.push(`<rect width="${W}" height="${H}" fill="${SURFACE}" rx="10"/>`);

  // Gridlines. Vertical ones mark numeric x values and mean nothing between
  // categories, so a bar chart gets horizontal rules only.
  const gx = ticks(xRange), gy = gy0;
  parts.push(`<g stroke="${GRID}" stroke-width="1">`);
  if (!categorical)
    for (const v of gx) parts.push(`<line x1="${X(v)}" y1="${Y(yRange[1])}" x2="${X(v)}" y2="${Y(yRange[0])}"/>`);
  for (const v of gy)
    parts.push(`<line x1="${categorical ? pad.l : X(xRange[0])}" y1="${Y(v)}" x2="${categorical ? W - pad.r : X(xRange[1])}" y2="${Y(v)}"/>`);
  parts.push(`</g>`);

  // Bars, drawn under the axes so the baseline reads as a crisp edge.
  if (categorical) {
    const { barW, centre } = barLayout(bars, pad);
    const yBase = Y(yRange[0]);
    bars.forEach((B, i) => {
      const cx = centre(i), yTop = Y(B.value);
      parts.push(`<rect data-bar="${i}" x="${n(cx - barW / 2)}" y="${n(yTop)}" width="${barW}" height="${n(yBase - yTop)}" fill="${B.color === 'accent' ? ACCENT : LINE}"/>`);
    });
  }

  // Shaded half-plane, produced by clipping the whole plot window against the
  // inequality (Sutherland-Hodgman) rather than by joining the boundary's two
  // endpoints to a pair of corners. The naive version drew a straight edge from
  // the boundary to a corner, which silently cut off any part of the window
  // lying past the point where the boundary leaves the frame -- wrong whenever
  // the line exits through the top or bottom rather than the sides.
  if (spec.shade) {
    const { line: li = 0, side } = spec.shade;
    const L = spec.lines[li];
    const at = x => (L.through
      ? ((L.through[1][1] - L.through[0][1]) / (L.through[1][0] - L.through[0][0])) * (x - L.through[0][0]) + L.through[0][1]
      : L.m * x + L.b);
    // Signed test: positive means the point is inside the shaded half-plane.
    const inside = ([x, y]) => (side === 'above' ? y - at(x) : at(x) - y);

    let poly = [[xRange[0], yRange[0]], [xRange[1], yRange[0]], [xRange[1], yRange[1]], [xRange[0], yRange[1]]];
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const A = poly[i], B = poly[(i + 1) % poly.length];
      const dA = inside(A), dB = inside(B);
      if (dA >= 0) out.push(A);
      if ((dA >= 0) !== (dB >= 0)) {
        const t = dA / (dA - dB);
        out.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]);
      }
    }
    if (out.length > 2)
      parts.push(`<polygon points="${out.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" fill="${LINE}" fill-opacity="0.18"/>`);
  }

  // Axes. A categorical plane has a baseline at the foot of the value axis and a
  // value axis at the left edge of the plot, wherever yRange starts; the numeric
  // plane keeps drawing its axes through the origin.
  if (categorical) {
    parts.push(`<line x1="${pad.l}" y1="${Y(yRange[0])}" x2="${W - pad.r}" y2="${Y(yRange[0])}" stroke="${INK}" stroke-width="1.6"/>`);
    parts.push(`<line x1="${pad.l}" y1="${Y(yRange[0])}" x2="${pad.l}" y2="${Y(yRange[1])}" stroke="${INK}" stroke-width="1.6"/>`);
  } else {
    if (yRange[0] <= 0 && yRange[1] >= 0)
      parts.push(`<line x1="${X(xRange[0])}" y1="${Y(0)}" x2="${X(xRange[1])}" y2="${Y(0)}" stroke="${INK}" stroke-width="1.6"/>`);
    if (xRange[0] <= 0 && xRange[1] >= 0)
      parts.push(`<line x1="${X(0)}" y1="${Y(yRange[0])}" x2="${X(0)}" y2="${Y(yRange[1])}" stroke="${INK}" stroke-width="1.6"/>`);
  }

  // Axis numbers, origin skipped to avoid the two labels colliding.
  //
  // The category names carry data-cat so they can never be mistaken for numeric
  // x ticks by the verifier's regex, which matches on `<text x="` and would
  // otherwise swallow a category legitimately named "2020" and try to invert an
  // axis through it. Like data-curve, the attribute is a claim about which
  // category this is; the position it is attached to is still measured, so the
  // check does not rest on it.
  parts.push(`<g font-family="ui-sans-serif,system-ui,sans-serif" font-size="10" fill="${INK}">`);
  if (!categorical)
    for (const v of gx) if (v !== 0) parts.push(`<text x="${X(v)}" y="${Y(0) + 13}" text-anchor="middle">${v}</text>`);
  // NB: the numeric branch keeps the exact expression it always had, floating
  // point artefacts and all. Wrapping it in n() would re-round every existing
  // figure's y labels and change bytes that are already base64'd into content.
  for (const v of gy) if (categorical || v !== 0)
    parts.push(`<text x="${categorical ? n(axisX - 6) : X(0) - 6}" y="${Y(v) + 3.5}" text-anchor="end">${v}</text>`);
  if (categorical) {
    const { centre } = barLayout(bars, pad);
    const yBase = Y(yRange[0]);
    bars.forEach((B, i) =>
      parts.push(`<text data-cat="${i}" x="${n(centre(i))}" y="${n(yBase + 14)}" text-anchor="middle">${esc(B.label)}</text>`));
  }
  parts.push(`</g>`);

  // Lines
  (spec.lines ?? []).forEach((L, i) => {
    const [p, q] = lineEndpoints(L, xRange, yRange);
    const stroke = L.color === 'accent' ? ACCENT : LINE;
    const dash = L.style === 'dashed' ? ' stroke-dasharray="7 5"' : '';
    parts.push(`<line x1="${X(p[0])}" y1="${Y(p[1])}" x2="${X(q[0])}" y2="${Y(q[1])}" stroke="${stroke}" stroke-width="2.6" stroke-linecap="round"${dash}/>`);
    if (L.label) {
      const [lx, ly] = L.labelAt ?? q;
      parts.push(`<text x="${X(lx) + (L.labelDx ?? 6)}" y="${Y(ly) + (L.labelDy ?? -6)}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" font-weight="600" fill="${stroke}">${esc(L.label)}</text>`);
    }
  });

  // Curves. Drawn after the straight lines and before the marked points, so a
  // labelled vertex or intercept sits on top of its own curve.
  //
  // data-curve carries the index the polyline was drawn for. It is inert in the
  // rendered image and exists so verifyCurves can attribute a run to a curve
  // when one curve emits several. The attribute is a claim about which curve
  // this is; the geometry it is attached to is still measured, so the check
  // does not rest on it.
  (spec.curves ?? []).forEach((C, i) => {
    const stroke = C.color === 'accent' ? ACCENT : LINE;
    const dash = C.style === 'dashed' ? ' stroke-dasharray="7 5"' : '';
    for (const run of curveRuns(C, xRange, yRange)) {
      const pts = run.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ');
      parts.push(`<polyline data-curve="${i}" points="${pts}" fill="none" stroke="${stroke}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"${dash}/>`);
    }
    if (C.label) {
      // No natural endpoint to hang a label off, the way a straight line has
      // one, so a labelled curve has to say where the label goes.
      if (!C.labelAt) throw new Error(`curve ${i} has a label but no labelAt: a curve has no default label anchor`);
      // SVG text has no LaTeX, so "y = x^2 - 4x + 3" would render with a
      // literal caret. A curve label is for telling two curves apart in words
      // ("growth", "decay"); the equation belongs in the prose beside the
      // figure, where it typesets properly.
      if (/[\^_]/.test(C.label))
        throw new Error(`curve ${i} label "${C.label}" contains ^ or _, which SVG renders literally: put the equation in the prose, not the figure`);
      const [lx, ly] = C.labelAt;
      parts.push(`<text x="${X(lx) + (C.labelDx ?? 6)}" y="${Y(ly) + (C.labelDy ?? -6)}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" font-weight="600" fill="${stroke}">${esc(C.label)}</text>`);
    }
  });

  // Marked points
  (spec.points ?? []).forEach(P => {
    parts.push(`<circle cx="${X(P.x)}" cy="${Y(P.y)}" r="4.5" fill="${P.color === 'line' ? LINE : ACCENT}" stroke="${SURFACE}" stroke-width="1.5"/>`);
    if (P.label)
      parts.push(`<text x="${X(P.x) + (P.dx ?? 8)}" y="${Y(P.y) + (P.dy ?? -8)}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" font-weight="600" fill="${INK}">${esc(P.label)}</text>`);
  });

  // Axis titles
  if (spec.xLabel) parts.push(`<text x="${(W + pad.l - pad.r) / 2}" y="${H - 5}" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" fill="${INK}">${esc(spec.xLabel)}</text>`);
  if (spec.yLabel) parts.push(`<text x="10" y="${(H - pad.b + pad.t) / 2}" text-anchor="middle" transform="rotate(-90 10 ${(H - pad.b + pad.t) / 2})" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" fill="${INK}">${esc(spec.yLabel)}</text>`);

  if (!spec.alt) throw new Error('spec.alt is required: the figure supplements the text, it never replaces it');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(spec.alt)}">${parts.join('')}</svg>`;
}

// Unit 2 shipped only the Cartesian plot, built above. Unit 3's geometry types
// live in figure_shapes.mjs and are dispatched here by spec.type; anything
// without a recognised geometric type falls through to the plot, which is what
// the Unit 2 specs are.
export function figureFromSpec(spec) {
  const svg = SHAPE_TYPES.includes(spec.type) ? buildShape(spec) : buildSvg(spec);
  return {
    svg,
    alt: spec.alt,
    uri: 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64'),
  };
}

// Re-measures the emitted SVG and compares scale-invariant quantities against
// the spec. Scale invariance is deliberate: a check that recomputed from the
// builder's own numbers would pass even when those numbers are wrong.
//
// ─── WHAT --verify PROVES, AND WHAT IT DOES NOT ──────────────────────────────
//
// This distinction decides what a figure check can be trusted for, so it is
// stated here rather than left to be rediscovered:
//
//   BUILDER FIDELITY   does the emitted SVG match the spec?        YES, checked
//   SPEC CONSISTENCY   is the spec's own claim true?               NO, never
//
// verifyFigure(spec) calls the builder internally and verifies the result
// against the same spec, so the two move together. It can prove the drawing is
// faithful to the declaration. It cannot prove the declaration is right.
//
// Measured on a scatter with a declared fitted line: a builder drawing the wrong
// slope is caught, and a point drawn in the wrong place is caught, but a line
// declared m = -4 against a rising cloud, drawn honestly, PASSES every
// assertion. Nothing cross-checks two declarations against each other.
//
// THIS BITES HARDER ON DATA DISPLAYS THAN ON GEOMETRY, and that is why it is
// worth stating twice. A triangle's spec claims a shape, and a reader who
// mistrusts it can look at it. A bar chart's spec encodes a DATASET, and a
// reader will believe the numbers because the picture is the only copy of them
// they are shown. `bars: [{label: "Mon", value: 12}]` verified to the hilt still
// says nothing about whether 12 cups were sold on Monday. Same for a box plot's
// five-number summary: --verify proves the quartile marks sit where the spec put
// them, never that the summary describes the dataset it claims to.
//
// So: whether a declared value matches the underlying data is a CONTENT claim,
// and it belongs to the three-pass distractor ledger and to review, exactly like
// an arithmetic claim in a rationale. It is not the harness's job and the
// harness must not be read as having done it.
//
// The two-argument forms below, verifyPlane(spec, svg) and verifyBars(...),
// separate the two sides, which is what makes fault injection possible at all: a
// fault injected into the input of BOTH sides of a comparison is not a fault.
export function verifyFigure(spec) {
  if (SHAPE_TYPES.includes(spec.type)) return verifyShape(spec, buildShape(spec));
  if (spec.type === 'coordinate_plane') return verifyPlane(spec, buildSvg(spec));
  return [];
}

// Cartesian plots are measured by recovering the data-to-pixel map from the
// AXIS TICK LABELS in the emitted SVG -- the numbers a reader actually sees --
// and never from makeScales(). Inverting that map turns each drawn line back
// into a slope and an intercept, which are then compared with the spec. A
// builder that mis-scaled an axis would move the ticks and the line together
// under its own scale function, so measuring against the printed ticks is what
// makes this a real check rather than a tautology.
export function verifyPlane(spec, svg) {
  const checks = [];
  const add = (name, actual, expected, tol) =>
    checks.push({ name, actual: +actual.toFixed(4), expected: +expected.toFixed(4), ok: Math.abs(actual - expected) <= tol });

  const xt = [...svg.matchAll(/<text x="([-\d.]+)" y="[-\d.]+" text-anchor="middle">(-?\d+(?:\.\d+)?)<\/text>/g)]
    .map(m => [Number(m[2]), Number(m[1])]);
  const yt = [...svg.matchAll(/<text x="[-\d.]+" y="([-\d.]+)" text-anchor="end">(-?\d+(?:\.\d+)?)<\/text>/g)]
    .map(m => [Number(m[2]), Number(m[1]) - 3.5]);

  // A categorical x-axis has no numeric ladder to invert, so the x half of the
  // guard below cannot apply to it. The y half still does, and is still the only
  // thing standing between a bar chart and an unmeasurable value axis.
  const categorical = (spec.bars ?? []).length > 0;
  if (categorical) {
    if (yt.length < 2)
      return [{ name: 'y axis ticks readable', actual: yt.length, expected: 2, ok: false }];
  } else if (xt.length < 2 || yt.length < 2) {
    return [{ name: 'axis ticks readable', actual: Math.min(xt.length, yt.length), expected: 2, ok: false }];
  }

  // Invert from the first and last tick on each axis.
  const invert = t => {
    const [a, b] = [t[0], t[t.length - 1]];
    const s = (b[1] - a[1]) / (b[0] - a[0]);
    return px => a[0] + (px - a[1]) / s;
  };
  const ix = categorical ? null : invert(xt), iy = invert(yt);

  if (categorical) {
    if (yt.length > 2) add('y tick labels linear',
      Math.max(0, ...yt.slice(1, -1).map(([v, px]) => Math.abs(iy(px) - v))), 0,
      0.01 * Math.abs(spec.yRange[1] - spec.yRange[0]));
    verifyBars(spec, svg, iy, add);
    return checks;
  }

  // Axis labels. The map above is fitted to the first and last tick on each
  // axis, so pushing every OTHER printed tick back through it and requiring the
  // number it prints to come back out tests that the labels are placed linearly
  // and carry the values they sit at. A tick ladder drawn on one scale and
  // numbered on another passes every curve check below -- the curve and the
  // ticks would move together -- and fails here.
  const labelDrift = (t, inv) => Math.max(0, ...t.slice(1, -1).map(([v, px]) => Math.abs(inv(px) - v)));
  if (xt.length > 2) add('x tick labels linear', labelDrift(xt, ix), 0, 0.01 * Math.abs(spec.xRange[1] - spec.xRange[0]));
  if (yt.length > 2) add('y tick labels linear', labelDrift(yt, iy), 0, 0.01 * Math.abs(spec.yRange[1] - spec.yRange[0]));

  const drawn = [...svg.matchAll(/<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)" stroke="[^"]*" stroke-width="2.6"/g)];
  const declared = spec.lines ?? [];
  add('every declared line drawn', drawn.length, declared.length, 0);

  drawn.slice(0, declared.length).forEach((L, i) => {
    const [x1, y1, x2, y2] = [ix(+L[1]), iy(+L[2]), ix(+L[3]), iy(+L[4])];
    const m = (y2 - y1) / (x2 - x1), b = y1 - m * x1;
    const S = declared[i];
    // A line may be given as a slope/intercept pair or as two points it passes
    // through; reduce the second form to the first before comparing.
    const em = S.through ? (S.through[1][1] - S.through[0][1]) / (S.through[1][0] - S.through[0][0]) : S.m;
    const eb = S.through ? S.through[0][1] - em * S.through[0][0] : S.b;
    const yScale = Math.abs(spec.yRange[1] - spec.yRange[0]);
    add(`line ${i} slope`, m, em, 0.01 * Math.max(Math.abs(em), 1));
    add(`line ${i} intercept`, b, eb, 0.01 * yScale);
  });

  verifyCurves(spec, svg, ix, iy, add);

  // Marked points must sit where the spec puts them, not merely near the line.
  (spec.points ?? []).forEach((P, i) => {
    const C = [...svg.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="4.5"/g)][i];
    if (!C) return add(`point ${i} drawn`, 0, 1, 0);
    add(`point ${i} x`, ix(+C[1]), P.x, 0.01 * Math.abs(spec.xRange[1] - spec.xRange[0]));
    add(`point ${i} y`, iy(+C[2]), P.y, 0.01 * Math.abs(spec.yRange[1] - spec.yRange[0]));
  });

  return checks;
}

// Bars, measured back out of the emitted SVG.
//
// TWO INDEPENDENT REFERENCES, one per axis, and neither is the builder's own
// arithmetic:
//
//   value axis   the printed y tick labels, inverted exactly as everywhere else,
//                so a bar's height is read in DATA units and compared with the
//                declared value
//   category axis the printed category names. There is no ladder to invert, so
//                band placement is checked against where the reader sees each
//                name printed, plus the two structural facts a categorical axis
//                owes: bands evenly spaced, and bars of equal width
//
// What that combination catches: a bar drawn to the wrong height (its top
// inverts to the wrong value), a bar drawn in the wrong band (its centre no
// longer sits under its own name), bars emitted out of order (rect i lands under
// name j), an uneven axis, and a missing or extra bar.
//
// What it cannot catch, and must not be read as catching: whether `value` is the
// number the dataset actually holds. See the builder-fidelity note above
// verifyFigure. A bar chart's spec IS the dataset as far as this file is
// concerned.
export function verifyBars(spec, svg, iy, add) {
  const bars = spec.bars ?? [];
  const rects = [...svg.matchAll(/<rect data-bar="(\d+)" x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/g)];
  const cats = [...svg.matchAll(/<text data-cat="(\d+)" x="([-\d.]+)" y="[-\d.]+" text-anchor="middle">([^<]*)<\/text>/g)];

  add('every declared bar drawn', rects.length, bars.length, 0);
  add('every category labelled', cats.length, bars.length, 0);

  const yScale = Math.abs(spec.yRange[1] - spec.yRange[0]);
  const base = spec.yRange[0];

  bars.forEach((B, i) => {
    const R = rects[i], C = cats[i];
    if (!R) return add(`bar ${i} drawn`, 0, 1, 0);
    // rect y is the top edge and y + height the foot, both in pixels; the y-map
    // turns them back into values on the axis the reader is looking at.
    add(`bar ${i} value`, iy(+R[3]), B.value, 0.01 * yScale);
    add(`bar ${i} sits on the baseline`, iy(+R[3] + +R[5]), base, 0.01 * yScale);
    if (!C) return add(`bar ${i} labelled`, 0, 1, 0);
    // Band position: the bar's centre against its own printed name.
    add(`bar ${i} centred on its band`, +R[2] + +R[4] / 2, +C[2], 0.5);
    // Identity: rect i must be the bar whose name is printed under it. Compared
    // as an equality rather than a distance, so a reordering cannot average out.
    add(`bar ${i} label is "${B.label}"`, C[3] === esc(B.label) ? 1 : 0, 1, 0);
  });

  // Structural facts a categorical axis owes the reader, checked from the
  // printed names alone. Uneven bands or ragged widths make two bars visually
  // comparable when the data does not support the comparison.
  const bandX = cats.map(c => +c[2]);
  if (bandX.length > 2) {
    const gaps = bandX.slice(1).map((v, i) => v - bandX[i]);
    add('category bands evenly spaced', Math.max(...gaps) - Math.min(...gaps), 0, 0.5);
    add('category bands left to right', Math.min(...gaps) > 0 ? 1 : 0, 1, 0);
  }
  if (rects.length > 1) {
    const ws = rects.map(r => +r[4]);
    add('bars equal width', Math.max(...ws) - Math.min(...ws), 0, 0.5);
  }
}

// Recovers each plotted curve from the emitted <polyline> vertices, pushed back
// through the tick-label map, and checks four things against the spec:
//
//   residual    every emitted vertex satisfies the declared function
//   vertex      the measured extremum sits at the algebraic -b/2a
//   roots       the measured axis crossings sit at the algebraic roots
//   y-intercept the measured value at x = 0 is the declared one
//
// The last three are the ones that carry weight. Their expected values come out
// of curveLandmarks, which completes the square rather than evaluating the
// function, so a builder that plotted the wrong parabola would have to be wrong
// in a way that moved the measured extremum to -b/2a anyway to slip past.
//
// TOLERANCE. Everything is measured in data units and compared against a
// fraction of the relevant axis span, so a figure is held to the same standard
// whether its y-axis runs over 12 units or 12000.
//
//   residual   0.005 of the y-span
//   landmarks  0.01 of the axis span, matching the straight-line checks above
//
// The window 0.005 sits in, as fractions of the y-span:
//
//   6.7e-5   measured noise floor on a real figure (ar-3-5-minimum: 8e-4
//            absolute on a 12-unit span)
//   5.0e-3   this tolerance
//   8.3e-2   smallest mistake worth catching: an off-by-one on a coefficient
//            or a vertex, which on a typical 12-unit y-span is one unit
//
// So 6.25x above the noise and 16.6x below the smallest real error -- close to
// the geometric centre of the window at 0.0081. Both margins are needed: the
// floor is not analytic. Rounding to 2dp of a pixel by n() over a ~210px plot
// predicts only 2.4e-5 of the span, and chord error over one 2px sample step
// (|f''|/8 * dx^2) predicts less still; the rest comes from the tick-label
// inversion reading label anchor positions that carry the same rounding. The
// floor was measured, not derived, and the tolerance is set against the
// measurement.
//
// Exponentials are the stress case, since chord error goes as |f''| * dx^2 and
// an exponential's f'' grows without bound while sampling stays uniform. Swept
// against it: the two realistic AR.4.12 shapes clear the tolerance by 86x
// (compound interest, 8% over 30 years) and 213x (depreciation, -15% over 10
// years), and headroom only reaches 5x at a growth factor of 1e20 across the
// frame -- far outside anything a curriculum figure contains. 160 samples is
// therefore adequate for all three kinds, and the tolerance does not need
// relaxing to accommodate the exponential. Beyond about 1e40 the tick ladder
// itself gives out and the pre-existing 'axis ticks readable' guard fails the
// figure loudly, which is the right outcome.
export function verifyCurves(spec, svg, ix, iy, add) {
  const curves = spec.curves ?? [];
  const polys = [...svg.matchAll(/<polyline data-curve="(\d+)" points="([^"]+)"/g)];
  if (!curves.length && !polys.length) return;

  add('every declared curve drawn', new Set(polys.map(p => p[1])).size, curves.length, 0);

  const xSpan = Math.abs(spec.xRange[1] - spec.xRange[0]);
  const ySpan = Math.abs(spec.yRange[1] - spec.yRange[0]);

  curves.forEach((C, i) => {
    // Every run belonging to this curve, in x order, as data coordinates.
    const pts = polys
      .filter(p => Number(p[1]) === i)
      .flatMap(p => p[2].trim().split(/\s+/).map(pair => {
        const [px, py] = pair.split(',').map(Number);
        return [ix(px), iy(py)];
      }))
      .sort((p, q) => p[0] - q[0]);

    if (pts.length < 3) return add(`curve ${i} sampled`, pts.length, 3, 0);

    const f = curveFn(C);
    const { vertex, roots, yIntercept } = curveLandmarks(C);

    // Residual, over every emitted vertex rather than a sampled few.
    add(`curve ${i} max residual`, Math.max(...pts.map(([x, y]) => Math.abs(y - f(x)))), 0, 0.005 * ySpan);

    // Vertex, refined off the measured samples by fitting a parabola through
    // the extremum and its two neighbours -- the samples straddle the true
    // vertex rather than landing on it, so the nearest sample alone is only
    // accurate to half a step.
    if (vertex && vertex[0] > spec.xRange[0] && vertex[0] < spec.xRange[1]
        && vertex[1] >= spec.yRange[0] && vertex[1] <= spec.yRange[1]) {
      const pick = C.a > 0
        ? pts.reduce((b, p, j) => (p[1] < pts[b][1] ? j : b), 0)
        : pts.reduce((b, p, j) => (p[1] > pts[b][1] ? j : b), 0);
      if (pick > 0 && pick < pts.length - 1) {
        const [[x1, y1], [x2, y2], [x3, y3]] = [pts[pick - 1], pts[pick], pts[pick + 1]];
        const d1 = (y2 - y1) / (x2 - x1);
        const d2 = ((y3 - y2) / (x3 - x2) - d1) / (x3 - x1);
        const xv = d2 === 0 ? x2 : (x1 + x2) / 2 - d1 / (2 * d2);
        const yv = y1 + d1 * (xv - x1) + d2 * (xv - x1) * (xv - x2);
        add(`curve ${i} vertex x`, xv, vertex[0], 0.01 * xSpan);
        add(`curve ${i} vertex y`, yv, vertex[1], 0.01 * ySpan);
      }
    }

    // Roots, from the sign changes in the measured y values.
    const measuredRoots = [];
    for (let j = 1; j < pts.length; j++) {
      const [xa, ya] = pts[j - 1], [xb, yb] = pts[j];
      if (ya === 0) measuredRoots.push(xa);
      else if (ya * yb < 0) measuredRoots.push(xa + (xb - xa) * (0 - ya) / (yb - ya));
    }
    const visibleRoots = roots.filter(r => r > spec.xRange[0] && r < spec.xRange[1]);
    if (visibleRoots.length) {
      add(`curve ${i} root count`, measuredRoots.length, visibleRoots.length, 0);
      visibleRoots.slice(0, measuredRoots.length).forEach((r, j) =>
        add(`curve ${i} root ${j}`, measuredRoots[j], r, 0.01 * xSpan));
    }

    // y-intercept, interpolated where the curve crosses x = 0.
    if (spec.xRange[0] < 0 && spec.xRange[1] > 0
        && yIntercept >= spec.yRange[0] && yIntercept <= spec.yRange[1]) {
      const j = pts.findIndex(p => p[0] >= 0);
      if (j > 0) {
        const [xa, ya] = pts[j - 1], [xb, yb] = pts[j];
        add(`curve ${i} y-intercept`, ya + (yb - ya) * (0 - xa) / (xb - xa), yIntercept, 0.01 * ySpan);
      }
    }

    // No growth-versus-decay direction check, deliberately. One was written and
    // removed: the residual above already establishes that every emitted vertex
    // satisfies f, which fixes the direction as a consequence, so a direction
    // assertion can never fail for a true reason. It CAN fail spuriously, on a
    // curve flat enough that rounding takes the sign of the rise to zero. A
    // check that only ever produces false failures inflates the assertion count
    // and buys nothing.
  });

  // A marked point on a plane that carries curves has to sit ON one of them.
  //
  // This was added after the checks above passed a spec whose curve was plotted
  // correctly and whose vertex was LABELLED one unit off: the point check
  // downstream confirms a point is drawn where the spec asks, and the curve
  // checks confirm the curve is drawn where the spec asks, and neither notices
  // that the spec disagrees with itself. Marking the wrong vertex is the
  // likeliest authoring error on these figures, so it gets its own assertion.
  //
  // offCurve opts a point out, for the deliberate case of marking something
  // that is not a solution.
  (spec.points ?? []).forEach((P, j) => {
    if (P.offCurve || !curves.length) return;
    const miss = Math.min(...curves.map(C => Math.abs(P.y - curveFn(C)(P.x))));
    add(`point ${j} lies on a curve`, miss, 0, 0.01 * ySpan);
  });
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

// Guarded so the CLI runs only when this file IS the program. Until the fault
// proofs there was no importer, so the module-scope block below was harmless;
// the moment another script imports verifyPlane, an unguarded block would read
// that script's argv and try to open `curriculum/figures/<its first flag>.json`.
// An import is not an invocation.
const isEntry = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const args = isEntry ? process.argv.slice(2) : [];

// --inject rewrites the generated image line in a markdown file from its spec,
// so the base64 in the content is never hand-edited and can be regenerated
// after a spec change. The anchor is an HTML comment naming the spec:
//
//   <!-- figure: ar-2-5-region -->
//   ![alt text](data:image/svg+xml;base64,...)
//
// The comment is dropped by the render pipeline (there is no rehype-raw), so
// it is invisible to students and exists only for this script and for review.
if (args[0] === '--verify') {
  const dir = 'curriculum/figures';
  const files = (args[1] ? [args[1]] : readdirSync(dir).filter(f => f.endsWith('.json')).map(f => `${dir}/${f}`));
  let bad = 0, total = 0;
  for (const f of files) {
    const spec = JSON.parse(readFileSync(f, 'utf8'));
    const checks = verifyFigure(spec);
    if (!checks.length) { console.log(`-  ${basename(f)}: no geometric assertions for type ${spec.type}`); continue; }
    const fails = checks.filter(c => !c.ok);
    total += checks.length; bad += fails.length;
    console.log(`${fails.length ? 'FAIL' : ' ok '} ${basename(f)}  (${checks.length - fails.length}/${checks.length})`);
    for (const c of fails) console.log(`       ${c.name}: measured ${c.actual}, expected ${c.expected}`);
  }
  console.log(`\n${total} geometric assertion(s), ${bad} failed`);
  process.exit(bad ? 1 : 0);
} else if (args[0] === '--inject') {
  const target = args[1];
  let md = readFileSync(target, 'utf8');
  let count = 0;
  md = md.replace(/(<!--\s*figure:\s*([a-z0-9-]+)\s*-->\n)!\[[^\]]*\]\([^)]*\)/g, (_m, marker, name) => {
    const { uri, alt } = figureFromSpec(JSON.parse(readFileSync(`curriculum/figures/${name}.json`, 'utf8')));
    count++;
    return `${marker}![${alt}](${uri})`;
  });
  writeFileSync(target, md);
  console.log(`injected ${count} figure(s) into ${target}`);
} else if (args.length) {
  const dir = 'curriculum/figures';
  const files = args[0] === '--all'
    ? readdirSync(dir).filter(f => f.endsWith('.json')).map(f => `${dir}/${f}`)
    : [args[0]];

  for (const f of files) {
    const spec = JSON.parse(readFileSync(f, 'utf8'));
    const { svg, uri, alt } = figureFromSpec(spec);
    if (args.includes('--svg')) {
      console.log(svg);
    } else {
      console.log(`\n=== ${basename(f)} (${uri.length} chars) ===`);
      console.log(`![${alt}](${uri})`);
    }
  }
}
