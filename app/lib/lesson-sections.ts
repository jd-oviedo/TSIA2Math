// What a lesson section IS. One definition, used by both surfaces that count or
// show them, so the topic overview's "7 sections" and the lesson outline's
// "7 sections" can never drift apart on the same topic.
//
// The topic overview says "7 sections" beside the guided-notes row. That number
// is derived from content that already exists and needs no new field: every
// authored lesson separates its sections with an h5 heading.
//
// Measured across all 97 topics before this was written, rather than assumed:
// 781 headings, every topic between 4 and 13, median 8, and h5 is the only
// heading level used anywhere in the course. No topic has any content before
// its first heading, so the count is also the number of labelled parts, with
// nothing falling outside them. Re-measured against production before the split
// was built: the same 97 / 781 / 4 / 13 / 8, so the rows the app reads agree
// with the source files these numbers came from.
//
// Counted from the markdown rather than the rendered HTML on purpose. The two
// agree exactly -- 781 either way, zero topics differing -- and counting the
// source means this needs neither the remark pipeline nor a DOM, so it stays a
// pure function that `node --test` can load directly.
//
// STILL NOT ANCHORS. splitLessonSections returns text. It assigns no ids, emits
// no anchors, and knows nothing about where a reader currently is. Per-section
// state and resume-where-you-stopped need scroll observation and a stored
// position, neither of which exists.
//
// Imports nothing, same reason as attempt-sets.ts.

// A heading is an h5 at the very start of a line: five hashes, then a space.
// Anchored per line, so a "#####" inside a sentence is not a heading and neither
// is a deeper level.
const H5 = /^##### /;

// Three or more -, * or _ alone on a line. The authored source puts one of these
// between every pair of sections, so after a split it would otherwise draw a
// stray rule against the bottom edge of a card.
const THEMATIC_BREAK = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;

// An opening or closing code fence, at most three spaces of indent.
const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;

export type LessonSectionSource = {
  // The h5's text, markdown still in it. Eight of the 781 carry inline math.
  heading: string;
  // Everything under that heading, up to the next one.
  body: string;
};

// Walks the notes once and reports each h5's line index.
//
// FENCE- AND $$-AWARE, though nothing in the course needs it yet. A "#####" line
// inside a fenced block or a $$ display-math block is content, not a heading, and
// splitting there would cut a code block or an equation in half. Verified across
// all 97 topics: one topic has a fenced block in its guided notes, 81 use $$, and
// ZERO have a ##### line inside either -- so this guard changes nothing today
// and is here so that authoring one later fails to break the page rather than
// breaking it silently.
function headingLines(lines: string[]): number[] {
  const out: number[] = [];
  let fence: string | null = null;
  let mathBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = FENCE.exec(line);

    if (fence) {
      // A closing fence is the same character, at least as long, nothing after.
      if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length && !fenceMatch[2].trim()) {
        fence = null;
      }
      continue;
    }
    if (fenceMatch) {
      fence = fenceMatch[1];
      continue;
    }

    // Only a bare $$ on its own line opens a math block. "$$x + 1$$" is inline
    // math, which is how this curriculum actually writes it.
    if (line.trim() === '$$') {
      mathBlock = !mathBlock;
      continue;
    }
    if (mathBlock) continue;

    if (H5.test(line)) out.push(i);
  }

  return out;
}

// Trims a section body and drops the authored rule at either end of it, which
// the split has just turned into a rule against a card edge.
//
// A trailing rule is only removed when a blank line sits above it. "text\n---"
// with no blank line is a setext h2, not a thematic break, and dropping the ---
// there would silently demote a heading to a paragraph.
function trimBody(lines: string[]): string {
  let start = 0;
  let end = lines.length;

  while (start < end && !lines[start].trim()) start++;
  while (end > start && !lines[end - 1].trim()) end--;

  if (start < end && THEMATIC_BREAK.test(lines[start])) {
    start++;
    while (start < end && !lines[start].trim()) start++;
  }
  if (
    end - 1 > start &&
    THEMATIC_BREAK.test(lines[end - 1]) &&
    !lines[end - 2].trim()
  ) {
    end--;
    while (end > start && !lines[end - 1].trim()) end--;
  }

  return lines.slice(start, end).join('\n');
}

// Splits guided notes into one entry per authored h5.
//
// Returns an EMPTY ARRAY when it cannot split cleanly, exactly as splitAnswerKey
// does, and the lesson page falls back to rendering the whole blob the way it did
// before sections existed. Two cases reach that: no h5 headings at all, and
// content sitting above the first heading, which would otherwise have to be
// hidden or given a heading nobody authored. Neither occurs in the course today
// -- all 97 topics start on their first heading -- so the fallback is insurance,
// not a live path.
export function splitLessonSections(
  guidedNotes: string | null | undefined
): LessonSectionSource[] {
  if (!guidedNotes) return [];

  const lines = guidedNotes.split('\n');
  const heads = headingLines(lines);
  if (heads.length === 0) return [];

  // Anything above the first heading that is not blank and not a rule.
  const preamble = lines
    .slice(0, heads[0])
    .filter((l) => l.trim() && !THEMATIC_BREAK.test(l));
  if (preamble.length > 0) return [];

  return heads.map((at, i) => ({
    heading: lines[at].slice(6).trim(),
    body: trimBody(lines.slice(at + 1, i + 1 < heads.length ? heads[i + 1] : lines.length)),
  }));
}

// The count on its own, for the topic overview.
//
// Deliberately NOT splitLessonSections(...).length. That returns 0 on notes it
// cannot split, and the overview would then say "0 sections" about a lesson that
// visibly has eight. The count is the honest number in both cases; it is the
// LESSON that degrades to one blob when the split cannot be trusted.
export function lessonSectionCount(guidedNotes: string | null | undefined): number {
  if (!guidedNotes) return 0;
  return headingLines(guidedNotes.split('\n')).length;
}
