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

// Only treat $...$ as math if content contains LaTeX indicators
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
      // Not real math — render as plain text with the $ delimiters restored
      segments.push({ type: "text", content: `$${content}$` });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    segments.push({ type: "text", content: input.slice(lastIndex) });
  }

  return segments;
}

export default function MathText({ text, className }: MathTextProps) {
  // Normalize \$ to $ so currency renders as plain text
  const cleaned = text.replace(/\\\$/g, "$");
  const parts = parseMathSegments(cleaned);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === "math") {
          try {
            const html = katex.renderToString(part.content, {
              throwOnError: false,
              displayMode: false,
            });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch {
            return <span key={i}>{part.content}</span>;
          }
        }
        return <span key={i}>{part.content}</span>;
      })}
    </span>
  );
}