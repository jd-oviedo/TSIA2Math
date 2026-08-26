// verify_home_head_row.mjs -- the 2026-08-26 relocation of "Join a class" into
// the page head, read off the committed DB-free lane at four viewports.
//
//   node scripts/verify_home_head_row.mjs
//   node scripts/verify_home_head_row.mjs --prove
//
// WHAT THIS COVERS
// ----------------
//   ROW      at >=945 the heading and the join panel lay out side by side, the
//            panel's left edge to the RIGHT of the title and its top level with
//            the title's, and the title column keeps its full basis.
//   WRAP     at 901-944 the row wraps of its own accord -- the join panel drops
//            below the title while KEEPING its 320px width, which is the
//            signature that distinguishes flex-wrap from the media query.
//   STACK    at <=900 the media query turns the row into a column and stretches
//            the panel to the full width. Different signature, different
//            mechanism, asserted apart.
//   FLAT     the join panel is a Card and computes like one: radius 0, no
//            shadow, a panelEdge hairline, in both themes.
//   26       the stack below the head sits 26px under the panel in ALL THREE
//            regimes, which is the part that does not fall out of a declaration.
//   INTACT   the panel still renders its code input and its Join button, side
//            by side on one line inside the narrow column.
//
// ─── WHY FOUR VIEWPORTS AND NOT TWO ─────────────────────────────────────────
//
// Because the shell's content width is NOT monotonic in the viewport, and a
// two-reading check keyed to "desktop" and "mobile" would miss the width that
// actually squeezes the title. The rail is 208px wide until it disappears at
// 900, and the shell is border-box (dashboard-css.ts:21, which is scoped to
// .um-dash -- the curriculum route is NOT, and mixing the two up is what put a
// 940 in the first draft of this table). So main's CONTENT width runs:
//
//     border box = min(viewport - 208, 940) above 900, viewport below it
//     content    = border box - 68 above 900, - 32 below it
//
//     1280 -> 872 (capped)   1024 -> 748   950 -> 674   920 -> 644
//      901 -> 625            900 -> 868    720 -> 688
//
// The NARROWEST the column ever gets is 625px at 901 -- one pixel above the
// breakpoint, where a max-width:900 rule does not fire. So the reflow is two
// mechanisms covering two disjoint bands, and this file reads one viewport
// inside each:
//
//     1280  row, roomy            -- the shipping desktop case
//      950  row, tight (674)      -- above the wrap threshold, media query off
//      920  wrapped (644)         -- BELOW the wrap threshold, media query off
//      720  column (688)          -- media query on
//
// 950 AND 920 ARE THE PAIR THAT MATTERS. They differ by 30px of viewport and
// they are on opposite sides of the wrap threshold, so together they pin the
// threshold itself rather than asserting a state that happens to hold. A single
// reading in the band could not tell "wrap is configured" from "this width
// happens to fit".
//
// THE WRAP AND THE MEDIA QUERY ARE TOLD APART BY THE PANEL'S WIDTH, which is
// what makes each independently falsifiable. Wrapped, the aside is alone on the
// second line and keeps its 320px basis because its flex-grow is 0. Stacked by
// the media query, `flex: 0 0 auto` drops the basis and `align-items: stretch`
// widens it to the whole column. Same "below the title" relationship, two
// different widths, so reverting one rule cannot be covered for by the other.
//
// ─── WHAT THIS MEASURES, AND WHY IT CAN ─────────────────────────────────────
//
// app/dashboard/page.tsx is an async server component that calls getProfile()
// and reads Supabase; it cannot be mounted here and is not mounted here. That
// is precisely why PageHeadRow is an exported primitive rather than a div in
// that file. The lane mounts the REAL PageHeadRow holding the REAL PageHeading
// and the REAL JoinClassPanel in the REAL Card -- the same four components Home
// composes -- so the geometry read below is the geometry that ships. A lane
// that hand-wrote the row's flex declarations would have measured a replica.
//
// THE 26 IS THE READING THAT MOST NEEDS TO BE A MEASUREMENT. Nobody declares a
// margin on the row. The distance falls out of a flex line's cross size being
// the largest of its items' MARGIN boxes: the heading column is its own BFC so
// PageHeading's marginBottom:26 stays inside it, and the aside column is given
// the same 26 explicitly, so the line ends 26px below whichever column is
// taller. There is no property anywhere that says "26" about the row, and
// reading a declaration back would prove nothing.

import { withBrowser, startLane, readComputed, assertTheme, LANE_ROUTES } from './ui-verify-lane.mjs';

const PROVE = process.argv.includes('--prove');

// ─── THE ORACLE ─────────────────────────────────────────────────────────────
//
// Restated rather than imported from dashboard-theme.ts and ui.tsx, on this
// lane's standing principle: a check that imports the module under test passes
// for whatever that module currently holds, including a wrong value.

// V.panelEdge, Chromium's serialisation. dashboard-theme.ts:278 / :335.
const PANEL_EDGE = {
  light: 'rgba(15, 30, 53, 0.16)',
  dark: 'rgba(255, 255, 255, 0.12)',
};

// V.cardBorder -- the quieter line the flat pass stepped away from. Asserted
// against so "square and shadowless but still wearing the old border" reddens.
const OLD_EDGE = {
  light: 'rgba(15, 30, 53, 0.07)',
  dark: 'rgba(255, 255, 255, 0.09)',
};

/** PageHeading's own marginBottom, moved onto both columns. Not a new value. */
const HEAD_GAP = 26;

/** SPACING.GROUP, the horizontal seam between the two columns. */
const COL_GAP = 28;

/** The aside column's flex-basis, and its width in every state but stretched. */
const ASIDE_BASIS = 320;

/** Sub-pixel tolerance. Layout noise is not a layout result. */
const EPS = 1.5;

// ─── SELECTORS ──────────────────────────────────────────────────────────────
//
// BY POSITION, not by tag, for the reason verify_flat_panels.mjs:130-135
// records: a shape probe that selects on `section` fails on a semantic
// regression and buries the real result.
const LANE = '[data-probe="page-head-lane"]';
const ROW = `${LANE} > .um-head-row`;
const HEAD_COL = `${ROW} > *:nth-child(1)`;
const HEADER = `${HEAD_COL} > header`;
const ASIDE_COL = `${ROW} > *:nth-child(2)`;
const ASIDE = `${ASIDE_COL} > *`;
const STACK_FIRST = `${LANE} > .um-page-stack > .um-section-group > *:nth-child(1)`;
const INPUT = `${ASIDE_COL} input`;
const BUTTON = `${ASIDE_COL} button`;

const probes = {
  asideRadius: { selector: ASIDE, prop: 'borderRadius' },
  asideShadow: { selector: ASIDE, prop: 'boxShadow' },
  asideEdge: { selector: ASIDE, prop: 'borderColor' },
  rowDirection: { selector: ROW, prop: 'flexDirection' },
};

const gaps = {
  // The aside's bottom border to the top of the first panel under the head.
  asideToStack: { from: ASIDE, to: STACK_FIRST },
};

const rects = {
  row: ROW,
  headCol: HEAD_COL,
  header: HEADER,
  asideCol: ASIDE_COL,
  aside: ASIDE,
  input: INPUT,
  button: BUTTON,
};

const dom = {
  inputPlaceholder: { selector: INPUT, prop: 'placeholder' },
  buttonText: { selector: BUTTON, prop: 'textContent' },
};

// ─── THE PREDICTED STATE AT EACH WIDTH ──────────────────────────────────────
//
// Derived from the width curve in the header, written down BEFORE the run so
// the reading is checked against a prediction rather than described after the
// fact. `content` is main's content box; `mechanism` names which of the two
// reflow rules is doing the work.
const CASES = [
  { width: 1280, content: 872, state: 'row', mechanism: 'none (roomy, 940 cap binding)' },
  { width: 950, content: 674, state: 'row', mechanism: 'none (above the 668 wrap threshold)' },
  { width: 920, content: 644, state: 'wrapped', mechanism: 'flex-wrap' },
  { width: 720, content: 688, state: 'stacked', mechanism: 'the max-width:900 media query' },
];

const failures = [];

function check(scope, name, got, want) {
  const ok = got === want;
  if (!ok) failures.push({ scope, name, got, want });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(22)} ${String(got).padEnd(30)} want ${want}`);
}

function checkNot(scope, name, got, forbidden) {
  const ok = got !== forbidden;
  if (!ok) failures.push({ scope, name, got, want: `anything but ${forbidden}` });
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(22)} ${String(got).padEnd(30)} want != ${forbidden}`,
  );
}

function record(scope, name, ok, detail) {
  if (!ok) failures.push({ scope, name, got: detail, want: 'true' });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(22)} ${detail}`);
}

async function run() {
  const lane = await startLane({ quiet: false });
  const measured = {};
  try {
    await withBrowser(async (browser) => {
      for (const theme of ['light', 'dark']) {
        for (const { width, content, state, mechanism } of CASES) {
          const scope = `${theme}/${width}`;
          console.log(`\n── ${scope} · expect ${state} · ${mechanism} ─────────`);

          const read = await readComputed(browser, lane.origin, {
            route: LANE_ROUTES.shell,
            theme,
            probes,
            gaps,
            rects,
            dom,
            viewport: { width, height: 1000 },
          });
          assertTheme(theme, read.resolvedTheme, `verify_home_head_row ${scope}`);

          const r = read.rects;
          const missing = Object.entries(r).filter(([, v]) => v === null).map(([k]) => k);
          if (missing.length) {
            record(scope, 'rectsPresent', false, `no such element: ${missing.join(', ')}`);
            continue;
          }

          // ── THE ROW'S OWN GROUND. The content width the prediction was
          //    derived from -- if this is wrong every geometry claim below is
          //    being made about a different page than the one predicted.
          record(
            scope,
            'contentWidth',
            Math.abs(r.row.width - content) <= EPS,
            `row spans ${r.row.width}px (predicted ${content}px from the curve)`,
          );

          if (state === 'row') {
            // ── BESIDE. The relationship the whole chunk exists to produce.
            record(
              scope,
              'asideRightOfTitle',
              r.aside.left > r.header.right,
              `aside.left ${r.aside.left} > header.right ${r.header.right} ` +
                `(seam ${Math.round((r.aside.left - r.header.right) * 100) / 100}px, want ${COL_GAP})`,
            );
            record(
              scope,
              'seamIsGroup',
              Math.abs(r.asideCol.left - r.headCol.right - COL_GAP) <= EPS,
              `column seam ${Math.round((r.asideCol.left - r.headCol.right) * 100) / 100}px`,
            );
            // ── LEVEL WITH THE TITLE. alignItems:flex-start, measured.
            record(
              scope,
              'asideTopAligned',
              Math.abs(r.aside.top - r.header.top) <= EPS,
              `aside.top ${r.aside.top} vs header.top ${r.header.top}`,
            );
            // ── THE TITLE IS NOT SQUEEZED. Its column never drops below the
            //    basis it was given; at 950 that is the binding reading.
            record(
              scope,
              'titleNotSqueezed',
              r.headCol.width >= ASIDE_BASIS - EPS,
              `heading column ${r.headCol.width}px (want >= ${ASIDE_BASIS})`,
            );
            check(scope, 'rowDirection', read.values.rowDirection, 'row');
          } else {
            // ── BELOW. Both non-row states share this, and only this.
            record(
              scope,
              'asideBelowTitle',
              r.aside.top > r.header.bottom,
              `aside.top ${r.aside.top} > header.bottom ${r.header.bottom} ` +
                `(${Math.round((r.aside.top - r.header.bottom) * 100) / 100}px below)`,
            );
            record(
              scope,
              'asideNotBeside',
              Math.abs(r.aside.left - r.headCol.left) <= EPS,
              `aside.left ${r.aside.left} vs heading column left ${r.headCol.left}`,
            );
            // ── PageHeading's own 26 is what separates them once stacked.
            record(
              scope,
              'titleToAside',
              Math.abs(r.aside.top - r.header.bottom - HEAD_GAP) <= EPS,
              `${Math.round((r.aside.top - r.header.bottom) * 100) / 100}px (want ${HEAD_GAP})`,
            );
          }

          // ── WHICH MECHANISM. The two below-the-title states are told apart
          //    by the aside's width, and this is the assertion that keeps them
          //    apart: wrapped it keeps its 320 basis, stacked it stretches.
          if (state === 'wrapped') {
            check(scope, 'rowDirection', read.values.rowDirection, 'row');
            record(
              scope,
              'wrapKeptBasis',
              Math.abs(r.aside.width - ASIDE_BASIS) <= EPS,
              `aside ${r.aside.width}px wide -- the 320 basis, so this is flex-wrap ` +
                `and not the media query`,
            );
          }
          if (state === 'stacked') {
            check(scope, 'rowDirection', read.values.rowDirection, 'column');
            record(
              scope,
              'stretchedFullWidth',
              Math.abs(r.aside.width - r.row.width) <= EPS,
              `aside ${r.aside.width}px vs row ${r.row.width}px -- stretched, so this ` +
                `is the media query and not flex-wrap`,
            );
            record(
              scope,
              'stackedNotBasis',
              Math.abs(r.aside.width - ASIDE_BASIS) > EPS,
              `aside is ${r.aside.width}px, not the ${ASIDE_BASIS}px basis`,
            );
          }

          // ── THE 26, IN EVERY REGIME. Not a declaration anywhere.
          check(scope, 'asideToStack', read.gaps.asideToStack, `${HEAD_GAP}px`);

          // ── FLAT. The aside is a Card and computes like one.
          check(scope, 'asideRadius', read.values.asideRadius, '0px');
          check(scope, 'asideShadow', read.values.asideShadow, 'none');
          check(scope, 'asideEdge', read.values.asideEdge, PANEL_EDGE[theme]);
          checkNot(scope, 'asideEdgeNotOld', read.values.asideEdge, OLD_EDGE[theme]);

          // ── THE PANEL SURVIVED THE MOVE. A relocation that quietly drops a
          //    control is the failure every geometry assertion above would pass
          //    through, because an empty box lays out perfectly well.
          check(scope, 'inputPlaceholder', read.dom.inputPlaceholder, 'e.g. XK7R2P');
          check(scope, 'buttonText', read.dom.buttonText, 'Join');
          record(
            scope,
            'controlsOneLine',
            r.button.left > r.input.right && r.button.top < r.input.bottom,
            `input ${r.input.width}px + button ${r.button.width}px side by side in a ` +
              `${r.aside.width}px panel`,
          );

          measured[scope] = { button: r.button.width, input: r.input.width, aside: r.aside.width };
        }
      }
    });
  } finally {
    lane.stop();
  }

  // ── THE BUTTON WIDTH, REPORTED RATHER THAN ESTIMATED ─────────────────────
  // The narrow column was sized against an estimate of this. Printing the
  // measurement is how that estimate stops being one.
  console.log('\n── measured control widths ───────────────────────────────');
  for (const [scope, m] of Object.entries(measured)) {
    console.log(`  ${scope.padEnd(12)} input ${m.input}px + button ${m.button}px in a ${m.aside}px panel`);
  }

  console.log('\n─────────────────────────────────────────────────────────');
  if (failures.length === 0) {
    console.log(
      'PASS: the head is a row at 1280 and 950, wraps of its own accord at 920,\n' +
        'stacks full-width under the media query at 720, sits 26px above the\n' +
        'stack in all three regimes, and the panel is flat in both themes.',
    );
    if (PROVE) {
      console.error(
        '\nBUT --prove WAS PASSED AND NOTHING FAILED.\n' +
          'That flag means "a fault has been injected; confirm the matching\n' +
          'assertion reddens". A clean run under --prove means the fault did not\n' +
          'land, so the check has proved nothing. Treating it as a failure.',
      );
      process.exit(1);
    }
    return;
  }

  console.log(`FAIL: ${failures.length} assertion(s) reddened.\n`);
  for (const f of failures) {
    console.log(`  [${f.scope}] ${f.name}: got ${f.got}, want ${f.want}`);
  }
  if (PROVE) {
    console.log('\n--prove: the injected fault reddened the expected assertion(s).');
    return;
  }
  process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
