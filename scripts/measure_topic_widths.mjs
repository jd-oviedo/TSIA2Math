// measure_topic_widths.mjs -- READ-ONLY. Walks the live topic routes in a
// headless browser at a phone-width viewport and reports which ones scroll
// sideways, and what is doing it.
//
// scripts/render_check_curriculum.mjs checks that the markdown turns into the
// right HTML. This checks that the HTML fits on a phone, which is a different
// question and one only a real layout engine can answer: the offenders here are
// KaTeX spans and tables whose width comes from font metrics and cell content,
// not from anything visible in the source.
//
// Pass/fail is the page, not the element. A wide formula inside its own scroll
// container is fine; the defect is the whole page rocking sideways, which is
// documentElement.scrollWidth exceeding the viewport.
//
//   npx next build && npx next start &
//   node scripts/measure_topic_widths.mjs
//   node scripts/measure_topic_widths.mjs --units=3 --width=390
//   node scripts/measure_topic_widths.mjs --json=before.json
//
// Reads the topic list from curriculum_topics_public with the anon key, so it
// surveys exactly the rows a student would get. Must run from the repo root.

import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';

const arg = (name, fallback) => {
  const hit = process.argv.slice(2).find(a => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const BASE = arg('base', 'http://localhost:3000');
const WIDTH = Number(arg('width', 390));
const HEIGHT = Number(arg('height', 844));
const UNITS = arg('units', '0,1,2,3').split(',').map(Number);
const COURSE = arg('course', 'tsia2-math');
const JSON_OUT = arg('json', '');
const ROUTES = arg('routes', 'lesson,practice,quiz').split(',');
const CONCURRENCY = Number(arg('concurrency', 4));

// .env.local rather than a shell export, so this runs the same way the app does.
function loadEnv() {
  const env = {};
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

async function loadTopics() {
  const env = loadEnv();
  const url =
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/curriculum_topics_public` +
    `?select=topic_id,unit_number,sequence_in_unit&course_id=eq.${COURSE}` +
    `&order=unit_number,sequence_in_unit`;
  const res = await fetch(url, { headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY } });
  if (!res.ok) throw new Error(`topic list ${res.status}: ${await res.text()}`);
  return (await res.json()).filter(t => UNITS.includes(t.unit_number));
}

// Runs in the page. Returns the page's own overflow plus every candidate that
// is wider than the viewport, whether or not it is the one pushing the page --
// an element clamped inside a scroll container still reports a big scrollWidth,
// and telling those two apart is the whole point of the fix being verified.
const MEASURE = viewportWidth => {
  const doc = document.documentElement;
  const sel = '.um-topic .katex, .um-topic table, .um-topic pre, .um-topic img, .um-topic svg';
  const wide = [];

  for (const el of document.querySelectorAll(sel)) {
    const rect = el.getBoundingClientRect();
    const contentW = Math.max(el.scrollWidth, Math.ceil(rect.width));
    // The nearest ancestor that actually has a width. An inline parent such as
    // the <strong> around a bolded formula reports clientWidth 0, which would
    // otherwise make every piece of inline math look like an overflow.
    let box = el.parentElement;
    while (box && box.clientWidth === 0 && box !== document.body) box = box.parentElement;
    const availW = box ? box.clientWidth : viewportWidth;
    // Against the container, not the viewport. The cards carry ~34px of padding
    // a side at this width, so a table can be narrower than the phone and still
    // push the page -- which is exactly what GR.4.4 does.
    //
    // 2px of slack: scrollWidth is an integer and getBoundingClientRect is not,
    // so an SVG that exactly fills its box reports one pixel of phantom overflow.
    if (contentW <= availW + 2 && rect.right <= viewportWidth) continue;
    const cs = getComputedStyle(el);
    wide.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute('class') || '').split(/\s+/).slice(0, 2).join(' '),
      // What the element occupies in layout. This is what can push the page.
      rectW: Math.round(rect.width),
      // What the element's content wants. Stays large after a scroll container
      // is applied, which is why it alone cannot be the pass/fail signal.
      contentW: Math.round(contentW),
      // The room the element actually had. contentW - availW is the real overage.
      availW: Math.round(availW),
      right: Math.round(rect.right),
      overflowX: cs.overflowX,
      display: cs.display,
      // Is the overflow absorbed by this element rather than passed upward?
      scrolls: el.scrollWidth > el.clientWidth + 1 && /auto|scroll/.test(cs.overflowX),
      // Structural facts a selector has to be checked against, not assumed.
      parentTag: el.parentElement ? el.parentElement.tagName.toLowerCase() : null,
      onlyChild: el.parentElement ? el.parentElement.children.length === 1 : false,
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 70),
    });
  }

  wide.sort((a, b) => b.contentW - a.contentW);

  // Does the selector the fix relies on actually match anything here? The
  // previous attempt at this bug proposed `.katex-display`, which matches zero
  // elements on every page in this app, and that was only caught by counting.
  // So every selector in play is counted rather than assumed.
  const audit = {};
  for (const [name, s] of Object.entries({
    'katex': '.um-topic .um-prose .katex',
    'katex-display': '.um-topic .katex-display',
    'p>katex:only-child': '.um-topic .um-prose p > .katex:only-child',
    'table': '.um-topic .um-prose table',
  })) {
    audit[name] = document.querySelectorAll(s).length;
  }

  return {
    scrollW: doc.scrollWidth,
    clientW: doc.clientWidth,
    audit,
    imgCount: document.querySelectorAll('.um-topic img, .um-topic svg').length,
    wide,
  };
};

async function measurePage(page, topic, route) {
  const url = `${BASE}/course/tsia2/math/unit/${topic.unit_number}/topic/${topic.topic_id}/${route}`;
  const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  // KaTeX ships its own webfonts and every width here is a font metric, so
  // measuring before they land reports the fallback font's layout, not the
  // student's.
  await page.evaluate(() => document.fonts.ready);
  const data = await page.evaluate(MEASURE, WIDTH);
  return { topic: topic.topic_id, unit: topic.unit_number, route, status: res?.status() ?? 0, url, ...data };
}

async function main() {
  const topics = await loadTopics();
  const jobs = [];
  for (const t of topics) for (const r of ROUTES) jobs.push({ topic: t, route: r });
  console.log(`measuring ${jobs.length} routes (${topics.length} topics x ${ROUTES.length}) at ${WIDTH}px\n`);

  const browser = await chromium.launch();
  const results = [];
  let next = 0;

  const worker = async () => {
    const ctx = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
    const page = await ctx.newPage();
    while (next < jobs.length) {
      const job = jobs[next++];
      try {
        results.push(await measurePage(page, job.topic, job.route));
      } catch (err) {
        results.push({ topic: job.topic.topic_id, unit: job.topic.unit_number, route: job.route, error: String(err.message).split('\n')[0] });
      }
    }
    await ctx.close();
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  await browser.close();

  results.sort((a, b) => a.unit - b.unit || a.topic.localeCompare(b.topic) || ROUTES.indexOf(a.route) - ROUTES.indexOf(b.route));

  const errors = results.filter(r => r.error);
  const bad = results.filter(r => !r.error && r.scrollW > WIDTH);

  console.log(`viewport ${WIDTH}px -- routes that scroll sideways: ${bad.length} of ${results.length - errors.length}\n`);
  if (bad.length) {
    console.log('topic     unit route     scrollW  over   widest offender');
    for (const r of bad) {
      const w = r.wide[0];
      const off = w
        ? `${w.cls || w.tag} ${w.contentW}px in ${w.availW}px  "${w.text.slice(0, 34)}"`
        : '(no candidate over its container)';
      console.log(
        `${r.topic.padEnd(9)} ${String(r.unit).padEnd(4)} ${r.route.padEnd(9)} ${String(r.scrollW).padEnd(8)} ${('+' + (r.scrollW - WIDTH)).padEnd(6)} ${off}`,
      );
    }
    console.log();
    const topicsBad = [...new Set(bad.map(r => r.topic))];
    console.log(`affected topics (${topicsBad.length}/${new Set(results.map(r => r.topic)).size}): ${topicsBad.join(', ')}`);
  }

  // Wide content that is absorbed by a scroll container is not a defect, but it
  // is the thing the fix is supposed to produce, so it is reported rather than
  // hidden -- a count that drops to zero means the rule stopped matching.
  const absorbed = results.filter(r => !r.error && r.scrollW <= WIDTH && r.wide.some(w => w.scrolls));
  console.log(`\nroutes with wide content safely absorbed by a scroll container: ${absorbed.length}`);
  for (const r of absorbed) {
    for (const w of r.wide.filter(x => x.scrolls)) {
      console.log(`  ${r.topic} ${r.route}: ${w.cls || w.tag} content ${w.contentW}px in ${w.rectW}px box`);
    }
  }

  // Totals for every selector, so a rule that quietly stops matching shows up
  // as a number going to zero rather than as a page that silently regresses.
  const totals = {};
  for (const r of results) for (const [k, v] of Object.entries(r.audit || {})) totals[k] = (totals[k] || 0) + v;
  console.log('\nselector match counts across all routes:');
  for (const [k, v] of Object.entries(totals)) console.log(`  ${k.padEnd(22)} ${v}`);

  if (errors.length) {
    console.log(`\nerrors: ${errors.length}`);
    for (const e of errors) console.log(`  ${e.topic} ${e.route}: ${e.error}`);
  }

  if (JSON_OUT) {
    writeFileSync(JSON_OUT, JSON.stringify({ width: WIDTH, base: BASE, units: UNITS, results }, null, 2));
    console.log(`\nwrote ${JSON_OUT}`);
  }

  process.exit(errors.length ? 2 : 0);
}

main();
