import { cache } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSessionClient } from '@/app/lib/supabase-server';
import { createAdminClient } from '@/app/lib/supabase-admin';
import { requireTeacher } from '@/app/lib/auth';
import { renderInlineWithMath, splitAnswerKey } from '@/lib/curriculum-utils';
import {
  getTopics,
  getTopicAttempts,
  correctInSection,
  requiredCorrect,
  buildSequence,
  findStepIndex,
  stepHref,
  topicKey,
  type Step,
  type StepKind,
  type TopicShape,
} from '@/app/lib/curriculum-progress';
import type { PublicPracticeItem } from './PracticeQuiz';

// Everything the three topic sub-pages share.
//
// Wrapped in React's cache() so the layout and the page inside it resolve one
// fetch per request rather than two: both need the topic, and the layout draws
// the header while the page draws the body.

export type StoredPracticeItem = {
  item_number: number;
  format: 'multiple_choice' | 'free_response';
  stem: string;
  choices: Record<string, string>;
  correct_answer: string | null;
  misconception_tag: Record<string, string>;
  level: string | null;
};

export type StoredSection = {
  interactive: boolean;
  items: StoredPracticeItem[];
};

export type RouteParams = {
  test: string;
  subject: string;
  unit: string;
  topicId: string;
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

export const loadTopic = cache(async (params: RouteParams) => {
  const { test, subject, unit, topicId } = params;
  const courseId = `${test}-${subject}`;

  // Two clients on purpose. The topic content is public, so it is read with the
  // plain anon client. Anything that depends on who is asking has to go through
  // the cookie-aware SSR client instead: lib/supabase/server.ts builds a client
  // with no cookie storage at all, so auth.getSession() on it is null for
  // everyone, signed in or not.
  const supabase = await createClient();
  const { data: topic, error } = await supabase
    .from('curriculum_topics')
    .select('*')
    .eq('course_id', courseId)
    .eq('topic_id', topicId)
    .single();

  if (error || !topic) {
    notFound();
  }

  const sessionClient = await createSessionClient();
  const {
    data: { session: authSession },
  } = await sessionClient.auth.getSession();

  const basePath = `/course/${test}/${subject}/unit/${unit}/topic/${topicId}`;
  const signInHref = `/login?next=${encodeURIComponent(basePath)}`;

  // Part 4 is teacher-only. Not hidden in the browser -- parsed only when the
  // session belongs to an active teacher, so a student's page never carries the
  // worked solutions in its payload at all.
  const teacher = await requireTeacher();
  const answerKeyRaw = teacher ? topic.answer_key?.raw || '' : '';
  const answerKey = teacher ? splitAnswerKey(answerKeyRaw) : { practice: [], mini_quiz: [] };

  const practiceSection: StoredSection | undefined = topic.practice_items?.practice;
  const quizSection: StoredSection | undefined = topic.practice_items?.mini_quiz;
  const practiceItems = toPublicItems(practiceSection);
  const quizItems = toPublicItems(quizSection);

  return {
    topic,
    courseId,
    basePath,
    params,
    authSession,
    signInHref,
    teacher,
    answerKeyRaw,
    answerKey,
    practiceItems,
    quizItems,
    practiceInteractive: Boolean(practiceSection?.interactive) && practiceItems.length > 0,
    quizInteractive: Boolean(quizSection?.interactive) && quizItems.length > 0,
  };
});

export function solutionsFor(entries: { item_number: number; solution_html: string }[]) {
  return entries.length > 0
    ? Object.fromEntries(entries.map((entry) => [entry.item_number, entry.solution_html]))
    : undefined;
}

// ─── Sequence ────────────────────────────────────────────────────────────────

export type NavStep = { href: string; label: string; topicName: string } | null;

export type TopicNavigation = {
  previous: NavStep;
  next: NavStep;
  // True on the last page of the last topic, where "next" leaves the course.
  isCourseEnd: boolean;
};

const STEP_LABELS: Record<StepKind, string> = {
  lesson: 'Guided notes',
  practice: 'Practice',
  quiz: 'Mini quiz',
};

function toNavStep(step: Step | undefined): NavStep {
  if (!step) return null;
  return {
    href: stepHref(step),
    label: STEP_LABELS[step.kind],
    topicName: step.topic.topic_name,
  };
}

// Previous and Next for one page, sequenced across the whole course rather than
// within a topic: the quiz's Next is the following topic's guided notes.
export const loadNavigation = cache(
  async (courseId: string, topicId: string, kind: StepKind): Promise<TopicNavigation> => {
    const { topics } = await getTopics();
    const sequence = buildSequence(topics.filter((t) => t.course_id === courseId));
    const index = findStepIndex(sequence, courseId, topicId, kind);

    if (index === -1) return { previous: null, next: null, isCourseEnd: false };

    const isCourseEnd = index === sequence.length - 1;

    return {
      previous: toNavStep(sequence[index - 1]),
      // There is no course-complete surface to route to, so the last Next goes
      // back to Modules rather than inventing a topic that does not exist.
      next: isCourseEnd
        ? { href: '/dashboard/modules', label: 'Back to modules', topicName: '' }
        : toNavStep(sequence[index + 1]),
      isCourseEnd,
    };
  }
);

// ─── Gates ───────────────────────────────────────────────────────────────────

export type GateState = {
  lessonDone: boolean;
  practiceCorrect: number;
  practiceRequired: number;
  quizCorrect: number;
  quizRequired: number;
  // False when the section is not gradable at all, as on QR.1.1's written
  // practice. The page skips the gate rather than locking a student out of a
  // requirement they have no way to satisfy.
  practiceGated: boolean;
  quizGated: boolean;
};

export const loadGates = cache(
  async (
    studentId: string | null,
    courseId: string,
    topicId: string
  ): Promise<GateState> => {
    const { shapes } = await getTopics();
    const shape: TopicShape | undefined = shapes.get(topicKey(courseId, topicId));
    const practiceGradable = shape?.practice.gradable ?? 0;
    const quizGradable = shape?.mini_quiz.gradable ?? 0;

    const base: GateState = {
      lessonDone: false,
      practiceCorrect: 0,
      practiceRequired: requiredCorrect('practice', practiceGradable),
      quizCorrect: 0,
      quizRequired: requiredCorrect('quiz', quizGradable),
      practiceGated: practiceGradable > 0,
      quizGated: quizGradable > 0,
    };

    // An anonymous visitor records nothing, so there is no stored state to
    // read. The client still gates within the page from what it can see.
    if (!studentId) return base;

    const admin = createAdminClient();
    const [attempts, snapshotResult] = await Promise.all([
      getTopicAttempts(studentId, courseId, topicId),
      admin
        .from('curriculum_completion')
        .select('lesson_completed_at, practice_correct, quiz_correct')
        .eq('user_id', studentId)
        .eq('course_id', courseId)
        .eq('topic_id', topicId)
        .maybeSingle(),
    ]);

    const snapshot = snapshotResult.data as
      | { lesson_completed_at: string | null; practice_correct: number | null; quiz_correct: number | null }
      | null;

    // The snapshot is the stored record, but the attempt log is what actually
    // happened. Taking the higher of the two means a snapshot that is missing
    // (migration not yet applied) or stale (a write that failed) can never lock
    // a student out of a gate they have already cleared.
    return {
      ...base,
      lessonDone: Boolean(snapshot?.lesson_completed_at),
      practiceCorrect: Math.max(
        snapshot?.practice_correct ?? 0,
        correctInSection(attempts, courseId, topicId, 'practice')
      ),
      quizCorrect: Math.max(
        snapshot?.quiz_correct ?? 0,
        correctInSection(attempts, courseId, topicId, 'mini_quiz')
      ),
    };
  }
);
