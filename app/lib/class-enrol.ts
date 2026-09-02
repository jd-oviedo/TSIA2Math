import type { SupabaseClient } from "@supabase/supabase-js";

// Putting a student in a class, and nothing else.
//
// Lifted out of app/lib/join-enroll.ts, which owned it when a join code was the
// only door. There are two doors now -- a student redeeming a code, and a
// teacher provisioning an account from the dashboard -- and both meet the same
// conflict, so the conflict handling lives here and each caller keeps only the
// part that is its own.
//
// ─── The duplicate guard is the database's, not ours ─────────────────────────
//
// (Carried from join-enroll.ts, where this reasoning was first written.)
// /api/enroll:41-58 checks for an existing row and then writes, which is a
// read-then-write with no transaction: two concurrent submits can both pass the
// check. That guard is deliberately NOT reproduced here. class_enrollments
// carries a unique constraint on (class_id, student_id) --
// class_enrollments_class_id_student_id_key -- so the insert is attempted first
// and the conflict is the signal. The status inspection happens only in the
// conflict branch, where it cannot race.
//
// THE CONFLICT IS ROUTINE FOR THE PROVISIONING CALLER, not an edge case.
// handle_pending_invites() is an AFTER INSERT trigger on auth.users that enrols
// a new account from any matching pending_invites row. A teacher who invited a
// student and then provisions them finds the enrolment already made by the
// database, before this function is ever called.
//
// REACTIVATION WRITES status ONLY, matching /api/enroll:53-56 and not the
// teacher-invite route, which also rewrites enrolled_via. enrolled_via records
// how a student first arrived; one who joined by code, was removed, and is later
// provisioned did still arrive by code.

/** The values class_enrollments_enrolled_via_check permits. */
export type EnrolVia = "join_code" | "teacher_invite" | "self_enroll";

export type EnrolOutcome =
  | "enrolled"
  | "reactivated"
  | "already-enrolled"
  | "failed";

export async function enrolInClass(
  admin: SupabaseClient,
  classId: string,
  studentId: string,
  via: EnrolVia
): Promise<EnrolOutcome> {
  const { error: insertError } = await admin
    .from("class_enrollments")
    .insert({ class_id: classId, student_id: studentId, enrolled_via: via });

  if (!insertError) return "enrolled";

  // 23505 is unique_violation: the row already exists. Anything else is a real
  // failure and must not be reported as success.
  if (insertError.code !== "23505") {
    console.error("[class-enrol] enrolment insert failed:", insertError.message);
    return "failed";
  }

  const { data: existing, error: existingError } = await admin
    .from("class_enrollments")
    .select("id, status")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (existingError || !existing) {
    // The constraint fired but the row cannot be read back. Nothing sensible
    // left to say, and claiming success would be a lie.
    console.error(
      "[class-enrol] conflict on insert but no row found:",
      existingError?.message ?? "no row"
    );
    return "failed";
  }

  if (existing.status === "active") return "already-enrolled";

  const { error: reactivateError } = await admin
    .from("class_enrollments")
    .update({ status: "active" })
    .eq("id", existing.id);

  if (reactivateError) {
    console.error("[class-enrol] reactivation failed:", reactivateError.message);
    return "failed";
  }

  return "reactivated";
}
