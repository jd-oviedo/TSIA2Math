// Proves the UI verification lane itself works, before anything relies on it.
//
// This is the lane's own test, not a test of any surface. It answers three
// questions, and a lane that cannot answer all three is not usable:
//
//   1. Does the lane resolve a known token correctly, in BOTH themes?
//   2. Can an assertion against it actually fail, or does it pass on anything?
//   3. Does the hydration guard halt the run, rather than letting a dead page
//      report a colour?
//
// Question 3 is the one that matters most and the one that is easiest to skip.
// In #208 two full verifier runs reported confident colour results off a page
// that had never hydrated: every value was the light default, which is the same
// colour as the bug that run was looking for. assertTheme exists to make that
// impossible, so assertTheme has to be shown firing.
//
// DB-free throughout: the lane fetches nothing. One read-only auth check runs
// via existing middleware; it reads and writes nothing.
//
// Run: node scripts/verify_ui_lane.mjs

import { startLane, readComputed, assertTheme, withBrowser, LANE_ROUTES } from './ui-verify-lane.mjs';

// The tokens under test, from app/components/dashboard-theme.ts:173 and :222.
// Restated rather than imported so a future edit to the palette has to disagree
// with a second copy before it can quietly move the lane's own baseline.
const SHELL_LIGHT = 'rgb(245, 245, 243)'; // #F5F5F3  LIGHT.pageBg
const SHELL_DARK = 'rgb(23, 23, 26)'; //    #17171A  DARK.pageBg

// The curriculum route's ground, from curriculum-surface.ts:191 and :358. Read
// as well as the shell's because this route's values resolve through var() --
// they are the ones that depend on TOPIC_PAGE_CSS being injected correctly, and
// a silent injection failure computes to transparent rather than erroring.
const CURRICULUM_LIGHT = 'rgb(232, 224, 207)'; // #E8E0CF
const CURRICULUM_DARK = 'rgb(23, 23, 26)'; //     #17171A

const rows = [];
let failures = 0;

function record(label, ok, detail) {
  if (!ok) failures++;
  rows.push({ label, ok, detail });
}

const lane = await startLane({ quiet: false });
console.log(`lane up at ${lane.origin}\n`);

try {
  await withBrowser(async (browser) => {
    // ── 1. The lane resolves a known token, both themes ────────────────────
    const shell = {};
    for (const [theme, expected] of [
      ['light', SHELL_LIGHT],
      ['dark', SHELL_DARK],
    ]) {
      const { values, resolvedTheme } = await readComputed(browser, lane.origin, {
        route: LANE_ROUTES.shell,
        theme,
        probes: { ground: { selector: '.um-dash', prop: 'backgroundColor' } },
      });
      assertTheme(theme, resolvedTheme, `shell/${theme}`);
      shell[theme] = { got: values.ground, resolvedTheme };
      record(
        `shell ${theme}: .um-dash ground is ${expected}`,
        values.ground === expected,
        `got ${values.ground}, data-theme ${resolvedTheme}`,
      );
    }

    // ── 2. data-theme actually flips ───────────────────────────────────────
    // Without this, two passing colour reads could both be the light default on
    // a page that never switched.
    record(
      'data-theme flips between the two runs',
      shell.light.resolvedTheme === 'light' && shell.dark.resolvedTheme === 'dark',
      `light run -> ${shell.light.resolvedTheme}, dark run -> ${shell.dark.resolvedTheme}`,
    );
    record(
      'the two themes produce different grounds',
      shell.light.got !== shell.dark.got,
      `${shell.light.got} vs ${shell.dark.got}`,
    );

    // ── 3. The curriculum route resolves its var()-based tokens ────────────
    // This is the half that broke twice in #208. If TOPIC_PAGE_CSS is not on
    // the page, --umt-page is undefined and this reads rgba(0, 0, 0, 0).
    for (const [theme, expected] of [
      ['light', CURRICULUM_LIGHT],
      ['dark', CURRICULUM_DARK],
    ]) {
      const { values, resolvedTheme } = await readComputed(browser, lane.origin, {
        route: LANE_ROUTES.curriculum,
        theme,
        probes: {
          ground: { selector: '.um-topic', prop: 'backgroundColor' },
          panel: { selector: '[data-probe="prose-card"]', prop: 'backgroundColor' },
        },
      });
      assertTheme(theme, resolvedTheme, `curriculum/${theme}`);
      record(
        `curriculum ${theme}: .um-topic ground is ${expected}`,
        values.ground === expected,
        `got ${values.ground}, data-theme ${resolvedTheme}`,
      );
      record(
        `curriculum ${theme}: the panel resolved a token rather than transparent`,
        values.panel !== 'rgba(0, 0, 0, 0)',
        `panel ${values.panel}`,
      );
    }

    // ── 4. THE CONTROL: an assertion here can actually fail ────────────────
    // Same read as case 1, held against a value the lane does not paint. If
    // this "passes", the check is not reading the page.
    const WRONG = 'rgb(1, 2, 3)';
    const { values: controlValues, resolvedTheme: controlTheme } = await readComputed(
      browser,
      lane.origin,
      {
        route: LANE_ROUTES.shell,
        theme: 'light',
        probes: { ground: { selector: '.um-dash', prop: 'backgroundColor' } },
      },
    );
    assertTheme('light', controlTheme, 'control');
    record(
      `CONTROL: asserting the wrong value (${WRONG}) does not match`,
      controlValues.ground !== WRONG,
      `got ${controlValues.ground}, which is correctly not ${WRONG}`,
    );

    // ── 5. THE GUARD PROOF: assertTheme halts on a real mismatch ───────────
    // A live lane page is loaded in dark, its wrapper is then forced to the
    // wrong theme, and the guard is run against that real page state. The
    // requirement is that it THROWS -- not that it returns false, and not that
    // it reddens a row. A run whose page did not hydrate has measured nothing
    // and must abort rather than report any result at all.
    const ctx = await browser.newContext();
    await ctx.addInitScript(
      ([k, v]) => {
        try {
          localStorage.setItem(k, v);
        } catch {}
      },
      ['ec-theme', 'dark'],
    );
    const page = await ctx.newPage();
    await page.goto(`${lane.origin}${LANE_ROUTES.shell}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.um-dash');

    // Let the real theme land first, so the corruption below replaces a
    // genuinely-resolved value rather than racing the effect that sets it.
    await page.waitForFunction(
      () => document.querySelector('.um-dash')?.getAttribute('data-theme') === 'dark',
      undefined,
      { timeout: 10_000 },
    );
    await page.evaluate(() =>
      document.querySelector('.um-dash').setAttribute('data-theme', 'light'),
    );
    const corrupted = await page.evaluate(() =>
      document.querySelector('.um-dash').getAttribute('data-theme'),
    );
    await ctx.close();

    let threw = false;
    let message = '';
    try {
      assertTheme('dark', corrupted, 'forced mismatch');
    } catch (err) {
      threw = true;
      message = err.message.split('\n')[0];
    }
    record(
      'GUARD PROOF: assertTheme throws when the resolved theme is wrong',
      threw && corrupted === 'light',
      threw ? `aborted with: ${message}` : 'DID NOT THROW -- a dead page could report a colour',
    );
  });
} finally {
  lane.stop();
}

console.log('\n  result  check');
for (const r of rows) {
  console.log(`  ${(r.ok ? 'pass' : 'FAIL').padEnd(6)}  ${r.label}`);
  console.log(`          ${r.detail}`);
}

if (failures) {
  console.log(`\n${failures} check(s) failed. The lane is not trustworthy; fix it before building on it.`);
  process.exit(1);
}
console.log('\nThe lane resolves both token systems in both themes, an assertion against it can fail, and the hydration guard halts the run.');
