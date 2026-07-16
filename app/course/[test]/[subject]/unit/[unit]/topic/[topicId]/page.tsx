import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { renderMarkdownWithMath } from '@/lib/curriculum-utils';

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
  
  return (
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
      
      {/* Practice Problems */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '1.5rem', color: '#0F1E35' }}>
          Part 2: Practice Problems
        </h2>
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
      </section>
      
      {/* Mini Quiz */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '1.5rem', color: '#0F1E35' }}>
          Part 3: Mini Quiz
        </h2>
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
      </section>
      
      {/* Answer Key */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '1.5rem', color: '#0F1E35' }}>
          Part 4: Answer Key
        </h2>
        <details style={{ cursor: 'pointer' }}>
          <summary style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F1E35' }}>
            Click to reveal answers
          </summary>
          <div
            style={{
              lineHeight: '1.8',
              marginTop: '1rem',
              marginBottom: '2rem',
              color: '#1A1A1A',
              fontSize: '16px',
            }}
            dangerouslySetInnerHTML={{
              __html: renderMarkdownWithMath(topic.answer_key?.raw || ''),
            }}
          />
        </details>
      </section>
    </div>
  );
}

export const revalidate = 3600; // Revalidate every hour