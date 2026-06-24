import { NextResponse } from "next/server";
import { createAdminClient } from "../../lib/supabase-admin";
import { requireTeacher } from "../../lib/auth";

export async function GET() {
  const profile = await requireTeacher();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("item_flags")
    .select("id, created_at, item_id, user_email, category, comment, status")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ flags: data });
}

export async function PATCH(req: Request) {
  const profile = await requireTeacher();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status } = await req.json();
  if (!id || !["open", "resolved"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("item_flags")
    .update({ status })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}