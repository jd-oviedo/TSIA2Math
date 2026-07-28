import { createAdminClient } from './supabase-admin';

// The course sequence and the mastery gate maths, in one place.
//
// Both the Modules dashboard page and the curriculum lesson/practice/quiz pages
// read from here, so "what comes next" and "how far along is this student" have
// exactly one definition. Ordering is (unit_number, sequence_in_unit) straight
// off curriculum_topics, never a hardcoded nav tree.
//
// Every read goes through the admin client filtered by the caller's own id:
// curriculum_attempts enables RLS with no policy for authenticated, so the
// server is the only place those rows are legible.

export type TopicRow = {
  course_id: string;
  topic_id: string;
  topic_name: string;
  unit_number: number;
  sequence_in_unit: number;
  estimated_time_minutes: number | null;
};

export type SectionShape = {
  // False when the section holds anything the quiz cannot grade. QR.1.1's
  // practice is written work, so it renders as static text and has no gate.
  interactive: boolean;
  gradable: number;
};

export type TopicShape = {
  practice: SectionShape;
  mini_quiz: SectionShape;
};

export type TopicProgress = {
  total: number;
  correct: number;
  attempted: number;
};

type StoredItem = { format: string };
type StoredSection = { interactive?: boolean; items?: StoredItem[] };

// Gradable items in one section.
//
// A non-interactive section contributes zero, not its multiple-choice count.
// QR.1.1's practice section carries 3 multiple-choice items among 12, but the
// whole section falls back to static markdown, so those 3 are never rendered as
// anything a student could answer. Counting them put a ceiling on QR.1.1 that
// no student could clear.
function sectionShape(section: StoredSection | undefined): SectionShape {
  const interactive = Boolean(section?.interactive);
  if (!interactive) return { interactive: false, gradable: 0 };
  const items = section?.items ?? [];
  return {
    interactive: true,
    gradable: items.filter((item) => item.format === 'multiple_choice').length,
  };
}

export type AttemptRow = {
  course_id: string;
  topic_id: string;
  section: string;
  item_number: number;
  is_correct: boolean;
  created_at: string;
};

export function topicKey(courseId: string, topicId: string): string {
  return `${courseId}:${topicId}`;
}

export async function getTopics(): Promise<{
  topics: TopicRow[];
  shapes: Map<string, TopicShape>;
}> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('curriculum_topics')
    .select(
      'course_id, topic_id, topic_name, unit_number, sequence_in_unit, estimated_time_minutes, practice_items'
    )
    .order('unit_number')
    .order('sequence_in_unit');

  const rows = data ?? [];
  const shapes = new Map<string, TopicShape>();
  for (const row of rows) {
    shapes.set(topicKey(row.course_id, row.topic_id), {
      practice: sectionShape(row.practice_items?.practice),
      mini_quiz: sectionShape(row.practice_items?.mini_quiz),
    });
  }

  return {
    topics: rows.map((row) => ({
      course_id: row.course_id,
      topic_id: row.topic_id,
      topic_name: row.topic_name,
      unit_number: row.unit_number,
      sequence_in_unit: row.sequence_in_unit,
      estimated_time_minutes: row.estimated_time_minutes,
    })),
    shapes,
  };
}

export function gradableTotal(shape: TopicShape | undefined): number {
  return (shape?.practice.gradable ?? 0) + (shape?.mini_quiz.gradable ?? 0);
}

export async function getAttempts(studentId: string): Promise<AttemptRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('curriculum_attempts')
    .select('course_id, topic_id, section, item_number, is_correct, created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  return data ?? [];
}

// Attempts for one topic only, for the gate check on a single page.
export async function getTopicAttempts(
  studentId: string,
  courseId: string,
  topicId: string
): Promise<AttemptRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('curriculum_attempts')
    .select('course_id, topic_id, section, item_number, is_correct, created_at')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });

  return data ?? [];
}

// How many distinct items in a section this student has ever got right.
//
// Distinct on item_number, and "ever" rather than "most recently": the attempt
// log is append-only and a retry adds a row rather than replacing one, so a
// student who gets an item right and later fumbles a re-attempt has still
// demonstrated it. Mastery counts up, never down.
export function correctInSection(
  attempts: AttemptRow[],
  courseId: string,
  topicId: string,
  section: 'practice' | 'mini_quiz'
): number {
  const items = new Set<number>();
  for (const a of attempts) {
    if (a.course_id === courseId && a.topic_id === topicId && a.section === section && a.is_correct) {
      items.add(a.item_number);
    }
  }
  return items.size;
}

export function progressByTopic(
  attempts: AttemptRow[],
  shapes: Map<string, TopicShape>
): Map<string, TopicProgress> {
  const correct = new Map<string, Set<string>>();
  const seen = new Map<string, Set<string>>();

  for (const attempt of attempts) {
    const key = topicKey(attempt.course_id, attempt.topic_id);
    const shape = shapes.get(key);
    // An attempt against a section that is no longer gradable should not count
    // toward a total that excludes it.
    const sectionKey = attempt.section === 'mini_quiz' ? 'mini_quiz' : 'practice';
    if (!shape || shape[sectionKey].gradable === 0) continue;

    const itemKey = `${attempt.section}:${attempt.item_number}`;
    if (!seen.has(key)) seen.set(key, new Set());
    seen.get(key)!.add(itemKey);
    if (attempt.is_correct) {
      if (!correct.has(key)) correct.set(key, new Set());
      correct.get(key)!.add(itemKey);
    }
  }

  const out = new Map<string, TopicProgress>();
  for (const [key, shape] of shapes) {
    out.set(key, {
      total: gradableTotal(shape),
      correct: correct.get(key)?.size ?? 0,
      attempted: seen.get(key)?.size ?? 0,
    });
  }
  return out;
}

export function mostRecentTopic(attempts: AttemptRow[]): AttemptRow | null {
  return attempts[0] ?? null;
}

// ─── Course sequence ─────────────────────────────────────────────────────────

export type StepKind = 'lesson' | 'practice' | 'quiz';
export const STEP_ORDER: StepKind[] = ['lesson', 'practice', 'quiz'];

export type Step = { topic: TopicRow; kind: StepKind };

// Every page in the course, in the order a student walks them:
// topic 1 lesson, practice, quiz, then topic 2, and so on. Topics with a
// non-interactive practice section still get a practice page -- there is
// written work to show, it just carries no gate.
export function buildSequence(topics: TopicRow[]): Step[] {
  return topics.flatMap((topic) => STEP_ORDER.map((kind) => ({ topic, kind })));
}

export function stepHref(step: Step): string {
  const [test, subject] = step.topic.course_id.split('-');
  return `/course/${test}/${subject}/unit/${step.topic.unit_number}/topic/${step.topic.topic_id}/${step.kind}`;
}

export function findStepIndex(
  sequence: Step[],
  courseId: string,
  topicId: string,
  kind: StepKind
): number {
  return sequence.findIndex(
    (s) => s.topic.course_id === courseId && s.topic.topic_id === topicId && s.kind === kind
  );
}

// ─── Mastery thresholds ──────────────────────────────────────────────────────

// Practice unlocks at 7 of 10, the quiz at 3 of 4. Held as a ratio of the
// section's real item count rather than a bare 7, so a topic authored with a
// different number of items still gates at the same standard instead of
// becoming impossible or trivial.
const PRACTICE_RATIO = 7 / 10;
const QUIZ_RATIO = 3 / 4;

export function requiredCorrect(kind: 'practice' | 'quiz', gradable: number): number {
  if (gradable === 0) return 0;
  const ratio = kind === 'practice' ? PRACTICE_RATIO : QUIZ_RATIO;
  return Math.ceil(gradable * ratio);
}

// ─── Snapshot ────────────────────────────────────────────────────────────────

// Recomputes this student's gate state for one topic and writes it to
// curriculum_completion. The table finally earns its keep: it was built for
// mastery gating and nothing had ever written to it.
//
// The attempt log stays the thing that actually happened; this is a snapshot of
// it, which is why every read reconciles the two rather than trusting this
// blindly. Failures are logged and swallowed: a student who has just answered a
// question should not see an error because a bookkeeping row did not land.
export async function syncCompletionSnapshot(
  studentId: string,
  courseId: string,
  topicId: string,
  options: { lessonCompleted?: boolean } = {}
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { shapes } = await getTopics();
    const shape = shapes.get(topicKey(courseId, topicId));
    if (!shape) return;

    const attempts = await getTopicAttempts(studentId, courseId, topicId);
    const practiceTotal = shape.practice.gradable;
    const quizTotal = shape.mini_quiz.gradable;
    const practiceCorrect = correctInSection(attempts, courseId, topicId, 'practice');
    const quizCorrect = correctInSection(attempts, courseId, topicId, 'mini_quiz');

    const { data: existing } = await admin
      .from('curriculum_completion')
      .select('lesson_completed_at, completed_at')
      .eq('user_id', studentId)
      .eq('course_id', courseId)
      .eq('topic_id', topicId)
      .maybeSingle();

    const lessonAt =
      existing?.lesson_completed_at ??
      (options.lessonCompleted ? new Date().toISOString() : null);

    const practiceCleared =
      practiceTotal === 0 || practiceCorrect >= requiredCorrect('practice', practiceTotal);
    const quizCleared = quizTotal === 0 || quizCorrect >= requiredCorrect('quiz', quizTotal);
    const allCleared = Boolean(lessonAt) && practiceCleared && quizCleared;

    const { error } = await admin.from('curriculum_completion').upsert(
      {
        user_id: studentId,
        course_id: courseId,
        topic_id: topicId,
        lesson_completed_at: lessonAt,
        practice_correct: practiceCorrect,
        practice_total: practiceTotal,
        quiz_correct: quizCorrect,
        quiz_total: quizTotal,
        // Percentage on the mini quiz, which is what the column was named for.
        quiz_score: quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : null,
        // Stamped once and then left alone, so it records when the topic was
        // first finished rather than the last time anything was touched.
        completed_at: existing?.completed_at ?? (allCleared ? new Date().toISOString() : null),
      },
      { onConflict: 'user_id,course_id,topic_id' }
    );

    if (error) {
      console.error('curriculum_completion snapshot failed', {
        code: error.code,
        message: error.message,
      });
    }
  } catch (err) {
    console.error('curriculum_completion snapshot threw', err);
  }
}
