"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "./useSession";
import { validateItems } from "./engine";
import ItemCard from "./ItemCard";
import ResultsSummary from "./ResultsSummary";
import type { ItemValidationError } from "./type";
import { supabase } from "../lib/supabase";
import { useTheme } from "../theme/useTheme";

const MAX_ITEMS = 20;

function CipherMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
      <defs>
        <linearGradient id="ec-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7ACCCF" />
          <stop offset="100%" stopColor="#F2A541" />
        </linearGradient>
      </defs>
      <ellipse cx="13" cy="13" rx="10.5" ry="10.5" stroke="url(#ec-ring)" strokeWidth="2.2" fill="none" />
      <line x1="5" y1="5" x2="21" y2="21" stroke="var(--ec-slash-color)" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="6" y1="6" x2="9.5" y2="9.5" stroke="url(#ec-ring)" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="16.5" y1="16.5" x2="20" y2="20" stroke="url(#ec-ring)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Switch light or dark mode"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        border: "1px solid var(--ec-line)",
        background: "var(--ec-surface)",
        cursor: "pointer",
        boxShadow: "var(--ec-shadow)",
        transition: "background 0.3s, border-color 0.3s",
        color: "var(--ec-ink-muted)",
      }}
    >
      {isDark ? (
        // moon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        // sun
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="4.5" />
          <line x1="12" y1="19.5" x2="12" y2="22" />
          <line x1="2" y1="12" x2="4.5" y2="12" />
          <line x1="19.5" y1="12" x2="22" y2="12" />
          <line x1="4.9" y1="4.9" x2="6.6" y2="6.6" />
          <line x1="17.4" y1="17.4" x2="19.1" y2="19.1" />
          <line x1="4.9" y1="19.1" x2="6.6" y2="17.4" />
          <line x1="17.4" y1="6.6" x2="19.1" y2="4.9" />
        </svg>
      )}
    </button>
  );
}

function Blobs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-180px", left: "-160px", width: "520px", height: "520px", borderRadius: "50%", background: "var(--ec-blob-a)", filter: "blur(90px)" }} />
      <div style={{ position: "absolute", top: "-140px", right: "-140px", width: "460px", height: "460px", borderRadius: "50%", background: "var(--ec-blob-b)", filter: "blur(90px)" }} />
      <div style={{ position: "absolute", bottom: "-200px", left: "30%", width: "540px", height: "540px", borderRadius: "50%", background: "var(--ec-blob-c)", filter: "blur(100px)" }} />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--ec-bg)", position: "relative" }}>
      <Blobs />
      <header style={{
        borderBottom: "1px solid var(--ec-header-border)",
        background: "var(--ec-header-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none" }}>
            <CipherMark />
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--ec-ink)", letterSpacing: "-0.02em" }}>EdCipher</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main style={{ flex: 1, maxWidth: "800px", margin: "0 auto", width: "100%", padding: "32px 24px 80px", position: "relative", zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
}

function ValidationErrorList({ errors }: { errors: ItemValidationError[] }) {
  return (
    <div style={{ marginTop: "16px", background: "var(--ec-red-bg)", border: "1px solid var(--ec-red-border)", borderRadius: "12px", padding: "16px", fontSize: "13px", color: "var(--ec-ink)", maxHeight: "192px", overflowY: "auto" }}>
      <p style={{ fontWeight: 600, marginBottom: "8px", color: "var(--ec-red)" }}>{errors.length} malformed item(s) skipped</p>
      <ul style={{ listStyle: "disc", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {errors.map((e) => (
          <li key={e.item_id} style={{ color: "var(--ec-ink-muted)" }}>
            <span style={{ fontFamily: "monospace" }}>{e.item_id}</span> — missing: {e.missing.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdaptiveTestPage() {
  const { state, loadItems, loadError, start, answer, restart } = useSession(MAX_ITEMS);

  useEffect(() => {
    if (state.phase !== "loading") return;
    async function fetchItems() {
      try {
        const { data, error } = await supabase.from("questions").select("*").eq("status", "draft");
        if (error) throw new Error(error.message);
        if (!data || data.length === 0) throw new Error("No items found in the question bank.");
        const { items, errors } = validateItems(data);
        if (items.length === 0) throw new Error("No valid items found in the question bank.");
        if (errors.length > 0) console.warn("[CAT Engine] Skipped malformed items:", errors);
        loadItems(items);
        (window as unknown as Record<string, unknown>).__catValidationErrors = errors;
      } catch (err: unknown) {
        loadError(err instanceof Error ? err.message : String(err));
      }
    }
    fetchItems();
  }, [state.phase, loadItems, loadError]);

  if (state.phase === "loading") {
    return (
      <Shell>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid var(--ec-line)", borderTopColor: "var(--ec-accent)", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "var(--ec-ink-muted)", fontSize: "14px" }}>Loading question bank…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Shell>
    );
  }

  if (state.phase === "error") {
    return (
      <Shell>
        <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center", padding: "64px 0" }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</p>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--ec-orange)", marginBottom: "8px" }}>Failed to load question bank</h2>
          <p style={{ color: "var(--ec-ink-muted)", fontSize: "14px" }}>{state.loadError}</p>
          <button onClick={restart} style={{ marginTop: "24px", padding: "12px 28px", background: "var(--ec-btn-bg)", color: "var(--ec-btn-text)", border: "none", borderRadius: "12px", fontFamily: "inherit", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
            Retry
          </button>
        </div>
      </Shell>
    );
  }

  if (state.phase === "ready") {
    const validationErrors = typeof window !== "undefined"
      ? ((window as unknown as Record<string, unknown>).__catValidationErrors as ItemValidationError[] | undefined)
      : undefined;

    return (
      <Shell>
        <div style={{ maxWidth: "520px", margin: "0 auto", textAlign: "center", padding: "64px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "12px" }}>
              TSIA2 Adaptive Practice
            </p>
            <h1 style={{ fontSize: "34px", fontWeight: 800, color: "var(--ec-ink)", letterSpacing: "-0.025em", lineHeight: 1.1 }}>
              Let&rsquo;s find exactly where you are.
            </h1>
          </div>
          <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.65 }}>
            {state.allItems.length} items loaded · {MAX_ITEMS} questions · adapts as you go
          </p>
          <div style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "18px", padding: "22px 26px", width: "100%", textAlign: "left", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "var(--ec-shadow)" }}>
            {[
              ["Starts at", "Proficient difficulty"],
              ["Adapts", "after every answer"],
              ["Score", "estimated on 910–990 scale"],
              ["Passing", "950 or above"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "var(--ec-ink-muted)" }}>{label}</span>
                <span style={{ color: "var(--ec-ink)", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
          {validationErrors && validationErrors.length > 0 && <ValidationErrorList errors={validationErrors} />}
          <button onClick={start} style={{ width: "100%", padding: "16px", background: "var(--ec-btn-bg)", color: "var(--ec-btn-text)", border: "none", borderRadius: "14px", fontFamily: "inherit", fontSize: "15px", fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em", boxShadow: "var(--ec-shadow-btn)" }}>
            Begin Test
          </button>
          <p style={{ fontSize: "11px", color: "var(--ec-ink-faint)" }}>no account needed · results shown at the end</p>
        </div>
      </Shell>
    );
  }

  if (state.phase === "active" && state.currentItem) {
    return (
      <Shell>
        <ItemCard item={state.currentItem} itemNumber={state.responses.length + 1} totalItems={state.maxItems} onAnswer={answer} />
      </Shell>
    );
  }

  if (state.phase === "complete") {
    return (
      <Shell>
        <ResultsSummary responses={state.responses} theta={state.theta} onRestart={restart} />
      </Shell>
    );
  }

  return null;
}
