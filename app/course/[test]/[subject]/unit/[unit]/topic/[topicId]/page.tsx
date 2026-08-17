import { loadTopic, loadTopicGates, type RouteParams } from './topic-data';
import TopicOverview, { type PartState } from './TopicOverview';
import { lessonSectionCount } from '@/app/lib/lesson-sections';
import { topicPlan } from '@/app/lib/topic-parts';

// The topic doorway.
//
// This used to redirect straight to /lesson, which meant the three parts, the
// thresholds between them and how far a student had got were all things you
// found out by walking into them. Both surfaces that link to a topic point
// here -- app/dashboard/modules/page.tsx and the Home recommendation card in
// app/lib/recommendation.ts, both via topicHref() -- so this is where a student
// arrives from the rest of the app, and it was the one step that told them
// nothing.
//
// It adds no rule. Everything on it is read out of the gate state the three
// sub-pages already enforce. See TopicOverview and app/lib/topic-parts.ts for
// what is deliberately absent: no locked parts, and no section-level resume.
//
// WHY loadTopicGates AND NOT loadGates
// ------------------------------------
// loadGates resolves the topic's shape out of getTopics(), which selects
// practice_items for every topic in the course. On lesson, practice and quiz
// that is free: loadNavigation on the same page already pays for it and cache()
// collapses them to one read. This page has no navigation, so nothing here
// would share that cost, and it would be pulling the whole course's authored
// content to read one topic's item counts -- on a route that until now was a
// redirect and cost nothing at all. loadTopicGates does the same gate maths off
// a single-row read instead.

export default async function TopicIndexPage({ params }: { params: Promise<RouteParams> }) {
  const resolved = await params;
  const { topic, courseId, authSession } = await loadTopic(resolved);

  const gates = await loadTopicGates(authSession?.user?.id ?? null, courseId, topic.topic_id);

  const practiceCount = topic.practice_items?.practice?.items?.length ?? 0;
  const quizCount = topic.practice_items?.mini_quiz?.items?.length ?? 0;

  const plan = topicPlan({
    lessonDone: gates.lessonDone,
    practiceGated: gates.practiceGated,
    practiceCount,
    practiceCorrect: gates.practiceCorrect,
    practiceRequired: gates.practiceRequired,
    quizGated: gates.quizGated,
    quizCount,
    quizCorrect: gates.quizCorrect,
    quizRequired: gates.quizRequired,
    sectionCount: lessonSectionCount(topic.guided_notes),
  });

  const { test, subject, unit } = resolved;
  const base = `/course/${test}/${subject}/unit/${unit}/topic/${topic.topic_id}`;
  const hrefFor = (kind: 'lesson' | 'practice' | 'quiz') => `${base}/${kind}`;

  const parts: PartState[] = plan.parts.map((part) => ({
    ...part,
    href: hrefFor(part.kind),
  }));

  return (
    <TopicOverview
      parts={parts}
      primary={{ href: hrefFor(plan.resume.kind), label: plan.resume.label }}
      estimatedMinutes={topic.estimated_time_minutes}
    />
  );
}
