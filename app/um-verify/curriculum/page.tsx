import { notFound } from 'next/navigation';
import { TOPIC_PAGE_CSS } from '../../course/[test]/[subject]/unit/[unit]/topic/[topicId]/topic-page-css';
import TopicSurface from '../../components/TopicSurface';
import TopicChrome from '../../course/[test]/[subject]/unit/[unit]/topic/[topicId]/TopicChrome';
import GumuAvatar from '../../course/[test]/[subject]/unit/[unit]/topic/[topicId]/GumuAvatar';
import { T } from '../../components/curriculum-surface';
import { C, MATH_LINE_HEIGHT } from '../../components/curriculum-theme';
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
        {/* THE REAL BAR, NOT A HAND-WRITTEN ONE.
            TopicChrome takes eight plain string props and reads nothing: the
            trigger is a pure button, the drawer only mounts once opened, and
            SupportModal only fetches on submit. So the lane can mount the
            component a student actually gets rather than a div wearing
            --umt-tab-active-bg, which would only prove the probe agrees with
            itself.

            part="lesson" makes the Lesson segment the current one, and the
            assertions select it by aria-current="page" -- the real
            accessibility marker the component already sets, not a test hook
            added for the probe. The inactive segments are `transparent`, so
            reading one of those measures the bar showing through, which is
            exactly the comparison the active fill has to win. */}
        <TopicChrome
          name="Verify Lane"
          role="student"
          test="qr"
          subject="math"
          subjectLabel="Math"
          unit="1"
          topicId="QR.1.1"
          part="lesson"
        />
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
              // Copied from practice/page.tsx:109 and quiz/page.tsx:192 with
              // the rest of the card. This is the value the width assertion in
              // scripts/verify_ui_lane.mjs reads, so if the two real pages ever
              // change their cap and this does not, the lane stops measuring
              // them and starts measuring itself.
              maxWidth: 788,
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

          {/* THE MASCOT, AT ALL FOUR CONFIGURATIONS THE LIVE SITES USE.
              GumuAvatar takes a size and an optional title and reads nothing,
              so the lane can mount the real component rather than an <img> the
              probe wrote itself.

              Each ground is the ground the real site paints, because the plate
              question was a contrast question and a probe on the wrong ground
              would answer a different one. quiz and practice sit on
              T.tutorSurface, GumuChat's intro panel on C.gumuBanner (hardcoded
              there, not themed), and its header row on T.insetRow -- the one
              site that is light in light theme.

              THE PLATE ASSERTION IS STRUCTURAL, not a colour read. With the
              plate, GumuAvatar returned a wrapping <div> carrying
              C.gumuSurface and the <img> was its child. Without it the <img>
              is the root. So `[data-probe] > *` resolving to IMG is the plate
              being gone, and it cannot pass by accident the way a
              background-color read on a transparent element can. */}
          <div
            data-probe="mu-grounds"
            style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: 788 }}
          >
            <div data-probe="mu-quiz" style={{ background: T.tutorSurface, padding: '24px 28px' }}>
              <GumuAvatar size={64} />
            </div>
            <div data-probe="mu-practice" style={{ background: T.tutorSurface, padding: '14px 18px' }}>
              <GumuAvatar size={40} title="" />
            </div>
            <div data-probe="mu-chat-intro" style={{ background: C.gumuBanner, padding: '18px 20px' }}>
              <GumuAvatar size={44} title="" />
            </div>
            <div data-probe="mu-chat-header" style={{ background: T.insetRow, padding: '18px 20px' }}>
              <GumuAvatar size={48} />
            </div>
          </div>
        </div>
      </TopicSurface>
    </>
  );
}

// See ../shell/page.tsx for why this is per-request rather than baked at build.
export const dynamic = 'force-dynamic';
