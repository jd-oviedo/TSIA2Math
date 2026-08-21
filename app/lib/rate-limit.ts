import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN from the
// environment automatically. Does NOT throw if they're missing — it logs a
// warning and constructs an unusable client. Actual failures only happen
// when something calls .limit(), which is why safeLimit() below exists: to
// catch that and fail open instead of 500ing every request.
const redis = Redis.fromEnv();

// /api/items/reveal — the highest-priority limit. This is the per-item
// answer-check endpoint, called once per question during a real test. A
// real 20-item test takes well over 5 minutes to complete honestly, so 30
// requests per 5 minutes allows roughly 1.5 honest tests' worth of reveals
// in that window, while making full-bank enumeration (300+ items) take 50+
// minutes minimum if someone tries to script through every item_id.
export const revealRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "5 m"),
  prefix: "ratelimit:reveal",
  analytics: true,
});
export const flagRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  prefix: "unpackmath:flag",
});

// /api/sessions — completed-test submissions. Generous enough for someone
// genuinely retaking the practice test several times in one sitting, tight
// enough to stop scripted spam.
export const sessionsRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  prefix: "ratelimit:sessions",
  analytics: true,
});

// /api/curriculum/practice — per-answer grading inside a curriculum topic.
// Looser than reveal because the shape of honest use is different: a topic is
// 14 items answered back to back, and a student re-attempting the ones they
// got wrong is the behaviour we want, not abuse. 60 per 5 minutes covers a
// full topic plus retries, while still bounding how fast someone could walk
// the answer key by submitting every letter for every item.
export const curriculumPracticeRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "5 m"),
  prefix: "ratelimit:curriculum-practice",
  analytics: true,
});

// /api/gumu/session, the Socratic tutor. Tighter than the practice route
// because every call is a paid model request, and the shape of honest use is
// bounded by design: a session caps at 3 student turns, so one full
// conversation is at most a start, three messages and a reveal.
//
// KEYED ON THE SIGNED-IN USER ID, NOT THE IP, and the route enforces that by
// checking auth before it calls this. It used to be keyed on IP, which was a
// leftover from the endpoints that genuinely have no session, and it broke the
// case it was most likely to meet: a school NAT is one address, so a classroom
// shared a single budget and one anonymous flood could spend it before the 401
// that would have rejected it. Same reasoning as supportRateLimit below.
//
// The threshold is unchanged from the IP-keyed version and is now generous:
// 20 per 5 minutes is roughly four full conversations for ONE student rather
// than for a whole room. Deliberately not retuned in the same change as the
// rekey, so that if this needs tightening it is a decision made on its own.
export const gumuRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "5 m"),
  prefix: "ratelimit:gumu",
  analytics: true,
});

// /api/support — the Help modal on the teacher dashboard. Every call sends a
// real email to the support inbox, so this is tighter than the others: a
// teacher filing several reports in one sitting is normal, scripting the
// endpoint into an inbox flood is not. Keyed on the signed-in user id rather
// than IP, since the route already requires a session.
export const supportRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "ratelimit:support",
  analytics: true,
});

// /api/teacher/export/* -- the CSV downloads on the teacher dashboard. Keyed on
// the signed-in teacher id, and the routes enforce that by calling
// requireTeacher() before this runs.
//
// Each call reads every enrolled student's whole session history plus a
// listUsers() walk of the project, so this is by some distance the heaviest
// authenticated read in the app. The honest shape of use is a teacher pulling
// three files for a class at the end of a term, occasionally re-pulling one
// with emails toggled on to compare. 20 per 10 minutes covers that several
// times over and still bounds how fast the endpoint can be walked.
export const exportRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 m"),
  prefix: "ratelimit:teacher-export",
  analytics: true,
});

// /claim — handing a captured Stripe purchase to whoever presents its checkout
// session id. Keyed on the SIGNED-IN USER ID, and the page enforces that by
// requiring a session before it calls this.
//
// WHAT THIS ACTUALLY GUARDS. The claim key is a bearer token with no expiry:
// anyone holding a cs_ id can move that purchase onto their own account, and by
// design there is no email check standing in the way (that is the entire point —
// the buyer whose checkout email can never become an account is the one this
// route exists for). The compensating controls are single use, this limit, and
// an alert. A cs_ id is ~60 random characters, so guessing one is not a real
// threat; what this bounds is how fast a signed-in attacker could WALK a list of
// ids obtained some other way, and it makes that walk visible in Upstash's
// analytics rather than silent.
//
// 20 per hour is far more than a real buyer needs — one claim, plus refreshes —
// and tight enough that enumeration is not worth attempting from one account.
export const claimRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  prefix: "ratelimit:claim",
  analytics: true,
});

// /api/enroll/lookup -- the pre-auth join-code lookup. Two limiters, both keyed
// on IP, because pre-auth there is no user id to key on and the IP is the only
// thing standing in for "who is doing this".
//
// WHY TWO. Enumeration and volume are different shapes and one threshold cannot
// serve both. The honest shape is a burst: a teacher writes the code on the
// board and thirty students type it at once, all behind one school NAT. The
// hostile shape is a walk of the keyspace, which is low-volume and almost
// entirely misses.
//
// A PER-CODE COUNTER WAS CONSIDERED AND IS NOT HERE, because it cannot work.
// Enumeration uses a different code on every request, so keyed on the code every
// guess lands in a fresh bucket with a count of one and nothing ever
// accumulates. It would bound repeated probing of a code someone already has --
// harvesting -- which is not the threat being defended.
//
// (a) VOLUME. 120 per 10 minutes. Thirty students at four attempts each inside
// one class period, which is 12/min -- the same rate as
// curriculumPracticeRateLimit's 60/5m, so it is the house number rather than a
// new shape. This is the threshold most likely to need retuning and the one
// that produces false rejections if it is wrong.
export const joinLookupRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "10 m"),
  prefix: "ratelimit:join-lookup",
  analytics: true,
});

// (b) MISSES. 30 per 10 minutes, and the route charges this ONLY when the code
// fails to resolve. That asymmetry is the whole design: thirty students typing a
// code that exists spend nothing against it, a student who fat-fingers it twice
// spends two, and an enumerator -- who misses on essentially every request -- is
// finished after thirty.
//
// SIZED FOR A CLASSROOM, NOT A STUDENT, and this is the correction that matters.
// The first draft was 10, which reintroduced exactly the NAT problem
// gumuRateLimit was rekeyed to escape (see the comment at :56-67): at a realistic
// typo rate one class period spends five to eight, so two classes starting
// together would exceed 10 outright and a room of students would be told their
// teacher's code was wrong. 30 covers three to six simultaneous classes on one
// address.
//
// The security cost of that is small and was measured rather than asserted.
// CODE_ALPHABET is 31 glyphs at length 6 (app/api/teacher/classes/route.ts:15),
// so the keyspace is 31^6 = 887,503,681. At 30 per 10 minutes one address gets
// 4,320 guesses a day, which is 205,441 IP-days to walk the keyspace and roughly
// 411 IP-days per hit at 500 live classes -- still four times better than the
// volume limiter alone (103), which is the fallback if this were dropped.
//
// KNOWN CEILING: a school-wide rollout in a single bell period, six or eight
// teachers at once on one address, would still trip this. If that becomes a
// launch scenario the number is 60, at 102,720 IP-days to walk.
export const joinLookupMissRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10 m"),
  prefix: "ratelimit:join-lookup-miss",
  analytics: true,
});

// Best-effort client IP extraction. Vercel sets x-forwarded-for on every
// request; if it's ever missing (e.g. local dev without a proxy in front),
// everyone collapses onto the same "unknown" bucket — acceptable locally,
// shouldn't happen in production.
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

// Wraps the actual Upstash call. If Redis is unreachable or misconfigured —
// missing env vars, a brief outage, whatever — we fail OPEN, not closed.
// Rate limiting is an auxiliary protection; a 500 on every test-taking
// request because Redis hiccuped would be a worse outcome than briefly
// having no rate limiting at all. The failure is logged so it's visible.
export async function safeLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; reset: number }> {
  try {
    const result = await limiter.limit(identifier);
    return { success: result.success, reset: result.reset };
  } catch (err) {
    console.error(
      "[rate-limit] Upstash check failed, failing open:",
      err instanceof Error ? err.message : err
    );
    return { success: true, reset: Date.now() };
  }
}
export function rateLimitHeaders(reset: number): HeadersInit {
  const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return { "Retry-After": String(retryAfterSeconds) };
}