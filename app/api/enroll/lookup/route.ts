import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase-admin";
import { displayName } from "../../../lib/auth";
import {
  checkJoinCode,
  JOIN_COOKIE,
  JOIN_COOKIE_OPTIONS,
} from "../../../lib/join-code";
import {
  getClientIp,
  joinLookupMissRateLimit,
  joinLookupRateLimit,
  rateLimitHeaders,
  safeLimit,
} from "../../../lib/rate-limit";

// The pre-auth half of joining a class: "is this code real, and whose class is
// it?" -- answered before the student has signed in, so they can see what they
// are joining before they hand over a Google account.
//
// LOOKUP ONLY. THIS ROUTE NEVER WRITES TO THE DATABASE. It reads `classes`, it
// reads one auth user for a display name, and it sets a cookie. The enrolment
// itself happens in app/auth/callback, after authentication, from the cookie --
// never from anything the client sends. The code in the request body is a
// question, not an instruction.
//
// UNAUTHENTICATED BY NECESSITY, which is the whole risk here: it turns a guessed
// six-character string into a teacher's name. The compensating controls are the
// two IP-keyed limiters below and the size of the keyspace (31^6, about 887
// million). See app/lib/rate-limit.ts for how the two thresholds were sized and
// why a per-code counter is not among them.

export const runtime = "nodejs";

type LookupFailure =
  | "invalid"
  | "excluded"
  | "not-found"
  | "rate-limited"
  | "unavailable";

function fail(reason: LookupFailure, status: number, headers?: HeadersInit) {
  return NextResponse.json({ ok: false, reason }, { status, headers });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // Volume first, before the body is even parsed, so a flood costs as little as
  // possible. Fails open on a Redis outage, like every other limiter here.
  const volume = await safeLimit(joinLookupRateLimit, ip);
  if (!volume.success) {
    return fail("rate-limited", 429, rateLimitHeaders(volume.reset));
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("invalid", 400);
  }

  const parsed = checkJoinCode(
    typeof body === "object" && body !== null ? (body as { code?: unknown }).code : undefined
  );

  // A MALFORMED CODE IS NOT A MISS, and the distinction is deliberate. A code
  // containing O or 1 cannot match any class -- those glyphs are not in the
  // alphabet -- so it is a typo, not a guess. Charging it against the miss
  // budget would let a student who misreads a 0 on a whiteboard eat into a
  // limit that exists to stop enumeration. It also skips the database round
  // trip entirely.
  if (!parsed.ok) {
    return fail(parsed.reason === "excluded" ? "excluded" : "invalid", 400);
  }

  const admin = createAdminClient();

  // Same filter as /api/enroll:24-29, so a class that is archived is invisible
  // to both doors rather than resolvable here and refused there.
  const { data: cls, error } = await admin
    .from("classes")
    .select("id, name, teacher_id")
    .eq("join_code", parsed.code)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    // A database failure is not a not-found: telling the student their teacher's
    // code is wrong because Postgres hiccuped is the worst available answer.
    // Reported as a 503 the client renders as "try again", and not charged
    // against the miss budget, because nothing was learned about the code.
    console.error("[enroll/lookup] class lookup failed:", error.message);
    return fail("unavailable", 503);
  }

  if (!cls) {
    // Charged here and only here. Thirty students typing a real code spend
    // nothing; an enumerator spends on every request.
    const miss = await safeLimit(joinLookupMissRateLimit, ip);
    if (!miss.success) {
      // Rendered as its own state, NOT as "code not found". A classroom that
      // trips this limiter must not be told their teacher's code is wrong.
      return fail("rate-limited", 429, rateLimitHeaders(miss.reset));
    }
    return fail("not-found", 404);
  }

  // The teacher's name lives in auth.users.user_metadata, not in profiles --
  // profiles has no name column (app/lib/auth.ts:64-66). Allowed to fail: a
  // missing name should cost the confirmation screen a line, not the whole
  // lookup, so the student still sees which class they are joining.
  let teacherName = "";
  try {
    const { data: teacher } = await admin.auth.admin.getUserById(cls.teacher_id);
    teacherName = displayName(teacher?.user?.user_metadata, teacher?.user?.email);
  } catch (err) {
    console.error("[enroll/lookup] could not resolve teacher name:", err);
  }

  const res = NextResponse.json({
    ok: true,
    className: cls.name,
    teacherName: teacherName || null,
  });

  // THE HANDOFF. Set only after the code resolved, so a cookie never carries a
  // string that was never a class, and set server-side so the value the callback
  // reads is one this route vouched for rather than one the client chose. It is
  // still re-validated after authentication -- see app/auth/callback -- because a
  // cookie is a hint about intent, not an authorisation.
  //
  // The class id is deliberately NOT stored: the code is re-resolved after
  // sign-in so that a class archived or deleted between these two moments is
  // caught rather than enrolled into.
  res.cookies.set(JOIN_COOKIE, parsed.code, JOIN_COOKIE_OPTIONS);
  return res;
}
