import { NextResponse } from "next/server";
import { profileGrants, requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";
import { CORRECTION_WINDOW_MS, isCorrectable } from "../../../lib/official-scores";

// GET /api/teacher/official-scores?student_id=<uuid>&class_id=<uuid>
//
// One student's official TSIA2A results, newest sitting first, for the history
// panel on the student detail page.
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
//
// 403 rather than 404 for a failed capability check: the caller is a legitimate
// teacher and the route exists. Hiding its existence would be misleading, and
// the page already hides the panel for them, which is the cosmetic half.
//
// WRITES ARE NOT HERE YET. POST, PATCH and DELETE arrive in Phase 3 with their
// Zod schema. This file exists now so the gate can be proved before any entry
// surface is built on top of it.
export async function GET(req: Request) {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!profileGrants(profile, "official-scores", "official-scores.GET")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("student_id");
  const classId = searchParams.get("class_id");

  if (!studentId || !classId) {
    return NextResponse.json(
      { error: "student_id and class_id are required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Class ownership, before anything is read. The admin client bypasses RLS, so
  // official_scores_select_own_class does not defend this route: this check is
  // the entire tenancy boundary for it.
  const { data: cls, error: clsError } = await admin
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", profile.id)
    .maybeSingle();

  if (clsError || !cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Enrolment, so a teacher cannot read the official scores of a student who is
  // not theirs by naming a class that is. Both halves are needed: the class
  // check alone would admit any student id paired with an owned class.
  const { data: enrollment, error: enrollError } = await admin
    .from("class_enrollments")
    .select("student_id")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (enrollError || !enrollment) {
    return NextResponse.json(
      { error: "Student not found in this class" },
      { status: 404 }
    );
  }

  const { data, error } = await admin
    .from("official_scores")
    // One string literal, not a concatenation. supabase-js infers the row type
    // by parsing this argument at compile time, and a `a + b` expression defeats
    // that: the row silently degrades to GenericStringError and every field
    // access below becomes a type error.
    .select("id, official_crc_score, test_date, level_qr, level_ar, level_gr, level_pr, entered_by, created_at, corrected_at, entered_despite_warning")
    .eq("student_id", studentId)
    .eq("class_id", classId)
    .order("test_date", { ascending: false });

  if (error) {
    // The table may not exist yet: sql/official_scores.sql is run by hand in the
    // Supabase SQL editor. An empty history is the honest answer for a student
    // with no official result, and a 500 here would take the student detail page
    // down on a pre-migration deploy. Same branch, and the same two error codes,
    // as the worksheets index.
    if (error.code === "42P01" || error.code === "PGRST205") {
      return NextResponse.json({ scores: [], stored: false });
    }
    console.error("[teacher/official-scores] list failed:", error.message);
    return NextResponse.json({ error: "Failed to load official scores" }, { status: 500 });
  }

  const now = Date.now();

  return NextResponse.json({
    scores: (data ?? []).map((row) => ({
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
      // Derived here, never stored, so changing the window is a code change and
      // not a backfill. Only the entering teacher may correct, which is why the
      // row's own entered_by decides rather than the caller's ownership of the
      // class: two teachers can share a class roster, and the affirmation names
      // one of them.
      correctable:
        row.entered_by === profile.id && isCorrectable(row.created_at, now),
    })),
    stored: true,
    correction_window_ms: CORRECTION_WINDOW_MS,
  });
}
