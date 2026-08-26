// verify_mu_avatar.mjs -- prove the mascot swap landed, off the committed
// DB-free lane, in both themes.
//
//   node scripts/verify_mu_avatar.mjs
//   node scripts/verify_mu_avatar.mjs --prove
//
// WHAT THIS COVERS
// ----------------
//   SRC     all four configurations resolve to Mu-trimmed-transparent.png,
//           and none of them still names GUMU_headshot_transparent.png.
//   BYTES   the asset actually DECODED, and the bytes are the new art.
//   PLATE   no plate element renders behind the mark, at any of the four.
//   ALT     the default accessible name is "Mu"; the decorative sites are "".
//   GROUND  the four grounds are unmoved, and none of them is the cream plate.
//
// THE SRC STRING IS NOT THE CLAIM, AND ASSERTING IT ALONE WOULD BE A BUG.
// -----------------------------------------------------------------------
// `src` is a string the component wrote, so reading it back proves only that
// the constant says what the diff says it says. A path that 404s -- a file
// committed under a different case, an asset never staged, a typo in the
// extension -- leaves that string perfectly correct and renders nothing.
//
// So the binding assertion is the DECODED ASPECT RATIO. The two assets are
// 641x776 (0.826) and 1080x1080 (1.000), and next/image resizes but does not
// crop, so the ratio survives the optimizer while the pixel dimensions do not.
// A 404 reads 0x0 and reddens; the old asset reads 1.000 and reddens; only the
// new art actually arriving on the page reads 0.826. That is a claim about
// bytes, and it is the one a string comparison cannot make.
//
// THE PLATE ASSERTION IS STRUCTURAL, NOT A COLOUR READ.
// -----------------------------------------------------
// "The cream is gone" as a colour probe is the kind of check that cannot fail:
// the plate div is gone, so any selector aimed at it reads "(no such element)",
// which is also what a deleted lane mount reads as. Instead this asserts what
// GumuAvatar now RETURNS: with the plate it returned a wrapping <div> holding
// C.gumuSurface with the <img> inside; without it the <img> is the root. So
// `[data-probe] > *` resolving to `img` is the plate being gone, and restoring
// the plate branch turns all four into `div`.
//
// The cream is then asserted a second way, as an inequality against every one
// of the four grounds -- so a plate reintroduced as a background on the WRAPPER
// rather than as a new element also reddens.
//
// WHY THE LANE AND NOT THE PAGES
// ------------------------------
// The four real sites are quiz/page.tsx:103, practice/page.tsx:143 and
// GumuChat.tsx:222 and :305. All four are inside async server components or a
// chat client that reads a topic, so none can be mounted without a database,
// and agent-run checks never touch prod. GumuAvatar takes a size and an
// optional title and reads nothing, so app/um-verify/curriculum mounts the REAL
// component at the four real configurations, on the four real grounds. Nothing
// here restates its markup.
//
// WHAT THIS DOES NOT COVER, SAID PLAINLY
// --------------------------------------
// That the four call sites still call GumuAvatar, and still pass the sizes and
// titles they pass, is a static fact about four files this lane cannot mount.
// It is proved by tests/mu-avatar.test.ts, not here. Neither proof is offered
// as the other.
//
// The three visible "GUMU" -> "Mu" prose strings are likewise static facts in
// unmountable files and live in that same test.

import { withBrowser, startLane, readComputed, assertTheme, LANE_ROUTES } from './ui-verify-lane.mjs';

const PROVE = process.argv.includes('--prove');

const NEW_ASSET = 'Mu-trimmed-transparent.png';
const OLD_ASSET = 'GUMU_headshot_transparent.png';

// 641 / 776, the new art's trimmed aspect. The old art was 1080/1080 = 1.000.
const NEW_RATIO = 641 / 776;
// Wide enough to absorb the optimizer's integer rounding at small widths and
// nowhere near wide enough to admit 1.000.
const RATIO_TOLERANCE = 0.01;

// C.gumuSurface, resolved. The plate fill, which must not be behind the mark
// nor painted onto any of its grounds. curriculum-theme.ts:24.
const CREAM_PLATE = 'rgb(247, 241, 228)';

// The four grounds, restated here rather than imported from the module under
// test, for the reason verify_announcements_card.mjs restates its oracle: a
// verifier that imports the value it is checking passes for whatever that value
// currently is, including a wrong one.
//
// tutorSurface #0E0E11 does NOT invert (curriculum-surface.ts:470 and :601) and
// gumuBanner #0F1E35 is hardcoded at GumuChat.tsx:219, so three of the four are
// theme-independent. insetRow is the one that moves: :287 and :502.
const GROUND = {
  quiz: { light: 'rgb(14, 14, 17)', dark: 'rgb(14, 14, 17)' },
  practice: { light: 'rgb(14, 14, 17)', dark: 'rgb(14, 14, 17)' },
  chatIntro: { light: 'rgb(15, 30, 53)', dark: 'rgb(15, 30, 53)' },
  chatHeader: { light: 'rgb(250, 250, 247)', dark: 'rgb(35, 34, 32)' },
};

// The four mounts, by the configuration each real site uses.
const SITES = {
  quiz: { probe: '[data-probe="mu-quiz"]', alt: 'Mu' },
  practice: { probe: '[data-probe="mu-practice"]', alt: '' },
  chatIntro: { probe: '[data-probe="mu-chat-intro"]', alt: '' },
  chatHeader: { probe: '[data-probe="mu-chat-header"]', alt: 'Mu' },
};

// TWO SELECTORS PER SITE, AND THE SPLIT IS THE #214 LESSON APPLIED PROPERLY.
//
// The structural claim -- "the <img> is the root GumuAvatar returns" -- has to
// read the FIRST CHILD, because that is the thing that changes when the plate
// comes back. The image claims -- src, decoded bytes, accessible name -- must
// NOT read the first child, because then reinstating the plate would move them
// onto a <div>, where currentSrc is undefined and naturalWidth is NaN, and a
// one-word regression would redden twelve assertions that are not about it.
//
// So the image is addressed as a DESCENDANT, which finds it at either depth,
// and the root is addressed as a CHILD, which is the only probe that should
// care. Restoring the plate then reddens the four Root and four Fill
// assertions and leaves the other twelve measuring the same image they always
// measured. That is checked, not assumed: run B of the prove-fail pass.
const probes = {};
const tags = {};
const dom = {};
for (const [name, { probe }] of Object.entries(SITES)) {
  const root = `${probe} > *`;
  const img = `${probe} img`;
  tags[`${name}Root`] = root;
  dom[`${name}Src`] = { selector: img, prop: 'currentSrc' };
  dom[`${name}W`] = { selector: img, prop: 'naturalWidth' };
  dom[`${name}H`] = { selector: img, prop: 'naturalHeight' };
  dom[`${name}Alt`] = { selector: img, prop: 'alt' };
  probes[`${name}Ground`] = { selector: probe, prop: 'backgroundColor' };
  // The root's own fill. This is the colour half of the plate claim: a plate
  // reintroduced as a wrapper paints C.gumuSurface here, and one reintroduced
  // as a background on the <img> itself paints it here too, because with no
  // wrapper the <img> IS the root.
  probes[`${name}Fill`] = { selector: root, prop: 'backgroundColor' };
}

const failures = [];

function check(theme, name, got, want) {
  const ok = got === want;
  if (!ok) failures.push({ theme, name, got, want });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(20)} ${String(got).padEnd(30)} want ${want}`);
}

function checkHas(theme, name, got, needle) {
  const ok = String(got).includes(needle);
  if (!ok) failures.push({ theme, name, got, want: `contains ${needle}` });
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(20)} ${String(got).slice(-46).padEnd(46)} want contains ${needle}`,
  );
}

function checkNotHas(theme, name, got, needle) {
  const ok = !String(got).includes(needle);
  if (!ok) failures.push({ theme, name, got, want: `does not contain ${needle}` });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(20)} want NOT contains ${needle}`);
}

function checkNot(theme, name, got, forbidden) {
  const ok = got !== forbidden;
  if (!ok) failures.push({ theme, name, got, want: `anything but ${forbidden}` });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(20)} ${String(got).padEnd(30)} want != ${forbidden}`);
}

function checkRatio(theme, name, w, h) {
  const width = Number(w);
  const height = Number(h);
  const ratio = height > 0 ? width / height : NaN;
  const ok = Number.isFinite(ratio) && Math.abs(ratio - NEW_RATIO) < RATIO_TOLERANCE;
  const shown = Number.isFinite(ratio) ? ratio.toFixed(4) : `${width}x${height} DID NOT DECODE`;
  if (!ok) failures.push({ theme, name, got: shown, want: NEW_RATIO.toFixed(4) });
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(20)} ${`${width}x${height} = ${shown}`.padEnd(30)} want ${NEW_RATIO.toFixed(4)} +/-${RATIO_TOLERANCE}`,
  );
}

async function run() {
  const lane = await startLane({ quiet: false });
  try {
    await withBrowser(async (browser) => {
      for (const theme of ['light', 'dark']) {
        console.log(`\n== ${theme} =============================================`);
        const {
          values,
          tags: gotTags,
          dom: gotDom,
          resolvedTheme,
        } = await readComputed(browser, lane.origin, {
          route: LANE_ROUTES.curriculum,
          theme,
          probes,
          tags,
          dom,
        });
        // NOT SKIPPABLE. A page that failed to hydrate reads light for every
        // value, which is indistinguishable from a component ignoring the
        // theme. See ui-verify-lane.mjs.
        assertTheme(theme, resolvedTheme, 'verify_mu_avatar');

        console.log('  -- src names the new asset, and not the old --');
        for (const name of Object.keys(SITES)) {
          checkHas(theme, `${name}Src`, gotDom[`${name}Src`], NEW_ASSET);
          checkNotHas(theme, `${name}NotOld`, gotDom[`${name}Src`], OLD_ASSET);
        }

        console.log('  -- the bytes decoded, and they are the new art --');
        for (const name of Object.keys(SITES)) {
          checkRatio(theme, `${name}Ratio`, gotDom[`${name}W`], gotDom[`${name}H`]);
        }

        console.log('  -- no plate: the <img> is the root GumuAvatar returns --');
        for (const name of Object.keys(SITES)) {
          check(theme, `${name}Root`, gotTags[`${name}Root`], 'img');
          check(theme, `${name}Fill`, values[`${name}Fill`], 'rgba(0, 0, 0, 0)');
        }

        console.log('  -- grounds unmoved, and none of them is the cream plate --');
        for (const name of Object.keys(SITES)) {
          check(theme, `${name}Ground`, values[`${name}Ground`], GROUND[name][theme]);
          checkNot(theme, `${name}NotCream`, values[`${name}Ground`], CREAM_PLATE);
        }

        console.log('  -- accessible name --');
        for (const [name, { alt }] of Object.entries(SITES)) {
          check(theme, `${name}Alt`, gotDom[`${name}Alt`], alt);
        }
      }
    });
  } finally {
    lane.stop();
  }

  console.log('\n---------------------------------------------------------');
  if (failures.length === 0) {
    console.log('PASS: new asset decoded at all four sites, no plate, alt "Mu"/"", grounds unmoved.');
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
