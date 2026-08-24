// verify_due_date_agreement.mjs -- prove Home and the Assignments page print
// the SAME day for the same assignment.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_due_date_agreement.mjs
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_due_date_agreement.mjs --fault=unshared
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_due_date_agreement.mjs --fault=ssr
//
// THE BUG THIS PINS. A teacher in US Central set an assignment due Aug 28. Home
// said "Aug 29", the Assignments page said "Aug 28", and it was the same row.
// Both files held a byte-identical formatDue, so the formatter was never the
// difference -- the RENDERER was. Home rendered during SSR, where the server's
// zone is UTC; the list did not, because it returns null until its clock effect
// fires. See formatDue in app/lib/assignments.ts for the whole mechanism.
//
// WHY A FAULT RUN. A check that only ever watches the fixed code agree with
// itself cannot tell a fix from a coincidence. Each fault reintroduces one half
// of the original bug, and the run FAILS if the check does not catch it.
//
//   --fault=unshared  Home gets its own private copy of formatDue again
//   --fault=ssr       Home formats in the SERVER's zone again
//
// THE ZONE IS SET BY RE-EXEC, not by assigning process.env.TZ mid-run. Node
// caches the resolved zone the first time Intl is touched, so a mutation after
// that is silently ignored -- which would make every case "agree" for the wrong
// reason and turn this file into the decoration it is meant to prevent.
//
// PURE. No Supabase, no next build, no browser.

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { formatDue } from '../app/lib/assignments.ts';

const SELF = fileURLToPath(import.meta.url);
const FAULTS = ['unshared', 'ssr'];

// ─── Child mode ──────────────────────────────────────────────────────────────
// Renders exactly one string in whatever TZ the parent gave it, and exits.
const emitAt = process.argv.indexOf('--emit');
if (emitAt !== -1) {
  const [iso, surface, childFault] = process.argv.slice(emitAt + 1);
  process.stdout.write(
    childFault === 'unshared' && surface === 'home'
      ? // THE ORIGINAL SHAPE: a second private copy, drifted by one option --
        // which is exactly how a duplicated formatter dies. Somebody improves
        // one of them.
        new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      : formatDue(iso)
  );
  process.exit(0);
}

// ─── Parent ──────────────────────────────────────────────────────────────────

const arg = process.argv.find((a) => a.startsWith('--fault='));
const fault = arg ? arg.slice('--fault='.length) : null;
if (fault && !FAULTS.includes(fault)) {
  console.error(`Unknown fault "${fault}". Known: ${FAULTS.join(', ')}`);
  process.exit(2);
}

// The row that actually caused this. Read from production 2026-08-24:
// assignments.fc699d6e-..., AR.1.1, targeting vics8388. The teacher picked
// Aug 28 in a US Central browser; NewAssignment.tsx:98 stores 23:59 LOCAL,
// which is 04:59Z the next day. That five-hour offset is the entire bug, and a
// fixture without it proves nothing.
const CASES = [
  { label: 'AR.1.1  live row, teacher picked Aug 28 in US Central', iso: '2026-08-29T04:59:00+00:00', meant: 'Aug 28' },
  { label: 'GR.4.3  live row, teacher picked Sep 5',                iso: '2026-09-05T23:59:00+00:00', meant: 'Sep 5'  },
  { label: 'midnight UTC exactly, the boundary itself',             iso: '2026-08-29T00:00:00+00:00', meant: 'Aug 28' },
  { label: 'midday UTC, which no zone in play can move',            iso: '2026-08-29T12:00:00+00:00', meant: 'Aug 29' },
];

const STUDENT_TZ = 'America/Chicago';
const SERVER_TZ = 'UTC';

function renderIn(tz, iso, surface) {
  return execFileSync(
    process.execPath,
    ['--import', './scripts/ts-alias-hook.mjs', SELF, '--emit', iso, surface, fault ?? ''],
    { env: { ...process.env, TZ: tz }, encoding: 'utf8' }
  ).trim();
}

console.log(fault ? `FAULT: ${fault}\n` : 'CLEAN RUN. Both surfaces must agree on every case.\n');
console.log(`student zone ${STUDENT_TZ}    server zone ${SERVER_TZ}\n`);

let disagreements = 0;

for (const c of CASES) {
  // The list is ALWAYS the browser: it returns null until its clock effect
  // fires (AssignmentsList.tsx:155), so the server never renders its date.
  const list = renderIn(STUDENT_TZ, c.iso, 'list');

  // Home is the browser too, now. The ssr fault puts it back on the server,
  // which is what the missing `now` gate did.
  const homeZone = fault === 'ssr' ? SERVER_TZ : STUDENT_TZ;
  const home = renderIn(homeZone, c.iso, 'home');

  const agree = home === list;
  const meantOk = list === c.meant;
  if (!agree || !meantOk) disagreements += 1;

  console.log(`${agree && meantOk ? 'PASS' : 'FAIL'}  ${c.label}`);
  console.log(`        due_at  ${c.iso}`);
  console.log(`        Home    "${home}"${fault === 'ssr' ? `   <- rendered in ${SERVER_TZ}` : ''}`);
  console.log(`        List    "${list}"`);
  console.log(`        teacher meant "${c.meant}"  ${meantOk ? 'matched' : 'NOT MATCHED'}${agree ? '' : '   DISAGREE'}`);
  console.log();
}

if (!fault) {
  if (disagreements > 0) {
    console.log(`CLEAN RUN FAILED: ${disagreements} case(s) wrong. The fix is not in place.`);
    process.exit(1);
  }
  console.log('CLEAN RUN: every case agrees, and every case prints the day the teacher picked.');
  process.exit(0);
}

// A fault that changes nothing means this check is decorative.
if (disagreements === 0) {
  console.log(`FAULT "${fault}" REDDENED NOTHING. The check cannot detect the bug it exists for.`);
  process.exit(1);
}
console.log(`FAULT "${fault}" correctly caught: ${disagreements} case(s) wrong, as they were before the fix.`);
process.exit(0);
