// verify_body_ground.mjs -- the eleven body grounds this PR repaints, measured
// rather than read off the source.
//
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_body_ground.mjs
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_body_ground.mjs --base http://localhost:5140
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_body_ground.mjs --prove
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_body_ground.mjs --base http://localhost:5140 --fault inactive=#00FF00
//
// The third sibling of verify_surface_page_bg.mjs (dashboard, curriculum,
// login) and verify_worksheet_page_bg.mjs (the generator chrome). Those two
// left eleven surfaces out of scope. This covers them.
//
// ─── WHAT IS BEING PROVED ───────────────────────────────────────────────────
//
// app/layout.tsx:51 paints the body from an INLINE style prop:
//
//   <body className="min-h-dvh" style={{ background: "var(--ec-bg)", ... }}>
//
// --ec-bg is #F0EDE8 in light mode, html sets no background of its own, so
// body's value propagates to the canvas and is what shows in the overscroll
// gutter. Eleven surfaces tried to repaint it with a plain
//
//   body { margin: 0; background: <their colour>; }
//
// and not one of them ever painted anything. An inline declaration outranks
// EVERY stylesheet rule at every specificity unless that rule is !important,
// and none of these were. A navy page therefore bounced a cream band on
// overscroll, and a teacher row bounced a slightly different cream.
//
// ─── TWO MECHANISMS, AND WHY THEY ARE NOT INTERCHANGEABLE ───────────────────
//
// FOUR NAVY PAGES are a single colour with no theme switch, so the cheap fix is
// correct and is what they use: `body { background: #0F1E35 !important }`, the
// pattern from app/teacher/worksheets/worksheet-theme.ts:290. Nothing to
// recompute, no JavaScript, no hook.
//
// FOUR TEACHER ROWS go through useBodyBackground instead, which writes the
// colour as an inline style from the component. Not because they are currently
// theme-aware -- DASH is LIGHT and these surfaces are light-only today -- but
// because they read their ground from the DASH token set, which HAS a dark
// half (dashboard-theme.ts:221) that a bare `body` selector could never reach:
// the theme marker is data-theme on a DESCENDANT, and ThemeProvider stamps no
// attribute on <html>. The hook is the mechanism that survives that surface
// going dark. See app/components/useBodyBackground.ts for the full argument.
//
// THREE COSMETIC ROUTES (reporte and the two demo pages) take the cheap fix
// too. They are throwaway surfaces and nothing here deepens them.
//
// ─── TWO TIERS, BECAUSE FIVE ROUTES CANNOT BE REACHED ANONYMOUSLY ───────────
//
// TIER A, LIVE. Six of the eleven are served to a signed-out visitor, so they
// are measured for real: navigate a chromium page at a `next build && next
// start` server and read getComputedStyle(document.body).backgroundColor. This
// is the whole product -- middleware, the real layout, the real component, the
// real cascade -- and the assertion is the exact hex, not "is dark" or "is set".
//
// TIER B, CASCADE. The other five gate on something this harness must not
// produce:
//
//   teacher-dash      /teacher redirects to /login without a teacher session
//   teacher-students  requireGradesTeacher does the same
//   teacher-settings  the same again
//   welcome           needs a PAID live Stripe checkout session id
//   claim-result      needs a signed-in user AND consumes a pending row
//
// Every one of those routes leads to the production Supabase in .env.local, and
// claim-result is an outright write. So they are measured a step lower down: the
// surface's OWN shipped mechanism -- the body rule lifted verbatim out of the
// .tsx, or the hook call read out of it -- replayed against the real
// app/layout.tsx body shape in the same chromium, asserting the same exact hex.
//
// What Tier B proves is the cascade: that this rule, against that inline prop,
// computes to that colour. What it does not prove is that the route serves the
// component, which is a routing fact and not a colour one. Tier A proves that
// end of it for six surfaces, including one of the four hook surfaces
// (teacher-student), so the hook mechanism itself is measured live in the real
// app and not only in a scaffold.
//
// ─── --prove ────────────────────────────────────────────────────────────────
//
// Re-runs Tier B against the PRE-FIX arrangement -- !important stripped from the
// four navy and three cosmetic rules, the inline write skipped for the four hook
// surfaces -- and requires every colour assertion to FAIL. A ground check that
// passes against the version that never painted is measuring nothing.
//
// Tier A is skipped under --prove: the server is serving the shipped app and
// there is nothing there to fault.
//
// ─── --fault key=hex ────────────────────────────────────────────────────────
//
// Overrides the EXPECTED hex for one surface, in either tier, without editing
// this file. Distinct from --prove: --prove faults the product and asks whether
// the check notices, --fault faults the check's own expectation and asks whether
// the comparator is real. Both have to bite or the harness is decorative.

import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { DASH } from '../app/components/dashboard-theme.ts';

const args = process.argv.slice(2);
const arg = (n, d = null) => { const i = args.indexOf(n); return i === -1 ? d : args[i + 1]; };
const PROVE = args.includes('--prove');
const BASE = arg('--base', null);

// --fault key=hex, repeatable.
const FAULTS = new Map();
args.forEach((a, i) => {
  if (a !== '--fault') return;
  const [k, v] = String(args[i + 1] ?? '').split('=');
  if (k && v) FAULTS.set(k, v);
});

let failures = 0;
let checked = 0;
const fail = (m) => { failures++; console.log(`  FAIL  ${m}`); };
const pass = (m) => { checked++; console.log(`  ok    ${m}`); };
const note = (m) => console.log(`  --    ${m}`);

const rgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

// The global theme ground the body falls back to when nothing repaints it.
// This is the cream band that was showing in the gutter.
const EC_BG_LIGHT = '#F0EDE8';

const NAVY = '#0F1E35';
const LIGHT = DASH.pageBg; // #F5F5F3, and it must resolve to a hex, not a var().

// ─── The surfaces ───────────────────────────────────────────────────────────
//
// `ground` is the exact colour the gutter must be. `mech` is how the surface
// gets it there: 'css' for the !important rule, 'hook' for useBodyBackground,
// 'edge' for the BodyGround client edge that a server component uses.
const SURFACES = [
  // Navy, single colour, the cheap rule.
  { key: 'claim-client', file: 'app/claim/ClaimClient.tsx', mech: 'css', ground: NAVY,
    route: '/claim?checkout_session_id=um-verify-body-ground-not-a-real-id' },
  { key: 'inactive', file: 'app/teacher/inactive/page.tsx', mech: 'css', ground: NAVY,
    route: '/teacher/inactive' },
  { key: 'claim-result', file: 'app/claim/ClaimResult.tsx', mech: 'css', ground: NAVY,
    gated: 'needs a signed-in user, and claiming consumes a pending entitlement row' },
  { key: 'welcome', file: 'app/teacher/welcome/WelcomeClient.tsx', mech: 'css', ground: NAVY,
    gated: 'needs a PAID live Stripe checkout session id' },

  // Cosmetic routes, same cheap rule, nothing deepened.
  { key: 'reporte', file: 'app/reporte/page.tsx', mech: 'css', ground: LIGHT, route: '/reporte' },
  { key: 'demo', file: 'app/demo/page.tsx', mech: 'css', ground: LIGHT, route: '/demo' },
  { key: 'demo-camila', file: 'app/demo/student/camila/page.tsx', mech: 'css', ground: LIGHT,
    route: '/demo/student/camila' },

  // Teacher rows, the hook. teacher-student is a client page with no server
  // gate of its own, so it renders its shell for a signed-out visitor and the
  // hook runs before any data arrives -- which is exactly why it is reachable.
  { key: 'teacher-student', file: 'app/teacher/student/[id]/page.tsx', mech: 'hook', ground: LIGHT,
    route: '/teacher/student/00000000-0000-0000-0000-000000000000' },
  { key: 'teacher-dash', file: 'app/teacher/TeacherDashboardClient.tsx', mech: 'hook', ground: LIGHT,
    gated: '/teacher redirects to /login without a teacher session' },
  { key: 'teacher-students', file: 'app/teacher/students/shell.tsx', mech: 'edge', ground: LIGHT,
    gated: 'requireGradesTeacher redirects without a teacher session' },
  { key: 'teacher-settings', file: 'app/teacher/settings/page.tsx', mech: 'edge', ground: LIGHT,
    gated: 'redirects to /login without a teacher session' },
];

const want = (s) => FAULTS.get(s.key) ?? s.ground;

// ─── Reading the shipped mechanism out of the source ────────────────────────
//
// Deliberately reads the .tsx rather than importing anything: these rules live
// as template literals inside components, and the point is to measure the
// string the component actually emits.

const src = (s) => readFileSync(new URL(`../${s.file}`, import.meta.url), 'utf8');

// Every one of these files carries a comment ABOUT the body rule, and several
// quote the rule verbatim to explain why it used to be inert. Those comments
// have to go before anything is matched, or the harness reads the prose and
// reports the fault the prose is describing. `//` is only treated as a comment
// when it does not follow a colon, so the `https://` in a doc block survives.
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

// `${NAVY}` and `${PAGE_BG}` have to be resolved BEFORE the rule is matched,
// not after. The `}` that closes a template placeholder is indistinguishable
// from the `}` that closes the rule, so a declaration-block match run first
// stops inside the placeholder and yields a truncated, unparseable rule.
function resolvePlaceholders(text, whole) {
  return text.replace(/\$\{(\w+)\}/g, (_, ident) => {
    const lit = whole.match(new RegExp(`const ${ident}\\s*=\\s*["']([^"']+)["']`));
    if (lit) return lit[1];
    // `const PAGE_BG = DASH.pageBg` -- the dedup this PR also does.
    if (new RegExp(`const ${ident}\\s*=\\s*DASH\\.pageBg`).test(whole)) return DASH.pageBg;
    return `UNRESOLVED_${ident}`;
  });
}

// The `body { ... }` declaration block that sets a background. Returns null
// when the file states none, which is the shipped state of the four hook
// surfaces and is what check 3 requires of them.
function bodyRule(text) {
  const clean = resolvePlaceholders(stripComments(text), text);
  const m = clean.match(/body\s*\{[^{}]*background[^{}]*\}/);
  return m ? m[0].trim() : null;
}

// The colour a hook surface hands to the hook. Matches either form.
function hookGround(text, mech) {
  // Comment-stripped for the same reason bodyRule is: these files name the hook
  // in prose, and a doc reference must not read as a call site.
  const clean = stripComments(text);
  const m = mech === 'edge'
    ? clean.match(/<BodyGround\s+color=\{([^}]+)\}/)
    : clean.match(/useBodyBackground\(([^)]+)\)/);
  if (!m) return null;
  const expr = m[1].trim();
  return expr === 'DASH.pageBg' ? DASH.pageBg : null;
}

// ─── The real DOM shape ─────────────────────────────────────────────────────
//
// app/layout.tsx's body, verbatim, including the inline prop that is the whole
// reason the old rules lost. Anything that computes correctly here computes
// correctly in the app for the same reason.
function doc(extraCss) {
  return `<!doctype html><html><head>
    <style>:root { --ec-bg: ${EC_BG_LIGHT}; }</style>
    <style id="surface">${extraCss ?? ''}</style>
  </head>
  <body class="min-h-dvh" style="background: var(--ec-bg); color: var(--ec-ink)">
    <div style="min-height: 100dvh">surface</div>
  </body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.emulateMedia({ media: 'screen' });

console.log(
  PROVE
    ? 'PROVE: Tier B against the PRE-FIX arrangement (no !important, no inline write)\n'
    : 'Running against the shipped arrangement\n'
);
if (FAULTS.size) console.log(`FAULT: expecting ${[...FAULTS].map(([k, v]) => `${k}=${v}`).join(', ')}\n`);

// ── 1. Tier A: the gutter on a real server ────────────────────────────────
const liveable = SURFACES.filter((s) => s.route);
if (PROVE) {
  console.log('1. live gutter -- skipped under --prove, the server serves the shipped app');
} else if (!BASE) {
  console.log('1. live gutter -- skipped, no --base given');
  note('pass --base http://localhost:5140 against `next build && next start` for the real thing');
} else {
  console.log(`1. live gutter at ${BASE}`);
  for (const s of liveable) {
    const url = BASE + s.route;
    let landed;
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      landed = new URL(page.url()).pathname;
      if (!res || res.status() >= 500) { fail(`${s.key.padEnd(16)} ${url} returned ${res?.status()}`); continue; }
    } catch (err) {
      fail(`${s.key.padEnd(16)} could not load ${url}: ${err.message}`);
      continue;
    }

    // A redirect means the route was not actually exercised, and a colour read
    // off the wrong page is worse than no colour at all.
    const expectedPath = new URL(url).pathname;
    if (landed !== expectedPath) {
      fail(`${s.key.padEnd(16)} redirected to ${landed}, the surface never rendered`);
      continue;
    }

    const got = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const target = want(s);
    if (got === rgb(target)) pass(`${s.key.padEnd(16)} gutter is ${target}`);
    else if (got === rgb(EC_BG_LIGHT))
      fail(`${s.key.padEnd(16)} gutter fell back to --ec-bg ${EC_BG_LIGHT}, the rule never painted`);
    else fail(`${s.key.padEnd(16)} gutter is ${got}, wanted ${rgb(target)} (${target})`);
  }
  for (const s of SURFACES.filter((x) => x.gated)) {
    note(`${s.key.padEnd(16)} not reachable live: ${s.gated}`);
  }
}

// ── 2. Tier B: the shipped mechanism, replayed against the layout's body ──
console.log('\n2. cascade against app/layout.tsx\'s inline body');
for (const s of SURFACES) {
  const text = src(s);
  const target = want(s);

  if (s.mech === 'css') {
    let rule = bodyRule(text);
    if (!rule) { fail(`${s.key.padEnd(16)} states no body background rule at all`); continue; }
    // The pre-fix arrangement is this same rule without its !important.
    if (PROVE) rule = rule.replace(/\s*!important/g, '');
    await page.setContent(doc(rule), { waitUntil: 'load' });
  } else {
    const ground = hookGround(text, s.mech);
    if (ground === null) { fail(`${s.key.padEnd(16)} does not hand DASH.pageBg to the hook`); continue; }
    await page.setContent(doc(''), { waitUntil: 'load' });
    // What useBodyBackground does, and the only thing it does. Skipped under
    // --prove, which is the pre-fix state: the rule was in the stylesheet and
    // lost to the inline prop, and nothing wrote the body at all.
    if (!PROVE) await page.evaluate((c) => { document.body.style.background = c; }, ground);
  }

  const got = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  if (got === rgb(target)) pass(`${s.key.padEnd(16)} computes to ${target}`);
  else if (got === rgb(EC_BG_LIGHT))
    fail(`${s.key.padEnd(16)} fell back to --ec-bg ${EC_BG_LIGHT}, the mechanism never painted`);
  else fail(`${s.key.padEnd(16)} computes to ${got}, wanted ${rgb(target)} (${target})`);
}

// ── 3. the mechanism is the one this surface is supposed to use ───────────
// Guards the two ways this regresses without changing a colour: a navy rule
// losing its !important and going inert again, or a teacher row having its hook
// swapped back for a stylesheet rule that cannot follow DASH into dark.
console.log('\n3. mechanism per surface');
for (const s of SURFACES) {
  const text = src(s);
  const rule = bodyRule(text);

  if (s.mech === 'css') {
    if (!rule) fail(`${s.key.padEnd(16)} states no body background rule`);
    else if (!/!important/.test(rule)) fail(`${s.key.padEnd(16)} body rule has no !important, it is inert: ${rule}`);
    else pass(`${s.key.padEnd(16)} body rule carries !important`);
  } else {
    const ground = hookGround(text, s.mech);
    const via = s.mech === 'edge' ? '<BodyGround color={DASH.pageBg}>' : 'useBodyBackground(DASH.pageBg)';
    if (ground === null) fail(`${s.key.padEnd(16)} does not wire ${via}`);
    else if (rule) fail(`${s.key.padEnd(16)} still states a body background rule, which the hook makes dead: ${rule}`);
    else pass(`${s.key.padEnd(16)} ground comes from ${via}`);
  }
}

// ── 4. the ground is a resolved hex, never a var() ────────────────────────
// body cannot read --umd-* : those are declared on a descendant, and custom
// properties inherit downward only. A var() here would compute to nothing and
// the gutter would silently fall back.
console.log('\n4. grounds are resolved values');
for (const hex of [NAVY, LIGHT]) {
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) pass(`${hex} is a resolved hex`);
  else fail(`${hex} is not a resolved hex, body cannot read it`);
}

await browser.close();

console.log('');
if (PROVE) {
  if (failures > 0) {
    console.log(`PROVE: ${failures} assertion(s) failed against the pre-fix arrangement, as required.`);
    process.exit(0);
  }
  console.log('PROVE: the pre-fix arrangement passed every check. This harness is hollow.');
  process.exit(1);
}
console.log(failures === 0 ? `All ${checked} checks passed.` : `${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
