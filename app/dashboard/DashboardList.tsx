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

interface FlagRow {
  id: string;
  created_at: string;
  item_id: string;
  user_email: string | null;
  category: string;
  comment: string | null;
  status: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  symbols_or_math_look_wrong: "Symbols or math look wrong",
  answer_seems_incorrect: "Answer seems incorrect",
  explanation_unclear_or_wrong: "Explanation is unclear or has an error",
  question_has_typo_or_is_confusing: "Question has a typo or is confusing",
  other: "Other",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function FlagsTab() {
  const [flags, setFlags] = useState<FlagRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/flags")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setFlags(data.flags ?? []);
      })
      .catch(() => setError("Failed to load flags."));
  }, []);

  const toggleStatus = async (flag: FlagRow) => {
    const next = flag.status === "open" ? "resolved" : "open";
    setTogglingId(flag.id);
    try {
      const res = await fetch("/api/flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: flag.id, status: next }),
      });
      if (!res.ok) throw new Error();
      setFlags((prev) =>
        prev ? prev.map((f) => (f.id === flag.id ? { ...f, status: next } : f)) : prev
      );
    } catch {
      // silent -- flag stays as-is
    } finally {
      setTogglingId(null);
    }
  };

  if (error) {
    return (
      <p style={{ color: "var(--ec-orange)", fontSize: "14px", padding: "40px 0" }}>{error}</p>
    );
  }

  if (flags === null) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid var(--ec-line)", borderTopColor: "var(--ec-accent)", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (flags.length === 0) {
    return (
      <div style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "16px", padding: "40px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", margin: 0 }}>No flags yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {flags.map((flag) => (
        <div
          key={flag.id}
          style={{
            background: "var(--ec-surface)",
            border: "1px solid var(--ec-line)",
            borderRadius: "14px",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            boxShadow: "var(--ec-shadow)",
            opacity: flag.status === "resolved" ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: "var(--ec-accent)" }}>
              {flag.item_id}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px",
                background: flag.status === "resolved" ? "var(--ec-green-bg)" : "var(--ec-orange-bg)",
                color: flag.status === "resolved" ? "var(--ec-green)" : "var(--ec-orange)",
                border: `1px solid ${flag.status === "resolved" ? "var(--ec-green-border)" : "var(--ec-orange-border)"}`,
              }}>
                {flag.status === "resolved" ? "Resolved" : "Open"}
              </span>
              <button
                onClick={() => toggleStatus(flag)}
                disabled={togglingId === flag.id}
                style={{
                  fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px",
                  background: "none", border: "1px solid var(--ec-line)",
                  color: "var(--ec-ink-muted)", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {togglingId === flag.id ? "..." : flag.status === "open" ? "Resolve" : "Reopen"}
              </button>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "var(--ec-ink)", margin: 0, fontWeight: 600 }}>
            {CATEGORY_LABELS[flag.category] ?? flag.category}
          </p>
          {flag.comment && (
            <p style={{ fontSize: "13px", color: "var(--ec-ink-muted)", margin: 0, fontStyle: "italic" }}>
              {flag.comment}
            </p>
          )}
          <p style={{ fontSize: "11px", color: "var(--ec-ink-faint)", margin: 0 }}>
            {flag.user_email ?? "anonymous"} · {formatDate(flag.created_at)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function DashboardList() {
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [tab, setTab] = useState<"history" | "flags">("history");

  useEffect(() => {
    posthog.capture("dashboard_viewed");
    let cancelled = false;

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !cancelled) {
        // Check teacher status by hitting the flags endpoint -- 200 means teacher, 403 means not
        fetch("/api/flags").then((r) => {
          if (!cancelled) setIsTeacher(r.ok);
        });
      }

      const { data, error } = await supabase
        .from("sessions")
        .select("id, created_at, final_score")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) { setError(error.message); return; }
      setSessions(data ?? []);
    }

    load();
    return () => { cancelled = true; };
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
      <h1 style={{
        fontSize: "clamp(26px, 4vw, 32px)", fontWeight: 800, color: "var(--ec-ink)",
        letterSpacing: "-0.03em", marginBottom: "24px",
        fontFamily: "var(--font-kodchasan, Kodchasan, sans-serif)",
      }}>
        {tab === "history" ? "Your practice test history" : "Item flags"}
      </h1>

      {isTeacher && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {(["history", "flags"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "7px 18px", borderRadius: "999px", border: "1px solid var(--ec-line)",
                background: tab === t ? "var(--ec-accent)" : "var(--ec-surface)",
                color: tab === t ? "#fff" : "var(--ec-ink-muted)",
                fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              {t === "history" ? "Test History" : "Item Flags"}
            </button>
          ))}
        </div>
      )}

      {tab === "history" && (
        sessions.length === 0 ? (
          <div style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "16px", padding: "40px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", margin: 0 }}>
              No saved attempts yet. Take a practice test to see your results here.
            </p>
            <a href="/adaptive-test" style={{ display: "inline-block", marginTop: "16px", padding: "10px 22px", background: "var(--ec-btn-bg)", color: "var(--ec-btn-text)", borderRadius: "10px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
              Start a practice test
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sessions.map((s) => {
              const score = s.final_score;
              const passed = score !== null && score >= TSIA2_PASSING;
              return (
                <div key={s.id} style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--ec-shadow)" }}>
                  <span style={{ fontSize: "14px", color: "var(--ec-ink-muted)" }}>{formatDate(s.created_at)}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--ec-ink)" }}>{score ?? "—"}</span>
                    {score !== null && (
                      <span style={{
                        fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px",
                        background: passed ? "var(--ec-green-bg)" : "var(--ec-orange-bg)",
                        color: passed ? "var(--ec-green)" : "var(--ec-orange)",
                        border: `1px solid ${passed ? "var(--ec-green-border)" : "var(--ec-orange-border)"}`,
                      }}>
                        {passed ? "College Ready" : "Keep Practicing"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === "flags" && isTeacher && <FlagsTab />}
    </div>
  );
}