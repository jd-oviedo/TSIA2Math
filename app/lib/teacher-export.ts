import type { SupabaseClient } from "@supabase/supabase-js";
import { placementBand, strandPcts, type StrandBreakdown } from "./placement";
import { usersById } from "./teacher-directory";
import { aggregateMisconceptions, type AggregatedMisconception } from "./misconception-aggregate";
import { misconceptionLabel } from "./misconception-labels";
import { slugifyForFilename, type CsvCell } from "./csv";

// Query layer for the teacher CSV exports.
//
// Everything here reads the same tables, with the same filters, that
// app/api/teacher/roster/route.ts already reads, so the file and the dashboard
// cannot disagree about who is enrolled or what they scored. The banding and
// strand maths come from app/lib/placement.ts, shared with the screen for the
// same reason.

type Admin = SupabaseClient;

/**
 * PostgREST answers at most 1000 rows per request regardless of what the client
 * asks for, and returns a SHORT ARRAY rather than an error when it truncates.
 * That is the failure mode that put blank emails on the roster once already, and
 * it is worse here: `responses` holds 4121 rows in production today, so a single
 * unpaged select for a busy class would silently drop time-on-task for every
 * session past the cut and the CSV would look complete.
 *
 * Every multi-row read in this module goes through this.
 */
const PAGE = 1000;

async function fetchAll<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    const batch = data ?? [];
    out.push(...batch);
    if (batch.length < PAGE) break;
  }
  return out;
}

// ─── Class scope and ownership ───────────────────────────────────────────────

export type OwnedClass = { id: string; name: string };

export type ClassScope =
  | { ok: true; classes: OwnedClass[] }
  | { ok: false; forbidden: string[] };

/**
 * Resolve the requested class ids to classes this teacher actually owns.
 *
 * THIS IS THE AUTHORISATION BOUNDARY and it is the reason the multi-select
 * picker needed its own thinking. requireTeacher() proves the caller is a
 * teacher on a teacher plan; it says nothing about WHICH classes, and every
 * query in this module runs through the service-role client, so RLS is bypassed
 * and provides no backstop underneath.
 *
 * The shape of the bug this avoids: validate ids[0], then run
 * `.in("class_id", ids)` for the rest. That passes a test written with one
 * class and hands over another teacher's roster the moment the array has two
 * entries. So ownership is resolved for the WHOLE set in one filtered query,
 * and any requested id that does not come back is reported as forbidden. A
 * partial match is a refusal, not a silent narrowing to the subset that
 * happened to be owned.
 *
 * @param requested null means "all of this teacher's classes", which is the
 *   explicit all-classes option in the picker.
 */
export async function resolveOwnedClasses(
  admin: Admin,
  teacherId: string,
  requested: string[] | null
): Promise<ClassScope> {
  if (requested === null) {
    // Matches the dashboard's own class list: archived classes are hidden
    // there, so "all classes" must not quietly include them.
    const { data, error } = await admin
      .from("classes")
      .select("id, name")
      .eq("teacher_id", teacherId)
      .is("archived_at", null)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return { ok: true, classes: data ?? [] };
  }

  // Explicit ids are NOT filtered on archived_at. A class archived at the end
  // of a term is exactly the one a teacher wants a record of, and the picker
  // only offers live classes anyway, so this widens nothing in practice.
  const { data, error } = await admin
    .from("classes")
    .select("id, name")
    .eq("teacher_id", teacherId)
    .in("id", requested);

  if (error) throw new Error(error.message);

  const owned = new Map((data ?? []).map((c) => [c.id, c]));
  const forbidden = requested.filter((id) => !owned.has(id));
  if (forbidden.length > 0) return { ok: false, forbidden };

  // Preserve the caller's ordering so the file is deterministic.
  return { ok: true, classes: requested.map((id) => owned.get(id)!) };
}

// ─── Shared class data ───────────────────────────────────────────────────────

type Enrollment = {
  class_id: string;
  student_id: string;
  enrolled_via: string;
  enrolled_at: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  session_type: string;
  final_score: number | null;
  strand_breakdown: StrandBreakdown | null;
  created_at: string;
  completed_at: string | null;
};

export type ClassData = {
  classes: OwnedClass[];
  enrollments: Enrollment[];
  /** Every session for every enrolled student, newest first. */
  sessions: SessionRow[];
  users: Map<string, { email: string; name: string }>;
};

/**
 * One read of everything both exports need.
 *
 * Sessions are deliberately NOT filtered by teacher or by class. That mirrors
 * the roster route, which includes a student's pre-enrolment sessions by
 * product decision. Filtering here would make the CSV disagree with the
 * dashboard on attempt counts, which is the thing this build exists to avoid.
 */
export async function loadClassData(
  admin: Admin,
  classes: OwnedClass[]
): Promise<ClassData> {
  const classIds = classes.map((c) => c.id);

  const enrollments =
    classIds.length === 0
      ? []
      : await fetchAll<Enrollment>((from, to) =>
          admin
            .from("class_enrollments")
            .select("class_id, student_id, enrolled_via, enrolled_at")
            .in("class_id", classIds)
            .eq("status", "active")
            .order("enrolled_at", { ascending: true })
            .range(from, to)
        );

  const studentIds = [...new Set(enrollments.map((e) => e.student_id))];

  const sessions =
    studentIds.length === 0
      ? []
      : await fetchAll<SessionRow>((from, to) =>
          admin
            .from("sessions")
            .select("id, user_id, session_type, final_score, strand_breakdown, created_at, completed_at")
            .in("user_id", studentIds)
            .order("created_at", { ascending: false })
            .range(from, to)
        );

  const users = await usersById(admin);

  return { classes, enrollments, sessions, users };
}

// ─── Formatting helpers ──────────────────────────────────────────────────────

/**
 * YYYY-MM-DD. Excel reads this as a date and a pivot sorts it correctly, which
 * "2w ago" does not. The dashboard's relative timeAgo() is deliberately NOT
 * reused: it is right for a glance and useless in a spreadsheet that will be
 * opened again next term.
 */
function isoDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

// ─── roster.csv ──────────────────────────────────────────────────────────────

export const ROSTER_COLUMNS_BASE = [
  "class_name",
  "student_name",
  "enrolled_on",
  "enrollment_method",
  "tests_taken",
  "diagnostic_sessions",
  "practice_sessions",
  "latest_score",
  "latest_band",
  "last_active",
  "qr_accuracy_pct",
  "ar_accuracy_pct",
  "gr_accuracy_pct",
  "pr_accuracy_pct",
];

export function rosterColumns(includeEmail: boolean): string[] {
  if (!includeEmail) return ROSTER_COLUMNS_BASE;
  // Slotted directly after student_name, where a reader expects it.
  const cols = [...ROSTER_COLUMNS_BASE];
  cols.splice(2, 0, "student_email");
  return cols;
}

export function buildRosterRows(data: ClassData, includeEmail: boolean): CsvCell[][] {
  const classNames = new Map(data.classes.map((c) => [c.id, c.name]));

  // Sessions arrive newest first, so the first one seen per student is latest.
  const byStudent = new Map<string, SessionRow[]>();
  for (const s of data.sessions) {
    const list = byStudent.get(s.user_id);
    if (list) list.push(s);
    else byStudent.set(s.user_id, [s]);
  }

  return data.enrollments.map((e) => {
    const sessions = byStudent.get(e.student_id) ?? [];
    const latest = sessions[0] ?? null;
    const user = data.users.get(e.student_id);
    const score = latest?.final_score ?? null;
    const acc = strandPcts(latest?.strand_breakdown ?? null);

    // D2: tests_taken counts every session, exactly as the roster route and
    // therefore the dashboard does. The split beside it is the honest detail
    // the dashboard does not show.
    const diagnostic = sessions.filter((s) => s.session_type === "diagnostic").length;
    const practice = sessions.filter((s) => s.session_type === "practice").length;

    const row: CsvCell[] = [
      classNames.get(e.class_id) ?? "",
      user?.name ?? "",
      isoDate(e.enrolled_at),
      e.enrolled_via,
      sessions.length,
      diagnostic,
      practice,
      score,
      placementBand(score).label,
      latest ? isoDate(latest.completed_at ?? latest.created_at) : "",
      latest ? acc.QR : null,
      latest ? acc.AR : null,
      latest ? acc.GR : null,
      latest ? acc.PR : null,
    ];

    if (includeEmail) row.splice(2, 0, user?.email ?? "");
    return row;
  });
}

// ─── scores.csv ──────────────────────────────────────────────────────────────

export const SCORES_COLUMNS_BASE = [
  "class_name",
  "student_name",
  "session_date",
  "session_type",
  "attempt_number",
  "score",
  "band",
  "qr_correct",
  "qr_total",
  "ar_correct",
  "ar_total",
  "gr_correct",
  "gr_total",
  "pr_correct",
  "pr_total",
  "time_on_items_seconds",
];

export function scoresColumns(includeEmail: boolean): string[] {
  if (!includeEmail) return SCORES_COLUMNS_BASE;
  const cols = [...SCORES_COLUMNS_BASE];
  cols.splice(2, 0, "student_email");
  return cols;
}

/**
 * Time on task per session, summed from responses.elapsed_ms.
 *
 * D3 disqualified completed_at - created_at: production holds rows where
 * completed_at is EARLIER than created_at, so wall clock is not merely
 * imprecise here, it is negative. elapsed_ms is Zod-bounded per item at
 * submission (0 to 30 minutes) so the sum is at least sane.
 *
 * A session with no responses rows is absent from the returned map, and the
 * caller writes an empty cell rather than a zero. Zero would read as "answered
 * instantly"; empty reads as "not known", which is the truth.
 */
async function timeOnItemsBySession(
  admin: Admin,
  sessionIds: string[]
): Promise<Map<string, number>> {
  const totals = new Map<string, number>();
  if (sessionIds.length === 0) return totals;

  const rows = await fetchAll<{ session_id: string; elapsed_ms: number | null }>(
    (from, to) =>
      admin
        .from("responses")
        .select("session_id, elapsed_ms")
        .in("session_id", sessionIds)
        .range(from, to)
  );

  for (const r of rows) {
    if (r.elapsed_ms === null) continue;
    totals.set(r.session_id, (totals.get(r.session_id) ?? 0) + r.elapsed_ms);
  }
  return totals;
}

export async function buildScoreRows(
  admin: Admin,
  data: ClassData,
  includeEmail: boolean
): Promise<CsvCell[][]> {
  const classNames = new Map(data.classes.map((c) => [c.id, c.name]));
  const times = await timeOnItemsBySession(admin, data.sessions.map((s) => s.id));

  // Attempt number counts from the student's FIRST session forward, across all
  // session types, so it lines up with tests_taken on the roster file.
  const ascendingByStudent = new Map<string, SessionRow[]>();
  for (const s of [...data.sessions].reverse()) {
    const list = ascendingByStudent.get(s.user_id);
    if (list) list.push(s);
    else ascendingByStudent.set(s.user_id, [s]);
  }
  const attemptNumber = new Map<string, number>();
  for (const list of ascendingByStudent.values()) {
    list.forEach((s, i) => attemptNumber.set(s.id, i + 1));
  }

  const rows: CsvCell[][] = [];

  // One row per session per enrolment. A student enrolled in two of the
  // teacher's classes appears under both, which is what a class-scoped file has
  // to do; class_name is the disambiguator.
  for (const e of data.enrollments) {
    const user = data.users.get(e.student_id);
    const sessions = (ascendingByStudent.get(e.student_id) ?? []);

    for (const s of sessions) {
      const bd = s.strand_breakdown;
      const ms = times.get(s.id);

      const row: CsvCell[] = [
        classNames.get(e.class_id) ?? "",
        user?.name ?? "",
        isoDate(s.completed_at ?? s.created_at),
        s.session_type,
        attemptNumber.get(s.id) ?? null,
        s.final_score,
        placementBand(s.final_score ?? null).label,
        bd?.QR?.correct ?? null, bd?.QR?.total ?? null,
        bd?.AR?.correct ?? null, bd?.AR?.total ?? null,
        bd?.GR?.correct ?? null, bd?.GR?.total ?? null,
        bd?.PR?.correct ?? null, bd?.PR?.total ?? null,
        ms === undefined ? null : Math.round(ms / 1000),
      ];

      if (includeEmail) row.splice(2, 0, user?.email ?? "");
      rows.push(row);
    }
  }

  return rows;
}

// ─── Response and audit ──────────────────────────────────────────────────────

/**
 * Name the file after what is in it.
 *
 * A teacher who exports five classes across a term ends up with five files in a
 * Downloads folder, and "export.csv (3)" is worthless. The class scope and the
 * date go in the name. Every component is slugified because this value lands in
 * a Content-Disposition header, where an unescaped quote or newline from a
 * teacher-authored class name would let the value break out of the header.
 */
export function exportFilename(
  kind: string,
  classes: OwnedClass[],
  requestedAll: boolean
): string {
  const date = new Date().toISOString().slice(0, 10);
  const scope = requestedAll
    ? "all-classes"
    : classes.length === 1
      ? slugifyForFilename(classes[0].name)
      : `${classes.length}-classes`;
  return `${kind}-${scope}-${date}.csv`;
}

export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: {
      // charset=utf-8 alongside the BOM. Belt and braces: the header is what
      // a browser and most parsers read, the BOM is what Excel reads.
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // A roster is not something a shared proxy should hold on to.
      "Cache-Control": "no-store, private",
    },
  });
}

/**
 * Record what was exported, not merely that an export happened.
 *
 * The distinction is the whole point. "A teacher downloaded something" answers
 * no question anyone will actually ask; "this teacher exported these classes,
 * with student emails included, and got 31 rows" answers a subject access
 * request, a data-retention question and a "where did this spreadsheet come
 * from" question.
 *
 * Best effort by construction. The file is already built and correct by the
 * time this runs, and losing the log row is a smaller failure than failing a
 * download the teacher is waiting on. The failure is logged so it is visible.
 */
export async function logExport(
  admin: Admin,
  args: {
    teacherId: string;
    exportType: string;
    classes: OwnedClass[];
    requestedAll: boolean;
    includeEmail: boolean;
    columns: string[];
    rowCount: number;
  }
): Promise<void> {
  try {
    const { error } = await admin.from("audit_log").insert({
      user_id: args.teacherId,
      action: "teacher_export",
      table_name: args.exportType,
      record_id: null,
      metadata: {
        export_type: args.exportType,
        class_ids: args.classes.map((c) => c.id),
        class_count: args.classes.length,
        requested_all_classes: args.requestedAll,
        include_email: args.includeEmail,
        columns: args.columns,
        row_count: args.rowCount,
      },
    });
    if (error) {
      console.error("[teacher-export] audit_log insert failed:", error.message);
    }
  } catch (err) {
    console.error(
      "[teacher-export] audit_log insert threw:",
      err instanceof Error ? err.message : err
    );
  }
}

// ─── misconceptions.csv ──────────────────────────────────────────────────────
//
// SCOPE, AND WHY IT IS STAMPED ON EVERY ROW
//
// This file is NOT an all-time record of what a student has ever got wrong. It
// is the same thing the dashboard's "Top misconceptions" grid shows: the
// student's MOST RECENT session, CAT items only, wrong answers joined to
// questions.misconception_tag and grouped by slug.
//
// The Phase 1 audit is the reason that has to be said out loud. There is an
// aggregate table, public.student_misconceptions, which does hold an all-time
// cumulative record across CAT, curriculum and Socratic evidence, with times_hit
// and confidence and last_seen. Nothing in the product reads it. Measured on
// the one production class with real data, the grid and that table had ZERO
// slugs in common: 13 versus 2. Reading the table here would have produced a
// file that contradicted the screen it was downloaded from.
//
// So the export reuses aggregateMisconceptions(), the same function both
// dashboard views call, and accepts that times_hit, sources and last_seen are
// not available on this path. An administrator who assumes "cumulative" would
// misread the file badly, which is what export_scope on every row is for.
//
// ONE CALL PER STUDENT. The class route aggregates across the whole roster at
// once, which yields class totals and an affected_students count but no
// per-student breakdown. This file is one row per student per slug, so the
// aggregation runs per student, exactly as app/api/teacher/student/route.ts
// does it. That costs two queries per student rather than two per class. It is
// the honest reuse: computing the per-student split any other way would mean a
// second implementation of the grouping, which is the thing this whole build
// has been avoiding.

/** Constant stamped on every row. See the note above. */
export const MISCONCEPTION_EXPORT_SCOPE = "latest_session_cat_only";

/**
 * Per student, not per class, so this is not the grid's top-10 cut. A teacher
 * exporting a file wants the whole picture; the grid says "Top misconceptions"
 * and this does not.
 */
const MISCONCEPTIONS_PER_STUDENT = 100;

export const MISCONCEPTIONS_COLUMNS_BASE = [
  "class_name",
  "student_name",
  "session_date",
  "misconception_tag",
  "misconception_label",
  "misconception_label_raw",
  "example_item_id",
  "strand",
  "topic_id",
  "times_selected",
  "items_affected",
  "export_scope",
];

export function misconceptionsColumns(includeEmail: boolean): string[] {
  if (!includeEmail) return MISCONCEPTIONS_COLUMNS_BASE;
  const cols = [...MISCONCEPTIONS_COLUMNS_BASE];
  cols.splice(2, 0, "student_email");
  return cols;
}

export async function buildMisconceptionRows(
  admin: Admin,
  data: ClassData,
  includeEmail: boolean
): Promise<CsvCell[][]> {
  const classNames = new Map(data.classes.map((c) => [c.id, c.name]));

  // Newest first, so the first session seen per student is the latest. Same
  // selection the class grid makes in app/api/teacher/misconceptions/route.ts.
  const latestByStudent = new Map<string, SessionRow>();
  for (const s of data.sessions) {
    if (!latestByStudent.has(s.user_id)) latestByStudent.set(s.user_id, s);
  }

  // Aggregated once per student and reused across their enrolments. A student
  // in two of this teacher's classes appears under both class names, and there
  // is no reason to run the same aggregation twice for them.
  const perStudent = new Map<string, AggregatedMisconception[]>();
  for (const [studentId, session] of latestByStudent) {
    const sessionToStudent = new Map([[session.id, studentId]]);
    const { misconceptions } = await aggregateMisconceptions(
      admin,
      [session.id],
      sessionToStudent,
      MISCONCEPTIONS_PER_STUDENT
    );
    perStudent.set(studentId, misconceptions);
  }

  const rows: CsvCell[][] = [];

  for (const e of data.enrollments) {
    const user = data.users.get(e.student_id);
    const session = latestByStudent.get(e.student_id);
    // A student who has never tested has no latest session and therefore no
    // misconceptions. They are absent from this file rather than present with
    // empty cells: a row here asserts "this student showed this error", and
    // there is nothing to assert.
    if (!session) continue;

    for (const m of perStudent.get(e.student_id) ?? []) {
      const row: CsvCell[] = [
        classNames.get(e.class_id) ?? "",
        user?.name ?? "",
        isoDate(session.completed_at ?? session.created_at),
        m.misconception_tag,
        misconceptionLabel(m.misconception_tag),
        // The representative distractor prose, chosen by the same rule the
        // dashboard card uses: the most-selected option in the group. Carried
        // verbatim, LaTeX and all, so it matches what is on screen.
        m.distractor_text,
        m.example_item_id,
        m.primary_strand,
        m.topic_id,
        m.frequency,
        m.item_count,
        MISCONCEPTION_EXPORT_SCOPE,
      ];

      if (includeEmail) row.splice(2, 0, user?.email ?? "");
      rows.push(row);
    }
  }

  return rows;
}
