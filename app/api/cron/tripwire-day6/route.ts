import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { PostHog } from "posthog-node";
import { createAdminClient } from "@/app/lib/supabase-admin";
import { getAttempts } from "@/app/lib/curriculum-progress";
import { displayName } from "@/app/lib/display-name";
import { sendTripwireReminder } from "@/app/lib/email";
import {
  TRIPWIRE_DAY6,
  isCronAuthorized,
  runTripwireReminderSweep,
} from "@/app/lib/tripwire-reminder";

// Daily. Scheduled in vercel.json; see app/lib/tripwire-reminder.ts for the
// window, the three states and the dedupe. This file only wires the real
// clients in.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The whole cohort for a day is a handful of buyers, but each one is a user
// lookup, an attempts read, a Redis round trip and a Resend call in series.
export const maxDuration = 120;

const SOURCE = "cron/tripwire-day6";

export async function GET(req: Request) {
  if (!isCronAuthorized(req.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const redis = Redis.fromEnv();

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthog = posthogKey
    ? new PostHog(posthogKey, { host: process.env.NEXT_PUBLIC_POSTHOG_HOST })
    : null;
  if (!posthog) console.warn(`[${SOURCE}] NEXT_PUBLIC_POSTHOG_KEY unset, analytics skipped`);

  try {
    const result = await runTripwireReminderSweep(TRIPWIRE_DAY6, {
      admin,
      attemptsFor: getAttempts,
      userFor: async (profileId) => {
        const { data, error } = await admin.auth.admin.getUserById(profileId);
        if (error || !data?.user) {
          console.error(`[${SOURCE}] no auth user for ${profileId}`, error);
          return { email: null, firstName: "there" };
        }
        const name = displayName(data.user.user_metadata, data.user.email);
        return { email: data.user.email ?? null, firstName: name.split(/\s+/)[0] || "there" };
      },
      reserve: async (key, ttlSeconds) =>
        (await redis.set(key, new Date().toISOString(), { nx: true, ex: ttlSeconds })) === "OK",
      release: async (key) => {
        await redis.del(key);
      },
      send: sendTripwireReminder,
      capture: posthog ? (event) => posthog.capture(event) : undefined,
    });

    return NextResponse.json({
      ok: true,
      window: result.window,
      sent: result.sent.length,
      duplicates: result.duplicates.length,
      failed: result.failed.length,
      unaddressable: result.unaddressable.length,
      byState: result.sent.reduce<Record<string, number>>((acc, e) => {
        acc[e.state] = (acc[e.state] ?? 0) + 1;
        return acc;
      }, {}),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[${SOURCE}] sweep aborted: ${message}`);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  } finally {
    await posthog?.shutdown();
  }
}
