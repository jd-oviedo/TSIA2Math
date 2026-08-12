import { PostHog } from "posthog-node";
import { NextResponse } from "next/server";
import { createAdminClient } from "../../lib/supabase-admin";
import { createClient as createServerClient } from "../../lib/supabase-server";
import { sessionsRateLimit, getClientIp, rateLimitHeaders, safeLimit } from "../../lib/rate-limit";
import { sessionsBodySchema, formatZodError } from "../../lib/schemas";
import {
  STARTING_THETA,
  STARTING_DIFFICULTY,
  TIER_B,
  updateTheta,
  thetaToScore,
  TSIA2_PASSING,
} from "../../adaptive-test/engine";
import type { Item, ProficiencyLevel, Strand } from "../../adaptive-test/type";

// The source string passed to record_misconception() for diagnostic evidence.
//
// This is load-bearing. record_misconception() branches on the literal
// 'socratic' to award high confidence immediately; every other value walks the
// ladder (low, medium at two hits, high at three). Passing 'socratic' from here
// -- by typo, or by a refactor that copies the curriculum call site -- would
// fast-track weak 4-option-multiple-choice evidence to the confidence level
// that surfaces a misconception to a parent.
//
// The database does catch an *unknown* source. sql/gumu_tables.sql section 4 is
// applied in production, confirmed by direct query 2026-08-12: the function
// raises on any p_source outside ('cat', 'curriculum', 'socratic'), and
// student_misconceptions carries CHECK constraints on both the sources array
// and the confidence vocabulary.
//
// What it does not catch is a *valid* value used in the wrong place: 'socratic'
// from this route passes every constraint and silently changes the ladder. That
// is the failure this constant exists to make auditable -- one named place,
// rather than a literal at the call site.
const CAT_MISCONCEPTION_SOURCE = "cat" as const;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success, reset } = await safeLimit(sessionsRateLimit, ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: rateLimitHeaders(reset) }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = sessionsBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const body = parsed.data;

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
    .select("item_id, correct_answer, primary_strand, proficiency_level, misconception_tag")
    .in("item_id", itemIds);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const itemMap = new Map <
    string,
    Pick<
      Item,
      | "item_id"
      | "correct_answer"
      | "primary_strand"
      | "proficiency_level"
      | "misconception_tag"
    >
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
      // sessions.teacher_id is deliberately not written. It used to be set to
      // userId -- the test-taker's own id in a column named for their teacher.
      // No query reads it: the roster route filters on user_id and says so
      // explicitly. Two RLS policies do read it, and both are broken by this
      // very data -- `teacher_id = auth.uid()` only ever matched the student
      // themselves, so neither has shown a teacher anything. Teacher access
      // comes from the service-role routes under app/api/teacher/ instead.
      // Leaving the column null changes nothing for either policy. The column
      // is nullable; sql/sessions_drop_teacher_id.sql retires it and those two
      // policies together, by name and not by CASCADE.
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
// Audit log: record the completed test submission
  await admin.from("audit_log").insert({
    user_id: userId,
    action: "test_completed",
    table_name: "sessions",
    record_id: session.id,
    metadata: {
      final_score: finalScore,
      passed: finalScore >= TSIA2_PASSING,
      strand_breakdown: strandBreakdown,
      item_count: responseRows.length,
    },
  });
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

  // Misconception accumulation for CAT-sourced evidence. Same RPC, same
  // confidence ladder as the curriculum path (app/api/curriculum/practice),
  // so a slug hit in the diagnostic and the same slug hit in curriculum
  // practice land on one student_misconceptions row and compound.
  //
  // Recorded here rather than in /api/items/reveal on purpose. Reveal is
  // per-item, can be called more than once for the same answer, and serves
  // anonymous test-takers; recording there would double-count and would fire
  // without an auth id. This route is the single place correctness is
  // re-derived server-side from the bank and persisted.
  //
  // Source is 'cat' and must stay 'cat': the ladder gives Socratic hits an
  // immediate jump to high confidence, and CAT evidence is weak enough
  // (4-option multiple choice, 25% guess rate) that it has to earn high the
  // slow way -- low, medium at 2 hits, high at 3. See the note above
  // CAT_MISCONCEPTION_SOURCE.
  //
  // Anonymous sessions are skipped: student_misconceptions.student_id is a
  // foreign key onto auth.users, so there is nothing to attribute the hit to.
  // Best-effort, like exposure above -- the session is already saved, and
  // losing an accumulation row must not fail the submission.
  if (userId) {
    for (const r of responseRows) {
      if (r.is_correct) continue;
      const item = itemMap.get(r.item_id);
      const tag = item?.misconception_tag?.[r.selected_answer];
      // No tag means the item predates tagging, or the option is untagged.
      // Nothing to record; the response row itself is still persisted.
      if (!tag) continue;

      const { error: mcError } = await admin.rpc("record_misconception", {
        p_student_id: userId,
        p_misconception: tag,
        p_strand: item!.primary_strand,
        p_source: CAT_MISCONCEPTION_SOURCE,
      });
      if (mcError) {
        console.error(
          `[api/sessions] record_misconception failed for ${r.item_id}/${r.selected_answer}:`,
          mcError.message
        );
      }
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