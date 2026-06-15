import Link from "next/link";
import { ThemeToggleHome } from "./theme/ThemeToggleHome";

function CipherMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
      <defs>
        <linearGradient id="ec-ring-home" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7ACCCF" />
          <stop offset="100%" stopColor="#F2A541" />
        </linearGradient>
      </defs>
      <ellipse cx="13" cy="13" rx="10.5" ry="10.5" stroke="url(#ec-ring-home)" strokeWidth="2.2" fill="none" />
      <line x1="5" y1="5" x2="21" y2="21" stroke="var(--ec-slash-color)" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="6" y1="6" x2="9.5" y2="9.5" stroke="url(#ec-ring-home)" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="16.5" y1="16.5" x2="20" y2="20" stroke="url(#ec-ring-home)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--ec-bg)", position: "relative", overflow: "hidden" }}>

      {/* Blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-180px", left: "-160px", width: "520px", height: "520px", borderRadius: "50%", background: "var(--ec-blob-a)", filter: "blur(90px)" }} />
        <div style={{ position: "absolute", top: "-140px", right: "-140px", width: "460px", height: "460px", borderRadius: "50%", background: "var(--ec-blob-b)", filter: "blur(90px)" }} />
        <div style={{ position: "absolute", bottom: "-200px", left: "30%", width: "540px", height: "540px", borderRadius: "50%", background: "var(--ec-blob-c)", filter: "blur(100px)" }} />
      </div>

      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--ec-header-border)", background: "var(--ec-header-bg)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <CipherMark />
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--ec-ink)", letterSpacing: "-0.02em" }}>EdCipher</span>
          </div>
          <ThemeToggleHome />
        </div>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px 80px" }}>
        <div style={{ maxWidth: "560px", width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>

          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ec-accent)" }}>
            TSIA2 College Placement Prep
          </p>

          <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 800, color: "var(--ec-ink)", letterSpacing: "-0.03em", lineHeight: 1.08, margin: 0 }}>
            Math that adapts<br />to where you are.
          </h1>

          <p style={{ fontSize: "17px", color: "var(--ec-ink-muted)", lineHeight: 1.65, maxWidth: "420px", margin: 0 }}>
            Computer-adaptive practice built for the TSIA2. Every question adjusts to your level so you always work exactly where it counts.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "360px" }}>
            <Link
              href="/adaptive-test"
              style={{
                display: "block",
                padding: "16px",
                background: "var(--ec-btn-bg)",
                color: "var(--ec-btn-text)",
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "16px",
                textDecoration: "none",
                letterSpacing: "-0.01em",
                boxShadow: "var(--ec-shadow-btn)",
                transition: "opacity 0.18s ease",
              }}
            >
              Start Practice Test
            </Link>
            <p style={{ fontSize: "12px", color: "var(--ec-ink-faint)", margin: 0 }}>
              no account needed · free to use
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "32px", marginTop: "8px" }}>
            {[["465+", "practice items"], ["4", "math strands"], ["20", "questions per test"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--ec-ink)", letterSpacing: "-0.02em" }}>{num}</div>
                <div style={{ fontSize: "11px", color: "var(--ec-ink-muted)", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
