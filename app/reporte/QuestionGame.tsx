"use client";

import { useEffect, useRef, useState } from "react";
import { GridFigure, type FigureKind } from "./GridFigure";

// Palette (matches the Parent Digest design: hardcoded tokens, not the --ec theme)
const NAVY = "#0F1E35";
const AMBER = "#f0a33e";
const BLUE = "#155A7E";
const BLUE_BG = "#E1F0F8";
const INK = "#1A1A1A";
const MUTED = "#5F5E5A";
const FAINT = "#8b8a85";
const CARD_BORDER = "#E7E6E1";

type Card = {
  skill: string;
  q_es: string;
  q_en: string;
  a_es: string;
  a_en: string;
  fig: FigureKind | null;
};

// Verbatim from the design's DCLogic script.
const CARDS: Card[] = [
  {
    skill: "Figuras y espacio",
    q_es: "¿Cómo sabes que esta figura cambió de tamaño y no solo de lugar?",
    q_en: "How do you know this shape changed size and not just position?",
    a_es: "Si es más grande o más pequeña, cambió de tamaño. Si se ve igual pero en otro lugar, solo se movió.",
    a_en: "Bigger or smaller = it changed size. Same but somewhere else = it just moved.",
    fig: "dil",
  },
  {
    skill: "Figuras y espacio",
    q_es: "Si muevo esta figura a otro lugar, ¿cambia su tamaño?",
    q_en: "If I move this shape somewhere else, does its size change?",
    a_es: "No. Mover una figura no la hace más grande ni más pequeña.",
    a_en: "No. Moving a shape doesn’t make it bigger or smaller.",
    fig: "trans",
  },
  {
    skill: "Figuras y espacio",
    q_es: "Esta figura ahora es el doble de grande. ¿Se movió o cambió de tamaño?",
    q_en: "This shape is now twice as big. Did it move, or change size?",
    a_es: "Cambió de tamaño: se hizo más grande.",
    a_en: "It changed size. It got bigger.",
    fig: "dil2",
  },
  {
    skill: "Figuras y espacio",
    q_es: "Muéstrame con las manos una figura que cambia de tamaño.",
    q_en: "Show me with your hands a shape changing size.",
    a_es: "Manos que se separan = más grande; que se juntan = más pequeña. Deslizarlas de lugar no cuenta.",
    a_en: "Hands apart = bigger; together = smaller. Sliding them over doesn’t count.",
    fig: null,
  },
];

type Screen = "intro" | "playing" | "done";

export function QuestionGame({ onClose }: { onClose?: () => void }) {
  const [screen, setScreen] = useState<Screen>("intro");
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [tiltOn, setTiltOn] = useState(false);
  const [tiltMsg, setTiltMsg] = useState("");

  const armed = useRef(false);
  const oriHandler = useRef<((e: DeviceOrientationEvent) => void) | null>(null);
  const screenRef = useRef(screen);

  const total = CARDS.length;
  const card = CARDS[i] || CARDS[0];

  const advance = (ok: boolean) => {
    armed.current = false;
    setCorrect((c) => c + (ok ? 1 : 0));
    setI((prev) => {
      const ni = prev + 1;
      if (ni >= total) {
        setScreen("done");
        return prev;
      }
      setRevealed(false);
      return ni;
    });
  };
  // keep refs so the device-orientation handler always sees the latest state/advance
  const advanceRef = useRef(advance);
  useEffect(() => {
    screenRef.current = screen;
    advanceRef.current = advance;
  });

  const start = () => {
    setScreen("playing");
    setI(0);
    setCorrect(0);
    setRevealed(false);
  };
  const restart = () => {
    setScreen("intro");
    setI(0);
    setCorrect(0);
    setRevealed(false);
  };

  const attachTilt = () => {
    if (oriHandler.current) return;
    armed.current = true;
    const handler = (e: DeviceOrientationEvent) => {
      if (screenRef.current !== "playing" || e.beta == null) return;
      const b = e.beta;
      if (b > 60 && b < 110) {
        armed.current = true;
        return;
      } // neutral / upright
      if (!armed.current) return;
      if (b <= 45) {
        armed.current = false;
        advanceRef.current(true);
      } else if (b >= 135) {
        armed.current = false;
        advanceRef.current(false);
      }
    };
    oriHandler.current = handler;
    window.addEventListener("deviceorientation", handler, true);
  };

  const enableTilt = () => {
    const go = () => {
      attachTilt();
      setTiltOn(true);
      setTiltMsg("");
    };
    const D = window.DeviceOrientationEvent as
      | (typeof window.DeviceOrientationEvent & { requestPermission?: () => Promise<string> })
      | undefined;
    if (D && typeof (D as { requestPermission?: unknown }).requestPermission === "function") {
      (D as unknown as { requestPermission: () => Promise<string> })
        .requestPermission()
        .then((p) => (p === "granted" ? go() : setTiltMsg("Permiso denegado. Usa los botones")))
        .catch(() => setTiltMsg("No disponible. Usa los botones"));
    } else if (D) {
      go();
    } else {
      setTiltMsg("Sensor no disponible. Usa los botones");
    }
  };

  useEffect(() => {
    return () => {
      if (oriHandler.current) window.removeEventListener("deviceorientation", oriHandler.current, true);
    };
  }, []);

  const tiltLabel =
    tiltMsg || (tiltOn ? "Inclinación activada ↑ acertó · ↓ pasar" : "Activar inclinación del teléfono");

  const shellStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 400,
    background: "rgba(15,30,53,0.62)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  };

  return (
    <div style={shellStyle} role="dialog" aria-modal="true" aria-label="Juego de preguntas">
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          maxHeight: "92vh",
          overflowY: "auto",
          background: screen === "playing" ? NAVY : "#F5F5F3",
          borderRadius: 24,
          padding: 24,
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
          boxShadow: "0 30px 60px -18px rgba(15,30,53,.55)",
          position: "relative",
        }}
      >
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: screen === "playing" ? "rgba(255,255,255,.12)" : "#fff",
              color: screen === "playing" ? "#fff" : MUTED,
              fontSize: 18,
              lineHeight: 1,
              zIndex: 2,
            }}
          >
            ✕
          </button>
        )}

        {/* ---------- INTRO ---------- */}
        {screen === "intro" && (
          <div style={{ textAlign: "center", padding: "8px 6px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 22 }}>
              <img src="/images/brand/mu-mark.png" alt="UnpackMath" style={{ width: 20, height: 20, borderRadius: 5, display: "block" }} />
              <span style={{ font: "600 12px/1 'Kodchasan',sans-serif", color: MUTED }}>UnpackMath</span>
            </div>
            <div style={{ font: "700 27px/1.2 'Kodchasan',sans-serif", color: NAVY }}>Juego de preguntas</div>
            <div style={{ font: "400 15px/1.3 Arial,sans-serif", color: FAINT, marginTop: 6 }}>Question game</div>
            <div style={{ font: "400 15px/1.55 Arial,sans-serif", color: INK, marginTop: 22, maxWidth: 420, marginInline: "auto" }}>
              4 preguntas cortas para hacerle a Camila.
              <br />
              Tú ves la respuesta primero; ella contesta en voz alta.
            </div>
            <div style={{ font: "400 13px/1.5 Arial,sans-serif", color: FAINT, marginTop: 10 }}>
              4 short questions to ask Camila. You see the answer first; she answers out loud.
            </div>

            <div
              style={{
                marginTop: 26,
                padding: 16,
                background: "#fff",
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: 16,
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                maxWidth: 420,
                marginInline: "auto",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: BLUE_BG, color: BLUE, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", font: "700 17px/1 Arial,sans-serif" }}>↑</span>
                <div style={{ font: "400 14px/1.35 Arial,sans-serif", color: INK }}>
                  <strong style={{ fontWeight: 700 }}>Inclina hacia arriba</strong> si acertó
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: "#FAEEDA", color: "#854F0B", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", font: "700 17px/1 Arial,sans-serif" }}>↓</span>
                <div style={{ font: "400 14px/1.35 Arial,sans-serif", color: INK }}>
                  <strong style={{ fontWeight: 700 }}>Inclina hacia abajo</strong> para pasar
                </div>
              </div>
            </div>

            <button
              onClick={start}
              style={{ width: "100%", maxWidth: 420, marginTop: 22, padding: 17, border: 0, borderRadius: 14, background: AMBER, color: NAVY, font: "700 17px/1 Arial,sans-serif", cursor: "pointer" }}
            >
              Empezar
            </button>
          </div>
        )}

        {/* ---------- PLAYING ---------- */}
        {screen === "playing" && (
          <div style={{ color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingRight: onClose ? 34 : 0 }}>
              <span style={{ font: "700 11px/1 Arial,sans-serif", letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>
                Pregunta {i + 1} de {total}
              </span>
              <span style={{ font: "700 11px/1 Arial,sans-serif", color: "#fff", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.16)", padding: "7px 13px", borderRadius: 99 }}>
                {card.skill}
              </span>
            </div>

            <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", margin: "22px 0", justifyContent: "center" }}>
              {card.fig && (
                <div style={{ flex: "none", width: 230, maxWidth: "100%" }}>
                  <GridFigure kind={card.fig} style={{ borderRadius: 14 }} />
                </div>
              )}
              <div style={{ flex: "1 1 260px", minWidth: 240, textAlign: card.fig ? "left" : "center" }}>
                <div style={{ font: "700 12px/1 Arial,sans-serif", letterSpacing: ".1em", textTransform: "uppercase", color: AMBER }}>
                  Pregúntale a Camila · Ask Camila
                </div>
                <div style={{ font: "700 24px/1.3 Arial,sans-serif", color: "#fff", marginTop: 12, textWrap: "balance" } as React.CSSProperties}>{card.q_es}</div>
                <div style={{ font: "400 15px/1.4 Arial,sans-serif", color: "rgba(255,255,255,.6)", marginTop: 10 }}>{card.q_en}</div>

                {!revealed ? (
                  <button
                    onClick={() => setRevealed(true)}
                    style={{ marginTop: 20, padding: "13px 24px", border: "1px dashed #f0a33e", background: "rgba(240,163,62,.12)", color: AMBER, borderRadius: 12, font: "700 14px/1.3 Arial,sans-serif", cursor: "pointer" }}
                  >
                    Ver la respuesta (solo para ti)
                  </button>
                ) : (
                  <div style={{ marginTop: 18, padding: "14px 18px", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)", borderRadius: 14, textAlign: "left" }}>
                    <span style={{ font: "700 11px/1 Arial,sans-serif", letterSpacing: ".06em", textTransform: "uppercase", color: AMBER }}>
                      La respuesta (solo para ti) · The answer
                    </span>
                    <div style={{ font: "700 15px/1.45 Arial,sans-serif", color: "#fff", marginTop: 8 }}>{card.a_es}</div>
                    <div style={{ font: "400 13px/1.4 Arial,sans-serif", color: "rgba(255,255,255,.6)", marginTop: 5 }}>{card.a_en}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "stretch", flexWrap: "wrap" }}>
              <button
                onClick={() => advance(false)}
                style={{ flex: "1 1 120px", padding: 16, border: 0, borderRadius: 16, background: "rgba(240,163,62,.16)", color: AMBER, font: "700 16px/1.1 Arial,sans-serif", cursor: "pointer" }}
              >
                ↓ Pasar
                <span style={{ fontWeight: 400, fontSize: 12, opacity: 0.85 }}> · Pass</span>
              </button>
              <button
                onClick={() => advance(true)}
                style={{ flex: "1.5 1 140px", padding: 16, border: 0, borderRadius: 16, background: BLUE, color: "#fff", font: "700 16px/1.1 Arial,sans-serif", cursor: "pointer" }}
              >
                ↑ Acertó
                <span style={{ fontWeight: 400, fontSize: 12, opacity: 0.85 }}> · Got it</span>
              </button>
            </div>
            <button
              onClick={enableTilt}
              style={{ width: "100%", marginTop: 10, padding: 8, border: "1px solid rgba(255,255,255,.18)", borderRadius: 12, background: "none", color: "rgba(255,255,255,.7)", font: "400 12px/1.3 Arial,sans-serif", cursor: "pointer" }}
            >
              {tiltLabel}
            </button>
          </div>
        )}

        {/* ---------- DONE ---------- */}
        {screen === "done" && (
          <div style={{ textAlign: "center", padding: "8px 6px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: BLUE_BG, color: BLUE, display: "flex", alignItems: "center", justifyContent: "center", font: "700 30px/1 Arial,sans-serif", margin: "0 auto" }}>✓</div>
            <div style={{ font: "700 26px/1.2 'Kodchasan',sans-serif", color: NAVY, marginTop: 20 }}>¡Qué buen trabajo hicieron!</div>
            <div style={{ font: "400 14px/1.3 Arial,sans-serif", color: FAINT, marginTop: 6 }}>Nice work, together</div>
            <div style={{ font: "400 16px/1.5 Arial,sans-serif", color: INK, marginTop: 20 }}>
              Camila acertó <strong style={{ fontWeight: 700 }}>{correct} de {total}</strong> preguntas esta noche.
            </div>
            <div style={{ marginTop: 18, padding: "15px 16px", background: "#fff", border: `1px solid ${CARD_BORDER}`, borderRadius: 14, font: "400 14px/1.5 Arial,sans-serif", color: MUTED, maxWidth: 460, marginInline: "auto" }}>
              Lo más importante es la conversación, no el puntaje. ¡Cada intento cuenta, vuelve mañana!
              <br />
              <span style={{ color: "#a3a29d", fontSize: 12 }}>What matters is the conversation, not the score.</span>
            </div>
            <button
              onClick={restart}
              style={{ width: "100%", maxWidth: 460, marginTop: 22, padding: 16, border: 0, borderRadius: 14, background: AMBER, color: NAVY, font: "700 16px/1 Arial,sans-serif", cursor: "pointer" }}
            >
              Jugar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
