"use client";

import { useState } from "react";
import type { Response } from "./type";
// Type-only: app/lib/recommendation.ts imports the service-role Supabase
// client, and `import type` is erased before it can follow anything into this
// client bundle.
import type { Recommendation } from "../lib/recommendation";
import { TSIA2_PASSING, thetaToScore, buildCategoryBreakdown } from "./engine";
import { FONT_BODY } from "../components/fonts";

const SHOW_SIGNIN_PROMPT = true;

interface Props {
  responses: Response[];
  theta: number;
  onRestart: () => void;
  sessionId: string | null;
  saveFailed: boolean;
  // Null while the save is still in flight, and after a save that failed.
  // Absent is a real state here, not an error: this card is the only thing on
  // the page that needs the server, so it is the only thing that waits.
  recommendation: Recommendation | null;
}

const STRAND_LABEL: Record<string, string> = {
  QR: "Quantitative Reasoning",
  AR: "Algebraic Reasoning",
  GR: "Geometric & Spatial Reasoning",
  GS: "Geometric & Spatial Reasoning",
  PR: "Probabilistic & Statistical Reasoning",
  PS: "Probabilistic & Statistical Reasoning",
};

// The "start here" card.
//
// Rendered only for status 'ok'. 'no_evidence' and 'no_topic' both mean no
// topic can be named, and the honest response to that is to show nothing and
// leave the page as it was before this feature existed -- not to apologise for
// a recommendation the student was never promised.
//
// A placeholder topic still counts as 'ok' and still gets a card: the strand is
// a real finding worth telling them about, and the page it links to says
// plainly that the lessons are not written yet. Saying "start with Algebra" and
// then showing a coming-soon page is honest; saying nothing at all would
// withhold the diagnosis as well as the content.
function StartHereCard({ recommendation }: { recommendation: Recommendation }) {
  if (recommendation.status !== "ok") return null;
  const { mode, strand, pct, attempted, topic } = recommendation;
  const strandLabel = STRAND_LABEL[strand] ?? strand;
  // Driven off mode rather than hardcoded. This route asks for 'strongest', but
  // the field is what makes the sentence true: if the mode is ever changed at
  // the call site, the copy follows it instead of confidently naming a
  // strongest strand as the student's weakest.
  const standing = mode === "strongest" ? "strongest" : "weakest";

  return (
    <div style={{
      background: "var(--ec-surface)",
      border: "1px solid var(--ec-line)",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "var(--ec-shadow)",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}>
      <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ec-ink-faint)", margin: 0 }}>
        Start here
      </p>

      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--ec-ink-muted)", margin: 0 }}>
        {strandLabel} was your {standing} strand, {pct}% across {attempted}{" "}
        {attempted === 1 ? "question" : "questions"}.
      </p>

      <p style={{ fontSize: "17px", fontWeight: 600, color: "var(--ec-ink)", margin: 0 }}>
        {topic.is_placeholder
          ? `We are still writing the ${strandLabel} lessons`
          : topic.topic_name}
      </p>

      <a
        href={topic.href}
        style={{
          alignSelf: "flex-start",
          marginTop: "4px",
          padding: "11px 22px",
          background: "var(--ec-btn-bg)",
          color: "var(--ec-btn-text)",
          borderRadius: "10px",
          fontSize: "13px",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        {topic.is_placeholder ? "See what happens next" : "Start this topic"}
      </a>
    </div>
  );
}

export default function ResultsSummary({ responses, theta, onRestart, sessionId, saveFailed, recommendation }: Props) {
  const [historyOpen, setHistoryOpen] = useState(false);
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
        // Option A. Was 44px 28px 36px around an 88px score with a 16px gap
        // under the label, which left the number floating in the middle of a
        // tall card rather than owning it. Tighter frame, bigger number: the
        // card gets shorter while the score reads larger.
        padding: "32px 28px 28px",
        textAlign: "center",
        boxShadow: "var(--ec-shadow)",
      }}>
        {/* 4px, not 16px. The label and the number are one unit -- the label
            names the number directly beneath it -- and a 16px gap read as two
            separate things stacked up. */}
        <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ec-ink-faint)", marginBottom: "4px" }}>
          Estimated TSIA2 Score
        </p>
        <p style={{
          fontSize: "112px",
          fontWeight: 800,
          // Below 1 so the extra size does not buy back the height just saved.
          // Digits have no descenders, so this crops empty space, not glyphs.
          lineHeight: 0.95,
          color: "var(--ec-ink)",
          marginBottom: "10px",
          letterSpacing: "-0.04em",
          fontFamily: FONT_BODY,
        }}>
          {finalScore}
        </p>
        <p style={{ fontSize: "15px", fontWeight: 600, color: passed ? "var(--ec-green)" : "var(--ec-orange)", marginBottom: "10px" }}>
          {passed ? "College Ready" : "Keep Practicing"}
        </p>
        <p style={{ fontSize: "11px", color: "var(--ec-ink-faint)" }}>
          Passing threshold: {TSIA2_PASSING} · Scale: 910–990
        </p>
      </div>

      {/* Above the sign-in ask on purpose: the recommendation is the thing the
          test was taken for, and it is offered before anything is requested in
          return. It needs no account -- /api/sessions computes it from the run
          that was just submitted, signed in or not. */}
      {recommendation && <StartHereCard recommendation={recommendation} />}

      {/* Sign-in prompt */}
      {SHOW_SIGNIN_PROMPT && (
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
            {sessionId
              ? "Sign in to save this result and track your progress over time."
              : saveFailed
              ? "This result couldn't be saved, but you can still sign in to save future attempts."
              : "Saving your result…"}
          </p>

          {sessionId ? (
            <a
              href={`/login?next=${encodeURIComponent("/dashboard")}&session_id=${encodeURIComponent(sessionId)}`}
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
          ) : saveFailed ? (
            <a
              href={`/login?next=${encodeURIComponent("/dashboard")}`}
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
          ) : (
            <span
              style={{
                flexShrink: 0,
                padding: "10px 20px",
                background: "var(--ec-line)",
                color: "var(--ec-ink-faint)",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                cursor: "default",
              }}
            >
              Saving…
            </span>
          )}
        </div>
      )}

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

      {/* Response history.
          Collapsed by default. Twenty rows of per-item detail is reference
          material, not the headline: it pushed the score, the recommendation
          and the sign-in ask up off the first screen for every student who
          finished a test. The toggle is a real <button> with aria-expanded and
          aria-controls rather than a styled div, so the collapsed table is
          announced as collapsed rather than simply being absent. */}
      <div style={{
        background: "var(--ec-surface)",
        border: "1px solid var(--ec-line)",
        borderRadius: "20px",
        padding: "26px 24px",
        boxShadow: "var(--ec-shadow)",
      }}>
        <button
          type="button"
          onClick={() => setHistoryOpen((o) => !o)}
          aria-expanded={historyOpen}
          aria-controls="response-history"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            width: "100%",
            padding: 0,
            border: "none",
            background: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <h2 style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ec-ink-faint)", margin: 0 }}>
            Response History
          </h2>
          <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: "var(--ec-ink-muted)" }}>
            {historyOpen ? "Hide" : `Show all ${total}`}
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                fontSize: "10px",
                transform: historyOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.15s ease",
              }}
            >
              ▾
            </span>
          </span>
        </button>
        <div id="response-history" hidden={!historyOpen} style={{ overflowX: "auto", marginTop: "16px" }}>
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
