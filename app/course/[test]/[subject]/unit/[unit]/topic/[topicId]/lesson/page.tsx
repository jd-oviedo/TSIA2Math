import { renderMarkdownWithMath, splitGuidedNotes } from '@/lib/curriculum-utils';
import { loadTopic, loadNavigation, loadGates, type RouteParams } from '../topic-data';
import LessonBody from '../LessonBody';
import SectionHeading from '../SectionHeading';

// Part 1: guided notes. Unlocking Next needs the student to have reached the
// end of the content, which LessonBody watches for.

// renderMarkdownWithMath returns a BLOCK: its output is wrapped in a <p>, which
// is right for a section of notes and wrong for a single row of a list, where
// the paragraph's margins would set the row height instead of the row's own
// padding. Each objective is one authored line with no block syntax in it, so it
// is always exactly one paragraph, and the sole wrapper is unwrapped here so the
// inline content -- KaTeX spans included -- is what reaches the row.
//
// Guarded rather than regex-stripped: anything that is not a single paragraph is
// handed back untouched, so a future multi-block objective degrades to a
// slightly tall row instead of to broken markup.
function unwrapParagraph(html: string): string {
  const trimmed = html.trim();
  return trimmed.startsWith('<p>') &&
    trimmed.endsWith('</p>') &&
    trimmed.indexOf('<p>', 3) === -1
    ? trimmed.slice(3, -4)
    : trimmed;
}

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
        // Rendered HERE, on the server, for the same reason the notes below are:
        // LessonBody is a client component, and rendering these inside it would
        // pull remark and KaTeX into the browser bundle. So LessonBody receives
        // HTML it only has to print, never markdown it has to parse.
        objectives={(topic.objectives ?? []).map((line) =>
          unwrapParagraph(renderMarkdownWithMath(line)),
        )}
        // Both are passed: `sections` is what renders, and `html` is the whole
        // blob the page falls back to if the notes could not be split. Rendering
        // happens here on the server, so LessonBody -- a client component --
        // never pulls remark and KaTeX into the browser bundle.
        sections={splitGuidedNotes(topic.guided_notes)}
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
