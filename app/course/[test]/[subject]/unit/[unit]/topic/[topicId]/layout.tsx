import { headers } from 'next/headers';
import { loadTopic, type RouteParams } from './topic-data';
import { activeTopicPart } from '@/app/lib/topic-part-route';
import { GumuGateProvider } from './GumuGate';
import TopicChrome from './TopicChrome';
import ComingSoonTopic from './ComingSoonTopic';
import { TOPIC_PAGE_CSS } from './topic-page-css';
import { strandName } from '@/app/lib/strands';
import { C, ink, EYEBROW } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';

// The shell every topic sub-page renders inside: the course bar with the nav
// menu, the topic header, and the GUMU gate provider that lets a live
// conversation pause the answer key.
//
// Splitting guided notes, practice and the quiz into their own routes means
// this chrome is drawn once here rather than three times.

export default async function TopicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<RouteParams>;
}) {
  const resolved = await params;
  const { topic, authSession, signInHref, teacher } = await loadTopic(resolved);
  const subjectLabel = resolved.subject.replace(/-/g, ' ');

  // Which of the three parts the chrome should mark as current.
  //
  // A layout is given no part of the URL, so the path arrives as the x-pathname
  // header middleware.ts stamps -- the same header #135 added for the sign-in
  // redirect, for the same reason. Null on the doorway and null if the header is
  // missing, and both render no indicator rather than a wrong one.
  const part = activeTopicPart((await headers()).get('x-pathname'));

  return (
    <GumuGateProvider>
      <style>{TOPIC_PAGE_CSS}</style>
      <div
        className="um-topic"
        style={{
          minHeight: '100dvh',
          background: C.cream,
          color: C.midnight,
          fontFamily: FONT_BODY,
        }}
      >
        <TopicChrome
          name={authSession?.user?.email ?? 'Student'}
          role={teacher ? 'teacher' : 'student'}
          test={resolved.test}
          subject={resolved.subject}
          subjectLabel={subjectLabel}
          unit={resolved.unit}
          topicId={topic.topic_id}
          part={part}
        />

        {/* No max width, on purpose. This was 860px centred, and briefly 940px
            to match the student dashboard's <main>, but matching that number
            was the wrong target: the dashboard only reads as full width because
            a 208px sidebar occupies its left edge. The topic tree has no
            sidebar, so any fixed cap here leaves a visible band of cream down
            both sides with nothing in it.

            So the container fills the viewport and the 34px side padding is the
            only thing keeping text off the browser edge. Nothing above this
            constrains width either: app/course/layout.tsx is a bare div, and
            globals.css sets no width on html or body.

            Note this makes prose lines as long as the window is wide, which on
            a very large monitor is worse for reading than a measure-capped
            column. That is a deliberate trade for having no empty margin band,
            and if it needs revisiting the fix is a cap on the prose card rather
            than on this container, so the page keeps filling the viewport.

            The 760px media query in topic-page-css.ts drops this padding to
            16px, which still applies. */}
        <div
          className="um-page"
          style={{
            padding: '34px 34px 72px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
          }}
        >
          <header style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <div style={{ ...EYEBROW, color: C.sunset }}>Topic {topic.topic_id}</div>
            <h1
              className="um-title"
              style={{
                margin: 0,
                font: `600 33px ${FONT_HEADING}`,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                color: C.midnight,
              }}
            >
              {topic.topic_name}
            </h1>
          </header>

          {!authSession && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                padding: '15px 18px',
                borderRadius: '14px',
                background: C.paper,
                boxShadow: `inset 0 0 0 1.5px ${ink(0.1)}`,
                font: `400 14.5px ${FONT_BODY}`,
                lineHeight: 1.6,
                color: ink(0.7),
              }}
            >
              <a href={signInHref} style={{ color: C.gemini, fontWeight: 600 }}>
                Sign in with Google
              </a>
              <span>
                to save your progress and work through the ones you miss with GUMU.
              </span>
            </div>
          )}

          {/* A placeholder topic has no lesson, no practice and no quiz, so the
              sub-page is not rendered at all -- this replaces it.

              Done here rather than with a branch in each of lesson, practice
              and quiz because the layout is the one place all four routes
              (including the bare topic index) must pass through, so a fifth
              sub-route added later cannot forget it. Not rendering {children}
              means the page component is never invoked: a server component is
              only a description until React renders it, so loadNavigation and
              loadGates below it never run either. */}
          {topic.is_placeholder ? (
            <ComingSoonTopic
              strandName={strandName(topic.related_strand)}
              modulesHref="/dashboard/modules"
              requiresSignIn={!authSession}
            />
          ) : (
            children
          )}
        </div>
      </div>
    </GumuGateProvider>
  );
}

// The page varies by role (the answer key) and by student (the gates), so it is
// not safe to hold in a cache keyed only on the URL.
export const dynamic = 'force-dynamic';
