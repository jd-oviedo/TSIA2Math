import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { requireTeacher } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";

// Join codes are read off a projector and typed by hand, so the alphabet drops
// the glyphs that get misread: 0/O and 1/I/L. Six characters from 31 is about
// 887 million combinations.
//
// Codes are generated here rather than left to a column default so a collision
// is observable and retryable. The authority on uniqueness is still the
// database: sql/join_code_unique.sql puts a unique index on classes.join_code,
// and the retry below exists to turn that constraint into a new code instead
// of an error the teacher sees.
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const CODE_LENGTH = 6;
const MAX_CODE_ATTEMPTS = 5;

function generateJoinCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    // randomInt is rejection-sampled, so no modulo bias across the alphabet.
    out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return out;
}

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

  // Retry on collision. The unique index is global rather than per teacher,
  // which is the point: a student entering a code has no teacher context to
  // disambiguate with, so the same code must never reach two classrooms.
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const { data, error } = await admin
      .from("classes")
      .insert({ teacher_id: profile.id, name, join_code: generateJoinCode() })
      .select("id, name, join_code, created_at")
      .single();

    if (!error) {
      return NextResponse.json({ class: data });
    }

    // 23505 is unique_violation. Anything else is a real failure.
    if (error.code !== "23505") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  console.error(`[classes] could not find a free join code in ${MAX_CODE_ATTEMPTS} attempts`);
  return NextResponse.json(
    { error: "Could not allocate a unique join code. Please try again." },
    { status: 503 }
  );
}