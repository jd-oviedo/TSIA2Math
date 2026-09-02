// Scene 7. Cream, wordmark, the one-line takeaway and the accurate small print.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RichText } from "../components/Caption";
import { Wordmark } from "../components/Wordmark";
import { fadeIn, progress } from "../lib/anim";
import { C } from "../theme";
import { BigText, type SceneProps } from "./shared";

export const CloseScene: React.FC<SceneProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const land = layout.orientation === "landscape";
  const top = land ? 380 : 700;
  return (
    <AbsoluteFill style={{ background: C.sand }}>
      <div style={{ position: "absolute", left: land ? 160 : 70, top: land ? 230 : 460, opacity: fadeIn(frame, 0, 10) }}>
        <Wordmark width={layout.wordmarkWidth} />
      </div>
      <BigText layout={layout} size={layout.titleSize} top={top} opacity={fadeIn(frame, 10, 10)} lift={(1 - fadeIn(frame, 10, 10)) * 24}>
        <RichText text="A whole class, [added in one paste.]" wipe={progress(frame, 18, 12)} />
      </BigText>
      <BigText layout={layout} size={layout.subSize} top={top + layout.titleSize * 2.7} opacity={fadeIn(frame, 40, 10)} weight={500} color={C.muted}>
        The code is each student's password. Shown once. Save the CSV.
      </BigText>
    </AbsoluteFill>
  );
};
