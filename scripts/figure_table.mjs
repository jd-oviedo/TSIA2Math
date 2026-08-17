// figure_table.mjs -- render a data table or a pictograph as an SVG image.
//
// WHY A TABLE HAS TO BE AN IMAGE AT ALL
// -------------------------------------
// `upload_curriculum.py:209` collapses an item stem onto one line:
//
//     stem = re.sub(r'\s*\n\s*', ' ', stem).strip()
//
// A markdown table needs its line structure, so by the time a stem reaches the
// renderer the table is gone and the pipes arrive as literal text. A markdown
// IMAGE is a single-line construct and survives that collapse untouched, which is
// why figures work inside item stems and tables do not. Rendering the table as an
// image is therefore not a style choice; it is the only form that reaches a
// student inside an item.
//
// WHY THIS IS A NEW TOP-LEVEL TYPE AND NOT AN ARRAY ON coordinate_plane
// ----------------------------------------------------------------------
// Bars and box plots were marks on a numeric axis, so forking buildSvg would have
// duplicated the axis and re-created the gridPlane drift (#108). A table has no
// axis at all: no scales, no tick ladder, no data-to-pixel map, and nothing for
// verifyPlane to invert. It reuses only module-level utilities -- the palette,
// esc, n, the canvas width convention, the mandatory alt -- so there is no shared
// machinery to fork.
//
// MOBILE, MEASURED RATHER THAN ASSUMED
// -------------------------------------
// An <img> gets no rehypeScrollableTables wrapper, so the table cannot scroll and
// must FIT. Measured on the live page: a 340-wide figure renders at 250px on a
// 320px viewport, a scale of 0.735. Width is therefore fixed at 340 and never
// wider, because a wider canvas scales down further and reads smaller, not larger.
// See the legibility table in make_figure.mjs beside the bounds-check note.
//
// The builder THROWS when the columns do not fit, rather than shipping a table
// that overflows or silently shrinks. An author shortens a label; the figure never
// degrades quietly.
const INK = '#0E0E11';
const LINE = '#6E9DC8';
const ACCENT = '#F0A33E';
const SURFACE = '#F7F3E7';
const GRID = '#E2DCCA';

const CANVAS_W = 340;
const MARGIN = 12;
const USABLE = CANVAS_W - 2 * MARGIN;      // 316
const FONT = 11;
const ROW_H = 24;
const KEY_H = 22;
const CELL_PAD = 10;
// Upper bound on average character width at font-size 11 in the SVG font stack.
// Measured strings: "Did not study" 13 chars / 74px, "Science Fiction" 15 / 82,
// "Passed" 6 / 38, "Total" 5 / 26. The widest per-character case measured is 6.33,
// so 6.2 slightly OVER-estimates long strings. That is the safe direction: the
// builder throws a little early rather than shipping a table that overflows.
const CHAR_W = 6.2;
const SYM_R = 6.5;                          // drawn glyph radius
const SYM_STEP = 2 * SYM_R + 3;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v) => Math.round(v * 100) / 100;

// A five-pointed star as an explicit polygon rather than the character U+2605.
//
// The whole point of a pictograph is COUNTING SYMBOLS, and a text glyph makes that
// countable only as characters: its width depends on the viewer's font stack, a
// fallback changes its size silently, and a symbol drawn at the wrong scale still
// reads as one character. Drawn as a path, every symbol carries its own geometry,
// so the verifier can check the count AND that each glyph is the right size in the
// right place.
export function starPath(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${n(cx + rad * Math.cos(a))} ${n(cy + rad * Math.sin(a))}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

const textWidth = (s) => String(s).length * CHAR_W;

function layout(spec) {
  const cols = spec.columns ?? [];
  const rows = spec.rows ?? [];
  if (cols.length < 2) throw new Error('a data_table needs at least a label column and one data column');
  if (!rows.length) throw new Error('a data_table needs at least one row');

  const isPict = rows.some((r) => r.symbols !== undefined);
  for (const [i, r] of rows.entries()) {
    const hasCells = Array.isArray(r.cells);
    const hasSyms = r.symbols !== undefined;
    if (hasCells && hasSyms)
      throw new Error(`row ${i} ("${r.label}") declares both cells and symbols: a row is one or the other`);
    if (!hasCells && !hasSyms)
      throw new Error(`row ${i} ("${r.label}") declares neither cells nor symbols`);
    if (!r.label) throw new Error(`row ${i} has no label`);
    if (hasCells && r.cells.length !== cols.length - 1)
      throw new Error(`row ${i} ("${r.label}") has ${r.cells.length} cells for ${cols.length - 1} data column(s)`);
  }
  if (isPict) {
    if (cols.length !== 2) throw new Error('a pictograph has exactly two columns: the label and the symbols');
    if (!spec.key || typeof spec.key.value !== 'number' || !spec.key.symbol)
      throw new Error('a pictograph must declare a key with a symbol and a numeric value');
  }

  // Column widths from content, the way padding() already sizes the plot's left
  // margin from its widest tick label.
  const widths = cols.map((c, ci) => {
    let w = textWidth(c);
    for (const r of rows) {
      if (ci === 0) w = Math.max(w, textWidth(r.label));
      else if (r.cells) w = Math.max(w, textWidth(r.cells[ci - 1]));
      else w = Math.max(w, r.symbols * SYM_STEP);
    }
    return w + CELL_PAD;
  });
  const total = widths.reduce((a, b) => a + b, 0);
  if (total > USABLE)
    throw new Error(
      `table is ${n(total)}px wide and the usable width is ${USABLE}px. `
      + `Shorten a label or drop a column; the canvas is fixed at ${CANVAS_W} because a wider `
      + `one scales down further on a phone and reads smaller, not larger.`);

  const height = MARGIN * 2 + ROW_H * (rows.length + 1) + (spec.key ? KEY_H : 0);
  return { cols, rows, widths, total, height, isPict };
}

export function buildTable(spec) {
  const { cols, rows, widths, height, isPict } = layout(spec);
  if (!spec.alt) throw new Error('spec.alt is required: the figure supplements the text, it never replaces it');

  const x0 = MARGIN;
  const edges = [x0];
  for (const w of widths) edges.push(n(edges[edges.length - 1] + w));
  const y0 = MARGIN;
  const yEdge = (r) => n(y0 + r * ROW_H);

  const parts = [`<rect width="${CANVAS_W}" height="${height}" fill="${SURFACE}" rx="10"/>`];

  // Header band, so the header row reads as a header without relying on weight alone.
  parts.push(`<rect x="${x0}" y="${y0}" width="${n(edges[edges.length - 1] - x0)}" height="${ROW_H}" fill="${LINE}" fill-opacity="0.18"/>`);

  // The grid. Emitted as tagged lines because the verifier recovers the row and
  // column bands from THESE, not from the arithmetic above.
  parts.push(`<g stroke="${GRID}" stroke-width="1">`);
  edges.forEach((x, i) =>
    parts.push(`<line data-vline="${i}" x1="${x}" y1="${yEdge(0)}" x2="${x}" y2="${yEdge(rows.length + 1)}"/>`));
  for (let r = 0; r <= rows.length + 1; r++)
    parts.push(`<line data-hline="${r}" x1="${x0}" y1="${yEdge(r)}" x2="${edges[edges.length - 1]}" y2="${yEdge(r)}"/>`);
  parts.push(`</g>`);

  parts.push(`<g font-family="ui-sans-serif,system-ui,sans-serif" font-size="${FONT}" fill="${INK}">`);
  // Header row.
  cols.forEach((c, ci) => {
    if (!String(c).length) return;
    parts.push(`<text data-head="${ci}" x="${n(edges[ci] + CELL_PAD / 2)}" y="${n(yEdge(0) + ROW_H / 2 + 4)}" font-weight="700">${esc(c)}</text>`);
  });
  // Body.
  rows.forEach((r, ri) => {
    const y = n(yEdge(ri + 1) + ROW_H / 2 + 4);
    parts.push(`<text data-cell="${ri}-0" x="${n(edges[0] + CELL_PAD / 2)}" y="${y}" font-weight="600">${esc(r.label)}</text>`);
    if (r.cells) {
      r.cells.forEach((v, ci) =>
        parts.push(`<text data-cell="${ri}-${ci + 1}" x="${n(edges[ci + 1] + CELL_PAD / 2)}" y="${y}">${esc(v)}</text>`));
    } else {
      const cy = n(yEdge(ri + 1) + ROW_H / 2);
      for (let k = 0; k < r.symbols; k++) {
        const cx = n(edges[1] + CELL_PAD / 2 + SYM_R + k * SYM_STEP);
        parts.push(`<path data-symbol="${ri}-${k}" d="${starPath(cx, cy, SYM_R)}" fill="${ACCENT}" stroke="${INK}" stroke-width="0.6"/>`);
      }
    }
  });
  // The key, drawn inside the image so a student who ignores it has ignored
  // something that was on the page. pictograph_key_not_applied depends on it.
  if (spec.key) {
    const ky = n(yEdge(rows.length + 1) + KEY_H / 2 + 5);
    const kx = n(x0 + SYM_R + 2);
    parts.push(`<path data-keysymbol="0" d="${starPath(kx, n(ky - 4), SYM_R)}" fill="${ACCENT}" stroke="${INK}" stroke-width="0.6"/>`);
    const label = spec.key.label ?? `= ${spec.key.value}`;
    parts.push(`<text data-key="1" x="${n(kx + SYM_R + 5)}" y="${ky}" font-weight="600">${esc(label)}</text>`);
  }
  parts.push(`</g>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_W} ${height}" width="${CANVAS_W}" height="${height}" role="img" aria-label="${esc(spec.alt)}">${parts.join('')}</svg>`;
}

// Every labelled quantity recomputed from the EMITTED GEOMETRY.
//
// Row and column bands come from the drawn grid lines, never from the layout
// arithmetic, so a cell placed in the wrong band is caught even though the
// builder and the verifier share a file. Symbol counts come from the drawn paths,
// and each glyph's bounding box is measured out of its own path data, so a symbol
// drawn at the wrong scale or dropped out of its row fails even when the COUNT is
// right. That is the failure the drawn-path decision exists to make visible.
export function verifyTable(spec, svg) {
  const checks = [];
  const add = (name, actual, expected, tol = 0) =>
    checks.push({ name, actual: +Number(actual).toFixed(4), expected: +Number(expected).toFixed(4), ok: Math.abs(actual - expected) <= tol });

  const cols = spec.columns ?? [];
  const rows = spec.rows ?? [];
  const vx = [...svg.matchAll(/<line data-vline="(\d+)" x1="([-\d.]+)"/g)].map((m) => Number(m[2])).sort((a, b) => a - b);
  const hy = [...svg.matchAll(/<line data-hline="(\d+)" x1="[-\d.]+" y1="([-\d.]+)"/g)].map((m) => Number(m[2])).sort((a, b) => a - b);
  add('column boundaries drawn', vx.length, cols.length + 1);
  add('row boundaries drawn', hy.length, rows.length + 2);
  if (vx.length < 2 || hy.length < 2) return checks;

  const bandOf = (v, edges) => edges.findIndex((e, i) => i < edges.length - 1 && v >= e - 0.01 && v < edges[i + 1] + 0.01);

  const cells = [...svg.matchAll(/<text data-cell="(\d+)-(\d+)" x="([-\d.]+)" y="([-\d.]+)"[^>]*>([^<]*)<\/text>/g)];
  const declared = rows.reduce((a, r) => a + 1 + (r.cells ? r.cells.length : 0), 0);
  add('every declared cell drawn', cells.length, declared);

  for (const m of cells) {
    const [ri, ci, x, y, text] = [+m[1], +m[2], +m[3], +m[4], m[5]];
    const want = ci === 0 ? rows[ri]?.label : rows[ri]?.cells?.[ci - 1];
    add(`cell ${ri}-${ci} text`, text === esc(String(want)) ? 1 : 0, 1);
    // The label anchors half a pad inside its column, so the band test uses the
    // anchor itself: it must fall in the column it claims.
    add(`cell ${ri}-${ci} in column ${ci}`, bandOf(x, vx), ci);
    add(`cell ${ri}-${ci} in row ${ri}`, bandOf(y - ROW_H / 2 - 4 + ROW_H / 2, hy), ri + 1);
  }

  cols.forEach((c, ci) => {
    if (!String(c).length) return;
    const m = svg.match(new RegExp(`<text data-head="${ci}" x="([-\\d.]+)" y="([-\\d.]+)"[^>]*>([^<]*)</text>`));
    if (!m) return add(`header ${ci} drawn`, 0, 1);
    add(`header ${ci} text`, m[3] === esc(String(c)) ? 1 : 0, 1);
    add(`header ${ci} in column ${ci}`, bandOf(Number(m[1]), vx), ci);
  });

  // Pictograph symbols, measured as geometry.
  const bbox = (d) => {
    const nums = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
    const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
    return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys),
             cx: (Math.max(...xs) + Math.min(...xs)) / 2, cy: (Math.max(...ys) + Math.min(...ys)) / 2 };
  };
  const nominal = bbox(starPath(0, 0, SYM_R));
  rows.forEach((r, ri) => {
    if (r.symbols === undefined) return;
    const syms = [...svg.matchAll(new RegExp(`<path data-symbol="${ri}-(\\d+)" d="([^"]+)"`, 'g'))];
    add(`row ${ri} symbol count`, syms.length, r.symbols);
    for (const s of syms) {
      const b = bbox(s[2]);
      add(`row ${ri} symbol ${s[1]} width`, b.w, nominal.w, 0.05);
      add(`row ${ri} symbol ${s[1]} height`, b.h, nominal.h, 0.05);
      add(`row ${ri} symbol ${s[1]} in the symbols column`, bandOf(b.cx, vx), 1);
      add(`row ${ri} symbol ${s[1]} in row ${ri}`, bandOf(b.cy, hy), ri + 1);
    }
    // The key is a claim about what each symbol is worth. If the row declares a
    // total, the DRAWN symbols must produce it.
    if (spec.key && r.total !== undefined)
      add(`row ${ri} drawn symbols times key equals its total`, syms.length * spec.key.value, r.total);
  });
  if (spec.key) {
    const k = [...svg.matchAll(/<path data-keysymbol="\d+" d="([^"]+)"/g)];
    add('key symbol drawn', k.length, 1);
    if (k.length) add('key symbol is the same size as a row symbol', bbox(k[0][1]).w, nominal.w, 0.05);
  }
  return checks;
}

export const TABLE_TYPES = ['data_table'];
