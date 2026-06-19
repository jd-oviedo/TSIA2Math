"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

function Blobs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-180px", left: "-160px", width: "520px", height: "520px", borderRadius: "50%", background: "var(--ec-blob-a)", filter: "blur(90px)" }} />
      <div style={{ position: "absolute", top: "-140px", right: "-140px", width: "460px", height: "460px", borderRadius: "50%", background: "var(--ec-blob-b)", filter: "blur(90px)" }} />
      <div style={{ position: "absolute", bottom: "-200px", left: "30%", width: "540px", height: "540px", borderRadius: "50%", background: "var(--ec-blob-c)", filter: "blur(100px)" }} />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--ec-bg)", position: "relative" }}>
      <Blobs />
      <div style={{ position: "relative" }}>
        <Header />
      </div>
      <main style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px 80px" }}>
        <div style={{
          maxWidth: "440px",
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          background: "var(--ec-glass-bg)",
          border: "1px solid var(--ec-glass-border)",
          borderRadius: "20px",
          padding: "48px 36px",
          boxShadow: "var(--ec-shadow)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}>
          <p style={{
            fontFamily: "var(--font-kodchasan, 'Kodchasan', sans-serif)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ec-accent)",
            margin: 0,
          }}>
            UnpackMath Account
          </p>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 800, color: "var(--ec-ink)", letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0, fontFamily: "var(--font-kodchasan, Kodchasan, sans-serif)" }}>
            Sign in to save your progress.
          </h1>
          <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.6, maxWidth: "340px", margin: 0 }}>
            Track your scores over time and pick up right where you left off.
          </p>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: "12px",
              border: "1px solid var(--ec-line)",
              background: "#fff",
              color: "#1f1f1f",
              cursor: loading ? "default" : "pointer",
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              opacity: loading ? 0.6 : 1,
              boxShadow: "var(--ec-shadow-btn)",
              marginTop: "8px",
            }}
          >
            <GoogleIcon />
            {loading ? "redirecting…" : "Continue with Google"}
          </button>
          <p style={{ fontSize: "11px", color: "var(--ec-ink-faint)", margin: 0 }}>
            no spam · we only use this to save your results
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
