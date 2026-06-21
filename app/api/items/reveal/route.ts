import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase-admin";
import { revealRateLimit, getClientIp, rateLimitHeaders, safeLimit } from "../../../lib/rate-limit";
import { revealBodySchema, formatZodError } from "../../../lib/schemas";

// Returns answer-bearing fields for exactly one item, scoped to the option
// the student actually picked. Never returns the full distractor_logic
// object — only the entry for selected_answer — so a single call can't be
// used to harvest the misconception map for options the student didn't pick.
//
// This closes the bulk-load leak (the old client code pulled correct_answer/
// explanation/distractor_logic for the entire bank on page load), but it is
// still a per-item oracle: someone with the full list of item_ids (which the
// public bulk load legitimately exposes) could call this once per item and
// reconstruct the answer key slowly. Rate limiting on this route is the
// mitigation for that.

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success, reset } = await safeLimit(revealRateLimit, ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: rateLimitHeaders(reset) }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = revealBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const body = parsed.data;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("questions")
    .select("correct_answer, explanation, distractor_logic")
    .eq("item_id", body.item_id)
    .eq("status", "draft")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const isCorrect = body.selected_answer === data.correct_answer;
  const distractorLogic = (data.distractor_logic ?? {}) as Record<string, string>;

  return NextResponse.json(
    {
      correct_answer: data.correct_answer,
      is_correct: isCorrect,
      explanation: data.explanation,
      distractor_note: isCorrect ? null : distractorLogic[body.selected_answer] ?? null,
    },
    { status: 200 }
  );
}