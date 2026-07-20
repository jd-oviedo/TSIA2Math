import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase-admin";
import { createClient as createServerClient } from "../../../lib/supabase-server";
import { safeLimit, gumuRateLimit, getClientIp } from "../../../lib/rate-limit";
import { gumuBodySchema, formatZodError } from "../../../lib/schemas";
import {
  askGumu,
  MAX_STUDENT_TURNS,
  type AnswerContext,
  type GumuTurn,
} from "../../../lib/gumu";

// GUMU — the Socratic tutor conversation endpoint.
//
// Authenticated students only, with no anonymous path: a session writes to
// gumu_sessions, may call record_misconception, and may notify a real teacher,
// all of which need a real auth.users id.
//
// The route owns turn counting and every state transition. The model is asked
// for one thing per call -- the next message -- and is never asked to track
// turns, decide when to stop, or judge its own output.

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

type PracticeItem = {
  item_number: number;
  format: string;
  stem: string;
  choices: Record<string, string>;
  correct_answer: string | null;
  misconception_tag: Record<string, string>;
};

type GumuSession = {
  id: string;
  student_id: string;
  course_id: string;
  topic_id: string;
  section: "practice" | "mini_quiz";
  item_number: number;
  original_selected_answer: string;
  misconception_tag: string | null;
  status: string;
  turn_count: number;
};

async function loadItem(
  admin: SupabaseAdmin,
  courseId: string,
  topicId: string,
  section: string,
  itemNumber: number
): Promise<{ item: PracticeItem; strand: string } | null> {
  const { data: topic, error } = await admin
    .from("curriculum_topics")
    .select("practice_items, related_strand")
    .eq("course_id", courseId)
    .eq("topic_id", topicId)
    .single();

  if (error || !topic) return null;

  const items: PracticeItem[] = topic.practice_items?.[section]?.items ?? [];
  const item = items.find((i) => i.item_number === itemNumber);
  if (!item || item.format !== "multiple_choice" || !item.correct_answer) return null;

  return { item, strand: topic.related_strand };
}

// Marks a session resolved and, for the flagged paths, alerts the student's
// teacher. Notification failures are logged rather than surfaced: the student's
// conversation has already concluded correctly and should not error out
// because a downstream alert could not be written.
async function resolveFlagged(
  admin: SupabaseAdmin,
  session: GumuSession,
  reason: "turn_cap" | "student_gave_up"
) {
  await admin
    .from("gumu_sessions")
    .update({ status: "resolved_flagged", resolved_at: new Date().toISOString() })
    .eq("id", session.id);

  // The teacher is whoever owns the class the student is actively enrolled in.
  // A student in no class produces no notification, which is expected, not an
  // error -- self-serve students have no teacher to alert.
  const { data: enrollment } = await admin
    .from("class_enrollments")
    .select("class_id, classes(id, teacher_id)")
    .eq("student_id", session.student_id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  // PostgREST returns an embedded relation as an array even on a to-one join.
  const classes = (enrollment?.classes ?? []) as unknown as {
    id: string;
    teacher_id: string;
  }[];
  const cls = Array.isArray(classes) ? classes[0] : classes;
  if (!cls?.teacher_id) return;

  const detail = session.misconception_tag
    ? `is stuck on ${session.misconception_tag}`
    : `is stuck on ${session.topic_id} question ${session.item_number}`;
  const summary =
    reason === "turn_cap"
      ? `A student ${detail} — GUMU could not resolve it.`
      : `A student ${detail} — they asked to skip to the answer.`;

  const { error } = await admin.from("teacher_notifications").insert({
    teacher_id: cls.teacher_id,
    student_id: session.student_id,
    class_id: cls.id,
    gumu_session_id: session.id,
    topic_id: session.topic_id,
    misconception_tag: session.misconception_tag,
    message: summary,
  });

  if (error) console.error("teacher_notifications insert failed", error);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limited = await safeLimit(gumuRateLimit, ip);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body" }, { status: 400 });
  }

  const parsed = gumuBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  // No anonymous path, unlike the practice route which grades for everyone.
  const supabase = await createServerClient();
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  if (!authSession) {
    return NextResponse.json({ error: "Sign in to use GUMU" }, { status: 401 });
  }

  const studentId = authSession.user.id;
  const admin = createAdminClient();
  const action = parsed.data;

  // --- start ---------------------------------------------------------------

  if (action.action === "start") {
    const loaded = await loadItem(
      admin,
      action.course_id,
      action.topic_id,
      action.section,
      action.item_number
    );
    if (!loaded) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const { item } = loaded;
    if (item.correct_answer === action.selected_answer) {
      return NextResponse.json(
        { error: "That answer was correct — nothing to work through" },
        { status: 400 }
      );
    }

    // Null when the item carries no tag (QR.1.1's mini quiz). GUMU still runs;
    // there is simply no misconception to record if the retry succeeds.
    const misconceptionTag = item.misconception_tag?.[action.selected_answer] ?? null;

    const { data: created, error: createError } = await admin
      .from("gumu_sessions")
      .insert({
        student_id: studentId,
        course_id: action.course_id,
        topic_id: action.topic_id,
        section: action.section,
        item_number: action.item_number,
        original_selected_answer: action.selected_answer,
        misconception_tag: misconceptionTag,
      })
      .select()
      .single();

    // The partial unique index allows one active session per item, so a double
    // click or a stale tab collides here rather than opening a second
    // conversation. Return the existing one instead of erroring.
    if (createError) {
      const { data: existing } = await admin
        .from("gumu_sessions")
        .select("id")
        .eq("student_id", studentId)
        .eq("course_id", action.course_id)
        .eq("topic_id", action.topic_id)
        .eq("section", action.section)
        .eq("item_number", action.item_number)
        .eq("status", "active")
        .maybeSingle();

      if (existing) {
        const { data: transcript } = await admin
          .from("gumu_messages")
          .select("role, content")
          .eq("session_id", existing.id)
          .order("created_at");
        return NextResponse.json({
          session_id: existing.id,
          messages: transcript ?? [],
          status: "active",
          turns_remaining: MAX_STUDENT_TURNS,
          resumed: true,
        });
      }

      console.error("gumu_sessions insert failed", createError);
      return NextResponse.json({ error: "Could not start GUMU" }, { status: 500 });
    }

    const answerContext: AnswerContext = {
      correctAnswer: item.correct_answer!,
      answerText: item.choices[item.correct_answer!] ?? "",
      misconceptionTag,
    };

    // The opening turn is framed as the student's move so the model has
    // something to respond to. It is not stored as a student message -- the
    // student has not said anything yet.
    const opening: GumuTurn = {
      role: "student",
      content:
        `Question: ${item.stem}\n` +
        Object.entries(item.choices)
          .map(([letter, text]) => `${letter}) ${text}`)
          .join("\n") +
        `\n\nI answered ${action.selected_answer}. Help me figure out where I went wrong.`,
    };

    let result;
    try {
      result = await askGumu({ history: [opening], isFinalTurn: false, answerContext });
    } catch (err) {
      console.error("GUMU model call failed", err);
      await admin.from("gumu_sessions").delete().eq("id", created.id);
      return NextResponse.json({ error: "GUMU is unavailable right now" }, { status: 503 });
    }

    if (result.leaked) {
      console.error("GUMU leak blocked", {
        session_id: created.id,
        reason: result.leaked,
        used_fallback: result.usedFallback,
      });
    }

    await admin.from("gumu_messages").insert({
      session_id: created.id,
      role: "gumu",
      content: result.reply.message,
    });

    return NextResponse.json({
      session_id: created.id,
      message: result.reply.message,
      status: "active",
      turns_remaining: MAX_STUDENT_TURNS,
    });
  }

  // --- message / reveal ----------------------------------------------------

  const { data: sessionRow, error: sessionError } = await admin
    .from("gumu_sessions")
    .select("*")
    .eq("id", action.session_id)
    .eq("student_id", studentId)
    .single();

  if (sessionError || !sessionRow) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const gumuSession = sessionRow as GumuSession;

  const loaded = await loadItem(
    admin,
    gumuSession.course_id,
    gumuSession.topic_id,
    gumuSession.section,
    gumuSession.item_number
  );
  if (!loaded) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const { item } = loaded;
  const answerContext: AnswerContext = {
    correctAnswer: item.correct_answer!,
    answerText: item.choices[item.correct_answer!] ?? "",
    misconceptionTag: gumuSession.misconception_tag,
  };

  // The escape hatch. Available at any point, never blocked, including on a
  // session that has already resolved -- a student re-opening the panel to see
  // the answer should always get it.
  if (action.action === "reveal") {
    if (gumuSession.status === "active") {
      await resolveFlagged(admin, gumuSession, "student_gave_up");
    }
    return NextResponse.json({
      session_id: gumuSession.id,
      status: "resolved_flagged",
      correct_answer: item.correct_answer,
      turns_remaining: 0,
    });
  }

  if (gumuSession.status !== "active") {
    return NextResponse.json(
      { error: "This GUMU session has already finished" },
      { status: 409 }
    );
  }

  const { data: history } = await admin
    .from("gumu_messages")
    .select("role, content")
    .eq("session_id", gumuSession.id)
    .order("created_at");

  await admin.from("gumu_messages").insert({
    session_id: gumuSession.id,
    role: "student",
    content: action.message,
  });

  const turnCount = gumuSession.turn_count + 1;
  const isFinalTurn = turnCount >= MAX_STUDENT_TURNS;

  const modelHistory: GumuTurn[] = [
    ...((history ?? []) as GumuTurn[]),
    { role: "student", content: action.message },
  ];

  let result;
  try {
    result = await askGumu({ history: modelHistory, isFinalTurn, answerContext });
  } catch (err) {
    console.error("GUMU model call failed", err);
    return NextResponse.json({ error: "GUMU is unavailable right now" }, { status: 503 });
  }

  if (result.leaked) {
    console.error("GUMU leak blocked", {
      session_id: gumuSession.id,
      turn: turnCount,
      final_turn: isFinalTurn,
      reason: result.leaked,
      used_fallback: result.usedFallback,
    });
  }

  await admin.from("gumu_messages").insert({
    session_id: gumuSession.id,
    role: "gumu",
    content: result.reply.message,
  });

  await admin
    .from("gumu_sessions")
    .update({ turn_count: turnCount })
    .eq("id", gumuSession.id);

  if (isFinalTurn) {
    await resolveFlagged(admin, { ...gumuSession, turn_count: turnCount }, "turn_cap");
  }

  // found_own_mistake never resolves the session on its own. Resolution comes
  // from the student actually re-answering the item correctly, which the
  // practice route observes -- saying "oh, I see it" is not the same as
  // demonstrating it.
  return NextResponse.json({
    session_id: gumuSession.id,
    message: result.reply.message,
    status: isFinalTurn ? "resolved_flagged" : "active",
    found_own_mistake: result.reply.found_own_mistake,
    turns_remaining: Math.max(0, MAX_STUDENT_TURNS - turnCount),
  });
}
