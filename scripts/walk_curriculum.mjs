// walk_curriculum.mjs -- every curriculum surface, both themes, two widths, on
// REAL /course URLs with a REAL session and REAL rendered maths.
//
//   node scripts/capture_auth_state.mjs --base http://localhost:5140
//   node scripts/walk_curriculum.mjs     --base http://localhost:5140
//
// This is the check the other five could not be. It navigates the actual routes
// a student navigates, signed in as a real entitled account, and measures what
// the browser paints. It exercises the gate, the middleware, the layout chain,
// the real Supabase read, the view projection, RLS and the PostgREST column list
// on the way to the pixels it measures. verify_lesson_dark.mjs fakes auth and
// the topic fetch; this fakes neither.
//
// ─── THREE THINGS THE FIRST VERSION OF THIS FILE GOT WRONG ──────────────────
//
// Recorded rather than quietly fixed, because all three are the same defect
// class this branch exists to close: a check that reports success while
// measuring something other than the thing.
//
// 1. IT WAITED ON networkidle. Measured 2026-08-22: the quiz surface never
//    reaches networkidle and times out at 30s with ZERO requests outstanding.
//    Every surface now waits on the element it is about to assert against,
//    which is faster and is the actual precondition.
//
// 2. IT TRUSTED addInitScript FOR THE THEME. It wrote localStorage['ec-theme']
//    and measured, asserting nothing about whether the theme applied.
//    ThemeProvider initialises to "light" and reads storage in an effect, so a
//    dark pass that silently stayed light would have reported clean -- and would
//    have reported the LIGHT contrast number as the dark one. The resolved
//    data-theme on the surface wrapper is now asserted before anything is
//    measured, and every measurement is gated behind it.
//
// 3. ITS BOUNDARY CHECK WAS AN ABSENCE ASSERTION. `!url.includes('/topic/...')`
//    passes when the server 500s, when the dev server is down, and when the URL
//    has a typo. It is the same shape as CourseBand's "absence of \d+/\d+"
//    passing on "undefined / 97". Every assertion in this file now names the
//    value it expects.
//
// ─── ENTITLEMENT STATES, STATED HONESTLY ────────────────────────────────────
//
// TWO states are walked on real URLs, and they are the two that need no second
// account: SIGNED OUT (a fresh context, asserted to land on /login with the
// requested path preserved in ?next=) and FULL COURSE (the captured session).
//
// The other three -- signed-in free tier, teacher-by-plan, and the derived
// teacher-grant branch in course-access.ts -- each need a DIFFERENT ACCOUNT.
// One saved session is one account. They are NOT covered here and are NOT
// covered on real URLs anywhere; verify_modules_states.mjs mounts the real row
// components in each state, which is a weaker instrument, and it is named as one
// here rather than left implied.
//
// ─── THE PERSONA THIS ACTUALLY RUNS AS ──────────────────────────────────────
//
// vics8388@gmail.com is role='teacher', plan='full-course'. Checked against
// app/lib/course-access.ts rather than assumed: the BUYER branch is evaluated
// first and matches, returning viaTeacher:false, so the role is never read and
// this is the plain direct-entitlement path. The teacher branch below it could
// not fire anyway -- it also requires planGrants(plan,'teacher-dashboard'), and
// that capability is only on teacher-core and teacher-pro.
//
// Role is therefore orthogonal to /course. It is NOT orthogonal to the student
// rail on /dashboard/modules: StudentNav renders the band as "TEACHER · PREVIEW"
// rather than "STUDENT" for a teacher without a teacher plan. That string is
// pinned below as the value this persona must produce, not as the value a
// student would.

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { assertSessionOpensCurriculum, GUARD_H1, GUARD_PATH } from './session-guard.mjs';

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
    `No ${STATE}.\n\nRun the capture first, with the SAME --base:\n` +
      `  node scripts/capture_auth_state.mjs --base ${BASE}\n`
  );
  process.exit(2);
}
mkdirSync(SHOTS, { recursive: true });

// QR.1.5 is the topic under test because it is the one from the production
// screenshot that opened this work: real inline maths at $40 - 65 = -25$, real
// bold key terms, seven authored sections. It is also NOT the free sample
// (AR.1.4), so reaching it at all is a Full-Course-only outcome.
const T = 'tsia2/math/unit/0/topic/QR.1.5';

// ─── EXPECTED VALUES ────────────────────────────────────────────────────────
//
// Every number here was read off a render that had already cleared the session
// guard, then re-derived from a second independent run. They are pinned EXACTLY
// on purpose: a shape like "some KaTeX nodes" is satisfiable by a broken render,
// and the contrast pair is the headline of the PR, so drift in it must fail the
// build rather than quietly restate the claim.
const EXPECT = {
  h1: GUARD_H1,
  courseDenominator: 97,
  railBand: 'TEACHER · PREVIEW',
  modulesH1: 'Modules',
  lesson: { katex: 77, mathml: 77, firstInlineMath: '40−65=−25' },
  practice: { katex: 5, mathml: 5, counter: '1 / 10' },
  quiz: { katex: 23, mathml: 23 },
  overview: { katex: 0 },
  // The PR headline. Card removal raised inline-maths contrast in BOTH themes.
  inlineMathContrast: { light: 14.68, dark: 15.29 },
};

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
let passed = 0;
const check = (label, got, want, ok = null) => {
  const good = ok === null ? Object.is(got, want) : ok;
  if (good) passed++;
  else failed++;
  console.log(
    good
      ? `  pass  ${label} = ${JSON.stringify(got)}`
      : `  FAIL  ${label}\n          expected ${JSON.stringify(want)}\n          got      ${JSON.stringify(got)}`
  );
};

// Composites text alpha over the nearest painted ancestor background, so a
// half-transparent ink on a tinted panel measures what the eye sees.
const contrastProbe = `(sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const parse = (c) => c.match(/[\\d.]+/g).map(Number);
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  let bg = [255, 255, 255], bgFrom = null;
  for (let n = el; n; n = n.parentElement) {
    const c = parse(getComputedStyle(n).backgroundColor);
    if (c.length < 4 || c[3] > 0) {
      bg = c.slice(0, 3);
      bgFrom = n.tagName.toLowerCase() + (typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\\s+/)[0] : '');
      break;
    }
  }
  const fg = parse(getComputedStyle(el).color);
  const a = fg.length > 3 ? fg[3] : 1;
  const over = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
  const [hi, lo] = [lum(over), lum(bg)].sort((x, y) => y - x);
  return { ratio: Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100, bgFrom, text: el.textContent.slice(0, 24) };
}`;

const browser = await chromium.launch();

// ─── STEP 0: the session opens curriculum ───────────────────────────────────
//
// Re-run here and not only at capture time. The capture may have been minutes or
// hours ago and an access token lasts about an hour; without this, an expired
// session would be discovered five surfaces and twenty screenshots later, with
// the login page saved under names like lesson-desktop-dark.png.
console.log(`\n── step 0: session ──`);
{
  const ctx = await browser.newContext({ storageState: STATE, viewport: { width: 1280, height: 900 } });
  try {
    const seen = await assertSessionOpensCurriculum(ctx, BASE);
    console.log(`  pass  session opens ${GUARD_PATH} (${seen.katex} KaTeX, ${seen.mathml} MathML)`);
    passed++;
  } catch (e) {
    console.error(`\n${e.message}\n`);
    await browser.close();
    process.exit(1);
  }
  await ctx.close();
}

// ─── The signed-out boundary ────────────────────────────────────────────────
//
// Named, not absent. The old check accepted any URL that was not the lesson,
// which a 500 and a dead dev server both satisfy.
console.log(`\n── entitlement state: SIGNED OUT ──`);
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const res = await p.goto(`${BASE}${GUARD_PATH}`, { waitUntil: 'domcontentloaded' });
  const u = new URL(p.url());
  check('signed-out status', res.status(), 200);
  check('signed-out pathname', u.pathname, '/login');
  // The requested page has to survive the round trip, or a student who follows a
  // deep link signs in and lands somewhere else.
  check('signed-out ?next preserves the requested path', u.searchParams.get('next'), GUARD_PATH);
  await ctx.close();
}

// ─── FULL COURSE, both themes, both widths ──────────────────────────────────
console.log(`\n── entitlement state: FULL COURSE ──`);
for (const [wname, width, height] of WIDTHS) {
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ storageState: STATE, viewport: { width, height } });
    await ctx.addInitScript((t) => {
      try { localStorage.setItem('ec-theme', t); } catch {}
    }, theme);
    const p = await ctx.newPage();

    console.log(`\n  ── ${wname} ${width}px, ${theme} ──`);

    for (const [name, path] of SURFACES) {
      const res = await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
      const wrapperSel = name === 'modules' ? '.um-dash' : '.um-topic';
      await p.waitForSelector(`${wrapperSel}[data-theme]`, { timeout: 20_000 }).catch(() => {});
      if (['lesson', 'practice', 'quiz'].includes(name)) {
        await p.waitForSelector('.katex', { timeout: 20_000 }).catch(() => {});
      }

      check(`${name}: status`, res.status(), 200);
      check(`${name}: pathname`, new URL(p.url()).pathname, path);

      // THE THEME IS APPLIED ASYNCHRONOUSLY, so it is waited for and then
      // asserted, not read the instant the document parses.
      //
      // Found by this check failing intermittently -- quiz red on desktop/dark,
      // practice red on phone/dark, different surfaces on different runs, which
      // is the signature of a race rather than of a broken theme. ThemeProvider
      // initialises to "light" and reads localStorage in an EFFECT, so between
      // domcontentloaded and hydration every surface genuinely is light.
      //
      // WAITING DOES NOT MAKE THIS UNFAILABLE. On timeout the wait gives up and
      // the assertion below reports whatever the attribute actually says, so a
      // theme that never applies is still red -- proven in the fault-proof
      // section of the report by breaking ThemeProvider and watching all twenty
      // theme checks go red.
      await p
        .waitForFunction(
          ([sel, want]) => document.querySelector(sel)?.dataset?.theme === want,
          [wrapperSel, theme],
          { timeout: 10_000 }
        )
        .catch(() => {});

      // THE THEME ACTUALLY APPLIED. Everything measured below is meaningless if
      // this is wrong, so it gates the measurements rather than sitting beside
      // them: a dark pass that stayed light would otherwise report the light
      // contrast number under a dark label.
      const applied = await p.evaluate((s) => document.querySelector(s)?.dataset?.theme ?? null, wrapperSel);
      check(`${name}: resolved data-theme on ${wrapperSel}`, applied, theme);
      const themeOk = applied === theme;

      if (name === 'modules') {
        const m = await p.evaluate(() => {
          const t = document.body.innerText;
          // The band is read off the ELEMENT, not off innerText. innerText
          // omits anything not rendered, so at 390px -- where the rail is in the
          // DOM but laid out to zero -- it returned null and the check failed
          // against a real and correct mobile layout. Measuring the node
          // separates "the band says the wrong thing" from "the band is not on
          // screen at this width", which are different defects.
          const band = [...document.querySelectorAll('div')].find(
            (e) => e.children.length === 0 && /^(TEACHER · (PRO|CORE|PREVIEW)|STUDENT)$/.test(e.textContent.trim())
          );
          const course = (t.match(/(\d+|undefined|NaN)\s*\/\s*(\d+|undefined|NaN)/) || []);
          return {
            h1: document.querySelector('h1')?.textContent?.trim() ?? null,
            band: band?.textContent?.trim() ?? null,
            bandVisible: band ? Boolean(band.offsetWidth || band.offsetHeight) : false,
            num: course[1] ?? null,
            den: course[2] ?? null,
          };
        });
        check('modules: h1', m.h1, EXPECT.modulesH1);
        check('modules: rail band (this persona is role=teacher)', m.band, EXPECT.railBand);
        // The rail is a desktop element. Pinned per width rather than skipped on
        // the phone, so that a rail LEAKING onto the phone layout is also red.
        check(`modules: rail band visible at ${width}px`, m.bandVisible, wname === 'desktop');
        // THE CourseBand REFERENCE FAILURE, fixed properly. The old check was
        // "absence of \d+\s*/\s*\d+", which passed on "undefined / 97". This
        // names both halves: the denominator is exactly the course size, and the
        // numerator must parse as an integer in range.
        check('modules: course denominator', Number(m.den), EXPECT.courseDenominator);
        const n = Number(m.num);
        check(
          'modules: course numerator is an integer in 0..97',
          m.num,
          'an integer 0..97',
          Number.isInteger(n) && n >= 0 && n <= EXPECT.courseDenominator
        );
      } else {
        const h1 = await p.evaluate(() => document.querySelector('h1')?.textContent?.trim() ?? null);
        check(`${name}: h1`, h1, EXPECT.h1);
      }

      // Maths, where there should be maths. Provenance first: real KaTeX emits
      // MathML and a hand-written span cannot.
      const counts = await p.evaluate(() => ({
        katex: document.querySelectorAll('.katex').length,
        mathml: document.querySelectorAll('.katex .katex-mathml').length,
      }));
      if (EXPECT[camel(name)]) {
        const e = EXPECT[camel(name)];
        if (e.katex !== undefined) check(`${name}: .katex nodes`, counts.katex, e.katex);
        if (e.mathml !== undefined) check(`${name}: .katex-mathml nodes`, counts.mathml, e.mathml);
        if (e.counter !== undefined) {
          const c = await p.evaluate(() => (document.body.innerText.match(/\d+\s*\/\s*\d+/) || [null])[0]);
          check(`${name}: item counter`, c, e.counter);
        }
      }

      // ─── THE HEADLINE MEASUREMENT ─────────────────────────────────────────
      //
      // TARGETED, not `.katex`. The old probe took the first .katex in DOM
      // order. On THIS topic that happens to be the right node -- proven, not
      // assumed: document.querySelector('.katex') === document.querySelector(
      // '.um-prose p .katex') is true here, and all 77 KaTeX nodes are inside
      // .um-prose. But the outline rail at LessonBody.tsx:215 renders
      // section.heading_html BEFORE the content column, so on a topic whose
      // authored h5 contains maths the old selector would silently measure a
      // rail heading instead. It was luck, so it is now named.
      if (name === 'lesson' && themeOk) {
        const inline = await p.evaluate(`(${contrastProbe})('.um-prose p .katex')`);
        check('lesson: first inline maths text', inline?.text?.slice(0, 9) ?? null, EXPECT.lesson.firstInlineMath.slice(0, 9));
        check(`lesson: inline maths contrast (${theme})`, inline?.ratio ?? null, EXPECT.inlineMathContrast[theme]);
        check(
          `lesson: inline maths clears WCAG AA`,
          inline?.ratio ?? null,
          '>= 4.5',
          (inline?.ratio ?? 0) >= 4.5
        );
      }

      // Nothing may scroll sideways. The redesign removed the fixed-width cards,
      // so a stray min-width surfaces here first, and on the phone before
      // anywhere else.
      const overflow = await p.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      check(`${name}: horizontal overflow px`, overflow, '<= 1', overflow <= 1);

      await p.screenshot({ path: `${SHOTS}/${name}-${wname}-${theme}.png`, fullPage: true });
    }
    await ctx.close();
  }
}

function camel(s) {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

await browser.close();
console.log(
  failed === 0
    ? `\nall ${passed} checks passed. shots in ${SHOTS}/`
    : `\n${failed} of ${passed + failed} check(s) FAILED`
);
process.exit(failed === 0 ? 0 : 1);
