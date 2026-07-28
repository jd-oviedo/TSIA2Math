import { redirect } from 'next/navigation';
import type { RouteParams } from './topic-data';

// The topic used to be one long page. It is three routes now -- lesson,
// practice, quiz -- and this is the entry point, so any link to the bare topic
// lands on the guided notes.

export default async function TopicIndexPage({ params }: { params: Promise<RouteParams> }) {
  const { test, subject, unit, topicId } = await params;
  redirect(`/course/${test}/${subject}/unit/${unit}/topic/${topicId}/lesson`);
}
