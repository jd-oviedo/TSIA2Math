import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase-admin";
import { createClient as createServerClient } from "../../../lib/supabase-server";
import { safeLimit, gumuRateLimit } from "../../../lib/rate-limit";
import { gumuBodySchema, formatZodError } from "../../../lib/schemas";
import {
  askGumu,
  MAX_STUDENT_TURNS,
  type AnswerContext,
  type GumuTurn,
} from "../../../lib/gumu";
import { screenStudentMessage } from "../../../lib/crisis-screen";
import { CRISIS_STOP_COPY } from "../../../lib/crisis";
import { sendCrisisAlert, CRISIS_INBOX } from "../../../lib/email";

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

// How long an untouched session stays resumable before it is treated as walked
// away from.
//
// The collision path below exists for a double click or a stale tab, which are
// seconds to minutes apart. Thirty minutes preserves that completely, while
// making sure nothing genuinely old is ever resurrected mid-flow.
//
// WHY A THRESHOLD HERE RATHER THAN A SWEEP, and why that differs from the
// entitlement columns, which explicitly refuse one:
//
//   sql/entitlement_columns.sql says "NO EXPIRY SWEEP EXISTS, AND THE GATE DOES
//   NOT NEED ONE" because access is decided by comparing access_until to now()
//   at READ time. A sweep that never runs therefore cannot grant access it
//   should not: stale rows are harmless because nothing reads the stale field.
//
//   gumu_sessions is the opposite shape. gumu_sessions_one_active_per_item is a
//   partial unique index on status = 'active', evaluated at WRITE time against
//   stored status, so a row nobody ever closed keeps having an effect forever.
//   Stale state genuinely persists here.
//
// Same shape of problem, opposite conclusion. This is still not a cron: the
// close happens when someone next touches that item, which is the same read-time
// instinct applied to a write-time constraint. A session nobody returns to stays
// 'active' and harms nobody, because the only thing that index blocks is a
// second session on that same item for that same student.
const ABANDON_AFTER_MS = 30 * 60 * 1000;

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
  // `reason` used to exist only to pick a sentence for the teacher's
  // notification below, and was then discarded. It is recorded now, because it
  // is the difference between a student who was SHOWN the answer and one who
  // simply ran out of turns -- and because for a self-serve student with no
  // teacher, that notification is never written, so nothing recorded it at all.
  // See sql/gumu_sessions_resolution.sql.
  //
  // THE ERROR IS CHECKED. It was not, and a failed update here is the worst
  // shape of silent failure in this route: `status` stays 'active', so
  // gumu_sessions_one_active_per_item -- a partial unique index on exactly that
  // status -- then refuses every future session on this item for this student.
  // The reveal response still returns the answer and the teacher is still
  // notified, so the student is locked out of GUMU on that item forever and
  // nothing anywhere says so. Logged rather than thrown, for the same reason
  // the notification failure below is: the conversation has already concluded
  // correctly and should not error out over a bookkeeping write.
  const { error: resolveError } = await admin
    .from("gumu_sessions")
    .update({
      status: "resolved_flagged",
      resolution: reason,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", session.id);

  if (resolveError) {
    console.error(
      `gumu_sessions resolve failed (session ${session.id}, reason ${reason})`,
      resolveError
    );
  }

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

// Ends a session because the crisis screen fired, and tells a person.
//
// DELIBERATELY NOT resolveFlagged. That function's whole body is the two maths
// endings and the notification templated to "is stuck on", and whether teacher
// notification is appropriate at all is still open with a school counselor.
// Routing a crisis stop through it would prejudge that, and would file the
// session as a maths failure.
//
// NOTHING HERE MAY THROW INTO THE CALLER. The student is being shown a crisis
// line; a failed bookkeeping write or a failed email must not turn that into an
// error page. Every step is caught and logged on its own.
async function stopForSupport(
  admin: SupabaseAdmin,
  session: GumuSession,
  detectedBy: "classifier" | "lexical"
) {
  // A new STATUS, not a new resolution. resolution stays null, so
  // gumu_sessions_resolution_check is untouched: it already permits null, and
  // revealedItemsInSection releases a worked solution only on
  // resolved_flagged + student_gave_up, which a new status cannot match.
  //
  // If sql/gumu_ended_support.sql has not been run this update violates
  // gumu_sessions_status_check and fails. That is why it is checked and why
  // nothing below depends on it: the student still gets the resources.
  const { error: statusError } = await admin
    .from("gumu_sessions")
    .update({ status: "ended_support", resolved_at: new Date().toISOString() })
    .eq("id", session.id);

  if (statusError) {
    console.error(
      `[crisis] could not close session ${session.id} as ended_support. ` +
        `Has sql/gumu_ended_support.sql been run?`,
      statusError
    );
  }

  console.log(`[crisis] session ${session.id} stopped, detected by ${detectedBy}`);

  await notifyForSupport(admin, session);
}

// Immediate notification. Never a digest: a disclosure at 9pm would reach a
// teacher the next morning at best, which cannot serve a crisis.
//
// Two recipients, one behaviour. A student in a class has their teachers told;
// a self-serve student has juan@unpackmath.com told, because
// teacher_notifications.teacher_id is not-null and cannot represent them.
//
// The row is written AND the email is sent. The row alone reaches nobody:
// teacher_notifications is written in exactly one other place and read in none,
// with no dashboard listing despite an index built for one. The row is the
// durable record for when that UI exists; the email is what reaches a person
// today.
async function notifyForSupport(admin: SupabaseAdmin, session: GumuSession) {
  let studentEmail: string | null = null;
  try {
    const { data } = await admin
      .from("profiles")
      .select("email")
      .eq("id", session.student_id)
      .maybeSingle();
    studentEmail = (data as { email: string | null } | null)?.email ?? null;
  } catch (err) {
    console.error("[crisis] could not read student email", err);
  }

  // Every teacher whose live class this student is actively in. Not `.limit(1)`
  // as the maths notification does: that is fine for "who do I tell about a
  // stuck student" and wrong here, where picking one arbitrary class could tell
  // nobody. Archived classes are excluded, which the maths path forgets to do.
  const enrollments: { class_id: string; teacher_id: string }[] = [];
  try {
    const { data } = await admin
      .from("class_enrollments")
      .select("class_id, classes(id, teacher_id, archived_at)")
      .eq("student_id", session.student_id)
      .eq("status", "active");

    for (const row of data ?? []) {
      const embedded = (row as { classes: unknown }).classes;
      const cls = (Array.isArray(embedded) ? embedded[0] : embedded) as
        | { id: string; teacher_id: string; archived_at: string | null }
        | null
        | undefined;
      if (!cls?.teacher_id || cls.archived_at) continue;
      if (enrollments.some((e) => e.teacher_id === cls.teacher_id)) continue;
      enrollments.push({ class_id: cls.id, teacher_id: cls.teacher_id });
    }
  } catch (err) {
    console.error("[crisis] could not resolve the student's teachers", err);
  }

  if (enrollments.length === 0) {
    try {
      await sendCrisisAlert({
        toEmail: CRISIS_INBOX,
        studentEmail,
        studentId: session.student_id,
        topicId: session.topic_id,
        hasTeacher: false,
      });
    } catch (err) {
      console.error("[crisis] SELF-SERVE ALERT FAILED TO SEND", err);
    }
    return;
  }

  for (const { class_id, teacher_id } of enrollments) {
    const { error } = await admin.from("teacher_notifications").insert({
      teacher_id,
      student_id: session.student_id,
      class_id,
      gumu_session_id: session.id,
      topic_id: session.topic_id,
      misconception_tag: null,
      message: "A student may need support. A tutoring session was stopped and they were shown crisis resources.",
    });
    if (error) console.error("[crisis] teacher_notifications insert failed", error);

    let teacherEmail: string | null = null;
    try {
      const { data } = await admin
        .from("profiles")
        .select("email")
        .eq("id", teacher_id)
        .maybeSingle();
      teacherEmail = (data as { email: string | null } | null)?.email ?? null;
    } catch (err) {
      console.error("[crisis] could not read teacher email", err);
    }

    // Falling back to the crisis inbox rather than dropping it. A teacher with
    // no recorded email must not mean nobody hears about this.
    try {
      await sendCrisisAlert({
        toEmail: teacherEmail ?? CRISIS_INBOX,
        studentEmail,
        studentId: session.student_id,
        topicId: session.topic_id,
        hasTeacher: Boolean(teacherEmail),
      });
    } catch (err) {
      console.error("[crisis] TEACHER ALERT FAILED TO SEND", err);
    }
  }
}

export async function POST(req: Request) {
  // AUTH FIRST, THEN THE RATE LIMIT. The order is load-bearing and it used to be
  // the other way round.
  //
  // The limiter ran before this check, so an unauthenticated request consumed
  // budget and was then rejected 401 anyway. Keyed on IP, as it was, that meant
  // one anonymous flood could exhaust the GUMU allowance for every legitimate
  // student behind the same address -- a school NAT is one address, so the people
  // denied were a classroom of paying users who had done nothing.
  //
  // Nothing is spent before we know who is asking. getSession() decodes the
  // cookie locally rather than calling out, so rejecting an anonymous caller here
  // is cheap. Note middleware.ts already runs getUser() on this path for every
  // request, authenticated or not, so unauthenticated traffic was never metered
  // by this limiter in the first place and is no less metered now.
  const supabase = await createServerClient();
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  // No anonymous path, unlike the practice route which grades for everyone.
  if (!authSession) {
    return NextResponse.json({ error: "Sign in to use GUMU" }, { status: 401 });
  }

  const studentId = authSession.user.id;

  // Keyed on the student, not the IP. This route has always required a session,
  // so the IP keying was a leftover from the endpoints that do not, and it was
  // the thing actually breaking the shared-NAT case: thirty students in one room
  // shared one budget. Same reasoning as supportRateLimit, which already keys on
  // the signed-in user for the same reason.
  //
  // Runs before every model call in this route, including the classifier a future
  // screening layer will add, so a paid call cannot be driven faster than this.
  const limited = await safeLimit(gumuRateLimit, studentId);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Parsed after the two checks above, so an unauthenticated caller cannot make
  // us read and parse an arbitrary body.
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

    // Built once and called twice: the optimistic insert, and the retry after a
    // stale session has been closed out of the way. The lookup that sits between
    // them is paid only on a collision, so the ordinary start is still one write
    // and no read.
    const insertSession = () =>
      admin
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

    let { data: created, error: createError } = await insertSession();

    // The partial unique index allows one active session per item, so a double
    // click or a stale tab collides here rather than opening a second
    // conversation. Return the existing one instead of erroring.
    if (createError) {
      const { data: existing } = await admin
        .from("gumu_sessions")
        // turn_count, because the resume below has to report how many turns are
        // actually left rather than assuming a fresh session. created_at,
        // because a session old enough is abandoned rather than resumed.
        .select("id, turn_count, created_at")
        .eq("student_id", studentId)
        .eq("course_id", action.course_id)
        .eq("topic_id", action.topic_id)
        .eq("section", action.section)
        .eq("item_number", action.item_number)
        .eq("status", "active")
        .maybeSingle();

      // A session nobody has touched in ABANDON_AFTER_MS is closed rather than
      // resumed, and a fresh one opened in its place.
      //
      // Nothing else could ever close it. Every other path out of 'active'
      // requires the student to do one more thing: send a third message, click
      // the escape hatch, or answer the item correctly. Walking away is the
      // absence of an action, and nothing observed absences, so 'abandoned' sat
      // in the status constraint with no writer at all. This is that writer.
      //
      // Guarded on status = 'active' so two concurrent starts cannot both close
      // it, and so this can never overwrite a real ending that landed in
      // between.
      // Tracks whether the old row was actually closed, which decides what the
      // fallback below is allowed to do. If the abandon itself failed, the old
      // session is still live and resuming it is the correct degraded
      // behaviour; if it succeeded but the retry did not, resuming it would
      // hand back a session that is no longer active.
      let abandoned = false;

      if (existing && Date.now() - new Date(existing.created_at).getTime() > ABANDON_AFTER_MS) {
        const { error: abandonError } = await admin
          .from("gumu_sessions")
          .update({ status: "abandoned", resolved_at: new Date().toISOString() })
          .eq("id", existing.id)
          .eq("status", "active");

        if (abandonError) {
          console.error(`gumu_sessions abandon failed (session ${existing.id})`, abandonError);
        } else {
          abandoned = true;
          console.log(`gumu_sessions ${existing.id} abandoned, opening a fresh session`);
          // Reassigned, so everything below runs against the new row.
          ({ data: created, error: createError } = await insertSession());
        }
      }

      // Only still an error if the retry above did not happen or did not work.
      // A successful retry leaves createError null and falls out of this block
      // into the ordinary flow with a fresh session.
      if (createError) {
        if (existing && !abandoned) {
          const { data: transcript } = await admin
            .from("gumu_messages")
            .select("role, content")
            .eq("session_id", existing.id)
            .order("created_at");
          // THE REAL REMAINING COUNT, not the cap.
          //
          // This returned MAX_STUDENT_TURNS unconditionally, which is only true
          // for a session that has never been spoken to. Resuming one that had
          // already used two of its three turns told the student they had three,
          // and their very next message hit the cap and closed the conversation.
          // Wrong for the case this path was written for as well: a double click
          // mid-conversation resumes at the same wrong number.
          //
          // Clamped at zero. A session cannot normally still be active with its
          // turns spent, since the cap resolves it, but it can if that resolve
          // write failed -- the silent failure sql/gumu_sessions_resolution.sql
          // describes. Reporting a negative number to the client would be a
          // second bug on top of that one.
          return NextResponse.json({
            session_id: existing.id,
            messages: transcript ?? [],
            status: "active",
            turns_remaining: Math.max(0, MAX_STUDENT_TURNS - existing.turn_count),
            resumed: true,
          });
        }

        console.error("gumu_sessions insert failed", createError);
        return NextResponse.json({ error: "Could not start GUMU" }, { status: 500 });
      }
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

  // The columns GumuSession declares, named rather than starred: the row also
  // carries created_at and resolved_at, which nothing below reads.
  const { data: sessionRow, error: sessionError } = await admin
    .from("gumu_sessions")
    .select(
      "id, student_id, course_id, topic_id, section, item_number, original_selected_answer, misconception_tag, status, turn_count"
    )
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

  // ---- the crisis screen -------------------------------------------------
  //
  // BEFORE THE TUTOR AND BEFORE THE TRANSCRIPT. Both halves of that are the
  // point. askGumu is never called on a screened message, so there is no
  // Socratic follow-up to a disclosure, and the insert below is never reached,
  // so the message is not written to gumu_messages. Ordering, not a delete: a
  // write followed by a delete leaves the row in WAL and in backups, which is a
  // worse posture than never having written it.
  //
  // Placed after the ownership and status checks so only a live session the
  // caller owns is ever screened, and before the history read so a turn that is
  // about to stop does not pay for the transcript.
  //
  // THIS IS THE FLOOR, NOT THE FINISHED THING. The wording, whether a gentler
  // middle tier should exist, and whether notifying a teacher suppresses
  // disclosure are all still open with a school counselor. See
  // gumu-crisis-screen-design.md.
  const screen = await screenStudentMessage(action.message);

  if (screen.action === "unavailable") {
    // Neither detector could speak. The turn is refused rather than tutored
    // unscreened, and rather than showing crisis resources on what is an
    // infrastructure error. Same 503 the model outage path returns, which says
    // nothing about why. The student's turn is not consumed and their message
    // is not stored.
    return NextResponse.json({ error: "GUMU is unavailable right now" }, { status: 503 });
  }

  if (screen.action === "stop") {
    await stopForSupport(admin, gumuSession, screen.detectedBy);

    // No `message` field, on purpose. GumuChat appends `data.message` to the
    // transcript as a GUMU bubble unconditionally, so reusing that field would
    // render crisis resources in the tutor's voice as another turn in the
    // conversation. `stopped` is the discriminator the client branches on, and
    // omitting `message` means a client that forgets to branch renders nothing
    // rather than something wrong.
    return NextResponse.json({
      session_id: gumuSession.id,
      status: "ended_support",
      stopped: "support",
      copy: CRISIS_STOP_COPY,
      turns_remaining: 0,
    });
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
