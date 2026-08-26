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

import { readFile } from 'node:fs/promises';
import { startLane, readComputed, assertTheme, withBrowser, LANE_ROUTES } from './ui-verify-lane.mjs';

// The tokens under test, from app/components/dashboard-theme.ts:173 and :222.
// Restated rather than imported so a future edit to the palette has to disagree
// with a second copy before it can quietly move the lane's own baseline.
const SHELL_LIGHT = 'rgb(245, 245, 243)'; // #F5F5F3  LIGHT.pageBg
const SHELL_DARK = 'rgb(23, 23, 26)'; //    #17171A  DARK.pageBg

// The curriculum route's ground, from curriculum-surface.ts LIGHT.page and
// DARK.page. Read as well as the shell's because this route's values resolve
// through var() -- they are the ones that depend on TOPIC_PAGE_CSS being
// injected correctly, and a silent injection failure computes to transparent
// rather than erroring.
//
// LIGHT MOVED 2026-08-26, from cream #E8E0CF to the dashboard's neutral field.
// That is the change this baseline exists to catch, and it caught it: this is a
// deliberate update to a value that genuinely moved, made in the same commit as
// the move. The restatement is still the point -- an accidental palette edit
// still has to disagree with this copy before it can ship.
//
// LIGHT AND DARK ARE NOW THE SAME PAIR OF HEXES AS THE SHELL'S, and that is a
// real result rather than a copy-paste: the curriculum tree and the dashboard
// are on one neutral field in both themes as of this change. The two are still
// declared separately because they are two independent claims, and collapsing
// them to one constant would stop this file noticing if only one of them moved.
const CURRICULUM_LIGHT = 'rgb(245, 245, 243)'; // #F5F5F3  LIGHT.page, was #E8E0CF
const CURRICULUM_DARK = 'rgb(23, 23, 26)'; //     #17171A  DARK.page, unchanged

// The panel rung, LIGHT.panel and DARK.panel. Asserted by VALUE and not merely
// as "not transparent", which is what this file checked before: a panel that had
// silently gone back to cream #FFFDF8 would have passed the old check happily.
const CURRICULUM_PANEL_LIGHT = 'rgb(255, 255, 255)'; // #FFFFFF, was #FFFDF8
const CURRICULUM_PANEL_DARK = 'rgb(38, 37, 33)'; //    #262521, unchanged

// The prose card's measure. practice/page.tsx and quiz/page.tsx cap their card
// at the lesson column's 788, and app/um-verify/curriculum/page.tsx carries a
// copy of that card. Two numbers because they answer two questions: the
// DECLARED cap proves the rule is on the element, and the USED width proves the
// cap actually binds rather than sitting under a narrower container.
//
// 788 and not 734: nothing in this app sets box-sizing, so the default
// content-box applies and max-width constrains the content box directly.
const CARD_MAX_WIDTH = '788px';
const CARD_USED_WIDTH = '788px';

// The active Lesson/Practice/Quiz segment, LIGHT.tabActiveBg. It moved off
// cream #E8E0CF in the same change as the ladder; see the note at
// curriculum-surface.ts LIGHT.tabActiveBg for why it is chipBg and not the
// neutral field.
//
// THE INACTIVE SEGMENT IS READ TOO, and that is the assertion that carries the
// weight. Asserting the active fill alone would still pass if the inactive ones
// had somehow acquired the same fill -- the defect the gate on this change was
// written to prevent is precisely "the current tab stops being distinguishable",
// which is a statement about the PAIR, not about either colour on its own.
const TAB_ACTIVE_LIGHT = 'rgb(237, 235, 228)'; // #EDEBE4, was cream #E8E0CF
const TAB_INACTIVE_LIGHT = 'rgba(0, 0, 0, 0)'; // `transparent`, showing the bar

// The top bar's bottom edge, TopicChrome.tsx:74, painted with LIGHT.rule.
//
// WHY IT IS ASSERTED HERE. The structural rule moved off Cipher Gold on
// 2026-08-26 at FOUR call sites at once, and moving all four together was the
// decision rather than a side effect -- two structural-rule colours in one tree
// would be worse than either alone. So each site needs a check that reddens on
// a partial revert. This lane owns this one because TopicChrome needs no lesson
// data and is already mounted here; the section divider, the outline rail edge
// and the practice problem frame need real sections and items, so they are
// asserted in scripts/verify_lesson_dark.mjs. See ui-verify-lane.mjs:15-18 for
// the split.
//
// Restated rather than imported, like every other baseline in this file.
// Border colour serialises as the authored rgba, uncomposited.
const RULE_LIGHT = 'rgba(14, 14, 17, 0.3)'; // LIGHT.rule, was gold #C8A96E

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
    for (const [theme, expectedGround, expectedPanel] of [
      ['light', CURRICULUM_LIGHT, CURRICULUM_PANEL_LIGHT],
      ['dark', CURRICULUM_DARK, CURRICULUM_PANEL_DARK],
    ]) {
      const { values, resolvedTheme } = await readComputed(browser, lane.origin, {
        route: LANE_ROUTES.curriculum,
        theme,
        probes: {
          ground: { selector: '.um-topic', prop: 'backgroundColor' },
          panel: { selector: '[data-probe="prose-card"]', prop: 'backgroundColor' },
          cardMaxWidth: { selector: '[data-probe="prose-card"]', prop: 'maxWidth' },
          cardWidth: { selector: '[data-probe="prose-card"]', prop: 'width' },
          tabActive: {
            selector: '.um-bar-parts a[aria-current="page"]',
            prop: 'backgroundColor',
          },
          tabInactive: {
            selector: '.um-bar-parts a:not([aria-current])',
            prop: 'backgroundColor',
          },
          barRule: { selector: '.um-bar', prop: 'borderBottomColor' },
          barRuleStyle: { selector: '.um-bar', prop: 'borderBottomStyle' },
        },
      });
      assertTheme(theme, resolvedTheme, `curriculum/${theme}`);
      record(
        `curriculum ${theme}: .um-topic ground is ${expectedGround}`,
        values.ground === expectedGround,
        `got ${values.ground}, data-theme ${resolvedTheme}`,
      );
      record(
        `curriculum ${theme}: the panel resolved a token rather than transparent`,
        values.panel !== 'rgba(0, 0, 0, 0)',
        `panel ${values.panel}`,
      );
      record(
        `curriculum ${theme}: the panel is ${expectedPanel}`,
        values.panel === expectedPanel,
        `got ${values.panel}`,
      );

      // Theme-independent, so recorded once rather than twice: two rows saying
      // the same thing would both redden for one defect and read as two.
      if (theme === 'light') {
        record(
          `curriculum: the prose card declares max-width ${CARD_MAX_WIDTH}`,
          values.cardMaxWidth === CARD_MAX_WIDTH,
          `got ${values.cardMaxWidth}`,
        );
        record(
          `curriculum: the active tab is ${TAB_ACTIVE_LIGHT}, not cream`,
          values.tabActive === TAB_ACTIVE_LIGHT,
          `got ${values.tabActive}`,
        );
        record(
          'curriculum: the inactive tab is transparent, so the active fill is ' +
            'what distinguishes them',
          values.tabInactive === TAB_INACTIVE_LIGHT &&
            values.tabActive !== values.tabInactive,
          `active ${values.tabActive} vs inactive ${values.tabInactive}`,
        );
        record(
          `curriculum: the top bar's rule is the neutral ${RULE_LIGHT}, not the gold`,
          values.barRuleStyle === 'solid' && values.barRule === RULE_LIGHT,
          `got ${values.barRule} (${values.barRuleStyle}) -- if this reads ` +
            `rgb(200, 169, 110) the rule token was partially reverted to ` +
            `Cipher Gold; the other three call sites are in verify_lesson_dark.mjs`,
        );
        record(
          `curriculum: the prose card's used width caps at ${CARD_USED_WIDTH}`,
          values.cardWidth === CARD_USED_WIDTH,
          `got ${values.cardWidth} (viewport 1280; uncapped this measures 1158px, ` +
            `observed -- .um-page pads 34px a side and computed width is the ` +
            `content box, so the card's own 1px border and 26px padding come off too)`,
        );
      }
    }

    // ── 3b. THE CAP IS ON THE REAL PAGES, NOT JUST ON THE LANE'S COPY ─────
    //
    // The read above measures app/um-verify/curriculum/page.tsx, which carries a
    // COPY of the practice and quiz prose card rather than importing it. So on
    // its own it proves the lane caps its own card and says nothing about the
    // two pages a student actually loads. This closes that gap the only way a
    // DB-free lane can: by reading the source of both.
    //
    // A source check and not a render check, deliberately. Rendering the real
    // routes needs topic data, which needs a database, which is the whole reason
    // this lane exists. Asserting the declaration is the strongest claim
    // available without one, and it is the claim that would actually break --
    // the failure mode here is somebody editing one page and not the other.
    const REAL_CARDS = [
      'app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/practice/page.tsx',
      'app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/quiz/page.tsx',
      'app/um-verify/curriculum/page.tsx',
    ];
    for (const file of REAL_CARDS) {
      const src = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
      const hits = src.match(/maxWidth: 788\b/g) ?? [];
      record(
        `${file.split('/').slice(-2).join('/')} caps its prose card at 788`,
        hits.length === 1,
        `${hits.length} occurrence(s) of \`maxWidth: 788\``,
      );
    }

    // The cap must be flush left, per the decision recorded on both cards: the
    // lesson column does not centre (LessonBody.tsx:362) and these must not
    // either. A `margin: auto` slipping in later is the regression this catches.
    for (const file of REAL_CARDS.slice(0, 2)) {
      const src = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
      const card = src.slice(src.indexOf('maxWidth: 788'));
      const styleBlockEnd = card.indexOf('}}');
      const withinCard = card.slice(0, styleBlockEnd === -1 ? 400 : styleBlockEnd);
      record(
        `${file.split('/').slice(-2).join('/')} leaves the card flush left`,
        !/margin(Left|Right|Inline)?:\s*['\`"]?auto/.test(withinCard),
        withinCard.includes('auto') ? 'found an auto margin on the card' : 'no auto margin',
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
