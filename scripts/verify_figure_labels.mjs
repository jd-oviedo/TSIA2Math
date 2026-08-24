// verify_figure_labels.mjs -- dimension labels, measured in a real browser.
//
//   node scripts/verify_figure_labels.mjs              every spec on disk
//   node scripts/verify_figure_labels.mjs --pool       worksheet-eligible only
//   node scripts/verify_figure_labels.mjs --only gr-2-1-notched
//   node scripts/verify_figure_labels.mjs --sheet out.png    contact sheet too
//   node scripts/verify_figure_labels.mjs --prove            faults each rule
//
// WHY A BROWSER. Label collision is a question about rendered glyph boxes, and
// the generator only has an ESTIMATE of those. Measuring the estimate against
// itself would pass on a figure that is visibly broken, so every box here comes
// from getBoundingClientRect() on the real text node, in the real font stack,
// after the real layout. Rotated axis titles are the case that makes this
// non-negotiable: an axis-aligned approximation reads "Degrees" as a 50px-wide
// horizontal box overlapping the y tick labels, when the rendered element is a
// 12px-wide vertical strip that overlaps nothing. Four figures in the eligible
// pool carry one. getBoundingClientRect() honours the transform, so they are
// simply not a special case here.
//
// THE THREE ASSERTIONS
//
//   1. No two rendered label boxes intersect.
//   2. Every dimension label sits on its own segment's midpoint, offset to the
//      exterior side: measured as the label box's centre projected onto the
//      segment (must land within ALONG_TOL of the midpoint) and onto the
//      outward normal (must be positive, and no further than PERP_MAX unless
//      the label carries a leader line back to the segment).
//   3. No label box crosses the figure outline.
//   4. No label is clipped by the canvas edge.
//   5. RULE A: a length label's box clears every drawn stroke of its figure,
//      internal construction lines included, by CLEARANCE.
//   6. RULE B: a length label's centre is not inside the figure's filled body.
//
// RULES 5 AND 6 KEY ON A DECLARED ROLE, NEVER ON POSITION. figure_shapes.mjs
// writes data-role on every label (see `role` there). Only role="length" is
// subject to them: an angle label belongs inside at its vertex, an identifier
// like "ABC" belongs on the shape it names, and an axis tick belongs on its
// axis. Deciding which is which by looking at where the label ended up would
// make the checker agree with whatever the generator did.
//
// Rule 5 ignores GRIDLINES, identified by their stroke colour rather than by
// position. A tick label sits on a gridline by design, and a rule that counted
// that as a collision reported 365 correct labels as broken. It does NOT ignore
// dashed construction lines, which is the whole point: a radius label lying
// across a dashed radius is exactly what rule 5 exists to catch.
//
// Rule 6 exempts a label carrying data-internal, which measures a construction
// line drawn INTO the figure such as a dashed height. That label is a length
// and it is correctly inside. The exemption is written at the one call site
// that draws such a line, never inferred.
//
// Assertion 4 was added after the first pass of assertions 1 to 3 came back
// clean on a figure whose left-hand label read "leg 6" because the other half
// of "short leg 6" was outside the viewBox. A label that is off the canvas
// collides with nothing and sits perfectly on its midpoint.
//
// Assertion 2 measures the DISTANCE from the segment, not the side. The
// exterior is the placer's rule, but a label the exterior margin cannot hold
// is placed inside the shape instead (see INSIDE_COST in figure_shapes.mjs),
// and both are legible; what is never acceptable is a label that has drifted
// off its own midpoint.
//
// Assertion 2 is the one that catches the defect this file was written for. A
// label slid along its edge to dodge a neighbour still passes 1 and 3 while
// being unreadable, which is exactly the state gr-2-1-notched shipped in: two
// "5 ft" labels floating diagonally in an empty corner, neither on the edge it
// describes. Overlap alone is not a proxy for legibility.
//
// WHICH SEGMENT A LABEL DESCRIBES is read off the element, never inferred.
// figure_shapes.mjs writes data-dim="x1,y1,x2,y2" onto every dimension label
// (see dimAttr there). Inferring the pairing by proximity would make the
// checker agree with the bug: a mis-placed label is precisely one that is
// nearer to some other edge.

import { chromium } from 'playwright';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { basename } from 'path';
import { figureFromSpec } from './make_figure.mjs';

const DIR = 'curriculum/figures';

// The 22 specs reachable from a worksheet. Derived from the curriculum markdown
// by scripts/audit_worksheet_pool.mjs and pasted here rather than recomputed,
// so this file needs no markdown parse to run --pool.
const POOL = [
  'ar-3-6-p3-graph', 'ar-3-6-p7-vertex-point', 'ar-3-6-q1-graph', 'ar-3-6-q3-graph',
  'pr-1-3-bar-sports', 'pr-1-3-line-temps', 'pr-1-3-bar-quiz', 'pr-2-4-box-classes',
  'pr-2-5-box-practice', 'pr-2-5-box-equal-ends', 'pr-2-5-box-quiz',
  'pr-1-3-pictograph-pizzas', 'pr-1-4-books', 'pr-1-4-visits', 'pr-1-4-twoway-transport',
  'pr-1-4-twoway-session', 'gr-2-1-lshape', 'gr-2-1-notched',
  'gr-3-1-p1', 'gr-3-1-p2', 'gr-3-1-p3', 'gr-3-1-p4',
];

// Tolerances, in SVG user units (== CSS px, the figures are rendered 1:1).
//
// ALONG_TOL is 3.5 rather than 0 because a label is centred on its BOX, and a
// box's centre is not exactly the glyph run's optical centre: trailing spaces,
// the "ft" descender-free tail and hinting all move it by a pixel or two. 3.5
// is under a third of a character and well inside "reads as centred", while the
// defect it has to catch is 16 to 19 units off.
const ALONG_TOL = 3.5;
// How far the label's NEAREST edge may sit from its segment before it needs a
// leader line. Measured to the near edge rather than to the box centre on
// purpose: a centre-based limit scales with the label's own length, so "14 ft"
// beside a vertical edge would read as further out than "8" at the identical
// offset. The near edge is the gap a reader actually sees.
const PERP_MAX = 13;
// With a leader line the label may go further, but not off into the margin.
const PERP_MAX_LEADER = 70;
// Labels must clear each other by this much. Matched to CLEARANCE in
// figure_shapes.mjs: the placer reserves it, this asserts it was reserved.
const CLEARANCE = 2;
// Gridlines, by colour. GRID in figure_shapes.mjs and make_figure.mjs.
const GRID_RGB = 'rgb(226, 220, 202)';

// --prove MOVES A LABEL SOMEWHERE KNOWN-BAD AND REQUIRES THE RULE TO NOTICE.
//
// Four probes written during this work reported a confident zero while being
// blind: one evaluated a function object instead of calling it, one read a
// property that had been renamed so every comparison was NaN, one filtered on a
// spec type that did not exist so it skipped its own targets, and the shared
// Liang-Barsky helper had its branches inverted so it missed a segment cutting
// straight through a box. Every one of those looked exactly like a clean run.
//
// So a clean run is not evidence on its own. For each figure carrying a length
// label, --prove drops that label onto a drawn stroke and then into the middle
// of the filled body, and requires rule 5 and rule 6 respectively to fire. A
// rule that stays silent on a label placed deliberately wrong is not measuring.
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

// harness-* are deliberately extreme fixtures owned by faultproof_figures.mjs
// (an axis range that excludes zero, a two-way table with the longest possible
// headers). They exist to make OTHER checks fail on demand and appear in no
// curriculum markdown, so holding them to a legibility standard would mean
// tuning a fault until it stopped being one. --harness includes them anyway.
let specs = readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => basename(f, '.json'));
if (!flag('--harness')) specs = specs.filter((s) => !s.startsWith('harness-'));
if (flag('--pool')) specs = specs.filter((s) => POOL.includes(s));
if (value('--only')) specs = specs.filter((s) => s === value('--only'));
specs.sort();

let failures = 0;
const failed = [];
function fail(spec, label, detail) {
  failures++;
  failed.push(`${spec}: ${label}`);
  console.log(`  FAIL  ${spec}  ${label}${detail ? `  (${detail})` : ''}`);
}

// ─── geometry, on the measured boxes ─────────────────────────────────────────

const dot = (a, b) => a[0] * b[0] + a[1] * b[1];

function segFrame(x1, y1, x2, y2) {
  const m = [(x1 + x2) / 2, (y1 + y2) / 2];
  const dx = x2 - x1, dy = y2 - y1;
  const L = Math.hypot(dx, dy) || 1;
  return { m, unit: [dx / L, dy / L], normal: [-dy / L, dx / L], length: L };
}

function boxesOverlap(a, b) {
  return a.x < b.x + b.width + CLEARANCE && b.x < a.x + a.width + CLEARANCE
    && a.y < b.y + b.height + CLEARANCE && b.y < a.y + a.height + CLEARANCE;
}

// Does segment (p,q) cut through the axis-aligned box? Liang-Barsky, which
// answers "intersects" rather than "an endpoint is inside", so an outline that
// merely touches a corner is not reported.
// See the note on segHitsBox in figure_shapes.mjs: the earlier version of this
// had its two branches inverted and reported a segment cutting straight through
// a box as a miss, so assertion 3 was unreliable from the day it was written.
function segIntersectsBox(p, q, box) {
  const dx = q[0] - p[0], dy = q[1] - p[1];
  const L = box.x, R = box.x + box.width, T = box.y, B = box.y + box.height;
  let t0 = 0, t1 = 1;
  const tests = [[-dx, p[0] - L], [dx, R - p[0]], [-dy, p[1] - T], [dy, B - p[1]]];
  for (const [pp, qq] of tests) {
    if (pp === 0) { if (qq < 0) return false; continue; }
    const r = qq / pp;
    if (pp < 0) { if (r > t1) return false; if (r > t0) t0 = r; }
    else { if (r < t0) return false; if (r < t1) t1 = r; }
  }
  return t0 < t1;
}

// ─── the measurement, as one reusable probe ──────────────────────────────────
//
// A named source string rather than an inline arrow, so --prove can re-run the
// identical measurement against a faulted page. Two measurements that are meant
// to agree should be the same code, not two copies of it.
const PROBE_SRC = `(GRID_COLOUR) => {
    const root = document.querySelector('svg');
    const rootBox = root.getBoundingClientRect();
    const rel = (r) => ({ x: r.x - rootBox.x, y: r.y - rootBox.y, width: r.width, height: r.height });

    // INK, not the font box. getBoundingClientRect returns the FONT's box,
    // which for a label like "5 ft" is 62% taller than the pixels it paints, so
    // judging collisions on it reports figures as broken that read perfectly.
    // Canvas exposes the real ink extents for the same string in the same face,
    // and the two are combined: the rect gives position, measureText gives how
    // much of that box is actually inked.
    //
    // Horizontal extent is left as the advance width. It over-estimates the ink
    // only by a side bearing, and that is the safe direction.
    const ctx = document.createElement('canvas').getContext('2d');
    const ink = (el, r) => {
      // A rotated label's rect is already the rotated bounding box, and the
      // vertical shrink below would be measuring the wrong axis. Axis titles are
      // the only rotated text here and they sit nowhere near a dimension label,
      // so the honest thing is to leave their box alone.
      let node = el;
      while (node && node !== root) {
        const t = node.getAttribute && node.getAttribute('transform');
        if (t && t.includes('rotate')) return r;
        node = node.parentNode;
      }
      const cs = getComputedStyle(el);
      ctx.font = \`\${cs.fontWeight} \${cs.fontSize} \${cs.fontFamily}\`;
      const m = ctx.measureText(el.textContent);
      if (!(m.fontBoundingBoxAscent >= 0) || !(m.actualBoundingBoxAscent >= 0)) return r;
      const baseline = r.y + m.fontBoundingBoxAscent;
      const top = baseline - m.actualBoundingBoxAscent;
      const height = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      return { x: r.x, y: top, width: r.width, height: Math.max(height, 1) };
    };

    const texts = [...root.querySelectorAll('text')].map((el) => ({
      text: el.textContent,
      dim: el.getAttribute('data-dim'),
      leader: el.getAttribute('data-leader') !== null,
      inside: el.getAttribute('data-inside') !== null,
      role: el.getAttribute('data-role'),
      internal: el.getAttribute('data-internal') !== null,
      box: ink(el, rel(el.getBoundingClientRect())),
    }));

    // Every drawn stroke, sampled along its real geometry. line, polyline,
    // polygon, path, ellipse and circle are all SVGGeometryElement, so one
    // sampler covers construction lines, hidden edges and ellipse arcs alike.
    const strokes = [];
    for (const el of root.querySelectorAll('line, polyline, polygon, path, ellipse, circle')) {
      const len = el.getTotalLength ? el.getTotalLength() : 0;
      if (!len) continue;
      const cs = getComputedStyle(el);
      if (cs.stroke === 'none' || cs.stroke === GRID_COLOUR) continue;
      const pts = [];
      for (let d = 0; d <= len; d += Math.max(len / 2000, 0.4)) {
        const q = el.getPointAtLength(d);
        pts.push([q.x - rootBox.x + rootBox.x, q.y]);
      }
      strokes.push({ tag: el.tagName, dashed: !!el.getAttribute('stroke-dasharray'), pts });
    }

    // Is a point inside the figure's painted body? isPointInFill is exact for
    // every shape type, so this needs no polygon approximation.
    const filled = [...root.querySelectorAll('polygon, path, ellipse, circle')]
      .filter((el) => {
        const f = getComputedStyle(el).fill;
        return f && f !== 'none' && !f.startsWith('rgba(0, 0, 0, 0)');
      });
    const insideBody = (x, y) => {
      const pt = new DOMPoint(x, y);
      return filled.some((el) => el.isPointInFill(pt));
    };
    // Outline segments, for the "no label crosses the figure" assertion. Only
    // the closed shape outlines, not gridlines or axes: a tick label sitting on
    // an axis is correct, a dimension label sitting on the shape is not.
    const outline = [];
    for (const el of root.querySelectorAll('polygon')) {
      const pts = el.getAttribute('points').trim().split(/\\s+/).map((p) => p.split(',').map(Number));
      for (let i = 0; i < pts.length; i++) outline.push([pts[i], pts[(i + 1) % pts.length]]);
    }
    const bodyHits = texts.map((t) =>
      insideBody(t.box.x + t.box.width / 2, t.box.y + t.box.height / 2));

    return {
      texts, outline, strokes, bodyHits,
      // The viewBox, not the rendered rect: the figure is drawn in user units
      // and a label outside them is clipped no matter what size it displays at.
      view: root.getAttribute('viewBox').split(/\\s+/).map(Number),
    };
}`;


// The two new rules as predicates over a measurement, so the assertions and the
// fault proofs cannot drift apart.
function ruleAHits(m) {
  const out = [];
  for (const t of m.texts) {
    if (t.role !== 'length') continue;
    const g = { x: t.box.x - CLEARANCE, y: t.box.y - CLEARANCE,
                width: t.box.width + CLEARANCE * 2, height: t.box.height + CLEARANCE * 2 };
    const hit = m.strokes.find((sk) => sk.pts.some(
      (q) => q[0] >= g.x && q[0] <= g.x + g.width && q[1] >= g.y && q[1] <= g.y + g.height));
    if (hit) out.push({ t, hit });
  }
  return out;
}
function ruleBHits(m) {
  const out = [];
  m.texts.forEach((t, i) => {
    if (t.role !== 'length' || t.internal) return;
    if (m.bodyHits[i]) out.push({ t });
  });
  return out;
}

// ─── the run ─────────────────────────────────────────────────────────────────

// Moves every length label onto a target that must trip one of the two rules.
// 'stroke' drops it on the midpoint of a real drawn stroke; 'body' drops it at
// a point inside the figure's filled area.
const FAULT = `(where) => {
  const root = document.querySelector('svg');
  const labels = [...root.querySelectorAll('text[data-role="length"]')];
  if (!labels.length) return 0;

  let target = null;
  if (where === 'stroke') {
    for (const el of root.querySelectorAll('line, polyline, polygon, path, ellipse, circle')) {
      const len = el.getTotalLength ? el.getTotalLength() : 0;
      if (!len) continue;
      const cs = getComputedStyle(el);
      if (cs.stroke === 'none' || cs.stroke === 'rgb(226, 220, 202)') continue;
      const q = el.getPointAtLength(len / 2);
      target = [q.x, q.y];
      break;
    }
  } else {
    const filled = [...root.querySelectorAll('polygon, path, ellipse, circle')].filter((el) => {
      const f = getComputedStyle(el).fill;
      return f && f !== 'none' && !f.startsWith('rgba(0, 0, 0, 0)');
    });
    // The DEEPEST interior point, not the first one found. A grid scan that
    // takes its first hit lands near a boundary, and on a thin corner of a
    // triangle the label's ink centre then sits a few pixels outside again, so
    // the fault fails to fault and rule 6 looks blind when it is not.
    let bestDepth = -1;
    for (const el of filled) {
      const b = el.getBBox();
      for (let gx = 1; gx < 20; gx++) for (let gy = 1; gy < 20; gy++) {
        const x = b.x + (b.width * gx) / 20, y = b.y + (b.height * gy) / 20;
        if (!el.isPointInFill(new DOMPoint(x, y))) continue;
        let depth = 0;
        while (depth < 40
          && el.isPointInFill(new DOMPoint(x - depth, y))
          && el.isPointInFill(new DOMPoint(x + depth, y))
          && el.isPointInFill(new DOMPoint(x, y - depth))
          && el.isPointInFill(new DOMPoint(x, y + depth))) depth++;
        if (depth > bestDepth) { bestDepth = depth; target = [x, y]; }
      }
    }
  }
  if (!target) return 0;
  for (const el of labels) {
    el.removeAttribute('transform');
    el.setAttribute('x', target[0]);
    // The rules measure the label's INK CENTRE, and a text element is
    // positioned by its baseline, so the baseline goes below the target by half
    // the ink height for the centre to land on it.
    el.setAttribute('y', where === 'body' ? target[1] + 4.5 : target[1]);
    el.setAttribute('text-anchor', 'middle');
  }
  return labels.length;
}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
const shots = [];
const proof = {
  stroke: { moved: 0, caught: 0, silent: [], exempt: [] },
  body: { moved: 0, caught: 0, silent: [], exempt: [] },
};

for (const name of specs) {
  const spec = JSON.parse(readFileSync(`${DIR}/${name}.json`, 'utf8'));
  const { svg } = figureFromSpec(spec);

  await page.setContent(
    `<body style="margin:0;background:#fff">${svg}</body>`,
    { waitUntil: 'load' },
  );

  const measured = await page.evaluate(`(${PROBE_SRC})(${JSON.stringify(GRID_RGB)})`);

  const { texts, outline } = measured;
  const dims = texts.filter((t) => t.dim);

  // 1. no two label boxes intersect
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      if (boxesOverlap(texts[i].box, texts[j].box)) {
        fail(name, 'two label boxes intersect', `"${texts[i].text}" x "${texts[j].text}"`);
      }
    }
  }

  // 2. every dimension label is on its segment's midpoint, outside the figure
  for (const t of dims) {
    const [x1, y1, x2, y2] = t.dim.split(',').map(Number);
    const { m, unit, normal } = segFrame(x1, y1, x2, y2);
    const centre = [t.box.x + t.box.width / 2, t.box.y + t.box.height / 2];
    const d = [centre[0] - m[0], centre[1] - m[1]];
    const along = Math.abs(dot(d, unit));
    // The outward side is whichever normal direction the label actually took;
    // buildPolygon has already resolved it by containment, and re-deriving it
    // here would just be a second implementation of the same probe.
    //
    // Distance is taken to the box's nearest corner along the normal, so a long
    // label and a short one at the same offset measure the same. A box that
    // straddles the segment line reports ~0 and trips the "on top of" case.
    const corners = [
      [t.box.x, t.box.y], [t.box.x + t.box.width, t.box.y],
      [t.box.x, t.box.y + t.box.height], [t.box.x + t.box.width, t.box.y + t.box.height],
    ];
    const perp = Math.min(...corners.map((c) => Math.abs(dot([c[0] - m[0], c[1] - m[1]], normal))));
    const limit = t.leader ? PERP_MAX_LEADER : PERP_MAX;

    if (along > ALONG_TOL) {
      fail(name, 'label is not centred on the segment it describes',
        `"${t.text}" is ${along.toFixed(1)} off the midpoint along the edge (tol ${ALONG_TOL})`);
    }
    if (perp > limit) {
      fail(name, 'label sits too far from its segment',
        `"${t.text}" is ${perp.toFixed(1)} out (max ${limit}${t.leader ? ', with leader' : ''})`);
    }
    if (perp < 1) {
      fail(name, 'label sits on top of its segment', `"${t.text}"`);
    }
  }

  // 3. no label box crosses the figure outline
  //
  // Skipped for a label the placer has deliberately put INSIDE the shape: its
  // box is bounded by the outline by construction, and the assertion exists to
  // catch a label lying across an edge, which is a different thing.
  for (const t of texts) {
    // LENGTH LABELS ONLY, like rules 5 and 6. An identifier such as "ABC" or
    // "image" names the shape and belongs on it, and a tick label crosses a
    // shaded region by design. This scoping was invisible until the Liang-Barsky
    // fix above made the assertion work at all, at which point it reported 13
    // correct labels as broken.
    if (t.role !== 'length') continue;
    for (const [p, q] of outline) {
      if (segIntersectsBox(p, q, t.box)) {
        fail(name, 'label box crosses the figure outline', `"${t.text}"`);
        break;
      }
    }
  }

  // 4. no label is clipped by the canvas
  const [vx, vy, vw, vh] = measured.view;
  for (const t of texts) {
    const over = Math.max(vx - t.box.x, 0) + Math.max((t.box.x + t.box.width) - (vx + vw), 0)
      + Math.max(vy - t.box.y, 0) + Math.max((t.box.y + t.box.height) - (vy + vh), 0);
    if (over > 0.5) {
      fail(name, 'label is clipped by the canvas edge',
        `"${t.text}" runs ${over.toFixed(1)} outside the viewBox`);
    }
  }

  // 5. RULE A: a length label clears every drawn stroke of its own figure
  for (const { t, hit } of ruleAHits(measured)) {
    fail(name, 'length label lies on a drawn line',
      `"${t.text}" touches a ${hit.tag}${hit.dashed ? ' (dashed construction line)' : ''}`);
  }

  // 6. RULE B: a length label is not inside the figure's filled body
  for (const { t } of ruleBHits(measured)) {
    fail(name, 'length label sits inside the figure',
      `"${t.text}" reads as an interior quantity, not an edge length`);
  }

  const lengthCount = texts.filter((t) => t.role === 'length').length;
  console.log(`  ${'ok  '}${name}  (${texts.length} labels, ${dims.length} dimensioned, ${lengthCount} length)`);

  if (flag('--prove') && lengthCount) {
    // Rule 6 does not apply to a figure whose only length labels measure an
    // INTERNAL construction line, such as a circle whose one label names its
    // drawn radius. Those are exempt by design, so counting them as figures the
    // rule failed to catch would be counting the exemption as a bug. They are
    // reported separately rather than dropped, so the exemption stays visible.
    const provable = { stroke: true, body: measured.texts.some((t) => t.role === 'length' && !t.internal) };
    for (const [where, ruleName] of [['stroke', 'rule 5'], ['body', 'rule 6']]) {
      if (!provable[where]) { proof[where].exempt.push(name); continue; }
      await page.setContent(`<body style="margin:0;background:#fff">${svg}</body>`, { waitUntil: 'load' });
      const moved = await page.evaluate(`(${FAULT})(${JSON.stringify(where)})`);
      if (!moved) continue;
      proof[where].moved++;
      const after = await page.evaluate(`(${PROBE_SRC})(${JSON.stringify(GRID_RGB)})`);
      const fired = where === 'stroke' ? ruleAHits(after).length > 0 : ruleBHits(after).length > 0;
      if (fired) proof[where].caught++;
      else proof[where].silent.push(name);
      void ruleName;
    }
    await page.setContent(`<body style="margin:0;background:#fff">${svg}</body>`, { waitUntil: 'load' });
  }

  if (flag('--sheet')) {
    shots.push({ name, png: await page.locator('svg').screenshot() });
  }
}

if (flag('--sheet')) {
  const out = value('--sheet') || 'scratchpad/figure-contact-sheet.png';
  mkdirSync(out.replace(/\/[^/]+$/, ''), { recursive: true });
  const cells = shots.map(({ name, png }) =>
    `<figure><img src="data:image/png;base64,${png.toString('base64')}"><figcaption>${name}</figcaption></figure>`).join('');
  await page.setContent(`<body style="margin:0;background:#fff;font:11px ui-sans-serif,system-ui,sans-serif">
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;padding:14px">${cells}</div>
    <style>figure{margin:0}img{width:100%;display:block;border:1px solid #ddd}figcaption{padding:3px 0;color:#444}</style>
  </body>`, { waitUntil: 'load' });
  writeFileSync(out, await page.screenshot({ fullPage: true }));
  console.log(`\ncontact sheet: ${out} (${shots.length} figures)`);
}

await browser.close();

if (flag('--prove')) {
  console.log('\n--prove: each rule, against a label deliberately placed wrong');
  for (const [where, rule, what] of [
    ['stroke', 'rule 5 (length label on a drawn line)', 'dropped onto a real stroke'],
    ['body', 'rule 6 (length label inside the figure)', 'dropped inside the filled body'],
  ]) {
    const r = proof[where];
    const ok = r.moved > 0 && r.caught === r.moved;
    if (!ok) failures++;
    console.log(`  ${ok ? 'pass' : 'FAIL'}  ${rule}`);
    console.log(`        ${r.caught}/${r.moved} figures caught, labels ${what}`);
    if (r.exempt.length) {
      console.log(`        ${r.exempt.length} figure(s) exempt by design: ${r.exempt.join(', ')}`);
    }
    if (r.silent.length) console.log(`        SILENT ON: ${r.silent.join(', ')}`);
  }
}

console.log(`\n${specs.length} figure(s) checked, ${failures} assertion failure(s)`);
if (failures) {
  console.log('failed:');
  for (const f of [...new Set(failed)]) console.log(`  ${f}`);
}
process.exit(failures ? 1 : 0);
