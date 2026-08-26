'use client';

import { useState } from 'react';
import GumuAvatar from './GumuAvatar';
import { C, onDark, RADIUS, hairline, MATH_LINE_HEIGHT } from '@/app/components/curriculum-theme';
import { T } from '@/app/components/curriculum-surface';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';
// Type only, and free: app/lib/crisis.ts has no imports at all, so nothing is
// pulled into the browser bundle. The copy itself arrives from the server in the
// response rather than being duplicated here, so the counselor's version needs
// no client change.
import type { CrisisResource } from '@/app/lib/crisis';

// GUMU's chat panel. Inline expansion under the item, not a modal, matching
// the existing reveal-panel pattern -- and matching the design import's rule
// that GUMU is a sidecar: the question stays on screen and he docks beneath it,
// so the student can still see what they got wrong while they talk.
//
// The panel never receives the correct answer or the misconception tag. The
// only way an answer reaches this component is the escape hatch, which returns
// it deliberately.

type Message = { role: 'student' | 'gumu'; content: string };

type CrisisCopy = {
  opening: string;
  explanation: string;
  resources: CrisisResource[];
  trusted: string;
  closing: string;
};

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
  // Local, non-persistent, and only ever read in the pre-session branch. Nothing
  // stores it: a fresh mount offers the panel again.
  const [dismissed, setDismissed] = useState(false);
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
  // Set when the crisis screen stopped this session. Terminal: the panel below
  // returns early and the tutor UI is not rendered at all.
  const [support, setSupport] = useState<CrisisCopy | null>(null);

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

      // Branched BEFORE the append below, which is unconditional. Without this
      // the crisis copy would render as a GUMU chat bubble, in GUMU's voice, as
      // another turn in a conversation that has ended.
      if (data.stopped === 'support') {
        setSupport(data.copy as CrisisCopy);
        setFinished(true);
        onSessionChange(false);
        return;
      }

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

  // THE REMEDIATION PANEL, and it is presentational.
  //
  // It replaces a bare Sunset Orange button. GUMU is introduced on the dark
  // surface he owns, says what he is offering, and gives a way to decline --
  // which the button did not: the only way to refuse was to ignore it.
  //
  // THE OPENING LINE IS STATIC COPY, NOT A MESSAGE FROM GUMU. The design writes
  // a real diagnosis here ("That is trap 1."), and the only way to produce one
  // is start(), which INSERTS a gumu_sessions row with status 'active'. Doing
  // that before the student has agreed would open a session nobody consented to,
  // write a row for every miss whether or not anyone engaged, and need a fourth
  // `resolution` value for "opened, never entered" -- which the CHECK constraint
  // in sql/gumu_sessions_resolution.sql forbids on purpose. Nothing here calls
  // start() until the student presses the button.
  //
  // "Not now" IS PRE-SESSION ONLY, and that is load-bearing rather than tidy.
  // It is local state and dismisses nothing but this panel. A dismiss reachable
  // once a session is OPEN would unmount GumuChat while the provider still
  // counts it -- solutionsPaused stuck true for the rest of the page load with
  // nothing on screen to close, which is exactly the bug #140 fixed for page
  // turns. The path back is unchanged: "Try this one again" clears the result,
  // this component unmounts, and answering wrong again brings it back fresh.
  if (!started) {
    if (dismissed) return null;

    return (
      <div
        className="um-gumu-panel"
        style={{
          marginTop: '18px',
          display: 'flex',
          gap: '16px',
          padding: '18px 20px',
          borderRadius: RADIUS,
          background: C.gumuBanner,
        }}
      >
        <GumuAvatar size={44} title="" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ font: `600 15px ${FONT_HEADING}`, color: C.sand }}>
            Let&apos;s figure out where it slipped.
          </div>
          <div
            style={{
              maxWidth: '460px',
              font: `400 13.5px ${FONT_BODY}`,
              lineHeight: 1.6,
              color: onDark(0.6),
            }}
          >
            I&apos;ll take you through it a step at a time rather than just handing over the
            answer. Stop whenever you like.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="um-gumu-start"
              onClick={start}
              disabled={pending}
              style={{
                minHeight: 44,
                padding: '0 18px',
                borderRadius: RADIUS,
                border: 'none',
                background: 'transparent',
                boxShadow: hairline(onDark(0.28)),
                font: `500 13px ${FONT_BODY}`,
                color: C.sand,
                cursor: pending ? 'wait' : 'pointer',
              }}
            >
              {pending ? 'Starting…' : 'Talk it through'}
            </button>
            <button
              type="button"
              className="um-gumu-dismiss"
              onClick={() => setDismissed(true)}
              style={{
                minHeight: 44,
                padding: '0 8px',
                border: 'none',
                background: 'none',
                font: `400 13px ${FONT_BODY}`,
                color: onDark(0.5),
                cursor: 'pointer',
              }}
            >
              Not now
            </button>
          </div>
          {error && <ErrorLine text={error} />}
        </div>
      </div>
    );
  }

  // The whole panel is replaced, not added to. No avatar, no turn dots, no
  // transcript, and no "I'll just see the answer" link: GUMU has stopped, and
  // leaving any of his furniture on screen would say otherwise. The composer is
  // gone with it, so there is nothing to type into, which is deliberate. The
  // copy asks no question for the same reason.
  if (support) {
    return <SupportCard copy={support} />;
  }

  return (
    <div
      style={{
        marginTop: '18px',
        background: T.insetRow,
        borderRadius: 0,
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
          <div style={{ font: `600 15px ${FONT_HEADING}`, color: T.ink }}>mu</div>
          <div style={{ font: `400 12px ${FONT_BODY}`, color: T.muted }}>
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
                background: i < (finished ? totalTurns : exchange) ? C.gemini : T.track,
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
                    background: T.panel,
                    borderRadius: '16px 16px 16px 5px',
                    padding: '14px 17px',
                    font: `400 15.5px ${FONT_BODY}`,
                    lineHeight: MATH_LINE_HEIGHT,
                    color: T.ink,
                    boxShadow: '0 1px 3px rgba(14,14,17,.06)',
                    minHeight: '24px',
                  }
                : {
                    alignSelf: 'flex-end',
                    maxWidth: '78%',
                    background: T.tutorAccent,
                    borderRadius: '16px 16px 5px 16px',
                    padding: '13px 17px',
                    font: `400 15.5px ${FONT_BODY}`,
                    lineHeight: 1.7,
                    color: T.ctaInk,
                    minHeight: '22px',
                  }
            }
          >
            {m.content}
          </div>
        ))}
        {pending && (
          <div style={{ font: `400 13.5px ${FONT_BODY}`, color: T.muted }}>
            mu is thinking…
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
            background: T.panel,
            borderRadius: 0,
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
              color: T.ink,
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
              borderRadius: 0,
              border: 'none',
              background: draft.trim() ? T.tutorAccent : T.track,
              color: draft.trim() ? T.ctaInk : T.disabled,
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
            color: T.muted,
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
              borderRadius: 0,
              border: 'none',
              background: 'transparent',
              boxShadow: `inset 0 0 0 1.5px ${T.controlBorder}`,
              font: `500 14.5px ${FONT_BODY}`,
              color: T.ink2,
              cursor: pending ? 'wait' : 'pointer',
            }}
          >
            Show me the worked answer
          </button>
          <div
            style={{
              font: `400 11.5px ${FONT_BODY}`,
              lineHeight: 1.5,
              color: T.muted,
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
              color: T.disabled,
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              cursor: pending ? 'wait' : 'pointer',
            }}
          >
            I’ll just see the answer
          </button>
          {turnsRemaining !== null && (
            <span style={{ font: `400 11.5px ${FONT_BODY}`, color: T.disabled }}>
              {exchange} of {totalTurns} exchanges
            </span>
          )}
        </div>
      )}

      {error && <ErrorLine text={error} />}
    </div>
  );
}

// Shown when the crisis screen has stopped a session.
//
// Calm on purpose: paper rather than the amber used for errors, normal weights,
// no icon, no alarm. A student who typed "this problem is killing me" should be
// able to read this and shrug, and a student who meant it should be able to read
// it and feel seen. The same sentences have to do both, because the classifier
// will sometimes be wrong.
//
// The numbers are real anchors, not click handlers, so they work before
// hydration and can be long-pressed and copied. tel: and sms: open the dialer
// and the messaging app in one tap, which is where most students are. The HOME
// keyword is in the visible line as well as the sms body, because the body
// prefill is honoured by iOS and inconsistently by Android handsets, and the
// visible text is what actually guarantees a student can act.
function SupportCard({ copy }: { copy: CrisisCopy }) {
  return (
    <div
      role="region"
      aria-label="Support resources"
      // The transcript above was role="log" aria-live="polite", and this replaces
      // it wholesale. Without a live region here the swap is silent to a screen
      // reader: the conversation would simply stop, with no announcement that
      // anything took its place. Polite rather than assertive, matching the tone
      // of the copy. Moving focus here as well would be better still and is a
      // larger change than this one.
      aria-live="polite"
      style={{
        marginTop: '18px',
        background: T.panel,
        borderRadius: 0,
        padding: '22px 24px 24px',
        boxShadow: `inset 0 0 0 1.5px ${T.hairline}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <p style={{ margin: 0, font: `600 17px ${FONT_HEADING}`, lineHeight: 1.45, color: T.ink }}>
        {copy.opening}
      </p>

      <p style={{ margin: 0, font: `400 15px ${FONT_BODY}`, lineHeight: 1.65, color: T.ink2 }}>
        {copy.explanation}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {copy.resources.map((resource) => (
          <div
            key={resource.line}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
              padding: '15px 17px',
              borderRadius: 0,
              background: T.insetRow,
            }}
          >
            <div>
              <div style={{ font: `600 15px ${FONT_BODY}`, lineHeight: 1.4, color: T.ink }}>
                {resource.line}
              </div>
              <div style={{ font: `400 13px ${FONT_BODY}`, lineHeight: 1.5, color: T.muted }}>
                {resource.org}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
              {resource.actions.map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: 44,
                    padding: '0 18px',
                    borderRadius: 0,
                    background: T.ink,
                    color: T.panel,
                    font: `600 14.5px ${FONT_BODY}`,
                    textDecoration: 'none',
                  }}
                >
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p style={{ margin: 0, font: `400 15px ${FONT_BODY}`, lineHeight: 1.65, color: T.ink2 }}>
        {copy.trusted}
      </p>

      <p style={{ margin: 0, font: `400 13.5px ${FONT_BODY}`, lineHeight: 1.6, color: T.muted }}>
        {copy.closing}
      </p>
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
        color: T.error,
      }}
    >
      {text}
    </p>
  );
}
