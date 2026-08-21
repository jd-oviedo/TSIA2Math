'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { supabase } from '../lib/supabase';
import { safeNext, DEFAULT_NEXT } from '../lib/next-param';
import { L, FONT_DISPLAY, FONT_MONO, DISPLAY_WEIGHT } from './login-theme';
import { LoginChrome, Eyebrow } from './LoginChrome';
import { JoinClass } from './JoinClass';
import { t } from './copy';
import { useLoginLang } from './use-login-lang';

// /login?role=teacher and /login?role=student: option 1d of the import, with the
// credential form cut.
//
// THE FORM IS GONE, WHICH INVERTS THE BUTTON HIERARCHY. 1d gives the orange
// primary treatment to "Log in" and puts "Continue with Google" underneath as a
// white secondary below an OR divider. With email and password cut, Google is
// the only action on the screen, so it takes the primary treatment and the
// divider goes with the form it was dividing. There is no second auth provider
// and no password anything.
//
// The Google mark is the existing multi-colour icon, which the import does not
// draw at all -- Google's brand guidelines require it on the button.

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

export function SignIn({ role }: { role: 'student' | 'teacher' }) {
  const [lang, setLang] = useLoginLang();
  const [loading, setLoading] = useState(false);
  const [joinConfirmed, setJoinConfirmed] = useState(false);
  const searchParams = useSearchParams();
  const isTeacher = role === 'teacher';

  // The callback writes error=auth_failed and, until now, nothing read it: a
  // cancelled sign-in landed silently on the role selector. join=pending means
  // the cookie holding their class code is still there and still good.
  const authFailed = searchParams.get('error') === 'auth_failed';
  const joinPending = searchParams.get('join') === 'pending';

  const handleGoogleLogin = async () => {
    posthog.capture('sign_in_clicked', { session_id: searchParams.get('session_id') });
    setLoading(true);
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    // Guarded here as well as in the callback, so a refused value never reaches
    // Supabase's redirectTo and the callback is not the only thing between the
    // param and a redirect. Same helper, so the two cannot disagree.
    const next = safeNext(searchParams.get('next'), isTeacher ? '/teacher' : DEFAULT_NEXT);
    const sessionId = searchParams.get('session_id');
    callbackUrl.searchParams.set('next', next);
    if (sessionId) callbackUrl.searchParams.set('session_id', sessionId);
    if (isTeacher) callbackUrl.searchParams.set('role', 'teacher');

    // A FLAG, NOT THE CODE. The code itself is in an httpOnly cookie and must
    // never appear in a URL. This says only "a join was confirmed", which is
    // what lets the callback tell an EXPIRED cookie apart from no cookie at
    // all -- otherwise a student whose cookie lapsed mid-sign-in would land on
    // the dashboard silently unenrolled with nothing on screen to explain it.
    if (joinConfirmed) callbackUrl.searchParams.set('join', '1');

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    });
  };

  return (
    <LoginChrome lang={lang} setLang={setLang} showChangeRole>
      <div
        style={{
          maxWidth: 440,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <Eyebrow>{t(lang, isTeacher ? 'teacherEyebrow' : 'studentEyebrow')}</Eyebrow>

        <h1
          style={{
            margin: 0,
            font: `${DISPLAY_WEIGHT} clamp(26px, 7vw, 32px)/1.15 ${FONT_DISPLAY}`,
            letterSpacing: '-0.02em',
            color: L.ink,
            textWrap: 'pretty',
          }}
        >
          {t(lang, isTeacher ? 'welcomeBack' : 'studentHeadline')}
        </h1>

        <p style={{ margin: 0, font: `400 14px/1.6 ${FONT_DISPLAY}`, color: L.ink2 }}>
          {t(lang, isTeacher ? 'teacherBlurb' : 'studentBlurb')}
        </p>

        {authFailed && (
          <p
            role="alert"
            style={{
              margin: 0,
              font: `400 13px/1.5 ${FONT_DISPLAY}`,
              color: L.error,
              border: `1px solid ${L.error}`,
              padding: '11px 13px',
            }}
          >
            {t(lang, joinPending ? 'authFailedWithCode' : 'authFailed')}
          </p>
        )}

        {/* Students only, and optional: a blank field signs in normally. */}
        {!isTeacher && <JoinClass lang={lang} onConfirmedChange={setJoinConfirmed} />}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={loading ? undefined : 'uml-lift'}
          style={{
            width: '100%',
            padding: '16px 20px',
            // Cream rather than the import's orange, and its own border token:
            // --uml-border is near-invisible on a cream fill in dark mode.
            border: `1px solid ${L.creamLine}`,
            background: L.cream,
            color: L.creamInk,
            font: `700 16px/1 ${FONT_DISPLAY}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <GoogleIcon />
          {loading ? t(lang, 'redirecting') : t(lang, 'continueGoogle')}
        </button>

        {isTeacher && (
          <p
            style={{
              margin: 0,
              font: `400 13px/1.6 ${FONT_DISPLAY}`,
              color: L.ink2,
              textAlign: 'center',
            }}
          >
            {t(lang, 'noAccountTeacher')}{' '}
            {/* There is no self-serve teacher signup, so this is the only real
                answer to "no account?". schools@ is a live alias; it is absent
                from the repo, which is why it had to be asked for rather than
                grepped. */}
            <a
              href="mailto:schools@unpackmath.com?subject=UnpackMath%20for%20my%20campus"
              style={{ color: L.amber, fontWeight: 700 }}
            >
              {t(lang, 'talkToUs')}
            </a>
          </p>
        )}

        <p
          style={{
            margin: 0,
            font: `400 11px/1.6 ${FONT_MONO}`,
            color: L.inkMono,
            textAlign: 'center',
          }}
        >
          {t(lang, 'legalPrefix')}{' '}
          <a href="https://unpackmath.com/terms" style={{ color: L.amber }}>
            {t(lang, 'legalTerms')}
          </a>{' '}
          {t(lang, 'legalAnd')}{' '}
          <a href="https://unpackmath.com/privacy" style={{ color: L.amber }}>
            {t(lang, 'legalPrivacy')}
          </a>
          .
        </p>
      </div>
    </LoginChrome>
  );
}
