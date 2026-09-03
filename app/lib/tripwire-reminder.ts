import { timingSafeEqual } from "node:crypto";
import { PRODUCTS_BY_PAYMENT_LINK, TRIPWIRE_PAYMENT_LINK_ID } from "./products";
import { grantsAccess } from "./entitlement";
import { topicKey } from "./topic-key";
import type { AttemptRow } from "./attempt-sets";
import {
  claimUrlFor,
  renderTripwireReminder,
  tripwireExpiryDate,
  type TripwireReminderMessage,
  type TripwireReminderState,
} from "./email";
import type { createAdminClient } from "./supabase-admin";

// The day-before-expiry sweep for the $5 / 7-day tripwire.
//
// WHO. Three kinds of buyer, three emails, decided from two tables and one
// attempts read:
//
//   NEVER CLAIMED  a pending_entitlements row on the tripwire link with
//                  claimed_at still null. The purchase resolved to no account
//                  (see pending-entitlements.ts), so the clock is running on
//                  access nobody is using. Goes to the checkout email, with the
//                  /claim link, and no first name because there is none.
//   ENGAGED        a profile on the tripwire link, plan full-course, still
//                  granting, with at least one curriculum topic worked since
//                  the pass started.
//   IDLE           the same profile shape with zero topics worked.
//
// WHY THE LINK ID IS THE WHOLE TEST. The tripwire sells the full-course plan,
// so `plan` cannot tell a $5 pass from an $89 purchase. stripe_payment_link_id
// can, and writeEntitlement overwrites it on every plink-keyed write, so a
// buyer who upgraded to real Full Course no longer carries the tripwire id and
// drops out of this sweep on their own. That is the exclusion, and there is
// deliberately no second one.
//
// WHEN. Passes whose access_until is 24 to 48 hours after the run's scheduled
// slot: [slot + 24h, slot + 48h). The cron fires once a day at a fixed UTC
// hour (vercel.json), so consecutive runs sit exactly 24h apart and their
// 24h-wide windows tile the timeline with no gap and no overlap: a pass is
// caught by exactly one run, and every buyer gets a heads up between one and
// two days out, so "tomorrow" in the subject line is honest for all of them.
//
// ANCHORED TO THE SLOT, NOT TO THE WALL CLOCK. A cron that fires a few
// minutes late, or a manual re-trigger later that day, would otherwise slide
// its window and leave a sliver of passes that no run ever covers. So the
// window is computed from the most recent scheduled slot at or before now,
// which makes every run on a given day compute the identical window whatever
// the clock says. The lead and width are parameters so a day-of-expiry email
// is a second config, not a second sweep.
//
// EXACTLY ONCE, WITHOUT A COLUMN. Before a send, one Redis SET NX on a key
// naming the pass and the email type. The key is reserved BEFORE the send so
// two overlapping runs cannot both decide to send; a failed send releases it
// so a same-day re-trigger can retry. A Redis outage throws out of the sweep
// before anything is sent: a missed day is recoverable by hand, a double
// email to every buyer is not.
//
// NOTHING HERE CONSTRUCTS A CLIENT. Database, attempts, user lookup, Redis,
// Resend and analytics all arrive through `deps`, so the route wires the real
// ones and scripts/faultproof_tripwire_day6.mjs wires fakes and can prove the
// routing, the window, the dedupe and the exclusion without a network.

export type ReminderConfig = {
  /** Dedupe key prefix and log tag. One per email type. */
  name: string;
  /** Hour of the day, UTC, the cron is scheduled for. MUST match vercel.json. */
  slotUtcHour: number;
  /** Window opens this many hours after the slot. 24 is "the day before". */
  leadHours: number;
  /** Window width. MUST equal the cron cadence, or passes are missed or doubled. */
  widthHours: number;
};

/** 14:00 UTC is 9am Central (8am during standard time). See vercel.json. */
export const CRON_SLOT_UTC_HOUR = 14;

export const TRIPWIRE_DAY6: ReminderConfig = {
  name: "tripwire-day6",
  slotUtcHour: CRON_SLOT_UTC_HOUR,
  leadHours: 24,
  widthHours: 24,
};

/** Longer than the pass by a wide margin. The key only has to outlive the window. */
export const DEDUPE_TTL_SECONDS = 30 * 24 * 60 * 60;

const HOUR_MS = 60 * 60 * 1000;

type Admin = ReturnType<typeof createAdminClient>;

export type SweepDeps = {
  admin: Admin;
  /** The Grades page's attempts read, injected so the harness can fake it. */
  attemptsFor: (profileId: string) => Promise<AttemptRow[]>;
  userFor: (profileId: string) => Promise<{ email: string | null; firstName: string }>;
  /** SET NX. True when this call created the key. */
  reserve: (key: string, ttlSeconds: number) => Promise<boolean>;
  release: (key: string) => Promise<void>;
  send: (message: TripwireReminderMessage) => Promise<void>;
  capture?: (event: {
    distinctId: string;
    event: string;
    properties: Record<string, string | number>;
  }) => void;
  now?: Date;
};

export type SweepEntry = {
  state: TripwireReminderState;
  key: string;
  /** profile id, or the pending row id for never-claimed. Never an email. */
  passId: string;
  accessUntil: string;
};

export type SweepResult = {
  window: { start: string; end: string };
  sent: SweepEntry[];
  duplicates: SweepEntry[];
  failed: (SweepEntry & { error: string })[];
  /** Claimed rows the sweep matched but could not address. */
  unaddressable: string[];
};

// ---------------------------------------------------------------------------
// Window
// ---------------------------------------------------------------------------

/** The most recent scheduled slot at or before `now`. */
export function scheduledSlot(now: Date, slotUtcHour: number): Date {
  const slot = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), slotUtcHour)
  );
  if (slot.getTime() > now.getTime()) slot.setUTCDate(slot.getUTCDate() - 1);
  return slot;
}

/** [slot + lead, slot + lead + width). Half-open, so adjacent windows share no instant. */
export function sweepWindow(now: Date, config: ReminderConfig): { start: Date; end: Date } {
  const slot = scheduledSlot(now, config.slotUtcHour);
  const start = new Date(slot.getTime() + config.leadHours * HOUR_MS);
  const end = new Date(start.getTime() + config.widthHours * HOUR_MS);
  return { start, end };
}

// ---------------------------------------------------------------------------
// Engagement
// ---------------------------------------------------------------------------

/** Distinct curriculum topics with an attempt at or after `since`. */
export function topicsWorkedSince(attempts: AttemptRow[], since: Date): number {
  const seen = new Set<string>();
  for (const a of attempts) {
    if (new Date(a.created_at).getTime() >= since.getTime()) {
      seen.add(topicKey(a.course_id, a.topic_id));
    }
  }
  return seen.size;
}

const PASS_DAYS = PRODUCTS_BY_PAYMENT_LINK[TRIPWIRE_PAYMENT_LINK_ID].days ?? 7;

/** When the pass started: access_until was measured from the purchase event. */
export function passStart(accessUntil: Date): Date {
  return new Date(accessUntil.getTime() - PASS_DAYS * 24 * 60 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Dedupe key
// ---------------------------------------------------------------------------

/** `{name}:{who}:{access_until ISO}`. The ISO stamp is the pass's identity. */
export function dedupeKey(config: ReminderConfig, who: string, accessUntilIso: string): string {
  return `${config.name}:${who.trim().toLowerCase()}:${accessUntilIso}`;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/**
 * Vercel sends `Authorization: Bearer ${CRON_SECRET}` on every cron
 * invocation. Nothing else may run the sweep, and an unset secret means
 * nobody may, rather than everybody.
 */
export function isCronAuthorized(
  authorizationHeader: string | null,
  secret: string | undefined
): boolean {
  if (!secret || !authorizationHeader) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(authorizationHeader);
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

// ---------------------------------------------------------------------------
// The sweep
// ---------------------------------------------------------------------------

const PENDING_COLUMNS = "id, email, access_until, checkout_session_id";
const PROFILE_COLUMNS = "id, plan_status, access_until";

type Recipient = {
  state: TripwireReminderState;
  passId: string;
  who: string;
  to: string;
  accessUntil: Date;
  firstName?: string;
  topicsWorked?: number;
  claimUrl?: string;
};

export async function runTripwireReminderSweep(
  config: ReminderConfig,
  deps: SweepDeps
): Promise<SweepResult> {
  const now = deps.now ?? new Date();
  const { start, end } = sweepWindow(now, config);
  const tag = `[${config.name}]`;
  const result: SweepResult = {
    window: { start: start.toISOString(), end: end.toISOString() },
    sent: [],
    duplicates: [],
    failed: [],
    unaddressable: [],
  };

  const recipients: Recipient[] = [];

  // NEVER CLAIMED. The email on the row is already lowercased and trimmed by
  // recordPendingEntitlement, and a row with no email at all cannot be
  // reached from here (the ops alert at capture time is its only channel).
  const { data: pendingRows, error: pendingError } = await deps.admin
    .from("pending_entitlements")
    .select(PENDING_COLUMNS)
    .eq("stripe_payment_link_id", TRIPWIRE_PAYMENT_LINK_ID)
    .is("claimed_at", null)
    .gte("access_until", start.toISOString())
    .lt("access_until", end.toISOString());
  if (pendingError) throw new Error(`${tag} pending lookup failed: ${pendingError.message}`);

  for (const row of pendingRows ?? []) {
    if (!row.email || !row.access_until) continue;
    recipients.push({
      state: "never-claimed",
      passId: row.id,
      who: row.email,
      to: row.email,
      accessUntil: new Date(row.access_until),
      claimUrl: claimUrlFor(row.checkout_session_id),
    });
  }

  // CLAIMED. plan is checked in the query and plan_status in code, with the
  // real grantsAccess, so a refunded or cancelled pass is not told it "ends
  // tomorrow".
  const { data: profileRows, error: profileError } = await deps.admin
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("stripe_payment_link_id", TRIPWIRE_PAYMENT_LINK_ID)
    .eq("plan", "full-course")
    .gte("access_until", start.toISOString())
    .lt("access_until", end.toISOString());
  if (profileError) throw new Error(`${tag} profile lookup failed: ${profileError.message}`);

  for (const row of profileRows ?? []) {
    if (!row.access_until || !grantsAccess(row.plan_status)) continue;
    const accessUntil = new Date(row.access_until);
    const { email, firstName } = await deps.userFor(row.id);
    if (!email) {
      result.unaddressable.push(row.id);
      continue;
    }
    const attempts = await deps.attemptsFor(row.id);
    const topicsWorked = topicsWorkedSince(attempts, passStart(accessUntil));
    recipients.push({
      state: topicsWorked > 0 ? "engaged" : "idle",
      passId: row.id,
      who: row.id,
      to: email,
      accessUntil,
      firstName,
      topicsWorked,
    });
  }

  for (const r of recipients) {
    const accessUntilIso = r.accessUntil.toISOString();
    const key = dedupeKey(config, r.who, accessUntilIso);
    const entry: SweepEntry = { state: r.state, key, passId: r.passId, accessUntil: accessUntilIso };

    // Reserve first. A throw here is a Redis outage and it stops the run.
    const reserved = await deps.reserve(key, DEDUPE_TTL_SECONDS);
    if (!reserved) {
      result.duplicates.push(entry);
      continue;
    }

    const message = renderTripwireReminder(r.state, r.to, {
      firstName: r.firstName,
      expiryDate: tripwireExpiryDate(r.accessUntil),
      topicsWorked: r.topicsWorked,
      claimUrl: r.claimUrl,
    });

    try {
      await deps.send(message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${tag} send failed for ${r.state} ${r.passId}: ${msg}`);
      try {
        await deps.release(key);
      } catch (releaseErr) {
        console.error(`${tag} could not release ${key} after a failed send:`, releaseErr);
      }
      result.failed.push({ ...entry, error: msg });
      continue;
    }

    result.sent.push(entry);
    deps.capture?.({
      distinctId: r.who,
      event: "tripwire_reminder_sent",
      properties: {
        reminder: config.name,
        state: r.state,
        pass_id: r.passId,
        access_until: accessUntilIso,
        topics_worked: r.topicsWorked ?? 0,
      },
    });
  }

  console.log(
    `${tag} window ${result.window.start} to ${result.window.end}: ` +
      `${result.sent.length} sent, ${result.duplicates.length} already sent, ` +
      `${result.failed.length} failed, ${result.unaddressable.length} unaddressable`
  );
  return result;
}
