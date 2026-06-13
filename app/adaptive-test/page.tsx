"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "./useSession";
import { validateItems } from "./engine";
import ItemCard from "./ItemCard";
import ResultsSummary from "./ResultsSummary";
import type { ItemValidationError } from "./type";
import { supabase } from "../lib/supabase";

const MAX_ITEMS = 20;

function ValidationErrorList({ errors }: { errors: ItemValidationError[] }) {
  return (
    <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-800 max-h-48 overflow-y-auto">
      <p className="font-semibold mb-2">⚠️ {errors.length} malformed item(s) skipped:</p>
      <ul className="list-disc list-inside space-y-1">
        {errors.map((e) => (
          <li key={e.item_id}>
            <span className="font-mono">{e.item_id}</span> — missing: {e.missing.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdaptiveTestPage() {
  const { state, loadItems, loadError, start, answer, restart } = useSession(MAX_ITEMS);

  useEffect(() => {
    if (state.phase !== "loading") return;

    async function fetchItems() {
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .eq("status", "draft");

        if (error) throw new Error(error.message);
        if (!data || data.length === 0) throw new Error("No items found in the question bank.");

        const { items, errors } = validateItems(data);
        if (items.length === 0) throw new Error("No valid items found in the question bank.");
        if (errors.length > 0) {
          console.warn("[CAT Engine] Skipped malformed items:", errors);
        }
        loadItems(items);
        (window as unknown as Record<string, unknown>).__catValidationErrors = errors;
      } catch (err: unknown) {
        loadError(err instanceof Error ? err.message : String(err));
      }
    }

    fetchItems();
  }, [state.phase, loadItems, loadError]);

  if (state.phase === "loading") {
    return (
      <Shell>
        <div className="text-center py-20 text-slate-400">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full mx-auto mb-4" />
          Loading question bank…
        </div>
      </Shell>
    );
  }

  if (state.phase === "error") {
    return (
      <Shell>
        <div className="max-w-lg mx-auto text-center py-16">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold text-rose-600 mb-2">Failed to load question bank</h2>
          <p className="text-slate-600 text-sm">{state.loadError}</p>
          <button
            onClick={restart}
            className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </Shell>
    );
  }

  if (state.phase === "ready") {
    const validationErrors =
      typeof window !== "undefined"
        ? ((window as unknown as Record<string, unknown>).__catValidationErrors as ItemValidationError[] | undefined)
        : undefined;

    return (
      <Shell>
        <div className="max-w-lg mx-auto text-center py-16 flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold text-indigo-700">TSIA2 Math Practice Test</h1>
          <p className="text-slate-600">
            {state.allItems.length} items loaded · {MAX_ITEMS}-question adaptive session
          </p>
          <ul className="text-sm text-slate-500 text-left space-y-1 bg-slate-100 rounded-xl p-4 w-full max-w-sm">
            <li>📐 Starts at <strong>Proficient</strong> difficulty</li>
            <li>🔀 Adapts to your answers in real time</li>
            <li>📊 Score estimated on TSIA2 scale (910–990)</li>
            <li>🎯 Passing threshold: <strong>950+</strong></li>
          </ul>
          {validationErrors && validationErrors.length > 0 && (
            <ValidationErrorList errors={validationErrors} />
          )}
          <button
            onClick={start}
            className="mt-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors"
          >
            Begin Test
          </button>
        </div>
      </Shell>
    );
  }

  if (state.phase === "active" && state.currentItem) {
    return (
      <Shell>
        <ItemCard
          item={state.currentItem}
          itemNumber={state.responses.length + 1}
          totalItems={state.maxItems}
          onAnswer={answer}
        />
      </Shell>
    );
  }

  if (state.phase === "complete") {
    return (
      <Shell>
        <ResultsSummary responses={state.responses} theta={state.theta} onRestart={restart} />
      </Shell>
    );
  }

  return null;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-indigo-700 font-bold text-lg tracking-tight hover:text-indigo-900">
            EdCipher Math
          </Link>
          <span className="text-xs text-slate-400">TSIA2 Adaptive Practice</span>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">{children}</main>
    </div>
  );
}
