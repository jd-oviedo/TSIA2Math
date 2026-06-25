import { NextResponse } from "next/server";
import { createClient } from "../../lib/supabase-server";
import { createAdminClient } from "../../lib/supabase-admin";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json();
  const code = typeof body.join_code === "string"
    ? body.join_code.trim().toUpperCase()
    : "";

  if (!code || code.length !== 6) {
    return NextResponse.json({ error: "Enter a valid 6-character join code." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Look up the class by join code
  const { data: cls, error: clsError } = await admin
    .from("classes")
    .select("id, name, teacher_id")
    .eq("join_code", code)
    .is("archived_at", null)
    .single();

  if (clsError || !cls) {
    return NextResponse.json({ error: "That code doesn't match any active class." }, { status: 404 });
  }

  // Don't let a teacher enroll in their own class
  if (cls.teacher_id === session.user.id) {
    return NextResponse.json({ error: "You can't enroll in your own class." }, { status: 400 });
  }

  // Check if already enrolled
  const { data: existing } = await admin
    .from("class_enrollments")
    .select("id, status")
    .eq("class_id", cls.id)
    .eq("student_id", session.user.id)
    .single();

  if (existing) {
    if (existing.status === "active") {
      return NextResponse.json({ error: "You're already enrolled in this class." }, { status: 409 });
    }
    // Re-activate if previously removed
    await admin
      .from("class_enrollments")
      .update({ status: "active" })
      .eq("id", existing.id);
    return NextResponse.json({ class_name: cls.name });
  }

  // Insert new enrollment
  const { error: enrollError } = await admin
    .from("class_enrollments")
    .insert({
      class_id: cls.id,
      student_id: session.user.id,
      enrolled_via: "join_code",
    });

  if (enrollError) {
    return NextResponse.json({ error: enrollError.message }, { status: 500 });
  }

  return NextResponse.json({ class_name: cls.name });
}