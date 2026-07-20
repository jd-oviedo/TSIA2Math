import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  renderMarkdownWithMath,
  renderInlineWithMath,
  stripAuthoringBlocks,
} from '@/lib/curriculum-utils';
import PracticeQuiz, { type PublicPracticeItem } from './PracticeQuiz';
import { GumuGateProvider, AnswerKey } from './GumuGate';

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

  // GUMU is authenticated-only, and this page renders no header, so a signed
  // out student has no way to discover sign-in from here. Reuses the existing
  // Google OAuth flow in app/login rather than adding a second one.
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();
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

  return (
    <GumuGateProvider>
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '2rem', fontSize: '14px', color: '#5F5E5A' }}>
        <a href={`/course/${test}/${subject}`}>{subject}</a>
        {' > '}
        <a href={`/course/${test}/${subject}/unit/${unit}`}>Unit {unit}</a>
        {' > '}
        <span>{topic.topic_id}</span>
      </div>
      
      {/* Header */}
      <h1 style={{ fontSize: '28px', color: '#0F1E35', marginBottom: '0.5rem' }}>
        {topic.topic_name}
      </h1>
      <p style={{ color: '#5F5E5A', marginBottom: '2rem' }}>
        Estimated time: {topic.estimated_time_minutes} minutes
      </p>
      
      {/* Guided Notes */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '1.5rem', color: '#0F1E35' }}>
          Part 1: Guided Notes
        </h2>
        <div
          style={{
            lineHeight: '1.8',
            marginBottom: '2rem',
            color: '#1A1A1A',
            fontSize: '16px',
          }}
          dangerouslySetInnerHTML={{
            __html: renderMarkdownWithMath(topic.guided_notes),
          }}
        />
      </section>
      
      {!authSession && (
        <div
          style={{
            border: '1px solid #D8D6D1',
            borderRadius: '8px',
            padding: '0.9rem 1.1rem',
            marginBottom: '2rem',
            background: '#F4F2ED',
            color: '#1A1A1A',
            fontSize: '15px',
            lineHeight: 1.6,
          }}
        >
          <a href={signInHref} style={{ color: '#0F1E35', fontWeight: 600 }}>
            Sign in with Google
          </a>{' '}
          to check your answers and work through the ones you miss with GUMU.
        </div>
      )}

      {/* Practice Problems */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '1.5rem', color: '#0F1E35' }}>
          Part 2: Practice Problems
        </h2>
        {practiceInteractive ? (
          <PracticeQuiz
            courseId={courseId}
            topicId={topic.topic_id}
            section="practice"
            items={practiceItems}
          />
        ) : (
          <div
            style={{
              lineHeight: '1.8',
              marginBottom: '2rem',
              color: '#1A1A1A',
              fontSize: '16px',
            }}
            dangerouslySetInnerHTML={{
              __html: renderMarkdownWithMath(topic.practice_problems?.raw || ''),
            }}
          />
        )}
      </section>
      
      {/* Mini Quiz */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '1.5rem', color: '#0F1E35' }}>
          Part 3: Mini Quiz
        </h2>
        {quizInteractive ? (
          <PracticeQuiz
            courseId={courseId}
            topicId={topic.topic_id}
            section="mini_quiz"
            items={quizItems}
          />
        ) : (
          <div
            style={{
              lineHeight: '1.8',
              marginBottom: '2rem',
              color: '#1A1A1A',
              fontSize: '16px',
            }}
            dangerouslySetInnerHTML={{
              __html: renderMarkdownWithMath(topic.mini_quiz?.raw || ''),
            }}
          />
        )}
      </section>
      
      {/* Answer Key */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '1.5rem', color: '#0F1E35' }}>
          Part 4: Answer Key
        </h2>
        <AnswerKey
          html={renderMarkdownWithMath(
            stripAuthoringBlocks(topic.answer_key?.raw || '')
          )}
        />
      </section>
    </div>
    </GumuGateProvider>
  );
}

export const revalidate = 3600; // Revalidate every hour