'use client';

import { useState } from 'react';
import GumuAvatar from './GumuAvatar';
import { C, ink, MATH_LINE_HEIGHT, INK_MUTED } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';

// GUMU's chat panel. Inline expansion under the item, not a modal, matching
// the existing reveal-panel pattern -- and matching the design import's rule
// that GUMU is a sidecar: the question stays on screen and he docks beneath it,
// so the student can still see what they got wrong while they talk.
//
// The panel never receives the correct answer or the misconception tag. The
// only way an answer reaches this component is the escape hatch, which returns
// it deliberately.

type Message = { role: 'student' | 'gumu'; content: string };

type Props = {
  courseId: string;
  topicId: string;
  section: 'practice' | 'mini_quiz';
  itemNumber: number;
  selectedAnswer: string;
  // Lets the page gate the answer key while any session is live.
  onSessionChange: (active: boolean) => void;
  // Fires when the escape hatch returns the answer, so the item can show it.
  onRevealAnswer: (correctAnswer: string) => void;
};

// Matches MAX_STUDENT_TURNS on the server. Held as a fallback only: the start
// response reports the real cap, and that is what the dots below count. Reading
// the server constant directly would pull app/lib/gumu -- and the Anthropic SDK
// with it -- into the browser bundle.
const DEFAULT_TURNS = 3;

export default function GumuChat({
  courseId,
  topicId,
  section,
  itemNumber,
  selectedAnswer,
  onSessionChange,
  onRevealAnswer,
}: Props) {
  const [started, setStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [turnsRemaining, setTurnsRemaining] = useState<number | null>(null);
  const [totalTurns, setTotalTurns] = useState(DEFAULT_TURNS);
  const [finished, setFinished] = useState(false);
  // Set once the escape hatch has handed the answer back, so the panel stops
  // offering a button that would only fetch the same answer again.
  const [answerShown, setAnswerShown] = useState(false);

  // The escape hatch steps up from a quiet text link to a real button once the
  // student is on their last turn, or once the session has ended and it is the
  // only way left to see the answer. Null (before the first reply lands) keeps
  // it quiet.
  const escapeProminent = finished || (turnsRemaining !== null && turnsRemaining <= 1);

  // Which exchange they are in, counting the one on screen. Fills the dots in
  // the panel header and the "2 of 3 exchanges" line under it.
  const exchange =
    turnsRemaining === null
      ? 1
      : Math.min(totalTurns, totalTurns - turnsRemaining + (finished ? 0 : 1));

  async function post(body: Record<string, unknown>) {
    const res = await fetch('/api/gumu/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? 'Something went wrong.');
    return data;
  }

  async function start() {
    setPending(true);
    setError('');
    try {
      const data = await post({
        action: 'start',
        course_id: courseId,
        topic_id: topicId,
        section,
        item_number: itemNumber,
        selected_answer: selectedAnswer,
      });
      setStarted(true);
      setSessionId(data.session_id);
      onSessionChange(true);
      // A resumed session (double click, stale tab) returns its transcript
      // instead of a single opening message.
      setMessages(data.messages ?? [{ role: 'gumu', content: data.message }]);
      setTurnsRemaining(data.turns_remaining ?? null);
      // The opening response reports the full allowance, so this is the cap.
      if (typeof data.turns_remaining === 'number' && data.turns_remaining > 0) {
        setTotalTurns(data.turns_remaining);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach GUMU.');
    } finally {
      setPending(false);
    }
  }

  async function send() {
    const text = draft.trim();
    if (!text || !sessionId || pending) return;

    setMessages((m) => [...m, { role: 'student', content: text }]);
    setDraft('');
    setPending(true);
    setError('');

    try {
      const data = await post({ action: 'message', session_id: sessionId, message: text });
      setMessages((m) => [...m, { role: 'gumu', content: data.message }]);
      setTurnsRemaining(data.turns_remaining ?? null);
      if (data.status !== 'active') {
        setFinished(true);
        onSessionChange(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach GUMU.');
    } finally {
      setPending(false);
    }
  }

  async function reveal() {
    if (!sessionId || pending) return;
    setPending(true);
    setError('');
    try {
      const data = await post({ action: 'reveal', session_id: sessionId });
      setFinished(true);
      setAnswerShown(true);
      onSessionChange(false);
      if (data.correct_answer) onRevealAnswer(data.correct_answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach GUMU.');
    } finally {
      setPending(false);
    }
  }

  if (!started) {
    return (
      <div style={{ marginTop: '18px' }}>
        <button
          type="button"
          className="um-btn-primary"
          onClick={start}
          disabled={pending}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 20px 10px 12px',
            borderRadius: '11px',
            border: 'none',
            background: C.sunset,
            boxShadow: `0 2px 0 ${C.sunsetShadow}`,
            font: `600 15px ${FONT_BODY}`,
            color: C.midnight,
            cursor: pending ? 'wait' : 'pointer',
          }}
        >
          {/* Plated: on the Sunset Orange button his collar is the same orange,
              and bare he smears into it. */}
          <GumuAvatar size={30} plate title="" />
          {pending ? 'Starting…' : 'Work through it with GUMU'}
        </button>
        {error && <ErrorLine text={error} />}
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: '18px',
        background: C.gumuSurface,
        borderRadius: '16px',
        padding: '18px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
      }}
    >
      {/* Who is talking, and how much runway is left. The dots carry the same
          count as the line under the input, one glanceable and one literal. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
        <GumuAvatar size={48} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ font: `600 15px ${FONT_HEADING}`, color: C.midnight }}>GUMU</div>
          <div style={{ font: `400 12px ${FONT_BODY}`, color: INK_MUTED }}>
            {finished ? 'that one is wrapped up' : 'let’s figure out where it slipped'}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }} aria-hidden="true">
          {Array.from({ length: totalTurns }, (_, i) => (
            <span
              key={i}
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: i < (finished ? totalTurns : exchange) ? C.gemini : ink(0.15),
              }}
            />
          ))}
        </div>
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation with GUMU"
        style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={
              m.role === 'gumu'
                ? {
                    alignSelf: 'flex-start',
                    maxWidth: '86%',
                    background: C.paper,
                    borderRadius: '16px 16px 16px 5px',
                    padding: '14px 17px',
                    font: `400 15.5px ${FONT_BODY}`,
                    lineHeight: MATH_LINE_HEIGHT,
                    color: C.midnight,
                    boxShadow: '0 1px 3px rgba(14,14,17,.06)',
                    minHeight: '24px',
                  }
                : {
                    alignSelf: 'flex-end',
                    maxWidth: '78%',
                    background: C.sky,
                    borderRadius: '16px 16px 5px 16px',
                    padding: '13px 17px',
                    font: `400 15.5px ${FONT_BODY}`,
                    lineHeight: 1.7,
                    color: C.midnight,
                    minHeight: '22px',
                  }
            }
          >
            {m.content}
          </div>
        ))}
        {pending && (
          <div style={{ font: `400 13.5px ${FONT_BODY}`, color: INK_MUTED }}>
            GUMU is thinking…
          </div>
        )}
      </div>

      {!finished && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: C.paper,
            borderRadius: '13px',
            padding: '10px 11px',
            boxShadow: 'inset 0 0 0 1.5px rgba(110,157,200,.35)',
          }}
        >
          <label htmlFor={`gumu-input-${section}-${itemNumber}`} style={{ display: 'none' }}>
            Your reply to GUMU
          </label>
          <input
            id={`gumu-input-${section}-${itemNumber}`}
            className="um-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={pending}
            placeholder="Type what you’re thinking…"
            style={{
              flex: 1,
              minWidth: 0,
              padding: '4px 4px',
              border: 'none',
              background: 'transparent',
              font: `400 15.5px ${FONT_BODY}`,
              color: C.midnight,
            }}
          />
          <button
            type="submit"
            className="um-send"
            disabled={pending || !draft.trim()}
            aria-label="Send"
            style={{
              width: '34px',
              height: '34px',
              flex: 'none',
              borderRadius: '9px',
              border: 'none',
              background: draft.trim() ? C.sky : ink(0.08),
              color: draft.trim() ? C.midnight : ink(0.35),
              font: `600 15px ${FONT_BODY}`,
              cursor: draft.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            →
          </button>
        </form>
      )}

      {/* Never blocked and never hidden, but deliberately quiet early on: plain
          underlined text while the student still has turns left, an outlined
          button once they are on the last one or the session has ended. Giving
          up should always be possible, just not the obvious first move.

          The design pairs the promoted version with a primary "try the question
          again". There is no retry in the grading flow -- an answered item is
          final -- so it stands alone rather than under a button that would not
          do anything. */}
      {answerShown ? (
        <div
          style={{
            font: `400 12px ${FONT_BODY}`,
            lineHeight: 1.5,
            color: INK_MUTED,
            textAlign: 'center',
          }}
        >
          The answer is marked on the question above. We&apos;ll keep going after.
        </div>
      ) : escapeProminent ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          <button
            type="button"
            className="um-btn-outline"
            onClick={reveal}
            disabled={pending}
            style={{
              padding: '13px',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              boxShadow: `inset 0 0 0 1.5px ${ink(0.22)}`,
              font: `500 14.5px ${FONT_BODY}`,
              color: ink(0.65),
              cursor: pending ? 'wait' : 'pointer',
            }}
          >
            Show me the worked answer
          </button>
          <div
            style={{
              font: `400 11.5px ${FONT_BODY}`,
              lineHeight: 1.5,
              color: INK_MUTED,
              textAlign: 'center',
            }}
          >
            {finished
              ? 'Either way this one’s done. We’ll keep going after.'
              : 'Last exchange on this one.'}
          </div>
        </div>
      ) : (
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
        >
          <button
            type="button"
            className="um-link"
            onClick={reveal}
            disabled={pending}
            style={{
              padding: 0,
              border: 'none',
              background: 'none',
              font: `400 12px ${FONT_BODY}`,
              color: ink(0.32),
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              cursor: pending ? 'wait' : 'pointer',
            }}
          >
            I’ll just see the answer
          </button>
          {turnsRemaining !== null && (
            <span style={{ font: `400 11.5px ${FONT_BODY}`, color: ink(0.32) }}>
              {exchange} of {totalTurns} exchanges
            </span>
          )}
        </div>
      )}

      {error && <ErrorLine text={error} />}
    </div>
  );
}

function ErrorLine({ text }: { text: string }) {
  return (
    <p
      style={{
        margin: '8px 0 0',
        font: `400 13.5px ${FONT_BODY}`,
        lineHeight: 1.6,
        color: C.amber,
      }}
    >
      {text}
    </p>
  );
}
