// CSV serialisation for the teacher exports.
//
// Hand-written rather than pulled from npm, on purpose. The whole surface is
// three rules from RFC 4180 plus one security rule, and the audit that preceded
// this build measured exactly how much the escaping has to carry: of the 4000
// distractor_logic strings in production, 2485 contain a comma and one contains
// a double quote. Quoting is load-bearing here, not theoretical -- a naive join
// on "," would break the column structure of more than half the misconception
// rows.
//
// THE FOUR RULES
//
// 1. A field containing a comma, a double quote, CR or LF is wrapped in double
//    quotes. Internal double quotes are doubled. (RFC 4180 section 2.)
//
// 2. Rows are terminated with CRLF, not LF. RFC 4180 says so, and Excel on
//    Windows is the consumer that cares.
//
// 3. The file opens with a UTF-8 BOM. Without it Excel decodes the bytes as the
//    system codepage and a student named Peña renders as PeÃ±a. Every other
//    consumer either honours the BOM or ignores it; pandas.read_csv handles it
//    natively via the default utf-8 codec on a BOM-prefixed file only if the
//    encoding is utf-8-sig, so the BOM is called out in the handoff notes.
//
// 4. Formula injection is neutralised. A cell whose text begins with =, +, -,
//    @, tab or CR is executed as a formula when the file is opened in Excel or
//    Sheets, which turns an exported class roster into a delivery mechanism for
//    whatever a student typed into their display name. The audit found zero
//    such strings in the bank today. That is a fact about today's data, not a
//    property of the system, so the guard runs anyway.

/**
 * A single cell. Numbers are kept distinct from strings because the injection
 * guard must never fire on a legitimate negative number: -12 is a score, not an
 * attack, and prefixing it would corrupt the column for every consumer.
 */
export type CsvCell = string | number | null | undefined;

/** Comma, double quote, CR or LF anywhere in the field forces quoting. */
const NEEDS_QUOTING = /[",\r\n]/;

/**
 * Leading characters a spreadsheet treats as the start of a formula. Tab and CR
 * are included because both Excel and Sheets strip leading whitespace before
 * deciding, so "\t=cmd" is still a formula.
 */
const FORMULA_LEAD = /^[=+\-@\t\r]/;

/**
 * Render one cell.
 *
 * null and undefined both become the empty field rather than the literal text
 * "null". This matters beyond tidiness: D3 settled that a session with no
 * responses rows gets an EMPTY time_on_items_seconds cell, not a zero, because
 * zero would read as "answered instantly" rather than "not known".
 */
export function escapeCsvCell(value: CsvCell): string {
  if (value === null || value === undefined) return "";

  // Numbers bypass the formula guard entirely. They cannot carry a payload,
  // and a negative number legitimately starts with a minus sign.
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  // Neutralise before quoting, so the apostrophe lands inside the quotes and
  // is part of the field rather than part of the delimiter structure.
  //
  // A leading apostrophe is the standard mitigation: Excel and Sheets both read
  // it as "the rest of this cell is text" and do not display it. It does mean
  // the exported byte differs from the stored byte, which is the correct trade
  // when the alternative is executing it.
  const neutralised = FORMULA_LEAD.test(value) ? `'${value}` : value;

  if (NEEDS_QUOTING.test(neutralised)) {
    return `"${neutralised.replace(/"/g, '""')}"`;
  }

  return neutralised;
}

/** One CRLF-terminated record. */
export function toCsvRow(cells: CsvCell[]): string {
  return cells.map(escapeCsvCell).join(",");
}

/** U+FEFF. Written as an escape so it cannot be lost to an editor or a copy-paste. */
const BOM = "\uFEFF";

/**
 * Assemble a complete file: BOM, header, rows, CRLF throughout.
 *
 * Returns a string. The route handler is responsible for the Content-Type and
 * Content-Disposition headers, so that this stays testable without a Request.
 */
export function buildCsv(header: string[], rows: CsvCell[][]): string {
  const lines = [toCsvRow(header), ...rows.map(toCsvRow)];
  return BOM + lines.join("\r\n") + "\r\n";
}

/**
 * Filename-safe slug for a class name or export label.
 *
 * Class names are teacher-authored free text ("TSIA2 Prep Pre-Cal A", "1st
 * Period"), and they land in a Content-Disposition header where a quote or a
 * newline would let the value break out of the header itself. Reduced to ASCII
 * word characters and single hyphens, then bounded, so the header value is
 * always safe regardless of what was typed into the class name field.
 */
export function slugifyForFilename(value: string, fallback = "class"): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 40);
  return slug || fallback;
}
