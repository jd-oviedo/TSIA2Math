"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { TSIA2_PASSING } from "../adaptive-test/engine";
import posthog from "posthog-js";

interface SessionRow {
  id: string;
  created_at: string;
  final_score: number | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardList() {
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    posthog.capture("dashboard_viewed");
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, created_at, final_score")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      setSessions(data ?? []);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <p style={{ color: "var(--ec-orange)", fontSize: "14px" }}>Couldn&rsquo;t load your scores: {error}</p>
      </div>
    );
  }

  if (sessions === null) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid var(--ec-line)", borderTopColor: "var(--ec-accent)", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <h1
        style={{
          fontSize: "clamp(26px, 4vw, 32px)",
          fontWeight: 800,
          color: "var(--ec-ink)",
          letterSpacing: "-0.03em",
          marginBottom: "24px",
          fontFamily: "var(--font-kodchasan, Kodchasan, sans-serif)",
        }}
      >
        Your practice test history
      </h1>

      {sessions.length === 0 ? (
        <div
          style={{
            background: "var(--ec-surface)",
            border: "1px solid var(--ec-line)",
            borderRadius: "16px",
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", margin: 0 }}>
            No saved attempts yet. Take a practice test to see your results here.
          </p>
          <a href="/adaptive-test"
            style={{
              display: "inline-block",
              marginTop: "16px",
              padding: "10px 22px",
              background: "var(--ec-btn-bg)",
              color: "var(--ec-btn-text)",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Start a practice test
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {sessions.map((s) => {
            const score = s.final_score;
            const passed = score !== null && score >= TSIA2_PASSING;
            return (
              <div
                key={s.id}
                style={{
                  background: "var(--ec-surface)",
                  border: "1px solid var(--ec-line)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "var(--ec-shadow)",
                }}
              >
                <span style={{ fontSize: "14px", color: "var(--ec-ink-muted)" }}>
                  {formatDate(s.created_at)}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--ec-ink)" }}>
                    {score ?? "—"}
                  </span>
                  {score !== null && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background: passed ? "var(--ec-green-bg)" : "var(--ec-orange-bg)",
                        color: passed ? "var(--ec-green)" : "var(--ec-orange)",
                        border: `1px solid ${passed ? "var(--ec-green-border)" : "var(--ec-orange-border)"}`,
                      }}
                    >
                      {passed ? "College Ready" : "Keep Practicing"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
