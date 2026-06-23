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

function parseMathSegments(input: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /\$([^$]+)\$/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: input.slice(lastIndex, match.index) });
    }
    segments.push({ type: "math", content: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < input.length) {
    segments.push({ type: "text", content: input.slice(lastIndex) });
  }
  return segments;
}

export default function MathText({ text, className }: MathTextProps) {
  // Unescape \$ (currency) so it renders as plain $ not LaTeX
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