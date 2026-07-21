"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import MathText from "../../../components/MathText";
import { FONT_HEADING, FONT_BODY, FONT_BASE_CSS } from "../../../components/fonts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Strand = "QR" | "AR" | "GR" | "PR";

type StrandBreakdown = {
  QR?: { pct: number; total: number; correct: number };
  AR?: { pct: number; total: number; correct: number };
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

// ─── Constants ──────────────────────────────────────────────────────────────

const PASSING = 950;

const STR: Record<Strand, { color: string; name: string }> = {
  QR: { color: "#B5D4F4", name: "Quantitative Reasoning" },
  AR: { color: "#9FE1CB", name: "Algebraic Reasoning" },
  GR: { color: "#FAC775", name: "Geometric & Spatial" },
  PR: { color: "#CECBF6", name: "Probabilistic & Statistical" },
};
const ORDER: Strand[] = ["QR", "AR", "GR", "PR"];

function placementBand(score: number | null) {
  if (score === null) return { label: "No test yet", bg: "#F0EEE7", text: "#5F5E5A", dot: "#B4B2A8" };
  if (score >= PASSING) return { label: "College ready", bg: "#EAF3DE", text: "#356B1B", dot: "#4F9A2E" };
  if (score >= 935) return { label: "Approaching", bg: "#FAEEDA", text: "#8A5712", dot: "#C68A2F" };
  return { label: "Below college ready", bg: "#FCEBEB", text: "#9A2A2A", dot: "#C2402F" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function useViewport() {
  const [w, setW] = useState(1280);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return { isMobile: w < 640 };
}

function StrandProfile({ breakdown }: { breakdown: StrandBreakdown | null }) {
  if (!breakdown) return <span style={{ fontSize: 11.5, color: "#A8A69D" }}>No data</span>;
  const acc: Record<Strand, number> = {
    QR: breakdown.QR?.pct ?? 0, AR: breakdown.AR?.pct ?? 0, GR: breakdown.GR?.pct ?? 0, PR: breakdown.PR?.pct ?? 0,
  };
  const sum = ORDER.reduce((a, k) => a + acc[k], 0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <div style={{ width: 150, maxWidth: "50vw", height: 9, borderRadius: 20, overflow: "hidden", display: "flex", gap: 1.5, background: "#F0EEE7" }}>
        {ORDER.map((k) => (
          <div key={k} style={{ width: `${sum > 0 ? (acc[k] / sum) * 100 : 25}%`, background: STR[k].color }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, fontSize: 10.5, color: "#8A8983" }}>
        {ORDER.map((k) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 7, height: 7, borderRadius: 2, background: STR[k].color }} />{acc[k]}%
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const classId = searchParams.get("class_id") ?? "";
  const { isMobile } = useViewport();

  const [data, setData] = useState<StudentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!studentId || !classId) { setError("Missing student or class ID."); return; }
    const res = await fetch(`/api/teacher/student?student_id=${studentId}&class_id=${classId}`);
    if (!res.ok) { setError("Could not load student data."); return; }
    setData(await res.json());
  }, [studentId, classId]);

  useEffect(() => { load(); }, [load]);

  const shell = (children: React.ReactNode) => (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #F5F5F3; -webkit-font-smoothing: antialiased; }
        ${FONT_BASE_CSS}
        @keyframes umspin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ minHeight: "100vh", background: "#F5F5F3", fontFamily: FONT_BODY, color: "#1A1A1A" }}>{children}</div>
    </>
  );

  if (error) {
    return shell(
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#9A2A2A", fontSize: 14, margin: "0 0 12px" }}>{error}</p>
          <a href="/teacher" style={{ fontSize: 13, fontWeight: 700, color: "#C68A2F", textDecoration: "none" }}>← Back to dashboard</a>
        </div>
      </div>
    );
  }

  if (!data) {
    return shell(
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #E7E5DD", borderTopColor: "#C68A2F", borderRadius: "50%", animation: "umspin 0.8s linear infinite" }} />
      </div>
    );
  }

  const { student, enrollment, sessions, misconceptions } = data;
  const name = student.email.split("@")[0];
  const latest = sessions[0] ?? null;
  const band = placementBand(latest?.final_score ?? null);
  const first = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  const strandAvgs: Record<Strand, number> = { QR: 0, AR: 0, GR: 0, PR: 0 };
  for (const s of ORDER) {
    const vals = sessions.map((x) => x.strand_breakdown?.[s]?.pct).filter((v): v is number => typeof v === "number");
    strandAvgs[s] = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }
  const weakest = sessions.length > 0 ? ORDER.reduce((a, b) => (strandAvgs[a] <= strandAvgs[b] ? a : b)) : null;

  const stats = [
    { label: "Total attempts", value: sessions.length, sub: sessions.length === 1 ? "1 test taken" : `${sessions.length} tests taken` },
    { label: "Latest score", value: latest?.final_score ?? "—", sub: band.label, tone: (latest?.final_score ?? 0) >= PASSING ? "good" : undefined },
    { label: "Weakest strand", value: weakest ?? "—", sub: weakest ? `avg ${strandAvgs[weakest]}% accuracy` : "no data", tone: "warn" },
    { label: "First tested", value: first ? formatDate(first.created_at) : "—", sub: first ? "earliest attempt" : "" },
  ];

  const cardStyle: React.CSSProperties = { background: "#fff", border: "1px solid rgba(15,30,53,0.07)", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 2px rgba(15,30,53,0.04)" };

  return shell(
    <>
      {/* Navy header strip with brand + breadcrumb */}
      <header style={{ background: "#0F1E35", color: "#fff", padding: isMobile ? "12px 16px" : "14px 28px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <a href={`/teacher`} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3 L5 8 L10 13" /></svg>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: isMobile ? 160 : 320 }}>{enrollment.class_name}</span>
          </a>
          <img
              src="/unpackmath-wordmark.png"
              alt="UnpackMath"
              width={2000}
              height={485}
              style={{ width: 96, height: 'auto', display: 'block', flexShrink: 0 }}
            />
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: isMobile ? "20px 16px 48px" : "28px 28px 56px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Profile header */}
        <div style={{ background: "#fff", border: "1px solid rgba(15,30,53,0.07)", borderRadius: 16, padding: isMobile ? "20px" : "24px 26px", boxShadow: "0 1px 2px rgba(15,30,53,0.04)", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 16 : 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#0F1E35", color: "#E7BE7B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, flex: "0 0 64px" }}>
            {student.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: isMobile ? 22 : 26, letterSpacing: -0.4, color: "#0F1E35" }}>{name}</h1>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: band.bg, color: band.text, fontSize: 12, fontWeight: 700, padding: "5px 11px", borderRadius: 20, whiteSpace: "nowrap" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: band.dot }} />{band.label}
              </span>
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#5F5E5A" }}>{student.email}</div>
            <div style={{ marginTop: 10, display: "flex", gap: 18, flexWrap: "wrap", fontSize: 12, color: "#8A8983" }}>
              <span>Class · <span style={{ color: "#5F5E5A", fontWeight: 600 }}>{enrollment.class_name}</span></span>
              <span>Enrolled · <span style={{ color: "#5F5E5A", fontWeight: 600 }}>{formatDate(enrollment.enrolled_at)}</span></span>
              <span>Via · <span style={{ color: "#5F5E5A", fontWeight: 600 }}>{enrollment.enrolled_via.replace(/_/g, " ")}</span></span>
            </div>
          </div>
          {latest?.final_score != null && (
            <div style={{ textAlign: isMobile ? "left" : "right", flexShrink: 0 }}>
              <div style={{ fontSize: 34, fontWeight: 700, color: "#0F1E35", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{latest.final_score}</div>
              <div style={{ fontSize: 11, color: "#8A8983", marginTop: 4 }}>latest / 990</div>
            </div>
          )}
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
          {stats.map((c) => (
            <div key={c.label} style={c.tone === "warn"
              ? { background: "#FBF4E6", border: "1px solid rgba(198,138,47,0.35)", borderRadius: 12, padding: "14px 16px" }
              : cardStyle}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: "uppercase", color: c.tone === "warn" ? "#9A6A1F" : "#8A8983" }}>{c.label}</div>
              <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: c.tone === "good" ? "#356B1B" : "#0F1E35", lineHeight: 1.1 }}>{c.value}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: c.tone === "warn" ? "#7A5B2A" : "#5F5E5A" }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Test history */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 13, gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: "#0F1E35" }}>Test history</h2>
            <span style={{ fontSize: 12, color: "#8A8983" }}>All attempts, most recent first</span>
          </div>

          {sessions.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: "center", padding: "32px 24px" }}>
              <p style={{ fontSize: 14, color: "#5F5E5A", margin: 0 }}>No tests taken yet.</p>
            </div>
          ) : isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sessions.map((sess, i) => {
                const b = placementBand(sess.final_score);
                return (
                  <div key={sess.id} style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#0F1E35", fontVariantNumeric: "tabular-nums" }}>{sess.final_score ?? "—"}</div>
                        <div style={{ fontSize: 12, color: "#8A8983", marginTop: 2 }}>{formatDate(sess.created_at)} · #{sessions.length - i}</div>
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: b.bg, color: b.text, fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 20 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: b.dot }} />{b.label}
                      </span>
                    </div>
                    <div style={{ marginTop: 12 }}><StrandProfile breakdown={sess.strand_breakdown} /></div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#FBFBF9", borderBottom: "1px solid #E7E5DD" }}>
                    {["Date", "Score", "Placement", "Strand performance (QR / AR / GR / PR)", "Attempt"].map((h, i) => (
                      <th key={h} style={{ textAlign: i === 4 ? "center" : "left", padding: "11px 16px", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "#8A8983", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((sess, i) => {
                    const b = placementBand(sess.final_score);
                    return (
                      <tr key={sess.id} style={{ borderBottom: i < sessions.length - 1 ? "1px solid #F0EEE7" : "none" }}>
                        <td style={{ padding: "12px 16px", color: "#5F5E5A", whiteSpace: "nowrap", fontSize: 13 }}>{formatDate(sess.created_at)}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 15, color: "#0F1E35", fontVariantNumeric: "tabular-nums" }}>{sess.final_score ?? "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: b.bg, color: b.text, fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: b.dot }} />{b.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}><StrandProfile breakdown={sess.strand_breakdown} /></td>
                        <td style={{ padding: "12px 16px", textAlign: "center", fontSize: 12.5, color: "#8A8983" }}>#{sessions.length - i}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Misconceptions */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 13, gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: "#0F1E35" }}>Misconceptions</h2>
            <span style={{ fontSize: 12, color: "#8A8983" }}>Across all attempts</span>
          </div>

          {misconceptions.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: "center", padding: "32px 24px" }}>
              <p style={{ fontSize: 14, color: "#5F5E5A", margin: 0 }}>No misconception data yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 14 }}>
              {misconceptions.map((mc) => {
                const color = STR[(mc.primary_strand as Strand)]?.color ?? "#D3D1C7";
                return (
                  <div key={`${mc.item_id}-${mc.selected_answer}`} style={{ ...cardStyle, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 8, background: "#0F1E35", color: "#E7BE7B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{mc.rank}</div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#0F1E35" }}>
                          <span style={{ width: 9, height: 9, borderRadius: 2, background: color }} />{mc.primary_strand}
                        </span>
                      </div>
                      <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#5F5E5A", background: "#F4F3EE", padding: "3px 7px", borderRadius: 5 }}>{mc.topic_id}</span>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, color: "#26262A" }}>
                      <MathText text={mc.distractor_text} />
                    </div>
                    <div style={{ fontSize: 12, color: "#5F5E5A", paddingTop: 10, borderTop: "1px solid #F0EEE7" }}>
                      Selected <strong style={{ color: "#1A1A1A" }}>{mc.frequency}</strong> {mc.frequency === 1 ? "time" : "times"} across all attempts
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
