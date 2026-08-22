// The six unit titles.
//
// A constant rather than a column, decided on the data. Measured in production
// 2026-08-21: curriculum_topics carries topic_name and NO unit-name column, and
// there is no units table at all. Six fixed values with no per-course variation
// do not need a schema change to hold them, and a constant costs no query on a
// page that already makes several.
//
// BARE TITLES, NOT PREFIXED. Callers compose "Unit 0" and the title themselves,
// because the two surfaces that want them lay them out differently: the syllabus
// sets the number and the title as separate typographic elements, and the
// worksheet builder wants one string in a <select>. A prefixed constant would
// force one of them to strip a prefix back off.
//
// THE TEACHER MAP IS NOT POINTED AT THIS YET, deliberately.
// app/teacher/worksheets/new/WorksheetBuilder.tsx:12-19 holds its own UNIT_NAMES
// with different values, and it disagrees with these on five of six. Migrating it
// is one import and one line, but it would silently rewrite teacher-visible copy,
// so it is Juan's call and its own change. The disagreements are recorded in the
// PR description rather than resolved here.
//
// Imports nothing, so `node --test` can load it directly. Same discipline as
// capabilities.ts and products.ts, and for the same reason.

// ─── EVERY NUMBER IN THE CLAUDE DESIGN IMPORT IS SAMPLE DATA ─────────────────
//
// Recorded 2026-08-22 so nobody chases a figure that was never real. The import
// `TSI Student Course Experience.dc.html` is the source for the visual redesign,
// and it renders a syllabus with unit titles, topic counts and hour totals. They
// were invented to make the mockup look plausible. Read against production the
// same day:
//
//   unit  mockup title              mockup  real   mockup hrs  real hrs
//   0     Foundations and review     14     14      about 9      10.4
//   1     Quantitative reasoning     18     15      about 12     12.4
//   2     Algebraic reasoning        21     15      about 14     12.5
//   3     Geometry and measurement   22     16      about 15     14.3
//   4     (not drawn)                 -     20         -         16.4
//   5     (not drawn)                 -     17         -         14.2
//
// SIX of six titles disagree with the list below, not the two that were first
// reported. Units 2 and 3 are off by six topics each.
//
// The tell is internal, so it needs no comparison to production to see: the
// import's header reads "Six units, 97 topics", and its four drawn units already
// sum to 75 against a real 60. Its own numbers cannot reach its own total.
//
// The ONE number in it that matches is the course denominator, 97, and that is
// 100 rows minus 3 placeholders. Derive it; never hardcode it.
//
// Titles below are authoritative and ship as they are. Counts and hour totals
// are derived from curriculum_topics at render.
export const UNIT_TITLES: Readonly<Record<number, string>> = {
  0: 'Foundations',
  1: 'Number Sense and Quantitative Foundations',
  2: 'Linear Relationships',
  3: 'Geometry and Spatial Reasoning',
  4: 'Advanced Algebraic Reasoning',
  5: 'Probabilistic and Statistical Reasoning',
};

/**
 * The title for a unit, or null when there is none.
 *
 * Null rather than a fallback string, so a caller has to say out loud what it
 * renders for an unknown unit rather than defaulting into an empty-looking
 * heading. Every unit in the course today has a title; a seventh unit uploaded
 * before this constant is updated is the case this exists for.
 */
export function unitTitle(unitNumber: number): string | null {
  return UNIT_TITLES[unitNumber] ?? null;
}

/** "Unit 3 · Geometry and Spatial Reasoning", or "Unit 6" when no title is known. */
export function unitLabel(unitNumber: number): string {
  const title = unitTitle(unitNumber);
  return title ? `Unit ${unitNumber} · ${title}` : `Unit ${unitNumber}`;
}
