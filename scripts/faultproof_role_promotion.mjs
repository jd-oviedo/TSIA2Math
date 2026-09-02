// faultproof_role_promotion.mjs -- prove the webhook writes role correctly, and
// prove each check can fail.
//
//   node scripts/faultproof_role_promotion.mjs
//
// WHAT IS BEING PROVED
// --------------------
// role='teacher' is now written by the Stripe webhook, and the properties that
// make that safe are all properties of ONE statement:
//
//   it is inside the guarded UPDATE, not a second one   atomic with the entitlement
//   it is conditional on a teacher plan                 a student buyer is never promoted
//   there is no else branch                             promote only, never demote
//
// Getting the second wrong hands a teacher dashboard to someone who bought
// Practice Pass. Getting the third wrong demotes a lapsed teacher and strips the
// course tree's second door from them mid-renewal.
//
// WHY SOURCE ASSERTIONS RATHER THAN A RUN
// ---------------------------------------
// writeEntitlement takes a Supabase admin client and writes to a real table, so
// calling it needs either a database or a stub of it, and the value under test
// would then be the stub's. What has to be true is a property of the source: that
// the role key sits inside the same .update() object as the entitlement columns,
// above the ordering predicate. That is readable, and each assertion is run
// against a deliberately broken copy so it has to notice.
//
// Nothing here touches the database, Stripe, or the network.

import { readFileSync } from 'fs';

const FILE = 'app/lib/stripe-activation.ts';
const src = readFileSync(FILE, 'utf8');

let ok = true;
const check = (name, pass, detail = '') => {
  ok &&= pass;
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? `  ${detail}` : ''}`);
  return pass;
};

// The whole guarded UPDATE, from the call through to the ordering predicate.
// Every positional assertion below is made against THIS slice rather than the
// file, so "inside the statement" is actually being tested.
//
// SCOPED TO writeEntitlement FIRST, and that is load bearing rather than tidy.
// This used to match from the file's first `const { data, error } = await admin`.
// The moment linkCustomerId gained one of its own -- above writeEntitlement --
// the non-greedy match started at THAT statement and ran all the way down to
// writeEntitlement's ordering predicate, swallowing everything in between. The
// slice stopped meaning "inside the guarded UPDATE" and started meaning "anywhere
// in the second half of the file", and two assertions silently stopped noticing
// the fault they exist for. Caught by the fault matrix below, which is the whole
// argument for having one.
//
// RE-ANCHORED WHEN THE TRIPWIRE SHORTENING GUARD LANDED. The statement used to
// be one expression -- `const { data, error } = await admin.from(...)...` -- and
// this matched from that opening through the ordering predicate. It is now built
// in two steps (`const query = admin...`, then a conditional compare-and-set on
// access_until, then `await guarded.select("id")`), so that a tripwire write can
// pin the column to the value its guard read. The slice therefore runs from the
// builder to the awaited terminator, which is the same span it always meant:
// everything that is part of ONE guarded UPDATE, and nothing after it.
//
// Deliberately anchored at BOTH ends rather than loosened to "the rest of the
// function". A slice that ran to the end would swallow a second, ungated
// statement injected after the write -- which is exactly the last fault in the
// matrix below, and exactly what this scoping exists to notice.
const updateBlock = (s) => {
  const fnStart = s.indexOf('export async function writeEntitlement');
  if (fnStart === -1) return '';
  const m = s.slice(fnStart).match(
    /const query = admin[\s\S]*?const \{ data, error \} = await guarded\.select\("id"\);/
  );
  return m ? m[0] : '';
};

const ASSERTIONS = {
  'role is written at all': (s) => /role: "teacher"/.test(s),

  'role is written INSIDE the guarded update, not as a second statement': (s) =>
    /role: "teacher"/.test(updateBlock(s)),

  'it is conditional, not unconditional': (s) =>
    /\.\.\.\((?:[^)]|\)(?!\s*,))*?\?\s*\{ role: "teacher" \}/s.test(updateBlock(s)),

  'the condition is the two teacher plans': (s) => {
    const b = updateBlock(s);
    return (
      /write\.plan === "teacher-core"/.test(b) && /write\.plan === "teacher-pro"/.test(b)
    );
  },

  'a student plan is never named as a promoting plan': (s) => {
    const b = updateBlock(s);
    const near = b.slice(Math.max(0, b.indexOf('role: "teacher"') - 400));
    return !/practice-pass|full-course/.test(near);
  },

  'PROMOTE ONLY: the conditional has no else that writes a role': (s) =>
    /\?\s*\{ role: "teacher" \}\s*:\s*\{\}/s.test(updateBlock(s)),

  'the ordering predicate still guards the whole write': (s) =>
    /role: "teacher"[\s\S]*?\.eq\("id", profileId\)[\s\S]*?plan_updated_at\.lt/.test(
      updateBlock(s)
    ),

  'the entitlement columns are still in the same object as role': (s) => {
    const b = updateBlock(s);
    return /plan: write\.plan/.test(b) && /plan_status: write\.planStatus/.test(b);
  },
};

// Each fault is one edit to a COPY of the source. `expect` names the assertions
// that must go red; every other one must stay green, which is what stops a fault
// from passing by breaking everything.
const FAULTS = [
  {
    name: 'role is promoted unconditionally, so a Practice Pass buyer becomes a teacher',
    edit: (s) =>
      s.replace(
        /\.\.\.\(write\.plan === "teacher-core" \|\| write\.plan === "teacher-pro"\s*\?\s*\{ role: "teacher" \}\s*:\s*\{\}\),/s,
        'role: "teacher",'
      ),
    expect: [
      'it is conditional, not unconditional',
      'the condition is the two teacher plans',
      'PROMOTE ONLY: the conditional has no else that writes a role',
    ],
  },
  {
    name: 'the condition is widened to a student plan',
    edit: (s) => s.replace('write.plan === "teacher-pro"', 'write.plan === "full-course"'),
    expect: ['the condition is the two teacher plans', 'a student plan is never named as a promoting plan'],
  },
  {
    name: 'an else branch demotes a lapsed teacher',
    edit: (s) => s.replace(': {}),\n    })', ': { role: "student" }),\n    })'),
    expect: ['PROMOTE ONLY: the conditional has no else that writes a role'],
  },
  {
    name: 'role is moved out into a second, ungated statement',
    edit: (s) =>
      s
        .replace(
          /\s*\.\.\.\(write\.plan === "teacher-core" \|\| write\.plan === "teacher-pro"\s*\?\s*\{ role: "teacher" \}\s*:\s*\{\}\),/s,
          ''
        )
        // Anchored on writeEntitlement's OWN error check. A bare 'if (error) {'
        // now matches linkCustomerId's first, which would inject the second
        // statement into the wrong function entirely -- the assertion would still
        // go red, but for a reason the fault does not claim.
        .replace(
          'if (error) {\n    // Surfaced to the caller as a throw',
          'await admin.from("profiles").update({ role: "teacher" }).eq("id", profileId);\n\n' +
            '  if (error) {\n    // Surfaced to the caller as a throw'
        ),
    expect: [
      'role is written INSIDE the guarded update, not as a second statement',
      'it is conditional, not unconditional',
      'the condition is the two teacher plans',
      'PROMOTE ONLY: the conditional has no else that writes a role',
      'the ordering predicate still guards the whole write',
    ],
  },
];

console.log('\nCLEAN SOURCE, every property must hold:\n');
for (const [name, predicate] of Object.entries(ASSERTIONS)) check(name, predicate(src));

console.log('\nFAULT INJECTION, each check must notice its own fault:\n');
for (const fault of FAULTS) {
  const broken = fault.edit(src);
  if (broken === src) {
    check(`fault applies: ${fault.name}`, false, 'the edit matched nothing, so it proves nothing');
    continue;
  }
  let faultOk = true;
  for (const [name, predicate] of Object.entries(ASSERTIONS)) {
    const held = predicate(broken);
    const shouldFail = fault.expect.includes(name);
    if (shouldFail && held) {
      faultOk = false;
      console.log(`  [FAIL] ${fault.name}  ->  "${name}" did NOT notice`);
    }
    if (!shouldFail && !held) {
      faultOk = false;
      console.log(`  [FAIL] ${fault.name}  ->  "${name}" broke as collateral, so the fault is too broad`);
    }
  }
  check(`fault caught: ${fault.name}`, faultOk);
}

console.log(ok ? '\nAll role promotion checks passed.\n' : '\nFAILURES above.\n');
process.exit(ok ? 0 : 1);
