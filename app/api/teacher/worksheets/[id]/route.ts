import { NextResponse } from "next/server";
import { requireTeacher, profileGrants } from "../../../../lib/auth";
import { createAdminClient } from "../../../../lib/supabase-admin";

// Delete one worksheet.
//
// The ownership filter is on the DELETE itself, not a read-then-delete. Checking
// ownership first and deleting second leaves a window between the two, and more
// to the point it puts the tenancy rule in application code where the next
// caller has to remember it. `.eq('teacher_id', profile.id)` cannot be forgotten
// by whoever writes the next handler, because without it the statement matches
// nothing they are looking for either.
//
// Note the admin client bypasses RLS, so worksheets_select_own does NOT protect
// this route. That is exactly why the filter is explicit.

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await requireTeacher();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!profileGrants(profile, "worksheets", "worksheets.DELETE")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("worksheets")
    .delete()
    .eq("id", id)
    .eq("teacher_id", profile.id)
    .select("id");

  if (error) {
    console.error("[teacher/worksheets] delete failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Zero rows means the worksheet does not exist OR belongs to someone else, and
  // the response is the same either way. Distinguishing them would confirm the
  // existence of another teacher's worksheet id.
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: id });
}
