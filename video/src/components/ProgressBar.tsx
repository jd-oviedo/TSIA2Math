import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Layout } from "../layout";
import { C } from "../theme";

// Thin orange bar across the top so the viewer can feel the length.
export const ProgressBar: React.FC<{ layout: Layout }> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const w = (frame / durationInFrames) * layout.width;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: layout.width, height: 8, background: C.cream }}>
      <div style={{ width: w, height: 8, background: C.sunset }} />
    </div>
  );
};
