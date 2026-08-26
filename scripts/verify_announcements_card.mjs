// verify_announcements_card.mjs -- read the announcement panel's SHAPE off the
// committed DB-free lane, in both themes.
//
//   node scripts/verify_announcements_card.mjs
//   node scripts/verify_announcements_card.mjs --prove
//
// WHAT THIS COVERS
// ----------------
// The two properties PR B converged, plus the two things that must not have
// moved while they did:
//
//   RADIUS   16 -> 12 -> 0, inherited from Card rather than written here.
//   SHADOW   a hardcoded literal -> V.cardShadow -> none.
//   BORDER   V.cardBorder -> V.panelEdge, the flat panel's hairline.
//   TAG      still <article>, not the <section> Card renders by default.
//   FILL     still exactly the theme's card fill, and nothing else.
//
// UPDATED 2026-08-26 FOR THE FLAT PANEL PASS. The radius and shadow oracles
// below moved because the panel moved: the shell adopted the worksheet
// generator's treatment -- radius 0, one hairline, no shadow. The shape of the
// checks did not change, and neither did what they are for. What this file
// proves is still "the announcement panel takes its shape from Card and from
// nowhere else", which is exactly the claim a flatten could break by leaving
// this one panel behind.
//
// THE SHADOW ASSERTION, AND WHY ITS FORM SURVIVED THE FLATTEN.
// ------------------------------------------------------------
// This file was written around a hazard worth restating: the obvious check --
// "dark has a shadow now" -- COULD NOT FAIL, because the old literal
// '0 1px 3px rgba(14,14,17,.05)' was theme-independent and dark already
// computed a box-shadow, a 5%-alpha near-black on a #202024 panel, present to
// getComputedStyle and invisible to a student. So it asserted a binding pair:
// the computed shadow EQUALS the theme's resolved V.cardShadow, and DIFFERS
// from the old literal.
//
// The oracle is now `none`, and the pair still holds its shape, because `none`
// is not a value anything drifts to by accident:
//
//   1. the computed shadow EQUALS 'none', in both themes, and
//   2. the computed shadow DIFFERS from the old literal AND from the
//      V.cardShadow pair that stood between them.
//
// (2) is what stops a partial revert passing. A change that restored
// V.cardShadow would satisfy no equality in (1), and a change that restored
// only ONE theme's shadow -- the exact shape of the defect this file was built
// for -- reddens in that theme alone rather than hiding behind the other.
//
// WHY THE LANE AND NOT THE PAGE
// -----------------------------
// /dashboard/announcements is an async server component: it calls getProfile()
// and reads Supabase, so it cannot be mounted without a database, and agent-run
// checks never touch prod. AnnouncementCard was split out of that page for
// exactly this reason and IS the component that ships -- app/um-verify/shell
// mounts the real one from real props. Nothing here is a copy of its markup; a
// verifier that restated the thing under test would prove only that the markup
// can be typed twice.
//
// WHAT THIS DOES NOT COVER, SAID PLAINLY
// --------------------------------------
// That the PAGE renders AnnouncementCard rather than going back to its own
// <article> is a static fact about a file this lane cannot mount, and it is not
// proved here. tests/announcements-card.test.ts proves it. Neither proof is
// offered as the other.
//
// Spacing is not re-asserted here at all. PANEL_PAD and BLOCK were converged by
// PR A and are covered by scripts/verify_shell_spacing.mjs; this pass did not
// touch them and this file does not restate them.

import { withBrowser, startLane, readComputed, assertTheme, LANE_ROUTES } from './ui-verify-lane.mjs';

const PROVE = process.argv.includes('--prove');

// THE ORACLE. Restated here rather than imported from dashboard-theme.ts,
// deliberately and for the same reason verify_shell_spacing.mjs restates
// SPACING: a verifier that imports the module under test passes for whatever
// that module currently holds, including a wrong value. These are the approved
// numbers, in Chromium's computed serialisation.
//
// Sources: Card at app/dashboard/ui.tsx, which declares all four of these
// itself and no longer spreads cardStyle().
const CARD_SHADOW = { light: 'none', dark: 'none' };

// The two shadows this panel has carried and must not carry again, in
// Chromium's serialisation. Asserted against in both themes so neither a
// full revert nor a one-theme revert can pass.
//
//   OLD_LITERAL   the hand-rolled light-only value, page.tsx:85 before PR B
//   OLD_TOKEN     V.cardShadow, the rounded panel's shadow, before this pass
const OLD_LITERAL = 'rgba(14, 14, 17, 0.05) 0px 1px 3px 0px';
const OLD_TOKEN = {
  light: 'rgba(15, 30, 53, 0.04) 0px 1px 2px 0px',
  dark: 'rgba(0, 0, 0, 0.34) 0px 1px 2px 0px',
};

// Flat since 2026-08-26. The two radii this panel has held before -- its own
// hand-rolled 16 and cardStyle()'s 12 -- are both asserted against below, for
// the reason the shadow's two predecessors are.
const CARD_RADIUS = '0px';
const OLD_RADII = ['16px', '12px'];

// The panel fill, per theme. NO-NEW-FILL compares against exactly these.
const CARD_BG = { light: 'rgb(255, 255, 255)', dark: 'rgb(32, 32, 36)' };

const LANE = '[data-probe="announcement-lane"]';

// EVERY SELECTOR HERE IS TAG-AGNOSTIC, AND THAT IS A CORRECTION WORTH KEEPING.
// These were first written as `> article:nth-of-type(1)`, which reads naturally
// and is wrong: it makes the SHAPE probes depend on the TAG claim. Reverting
// `as="article"` then turned eight colour and radius probes into "(no such
// element)" alongside the two tag failures -- eighteen reddened assertions for
// a one-word regression, and, worse, "(no such element)" is also what a deleted
// lane mount reads as. Selecting by position instead means a tag regression
// reddens the tag assertions and nothing else, and the shape assertions go on
// measuring the panel that is actually there.
const WITH_CHIP = `${LANE} > .um-section-group > *:nth-child(1)`;
const NO_CHIP = `${LANE} > .um-section-group > *:nth-child(2)`;
// The default Card caller, mounted beside them as the control.
const CONTROL = '[data-probe="announcement-control"] > *';

const probes = {
  // ── RADIUS ───────────────────────────────────────────────────────────────
  radius: { selector: WITH_CHIP, prop: 'borderRadius' },
  radiusNoChip: { selector: NO_CHIP, prop: 'borderRadius' },
  // The control proves 12 is Card's, not something the article re-declared.
  radiusControl: { selector: CONTROL, prop: 'borderRadius' },

  // ── SHADOW ───────────────────────────────────────────────────────────────
  shadow: { selector: WITH_CHIP, prop: 'boxShadow' },
  shadowNoChip: { selector: NO_CHIP, prop: 'boxShadow' },
  shadowControl: { selector: CONTROL, prop: 'boxShadow' },

  // ── NO-NEW-FILL ──────────────────────────────────────────────────────────
  // The swap moved a radius and a shadow. It must not have moved the ground.
  fill: { selector: WITH_CHIP, prop: 'backgroundColor' },
  fillNoChip: { selector: NO_CHIP, prop: 'backgroundColor' },
  fillControl: { selector: CONTROL, prop: 'backgroundColor' },

  // The border is the other property that stayed. Read so that "identical to a
  // plain Card except for the tag" is measured rather than asserted in prose.
  border: { selector: WITH_CHIP, prop: 'borderColor' },
  borderControl: { selector: CONTROL, prop: 'borderColor' },
};

// THE TAG ASSERTION. The `as` prop is the only reason this convergence did not
// cost the page its <article> semantics, and a silent revert of it would leave
// every colour and every distance above still passing. Screen readers navigate
// <article> as a discrete post; a <section> with no accessible name exposes no
// role at all, so this is an accessibility assertion wearing a one-word answer.
const tags = {
  announcementTag: WITH_CHIP,
  announcementTagNoChip: NO_CHIP,
  // Card's default, unchanged. If `as` ever leaks a default of 'article' this
  // reddens and the two above do not.
  controlTag: CONTROL,
};

function expected(theme) {
  return {
    radius: CARD_RADIUS,
    radiusNoChip: CARD_RADIUS,
    radiusControl: CARD_RADIUS,

    shadow: CARD_SHADOW[theme],
    shadowNoChip: CARD_SHADOW[theme],
    shadowControl: CARD_SHADOW[theme],

    fill: CARD_BG[theme],
    fillNoChip: CARD_BG[theme],
    fillControl: CARD_BG[theme],

    border: BORDER[theme],
    borderControl: BORDER[theme],
  };
}

// V.panelEdge resolved -- the flat panel's hairline, and the property that
// took over carrying separation when the shadow went. LIGHT at
// dashboard-theme.ts:278, DARK at :335.
//
// THE OLD PAIR IS ASSERTED AGAINST TOO. A flatten that dropped the radius and
// the shadow but left the border at cardBorder's 0.07 is the most likely
// half-done version of this change, and it is the one that looks finished: the
// panel is square and shadowless and its edge measures 1.15 on white, which is
// a line nobody sees.
const BORDER = {
  light: 'rgba(15, 30, 53, 0.16)',
  dark: 'rgba(255, 255, 255, 0.12)',
};
const OLD_BORDER = {
  light: 'rgba(15, 30, 53, 0.07)',
  dark: 'rgba(255, 255, 255, 0.09)',
};

const expectedTags = {
  announcementTag: 'article',
  announcementTagNoChip: 'article',
  controlTag: 'section',
};

const failures = [];

function check(theme, name, got, want) {
  const ok = got === want;
  if (!ok) failures.push({ theme, name, got, want });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(22)} ${String(got).padEnd(34)} want ${want}`);
}

// The inequality half of the shadow claim. Same reporting shape as check(), so
// a reddening here reads the same as any other.
function checkNot(theme, name, got, forbidden) {
  const ok = got !== forbidden;
  if (!ok) failures.push({ theme, name, got, want: `anything but ${forbidden}` });
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(22)} ${String(got).padEnd(34)} want != ${forbidden}`,
  );
}

async function run() {
  const lane = await startLane({ quiet: false });
  try {
    await withBrowser(async (browser) => {
      for (const theme of ['light', 'dark']) {
        console.log(`\n── ${theme} ─────────────────────────────────────────────`);
        const { values, tags: gotTags, resolvedTheme } = await readComputed(browser, lane.origin, {
          route: LANE_ROUTES.shell,
          theme,
          probes,
          tags,
        });
        // NOT SKIPPABLE. A page that failed to hydrate reads light for every
        // value, which is indistinguishable from a component ignoring the
        // theme. See ui-verify-lane.mjs.
        assertTheme(theme, resolvedTheme, 'verify_announcements_card');

        const want = expected(theme);
        console.log('  -- computed --');
        for (const name of Object.keys(want)) check(theme, name, values[name], want[name]);

        console.log('  -- the shapes this panel must not go back to --');
        checkNot(theme, 'shadowNotOld', values.shadow, OLD_LITERAL);
        checkNot(theme, 'shadowNoChipNotOld', values.shadowNoChip, OLD_LITERAL);
        // The rounded panel's own shadow, per theme. Catches the revert that
        // restores V.cardShadow, which 'none' alone would catch but which the
        // per-theme form also catches when only ONE theme is reverted.
        checkNot(theme, 'shadowNotToken', values.shadow, OLD_TOKEN[theme]);
        checkNot(theme, 'shadowControlNotToken', values.shadowControl, OLD_TOKEN[theme]);
        // Both radii this panel has held. 12 is the one a revert reaches for.
        for (const bad of OLD_RADII) {
          checkNot(theme, `radiusNot${bad}`, values.radius, bad);
          checkNot(theme, `radiusControlNot${bad}`, values.radiusControl, bad);
        }
        // The half-done flatten: square, shadowless, and still wearing the
        // quiet border that only worked when a shadow was doing the separating.
        checkNot(theme, 'borderNotCardBorder', values.border, OLD_BORDER[theme]);
        checkNot(theme, 'borderControlNotCardBorder', values.borderControl, OLD_BORDER[theme]);

        console.log('  -- tag names --');
        for (const name of Object.keys(expectedTags)) {
          check(theme, name, gotTags[name], expectedTags[name]);
        }
      }
    });
  } finally {
    lane.stop();
  }

  console.log('\n─────────────────────────────────────────────────────────');
  if (failures.length === 0) {
    console.log(
      'PASS: radius 0, no shadow, panelEdge hairline per theme, <article> ' +
        'preserved, fill unmoved.',
    );
    if (PROVE) {
      console.error(
        '\nBUT --prove WAS PASSED AND NOTHING FAILED.\n' +
          'That flag means "a fault has been injected; confirm the matching\n' +
          'assertion reddens". A clean run under --prove means the fault did not\n' +
          'reach the page -- a stale build, or the wrong file edited -- and the\n' +
          'clean run is the thing to distrust, not the fault.',
      );
      process.exit(1);
    }
    return;
  }

  console.log(`FAIL: ${failures.length} assertion(s) did not match:`);
  for (const f of failures) console.log(`  [${f.theme}] ${f.name}: got ${f.got}, want ${f.want}`);
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
