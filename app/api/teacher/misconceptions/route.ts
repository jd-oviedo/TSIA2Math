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

  // Get most recent session ID per student
  const { data: sessions } = await admin
    .from("sessions")
    .select("id, user_id, created_at")
    .in("user_id", studentIds)
    .order("created_at", { ascending: false });

  const latestSessionIds: string[] = [];
  const seenStudents = new Set<string>();
  for (const s of sessions ?? []) {
    if (!seenStudents.has(s.user_id)) {
      seenStudents.add(s.user_id);
      latestSessionIds.push(s.id);
    }
  }

  if (latestSessionIds.length === 0) {
    return NextResponse.json({ misconceptions: [] });
  }

  // Get all wrong responses from those sessions
  const { data: responses, error: respError } = await admin
    .from("responses")
    .select("item_id, selected_answer, user_id")
    .in("session_id", latestSessionIds)
    .eq("is_correct", false);

  if (respError) {
    return NextResponse.json({ error: respError.message }, { status: 500 });
  }

  if (!responses || responses.length === 0) {
    return NextResponse.json({ misconceptions: [] });
  }

  // Get unique item IDs from wrong responses
  const itemIds = [...new Set(responses.map((r) => r.item_id))];

  // Fetch distractor_logic, strand, topic from questions (admin only)
  const { data: questions, error: qError } = await admin
    .from("questions")
    .select("item_id, primary_strand, topic_id, distractor_logic")
    .in("item_id", itemIds);

  if (qError) {
    return NextResponse.json({ error: qError.message }, { status: 500 });
  }

  const questionMap = new Map(
    (questions ?? []).map((q) => [q.item_id, q])
  );

  // Aggregate: group by item_id + selected_answer
  type AggEntry = {
    key: string;
    item_id: string;
    selected_answer: string;
    distractor_text: string;
    primary_strand: string;
    topic_id: string;
    frequency: number;
    affected_students: Set<string>;
  };

  const aggMap = new Map<string, AggEntry>();

  for (const r of responses) {
    const q = questionMap.get(r.item_id);
    if (!q) continue;

    const distractorText =
      q.distractor_logic?.[r.selected_answer] ?? "Unknown misconception";

    // Skip the correct answer entry
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
        affected_students: new Set(),
      });
    }
    const entry = aggMap.get(key)!;
    entry.frequency += 1;
    entry.affected_students.add(r.user_id);
  }

  // Sort by frequency descending, return top 10
  const misconceptions = [...aggMap.values()]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10)
    .map((m, i) => ({
      rank: i + 1,
      item_id: m.item_id,
      selected_answer: m.selected_answer,
      distractor_text: m.distractor_text,
      primary_strand: m.primary_strand,
      topic_id: m.topic_id,
      frequency: m.frequency,
      affected_students: m.affected_students.size,
    }));

  return NextResponse.json({ misconceptions });
}