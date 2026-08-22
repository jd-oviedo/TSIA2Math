// verify_lesson_dark.mjs -- prove the guided-notes lesson survives dark mode,
// measured on REAL rendered KaTeX from REAL topic markdown.
//
//   node scripts/verify_lesson_dark.mjs
//   node scripts/verify_lesson_dark.mjs --prove
//
// ─── WHY THIS FILE EXISTS: THE PROBE THAT FABRICATED ITS OWN EVIDENCE ────────
//
// This replaces the measurement half of verify_curriculum_dark.mjs, which
// passed while the lesson route shipped with invisible maths, and which is the
// sharpest example of a vacuous check in this project so far.
//
// It imported exactly one thing from the app: TOPIC_PAGE_CSS, a stylesheet. It
// imported NO COMPONENT. Then it hand-wrote the markup it went on to measure:
//
//     <span className="katex" data-probe="math-inline">
//       <span className="katex-html">7/10 + 1/5 = 9/10</span>
//     </span>
//
// That is not KaTeX output. It is a span wearing KaTeX's class name, with a
// plain string inside it. No markdown, no remark, no rehype-katex, no $...$.
// When that check reported "10 katex nodes at rgb(242,237,223)" with a control
// at 1.17, the ten nodes were spans the script had typed itself.
//
// THE LESSON, STATED SO THE NEXT PERSON DOES NOT REPEAT IT. A check must not
// construct the artefact it is checking. If the probe builds the input, the
// only thing it can prove is that the probe is self-consistent. The colour it
// measured was real; the thing wearing that colour was not.
//
// So this file asserts, before it measures anything, that real KaTeX actually
// ran (see the "not fabricated" checks below). A run in which the maths failed
// to render must FAIL, not quietly measure zero nodes and pass.
//
// ─── WHAT THIS IS: A COMPONENT HARNESS, NOT A REAL URL ──────────────────────
//
// STATED PLAINLY BECAUSE THE LAST PROBE OVERSTATED ITSELF. This is NOT a visit
// to /course/tsia2/math/unit/0/topic/QR.1.5/lesson. It is a temporary route
// that MOUNTS THE REAL COMPONENTS -- SectionHeading, LessonBody, and through
// LessonBody its children TopicNav and LessonHandoff -- inside the real
// .um-topic wrapper (TopicSurface), with the real TOPIC_PAGE_CSS, fed the real
// QR.1.5 markdown through the real markdown pipeline.
//
// Only two things are faked, and both are named:
//
//   1. AUTH. app/course/layout.tsx:60 calls resolveCourseAccess(), and
//      allowsTopic() returns false for anonymous (capabilities.ts:258, whose
//      own comment says "THE SESSION CHECK IS THE POINT OF THIS LINE"). Every
//      /course route 307s to /login without a session. That auth wall is why
//      all six probe scripts in this repo reached for a fake route: none of
//      them can authenticate. It is the reason this file exists in this shape
//      rather than as a real navigation.
//
//   2. THE FETCH. The topic row comes from lib/curriculum-fixture.ts rather
//      than Supabase. That substitution is not taken on trust:
//      scripts/verify_fixture_parity.mjs renders a live topic through both
//      paths and diffs the HTML byte for byte.
//
// WHAT THIS THEREFORE CANNOT CATCH, and what the real-URL probe must:
//
//   - the gate itself, and every entitlement state
//   - TopicChrome, the breadcrumb and the nav drawer, which need auth data
//   - the view projection, RLS, the grants, the PostgREST column list and the
//     JSON round trip, all of which curriculum-fixture.ts skips by design
//   - anything about the route's data loading, caching or redirects
//
// This is a strictly better instrument than the one it replaces, and it is
// still not the real thing. verify_curriculum_dark.mjs is to be rewritten
// against real /course URLs once a test account exists, BEFORE this branch
// merges.
//
// ─── WHAT IS MEASURED ───────────────────────────────────────────────────────
//
// getComputedStyle off the rendered nodes, compositing text alpha against the
// EFFECTIVE background found by walking up the ancestor chain. So what it
// asserts is what a student's browser actually paints, not what a constant says.
//
// The effective-background walk is the part that catches this defect class. The
// lesson's prose card was hardcoded to a light cream while the ink inside it
// followed the theme, so every assertion here has to resolve the real backdrop
// rather than assume the page ground.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { spawn } from 'child_process';

const PROBE_DIR = 'app/um-probe-lesson';
const PORT = 5131;
const BASE = `http://localhost:${PORT}`;
const PROVE = process.argv.includes('--prove');
const SHOTS = process.env.SHOTS ?? 'scratch-shots-lesson';
const COURSE = 'tsia2-math';
const TOPIC = 'QR.1.5';

// QR.1.5 is chosen, not arbitrary. Its first section is the one in the
// production screenshot that opened this work: "$40 - 65 = -25$" as inline
// maths at curriculum/source/tsia2-math/unit-0/QR.1.5.md:28, and
// "**rational numbers**" as a bolded key term two lines below it at :30. Those
// are the two elements reported invisible in dark. The probe measures those
// exact nodes rather than a stand-in.

const probePage = `import 'katex/dist/katex.min.css';
import { TOPIC_PAGE_CSS } from '../course/[test]/[subject]/unit/[unit]/topic/[topicId]/topic-page-css';
import { GumuGateProvider } from '../course/[test]/[subject]/unit/[unit]/topic/[topicId]/GumuGate';
import SectionHeading from '../course/[test]/[subject]/unit/[unit]/topic/[topicId]/SectionHeading';
import LessonBody from '../course/[test]/[subject]/unit/[unit]/topic/[topicId]/LessonBody';
import TopicSurface from '../components/TopicSurface';
import { FONT_BODY } from '../components/fonts';
import { loadTopicFixture } from '../../lib/curriculum-fixture';
import { renderMarkdownWithMath, splitGuidedNotes } from '../../lib/curriculum-utils';

// Mirrors app/course/.../topic/[topicId]/layout.tsx and .../lesson/page.tsx.
// The wrapper, the stylesheet, the .um-page container and the two components
// are the real ones. TopicChrome is omitted: it needs auth data this harness
// has no way to supply, and the script header records that as a known gap.

export default async function LessonProbe() {
  const topic = loadTopicFixture('${COURSE}', '${TOPIC}');
  if (!topic) throw new Error('fixture did not load; is CURRICULUM_FIXTURE_SOURCE set?');

  return (
    <GumuGateProvider>
      <style>{TOPIC_PAGE_CSS}</style>
      <TopicSurface fontFamily={FONT_BODY}>
        <div
          className="um-page"
          style={{ padding: '34px 34px 72px', display: 'flex', flexDirection: 'column', gap: '28px' }}
        >
          <SectionHeading
            title="Guided notes"
            blurb={\`Read this first \\u00b7 about \${topic.estimated_time_minutes} minutes for the whole topic\`}
          />
          <LessonBody
            sections={splitGuidedNotes(topic.guided_notes)}
            html={renderMarkdownWithMath(topic.guided_notes)}
            initialDone={false}
            courseId="${COURSE}"
            topicId="${TOPIC}"
            canRecord={false}
            previous={null}
            next={null}
            practiceHref="/x"
            practiceCount={10}
            practiceInteractive
          />
        </div>
      </TopicSurface>
    </GumuGateProvider>
  );
}

export const dynamic = 'force-dynamic';
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

const env = { ...process.env, CURRICULUM_FIXTURE_SOURCE: '1' };

console.log('building with the probe route...');
await new Promise((res, rej) => {
  let out = '';
  const b = spawn('npx', ['next', 'build'], { env });
  b.stdout.on('data', (d) => (out += d));
  b.stderr.on('data', (d) => (out += d));
  b.on('exit', (c) => {
    if (c === 0) return res();
    console.error(out.split('\n').slice(-40).join('\n'));
    rej(new Error('build failed'));
  });
});
server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'ignore', detached: true, env });
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

// Contrast from the rendered pixels. Walks up for the effective background,
// composites text alpha over it. The walk is load bearing here: the defect this
// file was written for is ink that follows the theme sitting on a card that does
// not, so the backdrop cannot be assumed from the page ground.
const contrastProbe = `(sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
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
const cardFill = {};

for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // The real theme mechanism, not a query parameter. TopicSurface reads
  // useTheme(), which reads this key, so setting it here exercises the shipped
  // path including the light-first-paint flash TopicSurface documents.
  await ctx.addInitScript((t) => {
    try { localStorage.setItem('ec-theme', t); } catch {}
  }, theme);
  const p = await ctx.newPage();
  await p.goto(`${BASE}/um-probe-lesson`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);

  console.log(`\n  ── ${theme} ──`);

  // ─── NOT FABRICATED. These run first, and everything after them depends on
  // them. They are the direct answer to the probe this file replaces: prove the
  // maths on the page was produced by KaTeX from authored markdown, not typed
  // into the harness.
  const katexCount = await p.evaluate(() => document.querySelectorAll('.katex').length);
  const mathmlCount = await p.evaluate(() => document.querySelectorAll('.katex .katex-mathml').length);
  const mordCount = await p.evaluate(() => document.querySelectorAll('.katex .mord').length);
  const strongCount = await p.evaluate(() => document.querySelectorAll('.um-prose strong').length);

  await check(`NOT FABRICATED: real KaTeX ran, >20 .katex nodes (got ${katexCount})`, () => katexCount > 20);
  await check(`NOT FABRICATED: KaTeX emitted MathML, which no hand-written span has (got ${mathmlCount})`, () => mathmlCount > 0);
  await check(`NOT FABRICATED: KaTeX emitted .mord atoms (got ${mordCount})`, () => mordCount > 0);
  await check(`NOT FABRICATED: markdown produced bold key terms (got ${strongCount})`, () => strongCount > 0);

  // The exact nodes from the production screenshot.
  const signedMath = await p.evaluate(() => {
    const n = [...document.querySelectorAll('.katex')]
      .find((e) => e.textContent.replace(/\s/g, '').includes('40-65=-25'));
    if (n) n.setAttribute('data-probe', 'signed-math');
    return Boolean(n);
  });
  await check(`the screenshot's equation "40 - 65 = -25" is on the page`, () => signedMath);

  const rationalTerm = await p.evaluate(() => {
    const n = [...document.querySelectorAll('.um-prose strong')]
      .find((e) => e.textContent.trim() === 'rational numbers');
    if (n) n.setAttribute('data-probe', 'rational-term');
    return Boolean(n);
  });
  await check(`the screenshot's bold term "rational numbers" is on the page`, () => rationalTerm);

  // Tag the remaining real nodes.
  await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const head = q('.um-page > div');
    if (head) {
      const h2 = head.querySelector('h2');
      if (h2) h2.setAttribute('data-probe', 'heading-title');
      const spans = [...head.querySelectorAll('span')];
      const blurb = spans.find((s) => s.textContent.includes('Read this first'));
      if (blurb) blurb.setAttribute('data-probe', 'heading-blurb');
    }
    const prose = q('.um-prose p');
    if (prose) prose.setAttribute('data-probe', 'prose');
    const card = q('.um-prose')?.closest('div[style*="background"]');
    if (card) card.setAttribute('data-probe', 'card');
  });

  const at = async (sel) => p.evaluate(`(${contrastProbe})('${sel}')`);
  const fill = await p.evaluate(() => {
    const c = document.querySelector('[data-probe="card"]');
    return c ? getComputedStyle(c).backgroundColor : null;
  });
  cardFill[theme] = fill;
  console.log(`     prose card fill: ${fill}`);

  const targets = [
    ['inline maths "40 - 65 = -25"', 'signed-math'],
    ['bold term "rational numbers"', 'rational-term'],
    ['body prose', 'prose'],
    ['SectionHeading title "Guided notes"', 'heading-title'],
    ['SectionHeading blurb "Read this first"', 'heading-blurb'],
  ];
  for (const [label, probe] of targets) {
    const r = await at(`[data-probe="${probe}"]`);
    await check(`${label} clears 4.5:1 in ${theme} (got ${r})`, () => r !== null && r >= 4.5);
  }

  await p.screenshot({ path: `${SHOTS}/lesson-${theme}.png`, fullPage: false });
  await ctx.close();
}

// THE ROOT CAUSE, ASSERTED DIRECTLY. Every contrast failure above is downstream
// of one thing: the prose card's fill is hardcoded, so it does not move when the
// theme does. A card that paints the same colour in both themes is the defect,
// independently of whatever ratio happens to fall out of it today.
console.log(`\n  ── the card fill across themes ──`);
console.log(`     light: ${cardFill.light}    dark: ${cardFill.dark}`);
await check(
  `prose card fill differs between light and dark (light ${cardFill.light}, dark ${cardFill.dark})`,
  () => cardFill.light !== cardFill.dark
);

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
