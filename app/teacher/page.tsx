import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import { createAdminClient } from "../lib/supabase-admin";
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
    .select("role, subscription_status")
    .eq("id", session.user.id)
    .single();

  if (!profile || profile.role !== "teacher") {
    redirect("/dashboard");
  }
  if (profile.subscription_status !== "active") {
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
    />
  );
}
