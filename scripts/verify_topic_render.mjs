// Browser checks for a rendered curriculum topic.
//
// Usage:  node scripts/verify_topic_render.mjs [TOPIC_ID...] [--base URL] [--figure]
//
// Run against `next build && next start`, never `next dev`: this box has 7.8GB
// and 2 CPUs, and next dev dies under Playwright load in a way that surfaces as
// false 404s rather than as a crash.
//
// Point --base at a server started with CURRICULUM_FIXTURE_SOURCE=1 to check a
// topic before it is uploaded. That front-loads the rendering check; it does not
// replace the post-upload run against real production rows.

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = baseIdx === -1 ? 'http://localhost:3000' : args[baseIdx + 1];
const wantFigure = args.includes('--figure');
const topics = args.filter((a, i) => !a.startsWith('--') && i !== baseIdx + 1 && i !== args.indexOf('--unit') + 1);
if (topics.length === 0) topics.push('AR.3.5');

const unitIdx = args.indexOf('--unit');
const UNIT = unitIdx === -1 ? '4' : args[unitIdx + 1];
const UNIT_PATH = `${BASE}/course/tsia2/math/unit/${UNIT}/topic`;
const PLACEHOLDER = 'This topic is still being written';

// The standing rule, in code rather than in a review comment.
//
// Figures are inlined as base64 SVG data URIs, so the src prefix is what
// identifies one. An earlier version of this check used img.first(), which
// resolves to the UnpackMath wordmark in the page header: it reported
// naturalWidth=2000 and a non-empty alt, passed every assertion, and proved
// nothing at all about the figure. A check that cannot fail against the wrong
// object is not a check.
const FIGURE = 'img[src^="data:image/svg+xml"]';

const results = [];
const record = (topic, name, ok, msg) => results.push({ topic, name, ok, msg });

const browser = await chromium.launch();

for (const topic of topics) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  for (const route of ['lesson', 'practice', 'quiz']) {
    const resp = await page.goto(`${UNIT_PATH}/${topic}/${route}`, { waitUntil: 'networkidle' });
    const status = resp.status();
    const body = (await page.locator('body').innerText()).trim();
    const katex = await page.locator('.katex').count();
    const rawTex = /\\frac|\\sqrt|\\geq|\$\$/.test(body);

    let ok = true, msg = `${body.length} chars, ${katex} katex nodes`;
    if (status !== 200) { ok = false; msg = `HTTP ${status}`; }
    else if (body.includes(PLACEHOLDER)) { ok = false; msg = 'renders PLACEHOLDER'; }
    else if (body.length < 400) { ok = false; msg = `body only ${body.length} chars`; }
    else if (rawTex) { ok = false; msg = 'raw LaTeX visible as text'; }
    else if (katex === 0) { ok = false; msg = 'no rendered KaTeX'; }
    record(topic, route, ok, msg);
  }

  if (wantFigure) {
    await page.goto(`${UNIT_PATH}/${topic}/lesson`, { waitUntil: 'networkidle' });
    const count = await page.locator(FIGURE).count();
    if (count === 0) {
      record(topic, 'figure', false, `no element matching ${FIGURE}`);
    } else {
      const d = await page.locator(FIGURE).first().evaluate((el) => ({
        nw: el.naturalWidth, nh: el.naturalHeight, alt: (el.alt || '').trim(),
      }));
      record(topic, 'figure', d.nw > 0 && d.alt.length > 0,
        `naturalWidth=${d.nw} naturalHeight=${d.nh} altLen=${d.alt.length}`);
    }

    // 390px: a figure and display math in the same notes is the combination
    // PR #80 was written for, and page-level horizontal scroll is the symptom.
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto(`${UNIT_PATH}/${topic}/lesson`, { waitUntil: 'networkidle' });
    const o = await mobile.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    record(topic, '390px', o.scroll <= o.client + 1,
      `scrollWidth=${o.scroll} clientWidth=${o.client}`);

    const m = await mobile.locator(FIGURE).first()
      .evaluate((el) => ({ nw: el.naturalWidth, alt: (el.alt || '').trim().length,
        w: el.getBoundingClientRect().width })).catch(() => null);
    record(topic, '390px-figure', Boolean(m) && m.nw > 0 && m.alt > 0 && m.w <= 390,
      m ? `naturalWidth=${m.nw} altLen=${m.alt} renderedWidth=${Math.round(m.w)}px` : 'figure missing');
    await mobile.close();
  }

  await page.close();
}

await browser.close();

console.log('='.repeat(78));
console.log(`base: ${BASE}`);
console.log('='.repeat(78));
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.topic.padEnd(8)} ${r.name.padEnd(14)} ${r.msg}`);
}
const failed = results.filter((r) => !r.ok);
console.log('='.repeat(78));
console.log(`${results.length} checks, ${results.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
