"use client";

import type { Response } from "./type";
import { TSIA2_PASSING, thetaToScore, buildCategoryBreakdown } from "./engine";

interface Props {
  responses: Response[];
  theta: number;
  onRestart: () => void;
}

const STRAND_LABEL: Record<string, string> = {
  QR: "Quantitative Reasoning",
  AR: "Algebraic Reasoning",
  GR: "Geometric & Spatial Reasoning",
  GS: "Geometric & Spatial Reasoning",
  PR: "Probabilistic & Statistical Reasoning",
  PS: "Probabilistic & Statistical Reasoning",
};

export default function ResultsSummary({ responses, theta, onRestart }: Props) {
  const finalScore = thetaToScore(theta);
  const passed = finalScore >= TSIA2_PASSING;
  const correct = responses.filter((r) => r.isCorrect).length;
  const total = responses.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const avgTime = total > 0 ? Math.round(responses.reduce((s, r) => s + r.elapsedMs, 0) / total / 1000) : 0;
  const breakdown = buildCategoryBreakdown(responses);

  return (
    <div style={{ width: "100%", maxWidth: "620px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "40px" }}>

      {/* Score hero */}
      <div style={{
        background: "var(--ec-surface)",
        border: "1px solid var(--ec-line)",
        borderRadius: "20px",
        padding: "44px 28px 36px",
        textAlign: "center",
        boxShadow: "var(--ec-shadow)",
      }}>
        <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ec-ink-faint)", marginBottom: "16px" }}>
          Estimated TSIA2 Score
        </p>
        <p style={{
          fontSize: "88px",
          fontWeight: 800,
          lineHeight: 1,
          color: "var(--ec-ink)",
          marginBottom: "14px",
          letterSpacing: "-0.04em",
          fontFamily: "var(--font-hanken), system-ui, sans-serif",
        }}>
          {finalScore}
        </p>
        <p style={{ fontSize: "15px", fontWeight: 600, color: passed ? "var(--ec-green)" : "var(--ec-orange)", marginBottom: "8px" }}>
          {passed ? "College Ready" : "Keep Practicing"}
        </p>
        <p style={{ fontSize: "12px", color: "var(--ec-ink-faint)" }}>
          Passing threshold: {TSIA2_PASSING} · Scale: 910–990
        </p>
      </div>

      {/* Sign-in prompt */}
      <div style={{
        background: "var(--ec-surface)",
        border: "1px solid var(--ec-line)",
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: "var(--ec-shadow)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
      }}>
        <p style={{ fontSize: "13px", color: "var(--ec-ink-muted)", margin: 0 }}>
          Sign in to save this result and track your progress over time.
        </p>
        
        <a  href="/login"
          style={{
            flexShrink: 0,
            padding: "10px 20px",
            background: "var(--ec-btn-bg)",
            color: "var(--ec-btn-text)",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 700,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Sign in with Google
        </a>
      </div>

      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
        {[
          { label: "Correct", value: `${correct} / ${total}` },
          { label: "Accuracy", value: `${pct}%` },
          { label: "Avg. Time", value: `${avgTime}s` },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: "var(--ec-surface)",
            border: "1px solid var(--ec-line)",
            borderRadius: "16px",
            padding: "20px 14px",
            textAlign: "center",
            boxShadow: "var(--ec-shadow)",
          }}>
            <p style={{ fontSize: "26px", fontWeight: 800, color: "var(--ec-accent)", marginBottom: "4px", letterSpacing: "-0.02em" }}>{value}</p>
            <p style={{ fontSize: "11px", color: "var(--ec-ink-faint)", letterSpacing: "0.04em" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Strand breakdown */}
      {breakdown.length > 0 && (
        <div style={{
          background: "var(--ec-surface)",
          border: "1px solid var(--ec-line)",
          borderRadius: "20px",
          padding: "26px 24px",
          boxShadow: "var(--ec-shadow)",
        }}>
          <h2 style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ec-ink-faint)", marginBottom: "22px" }}>
            Category Breakdown
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {breakdown.map(({ strand, correct, total, pct }) => (
              <div key={strand}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ec-ink)" }}>
                    {STRAND_LABEL[strand] ?? strand}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--ec-ink-muted)" }}>
                    {correct}/{total} · {pct}%
                  </span>
                </div>
                <div style={{ width: "100%", height: "4px", background: "var(--ec-line)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: pct >= 70 ? "var(--ec-green)" : pct >= 50 ? "var(--ec-accent)" : "var(--ec-orange)",
                    borderRadius: "999px",
                    transition: "width 0.7s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response history */}
      <div style={{
        background: "var(--ec-surface)",
        border: "1px solid var(--ec-line)",
        borderRadius: "20px",
        padding: "26px 24px",
        boxShadow: "var(--ec-shadow)",
      }}>
        <h2 style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ec-ink-faint)", marginBottom: "16px" }}>
          Response History
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--ec-line)" }}>
                {["#", "Level", "Answer", "Result", "Score"].map((h, i) => (
                  <th key={h} style={{
                    paddingBottom: "10px",
                    textAlign: i === 4 ? "right" : "left",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--ec-ink-faint)",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((r, i) => (
                <tr key={r.item.item_id} style={{ borderBottom: "1px solid var(--ec-line)" }}>
                  <td style={{ padding: "11px 0", color: "var(--ec-ink-muted)", fontSize: "13px", width: "32px" }}>{i + 1}</td>
                  <td style={{ padding: "11px 12px 11px 0" }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px",
                      background: "var(--ec-accent-soft)", color: "var(--ec-accent)",
                      border: "1px solid rgba(15,105,186,0.15)",
                    }}>
                      {r.item.proficiency_level[0]}
                    </span>
                  </td>
                  <td style={{ padding: "11px 12px 11px 0", fontWeight: 600, color: "var(--ec-ink)", fontSize: "13px" }}>{r.selectedAnswer}</td>
                  <td style={{ padding: "11px 12px 11px 0", fontSize: "14px" }}>
                    {r.isCorrect
                      ? <span style={{ color: "var(--ec-green)", fontWeight: 700 }}>✓</span>
                      : <span style={{ color: "var(--ec-red)", fontWeight: 700 }}>✗</span>
                    }
                  </td>
                  <td style={{ padding: "11px 0", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "var(--ec-accent)", fontVariantNumeric: "tabular-nums" }}>
                    {r.scoreAfter}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restart */}
      <button
        onClick={onRestart}
        style={{
          width: "100%",
          padding: "16px",
          background: "var(--ec-btn-bg)",
          color: "var(--ec-btn-text)",
          border: "none",
          borderRadius: "14px",
          fontFamily: "inherit",
          fontSize: "15px",
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: "-0.01em",
          boxShadow: "var(--ec-shadow-btn)",
        }}
      >
        Take Another Test
      </button>

    </div>
  );
}
