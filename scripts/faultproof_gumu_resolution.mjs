// faultproof_gumu_resolution.mjs -- prove gumu_sessions.resolution is written,
// with the right value for each of the two endings, and prove each check can
// fail.
//
//   node scripts/faultproof_gumu_resolution.mjs
//
// WHAT IS BEING PROVED
// --------------------
// The column added in sql/gumu_sessions_resolution.sql is about to decide which
// students get a worked solution released to them, so the value it carries has
// to be right in a specific direction:
//
//   the escape hatch was used   -> 'student_gave_up'   the answer WAS disclosed
//   GUMU ran out of turns       -> 'turn_cap'          the answer was NOT
//
// Getting those the wrong way round would release worked solutions to every
// student who ran out of turns without ever being shown an answer. That is the
// fault this file exists for; it is number 3 below.
//
// WHY SOURCE ASSERTIONS RATHER THAN A RUN
// ---------------------------------------
// resolveFlagged is a module-private function inside a Next route handler. It
// takes a Supabase admin client, writes to a real table and notifies a real
// teacher, so calling it needs either a database or a stub of it, and the value
// under test would then be the stub's. What actually has to be true is a
// property of the source: that the update carries `resolution`, that it carries
// the reason rather than a literal, and that the two call sites pass the two
// reasons the right way round. Those are readable, and each one is faulted below
// against a copy of the text so the check has to notice.
//
// Nothing here touches the database. There is no account and no DDL involved.

import { readFileSync } from 'fs';

const ROUTE = 'app/api/gumu/session/route.ts';
const src = readFileSync(ROUTE, 'utf8');

let ok = true;
const check = (name, pass, detail = '') => {
  ok &&= pass;
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? `  ${detail}` : ''}`);
  return pass;
};

// Each assertion is a predicate over the source text, so the same predicate can
// be run against a deliberately broken copy to show it notices.
const ASSERTIONS = {
  'the update carries a resolution at all': (s) =>
    /\.update\(\{[^}]*resolution:/s.test(s),

  'it carries the reason, not a hardcoded value': (s) =>
    /resolution:\s*reason\b/.test(s),

  'the escape hatch resolves as student_gave_up': (s) =>
    /action\.action === "reveal"[\s\S]{0,200}?resolveFlagged\(admin, gumuSession, "student_gave_up"\)/.test(
      s
    ),

  'the turn cap resolves as turn_cap': (s) =>
    /resolveFlagged\(\s*admin,\s*\{ \.\.\.gumuSession, turn_count: turnCount \},\s*"turn_cap"\s*\)/.test(
      s
    ),

  'the two endings do not share a value': (s) => {
    // `admin,` rather than `admin`: resolveFlagged's own declaration begins
    // `resolveFlagged(admin: SupabaseAdmin` and its `reason` parameter type
    // names BOTH literals, so a looser match counts the signature as a third
    // call site and this check fails against correct code.
    const reasons = [
      ...s.matchAll(/resolveFlagged\(\s*admin\s*,[^)]*?"(turn_cap|student_gave_up)"/gs),
    ].map((m) => m[1]);
    return (
      reasons.length === 2 &&
      reasons.includes('turn_cap') &&
      reasons.includes('student_gave_up')
    );
  },

  'status is still written alongside it': (s) =>
    /\.update\(\{[^}]*status:\s*"resolved_flagged"/s.test(s),

  'the update error is captured': (s) =>
    /const \{ error: resolveError \} = await admin/.test(s),

  'and logged rather than dropped': (s) =>
    /if \(resolveError\) \{[\s\S]{0,200}console\.error/.test(s),
};

// The faults. Each is a string edit to a COPY of the source -- nothing is
// written to disk -- chosen to be the mistake somebody would actually make.
const FAULTS = [
  {
    name: 'resolution is left out of the update',
    apply: (s) => s.replace(/\n\s*resolution: reason,/, ''),
    breaks: 'the update carries a resolution at all',
  },
  {
    name: 'resolution is hardcoded instead of passed through',
    apply: (s) => s.replace('resolution: reason,', 'resolution: "turn_cap",'),
    breaks: 'it carries the reason, not a hardcoded value',
  },
  {
    // THE DANGEROUS ONE. Every student who ran out of turns is recorded as
    // having been shown the answer, and PR 2 would then release a worked
    // solution to all of them.
    name: 'the turn cap is recorded as student_gave_up',
    apply: (s) =>
      s.replace(
        /(resolveFlagged\(\s*admin,\s*\{ \.\.\.gumuSession, turn_count: turnCount \},\s*)"turn_cap"/,
        '$1"student_gave_up"'
      ),
    breaks: 'the turn cap resolves as turn_cap',
  },
  {
    name: 'the escape hatch is recorded as turn_cap',
    apply: (s) => s.replace('resolveFlagged(admin, gumuSession, "student_gave_up")', 'resolveFlagged(admin, gumuSession, "turn_cap")'),
    breaks: 'the escape hatch resolves as student_gave_up',
  },
  {
    name: 'the update error goes back to being ignored',
    apply: (s) =>
      s.replace('const { error: resolveError } = await admin', 'await admin'),
    breaks: 'the update error is captured',
  },
];

console.log(`1. the write, as it stands in ${ROUTE}`);
for (const [name, predicate] of Object.entries(ASSERTIONS)) {
  check(name, predicate(src));
}

console.log('\n2. each check can fail');
for (const fault of FAULTS) {
  const faulted = fault.apply(src);
  if (faulted === src) {
    check(`fault applies: ${fault.name}`, false, 'the edit matched nothing, so it proves nothing');
    continue;
  }
  const caught = ASSERTIONS[fault.breaks](faulted) === false;
  check(`caught: ${fault.name}`, caught, caught ? '' : `-> "${fault.breaks}" still passed`);
}

// A fault that breaks nothing is a check that was not testing what it claimed,
// so the reverse is asserted too: the clean source passes every predicate the
// faults target.
console.log('\n3. and the clean source is not passing by accident');
for (const fault of FAULTS) {
  check(`clean source satisfies "${fault.breaks}"`, ASSERTIONS[fault.breaks](src));
}

console.log(
  `\nRESULT: ${ok ? 'resolution is written, both endings are right way round, and the checks can tell' : 'A CHECK FAILED'}`
);
process.exit(ok ? 0 : 1);
