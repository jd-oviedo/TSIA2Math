'use client';

import { C, ink, EYEBROW, MATH_LINE_HEIGHT, INK_MUTED } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';
import QuizStrip from './QuizStrip';
import { type QuizOutcome } from '@/app/lib/quiz-finish';
import type { PublicPracticeItem } from './PracticeQuiz';

// The mini quiz's closing summary: the score, what was missed, and a way back
// into the notes.
//
// WHAT IT NAMES A MISS BY, AND WHY THAT AND NOTHING MORE
// ------------------------------------------------------
// A missed question is named by its number and its own stem. The stem is
// already rendered on this page, so this adds no new data and no new read.
//
// It does NOT say which section of the notes covers the miss. Nothing in the
// content links a question to a lesson section: that mapping does not exist in
// any form, and writing one by hand across 97 topics would be right on the day
// it was written and silently wrong the first time a lesson was re-sectioned,
// with no check able to catch the drift. So the link goes to the notes as a
// whole and the sentence makes no claim it cannot keep.
//
// It also carries no misconception tag. That field is stripped on the student
// path at three layers and this component never receives it.

export default function QuizFinish({
  outcome,
  items,
  results,
  lessonHref,
  hasSolutions,
}: {
  outcome: QuizOutcome;
  items: PublicPracticeItem[];
  // The same map the questions above render from, so the strip here and the
  // per-question chips cannot disagree.
  results: Record<number, { isCorrect: boolean } | undefined>;
  lessonHref: string;
  // Whether this student has actually earned any worked solution on this quiz.
  // An anonymous visitor records no attempts and so earns none, and telling
  // them solutions are open below when the page holds none is a claim the
  // surface cannot keep.
  hasSolutions: boolean;
}) {
  const missedItems = outcome.missed
    .map((n) => items.find((item) => item.item_number === n))
    .filter((item): item is PublicPracticeItem => Boolean(item));

  const clean = missedItems.length === 0;

  return (
    <section
      aria-labelledby="quiz-finish-heading"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        padding: '22px 24px',
        borderRadius: 16,
        background: C.paper,
        boxShadow: `inset 0 0 0 1px ${ink(0.1)}`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ ...EYEBROW, color: INK_MUTED }}>Mini quiz</div>
        <h3
          id="quiz-finish-heading"
          style={{
            margin: 0,
            font: `600 26px ${FONT_HEADING}`,
            lineHeight: 1.2,
            color: C.midnight,
          }}
        >
          {/* The score, with the number given the size the design gives it. One
              heading, not two: the figure and its unit are the same sentence, so
              splitting them into separate elements would make a screen reader
              read "three" and "of 4 correct" as unrelated. */}
          <span style={{ font: `600 40px ${FONT_HEADING}`, lineHeight: 1 }}>
            {outcome.correct}
          </span>
          <span style={{ font: `400 18px ${FONT_BODY}`, color: ink(0.65) }}>
            {' '}
            of {outcome.total} correct
          </span>
        </h3>

        {/* The same strip the attempt showed, so the summary and the questions
            above it are reporting the same thing in the same shape. */}
        <QuizStrip itemNumbers={items.map((item) => item.item_number)} results={results} />
        <p style={{ margin: 0, font: `400 14px ${FONT_BODY}`, lineHeight: 1.6, color: ink(0.65) }}>
          {clean
            ? hasSolutions
              ? 'Every question right. The worked solutions are open below if you want to compare your reasoning.'
              : 'Every question right.'
            : hasSolutions
              ? 'The worked solutions for the ones you got right are open below. Here is what to look at again.'
              : 'Here is what to look at again.'}
        </p>
      </div>

      {!clean && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ ...EYEBROW, color: INK_MUTED }}>What you missed</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {missedItems.map((item) => (
              <li
                key={item.item_number}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: C.amberBg,
                  boxShadow: `inset 3px 0 0 ${C.amber}`,
                }}
              >
                <div
                  style={{
                    font: `600 12px ${FONT_BODY}`,
                    color: C.amber,
                    marginBottom: 6,
                  }}
                >
                  Question {item.item_number}
                </div>
                {/* The item's own stem, the same HTML the question above used.
                    Math renders at the section's line height so a stacked
                    fraction is not clipped. */}
                <div
                  className="um-prose"
                  style={{
                    font: `400 14.5px ${FONT_BODY}`,
                    lineHeight: MATH_LINE_HEIGHT,
                    color: ink(0.8),
                  }}
                  dangerouslySetInnerHTML={{ __html: item.stem_html }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <a
          className="um-quiz-finish-lesson"
          href={lessonHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 44,
            padding: '12px 22px',
            borderRadius: 12,
            background: C.sand,
            boxShadow: `inset 0 0 0 1px ${ink(0.14)}`,
            font: `600 14.5px ${FONT_BODY}`,
            color: C.midnight,
            textDecoration: 'none',
          }}
        >
          Back to the guided notes
        </a>
        <span style={{ font: `400 13px ${FONT_BODY}`, lineHeight: 1.55, color: ink(0.5) }}>
          {clean
            ? 'Or carry on from the bottom of the page.'
            : 'Reread the notes, then try the ones above again.'}
        </span>
      </div>
    </section>
  );
}
