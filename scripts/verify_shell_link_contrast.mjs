// verify_shell_link_contrast.mjs -- the four hardcoded #6E9DC8/#F0A33E values in
// the dashboard shell now move with the theme, and clear WCAG in both.
//
//   node scripts/verify_shell_link_contrast.mjs
//
// WHAT WAS WRONG
// --------------
// dashboard-css.ts painted link text, link hover and the focus ring as three
// fixed hexes, and FlagsPanel.tsx painted a flag's item id as a fourth. None of
// them moved when .um-dash flipped to dark, so each was tuned for one theme and
// wrong in the other. Measured on the grounds they actually render on:
//
//                                     light           dark
//   link on --umd-page-bg        2.63 FAIL       6.24 ok
//   link on --umd-card-bg        2.87 FAIL       5.66 ok
//   link hover #F0A33E           2.10 FAIL       7.74 ok, and orange as TEXT
//   focus ring on the cream rail 2.19 FAIL       5.60 ok
//   flag id on --umd-subtle-bg   2.77 FAIL       5.25 ok
//
// All four are now token pairs on .um-dash, the same mechanism and the same
// values the curriculum tree already uses for the identical defect.
//
// WHY THIS LANE AND NOT A ROUTE
// -----------------------------
// /dashboard redirects to /login without a session and a session needs Google
// OAuth, which cannot be automated, so the only live surface carrying these
// colours is prod -- and agent-run checks never touch prod. app/um-verify/shell
// is the committed DB-free substrate for exactly this: the real DASHBOARD_CSS,
// the real StudentShell, the real Card, the real FlagsPanel, and no database.
//
// NOTHING MEASURED HERE IS WRITTEN BY THIS FILE. The two anchors on the lane
// carry no inline style at all, so their colour can only have come from
// `.um-dash a`. The flag id is read off the real FlagsPanel after the real
// component has fetched, branched and rendered a row. The hexes below are the
// EXPECTED values and every observed value is read back out of getComputedStyle.
//
// THE ONE NETWORK CALL, AND HOW IT IS KEPT OFF THE WIRE
// -----------------------------------------------------
// FlagsPanel reaches its coloured row only through GET /api/flags. That request
// is intercepted at the browser and answered from the fixture below, so it never
// leaves the process.
//
// A catch-all handler then ABORTS every request aimed anywhere but the lane's
// own origin, so "no network" is enforced rather than hoped for. Some are
// expected -- the root layout mounts PostHogProvider and Sentry, both of which
// initialise on every page in this app and immediately try to reach their own
// hosts. Those are aborted like the rest, listed in the output so nothing is
// silent (three hosts, all analytics), and the run
// FAILS outright if any aborted request was aimed at Supabase -- which is the
// one that would mean this check had found its way to prod data.
//
// THE CONTROL. A contrast probe that returns a healthy number no matter which
// element it is handed proves nothing, so every theme also reads the card's
// body copy and requires it to differ from the link beside it. Same shape as
// the control in verify_dashboard_contrast.mjs.

import { startLane, LANE_ROUTES, assertTheme, withBrowser } from './ui-verify-lane.mjs';
import { onTeardown } from './harness-teardown.mjs';

const PORT = 5141;

// The fixture. Two rows so both the open and the resolved branch render; the id
// strings are how the probe addresses the spans, because FlagsPanel carries no
// probe attributes and adding one would mean editing the component under test.
const OPEN_ID = 'QR.1.5-q3';
const RESOLVED_ID = 'QR.2.1-q7';
const FLAGS = {
  flags: [
    {
      id: 'f1',
      created_at: '2026-08-20T10:00:00Z',
      item_id: OPEN_ID,
      user_email: 'student@example.com',
      category: 'other',
      comment: null,
      status: 'open',
    },
    {
      id: 'f2',
      created_at: '2026-08-19T10:00:00Z',
      item_id: RESOLVED_ID,
      user_email: 'student@example.com',
      category: 'answer_seems_incorrect',
      comment: 'The key looks off.',
      status: 'resolved',
    },
  ],
};

// The expected values, per theme. Written as rgb() because that is what
// getComputedStyle returns, so a comparison needs no re-parsing.
const EXPECT = {
  light: {
    link: 'rgb(47, 96, 145)', // #2F6091
    hover: 'rgb(15, 105, 186)', // #0F69BA
    focus: 'rgb(15, 105, 186)', // #0F69BA
  },
  dark: {
    link: 'rgb(110, 157, 200)', // #6E9DC8, unchanged: only light was failing
    hover: 'rgb(90, 170, 238)', // #5AAAEE
    focus: 'rgb(90, 170, 238)', // #5AAAEE
  },
};

const OLD_GEMINI = 'rgb(110, 157, 200)'; // #6E9DC8
const OLD_SUNSET = 'rgb(240, 163, 62)'; // #F0A33E

// ─── The in-page probes ──────────────────────────────────────────────────────
//
// Same compositing maths as verify_dashboard_contrast.mjs and
// verify_modules_states.mjs: the effective background is found by walking up
// past transparent parents and the foreground is composited over whatever it
// lands on, so an alpha ink is never measured as if it were opaque. Kept
// byte-identical in shape to those two so the three files cannot disagree about
// a ratio.
const PROBE_LIB = `
  const parse = (c) => c.match(/[\\d.]+/g).map(Number);
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const groundOf = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c.length < 4 || c[3] > 0) return c.slice(0, 3);
    }
    return [255, 255, 255];
  };
  const ratioOn = (fgStr, bg) => {
    const fg = parse(fgStr);
    const a = fg.length > 3 ? fg[3] : 1;
    const over = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
    const [hi, lo] = [lum(over), lum(bg)].sort((x, y) => y - x);
    return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
  };
  const byText = (sel, text) => {
    const el = [...document.querySelectorAll(sel)].find((n) => n.textContent.trim() === text);
    if (!el) throw new Error('no ' + sel + ' with text ' + JSON.stringify(text));
    return el;
  };
`;

/**
 * Read a snapshot, but only once the page has stopped moving.
 *
 * Lifted from readComputed in ui-verify-lane.mjs rather than imported, because
 * that helper takes a flat selector/property map and these reads need to run
 * arbitrary code (find-by-text, ground walking, ratio maths). The loop is the
 * same, and so are the two constants and the reason for them: every themed
 * surface here paints light for a frame before ThemeProvider's effect lands, so
 * a single sample measures the flash, and a settled-looking light default is
 * also perfectly stable, so stability alone is not enough and there is a floor.
 */
async function settled(page, body) {
  const MINIMUM_FRAMES = 20;
  const CEILING_FRAMES = 600;
  return page.evaluate(
    async ([src, minFrames, maxFrames]) => {
      const read = new Function('return (() => {' + src + '})()');
      const frame = () => new Promise((r) => requestAnimationFrame(r));
      let last = JSON.stringify(read());
      let stable = 0;
      for (let i = 0; i < maxFrames; i++) {
        await frame();
        const now = JSON.stringify(read());
        stable = now === last ? stable + 1 : 0;
        last = now;
        if (i >= minFrames && stable >= 3) break;
      }
      return JSON.parse(last);
    },
    [PROBE_LIB + body, MINIMUM_FRAMES, CEILING_FRAMES],
  );
}

// data-theme travels with EVERY snapshot rather than being read once up front.
// Reading it ahead of the values is a race against ThemeProvider's effect, and
// losing that race looks exactly like the bug under test: a page that never
// hydrated is all-light, which is indistinguishable from a component that
// ignores the theme. assertTheme aborts the whole run in that case.
const WITH_THEME = `
  const theme = document.querySelector('.um-dash')?.getAttribute('data-theme') ?? '(none)';
`;

/**
 * Tab until the focused element matches `predicate`, so the ring is measured
 * under real keyboard focus.
 *
 * page.focus() would not do. :focus-visible is a heuristic and Chromium does
 * not apply it to a programmatically focused link, so a probe built on focus()
 * would read `outline-color` off a rule that never matched and report the
 * initial value as a result.
 */
async function tabTo(page, predicateSrc, limit = 40) {
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press('Tab');
    const hit = await page.evaluate((src) => {
      const el = document.activeElement;
      if (!el) return false;
      return new Function('el', 'return (' + src + ')(el);')(el);
    }, predicateSrc);
    if (hit) return true;
  }
  return false;
}

async function measure(browser, origin, theme) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });

  // The theme is written before the app boots, which is the path a returning
  // student takes: ThemeProvider reads "ec-theme" in an effect on mount.
  await ctx.addInitScript(
    ([key, value]) => {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* private-mode denial; the run fails on data-theme instead */
      }
    },
    ['ec-theme', theme],
  );

  // ONE handler for every request, because Playwright runs the most recently
  // registered matching route first and two overlapping patterns would make the
  // order load-bearing. /api/flags is answered from the fixture; anything aimed
  // off-origin is aborted AND recorded, so nothing reaches the network and the
  // record can be checked for the host that would matter.
  const offOrigin = [];
  await ctx.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) {
      offOrigin.push(url.href);
      return route.abort();
    }
    if (url.pathname === '/api/flags') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(FLAGS),
      });
    }
    return route.continue();
  });

  const page = await ctx.newPage();
  const res = await page.goto(`${origin}${LANE_ROUTES.shell}`, { waitUntil: 'domcontentloaded' });
  if (res && res.status() === 404) {
    await ctx.close();
    throw new Error(
      `${LANE_ROUTES.shell} returned 404 -- the lane flag was not seen by the server.`,
    );
  }
  await page.waitForSelector('.um-dash');

  // ── 1. Resting link colour, on both grounds ───────────────────────────────
  const rest = await settled(
    page,
    WITH_THEME +
      `
      const card = document.querySelector('[data-probe="link-card"]');
      const pageLink = document.querySelector('[data-probe="link-page"]');
      const copy = document.querySelector('[data-probe="card-copy"]');
      if (!card || !pageLink || !copy) throw new Error('lane probes missing');
      const cardCs = getComputedStyle(card).color;
      const pageCs = getComputedStyle(pageLink).color;
      return {
        theme,
        linkCard: cardCs,
        linkPage: pageCs,
        linkCardRatio: ratioOn(cardCs, groundOf(card)),
        linkPageRatio: ratioOn(pageCs, groundOf(pageLink)),
        cardGround: groundOf(card).join(','),
        pageGround: groundOf(pageLink).join(','),
        control: getComputedStyle(copy).color,
      };
    `,
  );
  assertTheme(theme, rest.theme, 'resting link colour');

  // ── 2. Hover, on both grounds ─────────────────────────────────────────────
  await page.hover('[data-probe="link-card"]');
  const hoverCard = await settled(
    page,
    WITH_THEME +
      `
      const el = document.querySelector('[data-probe="link-card"]');
      const c = getComputedStyle(el).color;
      return { theme, color: c, ratio: ratioOn(c, groundOf(el)) };
    `,
  );
  assertTheme(theme, hoverCard.theme, 'hover on the card');

  await page.hover('[data-probe="link-page"]');
  const hoverPage = await settled(
    page,
    WITH_THEME +
      `
      const el = document.querySelector('[data-probe="link-page"]');
      const c = getComputedStyle(el).color;
      return { theme, color: c, ratio: ratioOn(c, groundOf(el)) };
    `,
  );
  assertTheme(theme, hoverPage.theme, 'hover on the page ground');

  // ── 3. The focus ring, on its worst ground and on the page ────────────────
  //
  // The rail is measured first and is the one that binds: #E8E0CF is far darker
  // than the page or a card, and every nav link and the logout button focus
  // there. Tab order reaches the rail before the main column, so the walk finds
  // it on the way to the page link.
  const railFocused = await tabTo(page, `(el) => el.classList.contains('um-nav-item')`);
  if (!railFocused) throw new Error('never tabbed onto a rail nav item');
  const focusRail = await settled(
    page,
    WITH_THEME +
      `
      const el = document.activeElement;
      const o = getComputedStyle(el).outlineColor;
      return {
        theme,
        color: o,
        ratio: ratioOn(o, groundOf(el)),
        ground: groundOf(el).join(','),
        focusVisible: el.matches(':focus-visible'),
      };
    `,
  );
  assertTheme(theme, focusRail.theme, 'focus ring on the rail');

  const pageFocused = await tabTo(page, `(el) => el.dataset && el.dataset.probe === 'link-page'`);
  if (!pageFocused) throw new Error('never tabbed onto the page-ground link');
  const focusPage = await settled(
    page,
    WITH_THEME +
      `
      const el = document.activeElement;
      const o = getComputedStyle(el).outlineColor;
      return { theme, color: o, ratio: ratioOn(o, groundOf(el)), focusVisible: el.matches(':focus-visible') };
    `,
  );
  assertTheme(theme, focusPage.theme, 'focus ring on the page link');

  // ── 4. The flag id, inside the real FlagsPanel ────────────────────────────
  await page.click('details > summary');
  await page.waitForFunction(
    (id) => [...document.querySelectorAll('span')].some((n) => n.textContent.trim() === id),
    OPEN_ID,
    { timeout: 10_000 },
  );
  const flagId = await settled(
    page,
    WITH_THEME +
      `
      const el = byText('span', ${JSON.stringify(OPEN_ID)});
      const c = getComputedStyle(el).color;
      return { theme, color: c, ratio: ratioOn(c, groundOf(el)), ground: groundOf(el).join(',') };
    `,
  );
  assertTheme(theme, flagId.theme, 'flag id inside FlagsPanel');

  await ctx.close();
  return { rest, hoverCard, hoverPage, focusRail, focusPage, flagId, offOrigin };
}

// ─── Run ─────────────────────────────────────────────────────────────────────

let failed = 0;
const check = (label, ok, detail) => {
  console.log(`  ${ok ? 'pass' : 'FAIL'}  ${label}${detail ? `  -- ${detail}` : ''}`);
  if (!ok) failed++;
};

const lane = await startLane({ port: PORT, quiet: false });
onTeardown(() => lane.stop());

try {
  await withBrowser(async (browser) => {
    for (const theme of ['light', 'dark']) {
      const want = EXPECT[theme];
      const m = await measure(browser, lane.origin, theme);

      console.log(`\n${theme.toUpperCase()}`);

      // Everything off-origin was aborted, so nothing reached the network at
      // all. What still has to be checked is what was AIMED at: an attempt on
      // Supabase would mean this lane had found a data path, aborted or not.
      const hosts = [...new Set(m.offOrigin.map((u) => new URL(u).host))];
      check(
        'nothing was aimed at Supabase (and every off-origin request was aborted)',
        !hosts.some((h) => h.includes('supabase')),
        hosts.length ? `aborted: ${hosts.join(', ')}` : 'no off-origin request at all',
      );

      // The control: the probe must be able to tell two elements apart. If body
      // copy and the link beside it read the same colour, every number above is
      // suspect regardless of whether it passed.
      check(
        'control: card body copy differs from the link on the same card',
        m.rest.control !== m.rest.linkCard,
        `copy ${m.rest.control} vs link ${m.rest.linkCard}`,
      );

      check(
        `link on a card is ${want.link}`,
        m.rest.linkCard === want.link,
        `${m.rest.linkCard} on rgb(${m.rest.cardGround})`,
      );
      check(
        `link on the page ground is ${want.link}`,
        m.rest.linkPage === want.link,
        `${m.rest.linkPage} on rgb(${m.rest.pageGround})`,
      );
      check('link on a card clears 4.5:1', m.rest.linkCardRatio >= 4.5, `${m.rest.linkCardRatio}:1`);
      check(
        'link on the page ground clears 4.5:1',
        m.rest.linkPageRatio >= 4.5,
        `${m.rest.linkPageRatio}:1`,
      );

      if (theme === 'light') {
        check(
          'light link is no longer the old #6E9DC8',
          m.rest.linkPage !== OLD_GEMINI,
          m.rest.linkPage,
        );
      } else {
        check(
          'dark link is UNCHANGED at #6E9DC8',
          m.rest.linkPage === OLD_GEMINI && m.rest.linkCard === OLD_GEMINI,
          `${m.rest.linkPage} / ${m.rest.linkCard}`,
        );
      }

      check(`hover on a card is ${want.hover}`, m.hoverCard.color === want.hover, m.hoverCard.color);
      check(
        `hover on the page ground is ${want.hover}`,
        m.hoverPage.color === want.hover,
        m.hoverPage.color,
      );
      check(
        'hover is NOT orange #F0A33E',
        m.hoverCard.color !== OLD_SUNSET && m.hoverPage.color !== OLD_SUNSET,
        `${m.hoverCard.color} / ${m.hoverPage.color}`,
      );
      check('hover clears 4.5:1 on a card', m.hoverCard.ratio >= 4.5, `${m.hoverCard.ratio}:1`);
      check(
        'hover clears 4.5:1 on the page ground',
        m.hoverPage.ratio >= 4.5,
        `${m.hoverPage.ratio}:1`,
      );

      check(
        'the ring was read under real :focus-visible',
        m.focusRail.focusVisible && m.focusPage.focusVisible,
        `rail ${m.focusRail.focusVisible}, page ${m.focusPage.focusVisible}`,
      );
      check(
        `focus ring on the rail is ${want.focus}`,
        m.focusRail.color === want.focus,
        `${m.focusRail.color} on rgb(${m.focusRail.ground})`,
      );
      check(
        `focus ring on the page link is ${want.focus}`,
        m.focusPage.color === want.focus,
        m.focusPage.color,
      );
      check(
        'focus ring is no longer the old #6E9DC8',
        m.focusRail.color !== OLD_GEMINI,
        m.focusRail.color,
      );
      check(
        'focus ring clears 1.4.11 at 3:1 on the rail, its worst ground',
        m.focusRail.ratio >= 3,
        `${m.focusRail.ratio}:1`,
      );
      check(
        'focus ring clears 3:1 on the page ground',
        m.focusPage.ratio >= 3,
        `${m.focusPage.ratio}:1`,
      );

      check(
        `flag id is ${want.link}`,
        m.flagId.color === want.link,
        `${m.flagId.color} on rgb(${m.flagId.ground})`,
      );
      check('flag id clears 4.5:1 on the flag row', m.flagId.ratio >= 4.5, `${m.flagId.ratio}:1`);
      if (theme === 'light') {
        check('light flag id is no longer the old #6E9DC8', m.flagId.color !== OLD_GEMINI, m.flagId.color);
      } else {
        check('dark flag id is UNCHANGED at #6E9DC8', m.flagId.color === OLD_GEMINI, m.flagId.color);
      }
    }
  });
} finally {
  lane.stop();
}

console.log(`\n${failed === 0 ? 'all checks passed' : `${failed} check(s) failed`}`);
process.exit(failed === 0 ? 0 : 1);
