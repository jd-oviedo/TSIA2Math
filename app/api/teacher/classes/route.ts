import { NextResponse } from "next/server";
import { requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";

export async function GET() {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("classes")
    .select("id, name, join_code, created_at, archived_at")
    .eq("teacher_id", profile.id)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ classes: data ?? [] });
}

export async function POST(req: Request) {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Class name is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("classes")
    .insert({ teacher_id: profile.id, name })
    .select("id, name, join_code, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ class: data });
}