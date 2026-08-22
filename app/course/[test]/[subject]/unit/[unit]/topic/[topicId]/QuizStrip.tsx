'use client';

import { T } from '@/app/components/curriculum-surface';
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

// MISSED IS RED, NOT AMBER-BROWN. RATIFIED 2026-08-22, discrepancy D7.
//
// WHAT WAS RECORDED. curriculum-theme.ts held that a wrong answer is amber-brown
// #B5763A rather than red, on the ground that "the student is mid-conversation
// with GUMU, not being alarmed".
//
// WHAT ACTUALLY SHIPPED. The 2026-08-21 token table put the design's red
// #B0452F into --umt-missed, and PracticeQuiz.tsx and QuizFinish.tsx consumed it
// across ten call sites. So the recorded decision had already been reversed in
// practice, on the two surfaces that matter most, without anyone ruling on it.
// This strip was the straggler, and it sat beside a practice page that had
// already gone red.
//
// WHAT DECIDED IT: the measurement, not the tone. Amber-brown is 3.30:1 on the
// missed row and 3.68 on panel, both below AA. Red is 4.95 and 5.53. A tone
// preference was overriding a contrast failure, which is not a trade that was
// ever consciously made.
//
// Dark is #E07B72, already measured at 5.14 on the dark missed tint.
const COLOUR: Record<QuizSegment, string> = {
  correct: T.correct,
  missed: T.missed,
  untouched: T.track,
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
