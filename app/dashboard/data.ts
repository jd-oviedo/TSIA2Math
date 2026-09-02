import { createAdminClient } from '../lib/supabase-admin';
import { getEnrolledClasses } from '../lib/enrollment';
import { resolveCourseAccess } from '../lib/course-access';
import { allowsTopic } from '../lib/capabilities';
import { getTopicStatuses, getTopics, topicHref, topicKey } from '../lib/curriculum-progress';
import { targetsStudent, type AssignmentTarget } from '../lib/assignments';

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

// The enrolment reads moved to app/lib/enrollment.ts when the curriculum tree
// started needing the same answer; see that file's header. Re-exported here
// because this is where the dashboard has always imported them from.
export { getEnrolledClasses, showsClassChrome, type ClassRow } from '../lib/enrollment';

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

// ─── Assignments (Build 4b) ──────────────────────────────────────────────────
//
// What a teacher has set for THIS student. The student-facing half of the arc
// whose teacher half is app/api/teacher/assignments/route.ts.
//
// NO RLS ON THIS PATH, AND THAT IS THE HOUSE PATTERN RATHER THAN AN OVERSIGHT.
// sql/assignments.sql A7-A8 ship policies that would admit a student to their
// own assignment rows, and nothing here relies on them: this file reads through
// the admin client filtered by the caller's own id, exactly as the header of
// this module requires and exactly as every other student surface does. The
// policies remain the second line, defending the tables against a direct
// PostgREST read with a token -- a request the application never makes.
//
// It is also FORCED, not merely conventional. Status comes from
// getTopicStatuses(), which reads curriculum_attempts and curriculum_completion
// through the admin client; both tables hold zero grants for `authenticated`, so
// a student's own token could not compute their own status. A session-client
// read path and the A1 status requirement are mutually exclusive.

/**
 * The classes this student is ACTIVELY enrolled in, archived ones removed.
 *
 * WHY THIS IS NOT getEnrolledClasses(). That function filters
 * `status !== 'removed'` -- the loose reading -- and this one filters
 * `status = 'active'`, the strict one. The two readings both exist in this
 * codebase and they DISAGREE, which app/lib/course-access.ts:56 records.
 *
 * Assignments must use the strict form, because activeStudentIds
 * (app/lib/teacher-scope.ts:89-98) is what computes the teacher's tracker and it
 * is strict. If these two ever resolved membership differently, a student would
 * see an assignment the teacher's own view says is not theirs -- the exact drift
 * app/lib/assignments.ts exists to prevent, reintroduced one layer down.
 *
 * They agree on today's data: the status distribution in production was checked
 * before this build and holds 'active' and 'removed' only. The strict form is
 * used anyway, because the point is to be correct on the day a third status
 * appears rather than on the day it was checked.
 *
 * ARCHIVED CLASSES ARE EXCLUDED. A teacher cannot administer an archived class
 * -- their own dashboard picker does not list it (app/teacher/page.tsx:41) -- so
 * a student must not be shown work from one they can no longer be helped with.
 * Same archived test as getEnrolledClasses above.
 */
async function activeUnarchivedClassIds(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string
): Promise<Set<string>> {
  const { data, error } = await admin
    .from('class_enrollments')
    .select('class_id, classes(id, archived_at)')
    .eq('student_id', studentId)
    .eq('status', 'active');

  if (error) {
    console.error('[dashboard/data] assignment class scope failed:', error.message);
    return new Set();
  }

  const ids = new Set<string>();
  for (const row of data ?? []) {
    // PostgREST returns an embedded to-one relation as an array.
    const cls = Array.isArray(row.classes) ? row.classes[0] : row.classes;
    if (cls && !(cls as { archived_at: string | null }).archived_at) {
      ids.add(row.class_id as string);
    }
  }
  return ids;
}

/**
 * One assignment as the student sees it.
 *
 * STATUS ONLY, NEVER SCORES. TopicStatus carries correct, total,
 * practiceCorrect, quizCorrect, the gate thresholds and completedAt; none of
 * them are on this type. Built field by field below rather than by spreading a
 * TopicStatus and deleting what should not travel -- a spread ships every field
 * the type gains in future by default, and the default has to be that nothing
 * new reaches a student surface without somebody deciding it should. Same
 * discipline, same reason, as the 4a teacher route.
 */
export type StudentAssignment = {
  id: string;
  course_id: string;
  topic_id: string;
  topic_name: string;
  unit_number: number;
  /** Where the topic lives, so a row is a way in and not just a notice. */
  href: string;
  due_at: string | null;
  created_at: string;
  /** THE CANONICAL A1 NUMBER, from getTopicStatuses. Never a stored flag. */
  status: 'complete' | 'in_progress' | 'not_started';
};

/**
 * Every assignment targeting this student, with live status.
 *
 * THE STATUS IS THE TEACHER'S STATUS. It comes from getTopicStatuses([id]) --
 * the same function, called the same way, that the 4a tracker calls with a
 * roster. There is no second computation and no stored completion flag, so what
 * a student reads on a row and what their teacher reads on the tracker for that
 * student and that topic are the same value by construction rather than by
 * agreement.
 *
 * FOUR READS, none of them per-assignment: the class scope, the assignments in
 * those classes, the assignment_students rows naming this student, and one
 * getTopicStatuses. getTopics() is cached and already resolved on every page
 * that calls this.
 */
export async function getStudentAssignments(studentId: string): Promise<StudentAssignment[]> {
  const admin = createAdminClient();

  // 1. Scope. Active enrolment, unarchived classes.
  //
  // THIS IS ALSO THE SECURITY BOUNDARY OF THE WHOLE FUNCTION, because
  // targetsStudent() requires membership of the row's class in BOTH of its
  // branches. An assignment outside this set cannot be returned by any path
  // below, so the query in step 2 is already filtered to rows this student may
  // legally see -- rather than reading widely and trusting a later filter.
  const classIds = await activeUnarchivedClassIds(admin, studentId);
  if (classIds.size === 0) return [];

  // 2. Candidates: everything set for those classes, both targeting shapes.
  const { data: rows, error } = await admin
    .from('assignments')
    .select('id, class_id, course_id, topic_id, target_type, due_at, created_at')
    .in('class_id', [...classIds])
    .order('created_at', { ascending: false });

  if (error) {
    // 42P01 undefined_table / PGRST205 absent from the schema cache. The tables
    // are created by hand, so a pre-migration deploy renders "nothing assigned"
    // rather than taking the dashboard down. Logged, because on a migrated
    // database this branch is a real fault and not a quiet state.
    console.error('[dashboard/data] getStudentAssignments failed:', error.message);
    return [];
  }

  const candidates = (rows ?? []) as (AssignmentTarget & {
    course_id: string;
    topic_id: string;
    due_at: string | null;
    created_at: string;
  })[];
  if (candidates.length === 0) return [];

  // 3. Which of the student-target ones NAME this student. Scoped to this
  //    student's own id -- the filter the module header requires of every read
  //    in this file -- and to the candidate assignments, so it cannot become a
  //    lookup of anybody else's targeting.
  const studentTargetIds = candidates
    .filter((r) => r.target_type === 'student')
    .map((r) => r.id);

  let namedIn: Set<string> = new Set();
  if (studentTargetIds.length > 0) {
    const { data: links, error: linkError } = await admin
      .from('assignment_students')
      .select('assignment_id')
      .eq('student_id', studentId)
      .in('assignment_id', studentTargetIds);

    if (linkError) {
      // FAILS CLOSED, and this is the one place in this file that should.
      // An unreadable link table means we cannot tell which subset assignments
      // name this student. Rendering the class-target ones only would understate
      // their work; treating them all as named would show them another group's.
      // Neither is acceptable silently, so the whole list is refused and logged.
      console.error('[dashboard/data] assignment targets read failed:', linkError.message);
      return [];
    }
    namedIn = new Set((links ?? []).map((l) => l.assignment_id as string));
  }

  // 4. THE RULE, from the shared module. Mirrors resolveTargets() in the 4a
  //    route; see the note over targetsStudent for the clause-by-clause
  //    correspondence. namedIn is keyed by assignment, so the per-row set is
  //    "this student, if this assignment names them".
  const mine = candidates.filter((row) =>
    targetsStudent(
      row,
      studentId,
      namedIn.has(row.id) ? new Set([studentId]) : new Set<string>(),
      classIds
    )
  );
  if (mine.length === 0) return [];

  // 5. Status and topic metadata.
  const [statusesByStudent, { topics }, access] = await Promise.all([
    getTopicStatuses([studentId]),
    getTopics(),
    // Cached per request. Home and /dashboard/assignments both call it
    // themselves, so on those pages this costs nothing.
    resolveCourseAccess(),
  ]);
  const statuses = statusesByStudent.get(studentId) ?? new Map();
  const topicsByKey = new Map(topics.map((t) => [topicKey(t.course_id, t.topic_id), t]));

  const out: StudentAssignment[] = [];
  for (const row of mine) {
    const key = topicKey(row.course_id, row.topic_id);
    const topic = topicsByKey.get(key);

    // A topic that has been unpublished or turned into a placeholder since it
    // was assigned. There is nothing to link to, so the row is dropped rather
    // than rendered as a dead end -- the same call the gate below makes, for a
    // different cause.
    if (!topic) {
      console.warn(
        `[dashboard/data] assignment ${row.id} names a topic not in the course (${key}); hidden from student ${studentId}`
      );
      continue;
    }

    // THE GATE. An assigned topic the student's plan does not open would render
    // as a link to a locked door -- the defect app/dashboard/modules/page.tsx
    // was rewritten to remove, reappearing on the one surface a student is most
    // likely to click first.
    //
    // EXCLUDED, NOT DISABLED. A visibly locked row tells a student their teacher
    // set them work they may not do, which is a conversation the product cannot
    // help them have. It is logged instead, server-side, so the teacher-facing
    // signal that should exist can be built on something real. Tracked as a
    // follow-up in the PR body rather than left as a silent drop.
    if (!allowsTopic(access, 'curriculum', row.course_id, row.topic_id)) {
      console.warn(
        `[assignments] gated: student ${studentId} is assigned ${key} (assignment ${row.id}) but their plan does not grant it; row hidden`
      );
      continue;
    }

    out.push({
      id: row.id,
      course_id: row.course_id,
      topic_id: row.topic_id,
      topic_name: topic.topic_name,
      unit_number: topic.unit_number,
      href: topicHref(topic),
      // RAW. Overdue and the due-date bucket are derived at render against a
      // clock read in an effect, never here: a boolean computed on the server is
      // wrong the moment the response is cached, and wrong all night for a
      // student in a different timezone from the server.
      due_at: row.due_at,
      created_at: row.created_at,
      status: (statuses.get(key)?.status ?? 'not_started') as StudentAssignment['status'],
    });
  }

  return out;
}
