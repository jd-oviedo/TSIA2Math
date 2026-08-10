import { NextResponse } from "next/server";
import { requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";

// Records that a teacher has finished or skipped the onboarding tour.
//
// One-way on purpose: there is no route to un-set the flag. Re-running the tour
// is a support action, not something a stray request should be able to trigger,
// and the column is a single update away in the SQL editor.
//
// Returns 200 with { stored: false } rather than an error when the column is
// missing, so the client can fall back to localStorage without treating a
// pre-migration deployment as a failure. See sql/teacher_tour_flag.sql.
export async function POST() {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ teacher_tour_done: true })
    .eq("id", profile.id);

  if (error) {
    // 42703 is undefined_column. PostgREST reports an unknown column as
    // PGRST204 when it is absent from the schema cache. Either means the
    // migration has not run yet, which is expected and not an error.
    if (error.code === "42703" || error.code === "PGRST204") {
      return NextResponse.json({ stored: false, reason: "no_column" });
    }
    console.error("[teacher/tour] could not record dismissal:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stored: true });
}
