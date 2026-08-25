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

// Strand code -> the tint that stands for it.
//
// ONE HOME, AND THIS IS IT. These four hexes used to be restated in seven
// places: the printed sheet, the worksheet chrome, the teacher dashboard, the
// student detail page, both demo pages and /teacher/inactive. Fifty-three
// literals, all of them agreeing today, none of them obliged to. The chrome's
// strand chip and the printed sheet's strand chip are the same colour by
// coincidence rather than by construction, and a chip that disagrees with the
// paper it previews is the failure that duplication was going to produce.
//
// It lives here rather than in a theme module because a tint is the same kind
// of fact as a name: keyed by the strand code, needed on both the teacher side
// and the printed side, and belonging to no single route's palette. The theme
// modules emit CSS custom properties for one route family each; these are
// inline style props on data-driven elements, which is a different mechanism.
//
// Fill only. Deep Midnight on top measures 12.38 to 12.95 on all four, which is
// why they can be a background rather than an ink, on screen and on paper.
export const STRAND_TINT: Readonly<Record<Strand, string>> = Object.freeze({
  QR: '#B5D4F4',
  AR: '#9FE1CB',
  GR: '#FAC775',
  PR: '#CECBF6',
});

// Sky Blue, so an unresolved strand still reads as a labelled strand rather
// than as a greyed-out one.
//
// THIS IS NOT THE ONLY FALLBACK IN THE APP AND IT IS NOT MEANT TO BE. The
// dashboard, the student detail page and the demo fall back to #D3D1C7, which
// is also their generic border grey. The two say opposite things about what an
// unresolved strand means, and reconciling them is a visual change to the
// dashboard rather than a refactor, so it was deliberately left alone. Only the
// two worksheet copies, which already agreed, are centralised here.
export const STRAND_FALLBACK = '#87CEEB';

/**
 * The tint for a strand code that arrived as a plain string.
 *
 * The same shape as strandName above, for the same reason: related_strand is
 * text and nullable, so a caller can always get a colour it is not embarrassed
 * by. Callers that resolve a strand some other way -- from a topic id prefix,
 * say -- read STRAND_TINT directly instead.
 */
export function strandTint(code: string | null | undefined): string {
  return STRAND_TINT[(code ?? '').trim().toUpperCase() as Strand] ?? STRAND_FALLBACK;
}
