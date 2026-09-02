// The "camera". UI mocks are drawn at a fixed 1440x900 and this component
// scales and pans them so `focus` (a rect in UI pixels) fills the layout's
// screen viewport. Animate `focus` to punch in on a click target.
import type { Layout } from "../layout";
import type { Rect } from "../lib/geometry";
import { C, FONT_BODY } from "../theme";

export const UI = { w: 1440, h: 900 };
export const UI_RECT: Rect = { x: 0, y: 0, w: UI.w, h: UI.h };

export const Screen: React.FC<{
  layout: Layout;
  focus: Rect;
  opacity?: number;
  children: React.ReactNode;
}> = ({ layout, focus, opacity = 1, children }) => {
  const vp = layout.screen;
  // Fit the focus rect, but never let the UI be smaller than the viewport in
  // either direction: the camera may zoom in, never out past the page edge.
  const fit = Math.min(vp.w / focus.w, vp.h / focus.h);
  const s = Math.max(fit, vp.w / UI.w, vp.h / UI.h);
  // Centre the focus rect, then clamp so the viewport never shows past the
  // edge of the UI (a white band) when the scaled UI is larger than it.
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const rawX = vp.w / 2 - (focus.x + focus.w / 2) * s;
  const rawY = vp.h / 2 - (focus.y + focus.h / 2) * s;
  const tx = clamp(rawX, vp.w - UI.w * s, 0);
  const ty = clamp(rawY, vp.h - UI.h * s, 0);
  return (
    <div
      style={{
        position: "absolute",
        left: vp.x,
        top: vp.y,
        width: vp.w,
        height: vp.h,
        overflow: "hidden",
        background: C.white,
        borderTop: `1px solid ${C.line}`,
        borderBottom: `1px solid ${C.line}`,
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: UI.w,
          height: UI.h,
          transform: `translate(${tx}px, ${ty}px) scale(${s})`,
          transformOrigin: "0 0",
          fontFamily: FONT_BODY,
          color: C.ink,
        }}
      >
        {children}
      </div>
    </div>
  );
};
