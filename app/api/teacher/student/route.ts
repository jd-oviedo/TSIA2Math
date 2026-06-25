import { NextResponse } from "next/server";
import { requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";

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

  // Get student email from auth
  const { data: userData, error: userError } = await admin.auth.admin.getUserById(studentId);
  if (userError || !userData) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const email = userData.user.email ?? "";
  const initials = email
    .split("@")[0]
    .split(/[._-]/)
    .map((p: string) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("") || "??";

  // Get all sessions for this student
  const { data: sessions, error: sessError } = await admin
    .from("sessions")
    .select("id, final_score, strand_breakdown, created_at")
    .eq("user_id", studentId)
    .order("created_at", { ascending: false });

  if (sessError) {
    return NextResponse.json({ error: sessError.message }, { status: 500 });
  }

  // Get wrong responses from all sessions for misconception aggregation
  const sessionIds = (sessions ?? []).map((s) => s.id);
  let misconceptions: object[] = [];

  if (sessionIds.length > 0) {
    const { data: responses } = await admin
      .from("responses")
      .select("item_id, selected_answer, session_id")
      .in("session_id", sessionIds)
      .eq("is_correct", false);

    if (responses && responses.length > 0) {
      const itemIds = [...new Set(responses.map((r) => r.item_id))];

      const { data: questions } = await admin
        .from("questions")
        .select("item_id, primary_strand, topic_id, distractor_logic")
        .in("item_id", itemIds);

      const questionMap = new Map(
        (questions ?? []).map((q) => [q.item_id, q])
      );

      type AggEntry = {
        key: string;
        item_id: string;
        selected_answer: string;
        distractor_text: string;
        primary_strand: string;
        topic_id: string;
        frequency: number;
      };

      const aggMap = new Map<string, AggEntry>();

      for (const r of responses) {
        const q = questionMap.get(r.item_id);
        if (!q) continue;
        const distractorText = q.distractor_logic?.[r.selected_answer] ?? "Unknown misconception";
        if (distractorText.startsWith("Correct:")) continue;
        const key = `${r.item_id}__${r.selected_answer}`;
        if (!aggMap.has(key)) {
          aggMap.set(key, {
            key,
            item_id: r.item_id,
            selected_answer: r.selected_answer,
            distractor_text: distractorText,
            primary_strand: q.primary_strand,
            topic_id: q.topic_id,
            frequency: 0,
          });
        }
        aggMap.get(key)!.frequency += 1;
      }

      misconceptions = [...aggMap.values()]
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 6)
        .map((m, i) => ({ ...m, rank: i + 1, affected_students: 1 }));
    }
  }

  return NextResponse.json({
    student: { student_id: studentId, email, initials },
    enrollment: {
      class_id: classId,
      class_name: cls.name,
      enrolled_via: enrollment.enrolled_via,
      enrolled_at: enrollment.enrolled_at,
    },
    sessions: sessions ?? [],
    misconceptions,
  });
}