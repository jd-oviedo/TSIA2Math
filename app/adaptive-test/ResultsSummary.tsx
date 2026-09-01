"use client";

import { useEffect, useState } from "react";
import type { Response } from "./type";
// Type-only: app/lib/recommendation.ts imports the service-role Supabase
// client, and `import type` is erased before it can follow anything into this
// client bundle.
import type { Recommendation } from "../lib/recommendation";
import { TSIA2_PASSING, thetaToScore, buildCategoryBreakdown } from "./engine";
import { C, FONT_BODY, FONT_HEADING, MOTION } from "./cat-theme";
import { prefersReducedMotion } from "../motion";

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
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: "8px",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}>
      <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.goldInk, margin: 0 }}>
        Start here
      </p>

      <p style={{ fontSize: "14px", lineHeight: 1.6, color: C.muted, margin: 0 }}>
        {strandLabel} was your {standing} strand, {pct}% across {attempted}{" "}
        {attempted === 1 ? "question" : "questions"}.
      </p>

      <p style={{ fontSize: "17px", fontWeight: 600, color: C.ink, margin: 0 }}>
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
          background: C.cta,
          color: C.ctaInk,
          borderRadius: "8px",
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

  // ─── THE SCORE COUNTS UP ────────────────────────────────────────────────────
  //
  // requestAnimationFrame rather than a CSS transition, because the thing being
  // animated is the TEXT CONTENT of an element and no CSS property interpolates
  // that. Rounded on every frame, so the student never sees a fraction of a
  // scale point.
  //
  // FROM ZERO, not from the 910 scale floor. Counting 910 to 947 moves the last
  // two digits and reads as a glitch; counting from zero reads as a total being
  // tallied, which is what it is. The intermediate values are not offered as
  // scores and are on screen for under a second.
  //
  // Cubic ease-out, matching the shape of MOTION.ease. Reduced motion lands on
  // the final value immediately, with no frames in between.
  const [shownScore, setShownScore] = useState(() => (prefersReducedMotion() ? finalScore : 0));
  useEffect(() => {
    // Scheduled, not synchronous: a plain setState in an effect body is a
    // cascading render (react-hooks/set-state-in-effect). The initial state
    // above already holds finalScore under reduced motion, so this only has to
    // catch a finalScore that changes after mount.
    if (prefersReducedMotion()) {
      const t = setTimeout(() => setShownScore(finalScore), 0);
      return () => clearTimeout(t);
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / MOTION.scoreCountDur);
      setShownScore(Math.round(finalScore * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finalScore]);

  // The category bars grow from zero once, on a light stagger. Scheduled rather
  // than set synchronously so the width has a frame at 0 to transition from.
  const [barsIn, setBarsIn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBarsIn(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: "620px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "40px" }}>

      {/* Score hero */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        // Option A. Was 44px 28px 36px around an 88px score with a 16px gap
        // under the label, which left the number floating in the middle of a
        // tall card rather than owning it. Tighter frame, bigger number: the
        // card gets shorter while the score reads larger.
        padding: "32px 28px 28px",
        textAlign: "center",
      }}>
        {/* 4px, not 16px. The label and the number are one unit -- the label
            names the number directly beneath it -- and a 16px gap read as two
            separate things stacked up. */}
        <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.goldInk, marginBottom: "4px" }}>
          Estimated TSIA2 Score
        </p>
        <p style={{
          fontSize: "112px",
          fontWeight: 800,
          // Below 1 so the extra size does not buy back the height just saved.
          // Digits have no descenders, so this crops empty space, not glyphs.
          lineHeight: 0.95,
          color: C.ink,
          marginBottom: "10px",
          letterSpacing: "-0.04em",
          fontFamily: FONT_BODY,
        }}>
          {shownScore}
        </p>
        {/* The fail branch was --ec-orange, which is orange carrying text. Pass
            keeps a state colour because "College Ready" IS a verdict; the fail
            branch takes plain ink so it reads as a status, not an alarm. */}
        <p style={{ fontSize: "15px", fontWeight: 600, color: passed ? C.correctInk : C.ink, marginBottom: "10px" }}>
          {passed ? "College Ready" : "Keep Practicing"}
        </p>
        <p style={{ fontSize: "11px", color: C.muted }}>
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
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}>
          <p style={{ fontSize: "13px", color: C.muted, margin: 0 }}>
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
                background: C.signinBg,
                color: C.signinInk,
                border: `1px solid ${C.signinLine}`,
                borderRadius: "8px",
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
                background: C.signinBg,
                color: C.signinInk,
                border: `1px solid ${C.signinLine}`,
                borderRadius: "8px",
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
                background: C.disabled,
                color: C.disabledInk,
                borderRadius: "8px",
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
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            padding: "20px 14px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "26px", fontWeight: 800, color: C.blueInk, marginBottom: "4px", letterSpacing: "-0.02em" }}>{value}</p>
            <p style={{ fontSize: "11px", color: C.muted, letterSpacing: "0.04em" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Strand breakdown */}
      {breakdown.length > 0 && (
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
          padding: "26px 24px",
        }}>
          <h2 style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.goldInk, marginBottom: "22px", fontFamily: FONT_HEADING }}>
            Category Breakdown
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {breakdown.map(({ strand, correct, total, pct }, i) => (
              <div key={strand}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: C.ink }}>
                    {STRAND_LABEL[strand] ?? strand}
                  </span>
                  <span style={{ fontSize: "12px", color: C.blueInk, fontVariantNumeric: "tabular-nums" }}>
                    {correct}/{total} · {pct}%
                  </span>
                </div>
                <div style={{ width: "100%", height: "4px", background: C.track, borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: barsIn ? `${pct}%` : "0%",
                    // Orange stays here: this is a FILL, which is the role
                    // the brand orange is for. Only the text uses ran out.
                    background: pct >= 70 ? C.correctFill : pct >= 50 ? C.blue : C.cta,
                    borderRadius: "999px",
                    // Width only. A bar that grows is the one animation on this
                    // card that carries information: the length IS the value.
                    transition: prefersReducedMotion()
                      ? "none"
                      : `width ${MOTION.durSlow}ms ${MOTION.ease}`,
                    transitionDelay: prefersReducedMotion() ? "0ms" : `${i * 70}ms`,
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
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "26px 24px",
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
          <h2 style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.goldInk, margin: 0, fontFamily: FONT_HEADING }}>
            Response History
          </h2>
          <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: C.ctlInk }}>
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
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["#", "Level", "Answer", "Result", "Score"].map((h, i) => (
                  <th key={h} style={{
                    paddingBottom: "10px",
                    textAlign: i === 4 ? "right" : "left",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: C.muted,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((r, i) => (
                <tr key={r.item.item_id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "11px 0", color: C.muted, fontSize: "13px", width: "32px" }}>{i + 1}</td>
                  <td style={{ padding: "11px 12px 11px 0" }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px",
                      background: C.blueTint, color: C.blueInk,
                      // WAS A HARDCODED rgba(15,105,186,0.15), which is the
                      // LIGHT --ec-accent baked in at 15%. It did not follow
                      // the theme, so this chip kept a pale blue edge on a dark
                      // page. Themed now, like everything else here.
                      border: `1px solid ${C.blueLine}`,
                    }}>
                      {r.item.proficiency_level[0]}
                    </span>
                  </td>
                  <td style={{ padding: "11px 12px 11px 0", fontWeight: 600, color: C.ink, fontSize: "13px" }}>{r.selectedAnswer}</td>
                  <td style={{ padding: "11px 12px 11px 0", fontSize: "14px" }}>
                    {r.isCorrect
                      ? <span style={{ color: C.correctInk, fontWeight: 700 }}>✓</span>
                      : <span style={{ color: C.incorrectInk, fontWeight: 700 }}>✗</span>
                    }
                  </td>
                  <td style={{ padding: "11px 0", textAlign: "right", fontSize: "13px", fontWeight: 600, color: C.blueInk, fontVariantNumeric: "tabular-nums" }}>
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
          background: C.cta,
          color: C.ctaInk,
          border: "none",
          borderRadius: "8px",
          fontFamily: "inherit",
          fontSize: "15px",
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: "-0.01em",
        }}
      >
        Take Another Test
      </button>

    </div>
  );
}
