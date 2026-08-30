// verify_answer_key_parity.mjs -- prove the two per-item splits of Part 4 agree.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_answer_key_parity.mjs
//   npm run test:answer-key-parity
//
// WHY THIS EXISTS
// ---------------
// After sql/curriculum_prose_columns.sql, Part 4 is split into per-item worked
// solutions in TWO places:
//
//   extract_worked_solutions()  curriculum/migrations/upload_curriculum.py
//                               once, at upload, into curriculum_topics.worked_solutions
//   splitAnswerKey()            lib/curriculum-utils.ts
//                               on every request, from answer_key.raw
//
// Neither can be deleted. The stored column is authoritative, and splitAnswerKey
// is the documented fallback for rows written before the column existed -- its
// own contract is that it "returns empty lists for any section it cannot parse
// ... and the caller falls back to rendering the whole blob."
//
// So the invariant is: for any topic, both implementations divide Part 4 the
// same way. A comment naming one authoritative does not enforce that. This does.
//
// WHAT "THE SAME" MEANS HERE, AND WHY IT IS AN EXACT TEST
// -------------------------------------------------------
// The two sides do not return the same type: Python returns markdown, TypeScript
// returns rendered HTML. Comparing them by stripping tags or normalising
// whitespace would be a fuzzy test that passes on a real disagreement.
//
// Instead the Python markdown is pushed through the SAME renderer splitAnswerKey
// uses -- renderMarkdownWithMath -- and the two HTML strings are compared byte
// for byte. If the two splits produced the same body, the HTML is identical; if
// they cut the text anywhere differently, it is not. No normalisation, no
// tolerance.
//
// Part 4 itself is extracted ONCE, by Python, and the same string is handed to
// both sides. Section extraction is not what this checks, and letting each side
// find its own Part 4 would fold two questions into one answer.
//
// EVERY FAULT IS INJECTED INTO ONE SIDE ONLY
// ------------------------------------------
// A fault injected into the input of BOTH sides moves both halves of the
// comparison and comes back clean -- that is how scripts/faultproof_figures.mjs
// once reported 21 assertions and 0 failures while detecting nothing. Here each
// injection mutates the text given to Python and leaves TypeScript's untouched,
// so the two genuinely disagree. Each injection asserts that it landed before
// the comparison is trusted.
//
// EVERY FAULT RUNS BETWEEN TWO CLEAN CONTROLS, so a red run distinguishes the
// fault from the harness being broken.
import { execFileSync } from 'node:child_process';
import { splitAnswerKey, renderMarkdownWithMath } from '@/lib/curriculum-utils.ts';

// Ten topics spanning all four strands and five of the six units, plus QR.1.1.
//
// QR.1.1 is not padding. It is the known outlier: 12 practice items instead of
// 10, most of them free-response, and the one source file in the course with no
// distractor_logic block anywhere. If the two splits disagree on shape, it is
// the topic most likely to show it.
const TOPICS = [
  ['unit-1', 'QR.1.1'],  // outlier: 12 items, mostly free-response, no prose
  ['unit-0', 'AR.1.1'],  // AR, and the file whose prose carries "f(9)"
  ['unit-2', 'AR.2.1'],  // AR
  ['unit-4', 'AR.4.12'], // AR, highest item number in the strand
  ['unit-0', 'GR.1.1'],  // GR
  ['unit-3', 'GR.4.5'],  // GR
  ['unit-0', 'PR.1.1'],  // PR
  ['unit-5', 'PR.4.4'],  // PR, last topic in the course sequence
  ['unit-1', 'QR.2.1'],  // QR
  ['unit-1', 'QR.3.5'],  // QR, the one templated topic
  // The one topic with a Part 5, and the only one that exercises the three-way
  // Part 4 split at all. Without it both implementations could have kept a
  // two-way split and this verifier would still have reported ten green topics.
  ['unit-3', 'GR.2.6'],
];

const SRC = 'curriculum/source/tsia2-math';

// One Python call for the whole run rather than one per topic: it imports
// upload_curriculum, which is not free, and a per-topic subprocess would make
// the fault injections slower than the thing they are testing.
//
// The script is passed on stdin and the payload comes back as JSON on stdout, so
// nothing is written to disk and no temporary module has to be cleaned up.
const PY = String.raw`
import json, sys, importlib.util
spec = importlib.util.spec_from_file_location("uc", "curriculum/migrations/upload_curriculum.py")
uc = importlib.util.module_from_spec(spec); spec.loader.exec_module(uc)

req = json.load(sys.stdin)
out = {}
for key, item in req.items():
    if "part4" in item:
        part4 = item["part4"]                    # caller supplied it (fault runs)
    else:
        part4 = uc.parse_markdown_curriculum(item["path"])["answer_key"]
    out[key] = {"part4": part4, "solutions": uc.extract_worked_solutions(part4)}
json.dump(out, sys.stdout)
`;

function python(request) {
  const raw = execFileSync('python3', ['-c', PY], {
    input: JSON.stringify(request),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(raw);
}

// Compare one topic. Returns a list of human-readable disagreements.
function compare(topic, part4ForTs, pySolutions) {
  const ts = splitAnswerKey(part4ForTs);
  const problems = [];

  // All three sections, extra_practice included. It is optional, so both sides
  // report nothing for the 96 topics without a Part 5 and the comparison is a
  // no-op there -- but on GR.2.6 this is the check that the two three-way
  // splits agree, which is the whole reason split_answer_key_sections() and
  // splitAnswerKey() were rewritten together rather than one at a time.
  for (const section of ['practice', 'mini_quiz', 'extra_practice']) {
    const tsEntries = ts[section];
    const pySection = pySolutions[section] ?? {};

    const tsNums = tsEntries.map((e) => String(e.item_number));
    const pyNums = Object.keys(pySection);

    if (tsNums.join(',') !== pyNums.join(',')) {
      problems.push(
        `${topic}/${section}: item numbers differ -- py [${pyNums}] vs ts [${tsNums}]`,
      );
      continue; // body comparison is meaningless once the split disagrees
    }

    for (const entry of tsEntries) {
      const pyBody = pySection[String(entry.item_number)];
      // Same renderer both sides, so this is an exact comparison of the split.
      const pyHtml = renderMarkdownWithMath(pyBody);
      if (pyHtml !== entry.solution_html) {
        problems.push(
          `${topic}/${section}/${entry.item_number}: rendered bodies differ ` +
            `(py ${pyHtml.length}B, ts ${entry.solution_html.length}B)`,
        );
      }
    }
  }
  return problems;
}

let ok = true;

function report(label, problems, { expectRed = false } = {}) {
  const red = problems.length > 0;
  const good = red === expectRed;
  ok &&= good;
  const verdict = good ? (expectRed ? 'PASS (went red as required)' : 'PASS') : 'FAILED';
  console.log(`  [${good ? 'ok' : 'XX'}] ${label}: ${verdict}` +
    (red ? ` -- ${problems.length} disagreement(s)` : ''));
  if (red && problems.length) {
    for (const p of problems.slice(0, 3)) console.log(`         ${p}`);
  }
  if (!good && expectRed) {
    console.log('         >>> THE INJECTION DID NOT REGISTER. This harness is blind.');
  }
}

// ── the clean run ───────────────────────────────────────────────────────────

const request = Object.fromEntries(
  TOPICS.map(([unit, id]) => [id, { path: `${SRC}/${unit}/${id}.md` }]),
);
const base = python(request);

console.log(`answer key parity: ${TOPICS.length} topics, both implementations\n`);
console.log('clean run:');

let totalItems = 0;
const cleanProblems = [];
for (const [, id] of TOPICS) {
  const { part4, solutions } = base[id];
  totalItems += Object.values(solutions).reduce((n, s) => n + Object.keys(s).length, 0);
  cleanProblems.push(...compare(id, part4, solutions));
}
report(`all ${TOPICS.length} topics, ${totalItems} items`, cleanProblems);

// Guard against the whole run being vacuous. Zero disagreements over zero items
// is not a passing test, it is an empty one.
if (totalItems < 100) {
  console.log(`  [XX] sanity: only ${totalItems} items compared, expected 100+`);
  ok = false;
} else {
  console.log(`  [ok] sanity: ${totalItems} items actually compared`);
}

// ── fault injection ─────────────────────────────────────────────────────────
//
// Each fault mutates the Part 4 handed to PYTHON and leaves TypeScript reading
// the original, so the two sides genuinely disagree. The mutation is asserted to
// have landed before its result is believed.

console.log('\nfault injection (each must go red):');

function injectAndCheck(label, topic, mutate) {
  const original = base[topic].part4;
  const mutated = mutate(original);

  if (mutated === original) {
    console.log(`  [XX] ${label}: MUTATION DID NOT APPLY -- nothing was changed`);
    ok = false;
    return;
  }

  const faulted = python({ [topic]: { part4: mutated } });
  // TypeScript still reads the ORIGINAL text. One side only.
  const problems = compare(topic, original, faulted[topic].solutions);
  report(label, problems, { expectRed: true });
}

// 1. A broken item header. "**3." becomes "**3)", so Python's header regex no
//    longer sees item 3 and folds its body into item 2.
injectAndCheck('altered item header (**3. -> **3))', 'AR.2.1', (t) =>
  t.replace(/^\*\*3\./m, '**3)'),
);

// 2. A malformed authoring fence: the closing ``` is removed from the first
//    block, so stripAuthoringBlocks stops matching it and the raw json is left
//    in the body Python returns.
injectAndCheck('malformed json fence (closing ``` removed)', 'AR.2.1', (t) => {
  const at = t.indexOf('```json');
  if (at === -1) return t;
  const close = t.indexOf('```', at + 7);
  return close === -1 ? t : t.slice(0, close) + t.slice(close + 3);
});

// 3. A moved section boundary. The Mini Quiz heading is demoted to plain text,
//    so Python reads the quiz items as part of the practice section.
injectAndCheck('Mini Quiz heading removed', 'PR.1.1', (t) =>
  t.replace(/^#{3,6}\s*Mini Quiz.*$/m, 'Mini Quiz'),
);

// ── clean control, again ────────────────────────────────────────────────────
//
// Re-run clean after the faults. If this ever comes back red, the injections
// leaked into shared state and every result above is suspect.

console.log('\nclean control (after faults):');
const afterProblems = [];
for (const [, id] of TOPICS) {
  const { part4, solutions } = base[id];
  afterProblems.push(...compare(id, part4, solutions));
}
report('all topics still agree', afterProblems);

console.log(`\n${ok ? 'PASS' : 'FAIL'}: the two Part 4 splits agree, and the check can fail.`);
process.exit(ok ? 0 : 1);
