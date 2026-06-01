"use client";

import { useState } from "react";
import type { Item } from "./types";

interface Props {
  item: Item;
  itemNumber: number;
  totalItems: number;
  onAnswer: (answer: string) => void;
}

const CHOICE_KEYS = ["A", "B", "C", "D"] as const;

const DIFFICULTY_BADGE: Record<string, string> = {
  Basic: "bg-emerald-100 text-emerald-800",
  Proficient: "bg-amber-100 text-amber-800",
  Advanced: "bg-rose-100 text-rose-800",
};

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

  const choiceStyle = (key: string) => {
    const base =
      "flex items-start gap-3 w-full text-left rounded-xl border-2 p-4 transition-all cursor-pointer";
    if (!revealed) {
      return selected === key
        ? `${base} border-indigo-500 bg-indigo-50`
        : `${base} border-slate-200 hover:border-indigo-300 hover:bg-slate-50`;
    }
    if (key === item.correct_answer) return `${base} border-emerald-500 bg-emerald-50`;
    if (key === selected) return `${base} border-rose-400 bg-rose-50`;
    return `${base} border-slate-200 opacity-60`;
  };

  const renderQuestionText = (text: string) => {
    const lines = text.split("\n");
    const parts: React.ReactNode[] = [];
    let tableLines: string[] = [];
    let key = 0;

    const flushTable = () => {
      if (tableLines.length < 2) {
        parts.push(<p key={key++} className="whitespace-pre-wrap">{tableLines.join("\n")}</p>);
        tableLines = [];
        return;
      }
      const headers = tableLines[0].split("|").map((c) => c.trim()).filter(Boolean);
      const rows = tableLines.slice(2).map((row) =>
        row.split("|").map((c) => c.trim()).filter(Boolean)
      );
      parts.push(
        <div key={key++} className="overflow-x-auto my-4">
          <table className="min-w-full border border-slate-200 rounded-lg text-sm">
            <thead className="bg-slate-100">
              <tr>{headers.map((h, i) => <th key={i} className="px-4 py-2 text-left font-semibold border-b border-slate-200">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  {row.map((cell, ci) => <td key={ci} className="px-4 py-2 border-b border-slate-100">{cell}</td>)}
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
        if (line.trim()) parts.push(<p key={key++} className="mb-2">{line}</p>);
      }
    }
    if (tableLines.length > 0) flushTable();
    return parts;
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 font-medium">
          Question {itemNumber} of {totalItems}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_BADGE[item.proficiency_level] ?? "bg-slate-100 text-slate-600"}`}>
          {item.proficiency_level}
        </span>
      </div>

      <div className="w-full h-2 bg-slate-200 rounded-full">
        <div
          className="h-2 bg-indigo-500 rounded-full transition-all"
          style={{ width: `${((itemNumber - 1) / totalItems) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="text-sm font-medium text-indigo-600 mb-3">
          {item.objective_text} · {item.topic_text}
        </div>
        <div className="text-base text-slate-800 leading-relaxed">
          {renderQuestionText(item.question_text)}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {CHOICE_KEYS.filter((k) => k in item.answer_choices).map((key) => (
          <button key={key} onClick={() => handleSelect(key)} className={choiceStyle(key)} disabled={revealed}>
            <span className="shrink-0 w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
              {key}
            </span>
            <span className="text-sm leading-relaxed">{item.answer_choices[key]}</span>
            {revealed && key === item.correct_answer && (
              <span className="ml-auto shrink-0 text-emerald-600 font-bold">✓</span>
            )}
            {revealed && key === selected && key !== item.correct_answer && (
              <span className="ml-auto shrink-0 text-rose-500 font-bold">✗</span>
            )}
          </button>
        ))}
      </div>

      {revealed && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700">
          <p className="font-semibold mb-1">
            {selected === item.correct_answer ? "✅ Correct!" : "❌ Incorrect"}
          </p>
          <p>{item.explanation}</p>
          {selected && selected !== item.correct_answer && (
            <p className="mt-2 text-slate-500 italic">{item.distractor_logic[selected]}</p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3">
        {!revealed ? (
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-indigo-700 transition-colors"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Next Question →
          </button>
        )}
      </div>
    </div>
  );
}