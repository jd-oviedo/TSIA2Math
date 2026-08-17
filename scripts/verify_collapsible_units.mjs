// verify_collapsible_units.mjs -- prove the Modules unit disclosure actually
// collapses, in a real browser, against the real component.
//
//   node scripts/verify_collapsible_units.mjs
//
// WHY A TEMPORARY PROBE ROUTE
// ---------------------------
// /dashboard/modules redirects to /login without a session, so Playwright cannot
// reach the component where it lives. The three ways out were weighed and two
// were rejected:
//
//   a profile fixture   rejected. The content fixture leaks answer keys if it
//                       escapes; an auth fixture would make every visitor a
//                       signed-in student. That is a permanent hole in the auth
//                       path to test one disclosure widget.
//   a real sign-in      a genuine option, and its own piece of work: a dedicated
//                       test account, credentials in the harness, and production
//                       auth in the loop. It belongs to its own decision.
//   a probe route       this. Written before the run, deleted after, never
//                       committed, so it adds no permanent surface and still
//                       exercises the REAL component with hydration, which is
//                       what isVisible() and click() require.
//
// WHAT IT ASSERTS, AND WHY NOT PRESENCE
// --------------------------------------
// Measured on a closed <details>: querySelectorAll and locator().count() both
// return the hidden children, isVisible() is false, and click() times out. So a
// presence check passes on an element a student can never reach.
//
// This component does not render collapsed topics at all, which makes absence a
// truthful signal rather than a misleading one. The suite therefore asserts BOTH:
// that collapsed topics are absent, AND that an expanded topic is visible and
// genuinely clickable. The CONTROL below is what makes the pair meaningful: it
// renders a flat, never-collapsing variant and shows the collapse assertions fail
// against it. A test that passes on the old flat page is not testing collapse.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { execSync, spawn } from 'child_process';

const PROBE_DIR = 'app/um-probe-collapsible';
const PORT = 5100;
const BASE = `http://localhost:${PORT}`;

// Two probes on one page: the real component, and a flat control that never
// collapses. The control is the same topic rows rendered without the wrapper.
const probePage = `import UnitSection from '../dashboard/modules/UnitSection';

const rows = (unit: number) => [1, 2, 3].map((i) => (
  <a key={i} data-probe-topic={\`\${unit}-\${i}\`} href={\`/course/tsia2/math/unit/\${unit}/topic/T\${i}\`}>
    Topic \${'{'}unit{'}'}.{i}
  </a>
));

export default function ProbePage() {
  return (
    <main className="um-dash">
      <div data-probe="real">
        <UnitSection unitNumber={1} topicCount={3} done={2} total={10} defaultOpen={false}>
          {rows(1)}
        </UnitSection>
        <UnitSection unitNumber={2} topicCount={3} done={5} total={10} defaultOpen={true}>
          {rows(2)}
        </UnitSection>
      </div>
      <div data-probe="flat">
        {rows(9)}
      </div>
    </main>
  );
}
`;

function writeProbe() {
  mkdirSync(PROBE_DIR, { recursive: true });
  writeFileSync(`${PROBE_DIR}/page.tsx`, probePage);
}
function removeProbe() {
  if (existsSync(PROBE_DIR)) rmSync(PROBE_DIR, { recursive: true, force: true });
}

let ok = true;
const check = (name, pass, detail = '') => {
  ok &&= pass;
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? `  ${detail}` : ''}`);
};

process.on('exit', removeProbe);
process.on('SIGINT', () => { removeProbe(); process.exit(1); });

writeProbe();
console.log('probe route written, building...\n');
execSync('npx next build', { stdio: 'ignore' });
const server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 9000));

const browser = await chromium.launch();
try {
  // 360px: the low end of the viewports this product targets.
  const page = await browser.newPage({ viewport: { width: 360, height: 780 } });
  const resp = await page.goto(`${BASE}/um-probe-collapsible`, { waitUntil: 'networkidle' });
  check('probe route reachable', resp.status() === 200, `status ${resp.status()}`);

  const collapsed = page.locator('[data-probe-topic^="1-"]');
  const expanded = page.locator('[data-probe-topic^="2-"]');
  const flat = page.locator('[data-probe-topic^="9-"]');
  const toggle1 = page.locator('button[data-unit="1"]');

  // ── collapsed ──────────────────────────────────────────────────────────────
  check('a collapsed unit renders none of its topics',
    (await collapsed.count()) === 0, `count ${await collapsed.count()}`);
  check('the collapsed toggle reports aria-expanded=false',
    (await toggle1.getAttribute('aria-expanded')) === 'false');
  check('the collapsed toggle is itself visible and clickable',
    (await toggle1.isVisible()) && (await toggle1.isEnabled()));

  // ── expanded ───────────────────────────────────────────────────────────────
  check('an expanded unit renders its topics',
    (await expanded.count()) === 3, `count ${await expanded.count()}`);
  check('an expanded topic is VISIBLE, not merely present',
    await expanded.first().isVisible());
  let clicked = false;
  try {
    await expanded.first().click({ trial: true, timeout: 1500 });
    clicked = true;
  } catch { /* not actionable */ }
  check('an expanded topic is genuinely actionable', clicked);

  // ── the toggle actually toggles, with hydration ────────────────────────────
  await toggle1.click();
  await page.waitForTimeout(150);
  check('clicking a collapsed header reveals its topics',
    (await collapsed.count()) === 3, `count ${await collapsed.count()}`);
  check('and updates aria-expanded to true',
    (await toggle1.getAttribute('aria-expanded')) === 'true');
  check('the revealed topic is visible',
    await collapsed.first().isVisible());
  await toggle1.click();
  await page.waitForTimeout(150);
  check('clicking again hides them and they leave the DOM',
    (await collapsed.count()) === 0, `count ${await collapsed.count()}`);

  // ── semantics ──────────────────────────────────────────────────────────────
  const sem = await page.evaluate(() => {
    const b = document.querySelector('button[data-unit="2"]');
    const id = b?.getAttribute('aria-controls');
    const r = b?.getBoundingClientRect();
    return {
      tag: b?.tagName,
      inHeading: b?.parentElement?.tagName,
      controlsResolves: !!(id && document.getElementById(id)),
      height: r ? Math.round(r.height) : 0,
      width: r ? Math.round(r.width) : 0,
    };
  });
  check('the toggle is a real <button>', sem.tag === 'BUTTON', sem.tag);
  check('wrapped in the unit heading', sem.inHeading === 'H2', sem.inHeading);
  check('aria-controls resolves to a real element', sem.controlsResolves);
  check('touch target clears 44px at 360px wide',
    sem.height >= 44, `${sem.width}x${sem.height}px`);

  // ── keyboard ───────────────────────────────────────────────────────────────
  await toggle1.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  check('operable by keyboard (Enter)', (await collapsed.count()) === 3);
  await page.keyboard.press(' ');
  await page.waitForTimeout(150);
  check('operable by keyboard (Space)', (await collapsed.count()) === 0);

  // ── THE CONTROL ────────────────────────────────────────────────────────────
  // The same assertions against a flat, never-collapsing list. If they pass here
  // too, they are not testing collapse.
  console.log('\n  CONTROL, the same assertions against a flat non-collapsing list:');
  const flatCount = await flat.count();
  const flatVisible = await flat.first().isVisible();
  const collapseAssertionHolds = flatCount === 0;
  check('a flat list FAILS the collapsed assertion, as it must',
    !collapseAssertionHolds, `flat renders ${flatCount} topics, all visible=${flatVisible}`);
  check('so the collapsed assertion is discriminating, not vacuous', !collapseAssertionHolds);
} finally {
  await browser.close();
  try { process.kill(-server.pid); } catch { /* already gone */ }
  removeProbe();
}

console.log(`\nRESULT: ${ok ? 'the disclosure collapses, and the checks can tell' : 'A CHECK FAILED'}`);
process.exit(ok ? 0 : 1);
