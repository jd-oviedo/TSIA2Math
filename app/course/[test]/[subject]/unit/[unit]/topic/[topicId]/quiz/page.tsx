import { renderMarkdownWithMath, stripAuthoringBlocks } from '@/lib/curriculum-utils';
import {
  loadTopic,
  loadNavigation,
  loadGates,
  solutionsFor,
  type RouteParams,
} from '../topic-data';
import GatedQuiz from '../GatedQuiz';
import TopicNav from '../TopicNav';
import SectionHeading from '../SectionHeading';
import GumuAvatar from '../GumuAvatar';
import { AnswerKey } from '../GumuGate';
import { C, ink, onDark, MATH_LINE_HEIGHT } from '@/app/components/curriculum-theme';
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
    signInHref,
  } = await loadTopic(resolved);

  const [nav, gates] = await Promise.all([
    loadNavigation(courseId, topic.topic_id, 'quiz'),
    loadGates(authSession?.user?.id ?? null, courseId, topic.topic_id),
  ]);

  const ungated = Boolean(teacher) || !gates.quizGated;

  return (
    <>
      {/* GUMU introduces himself before the student is ever stuck. */}
      <div
        className="um-gumu-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '26px',
          padding: '24px 28px',
          borderRadius: '16px',
          background: C.gumuBanner,
        }}
      >
        <GumuAvatar size={64} plate />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ font: `600 18px ${FONT_HEADING}`, color: C.sand }}>
            Ready when you are.
          </div>
          <div
            style={{
              maxWidth: '520px',
              font: `400 13.5px ${FONT_BODY}`,
              lineHeight: 1.6,
              color: onDark(0.6),
            }}
          >
            {quizItems.length > 0 ? `${quizItems.length} questions, no timer. ` : 'No timer. '}
            {authSession ? (
              <>Get one wrong and I&apos;ll come talk it through with you.</>
            ) : (
              <>
                <a href={signInHref} style={{ color: C.sunset, fontWeight: 600 }}>
                  Sign in
                </a>{' '}
                and I&apos;ll come talk through any you miss.
              </>
            )}
          </div>
        </div>
      </div>

      {quizInteractive ? (
        <GatedQuiz
          courseId={courseId}
          topicId={topic.topic_id}
          section="mini_quiz"
          items={quizItems}
          heading="Mini quiz"
          blurb={`${quizItems.length} questions · closes out the topic`}
          solutions={solutionsFor(answerKey.mini_quiz)}
          initialCorrect={ungated ? gates.quizRequired : gates.quizCorrect}
          required={gates.quizRequired}
          previous={nav.previous}
          next={nav.next}
        />
      ) : (
        <>
          <SectionHeading title="Mini quiz" blurb="Closes out the topic" />
          <div
            className="um-prose um-prose-card"
            style={{
              background: C.paper,
              border: `1px solid ${ink(0.09)}`,
              borderRadius: '16px',
              padding: '24px 26px',
              boxShadow: '0 1px 3px rgba(14,14,17,.05)',
              color: ink(0.82),
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
