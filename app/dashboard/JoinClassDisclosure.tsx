'use client';

import { useState } from 'react';
import { FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';

// The demoted "Join a class" affordance.
//
// WHAT THIS REPLACED, AND WHY IT IS NOT A DELETION. "Join a class" was a full
// panel in the top right of Home, level with the title -- the loudest thing on
// the page after the heading. That was right when every student was assumed to
// be arriving with a code from a teacher. It is wrong for a solo student, who
// is the majority of the people it was being shown to: a permanent, prominent
// box asking for a code they do not have, on the page they land on every
// session.
//
// The path is not removed, because a solo student can be handed a code
// tomorrow. It is turned into a disclosure: one quiet line, and the real panel
// exactly as it was behind it. Nothing about /api/enroll, the six-character
// rule, or the panel's own markup changed.
//
// A STUDENT ALREADY IN A CLASS IS SHOWN NOTHING AT ALL -- not this link either.
// That decision is Home's and lives there, next to the head it composes; this
// component renders whatever it is given, whenever it is mounted.
//
// THE PANEL ARRIVES AS `children` RATHER THAN BEING IMPORTED HERE. Card and
// CardTitle are server components (app/dashboard/ui.tsx has no 'use client'),
// and this file needs state, so importing them would drag the panel primitive
// into the client bundle for no reason. Composed on the server by Home, passed
// through here, and revealed by a boolean.
export default function JoinClassDisclosure({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="join-class-disclosure"
        style={{
          // A LINK, NOT A BUTTON, VISUALLY. No fill, no border, no radius, no
          // shadow: the whole point of the change is that this stops competing
          // with the heading beside it. It is a <button> in the markup because
          // it toggles state on this page rather than navigating anywhere, and
          // an <a href="#"> that does that is a lie to a screen reader.
          appearance: 'none',
          background: 'none',
          border: 'none',
          padding: 0,
          font: `500 13.5px ${FONT_BODY}`,
          // V.muted, matching PageHeading's blurb, so this reads as the same
          // tier of quiet as the sentence under the title rather than as a
          // control that has been greyed out.
          color: V.muted,
          textDecoration: 'underline',
          textUnderlineOffset: 3,
          cursor: 'pointer',
        }}
      >
        {open ? 'Hide' : 'Have a class code?'}
      </button>

      {/* Mounted only when open. Unlike the nav slide-over there is no exit
          animation to preserve, and a hidden form still in the DOM would put a
          second id="join-code" on any page that also renders the panel. */}
      {open && (
        <div id="join-class-disclosure" style={{ marginTop: 10 }}>
          {children}
        </div>
      )}
    </div>
  );
}
