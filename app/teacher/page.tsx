import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import { createAdminClient } from "../lib/supabase-admin";
import { profileGrants } from "../lib/auth";
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

  return (
    <TeacherDashboardClient
      initialClasses={classes ?? []}
      teacherName={teacherName}
      teacherEmail={teacherEmail}
      isFounder={isFounder}
      tourState={tourState}
    />
  );
}
