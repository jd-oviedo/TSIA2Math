// Mu, the name -- and the two sidebar changes that shipped with it (PR D2).
//
// WHAT THIS PROVES, AND WHAT IT DELIBERATELY DOES NOT
// ---------------------------------------------------
// D2a moved 18 user-visible strings and one system prompt from "GUMU"/"mu" to
// "Mu". The risk in that change was never the rewrite: it was the blast radius.
// "gumu" is also a component name, a capability key, four CSS classes, two
// theme tokens, a route path and two database tables, and a find-replace across
// it would have hit ~400 sites. So this file asserts BOTH halves:
//
//   POSITIVE  the copy says "Mu", capital M, at every site that names the
//             character -- and no site still says "GUMU" or lowercase "mu".
//   NEGATIVE  every identifier, token, class, key and table name is EXACTLY
//             where it was, by count, and the greek-mu wordmark is byte-clean.
//
// The negative half is the load-bearing one. A rewrite that is too aggressive
// passes the positive half and breaks the app.
//
// STATIC, ON PURPOSE. Every claim here is a fact about file contents, and the
// files are unmountable in the DB-free lane (server components, an API route, a
// model module). The rendered counterparts -- alt text actually reaching the
// DOM, the banner's computed alignment, the Grades glyph -- are proved by
// scripts/verify_mu_avatar.mjs and scripts/verify_mu_sidebar.mjs, which mount.
// Neither proof is offered as the other.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const PROVE = process.argv.includes('--prove');
const read = (p) => readFileSync(p, 'utf8');

const T = 'app/course/[test]/[subject]/unit/[unit]/topic/[topicId]';
const CHAT = `${T}/GumuChat.tsx`;
const AVATAR = `${T}/GumuAvatar.tsx`;
const GATE = `${T}/GumuGate.tsx`;
const LAYOUT = `${T}/layout.tsx`;
const PRACTICE = `${T}/practice/page.tsx`;
const UPGRADE = 'app/dashboard/upgrade/page.tsx';
const ROUTE = 'app/api/gumu/session/route.ts';
const MODEL = 'app/lib/gumu.ts';
const NAV = 'app/components/StudentNav.tsx';
const CALC = 'app/components/Calculator.tsx';

const failures = [];
const ok = (cond, msg) => { if (!cond) failures.push(msg); };

// ── D2a POSITIVE: the 18 strings, by file ───────────────────────────────────
// Listed as literals rather than a regex sweep so that a string that quietly
// stops rendering fails here instead of passing an "and no GUMU remains" check
// vacuously.
const COPY = [
  [CHAT, "'Could not reach Mu.'", 3],
  [CHAT, '>Mu</div>', 1],
  [CHAT, 'aria-label="Conversation with Mu"', 1],
  [CHAT, 'Mu is thinking', 1],
  [CHAT, 'Your reply to Mu', 1],
  [AVATAR, "title = 'Mu'", 1],
  [GATE, 'working through a question with Mu.', 1],
  [LAYOUT, 'the ones you miss with Mu.', 1],
  [PRACTICE, 'Mu comes in on the mini quiz', 1],
  [UPGRADE, 'and Mu to work through anything you miss.', 1],
  [ROUTE, 'Mu could not resolve it.', 1],
  [ROUTE, '"Sign in to use Mu"', 1],
  [ROUTE, '"Could not start Mu"', 1],
  [ROUTE, '"Mu is unavailable right now"', 3],
  [ROUTE, '"This Mu session has already finished"', 1],
];
for (const [file, needle, want] of COPY) {
  const got = read(file).split(needle).length - 1;
  ok(got === want, `${file}: expected ${want}x ${JSON.stringify(needle)}, found ${got}`);
}

// ── D2a POSITIVE: the tutor's own self-identity ─────────────────────────────
// The one string here that is not rendered from the repo. A student who types
// "what's your name?" is answered by the model, from this prompt -- so leaving
// it saying GUMU would have left the rename cosmetic at the highest-traffic
// surface the feature has. The greek mark is NOT reintroduced here: Mu is the
// character, munpackmath is the product, and the prompt describes the character.
const prompt = read(MODEL).split('const SYSTEM_PROMPT = `')[1].split('`;')[0];
ok(!prompt.includes('GUMU'), 'SYSTEM_PROMPT still names GUMU');
ok(!prompt.includes('Get Ur Math Up'), 'SYSTEM_PROMPT still carries the backronym');
ok(prompt.startsWith('You are Mu,'), 'SYSTEM_PROMPT does not open "You are Mu,"');
ok(!prompt.includes('μ'), 'the greek mu mark was reintroduced into the character prompt');

// ── D2a NEGATIVE: no user-visible site still says the old name ──────────────
// Comments are stripped first: they are List 2, they legitimately still say
// GUMU, and leaving them in would make this check unfailable.
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
for (const file of [CHAT, AVATAR, GATE, LAYOUT, PRACTICE, UPGRADE]) {
  const body = stripComments(read(file));
  for (const m of body.match(/[^\n]*\bGUMU\b[^\n]*/g) ?? []) {
    ok(false, `${file}: a non-comment line still says GUMU: ${m.trim()}`);
  }
  for (const m of body.match(/[^\n]*(?:>mu<|\bmu is thinking|\bmu comes in|title = 'mu')[^\n]*/g) ?? []) {
    ok(false, `${file}: a visible label is lowercase again: ${m.trim()}`);
  }
}

// ── D2a NEGATIVE: List 2 is untouched, counted against origin/main ─────────
// The expected numbers are NOT written down here. A hand-copied constant is a
// number someone typed, and it goes stale the first time an unrelated PR adds a
// call site -- at which point this check either false-fails or gets "corrected"
// to whatever the new reality is, which is the same as deleting it.
//
// So each count is read from the pre-change file itself, via origin/main. The
// claim is the true one: whatever these names counted before this PR, they
// count now.
// Fails loudly rather than skipping: a List 2 check that quietly stops running
// because a ref was not fetched is worse than no check at all.
const pristine = (p) => {
  try {
    return execFileSync('git', ['show', `origin/main:${p}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    throw new Error(
      `cannot read origin/main:${p}. The List 2 counts are measured against the ` +
        'pre-change files, so this check cannot run without that ref. Run `git fetch origin main`.',
    );
  }
};
const LIST2_FILES = [CHAT, AVATAR, GATE, LAYOUT, PRACTICE, UPGRADE, ROUTE, MODEL,
  `${T}/quiz/page.tsx`, `${T}/PracticeQuiz.tsx`, `${T}/topic-data.ts`, `${T}/QuizStrip.tsx`,
  `${T}/topic-page-css.ts`, 'app/lib/capabilities.ts', 'app/lib/course-access.ts',
  'app/lib/schemas.ts', 'app/lib/rate-limit.ts', 'app/components/curriculum-theme.ts', NAV,
  'app/api/curriculum/practice/route.ts',
];
const LIST2 = [
  // identifiers
  'GumuAvatar', 'GumuChat', 'GumuGate', 'GumuGateProvider', 'useGumuGate', 'GumuSession',
  'GumuTurn', 'GumuReply', 'GumuBody', 'askGumu', 'GUMU_MODEL', 'gumuBodySchema',
  'gumuRateLimit', 'gumuAvailable', 'gumuSession',
  // capability key
  '"gumu"', "'gumu'",
  // database
  'gumu_sessions', 'gumu_messages', 'gumu_session_id', 'gumu_available',
  "role: 'gumu'", 'role: "gumu"',
  // css + tokens + route
  'C.gumuSurface', 'C.gumuBanner', 'gumuSurface:', 'gumuBanner:', 'um-gumu-panel',
  'um-gumu-card', 'um-gumu-start', 'um-gumu-dismiss', 'gumu-input-', 'ratelimit:gumu',
  '/api/gumu/session',
];
const now = LIST2_FILES.map(read).join('\n');
const before = LIST2_FILES.map(pristine).join('\n');
const tally = (hay, needle) => hay.split(needle).length - 1;
let list2Checked = 0;
for (const needle of LIST2) {
  const want = tally(before, needle);
  const got = tally(now, needle);
  ok(want > 0, `List 2 name ${JSON.stringify(needle)} was never there to protect`);
  ok(got === want, `List 2 moved: ${JSON.stringify(needle)} was ${want}x on main, now ${got}x`);
  list2Checked += 1;
}

// ── The checkers moved with the copy ────────────────────────────────────────
// Three files assert the OLD strings, and a copy rewrite that leaves them
// behind either false-fails or, worse, keeps passing against a label nobody
// renders any more. Two of them run here. The third, verify_gumu_tier.mjs,
// does NOT: it drives a signed-out topic route, which reads curriculum from the
// live project, and agent-run checks do not touch prod. So its selector is
// pinned the only way it can be without running it -- against the aria-label
// the component actually writes. If either side moves alone, this goes red.
const TIER = read('scripts/verify_gumu_tier.mjs');
const ariaLabel = (read(CHAT).match(/aria-label="(Conversation with [^"]+)"/) ?? [])[1];
ok(ariaLabel === 'Conversation with Mu', `the chat log aria-label is ${JSON.stringify(ariaLabel)}`);
ok(TIER.includes(`[aria-label="${ariaLabel}"]`),
  'verify_gumu_tier.mjs selects an aria-label GumuChat no longer writes');
ok(!TIER.includes('Conversation with GUMU'), 'verify_gumu_tier.mjs still selects the old label');

const AVATAR_CHECK = read('scripts/verify_mu_avatar.mjs');
const defaultAlt = (read(AVATAR).match(/title = '([^']*)'/) ?? [])[1];
ok(defaultAlt === 'Mu', `the default alt is ${JSON.stringify(defaultAlt)}`);
ok((AVATAR_CHECK.match(/alt: 'Mu'/g) ?? []).length === 2,
  'verify_mu_avatar.mjs does not expect the new default alt at both named sites');
ok(!/alt: 'mu'/.test(AVATAR_CHECK), 'verify_mu_avatar.mjs still expects lowercase alt');

// ── The wordmark, byte-identical ────────────────────────────────────────────
// The product name is a greek mu. The character is a latin M. This PR touches
// the second and must not graze the first.
ok(read(CALC).includes('<span style={{ color: ORANGE }}>μnpack</span>'),
  'the munpackmath wordmark span is not byte-identical');
ok(read(NAV).includes("src=\"/unpackmath-wordmark.png\""), 'the wordmark asset moved');
ok(read(NAV).includes("src=\"/unpackmath-logo.png\""), 'the brand mark asset moved');
// The Spanish false positive the inventory flagged: "Mu" here is the head of
// "Muestrale", not the character, and a careless sweep would have capitalised
// or rewritten it.
ok(read('app/reporte/page.tsx').includes('Muéstrale este dibujo'),
  'the Spanish "Muestrale" string was touched');
ok(read('app/reporte/QuestionGame.tsx').includes('Muéstrame con las manos'),
  'the Spanish "Muestrame" string was touched');

// ── D2b: the expanded brand centres, and the cream is untouched ─────────────
const nav = read(NAV);
const brand = nav.split('function Brand(')[1].split('\n}')[0];
// By src, not by position: the collapsed arm is the mark, the expanded arm is
// the wordmark, and that stays true however the branches are ordered.
const arm = (src) => brand.split('<img').find((chunk) => chunk.includes(src));
ok(/margin: '0 auto'/.test(arm('/unpackmath-logo.png')), 'the collapsed brand lost its centring');
ok(/margin: '0 auto'/.test(arm('/unpackmath-wordmark.png')), 'the expanded brand is not centred');
ok(read('app/components/dashboard-theme.ts').includes("bg: '#E8E0CF'"),
  'RAIL_LIGHT.bg is no longer the exact cream');

// ── D2c: Grades is an outline check-circle, and is not the practice glyph ───
const glyph = (label) => nav.split(`case '${label}':`)[1].split('case ')[0].split('default:')[0];
const grades = glyph('Grades');
const ptest = glyph('Take a Practice Test');
const marks = (s) => (s.match(/<(?:circle|rect|line|polyline|path)[^>]*>/g) ?? []).join('');
ok(/<circle cx="9" cy="9" r="6\.6" \/>/.test(grades), 'Grades is not the check-circle');
ok(/<polyline/.test(grades), 'Grades has no check');
ok(!/fill=/.test(grades), 'Grades declares a fill -- it must stay an outline');
ok(marks(grades) !== marks(ptest), 'Grades and Take a Practice Test draw the same glyph');
ok(marks(grades).match(/polyline/g).length === 1, 'Grades should carry exactly one check');
// The two checks must not be the same points, or the circle is the only thing
// telling them apart in the collapsed, label-less rail.
const pts = (s) => (s.match(/points="([^"]+)"/) ?? [])[1];
ok(pts(grades) !== pts(ptest), 'the two checks are drawn at identical points');

console.log('\n---------------------------------------------------------');
if (failures.length === 0) {
  console.log(`PASS: ${COPY.length} copy sites say "Mu", the prompt says "Mu", ${list2Checked} List 2 names unmoved,`);
  console.log('      wordmark byte-clean, brand centred, Grades is its own outline glyph.');
  if (PROVE) {
    console.error('\nBUT --prove WAS PASSED AND NOTHING FAILED.\n' +
      'The fault was not injected, or this check cannot see it.');
    process.exit(1);
  }
} else {
  console.log(`FAIL: ${failures.length} check(s) red`);
  for (const f of failures) console.log(`  - ${f}`);
  if (!PROVE) process.exit(1);
  console.log('\n(--prove: red was the expected outcome)');
}
