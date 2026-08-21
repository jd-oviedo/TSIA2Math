import { NextResponse } from "next/server";
import { profileGrants, requireTeacher } from "../../../../lib/auth";
import { createAdminClient } from "../../../../lib/supabase-admin";
import { exportRateLimit, rateLimitHeaders, safeLimit } from "../../../../lib/rate-limit";
import { formatZodError, teacherExportQuerySchema } from "../../../../lib/schemas";
import { buildCsv } from "../../../../lib/csv";
import {
  buildScoreRows,
  csvResponse,
  exportFilename,
  loadClassData,
  logExport,
  resolveOwnedClasses,
  scoresColumns,
} from "../../../../lib/teacher-export";

// GET /api/teacher/export/scores?classes=all|<id>,<id>&email=0|1
//
// One row per test session, long format on purpose. An administrator comparing
// results across teachers pivots this file; a wide per-student summary cannot be
// un-widened, so the shape has to be long even though no multi-teacher view
// exists yet to consume it.
//
// Same order of operations as the roster route, for the same reasons. See the
// comment there.
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
  if (!profileGrants(profile, "class-data-export", "export.scores")) {
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await loadClassData(admin, scope.classes);
    const columns = scoresColumns(includeEmail);
    const rows = await buildScoreRows(admin, data, includeEmail);
    const csv = buildCsv(columns, rows);

    await logExport(admin, {
      teacherId: profile.id,
      exportType: "scores",
      classes: scope.classes,
      requestedAll: classIds === null,
      includeEmail,
      columns,
      rowCount: rows.length,
    });

    return csvResponse(csv, exportFilename("scores", scope.classes, classIds === null));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    console.error("[api/teacher/export/scores]", message);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
