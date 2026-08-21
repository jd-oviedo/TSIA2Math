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
