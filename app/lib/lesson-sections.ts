// How many sections a lesson's guided notes are made of.
//
// The topic overview says "7 sections" beside the guided-notes row. That number
// is derived from content that already exists and needs no new field: every
// authored lesson separates its sections with an h5 heading.
//
// Measured across all 97 topics before this was written, rather than assumed:
// 781 headings, every topic between 4 and 13, median 8, and h5 is the only
// heading level used anywhere in the course. No topic has any content before
// its first heading, so the count is also the number of labelled parts, with
// nothing falling outside them.
//
// Counted from the markdown rather than the rendered HTML on purpose. The two
// agree exactly -- 781 either way, zero topics differing -- and counting the
// source means this needs neither the remark pipeline nor a DOM, so it stays a
// pure function that `node --test` can load directly.
//
// Deliberately NOT a section split. It returns a count and nothing else. Anchors,
// per-section state and resume-where-you-stopped all need structure this does not
// build, and the overview does not use them.
//
// Imports nothing, same reason as attempt-sets.ts.

// A heading is an h5 at the very start of a line: five hashes, then a space.
// Anchored per line, so a "#####" inside a sentence is not a heading and neither
// is a deeper level.
const H5_LINE = /^##### /gm;

export function lessonSectionCount(guidedNotes: string | null | undefined): number {
  if (!guidedNotes) return 0;
  return (guidedNotes.match(H5_LINE) ?? []).length;
}
