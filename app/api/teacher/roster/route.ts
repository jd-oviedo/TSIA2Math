import { NextResponse } from "next/server";
import { displayName, initialsFrom, requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

// GoTrue's listUsers() returns one page at a time and defaults to 50 per page.
// The roster used to make a single unpaginated call, so past 50 users in the
// project every student beyond the first page rendered with a blank email and
// "??" initials -- a silent truncation of the same shape as the question bank's
// 1000-row cap.
//
// 1000 is GoTrue's per-page ceiling, so this is one request for any project
// that fits in it and grows a request per thousand users after that.
//
// Emails and names live only in auth.users: profiles carries
// id/role/subscription_status and neither an email nor a name column, so there
// is nothing cheaper to read them from. That makes this O(users in project) to
// build a map for one class, which is worth revisiting if this ever gets slow
// -- looking up each student individually is O(class size) but costs a round
// trip per student, which is the worse trade at the sizes this runs at now.
const USERS_PAGE_SIZE = 1000;

type RosterUser = { email: string; name: string };

async function usersById(admin: SupabaseAdmin): Promise<Map<string, RosterUser>> {
  const map = new Map<string, RosterUser>();

  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: USERS_PAGE_SIZE,
    });

    if (error) throw error;

    const users = data?.users ?? [];
    for (const u of users) {
      const email = u.email ?? "";
      // listUsers already carries user_metadata, so the real name costs no
      // extra request -- it rides along on the page we were fetching anyway.
      map.set(u.id, { email, name: displayName(u.user_metadata, email) });
    }

    // A short page is the last page.
    if (users.length < USERS_PAGE_SIZE) break;
  }

  return map;
}

export async function GET(req: Request) {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("class_id");
  if (!classId) {
    return NextResponse.json({ error: "class_id is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify this class belongs to the requesting teacher
  const { data: cls, error: clsError } = await admin
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", profile.id)
    .single();

  if (clsError || !cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Get all enrolled students for this class
  const { data: enrollments, error: enrollError } = await admin
    .from("class_enrollments")
    .select("student_id, enrolled_via, enrolled_at")
    .eq("class_id", classId)
    .eq("status", "active");

  if (enrollError) {
    return NextResponse.json({ error: enrollError.message }, { status: 500 });
  }

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ roster: [] });
  }

  const studentIds = enrollments.map((e) => e.student_id);

  // Get all sessions for enrolled students (not filtered by teacher_id --
  // includes pre-enrollment sessions per the product decision)
  const { data: sessions, error: sessError } = await admin
    .from("sessions")
    .select("id, user_id, final_score, strand_breakdown, created_at")
    .in("user_id", studentIds)
    .order("created_at", { ascending: false });

  if (sessError) {
    return NextResponse.json({ error: sessError.message }, { status: 500 });
  }

  // Get user emails and names from auth.users via admin, across every page.
  let userMap: Map<string, RosterUser>;
  try {
    userMap = await usersById(admin);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Build roster: most recent session per student + attempt count
  const sessionsByStudent = new Map<string, typeof sessions>();
  for (const s of sessions ?? []) {
    if (!sessionsByStudent.has(s.user_id)) {
      sessionsByStudent.set(s.user_id, []);
    }
    sessionsByStudent.get(s.user_id)!.push(s);
  }

  const roster = enrollments.map((e) => {
    const studentSessions = sessionsByStudent.get(e.student_id) ?? [];
    const latest = studentSessions[0] ?? null;
    const user = userMap.get(e.student_id);
    const email = user?.email ?? "";
    const name = user?.name ?? "";

    return {
      student_id: e.student_id,
      email,
      name,
      initials: initialsFrom(name),
      enrolled_via: e.enrolled_via,
      enrolled_at: e.enrolled_at,
      attempt_count: studentSessions.length,
      latest_session: latest
        ? {
            id: latest.id,
            final_score: latest.final_score,
            strand_breakdown: latest.strand_breakdown,
            completed_at: latest.created_at,
          }
        : null,
    };
  });

  return NextResponse.json({ roster });
}