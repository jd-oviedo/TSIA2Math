// figure_shapes.mjs -- geometric figure builders for curriculum diagrams.
//
// Split out of make_figure.mjs, which owns the Cartesian plot used by Unit 2.
// Everything here is new for Unit 3's geometry topics.
//
// The governing rule, and the reason this exists rather than reusing
// app/components/FigureRenderer.tsx: **every vertex is computed from the item's
// stated dimensions.** FigureRenderer is schematic -- shapePoints() returns
// hardcoded vertices per shape name, and its right_triangle is a fixed 120x180
// triangle -- so a 3-4-5 and a 30-60-90 render identically with only the text
// swapped. That is fine for a CAT item bank and unacceptable here: a student
// trusts the picture, so a diagram whose proportions contradict its labels is a
// content defect, not a cosmetic one.
//
// What IS matched from FigureRenderer is its visual vocabulary:
//   * oblique (cabinet) projection for solids, front face true-shape
//   * ellipses for circular faces seen at an angle
//   * dashed strokes for hidden edges, internal axes and measurement lines
//   * a small square at a right angle, a filled dot at a centre of rotation
//   * dimension labels keyed by role (radius, height, slant_height, ...)
//
// Scaling is always UNIFORM. Fitting x and y independently would let a 3 by 8
// rectangle render square, which is exactly the failure this module exists to
// prevent; verifyShape() asserts it.

export const PALETTE = {
  INK: '#0E0E11',      // outlines, text
  LINE: '#6E9DC8',     // primary figure fill/stroke accent
  ACCENT: '#F0A33E',   // points of interest, second figure of a pair
  // White, matching make_figure.mjs. See the note there for why the figure
  // background cannot be themed per surface and had to change at the source.
  SURFACE: '#FFFFFF',  // background
  GRID: '#E2DCCA',     // gridlines
};
const { INK, LINE, ACCENT, SURFACE, GRID } = PALETTE;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = v => Math.round(v * 100) / 100;
const rad = d => (d * Math.PI) / 180;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ─── model space -> screen, uniformly ────────────────────────────────────────

// Model space has y growing upward, like a plane. Screen has y growing down, so
// the y map is negated. One scale for both axes, never two.
// `pad` is a number for equal margins, or {l, r, t, b} where one side needs
// more room than the others. The asymmetric form exists because a side label's
// width is a property of its TEXT, not of the shape: "short leg 6" is 117px and
// the equal 56px margin around a right triangle could never hold it, which is
// what drove that label inside the figure. Giving the side its own margin
// rescales the drawing and moves no vertices.
function fitter(pts, W, H, pad) {
  const q = typeof pad === 'number' ? { l: pad, r: pad, t: pad, b: pad } : pad;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 1e-9), spanY = Math.max(maxY - minY, 1e-9);
  const s = Math.min((W - q.l - q.r) / spanX, (H - q.t - q.b) / spanY);
  // Centred inside the box the margins leave, not inside the whole canvas.
  const ox = q.l + ((W - q.l - q.r) - s * spanX) / 2;
  const oy = q.t + ((H - q.t - q.b) - s * spanY) / 2;
  return {
    s,
    map: p => [n(ox + (p[0] - minX) * s), n(H - q.b - ((H - q.t - q.b) - s * spanY) / 2 - (p[1] - minY) * s)],
  };
}

/**
 * The polygon's horizontal span at a given screen y.
 *
 * Used to place a label that belongs INSIDE the shape, such as the dashed
 * height, on whichever side of the height line actually has room. Placing it
 * at a fixed offset put "h = ?" across the right edge of a narrow triangle,
 * because how much room exists there is a property of the shape at that
 * height, not a constant.
 */
function spanAtY(P, y) {
  const xs = [];
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i], [xj, yj] = P[j];
    if ((yi > y) !== (yj > y)) xs.push(xi + ((xj - xi) * (y - yi)) / (yj - yi));
  }
  xs.sort((a, b) => a - b);
  return xs.length >= 2 ? [xs[0], xs[xs.length - 1]] : null;
}

const poly = (pts, stroke = INK, sw = 2, fill = 'none', dash = '') =>
  `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

const seg = (a, b, stroke = INK, sw = 1.3, dash = '') =>
  `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

// `attrs` carries the data-* annotation a dimension label needs to be CHECKED:
// scripts/verify_figure_labels.mjs reads data-dim off the element to learn which
// segment the label claims to describe, and measures the rendered box against
// that segment's midpoint. Without it the checker would have to guess the
// pairing from proximity, which is the same guess the bug makes.
const txt = (p, s, anchor = 'middle', fill = INK, size = 13, attrs = '') =>
  s ? `<text ${attrs}x="${p[0]}" y="${p[1]}" text-anchor="${anchor}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="${size}" font-weight="600" fill="${fill}">${esc(s)}</text>` : '';

// A right-angle square at vertex v, opening toward the two neighbours.
function rightAngleMark(v, a, b, size = 11) {
  const u1 = [(a[0] - v[0]), (a[1] - v[1])], u2 = [(b[0] - v[0]), (b[1] - v[1])];
  const L1 = Math.hypot(...u1), L2 = Math.hypot(...u2);
  const p1 = [v[0] + (u1[0] / L1) * size, v[1] + (u1[1] / L1) * size];
  const p2 = [v[0] + (u2[0] / L2) * size, v[1] + (u2[1] / L2) * size];
  const p3 = [p1[0] + p2[0] - v[0], p1[1] + p2[1] - v[1]];
  return `<polyline points="${p1.join(',')} ${p3.join(',')} ${p2.join(',')}" fill="none" stroke="${INK}" stroke-width="1.4"/>`;
}

// Arc marking an interior angle at vertex v, with an optional label.
function angleArc(v, a, b, r, labelText) {
  const ang = p => Math.atan2(p[1] - v[1], p[0] - v[0]);
  let a1 = ang(a), a2 = ang(b);
  let delta = a2 - a1;
  while (delta <= -Math.PI) delta += 2 * Math.PI;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  const sweep = delta > 0 ? 1 : 0;
  const s1 = [n(v[0] + r * Math.cos(a1)), n(v[1] + r * Math.sin(a1))];
  const s2 = [n(v[0] + r * Math.cos(a2)), n(v[1] + r * Math.sin(a2))];
  const mid = a1 + delta / 2;
  const lp = [n(v[0] + (r + 14) * Math.cos(mid)), n(v[1] + (r + 14) * Math.sin(mid) + 4)];
  return `<path d="M${s1.join(',')} A${r},${r} 0 0 ${sweep} ${s2.join(',')}" fill="none" stroke="${INK}" stroke-width="1.3"/>`
    + txt(lp, labelText, 'middle', INK, 12, role('angle'));
}

// Label placed just outside the midpoint of edge p-q, pushed away from centre c.
// Ray casting. Used only to decide which side of an edge is outside the figure,
// so it has to be right for concave outlines as well as convex ones.
function pointInPoly(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) &&
        pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// The segment a dimension label describes, written onto the element so it can be
// measured rather than inferred. See txt() and scripts/verify_figure_labels.mjs.
const dimAttr = (p, q) => `data-dim="${p[0]},${p[1]},${q[0]},${q[1]}" `;

// WHAT A LABEL IS FOR, declared rather than inferred.
//
// The checker's two geometric rules apply to LENGTH labels and to nothing else,
// and until now the only marker in the output was data-dim, which the edge
// placer writes. That made a solid's "r = 3" indistinguishable from an angle's
// "30 degrees": both simply had no attribute. Rule B would then either exempt
// the radius label it is meant to catch, or push the angle label out of the
// vertex where it belongs.
//
//   length      names the size of something: an edge, a radius, a height
//   angle       names an angle, and correctly sits INSIDE at its vertex
//   identifier  names a thing rather than measuring it: ABC, "image", a caption
//   tick        an axis scale label, which sits on its axis by design
//
// A label carrying `internal` as well as `length` measures a construction line
// drawn INTO the figure, such as a dashed height. It is a length, and it is
// correctly inside the closed path, so Rule B skips it. That exemption is
// narrow on purpose: it is written at the one call site that draws such a line,
// never applied by position.
const role = (r) => `data-role="${r}" `;
const INTERNAL = 'data-internal="" ';

// ─── dimension labels ────────────────────────────────────────────────────────
//
// ONE PLACER, AND IT IS GEOMETRY ONLY.
//
// A label belongs to exactly one segment. It sits at that segment's MIDPOINT,
// offset along the true outward normal, on the exterior side -- and for a notch
// or a cutout the exterior side is inside the cutout, which falls out of the
// containment probe for free rather than needing a case.
//
// This replaces two algorithms and a set of per-item hand coordinates:
//
//   * edgeLabel(), which pushed the label away from the CENTROID. That is not
//     the edge's normal, so on a flat right triangle the base label slid
//     sideways onto the line, and on a concave outline a step edge level with
//     the centroid had no defined side at all.
//   * edgeLabelNormal(), which had the normal right but took `labelPos` and
//     `labelGaps` overrides per item. Those existed to break ties by sliding a
//     label ALONG its edge, and sliding is exactly what makes a label ambiguous:
//     gr-2-1-notched shipped two "5 ft" labels at t=0.1 and t=0.95, floating
//     diagonally in an empty corner, neither on the edge it described. A reader
//     could not pair them without the problem text.
//
// TIES ARE BROKEN PERPENDICULARLY, NEVER ALONG THE EDGE. Two short edges meeting
// at an inside corner crowd each other; the answer is to pull each label closer
// to its OWN edge (which separates them, because the edges are perpendicular),
// not to slide either one off its midpoint. When even the minimum offset cannot
// separate them, the label is pushed clear and given a leader line back to the
// midpoint, so the pairing stays explicit. Measured on the notch this unit
// exists for: 42 by 42 units of cutout holds both labels at gap 4 with room to
// spare, so the leader path is a genuine fallback rather than the normal case.

const LABEL_SIZE = 13;

// COLLISION IS JUDGED ON INK, NOT ON THE FONT BOX.
//
// A text element's layout box is the FONT's box: 1.164em tall for this stack,
// which for a label like "5 ft" is 62% taller than any pixel it actually paints.
// Two labels whose ink is comfortably apart can have overlapping font boxes, and
// treating that as a collision is not conservatism, it is a wrong answer: on
// gr-2-1-notched it forced a leader line into a cutout that holds both labels
// with room to spare, and the leader then crossed the other label.
//
// So the vertical extent is the ink extent, and the horizontal extent stays the
// advance width (which already over-estimates the ink, and by a side bearing
// rather than by 62%). CLEARANCE keeps two labels from merely touching.
const INK_ASCENT = 0.76;      // digits, caps and ascenders, rounded up
const INK_DESCENT = 0.06;     // overshoot on round glyphs
const INK_DESCENT_DEEP = 0.22; // strings carrying a real descender
const DESCENDERS = 'gjpqy';
const CLEARANCE = 2;

const inkAscent = (size) => INK_ASCENT * size;
const inkDescent = (text, size) =>
  ([...String(text)].some((c) => DESCENDERS.includes(c)) ? INK_DESCENT_DEEP : INK_DESCENT) * size;

// Advance width per character, in em, as a deliberate OVER-estimate.
//
// The generator cannot know the reader's font: `ui-sans-serif` resolves to
// Segoe UI, SF Pro, Roboto or a fallback depending on the machine, and the
// figure is a fixed-geometry SVG that cannot reflow. So every value here is
// rounded up from the widest of the faces measured, and the result is scaled by
// SAFETY on top. Over-estimating costs a little extra clearance; under-
// estimating ships a collision that the checker would catch only on the one
// machine it was measured on.
const CHAR_EM = { ' ': 0.32, '=': 0.90, '+': 0.90, '-': 0.45, '.': 0.30, ',': 0.30, '?': 0.58 };
const NARROW = 'ijlftr';     // 0.45 em
const WIDE = 'mw';           // 1.05 em
const SAFETY = 1.10;

/**
 * Advance width of a string in em, before any size or safety factor.
 *
 * Exported because figure_table.mjs needs the same answer. It used to carry a
 * single flat 6.2px-per-character constant, calibrated on regular-weight
 * strings while the header and row-label columns render at 600 and 700 -- so
 * "Wednesday" was budgeted 55.8px and painted 71.0, and the value column was
 * written over the label. One estimator, measured once.
 */
export function textWidthEm(text) {
  let em = 0;
  for (const ch of String(text)) {
    if (ch in CHAR_EM) em += CHAR_EM[ch];
    else if (ch >= '0' && ch <= '9') em += 0.72;
    else if (NARROW.includes(ch)) em += 0.45;
    else if (WIDE.includes(ch)) em += 1.05;
    else if (ch >= 'A' && ch <= 'Z') em += 0.78;
    else em += 0.68;
  }
  return em;
}

function textWidth(text, size = LABEL_SIZE) {
  return textWidthEm(text) * size * SAFETY;
}

// The outward unit normal at an edge's midpoint. Outward is decided by probing
// for containment, so it is correct on a concave outline where "away from the
// centroid" is undefined.
function edgeFrame(p, q, outline) {
  const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const dx = q[0] - p[0], dy = q[1] - p[1];
  const L = Math.hypot(dx, dy) || 1;
  let nx = -dy / L, ny = dx / L;
  if (pointInPoly([m[0] + nx * 3, m[1] + ny * 3], outline)) { nx = -nx; ny = -ny; }
  return { m, nrm: [nx, ny], len: L };
}

// Where a label lands for a given offset, as both its draw call and its ink box.
//
// `gap` is the distance from the SEGMENT to the label's near ink edge, in every
// direction, so one number means the same thing on all four sides. SVG text
// hangs from its baseline, so each case solves for the baseline that puts the
// ink edge where the gap says.
function labelAt(frame, text, gap, size = LABEL_SIZE) {
  const [nx, ny] = frame.nrm;
  const asc = inkAscent(size), desc = inkDescent(text, size);
  const hw = textWidth(text, size) / 2, hh = (asc + desc) / 2;

  // THE BOX CENTRE GOES ON THE NORMAL RAY, which is what makes "centred on the
  // segment" true for a diagonal edge and not just for an axis-aligned one.
  //
  // Anchoring the box by its near edge instead puts the centre half a box off
  // the ray, and on a slanted edge that offset has a component ALONG the edge:
  // measured on the 3-4-5 hypotenuse it slid the label 4 units off the midpoint,
  // which is small enough to look deliberate and wrong enough to fail the check.
  // `support` is how far the centre must sit beyond `gap` for an axis-aligned
  // box to clear the segment by exactly `gap` in the normal direction.
  const support = Math.abs(nx) * hw + Math.abs(ny) * hh;
  const cx = frame.m[0] + nx * (gap + support);
  const cy = frame.m[1] + ny * (gap + support);

  // A label to the left or right of an edge is anchored on its inner side so it
  // grows outward; anything else is centred. Either way the ink lands on the
  // same box, so this only decides which coordinate the browser is given.
  const sideways = Math.abs(nx) > Math.abs(ny);
  const anchor = sideways ? (nx > 0 ? 'start' : 'end') : 'middle';
  const x = anchor === 'middle' ? cx : (nx > 0 ? cx - hw : cx + hw);
  const y = cy + asc - hh;
  return { x, y, anchor, gap, box: { x0: cx - hw, y0: cy - hh, x1: cx + hw, y1: cy + hh } };
}

// Overlap area with CLEARANCE built in, so boxes that merely touch still cost.
const boxOverlap = (a, b) => {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) + CLEARANCE;
  const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) + CLEARANCE;
  return w > 0 && h > 0 ? w * h : 0;
};

// Liang-Barsky: does the segment cut the box, as opposed to merely ending in it.
//
// WRITTEN IN THE TEXTBOOK (p, q) FORM ON PURPOSE. The previous version passed
// its arguments the other way round and then kept the textbook's branches, so
// the p < 0 and p > 0 cases were inverted: it computed the right parameter and
// clamped it against the wrong end of the interval. A vertical edge passing
// straight through a label's box came back as a miss.
//
// That was wrong in two places at once, here and in verify_figure_labels.mjs,
// because both were written from the same template. Rule A caught what they
// missed only because it samples points along the path rather than sharing this
// helper, which is the argument for the two checks not sharing an implementation.
//
// For each boundary, p is the rate of approach and q the distance to it:
// p === 0 means parallel, and then q < 0 means wholly outside.
function segHitsBox(p, q, b) {
  const dx = q[0] - p[0], dy = q[1] - p[1];
  let t0 = 0, t1 = 1;
  const tests = [[-dx, p[0] - b.x0], [dx, b.x1 - p[0]], [-dy, p[1] - b.y0], [dy, b.y1 - p[1]]];
  for (const [pp, qq] of tests) {
    if (pp === 0) { if (qq < 0) return false; continue; }
    const r = qq / pp;
    if (pp < 0) { if (r > t1) return false; if (r > t0) t0 = r; }
    else { if (r < t0) return false; if (r < t1) t1 = r; }
  }
  return t0 < t1;
}

// Offsets tried, nearest first past the preferred one. Everything at or below
// LEADER_FROM is a plain label; beyond it the label is detached and gets a line
// back to its midpoint, which the cost function makes expensive enough to be a
// last resort rather than a shortcut.
const GAP_PREFERRED = 9;
const GAP_STEPS = [3, 4, 5, 6, 7, 8, 9, 11, 13, 18, 24, 32, 42];
const LEADER_FROM = 13;

// THERE IS NO INTERIOR OPTION, and that is a deliberate removal.
//
// This placer used to be able to put a length label INSIDE the shape, priced at
// 50, as an escape when the exterior margin could not hold the words. It fired
// on exactly two labels, "short leg 6" and "opposite 3", and both read as an
// interior quantity rather than an edge length: a number floating inside a
// triangle looks like an area.
//
// The margin is now sized from the label's own text instead (see the per-side
// pad in fitter and its use in buildRightTriangle), so the exterior always
// exists, and rule 6 in verify_figure_labels.mjs forbids the interior outright.
// The branch is gone rather than left dormant, because a fallback that the
// checker rejects is not a fallback, it is two rules disagreeing and waiting
// for a figure that triggers one of them. Genuinely impossible exterior space
// is what the leader line above is for.

// The boxes of an already-emitted label run, so a second run over a different
// outline can treat them as obstacles. Reads back what was written rather than
// threading the boxes out of placeEdgeLabels: the emitted attributes are the
// thing that has to be right, and parsing them keeps the two in step.
function boxesOf(svgFragment) {
  const out = [];
  const re = /<text ([^>]*)>([^<]*)<\/text>/g;
  for (const m of svgFragment.matchAll(re)) {
    const attrs = m[1], text = m[2];
    const get = (k) => (attrs.match(new RegExp(`${k}="([^"]*)"`)) || [])[1];
    const x = parseFloat(get('x')), y = parseFloat(get('y'));
    const size = parseFloat(get('font-size') || LABEL_SIZE);
    const anchor = get('text-anchor') || 'start';
    const w = textWidth(text, size);
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    out.push({ x0, y0: y - inkAscent(size), x1: x0 + w, y1: y + inkDescent(text, size) });
  }
  return out;
}

/**
 * Place every dimension label on a figure at once.
 *
 * entries   [{ p, q, text }]  edge endpoints in screen space, and the label
 * outline   the closed screen polygon, for the outward probe and for assertion 3
 * fixed     boxes the placer must avoid but cannot move (height and angle labels)
 * bounds    { W, H } so nothing is placed off the canvas
 *
 * Returns the SVG for the labels and any leader lines.
 */
function placeEdgeLabels(entries, outline, fixed = [], bounds = null, extraEdges = []) {
  const live = entries.filter((e) => e.text !== undefined && e.text !== null && String(e.text) !== '');
  if (!live.length) return '';

  const frames = live.map((e) => edgeFrame(e.p, e.q, outline));
  // The figure's own edges, plus any neighbouring outline the caller knows
  // about. On a side-by-side pair the two shapes share a gutter, and a label
  // placed against only its own outline lands on the other one's.
  const edges = outline.map((pt, i) => [pt, outline[(i + 1) % outline.length]]).concat(extraEdges);

  // What one placement costs on its own: distance from the preferred offset,
  // plus a real penalty for needing a leader line at all.
  const soloCost = (cand) =>
    Math.abs(cand.gap - GAP_PREFERRED) + (cand.gap > LEADER_FROM ? 40 : 0);

  // The leader line a detached label draws, so it can be tested for collisions
  // like any other mark. A leader that strikes through a neighbouring label is
  // worse than the ambiguity it was drawn to fix.
  const leaderOf = (i, cand) => {
    if (cand.gap <= LEADER_FROM) return null;
    const m = frames[i].m;
    const [nx, ny] = frames[i].nrm;
    return [[m[0] + nx * 2, m[1] + ny * 2], [m[0] + nx * (cand.gap - 2), m[1] + ny * (cand.gap - 2)]];
  };

  // Total cost of a whole assignment. Pairwise terms are counted ONCE here,
  // which is the difference that matters: scoring a single label against frozen
  // neighbours is what let the search settle for a leader line on
  // gr-2-1-notched. The vertical label was optimised first, saw the horizontal
  // one still sitting at its default offset, concluded that no perpendicular
  // offset could clear it, and bought its way out with a leader -- after which
  // the horizontal label was free to return to its default and the pair looked
  // "solved". Both labels had to move together, and neither move was an
  // improvement on its own.
  const totalCost = (asg) => {
    let cost = 0;
    for (let i = 0; i < asg.length; i++) {
      cost += soloCost(asg[i]);
      for (const f of fixed) cost += 1000 * boxOverlap(asg[i].box, f);
      // Grown by CLEARANCE, because segHitsBox answers "does this segment CUT
      // the box", and a segment grazing the box edge is a miss by that test and
      // a hit by the checker's. The two now ask the same question.
      const grown = {
        x0: asg[i].box.x0 - CLEARANCE, y0: asg[i].box.y0 - CLEARANCE,
        x1: asg[i].box.x1 + CLEARANCE, y1: asg[i].box.y1 + CLEARANCE,
      };
      for (const [a, b] of edges) if (segHitsBox(a, b, grown)) { cost += 4000; break; }
      if (bounds) {
        const out = Math.max(0, 2 - asg[i].box.x0) + Math.max(0, asg[i].box.x1 - (bounds.W - 2))
          + Math.max(0, 2 - asg[i].box.y0) + Math.max(0, asg[i].box.y1 - (bounds.H - 2));
        cost += 600 * out;
      }
      const lead = leaderOf(i, asg[i]);
      if (lead) {
        for (let j = 0; j < asg.length; j++) {
          if (j !== i && segHitsBox(lead[0], lead[1], asg[j].box)) cost += 4000;
        }
        for (const f of fixed) if (segHitsBox(lead[0], lead[1], f)) cost += 4000;
      }
      for (let j = i + 1; j < asg.length; j++) cost += 1000 * boxOverlap(asg[i].box, asg[j].box);
    }
    return cost;
  };

  // Coordinate descent on the TOTAL, from three deterministic starts. Multiple
  // starts because the cost surface has local minima that a single sweep cannot
  // leave: "everything tight" and "everything loose" fall into different ones,
  // and the tight start is the one that finds the two-labels-in-a-notch answer.
  // No randomness anywhere, so a spec always regenerates to the same bytes.
  let best = null, bestCost = Infinity;
  for (const start of [GAP_PREFERRED, GAP_STEPS[0], 6]) {
    const asg = live.map((e, i) => labelAt(frames[i], e.text, start));
    for (let round = 0; round < 8; round++) {
      let moved = false;
      for (let i = 0; i < live.length; i++) {
        const keep = asg[i];
        let pick = keep, pickCost = totalCost(asg);
        for (const gap of GAP_STEPS) {
          asg[i] = labelAt(frames[i], live[i].text, gap);
          const c = totalCost(asg);
          if (c < pickCost - 1e-9) { pick = asg[i]; pickCost = c; }
        }
        asg[i] = pick;
        if (pick !== keep) moved = true;
      }
      if (!moved) break;
    }
    const c = totalCost(asg);
    if (c < bestCost - 1e-9) { bestCost = c; best = asg; }
  }
  const placed = best;

  let out = '';
  placed.forEach((pl, i) => {
    const leader = pl.gap > LEADER_FROM;
    if (leader) {
      // From the segment's midpoint to the label's near edge, so the pairing is
      // stated rather than implied by proximity.
      const [nx, ny] = frames[i].nrm;
      const m = frames[i].m;
      out += seg([n(m[0] + nx * 2), n(m[1] + ny * 2)],
        [n(m[0] + nx * (pl.gap - 2)), n(m[1] + ny * (pl.gap - 2))], INK, 1);
    }
    out += txt([n(pl.x), n(pl.y)], live[i].text, pl.anchor, INK, LABEL_SIZE,
      role('length') + dimAttr(live[i].p, live[i].q)
      + (leader ? 'data-leader="" ' : ''));
  });
  return out;
}

// ─── model builders: dimensions in, model-space vertices out ─────────────────

// Returns vertices counter-clockwise in model space (y up).
function polygonModel(spec) {
  const d = spec.dims || {};
  switch (spec.shape) {
    case 'rectangle': return [[0, 0], [d.w, 0], [d.w, d.h], [0, d.h]];
    case 'square': return [[0, 0], [d.s, 0], [d.s, d.s], [0, d.s]];
    case 'triangle': {
      // Apex x defaults to the midpoint (isosceles) unless the spec places it.
      const ax = d.apexX ?? d.b / 2;
      return [[0, 0], [d.b, 0], [ax, d.h]];
    }
    case 'parallelogram': {
      const off = d.offset ?? d.h * 0.45;
      return [[0, 0], [d.b, 0], [d.b + off, d.h], [off, d.h]];
    }
    case 'trapezoid': {
      // Bottom base b1, top base b2 centred over it.
      const l = (d.b1 - d.b2) / 2;
      return [[0, 0], [d.b1, 0], [l + d.b2, d.h], [l, d.h]];
    }
    // An explicit vertex list, for boundaries the named shapes cannot express:
    // L-shapes, notched rectangles, any rectilinear outline. The points ARE the
    // dimensions, so the drawing is faithful by construction, and the polygon
    // verifier below measures them like any other shape without special-casing.
    // Closure is asserted rather than assumed: a boundary whose sides do not
    // return to the start is a spec bug, and silently closing it would draw a
    // figure whose side lengths are not the ones the item states.
    case 'path': {
      const pts = spec.points;
      if (!Array.isArray(pts) || pts.length < 3)
        throw new Error('polygon path: needs a points array of at least 3 vertices');
      if (pts.some(p => !Array.isArray(p) || p.length !== 2 || p.some(v => !Number.isFinite(v))))
        throw new Error('polygon path: every point must be a finite [x, y] pair');
      const [fx, fy] = pts[0], [lx, ly] = pts[pts.length - 1];
      if (Math.hypot(lx - fx, ly - fy) < 1e-9)
        throw new Error('polygon path: do not repeat the first vertex, the outline closes itself');
      return pts.map(([x, y]) => [x, y]);
    }
    case 'regular': {
      const { sides, r } = { r: 1, ...d };
      const out = [];
      for (let i = 0; i < sides; i++) {
        const a = rad(90) + (2 * Math.PI * i) / sides;
        out.push([r * Math.cos(a), r * Math.sin(a)]);
      }
      return out;
    }
    default: throw new Error(`polygon: unknown shape ${spec.shape}`);
  }
}

// Right triangle with the right angle at the origin, one leg along +x.
// Accepts legs directly, or a special-triangle family plus one side.
function rightTriangleModel(spec) {
  let a, b; // a along x (adjacent to the marked angle), b along y
  if (spec.legs) { [a, b] = spec.legs; }
  else if (spec.special === '45-45-90') { a = spec.leg; b = spec.leg; }
  else if (spec.special === '30-60-90') {
    // Short leg opposite 30, long leg opposite 60 = short * sqrt(3).
    const s = spec.shortLeg;
    a = s * Math.sqrt(3); // long leg on the base
    b = s;                // short leg vertical
  } else if (spec.angleDeg && spec.adjacent) {
    a = spec.adjacent; b = spec.adjacent * Math.tan(rad(spec.angleDeg));
  } else throw new Error('right_triangle: need legs, special+size, or angleDeg+adjacent');
  return [[0, 0], [a, 0], [0, b]];
}

// ─── builders ────────────────────────────────────────────────────────────────

const frame = (w, h, alt, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(alt)}">`
  + `<rect width="${w}" height="${h}" fill="${SURFACE}" rx="10"/>${body}</svg>`;

function buildPolygon(spec) {
  const W = spec.width ?? 330, H = spec.height ?? 230;
  const m = polygonModel(spec);
  const f = fitter(m, W, H, 56);
  const P = m.map(f.map);
  let out = poly(P, INK, 2, LINE + '22');

  // Right-angle marks at the named vertex indices.
  for (const i of spec.rightAngles ?? [])
    out += rightAngleMark(P[i], P[(i + 1) % P.length], P[(i - 1 + P.length) % P.length]);

  // The height label is placed by the height LINE, not by an edge, so it is an
  // obstacle to the edge placer rather than one of its entries.
  const fixed = [];

  // A perpendicular height, drawn dashed from the apex/top edge down to the base.
  if (spec.showHeight) {
    const topIdx = spec.heightFrom ?? (spec.shape === 'triangle' ? 2 : 3);
    const apex = m[topIdx];
    const foot = [apex[0], 0];
    const A = f.map(apex), B = f.map(foot);
    out += seg(A, B, INK, 1.3, '4 3');
    out += rightAngleMark(B, A, f.map([m[1][0], 0]), 9);
    if (spec.labels?.height) {
      // Beside the height line, on whichever side the shape is wide enough to
      // hold the words. A fixed +10 to the right laid "h = ?" across the right
      // edge of a narrow triangle, because the room available there depends on
      // the shape at that height.
      // WHERE ON THE HEIGHT LINE, not just which side of it. At the midpoint of
      // a narrow triangle neither side holds the words: for gr-2-4 the label is
      // 36.8px and each side offers 39.4px before the sloping edge, so the old
      // fixed offset laid "h = ?" across that edge. The shape widens toward the
      // base, so the label slides down the height line until it fits.
      const w = textWidth(spec.labels.height);
      const need = w + 8 + CLEARANCE;
      let my = (A[1] + B[1]) / 2, useRight = true, best = -Infinity;
      for (let k = 0; k <= 8; k++) {
        const y = A[1] + (B[1] - A[1]) * (0.5 + k * 0.05);
        // The NARROWEST span across the label's own height. A sloping edge
        // leaves more room at the baseline than at the box's top, and measuring
        // only the baseline put the box's top corner across that edge.
        const half = inkAscent(LABEL_SIZE);
        const spans = [spanAtY(P, y - half), spanAtY(P, y), spanAtY(P, y + 2)].filter(Boolean);
        if (!spans.length) continue;
        const right = Math.min(...spans.map((sp) => sp[1])) - A[0];
        const left = A[0] - Math.max(...spans.map((sp) => sp[0]));
        const room = Math.max(right, left);
        if (room > best) { best = room; my = y; useRight = right >= left; }
        if (room >= need) { my = y; useRight = right >= left; break; }
      }
      const hp = useRight ? [n(A[0] + 8), n(my)] : [n(A[0] - 8), n(my)];
      out += txt(hp, spec.labels.height, useRight ? 'start' : 'end', INK, LABEL_SIZE,
        role('length') + INTERNAL);
      fixed.push({
        x0: useRight ? hp[0] : hp[0] - w, y0: hp[1] - inkAscent(LABEL_SIZE),
        x1: useRight ? hp[0] + w : hp[0], y1: hp[1] + inkDescent(spec.labels.height, LABEL_SIZE),
      });
    }
  }

  // Numeric keys are edge indices; named keys (height) are handled above.
  const entries = Object.entries(spec.labels ?? {})
    .filter(([k]) => Number.isInteger(Number(k)))
    .map(([k, text]) => {
      const i = Number(k);
      return { p: P[i], q: P[(i + 1) % P.length], text };
    });
  out += placeEdgeLabels(entries, P, fixed, { W, H });
  return frame(W, H, spec.alt, out);
}

function buildCircle(spec) {
  const W = spec.width ?? 300, H = spec.height ?? 250;
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 46;
  let out = `<circle cx="${cx}" cy="${cy}" r="${n(R)}" fill="${LINE}22" stroke="${INK}" stroke-width="2"/>`;
  out += `<circle cx="${cx}" cy="${cy}" r="3" fill="${INK}"/>`;
  if (spec.show === 'diameter') {
    out += seg([cx - R, cy], [cx + R, cy], INK, 1.6);
    out += txt([cx, cy - 8], spec.label, 'middle', INK, 13, role('length') + INTERNAL);
  } else {
    out += seg([cx, cy], [cx + R, cy], INK, 1.6);
    out += txt([n(cx + R / 2), cy - 8], spec.label, 'middle', INK, 13, role('length') + INTERNAL);
  }
  if (spec.sector) {
    const a1 = rad(spec.sector.startDeg), a2 = rad(spec.sector.endDeg);
    const p1 = [n(cx + R * Math.cos(-a1)), n(cy + R * Math.sin(-a1))];
    const p2 = [n(cx + R * Math.cos(-a2)), n(cy + R * Math.sin(-a2))];
    const large = Math.abs(spec.sector.endDeg - spec.sector.startDeg) > 180 ? 1 : 0;
    out += `<path d="M${cx},${cy} L${p1.join(',')} A${n(R)},${n(R)} 0 ${large} 0 ${p2.join(',')} Z" fill="${ACCENT}55" stroke="${ACCENT}" stroke-width="2"/>`;
    const mid = rad((spec.sector.startDeg + spec.sector.endDeg) / 2);
    out += txt([n(cx + R * 0.55 * Math.cos(-mid)), n(cy + R * 0.55 * Math.sin(-mid) + 4)],
      spec.sector.label, 'middle', INK, 13, role('identifier'));
  }
  return frame(W, H, spec.alt, out);
}

function buildRightTriangle(spec) {
  const W = spec.width ?? 330, H = spec.height ?? 240;
  const m = rightTriangleModel(spec);
  // The vertical leg sits on the left, so its label needs the left margin, and
  // how much depends on the words. 56 is the floor, kept so short labels render
  // exactly as before.
  const leftPad = Math.max(56, textWidth(spec.labels?.height ?? '') + GAP_PREFERRED + 8);
  const f = fitter(m, W, H, { l: leftPad, r: 56, t: 56, b: 56 });
  const [A, B, C] = m.map(f.map); // A = right angle, B = along base, C = up
  let out = poly([A, B, C], INK, 2, LINE + '22');
  out += rightAngleMark(A, B, C);
  const L = spec.labels ?? {};
  const tri = [A, B, C];
  // The angle arcs carry their own labels at a fixed radius from the vertex, so
  // they go down before the side labels and are handed to the placer as
  // obstacles. Drawn first for the same reason: the placer needs their boxes.
  const fixed = [];
  const arc = (v, a, b, text) => {
    out += angleArc(v, a, b, 26, text);
    // angleArc puts its label 14 beyond the arc, on the bisector, baseline +4.
    const ang = (p) => Math.atan2(p[1] - v[1], p[0] - v[0]);
    let d = ang(b) - ang(a);
    while (d <= -Math.PI) d += 2 * Math.PI;
    while (d > Math.PI) d -= 2 * Math.PI;
    const mid = ang(a) + d / 2;
    const lx = v[0] + 40 * Math.cos(mid), ly = v[1] + 40 * Math.sin(mid) + 4;
    const w = textWidth(text, 12);
    fixed.push({ x0: lx - w / 2, y0: ly - inkAscent(12), x1: lx + w / 2, y1: ly + inkDescent(text, 12) });
  };
  if (L.angleAtBase) arc(B, A, C, L.angleAtBase);
  if (L.angleAtTop) arc(C, B, A, L.angleAtTop);

  const entries = [];
  if (L.base) entries.push({ p: A, q: B, text: L.base });
  if (L.height) entries.push({ p: A, q: C, text: L.height });
  if (L.hypotenuse) entries.push({ p: B, q: C, text: L.hypotenuse });
  out += placeEdgeLabels(entries, tri, fixed, { W, H });
  return frame(W, H, spec.alt, out);
}

// Oblique (cabinet) projection: depth runs at 45 degrees, foreshortened by half,
// matching FigureRenderer's solid_3d convention.
const OBL = { dx: Math.cos(rad(45)) * 0.5, dy: -Math.sin(rad(45)) * 0.5 };

function buildSolid3d(spec) {
  const W = spec.width ?? 320, H = spec.height ?? 250;
  const d = spec.dims || {}, L = spec.labels || {};
  const CX = W / 2, base = H - 56, top = 58;
  let out = '';

  if (spec.shape === 'cylinder' || spec.shape === 'cone') {
    // Scale so the taller of (height, 2r) fills the available box.
    const avail = base - top, availW = W - 130;
    const s = Math.min(avail / d.h, availW / (2 * d.r));
    const rx = n(d.r * s), ry = n(rx * 0.3), hh = n(d.h * s);
    const cy = base, ty = n(base - hh);
    if (spec.shape === 'cylinder') {
      out += `<ellipse cx="${CX}" cy="${ty}" rx="${rx}" ry="${ry}" fill="${LINE}22" stroke="${INK}" stroke-width="2"/>`;
      out += `<path d="M${n(CX - rx)},${ty} V${cy} A${rx},${ry} 0 0 0 ${n(CX + rx)},${cy} V${ty}" fill="${LINE}22" stroke="${INK}" stroke-width="2"/>`;
      out += seg([CX, ty], [n(CX + rx), ty], INK, 1.3, '4 3');
      // Above the top ellipse's own arc, not across it. At half the radius the
      // arc rises 0.87 of ry, so the clearance is derived from the ellipse
      // rather than from a constant that happened to look right at one size.
      out += txt([n(CX + rx / 2), n(ty - 0.87 * ry - CLEARANCE - 2 - 4)], L.radius,
        'middle', INK, 13, role('length') + INTERNAL);
    } else {
      out += `<ellipse cx="${CX}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${LINE}22" stroke="${INK}" stroke-width="2"/>`;
      out += `<path d="M${n(CX - rx)},${cy} L${CX},${ty} L${n(CX + rx)},${cy}" fill="${LINE}22" stroke="${INK}" stroke-width="2"/>`;
      out += seg([CX, cy], [n(CX + rx), cy], INK, 1.3, '4 3');
      // BELOW the base ellipse. Above it is the cone's own body: the label was
      // overlapping both the base arc and the sloping face at once.
      // The 2 here is the ellipse's stroke half-width: getPointAtLength samples
      // the geometric path, and the painted arc is a stroke either side of it.
      out += txt([n(CX + rx / 2), n(cy + 0.87 * ry + CLEARANCE + 2 + inkAscent(13))], L.radius,
        'middle', INK, 13, role('length') + INTERNAL);
      if (L.slant_height) out += txt([n(CX - rx / 2 - 12), n((ty + cy) / 2)], L.slant_height, 'end', INK, 13, role('length'));
    }
    // Height dimensioned on its own line, clear of the body, so it is unambiguous.
    const hx = n(CX + rx + 26);
    out += seg([hx, ty], [hx, cy], INK, 1.2);
    out += seg([n(hx - 4), ty], [n(hx + 4), ty], INK, 1.2);
    out += seg([n(hx - 4), cy], [n(hx + 4), cy], INK, 1.2);
    out += txt([n(hx + 7), n((ty + cy) / 2)], L.height, 'start', INK, 13, role('length'));
  } else if (spec.shape === 'sphere') {
    const R = Math.min((base - top) / 2, (W - 150) / 2);
    const cy = (top + base) / 2;
    out += `<circle cx="${CX}" cy="${n(cy)}" r="${n(R)}" fill="${LINE}22" stroke="${INK}" stroke-width="2"/>`;
    out += `<ellipse cx="${CX}" cy="${n(cy)}" rx="${n(R)}" ry="${n(R * 0.3)}" fill="none" stroke="${INK}" stroke-width="1.1" stroke-dasharray="4 3"/>`;
    out += seg([CX, n(cy)], [n(CX + R), n(cy)], INK, 1.5);
    out += `<circle cx="${CX}" cy="${n(cy)}" r="3" fill="${INK}"/>`;
    // Clear of the dashed equator, whose arc at half the radius is 0.87 of its
    // own ry above centre.
    out += txt([n(CX + R / 2), n(cy - 0.87 * (R * 0.3) - CLEARANCE - 2 - 4)], L.radius,
      'middle', INK, 13, role('length') + INTERNAL);
  } else if (spec.shape === 'square_pyramid') {
    const avail = base - top, availW = W - 140;
    const s = Math.min(avail / d.h, availW / (d.b * (1 + OBL.dx)));
    const bw = d.b * s, dep = bw * OBL.dx, hh = d.h * s;
    const fl = [n(CX - bw / 2 - dep / 2), base], fr = [n(fl[0] + bw), base];
    const bl = [n(fl[0] + dep), n(base - dep)], br = [n(bl[0] + bw), n(base - dep)];
    const apex = [n((fl[0] + br[0]) / 2), n(base - dep / 2 - hh)];
    out += poly([fl, fr, br, bl], INK, 1.4, 'none', '4 3');
    out += `<path d="M${fl.join(',')} L${apex.join(',')} L${fr.join(',')} Z" fill="${LINE}22" stroke="${INK}" stroke-width="2"/>`;
    out += seg(apex, br, INK, 2);
    const cen = [n((fl[0] + br[0]) / 2), n(base - dep / 2)];
    out += seg(apex, cen, INK, 1.2, '4 3');
    out += txt([n(apex[0] + 16), n((apex[1] + cen[1]) / 2)], L.height, 'start', INK, 13,
      role('length') + INTERNAL);
    out += txt([n((fl[0] + fr[0]) / 2), n(base + 20)], L.base_edge, 'middle', INK, 13, role('length'));
    if (L.slant_height) out += txt([n((apex[0] + fl[0]) / 2 - 12), n((apex[1] + base) / 2)], L.slant_height, 'end', INK, 13, role('length'));
  } else {
    // rectangular_prism
    const avail = base - top, availW = W - 120;
    const s = Math.min(avail / (d.h + d.d * 0.35), availW / (d.l + d.d * 0.35));
    const lw = d.l * s, hh = d.h * s, dep = d.d * s * 0.5;
    const x0 = n(CX - (lw + dep) / 2), y0 = n(base);
    const A = [x0, y0], B = [n(x0 + lw), y0], C = [n(x0 + lw), n(y0 - hh)], D = [x0, n(y0 - hh)];
    const A2 = [n(A[0] + dep), n(A[1] - dep)], B2 = [n(B[0] + dep), n(B[1] - dep)];
    const C2 = [n(C[0] + dep), n(C[1] - dep)], D2 = [n(D[0] + dep), n(D[1] - dep)];
    out += poly([A, B, C, D], INK, 2, LINE + '22');
    out += poly([D, C, C2, D2], INK, 2, LINE + '18');
    out += poly([C, B, B2, C2], INK, 2, LINE + '10');
    out += seg(A, A2, INK, 1, '3 3') + seg(A2, B2, INK, 1, '3 3') + seg(A2, D2, INK, 1, '3 3');
    out += txt([n((A[0] + B[0]) / 2), n(y0 + 20)], L.length, 'middle', INK, 13, role('length'));
    out += txt([n(B2[0] + 10), n((C[1] + B[1]) / 2)], L.height, 'start', INK, 13, role('length'));
    // The depth was labelled on C-C2, which is the shared edge between two
    // VISIBLE faces, so the label sat inside the solid and on a drawn line at
    // once. D-D2 is a silhouette depth edge of the same length, and the label
    // goes outside it along the outward diagonal.
    const dm = [(D[0] + D2[0]) / 2, (D[1] + D2[1]) / 2];
    out += txt([n(dm[0] - 8), n(dm[1] - 8)], L.depth, 'end', INK, 13, role('length'));
  }
  return frame(W, H, spec.alt, out);
}

// Applies the transformation numerically, so the drawn image IS the image.
export function applyTransform(pts, t) {
  switch (t.kind) {
    case 'translation': return pts.map(([x, y]) => [x + t.dx, y + t.dy]);
    case 'reflection': return pts.map(([x, y]) =>
      t.axis === 'x' ? [x, -y] : t.axis === 'y' ? [-x, y] : [y, x]); // y=x
    case 'rotation': {
      const [cx, cy] = t.center ?? [0, 0], a = rad(t.deg);
      return pts.map(([x, y]) => [
        cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a),
        cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a),
      ]);
    }
    case 'dilation': {
      const [cx, cy] = t.center ?? [0, 0];
      return pts.map(([x, y]) => [cx + (x - cx) * t.k, cy + (y - cy) * t.k]);
    }
    default: throw new Error(`unknown transform ${t.kind}`);
  }
}

function gridPlane(spec, W, H, extraPts = []) {
  const xr = spec.xRange, yr = spec.yRange;
  const padL = 30, padR = 18, padT = 16, padB = 24;
  // One scale for both axes: a circle must stay a circle.
  const s = Math.min((W - padL - padR) / (xr[1] - xr[0]), (H - padT - padB) / (yr[1] - yr[0]));
  const ox = padL + ((W - padL - padR) - s * (xr[1] - xr[0])) / 2;
  const oy = padT + ((H - padT - padB) - s * (yr[1] - yr[0])) / 2;
  const X = x => n(ox + (x - xr[0]) * s);
  // `+ padT` at the end, not `+ padT - padT`, which cancelled and drew the whole
  // plot padT above its own box: the bottom axis landed at H - padB - padT and
  // the top gridline at y = 0, so the topmost y tick label was half outside the
  // viewBox. Visible on all five gr-4-1-* transformation figures, where the top
  // label read as a sliver. Found by assertion 4 in verify_figure_labels.mjs.
  const Y = y => n(H - padB - oy - (y - yr[0]) * s + padT);
  let out = `<g stroke="${GRID}" stroke-width="1">`;
  for (let v = Math.ceil(xr[0]); v <= xr[1]; v++) out += seg([X(v), Y(yr[0])], [X(v), Y(yr[1])], GRID, 1);
  for (let v = Math.ceil(yr[0]); v <= yr[1]; v++) out += seg([X(xr[0]), Y(v)], [X(xr[1]), Y(v)], GRID, 1);
  out += `</g>`;
  if (yr[0] <= 0 && yr[1] >= 0) out += seg([X(xr[0]), Y(0)], [X(xr[1]), Y(0)], INK, 1.6);
  if (xr[0] <= 0 && xr[1] >= 0) out += seg([X(0), Y(yr[0])], [X(0), Y(yr[1])], INK, 1.6);
  const step = (xr[1] - xr[0]) > 12 ? 2 : 1;
  out += `<g font-family="ui-sans-serif,system-ui,sans-serif" font-size="9" fill="${INK}">`;
  for (let v = Math.ceil(xr[0]); v <= xr[1]; v += step) if (v !== 0)
    out += `<text data-role="tick" x="${X(v)}" y="${Y(0) + 11}" text-anchor="middle">${v}</text>`;
  for (let v = Math.ceil(yr[0]); v <= yr[1]; v += step) if (v !== 0)
    out += `<text data-role="tick" x="${X(0) - 5}" y="${Y(v) + 3}" text-anchor="end">${v}</text>`;
  out += `</g>`;
  return { out, X, Y, s };
}

function buildTransformPair(spec) {
  const W = spec.width ?? 340, H = spec.height ?? 270;
  const pre = spec.preimage;
  const img = applyTransform(pre, spec.transform);
  const g = gridPlane(spec, W, H);
  let out = g.out;
  const toS = pts => pts.map(([x, y]) => [g.X(x), g.Y(y)]);
  out += poly(toS(pre), LINE, 2.2, LINE + '30');
  out += poly(toS(img), ACCENT, 2.2, ACCENT + '30');
  if (spec.transform.kind === 'reflection') {
    const a = spec.transform.axis;
    const [xr, yr] = [spec.xRange, spec.yRange];
    const L = a === 'x' ? [[xr[0], 0], [xr[1], 0]] : a === 'y' ? [[0, yr[0]], [0, yr[1]]]
      : [[Math.max(xr[0], yr[0]), Math.max(xr[0], yr[0])], [Math.min(xr[1], yr[1]), Math.min(xr[1], yr[1])]];
    out += seg([g.X(L[0][0]), g.Y(L[0][1])], [g.X(L[1][0]), g.Y(L[1][1])], INK, 1.4, '5 4');
  }
  if (spec.transform.center) {
    const [cx, cy] = spec.transform.center;
    out += `<circle cx="${g.X(cx)}" cy="${g.Y(cy)}" r="3.5" fill="${INK}"/>`;
  }
  if (spec.labels?.preimage) out += txt([g.X(spec.labels.preimageAt[0]), g.Y(spec.labels.preimageAt[1])], spec.labels.preimage, 'middle', LINE, 12, role('identifier'));
  if (spec.labels?.image) out += txt([g.X(spec.labels.imageAt[0]), g.Y(spec.labels.imageAt[1])], spec.labels.image, 'middle', ACCENT, 12, role('identifier'));
  return frame(W, H, spec.alt, out);
}

function buildSimilarPair(spec) {
  const W = spec.width ?? 350, H = spec.height ?? 220;
  const small = polygonModel(spec);
  const big = small.map(([x, y]) => [x * spec.k, y * spec.k]);
  // Both fitted with ONE scale, so the size difference is the scale factor.
  const all = [...small, ...big.map(([x, y]) => [x + 0, y])];
  const f = fitter([[0, 0], [Math.max(...all.map(p => p[0])) * 2.35, Math.max(...all.map(p => p[1]))]], W, H, 34);
  const place = (pts, dx) => pts.map(([x, y]) => f.map([x + dx, y]));
  const wSmall = Math.max(...small.map(p => p[0]));
  const P1 = place(small, 0), P2 = place(big, wSmall * 1.35);
  let out = poly(P1, LINE, 2.2, LINE + '25') + poly(P2, ACCENT, 2.2, ACCENT + '25');
  // Each outline places its own labels, but the two runs see each other: the
  // pair sits side by side and the small figure's right-hand label and the big
  // one's left-hand label compete for the same gutter.
  const entryFor = (P) => ([k, text]) =>
    ({ p: P[+k], q: P[(+k + 1) % P.length], text });
  const small1 = Object.entries(spec.labelsSmall ?? {}).map(entryFor(P1));
  const big2 = Object.entries(spec.labelsBig ?? {}).map(entryFor(P2));
  const edgesOf = (P) => P.map((pt, i) => [pt, P[(i + 1) % P.length]]);
  const firstPass = placeEdgeLabels(small1, P1, [], { W, H }, edgesOf(P2));
  out += firstPass;
  out += placeEdgeLabels(big2, P2, boxesOf(firstPass), { W, H }, edgesOf(P1));
  return frame(W, H, spec.alt, out);
}

function buildSymmetry(spec) {
  const W = spec.width ?? 280, H = spec.height ?? 260;
  const m = polygonModel({ shape: 'regular', dims: { sides: spec.sides, r: 1 } });
  const f = fitter(m, W, H, 56);
  const P = m.map(f.map);
  const c = [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  let out = poly(P, INK, 2, LINE + '22');
  if (spec.showAxes) {
    // A regular n-gon has exactly n axes: through each vertex for odd n, and
    // through vertices and edge midpoints alternately for even n.
    const R = Math.max(...P.map(p => Math.hypot(p[0] - c[0], p[1] - c[1]))) + 14;
    for (let i = 0; i < spec.sides; i++) {
      const a = rad(90) + (Math.PI * i) / spec.sides;
      const p1 = [n(c[0] + R * Math.cos(a)), n(c[1] - R * Math.sin(a))];
      const p2 = [n(c[0] - R * Math.cos(a)), n(c[1] + R * Math.sin(a))];
      out += seg(p1, p2, ACCENT, 1.3, '5 4');
    }
  }
  if (spec.showCenter) out += `<circle cx="${n(c[0])}" cy="${n(c[1])}" r="3.4" fill="${INK}"/>`;
  if (spec.caption) out += txt([W / 2, H - 12], spec.caption, 'middle', INK, 12, role('identifier'));
  return frame(W, H, spec.alt, out);
}

function buildCirclePlane(spec) {
  const W = spec.width ?? 320, H = spec.height ?? 300;
  const g = gridPlane(spec, W, H);
  let out = g.out;
  const R = n(spec.r * g.s);
  out += `<circle cx="${g.X(spec.h)}" cy="${g.Y(spec.k)}" r="${R}" fill="${LINE}22" stroke="${LINE}" stroke-width="2.4"/>`;
  out += `<circle cx="${g.X(spec.h)}" cy="${g.Y(spec.k)}" r="3.5" fill="${ACCENT}"/>`;
  out += seg([g.X(spec.h), g.Y(spec.k)], [g.X(spec.h + spec.r), g.Y(spec.k)], ACCENT, 1.8);
  if (spec.labels?.center) out += txt([n(g.X(spec.h) - 7), n(g.Y(spec.k) + 17)], spec.labels.center, 'end', INK, 12, role('identifier'));
  if (spec.labels?.radius) out += txt([n((g.X(spec.h) + g.X(spec.h + spec.r)) / 2), n(g.Y(spec.k) + 16)], spec.labels.radius, 'middle', INK, 12, role('length') + INTERNAL);
  return frame(W, H, spec.alt, out);
}

// ─── dot_plot ────────────────────────────────────────────────────────────────
//
// Ported from app/components/FigureRenderer.tsx's `case "dot_plot":` (pipeline
// 2, the CAT item bank). Landed here as a standalone builder rather than as a
// fourth `coordinate_plane` content array (the precedent bars/boxes/curves/
// series set in make_figure.mjs) because a dot plot shares none of that
// module's reusable machinery: no numeric y-axis, no gridlines, no y ticks to
// invert, and no FIXED canvas -- the canvas HEIGHT is a function of the
// tallest stack, which is the one thing every coordinate_plane content array
// assumes constant. Forking coordinate_plane's grid/tick plumbing to serve an
// axis it does not have would cost more than it saves; figure_table.mjs's
// banner makes the identical call for the same reason ("no shared machinery
// to fork"), and circle_plane below is the precedent for a standalone builder
// that draws its own axis rather than borrowing one that half-fits.
//
// `xValues` is the ordered ladder of distinct numeric values on the axis;
// `counts[i]` is how many dots stack above `xValues[i]`. Both are required
// and must be the same length -- a value with no count is an axis position
// nothing is under, and a count with no value is a stack with nowhere to
// stand -- and xValues must be strictly increasing, because a ladder that
// isn't ordered isn't a ladder a reader can read left to right.
function buildDotPlot(spec) {
  const xValues = spec.xValues;
  const counts = spec.counts;
  if (!Array.isArray(xValues) || xValues.length === 0)
    throw new Error('dot_plot: xValues must be a non-empty array of numbers');
  if (xValues.some(v => typeof v !== 'number' || !Number.isFinite(v)))
    throw new Error('dot_plot: every xValues entry must be a finite number');
  for (let i = 1; i < xValues.length; i++)
    if (xValues[i] <= xValues[i - 1])
      throw new Error(`dot_plot: xValues must be strictly increasing (index ${i}: ${xValues[i]} follows ${xValues[i - 1]})`);
  if (!Array.isArray(counts) || counts.length !== xValues.length)
    throw new Error('dot_plot: counts must be an array the same length as xValues');
  counts.forEach((c, i) => {
    if (!Number.isInteger(c) || c < 0)
      throw new Error(`dot_plot: counts[${i}] (${c}) must be a non-negative integer`);
  });
  if (counts.every(c => c === 0))
    throw new Error('dot_plot: every count is zero, which draws an axis and nothing else');

  const W = spec.width ?? 360;
  const padL = 30, padR = 30, padB = 46;
  const dotR = 7, dotGap = 3;
  const maxCount = Math.max(1, ...counts);
  const axisY = 40 + maxCount * (dotR * 2 + dotGap);
  const H = axisY + padB;
  const plotW = W - padL - padR;
  const band = plotW / xValues.length;
  const xToPx = i => n(padL + band * i + band / 2);

  let out = `<line x1="${n(padL - 6)}" y1="${axisY}" x2="${n(W - padR + 6)}" y2="${axisY}" stroke="${INK}" stroke-width="1.4"/>`;
  xValues.forEach((xv, i) => {
    const cx = xToPx(i);
    out += `<line x1="${cx}" y1="${axisY}" x2="${cx}" y2="${n(axisY + 5)}" stroke="${INK}" stroke-width="1.2"/>`;
    // Dots stack bottom-up from the axis, closest first (k = 0), so the tally
    // reads the way a hand-drawn dot plot does: one mark added on top of the
    // last for every occurrence of that value.
    for (let k = 0; k < counts[i]; k++) {
      const cy = n(axisY - dotR - k * (dotR * 2 + dotGap));
      out += `<circle data-dot="${i}-${k}" cx="${cx}" cy="${cy}" r="${dotR}" fill="${ACCENT}" stroke="${INK}" stroke-width="0.8"/>`;
    }
    // A plain (non-bold) tick label, matching the axis-tick convention in
    // make_figure.mjs and figure_shapes.mjs's own gridPlane -- txt() forces
    // font-weight 600, which is right for a dimension label and wrong for a
    // tick. data-role="tick" is what verifyShape reads to find these without
    // guessing from font weight or position.
    out += `<text data-role="tick" x="${cx}" y="${n(axisY + 20)}" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="12" fill="${INK}">${esc(String(xv))}</text>`;
  });
  if (spec.xLabel) out += txt([n(W / 2), n(H - 8)], spec.xLabel, 'middle', INK, 12, role('identifier'));

  return frame(W, H, spec.alt, out);
}

const BUILDERS = {
  polygon: buildPolygon,
  circle: buildCircle,
  right_triangle: buildRightTriangle,
  solid3d: buildSolid3d,
  transform_pair: buildTransformPair,
  similar_pair: buildSimilarPair,
  symmetry: buildSymmetry,
  circle_plane: buildCirclePlane,
  dot_plot: buildDotPlot,
};

export const SHAPE_TYPES = Object.keys(BUILDERS);
export function buildShape(spec) {
  const b = BUILDERS[spec.type];
  if (!b) throw new Error(`unknown shape type ${spec.type}`);
  if (!spec.alt) throw new Error('spec.alt is required: the figure supplements the text, never replaces it');
  return b(spec);
}

// ─── verification ────────────────────────────────────────────────────────────
//
// Re-measures the EMITTED SVG rather than trusting the builder, and compares
// scale-invariant quantities: ratios of drawn lengths against ratios of stated
// dimensions, and drawn angles against stated angles. Scale invariance is the
// point -- it means the check cannot be satisfied by a builder that happens to
// use the same wrong number twice.

const RE_POLY = /<polygon points="([^"]+)"/g;
const RE_CIRC = /<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([-\d.]+)"/g;
const RE_ELL = /<ellipse cx="([-\d.]+)" cy="([-\d.]+)" rx="([-\d.]+)" ry="([-\d.]+)"/g;

const parsePolys = svg => [...svg.matchAll(RE_POLY)]
  .map(m => m[1].trim().split(/\s+/).map(p => p.split(',').map(Number)));
const sideLens = pts => pts.map((p, i) => dist(p, pts[(i + 1) % pts.length]));
const close = (a, b, tol = 0.02) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

export function verifyShape(spec, svg) {
  const checks = [];
  const add = (name, actual, expected, tol = 0.02) =>
    checks.push({ name, actual: n(actual), expected: n(expected), ok: close(actual, expected, tol) });

  if (spec.type === 'polygon' || spec.type === 'symmetry') {
    const model = spec.type === 'symmetry'
      ? polygonModel({ shape: 'regular', dims: { sides: spec.sides, r: 1 } })
      : polygonModel(spec);
    const drawn = parsePolys(svg)[0];
    if (!drawn) return [{ name: 'polygon emitted', actual: 0, expected: 1, ok: false }];
    const ms = sideLens(model), ds = sideLens(drawn);
    // Every drawn side must be the same multiple of its model side: one uniform
    // scale, which is what stops a 3 by 8 rectangle from rendering square.
    const k = ds[0] / ms[0];
    ms.forEach((L, i) => add(`side ${i} scale`, ds[i] / L, k));
  }

  if (spec.type === 'right_triangle') {
    const m = rightTriangleModel(spec);
    const drawn = parsePolys(svg)[0];
    const [a, b] = [m[1][0], m[2][1]];
    const ds = sideLens(drawn);              // [base, hyp, height]
    add('base : height ratio', ds[0] / ds[2], a / b);
    add('hypotenuse : base ratio', ds[1] / ds[0], Math.hypot(a, b) / a);
    // The right angle must actually be 90 degrees on screen.
    const v = drawn[0], p = drawn[1], q = drawn[2];
    const dot = (p[0] - v[0]) * (q[0] - v[0]) + (p[1] - v[1]) * (q[1] - v[1]);
    add('right angle (cos)', dot / (dist(v, p) * dist(v, q)), 0, 0.02);
    if (spec.special === '30-60-90') add('long : short leg', Math.max(a, b) / Math.min(a, b), Math.sqrt(3));
    if (spec.special === '45-45-90') add('leg : leg', a / b, 1);
  }

  if (spec.type === 'circle' || spec.type === 'circle_plane') {
    const cs = [...svg.matchAll(RE_CIRC)].map(m => Number(m[3])).filter(r => r > 5);
    add('one circle drawn', cs.length, 1, 0);
    if (spec.type === 'circle_plane') {
      // A circle on a plane with unequal axis scales would be an ellipse; the
      // grid builder uses one scale, and this is the assertion of that.
      const ells = [...svg.matchAll(RE_ELL)];
      add('no ellipse (uniform axes)', ells.length, 0, 0);
    }
  }

  if (spec.type === 'solid3d') {
    const d = spec.dims;
    if (spec.shape === 'cylinder' || spec.shape === 'cone') {
      const e = [...svg.matchAll(RE_ELL)][0];
      const rx = Number(e[3]);
      const hLine = [...svg.matchAll(/<line x1="([-\d.]+)" y1="([-\d.]+)" x2="\1" y2="([-\d.]+)"/g)]
        .map(m => Math.abs(Number(m[3]) - Number(m[2]))).sort((x, y) => y - x)[0];
      add('height : radius ratio', hLine / rx, d.h / d.r, 0.03);
    }
    if (spec.shape === 'rectangular_prism') {
      const front = parsePolys(svg)[0];
      const ls = sideLens(front);
      add('length : height ratio', ls[0] / ls[1], d.l / d.h, 0.03);
    }
    if (spec.shape === 'sphere') {
      const r = [...svg.matchAll(RE_CIRC)].map(m => Number(m[3])).filter(x => x > 5)[0];
      add('sphere drawn', r > 0 ? 1 : 0, 1, 0);
    }
    if (spec.shape === 'square_pyramid') {
      // Base edge from the front side of the base rhombus; height from the
      // dashed axis, which runs apex to base centre and so is the true height
      // rather than the foreshortened front edge.
      const baseEdge = sideLens(parsePolys(svg)[0])[0];
      const axis = [...svg.matchAll(/<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)" stroke="[^"]*" stroke-width="1.2" stroke-dasharray="4 3"\/>/g)]
        .map(m => Math.hypot(Number(m[3]) - Number(m[1]), Number(m[4]) - Number(m[2])))[0];
      add('height : base edge ratio', axis / baseEdge, d.h / d.b, 0.03);
    }
  }

  if (spec.type === 'transform_pair') {
    const pre = spec.preimage, img = applyTransform(pre, spec.transform), t = spec.transform;
    const [P, I] = parsePolys(svg).slice(0, 2);
    // The two drawn polygons must stand in the same relationship as the model.
    const dp = sideLens(P), di = sideLens(I);
    if (t.kind === 'dilation') {
      dp.forEach((L, i) => add(`side ${i} dilation factor`, di[i] / L, Math.abs(t.k), 0.03));
    } else {
      dp.forEach((L, i) => add(`side ${i} length preserved`, di[i] / L, 1, 0.03));
    }
    if (t.kind === 'rotation') {
      const c = t.center ?? [0, 0];
      pre.forEach((p, i) => add(`vertex ${i} distance from centre`, dist(img[i], c), dist(p, c), 0.001));
    }
    if (t.kind === 'reflection') {
      const back = applyTransform(img, t); // an involution
      pre.forEach((p, i) => add(`vertex ${i} reflects back`, dist(back[i], p), 0, 0.001));
    }
  }

  if (spec.type === 'similar_pair') {
    const [P1, P2] = parsePolys(svg);
    const s1 = sideLens(P1), s2 = sideLens(P2);
    s1.forEach((L, i) => add(`side ${i} scale factor`, s2[i] / L, spec.k, 0.03));
  }

  // Dot plots, measured back out of the emitted circles and tick labels.
  //
  // Everything else in this file compares RATIOS, because a shape's spec is a
  // set of dimensions and the drawing can be at any scale. A dot plot has no
  // such freedom: `counts[i]` is a literal number of marks, so the check here
  // is an exact count, not a ratio, the same way verifyBars counts declared
  // bars against drawn rects rather than comparing a scale factor.
  if (spec.type === 'dot_plot') {
    const xValues = spec.xValues ?? [];
    const counts = spec.counts ?? [];
    const dots = [...svg.matchAll(/<circle data-dot="(\d+)-(\d+)" cx="([-\d.]+)" cy="([-\d.]+)"/g)];
    const ticks = [...svg.matchAll(/<text data-role="tick" x="([-\d.]+)" y="[-\d.]+" text-anchor="middle"[^>]*>([^<]*)<\/text>/g)];

    add('every value ticked', ticks.length, xValues.length, 0);
    add('total dots drawn', dots.length, counts.reduce((s, c) => s + c, 0), 0);

    xValues.forEach((xv, i) => {
      const own = dots.filter(d => Number(d[1]) === i);
      add(`stack ${i} dot count`, own.length, counts[i] ?? 0, 0);
      const T = ticks[i];
      if (!T) return add(`stack ${i} labelled`, 0, 1, 0);
      add(`stack ${i} label is "${xv}"`, T[2] === esc(String(xv)) ? 1 : 0, 1, 0);
      // Every dot in the stack sits directly above its own tick, and the
      // stack is gapless: dot k sits exactly one dot-plus-gap above dot k-1,
      // which is what "stacked" means as opposed to scattered near the value.
      // Measured as a DIFFERENCE against 0, not as cx against tick-x directly:
      // close() scales its tolerance by the expected value (see its definition
      // above), which is right for the ratio checks elsewhere in this file but
      // would turn 0.5 into "half the tick's pixel position" here. A tick at
      // x = 217 would then tolerate a dot drifting 108px off it.
      own.forEach(d => add(`stack ${i} dot aligned to its tick`, +d[3] - +T[1], 0, 0.5));
      if (own.length > 1) {
        const gaps = own.slice(1).map((d, k) => +own[k][4] - +d[4]);
        add(`stack ${i} dots evenly stacked`, Math.max(...gaps) - Math.min(...gaps), 0, 0.5);
      }
    });

    // The structural fact a value ladder owes the reader: evenly spaced ticks,
    // the same guarantee verifyBars makes for category bands.
    const tickX = ticks.map(t => +t[1]);
    if (tickX.length > 2) {
      const gaps = tickX.slice(1).map((v, i) => v - tickX[i]);
      add('value ticks evenly spaced', Math.max(...gaps) - Math.min(...gaps), 0, 0.5);
    }
  }

  return checks;
}
