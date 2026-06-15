"use client";

import { useState } from "react";
import type { Item } from "./type";

interface Props {
  item: Item;
  itemNumber: number;
  totalItems: number;
  onAnswer: (answer: string) => void;
}

const CHOICE_KEYS = ["A", "B", "C", "D"] as const;

export default function ItemCard({ item, itemNumber, totalItems, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (key: string) => { if (revealed) return; setSelected(key); };
  const handleSubmit = () => { if (!selected || revealed) return; setRevealed(true); };
  const handleNext = () => { if (!selected) return; onAnswer(selected); setSelected(null); setRevealed(false); };

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
          <table style={{ minWidth: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
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
                    <td key={ci} style={{ padding: "8px 14px", color: "var(--ec-ink-muted)", borderBottom: "1px solid var(--ec-line)" }}>{cell}</td>
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
        if (line.trim()) parts.push(<p key={key++} style={{ marginBottom: "8px", color: "var(--ec-ink)", lineHeight: 1.65 }}>{line}</p>);
      }
    }
    if (tableLines.length > 0) flushTable();
    return parts;
  };

  const progressPct = ((itemNumber - 1) / totalItems) * 100;
  const isCorrect = selected === item.correct_answer;

  const getChoiceStyle = (key: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: "flex", alignItems: "center", gap: "14px", width: "100%", textAlign: "left",
      borderRadius: "16px", padding: "16px 20px", cursor: revealed ? "default" : "pointer",
      fontFamily: "inherit", fontSize: "15px", lineHeight: 1.5,
      border: "1px solid var(--ec-line)", background: "var(--ec-surface)",
      color: "var(--ec-ink)", transition: "all 0.18s ease",
      boxShadow: "var(--ec-shadow)",
    };
    if (!revealed) {
      if (selected === key) return { ...base, border: "1px solid var(--ec-accent)", background: "var(--ec-accent-soft)" };
      return base;
    }
    if (key === item.correct_answer) return { ...base, border: "1px solid var(--ec-green-border)", background: "var(--ec-green-bg)" };
    if (key === selected) return { ...base, border: "1px solid var(--ec-red-border)", background: "var(--ec-red-bg)" };
    return { ...base, opacity: 0.4 };
  };

  const getLetterStyle = (key: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      flexShrink: 0, width: "32px", height: "32px", borderRadius: "50%",
      border: "1.5px solid var(--ec-line)", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: "12px", fontWeight: 700,
      color: "var(--ec-ink-muted)", background: "transparent", transition: "all 0.18s ease",
    };
    if (!revealed) {
      if (selected === key) return { ...base, background: "var(--ec-accent)", borderColor: "var(--ec-accent)", color: "#fff" };
      return base;
    }
    if (key === item.correct_answer) return { ...base, background: "var(--ec-green)", borderColor: "var(--ec-green)", color: "#fff" };
    if (key === selected) return { ...base, background: "var(--ec-red)", borderColor: "var(--ec-red)", color: "#fff" };
    return base;
  };

  return (
    <div style={{ width: "100%", maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "4px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ec-ink-muted)", letterSpacing: "0.04em", flexShrink: 0 }}>
          {String(itemNumber).padStart(2, "0")} / {String(totalItems).padStart(2, "0")}
        </span>
        <div style={{ flex: 1, height: "4px", background: "var(--ec-line)", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--ec-accent)", borderRadius: "999px", transition: "width 0.5s ease" }} />
        </div>
        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--ec-accent)", background: "var(--ec-accent-soft)", border: "1px solid rgba(15,105,186,0.18)", borderRadius: "999px", padding: "4px 12px", flexShrink: 0 }}>
          {item.proficiency_level}
        </span>
      </div>

      {/* Question card */}
      <div style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "20px", padding: "28px 30px", boxShadow: "var(--ec-shadow)" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "14px" }}>
          {item.objective_text} · {item.topic_text}
        </div>
        <div style={{ fontSize: "22px", fontWeight: 500, color: "var(--ec-ink)", lineHeight: 1.6, fontFamily: "'Georgia', serif" }}>
          {renderQuestionText(item.question_text)}
        </div>
      </div>

      {/* Choices */}
      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        {CHOICE_KEYS.filter((k) => k in item.answer_choices).map((key) => (
          <button key={key} onClick={() => handleSelect(key)} disabled={revealed} style={getChoiceStyle(key)}>
            <span style={getLetterStyle(key)}>{key}</span>
            <span style={{ flex: 1, color: "var(--ec-ink)", fontSize: "16px", fontFamily: "'Georgia', serif", fontWeight: 400 }}>
              {item.answer_choices[key]}
            </span>
            {revealed && key === item.correct_answer && (
              <span style={{ marginLeft: "auto", flexShrink: 0, color: "var(--ec-green)", fontSize: "15px", fontWeight: 700 }}>✓</span>
            )}
            {revealed && key === selected && key !== item.correct_answer && (
              <span style={{ marginLeft: "auto", flexShrink: 0, color: "var(--ec-red)", fontSize: "15px", fontWeight: 700 }}>✗</span>
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {revealed && (
        <div style={{ background: "var(--ec-orange-bg)", border: "1px solid var(--ec-orange-border)", borderRadius: "18px", padding: "20px 24px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--ec-orange)", marginBottom: "10px" }}>
            {isCorrect ? "Nice work" : "Where your thinking broke down"}
          </p>
          <p style={{ fontSize: "15px", color: "var(--ec-ink)", lineHeight: 1.65, fontFamily: "'Georgia', serif" }}>
            {item.explanation}
          </p>
          {selected && !isCorrect && item.distractor_logic[selected] && (
            <p style={{ fontSize: "13px", color: "var(--ec-ink-muted)", lineHeight: 1.6, fontStyle: "italic", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--ec-line)" }}>
              {item.distractor_logic[selected]}
            </p>
          )}
        </div>
      )}

      {/* Adaptive signal */}
      {revealed && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--ec-accent)", animation: "ecpulse 1.6s ease-in-out infinite" }} />
          <span style={{ fontSize: "12px", color: "var(--ec-ink-muted)" }}>Adjusting to your level…</span>
          <style>{`@keyframes ecpulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
        {!revealed ? (
          <button onClick={handleSubmit} disabled={!selected} style={{ padding: "13px 28px", background: selected ? "var(--ec-btn-bg)" : "var(--ec-line)", color: selected ? "var(--ec-btn-text)" : "var(--ec-ink-faint)", border: "none", borderRadius: "14px", fontFamily: "inherit", fontSize: "15px", fontWeight: 700, cursor: selected ? "pointer" : "not-allowed", transition: "all 0.18s ease", boxShadow: selected ? "var(--ec-shadow-btn)" : "none" }}>
            Submit
          </button>
        ) : (
          <button onClick={handleNext} style={{ padding: "13px 28px", background: "var(--ec-btn-bg)", color: "var(--ec-btn-text)", border: "none", borderRadius: "14px", fontFamily: "inherit", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "all 0.18s ease", boxShadow: "var(--ec-shadow-btn)" }}>
            Next question →
          </button>
        )}
      </div>
    </div>
  );
}
