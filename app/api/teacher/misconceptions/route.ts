import { NextResponse } from "next/server";
import { requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";
import { aggregateMisconceptions } from "../../../lib/misconception-aggregate";

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

  // Verify class ownership
  const { data: cls, error: clsError } = await admin
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", profile.id)
    .single();

  if (clsError || !cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Get enrolled student IDs
  const { data: enrollments } = await admin
    .from("class_enrollments")
    .select("student_id")
    .eq("class_id", classId)
    .eq("status", "active");

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ misconceptions: [] });
  }

  const studentIds = enrollments.map((e) => e.student_id);

  // Get most recent session per student
  const { data: sessions } = await admin
    .from("sessions")
    .select("id, user_id, created_at")
    .in("user_id", studentIds)
    .order("created_at", { ascending: false });

  const latestSessionIds: string[] = [];
  const seenStudents = new Set<string>();
  const sessionToStudent = new Map<string, string>();

  for (const s of sessions ?? []) {
    if (!seenStudents.has(s.user_id)) {
      seenStudents.add(s.user_id);
      latestSessionIds.push(s.id);
      sessionToStudent.set(s.id, s.user_id);
    }
  }

  if (latestSessionIds.length === 0) {
    return NextResponse.json({ misconceptions: [] });
  }

  // Grouped by misconception slug across every item that tests it, so two
  // students hitting the same error on different items land on one card and a
  // student who hits it twice counts once. See app/lib/misconception-aggregate.ts.
  try {
    const { misconceptions, pendingMigration } = await aggregateMisconceptions(
      admin,
      latestSessionIds,
      sessionToStudent,
      10
    );
    return NextResponse.json({ misconceptions, pending_migration: pendingMigration });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Aggregation failed" },
      { status: 500 }
    );
  }
}