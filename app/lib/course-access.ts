import { cache } from "react";
import { createClient } from "./supabase-server";
import { createAdminClient } from "./supabase-admin";
import { isEntitled } from "./entitlement";
import {
  planGrants,
  NO_COURSE_ACCESS,
  type CourseAccess,
} from "./capabilities";

export { allowsTopic, type CourseAccess } from "./capabilities";

// Who may open the course tree, and why.
//
// Three independent reasons, evaluated in order of cost. Any one is sufficient:
//
//   1. the visitor's own plan grants it              full-course
//   2. the visitor is an entitled teacher            the answer-key surface IS
//                                                    the course tree, and a
//                                                    teacher who cannot open the
//                                                    topic their student is
//                                                    stuck on has no product
//   3. a teacher of a class they are in is entitled  a student in a teacher's
//                                                    class bought nothing and
//                                                    must still get in
//
// Reason 2 is deliberately NOT expressed by adding `curriculum` to the teacher
// rows of the capability map. That map is also the record of what each plan
// SELLS, and Teacher Core does not sell student curriculum access. Two reasons
// to reach one route, kept separately legible.
//
// Reason 3 is DERIVED LIVE and never stored. Copying it onto the student row
// would go stale the moment the teacher lapses, and a lapsed teacher's class
// must stop granting. sql/entitlement_columns.sql records that decision.

type Profile = {
  plan: string | null;
  plan_status: string | null;
  access_until: string | null;
  subscription_status: string | null;
  role: string | null;
};

/**
 * TRANSITION PREDICATE, and the reason it is not just isEntitled.
 *
 * legacyActivateOnly (stripe-activation.ts:171) writes subscription_status
 * 'active' with NO plan, because writing a plan without a status violates
 * profiles_plan_pairing_check and it cannot name the product. It fires when a
 * checkout arrives on a Payment Link this build does not know, which is exactly
 * a link created after the current deploy.
 *
 * A gate on isEntitled alone reads plan_status null on such a row and DENIES, so
 * the fallback that exists to stop a buyer paying for nothing would become the
 * thing that locks them out. Accepting both during the transition is the agreed
 * shape, and the warning makes the fallback's use visible instead of silent.
 *
 * THIS IS WHY subscription_status CANNOT BE DROPPED YET. The blocker is
 * legacyActivateOnly by name, and dropping the column waits on that path being
 * able to name a product.
 */
function entitledDuringTransition(profile: Profile, source: string): boolean {
  if (isEntitled(profile.plan_status, profile.access_until)) return true;
  if (profile.subscription_status === "active") {
    console.warn(
      `[course-access] ${source} granted on legacy subscription_status with no plan. ` +
        `Written by legacyActivateOnly, which blocks dropping the column.`
    );
    return true;
  }
  return false;
}

/**
 * Every teacher whose live class this student is actively enrolled in, entitled
 * or not. The entitlement check is applied by the caller.
 *
 * THREE TRAPS IN THE EXISTING VERSION OF THIS QUERY, ALL FIXED HERE rather than
 * inherited. The original is in app/api/gumu/session/route.ts, where it decides
 * who to notify and where all three are harmless.
 *
 * 1. NO `.limit(1)`. The notification lookup takes the first enrolment, which is
 *    fine for "who do I tell" and wrong for entitlement: a student whose
 *    first-returned class has a lapsed teacher would be denied while a second
 *    class grants.
 * 2. `status = 'active'`, not `!== 'removed'`. The column is read both ways in
 *    the codebase (dashboard/data.ts:42 versus the GUMU route). This picks the
 *    one that fails closed on any third value the column might ever carry.
 * 3. `archived_at is null` is HONOURED. dashboard/data.ts filters archived
 *    classes; the GUMU lookup does not. An archived class must not grant.
 */
async function entitledTeacherGrants(studentId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("class_enrollments")
    .select("classes(teacher_id, archived_at)")
    .eq("student_id", studentId)
    .eq("status", "active");

  if (error) {
    console.error("[course-access] could not resolve the student's teachers", error);
    return false;
  }

  // PostgREST returns an embedded to-one relation as an array.
  const teacherIds = new Set<string>();
  for (const row of data ?? []) {
    const embedded = (row as { classes: unknown }).classes;
    const cls = (Array.isArray(embedded) ? embedded[0] : embedded) as
      | { teacher_id: string; archived_at: string | null }
      | null
      | undefined;
    if (!cls?.teacher_id || cls.archived_at) continue;
    teacherIds.add(cls.teacher_id);
  }
  if (teacherIds.size === 0) return false;

  const { data: teachers, error: teacherError } = await admin
    .from("profiles")
    .select("id, plan, plan_status, access_until, subscription_status, role")
    .in("id", [...teacherIds]);

  if (teacherError) {
    console.error("[course-access] could not read the teachers' entitlements", teacherError);
    return false;
  }

  // ANY one entitled teacher grants.
  return (teachers ?? []).some(
    (t) =>
      planGrants((t as Profile).plan, "teacher-dashboard") &&
      entitledDuringTransition(t as Profile, "derived teacher")
  );
}

/**
 * Resolve what this request may reach in the course tree.
 *
 * cache()d per request, so a layout and the page inside it resolve one read
 * rather than two. PER REQUEST ONLY, never across requests: a teacher lapsing
 * must take effect on the student's next page load, which is the whole reason
 * the derived path is derived rather than stored.
 */
export const resolveCourseAccess = cache(async (): Promise<CourseAccess> => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ANONYMOUS GETS NO CURRICULUM AT ALL, not even the free sample. The sample is
  // for signed-in free-tier users; an anonymous visitor gets the CAT engine and
  // nothing here.
  if (!session) return NO_COURSE_ACCESS;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("plan, plan_status, access_until, subscription_status, role")
    .eq("id", session.user.id)
    .single();

  if (error || !data) {
    console.error("[course-access] could not read the profile", error);
    return NO_COURSE_ACCESS;
  }
  const profile = data as Profile;

  const entitled = entitledDuringTransition(profile, "own plan");

  if (planGrants(profile.plan, "curriculum") && entitled) {
    return {
      curriculum: true,
      gumu: planGrants(profile.plan, "gumu"),
      viaTeacher: false,
      signedIn: true,
    };
  }

  // The second door. Gated on the plan AND the role: a student row promoted to
  // role='teacher' by one of the three promotion paths does not hold a teacher
  // plan, so it does not get in this way.
  if (profile.role === "teacher" && planGrants(profile.plan, "teacher-dashboard") && entitled) {
    return { curriculum: true, gumu: true, viaTeacher: true, signedIn: true };
  }

  // Derived. A student in an entitled teacher's class bought nothing and gets
  // the full-course set, because GUMU is only reachable from inside a curriculum
  // page and granting it alone would be inert.
  if (await entitledTeacherGrants(session.user.id)) {
    return { curriculum: true, gumu: true, viaTeacher: false, signedIn: true };
  }

  // Signed in, no entitlement. Only the free sample is reachable from here.
  return { ...NO_COURSE_ACCESS, signedIn: true };
});
