// Topic completion, definition A. THE CALCULATION ONLY.
//
// IMPORTS NOTHING, ON PURPOSE, so `node --test` can load it directly. Same
// discipline as app/lib/capabilities.ts, app/lib/units.ts and
// app/lib/topic-parts.ts, and for the same reason: this is the arithmetic behind
// the number a student reads as their progress, and it has to be testable
// without a Supabase client in the way. tests/topic-completion.test.ts pins it.
//
// The reading half (getCompletions) stays in curriculum-progress.ts, which owns
// the admin client. This file knows nothing about where the rows came from.

export type SectionShapeLike = { gradable: number };
export type TopicShapeLike = {
  practice: SectionShapeLike;
  mini_quiz: SectionShapeLike;
};
/** The per-section correct counts this needs out of a TopicProgress. */
export type ObservedLike = { practiceCorrect: number; quizCorrect: number };

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
// QUIZ_RATIO above, not a different definition.
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

  // The lesson has no observable counterpart in the attempt log: reading is not
  // an answer, so nothing reconciles it. If the snapshot has not recorded the
  // notes as read, the topic is not complete under A.
  if (!snapshot.lesson_completed_at) return false;

  const practiceTotal = shape.practice.gradable;
  const quizTotal = shape.mini_quiz.gradable;
  const practiceCorrect = Math.max(snapshot.practice_correct ?? 0, observed?.practiceCorrect ?? 0);
  const quizCorrect = Math.max(snapshot.quiz_correct ?? 0, observed?.quizCorrect ?? 0);

  const practiceCleared =
    practiceTotal === 0 || practiceCorrect >= requiredCorrect('practice', practiceTotal);
  const quizCleared = quizTotal === 0 || quizCorrect >= requiredCorrect('quiz', quizTotal);
  return practiceCleared && quizCleared;
}

