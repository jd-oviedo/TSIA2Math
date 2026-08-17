// check_item_renders.mjs -- gate every practice and quiz item on what the page
// ACTUALLY RENDERS, not on what the source markdown says.
//
//   node scripts/check_item_renders.mjs --base URL              # whole course
//   node scripts/check_item_renders.mjs PR.3.4 --base URL       # named topics
//   node scripts/check_item_renders.mjs --base URL --prove      # fault proofs
//
// WHY THIS READS THE DOM AND NEVER RE-PARSES
// ------------------------------------------
// Every other quality check in this repo reads source markdown. That was
// invisible until an item's meaning depended on layout the renderer discards,
// and then it cost two shipped defects in one topic:
//
//   1. tables in a section preamble  -> dropped entirely, 13 of 14 items
//                                       unanswerable, every source gate green
//   2. tables moved inside the item  -> rendered as literal pipe soup, because
//                                       upload_curriculum.py:209 collapses a stem
//                                       onto one line and a table needs its lines
//
// A re-parse that "agrees with PracticeQuiz" would be a second implementation of
// the renderer, free to drift from it exactly as gridPlane drifted from buildSvg
// (issue #108). So this reads `.um-stem` out of the live DOM, which is the
// renderer's own unit of meaning, and asks two questions of it.
//
// RULE A, FORM. No literal `|` may survive into a rendered stem or choice. A pipe
// that reaches the reader means a markdown table was flattened into text.
//
// RULE B, CONTEXT. A stem that points at something ("this table", "the graph
// shown", "Set A") must carry that something inside its own block.
//
// RULE C, DROPPED CONTENT, and this is the one that matters. Rules A and B were
// built first and MEASURED AGAINST THE ORIGINAL DEFECT: rule A caught the pipe
// soup, and rule B caught nothing, because those stems pointed at nothing. They
// read "What is the probability that a student passed, given that they studied?"
// and simply omitted the table. No phrase rule can see an omission.
//
// So rule C does not read the stem at all. It takes every substantive block the
// SOURCE puts in a practice or quiz section OUTSIDE an item -- a table, a figure,
// a paragraph carrying data -- and requires its text to appear in some RENDERED
// stem. If it appears nowhere, the renderer dropped it and no student can see it.
// The source is used only to locate the candidate; whether it survives is decided
// by the DOM.
import { chromium } from 'playwright';
import { readFileSync, readdirSync, writeFileSync } from 'fs';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = baseIdx === -1 ? 'http://localhost:3000' : args[baseIdx + 1];
const PROVE = args.includes('--prove');
const named = args.filter((a, i) => !a.startsWith('--') && i !== baseIdx + 1);

const SRC = 'curriculum/source/tsia2-math';
function allTopics() {
  const out = [];
  for (const unit of readdirSync(SRC)) {
    for (const f of readdirSync(`${SRC}/${unit}`)) {
      if (!f.endsWith('.md')) continue;
      const raw = readFileSync(`${SRC}/${unit}/${f}`, 'utf8');
      const u = raw.match(/^unit_number:\s*(\d+)/m);
      out.push({ id: f.slice(0, -3), unit: u ? u[1] : unit.replace('unit-', ''), path: `${SRC}/${unit}/${f}` });
    }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

// A stem that points somewhere. Deliberately narrow: only phrases that cannot be
// answered from the words alone.
const POINTS_AT_FIGURE = /\b(this|the|following)\s+(graph|plot|figure|diagram|chart|pictograph)\b|\bshown\b|\bpictured\b/i;
const POINTS_AT_TABLE = /\b(this|the|following)\s+table\b/i;
const POINTS_BACK = /\b(above|earlier|previous|first plot|first graph|first table)\b/i;
const NAMES_A_SET = /\bSet\s+[A-Z]\b/;

function judge(stem) {
  const { text, imgs, tables, digits } = stem;
  const problems = [];
  const pipes = (text.match(/\|/g) || []).length;
  if (pipes) problems.push(`RULE A: ${pipes} literal pipe(s) in the rendered stem`);
  if (POINTS_AT_FIGURE.test(text) && imgs === 0)
    problems.push('RULE B: points at a figure, block carries no inlined figure');
  if (POINTS_AT_TABLE.test(text) && tables === 0 && digits < 3)
    problems.push('RULE B: points at a table, block carries neither a table nor its numbers');
  if (POINTS_BACK.test(text) && imgs === 0 && tables === 0 && digits < 3)
    problems.push('RULE B: refers backwards, block carries nothing to refer to');
  if (NAMES_A_SET.test(text) && digits < 3)
    problems.push('RULE B: names a Set, block carries none of its values');
  return problems;
}

// Substantive content a practice or quiz section puts outside any item block.
// Level banners, the standing instruction line and section rules are expected to
// be dropped and are not content, so they are excluded by name.
const BENIGN = /^(\s*|---+|\*\*(Basic|Proficient|Advanced) Level\*\*.*|Solve each problem\..*|All four items use.*|#+ .*)$/;
function droppedCandidates(path) {
  const raw = readFileSync(path, 'utf8');
  const out = [];
  for (const [name, head, tail, itemRe] of [
    ['practice', '#### **Part 2: Practice Problems**', '#### **Part 3: Mini Quiz**', /^\s*\d+\.\s/],
    ['quiz', '#### **Part 3: Mini Quiz**', '#### **Part 4: Answer Key**', /^\*\*Item \d+\*\*/],
  ]) {
    const i = raw.indexOf(head); if (i === -1) continue;
    const j = raw.indexOf(tail, i + head.length);
    const sec = raw.slice(i + head.length, j === -1 ? undefined : j);
    // Everything before the first item marker is preamble; the renderer never
    // shows it. Content between items is equally unreachable.
    const lines = sec.split('\n');
    let inItem = false, buf = [];
    const flush = () => {
      const text = buf.join('\n').trim();
      buf = [];
      if (!text) return;
      const meaningful = text.split('\n').filter((l) => !BENIGN.test(l));
      if (!meaningful.length) return;
      const isTable = meaningful.some((l) => l.trim().startsWith('|'));
      const isFigure = meaningful.some((l) => l.includes('<!-- figure:') || l.includes('data:image/svg+xml'));
      const numbers = (meaningful.join(' ').match(/\d+/g) || []).length;
      if (isTable || isFigure || numbers >= 3)
        out.push({ section: name, kind: isTable ? 'table' : isFigure ? 'figure' : 'data',
                   probe: meaningful.find((l) => !l.trim().startsWith('|') && !l.includes('<!--')) || meaningful[0] });
    };
    for (const line of lines) {
      if (itemRe.test(line)) { flush(); inItem = true; continue; }
      if (inItem) { if (/^\s*[-*]\s*[A-D]\)/.test(line)) continue; }
      if (!inItem) buf.push(line); else if (/^\s*$/.test(line)) continue;
    }
    flush();
  }
  return out;
}

async function scan(page, topic) {
  const out = [];
  for (const route of ['practice', 'quiz']) {
    const url = `${BASE}/course/tsia2/math/unit/${topic.unit}/topic/${topic.id}/${route}`;
    const resp = await page.goto(url, { waitUntil: 'networkidle' });
    if (!resp || resp.status() >= 400) continue;
    const stems = await page.evaluate(() => [...document.querySelectorAll('.um-stem')].map((s, i) => ({
      i: i + 1,
      text: s.innerText,
      imgs: s.querySelectorAll('img[src^="data:image/svg+xml"]').length,
      tables: s.querySelectorAll('table').length,
      digits: (s.innerText.match(/\d+/g) || []).length,
      choicePipes: 0,
    })));
    // Choices live outside .um-stem; a pipe there is the same defect.
    const cp = await page.evaluate(() =>
      [...document.querySelectorAll('.um-choice')].reduce((n, c) => n + (c.innerText.match(/\|/g) || []).length, 0));
    for (const s of stems) out.push({ route, ...s, problems: judge(s) });
    // RULE C: content the source parks outside an item must show up in some stem.
    for (const c of droppedCandidates(topic.path).filter((c) => c.section === route)) {
      const probe = c.probe.replace(/[*_`$\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
      if (!probe) continue;
      const seen = stems.some((s) => s.text.replace(/\s+/g, ' ').includes(probe));
      if (!seen)
        out.push({ route, i: 0, text: '', problems:
          [`RULE C: a ${c.kind} sits outside every item and reaches no rendered stem ("${probe}")`] });
    }
    if (cp) out.push({ route, i: 0, problems: [`RULE A: ${cp} literal pipe(s) across the rendered choices`] });
  }
  return out;
}

const browser = await chromium.launch();
const page = await browser.newPage();

if (PROVE) {
  // Fault proofs. The injection goes into the SOURCE and the page is re-requested,
  // so the whole path is exercised: uploader parse, render, DOM. The fixture reads
  // source per request, which is what makes that possible.
  //
  // EVERY INJECTION ASSERTS IT LANDED IN A RENDERED STEM before its result is
  // trusted. The first version of these proofs did not, targeted `^1. ` and hit a
  // numbered list in the guided notes instead of practice item 1, and reported
  // three clean passes for three faults that were never in the scanned region.
  const target = allTopics().find((t) => t.id === 'PR.2.3');   // clean: no figures, no tables
  const original = readFileSync(target.path, 'utf8');
  const MARK = 'Part 2: Practice';
  let ok = true;

  const inPractice = (src, fn) => {
    const i = src.indexOf(MARK);
    return src.slice(0, i) + fn(src.slice(i));
  };

  const run = async (label, mutate, expect, landing) => {
    const before = readFileSync(target.path, 'utf8');
    const after = inPractice(before, mutate);
    if (after === before) {
      console.log(`  [PROOF FAILED] ${label}: injection was a no-op`); ok = false; return;
    }
    writeFileSync(target.path, after);
    const rows = await scan(page, target);
    writeFileSync(target.path, original);
    // Did the fault reach a rendered stem at all?
    const landed = rows.some((r) => r.text && landing.test(r.text));
    if (!landed) {
      console.log(`  [PROOF FAILED] ${label}: injection never reached a rendered stem`);
      ok = false; return;
    }
    const found = rows.flatMap((r) => r.problems);
    const hit = found.some((x) => x.includes(expect));
    ok &&= hit;
    console.log(`  [${hit ? 'PASS' : 'PROOF FAILED'}] ${label}`);
    console.log(`        landed in a rendered stem: yes; reported: ${found.length ? found.join('; ') : 'NOTHING'}`);
  };

  console.log(`FAULT PROOFS (injected into ${target.id}'s practice section, page re-requested)\n`);
  const clean = (await scan(page, target)).flatMap((r) => r.problems);
  ok &&= clean.length === 0;
  console.log(`  [${clean.length === 0 ? 'PASS' : 'CONTROL FAILED'}] control before: ${clean.length} problem(s)`);

  await run('RULE A: a markdown table flattened into a stem',
    (sec) => sec.replace(/\n1\. /, '\n1. | | X | Y |\n|---|---|---|\n| row | 1 | 2 |\n\nZZTABLE '),
    'RULE A', /ZZTABLE/);
  await run('RULE B: a stem pointing at a figure that is not there',
    (sec) => sec.replace(/\n1\. /, '\n1. ZZFIG What does the graph shown indicate? '),
    'RULE B', /ZZFIG/);
  await run('RULE B: a stem naming a Set whose values are absent',
    (sec) => sec.replace(/\n1\. [^\n]*/, '\n1. ZZSET What is the range of Set A?'),
    'RULE B', /ZZSET/);

  const after = (await scan(page, target)).flatMap((r) => r.problems);
  ok &&= after.length === 0;
  console.log(`  [${after.length === 0 ? 'PASS' : 'CONTROL FAILED'}] control after: ${after.length} problem(s)`);
  await browser.close();
  console.log(`\nRESULT: ${ok ? 'both rules can fail, and do' : 'A PROOF OR CONTROL FAILED'}`);
  process.exit(ok ? 0 : 1);
}

const topics = named.length ? allTopics().filter((t) => named.includes(t.id)) : allTopics();
let items = 0, bad = 0;
const hits = [];
for (const t of topics) {
  const rows = await scan(page, t);
  items += rows.length;
  for (const r of rows) {
    if (!r.problems.length) continue;
    bad++;
    hits.push(`${t.id} ${r.route} item ${r.i}: ${r.problems.join('; ')}`);
  }
}
await browser.close();
for (const h of hits) console.log(`  FAIL  ${h}`);
console.log(`\n${topics.length} topic(s), ${items} rendered item(s), ${bad} failing`);
process.exit(bad ? 1 : 0);
