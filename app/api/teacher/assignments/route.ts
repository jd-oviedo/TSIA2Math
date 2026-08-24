import { NextResponse } from "next/server";
import { profileGrants, requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";
import {
  activeStudentIds,
  requireClassOwnership,
} from "../../../lib/teacher-scope";
import {
  getTopics,
  getTopicStatuses,
  isAssignableTopic,
  topicKey,
} from "../../../lib/curriculum-progress";
import {
  assignmentCreateSchema,
  assignmentDeleteSchema,
  formatZodError,
} from "../../../lib/schemas";

// /api/teacher/assignments
//
// Whole-topic work a teacher sets for their own class: POST creates, GET lists
// with live tracking, DELETE removes. Build 4a. The student-facing surface is
// Build 4b and nothing here serves it.
//
// THE FIRST WRITE IN THIS ARC, and the reason the order of the handler below is
// fixed rather than a matter of taste. Builds 1-3 were reads, where the worst
// failure is showing a teacher something that is not theirs. A write can put a
// row in another teacher's class, or name a student who is not in the class at
// all, and neither is undone by refusing the response afterwards.
//
// TWO GATES, NOT ONE, in the order established at
// app/api/teacher/official-scores/route.ts:26-35. requireTeacher() answers "is
// this an entitled teacher"; profileGrants(..., 'assignments') answers "does
// their plan include this feature". Both tiers hold it -- Core by default, the
// rule stated in app/lib/capabilities.ts -- so the second gate refuses nobody
// today and is still load-bearing, because it is what a future plan without it
// would be refused by.
//
// THE TENANCY BOUNDARY IS requireClassOwnership() IN THIS HANDLER. Every query
// below runs on the service-role client, which bypasses RLS: the policies in
// sql/assignments.sql A7-A8 protect the tables from a direct PostgREST read with
// a token, and they do not defend these handlers at all. See
// app/lib/teacher-scope.ts:5-11.
//
// ─── COMPLETION IS COMPUTED, NEVER STORED ────────────────────────────────────
//
// There is no status column on an assignment and there must not be one. Whether
// a student has finished an assigned topic is read out of getTopicStatuses --
// the same live A1 computation the progress surface uses -- filtered to the one
// topic the assignment names. A stored flag would be a second answer to a
// question that already has one, and the two would disagree the first time a
// student went back and finished a topic after the flag was written.
//
// ─── NO SCORES ON THE WIRE ───────────────────────────────────────────────────
//
// TopicStatus carries correct, total, practiceCorrect, quizCorrect, the gate
// thresholds and completedAt. NONE of them are serialized. The response is built
// field by field below rather than by spreading a TopicStatus and deleting what
// should not go out: a spread ships every field the type gains in future by
// default, and the default has to be that nothing new reaches the teacher
// surface without somebody deciding it should. Same discipline, same reason, as
// app/api/teacher/curriculum-progress/route.ts:119-123.

type Admin = ReturnType<typeof createAdminClient>;

/** The table has not been migrated yet. Same two codes every other route uses. */
function isMissingTable(code: string | undefined): boolean {
  return code === "42P01" || code === "PGRST205";
}

/** Postgres unique_violation. The A4 partial index is what raises it here. */
const UNIQUE_VIOLATION = "23505";

type AssignmentRow = {
  id: string;
  class_id: string;
  course_id: string;
  topic_id: string;
  target_type: "student" | "class";
  due_at: string | null;
  created_by: string;
  created_at: string;
};

const ROW_COLUMNS =
  "id, class_id, course_id, topic_id, target_type, due_at, created_by, created_at";

/**
 * The entitlement half: an entitled teacher on a plan holding the feature.
 *
 * Says nothing about WHICH class. Split out from the tenancy check for the
 * reason official-scores gives at length: an unentitled caller must not be able
 * to make the server run a query, and a handler that addresses a row by id
 * cannot know which class it concerns until it has read that row.
 */
async function requireEntitled(): Promise<
  { error: Response } | { profile: { id: string }; admin: Admin }
> {
  const profile = await requireTeacher();
  if (!profile) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  if (!profileGrants(profile, "assignments", "teacher/assignments")) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { profile, admin: createAdminClient() };
}

// ─── The target resolver ─────────────────────────────────────────────────────

/**
 * Who an assignment is actually for, right now.
 *
 * ONE FUNCTION FOR BOTH SHAPES, so the tracker cannot resolve a class-target one
 * way in the list and another way in a detail view.
 *
 *   'class'    -> the active roster, live. Nothing stored is consulted. A
 *                 student who enrolled after the assignment was created is
 *                 included, which is correct: the teacher assigned the class,
 *                 not a snapshot of it.
 *
 *   'student'  -> the stored ids INTERSECTED with the active roster. This is
 *                 what makes a removed student drop out, consistent with every
 *                 other teacher surface (app/lib/teacher-scope.ts:63-87).
 *
 * THE ZERO CASE IS THE DANGEROUS ONE AND IT IS HANDLED EXPLICITLY. A 'student'
 * assignment whose rows are gone -- a half-failed write, a manual delete, every
 * named student removed from the class -- resolves to an EMPTY array and must
 * never fall back to the roster. That fallback is the single failure mode that
 * turns one student's work into the whole class's, silently, and it is what
 * check W9 in scripts/faultproof_assignments.mjs exists to catch. The code that
 * would cause it is a `|| activeIds` on the line below; there is none, and there
 * must never be one.
 */
function resolveTargets(
  row: AssignmentRow,
  storedIds: string[],
  activeIds: string[]
): string[] {
  if (row.target_type === "class") return activeIds;
  const active = new Set(activeIds);
  return storedIds.filter((id) => active.has(id));
}

// ─── POST ────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // a. The body has to be JSON before anything can be said about it.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // b. Shape. The discriminated union means a class-target body carrying
  //    student_ids does not parse at all -- see app/lib/schemas.ts.
  const parsed = assignmentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const input = parsed.data;

  // c. Entitlement, BOTH halves, before any read.
  const entitled = await requireEntitled();
  if ("error" in entitled) return entitled.error;
  const { profile, admin } = entitled;

  // d. THE TENANT BOUNDARY. 404 rather than 403: a class this teacher does not
  //    own is a class that does not exist as far as they are concerned. A 403
  //    would confirm the id is real.
  const cls = await requireClassOwnership(admin, profile.id, input.class_id);
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // e. The topic is real AND is not a placeholder. Both answers are the same
  //    400: the route does not tell a caller which topic ids exist.
  if (!(await isAssignableTopic(input.course_id, input.topic_id))) {
    return NextResponse.json(
      { error: "That topic can't be assigned yet." },
      { status: 400 }
    );
  }

  // f. THE WRITE TENANT VECTOR.
  //
  //    Owning the class is not enough. Without this, any student id in the
  //    product paired with a class the teacher happens to own would be written
  //    into assignment_students -- which would then put that student on a
  //    teacher's tracker and, in Build 4b, put another teacher's work in front
  //    of them.
  //
  //    ONE query for the whole roster, not one per id: a subset of 30 students
  //    would otherwise cost 30 round trips to answer a question one .in() read
  //    already answers.
  //
  //    THE WHOLE REQUEST IS REFUSED, never partially applied and never silently
  //    narrowed. A teacher who selects five students and is quietly given three
  //    believes five students have the work. The rejected ids are named back
  //    because they are ids the caller just sent -- this tells them nothing they
  //    did not already know, and it is what lets the UI say which selection was
  //    stale rather than "something was wrong".
  let studentIds: string[] = [];
  if (input.target_type === "student") {
    let active: string[];
    try {
      active = await activeStudentIds(admin, input.class_id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[teacher/assignments] roster read failed:", message);
      return NextResponse.json({ error: "Could not read the class roster." }, { status: 500 });
    }

    const activeSet = new Set(active);
    const rejected = input.student_ids.filter((id) => !activeSet.has(id));
    if (rejected.length > 0) {
      return NextResponse.json(
        { error: "One or more students not in this class", rejected },
        { status: 404 }
      );
    }
    studentIds = input.student_ids;
  }

  // g. The parent, then the children.
  const { data: created, error: insertError } = await admin
    .from("assignments")
    .insert({
      class_id: input.class_id,
      course_id: input.course_id,
      topic_id: input.topic_id,
      target_type: input.target_type,
      due_at: input.due_at,
      // SERVER-SET, NEVER FROM THE BODY. The schema does not accept this key at
      // all; a request that could name its own author could sign an assignment
      // as another teacher.
      created_by: profile.id,
    })
    .select(ROW_COLUMNS)
    .single();

  if (insertError || !created) {
    // h. The A4 partial unique index: one live class-target per topic per class.
    //    409 carrying the existing id, so the UI can offer "change the due date"
    //    instead of showing a database error. Same treatment of 23505 as
    //    app/api/teacher/classes/route.ts:78-81.
    if (insertError?.code === UNIQUE_VIOLATION) {
      const { data: existing } = await admin
        .from("assignments")
        .select("id")
        .eq("class_id", input.class_id)
        .eq("course_id", input.course_id)
        .eq("topic_id", input.topic_id)
        .eq("target_type", "class")
        .maybeSingle();
      return NextResponse.json(
        {
          error: "That topic is already assigned to this class.",
          existing_id: existing?.id ?? null,
        },
        { status: 409 }
      );
    }
    if (isMissingTable(insertError?.code)) {
      return NextResponse.json(
        { error: "Assignments are not set up yet." },
        { status: 503 }
      );
    }
    console.error("[teacher/assignments] insert failed:", insertError?.message);
    return NextResponse.json({ error: "Could not save the assignment." }, { status: 500 });
  }

  const row = created as AssignmentRow;

  if (studentIds.length > 0) {
    const { error: childError } = await admin
      .from("assignment_students")
      .insert(studentIds.map((id) => ({ assignment_id: row.id, student_id: id })));

    if (childError) {
      // THE COMPENSATING DELETE. PostgREST gives no transaction across two
      // inserts, so the failure to defend against is a parent row with no
      // children: a 'student' assignment that targets NOBODY, sitting in a
      // teacher's list looking like work that was set.
      //
      // Deleting the parent is what makes the write all-or-nothing from the
      // teacher's side. It is best-effort by necessity -- if this delete also
      // fails there is nothing further to try -- and it is logged loudly,
      // because the orphan it leaves behind is the exact row a teacher would
      // report as "I assigned this and nobody has it".
      //
      // The reader is defended independently: resolveTargets() returns an empty
      // array for a childless 'student' assignment and never falls back to the
      // roster, so even the orphan cannot leak to the whole class.
      const { error: cleanupError } = await admin
        .from("assignments")
        .delete()
        .eq("id", row.id);

      console.error(
        "[teacher/assignments] student rows failed, parent rolled back:",
        childError.message,
        cleanupError ? `CLEANUP ALSO FAILED, orphan ${row.id}: ${cleanupError.message}` : ""
      );
      return NextResponse.json(
        { error: "Could not save the assignment." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    {
      assignment: {
        id: row.id,
        class_id: row.class_id,
        course_id: row.course_id,
        topic_id: row.topic_id,
        target_type: row.target_type,
        due_at: row.due_at,
        created_at: row.created_at,
        target_count: row.target_type === "class" ? null : studentIds.length,
      },
    },
    { status: 201 }
  );
}

// ─── GET ─────────────────────────────────────────────────────────────────────

/** One assignment, as the tracker renders it. Status counts, never scores. */
type AssignmentTracking = {
  id: string;
  course_id: string;
  topic_id: string;
  topic_name: string;
  unit_number: number;
  target_type: "student" | "class";
  due_at: string | null;
  created_at: string;
  /** Who it resolves to right now. Live, not stored. */
  target_count: number;
  complete: number;
  in_progress: number;
  not_started: number;
};

export async function GET(req: Request) {
  const entitled = await requireEntitled();
  if ("error" in entitled) return entitled.error;
  const { profile, admin } = entitled;

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("class_id");
  if (!classId) {
    return NextResponse.json({ error: "class_id is required" }, { status: 400 });
  }

  const cls = await requireClassOwnership(admin, profile.id, classId);
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const { data, error } = await admin
    .from("assignments")
    .select(ROW_COLUMNS)
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  if (error) {
    // The tables are created by hand. An empty list is the honest answer for a
    // teacher who has set nothing, and a 500 here would take the dashboard down
    // on a pre-migration deploy. Same branch as the worksheets index and the
    // official-score history.
    if (isMissingTable(error.code)) {
      return NextResponse.json({ assignments: [], stored: false });
    }
    console.error("[teacher/assignments] list failed:", error.message);
    return NextResponse.json({ error: "Failed to load assignments" }, { status: 500 });
  }

  const rows = (data ?? []) as AssignmentRow[];
  if (rows.length === 0) {
    return NextResponse.json({ assignments: [], stored: true });
  }

  // The stored targets for every student-target assignment on the page, in ONE
  // read rather than one per assignment.
  const studentTargetIds = rows.filter((r) => r.target_type === "student").map((r) => r.id);
  const storedByAssignment = new Map<string, string[]>();
  if (studentTargetIds.length > 0) {
    const { data: links, error: linkError } = await admin
      .from("assignment_students")
      .select("assignment_id, student_id")
      .in("assignment_id", studentTargetIds);

    if (linkError) {
      console.error("[teacher/assignments] targets read failed:", linkError.message);
      return NextResponse.json({ error: "Failed to load assignments" }, { status: 500 });
    }
    for (const link of links ?? []) {
      const list = storedByAssignment.get(link.assignment_id as string) ?? [];
      list.push(link.student_id as string);
      storedByAssignment.set(link.assignment_id as string, list);
    }
  }

  // The active roster, once, for the whole page. Both target shapes need it:
  // 'class' IS it, and 'student' is filtered through it.
  let activeIds: string[];
  try {
    activeIds = await activeStudentIds(admin, classId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const resolved = new Map<string, string[]>();
  for (const row of rows) {
    resolved.set(row.id, resolveTargets(row, storedByAssignment.get(row.id) ?? [], activeIds));
  }

  // ONE getTopicStatuses over the union of every targeted student on the page.
  // The array signature exists for exactly this: N students cost the same two
  // round trips as one (app/lib/curriculum-progress.ts:492-505). Calling it per
  // assignment would multiply that by the length of the list.
  const union = [...new Set([...resolved.values()].flat())];
  const statusesByStudent = union.length > 0 ? await getTopicStatuses(union) : new Map();

  // Topic names for the list, off the same cached course read every other
  // surface uses. A topic that is not in this map is one that has become a
  // placeholder since it was assigned; it keeps its id and loses its name,
  // rather than disappearing from a teacher's list without explanation.
  const { topics } = await getTopics();
  const topicsByKey = new Map(topics.map((t) => [topicKey(t.course_id, t.topic_id), t]));

  const assignments: AssignmentTracking[] = rows.map((row) => {
    const key = topicKey(row.course_id, row.topic_id);
    const topic = topicsByKey.get(key);
    const targets = resolved.get(row.id) ?? [];

    let complete = 0;
    let inProgress = 0;
    let notStarted = 0;
    for (const studentId of targets) {
      // `?? 'not_started'` covers a student with no attempt rows at all, which
      // is the state most of a fresh assignment is in.
      const status = statusesByStudent.get(studentId)?.get(key)?.status ?? "not_started";
      if (status === "complete") complete += 1;
      else if (status === "in_progress") inProgress += 1;
      else notStarted += 1;
    }

    // Built field by field. See the header: never a spread of TopicStatus.
    return {
      id: row.id,
      course_id: row.course_id,
      topic_id: row.topic_id,
      topic_name: topic?.topic_name ?? row.topic_id,
      unit_number: topic?.unit_number ?? 0,
      target_type: row.target_type,
      // Raw. Overdue is derived at render from this against the clock, never
      // stored and never precomputed here -- a boolean computed on the server
      // is wrong the moment it is cached.
      due_at: row.due_at,
      created_at: row.created_at,
      target_count: targets.length,
      complete,
      in_progress: inProgress,
      not_started: notStarted,
    };
  });

  return NextResponse.json({ assignments, stored: true });
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function DELETE(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = assignmentDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  // Entitlement first, then the row, then ownership -- the order PATCH and
  // DELETE on official-scores establish. An unentitled caller must not be able
  // to make the server look a row up.
  const entitled = await requireEntitled();
  if ("error" in entitled) return entitled.error;
  const { profile, admin } = entitled;

  const { data: existing, error: readError } = await admin
    .from("assignments")
    .select("id, class_id")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (readError && !isMissingTable(readError.code)) {
    console.error("[teacher/assignments] delete lookup failed:", readError.message);
    return NextResponse.json({ error: "Could not remove the assignment." }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  // The same 404, whether the row belongs to another teacher or does not exist.
  // Ownership is read off the assignment's OWN class_id rather than taken from
  // the request: a caller that supplied the class would be choosing which class
  // their authority is checked against.
  const cls = await requireClassOwnership(admin, profile.id, existing.class_id as string);
  if (!cls) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  // assignment_students goes with it: the FK is ON DELETE CASCADE, so the
  // children are removed by the database rather than by a second statement here
  // that could half-run.
  const { error: deleteError } = await admin
    .from("assignments")
    .delete()
    .eq("id", parsed.data.id);

  if (deleteError) {
    console.error("[teacher/assignments] delete failed:", deleteError.message);
    return NextResponse.json({ error: "Could not remove the assignment." }, { status: 500 });
  }

  return NextResponse.json({ deleted: parsed.data.id });
}
