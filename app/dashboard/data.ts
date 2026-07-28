import { createAdminClient } from '../lib/supabase-admin';

// Every read for the student dashboard.
//
// All of it goes through the admin client, filtered by the caller's own id.
// That is not a shortcut around RLS, it is the house pattern: curriculum_attempts,
// responses and questions all enable row level security with zero grants to
// anon/authenticated, so a browser-side read returns nothing by design and the
// server is the only place these rows are legible.
//
// The rule that keeps that safe: every function here takes studentId and every
// query filters on it. There is no unscoped read in this file.

export type TopicRow = {
  course_id: string;
  topic_id: string;
  topic_name: string;
  unit_number: number;
  sequence_in_unit: number;
  estimated_time_minutes: number | null;
};

export type TopicProgress = {
  total: number;
  correct: number;
  attempted: number;
};

type StoredItem = { format: string };
type StoredSection = { items?: StoredItem[] };

// How many gradable items a topic holds. Free-response items are excluded for
// the same reason the topic page will not render them interactively: nothing
// grades them, so counting them would put a ceiling on progress that no student
// could ever reach.
function gradableCount(practiceItems: Record<string, StoredSection> | null): number {
  if (!practiceItems) return 0;
  return ['practice', 'mini_quiz'].reduce((sum, section) => {
    const items = practiceItems[section]?.items ?? [];
    return sum + items.filter((item) => item.format === 'multiple_choice').length;
  }, 0);
}

export type AttemptRow = {
  course_id: string;
  topic_id: string;
  section: string;
  item_number: number;
  is_correct: boolean;
  created_at: string;
};

export async function getTopics(): Promise<{ topics: TopicRow[]; itemCounts: Map<string, number> }> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('curriculum_topics')
    .select('course_id, topic_id, topic_name, unit_number, sequence_in_unit, estimated_time_minutes, practice_items')
    .order('unit_number')
    .order('sequence_in_unit');

  const rows = data ?? [];
  const itemCounts = new Map<string, number>();
  for (const row of rows) {
    itemCounts.set(`${row.course_id}:${row.topic_id}`, gradableCount(row.practice_items));
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
    itemCounts,
  };
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

// Progress per topic, from the attempt log rather than a completion table.
//
// An item counts as done the first time it is answered correctly, so a student
// who gets one wrong and comes back to it does not sit permanently short of
// 100%. curriculum_attempts is append-only, which is what makes this derivable:
// the row for the later correct answer is still there alongside the wrong one.
//
// public.curriculum_completion exists and would be the obvious source, but it
// holds zero rows and nothing in the codebase writes to it.
export function progressByTopic(
  attempts: AttemptRow[],
  itemCounts: Map<string, number>
): Map<string, TopicProgress> {
  const correct = new Map<string, Set<string>>();
  const seen = new Map<string, Set<string>>();

  for (const attempt of attempts) {
    const topicKey = `${attempt.course_id}:${attempt.topic_id}`;
    const itemKey = `${attempt.section}:${attempt.item_number}`;
    if (!seen.has(topicKey)) seen.set(topicKey, new Set());
    seen.get(topicKey)!.add(itemKey);
    if (attempt.is_correct) {
      if (!correct.has(topicKey)) correct.set(topicKey, new Set());
      correct.get(topicKey)!.add(itemKey);
    }
  }

  const out = new Map<string, TopicProgress>();
  for (const [topicKey, total] of itemCounts) {
    out.set(topicKey, {
      total,
      correct: correct.get(topicKey)?.size ?? 0,
      attempted: seen.get(topicKey)?.size ?? 0,
    });
  }
  return out;
}

// The most recent topic touched, for "pick up where you left off". Derived from
// max(created_at) on the attempt log, so there is no second write path to keep
// in sync.
export function mostRecentTopic(attempts: AttemptRow[]): AttemptRow | null {
  return attempts[0] ?? null;
}

export type ClassRow = { id: string; name: string };

export async function getEnrolledClasses(studentId: string): Promise<ClassRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('class_enrollments')
    .select('class_id, status, classes(id, name, archived_at)')
    .eq('student_id', studentId);

  return (data ?? [])
    .filter((row) => row.status !== 'removed')
    .map((row) => {
      // PostgREST returns an embedded to-one relation as an array.
      const cls = Array.isArray(row.classes) ? row.classes[0] : row.classes;
      return cls as { id: string; name: string; archived_at: string | null } | null;
    })
    .filter((cls): cls is { id: string; name: string; archived_at: string | null } => Boolean(cls))
    .filter((cls) => !cls.archived_at)
    .map((cls) => ({ id: cls.id, name: cls.name }));
}

export type Announcement = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  class_id: string | null;
};

export type AnnouncementsResult =
  | { status: 'ok'; announcements: Announcement[] }
  | { status: 'not_provisioned' };

// Published announcements for this student's classes, newest first. A null
// class_id is a school-wide notice and reaches everyone.
//
// Returns not_provisioned when the table is missing, so the page can say so
// plainly instead of rendering an empty list that looks like "no news".
export async function getAnnouncements(studentId: string): Promise<AnnouncementsResult> {
  const classes = await getEnrolledClasses(studentId);
  const admin = createAdminClient();

  const scope = classes.length
    ? `class_id.is.null,class_id.in.(${classes.map((c) => c.id).join(',')})`
    : 'class_id.is.null';

  const { data, error } = await admin
    .from('announcements')
    .select('id, title, body, created_at, class_id')
    .eq('published', true)
    .or(scope)
    .order('created_at', { ascending: false })
    .limit(50);

  // 42P01 is undefined_table. PostgREST also reports a missing relation as
  // PGRST205 when it is absent from the schema cache.
  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') return { status: 'not_provisioned' };
    return { status: 'ok', announcements: [] };
  }

  return { status: 'ok', announcements: (data ?? []) as Announcement[] };
}

export type TestSession = {
  id: string;
  created_at: string;
  completed_at: string | null;
  final_score: number | null;
  final_theta: number | null;
};

export async function getTestSessions(studentId: string): Promise<TestSession[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('sessions')
    .select('id, created_at, completed_at, final_score, final_theta')
    .eq('user_id', studentId)
    .order('created_at', { ascending: false });

  return data ?? [];
}
