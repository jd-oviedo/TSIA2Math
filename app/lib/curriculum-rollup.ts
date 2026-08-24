import type { TopicRow, TopicStatus } from "./curriculum-progress";
import { topicKey } from "./topic-key";

// What a class's curriculum progress looks like from the front of the room.
//
// PURE, AND runtime-pure: the only value import is topicKey, which is four
// characters of string concatenation in a module that imports nothing. Every
// type comes in through `import type` and is erased. So `node --test` can drive
// this with fixtures and never touch a Supabase client, the same split
// topic-completion.ts has against curriculum-progress.ts and capabilities.ts has
// against course-access.ts.
//
// `now` IS A PARAMETER, NOT Date.now(). The only time-dependent number here is
// "worked this week", and a reducer that reads the clock itself cannot be tested
// for the boundary it exists to draw.
//
// ─── THE HARD CONSTRAINT THIS FILE IS PART OF ────────────────────────────────
//
// EVERY "complete" HERE COMES FROM TopicStatus.status AND NOTHING ELSE.
//
// TopicStatus also carries `completedAt`, which is curriculum_completion's
// stored stamp, and it is RIGHT THERE in the object being reduced. It must not
// be read. The writer (syncCompletionSnapshot) stamps completed_at under the
// strict rule, so the column has a known gap for the population A1 catches: a
// student can be complete under the live computation while their stamp is null.
// Measured in production 2026-08-24 on Sample Class 1 -- 9 completion rows, 0
// with a completed_at.
//
// Counting `completedAt != null` instead of `status === 'complete'` would
// compile, would pass a test written against a student whose two agree, and
// would under-report every caught student to their teacher.

/** One class, rolled up. Every field is a count of students or of topics. */
export type ClassRollup = {
  /** Active members of the class. The denominator on every headline. */
  enrolled: number;
  /** Students with any topic activity inside the window. The headline. */
  workedThisWeek: number;
  /** Students with at least one topic past not_started. */
  started: number;
  /** enrolled - started. Named rather than derived, because it is a card. */
  notStarted: number;
  /** Topics completed, summed over the whole class. */
  completeTotal: number;
  /** Topics completed by the middle student. Not the mean -- see below. */
  completeMedian: number;
  /** Topics in the course. The 97 denominator, derived, never hardcoded. */
  topicsTotal: number;
  /** How many students have reached each unit, by their furthest topic. */
  furthestUnit: { unit: number; students: number }[];
};

/** How far one student is, in topic counts. Status only; no scores. */
export type StudentSummary = {
  complete: number;
  inProgress: number;
  notStarted: number;
  total: number;
};

/** Seven days, as the window "this week" means. */
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * One student's topic counts.
 *
 * Iterates TOPICS, not the status map, so the denominator is the course and a
 * student with no rows still totals 97. getTopicStatuses already guarantees a
 * full map per id, but a summary whose total depends on how much a student has
 * done would be wrong in exactly the case nobody checks.
 */
export function summarizeStudent(
  statuses: Map<string, TopicStatus>,
  topics: TopicRow[]
): StudentSummary {
  let complete = 0;
  let inProgress = 0;
  for (const topic of topics) {
    // status, never completedAt. See the header.
    const status = statuses.get(topicKey(topic.course_id, topic.topic_id))?.status;
    if (status === "complete") complete += 1;
    else if (status === "in_progress") inProgress += 1;
  }
  return {
    complete,
    inProgress,
    notStarted: topics.length - complete - inProgress,
    total: topics.length,
  };
}

/**
 * The furthest unit this student has reached, or null if they have not started.
 *
 * "Reached" is the highest unit_number holding a topic past not_started, NOT the
 * unit of the topic they last touched. A student revisiting unit 0 after
 * clearing unit 2 has still reached unit 2, and a teacher reading "furthest"
 * would not accept the other answer.
 */
export function furthestUnitFor(
  statuses: Map<string, TopicStatus>,
  topics: TopicRow[]
): number | null {
  let furthest: number | null = null;
  for (const topic of topics) {
    const status = statuses.get(topicKey(topic.course_id, topic.topic_id))?.status;
    if (status !== "complete" && status !== "in_progress") continue;
    if (furthest === null || topic.unit_number > furthest) furthest = topic.unit_number;
  }
  return furthest;
}

/**
 * The most recent moment this student touched any topic, or null.
 *
 * Read off lastWorkedAt, which getTopicStatuses already carries per topic, so
 * this costs no query. ISO strings compare correctly with > because they are
 * fixed-width UTC out of Postgres; the same comparison topicStatusesFor makes
 * (curriculum-progress.ts:449).
 */
export function lastWorkedFor(statuses: Map<string, TopicStatus>): string | null {
  let latest: string | null = null;
  for (const status of statuses.values()) {
    const at = status.lastWorkedAt;
    if (at && (latest === null || at > latest)) latest = at;
  }
  return latest;
}

/**
 * The middle value, or the mean of the two middle values.
 *
 * MEDIAN AND NOT MEAN, decided on the production data rather than on taste. One
 * student who has worked through twenty topics in a class of thirty who have
 * done nothing pulls a mean to 0.7 and reports it as though the class were
 * moving. The median says 0, which is what is true. The mean is the more
 * flattering number and that is the argument against it.
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid]!;
  return (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/**
 * The whole class, in one pass over data already in memory.
 *
 * @param statusesByStudent exactly what getTopicStatuses returns.
 * @param studentIds the ACTIVE roster. Iterated rather than the map's keys, so a
 *   student who somehow came back without a map still counts in the denominator
 *   as a student who has done nothing -- which is the honest reading -- instead
 *   of vanishing from `enrolled` and flattering every ratio built on it.
 * @param now epoch millis. Injected; see the header.
 */
export function rollupClass(
  statusesByStudent: Map<string, Map<string, TopicStatus>>,
  studentIds: string[],
  topics: TopicRow[],
  now: number
): ClassRollup {
  const units = [...new Set(topics.map((t) => t.unit_number))].sort((a, b) => a - b);
  const unitCounts = new Map<number, number>(units.map((u) => [u, 0]));

  let workedThisWeek = 0;
  let started = 0;
  let completeTotal = 0;
  const completePerStudent: number[] = [];

  for (const id of studentIds) {
    const statuses = statusesByStudent.get(id) ?? new Map<string, TopicStatus>();
    const summary = summarizeStudent(statuses, topics);

    completeTotal += summary.complete;
    completePerStudent.push(summary.complete);

    if (summary.complete + summary.inProgress > 0) started += 1;

    const lastWorked = lastWorkedFor(statuses);
    // Date.parse of an absent timestamp is NaN and every comparison against NaN
    // is false, so the null guard is not decoration -- without it a student who
    // has never worked would fall through to a comparison that quietly says no
    // for the right answer for the wrong reason.
    if (lastWorked !== null && now - Date.parse(lastWorked) <= WEEK_MS) workedThisWeek += 1;

    const furthest = furthestUnitFor(statuses, topics);
    if (furthest !== null) unitCounts.set(furthest, (unitCounts.get(furthest) ?? 0) + 1);
  }

  return {
    enrolled: studentIds.length,
    workedThisWeek,
    started,
    notStarted: studentIds.length - started,
    completeTotal,
    completeMedian: median(completePerStudent),
    topicsTotal: topics.length,
    furthestUnit: units.map((unit) => ({ unit, students: unitCounts.get(unit) ?? 0 })),
  };
}
