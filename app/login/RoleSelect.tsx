'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginHref, safeNext, isSafeNext, DEFAULT_NEXT } from '../lib/next-param';
import { L, FONT_DISPLAY, FONT_MONO, DISPLAY_WEIGHT } from './login-theme';
import { LoginChrome, Eyebrow } from './LoginChrome';
import { t } from './copy';
import { useLoginLang } from './use-login-lang';

// /login with no role: option 1a of the import.
//
// TWO OPTIONS, NOT THREE. "I'm a family member" is gone rather than hidden
// behind a flag. It was a <div aria-disabled> with no href, so nothing linked to
// it and nothing 404s. /go's Parent/Guardian entry is a different surface and is
// untouched.

export function RoleSelect() {
  const [lang, setLang] = useLoginLang();
  const searchParams = useSearchParams();

  // Both param hops this screen sits in the middle of.
  //
  // `next`: /dashboard's gate redirects here WITHOUT a role, so this selector --
  // not the sign-in screen -- is where a signed-out deep link actually lands.
  // The raw value is kept as well as the resolved one, because the two roles
  // need different fallbacks and the resolved one has already become /dashboard.
  //
  // `session_id`: an anonymous CAT taker arrives from ResultsSummary carrying
  // it, and the callback claims their finished test only if it survives.
  const rawNext = searchParams.get('next');
  const next = safeNext(rawNext, DEFAULT_NEXT);
  const teacherNext = isSafeNext(rawNext) ? rawNext : '/teacher';
  const sessionId = searchParams.get('session_id');

  return (
    <LoginChrome lang={lang} setLang={setLang}>
      {/* Three beats: eyebrow, headline, the pair of role rows. */}
      <div
        className="um-stagger"
        style={{
          maxWidth: 520,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
        }}
      >
        <Eyebrow className="um-fade-up">{t(lang, 'signIn')}</Eyebrow>

        <h1
          className="um-fade-up"
          style={{
            margin: 0,
            font: `${DISPLAY_WEIGHT} clamp(30px, 8vw, 40px)/1.12 ${FONT_DISPLAY}`,
            letterSpacing: '-0.02em',
            color: L.ink,
            textWrap: 'pretty',
          }}
        >
          {t(lang, 'roleHeadline')}
        </h1>

        {/* ─── THE WRAPPER FOR RoleSelect:105, AND IT ALREADY EXISTED ────────
            Both rows carry .uml-lift / .uml-lift-blue, whose hover translates, so
            the entrance must not land on the <Link> itself. It does not need a
            NEW node to avoid that: this container is already the direct child of
            the stagger and already wraps both rows, so putting .um-fade-up here
            puts the entrance one level above the lifts rather than on top of
            them. No extra div, and the DOM is unchanged from before this wave.

            It also gives the right beat. The two rows are one choice, so they
            arrive together as a pair; sequencing them 60ms apart would suggest an
            order between two options that have none, and the second row would be
            the last thing on the screen to settle. */}
        <div className="um-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <RoleRow
            href={loginHref(next, 'student', sessionId)}
            label={t(lang, 'student')}
            variant="student"
          />
          <RoleRow
            href={loginHref(teacherNext, 'teacher', sessionId)}
            label={t(lang, 'teacher')}
            variant="teacher"
          />
        </div>

        <p className="um-fade-up" style={{ margin: 0, font: `400 13px/1.6 ${FONT_DISPLAY}`, color: L.ink2 }}>
          {t(lang, 'newHere')}{' '}
          {/* The anonymous CAT, confirmed ungated: /adaptive-test sits outside
              the /dashboard tree, has no server redirect, and reads the session
              only to vary its pre-test copy. */}
          <Link href="/adaptive-test" style={{ color: L.amber, fontWeight: 700 }}>
            {t(lang, 'takeTest')}
          </Link>{' '}
          {'—'} {t(lang, 'noAccount')}
        </p>
      </div>
    </LoginChrome>
  );
}

function RoleRow({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: 'student' | 'teacher';
}) {
  const isStudent = variant === 'student';
  return (
    <Link
      href={href}
      // uml-lift is the import's hover: a 2px translate with a hard 4px offset
      // shadow and no blur. The blue variant carries the teacher row's own
      // shadow colour and tint. Both are disabled under prefers-reduced-motion.
      className={isStudent ? 'uml-lift' : 'uml-lift-blue'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 22px',
        background: isStudent ? L.cta : L.card,
        border: `1px solid ${L.border}`,
        color: isStudent ? L.ctaInk : L.ink,
        textDecoration: 'none',
      }}
    >
      <span style={{ font: `700 18px/1 ${FONT_DISPLAY}` }}>{label}</span>
      <span aria-hidden style={{ font: `400 12px/1 ${FONT_MONO}` }}>
        →
      </span>
    </Link>
  );
}
