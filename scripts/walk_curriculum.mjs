// walk_curriculum.mjs -- every curriculum surface, both themes, two widths, on
// REAL /course URLs with a REAL session and REAL rendered maths.
//
//   node scripts/walk_curriculum.mjs --base http://localhost:5140
//
// This is the check the other five could not be. It navigates the actual routes
// a student navigates, signed in as a real entitled account, and measures what
// the browser paints.
//
// REQUIRES .auth/e2e-storage-state.json. See scripts/capture_auth_state.mjs, and
// pass it the SAME --base used here: the session is cookie-borne and cookies are
// scoped to an origin.
//
// ─── WHAT THIS COVERS THAT THE COMPONENT HARNESS CANNOT ─────────────────────
//
// verify_lesson_dark.mjs mounts real components into a fake route and fakes two
// things: auth, and the topic fetch. This fakes neither. So this is the only
// check in the repo that exercises the gate, the middleware, the layout chain,
// the real Supabase read, the view projection, RLS and the PostgREST column
// list on the way to the pixels it measures.
//
// ─── ENTITLEMENT STATES, STATED HONESTLY ────────────────────────────────────
//
// One saved session is ONE account, and it is the Full Course account, so that
// is the only entitlement state this walk covers on real URLs. It does check the
// one boundary it can prove without a second account: signed OUT is redirected
// away from /course, run in a fresh context with no storageState.
//
// The other states -- free-tier sample, gated, teacher -- stay covered by
// verify_modules_states.mjs, which mounts the real row components in every
// state. That is a weaker instrument and it is named as one here rather than
// left implied.

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';

const args = process.argv.slice(2);
const arg = (n, d = null) => {
  const i = args.indexOf(n);
  return i === -1 ? d : args[i + 1];
};
const BASE = arg('--base', 'http://localhost:5140');
const STATE = '.auth/e2e-storage-state.json';
const SHOTS = process.env.SHOTS ?? 'scratch-shots-walk';

if (!existsSync(STATE)) {
  console.error(
    `No ${STATE}.\n\nRun scripts/capture_auth_state.mjs first, with the SAME --base:\n` +
      `  node scripts/capture_auth_state.mjs --base ${BASE}\n`
  );
  process.exit(2);
}
mkdirSync(SHOTS, { recursive: true });

// QR.1.5 is the topic under test because it is the one from the production
// screenshot that opened this work: real inline maths at $40 - 65 = -25$, real
// bold key terms, seven authored sections.
const T = 'tsia2/math/unit/0/topic/QR.1.5';
const SURFACES = [
  ['modules', '/dashboard/modules'],
  ['topic-overview', `/course/${T}`],
  ['lesson', `/course/${T}/lesson`],
  ['practice', `/course/${T}/practice`],
  ['quiz', `/course/${T}/quiz`],
];
const WIDTHS = [
  ['desktop', 1280, 900],
  ['phone', 390, 844],
];

let failed = 0;
const check = async (label, fn) => {
  try {
    const ok = await fn();
    console.log(`  ${ok ? 'pass' : 'FAIL'}  ${label}`);
    if (!ok) failed++;
  } catch (e) {
    console.log(`  FAIL  ${label} -- ${e.message.split('\n')[0]}`);
    failed++;
  }
};

// Same compositing probe the other checks use: walks up for the effective
// background, composites text alpha over it.
const contrastProbe = `(sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const parse = (c) => c.match(/[\\d.]+/g).map(Number);
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  let bg = [255, 255, 255];
  for (let n = el; n; n = n.parentElement) {
    const c = parse(getComputedStyle(n).backgroundColor);
    if (c.length < 4 || c[3] > 0) { bg = c.slice(0, 3); break; }
  }
  const fg = parse(getComputedStyle(el).color);
  const a = fg.length > 3 ? fg[3] : 1;
  const over = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
  const [hi, lo] = [lum(over), lum(bg)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}`;

const browser = await chromium.launch();

// ─── The signed-out boundary, before anything else ──────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/course/${T}/lesson`, { waitUntil: 'domcontentloaded' });
  await check(
    `signed OUT is redirected off /course (landed ${new URL(p.url()).pathname})`,
    () => !p.url().includes('/topic/QR.1.5/lesson')
  );
  await ctx.close();
}

for (const [wname, width, height] of WIDTHS) {
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({
      storageState: STATE,
      viewport: { width, height },
    });
    await ctx.addInitScript((t) => {
      try { localStorage.setItem('ec-theme', t); } catch {}
    }, theme);
    const p = await ctx.newPage();

    console.log(`\n  ── ${wname} ${width}px, ${theme} ──`);

    for (const [name, path] of SURFACES) {
      await p.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
      await p.waitForTimeout(500);

      // THE SESSION IS STILL GOOD. Asserted per surface, not once at the top:
      // an expired token mid-walk would otherwise screenshot the login page and
      // report a clean run, which is the exact failure this whole file exists
      // to stop.
      await check(`${name}: reached the real route, not /login`, () => {
        const u = new URL(p.url()).pathname;
        return !u.startsWith('/login') && !u.startsWith('/dashboard/upgrade');
      });

      // Maths, where there should be maths. Provenance first: real KaTeX emits
      // MathML, and a hand-written span does not.
      if (['lesson', 'practice', 'quiz'].includes(name)) {
        const katex = await p.evaluate(() => document.querySelectorAll('.katex').length);
        const mathml = await p.evaluate(
          () => document.querySelectorAll('.katex .katex-mathml').length
        );
        await check(`${name}: real KaTeX rendered (${katex} nodes, ${mathml} MathML)`,
          () => katex > 0 && mathml > 0);

        const r = await p.evaluate(`(${contrastProbe})('.katex')`);
        await check(`${name}: maths clears 4.5:1 (got ${r})`, () => r !== null && r >= 4.5);
      }

      // Nothing may scroll sideways. The redesign removed fixed-width cards, so
      // this is where a stray min-width would show up first, and it shows up on
      // the phone before it shows up anywhere else.
      const overflow = await p.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      await check(`${name}: no horizontal overflow (${overflow}px)`, () => overflow <= 1);

      await p.screenshot({
        path: `${SHOTS}/${name}-${wname}-${theme}.png`,
        fullPage: true,
      });
    }
    await ctx.close();
  }
}

await browser.close();
console.log(failed === 0 ? `\nall checks passed. shots in ${SHOTS}/` : `\n${failed} check(s) failed`);
process.exit(failed === 0 ? 0 : 1);
