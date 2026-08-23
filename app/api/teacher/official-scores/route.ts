import { NextResponse } from "next/server";
import { profileGrants, requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";
import {
  formatZodError,
  officialScoreCorrectSchema,
  officialScoreCreateSchema,
  officialScoreDeleteSchema,
} from "../../../lib/schemas";
import {
  CORRECTION_WINDOW_MS,
  DELTA_LABEL,
  hasPassingScoreWithLevels,
  isCorrectable,
  latestPracticeBefore,
  type OfficialLevel,
} from "../../../lib/official-scores";

// /api/teacher/official-scores
//
// A student's official TSIA2A results: the history panel reads GET, the entry
// form writes POST, and the correction handle uses PATCH and DELETE.
//
// TWO GATES, NOT ONE, and the same order the export routes use. requireTeacher()
// answers "is this an entitled teacher" by asking for 'teacher-dashboard', which
// Core and Pro both hold. profileGrants(..., 'official-scores') answers "does
// their plan include this feature". They are separate because capabilities.ts
// holds them separately and a future plan could carry one without the other.
//
// UNLIKE THE EXPORTS, THIS IS CORE. /api/teacher/export/* gates on
// 'class-data-export', which is Pro only. Recording and reading a student's
// official score is Core; getting a CSV of the whole class out is Pro. Do not
// copy the gate from an export route into this one.

type OfficialRow = {
  id: string;
  student_id: string;
  class_id: string;
  official_crc_score: number;
  test_date: string;
  level_qr: OfficialLevel | null;
  level_ar: OfficialLevel | null;
  level_gr: OfficialLevel | null;
  level_pr: OfficialLevel | null;
  entered_by: string;
  created_at: string;
  corrected_at: string | null;
  entered_despite_warning: boolean;
};

const ROW_COLUMNS =
  "id, student_id, class_id, official_crc_score, test_date, level_qr, level_ar, level_gr, level_pr, entered_by, created_at, corrected_at, entered_despite_warning";

/** The table has not been migrated yet. Same two codes the worksheets index uses. */
function isMissingTable(code: string | undefined): boolean {
  return code === "42P01" || code === "PGRST205";
}

type Admin = ReturnType<typeof createAdminClient>;

/**
 * Both gates, plus the class-and-enrolment tenancy check.
 *
 * The admin client bypasses RLS, so official_scores_select_own_class does not
 * defend these handlers: this is the entire tenancy boundary for them.
 *
 * Returns either an error Response to send back, or the profile and an admin
 * client. Every handler runs it; a shared helper is tidier than four copies and
 * the call is still explicit at the top of each verb.
 */
async function gate(
  studentId: string,
  classId: string
): Promise<{ error: Response } | { profile: { id: string }; admin: Admin }> {
  const profile = await requireTeacher();
  if (!profile) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  if (!profileGrants(profile, "official-scores", "official-scores")) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const admin = createAdminClient();

  const { data: cls } = await admin
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!cls) {
    return { error: NextResponse.json({ error: "Class not found" }, { status: 404 }) };
  }

  // Enrolment as well as ownership. The class check alone would admit any
  // student id paired with a class the teacher happens to own.
  const { data: enrollment } = await admin
    .from("class_enrollments")
    .select("student_id")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .maybeSingle();
  if (!enrollment) {
    return {
      error: NextResponse.json({ error: "Student not found in this class" }, { status: 404 }),
    };
  }

  return { profile, admin };
}

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("student_id");
  const classId = searchParams.get("class_id");
  if (!studentId || !classId) {
    return NextResponse.json(
      { error: "student_id and class_id are required" },
      { status: 400 }
    );
  }

  const g = await gate(studentId, classId);
  if ("error" in g) return g.error;
  const { profile, admin } = g;

  const { data, error } = await admin
    .from("official_scores")
    .select(ROW_COLUMNS)
    .eq("student_id", studentId)
    .eq("class_id", classId)
    .order("test_date", { ascending: false });

  if (error) {
    // The table may not exist yet: sql/official_scores.sql is run by hand. An
    // empty history is the honest answer for a student with no official result,
    // and a 500 here would take the student detail page down on a pre-migration
    // deploy. Same branch, same two codes, as the worksheets index.
    if (isMissingTable(error.code)) {
      return NextResponse.json({ scores: [], stored: false, delta_label: DELTA_LABEL });
    }
    console.error("[teacher/official-scores] list failed:", error.message);
    return NextResponse.json({ error: "Failed to load official scores" }, { status: 500 });
  }

  const rows = (data ?? []) as OfficialRow[];

  // Every run this student has, newest first BY created_at. Fetched once for the
  // whole response rather than per row: a student with four official sittings
  // would otherwise cost four identical queries.
  //
  // completed_at is selected so it can be used as a "did this finish" flag, and
  // it is never sorted on. Production holds rows where completed_at precedes
  // created_at, which is why teacher-export.ts sums elapsed_ms rather than
  // subtracting timestamps.
  const { data: sessions } = await admin
    .from("sessions")
    .select("final_score, created_at, completed_at")
    .eq("user_id", studentId)
    .order("created_at", { ascending: false });

  const newestFirst = sessions ?? [];
  const now = Date.now();

  return NextResponse.json({
    scores: rows.map((row) => {
      const practice = latestPracticeBefore(newestFirst, row.test_date);
      return {
        id: row.id,
        official_crc_score: row.official_crc_score,
        test_date: row.test_date,
        level_qr: row.level_qr,
        level_ar: row.level_ar,
        level_gr: row.level_gr,
        level_pr: row.level_pr,
        created_at: row.created_at,
        corrected_at: row.corrected_at,
        entered_despite_warning: row.entered_despite_warning,
        // Null when the student had never completed a run before the test. A
        // real state: the panel says so in words rather than showing a 0, which
        // would read as "no change".
        practice_estimate: practice?.final_score ?? null,
        practice_taken_at: practice?.created_at ?? null,
        delta:
          practice?.final_score == null
            ? null
            : row.official_crc_score - practice.final_score,
        // Derived, never stored, so changing the window is a code change and not
        // a backfill. Only the entering teacher may correct: the affirmation
        // names one person and a co-teacher did not sign it.
        correctable: row.entered_by === profile.id && isCorrectable(row.created_at, now),
      };
    }),
    stored: true,
    correction_window_ms: CORRECTION_WINDOW_MS,
    delta_label: DELTA_LABEL,
  });
}

// ─── POST ────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = officialScoreCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const input = parsed.data;

  const g = await gate(input.student_id, input.class_id);
  if ("error" in g) return g.error;
  const { profile, admin } = g;

  const levels = [input.level_qr, input.level_ar, input.level_gr, input.level_pr];

  const { data, error } = await admin
    .from("official_scores")
    .insert({
      student_id: input.student_id,
      class_id: input.class_id,
      entered_by: profile.id,
      official_crc_score: input.official_crc_score,
      test_date: input.test_date,
      level_qr: input.level_qr,
      level_ar: input.level_ar,
      level_gr: input.level_gr,
      level_pr: input.level_pr,
      affirmed_official_report: input.affirmed_official_report,
      // COMPUTED HERE, NOT TAKEN FROM THE CLIENT. The form shows the warning,
      // but a request that never rendered the form must not be able to claim it
      // was not warned. Decision 8 is warn and allow: this records that the
      // condition held and refuses nothing.
      entered_despite_warning: hasPassingScoreWithLevels(input.official_crc_score, levels),
    })
    .select(ROW_COLUMNS)
    .single();

  if (error) {
    if (isMissingTable(error.code)) {
      return NextResponse.json(
        { error: "Official score storage is not set up yet." },
        { status: 503 }
      );
    }
    console.error("[teacher/official-scores] insert failed:", error.message);
    return NextResponse.json({ error: "Could not save the official score." }, { status: 500 });
  }

  return NextResponse.json({ score: data }, { status: 201 });
}

// ─── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = officialScoreCorrectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const input = parsed.data;

  const existing = await loadRow(createAdminClient(), input.id);
  if ("error" in existing) return existing.error;

  const g = await gate(existing.row.student_id, existing.row.class_id);
  if ("error" in g) return g.error;
  const { profile, admin } = g;

  const denied = refuseIfNotCorrectable(existing.row, profile.id);
  if (denied) return denied;

  const levels = [input.level_qr, input.level_ar, input.level_gr, input.level_pr];

  const { data, error } = await admin
    .from("official_scores")
    .update({
      official_crc_score: input.official_crc_score,
      test_date: input.test_date,
      level_qr: input.level_qr,
      level_ar: input.level_ar,
      level_gr: input.level_gr,
      level_pr: input.level_pr,
      entered_despite_warning: hasPassingScoreWithLevels(input.official_crc_score, levels),
      // The audit trail. Non-null is what makes a corrected row distinguishable
      // from one that was right the first time, which is why a correction
      // updates in place rather than deleting and re-inserting.
      corrected_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select(ROW_COLUMNS)
    .single();

  if (error) {
    console.error("[teacher/official-scores] update failed:", error.message);
    return NextResponse.json({ error: "Could not correct the official score." }, { status: 500 });
  }

  return NextResponse.json({ score: data });
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function DELETE(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = officialScoreDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const existing = await loadRow(createAdminClient(), parsed.data.id);
  if ("error" in existing) return existing.error;

  const g = await gate(existing.row.student_id, existing.row.class_id);
  if ("error" in g) return g.error;
  const { profile, admin } = g;

  const denied = refuseIfNotCorrectable(existing.row, profile.id);
  if (denied) return denied;

  const { error } = await admin.from("official_scores").delete().eq("id", parsed.data.id);
  if (error) {
    console.error("[teacher/official-scores] delete failed:", error.message);
    return NextResponse.json({ error: "Could not remove the official score." }, { status: 500 });
  }

  return NextResponse.json({ deleted: parsed.data.id });
}

// ─── Shared write helpers ────────────────────────────────────────────────────

type OwnRow = {
  id: string;
  student_id: string;
  class_id: string;
  entered_by: string;
  created_at: string;
};

/**
 * Load the row a write names, before deciding anything about it.
 *
 * The ROW is what says which student and class the request is really about, so
 * it is read BEFORE the tenancy gate rather than after. Trusting a student_id
 * sent alongside the id would let a teacher name their own class and somebody
 * else's row, and the gate would pass.
 */
async function loadRow(
  admin: Admin,
  id: string
): Promise<{ row: OwnRow } | { error: Response }> {
  const { data, error } = await admin
    .from("official_scores")
    .select("id, student_id, class_id, entered_by, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error && isMissingTable(error.code)) {
    return {
      error: NextResponse.json(
        { error: "Official score storage is not set up yet." },
        { status: 503 }
      ),
    };
  }
  if (error || !data) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  return { row: data as OwnRow };
}

/**
 * The correction window, enforced on the server.
 *
 * THE UI HIDING THE BUTTON IS NOT THE GATE. The history panel stops rendering
 * the handle once `correctable` goes false, and that is cosmetic: a request can
 * be sent by anything. This is where an expired correction is actually refused,
 * and the test that proves it deletes this function rather than the button.
 *
 * 409 rather than 403 for an expired window: the caller is entitled and owns the
 * row. What has run out is time, which is a state conflict and not an
 * authorisation failure, and a teacher who sees "Forbidden" on their own entry
 * will file a bug about permissions.
 */
function refuseIfNotCorrectable(row: OwnRow, teacherId: string): Response | null {
  if (row.entered_by !== teacherId) {
    return NextResponse.json(
      { error: "Only the teacher who entered this score can change it." },
      { status: 403 }
    );
  }
  if (!isCorrectable(row.created_at, Date.now())) {
    return NextResponse.json(
      { error: "This score is past its correction window and can no longer be changed." },
      { status: 409 }
    );
  }
  return null;
}
