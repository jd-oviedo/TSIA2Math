import { NextResponse } from "next/server";
import { initialsFrom, profileGrants, requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";
import { usersById, type DirectoryUser } from "../../../lib/teacher-directory";
import { activeStudentIds, isActiveMember, requireClassOwnership } from "../../../lib/teacher-scope";
import { getGradebook, getTopics, topicKey, type TopicRow, type TopicStatus } from "../../../lib/curriculum-progress";
import { targetsStudent, type AssignmentTarget } from "../../../lib/assignments";
import {
  rollupLetter,
  topicCompletion,
  type LetterResult,
  type SectionScore,
  type TopicGrades,
} from "../../../lib/grades";

// /api/teacher/grades
//
// What a teacher's own students are SCORING. Two modes on one handler, because
// both need the identical tenancy check and a second route would be a second
// place to get it wrong -- the same shape, for the same reason, as
// app/api/teacher/curriculum-progress/route.ts:
//
//   ?class_id=…                 the class grid, students x topics
//   ?class_id=…&student_id=…    one student's gradebook
//
// READ-ONLY. No POST, no PATCH, no DELETE. A grade here is DERIVED from the
// attempt log on every request and stored nowhere; there is no grade column and
// there must not be one.
//
// THREE GATES, IN ORDER, AND THE THIRD IS NEW.
//   requireTeacher()                          is this an entitled teacher
//   profileGrants(…, 'student-grades')        does their plan include GRADES
//   requireClassOwnership + membership        is this THEIR class and student
//
// 'student-grades' rather than 'curriculum-progress' is not a formality. That
// capability's own note forbids the reuse in as many words -- "STATUS ONLY, NOT
// GRADES [...] Do not widen this capability" -- and a plan that holds progress
// without scores is only expressible while the two stay separate keys.
//
// THE TENANCY BOUNDARY IS THE OWNERSHIP CHECK IN THIS HANDLER. This runs on the
// service-role client, which bypasses RLS. There is no policy underneath. See
// app/lib/teacher-scope.ts.
//
// ─── WHAT IS DELIBERATELY ABSENT FROM EVERY RESPONSE BELOW ───────────────────
//
// 1. completed_at. On TopicStatus as `completedAt`, stripped here, server-side,
//    exactly as Build 2 strips it -- the stored stamp is written under the
//    strict rule and is null for the whole population the A1 lesson rule
//    catches. Every "complete" a teacher reads comes from the live computation.
//
// 2. quiz_score. Not merely unserialized: never read, never selected. It is a
//    pre-computed percentage written when the LESSON is read, so it says 0 for
//    a quiz never opened -- seven of nine rows for the student this build was
//    measured against. See the header of app/lib/grades.ts, and the note in
//    fetchAttemptsAndCompletions where the column is pointedly not selected.
//
// 3. Anything a spread would have carried. Every body below is built field by
//    field from named values. A spread ships whatever the type gains next by
//    default, and the default has to be that nothing new reaches a grade
//    surface without somebody deciding it should.
//
// ─── ONE READ FOR THE WHOLE ROSTER ───────────────────────────────────────────
//
// getGradebook batches curriculum_attempts and curriculum_completion with .in(),
// so thirty students cost the same two round trips as one, and the statuses and
// the scores are computed from the SAME rows rather than from two reads that
// could observe an append-only table at two different moments.

/** One score, as a cell renders it. A fraction, never a bare percentage. */
type Score = { correct: number; total: number };

/**
 * One topic for one student.
 *
 * BOTH DEFINITIONS, BOTH LABELLED, and they are allowed to disagree -- that is
 * the point of shipping two fields rather than picking. `latest` is what the
 * student reads on /dashboard/grades; `mastery` is what the completion gates
 * enforce. Null means the section was never attempted, which is NOT zero.
 */
type GradeCell = {
  course_id: string;
  topic_id: string;
  /** THE GRADE. Quiz only. */
  quiz_latest: Score | null;
  quiz_mastery: Score | null;
  /**
   * CONTEXT, NEVER THE GRADE. Practice is formative and is reported beside the
   * quiz so a teacher can see effort next to attainment. Nothing downstream may
   * fold it in; see the two-axis note over topicCompletion in grades.ts.
   */
  practice_latest: Score | null;
  practice_mastery: Score | null;
  /**
   * The OTHER axis: lesson + practice + quiz, out of three. Practice DOES count
   * here and does not count toward the grade, deliberately. Null for a topic the
   * student has never touched, so a surface renders a dash rather than 0%.
   */
  completion: { done: number; total: number } | null;
};

type StudentGrades = {
  student_id: string;
  name: string;
  initials: string;
  /** The rollup. Mastery, equal weight per topic, with the evidence gate. */
  letter: SerializedLetter;
  cells: GradeCell[];
};

/** LetterResult, flattened for the wire. Both arms, no spread. */
type SerializedLetter =
  | { kind: "letter"; letter: string; percent: number; graded_topics: number; graded_items: number }
  | {
      kind: "withheld";
      reason: string;
      display: string;
      subtitle: string;
      graded_topics: number;
      graded_items: number;
    };

type TopicColumn = {
  course_id: string;
  topic_id: string;
  topic_name: string;
  unit_number: number;
  sequence_in_unit: number;
};

type ClassResponse = {
  class_id: string;
  /** The grid's columns, in course order. */
  topics: TopicColumn[];
  students: StudentGrades[];
};

type StudentResponse = {
  student_id: string;
  class_id: string;
  name: string;
  initials: string;
  letter: SerializedLetter;
  topics: (TopicColumn & GradeCell)[];
};

// ─── Projections ─────────────────────────────────────────────────────────────

function score(s: SectionScore | null): Score | null {
  // Two named fields, not a spread: SectionScore also carries `attempted` and
  // `lastWorkedAt`, and neither belongs in a cell.
  return s ? { correct: s.correct, total: s.total } : null;
}

function serializeLetter(result: LetterResult): SerializedLetter {
  return result.kind === "letter"
    ? {
        kind: "letter",
        letter: result.letter,
        percent: result.percent,
        graded_topics: result.gradedTopics,
        graded_items: result.gradedItems,
      }
    : {
        kind: "withheld",
        reason: result.reason,
        display: result.display,
        subtitle: result.subtitle,
        graded_topics: result.gradedTopics,
        graded_items: result.gradedItems,
      };
}

function cellFor(topic: TopicRow, grades: TopicGrades | undefined, status: TopicStatus | undefined): GradeCell {
  const completion = topicCompletion(status);
  return {
    course_id: topic.course_id,
    topic_id: topic.topic_id,
    quiz_latest: score(grades?.quiz.latest ?? null),
    quiz_mastery: score(grades?.quiz.mastery ?? null),
    practice_latest: score(grades?.practice.latest ?? null),
    practice_mastery: score(grades?.practice.mastery ?? null),
    completion: completion ? { done: completion.done, total: completion.total } : null,
  };
}

function column(topic: TopicRow): TopicColumn {
  return {
    course_id: topic.course_id,
    topic_id: topic.topic_id,
    topic_name: topic.topic_name,
    unit_number: topic.unit_number,
    sequence_in_unit: topic.sequence_in_unit,
  };
}

// ─── The assigned set ────────────────────────────────────────────────────────

/**
 * Which topics are ASSIGNED to each active student in this class.
 *
 * THE RULE IS NOT WRITTEN HERE. targetsStudent (app/lib/assignments.ts) is the
 * shared reverse resolver, the clause-by-clause mirror of resolveTargets in the
 * 4a write route, and it is what the student's own assignments page already
 * calls. A third hand-written copy of "does this assignment reach this student"
 * is exactly how the teacher's grid and the student's list come to disagree
 * about what was set.
 *
 * ASSIGNMENT IS ABOUT THE DENOMINATOR, NOT THE NUMERATOR. An assigned topic
 * enters a student's eligible set; whether it is GRADED still depends entirely
 * on there being a quiz attempt. Assigned-and-untouched work contributes
 * nothing, which is the whole reason rollupLetter takes this set rather than
 * grading everything in it.
 *
 * A missing table is not an error: sql/assignments.sql is run by hand, and a
 * pre-migration deploy should render grades over attempted topics rather than
 * 500. The grid degrades to "attempted only", which is visibly narrower rather
 * than silently wrong.
 */
async function assignedTopicsByStudent(
  admin: ReturnType<typeof createAdminClient>,
  classId: string,
  studentIds: string[]
): Promise<Map<string, Set<string>>> {
  const out = new Map<string, Set<string>>(studentIds.map((id) => [id, new Set<string>()]));

  const { data: rows, error } = await admin
    .from("assignments")
    .select("id, class_id, course_id, topic_id, target_type")
    .eq("class_id", classId);

  if (error) {
    console.error("[teacher/grades] assignments read failed:", error.message);
    return out;
  }
  const assignments = (rows ?? []) as (AssignmentTarget & { course_id: string; topic_id: string })[];
  if (assignments.length === 0) return out;

  const studentTargetIds = assignments.filter((a) => a.target_type === "student").map((a) => a.id);
  const namedByAssignment = new Map<string, Set<string>>();

  if (studentTargetIds.length > 0) {
    const { data: links, error: linkError } = await admin
      .from("assignment_students")
      .select("assignment_id, student_id")
      .in("assignment_id", studentTargetIds);

    if (linkError) {
      // Logged and treated as "nobody is named". A student-target assignment
      // whose links are unreadable must never fall back to the whole class --
      // the failure mode faultproof_assignments.mjs check W9 exists to catch,
      // reappearing in a read route.
      console.error("[teacher/grades] assignment targets read failed:", linkError.message);
    }
    for (const link of links ?? []) {
      const id = link.assignment_id as string;
      if (!namedByAssignment.has(id)) namedByAssignment.set(id, new Set());
      namedByAssignment.get(id)!.add(link.student_id as string);
    }
  }

  const classIds = new Set([classId]);
  for (const studentId of studentIds) {
    const mine = out.get(studentId)!;
    for (const row of assignments) {
      if (targetsStudent(row, studentId, namedByAssignment.get(row.id) ?? new Set(), classIds)) {
        mine.add(topicKey(row.course_id, row.topic_id));
      }
    }
  }
  return out;
}

/**
 * The eligible set for one student: assigned, OR touched at all. Never all 97.
 *
 * A student is not failing the topics nobody has asked them to do, and a roster
 * letter computed over the whole course would be a measurement of how far
 * through the year it is rather than of the student.
 */
function eligibleTopics(assigned: Set<string>, grades: Map<string, TopicGrades>): string[] {
  return [...new Set([...assigned, ...grades.keys()])];
}

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!profileGrants(profile, "student-grades", "teacher/grades")) {
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
  // is a class that does not exist as far as they are concerned.
  const cls = await requireClassOwnership(admin, profile.id, classId);
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const { topics } = await getTopics();
  const topicsByKey = new Map(topics.map((t) => [topicKey(t.course_id, t.topic_id), t]));

  let directory: Map<string, DirectoryUser>;
  try {
    directory = await usersById(admin);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // ─── One student ───────────────────────────────────────────────────────────
  if (studentId) {
    // Ownership is not enough. Without this, any student id in the product
    // paired with a class the teacher owns would return that student's grades.
    if (!(await isActiveMember(admin, classId, studentId))) {
      return NextResponse.json({ error: "Student not found in this class" }, { status: 404 });
    }

    const [books, assignedByStudent] = await Promise.all([
      getGradebook([studentId]),
      assignedTopicsByStudent(admin, classId, [studentId]),
    ]);
    const book = books.get(studentId);
    const grades = book?.grades ?? new Map<string, TopicGrades>();
    const statuses = book?.statuses ?? new Map<string, TopicStatus>();
    const assigned = assignedByStudent.get(studentId) ?? new Set<string>();
    const eligible = eligibleTopics(assigned, grades);

    // Rendered in course order, not in the order the student happened to work.
    const rows = eligible
      .map((k) => topicsByKey.get(k))
      .filter((t): t is TopicRow => Boolean(t))
      .sort((a, b) => a.unit_number - b.unit_number || a.sequence_in_unit - b.sequence_in_unit)
      .map((topic) => {
        const k = topicKey(topic.course_id, topic.topic_id);
        return { ...column(topic), ...cellFor(topic, grades.get(k), statuses.get(k)) };
      });

    const user = directory.get(studentId);
    const body: StudentResponse = {
      student_id: studentId,
      class_id: classId,
      name: user?.name ?? "",
      initials: initialsFrom(user?.name ?? ""),
      letter: serializeLetter(rollupLetter(grades, eligible)),
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

  // An empty class is not an error. Returning early keeps it one obvious line
  // rather than a property of three functions agreeing about an empty roster.
  if (studentIds.length === 0) {
    const empty: ClassResponse = { class_id: classId, topics: [], students: [] };
    return NextResponse.json(empty);
  }

  const [books, assignedByStudent] = await Promise.all([
    getGradebook(studentIds),
    assignedTopicsByStudent(admin, classId, studentIds),
  ]);

  // THE GRID'S COLUMNS ARE THE UNION, NOT THE COURSE. A 97-column grid of which
  // four are populated is unreadable and is mostly a report on what has not been
  // taught yet. Columns are the topics somebody in this class has been set or has
  // touched.
  const columnKeys = new Set<string>();
  const students: StudentGrades[] = [];

  for (const id of studentIds) {
    const book = books.get(id);
    const grades = book?.grades ?? new Map<string, TopicGrades>();
    const assigned = assignedByStudent.get(id) ?? new Set<string>();
    for (const k of eligibleTopics(assigned, grades)) {
      if (topicsByKey.has(k)) columnKeys.add(k);
    }
  }

  const columns = [...columnKeys]
    .map((k) => topicsByKey.get(k)!)
    .sort((a, b) => a.unit_number - b.unit_number || a.sequence_in_unit - b.sequence_in_unit);

  for (const id of studentIds) {
    const book = books.get(id);
    const grades = book?.grades ?? new Map<string, TopicGrades>();
    const statuses = book?.statuses ?? new Map<string, TopicStatus>();
    const assigned = assignedByStudent.get(id) ?? new Set<string>();
    const user = directory.get(id);

    students.push({
      student_id: id,
      name: user?.name ?? "",
      initials: initialsFrom(user?.name ?? ""),
      // THE LETTER IS OVER THIS STUDENT'S OWN ELIGIBLE SET, not over the grid's
      // columns. A topic another student was set does not enter this student's
      // denominator, and the difference matters the moment a teacher assigns
      // different work to different groups.
      letter: serializeLetter(rollupLetter(grades, eligibleTopics(assigned, grades))),
      // A cell for every column, so the grid is rectangular and a student who
      // has done nothing still occupies a row rather than coming back short.
      cells: columns.map((topic) => {
        const k = topicKey(topic.course_id, topic.topic_id);
        return cellFor(topic, grades.get(k), statuses.get(k));
      }),
    });
  }

  // Sorted by name, so the grid does not reorder itself between refreshes on
  // whatever order Postgres returned the enrolments in.
  students.sort((a, b) => a.name.localeCompare(b.name));

  const body: ClassResponse = {
    class_id: classId,
    topics: columns.map(column),
    students,
  };
  return NextResponse.json(body);
}
