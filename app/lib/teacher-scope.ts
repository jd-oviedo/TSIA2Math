import type { createAdminClient } from "./supabase-admin";

// The teacher tenancy boundary, in one place.
//
// WHY THIS FILE EXISTS. Every teacher API route runs on the service-role client
// (createAdminClient), which bypasses RLS. There is no policy underneath these
// handlers doing a second check: the ownership query IN THE HANDLER is the
// entire boundary between one teacher's class and another's. That is stated
// already at app/api/teacher/official-scores/route.ts:100-105 and it is worth
// repeating here, because this module is now the thing that boundary is made of.
//
// It was made of four hand-written copies of the same two queries:
//
//   app/api/teacher/roster/route.ts:24-40
//   app/api/teacher/student/route.ts:26-43
//   app/api/teacher/misconceptions/route.ts:25-37
//   app/api/teacher/official-scores/route.ts:106-135  (private requireTenancy)
//
// They agree on ownership and DISAGREE on membership. See activeStudentIds.
//
// SCOPE, 2026-08-24: this ships as the helper for NEW routes only. The four call
// sites above are deliberately NOT migrated in this change -- two of them carry
// the membership bug described below, and fixing it moves live teacher-visible
// behaviour, which is its own change and its own decision. They are logged in
// the PR body by file and line so the fix is tracked rather than assumed.

type Admin = ReturnType<typeof createAdminClient>;

/**
 * Does this teacher own this class?
 *
 * Returns the class row, or null. NULL IS A 404 AT EVERY CALLER, never a 403,
 * matching what the existing routes already answer: a teacher asking about a
 * class id that is not theirs is told it does not exist, rather than told it
 * exists and belongs to somebody else. 403 would confirm the id is real.
 *
 * archived_at is NOT filtered. An archived class is one a teacher still owns and
 * still has every right to read the record of; the dashboard hides archived
 * classes from its own picker (app/teacher/page.tsx:40), which is a different
 * question from whether a direct request for one should be refused. Same call
 * that resolveOwnedClasses makes for explicitly-named ids
 * (app/lib/teacher-export.ts:98-100), and made for the same reason.
 */
export async function requireClassOwnership(
  admin: Admin,
  teacherId: string,
  classId: string
): Promise<{ id: string; name: string } | null> {
  const { data, error } = await admin
    .from("classes")
    .select("id, name")
    .eq("id", classId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

/**
 * The ACTIVE students in a class.
 *
 * `status = 'active'` IS BAKED IN AND THAT IS THE ENTIRE REASON THIS FUNCTION
 * EXISTS RATHER THAN THE CALLER WRITING TWO LINES OF SUPABASE.
 *
 * The filter is currently applied by three readers of class_enrollments and
 * omitted by two:
 *
 *   applied  app/api/teacher/roster/route.ts:40
 *   applied  app/api/teacher/misconceptions/route.ts:37
 *   applied  app/lib/teacher-export.ts:182
 *   OMITTED  app/api/teacher/student/route.ts:38-43
 *   OMITTED  app/api/teacher/official-scores/route.ts:124-129
 *
 * A removed student keeps their class_enrollments row with a non-active status,
 * so the two omissions render a student the teacher has removed. The bug is
 * invisible in testing because it needs a removal to have happened, and it is
 * the kind of thing that gets reintroduced by the next person to write these two
 * queries by hand -- which is what four copies guarantees will happen.
 *
 * So the correct filter is not something a caller remembers. It is something a
 * caller cannot express the query without.
 *
 * Throws on a read error rather than returning an empty array. An empty roster
 * and an unreadable one must not look the same to a caller: one renders "no
 * students yet", the other is a 500, and silently converting the second into
 * the first tells a teacher their class is empty when it is not.
 */
export async function activeStudentIds(admin: Admin, classId: string): Promise<string[]> {
  const { data, error } = await admin
    .from("class_enrollments")
    .select("student_id")
    .eq("class_id", classId)
    .eq("status", "active");

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.student_id as string);
}

/**
 * Is this student an ACTIVE member of this class?
 *
 * The single-student form of activeStudentIds, for a route that already knows
 * which student it is being asked about and would otherwise pull the whole
 * roster to check one id.
 *
 * OWNERSHIP IS NOT ENOUGH AND THIS IS THE OTHER HALF. Checking the class alone
 * admits any student id at all, paired with a class the teacher happens to own
 * -- which would turn a teacher route into a lookup for arbitrary students. Both
 * halves, always, in order. The same note sits over the private requireTenancy
 * this generalises (app/api/teacher/official-scores/route.ts:122-123).
 */
export async function isActiveMember(
  admin: Admin,
  classId: string,
  studentId: string
): Promise<boolean> {
  const { data, error } = await admin
    .from("class_enrollments")
    .select("student_id")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) return false;
  return true;
}
