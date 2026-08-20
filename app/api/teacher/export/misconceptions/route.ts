import { NextResponse } from "next/server";
import { requireTeacher } from "../../../../lib/auth";
import { createAdminClient } from "../../../../lib/supabase-admin";
import { exportRateLimit, rateLimitHeaders, safeLimit } from "../../../../lib/rate-limit";
import { formatZodError, teacherExportQuerySchema } from "../../../../lib/schemas";
import { buildCsv } from "../../../../lib/csv";
import {
  buildMisconceptionRows,
  csvResponse,
  exportFilename,
  loadClassData,
  logExport,
  misconceptionsColumns,
  resolveOwnedClasses,
} from "../../../../lib/teacher-export";

// GET /api/teacher/export/misconceptions?classes=all|<id>,<id>&email=0|1
//
// One row per student per misconception slug, read from the same source the
// dashboard's misconception grid reads: the student's most recent session, CAT
// items only, aggregated by aggregateMisconceptions().
//
// The filename says "latest-session" and every row carries an export_scope
// column, because this file is the one a reader is most likely to misread. It
// looks like a cumulative record of what a student gets wrong and it is not.
// See the long note above buildMisconceptionRows for what was measured and why
// public.student_misconceptions is deliberately not the source.
//
// Same order of operations as the roster route. See the comment there.
export async function GET(req: Request) {
  const profile = await requireTeacher();
  if (!profile) {
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
    const columns = misconceptionsColumns(includeEmail);
    const rows = await buildMisconceptionRows(admin, data, includeEmail);
    const csv = buildCsv(columns, rows);

    await logExport(admin, {
      teacherId: profile.id,
      exportType: "misconceptions",
      classes: scope.classes,
      requestedAll: classIds === null,
      includeEmail,
      columns,
      rowCount: rows.length,
    });

    return csvResponse(
      csv,
      exportFilename("misconceptions-latest-session", scope.classes, classIds === null)
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    console.error("[api/teacher/export/misconceptions]", message);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
