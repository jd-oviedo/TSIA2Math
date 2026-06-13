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
  GS: "Geometric & Spatial Reasoning",
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
    <div style={{ width: "100%", maxWidth: "640px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Score hero */}
      <div
        style={{
          background: "var(--ec-glass-bg)",
          border: "1px solid",
          borderColor: passed ? "var(--ec-correct-border)" : "var(--ec-incorrect-border)",
          borderRadius: "20px",
          padding: "40px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "1px",
            background: "var(--ec-glass-top)",
          }}
        />
        <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ec-ink-muted)", marginBottom: "12px" }}>
          Estimated TSIA2 Score
        </p>
        <p style={{ fontSize: "80px", fontWeight: 800, lineHeight: 1, color: passed ? "var(--ec-accent)" : "var(--ec-warm)", marginBottom: "12px" }}>
          {finalScore}
        </p>
        <p style={{ fontSize: "16px", fontWeight: 600, color: passed ? "var(--ec-accent)" : "var(--ec-warm)", marginBottom: "8px" }}>
          {passed ? "College Ready" : "Keep Practicing"}
        </p>
        <p style={{ fontSize: "12px", color: "var(--ec-ink-muted)" }}>
          Passing threshold: {TSIA2_PASSING} · Scale: 910–990
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
        {[
          { label: "Correct", value: `${correct} / ${total}` },
          { label: "Accuracy", value: `${pct}%` },
          { label: "Avg. Time", value: `${avgTime}s` },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "var(--ec-glass-bg)",
              border: "1px solid var(--ec-glass-border)",
              borderRadius: "14px",
              padding: "18px 14px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--ec-accent)", marginBottom: "4px" }}>{value}</p>
            <p style={{ fontSize: "11px", color: "var(--ec-ink-muted)", letterSpacing: "0.04em" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Strand breakdown */}
      {breakdown.length > 0 && (
        <div
          style={{
            background: "var(--ec-glass-bg)",
            border: "1px solid var(--ec-glass-border)",
            borderRadius: "18px",
            padding: "24px 22px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: "1px",
              background: "var(--ec-glass-top)",
            }}
          />
          <h2 style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ec-ink-muted)", marginBottom: "20px" }}>
            Category Breakdown
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {breakdown.map(({ strand, correct, total, pct }) => (
              <div key={strand}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--ec-ink)" }}>
                    {STRAND_LABEL[strand] ?? strand}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--ec-ink-muted)" }}>
                    {correct}/{total} · {pct}%
                  </span>
                </div>
                <div style={{ width: "100%", height: "4px", background: "var(--ec-progress-track)", borderRadius: "99px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: pct >= 70
                        ? "linear-gradient(90deg, var(--ec-progress-start), var(--ec-accent))"
                        : pct >= 50
                        ? "linear-gradient(90deg, var(--ec-progress-start), var(--ec-progress-end))"
                        : "var(--ec-warm)",
                      borderRadius: "99px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response history */}
      <div
        style={{
          background: "var(--ec-glass-bg)",
          border: "1px solid var(--ec-glass-border)",
          borderRadius: "18px",
          padding: "24px 22px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "1px",
            background: "var(--ec-glass-top)",
          }}
        />
        <h2 style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ec-ink-muted)", marginBottom: "16px" }}>
          Response History
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--ec-table-border)" }}>
                {["#", "Item", "Level", "Answer", "Result", "Score"].map((h, i) => (
                  <th key={h} style={{ paddingBottom: "10px", textAlign: i === 5 ? "right" : "left", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ec-ink-faint)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((r, i) => (
                <tr key={r.item.item_id} style={{ borderBottom: "1px solid var(--ec-table-border)" }}>
                  <td style={{ padding: "10px 0", color: "var(--ec-ink-muted)", fontSize: "12px" }}>{i + 1}</td>
                  <td style={{ padding: "10px 8px 10px 0", fontFamily: "monospace", fontSize: "11px", color: "var(--ec-ink-muted)" }}>{r.item.item_id}</td>
                  <td style={{ padding: "10px 8px 10px 0" }}>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "4px",
                      background: "var(--ec-badge-bg)",
                      color: "var(--ec-badge-color)",
                      border: "1px solid var(--ec-badge-border)",
                    }}>
                      {r.item.proficiency_level[0]}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", fontWeight: 600, color: "var(--ec-ink)" }}>{r.selectedAnswer}</td>
                  <td style={{ padding: "10px 8px 10px 0", fontSize: "13px" }}>
                    {r.isCorrect
                      ? <span style={{ color: "var(--ec-accent)", fontWeight: 700 }}>✓</span>
                      : <span style={{ color: "var(--ec-warm)", fontWeight: 700 }}>✗</span>
                    }
                  </td>
                  <td style={{ padding: "10px 0", textAlign: "right", fontFamily: "monospace", fontSize: "12px", color: "var(--ec-accent)" }}>{r.scoreAfter}</td>
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
        Take Another Test
      </button>

    </div>
  );
}
