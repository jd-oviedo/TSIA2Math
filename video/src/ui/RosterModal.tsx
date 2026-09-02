// The "Add a student" modal with its three tabs, the roster paste flow, and
// the results panel with the sign-in codes. Geometry is fixed (heights below)
// so scenes can aim the cursor at the tab, the Add button and Download CSV.
import { DEMO_STUDENTS, type DemoStudent } from "../demo-data";
import type { Point } from "../lib/geometry";
import { C, FONT_MONO } from "../theme";
import { Btn, H } from "./primitives";
import { UI } from "../components/Screen";

export const MODAL = { x: 360, y: 90, w: 720, pad: 28 };
const INNER = MODAL.w - MODAL.pad * 2; // 664
const CANCEL_W = 200;
const ADD_W = INNER - CANCEL_W - 12;
const TABS_Y = MODAL.y + MODAL.pad + 40 + 20; // 178
export const TAB_CENTER = (i: number): Point => ({
  x: MODAL.x + MODAL.pad + (INNER / 3) * (i + 0.5),
  y: TABS_Y + 22,
});
// Cancel + gap 12 + Add. Add button centre.
export const ADD_CENTER = (preview: boolean): Point => ({
  x: MODAL.x + MODAL.pad + CANCEL_W + 12 + ADD_W / 2,
  y: preview ? 726 : 544,
});
export const DOWNLOAD_CENTER: Point = { x: MODAL.x + MODAL.w / 2, y: 314 };

export type Stage = "invite" | "roster" | "results";

const TABS = ["Send invite", "Add with code", "Add roster"];

const Overlay: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: UI.w, height: UI.h, background: C.overlay, opacity }} />
);

const Tabs: React.FC<{ active: number }> = ({ active }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", height: 44 }}>
    {TABS.map((t, i) => (
      <div
        key={t}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14.5,
          fontWeight: i === active ? 700 : 500,
          color: i === active ? C.heading : C.muted,
          border: i === active ? `2px solid ${C.navy}` : `1px solid ${C.line}`,
          background: i === active ? C.white : C.subtle,
        }}
      >
        {t}
      </div>
    ))}
  </div>
);

const Close: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 16 16">
    <path d="M2 2l12 12M14 2L2 14" stroke={C.ink} strokeWidth={1.6} />
  </svg>
);

const InviteBody: React.FC = () => (
  <div>
    <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, height: 60 }}>
      Enter a student email. If they already have an account they'll be enrolled immediately. Otherwise they'll
      receive an invite link.
    </div>
    <div
      style={{
        height: 44,
        border: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        color: C.placeholder,
        fontSize: 14,
        marginTop: 12,
      }}
    >
      student@district.edu
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
      <Btn>Send invite</Btn>
    </div>
  </div>
);

const RosterBody: React.FC<{ lines: string[]; preview: number; addLabel: string; pressed: boolean }> = ({
  lines,
  preview,
  addLabel,
  pressed,
}) => (
  <div>
    <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, height: 88 }}>
      One student per line: name, then email. Paste straight from a spreadsheet or type the list with commas. A
      spreadsheet with separate first and last name columns works too. Every account is created at once and you get
      the sign-in codes back as a table and a CSV.
    </div>
    <div
      style={{
        marginTop: 12,
        height: 160,
        border: `1px solid ${C.border}`,
        padding: "12px 14px",
        fontFamily: FONT_MONO,
        fontSize: 13,
        lineHeight: 1.75,
        color: lines.length ? C.ink : C.placeholder,
        whiteSpace: "pre",
        overflow: "hidden",
      }}
    >
      {lines.length
        ? lines.join("\n")
        : `${DEMO_STUDENTS[0].name}    ${DEMO_STUDENTS[0].email}\n${DEMO_STUDENTS[1].name}, ${DEMO_STUDENTS[1].email}`}
    </div>
    {preview > 0 ? (
      <div style={{ marginTop: 16, height: 166, opacity: preview, transform: `translateY(${(1 - preview) * 12}px)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 28 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>{DEMO_STUDENTS.length} ready</span>
          <span style={{ fontSize: 12, color: C.dim }}>Check the list, then add them.</span>
        </div>
        <div style={{ border: `1px solid ${C.line}` }}>
          {DEMO_STUDENTS.map((s, i) => (
            <div
              key={s.email}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 170px 1fr 70px",
                alignItems: "center",
                height: 34,
                padding: "0 10px",
                borderTop: i === 0 ? "none" : `1px solid ${C.hairline}`,
                fontSize: 13,
              }}
            >
              <span style={{ color: C.dim }}>{i + 1}</span>
              <span style={{ fontWeight: 600 }}>{s.name}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.muted }}>{s.email}</span>
              <span style={{ color: C.green, fontWeight: 700, textAlign: "right" }}>Ready</span>
            </div>
          ))}
        </div>
      </div>
    ) : null}
    <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
      <Btn style={{ width: CANCEL_W }}>Cancel</Btn>
      <Btn variant={pressed ? "pressed" : "primary"} style={{ width: ADD_W }}>
        {addLabel}
      </Btn>
    </div>
  </div>
);

const ResultsBody: React.FC<{ rows: DemoStudent[]; rowsShown: number; pulse: number | null }> = ({
  rows,
  rowsShown,
  pulse,
}) => (
  <div>
    <div style={{ fontSize: 15, fontWeight: 700, height: 22 }}>{rows.length} accounts created</div>
    <div style={{ fontSize: 13, color: C.dim, height: 20, marginTop: 4 }}>{rows.length} lines submitted</div>
    <div style={{ marginTop: 12, height: 44, fontSize: 13.5, fontWeight: 600, color: C.warn, lineHeight: 1.55 }}>
      Save these codes now. They are the students' passwords, they are not shown again, and nobody can look them up
      later.
    </div>
    <div style={{ position: "relative", marginTop: 12 }}>
      {pulse !== null ? (
        <div
          style={{
            position: "absolute",
            inset: -(pulse * 10),
            border: `2px solid ${C.sunset}`,
            opacity: 1 - pulse,
          }}
        />
      ) : null}
      <Btn variant="primary" style={{ width: "100%" }}>
        Download CSV
      </Btn>
    </div>
    <div style={{ marginTop: 12, border: `1px solid ${C.line}` }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "142px 1fr 96px 64px 122px",
          height: 32,
          alignItems: "center",
          padding: "0 10px",
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: C.muted,
          background: C.subtle,
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <span>NAME</span>
        <span>EMAIL</span>
        <span>ACCOUNT</span>
        <span>IN CLASS</span>
        <span>CODE</span>
      </div>
      {rows.map((s, i) => (
        <div
          key={s.email}
          style={{
            display: "grid",
            gridTemplateColumns: "142px 1fr 96px 64px 122px",
            alignItems: "center",
            height: 34,
            padding: "0 10px",
            borderTop: i === 0 ? "none" : `1px solid ${C.hairline}`,
            fontSize: 13,
            opacity: i < rowsShown ? 1 : 0,
          }}
        >
          <span style={{ fontWeight: 600 }}>{s.name}</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.muted }}>{s.email}</span>
          <span style={{ color: C.green, fontWeight: 700 }}>New account</span>
          <span style={{ color: C.green, fontWeight: 700 }}>Yes</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, letterSpacing: "0.04em" }}>{s.code}</span>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 16 }}>
      <Btn style={{ width: "100%" }}>Done</Btn>
    </div>
  </div>
);

export const RosterModal: React.FC<{
  stage: Stage;
  activeTab: number;
  lines?: string[];
  preview?: number;
  addLabel?: string;
  pressed?: boolean;
  rowsShown?: number;
  pulse?: number | null;
  opacity?: number;
  lift?: number;
}> = ({
  stage,
  activeTab,
  lines = [],
  preview = 0,
  addLabel = "Add students",
  pressed = false,
  rowsShown = DEMO_STUDENTS.length,
  pulse = null,
  opacity = 1,
  lift = 0,
}) => {
  const title = stage === "invite" ? "Add a student" : "Add a roster";
  return (
    <>
      <Overlay opacity={opacity} />
      <div
        style={{
          position: "absolute",
          left: MODAL.x,
          top: MODAL.y,
          width: MODAL.w,
          padding: MODAL.pad,
          background: C.white,
          border: `1px solid ${C.line}`,
          opacity,
          transform: `translateY(${lift}px)`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 40 }}>
          <H size={20}>{title}</H>
          <Close />
        </div>
        {stage === "results" ? (
          <div style={{ marginTop: 20 }}>
            <ResultsBody rows={DEMO_STUDENTS} rowsShown={rowsShown} pulse={pulse} />
          </div>
        ) : (
          <>
            <div style={{ marginTop: 20 }}>
              <Tabs active={activeTab} />
            </div>
            <div style={{ marginTop: 20 }}>
              {stage === "invite" ? (
                <InviteBody />
              ) : (
                <RosterBody lines={lines} preview={preview} addLabel={addLabel} pressed={pressed} />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};
