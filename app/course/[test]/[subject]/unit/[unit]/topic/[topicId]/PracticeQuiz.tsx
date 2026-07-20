'use client';

import { useCallback, useState } from 'react';
import GumuChat from './GumuChat';
import { useGumuGate } from './GumuGate';

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

const COLORS = {
  ink: '#1A1A1A',
  navy: '#0F1E35',
  muted: '#5F5E5A',
  border: '#D8D6D1',
  correctBg: '#E8F5EC',
  correctFg: '#1B6E3C',
  wrongBg: '#FDECEC',
  wrongFg: '#A32020',
  selectedBg: '#EDF2FA',
};

export default function PracticeQuiz({ courseId, topicId, section, items }: Props) {
  // Keyed by item_number rather than array index so the maps stay correct
  // regardless of how the items are ordered or filtered.
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, Result>>({});
  const [pending, setPending] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  // Filled in only when GUMU's escape hatch hands the answer back.
  const [revealed, setRevealed] = useState<Record<number, string>>({});

  const { setItemActive } = useGumuGate();

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

  return (
    <div>
      {items.map((item) => {
        const result = results[item.item_number];
        const answered = Boolean(result);
        const choice = selected[item.item_number];
        const error = errors[item.item_number];
        // The known correct answer, from whichever source has it: the grading
        // response when GUMU is not involved, or the escape hatch when it is.
        const knownAnswer = result?.correct_answer ?? revealed[item.item_number] ?? null;

        return (
          <fieldset
            key={item.item_number}
            style={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              minWidth: 0,
            }}
          >
            <legend style={{ padding: '0 0.5rem', color: COLORS.muted, fontSize: '14px' }}>
              Question {item.item_number}
              {item.level ? ` · ${item.level}` : ''}
            </legend>

            <div
              style={{ color: COLORS.ink, fontSize: '16px', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: item.stem_html }}
            />

            <div style={{ marginTop: '1rem' }}>
              {LETTERS.filter((l) => item.choices_html[l] !== undefined).map((letter) => {
                const isChoice = choice === letter;
                // Once answered, mark the right option and the student's own
                // wrong one. Other options stay neutral.
                const isAnswer = answered && knownAnswer === letter;
                const isWrongPick = answered && isChoice && !result.isCorrect;

                let background = 'transparent';
                if (isAnswer) background = COLORS.correctBg;
                else if (isWrongPick) background = COLORS.wrongBg;
                else if (isChoice && !answered) background = COLORS.selectedBg;

                return (
                  <label
                    key={letter}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.6rem 0.75rem',
                      marginBottom: '0.4rem',
                      borderRadius: '6px',
                      background,
                      cursor: answered ? 'default' : 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name={`${section}-${item.item_number}`}
                      value={letter}
                      checked={isChoice}
                      disabled={answered}
                      onChange={() =>
                        setSelected((s) => ({ ...s, [item.item_number]: letter }))
                      }
                      style={{ marginTop: '0.35rem' }}
                    />
                    <span style={{ fontWeight: 600, color: COLORS.navy }}>{letter})</span>
                    <span
                      style={{ color: COLORS.ink }}
                      dangerouslySetInnerHTML={{ __html: item.choices_html[letter] }}
                    />
                  </label>
                );
              })}
            </div>

            {!answered && (
              <button
                type="button"
                onClick={() => submit(item.item_number)}
                disabled={!choice || pending[item.item_number]}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: choice ? COLORS.navy : COLORS.border,
                  color: choice ? '#FFFFFF' : COLORS.muted,
                  fontSize: '15px',
                  cursor: choice ? 'pointer' : 'not-allowed',
                }}
              >
                {pending[item.item_number] ? 'Checking…' : 'Check answer'}
              </button>
            )}

            {/* Announced to screen readers, since the result appears well
                after the button that caused it. */}
            <div role="status" aria-live="polite">
              {answered && (
                <p
                  style={{
                    marginTop: '0.75rem',
                    marginBottom: 0,
                    fontWeight: 600,
                    color: result.isCorrect ? COLORS.correctFg : COLORS.wrongFg,
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
                <p style={{ marginTop: '0.75rem', marginBottom: 0, color: COLORS.wrongFg }}>
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
