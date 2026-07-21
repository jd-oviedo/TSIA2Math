"use client";

import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FONT_BODY } from "../components/fonts";

const NAVY = "#0F1E35";
const STUDENT_ORANGE = "#F0A33E";
const NEAR_BLACK = "#1A1A1A";
const WARM_GRAY = "#5F5E5A";
const SKY = "#6FBEE6";
const SKY_BUBBLE = "#87CEEB";

const KODCHASAN = "var(--font-kodchasan, Kodchasan, sans-serif)";
const SANS = "Arial, system-ui, sans-serif";

// Google Apps Script Web App backing the interest sheet. Writes are fire-and-forget:
// the Apps Script endpoint does not send CORS headers, so we post with mode "no-cors"
// and can never read the response. The UI must therefore never await or gate on it.
const SHEET_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwGzO5yoSG8oayo2gsLasfrty98qntU_SAWMkfnBTnu9skabZTzCLpUODAEllDAYGwlaA/exec";

const PRICING_URL = "https://unpackmath.com/pricing";
const FOUNDING_INTENT = "Reserve my founding spot";
const REDIRECT_DELAY_MS = 2500;

type FormRole = "Teacher" | "Parent" | "Admin / District Staff";

// Role bubbles stay English-only by design; every other label is paired.
const FORM_ROLES: FormRole[] = ["Teacher", "Parent", "Admin / District Staff"];

// `en` is the canonical value written to the sheet — the Spanish half is display
// only, so the founding-spot match and the sheet's columns stay in one language.
type Intent = { en: string; es: string };

const INTENTS: Record<FormRole, Intent[]> = {
  Teacher: [
    { en: FOUNDING_INTENT, es: "Reservar mi lugar fundador" },
    { en: "I want to pilot this with my class", es: "Quiero probar esto con mi clase" },
    { en: "Bring this to my school or district", es: "Llevar esto a mi escuela o distrito" },
    { en: "Just curious, keep me posted", es: "Solo tengo curiosidad, mantenme al tanto" },
  ],
  Parent: [
    { en: "My child already tried the test", es: "Mi hijo(a) ya tomó el examen" },
    {
      en: "Send me the weekly digest when it's ready",
      es: "Envíenme el reporte semanal cuando esté listo",
    },
    { en: "I prefer information in Spanish", es: "Prefiero información en español" },
    { en: "Just want updates", es: "Solo quiero actualizaciones" },
  ],
  "Admin / District Staff": [
    { en: FOUNDING_INTENT, es: "Reservar mi lugar fundador" },
    { en: "Bring this to my school or district", es: "Llevar esto a mi escuela o distrito" },
    { en: "Just curious, keep me posted", es: "Solo tengo curiosidad, mantenme al tanto" },
  ],
};

// Filled bubbles inside the mini-form. The Teacher box uses sky blue with navy
// text; every other box keeps the navy-on-white default.
type Theme = { bubble: string; onBubble: string };
const TEACHER_THEME: Theme = { bubble: SKY_BUBBLE, onBubble: NAVY };
const DEFAULT_THEME: Theme = { bubble: NAVY, onBubble: "#fff" };

type Role = {
  key: string;
  href: string;
  label: string;
  labelEs: string;
  background: string;
  shadow: string;
  subLabelColor: string;
  external?: boolean;
  // Roles without a capture form (Student) tap straight through, untouched.
  capture?: FormRole;
};

const ROLES: Role[] = [
  {
    key: "student",
    href: "/adaptive-test",
    label: "Student",
    labelEs: "Estudiante",
    background: STUDENT_ORANGE,
    shadow: "0 8px 20px rgba(240,163,62,0.34)",
    subLabelColor: "rgba(255,255,255,0.9)",
  },
  {
    key: "teacher",
    href: "https://app.unpackmath.com/demo",
    label: "Teacher",
    labelEs: "Maestro(a)",
    background: SKY,
    shadow: "0 8px 20px rgba(111,190,230,0.36)",
    subLabelColor: "rgba(255,255,255,0.92)",
    external: true,
    capture: "Teacher",
  },
  {
    key: "parent",
    href: "/reporte",
    label: "Parent/Guardian",
    labelEs: "Padre/Madre/Guardián",
    background: NAVY,
    shadow: "0 8px 20px rgba(15,30,53,0.28)",
    subLabelColor: "rgba(255,255,255,0.8)",
    capture: "Parent",
  },
];

const CARD: CSSProperties = {
  marginTop: "10px",
  padding: "16px",
  borderRadius: "18px",
  background: "#fff",
  border: "1px solid rgba(15,30,53,0.10)",
  boxShadow: "0 6px 18px rgba(15,30,53,0.07)",
  textAlign: "left",
};

const INPUT: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  marginTop: "6px",
  padding: "12px 14px",
  fontFamily: FONT_BODY,
  fontSize: "16px", // 16px keeps iOS Safari from zooming on focus.
  color: NEAR_BLACK,
  background: "#fff",
  border: "1px solid rgba(15,30,53,0.18)",
  borderRadius: "12px",
};

const FIELD_LABEL: CSSProperties = {
  display: "block",
  fontFamily: FONT_BODY,
  fontSize: "13px",
  color: WARM_GRAY,
};

/**
 * English / Español pairing, with the Spanish half set lighter. `stack` drops the
 * slash and puts the Spanish on its own line — used where the pair is the whole
 * label of a full-width control and the separator would just add clutter.
 */
function Bi({ en, es, stack }: { en: string; es: string; stack?: boolean }) {
  if (stack) {
    return (
      <>
        {en}
        <span style={{ display: "block", opacity: 0.72 }}>{es}</span>
      </>
    );
  }
  return (
    <>
      {en} <span style={{ opacity: 0.72 }}>/ {es}</span>
    </>
  );
}

function chipStyle(selected: boolean, theme: Theme): CSSProperties {
  return {
    padding: "9px 14px",
    fontFamily: FONT_BODY,
    fontSize: "14px",
    lineHeight: 1.25,
    textAlign: "left",
    color: selected ? theme.onBubble : NEAR_BLACK,
    background: selected ? theme.bubble : "#fff",
    border: `1px solid ${selected ? theme.bubble : "rgba(15,30,53,0.18)"}`,
    borderRadius: "999px",
    cursor: "pointer",
  };
}

/** Multi-select intent row: square box + checkmark, unlimited selections. */
function CheckOption({
  checked,
  onToggle,
  theme,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        width: "100%",
        padding: "10px 12px",
        fontFamily: FONT_BODY,
        fontSize: "14px",
        lineHeight: 1.3,
        textAlign: "left",
        color: NEAR_BLACK,
        background: checked ? "rgba(111,190,230,0.16)" : "#fff",
        border: `1px solid ${checked ? theme.bubble : "rgba(15,30,53,0.18)"}`,
        borderRadius: "12px",
        cursor: "pointer",
      }}
    >
      <span
        aria-hidden
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "20px",
          height: "20px",
          marginTop: "1px",
          fontSize: "13px",
          lineHeight: 1,
          color: theme.onBubble,
          background: checked ? theme.bubble : "#fff",
          border: `1px solid ${checked ? theme.bubble : "rgba(15,30,53,0.28)"}`,
          borderRadius: "6px",
        }}
      >
        {checked ? "✓" : ""}
      </span>
      <span>{children}</span>
    </button>
  );
}

type Stage = "closed" | "prompt" | "form" | "thanks" | "redirecting";

function RoleCapture({ role }: { role: Role }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("prompt");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formRole, setFormRole] = useState<FormRole | "">(role.capture ?? "");
  const [intents, setIntents] = useState<string[]>([]);

  const isTeacher = role.key === "teacher";
  const theme = isTeacher ? TEACHER_THEME : DEFAULT_THEME;
  // Teachers land on the demo dashboard, so the exit link names the destination
  // rather than reading as a generic dismissal.
  const exitLabel = isTeacher
    ? { en: "Take me to the Dashboard", es: "Llévame al panel" }
    : { en: "Skip and continue", es: "Omitir y continuar" };

  function go() {
    if (role.external) {
      window.location.href = role.href;
    } else {
      router.push(role.href);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !formRole || intents.length === 0) return;

    // Preserve the on-screen order rather than click order, so the sheet reads
    // the same way the form does.
    const ordered = INTENTS[formRole].filter((o) => intents.includes(o.en)).map((o) => o.en);

    // Fire-and-forget: no-cors responses are opaque, so there is nothing to check.
    // A network failure must not strand the user on a spinner at a festival booth.
    void fetch(SHEET_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        name: name.trim(),
        email: email.trim(),
        role: formRole,
        intent: ordered.join("; "),
        source: "EHHPF /go",
      }),
    }).catch(() => {});

    // Fires whenever the founding spot is among the picks, alone or alongside others.
    if (ordered.includes(FOUNDING_INTENT)) {
      setStage("redirecting");
      // Non-skippable by product decision: no bail-out control is rendered in
      // this state, and the timer always runs to completion.
      window.setTimeout(() => {
        window.location.href = PRICING_URL;
      }, REDIRECT_DELAY_MS);
      return;
    }

    setStage("thanks");
  }

  if (stage === "closed") return null;

  if (stage === "redirecting") {
    return (
      <div style={{ ...CARD, textAlign: "center" }}>
        <p style={{ margin: 0, fontFamily: FONT_BODY, fontSize: "18px", color: NEAR_BLACK }}>
          You&rsquo;re in! 🎉
        </p>
        <p style={{ margin: "4px 0 0", fontFamily: FONT_BODY, fontSize: "15px", color: WARM_GRAY }}>
          Taking you to the founding teacher page&hellip;
        </p>
        <p style={{ margin: "10px 0 0", fontFamily: FONT_BODY, fontSize: "18px", color: NEAR_BLACK }}>
          &iexcl;Ya est&aacute;s dentro! 🎉
        </p>
        <p style={{ margin: "4px 0 0", fontFamily: FONT_BODY, fontSize: "15px", color: WARM_GRAY }}>
          Te llevamos a la p&aacute;gina de maestros fundadores&hellip;
        </p>
      </div>
    );
  }

  if (stage === "thanks") {
    return (
      <div style={{ ...CARD, textAlign: "center" }}>
        <p style={{ margin: 0, fontFamily: FONT_BODY, fontSize: "18px", color: NEAR_BLACK }}>
          Thanks, {name.trim()}! You&rsquo;re on the list.
        </p>
        <p style={{ margin: "4px 0 0", fontFamily: FONT_BODY, fontSize: "15px", color: WARM_GRAY }}>
          We&rsquo;ll be in touch soon.
        </p>
        <p style={{ margin: "10px 0 0", fontFamily: FONT_BODY, fontSize: "18px", color: NEAR_BLACK }}>
          &iexcl;Gracias, {name.trim()}! Ya est&aacute;s en la lista.
        </p>
        <p style={{ margin: "4px 0 0", fontFamily: FONT_BODY, fontSize: "15px", color: WARM_GRAY }}>
          Nos pondremos en contacto pronto.
        </p>
        <button type="button" onClick={go} style={{ ...chipStyle(false, theme), marginTop: "12px" }}>
          Continue / Continuar
        </button>
      </div>
    );
  }

  if (stage === "prompt") {
    return (
      <div
        style={{
          ...CARD,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: "10px",
        }}
      >
        <button
          type="button"
          onClick={() => setStage("form")}
          style={{
            flex: "1 1 auto",
            padding: "10px 14px",
            fontFamily: FONT_BODY,
            fontSize: "15px",
            color: NAVY,
            background: "rgba(111,190,230,0.16)",
            border: "1px solid rgba(15,30,53,0.12)",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          <Bi en="Want updates? Takes 30 seconds" es="¿Quieres novedades? Toma 30 segundos" stack />
        </button>
        <button
          type="button"
          onClick={go}
          style={{
            padding: "10px 6px",
            fontFamily: FONT_BODY,
            fontSize: "14px",
            color: WARM_GRAY,
            background: "none",
            border: "none",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          <Bi en={exitLabel.en} es={exitLabel.es} />
        </button>
      </div>
    );
  }

  const intentOptions = formRole ? INTENTS[formRole] : [];
  const canSubmit = Boolean(name.trim() && email.trim() && formRole && intents.length > 0);

  return (
    <form style={CARD} onSubmit={handleSubmit}>
      <label style={FIELD_LABEL}>
        <Bi en="NAME" es="NOMBRE" />
        <input
          style={INPUT}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </label>

      <label style={{ ...FIELD_LABEL, marginTop: "12px" }}>
        <Bi en="EMAIL" es="CORREO ELECTRÓNICO" />
        <input
          style={INPUT}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          required
        />
      </label>

      <p style={{ ...FIELD_LABEL, margin: "14px 0 8px" }}>
        <Bi en="I AM A…" es="SOY UN(A)…" />
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {FORM_ROLES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={formRole === option}
            onClick={() => {
              setFormRole(option);
              // Intent options are role-specific, so a role change invalidates the picks.
              setIntents([]);
            }}
            style={chipStyle(formRole === option, theme)}
          >
            {option}
          </button>
        ))}
      </div>

      {formRole ? (
        <>
          <p style={{ ...FIELD_LABEL, margin: "14px 0 8px" }}>
            <Bi en="WHAT BRINGS YOU HERE?" es="¿QUÉ TE TRAE AQUÍ?" />
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {intentOptions.map((option) => (
              <CheckOption
                key={option.en}
                theme={theme}
                checked={intents.includes(option.en)}
                onToggle={() =>
                  setIntents((prev) =>
                    prev.includes(option.en)
                      ? prev.filter((v) => v !== option.en)
                      : [...prev, option.en],
                  )
                }
              >
                <Bi en={option.en} es={option.es} />
              </CheckOption>
            ))}
          </div>
        </>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          width: "100%",
          marginTop: "16px",
          padding: "13px",
          fontFamily: FONT_BODY,
          fontSize: "17px",
          color: canSubmit ? theme.onBubble : "#fff",
          background: canSubmit ? theme.bubble : "rgba(15,30,53,0.28)",
          border: "none",
          borderRadius: "14px",
          cursor: canSubmit ? "pointer" : "not-allowed",
        }}
      >
        Submit / Enviar
      </button>

      <button
        type="button"
        onClick={go}
        style={{
          display: "block",
          width: "100%",
          marginTop: "10px",
          padding: "6px",
          fontFamily: FONT_BODY,
          fontSize: "14px",
          color: WARM_GRAY,
          background: "none",
          border: "none",
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        <Bi en={exitLabel.en} es={exitLabel.es} />
      </button>
    </form>
  );
}

export function RoleTapList() {
  // Which capture-enabled role the visitor tapped, if any. Only one is ever open.
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
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

        // Capture roles open the mini-form in place rather than navigating; the
        // form's own "Skip and continue" performs the routing.
        if (role.capture) {
          return (
            <div key={role.key}>
              <a
                href={role.href}
                className="um-tap"
                style={tapStyle}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenKey(role.key);
                }}
              >
                {content}
              </a>
              {openKey === role.key ? <RoleCapture role={role} /> : null}
            </div>
          );
        }

        // Student: untouched straight-through tap.
        return (
          <Link key={role.key} href={role.href} className="um-tap" style={tapStyle}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
