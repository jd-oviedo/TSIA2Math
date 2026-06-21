import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase-admin";
import { revealRateLimit, getClientIp, rateLimitHeaders, safeLimit } from "../../../lib/rate-limit";

// Returns answer-bearing fields for exactly one item, scoped to the option
// the student actually picked. Never returns the full distractor_logic
// object — only the entry for selected_answer — so a single call can't be
// used to harvest the misconception map for options the student didn't pick.
//
// This closes the bulk-load leak (the old client code pulled correct_answer/
// explanation/distractor_logic for the entire bank on page load), but it is
// still a per-item oracle: someone with the full list of item_ids (which the
// public bulk load legitimately exposes) could call this once per item and
// reconstruct the answer key slowly. Rate limiting this route is the next
// real mitigation for that, separate from this fix.

interface IncomingBody {
  item_id: string;
  selected_answer: string;
}

function isValidBody(body: unknown): body is IncomingBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.item_id === "string" &&
    b.item_id.length > 0 &&
    typeof b.selected_answer === "string" &&
    b.selected_answer.length > 0
  );
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success, reset } = await safeLimit(revealRateLimit, ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: rateLimitHeaders(reset) }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ error: "Malformed request body" }, { status: 400 });
  }

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