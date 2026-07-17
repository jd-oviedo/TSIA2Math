import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "UnpackMath",
  description: "Are you a student, teacher, or parent?",
};

const NAVY = "#0F1E35";
const STUDENT_ORANGE = "#F0A33E";
const OFF_WHITE = "#F5F5F3";
const NEAR_BLACK = "#1A1A1A";
const WARM_GRAY = "#5F5E5A";
const SKY = "#6FBEE6";

const KODCHASAN = "var(--font-kodchasan, Kodchasan, sans-serif)";
const SANS = "Arial, system-ui, sans-serif";

type Role = {
  href: string;
  label: string;
  labelEs: string;
  background: string;
  shadow: string;
  subLabelColor: string;
  external?: boolean;
};

const ROLES: Role[] = [
  {
    href: "/adaptive-test",
    label: "Student",
    labelEs: "Estudiante",
    background: STUDENT_ORANGE,
    shadow: "0 8px 20px rgba(240,163,62,0.34)",
    subLabelColor: "rgba(255,255,255,0.9)",
  },
  {
    href: "https://app.unpackmath.com/demo",
    label: "Teacher",
    labelEs: "Maestro(a)",
    background: SKY,
    shadow: "0 8px 20px rgba(111,190,230,0.36)",
    subLabelColor: "rgba(255,255,255,0.92)",
    external: true,
  },
  {
    href: "/reporte",
    label: "Parent/Guardian",
    labelEs: "Padre/Madre/Guardián",
    background: NAVY,
    shadow: "0 8px 20px rgba(15,30,53,0.28)",
    subLabelColor: "rgba(255,255,255,0.8)",
  },
];

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

      <nav
        style={{
          position: "relative",
          padding: "34px 26px 0",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        {ROLES.map((role) => {
          const tapStyle: CSSProperties = {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 26px",
            height: "92px",
            borderRadius: "22px",
            background: role.background,
            boxShadow: role.shadow,
            textDecoration: "none",
            boxSizing: "border-box",
          };

          const content = (
            <>
              <span style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                <span
                  style={{
                    fontFamily: KODCHASAN,
                    fontWeight: 700,
                    fontSize: "26px",
                    lineHeight: 1,
                    color: "#fff",
                  }}
                >
                  {role.label}
                </span>
                <span
                  style={{
                    marginTop: "5px",
                    fontFamily: SANS,
                    fontSize: "15px",
                    color: role.subLabelColor,
                  }}
                >
                  {role.labelEs}
                </span>
              </span>
              <span
                aria-hidden
                style={{
                  fontFamily: KODCHASAN,
                  fontWeight: 700,
                  fontSize: "30px",
                  color: "#fff",
                }}
              >
                ›
              </span>
            </>
          );

          // Absolute URLs bypass the client router, so they need a plain anchor.
          return role.external ? (
            <a key={role.label} href={role.href} className="um-tap" style={tapStyle}>
              {content}
            </a>
          ) : (
            <Link key={role.label} href={role.href} className="um-tap" style={tapStyle}>
              {content}
            </Link>
          );
        })}
      </nav>

      {/* Shared site footer, so the legal links match every other page exactly. */}
      <div style={{ position: "relative", marginTop: "auto", paddingTop: "40px", paddingBottom: "16px" }}>
        <Footer />
      </div>
    </div>
  );
}
