import Link from "next/link";
import { Header } from "./components/Header";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--ec-bg)", position: "relative", overflow: "hidden" }}>

      {/* Blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-180px", left: "-160px", width: "520px", height: "520px", borderRadius: "50%", background: "var(--ec-blob-a)", filter: "blur(90px)" }} />
        <div style={{ position: "absolute", top: "-140px", right: "-140px", width: "460px", height: "460px", borderRadius: "50%", background: "var(--ec-blob-b)", filter: "blur(90px)" }} />
        <div style={{ position: "absolute", bottom: "-200px", left: "30%", width: "540px", height: "540px", borderRadius: "50%", background: "var(--ec-blob-c)", filter: "blur(100px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Header />
      </div>

      <main style={{ flex: 1, position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px 80px" }}>
        <div style={{ maxWidth: "540px", width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>

          <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ec-accent)" }}>
            TSIA2 Math Prep
          </p>

          <h1 style={{ fontSize: "clamp(34px, 6vw, 54px)", fontWeight: 800, color: "var(--ec-ink)", letterSpacing: "-0.03em", lineHeight: 1.08, margin: 0 }}>
            Get your score before test day.
          </h1>

          <p style={{ fontSize: "17px", color: "var(--ec-ink-muted)", lineHeight: 1.65, maxWidth: "400px", margin: 0 }}>
            A computer-adaptive practice test built for the TSIA2. Every question adjusts to your level so you always work exactly where it counts.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "340px" }}>
            <Link
              href="/adaptive-test"
              style={{
                display: "block", padding: "16px",
                background: "var(--ec-btn-bg)", color: "var(--ec-btn-text)",
                borderRadius: "14px", fontWeight: 700, fontSize: "16px",
                textDecoration: "none", letterSpacing: "-0.01em",
                boxShadow: "var(--ec-shadow-btn)",
              }}
            >
              Start Practice Test
            </Link>
            <p style={{ fontSize: "12px", color: "var(--ec-ink-faint)", margin: 0 }}>
              no account needed · free to use
            </p>
          </div>

          <div style={{ display: "flex", gap: "36px", marginTop: "8px" }}>
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
