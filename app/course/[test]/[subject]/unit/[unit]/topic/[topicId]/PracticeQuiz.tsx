'use client';

import { useCallback, useRef, useState } from 'react';
import { T } from '../../../../../../../components/curriculum-surface';
import { pageTurn, segmentState, type SegmentState } from '@/app/lib/practice-paging';
import GumuChat from './GumuChat';
import { useGumuGate } from './GumuGate';
import QuizFinish from './QuizFinish';
import QuizStrip from './QuizStrip';
import { quizOutcome, solutionsAvailable } from '@/app/lib/quiz-finish';
import { EYEBROW, MATH_LINE_HEIGHT, hairline } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';

// What the browser is allowed to see. Built server-side in page.tsx by
// stripping correct_answer and misconception_tag off each parsed item -- those
// fields are omitted from this type entirely, not left optional, so there is
// no shape in which a component could read them. Grading happens in
// /api/curriculum/practice.
export type PublicPracticeItem = {
  item_number: number;
  level: string | null;
  stem_html: string;
  choices_html: Record<string, string>;
};

type Props = {
  courseId: string;
  topicId: string;
  section: 'practice' | 'mini_quiz';
  items: PublicPracticeItem[];
  heading: string;
  blurb: string;
  // Worked solutions split out of Part 4, keyed by item_number. Absent on a
  // topic whose answer key would not parse, and the reveal link goes with it.
  solutions?: Record<number, string>;
  // Reports how many distinct items have been answered correctly at least
  // once this visit, so the mastery gate on Next can open without a reload.
  onMasteredCountChange?: (count: number) => void;
  // Where "back to the guided notes" goes on the quiz's closing summary. Only
  // passed for the mini quiz; practice has no finish state, because practice is
  // a workshop a student dips in and out of rather than an attempt that ends.
  lessonHref?: string;
  // Item numbers this student already had right before this visit, so the strip
  // can show earlier work instead of ten blank segments on every return.
  //
  // An array rather than a Set because it crosses the server/client boundary.
  // Correct only: gates.practiceSolved records solved items and there is no
  // stored equivalent for items previously missed, so previously-missed reads as
  // untouched. See the note on segmentState.
  solvedBefore?: number[];
};

// correct_answer is null when GUMU is available -- the server withholds it so
// the answer can't be printed above the chat panel. It arrives later via the
// escape hatch, at which point revealedAnswer below fills it in.
type Result = {
  isCorrect: boolean;
  correct_answer: string | null;
  gumu_available?: boolean;
};

const LETTERS = ['A', 'B', 'C', 'D'];

// The strip's four states. Design 1f's own hexes are not used: they are the
// near-misses of the brand palette that live won on, so these are the live
// equivalents -- green for correct, amber for missed, Sunset for the one in
// view, and the standard hairline for untouched.
const SEGMENT_COLOUR: Record<SegmentState, string> = {
  current: T.cta,
  correct: T.correct,
  missed: T.missed,
  untouched: T.hairline,
};

export default function PracticeQuiz({
  courseId,
  topicId,
  section,
  items,
  heading,
  blurb,
  solutions,
  onMasteredCountChange,
  lessonHref,
  solvedBefore,
}: Props) {
  // Keyed by item_number rather than array index so the maps stay correct
  // regardless of how the items are ordered or filtered.
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, Result>>({});
  const [pending, setPending] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  // Filled in only when GUMU's escape hatch hands the answer back.
  const [revealed, setRevealed] = useState<Record<number, string>>({});
  const [openSolutions, setOpenSolutions] = useState<Record<number, boolean>>({});
  // Items answered correctly at least once. Only ever grows, so a retry after a
  // right answer cannot walk the mastery gate backwards. Mirrors the server,
  // which counts distinct ever-correct items off the append-only attempt log.
  // A ref, not state: nothing here renders from it, it only reports upward.
  const mastered = useRef<Set<number>>(new Set());

  // One problem at a time. A client-side index rather than a URL param, chosen
  // for data integrity rather than convenience: a URL turn re-renders the server
  // component, discards `results`, and shows an already-answered problem as
  // unanswered -- so a student re-submitting writes a SECOND curriculum_attempts
  // row for one intended answer. Nothing reads the log that way today, but it is
  // the append-only record of what a student did.
  //
  // The cost, accepted: no deep link to a problem, no browser Back between them,
  // and position resets on reload.
  const [current, setCurrent] = useState(0);

  // PRACTICE ONLY. This component is shared with the mini quiz, and the quiz is
  // its own design surface with its own strip spec (four segments at 40px, not
  // ten at 26px) and its own register. Paging it here would have redesigned a
  // surface this unit does not cover -- which is exactly what happened on the
  // first build, and verify_quiz_finish caught it.
  const paged = section === 'practice';

  // The quiz's quieter register. Assessment should not look like the workshop.
  const quiet = section === 'mini_quiz';

  const { activeCount, setItemActive } = useGumuGate();

  // Worked solutions answer the question outright, so they follow the same rule
  // as the answer key panel: paused while any GUMU conversation is open. The
  // design shows that as the link struck through in place rather than removed,
  // so the student can see it is coming back.
  const solutionsPaused = activeCount > 0;

  const handleSessionChange = useCallback(
    (itemNumber: number, active: boolean) =>
      setItemActive(`${section}-${itemNumber}`, active),
    [setItemActive, section]
  );

  // Turning the page RELEASES THE GUMU GATE for the problem being left.
  //
  // Without this, paging away from an open GUMU session unmounts the chat while
  // the provider still counts it, and `solutionsPaused` below stays true for the
  // rest of the page load with nothing on screen left to close. Same failure
  // retry() guards against at its own trigger; see app/lib/practice-paging.ts
  // for why the decision lives in a tested function rather than inline.
  //
  // GumuChat itself is untouched: its unmount behaviour is a wider fix and the
  // GUMU work is deferred.
  function goTo(to: number) {
    const turn = pageTurn(
      items.map((item) => item.item_number),
      current,
      to,
      section
    );
    if (turn.releaseKey) setItemActive(turn.releaseKey, false);
    setCurrent(turn.index);
  }

  async function submit(itemNumber: number) {
    const answer = selected[itemNumber];
    if (!answer || pending[itemNumber]) return;

    setPending((p) => ({ ...p, [itemNumber]: true }));
    setErrors((e) => ({ ...e, [itemNumber]: '' }));

    try {
      const res = await fetch('/api/curriculum/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          topic_id: topicId,
          section,
          item_number: itemNumber,
          selected_answer: answer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors((e) => ({
          ...e,
          [itemNumber]: data?.error ?? 'Something went wrong. Try again.',
        }));
        return;
      }

      setResults((r) => ({ ...r, [itemNumber]: data }));
      if (data.isCorrect && !mastered.current.has(itemNumber)) {
        mastered.current.add(itemNumber);
        onMasteredCountChange?.(mastered.current.size);
      }
    } catch {
      setErrors((e) => ({
        ...e,
        [itemNumber]: 'Could not reach the server. Check your connection.',
      }));
    } finally {
      setPending((p) => ({ ...p, [itemNumber]: false }));
    }
  }

  // Clears one item back to unanswered so it can be attempted again. Mastery
  // gating means a student has to be able to keep going until they clear the
  // threshold, and the grading route already accepts repeat submissions: it
  // appends another curriculum_attempts row rather than updating one.
  //
  // Dropping the GUMU gate for this item first matters. The chat panel unmounts
  // with the result, and if it held an open session the answer key would stay
  // paused with nothing left on screen to close it.
  function retry(itemNumber: number) {
    setItemActive(`${section}-${itemNumber}`, false);
    setResults((r) => {
      const next = { ...r };
      delete next[itemNumber];
      return next;
    });
    setSelected((s) => {
      const next = { ...s };
      delete next[itemNumber];
      return next;
    });
    setRevealed((r) => {
      const next = { ...r };
      delete next[itemNumber];
      return next;
    });
    setErrors((e) => ({ ...e, [itemNumber]: '' }));
  }

  const answeredCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter((r) => r.isCorrect).length;
  const missedCount = answeredCount - correctCount;
  // Built once per render rather than per segment. Seeds the strip with work
  // from earlier visits; see the note on segmentState for why correct only.
  const solved = new Set(solvedBefore ?? []);

  // The quiz's closing summary, and the rule that holds worked solutions back
  // until the attempt is over.
  //
  // Computed from `results`, which holds the latest outcome per item, so a
  // question retried and got right stops counting as missed. Nothing here
  // touches the mastery gate: GatedQuiz still decides when Next opens, off its
  // own count, and this cannot move it either way.
  const outcome = quizOutcome(
    items.map((item) => item.item_number),
    results
  );
  const canRevealSolutions = solutionsAvailable(section, outcome);
  const showFinish = section === 'mini_quiz' && outcome.finished && Boolean(lessonHref);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Section header, and the strip.

          The strip replaced a fill bar that lit its first N segments regardless
          of WHICH problems had been answered. Each segment now reports its own
          problem, which is what makes it worth having beside a one-at-a-time
          view: it is the only thing on screen saying anything about the other
          nine. */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, font: `600 19px ${FONT_HEADING}`, color: T.ink }}>{heading}</h2>
        <div style={{ font: `400 13px ${FONT_BODY}`, color: T.muted }}>{blurb}</div>
        <div style={{ flex: 1 }} />
        {!paged ? (
          // The mini quiz. Replaces a fill bar that lit its first N segments by
          // count and said nothing about how any of them went, while the card
          // under it said "Nailed it" or "Not quite yet" per question.
          <QuizStrip
            itemNumbers={items.map((item) => item.item_number)}
            results={results}
          />
        ) : (
        <div
          className="um-practice-strip"
          // flex-end because the current segment is TALLER, not just a different
          // colour, so the row has to hang from a common baseline.
          style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', flexWrap: 'wrap' }}
          role="img"
          aria-label={`Problem ${current + 1} of ${items.length}. ${correctCount} correct, ${missedCount} missed, ${answeredCount} answered.`}
        >
          {items.map((item, i) => {
            const state = segmentState(
              item.item_number,
              current,
              i,
              results[item.item_number]
                ? { correct: results[item.item_number].isCorrect }
                : undefined,
              solved
            );
            return (
              <span
                key={item.item_number}
                data-state={state}
                style={{
                  width: '26px',
                  height: state === 'current' ? '10px' : '6px',
                  background: SEGMENT_COLOUR[state],
                }}
              />
            );
          })}
        </div>
        )}
      </div>

      {/* One problem. `index` is the real position in the set, not a position
          within this array, so "Problem N of M" and the legend stay honest.

          items is still passed WHOLE to quizOutcome above and to GatedQuiz, so
          the finish state and the mastery gate keep counting all of them. */}
      {(paged ? [items[current]] : items).filter(Boolean).map((item, i) => {
        const index = paged ? current : i;
        const result = results[item.item_number];
        const answered = Boolean(result);
        const choice = selected[item.item_number];
        const error = errors[item.item_number];
        // The known correct answer, from whichever source has it: the grading
        // response when GUMU is not involved, or the escape hatch when it is.
        const knownAnswer = result?.correct_answer ?? revealed[item.item_number] ?? null;
        // Withheld entirely during a quiz attempt, so the reveal control is not
        // rendered at all rather than shown and refused. Which solutions exist
        // is still decided server-side by loadEarnedSolutions; this only
        // decides when an already-earned one may be offered.
        const solution = canRevealSolutions ? solutions?.[item.item_number] : undefined;
        const solutionOpen = Boolean(openSolutions[item.item_number]) && !solutionsPaused;

        return (
          <fieldset
            key={item.item_number}
            style={{
              margin: 0,
              padding: '24px 26px 22px',
              minWidth: 0,
              border: `1px solid ${T.hairline}`,
              borderRadius: '16px',
              background: T.panel,
              boxShadow: '0 1px 3px rgba(14,14,17,.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* The legend is the group label for assistive tech only. Drawn, it
                would notch the card's top border. */}
            <legend className="um-visually-hidden">
              Problem {index + 1} of {items.length}
              {item.level ? `, ${item.level}` : ''}
            </legend>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <span style={{ ...EYEBROW, color: T.muted }}>
                Problem {index + 1} of {items.length}
                {item.level ? ` · ${item.level}` : ''}
              </span>
              {answered ? (
                <span
                  aria-hidden="true"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    flex: 'none',
                    font: `500 12.5px ${FONT_BODY}`,
                    color: result.isCorrect ? T.correct : T.missed,
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: result.isCorrect ? T.correct : T.missed,
                    }}
                  />
                  {result.isCorrect ? 'Nailed it' : 'Not quite yet'}
                </span>
              ) : (
                <span style={{ font: `400 12.5px ${FONT_BODY}`, color: T.muted, flex: 'none' }}>
                  Multiple choice
                </span>
              )}
            </div>

            <div
              className="um-stem"
              style={{
                color: T.ink,
                font: `400 19px ${FONT_BODY}`,
                lineHeight: MATH_LINE_HEIGHT,
                minHeight: '34px',
                textWrap: 'pretty',
              }}
              dangerouslySetInnerHTML={{ __html: item.stem_html }}
            />

            {/* Full-width rows, never a 2x2 grid: typeset math wraps
                unpredictably and a grid cell would clip a tall fraction. */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {LETTERS.filter((l) => item.choices_html[l] !== undefined).map((letter) => {
                const isChoice = choice === letter;
                // Once answered, mark the right option and the student's own
                // wrong one. Other options stay neutral.
                const isAnswer = answered && knownAnswer === letter;
                const isWrongPick = answered && isChoice && !result.isCorrect;
                const isSelectedPending = isChoice && !answered;

                let background: string = T.quietBox;
                let ring: string = T.hairline;
                let circleBg: string = T.panel;
                let circleRing: string = T.hairline;
                let circleColor: string = T.muted;
                let caption: string | null = null;

                if (isAnswer) {
                  background = T.correctTint;
                  ring = T.correct;
                  circleBg = T.correct;
                  circleRing = 'transparent';
                  circleColor = T.panel;
                  caption = 'the answer';
                } else if (isWrongPick) {
                  background = T.missedTint;
                  ring = T.missed;
                  circleBg = T.cta;
                  circleRing = 'transparent';
                  circleColor = T.ink;
                  caption = 'your answer';
                } else if (isSelectedPending) {
                  background = T.panel;
                  ring = T.tutorAccent;
                  circleBg = T.tutorAccent;
                  circleRing = 'transparent';
                  circleColor = T.ink;
                }

                return (
                  <label
                    key={letter}
                    className={answered ? 'um-choice' : 'um-choice um-choice-live'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '15px 18px',
                      borderRadius: '12px',
                      background,
                      boxShadow: `inset 0 0 0 ${isSelectedPending || isAnswer || isWrongPick ? 2 : 1.5}px ${ring}`,
                      minHeight: '26px',
                      cursor: answered ? 'default' : 'pointer',
                    }}
                  >
                    {/* The native control stays in the tree for keyboard and
                        screen reader users; the lettered circle is what is
                        actually drawn. Focus is ringed in the page stylesheet
                        via :focus-within on this label. */}
                    <input
                      className="um-visually-hidden"
                      type="radio"
                      name={`${section}-${item.item_number}`}
                      value={letter}
                      checked={isChoice}
                      disabled={answered}
                      onChange={() =>
                        setSelected((s) => ({ ...s, [item.item_number]: letter }))
                      }
                    />
                    <span
                      aria-hidden="true"
                      style={{
                        width: '28px',
                        height: '28px',
                        flex: 'none',
                        borderRadius: '50%',
                        background: circleBg,
                        boxShadow: `inset 0 0 0 1.5px ${circleRing}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        font: `600 13px ${FONT_HEADING}`,
                        color: circleColor,
                      }}
                    >
                      {letter}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        color: T.ink,
                        font: `400 16.5px ${FONT_BODY}`,
                        lineHeight: 1.6,
                      }}
                      dangerouslySetInnerHTML={{ __html: item.choices_html[letter] }}
                    />
                    {caption && (
                      <span
                        style={{
                          flex: 'none',
                          font: `400 12.5px ${FONT_BODY}`,
                          color: T.muted,
                        }}
                      >
                        {caption}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                flexWrap: 'wrap',
                paddingTop: '2px',
              }}
            >
              {!answered && (
                <button
                  type="button"
                  className="um-btn-primary"
                  onClick={() => submit(item.item_number)}
                  disabled={!choice || pending[item.item_number]}
                  style={{
                    padding: '13px 30px',
                    borderRadius: '11px',
                    border: 'none',
                    // Ink on the quiz, Sunset on practice. The redesign rations
                    // Sunset to one action per screen and the quiz is meant to
                    // be the quiet surface; four orange buttons down a scored
                    // page is the opposite of a register shift. The lip goes
                    // with it: it is the affordance that makes Sunset read as
                    // pressable, and it belongs to that colour.
                    background: choice ? (quiet ? T.ink : T.cta) : T.hairline,
                    boxShadow: choice && !quiet ? `0 2px 0 ${T.ctaShadow}` : 'none',
                    font: `600 15px ${FONT_BODY}`,
                    color: choice ? (quiet ? T.panel : T.ink) : T.disabled,
                    cursor: choice ? 'pointer' : 'not-allowed',
                  }}
                >
                  {pending[item.item_number] ? 'Checking…' : 'Check answer'}
                </button>
              )}

              {solution &&
                (solutionsPaused ? (
                  // Struck through in place rather than removed: the student
                  // should see that it is paused, not wonder where it went.
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      font: `400 12.5px ${FONT_BODY}`,
                      color: T.disabled,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: '13px',
                        height: '13px',
                        borderRadius: '4px',
                        background: T.hairline,
                      }}
                    />
                    <span style={{ textDecoration: 'line-through' }}>Reveal worked solution</span>
                    <span style={{ color: T.disabled }}>paused while we talk</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="um-link"
                    aria-expanded={solutionOpen}
                    onClick={() =>
                      setOpenSolutions((o) => ({
                        ...o,
                        [item.item_number]: !o[item.item_number],
                      }))
                    }
                    style={{
                      padding: 0,
                      border: 'none',
                      background: 'none',
                      font: `400 13.5px ${FONT_BODY}`,
                      color: T.link,
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    {solutionOpen ? 'Hide worked solution' : 'Reveal worked solution'}
                  </button>
                ))}
            </div>

            {solutionOpen && solution && (
              <div
                className="um-prose"
                style={{
                  background: T.quietBox,
                  borderRadius: '12px',
                  padding: '16px 18px',
                  boxShadow: `inset 3px 0 0 ${T.answerKey}`,
                  color: T.ink2,
                  font: `400 15px ${FONT_BODY}`,
                  lineHeight: MATH_LINE_HEIGHT,
                }}
                dangerouslySetInnerHTML={{ __html: solution }}
              />
            )}

            {/* Announced to screen readers, since the result appears well
                after the button that caused it. A correct answer is carried
                visually by the chip in the header, so the line itself only
                shows when it has something the chip does not. */}
            <div role="status" aria-live="polite">
              {answered && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <p
                    className={result.isCorrect ? 'um-visually-hidden' : undefined}
                    style={{
                      margin: 0,
                      font: `500 14.5px ${FONT_BODY}`,
                      lineHeight: 1.6,
                      color: T.missed,
                    }}
                  >
                    {result.isCorrect
                      ? 'Correct'
                      : knownAnswer
                        ? `Not quite. The answer is ${knownAnswer}.`
                        : 'Not quite. Let’s figure out where it went sideways.'}
                  </p>
                  {!result.isCorrect && (
                    <button
                      type="button"
                      className="um-link"
                      onClick={() => retry(item.item_number)}
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'none',
                        font: `500 13.5px ${FONT_BODY}`,
                        color: T.link,
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      Try this one again
                    </button>
                  )}
                </div>
              )}
              {error && (
                <p
                  style={{
                    margin: 0,
                    font: `400 14px ${FONT_BODY}`,
                    lineHeight: 1.6,
                    color: T.missed,
                  }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* Offered only where the server said so: a wrong answer from an
                authenticated student. Anonymous users get the answer inline
                and never see this. */}
            {answered && result.gumu_available && (
              <GumuChat
                courseId={courseId}
                topicId={topicId}
                section={section}
                itemNumber={item.item_number}
                selectedAnswer={choice}
                onSessionChange={(active) => handleSessionChange(item.item_number, active)}
                onRevealAnswer={(correct) =>
                  setRevealed((r) => ({ ...r, [item.item_number]: correct }))
                }
              />
            )}
          </fieldset>
        );
      })}

      {/* Movement between problems.
          
          Deliberately NOT gated on having answered: practice is a workshop, and
          a student who wants to look ahead or go back to one they got wrong
          should be able to. The mastery gate on Next-to-the-quiz is the only
          thing that holds anyone anywhere, and it is unchanged. */}
      {paged && items.length > 1 && (
        <nav
          aria-label="Practice problems"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap',
            paddingTop: '2px',
          }}
        >
          <button
            type="button"
            className="um-btn-outline um-practice-prev"
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            style={{
              padding: '10px 18px',
              borderRadius: '11px',
              border: 'none',
              background: 'none',
              boxShadow: hairline(current === 0 ? T.hairline : T.hairline),
              font: `500 13.5px ${FONT_BODY}`,
              color: current === 0 ? T.disabled : T.ink2,
              cursor: current === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            &larr; Previous
          </button>

          <span style={{ ...EYEBROW, color: T.muted }}>
            {current + 1} / {items.length}
          </span>

          <div style={{ flex: 1 }} />

          <button
            type="button"
            className="um-btn-outline um-practice-next"
            onClick={() => goTo(current + 1)}
            disabled={current === items.length - 1}
            style={{
              padding: '10px 18px',
              borderRadius: '11px',
              border: 'none',
              background: 'none',
              boxShadow: hairline(current === items.length - 1 ? T.hairline : T.hairline),
              font: `500 13.5px ${FONT_BODY}`,
              color: current === items.length - 1 ? T.disabled : T.ink2,
              cursor: current === items.length - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Next problem &rarr;
          </button>
        </nav>
      )}

      {/* Closes out the quiz. Sits after the questions rather than replacing
          them, so a student can read the summary and scroll back to the
          question it names without losing either. */}
      {showFinish && lessonHref && (
        <QuizFinish
          outcome={outcome}
          items={items}
          results={results}
          lessonHref={lessonHref}
          hasSolutions={Boolean(solutions && Object.keys(solutions).length > 0)}
        />
      )}
    </div>
  );
}
