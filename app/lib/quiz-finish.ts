// What the mini quiz looks like once every question has been answered.
//
// Pure, and imports nothing, so `node --test` can load it without React or the
// admin Supabase client. Same reason as attempt-sets.ts, lesson-sections.ts and
// topic-parts.ts.
//
// WHAT THIS IS AND IS NOT
// -----------------------
// It is a summary of what the student just did, computed from results already
// in the page. It is NOT a gate and it changes nothing about one: the mini
// quiz's threshold still lives in GatedQuiz and TopicNav and is untouched. A
// student can reach this summary without clearing the gate, and clearing the
// gate does not depend on reaching it.
//
// It carries no diagnosis. The misconception tag is stripped on the student
// path at three layers -- the view, the item transform, and GumuChat -- and
// nothing here reaches for it. A missed question is identified by its number
// and its own stem, both of which are already rendered on the page.
//
// Retries are respected rather than remembered: `results` holds the latest
// outcome per item, so a question answered wrong and then right stops counting
// as missed. That matches the server, which counts distinct ever-correct items.

export type QuizResultLike = { isCorrect: boolean };

export type QuizOutcome = {
  total: number;
  answered: number;
  correct: number;
  // Item numbers still wrong at their most recent attempt, in the order the
  // questions are presented.
  missed: number[];
  // True only when every question has an outcome. A quiz with no gradable
  // questions is never "finished", because there was nothing to finish.
  finished: boolean;
};

export function quizOutcome(
  itemNumbers: number[],
  results: Record<number, QuizResultLike | undefined>
): QuizOutcome {
  const answeredNumbers = itemNumbers.filter((n) => Boolean(results[n]));
  const missed = answeredNumbers.filter((n) => results[n]!.isCorrect === false);

  return {
    total: itemNumbers.length,
    answered: answeredNumbers.length,
    correct: answeredNumbers.length - missed.length,
    missed,
    finished: itemNumbers.length > 0 && answeredNumbers.length === itemNumbers.length,
  };
}

// The one line at the top of the summary.
//
// Deliberately flat. No praise, no grade, no "well done": the audience is a
// student a year out from a college placement test, and the number is the
// information. Encouraging, not gamified.
export function outcomeHeadline(outcome: QuizOutcome): string {
  return `${outcome.correct} of ${outcome.total} correct`;
}

// Whether a worked solution may be offered right now.
//
// Practice is a workshop: check, reveal, retry, and the reveal has always been
// available there on items the student has earned. The quiz is an assessment,
// so the same reveal waits until the attempt is over. This is the "no reveal
// during the attempt" rule, and it is a presentation rule only -- which
// solutions exist at all is still decided server-side by loadEarnedSolutions,
// which this cannot widen.
export function solutionsAvailable(
  section: 'practice' | 'mini_quiz',
  outcome: QuizOutcome
): boolean {
  if (section === 'practice') return true;
  return outcome.finished;
}
