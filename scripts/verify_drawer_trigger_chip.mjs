// verify_drawer_trigger_chip.mjs -- read the nav trigger's chip fill off the
// committed DB-free lane, in BOTH scopes and BOTH themes.
//
//   node scripts/verify_drawer_trigger_chip.mjs
//   node scripts/verify_drawer_trigger_chip.mjs --prove
//
// THE DEFECT, AND WHY IT WAS INVISIBLE TO EVERY EXISTING CHECK
// ------------------------------------------------------------
// StudentNavTrigger is ONE component mounted in TWO scopes:
//
//   app/dashboard/StudentShell.tsx:188   inside .um-topbar, inside .um-dash
//   .../topic/[topicId]/TopicChrome.tsx:77  inside .um-bar, inside .um-topic
//
// It painted `background: var(--umd-subtle-bg)`. The --umd-* family is declared
// on .um-dash only -- DASH_VARS_CSS, app/components/dashboard-theme.ts:469-476
// -- and NOWHERE on .um-topic. background-color does not inherit, so on every
// curriculum page that var() was invalid at computed-value time and the
// declaration fell to its initial value: transparent. The chip vanished, in
// both themes, on every lesson, practice and quiz page.
//
// Nothing caught it because the dashboard half was always correct, and a
// verifier that only ever read .um-dash reads a perfectly good colour.
//
// WHAT IS ASSERTED, AND WHY EACH HALF IS BINDING
// ----------------------------------------------
// Four claims per theme. Three of them exist because the obvious one --
// "the topic chip is not transparent" -- is too weak on its own to distinguish
// a fix from a differently-wrong fix:
//
//   1. TOPIC IS NOT TRANSPARENT.  The literal defect. Reverting the fallback
//      reddens exactly this.
//   2. TOPIC EQUALS --umt-quiet-box.  Rules out "not transparent, but some
//      other rung". Swapping the fallback to --umt-inset-row -- the rejected
//      alternative, which inverts against its ground in dark -- reddens here
//      and nowhere else.
//   3. TOPIC IS NOT --umd-subtle-bg's VALUE.  Proves the FALLBACK is what
//      painted, not the primary. If --umd-* were ever declared on .um-topic,
//      claims 1 and 2 could both pass in light (the two rungs differ) while
//      the mechanism under test had quietly stopped being the mechanism.
//   4. DASH EQUALS --umd-subtle-bg AND IS NOT --umt-quiet-box.  The
//      no-collateral claim: on .um-dash the primary resolves and the fallback
//      is never reached, so the dashboard chip is what it was. Stated as a
//      pair because equality alone would also be satisfied by a light-only
//      regression, and inequality alone by any wrong-but-different value.
//
// The bar grounds are read alongside the chips, in both scopes. That is what
// makes "the chip is visible" a measurement rather than a hope: a fill equal to
// its own ground is a chip nobody can see, and it would satisfy every equality
// above if the ORACLE were ever edited to match the ground by mistake.
//
// WHY THE LANE AND NOT A REAL TOPIC ROUTE
// ---------------------------------------
// A live /course route needs a real session and real curriculum rows, which
// means prod, and agent-run checks never touch prod. Both halves of this are
// already reachable DB-free with the REAL components: app/um-verify/curriculum
// mounts the real TopicChrome (page.tsx:66) and app/um-verify/shell mounts the
// real StudentShell, so the button measured here is the button that ships.
// Nothing below re-implements it.
//
// THE SELECTOR IS THE COMPONENT'S OWN ACCESSIBILITY MARKER
// --------------------------------------------------------
// button[aria-label="Open navigation"], set at StudentNav.tsx:664. No
// data-probe was added to the component for this run: a test hook would have
// to be kept in step with the thing it labels, and this attribute is already
// load-bearing for screen readers.
//
// THE SHELL READ IS TAKEN AT 720px ON PURPOSE
// -------------------------------------------
// .um-topbar is inline display:none and is flipped to flex only under
// max-width:900px (dashboard-css.ts:68-70), so at the lane's default 1280 the
// shell trigger is in the DOM and never laid out. Colour still resolves there
// -- measured -- but a hidden element is a weak thing to assert about, so the
// context is narrowed and the button is read as it actually renders. The
// curriculum bar has no such gate and is read at the default width.

import { withBrowser, startLane, readComputed, assertTheme, LANE_ROUTES } from './ui-verify-lane.mjs';

const PROVE = process.argv.includes('--prove');

// THE ORACLE, RESTATED RATHER THAN IMPORTED. Same discipline as
// verify_announcements_card.mjs and verify_shell_spacing.mjs: a verifier that
// imports the module under test passes for whatever that module currently
// holds, including a wrong value. These are the approved hexes in Chromium's
// computed serialisation.
//
// LIGHT.subtleBg  #FBFBF9  app/components/dashboard-theme.ts:259
// DARK.subtleBg   #26262B  app/components/dashboard-theme.ts:303
const SUBTLE_BG = { light: 'rgb(251, 251, 249)', dark: 'rgb(38, 38, 43)' };

// LIGHT.quietBox  DASH.trackBg = #F2F1EC  app/components/curriculum-surface.ts:293
// DARK.quietBox   #2B2A25                 app/components/curriculum-surface.ts:504
const QUIET_BOX = { light: 'rgb(242, 241, 236)', dark: 'rgb(43, 42, 37)' };

// The grounds the two bars paint, which is what each chip has to be visible
// against. V.cardBg on .um-topbar (StudentShell.tsx:184) and T.panel on .um-bar
// (TopicChrome.tsx:70). LIGHT.cardBg #FFFFFF / DARK.cardBg #202024;
// LIGHT.panel = DASH.cardBg #FFFFFF / DARK.panel #262521.
const DASH_BAR = { light: 'rgb(255, 255, 255)', dark: 'rgb(32, 32, 36)' };
const TOPIC_BAR = { light: 'rgb(255, 255, 255)', dark: 'rgb(38, 37, 33)' };

// What an unresolvable var() computes to for a non-inherited property. This is
// the defect value, and asserting against it by name is what makes a revert of
// the fallback read as a revert rather than as an unexplained colour.
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

const TRIGGER = 'button[aria-label="Open navigation"]';

// Scoped to each bar so that a future second trigger anywhere on either lane
// route cannot silently become the thing measured.
const DASH_TRIGGER = `.um-topbar ${TRIGGER}`;
const TOPIC_TRIGGER = `.um-bar ${TRIGGER}`;

const dashProbes = {
  chip: { selector: DASH_TRIGGER, prop: 'backgroundColor' },
  bar: { selector: '.um-topbar', prop: 'backgroundColor' },
  // Not under test and not changed by this PR -- StudentNav.tsx:671 is an
  // INHERITED property, so its unresolvable var() falls to the parent's colour
  // rather than to transparent, which is why it worked on .um-topic all along.
  // Read so that "the fix touched the background and nothing else" is measured.
  ink: { selector: DASH_TRIGGER, prop: 'color' },
};

const topicProbes = {
  chip: { selector: TOPIC_TRIGGER, prop: 'backgroundColor' },
  bar: { selector: '.um-bar', prop: 'backgroundColor' },
  ink: { selector: TOPIC_TRIGGER, prop: 'color' },
};

// THE INK ORACLES. StudentNav.tsx:671 is `color: V.heading` and this PR did not
// touch it, so both are here as no-collateral reads rather than as the claim.
//
// They differ between the scopes ON PURPOSE, and the difference IS the reason
// :671 needed no fix. color is an INHERITED property, so on .um-topic its
// unresolvable var() falls to `inherit` -- T.ink, handed down from TopicSurface
// -- rather than to the initial value the way background-color did. Light
// #0E0E11 / dark #F2EDDF, curriculum-surface.ts:296 and :507.
const TOPIC_INK = { light: 'rgb(14, 14, 17)', dark: 'rgb(242, 237, 223)' };

// On .um-dash the same declaration resolves --umd-heading for real.
// LIGHT.heading #0F1E35 / DARK.heading #F2F1EC, dashboard-theme.ts:239 and :295.
const DASH_INK = { light: 'rgb(15, 30, 53)', dark: 'rgb(242, 241, 236)' };

const failures = [];

function check(scope, theme, name, got, want) {
  const ok = got === want;
  if (!ok) failures.push({ scope, theme, name, got, want });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(24)} ${String(got).padEnd(24)} want ${want}`);
}

function checkNot(scope, theme, name, got, forbidden) {
  const ok = got !== forbidden;
  if (!ok) failures.push({ scope, theme, name, got, want: `anything but ${forbidden}` });
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(24)} ${String(got).padEnd(24)} want != ${forbidden}`,
  );
}

async function run() {
  const lane = await startLane({ quiet: false });
  try {
    await withBrowser(async (browser) => {
      for (const theme of ['light', 'dark']) {
        // ── .um-topic: the scope the chip was missing from ──────────────────
        console.log(`\n── curriculum / .um-topic / ${theme} ─────────────────`);
        const topic = await readComputed(browser, lane.origin, {
          route: LANE_ROUTES.curriculum,
          theme,
          probes: topicProbes,
        });
        // NOT SKIPPABLE. A page that failed to hydrate reads light for every
        // value, which is the same colour as a component ignoring the theme.
        assertTheme(theme, topic.resolvedTheme, 'verify_drawer_trigger_chip / curriculum');

        checkNot('topic', theme, 'chipNotTransparent', topic.values.chip, TRANSPARENT);
        check('topic', theme, 'chipIsQuietBox', topic.values.chip, QUIET_BOX[theme]);
        checkNot('topic', theme, 'chipNotSubtleBg', topic.values.chip, SUBTLE_BG[theme]);
        check('topic', theme, 'barGround', topic.values.bar, TOPIC_BAR[theme]);
        checkNot('topic', theme, 'chipNotItsGround', topic.values.chip, topic.values.bar);
        check('topic', theme, 'ink', topic.values.ink, TOPIC_INK[theme]);

        // ── .um-dash: the scope that must not have moved ────────────────────
        console.log(`\n── shell / .um-dash / ${theme} ───────────────────────`);
        const dash = await readComputed(browser, lane.origin, {
          route: LANE_ROUTES.shell,
          theme,
          probes: dashProbes,
          // See the header: the topbar only lays out below 900px.
          viewport: { width: 720, height: 900 },
        });
        assertTheme(theme, dash.resolvedTheme, 'verify_drawer_trigger_chip / shell');

        check('dash', theme, 'chipIsSubtleBg', dash.values.chip, SUBTLE_BG[theme]);
        checkNot('dash', theme, 'chipNotQuietBox', dash.values.chip, QUIET_BOX[theme]);
        checkNot('dash', theme, 'chipNotTransparent', dash.values.chip, TRANSPARENT);
        check('dash', theme, 'barGround', dash.values.bar, DASH_BAR[theme]);
        checkNot('dash', theme, 'chipNotItsGround', dash.values.chip, dash.values.bar);
        check('dash', theme, 'ink', dash.values.ink, DASH_INK[theme]);
      }
    });
  } finally {
    lane.stop();
  }

  console.log('\n─────────────────────────────────────────────────────────');
  if (failures.length === 0) {
    console.log(
      'PASS: the trigger chip resolves --umt-quiet-box on .um-topic and\n' +
        '      --umd-subtle-bg on .um-dash, in both themes, and is distinct\n' +
        '      from its own bar ground in all four cases.',
    );
    if (PROVE) {
      console.error(
        '\nBUT --prove WAS PASSED AND NOTHING FAILED.\n' +
          'That flag means "a fault has been injected; confirm the matching\n' +
          'assertion reddens". A clean run under --prove means the fault did not\n' +
          'reach the page -- a stale build, or the wrong string mutated -- and the\n' +
          'clean run is the thing to distrust, not the fault.',
      );
      process.exit(1);
    }
    return;
  }

  console.log(`FAIL: ${failures.length} assertion(s) did not match:`);
  for (const f of failures) console.log(`  [${f.scope}/${f.theme}] ${f.name}: got ${f.got}, want ${f.want}`);
  if (PROVE) {
    console.log('\n--prove: the reddening above is the expected result of the injected fault.');
    console.log('Confirm the failing names are EXACTLY the ones the fault should reach.');
    return;
  }
  process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
