import SectionHeading from './SectionHeading';
import { C, ink } from '@/app/components/curriculum-theme';
import { FONT_BODY } from '@/app/components/fonts';

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
//
// Layout follows the practice and quiz sub-pages exactly: a bare SectionHeading
// at the container's full width, then one C.paper card at 24px 26px with the
// house drop shadow. The first version of this file used a 30px 28px card with
// a 1.5px inset ring and no SectionHeading, which pushed the text in further
// than any sibling page and read as a narrow column inside the 860px container.
// Nothing here sets its own max-width or outer margin; the width is the
// layout's `um-page` and this page has no business overriding it.

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
    <>
      <SectionHeading title="Coming soon" blurb="This topic is still being written" />

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '24px 26px',
          borderRadius: '16px',
          background: C.paper,
          boxShadow: '0 1px 3px rgba(14,14,17,.05)',
        }}
      >
        <p
          style={{
            margin: 0,
            font: `400 15.5px ${FONT_BODY}`,
            lineHeight: 1.65,
            color: ink(0.72),
          }}
        >
          {strandName} is where your diagnostic pointed you, but the lessons for it
          are still being written. Check back shortly. Nothing here is hidden behind
          an upgrade. It genuinely does not exist yet.
        </p>

        <a
          className="um-btn-outline"
          href={modulesHref}
          style={{
            alignSelf: 'flex-start',
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
    </>
  );
}
