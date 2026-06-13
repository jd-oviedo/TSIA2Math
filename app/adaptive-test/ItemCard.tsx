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

  const handleSelect = (key: string) => {
    if (revealed) return;
    setSelected(key);
  };

  const handleSubmit = () => {
    if (!selected || revealed) return;
    setRevealed(true);
  };

  const handleNext = () => {
    if (!selected) return;
    onAnswer(selected);
    setSelected(null);
    setRevealed(false);
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
      const rows = tableLines.slice(2).map((row) =>
        row.split("|").map((c) => c.trim()).filter(Boolean)
      );
      parts.push(
        <div key={key++} style={{ overflowX: "auto", margin: "16px 0" }}>
          <table style={{ minWidth: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "var(--ec-table-header)" }}>
                {headers.map((h, i) => (
                  <th key={i} style={{ padding: "8px 14px", textAlign: "left", fontWeight: 600, color: "var(--ec-ink)", borderBottom: "1px solid var(--ec-table-border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "var(--ec-table-row-alt)" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "8px 14px", color: "var(--ec-ink-muted)", borderBottom: "1px solid var(--ec-table-border)" }}>{cell}</td>
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
      if (line.startsWith("|")) {
        tableLines.push(line);
      } else {
        if (tableLines.length > 0) flushTable();
        if (line.trim()) parts.push(<p key={key++} style={{ marginBottom: "8px", color: "var(--ec-ink)", lineHeight: 1.6 }}>{line}</p>);
      }
    }
    if (tableLines.length > 0) flushTable();
    return parts;
  };

  const progressPct = ((itemNumber - 1) / totalItems) * 100;
  const isCorrect = selected === item.correct_answer;

  const choiceStyle = (key: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      width: "100%",
      textAlign: "left",
      borderRadius: "12px",
      padding: "13px 16px",
      cursor: revealed ? "default" : "pointer",
      transition: "all 0.15s ease",
      fontFamily: "inherit",
      fontSize: "14px",
      lineHeight: 1.5,
      border: "1.5px solid var(--ec-card-border)",
      background: "transparent",
    };

    if (!revealed) {
      if (selected === key) {
        return { ...base, border: "1.5px solid var(--ec-accent)", background: "var(--ec-accent-bg)" };
      }
      return base;
    }

    if (key === item.correct_answer) {
      return { ...base, border: "1.5px solid var(--ec-correct-border)", background: "var(--ec-correct-bg)" };
    }
    if (key === selected) {
      return { ...base, border: "1.5px solid var(--ec-incorrect-border)", background: "var(--ec-incorrect-bg)" };
    }
    return { ...base, opacity: 0.45 };
  };

  const letterStyle = (key: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      flexShrink: 0,
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      border: "1.5px solid var(--ec-ink-faint)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "11px",
      fontWeight: 700,
      color: "var(--ec-ink-muted)",
      background: "transparent",
    };

    if (!revealed) {
      if (selected === key) {
        return { ...base, background: "var(--ec-accent)", borderColor: "var(--ec-accent)", color: "#fff" };
      }
      return base;
    }

    if (key === item.correct_answer) {
      return { ...base, background: "var(--ec-accent)", borderColor: "var(--ec-accent)", color: "#fff" };
    }
    if (key === selected) {
      return { ...base, background: "var(--ec-warm)", borderColor: "var(--ec-warm)", color: "#fff" };
    }
    return base;
  };

  return (
    <div style={{ width: "100%", maxWidth: "640px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Progress row */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "12px", color: "var(--ec-ink-muted)", flexShrink: 0 }}>
          {itemNumber} · {totalItems}
        </span>
        <div style={{ flex: 1, height: "3px", background: "var(--ec-progress-track)", borderRadius: "99px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, var(--ec-progress-start), var(--ec-progress-end))",
              borderRadius: "99px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ec-badge-color)",
            background: "var(--ec-badge-bg)",
            border: "1px solid var(--ec-badge-border)",
            borderRadius: "5px",
            padding: "3px 8px",
            flexShrink: 0,
          }}
        >
          {item.proficiency_level}
        </span>
      </div>

      {/* Question card */}
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
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ec-badge-color)",
            marginBottom: "12px",
          }}
        >
          {item.objective_text} · {item.topic_text}
        </div>
        <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--ec-ink)", lineHeight: 1.6 }}>
          {renderQuestionText(item.question_text)}
        </div>
      </div>

      {/* Answer choices */}
      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        {CHOICE_KEYS.filter((k) => k in item.answer_choices).map((key) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            disabled={revealed}
            style={choiceStyle(key)}
          >
            <span style={letterStyle(key)}>{key}</span>
            <span style={{ color: "var(--ec-ink)", flex: 1 }}>{item.answer_choices[key]}</span>
            {revealed && key === item.correct_answer && (
              <span style={{ marginLeft: "auto", flexShrink: 0, color: "var(--ec-accent)", fontSize: "13px", fontWeight: 700 }}>✓</span>
            )}
            {revealed && key === selected && key !== item.correct_answer && (
              <span style={{ marginLeft: "auto", flexShrink: 0, color: "var(--ec-warm)", fontSize: "13px", fontWeight: 700 }}>✗</span>
            )}
          </button>
        ))}
      </div>

      {/* Explanation panel */}
      {revealed && (
        <div
          style={{
            background: "var(--ec-warm-bg)",
            border: "1px solid var(--ec-warm-border)",
            borderRadius: "14px",
            padding: "18px 20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "8%",
              right: "8%",
              height: "1px",
              background: "var(--ec-warm-border)",
            }}
          />
          <p
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--ec-warm-label)",
              marginBottom: "8px",
            }}
          >
            {isCorrect ? "Nice work" : "Where your thinking broke down"}
          </p>
          <p style={{ fontSize: "13px", color: "var(--ec-ink)", lineHeight: 1.65, marginBottom: selected && !isCorrect ? "10px" : 0 }}>
            {item.explanation}
          </p>
          {selected && !isCorrect && item.distractor_logic[selected] && (
            <p style={{ fontSize: "12px", color: "var(--ec-ink-muted)", lineHeight: 1.6, fontStyle: "italic", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--ec-warm-border)" }}>
              {item.distractor_logic[selected]}
            </p>
          )}
        </div>
      )}

      {/* Adaptive signal */}
      {revealed && (
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--ec-accent)",
              animation: "ecpulse 2s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: "11px", color: "var(--ec-adaptive-signal)", opacity: 0.9 }}>
            Adjusting to your level…
          </span>
          <style>{`@keyframes ecpulse { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:0.25;transform:scale(0.6)} }`}</style>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        {!revealed ? (
          <button
            onClick={handleSubmit}
            disabled={!selected}
            style={{
              padding: "12px 28px",
              background: selected ? "var(--ec-btn-bg)" : "transparent",
              color: selected ? "var(--ec-btn-text)" : "var(--ec-ink-faint)",
              border: "1px solid",
              borderColor: selected ? "var(--ec-accent-border)" : "var(--ec-ink-faint)",
              borderRadius: "12px",
              fontFamily: "inherit",
              fontSize: "14px",
              fontWeight: 600,
              cursor: selected ? "pointer" : "not-allowed",
              transition: "all 0.15s ease",
            }}
          >
            Submit
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              padding: "12px 28px",
              background: "var(--ec-btn-bg)",
              color: "var(--ec-btn-text)",
              border: "1px solid var(--ec-accent-border)",
              borderRadius: "12px",
              fontFamily: "inherit",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Next Question →
          </button>
        )}
      </div>
    </div>
  );
}
