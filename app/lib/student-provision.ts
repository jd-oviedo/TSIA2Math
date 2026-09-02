import type { SupabaseClient } from "@supabase/supabase-js";
import { findUserByEmail } from "./teacher-directory";
import { enrolInClass, type EnrolOutcome } from "./class-enrol";
import { generateStudentCode } from "./student-code";

// Provisioning one student account from the teacher dashboard.
//
// WHY IT EXISTS: the district's Workspace admin blocks students from Google
// OAuth, which was the only way in. The code minted here IS the password on the
// account. Identity is the student's district email, so when "Connect Google"
// ships a later Google sign-in on that address lands on this same account rather
// than a second one.
//
// SPLIT FROM THE ROUTE the way join-enroll.ts is split from the OAuth callback:
// the route owns who may run this and how often, this owns what happens. That is
// what lets the idempotency below be tested against a stub client instead of a
// live GoTrue.
//
// ─── Idempotent, and the trigger is why ──────────────────────────────────────
//
// Running this twice for the same student must not 500 and must not double
// anything. Three things can already be true before it acts:
//
//   1. THE ACCOUNT EXISTS -- the student signed up, or a colleague provisioned
//      them. Nothing is minted and no code comes back. Supabase hashes the
//      password; it is not recoverable, and inventing a new one would silently
//      lock the student out of the account they already use.
//   2. THE ENROLMENT EXISTS. handle_pending_invites() is an AFTER INSERT trigger
//      on auth.users that enrols a new account from any matching pending_invites
//      row, so a teacher who sent an invite first finds the student enrolled by
//      the database BEFORE the enrol step here runs. enrolInClass resolves that
//      conflict to success.
//   3. Both.
//
// The lookup and the create are also not atomic, so createUser can lose a race.
// That refusal is caught and folded into case 1 -- the same answer the next run
// would have given a moment later.

export type ProvisionOutcome =
  /** A new account was minted. `code` is set, and this is the only time it is. */
  | "created"
  /** An account already held this email. Nothing minted, no code exists. */
  | "existing"
  /** The email is the teacher's own. */
  | "own-account"
  /** Nothing was created and nothing was enrolled. */
  | "failed";

export interface ProvisionResult {
  outcome: ProvisionOutcome;
  email: string;
  /** Set on "created" only. Shown once, never recoverable. */
  code: string | null;
  userId: string | null;
  /** How the class enrolment ended. Null when none was attempted. */
  enrolment: EnrolOutcome | null;
  /** Operator-facing detail for "failed". Null otherwise. */
  error: string | null;
}

export interface ProvisionInput {
  classId: string;
  /** The class owner, already verified by the route. */
  teacherId: string;
  email: string;
  firstName: string;
  lastName: string;
}

/** GoTrue's "that address is taken", by every spelling it has used. */
function isAlreadyRegistered(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  if (err.code === "email_exists" || err.code === "user_already_exists") return true;
  return /already (been )?registered|already exists/i.test(err.message ?? "");
}

function failure(email: string, error: string): ProvisionResult {
  return { outcome: "failed", email, code: null, userId: null, enrolment: null, error };
}

// The account existed. Enrol and report, without a code.
async function joinExisting(
  admin: SupabaseClient,
  input: ProvisionInput,
  email: string,
  userId: string
): Promise<ProvisionResult> {
  // Carried across from join-enroll.ts:92-94. The likeliest person to reach it
  // is a teacher typing their own address to see what the flow does.
  if (userId === input.teacherId) {
    return { outcome: "own-account", email, code: null, userId, enrolment: null, error: null };
  }
  const enrolment = await enrolInClass(admin, input.classId, userId, "teacher_invite");
  return { outcome: "existing", email, code: null, userId, enrolment, error: null };
}

export async function provisionStudent(
  admin: SupabaseClient,
  input: ProvisionInput
): Promise<ProvisionResult> {
  const email = input.email.trim().toLowerCase();
  // profiles has no name column; the display name lives in user_metadata and is
  // read back through displayName() in auth.ts.
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();

  let existing: { id: string } | null;
  try {
    existing = await findUserByEmail(admin, email);
  } catch (err) {
    // A page that failed to read is not "no such user", and minting on top of
    // that answer is the one mistake here that cannot be taken back.
    console.error("[provision] user lookup failed:", err instanceof Error ? err.message : err);
    return failure(
      email,
      "Could not check whether that email already has an account. Nothing was created."
    );
  }

  if (existing) return joinExisting(admin, input, email, existing.id);

  const code = generateStudentCode();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: code,
    // No confirmation mail: the teacher hands the code over in person. It also
    // means this route sends the student nothing, so it is not a mail vector.
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError) {
    if (isAlreadyRegistered(createError)) {
      // Lost the race with another provisioner, or with the student signing up
      // in the seconds since the lookup. Same answer the next run would give.
      let raced: { id: string } | null = null;
      try {
        raced = await findUserByEmail(admin, email);
      } catch {
        raced = null;
      }
      if (raced) return joinExisting(admin, input, email, raced.id);
    }
    console.error("[provision] createUser failed:", createError.message);
    return failure(email, createError.message);
  }

  const userId = created?.user?.id ?? null;
  if (!userId) {
    console.error("[provision] createUser returned no user");
    return failure(email, "The account could not be created.");
  }

  // THE ACCOUNT NOW EXISTS AND ITS PASSWORD IS UNRECOVERABLE, so from this line
  // on the code is returned whatever the enrolment does. A failed enrolment is a
  // student who has to be added to the class again; a swallowed code is a
  // student who can never sign in at all.
  const enrolment = await enrolInClass(admin, input.classId, userId, "teacher_invite");
  return { outcome: "created", email, code, userId, enrolment, error: null };
}
