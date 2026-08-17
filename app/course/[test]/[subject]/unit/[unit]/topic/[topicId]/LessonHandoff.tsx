'use client';

import { C, ink, EYEBROW, RADIUS, hairline } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';

// The end of the guided notes.
//
// Until this existed, finishing a 50-minute lesson looked like a grey disabled
// button turning orange and a sentence disappearing. The notes stopped and a nav
// row followed. This makes the completion an arrival rather than a state change,
// and says what practice actually is before the student walks into it.
//
// WHY IT CARRIES THE PRIMARY, AND WHY Next LEAVES THE NAV ROW
// ------------------------------------------------------------
// TopicNav already renders an orange "Next / Practice" once the gate opens, which
// is the same action this button performs. Two Sunset Orange primaries on one
// screen is exactly what the redesign rules out, so in the done state LessonBody
// passes `next={null}` and TopicNav renders no Next at all. TopicNav needed no
// change for that: it already treats a null next as "nothing to go to".
//
// Previous stays, which is what makes the swap safe: the nav row does not become
// empty, it loses the button whose job this card has taken over.
//
// Nothing changes while the lesson is still locked. This component is not
// rendered at all until the sentinel fires, so the grey Next button, the
// requirement line and its aria-describedby all behave exactly as before.

export default function LessonHandoff({
  href,
  practiceCount,
  practiceInteractive,
}: {
  href: string;
  practiceCount: number;
  // False on a written-work practice section, where "10 problems, check each
  // one" would describe something the student is not going to find. QR.1.1 is
  // the only one in the course today.
  practiceInteractive: boolean;
}) {
  const heading = practiceInteractive
    ? `Practice, ${practiceCount} ${practiceCount === 1 ? 'problem' : 'problems'}`
    : 'Practice, written work';

  const blurb = practiceInteractive
    ? 'Work at your own pace. Check each one as you go, and come back to any you miss.'
    : 'Written practice for this topic. Nothing is graded, so work through it however you like.';

  return (
    <section
      aria-labelledby="lesson-handoff-heading"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
        padding: '20px 22px',
        borderRadius: RADIUS,
        background: C.paper,
        boxShadow: hairline(ink(0.1)),
      }}
    >
      <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ ...EYEBROW, color: ink(0.45) }}>Next in this topic</div>
        <h2
          id="lesson-handoff-heading"
          style={{ margin: 0, font: `600 19px ${FONT_HEADING}`, color: C.midnight }}
        >
          {heading}
        </h2>
        <p style={{ margin: 0, font: `400 14px ${FONT_BODY}`, lineHeight: 1.6, color: ink(0.65) }}>
          {blurb}
        </p>
      </div>

      <a
        className="um-lesson-handoff-action"
        href={href}
        style={{
          flex: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          minHeight: 44,
          padding: '12px 24px',
          borderRadius: RADIUS,
          background: C.sunset,
          boxShadow: `0 2px 0 ${C.sunsetShadow}`,
          font: `600 15px ${FONT_HEADING}`,
          color: C.midnight,
          textDecoration: 'none',
        }}
      >
        <span>Start practice</span>
        <span aria-hidden="true">&rarr;</span>
      </a>
    </section>
  );
}
