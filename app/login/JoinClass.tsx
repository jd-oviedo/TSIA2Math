'use client';

import { useState } from 'react';
import { L, FONT_DISPLAY, FONT_MONO, DISPLAY_WEIGHT } from './login-theme';
import { checkJoinCode, CODE_LENGTH } from '../lib/join-code';
import { t, type CopyKey } from './copy';
import type { Lang } from './use-login-lang';

// The optional join-a-class step on the student sign-in screen.
//
// NOT IN THE IMPORT. Options 1a and 1d contain no join UI of any kind, so this
// is built from the design's primitives -- squared, 1px rules, monospace labels
// -- rather than copied from it.
//
// THE ORDER MATTERS: check the code, SHOW WHAT THEY ARE JOINING, then sign in.
// A student handing over a Google account should already know whose class they
// are about to appear in.
//
// The lookup writes nothing. It answers a question and sets an httpOnly cookie;
// the enrolment happens in app/auth/callback after authentication, from that
// cookie, re-validated. Nothing typed here is trusted past the answer.

type Phase = 'idle' | 'checking' | 'error' | 'confirmed';

interface Confirmed {
  className: string;
  teacherName: string | null;
}

// The server's failure reasons, mapped to copy. Kept exhaustive by the compiler:
// a new reason in the route without a string here is a type error, not a blank
// message.
const REASON_COPY: Record<string, CopyKey> = {
  'not-found': 'errNotFound',
  invalid: 'errInvalid',
  'rate-limited': 'errRateLimited',
  unavailable: 'errUnavailable',
};

export function JoinClass({
  lang,
  onConfirmedChange,
}: {
  lang: Lang;
  /** Told when a class is confirmed, so the sign-in button can flag the intent. */
  onConfirmedChange: (confirmed: boolean) => void;
}) {
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorKey, setErrorKey] = useState<CopyKey>('errNotFound');
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  // A courtesy only, and it says so. The authoritative check is the same
  // function running server-side in /api/enroll/lookup, and then again in the
  // callback after authentication.
  const ready = checkJoinCode(code).ok;

  async function check() {
    if (!ready) return;
    setPhase('checking');
    try {
      const res = await fetch('/api/enroll/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        setConfirmed({ className: String(data.className), teacherName: data.teacherName ?? null });
        setPhase('confirmed');
        onConfirmedChange(true);
        return;
      }
      // An unrecognised reason still gets a sentence rather than a blank box.
      setErrorKey(REASON_COPY[data?.reason as string] ?? 'errUnavailable');
      setPhase('error');
      onConfirmedChange(false);
    } catch {
      // Offline, DNS, a dropped connection. Distinct from a refusal: nothing was
      // learned about the code, so the copy must not imply the code is wrong.
      setErrorKey('errNetwork');
      setPhase('error');
      onConfirmedChange(false);
    }
  }

  function reset() {
    setCode('');
    setConfirmed(null);
    setPhase('idle');
    onConfirmedChange(false);
  }

  if (phase === 'confirmed' && confirmed) {
    return (
      <section
        style={{
          border: `1px solid ${L.border}`,
          background: L.tintAmber,
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <span
          style={{
            font: `400 11px/1 ${FONT_MONO}`,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: L.amber,
          }}
        >
          {t(lang, 'joinConfirmEyebrow')}
        </span>
        <strong style={{ font: `${DISPLAY_WEIGHT} 18px/1.25 ${FONT_DISPLAY}`, color: L.ink }}>
          {confirmed.className}
        </strong>
        {confirmed.teacherName && (
          <span style={{ font: `400 13px/1.5 ${FONT_DISPLAY}`, color: L.ink2 }}>
            {t(lang, 'joinTaughtBy')} {confirmed.teacherName}
          </span>
        )}
        <span style={{ font: `400 13px/1.5 ${FONT_DISPLAY}`, color: L.ink2 }}>
          {t(lang, 'joinThenSignIn')}
        </span>
        <button
          type="button"
          onClick={reset}
          className="uml-oncard"
          style={{
            alignSelf: 'flex-start',
            marginTop: 2,
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            font: `400 12px/1 ${FONT_MONO}`,
            letterSpacing: '0.06em',
            color: L.amber,
            textDecoration: 'underline',
          }}
        >
          {t(lang, 'joinChange')}
        </button>
      </section>
    );
  }

  return (
    <section
      style={{
        border: `1px solid ${L.border}`,
        background: L.card,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <strong style={{ font: `${DISPLAY_WEIGHT} 15px/1.2 ${FONT_DISPLAY}`, color: L.ink }}>
          {t(lang, 'joinHeading')}
        </strong>
        <span
          style={{
            font: `400 10px/1 ${FONT_MONO}`,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: L.inkMono,
            border: `1px solid ${L.toggleOffLine}`,
            padding: '4px 7px',
          }}
        >
          {t(lang, 'joinOptional')}
        </span>
      </div>

      <p style={{ margin: 0, font: `400 13px/1.6 ${FONT_DISPLAY}`, color: L.ink2 }}>
        {t(lang, 'joinBlurb')}
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <label htmlFor="uml-join" className="uml-hidden">
          {t(lang, 'joinLabel')}
        </label>
        <input
          id="uml-join"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().slice(0, CODE_LENGTH));
            if (phase === 'error') setPhase('idle');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              check();
            }
          }}
          placeholder={t(lang, 'joinPlaceholder')}
          maxLength={CODE_LENGTH}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          // 16px, deliberately: anything smaller makes iOS Safari zoom the
          // viewport on focus, which on a 375px screen throws the layout.
          style={{
            flex: '1 1 150px',
            minWidth: 0,
            padding: '11px 13px',
            boxSizing: 'border-box',
            border: `1px solid ${L.border}`,
            background: L.card,
            color: L.ink,
            font: `700 16px/1 ${FONT_MONO}`,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={check}
          disabled={!ready || phase === 'checking'}
          className={ready && phase !== 'checking' ? 'uml-lift uml-oncard' : 'uml-oncard'}
          style={{
            padding: '11px 18px',
            border: `1px solid ${ready ? L.border : L.disabledLine}`,
            background: ready ? L.cta : L.disabled,
            color: ready ? L.ctaInk : L.disabledInk,
            font: `700 14px/1 ${FONT_DISPLAY}`,
            cursor: ready && phase !== 'checking' ? 'pointer' : 'not-allowed',
          }}
        >
          {phase === 'checking' ? t(lang, 'joinChecking') : t(lang, 'joinCheck')}
        </button>
      </div>

      {/* aria-live so a screen reader hears the refusal without moving focus. */}
      <div role="status" aria-live="polite">
        {phase === 'error' && (
          <p
            style={{
              margin: 0,
              font: `400 13px/1.5 ${FONT_DISPLAY}`,
              color: L.error,
              borderLeft: `2px solid ${L.error}`,
              paddingLeft: 10,
            }}
          >
            {t(lang, errorKey)}
          </p>
        )}
      </div>
    </section>
  );
}
