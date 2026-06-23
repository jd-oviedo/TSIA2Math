"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "./useSession";
import { validateItems } from "./engine";
import ItemCard from "./ItemCard";
import ResultsSummary from "./ResultsSummary";
import type { ItemValidationError, Response } from "./type";
import { supabase } from "../lib/supabase";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import posthog from "posthog-js";

const MAX_ITEMS = 20;
async function saveSession(responses: Response[], maxItems: number): Promise<{ sessionId: string | null; failed: boolean }> {
  try {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        max_items: maxItems,
        responses: responses.map((r) => ({
          item_id: r.item.item_id,
          selected_answer: r.selectedAnswer,
          elapsed_ms: r.elapsedMs,
        })),
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("[saveSession] failed:", res.status, body.error ?? res.statusText);
      return { sessionId: null, failed: true };
    }
    const body = await res.json();
    return { sessionId: body.session_id ?? null, failed: !body.session_id };
  } catch (err) {
    console.error("[saveSession] network error:", err);
    return { sessionId: null, failed: true };
  }
}

function Blobs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--ec-bg)", position: "relative" }}>
      <Blobs />
      <div style={{ position: "relative" }}>
        <Header />
      </div>
      <main style={{ flex: 1, maxWidth: "800px", margin: "0 auto", width: "100%", padding: "80px 24px 80px" }}>
        {children}
      </main>
      <Footer />
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
  const savedRef = useRef(false);
  const prevResponseCountRef = useRef(0);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    if (state.responses.length > prevResponseCountRef.current) {
      const latest = state.responses[state.responses.length - 1];
      posthog.capture("item_answered", {
        item_id: latest.item.item_id,
        strand: latest.item.primary_strand,
        proficiency_level: latest.item.proficiency_level,
        is_correct: latest.isCorrect,
        question_number: state.responses.length,
        time_spent_seconds: Math.round(latest.elapsedMs / 1000),
      });
    }
    prevResponseCountRef.current = state.responses.length;

    if (state.phase === "complete" && !savedRef.current) {
      savedRef.current = true;
      saveSession(state.responses, state.maxItems).then(({ sessionId, failed }) => {
        setSavedSessionId(sessionId);
        setSaveFailed(failed);
      });
    }
    if (state.phase !== "complete") {
      savedRef.current = false;
      setSavedSessionId(null);
      setSaveFailed(false);
    }
  }, [state.phase, state.responses, state.maxItems]);

  useEffect(() => {
    if (state.phase !== "loading") return;
    async function fetchItems() {
      try {
        const { data, error } = await supabase.from("questions_public").select("*").eq("status", "draft");
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
        <div style={{
          maxWidth: "520px",
          margin: "0 auto",
          textAlign: "center",
          padding: "44px 36px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          background: "var(--ec-glass-bg)",
          border: "1px solid var(--ec-glass-border)",
          borderRadius: "20px",
          boxShadow: "var(--ec-shadow)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ec-ink-faint)", marginBottom: "4px" }}>
              Before you begin
            </p>
            <p style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "8px" }}>
              TSIA2 Adaptive Practice
            </p>
            <h1 style={{ fontSize: "34px", fontWeight: 800, color: "var(--ec-ink)", letterSpacing: "-0.025em", lineHeight: 1.1, fontFamily: "var(--font-kodchasan, Kodchasan, sans-serif)" }}>
              Let&rsquo;s find exactly<br />where you are.
            </h1>
          </div>
          <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.65, margin: 0 }}>
            1,000+ items loaded · {MAX_ITEMS} questions · adapts as you go
          </p>
          <div style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "18px", padding: "22px 26px", width: "100%", textAlign: "left", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "var(--ec-shadow)" }}>
            {[
              ["Starting level", "Proficient difficulty"],
              ["Adjusts", "after every answer"],
              ["Estimated score", "910–990 scale"],
              ["College-ready", "950 or above"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", alignItems: "baseline", fontSize: "14px", gap: "8px" }}>
                <span style={{ color: "var(--ec-ink-muted)", whiteSpace: "nowrap" }}>{label}</span>
                <span style={{ flex: 1, borderBottom: "2px dotted var(--ec-line)", marginBottom: "3px" }} />
                <span style={{ color: "var(--ec-ink)", fontWeight: 500, whiteSpace: "nowrap" }}>{value}</span>
              </div>
            ))}
          </div>
          {validationErrors && validationErrors.length > 0 && <ValidationErrorList errors={validationErrors} />}
          <button
            onClick={() => {
              posthog.capture("test_started", { item_count: state.allItems.length });
              start();
            }}
            style={{ width: "100%", padding: "16px", background: "var(--ec-btn-bg)", color: "var(--ec-btn-text)", border: "none", borderRadius: "14px", fontFamily: "inherit", fontSize: "15px", fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em", boxShadow: "var(--ec-shadow-btn)" }}
          >
            Begin Test
          </button>
          <p style={{ fontSize: "11px", color: "var(--ec-ink-faint)", margin: 0 }}>no account needed · results shown at the end</p>
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
        <ResultsSummary responses={state.responses} theta={state.theta} onRestart={restart} sessionId={savedSessionId} saveFailed={saveFailed} />
      </Shell>
    );
  }

  return null;
}
