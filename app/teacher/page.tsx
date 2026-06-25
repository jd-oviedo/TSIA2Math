import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import { createAdminClient } from "../lib/supabase-admin";
import TeacherDashboard from "./TeacherDashboard";

export default async function TeacherPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?role=teacher");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, subscription_status")
    .eq("id", session.user.id)
    .single();

  // Not a teacher at all -- send to student dashboard
  if (!profile || profile.role !== "teacher") {
    redirect("/dashboard");
  }

  // Teacher but not yet active -- show the holding page
  if (profile.subscription_status !== "active") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1e35",
        padding: "40px 24px",
      }}>
        <div style={{
          maxWidth: "480px",
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          border: "0.5px solid rgba(255,255,255,0.12)",
          borderRadius: "20px",
          padding: "48px 40px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "#C68A2F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: 700,
            color: "#fff",
          }}>
            U
          </div>
          <div>
            <p style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#C68A2F",
              margin: "0 0 12px",
            }}>
              UnpackMath Teacher Portal
            </p>
            <h1 style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              margin: "0 0 12px",
            }}>
              You&apos;re almost in.
            </h1>
            <p style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.6,
              margin: 0,
            }}>
              Your teacher account is created. Reserve your Founding Teacher spot to unlock your class roster and misconception dashboard.
            </p>
          </div>

          <div style={{
            width: "100%",
            background: "rgba(198,138,47,0.12)",
            border: "0.5px solid rgba(198,138,47,0.3)",
            borderRadius: "12px",
            padding: "16px 20px",
            textAlign: "left",
          }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#C68A2F", margin: "0 0 8px" }}>
              Founding Teacher -- locked in for life
            </p>
            {[
              "Unlimited CAT access for all your classes",
              "Full Misconception Dashboard, strand and item level",
              "Student score and strand-breakdown view",
              "Parent-friendly reports and exports",
              "Email support and early feature access",
            ].map((item) => (
              <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                <span style={{ color: "#C68A2F", flexShrink: 0 }}>&#10003;</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>{item}</span>
              </div>
            ))}
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "12px 0 0" }}>
              $10/month or $100/year. Billing starts when the dashboard launches.
            </p>
          </div>

          
          <a  href="https://www.unpackmath.com/#pricing"
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: "12px",
              background: "#C68A2F",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 700,
              textDecoration: "none",
              display: "block",
              boxSizing: "border-box",
            }}
          >
            Reserve your founding spot
          </a>

          
          <a  href="/dashboard"
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.35)",
              textDecoration: "none",
            }}
          >
            Go to student dashboard instead
          </a>
        </div>
      </div>
    );
  }

  // Active teacher -- load the full dashboard
  const { data: classes } = await admin
    .from("classes")
    .select("id, name, join_code, created_at")
    .eq("teacher_id", profile.id)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  return <TeacherDashboard initialClasses={classes ?? []} />;
}