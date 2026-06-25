import { NextResponse } from "next/server";
import { requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";

export async function GET(req: Request) {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("class_id");
  if (!classId) {
    return NextResponse.json({ error: "class_id is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify this class belongs to the requesting teacher
  const { data: cls, error: clsError } = await admin
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", profile.id)
    .single();

  if (clsError || !cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Get all enrolled students for this class
  const { data: enrollments, error: enrollError } = await admin
    .from("class_enrollments")
    .select("student_id, enrolled_via, enrolled_at")
    .eq("class_id", classId)
    .eq("status", "active");

  if (enrollError) {
    return NextResponse.json({ error: enrollError.message }, { status: 500 });
  }

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ roster: [] });
  }

  const studentIds = enrollments.map((e) => e.student_id);

  // Get all sessions for enrolled students (not filtered by teacher_id --
  // includes pre-enrollment sessions per the product decision)
  const { data: sessions, error: sessError } = await admin
    .from("sessions")
    .select("id, user_id, final_score, strand_breakdown, created_at")
    .in("user_id", studentIds)
    .order("created_at", { ascending: false });

  if (sessError) {
    return NextResponse.json({ error: sessError.message }, { status: 500 });
  }

  // Get user emails from auth.users via admin
  const { data: users, error: usersError } = await admin.auth.admin.listUsers();
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const userMap = new Map(
    (users.users ?? []).map((u) => [u.id, u.email ?? ""])
  );

  // Build roster: most recent session per student + attempt count
  const sessionsByStudent = new Map<string, typeof sessions>();
  for (const s of sessions ?? []) {
    if (!sessionsByStudent.has(s.user_id)) {
      sessionsByStudent.set(s.user_id, []);
    }
    sessionsByStudent.get(s.user_id)!.push(s);
  }

  const roster = enrollments.map((e) => {
    const studentSessions = sessionsByStudent.get(e.student_id) ?? [];
    const latest = studentSessions[0] ?? null;
    const email = userMap.get(e.student_id) ?? "";
    const initials = email
      .split("@")[0]
      .split(/[._-]/)
      .map((p: string) => p[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");

    return {
      student_id: e.student_id,
      email,
      initials: initials || "??",
      enrolled_via: e.enrolled_via,
      enrolled_at: e.enrolled_at,
      attempt_count: studentSessions.length,
      latest_session: latest
        ? {
            id: latest.id,
            final_score: latest.final_score,
            strand_breakdown: latest.strand_breakdown,
            completed_at: latest.created_at,
          }
        : null,
    };
  });

  return NextResponse.json({ roster });
}