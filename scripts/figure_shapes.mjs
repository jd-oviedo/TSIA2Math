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
  SURFACE: '#F7F3E7',  // background
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
function fitter(pts, W, H, pad) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 1e-9), spanY = Math.max(maxY - minY, 1e-9);
  const s = Math.min((W - 2 * pad) / spanX, (H - 2 * pad) / spanY);
  // Centre the drawing in the box.
  const ox = (W - s * spanX) / 2, oy = (H - s * spanY) / 2;
  return {
    s,
    map: p => [n(ox + (p[0] - minX) * s), n(H - oy - (p[1] - minY) * s)],
  };
}

const poly = (pts, stroke = INK, sw = 2, fill = 'none', dash = '') =>
  `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

const seg = (a, b, stroke = INK, sw = 1.3, dash = '') =>
  `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

const txt = (p, s, anchor = 'middle', fill = INK, size = 13) =>
  s ? `<text x="${p[0]}" y="${p[1]}" text-anchor="${anchor}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="${size}" font-weight="600" fill="${fill}">${esc(s)}</text>` : '';

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
    + txt(lp, labelText, 'middle', INK, 12);
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

// Places a label along an edge's true outward normal, choosing the outward side
// by testing a probe point for containment rather than by direction from the
// centroid.
//
// The centroid rule in edgeLabel below breaks in two ways that this unit hits.
// On a very flat right triangle (12 by 5, 24 by 7) the base's direction from
// the centroid is mostly horizontal, so the label gets pushed sideways onto the
// line instead of below it. On a concave outline like an L-shape the step edge
// can sit level with the centroid, leaving the sign undefined.
//
// This is opt-in via labelPlacement: "normal" precisely so that figures already
// published in Unit 3 keep their exact bytes. Unifying the two is logged as a
// follow-up rather than done here, because changing the default would silently
// re-render live content outside this pass's scope.
function edgeLabelNormal(p, q, poly, text, gap = 9, t = 0.5) {
  // t slides the label along the edge. Two short edges meeting at an inside
  // corner put their midpoints within a few units of each other, and no amount
  // of normal push separates them, so the label has to move sideways instead.
  const m = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const dx = q[0] - p[0], dy = q[1] - p[1];
  const L = Math.hypot(dx, dy) || 1;
  let nx = -dy / L, ny = dx / L;
  if (pointInPoly([m[0] + nx * 3, m[1] + ny * 3], poly)) { nx = -nx; ny = -ny; }
  const sideways = Math.abs(nx) > Math.abs(ny);
  const anchor = sideways ? (nx > 0 ? 'start' : 'end') : 'middle';
  // SVG text hangs from its baseline, so a label below an edge needs the extra
  // drop and one above it needs none.
  const baseline = sideways ? 4.5 : (ny > 0 ? 12 : -2);
  return txt([n(m[0] + nx * gap), n(m[1] + ny * gap + baseline)], text, anchor);
}

function edgeLabel(p, q, c, text, gap = 15) {
  const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let vx = m[0] - c[0], vy = m[1] - c[1];
  const L = Math.hypot(vx, vy) || 1;
  vx /= L; vy /= L;
  // A label pushed sideways is anchored on its inner edge so it grows outward
  // rather than straddling the frame; centred anchoring clipped side labels.
  const anchor = Math.abs(vx) > 0.7 ? (vx > 0 ? 'start' : 'end') : 'middle';
  const dy = Math.abs(vx) > 0.7 ? 4 : (vy > 0 ? 11 : -2);
  return txt([n(m[0] + vx * gap), n(m[1] + dy)], text, anchor);
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
  const c = [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  let out = poly(P, INK, 2, LINE + '22');

  // Right-angle marks at the named vertex indices.
  for (const i of spec.rightAngles ?? [])
    out += rightAngleMark(P[i], P[(i + 1) % P.length], P[(i - 1 + P.length) % P.length]);

  // A perpendicular height, drawn dashed from the apex/top edge down to the base.
  if (spec.showHeight) {
    const topIdx = spec.heightFrom ?? (spec.shape === 'triangle' ? 2 : 3);
    const apex = m[topIdx];
    const foot = [apex[0], 0];
    const A = f.map(apex), B = f.map(foot);
    out += seg(A, B, INK, 1.3, '4 3');
    out += rightAngleMark(B, A, f.map([m[1][0], 0]), 9);
    if (spec.labels?.height) out += txt([n(A[0] + 10), n((A[1] + B[1]) / 2)], spec.labels.height, 'start');
  }

  const useNormal = spec.labelPlacement === 'normal';
  // Per-edge gap overrides, for the cases geometry makes tight: two short edges
  // meeting at an inside corner push their labels toward the same point.
  const gaps = spec.labelGaps ?? {}, pos = spec.labelPos ?? {};
  for (const [k, text] of Object.entries(spec.labels ?? {})) {
    const i = Number(k);
    if (!Number.isInteger(i)) continue;
    const [a, b] = [P[i], P[(i + 1) % P.length]];
    out += useNormal ? edgeLabelNormal(a, b, P, text, gaps[k] ?? 9, pos[k] ?? 0.5) : edgeLabel(a, b, c, text);
  }
  return frame(W, H, spec.alt, out);
}

function buildCircle(spec) {
  const W = spec.width ?? 300, H = spec.height ?? 250;
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 46;
  let out = `<circle cx="${cx}" cy="${cy}" r="${n(R)}" fill="${LINE}22" stroke="${INK}" stroke-width="2"/>`;
  out += `<circle cx="${cx}" cy="${cy}" r="3" fill="${INK}"/>`;
  if (spec.show === 'diameter') {
    out += seg([cx - R, cy], [cx + R, cy], INK, 1.6);
    out += txt([cx, cy - 8], spec.label);
  } else {
    out += seg([cx, cy], [cx + R, cy], INK, 1.6);
    out += txt([n(cx + R / 2), cy - 8], spec.label);
  }
  if (spec.sector) {
    const a1 = rad(spec.sector.startDeg), a2 = rad(spec.sector.endDeg);
    const p1 = [n(cx + R * Math.cos(-a1)), n(cy + R * Math.sin(-a1))];
    const p2 = [n(cx + R * Math.cos(-a2)), n(cy + R * Math.sin(-a2))];
    const large = Math.abs(spec.sector.endDeg - spec.sector.startDeg) > 180 ? 1 : 0;
    out += `<path d="M${cx},${cy} L${p1.join(',')} A${n(R)},${n(R)} 0 ${large} 0 ${p2.join(',')} Z" fill="${ACCENT}55" stroke="${ACCENT}" stroke-width="2"/>`;
    const mid = rad((spec.sector.startDeg + spec.sector.endDeg) / 2);
    out += txt([n(cx + R * 0.55 * Math.cos(-mid)), n(cy + R * 0.55 * Math.sin(-mid) + 4)], spec.sector.label);
  }
  return frame(W, H, spec.alt, out);
}

function buildRightTriangle(spec) {
  const W = spec.width ?? 330, H = spec.height ?? 240;
  const m = rightTriangleModel(spec);
  const f = fitter(m, W, H, 52);
  const [A, B, C] = m.map(f.map); // A = right angle, B = along base, C = up
  let out = poly([A, B, C], INK, 2, LINE + '22');
  out += rightAngleMark(A, B, C);
  const c = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
  const L = spec.labels ?? {};
  const tri = [A, B, C];
  const gaps = spec.labelGaps ?? {}, pos = spec.labelPos ?? {};
  const lab = spec.labelPlacement === 'normal'
    ? (p, q, txt, key) => edgeLabelNormal(p, q, tri, txt, gaps[key] ?? 9, pos[key] ?? 0.5)
    : (p, q, t) => edgeLabel(p, q, c, t);
  if (L.base) out += lab(A, B, L.base, 'base');
  if (L.height) out += lab(A, C, L.height, 'height');
  if (L.hypotenuse) out += lab(B, C, L.hypotenuse, 'hypotenuse');
  // Angle arcs at the two acute vertices.
  if (L.angleAtBase) out += angleArc(B, A, C, 26, L.angleAtBase);
  if (L.angleAtTop) out += angleArc(C, B, A, 26, L.angleAtTop);
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
      out += txt([n(CX + rx / 2), n(ty - 9)], L.radius);
    } else {
      out += `<ellipse cx="${CX}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${LINE}22" stroke="${INK}" stroke-width="2"/>`;
      out += `<path d="M${n(CX - rx)},${cy} L${CX},${ty} L${n(CX + rx)},${cy}" fill="${LINE}22" stroke="${INK}" stroke-width="2"/>`;
      out += seg([CX, cy], [n(CX + rx), cy], INK, 1.3, '4 3');
      out += txt([n(CX + rx / 2), n(cy - 13)], L.radius);
      if (L.slant_height) out += txt([n(CX - rx / 2 - 12), n((ty + cy) / 2)], L.slant_height, 'end');
    }
    // Height dimensioned on its own line, clear of the body, so it is unambiguous.
    const hx = n(CX + rx + 26);
    out += seg([hx, ty], [hx, cy], INK, 1.2);
    out += seg([n(hx - 4), ty], [n(hx + 4), ty], INK, 1.2);
    out += seg([n(hx - 4), cy], [n(hx + 4), cy], INK, 1.2);
    out += txt([n(hx + 7), n((ty + cy) / 2)], L.height, 'start');
  } else if (spec.shape === 'sphere') {
    const R = Math.min((base - top) / 2, (W - 150) / 2);
    const cy = (top + base) / 2;
    out += `<circle cx="${CX}" cy="${n(cy)}" r="${n(R)}" fill="${LINE}22" stroke="${INK}" stroke-width="2"/>`;
    out += `<ellipse cx="${CX}" cy="${n(cy)}" rx="${n(R)}" ry="${n(R * 0.3)}" fill="none" stroke="${INK}" stroke-width="1.1" stroke-dasharray="4 3"/>`;
    out += seg([CX, n(cy)], [n(CX + R), n(cy)], INK, 1.5);
    out += `<circle cx="${CX}" cy="${n(cy)}" r="3" fill="${INK}"/>`;
    out += txt([n(CX + R / 2), n(cy - 8)], L.radius);
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
    out += txt([n(apex[0] + 16), n((apex[1] + cen[1]) / 2)], L.height, 'start');
    out += txt([n((fl[0] + fr[0]) / 2), n(base + 20)], L.base_edge);
    if (L.slant_height) out += txt([n((apex[0] + fl[0]) / 2 - 12), n((apex[1] + base) / 2)], L.slant_height, 'end');
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
    out += txt([n((A[0] + B[0]) / 2), n(y0 + 20)], L.length);
    out += txt([n(B2[0] + 10), n((C[1] + B[1]) / 2)], L.height, 'start');
    out += txt([n((C[0] + C2[0]) / 2 - 4), n((C[1] + C2[1]) / 2 - 7)], L.depth, 'end');
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
  const Y = y => n(H - padB - oy - (y - yr[0]) * s + padT - padT);
  let out = `<g stroke="${GRID}" stroke-width="1">`;
  for (let v = Math.ceil(xr[0]); v <= xr[1]; v++) out += seg([X(v), Y(yr[0])], [X(v), Y(yr[1])], GRID, 1);
  for (let v = Math.ceil(yr[0]); v <= yr[1]; v++) out += seg([X(xr[0]), Y(v)], [X(xr[1]), Y(v)], GRID, 1);
  out += `</g>`;
  if (yr[0] <= 0 && yr[1] >= 0) out += seg([X(xr[0]), Y(0)], [X(xr[1]), Y(0)], INK, 1.6);
  if (xr[0] <= 0 && xr[1] >= 0) out += seg([X(0), Y(yr[0])], [X(0), Y(yr[1])], INK, 1.6);
  const step = (xr[1] - xr[0]) > 12 ? 2 : 1;
  out += `<g font-family="ui-sans-serif,system-ui,sans-serif" font-size="9" fill="${INK}">`;
  for (let v = Math.ceil(xr[0]); v <= xr[1]; v += step) if (v !== 0)
    out += `<text x="${X(v)}" y="${Y(0) + 11}" text-anchor="middle">${v}</text>`;
  for (let v = Math.ceil(yr[0]); v <= yr[1]; v += step) if (v !== 0)
    out += `<text x="${X(0) - 5}" y="${Y(v) + 3}" text-anchor="end">${v}</text>`;
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
  if (spec.labels?.preimage) out += txt([g.X(spec.labels.preimageAt[0]), g.Y(spec.labels.preimageAt[1])], spec.labels.preimage, 'middle', LINE, 12);
  if (spec.labels?.image) out += txt([g.X(spec.labels.imageAt[0]), g.Y(spec.labels.imageAt[1])], spec.labels.image, 'middle', ACCENT, 12);
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
  const c1 = [P1.reduce((s, p) => s + p[0], 0) / P1.length, P1.reduce((s, p) => s + p[1], 0) / P1.length];
  const c2 = [P2.reduce((s, p) => s + p[0], 0) / P2.length, P2.reduce((s, p) => s + p[1], 0) / P2.length];
  let out = poly(P1, LINE, 2.2, LINE + '25') + poly(P2, ACCENT, 2.2, ACCENT + '25');
  for (const [k, t] of Object.entries(spec.labelsSmall ?? {}))
    out += edgeLabel(P1[+k], P1[(+k + 1) % P1.length], c1, t, 13);
  for (const [k, t] of Object.entries(spec.labelsBig ?? {}))
    out += edgeLabel(P2[+k], P2[(+k + 1) % P2.length], c2, t, 13);
  return frame(W, H, spec.alt, out);
}

function buildSymmetry(spec) {
  const W = spec.width ?? 280, H = spec.height ?? 260;
  const m = polygonModel({ shape: 'regular', dims: { sides: spec.sides, r: 1 } });
  const f = fitter(m, W, H, 46);
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
  if (spec.caption) out += txt([W / 2, H - 12], spec.caption, 'middle', INK, 12);
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
  if (spec.labels?.center) out += txt([n(g.X(spec.h) - 7), n(g.Y(spec.k) + 17)], spec.labels.center, 'end', INK, 12);
  if (spec.labels?.radius) out += txt([n((g.X(spec.h) + g.X(spec.h + spec.r)) / 2), n(g.Y(spec.k) + 16)], spec.labels.radius, 'middle', INK, 12);
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

  return checks;
}
