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
//
// The JSON spec is the reviewable artifact. The base64 blob in the markdown is
// generated output; regenerate rather than hand-edit it.

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { basename } from 'path';

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

function buildSvg(spec) {
  const xRange = spec.xRange ?? [-1, 9];
  const yRange = spec.yRange ?? [-1, 9];
  const gy0 = ticks(yRange);
  const pad = padding(spec, gy0);
  const { X, Y } = makeScales(xRange, yRange, pad);
  const parts = [];

  parts.push(`<rect width="${W}" height="${H}" fill="${SURFACE}" rx="10"/>`);

  // Gridlines
  const gx = ticks(xRange), gy = gy0;
  parts.push(`<g stroke="${GRID}" stroke-width="1">`);
  for (const v of gx) parts.push(`<line x1="${X(v)}" y1="${Y(yRange[1])}" x2="${X(v)}" y2="${Y(yRange[0])}"/>`);
  for (const v of gy) parts.push(`<line x1="${X(xRange[0])}" y1="${Y(v)}" x2="${X(xRange[1])}" y2="${Y(v)}"/>`);
  parts.push(`</g>`);

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

  // Axes
  if (yRange[0] <= 0 && yRange[1] >= 0)
    parts.push(`<line x1="${X(xRange[0])}" y1="${Y(0)}" x2="${X(xRange[1])}" y2="${Y(0)}" stroke="${INK}" stroke-width="1.6"/>`);
  if (xRange[0] <= 0 && xRange[1] >= 0)
    parts.push(`<line x1="${X(0)}" y1="${Y(yRange[0])}" x2="${X(0)}" y2="${Y(yRange[1])}" stroke="${INK}" stroke-width="1.6"/>`);

  // Axis numbers, origin skipped to avoid the two labels colliding.
  parts.push(`<g font-family="ui-sans-serif,system-ui,sans-serif" font-size="10" fill="${INK}">`);
  for (const v of gx) if (v !== 0) parts.push(`<text x="${X(v)}" y="${Y(0) + 13}" text-anchor="middle">${v}</text>`);
  for (const v of gy) if (v !== 0) parts.push(`<text x="${X(0) - 6}" y="${Y(v) + 3.5}" text-anchor="end">${v}</text>`);
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

export function figureFromSpec(spec) {
  const svg = buildSvg(spec);
  return {
    svg,
    alt: spec.alt,
    uri: 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64'),
  };
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

// --inject rewrites the generated image line in a markdown file from its spec,
// so the base64 in the content is never hand-edited and can be regenerated
// after a spec change. The anchor is an HTML comment naming the spec:
//
//   <!-- figure: ar-2-5-region -->
//   ![alt text](data:image/svg+xml;base64,...)
//
// The comment is dropped by the render pipeline (there is no rehype-raw), so
// it is invisible to students and exists only for this script and for review.
if (args[0] === '--inject') {
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
