// faultproof_crisis_screen.mjs -- prove the crisis screen actually sits in front
// of the tutor and the transcript, and prove each check can fail.
//
//   node scripts/faultproof_crisis_screen.mjs
//
// WHAT IS BEING PROVED
// --------------------
// tests/crisis.test.ts covers the decidable half: the floor, the threshold, the
// failure direction, the copy. None of that is worth anything if the screen is
// wired into the route in the wrong place. The properties that matter here are
// properties of ORDER:
//
//   the screen runs BEFORE askGumu            no Socratic reply to a disclosure
//   the screen runs BEFORE the message insert  the disclosure is not persisted
//
// The second is achieved by ordering rather than by a delete, deliberately: a
// write followed by a delete leaves the row in WAL and in backups, which is a
// worse posture than never having written it. So "the insert comes after the
// screen" IS the privacy property, and it is exactly the kind of thing that
// survives a refactor by luck rather than by design.
//
// WHY SOURCE ASSERTIONS RATHER THAN A RUN
// ---------------------------------------
// Same reason as faultproof_gumu_resolution.mjs, plus one more. The route
// requires an authenticated session, and the harness cannot complete a Google
// OAuth sign-in, so the authenticated branch has no automated probe coverage at
// all. That is a known structural gap, recorded rather than papered over. What
// can be checked honestly is the source, and each assertion below is run against
// a deliberately broken copy so it has to notice.
//
// Nothing here touches the database, the model, or the network.

import { readFileSync } from 'fs';

const ROUTE = 'app/api/gumu/session/route.ts';
const src = readFileSync(ROUTE, 'utf8');

let ok = true;
const check = (name, pass, detail = '') => {
  ok &&= pass;
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? `  ${detail}` : ''}`);
  return pass;
};

// Index helpers. Order is the whole point, so the assertions are written as
// comparisons between positions in the source rather than as "does this string
// appear".
const at = (s, re) => {
  const m = s.match(re);
  return m ? m.index : -1;
};

const SCREEN_CALL = /await screenStudentMessage\(action\.message\)/;
const STUDENT_INSERT = /\.from\("gumu_messages"\)\s*\.insert\(\{\s*session_id: gumuSession\.id,\s*role: "student"/;
const ASK_GUMU = /result = await askGumu\(\{ history: modelHistory/;

const ASSERTIONS = {
  'the student message is screened at all': (s) => SCREEN_CALL.test(s),

  'the screen runs BEFORE the tutor is called': (s) => {
    const screen = at(s, SCREEN_CALL);
    const tutor = at(s, ASK_GUMU);
    return screen !== -1 && tutor !== -1 && screen < tutor;
  },

  'the screen runs BEFORE the message is written to gumu_messages': (s) => {
    const screen = at(s, SCREEN_CALL);
    const insert = at(s, STUDENT_INSERT);
    return screen !== -1 && insert !== -1 && screen < insert;
  },

  'a stop returns without ever reaching the tutor': (s) =>
    /if \(screen\.action === "stop"\)[\s\S]{0,900}?return NextResponse\.json\(\{[\s\S]{0,400}?stopped: "support"/.test(
      s
    ),

  'a stop carries no `message` field, so it cannot render as a GUMU bubble': (s) => {
    const m = s.match(
      /if \(screen\.action === "stop"\)[\s\S]*?return NextResponse\.json\((\{[\s\S]*?\})\);/
    );
    return Boolean(m) && !/(^|[^_a-zA-Z])message:/.test(m[1]);
  },

  // Two linked properties, not one string search. Asserting only that
  // `status: "ended_support"` appears SOMEWHERE passes even when the stop branch
  // has been rerouted away from stopForSupport and that write has become dead
  // code, which the resolveFlagged fault below demonstrated. The path has to
  // reach it.
  'a stop closes the session as ended_support': (s) => {
    const branch = s.match(/if \(screen\.action === "stop"\) \{([\s\S]*?)\n  \}/);
    if (!branch || !/await stopForSupport\(/.test(branch[1])) return false;
    return /async function stopForSupport[\s\S]*?status: "ended_support"/.test(s);
  },

  'a stop does NOT go through resolveFlagged': (s) => {
    const m = s.match(/if \(screen\.action === "stop"\) \{([\s\S]*?)\n  \}/);
    return Boolean(m) && !/resolveFlagged/.test(m[1]);
  },

  'an unscreenable message is refused, not tutored': (s) =>
    /if \(screen\.action === "unavailable"\)[\s\S]{0,600}?status: 503/.test(s),

  'the crisis stop never blocks on its own bookkeeping': (s) =>
    /async function stopForSupport[\s\S]*?const \{ error: statusError \}[\s\S]*?if \(statusError\) \{/.test(
      s
    ),

  'a self-serve student is still notified somewhere': (s) =>
    /enrollments\.length === 0[\s\S]{0,400}?toEmail: CRISIS_INBOX/.test(s),
};

// Each fault is a single edit to a COPY of the source that breaks exactly one
// property. `expect` names the assertions that must go red. Any assertion not
// listed must stay green, which is what stops a fault from passing by breaking
// everything.
const FAULTS = [
  {
    name: 'the screen is removed entirely',
    edit: (s) => s.replace(SCREEN_CALL, 'await Promise.resolve({ action: "continue" as const })'),
    expect: [
      'the student message is screened at all',
      'the screen runs BEFORE the tutor is called',
      'the screen runs BEFORE the message is written to gumu_messages',
    ],
  },
  {
    name: 'the screen is moved AFTER the transcript write and the tutor',
    edit: (s) => {
      const call = s.match(new RegExp(`.*${SCREEN_CALL.source}.*`))?.[0];
      if (!call) return s;
      const without = s.replace(call + '\n', '');
      // Re-inserted below the tutor call, which is where a careless refactor
      // would leave it.
      return without.replace(
        /(result = await askGumu\(\{ history: modelHistory[\s\S]*?\n)/,
        `$1${call}\n`
      );
    },
    expect: [
      'the screen runs BEFORE the tutor is called',
      'the screen runs BEFORE the message is written to gumu_messages',
    ],
  },
  {
    name: 'the stop response reuses the `message` field',
    edit: (s) =>
      s.replace(
        /(if \(screen\.action === "stop"\)[\s\S]*?stopped: "support",)/,
        '$1\n      message: CRISIS_STOP_COPY.opening,'
      ),
    expect: ['a stop carries no `message` field, so it cannot render as a GUMU bubble'],
  },
  {
    name: 'the stop is routed through resolveFlagged, filing a crisis as a maths ending',
    edit: (s) =>
      s.replace(
        /(if \(screen\.action === "stop"\) \{\n)(\s*)await stopForSupport\([^;]*;/,
        '$1$2await resolveFlagged(admin, gumuSession, "turn_cap");'
      ),
    expect: ['a stop does NOT go through resolveFlagged', 'a stop closes the session as ended_support'],
  },
  {
    name: 'an unscreenable message falls through to tutoring (fail open)',
    edit: (s) =>
      s.replace(/if \(screen\.action === "unavailable"\) \{[\s\S]*?\n  \}\n/, ''),
    expect: ['an unscreenable message is refused, not tutored'],
  },
  {
    name: 'the self-serve fallback is dropped, so half the students notify nobody',
    edit: (s) => s.replace(/toEmail: CRISIS_INBOX,/, 'toEmail: "",'),
    expect: ['a self-serve student is still notified somewhere'],
  },
];

console.log('\nCLEAN SOURCE, every property must hold:\n');
for (const [name, predicate] of Object.entries(ASSERTIONS)) {
  check(name, predicate(src));
}

console.log('\nFAULT INJECTION, each check must notice its own fault:\n');
for (const fault of FAULTS) {
  const broken = fault.edit(src);

  // A fault whose edit matched nothing proves nothing at all, and would
  // otherwise look like a pass. This is the guard that stops that.
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

console.log(ok ? '\nAll crisis screen checks passed.\n' : '\nFAILURES above.\n');
process.exit(ok ? 0 : 1);
