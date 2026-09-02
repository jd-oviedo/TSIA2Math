import type { SupabaseClient } from "@supabase/supabase-js";
import { checkJoinCode } from "./join-code";
import { enrolInClass } from "./class-enrol";

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
// THE WRITE ITSELF MOVED to app/lib/class-enrol.ts, unchanged, when the teacher
// dashboard gained a second door into class_enrollments. The duplicate guard,
// why it is the database's and not ours, and why reactivation writes status
// alone are all documented there. What stays here is what is specific to a join
// code: validating it, re-resolving the class, and refusing a teacher's own
// class.
//
// The OUTCOMES are unchanged -- EnrolOutcome's four values are members of
// JoinOutcome by construction -- because two doors into the same table telling a
// student two different stories is worse than either story:
//   status 'active'  -> a real "you are already in this class", with its own copy
//   status 'removed' -> flipped back to active and treated as success

export type JoinOutcome =
  | "enrolled"
  | "reactivated"
  | "already-enrolled"
  | "class-gone"
  | "own-class"
  | "invalid"
  // Synthesised by app/auth/callback, never returned from here: the sign-in
  // carried the join flag but the cookie was gone by the time it ran. It is a
  // real state a student can reach by leaving the Google prompt open past the
  // cookie's fifteen minutes, and without it they would land on the dashboard
  // silently unenrolled with nothing on screen to explain why.
  | "expired"
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

  const outcome = await enrolInClass(admin, cls.id, userId, "join_code");
  return { outcome, className: cls.name };
}
