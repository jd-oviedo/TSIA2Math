"use client";

import type { Response } from "./types";
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
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <div className={`rounded-2xl p-8 text-center shadow-sm border-2 ${passed ? "bg-emerald-50 border-emerald-300" : "bg-rose-50 border-rose-300"}`}>
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Estimated TSIA2 Score
        </p>
        <p className={`text-7xl font-extrabold ${passed ? "text-emerald-600" : "text-rose-500"}`}>
          {finalScore}
        </p>
        <p className={`mt-2 text-lg font-semibold ${passed ? "text-emerald-700" : "text-rose-600"}`}>
          {passed ? "✅ Likely College-Ready" : "📚 Keep Practicing"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Passing threshold: {TSIA2_PASSING} · Scale: 910–990
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Correct", value: `${correct} / ${total}` },
          { label: "Accuracy", value: `${pct}%` },
          { label: "Avg. Time", value: `${avgTime}s` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-indigo-700">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {breakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
            Category Breakdown
          </h2>
          <div className="flex flex-col gap-4">
            {breakdown.map(({ strand, correct, total, pct }) => (
              <div key={strand}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{STRAND_LABEL[strand] ?? strand}</span>
                  <span className="text-slate-500">{correct}/{total} ({pct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full">
                  <div
                    className={`h-2.5 rounded-full ${pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-rose-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
          Response History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 uppercase border-b border-slate-100">
                <th className="pb-2 text-left">#</th>
                <th className="pb-2 text-left">Item</th>
                <th className="pb-2 text-left">Difficulty</th>
                <th className="pb-2 text-left">Your Answer</th>
                <th className="pb-2 text-left">Result</th>
                <th className="pb-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r, i) => (
                <tr key={r.item.item_id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2 text-slate-400">{i + 1}</td>
                  <td className="py-2 font-mono text-xs text-slate-600">{r.item.item_id}</td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.item.proficiency_level === "Advanced" ? "bg-rose-100 text-rose-700"
                      : r.item.proficiency_level === "Proficient" ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {r.item.proficiency_level[0]}
                    </span>
                  </td>
                  <td className="py-2 font-semibold">{r.selectedAnswer}</td>
                  <td className="py-2">{r.isCorrect ? "✅" : "❌"}</td>
                  <td className="py-2 text-right font-mono text-indigo-700">{r.scoreAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
      >
        Take Another Test
      </button>
    </div>
  );
}