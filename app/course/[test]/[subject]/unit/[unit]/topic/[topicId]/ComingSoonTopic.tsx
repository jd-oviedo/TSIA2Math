import { C, ink, EYEBROW } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';

// What a placeholder topic renders instead of a lesson.
//
// AR, GR and PR each have a content-free row in curriculum_topics so that the
// diagnostic recommendation has somewhere to send a student whose weakest
// strand has no curriculum written yet
// (sql/curriculum_placeholder_topics.sql). This is the page they land on.
//
// It says the content does not exist. It does not show an empty "Guided notes"
// heading over nothing, it does not bounce the student somewhere else, and it
// does not fill the gap with generated filler -- a student who was just told
// "Algebra is your weakest strand, start here" and then finds a lesson that
// isn't about algebra has been misled twice.
//
// The copy lives here rather than in guided_notes so that changing it is a
// deploy, not a hand-edit against production content.

export default function ComingSoonTopic({
  strandName,
  modulesHref,
  requiresSignIn,
}: {
  // The full strand name, e.g. "Algebraic Reasoning". Derived from the topic
  // row by the layout so this component holds no strand table of its own.
  strandName: string;
  modulesHref: string;
  // Modules lives under /dashboard, whose layout bounces anyone signed out to
  // /login. A visitor who arrived here straight from the free diagnostic has no
  // account, so the label says where the click actually goes rather than
  // promising a topic list and delivering a Google sign-in screen.
  requiresSignIn: boolean;
}) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: '30px 28px',
        borderRadius: 16,
        background: C.paper,
        boxShadow: `inset 0 0 0 1.5px ${ink(0.1)}`,
      }}
    >
      <div style={{ ...EYEBROW, color: C.gold }}>Coming soon</div>

      <h2
        style={{
          margin: 0,
          font: `600 23px ${FONT_HEADING}`,
          lineHeight: 1.3,
          color: C.midnight,
        }}
      >
        We haven&rsquo;t written this one yet
      </h2>

      <p
        style={{
          margin: 0,
          font: `400 15.5px ${FONT_BODY}`,
          lineHeight: 1.65,
          color: ink(0.72),
          maxWidth: '54ch',
        }}
      >
        Your diagnostic put {strandName} at the bottom, so this is where you should
        start &mdash; but the lessons for it are still being written. Check back
        shortly. Nothing here is hidden behind an upgrade; it genuinely does not
        exist yet.
      </p>

      <a
        className="um-btn-outline"
        href={modulesHref}
        style={{
          alignSelf: 'flex-start',
          marginTop: 4,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 20px',
          borderRadius: 11,
          boxShadow: `inset 0 0 0 1.5px ${ink(0.22)}`,
          font: `500 14.5px ${FONT_BODY}`,
          color: ink(0.7),
        }}
      >
        <span>
          {requiresSignIn ? 'Sign in to see what is available now' : 'See what is available now'}
        </span>
        <span aria-hidden="true">&rarr;</span>
      </a>
    </section>
  );
}
