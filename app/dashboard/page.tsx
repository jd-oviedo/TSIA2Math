import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import DashboardList from "./DashboardList";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=" + encodeURIComponent("/dashboard"));
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--ec-bg)", position: "relative" }}>
      <div style={{ position: "relative" }}>
        <Header />
      </div>
      <main style={{ flex: 1, maxWidth: "680px", margin: "0 auto", width: "100%", padding: "100px 24px 80px" }}>
        <DashboardList />
      </main>
      <Footer />
    </div>
  );
}