"use client";

import MathText from "../components/MathText";
import { useState } from "react";
import type { PublicItem, RevealData } from "./type";

interface Props {
  item: PublicItem;
  itemNumber: number;
  totalItems: number;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  isAuthenticated: boolean;
}

const CHOICE_KEYS = ["A", "B", "C", "D"] as const;

// Fixed letter style — never shrinks, always 32x32, always centered
const LETTER_BASE: React.CSSProperties = {
  flexShrink: 0,
  width: "32px",
  height: "32px",
  minWidth: "32px",
  minHeight: "32px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: 700,
  lineHeight: 1,
  transition: "background 0.18s, border-color 0.18s, color 0.18s",
};

export default function ItemCard({ item, itemNumber, totalItems, onAnswer, isAuthenticated }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [revealError, setRevealError] = useState(false);
  const [flagState, setFlagState] = useState<"idle" | "open" | "submitting" | "done" | "error">("idle");
  const [flagCategory, setFlagCategory] = useState("");
  const [flagComment, setFlagComment] = useState("");

  const handleSelect = (key: string) => { if (revealed || revealing) return; setSelected(key); };

  const handleSubmit = async () => {
    if (!selected || revealed || revealing) return;
    setRevealing(true);
    setRevealError(false);
    try {
      const res = await fetch("/api/items/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item.item_id, selected_answer: selected }),
      });
      if (!res.ok) throw new Error("Failed to check answer");
      const data: RevealData = await res.json();
      setRevealData(data);
      setRevealed(true);
    } catch {
      setRevealError(true);
    } finally {
      setRevealing(false);
    }
  };

  const handleNext = () => {
  if (!selected || !revealData) return;
  onAnswer(selected, revealData.isCorrect);
  setSelected(null);
  setRevealed(false);
  setRevealData(null);
  setFlagState("idle");
  setFlagCategory("");
  setFlagComment("");
};
const handleFlagSubmit = async () => {
  if (!flagCategory) return;
  setFlagState("submitting");
  try {
    const res = await fetch("/api/items/flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: item.item_id,
        category: flagCategory,
        comment: flagComment.trim() || undefined,
      }),
    });
    if (!res.ok) throw new Error();
    setFlagState("done");
  } catch {
    setFlagState("error");
  }
};

  const renderQuestionText = (text: string) => {
    const lines = text.split("\n");
    const parts: React.ReactNode[] = [];
    let tableLines: string[] = [];
    let key = 0;

    const flushTable = () => {
      if (tableLines.length < 2) {
        parts.push(<p key={key++} style={{ whiteSpace: "pre-wrap", marginBottom: "8px", color: "var(--ec-ink)" }}>{tableLines.join("\n")}</p>);
        tableLines = [];
        return;
      }
      const headers = tableLines[0].split("|").map((c) => c.trim()).filter(Boolean);
      const rows = tableLines.slice(2).map((row) => row.split("|").map((c) => c.trim()).filter(Boolean));
      parts.push(
        <div key={key++} style={{ overflowX: "auto", margin: "16px 0" }}>
          <table style={{ minWidth: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} style={{ padding: "8px 14px", textAlign: "left", fontWeight: 600, color: "var(--ec-ink)", borderBottom: "1px solid var(--ec-line)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "8px 14px", color: "var(--ec-ink-muted)", borderBottom: "1px solid var(--ec-line)" }}><MathText text={cell} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableLines = [];
    };

    for (const line of lines) {
      if (line.startsWith("|")) { tableLines.push(line); }
      else {
        if (tableLines.length > 0) flushTable();
        if (line.trim()) parts.push(<p key={key++} style={{ marginBottom: "8px", color: "var(--ec-ink)", lineHeight: 1.65, margin: "0 0 6px" }}><MathText text={line} /></p>);
      }
    }
    if (tableLines.length > 0) flushTable();
    return parts;
  };

  const progressPct = ((itemNumber - 1) / totalItems) * 100;
  const isCorrect = revealData?.isCorrect ?? false;

  const getChoiceStyle = (key: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      width: "100%",
      textAlign: "left",
      borderRadius: "16px",
      padding: "15px 20px",
      cursor: revealed ? "default" : "pointer",
      fontFamily: "inherit",
      fontSize: "16px",
      lineHeight: 1.5,
      border: "1px solid var(--ec-line)",
      background: "var(--ec-surface)",
      color: "var(--ec-ink)",
      transition: "background 0.18s, border-color 0.18s, opacity 0.18s",
      boxShadow: "var(--ec-shadow)",
      // prevent browser from shrinking disabled buttons
      WebkitAppearance: "none",
    };
    if (!revealed) {
      if (selected === key) return { ...base, border: "1px solid var(--ec-accent)", background: "var(--ec-accent-soft)" };
      return base;
    }
    if (key === revealData?.correct_answer) return { ...base, border: "1px solid var(--ec-green-border)", background: "var(--ec-green-bg)" };
    if (key === selected) return { ...base, border: "1px solid var(--ec-red-border)", background: "var(--ec-red-bg)" };
    return { ...base, opacity: 0.38 };
  };

  const getLetterStyle = (key: string): React.CSSProperties => {
    if (!revealed) {
      if (selected === key) {
        return { ...LETTER_BASE, background: "var(--ec-accent)", border: "1.5px solid var(--ec-accent)", color: "#fff" };
      }
      return { ...LETTER_BASE, background: "transparent", border: "1.5px solid var(--ec-line)", color: "var(--ec-ink-muted)" };
    }
    if (key === revealData?.correct_answer) {
      return { ...LETTER_BASE, background: "var(--ec-green)", border: "1.5px solid var(--ec-green)", color: "#fff" };
    }
    if (key === selected) {
      return { ...LETTER_BASE, background: "var(--ec-red)", border: "1.5px solid var(--ec-red)", color: "#fff" };
    }
    return { ...LETTER_BASE, background: "transparent", border: "1.5px solid var(--ec-line)", color: "var(--ec-ink-faint)" };
  };

  return (
    <div style={{ width: "100%", maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "4px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ec-ink-muted)", letterSpacing: "0.04em", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
          {String(itemNumber).padStart(2, "0")} / {String(totalItems).padStart(2, "0")}
        </span>
        <div style={{ flex: 1, height: "4px", background: "var(--ec-line)", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--ec-accent)", borderRadius: "999px", transition: "width 0.5s ease" }} />
        </div>
        <span style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase",
          color: "var(--ec-accent)", background: "var(--ec-accent-soft)",
          border: "1px solid var(--ec-accent-soft)",
          borderRadius: "999px", padding: "4px 12px", flexShrink: 0,
        }}>
          {item.proficiency_level}
        </span>
      </div>

      {/* Question card */}
      <div style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "20px", padding: "28px 30px", boxShadow: "var(--ec-shadow)" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "14px", fontFamily: "var(--font-kodchasan), sans-serif" }}>
  {item.category}: {item.objective_text}
</div>
        <div style={{ fontSize: "20px", fontWeight: 500, color: "var(--ec-ink)", lineHeight: 1.65, fontFamily: "Georgia, 'Times New Roman', serif" }}>
          {renderQuestionText(item.question_text)}
        </div>
      </div>

      {/* Choices */}
      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        {CHOICE_KEYS.filter((k) => k in item.answer_choices).map((key) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            disabled={revealed}
            style={getChoiceStyle(key)}
          >
            <span style={getLetterStyle(key)}>{key}</span>
            <span style={{ flex: 1, color: "var(--ec-ink)", fontSize: "16px", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}>
  <MathText text={item.answer_choices[key]} />
</span>
            {revealed && key === revealData?.correct_answer && (
              <span style={{ marginLeft: "auto", flexShrink: 0, color: "var(--ec-green)", fontSize: "16px", fontWeight: 700 }}>✓</span>
            )}
            {revealed && key === selected && key !== revealData?.correct_answer && (
              <span style={{ marginLeft: "auto", flexShrink: 0, color: "var(--ec-red)", fontSize: "16px", fontWeight: 700 }}>✗</span>
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {revealed && revealData && (
        <div style={{ background: "var(--ec-orange-bg)", border: "1px solid var(--ec-orange-border)", borderRadius: "18px", padding: "20px 24px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--ec-orange)", marginBottom: "10px" }}>
            {isCorrect ? "Nice work" : "Where your thinking broke down"}
          </p>

          {revealData.explanation !== null ? (
  <>
    <div style={{ fontSize: "15px", color: "var(--ec-ink)", lineHeight: 1.7, fontFamily: "Georgia, 'Times New Roman', serif", margin: 0 }}>
  {renderQuestionText(revealData.explanation)}
</div>
    {selected && !isCorrect && revealData.distractor_note && (
      <div style={{ fontSize: "13px", color: "var(--ec-ink-muted)", lineHeight: 1.6, fontStyle: "italic", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--ec-line)", fontFamily: "Georgia, 'Times New Roman', serif" }}>
  {renderQuestionText(revealData.distractor_note)}
</div>
    )}
  {isAuthenticated && (
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--ec-line)" }}>
          {flagState === "idle" && (
            <button
              onClick={() => setFlagState("open")}
              style={{ background: "none", border: "none", padding: 0, fontSize: "12px", color: "var(--ec-ink-muted)", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}
            >
              Flag an issue with this question
            </button>
          )}
          {flagState === "open" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <select
                value={flagCategory}
                onChange={(e) => setFlagCategory(e.target.value)}
                style={{ fontSize: "13px", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--ec-line)", background: "var(--ec-surface)", color: flagCategory ? "var(--ec-ink)" : "var(--ec-ink-muted)", fontFamily: "inherit" }}
              >
                <option value="" disabled>Select a category</option>
                <option value="symbols_or_math_look_wrong">Symbols or math look wrong (e.g. fraction shows as 1/2 instead of stacked)</option>
                <option value="answer_seems_incorrect">Answer seems incorrect</option>
                <option value="explanation_unclear_or_wrong">Explanation is unclear or has an error</option>
                <option value="question_has_typo_or_is_confusing">Question has a typo or is confusing</option>
                <option value="other">Other</option>
              </select>
              <textarea
                value={flagComment}
                onChange={(e) => setFlagComment(e.target.value)}
                placeholder="Describe the issue... (optional)"
                maxLength={500}
                rows={3}
                style={{ fontSize: "13px", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--ec-line)", background: "var(--ec-surface)", color: "var(--ec-ink)", fontFamily: "inherit", resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleFlagSubmit}
                  disabled={!flagCategory}
                  style={{ padding: "8px 16px", background: flagCategory ? "var(--ec-btn-bg)" : "var(--ec-line)", color: flagCategory ? "var(--ec-btn-text)" : "var(--ec-ink-faint)", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: flagCategory ? "pointer" : "not-allowed", fontFamily: "inherit" }}
                >
                  Submit
                </button>
                <button
                  onClick={() => { setFlagState("idle"); setFlagCategory(""); setFlagComment(""); }}
                  style={{ padding: "8px 16px", background: "none", border: "1px solid var(--ec-line)", borderRadius: "8px", fontSize: "13px", color: "var(--ec-ink-muted)", cursor: "pointer", fontFamily: "inherit" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {flagState === "submitting" && (
            <p style={{ fontSize: "12px", color: "var(--ec-ink-muted)", margin: 0 }}>Submitting...</p>
          )}
          {flagState === "done" && (
            <p style={{ fontSize: "12px", color: "var(--ec-ink-muted)", margin: 0 }}>Thanks for the feedback.</p>
          )}
          {flagState === "error" && (
            <p style={{ fontSize: "12px", color: "var(--ec-red)", margin: 0 }}>Couldn&rsquo;t submit -- try again.</p>
          )}
        </div>
      )}
    </>
) : (
  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    <p style={{ fontSize: "15px", color: "var(--ec-ink)", lineHeight: 1.7, fontFamily: "Georgia, 'Times New Roman', serif", margin: 0 }}>
      Sign in to see why this answer is correct and where the other choices go wrong.
    </p>
    <button
      onClick={() => { window.location.href = '/login' }}
      style={{
        alignSelf: "flex-start",
        padding: "10px 20px",
        background: "var(--ec-btn-bg)",
        color: "var(--ec-btn-text)",
        border: "none",
        borderRadius: "10px",
        fontFamily: "inherit",
        fontSize: "14px",
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "var(--ec-shadow-btn)",
      }}
    >
      Sign in with Google
    </button>
  </div>
)}
        </div>
      )}

      {revealError && (
        <div style={{ background: "var(--ec-red-bg)", border: "1px solid var(--ec-red-border)", borderRadius: "18px", padding: "16px 20px" }}>
          <p style={{ fontSize: "13px", color: "var(--ec-red)", margin: 0 }}>
            Couldn&rsquo;t check that answer. Check your connection and try Submit again.
          </p>
        </div>
      )}

      {/* Adaptive signal */}
      {revealed && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--ec-accent)", animation: "ecpulse 1.6s ease-in-out infinite", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: "var(--ec-ink-muted)" }}>Adjusting to your level…</span>
          <style>{`@keyframes ecpulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
        {!revealed ? (
          <button
            onClick={handleSubmit}
            disabled={!selected || revealing}
            style={{
              padding: "13px 28px",
              background: selected && !revealing ? "var(--ec-btn-bg)" : "var(--ec-line)",
              color: selected && !revealing ? "var(--ec-btn-text)" : "var(--ec-ink-faint)",
              border: "none",
              borderRadius: "14px",
              fontFamily: "inherit",
              fontSize: "15px",
              fontWeight: 700,
              cursor: selected && !revealing ? "pointer" : "not-allowed",
              transition: "all 0.18s ease",
              boxShadow: selected && !revealing ? "var(--ec-shadow-btn)" : "none",
            }}
          >
            {revealing ? "Checking…" : "Submit"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              padding: "13px 28px",
              background: "var(--ec-btn-bg)",
              color: "var(--ec-btn-text)",
              border: "none",
              borderRadius: "14px",
              fontFamily: "inherit",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.18s ease",
              boxShadow: "var(--ec-shadow-btn)",
            }}
          >
            Next question →
          </button>
        )}
      </div>
    </div>
  );
}