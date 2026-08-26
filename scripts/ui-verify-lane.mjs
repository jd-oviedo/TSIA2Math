// The importable half of the UI verification lane.
//
// WHAT THIS LANE IS FOR. Reading computed styles off the real theming chrome
// with no database. There is no local or branch Supabase in this repo --
// .env.local points at the live project and nothing listens on 54321 -- and
// agent-run checks never touch prod, so any UI verifier that needs a live topic
// route has nowhere to run. Everything left to verify on the student surfaces
// (page ground, panel fill, drawer fill, card width, section rule) is computed
// style and needs no data, so the lane mounts the real wrappers and the real
// token stylesheets at app/um-verify/* and fetches nothing.
//
// DB-FREE: no DB reads or writes, and no real network call. One read-only auth
// check still runs via existing middleware; it reads and writes nothing. The
// single exception is spelled out at app/um-verify/shell/page.tsx: the real
// FlagsPanel is mounted there and fetches /api/flags when expanded, which only
// a verifier that has already intercepted that route at the browser ever does.
//
// UI VERIFIERS MUST USE THIS LANE RATHER THAN A LIVE TOPIC ROUTE. If a check
// needs real lesson-section data, that is a different, also-DB-free lane: the
// loadTopicFixture path in scripts/verify_lesson_dark.mjs, kept separate on
// purpose.
//
// ─── TWO STANDING RULES, BOTH LEARNED THE HARD WAY IN #208 ───────────────────
//
// 1. ASSERT ONLY WHAT THE INJECTED CSS SUPPORTS. A value written inline as a
//    resolved hex (the drawer's background, from RAIL_LIGHT.bg) measures
//    correctly with no stylesheet present. A value that resolves through var()
//    (.um-topic's ground, a card's fill) computes to transparent unless the
//    token stylesheet is on the page. Both lane routes inject the real
//    stylesheet so both kinds are assertable, but a probe that skips it can
//    return a confident, meaningless number.
//
// 2. ALWAYS READ data-theme. ThemeProvider resolves the stored preference in an
//    effect, so a route that fails to hydrate silently stays on the light
//    default -- and "the page never hydrated" is the same colour as "the
//    component ignores the theme". In #208 that cost two full runs, because the
//    failure looked exactly like the bug under test. assertTheme below is
//    therefore NOT a check that a caller can invert or skip: it aborts the run.

import { chromium } from 'playwright';
import { spawn } from 'child_process';

const LANE_ENV = 'UM_VERIFY_LANE';

/** The lane's two routes. Paths, not full URLs; startLane returns the origin. */
export const LANE_ROUTES = {
  shell: '/um-verify/shell',
  curriculum: '/um-verify/curriculum',
};

/**
 * Build and start the app with the lane switched on, then hand back the origin
 * and a teardown.
 *
 * Runs `next build && next start`, not `next dev`: dev collapses under
 * Playwright load here and surfaces as false 404s. Same reason the lane guard
 * keys on VERCEL_ENV rather than NODE_ENV -- see app/um-verify/guard.ts.
 *
 * The flag is passed to BOTH the build and the server. The routes are
 * force-dynamic so the server read is the one that decides, but the build
 * inherits it too so that a future change to that decision does not silently
 * produce a lane that 404s.
 */
export async function startLane({ port = 5139, quiet = true } = {}) {
  const env = { ...process.env, [LANE_ENV]: '1' };

  if (!quiet) console.log('building with the verification lane...');
  await new Promise((resolve, reject) => {
    let out = '';
    const build = spawn('npx', ['next', 'build'], { env });
    build.stdout.on('data', (d) => (out += d));
    build.stderr.on('data', (d) => (out += d));
    build.on('exit', (code) => {
      if (code === 0) return resolve();
      console.error(out.split('\n').slice(-40).join('\n'));
      reject(new Error('lane build failed'));
    });
  });

  const server = spawn('npx', ['next', 'start', '-p', String(port)], {
    env,
    stdio: 'ignore',
    detached: true,
  });

  const origin = `http://localhost:${port}`;
  await waitForServer(origin);

  return {
    origin,
    stop() {
      try {
        process.kill(-server.pid);
      } catch {
        /* already gone */
      }
    },
  };
}

// Poll the lane rather than sleeping a fixed interval: a fixed wait is either
// slower than it needs to be or occasionally too short, and a too-short one
// fails as a connection error that reads like a broken route.
async function waitForServer(origin, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${origin}${LANE_ROUTES.shell}`);
      if (res.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`lane server did not answer on ${origin} within ${timeoutMs}ms`);
}

/**
 * Open one lane route in one theme and read computed styles off it.
 *
 * The theme is written to localStorage BEFORE the app boots, which is the same
 * path a returning student takes: ThemeProvider reads the "ec-theme" key in an
 * effect on mount.
 *
 * Values are polled until they hold steady across three consecutive animation
 * frames rather than sampled once. Every themed surface in this app paints
 * light for a frame before the effect lands, so a single read measures the
 * flash rather than the page.
 *
 * `probes` is a map of name -> { selector, prop }. `prop` is any computed style
 * property; width is available as 'width' and resolves to the used pixel value.
 */
export async function readComputed(browser, origin, { route, theme, probes }) {
  const ctx = await browser.newContext();
  await ctx.addInitScript(
    ([key, value]) => {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* private-mode denial; the run will fail on data-theme instead */
      }
    },
    ['ec-theme', theme],
  );

  const page = await ctx.newPage();
  const res = await page.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded' });
  if (res && res.status() === 404) {
    await ctx.close();
    throw new Error(
      `${route} returned 404. The lane flag was not seen by the server; ` +
        `startLane sets ${LANE_ENV} and app/um-verify/guard.ts reads it.`,
    );
  }

  // The wrapper is whichever of the two the route mounts.
  const wrapperSel = route === LANE_ROUTES.shell ? '.um-dash' : '.um-topic';
  await page.waitForSelector(wrapperSel);

  // data-theme IS POLLED WITH THE VALUES, NOT READ AHEAD OF THEM, AND THAT IS
  // NOT A TIDY-UP. Reading it straight after waitForSelector is a race against
  // the effect in ThemeProvider that resolves the stored preference, and the
  // race is winnable: the shell route won it every time and the curriculum
  // route -- same code, but an 11KB stylesheet to parse first -- lost it every
  // time, so the guard reported "did not hydrate" on a page that had hydrated
  // perfectly well a few frames later. One snapshot, one stability loop.
  //
  // MINIMUM_FRAMES exists for the same reason. Stability alone is not enough:
  // the pre-effect page is also perfectly stable, and three frames of it is
  // about 50ms, which is well inside the window this race was being lost in.
  // The floor means a settled-looking light default is never accepted before
  // the effect has had a chance to run at all.
  const MINIMUM_FRAMES = 20;
  const CEILING_FRAMES = 600;

  const snapshot = await page.evaluate(
    async ([entries, sel, minFrames, maxFrames]) => {
      const frame = () => new Promise((r) => requestAnimationFrame(r));
      const readAll = () => ({
        theme: document.querySelector(sel)?.getAttribute('data-theme') ?? '(none)',
        values: Object.fromEntries(
          entries.map(([name, { selector, prop }]) => {
            const el = document.querySelector(selector);
            return [name, el ? getComputedStyle(el)[prop] : '(no such element)'];
          }),
        ),
      });

      let last = JSON.stringify(readAll());
      let stable = 0;
      for (let i = 0; i < maxFrames; i++) {
        await frame();
        const now = JSON.stringify(readAll());
        stable = now === last ? stable + 1 : 0;
        last = now;
        if (i >= minFrames && stable >= 3) break;
      }
      return JSON.parse(last);
    },
    [Object.entries(probes), wrapperSel, MINIMUM_FRAMES, CEILING_FRAMES],
  );

  await ctx.close();
  return { values: snapshot.values, resolvedTheme: snapshot.theme };
}

/**
 * THE HYDRATION GUARD. Aborts the run when the theme that resolved is not the
 * theme that was asked for.
 *
 * This is deliberately a throw and not a check, and it is deliberately not
 * invertible by a --prove flag. "The probe did not hydrate" is not a result
 * about the component under test: every colour on the page is then the light
 * default, which is indistinguishable from a component that ignores the theme.
 * A run in that state has measured nothing and must not be allowed to report a
 * pass, a fail, or a successful reddening.
 *
 * scripts/verify_ui_lane.mjs proves this fires, by forcing the wrapper to the
 * wrong theme and confirming the whole run aborts.
 */
export function assertTheme(requested, resolved, context = '') {
  if (resolved !== requested) {
    throw new Error(
      `HYDRATION GUARD: asked for theme "${requested}" but .um-dash/.um-topic ` +
        `resolved "${resolved}"${context ? ` (${context})` : ''}.\n` +
        'The page did not hydrate, so every value read from it is the light ' +
        'default and nothing on this run measures the component under test. ' +
        'Aborting rather than reporting a colour result.',
    );
  }
}

/** Convenience: launch, run `fn` with a browser, always close it. */
export async function withBrowser(fn) {
  const browser = await chromium.launch();
  try {
    return await fn(browser);
  } finally {
    await browser.close();
  }
}
