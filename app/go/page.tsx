import type { Metadata } from "next";
import { Footer } from "../components/Footer";
import { RoleTapList } from "./RoleTapList";

export const metadata: Metadata = {
  title: "UnpackMath",
  description: "Are you a student, teacher, or parent?",
};

const OFF_WHITE = "#F5F5F3";
const NEAR_BLACK = "#1A1A1A";
const WARM_GRAY = "#5F5E5A";

const KODCHASAN = "var(--font-kodchasan, Kodchasan, sans-serif)";
const SANS = "Arial, system-ui, sans-serif";

export default function QrLanding() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: OFF_WHITE,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Tap feedback: inline styles cannot express :active, so this one rule covers it. */}
      <style>{`.um-tap { transition: transform 120ms ease, filter 120ms ease; }
.um-tap:active { transform: scale(0.98); filter: brightness(0.96); }`}</style>

      {/* Soft brand glow behind the header */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-190px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "640px",
          height: "420px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(111,190,230,0.30), rgba(111,190,230,0.06) 60%, rgba(111,190,230,0) 72%)",
          pointerEvents: "none",
        }}
      />

      {/* Oversized mu watermark */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: "-70px",
          bottom: "-40px",
          font: `italic 700 320px/1 ${KODCHASAN}`,
          color: "rgba(198,138,47,0.06)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        µ
      </div>

      <header style={{ position: "relative", padding: "74px 34px 0", textAlign: "center" }}>
        <a href="https://www.unpackmath.com/pricing" className="um-tap" style={{ display: "inline-block" }}>
          {/* Wordmark is 2000x485, so width alone keeps the aspect ratio intact. */}
          <img
            src="/unpackmath-wordmark.png"
            alt="UnpackMath"
            width={2000}
            height={485}
            style={{ width: "212px", height: "auto", display: "block" }}
          />
        </a>
      </header>

      <div style={{ position: "relative", padding: "40px 34px 0", textAlign: "center" }}>
        <h1
          style={{
            margin: 0,
            fontFamily: KODCHASAN,
            fontWeight: 700,
            fontSize: "29px",
            lineHeight: 1.18,
            letterSpacing: "-0.3px",
            color: NEAR_BLACK,
          }}
        >
          Are you a student,
          <br />
          teacher, or parent?
        </h1>
        <p
          style={{
            margin: "12px 0 0",
            fontFamily: SANS,
            fontSize: "16px",
            color: WARM_GRAY,
          }}
        >
          ¿Eres estudiante, maestro, o padre?
        </p>
      </div>

      <RoleTapList />

      {/* Shared site footer, so the legal links match every other page exactly. */}
      <div style={{ position: "relative", marginTop: "auto", paddingTop: "40px", paddingBottom: "16px" }}>
        <Footer />
      </div>
    </div>
  );
}
