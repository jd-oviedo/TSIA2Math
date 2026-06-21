import { PostHog } from "posthog-node";
import { NextResponse } from "next/server";
import { createAdminClient } from "../../lib/supabase-admin";
import { createClient as createServerClient } from "../../lib/supabase-server";
import { sessionsRateLimit, getClientIp, rateLimitHeaders, safeLimit } from "../../lib/rate-limit";
import {
  STARTING_THETA,
  STARTING_DIFFICULTY,
  TIER_B,
  updateTheta,
  thetaToScore,
  TSIA2_PASSING,
} from "../../adaptive-test/engine";
import type { Item, ProficiencyLevel, Strand } from "../../adaptive-test/type";

// Only the fields a client can legitimately know about its own answer.
// Notably absent: is_correct, theta_after, score_after — those are derived
// server-side from the real item bank, never trusted from the client.
interface IncomingResponse {
  item_id: string;
  selected_answer: string;
  elapsed_ms: number;
}

interface IncomingBody {
  responses: IncomingResponse[];
  max_items: number;
  posthog_distinct_id?: string;
}

function isValidBody(body: unknown): body is IncomingBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  if (typeof b.max_items !== "number" || b.max_items <= 0) return false;
  if (!Array.isArray(b.responses) || b.responses.length === 0) return false;
  return b.responses.every((r) => {
    if (typeof r !== "object" || r === null) return false;
    const rr = r as Record<string, unknown>;
    return (
      typeof rr.item_id === "string" &&
      typeof rr.selected_answer === "string" &&
      typeof rr.elapsed_ms === "number"
    );
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success, reset } = await safeLimit(sessionsRateLimit, ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
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

  // Who's the test-taker, if anyone? Anonymous test-takers have no
  // session, that's fine, user_id just stays null on the row.
  let userId: string | null = null;
  try {
    const userClient = await createServerClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // No valid session cookie — anonymous test-taker, proceed without a user_id.
    userId = null;
  }

  const itemIds = body.responses.map((r) => r.item_id);
  const { data: items, error: itemsError } = await admin
    .from("questions")
    .select("item_id, correct_answer, primary_strand, proficiency_level")
    .in("item_id", itemIds);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const itemMap = new Map <
    string,
    Pick<Item, "item_id" | "correct_answer" | "primary_strand" | "proficiency_level">
  >((items ?? []).map((i) => [i.item_id, i]));

  // Any item_id the client sent that doesn't exist in the real bank is
  // either a bug or tampering. Reject the whole submission rather than
  // silently dropping rows, a partial save would be worse than no save.
  const missingIds = itemIds.filter((id) => !itemMap.has(id));
  if (missingIds.length > 0) {
    return NextResponse.json(
      { error: `Unknown item_id(s): ${missingIds.join(", ")}` },
      { status: 400 }
    );
  }

  // Walk the sequence forward exactly as useSession's reducer does,
  // re-deriving is_correct/theta/score from the real item bank instead of
  // trusting anything the client sent.
  let theta = STARTING_THETA;
  const strandTotals: Record<string, { total: number; correct: number }> = {};
  const responseRows: {
    item_id: string;
    selected_answer: string;
    is_correct: boolean;
    theta_after: number;
    score_after: number;
    elapsed_ms: number;
  }[] = [];

  for (const r of body.responses) {
    const item = itemMap.get(r.item_id)!;
    const isCorrect = r.selected_answer === item.correct_answer;
    const difficulty = item.proficiency_level as ProficiencyLevel;
    theta = updateTheta(theta, isCorrect, difficulty in TIER_B ? difficulty : STARTING_DIFFICULTY);
    const score = thetaToScore(theta);

    const strand = item.primary_strand as Strand;
    if (!strandTotals[strand]) strandTotals[strand] = { total: 0, correct: 0 };
    strandTotals[strand].total++;
    if (isCorrect) strandTotals[strand].correct++;

    responseRows.push({
      item_id: r.item_id,
      selected_answer: r.selected_answer,
      is_correct: isCorrect,
      theta_after: theta,
      score_after: score,
      elapsed_ms: r.elapsed_ms,
    });
  }

  const finalTheta = theta;
  const finalScore = thetaToScore(finalTheta);
  const strandBreakdown = Object.fromEntries(
    Object.entries(strandTotals).map(([strand, { total, correct }]) => [
      strand,
      { total, correct, pct: total > 0 ? Math.round((correct / total) * 100) : 0 },
    ])
  );

  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .insert({
      user_id: userId,
      completed_at: new Date().toISOString(),
      final_theta: finalTheta,
      final_score: finalScore,
      max_items: body.max_items,
      strand_breakdown: strandBreakdown,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: sessionError?.message ?? "Failed to create session" },
      { status: 500 }
    );
  }

  const { error: responsesError } = await admin.from("responses").insert(
    responseRows.map((r) => ({
      session_id: session.id,
      ...r,
    }))
  );

  if (responsesError) {
    return NextResponse.json({ error: responsesError.message }, { status: 500 });
  }

  // Exposure tracking: increment times_administered (and times_correct
  // where applicable) for every item actually shown, so future sessions
  // can implement Conditional Randomesque exposure control. Best-effort —
  // an exposure-count miss shouldn't fail the whole save, the result is
  // already safely persisted above.
  for (const r of responseRows) {
    const { error: rpcError } = await admin.rpc("increment_item_exposure", {
      p_item_id: r.item_id,
      p_correct: r.is_correct,
    });
    if (rpcError) {
      console.error(`[api/sessions] exposure increment failed for ${r.item_id}:`, rpcError.message);
    }
  }
// Fire test_completed server-side, tied to the same correctness data we
  // just persisted. Server-side capture can't be lost to ad blockers the
  // way client events sometimes can.
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });

  posthogClient.capture({
    distinctId: body.posthog_distinct_id ?? userId ?? session.id,
    event: "test_completed",
    properties: {
      final_score: finalScore,
      final_theta: finalTheta,
      passed: finalScore >= TSIA2_PASSING,
      strand_breakdown: strandBreakdown,
      is_authenticated: userId !== null,
      max_items: body.max_items,
    },
  });

  await posthogClient.shutdown();
  return NextResponse.json({ session_id: session.id, final_score: finalScore }, { status: 201 });
}