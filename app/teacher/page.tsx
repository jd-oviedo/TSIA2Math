import { redirect } from "next/navigation";
import { requireTeacher } from "../lib/auth";
import { createAdminClient } from "../lib/supabase-admin";
import TeacherDashboard from "./TeacherDashboard";

export default async function TeacherPage() {
  const profile = await requireTeacher();
  if (!profile) {
    redirect("/login?next=" + encodeURIComponent("/teacher"));
  }

  const admin = createAdminClient();
  const { data: classes } = await admin
    .from("classes")
    .select("id, name, join_code, created_at")
    .eq("teacher_id", profile.id)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  return <TeacherDashboard initialClasses={classes ?? []} />;
}