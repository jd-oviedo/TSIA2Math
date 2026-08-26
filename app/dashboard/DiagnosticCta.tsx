'use client';

import { useEffect, useState } from 'react';
import { C, EYEBROW } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';
import { SPACING } from './ui';

// The "you have not tested yet" card on Home.
//
// Placed above Course progress and sized louder than it, but deliberately not
// in place of it: a student who joined a class mid-year, or who tested on
// paper, still has a course to get on with, and hiding it behind a diagnostic
// would strand them. Everything below this card stays exactly where it was.
//
// Dismiss is session-local by design. It is a "not now", not a preference --
// the point is to unstick someone who does not need the card today, not to
// record a decision about them. sessionStorage means it comes back next visit,
// which is the right cost for something with no server-side state behind it.
const DISMISS_KEY = 'um-diagnostic-cta-dismissed';

export default function DiagnosticCta() {
  // Read back on mount rather than during the first render, for the same
  // reason StudentShell reads its collapsed state that way: this is a server
  // render reached by a full navigation, the server cannot know what is in
  // sessionStorage, and reading it inline would hydrate mismatched.
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === '1') setDismissed(true);
    } catch {
      // Private-mode storage denial is not worth surfacing; the card just
      // stays visible, which is the harmless direction.
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* see above */
    }
  }

  if (dismissed) return null;

  return (
    <section
      style={{
        background: V.cardBg,
        border: `1px solid ${V.panelEdge}`,
        borderRadius: 0,
        boxShadow: 'none',
        // The one piece of colour that marks this out from the cards below it,
        // and now the ONLY thing that does. Declared after the border so it
        // wins the top edge.
        borderTop: `3px solid ${C.sunset}`,
        // PADDING IS DELIBERATELY OFF THE SHELL SCALE HERE, and it survived the
        // 2026-08-26 spacing pass on that basis: 26/28 against PANEL_PAD's
        // 22/24 is half of this card's documented "louder than the cards below
        // it" treatment -- see the header.
        //
        // THE OTHER HALF WAS A SHADOW, AND IT IS GONE. That note used to cover
        // `boxShadow: V.cardShadowHover` too, on the ground that the raised
        // shadow read as louder "against every other panel's flat cardShadow".
        // That comparison no longer exists: the shell went flat on 2026-08-26
        // and no panel on this page casts a shadow at all. A lone shadowed card
        // in a shadowless system does not read as emphasis, it reads as the one
        // card nobody converted. What the note was protecting survives intact
        // -- the 3px sunset rule above and this padding are both untouched, and
        // the rule is a stronger mark than the shadow ever was.
        padding: '26px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING.BLOCK,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* V.dim, not C.amber. This eyebrow was orange-as-text at 3.74:1 on the
            white card and 4.34:1 on the dark one, and it is a label above a
            heading -- the role the palette settled on 2026-08-21, where orange
            survives as a fill, a rule and the CTA and labels take ink. Both of
            those survive on this card: the 3px sunset rule at its top and the
            sunset Begin Diagnostic button below. Only the text role goes. */}
        <div style={{ ...EYEBROW, color: V.dim }}>Start with this</div>

        <button
          type="button"
          onClick={dismiss}
          style={{
            flex: 'none',
            border: 'none',
            background: 'transparent',
            padding: '2px 4px',
            font: `400 12.5px ${FONT_BODY}`,
            color: V.dim,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Not now
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2
          style={{
            margin: 0,
            font: `600 23px ${FONT_HEADING}`,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            color: V.heading,
          }}
        >
          Find out where you are
        </h2>
        <p
          style={{
            margin: 0,
            maxWidth: '56ch',
            font: `400 14.5px ${FONT_BODY}`,
            lineHeight: 1.6,
            color: V.muted,
          }}
        >
          A short adaptive test, 20 questions, that adjusts to your answers as you go. It gives
          you an estimated TSIA2 score and shows which strands to spend your time on. Your
          results save to your dashboard.
        </p>
      </div>

      <a
        className="um-btn-primary"
        href="/adaptive-test"
        style={{
          alignSelf: 'flex-start',
          padding: '13px 30px',
          borderRadius: 11,
          background: C.sunset,
          boxShadow: `0 2px 0 ${C.sunsetShadow}`,
          font: `600 15.5px ${FONT_BODY}`,
          color: C.midnight,
        }}
      >
        Begin Diagnostic
      </a>
    </section>
  );
}
