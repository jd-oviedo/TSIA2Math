import { createAdminClient } from '../lib/supabase-admin';

// Dashboard-only reads. The curriculum sequence and gate maths live in
// app/lib/curriculum-progress.ts and are re-exported here, so Modules and the
// lesson/practice/quiz pages agree on ordering and on what counts as progress.
//
// All of it goes through the admin client, filtered by the caller's own id.
// That is not a shortcut around RLS, it is the house pattern: curriculum_attempts,
// responses and questions all enable row level security with zero grants to
// anon/authenticated, so a browser-side read returns nothing by design and the
// server is the only place these rows are legible.
//
// The rule that keeps that safe: every function here takes studentId and every
// query filters on it. There is no unscoped read in this file.

export {
  getTopics,
  getAttempts,
  progressByTopic,
  mostRecentTopic,
  gradableTotal,
  topicKey,
  topicHref,
} from '../lib/curriculum-progress';

export type {
  TopicRow,
  TopicProgress,
  TopicShape,
  AttemptRow,
} from '../lib/curriculum-progress';

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

// Has this student ever finished a diagnostic?
//
// A `sessions` row is only inserted once a run reaches the end, with
// completed_at stamped at insert time (app/api/sessions/route.ts), so a row
// existing is already the same claim as a run being finished. completed_at is
// still checked rather than assumed: it is nullable in the schema, and Home
// should not promise a student a result that isn't there if that ever changes.
//
// head + exact count so Postgres answers with a number and sends no rows --
// Home only needs the yes/no, and the row bodies are the expensive part.
//
// On error this returns true, which is the quiet direction: a false negative
// shows a student who has already tested a "Begin Diagnostic" card they don't
// need, while a false positive just leaves Home as it is today.
export async function hasCompletedDiagnostic(studentId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', studentId)
    .not('completed_at', 'is', null);

  if (error) {
    console.error('[dashboard/data] hasCompletedDiagnostic failed:', error.message);
    return true;
  }

  return (count ?? 0) > 0;
}
