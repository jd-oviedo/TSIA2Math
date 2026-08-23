import { NextResponse } from "next/server";
import { requireTeacher, profileGrants } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase-admin";
import { getItemsForTopic } from "../../../lib/worksheet-source";
import { selectItems, type Level } from "../../../lib/worksheet-select";
import { consumeWorksheetQuota } from "../../../lib/worksheet-quota";

// Create and list worksheets.
//
// TWO GATES, NOT ONE. requireTeacher() answers "is this an entitled teacher",
// and profileGrants(..., 'worksheets') answers "does their plan include this
// feature". They are not the same question: capabilities.ts grants
// 'teacher-dashboard' and 'worksheets' separately, and a future plan could hold
// one without the other. Checking only the first is how a feature quietly ships
// to a tier that did not buy it.
//
// METERED, FOR EXACTLY ONE PLAN. teacher-core may create 15 worksheets per
// calendar month; every other plan is unlimited and never touches the counter.
// The number lives in capabilities.ts as WORKSHEET_QUOTA, not here and not in
// the migration, so it has one home.
//
// THIS IS THE ONLY PLACE A WORKSHEET ROW IS CREATED, which is what makes the
// meter enforceable at all. Every other access to the table in the codebase is a
// select or a delete, so there is one chokepoint and the consume sits on it.
// Previewing and regenerating cost nothing because nothing reaches the server
// until this route is called; reprinting costs nothing because /print and /key
// only read.
//
// THE METER IS NOT THE PAYWALL. requireTeacher() already refuses a lapsed
// teacher before the body is parsed, so the counter never stands between an
// unentitled user and a create. It only counts entitled ones.

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

  // SPENT IMMEDIATELY BEFORE THE INSERT, and the ordering is a real choice.
  // Consuming after a successful insert would let two creates fired together
  // both pass the check and land at 16; consuming first spends a credit if the
  // insert then fails. The insert is a validated write whose only realistic
  // failures are a missing table (answered as a 503 below) or an outage that
  // would have taken this RPC down too, so the window is small and it errs
  // toward the cap holding rather than leaking. See app/lib/worksheet-quota.ts.
  //
  // Nothing after this point may return early without either inserting or
  // logging the burned credit.
  let quota;
  try {
    quota = await consumeWorksheetQuota(profile.id, profile.plan);
  } catch (e) {
    console.error("[teacher/worksheets] quota check failed:", (e as Error).message);
    return NextResponse.json(
      { error: "Could not check your worksheet allowance. Please try again." },
      { status: 503 },
    );
  }

  if (!quota.allowed) {
    // 429 rather than 403. A 403 here would be indistinguishable from the two
    // gates above, which mean "you may not do this at all"; this means "not this
    // month". The body carries the numbers so the builder can render the upgrade
    // state rather than a generic error string.
    return NextResponse.json(
      {
        error: `You have created all ${quota.cap} worksheets included in Teacher Core this month.`,
        capped: true,
        used: quota.used,
        cap: quota.cap,
      },
      { status: 429 },
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
    // The credit is already spent and there is deliberately no refund path: one
    // write direction is what keeps the counter auditable, and a decrement is
    // the same door a create-delete-create loop would use. Logged with the
    // profile id so it can be corrected by hand, which is the rare case.
    if (!quota.unmetered) {
      console.error(
        `[teacher/worksheets] insert failed AFTER quota was spent for ${profile.id}; ` +
          `used is now ${quota.used} of ${quota.cap} and was not refunded.`,
      );
    }
    console.error("[teacher/worksheets] insert failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // shortfall and notes travel with the 201 rather than failing the request. The
  // worksheet is real and printable; the teacher simply got fewer questions than
  // she asked for, and she is told why instead of counting them herself.
  // used/cap travel with the 201 so the builder can update its indicator from
  // the same number the server just enforced, rather than re-reading it.
  return NextResponse.json(
    {
      id: data.id,
      delivered: refs.length,
      shortfall,
      notes,
      used: quota.unmetered ? null : quota.used,
      cap: quota.cap,
    },
    { status: 201 },
  );
}
