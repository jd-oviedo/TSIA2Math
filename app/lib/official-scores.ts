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

// ─── The de-identified aggregate row ─────────────────────────────────────────

/**
 * Coarsen a date to the first of its month, as YYYY-MM-01.
 *
 * STRING SLICING, NOT Date. Both inputs this is given are already UTC by
 * construction -- test_date is a bare calendar date with no timezone at all, and
 * created_at is an ISO timestamp Postgres wrote in UTC -- so parsing them into a
 * Date only introduces the chance of the server's local zone shifting a
 * first-of-the-month or a last-of-the-month row into the wrong bucket. Slicing
 * cannot do that.
 *
 * The CHECK in sql/official_scores.sql enforces day 01 on both aggregate date
 * columns, so a bug here surfaces as a refused insert rather than as a row that
 * silently un-coarsens itself. Returns null on anything that is not plainly
 * YYYY-MM-..., which the caller treats as "do not write the aggregate row"
 * rather than guessing a month.
 */
export function monthFloor(value: string | null | undefined): string | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})/.exec(value);
  if (!m) return null;
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return `${m[1]}-${m[2]}-01`;
}

/** Exactly the columns public.official_score_aggregate holds, and no others. */
export type AggregateRow = {
  official_crc_score: number;
  practice_estimate_band: ReturnType<typeof practiceEstimateBand>;
  test_month: string;
  recorded_month: string;
  level_qr: OfficialLevel | null;
  level_ar: OfficialLevel | null;
  level_gr: OfficialLevel | null;
  level_pr: OfficialLevel | null;
};

/**
 * Build the de-identified companion row for one official score.
 *
 * PURE, AND SEPARATE FROM THE WRITE, for the reason the rest of this file is
 * pure: the de-identification is the security property, and a property that can
 * only be exercised by standing up a server and a database is one nobody will
 * fault-test. Here it is a function whose output can be asserted field by field,
 * including the fields it must NOT emit.
 *
 * The returned object is the whole row. There is no student_id, class_id,
 * teacher_id or source row id, and adding one later would break the
 * unjoinability argument at section 5 point 1 of sql/official_scores.sql. The
 * test asserts the key set, not merely the values, so an added identifier fails
 * the suite rather than shipping quietly.
 *
 * Returns null when either date cannot be coarsened. Refusing to write is the
 * right failure: an aggregate row is a dashboard number, and a wrong month is
 * worse than an absent row.
 */
export function buildAggregateRow(args: {
  officialScore: number;
  testDate: string;
  recordedAt: string;
  practiceScore: number | null;
  levels: {
    level_qr: OfficialLevel | null;
    level_ar: OfficialLevel | null;
    level_gr: OfficialLevel | null;
    level_pr: OfficialLevel | null;
  };
}): AggregateRow | null {
  const test_month = monthFloor(args.testDate);
  const recorded_month = monthFloor(args.recordedAt);
  if (!test_month || !recorded_month) return null;

  return {
    official_crc_score: args.officialScore,
    // The band, never the number. Point 3 of the unjoinability argument: an
    // attacker holding a student's exact practice score cannot match on it.
    practice_estimate_band: practiceEstimateBand(args.practiceScore),
    test_month,
    recorded_month,
    level_qr: args.levels.level_qr,
    level_ar: args.levels.level_ar,
    level_gr: args.levels.level_gr,
    level_pr: args.levels.level_pr,
  };
}

// ─── The roster CSV columns ──────────────────────────────────────────────────

/**
 * The official columns roster.csv appends, in order.
 *
 * DEFINED HERE RATHER THAN IN teacher-export.ts, which is where the rest of the
 * roster file is assembled, for one reason: teacher-export.ts reaches
 * next/headers through teacher-directory.ts and therefore cannot be loaded by
 * `node --test` at all. Column names and cell values that live there can only be
 * exercised by standing up a server. Here they are ordinary functions the suite
 * can fault, which is the same argument that keeps the correction window in this
 * file.
 *
 * PREFIXED official_, because roster.csv already carries qr/ar/gr/pr accuracy
 * percentages from the product's own practice runs. An unprefixed level_qr
 * beside qr_accuracy_pct invites exactly the conflation this feature exists to
 * prevent: one is what the product measured, the other is what the state
 * reported. The delta column is the deliberate exception -- DELTA_COLUMN names
 * its own interval, which is the whole point of that constant.
 */
export const OFFICIAL_ROSTER_COLUMNS = [
  "official_score",
  "official_test_date",
  "official_level_qr",
  "official_level_ar",
  "official_level_gr",
  "official_level_pr",
  DELTA_COLUMN,
] as const;

/** The subset of an official row roster.csv renders. Any wider row satisfies it. */
export type OfficialRosterRow = {
  official_crc_score: number;
  test_date: string;
  level_qr: OfficialLevel | null;
  level_ar: OfficialLevel | null;
  level_gr: OfficialLevel | null;
  level_pr: OfficialLevel | null;
};

/**
 * The seven cells, in OFFICIAL_ROSTER_COLUMNS order.
 *
 * NULL IS THE ANSWER IN TWO DIFFERENT SITUATIONS and both of them are correct
 * rather than missing:
 *
 *   A student with no official result at all gets seven nulls, which the CSV
 *   writer renders as empty fields. Not zeroes: zero is a real point on a
 *   910-990 scale and would read as a catastrophic score rather than as an
 *   absent one. That is most students for most of the year.
 *
 *   A student who MET the standard gets a score and a date and four null
 *   levels. Their report carries no strand detail, so empty is the complete and
 *   final answer, not data that failed to load.
 *
 * The delta is null when the student had never completed a practice run before
 * the test date. A zero there would read as "no change", which is the one thing
 * it does not mean.
 */
export function officialRosterCells(
  official: OfficialRosterRow | null,
  practiceScore: number | null
): (string | number | null)[] {
  if (!official) return OFFICIAL_ROSTER_COLUMNS.map(() => null);

  return [
    official.official_crc_score,
    official.test_date,
    official.level_qr,
    official.level_ar,
    official.level_gr,
    official.level_pr,
    practiceScore === null ? null : official.official_crc_score - practiceScore,
  ];
}
