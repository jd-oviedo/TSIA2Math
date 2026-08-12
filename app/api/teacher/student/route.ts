import { NextResponse } from "next/server";
import { displayName, initialsFrom, requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";
import {
  aggregateMisconceptions,
  type AggregatedMisconception,
} from "../../../lib/misconception-aggregate";

export async function GET(req: Request) {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("student_id");
  const classId = searchParams.get("class_id");

  if (!studentId || !classId) {
    return NextResponse.json({ error: "student_id and class_id are required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify class belongs to this teacher
  const { data: cls, error: clsError } = await admin
    .from("classes")
    .select("id, name")
    .eq("id", classId)
    .eq("teacher_id", profile.id)
    .single();

  if (clsError || !cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Verify student is enrolled in this class
  const { data: enrollment, error: enrollError } = await admin
    .from("class_enrollments")
    .select("enrolled_via, enrolled_at, status")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .single();

  if (enrollError || !enrollment) {
    return NextResponse.json({ error: "Student not found in this class" }, { status: 404 });
  }

  // Get student email and name from auth -- getUserById carries user_metadata,
  // which is where the OAuth full_name lives.
  const { data: userData, error: userError } = await admin.auth.admin.getUserById(studentId);
  if (userError || !userData) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const email = userData.user.email ?? "";
  const name = displayName(userData.user.user_metadata, email);
  const initials = initialsFrom(name);

  // Get all sessions for this student
  const { data: sessions, error: sessError } = await admin
    .from("sessions")
    .select("id, final_score, strand_breakdown, created_at")
    .eq("user_id", studentId)
    .order("created_at", { ascending: false });

  if (sessError) {
    return NextResponse.json({ error: sessError.message }, { status: 500 });
  }

  // Same aggregation as the class view, scoped to this student's sessions, so
  // the two views cannot drift in how a misconception is defined or counted.
  // affected_students is computed rather than hardcoded to 1: it is a distinct
  // count over the sessions in scope, which for one student is 1 by
  // construction, and stays correct if this ever widens.
  const sessionIds = (sessions ?? []).map((s) => s.id);
  const sessionToStudent = new Map(sessionIds.map((id) => [id, studentId]));

  let misconceptions: AggregatedMisconception[] = [];
  let pendingMigration = false;
  try {
    const result = await aggregateMisconceptions(admin, sessionIds, sessionToStudent, 6);
    misconceptions = result.misconceptions;
    pendingMigration = result.pendingMigration;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Aggregation failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    student: { student_id: studentId, email, name, initials },
    enrollment: {
      class_id: classId,
      class_name: cls.name,
      enrolled_via: enrollment.enrolled_via,
      enrolled_at: enrollment.enrolled_at,
    },
    sessions: sessions ?? [],
    misconceptions,
    pending_migration: pendingMigration,
  });
}