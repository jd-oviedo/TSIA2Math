// Topic completion, definition A. THE CALCULATION ONLY.
//
// IMPORTS NOTHING, ON PURPOSE, so `node --test` can load it directly. Same
// discipline as app/lib/capabilities.ts, app/lib/units.ts and
// app/lib/topic-parts.ts, and for the same reason: this is the arithmetic behind
// the number a student reads as their progress, and it has to be testable
// without a Supabase client in the way. tests/topic-completion.test.ts pins it.
//
// The reading half (getCompletions, getTopicStatuses) stays in
// curriculum-progress.ts, which owns the admin client. This file knows nothing
// about where the rows came from.

export type SectionShapeLike = { gradable: number };
export type TopicShapeLike = {
  practice: SectionShapeLike;
  mini_quiz: SectionShapeLike;
};

/**
 * What this needs out of a TopicProgress: the per-section correct counts, and
 * whether the section was touched at all.
 *
 * The two Attempted flags arrived with A1 (below). They are facts about the
 * attempt log and are NOT derivable from the correct counts: a student who
 * tried all ten practice items and missed all ten has practiceCorrect 0 and
 * practiceAttempted true, and that student is exactly the one A1 exists for.
 */
export type ObservedLike = {
  practiceCorrect: number;
  quizCorrect: number;
  practiceAttempted: boolean;
  quizAttempted: boolean;
};

/**
 * Progress status for one topic.
 *
 * 'gated' is deliberately NOT a member. Whether a student's plan reaches a topic
 * is an entitlement fact resolved by resolveCourseAccess/allowsTopic, not a
 * progress fact, and folding it in here would drag the Supabase-backed access
 * resolver into a module whose whole point is that it imports nothing. The
 * Modules page keeps `reachable ? status : 'gated'` for that reason.
 */
export type TopicStatusKind = 'complete' | 'in_progress' | 'not_started';

// ─── Definition A: topic completion, read from the stored snapshot ───────────
//
// SETTLED 2026-08-22. Two definitions of "complete" existed and disagreed, and
// the syllabus was rendering the one the database does not record.
//
//   A, the stored snapshot. curriculum_completion.completed_at, stamped by
//      syncCompletionSnapshot when the notes are read AND practice clears 70%
//      AND the quiz clears 75%.
//   B, recomputed at render. The old statusOf() in dashboard/modules/page.tsx:
//      complete when correct >= total across every gradable item, practice and
//      quiz together, with the lesson never consulted.
//
// B is strictly harder on questions (100% against 70/75%) and strictly easier
// overall (it does not require the notes to be read). A student who read the
// notes and scored 8/10 and 3/4 was complete under A and incomplete under B.
//
// A wins, and not narrowly. B is unreachable for most students on most topics,
// it rewards skipping the notes and grinding questions, and it contradicts the
// gates the product already enforces: the quiz unlocks at 70% of practice, and
// B told a student who cleared that gate and scored 3 of 4 they had completed
// nothing. A is what the gates already use and it includes the lesson, which is
// what makes "complete" mean "I finished this topic".
//
// EXPECT A ONE-TIME FLIP. Switching B to A moves some existing students from
// "In progress" to "Complete" on their next load, because A is easier on
// questions. That is a correction, not a regression.
//
// If 7 of 10 ever reads as too generous, the lever is PRACTICE_RATIO and
// QUIZ_RATIO below, not a different definition.

// ─── A1: the lesson half of A now fails open. SETTLED 2026-08-24 by Juan ─────
//
// SUPERSEDES the strict form that stood here from 2026-08-22 to 2026-08-24:
//
//     if (!snapshot.lesson_completed_at) return false;
//
// with the comment "the lesson has no observable counterpart in the attempt
// log: reading is not an answer, so nothing reconciles it". That sentence was
// true and the conclusion drawn from it was wrong, for a reason the file could
// not see from inside: topic-data.ts had ALREADY decided the opposite question
// the other way on 2026-08-21, treating practice or quiz activity as proof a
// student is past the lesson. Two files, two rules, one token.
//
// WHAT THAT COST, on one page. app/dashboard/modules/page.tsx read BOTH: the
// row status, the unit bars and the course band came through here (strict),
// while the Resume card came through topic-data.ts (fail-open). A student whose
// lesson write was lost -- the SNAPSHOT_WRITE_LOST case instrumented at the
// write site in curriculum-progress.ts -- was told "Read the notes again" by the
// Resume card and "In progress" by the row, permanently, on the same screen. And
// because syncCompletionSnapshot computes allCleared with the strict form too,
// completed_at could never be stamped for them: not a display glitch, a topic
// that could never be finished.
//
// CONFIRMED AGAINST LIVE DATA before the flip: exactly one curriculum_completion
// row is currently caught in the divergence (lesson_completed_at null with
// practice or quiz attempted). A1 is a live-bug fix on a real row, not a tidy-up.
//
// WHAT THE TOKEN NOW MEANS, restated here because this file is where the
// definition lives: "not before the lesson", not "read the lesson". A student
// who answered the practice and the quiz has demonstrably engaged with the
// topic, and calling that incomplete because a bookkeeping write dropped is
// worse than counting it. If you ever need "actually read the notes" for
// something else, this is not the flag for it -- you need the second source
// rejected in topic-data.ts, and the reasons it was rejected are still there.
//
// ONE FORM, ONE HOME. isPastLesson below is the only expression of this rule in
// the tree. topic-data.ts had its own copy (a local `observedPastLesson` const);
// it was DELETED rather than left sitting unused behind this one, because a
// second form that merely has no callers today is how the drift comes back.
export type CompletionRow = {
  completed_at: string | null;
  lesson_completed_at: string | null;
  practice_correct: number | null;
  practice_total: number | null;
  quiz_correct: number | null;
  quiz_total: number | null;
};

// ─── Mastery thresholds ──────────────────────────────────────────────────────

// Practice unlocks at 7 of 10, the quiz at 3 of 4. Held as a ratio of the
// section's real item count rather than a bare 7, so a topic authored with a
// different number of items still gates at the same standard instead of
// becoming impossible or trivial.
const PRACTICE_RATIO = 7 / 10;
const QUIZ_RATIO = 3 / 4;

export function requiredCorrect(kind: 'practice' | 'quiz', gradable: number): number {
  if (gradable === 0) return 0;
  const ratio = kind === 'practice' ? PRACTICE_RATIO : QUIZ_RATIO;
  return Math.ceil(gradable * ratio);
}

/**
 * Is this student past the guided notes? A1, and the only copy of it.
 *
 * The stored stamp OR evidence of activity in either gradable section. The two
 * observed flags come from hasAttemptedSection in attempt-sets.ts, the same
 * reduction topic-data.ts feeds this from -- reused, not reimplemented.
 *
 * Both callers pass a full ObservedLike; the optional shape is for the snapshot
 * -only case (a topic with no attempt data resolved yet), where the stored stamp
 * is the whole answer.
 */
export function isPastLesson(
  snapshot: Pick<CompletionRow, 'lesson_completed_at'> | undefined | null,
  observed: Pick<ObservedLike, 'practiceAttempted' | 'quizAttempted'> | undefined
): boolean {
  if (snapshot?.lesson_completed_at) return true;
  return Boolean(observed?.practiceAttempted) || Boolean(observed?.quizAttempted);
}

// Whether a topic is complete under definition A, reconciled against what the
// attempt log actually shows.
//
// TAKES THE HIGHER OF STORED AND OBSERVED, which is the discipline loadGates()
// in topic-data.ts already applies to the same columns. The snapshot is written
// on every answer and can be missing or stale -- a write is logged and
// swallowed on failure by design -- so trusting it blindly would let a
// bookkeeping miss un-complete a topic a student has already finished. The
// attempt log is the record of what happened; this is a cache of it.
export function isTopicComplete(
  snapshot: CompletionRow | undefined,
  observed: ObservedLike | undefined,
  shape: TopicShapeLike | undefined
): boolean {
  if (snapshot?.completed_at) return true;
  if (!snapshot || !shape) return false;

  // A1. The lesson stamp is one of two ways past this line; the other is having
  // answered something. See the A1 block above for why, and for what was here.
  if (!isPastLesson(snapshot, observed)) return false;

  const practiceTotal = shape.practice.gradable;
  const quizTotal = shape.mini_quiz.gradable;
  const practiceCorrect = Math.max(snapshot.practice_correct ?? 0, observed?.practiceCorrect ?? 0);
  const quizCorrect = Math.max(snapshot.quiz_correct ?? 0, observed?.quizCorrect ?? 0);

  const practiceCleared =
    practiceTotal === 0 || practiceCorrect >= requiredCorrect('practice', practiceTotal);
  const quizCleared = quizTotal === 0 || quizCorrect >= requiredCorrect('quiz', quizTotal);
  return practiceCleared && quizCleared;
}

/**
 * The three-state progress status for one topic. THE ONLY DEFINITION.
 *
 * ABSORBS statusOf() from app/dashboard/modules/page.tsx, which was the last
 * place a status was decided outside this file. That local copy read:
 *
 *     if (isTopicComplete(...)) return 'complete';
 *     if (snapshot?.lesson_completed_at) return 'in_progress';
 *     if (p && p.attempted > 0) return 'in_progress';
 *     return 'not_started';
 *
 * Its two in_progress clauses are exactly isPastLesson, and the second is
 * strictly weaker than the flags this now uses: TopicProgress.attempted counts
 * items in sections with gradable > 0, so it MISSES a student working QR.1.1's
 * non-interactive practice, whom hasAttemptedSection sees. Collapsing the two
 * clauses is therefore a small widening in the same direction A1 goes, not a
 * behaviour change smuggled in sideways.
 */
export function topicStatusFor(
  snapshot: CompletionRow | undefined,
  observed: ObservedLike | undefined,
  shape: TopicShapeLike | undefined
): TopicStatusKind {
  if (isTopicComplete(snapshot, observed, shape)) return 'complete';
  if (isPastLesson(snapshot, observed)) return 'in_progress';
  return 'not_started';
}
