// verify_curriculum_dark.mjs -- prove the curriculum tree survives dark mode, and
// specifically that the math does.
//
//   node scripts/verify_curriculum_dark.mjs
//   node scripts/verify_curriculum_dark.mjs --prove
//
// WHY THIS EXISTS AT ALL, AND WHY IT IS THE FIRST CHECK WRITTEN
// -------------------------------------------------------------
// The curriculum tree was light only until 2026-08-21. The reason recorded for
// that was not a preference: globals.css paints KaTeX from --ec-ink, which
// inverts with the theme, while the page under it was pinned to cream. Switching
// to dark therefore did not theme the lesson, it turned the equations off, on the
// one surface whose entire content is maths. Measured before the fix, from
// globals.css:20-38: #E8EEF8 on #E8E0CF is 1.13:1.
//
// topic-page-css.ts answered that by pinning .katex to #0E0E11. That pin is now
// the hazard: the page moves, so a fixed dark ink is the same failure with the
// themes swapped, black math on a near-black band. The rule follows --umt-ink
// instead, and this file is what stops it drifting back.
//
// WHY A PROBE ROUTE
// -----------------
// /course/* redirects to /login without a session, and a session needs Google
// OAuth. Same three options as verify_modules_states.mjs weighed the same way and
// the same answer: a probe route, written before the run and deleted after, never
// committed, rendering the REAL wrapper, the REAL stylesheet and the REAL tokens.
//
// WHAT IS MEASURED. Not the constants. The probe reads getComputedStyle off the
// rendered nodes and composites alpha against the effective background, so what
// it asserts is what a student's browser actually paints.
//
// THE CONTROL. Every contrast assertion runs against a deliberately faulted twin
// carrying the OLD hardcoded value, in the same run and the same theme. If the
// faulted twin passes too, the check is not reading the colour.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { spawn } from 'child_process';

const PROBE_DIR = 'app/um-probe-dark';
const PORT = 5130;
const BASE = `http://localhost:${PORT}`;
const PROVE = process.argv.includes('--prove');
const SHOTS = process.env.SHOTS ?? 'scratch-shots-dark';

// The probe renders the same three things a lesson page does: prose with inline
// math, a display-math panel, and a prose link. `faulted` reproduces the value
// this change removed, so the control is the real previous behaviour rather than
// an invented one.
const probePage = `import 'katex/dist/katex.min.css';
import { TOPIC_PAGE_CSS } from '../course/[test]/[subject]/unit/[unit]/topic/[topicId]/topic-page-css';

export default async function DarkProbe({ searchParams }) {
  const { theme = 'light' } = await searchParams;
  return (
    <>
      <style>{TOPIC_PAGE_CSS}</style>
      <div className="um-topic" data-theme={theme} style={{ minHeight: '100dvh', background: 'var(--umt-page)', color: 'var(--umt-ink)' }}>
        <div style={{ background: 'var(--umt-band)', padding: 40 }}>
          <div className="um-prose" style={{ maxWidth: 740 }}>
            <p data-probe="prose">
              Adding fractions never touches the bottoms once they match:
              <span className="katex" data-probe="math-inline"><span className="katex-html" aria-hidden="true">7/10 + 1/5 = 9/10</span></span>
              and that is the whole rule.
            </p>
            <p><a href="/x" data-probe="link">a prose link inside the lesson</a></p>
          </div>
          <div data-probe="mathpanel" style={{ background: 'var(--umt-panel)', border: '1px solid var(--umt-hairline)', padding: 20, maxWidth: 740 }}>
            <span className="katex" data-probe="math-display"><span className="katex-html" aria-hidden="true">-6 × (-4) = 24</span></span>
          </div>
          <div data-probe="muted" style={{ color: 'var(--umt-muted)', font: '400 12px ui-monospace, monospace', marginTop: 20 }}>QR.1.5 · 50 min</div>
        </div>

        {/* THE CONTROL. The exact rule this change removed, at matching
            specificity. An inline style cannot reproduce it: the live rule is
            .um-topic .katex { ... !important }, and !important beats an inline
            style that lacks it, so a style-prop pin silently measured the themed
            value instead. The first run of this file caught that, which is the
            control doing its job on itself. */}
        <style>{'.um-topic .um-faulted.katex { color: #0E0E11 !important; }'}</style>
        <div style={{ background: 'var(--umt-band)', padding: 40 }}>
          <span className="katex um-faulted" data-probe="math-faulted">
            <span className="katex-html" aria-hidden="true">faulted twin</span>
          </span>
          <a href="/x" data-probe="link-faulted" style={{ color: '#6E9DC8' }}>faulted link</a>
        </div>
      </div>
    </>
  );
}
`;

let server;
const cleanup = () => {
  try { rmSync(PROBE_DIR, { recursive: true, force: true }); } catch {}
  try { if (server) process.kill(-server.pid); } catch {}
};
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(1); });

mkdirSync(PROBE_DIR, { recursive: true });
writeFileSync(`${PROBE_DIR}/page.jsx`, probePage);
mkdirSync(SHOTS, { recursive: true });

console.log('building with the probe route...');
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
server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 6000));

let failed = 0;
const check = async (label, fn) => {
  try {
    const ok = await fn();
    const pass = PROVE ? !ok : ok;
    console.log(`  ${pass ? 'pass' : 'FAIL'}  ${label}`);
    if (!pass) failed++;
  } catch (e) {
    console.log(`  FAIL  ${label} -- ${e.message.split('\n')[0]}`);
    failed++;
  }
};

// Contrast from the rendered pixels, walking up for the effective background,
// compositing text alpha over it. Same probe as verify_modules_states.mjs.
const contrastProbe = `(sel) => {
  const el = document.querySelector(sel);
  const parse = (c) => c.match(/[\\d.]+/g).map(Number);
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  let bg = [255, 255, 255];
  for (let n = el; n; n = n.parentElement) {
    const c = parse(getComputedStyle(n).backgroundColor);
    if (c.length < 4 || c[3] > 0) { bg = c.slice(0, 3); break; }
  }
  const fg = parse(getComputedStyle(el).color);
  const a = fg.length > 3 ? fg[3] : 1;
  const over = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
  const [hi, lo] = [lum(over), lum(bg)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}`;

const browser = await chromium.launch();

for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/um-probe-dark?theme=${theme}`);
  await p.waitForTimeout(400);

  const colour = (sel) => p.evaluate((s) => getComputedStyle(document.querySelector(s)).color, sel);

  // The expected ink for this theme, read from the token rather than restated,
  // so the assertion cannot drift from the palette.
  const tokenInk = await p.evaluate(() =>
    getComputedStyle(document.querySelector('.um-topic')).getPropertyValue('--umt-ink').trim()
  );
  console.log(`\n  ${theme}: --umt-ink resolves to ${tokenInk}`);

  const inlineMath = await p.evaluate(`(${contrastProbe})('[data-probe="math-inline"]')`);
  const displayMath = await p.evaluate(`(${contrastProbe})('[data-probe="math-display"]')`);
  const faultedMath = await p.evaluate(`(${contrastProbe})('[data-probe="math-faulted"]')`);
  const link = await p.evaluate(`(${contrastProbe})('[data-probe="link"]')`);
  const faultedLink = await p.evaluate(`(${contrastProbe})('[data-probe="link-faulted"]')`);
  const prose = await p.evaluate(`(${contrastProbe})('[data-probe="prose"]')`);
  const muted = await p.evaluate(`(${contrastProbe})('[data-probe="muted"]')`);

  await check(`inline math clears 4.5:1 in ${theme} (got ${inlineMath})`, () => inlineMath >= 4.5);
  await check(`display math clears 4.5:1 in ${theme} (got ${displayMath})`, () => displayMath >= 4.5);
  await check(`prose clears 4.5:1 in ${theme} (got ${prose})`, () => prose >= 4.5);
  await check(`mono metadata clears 4.5:1 in ${theme} (got ${muted})`, () => muted >= 4.5);
  await check(`prose link clears 4.5:1 in ${theme} (got ${link})`, () => link >= 4.5);

  // Math must follow the token, not a pinned value. Compared against the token
  // the page itself resolved, so this stays true if the palette changes.
  const mathColour = await colour('[data-probe="math-inline"]');
  await check(`math ink follows --umt-ink in ${theme} (${mathColour})`, async () => {
    const tokenAsRgb = await p.evaluate((hexish) => {
      const d = document.createElement('div');
      d.style.color = hexish;
      document.body.appendChild(d);
      const c = getComputedStyle(d).color;
      d.remove();
      return c;
    }, tokenInk);
    return mathColour === tokenAsRgb;
  });

  await p.screenshot({ path: `${SHOTS}/curriculum-${theme}.png`, fullPage: true });
  await ctx.close();

  // Report the control alongside, in the same theme.
  console.log(`  control, the removed hardcoded values in ${theme}: math ${faultedMath}, link ${faultedLink}`);
  if (theme === 'dark') {
    await check(
      `CONTROL: pinned #0E0E11 math FAILS in dark, so the check reads colour (got ${faultedMath})`,
      () => faultedMath < 4.5
    );
    await check(
      `CONTROL: pinned #6E9DC8 link passes in dark, which is why only light was broken (got ${faultedLink})`,
      () => faultedLink >= 4.5
    );
  } else {
    await check(
      `CONTROL: pinned #6E9DC8 link FAILS in light, the defect this change fixes (got ${faultedLink})`,
      () => faultedLink < 4.5
    );
  }
}

await browser.close();
console.log(failed === 0 ? '\nall checks passed' : `\n${failed} check(s) failed`);
if (PROVE) {
  console.log(
    failed > 0
      ? 'PROVE: failed as intended, the checks read the real page'
      : 'PROVE: nothing failed, these checks cannot fail. Fix them.'
  );
  process.exit(failed > 0 ? 0 : 1);
}
process.exit(failed === 0 ? 0 : 1);
