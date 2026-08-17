"use client";

import { useState, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Footer } from "../components/Footer";
import { loginHref, safeNext, DEFAULT_NEXT } from "../lib/next-param";

const OFF_WHITE = "#F5F5F3";
const NEAR_BLACK = "#1A1A1A";
const WARM_GRAY = "#5F5E5A";
const NAVY = "#0F1E35";
const STUDENT_ORANGE = "#F0A33E";
const SKY = "#6FBEE6";

const KODCHASAN = "var(--font-kodchasan, Kodchasan, sans-serif)";
const SANS = "var(--font-nunito), 'Nunito', sans-serif";

type Lang = "en" | "es";

const CARD_MAX_WIDTH = 400;

// The Español/English pill is the only place both languages appear at once.
// Everything below it renders in a single language at a time, driven by lang.
const COPY: Record<Lang, {
  headline: string;
  student: string;
  teacher: string;
  family: string;
  comingSoon: string;
  joinClass: string;
  or: string;
  loginDashboard: string;
  joinButton: string;
  codeLabel: string;
}> = {
  en: {
    headline: "Are you a student, teacher, or parent?",
    student: "I'm a Student",
    teacher: "I'm a Teacher",
    family: "I'm a Family Member",
    comingSoon: "Coming soon",
    joinClass: "Join Class",
    or: "or",
    loginDashboard: "Login to Student Dashboard",
    joinButton: "Join",
    codeLabel: "Class join code",
  },
  es: {
    headline: "¿Eres estudiante, maestro, o padre?",
    student: "Soy estudiante",
    teacher: "Soy maestro(a)",
    family: "Soy un familiar",
    comingSoon: "Próximamente",
    joinClass: "Unirse a una clase",
    or: "o",
    loginDashboard: "Iniciar sesión en el panel del estudiante",
    joinButton: "Unirse",
    codeLabel: "Código de la clase",
  },
};

function LanguageToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div
      role="group"
      aria-label="Language / Idioma"
      style={{
        display: "flex",
        gap: 4,
        padding: 4,
        background: "#fff",
        border: "1px solid #E7E6E1",
        borderRadius: 999,
        boxShadow: "0 2px 8px rgba(15,30,53,.08)",
      }}
    >
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          aria-pressed={lang === l}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "7px 16px",
            cursor: "pointer",
            font: `700 13px/1.2 ${KODCHASAN}`,
            background: lang === l ? NAVY : "transparent",
            color: lang === l ? "#fff" : WARM_GRAY,
            transition: "background .2s, color .2s",
          }}
        >
          {l === "es" ? "Español" : "English"}
        </button>
      ))}
    </div>
  );
}

const barShell: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  minHeight: 78,
  padding: "0 22px",
  borderRadius: 18,
  boxSizing: "border-box",
  textDecoration: "none",
};

function Chevron() {
  return (
    <span aria-hidden style={{ fontFamily: KODCHASAN, fontWeight: 700, fontSize: 26, color: "#fff", flexShrink: 0 }}>
      ›
    </span>
  );
}

function JoinClassField({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const [code, setCode] = useState("");
  const ready = code.trim().length === 6;
  // The join-class flow has its own destination on purpose: the code has to be
  // consumed on arrival, so it goes to the dashboard index carrying the code
  // rather than to whatever page the visitor was originally trying to reach.
  const href = ready ? loginHref(`/dashboard?code=${code.trim()}`, "student") : "#";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontFamily: KODCHASAN, fontWeight: 700, fontSize: "14px", color: NEAR_BLACK }}>
        {c.joinClass}
      </span>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="e.g. XK7R2P"
          maxLength={6}
          aria-label={c.codeLabel}
          style={{
            flex: "1 1 140px",
            minWidth: 0,
            padding: "10px 13px",
            borderRadius: 10,
            border: "1px solid rgba(15,30,53,0.18)",
            font: "700 14px ui-monospace, Menlo, monospace",
            letterSpacing: "0.1em",
            color: NEAR_BLACK,
            textTransform: "uppercase",
          }}
        />
        <Link
          href={href}
          aria-disabled={!ready}
          onClick={(e) => {
            if (!ready) e.preventDefault();
          }}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: ready ? STUDENT_ORANGE : "rgba(15,30,53,0.12)",
            color: ready ? NAVY : "rgba(15,30,53,0.4)",
            font: `700 14px ${SANS}`,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            cursor: ready ? "pointer" : "not-allowed",
            pointerEvents: ready ? "auto" : "none",
          }}
        >
          {c.joinButton}
        </Link>
      </div>
    </div>
  );
}

function StudentPanel({ lang, next }: { lang: Lang; next: string }) {
  const c = COPY[lang];
  return (
    <div
      style={{
        marginTop: 8,
        padding: 16,
        borderRadius: 16,
        background: "#fff",
        border: "1px solid rgba(15,30,53,0.10)",
        boxShadow: "0 6px 18px rgba(15,30,53,0.07)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <JoinClassField lang={lang} />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: "#E7E6E1" }} />
        <span style={{ fontSize: 11, color: WARM_GRAY, whiteSpace: "nowrap" }}>{c.or}</span>
        <div style={{ flex: 1, height: 1, background: "#E7E6E1" }} />
      </div>

      <Link
        href={loginHref(next, "student")}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 16px",
          borderRadius: 10,
          border: "1px solid rgba(15,30,53,0.18)",
          textDecoration: "none",
          fontFamily: KODCHASAN,
          fontWeight: 700,
          fontSize: "14px",
          color: NEAR_BLACK,
        }}
      >
        {c.loginDashboard}
      </Link>
    </div>
  );
}

export function RoleSelector() {
  const [lang, setLang] = useState<Lang>("en");
  const [studentOpen, setStudentOpen] = useState(false);
  const c = COPY[lang];

  // The second half of the deep-link fix, and the half that is easy to miss.
  //
  // /dashboard's gate redirects here WITHOUT a role param, so this selector is
  // the screen a signed-out deep link actually lands on -- not the OAuth screen.
  // The student link used to hardcode next=%2Fdashboard, which threw the
  // requested path away again after the layout had just started preserving it.
  // Fixing only the layout would have changed nothing a student could see.
  const next = safeNext(useSearchParams().get("next"), DEFAULT_NEXT);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: OFF_WHITE,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <header style={{ padding: "56px 24px 0", textAlign: "center" }}>
        <a href="https://www.unpackmath.com" style={{ display: "inline-block" }}>
          <img
            src="/unpackmath-wordmark.png"
            alt="UnpackMath"
            width={2000}
            height={485}
            style={{ width: "190px", height: "auto", display: "block", margin: "0 auto" }}
          />
        </a>

        <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
          <LanguageToggle lang={lang} onChange={setLang} />
        </div>
      </header>

      <div style={{ padding: "32px 24px 0", textAlign: "center" }}>
        <h1
          style={{
            margin: 0,
            fontFamily: KODCHASAN,
            fontWeight: 700,
            fontSize: "26px",
            lineHeight: 1.18,
            color: NEAR_BLACK,
          }}
        >
          {c.headline}
        </h1>
      </div>

      <div style={{ width: "100%", maxWidth: CARD_MAX_WIDTH, margin: "30px auto 0", padding: "0 24px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Student: expands inline, does not navigate */}
          <div>
            <button
              type="button"
              onClick={() => setStudentOpen((v) => !v)}
              aria-expanded={studentOpen}
              style={{ ...barShell, background: STUDENT_ORANGE, border: "none", cursor: "pointer" }}
            >
              <span style={{ fontFamily: KODCHASAN, fontWeight: 700, fontSize: "20px", color: "#fff" }}>
                {c.student}
              </span>
              <span
                aria-hidden
                style={{
                  fontFamily: KODCHASAN,
                  fontWeight: 700,
                  fontSize: 24,
                  color: "#fff",
                  transform: studentOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 150ms ease",
                }}
              >
                ›
              </span>
            </button>
            {studentOpen && <StudentPanel lang={lang} next={next} />}
          </div>

          {/* Teacher: plain link, no expansion */}
          <Link href={loginHref("/teacher", "teacher")} style={{ ...barShell, background: SKY }}>
            <span style={{ fontFamily: KODCHASAN, fontWeight: 700, fontSize: "20px", color: "#fff" }}>
              {c.teacher}
            </span>
            <Chevron />
          </Link>

          {/* Family Member: disabled, coming soon */}
          <div
            aria-disabled="true"
            style={{ ...barShell, background: NAVY, opacity: 0.55, cursor: "not-allowed" }}
          >
            <span style={{ fontFamily: KODCHASAN, fontWeight: 700, fontSize: "20px", color: "#fff" }}>
              {c.family}
            </span>
            <span
              aria-hidden
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: "#fff",
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: 999,
                padding: "4px 10px",
                whiteSpace: "nowrap",
              }}
            >
              {c.comingSoon}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "auto", paddingTop: 48, paddingBottom: 16 }}>
        <Footer />
      </div>
    </div>
  );
}
