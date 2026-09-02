import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";
import { provisionStudentSchema, formatZodError } from "../../../lib/schemas";
import { provisionRateLimit, rateLimitHeaders, safeLimit } from "../../../lib/rate-limit";
import { provisionStudent } from "../../../lib/student-provision";

// "Add with code" -- one student, one account, one sign-in code.
//
// ORDER OF THE GATES, deliberately: teacher, then rate limit, then body, then
// class ownership. The limit is charged before the body is parsed so malformed
// spam still costs an attacker their budget, and after requireTeacher so it can
// be keyed on the account rather than on an IP.
//
// NOT BEHIND class-data-export. That capability gates the Pro-only CSV
// downloads; adding a student to your own class is not an export and must not
// inherit the check.
//
// THE CODE IS RETURNED EXACTLY ONCE and there is no second way to get it: it is
// the password, and Supabase stores only its hash. There is deliberately no
// endpoint that reads one back.

export async function POST(req: Request) {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { success, reset } = await safeLimit(provisionRateLimit, profile.id);
  if (!success) {
    return NextResponse.json(
      { error: "Too many students added in a short time. Try again in a little while." },
      { status: 429, headers: rateLimitHeaders(reset) }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let parsed: z.infer<typeof provisionStudentSchema>;
  try {
    parsed = provisionStudentSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: formatZodError(err) }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Same ownership check as the invite route (invite/route.ts:37-46): the class
  // must exist AND belong to the caller. A class the teacher does not own is
  // reported as not found rather than forbidden, so the response cannot be used
  // to confirm that somebody else's class id is real.
  const { data: cls, error: clsError } = await admin
    .from("classes")
    .select("id")
    .eq("id", parsed.class_id)
    .eq("teacher_id", profile.id)
    .single();

  if (clsError || !cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const result = await provisionStudent(admin, {
    classId: parsed.class_id,
    teacherId: profile.id,
    email: parsed.email,
    firstName: parsed.first_name,
    lastName: parsed.last_name,
  });

  if (result.outcome === "own-account") {
    return NextResponse.json(
      { error: "That is your own account. You cannot add yourself as a student." },
      { status: 400 }
    );
  }

  if (result.outcome === "failed") {
    return NextResponse.json({ error: result.error ?? "Something went wrong." }, { status: 500 });
  }

  // "already-enrolled" IS SUCCESS, and this is the line that makes the route
  // idempotent. handle_pending_invites() may have enrolled the student the
  // instant the account was created, and a teacher running the same add twice
  // must get an answer rather than a 409 or a 500.
  return NextResponse.json({
    status: result.outcome, // "created" | "existing"
    email: result.email,
    code: result.code, // null unless an account was just minted
    enrolment: result.enrolment, // enrolled | reactivated | already-enrolled | failed
  });
}
