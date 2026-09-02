import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTeacher } from "../../../../lib/auth";
import { createAdminClient } from "../../../../lib/supabase-admin";
import { bulkProvisionSchema, formatZodError } from "../../../../lib/schemas";
import { bulkProvisionRateLimit, rateLimitHeaders, safeLimit } from "../../../../lib/rate-limit";
import { provisionStudent } from "../../../../lib/student-provision";
import type { BulkRowResult, BulkSummary } from "../../../../lib/roster-results";

// "Add roster" -- one pasted class, one request, one account per line.
//
// A THIN LOOP OVER provisionStudent AND NOTHING ELSE. The hard parts already
// exist and are tested: the lookup that must not become a mint, the createUser
// race folded into "existing", the 23505 enrolment conflict resolved to success.
// This file adds no provisioning logic. What it owns is who may run it, how much
// of it they may run, and how thirty independent outcomes get reported without
// any one of them being able to sink the other twenty-nine.
//
// ─── Per-row outcomes are DATA, never HTTP status ────────────────────────────
//
// The single-add route answers own-account with 400 and failed with 500
// (provision/route.ts:80-89), which is right when the request IS one student. In
// a batch it would be a disaster: one teacher who pasted their own address into
// row 12 would turn a successful mint of 34 accounts into a 400, and the browser
// would have to reverse engineer error strings to find out which rows landed.
// So the only non-200 answers here are the batch-level gates below. Once the
// loop starts, every row reports itself and the response is a 200 carrying
// thirty verdicts.
//
// ─── Why the gate order differs from the single-add route ────────────────────
//
// That route charges its limiter BEFORE parsing the body, deliberately, so that
// malformed spam still costs an attacker their budget. Here the charge is one
// token per student, which cannot be known until the body has been read. The
// order is therefore teacher, body, limit, ownership -- and the property the
// original order was protecting is kept by charging a single token on the way
// out of a malformed request. An authenticated teacher throwing junk at this
// still runs out after 300 attempts.

// The loop is serial and each row costs a paged directory lookup plus an account
// creation plus an insert. Forty rows is comfortably inside this; the ceiling is
// stated rather than inherited because nothing else in the repo sets one, and
// the failure it prevents is the worst one this endpoint has: a request killed
// mid-loop has already minted accounts whose codes no longer exist anywhere.
export const maxDuration = 300;

// THE ROW AND SUMMARY SHAPES LIVE IN lib/roster-results.ts, not here, because
// the browser has to agree with this file about them exactly. That module also
// owns how a row is allowed to be DISPLAYED, which is what keeps the one case
// this route can report but cannot enforce -- a code minted for a student who is
// not in the class -- from being rendered as a plain success.

export async function POST(req: Request) {
  const profile = await requireTeacher();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // One token, so a malformed body is not free. Deliberately not awaited for its
  // verdict: this is a charge, not a gate, and the 400 below is the answer
  // either way.
  async function chargeOne() {
    await safeLimit(bulkProvisionRateLimit, profile.id);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    await chargeOne();
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let parsed: z.infer<typeof bulkProvisionSchema>;
  try {
    parsed = bulkProvisionSchema.parse(body);
  } catch (err) {
    await chargeOne();
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: formatZodError(err) }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // DEDUPED AGAIN HERE, though the paste preview already refuses a duplicate
  // before the Add button unlocks. Two addresses that differ only in case are
  // one account to provisionStudent, which lowercases before it looks anything
  // up (student-provision.ts:101), and sending the same student twice in one
  // batch would mint once and then report the second copy as a pre-existing
  // account with no code -- which reads, in a results table, exactly like a
  // student who already had one. Dropped rows are REPORTED rather than removed,
  // so the response still accounts for every line the teacher sent.
  const seen = new Set<string>();
  const toProvision: { row: (typeof parsed.students)[number]; duplicate: boolean }[] =
    parsed.students.map((row) => {
      const key = row.email.trim().toLowerCase();
      const duplicate = seen.has(key);
      seen.add(key);
      return { row, duplicate };
    });

  const chargeable = toProvision.filter((r) => !r.duplicate).length;
  const { success, reset } = await safeLimit(
    bulkProvisionRateLimit,
    profile.id,
    Math.max(1, chargeable)
  );
  if (!success) {
    // Refused WHOLE and nothing was minted. The sliding window does not spend a
    // charge it rejects, so the teacher can retry the same paste intact once the
    // window moves rather than having to work out which half went through.
    return NextResponse.json(
      {
        error:
          "That is more students than can be added in one hour. Wait a little while, then paste the rest.",
      },
      { status: 429, headers: rateLimitHeaders(reset) }
    );
  }

  const admin = createAdminClient();

  // Identical to the single-add route (provision/route.ts:61-70) and to the
  // invite route: the class must exist AND belong to the caller, and a class
  // somebody else owns is reported as missing so the response cannot be used to
  // confirm that their class id is real. Checked ONCE for the batch rather than
  // once per row, which is most of the point of doing this server-side.
  const { data: cls, error: clsError } = await admin
    .from("classes")
    .select("id")
    .eq("id", parsed.class_id)
    .eq("teacher_id", profile.id)
    .single();

  if (clsError || !cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const results: BulkRowResult[] = [];

  for (const { row, duplicate } of toProvision) {
    if (duplicate) {
      results.push({
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email.trim().toLowerCase(),
        outcome: "duplicate",
        code: null,
        enrolment: null,
        error: "This email appears more than once in the roster.",
      });
      continue;
    }

    // EVERY ROW IS WRAPPED, and this is the most important line in the file.
    // provisionStudent resolves its own known failures into a "failed" result,
    // but an unexpected throw -- a network fault against GoTrue, a client that
    // was constructed wrong -- would otherwise escape the loop and 500 the
    // request. Every code minted before that row would cease to exist at the
    // moment the response was discarded. One row's accident must cost that row.
    try {
      const r = await provisionStudent(admin, {
        classId: parsed.class_id,
        teacherId: profile.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
      });
      results.push({
        first_name: row.first_name,
        last_name: row.last_name,
        email: r.email,
        outcome: r.outcome,
        code: r.code,
        enrolment: r.enrolment,
        error: r.error,
      });
    } catch (err) {
      console.error(
        "[provision-bulk] row threw:",
        err instanceof Error ? err.message : err
      );
      results.push({
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email.trim().toLowerCase(),
        outcome: "failed",
        code: null,
        enrolment: null,
        error: "Something went wrong adding this student. Nothing was created for this row.",
      });
    }
  }

  const created = results.filter((r) => r.outcome === "created");

  const summary: BulkSummary = {
    total: results.length,
    created: created.length,
    existing: results.filter((r) => r.outcome === "existing").length,
    own_account: results.filter((r) => r.outcome === "own-account").length,
    duplicate: results.filter((r) => r.outcome === "duplicate").length,
    failed: results.filter((r) => r.outcome === "failed").length,
    // COUNTED SEPARATELY because it is the one failure a results table can
    // hide. These rows have a code and are NOT in the class: the account is
    // real, the student can sign in, and they will not see the work. Read from
    // `enrolment` rather than from the outcome word precisely because the
    // outcome word says "created", which is true and is not the whole truth.
    // See student-provision.ts:153-157 for why the code still comes back here.
    created_not_enrolled: created.filter((r) => r.enrolment === "failed").length,
  };

  return NextResponse.json({ results, summary });
}
