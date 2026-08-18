// faultproof_gumu_panel.mjs -- prove the remediation panel is presentational,
// and prove the checks that say so can fail.
//
//   node scripts/faultproof_gumu_panel.mjs
//
// WHY SOURCE ASSERTIONS
// ---------------------
// None of this panel is reachable in a browser without an account. gumu_available
// initialises false and is set only inside `if (session)` (app/api/curriculum/
// practice/route.ts:100, :189), so a signed-out visitor never mounts GumuChat at
// all -- not even its pre-session state. What has to be true is a property of the
// source: that the panel opens no session on its own, that the dismiss cannot be
// reached once one is open, and that the session lifecycle is exactly where it
// was. Each is faulted below against a copy of the text, so the check has to
// notice.
//
// THE ONE THIS FILE EXISTS FOR
// ---------------------------
// "Not now" must be unreachable once a session is open. A dismiss that unmounts
// GumuChat mid-conversation leaves the provider still counting the session:
// solutionsPaused stays true for the rest of the page load with nothing on screen
// to close it. That is precisely the bug #140 fixed for page turns, and GumuChat
// still has no unmount cleanup, so the guard is structural -- the control exists
// only inside the `if (!started)` branch -- and fault 3 moves it out.

import { readFileSync } from 'fs';

const TOPIC = 'app/course/[test]/[subject]/unit/[unit]/topic/[topicId]';
const CHAT = `${TOPIC}/GumuChat.tsx`;
const QUIZ = `${TOPIC}/PracticeQuiz.tsx`;

const chat = readFileSync(CHAT, 'utf8');
const quiz = readFileSync(QUIZ, 'utf8');

let ok = true;
const check = (name, pass, detail = '') => {
  ok &&= pass;
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? `  ${detail}` : ''}`);
  return pass;
};

// Everything before `if (!started)` is the component body; everything after the
// pre-session `return` is the open-session render. Splitting on that boundary is
// what lets "pre-session only" be asserted rather than asserted about.
function preSessionBranch(src) {
  const from = src.indexOf('if (!started) {');
  if (from === -1) return null;
  // The branch ends at its own closing `  }` at indent 2, which is the line
  // immediately before the component's main `return (`.
  const to = src.indexOf('\n  return (', from);
  return to === -1 ? null : src.slice(from, to);
}
function openSessionBranch(src) {
  const from = src.indexOf('\n  return (', src.indexOf('if (!started) {'));
  return from === -1 ? null : src.slice(from);
}

const ASSERTIONS = {
  'the pre-session branch exists and is findable': (s) =>
    preSessionBranch(s) !== null && openSessionBranch(s) !== null,

  'the panel offers a dismiss': (s) => /um-gumu-dismiss/.test(s),

  // THE ONE. Present before a session, absent after.
  'the dismiss is in the pre-session branch': (s) =>
    /um-gumu-dismiss/.test(preSessionBranch(s) ?? ''),

  'and NOT reachable once a session is open': (s) =>
    !/um-gumu-dismiss/.test(openSessionBranch(s) ?? ''),

  'the dismiss only sets local state': (s) => {
    const branch = preSessionBranch(s) ?? '';
    const m = branch.match(/um-gumu-dismiss[\s\S]{0,300}?onClick=\{([^}]*)\}/);
    return Boolean(m) && /setDismissed\(true\)/.test(m[1]) && !/start|reveal|post\(/.test(m[1]);
  },

  // No session is opened without a click.
  'nothing starts a session on mount': (s) =>
    !/useEffect\([\s\S]{0,200}?start\(\)/.test(s),

  'start() is reached only from the panel button': (s) =>
    (s.match(/onClick=\{start\}/g) ?? []).length === 1,

  // The lifecycle, unchanged. Three call sites, exactly where they were.
  'onSessionChange(true) fires once, on a started session': (s) =>
    (s.match(/onSessionChange\(true\)/g) ?? []).length === 1,

  'onSessionChange(false) fires twice, on the turn cap and on reveal': (s) =>
    (s.match(/onSessionChange\(false\)/g) ?? []).length === 2,

  'the panel adds no new session write': (s) =>
    (s.match(/action:\s*['"]start['"]/g) ?? []).length === 1,

  // PracticeQuiz's side of the contract.
  'solutionsPaused is still activeCount > 0': (q) => /const solutionsPaused = activeCount > 0;/.test(q),

  'the page-turn release from #140 is still there': (q) =>
    /if \(turn\.releaseKey\) setItemActive\(turn\.releaseKey, false\);/.test(q),

  'retry still drops the gate before clearing': (q) =>
    /function retry\(itemNumber: number\) \{\s*\n\s*setItemActive\(`\$\{section\}-\$\{itemNumber\}`, false\);/.test(q),
};

const CHAT_KEYS = new Set([
  'the pre-session branch exists and is findable',
  'the panel offers a dismiss',
  'the dismiss is in the pre-session branch',
  'and NOT reachable once a session is open',
  'the dismiss only sets local state',
  'nothing starts a session on mount',
  'start() is reached only from the panel button',
  'onSessionChange(true) fires once, on a started session',
  'onSessionChange(false) fires twice, on the turn cap and on reveal',
  'the panel adds no new session write',
]);

const FAULTS = [
  {
    name: 'the dismiss is moved into the open-session render',
    file: 'chat',
    apply: (s) => {
      const anchor = '      {/* Who is talking, and how much runway is left.';
      if (!s.includes(anchor)) return s;
      return s.replace(
        anchor,
        '      <button className="um-gumu-dismiss" onClick={() => setDismissed(true)}>Not now</button>\n' +
          anchor
      );
    },
    breaks: 'and NOT reachable once a session is open',
  },
  {
    name: 'the dismiss is removed entirely',
    file: 'chat',
    apply: (s) => s.replace(/className="um-gumu-dismiss"/g, 'className="um-gumu-gone"'),
    breaks: 'the panel offers a dismiss',
  },
  {
    name: 'the panel opens a session on mount',
    file: 'chat',
    apply: (s) =>
      s.replace(
        '  if (!started) {',
        '  useEffect(() => {\n    void start();\n  }, []);\n\n  if (!started) {'
      ),
    breaks: 'nothing starts a session on mount',
  },
  {
    name: 'the dismiss also resolves the session',
    file: 'chat',
    apply: (s) => s.replace('onClick={() => setDismissed(true)}', 'onClick={() => { setDismissed(true); void reveal(); }}'),
    breaks: 'the dismiss only sets local state',
  },
  {
    name: 'a second onSessionChange(false) is added',
    file: 'chat',
    apply: (s) => s.replace('    if (dismissed) return null;', '    if (dismissed) { onSessionChange(false); return null; }'),
    breaks: 'onSessionChange(false) fires twice, on the turn cap and on reveal',
  },
  {
    name: 'solutionsPaused is rewired',
    file: 'quiz',
    apply: (s) => s.replace('const solutionsPaused = activeCount > 0;', 'const solutionsPaused = false;'),
    breaks: 'solutionsPaused is still activeCount > 0',
  },
  {
    name: 'the page-turn release is dropped',
    file: 'quiz',
    apply: (s) =>
      s.replace('    if (turn.releaseKey) setItemActive(turn.releaseKey, false);\n', ''),
    breaks: 'the page-turn release from #140 is still there',
  },
];

const src = { chat, quiz };

console.log('1. the panel as it stands');
for (const [name, predicate] of Object.entries(ASSERTIONS)) {
  check(name, predicate(CHAT_KEYS.has(name) ? chat : quiz));
}

console.log('\n2. each check can fail');
for (const fault of FAULTS) {
  const faulted = fault.apply(src[fault.file]);
  if (faulted === src[fault.file]) {
    check(`fault applies: ${fault.name}`, false, 'the edit matched nothing, so it proves nothing');
    continue;
  }
  const caught = ASSERTIONS[fault.breaks](faulted) === false;
  check(`caught: ${fault.name}`, caught, caught ? '' : `-> "${fault.breaks}" still passed`);
}

console.log('\n3. and the clean source is not passing by accident');
for (const fault of FAULTS) {
  check(`clean source satisfies "${fault.breaks}"`, ASSERTIONS[fault.breaks](src[fault.file]));
}

console.log(
  `\nRESULT: ${ok ? 'the panel is presentational, the dismiss is pre-session only, and the checks can tell' : 'A CHECK FAILED'}`
);
process.exit(ok ? 0 : 1);
