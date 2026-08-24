import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import { createAdminClient } from "../lib/supabase-admin";
import { profileGrants } from "../lib/auth";
import { getTopics } from "../lib/curriculum-progress";
import TeacherDashboardClient from "./TeacherDashboardClient";

// Server-side gate. This is the only trustworthy place to enforce access:
//   - no session            -> teacher login
//   - not a teacher         -> student dashboard
//   - inactive subscription -> holding page
// Never gate this route on the client; subscription status must be read
// server-side via the service-role client (RLS-bypassing, own-row lookup).
export default async function TeacherPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login?role=teacher&next=" + encodeURIComponent("/teacher"));
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, subscription_status, plan, plan_status, access_until")
    .eq("id", session.user.id)
    .single();

  if (!profile || profile.role !== "teacher") {
    redirect("/dashboard");
  }
  // Moved off subscription_status: the plan has to be a teacher plan, not merely
  // an active payment of any kind. See profileGrants in app/lib/auth.ts.
  if (!profileGrants(profile, "teacher-dashboard", "TeacherPage")) {
    redirect("/teacher/inactive");
  }

  const { data: classes } = await admin
    .from("classes")
    .select("id, name, join_code, created_at")
    .eq("teacher_id", session.user.id)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  // Founder flag, read separately from the access gate above and allowed to
  // fail. profiles.is_founder is added by sql/founder_flag.sql; until that has
  // run the column does not exist, the select errors, and the dashboard should
  // still render with no badge rather than 500.
  const { data: founderRow } = await admin
    .from("profiles")
    .select("is_founder")
    .eq("id", session.user.id)
    .maybeSingle();
  const isFounder = founderRow?.is_founder === true;

  // Onboarding tour flag, read separately from is_founder for the same reason
  // is_founder is read separately from the access gate: a select naming a
  // column that does not exist fails as a whole, so combining the two would
  // mean an unrun sql/teacher_tour_flag.sql took the founder badge down with
  // it. Three tolerant reads, three independent failure modes.
  //
  // 'unavailable' is the pre-migration state and is not the same as 'pending':
  // it tells the client there is no per-account record to trust, so fall back
  // to localStorage rather than showing the tour on every machine forever.
  const { data: tourRow, error: tourError } = await admin
    .from("profiles")
    .select("teacher_tour_done")
    .eq("id", session.user.id)
    .maybeSingle();
  const tourState: "done" | "pending" | "unavailable" = tourError
    ? "unavailable"
    : tourRow?.teacher_tour_done === true
      ? "done"
      : "pending";

  const meta = session.user.user_metadata ?? {};
  const teacherName: string =
    meta.full_name || meta.name || (session.user.email?.split("@")[0] ?? "Teacher");
  const teacherEmail = session.user.email ?? "";

  // The COSMETIC half of the export gate. The real gate is in the three route
  // handlers under app/api/teacher/export, which refuse a Core account with a
  // 403 whether or not this button is on screen. Computed here, server-side,
  // from the same profileGrants the routes use, so the two cannot disagree
  // about who sees what.
  //
  // Passed as a boolean rather than letting the client decide from `plan`: a
  // client that derives entitlement is a client that can be told it has some.
  const canExport = profileGrants(profile, "class-data-export", "TeacherPage.export");

  // The assignable topic list, loaded server-side and handed down as plain data.
  //
  // getTopics() RATHER THAN listPickerTopics(), and the difference is what
  // reaches the browser. Both read the same source with the same
  // `is_placeholder = false` filter and the same (unit, sequence) ordering, but
  // the picker one carries practice_items so it can count a worksheet pool --
  // the full authored body of all 97 topics, shipped to a client component that
  // needs five fields per row. This reads the cached course list every other
  // surface already reads and projects it down to what the select renders.
  //
  // NOT A GATE. A teacher who edits this list in the browser gains nothing: the
  // route calls isAssignableTopic() on every write and refuses a placeholder or
  // a nonexistent id there.
  const { topics } = await getTopics();
  const assignTopics = topics.map((t) => ({
    course_id: t.course_id,
    topic_id: t.topic_id,
    topic_name: t.topic_name,
    unit_number: t.unit_number,
    sequence_in_unit: t.sequence_in_unit,
  }));

  return (
    <TeacherDashboardClient
      canExport={canExport}
      assignTopics={assignTopics}
      initialClasses={classes ?? []}
      teacherName={teacherName}
      teacherEmail={teacherEmail}
      isFounder={isFounder}
      plan={profile.plan ?? null}
      tourState={tourState}
    />
  );
}
