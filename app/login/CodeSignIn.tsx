'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { L, FONT_DISPLAY, FONT_MONO, DISPLAY_WEIGHT } from './login-theme';
import { submitCodeSignIn } from './code-sign-in';
import { t, type CopyKey } from './copy';
import type { Lang } from './use-login-lang';

// The district-code sign-in door.
//
// WHY IT EXISTS: the district's Workspace admin blocks students from the Google
// OAuth app, so "Continue with Google" is not a path for them at all. Their
// teacher mints the account from the dashboard and hands over a code, which IS
// the password on that account.
//
// NO JOIN-CODE BOX IN THIS FORM, and its absence is deliberate rather than an
// oversight. Password sign-in never reaches /auth/callback, which is the only
// place the join cookie is ever read (app/auth/callback/route.ts:170-203), so a
// class code typed here would be staged in a cookie that this door never
// consumes and the student would land enrolled in nothing, with a confirmation
// on screen saying otherwise. Provisioned students are enrolled by their teacher
// at mint time, so they need no join code. JoinClass stays where it is, on the
// Google door, where the callback does read it.
//
// SHAPED AFTER JoinClass, not after the dashboard: squared corners, one hairline
// rule, monospace for anything the student copies off paper. Nunito for labels
// and Space Mono for the code field, which is what this screen already uses.
// Kodchasan is the dashboard's face and is deliberately not introduced here.

type Phase = 'idle' | 'signing' | 'error';

export function CodeSignIn({
  lang,
  next,
  className,
}: {
  lang: Lang;
  /** Resolved by the caller with the same safeNext() the Google button uses. */
  next: string;
  /** Pass-through for the motion system's .um-fade-up, and nothing else. It
   *  lands on the <section>, never on the submit button: that button carries
   *  .uml-lift, whose hover translates, and an entrance animating `transform`
   *  on the same node would suppress the lift for the length of the entrance.
   *  Same rule, and the same reason, as JoinClass. */
  className?: string;
}) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  // Which sentence the refusal gets. Held separately from the phase, the way
  // JoinClass holds its own errorKey, so the two failures cannot share a string
  // by accident: a wrong code and an unreachable server say different things.
  const [errorKey, setErrorKey] = useState<CopyKey>('codeError');

  const ready = email.trim().length > 0 && code.trim().length > 0;

  async function submit() {
    if (!ready || phase === 'signing') return;
    setPhase('signing');
    const outcome = await submitCodeSignIn(
      {
        signIn: (credentials) => supabase.auth.signInWithPassword(credentials),
        // A FULL DOCUMENT LOAD, NOT router.push. signInWithPassword writes the
        // session into cookies from the browser; the dashboard gate is a server
        // read of those cookies. A hard navigation guarantees the server sees
        // the cookie that was written a moment ago, with no cached RSC payload
        // in between.
        navigate: (to) => window.location.assign(to),
      },
      { email, code, next }
    );
    // On 'ok' the navigation is already under way, so the phase is deliberately
    // left at 'signing': the button stays disabled and reads "Signing in" until
    // the document is replaced, rather than flicking back to an idle form.
    if (outcome === 'ok') return;
    // AMBIGUOUS ONLY WHERE AMBIGUITY BUYS SOMETHING. 'invalid-credentials' covers
    // both a wrong code and an unknown email and must not distinguish them.
    // 'unreachable' means nobody checked, which is true whether or not the
    // account exists, so it says what actually happened.
    setErrorKey(outcome === 'unreachable' ? 'codeErrorNetwork' : 'codeError');
    setPhase('error');
  }

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: '11px 13px',
    border: `1px solid ${L.border}`,
    background: L.card,
    color: L.ink,
    outline: 'none',
  };

  return (
    <section
      className={className}
      style={{
        border: `1px solid ${L.border}`,
        background: L.card,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <strong style={{ font: `${DISPLAY_WEIGHT} 15px/1.2 ${FONT_DISPLAY}`, color: L.ink }}>
        {t(lang, 'codeHeading')}
      </strong>

      <p style={{ margin: 0, font: `400 13px/1.6 ${FONT_DISPLAY}`, color: L.ink2 }}>
        {t(lang, 'codeBlurb')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label htmlFor="uml-code-email" className="uml-hidden">
          {t(lang, 'codeEmailLabel')}
        </label>
        <input
          id="uml-code-email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (phase === 'error') setPhase('idle');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={t(lang, 'codeEmailPlaceholder')}
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          // 16px, deliberately: anything smaller makes iOS Safari zoom the
          // viewport on focus, which on a 375px screen throws the layout.
          style={{ ...fieldStyle, font: `400 16px/1 ${FONT_DISPLAY}` }}
        />

        <label htmlFor="uml-code-code" className="uml-hidden">
          {t(lang, 'codeCodeLabel')}
        </label>
        <input
          id="uml-code-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (phase === 'error') setPhase('idle');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={t(lang, 'codeCodePlaceholder')}
          // NOT type="password". The student is copying twelve characters off a
          // slip of paper with no way to recover them if they mistype, and a
          // masked field turns one transposed glyph into a refusal they cannot
          // see the cause of. It is a one-time code on a school laptop, not a
          // password they chose and reuse.
          type="text"
          autoComplete="one-time-code"
          autoCapitalize="characters"
          spellCheck={false}
          style={{
            ...fieldStyle,
            font: `700 16px/1 ${FONT_MONO}`,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!ready || phase === 'signing'}
        className={ready && phase !== 'signing' ? 'uml-lift uml-oncard' : 'uml-oncard'}
        style={{
          padding: '13px 18px',
          border: `1px solid ${ready ? L.border : L.disabledLine}`,
          background: ready ? L.cta : L.disabled,
          color: ready ? L.ctaInk : L.disabledInk,
          font: `700 15px/1 ${FONT_DISPLAY}`,
          cursor: ready && phase !== 'signing' ? 'pointer' : 'not-allowed',
        }}
      >
        {phase === 'signing' ? t(lang, 'codeSigningIn') : t(lang, 'codeSubmit')}
      </button>

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
