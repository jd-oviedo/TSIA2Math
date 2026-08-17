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
import { C, ink, onDark, MATH_LINE_HEIGHT } from '@/app/components/curriculum-theme';
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

  const [nav, gates] = await Promise.all([
    loadNavigation(courseId, topic.topic_id, 'practice'),
    loadGates(authSession?.user?.id ?? null, courseId, topic.topic_id),
  ]);

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
            color: ink(0.6),
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
            __html: renderMarkdownWithMath(topic.practice_problems?.raw || ''),
          }}
        />
        {/* The design pairs this fallback with an "Ask GUMU" button. A session
            needs a graded wrong multiple-choice answer to open, so on a
            written-work section there is nothing for him to start from. He is
            introduced here instead. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 18px',
            borderRadius: '14px',
            background: C.gumuBanner,
          }}
        >
          <GumuAvatar size={40} plate title="" />
          <div
            style={{
              flex: 1,
              font: `400 13.5px ${FONT_BODY}`,
              lineHeight: 1.55,
              color: onDark(0.75),
            }}
          >
            Nothing here is graded. GUMU comes in on the mini quiz, as soon as there&apos;s a
            wrong answer worth talking about.
          </div>
        </div>

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
      required={gates.practiceRequired}
      previous={nav.previous}
      next={nav.next}
    />
  );
}
