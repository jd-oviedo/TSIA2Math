"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { GridFigure } from "./GridFigure";
import { QuestionGame } from "./QuestionGame";
import { EXIT_MS, ReporteLoadingScreen } from "../components/ReporteLoadingScreen";

/* ------------------------------------------------------------------ *
 * Parent Digest: weekly progress report, rendered in one language at a time
 * (ES by default) via the toggle above the deck. Four swipeable cards:
 * teacher + status, focus + misconception, pictorial example, tonight's action.
 *
 * Palette is hardcoded from the design (not the --ec theme), matching
 * the demo/teacher surfaces. Content below is placeholder copy from the
 * design handoff; wire to real report data when available.
 * ------------------------------------------------------------------ */

const NAVY = "#0F1E35";
const NAVY_DEEP = "#0A1626"; // darker strip on top of the navy action card
const AMBER = "#f0a33e";
const BLUE = "#155A7E";
// Deep amber for label text sitting on the light-orange glass panel, where the
// blue kicker colour clashes with the backdrop.
const AMBER_INK = "#8A5712";
const SKY = "#87CEEB";
const INK = "#1A1A1A";
const MUTED = "#5F5E5A";
const FAINT = "#8b8a85";
const CARD = "#fff";
const CARD_BORDER = "#E7E6E1";
const PAGE_BG = "#F5F5F3";
const DOT_OFF = "#C9C7C0";

const FONT = 'var(--font-kodchasan, Kodchasan, sans-serif)';

/* --- glass panels --------------------------------------------------------- *
 * Translucent tinted panels used to frame each card's sections. `glass()`
 * carries the shared treatment (blur, hairline edge, lift); the tints below
 * differ only in hue and in which shadow reads correctly on their backdrop.
 * ------------------------------------------------------------------------- */

const LIFT_ON_LIGHT = "0 10px 26px -14px rgba(15,30,53,.35), inset 0 1px 0 rgba(255,255,255,.65)";
const LIFT_ON_DARK = "0 14px 32px -12px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.10)";

const GLASS = {
  amber: { fill: "rgba(240,163,62,.10)", edge: "rgba(240,163,62,.55)", lift: LIFT_ON_DARK },
  // Light-orange panel sitting on a white card, so it needs the light lift.
  orangeLight: { fill: "rgba(240,163,62,.13)", edge: "rgba(240,163,62,.45)", lift: LIFT_ON_LIGHT },
  sky: { fill: "rgba(135,206,235,.30)", edge: "rgba(135,206,235,.85)", lift: LIFT_ON_LIGHT },
  // Kept dense (.96 -> ~#19273d over white) so these panels read as the same navy
  // as the "Reporte Semanal" banner; the blur, hairline edge and lift carry the
  // glass, not the transparency.
  navy: { fill: "rgba(15,30,53,.96)", edge: "rgba(255,255,255,.18)", lift: LIFT_ON_DARK },
} as const;

function glass(tint: { fill: string; edge: string; lift: string }, radius: number) {
  return {
    background: tint.fill,
    border: `1px solid ${tint.edge}`,
    borderRadius: radius,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: tint.lift,
  } as const;
}

const MIN_HOLD_MS = 550; // logo stays visible at least this long, even on a fast connection

// Design prop: practice-area fill (default 58%).
const FOCUS_FILL = 58;

const STUDENT = "Camila";
const TEACHER = "Mr. O";

type Lang = "es" | "en";
type Band = "college" | "approaching" | "below";

/* --- placement bands ------------------------------------------------------ *
 * Same three bands the teacher dashboard scores into (see the `bandFor` helper
 * in app/teacher/TeacherDashboardClient.tsx). The text and dot hexes are that
 * palette verbatim; the panel is a glass tint of the same dot hue rather than
 * the dashboard's flat chip fill, so it matches the other cards' treatment.
 * ------------------------------------------------------------------------- */
const BANDS: Record<Band, { tint: { fill: string; edge: string; lift: string }; text: string; dot: string }> = {
  college: {
    tint: { fill: "rgba(79,154,46,.16)", edge: "rgba(79,154,46,.55)", lift: LIFT_ON_LIGHT },
    text: "#356B1B",
    dot: "#4F9A2E",
  },
  approaching: {
    tint: { fill: "rgba(198,138,47,.16)", edge: "rgba(198,138,47,.55)", lift: LIFT_ON_LIGHT },
    text: "#8A5712",
    dot: "#C68A2F",
  },
  below: {
    tint: { fill: "rgba(194,64,47,.13)", edge: "rgba(194,64,47,.45)", lift: LIFT_ON_LIGHT },
    text: "#9A2A2A",
    dot: "#C2402F",
  },
};

// Camila's current placement. Wire to the real report data alongside COPY.
const STUDENT_BAND: Band = "college";

/* --- recorded audio ------------------------------------------------------- *
 * Files live in public/audio as {slug}-{lang}.m4a. Only the pairs listed in
 * AUDIO_RECORDED have actually been recorded; every other band/language combo
 * leaves the tap-to-hear button visible but inert rather than 404-ing.
 * ------------------------------------------------------------------------- */
const AUDIO_SLUG: Record<Band, string> = {
  college: "college-ready",
  approaching: "approaching",
  below: "below-college-ready",
};

const AUDIO_RECORDED = new Set(["college-ready-es", "college-ready-en"]);

function audioSrc(band: Band, lang: Lang): string | null {
  const key = `${AUDIO_SLUG[band]}-${lang}`;
  return AUDIO_RECORDED.has(key) ? `/audio/${key}.m4a` : null;
}

const BAND_MESSAGE: Record<Band, Record<Lang, string>> = {
  college: {
    es: "Camila va por buen camino para estar lista para las matemáticas universitarias.",
    en: "Camila is on track to be ready for college math.",
  },
  approaching: {
    es: "Camila está cerca de estar lista para las matemáticas universitarias.",
    en: "Camila is approaching being ready for college math.",
  },
  below: {
    es: "Camila todavía no está lista para las matemáticas universitarias, y con práctica constante puede llegar.",
    en: "Camila isn’t ready for college math yet, and with steady practice she can get there.",
  },
};

/* Every string on the page, in both languages. The two objects are kept
 * key-for-key identical so `COPY[lang]` reads the same from either side. */
const COPY = {
  es: {
    toggle: "Español",
    banner: "Reporte Semanal",
    role: "Maestro de Matemáticas",
    school: "Summertime High School",
    cadence: "Se envía cada viernes",
    // "Reporte semanal de <Camila>" vs "<Camila>'s Weekly Report": the student
    // name is bolded mid-sentence, so each language brackets it differently.
    reportBefore: "Reporte semanal de ",
    reportAfter: "",
    statusEyebrow: "Un mensaje del maestro(a)",
    focusKicker: "Un área para mejorar",
    focusTitle: "Figuras y espacio",
    focusNote: "Con un poco más de práctica en esta área seguirá mejorando.",
    noticeTitle: "Lo Que Notamos",
    reassure: "No necesitas saber matemáticas para ayudar con las matemáticas.",
    pictorialKicker: "Muéstrale este dibujo",
    figDilTitle: "Cambió de tamaño",
    figDilSub: "más grande, mismo lugar",
    figTransTitle: "Cambió de lugar",
    figTransSub: "mismo tamaño, otro lugar",
    actionKicker: "Esta noche en la mesa",
    askLabel: "Pregúntale",
    ask: "«¿Cómo sabes que esta figura cambió de tamaño y no solo de lugar?»",
    listenLabel: "Escucha si",
    speakPlay: "Escuchar la pregunta",
    speakStop: "Detener",
    playGame: "Jugar juego de preguntas",
    carousel: "Reporte semanal",
    card: "Tarjeta",
    of: "de",
  },
  en: {
    toggle: "English",
    banner: "Weekly Report",
    role: "Math Teacher",
    school: "Summertime High School",
    cadence: "Sent every Friday",
    reportBefore: "",
    reportAfter: "’s Weekly Report",
    statusEyebrow: "A message from your teacher",
    focusKicker: "One area to practice",
    focusTitle: "Shapes and space",
    focusNote: "A little more practice here will keep her improving.",
    noticeTitle: "What We Notice",
    reassure: "You don’t need to know the math to help with the math.",
    pictorialKicker: "Show her this picture",
    figDilTitle: "Changed size",
    figDilSub: "bigger, same spot",
    figTransTitle: "Changed position",
    figTransSub: "same size, new spot",
    actionKicker: "Tonight at the table",
    askLabel: "Ask her",
    ask: "“How do you know this shape changed size, and didn’t just move?”",
    listenLabel: "Listen for",
    speakPlay: "Hear the question out loud",
    speakStop: "Stop reading",
    playGame: "Play the question game",
    carousel: "Weekly report",
    card: "Card",
    of: "of",
  },
} satisfies Record<Lang, Record<string, string>>;

type Copy = (typeof COPY)[Lang];

const CARD_COUNT = 4;
const GAP = 16;
const BASE_W = 320;
const BASE_H = 700;

// Past this much horizontal travel a pointer gesture is a swipe, not a tap;
// below it, the click is allowed through to whatever was pressed (e.g. the
// "Jugar juego de preguntas" button).
const DRAG_SLOP = 6;
const SNAP = 55;

// A gesture is classified once it leaves a small dead zone around its origin,
// and only counts as horizontal when it is clearly more sideways than vertical.
// A plain |dx| > |dy| test isn't enough: the cards scroll internally, and the
// sideways drift of a thumb scrolling up was reading as a card swipe.
const AXIS_SLOP = 8;
const AXIS_RATIO = 1.5;

/* The report copy is static for now (see CONTENT). This is where the real
 * fetch will go; today it just waits on the imagery card 1 needs, so the
 * first card doesn't appear half-painted as the loader exits. */
async function fetchReporteData() {
  if (typeof window === "undefined") return;
  await new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = "/images/mr-o.jpg";
  });
}

/* --- hooks ---------------------------------------------------------------- */

function useViewport() {
  const [vp, setVp] = useState({ w: 1280, h: 900 });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/* --- shared card fragments ------------------------------------------------ */

function MiniBanner({ f, label, deep }: { f: (n: number) => number; label: string; deep?: boolean }) {
  return (
    <div
      style={{
        flex: "none",
        background: deep ? NAVY_DEEP : NAVY,
        padding: `${f(10)}px ${f(22)}px`,
        textAlign: "center",
        font: `700 ${f(11)}px/1.2 ${FONT}`,
        letterSpacing: ".14em",
        textTransform: "uppercase",
        color: AMBER,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
}

// Scroll area shared by every card. `safe center` vertically centres short
// content (card 1 would otherwise bottom-out with dead space) but falls back
// to top-aligned when the content is taller than the card, so nothing gets
// clipped out of reach on a short viewport.
function CardBody({
  f,
  pad,
  justify = "safe center",
  children,
}: {
  f: (n: number) => number;
  pad: string;
  // "space-evenly" spreads a short card's blocks to fill it; only safe where the
  // content is known to fit, since it clips the top when it doesn't.
  justify?: "safe center" | "space-evenly";
  children: React.ReactNode;
}) {
  return (
    <div
      className="um-scroll"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: pad,
        display: "flex",
        flexDirection: "column",
        justifyContent: justify,
        textAlign: "center",
        gap: f(2),
      }}
    >
      {children}
    </div>
  );
}

// Section kicker: a light-blue glass bubble, mirroring the "Esta noche en la
// mesa" pill on the action card.
function KickerPill({ label, f }: { label: string; f: (n: number) => number }) {
  return (
    <div className="uml" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: f(16) }}>
      <span
        style={{
          ...glass(GLASS.sky, 999),
          color: BLUE,
          font: `700 ${f(11)}px/1.2 ${FONT}`,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          padding: `${f(7)}px ${f(14)}px`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Figure({
  kind,
  title,
  sub,
  f,
}: {
  kind: "dil" | "trans";
  title: string;
  sub: string;
  f: (n: number) => number;
}) {
  return (
    <div style={{ border: `1.5px solid ${CARD_BORDER}`, borderRadius: f(16), overflow: "hidden", maxWidth: f(232), margin: "0 auto" }}>
      <GridFigure kind={kind} />
      <div style={{ textAlign: "center", padding: `${f(12)}px ${f(8)}px ${f(14)}px`, background: CARD }}>
        <div style={{ font: `700 ${f(15)}px/1.2 ${FONT}`, color: INK }}>{title}</div>
        <div style={{ font: `400 ${f(12)}px/1.3 ${FONT}`, color: MUTED, marginTop: f(4) }}>{sub}</div>
      </div>
    </div>
  );
}

/* --- cards ---------------------------------------------------------------- */

function TeacherCard({ f, lang, c }: { f: (n: number) => number; lang: Lang; c: Copy }) {
  const avatar = f(72);
  const band = BANDS[STUDENT_BAND];
  return (
    <>
      <MiniBanner f={f} label={c.banner} />
      <CardBody f={f} pad={`${f(18)}px ${f(16)}px`} justify="space-evenly">
        {/* Teacher identity, on its own navy banner so the sender reads first. */}
        <div
          className="uml"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: f(14),
            ...glass(GLASS.navy, f(20)),
            padding: `${f(18)}px ${f(15)}px`,
          }}
        >
          <div
            style={{
              width: avatar,
              height: avatar,
              flex: "none",
              borderRadius: "50%",
              overflow: "hidden",
              position: "relative",
              background: SKY,
              boxShadow: `0 0 0 2px ${AMBER}`,
            }}
          >
            {/* 256px square headshot, nudged up so the face sits centred in the circle. */}
            <img
              src="/images/mr-o.jpg"
              alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 12%", display: "block" }}
            />
          </div>
          {/* Mr. O's contact block stays left-aligned, beside the avatar. */}
          <div style={{ minWidth: 0, textAlign: "left", whiteSpace: "nowrap" }}>
            <div style={{ font: `700 ${f(24)}px/1.15 ${FONT}`, color: "#fff" }}>{TEACHER}</div>
            <div style={{ font: `600 ${f(12)}px/1.35 ${FONT}`, color: AMBER, marginTop: f(4) }}>{c.role}</div>
            <div style={{ font: `400 ${f(12)}px/1.35 ${FONT}`, color: "rgba(255,255,255,.72)", marginTop: f(3) }}>{c.school}</div>
          </div>
        </div>

        <div className="uml">
          <div style={{ font: `400 ${f(15)}px/1.4 ${FONT}`, color: MUTED }}>
            {c.reportBefore}
            <strong style={{ fontWeight: 700, color: INK }}>{STUDENT}</strong>
            {c.reportAfter}
          </div>
          {/* Cadence line: fills the gap under the headline and sets the
              expectation that this arrives weekly. Deliberately quiet. */}
          <div style={{ font: `400 ${f(12)}px/1.4 ${FONT}`, color: FAINT, marginTop: f(6) }}>{c.cadence}</div>
        </div>

        {/* Status: the eyebrow is fixed across all three bands; only the colour
            treatment and the message body move with the placement. */}
        <div className="uml" style={{ ...glass(band.tint, f(20)), padding: `${f(22)}px ${f(18)}px ${f(24)}px` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: f(8), marginBottom: f(12) }}>
            <span style={{ width: f(9), height: f(9), borderRadius: "50%", background: band.dot, display: "inline-block", flex: "none" }} />
            <span style={{ font: `700 ${f(11)}px/1.2 ${FONT}`, letterSpacing: ".13em", textTransform: "uppercase", color: band.text }}>
              {c.statusEyebrow}
            </span>
          </div>
          <div style={{ font: `700 ${f(21)}px/1.3 ${FONT}`, color: band.text }}>{BAND_MESSAGE[STUDENT_BAND][lang]}</div>
        </div>
      </CardBody>
    </>
  );
}

function FocusCard({ f, lang, c }: { f: (n: number) => number; lang: Lang; c: Copy }) {
  return (
    <>
      <MiniBanner f={f} label={c.banner} />
      <CardBody f={f} pad={`${f(22)}px ${f(20)}px`}>
        <KickerPill label={c.focusKicker} f={f} />

        {/* The focus area, framed in dark-blue glass. */}
        <div className="uml" style={{ ...glass(GLASS.navy, f(20)), padding: `${f(18)}px ${f(17)}px ${f(19)}px` }}>
          <div style={{ font: `700 ${f(23)}px/1.15 ${FONT}`, color: "#fff" }}>{c.focusTitle}</div>
          <div style={{ margin: `${f(17)}px 0 ${f(16)}px` }}>
            <div style={{ height: f(12), borderRadius: 999, background: "rgba(255,255,255,.14)", overflow: "hidden" }}>
              <div style={{ width: `${FOCUS_FILL}%`, height: "100%", borderRadius: 999, background: AMBER }} />
            </div>
          </div>
          <div style={{ font: `400 ${f(13)}px/1.4 ${FONT}`, color: "rgba(255,255,255,.86)" }}>{c.focusNote}</div>
        </div>

        {/* The misconception, framed in light-orange glass. Each language keeps
            its own bolding, so the sentence can't live in COPY as a flat string. */}
        <div className="uml" style={{ ...glass(GLASS.orangeLight, f(18)), marginTop: f(18), padding: `${f(16)}px ${f(15)}px ${f(17)}px` }}>
          <div style={{ font: `700 ${f(13)}px/1.2 ${FONT}`, letterSpacing: ".08em", textTransform: "uppercase", color: AMBER_INK, marginBottom: f(10) }}>
            {c.noticeTitle}
          </div>
          <div style={{ font: `400 ${f(15)}px/1.42 ${FONT}`, color: INK }}>
            {lang === "es" ? (
              <>
                Camila tiene dificultad para identificar la diferencia entre una figura que{" "}
                <strong style={{ fontWeight: 700 }}>cambia de tamaño</strong> y una que solo{" "}
                <strong style={{ fontWeight: 700 }}>cambia de posición</strong>.
              </>
            ) : (
              <>
                Camila has trouble telling the difference between a shape that{" "}
                <strong style={{ fontWeight: 700 }}>changes size</strong> and one that{" "}
                <strong style={{ fontWeight: 700 }}>only changes position</strong>.
              </>
            )}
          </div>
        </div>

        <div className="uml" style={{ marginTop: f(20) }}>
          <div style={{ font: `700 ${f(15)}px/1.3 ${FONT}`, color: INK }}>{c.reassure}</div>
        </div>
      </CardBody>
    </>
  );
}

function PictorialCard({ f, c }: { f: (n: number) => number; c: Copy }) {
  return (
    <>
      <MiniBanner f={f} label={c.banner} />
      <CardBody f={f} pad={`${f(24)}px ${f(20)}px`}>
        <KickerPill label={c.pictorialKicker} f={f} />
        <div className="uml" style={{ marginBottom: f(20) }}>
          <Figure kind="dil" title={c.figDilTitle} sub={c.figDilSub} f={f} />
        </div>
        <div className="uml">
          <Figure kind="trans" title={c.figTransTitle} sub={c.figTransSub} f={f} />
        </div>
      </CardBody>
    </>
  );
}

function ActionCard({ f, lang, c, onPlay }: { f: (n: number) => number; lang: Lang; c: Copy; onPlay: () => void }) {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const src = audioSrc(STUDENT_BAND, lang);

  const speak = useCallback(() => {
    const el = audioRef.current;
    // No recording for this band/language yet: the button stays visible but
    // does nothing, rather than erroring on a 404.
    if (!el || !src) return;

    try {
      // A second tap stops the recording; it never stacks a second playback on
      // top of the first.
      if (!el.paused) {
        el.pause();
        el.currentTime = 0;
        setSpeaking(false);
        return;
      }
      el.currentTime = 0;
      setSpeaking(true);
      // play() rejects on autoplay policy or a missing/undecodable file. Either
      // way the button just falls back to its resting state.
      void el.play().catch(() => setSpeaking(false));
    } catch {
      setSpeaking(false);
    }
  }, [src]);

  // Switching language mid-playback would leave the button stuck on "Stop",
  // and the <audio> src changes out from under it.
  useEffect(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setSpeaking(false);
  }, [lang]);

  return (
    <>
      <MiniBanner f={f} label={c.banner} deep />
      <CardBody f={f} pad={`${f(18)}px ${f(20)}px`}>
        <div className="uml" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: f(14) }}>
          <span
            style={{ background: AMBER, color: NAVY, font: `700 ${f(11)}px/1.2 ${FONT}`, letterSpacing: ".08em", textTransform: "uppercase", padding: `${f(7)}px ${f(13)}px`, borderRadius: 999 }}
          >
            {c.actionKicker}
          </span>
        </div>

        {/* The ask, lifted off the navy in a floating glass panel. */}
        <div
          className="uml"
          style={{ ...glass(GLASS.amber, f(20)), textAlign: "center", padding: `${f(13)}px ${f(14)}px ${f(15)}px` }}
        >
          <div style={{ font: `700 ${f(11)}px/1.2 ${FONT}`, letterSpacing: ".1em", textTransform: "uppercase", color: AMBER, marginBottom: f(8) }}>
            {c.askLabel}
          </div>
          <div style={{ font: `700 ${f(19)}px/1.3 ${FONT}`, color: "#fff" }}>{c.ask}</div>
        </div>

        <div className="uml" style={{ height: 1, background: "rgba(255,255,255,.13)", margin: `${f(14)}px 0` }} />

        <div className="uml" style={{ textAlign: "center", font: `700 ${f(11)}px/1.2 ${FONT}`, letterSpacing: ".1em", textTransform: "uppercase", color: AMBER, marginBottom: f(8) }}>
          {c.listenLabel}
        </div>
        <div className="uml" style={{ font: `400 ${f(16)}px/1.42 ${FONT}`, color: "#eef2f6" }}>
          {lang === "es" ? (
            <>
              Habla del <strong style={{ fontWeight: 700 }}>tamaño</strong>, si se hizo más grande o más pequeña, no solo de que se movió.
            </>
          ) : (
            <>
              Whether she talks about <strong style={{ fontWeight: 700 }}>size</strong> — bigger or smaller — not just that it moved.
            </>
          )}
        </div>

        {/* Rendered only when a recording exists, so the browser never requests
            a file that isn't there. `preload="none"` keeps the card's first
            paint free of an audio fetch. */}
        {src && (
          <audio
            ref={audioRef}
            src={src}
            preload="none"
            onEnded={() => setSpeaking(false)}
            onPause={() => setSpeaking(false)}
            onError={() => setSpeaking(false)}
          />
        )}

        <button
          type="button"
          onClick={speak}
          aria-disabled={!src}
          className="uml"
          style={{ marginTop: f(14), width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: f(12), background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", borderRadius: f(16), padding: `${f(11)}px ${f(14)}px`, cursor: src ? "pointer" : "default", textAlign: "left" }}
        >
          <span style={{ width: f(44), height: f(44), borderRadius: "50%", background: AMBER, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            {speaking ? (
              <svg width={f(16)} height={f(16)} viewBox="0 0 16 16" aria-hidden="true">
                <rect x="2" y="2" width="12" height="12" rx="2" fill={NAVY} />
              </svg>
            ) : (
              <svg width={f(16)} height={f(18)} viewBox="0 0 16 18" aria-hidden="true">
                <polygon points="2,1 15,9 2,17" fill={NAVY} />
              </svg>
            )}
          </span>
          <span>
            <span style={{ display: "block", font: `700 ${f(15)}px/1.2 ${FONT}`, color: "#fff" }}>
              {speaking ? c.speakStop : c.speakPlay}
            </span>
          </span>
        </button>

        <div className="uml" style={{ marginTop: f(10) }}>
          <button
            onClick={onPlay}
            style={{ width: "100%", background: AMBER, color: NAVY, font: `700 ${f(17)}px/1.2 ${FONT}`, border: "none", borderRadius: f(16), padding: f(14), cursor: "pointer" }}
          >
            {c.playGame}
          </button>
        </div>
      </CardBody>
    </>
  );
}

/* --- page ----------------------------------------------------------------- */

export default function ReportePage() {
  const { w, h } = useViewport();
  const reduced = usePrefersReducedMotion();

  const [gameOpen, setGameOpen] = useState(false);

  // Spanish is the default view; the toggle is in-memory only, by design.
  const [lang, setLang] = useState<Lang>("es");
  const c = COPY[lang];

  // Loader: hold the mark briefly, then slide it out while card 1 fades in.
  const [dataReady, setDataReady] = useState(false);
  const [minHoldDone, setMinHoldDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [contentEntered, setContentEntered] = useState(false);

  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [drag, setDrag] = useState(0);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const trackRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const axis = useRef<"x" | "y" | null>(null);
  const movedRef = useRef(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isDesktop = w >= 900;
  const S = isDesktop ? 1.08 : 1;
  const f = useCallback((n: number) => Math.round(n * S), [S]);

  const cardW = Math.round(BASE_W * S);
  // Keep the card inside the viewport on short laptops; it scrolls internally.
  const cardH = Math.max(520, Math.min(Math.round(BASE_H * S), h - f(100)));
  const step = cardW + GAP;
  const pad = Math.max(GAP, (containerW - cardW) / 2);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setContainerW(e.contentRect.width));
    ro.observe(el);
    setContainerW(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchReporteData().then(() => {
      if (!cancelled) setDataReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMinHoldDone(true), MIN_HOLD_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!dataReady || !minHoldDone || exiting) return;
    setExiting(true);
    // Content starts fading in as the loader exits, so the two crossfade.
    const raf = requestAnimationFrame(() => {
      setContentEntered(true);
      setRevealed({ 0: true });
    });
    const t = setTimeout(() => setShowLoader(false), EXIT_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [dataReady, minHoldDone, exiting]);

  useEffect(() => () => clearTimeout(revealTimer.current), []);

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(CARD_COUNT - 1, i));
      setIndex(next);
      setRevealed((r) => {
        if (r[next]) return r;
        clearTimeout(revealTimer.current);
        revealTimer.current = setTimeout(() => setRevealed((s) => ({ ...s, [next]: true })), reduced ? 0 : 420);
        return r;
      });
    },
    [reduced],
  );

  // Drag is tracked on `window` rather than via setPointerCapture: capturing
  // the pointer on the track retargets the gesture away from whatever was
  // pressed, which swallowed the click on the "Jugar juego de preguntas"
  // button. Instead a gesture only becomes a swipe once it passes DRAG_SLOP,
  // and a click is suppressed (below) only when that actually happened.
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;

      // Classify the gesture once it leaves the dead zone, then hold that axis
      // until the pointer lifts. Without the lock, a scroll that starts vertical
      // and drifts sideways past SNAP flips the card out from under the reader.
      if (!axis.current) {
        if (Math.abs(dx) < AXIS_SLOP && Math.abs(dy) < AXIS_SLOP) return;
        axis.current = Math.abs(dx) > Math.abs(dy) * AXIS_RATIO ? "x" : "y";
      }

      // Vertical: the gesture belongs to the card's own scroller. Leave `drag`
      // at 0 and never preventDefault, so the browser scrolls it natively.
      if (axis.current === "y") return;

      if (Math.abs(dx) > DRAG_SLOP) movedRef.current = true;
      setDrag(dx);
    };
    const onUp = (e: PointerEvent) => {
      const dx = e.clientX - startX.current;
      const swiped = axis.current === "x";
      axis.current = null;
      setDragging(false);
      setDrag(0);
      if (!swiped) return;
      if (dx < -SNAP) go(index + 1);
      else if (dx > SNAP) go(index - 1);
    };
    // The browser took the gesture over (it began a native scroll): drop it
    // without snapping, or a scroll would land as a card change.
    const onCancel = () => {
      axis.current = null;
      setDragging(false);
      setDrag(0);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [dragging, index, go]);

  // React registers touchmove passively at the root, where preventDefault is a
  // no-op, so the listener that suppresses scrolling mid-swipe has to be
  // non-passive and bound to the track. It only fires for a gesture already
  // locked to x; a vertical one is left entirely to the browser.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (axis.current === "x") e.preventDefault();
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    axis.current = null;
    movedRef.current = false;
    setDragging(true);
  };

  // Swallow the click that ends a real swipe; let a plain tap through.
  const onClickCapture = (e: React.MouseEvent) => {
    if (!movedRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    movedRef.current = false;
  };

  const x = pad - index * step + (dragging ? drag : 0);

  const cards = [
    <TeacherCard key="teacher" f={f} lang={lang} c={c} />,
    <FocusCard key="focus" f={f} lang={lang} c={c} />,
    <PictorialCard key="pictorial" f={f} c={c} />,
    <ActionCard key="action" f={f} lang={lang} c={c} onPlay={() => setGameOpen(true)} />,
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${PAGE_BG}; -webkit-font-smoothing: antialiased; }

        @keyframes umWobble {
          0%   { transform: rotate(0deg); }
          22%  { transform: rotate(-3.4deg); }
          52%  { transform: rotate(2.8deg); }
          78%  { transform: rotate(-1.3deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes umFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .um-card[data-um-reveal="1"] { animation: umWobble .95s cubic-bezier(.36,.07,.19,.97) .22s both; }
        .um-scroll > .uml { opacity: 0; }
        .um-card[data-um-reveal="1"] .um-scroll > .uml { animation: umFadeUp .5s ease-out both; }
        .um-card[data-um-reveal="1"] .um-scroll > .uml:nth-child(1) { animation-delay: .10s; }
        .um-card[data-um-reveal="1"] .um-scroll > .uml:nth-child(2) { animation-delay: .20s; }
        .um-card[data-um-reveal="1"] .um-scroll > .uml:nth-child(3) { animation-delay: .30s; }
        .um-card[data-um-reveal="1"] .um-scroll > .uml:nth-child(4) { animation-delay: .40s; }
        .um-card[data-um-reveal="1"] .um-scroll > .uml:nth-child(5) { animation-delay: .50s; }
        .um-card[data-um-reveal="1"] .um-scroll > .uml:nth-child(6) { animation-delay: .60s; }
        .um-card[data-um-reveal="1"] .um-scroll > .uml:nth-child(7) { animation-delay: .70s; }
        .um-card[data-um-reveal="1"] .um-scroll > .uml:nth-child(8) { animation-delay: .80s; }
        .um-scroll::-webkit-scrollbar { width: 0; height: 0; }

        @media (prefers-reduced-motion: reduce) {
          .um-card[data-um-reveal="1"], .um-card[data-um-reveal="1"] .um-scroll > .uml { animation: none !important; }
          .um-scroll > .uml { opacity: 1; }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          background: PAGE_BG,
          fontFamily: FONT,
          color: INK,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {showLoader && <ReporteLoadingScreen exiting={exiting} />}

        <div
          style={{
            opacity: contentEntered ? 1 : 0,
            transform: contentEntered ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 500ms ease 150ms, transform 500ms ease 150ms",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: f(24),
            padding: `${f(24)}px 0`,
          }}
        >
          {/* Language toggle. Sits above the deck so it reads as page-level
              chrome rather than part of any one card. */}
          <div
            role="group"
            aria-label="Language / Idioma"
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: 999,
              boxShadow: "0 2px 8px rgba(15,30,53,.08)",
            }}
          >
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: `${f(7)}px ${f(16)}px`,
                  cursor: "pointer",
                  font: `700 ${f(13)}px/1.2 ${FONT}`,
                  background: lang === l ? NAVY : "transparent",
                  color: lang === l ? "#fff" : MUTED,
                  transition: "background .2s, color .2s",
                }}
              >
                {COPY[l].toggle}
              </button>
            ))}
          </div>

          <div
            ref={trackRef}
            role="group"
            aria-roledescription="carousel"
            aria-label={c.carousel}
            onPointerDown={onPointerDown}
            onClickCapture={onClickCapture}
            style={{
              width: "100%",
              height: cardH,
              overflow: "hidden",
              position: "relative",
              touchAction: "pan-y",
              cursor: dragging ? "grabbing" : "grab",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                display: "flex",
                alignItems: "center",
                gap: GAP,
                willChange: "transform",
                transform: `translateX(${x}px)`,
                transition: dragging ? "none" : "transform .42s cubic-bezier(.22,.61,.36,1)",
              }}
            >
              {cards.map((card, i) => (
                <div
                  key={i}
                  className="um-card"
                  data-um-reveal={revealed[i] || reduced ? "1" : "0"}
                  aria-hidden={i !== index}
                  style={{
                    flex: "none",
                    width: cardW,
                    height: cardH,
                    background: i === 3 ? NAVY : CARD,
                    borderRadius: f(28),
                    boxShadow:
                      i === 3
                        ? "0 18px 40px rgba(10,20,35,.32), 0 2px 6px rgba(0,0,0,.15)"
                        : "0 18px 40px rgba(15,30,53,.16), 0 2px 6px rgba(0,0,0,.05)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {card}
                </div>
              ))}
            </div>
          </div>

          {/* dots */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
            {Array.from({ length: CARD_COUNT }, (_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`${c.card} ${i + 1} ${c.of} ${CARD_COUNT}`}
                aria-current={i === index}
                style={{
                  width: i === index ? 24 : 8,
                  height: 8,
                  padding: 0,
                  border: "none",
                  borderRadius: 999,
                  background: i === index ? NAVY : DOT_OFF,
                  transition: "all .3s",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: f(10), font: `400 ${f(12)}px/1.5 ${FONT}`, color: "#a3a29d", padding: "0 16px" }}>
            <span>© 2026 UnpackMath</span>
            <span aria-hidden="true">·</span>
            <a href="https://unpackmath.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
              Privacy
            </a>
            <span aria-hidden="true">·</span>
            <a href="https://unpackmath.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
              Terms
            </a>
          </div>
        </div>
      </div>

      {gameOpen && <QuestionGame onClose={() => setGameOpen(false)} />}
    </>
  );
}
