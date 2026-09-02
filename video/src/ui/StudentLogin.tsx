// The student sign-in flow at 1440x900: role select, then the student page
// with the "District student? Sign in with a code." disclosure and the email
// + code form it reveals. Copy mirrors app/login/copy.ts.
import type { Point } from "../lib/geometry";
import { C, FONT_BODY, FONT_HEADING, FONT_MONO } from "../theme";
import { Wordmark } from "../components/Wordmark";
import { Btn, Chip, Input } from "./primitives";
import { UI } from "../components/Screen";

export const COL = { x: 500, w: 440 };
export const STUDENT_BTN_CENTER: Point = { x: 720, y: 408 };
export const DISCLOSURE_CENTER: Point = { x: 720, y: 522 };
export const SIGN_IN_CENTER: Point = { x: 720, y: 770 };

const Grid: React.FC = () => (
  <svg width={UI.w} height={UI.h} style={{ position: "absolute", left: 0, top: 0 }}>
    <defs>
      <pattern id="grid" width={62} height={62} patternUnits="userSpaceOnUse">
        <path d="M62 0H0V62" fill="none" stroke={C.gridLine} strokeWidth={1} />
      </pattern>
    </defs>
    <rect width={UI.w} height={UI.h} fill="url(#grid)" />
  </svg>
);

const Chrome: React.FC = () => (
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
      padding: "0 20px",
    }}
  >
    <Wordmark width={96} />
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT_MONO, fontSize: 12.5, color: C.muted }}>
      <span>← Change role</span>
      <div style={{ display: "flex", border: `1px solid ${C.ink}` }}>
        <span style={{ padding: "6px 10px" }}>ES</span>
        <span style={{ padding: "6px 10px", background: C.midnight, color: C.white }}>EN</span>
      </div>
      <div style={{ width: 30, height: 30, border: `1px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={12} height={12} viewBox="0 0 12 12">
          <path d="M9 1.5A5 5 0 1 0 10.5 9 4 4 0 0 1 9 1.5Z" fill={C.ink} />
        </svg>
      </div>
    </div>
  </div>
);

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: UI.w, height: UI.h, background: C.paper, overflow: "hidden" }}>
    <Grid />
    <Chrome />
    {children}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 18,
        textAlign: "center",
        fontFamily: FONT_MONO,
        fontSize: 12,
        color: C.muted,
      }}
    >
      © 2026 UnpackMath &nbsp; Privacy &nbsp; Terms
    </div>
  </div>
);

export const RoleSelect: React.FC = () => (
  <Page>
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
      <div style={{ fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 40, color: C.ink }}>Who's signing in today?</div>
    </div>
    <Btn variant="primary" style={{ position: "absolute", left: 560, top: 380, width: 320, height: 56, fontSize: 17 }}>
      I'm a student
    </Btn>
    <Btn style={{ position: "absolute", left: 560, top: 452, width: 320, height: 56, fontSize: 17 }}>I'm a teacher</Btn>
    <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontSize: 14, color: C.muted }}>
      New here? <span style={{ textDecoration: "underline", color: C.ink }}>Take the free practice test</span>, no
      account needed.
    </div>
  </Page>
);

const GoogleG: React.FC = () => (
  <svg width={18} height={18} viewBox="0 0 18 18">
    <path d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.3h2.9c1.7-1.6 2.7-3.9 2.7-6.6Z" fill="#4285F4" />
    <path d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18Z" fill="#34A853" />
    <path d="M3.9 10.6a5.4 5.4 0 0 1 0-3.2V5.1H.9a9 9 0 0 0 0 7.8l3-2.3Z" fill="#FBBC05" />
    <path d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5.1l3 2.3C4.6 5.2 6.6 3.6 9 3.6Z" fill="#EA4335" />
  </svg>
);

export const StudentSignIn: React.FC<{
  codeForm: number;
  email: string;
  code: string;
  typingEmail?: boolean;
  typingCode?: boolean;
}> = ({ codeForm, email, code, typingEmail, typingCode }) => {
  const ready = email.length > 0 && code.length >= 12;
  return (
    <Page>
      <div style={{ position: "absolute", left: COL.x, width: COL.w, top: 120 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FONT_MONO, fontSize: 12.5, letterSpacing: "0.14em", color: C.warn }}>
          <span style={{ width: 22, height: 2, background: C.sunset, display: "inline-block" }} />
          STUDENT SIGN IN
        </div>
      </div>
      <div style={{ position: "absolute", left: COL.x, top: 148, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 32, color: C.ink, whiteSpace: "nowrap" }}>
        Sign in to save your progress
      </div>
      <div style={{ position: "absolute", left: COL.x, width: COL.w, top: 200, fontSize: 15, color: C.muted }}>
        Track your scores over time and pick up where you left off.
      </div>

      <div style={{ position: "absolute", left: COL.x, width: COL.w, top: 240, height: 176, border: `1px solid ${C.ink}`, background: C.white, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700 }}>
          Joining a class? <Chip bg={C.white} border={C.ink}>Optional</Chip>
        </div>
        <div style={{ marginTop: 8, fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>
          Enter the 6-character code your teacher gave you. You can skip this and add it later.
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <Input value="" placeholder="XK7R2P" mono style={{ flex: 1, height: 44 }} />
          <Btn variant="disabled" style={{ width: 112 }}>
            Check code
          </Btn>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: COL.x,
          width: COL.w,
          top: 436,
          height: 52,
          background: C.cream,
          border: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        <GoogleG /> Continue with Google
      </div>

      <div
        style={{
          position: "absolute",
          left: COL.x,
          width: COL.w,
          top: 512,
          height: 20,
          textAlign: "center",
          fontFamily: FONT_MONO,
          fontSize: 13,
          color: C.warn,
          textDecoration: "underline",
        }}
      >
        District student? Sign in with a code.
      </div>

      {codeForm > 0 ? (
        <div
          style={{
            position: "absolute",
            left: COL.x,
            width: COL.w,
            top: 548,
            height: 264,
            border: `1px solid ${C.ink}`,
            background: C.white,
            padding: 20,
            opacity: codeForm,
            transform: `translateY(${(1 - codeForm) * -10}px)`,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, height: 22 }}>Sign in with your code</div>
          <div style={{ fontSize: 13.5, color: C.muted, height: 18, marginTop: 6 }}>Use the email and code your teacher gave you.</div>
          <Input value={email} placeholder="you@school.edu" caret={typingEmail} style={{ marginTop: 16 }} />
          <Input value={code} placeholder="ABCD2345EFGH" mono caret={typingCode} style={{ marginTop: 12 }} />
          <Btn variant={ready ? "primary" : "disabled"} style={{ width: "100%", marginTop: 12 }}>
            Sign in
          </Btn>
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: COL.x,
          width: COL.w,
          top: codeForm > 0 ? 836 : 560,
          textAlign: "center",
          fontFamily: FONT_MONO,
          fontSize: 12,
          color: C.muted,
        }}
      >
        By signing in, you agree to our <u>Terms of Use</u> and <u>Privacy Policy</u>.
      </div>
      <span style={{ fontFamily: FONT_BODY }} />
    </Page>
  );
};
