import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase-server";
import { createAdminClient } from "../../lib/supabase-admin";
import { profileGrants } from "../../lib/auth";
import { DASH } from "../../components/dashboard-theme";
import { FONT_HEADING, FONT_BODY, FONT_BASE_CSS } from "../../components/fonts";
import SignOutRow from "./SignOutRow";

// Account settings.
//
// Deliberately small: it reads the account back and offers sign out, nothing
// more. Name and email both come from the Google identity behind the session,
// so neither is editable here -- changing them means changing the Google
// account, and an input that silently failed to persist would be worse than no
// input at all.
//
// Same server-side gate as /teacher: session, teacher role, active
// subscription. Never gate this on the client.

export default async function TeacherSettingsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login?role=teacher&next=" + encodeURIComponent("/teacher/settings"));
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
  if (!profileGrants(profile, "teacher-dashboard", "TeacherSettingsPage")) {
    redirect("/teacher/inactive");
  }

  // Tolerated separately, like /teacher: the column only exists once
  // sql/founder_flag.sql has run.
  const { data: founderRow } = await admin
    .from("profiles")
    .select("is_founder")
    .eq("id", session.user.id)
    .maybeSingle();
  const isFounder = founderRow?.is_founder === true;

  const meta = session.user.user_metadata ?? {};
  const name: string =
    meta.full_name || meta.name || (session.user.email?.split("@")[0] ?? "Teacher");
  const email = session.user.email ?? "";

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #F5F5F3; -webkit-font-smoothing: antialiased; }
        ${FONT_BASE_CSS}
      `}</style>

      <div style={{ minHeight: "100vh", background: DASH.pageBg, fontFamily: FONT_BODY, color: "#1A1A1A" }}>
        <header style={{ background: "#fff", borderBottom: "1px solid rgba(15,30,53,0.08)", padding: "0 28px", minHeight: 60, display: "flex", alignItems: "center" }}>
          <Link
            href="/teacher"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#0F1E35", textDecoration: "none" }}
          >
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 4 6 9 11 14" /></svg>
            Back to dashboard
          </Link>
        </header>

        <div style={{ maxWidth: 620, margin: "0 auto", padding: "32px 20px 60px" }}>
          <h1 style={{ margin: "0 0 6px", fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 27, letterSpacing: -0.4, color: "#0F1E35" }}>
            Account settings
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "#5F5E5A" }}>
            Your UnpackMath account.
          </p>

          <section style={{ background: "#fff", border: "1px solid rgba(15,30,53,0.07)", borderRadius: 12, boxShadow: "0 1px 2px rgba(15,30,53,0.04)", overflow: "hidden" }}>
            <Row label="Name" value={name} />
            <Row label="Email" value={email} />
            <Row label="Role" value="Teacher" />
            {isFounder && <Row label="Status" value="Founder" />}
            <div style={{ padding: "14px 20px", borderTop: "1px solid #F0EEE7", fontSize: 12.5, color: "#8A8983", lineHeight: 1.55 }}>
              Name and email come from the Google account you sign in with. To change either, change
              them in Google and sign in again.
            </div>
          </section>

          <section style={{ marginTop: 16, background: "#fff", border: "1px solid rgba(15,30,53,0.07)", borderRadius: 12, boxShadow: "0 1px 2px rgba(15,30,53,0.04)", padding: "16px 20px" }}>
            <SignOutRow />
          </section>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 20px", borderBottom: "1px solid #F0EEE7" }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "#8A8983", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1A1A1A", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </span>
    </div>
  );
}
