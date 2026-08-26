import { renderMarkdownWithMath } from '@/lib/curriculum-utils';
import {
  loadTopic,
  loadNavigation,
  loadGates,
  loadEarnedSolutions,
  solutionsFor,
  type RouteParams,
} from '../topic-data';
import GatedQuiz from '../GatedQuiz';
import TopicNav from '../TopicNav';
import SectionHeading from '../SectionHeading';
import GumuAvatar from '../GumuAvatar';
import { resolveCourseAccess } from '../../../../../../../../lib/course-access';
import { allowsTopic } from '../../../../../../../../lib/capabilities';
import { MATH_LINE_HEIGHT } from '@/app/components/curriculum-theme';
import { T } from '../../../../../../../../components/curriculum-surface';
import { FONT_BODY } from '@/app/components/fonts';

// Part 2: practice.
//
// Two shapes. Most topics are interactive multiple choice, graded server-side,
// and gated at 7 of 10. QR.1.1's practice is written work with nothing to
// submit, so it renders as static text and carries no gate at all -- detected
// the same way it always has been, off practice_items.practice.interactive.

export default async function PracticePage({ params }: { params: Promise<RouteParams> }) {
  const resolved = await params;
  const {
    topic,
    courseId,
    practiceItems,
    practiceInteractive,
    answerKey,
    teacher,
    authSession,
  } = await loadTopic(resolved);

  const [nav, gates, access] = await Promise.all([
    loadNavigation(courseId, topic.topic_id, 'practice'),
    loadGates(authSession?.user?.id ?? null, courseId, topic.topic_id),
    // The same resolver and the same predicate the grader uses at
    // api/curriculum/practice/route.ts:216, so this page and the API that backs
    // it cannot disagree about whether a tutor exists for this viewer.
    resolveCourseAccess(),
  ]);

  const tutorAvailable = allowsTopic(access, 'gumu', courseId, topic.topic_id);

  // Teachers get every worked solution, unconditionally, exactly as before.
  // Students get only the ones they have already answered correctly; the filter
  // runs server-side, so an unearned solution is never serialized to the page.
  // Anonymous visitors get undefined from loadEarnedSolutions and are unchanged.
  const solutions = teacher
    ? solutionsFor(answerKey.practice)
    : await loadEarnedSolutions(
        authSession?.user?.id ?? null,
        courseId,
        topic.topic_id,
        'practice'
      );

  // Teachers are previewing, not studying, so nothing is held back from them.
  const ungated = Boolean(teacher) || !gates.practiceGated;

  if (!practiceInteractive) {
    return (
      <>
        <SectionHeading
          title="Practice"
          blurb="Written work, nothing to submit"
          chip="Work it out on paper"
        />
        <p
          style={{
            margin: 0,
            font: `400 14px ${FONT_BODY}`,
            lineHeight: 1.65,
            color: T.muted,
          }}
        >
          This topic&apos;s practice is written work rather than multiple choice, so there&apos;s
          nothing to submit here. Work it out
          {teacher ? ', compare against the answer key,' : ','} then carry on to the mini quiz,
          which is fully interactive.
        </p>
        <div
          className="um-prose um-prose-card"
          style={{
            background: T.panel,
            border: `1px solid ${T.hairline}`,
            // ALIGNED TO THE FIELDSET, 2026-08-26. This was 16 while the problem
            // frame a student meets on every other topic (PracticeQuiz.tsx:371)
            // has been 0 all along, so the one non-interactive topic was the
            // only round card left in the tree.
            borderRadius: 0,
            padding: '24px 26px',
            // The measure, capped at the lesson column's width so a line of
            // prose is the same length in all three parts of a topic.
            //
            // FLUSH LEFT, NO margin: auto, AND THAT MATCHES LessonBody:362
            // RATHER THAN DIVERGING FROM IT. The lesson caps its measure and
            // lets the ground run on past it (LessonBody.tsx:46), because the
            // rail already anchors the column to the left edge. This page has no
            // rail, so centring was the obvious alternative and is not taken:
            // every sibling in this stack -- the heading, the intro copy, the
            // tutor line, TopicNav -- is full-bleed, and a centred card would be
            // the one element in the column not sharing its left edge.
            //
            // The cap goes on the CARD and not on .um-page, which is what
            // layout.tsx:85-89 says to do when this needs revisiting: the page
            // keeps filling the viewport and only the line length is capped.
            maxWidth: 788,
            // NO SHADOW, for the reason recorded on the fieldset: a soft drop
            // shadow under a radius-0 card is the half-converted state. The
            // hairline border above is what separates this from the ground.
            color: T.ink2,
            font: `400 16px ${FONT_BODY}`,
            lineHeight: MATH_LINE_HEIGHT,
          }}
          dangerouslySetInnerHTML={{
            __html: renderMarkdownWithMath(topic.practice_problems?.raw || ''),
          }}
        />
        {/* THE TUTOR LINE, GATED. Absent is the default.
            ============================================
            This banner told every visitor that the tutor "comes in on the mini
            quiz", with no capability check on the route. Narrower exposure than
            the quiz entry banner, because this branch only renders for
            NON-INTERACTIVE practice, which today is QR.1.1 alone, and the free
            sample is AR.1.4, so no free-tier student reaches it right now. That
            is a fact about which topic happens to be the sample, not a gate, and
            it stops being true the moment the sample changes. Gated on the same
            pair as the quiz entry and the grader.

            The absent version keeps the one thing that is true on every plan --
            nothing in this section is graded -- and drops the promise. */}
        {tutorAvailable ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 18px',
              borderRadius: '14px',
              background: T.tutorSurface,
            }}
          >
            <GumuAvatar size={40} title="" />
            <div
              style={{
                flex: 1,
                font: `400 13.5px ${FONT_BODY}`,
                lineHeight: 1.55,
                color: T.tutorInk2,
              }}
            >
              Nothing here is graded. Mu comes in on the mini quiz, as soon as
              there&apos;s a wrong answer worth talking about.
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '14px',
              background: T.quietBox,
              font: `400 13.5px ${FONT_BODY}`,
              lineHeight: 1.55,
              color: T.ink2,
            }}
          >
            Nothing here is graded. Work through it at your own pace, then the mini
            quiz closes out the topic.
          </div>
        )}

        {/* No gate: there is no gradable practice here to clear. */}
        <TopicNav previous={nav.previous} next={nav.next} unlocked />
      </>
    );
  }

  return (
    <GatedQuiz
      courseId={courseId}
      topicId={topic.topic_id}
      section="practice"
      items={practiceItems}
      heading="Practice"
      blurb={`${practiceItems.length} problems · work through at your own pace`}
      solutions={solutions}
      initialCorrect={ungated ? gates.practiceRequired : gates.practiceCorrect}
      // The strip's cross-visit seeding. practiceSolved is per-item and already
      // computed here for loadEarnedSolutions; an array because a Set would have
      // to cross the server/client boundary.
      solvedBefore={[...gates.practiceSolved]}
      required={gates.practiceRequired}
      previous={nav.previous}
      next={nav.next}
    />
  );
}
