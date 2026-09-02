// Whether a student is linked to a class, and what that decides.
//
// IN app/lib RATHER THAN app/dashboard BECAUSE TWO TREES READ IT NOW. It began
// in dashboard/data.ts, whose header opens "Dashboard-only reads" and means it;
// the moment the curriculum tree's slide-over needed the same answer, leaving it
// there would have made that claim false and pointed a seven-deep relative
// import at another route's data layer.
//
// This is the split dashboard/data.ts already makes for the reads the lesson
// pages share -- getTopics, getAttempts, progressByTopic all live in
// lib/curriculum-progress and are re-exported from there. Same move, same
// reason. dashboard/data.ts re-exports both symbols below, so every existing
// import site is untouched.
//
// Scoped to the caller's own id and filtered on it, like every read in that
// file: there is no unscoped query here.

import { cache } from 'react';
import { createAdminClient } from './supabase-admin';

export type ClassRow = { id: string; name: string };

/**
 * Every class this student is in, on the LOOSE reading of enrolment.
 *
 * cache()d per request as of the chrome-moding pass, and that is a fix rather
 * than an optimisation: Home already called this directly AND through
 * getAnnouncements, so a single Home render made the same query twice, and
 * showsClassChrome below added a third caller in the dashboard layout.
 * Memoised per request they are one read; the resolver in course-access.ts is
 * cache()d for exactly this reason and this is the same shape.
 *
 * The curriculum tree is the exception the memo cannot help. Its topic layout
 * is the only caller on that route, so there is nothing to share with and the
 * lookup is a genuine extra read per lesson page. Named there rather than
 * hidden here.
 *
 * PER REQUEST ONLY -- a student who joins a class must see it on their next
 * page load.
 */
export const getEnrolledClasses = cache(async function getEnrolledClasses(
  studentId: string
): Promise<ClassRow[]> {
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
});

/**
 * Does this viewer get the CLASS-LINKED dashboard chrome, or the solo one?
 *
 * THE ONE PLACE THIS QUESTION IS ANSWERED, and five callers ask it: the
 * dashboard rail, the curriculum tree's slide-over, Home's join affordance and
 * the two class-fed pages. So the nav a student is given and the pages behind
 * it cannot come apart -- a link that leads somewhere structurally empty, an
 * empty state on a page whose link was hidden, or a nav that grows two items
 * back when they open a lesson would all be that drift.
 *
 * THIS IS THE ENROLMENT AXIS AND NOT THE PAYMENT ONE. Nothing here reads plan,
 * plan_status, access_until or any capability. A FREE student on a teacher's
 * roster is class-linked and keeps every surface; a PAID student with no
 * teacher is solo and loses the two that would sit empty for them. Gating this
 * on entitlement instead would take Announcements away from exactly the
 * rostered free students it is written for.
 *
 * WHICH ENROLMENT PREDICATE, BECAUSE THIS CODEBASE HAS THREE AND THEY DISAGREE:
 *
 *   getEnrolledClasses          status <> 'removed', unarchived      LOOSE
 *   activeUnarchivedClassIds    status  = 'active',  unarchived      STRICT
 *   entitledTeacherGrants       strict PLUS the teacher is entitled  NARROWEST
 *   (app/lib/course-access.ts)
 *
 * This uses the LOOSE one, deliberately, for two reasons.
 *
 * It FAILS OPEN. A membership row in some third status is not 'removed', so it
 * still counts and the student keeps full chrome. Hiding Announcements from a
 * genuinely rostered student is a real harm; showing an extra nav item to an
 * edge-case one costs a click.
 *
 * And it is the SAME predicate the announcements scope already uses --
 * getAnnouncements calls getEnrolledClasses -- so the nav item and the content
 * behind it are decided by one rule. The strict form would let a student have
 * announcements to read with no link to reach them.
 *
 * NOT the narrowest form, which is what course-access.ts:169 resolves. That one
 * answers "may this student open the curriculum through their teacher's
 * entitlement", which is a payment question wearing an enrolment shape. A
 * rostered student whose teacher has lapsed still has a teacher.
 *
 * A TEACHER ALWAYS GETS THE FULL CHROME, whatever their own enrolments say.
 * Teachers reach this tree through the "Student view" link on their own
 * sidebar, and the entire point of that link is to see what a student sees. A
 * teacher holds no class_enrollments row as a STUDENT, so on enrolment alone
 * every teacher would preview a surface none of their students has -- the
 * preview would be wrong precisely for the person who posts the announcements.
 * This is a fact about who is looking, not about what anyone paid.
 */
export async function showsClassChrome(profile: {
  id: string;
  role: 'student' | 'teacher';
}): Promise<boolean> {
  if (profile.role === 'teacher') return true;
  return (await getEnrolledClasses(profile.id)).length > 0;
}
