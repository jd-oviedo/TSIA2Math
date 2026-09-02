// Lower-third caption (landscape) or top block (portrait). Text inside
// [brackets] gets an orange highlight block that wipes in. Orange is a fill
// here, never a text colour. A step chip sits above the line when `step` is set.
import { useCurrentFrame } from "remotion";
import type { Layout } from "../layout";
import { fadeIn, fadeOut, progress } from "../lib/anim";
import { C, FONT_HEADING } from "../theme";

type Part = { text: string; highlight: boolean };

const parse = (text: string): Part[] =>
  text
    .split(/(\[[^\]]+\])/)
    .filter(Boolean)
    .map((s) =>
      s.startsWith("[") ? { text: s.slice(1, -1), highlight: true } : { text: s, highlight: false },
    );

export const Highlight: React.FC<{ text: string; wipe: number; pad?: number }> = ({ text, wipe, pad = 12 }) => (
  <span style={{ position: "relative", display: "inline-block", padding: `0 ${pad}px`, whiteSpace: "nowrap" }}>
    <span
      style={{
        position: "absolute",
        left: 0,
        top: "6%",
        bottom: "2%",
        width: `${wipe * 100}%`,
        background: C.sunset,
      }}
    />
    <span style={{ position: "relative" }}>{text}</span>
  </span>
);

export const RichText: React.FC<{ text: string; wipe: number }> = ({ text, wipe }) => (
  <>
    {parse(text).map((p, i) =>
      p.highlight ? <Highlight key={i} text={p.text} wipe={wipe} /> : <span key={i}>{p.text}</span>,
    )}
  </>
);

export const StepChip: React.FC<{ step: number; size: number }> = ({ step, size }) => (
  <div
    style={{
      display: "inline-block",
      background: C.navy,
      color: C.cream,
      fontFamily: FONT_HEADING,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: "0.18em",
      lineHeight: 1,
      padding: "8px 14px 7px",
    }}
  >
    STEP {step} OF 6
  </div>
);

export const Caption: React.FC<{
  layout: Layout;
  from: number;
  to: number;
  text: string;
  step?: number;
}> = ({ layout, from, to, text, step }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const enter = fadeIn(frame, from, 8);
  const opacity = enter * fadeOut(frame, to, 6);
  const wipe = progress(frame, from + 5, 10);
  const { x, y, w } = layout.caption;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        opacity,
        transform: `translateY(${(1 - enter) * 28}px)`,
      }}
    >
      {step !== undefined ? (
        <div style={{ marginBottom: 12 }}>
          <StepChip step={step} size={layout.chipSize} />
        </div>
      ) : null}
      <div
        style={{
          fontFamily: FONT_HEADING,
          fontWeight: 700,
          fontSize: layout.captionSize,
          lineHeight: 1.16,
          color: C.midnight,
          letterSpacing: "-0.01em",
        }}
      >
        <RichText text={text} wipe={wipe} />
      </div>
    </div>
  );
};
