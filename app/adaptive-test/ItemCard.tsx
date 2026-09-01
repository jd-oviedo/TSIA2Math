"use client";

import MathText from "../components/MathText";
import { useEffect, useRef, useState } from "react";
import type { PublicItem, RevealData } from "./type";
import FigureRenderer from "../components/FigureRenderer";
import { C, MOTION } from "./cat-theme";
import { MOTION_CSS, prefersReducedMotion } from "../motion";

interface Props {
  item: PublicItem;
  itemNumber: number;
  totalItems: number;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  isAuthenticated: boolean;
}

const CHOICE_KEYS = ["A", "B", "C", "D"] as const;

// The difficulty badge's role colour. Three tiers, three inks already approved
// for text on this surface: no new value, and nothing here is orange.
const LEVEL_INK: Record<string, string> = {
  Basic: C.muted,
  Proficient: C.blueInk,
  Advanced: C.goldInk,
};

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
  transition: `background ${MOTION.durFast}ms ${MOTION.ease}, border-color ${MOTION.durFast}ms ${MOTION.ease}, color ${MOTION.durFast}ms ${MOTION.ease}`,
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

  // ─── MOTION STATE ──────────────────────────────────────────────────────────
  //
  // `entered` drives the arrival, `leaving` drives the departure, and the two
  // are separate because a question is never both. Everything below is opacity,
  // translateY, width and colour. No scale, no shadow, no gradient.
  //
  // THE ARRIVAL IS NOT INLINE, AND THAT IS THE POINT. It is the shared two-lock
  // system from app/motion.ts -- .um-motion on the wrapper, .um-fade-up on the
  // card and each option, .um-stagger on the option list -- re-fired per
  // question by keying the wrapper on item_id. That buys the keyframes, the
  // nth-child stagger and the reduced-motion guard already written and verified
  // there, rather than a second copy of all three here.
  //
  // It also sidesteps the trap app/motion.ts's header warns about: the hidden
  // state lives only inside a keyframe's `from`, so when the guard removes the
  // animation the content is simply painted, rather than being stranded at
  // opacity 0 for exactly the people who asked for less movement.
  //
  // The DEPARTURE is inline, because it is not an entrance: it has to hold the
  // outgoing question on screen while a timer waits to swap the item beneath
  // it, and a keyframe cannot coordinate with a setTimeout.
  const [leaving, setLeaving] = useState(false);
  // The reveal paints one frame after `revealed`, so the marker glyph and the
  // explanation have a state to transition FROM.
  const [revealShown, setRevealShown] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const [shownLevel, setShownLevel] = useState(item.proficiency_level);
  const pulseRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // One place to schedule, one place to clear. Every timer below paces a visual
  // beat, so a student who clicks Next and immediately unmounts the component
  // (by finishing the test) must not have a callback land afterwards.
  const after = (ms: number, fn: () => void) => {
    const t = setTimeout(fn, prefersReducedMotion() ? 0 : ms);
    timers.current.push(t);
  };
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  // THE ADAPTIVE BEAT. The badge is the only thing on screen that says the test
  // moved, so it gets the longest dwell of any interaction here: fade the old
  // tier out at durFast, swap the text and its role colour while it is
  // invisible, fade the new tier in. Swapping at full opacity would read as a
  // typo correction rather than as the test responding.
  //
  // EVERY setState HERE IS SCHEDULED RATHER THAN SYNCHRONOUS, including the
  // reduced-motion path, which could otherwise be a plain assignment. A
  // synchronous setState in an effect body is a cascading render, and
  // react-hooks/set-state-in-effect flags it; scheduling both branches keeps
  // the two paths the same shape as well as quiet.
  useEffect(() => {
    if (item.proficiency_level === shownLevel) return;
    const next = item.proficiency_level;
    if (prefersReducedMotion()) {
      const t = setTimeout(() => setShownLevel(next), 0);
      return () => clearTimeout(t);
    }
    const out = setTimeout(() => setBadgeVisible(false), 0);
    const swap = setTimeout(() => {
      setShownLevel(next);
      setBadgeVisible(true);
    }, MOTION.durFast);
    return () => { clearTimeout(out); clearTimeout(swap); };
  }, [item.proficiency_level, shownLevel]);

  // THE DOT PULSE, and this is the second of the two places where CSS cannot
  // reach (the first is the cross-fade timing in handleNext).
  //
  // It replaces an inline `@keyframes ecpulse` that animated opacity AND
  // transform: scale(). Scale is not in this surface's vocabulary, and a
  // keyframe defined inline in a component body is a global name that anything
  // else could redefine -- the same hazard app/motion.ts retired `spin` for.
  //
  // Element.animate is script-created, so MOTION_CSS's reduced-motion guard
  // cannot see it. Hence the explicit read, and hence the cleanup: an infinite
  // animation that outlives its element keeps the element alive with it.
  useEffect(() => {
    const el = pulseRef.current;
    if (!el || !revealed || prefersReducedMotion()) return;
    const anim = el.animate(
      [{ opacity: 1 }, { opacity: 0.22 }, { opacity: 1 }],
      { duration: MOTION.pulseDur, iterations: Infinity, easing: MOTION.ease }
    );
    return () => anim.cancel();
  }, [revealed]);

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
      // Next frame, so the explanation grid and the marker glyph animate from
      // their closed state rather than mounting already open.
      after(0, () => setRevealShown(true));
    } catch {
      setRevealError(true);
    } finally {
      setRevealing(false);
    }
  };

  // THE SIGNATURE MOVE. The outgoing question fades and lifts exitTravel out
  // over durBase, and only then does onAnswer swap the item underneath, so the
  // incoming question mounts into an empty frame and fades up from
  // enterTravel. Calling onAnswer immediately is what produced the hard cut
  // this replaces.
  //
  // The progress bar is deliberately NOT part of this: it is the one element
  // that should not blink out and back, so it stays mounted and eases its own
  // width at durSlow while the question changes around it.
  const handleNext = () => {
  if (!selected || !revealData || leaving) return;
  const answer = selected;
  const wasCorrect = revealData.isCorrect;
  setLeaving(true);
  after(MOTION.durBase, () => {
    onAnswer(answer, wasCorrect);
    setSelected(null);
    setRevealed(false);
    setRevealShown(false);
    setRevealData(null);
    setFlagState("idle");
    setFlagCategory("");
    setFlagComment("");
    setLeaving(false);
  });
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
        parts.push(<p key={key++} style={{ whiteSpace: "pre-wrap", marginBottom: "8px", color: C.ink }}>{tableLines.join("\n")}</p>);
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
                  <th key={i} style={{ padding: "8px 14px", textAlign: "left", fontWeight: 600, color: C.ink, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "8px 14px", color: C.muted, borderBottom: `1px solid ${C.border}` }}><MathText text={cell} /></td>
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
        if (line.trim()) parts.push(<p key={key++} style={{ marginBottom: "8px", color: C.ink, lineHeight: 1.65, margin: "0 0 6px" }}><MathText text={line} /></p>);
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
      borderRadius: "8px",
      padding: "15px 20px",
      cursor: revealed ? "default" : "pointer",
      fontFamily: "inherit",
      fontSize: "16px",
      lineHeight: 1.5,
      border: `1px solid ${C.border}`,
      background: C.card,
      color: C.ink,
      // Select is a state swap at durFast; the fade-back on reveal is a thing
      // leaving, at durBase. One curve for both.
      transition: `background ${MOTION.durFast}ms ${MOTION.ease}, border-color ${MOTION.durFast}ms ${MOTION.ease}, opacity ${MOTION.durBase}ms ${MOTION.ease}`,
      // prevent browser from shrinking disabled buttons
      WebkitAppearance: "none",
    };
    if (!revealed) {
      if (selected === key) return { ...base, border: `1px solid ${C.selLine}`, background: C.selBg };
      return base;
    }
    if (key === revealData?.correct_answer) return { ...base, border: `1px solid ${C.correctLine}`, background: C.correctCard };
    if (key === selected) return { ...base, border: `1px solid ${C.incorrectLine}`, background: C.incorrectCard };
    // Unselected options fade back rather than disappear: they are still
    // part of the question the student is reading the explanation about.
    return { ...base, opacity: 0.4 };
  };

  // After reveal the marker stops being a letter and becomes the verdict: a
  // filled circle carrying a white check or cross. The letter has done its job
  // by then -- the student has already chosen -- and the option text still
  // names the choice, so nothing that carries meaning is lost.
  const markerGlyph = (key: string): string => {
    if (!revealed) return key;
    if (key === revealData?.correct_answer) return "\u2713";
    if (key === selected) return "\u2717";
    return key;
  };

  const getLetterStyle = (key: string): React.CSSProperties => {
    if (!revealed) {
      if (selected === key) {
        return { ...LETTER_BASE, background: C.selLine, border: `1.5px solid ${C.selLine}`, color: C.ctaInk };
      }
      return { ...LETTER_BASE, background: "transparent", border: `1.5px solid ${C.border}`, color: C.muted };
    }
    if (key === revealData?.correct_answer) {
      return { ...LETTER_BASE, background: C.correctFill, border: `1.5px solid ${C.correctFill}`, color: C.markerInk };
    }
    if (key === selected) {
      return { ...LETTER_BASE, background: C.incorrectFill, border: `1.5px solid ${C.incorrectFill}`, color: C.markerInk };
    }
    return { ...LETTER_BASE, background: "transparent", border: `1.5px solid ${C.border}`, color: C.muted };
  };

  // Durations collapse to 0 for a visitor who asked for less motion. Read at
  // render rather than held in state: ItemCard only ever mounts in the "active"
  // phase, which is reached by a click, so this never runs during SSR and
  // cannot produce a hydration mismatch.
  const dur = (ms: number) => (prefersReducedMotion() ? 0 : ms);

  return (
    <div style={{ width: "100%", maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
      <style>{MOTION_CSS}</style>

      {/* Progress. OUTSIDE the fading wrapper on purpose: the counter, the bar
          and the difficulty badge are the continuity across a question change,
          so they stay put and animate their own values while the question
          itself cross-fades below them. */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "4px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: C.muted, letterSpacing: "0.04em", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
          {String(itemNumber).padStart(2, "0")} / {String(totalItems).padStart(2, "0")}
        </span>
        <div style={{ flex: 1, height: "4px", background: C.track, borderRadius: "999px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: C.cta, borderRadius: "999px", transition: `width ${dur(MOTION.durSlow)}ms ${MOTION.ease}` }} />
        </div>
        {/* THE ADAPTIVE BEAT. Opacity only, and the text swaps while it is at
            zero, so the tier never appears to be corrected in place.

            The role colour uses the two text-safe brand inks already in the
            palette plus muted, rather than a new three-step ramp: Basic is
            quiet, Proficient is the data blue every other figure on this
            surface uses, and Advanced is gold, which on the teacher surface
            already means "earned". No new hex, and all three are measured on
            the chip. */}
        <span style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase",
          color: LEVEL_INK[shownLevel] ?? C.blueInk, background: C.blueTint,
          border: `1px solid ${C.blueLine}`,
          borderRadius: "999px", padding: "4px 12px", flexShrink: 0,
          opacity: badgeVisible ? 1 : 0,
          transition: `opacity ${dur(MOTION.durFast)}ms ${MOTION.ease}, color ${dur(MOTION.durFast)}ms ${MOTION.ease}`,
        }}>
          {shownLevel}
        </span>
      </div>

      {/* THE CROSS-FADE WRAPPER.

          key={item.item_id} is what makes the arrival repeat. A CSS animation
          fires once per element; without the key React would reuse these nodes
          across questions and only the very first question would animate in.
          Keying remounts the subtree, so every question arrives the same way.

          .um-motion is lock one of app/motion.ts's two-lock opt-in. Nothing
          inside animates without it, and nothing outside this div is affected
          by it. */}
      <div
        key={item.item_id}
        className="um-motion"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          opacity: leaving ? 0 : 1,
          transform: leaving ? `translateY(-${MOTION.exitTravel}px)` : "none",
          transition: `opacity ${dur(MOTION.durBase)}ms ${MOTION.ease}, transform ${dur(MOTION.durBase)}ms ${MOTION.ease}`,
        }}
      >

      {/* Question card */}
      <div className="um-fade-up" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "28px 30px" }}>
  {/* Section label, so gold rather than the old blue accent. */}
  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.goldInk, marginBottom: "14px" }}>
    {item.category}: {item.objective_text}
  </div>
  {/* Serif dropped: prose falls to Nunito, KaTeX keeps its own faces, so
      math is the only serif left. See cat-theme.ts. */}
  <div style={{ fontSize: "20px", fontWeight: 500, color: C.ink, lineHeight: 1.65 }}>
    {renderQuestionText(item.question_text)}
  </div>
  {/* FIGURES FOLLOW THE CAT PALETTE, and this wrapper is the whole mechanism.
      FigureRenderer is shared with the curriculum and worksheet trees, so it
      draws from --ec-ink / --ec-line / --ec-accent / --ec-surface2 and cannot
      be rewritten for one surface. Left alone it would paint a Deep Navy
      #1A1F2E figure with a #0F69BA data mark on this card in light, and a
      blue-black #1C2438 figure ground on a neutral #17171B card in dark: a
      visibly bluer patch inside an otherwise warm-neutral card.
      Redeclaring the four properties it reads on a wrapper is enough, because
      custom properties inherit downward. Scoped to this div, so Header, Footer
      and the Calculator -- which are also inside .um-cat and also read --ec-*
      -- are untouched, and so is every other surface FigureRenderer serves. */}
  <div style={{
    ["--ec-ink" as string]: C.ink,
    ["--ec-line" as string]: C.border,
    ["--ec-accent" as string]: C.blue,
    ["--ec-surface2" as string]: C.page,
  } as React.CSSProperties}>
    <FigureRenderer type={item.figure_type} props={item.figure_props} />
  </div>
</div>

      {/* Choices. .um-stagger sets --um-delay per child and .um-fade-up reads
          it, so A through D arrive in sequence at the 70ms step .um-cat
          re-paces the shared token to. */}
      <div className="um-stagger" style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        {CHOICE_KEYS.filter((k) => k in item.answer_choices).map((key) => (
          <button
            key={key}
            className="um-fade-up"
            onClick={() => handleSelect(key)}
            disabled={revealed}
            style={getChoiceStyle(key)}
          >
            <span style={getLetterStyle(key)}>
              {/* Only the two markers that actually change get the fade. The
                  other two still read A..D, and blinking them would animate a
                  glyph that did not move. */}
              <span style={{
                opacity: revealed && (key === revealData?.correct_answer || key === selected) && !revealShown ? 0 : 1,
                transition: `opacity ${dur(MOTION.durBase)}ms ${MOTION.ease}`,
              }}>
                {markerGlyph(key)}
              </span>
            </span>
            <span style={{ flex: 1, color: C.ink, fontSize: "16px", fontWeight: 400 }}>
  <MathText text={item.answer_choices[key]} />
</span>
          </button>
        ))}
      </div>

      {/* Explanation.

          THE PANEL CARRIES THE VERDICT. It used to be one orange box with one
          orange eyebrow for both outcomes, which made "Nice work" and "Where
          your thinking broke down" look identical until you read them. Panel
          wash, border and eyebrow now all come from the state, so the answer is
          legible before the words are.

          The eyebrow is the one place the state INK is used at label size, and
          it is why the correct green is #4E7A51 rather than something lighter:
          it has to hold text on the panel, not just draw a border. */}
      {revealed && revealData && (
        <div style={{
          // 0fr -> 1fr, which is the only way to transition to a height the
          // content decides. The inner div MUST carry min-height: 0 and
          // overflow: hidden: a grid item's default min-height is auto, which
          // refuses to shrink below its content and would make the closed state
          // full height, so the row would have nothing to open from.
          display: "grid",
          gridTemplateRows: revealShown ? "1fr" : "0fr",
          transition: `grid-template-rows ${dur(MOTION.durSlow)}ms ${MOTION.ease}`,
        }}>
        <div style={{ minHeight: 0, overflow: "hidden" }}>
        <div style={{
          background: isCorrect ? C.correctPanel : C.incorrectPanel,
          border: `1px solid ${isCorrect ? C.correctLine : C.incorrectLine}`,
          borderRadius: "8px",
          padding: "20px 24px",
        }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: isCorrect ? C.correctInk : C.incorrectInk, marginBottom: "10px" }}>
            {isCorrect ? "Nice work" : "Where your thinking broke down"}
          </p>

          {revealData.explanation !== null ? (
  <>
    <div style={{ fontSize: "15px", color: C.ink, lineHeight: 1.7, margin: 0 }}>
  {renderQuestionText(revealData.explanation)}
</div>
    {selected && !isCorrect && revealData.distractor_note && (
      <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.6, fontStyle: "italic", marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${C.border}` }}>
  {renderQuestionText(revealData.distractor_note)}
</div>
    )}
  {isAuthenticated && (
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: `1px solid ${C.border}` }}>
          {flagState === "idle" && (
            <button
              onClick={() => setFlagState("open")}
              style={{ background: "none", border: "none", padding: 0, fontSize: "12px", color: C.ctlInk, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}
            >
              Flag an issue with this question
            </button>
          )}
          {flagState === "open" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <select
                value={flagCategory}
                onChange={(e) => setFlagCategory(e.target.value)}
                style={{ fontSize: "13px", padding: "8px 10px", borderRadius: "8px", border: `1px solid ${C.ctlLine}`, background: C.card, color: flagCategory ? C.ink : C.muted, fontFamily: "inherit" }}
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
                style={{ fontSize: "13px", padding: "8px 10px", borderRadius: "8px", border: `1px solid ${C.ctlLine}`, background: C.card, color: C.ink, fontFamily: "inherit", resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleFlagSubmit}
                  disabled={!flagCategory}
                  style={{ padding: "8px 16px", background: flagCategory ? C.cta : C.disabled, color: flagCategory ? C.ctaInk : C.disabledInk, border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: flagCategory ? "pointer" : "not-allowed", fontFamily: "inherit" }}
                >
                  Submit
                </button>
                <button
                  onClick={() => { setFlagState("idle"); setFlagCategory(""); setFlagComment(""); }}
                  style={{ padding: "8px 16px", background: "none", border: `1px solid ${C.ctlLine}`, borderRadius: "8px", fontSize: "13px", color: C.ctlInk, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {flagState === "submitting" && (
            <p style={{ fontSize: "12px", color: C.muted, margin: 0 }}>Submitting...</p>
          )}
          {flagState === "done" && (
            <p style={{ fontSize: "12px", color: C.muted, margin: 0 }}>Thanks for the feedback.</p>
          )}
          {flagState === "error" && (
            <p style={{ fontSize: "12px", color: C.incorrectInk, margin: 0 }}>Couldn&rsquo;t submit -- try again.</p>
          )}
        </div>
      )}
    </>
) : (
  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    <p style={{ fontSize: "15px", color: C.ink, lineHeight: 1.7, margin: 0 }}>
      Sign in to see why this answer is correct and where the other choices go wrong.
    </p>
    <button
      onClick={() => { window.location.href = '/login' }}
      // NEUTRAL, NOT THE CTA. A Google sign-in button must not read as the
      // orange primary action: the primary action on a reveal is "Next
      // question", and an orange sign-in would outrank it. The border is what
      // marks this as a control, so it is the .45 line rather than the
      // decorative hairline. Full Google-brand styling is a later tidy.
      style={{
        alignSelf: "flex-start",
        padding: "10px 20px",
        background: C.signinBg,
        color: C.signinInk,
        border: `1px solid ${C.signinLine}`,
        borderRadius: "8px",
        fontFamily: "inherit",
        fontSize: "14px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Sign in with Google
    </button>
  </div>
)}
        </div>
        </div>
        </div>
      )}

      {revealError && (
        <div style={{ background: C.incorrectCard, border: `1px solid ${C.incorrectLine}`, borderRadius: "8px", padding: "16px 20px" }}>
          <p style={{ fontSize: "13px", color: C.incorrectInk, margin: 0 }}>
            Couldn&rsquo;t check that answer. Check your connection and try Submit again.
          </p>
        </div>
      )}

      {/* Adaptive signal */}
      {revealed && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Driven by Element.animate in the effect above, NOT by a keyframe.
              The rule it replaces animated transform: scale(), which is not in
              this surface's vocabulary, and declared `ecpulse` inline in the
              component body -- a global keyframe name anything else on the page
              could have redefined. */}
          <div ref={pulseRef} style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.cta, flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: C.muted }}>Adjusting to your level…</span>
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
              background: selected && !revealing ? C.cta : C.disabled,
              color: selected && !revealing ? C.ctaInk : C.disabledInk,
              border: "none",
              borderRadius: "8px",
              fontFamily: "inherit",
              fontSize: "15px",
              fontWeight: 700,
              cursor: selected && !revealing ? "pointer" : "not-allowed",
              transition: `background ${MOTION.durFast}ms ${MOTION.ease}, color ${MOTION.durFast}ms ${MOTION.ease}`,
            }}
          >
            {revealing ? "Checking…" : "Submit"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              padding: "13px 28px",
              background: C.cta,
              color: C.ctaInk,
              border: "none",
              borderRadius: "8px",
              fontFamily: "inherit",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              transition: `background ${MOTION.durFast}ms ${MOTION.ease}, color ${MOTION.durFast}ms ${MOTION.ease}`,
            }}
          >
            Next question →
          </button>
        )}
      </div>

      </div>{/* end cross-fade wrapper */}
    </div>
  );
}