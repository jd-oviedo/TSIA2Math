// The student rail's brand mark and its Grades glyph, as rendered (PR D2).
//
// WHY THIS IS NOT tests/ ----------------------------------------------------
// Both claims here are about where pixels land, and neither survives being read
// off the source.
//
//   D2b  `margin: '0 auto'` on the expanded wordmark. The declaration is not
//        the claim. It centres only if the wrapper has a width to centre inside
//        and the image is narrower than it -- and the wrapper's padding differs
//        between the collapsed and expanded rails (18px vs 8px each side). A
//        source check would pass on a wrapper that had collapsed to the image's
//        own width, which is exactly the case where the mark does not move.
//
//   D2c  the Grades glyph. A source check can compare two SVG strings, and
//        scripts/verify_mu_name.mjs does. What it cannot say is that both
//        glyphs actually reach the DOM as distinct drawn marks at the size the
//        rail paints them, which is the thing a student's eye is doing.
//
// The rail is mounted at BOTH widths on the shell lane route, which reaches no
// database. See app/um-verify/shell/page.tsx.
//
// THE CREAM IS NOT ASSERTED HERE, and that is a limit worth stating rather than
// papering over. StudentNavPanel returns a fragment and paints no ground of its
// own: RAIL_LIGHT.bg is applied by the shell that mounts it, so a colour read
// off this lane's own wrapper would be a colour this file painted, which proves
// nothing. The token's exact value is pinned in scripts/verify_mu_name.mjs, and
// D2b changes a margin, not a background. Neither check is offered as the
// other, and no cream result is claimed on this run.

import { withBrowser, startLane, readComputed, assertTheme, LANE_ROUTES } from './ui-verify-lane.mjs';

const PROVE = process.argv.includes('--prove');

// Centring tolerance. Not zero: the wordmark is a 2000x485 asset scaled to
// 148px, and a browser is entitled to land its box on a half pixel. One pixel
// is far tighter than the ~50px offset the uncentred rail actually showed.
const TOL = 1;

// The rail is mounted twice on the lane route. The padded box around each mark
// carries no class of its own, so it is addressed by what it contains -- which
// is also the most honest selector available: "the box wrapping the wordmark".
const RAIL_EXPANDED = '[data-probe="rail-expanded"]';
const RAIL_COLLAPSED = '[data-probe="rail-collapsed"]';
const PAD_EXPANDED = `${RAIL_EXPANDED} div:has(> img[src="/unpackmath-wordmark.png"])`;
const PAD_COLLAPSED = `${RAIL_COLLAPSED} div:has(> img[src="/unpackmath-logo.png"])`;
const BADGE_EXPANDED = `${PAD_EXPANDED} + div`;

const failures = [];
const ok = (cond, msg) => { if (!cond) failures.push(msg); };

await withBrowser(async (browser) => {
  const lane = await startLane();
  let got;
  try {
    got = await readComputed(browser, lane.origin, {
      route: LANE_ROUTES.shell,
      theme: 'light',
      probes: {
        // Not a colour claim: it pins the wrapper the centring is measured
        // against, so a run where the padded box vanished reports "(no such
        // element)" instead of a centre that happens to agree.
        expandedPad: { selector: PAD_EXPANDED, prop: 'paddingLeft' },
        collapsedPad: { selector: PAD_COLLAPSED, prop: 'paddingLeft' },
      },
      centres: {
        expanded: { inner: `${PAD_EXPANDED} > img`, outer: PAD_EXPANDED },
        collapsed: { inner: `${PAD_COLLAPSED} > img`, outer: PAD_COLLAPSED },
        // The mark against the role band directly below it: the alignment a
        // reader actually sees is the mark against that centred label, not the
        // mark against its own invisible box.
        expandedVsBadge: { inner: `${PAD_EXPANDED} > img`, outer: BADGE_EXPANDED },
      },
      dom: {
        gradesGlyph: { selector: `${RAIL_EXPANDED} a[href="/dashboard/grades"] svg`, prop: 'innerHTML' },
        practiceGlyph: { selector: `${RAIL_EXPANDED} a[href="/adaptive-test"] svg`, prop: 'innerHTML' },
        gradesGlyphCollapsed: { selector: `${RAIL_COLLAPSED} a[href="/dashboard/grades"] svg`, prop: 'innerHTML' },
        practiceGlyphCollapsed: { selector: `${RAIL_COLLAPSED} a[href="/adaptive-test"] svg`, prop: 'innerHTML' },
        // A src string is correct even when the asset 404s; a decoded width is
        // not. Same reasoning as verify_mu_avatar.mjs.
        expandedMark: { selector: `${PAD_EXPANDED} > img`, prop: 'naturalWidth' },
        collapsedMark: { selector: `${PAD_COLLAPSED} > img`, prop: 'naturalWidth' },
      },
    });
    assertTheme('light', got.resolvedTheme, 'student rail, light');
  } finally {
    lane.stop();
  }

  const { centres, dom, values } = got;

  // ── D2b ───────────────────────────────────────────────────────────────────
  ok(values.expandedPad === '18px', `the expanded rail's padded box is not 18px: ${values.expandedPad}`);
  ok(values.collapsedPad === '8px', `the collapsed rail's padded box is not 8px: ${values.collapsedPad}`);
  const px = (v) => (v.endsWith('px') ? Number(v.slice(0, -2)) : NaN);
  for (const key of ['expanded', 'collapsed', 'expandedVsBadge']) {
    const off = px(centres[key]);
    ok(Number.isFinite(off), `${key}: no measurement (${centres[key]})`);
    ok(Math.abs(off) <= TOL, `${key}: mark sits ${centres[key]} off centre, tolerance ${TOL}px`);
  }
  ok(Number(dom.expandedMark) > 0, 'the expanded wordmark did not decode');
  ok(Number(dom.collapsedMark) > 0, 'the collapsed brand mark did not decode');

  // ── D2c ───────────────────────────────────────────────────────────────────
  ok(dom.gradesGlyph !== '(no such element)', 'no Grades glyph reached the DOM');
  ok(dom.practiceGlyph !== '(no such element)', 'no practice-test glyph reached the DOM');
  ok(dom.gradesGlyph !== dom.practiceGlyph,
    'Grades and Take a Practice Test render the SAME glyph in the expanded rail');
  ok(dom.gradesGlyphCollapsed !== dom.practiceGlyphCollapsed,
    'Grades and Take a Practice Test render the SAME glyph in the collapsed rail');
  ok(/<circle/.test(dom.gradesGlyph), 'the rendered Grades glyph has no circle');
  ok(!/fill="(?!none)/.test(dom.gradesGlyph), 'the rendered Grades glyph is filled, not an outline');

  console.log('\n---------------------------------------------------------');
  console.log('centres:', JSON.stringify(centres));
  if (failures.length === 0) {
    console.log('PASS: brand mark centred at both rail widths and against the role band,');
    console.log('      both assets decoded, Grades is a distinct outline glyph at both widths.');
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
});
