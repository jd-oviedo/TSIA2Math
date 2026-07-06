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
 * Supported types (exactly these nine — do not extend without a spec change):
 *   polygon, polygon_comparison, right_triangle, solid_3d,
 *   bar_chart, dot_plot, box_plot, box_plot_comparison, table
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
