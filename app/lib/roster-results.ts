import { buildCsv } from "./csv";
import type { ProvisionOutcome } from "./student-provision";

// What came back from a bulk add, and how it is allowed to be shown.
//
// PURE, so that the one thing most likely to go silently wrong in this feature
// is covered by a test that needs no DOM. The component below this renders what
// rowPresentation returns; it does not decide anything itself.
//
// ─── The two columns of truth ────────────────────────────────────────────────
//
// provisionStudent returns the code even when the class enrolment failed, on
// purpose (student-provision.ts:153-157): the account exists and its password is
// already unrecoverable, so withholding the code would leave a student who can
// never sign in at all, which is strictly worse than a student who is not yet in
// the class. That is the right trade and it has a consequence here.
//
// "Created" and "in the class" are INDEPENDENT FACTS, and a results table that
// folds them into one status word will, on the row where they disagree, print
// the reassuring half. A teacher reading "created" down a column of thirty rows
// has no reason to look closer, and the student is missing from the roster with
// a working account and a code that was already handed over. That is the most
// likely silent failure in a bulk add, so the two facts get two columns and the
// row that disagrees gets a warning treatment of its own.

/** "duplicate" is added by the bulk route; it never reaches provisionStudent. */
export type BulkRowOutcome = ProvisionOutcome | "duplicate";

export interface BulkRowResult {
  first_name: string;
  last_name: string;
  /** The NORMALISED address, not the pasted string. */
  email: string;
  outcome: BulkRowOutcome;
  /** Set on "created" only, and only ever readable here. */
  code: string | null;
  /** enrolled | reactivated | already-enrolled | failed, or null. */
  enrolment: string | null;
  error: string | null;
}

export interface BulkSummary {
  total: number;
  created: number;
  existing: number;
  own_account: number;
  duplicate: number;
  failed: number;
  /** Rows holding a code that are NOT in the class. The number that matters. */
  created_not_enrolled: number;
}

/** How one row reads. `tone` drives colour, `warn` drives the whole-row treatment. */
export interface RowPresentation {
  /** Left column of truth: did an account get made. */
  account: string;
  /** Right column of truth: is this student in the class. Never merged into `account`. */
  inClass: "yes" | "no" | "n/a";
  inClassLabel: string;
  /** Present only when a code exists to show. */
  code: string | null;
  /**
   * True only for the disagreement: a code was minted AND the student is not in
   * the class. The row this is true for must not be able to read as a success.
   */
  warn: boolean;
  /** Said in full on the row itself, so the table does not depend on a legend. */
  note: string;
  tone: "good" | "warn" | "bad" | "muted";
}

/**
 * An enrolment counts as landed on anything but an outright failure.
 *
 * "already-enrolled" is success and is the reason the underlying route is
 * idempotent (class-enrol.ts:54-59 resolves 23505 that way), and "reactivated"
 * is a previously removed student flipped back on. Only "failed" means the
 * student is not in the class. A null enrolment means none was attempted, which
 * happens on own-account, duplicate and failed rows.
 */
function landedInClass(enrolment: string | null): boolean {
  return enrolment !== null && enrolment !== "failed";
}

export function rowPresentation(r: BulkRowResult): RowPresentation {
  if (r.outcome === "created") {
    const enrolled = landedInClass(r.enrolment);
    return {
      account: "New account",
      inClass: enrolled ? "yes" : "no",
      inClassLabel: enrolled ? "Yes" : "No",
      code: r.code,
      warn: !enrolled,
      note: enrolled
        ? ""
        : "Account made and the code below works, but this student is NOT in your class. Save the code, then add them again.",
      tone: enrolled ? "good" : "warn",
    };
  }

  if (r.outcome === "existing") {
    const enrolled = landedInClass(r.enrolment);
    return {
      account: "Already had one",
      inClass: enrolled ? "yes" : "no",
      inClassLabel: enrolled ? "Yes" : "No",
      code: null,
      // Not a warn row. Nothing here is unrecoverable: no code was minted, so
      // running the same add again costs nothing and fixes it.
      warn: false,
      note: enrolled
        ? "They sign in with the password they already have."
        : "Adding them to the class did not go through. Add them again.",
      tone: enrolled ? "muted" : "bad",
    };
  }

  if (r.outcome === "own-account") {
    return {
      account: "That is you",
      inClass: "n/a",
      inClassLabel: "-",
      code: null,
      warn: false,
      note: "This is your own address, so no student account was made.",
      tone: "muted",
    };
  }

  if (r.outcome === "duplicate") {
    return {
      account: "Skipped",
      inClass: "n/a",
      inClassLabel: "-",
      code: null,
      warn: false,
      note: "This email appears more than once in the roster.",
      tone: "muted",
    };
  }

  return {
    account: "Not created",
    inClass: "n/a",
    inClassLabel: "-",
    code: null,
    warn: false,
    note: r.error ?? "Something went wrong. Nothing was created for this row.",
    tone: "bad",
  };
}

/**
 * The status word written into the CSV.
 *
 * NOT the bare outcome, and this is the same decision as the two columns above,
 * carried into the file. The CSV outlives the modal: it is what the teacher
 * keeps, prints and hands out. A row exported as "created" when the student is
 * not in the class moves the silent failure into the artifact that is still
 * being read next week, at which point the modal that could have shown the
 * warning is long closed.
 */
export function csvStatus(r: BulkRowResult): string {
  if (r.outcome === "created") return landedInClass(r.enrolment) ? "created" : "created_not_in_class";
  if (r.outcome === "existing") return landedInClass(r.enrolment) ? "existing" : "existing_not_in_class";
  if (r.outcome === "own-account") return "own_account";
  return r.outcome;
}

export const ROSTER_CSV_COLUMNS = ["first_name", "last_name", "email", "code", "status"];

/**
 * The file the teacher distributes, and the thing that makes showing thirty
 * unrecoverable codes at once a safe act rather than a reckless one.
 *
 * Built with buildCsv so it inherits the export pipeline's escaping wholesale,
 * and the formula guard in escapeCsvCell is not decoration here. Every name in
 * this file came out of a textarea the teacher pasted into, so a student called
 * "=cmd|' /c calc'!A0" on a district spreadsheet is a cell that executes when
 * the roster is opened in Excel. The existing exports read names out of the
 * database; this one reads them out of a paste, which is the shorter path from
 * somebody else's typing to a spreadsheet formula.
 */
export function buildRosterCsv(results: BulkRowResult[]): string {
  return buildCsv(
    ROSTER_CSV_COLUMNS,
    results.map((r) => [r.first_name, r.last_name, r.email, r.code ?? "", csvStatus(r)])
  );
}

/** roster-codes-2026-09-02.csv */
export function rosterCsvFilename(now = new Date()): string {
  return `roster-codes-${now.toISOString().slice(0, 10)}.csv`;
}
