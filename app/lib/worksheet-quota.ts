import { createAdminClient } from './supabase-admin';
import { worksheetQuota } from './capabilities';

// The Teacher Core worksheet meter, as the app sees it.
//
// The counter itself lives on profiles and is moved only by the two functions
// in sql/worksheet_quota.sql. Nothing here does arithmetic on it: the enforcing
// function decides and returns, and this file passes the decision along. A
// read-then-compare in TypeScript is exactly the race the RPC exists to close.
//
// ONE PLAN IS CAPPED. worksheetQuota() returns null for everything except
// teacher-core, and a null cap means the RPC is never called at all. That is a
// deliberate choice over a no-op inside the function: an unlimited plan should
// not pay a round trip to be told it is unlimited, and the plan rules should be
// in one language rather than two.
//
//
// A MISSING FUNCTION MEANS THE MIGRATION HAS NOT RUN, AND CREATION STILL WORKS
//
// Both helpers below treat "function does not exist" as a pre-migration deploy
// rather than a failure, which is the same call app/teacher/worksheets/page.tsx
// already makes for a missing worksheets table.
//
// This is a real trade and it is worth stating rather than discovering. The cost
// of failing open is that Teacher Core is uncapped between the deploy and the
// moment Juan runs the SQL. The cost of failing closed is that every Teacher
// Core customer loses the ability to create a worksheet in that same window, on
// a feature they are paying for, because of a migration they cannot run. The
// second is worse, so it fails open and says so loudly in the log.
//
// It fails open ONLY for a missing function. A real database error is not
// swallowed -- see consumeWorksheetQuota.

/** Postgres: function does not exist. PostgREST: not in the schema cache. */
const MISSING_FUNCTION = new Set(['42883', 'PGRST202']);

function isMissingFunction(code: string | undefined): boolean {
  return code !== undefined && MISSING_FUNCTION.has(code);
}

export type QuotaDecision = {
  /** Whether this create may proceed. */
  allowed: boolean;
  /** Worksheets created in the current UTC month, after this call. */
  used: number;
  /** The plan's cap, or null when the plan is unlimited. */
  cap: number | null;
  /**
   * True when the meter did not run: an unlimited plan, or a database that does
   * not have sql/worksheet_quota.sql yet. Callers render nothing for it.
   */
  unmetered: boolean;
};

const UNMETERED: QuotaDecision = { allowed: true, used: 0, cap: null, unmetered: true };

/**
 * Spend one worksheet against the caller's monthly allowance.
 *
 * CALL THIS IMMEDIATELY BEFORE THE INSERT, not after it. The two orderings each
 * have a failure mode and they are not symmetric: consuming after a successful
 * insert lets a teacher who fires two creates at once end up at 16, while
 * consuming first means a credit is spent if the insert then fails. The insert
 * is a validated write whose only realistic failures are a missing table (caught
 * earlier, as a 503) or an outage that would have taken the RPC down too, so the
 * window is very small -- and it errs toward the cap holding rather than
 * leaking, which is the right direction for the half of this that is a
 * commercial limit.
 *
 * There is deliberately NO refund path, for a failed insert or anything else.
 * One write path to the counter is what makes the meter auditable, and a
 * decrement is the same door a create-delete-create loop would walk through. A
 * burned credit is logged with the profile id so it can be corrected by hand.
 *
 * The caller must already have cleared requireTeacher() and profileGrants().
 * This function checks neither: the meter is not the paywall, and a helper that
 * enforced its own auth would invite callers to assume it always does.
 */
export async function consumeWorksheetQuota(
  userId: string,
  plan: string | null | undefined,
): Promise<QuotaDecision> {
  const cap = worksheetQuota(plan);
  if (cap === null) return UNMETERED;

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('consume_worksheet_quota', {
    p_user: userId,
    p_cap: cap,
  });

  if (error) {
    if (isMissingFunction(error.code)) {
      console.error(
        '[worksheet-quota] consume_worksheet_quota is missing, so the Teacher Core ' +
          'cap is NOT being enforced. Run sql/worksheet_quota.sql. Allowing the create.',
      );
      return UNMETERED;
    }
    // Not swallowed. A live meter that has started erroring is a different
    // problem from one that was never installed, and quietly granting an
    // unlimited allowance on a transient database fault is how a cap stops
    // meaning anything without anybody being told.
    throw new Error(`consume_worksheet_quota failed: ${error.message}`);
  }

  // The function returns a one-row table, so supabase-js hands back an array.
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('consume_worksheet_quota returned no row');

  return {
    allowed: Boolean(row.allowed),
    used: Number(row.used ?? 0),
    cap,
    unmetered: false,
  };
}

/**
 * What the usage indicator shows. Reads, never writes.
 *
 * The month rule is NOT reimplemented here. worksheet_quota_used applies the
 * same period comparison the enforcing function does, so the number on the page
 * is by construction the number being enforced -- which it would not be if this
 * selected the two columns and compared dates in TypeScript.
 *
 * Returns an unmetered decision for an unlimited plan without touching the
 * database, so a Pro dashboard costs no round trip to render nothing.
 */
export async function readWorksheetQuota(
  userId: string,
  plan: string | null | undefined,
): Promise<QuotaDecision> {
  const cap = worksheetQuota(plan);
  if (cap === null) return UNMETERED;

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('worksheet_quota_used', { p_user: userId });

  if (error) {
    // Display, unlike enforcement, degrades rather than throws. A dashboard that
    // 500s because a usage badge could not be read is a worse outcome than a
    // dashboard with no badge, and the enforcing path is a separate call that
    // will report its own failure.
    if (!isMissingFunction(error.code)) {
      console.error('[worksheet-quota] worksheet_quota_used failed:', error.message);
    }
    return UNMETERED;
  }

  return { allowed: Number(data ?? 0) < cap, used: Number(data ?? 0), cap, unmetered: false };
}
