// Parsing the roster a teacher pastes into "Add roster".
//
// PURE, AND DELIBERATELY IMPORT-FREE. This runs in the browser to build the
// preview table and it runs in a test with no DOM and no Supabase. The one thing
// it must never become is something only a request can load, because the preview
// IS the gate: nothing is minted from a paste until every line here says ready,
// so a parser that could only run on the server would mean the gate and the
// display disagreed about what a line means.
//
// ONE SOURCE OF TRUTH FOR "IS THIS AN EMAIL". isRosterEmail below is imported by
// schemas.ts for the bulk route's row validation, rather than each side reaching
// for its own rule. If the preview used one predicate and the route used zod's
// .email(), an address the preview called ready could still fail the route, and
// because the route validates the whole body at once that single row would 400
// the entire paste with a message pointing at nothing the teacher can see.
//
// ─── The shape of a pasted roster ────────────────────────────────────────────
//
// Two sources, one parser. A selection dragged out of Google Sheets or Excel
// arrives TAB separated; a list typed by hand arrives COMMA separated. Splitting
// on tab-or-comma covers both without asking the teacher which one they have,
// and without a format toggle nobody would read.
//
// FIXED COLUMN ORDER: first name, last name, email. Not detected, not guessed
// from a header row. Detection fails silently on the roster whose first student
// is named "Email", and the cost of guessing wrong is an account minted under
// the wrong address with a password nobody can recover.

/**
 * The most students one paste may carry.
 *
 * 40. Sized above a full period (30 to 35) with headroom, and bounded for two
 * reasons that point the same way. The bulk route loops provisionStudent
 * serially, so the row count is also the request's duration; and every minted
 * code that does not reach the browser is gone for good, so this is equally a
 * cap on how many codes one dead request can destroy. A 45 student section
 * pastes in two halves, which costs the teacher a click and cannot cost anybody
 * a password.
 *
 * DECLARED HERE, in the module with no imports, so the preview that enforces it
 * in the browser and the zod schema that rejects it on the server read one
 * number. schemas.ts re-exports it rather than restating it.
 */
export const BULK_PROVISION_MAX_ROWS = 40;

/** How a single pasted line came out. Only "ready" may be minted. */
export type RosterRowStatus = "ready" | "missing-field" | "bad-email" | "duplicate";

export interface RosterRow {
  /**
   * 1-based, counted over NON-BLANK lines.
   *
   * Blank lines are dropped rather than reported, because a paste out of a
   * spreadsheet routinely carries a trailing newline and a row that says
   * "line 29 is empty" is noise the teacher has to clear before the Add button
   * unlocks. The cost is that this number drifts from the real line number when
   * a paste has blanks in the middle, which is rare and still lands the teacher
   * in the right neighbourhood.
   */
  line: number;
  firstName: string;
  lastName: string;
  email: string;
  status: RosterRowStatus;
  /** Empty on "ready". Specific enough to act on otherwise. */
  message: string;
}

export interface RosterParse {
  /** Every non-blank line, in paste order, ready and not. */
  rows: RosterRow[];
  /** The subset that may be sent. Same objects, same order. */
  ready: RosterRow[];
  readyCount: number;
  problemCount: number;
}

/**
 * The email rule, shared with the bulk route through schemas.ts.
 *
 * Pragmatic rather than RFC 5322: one @ with something on each side, no
 * whitespace anywhere, and at least one dot in the domain with a non-empty
 * label on both sides of it. That last clause is the one doing real work here.
 * A district roster's most common typo is a truncated domain ("ana@district"),
 * and an address with no dot is exactly the kind of thing that passes a lax
 * check, mints an account, and leaves a student holding a code for a mailbox
 * that cannot exist.
 *
 * 254 is the SMTP maximum for a whole address (RFC 5321), and it also stops a
 * pathological line from being carried any further.
 */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

export function isRosterEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 254) return false;
  return EMAIL_SHAPE.test(trimmed);
}

/** Tab or comma. A line is split on whichever it happens to use, or both. */
const FIELD_SEPARATOR = /[\t,]/;

function classify(parts: string[]): { status: RosterRowStatus; message: string } {
  // MORE THAN THREE FIELDS IS A PROBLEM, NOT A TRUNCATION, and this is the
  // decision most worth stating. "Reyes, Ana Maria, ana@district.edu" splits
  // into four; keeping the first three would mint an account for a student
  // named "Ana Maria" whose email column now holds their surname. Refusing the
  // line puts it in front of the teacher, who is the only one who knows which
  // comma was the separator.
  if (parts.length > 3) {
    return {
      status: "missing-field",
      message: "Too many fields. One student per line: first, last, email.",
    };
  }
  if (parts.length < 3 || parts.some((p) => !p)) {
    return {
      status: "missing-field",
      message: "Needs all three: first name, last name, email.",
    };
  }
  if (!isRosterEmail(parts[2])) {
    return { status: "bad-email", message: "Not a valid email address." };
  }
  return { status: "ready", message: "" };
}

/**
 * Parse a whole paste.
 *
 * DUPLICATES ARE RESOLVED IN PASTE ORDER, first occurrence kept. The second
 * copy is reported against the line the first one is on, so the teacher can see
 * the pair rather than being told a line they are looking at is a duplicate of
 * something unnamed. Compared case-insensitively, because provisionStudent
 * lowercases the address before it looks anything up
 * (app/lib/student-provision.ts:101) and "Ana@district.edu" and
 * "ana@district.edu" are one account there.
 */
export function parseRosterPaste(text: string): RosterParse {
  const rows: RosterRow[] = [];
  // Lowercased email -> the line number that claimed it.
  const seen = new Map<string, number>();
  let line = 0;

  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim()) continue;
    line += 1;

    const parts = rawLine.split(FIELD_SEPARATOR).map((p) => p.trim());
    const [firstName = "", lastName = "", email = ""] = parts;
    let { status, message } = classify(parts);

    if (status === "ready") {
      const key = email.toLowerCase();
      const first = seen.get(key);
      if (first !== undefined) {
        status = "duplicate";
        message = `Same email as line ${first}.`;
      } else {
        seen.set(key, line);
      }
    }

    rows.push({ line, firstName, lastName, email, status, message });
  }

  const ready = rows.filter((r) => r.status === "ready");
  return {
    rows,
    ready,
    readyCount: ready.length,
    problemCount: rows.length - ready.length,
  };
}

/**
 * The count summary under the preview table.
 *
 * Written here rather than in the component so the pluralisation is covered by
 * the parser's own tests. EN only, per the dashboard's language.
 */
export function summarisePaste(parse: RosterParse): string {
  if (parse.rows.length === 0) return "Nothing pasted yet.";
  const ready = `${parse.readyCount} ready`;
  if (parse.problemCount === 0) return ready;
  return `${ready}, ${parse.problemCount} need${parse.problemCount === 1 ? "s" : ""} a fix`;
}
