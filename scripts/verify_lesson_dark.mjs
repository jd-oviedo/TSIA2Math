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
//
// ─── EXTENDED 2026-08-26: SECTION SEPARATION, BOTH THEMES ───────────────────
//
// A second, independent job now rides this harness, because it is the only
// DB-free lane that mounts REAL LessonBody sections. app/um-verify/curriculum
// mounts TopicChrome and a hand-written prose-card div; it has no sections, no
// section rule and no section eyebrow, so it cannot see any of this.
//
// The change under test is "flat but divided": sections gain a visible boundary
// and a legible start, and gain NO fill, box, radius or shadow. Four claims:
//
//   1. DARK's between-section rule is DISTINCT from the within-block hairline.
//      Before this change the two tokens were byte-identical, so dark shipped
//      with no structural tier at all. Asserted both ways -- the exact expected
//      value AND not-equal to the hairline -- because either alone is weak:
//      the value alone would pass if the hairline had moved to match it, and
//      not-equal alone would pass on any wrong value that happens to differ.
//
//   2. LIGHT's rule is the new neutral and is visible against the ground.
//
//   3. THE SECTION HAS NO BACKGROUND, in either theme. This is the assertion
//      that proves the no-card decision (curriculum-theme.ts RADIUS = 0) held
//      through a change whose whole subject is making sections more visible --
//      the obvious wrong way to do which is to give them a fill.
//
//   4. The eyebrow reads as a start: weight 700, colour ink2, in both themes.
//
// PracticeQuiz is mounted alongside LessonBody for one reason only: the rule
// token moved at four call sites, and this is the lane where the problem frame
// can be measured. Its sibling assertion, the top bar's rule, lives in
// scripts/verify_ui_lane.mjs because TopicChrome needs no lesson data and
// ui-verify-lane.mjs:15-18 sets out that split. Between them three of the four
// call sites are pinned by computed value, so a partial revert reddens.
//
// assertTheme IS IMPORTED FROM THE LANE HELPER RATHER THAN REIMPLEMENTED, and
// it is new here. This script set localStorage and reloaded but never checked
// that data-theme actually resolved -- exactly the hole ui-verify-lane.mjs:29-35
// records as having cost two full runs in #208, where a page that never
// hydrated reported the light default and the light default was the same colour
// as the bug. Every read below is now gated on it.

import { chromium } from 'playwright';
import { assertTheme } from './ui-verify-lane.mjs';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { spawn } from 'child_process';

const PROBE_DIR = 'app/um-probe-lesson';
const PORT = 5131;
const BASE = `http://localhost:${PORT}`;
const PROVE = process.argv.includes('--prove');
const SHOTS = process.env.SHOTS ?? 'scratch-shots-lesson';
const COURSE = 'tsia2-math';
const TOPIC = 'QR.1.5';

// ─── THE SECTION-SEPARATION BASELINE ────────────────────────────────────────
//
// Restated here rather than imported from curriculum-surface.ts, on the same
// principle as scripts/verify_ui_lane.mjs:24-27: a future edit to the palette
// has to disagree with a second, independently-written copy before it can
// quietly ship. Importing the token would make this file agree with any value
// the token happens to hold, which is not a test.
//
// Border colours compute as the AUTHORED rgba, not composited against the
// backdrop -- getComputedStyle does not flatten border-color -- so these are
// the alpha values as written.
const RULE_LIGHT = 'rgba(14, 14, 17, 0.3)'; //     LIGHT.rule,  was #C8A96E
const RULE_DARK = 'rgba(242, 237, 223, 0.24)'; //  DARK.rule,   was 0.14
// The within-block hairline, unchanged by this work, and the value DARK.rule
// used to be identical to. It is here to be the thing the dark rule is asserted
// AGAINST, so the "dark has a structural tier" claim is stated as a
// relationship and not just as a number.
const HAIRLINE_DARK = 'rgba(242, 237, 223, 0.14)';
// The page ground the light rule has to be visible against, from LIGHT.page via
// DASH.pageBg. Same hex verify_ui_lane.mjs pins.
const GROUND_LIGHT = 'rgb(245, 245, 243)';
// The eyebrow's step up. ink2 composites against the effective backdrop, so
// unlike the borders these are asserted as ratios, not as strings.
const EYEBROW_WEIGHT = '700';
// T.ink2 per theme. `color` serialises as the authored rgba too, so these are
// exact-match rather than ratio assertions; the ratio each one produces against
// the real backdrop is reported alongside by the existing contrast probe.
const EYEBROW_COLOR = {
  light: 'rgba(14, 14, 17, 0.75)',
  dark: 'rgba(242, 237, 223, 0.7)',
};
const RULE_EXPECTED = { light: RULE_LIGHT, dark: RULE_DARK };

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
import PracticeQuiz from '../course/[test]/[subject]/unit/[unit]/topic/[topicId]/PracticeQuiz';
import { toPublicItems } from '../course/[test]/[subject]/unit/[unit]/topic/[topicId]/topic-data';
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
          {/* HERE ONLY FOR THE PROBLEM FRAME'S BORDER, which is the third of the
              four T.rule call sites and has no other DB-free home. Fed the real
              fixture items through the real toPublicItems, so the fieldset
              measured below is the one a student gets rather than a div this
              probe drew for itself. Mounting is inert: PracticeQuiz's only
              fetch is inside submit(), which needs a click. */}
          <PracticeQuiz
            courseId="${COURSE}"
            topicId="${TOPIC}"
            section="practice"
            items={toPublicItems(topic.practice_items?.practice)}
            heading="Practice"
            blurb="Mounted for the rule measurement only."
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

  // THE HYDRATION GATE, AND IT RUNS BEFORE ANY READ ON THIS PAGE.
  //
  // TopicSurface resolves the stored preference in an effect and carries the
  // result on .um-topic[data-theme]. A route that failed to hydrate stays
  // silently on the light default -- and "never hydrated" paints the same
  // colour as most of the defects this file looks for, which is how #208 lost
  // two runs to confident, meaningless numbers. assertTheme throws rather than
  // recording a failure, on purpose: there is no useful result to report from a
  // dead page, so the run aborts instead of grading it.
  const resolvedTheme = await p.evaluate(
    () => document.querySelector('.um-topic')?.getAttribute('data-theme') ?? null,
  );
  assertTheme(theme, resolvedTheme, 'um-probe-lesson');

  console.log(`\n  ── ${theme} ── (data-theme ${resolvedTheme})`);

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
    // The section eyebrow, so the existing contrast walk reports the ratio its
    // step up to ink2 actually buys against the real backdrop. The exact-colour
    // assertion further down is the one that pins the value; this is the number
    // that says what the value is worth.
    const eb = [...document.querySelectorAll('section.um-prose-card div')]
      .find((n) => /^Section \d+ of \d+$/.test(n.textContent.trim()));
    if (eb) eb.setAttribute('data-probe', 'section-eyebrow');
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
    ['section eyebrow "Section N of M"', 'section-eyebrow'],
  ];
  for (const [label, probe] of targets) {
    const r = await at(`[data-probe="${probe}"]`);
    await check(`${label} clears 4.5:1 in ${theme} (got ${r})`, () => r !== null && r >= 4.5);
  }

  // ─── SECTION SEPARATION: FLAT, BUT DIVIDED ────────────────────────────────
  //
  // Everything above measures ink. This block measures the STRUCTURE the ink
  // sits in, and it is the half that this change moved.
  const sec = await p.evaluate(() => {
    const sections = [...document.querySelectorAll('section.um-prose-card')];
    if (sections.length < 2) return { count: sections.length };
    const first = sections[0];
    const second = sections[1];
    const cs = (el) => getComputedStyle(el);
    // A live within-block hairline, not a restated constant: the outline rail's
    // entries carry T.hairline as an inset box-shadow. Reading the real node is
    // what makes "the rule is a DIFFERENT TIER from the hairline" a claim about
    // the page rather than about two strings in this file.
    // Picked by the property under test rather than by position, so a markup
    // reshuffle inside the rail cannot silently point this at the wrong node.
    const li = [...document.querySelectorAll('nav li')].find(
      (n) => cs(n).boxShadow && cs(n).boxShadow !== 'none',
    );
    const shadow = li ? cs(li).boxShadow : null;
    const hairline = shadow ? (shadow.match(/rgba?\([^)]*\)/) ?? [null])[0] : null;
    // The fourth T.rule call site: the outline rail's outer edge. Free to read
    // here since the rail is already in hand.
    const railEl = li?.closest('nav')?.querySelector('[style*="border-right"]') ?? li?.closest('nav');
    const eyebrow = second.querySelector('div');
    const frame = document.querySelector('.um-topic fieldset');
    return {
      count: sections.length,
      ruleColor: cs(second).borderTopColor,
      ruleWidth: cs(second).borderTopWidth,
      ruleStyle: cs(second).borderTopStyle,
      firstRuleStyle: cs(first).borderTopStyle,
      hairline,
      // The four properties the no-card decision forbids. Read off BOTH the
      // first and second section, because a fill applied only to the divided
      // ones would be exactly the tempting wrong fix here.
      bgFirst: cs(first).backgroundColor,
      bgSecond: cs(second).backgroundColor,
      radius: cs(second).borderRadius,
      shadow: cs(second).boxShadow,
      padTop: cs(second).paddingTop,
      padTopFirst: cs(first).paddingTop,
      eyebrowWeight: eyebrow ? cs(eyebrow).fontWeight : null,
      eyebrowColor: eyebrow ? cs(eyebrow).color : null,
      eyebrowText: eyebrow ? eyebrow.textContent.trim() : null,
      // The third T.rule call site. Its sibling, the top bar, is asserted in
      // scripts/verify_ui_lane.mjs -- TopicChrome needs auth data this harness
      // cannot supply, and needs no lesson data, so it belongs in that lane.
      frameBorder: frame ? cs(frame).borderTopColor : null,
      railEdge: railEl ? cs(railEl).borderRightColor : null,
      railEdgeStyle: railEl ? cs(railEl).borderRightStyle : null,
    };
  });

  console.log(`     sections ${sec.count}   rule ${sec.ruleColor}   hairline ${sec.hairline}`);
  console.log(`     section bg ${sec.bgSecond}   pad-top ${sec.padTop}   eyebrow ${sec.eyebrowWeight} ${sec.eyebrowColor}`);

  // NOT FABRICATED, the same discipline as the KaTeX checks above: if the
  // markdown did not split into multiple sections there is no between-section
  // rule on the page, and every assertion below would be measuring nothing.
  await check(`NOT FABRICATED: the fixture split into 2+ real sections (got ${sec.count})`, () => sec.count >= 2);
  await check(
    `the eyebrow under test is the section eyebrow (got "${sec.eyebrowText}")`,
    () => /^Section \d+ of \d+$/.test(sec.eyebrowText ?? ''),
  );

  // 1. THE RULE IS THE APPROVED VALUE.
  await check(
    `${theme}: between-section rule is ${RULE_EXPECTED[theme]} (got ${sec.ruleColor})`,
    () => sec.ruleColor === RULE_EXPECTED[theme],
  );
  await check(`${theme}: the rule is a real 1px line (got ${sec.ruleWidth} ${sec.ruleStyle})`, () => sec.ruleWidth === '1px' && sec.ruleStyle === 'solid');
  await check(`${theme}: the FIRST section has no rule above it (got ${sec.firstRuleStyle})`, () => sec.firstRuleStyle === 'none');

  // 2. IN DARK IT IS A DIFFERENT TIER FROM THE HAIRLINE.
  //
  // Stated as not-equal AND as an exact value, because neither is sufficient
  // alone: the exact value would still pass if the hairline had drifted up to
  // meet it, and not-equal would pass on any wrong colour that merely differs.
  // Before this change these two were byte-identical and dark had no structure.
  if (theme === 'dark') {
    await check(
      `dark: the within-block hairline is still ${HAIRLINE_DARK} (got ${sec.hairline})`,
      () => sec.hairline === HAIRLINE_DARK,
    );
    await check(
      `dark: the between-section rule is DISTINCT from that hairline (${sec.ruleColor} vs ${sec.hairline})`,
      () => sec.hairline !== null && sec.ruleColor !== sec.hairline,
    );
  }

  // 3. IN LIGHT IT IS VISIBLE AGAINST THE GROUND.
  //
  // Composited by hand, because border-color does not flatten: the ratio a
  // reader actually gets is the composite of the rule's alpha over the ground,
  // and asserting the string alone would not notice a rule that resolved
  // correctly onto a ground that had moved out from under it.
  if (theme === 'light') {
    const vis = await p.evaluate(
      ({ rule, ground }) => {
        const nums = (c) => c.match(/[\d.]+/g).map(Number);
        const [r, g, b, a = 1] = nums(rule);
        const bg = nums(ground);
        const comp = [r, g, b].map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
        const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
        const L = (v) => 0.2126 * lin(v[0]) + 0.7152 * lin(v[1]) + 0.0722 * lin(v[2]);
        const [hi, lo] = [L(comp), L(bg)].sort((x, y) => y - x);
        return { comp: `rgb(${comp.join(', ')})`, ratio: Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100 };
      },
      { rule: sec.ruleColor, ground: GROUND_LIGHT },
    );
    console.log(`     light rule composites to ${vis.comp} on ${GROUND_LIGHT}, ratio ${vis.ratio}`);
    await check(
      `light: the rule is visible against ${GROUND_LIGHT} (composites ${vis.comp}, ratio ${vis.ratio})`,
      () => vis.ratio >= 1.9,
    );
    // 5. THE OTHER MOVED CALL SITES REACHABLE FROM THIS LANE.
    //
    // The rule token moved at four places at once and that was the point of the
    // decision, so a revert that restores the gold at only some of them has to
    // redden here. Two of the four are measurable in this lane; the top bar is
    // asserted in scripts/verify_ui_lane.mjs, which mounts TopicChrome.
    await check(
      `light: the practice problem frame moved to the neutral too (got ${sec.frameBorder})`,
      () => sec.frameBorder === RULE_LIGHT,
    );
    await check(
      `light: the outline rail's outer edge moved to the neutral too (got ${sec.railEdge}, ${sec.railEdgeStyle})`,
      () => sec.railEdgeStyle === 'solid' && sec.railEdge === RULE_LIGHT,
    );
  }

  // 4. FLAT. THE NO-CARD DECISION HELD.
  //
  // The single most likely wrong way to satisfy "make sections visible" is to
  // put them back in boxes, which is what curriculum-theme.ts RADIUS = 0 rules
  // out. transparent is the pass: the section inherits the page ground and
  // paints nothing of its own.
  const FLAT = 'rgba(0, 0, 0, 0)';
  await check(`${theme}: section 1 has NO background fill (got ${sec.bgFirst})`, () => sec.bgFirst === FLAT);
  await check(`${theme}: section 2 has NO background fill (got ${sec.bgSecond})`, () => sec.bgSecond === FLAT);
  await check(`${theme}: section has no radius (got ${sec.radius})`, () => sec.radius === '0px');
  await check(`${theme}: section has no shadow (got ${sec.shadow})`, () => sec.shadow === 'none');

  // 6. THE START READS AS A START.
  await check(`${theme}: eyebrow weight is ${EYEBROW_WEIGHT} (got ${sec.eyebrowWeight})`, () => sec.eyebrowWeight === EYEBROW_WEIGHT);
  await check(
    `${theme}: eyebrow colour is ink2 ${EYEBROW_COLOR[theme]} (got ${sec.eyebrowColor})`,
    () => sec.eyebrowColor === EYEBROW_COLOR[theme],
  );
  await check(`${theme}: divided sections open with 38px above the eyebrow (got ${sec.padTop})`, () => sec.padTop === '38px');
  await check(`${theme}: the first section still opens flush (got ${sec.padTopFirst})`, () => sec.padTopFirst === '0px');

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
