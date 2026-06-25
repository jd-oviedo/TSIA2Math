"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import MathText from "../../../components/MathText";

type StrandBreakdown = {
  AR?: { pct: number; total: number; correct: number };
  QR?: { pct: number; total: number; correct: number };
  GR?: { pct: number; total: number; correct: number };
  PR?: { pct: number; total: number; correct: number };
};

type Session = {
  id: string;
  final_score: number | null;
  strand_breakdown: StrandBreakdown | null;
  created_at: string;
};

type Misconception = {
  rank: number;
  item_id: string;
  selected_answer: string;
  distractor_text: string;
  primary_strand: string;
  topic_id: string;
  frequency: number;
};

type StudentData = {
  student: { student_id: string; email: string; initials: string };
  enrollment: { class_id: string; class_name: string; enrolled_via: string; enrolled_at: string };
  sessions: Session[];
  misconceptions: Misconception[];
};

const PASSING = 950;

const STRAND_COLORS: Record<string, { bg: string; text: string }> = {
  QR: { bg: "#B5D4F4", text: "#0C447C" },
  AR: { bg: "#9FE1CB", text: "#085041" },
  GR: { bg: "#FAC775", text: "#633806" },
  PR: { bg: "#CECBF6", text: "#3C3489" },
};

const STRAND_ORDER = ["QR", "AR", "GR", "PR"] as const;

const AVATAR_COLORS = [
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#FAECE7", text: "#712B13" },
  { bg: "#FAEEDA", text: "#633806" },
];

function placementBand(score: number | null) {
  if (score === null) return { label: "No test yet", bg: "var(--ec-surface)", color: "var(--ec-ink-muted)" };
  if (score >= PASSING) return { label: "College ready", bg: "#EAF3DE", color: "#27500A" };
  if (score >= 935) return { label: "Approaching", bg: "#FAEEDA", color: "#633806" };
  return { label: "Below college ready", bg: "#FCEBEB", color: "#791F1F" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 14) return "1w ago";
  return `${Math.floor(days / 7)}w ago`;
}

function StrandBar({ breakdown }: { breakdown: StrandBreakdown | null }) {
  if (!breakdown) return <span style={{ fontSize: "11px", color: "var(--ec-ink-faint)" }}>No data</span>;
  return (
    <div style={{ display: "flex", height: "18px", borderRadius: "3px", overflow: "hidden", gap: "1px", width: "100%", minWidth: "140px" }}>
      {STRAND_ORDER.map((s) => {
        const val = breakdown[s];
        const pct = val ? val.pct : 0;
        const c = STRAND_COLORS[s];
        return (
          <div key={s} style={{ flex: Math.max(pct, 8), background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 500, color: c.text }}>
            {s}
          </div>
        );
      })}
    </div>
  );
}

export default function StudentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const classId = searchParams.get("class_id") ?? "";

  const [data, setData] = useState<StudentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!studentId || !classId) { setError("Missing student or class ID."); return; }
    const res = await fetch(`/api/teacher/student?student_id=${studentId}&class_id=${classId}`);
    if (!res.ok) { setError("Could not load student data."); return; }
    const json = await res.json();
    setData(json);
  }, [studentId, classId]);

  useEffect(() => { load(); }, [load]);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ec-bg)" }}>
        <p style={{ color: "var(--ec-orange)", fontSize: "14px" }}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ec-bg)" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid var(--ec-line)", borderTopColor: "#C68A2F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { student, enrollment, sessions, misconceptions } = data;
  const av = AVATAR_COLORS[0];
  const latest = sessions[0] ?? null;
  const band = placementBand(latest?.final_score ?? null);

  const strandAvgs: Record<string, number> = {};
  if (sessions.length > 0) {
    for (const s of STRAND_ORDER) {
      const vals = sessions
        .map((sess) => sess.strand_breakdown?.[s]?.pct ?? null)
        .filter((v): v is number => v !== null);
      strandAvgs[s] = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    }
  }
  const weakestStrand = sessions.length > 0
    ? STRAND_ORDER.reduce((a, b) => (strandAvgs[a] <= strandAvgs[b] ? a : b))
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--ec-bg)", fontFamily: "var(--font-sans, sans-serif)" }}>

      {/* Header strip */}
      <div style={{ background: "#0f1e35", padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <a href="/teacher" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
          &#8592; {enrollment.class_name}
        </a>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>/</span>
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>{student.email.split("@")[0]}</span>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Student card */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: av.bg, color: av.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 600, flexShrink: 0 }}>
            {student.initials}
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--ec-ink)" }}>{student.email.split("@")[0]}</div>
            <div style={{ fontSize: "13px", color: "var(--ec-ink-muted)" }}>{student.email} &middot; Enrolled {formatDate(enrollment.enrolled_at)} via {enrollment.enrolled_via.replace("_", " ")}</div>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {[
            { label: "Total attempts", value: sessions.length, sub: sessions.length === 1 ? "1 test taken" : `${sessions.length} tests taken` },
            { label: "Latest score", value: latest?.final_score ?? "--", sub: band.label, highlight: (latest?.final_score ?? 0) >= PASSING },
            { label: "Weakest strand", value: weakestStrand ?? "--", sub: weakestStrand ? `avg ${strandAvgs[weakestStrand]}% accuracy` : "no data", warn: true },
            { label: "First tested", value: sessions.length > 0 ? timeAgo(sessions[sessions.length - 1].created_at) : "--", sub: sessions.length > 0 ? formatDate(sessions[sessions.length - 1].created_at) : "" },
          ].map((card) => (
            <div key={card.label} style={{ background: "var(--ec-surface)", borderRadius: "8px", padding: "12px 14px", border: "0.5px solid var(--ec-line)" }}>
              <div style={{ fontSize: "11px", color: "var(--ec-ink-muted)", marginBottom: "4px" }}>{card.label}</div>
              <div style={{ fontSize: "20px", fontWeight: 500, color: card.highlight ? "#3B6D11" : card.warn ? "#854F0B" : "var(--ec-ink)" }}>{card.value}</div>
              <div style={{ fontSize: "11px", color: "var(--ec-ink-muted)", marginTop: "2px" }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Session history */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ec-ink)" }}>Test history</span>
            <span style={{ fontSize: "12px", color: "var(--ec-ink-muted)" }}>All attempts, most recent first</span>
          </div>

          {sessions.length === 0 ? (
            <div style={{ background: "var(--ec-surface)", border: "0.5px solid var(--ec-line)", borderRadius: "12px", padding: "32px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", margin: 0 }}>No tests taken yet.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr>
                  {["Date", "Score", "Band", "Strand performance (QR / AR / GR / PR)", "Attempt"].map((h, i) => (
                    <th key={h} style={{ fontSize: "11px", fontWeight: 500, color: "var(--ec-ink-muted)", textAlign: i === 4 ? "center" : "left", padding: "0 10px 8px", borderBottom: "0.5px solid var(--ec-line)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess, i) => {
                  const b = placementBand(sess.final_score);
                  const attemptNum = sessions.length - i;
                  return (
                    <tr key={sess.id} style={{ borderBottom: "0.5px solid var(--ec-line)" }}>
                      <td style={{ padding: "10px", color: "var(--ec-ink-muted)", whiteSpace: "nowrap" }}>{formatDate(sess.created_at)}</td>
                      <td style={{ padding: "10px", fontWeight: 500, fontSize: "14px", color: "var(--ec-ink)" }}>{sess.final_score ?? "--"}</td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 500, background: b.bg, color: b.color, whiteSpace: "nowrap" }}>
                          {b.label}
                        </span>
                      </td>
                      <td style={{ padding: "10px", minWidth: "160px" }}>
                        <StrandBar breakdown={sess.strand_breakdown} />
                      </td>
                      <td style={{ padding: "10px", textAlign: "center", fontSize: "12px", color: "var(--ec-ink-muted)" }}>#{attemptNum}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Student misconceptions */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ec-ink)" }}>Misconceptions</span>
            <span style={{ fontSize: "12px", color: "var(--ec-ink-muted)" }}>Across all attempts</span>
          </div>

          {misconceptions.length === 0 ? (
            <div style={{ background: "var(--ec-surface)", border: "0.5px solid var(--ec-line)", borderRadius: "12px", padding: "32px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", margin: 0 }}>No misconception data yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {misconceptions.map((mc) => (
                <div key={`${mc.item_id}-${mc.selected_answer}`} style={{ background: "var(--ec-surface)", border: "0.5px solid var(--ec-line)", borderRadius: "12px", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: "#C68A2F", color: "#fff", fontSize: "10px", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {mc.rank}
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--ec-ink)", lineHeight: 1.4 }}>
                      <MathText text={mc.distractor_text} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "3px", background: "#E6F1FB", color: "#0C447C" }}>{mc.primary_strand}</span>
                    <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "3px", background: "var(--ec-bg)", color: "var(--ec-ink-muted)" }}>{mc.topic_id}</span>
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--ec-ink-muted)" }}>
                    Selected <strong>{mc.frequency}</strong> {mc.frequency === 1 ? "time" : "times"} across all attempts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}