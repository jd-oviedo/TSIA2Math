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
  buildAggregateRow,
  CORRECTION_WINDOW_MS,
  DELTA_LABEL,
  hasPassingScoreWithLevels,
  isCorrectable,
  latestPracticeBefore,
  type AggregateRow,
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
 * The entitlement half: is this an entitled teacher on a plan holding the
 * feature? Says nothing about WHICH student or class.
 *
 * SPLIT OUT FROM THE TENANCY CHECK, and the split is load-bearing rather than
 * tidiness. PATCH and DELETE address a row by id and cannot know which student
 * or class the request concerns until they have READ that row, so they cannot
 * run a combined gate first. When the two were one function this ran second,
 * and the consequences were both real:
 *
 *   1. AN UNAUTHENTICATED CALLER COULD MAKE THE SERVER QUERY official_scores.
 *      Nothing came back to them, but the query ran.
 *   2. AN EXISTENCE ORACLE. A row id that existed produced 403 (from the gate,
 *      after the read) and one that did not produced 404 (from the read). The
 *      difference told an unentitled caller whether an id was real. The roster
 *      export route already refuses to leak exactly this, in those words, about
 *      class ids.
 *
 *   Neither was an authorisation bypass -- no row was ever returned or written
 *   to an unentitled caller -- but both are fixed by ordering, which costs
 *   nothing. Found by the write matrix in verify_official_scores_gate.mjs
 *   section 5, which is why that section asserts a student's PATCH and DELETE
 *   are 403 rather than merely "not 200".
 */
async function requireEntitled(): Promise<
  { error: Response } | { profile: { id: string }; admin: Admin }
> {
  const profile = await requireTeacher();
  if (!profile) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  if (!profileGrants(profile, "official-scores", "official-scores")) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { profile, admin: createAdminClient() };
}

/**
 * The tenancy half: does this teacher own the class, and is this student in it?
 *
 * The admin client bypasses RLS, so official_scores_select_own_class does not
 * defend these handlers: this is the entire tenancy boundary for them.
 */
async function requireTenancy(
  admin: Admin,
  teacherId: string,
  studentId: string,
  classId: string
): Promise<Response | null> {
  const { data: cls } = await admin
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", teacherId)
    .maybeSingle();
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
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
    return NextResponse.json({ error: "Student not found in this class" }, { status: 404 });
  }

  return null;
}

/**
 * Both halves, in order, for the two verbs that know their student and class up
 * front. PATCH and DELETE cannot use this: they have to read the row between
 * the halves.
 */
async function gate(
  studentId: string,
  classId: string
): Promise<{ error: Response } | { profile: { id: string }; admin: Admin }> {
  const entitled = await requireEntitled();
  if ("error" in entitled) return entitled;

  const denied = await requireTenancy(entitled.admin, entitled.profile.id, studentId, classId);
  if (denied) return { error: denied };

  return entitled;
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

  // AFTER the official row is stored, never before, and never allowed to fail
  // the request. See the aggregate section above.
  await insertAggregate(admin, await aggregateFor(admin, data as OfficialRow));

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

  // ENTITLEMENT FIRST, then the row, then tenancy. An unentitled caller must
  // not reach loadRow at all: see the note on requireEntitled().
  const entitled = await requireEntitled();
  if ("error" in entitled) return entitled.error;
  const { profile, admin } = entitled;

  const existing = await loadRow(admin, input.id);
  if ("error" in existing) return existing.error;

  const outOfScope = await requireTenancy(
    admin,
    profile.id,
    existing.row.student_id,
    existing.row.class_id
  );
  if (outOfScope) return outOfScope;

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

  // The multiset swap. The OLD content is computed from the row as it was read
  // before the update, which is why loadRow selects every column rather than
  // just the four the window check needs.
  await removeOneAggregate(admin, await aggregateFor(admin, existing.row));
  await insertAggregate(admin, await aggregateFor(admin, data as OfficialRow));

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

  // Same order as PATCH, and for the same reason.
  const entitled = await requireEntitled();
  if ("error" in entitled) return entitled.error;
  const { profile, admin } = entitled;

  const existing = await loadRow(admin, parsed.data.id);
  if ("error" in existing) return existing.error;

  const outOfScope = await requireTenancy(
    admin,
    profile.id,
    existing.row.student_id,
    existing.row.class_id
  );
  if (outOfScope) return outOfScope;

  const denied = refuseIfNotCorrectable(existing.row, profile.id);
  if (denied) return denied;

  const { error } = await admin.from("official_scores").delete().eq("id", parsed.data.id);
  if (error) {
    console.error("[teacher/official-scores] delete failed:", error.message);
    return NextResponse.json({ error: "Could not remove the official score." }, { status: 500 });
  }

  // A removed entry must stop counting as a sitting. Without this a mistaken
  // entry, deleted a minute later, inflates the programme dashboard forever.
  await removeOneAggregate(admin, await aggregateFor(admin, existing.row));

  return NextResponse.json({ deleted: parsed.data.id });
}

// ─── The de-identified aggregate ─────────────────────────────────────────────
//
// Every write to official_scores keeps public.official_score_aggregate in step.
// Section 5 of sql/official_scores.sql is the argument for what that table is;
// this is the argument for how it is maintained.
//
// THE HARD PART IS CORRECTION, AND IT IS HARD BY DESIGN. The aggregate carries
// no student id, no class id and no reference back to the official_scores row
// it came from -- that absence IS the unjoinability property, at points 1 and 5
// of section 5. So when a teacher corrects an entry inside the 24-hour window,
// there is by construction no way to look up "that row's aggregate row" and
// update it. Adding a column to make that possible would trade the security
// property for an implementation convenience.
//
// SO THE AGGREGATE IS TREATED AS A MULTISET, WHICH IS ALL IT EVER IS. Its rows
// are de-identified and therefore interchangeable: two sittings that produced
// the same score, band, months and levels are literally the same row twice, and
// nothing downstream can or should tell them apart. To correct an entry we
// delete ONE row matching the old content and insert one matching the new. It
// does not matter whether the row deleted is "the" row that entry wrote -- if it
// is a different student's identical row, the resulting multiset is the same
// one either way, which is the only thing a programme-level count reads.
//
// REJECTED: writing a second aggregate row on correction and leaving the first.
// A 24-hour typo fix would permanently inflate every sitting count.
//
// REJECTED: skipping the aggregate on correction and delete. That is the
// version that looks simplest and is wrong in the direction that matters: a
// score entered as 1945 and fixed to 945 a minute later would leave the
// dashboard holding a value the CHECK would not even have accepted, and a
// deleted mistaken entry would count as a sitting forever.
//
// BEST EFFORT, ALWAYS, and never in the teacher's way. By the time any of this
// runs the official score itself is already written and correct. Losing an
// aggregate row degrades a programme dashboard; failing the request loses a
// teacher's transcription work with the paper report still in their hand. Same
// posture, and the same reasoning, as logExport() in teacher-export.ts. Every
// failure is logged so it is visible rather than silent.
//
// A MISSING TABLE IS NOT AN ERROR HERE either. Section 5 is run by hand and may
// not have been run yet on a given deploy; official_scores existing without its
// aggregate is a real intermediate state, and the entry surface must keep
// working through it.

const AGGREGATE_TABLE = "official_score_aggregate";

/**
 * The practice score a sitting is measured against, for banding only.
 *
 * Same selection rule as the GET handler and the history panel, through the
 * same latestPracticeBefore(), so the band in the aggregate cannot disagree
 * with the delta a teacher was looking at when they saved. Only the BAND
 * survives into the aggregate row; the number is destroyed there.
 */
async function practiceScoreFor(
  admin: Admin,
  studentId: string,
  testDate: string
): Promise<number | null> {
  const { data } = await admin
    .from("sessions")
    .select("final_score, created_at, completed_at")
    .eq("user_id", studentId)
    .order("created_at", { ascending: false });

  return latestPracticeBefore(data ?? [], testDate)?.final_score ?? null;
}

/** Build the aggregate row for one official_scores row. */
async function aggregateFor(admin: Admin, row: OfficialRow): Promise<AggregateRow | null> {
  return buildAggregateRow({
    officialScore: row.official_crc_score,
    testDate: row.test_date,
    // The month the entry was RECORDED, which is created_at and stays created_at
    // through a correction. corrected_at would move a January sitting's
    // recorded_month into February for the one row that got fixed.
    recordedAt: row.created_at,
    practiceScore: await practiceScoreFor(admin, row.student_id, row.test_date),
    levels: {
      level_qr: row.level_qr,
      level_ar: row.level_ar,
      level_gr: row.level_gr,
      level_pr: row.level_pr,
    },
  });
}

/** Add one row. Best effort. */
async function insertAggregate(admin: Admin, agg: AggregateRow | null): Promise<void> {
  if (!agg) {
    console.error("[teacher/official-scores] aggregate skipped: uncoarsenable date");
    return;
  }
  try {
    const { error } = await admin.from(AGGREGATE_TABLE).insert(agg);
    if (error && !isMissingTable(error.code)) {
      console.error("[teacher/official-scores] aggregate insert failed:", error.message);
    }
  } catch (err) {
    console.error(
      "[teacher/official-scores] aggregate insert threw:",
      err instanceof Error ? err.message : err
    );
  }
}

/**
 * Remove ONE row matching this content. Best effort.
 *
 * Two queries rather than a filtered delete, because a filtered delete has no
 * LIMIT and would remove every identical row -- including other students'. The
 * select names exactly one id and the delete targets it.
 *
 * Nulls are matched with .is(), not .eq(): a passing student's four null levels
 * are the normal complete state, and `level_qr=eq.null` matches nothing in
 * PostgREST, so the whole row would fail to match and be left behind.
 */
async function removeOneAggregate(admin: Admin, agg: AggregateRow | null): Promise<void> {
  if (!agg) return;
  try {
    // practice_estimate_band is nullable in the table but never null here:
    // practiceEstimateBand() returns 'no_estimate' for a student who never
    // practised, which is a value and not an absence. So it is matched with
    // .eq() like the other three non-null columns.
    let q = admin
      .from(AGGREGATE_TABLE)
      .select("id")
      .eq("official_crc_score", agg.official_crc_score)
      .eq("test_month", agg.test_month)
      .eq("recorded_month", agg.recorded_month)
      .eq("practice_estimate_band", agg.practice_estimate_band);

    for (const k of ["level_qr", "level_ar", "level_gr", "level_pr"] as const) {
      const v = agg[k];
      q = v === null ? q.is(k, null) : q.eq(k, v);
    }

    const { data, error } = await q.limit(1).maybeSingle();
    if (error) {
      if (!isMissingTable(error.code)) {
        console.error("[teacher/official-scores] aggregate lookup failed:", error.message);
      }
      return;
    }
    if (!data) {
      // Nothing to remove. Reached when section 5 was run after this entry was
      // made, so the aggregate genuinely never held a row for it. Not an error.
      return;
    }

    const { error: delErr } = await admin.from(AGGREGATE_TABLE).delete().eq("id", data.id);
    if (delErr) {
      console.error("[teacher/official-scores] aggregate delete failed:", delErr.message);
    }
  } catch (err) {
    console.error(
      "[teacher/official-scores] aggregate removal threw:",
      err instanceof Error ? err.message : err
    );
  }
}

// ─── Shared write helpers ────────────────────────────────────────────────────

/**
 * Load the row a write names, before deciding anything about it.
 *
 * The ROW is what says which student and class the request is really about, so
 * it is read BEFORE the tenancy gate rather than after. Trusting a student_id
 * sent alongside the id would let a teacher name their own class and somebody
 * else's row, and the gate would pass.
 *
 * EVERY COLUMN, not just the four the window check reads. A correction has to
 * remove the aggregate row matching the entry's OLD content, and after the
 * update that content no longer exists anywhere. Selecting narrowly here would
 * make the aggregate silently un-correctable.
 */
async function loadRow(
  admin: Admin,
  id: string
): Promise<{ row: OfficialRow } | { error: Response }> {
  const { data, error } = await admin
    .from("official_scores")
    .select(ROW_COLUMNS)
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
  return { row: data as unknown as OfficialRow };
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
function refuseIfNotCorrectable(row: OfficialRow, teacherId: string): Response | null {
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
