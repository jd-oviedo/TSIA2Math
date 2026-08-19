import { NextResponse } from "next/server";
import { requireTeacher, profileGrants } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";
import { getItemsForTopic } from "../../../lib/worksheet-source";
import { selectItems, type Level } from "../../../lib/worksheet-select";

// Create and list worksheets.
//
// TWO GATES, NOT ONE. requireTeacher() answers "is this an entitled teacher",
// and profileGrants(..., 'worksheets') answers "does their plan include this
// feature". They are not the same question: capabilities.ts grants
// 'teacher-dashboard' and 'worksheets' separately, and a future plan could hold
// one without the other. Checking only the first is how a feature quietly ships
// to a tier that did not buy it.
//
// NO USAGE METERING. teacher-core and teacher-pro are capability-identical
// today and capabilities.ts deliberately declines to invent a quota, so there is
// no number to enforce and none is invented here. sql/ carries the migration if
// and when one is chosen.

const MAX_ITEMS = 200;
const MAX_TOPICS = 20;

type CreateBody = {
  title?: unknown;
  topics?: unknown;
  count?: unknown;
  levels?: unknown;
  include_quiz?: unknown;
};

const LEVELS: Level[] = ["Basic", "Proficient", "Advanced"];

export async function GET() {
  const profile = await requireTeacher();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!profileGrants(profile, "worksheets", "worksheets.GET")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("worksheets")
    .select("id, title, items, options, created_at")
    .eq("teacher_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    // The table may not exist yet -- sql/worksheets.sql is run by hand. An empty
    // index is the honest answer for a teacher with no worksheets, and a 500
    // here would take the whole page down on a pre-migration deploy.
    if (error.code === "42P01" || error.code === "PGRST205") {
      return NextResponse.json({ worksheets: [], stored: false });
    }
    console.error("[teacher/worksheets] list failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    worksheets: (data ?? []).map((w) => ({
      id: w.id,
      title: w.title,
      created_at: w.created_at,
      // The index needs the size, not the contents.
      item_count: Array.isArray(w.items) ? w.items.length : 0,
      topics: (w.options as { topics?: string[] } | null)?.topics ?? [],
    })),
    stored: true,
  });
}

export async function POST(request: Request) {
  const profile = await requireTeacher();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!profileGrants(profile, "worksheets", "worksheets.POST")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const topics = Array.isArray(body.topics)
    ? [...new Set(body.topics.filter((t): t is string => typeof t === "string"))]
    : [];
  const count = Number.isFinite(body.count) ? Math.floor(body.count as number) : 0;
  const levels = Array.isArray(body.levels)
    ? (body.levels.filter((l): l is Level => LEVELS.includes(l as Level)) as Level[])
    : [];
  const includeQuiz = body.include_quiz !== false;

  // Validated here as well as in the table's CHECK constraints. The constraint
  // is the backstop; this is what produces a message a teacher can act on
  // rather than a Postgres error string.
  if (!title || title.length > 120) {
    return NextResponse.json({ error: "A title of 1-120 characters is required." }, { status: 400 });
  }
  if (topics.length === 0 || topics.length > MAX_TOPICS) {
    return NextResponse.json({ error: `Choose between 1 and ${MAX_TOPICS} topics.` }, { status: 400 });
  }
  if (count < 1 || count > MAX_ITEMS) {
    return NextResponse.json({ error: `Choose between 1 and ${MAX_ITEMS} questions.` }, { status: 400 });
  }

  const courseId = "tsia2-math";

  // The seed is generated here and stored, not supplied by the client. It is
  // what makes the draw reproducible; letting the caller set it would let two
  // teachers deliberately produce identical worksheets, which is the opposite
  // of what the seed is for.
  const seed = Math.floor(Math.random() * 2 ** 31);

  // getItemsForTopic hides which backend answered. A templated topic returns
  // rolled instances and a static one returns authored items; nothing below
  // this line knows or cares.
  const pools = await Promise.all(
    topics.map(async (topic_id) => ({
      topic_id,
      candidates: await getItemsForTopic(courseId, topic_id, count, { seed }),
    })),
  );

  const { refs, shortfall, notes } = selectItems(pools, {
    count,
    levels,
    includeQuiz,
    seed,
  });

  if (refs.length === 0) {
    return NextResponse.json(
      {
        error:
          "No questions matched. The chosen topics have no items at that difficulty.",
        notes,
      },
      { status: 422 },
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("worksheets")
    .insert({
      teacher_id: profile.id,
      title,
      course_id: courseId,
      items: refs,
      options: { topics, count, levels, include_quiz: includeQuiz, seed },
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return NextResponse.json(
        { error: "Worksheets are not enabled yet. The database migration has not been run." },
        { status: 503 },
      );
    }
    console.error("[teacher/worksheets] insert failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // shortfall and notes travel with the 201 rather than failing the request. The
  // worksheet is real and printable; the teacher simply got fewer questions than
  // she asked for, and she is told why instead of counting them herself.
  return NextResponse.json({ id: data.id, delivered: refs.length, shortfall, notes }, { status: 201 });
}
