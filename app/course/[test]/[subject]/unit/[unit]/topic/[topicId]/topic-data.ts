import { cache } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSessionClient } from '@/app/lib/supabase-server';
import { createAdminClient } from '@/app/lib/supabase-admin';
import { requireTeacher } from '@/app/lib/auth';
import { renderInlineWithMath, splitAnswerKey } from '@/lib/curriculum-utils';
import { loadTopicFixture } from '@/lib/curriculum-fixture';
import {
  getTopics,
  getTopicShape,
  getTopicAttempts,
  correctItemsInSection,
  hasAttemptedSection,
  revealedItemsInSection,
  releasableItems,
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
  // Optional because the student read comes from curriculum_topics_public,
  // which strips both keys out of the JSON entirely -- they are not null there,
  // they are absent. Only the teacher read, which goes to the base table
  // through the admin client, ever sees them. Nothing in this file touches
  // either one; they are typed so that anything that tries has to acknowledge
  // it might be looking at the redacted shape.
  correct_answer?: string | null;
  misconception_tag?: Record<string, string>;
  level: string | null;
};

export type StoredSection = {
  interactive: boolean;
  items: StoredPracticeItem[];
};

// The columns loadTopic reads, spelled out because the select is built at
// runtime and so cannot be inferred from the query string the way a literal one
// would be.
type TopicRecord = {
  topic_id: string;
  topic_name: string;
  // True on the content-free rows that stand in for a strand with no
  // curriculum yet. The layout renders ComingSoonTopic and skips the sub-page
  // entirely when this is set. Present on both reads: it is a column on
  // curriculum_topics and was appended to curriculum_topics_public by
  // sql/curriculum_placeholder_topics.sql.
  is_placeholder: boolean;
  related_strand: string | null;
  estimated_time_minutes: number | null;
  guided_notes: string;
  practice_items: { practice?: StoredSection; mini_quiz?: StoredSection } | null;
  practice_problems: { raw?: string } | null;
  mini_quiz: { raw?: string } | null;
  // Optional because the student query does not select it. A student's page
  // does not merely hide the answer key, it never reads the column.
  answer_key?: { raw?: string } | null;
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

  // Part 4 is teacher-only. Resolved before the topic is read rather than after,
  // so the answer key is not merely withheld from a student's page -- the query
  // that runs for a student never asks for the column. answer_key is also the
  // heaviest thing on the row, so the read most visitors do is the cheap one.
  const teacher = await requireTeacher();

  // Explicit rather than select('*'). The row carries the full authored content
  // of the topic and every consumer below wants a known handful of it; the star
  // was pulling roughly 32KB per page load on a route that is force-dynamic and
  // so has no cache in front of it.
  const TOPIC_COLUMNS =
    'topic_id, topic_name, is_placeholder, related_strand, estimated_time_minutes, guided_notes, practice_items, practice_problems, mini_quiz';

  // Two reads of the topic, never both, and they do not read the same thing.
  //
  // A student's page goes through the plain anon client against
  // curriculum_topics_public, the view added in sql/curriculum_topics_public.sql:
  // correct_answer and misconception_tag are stripped out of practice_items and
  // answer_key is not a column on it at all. anon and authenticated have no
  // grant on the base table, so this is the only topic content that path can
  // reach -- withholding the answers stops being something the code below has
  // to remember to do and becomes something this query cannot undo.
  //
  // A teacher's page needs answer_key, which exists only on the base table, so
  // it reads through the service-role admin client. Same split as
  // questions/questions_public: the safe view for the public surface, the admin
  // client wherever a real answer is genuinely required.
  //
  // A third client appears below. Anything that depends on who is asking has to
  // go through the cookie-aware SSR client: lib/supabase/server.ts builds a
  // client with no cookie storage at all, so auth.getSession() on it is null for
  // everyone, signed in or not.
  // Development-only: render the topic from its source markdown so a figure can
  // be checked on the real route before the content is uploaded. Guarded twice
  // -- the flag AND a non-production NODE_ENV -- and lib/curriculum-fixture.ts
  // throws at module load if both are ever true at once, so a misconfigured
  // production build fails to start rather than serving unstripped rows.
  //
  // Injected here, at the row, so that everything downstream of this line is the
  // code a student runs: the item transforms below, renderMarkdownWithMath, and
  // every component. Everything above it -- client selection, the view, the
  // column list, RLS, the JSON round-trip -- is skipped, which is why this does
  // not replace the post-upload check.
  const fixture = loadTopicFixture(courseId, topicId);

  let topic: TopicRecord | null = null;
  if (fixture) {
    topic = fixture as unknown as TopicRecord;
  } else {
    const supabase = teacher ? createAdminClient() : await createClient();
    const { data, error } = await supabase
      .from(teacher ? 'curriculum_topics' : 'curriculum_topics_public')
      .select(teacher ? `${TOPIC_COLUMNS}, answer_key` : TOPIC_COLUMNS)
      .eq('course_id', courseId)
      .eq('topic_id', topicId)
      .single()
      .overrideTypes<TopicRecord, { merge: false }>();
    if (error || !data) {
      notFound();
    }
    topic = data;
  }

  if (!topic) {
    notFound();
  }

  const sessionClient = await createSessionClient();
  const {
    data: { session: authSession },
  } = await sessionClient.auth.getSession();

  const basePath = `/course/${test}/${subject}/unit/${unit}/topic/${topicId}`;
  const signInHref = `/login?next=${encodeURIComponent(basePath)}`;

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
  // Which item_numbers this student has ever answered correctly, per section.
  // Empty for an anonymous visitor, who records nothing. These drive the
  // per-item release of worked solutions in loadEarnedSolutions below; they are
  // deliberately NOT derived from practiceCorrect, because the snapshot that
  // number can come from stores a count and cannot say which items.
  practiceSolved: Set<number>;
  quizSolved: Set<number>;
  // Whether anything has been answered in the section at all, right or wrong.
  // Not derivable from the two sets above, which hold only correct items and are
  // therefore empty for a student who tried and missed.
  practiceAttempted: boolean;
  quizAttempted: boolean;
};

// The gate maths, given a shape that has already been resolved.
//
// Split out because the two callers below resolve that shape from different
// reads, and which read is cheaper depends entirely on what else the page is
// doing. Everything after this point is identical either way.
async function gatesFromShape(
  studentId: string | null,
  courseId: string,
  topicId: string,
  shape: TopicShape | undefined
): Promise<GateState> {
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
      practiceSolved: new Set<number>(),
      quizSolved: new Set<number>(),
      // False for an anonymous visitor, correctly: nothing is recorded for them,
      // so there is no attempt to acknowledge.
      practiceAttempted: false,
      quizAttempted: false,
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
    const practiceSolved = correctItemsInSection(attempts, courseId, topicId, 'practice');
    const quizSolved = correctItemsInSection(attempts, courseId, topicId, 'mini_quiz');

    return {
      ...base,
      lessonDone: Boolean(snapshot?.lesson_completed_at),
      practiceCorrect: Math.max(snapshot?.practice_correct ?? 0, practiceSolved.size),
      quizCorrect: Math.max(snapshot?.quiz_correct ?? 0, quizSolved.size),
      practiceSolved,
      quizSolved,
      practiceAttempted: hasAttemptedSection(attempts, courseId, topicId, 'practice'),
      quizAttempted: hasAttemptedSection(attempts, courseId, topicId, 'mini_quiz'),
    };
}

// For lesson, practice and quiz.
//
// Resolves the shape out of getTopics(), which reads practice_items for every
// topic in the course. That is the heaviest column on the row by roughly 31x,
// and it is free here only because loadNavigation on the same page already
// pays for it and cache() collapses the two to one read.
export const loadGates = cache(
  async (studentId: string | null, courseId: string, topicId: string): Promise<GateState> => {
    const { shapes } = await getTopics();
    return gatesFromShape(studentId, courseId, topicId, shapes.get(topicKey(courseId, topicId)));
  }
);

// For the topic overview, which has no navigation and so nothing to share the
// course-wide read with.
//
// Going through loadGates there would pull practice_items for all 97 topics to
// use exactly one of them, on a page that previously cost nothing because it
// was a redirect. getTopicShape reads the single row instead. Same gate maths,
// same result, one row rather than the whole course.
export const loadTopicGates = cache(
  async (studentId: string | null, courseId: string, topicId: string): Promise<GateState> => {
    const shape = await getTopicShape(courseId, topicId);
    return gatesFromShape(studentId, courseId, topicId, shape ?? undefined);
  }
);

// ─── Worked solutions, released per item ─────────────────────────────────────

// The worked solutions a STUDENT has earned on one section of one topic.
//
// Before this, all 1,358 authored solutions were teacher-only, held back by
// three independent layers: answer_key is not a column on
// curriculum_topics_public at all, loadTopic only selects it when
// requireTeacher() passes, and the split above returns empty entries for
// everyone else. Layers 1 and 3 are unchanged. This relaxes layer 2 alone, and
// only for items the student has already answered correctly.
//
// WHY A SECOND READ RATHER THAN WIDENING loadTopic'S
// ---------------------------------------------------
// A student's loadTopic read goes to the view on purpose: it is the thing that
// strips correct_answer and misconception_tag out of practice_items, so the
// answers are not withheld by code that has to remember to withhold them, they
// are absent from the query's result. Pointing that read at the base table to
// pick up answer_key would hand the student every correct_answer on the topic
// as a side effect -- the exact protection the view exists to provide. So the
// answer key is fetched separately, narrowly, and filtered before it is
// returned. The view is untouched and this stays server-side on the admin
// client, same as every other read of answer-bearing data.
//
// COST. This is an extra query on the practice and quiz pages, and answer_key
// is the heaviest column on the row. It is skipped entirely for anonymous
// visitors and for any student with nothing solved in the section yet, so it
// costs nothing until a student has earned something, and the lesson page never
// calls it at all.
//
// WHAT COMES BACK IS WHAT IS SERIALIZED. PracticeQuiz is a client component, so
// whatever this returns crosses to the browser. Filtering here rather than in
// the component is the difference between releasing one solution and shipping
// all fourteen with thirteen of them merely not rendered.
export const loadEarnedSolutions = cache(
  async (
    studentId: string | null,
    courseId: string,
    topicId: string,
    section: 'practice' | 'mini_quiz'
  ): Promise<Record<number, string> | undefined> => {
    // Anonymous visitors write no attempts, so there is nothing they can have
    // earned. Unchanged by this feature, deliberately: what a signed-out
    // student sees is a product decision, not one to make here.
    if (!studentId) return undefined;

    const admin = createAdminClient();

    // The two reads are independent, so they go together. loadGates is cache()d
    // and usually already resolved by the time this runs; the sessions read is
    // one round trip and this is the only place it is paid.
    //
    // Filtered on student_id + course_id + topic_id, which is the leading three
    // columns of gumu_sessions_student_topic_idx. Section, item number,
    // status and resolution are filtered in memory rather than in the predicate:
    // a topic holds at most fourteen items so the row count is trivial, and it
    // keeps the whole release rule in one pure function that a harness can run.
    const [gates, sessions] = await Promise.all([
      loadGates(studentId, courseId, topicId),
      admin
        .from('gumu_sessions')
        .select('section, item_number, status, resolution')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('topic_id', topicId),
    ]);

    const solved = section === 'practice' ? gates.practiceSolved : gates.quizSolved;

    // FAILS TOWARDS WITHHOLDING, and the scope of that is the point.
    //
    // `data ?? []` covers an unreachable or erroring gumu_sessions with an empty
    // revealed set, so the union collapses to `solved` and behaviour degrades to
    // exactly what it was before solutions were released on a reveal -- the
    // student loses an explanation, and can never gain one they did not earn.
    //
    // Deliberately NOT a try around the whole function: that would also drop the
    // solutions they earned by answering correctly, which is safe but needlessly
    // punitive for a failure that has nothing to do with them.
    const revealed = revealedItemsInSection(sessions.data ?? [], section);
    const releasable = releasableItems(solved, revealed);
    if (releasable.size === 0) return undefined;

    // Same dev-only fixture the topic read honours, so a topic being previewed
    // from source markdown behaves the same way here as it does above.
    const fixture = loadTopicFixture(courseId, topicId) as
      | { answer_key?: { raw?: string } | null }
      | null;

    let raw = fixture?.answer_key?.raw ?? '';
    if (!fixture) {
      const { data } = await admin
        .from('curriculum_topics')
        .select('answer_key')
        .eq('course_id', courseId)
        .eq('topic_id', topicId)
        .maybeSingle();
      raw = (data as { answer_key?: { raw?: string } | null } | null)?.answer_key?.raw ?? '';
    }
    if (!raw) return undefined;

    const entries = splitAnswerKey(raw)[section];
    return solutionsFor(entries.filter((entry) => releasable.has(entry.item_number)));
  }
);
