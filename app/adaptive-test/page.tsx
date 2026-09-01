"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "./useSession";
import { DEFAULT_MAX_ITEMS, validateItems } from "./engine";
import ItemCard from "./ItemCard";
import ResultsSummary from "./ResultsSummary";
import { CAT_ITEM_COLUMNS } from "./type";
import type { ItemValidationError, Response } from "./type";
// Type-only, so the admin Supabase client that module pulls in never reaches
// the browser bundle -- `import type` is erased before webpack sees it.
import type { Recommendation } from "../lib/recommendation";
import { supabase } from "../lib/supabase";
import { CatChrome } from "./CatChrome";
import { C, FONT_HEADING } from "./cat-theme";
import posthog from "posthog-js";
import { SPIN_CSS } from '../motion';

// THE TEST LENGTH IS engine.ts's, NOT A SECOND 20.
//
// This was `const MAX_ITEMS = 20`, a literal that shadowed DEFAULT_MAX_ITEMS
// and was the value actually handed to useSession -- so the engine's own
// default was dead code on the one path that matters, and the two could have
// disagreed without anything noticing. tests/cat-session-length.test.ts now
// holds engine.ts's two definitions of length in step; this import removes the
// third.

// PostgREST caps every response at 1000 rows, and the cap is enforced
// server-side: asking for .limit(2000) still comes back with 1000. Paging with
// .range() is the only way past it, which is why this is a loop rather than one
// call with a bigger limit.
//
// Before this existed the bank query returned a bare 1000 of 1124 draft items,
// with no error and nothing in the response to say it had been truncated, so
// 124 items had never been served to a student.
const PAGE_SIZE = 1000;

// Ordered by item_id because range pagination over an unordered query has no
// stable row order between requests: Postgres is free to build page 2 in a
// different sequence than page 1, which silently repeats some rows and drops
// others. The order itself does not matter to the engine -- it picks items by
// strand and difficulty and shuffles -- only that it is the same order twice.
async function fetchAllDraftItems(): Promise<unknown[]> {
  const rows: unknown[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("questions_public")
      .select(CAT_ITEM_COLUMNS)
      .eq("status", "draft")
      .order("item_id")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;

    rows.push(...data);

    // A short page is the last page. A bank that is an exact multiple of
    // PAGE_SIZE costs one extra empty request, which the check above ends.
    if (data.length < PAGE_SIZE) break;
  }

  return rows;
}

// The recommendation rides back on the save response rather than being fetched
// separately. /api/sessions has already re-derived the per-strand breakdown
// from the real item bank to write the row, so it is the one place that can
// answer "where should this person start" without a second round trip and
// without an account -- which matters, because most people who finish this test
// have not signed in.
async function saveSession(
  responses: Response[],
  maxItems: number
): Promise<{ sessionId: string | null; failed: boolean; recommendation: Recommendation | null }> {
  try {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        max_items: maxItems,
        responses: responses.map((r) => ({
          item_id: r.item.item_id,
          selected_answer: r.selectedAnswer,
          elapsed_ms: r.elapsedMs,
        })),
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("[saveSession] failed:", res.status, body.error ?? res.statusText);
      return { sessionId: null, failed: true, recommendation: null };
    }
    const body = await res.json();
    return {
      sessionId: body.session_id ?? null,
      failed: !body.session_id,
      recommendation: body.recommendation ?? null,
    };
  } catch (err) {
    console.error("[saveSession] network error:", err);
    return { sessionId: null, failed: true, recommendation: null };
  }
}

// The local `Shell` that used to sit here is now app/adaptive-test/CatChrome.tsx,
// which is where data-theme and the body ground are set. showCalculator is still
// threaded rather than inferred inside Header, because the only thing that knows
// whether a test is in progress is the reducer phase, and that lives here. Every
// CatChrome call site below passes it explicitly, so the answer for each phase is
// visible at the phase rather than hidden in a default.
//
// The `Blobs` component that used to sit above Shell has been deleted. It
// rendered an empty div: a fixed, pointer-events-none, zero-child overlay that
// painted nothing on any phase. The live blobs are on the home hero
// (app/page.tsx), which is a separate surface and is untouched.

function ValidationErrorList({ errors }: { errors: ItemValidationError[] }) {
  return (
    <div style={{ marginTop: "24px", background: C.incorrectCard, border: `1px solid ${C.incorrectLine}`, borderRadius: "8px", padding: "16px", fontSize: "13px", color: C.ink, maxHeight: "192px", overflowY: "auto" }}>
      <p style={{ fontWeight: 600, marginBottom: "8px", color: C.incorrectInk }}>{errors.length} malformed item(s) skipped</p>
      <ul style={{ listStyle: "disc", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {errors.map((e) => (
          <li key={e.item_id} style={{ color: C.muted }}>
            <span style={{ fontFamily: "monospace" }}>{e.item_id}</span>, missing: {e.missing.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdaptiveTestPage() {
  const { state, loadItems, loadError, start, answer, restart } = useSession(DEFAULT_MAX_ITEMS);
  const savedRef = useRef(false);
  const prevResponseCountRef = useRef(0);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  // Tri-state on purpose: null means "not yet known", not "signed out". The
  // check is async, so a plain `false` initial value would tell a signed-in
  // student "no account needed" for a beat before correcting itself. The
  // pre-test copy below waits for the answer rather than guessing at it.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setIsAuthenticated(!!session);
  });
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setIsAuthenticated(!!session);
  });
  return () => subscription.unsubscribe();
}, []);
  useEffect(() => {
    if (state.responses.length > prevResponseCountRef.current) {
      const latest = state.responses[state.responses.length - 1];
      posthog.capture("item_answered", {
        item_id: latest.item.item_id,
        strand: latest.item.primary_strand,
        proficiency_level: latest.item.proficiency_level,
        is_correct: latest.isCorrect,
        question_number: state.responses.length,
        time_spent_seconds: Math.round(latest.elapsedMs / 1000),
      });
    }
    prevResponseCountRef.current = state.responses.length;

    if (state.phase === "complete" && !savedRef.current) {
      savedRef.current = true;
      saveSession(state.responses, state.maxItems).then(
        ({ sessionId, failed, recommendation: rec }) => {
          setSavedSessionId(sessionId);
          setSaveFailed(failed);
          setRecommendation(rec);
        }
      );
    }
    if (state.phase !== "complete") {
      savedRef.current = false;
      setSavedSessionId(null);
      setSaveFailed(false);
      setRecommendation(null);
    }
  }, [state.phase, state.responses, state.maxItems]);

  useEffect(() => {
    if (state.phase !== "loading") return;
    async function fetchItems() {
      try {
        const data = await fetchAllDraftItems();
        if (data.length === 0) throw new Error("No items found in the question bank.");
        const { items, errors } = validateItems(data);
        if (items.length === 0) throw new Error("No valid items found in the question bank.");
        if (errors.length > 0) console.warn("[CAT Engine] Skipped malformed items:", errors);
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
      <CatChrome>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ width: "40px", height: "40px", border: `3px solid ${C.border}`, borderTopColor: C.blue, borderRadius: "50%", margin: "0 auto 16px", animation: "um-spin 0.8s linear infinite" }} />
          <p style={{ color: C.muted, fontSize: "14px" }}>Loading question bank…</p>
          {/* Was a local `@keyframes spin`. Retired for the shared name as
              much as for the duplication: `spin` is generic enough that
              anything else defining it would silently take over this loader,
              because @keyframes resolve globally by name. */}
          <style>{SPIN_CSS}</style>
        </div>
      </CatChrome>
    );
  }

  if (state.phase === "error") {
    return (
      <CatChrome>
        <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center", padding: "64px 0" }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</p>
          {/* Ink, not orange. This heading was --ec-orange, which resolves to
              #F2A541 in dark -- brand orange carrying text, the one role the
              palette does not allow it. The warning sign above already colours
              the message. */}
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.ink, marginBottom: "8px", fontFamily: FONT_HEADING }}>Failed to load question bank</h2>
          <p style={{ color: C.muted, fontSize: "14px" }}>{state.loadError}</p>
          <button onClick={restart} style={{ marginTop: "24px", padding: "12px 28px", background: C.cta, color: C.ctaInk, border: "none", borderRadius: "8px", fontFamily: "inherit", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
            Retry
          </button>
        </div>
      </CatChrome>
    );
  }

  if (state.phase === "ready") {
    const validationErrors = typeof window !== "undefined"
      ? ((window as unknown as Record<string, unknown>).__catValidationErrors as ItemValidationError[] | undefined)
      : undefined;

    return (
      <CatChrome>
        <div style={{
          maxWidth: "520px",
          margin: "0 auto",
          textAlign: "center",
          padding: "44px 36px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          // Was --ec-glass-bg over a 16px backdrop blur. Flat card and a
          // hairline instead: the glass had nothing behind it to refract once
          // the (already empty) blob layer was removed.
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
        }}>
          <div>
            {/* Two stacked eyebrows. The kicker is muted and the brand line is
                gold, so they read as a hierarchy rather than as one label
                broken across two rows. */}
            <p style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, marginBottom: "4px" }}>
              Before you begin
            </p>
            <p style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.goldInk, marginBottom: "8px" }}>
              TSIA2 Adaptive Practice
            </p>
            <h1 style={{ fontSize: "34px", fontWeight: 800, color: C.ink, letterSpacing: "-0.025em", lineHeight: 1.1, fontFamily: FONT_HEADING }}>
              Let&rsquo;s find exactly<br />where you are.
            </h1>
          </div>
          <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.65, margin: 0 }}>
            {/* Both numbers come from the live session. The bank count was
                the frozen string "1,100+" while state.allItems held the real
                figure, and the question count was the module literal. */}
            {state.allItems.length.toLocaleString()} items loaded · {state.maxItems} questions · adapts as you go
          </p>
          {/* DIRECTIONS.

              Additive: it sits above the spec panel inside the SAME card, so
              the screen is still one card, one scroll, one action.

              LEFT ALIGNED inside a centred card. The card sets textAlign center
              and alignItems center for the headline block; a numbered list read
              centred is unreadable, so this block opts out for itself rather
              than the card changing for everyone.

              WHAT IS DELIBERATELY NOT HERE: no highlighter, no confirm step, no
              refresh or proctor warning. The engine has none of those, and a
              directions screen that describes controls the test does not have
              is worse than no directions screen. */}
          <div style={{ width: "100%", textAlign: "left", display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.goldInk, margin: 0 }}>
              Directions
            </p>
            <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.65, margin: 0 }}>
              Read these before you start. The practice test works like the real TSIA2.
            </p>
            {/* listStyle and paddingLeft are STATED, not inherited. globals.css
                pulls in Tailwind preflight, which resets ol/ul to list-style:
                none with no padding, so a bare <ol> here renders as five
                unnumbered lines. app/adaptive-test/page.tsx's own
                ValidationErrorList counters the same reset the same way. */}
            <ol style={{
              listStyle: "decimal",
              paddingLeft: "20px",
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "15px",
              color: C.ink,
              lineHeight: 1.6,
            }}>
              <li>Read each question carefully.</li>
              <li>Scroll if you need to see all the answer choices.</li>
              <li>Select your answer, then click Submit at the bottom.</li>
              <li>The test adapts as you go, so you cannot return to a previous question.</li>
              <li>Your progress is not saved unless you sign in.</li>
            </ol>
            <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.6, margin: 0 }}>
              A calculator is available in the top bar.
            </p>
          </div>
          {/* The spec list is an inset panel, so it takes the PAGE ground
              rather than the card's. Card-on-card was legible while the outer
              surface was translucent glass; against a flat white card a
              hairline alone is not enough separation. */}
          <div style={{ background: C.page, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "22px 26px", width: "100%", textAlign: "left", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              ["Starting level", "Proficient difficulty"],
              ["Adjusts", "after every answer"],
              ["Estimated score", "910–990 scale"],
              ["College-ready", "950 or above"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", alignItems: "baseline", fontSize: "14px", gap: "8px" }}>
                <span style={{ color: C.muted, whiteSpace: "nowrap" }}>{label}</span>
                <span style={{ flex: 1, borderBottom: `2px dotted ${C.border}`, marginBottom: "3px" }} />
                <span style={{ color: C.ink, fontWeight: 500, whiteSpace: "nowrap" }}>{value}</span>
              </div>
            ))}
          </div>
          {validationErrors && validationErrors.length > 0 && <ValidationErrorList errors={validationErrors} />}
          <button
            onClick={() => {
              posthog.capture("test_started", { item_count: state.allItems.length });
              start();
            }}
            style={{ width: "100%", padding: "16px", background: C.cta, color: C.ctaInk, border: "none", borderRadius: "8px", fontFamily: "inherit", fontSize: "15px", fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em" }}
          >
            Start Test Session
          </button>
          {/* Signed in, this is the line that tells a student their work is
              being kept; signed out, it is the reassurance that they can take
              the test without an account. Neither is true while the auth check
              is still in flight, so that state renders a blank line of the same
              height rather than flashing the wrong promise. */}
          <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>
            {isAuthenticated === null
              ? " "
              : isAuthenticated
                ? "signed in · your results will save to your dashboard"
                : "no account needed · results shown at the end"}
          </p>
        </div>
      </CatChrome>
    );
  }

  if (state.phase === "active" && state.currentItem) {
    return (
      <CatChrome showCalculator>
        <ItemCard item={state.currentItem} itemNumber={state.responses.length + 1} totalItems={state.maxItems} onAnswer={answer} isAuthenticated={isAuthenticated} />
      </CatChrome>
    );
  }

  if (state.phase === "complete") {
    return (
      <CatChrome>
        <ResultsSummary responses={state.responses} theta={state.theta} onRestart={restart} sessionId={savedSessionId} saveFailed={saveFailed} recommendation={recommendation} />
      </CatChrome>
    );
  }

  return null;
}
