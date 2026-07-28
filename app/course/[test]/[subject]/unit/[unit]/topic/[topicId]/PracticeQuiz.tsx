'use client';

import { useCallback, useState } from 'react';
import GumuChat from './GumuChat';
import { useGumuGate } from './GumuGate';
import { C, ink, EYEBROW, MATH_LINE_HEIGHT } from '@/app/components/curriculum-theme';
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

export default function PracticeQuiz({
  courseId,
  topicId,
  section,
  items,
  heading,
  blurb,
  solutions,
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
    } catch {
      setErrors((e) => ({
        ...e,
        [itemNumber]: 'Could not reach the server. Check your connection.',
      }));
    } finally {
      setPending((p) => ({ ...p, [itemNumber]: false }));
    }
  }

  const answeredCount = Object.keys(results).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Section header. The pips are the only progress readout on the page,
          so they count answered items rather than visited ones. */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, font: `600 19px ${FONT_HEADING}`, color: C.midnight }}>{heading}</h2>
        <div style={{ font: `400 13px ${FONT_BODY}`, color: ink(0.45) }}>{blurb}</div>
        <div style={{ flex: 1 }} />
        <div
          style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}
          role="img"
          aria-label={`${answeredCount} of ${items.length} answered`}
        >
          {items.map((item, i) => (
            <span
              key={item.item_number}
              style={{
                width: '22px',
                height: '5px',
                borderRadius: '3px',
                background: i < answeredCount ? C.sunset : ink(0.13),
              }}
            />
          ))}
        </div>
      </div>

      {items.map((item, index) => {
        const result = results[item.item_number];
        const answered = Boolean(result);
        const choice = selected[item.item_number];
        const error = errors[item.item_number];
        // The known correct answer, from whichever source has it: the grading
        // response when GUMU is not involved, or the escape hatch when it is.
        const knownAnswer = result?.correct_answer ?? revealed[item.item_number] ?? null;
        const solution = solutions?.[item.item_number];
        const solutionOpen = Boolean(openSolutions[item.item_number]) && !solutionsPaused;

        return (
          <fieldset
            key={item.item_number}
            style={{
              margin: 0,
              padding: '24px 26px 22px',
              minWidth: 0,
              border: `1px solid ${ink(0.09)}`,
              borderRadius: '16px',
              background: C.paper,
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
              <span style={{ ...EYEBROW, color: ink(0.4) }}>
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
                    color: result.isCorrect ? C.green : C.amber,
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: result.isCorrect ? C.green : C.amber,
                    }}
                  />
                  {result.isCorrect ? 'Nailed it' : 'Not quite yet'}
                </span>
              ) : (
                <span style={{ font: `400 12.5px ${FONT_BODY}`, color: ink(0.4), flex: 'none' }}>
                  Multiple choice
                </span>
              )}
            </div>

            <div
              className="um-stem"
              style={{
                color: C.midnight,
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

                let background: string = C.sand;
                let ring: string = ink(0.08);
                let circleBg: string = C.paper;
                let circleRing: string = ink(0.14);
                let circleColor: string = ink(0.55);
                let caption: string | null = null;

                if (isAnswer) {
                  background = C.greenBg;
                  ring = C.greenLine;
                  circleBg = C.green;
                  circleRing = 'transparent';
                  circleColor = C.paper;
                  caption = 'the answer';
                } else if (isWrongPick) {
                  background = C.amberBg;
                  ring = C.amberLine;
                  circleBg = C.sunset;
                  circleRing = 'transparent';
                  circleColor = C.midnight;
                  caption = 'your answer';
                } else if (isSelectedPending) {
                  background = C.paper;
                  ring = C.sky;
                  circleBg = C.sky;
                  circleRing = 'transparent';
                  circleColor = C.midnight;
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
                        color: C.midnight,
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
                          color: ink(0.45),
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
                    background: choice ? C.sunset : ink(0.09),
                    boxShadow: choice ? `0 2px 0 ${C.sunsetShadow}` : 'none',
                    font: `600 15px ${FONT_BODY}`,
                    color: choice ? C.midnight : ink(0.4),
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
                      color: ink(0.3),
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: '13px',
                        height: '13px',
                        borderRadius: '4px',
                        background: ink(0.1),
                      }}
                    />
                    <span style={{ textDecoration: 'line-through' }}>Reveal worked solution</span>
                    <span style={{ color: ink(0.38) }}>paused while we talk</span>
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
                      color: C.gemini,
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
                  background: C.sand,
                  borderRadius: '12px',
                  padding: '16px 18px',
                  boxShadow: `inset 3px 0 0 ${C.violet}`,
                  color: ink(0.8),
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
                <p
                  className={result.isCorrect ? 'um-visually-hidden' : undefined}
                  style={{
                    margin: 0,
                    font: `500 14.5px ${FONT_BODY}`,
                    lineHeight: 1.6,
                    color: C.amber,
                  }}
                >
                  {result.isCorrect
                    ? 'Correct'
                    : knownAnswer
                      ? `Not quite. The answer is ${knownAnswer}.`
                      : 'Not quite. Let’s figure out where it went sideways.'}
                </p>
              )}
              {error && (
                <p
                  style={{
                    margin: 0,
                    font: `400 14px ${FONT_BODY}`,
                    lineHeight: 1.6,
                    color: C.amber,
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
    </div>
  );
}
