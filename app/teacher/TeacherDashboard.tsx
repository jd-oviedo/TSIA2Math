"use client";

import { useState, useEffect, useCallback } from "react";
import posthog from "posthog-js";
import MathText from "../components/MathText";

type ClassRow = {
  id: string;
  name: string;
  join_code: string;
  created_at: string;
};

type StrandBreakdown = {
  AR?: { pct: number; total: number; correct: number };
  QR?: { pct: number; total: number; correct: number };
  GR?: { pct: number; total: number; correct: number };
  PR?: { pct: number; total: number; correct: number };
};

type RosterRow = {
  student_id: string;
  email: string;
  initials: string;
  enrolled_via: string;
  enrolled_at: string;
  attempt_count: number;
  latest_session: {
    id: string;
    final_score: number | null;
    strand_breakdown: StrandBreakdown | null;
    completed_at: string;
  } | null;
};

type Misconception = {
  rank: number;
  item_id: string;
  selected_answer: string;
  distractor_text: string;
  primary_strand: string;
  topic_id: string;
  frequency: number;
  affected_students: number;
};

const PASSING = 950;

const STRAND_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  QR: { bg: "#B5D4F4", text: "#0C447C", label: "QR" },
  AR: { bg: "#9FE1CB", text: "#085041", label: "AR" },
  GR: { bg: "#FAC775", text: "#633806", label: "GR" },
  PR: { bg: "#CECBF6", text: "#3C3489", label: "PR" },
};

const STRAND_ORDER = ["QR", "AR", "GR", "PR"] as const;

const AVATAR_COLORS = [
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#FAECE7", text: "#712B13" },
  { bg: "#FAEEDA", text: "#633806" },
];

function placementBand(score: number | null): {
  label: string;
  bg: string;
  color: string;
} {
  if (score === null) return { label: "No test yet", bg: "var(--ec-surface)", color: "var(--ec-ink-muted)" };
  if (score >= PASSING) return { label: "College ready", bg: "#EAF3DE", color: "#27500A" };
  if (score >= 935) return { label: "Approaching", bg: "#FAEEDA", color: "#633806" };
  return { label: "Below college ready", bg: "#FCEBEB", color: "#791F1F" };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 14) return "1w ago";
  return `${Math.floor(days / 7)}w ago`;
}

function StrandBar({ breakdown }: { breakdown: StrandBreakdown | null }) {
  if (!breakdown) {
    return (
      <span style={{ fontSize: "11px", color: "var(--ec-ink-faint)" }}>
        No test data
      </span>
    );
  }
  return (
    <div style={{ display: "flex", height: "18px", borderRadius: "3px", overflow: "hidden", gap: "1px", width: "100%", minWidth: "140px" }}>
      {STRAND_ORDER.map((s) => {
        const val = breakdown[s];
        const pct = val ? val.pct : 0;
        const c = STRAND_COLORS[s];
        return (
          <div
            key={s}
            style={{
              flex: Math.max(pct, 8),
              background: c.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "9px",
              fontWeight: 500,
              color: c.text,
            }}
          >
            {s}
          </div>
        );
      })}
    </div>
  );
}

function MiniBar({ rank }: { rank: number }) {
  const heights = [40, 55, 70, 85, 100];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "28px" }} aria-hidden="true">
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: "6px",
            height: `${h}%`,
            background: i >= heights.length - rank ? "#C68A2F" : "var(--ec-line)",
            borderRadius: "2px 2px 0 0",
          }}
        />
      ))}
    </div>
  );
}

export default function TeacherDashboard({ initialClasses }: { initialClasses: ClassRow[] }) {
  const [classes, setClasses] = useState<ClassRow[]>(initialClasses);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClasses[0]?.id ?? "");
  const [roster, setRoster] = useState<RosterRow[] | null>(null);
  const [misconceptions, setMisconceptions] = useState<Misconception[] | null>(null);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState("");
  const [creatingClass, setCreatingClass] = useState(false);
  const [showNewClass, setShowNewClass] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ ok: boolean; message: string } | null>(null);

  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null;

  const loadClassData = useCallback(async (classId: string) => {
    if (!classId) return;
    setRoster(null);
    setMisconceptions(null);
    setRosterError(null);

    const [rosterRes, mcRes] = await Promise.all([
      fetch(`/api/teacher/roster?class_id=${classId}`),
      fetch(`/api/teacher/misconceptions?class_id=${classId}`),
    ]);

    if (!rosterRes.ok) {
      setRosterError("Failed to load roster.");
      return;
    }

    const rosterData = await rosterRes.json();
    setRoster(rosterData.roster ?? []);

    if (mcRes.ok) {
      const mcData = await mcRes.json();
      setMisconceptions(mcData.misconceptions ?? []);
    }
  }, []);

  useEffect(() => {
    posthog.capture("dashboard_viewed", { dashboard_type: "teacher" });
  }, []);

  useEffect(() => {
    if (selectedClassId) loadClassData(selectedClassId);
  }, [selectedClassId, loadClassData]);

  const createClass = async () => {
    const name = newClassName.trim();
    if (!name) return;
    setCreatingClass(true);
    const res = await fetch("/api/teacher/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = await res.json();
      setClasses((prev) => [...prev, data.class]);
      setSelectedClassId(data.class.id);
      setNewClassName("");
      setShowNewClass(false);
    }
    setCreatingClass(false);
  };

  const copyJoinLink = () => {
    if (!selectedClass) return;
    navigator.clipboard.writeText(selectedClass.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const sendInvite = async () => {
    const email = inviteEmail.trim();
    if (!email || !selectedClassId) return;
    setInviting(true);
    setInviteResult(null);
    const res = await fetch("/api/teacher/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, class_id: selectedClassId }),
    });
    const data = await res.json();
    setInviting(false);
    if (!res.ok) {
      setInviteResult({ ok: false, message: data.error ?? "Something went wrong." });
    } else {
      const msg = data.status === "enrolled"
        ? `${email} was already registered and has been enrolled.`
        : `Invite sent to ${email}. They'll be enrolled when they sign up.`;
      setInviteResult({ ok: true, message: msg });
      setInviteEmail("");
    }
  };

  // Summary stats
  const tested = (roster ?? []).filter((r) => r.latest_session !== null);
  const collegeReady = tested.filter(
    (r) => (r.latest_session?.final_score ?? 0) >= PASSING
  ).length;
  const avgScore =
    tested.length > 0
      ? Math.round(
          tested.reduce((sum, r) => sum + (r.latest_session?.final_score ?? 0), 0) /
            tested.length
        )
      : null;

  const strandAvgs: Record<string, number> = {};
  if (tested.length > 0) {
    for (const s of STRAND_ORDER) {
      const vals = tested
        .map((r) => r.latest_session?.strand_breakdown?.[s]?.pct ?? null)
        .filter((v): v is number => v !== null);
      strandAvgs[s] = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    }
  }
  const weakestStrand =
    STRAND_ORDER.length > 0 && tested.length > 0
      ? STRAND_ORDER.reduce((a, b) => (strandAvgs[a] <= strandAvgs[b] ? a : b))
      : null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-sans, sans-serif)", background: "var(--ec-bg)" }}>

      {/* Sidebar */}
      <div style={{ width: "200px", flexShrink: 0, background: "#0f1e35", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px", borderBottom: "0.5px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#C68A2F", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: "14px", fontWeight: 700 }}>U</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: "14px", fontWeight: 500 }}>UnpackMath</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>Teacher Portal</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          {[
            { label: "Dashboard", active: true },
            { label: "Misconceptions", active: false },
            { label: "Students", active: false },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                color: item.active ? "#fff" : "rgba(255,255,255,0.5)",
                background: item.active ? "rgba(198,138,47,0.15)" : "transparent",
                borderLeft: item.active ? "2px solid #C68A2F" : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              {item.label}
            </div>
          ))}
          <div style={{ marginTop: "16px", padding: "4px 16px 4px", fontSize: "10px", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Tools
          </div>
          <a
            href="/adaptive-test"
            style={{
              display: "block",
              padding: "8px 16px",
              fontSize: "13px",
              color: "rgba(255,255,255,0.5)",
              borderLeft: "2px solid transparent",
              textDecoration: "none",
            }}
          >
            Take a practice test
          </a>
        </nav>

        <div style={{ padding: "12px 16px", borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
          <a href="/dashboard" style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
            Student view
          </a>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", borderBottom: "0.5px solid var(--ec-line)", background: "var(--ec-surface)" }}>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{ padding: "6px 10px", fontSize: "13px", fontWeight: 500, borderRadius: "8px", border: "0.5px solid var(--ec-line)", background: "var(--ec-bg)", color: "var(--ec-ink)", cursor: "pointer" }}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {showNewClass ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createClass()}
                placeholder="Class name"
                autoFocus
                style={{ padding: "6px 10px", fontSize: "13px", borderRadius: "8px", border: "0.5px solid var(--ec-line)", background: "var(--ec-bg)", color: "var(--ec-ink)", width: "180px" }}
              />
              <button onClick={createClass} disabled={creatingClass} style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "8px", border: "none", background: "#0f1e35", color: "#fff", cursor: "pointer" }}>
                {creatingClass ? "Creating..." : "Create"}
              </button>
              <button onClick={() => setShowNewClass(false)} style={{ padding: "6px 10px", fontSize: "12px", borderRadius: "8px", border: "0.5px solid var(--ec-line)", background: "transparent", color: "var(--ec-ink-muted)", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setShowNewClass(true)} style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "8px", border: "0.5px solid var(--ec-line)", background: "transparent", color: "var(--ec-ink-muted)", cursor: "pointer" }}>
              + New class
            </button>
          )}

          <div style={{ flex: 1 }} />

          {selectedClass && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--ec-bg)", border: "0.5px solid var(--ec-line)", borderRadius: "8px", padding: "6px 12px" }}>
              <span style={{ fontSize: "11px", color: "var(--ec-ink-muted)" }}>Join code</span>
              <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: "var(--ec-ink)", letterSpacing: "0.1em" }}>{selectedClass.join_code}</span>
              <button onClick={copyJoinLink} style={{ fontSize: "11px", color: "#185FA5", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                {copied ? "Copied!" : "Copy"}
              </button>
              <div style={{ width: "1px", height: "20px", background: "var(--ec-line)", margin: "0 4px" }} />
              {showInvite ? (
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <input
                    value={inviteEmail}
                    onChange={(e) => { setInviteEmail(e.target.value); setInviteResult(null); }}
                    onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                    placeholder="student@email.com"
                    autoFocus
                    type="email"
                    style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "6px", border: "0.5px solid var(--ec-line)", background: "var(--ec-bg)", color: "var(--ec-ink)", width: "180px" }}
                  />
                  <button onClick={sendInvite} disabled={inviting || !inviteEmail.trim()} style={{ fontSize: "11px", color: "#fff", background: "#0f1e35", border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}>
                    {inviting ? "Sending..." : "Invite"}
                  </button>
                  <button onClick={() => { setShowInvite(false); setInviteEmail(""); setInviteResult(null); }} style={{ fontSize: "11px", color: "var(--ec-ink-muted)", background: "none", border: "none", cursor: "pointer" }}>
                    Cancel
                  </button>
                  {inviteResult && (
                    <span style={{ fontSize: "11px", color: inviteResult.ok ? "var(--ec-green)" : "var(--ec-orange)", whiteSpace: "nowrap" }}>
                      {inviteResult.message}
                    </span>
                  )}
                </div>
              ) : (
                <button onClick={() => setShowInvite(true)} style={{ fontSize: "11px", color: "var(--ec-ink-muted)", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>
                  + Invite by email
                </button>
              )}
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Summary cards */}
          {roster !== null && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              {[
                { label: "Students enrolled", value: roster.length, sub: `${roster.length - tested.length} not yet tested` },
                { label: "College ready", value: collegeReady, sub: `of ${tested.length} tested`, highlight: true },
                { label: "Weakest strand", value: weakestStrand ?? "--", sub: weakestStrand ? `avg ${strandAvgs[weakestStrand]}% accuracy` : "no data", warn: true },
                { label: "Avg score", value: avgScore ?? "--", sub: "passing is 950" },
              ].map((card) => (
                <div key={card.label} style={{ background: "var(--ec-surface)", borderRadius: "8px", padding: "12px 14px", border: "0.5px solid var(--ec-line)" }}>
                  <div style={{ fontSize: "11px", color: "var(--ec-ink-muted)", marginBottom: "4px" }}>{card.label}</div>
                  <div style={{ fontSize: "20px", fontWeight: 500, color: card.highlight ? "#3B6D11" : card.warn ? "#854F0B" : "var(--ec-ink)" }}>{card.value}</div>
                  <div style={{ fontSize: "11px", color: "var(--ec-ink-muted)", marginTop: "2px" }}>{card.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Roster */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ec-ink)" }}>Class roster</span>
              <span style={{ fontSize: "12px", color: "var(--ec-ink-muted)" }}>Most recent test per student</span>
            </div>

            {rosterError && (
              <p style={{ color: "var(--ec-orange)", fontSize: "13px" }}>{rosterError}</p>
            )}

            {roster === null && !rosterError && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: "28px", height: "28px", border: "3px solid var(--ec-line)", borderTopColor: "#C68A2F", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {roster !== null && roster.length === 0 && (
              <div style={{ background: "var(--ec-surface)", border: "0.5px solid var(--ec-line)", borderRadius: "12px", padding: "40px 24px", textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", margin: "0 0 8px" }}>No students enrolled yet.</p>
                <p style={{ fontSize: "13px", color: "var(--ec-ink-faint)", margin: 0 }}>Share the join code above or invite students by email.</p>
              </div>
            )}

            {roster !== null && roster.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr>
                    {["Student", "Score", "Band", "Strand performance", "Tests", "Last active", ""].map((h) => (
                      <th key={h} style={{ fontSize: "11px", fontWeight: 500, color: "var(--ec-ink-muted)", textAlign: "left", padding: "0 10px 8px", borderBottom: "0.5px solid var(--ec-line)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roster.map((row, i) => {
                    const score = row.latest_session?.final_score ?? null;
                    const band = placementBand(score);
                    const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
                    return (
                      <tr key={row.student_id} style={{ borderBottom: "0.5px solid var(--ec-line)" }}>
                        <td style={{ padding: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: av.bg, color: av.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 500, flexShrink: 0 }}>
                              {row.initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, color: "var(--ec-ink)" }}>{row.email.split("@")[0]}</div>
                              <div style={{ fontSize: "11px", color: "var(--ec-ink-muted)" }}>{row.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "10px", fontWeight: 500, fontSize: "14px", color: "var(--ec-ink)" }}>
                          {score ?? "--"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 500, background: band.bg, color: band.color, whiteSpace: "nowrap" }}>
                            {band.label}
                          </span>
                        </td>
                        <td style={{ padding: "10px", minWidth: "160px" }}>
                          <StrandBar breakdown={row.latest_session?.strand_breakdown ?? null} />
                        </td>
                        <td style={{ padding: "10px", textAlign: "center", color: "var(--ec-ink-muted)", fontSize: "12px" }}>
                          {row.attempt_count}
                        </td>
                        <td style={{ padding: "10px", fontSize: "12px", color: "var(--ec-ink-muted)" }}>
                          {row.latest_session ? timeAgo(row.latest_session.completed_at) : "--"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          <a href={`/teacher/student/${row.student_id}?class_id=${selectedClassId}`} style={{ fontSize: "11px", color: "#185FA5", textDecoration: "none" }}>
                            View &rsaquo;
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Misconceptions */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ec-ink)" }}>Top misconceptions</span>
              <span style={{ fontSize: "12px", color: "var(--ec-ink-muted)" }}>Class-wide, most recent test per student</span>
            </div>

            {misconceptions === null && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: "28px", height: "28px", border: "3px solid var(--ec-line)", borderTopColor: "#C68A2F", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
              </div>
            )}

            {misconceptions !== null && misconceptions.length === 0 && (
              <div style={{ background: "var(--ec-surface)", border: "0.5px solid var(--ec-line)", borderRadius: "12px", padding: "32px 24px", textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", margin: 0 }}>No misconception data yet. Students need to complete at least one test.</p>
              </div>
            )}

            {misconceptions !== null && misconceptions.length > 0 && (
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
                    <div style={{ display: "flex", gap: "4px", marginBottom: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "3px", background: "#E6F1FB", color: "#0C447C" }}>{mc.primary_strand}</span>
                      <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "3px", background: "var(--ec-bg)", color: "var(--ec-ink-muted)" }}>{mc.topic_id}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", gap: "16px" }}>
                        <div>
                          <div style={{ fontSize: "10px", color: "var(--ec-ink-muted)" }}>times selected</div>
                          <div style={{ fontSize: "16px", fontWeight: 500, color: "var(--ec-ink)" }}>{mc.frequency}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "10px", color: "var(--ec-ink-muted)" }}>students affected</div>
                          <div style={{ fontSize: "16px", fontWeight: 500, color: "var(--ec-ink)" }}>{mc.affected_students}</div>
                        </div>
                      </div>
                      <MiniBar rank={Math.min(mc.rank, 5)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}