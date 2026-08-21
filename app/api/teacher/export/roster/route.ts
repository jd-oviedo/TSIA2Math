import { NextResponse } from "next/server";
import { profileGrants, requireTeacher } from "../../../../lib/auth";
import { createAdminClient } from "../../../../lib/supabase-admin";
import { exportRateLimit, rateLimitHeaders, safeLimit } from "../../../../lib/rate-limit";
import { formatZodError, teacherExportQuerySchema } from "../../../../lib/schemas";
import { buildCsv } from "../../../../lib/csv";
import {
  buildRosterRows,
  csvResponse,
  exportFilename,
  loadClassData,
  logExport,
  resolveOwnedClasses,
  rosterColumns,
} from "../../../../lib/teacher-export";

// GET /api/teacher/export/roster?classes=all|<id>,<id>&email=0|1
//
// One row per active enrolment. The first non-JSON response in this codebase,
// so the header shape here is the pattern the other exports follow rather than
// one they inherited.
//
// Order of operations is deliberate and must not be rearranged:
//
//   1. requireTeacher()      no query runs for a caller who is not an entitled
//                            teacher. This includes an entitlement check, but
//                            only for 'teacher-dashboard', which BOTH teacher
//                            tiers hold.
//   1b. class-data-export    the tier boundary. Teacher Pro only. Added after
//                            five Core accounts were found able to reach these
//                            routes, one of them a paying customer.
//   2. rate limit            keyed on the teacher id, which needs step 1 first.
//   3. Zod                   reject malformed input before it reaches a query.
//   4. resolveOwnedClasses() the authorisation boundary for WHICH classes.
//   5. read, build, respond
export async function GET(req: Request) {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // TEACHER PRO ONLY. requireTeacher above proves an entitled teacher; it asks
  // for 'teacher-dashboard', which Core holds too. This is the tier boundary,
  // and it runs before any query so a Core account costs nothing to refuse.
  //
  // 403 rather than 404: the caller is a legitimate teacher and the route
  // exists. Hiding its existence would be misleading, and the dashboard already
  // hides the control for them, which is the cosmetic half of this.
  if (!profileGrants(profile, "class-data-export", "export.roster")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { success, reset } = await safeLimit(exportRateLimit, profile.id);
  if (!success) {
    return NextResponse.json(
      { error: "Too many exports. Try again shortly." },
      { status: 429, headers: rateLimitHeaders(reset) }
    );
  }

  const { searchParams } = new URL(req.url);
  const parsed = teacherExportQuerySchema.safeParse({
    classes: searchParams.get("classes") ?? undefined,
    email: searchParams.get("email") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const { classIds, includeEmail } = parsed.data;

  const admin = createAdminClient();

  try {
    const scope = await resolveOwnedClasses(admin, profile.id, classIds);
    if (!scope.ok) {
      // Deliberately does not name which ids failed. A teacher probing for
      // another teacher's class should not learn from the error whether the id
      // exists, only that they cannot have it.
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await loadClassData(admin, scope.classes);
    const columns = rosterColumns(includeEmail);
    const rows = buildRosterRows(data, includeEmail);
    const csv = buildCsv(columns, rows);

    await logExport(admin, {
      teacherId: profile.id,
      exportType: "roster",
      classes: scope.classes,
      requestedAll: classIds === null,
      includeEmail,
      columns,
      rowCount: rows.length,
    });

    return csvResponse(csv, exportFilename("roster", scope.classes, classIds === null));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    console.error("[api/teacher/export/roster]", message);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
