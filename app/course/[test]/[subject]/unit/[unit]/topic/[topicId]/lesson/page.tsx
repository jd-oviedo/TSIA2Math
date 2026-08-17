import { renderMarkdownWithMath } from '@/lib/curriculum-utils';
import { loadTopic, loadNavigation, loadGates, type RouteParams } from '../topic-data';
import LessonBody from '../LessonBody';
import SectionHeading from '../SectionHeading';

// Part 1: guided notes. Unlocking Next needs the student to have reached the
// end of the content, which LessonBody watches for.

export default async function LessonPage({ params }: { params: Promise<RouteParams> }) {
  const resolved = await params;
  const { topic, courseId, authSession, practiceItems, practiceInteractive } =
    await loadTopic(resolved);

  const [nav, gates] = await Promise.all([
    loadNavigation(courseId, topic.topic_id, 'lesson'),
    loadGates(authSession?.user?.id ?? null, courseId, topic.topic_id),
  ]);

  return (
    <>
      <SectionHeading
        title="Guided notes"
        blurb={
          topic.estimated_time_minutes
            ? `Read this first · about ${topic.estimated_time_minutes} minutes for the whole topic`
            : 'Read this first'
        }
      />
      <LessonBody
        html={renderMarkdownWithMath(topic.guided_notes)}
        initialDone={gates.lessonDone}
        courseId={courseId}
        topicId={topic.topic_id}
        canRecord={Boolean(authSession)}
        previous={nav.previous}
        next={nav.next}
        practiceHref={`/course/${resolved.test}/${resolved.subject}/unit/${resolved.unit}/topic/${topic.topic_id}/practice`}
        practiceCount={practiceItems.length}
        practiceInteractive={practiceInteractive}
      />
    </>
  );
}
