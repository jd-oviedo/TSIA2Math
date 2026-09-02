// Recreation of the teacher dashboard ("1st period" view) at 1440x900.
// Numbers are the sample values from the layout reference; names and codes
// come from demo-data only.
import { DEMO_CLASS, DEMO_TEACHER } from "../demo-data";
import type { Rect } from "../lib/geometry";
import { center } from "../lib/geometry";
import { C, FONT_BODY, FONT_MONO } from "../theme";
import { Wordmark } from "../components/Wordmark";
import { Btn, Chip, Eyebrow, H, PlusIcon } from "./primitives";
import { UI } from "../components/Screen";

export const SIDEBAR_W = 200;
export const TOPBAR_H = 56;

// Fixed top bar geometry so the cursor can target the Invite button exactly.
export const JOIN_CHIP: Rect = { x: 982, y: 12, w: 176, h: 32 };
export const INVITE_BTN: Rect = { x: 1170, y: 12, w: 106, h: 32 };
export const NEW_CLASS_BTN: Rect = { x: 1288, y: 12, w: 128, h: 32 };
export const INVITE_CENTER = center(INVITE_BTN);

const NAV = ["Dashboard", "Misconceptions", "Worksheets", "Students", "Take a practice test", "Student view"];

const NavIcon: React.FC<{ i: number; color: string }> = ({ i, color }) => {
  const s = { stroke: color, strokeWidth: 1.5, fill: "none" } as const;
  switch (i) {
    case 0:
      return (
        <svg width={16} height={16} viewBox="0 0 16 16">
          <rect x={1.5} y={1.5} width={5} height={5} {...s} />
          <rect x={9.5} y={1.5} width={5} height={5} {...s} />
          <rect x={1.5} y={9.5} width={5} height={5} {...s} />
          <rect x={9.5} y={9.5} width={5} height={5} {...s} />
        </svg>
      );
    case 1:
      return (
        <svg width={16} height={16} viewBox="0 0 16 16">
          <path d="M8 2 L14.5 13.5 H1.5 Z" {...s} strokeLinejoin="round" />
          <path d="M8 6.5v3.5M8 12v.5" stroke={color} strokeWidth={1.5} />
        </svg>
      );
    case 3:
      return (
        <svg width={16} height={16} viewBox="0 0 16 16">
          <circle cx={5.5} cy={5} r={2.5} {...s} />
          <circle cx={11} cy={6} r={2} {...s} />
          <path d="M1.5 14c0-2.5 1.8-4 4-4s4 1.5 4 4M9.5 13.5c.3-1.8 1.5-3 3-3 1.2 0 2 .8 2.3 2" {...s} />
        </svg>
      );
    case 5:
      return (
        <svg width={16} height={16} viewBox="0 0 16 16">
          <path d="M1.5 8c2-3.5 4.2-5 6.5-5s4.5 1.5 6.5 5c-2 3.5-4.2 5-6.5 5S3.5 11.5 1.5 8Z" {...s} />
          <circle cx={8} cy={8} r={2} {...s} />
        </svg>
      );
    default:
      return (
        <svg width={16} height={16} viewBox="0 0 16 16">
          <rect x={3} y={1.5} width={10} height={13} {...s} />
          <path d="M5.5 5h5M5.5 8h5M5.5 11h3" stroke={color} strokeWidth={1.3} />
        </svg>
      );
  }
};

const Sidebar: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: SIDEBAR_W, height: UI.h, background: C.navy, color: C.sidebarText }}>
    <div style={{ padding: "22px 22px 14px" }}>
      <Wordmark width={150} />
    </div>
    <div
      style={{
        padding: "0 22px 12px",
        fontFamily: FONT_BODY,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.16em",
        color: C.sidebarMuted,
        borderBottom: `1px solid ${C.sidebarRule}`,
      }}
    >
      TEACHER · CORE
    </div>
    <div style={{ padding: 10 }}>
      {NAV.map((label, i) => {
        const active = i === 0;
        const color = active ? C.midnight : C.sidebarText;
        return (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              marginBottom: 2,
              background: active ? C.sunset : "transparent",
              color,
              fontSize: 14.5,
              fontWeight: active ? 600 : 400,
            }}
          >
            <NavIcon i={i} color={color} />
            {label}
          </div>
        );
      })}
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "14px 16px",
        borderTop: `1px solid ${C.sidebarRule}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          flex: "none",
        }}
      >
        {DEMO_TEACHER.initials}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {DEMO_TEACHER.footer}
        </div>
        <div style={{ marginTop: 4 }}>
          <Chip bg="transparent" color={C.cream} border={C.sunset}>
            ★ {DEMO_TEACHER.plan}
          </Chip>
        </div>
      </div>
    </div>
  </div>
);

const TopBar: React.FC<{ inviteHighlight: number }> = ({ inviteHighlight }) => (
  <div
    style={{
      position: "absolute",
      left: SIDEBAR_W,
      top: 0,
      width: UI.w - SIDEBAR_W,
      height: TOPBAR_H,
      background: C.white,
      borderBottom: `1px solid ${C.line}`,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 24,
        top: 12,
        height: 32,
        padding: "0 12px",
        border: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {DEMO_CLASS.name}
      <svg width={10} height={7} viewBox="0 0 10 7">
        <path d="M1 1l4 4 4-4" stroke={C.ink} strokeWidth={1.6} fill="none" />
      </svg>
    </div>
    <div
      style={{
        position: "absolute",
        left: JOIN_CHIP.x - SIDEBAR_W,
        top: JOIN_CHIP.y,
        width: JOIN_CHIP.w,
        height: JOIN_CHIP.h,
        background: C.chipBg,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 10px",
      }}
    >
      <span style={{ fontSize: 10.5, letterSpacing: "0.12em", color: C.muted, fontWeight: 600 }}>JOIN CODE</span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em" }}>
        {DEMO_CLASS.joinCode}
      </span>
      <svg width={12} height={12} viewBox="0 0 12 12" style={{ marginLeft: "auto" }}>
        <rect x={3.5} y={3.5} width={7} height={7} stroke={C.ink} strokeWidth={1.2} fill="none" />
        <path d="M1.5 8.5v-7h7" stroke={C.ink} strokeWidth={1.2} fill="none" />
      </svg>
    </div>
    <Btn
      style={{
        position: "absolute",
        left: INVITE_BTN.x - SIDEBAR_W,
        top: INVITE_BTN.y,
        width: INVITE_BTN.w,
        height: INVITE_BTN.h,
        padding: 0,
        fontSize: 13,
        background: inviteHighlight > 0 ? C.sand : C.white,
        border: inviteHighlight > 0 ? `2px solid ${C.sunset}` : `1px solid ${C.border}`,
      }}
    >
      <PlusIcon /> Invite
    </Btn>
    <Btn
      variant="primary"
      style={{
        position: "absolute",
        left: NEW_CLASS_BTN.x - SIDEBAR_W,
        top: NEW_CLASS_BTN.y,
        width: NEW_CLASS_BTN.w,
        height: NEW_CLASS_BTN.h,
        padding: 0,
        fontSize: 13,
      }}
    >
      <PlusIcon color={C.midnight} /> New class
    </Btn>
  </div>
);

const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: C.white, border: `1px solid ${C.line}`, padding: "20px 22px", ...style }}>{children}</div>
);

const Stat: React.FC<{ label: string; value: string; unit?: string; note: string; pct?: string }> = ({
  label,
  value,
  unit,
  note,
  pct,
}) => (
  <Card style={{ height: 150 }}>
    <Eyebrow>{label}</Eyebrow>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 14 }}>
      <H size={40}>{value}</H>
      {pct ? <span style={{ color: C.green, fontWeight: 700, fontSize: 14 }}>{pct}</span> : null}
      {unit ? <span style={{ color: C.muted, fontSize: 14 }}>{unit}</span> : null}
    </div>
    <div style={{ marginTop: 10, fontSize: 13, color: C.dim }}>{note}</div>
  </Card>
);

const STRANDS = [
  { k: "QR", name: "Quantitative Reasoning", pct: 50, bg: C.qr },
  { k: "AR", name: "Algebraic Reasoning", pct: 14, bg: C.greenBg },
  { k: "GR", name: "Geometric and Spatial Reasoning", pct: 0, bg: C.sunset },
  { k: "PR", name: "Probabilistic and Statistical Reasoning", pct: 25, bg: C.pr },
];

export const TeacherDashboard: React.FC<{ inviteHighlight?: number }> = ({ inviteHighlight = 0 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: UI.w, height: UI.h, background: C.pageBg, overflow: "hidden" }}>
    <Sidebar />
    <TopBar inviteHighlight={inviteHighlight} />
    <div style={{ position: "absolute", left: SIDEBAR_W, top: TOPBAR_H, right: 0, bottom: 0, padding: "28px 32px" }}>
      <H size={32}>{DEMO_CLASS.name}</H>
      <div style={{ marginTop: 4, fontSize: 14, color: C.muted }}>
        {DEMO_CLASS.students} students · {DEMO_CLASS.attempts} attempt
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 24 }}>
        <Stat label="Students enrolled" value="9" note="8 not yet tested" />
        <Stat label="College ready" value="0" pct="0%" note="Scored 950 or above on TSIA2" />
        <Card style={{ height: 150, background: C.focusCard }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Eyebrow style={{ maxWidth: 110 }}>Weakest strand</Eyebrow>
            <Chip bg={C.sunset} color={C.midnight}>
              Focus
            </Chip>
          </div>
          <H size={24} style={{ marginTop: 10 }}>
            Geometric &amp; Spatial
          </H>
          <div style={{ marginTop: 8, fontSize: 13, color: C.dim, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, background: C.sunset, display: "inline-block" }} />
            GR · <b style={{ color: C.ink }}>0%</b> class accuracy
          </div>
        </Card>
        <Stat label="Average score" value="924" unit="/ 990" note="Passing 950 · scale 910 to 990" />
      </div>

      <Card style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <H size={18}>Announcements</H>
          <div style={{ marginTop: 4, fontSize: 13.5, color: C.muted }}>Post a notice to your students' dashboards.</div>
        </div>
        <Btn variant="primary" style={{ height: 40 }}>
          <PlusIcon color={C.midnight} /> New
        </Btn>
      </Card>

      <Card style={{ marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <H size={18}>Class strand mastery</H>
            <div style={{ marginTop: 4, fontSize: 13, color: C.muted }}>Average accuracy by TSIA2 reasoning strand</div>
          </div>
          <div style={{ fontSize: 12.5, color: C.dim }}>1 attempts this class</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginTop: 18 }}>
          {STRANDS.map((s) => (
            <div key={s.k}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Chip bg={s.bg} color={C.midnight}>
                  {s.k}
                </Chip>
                <span style={{ fontSize: 18, fontWeight: 700 }}>
                  {s.pct}
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>%</span>
                </span>
              </div>
              <div style={{ height: 4, background: C.chipBg, marginTop: 10 }}>
                <div style={{ width: `${s.pct}%`, height: 4, background: s.bg === C.greenBg ? C.green : s.bg }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: C.dim }}>{s.name}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <H size={18}>Curriculum progress</H>
            <div style={{ marginTop: 4, fontSize: 13, color: C.muted }}>Course status across 97 topics</div>
          </div>
          <Btn style={{ height: 34, fontSize: 13 }}>Collapse</Btn>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 18 }}>
          <H size={32}>0</H>
          <span style={{ fontSize: 15 }}>of 9 students worked on the course this week</span>
        </div>
      </Card>
    </div>
  </div>
);
