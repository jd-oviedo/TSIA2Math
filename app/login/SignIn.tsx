'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { supabase } from '../lib/supabase';
import { safeNext, DEFAULT_NEXT } from '../lib/next-param';
import { L, FONT_DISPLAY, FONT_MONO, DISPLAY_WEIGHT } from './login-theme';
import { LoginChrome, Eyebrow } from './LoginChrome';
import { JoinClass } from './JoinClass';
import { CodeSignIn } from './CodeSignIn';
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
  // The district-code form is hidden until asked for. Google is the path for the
  // self-serve majority and stays the only thing on screen for them; the second
  // door is one line of text until a student who needs it opens it.
  const [showCode, setShowCode] = useState(false);
  const searchParams = useSearchParams();
  const isTeacher = role === 'teacher';

  // HOISTED SO BOTH DOORS READ ONE VALUE. The Google button hands this to
  // Supabase as redirectTo and the callback route performs the redirect; the
  // code form navigates to it directly, because password sign-in never reaches
  // the callback. Same safeNext() call either way, so the two cannot disagree
  // about where a student lands.
  const next = safeNext(searchParams.get('next'), isTeacher ? '/teacher' : DEFAULT_NEXT);

  // The callback writes error=auth_failed and, until now, nothing read it: a
  // cancelled sign-in landed silently on the role selector. join=pending means
  // the cookie holding their class code is still there and still good.
  const authFailed = searchParams.get('error') === 'auth_failed';
  const joinPending = searchParams.get('join') === 'pending';

  const handleGoogleLogin = async () => {
    posthog.capture('sign_in_clicked', { session_id: searchParams.get('session_id') });
    setLoading(true);
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    // `next` is guarded at the top of the component as well as in the callback,
    // so a refused value never reaches Supabase's redirectTo and the callback is
    // not the only thing between the param and a redirect.
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
      {/* The stagger container. Its child count VARIES -- the auth-failed
          alert, the join-class panel and the teacher-only "no account" line are
          each conditional -- and that is exactly the case the tail clamp in
          motion.ts exists for. The sequence simply runs over whatever is
          present, and from the sixth child on everything lands with the fifth
          rather than falling back to 0ms and firing first. */}
      <div
        className="um-stagger"
        style={{
          maxWidth: 440,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <Eyebrow className="um-fade-up">
          {t(lang, isTeacher ? 'teacherEyebrow' : 'studentEyebrow')}
        </Eyebrow>

        <h1
          className="um-fade-up"
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

        <p className="um-fade-up" style={{ margin: 0, font: `400 14px/1.6 ${FONT_DISPLAY}`, color: L.ink2 }}>
          {t(lang, isTeacher ? 'teacherBlurb' : 'studentBlurb')}
        </p>

        {authFailed && (
          <p
            role="alert"
            className="um-fade-up"
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
        {/* THE ENTRANCE LANDS ON THE <section>, NOT ON THE CHECK BUTTON INSIDE
            IT. JoinClass:226 is one of the three .uml-lift sites in this tree,
            so it is worth stating that the collision is already avoided here
            rather than leaving it to be rediscovered: the panel is the stagger
            child, the lift stays on the button two levels down, and the two
            transforms are on different nodes. Nothing extra is needed -- but
            .um-fade-up must never be moved onto that button. */}
        {!isTeacher && (
          <JoinClass className="um-fade-up" lang={lang} onConfirmedChange={setJoinConfirmed} />
        )}

        {/* ─── WRAPPER, AND IT IS REQUIRED RATHER THAN TIDY ─────────────────
            This is the collision the rule exists for. .uml-lift declares
            `transition: transform 120ms` and `:hover { transform: translate(-2px,
            -2px) }` (login-theme.ts:452-457), and .um-fade-up animates
            `transform` from translateY(10px) to none. A RUNNING ANIMATION'S
            transform beats a transition's for the whole of its 600ms, so with
            both on this one node the lift would simply not respond for the
            first 600ms after load -- and it would fail silently, on the primary
            control of the sign-in screen, in exactly the window where someone
            is most likely to be moving the mouse toward it.

            So the entrance owns the wrapper and .uml-lift owns the button.
            Layout is unchanged: the wrapper is the flex item and stretches to
            the column's full width, and the button's own width: 100% then
            fills it exactly as before.

            The wrapper is also what keeps the stagger honest -- the delay rules
            select DIRECT children of .um-stagger, so the wrapper takes the slot
            the button used to hold. */}
        <div className="um-fade-up">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={loading ? undefined : 'uml-lift'}
            style={{
              width: '100%',
              padding: '16px 20px',
              // Cream rather than the import's orange.
              //
              // --uml-border, NOT --uml-cream-line, and the comment that used to
              // sit here said the opposite for a good reason that expired on
              // 2026-08-29. While --uml-cream was #E8E0CF, a bright strip in both
              // themes, the two tokens were the right way round: #111111 gave the
              // button a 14.38:1 outline and --uml-border would have been
              // near-invisible on that light fill.
              //
              // The dashboard retune moved --uml-cream to the dashboard's inset
              // fill #26262B, which inverts the arithmetic on this one element:
              // measured after the swap, #111111 on #26262B is 1.25:1 -- the
              // design's signature hard rule, gone, on the primary control of the
              // sign-in screen. --uml-border is 3.40:1 on the same fill.
              //
              // --uml-cream-line is NOT wrong and must not be "fixed" to follow:
              // its other consumers paint it on the orange CTA, where a dark
              // outline is still correct in both themes. One token cannot be both
              // a dark rule on orange and a light rule on near-black, which is
              // exactly the split WelcomeIn.tsx:147-148 already records.
              border: `1px solid ${L.border}`,
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
        </div>

        {/* ─── The second door ─────────────────────────────────────────────
            Students only, and closed by default. A district student whose
            Workspace admin blocks the Google OAuth app cannot use the button
            above at all, so this is not a convenience for them, it is the only
            way in. It stays one line of text until they open it, so the screen
            does not grow a credential form for the majority who never need one.

            The link is the text-button treatment JoinClass already uses for
            "Use a different code": mono, amber, underlined, .uml-oncard for the
            focus ring. Not a second CTA, so it cannot compete with Google. */}
        {!isTeacher && !showCode && (
          <button
            type="button"
            onClick={() => setShowCode(true)}
            className="uml-oncard um-fade-up"
            aria-expanded={false}
            aria-controls="uml-code-signin"
            style={{
              alignSelf: 'center',
              padding: 0,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              font: `400 12px/1.5 ${FONT_MONO}`,
              letterSpacing: '0.06em',
              color: L.amber,
              textDecoration: 'underline',
            }}
          >
            {t(lang, 'codeLinkLabel')}
          </button>
        )}

        {/* The entrance lands on this wrapper rather than on the <section>'s own
            submit button, for the .uml-lift collision reason spelled out above. */}
        {!isTeacher && showCode && (
          <div id="uml-code-signin" className="um-fade-up">
            <CodeSignIn lang={lang} next={next} />
          </div>
        )}

        {isTeacher && (
          <p
            className="um-fade-up"
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
          className="um-fade-up"
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
