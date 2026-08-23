// Official TSIA2A score tracking: the rules that are not the database's job.
//
// RUNTIME-PURE ON PURPOSE, same discipline as capabilities.ts, products.ts and
// crisis.ts. There are no imports at all, so the type-stripping loader can hand
// this straight to `node --test` and a fault can be injected into it. That
// matters here for the same reason it matters in capabilities.ts: the correction
// window is a gate, and a gate whose test cannot be made to fail is not a test.

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
