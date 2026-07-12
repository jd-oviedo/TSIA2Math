"use client";

import { useEffect, useState } from "react";
import { GridFigure } from "./GridFigure";
import { QuestionGame } from "./QuestionGame";

/* ------------------------------------------------------------------ *
 * Parent Digest — bilingual (ES / EN) weekly progress report.
 * Palette is hardcoded from the design (not the --ec theme), matching
 * the demo/teacher surfaces. Content below is placeholder copy from the
 * design handoff; wire to real report data when available.
 * ------------------------------------------------------------------ */

const NAVY = "#0F1E35";
const AMBER = "#f0a33e";
const BLUE = "#155A7E";
const BLUE_2 = "#3f7290";
const BLUE_BG = "#E1F0F8";
const INK = "#1A1A1A";
const MUTED = "#5F5E5A";
const FAINT = "#8b8a85";
const CARD = "#fff";
const CARD_BORDER = "#E7E6E1";
const INSET = "#F5F5F3";

// Design props: amber left accent (default off) + practice-area fill (default 58%).
const LEFT_ACCENT = false;
const FOCUS_FILL = 58;
const leftBorder = LEFT_ACCENT ? `3px solid ${AMBER}` : "none";

const CONTENT = {
  student: "Camila",
  teacherInitials: "AM",
  teacher: "De Ms. White",
  school: "Summertime High School",
  status: {
    kicker: "Va por buen camino",
    es: "Camila va por buen camino para estar lista para las matemáticas universitarias.",
    en: "Camila is on track for college math.",
  },
  focus: {
    es: "Figuras y espacio",
    en: "Shapes and space",
    note_es: "Con un poco más de práctica en esta área seguirá mejorando.",
    note_en: "A little more practice here will keep her improving.",
  },
  misconception: {
    // The Spanish line is inline in the JSX below — it bolds "cambia de tamaño"
    // and "cambia de posición", so it can't live here as a flat string.
    en: "Camila has trouble telling the difference between a shape that changes size and one that only changes position.",
    reassure_es: "No necesitas saber hacer las matemáticas tú misma.",
    reassure_en: "You don’t need to know how to do the math yourself.",
  },
  action: {
    ask_es: "«¿Cómo sabes que esta figura cambió de tamaño y no solo de lugar?»",
    ask_en: "“How do you know this shape changed size, and didn’t just move?”",
    listen_es: "Habla del tamaño — si se hizo más grande o más pequeña — no solo de que se movió.",
    listen_en: "Whether she talks about size, not just that it moved.",
  },
};

function useViewport() {
  const [w, setW] = useState(1280);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return { isDesktop: w >= 900 };
}

/* --- shared card fragments ------------------------------------------------ */

function StatusCard({ big }: { big: boolean }) {
  return (
    <div style={{ flex: 1, background: BLUE_BG, borderRadius: 16, padding: big ? 24 : "18px 18px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: big ? 12 : 9 }}>
        <span style={{ width: big ? 10 : 9, height: big ? 10 : 9, borderRadius: "50%", background: BLUE, display: "inline-block" }} />
        <span style={{ font: "700 11px/1 Arial,sans-serif", letterSpacing: ".08em", textTransform: "uppercase", color: BLUE }}>{CONTENT.status.kicker}</span>
      </div>
      <div style={{ font: `700 ${big ? 23 : 20}px/1.3 Arial,sans-serif`, color: BLUE }}>{CONTENT.status.es}</div>
      <div style={{ font: `400 ${big ? 15 : 14}px/1.4 Arial,sans-serif`, color: BLUE_2, marginTop: big ? 8 : 6 }}>{CONTENT.status.en}</div>
    </div>
  );
}

function FocusCard({ big }: { big: boolean }) {
  return (
    <div style={{ flex: 1, background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: big ? 24 : 18 }}>
      <div style={{ font: "700 11px/1 Arial,sans-serif", letterSpacing: ".08em", textTransform: "uppercase", color: MUTED, marginBottom: big ? 14 : 12 }}>
        Un área para mejorar · One area to practice
      </div>
      <div style={{ font: `700 ${big ? 21 : 18}px/1.25 Arial,sans-serif`, color: INK }}>{CONTENT.focus.es}</div>
      <div style={{ font: `400 ${big ? 14 : 13}px/1.3 Arial,sans-serif`, color: MUTED, marginTop: big ? 3 : 2 }}>{CONTENT.focus.en}</div>
      <div style={{ marginTop: big ? 16 : 14, height: big ? 14 : 12, borderRadius: 99, background: "#F0EFEA", overflow: "hidden" }}>
        <div style={{ width: `${FOCUS_FILL}%`, height: "100%", borderRadius: 99, background: AMBER }} />
      </div>
      <div style={{ font: "400 13px/1.4 Arial,sans-serif", color: MUTED, marginTop: big ? 12 : 11 }}>
        {CONTENT.focus.note_es} <span style={{ color: FAINT }}>{CONTENT.focus.note_en}</span>
      </div>
    </div>
  );
}

function PictorialPair({ compact }: { compact: boolean }) {
  const item = (fig: "dil" | "trans", es: string, sub_es: string, sub_en: string) =>
    compact ? (
      <div style={{ flex: 1 }}>
        <GridFigure kind={fig} />
        <div style={{ textAlign: "center", font: "700 13px/1.2 Arial,sans-serif", color: INK, marginTop: 4 }}>{es}</div>
        <div style={{ textAlign: "center", font: "400 11px/1.35 Arial,sans-serif", color: FAINT, marginTop: 2 }}>
          {sub_es}
          <br />
          {sub_en}
        </div>
      </div>
    ) : (
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 130, flex: "none" }}>
          <GridFigure kind={fig} />
        </div>
        <div>
          <div style={{ font: "700 15px/1.2 Arial,sans-serif", color: INK }}>{es}</div>
          <div style={{ font: "400 12px/1.4 Arial,sans-serif", color: FAINT, marginTop: 3 }}>
            {sub_es}
            <br />
            {sub_en}
          </div>
        </div>
      </div>
    );

  return (
    <div style={{ display: "flex", gap: compact ? 12 : 24, alignItems: "center" }}>
      {item("dil", "Cambió de tamaño", "más grande, mismo lugar", "changed size")}
      <div style={{ width: 1, alignSelf: "stretch", background: "#ECEBE6" }} />
      {item("trans", "Cambió de lugar", "mismo tamaño, otro lugar", "changed position")}
    </div>
  );
}

/* --- page ----------------------------------------------------------------- */

export default function ReportePage() {
  const { isDesktop } = useViewport();
  const [gameOpen, setGameOpen] = useState(false);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #E8E7E2; -webkit-font-smoothing: antialiased; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#E8E7E2",
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
          color: INK,
          padding: isDesktop ? "44px 32px 64px" : "20px 14px 48px",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: isDesktop ? 20 : 14 }}>

          {/* 1. TRUSTED SENDER */}
          <div
            style={{
              background: NAVY,
              borderRadius: 20,
              padding: isDesktop ? "26px 30px" : "18px 18px 16px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: isDesktop ? 24 : 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: isDesktop ? 18 : 13 }}>
              <div
                style={{
                  width: isDesktop ? 60 : 48,
                  height: isDesktop ? 60 : 48,
                  borderRadius: "50%",
                  background: AMBER,
                  color: NAVY,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  font: `700 ${isDesktop ? 22 : 17}px/1 'Kodchasan',sans-serif`,
                  flex: "none",
                }}
              >
                {CONTENT.teacherInitials}
              </div>
              <div>
                <div style={{ font: `700 ${isDesktop ? 20 : 16}px/1.15 Arial,sans-serif` }}>{CONTENT.teacher}</div>
                <div style={{ font: "400 14px/1.3 Arial,sans-serif", opacity: 0.72, marginTop: 4 }}>{CONTENT.school}</div>
                <div style={{ font: "400 14px/1.3 Arial,sans-serif", opacity: 0.9, marginTop: 9 }}>
                  Reporte semanal de <strong style={{ fontWeight: 700 }}>{CONTENT.student}</strong>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: 0.7 }}>
              <img src="/unpackmath-logo.png" alt="UnpackMath" style={{ width: 22, height: 22, borderRadius: 6, display: "block" }} />
              <span style={{ font: "600 15px/1 'Kodchasan',sans-serif" }}>UnpackMath</span>
            </div>
          </div>

          {/* 2 + 3 status & focus */}
          <div style={{ display: "flex", gap: isDesktop ? 20 : 14, flexDirection: isDesktop ? "row" : "column", alignItems: "stretch" }}>
            <StatusCard big={isDesktop} />
            <FocusCard big={isDesktop} />
          </div>

          {/* 4. MISCONCEPTION */}
          <div
            style={{
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: 16,
              padding: isDesktop ? "24px 26px" : 18,
              display: "flex",
              gap: isDesktop ? 26 : 14,
              flexDirection: isDesktop ? "row" : "column",
              alignItems: isDesktop ? "flex-start" : "stretch",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ font: `400 ${isDesktop ? 16 : 15}px/${isDesktop ? 1.5 : 1.45} Arial,sans-serif`, color: INK }}>
                Camila tiene dificultad para identificar la diferencia entre una figura que{" "}
                <strong style={{ fontWeight: 700 }}>cambia de tamaño</strong> y una que solo{" "}
                <strong style={{ fontWeight: 700 }}>cambia de posición</strong>.
              </div>
              <div style={{ font: "400 13px/1.4 Arial,sans-serif", color: FAINT, marginTop: isDesktop ? 8 : 7 }}>{CONTENT.misconception.en}</div>
            </div>
            <div
              style={{
                flex: "none",
                width: isDesktop ? 300 : "auto",
                padding: isDesktop ? "15px 16px" : "13px 14px",
                background: INSET,
                borderRadius: 12,
                borderLeft: leftBorder,
              }}
            >
              <div style={{ font: `700 ${isDesktop ? 15 : 14}px/1.4 Arial,sans-serif`, color: INK }}>{CONTENT.misconception.reassure_es}</div>
              <div style={{ font: "400 12px/1.4 Arial,sans-serif", color: MUTED, marginTop: isDesktop ? 5 : 4 }}>{CONTENT.misconception.reassure_en}</div>
            </div>
          </div>

          {/* PICTORIAL EXAMPLE */}
          <div
            style={{
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: 16,
              padding: isDesktop ? "24px 26px" : 16,
              display: "flex",
              gap: isDesktop ? 30 : 12,
              flexDirection: isDesktop ? "row" : "column",
              alignItems: isDesktop ? "center" : "stretch",
            }}
          >
            <div style={{ flex: "none" }}>
              <div style={{ font: "700 11px/1 Arial,sans-serif", letterSpacing: ".08em", textTransform: "uppercase", color: MUTED, marginBottom: isDesktop ? 6 : 12 }}>
                Muéstrale este dibujo{isDesktop ? "" : " · Show her this picture"}
              </div>
              {isDesktop && (
                <div style={{ font: "400 13px/1.4 Arial,sans-serif", color: FAINT, maxWidth: 220 }}>
                  Un dibujo simple para señalar juntas.
                  <br />
                  A simple picture to point at together.
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <PictorialPair compact={!isDesktop} />
            </div>
          </div>

          {/* 5. TONIGHT'S ACTION CARD */}
          <div
            style={{
              background: NAVY,
              borderRadius: 22,
              padding: isDesktop ? "32px 34px" : "20px 18px",
              color: "#fff",
              boxShadow: "0 22px 44px -18px rgba(15,30,53,.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ font: "700 11px/1 Arial,sans-serif", letterSpacing: ".1em", textTransform: "uppercase", color: NAVY, background: AMBER, padding: "7px 13px", borderRadius: 99 }}>
                Esta noche en la mesa
              </span>
              <span style={{ font: "400 13px/1 Arial,sans-serif", color: "rgba(255,255,255,.55)" }}>Tonight at the table</span>
            </div>

            <div style={{ display: "flex", gap: isDesktop ? 34 : 16, marginTop: isDesktop ? 22 : 16, flexDirection: isDesktop ? "row" : "column" }}>
              <div style={{ flex: 1 }}>
                <div style={{ font: "700 12px/1 Arial,sans-serif", letterSpacing: ".05em", textTransform: "uppercase", color: AMBER }}>Pregúntale · Ask her</div>
                <div style={{ font: `700 ${isDesktop ? 22 : 18}px/${isDesktop ? 1.4 : 1.35} Arial,sans-serif`, marginTop: isDesktop ? 10 : 8 }}>{CONTENT.action.ask_es}</div>
                <div style={{ font: "400 14px/1.4 Arial,sans-serif", color: "rgba(255,255,255,.62)", marginTop: isDesktop ? 8 : 6 }}>{CONTENT.action.ask_en}</div>
              </div>
              <div style={{ flex: 1, paddingLeft: isDesktop ? 34 : 0, borderLeft: isDesktop ? "1px solid rgba(255,255,255,.13)" : "none", paddingTop: isDesktop ? 0 : 15, borderTop: isDesktop ? "none" : "1px solid rgba(255,255,255,.13)" }}>
                <div style={{ font: "700 12px/1 Arial,sans-serif", letterSpacing: ".05em", textTransform: "uppercase", color: AMBER }}>Escucha si · Listen for</div>
                <div style={{ font: `400 ${isDesktop ? 17 : 15}px/${isDesktop ? 1.5 : 1.4} Arial,sans-serif`, marginTop: isDesktop ? 10 : 8 }}>
                  Habla del <strong style={{ fontWeight: 700 }}>tamaño</strong> — si se hizo más grande o más pequeña — no solo de que se movió.
                </div>
                <div style={{ font: "400 13px/1.4 Arial,sans-serif", color: "rgba(255,255,255,.55)", marginTop: isDesktop ? 6 : 5 }}>{CONTENT.action.listen_en}</div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: isDesktop ? 26 : 18,
                paddingTop: isDesktop ? 22 : 15,
                borderTop: "1px solid rgba(255,255,255,.13)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 16px", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 14 }}>
                <span style={{ width: 32, height: 32, borderRadius: "50%", background: AMBER, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: `10px solid ${NAVY}`, marginLeft: 3, display: "inline-block" }} />
                </span>
                <div style={{ font: "700 14px/1.1 Arial,sans-serif" }}>
                  Escuchar la pregunta
                  <span style={{ display: "block", fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 2 }}>Hear the question out loud</span>
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setGameOpen(true)}
                style={{ padding: isDesktop ? "16px 30px" : 16, width: isDesktop ? "auto" : "100%", border: 0, borderRadius: 14, background: AMBER, color: NAVY, font: "700 16px/1 Arial,sans-serif", cursor: "pointer" }}
              >
                Jugar juego de preguntas
              </button>
            </div>
          </div>

          <div style={{ textAlign: "center", font: "400 12px/1.5 Arial,sans-serif", color: "#a3a29d", marginTop: isDesktop ? 8 : 4 }}>
            UnpackMath &nbsp;·&nbsp; Copia en español pendiente de revisión bilingüe humana
          </div>
        </div>
      </div>

      {gameOpen && <QuestionGame onClose={() => setGameOpen(false)} />}
    </>
  );
}
