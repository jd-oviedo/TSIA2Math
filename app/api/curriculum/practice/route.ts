import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase-admin";
import { createClient as createServerClient } from "../../../lib/supabase-server";
import {
  safeLimit,
  curriculumPracticeRateLimit,
  getClientIp,
} from "../../../lib/rate-limit";
import {
  curriculumPracticeBodySchema,
  formatZodError,
} from "../../../lib/schemas";

// Grades one curriculum practice answer.
//
// Grading is server-side for the same reason /api/items/reveal is: the correct
// answer and the misconception tags live in practice_items, which is
// answer-bearing and never reaches the browser. The client sends which option
// was picked and gets back only whether it was right.
//
// Anonymous students are graded but nothing is recorded -- curriculum_attempts
// and student_misconceptions both key on a real auth.users id. The
// authenticated check mirrors reveal.ts exactly.

type PracticeItem = {
  item_number: number;
  format: "multiple_choice" | "free_response";
  correct_answer: string | null;
  misconception_tag: Record<string, string>;
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limited = await safeLimit(curriculumPracticeRateLimit, ip);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body" }, { status: 400 });
  }

  const parsed = curriculumPracticeBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const { course_id, topic_id, section, item_number, selected_answer } = parsed.data;

  // Session check -- anonymous users are graded, but nothing is persisted.
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Admin client to read answer-bearing fields.
  const admin = createAdminClient();
  const { data: topic, error } = await admin
    .from("curriculum_topics")
    .select("practice_items, related_strand")
    .eq("course_id", course_id)
    .eq("topic_id", topic_id)
    .single();

  if (error || !topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const items: PracticeItem[] = topic.practice_items?.[section]?.items ?? [];
  const item = items.find((i) => i.item_number === item_number);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // A free-response item has no letter to grade against. Reaching here means
  // the client rendered something it should not have, so it is a bad request
  // rather than a server error.
  if (item.format !== "multiple_choice" || !item.correct_answer) {
    return NextResponse.json(
      { error: "Item is not multiple choice" },
      { status: 400 }
    );
  }

  const isCorrect = item.correct_answer === selected_answer;

  // Null when correct, and also when the option carries no tag -- QR.1.1 has
  // no distractor_logic blocks, so its items grade fine but diagnose nothing.
  const misconception = isCorrect
    ? null
    : item.misconception_tag?.[selected_answer] ?? null;

  if (session) {
    const studentId = session.user.id;

    // Append-only: a retry of the same item inserts another row on purpose,
    // so progress tracking can see the sequence of attempts.
    const { error: attemptError } = await admin.from("curriculum_attempts").insert({
      student_id: studentId,
      course_id,
      topic_id,
      section,
      item_number,
      selected_answer,
      is_correct: isCorrect,
      misconception,
    });

    if (attemptError) {
      // The student is waiting on a grade that is already computed and
      // correct. Losing the analytics row is worse than silent, so it is
      // logged, but it is not worth failing the answer they just submitted.
      console.error("curriculum_attempts insert failed", attemptError);
    }

    if (misconception) {
      const { error: rpcError } = await admin.rpc("record_misconception", {
        p_student_id: studentId,
        p_misconception: misconception,
        p_strand: topic.related_strand,
        p_source: "curriculum",
      });

      if (rpcError) {
        console.error("record_misconception failed", rpcError);
      }
    }
  }

  // Deliberately minimal. The misconception slug is internal taxonomy and is
  // not returned: it means nothing to a student, and echoing it back would
  // put the tag map within reach of anyone probing option by option.
  return NextResponse.json({
    isCorrect,
    correct_answer: item.correct_answer,
  });
}
