// Bits several scenes share: the props type and the full-frame text card
// used by the hook, the perspective switch and the close.
import type { Layout } from "../layout";
import { C, FONT_HEADING } from "../theme";

export type SceneProps = { layout: Layout };

export const BigText: React.FC<{
  layout: Layout;
  size: number;
  top: number;
  opacity: number;
  lift?: number;
  weight?: number;
  color?: string;
  children: React.ReactNode;
}> = ({ layout, size, top, opacity, lift = 0, weight = 700, color = C.midnight, children }) => (
  <div
    style={{
      position: "absolute",
      left: layout.orientation === "landscape" ? 160 : 70,
      width: layout.width - (layout.orientation === "landscape" ? 320 : 140),
      top,
      fontFamily: FONT_HEADING,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1.12,
      letterSpacing: "-0.015em",
      color,
      opacity,
      transform: `translateY(${lift}px)`,
    }}
  >
    {children}
  </div>
);
