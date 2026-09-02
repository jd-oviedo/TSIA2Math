// The student home after sign-in: "You're in 1st period." and the diagnostic
// card. Column kept narrow so the portrait camera can frame it whole.
import { DEMO_CLASS } from "../demo-data";
import { C, FONT_BODY } from "../theme";
import { Wordmark } from "../components/Wordmark";
import { Btn, Eyebrow, H } from "./primitives";
import { UI } from "../components/Screen";

export const StudentDashboard: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: UI.w, height: UI.h, background: C.pageBg, overflow: "hidden", fontFamily: FONT_BODY }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: UI.w,
        height: 64,
        background: C.white,
        borderBottom: `1px solid ${C.line}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
      }}
    >
      <Wordmark width={110} />
      <div style={{ display: "flex", gap: 24, fontSize: 14, color: C.muted }}>
        <span style={{ color: C.ink, fontWeight: 700, borderBottom: `2px solid ${C.sunset}`, paddingBottom: 2 }}>Home</span>
        <span>Course</span>
        <span>Sign out</span>
      </div>
    </div>
    <div style={{ position: "absolute", left: 140, top: 100, width: 620 }}>
      <H size={30}>Home</H>
      <div style={{ marginTop: 6, fontSize: 15, color: C.muted }}>You're in {DEMO_CLASS.name}.</div>
      <div
        style={{
          marginTop: 24,
          background: C.white,
          border: `1px solid ${C.line}`,
          borderTop: `3px solid ${C.sunset}`,
          padding: "26px 28px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Eyebrow style={{ color: C.dim }}>Start with this</Eyebrow>
          <span style={{ fontSize: 12.5, color: C.dim, textDecoration: "underline" }}>Not now</span>
        </div>
        <H size={23} style={{ marginTop: 14 }}>
          Find out where you are
        </H>
        <div style={{ marginTop: 8, fontSize: 15, color: C.muted, lineHeight: 1.55, maxWidth: 560 }}>
          A short diagnostic finds where you are in the course, so you start in the right place.
        </div>
        <Btn variant="primary" style={{ marginTop: 18, fontSize: 15, padding: "0 22px" }}>
          Begin Diagnostic
        </Btn>
      </div>
      <div style={{ marginTop: 18, background: C.white, border: `1px solid ${C.line}`, padding: "22px 24px" }}>
        <H size={18}>Course progress</H>
        <div style={{ marginTop: 4, fontSize: 13.5, color: C.muted }}>Your course progress and where to pick back up.</div>
        {["Unit 1 · Quantitative Reasoning", "Unit 2 · Algebraic Reasoning", "Unit 3 · Geometric and Spatial Reasoning"].map((u) => (
          <div key={u} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${C.hairline}`, fontSize: 14, marginTop: 4 }}>
            <span>{u}</span>
            <span style={{ color: C.dim }}>Not started</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
