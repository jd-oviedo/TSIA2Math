// The mini quiz's four-segment progress strip.
//
// DELIBERATELY NOT practice's segmentState, and the reason is not tidiness.
// That enum carries a `current` state because practice is paged and one problem
// is on screen at a time. The quiz is not paged: all four questions are on one
// page, so there is no current question, and reusing that enum would leave a
// branch that can never fire and imply a position the surface does not have.
//
// Three states, and the strip is GRADED. Every question the student has answered
// shows how it went, because this quiz grades on submit -- the card beside it
// already says "Nailed it" or "Not quite yet", and a neutral strip above graded
// cards would be lying by omission about information the page is already
// showing.
//
// The design draws the strip neutral during the attempt, and that is downstream
// of its "answers are not graded until you finish" model, which this product
// rejects: deferred grading cannot coexist with GUMU opening on a miss, and GUMU
// at the moment of the miss is the point of the tutor.
//
// Imports nothing, same reason as attempt-sets.ts.

export type QuizSegment = 'correct' | 'missed' | 'untouched';

export type QuizResultLike = { isCorrect: boolean };

export function quizSegmentState(
  itemNumber: number,
  results: Record<number, QuizResultLike | undefined>
): QuizSegment {
  const result = results[itemNumber];
  if (!result) return 'untouched';
  return result.isCorrect ? 'correct' : 'missed';
}

// The counts behind the strip's accessible label, so a screen reader gets the
// same information the colours carry.
export function quizStripSummary(
  itemNumbers: number[],
  results: Record<number, QuizResultLike | undefined>
): { correct: number; missed: number; answered: number; total: number } {
  let correct = 0;
  let missed = 0;
  for (const n of itemNumbers) {
    const state = quizSegmentState(n, results);
    if (state === 'correct') correct += 1;
    else if (state === 'missed') missed += 1;
  }
  return { correct, missed, answered: correct + missed, total: itemNumbers.length };
}
