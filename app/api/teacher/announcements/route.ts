import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";
import { formatZodError } from "../../../lib/schemas";

// Teacher-authored announcements.
//
// Writes go through the admin client because the table grants select and
// nothing else to authenticated, matching profiles and audit_log: the only way
// a row is created is a request that has already cleared requireTeacher here.

const announcementSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  body: z.string().trim().min(1, "Body is required").max(5000, "Body is too long"),
  // Omitted or null posts to every class the teacher has, as a general notice.
  class_id: z.string().uuid("class_id must be a valid class ID").nullable().optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("announcements")
    .select("id, title, body, class_id, published, created_at")
    .eq("created_by", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return NextResponse.json(
        { error: "The announcements table has not been created yet. Run sql/announcements.sql." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ announcements: data ?? [] });
}

export async function POST(req: Request) {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body" }, { status: 400 });
  }

  const parsed = announcementSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const { title, body, class_id, published } = parsed.data;
  const admin = createAdminClient();

  // A teacher may only post to a class they own. Checked rather than trusted:
  // class_id arrives from the browser, and without this a teacher could address
  // another teacher's roster.
  if (class_id) {
    const { data: owned } = await admin
      .from("classes")
      .select("id")
      .eq("id", class_id)
      .eq("teacher_id", profile.id)
      .maybeSingle();

    if (!owned) {
      return NextResponse.json({ error: "That class is not yours" }, { status: 403 });
    }
  }

  const { data, error } = await admin
    .from("announcements")
    .insert({
      title,
      body,
      class_id: class_id ?? null,
      published: published ?? true,
      created_by: profile.id,
    })
    .select("id, title, body, class_id, published, created_at")
    .single();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return NextResponse.json(
        { error: "The announcements table has not been created yet. Run sql/announcements.sql." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ announcement: data });
}
