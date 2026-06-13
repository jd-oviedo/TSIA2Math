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
import { themes, type ThemeName } from "../theme/themes";

const MAX_ITEMS = 20;

function CipherMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
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

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const options: ThemeName[] = ["sand", "ember", "abyss"];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        background: "var(--ec-pill-track)",
        borderRadius: "99px",
        padding: "3px",
      }}
    >
      {options.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          style={{
            padding: "5px 13px",
            borderRadius: "99px",
            border: theme === t ? "1px solid var(--ec-accent-border)" : "1px solid transparent",
            background: theme === t ? "var(--ec-pill-active-bg)" : "transparent",
            color: theme === t ? "var(--ec-pill-active-text)" : "var(--ec-pill-inactive-text)",
            fontFamily: "inherit",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.03em",
            transition: "all 0.18s ease",
          }}
        >
          {themes[t].label}
        </button>
      ))}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--ec-bg)" }}>
      <header
        style={{
          borderBottom: "1px solid var(--ec-header-border)",
          background: "var(--ec-header-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: "768px",
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              textDecoration: "none",
            }}
          >
            <CipherMark />
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--ec-ink)",
                letterSpacing: "-0.02em",
              }}
            >
              EdCipher
            </span>
          </Link>
          <ThemeSwitcher />
        </div>
      </header>
      <main
        style={{
          flex: 1,
          maxWidth: "768px",
          margin: "0 auto",
          width: "100%",
          padding: "32px 20px",
        }}
      >
        {children}
      </main>
    </div>
  );
}

function ValidationErrorList({ errors }: { errors: ItemValidationError[] }) {
  return (
    <div
      style={{
        marginTop: "16px",
        background: "var(--ec-incorrect-bg)",
        border: "1px solid var(--ec-incorrect-border)",
        borderRadius: "12px",
        padding: "16px",
        fontSize: "13px",
        color: "var(--ec-ink)",
        maxHeight: "192px",
        overflowY: "auto",
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: "8px", color: "var(--ec-warm)" }}>
        {errors.length} malformed item(s) skipped
      </p>
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
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .eq("status", "draft");

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
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid var(--ec-accent-border)",
              borderTopColor: "var(--ec-accent)",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 0.8s linear infinite",
            }}
          />
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
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--ec-warm)", marginBottom: "8px" }}>
            Failed to load question bank
          </h2>
          <p style={{ color: "var(--ec-ink-muted)", fontSize: "14px" }}>{state.loadError}</p>
          <button
            onClick={restart}
            style={{
              marginTop: "24px",
              padding: "12px 28px",
              background: "var(--ec-btn-bg)",
              color: "var(--ec-btn-text)",
              border: "1px solid var(--ec-accent-border)",
              borderRadius: "12px",
              fontFamily: "inherit",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </Shell>
    );
  }

  if (state.phase === "ready") {
    const validationErrors =
      typeof window !== "undefined"
        ? ((window as unknown as Record<string, unknown>).__catValidationErrors as ItemValidationError[] | undefined)
        : undefined;

    return (
      <Shell>
        <div
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            textAlign: "center",
            padding: "64px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ec-ink-muted)", marginBottom: "10px" }}>
              TSIA2 Adaptive Practice
            </p>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "var(--ec-ink)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Ready to find your level?
            </h1>
          </div>

          <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.6 }}>
            {state.allItems.length} items loaded · {MAX_ITEMS} questions · adapts as you go
          </p>

          <div
            style={{
              background: "var(--ec-glass-bg)",
              border: "1px solid var(--ec-glass-border)",
              borderRadius: "16px",
              padding: "20px 24px",
              width: "100%",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {[
              ["Starts at", "Proficient difficulty"],
              ["Adapts", "after every answer"],
              ["Score", "estimated on 910–990 scale"],
              ["Passing", "950 or above"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--ec-ink-muted)" }}>{label}</span>
                <span style={{ color: "var(--ec-ink)", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          {validationErrors && validationErrors.length > 0 && (
            <ValidationErrorList errors={validationErrors} />
          )}

          <button
            onClick={start}
            style={{
              width: "100%",
              padding: "15px",
              background: "var(--ec-btn-bg)",
              color: "var(--ec-btn-text)",
              border: "1px solid var(--ec-accent-border)",
              borderRadius: "14px",
              fontFamily: "inherit",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}
          >
            Begin Test
          </button>

          <p style={{ fontSize: "11px", color: "var(--ec-ink-faint)" }}>
            no account needed · results shown at the end
          </p>
        </div>
      </Shell>
    );
  }

  if (state.phase === "active" && state.currentItem) {
    return (
      <Shell>
        <ItemCard
          item={state.currentItem}
          itemNumber={state.responses.length + 1}
          totalItems={state.maxItems}
          onAnswer={answer}
        />
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
