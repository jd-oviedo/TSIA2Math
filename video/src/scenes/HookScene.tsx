// Scene 0. A two-second hook, then the title card with the wordmark.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RichText } from "../components/Caption";
import { Wordmark } from "../components/Wordmark";
import { fadeIn, fadeOut, progress } from "../lib/anim";
import { C } from "../theme";
import { BigText, type SceneProps } from "./shared";

export const HookScene: React.FC<SceneProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const land = layout.orientation === "landscape";
  const hookIn = fadeIn(frame, 0, 8);
  const hookOp = hookIn * fadeOut(frame, 58, 6);
  const titleTop = land ? 380 : 700;
  const outro = fadeOut(frame, 150, 6);
  return (
    <AbsoluteFill style={{ background: C.sand }}>
      {frame < 60 ? (
        <BigText layout={layout} size={layout.hookSize} top={land ? 360 : 640} opacity={hookOp} lift={(1 - hookIn) * 30}>
          <RichText text="Students blocked from [Google sign-in?]" wipe={progress(frame, 6, 10)} />
        </BigText>
      ) : null}
      {frame >= 58 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: land ? 160 : 70,
              top: land ? 230 : 460,
              opacity: fadeIn(frame, 60, 12) * outro,
            }}
          >
            <Wordmark width={layout.wordmarkWidth} />
          </div>
          <BigText layout={layout} size={layout.titleSize} top={titleTop} opacity={fadeIn(frame, 68, 10) * outro} lift={(1 - fadeIn(frame, 68, 10)) * 24}>
            A new way to add students.
          </BigText>
          <BigText
            layout={layout}
            size={layout.titleSize}
            top={titleTop + layout.titleSize * 1.25}
            opacity={fadeIn(frame, 90, 10) * outro}
            lift={(1 - fadeIn(frame, 90, 10)) * 24}
          >
            <RichText text="[Follow these steps.]" wipe={progress(frame, 96, 10)} />
          </BigText>
          <BigText
            layout={layout}
            size={layout.subSize}
            top={titleTop + layout.titleSize * 2.7}
            opacity={fadeIn(frame, 108, 10) * outro}
            weight={500}
            color={C.muted}
          >
            For students who can't sign in with Google.
          </BigText>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
