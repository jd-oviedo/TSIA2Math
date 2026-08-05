"use client";

import { useEffect, useRef, useState } from "react";

const SCALE = 0.75;

const PANEL_BG = "#0F1E35";
const DISPLAY_BG = "#EDE7D6";
const DISPLAY_TEXT = "#0F1E35";
const ORANGE = "#f0a33e";
const ORANGE_SHADOW = "#c07d24";
const BLUE = "#6E9DC8";
const BLUE_SHADOW = "#4f79a0";
const CREAM = "#F2EDDF";
const CREAM_SHADOW = "#c7bfa8";
const TEAL = "#0d5c63";
const TEAL_SHADOW = "#083f44";

type KeyVariant = "orange" | "blue" | "cream" | "teal";

const VARIANT_STYLES: Record<KeyVariant, { bg: string; shadow: string; text: string }> = {
  orange: { bg: ORANGE, shadow: ORANGE_SHADOW, text: "#fff" },
  blue: { bg: BLUE, shadow: BLUE_SHADOW, text: "#fff" },
  cream: { bg: CREAM, shadow: CREAM_SHADOW, text: DISPLAY_TEXT },
  teal: { bg: TEAL, shadow: TEAL_SHADOW, text: "#fff" },
};

function formatResult(value: number): string {
  if (!isFinite(value)) return "Error";
  if (Number.isInteger(value)) return String(value);
  return String(parseFloat(value.toPrecision(12)));
}

function CalcKey({
  label,
  onClick,
  variant,
  fontSize = 20,
  gridColumn,
  gridRow,
  ariaLabel,
}: {
  label: string;
  onClick: () => void;
  variant: KeyVariant;
  fontSize?: number;
  gridColumn?: string;
  gridRow?: string;
  ariaLabel?: string;
}) {
  const [pressed, setPressed] = useState(false);
  const v = VARIANT_STYLES[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      aria-label={ariaLabel ?? label}
      style={{
        height: `${46 * SCALE}px`,
        border: "none",
        borderRadius: `${12 * SCALE}px`,
        fontFamily: "inherit",
        fontWeight: 600,
        fontSize: `${fontSize * SCALE}px`,
        color: v.text,
        background: v.bg,
        boxShadow: pressed ? `0 0 0 ${v.shadow}` : `0 ${3 * SCALE}px 0 ${v.shadow}`,
        transform: pressed ? `translateY(${3 * SCALE}px)` : "translateY(0)",
        cursor: "pointer",
        gridColumn,
        gridRow,
        transition: "transform 0.05s ease",
      }}
    >
      {label}
    </button>
  );
}

function CalculatorPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState(true);
  const [memory, setMemory] = useState(0);
  const [justRecalled, setJustRecalled] = useState(false);
  const [closeHover, setCloseHover] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [dragPos, setDragPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      setDragPos({
        left: drag.left + (e.clientX - drag.x),
        top: drag.top + (e.clientY - drag.y),
      });
    };
    const onMouseUp = () => {
      dragRef.current = null;
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleDragStart = (e: React.MouseEvent) => {
    const node = panelRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    dragRef.current = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top };
    document.body.style.userSelect = "none";
    e.preventDefault();
  };

  const compute = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b === 0 ? NaN : a / b;
      default: return b;
    }
  };

  const inputDigit = (digit: string) => {
    setJustRecalled(false);
    if (overwrite) {
      setDisplay(digit === "." ? "0." : digit);
      setOverwrite(false);
      return;
    }
    if (digit === "." && display.includes(".")) return;
    setDisplay(display + digit);
  };

  const clearAll = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setOverwrite(true);
    setJustRecalled(false);
  };

  const applyOperator = (nextOperator: string) => {
    setJustRecalled(false);
    const inputValue = parseFloat(display);
    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const result = compute(previousValue, inputValue, operator);
      setPreviousValue(result);
      setDisplay(formatResult(result));
    }
    setOperator(nextOperator);
    setOverwrite(true);
  };

  const equals = () => {
    setJustRecalled(false);
    if (operator === null || previousValue === null) return;
    const inputValue = parseFloat(display);
    const result = compute(previousValue, inputValue, operator);
    setDisplay(formatResult(result));
    setPreviousValue(null);
    setOperator(null);
    setOverwrite(true);
  };

  const percent = () => {
    setJustRecalled(false);
    const inputValue = parseFloat(display);
    const result = previousValue !== null ? (previousValue * inputValue) / 100 : inputValue / 100;
    setDisplay(formatResult(result));
    setOverwrite(true);
  };

  const sqrt = () => {
    setJustRecalled(false);
    const inputValue = parseFloat(display);
    if (inputValue < 0) {
      setDisplay("Error");
      setOverwrite(true);
      return;
    }
    setDisplay(formatResult(Math.sqrt(inputValue)));
    setOverwrite(true);
  };

  const memoryRecallOrClear = () => {
    if (justRecalled) {
      setMemory(0);
      setJustRecalled(false);
      return;
    }
    setDisplay(formatResult(memory));
    setOverwrite(true);
    setJustRecalled(true);
  };

  const memoryAdd = (sign: 1 | -1) => {
    setJustRecalled(false);
    setMemory(memory + sign * parseFloat(display));
    setOverwrite(true);
  };

  const closeIdleBg = "transparent";
  const closeHoverBg = "rgba(255,255,255,0.1)";

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Calculator"
      style={{
        position: "fixed",
        top: dragPos ? `${dragPos.top}px` : "72px",
        left: dragPos ? `${dragPos.left}px` : undefined,
        right: dragPos ? "auto" : "16px",
        width: `${276 * SCALE}px`,
        background: PANEL_BG,
        borderRadius: `${22 * SCALE}px`,
        boxShadow: "0 24px 60px rgba(15,30,53,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset",
        padding: `${14 * SCALE}px`,
        zIndex: 100,
        userSelect: "none",
        display: open ? "block" : "none",
      }}
    >
      <div
        onMouseDown={handleDragStart}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${2 * SCALE}px ${4 * SCALE}px ${12 * SCALE}px`,
          cursor: "grab",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: `${8 * SCALE}px` }}>
          <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontStyle: "italic", fontSize: `${14 * SCALE}px`, letterSpacing: "-0.4px" }}>
            <span style={{ color: ORANGE }}>μnpack</span>
            <span style={{ color: BLUE }}>math</span>
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: `${11 * SCALE}px`, letterSpacing: "1px", color: "rgba(255,255,255,0.45)" }}>
            CALC
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseEnter={() => setCloseHover(true)}
          onMouseLeave={() => setCloseHover(false)}
          aria-label="Close calculator"
          title="Close"
          style={{
            width: `${24 * SCALE}px`,
            height: `${24 * SCALE}px`,
            border: "none",
            background: closeHover ? closeHoverBg : closeIdleBg,
            color: closeHover ? "#fff" : "rgba(255,255,255,0.6)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: `${6 * SCALE}px`,
            fontSize: `${16 * SCALE}px`,
            lineHeight: 1,
            transition: "background 0.15s ease",
          }}
        >
          &#10005;
        </button>
      </div>

      <div
        style={{
          background: DISPLAY_BG,
          borderRadius: `${12 * SCALE}px`,
          padding: `${14 * SCALE}px ${16 * SCALE}px`,
          marginBottom: `${14 * SCALE}px`,
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            fontSize: `${32 * SCALE}px`,
            color: DISPLAY_TEXT,
            textAlign: "right",
            letterSpacing: "1px",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          {display}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: `${9 * SCALE}px` }}>
        <CalcKey label="%" onClick={percent} variant="blue" fontSize={17} />
        <CalcKey label="&#8730;" onClick={sqrt} variant="blue" fontSize={17} ariaLabel="Square root" />
        <div />
        <CalcKey label="&#247;" onClick={() => applyOperator("/")} variant="orange" fontSize={22} ariaLabel="Divide" />

        <CalcKey label="MRC" onClick={memoryRecallOrClear} variant="blue" fontSize={14} ariaLabel="Memory recall or clear" />
        <CalcKey label="M&#8722;" onClick={() => memoryAdd(-1)} variant="blue" fontSize={15} ariaLabel="Memory subtract" />
        <CalcKey label="M+" onClick={() => memoryAdd(1)} variant="blue" fontSize={15} ariaLabel="Memory add" />
        <CalcKey label="&#215;" onClick={() => applyOperator("*")} variant="orange" fontSize={22} ariaLabel="Multiply" />

        <CalcKey label="7" onClick={() => inputDigit("7")} variant="cream" />
        <CalcKey label="8" onClick={() => inputDigit("8")} variant="cream" />
        <CalcKey label="9" onClick={() => inputDigit("9")} variant="cream" />
        <CalcKey label="&#8722;" onClick={() => applyOperator("-")} variant="orange" fontSize={24} ariaLabel="Subtract" />

        <CalcKey label="4" onClick={() => inputDigit("4")} variant="cream" />
        <CalcKey label="5" onClick={() => inputDigit("5")} variant="cream" />
        <CalcKey label="6" onClick={() => inputDigit("6")} variant="cream" />
        <CalcKey label="+" onClick={() => applyOperator("+")} variant="orange" fontSize={26} ariaLabel="Add" />

        <CalcKey label="1" onClick={() => inputDigit("1")} variant="cream" />
        <CalcKey label="2" onClick={() => inputDigit("2")} variant="cream" />
        <CalcKey label="3" onClick={() => inputDigit("3")} variant="cream" />
        <CalcKey
          label="="
          onClick={equals}
          variant="orange"
          fontSize={30}
          gridColumn="4 / 5"
          gridRow="5 / span 2"
          ariaLabel="Equals"
        />

        <CalcKey label="ON/C" onClick={clearAll} variant="teal" fontSize={14} ariaLabel="Clear" />
        <CalcKey label="0" onClick={() => inputDigit("0")} variant="cream" />
        <CalcKey label="." onClick={() => inputDigit(".")} variant="cream" ariaLabel="Decimal point" />
      </div>
    </div>
  );
}

function CalculatorButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  const idleBg = "rgba(255,255,255,0.18)";
  const hoverBg = "rgba(255,255,255,0.32)";
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={open ? "Close calculator" : "Open calculator"}
      aria-expanded={open}
      title="Calculator"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        border: "1px solid var(--ec-line)",
        background: hover || open ? hoverBg : idleBg,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: "var(--ec-ink-muted)",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.15s ease",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
        <line x1="8" y1="6.5" x2="16" y2="6.5" />
        <circle cx="8.5" cy="11.5" r="0.4" />
        <circle cx="12" cy="11.5" r="0.4" />
        <circle cx="15.5" cy="11.5" r="0.4" />
        <circle cx="8.5" cy="15" r="0.4" />
        <circle cx="12" cy="15" r="0.4" />
        <circle cx="15.5" cy="15" r="0.4" />
        <circle cx="8.5" cy="18.5" r="0.4" />
        <circle cx="12" cy="18.5" r="0.4" />
        <circle cx="15.5" cy="18.5" r="0.4" />
      </svg>
    </button>
  );
}

export function CalculatorToggle() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <CalculatorButton open={open} onClick={() => setOpen((o) => !o)} />
      <CalculatorPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
