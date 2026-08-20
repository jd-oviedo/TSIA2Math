import { createAdminClient } from "./supabase-admin";
import { linkCustomerId, writeEntitlement } from "./stripe-activation";
import type { PlanStatus } from "./entitlement";
import type { EntitlementWrite, Plan, PlanTerm } from "./products";

// A paid checkout that resolved to no profile, held until an account exists to
// receive it.
//
// THE BUG THIS CLOSES. app/api/stripe/webhook/route.ts had a branch that took
// the money and wrote nothing: all three resolution steps can miss, and when
// they do the handler alerts, returns 200, and Stripe never retries. Confirmed
// on live traffic with a real $49 Practice Pass on 2026-08-19. Part 1 made that
// visible in three channels. Visibility is not recovery. This is the recovery.
//
// TWO CLAIM SURFACES, BECAUSE THERE ARE TWO FAILURE MODES AND EMAIL ONLY FIXES
// ONE OF THEM.
//
//   a. The checkout email is not a Google address. Sign-in is Google-only, so no
//      sign-in can ever produce that user, and an email-keyed row would wait
//      forever. Only /claim, keyed on the checkout session id, reaches this
//      buyer -- it never consults the email at all.
//
//   b. The checkout email is a Google address they have never signed in with, or
//      a different address they typed at checkout. Stripe's form pre-fills
//      nothing on a direct buy.stripe.com link, so this is the default
//      behaviour, not an edge case. auth/callback's email claim fixes it.
//
// ONE claimPending SERVES BOTH. The surfaces differ only in how they find the
// row; everything after that -- the profile check, linkCustomerId, the replay,
// which outcomes mark the row -- is identical, and duplicating it is how the two
// would drift into disagreeing about when a debt is settled.
//
// THE CLAIM REPLAYS, IT DOES NOT RE-DERIVE. A row is a serialized
// EntitlementWrite, so claiming feeds it back through the same writeEntitlement
// the webhook uses. That is what keeps one entitlement write path, and it is
// what carries the ruling-1 role promotion -- the `role: 'teacher'` spread
// inside the guarded UPDATE -- onto the claim path for free. Re-deriving the
// plan here would be a second opinion about what someone bought.
//
// AND IT NEEDS NO STRIPE CALL. The row exists only because a signature-verified
// webhook produced it, so the row IS the proof of payment. /claim deliberately
// does not retrieve the session, unlike /teacher/welcome, which has to because
// its only input is a session id off a URL.

type Admin = ReturnType<typeof createAdminClient>;

const TABLE = "pending_entitlements";

// Every column the claim replays, named once. A `select("*")` here would quietly
// start carrying anything added to the table later. One literal rather than a
// concatenation because supabase-js infers the row type from the select string,
// and a built-up string degrades that to GenericStringError.
const ROW_COLUMNS =
  "id, email, plan, plan_term, plan_status, access_until, plan_source, stripe_payment_link_id, stripe_customer_id, event_created_at, checkout_session_id, claimed_at";

type PendingRow = {
  id: string;
  email: string | null;
  plan: Plan;
  plan_term: PlanTerm;
  plan_status: PlanStatus;
  access_until: string | null;
  plan_source: "stripe" | "comp" | "migration";
  stripe_payment_link_id: string | null;
  stripe_customer_id: string | null;
  event_created_at: string;
  checkout_session_id: string;
  claimed_at: string | null;
};

// Lowercased and trimmed, matching pending_entitlements_email_lower_check, so
// the auth/callback lookup can be a plain equality with no per-call-site
// normalisation to get wrong. Empty becomes null rather than "".
function normaliseEmail(email: string | null | undefined): string | null {
  const trimmed = (email ?? "").trim().toLowerCase();
  return trimmed === "" ? null : trimmed;
}

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

export type RecordOutcome = "recorded" | "duplicate";

/**
 * Capture a paid checkout that matched no account.
 *
 * IDEMPOTENT ON checkout_session_id, which is UNIQUE. A Stripe redelivery of the
 * same checkout.session.completed inserts nothing and reports "duplicate"
 * instead of queueing a second copy of one purchase.
 *
 * THROWS ON A DATABASE ERROR, ON PURPOSE, and this is the one place in that
 * branch where a throw is the right answer. The branch returns 200 to Stripe
 * because retrying an event that cannot resolve on its own is a lottery. That
 * reasoning stops applying the moment we have somewhere to put the purchase: an
 * insert that fails is a purchase lost a second time, and a transient database
 * error is exactly what Stripe's retry window is for. Same stance as
 * writeEntitlement, for the same reason.
 */
export async function recordPendingEntitlement(
  admin: Admin,
  args: {
    write: EntitlementWrite;
    checkoutSessionId: string;
    email: string | null;
    customerId: string | null;
    eventCreatedMs: number;
    source: string;
  }
): Promise<RecordOutcome> {
  const { write, checkoutSessionId, eventCreatedMs, source } = args;

  const row = {
    email: normaliseEmail(args.email),
    plan: write.plan,
    plan_term: write.planTerm,
    plan_status: write.planStatus,
    access_until: write.accessUntil ? write.accessUntil.toISOString() : null,
    plan_source: write.planSource,
    stripe_payment_link_id: write.paymentLinkId ?? null,
    // WITHOUT THIS THE FIX IS HALF A FIX. A teacher would get their initial
    // entitlement at claim time and then every renewal webhook would drop,
    // because resolveProfileId's customer step still would not find them and the
    // checkout email still would not match.
    //
    // CARRIED, NOT GUARANTEED TO LAND. Storing it here only means the claim will
    // ATTEMPT the link. linkCustomerId is first-writer-wins, so if the claiming
    // profile already carries a different customer id, this one is not stored
    // and the renewal drop above happens anyway. See claimOne, which is where
    // that is detected and alerted; there is no fix available in the schema,
    // because profiles has one stripe_customer_id column.
    stripe_customer_id: args.customerId,
    // The Stripe EVENT timestamp, not the wall clock. It orders the replayed
    // write and it measures the term, so a claim a week late still ends six
    // months from the day they PAID.
    event_created_at: new Date(eventCreatedMs).toISOString(),
    checkout_session_id: checkoutSessionId,
  };

  const { data, error } = await admin
    .from(TABLE)
    .upsert(row, { onConflict: "checkout_session_id", ignoreDuplicates: true })
    .select("id");

  if (error) {
    throw new Error(`[${source}] pending entitlement insert failed: ${error.message}`);
  }

  // ON CONFLICT DO NOTHING returns no row, which is how a redelivery is told
  // apart from a first capture.
  if (!data || data.length === 0) {
    console.log(
      `[${source}] pending entitlement already recorded for ${checkoutSessionId}, not duplicated`
    );
    return "duplicate";
  }

  console.error(
    `[${source}] PAID CHECKOUT CAPTURED AS PENDING: ${write.plan}/${write.planTerm} for ` +
      `${row.email ?? "(no email on the session)"}, session ${checkoutSessionId}. ` +
      `It is owed until someone claims it.`
  );
  return "recorded";
}

// ---------------------------------------------------------------------------
// Claiming
// ---------------------------------------------------------------------------

export type ClaimBy = { sessionId: string } | { email: string };

export type ClaimOutcome =
  /** Written to the profile and the row is marked. */
  | "claimed"
  /** This session id exists but was already claimed. Single use. */
  | "already-claimed"
  /** No unclaimed row for this key. The overwhelmingly common case. */
  | "nothing-owed"
  /** The profile row does not exist. The debt stands. */
  | "no-profile"
  /** The profile already carries something newer. Marked, and alerted. */
  | "stale"
  /** writeEntitlement declined the write. The debt stands. */
  | "refused";

export type ClaimResult = {
  outcome: ClaimOutcome;
  /** Null only for "nothing-owed", where there is no row to name. */
  checkoutSessionId: string | null;
  plan: Plan | null;
};

/**
 * Deliver everything owed to `profileId` that `by` can find.
 *
 * Returns one result per row considered. A session-id claim considers at most
 * one. An email claim can find several, because two purchases by the same person
 * are two debts and both are owed -- there is deliberately no unique constraint
 * on email.
 */
export async function claimPending(
  admin: Admin,
  profileId: string,
  by: ClaimBy
): Promise<ClaimResult[]> {
  // Derived rather than passed, so a log line cannot name the wrong surface.
  const source = "sessionId" in by ? "claim/session-id" : "auth/callback";

  if ("sessionId" in by) {
    // NOT filtered on claimed_at, deliberately. A row that exists and is already
    // claimed has to be reported as "already-claimed" rather than as
    // "nothing-owed": single use is a rule the buyer can hit by refreshing, and
    // "we have no record of this" is the wrong thing to tell them when we do.
    const { data, error } = await admin
      .from(TABLE)
      .select(ROW_COLUMNS)
      .eq("checkout_session_id", by.sessionId)
      .maybeSingle();

    if (error) {
      throw new Error(`[${source}] pending lookup failed: ${error.message}`);
    }
    if (!data) {
      return [{ outcome: "nothing-owed", checkoutSessionId: null, plan: null }];
    }

    const row = data as PendingRow;
    if (row.claimed_at) {
      console.warn(
        `[${source}] session ${row.checkout_session_id} was already claimed at ${row.claimed_at}`
      );
      return [
        {
          outcome: "already-claimed",
          checkoutSessionId: row.checkout_session_id,
          plan: row.plan,
        },
      ];
    }

    return [await claimOne(admin, profileId, row, source)];
  }

  const email = normaliseEmail(by.email);
  if (!email) return [{ outcome: "nothing-owed", checkoutSessionId: null, plan: null }];

  // Unclaimed only, which is what the partial index covers. Claimed rows are
  // audit trail and nothing looks them up by email.
  //
  // OLDEST FIRST. writeEntitlement's ordering predicate means the newest event
  // ends up on the profile whichever order these run in, but claiming oldest
  // first gets there with every row "written", where newest first would make
  // each older row report "stale" and raise a conflict alert for what is just
  // two ordinary purchases.
  const { data, error } = await admin
    .from(TABLE)
    .select(ROW_COLUMNS)
    .eq("email", email)
    .is("claimed_at", null)
    .order("event_created_at", { ascending: true });

  if (error) {
    throw new Error(`[${source}] pending lookup failed: ${error.message}`);
  }
  if (!data || data.length === 0) {
    return [{ outcome: "nothing-owed", checkoutSessionId: null, plan: null }];
  }

  // Sequential, not Promise.all: these write to the same profile row and the
  // ordering above is the point.
  const results: ClaimResult[] = [];
  for (const row of data as PendingRow[]) {
    results.push(await claimOne(admin, profileId, row, source));
  }
  return results;
}

/**
 * One row, one profile.
 *
 * ORDER IS WRITE THEN MARK. If the process dies between them the row stays
 * unclaimed and the next claim replays it, which is harmless: writeEntitlement's
 * ordering predicate makes the second write a no-op. The opposite order would
 * mark a purchase delivered that was never written, which is the original bug
 * with a database row in front of it.
 */
async function claimOne(
  admin: Admin,
  profileId: string,
  row: PendingRow,
  source: string
): Promise<ClaimResult> {
  const eventCreatedMs = new Date(row.event_created_at).getTime();
  const named = { checkoutSessionId: row.checkout_session_id, plan: row.plan };

  // BEFORE the entitlement. See the column's comment: a teacher claimed without
  // this gets their first entitlement and then silently drops every renewal.
  //
  // BUT THE WRITE IS CONDITIONAL, AND A PRE-EXISTING DIFFERENT ID WINS. This
  // said "not optional", which overstated it. linkCustomerId guards on
  // `stripe_customer_id is null` inside the UPDATE, so a profile that already
  // carries an id keeps it and this one is silently dropped.
  //
  // That guard is correct and must stay: clobbering would repoint the account at
  // a different Stripe customer, and every event for the ORIGINAL one would then
  // resolve to nobody -- breaking renewals for a subscription that is live and
  // being paid for right now, in order to fix one that may not even be a
  // subscription.
  //
  // The cost is that the LOSING side can be the one that matters, so the outcome
  // is captured and reported below rather than discarded. Not fixable here:
  // profiles has a single stripe_customer_id column and one profile genuinely
  // cannot hold two Stripe customers. The goal is that it stops being silent.
  const linked = await linkCustomerId(admin, profileId, row.stripe_customer_id);

  // The row, deserialized back into exactly what the webhook computed. Nothing
  // is recomputed here -- in particular access_until comes off the row, where it
  // was measured from event_created_at, and NEVER from the time of this claim.
  const write: EntitlementWrite = {
    plan: row.plan,
    planTerm: row.plan_term,
    planStatus: row.plan_status,
    accessUntil: row.access_until ? new Date(row.access_until) : null,
    planSource: row.plan_source,
    paymentLinkId: row.stripe_payment_link_id,
  };

  const written = await writeEntitlement(admin, profileId, write, eventCreatedMs, source);

  if (written === "refused") {
    // Should be unreachable: pending_entitlements_access_until_check mirrors
    // profiles_access_until_check, so a row that could not be replayed cannot be
    // stored. If it fires anyway the row is malformed, and it must stay
    // claimable while that is fixed.
    console.error(
      `[${source}] entitlement write REFUSED for session ${row.checkout_session_id}. ` +
        `Row left unclaimed.`
    );
    return { outcome: "refused", ...named };
  }

  if (written === "stale") {
    // TWO VERY DIFFERENT THINGS LOOK IDENTICAL HERE, and telling them apart is
    // the whole reason this branch exists.
    //
    // writeEntitlement reports "stale" when its UPDATE matched zero rows. That
    // happens when the profile carries something newer -- and also when THERE IS
    // NO PROFILE ROW AT ALL, because zero rows is zero rows. Treating the second
    // as the first would mark a debt delivered to an account that does not
    // exist, destroying the only record that someone paid.
    //
    // So the profile is read only here, on the rare path, and read AFTER the
    // write rather than before it. A pre-check would be a read-then-write with a
    // window in it; this ordering cannot mark a row whose profile was already
    // gone when the write ran.
    const { data: profile, error } = await admin
      .from("profiles")
      .select("id")
      .eq("id", profileId)
      .maybeSingle();

    if (error) {
      throw new Error(`[${source}] profile existence check failed: ${error.message}`);
    }

    if (!profile) {
      console.error(
        `[${source}] profile ${profileId} does not exist, so nothing received session ` +
          `${row.checkout_session_id}. Row left UNCLAIMED: it is still owed.`
      );
      return { outcome: "no-profile", ...named };
    }

    // A genuine conflict: the profile already holds an entitlement newer than
    // this purchase. The settled rule is that the newer event wins, so this does
    // not overwrite anything -- but a person hears about it, because the shape
    // of it is someone paying twice or two products landing on one account.
    await alertStaleClaim(profileId, row, source);
    // Falls through to the mark. The purchase IS reflected in the profile's
    // current state, so leaving the row unclaimed would replay it on every
    // future sign-in, forever, alerting every time.
  }

  // DELIBERATELY DOWN HERE, not next to the call. Above this point the profile
  // may not exist at all, and a nonexistent profile also makes linkCustomerId
  // report "already-linked" -- alerting there would fire on every no-profile
  // claim and say something untrue about a customer id. By here the entitlement
  // is on a profile that demonstrably exists, so "already-linked" can only mean
  // what it says.
  if (linked === "already-linked") {
    await alertUnlinkedCustomer(profileId, row, source);
  }

  const { data: marked, error: markError } = await admin
    .from(TABLE)
    .update({ claimed_at: new Date().toISOString() })
    .eq("id", row.id)
    // Single use, enforced in the predicate rather than by re-reading, so two
    // concurrent claims cannot both decide the row was theirs to take.
    .is("claimed_at", null)
    .select("id");

  if (markError) {
    throw new Error(`[${source}] marking the pending row claimed failed: ${markError.message}`);
  }

  if (!marked || marked.length === 0) {
    // Another claim marked it between our read and this update. The entitlement
    // is on the profile either way, so the buyer has what they paid for; only
    // the bookkeeping was done by someone else.
    console.warn(
      `[${source}] session ${row.checkout_session_id} was marked claimed concurrently. ` +
        `The entitlement was still written to ${profileId}.`
    );
  }

  console.log(
    `[${source}] claimed session ${row.checkout_session_id} -> ${profileId}: ` +
      `${row.plan}/${row.plan_status}, access_until ${row.access_until ?? "none"}`
  );
  return { outcome: written === "stale" ? "stale" : "claimed", ...named };
}

/**
 * The claimed purchase's Stripe customer was NOT linked, because the profile
 * already carried a different one.
 *
 * SEVERITY TRACKS WHETHER ANYTHING WILL ACTUALLY DROP, and the message must not
 * claim otherwise.
 *
 *   monthly / annual -> error.   There is a live subscription under the customer
 *                                that lost, its renewals resolve to nobody, and
 *                                the teacher will lapse at the end of the period
 *                                they already paid for. That is the slow,
 *                                invisible failure -- it looks like an expiry.
 *   one-time         -> warning. A one-time pass generates no subscription
 *                                events, so there are no renewals to lose. The
 *                                mismatch is still recorded, because it is how
 *                                two Stripe customers for one person get noticed,
 *                                but nobody needs to be paged for it.
 *
 * Same channel as the stale alert.
 */
async function alertUnlinkedCustomer(
  profileId: string,
  row: PendingRow,
  source: string
): Promise<void> {
  const subscription = row.plan_term === "monthly" || row.plan_term === "annual";

  console.error(
    `[${source}] CUSTOMER NOT LINKED: profile ${profileId} already carries a different ` +
      `stripe_customer_id, so ${row.stripe_customer_id} from session ` +
      `${row.checkout_session_id} was not stored. ` +
      (subscription
        ? `This is a ${row.plan_term} ${row.plan} -- ITS RENEWALS WILL RESOLVE TO NOBODY and the ` +
          `teacher will lapse at the end of the period they paid for. Reconcile the two Stripe ` +
          `customers by hand.`
        : `This is a one-time ${row.plan}, so there are no renewals to lose. Recorded only.`)
  );

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureMessage?.("stripe: claimed purchase's customer id could not be linked", {
      level: subscription ? "error" : "warning",
      tags: { source, plan: row.plan, plan_term: row.plan_term },
      extra: {
        profileId,
        checkoutSessionId: row.checkout_session_id,
        unlinkedCustomerId: row.stripe_customer_id,
        plan: row.plan,
        planTerm: row.plan_term,
        renewalsAtRisk: subscription,
        email: row.email,
      },
    });
  } catch (err) {
    console.error(`[${source}] could not raise a Sentry issue for the unlinked customer:`, err);
  }
}

/**
 * The loud half of the plan-conflict rule.
 *
 * Sentry is imported lazily and every failure is swallowed: an alert must never
 * be able to change the outcome of a claim, and this module is also loaded
 * outside Next by scripts/faultproof_claim.mjs, where the SDK's server entry is
 * not what resolves.
 */
async function alertStaleClaim(profileId: string, row: PendingRow, source: string): Promise<void> {
  console.error(
    `[${source}] STALE CLAIM: profile ${profileId} already carries an entitlement newer than ` +
      `session ${row.checkout_session_id} (${row.plan}/${row.plan_term}, event ` +
      `${row.event_created_at}). The newer entitlement wins and the row is marked claimed. ` +
      `Check whether this person paid twice.`
  );

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureMessage?.("stripe: pending entitlement claimed onto a newer entitlement", {
      level: "error",
      tags: { source, plan: row.plan },
      extra: {
        profileId,
        checkoutSessionId: row.checkout_session_id,
        plan: row.plan,
        planTerm: row.plan_term,
        eventCreatedAt: row.event_created_at,
        email: row.email,
      },
    });
  } catch (err) {
    console.error(`[${source}] could not raise a Sentry issue for the stale claim:`, err);
  }
}
