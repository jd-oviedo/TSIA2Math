import { notFound } from 'next/navigation';
// Two clients on purpose. The topic content is public, so it is read with the
// plain anon client. Anything that depends on who is asking has to go through
// the cookie-aware SSR client instead: lib/supabase/server.ts builds a client
// with no cookie storage at all, so auth.getSession() on it is null for
// everyone, signed in or not.
import { createClient } from '@/lib/supabase/server';
import { createClient as createSessionClient } from '@/app/lib/supabase-server';
import { requireTeacher } from '@/app/lib/auth';
import {
  renderMarkdownWithMath,
  renderInlineWithMath,
  stripAuthoringBlocks,
  splitAnswerKey,
} from '@/lib/curriculum-utils';
import PracticeQuiz, { type PublicPracticeItem } from './PracticeQuiz';
import { GumuGateProvider, AnswerKey } from './GumuGate';
import GumuAvatar from './GumuAvatar';
import { C, ink, onDark, EYEBROW, MATH_LINE_HEIGHT } from './curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';
import { TOPIC_PAGE_CSS } from './topic-page-css';

// One parsed item as it is stored in curriculum_topics.practice_items. Two of
// these fields are answer-bearing and stay on the server: correct_answer
// obviously, and misconception_tag because it tags exactly the three wrong
// options, so the untagged letter is the answer.
type StoredPracticeItem = {
  item_number: number;
  format: 'multiple_choice' | 'free_response';
  stem: string;
  choices: Record<string, string>;
  correct_answer: string | null;
  misconception_tag: Record<string, string>;
  level: string | null;
};

type StoredSection = {
  interactive: boolean;
  items: StoredPracticeItem[];
};

// Strips the answer-bearing fields and pre-renders the math. Rendering here
// rather than in the client component keeps the whole remark/KaTeX pipeline
// out of the browser bundle, and it is the same pipeline the static markdown
// already goes through, so the two render identically.
function toPublicItems(section: StoredSection | undefined): PublicPracticeItem[] {
  return (section?.items ?? [])
    .filter((item) => item.format === 'multiple_choice')
    .map((item) => ({
      item_number: item.item_number,
      level: item.level,
      stem_html: renderInlineWithMath(item.stem),
      choices_html: Object.fromEntries(
        Object.entries(item.choices).map(([letter, text]) => [
          letter,
          renderInlineWithMath(text),
        ])
      ),
    }));
}

type Props = {
  params: Promise<{
    test: string;
    subject: string;
    unit: string;
    topicId: string;
  }>;
};

export default async function CurriculumTopicPage({ params }: Props) {
  const { test, subject, unit, topicId } = await params;

  // Map route params to course_id
  const courseId = `${test}-${subject}`;

  // Create Supabase client
  const supabase = await createClient();

  // Fetch curriculum topic
  const { data: topic, error } = await supabase
    .from('curriculum_topics')
    .select('*')
    .eq('course_id', courseId)
    .eq('topic_id', topicId)
    .single();

  if (error || !topic) {
    notFound();
  }

  // GUMU is authenticated-only, and this page renders no app header, so a
  // signed out student has no way to discover sign-in from here. Reuses the
  // existing Google OAuth flow in app/login rather than adding a second one.
  const sessionClient = await createSessionClient();
  const {
    data: { session: authSession },
  } = await sessionClient.auth.getSession();
  const signInHref = `/login?next=${encodeURIComponent(
    `/course/${test}/${subject}/unit/${unit}/topic/${topicId}`
  )}`;

  // `interactive` is false when a section holds anything the quiz cannot grade
  // -- QR.1.1's practice section is mostly free-response -- and practice_items
  // is an empty object on any topic uploaded before the parser existed. Both
  // fall back to the static markdown that was here before.
  const practiceSection: StoredSection | undefined = topic.practice_items?.practice;
  const quizSection: StoredSection | undefined = topic.practice_items?.mini_quiz;
  const practiceItems = toPublicItems(practiceSection);
  const quizItems = toPublicItems(quizSection);
  const practiceInteractive = Boolean(practiceSection?.interactive) && practiceItems.length > 0;
  const quizInteractive = Boolean(quizSection?.interactive) && quizItems.length > 0;

  // Part 4 is teacher-only. Not hidden in the browser -- parsed only when the
  // session belongs to an active teacher, so a student's page never carries the
  // worked solutions in its payload at all. This is a different gate from the
  // per-question reveal in /api/curriculum/practice, which still hands an
  // authenticated student the explanation for an item they have attempted.
  //
  // Both consumers hang off this: the answer key section at the foot of the
  // page, and the per-card "reveal worked solution" link. A student gets
  // neither.
  const teacher = await requireTeacher();
  const answerKeyRaw = teacher ? topic.answer_key?.raw || '' : '';
  const answerKey = teacher
    ? splitAnswerKey(answerKeyRaw)
    : { practice: [], mini_quiz: [] };
  const solutionsFor = (entries: typeof answerKey.practice) =>
    entries.length > 0
      ? Object.fromEntries(entries.map((entry) => [entry.item_number, entry.solution_html]))
      : undefined;

  const subjectLabel = subject.replace(/-/g, ' ');

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
        {/* Slim course bar. The design's version also carries unit progress and
            the student's avatar; both need queries this page does not make, so
            they are left out rather than faked. */}
        <div
          className="um-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            padding: '14px 26px',
            background: C.paper,
            borderBottom: `1px solid ${ink(0.09)}`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/unpackmath-wordmark.png"
            alt="UnpackMath"
            style={{ height: '24px', width: 'auto', display: 'block' }}
          />
          <div style={{ width: '1px', height: '22px', background: ink(0.12) }} />
          <div
            className="um-bar-trail"
            style={{ font: `400 13px ${FONT_BODY}`, color: ink(0.6), lineHeight: 1.3 }}
          >
            <a href={`/course/${test}/${subject}`} style={{ color: 'inherit' }}>
              {test.toUpperCase()} · <span style={{ textTransform: 'capitalize' }}>{subjectLabel}</span>
            </a>
            <span style={{ color: ink(0.3), padding: '0 6px' }}>/</span>
            <a href={`/course/${test}/${subject}/unit/${unit}`} style={{ color: 'inherit' }}>
              Unit {unit}
            </a>
          </div>
        </div>

        <div
          className="um-page"
          style={{
            maxWidth: '860px',
            margin: '0 auto',
            padding: '30px 34px 72px',
            display: 'flex',
            flexDirection: 'column',
            gap: '34px',
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
            <p
              style={{
                margin: 0,
                maxWidth: '640px',
                font: `400 15.5px ${FONT_BODY}`,
                lineHeight: 1.65,
                color: ink(0.65),
                textWrap: 'pretty',
              }}
            >
              {practiceItems.length > 0
                ? `${practiceItems.length} practice problems, then a ${quizItems.length}-question mini quiz.`
                : 'Guided notes, practice, then a mini quiz.'}{' '}
              About {topic.estimated_time_minutes} minutes.
            </p>
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
              <span>to check your answers and work through the ones you miss with GUMU.</span>
            </div>
          )}

          {/* Guided notes. The design import has no treatment for this section,
              so it gets the plain reading card the rest of the page implies. */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <SectionHeading title="Guided notes" blurb="Read this first" />
            <div
              className="um-prose um-prose-card"
              style={{
                background: C.paper,
                border: `1px solid ${ink(0.09)}`,
                borderRadius: '16px',
                padding: '26px 28px',
                boxShadow: '0 1px 3px rgba(14,14,17,.05)',
                color: ink(0.82),
                font: `400 16px ${FONT_BODY}`,
                lineHeight: MATH_LINE_HEIGHT,
              }}
              dangerouslySetInnerHTML={{
                __html: renderMarkdownWithMath(topic.guided_notes),
              }}
            />
          </section>

          <section>
            {practiceInteractive ? (
              <PracticeQuiz
                courseId={courseId}
                topicId={topic.topic_id}
                section="practice"
                items={practiceItems}
                heading="Practice"
                blurb={`${practiceItems.length} problems · work through at your own pace`}
                solutions={solutionsFor(answerKey.practice)}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                  This topic&apos;s practice is written work rather than multiple choice, so
                  there&apos;s nothing to submit here. Work it out
                  {teacher ? ', compare against the answer key at the bottom,' : ','} then the
                  mini quiz below is fully interactive.
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
                {/* The design pairs this fallback with an "Ask GUMU" button.
                    A session needs a graded wrong multiple-choice answer to
                    open, so on a written-work section there is nothing for him
                    to start from. He is introduced here instead. */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    background: C.midnight,
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
                    Nothing here is graded. GUMU comes in on the mini quiz below, as soon as
                    there&apos;s a wrong answer worth talking about.
                  </div>
                </div>
              </div>
            )}
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* GUMU's first appearance on the page, so the student meets the
                character before they are ever stuck. */}
            <div
              className="um-gumu-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '26px',
                padding: '24px 28px',
                borderRadius: '16px',
                background: C.midnight,
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
              <PracticeQuiz
                courseId={courseId}
                topicId={topic.topic_id}
                section="mini_quiz"
                items={quizItems}
                heading="Mini quiz"
                blurb={`${quizItems.length} questions · closes out the topic`}
                solutions={solutionsFor(answerKey.mini_quiz)}
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
              </>
            )}
          </section>

          {/* Teachers only, and absent rather than hidden for everyone else:
              with no teacher session there is nothing above to render from. */}
          {teacher && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <SectionHeading title="Answer key" blurb="Teacher view, one solution at a time" />
              <AnswerKey
                entries={answerKey}
                fallbackHtml={renderMarkdownWithMath(stripAuthoringBlocks(answerKeyRaw))}
              />
            </section>
          )}
        </div>
      </div>
    </GumuGateProvider>
  );
}

function SectionHeading({
  title,
  blurb,
  chip,
}: {
  title: string;
  blurb: string;
  chip?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
      <h2 style={{ margin: 0, font: `600 19px ${FONT_HEADING}`, color: C.midnight }}>{title}</h2>
      {chip && (
        <span
          style={{
            padding: '5px 11px',
            borderRadius: '20px',
            background: '#DFE9F2',
            font: `500 11.5px ${FONT_BODY}`,
            color: '#3F6B94',
          }}
        >
          {chip}
        </span>
      )}
      <span style={{ font: `400 13px ${FONT_BODY}`, color: ink(0.45) }}>{blurb}</span>
    </div>
  );
}

// The page used to carry `revalidate = 3600`. It now renders different content
// for a teacher than for a student, so nothing about it is safe to hold in a
// shared cache keyed only on the URL.
export const dynamic = 'force-dynamic';
