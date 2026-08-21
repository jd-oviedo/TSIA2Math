import { C } from '@/app/components/curriculum-theme';
import { FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';
import { messageFor } from './join-result-copy';

// What happened to the class code a student entered before signing in.
//
// WHY IT HAS TO EXIST. The enrolment now happens server-side in the OAuth
// callback, which means the student finds out whether it worked on a page they
// did not submit anything from. Without this they would land here either
// silently enrolled or silently NOT enrolled, and the second one is the failure
// the whole flow was built to avoid: a student who typed a code, signed in, and
// has no idea their class did not take.
//
// Every outcome enrolFromJoinCode can return is handled here, plus 'expired',
// which the callback synthesises when the sign-in carried join=1 but the cookie
// was gone by the time it ran. No outcome falls through to silence: an
// unrecognised value still renders the neutral "could not add you" copy.
//
// A server component, deliberately. It carries no state and needs no
// interaction, so it costs the dashboard no JavaScript.
//
// ENGLISH ONLY, and that is a known gap rather than an oversight. /dashboard has
// no language mechanism at all -- the ES/EN control added in this change is
// scoped to the three login screens -- so a Spanish-speaking student who chose
// Español at sign-in reads this one sentence in English. Fixing it properly
// means taking the language preference into the dashboard, which is the same
// piece of work as unifying /reporte and /go.

export default function JoinResultBanner({
  outcome,
  className,
}: {
  outcome: string;
  className?: string;
}) {
  const { tone, text } = messageFor(outcome, className ?? null);
  const accent = tone === 'good' ? C.green : tone === 'warn' ? C.amber : C.amber;

  return (
    <div
      role="status"
      style={{
        borderLeft: `3px solid ${accent}`,
        background: V.subtleBg,
        padding: '12px 16px',
        font: `400 13.5px ${FONT_BODY}`,
        lineHeight: 1.6,
        color: V.heading,
      }}
    >
      {text}
    </div>
  );
}
