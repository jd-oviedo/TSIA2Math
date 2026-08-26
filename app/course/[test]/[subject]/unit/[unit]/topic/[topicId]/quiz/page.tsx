import { renderMarkdownWithMath, stripAuthoringBlocks } from '@/lib/curriculum-utils';
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
import { AnswerKey } from '../GumuGate';
import { resolveCourseAccess } from '../../../../../../../../lib/course-access';
import { allowsTopic } from '../../../../../../../../lib/capabilities';
import { MATH_LINE_HEIGHT } from '@/app/components/curriculum-theme';
import { T } from '../../../../../../../../components/curriculum-surface';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';

// Part 3: the mini quiz, gated at 3 of 4. The teacher-only answer key sits at
// the foot of this page, where the last of the topic's questions are.

export default async function QuizPage({ params }: { params: Promise<RouteParams> }) {
  const resolved = await params;
  const {
    topic,
    courseId,
    quizItems,
    quizInteractive,
    answerKey,
    answerKeyRaw,
    teacher,
    authSession,
    // signInHref is no longer destructured here. The old entry banner carried an
    // anonymous branch offering "Sign in and I'll come talk through any you
    // miss", which was dead code twice over: /course redirects a signed-out
    // visitor to /login before this renders (verify_auth_gate.mjs pins it), and
    // the offer it made was the tutor promise that is now gated anyway.
  } = await loadTopic(resolved);

  const [nav, gates, access] = await Promise.all([
    loadNavigation(courseId, topic.topic_id, 'quiz'),
    loadGates(authSession?.user?.id ?? null, courseId, topic.topic_id),
    // THE GATE THIS BANNER SHIPPED WITHOUT.
    //
    // The entry banner below promised every visitor "get one wrong and I'll come
    // talk it through with you", with no capability check anywhere on this route.
    // The tutor is Full Course; a free-tier student on the AR.1.4 sample holds
    // `curriculum` and NOT `gumu` (capabilities.ts freeSampleGrants), reaches
    // this page, and was told about a conversation their plan does not include.
    //
    // resolveCourseAccess + allowsTopic is the SAME pair the grader already uses
    // at api/curriculum/practice/route.ts:216 to decide whether a tutor session
    // may open at all. Deliberately not a second gating path: if these two ever
    // disagreed, the page would advertise a tutor the API then refuses.
    resolveCourseAccess(),
  ]);

  const tutorAvailable = allowsTopic(access, 'gumu', courseId, topic.topic_id);

  // Teachers get every worked solution, unconditionally, exactly as before.
  // Students get only the ones they have already answered correctly; the filter
  // runs server-side, so an unearned solution is never serialized to the page.
  // Anonymous visitors get undefined from loadEarnedSolutions and are unchanged.
  const solutions = teacher
    ? solutionsFor(answerKey.mini_quiz)
    : await loadEarnedSolutions(
        authSession?.user?.id ?? null,
        courseId,
        topic.topic_id,
        'mini_quiz'
      );

  const ungated = Boolean(teacher) || !gates.quizGated;

  return (
    <>
      {/* THE ENTRY STATE, TUTOR-ABSENT BY DEFAULT.
          ==========================================
          Absent is the DEFAULT rendering and the tutor card is additive, not the
          other way round. Written that way deliberately: the version that ships
          to the most restricted plan is the one that has to be complete and
          correct on its own, and building it as a fallback is how it ends up
          being the one nobody looks at.

          The design supplies no tutor-absent layout for this surface. Rather
          than invent chrome for it, the absent version is the same panel, the
          same rhythm, with the promise removed and the facts that are true for
          every plan kept. */}
      {tutorAvailable ? (
        <div
          className="um-gumu-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '26px',
            padding: '24px 28px',
            borderRadius: 0,
            background: T.tutorSurface,
            // Capped with the rest of the topic's column. This panel and its
            // tutor-absent twin below were the last two boxes on the quiz that
            // still tracked the window: they sit directly in .um-page, which
            // carries no max-width (layout.tsx:72-91), so on a wide monitor the
            // intro ran full-bleed while the prose card under it stopped at
            // 788. Same number, same flush-left rule, no margin: auto.
            maxWidth: 788,
          }}
        >
          <GumuAvatar size={64} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ font: `600 18px ${FONT_HEADING}`, color: T.tutorInk }}>
              Ready when you are.
            </div>
            <div
              style={{
                maxWidth: '520px',
                font: `400 13.5px ${FONT_BODY}`,
                lineHeight: 1.6,
                color: T.tutorInk2,
              }}
            >
              {quizItems.length > 0 ? `${quizItems.length} questions, no timer. ` : 'No timer. '}
              Get one wrong and I&apos;ll come talk it through with you.
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '20px 24px',
            borderRadius: 0,
            background: T.panel,
            // KEPT AS AN INSET RING, not converted to a border. This is the
            // panel's hairline already -- it is 1px, hard-edged and exactly
            // where a border would be -- and it is not the soft drop shadow the
            // flat pass removed elsewhere. Making it a real border would push
            // the box 2px wider and taller for no visible gain, since nothing
            // in this app sets box-sizing.
            boxShadow: `inset 0 0 0 1px ${T.hairline}`,
            // See the tutor-available panel above.
            maxWidth: 788,
          }}
        >
          <div style={{ font: `600 18px ${FONT_HEADING}`, color: T.ink }}>
            Four questions, and this topic is closed out.
          </div>
          <div
            style={{
              maxWidth: '520px',
              font: `400 13.5px ${FONT_BODY}`,
              lineHeight: 1.6,
              color: T.ink2,
            }}
          >
            {quizItems.length > 0
              ? `${quizItems.length} questions, no timer, and you can take it again.`
              : 'No timer, and you can take it again.'}{' '}
            You will see what you missed at the end.
          </div>
        </div>
      )}

      {quizInteractive ? (
        <GatedQuiz
          courseId={courseId}
          topicId={topic.topic_id}
          section="mini_quiz"
          items={quizItems}
          heading="Mini quiz"
          blurb={`${quizItems.length} questions · closes out the topic`}
          solutions={solutions}
          initialCorrect={ungated ? gates.quizRequired : gates.quizCorrect}
          required={gates.quizRequired}
          lessonHref={`/course/${resolved.test}/${resolved.subject}/unit/${resolved.unit}/topic/${topic.topic_id}/lesson`}
          previous={nav.previous}
          next={nav.next}
        />
      ) : (
        <>
          <SectionHeading title="Mini quiz" blurb="Closes out the topic" />
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
              // rail already anchors the column to the left edge. This page has
              // no rail, so centring was the obvious alternative and is not
              // taken: every sibling in this stack -- the heading, TopicNav, the
              // answer key -- is full-bleed, and a centred card would be the one
              // element in the column not sharing its left edge.
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
              __html: renderMarkdownWithMath(topic.mini_quiz?.raw || ''),
            }}
          />
          <TopicNav previous={nav.previous} next={nav.next} unlocked />
        </>
      )}

      {/* Teachers only, and absent rather than hidden for everyone else: with no
          teacher session there is nothing above to render from. */}
      {teacher && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <SectionHeading title="Answer key" blurb="Teacher view, one solution at a time" />
          <AnswerKey
            entries={answerKey}
            fallbackHtml={renderMarkdownWithMath(stripAuthoringBlocks(answerKeyRaw))}
          />
        </section>
      )}
    </>
  );
}
