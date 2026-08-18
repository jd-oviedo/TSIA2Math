'use client';

import { C, ink } from '@/app/components/curriculum-theme';
import {
  quizSegmentState,
  quizStripSummary,
  type QuizSegment,
  type QuizResultLike,
} from '@/app/lib/quiz-strip';

// One segment per question, shown during the attempt and again on the finish
// summary. Four at 40x6px, per the design's token sheet, against practice's ten
// at 26x6.
//
// It shares practice's geometry idiom and its token mapping and nothing else:
// the state enum is its own, because the quiz has no current question. See
// app/lib/quiz-strip.ts.
//
// It reports position and outcome. It is not a control and it does not gate:
// the mini quiz's threshold lives in GatedQuiz and TopicNav and nothing here
// reads it.

const COLOUR: Record<QuizSegment, string> = {
  correct: C.green,
  missed: C.amber,
  untouched: ink(0.13),
};

export default function QuizStrip({
  itemNumbers,
  results,
}: {
  itemNumbers: number[];
  results: Record<number, QuizResultLike | undefined>;
}) {
  const summary = quizStripSummary(itemNumbers, results);

  return (
    <div
      className="um-quiz-strip"
      style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}
      role="img"
      // The colours carry correct, missed and unanswered. This says the same
      // thing in words rather than leaving a screen reader with four unlabelled
      // boxes.
      aria-label={`${summary.answered} of ${summary.total} answered, ${summary.correct} correct, ${summary.missed} missed.`}
    >
      {itemNumbers.map((n) => {
        const state = quizSegmentState(n, results);
        return (
          <span
            key={n}
            data-state={state}
            style={{ width: '40px', height: '6px', background: COLOUR[state] }}
          />
        );
      })}
    </div>
  );
}
