import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServerClient } from "../../../lib/supabase-server";
import { syncCompletionSnapshot } from "../../../lib/curriculum-progress";
import { safeLimit, curriculumPracticeRateLimit, getClientIp } from "../../../lib/rate-limit";
import { formatZodError } from "../../../lib/schemas";
import { allowsTopic } from "../../../lib/capabilities";
import { resolveCourseAccess } from "../../../lib/course-access";

// Records the one piece of gate state that cannot be derived from anywhere
// else: that a student reached the end of a topic's guided notes.
//
// Practice and quiz progress is not accepted here. Those come from grading in
// /api/curriculum/practice, which is server-side precisely so a client cannot
// tell the server it got something right. Reading to the bottom of a page is
// the only gate where the browser is the sole witness, and the worst a forged
// call can do is let a student skip reading notes that are open to them anyway.

const bodySchema = z.object({
  action: z.literal("lesson_complete"),
  course_id: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  topic_id: z.string().min(1).max(50).regex(/^[A-Za-z0-9.]+$/),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limited = await safeLimit(curriculumPracticeRateLimit, ip);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  // Anonymous visitors are not an error. They just have nowhere to record to,
  // and the gate has already opened in their browser.
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ recorded: false });
  }

  const { course_id, topic_id } = parsed.data;

  // THE CAPABILITY GATE THIS ROUTE SHIPPED WITHOUT, and it is a real fix rather
  // than scaffolding for the preview check below.
  //
  // Every sibling that touches curriculum state resolves access and asks the
  // shared predicate: the page tree at course/layout.tsx:62 and the grader at
  // api/curriculum/practice/route.ts:78. This route asked nothing at all, so any
  // signed-in account could stamp lesson_completed_at against any course_id and
  // topic_id it could name, including all 96 topics its plan does not open.
  //
  // The worst a forged call can do is still small, and the comment at the top of
  // this file says so: reading to the bottom of a page is the one gate where the
  // browser is the only witness. But "small" is not the same as "checked", and
  // the identical pair used by every neighbour costs one cached profile read.
  //
  // ORDERED AFTER THE ANONYMOUS BRANCH ABOVE, DELIBERATELY. allowsTopic denies an
  // anonymous caller outright (capabilities.ts:433), so hoisting this would turn
  // the documented `200 {recorded:false}` into a 403 and change a behaviour this
  // change was not asked to touch.
  const access = await resolveCourseAccess();
  if (!allowsTopic(access, "curriculum", course_id, topic_id)) {
    return NextResponse.json({ error: "Not available on your plan" }, { status: 403 });
  }

  // PREVIEW MODE. A teacher reached this lesson through the second door
  // (course-access.ts:162) to see what they are assigning, so reading it must not
  // stamp lesson_completed_at on their own curriculum_completion row.
  //
  // This is the lesson half of the same cut made in the grader, which gates the
  // other four learner writes on the same flag. It matters on its own because
  // this write is the ONLY record that a lesson was read: curriculum_attempts
  // holds answers, so nothing else would carry a teacher's stamp back out.
  //
  // Reported as `recorded: false`, the same shape the anonymous branch returns,
  // because it is the same fact: the gate opened in their browser and nothing was
  // written. LessonBody.tsx:133 fires this and never reads the body, so no client
  // has to learn a new state.
  if (access.viaTeacher) {
    return NextResponse.json({ recorded: false });
  }

  await syncCompletionSnapshot(session.user.id, course_id, topic_id, {
    lessonCompleted: true,
  });

  return NextResponse.json({ recorded: true });
}
