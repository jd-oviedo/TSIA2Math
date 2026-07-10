// Small coordinate-grid figures used by the Parent Digest and Question Game.
// "dil"  -> a shape that changed SIZE (dilation): same center, larger copy.
// "trans"-> a shape that changed POSITION (translation): same size, moved over.
// "dil2" -> a larger dilation variant used inside the question game.

type FigureKind = "dil" | "trans" | "dil2";

const LIGHT = "#AFCDD9";
const AXIS = "#5E93A5";
const OUTLINE = "#334155";
const NAVY = "#0F1E35";
const AMBER = "rgba(240,163,62,.9)";

// hexagon-ish blob used across all variants
const HEX_BIG = "0,-22 22,-9 17,17 -6,24 -24,10 -20,-12";
const HEX_SM = "0,-18 18,-7 14,14 -5,20 -20,8 -16,-10";

function Grid() {
  return (
    <>
      <rect x="0" y="0" width="120" height="90" fill="#F4F9FB" />
      <g stroke={LIGHT} strokeWidth="0.8">
        {[15, 30, 45, 75, 90, 105].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="90" />
        ))}
        {[15, 30, 60, 75].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="120" y2={y} />
        ))}
      </g>
      <g stroke={AXIS} strokeWidth="1.3">
        <line x1="60" y1="0" x2="60" y2="90" />
        <line x1="0" y1="45" x2="120" y2="45" />
      </g>
    </>
  );
}

export function GridFigure({
  kind,
  style,
}: {
  kind: FigureKind;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 120 90" style={{ width: "100%", display: "block", ...style }}>
      <Grid />
      {kind === "dil" && (
        <>
          <polygon points={HEX_BIG} transform="translate(60,45)" fill="none" stroke={OUTLINE} strokeWidth="3" strokeDasharray="7 4" />
          <polygon points={HEX_BIG} transform="translate(60,45) scale(1.5)" fill={AMBER} stroke={NAVY} strokeWidth="2" />
        </>
      )}
      {kind === "dil2" && (
        <>
          <polygon points={HEX_BIG} transform="translate(58,50) scale(0.8)" fill="none" stroke={OUTLINE} strokeWidth="3" strokeDasharray="7 4" />
          <polygon points={HEX_BIG} transform="translate(58,50) scale(1.5)" fill={AMBER} stroke={NAVY} strokeWidth="2" />
        </>
      )}
      {kind === "trans" && (
        <>
          <polygon points={HEX_SM} transform="translate(30,45)" fill="none" stroke={OUTLINE} strokeWidth="3" strokeDasharray="7 4" />
          <polygon points={HEX_SM} transform="translate(88,45)" fill={AMBER} stroke={NAVY} strokeWidth="2" />
          <defs>
            <marker id="gf-ah" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill={NAVY} />
            </marker>
          </defs>
          <path d="M52,45 L66,45" stroke={NAVY} strokeWidth="2" fill="none" markerEnd="url(#gf-ah)" />
        </>
      )}
    </svg>
  );
}

export type { FigureKind };
