import { notFound } from 'next/navigation';
import { TOPIC_PAGE_CSS } from '../../course/[test]/[subject]/unit/[unit]/topic/[topicId]/topic-page-css';
import TopicSurface from '../../components/TopicSurface';
import { T } from '../../components/curriculum-surface';
import { MATH_LINE_HEIGHT } from '../../components/curriculum-theme';
import { FONT_BODY } from '../../components/fonts';
import { verifyLaneEnabled } from '../guard';

// THE CURRICULUM HALF OF THE UI VERIFICATION LANE.
//
// See ../shell/page.tsx for what this lane is and why it is split in two. The
// same rules apply here.
//
// DB-FREE: performs no data fetching and no DB reads/writes. One read-only auth
// check still runs via existing middleware; it reads and writes nothing.
//
// DELIBERATELY MINIMAL, AND THIS IS A SCOPE DECISION RATHER THAN AN OMISSION.
// What is mounted is the chrome and the prose card: enough for page-ground,
// panel and card-width assertions, which is what practice and quiz actually
// render (practice/page.tsx:87-102 and quiz/page.tsx:170-182 build this exact
// element). LessonBody is NOT mounted and CURRICULUM_FIXTURE_SOURCE is NOT
// wired in. Lesson-section assertions -- the "Section N of M" rules and their
// spacing -- need real section data, and that already has a DB-free home in
// scripts/verify_lesson_dark.mjs via loadTopicFixture. Two lanes with one job
// each, rather than one lane that needs a fixture env var to do half of it.
//
// THE STYLESHEET IS LOAD-BEARING HERE, unlike on the drawer. The drawer's
// background is written inline from a resolved hex, so it measures correctly
// with no tokens present. Everything on THIS route resolves through var():
// .um-topic's ground is var(--umt-page) and the card is var(--umt-panel), and
// both are declared by CURRICULUM_VARS_CSS inside TOPIC_PAGE_CSS. Without this
// injection they compute to transparent and an assertion against them would be
// measuring nothing. That is the standing rule the helper encodes: assert only
// what the injected CSS supports.
//
// The .um-page wrapper is copied from the real topic layout (layout.tsx:92-99)
// rather than approximated, because it is the thing under test for width: it
// carries no max-width on purpose, and that absence is what makes the card fill
// the viewport.

export default function VerifyLaneCurriculum() {
  // Layer one of the guard. Layer two throws at import; see ../guard.ts.
  if (!verifyLaneEnabled()) notFound();

  return (
    <>
      <style>{TOPIC_PAGE_CSS}</style>
      <TopicSurface fontFamily={FONT_BODY}>
        <div
          className="um-page"
          style={{ padding: '34px 34px 72px', display: 'flex', flexDirection: 'column', gap: '28px' }}
        >
          <div
            className="um-prose um-prose-card"
            data-probe="prose-card"
            style={{
              background: T.panel,
              border: `1px solid ${T.hairline}`,
              borderRadius: '16px',
              padding: '24px 26px',
              boxShadow: '0 1px 3px rgba(14,14,17,.05)',
              color: T.ink2,
              font: `400 16px ${FONT_BODY}`,
              lineHeight: MATH_LINE_HEIGHT,
            }}
          >
            <p style={{ margin: 0 }}>
              Page ground, panel fill and card width are read off .um-topic and this card.
            </p>
          </div>
        </div>
      </TopicSurface>
    </>
  );
}

// See ../shell/page.tsx for why this is per-request rather than baked at build.
export const dynamic = 'force-dynamic';
