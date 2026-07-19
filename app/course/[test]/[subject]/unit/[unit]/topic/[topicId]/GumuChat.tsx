'use client';

import { useState } from 'react';

// GUMU's chat panel. Inline expansion under the item, not a modal, matching
// the existing reveal-panel pattern.
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

const COLORS = {
  ink: '#1A1A1A',
  navy: '#0F1E35',
  muted: '#5F5E5A',
  border: '#D8D6D1',
  gumuBg: '#EDF2FA',
  studentBg: '#F4F2ED',
  wrongFg: '#A32020',
};

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
  const [finished, setFinished] = useState(false);

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
      <div style={{ marginTop: '0.75rem' }}>
        <button
          type="button"
          onClick={start}
          disabled={pending}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '6px',
            border: `1px solid ${COLORS.navy}`,
            background: 'transparent',
            color: COLORS.navy,
            fontSize: '15px',
            cursor: pending ? 'wait' : 'pointer',
          }}
        >
          {pending ? 'Starting…' : 'Work through it with GUMU'}
        </button>
        {error && (
          <p style={{ marginTop: '0.5rem', marginBottom: 0, color: COLORS.wrongFg }}>{error}</p>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: '0.75rem',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '8px',
        padding: '1rem',
        background: '#FFFFFF',
      }}
    >
      <div role="log" aria-live="polite" aria-label="Conversation with GUMU">
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.role === 'gumu' ? 'flex-start' : 'flex-end',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '0.6rem 0.85rem',
                borderRadius: '10px',
                background: m.role === 'gumu' ? COLORS.gumuBg : COLORS.studentBg,
                color: COLORS.ink,
                fontSize: '15px',
                lineHeight: 1.6,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {pending && (
          <p style={{ color: COLORS.muted, fontSize: '14px', margin: '0.25rem 0' }}>GUMU is thinking…</p>
        )}
      </div>

      {!finished && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}
        >
          <label htmlFor={`gumu-input-${section}-${itemNumber}`} style={{ display: 'none' }}>
            Your reply to GUMU
          </label>
          <input
            id={`gumu-input-${section}-${itemNumber}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={pending}
            placeholder="Explain what you tried…"
            style={{
              flex: 1,
              minWidth: 0,
              padding: '0.55rem 0.75rem',
              borderRadius: '6px',
              border: `1px solid ${COLORS.border}`,
              fontSize: '15px',
            }}
          />
          <button
            type="submit"
            disabled={pending || !draft.trim()}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: draft.trim() ? COLORS.navy : COLORS.border,
              color: draft.trim() ? '#FFFFFF' : COLORS.muted,
              fontSize: '15px',
              cursor: draft.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Send
          </button>
        </form>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '0.75rem',
        }}
      >
        {/* Always available, never blocked -- including after the session
            finishes, so a student can still get the answer afterwards. */}
        <button
          type="button"
          onClick={reveal}
          disabled={pending}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            border: `1px solid ${COLORS.border}`,
            background: 'transparent',
            color: COLORS.muted,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          I&apos;ll just see the answer
        </button>
        {turnsRemaining !== null && !finished && (
          <span style={{ color: COLORS.muted, fontSize: '13px' }}>
            {turnsRemaining} {turnsRemaining === 1 ? 'reply' : 'replies'} left with GUMU
          </span>
        )}
      </div>

      {error && (
        <p style={{ marginTop: '0.5rem', marginBottom: 0, color: COLORS.wrongFg }}>{error}</p>
      )}
    </div>
  );
}
