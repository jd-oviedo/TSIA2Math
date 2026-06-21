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

// /api/sessions — completed-test submissions. Generous enough for someone
// genuinely retaking the practice test several times in one sitting, tight
// enough to stop scripted spam.
export const sessionsRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  prefix: "ratelimit:sessions",
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