// verify_figure_labels.mjs -- dimension labels, measured in a real browser.
//
//   node scripts/verify_figure_labels.mjs              every spec on disk
//   node scripts/verify_figure_labels.mjs --pool       worksheet-eligible only
//   node scripts/verify_figure_labels.mjs --only gr-2-1-notched
//   node scripts/verify_figure_labels.mjs --sheet out.png    contact sheet too
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
function segIntersectsBox(p, q, box) {
  const [x0, y0] = p, [x1, y1] = q;
  const dx = x1 - x0, dy = y1 - y0;
  let t0 = 0, t1 = 1;
  const clip = (num, den) => {
    if (den === 0) return num <= 0;
    const r = num / den;
    if (den < 0) { if (r > t1) return false; if (r > t0) t0 = r; }
    else { if (r < t0) return false; if (r < t1) t1 = r; }
    return true;
  };
  const L = box.x, R = box.x + box.width, T = box.y, B = box.y + box.height;
  if (!clip(L - x0, dx) || !clip(x0 - R, -dx) || !clip(T - y0, dy) || !clip(y0 - B, -dy)) return false;
  return t0 < t1;
}

// ─── the run ─────────────────────────────────────────────────────────────────

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
const shots = [];

for (const name of specs) {
  const spec = JSON.parse(readFileSync(`${DIR}/${name}.json`, 'utf8'));
  const { svg } = figureFromSpec(spec);

  await page.setContent(
    `<body style="margin:0;background:#fff">${svg}</body>`,
    { waitUntil: 'load' },
  );

  const measured = await page.evaluate(() => {
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
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
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
      box: ink(el, rel(el.getBoundingClientRect())),
    }));
    // Outline segments, for the "no label crosses the figure" assertion. Only
    // the closed shape outlines, not gridlines or axes: a tick label sitting on
    // an axis is correct, a dimension label sitting on the shape is not.
    const outline = [];
    for (const el of root.querySelectorAll('polygon')) {
      const pts = el.getAttribute('points').trim().split(/\s+/).map((p) => p.split(',').map(Number));
      for (let i = 0; i < pts.length; i++) outline.push([pts[i], pts[(i + 1) % pts.length]]);
    }
    return {
      texts, outline,
      // The viewBox, not the rendered rect: the figure is drawn in user units
      // and a label outside them is clipped no matter what size it displays at.
      view: root.getAttribute('viewBox').split(/\s+/).map(Number),
    };
  });

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
    if (t.inside) continue;
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

  console.log(`  ${'ok  '}${name}  (${texts.length} labels, ${dims.length} dimensioned)`);

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

console.log(`\n${specs.length} figure(s) checked, ${failures} assertion failure(s)`);
if (failures) {
  console.log('failed:');
  for (const f of [...new Set(failed)]) console.log(`  ${f}`);
}
process.exit(failures ? 1 : 0);
