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
const updateBlock = (s) => {
  const m = s.match(
    /const \{ data, error \} = await admin[\s\S]*?\.or\(`plan_updated_at\.is\.null,plan_updated_at\.lt\.\$\{eventAt\}`\)/
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
        .replace(
          'if (error) {',
          'await admin.from("profiles").update({ role: "teacher" }).eq("id", profileId);\n\n  if (error) {'
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
