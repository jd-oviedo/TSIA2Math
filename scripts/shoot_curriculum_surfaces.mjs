// shoot_curriculum_surfaces.mjs -- screenshot the curriculum surfaces in both
// themes, at desktop and 390px, with REAL rendered KaTeX.
//
//   node scripts/shoot_curriculum_surfaces.mjs
//
// Not a check. verify_curriculum_dark.mjs asserts the contrast numbers; this one
// exists so the surfaces can be LOOKED at, which is how the gated-row defect and
// the 390px title collapse were both found.
//
// THE MATH IS REAL. The markdown below goes through renderMarkdownWithMath, the
// same remark/rehype/KaTeX pipeline the lesson route uses, so what is
// photographed is genuine KaTeX markup on the themed ground rather than hand-set
// HTML standing in for it. That is the specific thing worth photographing: the
// .um-topic .katex rule was pinned to a light ink until this pass, and a pinned
// ink is what made the math invisible the last time this surface met dark mode.
//
// The topic content is QR.1.5-shaped: signed numbers, fractions and a display
// equation, chosen because it is the densest math in the course rather than the
// prettiest.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { spawn } from 'child_process';

const PROBE_DIR = 'app/um-probe-surfaces';
const PORT = 5140;
const BASE = `http://localhost:${PORT}`;
const SHOTS = process.env.SHOTS ?? 'scratch-shots-surfaces';

const probePage = `import 'katex/dist/katex.min.css';
import { renderMarkdownWithMath } from '../../lib/curriculum-utils';
import { TOPIC_PAGE_CSS } from '../course/[test]/[subject]/unit/[unit]/topic/[topicId]/topic-page-css';
import TopicOverview from '../course/[test]/[subject]/unit/[unit]/topic/[topicId]/TopicOverview';
import { T } from '../components/curriculum-surface';
import { EYEBROW } from '../components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '../components/fonts';

const NOTES = [
  '##### Multiplying and Dividing Signs',
  '',
  'Here the rule is mechanical and it does not care about magnitudes. Count the',
  'negative signs. An even count gives a positive answer, an odd count gives a',
  'negative one, so $-6 \\\\times (-4) = 24$ while $-6 + (-4) = -10$.',
  '',
  '$$\\\\frac{7}{10} + \\\\frac{1}{5} = \\\\frac{7}{10} + \\\\frac{2}{10} = \\\\frac{9}{10}$$',
  '',
  'Division follows the same count, because dividing is multiplying by the',
  'reciprocal. The dangerous part is not this rule, it is switching between this',
  'rule and the addition rule inside one problem, where $\\\\sqrt{81} = 9$ and',
  '$\\\\left(\\\\frac{3}{4}\\\\right)^{2} = \\\\frac{9}{16}$ both still have to hold.',
  '',
  '| Expression | Value |',
  '| --- | --- |',
  '| $-6 \\\\times (-4)$ | $24$ |',
  '| $-6 + (-4)$ | $-10$ |',
].join('\\n');

const PARTS = [
  { kind: 'lesson', title: 'Guided notes', href: '#', detail: '7 sections, about 20 min', status: 'complete' },
  { kind: 'practice', title: 'Practice', href: '#', detail: '10 problems, 8 of 10 correct', status: 'in_progress', requirement: 'Get 7 of 10 right to open the quiz' },
  { kind: 'quiz', title: 'Mini quiz', href: '#', detail: '4 questions, about 10 min', status: 'not_started' },
];

export default async function SurfaceProbe({ searchParams }) {
  const { theme = 'light' } = await searchParams;
  const html = renderMarkdownWithMath(NOTES);
  return (
    <>
      <style>{TOPIC_PAGE_CSS}</style>
      <div className="um-topic" data-theme={theme} style={{ minHeight: '100dvh', background: T.page, color: T.ink, fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}>

        {/* Chrome, source 1: white bar, hard rule, mono breadcrumb. */}
        <div data-probe="chrome" style={{ background: T.barBg, borderBottom: \`1px solid \${T.barLine}\`, height: 56, display: 'flex', alignItems: 'center', gap: 20, padding: '0 32px' }}>
          <span style={{ font: \`500 16px ui-monospace, monospace\`, color: T.barInk2 }}>&#9776;</span>
          <span style={{ font: \`700 15px \${FONT_HEADING}\`, color: T.barInk }}>unpackmath</span>
          <span style={{ width: 1, height: 22, background: T.barLine }} />
          <div style={{ font: \`400 13px \${FONT_BODY}\`, color: T.barInk2, flex: 1 }}>
            TSIA2 Math <span style={{ opacity: .5 }}>/</span> Unit 0 <span style={{ opacity: .5 }}>/</span>{' '}
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: T.barInk }}>QR.1.5</span>
          </div>
          <div style={{ display: 'flex' }}>
            {['Lesson', 'Practice', 'Quiz'].map((t, i) => (
              <div key={t} style={{ padding: '7px 16px', border: \`1px solid \${T.barLine}\`, borderLeft: i === 0 ? \`1px solid \${T.barLine}\` : 'none', background: i === 0 ? T.tabActiveBg : 'transparent', font: \`\${i === 0 ? 600 : 400} 12px \${FONT_BODY}\`, color: i === 0 ? T.ink : T.barInk2 }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Topic overview, the real component, on the reading ground. */}
        <div data-probe="overview" style={{ background: T.band, padding: '40px 48px', borderBottom: \`1px solid \${T.hairline}\` }}>
          <div style={{ maxWidth: 820 }}>
            <div style={{ ...EYEBROW, color: T.muted }}>Topic QR.1.5</div>
            <h1 style={{ margin: '12px 0 24px', font: \`600 33px \${FONT_HEADING}\`, lineHeight: 1.2, color: T.ink }}>
              Operations with rational numbers (signed numbers, fractions, decimals)
            </h1>
            <TopicOverview parts={PARTS} primary={{ href: '#', label: 'Carry on with practice' }} estimatedMinutes={50} />
          </div>
        </div>

        {/* Real KaTeX, through the real pipeline, on the reading band. */}
        <div data-probe="lesson" style={{ background: T.band, padding: '40px 48px' }}>
          <div style={{ ...EYEBROW, color: T.muted, marginBottom: 14 }}>Guided notes, section 3 of 7</div>
          <div className="um-prose" style={{ maxWidth: 740 }} dangerouslySetInnerHTML={{ __html: html }} />
          <div style={{ marginTop: 28, padding: '18px 22px', background: T.panel, border: \`1px solid \${T.hairline}\` }}>
            <div style={{ ...EYEBROW, color: T.muted }}>Display math, in a panel</div>
            <div className="um-prose" style={{ marginTop: 10 }} dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath('$$-6 \\\\times (-4) = 24$$') }} />
          </div>
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

const browser = await chromium.launch();
for (const theme of ['dark', 'light']) {
  for (const [w, label] of [[1280, 'desktop'], [390, 'mobile']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 1000 } });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/um-probe-surfaces?theme=${theme}`);
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${SHOTS}/${theme}-${label}.png`, fullPage: true });

    // Report what the math actually resolved to, so the screenshot is not the
    // only evidence.
    const info = await p.evaluate(() => {
      const k = document.querySelector('.katex');
      const root = document.querySelector('.um-topic');
      return {
        katexCount: document.querySelectorAll('.katex').length,
        katexColour: k ? getComputedStyle(k).color : 'NO KATEX RENDERED',
        ink: getComputedStyle(root).getPropertyValue('--umt-ink').trim(),
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    console.log(`  ${theme} ${label}: ${info.katexCount} katex nodes, colour ${info.katexColour}, --umt-ink ${info.ink}, overflowX ${info.overflowX}px`);
    await ctx.close();
  }
}
await browser.close();
console.log(`\nshots in ${SHOTS}`);
process.exit(0);
