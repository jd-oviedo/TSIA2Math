// verify_shell_spacing.mjs -- read the student shell's spacing scale and header
// tiers off the committed DB-free lane, in both themes.
//
//   node scripts/verify_shell_spacing.mjs
//   node scripts/verify_shell_spacing.mjs --prove
//
// WHAT THIS COVERS
// ----------------
// The five values in SPACING (app/dashboard/ui.tsx) and the three header tiers,
// as they RENDER -- not as they are declared. Plus the tripwire that this pass
// exists to defend: no panel acquired a fill that is not the theme's own card
// fill, and no group container acquired a background at all.
//
// WHY THE LANE AND NOT A PAGE
// ---------------------------
// /dashboard/* redirects to /login without a session, a session needs Google
// OAuth, and agent-run checks never touch production. app/um-verify/shell is the
// committed route that mounts the real shell, the real stylesheet and the real
// primitives and reaches no database. See its header, and ui-verify-lane.mjs.
//
// WHAT THIS DOES NOT COVER, SAID PLAINLY
// --------------------------------------
// Home, Grades and Announcements are async server components that read Supabase
// and cannot be mounted here. Every primitive and every prop-driven panel they
// are built from IS mounted and measured below, but that the three page bodies
// consume the scale rather than restating a literal is a STATIC fact, proved by
// tests/shell-spacing.test.ts. Neither proof is offered as the other.
//
// GAPS ARE MEASURED ON THE BOX, NOT READ OFF THE DECLARATION, and that is the
// point rather than a detail. The defect this pass fixed was a header that
// declared `margin-bottom: 4px` and rendered 18px below its content, because it
// sat inside a gapped flex column. A verifier that read the declaration would
// have called that correct. See the `gaps` option in ui-verify-lane.mjs.

import { withBrowser, startLane, readComputed, assertTheme, LANE_ROUTES } from './ui-verify-lane.mjs';

const PROVE = process.argv.includes('--prove');

// The approved scale. Restated here as the ORACLE, deliberately: a verifier that
// imported SPACING from the file under test would pass for any value that file
// happened to hold, including a wrong one. These numbers came off the Phase 0
// gate and changing the source without changing them is meant to redden.
const SPACING = {
  STACK: 16,
  GROUP: 28,
  PANEL_PAD: '22px 24px',
  BLOCK: 14,
  HEAD_GAP: 10,
};

// The panel fill, per theme. The NO-NEW-FILL tripwire compares against exactly
// these and nothing else.
const CARD_BG = { light: 'rgb(255, 255, 255)', dark: 'rgb(32, 32, 36)' };

// V.dim, resolved. SectionLabel's default tone.
const DIM = { light: 'rgb(107, 106, 101)', dark: 'rgba(242, 241, 236, 0.52)' };
// V.heading, resolved. CardTitle's ink.
const HEADING = { light: 'rgb(15, 30, 53)', dark: 'rgb(242, 241, 236)' };
// V.noticeWarn, resolved. The overdue bucket's SectionLabel, unchanged by this
// pass and asserted so that "the label tone is a prop" stays a fact.
const WARN = { light: 'rgb(168, 99, 31)', dark: 'rgb(240, 163, 62)' };

const LANE = '[data-probe="spacing-lane"]';
const STACKS = `${LANE} > .um-page-stack`;
const GROUPS = `${STACKS} > .um-section-group`;

const probes = {
  // ── The scale ────────────────────────────────────────────────────────────
  pageStackGap: { selector: STACKS, prop: 'rowGap' },
  sectionGroupGap: { selector: `${GROUPS}:nth-of-type(1)`, prop: 'rowGap' },
  sectionGroupGap2: { selector: `${GROUPS}:nth-of-type(2)`, prop: 'rowGap' },
  cardPadding: { selector: `${GROUPS}:nth-of-type(1) > section:nth-of-type(1)`, prop: 'padding' },
  blockStackGap: { selector: `${LANE} [data-probe="block-stack"]`, prop: 'rowGap' },
  // The real list supplies its own PageStack; its groups must sit at GROUP too.
  listStackGap: { selector: '[data-probe="assignments-lane"] .um-page-stack', prop: 'rowGap' },

  // ── T3, the panel tier ───────────────────────────────────────────────────
  cardTitleWeight: { selector: `${LANE} [data-probe="head-row"] h2`, prop: 'fontWeight' },
  cardTitleSize: { selector: `${LANE} [data-probe="head-row"] h2`, prop: 'fontSize' },
  cardTitleMargin: { selector: `${LANE} [data-probe="head-row"] h2`, prop: 'marginBottom' },
  cardTitleColor: { selector: `${LANE} [data-probe="head-row"] h2`, prop: 'color' },

  // ── T2, the group tier ───────────────────────────────────────────────────
  labelWeight: { selector: '[data-probe="label-lane"] h2', prop: 'fontWeight' },
  labelSize: { selector: '[data-probe="label-lane"] h2', prop: 'fontSize' },
  labelMargin: { selector: '[data-probe="label-lane"] h2', prop: 'marginBottom' },
  labelColor: { selector: '[data-probe="label-lane"] h2', prop: 'color' },
  labelSpacing: { selector: '[data-probe="label-lane"] h2', prop: 'letterSpacing' },
  // The overdue bucket sorts first (BUCKET_ORDER), so this is the warn tone.
  labelWarnColor: { selector: '[data-probe="assignments-lane"] section:nth-of-type(1) h2', prop: 'color' },

  // ── NO-NEW-FILL TRIPWIRE ─────────────────────────────────────────────────
  // Every panel must be EXACTLY the theme's card fill, and every group
  // container must paint nothing. A decorative band, a tinted group, a second
  // surface introduced to make a section "read as distinct" reddens here.
  panelFill1: { selector: `${GROUPS}:nth-of-type(1) > section:nth-of-type(1)`, prop: 'backgroundColor' },
  panelFill2: { selector: `${GROUPS}:nth-of-type(1) > section:nth-of-type(2)`, prop: 'backgroundColor' },
  panelFill3: { selector: `${GROUPS}:nth-of-type(2) > section:nth-of-type(2)`, prop: 'backgroundColor' },
  panelFillEmpty: { selector: `${GROUPS}:nth-of-type(3) > section`, prop: 'backgroundColor' },
  pageStackFill: { selector: STACKS, prop: 'backgroundColor' },
  groupFill1: { selector: `${GROUPS}:nth-of-type(1)`, prop: 'backgroundColor' },
  groupFill2: { selector: `${GROUPS}:nth-of-type(2)`, prop: 'backgroundColor' },
  groupFill3: { selector: `${GROUPS}:nth-of-type(3)`, prop: 'backgroundColor' },
  listSectionFill: { selector: '[data-probe="assignments-lane"] section:nth-of-type(1)', prop: 'backgroundColor' },
};

// The rendered distances. These are what a student actually sees.
const gaps = {
  // Header tier to the content under it. The whole reason this option exists.
  //
  // MEASURED FROM THE h2, NOT FROM THE ROW THAT HOLDS IT, and the difference is
  // the entire subtlety of this claim. CardTitle's margin sits INSIDE the flex
  // row's box -- a flex item's margin is part of the container's content height
  // -- so the row's own bottom edge is already 10px below the heading and the
  // row-to-content distance is 0. The distance a student sees is heading to
  // content, and that is what this measures.
  headToContent: {
    from: `${LANE} [data-probe="head-row"] h2`,
    to: `${LANE} [data-probe="block-stack"]`,
  },
  // Panel to panel INSIDE a group.
  panelToPanel: {
    from: `${GROUPS}:nth-of-type(1) > section:nth-of-type(1)`,
    to: `${GROUPS}:nth-of-type(1) > section:nth-of-type(2)`,
  },
  // Group to group. The one new value, and the only thing carrying the
  // hierarchy -- so if this collapses to STACK the page is flat again.
  groupToGroup: {
    from: `${GROUPS}:nth-of-type(1)`,
    to: `${GROUPS}:nth-of-type(2)`,
  },
  // The same claim on the real grouped list rather than on the primitive.
  listGroupToGroup: {
    from: '[data-probe="assignments-lane"] section:nth-of-type(1)',
    to: '[data-probe="assignments-lane"] section:nth-of-type(2)',
  },
  // T2 to its panel.
  labelToPanel: {
    from: '[data-probe="label-lane"] h2',
    to: '[data-probe="label-lane"] section',
  },
};

function expected(theme) {
  return {
    pageStackGap: `${SPACING.GROUP}px`,
    sectionGroupGap: `${SPACING.STACK}px`,
    sectionGroupGap2: `${SPACING.STACK}px`,
    cardPadding: SPACING.PANEL_PAD,
    blockStackGap: `${SPACING.BLOCK}px`,
    listStackGap: `${SPACING.GROUP}px`,

    cardTitleWeight: '600',
    cardTitleSize: '16px',
    cardTitleMargin: `${SPACING.HEAD_GAP}px`,
    cardTitleColor: HEADING[theme],

    labelWeight: '600',
    labelSize: '13px',
    labelMargin: `${SPACING.HEAD_GAP}px`,
    labelColor: DIM[theme],
    labelSpacing: '0.3px',
    labelWarnColor: WARN[theme],

    panelFill1: CARD_BG[theme],
    panelFill2: CARD_BG[theme],
    panelFill3: CARD_BG[theme],
    panelFillEmpty: CARD_BG[theme],
    pageStackFill: 'rgba(0, 0, 0, 0)',
    groupFill1: 'rgba(0, 0, 0, 0)',
    groupFill2: 'rgba(0, 0, 0, 0)',
    groupFill3: 'rgba(0, 0, 0, 0)',
    listSectionFill: 'rgba(0, 0, 0, 0)',
  };
}

function expectedGaps() {
  return {
    headToContent: `${SPACING.HEAD_GAP}px`,
    panelToPanel: `${SPACING.STACK}px`,
    groupToGroup: `${SPACING.GROUP}px`,
    listGroupToGroup: `${SPACING.GROUP}px`,
    labelToPanel: `${SPACING.HEAD_GAP}px`,
  };
}

const failures = [];

function check(theme, name, got, want) {
  const ok = got === want;
  if (!ok) failures.push({ theme, name, got, want });
  const mark = ok ? 'ok  ' : 'FAIL';
  console.log(`  ${mark} ${name.padEnd(20)} ${String(got).padEnd(24)} want ${want}`);
}

async function run() {
  const lane = await startLane({ quiet: false });
  try {
    await withBrowser(async (browser) => {
      for (const theme of ['light', 'dark']) {
        console.log(`\n── ${theme} ─────────────────────────────────────────────`);
        const { values, gaps: measured, resolvedTheme } = await readComputed(browser, lane.origin, {
          route: LANE_ROUTES.shell,
          theme,
          probes,
          gaps,
        });
        // NOT SKIPPABLE. A page that failed to hydrate reads light for every
        // value, which is indistinguishable from a component ignoring the
        // theme. See ui-verify-lane.mjs.
        assertTheme(theme, resolvedTheme, 'verify_shell_spacing');

        const want = expected(theme);
        const wantGaps = expectedGaps();
        console.log('  -- computed --');
        for (const name of Object.keys(want)) check(theme, name, values[name], want[name]);
        console.log('  -- rendered distance --');
        for (const name of Object.keys(wantGaps)) check(theme, name, measured[name], wantGaps[name]);
      }
    });
  } finally {
    lane.stop();
  }

  console.log('\n─────────────────────────────────────────────────────────');
  if (failures.length === 0) {
    console.log('PASS: every spacing value, header tier and fill matches, in both themes.');
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
