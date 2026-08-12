"use client";

import MathText from "./MathText";

/**
 * FigureRenderer — renders a small, closed set of TSIA2-style geometric and
 * statistical figures from structured props (no raster images, no external
 * chart libraries). One <switch> over `type`, raw SVG out.
 *
 * Colors come from the app's theme CSS variables (see app/theme/themes.ts) so
 * figures track light/dark mode:
 *   --ec-ink       lines + text (Deep Navy in light)
 *   --ec-line      axes + gridlines (border gray)
 *   --ec-accent    data marks (bars, dots, boxes)
 *   --ec-surface2  figure background (off-white)
 *
 * Supported types (exactly these twelve — do not extend without a spec change):
 *   polygon, polygon_comparison, right_triangle, solid_3d,
 *   bar_chart, line_graph, pictograph, dot_plot,
 *   box_plot, box_plot_comparison, scatterplot, table
 */

const INK = "var(--ec-ink)";
const LINE = "var(--ec-line)";
const ACCENT = "var(--ec-accent)";
const SURFACE = "var(--ec-surface2)";

interface Props {
  type: string | null;
  props: Record<string, unknown> | null | undefined;
}

// Figure labels use the app's $...$ math convention. KaTeX renders to HTML,
// which cannot live inside an SVG <text> node, so for the short expressions
// figures carry (e.g. "$x$", "$x + 1$", "$x°$") we strip the delimiters and a
// couple of common commands and render the inner text directly.
function label(raw: unknown): string {
  if (raw == null) return "";
  let s = String(raw);
  s = s.replace(/\$([^$]*)\$/g, "$1");
  s = s
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\pi/g, "π")
    .replace(/\\cdot/g, "·")
    .replace(/\\degree/g, "°")
    .replace(/\\,/g, " ")
    .replace(/[{}]/g, "");
  return s.trim();
}

const svgStyle: React.CSSProperties = {
  width: "100%",
  display: "block",
  margin: "0 auto 16px",
  background: SURFACE,
  borderRadius: "12px",
  padding: "8px",
  boxSizing: "border-box",
};

// ── nice-number axis ticks ────────────────────────────────────────────────
function niceTicks(min: number, max: number, target = 5): number[] {
  if (min === max) {
    const pad = Math.abs(min) || 1;
    min -= pad;
    max += pad;
  }
  const range = max - min;
  const rawStep = range / target;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  let step;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  step *= mag;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    // guard against float drift producing -0 or 1e-15 noise
    ticks.push(Math.round(v * 1e6) / 1e6);
  }
  return ticks;
}

// ── deterministic scatter ─────────────────────────────────────────────────
// Scatterplots need a cloud of points, but the cloud has to be identical on
// every render: Math.random() would give the server and the client different
// pictures and blow up hydration, and would redraw the figure each time the
// question re-renders. mulberry32 seeded from the panel index is pure
// arithmetic, so the same props always produce the same plot.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Point on a polyline at fraction t of its total length. Two path points give a
// straight trend, three or more give a curve (an arc, a U, a plateau), which is
// how the non-linear scatterplots are expressed without a second figure type.
function alongPath(path: [number, number][], t: number): [number, number] {
  if (path.length === 1) return path[0];
  const segs = path.length - 1;
  const scaled = Math.min(t, 0.999999) * segs;
  const i = Math.floor(scaled);
  const f = scaled - i;
  const [x1, y1] = path[i];
  const [x2, y2] = path[i + 1];
  return [x1 + (x2 - x1) * f, y1 + (y2 - y1) * f];
}

// Vertical spread as a fraction of the y-range. "none" puts every point exactly
// on the trend (a perfect line, which real data never is), so the tightest
// association still gets a little scatter.
const SCATTER_SPREAD: Record<string, number> = {
  none: 0,
  tight: 0.045,
  moderate: 0.11,
  wide: 0.24,
};

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

// Evenly spaced "nice" ticks clipped to the stated range, so an axis that runs
// 1000 to 1100 does not get labelled from 950.
function rangeTicks(min: number, max: number, target = 4): number[] {
  return niceTicks(min, max, target).filter((t) => t >= min && t <= max);
}

// ───────────────────────── polygon geometry ──────────────────────────────
type ShapeName =
  | "triangle"
  | "square"
  | "rectangle"
  | "pentagon"
  | "hexagon"
  | "parallelogram";

// Vertex point sets inside a 0..200 (x) by 0..160 (y) box.
function shapePoints(shape: ShapeName): [number, number][] {
  switch (shape) {
    case "triangle":
      return [[100, 24], [184, 140], [16, 140]];
    case "square":
      return [[55, 30], [155, 30], [155, 130], [55, 130]];
    case "rectangle":
      return [[24, 44], [176, 44], [176, 120], [24, 120]];
    case "parallelogram":
      return [[52, 34], [180, 34], [148, 130], [20, 130]];
    case "pentagon":
    case "hexagon": {
      const n = shape === "pentagon" ? 5 : 6;
      const cx = 100;
      const cy = 84;
      const r = 66;
      const pts: [number, number][] = [];
      // point-up orientation
      const rot = -Math.PI / 2;
      for (let i = 0; i < n; i++) {
        const a = rot + (2 * Math.PI * i) / n;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return pts;
    }
    default:
      return [[24, 44], [176, 44], [176, 120], [24, 120]];
  }
}

function bbox(pts: [number, number][]) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    maxX,
    minY,
    maxY,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
  };
}

function labelAnchor(
  position: string,
  b: ReturnType<typeof bbox>
): { x: number; y: number; anchor: "start" | "middle" | "end" } {
  switch (position) {
    case "top":
      return { x: b.cx, y: b.minY - 8, anchor: "middle" };
    case "bottom":
      return { x: b.cx, y: b.maxY + 20, anchor: "middle" };
    case "left":
      return { x: b.minX - 8, y: b.cy + 4, anchor: "end" };
    case "right":
      return { x: b.maxX + 8, y: b.cy + 4, anchor: "start" };
    case "diagonal":
      return { x: b.cx + 18, y: b.cy - 8, anchor: "start" };
    case "center":
    default:
      return { x: b.cx, y: b.cy + 4, anchor: "middle" };
  }
}

interface PolyLabel {
  position: string;
  text: string;
}
interface PolyMarkings {
  foldLines?: boolean;
  centerPoint?: boolean;
  rightAngle?: boolean[];
}

function renderPolygon(
  shape: ShapeName,
  labels: PolyLabel[],
  markings: PolyMarkings,
  keyPrefix = "p"
) {
  const pts = shapePoints(shape);
  const b = bbox(pts);
  const pointsStr = pts.map((p) => p.join(",")).join(" ");

  // right-angle marks: rightAngle[i] marks the i-th vertex with a small square
  const rightAngleMarks =
    markings.rightAngle?.flatMap((on, i) => {
      if (!on || i >= pts.length) return [];
      const [vx, vy] = pts[i];
      // nudge the little square toward the shape centroid
      const dx = b.cx - vx;
      const dy = b.cy - vy;
      const len = Math.hypot(dx, dy) || 1;
      const ox = (dx / len) * 12;
      const oy = (dy / len) * 12;
      return [
        <rect
          key={`${keyPrefix}-ra-${i}`}
          x={vx + (ox < 0 ? ox : 0)}
          y={vy + (oy < 0 ? oy : 0)}
          width={Math.abs(ox) || 10}
          height={Math.abs(oy) || 10}
          fill="none"
          stroke={INK}
          strokeWidth={1.3}
        />,
      ];
    }) ?? [];

  return (
    <g key={keyPrefix}>
      <polygon points={pointsStr} fill="none" stroke={INK} strokeWidth={2} />
      {markings.foldLines && (
        <line
          x1={b.cx}
          y1={b.minY - 6}
          x2={b.cx}
          y2={b.maxY + 6}
          stroke={INK}
          strokeWidth={1.3}
          strokeDasharray="5 4"
        />
      )}
      {markings.centerPoint && (
        <circle cx={b.cx} cy={b.cy} r={3.2} fill={INK} />
      )}
      {rightAngleMarks}
      {labels.map((l, i) => {
        const a = labelAnchor(l.position, b);
        return (
          <text
            key={`${keyPrefix}-l-${i}`}
            x={a.x}
            y={a.y}
            fontSize={14}
            fill={INK}
            textAnchor={a.anchor}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {label(l.text)}
          </text>
        );
      })}
    </g>
  );
}

// ──────────────────────────── the component ──────────────────────────────
export default function FigureRenderer({ type, props }: Props) {
  if (!type || !props) return null;
  const p = props as Record<string, unknown>;

  switch (type) {
    // ── polygon ───────────────────────────────────────────────────────────
    case "polygon": {
      const shape = (p.shape as ShapeName) || "rectangle";
      const labels = (p.labels as PolyLabel[]) || [];
      const markings = (p.markings as PolyMarkings) || {};
      return (
        <svg viewBox="0 0 200 168" style={{ ...svgStyle, maxWidth: "280px" }}>
          {renderPolygon(shape, labels, markings)}
        </svg>
      );
    }

    // ── polygon_comparison ─────────────────────────────────────────────────
    case "polygon_comparison": {
      const shapes =
        (p.shapes as {
          shape: ShapeName;
          labels?: PolyLabel[];
          markings?: PolyMarkings;
        }[]) || [];
      const n = Math.max(1, shapes.length);
      const cellW = 200;
      const gap = 24;
      const totalW = n * cellW + (n - 1) * gap;
      return (
        <svg
          viewBox={`0 0 ${totalW} 168`}
          style={{ ...svgStyle, maxWidth: `${Math.min(120 * n + 40, 560)}px` }}
        >
          {shapes.map((s, i) => (
            <g key={i} transform={`translate(${i * (cellW + gap)}, 0)`}>
              {renderPolygon(
                s.shape,
                s.labels || [],
                s.markings || {},
                `c${i}`
              )}
            </g>
          ))}
        </svg>
      );
    }

    // ── right_triangle ─────────────────────────────────────────────────────
    case "right_triangle": {
      const labels = (p.labels as PolyLabel[]) || [];
      const markings = (p.markings as { rightAngle?: boolean }) || {};
      // right angle at bottom-left vertex (20,140)
      const A: [number, number] = [20, 140]; // right-angle vertex
      const B: [number, number] = [20, 20]; // top (leg1 = vertical, left side)
      const C: [number, number] = [200, 140]; // right (leg2 = horizontal, base)
      const pos = (which: string): { x: number; y: number; anchor: "start" | "middle" | "end" } => {
        switch (which) {
          case "leg1":
            return { x: 10, y: 82, anchor: "end" }; // left vertical leg
          case "leg2":
            return { x: 110, y: 156, anchor: "middle" }; // bottom horizontal leg
          case "hypotenuse":
            return { x: 122, y: 74, anchor: "start" }; // diagonal
          case "angle":
            return { x: 150, y: 132, anchor: "middle" }; // near angle at C
          default:
            return { x: 110, y: 156, anchor: "middle" };
        }
      };
      // viewBox starts at x=-16 (not 0) so the left-leg label, which is
      // right-anchored at x=10 and grows leftward, has room instead of being
      // clipped flush against the SVG's left edge. Right edge (-16+236=220)
      // and all geometry stay exactly where they were.
      return (
        <svg viewBox="-16 0 236 168" style={{ ...svgStyle, maxWidth: "276px" }}>
          <polygon
            points={`${A.join(",")} ${B.join(",")} ${C.join(",")}`}
            fill="none"
            stroke={INK}
            strokeWidth={2}
          />
          {markings.rightAngle && (
            <rect
              x={20}
              y={128}
              width={12}
              height={12}
              fill="none"
              stroke={INK}
              strokeWidth={1.4}
            />
          )}
          {labels.map((l, i) => {
            const a = pos(l.position);
            return (
              <text
                key={i}
                x={a.x}
                y={a.y}
                fontSize={14}
                fill={INK}
                textAnchor={a.anchor}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {label(l.text)}
              </text>
            );
          })}
        </svg>
      );
    }

    // ── solid_3d ───────────────────────────────────────────────────────────
    case "solid_3d": {
      const shape = String(p.shape || "");
      const labels =
        (p.labels as { dimension: string; text: string }[]) || [];
      const byDim = (d: string) =>
        label(labels.find((l) => l.dimension === d)?.text);
      const txt = (
        x: number,
        y: number,
        s: string,
        anchor: "start" | "middle" | "end" = "middle"
      ) =>
        s ? (
          <text
            x={x}
            y={y}
            fontSize={14}
            fill={INK}
            textAnchor={anchor}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {s}
          </text>
        ) : null;

      let body: React.ReactNode = null;
      if (shape === "cylinder") {
        body = (
          <>
            <ellipse cx={100} cy={34} rx={54} ry={16} fill="none" stroke={INK} strokeWidth={2} />
            <path d="M46,34 V126 A54,16 0 0 0 154,126 V34" fill="none" stroke={INK} strokeWidth={2} />
            <line x1={100} y1={34} x2={154} y2={34} stroke={INK} strokeWidth={1.3} strokeDasharray="4 3" />
            {txt(126, 30, byDim("radius"))}
            <line x1={162} y1={34} x2={162} y2={126} stroke={INK} strokeWidth={1.1} />
            {txt(176, 84, byDim("height"), "start")}
          </>
        );
      } else if (shape === "cone") {
        body = (
          <>
            <ellipse cx={100} cy={126} rx={54} ry={15} fill="none" stroke={INK} strokeWidth={2} />
            <path d="M46,126 L100,26 L154,126" fill="none" stroke={INK} strokeWidth={2} />
            <line x1={100} y1={126} x2={154} y2={126} stroke={INK} strokeWidth={1.3} strokeDasharray="4 3" />
            {txt(126, 122, byDim("radius"))}
            <line x1={100} y1={26} x2={100} y2={126} stroke={INK} strokeWidth={1.1} strokeDasharray="4 3" />
            {txt(112, 80, byDim("height"), "start")}
            {txt(60, 74, byDim("slant_height"), "end")}
          </>
        );
      } else if (shape === "sphere") {
        body = (
          <>
            <circle cx={100} cy={80} r={56} fill="none" stroke={INK} strokeWidth={2} />
            <ellipse cx={100} cy={80} rx={56} ry={17} fill="none" stroke={INK} strokeWidth={1.1} strokeDasharray="4 3" />
            <line x1={100} y1={80} x2={156} y2={80} stroke={INK} strokeWidth={1.3} />
            {txt(128, 74, byDim("radius"))}
          </>
        );
      } else if (shape === "square_pyramid") {
        body = (
          <>
            {/* base (rhombus) */}
            <polygon points="40,120 100,140 160,120 100,100" fill="none" stroke={INK} strokeWidth={1.4} strokeDasharray="4 3" />
            {/* apex edges */}
            <path d="M40,120 L100,26 L160,120 M100,26 L100,140" fill="none" stroke={INK} strokeWidth={2} />
            {txt(112, 80, byDim("height"), "start")}
            {txt(126, 138, byDim("length"), "start")}
            {txt(60, 138, byDim("width"), "end")}
            {txt(70, 60, byDim("slant_height"), "end")}
          </>
        );
      } else {
        // rectangular_prism (default)
        body = (
          <>
            <rect x={30} y={54} width={110} height={80} fill="none" stroke={INK} strokeWidth={2} />
            <polygon points="30,54 60,28 170,28 140,54" fill="none" stroke={INK} strokeWidth={2} />
            <polyline points="140,54 170,28 170,108 140,134" fill="none" stroke={INK} strokeWidth={2} />
            <line x1={140} y1={108} x2={170} y2={108} stroke={INK} strokeWidth={1} strokeDasharray="3 3" />
            {txt(85, 150, byDim("length"))}
            {txt(178, 84, byDim("height"), "start")}
            {txt(118, 44, byDim("width"), "start")}
          </>
        );
      }
      return (
        <svg viewBox="0 0 200 160" style={{ ...svgStyle, maxWidth: "260px" }}>
          {body}
        </svg>
      );
    }

    // ── bar_chart ──────────────────────────────────────────────────────────
    case "bar_chart": {
      const categories = (p.categories as string[]) || [];
      const values = (p.values as number[]) || [];
      const yMax = Number(p.yAxisMax) || Math.max(1, ...values);
      const yStep = Number(p.yAxisStep) || yMax / 5;
      const xLabel = String(p.xLabel || "");
      const yLabel = String(p.yLabel || "");

      const W = 360;
      const H = 240;
      const padL = 46;
      const padR = 16;
      const padT = 16;
      const padB = 46;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;
      const n = Math.max(1, categories.length);
      const band = plotW / n;
      const barW = band * 0.6;
      const yToPx = (v: number) => padT + plotH - (v / yMax) * plotH;

      const ticks: number[] = [];
      for (let v = 0; v <= yMax + yStep / 2; v += yStep) ticks.push(v);

      return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ ...svgStyle, maxWidth: "440px" }}>
          {/* gridlines + y ticks */}
          {ticks.map((t, i) => (
            <g key={`t${i}`}>
              <line x1={padL} y1={yToPx(t)} x2={W - padR} y2={yToPx(t)} stroke={LINE} strokeWidth={1} />
              <text x={padL - 8} y={yToPx(t) + 4} fontSize={11} fill={INK} textAnchor="end">
                {Math.round(t * 100) / 100}
              </text>
            </g>
          ))}
          {/* axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={INK} strokeWidth={1.4} />
          <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke={INK} strokeWidth={1.4} />
          {/* bars */}
          {categories.map((c, i) => {
            const v = values[i] ?? 0;
            const x = padL + band * i + (band - barW) / 2;
            const y = yToPx(v);
            return (
              <g key={`b${i}`}>
                <rect x={x} y={y} width={barW} height={padT + plotH - y} fill={ACCENT} rx={2} />
                <text x={padL + band * i + band / 2} y={padT + plotH + 16} fontSize={11} fill={INK} textAnchor="middle">
                  {label(c)}
                </text>
              </g>
            );
          })}
          {/* axis labels */}
          {xLabel && (
            <text x={padL + plotW / 2} y={H - 6} fontSize={12} fill={INK} textAnchor="middle" fontWeight={600}>
              {label(xLabel)}
            </text>
          )}
          {yLabel && (
            <text
              x={14}
              y={padT + plotH / 2}
              fontSize={12}
              fill={INK}
              textAnchor="middle"
              fontWeight={600}
              transform={`rotate(-90 14 ${padT + plotH / 2})`}
            >
              {label(yLabel)}
            </text>
          )}
        </svg>
      );
    }

    // ── line_graph ─────────────────────────────────────────────────────────
    // Same prop vocabulary as bar_chart (categories/values/xLabel/yLabel/
    // yAxisMax/yAxisStep) plus yAxisMin, because a line graph may legitimately
    // start its axis above zero — the shape of the trend is what gets read off
    // it, not the height of a bar against a baseline.
    case "line_graph": {
      const categories = (p.categories as string[]) || [];
      const values = (p.values as number[]) || [];
      const yMin = Number(p.yAxisMin) || 0;
      const yMax = Number(p.yAxisMax) || Math.max(1, ...values);
      const yStep = Number(p.yAxisStep) || (yMax - yMin) / 5;
      const xLabel = String(p.xLabel || "");
      const yLabel = String(p.yLabel || "");

      const W = 380;
      const H = 250;
      const padL = 52;
      const padR = 18;
      const padT = 18;
      const padB = 50;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;
      const n = Math.max(1, categories.length);
      const band = plotW / n;
      const xToPx = (i: number) => padL + band * i + band / 2;
      const yToPx = (v: number) =>
        padT + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH;

      const ticks: number[] = [];
      for (let v = yMin; v <= yMax + yStep / 2; v += yStep) {
        ticks.push(Math.round(v * 1e6) / 1e6);
      }

      const linePts = values
        .map((v, i) => `${xToPx(i)},${yToPx(v)}`)
        .join(" ");

      return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ ...svgStyle, maxWidth: "460px" }}>
          {/* gridlines + y ticks */}
          {ticks.map((t, i) => (
            <g key={`t${i}`}>
              <line x1={padL} y1={yToPx(t)} x2={W - padR} y2={yToPx(t)} stroke={LINE} strokeWidth={1} />
              <text x={padL - 8} y={yToPx(t) + 4} fontSize={11} fill={INK} textAnchor="end">
                {Math.round(t * 100) / 100}
              </text>
            </g>
          ))}
          {/* axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={INK} strokeWidth={1.4} />
          <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke={INK} strokeWidth={1.4} />
          {/* the trend line, then its markers on top */}
          <polyline points={linePts} fill="none" stroke={ACCENT} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
          {values.map((v, i) => (
            <circle key={`m${i}`} cx={xToPx(i)} cy={yToPx(v)} r={4} fill={ACCENT} stroke={SURFACE} strokeWidth={1.4} />
          ))}
          {/* category labels */}
          {categories.map((c, i) => (
            <text key={`c${i}`} x={xToPx(i)} y={padT + plotH + 17} fontSize={11} fill={INK} textAnchor="middle">
              {label(c)}
            </text>
          ))}
          {/* axis labels */}
          {xLabel && (
            <text x={padL + plotW / 2} y={H - 8} fontSize={12} fill={INK} textAnchor="middle" fontWeight={600}>
              {label(xLabel)}
            </text>
          )}
          {yLabel && (
            <text
              x={14}
              y={padT + plotH / 2}
              fontSize={12}
              fill={INK}
              textAnchor="middle"
              fontWeight={600}
              transform={`rotate(-90 14 ${padT + plotH / 2})`}
            >
              {label(yLabel)}
            </text>
          )}
        </svg>
      );
    }

    // ── pictograph ─────────────────────────────────────────────────────────
    // One row per category, each drawn as `symbols` repeated glyphs, with the
    // key that gives a glyph its value. The count is what gets read off the
    // figure, so glyphs stay discrete and countable rather than being merged
    // into a bar.
    case "pictograph": {
      interface PictoRow {
        label: string;
        symbols: number;
      }
      const rows = (p.rows as PictoRow[]) || [];
      const symbolValue = Number(p.symbolValue) || 1;
      const unit = String(p.unit || "");
      if (!rows.length) return null;

      const maxSymbols = Math.max(1, ...rows.map((r) => r.symbols));
      const glyphW = 22;
      const glyphR = 7.5;
      const rowH = 30;
      const padL = 96;
      const padT = 12;
      const keyH = 30;
      const W = padL + maxSymbols * glyphW + 16;
      const H = padT + rows.length * rowH + keyH;

      return (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ ...svgStyle, maxWidth: `${Math.min(W + 40, 460)}px` }}
        >
          {rows.map((r, ri) => {
            const cy = padT + ri * rowH + rowH / 2;
            const glyphs = [];
            for (let k = 0; k < Math.max(0, Math.floor(r.symbols)); k++) {
              glyphs.push(
                <circle
                  key={k}
                  cx={padL + k * glyphW + glyphR}
                  cy={cy}
                  r={glyphR}
                  fill={ACCENT}
                  stroke={INK}
                  strokeWidth={0.8}
                />
              );
            }
            return (
              <g key={ri}>
                <text x={padL - 12} y={cy + 4} fontSize={12} fill={INK} textAnchor="end" fontWeight={600}>
                  {label(r.label)}
                </text>
                {glyphs}
              </g>
            );
          })}
          {/* key */}
          <line
            x1={0}
            y1={padT + rows.length * rowH + 6}
            x2={W}
            y2={padT + rows.length * rowH + 6}
            stroke={LINE}
            strokeWidth={1}
          />
          <circle cx={glyphR + 4} cy={padT + rows.length * rowH + 20} r={glyphR} fill={ACCENT} stroke={INK} strokeWidth={0.8} />
          <text x={glyphR * 2 + 12} y={padT + rows.length * rowH + 24} fontSize={12} fill={INK} textAnchor="start">
            {`= ${symbolValue}${unit ? ` ${label(unit)}` : ""}`}
          </text>
        </svg>
      );
    }

    // ── scatterplot ────────────────────────────────────────────────────────
    // One or more panels of raw points. The cloud is described by a `path` (the
    // trend the points follow, in data coordinates) plus a `scatter` band, so a
    // straight line, an arc and a U-shape are all the same mechanism with a
    // different number of path vertices — no separate figure type per pattern.
    // `points` adds stated outliers at exact coordinates on top of the cloud.
    case "scatterplot": {
      interface ScatterPanel {
        label?: string;
        xLabel?: string;
        yLabel?: string;
        xRange?: [number, number];
        yRange?: [number, number];
        path: [number, number][];
        scatter?: string;
        n?: number;
        points?: [number, number][];
        showTicks?: boolean;
      }
      const panels = (p.plots as ScatterPanel[]) || [];
      if (!panels.length) return null;
      const defXLabel = p.xLabel as string | undefined;
      const defYLabel = p.yLabel as string | undefined;
      const defXRange = p.xRange as [number, number] | undefined;
      const defYRange = p.yRange as [number, number] | undefined;
      const defShowTicks = p.showTicks as boolean | undefined;

      // A lone panel gets the whole width, which is what long axis labels like
      // "Average Daily Temperature (°F)" need — at the multi-panel width they
      // run past the viewBox and get clipped.
      const single = panels.length === 1;
      const PW = single ? 300 : 210;
      const PH = single ? 240 : 210;
      const gap = 18;
      const totalW = panels.length * PW + (panels.length - 1) * gap;

      const renderPanel = (panel: ScatterPanel, pi: number) => {
        const xLabel = panel.xLabel ?? defXLabel ?? "";
        const yLabel = panel.yLabel ?? defYLabel ?? "";
        const [xMin, xMax] = panel.xRange ?? defXRange ?? [0, 10];
        const [yMin, yMax] = panel.yRange ?? defYRange ?? [0, 10];
        const showTicks = panel.showTicks ?? defShowTicks ?? true;
        const path = panel.path || [];
        const spread = SCATTER_SPREAD[panel.scatter ?? "moderate"] ?? 0.11;
        const count = Math.max(1, panel.n ?? 14);

        const padL = showTicks ? 38 : 16;
        const padR = 10;
        const padT = panel.label ? 22 : 10;
        const padB = (showTicks ? 24 : 12) + (xLabel ? 16 : 0);
        const plotW = PW - padL - padR;
        const plotH = PH - padT - padB;
        const xToPx = (v: number) =>
          padL + ((v - xMin) / (xMax - xMin || 1)) * plotW;
        const yToPx = (v: number) =>
          padT + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH;

        // Seeded per panel so the three panels of a comparison item differ from
        // each other but never differ between two renders of the same panel.
        const rand = mulberry32(pi * 7919 + count * 31 + path.length);
        const ySpan = (yMax - yMin) || 1;
        const xSpan = (xMax - xMin) || 1;
        const cloud: [number, number][] = [];
        for (let k = 0; k < count; k++) {
          const t = count === 1 ? 0.5 : k / (count - 1);
          const [px, py] = alongPath(path, t);
          const jitterX = (rand() - 0.5) * (xSpan / count) * 0.6;
          const jitterY = (rand() - 0.5) * 2 * spread * ySpan;
          // Keep the generated cloud just inside the axes; a point sitting on
          // the axis line reads as part of the frame rather than as data.
          const inset = 0.025;
          cloud.push([
            clamp(px + jitterX, xMin + xSpan * inset, xMax - xSpan * inset),
            clamp(py + jitterY, yMin + ySpan * inset, yMax - ySpan * inset),
          ]);
        }
        // Stated outliers keep their exact coordinates — the stem names them.
        for (const pt of panel.points ?? []) cloud.push(pt);

        const xTicks = showTicks ? rangeTicks(xMin, xMax, 3) : [];
        const yTicks = showTicks ? rangeTicks(yMin, yMax, 4) : [];

        return (
          <g key={pi} transform={`translate(${pi * (PW + gap)}, 0)`}>
            {panel.label && (
              <text x={padL + plotW / 2} y={13} fontSize={12} fill={INK} textAnchor="middle" fontWeight={700}>
                {label(panel.label)}
              </text>
            )}
            {/* gridlines */}
            {yTicks.map((t, i) => (
              <line key={`gy${i}`} x1={padL} y1={yToPx(t)} x2={padL + plotW} y2={yToPx(t)} stroke={LINE} strokeWidth={1} />
            ))}
            {/* axes */}
            <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={INK} strokeWidth={1.4} />
            <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke={INK} strokeWidth={1.4} />
            {/* tick labels */}
            {yTicks.map((t, i) => (
              <text key={`ty${i}`} x={padL - 6} y={yToPx(t) + 4} fontSize={10} fill={INK} textAnchor="end">
                {Math.round(t * 100) / 100}
              </text>
            ))}
            {xTicks.map((t, i) => (
              <text key={`tx${i}`} x={xToPx(t)} y={padT + plotH + 15} fontSize={10} fill={INK} textAnchor="middle">
                {Math.round(t * 100) / 100}
              </text>
            ))}
            {/* points */}
            {cloud.map(([cx, cy], i) => (
              <circle key={`p${i}`} cx={xToPx(cx)} cy={yToPx(cy)} r={3.4} fill={ACCENT} stroke={INK} strokeWidth={0.7} />
            ))}
            {/* axis labels */}
            {xLabel && (
              <text x={padL + plotW / 2} y={PH - 3} fontSize={10.5} fill={INK} textAnchor="middle" fontWeight={600}>
                {label(xLabel)}
              </text>
            )}
            {yLabel && (
              <text
                x={10}
                y={padT + plotH / 2}
                fontSize={10.5}
                fill={INK}
                textAnchor="middle"
                fontWeight={600}
                transform={`rotate(-90 10 ${padT + plotH / 2})`}
              >
                {label(yLabel)}
              </text>
            )}
          </g>
        );
      };

      return (
        <svg
          viewBox={`0 0 ${totalW} ${PH}`}
          style={{ ...svgStyle, maxWidth: `${Math.min(250 * panels.length, 640)}px` }}
        >
          {panels.map((panel, pi) => renderPanel(panel, pi))}
        </svg>
      );
    }

    // ── dot_plot ───────────────────────────────────────────────────────────
    case "dot_plot": {
      const xValues = (p.xValues as number[]) || [];
      const counts = (p.counts as number[]) || [];
      const xLabel = String(p.xLabel || "");
      const n = Math.max(1, xValues.length);
      const maxCount = Math.max(1, ...counts);

      const W = 360;
      const padL = 30;
      const padR = 30;
      const padB = 46;
      const dotR = 7;
      const dotGap = 3;
      const axisY = 40 + maxCount * (dotR * 2 + dotGap);
      const H = axisY + padB;
      const plotW = W - padL - padR;
      const band = plotW / n;
      const xToPx = (i: number) => padL + band * i + band / 2;

      return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ ...svgStyle, maxWidth: "440px" }}>
          {/* axis */}
          <line x1={padL - 6} y1={axisY} x2={W - padR + 6} y2={axisY} stroke={INK} strokeWidth={1.4} />
          {xValues.map((xv, i) => {
            const cx = xToPx(i);
            const dots = [];
            for (let k = 0; k < (counts[i] ?? 0); k++) {
              const cy = axisY - dotR - k * (dotR * 2 + dotGap);
              dots.push(<circle key={k} cx={cx} cy={cy} r={dotR} fill={ACCENT} stroke={INK} strokeWidth={0.8} />);
            }
            return (
              <g key={i}>
                <line x1={cx} y1={axisY} x2={cx} y2={axisY + 5} stroke={INK} strokeWidth={1.2} />
                {dots}
                <text x={cx} y={axisY + 20} fontSize={12} fill={INK} textAnchor="middle">
                  {label(String(xv))}
                </text>
              </g>
            );
          })}
          {xLabel && (
            <text x={W / 2} y={H - 8} fontSize={12} fill={INK} textAnchor="middle" fontWeight={600}>
              {label(xLabel)}
            </text>
          )}
        </svg>
      );
    }

    // ── box_plot / box_plot_comparison ─────────────────────────────────────
    case "box_plot":
    case "box_plot_comparison": {
      const xLabel = String(p.xLabel || "");
      type FiveNum = {
        label?: string;
        min: number;
        q1: number;
        median: number;
        q3: number;
        max: number;
      };
      const plots: FiveNum[] =
        type === "box_plot"
          ? [
              {
                min: Number(p.min),
                q1: Number(p.q1),
                median: Number(p.median),
                q3: Number(p.q3),
                max: Number(p.max),
              },
            ]
          : ((p.plots as FiveNum[]) || []);

      const allVals = plots.flatMap((pl) => [pl.min, pl.max]);
      const dataMin = Math.min(...allVals);
      const dataMax = Math.max(...allVals);
      const ticks = niceTicks(dataMin, dataMax, 5);
      const domMin = ticks[0];
      const domMax = ticks[ticks.length - 1];

      const W = 360;
      const padL = 24;
      const padR = 24;
      const plotW = W - padL - padR;
      const xToPx = (v: number) =>
        padL + ((v - domMin) / (domMax - domMin || 1)) * plotW;

      const boxH = 34;
      const rowGap = 18;
      const topPad = 16;
      const axisExtra = 46;
      const nRows = plots.length;
      const axisY = topPad + nRows * boxH + (nRows - 1) * rowGap + 14;
      const H = axisY + axisExtra;

      const renderBox = (pl: FiveNum, idx: number) => {
        const cy = topPad + idx * (boxH + rowGap) + boxH / 2;
        const xMin = xToPx(pl.min);
        const xQ1 = xToPx(pl.q1);
        const xMed = xToPx(pl.median);
        const xQ3 = xToPx(pl.q3);
        const xMax = xToPx(pl.max);
        return (
          <g key={idx}>
            {/* whiskers */}
            <line x1={xMin} y1={cy} x2={xQ1} y2={cy} stroke={INK} strokeWidth={1.4} />
            <line x1={xQ3} y1={cy} x2={xMax} y2={cy} stroke={INK} strokeWidth={1.4} />
            <line x1={xMin} y1={cy - 9} x2={xMin} y2={cy + 9} stroke={INK} strokeWidth={1.4} />
            <line x1={xMax} y1={cy - 9} x2={xMax} y2={cy + 9} stroke={INK} strokeWidth={1.4} />
            {/* box */}
            <rect
              x={xQ1}
              y={cy - boxH / 2}
              width={Math.max(1, xQ3 - xQ1)}
              height={boxH}
              fill={ACCENT}
              fillOpacity={0.22}
              stroke={ACCENT}
              strokeWidth={1.6}
            />
            <line x1={xMed} y1={cy - boxH / 2} x2={xMed} y2={cy + boxH / 2} stroke={ACCENT} strokeWidth={2.2} />
            {pl.label && (
              <text x={padL} y={cy - boxH / 2 - 5} fontSize={11} fill={INK} textAnchor="start" fontWeight={600}>
                {label(pl.label)}
              </text>
            )}
          </g>
        );
      };

      return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ ...svgStyle, maxWidth: "440px" }}>
          {plots.map((pl, i) => renderBox(pl, i))}
          {/* shared axis */}
          <line x1={padL} y1={axisY} x2={W - padR} y2={axisY} stroke={INK} strokeWidth={1.4} />
          {ticks.map((t, i) => {
            const x = xToPx(t);
            return (
              <g key={i}>
                <line x1={x} y1={axisY} x2={x} y2={axisY + 5} stroke={INK} strokeWidth={1.1} />
                <text x={x} y={axisY + 19} fontSize={11} fill={INK} textAnchor="middle">
                  {Math.round(t * 100) / 100}
                </text>
              </g>
            );
          })}
          {xLabel && (
            <text x={W / 2} y={H - 6} fontSize={12} fill={INK} textAnchor="middle" fontWeight={600}>
              {label(xLabel)}
            </text>
          )}
        </svg>
      );
    }

    // ── table ──────────────────────────────────────────────────────────────
    // Two-way / data tables. Rendered as a real HTML <table> (not SVG) so we get
    // native accessibility and can drop KaTeX into any cell via <MathText>.
    case "table": {
      interface TableRow {
        label: string;
        values: (string | number)[];
      }
      const columnHeaders = (p.columnHeaders as string[]) || [];
      const rows = (p.rows as TableRow[]) || [];
      const highlightRow = p.highlightRow as string | undefined;
      const highlightCol =
        typeof p.highlightCol === "number" ? p.highlightCol : undefined;
      if (!rows.length) return null;

      const cellBase: React.CSSProperties = {
        border: `1px solid ${LINE}`,
        padding: "9px 16px",
        fontSize: "14px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        color: INK,
      };

      return (
        <div style={{ overflowX: "auto", margin: "0 auto 16px", maxWidth: "100%" }}>
          <table
            style={{
              borderCollapse: "collapse",
              margin: "0 auto",
              background: "var(--ec-surface)",
              borderRadius: "8px",
            }}
          >
            {columnHeaders.length > 0 && (
              <thead>
                <tr>
                  {columnHeaders.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        ...cellBase,
                        background: SURFACE,
                        fontWeight: 700,
                        textAlign: i === 0 ? "left" : "center",
                        ...(highlightCol === i
                          ? { background: "var(--ec-accent-soft)" }
                          : {}),
                      }}
                    >
                      <MathText text={String(h)} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row, ri) => {
                const rowHi = highlightRow != null && row.label === highlightRow;
                return (
                  <tr
                    key={ri}
                    style={rowHi ? { background: "var(--ec-accent-soft)" } : undefined}
                  >
                    {/* row-label cell — behaves like a header column */}
                    <th
                      scope="row"
                      style={{
                        ...cellBase,
                        background: rowHi ? "var(--ec-accent-soft)" : SURFACE,
                        fontWeight: rowHi ? 700 : 600,
                        textAlign: "left",
                      }}
                    >
                      <MathText text={String(row.label)} />
                    </th>
                    {row.values.map((v, ci) => {
                      const colHi = highlightCol === ci + 1;
                      return (
                        <td
                          key={ci}
                          style={{
                            ...cellBase,
                            textAlign: "center",
                            fontWeight: rowHi ? 700 : 400,
                            ...(colHi && !rowHi
                              ? { background: "var(--ec-accent-soft)" }
                              : {}),
                          }}
                        >
                          <MathText text={String(v)} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    default:
      return null;
  }
}
