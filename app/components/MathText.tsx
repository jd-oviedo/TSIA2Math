"use client";

import katex from "katex";

interface MathTextProps {
  text: string;
  className?: string;
}

interface Segment {
  type: "text" | "math";
  content: string;
}

// Escaped currency dollars (\$) must render as a literal "$" but must NOT act as
// math delimiters. We swap them for a private-use sentinel before parsing so the
// $...$ pairing can't grab a currency sign, then restore them at render time.
// Without this, "\$36 ÷ 9 = \$4" mis-pairs and the currency signs get eaten.
const DOLLAR_SENTINEL = "";

const ISOLATED_SYMBOLS: Record<string, string> = {
  "\\approx": "≈",
  "\\times": "×",
  "\\div": "÷",
  "\\leq": "≤",
  "\\geq": "≥",
  "\\neq": "≠",
  "\\Delta": "Δ",
  "\\pi": "π",
};

function replaceIsolatedSymbols(s: string): string {
  return s.replace(/\$(\\\w+)\$/g, (match, cmd) => {
    return ISOLATED_SYMBOLS[cmd] ?? match;
  });
}

function looksLikeMath(content: string): boolean {
  return /[\\^_{}\[\]]|\\frac|\\sqrt|\\times|\\div|\\leq|\\geq|\\neq|\\approx|\\pi|\\Delta|\\infty/.test(content);
}

function parseMathSegments(input: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /\$([^$]+)\$/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: input.slice(lastIndex, match.index) });
    }
    const content = match[1];
    if (looksLikeMath(content)) {
      segments.push({ type: "math", content });
    } else {
  segments.push({ type: "text", content: content });
}
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    segments.push({ type: "text", content: input.slice(lastIndex) });
  }

  return segments;
}

export default function MathText({ text, className }: MathTextProps) {
  // Protect escaped currency dollars from the $...$ pairing, then parse.
  const protectedText = text.replace(/\\\$/g, DOLLAR_SENTINEL);
  const cleaned = replaceIsolatedSymbols(protectedText);
  const parts = parseMathSegments(cleaned);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === "math") {
          try {
            // A sentinel inside a real math span means a literal $ (rare: currency
            // written inside $...$); KaTeX renders \$ as a dollar sign.
            const src = part.content.split(DOLLAR_SENTINEL).join("\\$");
            const html = katex.renderToString(src, {
              throwOnError: false,
              displayMode: false,
            });
            // nowrap keeps an expression from breaking mid-formula (e.g. a lone
            // ")" or "1)?" orphaned on its own line). Nothing more: an
            // inline-block + overflow wrapper puts a scrolling box around
            // KaTeX's oversized \sqrt SVG (width:400em, clipped internally by
            // .hide-tail) and the `auto` scrollbar shows as a stray gray bar
            // under every radical. Plain nowrap avoids that.
            return (
              <span
                key={i}
                style={{ whiteSpace: "nowrap" }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <span key={i}>{part.content.split(DOLLAR_SENTINEL).join("$")}</span>;
          }
        }
        return <span key={i}>{part.content.split(DOLLAR_SENTINEL).join("$")}</span>;
      })}
    </span>
  );
}
