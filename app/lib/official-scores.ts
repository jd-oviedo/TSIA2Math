// Official TSIA2A score tracking: the rules that are not the database's job.
//
// RUNTIME-PURE ON PURPOSE, same discipline as capabilities.ts, products.ts and
// crisis.ts. The only import is `import type`, which the type-stripping loader
// erases, so `node --test` can load this directly and fault it. That matters
// here for the same reason it matters in capabilities.ts: the correction window
// is a gate, and a gate whose test cannot be made to fail is not a test.

import { PASSING } from "./placement";

/** The four reasoning strands, in the order the score report prints them. */
export const OFFICIAL_STRANDS = ["qr", "ar", "gr", "pr"] as const;
export type OfficialStrand = (typeof OFFICIAL_STRANDS)[number];

/**
 * The three diagnostic levels a score report prints per strand.
 *
 * Same three words as ProficiencyLevel in app/adaptive-test/type.ts and the
 * worksheet builder's LEVELS. Restated here rather than imported from
 * adaptive-test because that module pulls in the CAT engine, and this file has
 * to stay loadable by a bare test harness. The CHECK in sql/official_scores.sql
 * is the third copy and the authoritative one.
 */
export const OFFICIAL_LEVELS = ["Basic", "Proficient", "Advanced"] as const;
export type OfficialLevel = (typeof OFFICIAL_LEVELS)[number];

/**
 * Does this row need the passing-score warning?
 *
 * A student who meets the college-readiness standard receives no strand
 * diagnostic, so a level alongside a passing score is a transcription anomaly.
 * NEVER BLOCKS: decision 8 is warn and allow. The report is the authority and
 * the product is not entitled to refuse what it says.
 *
 * Computed from the values rather than taken from the client, so a request that
 * skips the form cannot claim it was not warned. This is what feeds
 * official_scores.entered_despite_warning.
 */
export function hasPassingScoreWithLevels(
  score: number,
  levels: readonly (OfficialLevel | null)[]
): boolean {
  return score >= PASSING && levels.some((l) => l !== null);
}

/**
 * What the form says when hasPassingScoreWithLevels holds.
 *
 * Phrased as an observation and a question, not a refusal. The teacher is
 * holding the document and the product is not: if the report really does show
 * both, the report wins and the entry goes in unchanged.
 */
export const PASSING_WARNING_HINT =
  `A score of ${PASSING} or above means the student met the college-readiness ` +
  'standard, and those reports do not carry strand diagnostic levels. Check the ' +
  'report before saving. You can save it either way.';

/**
 * The practice-estimate band, for the de-identified aggregate row.
 *
 * Thresholds are placementBand()'s, reached through PASSING and the same 935,
 * so the aggregate and everything a teacher reads cannot drift apart. Returns
 * the machine value the CHECK in sql/official_scores.sql accepts, NOT the
 * human label: 'college_ready', not 'College ready'.
 *
 * null score means the student sat the official test having never completed a
 * practice run, which is a real state and not an error.
 */
export function practiceEstimateBand(
  score: number | null
): "college_ready" | "approaching" | "below_college_ready" | "no_estimate" {
  if (score === null) return "no_estimate";
  if (score >= PASSING) return "college_ready";
  if (score >= 935) return "approaching";
  return "below_college_ready";
}

/**
 * How the delta is named, everywhere it appears.
 *
 * ONE CONSTANT BECAUSE THE NAME IS THE WHOLE POINT. The interval is "the
 * student's most recent completed practice run before the test date", and it is
 * NOT their diagnostic. sessions.session_type marks exactly one session per
 * student as 'diagnostic' and it is by construction their earliest, so a delta
 * against it would compare a December result to a run from before the student
 * had done any coursework. Option A was chosen (Juan, 2026-08-23) precisely to
 * avoid that, and the label has to keep saying so or the number gets read as
 * growth since diagnostic.
 *
 * The CSV column name is derived from this for the same reason.
 */
export const DELTA_LABEL = "vs latest practice";
export const DELTA_COLUMN = "delta_vs_latest_practice";

/** The shape latestPracticeBefore needs. Any wider row satisfies it. */
export type PracticeSessionLike = {
  final_score: number | null;
  created_at: string;
  completed_at: string | null;
};

/**
 * The practice run a delta is measured against: the student's most recent
 * COMPLETED session that started before the test date.
 *
 * OPTION A (Juan, 2026-08-23), and the reasoning is worth keeping next to the
 * code. The obvious rule, "most recent completed diagnostic before test_date",
 * is unusable on this data: sql/sessions_session_type.sql promotes exactly the
 * EARLIEST session per student to 'diagnostic' and defaults every later one to
 * 'practice', so there is only ever one diagnostic and it is always the oldest
 * thing the student did. A delta against it would flatter every student who has
 * practised since.
 *
 * ORDERED BY created_at, NEVER BY completed_at. Production holds sessions where
 * completed_at is EARLIER than created_at, which is why the CSV export sums
 * elapsed_ms rather than subtracting timestamps (see teacher-export.ts). So
 * completed_at is used here ONLY as a "did this finish" flag and never as a
 * sort key. Caller must pass sessions already sorted newest-first by created_at.
 *
 * "Before the test date" is strictly before midnight UTC on test_date. A run
 * taken on the morning of the test is excluded: it measures the student on test
 * day, not the preparation the delta is meant to describe.
 *
 * Returns null when the student has no qualifying run, which is a real state and
 * not an error. A student can sit the official test having never practised.
 */
export function latestPracticeBefore<T extends PracticeSessionLike>(
  sessionsNewestFirst: readonly T[],
  testDate: string
): T | null {
  const cutoff = Date.parse(`${testDate}T00:00:00Z`);
  if (Number.isNaN(cutoff)) return null;

  for (const s of sessionsNewestFirst) {
    if (s.completed_at === null) continue;
    if (s.final_score === null) continue;
    const started = Date.parse(s.created_at);
    if (Number.isNaN(started)) continue;
    if (started < cutoff) return s;
  }
  return null;
}

/**
 * How long a newly entered official score stays correctable.
 *
 * 24 HOURS, decided 2026-08-23 by Juan, raised from a proposed 60 minutes.
 *
 * The failure this protects against is a transcription slip caught while the
 * paper report is still to hand. Sixty minutes covers one sitting; a teacher
 * working through a stack of reports across a planning period, then coming back
 * to it the next morning, needs the day. Long enough for that, short enough that
 * the handle still reads as "undo" rather than as a general edit affordance on
 * an academic record.
 *
 * DERIVED AT READ TIME, NEVER STORED. There is no expiry column on
 * official_scores and there must not be one: storing an expiry would make
 * changing this constant a backfill, and would let two rows written a minute
 * apart disagree about how long a correction lasts.
 *
 * REJECTED: end of the teacher's calendar day, which is the more humane rule and
 * cannot be implemented correctly here. `profiles` carries no timezone, and
 * inferring one from the browser would make the server's answer depend on the
 * client's clock, which is exactly what a correction window must not do.
 */
export const CORRECTION_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Is a row still inside its correction window?
 *
 * `now` is a parameter rather than a call to Date.now() inside the function so
 * the boundary can be tested without waiting 24 hours or mocking the clock. The
 * route passes one `now` for the whole response, so a list of rows is judged
 * against a single instant rather than against a clock that moves between them.
 *
 * An unparseable or absent created_at returns FALSE, not true. Failing closed is
 * the right direction for a mutation window on an academic record: the cost of a
 * wrong `false` is a support request, and the cost of a wrong `true` is an
 * editable record that should have been immutable.
 */
export function isCorrectable(
  createdAt: string | null | undefined,
  now: number,
  windowMs: number = CORRECTION_WINDOW_MS
): boolean {
  if (!createdAt) return false;
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return false;

  // A row stamped in the future is a clock problem, not a fresh row. Treated as
  // outside the window rather than as correctable for the next 24 hours plus
  // however far the clock has drifted.
  if (created > now) return false;

  return now - created < windowMs;
}
