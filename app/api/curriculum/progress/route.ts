import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServerClient } from "../../../lib/supabase-server";
import { syncCompletionSnapshot } from "../../../lib/curriculum-progress";
import { safeLimit, curriculumPracticeRateLimit, getClientIp } from "../../../lib/rate-limit";
import { formatZodError } from "../../../lib/schemas";

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
  await syncCompletionSnapshot(session.user.id, course_id, topic_id, {
    lessonCompleted: true,
  });

  return NextResponse.json({ recorded: true });
}
