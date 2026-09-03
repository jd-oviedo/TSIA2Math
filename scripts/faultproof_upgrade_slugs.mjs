// faultproof_upgrade_slugs.mjs -- prove /upgrade's slug table is right, and prove
// each check can fail.
//
//   node scripts/faultproof_upgrade_slugs.mjs
//
// WHY THIS EXISTS
// ---------------
// A slug paired with the wrong Payment Link is SILENT. The buyer reaches a real
// Stripe checkout, pays a real amount, and the webhook records the plan the LINK
// says rather than the one the button promised. Nothing anywhere would flag it:
// not a type, not a test of behaviour, not the buyer, who has no way to know the
// button lied. The only defence is asserting the pairing.
//
// The URL suffixes are sequential by product (…7AI04 through …7AI09), which is
// how the two extra founding links were found in the first place, and it is what
// makes the pairing checkable rather than merely reviewable.
//
// Nothing here touches Stripe, the network or the database.

import { readFileSync } from 'fs';

const ROUTE = 'app/upgrade/route.ts';
const src = readFileSync(ROUTE, 'utf8');

let ok = true;
const check = (name, pass, detail = '') => {
  ok &&= pass;
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? `  ${detail}` : ''}`);
  return pass;
};

// slug -> { url, plan }, parsed out of the table rather than re-declared, so the
// assertions below read the real thing.
const parse = (s) => {
  const out = {};
  const re = /"([a-z-]+)":\s*\{\s*url:\s*"([^"]+)",\s*plan:\s*"([a-z-]+)",\s*\}/g;
  let m;
  while ((m = re.exec(s))) out[m[1]] = { url: m[2], plan: m[3] };
  return out;
};

// The contract, from lib/plans.ts in unpackmath-home, and the six URLs as
// confirmed against the Stripe dashboard on 2026-08-19.
const EXPECTED = {
  'practice-pass': ['https://buy.stripe.com/eVqaEXdby0fa7XXgXR7AI04', 'practice-pass'],
  'full-course': ['https://buy.stripe.com/3cI4gz5J6aTOeml7nh7AI05', 'full-course'],
  'teacher-monthly': ['https://buy.stripe.com/5kQaEX5J6e603HH4b57AI06', 'teacher-core'],
  'teacher-annual': ['https://buy.stripe.com/00w5kD5J6bXSa657nh7AI07', 'teacher-core'],
  'teacher-pro-monthly': ['https://buy.stripe.com/eVq9ATgnK0fa2DDbDx7AI08', 'teacher-pro'],
  'teacher-pro-annual': ['https://buy.stripe.com/fZudR96Nafa4fqpbDx7AI09', 'teacher-pro'],
  // The $5 tripwire, pasted by Juan on 2026-09-03. The route refuses any row
  // still carrying the PASTE_THE_ placeholder (see isSellable), and the check
  // below asserts this one is a real link.
  'tripwire': ['https://buy.stripe.com/bJeaEXgnK8LG1zzcHB7AI0a', 'full-course'],
};

const SLUG_COUNT = Object.keys(EXPECTED).length;
const PLACEHOLDER_MARKER = 'PASTE_THE_';

// The two founding links. Reachable directly until Friday, never sellable here.
const FOUNDING = ['9B614ndby1je9210YT7AI02', 'fZu6oH8Vi3rm921cHB7AI03'];

const ASSERTIONS = {
  'all seven marketing slugs are accepted': (s) => {
    const t = parse(s);
    return Object.keys(EXPECTED).every((k) => k in t) && Object.keys(t).length === SLUG_COUNT;
  },

  // A placeholder URL must never be forwarded to. The gate is matched on the
  // marker rather than on the slug, so it also covers any future row that ships
  // before its link exists.
  'an unpasted placeholder URL is refused before the forward': (s) => {
    const code = s.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    return (
      new RegExp(`const UNPASTED_MARKER = "${PLACEHOLDER_MARKER}"`).test(code) &&
      /if \(!isSlug\(plan\) \|\| !isSellable\(PRODUCTS\[plan\]\)\)/.test(code)
    );
  },

  // The only slug whose forward is guarded, and the guard must be the shared
  // plan-agnostic predicate: planGrants alone would wave a Practice Pass holder
  // through to a $5 purchase the webhook then refuses.
  'the tripwire forward is guarded on the plan-agnostic predicate': (s) => {
    const code = s.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const guardCall = /if \(plan === TRIPWIRE_SLUG\) \{\s*const held = await tripwireHolderGuard\(user\.id\);/.test(code);
    const fn = code.slice(code.indexOf('async function tripwireHolderGuard'), code.indexOf('export async function GET'));
    return guardCall && /isEntitledWithLegacyFallback\(/.test(fn) && !/if \(planGrants\(/.test(fn);
  },

  'each slug carries the URL confirmed in the Stripe dashboard': (s) => {
    const t = parse(s);
    return Object.entries(EXPECTED).every(([slug, [url]]) => t[slug]?.url === url);
  },

  'each slug names the product it actually sells': (s) => {
    const t = parse(s);
    return Object.entries(EXPECTED).every(([slug, [, plan]]) => t[slug]?.plan === plan);
  },

  'the tripwire URL is a real link, not the placeholder': (s) =>
    !parse(s).tripwire?.url.includes(PLACEHOLDER_MARKER),

  'no two slugs share a URL': (s) => {
    const urls = Object.values(parse(s)).map((p) => p.url);
    return new Set(urls).size === urls.length;
  },

  'NEITHER FOUNDING LINK IS SELLABLE HERE': (s) => {
    const t = parse(s);
    return !Object.values(t).some((p) => FOUNDING.some((f) => p.url.includes(f)));
  },

  'the monthly and annual slugs are gone': (s) => {
    const t = parse(s);
    return !('monthly' in t) && !('annual' in t);
  },

  'the sign-in role is derived, not hardcoded': (s) =>
    /planGrants\(product\.plan, "teacher-dashboard"\) \? "teacher" : "student"/.test(s) &&
    !/searchParams\.set\("role", "teacher"\)/.test(s),

  'client_reference_id is still forwarded to Stripe': (s) =>
    /paymentLink\.searchParams\.set\("client_reference_id", user\.id\)/.test(s),

  // Comments stripped first. The previous version searched the raw source for
  // "/api/stripe/checkout" and so failed on the clean file, because the header
  // comment mentions that route by name to say it stays orphaned. An assertion
  // that a PROSE mention breaks is worse than no assertion: it goes red for the
  // right words rather than the wrong code.
  'no checkout session is created here': (s) => {
    const code = s.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    return !/checkout\.sessions\.create/.test(code) && !/getStripe/.test(code);
  },
};

const FAULTS = [
  {
    name: 'a founding link is restored as a sellable slug',
    edit: (s) =>
      s.replace(
        '"practice-pass": {\n    url: "https://buy.stripe.com/eVqaEXdby0fa7XXgXR7AI04",',
        '"practice-pass": {\n    url: "https://buy.stripe.com/9B614ndby1je9210YT7AI02",'
      ),
    expect: [
      'each slug carries the URL confirmed in the Stripe dashboard',
      'NEITHER FOUNDING LINK IS SELLABLE HERE',
    ],
  },
  {
    name: 'two slugs are pointed at the same link, so one product is unreachable',
    edit: (s) =>
      s.replace(
        'url: "https://buy.stripe.com/00w5kD5J6bXSa657nh7AI07"',
        'url: "https://buy.stripe.com/5kQaEX5J6e603HH4b57AI06"'
      ),
    expect: ['each slug carries the URL confirmed in the Stripe dashboard', 'no two slugs share a URL'],
  },
  {
    name: 'Teacher Pro annual is mislabelled as Teacher Core, so the webhook records the wrong tier',
    edit: (s) =>
      s.replace(
        'url: "https://buy.stripe.com/fZudR96Nafa4fqpbDx7AI09",\n    plan: "teacher-pro",',
        'url: "https://buy.stripe.com/fZudR96Nafa4fqpbDx7AI09",\n    plan: "teacher-core",'
      ),
    expect: ['each slug names the product it actually sells'],
  },
  {
    name: 'the role reverts to a hardcoded teacher, handing a student buyer a teacher account',
    edit: (s) =>
      s.replace(
        /const role = planGrants\([^;]*;/s,
        'const role = "teacher" as const;'
      ),
    expect: ['the sign-in role is derived, not hardcoded'],
  },
  {
    name: 'a slug is dropped, so one pricing button silently bounces',
    edit: (s) =>
      s.replace(
        /\s*"teacher-pro-annual": \{[\s\S]*?\},\n/,
        '\n'
      ),
    // Dropping a row breaks three assertions, not one: the slug is gone, so its
    // URL and its plan are gone with it. Listed rather than narrowed, because
    // the collateral IS the correct behaviour here.
    expect: [
      'all seven marketing slugs are accepted',
      'each slug carries the URL confirmed in the Stripe dashboard',
      'each slug names the product it actually sells',
    ],
  },
  {
    name: 'the placeholder gate is removed, so an unpasted URL is forwarded to',
    edit: (s) => s.replace('if (!isSlug(plan) || !isSellable(PRODUCTS[plan])) {', 'if (!isSlug(plan)) {'),
    expect: ['an unpasted placeholder URL is refused before the forward'],
  },
  {
    name: 'the tripwire is mislabelled as practice-pass, so a $5 buyer is recorded on the wrong plan',
    edit: (s) =>
      s.replace(
        'url: "https://buy.stripe.com/bJeaEXgnK8LG1zzcHB7AI0a",\n    plan: "full-course",',
        'url: "https://buy.stripe.com/bJeaEXgnK8LG1zzcHB7AI0a",\n    plan: "practice-pass",'
      ),
    expect: ['each slug names the product it actually sells'],
  },
  {
    name: 'the holder guard is downgraded to planGrants, so a Practice Pass holder is sold the tripwire',
    edit: (s) =>
      s.replace(
        /const ownLive = isEntitledWithLegacyFallback\([\s\S]*?\);/,
        'const ownLive = false;\n    if (planGrants(row.plan, "curriculum")) return "/dashboard?upgrade=held";'
      ),
    expect: ['the tripwire forward is guarded on the plan-agnostic predicate'],
  },
  {
    name: 'the guard is no longer called on the tripwire forward',
    edit: (s) => s.replace('if (plan === TRIPWIRE_SLUG) {', 'if (plan === "never") {'),
    expect: ['the tripwire forward is guarded on the plan-agnostic predicate'],
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

console.log(ok ? '\nAll upgrade slug checks passed.\n' : '\nFAILURES above.\n');
process.exit(ok ? 0 : 1);
