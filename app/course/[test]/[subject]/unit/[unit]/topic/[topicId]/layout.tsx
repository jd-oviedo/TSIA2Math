import { loadTopic, type RouteParams } from './topic-data';
import { GumuGateProvider } from './GumuGate';
import TopicChrome from './TopicChrome';
import { TOPIC_PAGE_CSS } from './topic-page-css';
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
        />

        <div
          className="um-page"
          style={{
            maxWidth: '860px',
            margin: '0 auto',
            padding: '30px 34px 72px',
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

          {children}
        </div>
      </div>
    </GumuGateProvider>
  );
}

// The page varies by role (the answer key) and by student (the gates), so it is
// not safe to hold in a cache keyed only on the URL.
export const dynamic = 'force-dynamic';
