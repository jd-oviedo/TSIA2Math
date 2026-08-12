import type { Strand } from '../adaptive-test/type';

// Strand code -> the name a student should be shown.
//
// Client-safe on purpose: types and a frozen object, no Supabase import, so
// this can be pulled into a client component without dragging the admin client
// into the browser bundle.
//
// app/adaptive-test/ResultsSummary.tsx keeps its own STRAND_LABEL rather than
// importing this. That map carries GS and PS aliases for an older set of strand
// codes still present in some saved responses, and untangling which of those
// are live is a separate question from adding a recommendation.
export const STRAND_NAMES: Readonly<Record<Strand, string>> = Object.freeze({
  QR: 'Quantitative Reasoning',
  AR: 'Algebraic Reasoning',
  GR: 'Geometric & Spatial Reasoning',
  PR: 'Probabilistic & Statistical Reasoning',
});

// The display name for a strand code that arrived as a plain string -- from
// curriculum_topics.related_strand, which is text and nullable. Falls back to
// the code itself, then to a neutral noun, so a page can always render
// something it is not embarrassed by.
export function strandName(code: string | null | undefined): string {
  if (!code) return 'this strand';
  return STRAND_NAMES[code as Strand] ?? code;
}
