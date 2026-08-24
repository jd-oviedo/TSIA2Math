import { NextResponse } from "next/server";
import { profileGrants, requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";
import { activeStudentIds, isActiveMember, requireClassOwnership } from "../../../lib/teacher-scope";
import { getTopics, getTopicStatuses, topicKey } from "../../../lib/curriculum-progress";
import { rollupClass, summarizeStudent, type ClassRollup, type StudentSummary } from "../../../lib/curriculum-rollup";

// /api/teacher/curriculum-progress
//
// How far a teacher's own students are through the course. Two modes on one
// handler, because both need the identical tenancy check and a second route
// would be a second place to get it wrong:
//
//   ?class_id=…                 the class rollup, for the dashboard panel
//   ?class_id=…&student_id=…    one student's per-topic list, for the detail page
//
// READ-ONLY. No POST, no PATCH, no DELETE, and no assignment. Build 2 is
// visibility.
//
// TWO GATES, NOT ONE, in the order the official-scores route establishes
// (app/api/teacher/official-scores/route.ts:26-35). requireTeacher() answers "is
// this an entitled teacher" by asking for 'teacher-dashboard'; profileGrants(…,
// 'curriculum-progress') answers "does their plan include this feature". Both
// tiers hold it, so today the second gate never refuses anybody -- and it is
// still load-bearing, because it is what a future plan that does not hold it
// would be refused by. scripts/faultproof_curriculum_progress.mjs proves it by
// deleting the grant and watching a Core teacher get a 403.
//
// THE TENANCY BOUNDARY IS THE OWNERSHIP CHECK IN THIS HANDLER. This runs on the
// service-role client, which bypasses RLS, exactly as roster/route.ts:21 and
// student/route.ts:23 do. There is no policy underneath. See
// app/lib/teacher-scope.ts, which is where both halves of the check now live.
//
// ─── NO GRADES, AND NO STORED COMPLETION STAMP ───────────────────────────────
//
// TWO THINGS ARE DELIBERATELY ABSENT FROM EVERY RESPONSE BELOW.
//
// 1. SCORES. TopicStatus carries correct, total, practiceCorrect, quizCorrect
//    and the gate thresholds. None of them are serialized. Build 2 shows STATUS;
//    grades are Build 3 and their own decision about what a teacher should see.
//
// 2. completedAt. TopicStatus.completedAt is curriculum_completion.completed_at,
//    the stored stamp. It is stripped HERE, server-side, so it is absent from
//    the JSON rather than merely unrendered -- a field that reaches the client is
//    a field the next component renders.
//
//    The stamp is not a synonym for complete. syncCompletionSnapshot writes it
//    under the strict rule, so it is null for the population the A1 lesson rule
//    catches: measured in production 2026-08-24, Sample Class 1 holds 9
//    curriculum_completion rows and 0 of them carry a completed_at, while the
//    live computation reports 8 topics in progress for one student. Every
//    "complete" on the teacher surface comes from `status`, which is the live A1
//    computation out of getTopicStatuses, and from nothing else.

/** One topic, as the student-detail list renders it. Status, never scores. */
type TopicProgressRow = {
  course_id: string;
  topic_id: string;
  topic_name: string;
  unit_number: number;
  sequence_in_unit: number;
  status: "complete" | "in_progress" | "not_started";
  /** Activity, not attainment: when this topic was last touched at all. */
  last_worked_at: string | null;
};

type StudentResponse = {
  student_id: string;
  class_id: string;
  summary: StudentSummary;
  topics: TopicProgressRow[];
};

type ClassResponse = {
  class_id: string;
  rollup: ClassRollup;
};

export async function GET(req: Request) {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!profileGrants(profile, "curriculum-progress", "teacher/curriculum-progress")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("class_id");
  const studentId = searchParams.get("student_id");

  if (!classId) {
    return NextResponse.json({ error: "class_id is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Ownership first, and 404 rather than 403: a class this teacher does not own
  // is a class that does not exist as far as they are concerned. Matching every
  // other teacher route.
  const cls = await requireClassOwnership(admin, profile.id, classId);
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const { topics } = await getTopics();

  // ─── One student ───────────────────────────────────────────────────────────
  if (studentId) {
    // Ownership is not enough. Without this, any student id in the product
    // paired with a class the teacher owns would return that student's progress.
    if (!(await isActiveMember(admin, classId, studentId))) {
      return NextResponse.json({ error: "Student not found in this class" }, { status: 404 });
    }

    const statusesByStudent = await getTopicStatuses([studentId]);
    const statuses = statusesByStudent.get(studentId) ?? new Map();

    // The projection that enforces the constraint at the top of this file. Built
    // field by field from `topics` rather than by spreading TopicStatus and
    // deleting what should not go out: a spread ships every field the type gains
    // in future by default, and the default has to be that nothing new reaches
    // the teacher surface without somebody deciding it should.
    const rows: TopicProgressRow[] = topics.map((topic) => {
      const status = statuses.get(topicKey(topic.course_id, topic.topic_id));
      return {
        course_id: topic.course_id,
        topic_id: topic.topic_id,
        topic_name: topic.topic_name,
        unit_number: topic.unit_number,
        sequence_in_unit: topic.sequence_in_unit,
        status: status?.status ?? "not_started",
        last_worked_at: status?.lastWorkedAt ?? null,
      };
    });

    const body: StudentResponse = {
      student_id: studentId,
      class_id: classId,
      summary: summarizeStudent(statuses, topics),
      topics: rows,
    };
    return NextResponse.json(body);
  }

  // ─── The whole class ───────────────────────────────────────────────────────
  let studentIds: string[];
  try {
    studentIds = await activeStudentIds(admin, classId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // An empty class is not an error, and it must not become a call to
  // getTopicStatuses([]) whose result is then reduced against a roster of none.
  // rollupClass handles it correctly -- every count 0, median 0 -- but going
  // through it explicitly keeps the empty case one obvious line rather than a
  // property of two functions agreeing.
  const statusesByStudent =
    studentIds.length > 0 ? await getTopicStatuses(studentIds) : new Map();

  const body: ClassResponse = {
    class_id: classId,
    rollup: rollupClass(statusesByStudent, studentIds, topics, Date.now()),
  };
  return NextResponse.json(body);
}
