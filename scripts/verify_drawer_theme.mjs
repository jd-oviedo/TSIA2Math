// The curriculum nav drawer follows the student's theme.
//
// WHAT THIS PROVES. On a curriculum surface, the slide-over drawer paints
// RAIL_DARK in dark mode and RAIL_LIGHT in light mode. It was hard-pinned to
// light by a `mode="light"` prop on TopicChrome, so a student with dark mode on
// got a cream #E8E0CF panel over a #17171A page -- a 13.62:1 slab of light.
//
// WHY A PROBE ROUTE AND NOT A REAL /course URL. A live topic page needs a real
// Supabase session and real curriculum rows, and the only Supabase configured in
// this repo is the LIVE project (see curriculum-verification-walk.md:4-5). There
// is no local stack and no branch project. The drawer background is chrome: it
// depends on the theme and the rail palette and on nothing the database returns,
// so a probe rendering the REAL StudentNavDrawer inside the REAL TopicSurface
// measures exactly the same thing with no database at all. Same technique as
// scripts/verify_curriculum_dark.mjs: written before the run, deleted after,
// never committed.
//
// WHAT IS MEASURED. Not the constants. getComputedStyle on the rendered
// aside.um-nav-drawer, after the theme has actually resolved. ThemeProvider
// reads localStorage in an effect, so every themed surface in this app paints
// light for one frame before settling; the read below polls until the value
// stops changing rather than sampling a frame.
//
// THE CONTROL. A second probe route carries the exact prop this change removed,
// `mode="light"`, and is measured in the same run. The fix is only real if the
// faulted twin FAILS in dark and PASSES in light: a check that reddens on both
// is reading something other than the pin, and a check that reddens on neither
// is not reading the drawer.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { spawn } from 'child_process';

const PROBE_DIR = 'app/um-probe-drawer';
const PORT = 5137;
const BASE = `http://localhost:${PORT}`;

// The two rail grounds, from app/components/dashboard-theme.ts:304 and :324.
// Restated here rather than imported, so that a future edit to the palette has
// to disagree with a second copy before it can ship a silent repaint.
const RAIL_LIGHT_BG = 'rgb(232, 224, 207)'; // #E8E0CF
const RAIL_DARK_BG = 'rgb(35, 33, 29)'; //     #23211D

// The probe renders the two things this check is about: the real .um-topic
// wrapper, which is what carries data-theme, and the real drawer, open, inside
// it. `mode` is the ONLY difference between the two routes.
//
// WHAT THIS PROBE DOES NOT DO: inject TOPIC_PAGE_CSS, so --umt-* is undefined
// here and the .um-topic wrapper's own ground does not paint. That is a
// deliberate limit, not an oversight. Two attempts to inject it -- from inside
// this client component, and from a server page wrapping a client half --
// both left the route un-hydrated: data-theme stayed "light" in both themes and
// every cell measured cream. The drawer's background is written inline from
// R.bg as a RESOLVED hex, never as a var(), so it measures correctly with no
// token stylesheet present, and the drawer is the whole subject of this check.
// The page ground is therefore not measured and not reported; the data-theme
// readout below is the diagnostic that matters, because a probe that fails to
// hydrate and a drawer that ignores the theme are the same colour.
const probe = (faulted) => `'use client';

import TopicSurface from '../../components/TopicSurface';
import { StudentNavDrawer } from '../../components/StudentNav';

export default function DrawerProbe() {
  return (
    <TopicSurface fontFamily="system-ui, sans-serif">
      <StudentNavDrawer
        open
        name="Probe Student"
        role="student"
        onClose={() => {}}${faulted ? "\n        mode=\"light\"" : ''}
      />
    </TopicSurface>
  );
}
`;

// The fixed route sits one level deeper than the faulted one so both share a
// single probe directory and are removed by one rmSync.
const ROUTES = {
  fixed: `${BASE}/um-probe-drawer/fixed`,
  faulted: `${BASE}/um-probe-drawer/faulted`,
};

let server = null;
const cleanup = () => {
  try {
    rmSync(PROBE_DIR, { recursive: true, force: true });
  } catch {}
  try {
    if (server) process.kill(-server.pid);
  } catch {}
};
process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(1);
});

mkdirSync(`${PROBE_DIR}/fixed`, { recursive: true });
mkdirSync(`${PROBE_DIR}/faulted`, { recursive: true });
writeFileSync(`${PROBE_DIR}/fixed/page.jsx`, probe(false));
writeFileSync(`${PROBE_DIR}/faulted/page.jsx`, probe(true));

console.log('building with the probe routes...');
await new Promise((res, rej) => {
  let out = '';
  const b = spawn('npx', ['next', 'build']);
  b.stdout.on('data', (d) => (out += d));
  b.stderr.on('data', (d) => (out += d));
  b.on('exit', (c) => {
    if (c === 0) return res();
    console.error(out.split('\n').slice(-40).join('\n'));
    rej(new Error('build failed'));
  });
});

server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  stdio: 'ignore',
  detached: true,
});
await new Promise((r) => setTimeout(r, 6000));

const browser = await chromium.launch();

// Set the stored preference BEFORE the app boots, then load. ThemeProvider reads
// it in an effect on mount, so this is the same path a returning student takes.
// The value is then polled rather than sampled: the first paint is light in
// every theme, and reading one frame would measure the flash instead of the
// page.
async function drawerBg(url, theme) {
  const ctx = await browser.newContext();
  await ctx.addInitScript(
    ([t]) => {
      try {
        localStorage.setItem('ec-theme', t);
      } catch {}
    },
    [theme]
  );
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('aside.um-nav-drawer');

  // Wait for the computed value to hold steady across three consecutive frames,
  // so the effect that resolves the theme has definitely landed.
  const bg = await page.evaluate(async () => {
    const el = document.querySelector('aside.um-nav-drawer');
    const read = () => getComputedStyle(el).backgroundColor;
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    let last = read();
    let stable = 0;
    for (let i = 0; i < 180 && stable < 3; i++) {
      await frame();
      const now = read();
      stable = now === last ? stable + 1 : 0;
      last = now;
    }
    return last;
  });

  // WHAT THE APP THINKS THE THEME IS, which is not the same question as what
  // colour the drawer painted. A probe that fails to hydrate leaves this at
  // "light" and every cell measures cream, which is indistinguishable from a
  // drawer that ignores the theme unless this is read separately.
  const resolvedTheme = await page.evaluate(
    () => document.querySelector('.um-topic')?.getAttribute('data-theme') ?? '(none)'
  );

  await ctx.close();
  return { bg, resolvedTheme };
}

let failures = 0;
const results = [];

async function measure(variant, theme, expected, shouldPass) {
  const { bg, resolvedTheme } = await drawerBg(ROUTES[variant], theme);
  const matched = bg === expected;
  // On the faulted twin in dark the assertion is SUPPOSED to fail. The run is
  // correct when `matched` equals `shouldPass`, not when it is true.
  const ok = matched === shouldPass;
  // The probe is only measuring anything if the theme it was asked for is the
  // theme that actually resolved. This is a FACT, not a check: it is never
  // inverted, because "the probe did not hydrate" is not a result about the
  // drawer and must fail the run outright rather than pass as a reddening.
  const themeOk = resolvedTheme === theme;
  if (!ok || !themeOk) failures++;
  results.push({ variant, theme, expected, got: bg, resolvedTheme, matched, shouldPass, ok, themeOk });
  return ok;
}

console.log(`\nthe fix: drawer follows theme (${ROUTES.fixed})`);
await measure('fixed', 'light', RAIL_LIGHT_BG, true);
await measure('fixed', 'dark', RAIL_DARK_BG, true);

console.log(`the control: mode="light" re-added (${ROUTES.faulted})`);
// Light is unaffected by the pin -- it was already light -- so it must still
// pass. Dark is the one the pin breaks, so its assertion must redden.
await measure('faulted', 'light', RAIL_LIGHT_BG, true);
await measure('faulted', 'dark', RAIL_DARK_BG, false);

await browser.close();

console.log('\n  variant  theme  expected              got                   drawer==expected  verdict');
for (const r of results) {
  const verdict = r.ok
    ? r.shouldPass
      ? 'pass'
      : 'pass (reddened as required)'
    : r.shouldPass
      ? 'FAIL'
      : 'FAIL (control did not redden)';
  console.log(
    `  ${r.variant.padEnd(8)} ${r.theme.padEnd(6)} ${r.expected.padEnd(21)} ${r.got.padEnd(21)} ${String(r.matched).padEnd(17)} ${verdict}`
  );
  console.log(
    `           ${''.padEnd(6)} data-theme: ${r.resolvedTheme}` +
      (r.themeOk ? '' : `  <-- WRONG, asked for ${r.theme}: the probe did not hydrate, nothing here measures the drawer`)
  );
}

if (failures) {
  console.log(`\n${failures} check(s) wrong. The drawer does not follow the theme, or the control did not discriminate.`);
  process.exit(1);
}
console.log('\nAll four cells correct: the drawer follows the theme, and re-adding the pin breaks dark and only dark.');
