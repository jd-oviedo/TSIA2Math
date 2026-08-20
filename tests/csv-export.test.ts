import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeCsvCell,
  toCsvRow,
  buildCsv,
  slugifyForFilename,
} from '../app/lib/csv.ts';

// CSV serialisation for the teacher exports.
//
// The strings asserted here are not invented. They are the shapes the Phase 1
// audit actually measured in the production item bank, because a CSV writer
// tested against "a,b,c" passes while being useless on the data it will meet:
//
//   4000  distractor_logic strings in the bank
//   2485  contain a comma          -> quoting is exercised by 62% of rows
//      1  contains a double quote  -> QR_A_065 option A, asserted verbatim below
//      0  contain a newline        -> guarded anyway, see the note on that test
//      0  begin with = + - or @    -> guarded anyway, same reason
//
// The two zeros are the interesting ones. They are facts about today's bank, not
// invariants of the system: the bank is edited by hand, and display names come
// from whatever a student typed into their Google account. A guard that is only
// written once the data proves it necessary is a guard written after the
// incident.

// Verbatim from the production bank, QR_A_065 option A. The only string in 4000
// carrying a double quote, and it carries a comma as well, so it exercises both
// halves of RFC 4180 quoting at once.
const REAL_QUOTED =
  'Student attaches the "20 more" to the pretzels instead of the hot dogs, ' +
  'writing 3(p + 20) and 4p.';

// Verbatim from PR_P_077 option C. Commas plus LaTeX, the ordinary case for
// misconception_label_raw.
const REAL_COMMA =
  'Student divides the change by the new value instead of the original: ' +
  '$\\frac{1}{4}$ = 25%.';

test('the one double-quoted string in the bank survives a round trip', () => {
  const got = escapeCsvCell(REAL_QUOTED);

  // Wrapped, because of the comma. Internal quotes doubled, because of RFC 4180.
  assert.equal(
    got,
    '"Student attaches the ""20 more"" to the pretzels instead of the hot dogs, ' +
      'writing 3(p + 20) and 4p."'
  );

  // The assertion that actually matters: a naive parser splitting on commas
  // outside quotes must see ONE field, not two.
  assert.equal(parseCsvLine(got).length, 1);
  assert.equal(parseCsvLine(got)[0], REAL_QUOTED);
});

test('a comma-bearing distractor string stays one field', () => {
  const row = toCsvRow(['QR.2.3', REAL_COMMA, 4]);
  const fields = parseCsvLine(row);
  assert.equal(fields.length, 3);
  assert.equal(fields[1], REAL_COMMA);
  assert.equal(fields[2], '4');
});

test('a field containing a newline does not become two rows', () => {
  // Zero strings in the bank contain a newline today. This asserts the guard
  // rather than the data: class names are free text typed by a teacher, and a
  // pasted multi-line name would otherwise split the roster mid-row.
  const row = toCsvRow(['1st Period\nSection B', 940]);
  assert.equal(row, '"1st Period\nSection B",940');
  assert.equal(parseCsvLine(row).length, 2);
});

test('formula injection is neutralised in text cells', () => {
  // The classic payload. Without the guard, opening the roster in Excel prompts
  // to launch a process.
  assert.equal(escapeCsvCell('=cmd|\' /C calc\'!A0'), "'=cmd|' /C calc'!A0");
  assert.equal(escapeCsvCell('+1234'), "'+1234");
  assert.equal(escapeCsvCell('-1+1'), "'-1+1");
  assert.equal(escapeCsvCell('@SUM(1+1)'), "'@SUM(1+1)");

  // Leading whitespace is stripped by the spreadsheet before it decides, so a
  // tab does not hide the payload from Excel and must not hide it from us.
  assert.equal(escapeCsvCell('\t=1+1'), "'\t=1+1");
});

test('a negative score is a number, not an attack', () => {
  // The guard must never fire on numeric cells. A score, a delta or a theta can
  // legitimately begin with a minus sign, and prefixing it would corrupt the
  // column for every consumer that reads it as a number.
  assert.equal(escapeCsvCell(-12), '-12');
  assert.equal(escapeCsvCell(0), '0');
  assert.equal(escapeCsvCell(940), '940');
});

test('empty is empty, and never the text "null"', () => {
  // D3: a session with no responses rows gets an EMPTY time_on_items_seconds
  // cell. Zero would read as "answered instantly" rather than "not known".
  assert.equal(escapeCsvCell(null), '');
  assert.equal(escapeCsvCell(undefined), '');
  assert.equal(toCsvRow(['Ana', null, 3]), 'Ana,,3');
  assert.equal(escapeCsvCell(Number.NaN), '');
});

test('the file opens with a BOM and uses CRLF throughout', () => {
  const csv = buildCsv(['class_name', 'student_name'], [['1st Period', 'Ana Ruiz']]);

  assert.equal(csv.charCodeAt(0), 0xfeff, 'missing UTF-8 BOM');
  assert.equal(csv, '\uFEFFclass_name,student_name\r\n1st Period,Ana Ruiz\r\n');

  // A bare LF anywhere outside a quoted field would mean a consumer splitting
  // on CRLF sees one giant row.
  assert.equal(csv.split('\r\n').length, 3);
});

test('accented names survive as UTF-8', () => {
  // Production carries zero non-ASCII display names today, which is exactly why
  // this is asserted rather than assumed: the first Peña or Martínez to sign up
  // must not be the one who discovers the encoding is wrong.
  const csv = buildCsv(['student_name'], [['Luis Peña'], ['José Martínez']]);
  assert.ok(csv.includes('Luis Peña'));
  assert.ok(csv.includes('José Martínez'));
  assert.equal(Buffer.from(csv, 'utf8').toString('utf8'), csv);
});

test('class names are reduced to a safe filename slug', () => {
  assert.equal(slugifyForFilename('TSIA2 Prep Pre-Cal A'), 'tsia2-prep-pre-cal-a');
  assert.equal(slugifyForFilename('1st Period'), '1st-period');
  assert.equal(slugifyForFilename('Señora Ruiz / Algebra II'), 'senora-ruiz-algebra-ii');

  // A class name is free text and lands in a Content-Disposition header, where
  // a quote or a newline would let the value break out of the header itself.
  assert.equal(slugifyForFilename('a"; drop\nthings'), 'a-drop-things');
  assert.equal(slugifyForFilename('!!!'), 'class');
  assert.ok(slugifyForFilename('x'.repeat(200)).length <= 40);
});

// ─── A parser to assert against ──────────────────────────────────────────────
//
// Deliberately written to the RFC rather than reusing the writer's own logic. A
// round-trip through the same assumptions proves nothing: if the writer forgets
// to double an internal quote, a reader that also forgets will agree with it.
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      out.push(field);
      field = '';
    } else {
      field += c;
    }
  }
  out.push(field);
  return out;
}
