import { NextResponse } from "next/server";
import { requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";
import { inviteSchema, formatZodError } from "../../../lib/schemas";
import { z } from "zod";

export async function POST(req: Request) {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let parsed: z.infer<typeof inviteSchema>;
  try {
    parsed = inviteSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: formatZodError(err) }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, class_id } = parsed;
  const admin = createAdminClient();

  // Verify class belongs to this teacher
  const { data: cls, error: clsError } = await admin
    .from("classes")
    .select("id")
    .eq("id", class_id)
    .eq("teacher_id", profile.id)
    .single();

  if (clsError || !cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Check if a user with this email already exists
  const { data: users } = await admin.auth.admin.listUsers();
  const existingUser = (users?.users ?? []).find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    // User exists -- enroll them directly
    const { data: existing } = await admin
      .from("class_enrollments")
      .select("id, status")
      .eq("class_id", class_id)
      .eq("student_id", existingUser.id)
      .single();

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json({ error: "This student is already enrolled." }, { status: 409 });
      }
      await admin
        .from("class_enrollments")
        .update({ status: "active", enrolled_via: "teacher_invite" })
        .eq("id", existing.id);
    } else {
      await admin
        .from("class_enrollments")
        .insert({ class_id, student_id: existingUser.id, enrolled_via: "teacher_invite" });
    }
    return NextResponse.json({ status: "enrolled", email });
  }

  // User doesn't exist yet -- write to pending_invites
  const { error: inviteError } = await admin
    .from("pending_invites")
    .insert({ class_id, invited_email: email.toLowerCase(), invited_by: profile.id })
    .select()
    .single();

  // Unique constraint violation means already invited
  if (inviteError) {
    if (inviteError.code === "23505") {
      return NextResponse.json({ error: "This email has already been invited." }, { status: 409 });
    }
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  return NextResponse.json({ status: "invited", email });
}