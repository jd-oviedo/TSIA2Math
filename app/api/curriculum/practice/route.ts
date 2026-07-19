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

  // Set when a wrong answer opens the door to GUMU. Also gates whether the
  // correct answer is returned at all -- see the response below.
  let gumuAvailable = false;

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

    // GUMU resolution path (a): a correct answer on an item with an open GUMU
    // session means the student worked their way back to it. The partial
    // unique index on gumu_sessions guarantees at most one active row here, so
    // there is nothing to disambiguate.
    if (isCorrect) {
      const { data: openSession } = await admin
        .from("gumu_sessions")
        .select("id, misconception_tag")
        .eq("student_id", studentId)
        .eq("course_id", course_id)
        .eq("topic_id", topic_id)
        .eq("section", section)
        .eq("item_number", item_number)
        .eq("status", "active")
        .maybeSingle();

      if (openSession) {
        const { error: resolveError } = await admin
          .from("gumu_sessions")
          .update({
            status: "resolved_retry_success",
            resolved_at: new Date().toISOString(),
          })
          .eq("id", openSession.id);

        if (resolveError) {
          console.error("gumu_sessions resolve failed", resolveError);
        }

        // Skipped when the item carries no tag -- QR.1.1's mini quiz grades
        // and resolves normally, it simply has no misconception to record.
        if (openSession.misconception_tag) {
          const { error: socraticError } = await admin.rpc("record_misconception", {
            p_student_id: studentId,
            p_misconception: openSession.misconception_tag,
            p_strand: topic.related_strand,
            p_source: "socratic",
          });

          if (socraticError) {
            console.error("record_misconception (socratic) failed", socraticError);
          }
        }
      }
    } else {
      gumuAvailable = true;
    }
  }

  // Deliberately minimal. The misconception slug is internal taxonomy and is
  // not returned: it means nothing to a student, and echoing it back would
  // put the tag map within reach of anyone probing option by option.
  //
  // correct_answer is withheld when GUMU is available, i.e. an authenticated
  // student got it wrong. GUMU's whole premise is guiding them to find the
  // error themselves, which is pointless if the answer is printed above the
  // chat panel. They get it from the "I'll just see the answer" escape hatch
  // or once the session resolves. Anonymous users are unaffected -- there is
  // no GUMU for them, so nothing to undermine.
  return NextResponse.json({
    isCorrect,
    correct_answer: gumuAvailable ? null : item.correct_answer,
    gumu_available: gumuAvailable,
  });
}
