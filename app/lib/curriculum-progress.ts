import { cache } from 'react';
import { createAdminClient } from './supabase-admin';
import { correctInSection, type AttemptRow } from './attempt-sets';
import { topicKey } from './topic-key';
// The definition-A arithmetic lives in a module that imports nothing, so it can
// be unit tested. Re-exported here so callers keep one import site.
import {
  isPastLesson,
  isTopicComplete,
  requiredCorrect,
  topicStatusFor,
  type CompletionRow,
  type ObservedLike,
  type TopicStatusKind,
} from './topic-completion';
export { isPastLesson, isTopicComplete, requiredCorrect, topicStatusFor };
export type { CompletionRow, ObservedLike, TopicStatusKind };

// The course sequence and the mastery gate maths, in one place.
//
// Both the Modules dashboard page and the curriculum lesson/practice/quiz pages
// read from here, so "what comes next" and "how far along is this student" have
// exactly one definition. Ordering is (unit_number, sequence_in_unit) straight
// off curriculum_topics, never a hardcoded nav tree.
//
// Placeholder topics are not part of the course. See getTopics().
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
  // Per section, added 2026-08-22 for definition A. The whole-topic `correct`
  // cannot reconcile a snapshot, because the two gates have different
  // thresholds (70% of practice, 75% of the quiz) and a single total cannot say
  // which section the correct answers landed in. See isTopicComplete.
  practiceCorrect: number;
  quizCorrect: number;
  // Per section, added 2026-08-24 for A1. Whether the section was touched at
  // all, right or wrong -- which is what "past the lesson" is inferred from.
  //
  // NOT derivable from the two counts above, and that is the whole point: a
  // student who tried every practice item and missed every one has
  // practiceCorrect 0 and practiceAttempted true. Nor from `attempted`, which
  // cannot say WHICH section, and which excludes non-gradable sections. See the
  // note in progressByTopic about where these are computed.
  practiceAttempted: boolean;
  quizAttempted: boolean;
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

// Pure reductions over the attempt log live in attempt-sets.ts, which imports
// nothing, so `node --test` and the fault proofs can load them without pulling
// in the admin Supabase client. Re-exported so every existing caller is
// unaffected.
export type { AttemptRow, SessionRow } from './attempt-sets';
export {
  correctItemsInSection,
  hasAttemptedSection,
  correctInSection,
  revealedItemsInSection,
  releasableItems,
} from './attempt-sets';

// Moved to its own import-free module 2026-08-24 so the class rollup reducer can
// key a map without loading the admin client. Re-exported here, so every call
// site that already imports it from this file is unaffected.
//
// Imported as well as re-exported: `export ... from` alone re-exports without
// binding the name locally, and this module calls topicKey seven times.
export { topicKey };

// The whole course: every topic in sequence, plus the gradable counts the gates
// are measured against.
//
// practice_items is the authored content of every topic and dwarfs the six
// columns beside it -- around 31x, measured -- but the counts it is reduced to
// cannot be derived any other way without storing them, so a caller that needs
// shapes for every topic has to pay for it. What it should not do is pay twice:
// a topic page resolves loadNavigation and loadGates in the same render and
// both want this, so cache() collapses them to one read per request.
//
// Callers that only care about one topic should use getTopicShape instead.
//
// Placeholder topics are excluded. AR, GR and PR each carry a content-free row
// whose only job is to give the diagnostic recommendation a topic_id to route
// to (sql/curriculum_placeholder_topics.sql), and every caller of this function
// wants the course a student actually works through: the Modules tree, the
// unit progress bars, the topic-to-topic Next/Previous sequence, and the
// dashboard's "start here" card, which takes topics[0].
//
// That last one is why this filter is not optional. The placeholders sit at
// (unit 1, sequence 1), the same coordinates as QR.1.1, so without the filter
// the head of the course order is a tie resolved by whatever the planner
// returns first -- and "Algebraic Reasoning, coming soon" would start winning
// the front page at random.
//
// The recommendation engine deliberately does not come through here; it reads
// curriculum_topics directly, because a placeholder is exactly what it is
// looking for when a strand has no real content yet. See app/lib/recommendation.ts.
export const getTopics = cache(async (): Promise<{
  topics: TopicRow[];
  shapes: Map<string, TopicShape>;
}> => {
  const admin = createAdminClient();
  const { data } = await admin
    .from('curriculum_topics')
    .select(
      'course_id, topic_id, topic_name, unit_number, sequence_in_unit, estimated_time_minutes, practice_items'
    )
    .eq('is_placeholder', false)
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
});

/**
 * How many topics in each unit are authored but not yet published.
 *
 * getTopics() filters `is_placeholder` at the query, which is right -- a
 * placeholder has no lesson, no practice and no quiz, so it is not part of the
 * course and must not be counted into any progress denominator. The cost is that
 * the page cannot tell a unit of 15 from a unit of 18 with 3 unwritten, and a
 * student holding a syllabus that names 18 topics has no way to learn why they
 * can see 15.
 *
 * So this asks the one question getTopics deliberately does not: how many were
 * dropped, per unit. Measured 2026-08-21: three rows in the whole course, all in
 * unit 1, so this selects one column across three rows rather than widening
 * getTopics and paying for it on every caller.
 *
 * Returns an empty map on error rather than throwing. A count that fails to load
 * should cost the page one sentence, not the whole syllabus.
 */
export const getPlaceholderCounts = cache(async (): Promise<Map<number, number>> => {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('curriculum_topics')
    .select('unit_number')
    .eq('is_placeholder', true);

  const counts = new Map<number, number>();
  if (error) {
    console.error('[curriculum] could not count placeholder topics:', error.message);
    return counts;
  }
  for (const row of data ?? []) {
    counts.set(row.unit_number, (counts.get(row.unit_number) ?? 0) + 1);
  }
  return counts;
});

// The gradable counts for a single topic.
//
// syncCompletionSnapshot runs on every answer a student submits, and it needs
// the shape of exactly the topic being answered. Reading that through
// getTopics() meant pulling the full authored content of every topic in the
// course on every write -- a cost that grows with the curriculum while the work
// being done stays the same size. One row instead of all of them keeps it flat.
export async function getTopicShape(
  courseId: string,
  topicId: string
): Promise<TopicShape | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('curriculum_topics')
    .select('practice_items')
    .eq('course_id', courseId)
    .eq('topic_id', topicId)
    .maybeSingle();

  if (!data) return null;

  return {
    practice: sectionShape(data.practice_items?.practice),
    mini_quiz: sectionShape(data.practice_items?.mini_quiz),
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

export function progressByTopic(
  attempts: AttemptRow[],
  shapes: Map<string, TopicShape>
): Map<string, TopicProgress> {
  const correct = new Map<string, Set<string>>();
  const seen = new Map<string, Set<string>>();
  const practiceTouched = new Set<string>();
  const quizTouched = new Set<string>();

  for (const attempt of attempts) {
    const key = topicKey(attempt.course_id, attempt.topic_id);
    const shape = shapes.get(key);

    // ─── A1's attempted flags, recorded BEFORE the gradable filter below ─────
    //
    // THE ORDER IS LOAD-BEARING and this is the one place it can go wrong.
    // QR.1.1's practice section is written work: `interactive` is false, so
    // sectionShape gives it gradable 0, so the `continue` two lines down
    // discards every attempt against it. Recording after that filter would make
    // QR.1.1 permanently un-attempted, and A1 would then never fire on the one
    // topic whose shape is the reason the fail-open rule exists.
    //
    // Exact-equality on the section string, matching hasAttemptedSection in
    // attempt-sets.ts rather than the normalisation on the next line: this is
    // the single-pass form of the same predicate topic-data.ts calls, and the
    // two must agree on what counts as a section. The normalisation below is
    // for BUCKETING a known-good section into one of two counters; this is a
    // MEMBERSHIP test, and folding an unknown third section into 'practice'
    // would be wrong here even though it is harmless there.
    if (attempt.section === 'practice') practiceTouched.add(key);
    else if (attempt.section === 'mini_quiz') quizTouched.add(key);

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
    const hits = correct.get(key);
    let practiceCorrect = 0;
    let quizCorrect = 0;
    // The item keys are `${section}:${item_number}` and the sections are
    // already normalised to 'practice' or 'mini_quiz' above, so counting by
    // prefix cannot pick up a third section.
    for (const itemKey of hits ?? []) {
      if (itemKey.startsWith('mini_quiz:')) quizCorrect += 1;
      else practiceCorrect += 1;
    }
    out.set(key, {
      total: gradableTotal(shape),
      correct: hits?.size ?? 0,
      attempted: seen.get(key)?.size ?? 0,
      practiceCorrect,
      quizCorrect,
      practiceAttempted: practiceTouched.has(key),
      quizAttempted: quizTouched.has(key),
    });
  }
  return out;
}

// One read, every topic, for one student. Filtered on user_id and served by the
// unique index on (user_id, course_id, topic_id) that already exists, so this
// needs no new index. At most one row per topic in the course.
//
// Called from the page's existing Promise.all, so it costs one round trip and
// no added latency.
export async function getCompletions(
  studentId: string
): Promise<Map<string, CompletionRow>> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('curriculum_completion')
    .select(
      'course_id, topic_id, completed_at, lesson_completed_at, practice_correct, practice_total, quiz_correct, quiz_total'
    )
    .eq('user_id', studentId);

  // FAILS OPEN, TOWARD "NOT COMPLETE". An empty map renders every row as its
  // observed state from the attempt log, which is the pre-definition-A
  // behaviour, rather than throwing a syllabus at a student.
  if (error || !data) return new Map();

  const out = new Map<string, CompletionRow>();
  for (const row of data) out.set(topicKey(row.course_id, row.topic_id), row);
  return out;
}

// ─── The canonical progress source ───────────────────────────────────────────
//
// getTopicStatuses is THE authority on "how far is this student through this
// topic". Before it, the answer was assembled at each call site: the Modules
// page held its own statusOf(), the topic pages went through loadGates(), and
// the two disagreed about the lesson (see the A1 block in topic-completion.ts).
// Anything that needs a status now reads it from here.
//
// MULTI-STUDENT BY CONSTRUCTION, single-student as the [id] case, so the
// student's own view and any future teacher view run the identical code path
// rather than two implementations that agree until they do not. That is the
// whole reason the signature takes an array for a caller that has one id.
//
// The reads are batched with .in(), so N students cost the same two round trips
// as one. Nothing here filters by class or checks who is asking: this is the
// progress calculation, and scoping a teacher to their own students is a
// separate concern that belongs in the route that calls it.

/** Everything any surface needs to render one topic's progress for one student. */
export type TopicStatus = {
  status: TopicStatusKind;
  /** Distinct gradable items answered correctly, over the topic's gradable total. */
  correct: number;
  total: number;
  completedAt: string | null;
  /**
   * The most recent attempt against this topic, or null if never touched.
   *
   * Carried here so "where was I" is answered from the same map as everything
   * else. Before this the Modules page took mostRecentTopic(attempts) off a
   * SECOND read of curriculum_attempts, which is both a wasted round trip and a
   * second place the answer could come from.
   */
  lastWorkedAt: string | null;
  /** A1: the stored stamp, or evidence of activity. See isPastLesson. */
  lessonDone: boolean;
  practiceCorrect: number;
  practiceRequired: number;
  practiceCount: number;
  practiceGated: boolean;
  practiceAttempted: boolean;
  quizCorrect: number;
  quizRequired: number;
  quizCount: number;
  quizGated: boolean;
  quizAttempted: boolean;
};

/**
 * The reducer. PURE -- no I/O, no client, no imports beyond the arithmetic --
 * so `node --test` can drive it with fixtures and so the batched reader below
 * is the only thing that ever needs a database.
 *
 * Reconciles stored against observed with Math.max on both sections, which is
 * the same discipline isTopicComplete and gatesFromShape already apply: the
 * snapshot is a cache of the attempt log and a stale one must never take a gate
 * away from a student who has cleared it.
 */
export function topicStatusesFor(
  attempts: AttemptRow[],
  completions: Map<string, CompletionRow>,
  shapes: Map<string, TopicShape>
): Map<string, TopicStatus> {
  const progress = progressByTopic(attempts, shapes);

  // Max rather than attempts[0]. The reader hands these in newest-first, but a
  // pure reducer that silently depends on its input being sorted is one caller
  // away from being wrong, and nothing in the type says so.
  const lastWorked = new Map<string, string>();
  for (const attempt of attempts) {
    const key = topicKey(attempt.course_id, attempt.topic_id);
    const seen = lastWorked.get(key);
    if (!seen || attempt.created_at > seen) lastWorked.set(key, attempt.created_at);
  }

  const out = new Map<string, TopicStatus>();

  for (const [key, shape] of shapes) {
    const observed = progress.get(key);
    const snapshot = completions.get(key);

    const practiceCount = shape.practice.gradable;
    const quizCount = shape.mini_quiz.gradable;

    out.set(key, {
      status: topicStatusFor(snapshot, observed, shape),
      correct: observed?.correct ?? 0,
      total: observed?.total ?? gradableTotal(shape),
      completedAt: snapshot?.completed_at ?? null,
      lastWorkedAt: lastWorked.get(key) ?? null,
      lessonDone: isPastLesson(snapshot, observed),
      practiceCorrect: Math.max(snapshot?.practice_correct ?? 0, observed?.practiceCorrect ?? 0),
      practiceRequired: requiredCorrect('practice', practiceCount),
      practiceCount,
      practiceGated: practiceCount > 0,
      practiceAttempted: observed?.practiceAttempted ?? false,
      quizCorrect: Math.max(snapshot?.quiz_correct ?? 0, observed?.quizCorrect ?? 0),
      quizRequired: requiredCorrect('quiz', quizCount),
      quizCount,
      quizGated: quizCount > 0,
      quizAttempted: observed?.quizAttempted ?? false,
    });
  }

  return out;
}

/** curriculum_attempts carries student_id; AttemptRow deliberately does not. */
type AttemptRowWithStudent = AttemptRow & { student_id: string };

/**
 * Every topic's status, for every student named, keyed studentId -> topicKey.
 *
 * Two batched reads and one cached course read, whatever the roster size. A
 * student with no rows still gets a full map of not_started topics, because the
 * reducer iterates the SHAPES rather than the attempts -- a roster where one
 * student has never signed in must not come back a row short.
 */
export async function getTopicStatuses(
  studentIds: string[]
): Promise<Map<string, Map<string, TopicStatus>>> {
  const out = new Map<string, Map<string, TopicStatus>>();
  const ids = [...new Set(studentIds)].filter(Boolean);
  if (ids.length === 0) return out;

  const admin = createAdminClient();
  const [{ shapes }, attemptsResult, completionsResult] = await Promise.all([
    getTopics(),
    admin
      .from('curriculum_attempts')
      .select('student_id, course_id, topic_id, section, item_number, is_correct, created_at')
      .in('student_id', ids)
      .order('created_at', { ascending: false }),
    admin
      .from('curriculum_completion')
      .select(
        'user_id, course_id, topic_id, completed_at, lesson_completed_at, practice_correct, practice_total, quiz_correct, quiz_total'
      )
      .in('user_id', ids),
  ]);

  // FAILS OPEN TOWARD "NOT COMPLETE", matching getCompletions. An unreadable
  // snapshot table renders every topic from the attempt log alone, which is a
  // student reading less progress than they have -- recoverable, and visibly
  // wrong. The other direction would tell them they had finished topics they
  // had not.
  if (completionsResult.error) {
    console.error(
      '[curriculum] getTopicStatuses could not read completions:',
      completionsResult.error.message
    );
  }
  if (attemptsResult.error) {
    console.error(
      '[curriculum] getTopicStatuses could not read attempts:',
      attemptsResult.error.message
    );
  }

  const attemptsByStudent = new Map<string, AttemptRow[]>();
  for (const row of (attemptsResult.data ?? []) as AttemptRowWithStudent[]) {
    const { student_id, ...attempt } = row;
    if (!attemptsByStudent.has(student_id)) attemptsByStudent.set(student_id, []);
    attemptsByStudent.get(student_id)!.push(attempt);
  }

  const completionsByStudent = new Map<string, Map<string, CompletionRow>>();
  for (const row of (completionsResult.data ?? []) as (CompletionRow & {
    user_id: string;
    course_id: string;
    topic_id: string;
  })[]) {
    if (!completionsByStudent.has(row.user_id)) completionsByStudent.set(row.user_id, new Map());
    completionsByStudent.get(row.user_id)!.set(topicKey(row.course_id, row.topic_id), row);
  }

  for (const id of ids) {
    out.set(
      id,
      topicStatusesFor(
        attemptsByStudent.get(id) ?? [],
        completionsByStudent.get(id) ?? new Map(),
        shapes
      )
    );
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

// The URL of a topic, with no step on the end. The bare topic route redirects
// to the guided notes, so this is a link to the start of the topic.
//
// course_id is `${test}-${subject}` -- the same split the route params are
// rebuilt from in topic-data.ts, run backwards.
export function topicHref(topic: {
  course_id: string;
  topic_id: string;
  unit_number: number;
}): string {
  const [test, subject] = topic.course_id.split('-');
  return `/course/${test}/${subject}/unit/${topic.unit_number}/topic/${topic.topic_id}`;
}

export function stepHref(step: Step): string {
  return `${topicHref(step.topic)}/${step.kind}`;
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
    const shape = await getTopicShape(courseId, topicId);
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
      // INSTRUMENTED 2026-08-21, and the tag is the point.
      //
      // This write is the ONLY record that a lesson was read: curriculum_attempts
      // holds answers, so there is no second source. topic-data.ts now fails the
      // lesson gate open from practice and quiz activity rather than giving it
      // one, and that decision was taken on the basis that this failure has never
      // been observed. It was taken on a table holding 36 rows, which is not much
      // evidence either way.
      //
      // So the failure is tagged rather than merely logged. If SNAPSHOT_WRITE_LOST
      // shows up in real use, the fail-open decision gets revisited with numbers
      // instead of an argument. lessonCompleted is included because a lost write
      // carrying it is the only variant that loses information nothing else holds.
      console.error('SNAPSHOT_WRITE_LOST curriculum_completion snapshot failed', {
        code: error.code,
        message: error.message,
        courseId,
        topicId,
        lessonCompleted: options.lessonCompleted === true,
      });
    }
  } catch (err) {
    console.error('SNAPSHOT_WRITE_LOST curriculum_completion snapshot threw', {
      err,
      courseId,
      topicId,
      lessonCompleted: options.lessonCompleted === true,
    });
  }
}
