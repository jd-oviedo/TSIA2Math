import { redirect } from 'next/navigation';
import { profileGrants, requireTeacher } from '../../lib/auth';
import { createAdminClient } from '../../lib/supabase-admin';
import { requireClassOwnership } from '../../lib/teacher-scope';
import type { Profile } from '../../lib/auth';

// The server-side gate and class resolution shared by the three Build 3 pages.
//
// ONE PLACE, because there are three routes and the gate is the whole boundary:
// /teacher/students, /teacher/students/grades, and
// /teacher/students/grades/[studentId] each render server-side, and a page that
// forgot the capability check would be a grades surface with no gate at all.
// Same shape and same reasoning as requireWorksheetTeacher.
//
// THE CLASS COMES FROM THE URL, NOT FROM THE DASHBOARD. The dashboard's class
// picker is unpersisted React state (TeacherDashboardClient.tsx:1306) and is not
// reachable from another route, so these pages resolve their own list and take
// `?class_id=` when it is given. That also makes every one of them linkable and
// refreshable, which the dashboard's `#roster` anchor is not.

export type TeacherClass = { id: string; name: string };

/**
 * An entitled teacher, or a redirect. Never returns for an ineligible caller.
 *
 * TWO GATES, in the order every teacher route uses. requireTeacher() answers
 * "is this an entitled teacher"; profileGrants(…, 'student-grades') answers
 * "does their plan include grades". The second is deliberately NOT
 * 'curriculum-progress': that capability's own note refuses the reuse, because a
 * plan could hold progress without scores.
 */
export async function requireGradesTeacher(next: string): Promise<Profile> {
  const profile = await requireTeacher();
  if (!profile) {
    redirect('/login?role=teacher&next=' + encodeURIComponent(next));
  }
  if (!profileGrants(profile, 'student-grades', 'teacher/students')) {
    redirect('/teacher/inactive');
  }
  return profile;
}

/**
 * The teacher's own unarchived classes, and which one this page is about.
 *
 * ARCHIVED CLASSES ARE EXCLUDED FROM THE LIST, matching the dashboard picker
 * (app/teacher/page.tsx:41). A directly-requested archived class is a different
 * question and is answered by requireClassOwnership, which deliberately does not
 * filter archived_at -- a teacher still owns the record of a class they closed.
 *
 * AN UNOWNED class_id RESOLVES TO NULL, not to the teacher's first class. A
 * quiet fallback would answer a request for somebody else's class with real
 * data from a class the caller happens to own, which is a confusing way to be
 * correct; the caller renders "class not found" instead.
 */
export async function resolveClass(
  teacherId: string,
  requestedId: string | undefined
): Promise<{ classes: TeacherClass[]; selected: TeacherClass | null }> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('classes')
    .select('id, name, created_at')
    .eq('teacher_id', teacherId)
    .is('archived_at', null)
    .order('created_at', { ascending: true });

  const classes: TeacherClass[] = (data ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
  }));

  if (!requestedId) {
    return { classes, selected: classes[0] ?? null };
  }

  // Ownership is checked against the database rather than against the list
  // above, so an archived class reached by an explicit link still resolves.
  const owned = await requireClassOwnership(admin, teacherId, requestedId);
  return { classes, selected: owned ? { id: owned.id, name: owned.name } : null };
}
