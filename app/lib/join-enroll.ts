import type { SupabaseClient } from "@supabase/supabase-js";
import { checkJoinCode } from "./join-code";

// Post-authentication enrolment from the join-code cookie.
//
// Split out of app/auth/callback so it can be reasoned about, and tested,
// without an OAuth round trip. The callback owns when this runs; this owns what
// happens.
//
// THE CLIENT-SUPPLIED CODE IS NOT TRUSTED PAST THE LOOKUP. The pre-auth route
// answered "does this code name a class"; that answer is a hint about intent and
// nothing more. Everything authoritative happens here, after the user is
// authenticated: the code is re-validated, the class is re-resolved, and the
// write is made against the freshly authenticated user id -- never against
// anything the browser sent.
//
// RE-RESOLVED RATHER THAN CARRIED. The cookie holds the code, not the class id,
// so a class archived or deleted in the seconds between the confirmation screen
// and the callback is caught here instead of enrolled into.
//
// ─── The duplicate guard is the database's, not ours ─────────────────────────
//
// /api/enroll:41-58 checks for an existing row and then writes, which is a
// read-then-write with no transaction: two concurrent submits can both pass the
// check. That guard is deliberately NOT ported forward. class_enrollments
// carries a unique constraint on (class_id, student_id)
// -- class_enrollments_class_id_student_id_key, confirmed live -- so the insert
// is attempted first and the conflict is the signal. The status inspection
// happens only in the conflict branch, where it cannot race.
//
// The OUTCOMES match /api/enroll's semantics exactly, because two doors into the
// same table telling a student two different stories is worse than either story:
//   status 'active'  -> a real "you are already in this class", with its own copy
//   status 'removed' -> flipped back to active and treated as success
// The reactivation writes { status: 'active' } and nothing else, matching
// /api/enroll:53-56 rather than the teacher-invite route, which also rewrites
// enrolled_via.

export type JoinOutcome =
  | "enrolled"
  | "reactivated"
  | "already-enrolled"
  | "class-gone"
  | "own-class"
  | "invalid"
  | "failed";

export interface JoinResult {
  outcome: JoinOutcome;
  /** The class name, when one was resolved. Null otherwise. */
  className: string | null;
}

/** Did the student end up in the class, by any route? */
export function isJoinSuccess(outcome: JoinOutcome): boolean {
  return outcome === "enrolled" || outcome === "reactivated";
}

export async function enrolFromJoinCode(
  admin: SupabaseClient,
  userId: string,
  rawCode: string
): Promise<JoinResult> {
  const parsed = checkJoinCode(rawCode);
  if (!parsed.ok) {
    // Only reachable if the cookie was tampered with or the alphabet changed
    // under a cookie already in flight, since the lookup route validated before
    // setting it. Still handled: a bad cookie must not become a bad write.
    return { outcome: "invalid", className: null };
  }

  const { data: cls, error: clsError } = await admin
    .from("classes")
    .select("id, name, teacher_id")
    .eq("join_code", parsed.code)
    .is("archived_at", null)
    .maybeSingle();

  if (clsError) {
    console.error("[join-enroll] class re-resolution failed:", clsError.message);
    return { outcome: "failed", className: null };
  }
  // Archived, deleted, or its code rotated between the lookup and here. A
  // separate outcome from "failed" because the student needs a different
  // sentence: nothing is broken, the class is simply no longer joinable.
  if (!cls) return { outcome: "class-gone", className: null };

  // Carried across from /api/enroll:36-38. The likeliest person to hit it is a
  // teacher walking their own student flow to see what it looks like.
  if (cls.teacher_id === userId) {
    return { outcome: "own-class", className: cls.name };
  }

  const { error: insertError } = await admin.from("class_enrollments").insert({
    class_id: cls.id,
    student_id: userId,
    enrolled_via: "join_code",
  });

  if (!insertError) return { outcome: "enrolled", className: cls.name };

  // 23505 is unique_violation: the row already exists. Anything else is a real
  // failure and must not be reported as success.
  if (insertError.code !== "23505") {
    console.error("[join-enroll] enrolment insert failed:", insertError.message);
    return { outcome: "failed", className: cls.name };
  }

  const { data: existing, error: existingError } = await admin
    .from("class_enrollments")
    .select("id, status")
    .eq("class_id", cls.id)
    .eq("student_id", userId)
    .maybeSingle();

  if (existingError || !existing) {
    // The constraint fired but the row cannot be read back. Nothing sensible
    // left to say, and claiming success would be a lie.
    console.error(
      "[join-enroll] conflict on insert but no row found:",
      existingError?.message ?? "no row"
    );
    return { outcome: "failed", className: cls.name };
  }

  if (existing.status === "active") {
    return { outcome: "already-enrolled", className: cls.name };
  }

  const { error: reactivateError } = await admin
    .from("class_enrollments")
    .update({ status: "active" })
    .eq("id", existing.id);

  if (reactivateError) {
    console.error("[join-enroll] reactivation failed:", reactivateError.message);
    return { outcome: "failed", className: cls.name };
  }

  return { outcome: "reactivated", className: cls.name };
}
