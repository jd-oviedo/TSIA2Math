// A plain pointer that eases between keyframes (UI pixels). Each click is a
// short orange ring pulse and a small press on the pointer.
import { interpolate, useCurrentFrame } from "remotion";
import { pointAt, type Keyed } from "../lib/anim";
import type { Point } from "../lib/geometry";
import { C } from "../theme";

export type CursorKey = Keyed<Point>;
export const at = (frame: number, x: number, y: number): CursorKey => ({ frame, value: { x, y } });

const RING_LEN = 18;

export const Cursor: React.FC<{ path: CursorKey[]; clicks?: number[]; appearAt?: number }> = ({
  path,
  clicks = [],
  appearAt = 0,
}) => {
  const frame = useCurrentFrame();
  const pos = pointAt(frame, path);
  const pressed = clicks.some((c) => frame >= c && frame < c + 5);
  const opacity = interpolate(frame, [appearAt, appearAt + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity }}>
      {clicks.map((c) => {
        if (frame < c || frame > c + RING_LEN) return null;
        const p = (frame - c) / RING_LEN;
        const r = 8 + p * 30;
        return (
          <div
            key={c}
            style={{
              position: "absolute",
              left: pos.x - r,
              top: pos.y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `3px solid ${C.sunset}`,
              opacity: 1 - p,
            }}
          />
        );
      })}
      <svg
        width={26}
        height={30}
        viewBox="0 0 13 19"
        style={{
          position: "absolute",
          left: pos.x - 1,
          top: pos.y - 1,
          transform: `scale(${pressed ? 0.86 : 1})`,
          transformOrigin: "0 0",
        }}
      >
        <path
          d="M0.5 0.5 L0.5 16 L4.6 12.4 L7.4 18.4 L9.9 17.3 L7.1 11.4 L12.4 11.4 Z"
          fill={C.midnight}
          stroke="#FFFFFF"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
